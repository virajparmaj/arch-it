# Phase 02 — Clickable Chicago buildings

## Delivered boundary

The pilot adds 345 selectable building footprints in central Chicago: 344 OSM
ways and one multipolygon relation. Of these, 161 have a recorded name and 184 do
not. The pilot bounds are `[-87.634, 41.882, -87.624, 41.890]` in longitude/latitude
order. A dashed outline communicates the geographic boundary; colored footprints
show actual selectable records. Other cities retain only the world basemap.

Selection shows a sourced name or explicit unnamed state, complete internal ID,
OSM way/relation link, centroid, geometry type/parts/holes, source dates, license,
and a GeoJSON download. A compact inspection card is sufficient for this milestone;
the richer information panel belongs to phase 03. No architect facts are inferred.

## Source decision, grounded in samples

| Candidate | Inspected sample | Decision |
| --- | --- | --- |
| OpenStreetMap via one bounded Overpass acquisition | 358 records, 456,849 bytes; names, full tags, way/relation IDs and geometry; snapshot 2026-09-07T03:45:20Z | Use the cached snapshot and ship a static derived artifact |
| Overture Buildings release 2026-08-19.0 | 12 buildings, 14,157 bytes in a smaller overlapping bbox; all 12 footprint sources are OSM, 10 named, 5 include separate USGS height provenance | Keep as a later adapter; no additional footprint source was found in this tiny comparison |

The Overture sample was acquired with `overturemaps==1.0.2`, release pinned, bbox
`[-87.6310,41.8860,-87.6285,41.8878]`. It is a small comparison, not a coverage audit.
Example: Overture GERS `5085a7ad-abb1-49d9-8862-207a628f35ef` represents 77 West Wacker
and cites OSM `w64391028@19`. Overture release date, upstream snapshot, source update
time, and actual retrieval time are distinct concepts.

Primary references: [OSM query semantics](https://wiki.openstreetmap.org/wiki/Overpass_API/Overpass_QL),
[OSM license](https://www.openstreetmap.org/copyright),
[Overture Buildings](https://docs.overturemaps.org/guides/buildings/),
[building schema](https://docs.overturemaps.org/schema/reference/buildings/building/),
[bounded client downloads](https://docs.overturemaps.org/getting-data/overturemaps-py/),
[Overture licenses](https://docs.overturemaps.org/attribution/#buildings), and
[GERS registry](https://docs.overturemaps.org/gers/registry/).

## Provenance and representation

`source.json` remains an unchanged acquisition. Its SHA-256 and actual retrieval
time live in `acquisition.json`; source freshness is the OSM snapshot time. The
compiled GeoJSON carries geometry provenance, source identifiers, name claims, and
separate display values. Dataset license and source metadata are shared through
explicit source IDs. No arbitrary confidence scores or verification labels exist.

Canonical UUIDv5 identity includes OSM object type and ID. The renderer receives
only geometry plus `building_id`; MapLibre promotes that property as feature ID.
Picking and highlighting also use the property because vector-tile serialization
can coerce raw UUID `feature.id` values to numbers. Basemap features cannot be
selected as canonical buildings.

The app downloads the ~305 kB derived snapshot once per mount; malformed, failed,
or timed-out downloads show an independent retry state while the basemap remains
usable. It adds no runtime API calls, database, or frontend processing dependency.
The raw ~457 kB source is downloadable on demand and is not loaded during normal
map use. MapLibre retains its large renderer/worker bundle from phase 01.

## Verification and limitations

The 22 frontend tests cover existing map lifecycle behavior, actual dataset
validation, canonical selection after ID coercion, switching hits, coverage/zoom/
empty clicks, layer cleanup, replacement-renderer readiness, and failed-download
recovery. Building layers wait for the specific map instance to load, including
after development reloads or retries. Two stylesheet integration checks ensure
MapLibre cannot override the map container's positioning in either CSS load order.
Seven Python tests
cover byte-identical rebuilds, order/name-independent IDs, valid pilot geometry,
courtyard holes, explicit nested-island exclusion, inner-building preservation,
and partial-response rejection. Lint, TypeScript, and the static build pass.

Renderer calls are mocked in unit tests. A follow-up blank-map fix was verified
in the local production build at 380 × 600: the map and footprints render, and
selecting 77 West Wacker opens its sourced details. The subsequent [Phase 03 pass](PHASE_03.md) verified actual WebGL rendering, adjacent-building clicks, and desktop/mobile panel layouts. Physical touch devices, screen-reader behavior, and remaining geometry edge cases still need review. Source OSM facts are not independently
verified, and the pilot does not imply exhaustive building coverage.

## Next checkpoint

Phase 03 can expand the inspection card around the existing sourced-record
contract. Keep raw claims separate from display logic and retain null/unknown
states. The data size still supports static delivery; there is no current reason
to introduce FastAPI/PostGIS. Add those when real queries or editing justify them.
