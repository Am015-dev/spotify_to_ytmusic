// Phone check: no AI. Plays every published game on a phone-sized mobile browser in 6 scenarios and prints a table.
// Run all:  NODE_PATH=/opt/node-tools/node_modules node games-src/scripts/phone-check.js
// One game: NODE_PATH=/opt/node-tools/node_modules node games-src/scripts/phone-check.js sunglaze-next [more slugs]
// Env: PORT (8097), JOBS (parallel games, default 3), GAME_MS (per-game limit, default 180000).
// Output: games-src/scripts/phone-check-results.md and phone-check-shots/<game>/<scenario>.png
const fs = require('fs'), path = require('path'), cp = require('child_process');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..', '..');
// Env overrides (used by build-all.py): GAMES_DIR = folder holding <slug>/index.html (default games/), PC_OUT_DIR = where results + shots go.
const GAMES = process.env.GAMES_DIR ? path.resolve(process.env.GAMES_DIR) : path.join(ROOT, 'games');
const OUT_DIR = process.env.PC_OUT_DIR ? path.resolve(process.env.PC_OUT_DIR) : __dirname;
const SHOTS = path.join(OUT_DIR, 'phone-check-shots');
const OUT = path.join(OUT_DIR, 'phone-check-results.md');
let PORT = +process.env.PORT || 8097;
const JOBS = +process.env.JOBS || 3;
const GAME_MS = +process.env.GAME_MS || 180000;
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const P = { w: 390, h: 763 }, S = { w: 375, h: 553 }, L = { w: 844, h: 390 };
const SCENARIOS = [
  { id: 'portrait', label: '390x763', start: P },
  { id: 'small', label: '375x553', start: S },
  { id: 'landscape', label: '844x390', start: L },
  { id: 'rot-p2l', label: 'P>L', start: P, then: L },
  { id: 'rot-l2p', label: 'L>P', start: L, then: P },
  { id: 'stale', label: 'stale', start: P, then: L, stale: true },
];

function listGames() {
  const dirs = fs.readdirSync(GAMES).filter(d => fs.existsSync(path.join(GAMES, d, 'index.html')));
  const out = [];
  for (const d of dirs) {
    if (/^mainhattan-/.test(d) || /ticket-to-ride/.test(d)) continue;
    if (d.endsWith('-next')) { out.push(d); continue; }
    if (dirs.includes(d + '-next')) continue;
    if (d === 'thornbound' && dirs.includes('thornbound-new')) continue;
    out.push(d);
  }
  return out.sort();
}

