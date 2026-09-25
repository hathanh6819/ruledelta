# Security and adversarial matrix

| Threat | Control | Expected result |
| --- | --- | --- |
| Arbitrary evidence URL | URLs constructed from validated document numbers | Input rejected or canonical API used |
| Path traversal | Document number regex `YYYY-NNNNN` | `INVALID_DOCUMENT_NUMBER` |
| Same document twice | Equality check | `IDENTICAL_DOCUMENTS` |
| Creator self-assessment | Sender separation | `INDEPENDENT_ASSESSOR_REQUIRED` |
| Snapshot replay | Same pair and unchanged stable digests | `SOURCE_SNAPSHOT_CURRENT` |
| Job replay | Snapshot + question + predecessor key | `COMPARISON_ALREADY_EXISTS` |
| Assessment replay | Only `OPEN` can be assessed | `ASSESSMENT_CLOSED` |
| Wrong document order/type | Exact type checks before snapshot persistence | `DOCUMENT_TYPE_MISMATCH` |
| Unrelated agency | Agency intersection required | `UNRESOLVED / AGENCY_MISMATCH` |
| Unrelated rulemaking | RIN intersection required | `UNRESOLVED / RIN_MISMATCH` |
| Impossible chronology | Final date must be later | `UNRESOLVED / CHRONOLOGY_INVALID` |
| Non-GovInfo official identity | GovInfo HTTPS prefix required | `UNRESOLVED / OFFICIAL_PDF_MISSING` |
| Missing/oversized source | Status, empty and 70 KB bound checks | `UNRESOLVED` |
| Prompt injection in evidence | Inert-evidence framing and strict schema | No authority granted to source text |
| Contradictory model output | Outcome/boolean truth table | `UNRESOLVED / MODEL_CONTRADICTION` |
| Malformed model output | Exact key set and enums | `UNRESOLVED / MODEL_SCHEMA_INVALID` |
| Validator conflict | Strict equality for anchoring; comparative consensus for assessment | No snapshot or `UNRESOLVED` |
| Source changes after anchoring | Assessment recomputes and compares both projection digests | `UNRESOLVED / SOURCE_DRIFT_REQUIRES_NEW_SNAPSHOT` |
| Stale successor | Certified predecessor plus newer same-pair snapshot required | `NEWER_SNAPSHOT_REQUIRED` |
| History rewrite | No update/delete method; revisions and successors are append-only | Prior evidence remains queryable |

RuleDelta has no payable function, token transfer, balance accounting, external contract call or custody. Economic withdrawal and reentrancy surfaces from escrow designs do not exist.
