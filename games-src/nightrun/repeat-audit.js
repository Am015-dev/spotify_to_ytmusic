#!/usr/bin/env node
// Nightrun repetition audit: plays whole sessions headless in the real page with stepped time (?sim=1) and logs EVERY encounter, then measures repetition.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/repeat-audit.js
//   env: CONFIGS=arcade-normal,classic-normal,arcade-easy,arcade-hard,endless-normal,endless-hard,endless-natural  PAR=4  ENDLESS_MIN=30  MAXT=600 (game s per stage try)
//        STAGES=1-45  FRAMES=<dir> (also saves 8-frame fight sequences at 390x763, 1 s apart; keep them out of git)  OUT=<file> (default review/repeat-audit.json)
// Session = the stages played one after another (a failed stage is retried once by the same bot, then finished in god mode so the content is still seen).
// Logged per event: session time, stage, category, signature. Categories: wave (director pattern), zoo (new-kind wave), enemy (spawn type, * = elite), shot (bullet source),
// boss / mini (fight start), verb (boss attack in use, per phase), phase, set (set piece), fence, drop, pick (pickup kind), shop (pit stop cards), mut (mutator), song, bg, hint, banner.
// The bot: story-sim.js's dodge grid (~50 ms reaction), fire taps 40% on the beat, dashes on the DROP downbeat, EMP when swamped, closes the pit stop at once.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const PAR = +process.env.PAR || 4, ENDLESS_MIN = +process.env.ENDLESS_MIN || 30, MAXT = +process.env.MAXT || 600;
const CONFIGS = (process.env.CONFIGS || 'arcade-normal,classic-normal,arcade-easy,arcade-hard,endless-normal,endless-hard,endless-natural').split(',');
const SR = (process.env.STAGES || '1-45').split('-').map(Number), STAGES = []; for (let n = SR[0]; n <= (SR[1] || SR[0]); n++) STAGES.push(n);
const OUT = process.env.OUT || path.join(__dirname, 'review', 'repeat-audit.json'), FRAMES = process.env.FRAMES || '';
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });

