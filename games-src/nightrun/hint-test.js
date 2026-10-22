#!/usr/bin/env node
// Nightrun ONE HINT STYLE test (parts/hud/uikit.js HINT, flag RET.hint, ?hint=0 = the old bubble). Real page, sim clock. Prints PASS / FAIL lines; exit 1 on any FAIL.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/hint-test.js      env: GAME_DIR=<dir with index.html>, SHOT=<dir for screenshots>
// (a) every hint string in the sources is <= 8 words (zoo hints, power-up tips, level toasts, fixed hints)
// (b) per viewport (390x763, 375x553, 763x390, 1280x720): the pill is >= 14 px, inside the top third, under the HUD, >= 120 px from the ship, text intact
// (c) one at a time, >= 1.2 s between two, the queue never stacks; a ship parked under the pill moves it away or holds it
// (d) ?hint=0: no pill, the old G.hint bubble; HINT missing: hintShow falls back without an error; (e) no page errors
const PW = require('playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun'), SHOT = process.env.SHOT || '';
const PARTS = path.join(__dirname, 'parts');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fp = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148';
const wc = s => String(s).trim().split(/\s+/).filter(Boolean).length;
const out = [], ok = (name, pass, info) => { out.push(pass); console.log((pass ? 'PASS ' : 'FAIL ') + name + (pass || !info ? '' : ' :: ' + info)); };

