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
| Vitest + jsdom for lifecycle tests | Check recovery and cleanup using the existing Vite toolchain | Add real browser coverage when that is the next validation scope |
| Source provenance from phase 02 | Preserve evidence before normalization loses it | Extend based on actual records, never remove this boundary |

## Unresolved ownership decision

The owner has not selected a code license. MIT was recommended, but no answer was given. The prototype can be inspected privately; do not label it MIT-licensed or ready for unrestricted redistribution. External map/data/media licenses are independent. Set the chosen LICENSE and package metadata when the owner decides.

## Known limitations / production work

- No building dataset, building selection, architect entities, photos, search, or accounts yet.
- Public map-service availability and network speed affect the application; cached areas are not an offline product.
- The map requires WebGL and a supported browser/GPU. Geolocation depends on HTTPS, device settings, and permission.
- The renderer is a large dependency. Its separate chunk is deliberate; measure on target mobile devices before expanding map layers. Do not silence bundle warnings by raising the threshold.
- Browser/device behavior, touch layouts, screen-reader use, and real location permissions require the interactive checks in `VERIFICATION.md`; automated build/resource checks cannot establish those outcomes.
- The initial page has no server rendering or persistent map URL. Add routing only when a phase requires it.
- A free initial frontend and basemap do not imply free global ingestion, storage, enrichment, and tile distribution at scale.

## Next useful milestone

Finish reviewing the first map, then follow `phases/phase-02-building-footprints.md`. Validate a bounded footprint source and pilot before choosing static GeoJSON, PMTiles, or a spatial backend. Keep the first ingestion reproducible and retain identifiers and licenses from the start.
