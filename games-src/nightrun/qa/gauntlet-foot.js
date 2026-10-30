#!/usr/bin/env node
// GAUNTLET-FOOT (W261): bots play the whole on-foot street stage through REAL input only, from the title's ON FOOT button, on a phone
// (390x763, hasTouch: on-screen stick + buttons, multi-touch via CDP) and a PC (1440x860: keyboard + mouse), 8 random seeds per strategy.
// Strategies: idle, random, aggressor (walk to the nearest foe, shoot / knife it), dodger (aggressor + guard/parry, dash i-frames, jump over low shots).
// The bots READ game state (FOOT.S) to decide, but every action is a Playwright key / mouse / touch event; no game function is ever called.
// Time: the game's own loop runs at FOOT.ts (TS, default 3) x real time, so a stage takes ~1 min; frame time is sampled in the first 8 s at x1.
// Per run: page + console errors, unhandled rejections, stuck (20 s game time with nothing changing), enemies spawned / attacked / hurt Kai / died,
// pickups, camera keeps Kai in view, BEHIND caption vs spawns, progress bar, result screen, button sizes + overlaps (phone), frame p95, 5 shots.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/gauntlet-foot.js
//   env: GAME_DIR (a built dir)  SEEDS=8  PLAT=phone,pc  STRATS=idle,random,aggressor,dodger,tactician  TS=3  MAXREAL=150 (s per run)  OUT=<dir for shots + results.json>  CONTROLS=0 (skip the control check)
const fs = require('fs'), path = require('path');
const { boot, sleep, UA } = require('./lib.js');
const SEEDS = process.env.SEEDS === undefined ? 8 : +process.env.SEEDS, PLATS = (process.env.PLAT || 'phone,pc').split(','), STRATS = (process.env.STRATS || 'idle,random,aggressor,dodger').split(','), TS = +process.env.TS || 3, MAXREAL = (+process.env.MAXREAL || 150) * 1000;
const OUT = process.env.OUT || path.join(require('os').tmpdir(), 'gauntlet-foot'); fs.mkdirSync(OUT, { recursive: true });
const SIZE = { phone: [390, 763], land: [844, 390], pc: [1440, 860] };   // land (W277): a phone held sideways, touch
const KEYS = { l: 'KeyA', r: 'KeyD', fire: 'KeyJ', jump: 'KeyK', melee: 'KeyL', guard: 'KeyI', dash: 'ShiftLeft', bomb: 'KeyG' };
const BTN = { fire: '#fFire', jump: '#fJump', melee: '#fMelee', guard: '#fGuard', dash: '#fDash', bomb: '#fBomb' };
const results = [], lines = []; let nfail = 0;
const say = s => { lines.push(s); console.log(s); };
const chk = (name, pass, info) => { if (!pass) nfail++; say((pass ? 'PASS ' : 'FAIL ') + name + (pass || info == null ? '' : ' :: ' + String(info).slice(0, 240))); return pass; };
const pct = (a, q) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

// ---- real input: PC = keyboard + mouse, phone = CDP multi-touch (one touch id per finger: the stick and each held button)
function makeInput(p, plat) {
  const held = new Set(), touches = new Map(); let cdp = null, lay = null, layAt = 0;
  const rects = () => p.evaluate(() => { const o = {}, r = e => { const b = e.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2, w: b.width, h: b.height, vis: !e.hidden && e.style.display !== 'none' && b.width > 0 }; };
    for (const [k, s] of Object.entries({ fire: '#fFire', jump: '#fJump', melee: '#fMelee', guard: '#fGuard', dash: '#fDash', bomb: '#fBomb', stick: '#fStick', pause: '#fPause' })) { const e = document.querySelector(s); if (e) o[k] = r(e); } return o; });
  const sendT = async () => { const pts = [...touches.values()].map(t => ({ x: t.x, y: t.y, id: t.id, radiusX: 6, radiusY: 6, force: 1 })); await cdp.send('Input.dispatchTouchEvent', { type: pts.length ? 'touchMove' : 'touchEnd', touchPoints: pts }); };
  const touch = async (type, ids) => { const pts = [...touches.values()].map(t => ({ x: t.x, y: t.y, id: t.id, radiusX: 6, radiusY: 6, force: 1 })); await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts }); };
  let nid = 1; const ids = {};
  const api = {
    async init() { if (plat !== 'pc') cdp = await p.context().newCDPSession(p); },
    // want: { mx: -1..1, fire, jump, melee, guard, dash, bomb } -> events; a held state is kept until the want changes
    async apply(w) {
      if (plat === 'pc') {
        const want = new Set(); if (w.mx < -.3) want.add('l'); if (w.mx > .3) want.add('r'); for (const k of ['fire', 'jump', 'melee', 'guard', 'dash', 'bomb']) if (w[k]) want.add(k);
        for (const k of [...held]) if (!want.has(k)) { await p.keyboard.up(KEYS[k]); held.delete(k); }
        for (const k of want) if (!held.has(k)) { await p.keyboard.down(KEYS[k]); held.add(k); }
        return; }
      if (!lay || Date.now() - layAt > 1500) { lay = await rects(); layAt = Date.now(); }
      let ev = null;   // 'touchStart' when a finger is added, 'touchEnd' when one lifts, else 'touchMove'
      const want = {}; if (lay.stick && lay.stick.vis && Math.abs(w.mx) > .3) want.stick = { x: lay.stick.x + w.mx * lay.stick.w * .45, y: lay.stick.y };
      for (const k of Object.keys(BTN)) if (w[k] && lay[k] && lay[k].vis) want[k] = { x: lay[k].x, y: lay[k].y };
      for (const k of Object.keys(ids)) if (!want[k]) { touches.delete(k); delete ids[k]; ev = ev || 'touchEnd'; }
      let changed = ev === 'touchEnd';
      if (changed) { const pts = [...touches.values()]; await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: pts.length ? pts.map(t => ({ x: t.x, y: t.y, id: t.id })) : [] }); }
      for (const k of Object.keys(want)) {
        if (!ids[k]) { ids[k] = nid++; touches.set(k, { x: want[k].x, y: want[k].y, id: ids[k] }); await touch('touchStart'); }
        else if (Math.abs(touches.get(k).x - want[k].x) > 1) { touches.get(k).x = want[k].x; touches.get(k).y = want[k].y; await touch('touchMove'); } }
    },
    async release() { if (plat === 'pc') { for (const k of [...held]) await p.keyboard.up(KEYS[k]); held.clear(); } else { const any = touches.size; touches.clear(); for (const k in ids) delete ids[k]; if (any) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); } },
    async tap(sel) {   // a real tap / click on an element's centre (menus, pause): touch tap on the phone, mouse click on the PC
      const bb = await p.locator(sel).boundingBox(); if (!bb) return false; const x = bb.x + bb.width / 2, y = bb.y + bb.height / 2;
      if (plat !== 'pc') await p.touchscreen.tap(x, y); else await p.mouse.click(x, y); return true; },
  };
  return api;
}

