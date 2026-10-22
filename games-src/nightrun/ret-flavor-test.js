#!/usr/bin/env node
// Run-and-gun flavour (parts/waves/flavor.js, flag RET.flavor) through the real page (prints pass/fail only):
//   NODE_PATH=$(npm root -g) node games-src/nightrun/ret-flavor-test.js      env: GAME_DIR=<dir with index.html>, SECS=70, SHOT=<dir for screenshots>
//  (a) captive: spawns on a bar line, shots pass through the cage, 6-8 hits free it -> free wingmate for 2 bars (or +1000 and a pickup when a power already runs);
//      leaving unrescued is neutral (no leak, no hull); none in the first minute of stages 1-2; none during a boss
//  (b) breakables: at most 3, loot on a hit, decoys pop without damage, bullets and enemies are never blocked, never level with the ship
//  (c) secret: marked spot (odd stage) and flickering sign (even stage) -> SECRET FOUND, medal item worth points, NR 'secret'
//  (d) medals + clear screen: NR 'medal', Neon only the first time per stage, RESCUED n/m, icons >= 14 px, inside the screen at 390x763 and 1280x720
//  (e) set pieces: collapse lanes warn >= 0.6 s before the debris, one hull per lane at most; convoy hatch drops a chest; bullets only through eb() (ebCap/BCAP); portrait never gets the convoy
//  (f) caps over full stages (ebCap, player bullets, 3 breakables) at 1280x720 and portrait 390x763; an idle ship earns nothing from it
//  (g) ?flavor=0: nothing spawns, nothing on the clear screen
const PW = require('playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun'), SECS = +process.env.SECS || 70;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fp = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148';

const START = (n, diff) => { const m = window.__mnr; if (m.running) m.abort(); m.SET.diff = diff || 'normal'; m.SET.auto = true; m.applySet && m.applySet(); localStorage.removeItem('mnr_flavor'); m.startStory(n); m.simOn(true); m.P.hp = m.P.max = 9; m.P.inv = 99; if (m.SH.active) m.SH.close(); return true; };
const STEP = (m, n) => { for (let i = 0; i < n; i++) { m.STILL.t = 0; m.P.inv = 99; m.G.dead = false; m.step(1 / 30); } };
const SHOOT = (m, o, n) => { for (let i = 0; i < n; i++) { if (typeof o === 'function') { const q = o(); m.G.pb.push({ x: q.x - 30, y: q.y, vx: 700, vy: 0, dm: 1, pf: 0 }); STEP(m, 1); continue; } m.G.pb.push({ x: o.x - 30, y: o.y, vx: 700, vy: 0, dm: 1, pf: 0 }); STEP(m, 1); } };

