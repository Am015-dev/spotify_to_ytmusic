// OPEN SHOTS (W310): screenshots of the first 10 seconds, flight and street, at 3 / 6 / 10 s of game time, phone 390x763 and PC 1440x860.
// Start by a real tap/click (FLIGHT / ON FOOT), then the clock is stepped (__mnr.step / FOOT.sim), the ship and Kai get no input; two frames paint before each shot.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/open-shots.js   env: OUT=/tmp/w310 (never a source folder) Q=<extra query>
const L = require('./lib.js'), { sleep } = L, fs = require('fs'), path = require('path');
const OUT = process.env.OUT || '/tmp/w310', Q = process.env.Q || ''; fs.mkdirSync(OUT, { recursive: true });
const DEV = { phone: { W: 390, H: 763, touch: true }, pc: { W: 1440, H: 860, touch: false } };
const frames = p => p.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
(async () => {
  const b = await L.boot();
  for (const dn of ['phone', 'pc']) { const d = DEV[dn];
    for (const mode of ['flight', 'street']) {
      const ctx = await b.br.newContext({ viewport: { width: d.W, height: d.H }, deviceScaleFactor: 1, hasTouch: d.touch, isMobile: d.touch, userAgent: d.touch ? L.UA : undefined });
      const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
      await p.addInitScript(() => { let a = 7; Math.random = () => { a = a * 16807 % 2147483647; return a / 2147483647; }; window.AudioContext = undefined; window.webkitAudioContext = undefined; try { localStorage.setItem('mnr_tipdone', 'true'); localStorage.setItem('mnr_fscard', '99'); } catch (e) { } });
      await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
      await p.goto(b.base + '?nomusic=1' + Q, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.FOOT && FOOT.S3, null, { timeout: 20000 });
      await p.waitForFunction(() => document.documentElement.classList.contains('rdy'), null, { timeout: 15000 }).catch(() => { }); await sleep(500);
      const tap = async id => { const r = await p.evaluate(id => { const e = document.getElementById(id); if (!e || !e.offsetParent) return null; const q = e.getBoundingClientRect(); return [q.left + q.width / 2, q.top + q.height / 2]; }, id); if (!r) return false; if (d.touch) await p.touchscreen.tap(r[0], r[1]); else await p.mouse.click(r[0], r[1]); return true; };
      if (mode === 'flight') {
        if (!await tap('focFlight')) { console.log(`FAIL ${dn} flight: no FLIGHT button`); await ctx.close(); continue; }
        for (let i = 0; i < 40 && !(await p.evaluate(() => !!window.__mnr.G.live)); i++) await sleep(100);
        await p.evaluate(() => window.__mnr.simOn(true));
        for (const T of [3, 6, 10]) { await p.evaluate(T => { const m = window.__mnr; while (m.G.t < T && m.G.live) m.step(1 / 60); try { m.render(); } catch (e) { } }, T); await frames(p);
          const info = await p.evaluate(() => { const G = window.__mnr.G; return `t ${G.t.toFixed(1)} foes ${G.en.filter(e => !e.dead && e.hp > 0).length} enemy shots ${G.eb.length} banner ${G.banner ? JSON.stringify([G.banner.t || G.banner.a, G.banner.s || G.banner.b]).slice(0, 80) : '-'}`; });
          await p.screenshot({ path: path.join(OUT, `${dn}-flight-${T}s.jpg`), type: 'jpeg', quality: 60 }); console.log(`shot ${dn} flight ${T}s: ${info}`); }
      } else {
        if (!await tap('focFoot')) { console.log(`FAIL ${dn} street: no ON FOOT button`); await ctx.close(); continue; }
        for (let i = 0; i < 20 && !(await p.evaluate(() => !!(window.FOOT.S && window.FOOT.on))); i++) { await sleep(300); for (const c of ['taleTc', 'taleCard']) await tap(c); }
        for (let i = 0; i < 40 && await p.evaluate(() => { const l = document.getElementById('footL'); return !!l && !l.hidden && l.offsetParent !== null; }); i++) await sleep(150);
        for (const T of [3, 6, 10]) { await p.evaluate(T => { while (FOOT.S && FOOT.S.time < T && !FOOT.S.end) FOOT.sim(1 / 60, 1 / 60); }, T); await frames(p);
          const info = await p.evaluate(() => { const S = FOOT.S, vw = FOOT.env.G.viewW || 960; return `t ${S.time.toFixed(1)} foes in view ${S.E.filter(e => !e.dead && e.x > S.camX && e.x < S.camX + vw).length} (spawned ${S.E.length}) Kai x ${Math.round(S.P.x)} cam ${Math.round(S.camX)} vw ${Math.round(vw)}`; });
          await p.screenshot({ path: path.join(OUT, `${dn}-street-${T}s.jpg`), type: 'jpeg', quality: 60 }); console.log(`shot ${dn} street ${T}s: ${info}`); }
      }
      if (errs.length) console.log(`FAIL ${dn} ${mode} page errors: ${errs.join(' | ')}`);
      await ctx.close(); } }
  await b.close();
})();
