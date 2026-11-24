// W624 commissions: per commission a NAIVE scripted line must fail and a STRATEGIC line must win, on the real engine,
// with the engine invariants checked after every move. Run: node comm-test.js   (node comm-test.js --probe 3 = list your moves)
const fs = require('fs'), vm = require('vm'), path = require('path');
const C = { console, Math, Date, JSON, setTimeout, clearTimeout, performance: { now: Date.now }, window: {}, document: {} }; vm.createContext(C);
for (const f of ['data', 'djinns', 'engine', 'ai', 'comm']) vm.runInContext(fs.readFileSync(path.join(__dirname, 'src', f + '.js'), 'utf8'), C, { filename: f });
const run = s => vm.runInContext(s, C); run('UI.sim=true;');
const S = t => ({ act: 'start', tile: t }), D = (t, c) => ({ act: 'step', tile: t, c }), B = s => ({ act: 'bid', spot: s }), E = { act: 'end' }, TR = { act: 'tribe' };
// a line is your moves in order; 'end' fills itself; a function picks from your legal moves
const LINES = {
  c1: { naive: [B(6), 'auto'], strategic: [B(5), S(26), D(20, 'merchant'), D(14, 'vizier'), TR, { act: 'tile', place: 14 }, E],
        alt: [B(0), S(26), D(20, 'merchant'), D(14, 'vizier'), TR, { act: 'tile', place: 14 }, E] },
  c2: { naive: [S(14), D(20, 'builder'), { act: 'tribe', fk: 1 }, { act: 'tile', skip: 1 }, E],
        strategic: [S(19), D(25, 'merchant'), TR, { act: 'tile', take: [1] }, { act: 'sell', kinds: ['fish', 'wheat', 'silk', 'pottery', 'spice'] }, E],
        alt: [S(19), D(25, 'merchant'), TR, { act: 'tile', skip: 1 }, { act: 'sell', kinds: ['fish', 'wheat', 'silk', 'pottery'] }, E] },
  c3: { naive: [S(4), D(3, 'elder'), TR, { act: 'tile', dj: 'wahha', pay: { el: 2, fk: 0 } }, E],
        strategic: [S(4), D(3, 'elder'), TR, { act: 'tile', dj: 'nakhla', pay: { el: 1, fk: 1 } }, E],
        alt: [S(4), D(3, 'elder'), TR, { act: 'tile', dj: 'nakhla', pay: { el: 2, fk: 0 } }, E] },
  c4: { naive: [S(22), D(21, 'assassin'), { act: 'tribe', kill: { tile: 15, c: 'elder', fk: 0 } }, { act: 'tile', skip: 1 }, E],
        strategic: [S(22), D(21, 'assassin'), { act: 'tribe', kill: { pl: 1, c: 'vizier', fk: 0 } }, { act: 'tile', skip: 1 }, E] },
  c5: { naive: [S(1), D(2, 'vizier'), TR, { act: 'tile', place: 2 }, E],
        strategic: [S(18), D(19, 'merchant'), TR, { act: 'tile', take: [0, 1] }, { act: 'sell', kinds: ['fish', 'wheat', 'silk', 'pottery', 'spice'] }, E] },
  c6: { naive: [S(14), D(20, 'builder'), TR, { act: 'tile', skip: 1 }, E, 'auto'],
        strategic: [S(16), D(17, 'assassin'), m => m.find(x => x.act === 'tribe' && x.kill && x.kill.tile === 5), { act: 'tile', place: 17 }, E, 'auto'] }
};
let fails = 0; const out = [];
function play(i, line) {
  C.commNew(i); const G = () => run('G'); const q = line.slice(); let guard = 0, inv = [];
  while (!G().over && guard++ < 300) {
    const s = C.sideToAct(); let m;
    if (s === 0) {
      const vmv = C.validMoves(0); let nx = q[0];
      if (nx === 'auto') m = C.aiMove(0);
      else if (typeof nx === 'function') { q.shift(); m = nx(vmv) || C.aiMove(0) }
      else if (nx && vmv.some(x => C.same(x, nx))) { q.shift(); m = nx }
      else if (nx && nx.act === 'sell' && G().step === 'sell') { q.shift(); m = nx }
      else if (vmv.some(x => x.act === 'end') && (!nx || nx.act === 'end')) { if (nx) q.shift(); m = { act: 'end' } }
      else if (nx) return { err: `move ${JSON.stringify(nx)} not legal at ${G().phase}/${G().step}: ${JSON.stringify(vmv.slice(0, 8))}` };
      else m = C.aiMove(0);
    } else m = C.aiMove(s);
    const r = C.performMove(m, s); if (!r.success) return { err: 'perform failed ' + JSON.stringify(m) + ' ' + r.error };
    const v = C.checkInvariants(); if (v.length) inv.push(...v);
  }
  const res = C.commResult(); return { won: res.won, why: res.why, me: res.R.me, rival: res.R.rival, gain: res.R.gain, coins: res.R.coins, inv };
}
if (process.argv[2] === '--probe') { const i = +process.argv[3]; C.commNew(i); console.log(JSON.stringify(C.validMoves(0)).slice(0, 2000)); process.exit(0) }
run('COMMS').forEach((c, i) => {
  const L = LINES[c.id]; if (!L) { fails++; out.push(`FAIL ${c.id}: no lines`); return }
  const n = play(i, L.naive), st = play(i, L.strategic); const alt = L.alt ? play(i, L.alt) : null;
  n.inv = n.inv || []; st.inv = st.inv || []; const ok = !n.err && !st.err && !n.won && st.won && !n.inv.length && !st.inv.length;
  if (!ok) fails++;
  out.push(`${ok ? 'PASS' : 'FAIL'} ${c.id} ${c.title} | naive: ${n.err || (n.won ? 'WON' : 'fails') + ' ' + n.me + '-' + n.rival + ' gain ' + n.gain + ' coins ' + n.coins + ' :: ' + n.why} | strategic: ${st.err || (st.won ? 'wins' : 'FAILS') + ' ' + st.me + '-' + st.rival + ' gain ' + st.gain + ' coins ' + st.coins + ' :: ' + st.why}${alt ? ' | alt: ' + (alt.err || (alt.won ? 'wins' : 'fails') + ' ' + alt.me + '-' + alt.rival + ' gain ' + alt.gain) : ''}${n.inv.length || st.inv.length ? ' INVARIANTS ' + n.inv.concat(st.inv).slice(0, 3) : ''}`);
});
console.log(out.join('\n')); console.log(`comm-test: ${run('COMMS').length} commissions, ${run('COMMS').length - fails} pass, ${fails} fail`);
process.exit(fails ? 1 : 0);
