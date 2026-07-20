# Roadmap

This is a **v0.1 proposal**, not trust infrastructure yet. What's below is on the record so
that real feedback — not internal guessing — decides the order. If several independent teams
ask for the same thing, that's the signal to build it. Open an
[issue](../../issues/1) with what *you* need.

## Done (v0.1)
- Passport JSON contract + JSON Schema (`spec/passport.schema.json`)
- Human-readable spec with honesty rules (`spec/SPEC.md`)
- **Fail-closed** trust-gate examples (curl / JS / Python)
- Offline example + dependency-free validator (`node tests/validate.mjs`), run in CI on every push/PR
- Live reference implementation (metainsight.app/passport)

## P1 — make it a *verifiable* passport (v0.2)
Today a server can return `calibration: 0.195` today and `0.140` tomorrow and a consumer
can't prove the history changed. To fix that, adopt the roles/proof model of
[W3C Verifiable Credentials](https://www.w3.org/TR/vc-data-model-2.0/) rather than inventing
a new envelope:
- `passport_id`, `issued_at`, `valid_until`, `status` / revocation
- `issuer` (who issued it) and `subject.id` / `subject.configuration_hash` (which exact config)
- `resolver` (who determined each outcome) + links & timestamps to the individual commitments
- `evidence` as a structured, signed object:
  `{ metric, value, baseline, delta, n_resolved, confidence_interval, methodology, out_of_sample }`
- `proof` — signature + signing key; hashes / Merkle root over the commitment log
- a dispute / resolution method

## P2 — Evidence vs Policy
Remove the universal `edge_proven` verdict from the core, or make it an explicitly *issuer-signed*
opinion derived from the evidence. The passport ships **measurements + provenance**; the
**consumer's** policy decides sufficiency (effect size, CI, significance, correlation
adjustment, OOS). See SPEC §5.

## P3 — Profiles for other agent types
v0.1 is `forecasting.binary.v1`. Add profiles that don't fit Brier:
- `coding.v1` — task-success rate, human-override rate, rollback rate, unauthorized actions
- `research.v1` — citation correctness, hallucination rate
- `support.v1`, `browsing.v1`, `orchestration.v1`
Each is a separate profile, not a stretch of the forecasting one.

## Adjacent — Decision Receipt ([#2](../../issues/2))
Demand-driven (raised in [#1](../../issues/1) by a market/voyage-agent builder, shaped by two
independent reviewers in [#2](../../issues/2)): a **per-decision** record — snapshot,
selected/rejected actions with reasons, `stale_after`/`reopen_if`, settle boundary
(`settlement_ref` + `execution_digest`), readback — that a webhook/SDK can require **before**
an external effect, fail-closed ("no receipt → no effect"). Renamed from *Execution Receipt*:
a refusal never executes, yet its record is the point. Kept **outside** the Passport: the
Passport carries long-lived evidence; the receipt carries one decision. The Passport then
aggregates receipts into a discipline signal (counters + hashes only). `authority_scope`
lives in the **A2A Agent Card**, not here. One-pager with the boundary and the question that
gates the spec: [docs/why-passport-is-not-enough.md](./docs/why-passport-is-not-enough.md).

**Guardrail (self-imposed):** each document owns exactly one thing — Card = declared
authority, Passport = proven history, Receipt = one decision. A field that wants to live in
two boxes is a design smell. No Passport++.

## Positioning (not competition)
Build **on** existing standards, don't reinvent them:
- **A2A Agent Card** → identity, discovery, declared capabilities ("what an agent claims")
- **W3C VC** → issuer / subject / proof / status envelope
- **Cognitive Passport** → the outcome-based evidence *profile* ("what an agent has proven")