// ---- state snapshot: plain data only
const SNAP = () => { const F = window.FOOT, S = F && F.S; if (!S) return null; const P = S.P, u = window.__u = window.__u || { n: 0 };
  const E = []; for (const e of S.E) { if (e.__u == null) e.__u = ++u.n; E.push({ u: e.__u, id: e.id, x: e.x, y: e.y, hp: e.hp, st: e.state, w: e.wind || 0, f: e.facing, d: !!e.dead, b: !!e.boss, hid: !!e.hid, bw: e.w || 0, hp2: e.hp, mx: e.max || 0 }); }
  const cam = F._in.L(); const cw = document.getElementById('game').width; const g = S.gd || null;
  return { on: F.on, t: S.time, end: S.end ? { cleared: S.end.cleared, quit: S.end.quit } : null, paused: S.paused, camX: S.camX, vw: (cam && cam.vw) || 960, lock: S.lock && S.lock.id, wl: S.lock ? S.waves.filter(w => w.lock === S.lock.id && !w.done).length : 0, bossOn: S.bossOn,
    P: { x: P.x, y: P.y, hp: P.hp, max: P.max, g: P.onGround, f: P.facing, inv: P.inv, dash: P.dash, dashIF: P.dashIF, mel: P.mel, bombs: P.bombs, maxX: P.maxX }, guard: g && { on: g.on, m: g.m },
    E, eb: S.eb.map(b => ({ x: b.x, y: b.y, vx: b.vx, vy: b.vy || 0, sb: !!b.sb, gr: !!b.ground })), pk: S.pk.map(k => ({ k: k.k, x: k.x, y: k.y })), shots: S.shots, kills: S.kills, hurts: S.hurts, score: S.score, moved: S.moved,
    behind: S.behind ? S.behind.until : null, bossX: S.st.boss && S.st.boss.x, len: S.st.len, stage: S.id + ' ' + S.st.n + ' s2=' + S.st.s2 + ' locks=' + (S.st.locks || []).map(l => l.id + '@' + l.x).join(',') + ' boss=' + JSON.stringify(S.st.boss) + ' waves=' + S.waves.length + ' lockDone=' + Object.keys(S.lockDone).join(''), boss: S.boss ? { hp: S.boss.hp, max: S.boss.max, dead: !!S.boss.dead } : null, auto: F.autoOn && F.autoOn(), fl: 540 - 70 }; };

