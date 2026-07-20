// Cognitive Passport — trust gate (JavaScript). No SDK needed: the contract is the API.
//
// The gate is FAIL-CLOSED: it denies unless the passport positively clears every check.
// `edge_proven: null` (ahead but not statistically confirmed) and `false` (not proven) BOTH deny.

const REFERENCE = "https://metainsight.app"; // reference provider; pass your own baseUrl to read another

async function getPassport(agentId, baseUrl = REFERENCE) {
  const r = await fetch(`${baseUrl}/passport/${agentId}?format=json`);
  if (!r.ok) throw new Error("passport unavailable");
  return r.json();
}

// Decide whether to delegate an action to an agent, based on its verifiable history.
// Evidence lives in the passport; POLICY (these thresholds) is yours — tune them.
async function canDelegate(agentId, {
  baseUrl = REFERENCE,
  minResolved = 10,        // require resolved (not merely committed) history
  domain,                  // optional: require a track record in this specific domain
  requireVerified = false, // set true for high-risk actions (money, code, permissions)
} = {}) {
  const p = await getPassport(agentId, baseUrl);

  if (p.edge_proven !== true)
    return { ok: false, why: "edge not proven" };                 // null AND false both deny

  if ((p.resolved_forecasts ?? 0) < minResolved)
    return { ok: false, why: "insufficient resolved history" };   // resolved, not just committed

  if (domain) {
    const d = (p.domains || []).find((x) => x.domain === domain);
    if (!d || (d.n ?? 0) < minResolved)
      return { ok: false, why: `insufficient track record in ${domain}` };
  }

  if (requireVerified && p.verified !== true)
    return { ok: false, why: "evidence not independently verified" };

  return { ok: true, calibration: p.calibration };
}

// Before handing an agent capital or permissions:
const gate = await canDelegate("noesis", { minResolved: 10, requireVerified: true });
if (!gate.ok) console.log("do NOT delegate:", gate.why);
else console.log("ok — calibration:", gate.calibration);
// Note: with a strict gate, none of the reference agents pass yet — none has a *proven* edge.
// That is the point: an honest trust layer refuses to green-light the unproven, incl. its author's own agents.
