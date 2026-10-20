#!/usr/bin/env node
// Nightrun review tour: a reproducible screenshot tour of the built game plus a few measurements. Real page, headless, nothing in the game is changed.
//   NODE_PATH=$(npm root -g) OUT=/some/dir node games-src/nightrun/review-tour.js      env: GAME_DIR=<dir with index.html>  ONLY=01,05 (state numbers)  VP=phone|desktop  NOMEASURE=1  MEASURE_ONLY=1
// Writes OUT/NN-state-phone.png and NN-state-desktop.png (phone 390x763 touch, desktop 1280x720), OUT/tour-log.json (PASS/FAIL per shot + page errors)
// and OUT/measure.json (load size, frame times, small tap targets, text contrast, accessibility / PWA / save-export facts from the sources).
// Late states are reached with the test hooks (window.__mnr, RET, FOOT, ZOO, CHK, LEAK ...): god mode, stepping the engine by hand, forcing a boss, a pit stop, a clear.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const PARTS = path.join(__dirname, 'parts');
const OUT = process.env.OUT || path.join(process.cwd(), 'tour-out');
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
fs.mkdirSync(OUT, { recursive: true });

const VPS = [{ tag: 'phone', w: 390, h: 763, touch: true }, { tag: 'desktop', w: 1280, h: 720, touch: false }].filter(v => !process.env.VP || process.env.VP === v.tag);   // VP=phone|desktop runs one size (two processes can run side by side)
// seeded save: story stages 1-3 cleared (STREET RUN unlocks), tutorial done, some Neon, weapon levels, a few garage levels
const SEED = {
  mnr_story: { stars: { 1: 3, 2: 3, 3: 2 }, snap: {}, all: false, v30: 1, v40: 1 },
  mnr_tut: 2, mnr_bank: 2400, mnr_runs: 12,
  mnr_wplv: { pulse: 4, laser: 3, homing: 2, beat: 1, arc: 2 },
  mnr_tune: { pwr: 3, rate: 2, hull: 1 },
};
const log = { started: new Date().toISOString(), shots: [], errors: [], notes: [] };
const measure = {};
let port, br;

