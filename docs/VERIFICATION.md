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

## Phase 01 evidence

Executed on 2026-09-06 (America/Chicago), using Node 25.2.1 and npm 11.12.1:

- ESLint: passed.
- Strict TypeScript check: passed.
- Vitest/jsdom: 7 map lifecycle tests passed, covering loaded state, navigation/reduced motion, stalled-load retry, initialization failure, denied geolocation, context restoration, and unmount cleanup. MapLibre is mocked in these tests.
- Production build: passed. Main JavaScript ~150 kB (~50 kB gzip); lazy renderer ~996 kB (~262 kB gzip), plus a separate ~486 kB worker. Vite's >500 kB chunk warning remains visible and documented.
- A development-server log exposed MapLibre 6's missing inferred worker URL. Fixed using the official `?worker&url` integration. The build now verifies that the map references a shipped, self-contained worker; the development worker URL returned actual JavaScript successfully over HTTP.
- Local development URL: HTTP 200; preview opened in Codex.
- OpenFreeMap Positron style: fetched successfully, 55 layers. Source TileJSON includes OpenFreeMap/OpenMapTiles/OSM attribution. A representative Chicago z14 tile fetched successfully (446,634 bytes).

Browser-rendered map behavior, mobile touch interaction, screen-reader behavior, and real geolocation permissions have not yet been verified interactively. Phase 01 is implemented and ready for that acceptance review; those items are not claimed as tested.

## Phase 02 evidence

Implemented on 2026-09-06 (America/Chicago). The user requested the next phase; no browser acceptance of phase 01 is inferred from that request.

- Frontend lint and strict TypeScript: passed.
- Vitest: 20 tests passed, including existing map lifecycle, actual pilot data validation, UUID preservation across numeric renderer IDs, selection switching, outside/empty/zoomed-out clicks, map/layer disposal, replacement-renderer readiness, and independent download retry/abort.
- Python 3.14.7 / Shapely 2.1.2 / NumPy 2.5.3: seven import tests passed.
- Reimport from the cached source is byte-identical; reversing source order preserves both IDs and the artifact. Names are not part of identity.
- The 345 imported geometries are valid. Source has 358 records; 13 boundary-crossing records are explicitly excluded. There are 161 sourced names and 184 null names.
- Production build passed with the bundled worker, derived data, unchanged source, matching provenance checksum, and ODbL notice present. Main JS ~157 kB; renderer ~998 kB and worker ~486 kB. Renderer chunk warning remains documented.
- Development dataset and raw-source URLs both returned HTTP 200. Normal map use reads only the ~305 kB derived file; the raw ~457 kB file is downloaded only if requested.

Additional interactive review still needed: click several physically adjacent colored footprints; verify courtyards do not select their surrounding building; click outside the dashed boundary; return from London; dismiss/select repeatedly; confirm the mobile inspection card and attribution remain usable. The map renderer is mocked in tests, so these are not claimed as browser-tested.

See [phase 02](PHASE_02.md) for source comparison, provenance, and remaining limitations.

## Blank-map correction

The user's screenshot exposed a CSS integration failure missed by renderer mocks:
the lazy MapLibre stylesheet overrode `.map-canvas` with `position: relative`.
Its absolute children gave the container no height, so its overflow rule hid the
map and controls even after loading succeeded.

- MapLibre CSS now loads before application overrides in the main entry. The map
  container uses a more specific selector that remains absolute in either load order.
- Two tests combine the actual application/vendor stylesheets and check computed
  container positioning in both orders. `npm run check` passes: 22 tests, lint,
  TypeScript, and the production build, including worker/data artifact checks.
- In the local production preview at 380 × 600, the map, streets, colored
  footprints, controls, and attribution are visible. Clicking 77 West Wacker
  opens its details with OSM identifier `osm:way/64391028`. This is a focused
  verification of the reported bug; the broader acceptance checklist remains pending.
- The hosted correction is pending: Sites returned `project_not_found` for the
  existing configured project, and discovery returned no accessible owned/editable
  sites. The project identifier and existing deployment were left unchanged.

## Phase 03 evidence

