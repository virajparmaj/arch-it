# Phase 04 — OSM architecture metadata

Status: **Implemented; import, application checks, and actual desktop/mobile browser verification passed** on 2026-09-07. This milestone stops at Phase 04. No new dataset, runtime Overpass request, Wikidata enrichment, dependency, identity matching, or architect page was introduced.

## Delivered data boundary

The existing offline importer reads the unchanged cached OSM response and acquisition manifest. It still accepts 345 complete footprints from 358 source records, excludes the same 13 boundary-crossing records, preserves canonical UUIDs and geometry, and retains 161 names / 184 unnamed buildings. Snapshot: `2026-09-07T03:45:20Z`; acquired `2026-09-07T03:46:29.803777Z`.

Schema version 2 contains **1,839 claims**, one per supported tag per source record. Each claim retains the exact raw string in `value`, the OSM tag in `raw_property`, and `source_id` / `source_record_id`. The building supplies its pinned OSM record URL; the shared source manifest supplies snapshot time, acquisition time, original download and checksum. Display normalization is separate in `normalized`, with `status` (`normalized`, `raw_only`, or `invalid`) and an explanation in `note`. “Normalized” means parsed/trimmed, not independently verified. Names and identifiers never establish canonical people, firms, relationships, or cross-source matches.

The raw response is 456,849 bytes with SHA-256 `47f5be154fecae986daad73793947e53de7627d94bab1d08bf707934678adb6a`. The derived artifact is 745,952 bytes, SHA-256 `2e278dce89682f33203c04dd636e6d651e4878ddf052a54dccea6d454f41bbe2`. Both ship with the ODbL notice. The browser requests only the derived file during normal use; original-source download remains explicit.

## Supported semantics and primary references

Primary OSM Wiki documentation was checked on 2026-09-07. Tag documentation explains contributors' intended semantics, not the correctness of any individual record.

