#!/usr/bin/env node
// Headless test of parts/footen.js (on-foot enemies + Warden boss) in a fake env: node games-src/nightrun/footen-test.js   (V=1 verbose)
// Checks per enemy: schema, telegraph timings, ranges, shield/turret/mech hit rules, token cap, fair spawns, death timing, and the boss phases + damage cap.
global.window = global;
require('./parts/footen.js');
const FE = window.FOOT_ENEMIES, WA = window.FOOT_BOSS.warden;
const POSES = ['idle', 'run-a', 'run-b', 'jump', 'fall', 'shoot', 'melee', 'hit', 'die', 'crouch', 'crouch-shoot', 'attack2', 'enrage'];
const PICKS = ['weapon-hmg', 'weapon-shotgun', 'weapon-flame', 'weapon-rocket', 'weapon-arc', 'shield', 'speed', 'damage', 'magnet', 'heal', 'bomb', 'slow'];
let fails = 0, passes = 0;
const ok = (c, m) => { if (c) { passes++; if (process.env.V) console.log('  ok  ', m); } else { fails++; console.log('FAIL  ', m); } };
const near = (a, b, tol) => Math.abs(a - b) <= tol;
let seed = 12345; const rnd = (a, b) => { seed = (seed * 1664525 + 1013904223) >>> 0; return a + (seed / 4294967296) * (b - a); };

function mkEnv(o) {
  o = o || {};
  const env = { log: { shoot: [], melee: [], fx: [], spawn: [] }, rnd };
  env.P = { x: o.px != null ? o.px : 400, y: 500, w: 36, h: 84, vx: 0, vy: 0, onGround: true, facing: 1, crouch: false };
  env.G = { time: 0, floorY: 500, camX: 0, viewW: 900, eb: [], beat: 0, obs: o.obs };
  if (o.nobeat) delete env.G.beat;
  env.shoot = (e, ang, spd, dmg, op) => { env.log.shoot.push({ e, ang, spd, dmg, op: op || {}, t: env.G.time }); env.G.eb.push({}); };
  env.melee = (e, r, dmg, op) => { const P = env.P, hit = r.x < P.x + P.w / 2 && r.x + r.w > P.x - P.w / 2 && r.y < P.y && r.y + r.h > P.y - P.h; env.log.melee.push({ e, r, dmg, hit, t: env.G.time, op }); return hit; };
  env.fx = (n, x, y, op) => env.log.fx.push({ n, x, y, op, t: env.G.time });
  env.spawn = (type, x, y, op) => { const m = { type, x, y, hp: 2 }; env.log.spawn.push({ type, x, y, t: env.G.time, m }); return m; };
  env.BL = 0.5;
  return env;
}
const mk = (def, x, y) => ({ x, y: y == null ? 500 : y, vx: 0, vy: 0, hp: def.hp, t: 0, state: 'idle', facing: 1, flash: 0 });
function step(env, es, dt) { env.G.time += dt; env.G.beat = env.G.time / env.BL; for (const e of es) e.def.ai(e, dt, env); for (const e of es) if (e.def.pose) { const p = e.def.pose(e); if (!POSES.includes(p)) { ok(false, e.type + ' bad pose ' + p + ' state ' + e.state); e.def.pose = () => 'idle'; } } }
function spawn(id, x, y) { const d = FE[id] || WA, e = mk(d, x, y); e.def = d; e.type = id; return e; }
// run until pred() or maxT; returns time
function run(env, es, maxT, pred, dt) { dt = dt || 1 / 60; let t = 0; while (t < maxT) { step(env, es, dt); t += dt; if (pred && pred()) break; } return t; }
const hitEngine = (e, env, dmg, hit) => { e.hp -= dmg; e.def.onHit && e.def.onHit(e, dmg, env, hit); };

