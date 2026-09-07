# Phase 11 — Evidence-backed contribution suggestions

Status: **Planned**

## Objective and prerequisites

Let visitors suggest corrections without silently altering the canonical catalog. Require a working provenance review experience and inspect current backend, deployment, and identity capabilities. Choose one minimal contribution-and-review workflow before implementation.

## Agent prompt

Implement a suggestion form for a bounded set of building facts such as architect, firm, date, style, and source reference. Capture the target building, proposed value, explanation, evidence URL, and submission status. Keep suggestions distinct from imported facts. Provide clear success, validation, duplicate-submission, and failure states so users know whether their suggestion was saved.

Build the smallest review path that supports accepting or rejecting a suggestion with an attributable decision. An accepted change should produce a sourced claim and retain the original suggestion and prior conflicting claims. Enforce reviewer authorization on the server. Add input validation, rate limits appropriate to the deployment, safe outbound-link handling, and minimal personal-data collection. Explain how users can correct or withdraw a pending submission where supported.

If no service exists, introduce a modular FastAPI backend and PostgreSQL storage only for the concrete workflow now required; add PostGIS when spatial database queries actually need it. Document schema migrations, operational configuration, secrets handling, and the chosen identity approach. If deployment access prevents a public workflow, deliver a clearly labeled local review path and state the remaining deployment requirement.

## Decisions and defaults

Prefer moderated suggestions over direct public edits. Resolve contributor-content licensing and consent before accepting material for redistribution. Avoid photo uploads initially; an evidence link keeps storage and media-rights scope bounded. Explain any authentication or mail dependency by the feature it enables.

## Out of scope

Automatic upstream OSM/Wikidata writes, reputation systems, unrestricted file uploads, anonymous canonical edits, and complex community governance.

## Acceptance checks

- Submission and review work end to end with clear persistence feedback.
- Unauthorized callers cannot review or modify canonical facts.
- Duplicate, invalid, failed, and concurrent submissions behave predictably.
- Accepted and rejected suggestions retain their audit history and source evidence.
- Personal data and secrets are handled as documented.

## Record and reassess

Document authorization boundaries, moderation rules, contribution terms, retention, and meaningful tests. Stop after the bounded workflow works. Assess whether the existing ingestion interfaces can accommodate one regional dataset.
