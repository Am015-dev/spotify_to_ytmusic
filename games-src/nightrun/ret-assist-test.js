#!/usr/bin/env node
// POLISH test B35 (Assist mode). Headless, no screenshots. Prints PASS/FAIL, exit 1 on any FAIL.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/ret-assist-test.js     env: GAME_DIR=...
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const res = [], ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + i)); };
const MAX = { asSpd: 70, asBul: 70, asHull: 2, asWin: 120, asBig: true };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(), base = `http://127.0.0.1:${port}/index.html`;
  const open = async (q, vp) => { const p = await br.newPage({ viewport: vp || { width: 390, height: 763 }, hasTouch: true }); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); await p.goto(base + q); await p.waitForFunction(() => window.__mnr && window.RET, null, { timeout: 8000 }); return p; };

  // 1. values: each option changes only its own factor; flag off = old game
  let p = await open('?sim=1&nomusic=1');
  const val = () => p.evaluate(() => { const m = window.__mnr, R = window.RET; return { w: R.asW(), b: R.asB(), win: m.winMs(), h: R.asHullN(), big: R.asBigOn(), cls: document.documentElement.classList.contains('asbig'), hc: document.documentElement.classList.contains('hc'), act: R.assistActive() }; });
  const setA = o => p.evaluate(o => { const m = window.__mnr; Object.assign(m.SET, { asSpd: 100, asBul: 100, asHull: 0, asWin: 0, asBig: false }, o); m.applySet(); }, o);
  await setA({}); const d0 = await val();
  ok('defaults: all factors neutral', d0.w === 1 && d0.b === 1 && d0.h === 0 && !d0.big && !d0.cls && !d0.act, JSON.stringify(d0));
  await setA({ asSpd: 70 }); let v = await val(); ok('speed 70% only changes the world factor', v.w === .7 && v.b === 1 && v.win === d0.win && v.h === 0 && !v.big && v.act, JSON.stringify(v));
  await setA({ asBul: 85 }); v = await val(); ok('bullets 85% only changes the bullet factor', v.w === 1 && v.b === .85 && v.win === d0.win && v.h === 0 && v.act, JSON.stringify(v));
  await setA({ asWin: 120 }); v = await val(); ok('window +120 ms adds exactly 120 ms', v.win === d0.win + 120 && v.w === 1 && v.b === 1 && v.act, JSON.stringify(v));
  await setA({ asHull: 2 }); v = await val(); ok('hull +2', v.h === 2 && v.w === 1 && v.win === d0.win && v.act, JSON.stringify(v));
  await setA({ asBig: true }); v = await val(); ok('big bullets: contrast class, never marks a run', v.big && v.cls && !v.act && v.w === 1 && v.b === 1 && v.win === d0.win, JSON.stringify(v));
  await p.evaluate(() => { const m = window.__mnr; m.setVal('hc', true); }); v = await val(); ok('high contrast still sets html.hc', v.hc);
  await p.evaluate(() => { const m = window.__mnr; m.setVal('hc', false); m.setVal('win', 'loose'); }); v = await val(); ok('Timing window (old setting) still works', v.win >= 150 - 1 || v.win > d0.win, JSON.stringify(v));
  await p.evaluate(() => { const m = window.__mnr; m.setVal('win', 'normal'); Object.assign(m.SET, { asSpd: 55, asBul: 3, asHull: 9, asWin: -4, asBig: 'x' }); m.applySet(); });
  v = await val(); ok('bad saved values fall back', v.w === 1 && v.b === 1 && v.h === 0 && v.win === d0.win && !v.big, JSON.stringify(v));
  await setA(MAX); await p.evaluate(() => { window.RET.assist = false; window.__mnr.applySet(); }); v = await val();
  ok('flag off: every factor is 1 even with maxed settings', v.w === 1 && v.b === 1 && v.win === d0.win && v.h === 0 && !v.big && !v.cls && !v.act, JSON.stringify(v));

  // 2. runtime: world and bullet speed in the real update loop
  await p.evaluate(() => { window.RET.assist = true; });
  const bullet = (o) => p.evaluate(o => { const m = window.__mnr, G = m.G; Object.assign(m.SET, { asSpd: 100, asBul: 100, asHull: 0, asWin: 0, asBig: false }, o); m.applySet(); return 0; }, o);
  await p.click('#startBtn'); await p.waitForFunction(() => window.__mnr.running); await p.evaluate(() => window.__mnr.simOn(true));
  const travel = async o => { await bullet(o); return p.evaluate(() => { const m = window.__mnr, G = m.G; m.P.inv = 99; G.en = []; G.eb = []; const b = { x: 1000, y: 100, vx: -200, vy: 0, r: 5, c: '#fff', g: false, hm: 0 }; G.eb.push(b); m.P.x = 60; m.P.y = 700; const x0 = b.x, s0 = G.scroll;
    for (let i = 0; i < 30; i++) { G.en = []; m.step(1 / 60); } return { dx: x0 - b.x, ds: G.scroll - s0 }; }); };
  const t0 = await travel({}), t1 = await travel({ asBul: 70 }), t2 = await travel({ asSpd: 70 }), t3 = await travel({ asSpd: 85, asBul: 85 });
  ok('bullet 70%: travel x0.70 +-0.02', Math.abs(t1.dx / t0.dx - .7) < .02, `${t1.dx}/${t0.dx}`);
  ok('world 70%: bullet and scroll x0.70 +-0.02', Math.abs(t2.dx / t0.dx - .7) < .02 && Math.abs(t2.ds / t0.ds - .7) < .03, `${t2.dx}/${t0.dx} ${t2.ds}/${t0.ds}`);
  ok('world 85% x bullets 85%: x0.7225', Math.abs(t3.dx / t0.dx - .7225) < .02, `${t3.dx}/${t0.dx}`);
  ok('song stays at rate 1 under max assist', await (async () => { await bullet(MAX); return p.evaluate(() => window.NR.music.rate === 1); })());
  ok('beat judging window = base + 120 ms under max assist', (await val()).win === d0.win + 120);

  // 3. runs: marked, no records, but they still end normally; visual-only options never mark
  const endRun = async (opts, daily) => { const q = await open('?sim=1&nomusic=1'); await q.evaluate(o => { const m = window.__mnr; Object.assign(m.SET, o); m.applySet(); }, opts);
    await q.click(daily ? '#dailyBtn' : '#startBtn'); await q.waitForFunction(() => window.__mnr.running); await q.evaluate(() => window.__mnr.simOn(true));
    const r = await q.evaluate(() => { const m = window.__mnr, G = m.G; const hp0 = m.P.max, mark = G.assist; G.score = 777777; G.dead = true; G.deadT = 3; for (let i = 0; i < 5; i++) m.step(1 / 60);
      return { mark, hp0, eye: document.getElementById('overEyebrow').textContent, best: JSON.parse(localStorage.getItem('mnr_best') || 'null'), daily: JSON.parse(localStorage.getItem('mnr_daily') || 'null'), over: !document.getElementById('over').hidden }; });
    r.errs = q.errs; await q.close(); return r; };
  const base0 = await endRun({ asSpd: 100, asBul: 100, asHull: 0, asWin: 0, asBig: false });
  ok('control run (no assist) sets the best', base0.best && base0.best.score === 777777 && /best/i.test(base0.eye) && !base0.mark, JSON.stringify(base0));
  for (const [nm, o] of [['speed', { asSpd: 70 }], ['bullets', { asBul: 85 }], ['hull', { asHull: 2 }], ['window', { asWin: 60 }], ['all', MAX]]) {
    const r = await endRun(o); ok(`assist run (${nm}): marked, game over shown, best untouched`, r.mark === 1 && !r.best && r.over && /ⓐ/.test(r.eye) && !r.errs.length, JSON.stringify(r)); }
  const hull = await endRun({ asHull: 2 }), hull0 = await endRun({});
  ok('+2 hull is applied to a new run', hull.hp0 === hull0.hp0 + 2, `${hull.hp0} vs ${hull0.hp0}`);
  for (const [nm, o] of [['big bullets', { asBig: true }], ['reduced motion', { rm: true }], ['high contrast', { hc: true }]]) {
    const r = await endRun(o); ok(`${nm}: not an assist run, best saved`, !r.mark && r.best && r.best.score === 777777, JSON.stringify(r)); }
  const dA = await endRun({ asSpd: 70 }, true), dN = await endRun({}, true);
  ok('daily: assist run keeps the daily best empty, normal run sets it', !dA.daily && dN.daily && dN.daily.score === 777777 && /ⓐ/.test(dA.eye), JSON.stringify([dA.daily, dN.daily]));

  // 4. persistence and save export
  p = await open('?sim=1&nomusic=1');
  await p.evaluate(() => { const m = window.__mnr; m.setVal('asSpd', 85); m.setVal('asHull', 2); m.setVal('asBig', true); });
  const st = await p.evaluate(() => ({ set: JSON.parse(localStorage.getItem('mnr_set') || '{}'), keys: window.RET.sioKeys, pack: window.RET.sio.pack() }));
  ok('options are stored in mnr_set', st.set.asSpd === 85 && st.set.asHull === 2 && st.set.asBig === true, JSON.stringify(st.set).slice(0, 160));
  ok('mnr_set is in the export key list and the export carries the options', st.keys.includes('mnr_set') && /asSpd/.test(typeof st.pack === 'string' ? st.pack : JSON.stringify(st.pack)));
  await p.reload(); await p.waitForFunction(() => window.__mnr);
  ok('options survive a reload', await p.evaluate(() => { const S = window.__mnr.SET; return S.asSpd === 85 && S.asHull === 2 && S.asBig === true && window.RET.asW() === .85; }));
  const defs = await p.evaluate(() => { const m = window.__mnr; Object.assign(m.SET, m.DEFS, { v3: 1 }); m.applySet(); return window.RET.assistActive() || window.RET.asBigOn(); });
  ok('DEFAULTS reset the assist options', defs === false);
  await p.close();

  // 5. settings sheet: layout, tap targets, text size at two viewports
  for (const vp of [{ width: 390, height: 763 }, { width: 1280, height: 720 }]) {
    const q = await open('?nomusic=1', vp); await q.evaluate(() => document.getElementById('setBtn').click()); await q.waitForTimeout(300);
    const r = await q.evaluate(() => { const body = document.getElementById('setBody'), card = document.querySelector('#setm .card'), out = { rows: 0, small: [], thin: [], hs: body.scrollWidth - body.clientWidth, scroll: body.scrollHeight > body.clientHeight, keys: [] };
      const note = document.getElementById('asNote'); out.note = !!note; if (note) { note.scrollIntoView(); out.noteFs = parseFloat(getComputedStyle(note).fontSize); }
      for (const k of ['asSpd', 'asBul', 'asHull', 'asWin', 'win', 'asBig', 'hc', 'rm']) { const row = document.querySelector('#setBody [data-k="' + k + '"]'); if (!row) { out.keys.push('missing ' + k); continue; } out.rows++; row.scrollIntoView({ block: 'center' });
        const d = row.nextElementSibling; if (!d || !d.classList.contains('asd') || !d.textContent.trim()) out.keys.push('no description ' + k); else if (parseFloat(getComputedStyle(d).fontSize) < 14) out.small.push('desc ' + k);
        if (parseFloat(getComputedStyle(row.firstElementChild).fontSize) < 14) out.small.push('label ' + k);
        for (const b of row.querySelectorAll('button')) { const rc = b.getBoundingClientRect(), cr = card.getBoundingClientRect(); if (rc.height < 43.5 || rc.width < 43.5) out.thin.push(k + ':' + b.textContent + ' ' + Math.round(rc.width) + 'x' + Math.round(rc.height)); if (parseFloat(getComputedStyle(b).fontSize) < 14) out.small.push('btn ' + k); if (rc.left < cr.left - 1 || rc.right > cr.right + 1) out.keys.push('outside ' + k); } }
      out.oldAcc = !document.querySelector('#setBody [data-k="hc"]') ; return out; });
    ok(`settings ${vp.width}x${vp.height}: all assist rows present with descriptions, text >= 14 px, buttons >= 44 px, no sideways scroll`, r.rows === 8 && r.note && r.noteFs >= 14 && !r.small.length && !r.thin.length && r.hs <= 0 && !r.keys.length, JSON.stringify(r));
    ok(`settings ${vp.width}x${vp.height}: sheet scrolls when needed`, vp.width > 800 || r.scroll);
    await q.evaluate(() => { document.querySelector('#setBody [data-k="asSpd"] button:last-of-type').click(); });
    ok(`settings ${vp.width}x${vp.height}: tapping a chip sets the option and presses it`, await q.evaluate(() => window.__mnr.SET.asSpd === 70 && document.querySelector('#setBody [data-k="asSpd"] button:last-of-type').getAttribute('aria-pressed') === 'true'));
    ok(`settings ${vp.width}x${vp.height}: no page errors`, !q.errs.length, q.errs[0]); await q.close();
  }
  { const q = await open('?nomusic=1&assist=0'); await q.evaluate(() => document.getElementById('setBtn').click()); await q.waitForTimeout(200);
    ok('?assist=0: no Assist section; old Accessibility rows are back', await q.evaluate(() => !document.getElementById('asNote') && [...document.querySelectorAll('#setBody h3')].some(h => h.textContent === 'Accessibility') && !!document.querySelector('#setBody [data-k="hc"]') && !!document.querySelector('#setBody [data-k="win"]')));
    await q.close(); }

  // 5b. idle ship and the dodging bot in story stages, assist on or off (stepped by hand)
  const story = async (n, o, mode) => { const q = await open('?sim=1&all=1&nomusic=1', { width: 960, height: 540 }); await q.waitForFunction(() => window.__mnr.TR.list.length > 0, null, { timeout: 8000 }).catch(() => { });
    const r = await q.evaluate(({ n, o, mode }) => { const m = window.__mnr; Object.assign(m.SET, { asSpd: 100, asBul: 100, asHull: 0, asWin: 0, asBig: false }, o); m.applySet(); m.startStory(n); m.simOn(true);
      Object.assign(m.SH.got, { hm: 5, pc: 4, sc: 3, rg: 2, dr: 3, fr: 5, rc: 3, dm: 5, cr: 5, bd: 3, dc: 3, as: 3, sh: 3 }); try { m.SH.recalc(); } catch (e) { }
      m.SH.add('wn'); m.SH.add('wn'); m.SH.lk = 2; try { window.__wp.lvl('pulse', 5); window.__wp.lvl('swarm', 5); } catch (e) { }
      const K = m.K, B = { up: 'ArrowUp', dn: 'ArrowDown', lf: 'ArrowLeft', rt: 'ArrowRight' }; let i = 0, last = -1, lost = 0, hp = m.P.hp; const dt = 1 / 60;
      while (m.running && m.G.t < (mode === 'idle' ? 90 : 75)) {
        if (m.SH.active) m.SH.close();
        if (i % 30 === 0) for (const k of ['drum', 'tempo', 'slow', 'mag', 'tri', 'nr', 'bub']) if (!m.PW.on(k)) m.PW.give(k, true);
        if (mode === 'idle') { if (i % 90 === 0 && m.P.hp < m.P.max) m.G.pk.push({ t: 'hp', x: m.P.x + 20, y: m.P.y, vx: 0, vy: 0, bob: 0 }); }
        else { const P = m.P; for (const k of Object.values(B)) K[k] = false; let fx = 0, fy = 0;
          for (const b of m.G.eb) { const dx = P.x - b.x, dy = P.y - b.y, d = Math.hypot(dx, dy); if (d < 150 && d > 1) { const w = (150 - d) / d / d * 150; fx += dx * w; fy += dy * w; } }
          for (const e of m.G.en) { const dx = P.x - e.x, dy = P.y - e.y, d = Math.hypot(dx, dy); if (e.type !== 'boss' && d < 130 && d > 1) { const w = (130 - d) / d / d * 150; fx += dx * w; fy += dy * w; } }
          fx += (200 - P.x) * .01; fy += (270 + 120 * Math.sin(m.G.t * .9) - P.y) * .02; if (fx > .3) K[B.rt] = true; else if (fx < -.3) K[B.lf] = true; if (fy > .3) K[B.dn] = true; else if (fy < -.3) K[B.up] = true; }
        const bn = Math.floor(m.bpos()); if (bn !== last) { last = bn; m.press('Fire'); }
        m.step(dt); i++; if (m.P.hp < hp) lost += hp - m.P.hp; hp = m.P.hp; if (m.ST.over || m.G.dead) break; }
      return { dead: !!m.G.dead, t: +m.G.t.toFixed(1), lost, cleared: !!(m.ST.over && !m.G.dead) || (m.sSave && false) };
    }, { n, o, mode }); r.errs = q.errs; await q.close(); return r; };
  for (const n of [20, 42]) { const r = await story(n, MAX, 'idle'); console.log('idle', n, JSON.stringify(r));
    ok(`stage ${n}: an idle ship still dies with every assist maxed (<= 35 s)`, r.dead && r.t <= 35 && !r.errs.length, JSON.stringify(r)); }
  for (const n of [5, 20]) { const a = await story(n, {}, 'bot'), b = await story(n, MAX, 'bot'); console.log('bot', n, JSON.stringify([a, b]));
    ok(`stage ${n}: dodging bot with assist does no worse than without (hull lost ${b.lost} <= ${a.lost}, survives as long)`, b.lost <= a.lost && (b.t >= a.t - 0.5 || !b.dead) && !a.errs.length && !b.errs.length, JSON.stringify([a, b])); }
  srv.kill(); const f = res.filter(x => !x).length; console.log(f ? `FAIL (${f})` : 'ALL PASS'); process.exit(f ? 1 : 0);
})();
