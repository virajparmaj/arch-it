# Phase 03 — Building information panel

Status: **Implemented and browser-verified locally** on 2026-09-07. This is the historical Phase 03 milestone report. [Phase 04](PHASE_04.md) now supersedes its imported-field and publishing-status statements; the panel interaction contract below is preserved.

## Delivered scope and data conventions

`BuildingPanel` replaces the initial card with one reusable, nonmodal component. It uses a desktop sidebar, a compact bottom panel on portrait mobile, and a side-by-side layout on short landscape screens. Close and building navigation remain outside the independently scrolling content. The map reserves space for the panel, controls, and expanded attribution.

The unchanged pilot contains 345 footprints: 161 named and 184 unnamed. Main content shows the recorded display name or **Unnamed building**, Chicago pilot context, a readable footprint summary, and an approximate center. The center is explicitly not an entrance or street address. Geometry holes are described as interior holes, not verified courtyards. No basemap labels become building facts.

Missing names mean no name is recorded in the imported snapshot. Address, architect, dates, style, use, height, and heritage information are explicitly **not included in these pilot building records**; absence is not evidence that a fact is unknowable or absent from OSM. There is no per-field loading simulation: the existing dataset loading/error/retry states precede selection, and complete local records render synchronously.

A small typed `BuildingFact` renderer keeps label/value presentation reusable. No schema platform, new dependency, router, API, or ingestion change was needed.

## Selection, keyboard, and focus

- The selected record and panel visibility are separate state. Close or Escape hides details and retains the highlighted record. Reopen shows that same record. A new map hit switches selection; empty/outside/zoom-limited map clicks, city navigation, and dataset retry clear selection.
- **Browse pilot buildings** provides a keyboard entry point and starts with the record nearest the current map center. A native picker exposes all 345 records in stable artifact order, with index and coordinates to distinguish unnamed entries. Previous/next buttons stop at the ends; they are not claims of geographic adjacency.
- Explicit picker/button navigation creates a fresh camera request, including when revisiting an earlier record. Resize recenters a selected footprint at inspection zoom (at least 16), so changing the panel layout cannot leave a flight anchored to obsolete dimensions or below the selectable layer’s minimum zoom.
- Opening or picking a map footprint focuses the heading. Picker/previous/next switching retains control focus and announces the selected name and position through a polite status. Explicit refocus and record changes reset the content scroll position. Source details collapse when the record changes.
- Close returns focus to the map canvas after map selection, or the actual Browse/Reopen trigger after button activation. The panel has no focus trap; map controls and source links remain in the normal keyboard order. Escape handling is installed only while the panel is open.
- Existing reduced-motion navigation and renderer lifecycle/retry handling are preserved.

## Sources and identifiers

A prominent direct link opens the selected OSM way/relation in a new tab, with an announced new-tab label and `noopener noreferrer`. The dataset parser pins these links to the exact OSM record. License and download links use fixed trusted URLs rather than unchecked metadata URLs.

Collapsed **Source & technical details** contains canonical UUID, namespaced OSM record, dataset ID, geometry type, precise center coordinates, source snapshot time, unchanged raw name claims and their record references, original-source checksum, and downloads for normalized GeoJSON and the original OSM response. Retrieval date and ODbL attribution remain visible above the disclosure. Raw claim labels and checksum are validated before rendering; raw names remain separate from readable names.

## Verification

See the executed matrix in [VERIFICATION.md](VERIFICATION.md#phase-03-evidence). The automated suite has 29 frontend tests, including the original two real stylesheet integration tests protecting the blank-map fix. Seven Python import tests and the byte-identical cached rebuild passed. No source/derived dataset, lockfile, or hosting identifier changed.

The browser pass found and corrected small-screen attribution/control overlap and stale camera behavior while resizing during a flight. Review also corrected repeated destination requests, return focus after pointer activation, and refocusing an already-scrolled heading. Native touch hardware, screen-reader announcements, and the broader Phase 01 geolocation/network matrix remain separate follow-up coverage.

## Publishing blocker

Sites `get_site` for the unchanged `.openai/hosting.json` binding returned `NOT_FOUND` / `project_not_found`. The local preview remains available at `http://127.0.0.1:5173/`. No replacement Site was created and no deployment or binding change was attempted. Restoring access to the bound project, or explicitly choosing another deployment target, is needed to publish this work.

## Reassessment recorded before Phase 04

Inspecting only the existing cached source, among the 345 imported records: `building` occurs 345 times, `building:levels` 183, `height` 46, `architect` 9, `start_date` 10, `building:use` 6, `heritage` 3, `addr:housenumber` 198, and `addr:street` 214. These are potential future sourced attributes, not facts already imported by this phase.

Prioritize honest address assembly, building/usage semantics, and levels/heights before the sparse architecture claims. Preserve raw values and source references: `building=yes` has no specific type, `building=roof` is common, heights mix numeric and unit-bearing strings, architects can be semicolon-separated, dates vary in precision, and `heritage=yes` does not name a designation. No new dataset was fetched and none of these tags was promoted into the app in Phase 03.
