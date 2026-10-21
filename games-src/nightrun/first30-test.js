#!/usr/bin/env node
// FIRST30 (first30 block of parts/bossvis.js + saga.js / draw.js / bossvis.js / bossmoves.js hooks): the first 30 seconds, boss size / lane / aim, laser alpha, logo.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/first30-test.js      env: GAME_DIR=...   Prints PASS / FAIL lines only.
// 390x763 and 375x553 phones: opening = <= 2 cards, <= 8 s, appears AFTER play has started (G.t > 0, enemies out), tap = next, SKIP = off, briefing = one banner line;
// boss css size >= 140, centre lane, armour plates are not white, shots bend toward the boss on Normal (not on Hard), boss laser alpha <= 0.6; logo has no shadow offset;
// ?first30=0 = the old behaviour (modal opening before play, unscaled boss, alpha .95 laser, logo offset); no page errors.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [], ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + i)); };
const VPS = [[390, 763], [375, 553]];
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(700);
  const br = await PW.chromium.launch(), errs = [];
  const open = async (w, h, q, ready) => { const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1${q}`, { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(ready || (() => window.__mnr && document.getElementById('playBtn')), null, { timeout: 30000 }); await sleep(400); p.ctx = ctx; return p; };
  try {
    for (const [w, h] of VPS) {
      const tag = ` ${w}x${h}`;
      // ---- the opening, first30 on
      {
        const p = await open(w, h, '&story=2');
        await p.evaluate(() => { window.__log = []; const m = window.__mnr; window.__t0 = 0; NR.on('sagaOpen', d => window.__log.push({ ev: 'open', at: performance.now(), run: m.running, gt: m.G.t, en: m.G.en.filter(e => e.type !== 'boss').length, n: d.n, kind: d.kind })); NR.on('sagaClose', d => window.__log.push({ ev: 'close', at: performance.now(), kind: d.kind })); window.__seen = new Set();
          setInterval(() => { const c = document.querySelector('#sgCard .sgdots'); if (c && !document.getElementById('sgCard').hidden) window.__seen.add(c.textContent); }, 100); });
        await p.click('#playBtn'); await sleep(700);
        const early = await p.evaluate(() => ({ open: SAGA.open, run: SAGA.t.run(), banner: __mnr.G.banner.b, line: (SAGA.rows.find(r => r.trig === 'brief:1') || {}).l[0] }));
        ok('first PLAY starts the stage at once (no card before play)' + tag, early.run && !early.open, JSON.stringify(early));
        ok('stage 1 briefing is one short line on the start banner' + tag, early.banner.length > 5 && early.banner.length <= 30 && early.line.startsWith(early.banner), early.banner + ' / ' + early.line);
        const gotOpen = await p.waitForFunction(() => window.__log.some(l => l.ev === 'open'), null, { timeout: 9000 }).then(() => true, () => false);
        ok('the opening appears after the first wave starts' + tag, gotOpen);
        if (gotOpen) {
          const o = await p.evaluate(() => window.__log.find(l => l.ev === 'open'));
          ok('first card shows with play running (G.t > 0) and enemies out' + tag, o.run && o.gt > 0 && o.en > 0, JSON.stringify(o));
          ok('opening is 2 cards' + tag, o.n === 2, o.n);
          await sleep(1000); const live = await p.evaluate(() => { const c = document.getElementById('sgCard'); return { cls: c.className, pe: getComputedStyle(c).pointerEvents, hp: __mnr.P.hp }; });
          ok('card is non-blocking (pointer-events none on the overlay)' + tag, /live/.test(live.cls) && live.pe === 'none', JSON.stringify(live));
          await p.waitForFunction(() => window.__log.some(l => l.ev === 'close'), null, { timeout: 12000 }).catch(() => {});
          const L = await p.evaluate(() => ({ log: window.__log, seen: [...window.__seen] }));
          const op = L.log.find(l => l.ev === 'open'), cl = L.log.find(l => l.ev === 'close');
          const secs = cl ? (cl.at - op.at) / 1000 : 99;
          ok('opening lasts <= 8 s' + tag, secs <= 8.2, secs.toFixed(2));
          ok('2 cards were shown, no more' + tag, L.seen.length === 2, JSON.stringify(L.seen));
        }
        await p.ctx.close();
      }
      // ---- tap and SKIP
      {
        const p = await open(w, h, '&story=2');
        await p.click('#playBtn'); await p.waitForFunction(() => window.SAGA && SAGA.open, null, { timeout: 9000 }).catch(() => {});
        await p.click('#sgC'); await sleep(200);
        const d1 = await p.evaluate(() => document.querySelector('#sgCard .sgdots').textContent);
        ok('tap on a card shows the next one' + tag, /○●/.test(d1), d1);
        await p.click('#sgSkip'); await sleep(200);
        ok('SKIP closes the opening' + tag, await p.evaluate(() => !SAGA.open && SAGA.t.run()));
        await p.ctx.close();
      }
      // ---- boss: size, lane, plates, aim, laser
      for (const diff of ['normal', 'hard']) {
        const p = await open(w, h, '&boss=kronos&bpauto=1', () => window.__mnr && window.__mnr.G.boss && __mnr.G.boss.x <= 791);
        await sleep(2500);
        const r = await p.evaluate(async diff => {
          const m = __mnr, e = m.G.boss; m.SET.diff = diff; m.P.hp = 99; const o = {};
          o.css = F30.css(e); o.k = F30.k(e); o.lane = Math.abs(e.y - 270);
          // plates: BV.pl records the fill colour of every intact plate drawn
          BV.pl = []; m.render(m.G.t, 0); o.fills = BV.pl; BV.pl = null;
          // aim: a shot flying straight at the boss's x from the side lane
          const b = { x: 120, y: e.y - 160, vx: 900, vy: 0, r: 4, dmg: 1, life: 3, big: 0 }; m.G.pb.push(b);
          for (let i = 0; i < 20; i++) { m.P.hp = 99; m.step(1 / 60); } o.vy = b.vy; o.by = b.y; o.ey = e.y;
          // laser: draw one live beam; F30.maxA is the highest alpha a beam was drawn with
          const e2 = m.G.boss; e2.lasers = [{ x: e2.x - 30, y: e2.y, a: Math.PI, t: 3 }]; F30.maxA = 0; F30.beams = 0; m.render(m.G.t, 0); o.laser = F30.beams ? F30.maxA : 0;
          return o; }, diff);
        if (diff === 'normal') {
          ok('boss drawn >= 140 css px' + tag, r.css >= 139.5, r.css.toFixed(1) + ' k=' + r.k.toFixed(2));
          ok('boss in the centre lane' + tag, r.lane <= 80, r.lane.toFixed(1));
          ok('armour plates are tinted, not white' + tag, r.fills.length >= 3 && r.fills.every(c => { const m = /rgba?\((\d+), (\d+), (\d+)/.exec(c); return m && Math.min(+m[1], +m[2], +m[3]) < 200; }), JSON.stringify(r.fills));
          ok('Normal: the ship\'s shots bend toward the boss' + tag, r.vy > 20, 'vy ' + r.vy.toFixed(1));
          ok('boss laser alpha <= 0.6' + tag, r.laser > 0 && r.laser <= 0.601, r.laser);
        } else ok('Hard: shots fly straight (no auto-aim)' + tag, Math.abs(r.vy) < 1, 'vy ' + r.vy.toFixed(1));
        await p.ctx.close();
      }
      // ---- the logo
      {
        const p = await open(w, h, ''); const ts = await p.evaluate(() => getComputedStyle(document.querySelector('h1')).textShadow);
        ok('title logo has no red / cyan offset' + tag, ts === 'none', ts); await p.ctx.close();
      }
      // ---- ?first30=0 = before
      {
        const p = await open(w, h, '&story=2&first30=0');
        const ts = await p.evaluate(() => getComputedStyle(document.querySelector('h1')).textShadow);
        ok('?first30=0: logo offset is back' + tag, ts !== 'none', ts);
        await p.click('#playBtn'); await sleep(400);
        ok('?first30=0: the opening is a modal card before play' + tag, await p.evaluate(() => SAGA.open && !SAGA.t.run() && SAGA.kind === 'open'));
        await p.ctx.close();
        const q = await open(w, h, '&boss=kronos&first30=0', () => window.__mnr && __mnr.G.boss && __mnr.G.boss.x <= 791); await sleep(2000);
        const o = await q.evaluate(() => { const e = __mnr.G.boss; return { k: F30.k(e), on: F30.on }; });
        ok('?first30=0: boss is not scaled' + tag, o.k === 1 && !o.on, JSON.stringify(o)); await q.ctx.close();
      }
    }
    ok('no page errors', !errs.length, errs.slice(0, 3).join(' | '));
  } catch (e) { ok('test crashed', false, e.message); }
  await br.close(); srv.kill(); const bad = res.filter(x => !x).length; console.log(bad ? `${bad} FAIL` : 'ALL PASS'); process.exit(bad ? 1 : 0);
})();
