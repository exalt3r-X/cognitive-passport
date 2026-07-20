# Cognitive Passport — Specification v0.1

Status: **Draft / early.** The contract is stable enough to build against; field additions
will be backward-compatible. Breaking changes will bump the version.

## 1. Purpose

A Cognitive Passport is a machine-readable answer to: *should I trust this autonomous agent
with this task?* It is **outcome-grounded** — every claim in it derives from commitments the
agent made **before** the outcome was known, then resolved against reality.

It is deliberately **not** a rating. A rating is an opinion (and is gamed). A passport is a
record of what happened, including failures.

## 2. Transport

A conforming endpoint SHOULD serve a passport as JSON via either:

- an explicit format parameter: `GET /passport/<slug>?format=json`, or
- HTTP content negotiation: `GET /passport/<slug>` with `Accept: application/json`.

The same path MAY serve a human-readable HTML page to browsers. A catalog of agents SHOULD
be available at the collection root (e.g. `/passport`).

## 3. The object

See [`passport.schema.json`](./passport.schema.json). Fields, grouped:

**Identity** — `agent`, `slug`, `role`.

**Calibration** — `calibration` (mean Brier, lower is better), `calibration_oos`
(out-of-sample, anti-overfit), `bias` (systematic over/under-confidence).

**Sample** — `sample_size`, `resolved_forecasts`, `period` `[from, to]`. A passport MUST
make sample size legible: a great-looking score on n=3 is not a great agent.

**Competence** — `domains[]` with per-domain Brier and n. Competence is contextual: strong
in one domain implies nothing about another.

**Baseline** — `baseline` and `baseline_note`. The honest question is not "is the agent
good?" but "is it better than the naive baseline?" (e.g. the market price). When no external
baseline exists (open questions without a price), `baseline` is `null` and this MUST be said
plainly — not hidden.

**Stake & independence** — `real_money`, `event_correlation`. Correlated commitments (e.g.
several bets on the same match) inflate an apparent sample and MUST be flagged.

**Trust signals** — `edge_proven` (the field a trust gate keys on) and `verified`.

## 4. Honesty rules (normative)

These are what separate a passport from a marketing page. A conforming implementation:

1. **MUST NOT** set `edge_proven: true` on a small sample. Below an implementation-defined
   minimum (the reference uses 10 resolved), use `false` (not proven) or `null` (ahead but
   unconfirmed).
2. **MUST NOT** set `verified: true` without a defined, external verification criterion. An
   internal label is not verification.
3. **MUST** keep distinct samples distinct. Forecast calibration and a real-money track are
   different populations; a passport MUST NOT visually equate `Brier 0.149 (n=23 forecasts)`
   with `3/3 money bets`.
4. **MUST** surface failures. A passport that only shows wins is non-conforming.
5. **MUST** keep four entities separate and never conflate them:
   - **intent** — what the reader/agent wants to do now
   - **source** — the channel a visitor arrived through
   - **ref / campaign** — who or what brought them
   - **destination / path** — where they went
6. **SHOULD** report what is missing (`"insufficient sample"`, `"no evidence"`,
   `"awaiting resolution"`) rather than a fabricated zero or a silent gap.

## 5. Trust gate

The passport exists to be *acted on*. The minimal pattern (see `examples/`):

```
p = get_passport(agent)
deny if p.edge_proven is False
deny if p.sample_size < min_sample
deny if domain requested and agent has no track record in that domain
otherwise allow
```

Higher-stakes actions SHOULD combine the passport with additional controls: authority
limits, an economic stake, and stronger verification. A passport is a necessary input to a
delegation decision, not a sufficient one.

## 6. Versioning

`v0.1` — initial draft. Additive changes stay within `v0.x`. The `$id` in the schema carries
the version.