// ---- in-page helpers (injected as strings) ----
const PAGE_LIB = `(() => {
  const TAP = 'button,a[href],[role=button],[onclick],input,select,summary,[data-act],[tabindex]:not([tabindex="-1"])';
  const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e);
    return r.width >= 4 && r.height >= 4 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05 && s.pointerEvents !== 'none'; };
  const label = e => (e.innerText || e.value || e.getAttribute('aria-label') || e.title || '').replace(/\\s+/g, ' ').trim().slice(0, 50);
  const scrollAnc = e => { for (let p = e.parentElement; p && p !== document.body && p !== document.documentElement; p = p.parentElement) {
    const s = getComputedStyle(p); if (/(auto|scroll)/.test(s.overflowX + s.overflowY) && (p.scrollWidth > p.clientWidth + 1 || p.scrollHeight > p.clientHeight + 1)) return true; } return false; };
  const hidden = e => { for (let p = e; p; p = p.parentElement) { if (p.hasAttribute && (p.hasAttribute('hidden') || p.getAttribute('aria-hidden') === 'true')) return true; } return false; };
  const modalCover = t => { for (let p = t; p && p !== document.body; p = p.parentElement) { const s = getComputedStyle(p);
    if (s.position === 'fixed' || s.position === 'absolute') { const r = p.getBoundingClientRect(); if (r.width * r.height >= 0.5 * innerWidth * innerHeight) return true; } } return false; };
  const ghost = t => { const sv = t.closest && t.closest('svg'); if (!sv) return false; const r = sv.getBoundingClientRect(); return r.width < 120 && r.height < 120; };
  window.__pc = {
    tappables() {
      const set = new Set(document.querySelectorAll(TAP));
      const all = document.body ? document.body.querySelectorAll('*') : [];
      if (all.length < 4000) for (const e of all) { if (set.has(e) || /^(HTML|BODY|CANVAS|SVG|PATH|G|CIRCLE|RECT|USE)$/i.test(e.tagName)) continue;
        if (getComputedStyle(e).cursor === 'pointer' && !(e.parentElement && getComputedStyle(e.parentElement).cursor === 'pointer')) set.add(e); }
      return [...set].filter(e => vis(e) && !hidden(e));
    },
    audit() {
      const W = innerWidth, H = innerHeight, covered = [], off = [];
      const els = [...this.tappables(), ...document.querySelectorAll('canvas')].filter(e => vis(e));
      for (const e of els) {
        const r = e.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2, n = label(e) || e.tagName.toLowerCase() + (e.id ? '#' + e.id : '');
        if (/enable accessibility|skip to/i.test(n)) continue;
        const outside = r.right > W + 2 || r.left < -2 || r.bottom > H + 2 || r.top < -2;
        if (outside && !scrollAnc(e)) { if (e.tagName !== 'CANVAS' || r.right > W + 2 || r.left < -2) off.push(n); continue; }
        if (e.tagName === 'CANVAS') continue;
        if (cx < 0 || cy < 0 || cx > W || cy > H) continue;
        const t = document.elementFromPoint(cx, cy);
        if (t && t !== e && !e.contains(t) && !t.contains(e) && !modalCover(t) && !ghost(t)) covered.push(n + ' <- ' + (t.id ? '#' + t.id : t.tagName.toLowerCase() + (t.className && t.className.baseVal === undefined ? '.' + String(t.className).split(' ')[0] : '')));
      }
      // wordy: any visible text block over 8 words during play (advice cards, tips, coach panels)
      const wordy = [];
      for (const e of document.body ? document.body.querySelectorAll('*') : []) {
        if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|SVG|TEXT|TSPAN)$/i.test(e.tagName) || !vis(e) || hidden(e)) continue;
        if (getComputedStyle(e).display.startsWith('inline')) continue;
        if (![...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
        const r = e.getBoundingClientRect(); if (r.bottom < 0 || r.top > H || r.right < 0 || r.left > W) continue;
        if (e.closest('[class*=drawer],[class*=Drawer],[class*=rules],[class*=ref],[class*=menu],[class*=gamelog],[class*=-log],[id$=log],[class*=settings],[aria-modal=true],[data-help]')) continue; // opened on purpose by the player, or help (lightbulb, first-time coach bubble)
        const words = (e.innerText || '').replace(/[^a-zA-Z0-9'’]+/g, ' ').trim().split(' ').filter(w => /[a-z][a-z]/i.test(w));
        if (words.length > 8) wordy.push(words.length + 'w "' + words.slice(0, 6).join(' ') + '…"');
      }
      // board-first: the element marked [data-board] must fill >=55% of a portrait screen during play
      let board = null; const bd = document.querySelector('[data-board]');
      if (bd && H > W) { const r = bd.getBoundingClientRect(); const vw = Math.max(0, Math.min(r.right, W) - Math.max(r.left, 0)), vh = Math.max(0, Math.min(r.bottom, H) - Math.max(r.top, 0)); board = Math.round(100 * vw * vh / (W * H)); }
      const de = document.documentElement;
      return { board, wordy, covered, off, hscroll: Math.max(de.scrollWidth, document.body ? document.body.scrollWidth : 0) > W + 1, sw: de.scrollWidth, iw: W };
    },
    snap() {
      let h = 0; const s = document.documentElement.outerHTML; h = s.length;
      for (let i = 0; i < s.length; i += 7) h = (h * 31 + s.charCodeAt(i)) | 0;
      let c = '';
      try { for (const cv of document.querySelectorAll('canvas')) { const t = document.createElement('canvas'); t.width = 24; t.height = 24;
        const x = t.getContext('2d'); x.drawImage(cv, 0, 0, 24, 24); const d = x.getImageData(0, 0, 24, 24).data; let k = 0; for (let i = 0; i < d.length; i += 5) k = (k * 31 + d[i]) | 0; c += k + ','; } } catch (e) { c += 'x'; }
      return h + '|' + c;
    },
    // buttons whose text looks like a dismiss / start action, with prominence (area)
    actions() {
      const res = [];
      for (const e of this.tappables()) {
        if (e.disabled) continue;
        const r = e.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) continue;
        const t = document.elementFromPoint(cx, cy); if (t && t !== e && !e.contains(t) && !t.contains(e)) continue;
        res.push({ t: label(e), x: cx, y: cy, a: r.width * r.height, cls: String(e.className && e.className.baseVal === undefined ? e.className : '') });
      }
      return res;
    },
    glow() {
      const sel = '[class*=glow],[class*=legal],[class*=highlight],[class*=hilite],[class*=target],[class*=valid],[class*=pulse],[class*=playable],[class*=selectable],[class*=can-],[class*=avail],[class*=possible],[class*=canpick],[class*=pickable]';
      const res = [];
      for (const e of document.querySelectorAll(sel)) {
        if (!vis(e) || e.disabled || /hint|banner|toast/i.test(String(e.className))) continue;
        const r = e.getBoundingClientRect(); const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        if (r.width > innerWidth * 0.9 && r.height > innerHeight * 0.6) continue; // a whole screen, not a piece
        if (cx < 0 || cy < 0 || cx > innerWidth || cy > innerHeight) continue;
        const t = document.elementFromPoint(cx, cy); if (!t) continue;
        res.push({ t: label(e), x: cx, y: cy, a: r.width * r.height });
      }
      return res;
    },
    canvasPts() {
      const res = [];
      for (const cv of document.querySelectorAll('canvas')) { if (!vis(cv)) continue; const r = cv.getBoundingClientRect(); if (r.width < 100) continue;
        for (const [fx, fy] of [[.5, .5], [.3, .6], [.7, .6], [.5, .75], [.5, .3], [.25, .4]]) { const x = r.left + r.width * fx, y = r.top + r.height * fy; if (x > 0 && y > 0 && x < innerWidth && y < innerHeight) res.push({ t: 'canvas', x, y, a: 1 }); } }
      return res;
    },
  };
})()`;