Executed on 2026-09-07 (America/Chicago). This pass used the actual local application in the Codex in-app browser, real WebGL rendering, and the unchanged pilot data. Browser observations below supersede the corresponding pending smoke checks above; they do not imply the entire Phase 01 failure/permission matrix was tested.

### Automated checks

- `npm run check`: passed ESLint without warnings, 29 Vitest tests, strict TypeScript, and the production build. The known MapLibre renderer chunk-size advisory remains (~999 kB renderer, ~486 kB worker, ~161 kB application entry); it is not suppressed.
- The original two stylesheet integration tests still pass with vendor CSS before and after application CSS. `main.tsx` retains vendor-first loading and `.map-panel > .map-canvas` retains absolute sizing.
- New integration coverage uses actual named, unnamed, longest-name, and relation records. It verifies matched source URLs, collapsed technical IDs, switching without stale facts, Escape/close/reopen identity, focus restoration, retained navigation-control focus, fresh repeated camera requests, scroll reset, and clearing on map misses/city changes.
- Map lifecycle coverage adds selected-footprint recentering during resize and listener cleanup. Dataset validation covers raw claim labels and checksums used by the panel.
- `.venv/bin/python -m unittest discover -s pipelines/openstreetmap -p 'test_*.py' -v`: all seven import tests passed.
- `.venv/bin/python pipelines/openstreetmap/import_buildings.py --check`: passed, byte-identical cached rebuild; 345 records, 161 names, 13 excluded source records. No dataset acquisition or artifact changes.
- Build verification confirmed the self-contained worker, pilot GeoJSON, original OSM source/checksum, and ODbL notice. `git diff --check` passed.

### Executed browser interactions

| Case | Observed result |
| --- | --- |
| Desktop, 1440 × 900 | Real streets/labels, pilot footprints and boundary, map controls and attribution are visible. The canvas occupies 1110 × 900 beside the 330 px sidebar. |
| Adjacent map clicks | Clicking LaSalle - Wacker Building then neighboring OneEleven changes the title and source to the corresponding record (`way/124873924` → `way/124865463`); the title receives focus. |
| Named and unnamed | 77 West Wacker links to `way/64391028`; unnamed pilot records show explicit absent-name copy and their own source links, including `way/159470988` and `way/231382211`. The old record's facts/expanded details do not persist. |
| Keyboard entry and switching | Enter on Browse opens a real pilot record and focuses its heading. Enter on Next/Previous switches records while focus stays on that button. Escape closes and returns focus to Reopen; Enter reopens the same record. |
| Source details | Expanding details for George W. Dunne Cook County Administration Building shows `osm:way/124865434`, its canonical UUID, raw `tags.name`, snapshot timestamp, checksum and source downloads. Direct source hrefs match the displayed record and include new-tab safety attributes. |
| Scroll/refocus | Mobile panel body scrolls to sources and technical details while close/navigation stay visible. Focus building details scrolls the body back to zero and focuses the now-visible heading. |
| Longest actual name | George W. Dunne Cook County Administration Building wraps readably at narrow widths; native picker text stays within its control and the full title is available in the body. |
| Portrait mobile, 390 × 844 and 380 × 600 | Compact bottom panel reserves a separate map area. 77 West Wacker is visibly highlighted, name/center remain readable, source content is reachable by scrolling, and next/previous, close and reopen work. |
| Narrow mobile, 320 × 568 | No horizontal overflow. After correcting overlap, canvas is 320 × 261; location control ends at y=259, expanded attribution begins at y≈267.8 and ends at y≈313.8, and the panel begins at y≈323.8. All remain separate. |
| Short landscape, 844 × 390 | Sidebar body scrolls; close/navigation stay reachable; map is 552 × 390 with controls and attribution. No page overflow. |
| Compact landscape, 600 × 400 | Layout changes to a 270 px side panel and a 330 × 400 map. Highlighted footprint, controls and expanded attribution are visible; Escape returns focus to Reopen. |
| Resizing during navigation | The pass exposed a stale flight anchor when changing viewport during a building flight. Resize handling now recenters the selected footprint; subsequent portrait/landscape changes retain the selected record and visible highlight. |
| Mobile map picking | Clicking the visible DuSable Bridgehouse footprint focuses its heading; Close returns focus to the canvas, and Reopen restores that record. |
| Browse from another city | From the settled London view (51.5072° N, 0.1276° W), keyboard Browse opens DuSable Bridgehouse, recenters at 41.8892° N, 87.6241° W, and shows the highlighted footprint with a 50 m map scale after the mobile panel resizes. No browser warning/error logs were captured in the final check. |
| Closing and city changes | Close retains selection for reopening. Choosing London clears the prior building and removes Reopen; Chicago remains available as the pilot destination. The zoom control can still be activated with the panel layout in use. |

