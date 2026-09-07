# Phase 06 — Architect pages and the core discovery loop

Status: **Planned**

## Objective and prerequisites

Make building → architect → other buildings work end to end. Require first-class architect entities, evidenced contribution relationships, and a working building panel. Inspect the distinction between people and firms before designing public labels.

## Agent prompt

Implement a stable architect page at `/architect/[id]`, using internal identities and the application's routing conventions. Show the name, available sourced summary, relevant metadata, official reference links, and all known associated buildings in the current catalog. Include a project list and map with synchronized building selection. From a project, return the user to a meaningful building detail or map selection.

Present counts as known projects in this catalog, not an architect's complete career output. Show empty states when relationships exist without usable geometry or when an entity has no additional known buildings. Label roles and firm/person distinctions clearly. Include dates, affiliations, styles, or places only when supported by imported claims; preserve unknowns and conflicting information.

Ensure direct navigation and refresh work in the deployed static environment. Handle an unknown architect ID with a usable not-found state. Preserve sensible map context and browser back behavior while exploring between entities. Keep mobile project browsing usable even when maps are unavailable. Reuse the existing map setup rather than creating unrelated map implementations.

## Decisions and defaults

Use existing delivery and routing until actual page requirements justify a change. A router dependency may be warranted for real navigation; explain its purpose before adding it. Do not migrate from Vite solely because public pages may eventually benefit from server rendering. Use structured facts or properly licensed summaries for biography content.

## Out of scope

Comprehensive biographies, global project completeness, dedicated firm portals, recommendation algorithms, collections, and paid geocoding.

## Acceptance checks

- A selected building opens the correct architect, whose other projects open correctly.
- Direct links, refresh, back navigation, and unknown IDs behave reliably.
- Multiple credited designers and missing geometry remain understandable.
- Project counts and source references are accurate for catalog coverage.
- Desktop and mobile workflows pass appropriate checks.

## Record and reassess

Document routes, relationship queries, coverage wording, and verified discovery flows. Stop at this milestone and assess real dataset size and query patterns before choosing the first search implementation.