const DISMISS = /^(ok|okay|got it|gotcha|skip|skip all|skip tips?|close|dismiss|no thanks|maybe later|x|×|✕|✖|continue|next|let'?s go|i understand|understood|done)\W*$/i;
const START_RX = /(vs\.?\s*(the\s*)?(computer|cpu|ai|bot)|computer|cpu|solo|single|1 player|one player|play|start|begin|new game|new run|quick|battle|let'?s|go|enter|deal|roll)/i;
const AVOID_RX = /(menu|setting|option|quit|restart|home|exit|sound|music|mute|help|rules|how to|credits|back|pause|about|tutorial|share|score|stats|log|hint|leaderboard|achievement|install|2 player|two player|multiplayer|online|pass|hot ?seat)/i;

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function waitChange(page, before, ms) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    await sleep(80);
    const now = await page.evaluate('window.__pc.snap()').catch(() => before);
    if (now !== before) return Date.now() - t0;
  }
  return -1;
}

async function ensureLib(page) { await page.evaluate(PAGE_LIB).catch(() => {}); }

async function tap(page, x, y) { await page.touchscreen.tap(x, y); }

async function autoStart(page, log) {
  let clicked = 0, lastKey = '';
  for (let round = 0; round < 7; round++) {
    await ensureLib(page);
    const acts = await page.evaluate('window.__pc.actions()').catch(() => []);
    const dis = acts.filter(a => DISMISS.test(a.t));
    let pick = null;
    // prefer the computer-opponent option, then any start-like button, largest first
    const comp = acts.filter(a => /(computer|cpu|solo|single|1 player|one player|vs\.?\s*(ai|bot))/i.test(a.t) && !AVOID_RX.test(a.t.replace(/computer|cpu/i, '')));
    const start = acts.filter(a => START_RX.test(a.t) && !AVOID_RX.test(a.t) && !DISMISS.test(a.t));
    if (comp.length) pick = comp.sort((a, b) => b.a - a.a)[0];
    else if (start.length) pick = start.sort((a, b) => b.a - a.a)[0];
    else if (dis.length) pick = dis.sort((a, b) => b.a - a.a)[0];
    if (!pick) break;
    const key = pick.t + Math.round(pick.x) + Math.round(pick.y);
    if (key === lastKey && round > 2) break; // same button again: nothing happening
    lastKey = key;
    log.push('start:' + pick.t);
    await tap(page, pick.x, pick.y); clicked++;
    await sleep(700);
  }
  // clear any remaining tips
  for (let i = 0; i < 3; i++) {
    const acts = await page.evaluate('window.__pc.actions()').catch(() => []);
    const d = acts.filter(a => DISMISS.test(a.t))[0];
    if (!d) break;
    await tap(page, d.x, d.y); clicked++; await sleep(500);
  }
  return clicked;
}

