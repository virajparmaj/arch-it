# Phase 09 — Useful 3D building extrusion

Status: **Planned**

## Objective and prerequisites

Let visitors explore the pilot in 3D while communicating the limits of available building dimensions. Require reliable canonical footprints and review the actual height and floor-count claims imported in earlier phases.

## Agent prompt

Add a reversible 2D/3D view toggle using MapLibre building extrusion. Preserve the established selected-building behavior, information panel, search results, attribution, and mobile controls. Use sourced heights with documented units where available. If a floor-based estimate materially helps the prototype, document the conversion assumption and label the height as estimated; never present an assumed dimension as measured source data.

Choose an honest treatment for buildings with no usable height, such as a clearly described visual default or leaving them flat. Preserve the difference between a rendering height and a canonical building fact. Handle invalid, negative, implausible, and conflicting values without silently turning them into authoritative dimensions.

Inspect layer ordering and hit testing so selected canonical buildings remain distinguishable from the basemap's decorative 3D features. Keep camera transitions restrained and make returning to a useful 2D view straightforward. Test low-resource and mobile behavior with the actual pilot data; provide a usable 2D fallback if the feature cannot run reliably.

## Decisions and defaults

Reuse MapLibre instead of introducing a second rendering engine. Base the initial implementation on the data and performance already available. Do not assume extrusions provide accurate façades, roof forms, interiors, or surveyed dimensions. Explain any new dependency through a concrete unmet requirement; basic extrusion should not require one.

## Out of scope

Cesium, photogrammetry, BIM ingestion, indoor navigation, custom terrain processing, global 3D tiles, and invented building models.

## Acceptance checks

- Toggling 2D/3D preserves selection and usable map navigation.
- Measured, estimated, missing, and invalid dimensions are handled as documented.
- Extrusions align with canonical footprints and remain selectable.
- Attribution and essential controls remain visible.
- Representative desktop/mobile performance and fallback behavior are recorded.

## Record and reassess

Document rendering assumptions, dimension quality, device limitations, and observed performance. Stop after a useful pilot toggle. Review the accumulated claim model and disagreements before phase 10 adds advanced source presentation.
