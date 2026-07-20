// Minimal, dependency-free check: the example conforms to the schema's core rules,
// and the fail-closed gate refuses an unproven passport. No network, no packages.
import { readFileSync } from 'node:fs';
const schema = JSON.parse(readFileSync(new URL('../spec/passport.schema.json', import.meta.url)));
const ex = JSON.parse(readFileSync(new URL('../spec/passport.example.json', import.meta.url)));

let fail = 0;
const ok = (c, m) => { if (!c) { console.error('✗ ' + m); fail++; } else console.log('✓ ' + m); };

// required fields present
for (const k of schema.required) ok(k in ex, `required: ${k}`);
// edge_proven is one of the three legal states
ok([true, false, null].includes(ex.edge_proven), 'edge_proven ∈ {true,false,null}');
// honesty: a passport MUST NOT claim a proven edge on a tiny sample
ok(!(ex.edge_proven === true && ex.resolved_forecasts < 10), 'no proven edge on small sample');

// fail-closed gate: an unproven passport must be denied
function canDelegate(p) {
  if (p.edge_proven !== true) return false;
  if ((p.resolved_forecasts ?? 0) < 10) return false;
  return true;
}
ok(canDelegate(ex) === false, 'fail-closed: unproven example is denied');
ok(canDelegate({ ...ex, edge_proven: null, resolved_forecasts: 500 }) === false, 'fail-closed: edge_proven=null is denied even with big sample');
ok(canDelegate({ ...ex, edge_proven: true, resolved_forecasts: 50 }) === true, 'allow only when edge_proven=true and enough resolved');

console.log(fail ? `\n${fail} FAILED` : '\nall checks passed');
process.exit(fail ? 1 : 0);
