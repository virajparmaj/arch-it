# Phase 10 — Provenance presentation and conflict review

Status: **Planned**

## Objective and prerequisites

Make the provenance retained since phase 02 understandable and inspectable, especially when sources disagree. Require imported claims from earlier phases and review actual source records, identifiers, normalization rules, and current displayed-value decisions.

## Agent prompt

Build a field-level source view that explains where each important displayed fact originated. Show available source name, record link, retrieval time, license, original value, and meaningful qualifiers. Allow visitors to inspect alternative claims for the same property without losing context. Distinguish a source's assertion from the application's selected display value.

Define a small, documented preferred-value policy grounded in actual pilot data. Preserve all claims when values disagree. Do not invent numerical confidence scores or call records verified unless a clear verification process supports that label. Distinguish source rank, matching confidence, recency, and human review rather than collapsing them into one vague confidence measure.

Make date uncertainty, unit normalization, multivalue relationships, and source removal explainable. Support at least one real or clearly labeled test disagreement so the review UI is verified. Ensure source identifiers remain available even when external links stop working. Review earlier imports for missing provenance and correct the ingestion path with reproducible evidence; never fabricate historical retrieval dates or license details.

## Decisions and defaults

This phase improves presentation and review; it does not introduce provenance for the first time. Extend the existing claim model only where real data exposes a gap. Keep source records, canonical identity matches, claims, and displayed values separate. Use the current backend or static delivery until an actual editing/query requirement justifies more infrastructure.

## Out of scope

Public moderation accounts, automated truth scoring, mass retroactive verification, overwriting inconvenient claims, and a general-purpose knowledge-graph platform.

## Acceptance checks

- Important facts lead to the correct original source information.
- Disagreeing years or designers remain separately inspectable.
- Preferred-value explanations reproduce the displayed choice.
- Unknown provenance and unverified status remain explicit.
- Reimport does not discard prior claims or duplicate identities.

## Record and reassess

Document selection rules, evidence gaps, review semantics, and representative conflicts. Stop after claim inspection works. Assess the minimum authorization, moderation, and storage requirements before accepting public contributions.
