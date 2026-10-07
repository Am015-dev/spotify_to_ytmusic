#!/usr/bin/env node
// Mainhattan Nightrun bug sweep: plays the REAL page with real input (CDP touch, real keys) and asserts every step.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/sweep.js
//   env: RUNS=34 (bot runs, split over the 4 sizes) SECS=22 (seconds per run) PAR=2 (pages at once) SKIP=beat,pause,... ONLY=beat SEED=1 SHOTS=1 (save playtest screenshots)
// It fails on: page errors, audio errors, a run that stands still >8 s, ship not following input, buttons off screen or covered,
// horizontal scroll, average FPS < 45, a boss that cannot be hurt or reached, HUD text not equal to the game state, NaN state,
// broken pause / restart / resume / settings, tab-hide not pausing, rotation breaking layout or input, and beat judging that is off by more than 80 ms.
// Beat checks use a generated 120 BPM test WAV served by a route override (nothing is written to the repo).
const PW = require(process.env.PW || 'playwright'), fs = require('fs'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = path.resolve(__dirname, '../../games/mainhattan-nightrun');
const OUT = path.join(__dirname, 'playtest'); fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) if (/^fail.*\.png$/.test(f)) fs.unlinkSync(path.join(OUT, f));
const RUNS = +process.env.RUNS || 34, SECS = +process.env.SECS || 22, PAR = +process.env.PAR || 2;
const SKIP = new Set((process.env.SKIP || '').split(',').filter(Boolean)), ONLY = process.env.ONLY || '';
const want = n => ONLY ? ONLY.split(',').includes(n) : !SKIP.has(n);
let seed = +process.env.SEED || 7; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mobile/15E148 Safari/604.1';
const CFGS = [
  { name: '390x763', w: 390, h: 763, touch: true }, { name: '375x553', w: 375, h: 553, touch: true },
  { name: '844x390', w: 844, h: 390, touch: true }, { name: '1280x800', w: 1280, h: 800, touch: false }];
const PT_CAP = 150;                                     // calm visuals: most particles allowed on screen at once
const fails = [], seen = new Set(), stats = { runs: 0, ticks: 0, perfect: 0, kills: 0, bosses: 0, fps: [], maxDistrict: 0 }; let shotN = 0;
let URL_BASE = '';

async function fail(p, tag, kind, detail) {
  const key = tag.split('/')[0].replace(/#\d+/, '') + kind + String(detail).slice(0, 50); if (seen.has(key)) return; seen.add(key);
  const f = { tag, kind, detail: String(detail).slice(0, 300), shot: '' };
  if (p && shotN < 12) { f.shot = 'fail' + (++shotN) + '-' + kind.replace(/\W+/g, '_') + '.png'; try { await p.screenshot({ path: path.join(OUT, f.shot) }); } catch (e) { } }
  fails.push(f); console.log('  FAIL', tag, kind, f.detail);
}
// ---------------- server ----------------
function freePort() { return new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); }); }
async function startServer() {
  const port = await freePort(); const proc = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { try { const r = await fetch(`http://127.0.0.1:${port}/index.html`); if (r.ok) break; } catch (e) { } await sleep(100); }
  URL_BASE = `http://127.0.0.1:${port}/`; return proc;
}
// ---------------- page side helpers ----------------
const INIT = () => {
  window.__spy = { starts: [], onsets: [] };
  setInterval(() => { const m = window.__mnr; if (window.__noPW && m && m.G && m.G.live) m.PW.st().cnt = 1e9; }, 30);   // tests that need a steady tempo get no glowing enemies
  const os = AudioBufferSourceNode.prototype.start;
  AudioBufferSourceNode.prototype.start = function (when) { try { if (this.buffer && this.buffer.duration > 3) window.__spy.starts.push({ at: this.context.currentTime, when: when || 0, dur: this.buffer.duration }); } catch (e) { } return os.apply(this, arguments); };
  window.__bot = {
    gridErr() {                                          // ms the game's beat position is off the real audio grid (file mode): last started song + offsetMs
      const m = window.__mnr, a = m.AU.a, sp = window.__spy.starts[window.__spy.starts.length - 1]; if (!sp || m.BT.mode !== 'file') return null;
      const lat = a.outputLatency || 0, want = (a.currentTime - lat - (sp.when + m.BT.off)) / m.BT.spb; return (m.bpos() - want) * m.BT.spb * 1000;
    },
    scr(dx, dy) { const r = document.getElementById('frame').getBoundingClientRect(), rot = window.__mnr.rotMode; return rot ? [-dy * r.width / 540, dx * r.height / 960] : [dx * r.width / 960, dy * r.height / 540]; },
    decide() {
      const m = window.__mnr, G = m.G, P = m.P; if (!G || !P) return null;
      let ty = 270, tx = 220, bd = 1e9;
      for (const e of G.en) { if (e.type === 'boss') { if (e.x < 960) { ty = e.y; } continue; } const dx = e.x - P.x; if (dx > 0 && dx < bd && e.x < 940) { bd = dx; ty = e.type === 'gate' ? e.gy : e.y; } }
      let bc = 1e18, bx = P.x, by = P.y;
      for (let ix = -5; ix <= 5; ix++) for (let iy = -5; iy <= 5; iy++) {
        const cx = P.x + ix * 24, cy = P.y + iy * 24; if (cx < 30 || cx > 900 || cy < 40 || cy > 480) continue; let c = 0;
        for (const b of G.eb) { const px = b.x + b.vx * .14, py = b.y + b.vy * .14, d = Math.hypot(px - cx, py - cy); if (d < 70) c += (70 - d) * (70 - d) * (d < 26 ? 30 : 1); }
        for (const e of G.en) { if (e.type === 'gate') { if (Math.abs(e.x - cx) < 60 && (cy < e.gy - e.gap / 2 + 12 || cy > e.gy + e.gap / 2 - 12)) c += 3000; continue; } const d = Math.hypot(e.x - cx, e.y - cy), r = e.r + 55; if (d < r) c += (r - d) * (r - d) * 3; }
        c += Math.abs(cy - ty) * .6 + Math.abs(cx - tx) * .15 + Math.hypot(ix, iy) * 4; if (c < bc) { bc = c; bx = cx; by = cy; }
      }
      const near = G.eb.some(b => Math.hypot(b.x + b.vx * .08 - P.x, b.y + b.vy * .08 - P.y) < 30);
      const dash = near && P.dashCd <= 0 && Math.random() < .5, emp = P.emp > 0 && (G.eb.length > 45 || (P.hp <= 1 && near));
      return { bx, by, dash, emp };
    },
    probe() {
      const m = window.__mnr, out = { ok: !!m }; if (!m) return out;
      const G = m.G, P = m.P, vis = e => { const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && !e.closest('[hidden]'); };
      const ids = ['title', 'over', 'pausem', 'setm']; out.ov = {}; for (const i of ids) out.ov[i] = !document.getElementById(i).hidden;
      out.run = m.running; out.paused = m.paused; out.rot = m.rotMode; out.vw = innerWidth; out.vh = innerHeight; out.touchUI = m.touchUI;
      out.sw = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth); out.sl = document.documentElement.scrollLeft + document.body.scrollLeft;
      out.actx = m.AU.a ? m.AU.a.state : 'none';
      const fr = document.getElementById('frame').getBoundingClientRect(); out.fr = [fr.left, fr.top, fr.right, fr.bottom];
      out.bad = [];
      if (out.sw > innerWidth + 1) out.bad.push('hscroll ' + out.sw + '>' + innerWidth);
      if (fr.left < -2 || fr.top < -2 || fr.right > innerWidth + 2 || fr.bottom > innerHeight + 2) out.bad.push('frame off screen ' + fr.left.toFixed(0) + ',' + fr.top.toFixed(0) + ',' + fr.right.toFixed(0) + ',' + fr.bottom.toFixed(0));
      const cv = document.getElementById('game'); if (Math.abs(cv.getBoundingClientRect().width - (m.rotMode ? fr.height : fr.width)) > 3 && !m.rotMode) out.bad.push('canvas size');
      const sels = ['#touch button', '.ov:not([hidden]) button', '.ov:not([hidden]) input'];
      for (const e of document.querySelectorAll(sels.join(','))) {
        if (!vis(e)) continue; const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
        if (r.left < -1 || r.top < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1) { out.bad.push('control off screen ' + (e.id || e.textContent.trim().slice(0, 12)) + ' ' + [r.left, r.top, r.right, r.bottom].map(Math.round)); continue; }
        const h = document.elementFromPoint(x, y); if (!(h && (e === h || e.contains(h) || (h.closest && h.closest('label') && h.closest('label') === e.closest('label'))))) out.bad.push('control covered ' + (e.id || e.textContent.trim().slice(0, 12)) + ' by ' + (h && (h.id || h.className || h.tagName)));
      }
      for (const o of document.querySelectorAll('.ov:not([hidden])')) if (o.scrollWidth > o.clientWidth + 1) out.bad.push('overlay wider than screen ' + o.id);
      if (m.running && !m.paused && !G.dead && !document.getElementById('touch').hidden === false && out.touchUI) out.bad.push('touch buttons hidden while playing');
      if (G && P) {
        const fin = v => Number.isFinite(v); out.nan = !(fin(P.x) && fin(P.y) && fin(P.hp) && fin(P.heat) && fin(G.score) && fin(G.mult) && G.eb.every(b => fin(b.x) && fin(b.y)) && G.en.every(e => fin(e.x) && fin(e.y) && fin(e.hp)));
        out.G = { t: G.t, score: G.score, kills: G.kills, di: G.di, loop: G.loop, dt: G.dt, en: G.en.length, eb: G.eb.length, dead: G.dead, bc: G.bc, bossDone: G.bossDone, transT: G.transT, banner: G.banner.t, daily: G.daily, perf: G.perf, pt: G.pt.length, calm: m.SET.calm };
        const b = G.boss; out.boss = b ? { x: b.x, y: b.y, hp: b.hp, max: b.max, ph: b.ph, bt: b.bt, r: b.r } : null;
        out.P = { x: P.x, y: P.y, hp: P.hp, heat: P.heat, emp: P.emp, dashCd: P.dashCd, dashT: P.dashT, inv: P.inv, wl: P.wl };
        out.hud = Object.assign({}, m.HUD); out.C = m.C.n; out.J = m.J.n; out.Jok = m.J.ok; out.bt = { mode: m.BT.mode, bpm: m.BT.bpm, stage: m.BT.stage }; out.fps = m.FPS.t ? m.FPS.n / m.FPS.t * 1000 : 0; out.bp = m.bpos();
      }
      return out;
    },
    step() { const s = this.probe(); s.d = s.G && s.run && !s.paused ? this.decide() : null; return s; }
  };
};
async function newPage(browser, cfg, o = {}) {
  const ctx = await browser.newContext({ viewport: { width: cfg.w, height: cfg.h }, deviceScaleFactor: 1, hasTouch: cfg.touch, isMobile: cfg.touch, userAgent: cfg.touch ? UA : undefined, reducedMotion: o.reduce ? 'reduce' : 'no-preference' });
  const p = await ctx.newPage(); p.setDefaultTimeout(15000); p.errs = [];
  p.on('pageerror', e => p.errs.push('pageerror ' + e.message));
  p.on('console', m => { const t = m.text(); if (m.type() === 'error' && !/Failed to load resource|net::ERR|404|favicon/i.test(t)) p.errs.push('console ' + t); if (m.type() === 'warning' && /audio|decode/i.test(t)) p.errs.push('audio warning ' + t); });
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  if (o.route) await o.route(p);
  if (o.init) await p.addInitScript(o.init);
  if (!o.pw) await p.addInitScript(() => { window.__noPW = 1; });
  await p.addInitScript(INIT);
  const cdp = cfg.touch ? await ctx.newCDPSession(p) : null;
  await p.goto(URL_BASE + 'index.html' + (o.query || ''), { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => window.__mnr && window.__bot);
  return { p, cdp, ctx, T: cdp ? new Touch(cdp) : null };
}
class Touch {                                           // real touch events through DevTools; the full set of active points is sent every time
  constructor(cdp) { this.cdp = cdp; this.pts = new Map(); }
  async send(type) { await this.cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...this.pts].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id })) }); }
  async down(id, x, y) { this.pts.set(id, [x, y]); await this.send('touchStart'); }
  async move(id, x, y) { if (!this.pts.has(id)) return; this.pts.set(id, [x, y]); await this.send('touchMove'); }
  async up(id) { if (!this.pts.has(id)) return; this.pts.delete(id); await this.send('touchEnd'); }
  async tapAt(x, y, ms = 40) { await this.down(9, x, y); await sleep(ms); await this.up(9); }
  async tap(p, sel) { const r = await p.evaluate(s => { const e = document.querySelector(s), b = e.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; }, sel); await this.tapAt(r[0], r[1]); }
}
const ev = (p, f, a) => p.evaluate(f, a);
async function waitFor(p, f, a, ms = 5000) { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await p.evaluate(f, a)) return true; await sleep(50); } return false; }
async function press(p, cfg, T, sel) { if (cfg.touch) await T.tap(p, sel); else await p.click(sel); }
async function startGame(p, cfg, T, how) {
  if (how === 'daily') { await press(p, cfg, T, '#dailyBtn'); }
  else if (cfg.touch) await T.tap(p, '#startBtn'); else await p.keyboard.press('Enter');
  return waitFor(p, () => window.__mnr.running && !window.__mnr.paused, null, 4000);
}

