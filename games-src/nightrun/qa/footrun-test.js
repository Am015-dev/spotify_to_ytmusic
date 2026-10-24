#!/usr/bin/env node
// FOOTRUN: street foes that move show a run/walk sheet whose cycle matches the ground, and are drawn solid (owner 24 Oct 2026: "enemies slide ... low opacity with blinking enemies"). PASS/FAIL lines only.
//   Stepped at 1/60 (no wall clock): each foe type alone for SECS (60) of game time, FOOT.look.draw after every step, hp kept up so it is hit all the time (the flash is exercised).
//   a  idle:  0 draws where the foe moves > 20 units/s while drawing its idle sheet
//   b  slide: ground distance per run cycle within 20% of the sheet's stride (2 x foot spread, FOOT.FEEL.ST or 0.8 x cell width, drawn at the body scale), for every foe that runs or walks
//   c  alpha: the strongest non-additive drawImage of the foe has alpha 1.0 on >= 99% of the draws (death fade not drawn: hp is kept up)
//   d  blink: 0 times the act changes run/walk -> other act -> run/walk within 0.3 s while the foe keeps moving, and no white flash longer than 0.1 s (one 60 Hz step of slack)
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/footrun-test.js     env: GAME_DIR (default: a fresh build), SECS=60, ONLY=id,id, Q=?nomusic=1&morefoes=1 (add &footrun=0 for the old street)
const path = require('path'), fs = require('fs'), os = require('os'), cp = require('child_process');
const NR = path.resolve(__dirname, '..'), SECS = +process.env.SECS || 60, Q = process.env.Q || '?nomusic=1&morefoes=1&footrun=1', ONLY = process.env.ONLY;
if (!process.env.GAME_DIR) {
  const G = path.resolve(NR, '../../games/mainhattan-nightrun'), B = fs.mkdtempSync(path.join(os.tmpdir(), 'footrun-'));
  cp.execFileSync('python3', [path.join(NR, 'parts/build.py')], { env: { ...process.env, NR_OUT: path.join(B, 'index.html') }, stdio: 'ignore' });
  for (const d of ['media', 'music', 'icons']) fs.symlinkSync(path.join(G, d), path.join(B, d));
  for (const f of ['manifest.webmanifest', 'sw.js', 'offline.json']) fs.copyFileSync(path.join(G, f), path.join(B, f));
  process.env.GAME_DIR = B;
}
const { boot, open, sleep, ok, done } = require('./lib.js');
(async () => {
  const b = await boot();
  try {
    const p = await open(b.br, b.base, 390, 763, Q);
    await p.evaluate(() => { FOOT.stop && FOOT.stop(); FOOT.start('zeil'); });
    for (let i = 0; i < 8; i++) { await sleep(250); if (await p.evaluate(() => !!FOOT.S)) break; await p.evaluate(() => { const c = document.getElementById('taleCard'); if (c && !c.hidden) (document.getElementById('taleTc') || c).click(); }); }
    await sleep(2500);
    await p.evaluate(() => {
      const A = __mnr.ART, P = CanvasRenderingContext2D.prototype, di = P.drawImage; window.__d = { cur: null, on: false };
      P.drawImage = function () { const c = window.__d.on && window.__d.cur; if (c && this.globalCompositeOperation !== 'lighter' && this.globalAlpha > c.a) c.a = this.globalAlpha; if (c && this.globalCompositeOperation === 'lighter') c.lit = 1; return di.apply(this, arguments); };
      const od = A.drawAnim; A.drawAnim = function (c, key, t) { const r = window.__d.on && window.__d.cur; if (r && !r.key) { r.key = key; r.tt = t; } return od.apply(this, arguments); };
      const ofd = A.footDraw; A.footDraw = function (c, who, pose, x, y, h) { const r = window.__d.cur; if (r && A.fE && A.fE.id === window.__d.tid) { r.h = h; r.pose = pose; window.__d.on = true; try { return ofd.apply(this, arguments); } finally { window.__d.on = false; } } return ofd.apply(this, arguments); };
    });
    const ids = (await p.evaluate(() => Object.keys(window.FOOT_ENEMIES).filter(k => k !== 'mech'))).filter(i => !ONLY || ONLY.split(',').includes(i));
    await p.evaluate(ids => { const S = FOOT.S, L = FOOT._in.L(), A = __mnr.ART; for (const id of ids) { S.E.length = 0; const e = FOOT.env.spawn(id, S.camX + 200, null); if (e) { e._sd = 1; try { FOOT.look.draw(L.ctx); } catch (x) { } } }
      for (const w in A.FM) for (const a of A.FM[w]._all) A.anim(w + '/' + a); S.E.length = 0; }, ids);
    await sleep(6000);   // sheets decode off the main thread: a stepped loop never yields
    for (const id of ids) {
      const r = await p.evaluate(({ id, SECS }) => {
        const S = FOOT.S, A = __mnr.ART, L = FOOT._in.L(), ST = FOOT.FEEL.ST; S.E.length = 0; S.P.x = S.camX + 60;
        const e = FOOT.env.spawn(id, S.camX + 200, null); if (!e) return { id, err: 'nospawn' }; e._sd = 1; e.grace = 0; window.__d.tid = id;
        const R = { id, draws: 0, aLow: 0, idleMove: 0, runD: 0, runCyc: 0, blink: 0, flashMax: 0, moving: 0 };
        let lx = null, lph = null, lkey = null, hist = [], fl = 0;
        for (let i = 0; i < SECS * 60; i++) {
          S.P.x = S.camX + 60; S.P.hp = 9999; S.P.inv = 1e9; e.hp = 1e9; FOOT.sim(1 / 60, 1 / 60);
          if (e.dead || e.remove || S.E.indexOf(e) < 0) { R.gone = i; break; }
          const rec = window.__d.cur = { a: 0 }; try { FOOT.look.draw(L.ctx); } catch (x) { R.err = String(x); } window.__d.cur = null;
          if (rec.key == null) continue; R.draws++;
          const v = lx == null ? 0 : Math.abs(e.x - lx) * 60; lx = e.x, act = rec.key.slice(rec.key.indexOf('/') + 1);
          if (rec.a < .999) R.aLow++;
          fl = e._rfd === S.time ? fl + 1 / 60 : 0; if (fl > R.flashMax) R.flashMax = fl;
          const run = /^(run|walk)$/.test(act);
          if (v > 20) { R.moving++; if (act === 'idle') { R.idleMove++; const k = e.state + '/' + rec.pose + '/' + Math.round(v); R.info = R.info || {}; R.info[k] = (R.info[k] || 0) + 1; } }
          hist.push(v > 20 ? (run ? 'r' : /^(idle|hit|hurt)$/.test(act) ? 'o' : 'a') : 'x'); if (hist.length > 18) hist.shift();
          if (hist.length >= 3 && hist[hist.length - 1] === 'r') { const s = hist.join(''); if (/ro{1,17}r$/.test(s) && !/[xa]/.test(s.slice(s.search(/ro/)))) { R.blink++; hist = ['r']; } }
          if (v > 20 && run) {
            const o = A.aS(rec.key), m = A.ANIM.s[rec.key], ph = rec.tt / o.tot;
            if (lkey === rec.key && lph != null) { let d = ph - lph; d -= Math.round(d); R.runCyc += Math.abs(d); R.runD += v / 60; }
            lph = ph; lkey = rec.key; R.step = (ST[rec.key] || m[2] * .8); R.stride = 2 * R.step * rec.h / (m[6] || m[3]);
          } else { lkey = null; lph = null; }
        }
        R.distPerCycle = R.runCyc > 0 ? R.runD / R.runCyc : 0; return R;
      }, { id, SECS });
      if (r.err && !r.draws) { ok(`${id}: ${r.err}`, false); continue; }
      const moves = r.moving > 0;
      ok(`${id}: ${r.draws} draws, ${r.moving} moving (>20 u/s), idle sheet while moving ${r.idleMove} (limit 0)`, r.draws > 0 && r.idleMove === 0, `idleMove ${r.idleMove} ${JSON.stringify(r.info)}`);
      if (r.runCyc > .5) { const q = r.distPerCycle / r.stride; ok(`${id}: ground per run cycle ${r.distPerCycle.toFixed(0)} vs stride ${r.stride.toFixed(0)} = ${q.toFixed(2)} (0.80-1.20)`, q >= .8 && q <= 1.2, q.toFixed(2)); }
      ok(`${id}: alpha 1.0 on ${(100 * (1 - r.aLow / Math.max(1, r.draws))).toFixed(1)}% of draws (>= 99%), blink cycles ${r.blink} (0), longest white flash ${(r.flashMax * 1000).toFixed(0)} ms (<= 105)`, r.aLow <= .01 * r.draws && r.blink === 0 && r.flashMax <= .105, `aLow ${r.aLow} blink ${r.blink} flash ${r.flashMax}`);
    }
    ok('no page errors', p.errs.length === 0, p.errs.join(' | '));
  } finally { await b.close(); }
  done('footrun-test');
})();