// ---- the strategies: snapshot -> want
function strategy(name, rnd) {
  let cur = {}, until = 0, last = 0;
  const near = s => { let b = null, d = 1e9; for (const e of s.E) { if (e.d || e.hid || e.x < s.camX - 20 || e.x > s.camX + s.vw + 20) continue; const dd = Math.abs(e.x - s.P.x); if (dd < d) { d = dd; b = e; } } return b && { e: b, d }; };
  const walk = (s, n) => { if (n) { const dx = n.e.x - s.P.x; return Math.abs(dx) > (n.e.id === 'rusher' || n.e.b ? 100 : 230) ? Math.sign(dx) : (Math.abs(dx) < 140 ? -Math.sign(dx) * .2 : Math.sign(dx) * .01); } return 1; };
  if (name === 'idle') return () => ({ mx: 0 });
  if (name === 'masher') return s => { const n = near(s); return { mx: n ? Math.sign(n.e.x - s.P.x) || 1 : 1, fire: true, melee: Math.floor(s.t * 8) % 2 === 0, jump: Math.floor(s.t * 3) % 5 === 0 }; };   // W278: walks at the nearest foe mashing shoot + knife (+ a hop), never guards or dashes
  if (name === 'random') return s => { if (s.t > until) { until = s.t + .25 + rnd() * .5; cur = { mx: rnd() < .35 ? 0 : rnd() < .6 ? 1 : -1, fire: rnd() < .6, jump: rnd() < .15, melee: rnd() < .2, guard: rnd() < .12, dash: rnd() < .1, bomb: rnd() < .04 }; } if (s.t - last > .12) { last = s.t; return cur; } return Object.assign({}, cur, { jump: false, melee: false, guard: false, dash: false, bomb: false }); };
  const aggr = (s, dodge) => {
    const n = near(s), w = { mx: walk(s, n), fire: !!n && Math.abs(n.e.x - s.P.x) < 640, melee: false, jump: false, guard: false, dash: false, bomb: false };
    if (n && Math.abs(n.e.x - s.P.x) < 85) { w.mx = Math.sign(n.e.x - s.P.x) * .5; w.melee = Math.floor(s.t * 6) % 2 === 0; }
    if (n && s.E.filter(e => !e.d && Math.abs(e.x - s.P.x) < 300).length >= 3 && s.P.bombs > 0 && Math.floor(s.t * 2) % 9 === 0) w.bomb = true;
    if (!dodge) return w;
    for (const e of s.E) { if (e.d || e.hid) continue; const dx = e.x - s.P.x, front = Math.sign(dx) === s.P.f, atk = /^(lunge|dash|pounce|spray|bite|charge|sb_)/.test(e.st || '') || e.w > 0;
      if (atk && Math.abs(dx) < 170) { if (front && s.guard && s.guard.m > .05) { w.guard = true; w.fire = false; w.melee = false; w.mx = 0; } else if (s.P.inv <= 0 && (Math.abs(dx) < 110)) { w.dash = true; w.mx = -Math.sign(dx); } } }
    for (const b of s.eb) { const dx = b.x - s.P.x; if (Math.abs(dx) < 190 && dx * b.vx < 0 && Math.abs(b.y - (s.P.y - 30)) < 60 && s.P.g) { w.jump = true; break; } }
    return w; };
  if (name === 'tactician') {   // W274: state-aware, human-matchable: parry the telegraphed lunge, punish the OPEN foe, dash/jump the heavy's charge, kite gunners, grenade crowds + the boss, take hearts, stay off the right wall
    let bombAt = -9, dodgeAt = -9;
    return s => {
      const P = s.P, w = { mx: 0, fire: false, melee: false, jump: false, guard: false, dash: false, bomb: false };
      const live = s.E.filter(e => !e.d && !e.hid && e.x > s.camX - 30 && e.x < s.camX + s.vw + 30), dist = e => Math.abs(e.x - P.x), front = e => Math.sign(e.x - P.x) === P.f;
      const tele = e => e.st === 'crouch' || e.w > 0 || e.st === 'wind' || e.st === 'charge' || e.st === 'lunge';
      const heavy = e => e.id === 'heavy' || e.id === 'bigheavy' || e.b;
      const nearest = live.slice().sort((x, y) => dist(x) - dist(y))[0], right = s.camX + s.vw - P.x;
      const face = e => Math.sign(e.x - P.x) || 1;
      // 1. incoming heavy charge: a charge hits for 2 and breaks the guard, so leave the line (dash i-frames through it) or jump it
      const hv = live.find(e => heavy(e) && (e.st === 'wind' || e.st === 'charge') && dist(e) < 330 && front(e));
      if (hv) { w.mx = -face(hv); if (hv.st === 'charge' && dist(hv) < 230 && P.inv <= 0 && s.t - dodgeAt > .6) { w.dash = true; w.mx = face(hv); dodgeAt = s.t; } if (P.g && dist(hv) < 260) w.jump = true; return w; }
      // 1b. W278: the boss's barrel (tip 'BARREL · STEP BACK'): it is aimed at where Kai stands when thrown, so walk away during the wind-up and while it flies (never jump it)
      const bt = live.find(e => e.b && e.st === 'sb_throwW'), br = s.eb.find(b => b.sb);
      if (bt || br) { const from = bt ? bt.x : br.x - br.vx; w.mx = -(Math.sign(from - P.x) || 1); if (right < 60 && w.mx > 0 || P.x - s.camX < 60 && w.mx < 0) { if (P.inv <= 0 && br && s.t - dodgeAt > .6) { w.dash = true; w.mx = -w.mx; dodgeAt = s.t; } } return w; }
      // 2. a melee foe in its telegraph within reach, in front: GUARD (parry window is the last 0.15 s); a foe from behind: dash out
      const mel = live.find(e => !heavy(e) && e.id !== 'gunner' && tele(e) && dist(e) < 150);
      if (mel) { if (front(mel) && s.guard && s.guard.m > .05) { w.guard = true; w.mx = 0; return w; } if (P.inv <= 0 && s.t - dodgeAt > .6) { w.dash = true; w.mx = -face(mel); dodgeAt = s.t; return w; } w.mx = -face(mel); return w; }
      // 3. a bullet on the way: jump it (W278: the pound's ground wave at 300 px/s only inside 120 px, else Kai lands on it)
      for (const b of s.eb) { const dx = b.x - P.x; if (Math.abs(dx) < (b.gr ? 120 : 200) && dx * b.vx < 0 && Math.abs(b.y - (P.y - 30)) < 70 && P.g) { w.jump = true; break; } }
      // 4. hearts: hurt and a heal is near and nothing is about to hit
      const heal = P.hp < P.max ? s.pk.filter(k => k.k === 'heal' && k.x > s.camX && k.x < s.camX + s.vw).sort((x, y) => Math.abs(x.x - P.x) - Math.abs(y.x - P.x))[0] : null;
      if (heal && (!nearest || dist(nearest) > 130)) { w.mx = Math.abs(heal.x - P.x) > 12 ? Math.sign(heal.x - P.x) : 0; w.fire = !!nearest && front(nearest); return w; }
      if (!nearest) { w.mx = right < 130 ? -.6 : P.x < s.camX + s.vw * .45 ? 1 : 0; return w; }   // empty street: advance to the middle of the screen, never sit on the wall
      const n = nearest, d = dist(n);
      // 5. grenade: three or more within 300 px, or the heavy / boss up close
      if (P.bombs > 0 && s.t - bombAt > 4 && (live.filter(e => dist(e) < 300).length >= 3 || live.some(e => heavy(e) && dist(e) < 280))) { w.bomb = true; bombAt = s.t; }
      // 6. punish: an OPEN / stunned / resting foe in knife range gets the knife, a far one gets bullets; the heavy is shot from range and only knifed when stunned
      const open = n.st === 'rest' || n.st === 'back' || n.st === 'stun' || n.st === 'open' && n.id !== 'gunner';
      if (heavy(n)) { w.fire = front(n); if (n.st === 'stun' && d < 90) { w.melee = Math.floor(s.t * 6) % 2 === 0; w.mx = face(n) * .3; } else w.mx = d < 260 ? -face(n) : d > 420 ? face(n) : 0; }
      else if (n.id === 'gunner') { w.fire = front(n); w.mx = d > 330 ? face(n) : d < 200 ? face(n) : 0; if (d < 90) w.melee = true; }   // close the gap on a gunner (it backs off if rushed) or hold range
      else { w.fire = front(n) && d < 640; if (open && d < 95) { w.melee = Math.floor(s.t * 6) % 2 === 0; w.mx = face(n) * .3; } else w.mx = d < 150 ? -face(n) : d > 260 ? face(n) * .5 : 0; }
      if (right < 90 && w.mx > 0) w.mx = 0;
      if (Math.sign(w.mx) && Math.sign(w.mx) !== P.f && !w.fire) w.fire = false;
      return w; };
  }
  return name === 'aggressor' ? s => aggr(s, false) : s => aggr(s, true);
}

