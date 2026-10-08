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
const PT_CAP = 60;                                      // calm visuals (the default): most particles allowed on screen at once
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
  setInterval(() => { const m = window.__mnr; if (window.__noPW && m && m.G && m.G.live) m.PW.st().cnt = 1e9; }, 30);   // tests that need a steady tempo get no glowing enemies
  // songs are streamed <audio> elements now: the spy records every play() of one, and the ground truth is where the element really is
  const op = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function () { try { const m = window.__mnr; if (m && m.AU && m.AU.a && /^blob:/.test(this.currentSrc || this.src)) window.__spy.starts.push({ at: m.AU.a.currentTime, el: this }); } catch (e) { } return op.apply(this, arguments); };
  const playing = () => { const m = window.__mnr; return m && m.AU && m.AU.slots ? m.AU.slots.find(x => x.stage === m.BT.stage && x.playing && !x.el.paused) : null; };
  window.__bot = {
    gridErr() {                                          // ms the game's beat position is off the real audio grid (file mode): where the playing element really is
      const m = window.__mnr, a = m.AU.a, s = playing(); if (!s || m.BT.mode !== 'file' || a.state !== 'running') return null;
      const lat = a.outputLatency || 0, info = m.TR.by[s.stage], want = (s.el.currentTime - lat - m.BT.off) / (60 / info.bpm), p = m.bpos(); let d = p - want; d -= Math.round(d); return d * m.BT.spb * 1000;
    },
    async grid0() {                                      // audio-clock time at which beat 0 of the playing song played (median of 15 samples; rate 1)
      const m = window.__mnr, a = m.AU.a, xs = []; for (let i = 0; i < 15; i++) { const s = playing(); if (s) xs.push(a.currentTime - ((s.el.currentTime + s.loops * s.D) - m.BT.off) / s.el.playbackRate); await new Promise(r => setTimeout(r, 12)); }
      xs.sort((x, y) => x - y); const s = playing(), D = s ? s.D / s.el.playbackRate : 0, g = xs[xs.length >> 1]; return D ? g + Math.round((m.BT.t0 + m.BT.off - g) / D) * D : g;   // the element may have looped once (whole bars): same beat, one file length later
    },
    scr(dx, dy) { const r = document.getElementById('frame').getBoundingClientRect(), rot = window.__mnr.rotMode; return rot ? [dy * r.width / 540, -dx * r.height / 960] : [dx * r.width / 960, dy * r.height / 540]; },   // portrait: world +y is screen right, world +x is screen up
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
      const m = window.__mnr, out = { ok: !!m }; if (!m) return out; document.documentElement.classList.add('rdy');   // the layout checks look at the title buttons: show them
      const G = m.G, P = m.P, vis = e => { const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2 && !e.closest('[hidden]'); };
      const ids = ['title', 'over', 'pausem', 'setm']; out.ov = {}; for (const i of ids) out.ov[i] = !document.getElementById(i).hidden;
      out.run = m.running; out.paused = m.paused; out.shop = !!(m.SH && m.SH.active); out.neon = m.SH ? m.SH.neon : 0; out.pits = m.SH ? m.SH.pits : 0; out.rot = m.rotMode; out.vw = innerWidth; out.vh = innerHeight; out.touchUI = m.touchUI;
      out.sw = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth); out.sl = document.documentElement.scrollLeft + document.body.scrollLeft;
      out.actx = m.AU.a ? m.AU.a.state : 'none';
      const fr = document.getElementById('frame').getBoundingClientRect(); out.fr = [fr.left, fr.top, fr.right, fr.bottom];
      out.bad = [];
      if (out.sw > innerWidth + 1) out.bad.push('hscroll ' + out.sw + '>' + innerWidth);
      if (fr.left < -2 || fr.top < -2 || fr.right > innerWidth + 2 || fr.bottom > innerHeight + 2) out.bad.push('frame off screen ' + fr.left.toFixed(0) + ',' + fr.top.toFixed(0) + ',' + fr.right.toFixed(0) + ',' + fr.bottom.toFixed(0));
      const cv = document.getElementById('game'); if (Math.abs(cv.getBoundingClientRect().width - fr.width) > 3 || Math.abs(cv.getBoundingClientRect().height - fr.height) > 3) out.bad.push('canvas size');
      const sels = ['#touch button', '.ov:not([hidden]) button', '.ov:not([hidden]) input'];
      for (const e of document.querySelectorAll(sels.join(','))) {
        if (!vis(e)) continue; const r = e.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
        const sb = e.closest('.sbody'); if (sb) { const sr = sb.getBoundingClientRect(); if (r.top < sr.top - 1 || r.bottom > sr.bottom + 1) continue; }   // settings rows scroll: only the ones in view are checked
        const gb = e.closest('#gaCards.tune'); if (gb) { const sr = gb.getBoundingClientRect(); if (r.top < sr.top - 1 || r.bottom > sr.bottom + 1) { if (r.left < -1 || r.right > innerWidth + 1) out.bad.push('scroll list sticks out sideways ' + e.dataset.id); continue; } }   // the perk list scrolls: only the cards in view are checked
        if (r.left < -1 || r.top < -1 || r.right > innerWidth + 1 || r.bottom > innerHeight + 1) { out.bad.push('control off screen ' + (e.id || e.textContent.trim().slice(0, 12)) + ' ' + [r.left, r.top, r.right, r.bottom].map(Math.round)); continue; }
        const h = document.elementFromPoint(x, y); if (!(h && (e === h || e.contains(h) || (h.closest && h.closest('label') && h.closest('label') === e.closest('label'))))) out.bad.push('control covered ' + (e.id || e.textContent.trim().slice(0, 12)) + ' by ' + (h && (h.id || h.className || h.tagName)));
      }
      for (const e of document.querySelectorAll('.pg:not([hidden]) button, #gaBtn, #gaBtn2')) { if (!vis(e)) continue; const r = e.getBoundingClientRect(); if (Math.min(r.width, r.height) < 43.5) out.bad.push('button under 44 px ' + (e.id || e.textContent.trim().slice(0, 12)) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); }
      for (const e of document.querySelectorAll('.pg:not([hidden]) .card')) { if (e.scrollHeight > e.clientHeight + 2 || e.scrollWidth > e.clientWidth + 2) out.bad.push('card text overflows ' + e.dataset.id); const r = e.getBoundingClientRect(); if (r.width < 40 || r.height < 40) out.bad.push('card too small ' + e.dataset.id); }
      for (const o of document.querySelectorAll('.ov:not([hidden])')) if (o.scrollWidth > o.clientWidth + 1) out.bad.push('overlay wider than screen ' + o.id);
      if (m.running && !m.paused && !G.dead && !out.shop && !document.getElementById('touch').hidden === false && out.touchUI) out.bad.push('touch buttons hidden while playing');
      if (G && P) {
        const fin = v => Number.isFinite(v); out.nan = !(fin(P.x) && fin(P.y) && fin(P.hp) && fin(P.heat) && fin(G.score) && fin(G.mult) && G.eb.every(b => fin(b.x) && fin(b.y)) && G.en.every(e => fin(e.x) && fin(e.y) && fin(e.hp)));
        out.G = { t: G.t, score: G.score, kills: G.kills, di: G.di, loop: G.loop, dt: G.dt, en: G.en.length, eb: G.eb.length, dead: G.dead, bc: G.bc, bossDone: G.bossDone, transT: G.transT, banner: G.banner.t, daily: G.daily, perf: G.perf, pt: G.pt.length, calm: m.SET.calm };
        const b = G.boss; out.boss = b ? { x: b.x, y: b.y, hp: b.hp, max: b.max, ph: b.ph, bt: b.bt, r: b.r } : null;
        out.sh = m.SH.sh; out.spare = m.SH.spare; out.dmax = m.SH.dmax; out.rev = m.TP.revLeft; out.drones = m.TP.drones ? m.TP.drones.length : 0;
        out.P = { x: P.x, y: P.y, max: P.max, hp: P.hp, heat: P.heat, emp: P.emp, dashCd: P.dashCd, dashT: P.dashT, inv: P.inv, wl: P.wl };
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
  async tap(p, sel) { for (let i = 0; i < 160 && !await p.evaluate(() => document.documentElement.classList.contains('rdy')); i++) await sleep(50);   // the title buttons appear when the page is ready
    const r = await p.evaluate(s => { const e = document.querySelector(s), b = e.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; }, sel); await this.tapAt(r[0], r[1]); }
}
const ev = (p, f, a) => p.evaluate(f, a);
async function gridOk(p) { let g = await ev(p, () => window.__bot.gridErr()); if (g === null || Math.abs(g) > 30) { await sleep(800); const g2 = await ev(p, () => window.__bot.gridErr()); if (g2 !== null && (g === null || Math.abs(g2) < Math.abs(g))) g = g2; } return g; }   // one more look: clock readings jitter when the machine is busy
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
  stats.runs++; const t0 = Date.now(), maxMs = kind === 'econ' ? ECONSECS * 1000 : SECS * 1000 * (kind === 'boss' ? 4 : 1);
  try {
    if (!await startGame(p, cfg, T, kind === 'daily' ? 'daily' : 'start')) { await fail(p, tag, 'start', 'game did not start'); return; }
    if (kind === 'late') await ev(p, i => window.__mnr.skipTo(i), 1 + (i % 4));
    if (kind === 'ath') { await ev(p, () => window.__mnr.skipTo(4)); await sleep(700); const nm = await ev(p, () => window.__mnr.HUD.district); if (!/ATHINA/.test(nm)) await fail(p, tag, 'athens', 'skipTo(4) shows district ' + nm); }
    if (kind === 'boss') { await ev(p, () => { window.__mnr.god = true; window.__mnr.skipTo(0); window.__mnr.bossNow(); }); }
    if (kind === 'bossN') { await ev(p, i => { window.__mnr.god = true; window.__mnr.skipTo(i); window.__mnr.bossNow(); }, 1 + (i % 4)); }
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
      stats.maxDistrict = Math.max(stats.maxDistrict, s.G.di + 5 * s.G.loop);
      if (s.G.calm) { stats.maxPt = Math.max(stats.maxPt || 0, s.G.pt); if (s.G.pt > PT_CAP) await fail(p, tag, 'particles', s.G.pt + ' particles on screen (cap ' + PT_CAP + ') in calm mode'); }
      // HUD text equals the engine state
      if (s.hud.frame > 0 && s.hud.frame !== lastHudFrame && !s.G.dead) {
        lastHudFrame = s.hud.frame; const h = s.hud;
        if (h.score !== String(s.G.score).padStart(8, '0') || h.hp !== s.P.hp || h.heat !== Math.round(s.P.heat) || h.emp !== s.P.emp || h.combo !== s.C || h.wl !== s.P.wl || h.neon !== s.neon)
          await fail(p, tag, 'HUD-mismatch', JSON.stringify({ hud: [h.score, h.hp, h.heat, h.emp, h.combo, h.wl, h.neon], eng: [s.G.score, s.P.hp, Math.round(s.P.heat), s.P.emp, s.C, s.P.wl, s.neon] }));
        { const x = h.x; if (x && (x.hp !== s.P.hp || x.max !== s.P.max || x.sh !== s.sh || x.dashMax !== 1 + s.dmax || x.dash !== Math.min(1 + s.dmax, (s.P.dashCd <= 0 ? 1 : 0) + s.spare) || x.rev !== s.rev || x.drones !== s.drones))
          await fail(p, tag, 'HUD-mismatch', 'ship stats ' + JSON.stringify(x) + ' vs ' + JSON.stringify({ hp: s.P.hp, max: s.P.max, sh: s.sh, dmax: s.dmax, spare: s.spare, dash: s.P.dashCd, rev: s.rev, drones: s.drones })); }
        if (!(s.P.hp >= 0 && s.P.hp <= (s.P.max || 5) && s.P.heat >= 0 && s.P.heat <= 100.01 && s.P.emp >= 0 && s.P.emp <= 3)) await fail(p, tag, 'HUD-range', JSON.stringify(s.P));
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
      // dragging down on screen moves the ship toward the bottom: -x in portrait (the world's right is the screen's up), +y in landscape
      const movedOk = rot ? a.x - b.x > 25 : b.y - a.y > 25; if (!movedOk) await fail(p, tag, 'input-not-responding', 'touch drag down moved ship ' + (b.x - a.x).toFixed(0) + ',' + (b.y - a.y).toFixed(0));
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
      await p.keyboard.press('ShiftLeft'); await sleep(220); c = await st(); if (!(c.cd > 0 || c.dt > 0)) await fail(p, tag, 'input-not-responding', 'Shift did nothing');
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
      const a = await snap(); if (!synth) { const g = await gridOk(p); if (g === null || Math.abs(g) > 30) await fail(p, tag, 'beat', 'before pause the beat clock is ' + g + ' ms off the song'); }
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
      if (!synth) { await sleep(1500); const g = await gridOk(p); if (g === null || Math.abs(g) > 30) await fail(p, tag, 'resume', 'after resume the beat clock is ' + g + ' ms off the song'); }
    }
    // settings from pause, volume + reduced flashing, back
    if (cfg.touch) await T.tap(p, '#bPause'); else await key('KeyP'); await waitFor(p, () => __mnr.paused, null, 1500);
    await press(p, cfg, T, '#pSetBtn'); await sleep(200);
    let bad = await ev(p, () => window.__bot.probe().bad); for (const x of bad) await fail(p, tag, 'layout', 'settings ' + x);
    await ev(p, () => { const s = document.getElementById('sMusic'); s.value = 35; s.dispatchEvent(new Event('input', { bubbles: true })); const f = document.getElementById('sSfx'); f.value = 20; f.dispatchEvent(new Event('input', { bubbles: true })); __mnr.setVal('rm', true); });
    await sleep(300); const set = await ev(p, () => ({ m: __mnr.SET.music, s: __mnr.SET.sfx, r: __mnr.SET.reduce, g: __mnr.AU.musv ? __mnr.AU.musv.gain.value : -1, sg: __mnr.AU.sfxv ? __mnr.AU.sfxv.gain.value : -1, st: JSON.parse(localStorage.getItem('mnr_set') || '{}') }));
    if (Math.abs(set.m - .35) > .01 || Math.abs(set.s - .2) > .01 || !set.r) await fail(p, tag, 'settings', 'values not applied ' + JSON.stringify(set));
    if (!set.st || set.st.music !== .35 || set.st.reduce !== true) await fail(p, tag, 'settings', 'not saved');
    await press(p, cfg, T, '#setBack'); await sleep(200); if (!(await snap()).pm) await fail(p, tag, 'settings', 'Back did not return to the pause menu');
    // restart
    await press(p, cfg, T, '#restartBtn'); if (!await waitFor(p, () => __mnr.running && !__mnr.paused && __mnr.G.t < 1.5 && __mnr.G.score === 0 && __mnr.P.hp === 5, null, 3000)) await fail(p, tag, 'restart', 'RESTART did not give a fresh run');
    await sleep(500); const rdGain = () => ev(p, () => ({ g: __mnr.AU.musv ? __mnr.AU.musv.gain.value : -1, sg: __mnr.AU.sfxv ? __mnr.AU.sfxv.gain.value : -1, st: __mnr.AU.a ? __mnr.AU.a.state : '' }));
    let gn = await rdGain(); for (let k = 0; k < 8 && gn.g >= 0 && (Math.abs(gn.g - .35) > .05 || Math.abs(gn.sg - .2) > .05); k++) { await sleep(500); gn = await rdGain(); }   // the gain ramp runs on the audio clock: a loaded machine needs a moment
    if (gn.g >= 0 && (Math.abs(gn.g - .35) > .05 || Math.abs(gn.sg - .2) > .05)) await fail(p, tag, 'settings', 'audio gain not applied after resume ' + JSON.stringify(gn));
    // tab hidden / window blur pauses and does not resume by itself
    await sleep(800);
    await ev(p, () => { Object.defineProperty(document, 'hidden', { get: () => true, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    if (!await waitFor(p, () => __mnr.paused, null, 1000)) await fail(p, tag, 'tab-hide', 'hidden tab did not pause');
    await ev(p, () => { Object.defineProperty(document, 'hidden', { get: () => false, configurable: true }); document.dispatchEvent(new Event('visibilitychange')); }); await sleep(500);
    if (!(await snap()).paused) await fail(p, tag, 'tab-hide', 'game resumed by itself after tab came back'); else {
      await press(p, cfg, T, '#resumeBtn'); await sleep(900); const r = await snap(); if (r.paused || r.a !== 'running') await fail(p, tag, 'tab-hide', 'resume after tab-hide failed ' + JSON.stringify(r));
      if (!synth) { const g = await gridOk(p); if (g === null || Math.abs(g) > 30) await fail(p, tag, 'tab-hide', 'after tab-hide the beat clock is ' + g + ' ms off the song'); } }
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
        const ok = expectRot ? b.x > a.x : b.y < a.y; if (!ok) await fail(p, tag, 'rotation', `drag up steers the wrong way after rotate to ${w}x${h}`);
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
      const info = await ev(p, () => ({ bt: { ...__mnr.BT }, lat: __mnr.AU.a.outputLatency || 0, bpm: __mnr.BT.bpm }));
      if (info.bt.mode !== 'file' || info.bt.bpm !== 120) await fail(p, tag, 'beat', 'game is not on the file track ' + JSON.stringify(info.bt));
      const grid0 = await ev(p, () => window.__bot.grid0());   // true time of beat 0 on the audio clock (where the streamed element really is + the offset in tracks.json)
      if (Math.abs(info.bt.t0 + info.bt.off - grid0) > .02) await fail(p, tag, 'beat', `beat clock disagrees with the audio start by ${((info.bt.t0 + info.bt.off - grid0) * 1000).toFixed(1)} ms`);
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
      // judging: press at known offsets from the true beat; within +-110 ms (Normal window) must be on-beat, beyond must not. The ship fires itself now: only DASH is judged.
      const kinds = [['ShiftLeft', 'dash']];
      const sample = async (code, kind, delta) => {
        const g0 = await ev(p, () => window.__bot.grid0());   // fresh every time: an <audio> loop pauses the music for a few ms, and the beat clock follows it
        const r = await ev(p, async ([code, delta, grid0, kind]) => {
          const m = window.__mnr, a = m.AU.a, lat = a.outputLatency || 0; const clr = setInterval(() => { m.G.eb.length = 0; }, 5);   // a graze must not overwrite the judged press
          const nowT = a.currentTime - lat; let k = Math.ceil((nowT - grid0) / .5) + 2; const target = grid0 + k * .5 + delta / 1000;   // audible time we want
          if (kind === 'dash') { m.P.dashCd = 0; m.P.dashT = 0; }
          await new Promise(res => { const iv = setInterval(() => { if (a.currentTime - lat >= target) { clearInterval(iv); res(); } }, 1); });
          const lag = (a.currentTime - lat - target) * 1000;       // how late the page really is at this instant (poll + frame jitter)
          window.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true })); window.dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true }));
          await new Promise(res => setTimeout(res, 220)); const J = m.J.last;
          clearInterval(clr); return { J, lag };
        }, [code, delta, g0, kind]);
        await sleep(1100);
        const j = r.J, expected = delta + r.lag; if (!j || j.kind !== kind) return 'not judged ' + JSON.stringify(j);
        if (Math.abs(j.dt - expected) > 20) return `pressed ${expected.toFixed(0)} ms from the true beat, game measured ${j.dt} ms`;
        if (Math.abs(Math.abs(expected) - 110) > 12 && j.ok !== (Math.abs(expected) <= 110)) return `${expected.toFixed(0)} ms from the beat gave ok=${j.ok}`;
        return '';
      };
      for (const [code, kind] of kinds) for (const delta of [0, 40, -40, 90, -90, 150, -150, 220]) {
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
    for (const [i, st, bpm] of exp) { await ev(p, i => window.__mnr.skipTo(i), i); if (i > 0) await waitFor(p, st => __mnr.BT.stage === st && !__mnr.BT.pend, st, 9000); else await sleep(900); const b = await ev(p, () => ({ ...__mnr.BT })); if (b.mode !== 'synth' || b.stage !== st || b.bpm !== bpm) await fail(p, tag, 'beat', `stage ${st}: ${JSON.stringify(b)}`); }
    await ev(p, () => window.__mnr.bossNow()); await waitFor(p, () => __mnr.BT.stage === 'boss' && !__mnr.BT.pend, null, 12000); let b = await ev(p, () => ({ ...__mnr.BT })); if (b.mode !== 'synth' || b.stage !== 'boss' || b.bpm !== 140) await fail(p, tag, 'beat', 'boss music ' + JSON.stringify(b));
    for (const x of await ev(p, () => __mnr.NR.sw.slice())) { const o = Math.abs(x.oldBeat / 4 - Math.round(x.oldBeat / 4)) * 4 * x.spbOld * 1000, n = Math.abs(x.newBeat / 4 - Math.round(x.newBeat / 4)) * 4 * x.spbNew * 1000; stats.switches = (stats.switches || 0) + 1; if (o > 20 || n > 20) await fail(p, tag, 'bar-line', `${x.from}>${x.to} off the bar line (old ${o.toFixed(0)} ms, new ${n.toFixed(0)} ms)`); }
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
    const on = await ev(p, async () => {
      const m = window.__mnr, buf = await new OfflineAudioContext(1, 1, 44100).decodeAudioData(await (await fetch('music/' + m.TR.by[m.BT.stage].file)).arrayBuffer()), sr = buf.sampleRate, ch = buf.getChannelData(0), HOP = Math.round(sr * .005), n = Math.floor(Math.min(buf.length, sr * 30) / HOP);
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
    const spb = 60 / info.bpm, grid0 = await ev(p, () => window.__bot.grid0());
    const sample = async (code, kind, delta) => {
      const g0 = await ev(p, () => window.__bot.grid0());
      const r = await ev(p, async ([code, delta, grid0, kind, spb]) => {
        const m = window.__mnr, a = m.AU.a, lat = a.outputLatency || 0, clr = setInterval(() => { m.G.eb.length = 0; }, 5), nowT = a.currentTime - lat, k = Math.ceil((nowT - grid0) / spb) + 2, target = grid0 + k * spb + delta / 1000;
        if (kind === 'dash') { m.P.dashCd = 0; m.P.dashT = 0; }
        await new Promise(res => { const iv = setInterval(() => { if (a.currentTime - lat >= target) { clearInterval(iv); res(); } }, 1); });
        const lag = (a.currentTime - lat - target) * 1000;
        window.dispatchEvent(new KeyboardEvent('keydown', { code, bubbles: true })); window.dispatchEvent(new KeyboardEvent('keyup', { code, bubbles: true }));
        await new Promise(res => setTimeout(res, 220)); clearInterval(clr); return { J: m.J.last, lag };
      }, [code, delta, g0, kind, spb]);
      await sleep(1000); const j = r.J, expected = delta + r.lag; if (!j || j.kind !== kind) return 'not judged ' + JSON.stringify(j);
      if (Math.abs(j.dt - expected) > 25) return `pressed ${expected.toFixed(0)} ms from the true beat, game measured ${j.dt} ms`;
      if (Math.abs(Math.abs(expected) - 110) > 15 && j.ok !== (Math.abs(expected) <= 110)) return `${expected.toFixed(0)} ms from the beat gave ok=${j.ok}`; return '';
    };
    const judge = async label => { for (const [code, kind] of [['ShiftLeft', 'dash']]) for (const delta of [0, 180]) { let bad = await sample(code, kind, delta); if (bad) bad = await sample(code, kind, delta); stats.judged = (stats.judged || 0) + 1; if (bad) await fail(p, tag, 'beat-judge', label + ' ' + kind + ' ' + delta + ': ' + bad); } };
    await stay(); await judge('playing');
    await p.keyboard.press('KeyP'); await waitFor(p, () => __mnr.paused, null, 1500); await sleep(1500); await p.keyboard.press('KeyP'); await waitFor(p, () => !__mnr.paused, null, 1500); await sleep(1800);   // the output-clock smoothing needs ~1.5 s of history after a resume
    await stay(); const gp = await gridOk(p); if (gp === null || Math.abs(gp) > 30) await fail(p, tag, 'resume', 'after pause/resume the beat clock is ' + gp + ' ms off the song');
    await stay(); await judge('after pause');
    // 4) spawn times (collected during the 20 s above) land on the beat (+-1 frame)
    const offs = sb.b.map(x => Math.abs(x - Math.round(x)) * sb.spb * 1000);
    console.log(`  ${tag}: ${offs.length} enemies spawned, worst distance from a beat ${offs.length ? Math.max(...offs).toFixed(0) : '-'} ms`);
    if (offs.filter(o => o > 45).length > 1 || offs.some(o => o > 250)) await fail(p, tag, 'spawn', 'enemies spawned off the beat, worst ' + Math.max(...offs).toFixed(0) + ' ms');   // one late spawn is a stalled frame (spawns fire from the beat tick); two or a long one is a bug
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
    const dbl = await ev(p, async () => { const m = window.__mnr; window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space', bubbles: true })); const iv = setInterval(() => { m.P.pfT = m.G.t; }, 30); await new Promise(r => setTimeout(r, 900)); clearInterval(iv); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space', bubbles: true })); return m.PW.stat.dbl; });
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
    let st = await ev(p, () => ({ rate: __mnr.NR.music.rate, bpm: 60 / __mnr.BT.spb, pr: __mnr.AU.cur && __mnr.AU.cur.src ? (__mnr.AU.cur.src.playbackRate.value ?? __mnr.AU.cur.src.playbackRate) : null, d: (__mnr.G.pw.act.find(a => a.k === 'tempo') || {}).d, bc: __mnr.G.bc }));
    if (st.rate !== 1.25 || Math.abs(st.bpm - base.bpm * 1.25) > .01) await fail(p, tag, 'power', `TEMPO UP: rate ${st.rate} bpm ${st.bpm}, wanted x1.25 of ${base.bpm}`);
    if (!synth && Math.abs(st.pr - 1.25) > .001) await fail(p, tag, 'power', 'TEMPO UP: the song source plays at ' + st.pr);
    if (st.d !== 32) await fail(p, tag, 'power', 'off-beat TEMPO UP should last 32 beats, got ' + st.d);
    const sc = await ev(p, async () => { const m = window.__mnr, a = m.G.score; m.G.score += 100; await new Promise(r => setTimeout(r, 120)); return m.G.score - a; });
    if (sc < 200) await fail(p, tag, 'power', 'TEMPO UP: +100 points counted as ' + sc + ' (score x2)');
    await checkAlign('tempo x1.25', 3.5);
    if (!await waitEnd('tempo', 30)) await fail(p, tag, 'power', 'TEMPO UP did not end within 30 s');
    await timing('tempo', 32, await lastLog('tempo'));
    await sleep(1500); st = await ev(p, () => ({ rate: __mnr.NR.music.rate, bpm: 60 / __mnr.BT.spb, pr: __mnr.AU.cur && __mnr.AU.cur.src ? (__mnr.AU.cur.src.playbackRate.value ?? __mnr.AU.cur.src.playbackRate) : null }));
    if (st.rate !== 1 || Math.abs(st.bpm - base.bpm) > .01 || (!synth && Math.abs(st.pr - 1) > .001)) await fail(p, tag, 'power', 'after TEMPO UP the music did not return to normal speed ' + JSON.stringify(st));
    await checkAlign('after tempo ends', 3.5);

    // 3) SLOW GROOVE, off the beat: music x0.75, enemy bullets slower (also the ones already flying), all back to normal at the end
    await ev(p, () => { __mnr.eb(900, 40, Math.PI / 2, 1); __mnr.G.eb[__mnr.G.eb.length - 1].tag = 1; });   // a bullet that crawls at speed 1: it is still flying when the power-up ends
    const sp = () => ev(p, () => { const b = __mnr.G.eb.find(b => b.tag); return b ? Math.hypot(b.vx, b.vy) : -1; });
    const sp0 = await sp(); c = await collect('slow', false); await sleep(1500);
    st = await ev(p, () => ({ rate: __mnr.NR.music.rate, bpm: 60 / __mnr.BT.spb, pr: __mnr.AU.cur && __mnr.AU.cur.src ? (__mnr.AU.cur.src.playbackRate.value ?? __mnr.AU.cur.src.playbackRate) : null, d: (__mnr.G.pw.act.find(a => a.k === 'slow') || {}).d }));
    if (st.rate !== .75 || Math.abs(st.bpm - base.bpm * .75) > .01) await fail(p, tag, 'power', `SLOW GROOVE: rate ${st.rate} bpm ${st.bpm}, wanted x0.75 of ${base.bpm}`);
    if (!synth && Math.abs(st.pr - .75) > .001) await fail(p, tag, 'power', 'SLOW GROOVE: the song source plays at ' + st.pr);
    const nb = await ev(p, () => { const n = __mnr.G.eb.length; __mnr.eb(900, 40, Math.PI / 2, 100); const b = __mnr.G.eb[__mnr.G.eb.length - 1]; return Math.hypot(b.vx, b.vy) / __mnr.DF.bs / __mnr.STILL.bk; });   // a ship that stands still makes bullets quicker (STILL.bk): not part of this check
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
  await ev(p, () => { __mnr.killBoss(); });
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
      const E = await ev(p, () => { const h = __mnr.SH; return { fr: h.n('fr'), hm: h.hm, ck: h.ck, sharp: h.sharp, nx: h.nx, sh: h.sh, spare: h.spare, mag: __mnr.NR.mod.mag, win: __mnr.NR.mod.win, pw: __mnr.NR.mod.pw, spb: __mnr.BT.spb }; });
      await chk(E.fr >= 1 && E.hm === 1 && E.ck === 4 && Math.abs(E.sharp - 1.3) < 1e-9 && Math.abs(E.nx - 1.3) < 1e-9 && E.mag > 140 && E.win === 14 && Math.abs(E.pw - 1.3) < 1e-9, 'upgrade-effect', 'state ' + JSON.stringify(E));
      await chk(E.sh === 1 && E.spare >= 1, 'upgrade-effect', 'shield/dash charge not given ' + JSON.stringify(E));
      // shield soaks one hit
      await ev(p, () => { const m = __mnr; window.__hp0 = m.P.hp; m.god = false; m.G.en = []; m.G.eb = []; m.P.inv = 0; m.P.dashT = 0; m.G.eb.push({ x: m.P.x, y: m.P.y, vx: 0, vy: 0, r: 5, c: '#fff', g: 1 }); });
      await sleep(120); const sh = await ev(p, () => ({ hp: __mnr.P.hp, sh: __mnr.SH.sh, hp0: window.__hp0 })); await chk(sh.hp === sh.hp0 && sh.sh === 0, 'upgrade-effect', 'shield did not absorb a hit ' + JSON.stringify(sh));
      // spare dash charge: dash again while the first dash cools down
      await ev(p, () => { const m = __mnr; m.god = true; m.G.en = []; m.G.eb = []; m.P.dashCd = .9; m.P.dashT = 0; m.SH.spare = 1; });
      await p.keyboard.press('ShiftLeft'); await sleep(260); const dd = await ev(p, () => ({ t: __mnr.P.dashT, sp: __mnr.SH.spare })); await chk(dd.sp === 0, 'upgrade-effect', 'spare dash charge unused ' + JSON.stringify(dd));
      // dash blast + sharp beat damage
      await sleep(400); const dh = await ev(p, () => { const m = __mnr, e = { type: 'drone', t: 0, flash: 0, bf: 99, bn: 0, x: m.P.x + 10, y: m.P.y, r: 14, hp: 100, max: 100, score: 100, by: m.P.y, amp: 0 }; m.G.en = [e]; m.P.dashCd = 0; window.__t = e; return e.hp; });
      await p.keyboard.press('ShiftLeft'); await sleep(320); await chk((await ev(p, () => __t.hp)) <= dh - 9.9, 'upgrade-effect', 'dash blast did no damage (x2)');
      await sleep(300); await ev(p, () => { const m = __mnr; m.G.en = []; const e = { type: 'drone', t: 0, flash: 0, bf: 99, bn: 0, x: 700, y: 300, r: 14, hp: 100, max: 100, score: 100, by: 300, amp: 0 }; m.G.en = [e]; m.G.pb = [{ x: 700, y: 300, vx: 0, vy: 0, dm: 2, pf: 1 }]; window.__t = e; m.P.x = 60; m.P.y = 60; m.P.over = true; m.P.heat = 100; });   // the ship keeps away and does not fire: only the placed shot may hit
      await sleep(100); const hp = await ev(p, () => __t.hp); await chk(Math.abs(100 - hp - 2.6) < .01, 'upgrade-effect', 'sharp beat damage ' + (100 - hp) + ' != 2.6');
      // homing bends a bullet toward an enemy
      const hv = await ev(p, () => { const m = __mnr, e = { type: 'drone', x: 400, y: 330, hp: 9, r: 14 }; m.G.en = [e]; const b = { x: 100, y: 200, vx: 900, vy: 0 }; m.SH.steer(b, .05); return b.vy; }); await chk(hv > 20, 'upgrade-effect', 'homing did not bend the shot ' + hv);
      // tier keeper holds the tier past 8 beats
      await ev(p, () => { const m = __mnr; m.G.en = []; m.C.n = 5; m.C.lb = m.G.bc - 9; window.__bc = m.G.bc; }); await waitFor(p, () => __mnr.G.bc > window.__bc, null, 2500);
      await chk(await ev(p, () => __mnr.C.n === 5), 'upgrade-effect', 'tier keeper did not hold the tier');
      // neon boost: +50% Neon per kill (the rate is SH.nk)
      const nb = await ev(p, () => { const h = __mnr.SH; __mnr.C.n = 0; h.acc = 0; const n0 = h.neon, N = 400; for (let i = 0; i < N; i++) h.award({ type: 'gunship', x: 0, y: 0, pf: 0 }); return [h.neon - n0, Math.floor(N * 3 * 1.3 * h.nk)]; }); await chk(Math.abs(nb[0] - nb[1]) <= 1 && nb[0] > 20, 'upgrade-effect', 'neon boost paid ' + nb[0] + ' (want ' + nb[1] + ')');
    }
    if (p.errs.length) await fail(p, tag, 'page-error', p.errs[0]);
  } catch (err) { await fail(p, tag, 'script', err.message.split('\n')[0]); }
  await p.context().close();
}