// ---------------- bot run ----------------
async function playRun(browser, cfg, i, kind) {
  const tag = `${cfg.name}#${i}${kind ? '/' + kind : ''}`, { p, cdp, T } = await newPage(browser, cfg, { reduce: kind === 'reduce', pw: true });
  stats.runs++; const t0 = Date.now(), maxMs = SECS * 1000 * (kind === 'boss' ? 4 : 1);
  try {
    if (!await startGame(p, cfg, T, kind === 'daily' ? 'daily' : 'start')) { await fail(p, tag, 'start', 'game did not start'); return; }
    if (kind === 'late') await ev(p, i => window.__mnr.skipTo(i), 1 + (i % 3));
    if (kind === 'boss') { await ev(p, () => { window.__mnr.god = true; window.__mnr.skipTo(0); window.__mnr.bossNow(); }); }
    if (kind === 'bossN') { await ev(p, i => { window.__mnr.god = true; window.__mnr.skipTo(i); window.__mnr.bossNow(); }, 1 + (i % 3)); }
    let fx = cfg.w / 2, fy = cfg.h / 2, touching = false, keys = {}, lastProg = Date.now(), lastSig = '', lastHudFrame = -1, lastEn = Date.now(), stillSince = 0, lastPos = null, lastMoveCheck = Date.now();
    let bossT0 = 0, bossHp0 = 0, bossSeen = false, over = false, nTick = 0, dashN = 0;
    if (!cfg.touch) { await p.keyboard.down('Space'); keys.Space = 1; }
    while (Date.now() - t0 < maxMs) {
      const s = await ev(p, () => window.__bot.step()); nTick++; stats.ticks++;
      if (p.errs.length) { await fail(p, tag, 'page-error', p.errs[0]); break; }
      for (const b of s.bad) await fail(p, tag, 'layout', b);
      if (s.nan) await fail(p, tag, 'NaN-state', 'non-finite value in game state');
      if (!s.run) { over = true; break; }
      if (s.paused) { await fail(p, tag, 'unexpected-pause', 'game paused by itself'); break; }
      if (s.actx !== 'running' && Date.now() - t0 > 3000) { await fail(p, tag, 'audio', 'AudioContext is ' + s.actx + ' while playing'); }
      stats.maxDistrict = Math.max(stats.maxDistrict, s.G.di + 4 * s.G.loop);
      if (s.G.calm) { stats.maxPt = Math.max(stats.maxPt || 0, s.G.pt); if (s.G.pt > PT_CAP) await fail(p, tag, 'particles', s.G.pt + ' particles on screen (cap ' + PT_CAP + ') in calm mode'); }
      // HUD text equals the engine state
      if (s.hud.frame > 0 && s.hud.frame !== lastHudFrame && !s.G.dead) {
        lastHudFrame = s.hud.frame; const h = s.hud;
        if (h.score !== String(s.G.score).padStart(8, '0') || h.hp !== s.P.hp || h.heat !== Math.round(s.P.heat) || h.emp !== s.P.emp || h.combo !== s.C || h.wl !== s.P.wl)
          await fail(p, tag, 'HUD-mismatch', JSON.stringify({ hud: [h.score, h.hp, h.heat, h.emp, h.combo, h.wl], eng: [s.G.score, s.P.hp, Math.round(s.P.heat), s.P.emp, s.C, s.P.wl] }));
        if (!(s.P.hp >= 0 && s.P.hp <= 5 && s.P.heat >= 0 && s.P.heat <= 100.01 && s.P.emp >= 0 && s.P.emp <= 3)) await fail(p, tag, 'HUD-range', JSON.stringify(s.P));
      }
      // progress / stuck
      const sig = [Math.floor(s.G.t), s.G.bc, s.G.kills, s.G.score].join('/'); if (sig !== lastSig) { lastSig = sig; lastProg = Date.now(); }
      if (Date.now() - lastProg > 8000) { await fail(p, tag, 'stuck', 'state frozen for 8 s ' + sig); break; }
      if (s.G.en > 0 || s.boss || s.G.transT >= 0 || s.G.dead || s.G.banner > 0) lastEn = Date.now();
      if (Date.now() - lastEn > 9000) await fail(p, tag, 'stuck', 'no enemies for 9 s and no boss');
      // boss reachability
      if (s.boss && s.boss.x < 960) {
        if (!bossSeen) { bossSeen = true; bossT0 = Date.now(); bossHp0 = s.boss.hp; stats.bosses++; if (s.boss.y - s.boss.r > 486 || s.boss.y + s.boss.r < 36) await fail(p, tag, 'boss-unreachable', 'boss y ' + s.boss.y); }
        if (s.boss.x > 800 && Date.now() - bossT0 > 9000) await fail(p, tag, 'boss-unreachable', 'boss stays at x ' + s.boss.x);
        if ((kind === 'boss' || kind === 'bossN') && Date.now() - bossT0 > 20000 && s.boss.hp >= bossHp0) await fail(p, tag, 'boss-unreachable', 'boss hp never dropped in 20 s');
      }
      const d = s.d; if (!d) continue;
      // input
      if (cfg.touch) {
        const [sx, sy] = await ev(p, ([dx, dy]) => window.__bot.scr(dx, dy), [(d.bx - s.P.x) / 1.5 * .7, (d.by - s.P.y) / 1.5 * .7]);
        if (!touching) { fx = cfg.w / 2; fy = cfg.h / 2; await T.down(1, fx, fy); touching = true; }
        else { fx += sx; fy += sy; if (fx < 25 || fx > cfg.w - 25 || fy < 25 || fy > cfg.h - 100) { await T.up(1); touching = false; } else await T.move(1, fx, fy); }
        if (d.dash && Date.now() - (dashN || 0) > 900) { dashN = Date.now(); await T.down(2, ...(await ev(p, () => { const b = document.getElementById('bDash').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; }))); await sleep(30); await T.up(2); }
        if (d.emp) { await T.down(3, ...(await ev(p, () => { const b = document.getElementById('bEmp').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; }))); await sleep(30); await T.up(3); }
      } else {
        const want = { ArrowRight: d.bx - s.P.x > 8, ArrowLeft: d.bx - s.P.x < -8, ArrowDown: d.by - s.P.y > 8, ArrowUp: d.by - s.P.y < -8 };
        for (const k in want) { if (want[k] && !keys[k]) { await p.keyboard.down(k); keys[k] = 1; } else if (!want[k] && keys[k]) { await p.keyboard.up(k); keys[k] = 0; } }
        if (d.dash) await p.keyboard.press('ShiftLeft'); if (d.emp) await p.keyboard.press('KeyX');
      }
      // is the ship following the input? (it must move when the target is far and it is not dashing or dead)
      if (Date.now() - lastMoveCheck > 1500) { const far = Math.hypot(d.bx - s.P.x, d.by - s.P.y) > 90; if (lastPos && far && Math.hypot(s.P.x - lastPos[0], s.P.y - lastPos[1]) < 6 && cfg.touch === !!cdp && touching !== null) stillSince++; else stillSince = 0; lastPos = [s.P.x, s.P.y]; lastMoveCheck = Date.now(); if (stillSince >= 3) await fail(p, tag, 'input-not-responding', 'ship stuck at ' + lastPos.map(Math.round)); }
      await sleep(45);
    }
    // wrap up
    const e = await ev(p, () => ({ fps: window.__mnr.FPS.t ? window.__mnr.FPS.n / window.__mnr.FPS.t * 1000 : 0, slow: window.__mnr.FPS.slow, n: window.__mnr.FPS.n, msgs: window.__mnr.MSGS.slice(), ok: window.__mnr.J.ok, c: window.__mnr.C.best, kills: window.__mnr.G.kills }));
    if (e.n > 120) stats.fps.push(e.fps); stats.perfect += e.ok; stats.kills += e.kills;
    for (const m of e.msgs) if (m.trim().split(/\s+/).length > 8) await fail(p, tag, 'message-too-long', m);
    if (over) {                                           // game-over screen: right numbers, button reachable, restart works
      await sleep(900); const o = await ev(p, () => { const m = window.__mnr, r = window.__bot.probe(); return { bad: r.bad, shown: document.getElementById('oScore').textContent, score: m.G.score, over: !document.getElementById('over').hidden }; });
      if (!o.over) await fail(p, tag, 'game-over', 'overlay not shown'); for (const b of o.bad) await fail(p, tag, 'layout', 'game-over ' + b);
      if (o.shown.replace(/\D/g, '') !== String(o.score)) await fail(p, tag, 'HUD-mismatch', 'game-over score ' + o.shown + ' vs ' + o.score);
      if (i % 3 === 0) { await press(p, cfg, T, '#againBtn'); if (!await waitFor(p, () => window.__mnr.running && window.__mnr.G.t < 1.5 && window.__mnr.G.score === 0, null, 3000)) await fail(p, tag, 'restart', 'FLY AGAIN did not restart'); }
    }
    if (cfg.name === '390x763' && process.env.SHOTS && !seen.has('shot' + kind)) { seen.add('shot' + kind); }
  } catch (err) { await fail(p, tag, 'script', err.message.split('\n')[0]); }
  await p.context().close();
}
// ---------------- explicit input / pause / layout tests ----------------
async function inputTests(browser, cfg) {
  const tag = cfg.name + '/input', { p, T } = await newPage(browser, cfg);
  try {
    if (!await startGame(p, cfg, T)) return fail(p, tag, 'start', 'no start');
    await ev(p, () => { window.__mnr.god = true; }); await sleep(600);
    const st = () => ev(p, () => ({ x: __mnr.P.x, y: __mnr.P.y, cd: __mnr.P.dashCd, dt: __mnr.P.dashT, emp: __mnr.P.emp, pb: __mnr.G.pb.length, shots: __mnr.G.t }));
    let a = await st();
    if (cfg.touch) {
      const cx = cfg.w / 2, cy = cfg.h / 2; await T.down(1, cx, cy); await sleep(80);
      const rot = await ev(p, () => __mnr.rotMode); const mv = async (dx, dy) => { for (let k = 1; k <= 10; k++) { await T.move(1, cx + dx * k / 10, cy + dy * k / 10); await sleep(30); } await sleep(250); };
      await mv(0, 150); let b = await st(); const dir = await ev(p, () => window.__bot.scr(1, 0)); // game +x on screen
      // dragging down on screen moves the ship along +x (rotated) or +y (upright)
      const movedOk = rot ? b.x - a.x > 25 : b.y - a.y > 25; if (!movedOk) await fail(p, tag, 'input-not-responding', 'touch drag down moved ship ' + (b.x - a.x).toFixed(0) + ',' + (b.y - a.y).toFixed(0));
      if (!(await ev(p, () => __mnr.G.pb.length > 0))) await fail(p, tag, 'input-not-responding', 'touch does not fire');
      await T.up(1);
      await T.tap(p, '#bDash'); await sleep(60); b = await st(); if (!(b.cd > 0 || b.dt > 0)) await fail(p, tag, 'input-not-responding', 'DASH button did nothing');
      const e0 = (await st()).emp; await T.tap(p, '#bEmp'); await sleep(80); if ((await st()).emp !== e0 - 1) await fail(p, tag, 'input-not-responding', 'EMP button did nothing');
      await T.tap(p, '#bPause'); if (!await waitFor(p, () => __mnr.paused, null, 1500)) await fail(p, tag, 'pause', 'PAUSE button did nothing');
      const bad = await ev(p, () => window.__bot.probe().bad); for (const x of bad) await fail(p, tag, 'layout', 'pause menu ' + x);
      await T.tap(p, '#resumeBtn'); if (!await waitFor(p, () => !__mnr.paused, null, 1500)) await fail(p, tag, 'resume', 'RESUME button did nothing');
    } else {
      await p.keyboard.down('ArrowRight'); await sleep(450); await p.keyboard.up('ArrowRight'); let b = await st(); if (b.x - a.x < 60) await fail(p, tag, 'input-not-responding', 'ArrowRight moved ' + (b.x - a.x).toFixed(0));
      await p.keyboard.down('KeyS'); await sleep(350); await p.keyboard.up('KeyS'); let c = await st(); if (c.y - b.y < 50) await fail(p, tag, 'input-not-responding', 'S moved ' + (c.y - b.y).toFixed(0));
      await p.keyboard.down('Space'); await sleep(300); if (!(await st()).pb) await fail(p, tag, 'input-not-responding', 'Space does not fire'); await p.keyboard.up('Space');
      await p.keyboard.press('ShiftLeft'); await sleep(60); c = await st(); if (!(c.cd > 0 || c.dt > 0)) await fail(p, tag, 'input-not-responding', 'Shift did nothing');
      const e0 = (await st()).emp; await p.keyboard.press('KeyX'); await sleep(80); if ((await st()).emp !== e0 - 1) await fail(p, tag, 'input-not-responding', 'X (EMP) did nothing');
    }
    if (p.errs.length) await fail(p, tag, 'page-error', p.errs[0]);
  } catch (err) { await fail(p, tag, 'script', err.message.split('\n')[0]); }
  await p.context().close();
}
async function pauseTests(browser, cfg, synth) {
  const tag = cfg.name + '/pause' + (synth ? '-synth' : '-file'), { p, T } = await newPage(browser, cfg, synth ? { query: '?nomusic=1' } : {});
  const key = async k => { await p.keyboard.press(k); };
  try {
    if (!await startGame(p, cfg, T)) return fail(p, tag, 'start', 'no start');
    await ev(p, () => { window.__mnr.god = true; });
    if (synth) await sleep(1500); else if (!await waitFor(p, () => __mnr.BT.mode === 'file' && __mnr.BT.stage === 'stage1' && !__mnr.BT.pend, null, 12000)) return fail(p, tag, 'beat', 'stage1 song never became the beat clock ' + JSON.stringify(await ev(p, () => ({ ...__mnr.BT }))));
    await sleep(800);
    const snap = () => ev(p, () => ({ rev: __mnr.BT.rev, mode: __mnr.BT.mode, t: __mnr.G.t, bp: __mnr.bpos(), a: __mnr.AU.a ? __mnr.AU.a.state : 'none', paused: __mnr.paused, pm: !document.getElementById('pausem').hidden, sc: __mnr.G.scroll, x: __mnr.P.x }));
    for (const how of cfg.touch ? ['button'] : ['KeyP', 'Escape']) {
      const a = await snap(); if (!synth) { const g = await ev(p, () => window.__bot.gridErr()); if (g === null || Math.abs(g) > 30) await fail(p, tag, 'beat', 'before pause the beat clock is ' + g + ' ms off the song'); }
      if (how === 'button') await T.tap(p, '#bPause'); else await key(how);
      if (!await waitFor(p, () => __mnr.paused, null, 1500)) { await fail(p, tag, 'pause', how + ' did not pause'); continue; }
      await sleep(600); const b = await snap(), bad = await ev(p, () => window.__bot.probe().bad);
      for (const x of bad) await fail(p, tag, 'layout', 'pause menu ' + x);
      if (!b.pm) await fail(p, tag, 'pause', 'pause menu not shown');
      if (b.a !== 'suspended') await fail(p, tag, 'pause', 'audio not suspended while paused (' + b.a + ')');
      await sleep(500); const c = await snap(); if (Math.abs(c.t - b.t) > .001 || Math.abs(c.bp - b.bp) > .05 || c.sc !== b.sc) await fail(p, tag, 'pause', `game or beat clock moved while paused: t ${b.t}->${c.t} beat ${b.bp.toFixed(2)}->${c.bp.toFixed(2)}`);
      if (how === 'button') await T.tap(p, '#resumeBtn'); else await key(how);
      if (!await waitFor(p, () => !__mnr.paused, null, 1500)) { await fail(p, tag, 'resume', how + ' did not resume'); continue; }
      await sleep(900); const d = await snap(); if (d.t - c.t < .5) await fail(p, tag, 'resume', 'game time did not advance after resume'); if (d.a !== 'running') await fail(p, tag, 'resume', 'audio not running after resume (' + d.a + ')');
      const adv = d.bp - c.bp; if (d.rev !== c.rev) await fail(p, tag, 'resume', 'beat grid was restarted by pause/resume (rev ' + c.rev + '->' + d.rev + ')'); else if (adv < 0.3 || adv > 5) await fail(p, tag, 'resume', 'beat clock jumped by ' + adv.toFixed(2) + ' beats across pause');
      if (d.pm) await fail(p, tag, 'resume', 'pause menu still shown');
      if (!synth) { await sleep(1500); const g = await ev(p, () => window.__bot.gridErr()); if (g === null || Math.abs(g) > 30) await fail(p, tag, 'resume', 'after resume the beat clock is ' + g + ' ms off the song'); }
    }
    // settings from pause, volume + reduced flashing, back
    if (cfg.touch) await T.tap(p, '#bPause'); else await key('KeyP'); await waitFor(p, () => __mnr.paused, null, 1500);
    await press(p, cfg, T, '#pSetBtn'); await sleep(200);
    let bad = await ev(p, () => window.__bot.probe().bad); for (const x of bad) await fail(p, tag, 'layout', 'settings ' + x);
    await ev(p, () => { const s = document.getElementById('sMusic'); s.value = 35; s.dispatchEvent(new Event('input', { bubbles: true })); const f = document.getElementById('sSfx'); f.value = 20; f.dispatchEvent(new Event('input', { bubbles: true })); const r = document.getElementById('sReduce'); r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); });
    await sleep(300); const set = await ev(p, () => ({ m: __mnr.SET.music, s: __mnr.SET.sfx, r: __mnr.SET.reduce, g: __mnr.AU.musv ? __mnr.AU.musv.gain.value : -1, sg: __mnr.AU.sfxv ? __mnr.AU.sfxv.gain.value : -1, st: JSON.parse(localStorage.getItem('mnr_set') || '{}') }));
    if (Math.abs(set.m - .35) > .01 || Math.abs(set.s - .2) > .01 || !set.r) await fail(p, tag, 'settings', 'values not applied ' + JSON.stringify(set));
    if (!set.st || set.st.music !== .35 || set.st.reduce !== true) await fail(p, tag, 'settings', 'not saved');
    await press(p, cfg, T, '#setBack'); await sleep(200); if (!(await snap()).pm) await fail(p, tag, 'settings', 'Back did not return to the pause menu');
    // restart
    await press(p, cfg, T, '#restartBtn'); if (!await waitFor(p, () => __mnr.running && !__mnr.paused && __mnr.G.t < 1.5 && __mnr.G.score === 0 && __mnr.P.hp === 5, null, 3000)) await fail(p, tag, 'restart', 'RESTART did not give a fresh run');
    await sleep(500); const gn = await ev(p, () => ({ g: __mnr.AU.musv ? __mnr.AU.musv.gain.value : -1, sg: __mnr.AU.sfxv ? __mnr.AU.sfxv.gain.value : -1, st: __mnr.AU.a ? __mnr.AU.a.state : '' }));
    if (gn.g >= 0 && (Math.abs(gn.g - .35) > .05 || Math.abs(gn.sg - .2) > .05)) await fail(p, tag, 'settings', 'audio gain not applied after resume ' + JSON.stringify(gn));
    // tab hidden / window blur pauses and does not resume by itself
    await sleep(800);
    await ev(p, () => { Object.defineProperty(document, 'hidden', { get: () => true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    if (!await waitFor(p, () => __mnr.paused, null, 1000)) await fail(p, tag, 'tab-hide', 'hidden tab did not pause');
    await ev(p, () => { Object.defineProperty(document, 'hidden', { get: () => false, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); }); await sleep(500);
    if (!(await snap()).paused) await fail(p, tag, 'tab-hide', 'game resumed by itself after tab came back'); else {
      await press(p, cfg, T, '#resumeBtn'); await sleep(900); const r = await snap(); if (r.paused || r.a !== 'running') await fail(p, tag, 'tab-hide', 'resume after tab-hide failed ' + JSON.stringify(r));
      if (!synth) { const g = await ev(p, () => window.__bot.gridErr()); if (g === null || Math.abs(g) > 30) await fail(p, tag, 'tab-hide', 'after tab-hide the beat clock is ' + g + ' ms off the song'); } }
    await ev(p, () => window.dispatchEvent(new Event('blur'))); if (!await waitFor(p, () => __mnr.paused, null, 1000)) await fail(p, tag, 'tab-hide', 'window blur did not pause');
    await press(p, cfg, T, '#resumeBtn'); await sleep(300);
    // quit to title and launch again
    if (cfg.touch) await T.tap(p, '#bPause'); else await key('KeyP'); await waitFor(p, () => __mnr.paused, null, 1500);
    await press(p, cfg, T, '#quitBtn'); await sleep(300); const t = await ev(p, () => ({ title: !document.getElementById('title').hidden, run: __mnr.running }));
    if (!t.title || t.run) await fail(p, tag, 'quit', 'TITLE did not return to the title screen'); bad = await ev(p, () => window.__bot.probe().bad); for (const x of bad) await fail(p, tag, 'layout', 'title ' + x);
    if (!await startGame(p, cfg, T)) await fail(p, tag, 'start', 'LAUNCH after TITLE did not start');
    // daily run: same seed gives the same first waves
    await ev(p, () => __mnr.AU && 0); if (p.errs.length) await fail(p, tag, 'page-error', p.errs[0]);
  } catch (err) { await fail(p, tag, 'script', err.message.split('\n')[0]); }
  await p.context().close();
}
async function rotationTest(browser, cfg) {
  const tag = cfg.name + '/rotate', { p, T } = await newPage(browser, cfg);
  try {
    if (!await startGame(p, cfg, T)) return fail(p, tag, 'start', 'no start');
    await ev(p, () => { window.__mnr.god = true; });
    const sizes = [[cfg.h, cfg.w], [cfg.w, cfg.h], [cfg.h, cfg.w], [cfg.w, cfg.h]];
    for (const [w, h] of sizes) {
      await p.setViewportSize({ width: w, height: h }); await p.evaluate(() => window.dispatchEvent(new Event('orientationchange'))); await sleep(700);
      const s = await ev(p, () => window.__bot.probe()); for (const b of s.bad) await fail(p, tag, 'layout', `after rotate to ${w}x${h}: ${b}`);
      const expectRot = cfg.touch && h > w * 1.05; if (s.rot !== expectRot) await fail(p, tag, 'rotation', `${w}x${h} rotMode=${s.rot}, expected ${expectRot}`);
      if (!s.run || s.paused) await fail(p, tag, 'rotation', 'game stopped after rotation');
      const g0 = s.G.t; await sleep(400); const g1 = await ev(p, () => __mnr.G.t); if (g1 - g0 < .2) await fail(p, tag, 'rotation', 'game time frozen after rotation');
      if (cfg.touch) { // finger drag still steers after the rotation
        await ev(p, () => { __mnr.P.x = 480; __mnr.P.y = 270; }); await sleep(100); const a = await ev(p, () => ({ x: __mnr.P.x, y: __mnr.P.y })), cx = w / 2, cy = h / 2; await T.down(1, cx, cy); await sleep(60);
        for (let k = 1; k <= 8; k++) { await T.move(1, cx, cy - 12 * k); await sleep(30); } await sleep(200); await T.up(1);
        const b = await ev(p, () => ({ x: __mnr.P.x, y: __mnr.P.y })); if (Math.hypot(b.x - a.x, b.y - a.y) < 20) await fail(p, tag, 'input-not-responding', `touch steering dead after rotate to ${w}x${h}`);
        const ok = expectRot ? b.x < a.x : b.y < a.y; if (!ok) await fail(p, tag, 'rotation', `drag up steers the wrong way after rotate to ${w}x${h}`);
      }
    }
    if (p.errs.length) await fail(p, tag, 'page-error', p.errs[0]);
  } catch (err) { await fail(p, tag, 'script', err.message.split('\n')[0]); }
  await p.context().close();
}
async function titleTests(browser, cfg) {            // title / game-over / settings screens fit and respond
  const tag = cfg.name + '/title', { p, T } = await newPage(browser, cfg);
  try {
    await sleep(600); let s = await ev(p, () => window.__bot.probe()); for (const b of s.bad) await fail(p, tag, 'layout', 'title ' + b);
    await press(p, cfg, T, '#setBtn'); await sleep(200); s = await ev(p, () => window.__bot.probe()); for (const b of s.bad) await fail(p, tag, 'layout', 'settings ' + b); if (!s.ov.setm) await fail(p, tag, 'settings', 'SETTINGS did not open');
    await press(p, cfg, T, '#setBack'); await sleep(150); if (!(await ev(p, () => !document.getElementById('title').hidden))) await fail(p, tag, 'settings', 'Back did not return to title');
    if (!await startGame(p, cfg, T, 'daily')) await fail(p, tag, 'daily', 'DAILY RUN did not start'); else if (!await ev(p, () => __mnr.G.daily)) await fail(p, tag, 'daily', 'run not flagged daily');
    if (cfg.name === '1280x800') {                       // the daily run deals the same waves every time, whatever the player does
      await ev(p, () => { window.__mnr.god = true; }); await sleep(9000); const one = await ev(p, () => JSON.stringify(__mnr.G.spawns.slice(0, 8)));
      await p.keyboard.press('KeyP'); await press(p, cfg, T, '#restartBtn'); await ev(p, () => { window.__mnr.god = true; }); await sleep(9000); const two = await ev(p, () => JSON.stringify(__mnr.G.spawns.slice(0, 8)));
      if (one !== two || one.length < 20) await fail(p, tag, 'daily', 'daily waves differ between runs ' + one.slice(0, 80) + ' vs ' + two.slice(0, 80));
    }
    if (p.errs.length) await fail(p, tag, 'page-error', p.errs[0]);
  } catch (err) { await fail(p, tag, 'script', err.message.split('\n')[0]); }
  await p.context().close();
}
// ---------------- beat sync with a generated 120 BPM WAV ----------------
function makeWav(bpm, secs, sr = 44100) {
  const n = Math.floor(sr * secs), buf = Buffer.alloc(44 + n * 2); buf.write('RIFF', 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(sr, 24); buf.writeUInt32LE(sr * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(n * 2, 40);
  const spb = 60 / bpm; for (let k = 0; k * spb < secs; k++) { const s0 = Math.round(k * spb * sr), f = k % 4 === 0 ? 1500 : 1000; for (let i = 0; i < sr * .04 && s0 + i < n; i++) { const v = Math.sin(2 * Math.PI * f * i / sr) * Math.exp(-i / (sr * .01)) * .7; buf.writeInt16LE(Math.round(v * 32767), 44 + (s0 + i) * 2); } }
  return buf;
}
async function beatTests(browser) {
  const wav = makeWav(120, 16);
  for (const off of [0, 130]) {                        // second pass: offsetMs shifts the grid
    const tag = 'beat/offset' + off, cfg = CFGS[3];
    const route = async p => {
      await p.route('**/music/tracks.json', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ tracks: [{ file: 'test120.wav', stage: 'stage1', bpm: 120, offsetMs: off, title: 'Test Beat' }, { file: 'nothere.mp3', stage: 'boss', bpm: 140, offsetMs: 0 }] }) }));
      await p.route('**/music/test120.wav', r => r.fulfill({ contentType: 'audio/wav', body: wav }));
    };
    const { p } = await newPage(browser, cfg, { route });
    try {
      // lazy loading: the page is interactive and playing before any track is decoded
      await p.keyboard.press('Enter'); if (!await waitFor(p, () => __mnr.running, null, 3000)) { await fail(p, tag, 'start', 'no start'); continue; }
      await ev(p, () => { window.__mnr.god = true; setInterval(() => { if (!__mnr.G.boss) __mnr.G.dt = 0; }, 400); });   // stay in this district: a boss would swap the song
      if (!await waitFor(p, () => window.__spy.starts.length > 0, null, 8000)) { await fail(p, tag, 'beat', 'test track never started; TR=' + JSON.stringify(await ev(p, () => ({ by: Object.keys(__mnr.TR.by), bad: __mnr.TR.bad, mode: __mnr.BT.mode })))); continue; }
      if (!await waitFor(p, () => __mnr.BT.mode === 'file', null, 5000)) { await fail(p, tag, 'beat', 'game never switched to the loaded file track ' + JSON.stringify(await ev(p, () => ({ ...__mnr.BT })))); continue; }
      await sleep(600);
      const info = await ev(p, () => ({ spy: window.__spy.starts[window.__spy.starts.length - 1], bt: { ...__mnr.BT }, lat: __mnr.AU.a.outputLatency || 0, bpm: __mnr.BT.bpm }));
      if (info.bt.mode !== 'file' || info.bt.bpm !== 120) await fail(p, tag, 'beat', 'game is not on the file track ' + JSON.stringify(info.bt));
      const grid0 = info.spy.when + off / 1000;              // true time of beat 0 on the audio clock (from the real start() call + the offset in tracks.json)
      if (Math.abs(info.bt.t0 + info.bt.off - grid0) > .006) await fail(p, tag, 'beat', `beat clock disagrees with the audio start by ${((info.bt.t0 + info.bt.off - grid0) * 1000).toFixed(1)} ms`);
      // real audio check: tap the file bus with an analyser and find the clicks the speakers would play
      const clicks = await ev(p, async () => {
        const m = window.__mnr, a = m.AU.a, an = a.createAnalyser(); an.fftSize = 256; m.AU.fb.connect(an); const buf = new Float32Array(256), out = []; let prev = 0, until = performance.now() + 8200;
        await new Promise(res => { const iv = setInterval(() => { an.getFloatTimeDomainData(buf); let mx = 0; for (const v of buf) mx = Math.max(mx, Math.abs(v)); if (mx > .25 && prev <= .25) out.push(a.currentTime); prev = mx; if (performance.now() > until) { clearInterval(iv); res(); } }, 1); });
        return out;
      });
      const res = clicks.map(t => { const k = Math.round((t - grid0) / .5); return (t - grid0 - k * .5) * 1000; });
      const med = res.slice().sort((x, y) => x - y)[Math.floor(res.length / 2)];
      console.log(`  beat/offset${off}: ${clicks.length} clicks heard, median offset from the game's beat grid ${med && med.toFixed(1)} ms, spread ${res.length ? (Math.max(...res) - Math.min(...res)).toFixed(1) : '-'} ms`);
      if (clicks.length < 6) await fail(p, tag, 'beat', 'heard only ' + clicks.length + ' clicks'); else if (off === 0 && Math.abs(med) > 25) await fail(p, tag, 'beat', 'audio clicks are ' + med.toFixed(1) + ' ms from the beat grid');
      // judging: press at known offsets from the true beat; within +-80 ms must be PERFECT, beyond must not
      const kinds = [['ShiftLeft', 'dash'], ['KeyJ', 'fire']];
      const sample = async (code, kind, delta) => {
        const r = await ev(p, async ([code, delta, grid0, kind]) => {
          const m = window.__mnr, a = m.AU.a, lat = a.outputLatency || 0; const nowT = a.currentTime - lat; let k = Math.ceil((nowT - grid0) / .5) + 2; const target = grid0 + k * .5 + delta / 1000;   // audible time we want
          if (kind === 'dash') { m.P.dashCd = 0; m.P.dashT = 0; }
          await new Promise(res => { const iv = setInterval(() => { if (a.currentTime - lat >= target) { clearInterval(iv); res(); } }, 1); });
          const lag = (a.currentTime - lat - target) * 1000;       // how late the page really is at this instant (poll + frame jitter)
          window.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true })); window.dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true }));
          await new Promise(res => setTimeout(res, 120)); const J = m.J.last;
          return { J, lag };
        }, [code, delta, grid0, kind]);
        await sleep(1100);
        const j = r.J, expected = delta + r.lag; if (!j || j.kind !== kind) return 'not judged ' + JSON.stringify(j);
        if (Math.abs(j.dt - expected) > 20) return `pressed ${expected.toFixed(0)} ms from the true beat, game measured ${j.dt} ms`;
        if (Math.abs(Math.abs(expected) - 80) > 12 && j.ok !== (Math.abs(expected) <= 80)) return `${expected.toFixed(0)} ms from the beat gave ok=${j.ok}`;
        return '';
      };
      for (const [code, kind] of kinds) for (const delta of [0, 40, -40, 70, -70, 120, -120, 200]) {
        let bad = await sample(code, kind, delta); if (bad) bad = await sample(code, kind, delta);   // one retry: the page can stall for a frame
        stats.judged = (stats.judged || 0) + 1; if (bad) await fail(p, tag, 'beat-judge', kind + ': ' + bad);
      }
      // the grid moves with offsetMs: the game's own beat position at the true beat time is an integer
      const frac = await ev(p, ([grid0]) => { const m = window.__mnr, a = m.AU.a, lat = a.outputLatency || 0; const tNow = a.currentTime - lat, p = m.bpos(), want = (tNow - grid0) / .5; return p - want; }, [grid0]);
      if (Math.abs(frac) > .08) await fail(p, tag, 'beat', 'bpos differs from the true beat position by ' + frac.toFixed(3) + ' beats');
      if (p.errs.length) await fail(p, tag, 'audio', p.errs[0]);
    } catch (err) { await fail(p, tag, 'script', err.message.split('\n')[0]); }
    await p.context().close();
  }
}
async function synthFallbackTests(browser) {           // ?nomusic=1 (no song files): the synth plays at each stage's tempo and everything pulses on the beat
  const tag = 'synth', cfg = CFGS[3], { p } = await newPage(browser, cfg, { query: '?nomusic=1' });
  try {
    await p.keyboard.press('Enter'); await waitFor(p, () => __mnr.running, null, 3000); await ev(p, () => { window.__mnr.god = true; });
    const exp = [[0, 'stage1', 120], [1, 'stage2', 128]]; await sleep(1200);
    // add-on hook API: events fire, setRate keeps the beat position continuous and scales the beat length
    const nr = await ev(p, async () => { const N = window.NR, got = {}; for (const e of ['beat', 'bar']) N.on(e, () => { got[e] = (got[e] || 0) + 1; }); const b0 = __mnr.bpos(), s0 = __mnr.BT.spb; N.music.setRate(1.25); const b1 = __mnr.bpos(), s1 = __mnr.BT.spb; await new Promise(r => setTimeout(r, 2500)); const r = { jump: b1 - b0, ratio: s0 / s1, got, beats: __mnr.bpos() - b1 }; N.music.setRate(1); return r; });
    if (Math.abs(nr.jump) > .15 || Math.abs(nr.ratio - 1.25) > .001 || !nr.got.beat || nr.got.beat < 3 || !nr.got.bar) await fail(p, tag, 'hook', 'NR hook API ' + JSON.stringify(nr));
    for (const [i, st, bpm] of exp) { await ev(p, i => window.__mnr.skipTo(i), i); await sleep(900); const b = await ev(p, () => ({ ...__mnr.BT })); if (b.mode !== 'synth' || b.stage !== st || b.bpm !== bpm) await fail(p, tag, 'beat', `stage ${st}: ${JSON.stringify(b)}`); }
    await ev(p, () => window.__mnr.bossNow()); await sleep(1500); let b = await ev(p, () => ({ ...__mnr.BT })); if (b.mode !== 'synth' || b.stage !== 'boss' || b.bpm !== 140) await fail(p, tag, 'beat', 'boss music ' + JSON.stringify(b));
    // boss phases on bar 16 and 32 (64 and 128 beats): step the beat counter cheaply by checking the rule on the live boss
    const rule = await ev(p, () => { const f = bt => { const bar = Math.floor(bt / 4); return bar >= 32 ? 3 : bar >= 16 ? 2 : 1; }; return [f(63), f(64), f(127), f(128)]; });
    if (rule.join() !== '1,2,2,3') await fail(p, tag, 'beat', 'phase rule ' + rule.join());
    // the boss really enters phase 2 and 3 as beats pass (fast-forward the boss beat counter, then let one real beat come)
    for (const [bt, want] of [[63, 2], [127, 3]]) { await ev(p, bt => { const e = window.__mnr.G.boss; if (e) e.bt = bt; }, bt); await sleep(1300); const q = await ev(p, () => { const e = window.__mnr.G.boss; return e ? e.ph : -1; }); if (q !== want) await fail(p, tag, 'boss-phase', `boss.bt=${bt} -> phase ${q}, wanted ${want}`); }
    if (p.errs.length) await fail(p, tag, 'page-error', p.errs[0]);
  } catch (err) { await fail(p, tag, 'script', err.message.split('\n')[0]); }
  await p.context().close();
}

