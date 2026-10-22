#!/usr/bin/env node
// BULLETART (parts/bulletart.js, RET.bulletart): enemy bullets draw their picture (orb / needle / shell / rocket) and player shots draw the weapon's picture; ?bulletart=0 = the old dots (no such picture drawn).
// Counts drawImage calls by source picture (ids resolved from ART.bm / ART.sc after the run), 390x763 phone viewport. PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/bulletart-test.js        STAGES=6,10 T=40 picks the runs; GAME_DIR=<built folder>
const PW = require('playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
let bad = 0; const ok = (n, p, i) => { if (!p) bad++; console.log((p ? 'PASS ' : 'FAIL ') + n + (i ? ' :: ' + i : '')); };
const INSTR = () => { const P = CanvasRenderingContext2D.prototype, d = P.drawImage, M = window.__bc = new Map(); P.drawImage = function (s) { M.set(s, (M.get(s) || 0) + 1); const k = s, a = window.__ba || (window.__ba = new Map()); if (this.globalAlpha >= .99) a.set(k, (a.get(k) || 0) + 1); return d.apply(this, arguments); }; };
const RUN = (o) => {
  const m = window.__mnr; let sd = o.seed >>> 0; Math.random = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  m.god = true; m.startStory(o.story); m.simOn(true); const dt = 1 / 60, t0 = m.G.t; let i = 0, ebMax = 0, pbMax = 0, objs = [];
  while (m.running && m.G.t - t0 < o.t) {
    if (m.SH.active) m.SH.close(); if (i % 20 === 0) m.press('Fire'); if (i % 3 === 0) m.touchTo(300 + 200 * Math.sin(i / 50), 270 + 200 * Math.sin(i / 37));
    m.step(dt); i++; ebMax = Math.max(ebMax, m.G.eb.length); pbMax = Math.max(pbMax, m.G.pb.length);
    if (i % 30 === 0) { const G = m.G; m.render(G.t, dt); objs.push(G.en.length + G.eb.length + G.pb.length); }
  }
  // resolve the drawn sources to ids
  const ids = {}, M = window.__bc, A = m.ART, add = (s, id) => { const c = M.get(s); if (c) ids[id] = (ids[id] || 0) + c; };
  for (const k in A.bm) { if (A.bm[k]) add(A.bm[k], k); if (A.bm[k] && A.bm[k].c) add(A.bm[k].c, k); }
  for (const k in A.sc) { const o2 = A.sc[k]; if (!o2) continue; const n = k.replace(/^h\|/, '').split('@')[0]; add(o2.c || o2, n); }
  const AL = {}, MA = window.__ba || new Map(), alp = (s, id) => { const a = MA.get(s); if (a != null) AL[id] = (AL[id] || 0) + a; }; for (const k in A.bm) { if (A.bm[k]) alp(A.bm[k], k); } for (const k in A.sc) { const o2 = A.sc[k]; if (o2) alp(o2.c || o2, k.replace(/^h\|/, '').split('@')[0]); }
  const BAR = {}; for (const k in ids) if (/^fx-bullet-(needle|rocket|shell|enemy)$/.test(k) || /^fx-w-[a-z]+-bullet$/.test(k)) BAR[k] = ids[k];
  return { AL: AL['fx-bullet-enemy'] || 0, BAR, ebMax, pbMax, objs, st: window.FXW ? FXW.stat.bullet : -1 };
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' }); await sleep(800);
  const br = await PW.chromium.launch(), errs = [];
  const run = async (q, o) => { const ctx = await br.newContext({ viewport: { width: 390, height: 763 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }), p = await ctx.newPage();
    p.on('pageerror', e => errs.push(q + ': ' + e.message)); await p.addInitScript(INSTR); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&nomusic=1${q}`); await p.waitForFunction(() => window.__mnr && __mnr.ART && __mnr.ART.rd && __mnr.ART.rd.size > 50 && __mnr.ART.bm['fx-w-arc-bullet']); await sleep(800);
    const r = await p.evaluate(`(${RUN})(${JSON.stringify(o)})`); await ctx.close(); return r; };
  const STAGES = (process.env.STAGES || '6,10').split(',').map(Number), T = +(process.env.T || 40), sum = o => Object.values(o).reduce((a, b) => a + b, 0);
  const pct = (a, q) => { const x = [...a].sort((p, r) => p - r); return x.length ? x[Math.min(x.length - 1, Math.floor(x.length * q))] : 0; };
  for (const s of STAGES) {
    const on = await run('', { story: s, t: T, seed: 7 });
    const en = k => Object.entries(k).filter(([n]) => /^fx-bullet-/.test(n)), pl = k => Object.entries(k).filter(([n]) => /^fx-w-/.test(n));
    console.log(`  st ${s}: ON ${JSON.stringify(on.BAR)} | eb max ${on.ebMax} pb max ${on.pbMax} | objs p95 ${pct(on.objs, .95)}`);
    ok(`st ${s}: enemy bullets draw their picture (orb full strength; needle / shell / rocket when they appear)`, on.ebMax > 0 && sum(Object.fromEntries(en(on.BAR))) > 0 && on.AL >= .9 * on.BAR['fx-bullet-enemy'] , `orb full-alpha draws ${on.AL}/${on.BAR['fx-bullet-enemy']} ${JSON.stringify(Object.fromEntries(en(on.BAR)))}`);
    ok(`st ${s}: player shots draw the weapon picture (FXW.bullet)`, on.pbMax > 0 && sum(Object.fromEntries(pl(on.BAR))) > 0, JSON.stringify(Object.fromEntries(pl(on.BAR))));
    ok(`st ${s}: objects per frame p95 <= 64 (diet limit)`, pct(on.objs, .95) <= 64, `p95 ${pct(on.objs, .95)}`);
  }
  ok('no page errors', !errs.length, errs.slice(0, 3).join(' | '));
  await br.close(); srv.kill(); process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
