"""Rebuild the bounded Chicago pilot from its checked-in OSM snapshot, without network."""

import argparse
import hashlib
import json
from collections import Counter
from pathlib import Path
from typing import Any
from uuid import NAMESPACE_URL, uuid5

from shapely.geometry import LineString, MultiPolygon, Polygon, box, mapping
from shapely.errors import GEOSException
from shapely.geometry.base import BaseGeometry
from shapely.geometry.polygon import orient
from shapely.ops import polygonize, unary_union

ROOT = Path(__file__).resolve().parents[2]
DATA_DIR = ROOT / "apps/web/public/data/chicago-loop"
BBOX = [-87.634, 41.882, -87.624, 41.890]
IDENTITY_NAMESPACE = uuid5(NAMESPACE_URL, "https://github.com/virajparmaj/arch-it/buildings")


def building_id(object_type: str, object_id: int) -> str:
    """An existing OSM object keeps its ID regardless of name, geometry, or import order."""
    return str(uuid5(IDENTITY_NAMESPACE, f"osm:{object_type}/{object_id}"))


def coordinates(nodes: list[dict[str, Any]]) -> list[tuple[float, float]]:
    return [(node["lon"], node["lat"]) for node in nodes]


def relation_geometry(element: dict[str, Any]) -> BaseGeometry:
    rings: dict[str, list[LineString]] = {"outer": [], "inner": []}
    for member in element.get("members", []):
        role = member.get("role") or "outer"
        if member.get("type") != "way" or role not in rings:
            raise ValueError("unsupported relation member")
        points = coordinates(member.get("geometry", []))
        if len(points) < 2:
            raise ValueError("incomplete relation geometry")
        rings[role].append(LineString(points))
    areas: dict[str, BaseGeometry] = {}
    outer_polygons: list[Polygon] = []
    for role, lines in rings.items():
        polygons = list(polygonize(lines))
        if role == "outer":
            outer_polygons = polygons
        # Never silently discard an open/dangling member while constructing a footprint.
        if lines and not unary_union(lines).difference(unary_union([p.boundary for p in polygons])).is_empty:
            raise ValueError("unclosed relation ring")
        areas[role] = unary_union(polygons)
    if areas["outer"].is_empty:
        raise ValueError("missing outer ring")
    if not areas["outer"].covers(areas["inner"]) and not areas["inner"].is_empty:
        raise ValueError("inner ring outside outer ring")
    if any(areas["inner"].covers(Polygon(part.exterior)) for part in outer_polygons):
        raise ValueError("nested outer island unsupported")
    return areas["outer"].difference(areas["inner"])


def footprint(element: dict[str, Any]) -> Polygon | MultiPolygon:
    if element["type"] == "relation":
        shape = relation_geometry(element)
    else:
        points = coordinates(element.get("geometry", []))
        if len(points) < 4 or points[0] != points[-1]:
            raise ValueError("unclosed way")
        shape = Polygon(points)
    if not isinstance(shape, (Polygon, MultiPolygon)) or not shape.is_valid or shape.area == 0:
        raise ValueError("invalid polygon")
    # GeoJSON winding is normalized without repairing or simplifying source geometry.
    if isinstance(shape, Polygon):
        return orient(shape, sign=1.0)
    return MultiPolygon([orient(part, sign=1.0) for part in shape.geoms])


def normalize(element: dict[str, Any], shape: Polygon | MultiPolygon, source_id: str) -> dict:
    object_type, object_id = element["type"], element["id"]
    external_id = f"osm:{object_type}/{object_id}"
    raw_name = element.get("tags", {}).get("name")
    claims = []
    if raw_name is not None:
        claims.append({"property": "name", "value": raw_name, "source_id": source_id,
                       "source_record_id": external_id, "raw_property": "tags.name"})
    centroid = shape.centroid
    return {
        "type": "Feature",
        "id": building_id(object_type, object_id),
        "geometry": mapping(shape),
        "properties": {
            "building_id": building_id(object_type, object_id),
            "name": raw_name.strip() if raw_name and raw_name.strip() else None,
            "centroid": [round(centroid.x, 7), round(centroid.y, 7)],
            "source_id": source_id,
            "source_record_id": external_id,
            "source_url": f"https://www.openstreetmap.org/{object_type}/{object_id}",
            "geometry_source": {"source_id": source_id, "source_record_id": external_id},
            "claims": claims,
        },
    }


