# Phase 05 — Wikidata enrichment and architect entities

Status: **Planned**

## Objective and prerequisites

Connect known buildings to evidence-backed architect and firm entities without guessing identity. Require phase 04 provenance and stable building identifiers. Review actual OSM Wikidata references and pilot gaps before selecting an enrichment batch.

## Agent prompt

Implement a bounded, cached Wikidata enrichment workflow using explicit identifiers first. Import relevant architect/firm relationships, styles, date claims, official links, and external identifiers only when their source semantics are understood. Retain Wikidata statement references, qualifiers, rank, and claim identity where they affect interpretation. Preserve disagreement with existing sources rather than overwriting claims.

Create stable internal identities for people and organizations, with namespaced Wikidata IDs where known. Model building-to-contributor relationships with an explicit role so architect, firm, engineer, and developer are not interchangeable. Preserve multiple credited designers and source uncertainty. Expose clickable architect entries with a minimal functional identity view that phase 06 will expand; do not add dead links.

Use deterministic matching from explicit references. Treat name similarity, spatial proximity, and other heuristic matches as unresolved candidates requiring evidence. Bound requests, cache results, and document rerun behavior and service usage constraints. Derive short factual summaries only from sourced structured values; do not assume Wikidata licenses Wikipedia biographies or website text for reuse.

## Decisions and defaults

Start with a small allowlisted set of pilot entities. Keep source acquisition separate from canonical resolution and displayed facts. If persistent relationships now justify a service, document the concrete need and introduce the smallest modular FastAPI/PostgreSQL/PostGIS slice needed; otherwise retain the existing delivery path. Explain each new dependency before installation.

## Out of scope

Whole-Wikidata ingestion, biographies scraped from external websites, speculative merges, global completeness, and a graph database.

## Acceptance checks

- Explicitly linked buildings resolve to the correct person or organization.
- Multiple designers, roles, qualifiers, and conflicting dates remain distinguishable.
- Ambiguous matches do not become canonical automatically.
- Reimport preserves stable identities and traceable claims.
- Architect links open a real, honest entity view.

## Record and reassess

Document mapping rules, cached input provenance, matching confidence semantics, unresolved candidates, and entity coverage. Stop after inspecting representative enriched buildings. Reassess relationships and data access needs before expanding architect pages.