// ---- layout audit (phone): every control >= 44 px, inside the screen, no two overlap, labels fit
const AUDIT = () => { const out = { small: [], off: [], over: [], clip: [] }, W = innerWidth, H = innerHeight, els = [...document.querySelectorAll('#footL .fb,#footL .fpad,#fPause')].filter(e => !e.hidden && getComputedStyle(e).display !== 'none' && e.getBoundingClientRect().width > 0), rs = els.map(e => [e.id, e.getBoundingClientRect(), e]);
  for (const [id, r, e] of rs) { if (r.width < 44 || r.height < 44) out.small.push(id + ' ' + (r.width | 0) + 'x' + (r.height | 0)); if (r.left < -1 || r.top < -1 || r.right > W + 1 || r.bottom > H + 1) out.off.push(id);
    if (e.classList.contains('fb') && (e.scrollWidth > e.clientWidth + 1 || e.scrollHeight > e.clientHeight + 1)) out.clip.push(id + ' label ' + e.scrollWidth + 'x' + e.scrollHeight + ' in ' + e.clientWidth + 'x' + e.clientHeight); }
  for (let i = 0; i < rs.length; i++) for (let j = i + 1; j < rs.length; j++) { const a = rs[i][1], b = rs[j][1], ox = Math.min(a.right, b.right) - Math.max(a.left, b.left), oy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); if (ox > 1 && oy > 1) out.over.push(rs[i][0] + '/' + rs[j][0] + ' ' + (ox | 0) + 'x' + (oy | 0)); }
  const f = window.FOOT.hudInfo && window.FOOT.hudInfo(); out.hud = f && f.hud && f.hud.hud ? f.hud.hud.length : 0;
  // HUD boxes (canvas-drawn panels, in canvas px) against the controls: converted by the layout's own origin / scale
  if (f && f.hud && f.hud.hud) for (const h of f.hud.hud) for (const [id, r] of rs) { const cv = document.getElementById('footC').getBoundingClientRect(), k = cv.width / (f.vw || 1) * 1; const hx = cv.left + (h.x - 0) * (f.sc || 1) + (f.ox || 0) * 0, hy = cv.top + h.y * (f.sc || 1); void k; void hx; void hy; }
  return out; };

async function openRun(b, plat, seed) {
  const [W, H] = SIZE[plat], touch = plat !== 'pc';
  const ctx = await b.br.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: touch, isMobile: touch, userAgent: touch ? UA : undefined });
  const p = await ctx.newPage(); p.errs = []; p.cons = []; p.bad = [];
  p.on('pageerror', e => p.errs.push(String(e.message).slice(0, 160))); p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|fonts\.|Ignored attempt to cancel a touchstart/.test(m.text())) p.cons.push(m.text().slice(0, 160)); });
  p.on('response', r => { if (r.status() >= 400) p.bad.push(r.status() + ' ' + r.url().replace(/^https?:\/\/[^/]+/, '')); });
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.addInitScript(sd => {   // seeded Math.random: the same seed replays the same stage; frame-time sampler; unhandled rejections
    let a = sd | 0; Math.random = () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    window.__rej = []; addEventListener('unhandledrejection', e => window.__rej.push(String(e.reason && e.reason.message || e.reason).slice(0, 160)));
    window.__ft = []; window.__ftOn = false; let l = 0; const f = t => { if (l && window.__ftOn) window.__ft.push(t - l); l = t; requestAnimationFrame(f); }; requestAnimationFrame(f);
    try { localStorage.setItem('mnr_tipdone', 'true'); localStorage.setItem('mnr_fscard', '99'); } catch (e) { }
  }, 1000 + seed * 7919);
  await p.goto(b.base + '?nomusic=1' + (process.env.Q || ''), { waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => window.__mnr && window.FOOT, null, { timeout: 15000 });
  await p.waitForFunction(() => document.documentElement.classList.contains('rdy'), null, { timeout: 15000 }).catch(() => { });
  await sleep(500); return p;
}

// title -> ON FOOT button (a real tap / click); the story card (if it shows) is dismissed by tapping it like a player
async function startFoot(p, inp) {
  if (!await inp.tap('#focFoot')) return 'no ON FOOT button';
  for (let i = 0; i < 12 && !(await p.evaluate(() => !!(window.FOOT.S && window.FOOT.on))); i++) { await sleep(300); const c = await p.evaluate(() => { const e = document.getElementById('taleTc') || document.getElementById('taleCard'); return e && e.offsetParent ? e.id : null; }); if (c) await inp.tap('#' + c); }
  for (let i = 0; i < 40 && await p.evaluate(() => { const l = document.getElementById('footL'); return !l || l.hidden || (window.FOOT.S && window.FOOT.S.time < 0.05 && !window.FOOT.S.moved && false); }); i++) await sleep(150);   // LOADING cover
  return (await p.evaluate(() => !!(window.FOOT.S && window.FOOT.on))) ? 'on' : 'not started';
}