These are real browser viewport/click/keyboard checks, not physical touchscreen tests. Native iOS/Android pickers, assistive-technology announcements, 200% browser zoom, real location permissions, and the full offline/WebGL-failure matrix remain unverified. No synthetic long-value fixture was presented as pilot data. Source links were checked against the local validated records; current OSM facts were not independently re-researched.

### Local preview and publishing

The development preview remains at `http://127.0.0.1:5173/`. A local HTTP request returned 200, and the browser loaded the map and panel.

The publishing blocker is independent of Phase 03 functionality: Sites `get_site` again returned `NOT_FOUND` / `project_not_found` for the existing project binding. No new project, source push, deployment, or hosting identifier change was made. Restore access to the configured project or choose an authorized replacement target before publishing.

See [Phase 03](PHASE_03.md) for its original fields, state semantics, source presentation, and reassessment. The following Phase 04 evidence supersedes its then-planned metadata and publishing status.

## Phase 04 evidence

Executed 2026-09-07 using the existing cache and real local application. No new dataset, runtime Overpass request, Wikidata enrichment or dependency was added. Earlier Phase 03 edits already in the working tree were preserved.

### Automated checks and import evidence

- `npm run check`: passed lint, all **36 frontend tests**, strict TypeScript and the production build. The known >500 kB MapLibre warning remains visible: renderer 998.63 kB, worker 485.82 kB, application entry 167.94 kB (55.07 kB gzip).
- Both original stylesheet-order tests still pass. Vendor-first `main.tsx` loading and `.map-panel > .map-canvas` absolute sizing remain intact.
- All **15 Python tests** pass: geometry, exclusions, canonical identity, cached equality, source-order independence, raw-tag/source correspondence, coverage, no duplicate claims, uncertain/partial/invalid dates, units, zero/fractional/malformed levels, unsafe URLs, ambiguous architect lists and conservative identifiers.
- Frontend tests validate schema v2 and real coverage, reject duplicated claims/mismatched source records/fabricated normalized values/unsafe URLs, and exercise real rich/sparse/zero-level records. Synthetic HTML-like text, uncertain dates, malformed numbers and unsafe websites render escaped as non-links; these fixtures never enter the pilot.
- Repeated cached reimport and `--check` preserve **345 buildings, 1,839 claims, 13 exclusions**, unchanged names/geometry/IDs and unchanged raw/acquisition files. Every claim matches its exact original tag and source. Source-order reversal produces identical bytes; fixture diagnostics are also reproducible.
- Production verification includes bundled worker, source checksum, derived data and ODbL notice. `git diff --check` passes. Source and acquisition files, lockfile and hosting binding have no Phase 04 changes.
- An initially incorrect website expectation in a new test was corrected to the actual cached Chicago Theatre URL, `https://www.thechicagotheatre.com`; the sourced website itself was never changed.
- During a local reload, Vite forwarded nonfatal OpenFreeMap highway-shield filter warnings about null numeric values. Streets, footprints and labels still rendered. The final inspected tab had one canvas, no loading/error card, and no captured error/warning entries; provider-style warnings are not treated as a guarantee of clean logs on every tile.

### Executed browser interactions

Real WebGL rendering was inspected in the Codex in-app browser at `http://127.0.0.1:5173/`. Browser screenshots and DOM measurements were used together; renderer mocks alone are not the evidence for these results.