// ---- schema ----
for (const id of Object.keys(FE)) {
  const d = FE[id];
  ok(['w', 'h', 'hp', 'score', 'speed'].every(k => typeof d[k] === 'number' && d[k] >= 0), id + ' numeric fields');
  ok(Array.isArray(d.drops) && d.drops.length && d.drops.every(x => PICKS.includes(x)), id + ' drops valid pickup ids');
  ok(typeof d.pose === 'function' && typeof d.ai === 'function' && typeof d.onHit === 'function' && typeof d.onDeath === 'function', id + ' has pose/ai/onHit/onDeath');
}
ok(Object.keys(FE).length === 9, '9 enemy types');
ok(FE.grunt.hp === 3 && FE.gunman.hp === 4 && FE.shield.hp === 8 && FE.bruiser.hp === 18 && FE.knife.hp === 2 && FE.sniper.hp === 3 && FE.drone.hp === 2 && FE.turret.hp === 6 && FE.mech.hp === 30 && WA.hp === 400, 'hp numbers match the spec');
ok(FE.bruiser.drops.every(x => x.startsWith('weapon-')) && FE.bruiser.dropP === 1, 'bruiser drops a weapon');
ok(WA.phases.length === 2 && WA.phases[0].hp === 0.66 && WA.phases[1].hp === 0.33, 'boss phases at 66% / 33%');

// ---- no NaN, valid poses, 40 s soak for every enemy at several distances; never spawn inside the player ----
for (const id of Object.keys(FE).concat(['warden'])) {
  for (const px of [100, 300, 480, 700]) {
    const env = mkEnv({ px: 400 }), e = spawn(id, px === 400 ? 400 : px, id === 'drone' ? 300 : id === 'sniper' ? 380 : 500);
    const y0 = e.y; let bad = false;
    for (let i = 0; i < 40 * 60; i++) { step(env, [e], 1 / 60); if (![e.x, e.y, e.vx, e.vy, e.hp].every(Number.isFinite)) { bad = true; break; } if (i === 1 && !FE[id] === false && id !== 'sniper' && id !== 'turret' && Math.abs(e.x - env.P.x) < (env.P.w + e.w) / 2 + 40) { ok(false, id + ' spawned inside the hero at ' + px); } }
    ok(!bad, id + ' soak finite from x=' + px);
    if (id === 'sniper' || id === 'turret') ok(e.y === y0, id + ' stays fixed in y');
  }
}
{ // spawn exactly on the hero: pushed away on the first tick
  for (const id of ['grunt', 'gunman', 'shield', 'bruiser', 'knife', 'mech', 'drone']) {
    const env = mkEnv(), e = spawn(id, 400, id === 'drone' ? 320 : 500); step(env, [e], 1 / 60);
    ok(Math.abs(e.x - env.P.x) >= (env.P.w + e.w) / 2 + 60, id + ' not spawned inside the hero (pushed to ' + Math.round(e.x) + ')');
    let hits = 0; for (let i = 0; i < 20; i++) { step(env, [e], 1 / 60); } ok(env.log.melee.every(m => !m.hit), id + ' no instant hit after spawn');
  }
}

// ---- death: pose die, 0.5 s then removal, drops rolled ----
for (const id of Object.keys(FE).concat(['warden'])) {
  const env = mkEnv({ px: 100 }), e = spawn(id, 700, id === 'drone' ? 300 : 500); run(env, [e], 0.3);
  e.hp = 0; e.def.onDeath(e, env);
  ok(e.def.pose(e) === 'die' && e.dead && Array.isArray(e.dropList), id + ' dies: die pose, dead flag, dropList');
  const t = run(env, [e], 2, () => e.remove);
  ok(near(t, 0.5, 0.04), id + ' removed after 0.5 s (' + t.toFixed(2) + ')');
  const mel = env.log.melee.length, sh = env.log.shoot.length; run(env, [e], 0.5);
  ok(env.log.melee.length === mel && env.log.shoot.length === sh, id + ' deals nothing while dead');
}
{ const env = mkEnv(), e = spawn('mech', 700); e.hp = 0; FE.mech.onDeath(e, env); ok(e.dropList.length === 2 && e.dropList[0] !== e.dropList[1], 'mech drops 2 different pickups: ' + e.dropList);
  const e2 = spawn('bruiser', 700); FE.bruiser.onDeath(e2, env); ok(e2.dropList.length === 1 && e2.dropList[0].startsWith('weapon-'), 'bruiser drops 1 weapon'); }

