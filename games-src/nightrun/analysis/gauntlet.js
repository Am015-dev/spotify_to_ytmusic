#!/usr/bin/env node
// Nightrun gauntlet (analysis only, reads game state, never mutates it). Real input: CDP touch / real keys.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/analysis/gauntlet.js   (env: CFGS=390,844,1280 KINDS=idle,natural,trying CAP=120)
const PW = require('playwright'), fs = require('fs'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = path.resolve(__dirname, '../../../games/mainhattan-nightrun'), SHOTS = path.join(__dirname, 'shots');
const src = fs.readFileSync(path.resolve(__dirname, '../sweep.js'), 'utf8');
const INIT = eval('(' + src.slice(src.indexOf('const INIT = ') + 13, src.indexOf(';\nasync function newPage')) + ')');
const Touch = eval('(' + src.slice(src.indexOf('class Touch'), src.indexOf('const ev = ')) + ')');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mobile/15E148 Safari/604.1';
const ALL = { 390: { name: '390x763', w: 390, h: 763, touch: true }, 844: { name: '844x390', w: 844, h: 390, touch: true }, 1280: { name: '1280x800', w: 1280, h: 800, touch: false } };
const CF = (process.env.CFGS || '390,844,1280').split(',').map(k => ALL[k]), KINDS = (process.env.KINDS || 'idle,natural,trying').split(','), CAP = +process.env.CAP || 120;
function freePort() { return new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); }); }
const out = [];
async function run(browser, base, cfg, kind) {
  const tag = cfg.name + '-' + kind, res = { tag, kind, cfg: cfg.name, timeline: [], hurts: [], judged: [], errs: [], shots: [] };
  const ctx = await browser.newContext({ viewport: { width: cfg.w, height: cfg.h }, deviceScaleFactor: 1, hasTouch: cfg.touch, isMobile: cfg.touch, userAgent: cfg.touch ? UA : undefined });
  const p = await ctx.newPage(); p.on('pageerror', e => res.errs.push(e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.addInitScript(INIT);
  await p.addInitScript(() => {   // input->judge latency probe: when the raw event arrived vs when the game loop judged it; rAF fps
    window.__lat = []; const on = t => addEventListener(t, () => { window.__lastIn = performance.now(); }, true);
    ['touchstart', 'keydown', 'mousedown', 'pointerdown'].forEach(on);
    window.__raf = { n: 0, t0: 0 }; (function f(t) { if (!window.__raf.t0) window.__raf.t0 = t; window.__raf.n++; requestAnimationFrame(f); })(0);
    setInterval(() => { const m = window.__mnr; if (!m || !m.J.last) return; const l = m.J.last; if (l.at !== window.__seenAt) { window.__seenAt = l.at; window.__lat.push({k:l.kind,ok:l.ok,dt:l.dt,lat:l.kind==='graze'?null:Math.round(l.at-(window.__lastIn||l.at))}); } }, 4);
  });
  const cdp = cfg.touch ? await ctx.newCDPSession(p) : null, T = cdp ? new Touch(cdp) : null;
  const shot = async n => { const f = `${tag}-${n}.png`; try { await p.screenshot({ path: path.join(SHOTS, f) }); res.shots.push(f); } catch (e) { } };
  await p.goto(base + 'index.html', { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.__bot);
  await sleep(1500); if (kind === 'natural') await shot('01-title');
  if (cfg.touch) await T.tap(p, '#startBtn'); else await p.keyboard.press('Enter');
  const t0 = Date.now(); await p.waitForFunction(() => window.__mnr.running, null, { timeout: 5000 }).catch(() => { });
  res.startMs = Date.now() - t0; res.bt = await p.evaluate(() => ({ mode: __mnr.BT.mode, bpm: __mnr.BT.bpm, stage: __mnr.BT.stage, outLat: __mnr.AU.a ? __mnr.AU.a.outputLatency : null, baseLat: __mnr.AU.a ? __mnr.AU.a.baseLatency : null }));
  let fx = cfg.w / 2, fy = cfg.h / 2, touching = false, keys = {}, lastHp = null, lastSnap = 0, lastDash = 0, dashN = 0, bossShot = 0, shotsAt = { 2: 1, 9: 1, 20: 1 }, over = false, lastBc = -1, lastRet = 0;
  const hold = async () => { if (cfg.touch) { if (!touching) { await T.down(1, cfg.w / 2, cfg.h / 2); touching = true; fx = cfg.w / 2; fy = cfg.h / 2; } } else if (!keys.Space) { await p.keyboard.down('Space'); keys.Space = 1; } };
  await hold();
  const dashBtn = cfg.touch ? await p.evaluate(() => { const b = document.getElementById('bDash').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; }) : null;
  const doDash = async () => { if (cfg.touch) { await T.down(2, ...dashBtn); await sleep(25); await T.up(2); } else await p.keyboard.press('ShiftLeft'); };
  while (Date.now() - t0 < CAP * 1000) {
    const s = await p.evaluate(() => { const b = window.__bot.step(), m = __mnr; b.hint = m.G && m.G.hint ? m.G.hint.txt : ''; b.ban = m.G && m.G.banner && m.G.banner.t > 0 ? (m.G.banner.txt || m.G.banner.t) : ''; b.ebs = m.G ? m.G.eb.slice(0, 80).map(e => [e.x, e.y, e.r]) : []; b.ens = m.G ? m.G.en.map(e => [e.type, e.x, e.y, e.r]) : []; b.bpf = m.bpos(); b.rn = window.__raf; b.pmod = m.NR.mod; return b; });
    const el = (Date.now() - t0) / 1000;
    if (!s.run) { over = true; break; }
    if (s.shop) { if (!res.shopSeen) { res.shopSeen = el; await shot('shop'); } if (touching) { await T.up(1); touching = false; } await sleep(300); res.shopT = (res.shopT || 0) + 0.3; try { if (s.ov && cfg.touch) { const sk = await p.$('#pitSkip, #skipBtn, .pit-skip'); } } catch (e) { } 
      // skip pit stop with the first visible skip-like button, else wait for its timeout
      continue; }
    if (!touching && cfg.touch) await hold();
    if (s.G && (el - lastSnap >= 5)) { lastSnap = el; res.timeline.push({ t: +el.toFixed(1), score: s.G.score, hp: s.P.hp, di: s.G.di, loop: s.G.loop, J: s.J, Jok: s.Jok, combo: s.C, fps: +(s.fps || 0).toFixed(0), pt: s.G.pt, eb: s.G.eb, en: s.G.en, hint: s.hint, ban: s.ban, bpm: s.bt.bpm, boss: !!s.boss }); }
    for (const k of Object.keys(shotsAt)) if (el >= +k && shotsAt[k] === 1) { shotsAt[k] = 2; await shot('t' + String(k).padStart(2, '0')); }
    if (s.boss && s.boss.x < 900 && !bossShot) { bossShot = 1; res.bossAt = +el.toFixed(1); await sleep(900); await shot('boss'); }
    if (s.G && s.G.banner > 0 && !res['ban' + s.G.di]) { res['ban' + s.G.di] = 1; await shot('banner-d' + s.G.di); }
    // hurt detection
    if (lastHp !== null && s.P.hp < lastHp) { let near = 'unknown', bd = 1e9; for (const b of s.ebs) { const d = Math.hypot(b[0] - s.P.x, b[1] - s.P.y); if (d < bd) { bd = d; near = 'bullet'; } } for (const e of s.ens) { const d = Math.hypot(e[1] - s.P.x, e[2] - s.P.y) - e[3]; if (d < bd) { bd = d; near = e[0]; } } res.hurts.push({ t: +el.toFixed(1), cause: near, hpLeft: s.P.hp, di: s.G.di, boss: !!s.boss }); }
    lastHp = s.P.hp;
    if (s.G && s.G.dead) { res.deadAt = +el.toFixed(1); await sleep(700); await shot('dead'); over = true; break; }
    const d = s.d; if (!d) { await sleep(20); continue; }
    // ---- movement
    if (kind !== 'idle') {
      if (cfg.touch) { const [sx, sy] = await p.evaluate(([dx, dy]) => window.__bot.scr(dx, dy), [(d.bx - s.P.x) / 1.5 * .7, (d.by - s.P.y) / 1.5 * .7]); fx += sx; fy += sy; if (fx < 25 || fx > cfg.w - 25 || fy < 25 || fy > cfg.h - 100) { await T.up(1); touching = false; } else await T.move(1, fx, fy); }
      else { const want = { ArrowRight: d.bx - s.P.x > 8, ArrowLeft: d.bx - s.P.x < -8, ArrowDown: d.by - s.P.y > 8, ArrowUp: d.by - s.P.y < -8 }; for (const k in want) { if (want[k] && !keys[k]) { await p.keyboard.down(k); keys[k] = 1; } else if (!want[k] && keys[k]) { await p.keyboard.up(k); keys[k] = 0; } } }
    }
    // ---- dash policy
    const spb = 60 / s.bt.bpm;
    if (kind === 'natural' && d.dash && Date.now() - lastDash > 900) { lastDash = Date.now(); dashN++; await doDash(); }          // reacts to danger, ignores the beat
    if (kind === 'trying' && Date.now() - lastDash > 1100) {                                                                       // times a dash to the next beat (dash whenever a beat is coming, as the hint says)
      const frac = s.bpf - Math.floor(s.bpf), wait = (1 - frac) * spb * 1000; if (wait < 120 && P_ready(s)) { await sleep(Math.max(0, wait - 25)); lastDash = Date.now(); dashN++; await doDash(); }
    }
    // trying-fire: lift & re-tap on the beat is the only way to score a fire PERFECT on touch; keyboard: tap Space on beat
    if (kind === 'trying' && Date.now() - lastRet > 700) {
      const frac = s.bpf - Math.floor(s.bpf), wait = (1 - frac) * spb * 1000;
      if (wait < 90 && wait > 30 && lastBc !== Math.floor(s.bpf)) { lastBc = Math.floor(s.bpf); lastRet = Date.now(); await sleep(Math.max(0, wait - 20));
        if (cfg.touch) { if (touching) { await T.up(1); } await T.down(1, fx, fy); touching = true; } else { await p.keyboard.up('Space'); await p.keyboard.down('Space'); } }
    }
  }
  function P_ready(s) { return s.P.dashCd <= 0; }
  const fin = await p.evaluate(() => { const m = __mnr; return { J: m.J.n, Jok: m.J.ok, perf: m.G ? m.G.perf : 0, score: m.G ? m.G.score : 0, best: m.C.best, lat: window.__lat.slice(), raf: window.__raf.n, t0: window.__raf.t0, now: performance.now(), jsum: m.J }; });
  res.final = fin; res.dashN = dashN; res.fps = Math.round(fin.raf / ((fin.now - fin.t0) / 1000)); res.over = over; res.dur = +((Date.now() - t0) / 1000).toFixed(1);
  if (over) { await sleep(1500); await shot('gameover'); }
  await ctx.close(); return res;
}
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' }); await sleep(800);
  const browser = await PW.chromium.launch();
  const jobs = []; for (const c of CF) for (const k of KINDS) jobs.push([c, k]);
  const results = await Promise.all(CF.map(async c => { const rs = []; for (const k of KINDS) { try { rs.push(await run(browser, `http://127.0.0.1:${port}/`, c, k)); } catch (e) { rs.push({ tag: c.name + '-' + k, error: e.message }); } } return rs; }));
  fs.writeFileSync(path.join(__dirname, 'gauntlet-results.json'), JSON.stringify(results.flat(), null, 1));
  await browser.close(); srv.kill(); console.log('done');
})();