| Case | Observed result |
| --- | --- |
| Desktop 1440 × 900 | Streets/labels, colored footprints, dashed pilot boundary, controls and attribution are visible. Canvas is 1110 × 900 beside the 330 px sidebar. No blank-map regression. |
| Keyboard entry | Enter on Browse opens Leo Burnett Building and focuses the heading. |
| Rich metadata | Picker #73, Six North Michigan (`way/126982631`), shows `Holabird & Roche; Schmidt, Garden & Martin`, year-precision `1899`, `86 m`, 22 levels, type and individual address components. Expanded raw details retain `Holabird & Roche;Schmidt, Garden & Martin`, exact tag names, source ID, checksum and downloads. |
| Full date / website / heritage | Chicago Theatre (`way/124873919`) shows `1921-10-26` with day precision, six levels, its actual cached website, unresolved Q642866 and `heritage=yes` as registration with unspecified level. All attribute source links match that OSM record. Website href and new-tab safety attributes match the validated cached claim. |
| Source navigation | Activating the Chicago Theatre start-date source link opens a new tab whose URL and page heading identify OSM way 124873919. No source edits or additional dataset acquisitions. |
| Sparse metadata and switching | Picker #6, unnamed `way/234052883`, shows only the unspecified building type and explicit missing architect/date/style copy. Switching from the rich record clears its values, collapses raw details and resets content scroll to zero; the source link updates to the sparse record. |
| Zero levels | Goodman Theatre Center (`way/145208575`) displays a recorded zero, with no underground-building inference or fabricated height. |
| Next / Escape / reopen | Enter on Next switches the sparse record to Bataan-Corregidor Memorial Bridgehouse and keeps focus on Next. Escape closes the panel and focuses Reopen; Enter reopens the same record and focuses its heading. |
| Native picker keyboard | Arrow navigation and Enter commit a real picker selection while focus stays on SELECT. Escape first cancels an open native popup; another Escape closes the panel and returns focus to Reopen. |
| Portrait 390 × 844 | The rich panel scrolls to architect text, dates, sources and raw disclosure. Close/picker remain visible and fixed outside the scroll body. Canvas is 390 × 418; panel begins at y≈481.1. Selected footprint and expanded attribution remain visible. |
| Refocus while scrolled | Focus building details returns content scroll to zero and focuses H2, including after reading deep raw claims on mobile. |
| Deep source navigation regression | Browser verification found hidden new-tab labels expanding the outer sidebar scroll range and clipping Close when deep content received focus. The scrolling body now contains those absolute labels. Repeating checksum/source navigation at 1440 × 900, 844 × 390 and 390 × 844 keeps outer sidebar scroll at zero and Close fully visible; rich attributes were rechecked at 320 × 568. |
| Narrow 320 × 568 | Canvas is 320 × 261; location control ends at y=259, attribution occupies y≈267.8–313.8, and panel begins at y≈323.8. No page horizontal overflow or control/attribution overlap. |
| Mobile map picking | A visible footprint click switches from Goodman to Chicago Title & Trust Building and focuses H2. Close returns focus to CANVAS; Reopen restores that selection. |
| Portrait 380 × 600 | Sparse unnamed title, absent-name text, fixed picker/close and scrolling body remain usable; map and attribution stay above the panel. Escape/reopen works. |
| Compact landscape 600 × 400 | A 270 px panel and 330 × 400 map remain side by side. The longest actual name, George W. Dunne Cook County Administration Building, wraps without horizontal overflow; selected footprint, close, navigation and attribution are visible. |
| Short landscape 844 × 390 | Canvas is 552 × 390. Chicago Theatre's full date and source link remain readable in the scrolled sidebar, with fixed close/navigation and visible map controls/attribution; no page horizontal overflow. |

All edge-case parser fixtures are automated-test data; the browser pass uses actual pilot records. There are no approximate or malformed dates/heights/websites in the current supported pilot tags, so those cases are not claimed as naturally occurring browser examples. Physical touchscreen interaction, screen-reader announcements, 200% browser zoom, real location permissions and the full earlier offline/WebGL-failure matrix remain unverified.

### Local preview and publishing

The existing local preview remains running at `http://127.0.0.1:5173/`; HTTP and real map/panel checks passed. A Phase 04 Sites lookup succeeded for the unchanged project binding and confirmed owner-only access. The earlier `project_not_found` blocker did not recur. No deployment was requested/performed in this Phase 04 implementation task; source push and end-to-end publishing are unverified. No replacement project or binding change was made.

See [Phase 04 semantics, coverage and stop point](PHASE_04.md). Phase 05 remains planned.
