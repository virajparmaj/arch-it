# Decisions, limitations, and debt

## Decisions for the first prototype

| Decision | Reason | Revisit when |
| --- | --- | --- |
| React 18 + strict TypeScript + Vite | Interactive browser map; matches local contributor conventions | Public content pages need indexing/server rendering |
| App in `apps/web`; one root npm package | Clear growth path with a single install/build | A second executable or truly shared module exists |
| MapLibre GL JS directly | Established open renderer with built-in controls | A wrapper solves demonstrated integration complexity |
| OpenFreeMap Positron style | Key-free global basemap with quiet cartography | Availability, styling, or workload requires another provider |
| Static delivery | Map needs no server or database | Real data queries/editing justify a service |
| Chicago initial view and four city shortcuts | Immediate useful navigation | Building pilot evidence favors another region |
| Native controls and system fonts | Few dependencies, no font service requests | More complex accessible UI primitives are required |
| Lucide React icons | Consistent, accessible interface iconography | No planned replacement |
| Lazy map module | Let the shell load independently of the large renderer | Measured loading problems justify deeper optimization |
| Explicit bundled MapLibre worker | MapLibre 6's inferred URL breaks in Vite output; `?worker&url` includes required worker code | Recheck with any major renderer/bundler upgrade |
| Vitest + jsdom for lifecycle tests | Check recovery and cleanup using the existing Vite toolchain | Add real browser coverage when that is the next validation scope |
| Source provenance from phase 02 | Preserve evidence before normalization loses it | Extend based on actual records, never remove this boundary |

## Unresolved ownership decision

The owner has not selected a code license. MIT was recommended, but no answer was given. The prototype can be inspected privately; do not label it MIT-licensed or ready for unrestricted redistribution. External map/data/media licenses are independent. Set the chosen LICENSE and package metadata when the owner decides.

## Known limitations / production work

- Building selection covers only the 345 imported Chicago footprints. Architect entities, photos, search, and accounts are not implemented.
- Public map-service availability and network speed affect the application; cached areas are not an offline product.
- The map requires WebGL and a supported browser/GPU. Geolocation depends on HTTPS, device settings, and permission.
- The renderer is a large dependency. Its separate chunk is deliberate; measure on target mobile devices before expanding map layers. Do not silence bundle warnings by raising the threshold.
- Phases 03 and 04 include actual browser checks of map rendering, selection, keyboard focus, source links and responsive layouts. Physical touch devices, screen-reader use, and real location permissions still require the remaining checks in `VERIFICATION.md`.
- The initial page has no server rendering or persistent map URL. Add routing only when a phase requires it.
- A free initial frontend and basemap do not imply free global ingestion, storage, enrichment, and tile distribution at scale.

## Phase 02 decisions

- Use a cached OSM extract after comparing a real 12-building Overture subset, whose footprints all originated from OSM. See [the source comparison](PHASE_02.md).
- Preserve full source geometry and omit boundary-crossing records instead of clipping them. The pilot is not an exhaustive inventory.
- UUIDv5 identity uses the source namespace, object type, and ID. Future upstream splits/merges and cross-source matches require reconciliation.
- Keep the raw response and acquisition checksum beside a distinct derived GeoJSON artifact, both downloadable with ODbL attribution.
- Shapely/NumPy are pinned offline dependencies. No new frontend runtime dependency or server is introduced.
- Preserve string building IDs in renderer properties with `promoteId` and property-based picking/filtering; raw UUID feature IDs are coerced by vector serialization.
- Reject unsupported nested outer islands explicitly. Preserve independently building-tagged inner member ways during relation deduplication.

## Phase 03 decisions

- Use one nonmodal information panel with native selection controls, desktop/sidebar and mobile/compact layouts, and an independently scrolling body.
- Keep panel visibility separate from selected identity; close retains highlight and supports reopening. Explicit map selection focuses the heading, while panel navigation retains control focus.
- Show known imported attributes and visible source links. Keep identifiers and unchanged raw claims in an expandable details section. Attributes not imported are described as unavailable in the current records, not unknowable.
- Preserve the blank-map CSS import order and specific container sizing selector, with both stylesheet order tests retained.

## Next useful milestone

Phase 04 is complete locally; see [the report](PHASE_04.md). Keep every raw tag claim and source reference, normalize only supported syntax, and leave identifiers unresolved. Building type and use stay separate; dates preserve precision/uncertainty; website claims are activated only after validation. Missing metadata is data coverage, not a loading state. The same cache and dependencies are retained.

This implementation stops before Phase 05. Any later enrichment must account for zero architect IDs, sparse architect text, and repeated building Q IDs without forcing matches. The current data size supports static delivery; backend persistence still needs a concrete query/editing requirement. The existing Sites lookup now succeeds with owner-only access; the prior `project_not_found` result is historical. No deployment was requested/performed during Phase 04, so publishing remains unverified.
