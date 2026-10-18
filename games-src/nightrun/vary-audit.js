#!/usr/bin/env node
// VARIETY A audit (parts/formations.js + parts/stagescripts.js, flag RET.vary): how repetitive are the stages? Headless, ?sim=1 stepping, real page.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/vary-audit.js      env: GAME_DIR=<dir with index.html>, MODES=old,new, STAGES=1-45, DIFF=normal, JSON=out.json, V=1
// Plays every story stage (and the 5 challenges) with an invincible (no BREACH either), dodging, auto-firing bot until it clears, the boss comes, or the stage's song is over,
// and records every spawn: its formation id (old: the pattern / zoo wave / ground wave; new: the scripted formation or the stage's set piece), the enemy kinds, the mutator.
// An INSTANCE is one appearance of a formation: new = one formation inside one moment of the script; old = a run of spawns of the same pattern in a row.
// Metrics (ground waves are a separate layer and are left out, their share is printed):
//   distinct formations per stage (target >= 8), Jaccard of the formation sets of consecutive story stages (<= 0.4),
//   repeat share = instances whose formation already appeared in an instance that started within the last 5 minutes of play (stages back to back, +20 s between) (<= 30%),
//   distinct mutators, stages whose set piece appears in no other stage (all 45).
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const MODES = (process.env.MODES || 'old,new').split(','), DIFF = process.env.DIFF || 'normal';
const rng = s => { const o = []; for (const p of s.split(',')) { const [a, b] = p.split('-').map(Number); for (let i = a; i <= (b || a); i++) o.push(i); } return o; };
const STAGES = rng(process.env.STAGES || '1-45');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fp = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });

const PLAY = (o) => {   // inside the page
  const m = window.__mnr, V = window.VARY, out = { n: o.n, sp: [], kinds: {}, mut: '', label: '', banner: '', err: 0, lost: 0, T: 0 };
  m.SET.diff = o.diff; m.SET.auto = true; m.applySet && m.applySet();
  if (!window.__va) {   // tag each spawn call: the pattern (old) or formation (new) it made, zoo waves and ground waves
    window.__va = 1;
    const so = m.DIR.spawnOne; m.DIR.spawnOne = function (fill) { const buf = window.__vaBuf = []; window.__vaId = ''; try { return so.call(this, fill); } finally { window.__vaBuf = null; window.__vaFlush && window.__vaFlush(buf, window.__vaId); } };
    if (window.ZOO) { const zw = ZOO.wave; ZOO.wave = function () { window.__vaZ = 1; try { return zw.call(this); } finally { window.__vaZ = 0; } }; }
    if (window.LEAK) { const gw = LEAK.gwave; LEAK.gwave = function () { window.__vaId = 'ground'; window.__vaRec && window.__vaRec('ground', 1); return gw.call(this); }; }
    NR.on('pattern', d => { if (d && d.id) { window.__vaId = d.id; window.__vaRec && window.__vaRec(d.id, 0); } });
    NR.on('spawn', e => { if (!e || e.type === 'boss') return; if (window.__vaZ && window.__vaRec && !window.__vaZid) { window.__vaZid = 1; window.__vaRec('zoo:' + e.type, 0); }
      if (window.__vaZ) window.__vaId = 'zoo:' + e.type; if (e.fid && window.__vaKind) window.__vaKind(e.fid, e); else if (window.__vaBuf) window.__vaBuf.push(e); });
  }
  let T = 0;
  window.__vaRec = (id, g) => out.sp.push({ f: id, t: +T.toFixed(2), b: +(m.G.dbar || 0).toFixed(1), g, i: V && V.active() ? V.cur() : -1, br: V && V.active() ? (V.mom().br ? 1 : 0) : 0 });
  window.__vaKind = (f, e) => { (out.kinds[f] = out.kinds[f] || {})[e.type] = 1; };
  window.__vaFlush = (buf, id) => { window.__vaZid = 0; for (const e of buf) window.__vaKind(id || '?', e); };
  m.startStory(o.n); m.simOn(true);
  out.mut = V && V.active() ? V.st.mut : ''; out.sig = V && V.active() && V.st.s.sig ? V.st.s.sig[0] : '';
  const spb = m.BT.spb || .5, cap = Math.min(330, (m.ST.lead > 0 ? m.ST.lead : m.ST.len) * 4 * spb + 40);
  while (m.running && !m.ST.over && !m.ST.spawned && T < cap) {
    m.P.hp = 99; m.P.inv = 1; if (window.LEAK) LEAK.M = 0; m.P.y = 270 + 170 * Math.sin(T * 1.1); m.P.x = 230 + 90 * Math.sin(T * .6); if (m.SH.active) m.SH.close();
    m.step(1 / 30); T += 1 / 30;
    if (!out.label && out.mut && T > 8) out.label = m.ST.label();
    if (!out.banner && m.G.banner && m.G.banner.t > 0 && /RULE/.test(m.G.banner.a)) out.banner = m.G.banner.a + ' | ' + m.G.banner.b;
    for (const e of m.G.en) if (e.fp && e.pt > 30 && e.x > -50) out.lost++;
  }
  out.T = +T.toFixed(1); out.name = m.ST.def && m.ST.def.name; out.lead = m.ST.lead; out.len = m.ST.len;
  window.__vaRec = null; window.__vaKind = null; m.abort(); return out;
};

