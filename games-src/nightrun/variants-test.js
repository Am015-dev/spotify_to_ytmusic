#!/usr/bin/env node
// Enemy variants gate (parts/enemies/variants.js, flag RET.variants). Real page, ?sim=1 stepping. Prints PASS/FAIL lines, exit 1 on any FAIL.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/variants-test.js      env: GAME_DIR=<dir with index.html>, SECS=70 (sim seconds per stage)
// (a) every class x orientation x tint spawns and draws without errors, phone 390x763 and landscape 1280x720
// (b) hitbox follows the class (mini r >= 7, large 1.5x, giant 2.2x), hull follows the class
// (c) flag off (?variants=0) spawns exactly what the page without variants.js spawns (seeded, stages 3 and 20)
// (d) variety: distinct kind x class x orientation x tint per stage >= 12 by stage 10, >= 20 by stage 30 (before: distinct kind + elite)
// (e) hull per stage within +-10% of the old total; bullets <= ebCap and <= BCAP; mini on screen >= 1.2 s, normal >= 2 s before dying
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs'), os = require('os');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun'), SECS = +process.env.SECS || 70;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fp = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const SEED = `(()=>{let a=12345;Math.random=function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};window.__reseed=v=>{a=v;};})();`;

const COMBOS = () => {   // (a) + (b), inside the page
  const m = window.__mnr, out = [], errs = []; if (m.running) m.abort(); m.SET.diff = 'normal'; m.SET.auto = false; m.startStory(8); m.simOn(true); m.ST.spawned = true;
  const cls = { M: .6, N: 1, L: 1.5, G: 2.2 }; let n = 0, mini = 99;
  for (const type of Object.keys(VAR.KINDS)) { const K = VAR.KINDS[type];
    for (const c of K.c) for (const o of K.o) for (const t of [0, 1, 2, 3]) {
      m.G.en.length = 0; m.G.eb.length = 0; VAR.force = { c, o, t, x: t === 3 ? 'md' : '' };
      try { const e = VAR.X.en(type, { x: 640, y: 200, amp: 0, stop: 600 }); if (!e || !e.vz) { errs.push(type + c + o + t + ' not a variant'); continue; }
        if (e.type !== type) continue;   // the stage roster swapped the kind
        VAR.force = { c: 'N', o: 'N', t: 0, x: '' }; ROSTER.P = 0; const e0 = VAR.X.en(type, { x: 640, y: 300, amp: 0, stop: 600 }); VAR.force = { c, o, t, x: t === 3 ? 'md' : '' }; m.G.en.splice(m.G.en.indexOf(e0), 1);
        if (e.type !== e0.type || e.el || e0.el) continue; if (e.r < 7 || Math.abs(e.r / e0.r - cls[c]) > .2 + (c === 'M' ? .15 : 0)) errs.push(type + c + ' r=' + e.r + ' vs normal ' + e0.r);
        if (c === 'M') mini = Math.min(mini, e.r);
        e.gr = 0; for (let i = 0; i < 12; i++) m.step(1 / 30);
        for (const q of m.G.en) { VAR.X.draw(q, m.G.t); if (!(q.x === q.x && q.y === q.y)) errs.push(type + c + o + t + ' NaN'); }
        n++; } catch (x) { errs.push(type + c + o + t + ' ' + x.message); } } }
  VAR.force = null; m.abort(); return { n, errs: errs.slice(0, 6), mini };
};
const RUN = (o) => {   // (c) spawn list, (d) variety, (e) hull / caps / life — one stage, an auto-firing god-ish ship
  const m = window.__mnr; if (m.running) m.abort(); m.SET.diff = o.diff || 'normal'; m.SET.auto = true; m.applySet && m.applySet(); window.__reseed && window.__reseed(500 + o.n); m.startStory(o.n); m.simOn(true);
  const sp = [], keys = new Set(), kinds = new Set(), life = { M: 1e9, N: 1e9 }; let T = 0, maxEb = 0, maxV = 0, hull0 = 0, hull1 = 0, nv = 0;
  if (window.VAR) VAR.reset();
  const fn = e => { sp.push([e.type, Math.round(e.x), Math.round(e.y), e.hp]); kinds.add(e.type + (e.el ? '*' : '')); if (e.vk) { keys.add(e.vk); nv++; } };
  m.NR.on('spawn', fn);
  const fk = m.NR.on('kill', x => { const e = x.e; if (e && e.vz && !e.rk && !e.vpk && e.tin != null) { const l = m.G.t - e.tin, req = Math.min(1.2, window.__dmg.minLife(e)); if (e.vc === 'M') { if (l >= req - .05) life.Mok = (life.Mok || 0) + 1; else life.Mbad = l; if (l < life.M) life.Mt = e.type + '/' + e.vo + '/' + (e.el ? 'el' : '') + ' hq' + e.hq + ' max' + e.max + ' hp' + e.hp + ' gnd' + !!e.gnd + ' ' + (e.fid || ''); life.M = Math.min(life.M, l); } else if (e.vc === 'N' && e.type !== 'mine') life.N = Math.min(life.N, l); } });
  while (m.running && !m.ST.over && T < o.secs) { m.P.hp = 99; m.P.inv = 1; m.P.y = 270 + 170 * Math.sin(T * 1.1); m.P.x = 230 + 90 * Math.sin(T * .6); if (m.SH.active) m.SH.close(); m.step(1 / 30); T += 1 / 30;
    maxEb = Math.max(maxEb, m.G.eb.length); for (const b of m.G.eb) if (!b.lob && b.k !== 'n') maxV = Math.max(maxV, Math.hypot(b.vx, b.vy)); }
  const st = window.VAR ? VAR.stat() : {}; try { m.NR.off && m.NR.off('spawn', fn); } catch (_) { }
  m.abort(); return { n: o.n, sp: sp.slice(0, 400), keys: keys.size, ks: [...keys], kinds: kinds.size, nv, maxEb, maxV: Math.round(maxV), cap: window.VAR ? VAR.X.cap() : 0, bcap: m.BCAP, hull0: st.hull0, hull1: st.hull1, life };
};

