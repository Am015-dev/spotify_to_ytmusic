#!/usr/bin/env node
// Mainhattan Nightrun bug sweep: plays the REAL page with real input (CDP touch, real keys) and asserts every step.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/sweep.js
//   env: RUNS=34 (bot runs, split over the 4 sizes) SECS=22 (seconds per run) PAR=2 (pages at once) SKIP=beat,pause,... ONLY=beat SEED=1 SHOTS=1 (save playtest screenshots)
// It fails on: page errors, audio errors, a run that stands still >8 s, ship not following input, buttons off screen or covered,
// horizontal scroll, average FPS < 45, a boss that cannot be hurt or reached, HUD text not equal to the game state, NaN state,
// broken pause / restart / resume / settings, tab-hide not pausing, rotation breaking layout or input, and beat judging that is off by more than 80 ms.
// Shop / garage (SKIP=shop,garage,econ to leave out): a pit stop opens after every district; touch buy / reroll / skip / 10 s timeout work; every upgrade really changes the game;
//   garage purchases persist across reloads; the ships fire their own rhythms; no horizontal scroll; pit-stop and garage buttons >= 44 px (375x553 included); screenshots shop-*.png.
//   ECON=6 (+ECONSECS=150) plays that many long bot runs and prints the Neon economy (Neon per run, picks per run, garage bank).
// Beat checks use a generated 120 BPM test WAV served by a route override (nothing is written to the repo).
const PW = require(process.env.PW || 'playwright'), fs = require('fs'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const OUT = path.join(__dirname, 'playtest'); fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) if (/^fail.*\.png$/.test(f)) fs.unlinkSync(path.join(OUT, f));
const ECON = +process.env.ECON || 0, ECONSECS = +process.env.ECONSECS || 150;
const RUNS = +process.env.RUNS || 34, SECS = +process.env.SECS || 22, PAR = +process.env.PAR || 2;
const SKIP = new Set((process.env.SKIP || '').split(',').filter(Boolean)), ONLY = process.env.ONLY || '';
const want = n => ONLY ? ONLY.split(',').includes(n) : !SKIP.has(n);
let seed = +process.env.SEED || 7; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mobile/15E148 Safari/604.1';
const CFGS = [
  { name: '390x763', w: 390, h: 763, touch: true }, { name: '375x553', w: 375, h: 553, touch: true },
  { name: '844x390', w: 844, h: 390, touch: true }, { name: '1280x800', w: 1280, h: 800, touch: false }];
