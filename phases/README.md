# Phased implementation prompts

This folder is the working roadmap for Arch-IT: explore a building, discover its architect or firm, then find their other buildings. Each phase is a bounded agent brief, not authorization to build the entire roadmap at once.

## Status

| Phase | Prompt | Status |
| --- | --- | --- |
| 00 | [Foundation](phase-00-foundation.md) | Implemented; build/checks passed |
| 01 | [Working map](phase-01-working-map.md) | Implemented; interactive acceptance review pending |
| 02 | [Building footprints](phase-02-building-footprints.md) | Planned |
| 03 | [Building information panel](phase-03-information-panel.md) | Planned |
| 04 | [OSM architecture metadata](phase-04-osm-architecture.md) | Planned |
| 05 | [Wikidata enrichment](phase-05-wikidata-enrichment.md) | Planned |
| 06 | [Architect pages](phase-06-architect-pages.md) | Planned |
| 07 | [Search](phase-07-search.md) | Planned |
| 08 | [Photos](phase-08-photos.md) | Planned |
| 09 | [Better 3D](phase-09-better-3d.md) | Planned |
| 10 | [Provenance and conflict review](phase-10-provenance.md) | Planned |
| 11 | [Contributions](phase-11-contributions.md) | Planned |
| 12 | [Regional adapters](phase-12-regional-adapters.md) | Planned |
| 13 | [Advanced discovery](phase-13-advanced-discovery.md) | Planned |

## How to use

Open one phase prompt, inspect current code and documentation, and adapt the brief to repository evidence. Execute its scoped milestone, keep the application runnable, verify its acceptance checks, then record the result here. A phase is complete only after verification; do not infer completion from files or UI placeholders. Stop after the selected milestone and reassess before beginning the next phase.

The immediate prototype delivers phases 00 and 01 in `apps/web`, using React, TypeScript, Vite, MapLibre GL JS, and OpenFreeMap. The map is globally navigable; canonical building coverage starts with a bounded pilot, provisionally Chicago. Future briefs describe decisions and outcomes without prebuilding services.

See [verification evidence](../docs/VERIFICATION.md) before marking phase 01 fully accepted. The current prototype passes lint, TypeScript, 7 lifecycle tests, and a production build. Review the working map before authorizing phase 02.

Provenance begins with the first imported record in phase 02. Phase 10 improves presentation and review. Basemap features are not canonical building identities. Never invent missing facts or collapse conflicting source claims.

Code licensing remains undecided: the earlier MIT recommendation was not accepted yet. Source data, map tiles, text, and images have separate licenses and attribution obligations. Do not imply a code license grants rights to external content.
