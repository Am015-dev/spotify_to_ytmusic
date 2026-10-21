#!/usr/bin/env node
// FOOTSTAGE (parts/footstage.js): the finished on-foot stage 'zeil'. Headless, no screenshots. Prints PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/footstage-test.js     env: GAME_DIR=...  RUNS=n (bot runs, default 12)  REF_DIR=<older build> (optional: ?footstage=0 vs it)
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun'), RUNS = +process.env.RUNS || 12;
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [], ok = (n, p, i) => { res.push(!!p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + (typeof i === 'string' ? i : JSON.stringify(i)))); };
const STORY = JSON.stringify({ stars: { 1: 3, 2: 3, 3: 2 }, snap: {}, all: false, v30: 1, v40: 1 });
const ORDER = [['grunt', 0], ['gunman', 0], ['shield', 1], ['knife', 1], ['drone', 1], ['sniper', 2], ['turret', 2], ['bruiser', 2], ['mech', 3], ['jetpack', 4], ['hound', 4], ['flamer', 5], ['ninja', 5], ['medic', 6], ['warden2', 7], ['relay', 7]];
const NEW = ['jetpack', 'hound', 'flamer', 'ninja', 'medic'];
// the foot-bot: runs right, shoots the most urgent target (relay while the gate is up, medic, then the nearest), hops bullets, jumps pounces, parries ninjas, keeps range from flamers
const BOT = () => { const tel = e => e.tele > 0 || e.wind > 0 || !!e.lane || !!e.mark || e.state === 'ignite' || e.state === 'crouch';
  window.__fs = { atk: 0, unseen: 0, untel: 0, untelBy: {}, parry: 0 }; NR.on('footParry', () => __fs.parry++);
  const wrap = () => { const env = FOOT.env; if (env._w) return; env._w = 1; const sh = env.shoot, me = env.melee;
    const chk = e => { const S = FOOT.S; if (!S || !e || e.boss) return; __fs.atk++; const vw = FOOT.hudInfo().vw; if (e.x < S.camX - 10 || e.x > S.camX + vw + 10) { __fs.unseen++; __fs.unseenBy = (__fs.unseenBy || '') + e.id + ' '; }
      if (e._tl0 == null || S.time - e._tl0 > 4.5 || e._tlD < .39) { if (/^(jetpack|hound|flamer|ninja|relay)$/.test(e.id)) { __fs.untel++; __fs.untelBy[e.id] = (__fs.untelBy[e.id] | 0) + 1; } } };
    env.shoot = function (e, ...a) { return sh.call(this, e, ...a); }; env.melee = function (e, ...a) { chk(e); return me.call(this, e, ...a); }; };
  FOOT.ctl = (S, I) => { try { ctl(S, I); } catch (x) { if (!window.__ce) { window.__ce = 1; console.log('STALL ctl error ' + x.message + ' ' + (x.stack || '').split('\n')[1]); } } };
  const ctl = (S, I) => { window.__lastI = I; wrap(); const P = S.P; if (window.__diag && S.fs && S.time - S.fs.secT[S.fs.secT.length - 1] > 70 && !S._dumped) { S._dumped = 1; setTimeout(() => { console.log('STALL sec' + S.cpN + ' P ' + [Math.round(S.P.x - S.camX), Math.round(S.P.y), S.P.w, S.P.lv, S.P.facing, S.P.onGround, S.pb.length, S.P.crouch, S.shots, Math.round(S.P.aim * 57)].join('/') + ' x' + Math.round(S.P.x) + ' lock ' + JSON.stringify(S.lock) + ' waves ' + S.waves.filter(w => !w.done && (w.started || w.lock)).map(w => w.enemy + w.left + (w.lock || '')).join(',') + ' E ' + S.E.filter(e => !e.dead).map(e => e.id + '@' + Math.round(e.x - S.camX) + ',' + Math.round(e.y) + ':' + e.state + ':' + (e.hp || 0).toFixed(1) + (e.seen ? 's' : '')).join(' ')); const s0 = S.shots, pr = S.pr.filter(q => q.hp > 0 && q.x > S.camX && q.x < S.camX + 760).map(q => q.k + '@' + Math.round(q.x - S.camX) + ':' + q.hp);  console.log('STALL+ shots/s ' + (S.shots - s0) + ' pb ' + S.pb.length + ' cd ' + S.P.cd + ' paused ' + S.paused + ' props ' + pr.join(' ') + ' I ' + JSON.stringify(FOOT.S && window.__lastI));  }, 0); } if (window.__god) { P.hp = P.max; } const vw = FOOT.hudInfo().vw;
    for (const e of S.E) { const t = tel(e); if (t) { if (!e._on) { e._on = 1; e._ts = S.time; } e._tl0 = e._ts; e._tlD = S.time - e._ts; } else e._on = 0; }
    const live = S.E.filter(e => !e.dead && e.x > S.camX - 5 && e.x < S.camX + vw + 5);
    let near = null, nd = 1e9; for (const e of live) { const d = Math.abs(e.x - P.x) + Math.abs(e.y - P.y) * .5 - (e.id === 'medic' ? 300 : 0) - (e.id === 'relay' ? 600 : 0); if (d < nd) { nd = d; near = e; } }
    if (S.boss && S.boss.gate) { const r = live.filter(e => e.id === 'relay'); if (r.length) near = r.sort((a, b) => Math.abs(a.x - P.x) - Math.abs(b.x - P.x))[0]; }
    I.l = I.r = I.u = I.d = 0; I.fire = 1;
    let th = null; const bx = { l: P.x - 24, r: P.x + 24, t: P.y - 74, b: P.y + 4 };
    for (const b of S.eb) { for (const t of [.08, .16, .24, .32, .4, .5]) { const x = b.x + b.vx * t, y = b.y + b.vy * t + (b.grav ? 430 * t * t : 0); if (x > bx.l && x < bx.r && y > bx.t && y < bx.b) { th = b; break; } } if (th) break; }
    if (near) { const dx = near.x - P.x, dy = (near.y - near.h / 2) - (P.y - 44), r = Math.abs(dy) / Math.max(1, Math.abs(dx)); P.facing = dx > 0 ? 1 : -1;
      if (Math.abs(dx) < 70 && near.y > P.y - 90) { if (!S._mc || S.time - S._mc > .35) { I.meleeP = 1; S._mc = S.time; } }
      if (dy < -40 && r > .45) { I.u = 1; if (Math.abs(dx) > 25) I[dx > 0 ? 'r' : 'l'] = 1; }
      else if ((near.id === 'shield' && near.shield) || (near.id === 'ninja' && near.state === 'guard')) { if (Math.abs(dx) > 55) I[dx > 0 ? 'r' : 'l'] = 1; if (near.id === 'shield' && Math.abs(dx) < 120 && P.onGround && Math.random() < .5) { I.jumpP = 1; I.jump = 1; } }
      else if (near.id === 'flamer' && Math.abs(dx) < 240 && (near.state === 'ignite' || near.state === 'spray') && (dx > 0 ? P.x - S.camX > 110 : S.camX + vw - P.x > 110)) I[dx > 0 ? 'l' : 'r'] = 1;
      else if (dx > 200 || dx < -260) I[dx > 0 ? 'r' : 'l'] = 1; }
    else I.r = 1;
    for (const e of live) { const dx = e.x - P.x;
      if (e.id === 'ninja' && e.state === 'wind' && Math.abs(dx) < 110 && Math.random() < .6) { P.facing = dx > 0 ? 1 : -1; if (P.melCd <= 0) I.meleeP = 1; }
      if (e.id === 'hound' && e.state === 'pounce' && Math.abs(dx) < 190 && P.onGround) { I.jumpP = 1; I.jump = 1; }
      if (e.patch && P.x > e.patch.x0 - 20 && P.x < e.patch.x1 + 20 && P.onGround) { I.jumpP = 1; I.jump = 1; }
      if (e.lane && Math.abs(dx) < 260 && P.dashCd <= 0 && Math.random() < .05) I.dashP = 1; }
    if (th) { const above = Math.abs(th.vy) > Math.abs(th.vx); if (above) { I.l = I.r = 0; I[th.vx > 0 || (!th.vx && P.x < S.camX + 200) ? 'r' : 'l'] = 1; if (P.dashCd <= 0) { P.facing = I.r ? 1 : -1; I.dashP = 1; } }
      else if (P.onGround) { I.jumpP = 1; I.jump = 1; } else if (P.dashCd <= 0 && th.y < P.y - 20) I.dashP = 1; else I.jump = 1; } else if (!I.jumpP) I.jump = P.vy < 0 ? 1 : 0;
    if (near && /shield|bruiser|mech|warden/.test(near.id) && Math.abs(near.x - P.x) < 320 && P.bombs > 0 && (!S._bt || S.time - S._bt > 2.5)) { I.bombP = 1; S._bt = S.time; }
    if (live.length >= 5 && P.bombs > 0 && (!S._bt || S.time - S._bt > 3)) { I.bombP = 1; S._bt = S.time; }
    for (const p of S.pk) if (Math.abs(p.x - P.x) < 300 && p.x > S.camX + 24 && !near) { I.r = p.x > P.x; I.l = p.x < P.x; } }; };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  let rport = 0, rsrv = null; if (process.env.REF_DIR) { rport = await freePort(); rsrv = cp.spawn('python3', ['-m', 'http.server', String(rport), '--bind', '127.0.0.1', '--directory', process.env.REF_DIR], { stdio: 'ignore' }); }
  await sleep(700);
  const br = await PW.chromium.launch(), errs = [];
  const open = async (w, h, q = '', o = {}) => { const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: !!o.touch, isMobile: !!o.touch });
    await ctx.addInitScript(([s]) => { try { if (!sessionStorage.getItem('_ft')) { sessionStorage.setItem('_ft', 1); localStorage.clear(); localStorage.setItem('mnr_story', s); localStorage.setItem('mnr_tut', '2'); localStorage.setItem('mnr_foot', '{"seen":{"b":1,"a":1},"hint":1}'); } } catch (e) {} }, [STORY]);
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(w + 'x' + h + q + ' ' + e.message)); await p.goto(`http://127.0.0.1:${o.port || port}/index.html?nomusic=1${q}`, { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => window.__mnr && document.getElementById('moreBtn'), null, { timeout: 15000 }); await sleep(400); p.ctx = ctx; return p; };
  const enter = async (p, touch) => { await p.evaluate(() => document.getElementById('moreBtn').click()); await sleep(200);
    const b = await p.$('#footBtn'); if (!b) return 'no button'; if (await b.isDisabled()) return 'locked';
    if (touch) await b.tap(); else await b.click(); await sleep(300); await p.waitForFunction(() => FOOT.on, null, { timeout: 12000 }).catch(() => {});
    return await p.evaluate(() => FOOT.on ? 'on:' + FOOT.S.id : 'not started'); };
  // the street1 mock, seeded: a state fingerprint after 40 s of the old bot-free walk (run right, hold fire)
  const fp = p => p.evaluate(() => { let s = 7; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647; document.getElementById('fMenu').hidden = true; FOOT.ctl = (S, I) => { I.r = 1; I.fire = 1; };
    FOOT.start('street1'); const S = FOOT.sim(40, 1 / 60); const r = [S.time.toFixed(2), Math.round(S.P.x), S.P.hp, S.kills, S.score, S.E.length, S.eb.length, S.pk.length].join(','); FOOT.ctl = null; FOOT.stop(); return r; });
  try {
    // ---- flag off: the mock exactly
    { const p = await open(390, 763, '&footstage=0', { touch: true }); const st = await enter(p, true);
      const r = await p.evaluate(() => ({ main: FOOT.main, zeil: !!FOOT.STAGES.zeil, jet: !!(window.FOOT_ENEMIES && FOOT_ENEMIES.jetpack), dx: !!FOOT.drawX, w2: !!(window.FOOT_BOSS && FOOT_BOSS.warden2) }));
      ok('?footstage=0: the button opens the street1 mock, no new stage / enemies / art', st === 'on:street1' && !r.main && !r.zeil && !r.jet && !r.dx && !r.w2, [st, r]);
      await p.evaluate(() => FOOT.stop()); const a = await fp(p); await p.ctx.close();
      const p2 = await open(390, 763, '', { touch: true }); await enter(p2, true); await p2.evaluate(() => FOOT.stop()); const b = await fp(p2); await p2.ctx.close();
      ok('?footstage=0: street1 plays the same with the flag on or off (seeded 40 s fingerprint)', a === b, [a, b]);
      if (rport) { const p3 = await open(390, 763, '', { touch: true, port: rport }); await enter(p3, true); await p3.evaluate(() => FOOT.stop()); const c = await fp(p3); await p3.ctx.close();
        ok('?footstage=0: street1 identical to the reference build', a === c, [a, c]); } }
    // ---- phone layout + HUD at both phone sizes
    for (const [w, h] of [[390, 763], [375, 553]]) { const p = await open(w, h, '', { touch: true }); const st = await enter(p, true); ok(w + 'x' + h + ': STREET RUN opens the new stage', st === 'on:zeil', st);
      if (st !== 'on:zeil') { await p.ctx.close(); continue; }
      for (const au of [true, false]) { await p.evaluate(a => { FOOT.setAuto(a); FOOT.layout(); FOOT.step(1 / 60); }, au); await sleep(150);
        const a = await p.evaluate(() => { const o = []; const I = FOOT.hudInfo(), W = innerWidth, H = innerHeight, bx = I.box, play = { left: bx.x, top: bx.y, right: bx.x + bx.w, bottom: bx.y + bx.h };
          const hit = (a, c, m) => a.left < c.right - 1 + m && a.right > c.left + 1 - m && a.top < c.bottom - 1 + m && a.bottom > c.top + 1 - m;
          const bs = []; for (const b of document.querySelectorAll('#footL .fb,#footL .fpad,#fPause')) { if (b.hidden || b.style.display === 'none') continue; const r = b.getBoundingClientRect();
            if (r.width < 44 || r.height < 44) o.push('small ' + b.id); if (r.left < 0 || r.top < 0 || r.right > W || r.bottom > H) o.push('out ' + b.id); if (b.id !== 'fPause' && hit(r, play, 0)) o.push('over ' + b.id); if (b.classList.contains('fb')) bs.push([b.id, r]); }
          for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) if (hit(bs[i][1], bs[j][1], 8)) o.push('gap ' + bs[i][0] + '/' + bs[j][0]);
          const hb = I.hud.hud, n = hb.length, pb = hb[n - 1]; const fh = bx.h / I.sc; if (!(pb.y > fh * .7)) o.push('no progress bar box');   // fh: the field height in units (540, less on a portrait phone with streetlook)
          for (let i = 0; i < n; i++) { const q = hb[i]; if (q.x < -.5 || q.x + q.w > I.vw + .5 || q.y < 0 || q.y + q.h > fh + .5) o.push('hud out ' + i); for (let j = i + 1; j < n; j++) { const r = hb[j]; if (j === n - 1 || i === n - 1) if (q.x < r.x + r.w && q.x + q.w > r.x && q.y < r.y + r.h && q.y + q.h > r.y) o.push('hud overlap ' + i + '/' + j); } }
          const pr = document.getElementById('fPause').getBoundingClientRect(), u = I.sc, pbs = { left: bx.x + pb.x * u, top: bx.y + pb.y * u, right: bx.x + (pb.x + pb.w) * u, bottom: bx.y + (pb.y + pb.h) * u }; if (hit(pr, pbs, 0)) o.push('pause on bar');
          if (I.hud.hint) { const t = I.hud.hint; for (const q of hb) if (t.x < q.x + q.w && t.x + t.w > q.x && t.y < q.y + q.h && t.y + t.h > q.y) o.push('hint on HUD'); }
          return o; });
        ok(w + 'x' + h + ' auto-fire ' + (au ? 'ON' : 'OFF') + ': 44px+ controls, 8px gaps, off the field, progress bar clear of the HUD / pause', !a.length, a); }
      const rs = await p.evaluate(() => { const S = FOOT.S; S.P.x = 14400; S.camX = 14100 - FOOT.hudInfo().vw / 2; S.cpN = 7; S.bossOn = true; S.lock = { id: 'boss', cam: S.camX }; const b = FOOT.env.spawn('relay', S.camX + 200, 470); return !!b; });
      await p.evaluate(() => { const S = FOOT.S; S.win = .01; FOOT.step(1 / 60); FOOT.step(1 / 60); }); await sleep(200);
      const m = await p.evaluate(() => { const m = document.getElementById('fMenu'); return { shown: !m.hidden, h: (m.querySelector('h2') || {}).textContent, rows: [...m.querySelectorAll('.fr span')].map(s => s.textContent), btn: [...m.querySelectorAll('button')].map(b => Math.round(b.getBoundingClientRect().height)) }; });
      ok(w + 'x' + h + ': completion screen (result style, SECTION row, 44px+ buttons)', m.shown && m.h === 'STREET CLEAR' && m.rows.indexOf('SECTION') >= 0 && m.btn.every(x => x >= 44), m);
      await p.ctx.close(); }
    // ---- each new enemy stays (>= 4 s on screen), fights with a telegraph, dies in 2-5 pistol hits
    { const p = await open(1280, 720); await enter(p, false);
      const r = await p.evaluate(NEW => { const out = {}; for (const id of NEW) { document.getElementById('fMenu').hidden = true; FOOT.start('zeil'); const S = FOOT.S, P = S.P; S.E.length = 0; S.waves.forEach(w => w.done = true); S.st.locks.forEach(l => S.lockDone[l.id] = 1);
          P.x = 600; S.camX = 300; P.maxX = 600; const vw = FOOT.hudInfo().vw; let atk = 0, tl = 0, inScr = 0, heal = 0; FOOT.ctl = (S, I) => { for (const k in I) I[k] = 0; P.hp = P.max; P.inv = 0; P.dashIF = 0; };
          const hurts0 = S.hurts; const e = FOOT.env.spawn(id, S.camX + vw - 120, id === 'jetpack' ? 250 : null); let g = null; if (id === 'medic') { g = FOOT.env.spawn('gunman', S.camX + vw - 60, null); g.hp = 1; }
          for (let i = 0; i < 360; i++) { FOOT.step(1 / 60); if (e.tele > 0 || e.wind > 0 || e.lane || e.mark) tl++; if (!e.dead && e.x > S.camX && e.x < S.camX + vw) inScr++; if (g && g.hp > 1.2) heal = 1; }
          out[id] = { alive: !e.dead, on: +(inScr / 60).toFixed(1), hurts: S.hurts - hurts0, tel: +(tl / 60).toFixed(1), heal, hits: Math.ceil(e.max / 1), max: e.max }; FOOT.ctl = null; FOOT.stop(); }
        return out; }, NEW);
      ok('new enemies stay and fight: alive and on screen >= 4 s of 6 s, each attacker hit an idle hero, the medic healed', NEW.every(k => r[k].alive && r[k].on >= 4 && (k === 'medic' ? r[k].heal : r[k].hurts > 0)), r);
      ok('new enemies telegraph (>= 0.4 s of tells before they hurt you)', NEW.filter(k => k !== 'medic').every(k => r[k].tel >= .4), r);
      ok('new enemies die in 2-5 pistol hits on Normal', NEW.every(k => r[k].hits >= 2 && r[k].hits <= 5), NEW.map(k => k + ':' + r[k].hits));
      // ninja parry window: a KNIFE in the windup stuns it
      const pr = await p.evaluate(() => { document.getElementById('fMenu').hidden = true; FOOT.start('zeil'); const S = FOOT.S, P = S.P; S.E.length = 0; S.waves.forEach(w => w.done = true); P.x = 600; S.camX = 300; P.maxX = 600;
        const e = FOOT.env.spawn('ninja', 900, null); let got = 0; FOOT.ctl = (S, I) => { for (const k in I) I[k] = 0; P.hp = P.max; if (e.state === 'wind' && e.sT > .15 && !got) { P.facing = e.x > P.x ? 1 : -1; I.meleeP = 1; got = 1; } };
        let st = 0; for (let i = 0; i < 600 && !st; i++) { FOOT.step(1 / 60); if (e.state === 'stun' || e.dead) st = 1; } const o = { st, state: e.state, dead: e.dead }; FOOT.ctl = null; FOOT.stop(); return o; });
      ok('ninja: KNIFE in the windup = PARRY (stun)', pr.st, pr);
      // the boss gate: the Warden takes nothing while a relay stands, opens when both fall
      const gt = await p.evaluate(() => { document.getElementById('fMenu').hidden = true; FOOT.start('zeil'); const S = FOOT.S, P = S.P; S.waves.forEach(w => w.done = true); S.st.locks.forEach(l => S.lockDone[l.id] = 1); S.E.length = 0;
        S.cpN = 7; P.x = 13900; P.maxX = P.x; S.camX = 13600; FOOT.ctl = (S, I) => { for (const k in I) I[k] = 0; P.hp = P.max; I.r = P.x < 14060; };
        for (let i = 0; i < 600 && !(S.boss && S.boss.gate); i++) FOOT.step(1 / 60); const b = S.boss; if (!b) return { boss: 0 };
        const h0 = b.hp; b.def.onHit(b, 0, FOOT.env, { x: P.x }); b.hp -= 5; b.def.onHit(b, 5, FOOT.env, { x: P.x }); const blocked = Math.abs(b.hp - h0) < .01;
        for (const r of b.relays) { r.hp = .01; r.grace = 0; } FOOT.step(1 / 60); for (const r of b.relays) { if (!r.dead) { r.hp -= 1; r.def.onDeath(r, FOOT.env); r.dead = true; } } FOOT.step(1 / 60); FOOT.step(1 / 60);
        const open = b.openT > 0, h1 = b.hp; b.hp -= 2; b.def.onHit(b, 2, FOOT.env, { x: P.x }); const o = { boss: 1, relays: b.relays.length, blocked, open, took: +(h1 - b.hp).toFixed(2) }; FOOT.ctl = null; FOOT.stop(); return o; });
      ok('warden gate: 2 relays, damage blocked while up, OPEN (x1.5) once both fall', gt.boss && gt.relays === 2 && gt.blocked && gt.open && gt.took >= 2.9, gt);
      // checkpoint: die after checkpoint 2, FROM CHECKPOINT resumes there (section 3)
      const ck = await p.evaluate(() => { document.getElementById('fMenu').hidden = true; FOOT.start('zeil'); const S = FOOT.S, P = S.P; FOOT.ctl = (S, I) => { for (const k in I) I[k] = 0; I.r = 1; }; S.waves.forEach(w => { if (w.x < 4200 || w.lock && 'AB'.indexOf(w.lock) >= 0) w.done = true; }); S.E.length = 0; S.lockDone.A = S.lockDone.B = 1;
        const pr = []; for (let i = 0; i < 2400 && (S.cpN | 0) < 2; i++) { FOOT.step(1 / 60); if (i % 60 === 0) pr.push(Math.round(P.maxX)); P.hp = P.max; P.inv = 1; S.E.forEach(e => e.dead = true); }
        const cpn = S.cpN | 0; P.inv = 0; P.dashIF = 0; P.hp = 1; S.eb.push({ x: P.x, y: P.y - 30, vx: 0, vy: 0, r: 6, dmg: 1, life: 1 }); FOOT.ctl = null; for (let i = 0; i < 200 && !S.end; i++) FOOT.step(1 / 60);
        const btn = document.getElementById('fCp'); if (!btn) return { cpn, end: !!S.end, btn: 0 }; btn.click(); const T = FOOT.S; const o = { cpn, btn: 1, x: Math.round(T.P.x), sec: T.cpN, mono: pr.every((v, i) => !i || v >= pr[i - 1]) }; FOOT.stop(); return o; });
      ok('checkpoints: reached in order, progress only grows, FROM CHECKPOINT resumes at checkpoint 2 (x 4040)', ck.cpn === 2 && ck.btn && ck.x === 4040 && ck.sec === 2 && ck.mono, ck);
      await p.ctx.close(); }
    // ---- the foot-bot on Normal: section order, first spawns, boss reachable, clear rate
    { const p = await open(1280, 720); await enter(p, false); await p.evaluate(BOT); if (process.env.DIAG) await p.evaluate(() => { window.__diag = 1; }); p.on('console', m => { if (/^STALL/.test(m.text())) console.log('   ' + m.text()); });
      // god run: the whole roster in order
      await p.evaluate(() => { window.__god = 1; document.getElementById('fMenu').hidden = true; FOOT.start('zeil'); });
      let g = null; for (let k = 0; k < 80 && !g; k++) g = await p.evaluate(() => { FOOT.sim(10); const S = FOOT.S; return S.end ? { end: S.end, seen: S.fs.seen, order: S.fs.order, secT: S.fs.secT, life: S.fs.life, left: S.fs.left, t: Math.round(S.time) } : null; });
      if (!g) console.log('   god stuck: ' + JSON.stringify(await p.evaluate(() => { const S = FOOT.S; return { t: Math.round(S.time), sec: S.cpN, x: Math.round(S.P.x), lock: S.lock, bossOn: S.bossOn, gate: S.boss && S.boss.gate, bm: S.boss && S.boss.mode, bhp: S.boss && S.boss.hp, E: S.E.filter(e => !e.dead).map(e => e.id + '@' + Math.round(e.x) + ',' + Math.round(e.y) + ':' + e.state) }; })));
      await p.evaluate(() => { window.__god = 0; });
      if (!g) ok('god bot finishes the stage', false); else {
        const bad = ORDER.filter(([id, sec]) => !g.seen[id] || g.seen[id].sec !== sec).map(([id, sec]) => id + ' want ' + sec + ' got ' + (g.seen[id] ? g.seen[id].sec : '-'));
        ok('section order: every enemy type first spawns in its own section (' + ORDER.map(o => o[0]).join(' > ') + ')', !bad.length, bad);
        const ord = g.order.filter(id => ORDER.some(o => o[0] === id)), idx = ord.map(id => ORDER.find(o => o[0] === id)[1]);
        ok('roster introduced section by section (first-seen order never goes back a section)', idx.every((v, i) => !i || v >= idx[i - 1]), ord);
                const L = g.life.slice().sort((a, b) => a - b); ok('no enemy leaves the screen alive', g.left === 0, g.left);
        console.log('   god run: ' + (g.end.cleared ? 'CLEAR' : 'down') + ' t' + g.t + ' sections at ' + g.secT.join(',') + ' kills on screen median ' + L[L.length >> 1].toFixed(2) + ' s');
        ok('boss reachable and beatable by the bot (god run clears)', g.end.cleared, g.end); }
      const runs = [];
      for (let r = 0; r < RUNS; r++) { await p.evaluate(() => { document.getElementById('fMenu').hidden = true; FOOT.start('zeil'); });
        let out = null, tries = 0, maxSec = 0, boss = false, med = null, bt = null; for (let k = 0; k < 120 && !out; k++) { out = await p.evaluate(() => { FOOT.sim(10); const S = FOOT.S; return S.end ? { end: S.end, sec: S.cpN | 0, cp: !!S.cp, boss: S.bossOn, t: Math.round(S.time), hurts: S.hurts, hl: (S.hlog || []).slice(-8).join(' '), med: S.fs.seen.medic ? S.fs.seen.medic.t : null, bt: S.fs.secT[7] || null, bhp: S.boss ? Math.round(S.boss.hp) : -1 } : null; });
          if (out && process.env.DIAG) console.log('   run ' + r + ' sec' + out.sec + ' t' + out.t + ' bhp' + out.bhp + ' ' + out.hl);
          if (out) { maxSec = Math.max(maxSec, out.sec); boss = boss || out.boss; if (out.med != null && !tries) med = out.med; if (out.bt != null && bt == null) bt = out.bt; }
          if (out && !out.end.cleared && tries < 2 && out.cp) { tries++; await p.evaluate(() => document.getElementById('fCp').click()); out = null; } }
        runs.push(out ? { clear: !!out.end.cleared, tries, sec: maxSec, boss, t: out.t, med, bt } : { stuck: 1 }); }
      const fs = await p.evaluate(() => window.__fs);
      const one = runs.filter(o => o.clear && !o.tries).length / RUNS, cl = runs.filter(o => o.clear).length / RUNS;
      console.log('   bot: ' + runs.map(o => o.stuck ? 'STUCK' : (o.clear ? 'CLEAR' : 'down@' + (o.sec + 1)) + '/r' + o.tries).join(' ') + ' | one-life ' + Math.round(one * 100) + '%, 3 lives ' + Math.round(cl * 100) + '%');
      const md = runs.map(o => o.med).filter(x => x != null).sort((a, b) => a - b), bts = runs.map(o => o.bt).filter(x => x != null).sort((a, b) => a - b);
      const tc = runs.filter(o => o.clear).map(o => o.t).sort((a, b) => a - b);
      ok('pacing: the roster arrives over the whole run (bot median medic >= 110 s) and a clear takes about 3-4 minutes (median 170-300 s)', md.length && md[md.length >> 1] >= 110 && tc.length && tc[tc.length >> 1] >= 170 && tc[tc.length >> 1] <= 300, { medic: md, boss: bts, clear: tc });
      ok('bot never stuck (every run ends)', runs.every(o => !o.stuck), runs);
      ok('boss reached by the bot', runs.some(o => o.boss), runs);
      ok('Normal: the foot-bot clears 60-90% (3 lives: <= 2 checkpoint retries), not trivial', cl >= .6 && cl < .9, Math.round(cl * 100) + '%');
      ok('no unseen damage: no enemy attacks from off screen', fs.unseen === 0, fs);
      ok('telegraphs: no new-enemy attack without a >= 0.4 s tell', fs.untel === 0, fs.untelBy);
      await p.ctx.close(); }
  } catch (e) { ok('test ran', false, e.stack.split('\n').slice(0, 4).join(' | ')); }
  ok('no page errors', !errs.length, errs.slice(0, 5));
  await br.close(); srv.kill(); if (rsrv) rsrv.kill();
  console.log((res.every(x => x) ? 'ALL PASS' : 'FAILED') + ' (' + res.filter(x => x).length + '/' + res.length + ')'); process.exit(res.every(x => x) ? 0 : 1);
})();