async function nextCandidate(page, used) {
  await ensureLib(page);
  let c = await page.evaluate('window.__pc.glow()').catch(() => []);
  c = c.filter(x => !DISMISS.test(x.t) || true);
  if (!c.length) {
    const all = await page.evaluate('window.__pc.actions()').catch(() => []);
    c = all.filter(a => !AVOID_RX.test(a.t) && !START_RX.test(a.t) && a.a < innerArea());
    const d = all.filter(a => DISMISS.test(a.t));
    if (!c.length && d.length) c = d;
    if (!c.length) c = await page.evaluate('window.__pc.canvasPts()').catch(() => []);
  }
  if (!c.length) return null;
  c.sort((a, b) => (used.has(Math.round(a.x / 4) + ',' + Math.round(a.y / 4)) ? 1 : 0) - (used.has(Math.round(b.x / 4) + ',' + Math.round(b.y / 4)) ? 1 : 0));
  return c[0];
  function innerArea() { return 1e9; }
}

async function doMoves(page, n, st, used) {
  for (let i = 0; i < n; i++) {
    const c = await nextCandidate(page, used);
    if (!c) { st.noCandidate = true; break; }
    used.add(Math.round(c.x / 4) + ',' + Math.round(c.y / 4));
    const before = await page.evaluate('window.__pc.snap()').catch(() => '');
    await tap(page, c.x, c.y); st.moves++;
    const lat = await waitChange(page, before, 1000);
    if (lat < 0) { st.unresp++; st.unrespWhat.push(c.t || 'tap'); } else st.lat.push(lat);
    await sleep(500);
  }
}

async function audit(page, st, tag) {
  await ensureLib(page);
  const a = await page.evaluate('window.__pc.audit()').catch(() => null);
  if (!a) return;
  for (const c of a.covered) st.covered.add(c);
  for (const o of a.off) st.off.add(o);
  if (tag !== 'start') for (const w of a.wordy || []) st.wordy.add(w);
  if (tag !== 'start' && a.board !== null && a.board < 55) st.smallBoard.add(tag + ' ' + a.board + '%');
  if (a.hscroll) st.hscroll.add(tag + ' ' + a.sw + '>' + a.iw);
}

