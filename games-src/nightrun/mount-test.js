#!/usr/bin/env node
// Nightrun weapon-mount test (real page, headless). Prints pass/fail lines only. Pixels are probed in memory, nothing is saved.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/mount-test.js        env: GAME_DIR=<dir>   FRAMES=120
// 1 every ship x a sample of weapon pairs: 120 frames of the real step+render, no page error; the mount colour is found at the hardpoint (circle slot 1, triangle slot 2)
// 2 the WEAPONS sheet and the Garage preview at 390x763: the ship picture is inside its card/screen, no horizontal overflow
// 3 frame cost with mounts on vs off (RIG.on) <= 0.2 ms per frame
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const FR = +process.env.FRAMES || 120;
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(); const fails = [], perr = [];
  const p = await br.newPage({ viewport: { width: 960, height: 540 } }); p.on('pageerror', e => perr.push(e.message));
  await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1&nomusic=1`); await p.waitForFunction(() => window.__mnr && window.__wp && window.__rig, null, { timeout: 10000 });
  await new Promise(r => setTimeout(r, 1200));
  // WPD colours are not exposed: read them from the sheet cards (--c) and hand them to the page
  const cols = await p.evaluate(() => { const o = {}; window.__wp.show && window.__wp.show('pit'); for (const b of document.querySelectorAll('#wpL .card')) o[b.dataset.id] = getComputedStyle(b).getPropertyValue('--c').trim(); window.__wp.hide(); return o; });
  await p.evaluate(c => { window.__wpc = c; window.__wpd = c; }, cols);
  const r1b = await p.evaluate(({ FR }) => {
    const m = window.__mnr, wp = window.__wp, rig = window.__rig, out = [], W = 60, all = Object.keys(window.__wpd);
    const pairs = [[all[0], null], [all[0], all[1]], [all[2], all[3]], [all[4], all[5]], [all[all.length - 1], all[0]]];
    const hexRgb = h => { h = h.replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); return [0, 2, 4].map(i => parseInt(h.substr(i, 2), 16)); };
    for (const s of rig.SHIPS) for (const [a, b] of pairs) {
      const errs = []; let ok = true;
      try {
        rig.GA.ship = s.id; m.startStory(1); m.simOn(true); m.god = true; wp.eq = [a, b]; wp._fk = null; wp.sync();
        for (let i = 0; i < FR; i++) { if (m.SH.active) m.SH.close(); m.P.hp = m.P.max; m.step(1 / 60); m.render && m.render(); }
        const cv = document.createElement('canvas'); cv.width = 200; cv.height = 120; const c = cv.getContext('2d', { willReadFrequently: true }); c.translate(100, 60);
        rig.fl[0] = rig.fl[1] = 0; rig.draw(c, s.id, W, 0, 0);
        for (let sl = 0; sl < 2; sl++) {
          const id = [a, b][sl]; if (!id) continue; const q = rig.pt(s.id, sl), x = Math.round(100 + q[0] * W), y = Math.round(60 + q[1] * W), rgb = hexRgb(window.__wpc[id]);
          const d = c.getImageData(x - 2, y - 2, 5, 5).data; let hit = false;
          for (let k = 0; k < 25; k++) if (Math.abs(d[k * 4] - rgb[0]) < 40 && Math.abs(d[k * 4 + 1] - rgb[1]) < 40 && Math.abs(d[k * 4 + 2] - rgb[2]) < 40 && d[k * 4 + 3] > 200) hit = true;
          if (!hit) { ok = false; errs.push('no ' + id + ' colour at slot ' + (sl + 1)); }
        }
      } catch (x) { ok = false; errs.push(x.message); }
      out.push({ ship: s.id, pair: a + '+' + b, ok, errs });
    }
    m.abort(); return out;
  }, { FR });
  let n = 0; for (const r of r1b) { n++; if (!r.ok) fails.push(`${r.ship} ${r.pair}: ${r.errs.join('; ')}`); }
  if (perr.length) fails.push('page errors: ' + [...new Set(perr)].slice(0, 3).join(' | '));
  console.log(`${fails.length ? 'FAIL' : 'PASS'} in-run mounts: ${n} ship x pair runs of ${FR} frames`);
  // 2 sheet + garage at 390x763
  const q = await br.newPage({ viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true }); const e2 = []; q.on('pageerror', e => e2.push(e.message));
  await q.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1&nomusic=1`); await q.waitForFunction(() => window.__rig, null, { timeout: 10000 }); await new Promise(r => setTimeout(r, 1500));
  const lay = await q.evaluate(() => {
    const o = [], rig = window.__rig, wp = window.__wp; const de = document.documentElement;
    for (const s of rig.SHIPS) {
      rig.GA.ship = s.id; wp.eq = ['pulse', 'laser']; wp._fk = null; wp.show('title'); const cv = document.getElementById('wpShip'), r = cv.getBoundingClientRect(), st = document.getElementById('wpm').getBoundingClientRect();
      let px = 0; { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; for (let i = 3; i < d.length; i += 4) if (d[i] > 20) px++; }
      o.push({ t: 'sheet ' + s.id, ok: r.width > 150 && r.height > 40 && r.left >= st.left - 1 && r.right <= st.right + 1 && px > 200 && de.scrollWidth <= innerWidth + 1, info: [Math.round(r.width), Math.round(r.height), px, de.scrollWidth] });
      wp.hide();
    }
    return o;
  });
  for (const l of lay) if (!l.ok) fails.push(l.t + ' ' + JSON.stringify(l.info));
  console.log(`${lay.every(l => l.ok) ? 'PASS' : 'FAIL'} weapons sheet ship picture at 390x763 (${lay.length} ships)`);
  await q.evaluate(() => document.getElementById('gaBtn').click()); await new Promise(r => setTimeout(r, 600));
  const gl = await q.evaluate(() => { const cv = document.getElementById('gaPic'), r = cv.getBoundingClientRect(), de = document.documentElement; return { vis: r.width > 150 && r.height > 40, inside: r.left >= 0 && r.right <= innerWidth, ov: de.scrollWidth <= innerWidth + 1, w: Math.round(r.width) }; });
  if (!gl.vis || !gl.inside || !gl.ov) fails.push('garage picture ' + JSON.stringify(gl));
  console.log(`${gl.vis && gl.inside && gl.ov ? 'PASS' : 'FAIL'} garage ship picture at 390x763`);
  if (e2.length) fails.push('mobile page errors: ' + e2[0]);
  // 3 frame cost
  const cost = await p.evaluate(() => {
    const m = window.__mnr, wp = window.__wp, rig = window.__rig; rig.GA.ship = 'std'; wp.eq = ['pulse', 'laser']; wp._fk = null; wp.sync(); m.startStory(1); m.simOn(true); m.god = true;
    const run = on => { rig.on = on; for (let i = 0; i < 60; i++) { if (m.SH.active) m.SH.close(); m.step(1 / 60); m.render(); } const t0 = performance.now(); for (let i = 0; i < 300; i++) { if (m.SH.active) m.SH.close(); m.P.hp = m.P.max; m.step(1 / 60); m.render(); } return (performance.now() - t0) / 300; };
    const a = [], b = []; for (let k = 0; k < 4; k++) { a.push(run(false)); b.push(run(true)); } rig.on = true; m.abort();
    const md = x => x.sort((u, v) => u - v)[x.length >> 1]; return { off: md(a), on: md(b) };
  });
  const dlt = cost.on - cost.off; if (dlt > 0.2) fails.push(`frame cost +${dlt.toFixed(3)} ms`);
  console.log(`${dlt <= 0.2 ? 'PASS' : 'FAIL'} frame cost delta ${dlt.toFixed(3)} ms (off ${cost.off.toFixed(2)} on ${cost.on.toFixed(2)})`);
  for (const f of fails) console.log('  - ' + f);
  await br.close(); srv.kill(); console.log(fails.length ? 'FAIL' : 'PASS'); process.exit(fails.length ? 1 : 0);
})();
