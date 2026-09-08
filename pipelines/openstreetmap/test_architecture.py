"""Parsing boundaries, raw provenance, and repeatable imports from cached input."""

import copy
import json
import unittest

from architecture import SUPPORTED_TAGS, import_claims, normalize_tag, safe_website
from import_buildings import DATA_DIR, build, serialize


class ArchitectureTests(unittest.TestCase):
    def test_absent_blank_and_multivalue_names_preserve_raw_text(self):
        self.assertEqual(import_claims({}, "source", "osm:way/1"), [])
        raw = " Holabird & Roche;Schmidt, Garden & Martin "
        claims = import_claims({"architect": raw, "name": "  "}, "source", "osm:way/1")
        self.assertEqual(claims[0]["status"], "invalid")
        self.assertIsNone(claims[0]["normalized"])
        self.assertEqual(claims[1]["value"], raw)
        self.assertEqual(claims[1]["normalized"]["values"], ["Holabird & Roche", "Schmidt, Garden & Martin"])
        self.assertEqual(normalize_tag("architect", "Murphy/Jahn")[0]["values"], ["Murphy/Jahn"])
        self.assertEqual(normalize_tag("architect", "Joachim Giæver, Frederick P. Dinkelberg")[0]["values"],
                         ["Joachim Giæver, Frederick P. Dinkelberg"])
        self.assertIsNone(normalize_tag("architect", "A;;B")[0])

    def test_dates_keep_calendar_precision_and_uncertainty(self):
        for raw, precision in [("1899", "year"), ("1921-10", "month"), ("1921-10-26", "day"), ("2024-02-29", "day")]:
            with self.subTest(raw=raw):
                self.assertEqual(normalize_tag("start_date", raw)[0],
                                 {"kind": "date", "text": raw, "precision": precision})
        for raw in ["~1855", "1860s", "before 1850", "after 1900", "C18", "1914..1918", "1900-1910", "2023-02-29", "2020-13", "0000", "nonsense"]:
            with self.subTest(raw=raw):
                claim = import_claims({"start_date": raw}, "source", "osm:way/1")[0]
                self.assertEqual(claim["value"], raw)
                self.assertEqual(claim["status"], "raw_only")
                self.assertIsNone(claim["normalized"])

    def test_height_units_do_not_prefix_parse_malformed_numbers(self):
        for raw, metres in [("86 m", 86), ("61.5 m", 61.5), ("60", 60), ("7'4\"", 2.2352), ("10'", 3.048)]:
            with self.subTest(raw=raw):
                self.assertEqual(normalize_tag("height", raw)[0], {"kind": "quantity", "value": metres, "unit": "m"})
        for raw in ["-2", "0", "NaN", "Infinity", "1e3", "12junk", "12,5", "20;30", "~20", "10 ft", "3'12\"", "9" * 400]:
            with self.subTest(raw=raw):
                self.assertIsNone(normalize_tag("height", raw)[0])

    def test_levels_keep_zero_but_never_round_fractions_or_infer_from_height(self):
        self.assertEqual(normalize_tag("building:levels", "0")[0], {"kind": "quantity", "value": 0, "unit": "levels"})
        for raw in ["2.5", "2.0", "-1", "20 floors", "1e2", "NaN", "12;13", "9" * 30]:
            with self.subTest(raw=raw):
                self.assertIsNone(normalize_tag("building:levels", raw)[0])
        self.assertEqual([c["property"] for c in import_claims({"height": "10"}, "s", "osm:way/1")], ["height"])

    def test_identifier_syntax_does_not_resolve_names_or_shared_buildings(self):
        self.assertEqual(normalize_tag("architect:wikidata", "Q1; Q22")[0]["values"], ["Q1", "Q22"])
        for raw in ["q1", "Q01", "Q0", "Q1;bad", "https://www.wikidata.org/wiki/Q1", "Q1;;Q2"]:
            with self.subTest(raw=raw):
                self.assertIsNone(normalize_tag("architect:wikidata", raw)[0])
        self.assertIsNone(normalize_tag("engineer", "structural")[0])

    def test_websites_are_explicit_safe_links_or_unmodified_nonlinks(self):
        for raw in ["https://example.com/path?q=1#section", "http://example.com", "https://example.com:8443/path"]:
            self.assertTrue(safe_website(raw), raw)
        for raw in ["javascript:alert(1)", "data:text/html,test", "//example.com", "example.com", "https://user:pass@example.com", "https://@example.com", "https://example.com\\@evil.com", "https://example.com\n", "https://example.com/%0Afoo", "https://example.com;https://other.com", "https://", "https://example.com:99999", "https://example..com", "https://example.com/a b"]:
            with self.subTest(raw=raw):
                self.assertFalse(safe_website(raw))
                # Whitespace trimming is allowed for display, but never changes the raw claim.
                claim = import_claims({"website": raw}, "source", "osm:way/1")[0]
                self.assertEqual(claim["value"], raw)

    def test_every_imported_claim_matches_cached_tag_and_coverage(self):
        raw = json.loads((DATA_DIR / "source.json").read_text())
        acquisition = json.loads((DATA_DIR / "acquisition.json").read_text())
        dataset = build(raw, acquisition)
        records = {f"osm:{e['type']}/{e['id']}": e for e in raw["elements"]}
        counts = dict.fromkeys(SUPPORTED_TAGS, 0)
        for feature in dataset["features"]:
            p = feature["properties"]
            claims = p["claims"]
            self.assertEqual(len(claims), len({c["property"] for c in claims}))
            for claim in claims:
                self.assertEqual(claim["value"], records[p["source_record_id"]]["tags"][claim["property"]])
                self.assertEqual(claim["raw_property"], f"tags.{claim['property']}")
                self.assertEqual(claim["source_id"], p["source_id"])
                self.assertEqual(claim["source_record_id"], p["source_record_id"])
                counts[claim["property"]] += 1
        self.assertEqual(counts, {tag: stats["present"] for tag, stats in dataset["metadata"]["tag_coverage"].items()})
        for tag, expected in {"architect": 9, "start_date": 10, "height": 46, "building:levels": 183, "website": 26, "building:architecture": 0, "architect:wikidata": 0}.items():
            self.assertEqual(counts[tag], expected)
        self.assertEqual(dataset["metadata"]["claim_diagnostics"], [])
        # Repeated shared Q IDs are evidence, not permission to merge footprints.
        q295396 = [f for f in dataset["features"] if any(c["property"] == "wikidata" and c["value"] == "Q295396" for c in f["properties"]["claims"])]
        self.assertEqual(len(q295396), 2)

    def test_reimport_diagnostics_and_claims_are_idempotent_with_bad_fixture_tags(self):
        raw = json.loads((DATA_DIR / "source.json").read_text())
        acquisition = json.loads((DATA_DIR / "acquisition.json").read_text())
        raw["elements"] = [copy.deepcopy(next(e for e in raw["elements"] if e["id"] == 234052883))]
        raw["elements"][0]["tags"].update({"start_date": "~1900", "height": "bad", "website": "javascript:alert(1)", "architect": "A;B", "architect:wikidata": "Q1;Q2"})
        first = build(raw, acquisition)
        self.assertEqual(serialize(first), serialize(build(raw, acquisition)))
        self.assertEqual(len(first["features"][0]["properties"]["claims"]), 6)
        diagnostics = first["metadata"]["claim_diagnostics"]
        self.assertEqual({c["property"] for c in diagnostics}, {"start_date", "height", "website"})
        self.assertTrue(all(c["source_record_id"] == "osm:way/234052883" for c in diagnostics))


if __name__ == "__main__":
    unittest.main()
