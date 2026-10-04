// Painted-table test (Playwright): animations finish, and every sprite ends where the engine and the DOM say it is.
// node px-test.js [runIndex] -> WebGL High at 1366x768, Low at 390x763 phone, Medium at 844x390 phone, canvas renderer, hot-seat backs, DOM fallback
// Prints "FAIL <run> <check>" lines, then PROBLEMS n.
const PW = require(process.env.PW || (require('child_process').execSync('npm root -g').toString().trim() + '/playwright'));
const fs = require('fs'), path = require('path'); const html = fs.readFileSync(path.join(__dirname, 'lantern-dive.html'));
const LIB = require('./laylib.js');
const ONLY = process.argv[2] ? +process.argv[2] : -1;
const RUNS0 = [
  { name: 'webgl high 1366x768', W: 1366, H: 768, gfx: 'high', np: 4, mission: 7, turns: 22 },
  { name: 'webgl low 390x763 phone', W: 390, H: 763, ph: 1, gfx: 'low', np: 3, mission: 5, turns: 16 },
  { name: 'webgl medium 844x390 phone', W: 844, H: 390, ph: 1, gfx: 'medium', np: 5, mission: 9, turns: 14 },
  { name: 'canvas renderer 1100x700', W: 1100, H: 700, gfx: 'high', np: 3, mission: 4, turns: 12, q: '?px=canvas', kind: 'canvas' },
  { name: 'drone 2p 1366x768', W: 1366, H: 768, gfx: 'medium', np: 2, mission: 3, turns: 12 },
  { name: 'hot-seat backs 1366x768', W: 1366, H: 768, gfx: 'medium', np: 3, mission: 6, turns: 8, mode: 'hot' },
  { name: 'DOM fallback 1366x768', W: 1366, H: 768, np: 3, mission: 4, turns: 8, q: '?px=0', dom: 1 }];
