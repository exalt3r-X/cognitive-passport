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
5. **SHOULD** report what is missing (`"insufficient sample"`, `"no evidence"`,
   `"awaiting resolution"`) rather than a fabricated zero or a silent gap.

## 5. Evidence vs Policy (important)

A passport carries **evidence** — measurements and their provenance (metric, value, baseline,
sample size, period, domain breakdown). Whether that evidence is *sufficient* to grant an
authority is **policy**, and policy belongs to the **consumer**, not the passport.

`edge_proven` is a convenience signal from the *issuer's* policy. It is deliberately
conservative (see honesty rules) but it is not a universal truth — one issuer may call an
edge proven at n=10, another at n=100. A high-stakes consumer SHOULD NOT rely on
`edge_proven` alone; it SHOULD read the underlying measurements and apply its **own**
thresholds (effect size, confidence interval, out-of-sample, correlation adjustment).

> Roadmap (v0.2): move measurements into a structured, signed `evidence` object
> (`{metric, value, baseline, delta, n_resolved, confidence_interval, methodology, out_of_sample}`)
> so that `edge_proven` becomes a *derivable* provider opinion rather than the primary input.

## 6. Trust gate — FAIL-CLOSED (normative)

The passport exists to be *acted on*. The gate MUST deny unless the passport **positively**
clears every check. Note `edge_proven` has three states — `true`, `false`, `null` (ahead but
not statistically confirmed) — and **only `true` may allow**:

```
p = get_passport(agent, base_url)
deny if p.edge_proven != true                      # null AND false both deny (fail-closed)
deny if p.resolved_forecasts < min_resolved        # resolved, not merely committed
deny if domain requested and (no domain entry OR domain.n < min_resolved)
deny if high_risk and p.verified != true           # money / code / permissions
otherwise allow
```

`min_resolved = 10` is a floor, not a proof — see §5; a serious consumer sets its own.
Higher-stakes actions SHOULD combine the passport with additional controls: authority
limits, an economic stake, and stronger verification. A passport is a *necessary* input to a
delegation decision, not a *sufficient* one.

## 7. Scope of v0.1

v0.1 describes the **binary-forecasting** profile (`profile: "forecasting.binary.v1"`):
outcomes resolve yes/no, calibration is Brier, the baseline is a price/consensus. It does
**not** yet cover coding, research, browsing, support or orchestration agents — those need
different metrics (task-success rate, human-override rate, critical-failure rate, unauthorized
actions, citation correctness, rollback rate…). Those arrive as additional `profile`s, not by
stretching this one. See [ROADMAP](../ROADMAP.md).

## 8. Versioning

Each passport carries a `spec_version`. v0.1 is an initial draft; additive changes stay
within `v0.x`. The `$id` in the schema also carries the version.