// ---------------- the real songs: grid vs audio, clock vs file position, PERFECT judging, pause phase, spawn timing ----------------
async function songTests(browser, stageName, si) {
  const tag = 'song/' + stageName, cfg = CFGS[3], { p } = await newPage(browser, cfg);
  try {
    const info = await ev(p, async st => { const r = await fetch('music/tracks.json'); const j = await r.json(); return j.tracks.find(t => t.stage === st) || null; }, stageName);
    if (!info) return;                                       // no file for this stage
    await p.keyboard.press('Enter'); if (!await waitFor(p, () => __mnr.running, null, 3000)) return fail(p, tag, 'start', 'no start');
    await ev(p, () => { window.__mnr.god = true; });
    if (si > 0) await ev(p, i => window.__mnr.skipTo(i), si);
    if (!await waitFor(p, st => __mnr.BT.mode === 'file' && __mnr.BT.stage === st && !__mnr.BT.pend, stageName, 20000)) return fail(p, tag, 'beat', 'song never became the beat clock ' + JSON.stringify(await ev(p, () => ({ ...__mnr.BT, TR: Object.keys(__mnr.TR.bufs), bad: __mnr.TR.bad }))));
    await sleep(500);
    const bt = await ev(p, () => ({ ...__mnr.BT })); if (bt.bpm !== info.bpm || Math.abs(bt.off * 1000 - info.offsetMs) > .5) await fail(p, tag, 'beat', 'game uses ' + bt.bpm + '/' + bt.off + ' not tracks.json ' + info.bpm + '/' + info.offsetMs);
    // 1) onsets in the decoded audio vs the grid: best offset within +-40 ms of tracks.json, and the grid beats are the strong ones
    const on = await ev(p, () => {
      const m = window.__mnr, buf = m.TR.bufs[m.TR.by[m.BT.stage].file], sr = buf.sampleRate, ch = buf.getChannelData(0), HOP = Math.round(sr * .005), n = Math.floor(Math.min(buf.length, sr * 30) / HOP);
      let a = 0, b = 0, prev = 0; const e = [];
      for (let i = 0; i < n; i++) { let s = 0; for (let k = 0; k < HOP; k++) { const v = ch[i * HOP + k]; a += .3 * (v - a); b += .01 * (a - b); const h = a - b; s += h * h; } const r = Math.sqrt(s / HOP); e.push(Math.max(0, r - prev)); prev = r; }
      const mean = e.reduce((x, y) => x + y, 0) / e.length, o = e.map(v => Math.max(0, v - mean)), spb = m.BT.spb / (HOP / sr);
      const score = off => { let s = 0, c = 0; for (let k = 0; ; k++) { const i = Math.round(off / (HOP / sr) + k * spb); if (i >= o.length - 2) break; s += Math.max(o[i - 1] || 0, o[i], o[i + 1]); c++; } return s / c; };
      const base = m.BT.off; let best = base, bs = -1; for (let d = -.12; d <= .12; d += .002) { const s = score(base + d); if (s > bs) { bs = s; best = base + d; } }
      return { best: (best - base) * 1000, atGrid: score(base), best_s: bs, offBeat: score(base + m.BT.spb / 2) };
    });
    console.log(`  ${tag}: ${bt.bpm} bpm, onset-best offset ${on.best.toFixed(0)} ms from the game grid, grid strength ${on.atGrid.toFixed(4)} vs off-beat ${on.offBeat.toFixed(4)}`);
    if (Math.abs(on.best) > 40) await fail(p, tag, 'grid', `audio onsets sit ${on.best.toFixed(0)} ms from the game's beat grid (tempo/offset in tracks.json is off)`);
    // 2) beat clock vs the file position over 20 s
    let worst = 0, over = 0; const stay = () => ev(p, () => { __mnr.G.dt = 0; __mnr.G.boss = null; });   // keep the test inside this district (a boss would switch to synth)
    await ev(p, () => { __mnr.G.dt = 0; __mnr.G.spawnB.length = 0; });
    for (let k = 0; k < 10; k++) { await sleep(2000); const g = await ev(p, () => window.__bot.gridErr()); if (g === null) { await fail(p, tag, 'beat', 'left file mode during the 20 s'); break; } const ab = Math.abs(g); worst = Math.max(worst, ab); if (ab > 30) over++; }
    const sb = await ev(p, () => ({ b: window.__mnr.G.spawnB.slice(), spb: window.__mnr.BT.spb })); await stay();
    console.log(`  ${tag}: beat clock vs file position over 20 s: worst ${worst.toFixed(1)} ms`);
    if (over > 2)   // a stalled page on a loaded machine can spoil one or two samples; sustained drift cannot
       await fail(p, tag, 'beat', 'beat clock drifts ' + worst.toFixed(1) + ' ms from the file position');
    // 3) PERFECT on the beat, not 200 ms off; and after pause/resume
    const sp = await ev(p, () => ({ ...window.__spy.starts[window.__spy.starts.length - 1] })), spb = 60 / info.bpm, grid0 = sp.when + info.offsetMs / 1000;
    const sample = async (code, kind, delta) => {
      const r = await ev(p, async ([code, delta, grid0, kind, spb]) => {
        const m = window.__mnr, a = m.AU.a, lat = a.outputLatency || 0, nowT = a.currentTime - lat, k = Math.ceil((nowT - grid0) / spb) + 2, target = grid0 + k * spb + delta / 1000;
        if (kind === 'dash') { m.P.dashCd = 0; m.P.dashT = 0; }
        await new Promise(res => { const iv = setInterval(() => { if (a.currentTime - lat >= target) { clearInterval(iv); res(); } }, 1); });
        const lag = (a.currentTime - lat - target) * 1000;
        window.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true })); window.dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true }));
        await new Promise(res => setTimeout(res, 120)); return { J: m.J.last, lag };
      }, [code, delta, grid0, kind, spb]);
      await sleep(1000); const j = r.J, expected = delta + r.lag; if (!j || j.kind !== kind) return 'not judged ' + JSON.stringify(j);
      if (Math.abs(j.dt - expected) > 25) return `pressed ${expected.toFixed(0)} ms from the true beat, game measured ${j.dt} ms`;
      if (Math.abs(Math.abs(expected) - 80) > 15 && j.ok !== (Math.abs(expected) <= 80)) return `${expected.toFixed(0)} ms from the beat gave ok=${j.ok}`; return '';
    };
    const judge = async label => { for (const [code, kind] of [['ShiftLeft', 'dash'], ['KeyJ', 'fire']]) for (const delta of [0, 200]) { let bad = await sample(code, kind, delta); if (bad) bad = await sample(code, kind, delta); stats.judged = (stats.judged || 0) + 1; if (bad) await fail(p, tag, 'beat-judge', label + ' ' + kind + ' ' + delta + ': ' + bad); } };
    await stay(); await judge('playing');
    await p.keyboard.press('KeyP'); await waitFor(p, () => __mnr.paused, null, 1500); await sleep(1500); await p.keyboard.press('KeyP'); await waitFor(p, () => !__mnr.paused, null, 1500); await sleep(1800);   // the output-clock smoothing needs ~1.5 s of history after a resume
    await stay(); const gp = await ev(p, () => window.__bot.gridErr()); if (gp === null || Math.abs(gp) > 30) await fail(p, tag, 'resume', 'after pause/resume the beat clock is ' + gp + ' ms off the song');
    await stay(); await judge('after pause');
    // 4) spawn times (collected during the 20 s above) land on the beat (+-1 frame)
    const offs = sb.b.map(x => Math.abs(x - Math.round(x)) * sb.spb * 1000);
    console.log(`  ${tag}: ${offs.length} enemies spawned, worst distance from a beat ${offs.length ? Math.max(...offs).toFixed(0) : '-'} ms`);
    if (offs.some(o => o > 45)) await fail(p, tag, 'spawn', 'an enemy spawned ' + Math.max(...offs).toFixed(0) + ' ms from a beat');
    if (p.errs.length) await fail(p, tag, 'page-error', p.errs[0]);
  } catch (err) { await fail(p, tag, 'script', err.message.split('\n')[0]); }
  await p.context().close();
}
// ---------------- iOS audio: context starts suspended, only a touchend/click gesture may resume it ----------------
const IOS_INIT = () => {
  const AC = window.AudioContext; let gest = false; const E = window.__emu = { ctxs: 0, resumeBlocked: 0, resumeOk: 0, silentStarts: 0, edges: new Map(), oscs: 0 };
  for (const t of ['touchend', 'click', 'keydown']) addEventListener(t, () => { gest = true; setTimeout(() => { gest = false; }, 0); }, true);   // iOS only honours these as unlocking gestures
  window.AudioContext = class extends AC { constructor() { super(); E.ctxs++; try { super.suspend(); } catch (e) { } } resume() { if (!gest) { E.resumeBlocked++; return new Promise(() => { }); } E.resumeOk++; return super.resume(); } };
  const oc = AudioNode.prototype.connect; AudioNode.prototype.connect = function (d) { if (!E.edges.has(this)) E.edges.set(this, []); E.edges.get(this).push(d); return oc.apply(this, arguments); };
  const os = AudioBufferSourceNode.prototype.start; AudioBufferSourceNode.prototype.start = function () { if (gest && this.buffer && this.buffer.length <= 2) E.silentStarts++; return os.apply(this, arguments); };
  const co = AudioContext.prototype.createOscillator; AudioContext.prototype.createOscillator = function () { E.oscs++; return co.apply(this, arguments); };
  Object.defineProperty(navigator, 'audioSession', { value: { type: 'auto' }, configurable: true });
};
async function iosTests(browser) {
  const tag = 'ios-audio', cfg = CFGS[0], { p, T } = await newPage(browser, cfg, { init: IOS_INIT });
  try {
    await sleep(300); const s0 = await ev(p, () => ({ a: __mnr.AU.a ? __mnr.AU.a.state : 'none', as: navigator.audioSession.type }));
    if (s0.as !== 'playback') await fail(p, tag, 'ios', 'navigator.audioSession.type is ' + s0.as + ' (the silent switch would mute the game)');
    await T.tap(p, '#startBtn');
    if (!await waitFor(p, () => __mnr.AU.a && __mnr.AU.a.state === 'running', null, 2000)) await fail(p, tag, 'ios', 'audio context is not running after the first tap: ' + JSON.stringify(await ev(p, () => ({ st: __mnr.AU.a && __mnr.AU.a.state, ...window.__emu, edges: 0 }))));
    const e1 = await ev(p, () => ({ ok: window.__emu.resumeOk, blocked: window.__emu.resumeBlocked, sil: window.__emu.silentStarts }));
    if (e1.ok < 1) await fail(p, tag, 'ios', 'resume() was never called inside the gesture'); if (e1.sil < 1) await fail(p, tag, 'ios', 'no silent buffer started inside the gesture');
    await sleep(1200);
    const g = await ev(p, () => {                          // every audio source reaches the speakers
      const E = window.__emu, A = __mnr.AU, dest = A.a.destination, reach = (n, seen = new Set()) => { if (n === dest) return true; if (seen.has(n)) return false; seen.add(n); return (E.edges.get(n) || []).some(d => reach(d, seen)); };
      return { mus: reach(A.mus), fb: reach(A.fb), fx: reach(A.fx), oscs: E.oscs, state: A.a.state };
    });
    if (!g.mus || !g.fb || !g.fx) await fail(p, tag, 'ios', 'audio bus not connected to the destination ' + JSON.stringify(g)); if (g.oscs < 3) await fail(p, tag, 'ios', 'synth/effects produced no audio nodes after the tap');
    // iOS interrupts the context (call, tab switch): not resumable without a gesture, resumes on the next tap
    await ev(p, () => { window.__emu.resumeBlocked = 0; return __mnr.AU.a.suspend(); }); await sleep(800);
    const mid = await ev(p, () => ({ st: __mnr.AU.a.state, paused: __mnr.paused })); if (mid.st === 'running') await fail(p, tag, 'ios', 'could not interrupt the emulated context');
    if (!mid.paused) { const [cx, cy] = [cfg.w / 2, cfg.h / 2]; await T.tapAt(cx, cy); if (!await waitFor(p, () => __mnr.AU.a.state === 'running', null, 1500)) await fail(p, tag, 'ios', 'a later tap did not bring the audio back after an interruption'); }
    if (p.errs.length) await fail(p, tag, 'page-error', p.errs[0]);
  } catch (err) { await fail(p, tag, 'script', err.message.split('\n')[0]); }
  await p.context().close();
}
async function webkitTests() {
  const tag = 'webkit-audio'; let wk; try { wk = await PW.webkit.launch(); } catch (e) { console.log('  webkit not available, skipped (' + String(e.message).split('\n')[0] + ')'); return; }
  try {
    const ctx = await wk.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true }), p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); await p.goto(URL_BASE + 'index.html'); await p.waitForFunction(() => window.__mnr, null, { timeout: 15000 });
    await p.tap('#startBtn'); await sleep(1500);
    const r = await p.evaluate(() => ({ run: __mnr.running, st: __mnr.AU.a ? __mnr.AU.a.state : 'none', mode: __mnr.BT.mode, bufs: Object.keys(__mnr.TR.bufs).length, bad: Object.keys(__mnr.TR.bad).length }));
    console.log('  webkit: ' + JSON.stringify(r));
    if (!r.run) await fail(null, tag, 'webkit', 'game did not start'); else if (r.st !== 'running') await fail(null, tag, 'webkit', 'audio context state ' + r.st + ' after the first tap');
    if (errs.length) await fail(null, tag, 'webkit', 'page error ' + errs[0]);
  } catch (err) { await fail(null, tag, 'script', err.message.split('\n')[0]); }
  await wk.close();
}

