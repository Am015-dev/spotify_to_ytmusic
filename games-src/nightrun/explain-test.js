#!/usr/bin/env node
// EXPLAIN gate (parts/explain.js, rule 8 of WORKER-RULES): every canvas draw call site seen in fly stages 1/4/8/12, a boss and endless wave 10 on a 390x763
// phone must be listed (backticked key) in VISUAL-INVENTORY.md; captions show once each; ?explain=0 restores. PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/explain-test.js        INV=1 also writes /tmp inventory json (path printed)
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun'), PARTS = path.join(__dirname, 'parts');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
let fails = 0; const ok = (n, p, i) => { if (!p) fails++; console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + JSON.stringify(i))); };
// built line -> part file (the build concatenates parts, so a long line is unique)
const lineMap = () => { const m = new Map(); for (const f of fs.readdirSync(PARTS)) if (f.endsWith('.js')) fs.readFileSync(path.join(PARTS, f), 'utf8').split('\n').forEach((l, i) => { if (l.trim().length > 12 && !m.has(l)) m.set(l, f + ':' + (i + 1)); }); return m; };
const PROBE = () => {   // runs in the page before any game code
  Error.stackTraceLimit = 40; window.__probe = 0; window.__sites = {};
  const P = CanvasRenderingContext2D.prototype, a0 = P.arc;
  P.arc = function (x, y, r) { const s = window.__ship; if (window.__probe && s && r > 18 && Math.abs(x - s.x) < 2 && Math.abs(y - s.y) < 2) window.__rings++; return a0.apply(this, arguments); };
  for (const k of ['fill', 'stroke', 'fillRect', 'strokeRect', 'fillText', 'strokeText', 'drawImage']) { const o = P[k]; P[k] = function () {
    if (window.__probe) { const s = new Error().stack.split('\n').slice(2).filter(l => /index\.html/.test(l)).slice(0, 9).map(l => { const m = l.match(/at (?:(\S+) \()?.*index\.html[^:]*:(\d+):(\d+)/); return m ? (m[1] || '?') + '@' + m[2] : '?'; });
      const key = s.join('<'); const r = window.__sites[key] || (window.__sites[key] = { n: 0, sc: {}, op: k, txt: '' }); r.n++; r.sc[window.__scn] = (r.sc[window.__scn] || 0) + 1; if (k === 'fillText' && !r.txt) r.txt = String(arguments[0]).slice(0, 40); }
    return o.apply(this, arguments); }; }
};
const RUN = new Function('o', `
  const m = window.__mnr; let sd = 7; Math.random = () => { sd = (sd + 0x6D2B79F5) >>> 0; let t = sd; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  m.god = true; window.__scn = o.scn; if (o.story) m.startStory(o.story); else document.getElementById('startBtn').click(); m.simOn(true);
  let i = 0, dom = {}, rmax = 0; const t0 = m.G.t;
  while (m.running && i < o.steps && (!o.wave || !window.ENDR || ENDR.w < o.wave)) { if (m.SH && m.SH.active) m.SH.close(); if (i % 20 === 0) m.press('Fire'); if (i % 3 === 0) m.touchTo(195 + 150 * Math.sin(i / 50), 520 + 120 * Math.sin(i / 37));
    if (o.boss && !m.G.boss && i > 200 && i % 60 === 0) m.bossNow();
    m.step(1 / 60); i++;
    if (i % o.every === 0 && (!o.boss || m.G.boss)) { window.__ship = m.P; window.__rings = 0; window.__probe = 1; try { m.render(m.G.t, 1 / 60); } catch (e) {} window.__probe = 0; rmax = Math.max(rmax, window.__rings);
      for (const e of document.querySelectorAll('body *')) { if (e.children.length && !e.matches('button')) continue; const r = e.getBoundingClientRect(); if (!r.width || !r.height || r.bottom < 0 || r.top > innerHeight) continue;
        const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity === 0 || e.closest('[hidden]') || e.tagName === 'CANVAS') continue; let a = e, hid = 0; while (a) { if (getComputedStyle(a).display === 'none') { hid = 1; break; } a = a.parentElement; } if (hid) continue;
        const k = (e.id ? '#' + e.id : e.tagName.toLowerCase() + (e.className && typeof e.className === 'string' ? '.' + e.className.split(' ')[0] : '')) + (e.parentElement && e.parentElement.id ? ' in #' + e.parentElement.id : '');
        const d = dom[k] || (dom[k] = { n: 0, txt: '' }); d.n++; const ps = ['::before', '::after'].map(x => { const c = getComputedStyle(e, x).content; return c && c !== 'none' && c !== 'normal' ? c.replace(/^"|"$/g, '') : ''; }).filter(Boolean).join(' | '); if (ps) { const pk = k + ' pseudo'; const pd = dom[pk] || (dom[pk] = { n: 0, txt: '' }); pd.n++; if (!pd.txt || pd.txt.length < ps.length) pd.txt = ps.slice(0, 40); } const tx = (e.textContent || '').trim().slice(0, 40); if (tx && !d.txt) d.txt = tx; } } }
  const r = { rmax, scn: o.scn, steps: i, t: m.G.t - t0, boss: !!m.G.boss, wave: window.ENDR ? ENDR.w : -1, dom, cap: window.EXP ? Object.keys(EXP.shown || {}) : [] }; m.abort(); return r;`);
const SCN = [{ scn: 'st1', story: 1, steps: 3600, every: 30 }, { scn: 'st4', story: 4, steps: 3600, every: 30 }, { scn: 'st8', story: 8, steps: 3600, every: 30 }, { scn: 'st12', story: 12, steps: 3600, every: 30 },
  { scn: 'boss', story: 8, steps: 4200, every: 20, boss: 1 }, { scn: 'end10', steps: 60 * 700, every: 60, wave: 11 }];
// plumbing = ctx wrappers and shared paint helpers: the site is the first caller above them
const PLUMB = /^(c|ctx|Object\.c|Object\.ctx)\.\w+$|^(Object\.)?(ART\.(sp|tint|hue|sil|put|paintP|drawAnim|dflash|portrait)|glow|G_|wtxt|sheet|tintOf|cf|size|scale)$|^\?$/;
const keyOf = (s, lm, lines) => { const fr = s.split('<').map(f => { const [fn, ln] = f.split('@'); const loc = lm.get(lines[+ln - 1]) || 'built:' + ln; return { fn, part: loc.split(':')[0] }; });
  const h = fr.find(f => !PLUMB.test(f.fn)) || fr[0]; if (!h) return '?'; return h.part + ':' + (h.fn === '?' ? 'anon' : h.fn.replace(/^Object\./, '')); };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(800); const base = 'http://127.0.0.1:' + port;
  const browser = await PW.chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' }).catch(() => PW.chromium.launch());
  const errs = [], q = process.env.Q || '';
  try {
    const lm = lineMap(), lines = fs.readFileSync(path.join(GAME_DIR, 'index.html'), 'utf8').split('\n');
    const ctx = await browser.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 }), p = await ctx.newPage();
    p.on('pageerror', e => errs.push(e.message)); await ctx.addInitScript(PROBE);
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.goto(base + '/index.html?sim=1&all=1' + q); await p.waitForFunction(() => window.__mnr && document.getElementById('startBtn')); await sleep(600);
    const out = [];
    for (const s of (process.env.ONLY ? SCN.filter(x => x.scn === process.env.ONLY) : SCN)) { const r = await p.evaluate(RUN, s); out.push(r); console.log('INFO ' + s.scn + ' steps ' + r.steps + ' boss ' + r.boss + ' wave ' + r.wave + ' captions ' + r.cap.length + ' ship rings max ' + r.rmax); }
    const raw = await p.evaluate(() => window.__sites), sites = {};
    for (const [s, v] of Object.entries(raw)) { const k = keyOf(s, lm, lines); const r = sites[k] || (sites[k] = { n: 0, sc: {}, ops: {}, txt: '', ex: s }); r.n += v.n; r.ops[v.op] = 1; if (v.txt && !r.txt) r.txt = v.txt; for (const [a, b] of Object.entries(v.sc)) r.sc[a] = (r.sc[a] || 0) + b; }
    const dom = {}; for (const r of out) for (const [k, v] of Object.entries(r.dom)) { const d = dom[k] || (dom[k] = { n: 0, sc: [], txt: v.txt }); d.n += v.n; d.sc.push(r.scn); }
    if (process.env.INV) { const f = process.env.INV === '1' ? '/tmp/explain-inv.json' : process.env.INV; fs.writeFileSync(f, JSON.stringify({ sites, dom, out: out.map(r => ({ scn: r.scn, steps: r.steps, boss: r.boss, wave: r.wave, cap: r.cap })) }, null, 1)); console.log('INFO inventory ' + f); }
    const inv = fs.readFileSync(path.join(__dirname, 'VISUAL-INVENTORY.md'), 'utf8'), ap = new Set([...inv.matchAll(/`([a-z0-9]+\.js:[\w$.]+)`/gi)].map(m => m[1]));
    const miss = Object.keys(sites).filter(k => !ap.has(k));
    ok('every draw call site is in the approved list (' + Object.keys(sites).length + ' sites)', miss.length === 0, miss);
    if (!/explain=0/.test(q)) ok('at most 2 rings round the ship in any frame', out.every(r => r.rmax <= 2), out.map(r => r.scn + ':' + r.rmax));
    ok('boss scene reached a boss', out.some(r => r.scn !== 'boss' || r.boss) && (!out.find(r => r.scn === 'boss') || out.find(r => r.scn === 'boss').boss));
    if (!/explain=0/.test(q)) {
      const c = await p.evaluate(() => { const E = window.EXP; if (!E) return { has: 0 }; E.reset(); const once = {}; let dup = 0; const o = E.show; E.show = function (k) { const was = E.shown[k]; const r = o.apply(this, arguments); if (!was && E.shown[k]) once[k] = (once[k] || 0) + 1; else if (was && E.cap && E.cap.k === k && E.cap.fresh) dup++; return r; };
        for (const k of Object.keys(E.TXT)) { E.show(k, 100, 100); E.show(k, 100, 100); } E.show = o; return { has: 1, on: E.on, n: Object.keys(E.TXT).length, once, dup, words: Object.values(E.TXT).every(t => !/[~×]|x~|\bx\d|\d+x\b/.test(t)) }; });
      ok('explain ON, every caption shows once only', c.has && c.on && Object.keys(c.once).length === c.n && Object.values(c.once).every(v => v === 1) && c.dup === 0, c);
      ok('captions are plain words (no x~ / symbols)', c.words, c);
      const txt = Object.entries(sites).filter(([k, v]) => v.txt && /x~|~\d/.test(v.txt)).map(([k, v]) => k + ' ' + v.txt);
      ok('no "x~" text drawn on the field', txt.length === 0, txt);
      const lbl = Object.entries(dom).filter(([k, v]) => /x~|~\d/.test(v.txt)).map(([k, v]) => k + ' ' + v.txt); ok('no "x~" text in the HUD', lbl.length === 0, lbl);
    }
    const off = await browser.newContext({ viewport: { width: 390, height: 763 } }), q2 = await off.newPage();
    await q2.goto(base + '/index.html?explain=0'); await q2.waitForFunction(() => window.__mnr); ok('?explain=0 turns it off', await q2.evaluate(() => !window.EXP || !EXP.on));
    ok('no page errors', errs.length === 0, errs.slice(0, 3));
  } catch (e) { fails++; console.log('FAIL crash :: ' + e.message); }
  await browser.close(); srv.kill(); process.exit(fails ? 1 : 0);
})();
