#!/usr/bin/env node
// CALM gate (parts/calm.js, flag RET.calm, default ON, ?calm=0 = before): on a 390x763 phone, Legend stage 10 and Normal stage 6:
// the rule banner never touches the middle 60% of the field and lasts <= 2.5 s; pictured beams are <= 12 css px thick (alpha <= .8); no enemy wears more than 2 rings. PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/calm-test.js        env: STEPS=4200 Q='&calm=0' (measure the old look, gates are skipped)
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const ok = (n, p, i) => { if (!p) fails++; console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + JSON.stringify(i))); };
const PROBE = () => {
  window.__p = 0; Error.stackTraceLimit = 30; window.__ban = []; window.__beam = []; window.__ring = {};
  const P = CanvasRenderingContext2D.prototype, tx = c => c.getTransform();
  const fr = P.fillRect; P.fillRect = function (x, y, w, h) {
    if (window.__p && typeof this.fillStyle === 'string' && /^(#05030c(bb|d0)|rgba\(5, 3, 12)/i.test(this.fillStyle) && w > 100) { const t = tx(this); window.__ban.push([y * t.d + t.f, h * t.d, this.canvas.height]); }
    return fr.apply(this, arguments); };
  const di = P.drawImage; P.drawImage = function (im) {
    if (window.__p && this.globalCompositeOperation === 'lighter') { const a = arguments, n = a.length, W = Math.abs(n >= 9 ? a[7] : a[3]), H = Math.abs(n >= 9 ? a[8] : a[4]), t = tx(this), s = Math.hypot(t.a, t.b);
      if (!/SPR\.|drawAnim/.test(new Error().stack) && W && H && W * s < 700 && H * s < 700 && Math.max(W, H) / Math.min(W, H) >= 3 && Math.max(W, H) * s >= 60) window.__beam.push([Math.min(W, H) * s, this.globalAlpha, new Error().stack.split('\n').slice(2, 9).map(l => (l.match(/at (\S+).*:(\d+):\d+\)?$/) || []).slice(1).join('@')).join('<')]); }
    return di.apply(this, arguments); };
  let arc = null; const ar = P.arc, bp = P.beginPath, st = P.stroke;
  P.beginPath = function () { arc = null; return bp.apply(this, arguments); };
  P.arc = function (x, y, r, s, e) { arc = (Math.abs((e || 0) - (s || 0)) >= 6 && r >= 8 && r <= 90) ? [x, y, r] : null; return ar.apply(this, arguments); };
  P.stroke = function () { if (window.__p && arc && !arguments.length && /drawEnemy|CTR\.draw|\.tells/.test(new Error().stack)) { window.__arcs = (window.__arcs || 0) + 1; const t = tx(this), cx = t.a * arc[0] + t.c * arc[1] + t.e, cy = t.b * arc[0] + t.d * arc[1] + t.f, k = Math.round(cx / 6) + ',' + Math.round(cy / 6);
      const m = window.__ring[window.__fr] || (window.__ring[window.__fr] = new Map()); const q = m.get(k) || { n: 0, d: [] }; q.n++; q.d.push(Math.round(arc[2]) + ':' + this.strokeStyle + ':' + this.getLineDash().length + ':' + new Error().stack.split('\n').slice(2, 4).map(l => (l.match(/at (\S+)/) || [])[1]).join('<')); m.set(k, q); }
    return st.apply(this, arguments); };
};
const RUN = new Function('o', `
  const m = window.__mnr; let sd = 7; Math.random = () => { sd = (sd + 0x6D2B79F5) >>> 0; let t = sd; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  m.SET.diff = o.diff; try { m.applySet(); } catch (e) {} m.god = true; m.startStory(o.n); m.simOn(true);
  let ringWho = '', rule = 0, ruleMax = 0, ban = [], beams = [], ringMax = 0, frames = 0;
  for (let i = 0; i < o.steps && m.running; i++) { if (m.SH && m.SH.active) m.SH.close(); if (i % 20 === 0) m.press('Fire'); if (i % 3 === 0) m.touchTo(195 + 150 * Math.sin(i / 50), 520 + 120 * Math.sin(i / 37));
    if (i % 90 === 0) { const w = ['laser', 'frost', 'rail']; try { if (m.WP && WP.eq) WP.eq[0] = w[(i / 90 | 0) % 3]; } catch (e) {} }
    m.step(1 / 60); const b = m.G.banner; if (b && b.t > 0 && /^RULE/.test(b.a || '')) ruleMax = Math.max(ruleMax, b.m);
    if (i % 6 === 0) { window.__fr = ++frames; window.__ban.length = 0; window.__p = 1; try { m.render(m.G.t, 1 / 60); } catch (e) {} window.__p = 0;
      if (b && b.t > 0 && /^RULE/.test(b.a || '')) for (const r of window.__ban) ban.push(r); for (const r of window.__beam) beams.push(r); window.__beam.length = 0;
      const rm = window.__ring[window.__fr]; if (rm) for (const v of rm.values()) { if (v.n > ringMax) { ringMax = v.n; ringWho = v.d.join(' | '); } } delete window.__ring[window.__fr]; } }
  const r = { n: o.n, ruleMax, ban: ban.length, banTop: ban.length ? Math.min(...ban.map(q => q[0] / q[2])) : null, banBot: ban.length ? Math.max(...ban.map(q => (q[0] + q[1]) / q[2])) : null,
    beams: beams.length, beamMax: beams.length ? Math.max(...beams.map(q => q[0])) : 0, beamAt: beams.length ? beams.reduce((a, q) => q[0] > a[0] ? q : a)[2] : '', alphaMax: beams.length ? Math.max(...beams.map(q => q[1])) : 0, ringMax, ringWho, arcs: window.__arcs || 0, calm: !!(window.RET && RET.calm), t: m.G.t }; m.abort(); return r;`);
(async () => {
  const port = await new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
  const srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' }); await sleep(800);
  const browser = await PW.chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' }).catch(() => PW.chromium.launch());
  const q = process.env.Q || '', old = /calm=0/.test(q), errs = [];
  try {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 }); await ctx.addInitScript(PROBE);
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto('http://127.0.0.1:' + port + '/index.html?sim=1&all=1' + q); await p.waitForFunction(() => window.__mnr && document.getElementById('startBtn')); await sleep(600);
    for (const s of [{ diff: 'legend', n: 10 }, { diff: 'normal', n: 6 }]) {
      const r = await p.evaluate(RUN, Object.assign({ steps: +(process.env.STEPS || 4200) }, s)), tag = s.diff + ' st' + s.n;
      console.log('INFO ' + tag + ' ' + JSON.stringify(r));
      if (old) { continue; }
      ok(tag + ': flag on', r.calm);
      if (r.ban) ok(tag + ': rule banner stays out of the middle 60% of the field (top < .2 or bottom > .8 of height; seen ' + r.banTop.toFixed(2) + '-' + r.banBot.toFixed(2) + ')', r.banBot <= .2 || r.banTop >= .8);
      else console.log('INFO ' + tag + ': no rule banner drawn in the sample');
      ok(tag + ': rule banner lasts <= 2.5 s', r.ruleMax <= 2.5, r.ruleMax);
      ok(tag + ': pictured beams <= 12 css px thick, alpha <= .8 (' + r.beams + ' seen, max ' + r.beamMax.toFixed(1) + ')', r.beamMax <= 12.5 && r.alphaMax <= .8, r);
      ok(tag + ': at most 2 rings per enemy (max ' + r.ringMax + ')', r.ringMax <= 2, r.ringMax);
    }
    ok('no page errors', errs.length === 0, errs.slice(0, 2));
  } finally { await browser.close(); srv.kill(); }
  process.exit(fails ? 1 : 0);
})();