// ---------- in the page: one try of one stage (or an Endless run), logging every event ----------
const PLAY = (o) => {
  const m = window.__mnr, rnd = Math.random, ev = [], T0 = o.T0 || 0;
  m.SET.diff = o.diff; m.applySet(); if (m.ARC) m.ARC.set(!o.classic);
  m.god = !!o.god;
  if (o.endless) { m.ST.on = false; document.getElementById('startBtn').click(); } else m.startStory(o.n);
  m.simOn(true);
  const G0 = () => m.G; let n = o.n || 0;
  const add = (cat, sig) => ev.push([+(T0 + G0().t).toFixed(1), n, cat, String(sig)]);
  // hooks (installed once per page; they write to window.__ev)
  window.__ev = add;
  if (!window.__hooked) {
    window.__hooked = 1; const NR = m.NR;
    NR.on('pattern', p => window.__ev('wave', p.id));
    NR.on('spawn', e => { window.__ev('enemy', e.type + (e.el ? '*' : '')); if (e.vk) window.__ev('look', e.vk); });   // look = variants.js: kind|class+orientation+tint
    NR.on('bossIn', x => { const b = m.G.boss; window.__ev(x.mini ? 'mini' : 'boss', (b && b.nm) + '|k' + (b && b.k)); });
    NR.on('bossPhase', x => window.__ev('phase', ((m.G.boss && m.G.boss.nm) || '?') + '|p' + x.ph));
    NR.on('setpiece', x => window.__ev('set', x.kind));
    NR.on('rule', x => window.__ev('rule', x.id));   // rules.js: a new mechanic / its twist / a combination
    NR.on('drop', x => window.__ev('drop', x.hit ? 'hit' : 'miss'));
    NR.on('pitStart', () => window.__ev('shop', (m.SH.cards || []).map(c => c.id || c.k || c.n).join('+')));
    if (window.ZOO) { const z = window.ZOO, pk = z.pick; z.pick = function () { const id = pk.apply(this, arguments); if (id) window.__ev('zoo', id); return id; }; }
    { const f = m.FUN, sf = f.startFence; f.startFence = function () { window.__ev('fence', 'fence'); return sf.apply(this, arguments); }; }
    if (window.HINT) { const h = window.HINT, sh = h.show; h.show = function (txt) { const r = sh.apply(this, arguments); if (r) window.__ev('hint', String(txt).slice(0, 60)); return r; }; }
  }
  m.NR.watch = { shots: [], spawns: [] };
  const dec = () => {
    const G = m.G, P = m.P; let ty = 270 + 140 * Math.sin(G.t * .9), tx = 220 + 70 * Math.sin(G.t * .55), bd = 1e9;
    for (const e of G.en) { if (e.type === 'boss') { if (e.x < 960) ty = e.y; continue; } const dx = e.x - P.x; if (dx > 0 && dx < bd && e.x < 940) { bd = dx; ty = e.type === 'gate' ? e.gy : e.y; } }
    let bc = 1e18, bx = P.x, by = P.y;
    for (let ix = -5; ix <= 5; ix++) for (let iy = -5; iy <= 5; iy++) {
      const cx = P.x + ix * 24, cy = P.y + iy * 24; if (cx < 30 || cx > 900 || cy < 40 || cy > 480) continue; let c = 0;
      for (const b of G.eb) { const px = b.x + b.vx * .14, py = b.y + b.vy * .14, d = Math.hypot(px - cx, py - cy); if (d < 70) c += (70 - d) * (70 - d) * (d < 26 ? 30 : 1); }
      if (G.boss && G.boss.lasers) for (const l of G.boss.lasers) { const vx = Math.cos(l.a), vy = Math.sin(l.a), px = cx - l.x, py = cy - l.y; if (px * vx + py * vy > -20) { const dl = Math.abs(px * vy - py * vx); if (dl < 40) c += (40 - dl) * 120; } }
      for (const e of G.en) { if (e.type === 'gate') { if (Math.abs(e.x - cx) < 60 && (cy < e.gy - e.gap / 2 + 12 || cy > e.gy + e.gap / 2 - 12)) c += 3000; continue; } const d = Math.hypot(e.x - cx, e.y - cy), r = e.r + 55; if (d < r) c += (r - d) * (r - d) * 3; }
      c += m.FUN.cost(cy) + Math.abs(cy - ty) * .6 + Math.abs(cx - tx) * .15 + Math.hypot(ix, iy) * 4; if (c < bc) { bc = c; bx = cx; by = cy; }
    }
    const near = G.eb.some(b => Math.hypot(b.x + b.vx * .08 - P.x, b.y + b.vy * .08 - P.y) < 30);
    return { bx, by, dash: (near && P.dashCd <= 0 && rnd() < .5) || !!(m.FUN.dw && !m.FUN.dw.done), emp: P.emp > 0 && (G.eb.length > 45 || (P.hp <= 1 && near)) };
  };
  const dt = 1 / 60, cap = o.endless ? o.secs : o.maxt; let i = 0, lastBeat = -1, tapAt = -1, d = null, cleared = false;
  let song = '', di = -1, ban = '', note = '', verb = '', pkSeen = new WeakSet(), shots = {}, mutDone = '', plain = 0, bossT = 0;
  while (m.running && m.G.t < cap) {
    const G = m.G;
    if (m.SH.active) m.SH.close();
    if (G.t > .5 && i % 30 === 0) { const mk = (m.DIR.mut || []).join('+'); if (mk !== mutDone) { mutDone = mk; for (const id of (m.DIR.mut || [])) add('mut', id); } }   // mutators change per district (Endless loops)
    if (i % 3 === 0) { d = dec(); m.touchTo(d.bx, d.by); if (d.dash) m.press('Dash'); if (d.emp) m.press('Emp'); }
    const bp = m.bpos(), bn = Math.floor(bp);
    if (bn !== lastBeat) { lastBeat = bn; tapAt = bn + (rnd() < .4 ? 0 : (.15 + rnd() * .7)); }
    if (tapAt >= 0 && bp >= tapAt) { m.press('Fire'); tapAt = -1; }
    m.step(dt); i++;
    if (i % 6 === 0) {
      const g = m.G, st = (m.BT && m.BT.stage) || ''; if (st !== song) { song = st; add('song', st); }
      if (g.di !== di) { di = g.di; add('bg', (m.DIST[di] || {}).name || di); }
      const bt = g.banner && g.banner.t > 0 ? g.banner.a + ' / ' + g.banner.b : ''; if (bt && bt !== ban) { ban = bt; add('banner', bt.slice(0, 60)); }
      const nt = g.note && g.note.t > 0 ? g.note.txt : ''; if (nt && nt !== note) { note = nt; add('note', String(nt).slice(0, 60)); }
      const b = g.boss; if (b && b.lists) { const v = b.lists[b.ph - 1][b.pi % b.lists[b.ph - 1].length]; const sig = b.nm + '|p' + b.ph + '|' + v; if (sig !== verb) { verb = sig; add('verb', sig); } } else verb = '';
      for (const p of g.pk) if (!pkSeen.has(p)) { pkSeen.add(p); if (p.t !== 'shard') add('pick', p.t + (p.k ? ':' + p.k : '')); }
      const w = m.NR.watch; if (w) { for (const s of w.shots) { const by = s.by; const k = !by ? 'none' : by.type === 'boss' ? 'boss:' + (by.lists ? by.lists[by.ph - 1][by.pi % by.lists[by.ph - 1].length] : '?') : (by.type || (by.arm != null ? 'rain/hazard' : '?')) + (by.el ? '*' : ''); shots[k] = (shots[k] || 0) + 1; } w.shots.length = 0; w.spawns.length = 0; }
      if (g.boss) bossT += 6 * dt; else if (!m.FUN.fence && !m.FUN.dw && !m.FUN.ev && !(m.FUN.sets && m.FUN.sets.length)) plain += 6 * dt;
    }
    if (m.G.dead) break;
    if (!o.endless && m.ST.over) { cleared = true; break; }
  }
  const G = m.G, r = { n, t: +G.t.toFixed(1), clear: cleared, dead: !!G.dead, hits: m.ST.hits, kills: G.kills, mm: window.MM ? [window.MM.strikes, window.MM.hits] : null, shots, plain: +plain.toFixed(1), bossT: +bossT.toFixed(1), ev };
  m.NR.watch = null; m.abort(); m.god = false; return r;
};