// ---------------- music power-ups: each triggers and ends on time (in bars), tempo changes keep the beat clock aligned, particles stay under the cap ----------------
const TRACKS_ROUTE = wav => async p => {
  await p.route('**/music/tracks.json', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ tracks: [{ file: 'test120.wav', stage: 'stage1', bpm: 120, offsetMs: 0, title: 'Test Beat' }, { file: 'nothere.mp3', stage: 'boss', bpm: 140, offsetMs: 0 }] }) }));
  await p.route('**/music/test120.wav', r => r.fulfill({ contentType: 'audio/wav', body: wav }));
};
async function powerTests(browser, synth) {
  const tag = 'power/' + (synth ? 'synth' : 'file'), cfg = CFGS[0], wav = makeWav(120, 16);
  const { p, T } = await newPage(browser, cfg, synth ? { query: '?nomusic=1', pw: true } : { route: TRACKS_ROUTE(wav), pw: true });
  let maxPt = 0; const samplePt = async () => { const n = await ev(p, () => __mnr.G.pt.length); maxPt = Math.max(maxPt, n); };
  try {
    await T.tap(p, '#startBtn'); if (!await waitFor(p, () => __mnr.running, null, 4000)) return fail(p, tag, 'start', 'no start');
    await ev(p, () => {
      const m = window.__mnr; m.god = true; setInterval(() => { if (!m.G.boss) m.G.dt = 0; }, 400);   // stay in this district: a boss would swap the song
      m.PW.st().cnt = 1e9;                                  // no glowing enemies: only the power-ups this test hands out
      window.__pw = { blasts: [], kicks: [] }; let last = 0; m.NR.on('tick', () => { if (m.PW.stat.blast !== last) { last = m.PW.stat.blast; window.__pw.blasts.push({ b: m.bpos(), eb: m.G.eb.length, bc: m.G.bc }); } });
      const o = m.AU.osc; m.AU.osc = function (t, type, f) { if (type === 'sine' && f === 150) window.__pw.kicks.push(t); return o.apply(this, arguments); };   // base synth kick, to see where the synth plays
    });
    if (synth) await sleep(1500); else if (!await waitFor(p, () => __mnr.BT.mode === 'file' && __mnr.BT.stage === 'stage1' && !__mnr.BT.pend, null, 12000)) return fail(p, tag, 'beat', 'test song never became the beat clock');
    await sleep(500);
    const base = await ev(p, () => ({ bpm: 60 / __mnr.BT.spb, spb: __mnr.BT.spb }));
    if (!(base.bpm > 100 && base.bpm < 140)) await fail(p, tag, 'power', 'unexpected base bpm ' + base.bpm);
    const collect = (k, on) => ev(p, async ([k, on]) => {        // push the pickup onto the ship exactly on the beat (on) or half a beat away (off)
      const m = window.__mnr, f = () => ((m.bpos() % 1) + 1) % 1; const t0 = performance.now();
      while (performance.now() - t0 < 3000 && (on ? !(f() > .955 && f() < .99) : !(f() > .45 && f() < .55))) await new Promise(r => setTimeout(r, 3));
      const n0 = m.PW.stat.given; m.G.pk.push({ t: 'pw', k, x: m.P.x + 2, y: m.P.y, vx: 0, vy: 0, bob: 0 });
      for (let i = 0; i < 40 && m.PW.stat.given === n0; i++) await new Promise(r => setTimeout(r, 16));
      return { given: m.PW.stat.given - n0, bc: m.G.bc };
    }, [k, on]);
    // click detector on the file bus: ms the audible clicks are off the game's current beat grid
    const gridErr = async secs => {
      if (synth) {                                          // synth: where did the kicks get scheduled relative to the grid
        const r = await ev(p, secs => new Promise(res => { const m = window.__mnr, w = window.__pw; w.kicks.length = 0; setTimeout(() => { const b = m.BT; res(w.kicks.map(t => { const x = (t - b.t0 - b.off) / b.spb; return (x - Math.round(x)) * b.spb * 1000; })); }, secs * 1000); }), secs);
        return r;
      }
      return ev(p, async secs => {
        const m = window.__mnr, a = m.AU.a, an = a.createAnalyser(); an.fftSize = 256; m.AU.fb.connect(an); const buf = new Float32Array(256), out = []; let prev = 0; const until = performance.now() + secs * 1000;
        await new Promise(res => { const iv = setInterval(() => { an.getFloatTimeDomainData(buf); let mx = 0; for (const v of buf) mx = Math.max(mx, Math.abs(v)); if (mx > .25 && prev <= .25) out.push(a.currentTime); prev = mx; if (performance.now() > until) { clearInterval(iv); res(); } }, 1); });
        m.AU.fb.disconnect(an); const b = m.BT; return out.map(t => { const x = (t - b.t0 - b.off) / b.spb; return (x - Math.round(x)) * b.spb * 1000; });
      }, secs);
    };
    const checkAlign = async (what, secs) => {
      const e = await gridErr(secs); await samplePt();
      if (e.length < 4) { await fail(p, tag, 'beat', what + ': only ' + e.length + ' audio events heard'); return; }
      const worst = Math.max(...e.map(Math.abs)); console.log(`  ${tag} ${what}: ${e.length} events, worst ${worst.toFixed(1)} ms off the beat grid`);
      if (worst > 40) await fail(p, tag, 'beat', `${what}: audio is ${worst.toFixed(1)} ms off the beat clock (limit 40); offsets ${e.map(x => Math.round(x)).join(',')} bt ${JSON.stringify(await ev(p, () => ({ rate: __mnr.NR.music.rate, spb: __mnr.BT.spb, rev: __mnr.BT.rev, mode: __mnr.BT.mode })))}`);
    };
    const waitEnd = async (k, maxS) => { const t0 = Date.now(); while (Date.now() - t0 < maxS * 1000) { await samplePt(); if (!await ev(p, k => __mnr.PW.on(k), k)) return true; await sleep(100); } return false; };
    const lastLog = k => ev(p, k => { const l = __mnr.PW.log.filter(x => x.k === k); return l[l.length - 1] || null; }, k);
    const timing = async (k, wantD, log) => {
      if (!log) return fail(p, tag, 'power', k + ' never ended');
      if (log.d !== wantD) await fail(p, tag, 'power', `${k}: planned ${log.d} beats, wanted ${wantD}`);
      if (log.beats < wantD - .01 || log.beats > wantD + .7) await fail(p, tag, 'power', `${k} lasted ${log.beats.toFixed(2)} beats, wanted ${wantD} (${wantD / 4} bars)`);
      const wall = wantD * log.spb * 1000; if (Math.abs(log.ms - wall) > 600) await fail(p, tag, 'power', `${k} lasted ${log.ms.toFixed(0)} ms, ${wantD} beats should be ${wall.toFixed(0)} ms`);
    };

    // 1) DRUM BURST, collected on the beat: 8 bars +50% = 12 bars, auto-shot on every beat, on-beat presses fire double, drum layer plays
    let c = await collect('drum', true); if (c.given !== 1) await fail(p, tag, 'power', 'DRUM BURST pickup was not collected');
    const d0 = await ev(p, () => ({ auto: __mnr.PW.stat.auto, d: __mnr.G.pw.act.find(a => a.k === 'drum') }));
    if (!d0.d || d0.d.d !== 48 || !d0.d.ob) await fail(p, tag, 'power', 'on-beat DRUM BURST should last 48 beats, got ' + JSON.stringify(d0.d));
    await ev(p, () => { window.__pw.drumKicks = 0; const o = __mnr.AU.osc; __mnr.AU.osc = function (t, type, f) { if (type === 'sine' && f === 165) window.__pw.drumKicks++; return o.apply(this, arguments); }; });
    const dbl = await ev(p, async () => { const m = window.__mnr; window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', bubbles: true })); const iv = setInterval(() => { m.P.pfT = m.G.t; }, 30); await new Promise(r => setTimeout(r, 450)); clearInterval(iv); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', bubbles: true })); return m.PW.stat.dbl; });
    if (!(dbl > 0)) await fail(p, tag, 'power', 'on-beat presses did not fire double during DRUM BURST');
    await sleep(4000); await samplePt();
    const d1 = await ev(p, () => ({ auto: __mnr.PW.stat.auto, kicks: window.__pw.drumKicks, bc: __mnr.G.bc }));
    const beats = d1.bc - c.bc; if (d1.auto - d0.auto < beats - 3) await fail(p, tag, 'power', `DRUM BURST auto-fired ${d1.auto - d0.auto} times in ${beats} beats`);
    if (!synth || true) { const au = await ev(p, () => __mnr.AU.a && __mnr.AU.a.state); if (au === 'running' && d1.kicks < beats - 4) await fail(p, tag, 'power', `drum layer played ${d1.kicks} kicks in ${beats} beats`); }
    if (!await waitEnd('drum', 30)) await fail(p, tag, 'power', 'DRUM BURST did not end within 30 s');
    await timing('drum', 48, await lastLog('drum'));
    if (await ev(p, () => __mnr.G.pw.act.length)) await fail(p, tag, 'power', 'power-ups still active after DRUM BURST ended');

    // 2) TEMPO UP, collected off the beat: 8 bars, music x1.25, score x2, beat clock stays aligned while the speed changes and when it ends
    c = await collect('tempo', false); await sleep(2200);
    let st = await ev(p, () => ({ rate: __mnr.NR.music.rate, bpm: 60 / __mnr.BT.spb, pr: __mnr.AU.cur && __mnr.AU.cur.src ? __mnr.AU.cur.src.playbackRate.value : null, d: (__mnr.G.pw.act.find(a => a.k === 'tempo') || {}).d, bc: __mnr.G.bc }));
    if (st.rate !== 1.25 || Math.abs(st.bpm - base.bpm * 1.25) > .01) await fail(p, tag, 'power', `TEMPO UP: rate ${st.rate} bpm ${st.bpm}, wanted x1.25 of ${base.bpm}`);
    if (!synth && Math.abs(st.pr - 1.25) > .001) await fail(p, tag, 'power', 'TEMPO UP: the song source plays at ' + st.pr);
    if (st.d !== 32) await fail(p, tag, 'power', 'off-beat TEMPO UP should last 32 beats, got ' + st.d);
    const sc = await ev(p, async () => { const m = window.__mnr, a = m.G.score; m.G.score += 100; await new Promise(r => setTimeout(r, 120)); return m.G.score - a; });
    if (sc < 200) await fail(p, tag, 'power', 'TEMPO UP: +100 points counted as ' + sc + ' (score x2)');
    await checkAlign('tempo x1.25', 3.5);
    if (!await waitEnd('tempo', 30)) await fail(p, tag, 'power', 'TEMPO UP did not end within 30 s');
    await timing('tempo', 32, await lastLog('tempo'));
    await sleep(1500); st = await ev(p, () => ({ rate: __mnr.NR.music.rate, bpm: 60 / __mnr.BT.spb, pr: __mnr.AU.cur && __mnr.AU.cur.src ? __mnr.AU.cur.src.playbackRate.value : null }));
    if (st.rate !== 1 || Math.abs(st.bpm - base.bpm) > .01 || (!synth && Math.abs(st.pr - 1) > .001)) await fail(p, tag, 'power', 'after TEMPO UP the music did not return to normal speed ' + JSON.stringify(st));
    await checkAlign('after tempo ends', 3.5);

    // 3) SLOW GROOVE, off the beat: music x0.75, enemy bullets slower (also the ones already flying), all back to normal at the end
    await ev(p, () => { __mnr.eb(900, 40, Math.PI / 2, 1); __mnr.G.eb[__mnr.G.eb.length - 1].tag = 1; });   // a bullet that crawls at speed 1: it is still flying when the power-up ends
    const sp = () => ev(p, () => { const b = __mnr.G.eb.find(b => b.tag); return b ? Math.hypot(b.vx, b.vy) : -1; });
    const sp0 = await sp(); c = await collect('slow', false); await sleep(1500);
    st = await ev(p, () => ({ rate: __mnr.NR.music.rate, bpm: 60 / __mnr.BT.spb, pr: __mnr.AU.cur && __mnr.AU.cur.src ? __mnr.AU.cur.src.playbackRate.value : null, d: (__mnr.G.pw.act.find(a => a.k === 'slow') || {}).d }));
    if (st.rate !== .75 || Math.abs(st.bpm - base.bpm * .75) > .01) await fail(p, tag, 'power', `SLOW GROOVE: rate ${st.rate} bpm ${st.bpm}, wanted x0.75 of ${base.bpm}`);
    if (!synth && Math.abs(st.pr - .75) > .001) await fail(p, tag, 'power', 'SLOW GROOVE: the song source plays at ' + st.pr);
    const nb = await ev(p, () => { const n = __mnr.G.eb.length; __mnr.eb(900, 40, Math.PI / 2, 100); const b = __mnr.G.eb[__mnr.G.eb.length - 1]; return Math.hypot(b.vx, b.vy); });
    if (Math.abs(nb - 60) > .5) await fail(p, tag, 'power', 'SLOW GROOVE: a new enemy bullet of speed 100 flies at ' + nb.toFixed(1) + ' (want 60)');
    if (sp0 > 0 && Math.abs((await sp()) - sp0 * .6) > .05) await fail(p, tag, 'power', 'SLOW GROOVE did not slow a bullet that was already flying');
    await checkAlign('tempo x0.75', 3.5);
    if (!await waitEnd('slow', 40)) await fail(p, tag, 'power', 'SLOW GROOVE did not end within 40 s');
    await timing('slow', 32, await lastLog('slow'));
    const back = await ev(p, () => ({ bs: __mnr.PW.bs, bad: __mnr.G.eb.filter(b => b.sl).length, rate: __mnr.NR.music.rate }));
    if (back.bs !== 1 || back.bad) await fail(p, tag, 'power', 'bullets stay slowed after SLOW GROOVE ended ' + JSON.stringify(back));
    await sleep(1500); await checkAlign('after slow ends', 3);

    // 4) DROP: the music cuts for one bar, then a blast on the next downbeat clears the bullets
    await ev(p, () => { for (let i = 0; i < 6; i++) __mnr.eb(300 + i * 40, 480, Math.PI / 2, 1); window.__pw.blasts.length = 0; window.__pw.t0 = performance.now(); });
    c = await collect('drop', false);
    const cutSeen = await ev(p, async () => { const m = window.__mnr, g = m.AU.cutg && m.AU.cutg.gain; let cut0 = 0, cut1 = 0; const t0 = performance.now();
      while (performance.now() - t0 < 14000 && !(window.__pw.blasts.length && g && g.value > .9)) { if (g && g.value < .05) { if (!cut0) cut0 = performance.now(); cut1 = performance.now(); } await new Promise(r => setTimeout(r, 15)); }
      return { cut0, cut1, blasts: window.__pw.blasts, drop: !!m.G.pw.drop, gain: g ? g.value : null, aud: m.AU.a ? m.AU.a.state : 'none' }; });
    if (cutSeen.blasts.length !== 1) await fail(p, tag, 'power', 'DROP fired ' + cutSeen.blasts.length + ' blasts');
    else { const b = cutSeen.blasts[0], m4 = ((b.b % 4) + 4) % 4; if (Math.min(m4, 4 - m4) > .2) await fail(p, tag, 'power', 'DROP blast is not on a downbeat (beat ' + b.b.toFixed(2) + ')'); if (b.eb !== 0) await fail(p, tag, 'power', 'DROP blast left ' + b.eb + ' enemy bullets'); }
    if (cutSeen.aud === 'running') { const len = cutSeen.cut0 ? (cutSeen.cut1 - cutSeen.cut0) / 1000 : 0, bar = 4 * base.spb; if (Math.abs(len - bar) > .5) await fail(p, tag, 'power', `DROP: the music was cut for ${len.toFixed(2)} s, one bar is ${bar.toFixed(2)} s`); }
    if (cutSeen.drop || (cutSeen.gain !== null && cutSeen.gain < .9)) await fail(p, tag, 'power', 'DROP did not finish / the music did not come back ' + JSON.stringify(cutSeen));
    await samplePt(); if (maxPt > PT_CAP) await fail(p, tag, 'particles', maxPt + ' particles (cap ' + PT_CAP + ')');
    const msgs = await ev(p, () => __mnr.MSGS.slice()); for (const m of msgs) if (m.trim().split(/\s+/).length > 8) await fail(p, tag, 'message-too-long', m);
    console.log(`  ${tag}: all four power-ups triggered and ended, max particles ${maxPt}`);
    if (p.errs.length) await fail(p, tag, 'page-error', p.errs[0]);
  } catch (err) { await fail(p, tag, 'script', err.message.split('\n')[0]); }
  await p.context().close();
}
async function powerShots(browser) {                      // portrait screenshots with a power-up running (look at them: calm and readable?)
  const cfg = CFGS[0], { p } = await newPage(browser, cfg, { pw: true }); const T = new Touch(await p.context().newCDPSession(p));
  try {
    await T.tap(p, '#startBtn'); await ev(p, () => { window.__mnr.god = true; window.__mnr.skipTo(1); }); await T.down(1, cfg.w / 2, cfg.h / 2);
    for (const k of ['drum', 'tempo', 'slow', 'drop']) {
      await ev(p, k => { const m = window.__mnr; m.G.pw && (m.G.pw.act = []); m.PW.off('slow'); m.PW.give(k, k === 'drum'); }, k);
      for (let i = 0; i < 24; i++) { if (k === 'drop' && i >= 6 && await ev(p, () => { const d = __mnr.G.pw && __mnr.G.pw.drop; return !!d && __mnr.bpos() > d.cutB + 1.5; })) break;   // the Drop shot is taken in the middle of the silent bar
        const s = await ev(p, () => window.__bot.step()); if (s.d) { const [sx, sy] = await ev(p, ([dx, dy]) => window.__bot.scr(dx, dy), [(s.d.bx - s.P.x) / 1.5 * .7, (s.d.by - s.P.y) / 1.5 * .7]); await T.move(1, cfg.w / 2 + Math.max(-90, Math.min(90, sx * 3)), cfg.h / 2 + Math.max(-90, Math.min(90, sy * 3))); } await sleep(150); }
      await p.screenshot({ path: path.join(OUT, 'powerups-' + k + '.png') });
    }
    await T.up(1); if (p.errs.length) await fail(p, 'pshots', 'page-error', p.errs[0]);
  } catch (err) { await fail(p, 'pshots', 'script', err.message.split('\n')[0]); }
  await p.context().close();
}
async function powerFps(browser) {                        // 390x763 with DRUM BURST + TEMPO UP running: the game must stay smooth
  const cfg = CFGS[0], { p, T } = await newPage(browser, cfg, { pw: true });
  try {
    await T.tap(p, '#startBtn'); await ev(p, () => { const m = window.__mnr; m.god = true; m.skipTo(2); m.PW.give('drum', false); m.PW.give('tempo', false); });
    await T.down(1, cfg.w / 2, cfg.h / 2); await sleep(1200); await ev(p, () => { const f = window.__mnr.FPS; f.n = 0; f.t = 0; });
    for (let k = 0; k < 40; k++) { await T.move(1, cfg.w / 2 + 60 * Math.sin(k / 3), cfg.h / 2 + 80 * Math.cos(k / 5)); await sleep(250); }
    await T.up(1); const r = await ev(p, () => ({ fps: window.__mnr.FPS.n / window.__mnr.FPS.t * 1000, act: window.__mnr.G.pw.act.length, pt: window.__mnr.G.pt.length }));
    console.log('  power-up FPS (390x763, DRUM BURST + TEMPO UP, 10 s):', r.fps.toFixed(1)); stats.fps.push(r.fps); if (r.fps < 55) await fail(p, 'power-fps', 'FPS', 'fps with power-ups ' + r.fps.toFixed(1) + ' (need 55)');
  } catch (err) { await fail(p, 'power-fps', 'script', err.message.split('\n')[0]); }
  await p.context().close();
}
async function shots(browser) {                          // portrait screenshots mid-run and on a boss
  const cfg = CFGS[0], { p } = await newPage(browser, cfg); const T = new Touch(await p.context().newCDPSession(p));
  try {
    await T.tap(p, '#startBtn'); await ev(p, () => { window.__mnr.god = true; }); await T.down(1, cfg.w / 2, cfg.h / 2);
    for (let k = 0; k < 90; k++) { const s = await ev(p, () => window.__bot.step()); if (s.d) { const [sx, sy] = await ev(p, ([dx, dy]) => window.__bot.scr(dx, dy), [(s.d.bx - s.P.x) / 1.5 * .7, (s.d.by - s.P.y) / 1.5 * .7]); await T.move(1, cfg.w / 2 + Math.max(-90, Math.min(90, sx * 3)), cfg.h / 2 + Math.max(-90, Math.min(90, sy * 3))); } await sleep(150); if (k === 70) await p.screenshot({ path: path.join(OUT, 'portrait-390x763-midrun.png') }); }
    await ev(p, () => { window.__mnr.skipTo(1); window.__mnr.bossNow(); }); await sleep(9000);
    await p.screenshot({ path: path.join(OUT, 'portrait-390x763-boss.png') });
    await T.up(1);
  } catch (err) { await fail(p, 'shots', 'script', err.message.split('\n')[0]); }
  await p.context().close();
}