// ---- GRUNT ----
{ const env = mkEnv({ px: 100 }), e = spawn('grunt', 700); let wind = -1, swing = -1, x0 = e.x;
  const t = run(env, [e], 20, () => { if (e.state === 'windup' && wind < 0) wind = env.G.time; if (e.state === 'swing' && swing < 0) swing = env.G.time; return swing > 0 && e.state === 'recover'; });
  ok(e.x < x0, 'grunt walks at the hero'); ok(wind > 0 && swing > 0 && near(swing - wind, 0.5, 0.03), 'grunt telegraph 0.5 s (' + (swing - wind).toFixed(3) + ')');
  ok(env.log.melee.length === 1 && env.log.melee[0].dmg === 1 && Math.abs(env.log.melee[0].r.x + env.log.melee[0].r.w / 2 - env.P.x) < 90, 'grunt swings once, 1 dmg, in front');
  ok(FE.grunt.speed < 100, 'grunt speed fair'); }
{ // hero far away: no swing
  const env = mkEnv({ px: 100 }), e = spawn('grunt', 800); run(env, [e], 1.0); ok(env.log.melee.length === 0, 'grunt does not swing out of range'); }

// ---- GUNMAN ----
{ const env = mkEnv({ px: 100 }), e = spawn('gunman', 800); let firstAim = -1, minD = 1e9, maxD = 0, shots = [];
  run(env, [e], 25, () => { const d = Math.abs(e.x - env.P.x); if (e.state === 'aim' && firstAim < 0) { firstAim = env.G.time; } if (firstAim > 0 && env.G.time > firstAim) { /* band while aiming */ } return env.log.shoot.length >= 3; });
  ok(firstAim > 0, 'gunman aims'); const s = env.log.shoot; ok(s.length === 3, 'gunman fires a 3-round burst (' + s.length + ')');
  ok(s[0].t - firstAim >= 0.6 - 1e-6 && s[0].t - firstAim <= 1.35, 'aim cue >= 0.6 s before first shot (' + (s[0].t - firstAim).toFixed(2) + ')');
  ok(s.every(q => q.spd <= 360 && q.dmg === 1), 'gunman bullets slow (<=360) and 1 dmg'); ok(s.every(q => near(q.ang, s[0].ang, 1e-9)), 'burst angle locked (dodgeable)');
  ok(s.slice(1).every((q, i) => { const a = q.t / env.BL, b = s[i].t / env.BL; return Math.floor(a) > Math.floor(b); }), 'shots land on successive beats');
  const dd = Math.abs(e.x - env.P.x); ok(dd >= 280 - 3 && dd <= 420 + 3, 'gunman holds the 280-420 band (' + Math.round(dd) + ')'); }
{ // close hero: backs off
  const env = mkEnv({ px: 450 }), e = spawn('gunman', 600); e.age = 5; const d0 = Math.abs(e.x - env.P.x); run(env, [e], 2.5);
  ok(Math.abs(e.x - env.P.x) > d0 + 60, 'gunman backs off when the hero is close'); }
{ // rushed while aiming: aborts and frees the token
  const env = mkEnv({ px: 100 }), e = spawn('gunman', 480); e.age = 5; run(env, [e], 0.3, () => e.state === 'aim'); ok(e.state === 'aim', 'aim begins'); env.P.x = 400; step(env, [e], 1 / 60);
  ok(e.state !== 'aim' && env.G.ftok.length === 0, 'rush aborts the aim and frees the token'); }
{ // no beat clock: still fires 3 shots
  const env = mkEnv({ px: 100, nobeat: true }); const e = spawn('gunman', 500); env.G.beat = undefined;
  for (let i = 0; i < 25 * 60 && env.log.shoot.length < 3; i++) { env.G.time += 1 / 60; delete env.G.beat; e.def.ai(e, 1 / 60, env); } ok(env.log.shoot.length === 3, 'gunman works without a beat clock'); }

