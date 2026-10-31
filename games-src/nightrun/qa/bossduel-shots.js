#!/usr/bin/env node
// BOSSDUEL-SHOTS (W290): screenshots of the street boss duel at 390x763 / 844x390 (touch) and 1440x860: each telegraph (SWING, CHARGE, POUND),
// a right answer (the green pop), the punish window (OPEN), the kill and the result. Shots only: the stage clock is jumped to the boss and Kai's hearts
// are refilled, keys are real (keyboard on every size, so the answer is pressed the same way); never a clear-rate run.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/bossduel-shots.js    env: OUT=<dir>
const path = require('path'), fs = require('fs'); const { boot, open, sleep } = require('./lib.js');
const OUT = process.env.OUT || path.join(require('os').tmpdir(), 'bossduel'); fs.mkdirSync(OUT, { recursive: true });
const KEY = { swing: 'KeyI', charge: 'ShiftLeft', pound: 'KeyK' };
(async () => {
  const b = await boot(); let bad = 0;
  for (const [W, H] of [[390, 763], [844, 390], [1440, 860]]) {
    const p = await open(b.br, b.base, W, H, '?nomusic=1', 1, W < 1000), tag = W + 'x' + H, st = () => p.evaluate(() => { const B = window.FOOT.S && window.FOOT.S.boss; return B ? { st: B.state, a: B.atk, sT: B.sT, hp: B.hp, d: !!B.dead, end: !!window.FOOT.S.end } : null; });
    try {
      await p.evaluate(() => { window.RET.tale = false; window.FOOT.start('zeil'); }); await sleep(2500);
      await p.evaluate(() => { const S = window.FOOT.S; S.time = 152; S.P.x = 7350; S.camX = 7250; S.E.forEach(e => { if (!e.boss) e.hp = 0; }); });
      const snap = async o => { await p.evaluate(() => { window.FOOT._ts0 = window.FOOT.ts; window.FOOT.ts = 1e-6; }); await sleep(120); await p.screenshot(o); await p.evaluate(() => { window.FOOT.ts = window.FOOT._ts0; }); };   // W300: the game clock is frozen for the shot (a 1440 shot took longer than the answer window)
      const seen = {}; let right = 0, punish = 0; const t0 = Date.now();
      while (Date.now() - t0 < 90000) {
        await p.evaluate(() => { const P = window.FOOT.S.P; if (P.hp > 0) P.hp = P.max; });
        const s = await st(); if (!s) { await sleep(100); continue; } if (s.end) break;
        if (s.st === 'sb_tel' && !seen[s.a] && s.sT > .3) { seen[s.a] = 1; await snap({ path: path.join(OUT, `${tag}-tele-${s.a}.jpg`), type: 'jpeg', quality: 70 }); }
        if (s.st === 'sb_tel' && s.a === 'pound' && right >= 3 && !seen.wrong && s.sT > .1) { seen.wrong = 1; await p.keyboard.down('KeyI'); await sleep(60); await p.keyboard.up('KeyI'); await sleep(140); await snap({ path: path.join(OUT, `${tag}-wrong-mark.jpg`), type: 'jpeg', quality: 70 });   // W300: a wrong answer (GUARD on a POUND)
          for (let i = 0; i < 40 && (await st() || {}).st === 'sb_tel'; i++) await sleep(25); await sleep(60); await snap({ path: path.join(OUT, `${tag}-wrong-flash.jpg`), type: 'jpeg', quality: 70 }); continue; }
        if (s.st === 'sb_tel' && s.sT < .45 && s.sT > .2) { await p.keyboard.down(KEY[s.a]); await sleep(60); await p.keyboard.up(KEY[s.a]); await sleep(200); if (!right++) { await sleep(450); await snap({ path: path.join(OUT, `${tag}-right-answer.jpg`), type: 'jpeg', quality: 70 }); } continue; }
        if (s.st === 'stun') { if (!punish++) { await sleep(300); await snap({ path: path.join(OUT, `${tag}-punish-open.jpg`), type: 'jpeg', quality: 70 }); }
          if (seen.swing && seen.charge && seen.pound) await p.evaluate(() => { const B = window.FOOT.S.boss; if (B.hp > 4) B.hp = 4; });
          await p.keyboard.down('KeyL'); await sleep(80); await p.keyboard.up('KeyL'); }
        if (s.d && !seen.kill) { seen.kill = 1; await sleep(150); await snap({ path: path.join(OUT, `${tag}-kill.jpg`), type: 'jpeg', quality: 70 }); }
        await sleep(40);
      }
      await sleep(2500); await snap({ path: path.join(OUT, `${tag}-result.jpg`), type: 'jpeg', quality: 70 });
      const got = fs.readdirSync(OUT).filter(f => f.startsWith(tag)).length; console.log((got >= 9 ? 'PASS ' : 'FAIL ') + tag + ' shots ' + got + (p.errs.length ? ' errors ' + p.errs.join('|') : '')); if (got < 9 || p.errs.length) bad++;
    } catch (e) { bad++; console.log('FAIL ' + tag + ' ' + String(e.stack).slice(0, 200)); } finally { await p.context().close(); }
  }
  await b.close(); console.log((bad ? 'FAIL' : 'PASS') + ' bossduel-shots (' + OUT + ')'); process.exit(bad ? 1 : 0);
})();
