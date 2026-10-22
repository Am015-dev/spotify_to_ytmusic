#!/usr/bin/env node
// SIMHUNT: headless bug hunter. Loads the game once per page, drives the simulation by stepping game time (__mnr.step(1/60), no waits),
// plays every story stage with the human-model bot (reused from humanbot.js, source extracted at start) plus a 'parked' bot (never moves),
// Legend on stages 10/20, endless to wave 20, 3 seeds each, and checks invariants every step. Writes qa/SIMHUNT.md (ranked).
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/simhunt.js
//   env: GAME_DIR=<dir with index.html> PAR=4 SEEDS=3 STAGES=1-45 BUDGET=540 (s: stop starting runs after this) OUT=<md path> JSON=<raw json>
//        ONLY=stage:bot:seed[:diff]  (one run, e.g. ONLY=12:human:2 or ONLY=endless:human:1 or ONLY=10:human:1:legend) prints every violation
// Runs on a 390x763 phone viewport (portrait: the HUD band and turned world are live). Prints one summary line per 30 runs and PASS/FAIL at the end.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../../games/mainhattan-nightrun');
const PARTS = path.resolve(__dirname, '../parts'), INV = path.resolve(__dirname, '../VISUAL-INVENTORY.md');
const PAR = +process.env.PAR || 4, SEEDS = +process.env.SEEDS || 3, BUDGET = +process.env.BUDGET || 540, OUT = process.env.OUT || path.join(__dirname, 'SIMHUNT.md');
const [S0, S1] = (process.env.STAGES || '1-45').split('-').map(Number);
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ---- the human bot, taken from humanbot.js itself (one source of truth) + a 'parked' variant that never touches the stick
const hb = fs.readFileSync(path.resolve(__dirname, '../humanbot.js'), 'utf8'), a0 = hb.indexOf('const BOT = (o) => {'), a1 = hb.indexOf('\n};\n(async', a0);
if (a0 < 0 || a1 < 0) { console.log('FAIL simhunt: humanbot.js BOT not found'); process.exit(2); }
let BOTSRC = hb.slice(a0 + 'const BOT = '.length, a1 + 3);
const GUARD = 'if (i % 3 === 0) { bmUpd(); d = decide(human);';
if (!BOTSRC.includes(GUARD)) { console.log('FAIL simhunt: humanbot decide loop changed, update GUARD'); process.exit(2); }
BOTSRC = BOTSRC.replace(GUARD, `if (o.bot !== 'parked' && i % 3 === 0) { bmUpd(); d = decide(human);`);

