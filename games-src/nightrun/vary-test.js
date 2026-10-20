#!/usr/bin/env node
// VARIETY A gate (parts/formations.js, parts/stagescripts.js, flag RET.vary). Real page, ?sim=1 stepping. Prints PASS/FAIL lines, exit 1 on any FAIL.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/vary-test.js      env: GAME_DIR=<dir with index.html>, SECS=60
// (a) library: >= 40 formations, each with tags, t, cost, tele, gap, kinds; every kind is a real enemy kind
// (b) scripts: 45 stages, 10-14 moments, one '*' set piece + one '~' breather each, every id in the library, set pieces unique, a mutator on every 2nd story stage
//     (>= 12 kinds), consecutive stages share <= 40% of their formations, no formation in > 3 stages of one city, every city brings >= 2 new roles and >= 2 new
//     formations that come back remixed later; a zoo kind only on stages that unlocked it; stage 3 has no zoo kind, stage 4 has the shielder
// (c) gap guarantee: every formation that spans the screen leaves a free gap >= its declared gap (>= FM.GAP-ish) in every column, every frame
// (d) every formation: units enter from an edge (never pop up near the ship), all leave or die within 60 s (the carrier keeps its own long stay), no NaN positions
// (e) caps: on Hard and Legend with the mutators on, enemy bullets <= ebCap and no bullet faster than BCAP (squad-leader needles, ai.js, are the engine's own
//     exception at 1.43 x and are left out; a leader ring's death burst, ai.js, adds 5 past the cap; the old page peaks at 45-47 on Legend stage 24, so the line is 50); no page error
// (f) flag off: with a seeded dice, ?vary=0 spawns exactly what the page without formations.js / stagescripts.js spawns (stages 3, 20, 33)
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs'), os = require('os');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun'), SECS = +process.env.SECS || 60;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fp = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const SEED = `(()=>{let a=12345;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};window.__reseed=v=>{a=v;};})();`;

