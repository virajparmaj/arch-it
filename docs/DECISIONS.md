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
- Browser/device behavior, touch layouts, screen-reader use, and real location permissions require the interactive checks in `VERIFICATION.md`; automated build/resource checks cannot establish those outcomes.
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

## Next useful milestone

Review the Chicago selection experience, then follow `phases/phase-03-information-panel.md`. Expand sourced fields and presentation incrementally. The current data size supports static delivery; backend persistence still needs a concrete query/editing requirement.
