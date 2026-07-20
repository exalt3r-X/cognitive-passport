// Cognitive Passport — trust gate (JavaScript). No SDK needed: the contract is the API.

async function getPassport(agent) {
  const r = await fetch(`https://metainsight.app/passport/${agent}?format=json`);
  if (!r.ok) throw new Error("passport unavailable");
  return r.json();
}

// Decide whether to delegate an action to an agent, based on its verifiable history.
async function canDelegate(agent, { minSample = 10, domain } = {}) {
  const p = await getPassport(agent);
  if (p.edge_proven === false) return { ok: false, why: "edge not proven" };
  if ((p.sample_size ?? 0) < minSample) return { ok: false, why: "insufficient sample" };
  if (domain && !(p.domains || []).some((d) => d.domain === domain))
    return { ok: false, why: `no track record in ${domain}` };
  return { ok: true, calibration: p.calibration, verified: p.verified };
}

// Before handing an agent capital or permissions:
const gate = await canDelegate("noesis", { minSample: 10 });
if (!gate.ok) console.log("do NOT delegate:", gate.why);
else console.log("ok — calibration:", gate.calibration);
