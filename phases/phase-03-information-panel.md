# Phase 03 — Building information panel

Status: **Planned**

## Objective and prerequisites

Give selected buildings a coherent, accessible information surface that can grow as sources improve. Require working phase 02 selection and stable building/source identities. Inspect the pilot records and provenance contract before defining fields.

## Agent prompt

Build a reusable application-local information panel for the selected building. Present its available name or a neutral unnamed-building label, location, known attributes, source identifiers, and direct source references. Structure fields so future architect, firm, dates, style, use, dimensions, and heritage claims can be added without duplicating panel logic.

Use the actual pilot data. Distinguish unknown, unavailable, and loading values where those states exist; never fill missing data with plausible samples. Preserve raw source values separately from readable labels. Offer geometry/location context without exposing technical identifiers as the primary product experience. Include identifiers in a suitable source/details area for verification.

Support close, switching between buildings, mobile resizing, keyboard interaction, and sensible focus behavior. Ensure the panel does not obscure essential map controls or attribution. Maintain the selected-building state consistently when the panel closes and reopens. If the current application has routing, adopt its established pattern; otherwise avoid adding a routing dependency merely for this panel.

## Decisions and defaults

Use a desktop side panel and a compact mobile presentation, choosing their exact layout after inspecting the map. Keep field rendering typed and small. Surface basic source links from the provenance already introduced in phase 02. Advanced claim comparison and preferred-value editing remain phase 10; provenance visibility must not wait until then.

## Out of scope

Fetching new external datasets, inventing biographies, photo galleries, authentication, contributions, or a generic schema-driven UI platform.

## Acceptance checks

- Named and unnamed buildings both display honestly.
- Missing and unusually long values produce readable layouts.
- Switching selections never displays facts from the previous building.
- Close, focus, keyboard, touch, and responsive behavior are usable.
- Source references match the displayed building and are safe outbound links.
- Existing build and type checks pass; verify actual user interactions.

## Record and reassess

Document implemented fields, missing-data conventions, selection state, and source presentation. Record meaningful interaction checks. Stop after the panel is inspectable and identify which actual OSM tags would improve the pilot in phase 04.
