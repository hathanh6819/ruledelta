# Source evidence

## Selected source

RuleDelta uses the public Federal Register API:

```text
https://www.federalregister.gov/api/v1/documents/{document_number}.json
```

The official API documentation states that API keys are not required. The source is publicly readable in a browser or HTTP client. Federal Register material may be reproduced without restriction under 1 CFR 2.6.

## Why this is reproducible

The pinned pair is the FTC Non-Compete Clause Rule:

| Field | Proposed | Final |
| --- | --- | --- |
| Document number | `2023-00414` | `2024-09171` |
| Type | `Proposed Rule` | `Rule` |
| Publication date | `2023-01-19` | `2024-05-07` |
| Agency slug | `federal-trade-commission` | `federal-trade-commission` |
| RIN | `3084-AB74` | `3084-AB74` |
| Official PDF host | `www.govinfo.gov` | `www.govinfo.gov` |

The API JSON includes volatile fields such as page-view counts. Hashing raw response bytes would therefore create false mismatches. The contract instead constructs and hashes a stable projection containing only document number, type, title, abstract, action, publication date, sorted agency slugs, sorted RINs, and official PDF URL.

## Explicitly excluded source

The API exposes `raw_text_url`, but on 2026-09-25 automated requests to those FederalRegister.gov full-text endpoints returned an HTML `Request Access` page rather than the regulation text. RuleDelta does not pretend this source passed. It does not hash or semantically assess that blocked response.

The comparison is deliberately scoped to the official API metadata and abstract. The certificate describes that scope and must not be represented as a full legal redline. The GovInfo PDF URL is identity-checked, but the large PDFs are not downloaded by validators.

## Preflight rule

The main registry must not be deployed until `FederalRegisterSourceProbe.probe_pair()` finalizes successfully on the target network. Its result includes each document number, type, response length, stable-projection SHA-256 and RIN. Preserve the probe contract and transaction links in the release evidence.

## Prompt-injection boundary

All source text is labelled inert evidence. Users cannot submit URLs or evidence bodies. The contract locks the comparison question at job creation, uses a strict response schema, checks outcome/boolean invariants, and requires comparative validator agreement on the stable projection digests and verdict.