async function run(b, plat, strat, seed) {
  const R = { plat, strat, seed, fails: [], notes: [] }, t00 = Date.now(), tag = `${plat}-${strat}-${seed}`, rnd = mulberry(seed * 977 + strat.length * 31);
  const fail = (m) => R.fails.push(m), shot = async (n) => { try { await p.screenshot({ path: path.join(OUT, `${tag}-${n}.jpg`), type: 'jpeg', quality: 55 }); R.shots = (R.shots || []).concat(n); } catch (e) { } };
  const p = await openRun(b, plat, seed), inp = makeInput(p, plat); await inp.init();
  try {
    const sres = await startFoot(p, inp); if (sres !== 'on') { fail('start: ' + sres); return R; }
    await sleep(400); await shot('start');
    if (process.env.BADD || process.env.BOSSADDS) await p.evaluate(([c, o]) => { if (o === '0') window.RET.bossadds = false; if (c) { const [cap, gap] = c.split(',').map(Number); window.FOOT.S3.T.bAdd = { cap, gap }; } }, [process.env.BADD || '', process.env.BOSSADDS || '']);   // W278 sweep: BADD=cap,gap  BOSSADDS=0 = old
    if (process.env.JUMP) { await sleep(2500); await p.evaluate(j => { const S = window.FOOT.S; S.time = +j; S.P.x = 7350; S.camX = 7250; }, process.env.JUMP); R.notes.push('JUMP: stage clock set to ' + process.env.JUMP + ' (geometry probe only, not a clear-rate run)'); }
    if (plat !== 'pc') { R.audit = await p.evaluate(AUDIT); if (R.audit.small.length) fail('phone control < 44 px: ' + R.audit.small.join(', ')); if (R.audit.over.length) fail('phone controls overlap: ' + R.audit.over.join(', ')); if (R.audit.off.length) fail('phone control off screen: ' + R.audit.off.join(', ')); if (R.audit.clip.length) fail('phone label clipped: ' + R.audit.clip.join(', ')); }
    await p.evaluate(() => { window.__ftOn = true; }); const decide = strategy(strat, rnd);
    const seen = new Set(), atkd = new Set(), died = new Set(), maxHp = {}; let prev = null, sigT = 0, sig = '', stuck = 0, offT = 0, shotsDone = {}, minMargin = 1e9, camBack = 0, spawnL = [], behindSeen = 0, behindUntil = -1, unwarned = 0, pkMax = 0, lastS = null, fastOn = false, ticks = 0, maxFoes = 0, progBad = 0;
    const t0 = Date.now(); let s = await p.evaluate(SNAP);
    while (s && !s.end && Date.now() - t0 < MAXREAL) {
      ticks++; if (!fastOn && Date.now() - t0 > 8000) { fastOn = true; R.frameP95 = await p.evaluate(() => { const a = window.__ft.slice().sort((x, y) => x - y); window.__ftOn = false; return a.length ? { n: a.length, p50: a[a.length >> 1], p95: a[Math.floor(a.length * .95)] } : null; }); await p.evaluate(ts => { window.FOOT.ts = ts; }, TS); }
      if (s.paused) { fail('paused unexpectedly'); break; }
      if (process.env.GOD && s.bossOn) await p.evaluate(() => { const S = window.FOOT.S; if (S.P.hp > 0) S.P.hp = S.P.max; });   // geometry probe: Kai survives so every attack is measured
      await inp.apply(decide(s));
      await sleep(22); s = await p.evaluate(SNAP); if (!s) { fail('FOOT.S vanished'); break; }
      // ---- per-tick checks
      for (const e of s.E) { if (e.d) { if (seen.has(e.u)) died.add(e.u); continue; } if (!seen.has(e.u)) { seen.add(e.u); if (e.x < s.camX + 5 && e.x > s.camX - 200) spawnL.push({ t: s.t, x: e.x - s.camX }); } if (/^(lunge|dash|pounce|spray|bite|charge|sb_)/.test(e.st || '') || e.w > 0) atkd.add(e.u); }
      if (prev) for (const e of prev.E) if (!e.d && !s.E.some(o => o.u === e.u)) died.add(e.u);   // removed from the list = gone
      maxFoes = Math.max(maxFoes, s.E.filter(e => !e.d).length); pkMax = Math.max(pkMax, s.pk.length);
      const sx = s.P.x - s.camX; minMargin = Math.min(minMargin, sx, s.vw - sx); if (s.P.hp > 0 && (sx < -4 || sx > s.vw + 4)) offT += s.t - (prev ? prev.t : s.t);
      if (prev && s.camX < prev.camX - 1) camBack++;
      if (s.behind != null && s.behind > s.t) { behindSeen++; behindUntil = s.behind; if (s.behind - s.t > 1.05) fail('BEHIND window longer than 1 s: ' + (s.behind - s.t).toFixed(2)); }
      // progress bar: the value the stage HUD draws is maxX / boss.x (footstage hud hook); it must stay in 0..1 and never go down
      const pr = s.P.maxX / s.bossX; if (!(pr >= 0)) progBad++;   // the bar clamps at 1 (Kai may walk past the boss x inside the arena)
       if (prev && s.P.maxX < prev.P.maxX - .5) progBad++;
      const g = [Math.round(s.P.x), Math.round(s.camX), s.kills, s.score, s.P.hp, s.E.length, s.E.reduce((a, e) => a + Math.round(e.x + e.y), 0), s.eb.length, s.pk.length].join();
      if (g !== sig) { sig = g; sigT = s.t; } else if (s.t - sigT > 20 && s.P.hp > 0) { stuck++; fail('stuck 20 s game time, nothing changed at t=' + s.t.toFixed(1) + ' x=' + Math.round(s.P.x) + ' lock=' + s.lock); break; }
      if (!shotsDone.mid && s.t > 8 && s.E.filter(e => !e.d && Math.abs(e.x - s.P.x) < 380).length >= 2) { shotsDone.mid = 1; await shot('mid'); }
      if (process.env.BOSSVIS) { const B = s.E.find(e => e.b && !e.d); if (B && s.bossOn) { const fr = (a, b2) => Math.max(0, Math.min(b2, s.camX + s.vw) - Math.max(a, s.camX)) / Math.max(1, b2 - a), body = fr(B.x - 55, B.x + 55), tele = /^(wind|sb_.*W)$/.test(B.st), px = Math.min(B.x, s.P.x), px2 = Math.max(B.x, s.P.x), path = fr(px - 1, px2 + 1);
          const V = R.bv = R.bv || { n: 0, body: [], tele: [], path: [], t0: s.t, camX: s.camX, geo: [] }; V.n++; V.body.push(body); if (tele) { V.tele.push(body); if (B.st !== V.ls) V.path.push(path); }
          
          if (B.st === 'wind' && V.ls !== 'wind') { V.rw = V.rw || []; V.rw.push({ t: s.t, d: Math.abs(B.x - s.P.x), hp: s.P.hp }); } if (V.rw && V.rw.length && s.P.hp < V.rw[V.rw.length - 1].hp && V.rw[V.rw.length - 1].hit == null && s.t - V.rw[V.rw.length - 1].t < 2.5 && /^(wind|charge)$/.test(B.st)) V.rw[V.rw.length - 1].hit = +(s.t - V.rw[V.rw.length - 1].t).toFixed(2);   // W277 reaction window: Kai-boss distance at each charge wind-up start, wind-up start -> hurt time
          V.ls = B.st; if (!V.geo.length || s.t - V.geo[V.geo.length - 1][0] > 4) V.geo.push([+s.t.toFixed(1), Math.round(s.camX), Math.round(s.vw), Math.round(s.P.x), Math.round(B.x), B.st, Math.round(body * 100), Math.round(B.hp2)]); V.hpEnd = B.hp2; V.mx = B.mx; } }
      if (!shotsDone.boss && s.boss && !s.boss.dead && s.bossOn) { shotsDone.boss = 1; await sleep(250); await shot('boss'); }
      if (!shotsDone.death && s.P.hp <= 0) { shotsDone.death = 1; await shot('death'); }
      if (process.env.TRACE && s.t - (R.trT || -9) >= 1) { R.trT = s.t; (R.trace = R.trace || []).push([(R.stage = R.stage || s.stage) && '',+s.t.toFixed(1), Math.round(s.P.x), Math.round(s.camX), s.lock || '-', s.P.hp, s.E.filter(e => !e.d).length, s.E.filter(e => !e.d).map(e => e.id + ':' + Math.round(e.x - s.P.x) + ':' + (e.st || '')).slice(0, 6).join(' '), s.kills, 'wavesLeft=' + s.wl].join(' ')); }
      prev = s; lastS = s;
    }
    await inp.release(); await sleep(150); s = await p.evaluate(SNAP) || lastS; R.end = s && s.end; R.hlog = await p.evaluate(() => { const S = window.FOOT.S; return S && S.hlog ? S.hlog.slice() : []; }).catch(() => null); R.t = s && s.t; R.kills = s && s.kills; R.hurts = s && s.hurts; R.hpEnd = s && s.P.hp; R.maxX = s && s.P.maxX;
    if (!R.end) { if (Date.now() - t0 >= MAXREAL) R.notes.push('timeout ' + (MAXREAL / 1000) + ' s real, game t=' + (s && s.t.toFixed(0)) + ' x=' + (s && Math.round(s.P.x))); }
    R.bossHp = s && s.boss ? Math.max(0, Math.round(s.boss.hp)) : null; R.bossT = await p.evaluate(() => { const l = window.FOOT.S3 && window.FOOT.S3.log; return l && l.boss || null; }).catch(() => null);
    if (R.hlog) { const c = {}; for (const h of R.hlog) c[h] = (c[h] || 0) + 1; R.hurtBy = Object.entries(c).map(([k, v]) => k + ':' + v).join(','); }
    R.spawned = seen.size; R.attacked = atkd.size; R.died = died.size; R.maxFoes = maxFoes; R.pkMax = pkMax; R.minMargin = Math.round(minMargin); R.camBack = camBack; R.behindTicks = behindSeen; R.spawnLeft = spawnL.length; R.progBad = progBad; R.stuck = stuck;
    if (offT > 1) fail('Kai off screen ' + offT.toFixed(1) + ' s (camera not following)'); if (camBack > 0 && !s.lock) R.notes.push('camera moved back ' + camBack + 'x');
    if (spawnL.length > 0 && behindSeen === 0) fail('foe spawned from the left (' + spawnL.length + 'x) but BEHIND caption never active');
    if (progBad) fail('progress value negative or went down (' + progBad + 'x)');
    if (R.end) { await sleep(600); await shot(R.end.cleared ? 'result-clear' : 'result-down'); R.res = await p.evaluate(() => { const m = document.getElementById('fMenu'); if (!m || m.hidden) return null; const bs = [...m.querySelectorAll('button')].filter(b => b.getBoundingClientRect().width > 0).map(b => { const r = b.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { id: b.id, w: r.width | 0, h: r.height | 0, ok: !!t && (t === b || b.contains(t)) && r.left >= 0 && r.right <= innerWidth && r.bottom <= innerHeight }; }); return { h2: (m.querySelector('h2') || {}).textContent, rows: [...m.querySelectorAll('.fr')].map(r => r.textContent), bs }; });
      if (!R.res) fail('run ended (' + JSON.stringify(R.end) + ') but no result screen'); else { if (R.res.bs.some(x => x.h < 44 || !x.ok)) fail('result buttons not usable: ' + JSON.stringify(R.res.bs.filter(x => x.h < 44 || !x.ok))); if ((R.end.cleared ? 'STREET CLEAR' : 'YOU WENT DOWN') !== R.res.h2) fail('result title ' + R.res.h2 + ' != state ' + JSON.stringify(R.end)); } }
    else if (s && s.P.hp <= 0) fail('Kai hp 0 but no end state');
    if (strat !== 'idle' && R.spawned === 0) fail('no enemy ever spawned');
    if (strat === 'dodger' && R.hurts === 0 && R.t > 20 && R.attacked === 0) R.notes.push('no foe attacked');
    R.errs = p.errs.concat(await p.evaluate(() => window.__rej.map(r => 'rejection: ' + r))).concat(p.cons.map(c => 'console: ' + c)); for (const e of R.errs) fail('error: ' + e); if (p.bad.length) R.notes.push('http: ' + p.bad.slice(0, 3).join(' '));
  } catch (e) { fail('bot crashed: ' + String(e.stack || e).slice(0, 300)); }
  finally { await inp.release().catch(() => { }); await p.context().close().catch(() => { }); }
  R.real = Math.round((Date.now() - t00) / 1000); return R;
}

