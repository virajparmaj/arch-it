# Phase 07 — Search the known catalog

Status: **Planned**

## Objective and prerequisites

Help visitors find known buildings, places or addresses, and architects without implying global metadata coverage. Require a working discovery loop and inspect actual record count, supported address fields, routing, and storage before choosing a search implementation.

## Agent prompt

Implement a visible search experience for the current catalog. Start with building names, known place/address values, and architect names. Distinguish result types, show enough location context to disambiguate duplicates, and navigate to the corresponding building or architect reliably. Display an honest empty result and explain the supported geographic and metadata coverage.

Support ordinary typing, clearing, keyboard selection, mobile use, accents, and common punctuation. Bound query length and result count. Handle loading and request failure if search is remote; prevent older responses from replacing newer results. Preserve understandable browser navigation and a usable map when no result is found.

Choose the smallest implementation supported by measured catalog size. For a small static pilot, a straightforward local index is acceptable. If the project now requires server-side search, use the existing PostgreSQL foundation, beginning with full-text search and `pg_trgm` only where concrete query behavior benefits. Do not silently send searches or addresses to an external geocoder. Any broader place lookup requires an explicit provider choice, usage review, and clear scope.

## Decisions and defaults

Use typed result contracts and existing routes. Add firm, style, use, and combined filtering only after the first search categories work and their underlying data exists. Record relevant query/index performance before increasing infrastructure. Explain any search dependency or database extension by the specific behavior it enables.

## Out of scope

Elasticsearch/OpenSearch, natural-language query interpretation, unsupported global place coverage, personalized ranking, and a search analytics platform.

## Acceptance checks

- Known names and supported addresses return the correct entity types.
- Duplicate names, accents, empty input, no matches, and long queries behave clearly.
- Keyboard and mobile result selection work.
- Rapid query changes and remote failures do not show stale results.
- Representative query performance meets a documented pilot target.

## Record and reassess

Document indexed fields, matching behavior, coverage, limitations, and query measurements. Stop after the initial categories work. Reassess licensing and content attribution before introducing photos.