def build(raw: dict, acquisition: dict) -> dict:
    if raw.get("remark") or not isinstance(raw.get("elements"), list):
        raise ValueError("The cached response is incomplete or is not an Overpass response")
    source_id = f"osm-chicago-loop-{raw['osm3s']['timestamp_osm_base']}"
    coverage = box(*BBOX)
    features, exclusions, accepted_relations = [], [], set()
    seen: set[str] = set()
    # Valid relations take priority over member ways to avoid duplicated footprints.
    elements = sorted(raw["elements"], key=lambda item: (item["type"] != "relation", item["id"]))
    for element in elements:
        record_id = f"osm:{element['type']}/{element['id']}"
        if record_id in seen:
            raise ValueError(f"Duplicate source record: {record_id}")
        seen.add(record_id)
        try:
            if element["type"] == "way" and element["id"] in accepted_relations:
                raise ValueError("member of imported building relation")
            shape = footprint(element)
            if not coverage.covers(shape):
                raise ValueError("footprint crosses pilot boundary")
            features.append(normalize(element, shape, source_id))
            if element["type"] == "relation":
                accepted_relations.update(m["ref"] for m in element["members"]
                                          if m["type"] == "way" and m.get("role", "") in ("", "outer"))
        except (ValueError, KeyError, TypeError, GEOSException) as error:
            exclusions.append({"source_record_id": record_id, "reason": str(error)})
    features.sort(key=lambda feature: feature["id"])
    if not features:
        raise ValueError("No valid building footprints were imported")
    return {
        "type": "FeatureCollection", "features": features,
        "metadata": {
            "schema_version": 1, "dataset_id": "chicago-loop", "label": "Chicago Loop pilot",
            "bbox": BBOX, "selection_rule": "Complete valid footprints fully within the pilot boundary",
            "centroid_method": "Area-weighted planar centroid of EPSG:4326 geometry; approximate at city scale",
            "source": {
                "id": source_id, "name": "OpenStreetMap", "url": "https://www.openstreetmap.org/copyright",
                "license": "ODbL-1.0", "license_url": "https://opendatacommons.org/licenses/odbl/1-0/",
                "retrieved_at": acquisition["retrieved_at"],
                "snapshot_at": raw["osm3s"]["timestamp_osm_base"],
                "raw_sha256": acquisition["sha256"],
                "raw_url": "/data/chicago-loop/source.json",
                "acquisition_url": acquisition["endpoint"],
            },
            "counts": {"source_records": len(elements), "imported": len(features),
                       "named": sum(f["properties"]["name"] is not None for f in features),
                       "excluded": len(exclusions)},
            "exclusion_reasons": dict(sorted(Counter(e["reason"] for e in exclusions).items())),
            "excluded_records": exclusions,
        },
    }


def serialize(dataset: dict) -> str:
    return json.dumps(dataset, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n"


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="Verify the checked-in artifact without writing")
    args = parser.parse_args()
    raw_bytes = (DATA_DIR / "source.json").read_bytes()
    acquisition = json.loads((DATA_DIR / "acquisition.json").read_text())
    if hashlib.sha256(raw_bytes).hexdigest() != acquisition["sha256"]:
        raise ValueError("Raw snapshot checksum mismatch; regenerate acquisition metadata intentionally")
    result = build(json.loads(raw_bytes), acquisition)
    content = serialize(result)
    output = DATA_DIR / "buildings.geojson"
    if args.check:
        if output.read_text() != content:
            raise ValueError("Generated footprint artifact differs; run the documented rebuild")
    else:
        output.write_text(content)
    print(json.dumps(result["metadata"]["counts"]))
    print(json.dumps(result["metadata"]["exclusion_reasons"]))


if __name__ == "__main__":
    main()