function analyse(runs, mode) {
  const st = {}; let clock = 0; const inst = [];
  for (const r of runs) {
    const ids = new Set(), seq = []; let last = null;
    for (const s of r.sp) {
      if (s.f === 'ground') continue;
      ids.add(s.f);
      const key = mode === 'new' ? s.i + ':' + s.f : null;
      if (mode === 'new') { if (!seq.find(q => q.key === key)) seq.push({ key, f: s.f, t: clock + s.t }); }
      else { if (s.f !== last) seq.push({ f: s.f, t: clock + s.t }); last = s.f; }
    }
    const g = r.sp.filter(s => s.f === 'ground').length;
    st[r.n] = { n: r.n, name: r.name, ids, inst: seq.length, sp: r.sp.length, g, mut: r.mut, sig: r.sig, sigSeen: r.sp.some(s => /^sig:/.test(s.f)), label: r.label, banner: r.banner, T: r.T, lost: r.lost, kinds: r.kinds };
    for (const q of seq) inst.push(Object.assign({ n: r.n }, q));
    clock += r.T + 20;
  }
  let rep = 0; for (let i = 0; i < inst.length; i++) { const a = inst[i]; if (inst.some((b, j) => j < i && b.f === a.f && a.t - b.t <= 300)) rep++; }
  const J = (a, b) => { const i = [...a].filter(x => b.has(x)).length; return i / Math.max(1, new Set([...a, ...b]).size); };
  const js = []; for (let n = 2; n <= 40; n++) if (st[n] && st[n - 1]) js.push({ n, j: J(st[n].ids, st[n - 1].ids) });
  const sigs = {}; for (const k in st) if (st[k].sigSeen) sigs[st[k].sig] = (sigs[st[k].sig] || 0) + 1;
  const uniqSig = Object.values(st).filter(s => s.sigSeen && sigs[s.sig] === 1).length;
  const muts = new Set(Object.values(st).map(s => s.mut).filter(Boolean));
  const dist = Object.values(st).map(s => s.ids.size);
  const kindsPer = Object.values(st).map(s => new Set(Object.values(s.kinds).flatMap(o => Object.keys(o))).size);
  const totSp = Object.values(st).reduce((a, s) => a + s.sp, 0), totG = Object.values(st).reduce((a, s) => a + s.g, 0);
  return { st, rep: rep / Math.max(1, inst.length), nInst: inst.length, js, jMax: Math.max(...js.map(x => x.j)), jMean: js.reduce((a, x) => a + x.j, 0) / Math.max(1, js.length),
    distMin: Math.min(...dist), distMean: dist.reduce((a, b) => a + b, 0) / dist.length, uniqSig, muts: [...muts], kindsMean: kindsPer.reduce((a, b) => a + b, 0) / kindsPer.length,
    allIds: new Set(Object.values(st).flatMap(s => [...s.ids])).size, gShare: totG / Math.max(1, totSp), lost: Object.values(st).reduce((a, s) => a + s.lost, 0) };
}