// ---------- in the page: an 8-frame sequence, 1 game-second apart, of a fight ----------
const FRAMESEQ = async (p, o, dir, tag) => {
  await p.evaluate(o => { const m = window.__mnr; m.SET.diff = o.diff || 'normal'; m.applySet(); if (m.ARC) m.ARC.set(true); m.god = true;
    if (o.endless) { m.ST.on = false; document.getElementById('startBtn').click(); } else m.startStory(o.n); m.simOn(true);
    const dt = 1 / 60; let k = 0; while (m.running && m.G.t < o.at) { if (m.SH.active) m.SH.close(); m.touchTo(220 + 60 * Math.sin(m.G.t), 270 + 150 * Math.sin(m.G.t * .7)); if (k++ % 30 === 0) m.press('Fire'); m.step(dt); } }, o);
  for (let f = 0; f < 8; f++) {
    await p.evaluate(() => { const m = window.__mnr, dt = 1 / 60; for (let i = 0; i < 60; i++) { if (m.SH.active) m.SH.close(); m.touchTo(220 + 60 * Math.sin(m.G.t), 270 + 150 * Math.sin(m.G.t * .7)); if (i % 20 === 0) m.press('Fire'); m.step(dt); } m.render && m.render(); });
    await p.waitForTimeout(60); await p.screenshot({ path: path.join(dir, `${tag}-${f + 1}.png`) });
  }
  await p.evaluate(() => { const m = window.__mnr; m.abort(); m.god = false; });
};