(async () => {
  const srv = await startServer(); const browser = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream'] });
  const t0 = Date.now(); console.log('serving', URL_BASE, 'runs', RUNS, 'secs', SECS, 'par', PAR);
  try {
    const jobs = [];
    if (want('runs')) { const kinds = ['', 'late', '', 'boss', '', 'reduce', 'daily', '', 'bossN', '', 'late']; for (let i = 0; i < RUNS; i++) { const cfg = CFGS[i % 4]; jobs.push(() => playRun(browser, cfg, i, kinds[i % kinds.length])); } }
    const pre = [];
    if (want('input')) for (const c of CFGS) pre.push(() => inputTests(browser, c));
    const solo = [];                                       // tests that time the audio to a few ms run one at a time: another busy page makes the clock readings jitter
    if (want('pause')) for (const c of [CFGS[0], CFGS[3]]) for (const sy of [false, true]) solo.push(() => pauseTests(browser, c, sy));
    if (want('rotate')) for (const c of CFGS) pre.push(() => rotationTest(browser, c));
    if (want('title')) for (const c of CFGS) pre.push(() => titleTests(browser, c));
    if (want('beat')) solo.push(() => beatTests(browser));
    if (want('synth')) solo.push(() => synthFallbackTests(browser));
    if (want('songs')) ['stage1', 'stage2', 'stage3'].forEach((st, i) => solo.push(() => songTests(browser, st, i)));
    if (want('ios')) solo.push(() => iosTests(browser));
    for (const j of solo) await j();
    const all = pre.concat(jobs); let next = 0;
    await Promise.all(Array.from({ length: PAR }, async () => { while (next < all.length) { const j = all[next++]; await j(); } }));
    if (want('webkit')) await webkitTests();
    if (want('power')) for (const sy of [false, true]) await powerTests(browser, sy);   // alone on the machine: they listen to the audio and time things to a few ms
    if (want('pshots')) await powerShots(browser);
    if (want('powerfps')) await powerFps(browser);
    if (want('shots') && (process.env.SHOTS || ONLY.includes('shots'))) await shots(browser);
    // FPS: a dedicated page alone on the machine
    if (want('fps')) { const cfg = CFGS[0], { p, T } = await newPage(browser, cfg); await T.tap(p, '#startBtn'); await ev(p, () => { window.__mnr.god = true; }); await T.down(1, cfg.w / 2, cfg.h / 2); for (let k = 0; k < 40; k++) { await T.move(1, cfg.w / 2 + 60 * Math.sin(k / 3), cfg.h / 2 + 80 * Math.cos(k / 5)); await sleep(250); } await T.up(1);
      const f = await ev(p, () => window.__mnr.FPS.n / window.__mnr.FPS.t * 1000); console.log('  solo FPS (390x763, rotated, god mode, 10 s of full action):', f.toFixed(1)); stats.fps.push(f); if (f < 45) await fail(p, 'fps', 'FPS', 'solo fps ' + f.toFixed(1)); await p.context().close(); }
  } finally { await browser.close(); srv.kill(); }
  const avg = stats.fps.length ? stats.fps.reduce((a, b) => a + b, 0) / stats.fps.length : 0;
  console.log(`\nruns ${stats.runs}, ticks ${stats.ticks}, avg FPS ${avg.toFixed(1)} (${stats.fps.length} runs), perfects ${stats.perfect}, kills ${stats.kills}, bosses reached ${stats.bosses}, furthest district index ${stats.maxDistrict}, max particles (calm) ${stats.maxPt || 0}, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  if (stats.fps.length && avg < 45) fails.push({ tag: 'all', kind: 'FPS', detail: 'average FPS ' + avg.toFixed(1) });
  fs.writeFileSync(path.join(OUT, 'sweep-result.json'), JSON.stringify({ fails, stats, avg }, null, 1));
  if (fails.length) { console.log('\nFAILED:', fails.length); for (const f of fails) console.log(' -', f.tag, f.kind, f.detail, f.shot); process.exit(1); }
  console.log('\nSWEEP PASSED');
})().catch(e => { console.error(e); process.exit(2); });
