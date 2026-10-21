#!/usr/bin/env node
// DIET (parts/diet.js, RET.diet): review 8 fix list 5-7. MACHINE gates only (no screenshots are opened):
//   objects drawn per frame (p95 <= 64 per stage, median >= 30% under ?diet=0) over 60 s bot runs on stages 2/6/10/14/20 (enemies + enemy bullets + own shots drawn + particles + rings + explosion pictures + floaters),
//   enemy drawn size >= 32 css px (390x763 and 375x553), lean HUD <= 6 items (canvas texts / bar groups / icons + touch buttons and their labels),
//   no cosmetic ring or explosion picture wider than 120 css px, flank tells drawn only in their last 0.6 s, ?diet=0 = the build without the part.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/diet-test.js        STAGES=2,6 T=60 picks the runs
const PW = require('playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
let bad = 0; const ok = (n, p, i) => { if (!p) bad++; console.log((p ? 'PASS ' : 'FAIL ') + n + (i ? ' :: ' + i : '')); };
const HAZ = /drawBoss|bmMark|bmTel/;   // telegraphs and hazard zones keep their true size
const INSTR = () => { const Q = window.__dt = { F: null, hz: 0, kc: () => 1, HAZ: /$^/, cv: () => document.querySelector('canvas#cv') || [...document.querySelectorAll('canvas')].sort((a, b) => b.width * b.height - a.width * a.height)[0] };
  const Pp = CanvasRenderingContext2D.prototype, oa = Pp.arc, ft = Pp.fillText, fr = Pp.fillRect, fi = Pp.fill;
  Pp.arc = function (x, y, r) { const F = Q.F; if (F && !this.canvas.isConnected) { const t = this.getTransform(), rw = r * Math.hypot(t.a, t.b) / (this.canvas.width / 960); const css = 2 * rw * Q.kc();
      if (css > 120 && rw <= 260) { const st = (new Error().stack || '').split('\n').slice(2, 7).map(l => (l.match(/at ([\w.$<>]+)/) || [])[1] || '?').filter(n => !/^c\.|^Pp|arc$/.test(n)).join('<'); if (!Q.hz && !Q.HAZ.test(st)) F.big.push(Math.round(css) + ' ' + st); } }
    return oa.apply(this, arguments); };
  const mine = c => c === Q.cv();
  Pp.fillText = function (s) { const F = Q.F; if (F && F.hud && mine(this.canvas)) F.txt.add(String(s)); return ft.apply(this, arguments); };
  Pp.fillRect = function (x, y, w, h) { const F = Q.F; if (F && F.hud && mine(this.canvas)) { const t = this.getTransform(), W_ = this.canvas.width, H_ = this.canvas.height, ww = Math.abs(w * t.a), hh = Math.abs(h * t.d);
      if (ww < W_ * .9 && hh < H_ * .5 && ww * hh > 0) F.bars.add(Math.round((t.d * y + t.f) / 8) + ':' + Math.round(hh)); } return fr.apply(this, arguments); };
  Pp.fill = function () { const F = Q.F; if (F && F.hud && mine(this.canvas)) F.ic++; return fi.apply(this, arguments); }; };
const RUN = (o) => {
  const m = window.__mnr; let sd = o.seed >>> 0; Math.random = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  const D = window.DIET, on = !!(D && D.on), cvv = window.__dt.cv(), HAZ_ = new RegExp(o.haz);
  const kc = () => { const r = cvv.getBoundingClientRect(); return r.height > r.width ? r.width / 540 : r.width / 960; };
  m.god = true; m.startStory(o.story); m.simOn(true);
  const dt = 1 / 60, objs = [], big = [], hud = [], sizes = []; let i = 0, tellsSeen = 0, tellsEarly = 0; const t0 = m.G.t;
  const Q = window.__dt; let F = null; Q.kc = kc; Q.HAZ = HAZ_;
  // gameplay telegraphs and hazard zones keep their true size: their draws are tagged (rule zones, boss moves, timing guides, flank tells, mines / bombs / healers)
  for (const [o, k] of [[window.RU, 'ring'], [window.ZOO, 'over'], [window.BMV, 'draw'], [window.BPL, 'draw'], [window.AC, 'draw'], [window.FLK, 'drawTells'], [window.TIM, 'draw'], [window.ABIL, 'draw'], [window.CTR, 'draw'], [window.LEAK, 'draw']])
    if (o && typeof o[k] === 'function' && !o[k].__hz) { const f = o[k]; o[k] = function () { Q.hz++; try { return f.apply(this, arguments); } finally { Q.hz--; } }; o[k].__hz = 1; }
  try {
    while (m.running && m.G.t - t0 < o.t) {
      if (m.SH.active) m.SH.close(); if (i % 20 === 0) m.press('Fire'); if (i % 3 === 0) m.touchTo(300 + 200 * Math.sin(i / 50), 270 + 200 * Math.sin(i / 37));
      m.step(dt); i++;
      for (const L of [window.AC && AC.tells, window.FLK && FLK.tells]) if (L) for (const q of L) { tellsSeen++; }
      if (i % 30 === 0) {
        const G = m.G, inS = e => e.x > -10 && e.x < 970 && e.y > -10 && e.y < 550;
        const quiet = !(G.banner.t > 0) && !(G.hint.t > 0) && !(G.note.t > 0) && !(window.HINT && HINT.on() && HINT.cur);
        F = Q.F = { big: [], hud: quiet, txt: new Set(), bars: new Set(), ic: 0 };
        try { m.render(G.t, dt); } finally { const f = F; F = Q.F = null;
          const en = G.en.filter(inS).length, eb = G.eb.filter(inS).length, pb = on ? D.st.pb : G.pb.length, pt = on ? D.st.pt : (m.SET.part ? G.pt.length : 0);
          const rings = G.rings.length + [window.ZOO && ZOO.fx, window.FLEET && FLEET.fx].reduce((a, L) => a + (L ? L.length : 0), 0);
          const fl = on ? Math.min(G.fl.length, D.FL) : G.fl.length; objs.push(en + eb + pb + pt + rings + m.ART.fx.length + fl); (objs.c || (objs.c = [])).push([en, eb, pb, pt, rings, m.ART.fx.length, fl].join('/'));
          for (const q of m.ART.fx) if (q.t >= 0 && (on ? Math.min(q.sz, 2 * D.ringMax()) : q.sz) * kc() > 120) f.big.push(Math.round(q.sz * kc()) + ' fx ' + q.k);
          big.push(f.big.length); if (f.big.length) big.last = f.big;
          if (on) { if (D.st.ens) sizes.push(D.st.minCss); }
          if (f.hud && m.running) { const tb = [...document.querySelectorAll('#touch button')].filter(b => !document.getElementById('touch').hidden && b.offsetWidth > 0 && b.id !== 'bPwr');   // bPwr: the held power-up's fire button, shown only while one is held (a control, not a read-out)
            const lab = tb.filter(b => { const v = b.getAttribute('data-t'); return v != null && v !== '' && v !== '0'; }).length;
            hud.push({ n: f.txt.size + f.bars.size + (f.ic ? 1 : 0) + tb.length + lab, txt: [...f.txt], bars: [...f.bars].join(','), ids: tb.map(b => b.id).join(','), ic: f.ic, btn: tb.length, lab, boss: !!G.boss }); } }
      }
    }
  } finally { Q.F = null; }
  const ix = objs.map((v, j) => j).sort((a, b) => objs[a] - objs[b]); return { comp: objs.c ? [ix[Math.floor(ix.length / 2)], ix[Math.floor(ix.length * .95)]].map(j => objs[j] + '=' + objs.c[j]) : [], objs, big, bigEx: big.last || null, hud, sizes, on, t: m.G.t - t0, kc: kc() };
};
const TELL = () => { const m = window.__mnr; if (!window.AC || !window.DIET || !DIET.on) return null; const out = { on: AC.on, run: m.running };   // a tell 0.7 s from its entry draws nothing, at 0.5 s it draws
  for (const tt of [.7, .5]) { AC.tells = [{ k: 'rear', t: tt, x: 300, y: 270, n: 1 }]; let n = 0; const P = CanvasRenderingContext2D.prototype, s = P.stroke, f = P.fill, di = P.drawImage; P.stroke = function () { n++; return s.apply(this, arguments); }; P.fill = function () { n++; return f.apply(this, arguments); }; P.drawImage = function () { n++; return di.apply(this, arguments); }; const A = m.ART, sp = A.span, pc = A.pic; A.span = function () { n++; return sp.apply(this, arguments); }; A.pic = function () { n++; return pc.apply(this, arguments); };
    try { AC.draw(1); } finally { P.stroke = s; P.fill = f; P.drawImage = di; A.span = sp; A.pic = pc; AC.tells = []; } out[tt] = n; } return out; };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' }); await sleep(800);
  const br = await PW.chromium.launch(), errs = [];
  const open = async (q, vw = 390, vh = 763) => { const ctx = await br.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: 2, hasTouch: true, isMobile: true }), p = await ctx.newPage();
    p.on('pageerror', e => errs.push(q + ': ' + e.message)); await p.addInitScript(INSTR); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&nomusic=1${q}`); await p.waitForFunction(() => window.__mnr && __mnr.ART); await sleep(600); return { p, ctx }; };
  const run = async (q, o, vw, vh) => { const { p, ctx } = await open(q, vw, vh); const r = await p.evaluate(`(${RUN})(${JSON.stringify(Object.assign({ haz: HAZ.source }, o))})`); await ctx.close(); return r; };
  const pct = (a, q) => { const x = [...a].sort((p, r) => p - r); return x.length ? x[Math.min(x.length - 1, Math.floor(x.length * q))] : 0; };
  const STAGES = (process.env.STAGES || '2,6,10,14,20').split(',').map(Number), T = +(process.env.T || 60);
  const all = { 0: [], 1: [] };
  for (const s of STAGES) { const r0 = await run('&diet=0', { story: s, t: T, seed: 7 }), r1 = await run('&diet=1', { story: s, t: T, seed: 7 });
    all[0].push(...r0.objs); all[1].push(...r1.objs);
    console.log(`  st ${s}: objects/frame BEFORE med ${pct(r0.objs, .5)} p95 ${pct(r0.objs, .95)} max ${Math.max(0, ...r0.objs)} | AFTER med ${pct(r1.objs, .5)} p95 ${pct(r1.objs, .95)} max ${Math.max(0, ...r1.objs)}  [en/eb/pb/pt/ring/fx/fl med,p95 ${r0.comp.join(' ')} -> ${r1.comp.join(' ')}]  big rings before ${Math.max(0, ...r0.big)} after ${Math.max(0, ...r1.big)}${r1.bigEx ? ' (' + r1.bigEx.slice(0, 2).join(' | ') + ')' : ''}`);
    ok(`st ${s}: objects per frame p95 <= 64 (diet)`, pct(r1.objs, .95) <= 64, `p95 ${pct(r1.objs, .95)} (before ${pct(r0.objs, .95)})`);
    ok(`st ${s}: no cosmetic ring / explosion picture wider than 120 css px`, Math.max(0, ...r1.big) === 0, r1.bigEx ? r1.bigEx.slice(0, 3).join(' | ') : '');
    ok(`st ${s}: enemies drawn >= 32 css px (390x763)`, r1.sizes.length > 0 && Math.min(...r1.sizes) >= 32, `min ${Math.min(...r1.sizes).toFixed(1)} over ${r1.sizes.length} frames`);
    const H1 = r1.hud.filter(h => !h.boss), H0 = r0.hud.filter(h => !h.boss);
    ok(`st ${s}: lean HUD <= 6 items`, H1.length > 0 && Math.max(...H1.map(h => h.n)) <= 6, `max ${Math.max(...H1.map(h => h.n))} (before ${Math.max(0, ...H0.map(h => h.n))}) e.g. ${JSON.stringify(H1.sort((a, b) => b.n - a.n)[0] || {})}`); }
  console.log(`  ALL: objects/frame BEFORE med ${pct(all[0], .5)} p95 ${pct(all[0], .95)} max ${Math.max(...all[0])} | AFTER med ${pct(all[1], .5)} p95 ${pct(all[1], .95)} max ${Math.max(...all[1])}`);
  ok('objects per frame: median at least 30% lower than ?diet=0', pct(all[1], .5) <= .7 * pct(all[0], .5), `${pct(all[0], .5)} -> ${pct(all[1], .5)}`);
  { const r = await run('&diet=1', { story: 6, t: 30, seed: 7 }, 375, 553); ok('375x553: enemies drawn >= 32 css px', r.sizes.length > 0 && Math.min(...r.sizes) >= 32, `min ${Math.min(...r.sizes).toFixed(1)}, ${r.kc.toFixed(3)} css/unit`);
    ok('375x553: lean HUD <= 6 items', r.hud.length > 0 && Math.max(...r.hud.map(h => h.n)) <= 6, 'max ' + Math.max(...r.hud.map(h => h.n))); }
  { const r = await run('&diet=1', { story: 8, t: 200, seed: 7 }); const B = r.hud.filter(h => h.boss); ok('boss stage 8: lean HUD <= 6 items with the boss bar', B.length > 0 && Math.max(...B.map(h => h.n)) <= 6, `max ${Math.max(0, ...B.map(h => h.n))} over ${B.length} boss frames, e.g. ${JSON.stringify(B.sort((a, b) => b.n - a.n)[0] || {})}`);
    ok('boss stage 8: no cosmetic ring / explosion picture wider than 120 css px', Math.max(0, ...r.big) === 0, r.bigEx ? r.bigEx.slice(0, 3).join(' | ') : ''); }
  { const { p, ctx } = await open('&diet=1'); await p.evaluate(() => { __mnr.god = true; __mnr.startStory(6); __mnr.simOn(true); for (let i = 0; i < 120; i++)__mnr.step(1 / 60); }); const r = await p.evaluate(`(${TELL})()`); await ctx.close();
    ok('flank tell: hidden 0.7 s before the entry, drawn in the last 0.6 s', r && r[.7] === 0 && r[.5] > 0, JSON.stringify(r)); }
  { const { p, ctx } = await open('&diet=1'); const r = await p.evaluate(() => { const m = __mnr; m.setVal('hud', 'full'); return { full: !window.DIET.lean(), lab: [...document.querySelectorAll('#setBody .seg span')].some(s => /HUD/.test(s.textContent)) }; }); await ctx.close();
    ok('Settings HUD Full turns the full HUD back on (HEAT, LINE, multiplier)', r.full && r.lab, JSON.stringify(r)); }
  { const { p, ctx } = await open('&diet=0'); const r = await p.evaluate(() => ({ on: !!(window.DIET && DIET.on), render: /DIET\./.test(__mnr.render.toString()) })); await ctx.close();
    ok('?diet=0 installs nothing (the game exactly as before)', !r.on && !r.render, JSON.stringify(r)); }
  ok('no page errors', !errs.length, errs.slice(0, 3).join(' | '));
  await br.close(); srv.kill(); process.exit(bad ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