async function runScenario(browser, slug, sc, deadline) {
  const st = { moves: 0, unresp: 0, unrespWhat: [], lat: [], covered: new Set(), off: new Set(), hscroll: new Set(), wordy: new Set(), smallBoard: new Set(), errors: [], stuck: false, noCandidate: false, started: false, notes: [] };
  const ctx = await browser.newContext({ viewport: { width: sc.start.w, height: sc.start.h }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: UA, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  page.on('pageerror', e => st.errors.push(String(e.message || e).split('\n')[0].slice(0, 120)));
  const dir = path.join(SHOTS, slug); fs.mkdirSync(dir, { recursive: true });
  const shot = async () => { try { await page.screenshot({ path: path.join(dir, sc.id + '.png'), scale: 'css' }); } catch (e) {} };
  try {
    const resp = await page.goto(`http://127.0.0.1:${PORT}/${slug}/`, { waitUntil: 'load', timeout: 30000 }).catch(e => { st.notes.push('load: ' + e.message.slice(0, 60)); return null; });
    if (resp && resp.status() >= 400) st.notes.push('http ' + resp.status());
    await sleep(1500);
    await ensureLib(page);
    const log = [];
    const clicks = await autoStart(page, log);
    await sleep(600);
    const used = new Set();
    await doMoves(page, 6, st, used);
    st.started = clicks > 0 || st.moves > 0;
    await audit(page, st, sc.label);
    if (sc.then) {
      const ev = () => page.evaluate(`(()=>{window.dispatchEvent(new Event('resize'));window.dispatchEvent(new Event('orientationchange'));try{screen.orientation&&screen.orientation.dispatchEvent(new Event('change'))}catch(e){}})()`).catch(() => {});
      if (sc.stale) {
        await ev(); // events while the size is still old
        await page.setViewportSize({ width: sc.then.w, height: sc.then.h });
        await ev(); // and again immediately, before layout settles
        await sleep(250); // transient layout mid-animation is ignored; only the settled state is judged
        await sleep(1300);
      } else {
        await page.setViewportSize({ width: sc.then.w, height: sc.then.h });
        await ev(); await sleep(1200);
      }
      await ensureLib(page);
      await audit(page, st, 'after-rotate');
      if (!st.started) { const c2 = await autoStart(page, log); st.started = c2 > 0; }
      await doMoves(page, 3, st, used);
      await audit(page, st, 'after-rotate-play');
    }
    // stuck: nothing to tap and nothing changing for 8 s
    const c = await nextCandidate(page, new Set());
    if (!c) {
      const before = await page.evaluate('window.__pc.snap()').catch(() => '');
      const lat = await waitChange(page, before, 8000);
      if (lat < 0) st.stuck = true;
      else { // something moved (computer turn?) - give it another go
        await doMoves(page, 2, st, used);
        const c3 = await nextCandidate(page, new Set());
        if (!c3) { const b2 = await page.evaluate('window.__pc.snap()').catch(() => ''); if ((await waitChange(page, b2, 8000)) < 0) st.stuck = true; }
      }
    }
    await shot();
  } catch (e) {
    st.notes.push('crash: ' + String(e.message).slice(0, 80)); await shot();
  } finally { await ctx.close().catch(() => {}); }
  return st;
}

function verdict(st) {
  if (!st.started && st.moves === 0) return { ok: false, text: "couldn't start" };
  const r = [];
  if (st.errors.length) r.push(st.errors.length + ' err');
  if (st.covered.size) r.push('covered: ' + [...st.covered].slice(0, 2).join(', '));
  if (st.off.size) r.push('off-screen: ' + [...st.off].slice(0, 2).join(', '));
  if (st.hscroll.size) r.push('hscroll ' + [...st.hscroll][0]);
  if (st.smallBoard.size) r.push('board <55% of screen: ' + [...st.smallBoard][0]);
  if (st.wordy.size) r.push('text >8 words: ' + [...st.wordy].slice(0, 2).join(', '));
  if (st.unresp > 1) r.push(st.unresp + ' dead taps');
  if (st.stuck) r.push('stuck 8s');
  if (st.notes.length) r.push(st.notes[0]);
  const lat = st.lat.length ? Math.max(...st.lat) : 0;
  const med = st.lat.length ? [...st.lat].sort((a, b) => a - b)[st.lat.length >> 1] : 0;
  const tail = ` (${st.moves}mv, ${med}ms${st.unresp === 1 ? ', 1 dead' : ''}${st.moves === 0 ? ', no moves found' : ''})`;
  if (lat > 800) r.push('slow ' + lat + 'ms');
  return { ok: r.length === 0, text: (r.length ? 'FAIL ' + r.join('; ') : 'PASS') + tail };
}

async function checkGame(slug) {
  const t0 = Date.now(), deadline = t0 + GAME_MS;
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const cells = {}, errs = new Set();
  let killed = false;
  const timer = setTimeout(() => { killed = true; browser.close().catch(() => {}); }, GAME_MS);
  try {
    for (const sc of SCENARIOS) {
      if (killed || Date.now() > deadline) { cells[sc.id] = { ok: false, text: 'FAIL timeout (3 min game limit)' }; continue; }
      let st;
      try { st = await runScenario(browser, slug, sc, deadline); }
      catch (e) { cells[sc.id] = { ok: false, text: killed ? 'FAIL timeout (3 min game limit)' : 'FAIL crash ' + String(e.message).slice(0, 50) }; continue; }
      st.errors.forEach(e => errs.add(e));
      cells[sc.id] = verdict(st);
    }
  } finally { clearTimeout(timer); await browser.close().catch(() => {}); }
  console.log(`${slug.padEnd(24)} ${SCENARIOS.map(s => (cells[s.id].ok ? 'ok' : cells[s.id].text.startsWith("couldn't") ? 'NOSTART' : 'FAIL').padEnd(8)).join('')} errors:${errs.size} ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  return { slug, cells, errs: [...errs] };
}

async function serverUp() { try { await fetch(`http://127.0.0.1:${PORT}/`); return true; /* any answer (a 404 is fine for a staging folder) */ } catch (e) { return false; } }

(async () => {
  let games = listGames();
  const want = process.argv.slice(2);
  if (want.length) games = want;
  let srv = null;
  if (!process.env.PORT) PORT = await new Promise(r => { const t = require('net').createServer().listen(0, '127.0.0.1', () => { const q = t.address().port; t.close(() => r(q)); }); }); // free port: never reuse another run's server
  for (let tries = 0; tries < 10 && !srv; tries++, PORT++) { // port may be held by a server for another dir: move on
    const p = cp.spawn('python3', ['-m', 'http.server', String(PORT), '--directory', GAMES], { stdio: 'ignore' });
    let dead = false; p.on('exit', () => { dead = true; });
    for (let i = 0; i < 15 && !dead && !(await serverUp()); i++) await sleep(200);
    if (!dead && await serverUp()) { srv = p; PORT--; } else p.kill();
  }
  if (!srv) throw new Error('could not start http server');
  console.log('checking: ' + games.join(' '));
  const results = [], queue = [...games];
  await Promise.all(Array.from({ length: Math.min(JOBS, games.length) }, async () => {
    while (queue.length) { const g = queue.shift(); results.push(await checkGame(g).catch(e => ({ slug: g, cells: {}, errs: ['runner: ' + e.message] }))); }
  }));
  if (srv) srv.kill();
  results.sort((a, b) => a.slug.localeCompare(b.slug));
  const short = c => !c ? '-' : c.ok ? 'PASS' : c.text.startsWith("couldn't") ? "couldn't start" : c.text.replace(/^FAIL /, 'FAIL: ').replace(/ \(\d+mv.*$/, '');
  let md = `# Phone check results\n\nGenerated ${new Date().toISOString()} by games-src/scripts/phone-check.js (mobile Chromium, DSF 3, touch). Scenarios: ${SCENARIOS.map(s => s.label).join(', ')}. Screenshots: games-src/scripts/phone-check-shots/<game>/<scenario>.png\n\n`;
  md += `| game | ${SCENARIOS.map(s => s.label).join(' | ')} | errors |\n|---|${SCENARIOS.map(() => '---').join('|')}|---|\n`;
  for (const r of results) md += `| ${r.slug} | ${SCENARIOS.map(s => short(r.cells[s.id]).replace(/\|/g, '/')).join(' | ')} | ${r.errs.length ? r.errs.length + ': ' + r.errs[0].replace(/\|/g, '/') : 'none'} |\n`;
  md += `\n## Detail (moves, median tap latency)\n\n`;
  for (const r of results) { md += `**${r.slug}**\n`; for (const s of SCENARIOS) md += `- ${s.label}: ${r.cells[s.id] ? r.cells[s.id].text : '-'}\n`; if (r.errs.length) md += `- errors: ${r.errs.join(' / ')}\n`; md += '\n'; }
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT, md);
  const pass = results.filter(r => SCENARIOS.every(s => r.cells[s.id] && r.cells[s.id].ok)).length;
  console.log(`\n${pass}/${results.length} games pass all scenarios. Wrote ${OUT}`);
})();