// ---- in the page, before any game code: canvas draw-site + text-box probe (sampled frames only)
const PROBE = () => {
  Error.stackTraceLimit = 40; window.__probe = 0; window.__sites = {}; window.__tx = []; window.__job = '';
  const P = CanvasRenderingContext2D.prototype;
  for (const k of ['fill', 'stroke', 'fillRect', 'strokeRect', 'fillText', 'strokeText', 'drawImage']) {
    const o = P[k];
    P[k] = function () {
      if (window.__probe) {
        const s = new Error().stack.split('\n').slice(2).filter(l => /index\.html/.test(l)).slice(0, 9).map(l => { const m = l.match(/at (?:(\S+) \()?.*index\.html[^:]*:(\d+):(\d+)/); return m ? (m[1] || '?') + '@' + m[2] : '?'; }).join('<');
        const r = window.__sites[s] || (window.__sites[s] = { n: 0, ops: {}, first: window.__job, txt: '' }); r.n++; r.ops[k] = 1;
        if (k === 'fillText' || k === 'strokeText') {
          const t = String(arguments[0]); if (!r.txt) r.txt = t.slice(0, 30);
          if (t.trim()) { try {
            const sz = +((/(\d+(?:\.\d+)?)px/.exec(this.font) || [0, 12])[1]), w = this.measureText(t).width, x = arguments[1], y = arguments[2], al = this.textAlign;
            const x0 = al === 'center' ? x - w / 2 : (al === 'right' || al === 'end') ? x - w : x, bl = this.textBaseline, y0 = bl === 'middle' ? y - sz / 2 : (bl === 'top' || bl === 'hanging') ? y : y - sz * .8;
            const T = this.getTransform(), pts = [[x0, y0], [x0 + w, y0], [x0, y0 + sz], [x0 + w, y0 + sz]].map(([a, b]) => [T.a * a + T.c * b + T.e, T.b * a + T.d * b + T.f]);
            window.__tx.push({ t, x0: Math.min(...pts.map(p => p[0])), x1: Math.max(...pts.map(p => p[0])), y0: Math.min(...pts.map(p => p[1])), y1: Math.max(...pts.map(p => p[1])), s: s.split('<')[0] });
          } catch (e) { } }
        }
      }
      return o.apply(this, arguments);
    };
  }
};

// ---- the per-run checker: window.__rec is called by the bot after every step; window.__recOut returns the run's findings
const SETUP = (o) => {
  let sd = o.seed * 2654435761 % 4294967296 || 7; Math.random = () => { sd = (sd + 0x6D2B79F5) >>> 0; let t = sd; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  window.__job = o.label; const W = 960, H = 540, V = [], cnt = {}, add = (k, t, d) => { cnt[k] = (cnt[k] || 0) + 1; if (V.filter(v => v.k === k).length < 3) V.push({ k, t: +t.toFixed(1), d }); };
  const hk = Math.min(2, Math.max(1, 11.6 / (11 * (document.getElementById('frame').clientWidth / 540)))), BAND = 92 * hk;
  const S = { track: new Map(), hold: new Map(), hist: [], maxEn: 0, empty: 0, emptyRun: 0, emptyMax: 0, emptyAt: 0, steps: 0, lastSig: '', sigT: 0, spawned: 0, bossT0: -1, bossDur: 0, bossN: 0, deadChecked: false, lastT: 0, frozen: 0, txOver: {}, frames: 0, dom: {} };
  const num = (v) => typeof v === 'number' && isFinite(v);
  window.__rec = (m, i) => {
    const G = m.G, P = m.P, t = G.t; S.steps++;
    if (t === S.lastT) { if (++S.frozen > 300) { add('frozen', t, 'game time did not advance for 300 steps (paused/stuck state)'); throw new Error('simhunt-frozen'); } } else S.frozen = 0; S.lastT = t;
    // NaN / undefined
    if (!num(P.x) || !num(P.y) || !num(P.hp)) add('nan', t, `player x=${P.x} y=${P.y} hp=${P.hp}`);
    for (const e of G.en) { if (!num(e.x) || !num(e.y) || (e.hp !== undefined && !num(e.hp))) add('nan', t, `enemy ${e.type} x=${e.x} y=${e.y} hp=${e.hp}`); }
    for (const b of G.eb) if (!num(b.x) || !num(b.y)) { add('nan', t, `enemy bullet x=${b.x} y=${b.y}`); break; }
    if (!num(G.score) || G.score < 0) add('score', t, `score=${G.score}`);
    try { const SH = m.SH; for (const k of ['neon', 'earned']) if (SH && SH[k] !== undefined && (!num(SH[k]) || SH[k] < 0)) add('score', t, `${k}=${SH[k]}`); } catch (e) { }
    // enemies: lifetime, escapes, band, simultaneous
    let alive = 0, thr = 0; const seen = new Set();
    for (const e of G.en) {
      let r = S.track.get(e); if (!r) { r = { ty: e.type + (e.el ? '*' : ''), in: -1, off: 0, boss: e.type === 'boss', gnd: !!e.gnd }; S.track.set(e, r); S.spawned++; }
      const rad = e.r || 14, live = e.hp > 0 && !e.dead;
      if (r.in < 0 && e.x < W - rad && e.x > -rad) r.in = t;
      r.x = e.x; r.y = e.y; r.live = live; r.rad = rad;
      if (!r.boss && live) { alive++; thr++; }
      if (!r.boss && live && !r.gnd && r.in >= 0 && (e.x < -rad - 60 || e.x > W + rad + 80 || e.y < -rad - 60 || e.y > H + rad + 60)) { r.off += 1 / 60; if (r.off > 4 && !r.repOff) { r.repOff = 1; add('zombie', t, `${e.type} alive off-screen for 4 s at (${Math.round(e.x)},${Math.round(e.y)})`); } } else r.off = 0;
      if (!r.boss && live && !r.gnd && r.in >= 0 && e.x < W && W - e.x - rad < BAND) {   // top edge inside the HUD band (portrait: world x = up)
        seen.add(e); const h = S.hold.get(e) || { t: 0, y: W - e.x - rad, type: e.type }; h.t += 1 / 60; S.hold.set(e, h);
        if (h.t > .3 && !h.rep) { h.rep = 1; add('hudband', t, `${e.type} top edge ${Math.round(h.y)} < band ${Math.round(BAND)} for > 0.3 s`); }
      }
    }
    for (const k of [...S.hold.keys()]) if (!seen.has(k)) S.hold.delete(k);
    for (const [e, r] of S.track) if (r.end === undefined && (e.dead || !G.en.includes(e))) { r.end = t; r.killed = !(e.hp > 0) || !!e.dead; r.esc = !r.killed && !r.boss && !r.gnd && r.in >= 0; }
    S.maxEn = Math.max(S.maxEn, alive);
    const boss = !!G.boss;
    // empty time: nothing to shoot and nothing to dodge
    if (t > 3 && !m.SH.active && !boss && alive === 0 && G.eb.length === 0 && !G.dead) { S.empty += 1 / 60; S.emptyRun += 1 / 60; if (S.emptyRun > S.emptyMax) { S.emptyMax = S.emptyRun; S.emptyAt = t - S.emptyRun; } } else S.emptyRun = 0;
    // boss duration
    if (boss && S.bossT0 < 0) { S.bossT0 = t; S.bossN++; } if (!boss && S.bossT0 >= 0) { S.bossDur = Math.max(S.bossDur, t - S.bossT0); if (t - S.bossT0 > 120) add('boss', S.bossT0, `boss fight lasted ${(t - S.bossT0).toFixed(0)} s`); S.bossT0 = -1; }
    if (boss && S.bossT0 >= 0 && t - S.bossT0 > 120 && !S.bossRep && !o.endless) { S.bossRep = 1; add('boss', S.bossT0, `boss still alive after ${(t - S.bossT0).toFixed(0)} s (hp ${Math.round(G.boss.hp)})`); }
    // stuck: nothing changes for 20 s (score, kills, new spawns, boss hp, wave)
    const sig = [G.kills, Math.floor(G.score), S.spawned, G.boss ? Math.round(G.boss.hp) : -1, window.ENDR ? ENDR.w : 0].join('|');
    if (sig !== S.lastSig) { S.lastSig = sig; S.sigT = t; } else if (t - S.sigT > 20 && !S.stuckRep && !G.dead) { S.stuckRep = 1; add('stuck', t, `no score/kill/spawn/boss-hp change since t=${S.sigT.toFixed(0)} (enemies ${G.en.length}, bullets ${G.eb.length}, boss ${boss})`); }
    // unexplained death: no enemy bullet / body within 60 px of the ship in the last 8 steps
    S.hist.push({ px: P.x, py: P.y, eb: G.eb.map(b => [b.x, b.y]), en: G.en.filter(e => !(e.hp <= 0 || e.dead)).map(e => [e.x, e.y, e.r || 14, e.type]), laser: !!(G.boss && G.boss.lasers && G.boss.lasers.length) }); if (S.hist.length > 8) S.hist.shift();
    if (G.dead && !S.deadChecked) {
      S.deadChecked = true; let why = null;
      for (const h of S.hist) { if (h.laser) why = 'laser'; for (const b of h.eb) if (Math.hypot(b[0] - h.px, b[1] - h.py) < 60) why = why || 'bullet'; for (const e of h.en) if (Math.hypot(e[0] - h.px, e[1] - h.py) - e[2] < 60) why = why || 'body:' + e[3]; }
      S.deathWhy = why || 'unexplained'; if (!why) { const h = S.hist[S.hist.length - 1]; add('unexplained-death', t, `ship (${Math.round(h.px)},${Math.round(h.py)}) hp ${P.hp}, nearest bullet ${Math.round(Math.min(1e9, ...h.eb.map(b => Math.hypot(b[0] - h.px, b[1] - h.py))))} px, nearest body ${Math.round(Math.min(1e9, ...h.en.map(e => Math.hypot(e[0] - h.px, e[1] - h.py) - e[2])))} px`); }
    }
    // sampled frame: draw-site probe + text boxes overlapping
    if (i % 300 === 150 && !G.dead) {
      window.__tx.length = 0; window.__probe = 1; try { m.render(t, 1 / 60); } catch (e) { add('render', t, String(e.message).slice(0, 120)); } window.__probe = 0; S.frames++;
      const tx = []; for (const a of window.__tx) { if (!tx.some(b => b.t === a.t && Math.abs(b.x0 - a.x0) < 4 && Math.abs(b.y0 - a.y0) < 4)) tx.push(a); }   // stroke + fill of one string is one box
      for (let a = 0; a < tx.length; a++) for (let b = a + 1; b < tx.length; b++) {
        const A = tx[a], B = tx[b], ox = Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0), oy = Math.min(A.y1, B.y1) - Math.max(A.y0, B.y0);
        if (ox > 3 && oy > 3 && ox * oy > .2 * Math.min((A.x1 - A.x0) * (A.y1 - A.y0), (B.x1 - B.x0) * (B.y1 - B.y0))) { const k = [A.t, B.t].map(s => s.replace(/\d+/g, '#').slice(0, 24)).sort().join(' | '); S.txOver[k] = (S.txOver[k] || 0) + 1; if (!S.txAt) S.txAt = {}; if (!S.txAt[k]) S.txAt[k] = +t.toFixed(1); }
      }
      if (S.frames % 3 === 1) {   // DOM text (HUD, captions) overlapping: leaf elements with words
        const els = []; for (const e of document.querySelectorAll('body *')) { if (e.children.length || !(e.textContent || '').trim() || e.tagName === 'CANVAS' || e.tagName === 'SCRIPT' || e.tagName === 'STYLE') continue; const r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || +cs.opacity < .1 || cs.display === 'none' || e.closest('[hidden]')) continue; let hid = 0, q = e; while (q) { if (getComputedStyle(q).display === 'none') { hid = 1; break; } q = q.parentElement; } if (hid) continue; els.push({ r, t: e.textContent.trim().slice(0, 24), k: e.id ? '#' + e.id : e.className }); }
        for (let a = 0; a < els.length; a++) for (let b = a + 1; b < els.length; b++) { const A = els[a].r, B = els[b].r, ox = Math.min(A.right, B.right) - Math.max(A.left, B.left), oy = Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top); if (ox > 4 && oy > 4) { const k = 'DOM ' + [els[a].t, els[b].t].map(s => s.replace(/\d+/g, '#')).sort().join(' | '); S.txOver[k] = (S.txOver[k] || 0) + 1; if (!S.txAt) S.txAt = {}; if (!S.txAt[k]) S.txAt[k] = +t.toFixed(1); } }
      }
    }
  };
  window.__recOut = (m) => {
    const lives = [], esc = []; let kill = 0, escN = 0; for (const [e, r] of S.track) { if (r.boss || r.gnd || r.in < 0 || r.end === undefined) continue; const d = r.end - r.in; if (d > 0) lives.push(d); if (r.killed) kill++; else if (r.esc) { escN++; if (esc.length < 3) esc.push(`${r.ty}@(${Math.round(r.x)},${Math.round(r.y)})`); } }
    const G = m.G;
    return { V, cnt, maxEn: S.maxEn, empty: +S.empty.toFixed(1), emptyMax: +S.emptyMax.toFixed(1), emptyAt: +S.emptyAt.toFixed(1), bossDur: +S.bossDur.toFixed(1), bossN: S.bossN, bossOpen: S.bossT0 >= 0, kill, escN, escEx: esc, lives, txOver: S.txOver, txAt: S.txAt || {}, deathWhy: S.deathWhy || null, frames: S.frames, steps: S.steps, wave: window.ENDR ? ENDR.w : 0, score: G.score, hp: m.P.hp };
  };
};
// ---- one run inside the page
const RUNFN = `(async (o) => { (${SETUP.toString()})(o); const BOT = ${BOTSRC};
  let r; try { r = BOT(o); } catch (e) { const m = window.__mnr; let out = null; try { out = window.__recOut(m); } catch (x) { } try { m.abort(); } catch (x) { } r = { err: String(e.message).slice(0, 200), t: +m.G.t.toFixed(1), clear: false, dead: !!m.G.dead, px: out }; }
  window.__rec = null; window.__recOut = null; return r; })`;

