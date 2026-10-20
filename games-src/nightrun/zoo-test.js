#!/usr/bin/env node
// Station-and-hover + the eight new enemy kinds (parts/zoo.js, flag RET.zoo) through the real page (prints pass/fail only):
//   NODE_PATH=$(npm root -g) node games-src/nightrun/zoo-test.js      env: GAME_DIR=<dir with index.html>, SECS=70 (sim seconds per difficulty), V=1 (verbose)
//  (a) every difficulty, an unarmed bot in story stage 3: each drone / flanker hovers exactly N beats on the beat clock (Easy 6, Normal 5, Hard 4, Very hard 3, Legend 3),
//      on a station in the right 60% (x >= 0.4 W), hovering enemies never overlap, enemy bullets stay under ebCap and BCAP
//  (b) entry speed factor easy/normal .78, hard .8, legend .9 (a real drone, flag on vs flag off)
//  (c) a busy screen defers a new wave (2-beat retry) and the wave still comes
//  (d) each new kind: spawns, behaves (shield blocks the front / side hits hurt / pops after N hits, splitter splits, bomber ring >= .5 s and hurts only inside, sniper line >= .4 s
//      then one shot <= BCAP along the line, kamikaze flash >= .5 s then dives and is dodgeable, healer heals, carrier launches, minelayer mines arm after .5 s, hurt, last 16 beats),
//      is hittable and dies (score, effect), hint once, Lab FOES chips; story stage 4 has the shielder, stage 3 none; endless unlock times
//  (e) phone 390x763 touch and desktop 1280x720; ?zoo=0 = old behaviour (no hover, no zoo kinds, hard .9)
const PW = require('playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun'), SECS = +process.env.SECS || 70;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fp = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148';
const HOVN = { easy: 6, normal: 5, hard: 4, vhard: 3, legend: 3 };