const fails = [], seen = new Set(), stats = { runs: 0, ticks: 0, perfect: 0, kills: 0, bosses: 0, fps: [], maxDistrict: 0, pits: 0, econ: [], shopChecks: 0 }; let shotN = 0;
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
      out.run = m.running; out.paused = m.paused; out.shop = !!(m.SH && m.SH.active); out.neon = m.SH ? m.SH.neon : 0; out.pits = m.SH ? m.SH.pits : 0; out.rot = m.rotMode; out.vw = innerWidth; out.vh = innerHeight; out.touchUI = m.touchUI;
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
      for (const e of document.querySelectorAll('.pg:not([hidden]) button, #gaBtn, #gaBtn2')) { if (!vis(e)) continue; const r = e.getBoundingClientRect(); if (Math.min(r.width, r.height) < 43.5) out.bad.push('button under 44 px ' + (e.id || e.textContent.trim().slice(0, 12)) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); }
      for (const e of document.querySelectorAll('.pg:not([hidden]) .card')) { if (e.scrollHeight > e.clientHeight + 2 || e.scrollWidth > e.clientWidth + 2) out.bad.push('card text overflows ' + e.dataset.id); const r = e.getBoundingClientRect(); if (r.width < 40 || r.height < 40) out.bad.push('card too small ' + e.dataset.id); }
      for (const o of document.querySelectorAll('.ov:not([hidden])')) if (o.scrollWidth > o.clientWidth + 1) out.bad.push('overlay wider than screen ' + o.id);
      if (m.running && !m.paused && !G.dead && !out.shop && !document.getElementById('touch').hidden === false && out.touchUI) out.bad.push('touch buttons hidden while playing');
      if (G && P) {
        const fin = v => Number.isFinite(v); out.nan = !(fin(P.x) && fin(P.y) && fin(P.hp) && fin(P.heat) && fin(G.score) && fin(G.mult) && G.eb.every(b => fin(b.x) && fin(b.y)) && G.en.every(e => fin(e.x) && fin(e.y) && fin(e.hp)));
        out.G = { t: G.t, score: G.score, kills: G.kills, di: G.di, loop: G.loop, dt: G.dt, en: G.en.length, eb: G.eb.length, dead: G.dead, bc: G.bc, bossDone: G.bossDone, transT: G.transT, banner: G.banner.t, daily: G.daily, perf: G.perf };
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
  const tag = `${cfg.name}#${i}${kind ? '/' + kind : ''}`, { p, cdp, T } = await newPage(browser, cfg, { reduce: kind === 'reduce' });
  stats.runs++; const t0 = Date.now(), maxMs = kind === 'econ' ? ECONSECS * 1000 : SECS * 1000 * (kind === 'boss' ? 4 : 1);
  try {
    if (!await startGame(p, cfg, T, kind === 'daily' ? 'daily' : 'start')) { await fail(p, tag, 'start', 'game did not start'); return; }
    if (kind === 'late') await ev(p, i => window.__mnr.skipTo(i), 1 + (i % 3));
    if (kind === 'boss') { await ev(p, () => { window.__mnr.god = true; window.__mnr.skipTo(0); window.__mnr.bossNow(); }); }
    if (kind === 'bossN') { await ev(p, i => { window.__mnr.god = true; window.__mnr.skipTo(i); window.__mnr.bossNow(); }, 1 + (i % 3)); }
    let fx = cfg.w / 2, fy = cfg.h / 2, touching = false, keys = {}, lastProg = Date.now(), lastSig = '', lastHudFrame = -1, lastEn = Date.now(), stillSince = 0, lastPos = null, lastMoveCheck = Date.now();
    let pitN = 0, bossT0 = 0, bossHp0 = 0, bossSeen = false, over = false, nTick = 0, dashN = 0;
    if (!cfg.touch) { await p.keyboard.down('Space'); keys.Space = 1; }
    while (Date.now() - t0 < maxMs) {
      const s = await ev(p, () => window.__bot.step()); nTick++; stats.ticks++;
      if (p.errs.length) { await fail(p, tag, 'page-error', p.errs[0]); break; }
      for (const b of s.bad) await fail(p, tag, 'layout', b);
      if (s.nan) await fail(p, tag, 'NaN-state', 'non-finite value in game state');
      if (!s.run) { over = true; break; }
      if (s.shop) {                                       // pit stop: the world waits, play the shop like a player (buy / skip) by touch or mouse
        lastProg = Date.now(); lastEn = Date.now();
        if (touching) { await T.up(1); touching = false; }   // a player lifts the finger to tap a card
        if (keys.Space) { await p.keyboard.up('Space'); keys.Space = 0; }
        if (s.pits !== pitN) { pitN = s.pits; stats.pits++; await shopTurn(p, cfg, T, tag, kind === 'econ' ? 0 : (i + pitN) % 3); }
        await sleep(60); continue;
      }
      if (s.paused) { await fail(p, tag, 'unexpected-pause', 'game paused by itself'); break; }
      if (s.actx !== 'running' && Date.now() - t0 > 3000) { await fail(p, tag, 'audio', 'AudioContext is ' + s.actx + ' while playing'); }
      stats.maxDistrict = Math.max(stats.maxDistrict, s.G.di + 4 * s.G.loop);
      // HUD text equals the engine state
      if (s.hud.frame > 0 && s.hud.frame !== lastHudFrame && !s.G.dead) {
        lastHudFrame = s.hud.frame; const h = s.hud;
        if (h.score !== String(s.G.score).padStart(8, '0') || h.hp !== s.P.hp || h.heat !== Math.round(s.P.heat) || h.emp !== s.P.emp || h.combo !== s.C || h.wl !== s.P.wl || h.neon !== s.neon)
          await fail(p, tag, 'HUD-mismatch', JSON.stringify({ hud: [h.score, h.hp, h.heat, h.emp, h.combo, h.wl, h.neon], eng: [s.G.score, s.P.hp, Math.round(s.P.heat), s.P.emp, s.C, s.P.wl, s.neon] }));
        if (!(s.P.hp >= 0 && s.P.hp <= 5 && s.P.heat >= 0 && s.P.heat <= 100.01 && s.P.emp >= 0 && s.P.emp <= 3)) await fail(p, tag, 'HUD-range', JSON.stringify(s.P));
      }
      // progress / stuck
      const sig = [Math.floor(s.G.t), s.G.bc, s.G.kills, s.G.score].join('/'); if (sig !== lastSig) { lastSig = sig; lastProg = Date.now(); }
      if (Date.now() - lastProg > 8000) { await fail(p, tag, 'stuck', 'state frozen for 8 s ' + sig); break; }
      if (s.G.en > 0 || s.boss || s.G.transT >= 0 || s.G.dead || s.G.banner > 0) lastEn = Date.now();
      if (Date.now() - lastEn > 9000) await fail(p, tag, 'stuck', 'no enemies for 9 s and no boss');
      // boss reachability
      if (!s.boss) bossSeen = false;
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
    if (kind === 'econ' || kind === '') { const q = await ev(p, () => { const m = __mnr, h = m.SH; return { pit: h.pitLog.slice(), earned: h.earned, spent: h.spent, picks: h.picks, left: h.neon, bank: h.lastBank || 0, di: m.G.di + 4 * m.G.loop, score: m.G.score, t: m.G.t, kills: m.G.kills, dead: m.G.dead || !m.running }; }); stats.econ.push(Object.assign({ kind }, q)); }
    if (e.n > 120) stats.fps.push(e.fps); stats.perfect += e.ok; stats.kills += e.kills;
    for (const m of e.msgs) if (m.trim().split(/\s+/).length > 8) await fail(p, tag, 'message-too-long', m);
    if (over) {                                           // game-over screen: right numbers, button reachable, restart works
      await sleep(900); const o = await ev(p, () => { const m = window.__mnr, r = window.__bot.probe(); return { bad: r.bad, shown: document.getElementById('oScore').textContent, score: m.G.score, over: !document.getElementById('over').hidden }; });
      if (!o.over) await fail(p, tag, 'game-over', 'overlay not shown'); for (const b of o.bad) await fail(p, tag, 'layout', 'game-over ' + b);
      if (o.shown.replace(/\D/g, '') !== String(o.score)) await fail(p, tag, 'HUD-mismatch', 'game-over score ' + o.shown + ' vs ' + o.score);
      if (touching) { await T.up(1); touching = false; }
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
    if (worst > 45 || over > 1) await fail(p, tag, 'beat', 'beat clock drifts ' + worst.toFixed(1) + ' ms from the file position');
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


// ---------------- shop / garage ----------------
async function shopTurn(p, cfg, T, tag, mode) {             // what a player does in a pit stop: 0 buy what it can then GO, 1 SKIP, 2 buy one and GO
  if (!await waitFor(p, () => __mnr.SH.lock <= 0 || !__mnr.SH.active, null, 2500)) return;
  const nCards = await ev(p, () => __mnr.SH.active ? __mnr.SH.cards.length : -1); if (nCards < 0) return;
  if (mode !== 1) for (let k = 0; k < nCards; k++) {
    const can = await ev(p, k => { const h = __mnr.SH, c = h.cards[k]; return h.active && c && !c.sold && h.neon >= h.price(c.u); }, k);
    if (can) { await press(p, cfg, T, `#shCards .card:nth-child(${k + 1})`); await sleep(120); if (mode === 2) break; }
  }
  if (await ev(p, () => __mnr.SH.active)) { await sleep(150); await press(p, cfg, T, '#shGo'); }
}
async function toPit(p, di) {                               // play district di up to its boss, kill the boss, wait for the pit stop
  await ev(p, d => { const m = window.__mnr; m.god = true; m.skipTo(d); m.bossNow(); }, di);
  if (!await waitFor(p, () => __mnr.G.boss, null, 15000)) return false;
  await ev(p, () => { __mnr.G.boss.hp = 0; });
  return waitFor(p, () => __mnr.SH.active, null, 9000);
}
const unlock = p => waitFor(p, () => !__mnr.SH.active || __mnr.SH.lock <= 0, null, 8000);
const shotPath = n => path.join(OUT, 'shop-' + n + '.png');
async function shopTests(browser, cfg, full) {
  const tag = cfg.name + '/shop', { p, T } = await newPage(browser, cfg), chk = (c, kind, d) => { stats.shopChecks++; return c ? Promise.resolve() : fail(p, tag, kind, d); };
  try {
    if (!await startGame(p, cfg, T)) return fail(p, tag, 'start', 'no start');
    // 1. a pit stop opens after the district, with cards, a counter and a timer; layout is clean
    if (!await toPit(p, 0)) { await fail(p, tag, 'pit-missing', 'no pit stop after district 1'); return; }
    await unlock(p); await sleep(300);
    let s = await ev(p, () => window.__bot.probe()); for (const b of s.bad) await fail(p, tag, 'layout', 'pit stop ' + b);
    const ui = await ev(p, () => ({ cards: document.querySelectorAll('#shCards .card').length, texts: [...document.querySelectorAll('#shCards .card .t')].map(e => e.textContent), vis: !document.getElementById('shop').hidden, words: [...document.querySelectorAll('#shCards .card .t')].every(e => e.textContent.trim().split(/\s+/).length <= 8) }));
    await chk(ui.vis && ui.cards >= 1 && ui.cards <= 3, 'pit-ui', 'cards ' + ui.cards); await chk(ui.words, 'message-too-long', 'card text over 8 words ' + ui.texts.join('|'));
    await chk(!(await ev(p, () => __mnr.paused)) && (await ev(p, () => __mnr.running)), 'pit-ui', 'run state wrong in pit stop');
    const w0 = await ev(p, () => __mnr.G.t); await sleep(500); await chk(Math.abs((await ev(p, () => __mnr.G.t)) - w0) < .01, 'pit-frozen', 'world kept running during pit stop');
    await p.screenshot({ path: shotPath('pit-' + cfg.name) });
    // 2. cannot afford -> nothing bought, hint shown
    await ev(p, () => { __mnr.SH.neon = 0; __mnr.SH.draw(); });
    await press(p, cfg, T, '#shCards .card:nth-child(1)'); await sleep(150);
    await chk(await ev(p, () => __mnr.SH.picks === 0 && __mnr.SH.neon === 0 && /Need/.test(document.getElementById('shMsg').textContent)), 'shop-buy', 'unaffordable card was bought or no hint');
    // 3. buy with enough Neon: price paid, upgrade applied, icon shown
    await ev(p, () => { __mnr.SH.neon = 100; __mnr.SH.draw(); });
    const b0 = await ev(p, () => { const h = __mnr.SH, c = h.cards[0]; return { id: c.u.id, pr: h.price(c.u) }; });
    await press(p, cfg, T, '#shCards .card:nth-child(1)'); await sleep(200);
    const b1 = await ev(p, () => ({ neon: __mnr.SH.neon, n: __mnr.SH.n(__mnr.SH.cards[0].u.id), sold: __mnr.SH.cards[0].sold, own: document.querySelectorAll('#shOwn svg').length }));
    await chk(b1.neon === 100 - b0.pr && b1.n === 1 && b1.sold && b1.own === 1, 'shop-buy', 'buy by tap failed ' + JSON.stringify([b0, b1]));
    // 4. reroll costs Neon and deals new cards
    const r0 = await ev(p, () => ({ neon: __mnr.SH.neon, pr: __mnr.SH.rerollPrice() }));
    await press(p, cfg, T, '#shRe'); await sleep(150);
    const r1 = await ev(p, () => ({ neon: __mnr.SH.neon, rr: __mnr.SH.rerolls, sold: __mnr.SH.cards.some(c => c.sold) }));
    await chk(r1.neon === r0.neon - r0.pr && r1.rr === 1 && !r1.sold, 'shop-reroll', 'reroll failed ' + JSON.stringify([r0, r1]));
    // 5. SKIP / GO continues to the next district
    await press(p, cfg, T, '#shGo'); await sleep(300);
    s = await ev(p, () => ({ act: __mnr.SH.active, di: __mnr.G.di, hidden: document.getElementById('shop').hidden }));
    await chk(!s.act && s.hidden && s.di === 1, 'shop-skip', 'GO did not continue to district 2 ' + JSON.stringify(s));
    // 6. second district: the pit stop comes again; the 10 s timer continues on its own
    if (!await toPit(p, 1)) { await fail(p, tag, 'pit-missing', 'no pit stop after district 2'); }
    else {
      const t0 = Date.now(); const ended = await waitFor(p, () => !__mnr.SH.active, null, 15000), el = Date.now() - t0;
      s = await ev(p, () => ({ di: __mnr.G.di, banner: __mnr.G.banner.t }));
      await chk(ended && el > 7500 && el < 14500 && s.di === 2, 'shop-timeout', 'auto-continue after ' + el + ' ms, district ' + s.di);
    }
    if (full) {                                         // 7. every upgrade does what its card says
      await ev(p, () => { const h = __mnr.SH; h.got = {}; h.order = []; h.sh = 0; h.spare = 0; h.recalc(); h.neon = 9999; });
      const U = await ev(p, () => __mnr.SH.UPG.map(u => u.id)); let di = 2;
      for (let k = 0; k < U.length; k += 3) {
        if (!await toPit(p, di++ % 4)) { await fail(p, tag, 'pit-missing', 'no pit stop for upgrade batch'); break; }
        await unlock(p); const batch = U.slice(k, k + 3);
        await ev(p, ids => { const h = __mnr.SH; h.neon = 9999; h.cards = ids.map(id => ({ u: h.UPG.find(u => u.id === id), sold: false })); h.draw(); }, batch);
        for (let j = 0; j < batch.length; j++) { await press(p, cfg, T, `#shCards .card:nth-child(${j + 1})`); await sleep(120); }
        await chk(await ev(p, ids => ids.every(id => __mnr.SH.n(id) === 1), batch), 'shop-buy', 'batch not bought ' + batch);
        await press(p, cfg, T, '#shGo'); await sleep(300);
      }
      const E = await ev(p, () => { const h = __mnr.SH; return { fr: h.shot().cd, hm: h.hm, ck: h.ck, sharp: h.sharp, nx: h.nx, sh: h.sh, spare: h.spare, mag: __mnr.NR.mod.mag, win: __mnr.NR.mod.win, pw: __mnr.NR.mod.pw, spb: __mnr.BT.spb }; });
      await chk(E.fr < Math.max(.09, E.spb / 6) - 1e-6 && E.hm === 1 && E.ck === 4 && E.sharp === 1.5 && E.nx === 1.5 && E.mag > 140 && E.win === 20 && E.pw === 1.5, 'upgrade-effect', 'state ' + JSON.stringify(E));
      await chk(E.sh === 1 && E.spare >= 1, 'upgrade-effect', 'shield/dash charge not given ' + JSON.stringify(E));
      // shield soaks one hit
      await ev(p, () => { const m = __mnr; m.god = false; m.G.en = []; m.G.eb = []; m.P.inv = 0; m.P.dashT = 0; m.G.eb.push({ x: m.P.x, y: m.P.y, vx: 0, vy: 0, r: 5, c: '#fff', g: 1 }); });
      await sleep(120); const sh = await ev(p, () => ({ hp: __mnr.P.hp, sh: __mnr.SH.sh })); await chk(sh.hp === 5 && sh.sh === 0, 'upgrade-effect', 'shield did not absorb a hit ' + JSON.stringify(sh));
      // spare dash charge: dash again while the first dash cools down
      await ev(p, () => { const m = __mnr; m.god = true; m.G.en = []; m.G.eb = []; m.P.dashCd = .9; m.P.dashT = 0; m.SH.spare = 1; });
      await p.keyboard.press('ShiftLeft'); await sleep(60); const dd = await ev(p, () => ({ t: __mnr.P.dashT, sp: __mnr.SH.spare })); await chk(dd.t > 0 && dd.sp === 0, 'upgrade-effect', 'spare dash charge unused ' + JSON.stringify(dd));
      // dash blast + sharp beat damage
      await sleep(400); const dh = await ev(p, () => { const m = __mnr, e = { type: 'drone', t: 0, flash: 0, bf: 99, bn: 0, x: m.P.x + 10, y: m.P.y, r: 14, hp: 100, max: 100, score: 100, by: m.P.y, amp: 0 }; m.G.en = [e]; m.P.dashCd = 0; window.__t = e; return e.hp; });
      await p.keyboard.press('ShiftLeft'); await sleep(120); await chk((await ev(p, () => __t.hp)) <= dh - 9.9, 'upgrade-effect', 'dash blast did no damage (x2)');
      await sleep(300); await ev(p, () => { const m = __mnr; m.G.en = []; const e = { type: 'drone', t: 0, flash: 0, bf: 99, bn: 0, x: 700, y: 300, r: 14, hp: 100, max: 100, score: 100, by: 300, amp: 0 }; m.G.en = [e]; m.G.pb = [{ x: 700, y: 300, vx: 0, vy: 0, dm: 2, pf: 1 }]; window.__t = e; });
      await sleep(100); const hp = await ev(p, () => __t.hp); await chk(Math.abs(100 - hp - 3) < .01, 'upgrade-effect', 'sharp beat damage ' + (100 - hp) + ' != 3');
      // homing bends a bullet toward an enemy
      const hv = await ev(p, () => { const m = __mnr, e = { type: 'drone', x: 400, y: 330, hp: 9, r: 14 }; m.G.en = [e]; const b = { x: 100, y: 200, vx: 900, vy: 0 }; m.SH.steer(b, .05); return b.vy; }); await chk(hv > 20, 'upgrade-effect', 'homing did not bend the shot ' + hv);
      // combo keeper holds the combo past 8 beats
      await ev(p, () => { const m = __mnr; m.G.en = []; m.C.n = 5; m.C.lb = m.G.bc - 9; window.__bc = m.G.bc; }); await waitFor(p, () => __mnr.G.bc > window.__bc, null, 2500);
      await chk(await ev(p, () => __mnr.C.n === 5), 'upgrade-effect', 'combo keeper did not hold the combo');
      // neon boost: a drone kill pays 2 instead of 1
      const nb = await ev(p, () => { const h = __mnr.SH; __mnr.C.n = 0; h.acc = 0; const n0 = h.neon; h.award({ type: 'gunship', x: 0, y: 0, pf: 0 }); return h.neon - n0; }); await chk(nb === 4, 'upgrade-effect', 'neon boost paid ' + nb + ' (3 x 1.5 = 4)');
    }
    if (p.errs.length) await fail(p, tag, 'page-error', p.errs[0]);
  } catch (err) { await fail(p, tag, 'script', err.message.split('\n')[0]); }
  await p.context().close();
}
async function garageTests(browser, cfg, full) {
  const tag = cfg.name + '/garage', chk = (p, c, kind, d) => { stats.shopChecks++; return c ? Promise.resolve() : fail(p, tag, kind, d); };
  const { p, T } = await newPage(browser, cfg);
  try {
    await ev(p, () => { localStorage.setItem('mnr_bank', '500'); }); await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.__bot);
    await press(p, cfg, T, '#gaBtn'); await sleep(250);
    let s = await ev(p, () => window.__bot.probe()); for (const b of s.bad) await fail(p, tag, 'layout', 'garage ' + b);
    await chk(p, await ev(p, () => !document.getElementById('garage').hidden && document.querySelectorAll('#gaCards .card').length === 4), 'garage-ui', 'garage did not open with 4 cards');
    await p.screenshot({ path: shotPath('garage-' + cfg.name) });
    const buy = async (tab, id) => { await press(p, cfg, T, `.tabs button[data-t="${tab}"]`); await sleep(100); await press(p, cfg, T, `#gaCards .card[data-id="${id}"]`); await sleep(150); };
    await ev(p, () => { __mnr.GA.bank = 10; }); await buy('ships', 'hv'); await chk(p, await ev(p, () => !__mnr.GA.own.ship_hv && __mnr.GA.bank === 10), 'garage-buy', 'bought a ship without the Neon');
    await ev(p, () => { __mnr.GA.bank = 500; });
    await buy('ships', 'tri'); await buy('crew', 'up_db'); await buy('looks', 'dusk');
    await p.screenshot({ path: shotPath('garage-looks-' + cfg.name) });
    s = await ev(p, () => ({ own: __mnr.GA.own, bank: __mnr.GA.bank, ship: __mnr.GA.ship, theme: __mnr.GA.theme, f: document.getElementById('game').style.filter }));
    await chk(p, s.own.ship_tri && s.own.up_db && s.own.th_dusk && s.bank === 500 - 80 - 70 - 60 && s.ship === 'tri' && s.theme === 'dusk' && /hue-rotate/.test(s.f), 'garage-buy', 'purchases wrong ' + JSON.stringify(s));
    // persistence across a reload
    await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.__bot);
    s = await ev(p, () => ({ own: __mnr.GA.own, bank: __mnr.GA.bank, ship: __mnr.GA.ship, theme: __mnr.GA.theme, f: document.getElementById('game').style.filter, btn: document.getElementById('gaBtn').textContent }));
    await chk(p, s.own.ship_tri && s.own.up_db && s.own.th_dusk && s.bank === 290 && s.ship === 'tri' && s.theme === 'dusk' && /hue-rotate/.test(s.f) && /290/.test(s.btn), 'garage-persist', 'not kept after reload ' + JSON.stringify(s));
    // the unlocked extra upgrade is now in the pit-stop pool; the bought ship is the one flown
    if (!await startGame(p, cfg, T)) { await fail(p, tag, 'start', 'no start'); await p.context().close(); return; }
    s = await ev(p, () => ({ ship: __mnr.SH.ship, db: __mnr.SH.pool().some(u => u.id === 'db'), nx: __mnr.SH.pool().some(u => u.id === 'nx') }));
    await chk(p, s.ship === 'tri' && s.db && !s.nx, 'garage-effect', 'ship/pool wrong ' + JSON.stringify(s));
    // Neon banks after a run: unspent + 30% of earned
    await ev(p, () => { const m = __mnr; m.god = false; m.SH.neon = 20; m.SH.earned = 50; m.P.hp = 1; });
    await ev(p, () => { __mnr.G.eb.push({ x: __mnr.P.x, y: __mnr.P.y, vx: 0, vy: 0, r: 5, c: '#fff', g: 1 }); __mnr.P.inv = 0; __mnr.SH.sh = 0; });
    await waitFor(p, () => !__mnr.running, null, 6000); await sleep(300);
    s = await ev(p, () => ({ bank: __mnr.GA.bank, line: document.getElementById('oNeon').textContent, runs: __mnr.GA.runs, stored: localStorage.getItem('mnr_bank') }));
    await chk(p, s.bank === 290 + 20 + 15 && s.stored === String(s.bank) && /Banked/.test(s.line), 'garage-bank', 'run did not bank Neon ' + JSON.stringify(s));
    s = await ev(p, () => window.__bot.probe()); for (const b of s.bad) await fail(p, tag, 'layout', 'game over ' + b);
    if (full) await shipTests(p, cfg, T, tag);
    if (p.errs.length) await fail(p, tag, 'page-error', p.errs[0]);
  } catch (err) { await fail(p, tag, 'script', err.message.split('\n')[0]); }
  await p.context().close();
}
async function shipTests(p, cfg, T, tag) {               // each ship fires its own rhythm
  const chk = (c, kind, d) => { stats.shopChecks++; return c ? Promise.resolve() : fail(p, tag, kind, d); };
  await ev(p, () => { localStorage.setItem('mnr_own', JSON.stringify({ ship_tri: true, ship_hv: true, ship_ec: true })); });
  for (const ship of ['std', 'tri', 'hv', 'ec']) {
    await ev(p, sh => { localStorage.setItem('mnr_ship', JSON.stringify(sh)); }, ship); await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.__bot);
    if (!await startGame(p, cfg, T)) { await fail(p, tag, 'start', 'no start ' + ship); continue; }
    await ev(p, () => { const m = __mnr; m.god = true; m.P.wl = 1; window.__log = []; setInterval(() => { for (const b of m.G.pb) if (!b.s) { b.s = 1; window.__log.push([performance.now(), b.ec ? 1 : 0, b.hv ? 1 : 0, m.bpos(), m.BT.spb]); } }, 8); });
    await sleep(3200);                                    // let the first banner pass; then hold fire
    if (cfg.touch) await T.down(1, cfg.w / 2, cfg.h / 2); else await p.keyboard.down('Space');
    await sleep(5200); if (cfg.touch) await T.up(1); else await p.keyboard.up('Space'); await sleep(800);
    const L = await ev(p, () => window.__log), spb = L.length ? L[0][4] : .5;
    const vol = [], cl = a => { const out = []; for (const r of a) { if (!out.length || r[0] - out[out.length - 1].t > 30) out.push({ t: r[0], n: 1, bp: r[3], ec: r[1], hv: r[2] }); else out[out.length - 1].n++; } return out; };
    const norm = cl(L.filter(r => !r[1])), ech = cl(L.filter(r => r[1])), V = norm, dur = V.length > 1 ? (V[V.length - 1].t - V[0].t) / 1000 : 0, perBeat = dur ? (V.length - 1) / (dur / spb) : 0;
    const gridOk = (g) => norm.filter(v => { const f = (v.bp / g) % 1; return Math.min(f, 1 - f) * g < .3; }).length / Math.max(1, norm.length);
    if (ship === 'std') await chk(norm.length > 8 && !ech.length && !norm.some(v => v.hv) && perBeat > 3, 'ship-rhythm', 'Courier volleys/beat ' + perBeat.toFixed(2));
    if (ship === 'tri') { const pb = norm.length > 1 ? (norm.length - 1) / ((norm[norm.length - 1].t - norm[0].t) / 1000 / spb) : 0; await chk(norm.length > 8 && Math.abs(pb - 3) < .5 && gridOk(1 / 3) > .8 && norm.every(v => v.n >= 4), 'ship-rhythm', `Triplet ${pb.toFixed(2)}/beat grid ${gridOk(1 / 3).toFixed(2)} n=${norm.map(v => v.n).slice(0, 5)}`); }
    if (ship === 'hv') { const pb = norm.length > 1 ? (norm.length - 1) / ((norm[norm.length - 1].t - norm[0].t) / 1000 / spb) : 0; await chk(norm.length > 3 && Math.abs(pb - .5) < .1 && gridOk(2) > .8 && norm.every(v => v.hv), 'ship-rhythm', `Heavy ${pb.toFixed(2)}/beat grid ${gridOk(2).toFixed(2)}`); }
    if (ship === 'ec') { const ok = ech.filter(e => norm.some(n => Math.abs(e.t - n.t - spb * 1000) < 90)).length; await chk(norm.length > 4 && ech.length >= norm.length - 2 && ok >= ech.length * .8, 'ship-rhythm', `Echo ${ech.length} echoes of ${norm.length}, ${ok} one beat late`); }
  }
}
function econReport() {
  const E = stats.econ; if (!E.length) return; const avg = k => E.reduce((a, b) => a + b[k], 0) / E.length;
  const pits1 = E.filter(e => e.pit.length).map(e => e.pit[0]); console.log(`\nNEON ECONOMY over ${E.length} bot runs (${pits1.length} reached a pit stop; Neon in hand at the first one: ${pits1.join(', ') || '-'}): earned ${avg('earned').toFixed(1)} per run (min ${Math.min(...E.map(e => e.earned))}, max ${Math.max(...E.map(e => e.earned))}), spent ${avg('spent').toFixed(1)}, pit-stop picks ${avg('picks').toFixed(2)}, banked ${avg('bank').toFixed(1)}, reached district index ${avg('di').toFixed(1)}, run length ${avg('t').toFixed(0)} s`);
  for (const e of E) console.log('   ', JSON.stringify(e));
}

(async () => {
  const srv = await startServer(); const browser = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream'] });
  const t0 = Date.now(); console.log('serving', URL_BASE, 'runs', RUNS, 'secs', SECS, 'par', PAR);
  try {
    const jobs = [];
    if (want('runs')) { const kinds = ['', 'late', '', 'boss', '', 'reduce', 'daily', '', 'bossN', '', 'late']; for (let i = 0; i < RUNS; i++) { const cfg = CFGS[i % 4]; jobs.push(() => playRun(browser, cfg, i, kinds[i % kinds.length])); } }
    const pre = [];
    if (want('input')) for (const c of CFGS) pre.push(() => inputTests(browser, c));
    if (want('pause')) for (const c of [CFGS[0], CFGS[3]]) for (const sy of [false, true]) pre.push(() => pauseTests(browser, c, sy));
    if (want('rotate')) for (const c of CFGS) pre.push(() => rotationTest(browser, c));
    if (want('title')) for (const c of CFGS) pre.push(() => titleTests(browser, c));
    if (want('beat')) pre.push(() => beatTests(browser));
    if (want('synth')) pre.push(() => synthFallbackTests(browser));
    if (want('songs')) ['stage1', 'stage2', 'stage3'].forEach((st, i) => pre.push(() => songTests(browser, st, i)));
    if (want('ios')) pre.push(() => iosTests(browser));
    if (want('shop')) CFGS.forEach((c, k) => pre.push(() => shopTests(browser, c, k === 0 || k === 3)));
    if (want('garage')) CFGS.forEach((c, k) => pre.push(() => garageTests(browser, c, k === 0 || k === 3)));
    for (let k = 0; k < ECON; k++) pre.push(() => playRun(browser, CFGS[k % 2], 100 + k, 'econ'));
    const all = pre.concat(jobs); let next = 0;
    await Promise.all(Array.from({ length: PAR }, async () => { while (next < all.length) { const j = all[next++]; await j(); } }));
    if (want('webkit')) await webkitTests();
    if (want('shots') && (process.env.SHOTS || ONLY.includes('shots'))) await shots(browser);
    // FPS: a dedicated page alone on the machine
    if (want('fps')) { const cfg = CFGS[0], { p, T } = await newPage(browser, cfg); await T.tap(p, '#startBtn'); await ev(p, () => { window.__mnr.god = true; }); await T.down(1, cfg.w / 2, cfg.h / 2); for (let k = 0; k < 40; k++) { await T.move(1, cfg.w / 2 + 60 * Math.sin(k / 3), cfg.h / 2 + 80 * Math.cos(k / 5)); await sleep(250); } await T.up(1);
      const f = await ev(p, () => window.__mnr.FPS.n / window.__mnr.FPS.t * 1000); console.log('  solo FPS (390x763, rotated, god mode, 10 s of full action):', f.toFixed(1)); stats.fps.push(f); if (f < 45) await fail(p, 'fps', 'FPS', 'solo fps ' + f.toFixed(1)); await p.context().close(); }
  } finally { await browser.close(); srv.kill(); }
  const avg = stats.fps.length ? stats.fps.reduce((a, b) => a + b, 0) / stats.fps.length : 0;
  console.log(`\nruns ${stats.runs}, ticks ${stats.ticks}, avg FPS ${avg.toFixed(1)} (${stats.fps.length} runs), perfects ${stats.perfect}, kills ${stats.kills}, bosses reached ${stats.bosses}, furthest district index ${stats.maxDistrict}, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  if (stats.fps.length && avg < 45) fails.push({ tag: 'all', kind: 'FPS', detail: 'average FPS ' + avg.toFixed(1) });
  econReport(); console.log(`shop: ${stats.pits} pit stops played in runs, ${stats.shopChecks} shop/garage checks`);
  fs.writeFileSync(path.join(OUT, 'sweep-result.json'), JSON.stringify({ fails, stats, avg }, null, 1));
  if (fails.length) { console.log('\nFAILED:', fails.length); for (const f of fails) console.log(' -', f.tag, f.kind, f.detail, f.shot); process.exit(1); }
  console.log('\nSWEEP PASSED');
})().catch(e => { console.error(e); process.exit(2); });