// ---- (a) static audit of the sources
function audit(names) {
  const bad = [], add = (where, t) => { if (wc(t) > 8) bad.push(where + ': "' + t + '" (' + wc(t) + ')'); };
  const read = f => fs.readFileSync(path.join(PARTS, f), 'utf8');
  for (const f of require('./parts-index.js').list().filter(f => f.endsWith('.js'))) {
    const s = read(f);
    for (const m of s.matchAll(/hintShow\(say\('((?:[^'\\]|\\.)*)'\)/g)) add(f, m[1]);
    for (const m of s.matchAll(/hintShow\(say\('((?:[^'\\]|\\.)*)'\)/g)) void m;
    for (const m of s.matchAll(/\btip:'((?:[^'\\]|\\.)*)'/g)) add(f + ' tip', m[1]);
    for (const m of s.matchAll(/\bhint:'((?:[^'\\]|\\.)*)'/g)) add(f + ' hint', m[1]);
  }
  const pl = read('powers/powlevels.js');
  for (const m of pl.matchAll(/^\s*(\w+):\{tx:\[((?:'[^']*',?)+)\]/gm)) {
    const n = names[m[1]] || m[1].toUpperCase(); const txs = [...m[2].matchAll(/'([^']*)'/g)].map(x => x[1]);
    txs.forEach((t, i) => { if (t) add('powlevels ' + m[1] + ' LV' + (i + 1), n + ' LV' + (i + 1) + ': ' + t); });
  }
  return bad;
}

const START = () => { const m = window.__mnr; if (m.running) m.abort(); m.SET.diff = 'normal'; m.SET.auto = true; m.applySet && m.applySet(); m.startStory(1); m.simOn(true); m.P.hp = m.P.max = 9; m.P.inv = 99; if (m.SH.active) m.SH.close(); return true; };
const STEP = n => { const m = window.__mnr; for (let i = 0; i < n; i++) { m.STILL.t = 0; m.P.inv = 99; m.G.dead = false; m.G.banner.t = 0; m.step(1 / 30); m.render(m.G.t, 0); } };

(async () => {
  const port = await fp(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' }); await sleep(700);
  const br = await PW.chromium.launch(), errs = [];
  const open = async (w, h, touch, q) => { const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, userAgent: touch ? UA : undefined }), p = await ctx.newPage();
    p.on('pageerror', e => errs.push(`${w}x${h}${q || ''}: ${e.message}`)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1${q || ''}`);
    await p.waitForFunction(() => window.__mnr && window.HINT !== undefined || (window.__mnr && /hint=0/.test(location.search)), null, { timeout: 15000 }).catch(() => errs.push('page did not start')); await sleep(400); return p; };
  try {
    const p0 = await open(390, 763, true);
    const names = await p0.evaluate(() => { const o = {}; for (const k in __mnr.PWK) o[k] = __mnr.PWK[k].n; return o; });
    const bad = audit(names); ok('(a) every hint string <= 8 words', bad.length === 0, bad.join(' | '));
    ok('(a) HINT helper present, flag on', await p0.evaluate(() => !!window.HINT && RET.hint === true && HINT.on()));
    await p0.context().close();

    for (const [w, h, touch] of [[390, 763, true], [375, 553, true], [763, 390, true], [1280, 720, false]]) {
      const tag = `${w}x${h}`, p = await open(w, h, touch);
      await p.evaluate(START); await p.evaluate(STEP, 20);
      const info = await p.evaluate(() => { const m = __mnr; return { rot: m.rotMode, H: m.G && 540, ver: 1 }; });
      // (b) one hint, ship far from the spot where the pill goes
      const r = await p.evaluate(() => { const m = __mnr; m.P.x = 200; m.P.y = 470; HINT.reset(); HINT.show('SHIELDER: hit it from the side', { t: 4 }); const seen = [];
        for (let i = 0; i < 40; i++) { m.STILL.t = 0; m.P.inv = 99; m.step(1 / 30); m.render(m.G.t, 0); if (HINT.box) seen.push(JSON.parse(JSON.stringify(HINT.box))); } return { seen, cur: !!HINT.cur }; });
      const b = r.seen[r.seen.length - 1];
      ok(`(b) ${tag} pill drawn`, !!b, 'no box');
      if (b) {
        ok(`(b) ${tag} font >= 14 px`, b.fs * b.cpu >= 13.95, (b.fs * b.cpu).toFixed(1));
        ok(`(b) ${tag} inside the top third`, b.y + b.h <= b.areaH / 3 + 0.5, `bottom ${b.y + b.h | 0} of ${b.areaH}`);
        ok(`(b) ${tag} inside the screen`, b.x >= 0 && b.x + b.w <= b.areaW + 0.5, `x ${b.x | 0}..${(b.x + b.w) | 0} of ${b.areaW}`);
        const dx = Math.max(b.x - b.ship.x, 0, b.ship.x - (b.x + b.w)), dy = Math.max(b.y - b.ship.y, 0, b.ship.y - (b.y + b.h));
        ok(`(b) ${tag} >= 120 px from the ship`, Math.hypot(dx, dy) * b.cpu >= 119.5, (Math.hypot(dx, dy) * b.cpu).toFixed(0) + ' px');
        ok(`(b) ${tag} under the HUD`, b.y >= b.hudBottom - 0.5 && b.hudBottom > 50, `y ${b.y} hud ${b.hudBottom}`);
        ok(`(b) ${tag} text intact, <= 8 words`, b.txt === 'SHIELDER: hit it from the side' && wc(b.txt) <= 8, b.txt);
        if (SHOT) { await p.screenshot({ path: path.join(SHOT, `hint-${tag}.png`) }); }
      }
      // (c) queue: three hints at once -> one at a time, gaps >= 1.2 s
      const q = await p.evaluate(() => { const m = __mnr; m.P.x = 200; m.P.y = 470; HINT.reset(); HINT.show('FIRST hint here', { t: 1.5 }); HINT.show('SECOND hint here', { t: 1.5 }); HINT.show('THIRD hint here', { t: 1.5 });
        const tl = []; let last = null, t0 = 0, maxOn = 0;
        for (let i = 0; i < 30 * 12; i++) { m.STILL.t = 0; m.P.inv = 99; m.step(1 / 30); m.render(m.G.t, 0); const c = HINT.cur ? HINT.cur.txt : null; if (c !== last) { tl.push({ t: +(i / 30).toFixed(2), c }); last = c; } maxOn = Math.max(maxOn, HINT.cur ? 1 : 0); }
        return { tl, qleft: HINT.q.length }; });
      const shown = q.tl.filter(e => e.c && /^(FIRST|SECOND|THIRD) /.test(e.c)).map(e => e.c), gaps = []; for (let i = 0; i < q.tl.length - 1; i++) if (!q.tl[i].c && q.tl[i + 1].c) gaps.push(q.tl[i + 1].t - q.tl[i].t);
      void 0;
      ok(`(c) ${tag} three hints shown one after the other`, shown.join('|') === 'FIRST hint here|SECOND hint here|THIRD hint here', JSON.stringify(q.tl));
      ok(`(c) ${tag} >= 1.2 s between two`, gaps.length >= 2 && gaps.every(g => g >= 1.19), JSON.stringify(gaps));
      // ship parked under the pill: the pill slides or waits, never within 120 px
      const s = await p.evaluate(() => { const m = __mnr; HINT.reset(); HINT.show('Dash on the pulse to power up', { t: 5 }); let worst = 1e9, drawn = 0;
        for (let i = 0; i < 90; i++) { m.P.x = m.rotMode ? 540 * .5 : 480; m.P.y = m.rotMode ? 100 : 100; if (m.rotMode) { m.P.x = 960 - 130; m.P.y = 270; } m.STILL.t = 0; m.P.inv = 99; m.step(1 / 30); m.render(m.G.t, 0);
          const b = HINT.box; if (b) { drawn++; const dx = Math.max(b.x - b.ship.x, 0, b.ship.x - (b.x + b.w)), dy = Math.max(b.y - b.ship.y, 0, b.ship.y - (b.y + b.h)); worst = Math.min(worst, Math.hypot(dx, dy) * b.cpu); } }
        return { worst, drawn }; });
      ok(`(c) ${tag} ship parked under the pill: never within 120 px`, s.worst >= 119.5, JSON.stringify(s));
      await p.context().close();
    }

    // (d) flag off and missing helper
    const po = await open(390, 763, true, '&hint=0');
    const off = await po.evaluate(() => { START = null; return 1; }).catch(() => 1);
    await po.evaluate(START); await po.evaluate(STEP, 10);
    const f = await po.evaluate(() => { HINT.show('SHIELDER: hit it from the side', { t: 3 }); const m = __mnr; for (let i = 0; i < 10; i++) { m.STILL.t = 0; m.P.inv = 99; m.step(1 / 30); m.render(m.G.t, 0); } return { flag: RET.hint, box: !!HINT.box, cur: !!HINT.cur, old: m.G.hint.txt, t: m.G.hint.t }; });
    ok('(d) ?hint=0: old bubble, no pill', f.flag === false && !f.box && !f.cur && f.old === 'SHIELDER: hit it from the side' && f.t > 0, JSON.stringify(f));
    await po.context().close();
    const pm = await open(390, 763, true);
    await pm.evaluate(START); await pm.evaluate(STEP, 10);
    const g = await pm.evaluate(() => { const hs = window.HINT; try { delete window.HINT; } catch (e) { window.HINT = undefined; } let err = ''; try { __mnr.G.hint = { t: 0, txt: '' }; hintShow('Grab again to level up', 3); } catch (e) { err = e.message; } window.HINT = hs; return { err, txt: __mnr.G.hint.txt, t: __mnr.G.hint.t }; });
    ok('(d) HINT missing: safe fallback to the old draw', !g.err && g.txt === 'Grab again to level up' && g.t > 0, JSON.stringify(g));
    await pm.context().close();
  } catch (e) { ok('test ran', false, e.stack || e.message); }
  ok('(e) no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  await br.close(); srv.kill(); process.exit(out.every(Boolean) ? 0 : 1);
})();