const SETUP = (n, df) => { const m = window.__mnr; if (m.running) m.abort(); m.SET.diff = df || 'normal'; m.SET.auto = false; m.applySet && m.applySet(); m.startStory(n); m.simOn(true); m.G.en.length = 0; m.G.eb.length = 0; ZOO.reset(); m.P.hp = 50; m.P.x = 200; m.P.y = 270; m.SH.sh = 0; };
const RUN = (o) => {   // an unarmed, dodging bot plays stage o.n for o.secs; returns the hover statistics
  const m = window.__mnr, Z = window.ZOO; SETUP(o.n, o.diff); const bad = [], seenKinds = {}; let T = 0, maxEb = 0, maxV = 0, ebCap = 0, hoverX = [];
  while (m.running && T < o.secs && !m.G.boss) {
    m.P.hp = 99; m.P.inv = 1; m.P.y = 360 + 150 * Math.sin(T * 1.3); m.P.x = 260 + 100 * Math.sin(T * .7); if (m.SH.active) m.SH.close();
    m.step(1 / 30); T += 1 / 30; maxEb = Math.max(maxEb, m.G.eb.length); for (const b of m.G.eb) if (!b.lob) maxV = Math.max(maxV, Math.hypot(b.vx, b.vy));
    for (const e of m.G.en) { if (e.zt) seenKinds[e.type] = 1; if (e.zst === 1 && (e.type === 'drone' || e.type === 'flank')) hoverX.push(e.x); }
  }
  const h = Z.stat.hovers.filter(q => q.t === 'drone' || q.t === 'flank');
  const out = { n: h.length, bs: [...new Set(h.map(q => q.b))], minGap: Z.stat.minGap, maxHover: Z.stat.maxHover, maxCount: Z.stat.maxCount, maxEb, maxV: Math.round(maxV), minX: Math.round(Math.min(...hoverX, 9999)), kinds: Object.keys(Z.stat.kinds), seen: Object.keys(seenKinds), deferred: Z.stat.spawnsDeferred, T: Math.round(T), N: Z.N() };
  m.abort(); return out;
};
const SPEED = () => {   // measured entry speed of a drone: flag on vs flag off (leak and zoo both)
  const m = window.__mnr, L = window.LEAK, R = m.RET, res = {}, keep = [R.leak, R.zoo];
  const run = (df, on) => { R.leak = on; R.zoo = on; m.SET.diff = df; m.startStory(3); m.simOn(true); m.G.en.length = 0; m.G.eb.length = 0; m.P.hp = 99; m.P.inv = 99; m.P.x = 40;
    const d = L.en('drone', { x: 800, y: 100, amp: 0 }); d.gr = 0; d.zs = { x: 200, y: 100 }; d.zph = 0; d.zst = 0; const x0 = d.x; for (let i = 0; i < 15; i++) m.step(1 / 30); const v = (x0 - d.x) / 0.5; m.abort(); return v; };
  for (const df of ['easy', 'normal', 'hard', 'vhard', 'legend']) res[df] = run(df, keep[0]) / run(df, false);
  R.leak = keep[0]; R.zoo = keep[1]; return res;
};
const DEFER = () => {   // (c) a busy screen: the new wave waits, then comes
  const m = window.__mnr, Z = window.ZOO, out = []; SETUP(3, 'normal');
  for (let i = 0; i < Z.CAP() + 2; i++) { const e = window.LEAK.en('drone', { x: 700 + (i % 3) * 40, y: 80 + i * 40, amp: 0 }); e.gr = 0; e.zs = { x: e.x, y: e.y }; e.zph = 0; e.zst = 1; e.hv0 = m.G.bc + 99; }
  const n0 = m.G.en.length, d0 = Z.stat.spawnsDeferred; m.DIR.spawnOne(); if (m.G.en.length !== n0) out.push('a wave spawned on a busy screen'); if (Z.stat.spawnsDeferred !== d0 + 1) out.push('deferral not counted');
  for (const e of m.G.en) e.hv0 = m.G.bc - 99;   // everyone leaves
  const seen0 = new Set(m.G.en); let came = false;   // came: an enemy that was not there before the deferral (a scripted formation, stagescripts.js, may enter from the top or bottom edge)
  let T = 0; while (T < 25 && m.G.en.filter(e => e.zst !== 2 && e.hp > 0).length < n0 + 1 && T < 25) { m.P.hp = 99; m.step(1 / 30); T += 1 / 30; if (m.G.en.some(e => !seen0.has(e))) came = true; if (m.G.en.length > n0 + 0 && m.G.en.some(e => e.x > 800)) break; }
  if (!came && !m.G.en.some(e => e.x > 800 && e.zst === 0 || e.x > 880)) out.push('the deferred wave never came');
  m.abort(); return out;
};
const TYPES = () => {
  const m = window.__mnr, Z = window.ZOO, out = [], ok = (c, msg) => { if (!c) out.push(msg); }, G = () => m.G;
  const dirBeat = m.DIR.beat; m.DIR.beat = function () { const nb = m.G.bc; for (let k = this.q.length - 1; k >= 0; k--) { const x = this.q[k]; if (m.G.bc >= x.b) { this.q.splice(k, 1); try { x.f(); } catch (e) { } } } };   // no random waves, only the scheduled spawns
  const prep = (n) => { SETUP(n || 30, 'normal'); m.P.x = 150; m.P.y = 270; m.P.inv = 0; m.P.hp = m.P.max; m.P.dq = 0; m.P.dashT = 0; };
  const S = (k, f) => { for (let i = 0; i < k; i++) { m.SH.sh = 0; if (m.SH.active) m.SH.close(); m.step(1 / 30); if (f && f(i) === false) return i; } return k; };
  const hold = (e, x, y) => { e.gr = 0; e.tin = m.G.t - 5; e.zs = { x, y }; e.zph = 0; e.zst = 1; e.hv0 = m.G.bc + 999; e.x = x; e.y = y; e.bf = 999; };
  const shot = (e, dx, dy, vx, vy) => { const b = { x: e.x + dx, y: e.y + dy, vx, vy, dm: 2, pf: 0 }; m.G.pb.push(b); return b; };
  // --- shielder
  { prep(); const e = Z.mk('shielder', { x: 620, y: 270 }); hold(e, 620, 270); e.hp = e.max = e.hq = 99; e.fa = Math.PI; e.shN = e.shMax = 8; const n0 = e.shN, hp0 = e.hp;
    shot(e, -40, 0, 870, 0); S(2); ok(e.shN < n0 && e.hp === hp0, 'front shot not blocked (shN ' + e.shN + ' hp ' + e.hp + '/' + hp0 + ')');
    shot(e, 0, -e.r - 3, 0, 500); S(2); ok(e.hp < hp0, 'side shot did not hurt');
    let k = 0; while (e.shN > 0 && k++ < 20) { shot(e, -40, 0, 870, 0); S(2); e.fa = Math.PI; } ok(e.shN <= 0 && k <= 8, 'shield did not break after N hits'); const hp1 = e.hp; shot(e, -40, 0, 870, 0); S(2); ok(e.hp < hp1 || e.dead || e.hp <= 0, 'front shot after the shield broke did not hurt'); }
  // --- splitter
  { prep(); const e = Z.mk('splitter', { x: 600, y: 270 }); hold(e, 600, 270); const k0 = m.G.kills; e.hp = 0; S(2); const z = m.G.en.filter(q => q.type === 'zdrn'); ok(z.length >= 2 && z.length <= 3, 'splitter spawned ' + z.length + ' drones'); ok(m.G.kills > k0, 'splitter kill not counted'); ok(Z.stat.splits === 1, 'split not counted');
    const q = z[0]; if (q) { q.gr = 0; q.tin = m.G.t - 5; const h0 = q.hp; shot(q, -24, 0, 870, 0); S(2); ok(q.hp < h0 || q.dead || q.hp <= 0, 'small drone not hittable'); } }
  // --- bomber: ring >= .5 s, hurts only inside
  { prep(); const e = Z.mk('bomber', { x: 760, y: 120 }); e.gr = 0; e.tin = m.G.t - 5; m.P.x = 120; m.P.y = 440; let t0 = 0, b = null, hpBefore = 0; const tele = [], hits = [];
    for (let i = 0; i < 900 && tele.length < 2; i++) { S(1); if (!b && Z.bombs.length) { b = Z.bombs[0]; t0 = m.G.t; hpBefore = m.P.hp; if (tele.length === 1) { m.P.x = b.x; m.P.y = b.y; hpBefore = m.P.hp; } }
      if (b && !Z.bombs.includes(b)) { tele.push(m.G.t - t0); hits.push(hpBefore - m.P.hp); b = null; m.P.inv = 0; } m.P.inv = 0; if (m.G.dead) break; }
    ok(tele.length === 2, 'bomber dropped fewer than 2 bombs'); if (tele.length === 2) { ok(tele[0] >= .5 && tele[1] >= .5, 'bomb ring telegraph ' + tele.map(x => x.toFixed(2)) + ' s (< .5)'); ok(hits[0] === 0, 'bomb hurt a ship outside its ring'); ok(hits[1] >= 1, 'bomb did not hurt a ship inside its ring'); } }
  // --- sniper: line >= .4 s then one shot <= BCAP along the line
  { prep(); const e = Z.mk('sniper', { x: 890, y: 270 }); e.tin = m.G.t - 5; m.P.x = 150; m.P.y = 300; let t0 = 0, ang = 0, nb = 0, done = false, tl = 0;
    for (let i = 0; i < 900 && !done; i++) { S(1); m.P.hp = 99; if (e.aim === 1 && !t0) { t0 = m.G.t; nb = m.G.eb.length; } if (t0 && e.aim === 0) { tl = m.G.t - t0; ang = e.ang; done = true; } }
    ok(done, 'sniper never aimed'); if (done) { ok(tl >= .4, 'sniper line only ' + tl.toFixed(2) + ' s'); const b = m.G.eb[m.G.eb.length - 1]; ok(m.G.eb.length > nb && !!b, 'sniper did not shoot'); if (b) { ok(Math.hypot(b.vx, b.vy) <= 400.5, 'sniper shot faster than BCAP'); ok(Math.abs(Math.atan2(b.vy, b.vx) - ang) < .02, 'sniper shot not along its line'); } ok(Z.stat.snipes === 1, 'one shot expected'); } }
  // --- kamikaze: flash >= .5 s, dives, hits a ship that stays, misses one that moves
  for (const dodge of [false, true]) { prep(); const e = Z.mk('kamikaze', { x: 900, y: 270 }); e.tin = m.G.t - 5; m.P.x = 150; m.P.y = 270; let t0 = 0, tl = 0, dived = false, hp0 = m.P.hp, moved = false;
    for (let i = 0; i < 1200; i++) { S(1); m.P.inv = 0; if (e.tel && !t0) t0 = m.G.t; if (e.zst === 3 && !dived) { dived = true; tl = m.G.t - t0; if (dodge) { m.P.y += 130; moved = true; } } if (dived && (e.dead || e.hp <= 0 || m.G.en.indexOf(e) < 0)) break; if (m.G.dead) break; if (dived && e.x < 0) break; }
    ok(dived, 'kamikaze never dived'); if (dived) { ok(tl >= .5, 'kamikaze flash ' + tl.toFixed(2) + ' s'); if (dodge) ok(m.P.hp === hp0, 'a dodged dive still hurt'); else ok(m.P.hp < hp0, 'dive did not hurt a ship that stayed'); } }
  // --- healer
  { prep(); const h = Z.mk('healer', { x: 700, y: 270 }); hold(h, 700, 270); h.hv0 = m.G.bc; const d = window.LEAK.en('drone', { x: 640, y: 300, amp: 0 }); hold(d, 640, 300); d.max = 10; d.hp = d.hq = 3; d.hv0 = m.G.bc;
    S(120, () => { d.hv0 = h.hv0 = m.G.bc; d.x = 640; d.y = 300; d.bf = 999; }); ok(d.hp > 3 && Z.stat.heals > 0, 'healer healed nothing (hp ' + d.hp + ')'); }
  // --- carrier
  { prep(); const e = Z.mk('carrier', { x: 1030, y: 270 }); e.tin = m.G.t - 5; let mx = 0; S(900, () => { m.P.hp = 99; m.P.inv = 1; mx = Math.max(mx, m.G.en.filter(q => q.type === 'zdrn').length); if (Z.stat.launches >= 2) return false; });
    ok(Z.stat.launches >= 2 && mx >= 2, 'carrier launched ' + Z.stat.launches + ' times, max ' + mx + ' drones'); }
  // --- minelayer: a mine is harmless for .5 s, then hurts; it lasts 16 beats
  { prep(); const e = Z.mk('minelayer', { x: 800, y: 300 }); e.tin = m.G.t - 5; m.P.x = 100; m.P.y = 60; let mine = null, early = false, late = false, hp0 = 0, placed = false;
    for (let i = 0; i < 1500; i++) { S(1); m.P.inv = 0; if (!mine && Z.mines.length) mine = Z.mines[0];
      if (mine && !placed && e.x < mine.x - 90) { placed = true; m.P.x = mine.x; m.P.y = mine.y; hp0 = m.P.hp; }
      if (placed) { if (!mine.armed && m.P.hp < hp0) early = true; if (mine.armed || m.P.hp < hp0) { S(2); late = m.P.hp < hp0; break; } } }
    ok(!!mine && placed, 'minelayer dropped no mine'); ok(!early, 'an unarmed mine hurt'); ok(late, 'an armed mine did not hurt');
    prep(); const e2 = Z.mk('minelayer', { x: 800, y: 300 }); e2.tin = m.G.t - 5; m.P.x = 100; m.P.y = 60; let mm = null, life = 0, b0 = 0;
    for (let i = 0; i < 2400; i++) { S(1); m.P.hp = 99; m.P.inv = 1; if (!mm && Z.mines.length) { mm = Z.mines[0]; b0 = m.G.bc; } if (mm && !Z.mines.includes(mm)) { life = m.G.bc - b0; break; } }
    ok(life >= 15 && life <= 17, 'mine lasted ' + life + ' beats (want 16)'); }
  // --- every kind: hittable (level shot), dies, hint once
  for (const id of Z.ID) { if (id === 'shielder') continue; prep(); const e = Z.mk(id, { x: 620, y: 270 }); hold(e, 620, 270); if (id === 'bomber' || id === 'minelayer' || id === 'carrier') { e.zst = 1; e.x = 620; }
    const hp0 = e.hp; e.zt = 1; shot(e, -26, 0, 870, 0); S(1); ok(e.hp < hp0 || e.dead, id + ' not hittable'); e.hp = 0; const s0 = m.G.score; S(2); ok(m.G.score > s0 && m.G.en.indexOf(e) < 0, id + ' did not die / score'); }
  { prep(); Z.seen = {}; m.G.banner.t = 0; try { localStorage.removeItem('mnr_hintseen'); } catch (e) { } if (window.HINT) { HINT.hs = null; HINT.reset(); } m.G.note = { t: 0, txt: '' }; Z.hint({ type: 'shielder' }); const hc = () => (window.HINT && HINT.cur ? HINT.cur.txt : '') || m.G.note.txt; const t1 = hc(); if (window.HINT) HINT.reset(); m.G.note = { t: 0, txt: '' }; Z.hint({ type: 'shielder' }); ok(/SHIELDER/.test(t1) && !hc() && !(window.HINT && HINT.q.length), 'hint not once'); ok(t1.split(' ').length <= 8, 'hint over 8 words'); }
  // --- hp scales like the old enemies (scale.js power): a stronger hull-level multiplies hp
  { prep(); const a = Z.mk('sniper', { x: 700, y: 100 }).max; const k = m.UPS.hp; m.UPS.hp = k * 2; const b = Z.mk('sniper', { x: 700, y: 400 }).max; m.UPS.hp = k; ok(b >= a * 1.7, 'hp does not scale with UPS.hp (' + a + ' -> ' + b + ')'); }
  // --- drawing: every kind in every state renders without an exception (the game itself swallows overlay errors)
  { prep(); for (const id of Z.ID) { const e = Z.mk(id, { x: 300 + Z.ID.indexOf(id) * 70, y: 270 }); e.tin = m.G.t - 5; if (id === 'sniper') { e.aim = 1; e.aimAt = m.G.bp + 2; e.ang = 3; } if (id === 'kamikaze') { e.tel = 1; e.diveAt = m.G.bp + 2; e.ang = 3; } if (id === 'carrier') e.arm = true; }
    Z.bombs.push({ x: 400, y: 300, vy: 0, b0: m.G.bc, t0: m.G.t, f: 0 }); Z.mines.push({ x: 500, y: 200, b0: m.G.bc, t0: m.G.t, hp: 1, r: 11 }); Z.fx.push({ x: 300, y: 300, l: .3, m: .3, c: '#fff', k: 'plus' }, { x: 300, y: 300, l: .3, m: .3, c: '#fff', k: 'blast', r: 60 });
    try { for (const e of m.G.en) { Z.art(e, 1); e.flash = .1; Z.art(e, 1); } Z.over(1); m.render(m.G.t, 0); } catch (err) { out.push('draw threw: ' + err.message); } }
  m.DIR.beat = dirBeat; m.abort(); return out;
};
const SCHED = () => {   // story stage 3: none; stage 4: the shielder shows up; endless unlock times
  const m = window.__mnr, Z = window.ZOO, out = [], res = {};
  for (const n of [3, 4]) { SETUP(n, 'normal'); let T = 0; while (m.running && T < 100 && !m.G.boss) { m.P.hp = 99; m.P.inv = 1; m.P.y = 360 + 150 * Math.sin(T * 1.3); m.P.x = 260 + 100 * Math.sin(T * .7); if (m.SH.active) m.SH.close(); m.step(1 / 30); T += 1 / 30; } res[n] = Object.keys(Z.stat.kinds); m.abort(); }
  if (res[3].length) out.push('stage 3 has zoo kinds ' + res[3]); if (!res[4].includes('shielder')) out.push('stage 4 never showed the shielder (' + res[4] + ')');
  m.RET.zoo = true; const st = m.ST.on; m.ST.on = false; const t = m.G.t; const u = x => { m.G.t = x; return Z.unl().length; }; const a = u(10), b = u(100), c = u(400); m.G.t = t; m.ST.on = st;
  if (a !== 0 || b < 2 || c !== 8) out.push(`endless unlocks: ${a} / ${b} / ${c}`); return out;
};
const LABCHK = () => document.getElementById('labTab_foes') && (document.getElementById('labTab_foes').click(), [...document.querySelectorAll('#labP .lc, .lc')].map(e => e.textContent));
(async () => {
  const fails = [], port = await fp(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' }); await sleep(700);
  const br = await PW.chromium.launch(), url = q => `http://127.0.0.1:${port}/index.html?sim=1&all=1${q || ''}${process.env.Q || ''}`;
  const open = async (w, h, touch, q, u) => { const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, userAgent: touch ? UA : undefined }), p = await ctx.newPage();
    p.on('pageerror', e => fails.push(`page error @${w}x${h}: ${e.message}`)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); await p.goto(u || url(q));
    await p.waitForFunction(() => window.__mnr && __mnr.TR.list.length > 0 && window.ZOO, null, { timeout: 15000 }).catch(() => fails.push('page did not start')); await p.evaluate('window.SETUP=' + SETUP); return { ctx, p }; };
  const openLab = async () => { const ctx = await br.newContext({ viewport: { width: 1280, height: 720 } }), p = await ctx.newPage(); p.on('pageerror', e => fails.push('lab page error: ' + e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort()); await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1&lab=1`); return { ctx, p }; };
  // (a)+(b)+(c)+(d)+schedule, desktop
  { const { ctx, p } = await open(1280, 720, false);
    for (const df of Object.keys(HOVN)) { const r = await p.evaluate(RUN, { n: 3, secs: SECS, diff: df }); if (process.env.V) console.log(df, JSON.stringify(r));
      if (r.n < 4) fails.push(`${df}: only ${r.n} hovers in ${r.T} s`); else if (r.bs.length !== 1 || r.bs[0] !== HOVN[df]) fails.push(`${df}: hover lengths ${r.bs} beats, wanted ${HOVN[df]}`);
      if (r.n && r.minX < 960 * .4 - 25) fails.push(`${df}: hovered at x ${r.minX} (< 40% of the width)`);
      if (r.minGap < 0 && r.minGap < 1e8) fails.push(`${df}: hovering enemies overlapped (gap ${r.minGap.toFixed(1)})`);
      if (r.maxV > 445) fails.push(`${df}: an enemy bullet at ${r.maxV} px/s (> 445: BCAP 400 + the AI speed kind)`); if (r.maxEb > 35) fails.push(`${df}: ${r.maxEb} enemy bullets at once`);
      if (r.seen.length) fails.push(`${df}: zoo kinds in stage 3 (${r.seen})`); }
    const s = await p.evaluate(SPEED), want = { easy: .78, normal: .78, hard: .8, vhard: 1, legend: .9 }; if (process.env.V) console.log('speed', JSON.stringify(s));
    for (const k in want) if (Math.abs(s[k] - want[k]) > .03) fails.push(`speed ${k}: ${s[k].toFixed(2)}, wanted ${want[k]}`);
    fails.push(...(await p.evaluate(DEFER)));
    fails.push(...(await p.evaluate(TYPES))); fails.push(...(await p.evaluate(SCHED)));
    await ctx.close(); }
  // (d) Lab FOES chips
  { const { ctx, p } = await openLab();
    await p.waitForFunction(() => window.__mnr && __mnr.G && __mnr.G.lab, null, { timeout: 20000 }).catch(() => fails.push('lab did not open')); await sleep(500);
    const chips = await p.evaluate(LABCHK); await sleep(200); const lc = await p.evaluate(() => [...document.querySelectorAll('.lc')].map(e => e.textContent));
    for (const k of ['SHIELDER', 'SPLITTER', 'BOMBER', 'SNIPER', 'KAMIKAZE', 'HEALER', 'CARRIER', 'MINELAYER']) if (!lc.includes(k)) fails.push(`Lab FOES has no ${k} chip`);
    await ctx.close(); }
  // (e) phone
  { const { ctx, p } = await open(390, 763, true); if (!(await p.evaluate(() => __mnr.rotMode))) fails.push('phone: rotMode off');
    const r = await p.evaluate(RUN, { n: 3, secs: 40, diff: 'normal' }); if (r.n < 2 || r.bs.some(b => b !== 5)) fails.push('phone: hover ' + JSON.stringify(r.bs) + ' n ' + r.n); if (r.minGap < 0 && r.minGap < 1e8) fails.push('phone: hovering enemies overlapped'); if (r.maxEb > 18) fails.push('phone: ' + r.maxEb + ' bullets (> 18)');
    fails.push(...(await p.evaluate(TYPES)).map(x => 'phone: ' + x)); await ctx.close(); }
  // (e) flag off
  { const { ctx, p } = await open(1280, 720, false, '&zoo=0'); const r = await p.evaluate(RUN, { n: 4, secs: 60, diff: 'hard' });
    if (r.n || r.kinds.length || r.seen.length) fails.push('zoo=0: hover / zoo kinds still on ' + JSON.stringify(r)); const s = await p.evaluate(SPEED); if (Math.abs(s.hard - .9) > .03 || Math.abs(s.legend - 1) > .03) fails.push('zoo=0: speeds changed ' + JSON.stringify(s)); await ctx.close(); }
  await br.close(); srv.kill();
  console.log(fails.length ? 'FAIL\n' + [...new Set(fails)].slice(0, 40).join('\n') : 'PASS zoo-test'); process.exit(fails.length ? 1 : 0);
})();