| Tags | Import and display policy |
| --- | --- |
| `name` | Preserve the string; trim outer whitespace for the title. Missing/blank display name remains null and renders “Unnamed building.” |
| `architect` | Person or firm attribution as OSM text. Split only semicolons into ordered strings; never split commas, ampersands, slashes or “and.” Empty list entries retain the whole raw string with a diagnostic. No contributor identities or name-to-ID pairing. [OSM architect](https://wiki.openstreetmap.org/wiki/Key:architect) |
| `architect:wikidata`, `engineer:wikidata`, `wikidata` | Accept only complete semicolon-separated `Q[1-9][0-9]*` tokens, preserving order and raw text. Display as unresolved OSM identifiers, without automatic links, lookups, merging or positional assignment to names. Invalid lists remain raw. [Architect identifiers](https://wiki.openstreetmap.org/wiki/Key:architect:wikidata), [Wikidata tagging](https://wiki.openstreetmap.org/wiki/Key:wikidata) |
| `start_date` | Label as recorded start date; it may concern opening or construction completion. Calendar-valid `YYYY`, `YYYY-MM`, and `YYYY-MM-DD` retain year/month/day precision, including zero-padded years. Never fill a missing month/day or call it a verified completion year. Approximate, decade, century, qualified, ranged, unsupported and invalid-calendar strings remain representable as raw text with no fabricated exact date. [Start date](https://wiki.openstreetmap.org/wiki/Key:start_date) |
| `building`, `building:use` | Keep building type separate from present use. `building=yes` displays an unspecified type. `roof` remains a roof classification, not an inferred occupied building. Other recorded values stay textual. [Building](https://wiki.openstreetmap.org/wiki/Key:building), [Present use](https://wiki.openstreetmap.org/wiki/Key:building:use) |
| `building:architecture` | A style claim; split semicolons in source order. No style inferred from names or appearance. [Architectural style](https://wiki.openstreetmap.org/wiki/Key:building:architecture) |
| `height` | Positive finite bare decimal numbers mean metres; explicit ` m` is supported. OSM feet/inches notation (`7'4"`, `10'`) converts using 0.3048 m/foot and 0.0254 m/inch; inches must be below 12. OSM height includes the roof and excludes rooftop equipment. Unsupported units, negative/zero values, commas, ranges, numeric prefixes, exponents and nonfinite/overflow values remain raw, with no numeric height. No inferred levels or 3D geometry. [Height](https://wiki.openstreetmap.org/wiki/Key:height) |
| `building:levels` | Nonnegative integer strings, up to 15 digits for exact JavaScript representation. Above-ground non-roof storeys; no basement/roof addition, fractional rounding or inference from height. Zero is retained, without inferring that a particular pilot structure is underground. Unsupported strings remain raw. [Building levels](https://wiki.openstreetmap.org/wiki/Key:building:levels) |
| `website`, `contact:website` | Preserve separate claims even though the keys are synonymous. Only explicit absolute HTTP(S) links with an ASCII hostname, valid optional port, and no credentials are activated. Reject ambiguous semicolons, internal whitespace, backslashes, control characters (also percent-encoded), unsupported schemes and malformed authorities. Surrounding whitespace may be trimmed separately from the raw value. IDN/IPv6/unsupported syntax stays text. No scheme guessing, URL-list guessing, fetching, or reachability/safety certification. Links use `noopener noreferrer` and announce a new tab. [Website](https://wiki.openstreetmap.org/wiki/Key:website), [Contact website](https://wiki.openstreetmap.org/wiki/Key:contact:website) |
| `engineer` | Preserve as raw with an unresolved-role note: the key can denote a person/firm or an engineering specialty for an office. No automatic architectural attribution. [Engineer](https://wiki.openstreetmap.org/wiki/Key:engineer) |
| `addr:full`, `addr:housenumber`, `addr:street`, `addr:unit`, `addr:postcode`, `addr:city`, `addr:state`, `addr:country` | Separate sourced text fields; preserve house-number ranges, leading zeros and full-address content. Do not geocode, parse full addresses, substitute the centroid, or fill missing components from the Chicago navigation context. [Address tags](https://wiki.openstreetmap.org/wiki/Key:addr:*) |
| `heritage` | `yes` is shown as a registration claim with unspecified level. Other values remain source text; numeric values are not ratings. No inferred designation, registry membership, current legal protection or independent verification. [Heritage](https://wiki.openstreetmap.org/wiki/Key:heritage) |

Missing tags produce no claim. Empty strings produce an invalid claim with unchanged raw text and no normalized value. Other unsupported number/date/URL forms remain `raw_only`; this deliberately does not claim every unparsed string is wrong. Diagnostics contain the original value, tag and source record. Unexpected non-string OSM tag values cause an explicit record exclusion, not a coerced string. Only supported tags enter the claim set; all other tags remain in the downloadable source.

## Actual coverage

The denominator is **345 accepted footprints**, not all 358 source elements and not all physical buildings in Chicago. `metadata.tag_coverage` records present/normalized/raw-only/invalid counts, including zeros. The current cache has zero raw-only/invalid claims among supported tags; uncertain and malformed cases are covered with tests, not injected pilot examples.

| Tag | Buildings | Coverage |
| --- | ---: | ---: |
| `building` | 345 | 100% |
| `name` | 161 | 46.7% |
| `architect` | 9 | 2.6% |
| `start_date` | 10 | 2.9% |
| `height` | 46 | 13.3% |
| `building:levels` | 183 | 53.0% |
| `building:use` | 6 | 1.7% |
| `website` | 26 | 7.5% |
| `wikidata` | 59 | 17.1% |
| `heritage` | 3 | 0.9% |
| `addr:housenumber` | 198 | 57.4% |
| `addr:street` | 214 | 62.0% |
| `addr:postcode` | 212 | 61.4% |
| `addr:city` | 183 | 53.0% |
| `addr:state` | 182 | 52.8% |
| `addr:unit`, `addr:country` | 1 each | 0.3% each |
| `architect:wikidata`, `building:architecture`, `engineer`, `engineer:wikidata`, `contact:website`, `addr:full` | 0 each | 0% |

Of the architect strings, one contains semicolons: Six North Michigan has `Holabird & Roche;Schmidt, Garden & Martin`. This remains one sourced claim with two display strings, not two resolved contributors. Nine dates have year precision; Chicago Theatre has the sole full date, `1921-10-26`. Three heights carry explicit metres (`86 m`, `91 m`, `61.5 m`); 43 are bare numeric strings. Two level counts are `0` (Goodman Theatre Center and The Sterling). All 26 websites pass the conservative link policy. The six current-use tags are five `office` and one `shop`. All three heritage values are `yes`.

There are 64 `building=yes` records and 80 `building=roof` records. Twenty-one records have only a `building` tag in the entire raw source. Missing metadata therefore remains an expected panel state. The panel displays per-building missing architect/date/style copy and pilot architect/date coverage.

Four Q identifiers each occur on two distinct accepted footprints: `Q295396`, `Q786387`, `Q3050972`, `Q5087018`. They remain separate records with unresolved source assertions. This pilot is directly OSM-sourced; no Overture spatial/cross-source matching is performed. Surprising sourced dimensions are also unchanged: the cached Trump record says height `60` and levels `18`, without correction from external knowledge.

Other observed tags deliberately remain raw-only in the original response, outside the imported claim set: `wikipedia` (53), `ref:nrhp` (11), material/colour/roof tags, `historic` (2), and `addr:housename` (3). An address-like `designation` and misspelled `ref:nhrp`/`rnhp` tags are not promoted or aliased to heritage designations.

## Reimport, verification, and stop point

Use [the offline rebuild procedure](../pipelines/openstreetmap/README.md). Each run reconstructs the whole derived artifact from cache, rather than appending claims. Ordering, source references, UUIDs and raw values are stable. `--check` and the test suite compare exact serialized bytes; reversing input order yields the same artifact. Invalid/unsupported fixture tags yield reproducible diagnostics and one claim per tag. The source and acquisition files remain unchanged.

The panel extends the existing component, scrolling body and controls. Blank-map CSS import order/specific sizing, selection visibility separation, camera/resize handling, keyboard navigation and focus effects are preserved. It remains a nonmodal desktop sidebar/mobile panel. Source links are present beside each attribute, and the disclosure contains every unchanged raw claim and record reference. Browser verification caught absolute screen-reader labels expanding the outer sidebar's scroll range during deep source navigation; positioning the content body as their containing block fixes the clipping while keeping the existing controls and layout.

All 36 frontend tests and 15 Python tests pass, as do lint, strict TypeScript, production build, worker/data/license validation, cached reimport and whitespace checks. See [executed browser verification](VERIFICATION.md#phase-04-evidence) for actual rich/sparse records, map clicks, source navigation, Escape, native picker, refocus, and six viewport sizes. Physical touch hardware, screen readers and the earlier full location/offline/WebGL failure matrix remain outside this browser pass.

Phase 05 is still planned and requires a separate request. Architect text is sparse and no architect Q identifiers are present; repeated building Q identifiers need review before any future identity decisions. No Wikidata requests or enrichment targets were executed.

## Local preview and publishing status

The local development preview remains working at `http://127.0.0.1:5173/`. A fresh Sites lookup during Phase 04 succeeded for the unchanged binding and reported owner-only access. The earlier Phase 03 `project_not_found` result is historical, not a current verified blocker. This task requested implementation and local verification; no source push or deployment was performed. End-to-end publishing remains unverified. The code-license decision and known renderer size advisory remain separate from local functionality.