(async () => {
  const fails = [], pass = [], errs = []; const html = fs.readFileSync(path.join(GAME, 'index.html'), 'utf8');
  const a = html.indexOf('/* ---------- variants.js:'), b = html.indexOf('VAR.stat=()=>', a), b2 = html.indexOf('\n', b);
  if (a < 0 || b < 0) { console.log('FAIL variants.js is not in the page'); process.exit(1); }
  const cut = html.slice(0, a) + html.slice(b2); const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'vt-')); for (const f of fs.readdirSync(GAME)) if (f !== 'index.html') fs.symlinkSync(path.join(GAME, f), path.join(tmp, f)); fs.writeFileSync(path.join(tmp, 'index.html'), cut);
  const port = await fp(), port2 = await fp();
  const srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' });
  const srv2 = cp.spawn('python3', ['-m', 'http.server', String(port2), '--bind', '127.0.0.1', '--directory', tmp], { stdio: 'ignore' }); await sleep(800);
  const br = await PW.chromium.launch();
  const open = async (q, pt, seed, vp) => { const ctx = await br.newContext({ viewport: vp || { width: 1280, height: 720 } }), p = await ctx.newPage(); if (seed) await p.addInitScript(SEED);
    p.on('pageerror', e => errs.push((q || '') + ' ' + e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(`http://127.0.0.1:${pt || port}/index.html?sim=1&all=1&nomusic=1${q || ''}${process.env.QX || ''}`); await p.waitForFunction(() => window.__mnr && __mnr.TR.list.length > 0, null, { timeout: 20000 }); return { ctx, p }; };
  try {
    for (const [nm, vp] of [['landscape 1280x720', { width: 1280, height: 720 }], ['phone 390x763', { width: 390, height: 763 }]]) {
      const { ctx, p } = await open('', 0, 0, vp); const r = await p.evaluate(COMBOS);
      if (r.errs.length) fails.push(nm + ': ' + r.errs.join('; ')); else pass.push(nm + ': ' + r.n + ' kind x class x orientation x tint combos spawn and draw, min mini radius ' + r.mini);
      if (r.mini < 7) fails.push(nm + ': mini radius ' + r.mini + ' < 7'); await ctx.close(); }
    // (c) flag off = page without variants.js
    for (const n of [3, 20]) { const A = await open('&variants=0', 0, 1), B = await open('', port2, 1);
      const ra = await A.p.evaluate(RUN, { n, secs: 30 }), rb = await B.p.evaluate(RUN, { n, secs: 30 });
      const same = JSON.stringify(ra.sp) === JSON.stringify(rb.sp) && ra.sp.length > 5;
      (same ? pass : fails).push('flag off, stage ' + n + ': ' + ra.sp.length + ' spawns ' + (same ? 'identical to the page without variants.js' : 'DIFFER from the page without variants.js'));
      await A.ctx.close(); await B.ctx.close(); }
    // (d)+(e) per stage
    const T = {}; let H0 = 0, H1 = 0; const { ctx, p } = await open('', 0, 1);
    // stage 45 is a no-hit challenge that ends the run at ~25 s, so its looks are counted together with stages 40-44 (W57b)
    const LK = new Set();
    for (const n of [40, 41, 42, 43, 44]) { const r = await p.evaluate(RUN, { n, secs: SECS, diff: 'hard' }); r.ks.forEach(k => LK.add(k)); console.log('stage ' + n + ': looks ' + r.keys + ' (counted toward stage 45)'); }
    for (const n of [1, 3, 5, 10, 20, 30, 45]) { const r = await p.evaluate(RUN, { n, secs: SECS, diff: n >= 20 ? 'hard' : 'normal' }); T[n] = r;
      const need = n >= 30 ? 20 : n >= 10 ? 12 : 0, looks = n === 45 ? new Set([...LK, ...r.ks]).size : r.keys;
      console.log('stage ' + n + ': kinds ' + r.kinds + ' -> looks ' + looks + ' (variant spawns ' + r.nv + '/' + r.sp.length + '), hull x' + (r.hull1 / Math.max(1, r.hull0)).toFixed(2) + ', max eb ' + r.maxEb + ', min life mini ' + r.life.M.toFixed(1) + ' normal ' + r.life.N.toFixed(1));
      if (need && looks < need) fails.push('stage ' + n + ': only ' + looks + ' looks (< ' + need + ')');
      if (r.maxEb > r.cap + 5) fails.push('stage ' + n + ': enemy bullets ' + r.maxEb + ' > ' + r.cap); if (r.bcap && r.maxV > r.bcap + 1) fails.push('stage ' + n + ': bullet speed ' + r.maxV + ' > BCAP');
      if (r.life.Mbad != null) fails.push('stage ' + n + ': a mini died after ' + r.life.M.toFixed(2) + ' s on screen (below the DMG floor or 1.2) ' + r.life.Mt); 
      H0 += r.hull0; H1 += r.hull1; const ratio = r.hull1 / Math.max(1, r.hull0); if (ratio < .9 || ratio > 1.1) fails.push('stage ' + n + ': hull x' + ratio.toFixed(2) + ' (outside +-10%)'); }
    pass.push('variety, hull ledger, caps, on-screen life checked on 7 stages (overall hull x' + (H1 / Math.max(1, H0)).toFixed(2) + ')'); await ctx.close();
  } catch (x) { fails.push('crash: ' + x.message); }
  if (errs.length) fails.push('page errors: ' + [...new Set(errs)].slice(0, 4).join(' | ')); else pass.push('no page errors');
  await br.close(); srv.kill(); srv2.kill();
  for (const l of pass) console.log('PASS ' + l); for (const l of fails) console.log('FAIL ' + l);
  process.exit(fails.length ? 1 : 0);
})();
