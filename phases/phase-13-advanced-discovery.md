# Phase 13 — One advanced discovery experience

Status: **Planned**

## Objective and prerequisites

Add one valuable discovery experience supported by the catalog that now exists. Require the core building → architect → other buildings loop, usable search, and honest provenance. Review data coverage, performance, user feedback, and open limitations before choosing a feature.

## Agent prompt

Select one bounded feature from the long-term roadmap and explain why present data can support it. Candidates include nearby buildings by architect, style exploration, architect-unknown research mode, a city or neighborhood page, a firm page, a project timeline, or a heritage layer. Define its user outcome and acceptance criteria before changing code. Do not implement the whole candidate list.

Build the chosen workflow using existing entities, queries, maps, and claim semantics. Make geographic and metadata coverage explicit. Distinguish missing information from a definitive negative result; an unknown architect means the catalog lacks supported attribution, not that the building has no architect. Preserve field-level sources when presenting grouped results or summaries.

If proximity is selected, ask for browser location only through an explicit user action, provide a location-free fallback, and avoid unnecessary location retention. If timelines are selected, preserve date uncertainty and the distinction between design, construction, and completion. If firms are selected, retain role and affiliation semantics instead of treating a firm as a person's alternate name.

## Decisions and defaults

Choose based on actual coverage and observed user value; nearby architect discovery is a candidate, not a predetermined requirement. Reuse PostgreSQL/PostGIS spatial queries where available and sufficient. Introduce new services only after measuring a specific limitation. Reassess server rendering only when discoverability and public page needs justify it.

## Out of scope

Multiple simultaneous feature families, camera recognition, speculative AI attribution, social-network systems, complex tour publishing, and planetary infrastructure assumed to be free.

## Acceptance checks

- The chosen user journey works from discovery to a sourced building detail.
- Sparse data, empty results, and ambiguous claims remain understandable.
- Relevant keyboard/mobile, request failure, and performance cases pass.
- Existing discovery, contribution, and attribution flows remain intact.
- No unsupported completeness or identity claims appear.

## Record and reassess

Document the selected feature, evidence for choosing it, coverage, performance, and any operating costs. Mark only this bounded outcome complete. Stop and propose the next milestone from demonstrated needs instead of automatically expanding the roadmap.
