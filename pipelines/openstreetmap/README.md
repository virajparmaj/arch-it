# Chicago Loop footprint import

This is a bounded, offline import adapter, not a service. Running the web app never
contacts Overpass. A checked-in snapshot makes rebuilding independent of a public
API or subsequent edits in OSM.

## Rebuild and verify

With Python 3.12 or newer, create an isolated environment from the repository root, then install the
pinned processing dependencies:

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r pipelines/openstreetmap/requirements.txt
.venv/bin/python pipelines/openstreetmap/import_buildings.py
.venv/bin/python pipelines/openstreetmap/import_buildings.py --check
.venv/bin/python -m unittest discover -s pipelines/openstreetmap -p 'test_*.py' -v
```

The first implementation was verified with Python 3.14.7, Shapely 2.1.2, and NumPy
2.5.3. Python is needed only for import work; normal frontend development uses npm.
Shapely supplies polygon assembly, validation, and centroids. No GeoPandas, DuckDB,
database, or API service is installed.

Inputs and output live in `apps/web/public/data/chicago-loop/` so both the raw
snapshot and derived database are available for provenance and redistribution:

- `source.json`: unchanged OSM response (456,849 bytes).
- `acquisition.json`: query, endpoint, actual retrieval time, and raw SHA-256.
- `buildings.geojson`: schema v2 geometry, canonical IDs, 1,839 sourced tag claims,
  separate normalizations, display name, centroid, coverage, and diagnostics (745,952 bytes).
- `LICENSE.md`: ODbL notice, attribution, and transformation explanation.

The checksum is checked before import. `--check` verifies that rebuilding is
byte-identical to the shipped artifact. Records are sorted by canonical ID so the
order of upstream elements cannot change output.

## Acquiring an intentional update

```sh
.venv/bin/python pipelines/openstreetmap/fetch_snapshot.py /tmp/chicago-loop-new-snapshot
```

This makes one bounded request with time/response-size limits. It refuses an
existing output directory, rejects partial/empty responses, and does not replace
the shipped data. Inspect the new source and acquisition record before replacing
both cached input files, rebuilding, reviewing the diff, and rerunning checks.
An upstream update is intentionally different from reproducing the existing cache.
If the endpoint fails or rate-limits, keep the existing cache; do not loop requests.

## Geometry and identity policy

The query returns building-tagged ways and multipolygon relations touching bbox
`[west=-87.634, south=41.882, east=-87.624, north=41.890]`. Only complete valid
footprints entirely within that rectangle are imported. Border-crossing records
are excluded rather than clipped. OSM query semantics and incomplete mapping mean
this is a pilot inventory, not a completeness claim for every physical building.

Closed ways become polygons. Multipolygon member segments are assembled by their
outer/inner roles, preserving courtyard holes. Invalid, unclosed, incomplete, or
unsupported nested-island geometry is reported, never silently repaired. An
imported relation suppresses redundant outer member ways; independently tagged
inner buildings retain their own records. All exclusions retain source IDs and
reasons. The current source has 358 records; 345 import and 13 cross the boundary.

UUIDv5 uses a fixed project namespace plus `osm:way/<id>` or `osm:relation/<id>`.
Names, coordinates, and input order do not participate in identity. This guarantees
stable IDs for the same source object, not across upstream deletion/recreation,
way-to-relation conversion, splitting, or merging. A future identity/alias table
will handle those cases and cross-dataset reconciliation.

Centroids are area-weighted planar centroids in EPSG:4326, approximate at this city
scale. A centroid can lie in a courtyard or outside a concave outline; it is not
an entrance or guaranteed interior point. Geometry is kept separately from raw
records; only winding changes. Raw names remain in claims while display names
trim whitespace. Unknown names remain null. Other tags remain in the raw snapshot
that are outside the supported claim set remain in the raw snapshot, without inferred facts.

## Phase 04 claims and diagnostics

`architecture.py` defines the supported tags and conservative parsers. See
[Phase 04 semantics and coverage](../../docs/PHASE_04.md) for primary OSM references,
exact supported syntax, absent tags, and examples. Every claim preserves its raw
string and source record. Normalized architect strings never become identities;
start dates never automatically become completion years. Unsupported dates,
numbers and URLs stay raw with explanations. Missing tags produce no claim.

Imports reconstruct the entire artifact deterministically, never append claims.
The natural claim key within this one-snapshot adapter is source ID + record ID +
tag. One semicolon list is one claim; repeated external identifiers on different
footprints are not merged. The frontend validates normalized values against raw
strings, source references, duplicate claims, and reported coverage before display.

Each import prints footprint counts, exclusions, `tag_coverage` for every supported
tag (including zeros), and `claim_diagnostics` for unsupported/invalid inputs.
These diagnostics also ship in GeoJSON metadata with source references. Current
cache: 345 buildings, 1,839 claims, zero claim diagnostics; supported values all
normalize conservatively. This does not certify their factual accuracy. Synthetic
tests cover blank tags, list ambiguity, dates, units, malformed numbers and unsafe
websites. The same cache/checksum is used throughout Phase 04; the acquisition
command above is documentation for a future intentional update, not part of reimport.