const PLAY = (o) => {   // full-stage run: a dodging bot; collects caps and sightings. idle=true: the ship does not move
  const m = window.__mnr, F = window.FL; START(o.n, o.diff); F.S.resc = 0; F.S.sec = 0; F.S.brk = 0;
  const r = { capMax: 0, brkMax: 0, ebOver: 0, pbOver: 0, capEarly: 0, bossSpawn: 0, spawnOffBar: 0, setSeen: {}, itemMax: 0, hintBad: [], T: 0 };
  const wrap = (k) => { const f = F[k]; F[k] = function () { if (!F.inBar) r.spawnOffBar++; return f.apply(this, arguments); }; };
  ['spawnCap', 'spawnSec', 'startSet'].forEach(wrap); const sb = F.spawnBrk; F.spawnBrk = function (k, o) { if (!F.inBar && !k) r.spawnOffBar++; return sb.apply(this, arguments); };
  let T = 0, ebCap = m.touchUI || m.rotMode ? 18 : 25;
  while (m.running && T < o.secs && !m.ST.over) {
    if (!o.idle) { m.P.y = 360 + 150 * Math.sin(T * 1.3); m.P.x = 260 + 100 * Math.sin(T * .7); } else { m.P.x = 200; m.P.y = 270; }
    m.P.hp = 99; m.P.inv = 1; if (m.SH.active) m.SH.close();
    m.step(1 / 30); T += 1 / 30;
    r.capMax = Math.max(r.capMax, F.cap.length); r.brkMax = Math.max(r.brkMax, F.brk.filter(b => b.k !== 'chest').length); r.itemMax = Math.max(r.itemMax, F.itm.length);
    if (m.G.eb.length > ebCap + 5) r.ebOver++; if (m.G.pb.length > (m.touchUI || m.rotMode ? 44 : 64) + 2) r.pbOver++;
    if (o.n <= 2 && T < 58 && F.cap.length) r.capEarly++;
    if (m.G.boss && (F.cap.length || F.set || F.sec)) r.bossSpawn++;
    if (F.set) r.setSeen[F.set.k] = 1;
    if (m.G.hint && /CAGE|DEBRIS|HATCH/.test(m.G.hint.txt || '') && m.G.hint.txt.split(/\s+/).length > 8) r.hintBad.push(m.G.hint.txt);
  }
  r.T = Math.round(T); r.resc = F.S.resc; r.sec = F.S.sec; r.brk = F.S.brk; r.leak = window.LEAK ? LEAK.total : 0; r.name = m.ST.def && m.ST.def.name; m.abort(); return r;
};
const UNIT = () => {   // (a)(b)(c) driven directly
  const m = window.__mnr, F = window.FL, out = [], ok = (c, msg) => { if (!c) out.push(msg); };
  START(3); STEP(m, 3); m.P.x = 200; m.P.y = 270; F.plan.caps.forEach(c => c.done = true);
  // (a) captive
  m.G.pk.length = 0; const sc0 = m.G.score; F.spawnCap(); let c = F.cap[0]; ok(!!c, 'captive did not spawn'); c.x = 700; c.y = c.by = 200; ok(!m.G.en.includes(c), 'captive must not be an enemy');
  const leak0 = LEAK.total, hp0 = m.P.hp, hits0 = m.ST.hits;
  m.G.pb.push({ x: c.x - 30, y: c.y, vx: 700, vy: 0, dm: 1, pf: 0 }); STEP(m, 2); const b0 = m.G.pb.find(b => b.x > c.x - 5); ok(c.hp < c.max, 'a shot did not hurt the cage'); ok(!!b0 && !b0.dead, 'the cage blocked the shot (it must pass through)');
  ok(c.max >= 6 && c.max <= 8, 'cage hits should be 6-8 (' + c.max + ')');
  SHOOT(m, c, 10); ok(F.s.resc === 1 && !F.cap.length, 'cage not opened by ' + 10 + ' hits'); ok(m.PW.on('wing'), 'no wingmate after the rescue');
  const wing = m.G.pw.act.find(a => a.k === 'wing'); ok(wing && wing.d === 8, 'wingmate should last 2 bars = 8 beats (' + (wing && wing.d) + ')');
  // second rescue while the wingmate runs: +1000 and a pickup
  const pk0 = m.G.pk.length, sc1 = m.G.score; F.spawnCap(); c = F.cap[0]; c.x = 700; c.y = c.by = 200; SHOOT(m, c, 10);
  ok(m.G.score - sc1 >= 1000, 'second rescue should pay 1000 (' + (m.G.score - sc1) + ')'); ok(m.G.pk.length > pk0, 'second rescue should drop a pickup');
  // unrescued leaves: neutral
  F.spawnCap(); c = F.cap[0]; c.x = -100; STEP(m, 2); ok(!F.cap.length, 'a cage past the left edge should vanish'); ok(LEAK.total === leak0 && m.P.hp === hp0 && m.ST.hits === hits0, 'an unrescued cage changed leaks / hull / hits');
  // (b) breakables
  m.G.pk.length = 0; const b1 = F.spawnBrk('crate', { x: 700, y: 200, by: 200, decoy: false }); const en = m.G.en.length;
  m.G.pb.push({ x: 660, y: 200, vx: 700, vy: 0, dm: 1, pf: 0 }); STEP(m, 2); const bb = m.G.pb.find(b => b.x > 700 && b.y === 200); ok(!!bb && !bb.dead, 'a crate blocked a shot'); SHOOT(m, b1, 4); ok(b1.dead || !F.brk.includes(b1), 'crate not broken'); ok(m.G.pk.length > 0, 'crate dropped nothing');
  ok(m.G.en.length === en, 'a crate changed the enemy list');
  m.G.pk.length = 0; const d1 = F.spawnBrk('lamp', { x: 700, y: 300, by: 300, decoy: true }), h1 = m.P.hp, ha = m.ST.hits; SHOOT(m, d1, 4); ok(!m.G.pk.length, 'a decoy dropped loot'); ok(m.P.hp === h1 && m.ST.hits === ha, 'a decoy hurt');
  for (let i = 0; i < 6; i++) F.spawnBrk(); F.brk.length = 0; for (let i = 0; i < 80; i++) { m.P.y = 40 + Math.random() * 460; const b = F.spawnBrk('sign'); if (Math.abs(b.y - m.P.y) < 90) { ok(false, 'a breakable spawned level with the ship (dy ' + Math.abs(b.y - m.P.y).toFixed(0) + ')'); break; } F.brk.length = 0; }
  // (c) secret: spot at stage 3, sign at stage 4
  m.P.x = 200; m.P.y = 270; F.brk.length = 0; let got = 0; m.NR.on('secret', () => got++); F.spawnSec('spot'); F.sec.x = 200; F.sec.y = 270; const sc = m.G.score; STEP(m, 2);
  ok(F.s.sec && got === 1, 'flying into the spot did not find the secret'); ok(F.itm.length === 1 || m.G.score - sc >= 2500, 'no medal item after the secret'); if (F.itm.length) { m.P.x = F.itm[0].x; m.P.y = F.itm[0].y; STEP(m, 2); } ok(m.G.score - sc >= 2500, 'the medal item paid nothing (' + (m.G.score - sc) + ')');
  ok(/SECRET FOUND/.test((m.G.banner || {}).a || ''), 'no SECRET FOUND banner');
  START(4); STEP(m, 3); ok(F.plan.sec && F.plan.sec.kind === 'sign', 'stage 4 should have a sign secret'); F.spawnSec('sign'); F.sec.x = 700; F.sec.y = F.sec.by = 200; SHOOT(m, F.sec, 6); ok(F.s.sec, 'shooting the sign did not find the secret');
  START(1); STEP(m, 3); ok(!F.plan.sec, 'stage 1 must have no secret'); START(2); STEP(m, 3); ok(!F.plan.sec, 'stage 2 must have no secret');
  m.abort(); return out;
};
const CLEAR = (o) => {   // (d) a real clear of stage n with a given state; returns the DOM facts
  const m = window.__mnr, F = window.FL; START(o.n); STEP(m, 3); const meds = [], bank0 = m.GA.bank; m.NR.on('medal', d => meds.push(d.id));
  if (F.s) { F.s.tot = o.tot; F.s.resc = o.resc; F.s.sec = !!o.sec; } m.ST.hits = o.hits || 0; if (window.LEAK) LEAK.total = o.leak || 0;
  m.ST.clear(); const res = JSON.parse(JSON.stringify(F.res || { list: [] })); m.ST.finish(); const html = document.getElementById('srStars').innerHTML, host = document.getElementById('stres');
  const r = { meds, bonus: F.res ? F.res.bonus : 0, ids: res.list.filter(q => q[1]).map(q => q[0]), all: res.list.map(q => q[0]), html: /RESCUED (\d)\/(\d)/.exec(html), flb: document.querySelectorAll('#srStars .flb').length, on: document.querySelectorAll('#srStars .flb.on').length };
  const bx = [...document.querySelectorAll('#srStars .flb, #srStars .flr')].map(e => { const q = e.getBoundingClientRect(), cs = getComputedStyle(e); return { l: q.left, r: q.right, t: q.top, b: q.bottom, fs: parseFloat(cs.fontSize), n: e.className }; });
  r.bad = []; for (const q of bx) { if (q.fs < 13.9) r.bad.push('text ' + q.fs + 'px on .' + q.n); if (q.l < -1 || q.r > innerWidth + 1) r.bad.push('outside the screen sideways'); }
  const ho = host.querySelector('.in') || host; r.scrollX = document.documentElement.scrollWidth > innerWidth + 1 || ho.scrollWidth > ho.clientWidth + 2;
  const nx = document.getElementById('srNext'); r.overlap = false; const flm = document.querySelector('#srStars .flm'); if (flm && nx && !nx.hidden) { const a = flm.getBoundingClientRect(), b = nx.getBoundingClientRect(); r.overlap = a.bottom > b.top && a.top < b.bottom && a.right > b.left && a.left < b.right; }
  m.abort(); return r;
};
const SETS = (o) => {   // (e)
  const m = window.__mnr, F = window.FL, out = [], ok = (c, msg) => { if (!c) out.push(msg); };
  const n = m.STAGES.findIndex(s => s.pos === 1 && !s.ch && s.goal.k !== 'boss') + 1 || m.STAGES.findIndex(s => s.pos === 1 && !s.ch) + 1; START(n); STEP(m, 3);
  ok(F.plan.set, 'the 2nd stage of a district should plan a set piece (stage ' + n + ')'); const bad = m.STAGES.findIndex(s => s.pos === 0) + 1; START(bad); STEP(m, 3); ok(!F.plan.set, 'a first stage must have no set piece');
  START(n); STEP(m, 3); m.P.x = 200; m.P.y = 270;
  // collapse: warn >= 0.6 s, then debris; standing in a lane costs one hull, not more
  F.set = null; F.mkBill(); const s = F.set; s.lanes[0].x = 200; let tw = 0, fell = false, hp0 = m.P.hp, hits0 = m.ST.hits; m.P.inv = 0;
  for (let i = 0; i < 150 && F.set === s; i++) { m.P.x = 200; m.P.y = 270; m.P.inv = 0; m.G.dead = false; if (s.ph === 'warn') { tw += 1 / 30; ok(m.ST.hits === hits0, 'hurt during the warning'); } else if (!fell) { fell = true; ok(tw >= .6, 'warning only ' + tw.toFixed(2) + ' s'); } m.step(1 / 30); if (s.ph === 'done') break; }
  ok(fell, 'the debris never fell'); ok(m.ST.hits - hits0 === 1, 'one lane should cost exactly one hull (' + (m.ST.hits - hits0) + ')');
  for (let i = 0; i < 60 && F.set; i++) { m.P.inv = 99; m.step(1 / 30); } ok(F.brk.some(b => b.k === 'chest'), 'no chest after the collapse'); m.G.pk.length = 0; const ch = F.brk.find(b => b.k === 'chest'); if (ch) { SHOOT(m, ch, 5); ok(m.G.pk.length >= 4, 'the chest dropped too little'); }
  // convoy (landscape only)
  if (!m.rotMode) { F.set = null; F.mkTrain(); const t = F.set; let ebMax = 0, bcOver = 0; m.P.x = 300; m.P.y = 150; for (let i = 0; i < 60; i++) { m.P.inv = 99; m.step(1 / 30); } ok(t.ph === 'run', 'the convoy never started');
    for (let i = 0; i < 400 && F.set === t; i++) { m.P.inv = 99; m.P.y = 150; m.P.x = 300; m.step(1 / 30); ebMax = Math.max(ebMax, m.G.eb.length); for (const b of m.G.eb) if (Math.hypot(b.vx, b.vy) > m.BCAP + 2) bcOver++; if (t.x + t.L < 330) break; }
    ok(ebMax <= 25 + 5, 'convoy bullets over the cap (' + ebMax + ')'); ok(!bcOver, 'a convoy bullet faster than BCAP');
    F.set = null; F.mkTrain(); const t2 = F.set; t2.ph = 'run'; t2.x = 100; m.P.inv = 0; m.P.x = 300; m.P.y = t2.gy - 20; const h = m.ST.hits; m.step(1 / 30); ok(m.ST.hits === h + 1, 'standing in the convoy should cost a hull');
    m.P.inv = 99; m.P.y = 100; m.G.pk.length = 0; F.brk.length = 0; const kinds = []; const sb0 = F.spawnBrk; F.spawnBrk = function (k) { kinds.push(k); return sb0.apply(this, arguments); }; SHOOT(m, () => ({ x: t2.x + t2.wp.off, y: t2.gy - 62 }), 16); ok(t2.wp.dead, 'the hatch did not break (' + t2.wp.hp + ')'); F.spawnBrk = sb0; ok(kinds.includes('chest'), 'no chest from the hatch'); }
  else { F.set = null; F.startSet(); ok(F.set && F.set.k === 'bill', 'portrait must not get the convoy'); }
  // never during a boss
  START(n); STEP(m, 3); F.plan.set.bar = 0; m.G.boss = { type: 'boss', x: 800, y: 270, r: 40, hp: 9, max: 9, t: 1, flash: 0 }; m.G.en.push(m.G.boss); STEP(m, 1); m.NR.emit('bar', { i: 0 }); STEP(m, 2); ok(!F.set && !F.cap.length, 'a set piece / captive started during a boss');
  m.abort(); return out;
};
(async () => {
  const fails = [], port = await fp(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' }); await sleep(700);
  const br = await PW.chromium.launch(), url = q => `http://127.0.0.1:${port}/index.html?sim=1&all=1${q || ''}`;
  const open = async (w, h, touch, q) => { const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, userAgent: touch ? UA : undefined }), p = await ctx.newPage();
    p.on('pageerror', e => fails.push(`page error @${w}x${h}: ${e.message}`)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); await p.goto(url(q));
    await p.waitForFunction(() => window.__mnr && __mnr.TR.list.length > 0 && window.FL, null, { timeout: 15000 }).catch(() => fails.push('page did not start'));
    await p.evaluate(`window.START=${START};window.STEP=${STEP};window.SHOOT=${SHOOT};`); return { ctx, p }; };
  const shot = process.env.SHOT;
  for (const [w, h, touch] of [[1280, 720, false], [390, 763, true]]) {
    const { ctx, p } = await open(w, h, touch), tag = `@${w}x${h}`;
    if (w === 1280) {
      (await p.evaluate(UNIT)).forEach(f => fails.push(f));
    }
    (await p.evaluate(SETS)).forEach(f => fails.push(`${tag}: ${f}`));
    // (d) clear screens
    const all = await p.evaluate(CLEAR, { n: 3, tot: 2, resc: 2, sec: true, hits: 0, leak: 0 });
    for (const id of ['noleak', 'nohit', 'rescued', 'secret']) if (!all.ids.includes(id)) fails.push(`${tag}: medal ${id} not earned (${all.ids})`);
    if (!all.html || all.html[1] !== '2') fails.push(`${tag}: RESCUED 2/2 missing on the clear screen`); if (all.flb < 4) fails.push(`${tag}: only ${all.flb} medal icons`); if (all.on < 4) fails.push(`${tag}: only ${all.on} lit`);
    if (all.bonus !== 20) fails.push(`${tag}: first-clear flavour Neon odd (${all.bonus})`); all.bad.forEach(b => fails.push(`${tag}: clear screen ${b}`)); if (all.scrollX) fails.push(`${tag}: clear screen scrolls sideways`); if (all.overlap) fails.push(`${tag}: medals overlap the NEXT button`);
    if (!all.meds.includes('noleak') || !all.meds.includes('secret')) fails.push(`${tag}: NR medal events missing (${all.meds})`);
    const none = await p.evaluate(CLEAR, { n: 3, tot: 2, resc: 1, sec: false, hits: 2, leak: 3 });
    if (none.ids.length) fails.push(`${tag}: medals earned that should not be (${none.ids})`); if (none.html && none.html[1] !== '1') fails.push(`${tag}: RESCUED 1/2 expected`);
    if (none.bonus !== 2) fails.push(`${tag}: one sprite should pay 2 Neon (${none.bonus})`);
    // (f) full stages
    const secs = w === 1280 ? SECS : 40; let any = { resc: 0, setSeen: {}, capMax: 0 };
    const sp = await p.evaluate(() => __mnr.STAGES.findIndex(s => s.pos === 1 && !s.ch && s.goal.k !== 'boss') + 1), sp2 = await p.evaluate(() => { let k = 0; for (let i = 0; i < __mnr.STAGES.length; i++) { const s = __mnr.STAGES[i]; if (s.pos === 1 && !s.ch && s.di === 1) k = i + 1; } return k; }), seenT = {};
    for (const n of w === 1280 ? [1, 3, 4, sp, sp2] : [3, sp]) {
      const r = await p.evaluate(PLAY, { n, secs: n === sp || n === sp2 ? 125 : secs, diff: 'normal' }); if ((n === sp || n === sp2) && w === 1280) { if (!r.setSeen.train && !r.setSeen.bill) fails.push(`${tag}: no set piece in stage ${n}`); Object.assign(seenT, r.setSeen); } if (process.env.V) console.log(tag, n, r.name, JSON.stringify(r));
      if (r.capMax > 1) fails.push(`${tag} stage ${n}: ${r.capMax} captives at once`); if (r.brkMax > 3) fails.push(`${tag} stage ${n}: ${r.brkMax} breakables at once`); if (r.ebOver) fails.push(`${tag} stage ${n}: enemy bullets over ebCap`); if (r.pbOver) fails.push(`${tag} stage ${n}: player bullets over the cap`);
      if (r.capEarly) fails.push(`${tag} stage ${n}: captive in the first minute`); if (r.bossSpawn) fails.push(`${tag} stage ${n}: flavour during a boss`); if (r.spawnOffBar) fails.push(`${tag} stage ${n}: ${r.spawnOffBar} spawns off the bar line`); if (r.hintBad.length) fails.push(`${tag}: hint too long ${r.hintBad[0]}`);
      if (r.leak && r.leak > 40) fails.push(`${tag} stage ${n}: odd leak count ${r.leak}`);
    }
    if (w === 1280 && !seenT.train) fails.push('no convoy seen in a landscape district stage'); if (w === 1280 && !seenT.bill) fails.push('no collapse seen');
    if (w === 1280) {   // captives and set pieces really appear in a full run; an idle ship earns nothing
      const full = await p.evaluate(PLAY, { n: 3, secs: 150, diff: 'normal' }); if (process.env.V) console.log('full', JSON.stringify(full)); if (full.capMax < 1) fails.push('no captive appeared in 150 s of stage 3');
      const idle = await p.evaluate(PLAY, { n: 3, secs: 100, diff: 'normal', idle: true }); if (process.env.V) console.log('idle', JSON.stringify(idle)); if (idle.resc || idle.sec || idle.brk > 3) fails.push(`idle ship earned flavour rewards (resc ${idle.resc}, secret ${idle.sec}, broke ${idle.brk})`);
    }
    // render with everything on screen (no errors, optional screenshot)
    const rr = await p.evaluate(() => { const m = __mnr, F = FL; START(3); STEP(m, 3); F.spawnCap(); F.cap[0].x = 600; F.cap[0].y = F.cap[0].by = 200; F.spawnBrk('sign', { x: 700, y: 420, by: 420 }); F.spawnBrk('crate', { x: 800, y: 100, by: 100 }); F.spawnSec('spot'); F.sec.x = 500; F.sec.y = 150; F.itm.push({ x: 450, y: 300, vx: -40, vy: 0, r: 16, t: 0, pts: 2500 }); if (!m.rotMode) F.mkTrain(); else F.mkBill(); if (F.set.k === 'train') { F.set.ph = 'run'; F.set.x = 200; } else { F.set.ph = 'warn'; } STEP(m, 3); m.render(m.G.t, 1 / 30); return F.cap.length + F.brk.length; });
    if (rr < 3) fails.push(`${tag}: render scene lost objects`);
    if (shot) await p.screenshot({ path: path.join(shot, `flavor-${w}x${h}.png`) });
    await p.evaluate(() => __mnr.abort()); await ctx.close();
  }
  // (g) flag off
  { const { ctx, p } = await open(1280, 720, false, '&flavor=0'); const r = await p.evaluate(PLAY, { n: 3, secs: 90, diff: 'normal' }), s = await p.evaluate(() => { const m = __mnr, F = FL; START(3); STEP(m, 3); return F.on(); });
    if (s) fails.push('flavor=0: flag still on'); if (r.capMax || r.brkMax || r.itemMax || Object.keys(r.setSeen).length) fails.push('flavor=0: objects spawned'); if (r.resc || r.sec || r.brk) fails.push('flavor=0: rewards counted');
    const c = await p.evaluate(CLEAR, { n: 3, tot: 2, resc: 2, sec: true }); if (c.flb || c.html || c.bonus) fails.push('flavor=0: clear screen or Neon changed'); await ctx.close(); }
  await br.close(); srv.kill();
  console.log(fails.length ? 'FAIL\n' + [...new Set(fails)].slice(0, 30).join('\n') : 'PASS ret-flavor-test'); process.exit(fails.length ? 1 : 0);
})();