// ---- token cap: at most 2 ranged enemies firing at once ----
{ const env = mkEnv({ px: 450 }), es = []; for (let i = 0; i < 4; i++) es.push(spawn('gunman', 800 + i * 20)); es.push(spawn('sniper', 700, 380), spawn('sniper', 650, 380), spawn('turret', 550, 500), spawn('drone', 600, 280), spawn('mech', 900));
  es.forEach(e => e.age = 5); let maxHold = 0, maxBusy = 0, total = 0;
  for (let i = 0; i < 40 * 60; i++) { step(env, es, 1 / 60); env.P.x = 300 + 150 * Math.sin(i / 90); const busy = es.filter(e => ['aim', 'burst', 'fire', 'prime', 'rocket-t'].includes(e.state)).length; maxBusy = Math.max(maxBusy, busy); maxHold = Math.max(maxHold, env.G.ftok.length); }
  total = env.log.shoot.length; ok(maxHold <= 2, 'fire tokens never exceed 2 (' + maxHold + ')'); ok(maxBusy <= 2, 'never more than 2 ranged enemies telegraphing/firing at once (' + maxBusy + ')'); ok(total > 5, 'crowd still shoots (' + total + ' shots)'); }

// ---- SHIELD cop ----
{ const env = mkEnv({ px: 100 }), e = spawn('shield', 600); e.age = 5; step(env, [e], 1 / 60); e.facing = -1; const hp0 = e.hp;
  for (let i = 0; i < 7; i++) hitEngine(e, env, 1, { x: 100 }); ok(e.hp === hp0 && e.shield, 'front bullets blocked (7 hits, hp untouched, shield up)');
  ok(env.log.fx.some(f => f.n === 'clang'), 'blocked hits show CLANG');
  hitEngine(e, env, 1, { x: 100 }); ok(!e.shield && e.hp === hp0, 'shield breaks on the 8th hit');
  hitEngine(e, env, 1, { x: 100 }); ok(e.hp === hp0 - 1, 'after the break front hits land'); }
{ const env = mkEnv({ px: 100 }), e = spawn('shield', 600); e.age = 5; step(env, [e], 1 / 60); e.facing = -1; const hp0 = e.hp;
  hitEngine(e, env, 1, { x: 100, melee: true }); ok(e.hp === hp0 - 1, 'melee goes through the shield');
  hitEngine(e, env, 1, { x: 900 }); ok(e.hp === hp0 - 2, 'back hit lands'); }
{ // jump-over: hero ends behind; the cop keeps facing the old way for 0.7 s, then turns
  const env = mkEnv({ px: 100 }), e = spawn('shield', 300); e.age = 5; run(env, [e], 0.1); const f0 = e.facing; env.P.x = 500; run(env, [e], 0.6); const keep = e.facing === f0; run(env, [e], 0.3);
  ok(keep && e.facing !== f0, 'shield cop is slow to turn (back exposed ~0.7 s)'); }
{ const env = mkEnv({ px: 100 }), e = spawn('shield', 400); e.age = 5; let w = -1, b = -1; run(env, [e], 15, () => { if (e.state === 'windup' && w < 0) w = env.G.time; if (e.state === 'bash' && b < 0) b = env.G.time; return b > 0; });
  ok(w > 0 && near(b - w, 0.5, 0.03), 'shield bash telegraph 0.5 s'); ok(FE.shield.speed < FE.grunt.speed, 'shield cop advances slowly'); }

// ---- BRUISER ----
{ const env = mkEnv({ px: 100 }), e = spawn('bruiser', 600); e.age = 5; let t0 = -1, t1 = -1, x0;
  run(env, [e], 12, () => { if (e.state === 'charge-t' && t0 < 0) { t0 = env.G.time; x0 = e.x; } if (e.state === 'charge' && t1 < 0) t1 = env.G.time; return t1 > 0; });
  ok(t0 > 0 && near(t1 - t0, 0.8, 0.03), 'bruiser charge telegraph 0.8 s (' + (t1 - t0).toFixed(3) + ')'); run(env, [e], 0.1); ok(Math.abs(e.vx) > 200 && Math.abs(e.vx) <= 380, 'charge speed ' + Math.abs(e.vx)); }
{ const env = mkEnv({ px: 400 }), e = spawn('bruiser', 520); e.age = 5; let t0 = -1, t1 = -1;
  run(env, [e], 8, () => { if (e.state === 'slam-t' && t0 < 0) t0 = env.G.time; if (e.state === 'slam' && t1 < 0) t1 = env.G.time; return t1 > 0; });
  ok(t0 > 0 && near(t1 - t0, 0.8, 0.03), 'bruiser slam telegraph 0.8 s'); const sh = env.log.shoot.filter(s => s.op.kind === 'shock'); ok(sh.length === 2 && sh.every(s => s.op.ground && s.spd <= 260), 'slam: two ground shock waves, slow, jumpable'); }

