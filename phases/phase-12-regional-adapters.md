# Phase 12 — One regional data adapter

Status: **Planned**

## Objective and prerequisites

Demonstrate that a new regional source can enrich the catalog without rewriting existing application behavior. Require stable source/claim contracts and review existing adapters, matching rules, import operations, and the pilot's concrete information gaps.

## Agent prompt

Select one useful, openly reusable regional dataset, preferably covering the existing pilot. Inspect its authoritative documentation, download/access method, geographic coverage, license, update cadence, identifiers, and field definitions. Confirm that buildings, parcels, addresses, and heritage designations are not being treated as interchangeable entities. Recommend the source because it supplies a real missing capability, then implement that bounded adapter.

Give the adapter a concise source declaration: dataset, geography, license and attribution, source URL, version or retrieval date, expected cadence, imported fields, and matching method. Preserve raw records or reproducible references, normalize into the established source contract, and report import diagnostics. Prefer explicit external identifiers for resolution. When matching requires location or text evidence, record the candidate evidence and leave ambiguous matches unresolved.

Ensure reruns are idempotent, updated source claims retain appropriate history, and a source record disappearing does not silently erase unrelated canonical information. Keep source acquisition and parsing isolated from shared entity resolution and display selection. Document how to reproduce the pilot import and inspect unmatched or rejected records.

## Decisions and defaults

Extract shared adapter interfaces from working implementations instead of designing a speculative plugin framework. Use existing Python tools; introduce DuckDB, GeoPandas, Shapely, or other processing dependencies only when the selected format or measured workload needs them. Use PMTiles only when a real geometry-delivery requirement warrants it.

## Out of scope

Multiple simultaneous connectors, worldwide ingestion, scheduled infrastructure without an update need, automatic ambiguous merges, and commercial datasets without reuse rights.

## Acceptance checks

- Source terms, field semantics, and attribution are documented accurately.
- A bounded import is reproducible and stable across reruns.
- Matched, unmatched, malformed, updated, and withdrawn records are handled clearly.
- Existing source claims and application flows continue working.
- Added coverage and remaining gaps are measured.

## Record and reassess

Document the adapter contract, mapping rationale, operational costs, and update behavior. Stop after one verified connector. Choose a later discovery feature based on actual catalog coverage and user value.
