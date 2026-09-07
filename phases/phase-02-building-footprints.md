# Phase 02 — Clickable building footprints

Status: **Planned**

## Objective and prerequisites

Turn map exploration into selecting individual buildings within one documented pilot area. Require a verified phase 01 map. Chicago is the provisional pilot because it supports the initial view, but validate footprint availability, download size, licensing, and useful identifiers before committing to a source or boundary.

## Agent prompt

Inspect the application, then compare a bounded OpenStreetMap extract with a bounded Overture Buildings extract using current primary documentation and a small sample. Recommend and implement the smallest reproducible dataset path that supports useful polygon selection. Favor a cached, versioned, geographically bounded extract. Public Overpass access is optional for limited investigation and must not be a runtime dependency or assumed production pipeline.

Add a real building layer with a clear selection state. On selection, show a stable internal building ID, centroid coordinates, geometry availability, any sourced name, and namespaced external identifiers. Distinguish these canonical pilot records from decorative basemap buildings. Show honest coverage boundaries and a clear result for clicks outside the supported dataset.

Begin source provenance now: record source dataset and record identifier, source URL, retrieval time, license, and raw imported values independently of display values. Preserve source identity across reruns. Keep absent names absent and retain conflicting claims separately. Document acquisition and transformation so the sample can be regenerated without hand edits.

## Decisions and defaults

A small static artifact is acceptable until measured size or query needs require a service. Do not identify buildings by names, coordinates alone, or unstable basemap feature IDs. Add only the processing dependency needed by the selected input format, explaining its purpose. Keep any later FastAPI/PostGIS migration grounded in actual data and spatial-query requirements.

## Out of scope

Global downloads, sophisticated entity resolution, live metadata services, architect inference, full information panels, and mandatory public endpoint calls.

## Acceptance checks

- Multiple adjacent buildings select reliably at relevant zoom levels.
- IDs remain stable after reimport; source ID namespaces distinguish OSM ways and relations.
- Geometry, coordinate order, coverage, and available names match inspected source records.
- Reproduction steps and attribution are complete; unknown values are not invented.
- Map controls and responsive behavior still work.

## Record and reassess

Record the chosen dataset, bounding area, version, size, license, and limitations. Mark complete only after running the documented path. Stop and assess whether the data contract is sufficient for phase 03.
