# Phase 00 — Project and architecture foundation

Status: **Implemented; build/checks passed** — see [verification](../docs/VERIFICATION.md).

## Objective and prerequisites

Make this repository understandable, reproducible, and ready for a working map without constructing future infrastructure. Inspect the actual repository and any contributor instructions first. Preserve existing work. This phase and phase 01 form the first prototype milestone.

## Agent prompt

Establish a minimal React application with strict TypeScript and Vite under `apps/web`. Provide clear root commands for development, checks, and production builds. Keep the initial application runnable while adding its configuration. Use one package manager and commit its lockfile. Record the supported runtime, install procedure, project structure, and environment configuration in the README.

Create concise architecture documentation distinguishing implemented behavior, prototype constraints, future possibilities, and known gaps. Explain the initial browser-only application and the intended building → architect → other buildings discovery loop. Maintain this `phases/` folder as a sequence of inspectable milestones. Include appropriate ignore rules and useful coding conventions; avoid large boilerplate rule sets.

Choose routine tooling independently. Explain a major dependency before adding it and show why existing tools do not already solve the problem. Record assumptions and decisions so another contributor can continue from repository evidence.

## Decisions and defaults

Use Vite because the immediate product is an interactive browser map. Use application-local modules before shared packages. Add MapLibre in phase 01 for map rendering; no backend or database is needed for foundation work. Future persistent spatial data may justify a modular FastAPI service with PostgreSQL/PostGIS, but create neither now. Keep the code license explicitly undecided until the user chooses it; do not add MIT by assumption.

## Out of scope

Authentication, ingestion, canonical building records, shared design-system packages, queues, containers, deployment accounts, and empty future-service directories.

## Acceptance checks

- A fresh documented install can start the application.
- Type checking and the production build pass.
- Repository commands and environment guidance match the implementation.
- No committed secrets, fabricated capabilities, or unused services exist.

## Record and reassess

Update this index only after verification. Document checks performed, concrete limitations, and any decisions changed from the brief. Proceed to the authorized working-map checkpoint; stop after that first milestone rather than beginning building ingestion automatically.