(async () => {
  const t0 = Date.now(), el = () => ((Date.now() - t0) / 1000).toFixed(0) + 's';
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  for (let i = 0; i < 60; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/index.html`)).ok) break; } catch (e) { } await sleep(100); }
  const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  const open = async () => {
    const ctx = await br.newContext({ viewport: { width: 390, height: 763 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true }), p = await ctx.newPage(); p.errs = []; p.cur = '(load)';
    p.on('pageerror', e => p.errs.push({ job: p.cur, msg: String(e.message).slice(0, 200) })); p.on('console', c => { if (c.type() === 'error' && !/Failed to load resource|fonts\.|net::ERR/.test(c.text())) p.errs.push({ job: p.cur, msg: 'console.error: ' + c.text().slice(0, 160) }); });
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.addInitScript(() => { try { localStorage.setItem('mnr_tipdone', 'true'); localStorage.setItem('mnr_fscard', '99'); } catch (e) { } });
    await p.addInitScript(PROBE);
    await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1&nomusic=1`, { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 20000 }).catch(() => { }); await sleep(400);
    return p;
  };
  const probe = await open(); const NST = await probe.evaluate(() => window.__mnr.STAGES.length); await probe.context().close();
  const last = Math.min(S1, NST), jobs = [];
  const buildOf = n => n <= 5 ? 'fresh' : n <= 20 ? 'mid' : 'late';
  for (let n = S0; n <= last; n++) for (const bot of ['human', 'parked']) for (let s = 1; s <= SEEDS; s++) jobs.push({ n, bot, seed: s, build: bot === 'parked' ? 'fresh' : buildOf(n), diff: 'normal', MAXT: 300, label: `st${n}/${bot}/s${s}` });
  for (const n of [10, 20]) if (n <= last) for (const bot of ['human', 'parked']) for (let s = 1; s <= SEEDS; s++) jobs.push({ n, bot, seed: s, build: bot === 'parked' ? 'fresh' : 'mid', diff: 'legend', MAXT: 300, label: `st${n}/${bot}/s${s}/legend` });
  for (let s = 1; s <= SEEDS; s++) jobs.push({ n: 20, endless: true, bot: 'human', seed: s, build: 'mid', diff: 'normal', MAXT: 1200, label: `endless/human/s${s}` });
  let list = jobs;
  if (process.env.ONLY) { const [a, b, c, d] = process.env.ONLY.split(':'); list = jobs.filter(j => (a === 'endless' ? j.endless : !j.endless && j.n === +a && (d === 'legend') === (j.diff === 'legend')) && j.bot === b && j.seed === +c); }
  list.sort((x, y) => (y.MAXT - x.MAXT) || (y.n - x.n));   // longest first: the budget cuts the cheap tail
  const results = [], pages = []; let next = 0, skipped = 0;
  await Promise.all(Array.from({ length: PAR }, async (_, w) => {
    const p = await open(); pages.push(p);
    while (next < list.length) {
      if ((Date.now() - t0) / 1000 > BUDGET) { skipped = list.length - next; next = list.length; break; }
      const j = list[next++]; p.cur = j.label; const s0 = Date.now();
      try { const r = await p.evaluate(`${RUNFN}(${JSON.stringify(j)})`); results.push({ j, r, ms: Date.now() - s0 }); } catch (e) { results.push({ j, r: { err: 'harness: ' + String(e.message).slice(0, 160) }, ms: Date.now() - s0 }); try { await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 20000 }); } catch (x) { } }
      if (results.length % 30 === 0) console.log(`INFO ${results.length}/${list.length} runs at ${el()}`);
    }
  }));
  // draw sites from every page -> part:function key, compared with the approved list
  const lm = new Map(); for (const f of require('../parts-index.js').list()) if (f.endsWith('.js')) fs.readFileSync(path.join(PARTS, f), 'utf8').split('\n').forEach((l, i) => { if (l.trim().length > 12 && !lm.has(l)) lm.set(l, f + ':' + (i + 1)); });
  const lines = fs.readFileSync(path.join(GAME_DIR, 'index.html'), 'utf8').split('\n');
  const PLUMB = /^(c|ctx|Object\.c|Object\.ctx)\.\w+$|^(Object\.)?(ART\.(sp|tint|hue|sil|put|paintP|drawAnim|dflash|portrait|pic|span|have)|glow|G_|wtxt|sheet|tintOf|cf|size|scale|P\.\w+|CanvasRenderingContext2D\.\w+|RU\.(ring|tri))$|^\?$/;
  const keyOf = s => { const fr = s.split('<').map(f => { const [fn, ln] = f.split('@'); const loc = lm.get(lines[+ln - 1]) || 'built:' + ln; return { fn, part: loc.split(':')[0] }; }); const h = fr.find(f => !PLUMB.test(f.fn)) || fr[0]; return h ? h.part + ':' + (h.fn === '?' ? 'anon' : h.fn.replace(/^Object\./, '')) : '?'; };
  const approved = new Set([...fs.readFileSync(INV, 'utf8').matchAll(/`([a-z0-9]+\.js:[\w$.]+)`/gi)].map(m => m[1])), sites = {};
  for (const p of pages) { const raw = await p.evaluate(() => window.__sites).catch(() => ({})); for (const [s, v] of Object.entries(raw)) { const k = keyOf(s); const r = sites[k] || (sites[k] = { n: 0, first: v.first, txt: v.txt }); r.n += v.n; } }
  const pageErrs = []; for (const p of pages) pageErrs.push(...p.errs);
  await br.close(); srv.kill();
  if (process.env.JSON) fs.writeFileSync(process.env.JSON, JSON.stringify({ results, sites, pageErrs }));
  report(results, sites, approved, pageErrs, { runs: results.length, skipped, secs: (Date.now() - t0) / 1000, NST, last });
})().catch(e => { console.log('FAIL simhunt crashed: ' + e.stack); process.exit(2); });

