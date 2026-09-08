# Phase 04 — OpenStreetMap architecture metadata

Status: **Implemented; import checks and local desktop/mobile browser verification passed** — see [Phase 04 report](../docs/PHASE_04.md) for semantics, coverage, and publishing status. Phase 05 remains planned.

## Objective and prerequisites

Expose useful architecture attributes actually present in the pilot's OpenStreetMap data. Require stable selected buildings, a working information panel, and provenance storage. Inspect the current source adapter and observed tag coverage before extending ingestion.

## Agent prompt

Extend or add one bounded OSM import that preserves relevant tags such as `architect`, `architect:wikidata`, `start_date`, `building:architecture`, `building`, `height`, `building:levels`, `website`, and applicable engineer tags. Verify current tag semantics against primary OSM documentation. Record the source record and raw value for every imported claim.

Normalize only where semantics are clear. Keep approximate, partial, and ranged dates representable; do not relabel `start_date` universally as a verified completion year. Handle units and malformed height/floor values without silently fabricating numbers. Treat architect text as an attributed source claim until a later phase resolves it to a stable person or firm entity. Parse external identifiers conservatively and validate outbound website URLs.

Use reproducible cached input for the bounded pilot, with acquisition instructions and import diagnostics for unsupported or invalid values. If pilot data originated in Overture, prefer explicit cross-reference identifiers before spatial matching; document ambiguous cases without forcing a match. Publish basic coverage statistics so sparse metadata is understood as data coverage, not an application failure.

## Decisions and defaults

Reuse existing ingestion tools where practical. Public Overpass can support a small, explicit investigation but is neither mandatory nor the application's online backend. Move to versioned extracts or indexed storage when measured import size, request reliability, or query requirements justify it. Preserve OSM licensing and attribution separately from the application license.

## Out of scope

Global crawling, automatic architect identification from names alone, broad fuzzy matching, replacing source claims with normalized values, and elaborate orchestration.

## Acceptance checks

- Representative tags display with links to their source records.
- Missing, malformed, multivalue, unit-bearing, and approximate-date inputs behave honestly.
- Reimport is reproducible and does not create duplicate claims.
- Ambiguous cross-source matches remain unresolved.
- The panel and map remain usable when architecture metadata is sparse.

## Record and reassess

Document supported semantics, pilot coverage, invalid-input handling, and extract/update procedures. Stop when the bounded enrichment works. Reassess identifier quality and observed coverage before selecting Wikidata enrichment targets.