// ---- control check: every control, one at a time, then the pause menu (resume, retry, quit). Real time (x1), phone with auto-fire OFF so FIRE exists.
async function controls(b, plat) {
  const T = `${plat} controls: `, p = await openRun(b, plat, 5), inp = makeInput(p, plat); await inp.init();
  const st = () => p.evaluate(SNAP), hold = async (w, ms) => { await inp.apply(w); await sleep(ms); await inp.apply({ mx: 0 }); await sleep(80); };
  try {
    const r = await startFoot(p, inp); if (!chk(T + 'ON FOOT starts the run', r === 'on', r)) return;
    await p.evaluate(() => { const S = window.FOOT.S; S.P.hp = S.P.max; }); void 0;
    if (plat !== 'pc') { await inp.tap('#fPause'); await sleep(200); const a = await p.evaluate(() => { const b = document.getElementById('fAuto'); return b && b.textContent; }); if (/ON/.test(a || '')) { await inp.tap('#fAuto'); await sleep(200); } await inp.tap('#fResume'); await sleep(1900); }
    await sleep(2200);   // let the opening grace and LOADING pass
    let a = await st(); await hold({ mx: 1 }, 700); let c = await st(); chk(T + 'move right', c.P.x > a.P.x + 60, [a.P.x, c.P.x]);
    a = c; await hold({ mx: -1 }, 600); c = await st(); chk(T + 'move left', c.P.x < a.P.x - 40, [a.P.x, c.P.x]);
    a = await st(); await inp.apply({ mx: 0, fire: true }); await sleep(700); await inp.apply({ mx: 0 }); c = await st(); chk(T + 'shoot (FIRE)', c.shots > a.shots + 1, [a.shots, c.shots]);
    await sleep(300); await inp.apply({ mx: 0, jump: true }); await sleep(180); c = await st(); chk(T + 'jump leaves the ground', !c.P.g, JSON.stringify({ g: c.P.g, y: c.P.y })); await inp.apply({ mx: 0 }); await sleep(900);
    a = await st(); await inp.apply({ mx: 0, melee: true }); await sleep(120); c = await st(); chk(T + 'melee (KNIFE) swings', c.P.mel > 0 || c.P.mel !== a.P.mel, [a.P.mel, c.P.mel]); await inp.apply({ mx: 0 }); await sleep(600);
    await inp.apply({ mx: 0, guard: true }); await sleep(150); c = await st(); chk(T + 'guard goes up', !!(c.guard && c.guard.on), JSON.stringify(c.guard)); await inp.apply({ mx: 0 }); await sleep(700);
    a = await st(); await inp.apply({ mx: 1, dash: true }); await sleep(120); c = await st(); chk(T + 'dash (i-frames)', c.P.dash > 0 && c.P.dashIF > 0, JSON.stringify({ d: c.P.dash, i: c.P.dashIF })); await inp.apply({ mx: 0 }); await sleep(900);
    a = await st(); await inp.apply({ mx: 0, bomb: true }); await sleep(150); c = await st(); chk(T + 'grenade (BOMB) used', c.P.bombs === a.P.bombs - 1, [a.P.bombs, c.P.bombs]); await inp.apply({ mx: 0 }); await sleep(300);
    // pause -> resume -> pause -> retry -> pause -> quit to title
    const pause = async () => { if (plat !== 'pc') await inp.tap('#fPause'); else await p.keyboard.press('Escape'); await sleep(250); };
    await pause(); c = await st(); chk(T + 'pause opens and freezes', c.paused, JSON.stringify({ p: c.paused })); const t1 = c.t; await sleep(500); c = await st(); chk(T + 'game frozen while paused', c.t === t1, [t1, c.t]);
    const menu = await p.evaluate(() => [...document.querySelectorAll('#fMenu button')].map(b => { const r = b.getBoundingClientRect(); return b.id + ':' + (r.height | 0); })); chk(T + 'pause menu buttons >= 44 px', menu.length >= 3 && menu.every(x => +x.split(':')[1] >= 44), menu.join());
    await inp.tap('#fResume'); await sleep(300); c = await st(); chk(T + 'resume unpauses', !c.paused, JSON.stringify({ p: c.paused })); await sleep(500); c = await st(); chk(T + 'time runs again after resume', c.t > t1, [t1, c.t]);
    await pause(); const k0 = (await st()).t; await inp.tap('#fRetry'); await sleep(500); c = await st(); chk(T + 'pause RETRY restarts the stage', c && c.t < k0 && !c.paused && !c.end, JSON.stringify({ t: c && c.t, k0 }));
    await pause(); await inp.tap('#fQuit'); await sleep(500); const tt = await p.evaluate(() => ({ foot: window.FOOT.on, title: !document.getElementById('title').hidden, footL: !document.getElementById('footL').hidden })); chk(T + 'QUIT returns to the title', !tt.foot && tt.title && !tt.footL, JSON.stringify(tt));
    const r2 = await startFoot(p, inp); chk(T + 'ON FOOT works again after quit', r2 === 'on', r2);
    chk(T + 'no page errors', p.errs.length === 0 && p.cons.length === 0, p.errs.concat(p.cons).join('|'));
  } catch (e) { chk(T + 'control check crashed', false, e.stack); } finally { await inp.release().catch(() => { }); await p.context().close().catch(() => { }); }
}