// ---- KNIFE ----
{ const env = mkEnv({ px: 100 }), e = spawn('knife', 600); e.age = 5; let t0 = -1, t1 = -1, d1 = 0, d2 = 0;
  run(env, [e], 10, () => { if (e.state === 'tele' && t0 < 0) t0 = env.G.time; if (e.state === 'dash1' && t1 < 0) t1 = env.G.time; if (e.state === 'dash1') d1++; if (e.state === 'dash2') d2++; return e.state === 'recover'; });
  ok(t0 > 0 && near(t1 - t0, 0.4, 0.03), 'knife telegraph 0.4 s'); ok(d1 > 5 && d2 > 5, 'knife two-slash combo'); ok(FE.knife.speed > FE.grunt.speed * 2, 'knife is the fast one'); }
{ const env = mkEnv({ px: 100, obs: [{ x: 400, w: 30, h: 40 }] }), e = spawn('knife', 700); e.age = 0.2; let up = 0;
  run(env, [e], 6, () => { if (e.y < 490) up++; return e.x < 380; }); ok(up > 5 && e.x < 400, 'knife vaults the low obstacle'); }

// ---- SNIPER ----
{ const env = mkEnv({ px: 100 }), e = spawn('sniper', 600, 380); let t0 = -1, lockT = -1, shotT = -1, ang = [];
  run(env, [e], 12, () => { if (e.state === 'aim' && t0 < 0) t0 = env.G.time; if (e.aim && e.aim.locked && lockT < 0) lockT = env.G.time; if (env.log.shoot.length && shotT < 0) shotT = env.G.time; return shotT > 0; });
  ok(t0 > 0 && near(shotT - t0, Math.max(0.5, env.BL), 0.04), 'sniper aim line lasts 1 beat (' + (shotT - t0).toFixed(2) + ' s)'); ok(shotT - lockT >= 0.25, 'aim line locks >= 0.25 s before the shot');
  const s = env.log.shoot; ok(s.length === 1 && s[0].spd >= 600 && s[0].dmg === 2, 'one fast shot'); ok(e.y === 380, 'sniper stays on its ledge y'); ok(e.aim === null, 'aim line gone after the shot'); }

// ---- DRONE ----
{ const env = mkEnv({ px: 300 }), e = spawn('drone', 700, 300); const lo = 500 - 320, hi = 500 - 130; let minY = 1e9, maxY = -1e9, prime = -1, drop = -1, xs = [];
  for (let i = 0; i < 40 * 60; i++) { step(env, [e], 1 / 60); env.P.x = 300 + 120 * Math.sin(i / 100); minY = Math.min(minY, e.y); maxY = Math.max(maxY, e.y); if (e.state === 'prime' && prime < 0) prime = env.G.time; if (env.log.shoot.length && drop < 0) drop = env.G.time; xs.push(e.x); }
  ok(minY >= lo - 1e-6 && maxY <= hi + 1e-6, 'drone stays in the air band (' + Math.round(minY) + '..' + Math.round(maxY) + ')'); ok(maxY - minY > 25, 'drone bobs on a sine path');
  ok(prime > 0 && drop - prime >= 0.4 - 0.02, 'drone bomb blink >= 0.4 s'); ok(env.log.shoot.every(s => s.op.kind === 'bomb' && s.dmg === 1), 'drone drops small bombs'); ok(env.log.shoot.length >= 3, 'drone keeps bombing (' + env.log.shoot.length + ')'); }

