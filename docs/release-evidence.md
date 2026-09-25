# Release evidence

This file distinguishes completed local verification from live evidence that must be produced after deployment.

| Check | Status | Evidence |
| --- | --- | --- |
| Production registry lint/validation | PASS | `contracts/rule_delta.py` |
| Source probe lint/validation | PASS | `contracts/federal_register_source_probe.py` |
| Direct production-source suite | PASS | 16 tests in `tests/test_rule_delta.py` |
| Frontend typecheck/build | PASS | Vite production build |
| Public source/API-key rule | PASS | Federal Register API; no API key; fixed canonical URL |
| Probe deployment | PASS | [`0x0BB07988ddEFA53908b24986E1E4ad72CC78B2A6`](https://explorer-studio-dev.genlayer.com/address/0x0BB07988ddEFA53908b24986E1E4ad72CC78B2A6), deploy [`0xa2f666333a61ae6298c168f85ae756db1d233931b03c1b7ebb661af82008e5e6`](https://explorer-studio-dev.genlayer.com/tx/0xa2f666333a61ae6298c168f85ae756db1d233931b03c1b7ebb661af82008e5e6) finalized, GenVM SUCCESS, consensus Accepted |
| Probe execution | PASS | [`0x3d3b11dab3ad5c6dd963a2638d84c427477d1030499422dff31a6c8d8816b36c`](https://explorer-studio-dev.genlayer.com/tx/0x3d3b11dab3ad5c6dd963a2638d84c427477d1030499422dff31a6c8d8816b36c): FINALIZED, GenVM SUCCESS, consensus Accepted |
| Unified RuleDelta v2 deployment | PASS | [`0x52c6803B9Dcb8d5D578E0b85dA081c181a4D0910`](https://explorer-studio-dev.genlayer.com/address/0x52c6803B9Dcb8d5D578E0b85dA081c181a4D0910), deploy [`0x006c3cbc8ec2ab64a248a8f6f8270d217e7ebba767a784273ef2bd11351ae161`](https://explorer-studio-dev.genlayer.com/tx/0x006c3cbc8ec2ab64a248a8f6f8270d217e7ebba767a784273ef2bd11351ae161) finalized, GenVM SUCCESS, consensus Accepted |
| Two-wallet E2E | PASS | Snapshot `1`, job `1`; creator `0x1D283b...B2760`, assessor `0xf96Cf8...10aD6`; finalized state `CERTIFIED / MODIFIED / SCOPE_CHANGED` |
| Cloudflare production UI | PASS | [`https://ruledelta.pages.dev`](https://ruledelta.pages.dev), deployment `6c7d0880-deaf-4c3c-8959-5d8cf6e730f8`; public smoke test loaded finalized Studio Next state with no browser console errors |

## Live evidence template

Record clickable Studio Next Explorer links for:

1. source-probe deployment;
2. successful `probe_pair`;
3. main registry deployment;
4. creator wallet `create_comparison`;
5. independent wallet `assess_comparison`;
6. assessment replay rejection;
7. deterministic failure job;
8. conflict fail-closed job; and
9. certified successor job.

Never put private keys, seed phrases, API tokens or RPC credentials in this repository.

## Verified source-probe result

The live probe finalized on September 25, 2026 and returned the canonical pair below:

| Document | Type | RIN | Projection SHA-256 | Response bytes |
| --- | --- | --- | --- | ---: |
| `2023-00414` | Proposed Rule | `3084-AB74` | `81dd4b99f1e15783ae3b12cbb98f234d5d828ce8c3cf27e278f489dc8c0f391b` | 4,914 |
| `2024-09171` | Rule | `3084-AB74` | `09aaf5565074054d2a6ffddd8ef2503f689a803733c9ebd9e6d91eef56e9d6e4` | 5,181 |

The result proves that validators could fetch both fixed Federal Register API documents and agree exactly on their stable projections. It does not substitute for the separate semantic assessment performed by the main RuleDelta contract.

## Unified v2 live lifecycle

| Step | Transaction | Result |
| --- | --- | --- |
| Anchor source snapshot | [`0x660a3ec1889d7ec6209db74351873afd5e1edf77f5d92b86eee25499ab7c529a`](https://explorer-studio-dev.genlayer.com/tx/0x660a3ec1889d7ec6209db74351873afd5e1edf77f5d92b86eee25499ab7c529a) | Snapshot `1`, revision `1`; stable projection digests match the preflight probe |
| Create comparison | [`0xb7de1b6bef78da3fa68e4314155f9e79b74bfab4ae0c40c9eae42a1e78e48e07`](https://explorer-studio-dev.genlayer.com/tx/0xb7de1b6bef78da3fa68e4314155f9e79b74bfab4ae0c40c9eae42a1e78e48e07) | Job `1`, creator test wallet, snapshot `1` |
| Adversarial consensus attempt | [`0x55e16e40517f4f0f941f4121781cec97c4c514aa82834bf39288e1561ef88e0b`](https://explorer-studio-dev.genlayer.com/tx/0x55e16e40517f4f0f941f4121781cec97c4c514aa82834bf39288e1561ef88e0b) | Leader returned `CERTIFIED`, network result `Undetermined`; no state committed and job remained `OPEN` |
| Independent assessment retry | [`0x78bc065bcf11349af806865d75841dcbc972ffbdd274b14dacf82593cb2fa008`](https://explorer-studio-dev.genlayer.com/tx/0x78bc065bcf11349af806865d75841dcbc972ffbdd274b14dacf82593cb2fa008) | State committed as `CERTIFIED / MODIFIED / SCOPE_CHANGED` |

Final certificate digest: `a215315d57c149fae76c39b636ec420920cbc78025bff608660141b284d5b2b6`.

## Production adversarial matrix

Every transaction below finalized with `MAJORITY_AGREE`; the linked Explorer receipt exposes the quoted return value.

| Case | Expected/observed return | Transaction |
| --- | --- | --- |
| Malformed document identity | `INVALID_DOCUMENT_NUMBER` | [`0x777c6348…048b2d`](https://explorer-studio-dev.genlayer.com/tx/0x777c6348a5e0bbaaf98ca3cca43f6e538e3aef3c5cfa80840db28509d2048b2d) |
| Same document on both sides | `IDENTICAL_DOCUMENTS` | [`0x56d00d47…80d0b7`](https://explorer-studio-dev.genlayer.com/tx/0x56d00d47d4375342ed07797e8d2cf1e67e261ec5377ad8ae945e8c164a80d0b7) |
| Duplicate source anchor | `SOURCE_SNAPSHOT_CURRENT` | [`0xc2c64aa5…6621f6`](https://explorer-studio-dev.genlayer.com/tx/0xc2c64aa5bb971a162c896c0cbd8039a4428a2ae235f0845b4c036947f56621f6) |
| Unknown snapshot | `SNAPSHOT_NOT_FOUND` | [`0xc027500e…5c1317`](https://explorer-studio-dev.genlayer.com/tx/0xc027500e630c4123e3c8cd714a589a11aad6386469c69c14f32f9fd7ca5c1317) |
| Invalid locked question | `INVALID_QUESTION` | [`0x8e674969…f0480c`](https://explorer-studio-dev.genlayer.com/tx/0x8e674969be09da6ad1d1d1e24ed3baf4f2a25ba3e1f0f8838627347a6cf0480c) |
| Duplicate comparison | `COMPARISON_ALREADY_EXISTS` | [`0x13abbc94…6aa601`](https://explorer-studio-dev.genlayer.com/tx/0x13abbc94de6ee9873958748716f2b6c5b2c7af19764fffd31310b1e4d76aa601) |
| Unknown job | `JOB_NOT_FOUND` | [`0xf5a38ac2…3cf1e6`](https://explorer-studio-dev.genlayer.com/tx/0xf5a38ac2c4cd124ff62e23036fb919a612d24a2d01f719ae84cfa5952f3cf1e6) |
| Assessment replay | `ASSESSMENT_CLOSED` | [`0x78abda0b…b10240`](https://explorer-studio-dev.genlayer.com/tx/0x78abda0b9dcbf91ae988076268077e1b44571950994b1803c35bef94c8b10240) |
| Successor on stale revision | `NEWER_SNAPSHOT_REQUIRED` | [`0xe24e8345…8eb308`](https://explorer-studio-dev.genlayer.com/tx/0xe24e83451d812c8b3c056ff51c18eb9cab809b2db74e0f7b8ed90dd5888eb308) |
| Create isolated role-test job | Job `2` | [`0x6131bc6b…4a2191`](https://explorer-studio-dev.genlayer.com/tx/0x6131bc6bdb9172a841d50716d1827485df28865bf5384babde54a7c82a4a2191) |
| Creator attempts self-assessment | `INDEPENDENT_ASSESSOR_REQUIRED` | [`0x8ec5f447…e5a791`](https://explorer-studio-dev.genlayer.com/tx/0x8ec5f4472ba242f4ca1770a9ec2089a0d5170fef39e4ec989b14e97e52e5a791) |

Post-matrix finalized-state audit:

- snapshot `1` is byte-for-byte unchanged;
- certificate job `1` is byte-for-byte unchanged;
- certified count remains `1`;
- role-test job `2` remains `OPEN`, with no assessor or certificate;
- totals are `1` snapshot, `2` jobs, `1` certificate, `0` unresolved records.

The production contract deliberately does not expose test-only source/model injection hooks. `SOURCE_DRIFT_REQUIRES_NEW_SNAPSHOT`, malformed model schema, prompt contradiction, and forced comparative disagreement are therefore verified in the direct production-source test suite rather than fabricated on-chain. The genuine Studio consensus conflict above provides the live fail-safe evidence: an `Undetermined` transaction committed no state.
