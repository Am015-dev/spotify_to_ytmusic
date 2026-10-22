#!/usr/bin/env node
// Lab ON FOOT page (parts/lab/footlab.js). PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/footlab-test.js     env: GAME_DIR=<dir with index.html>
//  (a) the ON FOOT tab is in the main Lab and its START button opens the sandbox on the Zeil stage   (b) every panel button works without a page error
//  (c) jump to every room and the climax, spawn every foe and prop, god mode, infinite ammo, give weapon, pause + step, slow motion halves game time
//  (d) hit boxes / road line / frame labels draw on the overlay, a layer switch changes the picture, the animation viewer steps frames
//  (e) nothing is saved (mnr_foot, Neon), the props the buttons added are gone after EXIT
//  (v) footview.js: the tab opens the VIEWER first: no stage, no foes, no damage; each state button plays its own sheet; missing states say no art; PLAY TEST still opens the sandbox
const { boot, open, sleep, ok, done } = require('./lib.js');
(async () => {
  const b = await boot();
  try {
    const p = await open(b.br, b.base, 390, 763, '?nomusic=1&lab=1', 0, true);
    await p.waitForFunction(() => window.__mnr && __mnr.G && __mnr.G.lab, null, { timeout: 20000 }).catch(() => { });
    // (a) tab in the main Lab, start button
    const saveBefore = await p.evaluate(() => JSON.stringify(FOOT.save()) + '|' + localStorage.getItem('mnr_foot'));
    await p.evaluate(() => { const t = document.getElementById('labTab_foot'); t && t.click(); }); await sleep(300);
    const tab = await p.evaluate(() => ({ has: !!document.getElementById('labTab_foot'), view: [...document.querySelectorAll('#labP button')].some(x => /OPEN ON FOOT VIEWER/.test(x.textContent)), start: [...document.querySelectorAll('#labP button')].some(x => /PLAY TEST/.test(x.textContent)) }));
    ok('ON FOOT tab in the main Lab with a VIEWER and a PLAY TEST button', tab.has && tab.view && tab.start, JSON.stringify(tab));
    // (v) the viewer
    await p.evaluate(() => [...document.querySelectorAll('#labP button')].find(x => /OPEN ON FOOT VIEWER/.test(x.textContent)).click()); await sleep(600);
    const vo = await p.evaluate(() => ({ v: FOOTVIEW.on, panel: !!document.getElementById('fvP'), stage: FOOT.on, S: !!FOOT.S, lab: !!FOOT.lab, chars: document.querySelectorAll('#fvP [data-who]').length, who: [...document.querySelectorAll('#fvP [data-who]')].map(b => b.dataset.who) }));
    ok('the viewer opens with no stage running: no foes alive, no damage, no timers', vo.v && vo.panel && !vo.stage && !vo.S && !vo.lab, JSON.stringify(vo));
    ok('the character list has Kai, rusher, gunner, heavy, big heavy, the other foes and props', ['kai', 'knife', 'gunman', 'bruiser', 'bigheavy', 'prop-car', 'st-crate', 'st-barrel'].every(w => vo.who.includes(w)) && vo.chars >= 20, vo.who.join(','));
    await p.waitForFunction(() => ['kai/idle', 'kai/run', 'kai/shoot', 'knife/run', 'gunman/shoot', 'bruiser/idle'].every(k => FOOTVIEW.ready(k)), null, { timeout: 15000 }).catch(() => { });
    const pv = await p.evaluate(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms)), bad = [], nOk = [], na = [], px = () => { const c = document.getElementById('fvZ'), g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, c.height).data; let s = 0, n = 0; for (let i = 0; i < d.length; i += 16) { s = (s * 31 + d[i] + d[i + 1] * 7) | 0; if (d[i] > 40 || d[i + 1] > 40) n++; } return [s, n]; };
      for (const w of ['kai', 'knife', 'gunman', 'bruiser', 'bigheavy', 'hound', 'prop-car']) { document.querySelector('#fvP [data-who="' + w + '"]').click(); await sleep(60);
        for (const b of [...document.querySelectorAll('#fvP [data-act]')]) { const a = b.dataset.act; for (let i = 0; i < 20 && b.dataset.has === '1' && !FOOTVIEW.ready(FOOTVIEW.sheet + '/' + a); i++) await sleep(100); b.click(); await sleep(90);
          const k = FOOTVIEW.sheet + '/' + FOOTVIEW.act, info = document.getElementById('fvInfo').textContent;
          if (b.dataset.has === '1') { if (FOOTVIEW.act !== a || !FOOTVIEW.has(k) || info.indexOf('anim/' + k + '-strip.webp') < 0 || px()[1] < 150) bad.push(w + '/' + a + ' ' + info.slice(0, 60)); else nOk.push(k); }
          else { if (!/no art/.test(info) || !/no art/i.test(b.textContent)) bad.push(w + '/' + a + ' missing not shown'); na.push(k); } } }
      return { bad, n: nOk.length, na: na.length, foes: FOOT.on || !!FOOT.S }; });
    ok(`each state button plays its own sheet (${pv.n} states with art, ${pv.na} say no art)`, !pv.bad.length && pv.n >= 30 && !pv.foes, pv.bad.join(' | '));
    const vf = await p.evaluate(async () => { const sleep = ms => new Promise(r => setTimeout(r, ms)); FOOTVIEW.pick('kai'); FOOTVIEW.state('run'); FOOTVIEW.play = true; FOOTVIEW.speed = 1; await sleep(700); const f1 = FOOTVIEW.t;
      document.getElementById('fvPP').click(); const fr = FOOTVIEW.frame; document.getElementById('fvNext').click(); document.getElementById('fvNext').click(); const st = (FOOTVIEW.frame - fr + 6) % 6; document.getElementById('fvPrev').click();
      const back = (FOOTVIEW.frame - fr + 6) % 6; FOOTVIEW.speed = .25; FOOTVIEW.play = true; const t0 = FOOTVIEW.t; await sleep(800); const slow = FOOTVIEW.t - t0; return { f1, st, back, slow, play: FOOTVIEW.play }; });
    ok('viewer: plays, pauses, steps frame -/+ and runs at 0.25x', vf.f1 > .4 && vf.st === 2 && vf.back === 1 && vf.slow > .1 && vf.slow < .4, JSON.stringify(vf));
    const cutv = await p.evaluate(() => { const r = {}; for (const k of ['kai/idle', 'kai/run', 'knife/run', 'hound/run']) { const f = FOOTVIEW.facts(k); r[k] = f ? f.fr.map(q => q.cut.join('+') || '-').join(',') : 'none'; } return r; });
    ok('viewer cut marks agree with the fixed sheets (hound run is no longer sliced across frames)', cutv['hound/run'] && !/left|right/.test(cutv['hound/run']) && cutv['knife/run'] !== 'none', JSON.stringify(cutv));
    await p.evaluate(() => { document.querySelector('#fvP .fc.hot').click(); });
    await p.waitForFunction(() => FOOT.on && FOOT.S && FOOT.lab && document.getElementById('flP'), null, { timeout: 25000 }).catch(() => { });
    ok('PLAY TEST in the viewer opens the sandbox and closes the viewer', await p.evaluate(() => FOOT.on && FOOT.lab && !document.getElementById('fvP') && !!document.getElementById('flView2')));
    await p.evaluate(() => document.getElementById('flView2').click()); await sleep(300);
    ok('VIEWER in the sandbox goes back to the calm viewer (stage stopped)', await p.evaluate(() => FOOTVIEW.on && !FOOT.on && !FOOT.lab));
    await p.evaluate(() => document.getElementById('fvExit').click()); await sleep(200);
    ok('viewer EXIT closes it', await p.evaluate(() => !FOOTVIEW.on && !document.getElementById('fvP')));
    const propsN0 = await p.evaluate(() => FOOT.STAGES[FOOT.main].props.length);
    await p.evaluate(() => [...document.querySelectorAll('#labP button')].find(x => /PLAY TEST/.test(x.textContent)).click());
    await p.waitForFunction(() => FOOT.on && FOOT.S && FOOT.lab && document.getElementById('flP'), null, { timeout: 25000 }).catch(() => { });
    const st = await p.evaluate(() => ({ on: FOOT.on, lab: FOOT.lab, id: FOOT.S && FOOT.S.id, panel: !!document.getElementById('flP'), n: document.querySelectorAll('#flP button').length, sch: window.__schFoot }));
    ok('START opens the Zeil street stage in the sandbox with the panel', st.on && st.lab && st.id === 'zeil' && st.panel && st.n > 50 && st.sch === true, JSON.stringify(st));
    await p.evaluate(() => { FOOT.S.hs = 0; });
    // (c) rooms
    const rooms = await p.evaluate(() => { const o = []; for (let i = 0; i < 6; i++) { FOOTLAB.room(i); FOOT.sim(.5); o.push(Math.round(FOOT.S.P.x)); } return o; });
    ok('jump to room 1..6 moves Kai forward each time', rooms.every((x, i) => i === 0 || x > rooms[i - 1]) && rooms[5] > 5400, JSON.stringify(rooms));
    const cl = await p.evaluate(() => { FOOTLAB.room('climax'); FOOT.sim(4); const S = FOOT.S; return { boss: !!S.boss, bossOn: S.bossOn, id: S.boss && S.boss.id }; });
    ok('jump to the climax brings the big heavy', cl.boss && cl.id === 'bigheavy', JSON.stringify(cl));
    // spawns
    const sp = await p.evaluate(() => { FOOTLAB.room(1); FOOTLAB.setWaves(false); const S = FOOT.S, r = {}; for (const k of ['rusher', 'gunner', 'heavy', 'bigheavy']) { const n0 = S.E.length; FOOTLAB.spawn(k); r[k] = S.E.length - n0; }
      const p0 = S.pr.length; for (const k of ['barrel', 'crate', 'gold']) FOOTLAB.spawn(k); FOOT.sim(.3); r.props = S.pr.length - p0; r.drawn = S.pr.slice(-3).every(q => typeof q.draw === 'function'); return r; });
    ok('spawn rusher, gunner, heavy, big heavy, red barrel, crate, gold crate', sp.rusher === 1 && sp.gunner === 1 && sp.heavy === 1 && sp.bigheavy === 1 && sp.props === 3 && sp.drawn, JSON.stringify(sp));
    const sd = await p.evaluate(() => { const S = FOOT.S, P = S.P; const r = []; for (const d of [120, 200, 300, 450]) { FOOTLAB.dist = d; const e = FOOTLAB.spawn('rusher'); r.push(Math.round(e.x - P.x) * P.facing); } return r; });
    ok('spawn distance follows the chosen distance', sd.join() === '120,200,300,450', sd.join());
    const gd = await p.evaluate(() => { const S = FOOT.S, P = S.P; FOOTLAB.god = true; P.hp = 1; FOOT.sim(.1); const h1 = P.hp; FOOTLAB.give('rocket'); FOOTLAB.ammo = true; P.ammo = 3; FOOT.sim(.1); return { hp: h1, max: P.max, w: P.w }; });
    ok('god mode refills the hearts, give weapon sets the weapon', gd.w === 'rocket', JSON.stringify(gd));
    await p.evaluate(() => { FOOT.S.P.hp = 1; }); await sleep(250);
    ok('god mode hearts back to full after a frame', await p.evaluate(() => FOOT.S.P.hp === FOOT.S.P.max));
    await sleep(200);
    ok('infinite ammo keeps the rocket launcher full', await p.evaluate(() => FOOT.S.P.ammo === Infinity));
    for (const w of ['pistol', 'hmg', 'shot', 'flame', 'rocket', 'arc']) { await p.evaluate(w => FOOTLAB.give(w), w); const g = await p.evaluate(() => FOOT.S.P.w); if (g !== w) ok('give weapon ' + w, false, g); }
    ok('give every weapon', true);
    // pause + step
    const ps = await p.evaluate(() => { const S = FOOT.S; FOOTLAB.pause(true); const t0 = S.time; FOOT.sim(0); return t0; });
    await sleep(400);
    const ps2 = await p.evaluate(t0 => { const S = FOOT.S, a = S.time; FOOTLAB.stepFrame(); const b = S.time; return { held: Math.abs(a - t0) < 1e-6, step: b - a, paused: S.paused }; }, ps);
    ok('pause holds game time, step one frame adds 1/60 s and stays paused', ps2.held && Math.abs(ps2.step - 1 / 60) < 1e-4 && ps2.paused, JSON.stringify(ps2));
    await p.evaluate(() => { FOOTLAB.pause(false); });
    // slow motion halves game time (real loop, same wall time)
    const rate = async v => { await p.evaluate(v => { FOOTLAB.slow(v); FOOT.S.hs = 0; }, v); await sleep(200); const a = await p.evaluate(() => performance.now() + '|' + FOOT.S.time); await sleep(1800); const c = await p.evaluate(() => performance.now() + '|' + FOOT.S.time); const [t0, g0] = a.split('|').map(Number), [t1, g1] = c.split('|').map(Number); return (g1 - g0) / ((t1 - t0) / 1000); };
    await p.evaluate(() => { FOOTLAB.god = true; FOOTLAB.room(0); FOOTLAB.setWaves(false); });
    const r1 = await rate(1), rh = await rate(.5), rq = await rate(.25);
    ok(`slow motion: game seconds per real second normal ${r1.toFixed(2)}, 0.5x ${rh.toFixed(2)}, 0.25x ${rq.toFixed(2)}`, r1 > .8 && Math.abs(rh / r1 - .5) < .1 && Math.abs(rq / r1 - .25) < .08, `${r1} ${rh} ${rq}`);
    await p.evaluate(() => FOOTLAB.slow(1));
    // (d) overlay and layers and viewer
    await p.evaluate(() => { FOOTLAB.boxes = true; FOOTLAB.road = true; FOOTLAB.frames = true; FOOTLAB.spawn('rusher'); }); await sleep(500);
    const ovp = await p.evaluate(() => { const o = document.getElementById('flOv'), g = o.getContext('2d'), d = g.getImageData(0, 0, o.width, o.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return { n, rec: FOOTLAB.rec.length, w: o.width }; });
    ok('hit boxes, road line and frame labels draw on the overlay', ovp.n > 300, JSON.stringify(ovp));
    ok('frame labels record the sprite frames of Kai and the foes', ovp.rec >= 1, JSON.stringify(ovp));
    const h0 = await p.evaluate(() => { const c = FOOT._in.L().cv, g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, Math.floor(c.height * .3)).data; let s = 0; for (let i = 0; i < d.length; i += 17) s = (s * 31 + d[i]) | 0; return s; });
    await p.evaluate(() => { FOOTLAB.layers.sky = false; FOOTLAB.layers.far = false; FOOTLAB.layers.mid = false; FOOTLAB.layers.near = false; }); await sleep(300);
    const h1 = await p.evaluate(() => { const c = FOOT._in.L().cv, g = c.getContext('2d'), d = g.getImageData(0, 0, c.width, Math.floor(c.height * .3)).data; let s = 0; for (let i = 0; i < d.length; i += 17) s = (s * 31 + d[i]) | 0; return s; });
    ok('hiding the sky and building layers changes the picture', h0 !== h1, h0 + ' ' + h1);
    await p.evaluate(() => { for (const k in FOOTLAB.layers) FOOTLAB.layers[k] = true; FOOTLAB.light = false; }); await sleep(200); await p.evaluate(() => { FOOTLAB.light = true; });
    const vw = await p.evaluate(() => { const v = FOOTLAB.view; v.who = 'rusher'; v.act = 'run'; v.play = false; v.frame = 0; const c = document.getElementById('flView'), g = c.getContext('2d'); return new Promise(r => setTimeout(() => { const d = g.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] > 40 || d[i + 1] > 40) n++; r(n); }, 300)); });
    ok('animation viewer draws the rusher run sheet', vw > 400, vw);
    const stepOk = await p.evaluate(() => { const bs = [...document.querySelectorAll('#flP button')], nx = bs.find(x => /FRAME ▶/.test(x.textContent)); const f0 = FOOTLAB.view.frame; nx.click(); nx.click(); return FOOTLAB.view.frame - f0; });
    ok('FRAME ▶ steps the viewer frame by frame', stepOk === 2, stepOk);
    // (b) click every button once
    const err0 = p.errs.length;
    const clicked = await p.evaluate(() => { const bs = [...document.querySelectorAll('#flP button')].filter(x => x.id !== 'flExit' && x.id !== 'flView2'); let n = 0; for (const x of bs) { x.click(); n++; } return n; });
    await sleep(500);
    ok(`every panel button (${clicked}) clicks without a page error`, p.errs.length === err0 && clicked > 55, p.errs.slice(err0).join(' | '));
    // (e) nothing saved, exit cleans up
    const propsN1 = await p.evaluate(() => FOOT.STAGES[FOOT.main].props.length);
    await p.evaluate(() => document.getElementById('flExit').click()); await sleep(400);
    const ex = await p.evaluate(() => ({ lab: FOOT.lab, on: FOOT.on, panel: !!document.getElementById('flP'), ov: !!document.getElementById('flOv'), props: FOOT.STAGES[FOOT.main].props.length, ts: FOOT.ts, save: JSON.stringify(FOOT.save()) + '|' + localStorage.getItem('mnr_foot'), draw: CanvasRenderingContext2D.prototype.drawImage.toString().length }));
    ok('EXIT closes the lab: panel, overlay, added props and slow motion are gone', !ex.lab && !ex.on && !ex.panel && !ex.ov && ex.props === propsN0 && !ex.ts && propsN1 > propsN0, JSON.stringify({ ...ex, propsN0, propsN1 }));
    ok('nothing was saved (mnr_foot unchanged)', ex.save === saveBefore, saveBefore + ' vs ' + ex.save);
    ok('canvas drawImage is the native function again', /native code/.test(await p.evaluate(() => Function.prototype.toString.call(CanvasRenderingContext2D.prototype.drawImage))));
    // a finished sandbox run writes nothing either: die with god mode off
    const fin = await p.evaluate(() => { FOOTLAB.start(); return new Promise(r => setTimeout(() => { try { FOOTLAB.god = false; const S = FOOT.S; S.P.hp = 0; S.dead = .05; FOOT.sim(.5); r({ end: !!S.end, save: JSON.stringify(FOOT.save()) + '|' + localStorage.getItem('mnr_foot'), bank: typeof GA === 'undefined' ? 'n/a' : 'ok' }); } catch (e) { r({ err: String(e) }); } }, 6000)); });
    ok('a sandbox run that ends writes no save', fin.end && fin.save === saveBefore, JSON.stringify(fin));
    await p.evaluate(() => FOOTLAB.exit()); await sleep(200);
    ok('no page errors', !p.errs.length, p.errs.join(' | '));
    // ?footlab=1 opens straight away; ?footlab=0 has no tab
    const q = await open(b.br, b.base, 1440, 860, '?nomusic=1&footlab=1&footplay=1', 0, false);
    await q.waitForFunction(() => window.FOOTLAB && FOOTLAB.on && FOOT.S && document.getElementById('flP'), null, { timeout: 25000 }).catch(() => { });
    ok('?footlab=1&footplay=1 opens the sandbox on a desktop screen', await q.evaluate(() => FOOT.on && FOOT.lab && !!document.getElementById('flP')), q.errs.join(' | '));
    const qv = await open(b.br, b.base, 1440, 860, '?nomusic=1&footlab=1', 0, false);
    await qv.waitForFunction(() => window.FOOTVIEW && FOOTVIEW.on, null, { timeout: 15000 }).catch(() => { });
    ok('?footlab=1 opens the viewer (no stage)', await qv.evaluate(() => FOOTVIEW.on && !FOOT.on), qv.errs.join(' | '));
    ok('viewer desktop: no page errors', !qv.errs.length, qv.errs.join(' | '));
    ok('desktop: no page errors', !q.errs.length, q.errs.join(' | '));
    const z = await open(b.br, b.base, 390, 763, '?nomusic=1&footlab=0&lab=1', 0, true);
    await z.waitForFunction(() => window.__mnr && __mnr.G && __mnr.G.lab, null, { timeout: 20000 }).catch(() => { });
    ok('?footlab=0: no ON FOOT tab', await z.evaluate(() => !document.getElementById('labTab_foot') && !window.FOOTLAB));
  } finally { await b.close(); }
  done('footlab');
})();
