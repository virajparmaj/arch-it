# Prototype verification

This document distinguishes executed checks from interactive acceptance review. Update the evidence after each phase rather than treating the existence of code as proof that it works.

## Automated / command-line checks

Run `npm ci` on a clean install and `npm run check` for lint, lifecycle tests, TypeScript, and the production build. Request the local preview URL to confirm that it responds. Verify the configured provider's style and a representative tile separately; HTTP success does not establish WebGL rendering.

## Interactive acceptance checklist

These checks require a browser and remain pending unless explicitly recorded as tested.

- Open the map: Chicago streets/labels appear, the loading card clears, and attribution is readable.
- Pan, zoom by mouse/touch/keyboard, rotate, and reset north. Center coordinates update after movement.
- Select each city and select the same city again after moving. Selection clears on manual movement.
- Resize to narrow mobile and short landscape windows. City shortcuts scroll; controls and attribution remain reachable.
- Use keyboard focus and 200% zoom. Skip to map and activate controls; content should remain readable.
- With reduced motion enabled, city jumps have no flying animation.
- Click locate: test permission allowed, denied, unavailable, and timeout. No location prompt should occur on initial load.
- Block the map style or disconnect the network. Confirm useful feedback and a working retry after restoration.
- Disable WebGL or hardware acceleration where possible. Confirm initialization failure is actionable.
- Retry repeatedly and navigate through development remounts: no duplicate map canvases, controls, or listeners should persist.

## Current evidence

Executed on 2026-09-06 (America/Chicago), using Node 25.2.1 and npm 11.12.1:

- ESLint: passed.
- Strict TypeScript check: passed.
- Vitest/jsdom: 7 map lifecycle tests passed, covering loaded state, navigation/reduced motion, stalled-load retry, initialization failure, denied geolocation, context restoration, and unmount cleanup. MapLibre is mocked in these tests.
- Production build: passed. Main JavaScript ~150 kB (~50 kB gzip); lazy renderer ~996 kB (~262 kB gzip), plus a separate ~486 kB worker. Vite's >500 kB chunk warning remains visible and documented.
- A development-server log exposed MapLibre 6's missing inferred worker URL. Fixed using the official `?worker&url` integration. The build now verifies that the map references a shipped, self-contained worker; the development worker URL returned actual JavaScript successfully over HTTP.
- Local development URL: HTTP 200; preview opened in Codex.
- OpenFreeMap Positron style: fetched successfully, 55 layers. Source TileJSON includes OpenFreeMap/OpenMapTiles/OSM attribution. A representative Chicago z14 tile fetched successfully (446,634 bytes).

Browser-rendered map behavior, mobile touch interaction, screen-reader behavior, and real geolocation permissions have not yet been verified interactively. Phase 01 is implemented and ready for that acceptance review; those items are not claimed as tested.
