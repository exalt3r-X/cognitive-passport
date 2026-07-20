# Cognitive Passport

**An open, experimental specification for verifiable trust in autonomous agents.**

> Status: **v0.1 — a proposal, not a ratified standard.** It becomes something only if
> independent teams find it useful and implement it. Feedback shapes it — see
> [issue #1](../../issues/1).

> Memory tells you what an agent *remembers*.
> A Cognitive Passport tells you whether you should *trust* it.

---

## The problem

LLMs are the brain. MCP is the hands. Memory is the memory.
The missing layer is **accountability**.

Today an agent can claim any skill, be confidently wrong, delete production, or hide a
failure — and nothing follows from it. Before you delegate **capital, permissions, or an
important task** to an agent, you need to know one thing: *has this agent's judgment
survived contact with reality, in this domain, on the record?*

Star ratings don't answer that — ⭐4.9 is a vote, and votes get gamed. On-chain reputation
registries fill up with Sybil reviews. What's missing is reputation grounded in **outcomes
of commitments made before the outcome was known.**

## What a Cognitive Passport is

Not a rating. A **passport** — a history that can't be rewritten.

An agent commits a decision (a forecast, a claim, an action with a predicted result)
**before** the outcome is known. Reality resolves it. Over time this produces a
machine-readable document:

- **verified decision history** — what was committed, and when
- **calibration & sample size** — is the agent's confidence honest? on how many resolved cases?
- **domain-specific performance** — good at crypto ≠ cleared for medical
- **baseline comparison** — does it actually beat the naive baseline (e.g. the market price)?
- **whether an edge is *actually proven*** — or just a lucky streak on a small sample
- **where the agent should *not* be trusted yet** — insufficient sample, no evidence

A passport does not promise perfection. It shows history — **including the failures.**
The reference implementation runs one agent that is measurably *below* its baseline; its
passport says `"edge_proven": false` instead of hiding it. That is the point.

## The core principle

**Outcome-grounded, commit-before-outcome, honest about limits.**

```
commitment (before outcome)  →  reality resolves it  →  score  →  passport  →  trust decision
```

Nothing is rewritten. The passport reflects what actually happened, not what was promised.

## Quick start

Read a passport (live reference implementation):

```bash
curl -s https://metainsight.app/passport/noesis?format=json
```

Gate a delegation on it — the actual use case. The gate is **fail-closed**: it denies
unless the passport positively clears every check.

```js
// examples/trust-gate.js — deny unless the agent has POSITIVELY earned the authority
async function canDelegate(agentId, { baseUrl = "https://metainsight.app", minResolved = 10, domain, requireVerified = false } = {}) {
  const p = await fetch(`${baseUrl}/passport/${agentId}?format=json`).then(r => r.json());
  if (p.edge_proven !== true)                       return { ok: false, why: "edge not proven" };        // null AND false deny
  if ((p.resolved_forecasts ?? 0) < minResolved)    return { ok: false, why: "insufficient resolved history" };
  if (domain) {                                     // require a real track record in the domain
    const d = (p.domains || []).find(x => x.domain === domain);
    if (!d || (d.n ?? 0) < minResolved)             return { ok: false, why: `insufficient track record in ${domain}` };
  }
  if (requireVerified && p.verified !== true)       return { ok: false, why: "evidence not independently verified" };
  return { ok: true, calibration: p.calibration };
}
```

> With a strict gate, **none of the reference agents pass yet** — none has a *proven* edge.
> That is the point: an honest trust layer refuses to green-light the unproven.

See [`examples/`](./examples) for `curl`, JavaScript and Python, and
[`spec/`](./spec) for the JSON Schema and the human-readable specification.

## Reference implementation

Metainsight runs a live reference implementation and dogfoods it on its own agents,
including the honest failures:

- Catalog: <https://metainsight.app/passport>
- Agent: <https://metainsight.app/passport/noesis>
- 5-minute integration + trust-gate pattern: <https://metainsight.app/passport/integrate>

The spec is open so that **anyone** can implement it — an open spec is only useful if anyone
can build it. The reference implementation is just the most mature one, not the only one.

## Status & how you can help

This is early. There is no SDK package yet — **the contract *is* the API**, and it is
stable. If you build agent systems, one question is worth more to us than any star:

> **What would be missing for you to put a trust layer like this in front of your agent,
> before delegating it capital or permissions?**

Open an [issue](../../issues) — a blunt answer is the most useful kind — or say what you're
building in [💬 Discussions](../../discussions/3). The sharp edge right now is the
[Decision Receipt](../../issues/2), where builders are working out how to gate a *single*
action, not just long-run reputation. Start with the one-pager:
[**Why Passport is not enough**](./docs/why-passport-is-not-enough.md) — it ends with the
one question we actually need answered.

### Early reviewers

The design is being shaped by field input from people shipping real agents — not by votes.
First reviewers, with our thanks: [@clementineCU](https://github.com/clementineCU)
(field-level gate spec for market/voyage agents, #1 #2) and
[@impeachmentright](https://github.com/impeachmentright) (settle boundary / execution
digest, live A2A contractor, #2). If you ship agents and want to poke holes in the next
document before it hardens — answer the one-pager's closing question and you're in.

## License

Specification and examples: [MIT](./LICENSE). Implement it, fork it, build on it.

`Cognitive Passport` is used here as an open category name, like *operating system*.
Metainsight and NOESIS are separate brands.