// ---- aggregate + write SIMHUNT.md
function report(results, sites, approved, pageErrs, meta) {
  const med = a => { if (!a.length) return 0; a = a.slice().sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; };
  const SEV = { nan: 100, score: 95, 'page-error': 95, frozen: 90, stuck: 80, boss: 75, 'unexplained-death': 70, render: 70, zombie: 55, hudband: 45, 'text-overlap': 40, 'draw-site': 30, 'escape-high': 25, empty: 20, harness: 60 };
  const NAME = {
    nan: 'NaN / undefined position or HP', score: 'Score or currency negative / NaN', 'page-error': 'Page error (uncaught exception or console.error)', frozen: 'Game time stops advancing', stuck: 'Stuck: no progress for 20 s', boss: 'Boss fight over 120 s or never ends',
    'unexplained-death': 'Ship dies with no enemy bullet or body within 60 px', render: 'Draw call throws', zombie: 'Enemy alive but off-screen for 4 s', hudband: 'Enemy inside the HUD band for more than 0.3 s', 'text-overlap': 'Text boxes overlap each other',
    'draw-site': 'Canvas draw site not in VISUAL-INVENTORY', 'escape-high': 'Over 25% of enemies leave the screen alive', empty: 'Empty screen stretch of 5 s or more (no enemy, no bullet)', harness: 'Run aborted by the harness'
  };
  const issues = {};   // key -> {kind, what, runs:Set, hits, ex:[]}
  const add = (kind, what, run, d, t) => { const k = kind + '|' + what; const i = issues[k] || (issues[k] = { kind, what, runs: new Set(), hits: 0, ex: [] }); i.runs.add(run.j.label); i.hits += d.n || 1; if (i.ex.length < 3 && !i.ex.some(e => e.j.label === run.j.label)) i.ex.push({ j: run.j, t, d: d.d }); };
  const strip = s => s.replace(/\d+(\.\d+)?/g, '#').slice(0, 60);
  const perStage = {};
  for (const run of results) {
    const { j, r } = run, px = r.px || {}, key = (j.diff === 'legend' ? 'L' : '') + (j.endless ? 'E' : j.n) + '/' + j.bot;
    if (r.err && !r.px) add('harness', strip(r.err), run, { d: r.err }, 0);
    else if (r.err) add('page-error', 'run threw: ' + strip(r.err), run, { d: r.err }, r.t);
    const nanRun = (px.cnt && px.cnt.nan) ? ' [this run also has NaN enemies]' : '';
    for (const v of px.V || []) add(v.k, v.k === 'hudband' ? v.d.split(' ')[0] + ' ' + 'band' : v.k === 'nan' ? (/^player/.test(v.d) ? 'player' : /^enemy bullet/.test(v.d) ? 'enemy bullet' : 'enemy') + ' ' + [...new Set(v.d.match(/(?:x|y|hp)=(?:NaN|undefined)/g) || [])].join(' ') : v.k === 'unexplained-death' ? j.bot + ' bot' : v.k === 'stuck' || v.k === 'boss' ? 'stage ' + (j.endless ? 'endless' : j.n) + ' ' + strip(v.d).slice(0, 30) : strip(v.d).slice(0, 50), run, { n: 1, d: v.d + (v.k === 'unexplained-death' ? nanRun : '') }, v.t);
    for (const [k, n] of Object.entries(px.txOver || {})) add('text-overlap', k, run, { n, d: k }, px.txAt[k]);
    if (px.emptyMax >= 5) add('empty', 'stage ' + (j.endless ? 'endless' : j.n) + ' ' + j.bot, run, { d: `${px.emptyMax} s with nothing on screen from t=${px.emptyAt}` }, px.emptyAt);
    const sp = perStage[key] || (perStage[key] = { runs: 0, kill: 0, esc: 0, lives: [], maxEn: 0, empty: [], emptyMax: 0, bossDur: 0, dead: 0, clear: 0, t: [], unexpl: 0 });
    sp.runs++; sp.kill += px.kill || 0; sp.esc += px.escN || 0; sp.lives.push(...(px.lives || [])); sp.maxEn = Math.max(sp.maxEn, px.maxEn || 0); sp.empty.push(px.empty || 0); sp.emptyMax = Math.max(sp.emptyMax, px.emptyMax || 0); sp.bossDur = Math.max(sp.bossDur, px.bossDur || 0); sp.dead += r.dead ? 1 : 0; sp.clear += r.clear ? 1 : 0; sp.t.push(r.t || 0); if (px.deathWhy === 'unexplained') sp.unexpl++;
    sp.escEx = sp.escEx || []; if (px.escEx && sp.escEx.length < 2) sp.escEx.push(...px.escEx.slice(0, 1));
    // a run that is neither dead nor cleared at the time cap = the stage never ended
    if (!j.endless && !r.clear && !r.dead && !r.err && (r.t || 0) >= j.MAXT - 1) add('stuck', 'stage ' + j.n + ' never ended within ' + j.MAXT + ' s (' + j.bot + (j.diff === 'legend' ? ', legend' : '') + ')', run, { d: `alive at ${r.t} s, no clear, no death` }, r.t);
    if (j.endless && !r.clear && !r.dead && !r.err) add('stuck', 'endless did not reach wave 20 in ' + j.MAXT + ' s (reached ' + px.wave + ')', run, { d: `wave ${px.wave} at ${r.t} s` }, r.t);
  }
  for (const [key, sp] of Object.entries(perStage)) { const tot = sp.kill + sp.esc; sp.escPct = tot ? 100 * sp.esc / tot : 0; sp.life = med(sp.lives); }
  for (const [key, sp] of Object.entries(perStage)) if (/\/human$/.test(key) && sp.escPct > 25 && sp.kill + sp.esc >= 20) { const run = results.find(r => ((r.j.diff === 'legend' ? 'L' : '') + (r.j.endless ? 'E' : r.j.n) + '/' + r.j.bot) === key); add('escape-high', 'stage ' + key.replace('/human', '') + ' ' + sp.escPct.toFixed(0) + '%', run, { n: sp.esc, d: `${sp.esc} of ${sp.kill + sp.esc} enemies left alive (e.g. ${(sp.escEx || []).join(', ')})` }, 0); }
  // page errors
  const pe = {}; for (const e of pageErrs) { const k = strip(e.msg); (pe[k] = pe[k] || { n: 0, jobs: new Set(), msg: e.msg }).n++; pe[k].jobs.add(e.job); }
  for (const [k, v] of Object.entries(pe)) { const i = issues['page-error|' + k] = { kind: 'page-error', what: k, runs: v.jobs, hits: v.n, ex: [{ j: { label: [...v.jobs][0] }, t: 0, d: v.msg }] }; }
  // unapproved draw sites
  const miss = Object.entries(sites).filter(([k]) => !approved.has(k)); for (const [k, v] of miss) issues['draw-site|' + k] = { kind: 'draw-site', what: k, runs: new Set([v.first]), hits: v.n, ex: [{ j: { label: v.first }, t: 0, d: `${v.n} calls in sampled frames${v.txt ? `, text "${v.txt}"` : ''}` }] };

  const rank = Object.values(issues).map(i => ({ ...i, runN: i.runs.size, score: (SEV[i.kind] || 10) * (1 + Math.log2(1 + i.runs.size)) })).sort((a, b) => b.score - a.score);
  const reproOf = (e) => {
    const l = e.j.label || '', m = /^st(\d+)\/(\w+)\/s(\d+)(\/legend)?$/.exec(l), en = /^endless\/(\w+)\/s(\d+)$/.exec(l);
    if (m) return `stage ${m[1]}${m[4] ? ' Legend' : ' Normal'}, ${m[2]} bot, seed ${m[3]}, ${e.t ? `game time ${e.t} s; ` : ""}\`ONLY=${m[1]}:${m[2]}:${m[3]}${m[4] ? ':legend' : ''} node qa/simhunt.js\`; page \`index.html?sim=1&all=1&nomusic=1\` on a 390x763 phone`;
    if (en) return `endless to wave 20, ${en[1]} bot, seed ${en[2]}, game time ${e.t} s; \`ONLY=endless:${en[1]}:${en[2]} node qa/simhunt.js\``;
    return l;
  };
  const now = new Date().toISOString().replace(/\.\d+Z$/, 'Z');
  let md = `# SIMHUNT: headless sim bug hunt\n\nGenerated by \`qa/simhunt.js\` on ${now} (UTC) against \`${path.relative(process.cwd(), GAME_DIR) || GAME_DIR}\`. ${meta.runs} runs in ${meta.secs.toFixed(0)} s real time${meta.skipped ? `, **${meta.skipped} runs skipped by the time budget**` : ''}. Game time is stepped by hand (\`__mnr.step(1/60)\`), nothing waits on the wall clock.\n\n`;
  md += `**Coverage.** Story stages 1-${meta.last} (of ${meta.NST}) on Normal with the human-model bot (humanbot.js source: ~190 ms late view, misses 10% of threats, aim error, lapses; build fresh for stages 1-5, mid 6-20, late 21+) and a parked bot (never moves, fires on the beat); stages 10 and 20 on Legend; endless to wave 20 (human bot); ${process.env.SEEDS || 3} seeds each (seed = game \`Math.random\` + bot dice). 390x763 phone viewport, so the portrait HUD band is live.\n\n`;
  md += `**How to read it.** Ranked by severity x log(runs affected). "Runs" = how many of the ${meta.runs} runs hit it. Every example gives stage, bot, seed and game time; the \`ONLY=\` command replays exactly that run and prints its violations. Parked-bot findings show the game against an idle player (unexplained deaths there are usually the anti-idle beam or a hazard, check the example).\n\n## Ranked issues\n\n`;
  if (!rank.length) md += 'No violations found.\n\n';
  rank.slice(0, 40).forEach((i, n) => { md += `${n + 1}. **${NAME[i.kind] || i.kind}** (${i.kind}, severity ${SEV[i.kind] || 10}) - ${i.what}: ${i.runN} run(s), ${i.hits} hit(s)\n`; for (const e of i.ex) md += `   - ${reproOf(e)}; ${String(e.d).slice(0, 220)}\n`; });
  if (rank.length > 40) md += `\n(${rank.length - 40} more lower-ranked issues in the JSON: run with JSON=path)\n`;
  md += `\n## Per-stage numbers (Normal; L = Legend; E = endless)\n\nescape% = enemies that left the screen alive / (killed + left). on-screen = median seconds from entering the screen to dying or leaving. max live = most enemies alive at once. empty = mean seconds per run with no enemy and no enemy bullet (longest single stretch in brackets). boss = longest boss fight.\n\n| stage/bot | runs | clear | dead | median end t | escape% | on-screen med s | max live | empty s (longest) | boss s | unexplained deaths |\n|---|---|---|---|---|---|---|---|---|---|---|\n`;
  const ord = k => { const m = /^(L?)(E|\d+)\/(\w+)$/.exec(k); return (m[2] === 'E' ? 999 : +m[2]) * 10 + (m[1] ? 5 : 0) + (m[3] === 'human' ? 0 : 1); };
  for (const k of Object.keys(perStage).sort((a, b) => ord(a) - ord(b))) { const s = perStage[k]; md += `| ${k} | ${s.runs} | ${s.clear} | ${s.dead} | ${med(s.t).toFixed(0)} | ${s.escPct.toFixed(0)} | ${s.life.toFixed(1)} | ${s.maxEn} | ${(s.empty.reduce((x, y) => x + y, 0) / s.runs).toFixed(1)} (${s.emptyMax.toFixed(1)}) | ${s.bossDur.toFixed(0)} | ${s.unexpl} |\n`; }
  const all = Object.entries(perStage).filter(([k]) => /human$/.test(k)); const lifeAll = [].concat(...all.map(([, s]) => s.lives));
  md += `\nHuman bot overall: median enemy time on screen ${med(lifeAll).toFixed(1)} s, max simultaneous enemies ${Math.max(0, ...all.map(([, s]) => s.maxEn))}, escape ${(100 * all.reduce((x, [, s]) => x + s.esc, 0) / Math.max(1, all.reduce((x, [, s]) => x + s.esc + s.kill, 0))).toFixed(0)}%.\n`;
  md += `\n## Not covered\n\n- Draw-site and text-box checks use ~1 sampled frame per 5 game seconds per run, so a one-frame glitch can be missed.\n- Boss duration is not judged in endless (the bot is invincible during bosses there, as in humanbot.js).\n- Escape% reads 0 whenever the game removes an enemy at the screen edge with hp unchanged and flags it dead or hp <= 0; the 0% overall figure is unverified (enemy leak is also counted by humanbot.js 'leaks').\n- A human-bot death is balance, not a bug; only deaths with nothing near the ship are flagged.\n- Unapproved draw sites: ${miss.length} of ${Object.keys(sites).length} sites seen are missing from VISUAL-INVENTORY.md (listed above where present).\n`;
  fs.writeFileSync(OUT, md);
  const hard = rank.filter(i => (SEV[i.kind] || 0) >= 70).length;
  console.log(`INFO wrote ${OUT}: ${rank.length} issue kinds, ${hard} severe, ${meta.runs} runs in ${meta.secs.toFixed(0)} s`);
  rank.slice(0, 8).forEach((i, n) => console.log(`INFO #${n + 1} ${i.kind} ${i.what} (${i.runN} runs)`));
  console.log(hard ? `FAIL simhunt: ${hard} severe issue kind(s)` : 'PASS simhunt');
  process.exit(0);
}