(async () => {
  const port = await fp(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' }); await sleep(700);
  const br = await PW.chromium.launch(), res = {}, errs = [];
  try {
    for (const mode of MODES) {
      const ctx = await br.newContext({ viewport: { width: 1280, height: 720 } }), p = await ctx.newPage();
      p.on('pageerror', e => errs.push(mode + ': ' + e.message));
      await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
      await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1&nomusic=1${mode === 'old' ? '&vary=0' : ''}`);
      await p.waitForFunction(() => window.__mnr && __mnr.TR.list.length > 0, null, { timeout: 20000 });
      const runs = [];
      for (const n of STAGES) { const r = await p.evaluate(PLAY, { n, diff: DIFF }); runs.push(r); if (process.env.V) console.log(mode, n, r.name, r.T + 's', r.sp.length, 'spawns', [...new Set(r.sp.map(s => s.f))].join(' ')); }
      res[mode] = analyse(runs, mode); res[mode].runs = runs; await ctx.close();
    }
  } finally { await br.close(); srv.kill(); }
  const f = x => (x * 100).toFixed(0) + '%', row = (k, o, n) => console.log(k.padEnd(52) + String(o).padStart(13) + String(n).padStart(13));
  const O = res.old, N = res.new;
  console.log('metric'.padEnd(52) + 'before'.padStart(13) + 'after'.padStart(13));
  const g = (m, fn) => m ? fn(m) : '-';
  row('distinct formations per stage (min / mean)', g(O, m => m.distMin + ' / ' + m.distMean.toFixed(1)), g(N, m => m.distMin + ' / ' + m.distMean.toFixed(1)));
  row('formation ids used over the story', g(O, m => m.allIds), g(N, m => m.allIds));
  row('consecutive-stage Jaccard (max / mean)', g(O, m => m.jMax.toFixed(2) + ' / ' + m.jMean.toFixed(2)), g(N, m => m.jMax.toFixed(2) + ' / ' + m.jMean.toFixed(2)));
  row('repeat share (same formation within 5 min)', g(O, m => f(m.rep)), g(N, m => f(m.rep)));
  row('formation instances', g(O, m => m.nInst), g(N, m => m.nInst));
  row('distinct mutators', g(O, m => m.muts.length), g(N, m => m.muts.length));
  row('stages with a unique set piece', g(O, m => m.uniqSig + '/' + Object.keys(m.st).length), g(N, m => m.uniqSig + '/' + Object.keys(m.st).length));
  row('enemy kinds per stage (mean)', g(O, m => m.kindsMean.toFixed(1)), g(N, m => m.kindsMean.toFixed(1)));
  row('ground waves (share of spawns, separate layer)', g(O, m => f(m.gShare)), g(N, m => f(m.gShare)));
  row('path units alive > 30 s (stuck)', g(O, m => m.lost), g(N, m => m.lost));
  const fails = [];
  if (errs.length) fails.push('page errors: ' + [...new Set(errs)].slice(0, 3).join(' | '));
  if (N) {
    if (N.distMin < 8) fails.push('a stage has fewer than 8 formations: ' + Object.values(N.st).filter(s => s.ids.size < 8).map(s => s.n + ' ' + s.ids.size).join(', '));
    if (N.jMax > .4) fails.push('consecutive stages too alike: ' + N.js.filter(x => x.j > .4).map(x => x.n + ' ' + x.j.toFixed(2)).join(', '));
    if (N.rep > .3) fails.push('repeat share ' + f(N.rep) + ' > 30%');
    if (N.muts.length < 12) fails.push('only ' + N.muts.length + ' mutators');
    if (N.uniqSig < Object.keys(N.st).length) fails.push('set piece missing or shared: ' + Object.values(N.st).filter(s => !s.sigSeen).map(s => s.n).join(','));
    const mv = Object.values(N.st).filter(s => s.mut && (!s.label.includes(VMUTN(s.mut)) || !s.banner)); if (mv.length) fails.push('mutator not on the HUD / card: ' + mv.map(s => s.n + ' ' + s.mut + ' [' + s.label + '] [' + s.banner + ']').join('; '));
    if (N.lost) fails.push(N.lost + ' path-unit frames stuck on screen > 30 s');
  }
  function VMUTN(id) { return { offbeat: 'OFF-BEAT', mirror: 'MIRROR', wind: 'CROSSWIND', quickdash: 'QUICK DASH', curve: 'CURVED SHOTS', nopower: 'PURE RUN', laser: 'LASER CURTAIN', drop: 'AIR DROP', split: 'SPLIT SHOTS', shrink: 'SQUEEZE', beatgap: 'FOLLOW THE SONG', blackout: 'BLACKOUT', order: 'TARGET ORDER', hail: 'HAILSTORM', minefield: 'MINEFIELD' }[id] || id; }
  if (process.env.V && N) for (const s of Object.values(N.st)) console.log(String(s.n).padStart(2), (s.name || '').padEnd(15), String(s.ids.size).padStart(3), 'f', (s.mut || '-').padEnd(10), s.sigSeen ? '★' : ' ', s.T + 's', [...s.ids].join(' '));
  if (process.env.JSON) fs.writeFileSync(process.env.JSON, JSON.stringify({ old: O && Object.assign({}, O, { st: undefined, runs: undefined }), new: N && Object.assign({}, N, { st: undefined, runs: undefined }) }, null, 1));
  for (const x of fails) console.log('FAIL ' + x);
  console.log(fails.length ? 'FAIL vary-audit' : 'PASS vary-audit'); process.exit(fails.length ? 1 : 0);
})();