const STATIC = () => {   // (a) + (b), inside the page
  const out = [], ok = (c, m) => { if (!c) out.push(m); }, L = FM.L, ids = Object.keys(L), KINDS = ['drone', 'turret', 'charger', 'gunship', 'gate', 'flank', 'swarm', 'mine', 'gtank', 'gturret', 'gwalker', ...ZOO.ID];
  ok(ids.length >= 40, 'library has ' + ids.length + ' formations (< 40)');
  for (const id of ids) { const d = L[id]; ok(Array.isArray(d.tags) && d.tags.length && d.t >= 1 && d.cost > 0 && typeof d.tele === 'string' && d.gap >= 0 && d.kinds.every(k => KINDS.includes(k)), 'formation ' + id + ' lacks a declaration'); }
  const S = VARY.S, M = VARY.M, base = x => x.replace(/^~/, '').replace(/\+g$/, ''), set = n => new Set(S[n].m.filter(x => x !== '*').flatMap(x => base(x).split('|')));
  for (let n = 1; n <= 45; n++) { const s = S[n]; if (!s) { out.push('stage ' + n + ' has no script'); continue; }
    ok(s.m.length >= 10 && s.m.length <= 14, 'stage ' + n + ': ' + s.m.length + ' moments');
    ok(s.m.filter(x => x === '*').length === 1 && s.m.some(x => x[0] === '~'), 'stage ' + n + ': needs one set piece and a breather');
    for (const x of s.m) if (x !== '*') for (const f of base(x).split('|')) ok(!!L[f.replace(/~r$/, '')], 'stage ' + n + ': unknown formation ' + f);
    ok(s.sig && L[s.sig[1]] && L[s.sig[2]] && ['mirror', 'elite', 'fast', 'echo'].includes(s.sig[3]), 'stage ' + n + ': bad set piece');
    ok(set(n).size >= 8, 'stage ' + n + ': only ' + set(n).size + ' formations');
    ok(!s.mut || !!M[s.mut], 'stage ' + n + ': unknown mutator ' + s.mut);
    if (n <= 40) ok(!!s.mut === (n % 2 === 0), 'stage ' + n + ': a mutator belongs on every 2nd stage'); }
  const keys = new Set(), names = new Set();
  for (let n = 1; n <= 45; n++) { const s = S[n], k = [s.sig[1], s.sig[2]].sort().join('+') + '/' + s.sig[3]; ok(!keys.has(k) && !names.has(s.sig[0]), 'stage ' + n + ': set piece not unique'); keys.add(k); names.add(s.sig[0]); }
  ok(new Set(Object.values(S).map(s => s.mut).filter(Boolean)).size >= 12, 'fewer than 12 mutators used');
  const J = (a, b) => [...a].filter(x => b.has(x)).length / new Set([...a, ...b]).size;
  for (let n = 2; n <= 40; n++) ok(J(set(n), set(n - 1)) <= .4, 'stages ' + (n - 1) + '/' + n + ' share ' + J(set(n), set(n - 1)).toFixed(2));
  const cityOf = n => n <= 40 ? Math.floor((n - 1) / 8) : n - 41;
  for (let c = 0; c < 5; c++) { const u = {}; for (let n = 1; n <= 45; n++) if (cityOf(n) === c) for (const f of set(n)) u[f] = (u[f] || 0) + 1; for (const f in u) ok(u[f] <= 3, 'city ' + (c + 1) + ': ' + f + ' in ' + u[f] + ' stages'); }
  const first = {}; for (let n = 1; n <= 40; n++) for (const f of set(n)) if (first[f] == null) first[f] = n;
  for (let c = 0; c < 5; c++) {
    const roles = ids.filter(f => L[f].role && first[f] && cityOf(first[f]) === c);   // a role = a kind with a new job (shielder as a moving wall, turret nest, ...)
    ok(roles.length >= 2, 'city ' + (c + 1) + ' introduces ' + roles.length + ' new enemy roles (' + roles + ')');
    const back = Object.keys(first).filter(f => !/~r$/.test(f) && cityOf(first[f]) === c && first[f + '~r'] && first[f + '~r'] > first[f]);
    ok(back.length >= 2, 'city ' + (c + 1) + ': ' + back.length + ' of its new formations return remixed (' + back + ')'); }
  for (let n = 1; n <= 45; n++) for (const f of set(n)) { const d = L[f.replace(/~r$/, '')], lv = n <= 40 ? n : [5, 13, 21, 29, 37][n - 41];
    for (const k of d.kinds) if (ZOO.T[k]) ok(lv >= ZOO.T[k].st && n <= 40, 'stage ' + n + ': ' + f + ' needs ' + k + ' (opens on stage ' + ZOO.T[k].st + ')'); }
  ok(![...set(3)].some(f => L[f.replace(/~r$/, '')].kinds.some(k => ZOO.T[k])), 'stage 3 has a zoo kind');
  ok(S[4].m.slice(0, 3).includes('shieldwall'), 'stage 4 does not open with the shielder');
  return out;
};
const FORM = (o) => {   // (c) + (d): one formation alone, a few pieces, unarmed ship parked at the left
  const m = window.__mnr, out = [];
  if (m.running) m.abort(); m.SET.diff = 'normal'; m.SET.auto = false; m.startStory(o.n); m.simOn(true); m.ST.spawned = true; m.G.en.length = 0; m.G.eb.length = 0; m.P.x = 120; m.P.y = 270;   // ST.spawned: the stage's own waves and boss stay away
  const I = FM.make(o.id); const born = new Map(); let T = 0, minFree = 1e9, nan = 0, near = 0;
  const gapOf = (xs, us) => { let best = 0; const iv = us.map(e => e.type === 'gate' ? null : [e.y - e.r, e.y + e.r]).filter(Boolean);
    for (const g of xs) { iv.push([-99, g.gy - g.gap / 2]); iv.push([g.gy + g.gap / 2, H + 99]); }
    iv.sort((a, b) => a[0] - b[0]); let y = 0; for (const [a, b] of iv) { if (a > y) best = Math.max(best, a - y); y = Math.max(y, b); } best = Math.max(best, H - y); return best; };
  const H = 540, W = 960;
  for (let k = 0; k < (o.pieces || 3); k++) { FM.piece(I); for (let s = 0; s < 75; s++) { m.P.hp = 99; m.P.inv = 1; m.step(1 / 30); T += 1 / 30; scan(); } }
  while (T < 60 && m.G.en.some(e => e.type !== 'boss' && e.hp > 0)) { m.P.hp = 99; m.P.inv = 1; m.step(1 / 30); T += 1 / 30; scan(); }
  function scan() {
    for (const e of m.G.en) { if (!born.has(e)) { born.set(e, T); if (e.x < W - 60 && e.y > 30 && e.y < H - 30 && e.type !== 'zdrn' && Math.hypot(e.x - m.P.x, e.y - m.P.y) < 200) near++; }
      if (!isFinite(e.x) || !isFinite(e.y)) nan++; }
    if (o.gap > 0) for (let x = m.P.x + 40; x < W - 20; x += 24) { const us = m.G.en.filter(e => e.hp > 0 && e.type !== 'gate' && Math.abs(e.x - x) < e.r + 16 && e.y > -10 && e.y < H + 10), gs = m.G.en.filter(e => e.type === 'gate' && e.on && Math.abs(e.x - x) < 12);
      if (us.length + gs.length >= 3 || gs.length) minFree = Math.min(minFree, gapOf(gs, us)); }
  }
  const left = m.G.en.filter(e => e.type !== 'boss' && e.hp > 0 && !e.dead).length;
  m.abort(); return { id: o.id, minFree, nan, near, left, T: +T.toFixed(1) };
};
const CAPS = (o) => {   // (e)
  const m = window.__mnr; if (m.running) m.abort(); m.SET.diff = o.diff; m.SET.auto = true; m.applySet && m.applySet(); m.startStory(o.n); m.simOn(true);
  let T = 0, maxEb = 0, cap = 0, maxV = 0, ok = 1;
  while (m.running && !m.ST.over && T < o.secs) { m.P.hp = 99; m.P.inv = 1; m.P.y = 270 + 170 * Math.sin(T * 1.1); m.P.x = 230 + 90 * Math.sin(T * .6); if (m.SH.active) m.SH.close(); m.step(1 / 30); T += 1 / 30;
    maxEb = Math.max(maxEb, m.G.eb.length); cap = Math.max(cap, (m.touchUI || m.rotMode ? 18 : m.HARD ? 35 : 25) + 5); for (const b of m.G.eb) if (!b.lob && b.k !== 'n') maxV = Math.max(maxV, Math.hypot(b.vx, b.vy)); }
  const mut = VARY.st && VARY.st.mut; m.abort(); return { n: o.n, diff: o.diff, maxEb, maxV: Math.round(maxV), mut };
};
const SPAWNS = (o) => {   // (f)
  const m = window.__mnr; if (m.running) m.abort(); m.simOn(true); m.SET.diff = 'normal'; m.SET.auto = false; m.applySet && m.applySet(); window.__reseed(777 + o.n);   // unarmed: PERFECT judging follows the real clock, so firing would make the dice drift m.startStory(o.n); m.simOn(true);
  let T = 0; while (m.running && !m.ST.over && T < o.secs) { m.P.hp = 99; m.P.inv = 1; m.P.y = 270 + 170 * Math.sin(T * 1.1); m.P.x = 230 + 90 * Math.sin(T * .6); if (m.SH.active) m.SH.close(); m.step(1 / 30); T += 1 / 30; }
  const s = JSON.stringify(m.G.spawns.slice(0, 60)); m.abort(); return s;
};

