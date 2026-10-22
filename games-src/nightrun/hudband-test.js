#!/usr/bin/env node
// HUDBAND (strict review 9, fixes 3 and 6; E04 / E02): enemies never rest under the HUD band, the ship is drawn from frame 1.
//   NODE_PATH=/opt/node-tools/node_modules node games-src/nightrun/hudband-test.js      env: GAME_DIR=<dir with index.html + media>  SECS=45  STAGES=1-20  VP=390x763  Prints PASS / FAIL lines only.
// Review 10 (F01): no exemption for enemies flying in: from the first frame on screen, an enemy whose top edge is in the band for more than 0.3 s fails (they spawn at the band's lower edge with a warp-in, or cross it at >= 600 u/s).
// 390x763 and 375x553 phones (portrait: the world is turned upright, world x = height from the bottom, so the band is the top 92 HUD units: score strip, chips and boss bar, down to where the hint bubble starts).
//   band   in a stage 1-20 sweep (god mode, hand-stepped, SECS game seconds each) no enemy shows inside the band (top edge y - r < band, still on screen) for more than 0.3 s in a row
//   ship   stage 1 and three drills: at t = 0.1 s the hull is on screen on every one of 12 blink phases (pixels of the 56-unit box round the ship that differ from the same frame without the ship: min >= 0.85 x max and >= SHIP_MIN); ?old: RET.shipBlink = the 6 Hz spawn blink, which hides it on half of them
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [], ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + i)); };
const VPS = [[390, 763], [375, 553]].filter(v => !process.env.VP || process.env.VP === v[0] + 'x' + v[1]);
const SHIP_MIN = +process.env.SHIP_MIN || 80, SECS = +process.env.SECS || 45, [S0, S1] = (process.env.STAGES || '1-20').split('-').map(Number);
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(700);
  const br = await PW.chromium.launch(), errs = [];
  const open = async (w, h) => { const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: true, isMobile: true });
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1&sim=1`, { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => window.__mnr && document.getElementById('playBtn'), null, { timeout: 30000 }); await sleep(1500); p.ctx = ctx; return p; };
  const shipCheck = (p, old) => p.evaluate((old) => {   // step to t = 0.1 s, then for 12 blink phases draw the frame with the ship and with the ship moved away, and count the pixels of the hull box that differ
    const m = window.__mnr, G = m.G, P = m.P; m.god = true; m.simOn(true); m.RET.shipBlink = !!old;
    let n = 0; while (G.t < 0.1 && n++ < 20) m.step(1 / 60);
    const cv = document.getElementById('game'), g = cv.getContext('2d'), k = cv.width / 540, half = Math.round(28 * k), px = () => Math.round(P.y * k), py = () => Math.round((960 - P.x) * cv.height / 960);
    const bx = px(), by = py(), grab = () => g.getImageData(Math.max(0, bx - half), Math.max(0, by - half), 2 * half, 2 * half).data, cnt = [];   // the box stays where the ship was: moving P also moved a live box onto the moved ship and the test then compared two hulls (it only passed on backdrop differences)
    for (let i = 0; i < 12; i++) { const t = G.t + i * 0.083; m.render(t, 0); const a = grab(); P.x += 420; m.render(t, 0); const b = grab(); P.x -= 420;
      let c = 0; for (let j = 0; j < a.length; j += 4) if (Math.abs(a[j] - b[j]) + Math.abs(a[j + 1] - b[j + 1]) + Math.abs(a[j + 2] - b[j + 2]) > 60) c++; cnt.push(c); }
    m.RET.shipBlink = false; return { gt: +G.t.toFixed(2), min: Math.min(...cnt), max: Math.max(...cnt), px: 4 * half * half, cnt: cnt.join(' ') };
  }, old);
  try {
    for (const [w, h] of VPS) {
      const tag = ` ${w}x${h}`;
      { const p = await open(w, h); await p.evaluate(() => __mnr.startStory(1)); const r = await shipCheck(p, !!process.env.OLD); ok('hull drawn at t=0.1 s on every blink phase, stage 1' + tag, r.min >= .85 * r.max && r.min >= SHIP_MIN, JSON.stringify(r));
        const kinds = await p.evaluate(() => { __mnr.simOn(true); return __school.kinds(); }), ids = await p.evaluate(() => __school.ids), tut = ids.filter(i => kinds[i] === 'tut').slice(0, 3);
        for (const id of tut) { await p.evaluate(() => { try { __school.shut(); } catch (e) { } try { __mnr.G.dead = true; } catch (e) { } });
          const q = await open(w, h); await q.evaluate((id) => { __school.run(id); }, id); await sleep(300); const r2 = await shipCheck(q, !!process.env.OLD); ok(`hull drawn at t=0.1 s on every blink phase, drill ${id}` + tag, r2.min >= .85 * r2.max && r2.min >= SHIP_MIN, JSON.stringify(r2)); await q.ctx.close(); }
        await p.ctx.close(); }
      { const p = await open(w, h); let worst = [], total = 0, FR = 0, FB = 0;
        for (let n = S0; n <= S1; n++) {
          const r = await p.evaluate(({ n, SECS }) => { const m = window.__mnr; m.simOn(true); if (m.G && m.G.live) { try { m.G.dead = true; } catch (e) { } }
            if (n > m.STAGES.length) return null; try { running = false; } catch (e) { } m.god = true; m.startStory(n); m.simOn(true);
            const W = 960, HK = Math.min(2, Math.max(1, 11.6 / (11 * (document.getElementById('frame').clientWidth / 540)))), BAND = 92 * HK, hold = new Map(), born = new Map(), bad = []; let steps = 0, fr = 0, fb = 0;
            for (let i = 0; i < SECS * 30 && !m.G.dead && !m.G.over; i++) { m.step(1 / 30); steps++; fr++; if (m.G.en.some(e => e.type !== 'boss' && e.hp > 0 && !e.dead && !e.gnd && e.x < W && W - e.x - e.r < BAND)) fb++;
              const seen = new Set(); for (const e of m.G.en) { if (e.type === 'boss' || e.hp <= 0 || e.dead || e.gnd) continue; if (e.x < W && !born.has(e)) born.set(e, m.G.t);
                if (born.has(e) && W - e.x - e.r < BAND) { seen.add(e); const s = hold.get(e) || { t: 0, y: W - e.x - e.r, type: e.type }; s.t += 1 / 30; hold.set(e, s); if (s.t > .3 && !s.rep) { s.rep = 1; bad.push({ type: e.type, t: +m.G.t.toFixed(1), top: Math.round(s.y), band: Math.round(BAND) }); } } }
              for (const k of [...hold.keys()]) if (!seen.has(k)) hold.delete(k); }
            return { n, sec: +m.G.t.toFixed(1), bad, fr, fb, name: m.STAGES[n - 1].name }; }, { n, SECS });
          if (!r) break; total++; FR += r.fr; FB += r.fb; if (r.bad.length) worst.push(`st${r.n}:${r.bad.slice(0, 3).map(b => `${b.type}@${b.t}s top ${b.top}<${b.band}`).join(',')}`);
          if (r.sec < 5) worst.push(`st${r.n}:ran only ${r.sec}s`); }
        ok(`0 enemies inside the HUD band for > 0.3 s, stages ${S0}-${S1} (${total} run)` + tag, worst.length === 0 && total > 0, worst.join(' | '));
        ok(`enemy frames in the HUD band <= 3% of all frames, stages ${S0}-${S1}` + tag, FB <= .03 * FR, `${FB}/${FR} = ${(100 * FB / Math.max(1, FR)).toFixed(1)}%`); await p.ctx.close(); }
      { const p = await open(w, h);   // endless (director waves + a mini boss + the district boss) and bosses at rest: nothing enters / rests under the band, a boss's top edge stays below it
        const r = await p.evaluate(({ SECS }) => { const m = window.__mnr; m.simOn(true); try { running = false; } catch (e) { } m.god = true; m.SET.diff = 'normal'; m.applySet(); document.getElementById('startBtn').click(); m.simOn(true);
          const W = 960, HK = Math.min(2, Math.max(1, 11.6 / (11 * (document.getElementById('frame').clientWidth / 540)))), BAND = 92 * HK, hold = new Map(), bad = []; let fr = 0, fb = 0, bt = 0, bmin = 1e9, bn = '';
          for (let i = 0; i < SECS * 2 * 30 && !m.G.dead; i++) { m.step(1 / 30); fr++; if (i === 30 * 20) m.bossNow();
            let any = false; const seen = new Set();
            for (const e of m.G.en) { if (e.hp <= 0 || e.dead || e.gnd) continue;
              if (e.type === 'boss') { if (e.t > 5) { const top = W - e.x - 1.8 * e.r; if (top < bmin) { bmin = top; bn = e.nm + ' x' + Math.round(e.x) + ' r' + e.r; } } continue; }
              if (e.x < W && W - e.x - e.r < BAND) { any = true; seen.add(e); const s = hold.get(e) || { t: 0, y: W - e.x - e.r, type: e.type }; s.t += 1 / 30; hold.set(e, s); if (s.t > .3 && !s.rep) { s.rep = 1; bad.push({ type: e.type, t: +m.G.t.toFixed(1), top: Math.round(s.y) }); } } }
            for (const k of [...hold.keys()]) if (!seen.has(k)) hold.delete(k); if (any) fb++; }
          return { bad, fr, fb, bmin: Math.round(bmin), bn, band: Math.round(BAND), t: +m.G.t.toFixed(0) }; }, { SECS });
        ok(`endless ${SECS * 2} s: 0 enemies inside the HUD band for > 0.3 s, band frames <= 3% (${(100 * r.fb / Math.max(1, r.fr)).toFixed(1)}%)` + tag, r.bad.length === 0 && r.fb <= .03 * r.fr, r.bad.slice(0, 4).map(b => `${b.type}@${b.t}s top ${b.top}<${r.band}`).join(','));
        ok(`endless boss at rest keeps its drawn body (1.8 x r) below the band (${r.bn}: top ${r.bmin} >= ${r.band})` + tag, r.bmin >= r.band, r.bn);
        await p.ctx.close(); }
      { const bad = [];   // every stage's district boss and mini boss: spawned at 8 s, 40 s watched
        for (const n of [3, 6, 10, 14, 17, 20].filter(n => n >= S0 && n <= S1)) for (const mini of [false, true]) { const p = await open(w, h);
          const r = await p.evaluate(({ n, mini }) => { const m = window.__mnr; m.simOn(true); if (m.G && m.G.live) { try { m.G.dead = true; } catch (e) { } } try { running = false; } catch (e) { } m.god = true; m.startStory(n); m.simOn(true);
            const W = 960, HK = Math.min(2, Math.max(1, 11.6 / (11 * (document.getElementById('frame').clientWidth / 540)))), BAND = 92 * HK; let bmin = 1e9, nm = '', spawned = false, atRest = 0;
            for (let i = 0; i < 40 * 30 && !m.G.dead && !m.G.over; i++) { m.step(1 / 30); if (i === 8 * 30 && !m.G.boss) { const D = m.DIST[m.G.di] || m.DIST[0]; try { if (mini) m.DIR.spawnMini(); else m.spawnBoss({}); spawned = !!m.G.boss; } catch (e) { return { err: e.message }; } }
              const e = m.G.boss; if (e && e.x < 800 && i > 8 * 30 + 90) { atRest++; const top = W - e.x - 1.8 * e.r; if (top < bmin) { bmin = top; nm = `${e.nm} x${Math.round(e.x)} r${e.r}`; } } }
            return { n, mini, spawned, atRest, bmin: Math.round(bmin), nm, band: Math.round(BAND) }; }, { n, mini });
          if (r.err) bad.push(`st${n}${mini ? 'm' : ''}:${r.err}`); else if (!r.spawned || r.atRest < 30) bad.push(`st${n}${mini ? 'm' : ''}:boss not seen`); else if (r.bmin < r.band) bad.push(`st${n}${mini ? ' mini' : ''}: ${r.nm} top ${r.bmin} < ${r.band}`); await p.ctx.close(); }
        ok('boss and mini boss at rest keep their drawn body (1.8 x r) below the HUD band (stages 3,6,10,14,17,20)' + tag, bad.length === 0, bad.join(' | ')); }
    }
    ok('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } catch (e) { ok('test ran', false, e.stack || e.message); }
  await br.close(); srv.kill(); process.exit(res.every(Boolean) ? 0 : 1);
})();
