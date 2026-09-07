# Phase 08 — Licensed building photos

Status: **Planned**

## Objective and prerequisites

Show real building photos with usable attribution and a clear connection to the selected building. Require working source identities and provenance; inspect available Wikimedia Commons references before choosing a small pilot set.

## Agent prompt

Integrate a bounded Wikimedia Commons photo workflow, preferring explicit image references from existing source records. For each image preserve the source page, file reference, creator attribution, license name and link, and any reuse conditions that need to be displayed. Treat image association as a sourced claim; do not infer a building's identity solely from a filename or nearby coordinates.

Show a useful photo or small gallery in the building panel and existing entity pages where appropriate. Use suitable thumbnail sizes, stable layout dimensions, accessible descriptions, lazy loading where it benefits the experience, and a clear unavailable-image state. Make attribution and the original source easy to reach. Avoid loading a full-resolution original when a smaller preview meets the UI need.

Read current Commons primary documentation for metadata, image URLs, API etiquette, and attribution. Cache only what the selected usage and licensing permit. Handle missing creators, uncertain license metadata, removed files, and broken thumbnails honestly. Do not publish an image until its reuse conditions are understood. Document that Commons file licenses are individual; a source platform name alone is not a license.

## Decisions and defaults

Use Commons first because explicit open-license metadata can support accountable reuse. The application code license does not cover imported media. Keep image metadata in the existing source model. A dedicated image service or processing library is unnecessary unless the measured delivery path demands it.

## Out of scope

Scraping architecture magazine or firm images, rehosting copyrighted descriptions, user uploads, camera recognition, street-view integrations, and unlicensed placeholder imagery.

## Acceptance checks

- Every displayed image has a correct building association and readable attribution.
- Creator, license, and original source links match inspected metadata.
- Broken, missing, and slow images leave the building details usable.
- Thumbnails fit mobile and desktop without layout jumps.
- No unsupported media rights are implied.

## Record and reassess

Document supported media fields, association evidence, attribution UI, and refresh/removal behavior. Stop after the licensed pilot gallery works. Reassess available height data before enabling 3D.