(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const browser = await PW.chromium.launch(), t0 = Date.now(), errors = [];
  const newPage = async (vp) => { const ctx = await browser.newContext(vp || { viewport: { width: 960, height: 540 } }); const p = await ctx.newPage(); p.on('pageerror', e => errors.push(e.message.slice(0, 160)));
    await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1${process.env.Q || ""}`);
    await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 15000 }).catch(() => { }); return p; };
  // one session per config; configs run in parallel pages
  const raw = {}, queue = CONFIGS.slice();
  await Promise.all(Array.from({ length: Math.min(PAR, queue.length) }, async () => {
    const p = await newPage();
    while (queue.length) {
      const c = queue.shift(), [mode, diff] = c.split('-'), runs = []; let T = 0, retries = 0;
      if (mode === 'endless') {
        const natural = diff === 'natural', r = await p.evaluate(PLAY, { endless: 1, diff: natural ? 'normal' : diff, god: !natural, secs: ENDLESS_MIN * 60, T0: 0 }); runs.push(r); T = r.t;
      } else for (const n of STAGES) {
        let r = await p.evaluate(PLAY, { n, diff, classic: mode === 'classic', god: false, maxt: MAXT, T0: T }); runs.push(r); T += r.t;
        if (!r.clear) { retries++; r = await p.evaluate(PLAY, { n, diff, classic: mode === 'classic', god: false, maxt: MAXT, T0: T }); r.retry = 1; runs.push(r); T += r.t;
          if (!r.clear) { r = await p.evaluate(PLAY, { n, diff, classic: mode === 'classic', god: true, maxt: MAXT, T0: T }); r.retry = 2; r.god = 1; runs.push(r); T += r.t; } }
      }
      raw[c] = { runs, T, retries }; if (process.env.FAILS) console.log(runs.filter(r => !r.retry && !r.clear).map(r => `s${r.n}:${r.dead ? 'd' : 't'}${r.hits}h mm${r.mm}`).join(' ')); console.log(`${c}: ${(T / 60).toFixed(1)} game-min, ${runs.length} tries, ${retries} stages failed first try  (${((Date.now() - t0) / 1000).toFixed(0)} s)`);
    }
  }));
  if (FRAMES) {
    fs.mkdirSync(FRAMES, { recursive: true }); const p = await newPage({ viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true });
    for (const s of [{ n: 3, at: 60, tag: 'st03-waves' }, { n: 8, at: 150, tag: 'st08-boss' }, { n: 21, at: 70, tag: 'st21-waves' }, { n: 32, at: 150, tag: 'st32-boss' }, { n: 40, at: 150, tag: 'st40-boss' }, { endless: 1, at: 600, tag: 'endless-10min' }]) { try { await FRAMESEQ(p, s, FRAMES, s.tag); } catch (e) { console.log('frames', s.tag, e.message.slice(0, 120)); } }
  }
  await browser.close(); srv.kill();
  const sum = analyse(raw); sum.meta = { date: new Date().toISOString(), configs: CONFIGS, stages: [STAGES[0], STAGES[STAGES.length - 1]], pageErrors: errors.slice(0, 10), realSecs: Math.round((Date.now() - t0) / 1000) };
  fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT, JSON.stringify(sum, null, 1));
  report(sum); console.log('\nwrote ' + path.relative(process.cwd(), OUT));
  if (errors.length) { console.log('PAGE ERRORS', errors.slice(0, 3)); process.exitCode = 1; }
})().catch(e => { console.error(e); process.exit(2); });

// ---------- analysis (pure) ----------
const ENC = new Set(['wave', 'zoo', 'set', 'fence', 'drop', 'mini', 'boss', 'verb']);             // an "encounter": something the player has to answer
const NOVEL = new Set(['wave', 'zoo', 'enemy', 'set', 'fence', 'drop', 'mini', 'boss', 'verb', 'mut', 'pick', 'shot']);   // a "new thing" if seen for the first time
const MECH = new Set(['zoo', 'fence', 'drop', 'mini', 'boss', 'mut', 'set', 'rule']);                       // categories that bring a new rule/decision, not only a new shape
function analyse(raw) {
  const out = {};
  for (const c in raw) {
    const { runs, T } = raw[c], ev = runs.flatMap(r => r.ev).sort((a, b) => a[0] - b[0]), mins = T / 60, R = {};
    R.gameMinutes = +mins.toFixed(1); R.tries = runs.length; R.firstTryFails = raw[c].retries; R.events = ev.length;
    const enc = ev.filter(e => ENC.has(e[2]) && e[2] !== 'boss' && !(e[2] === 'drop'));   // wave-level encounters (drop counted once per DROP)
    const encAll = ev.filter(e => ENC.has(e[2])), sigOf = e => e[2] === 'verb' ? 'verb:' + e[3].split('|').pop() : e[2] === 'mini' || e[2] === 'boss' ? e[2] + ':' + e[3] : e[2] + ':' + e[3];
    // (c) repetition ratio: share of encounters whose signature appeared in the previous 5 game-minutes
    { let rep = 0; const last = {}; for (const e of encAll) { const s = sigOf(e); if (last[s] != null && e[0] - last[s] <= 300) rep++; last[s] = e[0]; } R.repeatRatio5min = +(rep / Math.max(1, encAll.length)).toFixed(3); R.encounters = encAll.length; R.encountersPerMin = +(encAll.length / Math.max(.1, mins)).toFixed(1); }
    // three most repeated encounters
    { const cnt = {}; for (const e of encAll) { const s = sigOf(e); cnt[s] = (cnt[s] || 0) + 1; } R.topEncounters = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([s, k]) => [s, k, +(k / encAll.length * 100).toFixed(1)]); R.distinctEncounterSigs = Object.keys(cnt).length; }
    // (a) distinct encounter signatures per 5-minute window
    { const w = []; for (let k = 0; k * 300 < T; k++) { const s = new Set(encAll.filter(e => e[0] >= k * 300 && e[0] < (k + 1) * 300).map(sigOf)); const en = new Set(ev.filter(e => e[2] === 'enemy' && e[0] >= k * 300 && e[0] < (k + 1) * 300).map(e => e[3])); w.push([k * 5, s.size, en.size]); } R.per5min = w; }
    // per stage: distinct encounter sigs, enemy kinds, shot sources, new things, Jaccard with the previous stage
    const byStage = {};
    if (!c.startsWith('endless')) {
      const seen = new Set(); let prev = null;
      for (const n of [...new Set(ev.map(e => e[1]))].sort((a, b) => a - b)) {
        const se = ev.filter(e => e[1] === n), shotsN = {}; for (const r of runs.filter(r => r.n === n)) for (const k in r.shots) shotsN[k] = (shotsN[k] || 0) + r.shots[k];
        const set = new Set([...se.filter(e => e[2] === 'enemy' || e[2] === 'wave' || e[2] === 'zoo' || e[2] === 'verb').map(e => e[2] === 'verb' ? 'verb:' + e[3].split('|').pop() : e[2] + ':' + e[3]), ...Object.keys(shotsN).map(k => 'shot:' + k)]);
        const nov = [...new Set(se.filter(e => NOVEL.has(e[2])).map(e => e[2] === 'verb' ? 'verb:' + e[3].split('|').pop() : e[2] + ':' + e[3]))].concat(Object.keys(shotsN).map(k => 'shot:' + k)).filter(s => !seen.has(s));
        for (const s of nov) seen.add(s);
        const jac = prev ? +([...set].filter(x => prev.has(x)).length / new Set([...set, ...prev]).size).toFixed(2) : null; prev = set;
        const tr = runs.filter(r => r.n === n);
        byStage[n] = { mins: +(tr.reduce((a, r) => a + r.t, 0) / 60).toFixed(1), tries: tr.length, cleared: tr.some(r => r.clear && !r.god), enc: new Set(se.filter(e => ENC.has(e[2])).map(sigOf)).size,
          enemyKinds: new Set(se.filter(e => e[2] === 'enemy').map(e => e[3])).size, enemyLooks: new Set(se.filter(e => e[2] === 'look').map(e => e[3])).size, waves: new Set(se.filter(e => e[2] === 'wave' || e[2] === 'zoo').map(e => e[3])).size, shotSrc: Object.keys(shotsN).length,
          newThings: nov.length, newList: nov, jaccardPrev: jac, song: [...new Set(se.filter(e => e[2] === 'song').map(e => e[3]))].join('+'), bg: [...new Set(se.filter(e => e[2] === 'bg').map(e => e[3]))].join('+'),
          plainShare: +(tr.reduce((a, r) => a + r.plain, 0) / Math.max(1, tr.reduce((a, r) => a + r.t, 0))).toFixed(2) };
      }
      R.stages = byStage;
      const js = Object.values(byStage).map(s => s.jaccardPrev).filter(x => x != null).sort((a, b) => a - b); R.jaccardMedian = js[js.length >> 1]; R.jaccardMean = +(js.reduce((a, b) => a + b, 0) / js.length).toFixed(2);
      R.stagesWithZeroNew = Object.values(byStage).filter(s => s.newThings === 0).length;
    }
    // (b)/(h) novelty timeline: minute of the first time each thing is seen
    { const first = {}; for (const e of ev) { if (!NOVEL.has(e[2])) continue; const s = e[2] === 'verb' ? 'verb:' + e[3].split('|').pop() : e[2] + ':' + e[3]; if (!(s in first)) first[s] = +(e[0] / 60).toFixed(2); }
      R.firstSeen = Object.entries(first).sort((a, b) => a[1] - b[1]);
      R.mechTimeline = R.firstSeen.filter(([s]) => MECH.has(s.split(':')[0]) || s.startsWith('verb:') || s.startsWith('enemy:'));
      const tl = R.firstSeen.map(x => x[1]).filter(x => x >= 0); const gaps = []; for (let i = 1; i < tl.length; i++) gaps.push(tl[i] - tl[i - 1]); gaps.push(mins - (tl[tl.length - 1] || 0));
      R.longestNoveltyGapMin = +Math.max(...gaps).toFixed(1); R.lastNewThingMin = tl[tl.length - 1] || 0;
      R.newThingsFirst30 = tl.filter(x => x <= 30).length; R.newThingsAfter30 = tl.filter(x => x > 30).length;
      const mech = R.mechTimeline.filter(([s]) => !s.startsWith('enemy:') && !s.startsWith('verb:')).map(x => x[1]); const mg = []; for (let i = 1; i < mech.length; i++) mg.push(mech[i] - mech[i - 1]); mg.push(mins - (mech[mech.length - 1] || 0)); R.longestMechGapMin = +Math.max(...mg).toFixed(1); }
    // (f) the plain verb loop: share of time with no boss, set piece, fence or DROP window; longest stretch without any non-wave event (boss, mini, set, fence, drop, shop)
    { const tot = runs.reduce((a, r) => a + r.t, 0); R.plainLoopShare = +(runs.reduce((a, r) => a + r.plain, 0) / tot).toFixed(2); R.bossShare = +(runs.reduce((a, r) => a + r.bossT, 0) / tot).toFixed(2);
      const spec = ev.filter(e => ['boss', 'mini', 'set', 'fence', 'drop', 'shop'].includes(e[2])).map(e => e[0]); let g = 0, gs = []; for (let i = 1; i < spec.length; i++) { g = Math.max(g, spec[i] - spec[i - 1]); gs.push(spec[i] - spec[i - 1]); }
      gs.sort((a, b) => a - b); R.specialEventGapMaxS = Math.round(g); R.specialEventGapMedianS = Math.round(gs[gs.length >> 1] || 0); }
    // (e) bosses: fights vs distinct behaviours (the verb set per phase), distinct verbs in total
    { const fights = []; let cur = null; for (const e of ev) { if (e[2] === 'boss' || e[2] === 'mini') { cur = { who: e[3], kind: e[2], verbs: { 1: new Set(), 2: new Set(), 3: new Set() } }; fights.push(cur); } else if (e[2] === 'verb' && cur) { const [nm, ph, v] = e[3].split('|'); if (cur.who.startsWith(nm)) cur.verbs[+ph.slice(1)].add(v); } }
      const beh = fights.map(f => [1, 2, 3].map(p => [...f.verbs[p]].sort().join(',')).join(' / ')); const kits = fights.map(f => [...new Set([...f.verbs[1], ...f.verbs[2], ...f.verbs[3]])].sort().join(','));
      R.bossFights = fights.length; R.bossFightsBig = fights.filter(f => f.kind === 'boss').length; R.distinctBossBehaviours = new Set(beh).size; R.distinctBossVerbKits = new Set(kits).size;
      R.bossVerbsTotal = [...new Set(fights.flatMap(f => [...f.verbs[1], ...f.verbs[2], ...f.verbs[3]]))].sort();
      R.bossList = fights.map((f, i) => [f.kind, f.who.split('|')[0], kits[i]]); }
    // (g) music, backgrounds, sprites, pickups
    { const songs = {}; let cs = null, ct = 0; const sev = ev.filter(e => e[2] === 'song'); for (const e of sev) { if (cs != null) songs[cs] = (songs[cs] || 0) + (e[0] - ct); cs = e[3]; ct = e[0]; } if (cs != null) songs[cs] = (songs[cs] || 0) + (T - ct);
      R.songMinutes = Object.fromEntries(Object.entries(songs).map(([k, v]) => [k, +(v / 60).toFixed(1)]).sort((a, b) => b[1] - a[1])); R.distinctSongs = Object.keys(songs).length; R.songStartsPerHour = +(sev.length / mins * 60).toFixed(1);
      R.distinctTracksPerHour = +(R.distinctSongs / mins * 60).toFixed(1);
      const bgs = {}; for (const e of ev.filter(e => e[2] === 'bg')) bgs[e[3]] = (bgs[e[3]] || 0) + 1; R.backgrounds = Object.keys(bgs);
      const sp = {}; let ns = 0; for (const e of ev.filter(e => e[2] === 'enemy')) { const k = e[3].replace('*', ''); sp[k] = (sp[k] || 0) + 1; ns++; } R.spawns = ns; R.spawnShare = Object.entries(sp).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, v, +(v / ns * 100).toFixed(1)]);
      const pk = {}; for (const e of ev.filter(e => e[2] === 'pick')) pk[e[3]] = (pk[e[3]] || 0) + 1; R.pickups = Object.entries(pk).sort((a, b) => b[1] - a[1]);
      const sh = {}; for (const r of runs) for (const k in r.shots) sh[k] = (sh[k] || 0) + r.shots[k]; const nsh = Object.values(sh).reduce((a, b) => a + b, 0); R.bulletSources = Object.entries(sh).sort((a, b) => b[1] - a[1]).map(([k, v]) => [k, v, +(v / nsh * 100).toFixed(1)]);
      const hs = {}; for (const e of ev.filter(e => e[2] === 'hint' || e[2] === 'note')) hs[e[3]] = (hs[e[3]] || 0) + 1; R.hints = Object.entries(hs).sort((a, b) => b[1] - a[1]).slice(0, 15);
      const mu = {}; for (const e of ev.filter(e => e[2] === 'mut')) mu[e[3]] = (mu[e[3]] || 0) + 1; R.mutators = mu;
      const sets = {}; for (const e of ev.filter(e => ['set', 'fence', 'drop'].includes(e[2]))) { const k = e[2] + ':' + e[3]; sets[k] = (sets[k] || 0) + 1; } R.setPieces = sets;
      const shops = ev.filter(e => e[2] === 'shop'); R.pitStops = shops.length; }
    out[c] = R;
  }
  return out;
}
function report(S) {
  for (const c in S) { if (c === 'meta') continue; const R = S[c];
    console.log(`\n=== ${c}: ${R.gameMinutes} game-min, ${R.encounters} encounters (${R.encountersPerMin}/min), ${R.distinctEncounterSigs} distinct; repeat-within-5-min ${(R.repeatRatio5min * 100).toFixed(0)}%`);
    console.log('  top encounters: ' + R.topEncounters.slice(0, 5).map(x => `${x[0]} ${x[1]} (${x[2]}%)`).join(' | '));
    if (R.stages) console.log(`  Jaccard consecutive stages: median ${R.jaccardMedian}, mean ${R.jaccardMean}; stages with 0 new things: ${R.stagesWithZeroNew}`);
    console.log(`  new things: ${R.newThingsFirst30} in the first 30 min, ${R.newThingsAfter30} after; last new thing at min ${R.lastNewThingMin}; longest gap ${R.longestNoveltyGapMin} min (mechanics: ${R.longestMechGapMin} min)`);
    console.log(`  plain loop ${(R.plainLoopShare * 100).toFixed(0)}% of time, boss ${(R.bossShare * 100).toFixed(0)}%; special events every ${R.specialEventGapMedianS} s (median), max gap ${R.specialEventGapMaxS} s`);
    console.log(`  bosses: ${R.bossFights} fights (${R.bossFightsBig} big), ${R.distinctBossBehaviours} distinct behaviours, ${R.distinctBossVerbKits} verb kits, verbs ${R.bossVerbsTotal.join(',')}`);
    console.log(`  songs: ${R.distinctSongs} (${JSON.stringify(R.songMinutes)}); backgrounds ${R.backgrounds.length}; spawns ${R.spawns}: ` + R.spawnShare.slice(0, 5).map(x => x[0] + ' ' + x[2] + '%').join(', '));
  }
}