// ---- phone layout variants: auto-fire on / off, landscape: sizes + overlaps (the HUD GUARD label overlap report)
async function layouts(b) {
  for (const [W, H, auto] of [[390, 763, 1], [390, 763, 0], [375, 553, 1], [844, 390, 1]]) {
    const T = `phone ${W}x${H} auto-fire ${auto ? 'on' : 'off'}: `, ctx = await b.br.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, hasTouch: true, isMobile: true, userAgent: UA }), p = await ctx.newPage(); p.errs = [];
    p.on('pageerror', e => p.errs.push(String(e.message).slice(0, 160))); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.addInitScript(() => { try { localStorage.setItem('mnr_tipdone', 'true'); localStorage.setItem('mnr_fscard', '99'); } catch (e) { } });
    await p.goto(b.base + '?nomusic=1' + (process.env.Q || ''), { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.FOOT, null, { timeout: 15000 }); await sleep(900);
    try { const inp = makeInput(p, 'phone'); await inp.init(); const r = await startFoot(p, inp); if (r !== 'on') { chk(T + 'start', false, r); continue; }
      if (!auto) { await p.evaluate(() => window.FOOT.setAuto(false)); }
      await sleep(1800); const a = await p.evaluate(AUDIT); chk(T + 'all controls >= 44 px', !a.small.length, a.small.join()); chk(T + 'no control overlaps another (GUARD / KNIFE / BOMB / DASH)', !a.over.length, a.over.join()); chk(T + 'controls on screen', !a.off.length, a.off.join()); chk(T + 'labels fit inside their buttons', !a.clip.length, a.clip.join());
      await p.screenshot({ path: path.join(OUT, `layout-${W}x${H}-auto${auto}.jpg`), type: 'jpeg', quality: 60 }); chk(T + 'no page errors', !p.errs.length, p.errs.join('|')); } catch (e) { chk(T + 'layout check crashed', false, e.stack); } finally { await ctx.close().catch(() => { }); } }
}

