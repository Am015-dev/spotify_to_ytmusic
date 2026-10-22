#!/usr/bin/env node
// review 9 #1 + #9 gate (parts/calm.js stage-title chip, parts/bossvis.js boss text), flag RET.calm (?calm=0 = before). 390x763 phone. PASS/FAIL lines only.
//   #1: while enemies are alive, no banner band touches the middle 60% of the field, the title chip is <= 28 css px tall and lasts <= 2 s (stages 1, 6, 10)
//   #4 (review 10): the boss intro is the same small chip (<= 2 s, <= 28 px, not in the middle 60%)
//   #9: while a boss is up, no wave text (READY / NEXT WAVE) is visible and no text except the boss's own (name, ARMOUR, SAFE LANE, FIREWALL) is drawn over the boss rectangle
//   NODE_PATH=$(npm root -g) node games-src/nightrun/review9-test.js      env: GAME_DIR=<dir>
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const ok = (n, p, i) => { if (!p) fails++; console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + JSON.stringify(i))); };
const STAGE = o => {
  const m = window.__mnr; let sd = 7; Math.random = () => { sd = (sd + 0x6D2B79F5) >>> 0; let t = sd; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const P = CanvasRenderingContext2D.prototype, fr = P.fillRect, bands = []; let on = 0;
  P.fillRect = function (x, y, w, h) { if (on && typeof this.fillStyle === 'string' && /^#05030c(bb|d0)/i.test(this.fillStyle) && w > 100) { const t = this.getTransform(); bands.push([(y * t.d + t.f) / t.d, h, m.H]); } return fr.apply(this, arguments); };
  m.SET.diff = 'normal'; try { m.applySet(); } catch (e) {} m.god = true; m.startStory(o.n); m.simOn(true);
  let maxT = 0, seenEn = 0, lo = 1e9, hi = -1e9, hh = 0, titleSm = null;
  for (let i = 0; i < 60 * 8 && m.running; i++) { if (i % 20 === 0) m.press('Fire'); m.step(1 / 60); const b = m.G.banner;
    if (i === 2) titleSm = !!(b && b.sm); if (b && b.t > 0 && i < 60 * 3) maxT = Math.max(maxT, b.m);
    if (i % 5 === 0) { bands.length = 0; on = 1; try { m.render(m.G.t, 1 / 60); } catch (e) {} on = 0;
      if (b && b.t > 0 && !b.warn && m.G.en.length > 0) { seenEn++; for (const q of bands) { lo = Math.min(lo, q[0] / q[2]); hi = Math.max(hi, (q[0] + q[1]) / q[2]); hh = Math.max(hh, q[1]); } } } }
  P.fillRect = fr; return { n: o.n, titleSm, maxT, seenEn, lo, hi, hh };
};
(async () => {
  const port = await new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
  const srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' }); await sleep(800);
  const br = await PW.chromium.launch();
  const page = async (q) => { const c = await br.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 }), p = await c.newPage();
    p.on('pageerror', e => ok('no page error', false, e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1${q}`); await p.waitForFunction(() => window.__mnr, null, { timeout: 20000 }); return [c, p]; };
  let en = 0;
  for (const n of [1, 6, 10]) {
    const [c, p] = await page(''); const r = await p.evaluate(STAGE, { n });
    ok(`stage ${n}: title banner is the small chip`, r.titleSm, r);
    ok(`stage ${n}: chip lasts <= 2 s`, r.maxT <= 2.001, r);
    ok(`stage ${n}: no banner pixels in the middle 60% while enemies live`, r.seenEn === 0 || (r.lo >= .2 - 1e-6 && r.hi <= .8 + 1e-6), r);
    ok(`stage ${n}: chip <= 28 px tall`, r.hh <= 28, r); en += r.seenEn; await c.close();
  }
  ok('banner frames with live enemies were measured', en > 0, { en });
  for (const id of ['sek-adler', 'hoplite']) {
    const [c, p] = await page('&bpauto=1&boss=' + id);
    // review 10 #4: the boss intro is the same top chip as the stage title: <= 2 s, <= 28 px, no band pixels in the middle 60%
    const bi = await p.evaluate(() => { const m = __mnr, P = CanvasRenderingContext2D.prototype, fr = P.fillRect, bands = []; let on = 0;
      P.fillRect = function (x, y, w, h) { if (on && typeof this.fillStyle === 'string' && /^#05030c/i.test(this.fillStyle) && w > 100) { const t = this.getTransform(); bands.push([(y * t.d + t.f) / t.d, h, m.H]); } return fr.apply(this, arguments); };
      for (let i = 0; i < 60 * 120 && !(m.G.banner && m.G.banner.warn && m.G.banner.t > 0); i++) { m.P.hp = 99; m.step(1 / 60); }
      const b0 = m.G.banner, r = { found: !!(b0 && b0.warn), sm: !!(b0 && b0.sm), maxT: 0, hh: 0, bad: 0 };
      if (r.found) for (let i = 0; i < 150; i++) { const b = m.G.banner; if (b && b.t > 0) r.maxT = Math.max(r.maxT, b.m); m.P.hp = 99; m.step(1 / 60);
        if (i % 5 === 0) { bands.length = 0; on = 1; try { m.render(m.G.t, 1 / 60); } catch (e) {} on = 0;
          for (const q of bands) { r.hh = Math.max(r.hh, q[1]); const f0 = q[0] / q[2], f1 = (q[0] + q[1]) / q[2]; if (f1 > .2 && f0 < .8) r.bad++; } } }
      P.fillRect = fr; return r; });
    ok(`boss ${id}: boss intro found`, bi.found, bi);
    ok(`boss ${id}: boss intro is the small chip`, bi.sm, bi);
    ok(`boss ${id}: boss intro chip lasts <= 2 s`, bi.maxT <= 2.001, bi);
    ok(`boss ${id}: boss intro chip <= 28 px tall`, bi.hh <= 28, bi);
    ok(`boss ${id}: no banner pixels in the middle 60% during the boss intro`, bi.bad === 0, bi);
    await p.waitForFunction(() => __mnr.G && __mnr.G.boss && __mnr.G.boss.x <= 791, null, { timeout: 40000 });
    const r = await p.evaluate(() => { const m = __mnr, P = CanvasRenderingContext2D.prototype, ft = P.fillText, bad = []; let on = 0;
      P.fillText = function (t, x, y) { if (on && BV.rect) { const T = this.getTransform(), cx = x * T.a + y * T.c + T.e, cy = x * T.b + y * T.d + T.f, R = BV.rect, s = R.s, q = Math.max(R.hw, R.hh) * s; if (Math.abs(cx - R.cx) < q * .8 && Math.abs(cy - R.cy) < q * .8 && !/ARMOUR|SAFE LANE|FIREWALL|PHASE|NEW ATTACK|BREAK|OPEN|\d\/3/.test(String(t)) && !String(t).startsWith(m.G.boss.nm)) bad.push(String(t)); } return ft.apply(this, arguments); };
      let rdyVis = 0; LEAK.rdy(true); for (let i = 0; i < 600; i++) { m.P.hp = 99; m.step(1 / 60); const e = document.getElementById('retReady'); if (e && e.style.display !== 'none') rdyVis++; if (i % 10 === 0) { on = 1; try { m.render(m.G.t, 1 / 60); } catch (e) {} on = 0; } }
      P.fillText = ft; return { bad: [...new Set(bad)].slice(0, 6), rdyVis }; });
    ok(`boss ${id}: no wave text while the boss is up`, r.rdyVis === 0, r);
    ok(`boss ${id}: 0 non-boss text over the boss rect`, r.bad.length === 0, r); await c.close();
  }
  await br.close(); srv.kill(); console.log(fails ? `FAIL ${fails}` : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
