# Why Passport is not enough

One page. Three boundaries. One falsifiable question at the end.

A Cognitive Passport answers *"has this agent's judgment survived contact with reality?"* —
long-run, outcome-grounded reputation. Builders shipping real agents
([#1](../../../issues/1), [#2](../../../issues/2)) immediately pushed on what it **cannot**
answer: *"why was this agent allowed to take this particular action, and what did it refuse?"*
That is not a missing field. It is a different document with a different lifetime.

## The three artifacts

```
┌────────────────────┐    ┌────────────────────┐    ┌────────────────────┐
│   A2A Agent Card   │    │ Cognitive Passport │    │  Decision Receipt  │
│                    │    │                    │    │                    │
│  what the agent    │    │  what the agent    │    │  what the agent    │
│  DECLARES it may   │    │  has PROVEN over   │    │  DID (or REFUSED)  │
│  do                │    │  time              │    │  once, and why     │
│                    │    │                    │    │                    │
│  authority_scope   │    │  calibration,      │    │  snapshot, chosen/ │
│  capabilities,     │    │  domains, losses,  │    │  rejected action,  │
│  owner-only limits │    │  edge_proven       │    │  settle, readback  │
│                    │    │                    │    │                    │
│  lifetime: static  │    │  lifetime: career  │    │  lifetime: one     │
│  (per config)      │    │  (accumulates)     │    │  decision          │
└────────────────────┘    └────────────────────┘    └────────────────────┘
```

## How they compose at delegation time

```
        delegation question:  "should THIS agent do THIS action NOW?"

   Agent Card ──────► is the action inside its declared authority?   (scope)
        │
   Passport ────────► has it earned this class of action at all?     (reputation, fail-closed)
        │
   Decision Receipt ► record the decision — chosen AND refused paths,
        │             with snapshot, stale_after, settle digest       (accountability)
        ▼
   external effect happens ONLY if the receipt exists and clears      (no receipt → no effect)
```

The Passport gate is **fail-closed** on long-run evidence (`edge_proven != true → deny`).
The Receipt gate is **fail-closed** on per-decision completeness (`no conforming receipt → no
effect`). Two different denials, two different documents.

## Where each document ends

```
 Agent Card ends where claims end.        It cannot prove anything happened.
 Passport ends where aggregation ends.    It cannot say why ONE action was allowed —
                                          and must not leak per-decision detail.
 Receipt ends where the decision ends.    It proves one decision was disciplined;
                                          it says nothing about long-run competence.

 Passport ← aggregates ← Receipts:  counters and hashes only
 (refusal rate by reason, readback-mismatch count, reconciliation rate)
```

A refusal is evidence. It lives in the Receipt as a first-class record (a valid receipt may
have **no** external effect — the non-action is the point), and reaches the Passport only as
an aggregate discipline signal.

**Guardrail:** each document owns exactly one thing. Anything that wants to live in two of
these boxes at once is a design smell, not a feature request.

## The question this page exists to ask

Not "do you like it." This:

> **Does this boundary match your system? If not — what breaks first, and in which box?**

If several independent builders answer "yes, that's the boundary," #2 graduates from a draft
to a spec. If the boundary breaks for you — say where; that answer is worth more than a star.
Answer in [#2](../../../issues/2) or [Discussions](../../../discussions/3).
