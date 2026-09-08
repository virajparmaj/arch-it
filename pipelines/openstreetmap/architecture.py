"""Conservative OSM claim parsing. Raw tag strings remain the authority.

Semantics and supported syntax: docs/PHASE_04.md. No network or identity resolution.
"""

import math
import re
from datetime import date
from decimal import Decimal
from urllib.parse import urlsplit

SUPPORTED_TAGS = (
    "name", "architect", "architect:wikidata", "start_date", "building:architecture",
    "building", "building:use", "height", "building:levels", "website", "contact:website",
    "engineer", "engineer:wikidata", "wikidata", "heritage", "addr:full",
    "addr:housenumber", "addr:street", "addr:unit", "addr:postcode", "addr:city", "addr:state", "addr:country",
)
NUMBER = r"[0-9]+(?:\.[0-9]+)?"


def safe_website(value: str) -> bool:
    """Accept explicit HTTP(S) URLs; never repair schemes or guess list boundaries."""
    if re.search(r"[\s\\;\x00-\x1f\x7f]", value) or re.search(r"%(?:0[0-9a-f]|1[0-9a-f]|7f)", value, re.I):
        return False
    try:
        url = urlsplit(value)
        host = url.hostname or ""
        return bool(re.match(r"^https?://", value, re.I) and url.netloc and host
                    and not url.username and not url.password and "@" not in url.netloc
                    and re.fullmatch(r"[A-Za-z0-9.-]+", host)
                    and all(re.fullmatch(r"[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?", part)
                            for part in host.split("."))
                    and (url.port is None or 0 < url.port <= 65535))
    except ValueError:
        return False


def parse_height(text: str) -> dict | None:
    metric = re.fullmatch(rf"({NUMBER})(?: m)?", text)
    imperial = re.fullmatch(rf"([0-9]+)'(?:({NUMBER})\")?", text)
    if metric:
        metres = Decimal(metric[1])
    elif imperial and (imperial[2] is None or Decimal(imperial[2]) < 12):
        metres = Decimal(imperial[1]) * Decimal("0.3048") + Decimal(imperial[2] or "0") * Decimal("0.0254")
    else:
        return None
    value = float(metres)
    return {"kind": "quantity", "value": value, "unit": "m"} if math.isfinite(value) and value > 0 else None


def parse_date(text: str) -> dict | None:
    """Only exact calendar precision is normalized; no assumed month/day/completion."""
    if not re.fullmatch(r"[0-9]{4}(?:-[0-9]{2}(?:-[0-9]{2})?)?", text):
        return None
    parts = [int(part) for part in text.split("-")]
    try:
        date(parts[0], parts[1] if len(parts) > 1 else 1, parts[2] if len(parts) > 2 else 1)
    except ValueError:
        return None
    return {"kind": "date", "text": text, "precision": ("year", "month", "day")[len(parts) - 1]}


def normalize_tag(tag: str, raw: str) -> tuple[dict | None, str, str | None]:
    text = raw.strip()
    if not text:
        return None, "invalid", "Empty source value; no value inferred."
    if tag in ("website", "contact:website"):
        if safe_website(text):
            return {"kind": "url", "url": text}, "normalized", None
        return None, "raw_only", "Website kept as text: unsupported or unsafe URL; no link created."
    if tag in ("architect:wikidata", "engineer:wikidata", "wikidata"):
        values = [part.strip() for part in text.split(";")]
        if all(re.fullmatch(r"Q[1-9][0-9]*", part) for part in values):
            return {"kind": "identifiers", "values": values}, "normalized", None
        return None, "invalid", "Expected semicolon-separated Q identifiers; none resolved."
    if tag in ("architect", "building:architecture"):
        values = [part.strip() for part in text.split(";")]
        if all(values):
            return {"kind": "list", "values": values}, "normalized", None
        return None, "raw_only", "Ambiguous empty list entry; source text retained intact."
    if tag == "height":
        result = parse_height(text)
        if result:
            return result, "normalized", None
        return None, "raw_only", "Height syntax or value unsupported; no numeric height inferred."
    if tag == "building:levels":
        if re.fullmatch(r"[0-9]+", text) and len(text) <= 15:
            return {"kind": "quantity", "value": int(text), "unit": "levels"}, "normalized", None
        return None, "raw_only", "Expected a nonnegative integer of above-ground, non-roof levels; no count inferred."
    if tag == "start_date":
        result = parse_date(text)
        if result:
            return result, "normalized", None
        return None, "raw_only", "Date retained as recorded, including any uncertainty or range; no exact date inferred."
    if tag == "engineer":
        return None, "raw_only", "Engineer tag can describe a contributor or office specialty; role not resolved."
    return {"kind": "text", "text": text}, "normalized", None


def import_claims(tags: dict, source_id: str, record_id: str) -> list[dict]:
    claims = []
    for tag in SUPPORTED_TAGS:
        if tag not in tags:
            continue
        raw = tags[tag]
        if not isinstance(raw, str):
            raise ValueError(f"Non-string OSM tag: {tag}")
        normalized, status, note = normalize_tag(tag, raw)
        claims.append({
            "property": tag, "value": raw, "source_id": source_id,
            "source_record_id": record_id, "raw_property": f"tags.{tag}",
            "normalized": normalized, "status": status, "note": note,
        })
    return claims


def claim_coverage(features: list[dict]) -> dict:
    coverage = {tag: {"present": 0, "normalized": 0, "raw_only": 0, "invalid": 0}
                for tag in SUPPORTED_TAGS}
    for feature in features:
        for claim in feature["properties"]["claims"]:
            coverage[claim["property"]]["present"] += 1
            coverage[claim["property"]][claim["status"]] += 1
    return coverage