(async () => {
  const b = await boot(); const t0 = Date.now();
  try {
    if (process.env.CONTROLS !== '0') { for (const pl of PLATS) await controls(b, pl); if (PLATS.includes('phone')) await layouts(b); }
    for (const pl of PLATS) for (const st of STRATS) for (let sd = 0; sd < SEEDS; sd++) {
      if (process.env.ONLY && process.env.ONLY !== `${pl}:${st}:${sd}`) continue;
      const R = await run(b, pl, st, sd); results.push(R);
      say(`${R.fails.length ? 'FAIL' : 'PASS'} ${pl} ${st} seed ${sd}: ${R.end ? (R.end.cleared ? 'CLEARED' : 'died') : 'no end'} t=${R.t != null ? R.t.toFixed(0) : '?'}s kills=${R.kills} hurts=${R.hurts} bossHp=${R.bossHp != null ? R.bossHp : '-'} bossT=${R.bossT != null ? R.bossT : '-'} hurtBy=${R.hurtBy || '-'} foes ${R.spawned}/atk ${R.attacked}/died ${R.died} pk<=${R.pkMax} margin=${R.minMargin} p95=${R.frameP95 ? R.frameP95.p95.toFixed(1) : '?'}ms real=${R.real}s${R.fails.length ? ' :: ' + R.fails.join(' | ').slice(0, 300) : ''}${R.notes.length ? ' [' + R.notes.join('; ') + ']' : ''}`);
      if (R.fails.length) nfail++; }
  } finally { await b.close(); }
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 1));
  const sum = {}; for (const R of results) { const k = R.plat + ' ' + R.strat; const o = sum[k] = sum[k] || { runs: 0, cleared: 0, died: 0, fails: 0, p95: [], tmin: 1e9, margin: 1e9, kills: [] }; o.runs++; if (R.end && R.end.cleared) o.cleared++; else if (R.end) o.died++; if (R.fails.length) o.fails++; if (R.frameP95) o.p95.push(R.frameP95.p95); if (R.t != null) o.tmin = Math.min(o.tmin, R.t); o.margin = Math.min(o.margin, R.minMargin == null ? 1e9 : R.minMargin); o.kills.push(R.kills || 0); }
  say('---- SUMMARY (minimums over runs; frame p95 = worst run) ' + Math.round((Date.now() - t0) / 1000) + ' s');
  for (const k in sum) { const o = sum[k]; say(`${k}: ${o.runs} runs, cleared ${o.cleared}, died ${o.died}, runs with a FAIL ${o.fails}, min game time ${o.tmin.toFixed(0)}s, min kills ${Math.min(...o.kills)}, min camera margin ${o.margin}px, frame p95 worst ${o.p95.length ? Math.max(...o.p95).toFixed(1) : '?'}ms`); }
  fs.writeFileSync(path.join(OUT, 'summary.txt'), lines.join('\n'));
  console.log(`${nfail ? 'FAIL' : 'PASS'} gauntlet-foot: ${nfail} failed (shots + results.json in ${OUT})`); process.exit(nfail ? 1 : 0);
})();