// ---- TURRET ----
{ const env = mkEnv({ px: 100 }), e = spawn('turret', 500); e.age = 5; const hp0 = e.hp;
  hitEngine(e, env, 2, { x: 100 }); ok(e.hp === hp0 && FE.turret.canHit(e) === false, 'turret hidden: not hittable (hp refunded)');
  let r0 = -1, f0 = -1, up = 0;
  run(env, [e], 12, () => { if (e.state === 'rise' && r0 < 0) r0 = env.G.time; if (env.log.shoot.length && f0 < 0) f0 = env.G.time; return env.log.shoot.length >= 3 && e.state === 'retract'; });
  ok(r0 > 0 && f0 - r0 >= 0.4, 'turret pop-up telegraph >= 0.4 s (' + (f0 - r0).toFixed(2) + ')'); ok(env.log.shoot.length === 3, 'turret fires exactly 3 shots'); ok(near(env.log.shoot[1].t - env.log.shoot[0].t, 0.32, 0.03), 'shot spacing 0.32 s');
  run(env, [e], 0.1); const e2 = spawn('turret', 500); e2.age = 5; run(env, [e2], 3, () => e2.up); const h = e2.hp; hitEngine(e2, env, 2, { x: 100 }); ok(e2.up && e2.hp === h - 2, 'turret hittable when up');
  run(env, [e2], 3, () => e2.state === 'hidden'); const hh = e2.hp; hitEngine(e2, env, 2, { x: 100 }); ok(e2.hp === hh, 'turret retracted again: armoured'); }

// ---- MECH ----
{ const env = mkEnv({ px: 100 }), e = spawn('mech', 700); e.age = 5; step(env, [e], 1 / 60); e.facing = -1; const hp0 = e.hp;
  hitEngine(e, env, 1, { x: 100 }); ok(e.hp === hp0 - 1, 'mech front hit = 1x'); hitEngine(e, env, 1, { x: 1000 }); ok(e.hp === hp0 - 3, 'mech back hit = double damage'); ok(env.log.fx.some(f => f.n === 'weak'), 'weak-point feedback'); }
{ const env = mkEnv({ px: 100 }), e = spawn('mech', 700); e.age = 5; let t0 = -1, t1 = -1; run(env, [e], 15, () => { if (e.state === 'rocket-t' && t0 < 0) t0 = env.G.time; if (env.log.shoot.length && t1 < 0) t1 = env.G.time; return t1 > 0; });
  ok(t0 > 0 && near(t1 - t0, 0.7, 0.03), 'mech rocket telegraph 0.7 s'); const s = env.log.shoot[0]; ok(s.op.grav > 0 && s.op.kind === 'rocket' && Math.sin(s.ang) < -0.5 && s.spd <= 520, 'rocket is an arc (upward angle, gravity, speed <= 520)');
  const g = s.op.grav, vx = Math.cos(s.ang) * s.spd, vy = Math.sin(s.ang) * s.spd, T = -2 * vy / g, landX = s.op.ox + vx * T; ok(Math.abs(landX - 100) < 80, 'rocket lands near the hero (' + Math.round(landX) + ')'); }
{ const env = mkEnv({ px: 100 }), e = spawn('mech', 900); e.age = 5; step(env, [e], 1 / 60); env.P.x = 450; e.x = 600; e.facing = -1; let t0 = -1, t1 = -1; run(env, [e], 15, () => { if (e.state === 'stomp-t' && t0 < 0) t0 = env.G.time; if (e.state === 'stomp' && t1 < 0) t1 = env.G.time; return t1 > 0; });
  ok(t0 > 0 && near(t1 - t0, 0.6, 0.03), 'mech stomp telegraph 0.6 s'); ok(env.log.shoot.filter(s => s.op.kind === 'shock').length === 2, 'stomp sends two ground waves'); }

