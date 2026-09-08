"""Geometry, identity, and reproducibility checks; no network access."""

import copy
import json
import unittest

from shapely.geometry import Point, shape

from import_buildings import DATA_DIR, build, building_id, footprint, serialize


def nodes(points):
    return [{"lon": lon, "lat": lat} for lon, lat in points]


def way(identifier, points, name=None):
    tags = {"building": "yes"}
    if name is not None:
        tags["name"] = name
    return {"type": "way", "id": identifier, "tags": tags, "geometry": nodes(points)}


def relation(outer, inner, extra_outer=None):
    members = [{"type": "way", "ref": 100, "role": "outer", "geometry": nodes(outer)},
               {"type": "way", "ref": 101, "role": "inner", "geometry": nodes(inner)}]
    if extra_outer:
        members.append({"type": "way", "ref": 102, "role": "outer", "geometry": nodes(extra_outer)})
    return {"type": "relation", "id": 500, "tags": {"building": "yes"}, "members": members}


class ImportTests(unittest.TestCase):
    def setUp(self):
        self.raw = json.loads((DATA_DIR / "source.json").read_text())
        self.acquisition = json.loads((DATA_DIR / "acquisition.json").read_text())

    def test_rebuild_is_exact_and_order_independent(self):
        rebuilt = serialize(build(self.raw, self.acquisition))
        self.assertEqual(rebuilt, (DATA_DIR / "buildings.geojson").read_text())
        self.raw["elements"].reverse()
        self.assertEqual(rebuilt, serialize(build(self.raw, self.acquisition)))

    def test_identity_uses_namespace_and_not_names_or_geometry(self):
        self.assertNotEqual(building_id("way", 123), building_id("relation", 123))
        original = build(self.raw, self.acquisition)
        changed = copy.deepcopy(self.raw)
        changed["elements"][0]["tags"]["name"] = "Changed source name"
        self.assertEqual([f["id"] for f in original["features"]],
                         [f["id"] for f in build(changed, self.acquisition)["features"]])

    def test_actual_snapshot_has_valid_geometries_and_honest_names(self):
        dataset = build(self.raw, self.acquisition)
        self.assertEqual(len(dataset["features"]), 345)
        for feature in dataset["features"]:
            geometry = shape(feature["geometry"])
            self.assertTrue(geometry.is_valid)
            # A representative interior point permits selection even for courtyard footprints.
            self.assertTrue(geometry.covers(geometry.representative_point()))
            props = feature["properties"]
            self.assertAlmostEqual(geometry.centroid.x, props["centroid"][0], places=6)
            self.assertAlmostEqual(geometry.centroid.y, props["centroid"][1], places=6)
            if props["name"] is None:
                self.assertFalse(any(c["property"] == "name" for c in props["claims"]))

    def test_holes_are_not_clickable_building_area(self):
        outer = [(0, 0), (10, 0), (10, 10), (0, 10), (0, 0)]
        inner = [(2, 2), (8, 2), (8, 8), (2, 8), (2, 2)]
        geometry = footprint(relation(outer, inner))
        self.assertEqual(geometry.area, 64)
        self.assertFalse(geometry.covers(Point(5, 5)))
        self.assertTrue(geometry.covers(Point(1, 1)))

    def test_nested_outer_island_is_explicitly_rejected_not_erased(self):
        outer = [(0, 0), (10, 0), (10, 10), (0, 10), (0, 0)]
        inner = [(2, 2), (8, 2), (8, 8), (2, 8), (2, 2)]
        island = [(4, 4), (6, 4), (6, 6), (4, 6), (4, 4)]
        with self.assertRaisesRegex(ValueError, "nested outer island"):
            footprint(relation(outer, inner, island))

    def test_inner_member_with_own_building_tag_is_not_suppressed(self):
        outer = [(-87.63, 41.884), (-87.628, 41.884), (-87.628, 41.886), (-87.63, 41.886), (-87.63, 41.884)]
        inner = [(-87.6295, 41.8845), (-87.6285, 41.8845), (-87.6285, 41.8855), (-87.6295, 41.8855), (-87.6295, 41.8845)]
        self.raw["elements"] = [relation(outer, inner), way(100, outer), way(101, inner)]
        dataset = build(self.raw, self.acquisition)
        ids = {f["properties"]["source_record_id"] for f in dataset["features"]}
        self.assertEqual(ids, {"osm:relation/500", "osm:way/101"})

    def test_invalid_and_partial_responses_cannot_silently_import(self):
        with self.assertRaisesRegex(ValueError, "unclosed way"):
            footprint(way(1, [(0, 0), (1, 0), (1, 1), (0, 1)]))
        self.raw["remark"] = "runtime timeout"
        with self.assertRaisesRegex(ValueError, "incomplete"):
            build(self.raw, self.acquisition)


if __name__ == "__main__":
    unittest.main()
