# Architecture

## Product and implemented boundary

Arch It will support building → architect/firm → other buildings discovery with source-backed facts, including ordinary buildings. The first prototype implements only world-map exploration. It has no canonical building dataset, API, accounts, database, ingestion, or persistent user state.

The browser renders a React 18 application written in strict TypeScript. Vite serves development source and builds static output. A lazily loaded MapLibre GL JS component requests an OpenFreeMap style, tiles, sprites, and glyphs directly. Map controls handle pan/zoom/orientation and optional geolocation. City shortcuts are hardcoded camera destinations, not search results or architecture records.

## Module boundaries

- `apps/web/src/App.tsx`: application layout, selected city, and coordinate readout.
- `apps/web/src/features/map/MapCanvas.tsx`: owns exactly one renderer per mount; subscribes to map/browser events; disposes resources on unmount or retry.
- `apps/web/src/features/map/config.ts`: initial view, city destinations, public basemap configuration, coordinate formatting.
- `apps/web/src/types/map.ts`: small frontend contracts, not speculative database schemas.
- `apps/web/src/components/ErrorBoundary.tsx`: recovery for application rendering failures.

The MapLibre dependency is loaded separately so the application shell does not wait for the renderer bundle. Map state updates after camera movement; React does not rerender every animation frame. MapLibre's built-in resize observer keeps the canvas sized to its panel. Retry recreates the map, and geolocation does not start automatically.

MapLibre 6 is ESM-only and requires an explicit worker URL when bundled. Import its worker with Vite's `?worker&url` and pass it to `setWorkerUrl` before creating the map. Plain `?url` does not bundle the worker's sibling imports. `scripts/verify-build.mjs` checks that the production map references a shipped, self-contained worker. See the [official ESM integration](https://maplibre.org/maplibre-gl-js/docs/#esm).

Vitest uses the Vite toolchain to verify lifecycle behavior. jsdom supplies a simulated document, and the tests substitute a controlled renderer to exercise load, city navigation, reduced motion, timeouts/retry, initialization failure, geolocation denial, context restoration, and disposal. These tests do not prove real WebGL rendering or actual device-permission behavior.

## Environment and delivery

Use one root npm manifest and lockfile. Vite's root is `apps/web`; its environment directory is the repository root and output directory is `dist`. Every `VITE_*` value is public build-time configuration. The default style works with no environment file or key. Static HTTPS hosting is sufficient; the Sites binding is replaceable and is not an application dependency.

## Next architecture checkpoint

Phase 02 should add a small reproducible pilot building dataset with stable IDs and a selectable layer. Prefer bounded static delivery while that satisfies the actual dataset. Choose the source by inspecting available identifiers, geometry, metadata, size, and license. The initial Chicago camera is a provisional pilot, not a global data-coverage commitment.

Provenance must begin with the first import. Separate external source records, canonical identity matches, sourced claims, and display preferences. Use stable internal IDs plus source namespace/type/ID; do not use names or transient basemap feature IDs as canonical identity. Distinguish OSM ways from relations. Represent people and organizations separately, with sourced contributor roles. Keep missing facts absent and conflicting claims intact. Phase 10 improves provenance UI rather than adding provenance storage for the first time.

When actual query or editing needs justify persistence, introduce one modular FastAPI service with PostgreSQL/PostGIS and migrations. Add isolated Python import adapters, generated API contracts, and search incrementally. Shared packages, PMTiles, DuckDB, and heavier geospatial libraries require a concrete use case. No initial graph database, search cluster, queue, or microservices.

After each milestone, record what was verified, limitations, unresolved decisions, and the next useful slice before proceeding.
