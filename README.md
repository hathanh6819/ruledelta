# RuleDelta

RuleDelta is a GenLayer regulatory comparison registry. It classifies whether a locked question appears retained, modified, removed, introduced, or absent between the official Federal Register API metadata and abstracts for a Proposed Rule and Final Rule.

It is not an escrow and has no payable method. The deployment wallet is not stored. The unified production contract anchors revisioned source snapshots, binds comparison jobs to those snapshots, and requires a different wallet to perform the independent assessment. A successful assessment publishes an immutable digest-bound, metadata/abstract-scoped certificate. It is not a full-text legal redline or legal advice. Later corrections require a newer source revision and a successor job rather than overwriting history.

## Unified architecture

1. `anchor_source_pair` fetches the canonical Federal Register pair under strict validator equality and stores only its stable digests and identity metadata.
2. `create_comparison` locks a question to one immutable snapshot revision.
3. `assess_comparison` fetches the source again, proves it still matches the anchored digests, then runs comparative semantic consensus.
4. Source drift fails closed and must be anchored as a new revision.
5. A successor can reference a certified job only when it uses a newer snapshot of the same document pair.

The separately deployed Source Probe is retained only as pre-deployment evidence. It is not trusted by, or required for, production execution.

## Contract decision

Before semantic comparison, the contract deterministically requires:

1. exact Federal Register document identities;
2. `Proposed Rule` followed by `Rule`;
3. a shared agency slug;
4. a shared RIN;
5. valid publication chronology; and
6. official PDF identities under `https://www.govinfo.gov/`.

Only then do validators compare the stable API projections against the locked question. Schema errors, contradictory booleans, source errors, and validator disagreement fail closed as `UNRESOLVED`.

## Pinned public fixture

- Proposed Rule: [`2023-00414`](https://www.federalregister.gov/api/v1/documents/2023-00414.json)
- Final Rule: [`2024-09171`](https://www.federalregister.gov/api/v1/documents/2024-09171.json)
- Agency: Federal Trade Commission
- RIN: `3084-AB74`
- Question: `Did the final rule materially change the proposed ban on worker non-compete clauses?`

FederalRegister.gov documents that its API requires no key. Federal Register material may be reproduced without restriction under 1 CFR 2.6. The exact fixture and source limitations are documented in [`docs/source-evidence.md`](docs/source-evidence.md).

## Roles

- **Deployer:** not persisted; no privileged method.
- **Anchor/creator:** any wallet anchoring a source revision and creating a job; owns no control over the verdict.
- **Independent assessor:** any different wallet may trigger GenLayer assessment.
- **Reader:** anyone may inspect jobs, certificates and totals.

The two project test wallets are never hard-coded. Reviewers can reproduce the lifecycle with any two distinct Studio Next wallets.

## Repository layout

```text
contracts/rule_delta.py                       production registry
contracts/federal_register_source_probe.py    validator source preflight
tests/test_rule_delta.py                      direct production-source tests
samples/federal-register-fixtures.json        pinned fixture identity
frontend/                                     React/Vite dApp
docs/                                         source and security documentation
```

## Verify

```powershell
powershell -ExecutionPolicy Bypass -File scripts\verify_local.ps1
```

The suite validates both contracts and the exact production source. The frontend has dedicated provider/account tests, a production build, and a public finalized write/readback check for anchoring, job creation, and independent assessment.

```powershell
cd frontend
npm test
npm run build
npm run test:live
```

## Safe release order

1. Deploy `federal_register_source_probe.py` with the main deployment wallet.
2. Call `probe_pair`; require a finalized, non-error result with the two correct document identities/types/RIN.
3. Deploy `rule_delta.py` without constructor arguments using the main wallet.
4. Confirm `get_protocol()` reports RuleDelta v2, chain `61997`, `custody: false`, and `anchored-source-revisions`.
5. Put the main contract address in `VITE_CONTRACT_ADDRESS`, rebuild and deploy the UI.
6. Use test wallet A to call `anchor_source_pair`, then create the comparison against snapshot `1`; use test wallet B to assess it.
7. Preserve every finalized transaction as a clickable Studio Next Explorer link.

This project demonstrates evidence-bound regulatory comparison and does not provide legal advice.

## Live deployment

- Production UI: [`https://ruledelta.pages.dev`](https://ruledelta.pages.dev)
- Unified RuleDelta v2: [`0x52c6803B9Dcb8d5D578E0b85dA081c181a4D0910`](https://explorer-studio-dev.genlayer.com/address/0x52c6803B9Dcb8d5D578E0b85dA081c181a4D0910)
- Source preflight: [`0x0BB07988ddEFA53908b24986E1E4ad72CC78B2A6`](https://explorer-studio-dev.genlayer.com/address/0x0BB07988ddEFA53908b24986E1E4ad72CC78B2A6)
- Complete happy-path, conflict, failure and adversarial transaction matrix: [`docs/release-evidence.md`](docs/release-evidence.md)

The production certificate is job `1`, snapshot revision `1`, with outcome `MODIFIED`, reason `SCOPE_CHANGED`, and digest `a215315d57c149fae76c39b636ec420920cbc78025bff608660141b284d5b2b6`.