const RUNS = ONLY >= 0 ? [RUNS0[ONLY]] : RUNS0;
(async () => {
  const b = await PW.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); let bad = 0;
  for (const R of RUNS) {
    const ctx = await b.newContext(Object.assign({ viewport: { width: R.W, height: R.H }, deviceScaleFactor: 1 }, R.ph ? { isMobile: true, hasTouch: true } : {}));
    await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
    const p = await ctx.newPage(); p.setDefaultTimeout(30000); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load/.test(m.text())) errs.push(m.text()); });
    const fail = (c, d) => { bad++; console.log('FAIL', R.name, c, d ? String(d).slice(0, 400) : ''); };
    await p.goto('https://gns.test/' + (R.q || '')); await p.waitForTimeout(1800);
    const st0 = await p.evaluate(() => ({ on: PX.on, kind: PX.kind, cls: document.documentElement.classList.contains('ldpx'), err: PX.err }));
    if (R.dom) { if (st0.on || st0.cls) fail('px=0 must keep the DOM view', JSON.stringify(st0)); }
    else { if (!st0.on || !st0.cls) fail('painted table did not start', JSON.stringify(st0)); if (R.kind && st0.kind !== R.kind) fail('renderer', st0.kind); if (!R.kind && !/webgl/.test(st0.kind)) fail('renderer ' + st0.kind, st0.err); }
    if (R.gfx && !R.dom) await p.evaluate(g => { setGfx(g); }, R.gfx);
    await p.evaluate(([np, mission, mode]) => { try { localStorage.clear(); } catch (e) { } UI.seed = 11; AIDELAY = 60; ANIM = 1; const o = optObj(); o.kind = 'log'; o.mission = mission; setNp(np); showStart(); UI.sv = 'setup'; renderStart(); document.querySelector(mode === 'hot' ? '[data-start=hot]' : '[data-start=vs]').click(); }, [R.np, R.mission, R.mode]);
    await p.waitForTimeout(900);
    await p.evaluate(() => { if (UI.coach) UI.coach.level = 'off'; UI.tip = null; if (window.renderTip) renderTip(); });
    const tap = async x => { if (typeof x === 'string') await (R.ph ? p.tap(x) : p.click(x)); else await (R.ph ? x.tap() : x.click()); await p.waitForTimeout(50); };
    const step = LIB.stepper(p, tap);
    const settle = async tag => {
      const t0 = Date.now();
      for (;;) {
        const s = await p.evaluate(() => ({ must: iMustAct() && canAct(), busy: UI.busy, moving: PX.on ? PX.state().moving : false, over: G.phase === 'over', ph: G.phase, pass: !!document.querySelector('#pass:not([hidden]) [data-a=take]') }));
        if (s.over) return 'over';
        if (s.pass) { await step(); continue; }
        if (s.must && !s.busy && !s.moving) return s.ph;
        if (Date.now() - t0 > 20000) { fail('did not settle ' + tag, JSON.stringify(s)); return 'timeout'; }
        await p.waitForTimeout(60);
      }
    };
    const check = async tag => {
      const r = await p.evaluate(() => {
        const out = [], B = document.querySelector('#bd').getBoundingClientRect(), S = PX.on ? PX.state() : null, v = viewSeat();
        const rel = e => { const r = e.getBoundingClientRect(); return [r.left - B.left, r.top - B.top, r.width]; };
        const near = (a, b, t) => Math.abs(a - b) <= (t || 1.2);
        const els = [...document.querySelectorAll('#bd [data-px=card]')];
        const mine = v >= 0 ? G.players[v].hand.slice().sort((a, b) => a - b) : [];
        const dom = [...document.querySelectorAll('#hand .hc[data-id]')].map(e => +e.dataset.id).sort((a, b) => a - b);
        if (mine.join() !== dom.join()) out.push('DOM hand ' + dom.join() + ' != engine ' + mine.join());
        // tricks: the DOM trick cards are exactly the engine's current trick
        const tr = G.trick ? G.trick.plays.map(p => p.c).sort((a, b) => a - b) : [];
        const tdom = els.filter(e => e.dataset.pk[0] === 't').map(e => +e.dataset.id).sort((a, b) => a - b);
        if (G.phase === 'play' && tr.join() !== tdom.join()) out.push('trick DOM ' + tdom.join() + ' != engine ' + tr.join());
        if (S) {
          const keys = new Set(els.map(e => e.dataset.pk)); const objs = S.objs;
          for (const o of objs) if (!keys.has(o.key)) out.push('extra sprite ' + o.key);
          for (const e of els) {
            const o = objs.find(q => q.key === e.dataset.pk); if (!o) { out.push('no sprite for ' + e.dataset.pk); continue; }
            const [x, y, w] = rel(e); if (!near(o.x, x) || !near(o.y, y) || !near(o.w, w)) out.push('sprite ' + o.key + ' at ' + [o.x, o.y, o.w].map(Math.round) + ' not at its box ' + [x, y, w].map(Math.round));
            if (o.id !== +e.dataset.id) out.push('sprite ' + o.key + ' shows id ' + o.id); if (!o.face) out.push('sprite ' + o.key + ' has no face texture'); if (o.alpha < .99) out.push('sprite ' + o.key + ' alpha ' + o.alpha);
          }
          if (S.tweens) out.push('tweens still running: ' + S.tweens);
        } else {
          const svg = [...document.querySelectorAll('#hand .hc svg')]; if (svg.length < dom.length) out.push('DOM cards drawn ' + svg.length + ' of ' + dom.length); if (svg.some(e => getComputedStyle(e).visibility === 'hidden' || !e.getBoundingClientRect().width)) out.push('DOM card pictures hidden');
        }
        return { out: out.slice(0, 6), n: dom.length, q: S && S.q, blur: S && S.blur, parts: S && S.parts, paint: S && S.canvasOK, res: S && S.res, nPlay: S ? S.nPlay : 0, nSweep: S ? S.nSweep : 0 };
      });
      if (r.out.length) fail('positions ' + tag, JSON.stringify(r.out));
      return r;
    };
    let turns = 0, last = null, maxParts = 0, plays = 0, checked = 0;
    for (let k = 0; k < R.turns * 6 && turns < R.turns; k++) {
      const ph = await settle('step ' + turns); if (ph === 'over' || ph === 'timeout') break;
      last = await check(ph + ' ' + turns + ' a' + (await p.evaluate(() => G.att))); checked++;
      maxParts = Math.max(maxParts, last.parts || 0);
      if (R.mode === 'hot') { const hb = await p.evaluate(() => { const S = PX.state(); return { faces: S.objs.length, holder: UI.holder }; }); if (hb.holder < 0 && hb.faces) fail('card sprites while the device is being passed', JSON.stringify(hb)); }
      const r = await step(); if (r === 'play') plays++; if (r && /^stuck|^no-card/.test(r)) { fail('step ' + r); break; } turns++;
      if (r === 'play' && R.np >= 3 && plays === 3) await p.screenshot({ path: path.join(__dirname, 'shots', 'px_' + R.name.replace(/\W+/g, '_') + '_flight.png') });
    }
    await settle('end');
    const fin = await p.evaluate(() => PX.on ? { nPlay: PX.state().nPlay, nSweep: PX.state().nSweep, tricks: G.tricks.length, trickPlays: G.tricks.reduce((a, t) => a + (t.plays ? t.plays.length : 0), 0) } : null);
    if (!R.dom && fin) { if (fin.nPlay < plays) fail('play flights ' + fin.nPlay + ' for ' + plays + ' own cards played'); if (fin.tricks >= 2 && fin.nSweep < 1) fail('no sweep to the winner seen', JSON.stringify(fin)); }
    if (checked < Math.min(6, R.turns)) fail('too few checks', checked);
    if (!R.dom && last) {
      if (R.gfx === 'low' && (last.blur || maxParts)) fail('Low must have no blur filters and no particles', JSON.stringify({ blur: last.blur, maxParts }));
      if (R.gfx === 'high' && !last.blur) fail('High should blur the fx layer');
      if (!(last.paint > .2)) fail('canvas looks blank', last.paint);
    }
    console.log(R.name, 'checks', checked, 'plays', plays, 'fin', JSON.stringify(fin), 'last', JSON.stringify(last && { n: last.n, q: last.q, blur: last.blur, maxParts, paint: last.paint, res: last.res }));
    await p.screenshot({ path: path.join(__dirname, 'shots', 'px_' + R.name.replace(/\W+/g, '_') + '.png') });
    if (errs.length) fail('console errors', JSON.stringify(errs.slice(0, 3)));
    await ctx.close();
  }
  console.log('PROBLEMS', bad); await b.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