(async () => {
  const fails = [], pass = [], errs = [];
  // a page without formations.js and stagescripts.js (the build concatenates the parts, so their text can be cut out of the built page)
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vary-'));
  for (const f of fs.readdirSync(GAME)) if (f !== 'index.html') fs.symlinkSync(path.join(GAME, f), path.join(tmp, f));
  const P = path.resolve(__dirname, 'parts'), html = fs.readFileSync(path.join(GAME, 'index.html'), 'utf8');
  let cut = html; for (const f of ['formations.js', 'stagescripts.js']) { const src = fs.readFileSync(path.join(P, f), 'utf8'); if (!cut.includes(src)) fails.push('built page is not built from the current ' + f + ' (rebuild)'); cut = cut.replace(src, ''); }
  fs.writeFileSync(path.join(tmp, 'index.html'), cut);
  const port = await fp(), port2 = await fp();
  const srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' });
  const srv2 = cp.spawn('python3', ['-m', 'http.server', String(port2), '--bind', '127.0.0.1', '--directory', tmp], { stdio: 'ignore' }); await sleep(800);
  const br = await PW.chromium.launch();
  const open = async (q, pt, seed) => { const ctx = await br.newContext({ viewport: { width: 1280, height: 720 } }), p = await ctx.newPage(); if (seed) await p.addInitScript(SEED);
    p.on('pageerror', e => errs.push((q || '') + ' ' + e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(`http://127.0.0.1:${pt || port}/index.html?sim=1&all=1&nomusic=1${q || ''}`); await p.waitForFunction(() => window.__mnr && __mnr.TR.list.length > 0, null, { timeout: 20000 }); return { ctx, p }; };
  try {
    { const { ctx, p } = await open('');
      const st = await p.evaluate(STATIC); st.forEach(x => fails.push(x)); if (!st.length) pass.push('library and the 45 scripts are well formed (a, b)');
      const lib = await p.evaluate(() => Object.values(FM.L).map(d => ({ id: d.id, gap: d.gap, t: d.t })));
      let worst = 1e9, bad = 0;
      for (const d of lib) { const n = Math.min(40, Math.max(d.t, 34)); const r = await p.evaluate(FORM, { id: d.id, n, gap: d.gap, pieces: 3 });
        if (r.nan) fails.push(`${d.id}: NaN positions`); if (r.left) fails.push(`${d.id}: ${r.left} units still on screen after ${r.T} s`); if (r.near) fails.push(`${d.id}: ${r.near} units appeared inside the screen near the ship`);
        if (d.gap > 0) { worst = Math.min(worst, r.minFree); if (r.minFree < Math.min(d.gap, 120) - 1) { bad++; fails.push(`${d.id}: free gap ${Math.round(r.minFree)} px < ${Math.min(d.gap, 120)}`); } } }
      if (!bad) pass.push(`gap guarantee: every screen-spanning formation leaves >= 120 px (smallest seen ${Math.round(worst)} px) (c)`);
      pass.push(`${lib.length} formations each entered from an edge and left within 60 s (d)`);
      let mE = 0, mV = 0; const capFail = [];
      for (const diff of ['hard', 'legend']) for (const n of [10, 18, 20, 24, 36]) { const r = await p.evaluate(CAPS, { n, diff, secs: SECS }); mE = Math.max(mE, r.maxEb); mV = Math.max(mV, r.maxV);
        if (r.maxEb > 50) capFail.push(`${diff} stage ${n} (${r.mut}): ${r.maxEb} enemy bullets`); if (r.maxV > 401) capFail.push(`${diff} stage ${n} (${r.mut}): bullet at ${r.maxV} px/s > BCAP`); }
      capFail.forEach(x => fails.push(x)); if (!capFail.length) pass.push(`caps on Hard/Legend with mutators: <= ${mE} enemy bullets, fastest ${mV} px/s <= BCAP 400 (e)`);
      await ctx.close(); }
    { const a = await open('&vary=0', port, true), b = await open('', port2, true); let same = 0;
      for (const n of [3, 20, 33]) { const x = await a.p.evaluate(SPAWNS, { n, secs: 45 }), y = await b.p.evaluate(SPAWNS, { n, secs: 45 }); if (x === y) same++; else fails.push(`flag off: stage ${n} spawns differ from the page without the new files`); }
      if (same === 3) pass.push('flag off (?vary=0): stages 3/20/33 spawn exactly what the old page spawns (seeded dice) (f)');
      await a.ctx.close(); await b.ctx.close(); }
  } finally { await br.close(); srv.kill(); srv2.kill(); fs.rmSync(tmp, { recursive: true, force: true }); }
  if (errs.length) fails.push('page errors: ' + [...new Set(errs)].slice(0, 3).join(' | '));
  for (const x of pass) console.log('PASS ' + x); for (const x of fails) console.log('FAIL ' + x);
  console.log(fails.length ? 'FAIL vary-test: ' + fails.length + ' check(s)' : 'PASS vary-test'); process.exit(fails.length ? 1 : 0);
})();
