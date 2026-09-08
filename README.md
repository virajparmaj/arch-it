# Arch It

A map for discovering the built world. The longer-term discovery loop is **building → architect or firm → other buildings**, with sources attached to important facts.

## Current prototype — phase 04

The application opens an interactive map centered on a Chicago Loop pilot. Select one of **345 highlighted building footprints** to open a desktop side panel or compact mobile panel with its available OSM attributes: architect text, dates, type/use, height/levels, address components, heritage claims, and validated website links. Each attribute links to its source; unchanged raw claims live in expandable details. Browse buildings with the keyboard, switch selections, close with Escape, and reopen the same highlighted record. The dashed outline marks the pilot boundary. Pan and zoom globally, jump between cities, reset north, and locate yourself on demand. Other cities have a basemap only.

Metadata is sparse: **9 buildings have architect text, 10 have start dates, 46 have height, 183 have levels, and 26 have websites**. These are attributed OSM claims, not resolved architect identities or independently verified facts. Search, photos, architect pages and Wikidata enrichment remain unimplemented. Colored pilot footprints are canonical records; other buildings visible in the basemap remain cartography. The repository is intended to become open source; a code license has not been selected yet.

## Run locally

Use Node.js 24 LTS (see `.nvmrc`) and npm. From the repository root:

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite, normally `http://127.0.0.1:5173`. Stop the server with Ctrl+C. If that port is occupied, stop the other server or run `npm run dev -- --port 5174`.

```sh
npm run check    # lint, lifecycle tests, TypeScript, and production build
npm run test     # run frontend data, map, CSS, and panel tests
npm run preview  # serve the production build after npm run build
```

The application loads a bundled building snapshot and needs internet access for the basemap. No API key, database, Python environment, or sign-in is required. Device location is optional and requested only using the map's locate button. Browsers require HTTPS or localhost for geolocation; actual permission prompts depend on the browser and operating system.

## Configuration

Defaults work without an environment file. To change the basemap, copy `.env.example` to `.env.local` at the repository root and set `VITE_MAP_STYLE_URL` to a compatible MapLibre style URL. Restart Vite after changes. A hosted build must be rebuilt to apply `VITE_*` changes. Browser configuration is public: never put secrets in it.

OpenFreeMap is the initial provider. Any replacement must supply compatible styles, fonts, sprites, tiles, CORS access, and appropriate attribution. Its public service is an external dependency; offline maps and an availability guarantee are not provided.

## Structure

```text
apps/web/           React application and static assets
  src/features/map/ Map lifecycle, navigation, and provider configuration
  src/components/   Application-level components
  src/types/        Frontend contracts
pipelines/          Offline, reproducible OSM import and geometry tests
phases/             Detailed, reusable prompts for phases 00–13
docs/               Architecture, sources, decisions, and verification
.openai/hosting.json Optional Sites deployment binding
```

The app lives in `apps/web`, while one root package manifest and lockfile keep development simple. Shared packages and additional services will be added only when used.

## Work one phase at a time

Start with [the phase index](phases/README.md). Each prompt defines prerequisites, implementation scope, exclusions, acceptance checks, and a stop/reassessment point. Phases 00–04 are implemented. The [phase 02 report](docs/PHASE_02.md) records source selection and geometry. The [phase 03 report](docs/PHASE_03.md) records the reusable information panel. The [phase 04 report](docs/PHASE_04.md) records tag semantics verified against primary OSM documentation, coverage, parsing limitations, and desktop/mobile browser verification.

Further phases require a separate scoped request; this implementation stops after Phase 04.

See [architecture](docs/ARCHITECTURE.md), [decisions and debt](docs/DECISIONS.md), [data sources and licensing](docs/DATA_SOURCES.md), and [verification](docs/VERIFICATION.md).

## Reproduce the building dataset

The cached source, acquisition metadata, derived GeoJSON, and ODbL notice live in `apps/web/public/data/chicago-loop/`. The web app makes no Overpass requests. See [the import instructions](pipelines/openstreetmap/README.md) for offline rebuilds, 15 Python parsing/import tests, and the existing opt-in acquisition script. Phase 04 uses only the current cache. Python 3.12+ is needed only for import work; running the app still requires only Node/npm.

## Hosting

`npm run build` writes a static website to `dist/`. Serve that directory over HTTPS with a static host. The application has one route and needs no server runtime. The checked-in Sites binding is for this project's preview; forks should remove or replace `.openai/hosting.json` before using Sites and should never publish to the original project's binding.

The Phase 04 Sites lookup succeeded for the existing owner-only project; the earlier `project_not_found` blocker was not reproduced. Local implementation and verification are complete; no deployment was requested or performed in Phase 04, so publishing remains unverified. See [verification](docs/VERIFICATION.md).

Do not commit generated builds or local environment files. No API secrets are needed for this milestone. Publishing the code for reuse remains gated on the repository owner's license choice, independent of private prototype previews.

## Contributing

Read the current phase and architecture notes first. Keep changes scoped to one runnable milestone. Preserve types, error recovery, attribution, and source evidence. Run the relevant checks and update the status/limitations in the documentation. A dependency should solve a demonstrated problem; describe that problem before adding it.

Code licensing is pending; `UNLICENSED` in `package.json` is intentional until the owner decides. Third-party dependencies and external data retain their own licenses. See [source and licensing notes](docs/DATA_SOURCES.md).
