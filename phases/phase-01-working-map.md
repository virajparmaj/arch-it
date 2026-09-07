# Phase 01 — A working interactive world map

Status: **Implemented; interactive acceptance review pending** — see [verification](../docs/VERIFICATION.md).

## Objective and prerequisites

Let a visitor open the application and explore a responsive world map on desktop or mobile. Phase 00 must provide a runnable frontend and documented commands. Read the existing map implementation before changing it; complete missing acceptance checks instead of rebuilding working pieces.

## Agent prompt

Implement the first useful map prototype in `apps/web`. Integrate MapLibre GL JS with an OpenFreeMap basemap, retaining visible provider and dataset attribution. Start with a sensible Chicago view while allowing worldwide pan and zoom. Provide usable navigation controls and an explicit locate action. Request device location only after that action and explain denied permission, unavailable location, and other failures without breaking map exploration.

Build a restrained, responsive interface around the map. Make supported actions functional, label the prototype clearly, and explain that building inspection and architecture metadata are upcoming. Provide useful initial loading and map failure states, including recovery where possible. Handle missing WebGL support understandably. Clean up the map and listeners correctly when React mounts or unmounts components. Ensure resized layouts leave a usable map viewport.

Document local development, production build, preview, and static hosting requirements. Keep the basemap choice configurable through a small, documented public configuration boundary. Show no search field, filter, or button that pretends to provide an unimplemented feature.

## Decisions and defaults

MapLibre supplies the established open-source renderer; OpenFreeMap supplies a key-free basemap. Verify current integration requirements and attribution from primary documentation. The public basemap service is an external dependency without an assumed availability guarantee. Browser-exposed settings cannot contain secrets. Keep mapping code application-local; do not introduce a map framework wrapper without a demonstrated need.

## Out of scope

Building selection, metadata, photos, search, authentication, backend services, and planetary data processing.

## Acceptance checks

### Runnable checkpoints

1. **Project boots:** React shell loads through the documented root development command.
2. **Map appears:** Chicago view loads using MapLibre and the configured open basemap, with attribution.
3. **Navigation works:** pan, zoom, orientation, city shortcuts, coordinate readout, and explicit locate control.
4. **Recovery and layout:** mobile layout, loading/failure feedback, retries, reduced motion, and resource cleanup.
5. **Handoff:** production build, focused lifecycle tests, setup/deployment documentation, and interactive acceptance review.

Each checkpoint must remain runnable. The current implementation includes all five code/documentation checkpoints; interactive acceptance remains to be reviewed.

### Behavior to verify

- Map tiles render, and pan, zoom, orientation, and attribution work.
- Desktop and mobile layouts remain usable.
- Locate success and available failure paths behave clearly.
- Loading, basemap failure, and unsupported rendering have honest feedback.
- Type checks and production build pass; inspect the running prototype.

## Record and reassess

Record tested behavior and any browser limitations. Mark phases 00/01 complete only when their checks pass. Stop here; identify phase 02 as the next milestone and reassess its pilot dataset before adding it.