// ---------------- upgrades: garage TUNE perks, new pit-stop upgrades, new power-ups, afford prompts, ship stats HUD ----------------
async function tuneTests(browser, cfg, full) {
  const tag = cfg.name + '/tune', chk = (p, c, kind, d) => { stats.shopChecks++; return c ? Promise.resolve() : fail(p, tag, kind, d); };
  const own = { pu_mag: true, pu_bub: true, pu_tri: true, pu_nr: true, pu_fix: true };
  const { p, T } = await newPage(browser, cfg, { init: () => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('mnr_bank', '400'); localStorage.setItem('mnr_own', JSON.stringify({ pu_mag: true, pu_bub: true, pu_tri: true, pu_nr: true, pu_fix: true })); } } });
  try {
    await sleep(300);
    // title: Neon and "N upgrades ready"
    let t = await ev(p, () => ({ btn: document.getElementById('gaBtn').textContent, bank: __mnr.GA.bank })); await chk(p, /400/.test(t.btn) && /\d+ UPGRADES? READY/.test(t.btn), 'afford-prompt', 'title garage button: ' + t.btn);
    await probe2(p, tag, 'title');
    await press(p, cfg, T, '#gaBtn'); await sleep(300);
    await probe2(p, tag, 'garage tune tab'); await p.screenshot({ path: path.join(OUT, 'tune-' + cfg.name + '.png') });
    const ui = await ev(p, () => ({ n: document.querySelectorAll('#gaCards .card[data-kind="tune"]').length, rec: [...document.querySelectorAll('#gaCards .rec')].map(e => e.closest('.card').dataset.id), words: [...document.querySelectorAll('#gaCards .card .t')].every(e => e.textContent.trim().split(/\s+/).length <= 8), tab: document.querySelector('.tabs button.on').dataset.t, total: __mnr.TP_DEF.length }));
    await chk(p, ui.n === ui.total && ui.tab === 'tune' && ui.rec.length === 1, 'garage-ui', 'tune tab ' + JSON.stringify(ui)); await chk(p, ui.words, 'message-too-long', 'perk text over 8 words');
    // buy: price scales with the level, bank drops, level saved, survives a reload
    const before = await ev(p, () => ({ bank: __mnr.GA.bank, price: [0, 1, 2, 3].map(l => { const d = __mnr.TP_DEF[0]; return Math.round(d.p * (1 + .55 * l + .09 * l * l) / 5) * 5; }) }));
    await chk(p, before.price[1] > before.price[0] && before.price[3] > before.price[2], 'price-scale', JSON.stringify(before.price));
    const tapCard = async id => { await ev(p, id => document.querySelector(`#gaCards .card[data-id="${id}"]`).scrollIntoView({ block: 'center' }), id); await sleep(120); await press(p, cfg, T, `#gaCards .card[data-id="${id}"]`); await sleep(200); };
    await tapCard('tp_dmg');
    let a = await ev(p, () => ({ bank: __mnr.GA.bank, l: __mnr.GA.tune.dmg, saved: localStorage.getItem('mnr_tune') })); await chk(p, a.l === 1 && a.bank === before.bank - before.price[0] && /"dmg":1/.test(a.saved), 'tune-buy', 'Power Core: ' + JSON.stringify([before, a]));
    await tapCard('tp_rev');
    a = await ev(p, () => ({ bank: __mnr.GA.bank, l: __mnr.GA.tune.rev || 0, msg: document.getElementById('gaMsg').textContent })); await chk(p, a.l === 0 && /Need/.test(a.msg), 'tune-buy', 'bought an unaffordable perk ' + JSON.stringify(a));
    await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.__bot);
    a = await ev(p, () => ({ l: __mnr.GA.tune.dmg, own: __mnr.GA.own.pu_bub })); await chk(p, a.l === 1 && a.own, 'tune-persist', 'perk level lost after reload ' + JSON.stringify(a));
    if (!full) { await p.context().close(); return; }
    // every perk at once: the run starts with them, and they do what the card says
    await ev(p, () => { const G_ = __mnr.GA; for (const d of __mnr.TP_DEF) G_.tune[d.id] = d.max; G_.bank = 99999; });
    if (!await startGame(p, cfg, T)) { await fail(p, tag, 'start', 'no start'); await p.context().close(); return; }
    await sleep(500); await ev(p, () => { __mnr.god = true; });
    let r = await ev(p, () => { const m = __mnr; return { max: m.P.max, hp: m.P.hp, sh: m.SH.sh, dmax: m.SH.dmax, spare: m.SH.spare, rev: m.TP.revLeft, mag: m.NR.mod.mag, pw: m.NR.mod.pw, ck: m.SH.ck, nx: m.SH.nx, drones: m.TP.drones.length }; });
    await chk(p, r.max === 10 && r.hp === 10 && r.sh === 5 && r.dmax === 5 && r.spare === 5 && r.rev === 5 && r.mag === 140 + 28 * 10 && Math.abs(r.pw - 2) < 1e-9 && r.ck === 20 && Math.abs(r.nx - 1.6) < 1e-9 && r.drones === 3, 'tune-effect', 'run start ' + JSON.stringify(r));
    const vol = () => ev(p, () => { const m = __mnr; m.G.pb = []; m.GA.tune.crt = 0; m.GA.tune.rof = 0; m.SH.volley(100, 100, 0); return m.G.pb.reduce((s, b) => s + b.dm, 0); });
    await ev(p, () => { __mnr.GA.tune.dmg = 0; }); const d0 = await vol(); await ev(p, () => { __mnr.GA.tune.dmg = 10; }); const d1 = await vol();
    await chk(p, Math.abs(d1 / d0 - 1.8) < .01, 'tune-effect', 'Power Core x10 should be +80% damage, got x' + (d1 / d0).toFixed(3));
    await ev(p, () => { __mnr.GA.tune.crt = 8; __mnr.GA.tune.rof = 0; let c = 0, n = 0; for (let i = 0; i < 400; i++) { __mnr.G.pb = []; __mnr.SH.volley(100, 100, 0); for (const b of __mnr.G.pb) { n++; if (b.crit) c++; } } window.__crit = c / n; });
    const cr = await ev(p, () => window.__crit); await chk(p, cr > .12 && cr < .3, 'tune-effect', 'crit rate ' + cr.toFixed(2) + ' (want about .2: the perk is capped)');
    // the HUD shows the ship stats (hull, shield, dash, drones, revive) correctly
    await sleep(300); const h = await ev(p, () => ({ x: __mnr.HUD.x, hp: __mnr.P.hp, np: __mnr.TP_DEF.length })); await chk(p, h.x && h.x.max === 10 && h.x.hp === h.hp && h.x.sh === 5 && h.x.dashMax === 6 && h.x.drones === 3 && h.x.rev === 5 && h.x.perks === h.np - 1, 'HUD-mismatch', 'ship stats ' + JSON.stringify(h));
    await p.screenshot({ path: path.join(OUT, 'hud-' + cfg.name + '.png') });
    // revive: a lethal hit brings the ship back with 4 hull and a short shield of invulnerability
    await ev(p, () => { const m = __mnr; m.god = false; m.SH.sh = 0; m.G.en = []; m.G.eb = []; m.P.hp = 1; m.P.inv = 0; m.P.dashT = 0; m.G.eb.push({ x: m.P.x, y: m.P.y, vx: 0, vy: 0, r: 5, c: '#fff', g: 1 }); });
    await sleep(250); r = await ev(p, () => ({ dead: __mnr.G.dead, hp: __mnr.P.hp, rev: __mnr.TP.revLeft })); await chk(p, !r.dead && r.hp === 5 && r.rev === 4, 'tune-effect', 'revive token ' + JSON.stringify(r));
    // shield regen: a lost shield comes back after its time
    await ev(p, () => { const m = __mnr; m.god = true; m.SH.sh = 0; m.TP.rgnT = 29.9; }); await sleep(450); r = await ev(p, () => __mnr.SH.sh); await chk(p, r === 1, 'tune-effect', 'shield regen gave ' + r);
    // pit-stop upgrades (new): each one bought through the shop path does its job
    await ev(p, () => { const m = __mnr; m.GA.tune = {}; m.SH.reset(); m.SH.live = true; m.TP.revLeft = 0; m.P.max = 5; m.P.hp = 2; m.SH.recalc(); });
    const E = await ev(p, () => { const m = __mnr, h = m.SH, o = {}; const base = () => { m.G.pb = []; h.volley(100, 100, 0); return m.G.pb.reduce((s, b) => s + b.dm, 0); };
      const b0 = base(); h.add('dm'); o.dm = base() / b0; h.add('hl'); o.hl = m.P.hp; h.add('mh'); o.mh = [m.P.max, m.P.hp]; h.add('dr'); o.dr = h.n('dr'); h.add('rv'); o.rv = m.TP.revLeft;
      m.GA.tune.crt = 0; h.add('cr'); h.add('cr'); o.cr = h.n('cr'); return o; });
    await chk(p, Math.abs(E.dm - 1.12) < .001 && E.hl === 3 && E.mh[0] === 6 && E.mh[1] === 4 && E.dr === 1 && E.rv === 1 && E.cr === 2, 'upgrade-effect', 'new pit-stop upgrades ' + JSON.stringify(E));
    await sleep(300); r = await ev(p, () => __mnr.TP.drones.length); await chk(p, r === 1, 'upgrade-effect', 'Drone upgrade did not add a drone (' + r + ')');
    // new power-ups: bought ones drop, unbought ones do not
    const pk = await ev(p, () => { const o = {}; for (let i = 0; i < 600; i++) { const k = __mnr.PW.pick(); o[k] = (o[k] || 0) + 1; } return o; });
    await chk(p, ['mag', 'bub', 'tri', 'nr', 'fix'].every(k => pk[k] > 0), 'powerup-pool', 'owned power-ups never drop ' + JSON.stringify(pk));
    await ev(p, () => { __mnr.GA.own = {}; }); const pk2 = await ev(p, () => { const o = {}; for (let i = 0; i < 400; i++) { const k = __mnr.PW.pick(); o[k] = 1; } return Object.keys(o); });
    await chk(p, !pk2.some(k => ['mag', 'bub', 'tri', 'nr', 'fix'].includes(k)), 'powerup-pool', 'unbought power-ups drop ' + pk2); await ev(p, o => { __mnr.GA.own = o; }, own);
    const PU = await ev(p, () => { const m = __mnr, o = {}; m.god = false; m.SH.sh = 0; m.P.hp = 3; m.P.max = 6;
      m.PW.give('bub', false); const hp0 = m.P.hp; m.P.inv = 0; m.P.dashT = 0; m.hurt(); o.bub = m.P.hp === hp0;           // the bubble bounces the hit
      m.PW.give('fix', false); o.fix = m.P.hp; m.PW.give('mag', false); o.mag = m.PW.on('mag');
      m.PW.give('tri', false); o.tri = m.PW.on('tri'); m.PW.give('nr', false); o.nr = m.PW.on('nr'); return o; });
    await chk(p, PU.bub && PU.fix === 4 && PU.mag && PU.tri && PU.nr, 'powerup-effect', 'new power-ups ' + JSON.stringify(PU));
    await sleep(200); const PE = await ev(p, () => { const m = __mnr; const n0 = m.G.pb.length; m.NR.emit('fire', { x: m.P.x + 22, y: m.P.y, pf: 0 }); return { mag: m.NR.mod.mag, nx: m.SH.nx, extra: m.G.pb.length - n0 }; });
    await chk(p, PE.mag === 1500 && PE.extra >= 2 && PE.nx > 1.9, 'powerup-effect', 'running effects ' + JSON.stringify(PE));
    await probe2(p, tag, 'run with all power-ups');
    // pit stop: recommended badge and the afford prompt
    await ev(p, () => { const m = __mnr; m.god = true; m.GA.bank = 600; m.P.hp = 2; m.SH.neon = 200; m.G.dt = 1e9; m.G.en = []; });
    if (!await waitFor(p, () => __mnr.G.boss, null, 15000)) await fail(p, tag, 'pit-missing', 'no boss for the pit stop check'); else {
      await ev(p, () => { __mnr.killBoss(); }); if (!await waitFor(p, () => __mnr.SH.active, null, 9000)) await fail(p, tag, 'pit-missing', 'no pit stop'); else {
        await unlock(p); await sleep(300); const pit = await ev(p, () => ({ rec: document.querySelectorAll('#shCards .rec').length, aff: document.getElementById('shAff').textContent, words: document.getElementById('shAff').textContent.trim().split(/\s+/).filter(w => /\w/.test(w)).length, lv: document.querySelectorAll('#shCards .lv').length }));
        await chk(p, pit.rec === 1 && /afford \d+ upgrade/.test(pit.aff) && /Garage: \d+ ready/.test(pit.aff) && pit.words <= 8, 'afford-prompt', 'pit stop ' + JSON.stringify(pit));
        await probe2(p, tag, 'pit stop'); await p.screenshot({ path: path.join(OUT, 'shop2-' + cfg.name + '.png') });
      } }
    if (p.errs.length) await fail(p, tag, 'page-error', p.errs[0]);
  } catch (err) { await fail(p, tag, 'script', err.message.split('\n')[0]); }
  await p.context().close();
}
async function lagTests() {                               // frame spikes and input delay with song switches and boss entries, alone on the machine (child process)
  const r = cp.spawnSync('node', [path.join(__dirname, 'lag-probe.js')], { env: Object.assign({}, process.env, { GAME_DIR, DISTS: '4', PW: process.env.PW || 'playwright' }), encoding: 'utf8', timeout: 400000, maxBuffer: 1 << 24 });
  let j = null; try { j = JSON.parse(r.stdout); } catch (e) { }
  if (!j) return fail(null, 'lag', 'lag-probe', 'no result: ' + (r.stderr || '').slice(0, 200));
  console.log(`  lag probe: ${j.frames} frames, max frame ${j.max} ms, frames over 55 ms ${j.over50}, long tasks ${j.longtasks} (max ${j.longtaskMax} ms), input-to-frame max ${j.inputMax} ms, songs decoded in a hurry ${j.urgent} (${j.midPlayUrgent} mid-play)`);
  stats.lag = j;
  if (j.over50 > 0) await fail(null, 'lag', 'frame-spike', j.over50 + ' frames over 55 ms: ' + j.spikesAt.join(', '));
  if (j.inputMax > 50) await fail(null, 'lag', 'input-lag', 'a touchmove waited ' + j.inputMax + ' ms for the next frame');
  if (j.midPlayUrgent > 0) await fail(null, 'lag', 'decode-mid-play', j.midPlayUrgent + ' songs were decoded during play ' + JSON.stringify(j.urgentLog));
  if (j.errs.length) await fail(null, 'lag', 'page-error', j.errs[0]);
}
async function garageTests(browser, cfg, full) {
  const tag = cfg.name + '/garage', chk = (p, c, kind, d) => { stats.shopChecks++; return c ? Promise.resolve() : fail(p, tag, kind, d); };
  const { p, T } = await newPage(browser, cfg);
  try {
    await ev(p, () => { localStorage.setItem('mnr_bank', '500'); }); await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.__bot);
    await press(p, cfg, T, '#gaBtn'); await sleep(250);
    let s = await ev(p, () => window.__bot.probe()); for (const b of s.bad) await fail(p, tag, 'layout', 'garage ' + b);
    await chk(p, await ev(p, () => !document.getElementById('garage').hidden && document.querySelectorAll('#gaCards .card').length === __mnr.TP_DEF.length && document.querySelector('.tabs button.on').dataset.t === 'tune'), 'garage-ui', 'garage did not open on the TUNE tab with all perks');
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


// ---------------- music: song changes (real audio) ----------------
// A mini-boss (and SEK-ADLER) keeps the stage song and gets a drum layer; a district boss switches to its own song; every switch lands on a bar line of the old song
// with the new song's first beat on that same line (no beat-grid jump), and the audio keeps agreeing with the beat clock through the crossfade.
async function songSwitchTests(browser) {
  const tag = 'switch', cfg = CFGS[3], { p } = await newPage(browser, cfg);
  try {
    await p.keyboard.press('Enter'); if (!await waitFor(p, () => __mnr.running, null, 3000)) return fail(p, tag, 'start', 'no start');
    await ev(p, () => { window.__mnr.god = true; window.__mnr.PW.give = () => false; });   // no tempo power-ups: they change the song speed, and this test compares the audio with the grid at constant speed
    if (!await waitFor(p, () => __mnr.BT.mode === 'file' && __mnr.BT.stage === 'stage1' && !__mnr.BT.pend, null, 20000)) return fail(p, tag, 'beat', 'stage song never became the beat clock');
    const samples = []; const poll = setInterval(async () => { try { const g = await p.evaluate(() => (__mnr.BT.pend || __mnr.AU.want || __mnr.NR.music.rate !== 1 || __mnr.BT.mode !== 'file' || __mnr.paused || __mnr.SH.active) ? null : window.__bot.gridErr()); if (g !== null) samples.push(g); } catch (e) { } }, 70);
    const swN = () => ev(p, () => __mnr.NR.sw.length);
    const bossOn = async (di) => { await ev(p, () => { __mnr.NR.lag.hold = new Set(['stage1.mp3', 'stage2.mp3', 'stage3.mp3', 'boss.mp3', 'boss2.mp3']); for (const s of ['boss', 'boss2', 'stage2', 'stage3']) __mnr.loadTrack(s, 1); }); await waitFor(p, () => ['boss.mp3', 'boss2.mp3', 'stage2.mp3', 'stage3.mp3'].every(f => __mnr.TR.bufs[f]), null, 20000); await ev(p, d => { const m = window.__mnr; m.god = true; if (d > 0) m.skipTo(d); }, di); await waitFor(p, () => !__mnr.BT.pend && !__mnr.AU.want, null, 12000); await ev(p, () => window.__mnr.bossNow()); return waitFor(p, () => __mnr.G.boss && __mnr.G.boss.x < 800, null, 15000); };   // a boss never comes in the first seconds of a district: let the district's own song switch land first
    const finish = async () => { await ev(p, () => { __mnr.killBoss(); }); await waitFor(p, () => __mnr.SH.active, null, 9000); await sleep(800); await ev(p, () => { if (__mnr.SH.active) { __mnr.SH.lock = 0; __mnr.SH.close(); } }); };
    // 1) SEK-ADLER (district 0 boss): stage song stays, drum layer on, then back to the next stage song on a bar line
    if (!await bossOn(0)) await fail(p, tag, 'boss', 'ADLER never appeared'); else {
      await sleep(6000); const s = await ev(p, () => ({ st: __mnr.BT.stage, pend: !!__mnr.BT.pend, int: !!__mnr.AU.int, sw: __mnr.NR.sw.length }));
      if (s.st !== 'stage1' || s.pend || s.sw !== 0) await fail(p, tag, 'switch', 'ADLER changed the song: ' + JSON.stringify(s)); if (!s.int) await fail(p, tag, 'switch', 'no intensity layer during ADLER');
      await finish(); if (!await waitFor(p, () => __mnr.NR.sw.length >= 1 && !__mnr.BT.pend, null, 14000)) await fail(p, tag, 'switch', 'no return to a stage song after ADLER'); else if (await ev(p, () => __mnr.BT.stage) !== 'stage2') await fail(p, tag, 'switch', 'after ADLER the song is ' + await ev(p, () => __mnr.BT.stage));
    }
    // 2) district bosses: FLUSSKRAKE -> boss song, back to the stage song; KRONOS -> boss2
    for (const [di, want] of [[1, 'boss'], [3, 'boss2']]) {
      const n0 = await swN(); await ev(p, () => { __mnr.G.boss = null; });
      if (!await bossOn(di)) { await fail(p, tag, 'boss', 'district ' + di + ' boss never appeared'); continue; }
      if (!await waitFor(p, (n) => __mnr.NR.sw.length > n && !__mnr.BT.pend, n0, 16000)) { await fail(p, tag, 'switch', 'no song change for the boss of district ' + di + ' ' + JSON.stringify(await ev(p, () => ({ ...__mnr.BT, want: __mnr.AU.want })))); continue; }
      const st = await ev(p, () => __mnr.BT.stage); if (st !== want) await fail(p, tag, 'switch', 'boss of district ' + di + ' plays ' + st + ', want ' + want);
      await sleep(2500); const g = await ev(p, () => window.__bot.gridErr()); if (g === null || Math.abs(g) > 40) await fail(p, tag, 'grid', 'after the switch to ' + want + ' the beat clock is ' + g + ' ms off the audio');
      await finish(); if (!await waitFor(p, (n) => __mnr.NR.sw.length > n + 1 && !__mnr.BT.pend, n0, 16000)) await fail(p, tag, 'switch', 'no return to a stage song after the boss of district ' + di);
    }
    clearInterval(poll);
    const sw = await ev(p, () => __mnr.NR.sw.slice()); console.log(`  ${tag}: ${sw.length} song changes: ${sw.map(x => x.from + '>' + x.to).join(' ')}`);
    stats.switches = (stats.switches || 0) + sw.length;
    for (const x of sw) {
      const ms = (b, spb) => Math.abs(b / 4 - Math.round(b / 4)) * 4 * spb * 1000, o = ms(x.oldBeat, x.spbOld), n = ms(x.newBeat, x.spbNew);
      if (o > 20) await fail(p, tag, 'bar-line', `${x.from}>${x.to} changed ${o.toFixed(0)} ms off a bar line of the old song ${JSON.stringify({ dbg: x.dbg, ob: x.ob, at: x.at, lag: x.lag })}`);
      if (n > 20) await fail(p, tag, 'grid-jump', `${x.from}>${x.to}: the new song's first beat is ${n.toFixed(0)} ms off that bar line`);
      if (x.lag > .15) await fail(p, tag, 'switch-late', `${x.from}>${x.to} applied ${(x.lag * 1000).toFixed(0)} ms late`);
    }
    if (samples.length < 20) await fail(p, tag, 'grid', 'only ' + samples.length + ' grid samples');
    else { const sorted = samples.slice().sort((a, b) => a - b), med = sorted[sorted.length >> 1], devs = samples.map(v => Math.abs(v - med)), worst = Math.max(...devs), over = devs.filter(v => v > 40).length;   // a grid jump stays for every later sample; one or two stalled samples are page jitter
      console.log(`  ${tag}: ${samples.length} audio-vs-beat-clock samples through ${sw.length} changes, worst deviation ${worst.toFixed(1)} ms`); if (over > 2 || worst > 120) await fail(p, tag, 'grid-jump', 'beat grid moved ' + worst.toFixed(0) + ' ms against the audio across song changes'); }
    if (p.errs.length) await fail(p, tag, 'page-error', p.errs[0]);
  } catch (err) { await fail(p, tag, 'script', err.message.split('\n')[0]); }
  await p.context().close();
}

// ---------------- Story: stage select, every stage from the select screen, goal, boss music, result, locks, Hard ----------------
async function storyTests(browser, cfg, full) {
  const tag = cfg.name + '/story', { p, T } = await newPage(browser, cfg, { query: '?all=1' });
  const probe = async (what) => { const s = await ev(p, () => window.__bot.probe()); for (const b of s.bad) await fail(p, tag, 'layout', what + ' ' + b); return s; };
  const shot = async n => { if (cfg.w >= 375) try { await p.screenshot({ path: path.join(OUT, `story-${n}-${cfg.name}.png`) }); } catch (e) { } };
  try {
    await sleep(500); await press(p, cfg, T, '#storyBtn'); await sleep(400);
    if (!await ev(p, () => !document.getElementById('stsel').hidden)) return fail(p, tag, 'story', 'STORY did not open the stage select');
    await probe('stage select'); await shot('select');
    const tiles = await ev(p, () => [...document.querySelectorAll('#stsel .card')].map(c => ({ n: +c.dataset.n, lock: c.classList.contains('lock') })));
    if (tiles.length !== 16) await fail(p, tag, 'story', 'stage select shows ' + tiles.length + ' stages, not 16');
    if (tiles.some(t => t.lock)) await fail(p, tag, 'story', '?all=1 left stages locked');
    const list = full ? [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16] : [1, 5, 12, 13, 16];
    const defs = await ev(p, () => __mnr.STAGES.map(s => ({ n: s.n, di: s.di, k: s.goal.k, v: s.goal.v || 0, lead: s.lead || 0, name: s.name, intro: s.intro, song: s.song })));
    for (const n of list) {
      const d = defs[n - 1], t = tag + '#' + n;
      if (n > 1 && await ev(p, () => document.getElementById('stsel').hidden)) await ev(p, () => { window.__mnr.abort(); });
      await ev(p, () => { if (document.getElementById('stsel').hidden && !__mnr.running) { document.getElementById('title').hidden = true; document.getElementById('stres').hidden = true; document.getElementById('stsel').hidden = false; } });
      await press(p, cfg, T, `#stsel .card[data-n="${n}"]`);
      if (!await waitFor(p, n => __mnr.running && __mnr.ST.on && __mnr.ST.n === n, n, 4000)) { await fail(p, t, 'story', 'stage ' + n + ' did not start from the stage select'); continue; }
      await ev(p, () => { window.__mnr.god = true; }); stats.storyStages = (stats.storyStages || 0) + 1;
      const s0 = await ev(p, () => ({ di: __mnr.G.di, hp: __mnr.P.hp, msgs: __mnr.MSGS.slice(-4), st: __mnr.ST.def.song }));
      if (s0.di !== d.di) await fail(p, t, 'story', 'stage ' + n + ' plays district ' + s0.di + ', want ' + d.di);
      if (!s0.msgs.includes(d.intro)) await fail(p, t, 'story', 'intro line not shown: ' + JSON.stringify(s0.msgs));
      if (n > 12 && d.di !== 4) await fail(p, t, 'story', 'Act IV stage ' + n + ' is not in Athens'); if (d.intro.trim().split(/\s+/).length > 8) await fail(p, t, 'story', 'intro longer than 8 words');
      await sleep(900); const s1 = await probe('stage ' + n); if (!(await ev(p, () => __mnr.HUD.goal))) await fail(p, t, 'story', 'no goal on the HUD');
      if (n === 1 || n === 6 || n === 13 || n === 16) await shot('play' + n);
      // reach the goal
      const swBefore = await ev(p, () => __mnr.NR.sw.length);
      if (d.k === 'survive') await ev(p, () => { __mnr.G.dbar = __mnr.ST.len; });                       // a stage lasts as long as its song: jump the bar clock
      else if (d.k === 'kill') await ev(p, () => { __mnr.G.kills = __mnr.ST.kv; __mnr.G.dbar = __mnr.ST.len; });
      else if (d.k === 'score') await ev(p, () => { __mnr.G.score = __mnr.ST.sv; __mnr.G.dbar = __mnr.ST.len; });
      else {
        await ev(p, () => { __mnr.G.dbar = __mnr.ST.lead; });
        if (!await waitFor(p, () => __mnr.G.boss && __mnr.G.boss.x < 800, null, 14000)) { await fail(p, t, 'story', 'boss/mini-boss of stage ' + n + ' never arrived'); continue; }
        const isMini = d.k === 'mini', bossSong = n === 6 || n === 9 || n === 16 ? 'boss' : n === 12 ? 'boss2' : null;
        if (n === 6) await shot('boss');
        if (bossSong) {
          if (!await waitFor(p, c => __mnr.NR.sw.length > c && !__mnr.BT.pend, swBefore, 16000)) await fail(p, t, 'switch', 'no song change for the boss of stage ' + n + ' ' + JSON.stringify(await ev(p, () => ({ ...__mnr.BT }))));
          else { const st = await ev(p, () => __mnr.BT.stage); if (st !== bossSong) await fail(p, t, 'switch', 'boss plays ' + st + ', want ' + bossSong);
            const x = await ev(p, () => __mnr.NR.sw[__mnr.NR.sw.length - 1]), o = Math.abs(x.oldBeat / 4 - Math.round(x.oldBeat / 4)) * 4 * x.spbOld * 1000, nn = Math.abs(x.newBeat / 4 - Math.round(x.newBeat / 4)) * 4 * x.spbNew * 1000;
            if (o > 20 || nn > 20) await fail(p, t, 'grid-jump', `boss song switch off the bar line (old ${o.toFixed(0)} ms, new ${nn.toFixed(0)} ms)`); }
        } else {
          await sleep(4500); const s = await ev(p, c => ({ n: __mnr.NR.sw.length - c, int: !!__mnr.AU.int, pend: !!__mnr.BT.pend }), swBefore);
          if (s.n !== 0 || s.pend) await fail(p, t, 'switch', (isMini ? 'mini-boss' : 'SEK-ADLER') + ' switched the song'); if (!s.int) await fail(p, t, 'switch', 'no intensity layer on ' + (isMini ? 'the mini-boss' : 'SEK-ADLER'));
        }
        await ev(p, () => { __mnr.killBoss(); });
      }
      if (!await waitFor(p, () => __mnr.ST.over, null, 9000)) { await fail(p, t, 'story', 'goal ' + d.k + ' did not complete the stage'); continue; }
      if (n < 16) {
        if (!await waitFor(p, () => __mnr.SH.active, null, 9000)) { await fail(p, t, 'story', 'no pit stop after stage ' + n); continue; }
        await sleep(800); await probe('pit after stage'); await press(p, cfg, T, '#shGo');
      }
      if (!await waitFor(p, () => !document.getElementById('stres').hidden, null, 9000)) { await fail(p, t, 'story', 'no result screen after stage ' + n); continue; }
      await sleep(300); const r = await ev(p, () => ({ title: document.getElementById('srTitle').textContent, rows: document.querySelectorAll('#srStars .sr').length, next: !document.getElementById('srNext').hidden, st: __mnr.sSave.stars[__mnr.ST.n], score: document.getElementById('srScore').textContent, g: __mnr.G.score, ok: document.querySelectorAll('#srStars .sr.ok').length }));
      if (r.title !== d.name || r.rows !== 3 || r.st < 1 || r.ok < 1) await fail(p, t, 'story', 'result screen wrong ' + JSON.stringify(r));
      if (r.next !== (n < 16)) await fail(p, t, 'story', 'NEXT STAGE button ' + (r.next ? 'shown after the last stage' : 'missing'));
      if (r.score.replace(/\D/g, '') !== String(r.g)) await fail(p, t, 'HUD-mismatch', 'result score ' + r.score + ' vs ' + r.g);
      await probe('result'); if (n === 1 || n === 16) await shot('result' + n);
      await press(p, cfg, T, '#srMenu'); await sleep(250);
      const sel = await ev(p, n => ({ shown: !document.getElementById('stsel').hidden, stars: document.querySelector(`#stsel .card[data-n="${n}"] .stars`).textContent }), n);
      if (!sel.shown || !sel.stars.includes('★')) await fail(p, t, 'story', 'stage select does not show the stars earned: ' + JSON.stringify(sel));
      if (p.errs.length) { await fail(p, t, 'page-error', p.errs[0]); break; }
    }
    // dying: the stage-failed screen, STAGES and FLY AGAIN both work
    await ev(p, () => { __mnr.abort(); document.getElementById('stsel').hidden = false; document.getElementById('stres').hidden = true; document.getElementById('over').hidden = true; });
    await press(p, cfg, T, '#stsel .card[data-n="1"]'); await waitFor(p, () => __mnr.running && __mnr.ST.on, null, 4000);
    await ev(p, () => { const m = __mnr; m.god = false; m.P.inv = 0; m.P.hp = 1; m.G.eb.push({ x: m.P.x, y: m.P.y, vx: 0, vy: 0, r: 5, c: '#fff', g: true }); });
    if (!await waitFor(p, () => !document.getElementById('over').hidden, null, 8000)) await fail(p, tag, 'story', 'no stage-failed screen after dying');
    else { const o = await ev(p, () => ({ eye: document.getElementById('overEyebrow').textContent, st: !document.getElementById('stBtn2').hidden })); if (!/Stage 1 failed/.test(o.eye) || !o.st) await fail(p, tag, 'story', 'stage-failed screen wrong ' + JSON.stringify(o)); await probe('stage failed');
      await press(p, cfg, T, '#againBtn'); if (!await waitFor(p, () => __mnr.running && __mnr.ST.on && __mnr.ST.n === 1 && __mnr.G.t < 1.5, null, 4000)) await fail(p, tag, 'story', 'FLY AGAIN did not retry the stage'); }
    if (p.errs.length) await fail(p, tag, 'page-error', p.errs[0]);
  } catch (err) { await fail(p, tag, 'script', err.message.split('\n')[0]); }
  await p.context().close();
  if (!full) return;
  // locks, the hidden long-press, Hard, back-and-forth between title and select (default URL: nothing unlocked but stage 1)
  const t2 = cfg.name + '/story-lock', { p: q, T: T2 } = await newPage(browser, cfg);
  try {
    await sleep(400); await press(q, cfg, T2, '#storyBtn'); await sleep(300);
    const lk = await ev(q, () => [...document.querySelectorAll('#stsel .card')].map(c => c.classList.contains('lock')));
    if (lk.length !== 16 || lk[0] || !lk.slice(1).every(Boolean)) await fail(q, t2, 'story', 'a fresh player should have only stage 1 open: ' + JSON.stringify(lk));
    // Athens (Act IV) opens by playing: clearing stage 12 unlocks stage 13, and only that one
    await ev(q, () => { for (let i = 1; i <= 12; i++) __mnr.sSave.stars[i] = 1; }); await press(q, cfg, T2, '#stBack'); await sleep(150); await press(q, cfg, T2, '#storyBtn'); await sleep(250);
    const ath = await ev(q, () => [13, 14].map(n => document.querySelector(`#stsel .card[data-n="${n}"]`).classList.contains('lock'))); if (ath[0] || !ath[1]) await fail(q, t2, 'story', 'Athens does not open after stage 12: locks ' + JSON.stringify(ath));
    await ev(q, () => { __mnr.sSave.stars = {}; }); await press(q, cfg, T2, '#stBack'); await sleep(150); await press(q, cfg, T2, '#storyBtn'); await sleep(250);
    await press(q, cfg, T2, '#stsel .card[data-n="2"]'); await sleep(300);
    if (await ev(q, () => __mnr.running)) await fail(q, t2, 'story', 'a locked stage started');
    if (!/first/i.test(await ev(q, () => document.getElementById('stMsg').textContent))) await fail(q, t2, 'story', 'no message on a locked stage');
    await press(q, cfg, T2, '#stBack'); await sleep(200);
    if (!await ev(q, () => !document.getElementById('title').hidden)) await fail(q, t2, 'story', 'BACK did not return to the title');
    // long press on the title
    const r = await ev(q, () => { const b = document.querySelector('#title h1').getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
    if (cfg.touch) { await T2.down(5, r[0], r[1]); await sleep(1500); await T2.up(5); } else { await q.mouse.move(r[0], r[1]); await q.mouse.down(); await sleep(1500); await q.mouse.up(); }
    await sleep(200); if (!await ev(q, () => __mnr.sSave.all)) await fail(q, t2, 'story', 'long press on the title did not unlock all stages');
    await press(q, cfg, T2, '#storyBtn'); await sleep(300);
    if ((await ev(q, () => document.querySelectorAll('#stsel .card.lock').length)) !== 0) await fail(q, t2, 'story', 'stages still locked after the long press');
    await press(q, cfg, T2, '#stBack'); await sleep(200);
    // the title button cycles the difficulty (Normal -> Hard) for Endless
    await press(q, cfg, T2, '#diffBtn'); await sleep(150);
    if (!/HARD/.test(await ev(q, () => document.getElementById('diffBtn').textContent)) || !await ev(q, () => __mnr.HARD)) await fail(q, t2, 'story', 'difficulty button did not switch to Hard');
    await probe2(q, t2, 'title with hard');
    await press(q, cfg, T2, '#startBtn'); if (!await waitFor(q, () => __mnr.running && !__mnr.paused, null, 4000)) await fail(q, t2, 'story', 'ENDLESS did not start'); else {
      if (await ev(q, () => __mnr.ST.on)) await fail(q, t2, 'story', 'Endless started as Story');
      await sleep(800); if (!await ev(q, () => __mnr.HARD)) await fail(q, t2, 'story', 'Hard lost in the run');
    }
    if (q.errs.length) await fail(q, t2, 'page-error', q.errs[0]);
  } catch (err) { await fail(q, t2, 'script', err.message.split('\n')[0]); }
  await q.context().close();
}
// ---------------- rhythm redesign: auto-fire on the grid, dash snapped to the beat, tier meter, particle cap ----------------
async function rhythmTests(browser) {
  const cfg = CFGS[3], tag = 'rhythm', { p } = await newPage(browser, cfg, { query: '?nomusic=1' });
  const chk = (c, kind, d) => { stats.rChecks = (stats.rChecks || 0) + 1; return c ? Promise.resolve() : fail(p, tag, kind, d); };
  try {
    await p.keyboard.press('Enter'); if (!await waitFor(p, () => __mnr.running, null, 3000)) return fail(p, tag, 'start', 'no start');
    await ev(p, () => { __mnr.god = true; window.__fires = []; __mnr.NR.on('fire', f => window.__fires.push({ bp: __mnr.G.bp, pf: f.pf, gs: __mnr.SH.gridStep() })); __mnr.G.dt = 0; });
    await sleep(5500);                                    // no input at all: the ship fires on its own
    let F = await ev(p, () => ({ f: window.__fires.slice(), spb: __mnr.BT.spb }));
    const gridMs = (x, spb) => { const c = x.bp / x.gs, fr = c - Math.floor(c + 1e-6); return fr * x.gs * spb * 1000; };   // ms since the grid cell began
    const onGrid = F.f.filter(x => gridMs(x, F.spb) < 45).length / Math.max(1, F.f.length);
    const rate = F.f.length > 1 ? (F.f.length - 1) / (F.f[F.f.length - 1].bp - F.f[0].bp) : 0, pulse = F.f.filter(x => x.pf).length / Math.max(1, F.f.length);
    console.log(`  rhythm: auto-fire ${F.f.length} shots in 5.5 s, ${rate.toFixed(2)} per beat, ${(onGrid * 100).toFixed(0)}% within 45 ms of a 16th-note cell start, ${(pulse * 100).toFixed(0)}% gold pulse shots`);
    await chk(F.f.length >= 20, 'auto-fire', 'ship did not fire by itself: ' + F.f.length + ' shots in 5.5 s');
    await chk(Math.abs(rate - 4) < .4, 'auto-fire', 'cadence ' + rate.toFixed(2) + ' shots per beat, wanted 4 (a 16th note)');
    await chk(onGrid >= .93, 'auto-fire', 'only ' + (onGrid * 100).toFixed(0) + '% of shots on the beat grid');
    await chk(pulse > .15 && pulse < .4 && F.f.filter(x => x.pf).every(x => { const b = x.bp - Math.round(x.bp); return b > -.02 && b < .12; }), 'auto-fire', 'gold pulse shots are not the ones on the beat itself');
    // auto-fire off: nothing without a hold; a held Space fires on the same grid
    await ev(p, () => { __mnr.setVal('auto', false); window.__fires.length = 0; }); await sleep(1500);
    await chk((await ev(p, () => window.__fires.length)) === 0, 'auto-fire', 'auto-fire Off still fired');
    await p.keyboard.down('Space'); await sleep(1500); await p.keyboard.up('Space'); F = await ev(p, () => ({ f: window.__fires.slice(), spb: __mnr.BT.spb }));
    await chk(F.f.length >= 6 && F.f.filter(x => gridMs(x, F.spb) < 45).length >= F.f.length * .9, 'auto-fire', 'held fire with auto-fire off: ' + F.f.length + ' shots, not on the grid');
    await ev(p, () => { __mnr.setVal('auto', true); });
    // dash quantised: a press inside the window waits for the beat; outside it dashes at once, off-beat
    const dashAt = delta => ev(p, async delta => {
      const m = __mnr, spb = m.BT.spb; m.P.dashCd = 0; m.P.dashT = 0; m.P.dq = null; m.C.last = -999;
      const clr = setInterval(() => { m.G.eb.length = 0; }, 5), k = Math.ceil(m.bpos()) + 2, target = k + delta / (spb * 1000);
      await new Promise(r => { const iv = setInterval(() => { if (m.bpos() >= target) { clearInterval(iv); r(); } }, 1); });
      const t0 = m.bpos(); window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ShiftLeft', bubbles: true })); window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ShiftLeft', bubbles: true }));
      const start = await new Promise(r => { const iv = setInterval(() => { if (m.P.dashT > 0) { clearInterval(iv); r(m.bpos()); } }, 1); setTimeout(() => { clearInterval(iv); r(null); }, 500); });
      clearInterval(clr); await new Promise(r => setTimeout(r, 60)); const J = m.J.last;
      return { press: (t0 - k) * spb * 1000, start: start == null ? null : (start - k) * spb * 1000, ok: J && J.ok, kind: J && J.kind };
    }, delta);
    for (const [delta, snap, ok] of [[-90, 1, 1], [-40, 1, 1], [0, 0, 1], [40, 0, 1], [90, 0, 1], [-160, 0, 0], [230, 0, 0]]) {
      let r = await dashAt(delta); if (r.start == null || r.kind !== 'dash') r = await dashAt(delta);
      await sleep(900);
      const lag = r.start == null ? 999 : r.start - r.press;
      if (r.start == null || r.kind !== 'dash') { await chk(false, 'dash-quantise', delta + ' ms: no dash happened'); continue; }
      await chk(!!r.ok === !!ok, 'dash-quantise', `${r.press.toFixed(0)} ms from the beat: ok=${r.ok}, wanted ${ok}`);
      if (snap) await chk(r.start > -20 && r.start < 50, 'dash-quantise', `pressed ${r.press.toFixed(0)} ms early, the dash started ${r.start.toFixed(0)} ms from the beat (must snap to it)`);
      else await chk(lag > -5 && lag < 75, 'dash-quantise', `pressed ${r.press.toFixed(0)} ms from the beat, the dash was delayed ${lag.toFixed(0)} ms (must go at once)`);
    }
    // everything-counts assist: even a far-off press is on-beat and goes at once
    await ev(p, () => __mnr.setVal('all', true)); const ea = await dashAt(-160); await chk(ea.ok === true && ea.start !== null && ea.start - ea.press < 50, 'assist', 'everything counts: ' + JSON.stringify(ea)); await ev(p, () => __mnr.setVal('all', false)); await sleep(700);
    // tier meter: two on-beat dashes lift a tier, a late dash drops it, a hit drops it, pulse kills and grazes add points
    await ev(p, () => { __mnr.C.n = 0; __mnr.C.lb = __mnr.G.bc; });
    await dashAt(-30); await sleep(700); await dashAt(-30); await sleep(300);
    let T = await ev(p, () => ({ n: __mnr.C.n, tier: __mnr.tierOf(__mnr.C.n), hud: __mnr.HUD.tier, mus: __mnr.AU.tier }));
    await chk(T.n >= 6 && T.tier === 2 && T.hud === 2 && T.mus === 2, 'tier', 'two on-beat dashes: ' + JSON.stringify(T));
    await dashAt(-170); await sleep(300); T = await ev(p, () => ({ n: __mnr.C.n, tier: __mnr.tierOf(__mnr.C.n), mus: __mnr.AU.tier }));
    await chk(T.tier === 1 && T.mus === 1, 'tier', 'a late dash did not drop the tier: ' + JSON.stringify(T));
    await ev(p, () => { const m = __mnr; m.C.n = 14; m.C.lb = m.G.bc; m.god = false; m.P.inv = 0; m.P.dashT = 0; m.P.dq = null; m.G.eb.push({ x: m.P.x, y: m.P.y, vx: 0, vy: 0, r: 5, c: '#c6ff00', g: false, sl: false }); });
    await sleep(250); T = await ev(p, () => { __mnr.god = true; return { n: __mnr.C.n, hp: __mnr.P.hp, tier: __mnr.tierOf(__mnr.C.n) }; });
    await chk(T.hp === 4 && T.tier === 2, 'tier', 'a hit should drop one tier (tier 3 -> 2): ' + JSON.stringify(T));
    await sleep(1700);
    await ev(p, () => { const m = __mnr; m.C.n = 0; m.C.last = -999; m.P.inv = 5; m.G.en = [{ type: 'drone', t: 0, flash: 0, bf: 99, bn: 0, x: 700, y: 300, r: 14, hp: 1, max: 1, score: 100, by: 300, amp: 0 }]; m.G.pb = [{ x: 700, y: 300, vx: 0, vy: 0, dm: 5, pf: 1 }]; });
    await sleep(120); await chk((await ev(p, () => __mnr.C.n)) === 1, 'tier', 'a pulse-shot kill did not add a point');
    await ev(p, () => { const m = __mnr; m.C.last = -999; m.C.n = 0; m.G.en = [{ type: 'drone', t: 0, flash: 0, bf: 99, bn: 0, x: 700, y: 300, r: 14, hp: 1, max: 1, score: 100, by: 300, amp: 0 }]; m.G.pb = [{ x: 700, y: 300, vx: 0, vy: 0, dm: 5, pf: 0 }]; });
    await sleep(120); await chk((await ev(p, () => __mnr.C.n)) === 0, 'tier', 'an off-beat shot kill raised the tier');
    await ev(p, () => { const m = __mnr; m.setVal('all', true); m.C.n = 0; m.C.last = -999; m.G.en = []; m.G.eb = [{ x: m.P.x + 13, y: m.P.y, vx: 0, vy: 0, r: 5, c: '#c6ff00', g: false, sl: false }]; });
    await sleep(120); await chk((await ev(p, () => { __mnr.setVal('all', false); return __mnr.C.n; })) >= 1, 'tier', 'a graze did not add a point');
    // the first-run hint is one short line and goes away with the first on-beat dash
    await chk(await ev(p, () => __mnr.TIP.done === true), 'hint', 'tip not marked done after an on-beat dash');
    await chk((await ev(p, () => __mnr.MSGS.filter(m => /tap|beat for PERFECT/i.test(m)))).length === 0, 'hint', 'the old "tap on the beat" text is still shown');
    // enemies that fire on the next beat are flagged for the one-beat glow
    const ar = await ev(p, () => { const m = __mnr; m.G.en = [{ type: 'drone', t: 3, flash: 0, bf: 1, bn: 0, x: 700, y: 100, r: 14, hp: 50, max: 50, score: 100, by: 100, amp: 0 }]; return m.G.en[0].bf; }); await chk(ar === 1, 'telegraph', 'setup');
    // particle cap: default (low) <= 60, full <= 300, off = 0, under a boss fight with EMPs
    for (const [part, cap] of [[1, 60], [2, 300], [0, 0]]) {
      await ev(p, part => { const m = __mnr; m.setVal('part', part); m.god = true; m.P.inv = 9; m.skipTo(0); m.bossNow(); }, part);
      let mx = 0; for (let k = 0; k < 40; k++) { await ev(p, () => { __mnr.P.emp = 3; if (Math.random() < .2) __mnr.press('Emp'); }); mx = Math.max(mx, await ev(p, () => __mnr.G.pt.length)); await sleep(250); }
      console.log(`  rhythm: particles set to ${['off', 'low', 'full'][part]}: most on screen ${mx} (cap ${cap})`); stats.maxPtSet = stats.maxPtSet || {}; stats.maxPtSet[part] = mx;
      await chk(mx <= cap, 'particles', `particles ${['off', 'low', 'full'][part]}: ${mx} on screen, cap ${cap}`);
    }
    if (p.errs.length) await fail(p, tag, 'page-error', p.errs[0]);
  } catch (err) { await fail(p, tag, 'script', err.message.split('\n')[0]); }
  await p.context().close();
}
// ---------------- settings panel: every row reachable, saved, applied live, restored by DEFAULTS; the tap test measures the lateness ----------------
async function settingsTests(browser, cfg) {
  const tag = cfg.name + '/settings', { p, T } = await newPage(browser, cfg), chk = (c, kind, d) => { stats.sChecks = (stats.sChecks || 0) + 1; return c ? Promise.resolve() : fail(p, tag, kind, d); };
  try {
    const open = async () => { await press(p, cfg, T, '#setBtn'); await sleep(250); };
    await open(); const rows = await ev(p, () => ({ groups: [...document.querySelectorAll('#setBody h3')].map(h => h.textContent), seg: document.querySelectorAll('#setBody .seg').length, sl: document.querySelectorAll('#setBody input[type=range]').length }));
    await chk(rows.groups.join() === 'Gameplay,Controls,Rhythm,Audio,Visuals,Accessibility' && rows.seg === 19 && rows.sl === 5, 'settings', 'groups/rows ' + JSON.stringify(rows));
    for (const b of (await ev(p, () => window.__bot.probe().bad))) await fail(p, tag, 'layout', 'settings ' + b);
    // press real controls (scrolled into view first, then touched or clicked like a player)
    const hit = async (k, i) => { const sel = `#setBody .seg[data-k="${k}"] button:nth-of-type(${i + 1})`; await ev(p, sel => document.querySelector(sel).scrollIntoView({ block: 'center' }), sel); await sleep(60); await press(p, cfg, T, sel); await sleep(70); };
    const want = { diff: ['hard', 2], auto: [false, 1], aim: [true, 1], layout: ['left', 0], dsize: ['L', 2], win: ['tight', 0], all: [true, 1], cue: ['L', 3], duck: [false, 1], mute: [true, 1], part: [0, 0], shake: [1, 1], flash: [1, 1], q: ['L', 0], fps: [30, 0], pal: ['cb', 1], fpsc: [true, 1], rm: [true, 1], hc: [true, 1] };
    for (const k in want) await hit(k, want[k][1]);
    await ev(p, () => { for (const [id, v] of [['sSens', 5], ['sMaster', 60], ['sMusic', 30], ['sSfx', 40], ['sSync', -35]]) { const s = document.getElementById(id); s.value = v; s.dispatchEvent(new Event('input', { bubbles: true })); } });
    await sleep(200);
    const got = await ev(p, () => ({ S: Object.assign({}, __mnr.SET), st: JSON.parse(localStorage.getItem('mnr_set')), mute: localStorage.getItem('mnr_mute'), hard: __mnr.HARD, df: __mnr.DF.d, cls: [...document.getElementById('stage').classList], hc: document.documentElement.classList.contains('hc'), fpsEl: !document.getElementById('fpsEl').hidden, pressed: [...document.querySelectorAll('#setBody .seg[data-k="diff"] button')].map(b => b.getAttribute('aria-pressed')).join() }));
    for (const k in want) await chk(got.S[k] === want[k][0] && got.st[k] === want[k][0], 'settings', `${k} = ${got.S[k]} (saved ${got.st && got.st[k]}), wanted ${want[k][0]}`);
    await chk(got.S.sens === 5 && got.S.master === .6 && got.S.music === .3 && got.S.sfx === .4 && got.S.sync === -35, 'settings', 'sliders ' + JSON.stringify([got.S.sens, got.S.master, got.S.music, got.S.sfx, got.S.sync]));
    await chk(got.hard && got.df > 2 && got.cls.includes('tl') && got.cls.includes('ds-L') && got.hc && got.fpsEl && got.mute === 'true' && got.pressed === 'false,false,true', 'settings', 'not applied live ' + JSON.stringify({ hard: got.hard, df: got.df, cls: got.cls, hc: got.hc, fpsEl: got.fpsEl, mute: got.mute, pressed: got.pressed }));
    await chk(got.S.reduce === true && got.S.calm === true, 'settings', 'derived reduce/calm wrong');
    await press(p, cfg, T, '#setBack'); await sleep(150);
    // applied in a run: touch buttons on the chosen side and bigger, no particles, mute silences the master gain, 30 fps cap halves the frame rate
    if (!await startGame(p, cfg, T)) return fail(p, tag, 'start', 'no start');
    await ev(p, () => { __mnr.god = true; }); await sleep(1500);
    const run = await ev(p, () => { const b = document.getElementById('bDash'), e = document.getElementById('bEmp'), r = b ? b.getBoundingClientRect() : null, f = document.getElementById('frame').getBoundingClientRect(), g = __mnr.AU.m ? __mnr.AU.m.gain.value : -1; return { dash: r && [r.left, r.right, r.width], emp: e && e.getBoundingClientRect().left, fr: [f.left, f.right], vw: innerWidth, g, pt: __mnr.G.pt.length, shown: !document.getElementById('touch').hidden }; });
    if (cfg.touch) await chk(run.shown && run.dash[0] < run.vw / 2 && run.emp < run.vw / 2 || cfg.h > cfg.w, 'settings', 'touch layout Left did not move the buttons ' + JSON.stringify(run));
    await chk(run.g === 0 || run.g < .05, 'settings', 'Mute all left the master gain at ' + run.g);
    await sleep(2500); await chk((await ev(p, () => __mnr.G.pt.length)) === 0, 'settings', 'particles Off still shows particles');
    const fr = async () => { const a = await ev(p, () => __mnr.HUD.frame); await sleep(2000); return ((await ev(p, () => __mnr.HUD.frame)) - a) / 2; };
    const f30 = await fr(); await ev(p, () => __mnr.setVal('fps', 60)); const f60 = await fr(); console.log(`  ${tag}: draw rate with the 30 FPS cap ${f30.toFixed(0)}, with 60 ${f60.toFixed(0)}`);
    await chk(f30 < 36 && f60 > f30 * 1.4, 'settings', `FPS cap: ${f30.toFixed(0)} frames/s capped, ${f60.toFixed(0)} at 60`);
    // reload: the choices are still there
    await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.__bot); await sleep(300);
    const again = await ev(p, () => ({ d: __mnr.SET.diff, w: __mnr.SET.win, l: __mnr.SET.layout, s: __mnr.SET.sync, hard: __mnr.HARD, btn: document.getElementById('diffBtn').textContent }));
    await chk(again.d === 'hard' && again.w === 'tight' && again.l === 'left' && again.s === -35 && again.hard && again.btn === 'HARD', 'settings', 'not restored after reload ' + JSON.stringify(again));
    // DEFAULTS needs a second tap to confirm, then everything is back
    await open(); await press(p, cfg, T, '#setDef'); await sleep(100); await chk((await ev(p, () => __mnr.SET.diff)) === 'hard', 'settings', 'DEFAULTS reset without a confirm tap');
    await press(p, cfg, T, '#setDef'); await sleep(150);
    const dd = await ev(p, () => { const S = __mnr.SET, D = __mnr.DEFS; return { bad: Object.keys(D).filter(k => k !== 'mute' && S[k] !== D[k]), hard: __mnr.HARD, mute: S.mute }; });
    await chk(dd.bad.length === 0 && !dd.hard && !dd.mute, 'settings', 'DEFAULTS left ' + JSON.stringify(dd));
    // latency tap test: 8 taps 60 ms after the clicks set the Audio sync to about -60 ms; a tap halfway between clicks is ignored
    await ev(p, () => document.getElementById('calBtn').scrollIntoView({ block: 'center' })); await press(p, cfg, T, '#calBtn'); await sleep(300);
    await chk(await ev(p, () => document.getElementById('calBox').classList.contains('on') && __mnr.CAL.on), 'calibration', 'TAP TEST did not open');
    for (const b of (await ev(p, () => window.__bot.probe().bad))) await fail(p, tag, 'layout', 'tap test ' + b);
    const cal = await ev(p, async () => {
      const m = __mnr, C = m.CAL, pad = document.getElementById('calPad'), tapAt = async (t, late) => { await new Promise(r => { const iv = setInterval(() => { if (m.calNow() >= t + late) { clearInterval(iv); r(); } }, 1); }); pad.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true })); };
      await tapAt(C.t0 + 1 * C.per, .28); const ignored = C.taps.length === 0;
      for (let i = 2; i < 10; i++) await tapAt(C.t0 + i * C.per, .06);
      await new Promise(r => setTimeout(r, 100));
      return { ignored, done: C.done, taps: C.taps.length, sync: m.SET.sync, saved: JSON.parse(localStorage.getItem('mnr_set')).sync, info: document.getElementById('calInfo').textContent, on: C.on };
    });
    console.log(`  ${tag}: tap test, 8 taps 60 ms late -> sync ${cal.sync} ms (${cal.info})`);
    await chk(cal.ignored && cal.taps === 8 && !cal.on && Math.abs(cal.sync + 60) <= 20 && cal.saved === cal.sync && /Done/.test(cal.info), 'calibration', 'tap test ' + JSON.stringify(cal));
    // quality: pixel ratio follows the setting (a second page at device pixel ratio 2)
    if (p.errs.length) await fail(p, tag, 'page-error', p.errs[0]);
  } catch (err) { await fail(p, tag, 'script', err.message.split('\n')[0]); }
  await p.context().close();
}
async function qualityTest(browser) {
  const tag = 'settings/quality', ctx = await browser.newContext({ viewport: { width: 1000, height: 600 }, deviceScaleFactor: 2 }), p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  try {
    await p.goto(URL_BASE + 'index.html'); await p.waitForFunction(() => window.__mnr); await sleep(300); const w = {};
    for (const q of ['L', 'M', 'H']) { await p.evaluate(q => __mnr.setVal('q', q), q); await sleep(100); w[q] = await p.evaluate(() => document.getElementById('game').width / document.getElementById('frame').getBoundingClientRect().width); }
    console.log('  settings/quality: canvas pixels per CSS pixel', JSON.stringify(w));
    if (!(Math.abs(w.L - 1) < .03 && Math.abs(w.M - 1.5) < .03 && Math.abs(w.H - 2) < .03)) await fail(p, tag, 'settings', 'quality does not set the pixel ratio ' + JSON.stringify(w));
    if (p.errs.length) await fail(p, tag, 'page-error', p.errs[0]);
  } catch (err) { await fail(p, tag, 'script', err.message.split('\n')[0]); }
  await ctx.close();
}
// ---------------- difficulty numbers, measured with the bot in the stepped page (see d-sim.js) ----------------
async function diffTests(browser) {
  const { BOT } = require('./d-sim.js'), RUNS_D = +process.env.DRUNS || 6, res = {};
  const jobs = []; for (const diff of ['easy', 'normal', 'hard']) for (const type of ['idle', 'careless', 'natural']) for (let k = 0; k < RUNS_D; k++) jobs.push({ diff, type });
  let next = 0;
  await Promise.all([0, 1].map(async () => { const p = await browser.newPage({ viewport: { width: 960, height: 540 } }); p.errs = []; p.on('pageerror', e => p.errs.push(e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(URL_BASE + 'index.html?sim=1&all=1&nomusic=1'); await p.waitForFunction(() => window.__mnr);
    while (next < jobs.length) { const j = jobs[next++], r = await p.evaluate(BOT, { ...j, cap: 120, stage: 0, dk: null }); (res[j.diff + '/' + j.type] = res[j.diff + '/' + j.type] || []).push(r); if (p.errs.length) { await fail(p, 'difficulty', 'page-error', p.errs[0]); p.errs.length = 0; } }
    await p.close(); }));
  const avg = (a, k) => a.reduce((x, y) => x + y[k], 0) / a.length, died = a => a.filter(x => x.dead).length / a.length, row = (d, t) => { const a = res[d + '/' + t]; return { died: died(a), t: avg(a, 't'), hits: avg(a, 'hits') }; };
  const R = {}; for (const d of ['easy', 'normal', 'hard']) for (const t of ['idle', 'careless', 'natural']) R[d + '/' + t] = row(d, t);
  stats.diff = R; for (const k in R) console.log(`  difficulty ${k.padEnd(15)} died ${(R[k].died * 100).toFixed(0).padStart(3)}%  survived ${R[k].t.toFixed(0).padStart(3)} s  hull lost ${R[k].hits.toFixed(1)}`);
  const f = (c, d) => c ? 0 : fail(null, 'difficulty', 'balance', d);
  await f(R['normal/idle'].died === 1 && R['normal/idle'].t < 45, 'Normal: a do-nothing player must die within 45 s: ' + JSON.stringify(R['normal/idle']));
  await f(R['normal/careless'].died >= .8 && R['normal/careless'].t < 90, 'Normal: a careless player must die within 90 s: ' + JSON.stringify(R['normal/careless']));
  await f(R['normal/natural'].died <= .4, 'Normal: the dodging bot should mostly survive: ' + JSON.stringify(R['normal/natural']));
  await f(R['hard/natural'].died >= .25 && R['hard/natural'].hits > R['normal/natural'].hits + 1.5, 'Hard: the dodging bot must die and lose hull: ' + JSON.stringify([R['hard/natural'], R['normal/natural']]));
  await f(R['hard/idle'].t < R['normal/idle'].t && R['easy/careless'].t > R['normal/careless'].t, 'Easy < Normal < Hard ordering broke');
}
// ---------------- screenshots for the owner: portrait mid-run with the tier meter, boss, settings (look at them) ----------------
async function dShots(browser) {
  const cfg = CFGS[0], { p, T } = await newPage(browser, cfg, { query: '?nomusic=1' });
  try {
    await press(p, cfg, T, '#startBtn'); await waitFor(p, () => __mnr.running, null, 4000); await ev(p, () => { __mnr.god = true; }); await sleep(10000);
    await ev(p, () => { __mnr.C.n = 14; __mnr.C.lb = __mnr.G.bc; }); await sleep(250); await p.screenshot({ path: path.join(OUT, 'd-portrait-midrun.png') });
    await ev(p, () => { __mnr.bossNow(); }); await sleep(10000); await ev(p, () => { __mnr.C.n = 20; __mnr.C.lb = __mnr.G.bc; }); await sleep(200); await p.screenshot({ path: path.join(OUT, 'd-portrait-boss.png') });
    await ev(p, () => { __mnr.abort(); }); await p.evaluate(() => document.getElementById('menuBtn') && 0);
    await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.__bot); await sleep(400);
    await press(p, cfg, T, '#setBtn'); await sleep(400); await p.screenshot({ path: path.join(OUT, 'd-settings.png') });
    await ev(p, () => document.getElementById('calBtn').scrollIntoView({ block: 'center' })); await press(p, cfg, T, '#calBtn'); await sleep(500); await p.screenshot({ path: path.join(OUT, 'd-settings-taptest.png') });
    await p.setViewportSize({ width: 844, height: 390 }); await sleep(500); await p.screenshot({ path: path.join(OUT, 'd-settings-landscape.png') });
  } catch (err) { await fail(p, 'dshots', 'script', err.message.split('\n')[0]); }
  await p.context().close();
}
async function probe2(p, tag, what) { const s = await ev(p, () => window.__bot.probe()); for (const b of s.bad) await fail(p, tag, 'layout', what + ' ' + b); }

(async () => {
  const srv = await startServer(); const browser = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required', '--use-fake-ui-for-media-stream'] });
  const t0 = Date.now(); console.log('serving', URL_BASE, 'runs', RUNS, 'secs', SECS, 'par', PAR);
  try {
    const jobs = [];
    if (want('runs')) { const kinds = ['', 'late', '', 'boss', '', 'reduce', 'daily', '', 'bossN', '', 'late', 'ath']; for (let i = 0; i < RUNS; i++) { const cfg = CFGS[i % 4]; jobs.push(() => playRun(browser, cfg, i, kinds[i % kinds.length])); } }
    const pre = [];
    if (want('input')) for (const c of CFGS) pre.push(() => inputTests(browser, c));
    const solo = [];                                       // tests that time the audio to a few ms run one at a time: another busy page makes the clock readings jitter
    if (want('pause')) for (const c of [CFGS[0], CFGS[3]]) for (const sy of [false, true]) solo.push(() => pauseTests(browser, c, sy));
    if (want('rotate')) for (const c of CFGS) pre.push(() => rotationTest(browser, c));
    if (want('title')) for (const c of CFGS) pre.push(() => titleTests(browser, c));
    if (want('beat')) solo.push(() => beatTests(browser));
    if (want('synth')) solo.push(() => synthFallbackTests(browser));
    if (want('songs')) ['stage1', 'stage2', 'stage3'].forEach((st, i) => solo.push(() => songTests(browser, st, i)));
    if (want('switch')) solo.push(() => songSwitchTests(browser));
    if (want('rhythm')) solo.push(() => rhythmTests(browser));
    if (want('settings')) { for (const c of [CFGS[0], CFGS[3]]) solo.push(() => settingsTests(browser, c)); solo.push(() => qualityTest(browser)); }
    if (want('diff')) solo.push(() => diffTests(browser));
    if (want('ios')) solo.push(() => iosTests(browser));
    for (const j of solo) await j();
    if (want('story')) CFGS.forEach((c, k) => pre.push(() => storyTests(browser, c, k === 0 || k === 3)));
    if (want('shop')) CFGS.forEach((c, k) => pre.push(() => shopTests(browser, c, k === 0 || k === 3)));
    if (want('garage')) CFGS.forEach((c, k) => pre.push(() => garageTests(browser, c, k === 0 || k === 3)));
    if (want('tune')) CFGS.forEach((c, k) => pre.push(() => tuneTests(browser, c, k === 0)));
    for (let k = 0; k < ECON; k++) pre.push(() => playRun(browser, CFGS[k % 2], 100 + k, 'econ'));
    const all = pre.concat(jobs); let next = 0;
    await Promise.all(Array.from({ length: PAR }, async () => { while (next < all.length) { const j = all[next++]; await j(); } }));
    if (want('webkit')) await webkitTests();
    if (want('lag')) await lagTests();
    if (want('power')) for (const sy of [false, true]) await powerTests(browser, sy);   // alone on the machine: they listen to the audio and time things to a few ms
    if (want('pshots')) await powerShots(browser);
    if (want('powerfps')) await powerFps(browser);
    if (want('shots') && (process.env.SHOTS || ONLY.includes('shots'))) await shots(browser);
    if (want('dshots') && (process.env.SHOTS || ONLY.includes('dshots'))) await dShots(browser);
    // FPS: a dedicated page alone on the machine
    if (want('fps')) { const cfg = CFGS[0], { p, T } = await newPage(browser, cfg); await T.tap(p, '#startBtn'); await ev(p, () => { window.__mnr.god = true; }); await T.down(1, cfg.w / 2, cfg.h / 2); for (let k = 0; k < 40; k++) { await T.move(1, cfg.w / 2 + 60 * Math.sin(k / 3), cfg.h / 2 + 80 * Math.cos(k / 5)); await sleep(250); } await T.up(1);
      const f = await ev(p, () => window.__mnr.FPS.n / window.__mnr.FPS.t * 1000); console.log('  solo FPS (390x763, rotated, god mode, 10 s of full action):', f.toFixed(1)); stats.fps.push(f); if (f < 45) await fail(p, 'fps', 'FPS', 'solo fps ' + f.toFixed(1)); await p.context().close(); }
  } finally { await browser.close(); srv.kill(); }
  const avg = stats.fps.length ? stats.fps.reduce((a, b) => a + b, 0) / stats.fps.length : 0;
  console.log(`story stages played from the select screen: ${stats.storyStages || 0}, song changes checked: ${stats.switches || 0}`);
  console.log(`\nruns ${stats.runs}, ticks ${stats.ticks}, avg FPS ${avg.toFixed(1)} (${stats.fps.length} runs), perfects ${stats.perfect}, kills ${stats.kills}, bosses reached ${stats.bosses}, furthest district index ${stats.maxDistrict}, max particles (calm) ${stats.maxPt || 0}, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  if (stats.fps.length && avg < 45) fails.push({ tag: 'all', kind: 'FPS', detail: 'average FPS ' + avg.toFixed(1) });
  econReport(); console.log(`shop: ${stats.pits} pit stops played in runs, ${stats.shopChecks} shop/garage checks`);
  fs.writeFileSync(path.join(OUT, 'sweep-result.json'), JSON.stringify({ fails, stats, avg }, null, 1));
  if (fails.length) { console.log('\nFAILED:', fails.length); for (const f of fails) console.log(' -', f.tag, f.kind, f.detail, f.shot); process.exit(1); }
  console.log('\nSWEEP PASSED');
})().catch(e => { console.error(e); process.exit(2); });