// ---- BOSS ----
{ const env = mkEnv({ px: 100 }), e = spawn('warden', 700); e.hp = e.maxHp = 400; e.age = 5;
  const cap = 4, dmgLog = [], phases = [], poses = new Set(), exp = []; let lastPhase = 1, t = 0, prevExp = false, lastLaser = null, clangs = 0, wallBreaks = 0, laserSeq = [];
  const DPS = 12, pend = [];
  for (let i = 0; i < 400 * 60 && e.hp > 0; i++) {
    { const L = e.laser; env.P.y = 500; env.P.crouch = false; env.P.h = 84; if (L && L.kind === 'low') env.P.y = 450; if (L && L.kind === 'high') { env.P.crouch = true; env.P.h = 42; env.P.hStand = 84; } }
    step(env, [e], 1 / 60); t = env.G.time;
    // bot: lands a 0.4-dmg bullet every 1/30 s (12 dps) when it can; from behind while the wall is up
    const wall = e.wall && e.wall.up; env.P.x = wall ? e.x - e.facing * 100 : 100; if (i % 2 === 0) { const before = e.hp; hitEngine(e, env, DPS / 30, { x: env.P.x }); dmgLog.push({ t, d: before - e.hp }); }
    if (e.phase !== lastPhase) { phases.push({ phase: e.phase, t, beat: env.G.beat }); lastPhase = e.phase; }
    poses.add(e.def.pose(e)); if (e.exposed && !prevExp) exp.push({ t, phase: e.phase }); prevExp = e.exposed; if (e.laser && e.laser.kind && (!lastLaser || lastLaser.kind !== e.laser.kind || lastLaser.on !== e.laser.on)) laserSeq.push(e.laser.kind + (e.laser.on ? '!' : '?')); lastLaser = e.laser ? { kind: e.laser.kind, on: e.laser.on } : null;
  }
  ok(e.hp <= 0, 'boss can be killed (t=' + t.toFixed(1) + ' s)'); ok(t >= 95 && t <= 140, 'fight lasts 95-140 s at 12 dps (' + t.toFixed(1) + ')');
  let maxW = 0; for (let i = 0; i < dmgLog.length; i++) { let s = 0; for (let j = i; j >= 0 && dmgLog[i].t - dmgLog[j].t < 1; j--) s += dmgLog[j].d; maxW = Math.max(maxW, s); }
  ok(maxW <= cap + 1e-6, 'damage cap: max in any 1.0 s window = ' + maxW.toFixed(3) + ' <= ' + cap); ok(env.log.fx.filter(f => f.n === 'clang').length > 3, 'absorbed damage shows CLANG');
  ok(phases.length === 2 && phases[0].phase === 2 && phases[1].phase === 3, 'phases 1 -> 2 -> 3 (' + phases.map(p => p.phase + '@' + p.t.toFixed(1)).join(',') + ')');
  ok(phases.every(p => Math.floor(p.beat) % 4 === 0), 'phase changes land on a bar line (beats ' + phases.map(p => Math.floor(p.beat)).join(',') + ')');
  ok(['attack2', 'enrage', 'crouch', 'shoot', 'melee', 'hit'].every(p => poses.has(p)), 'boss poses used: ' + [...poses].join(','));
  ok(env.log.spawn.filter(s => s.type === 'drone').length >= 2, 'phase 2 deploys drones (' + env.log.spawn.length + ')');
  ok(exp.filter(x => x.phase === 3).length >= 2, 'phase 3: EXPOSED windows after surviving the laser (' + exp.filter(x => x.phase === 3).length + ')'); ok(env.log.fx.some(f => f.n === 'exposed'), 'EXPOSED label fx');
  ok(env.log.fx.some(f => f.n === 'wallbreak'), 'shield wall is broken from behind');
  ok(laserSeq.slice(0, 6).join(' ') === 'low? low! low? high? high! high?'.replace('low? high?', 'low? high?') || /low\?.*low!.*high\?.*high!/.test(laserSeq.join(' ')), 'laser order: low tele, low beam, high tele, high beam (' + laserSeq.slice(0, 6).join(' ') + ')');
  // calm bar after each phase change: no shots, melee or spawns for 3.5 beats
  for (const p of phases) { const a = p.t, b = p.t + 3.5 * env.BL; ok(!env.log.shoot.some(s => s.t > a + 0.02 && s.t < b && s.e === e) && !env.log.melee.some(m => m.t > a + 0.02 && m.t < b && m.e === e) && !env.log.spawn.some(s => s.t > a && s.t < b), 'calm bar after phase ' + p.phase + ' (no attacks)'); }
}
{ // telegraphs and fairness
  const env = mkEnv({ px: 100 }), e = spawn('warden', 700); e.hp = e.maxHp = 400; e.age = 5; step(env, [e], 1 / 60); e.phase = 2; e.wall = { hp: 8, up: false }; e.wallAt = 1e9; e.droneAt = 1e9; const ts = { 'charge-t': 0.65, 'burst-aim': 0.6, 'shock-t': 0.7 }, seen = {}; let cur = null, cs = 0;
  run(env, [e], 60, () => { if (e.mode !== cur) { if (ts[cur] && seen[cur] == null) seen[cur] = env.G.time - cs; cur = e.mode; cs = env.G.time; } return false; });
  for (const k in ts) ok(seen[k] != null && seen[k] >= ts[k] - 0.03, 'boss ' + k + ' telegraph ' + (seen[k] || 0).toFixed(2) + ' s >= ' + ts[k]);
  ok(env.log.shoot.filter(s => s.op.kind === 'bullet').every(s => s.spd <= 360) && env.log.shoot.filter(s => s.op.ground).every(s => s.spd <= 260), 'boss projectile speeds dodgeable'); }
{ // laser geometry: standing hero is hit by the high beam, crouch dodges high, jump dodges low
  const mkLaser = (stance) => { const env = mkEnv({ px: 100 }), e = spawn('warden', 700); e.hp = e.maxHp = 400; e.age = 5; e.phase = 3; e.mhp = 400; e.mode = 'idle'; e.bucket = []; e.minions = []; e.cyc = 0; step(env, [e], 1 / 60);
    env.G.beat = Math.ceil(env.G.beat / 4) * 4 - 0.001; env.G.time = env.G.beat * env.BL; let hitLow = false, hitHigh = false;
    for (let i = 0; i < 6 * 60; i++) { env.G.time += 1 / 60; env.G.beat = env.G.time / env.BL; if (stance === 'crouch') { env.P.crouch = true; env.P.h = 42; env.P.hStand = 84; } if (stance === 'jump') { env.P.y = 500 - 50; } e.def.ai(e, 1 / 60, env); }
    for (const m of env.log.melee) if (m.op && m.op.beam) { if (m.r.y > 470) hitLow = hitLow || m.hit; else hitHigh = hitHigh || m.hit; } return { hitLow, hitHigh, n: env.log.melee.filter(m => m.op && m.op.beam).length }; };
  const st = mkLaser('stand'), cr = mkLaser('crouch'), ju = mkLaser('jump');
  ok(st.n > 0 && st.hitLow && st.hitHigh, 'standing hero is hit by both beams'); ok(cr.n > 0 && !cr.hitHigh && cr.hitLow, 'crouching dodges the high beam only'); ok(ju.n > 0 && !ju.hitLow && ju.hitHigh === false || (ju.n > 0 && !ju.hitLow), 'jumping dodges the low beam'); }
{ // boss with no wall and an idle hero reaches phase 3 hp 33% exactly once; cap uses scaled hp
  const env = mkEnv({ px: 100 }), e = spawn('warden', 700); e.hp = e.maxHp = 800; e.age = 5; step(env, [e], 1 / 60); let tot = 0; for (let i = 0; i < 120; i++) { env.G.time += 1 / 60; const b = e.hp; hitEngine(e, env, 5, { x: 100 }); tot += b - e.hp; } ok(tot <= 16 + 1e-6 && tot > 15, 'cap scales with scaled hp (800 hp => 8 per second, got ' + tot.toFixed(2) + ' in 2 s)'); }

// ---- foot.js engine, if it is on the branch ----
try { const fs = require('fs'); if (fs.existsSync(__dirname + '/parts/foot.js')) { console.log('note: parts/foot.js present; run its stage in the browser sweep (not part of this headless test)'); } } catch (_) {}

console.log(fails ? ('FOOTEN TEST FAILED: ' + fails + ' failed, ' + passes + ' passed') : ('footen-test: all ' + passes + ' checks passed'));
process.exit(fails ? 1 : 0);