// ---------- page helpers ----------
async function open(vp, q = '', seed = true) {
  const ctx = await br.newContext({ viewport: { width: vp.w, height: vp.h }, hasTouch: vp.touch, isMobile: vp.touch, deviceScaleFactor: 1 });
  await ctx.addInitScript(([s, on]) => { try { if (on && !sessionStorage.getItem('_tour')) { sessionStorage.setItem('_tour', 1); localStorage.clear(); for (const k in s) localStorage.setItem(k, JSON.stringify(s[k])); } } catch (e) { } }, [SEED, seed]);
  const p = await ctx.newPage(); p.vp = vp; p.ctx = ctx;
  p.on('pageerror', e => log.errors.push({ vp: vp.tag, page: p.cur || '', msg: e.message }));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR/.test(m.text())) log.errors.push({ vp: vp.tag, page: p.cur || '', msg: 'console: ' + m.text() }); });
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1${q}`, { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => window.__mnr && document.getElementById('moreBtn'), null, { timeout: 20000 });
  await sleep(900); return p;
}
const ev = (p, f, a) => p.evaluate(f, a);
const click = async (p, sel) => { const h = await p.$(sel); if (!h) throw new Error('missing ' + sel); await h.evaluate(e => e.click()); };
const clickText = (p, txt, sel = 'button') => p.evaluate(([t, s]) => { const b = [...document.querySelectorAll(s)].find(x => x.offsetWidth && x.textContent.trim().toUpperCase().startsWith(t)); if (!b) return false; b.click(); return true; }, [txt, sel]);
// start a story stage in the real loop with god mode; helpers for fast-forwarding the engine
async function stage(p, n, opt = {}) {
  await ev(p, ([n, o]) => { const m = __mnr; m.god = true; if (m.running) m.abort(); m.SET.auto = true; m.startStory(n); if (o.keepGod === false) m.god = false; }, [n, opt]);
  await sleep(opt.wait == null ? 700 : opt.wait);
}
const ff = (p, sec, keep = true) => ev(p, ([sec, keep]) => { const m = __mnr; for (let i = 0; i < sec * 30 && m.running && !m.G.over; i++) { if (keep) { m.P.hp = m.P.max; m.P.inv = Math.max(m.P.inv || 0, .5); } if (m.SH.active) m.SH.close(); m.step(1 / 30); } }, [sec, keep]);
const state = p => ev(p, () => { const m = __mnr; return { run: m.running, t: m.G && m.G.t, en: m.G && m.G.en.length, boss: !!(m.G && m.G.boss), over: !!(m.G && m.G.over) }; });

// ---------- the states ----------
// each: [num, name, async (p) => void]; p is a fresh page (saved game seeded) unless fresh:false
const dismissTale = p => ev(p, () => { for (let i = 0; i < 3; i++) { const c = document.getElementById('taleCard'); if (c && !c.hidden) (document.getElementById('taleTc') || c).click(); } });
const toPit = async p => {
  await stage(p, 4, { wait: 300 });
  await ff(p, 3);
  await ev(p, () => { const m = __mnr; m.ST.clear(false); m.ST.cT = 0; for (let i = 0; i < 40; i++) { m.P.hp = m.P.max; m.step(1 / 30); if (m.SH.active) break; } });
  await sleep(800);
};
const STATES = [
  ['01', 'title', async p => { await sleep(500); }],
  ['02', 'menu', async p => { await click(p, '#moreBtn'); await sleep(700); }],
  ['03', 'settings-assist', async p => { await click(p, '#moreBtn'); await sleep(300); await click(p, '#setBtn'); await sleep(500);
    await ev(p, () => { const b = document.getElementById('setBody'); const h = [...b.querySelectorAll('*')].find(e => e.children.length === 0 && /^ASSIST$/i.test(e.textContent.trim())); if (h) h.scrollIntoView({ block: 'start' }); else b.scrollTop = b.scrollHeight; }); await sleep(600); }],
  ['04', 'garage-tune', async p => { await click(p, '#gaBtn'); await sleep(900); }],
  ['04b', 'garage-ships', async p => { await click(p, '#gaBtn'); await sleep(700); if (!await clickText(p, 'SHIPS')) throw new Error('no SHIPS tab'); await sleep(800); }],
  ['04c', 'garage-shop', async p => { await click(p, '#gaBtn'); await sleep(700); if (!await clickText(p, 'SHOP')) throw new Error('no SHOP tab'); await sleep(800); }],
  ['05', 'weapons-levels', async p => { await click(p, '#gaBtn'); await sleep(700); if (!await clickText(p, 'WEAPONS')) throw new Error('no WEAPONS tab'); await sleep(900); }],
  ['05b', 'weapons-screen', async p => { await click(p, '#moreBtn'); await sleep(300); await click(p, '#wpBtn'); await sleep(900); }],
  ['06', 'stage-map', async p => { await click(p, '#moreBtn'); await sleep(300); await click(p, '#storyBtn'); await sleep(900); }],
  ['07', 'story-log', async p => { await click(p, '#moreBtn'); await sleep(300); await click(p, '#taleBtn'); await sleep(900); }],
  ['08', 'stats', async p => { await click(p, '#moreBtn'); await sleep(300); await click(p, '#statsBtn'); await sleep(900); }],
  ['09', 'stage-start-card', async p => { await stage(p, 4, { wait: 650 }); }],
  ['10', 'mid-stage-early', async p => { await stage(p, 4, { wait: 300 }); await ff(p, 14); await sleep(500); }],
  ['11', 'mid-stage-hover-ground', async p => { await stage(p, 7, { wait: 300 }); await ff(p, 45); await sleep(500); }],
  ['12', 'zoo-enemies', async p => { await stage(p, 4, { wait: 300 }); await ff(p, 5); await ev(p, () => { const m = __mnr, Z = window.ZOO; m.G.en.length = 0; m.G.eb.length = 0; m.P.x = 150; m.P.y = 560;
      const ks = Object.keys(Z.T).slice(0, 8); ks.forEach((k, i) => { const e = Z.mk(k, { x: 520 + (i % 4) * 110, y: 110 + Math.floor(i / 4) * 180 + (i % 2) * 60 }); e.gr = 0; e.zs = { x: e.x, y: e.y }; e.zph = 0; e.zst = 1; e.hv0 = m.G.bc + 99; e.bf = 999; }); window.__zk = ks; });
    log.notes.push('12 zoo kinds: ' + JSON.stringify(await ev(p, () => window.__zk))); await ff(p, 1.2); await sleep(500); }],
  ['13', 'powerups-lv-chip', async p => { await stage(p, 4, { wait: 300 }); await ff(p, 6);
    const ks = await ev(p, () => { const m = __mnr, PW = m.PW; const kinds = ['drum', 'echo', 'nova'].filter(k => k === 'drum' || (window.PW2 && PW2.K && PW2.K[k]));
      for (const k of kinds.slice(0, 2)) for (let i = 0; i < 3; i++) { try { PW.give(k, false); } catch (e) { } } return { kinds, act: PW.st().act.map(a => a.k + ':LV' + (a.l3 || a.lv || 1)) }; });
    log.notes.push('13 power-ups: ' + JSON.stringify(ks)); await ff(p, 1.5); await sleep(500); }],
  ['14', 'fever', async p => { await stage(p, 4, { wait: 300 }); await ff(p, 5);
    await ev(p, () => { const m = __mnr, FV = m.RET.fv; FV.m = 100; FV.last = -99; FV.tb = 99; m.RET.fvDraw(); });
    const t0 = Date.now(); for (let i = 0; i < 20; i++) { await ff(p, .5); if (await ev(p, () => __mnr.RET.fv.on)) break; await sleep(100); }
    log.notes.push('14 fever on: ' + await ev(p, () => __mnr.RET.fv.on)); await sleep(700); }],
  ...[1, 2, 3].map(ph => ['1' + (4 + ph), 'boss-phase-' + ph, async p => {
    await stage(p, 8, { wait: 300 }); await ff(p, 4); await ev(p, () => __mnr.bossNow());
    await p.waitForFunction(() => { const m = __mnr; return m.G.boss && m.G.boss.x < 800 && m.G.boss.hp > 0; }, null, { timeout: 40000, polling: 300 }).catch(async () => { await ff(p, 20); });
    // the boss opens phase 2 / 3 on a hit-point threshold, so the bar is set by hand
    await ev(p, ph => { const m = __mnr, b = m.G.boss; if (!b) return; m.P.hp = m.P.max; if (ph > 1) { const bar = Math.floor(b.bt / 4) + 1; if (ph === 2) b.p2 = bar; else { b.p2 = 1; b.p3 = bar; } b.bt = bar * 4 - 1; } window.__ph0 = b.ph; window.__pp = [b.p2, b.p3, b.bt]; }, ph);
    log.notes.push('boss p2/p3/bt: ' + JSON.stringify(await ev(p, () => window.__pp)));
    if (ph > 1) await sleep(1100); else await sleep(600);
    log.notes.push('boss phase ' + ph + ': ' + JSON.stringify(await ev(p, () => { const b = __mnr.G.boss; return b && { ph: b.ph, nm: b.nm, hp: Math.round(b.hp), x: Math.round(b.x) }; }))); }]),
  ['18', 'pit-stop', async p => { await toPit(p); }],
  ['19', 'chest', async p => { await stage(p, 8, { wait: 300 }); await ff(p, 2); await ev(p, () => { const m = __mnr; m.G.bossDone = true; m.G.chestT = false; m.SH.pit(() => { }); }); await sleep(1500); }, '&chest=1'],
  ['20', 'results-medals', async p => { await toPit(p); await ev(p, () => { __mnr.SH.close(); }); await p.waitForFunction(() => { const e = document.getElementById('stres'); return e && !e.hidden; }, null, { timeout: 8000 });
    for (let i = 0; i < 3; i++) { await sleep(600); await dismissTale(p); await clickText(p, 'SKIP'); } await sleep(2200); }],
  ['21', 'breach-meter', async p => { await stage(p, 7, { wait: 300 }); await ff(p, 20);
    await ev(p, () => { const L = window.LEAK; L.M = Math.max(1, L.cap() - 1); L.flashT = 4; L.txt = 'BREACH'; L.txtT = 0; }); await ff(p, .4); await sleep(500); }],
  ['21b', 'run-end', async p => { await stage(p, 4, { wait: 300 }); await ff(p, 8); await ev(p, () => { const m = __mnr; m.god = false; m.SH.sh = 0; m.P.inv = 0; m.P.hp = 1; m.G.eb = []; for (let i = 0; i < 400 && !m.G.over; i++) { m.SH.sh = 0; m.P.inv = 0; if (m.P.hp > 0) m.hurt(1); m.step(1 / 30); } });
    await sleep(1500); }],
  ['22', 'checkpoint-resume', async p => { await ev(p, () => { __mnr.ARC.on = false; }); await stage(p, 4, { wait: 400 });
    const bar = await ev(p, () => (window.CHK && CHK.plan[0] && CHK.plan[0].bar) || 0); log.notes.push('22 checkpoint bar ' + bar); if (!bar) throw new Error('stage 4 has no checkpoint');
    await ev(p, bar => { const m = __mnr; m.god = true; m.G.dbar = bar - .02; m.G.dt = m.G.dbar * 4 * m.BT.spb; m.ST.hits = 0; for (let i = 0; i < 12; i++) m.step(1 / 30); }, bar); await ff(p, 2);
    await ev(p, () => { const m = __mnr; m.god = false; m.SH.sh = 0; m.P.inv = 0; m.P.hp = 1; m.G.eb = []; for (let i = 0; i < 400 && !m.G.over; i++) { m.SH.sh = 0; m.P.inv = 0; if (m.P.hp > 0) m.hurt(1); m.step(1 / 30); } });
    await sleep(1500); log.notes.push('22 resume offered: ' + await ev(p, () => { const e = document.getElementById('cpResume'); return !!e && e.offsetWidth > 0; })); }],
  ['23', 'flight-school', async p => { await click(p, '#moreBtn'); await sleep(300); await click(p, '#tutBtn'); await sleep(2500); }],
  ['24', 'lab', async p => { await click(p, '#moreBtn'); await sleep(300); await click(p, '#labBtn'); await sleep(1800); }],
  ['25', 'lab-assets', async p => { await click(p, '#moreBtn'); await sleep(300); await click(p, '#labBtn'); await sleep(1200); await click(p, '#labTab_assets'); await sleep(1200); }],
  ['26', 'street-run-start', async p => { await footEnter(p); await sleep(900); }],
  ['27', 'street-run-combat', async p => { await footEnter(p); await ev(p, footBot); await sleep(500);
    await p.waitForFunction(() => FOOT.S && FOOT.S.E.filter(e => !e.dead).length >= 2 || FOOT.S.time > 40, null, { timeout: 45000, polling: 400 }).catch(() => { }); await sleep(600); }],
  ['28', 'street-run-boss', async p => { await footEnter(p); await ev(p, footBot);
    await ev(p, () => { const S = FOOT.S; for (const l of S.st.locks) S.lockDone[l.id] = 1; S.lock = null; S.waves.forEach(w => w.done = true); S.E.length = 0; S.eb.length = 0; S.P.x = S.st.boss.x - 360; S.camX = S.st.boss.x - 700; window.__god = 1; });
    await p.waitForFunction(() => FOOT.S && FOOT.S.boss, null, { timeout: 15000, polling: 300 }).catch(() => { }); await sleep(2200); }],
  ['29', 'pause-menu', async p => { await stage(p, 4, { wait: 300 }); await ff(p, 4); await ev(p, () => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }))); await sleep(900);
    if (!await ev(p, () => !document.getElementById('pausem').hidden)) { await click(p, '#bPause'); await sleep(900); } }],
  ['30', 'daily-run', async p => { await click(p, '#dailyBtn'); await sleep(800); await dismissTale(p); await ff(p, 6); await sleep(500); }],
  ['30b', 'arcade-map', async p => { await click(p, '#moreBtn'); await sleep(300); await click(p, '#storyBtn'); await sleep(700); await click(p, '#arcA'); await sleep(900); }],
];
// STREET RUN helpers (the bot is the one the on-foot test uses, simplified: run right, shoot, hop)
async function footEnter(p) {
  await click(p, '#moreBtn'); await sleep(300);
  const b = await p.$('#footBtn'); if (!b) throw new Error('no STREET RUN button'); if (await b.isDisabled()) throw new Error('STREET RUN locked');
  if (p.vp.touch) await b.tap(); else await b.click(); await sleep(400);
  for (let i = 0; i < 8 && !(await ev(p, () => window.FOOT && FOOT.on)); i++) { await dismissTale(p); await sleep(300); }
  if (!(await ev(p, () => FOOT.on))) throw new Error('STREET RUN did not start'); await sleep(500);
}
const footBot = () => { window.__god = 1; FOOT.ctl = (S, I) => { const P = S.P; P.hp = P.max; let near = null, nd = 1e9;
  for (const e of S.E) { if (e.dead || e.x < S.camX - 5) continue; const d = Math.abs(e.x - P.x); if (d < nd) { nd = d; near = e; } }
  I.l = I.r = I.u = I.d = 0; I.fire = 1; if (near) { const dx = near.x - P.x; P.facing = dx > 0 ? 1 : -1; if (dx > 260 || dx < -260) I[dx > 0 ? 'r' : 'l'] = 1; } else I.r = 1; I.jump = 0; }; };

// ---------- running one state on both viewports ----------
async function shoot(vp, num, name, fn, q) {
  const file = `${num}-${name}-${vp.tag}.png`; const rec = { n: num, name, vp: vp.tag, file, ok: false };
  let p; const t0 = Date.now();
  try {
    p = await open(vp, q || ''); p.cur = num + '-' + name;
    await fn(p);
    await p.screenshot({ path: path.join(OUT, file) });
    const st = fs.statSync(path.join(OUT, file)); rec.bytes = st.size; rec.ok = st.size > 2000;
    if (!rec.ok) rec.why = 'tiny image (blank?)';
  } catch (e) { rec.why = String(e.message).split('\n')[0]; try { if (p) { await p.screenshot({ path: path.join(OUT, 'FAIL-' + file) }); } } catch (x) { } }
  rec.ms = Date.now() - t0; log.shots.push(rec); console.log((rec.ok ? 'PASS ' : 'FAIL ') + file + (rec.ok ? ' ' + Math.round(rec.bytes / 1024) + 'k' : ' :: ' + rec.why));
  try { if (p) await p.ctx.close(); } catch (e) { }
}

// ---------- measurements ----------
const SMALL = () => [...document.querySelectorAll('button,[role=button],a,input')].filter(b => { const r = b.getBoundingClientRect(), cs = getComputedStyle(b); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth; })
  .map(b => { const r = b.getBoundingClientRect(); return { id: b.id || '', txt: (b.textContent || b.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 24), w: Math.round(r.width), h: Math.round(r.height) }; }).filter(o => o.w < 44 || o.h < 44);
const CONTRAST = () => { const lum = c => { const a = c.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * a[0] + .7152 * a[1] + .0722 * a[2]; };
  const parse = s => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { c: v.slice(0, 3), a: v.length > 3 ? v[3] : 1 }; };
  const bgOf = e => { let n = e, img = false; while (n && n.nodeType === 1) { const cs = getComputedStyle(n), b = parse(cs.backgroundColor); if (cs.backgroundImage && cs.backgroundImage !== 'none') img = true; if (b && b.a > .5) return { c: b.c, img }; n = n.parentElement; } return { c: [0, 0, 0], img, none: true }; };
  const out = [], seen = new Set();
  for (const e of document.querySelectorAll('body *')) { if (!e.children.length || [...e.childNodes].every(n => n.nodeType !== 3 || !n.textContent.trim())) { if (e.children.length) continue; if (!e.textContent.trim()) continue; }
    const hasText = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()); if (!hasText) continue;
    const r = e.getBoundingClientRect(), cs = getComputedStyle(e); if (r.width < 2 || r.height < 2 || cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < .3 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
    const fg = parse(cs.color); if (!fg) continue; const bg = bgOf(e); const a = fg.a; const f = fg.c.map((v, i) => v * a + bg.c[i] * (1 - a)); const L1 = lum(f), L2 = lum(bg.c), cr = (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05);
    const txt = e.textContent.trim().replace(/\s+/g, ' ').slice(0, 30), key = txt + cr.toFixed(1); if (seen.has(key)) continue; seen.add(key);
    const large = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && +cs.fontWeight >= 700);
    out.push({ txt, id: e.id || e.className.toString().slice(0, 20), cr: +cr.toFixed(2), fs: Math.round(parseFloat(cs.fontSize)), large, bgImage: bg.img, noBg: !!bg.none }); }
  return out; };

async function doMeasure() {
  console.log('--- measure');
  // 1. first load transfer sizes (phone), via the network stack
  try {
    const ctx = await br.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true }); const p = await ctx.newPage(); const cdp = await ctx.newCDPSession(p); await cdp.send('Network.enable');
    const reqs = {}; cdp.on('Network.requestWillBeSent', e => { reqs[e.requestId] = { url: e.request.url, enc: 0 }; });
    cdp.on('Network.loadingFinished', e => { if (reqs[e.requestId]) reqs[e.requestId].enc = e.encodedDataLength; });
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: 'load' }); await sleep(4000);
    const list = Object.values(reqs).filter(r => /^http:\/\/127/.test(r.url)); const idx = list.find(r => /\/(index\.html)?(\?.*)?$/.test(r.url) && !/media|music/.test(r.url));
    const bodyOf = f => { try { return fs.statSync(path.join(GAME_DIR, f)).size; } catch (e) { return null; } };
    measure.load = { indexHtmlBytesOnDisk: bodyOf('index.html'), indexHtmlTransferBytes: idx && idx.enc, requests: list.length, totalTransferBytes: list.reduce((a, r) => a + r.enc, 0),
      largest: list.sort((a, b) => b.enc - a.enc).slice(0, 8).map(r => [r.url.replace(/^http:\/\/127.0.0.1:\d+/, ''), r.enc]), note: 'local python static server, no gzip/brotli: transfer = raw bytes; includes assets fetched in the first 4 s on the title screen' };
    await ctx.close();
  } catch (e) { measure.load = { error: e.message }; }
  // 2. frame times in mid-stage
  measure.frames = {};
  for (const vp of VPS) {
    try { const p = await open(vp); await stage(p, 4, { wait: 300 }); await ff(p, 10); await sleep(500);
      measure.frames[vp.tag] = await ev(p, () => new Promise(res => { const ts = []; let last = performance.now(), t0 = last; const f = t => { ts.push(t - last); last = t; if (t - t0 < 10000) requestAnimationFrame(f); else { ts.shift(); const s = ts.slice().sort((a, b) => a - b), mean = ts.reduce((a, b) => a + b, 0) / ts.length; res({ frames: ts.length, fps: +(1000 / mean).toFixed(1), meanMs: +mean.toFixed(2), p95Ms: +s[Math.floor(s.length * .95)].toFixed(2), maxMs: +s[s.length - 1].toFixed(1), over33ms: ts.filter(x => x > 33.4).length }); } }; requestAnimationFrame(f); }));
      measure.frames[vp.tag].note = 'headless chromium, software rendering (no GPU), 10 s of stage 4 with god mode and auto-fire';
      await p.ctx.close(); } catch (e) { measure.frames[vp.tag] = { error: e.message }; }
  }
  // 3. small tap targets + contrast per screen
  measure.smallTargets = {}; measure.contrast = {}; const screens = {
    title: async p => { }, menu: async p => { await click(p, '#moreBtn'); await sleep(600); }, settings: async p => { await click(p, '#moreBtn'); await sleep(300); await click(p, '#setBtn'); await sleep(600); },
    garage: async p => { await click(p, '#gaBtn'); await sleep(900); }, pause: async p => { await stage(p, 4, { wait: 300 }); await ff(p, 3); await ev(p, () => window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyP' }))); await sleep(900); },
    'street-run': async p => { await footEnter(p); await sleep(800); } };
  for (const vp of VPS) for (const k of Object.keys(screens)) {
    try { const p = await open(vp); p.cur = 'measure-' + k; await screens[k](p);
      const sm = await ev(p, SMALL); const cr = await ev(p, CONTRAST); const key = k + '-' + vp.tag;
      measure.smallTargets[key] = sm; measure.contrast[key] = { checked: cr.length, below4_5: cr.filter(o => o.cr < 4.5 && !o.large || o.cr < 3 && o.large).sort((a, b) => a.cr - b.cr).slice(0, 25), note: 'approximate: nearest opaque background-color; elements over background images flagged bgImage; canvas text not measurable' };
      await p.ctx.close(); } catch (e) { measure.smallTargets[k + '-' + vp.tag] = { error: e.message }; }
  }
  // 4. source facts
  const read = f => { try { return fs.readFileSync(f, 'utf8'); } catch (e) { return ''; } };
  const parts = fs.readdirSync(PARTS).filter(f => /\.(js|html)$/.test(f)); const grep = (re) => { const hits = []; for (const f of parts) { const t = read(path.join(PARTS, f)); const m = t.match(re); if (m) hits.push(f + ' x' + m.length); } return hits; };
  const idxT = read(path.join(GAME_DIR, 'index.html')), manifest = fs.existsSync(path.join(GAME_DIR, 'manifest.webmanifest')), swFile = fs.existsSync(path.join(GAME_DIR, 'sw.js'));
  measure.sourceFacts = { reducedMotion: { matchMediaReduce: grep(/prefers-reduced-motion/g), reduceWord: grep(/reduce/gi), note: 'plus an in-game FLASHING setting (OFF / REDUCED / FULL)' },
    pwa: { manifestFile: manifest, manifestLinked: /rel=["']manifest["']/.test(idxT), swFile, swRegistered: /serviceWorker\.register/.test(idxT) },
    saveExport: { exportInSource: grep(/export/gi), exportButtonsSeen: 'EXPORT FILE / COPY CODE / IMPORT CODE / IMPORT FILE in settings (ids sioFile, sioCopy, sioPaste, sioLoad)' } };
  try { const p = await open(VPS[0]); const sw = await ev(p, async () => { await new Promise(r => setTimeout(r, 2500)); const regs = navigator.serviceWorker ? await navigator.serviceWorker.getRegistrations() : []; return { supported: !!navigator.serviceWorker, registrations: regs.length, manifestLink: !!document.querySelector('link[rel=manifest]'), pwaBtn: !!document.getElementById('pwaBtn') }; }); measure.pwaRuntime = sw; await p.ctx.close(); } catch (e) { measure.pwaRuntime = { error: e.message }; }
  measure.pageErrors = log.errors.length;
}

(async () => {
  port = await freePort(); const srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/index.html`)).ok) break; } catch (e) { } await sleep(100); }
  br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  try {
    for (const [num, name, fn, q] of STATES) { if (process.env.MEASURE_ONLY || (ONLY.length && !ONLY.includes(num))) continue; for (const vp of VPS) await shoot(vp, num, name, fn, q); }
    if (!process.env.NOMEASURE && (!ONLY.length || process.env.MEASURE_ONLY)) await doMeasure();
  } finally {
    log.finished = new Date().toISOString();
    // a partial run (ONLY / VP) merges into the log that is already there instead of replacing it
    const lf = path.join(OUT, 'tour-log.json'); let old = null; try { old = JSON.parse(fs.readFileSync(lf, 'utf8')); } catch (e) { }
    if (old && (ONLY.length || process.env.VP || process.env.MEASURE_ONLY)) { const key = s => s.file; const mine = new Set(log.shots.map(key)); log.shots = old.shots.filter(s => !mine.has(s.file)).concat(log.shots).sort((a, b) => a.file.localeCompare(b.file)); log.errors = (old.errors || []).concat(log.errors); log.notes = (old.notes || []).concat(log.notes); }
    log.pass = log.shots.filter(s => s.ok).length; log.total = log.shots.length; log.pageErrors = log.errors.length;
    fs.writeFileSync(lf, JSON.stringify(log, null, 1));
    if (Object.keys(measure).length) fs.writeFileSync(path.join(OUT, 'measure.json'), JSON.stringify(measure, null, 1));
    await br.close(); srv.kill(); console.log(`${log.pass}/${log.total} shots ok, ${log.errors.length} page errors`);
  }
})();
