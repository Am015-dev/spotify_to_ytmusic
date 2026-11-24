// Charter tests (engine level): for each charter the naive line fails and the strategic line wins; invariants hold after every step;
// every decision offers >= 2 real legal options. node charters-test.js
globalThis.OH_MAP = require('./src/map.js'); const OH = require('./src/engine.js'); const OHC = require('./src/charters.js');
let fail = 0;
function line(i, kind) {
  const R = OHC.start(i); let n = 0, decs = 0, inv = [];
  while (!R.ended && n++ < 80) {
    const out = OHC.advance(R); if (process.env.TRACE) out.forEach(l => console.log('    ', 'g' + OH.G.gen, l.who ? 'R' : 'Y', l.t, 'tr', OH.G.pl[0].tr, OH.G.pl[1].tr, 'mc', OH.G.pl[0].mc, OH.G.pl[1].mc)); const e = OH.checkInvariants(); if (e.length) inv.push(e.join(';'));
    const d = OHC.decision(R); if (!d) continue;
    if (d.options.length < 2) inv.push('decision with <2 options ' + d.key);
    let idx = d.options.findIndex(o => kind === 'naive' ? o.naive : !o.naive); if (idx < 0) idx = 0;
    OHC.choose(R, d, idx); decs++;
    if (process.env.TRACE) console.log('  ', kind, 'g' + OH.G.gen, d.d.prompt, '->', d.options[idx].label);
  }
  return { R, decs, inv };
}
OHC.CH.forEach((ch, i) => {
  const a = line(i, 'naive'), b = line(i, 'strategic');
  const okA = a.R.ended && !a.R.result.ok, okB = b.R.ended && b.R.result.ok;
  console.log(`charter ${ch.n} ${ch.title}: naive ${a.R.result ? a.R.result.line : 'not ended'} -> ${okA ? 'FAILS (good)' : 'WINS (bad)'} | strategic ${b.R.result ? b.R.result.line : 'not ended'} -> ${okB ? 'WINS (good)' : 'FAILS (bad)'} | decisions ${a.decs}/${b.decs}` + (a.inv.length + b.inv.length ? ' INV ' + a.inv.concat(b.inv).slice(0, 2).join(' | ') : ''));
  if (!okA || !okB || a.inv.length || b.inv.length) fail++;
});
console.log(fail ? 'CHARTERS FAIL ' + fail : 'CHARTERS OK'); process.exit(fail ? 1 : 0);
