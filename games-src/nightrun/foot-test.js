#!/usr/bin/env node
// FOOT (parts/foot.js): the on-foot street stage. Headless, no screenshots. Prints PASS/FAIL lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/foot-test.js     env: GAME_DIR=...  RUNS=n (bot runs per size, default 2)
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun'), RUNS = +process.env.RUNS || 4;
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
const res = [], ok = (n, p, i) => { res.push(!!p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || i == null ? '' : ' :: ' + (typeof i === 'string' ? i : JSON.stringify(i)))); };
const STORY = JSON.stringify({ stars: { 1: 3, 2: 3, 3: 2 }, snap: {}, all: false, v30: 1, v40: 1 });
// the scripted bot: runs right, faces and shoots the nearest enemy, hops over bullets, knifes close enemies, bombs crowds, dashes on the beat
const BOT = () => { window.__fl = { up: 0, down: 0, pick: 0, kill: 0, cp: 0, lv5: 0 };
  NR.on('footLevel', d => { if (d.up) { __fl.up++; if (d.lv >= 5) __fl.lv5++; } else __fl.down++; }); NR.on('footPick', () => __fl.pick++); NR.on('footKill', () => __fl.kill++); NR.on('footCp', () => __fl.cp++);
  FOOT.ctl = (S, I) => { const P = S.P; if (window.__god) P.hp = P.max; let near = null, nd = 1e9; for (const e of S.E) { if (e.dead || e.x < S.camX - 5) continue; const d = Math.abs(e.x - P.x) + Math.abs(e.y - P.y) * .5; if (d < nd) { nd = d; near = e; } }
    I.l = I.r = I.u = I.d = 0; I.fire = 1;
    let th = null; const bx = { l: P.x - 24, r: P.x + 24, t: P.y - 74, b: P.y + 4 };
    for (const b of S.eb) { for (const t of [.08, .16, .24, .32, .4, .5]) { const x = b.x + b.vx * t, y = b.y + b.vy * t + (b.grav ? 430 * t * t : 0); if (x > bx.l && x < bx.r && y > bx.t && y < bx.b) { th = b; break; } } if (th) break; }
    const danger = !!th;
    let gnd = null, gd = 1e9; for (const e of S.E) { if (e.dead || e.fly || e.y < P.y - 100 || e.x < S.camX - 5) continue; const d = Math.abs(e.x - P.x); if (d < gd) { gd = d; gnd = e; } }
    if (gnd && gd < 500) near = gnd;
    if (near) { const dx = near.x - P.x, dy = (near.y - near.h / 2) - (P.y - 44), r = Math.abs(dy) / Math.max(1, Math.abs(dx)); P.facing = dx > 0 ? 1 : -1;
      if (Math.abs(dx) < 70 && near.y > P.y - 90) { if (!S._mc || S.time - S._mc > .35) { I.meleeP = 1; S._mc = S.time; } }
      if (dy < -40 && r > .45) { I.u = 1; if (r < 2.2) I[dx > 0 ? 'r' : 'l'] = 1; else if (Math.abs(dx) > 25) I[dx > 0 ? 'r' : 'l'] = 1; }
      else if (dx > 200 || dx < -260) I[dx > 0 ? 'r' : 'l'] = 1; }
    else I.r = 1;
    if (danger) { const above = Math.abs(th.vy) > Math.abs(th.vx); if (above) { I.l = I.r = 0; I[th.vx > 0 || (!th.vx && P.x < S.camX + 200) ? 'r' : 'l'] = 1; if (P.dashCd <= 0) { P.facing = I.r ? 1 : -1; I.dashP = 1; } }
      else if (P.onGround) { I.jumpP = 1; I.jump = 1; } else if (P.dashCd <= 0 && th.y < P.y - 20) I.dashP = 1; else I.jump = 1; } else I.jump = P.vy < 0 ? 1 : 0;
    if (near && /shield|bruiser|mech|warden/.test(near.id) && Math.abs(near.x - P.x) < 320 && P.bombs > 0 && (!S._bt || S.time - S._bt > 2.5)) { I.bombP = 1; S._bt = S.time; }
    if (S.E.filter(e => !e.dead).length >= 5 && P.bombs > 0 && (!S._bt || S.time - S._bt > 3)) { I.bombP = 1; S._bt = S.time; }
    for (const p of S.pk) if (Math.abs(p.x - P.x) < 300 && p.x > S.camX + 24 && !near) { I.r = p.x > P.x; I.l = p.x < P.x; } }; };
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(700);
  const br = await PW.chromium.launch(), errs = [];
  const open = async (w, h, q = '', o = {}) => { const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: !!o.touch, isMobile: !!o.touch });
    await ctx.addInitScript(([s, keep]) => { try { if (!sessionStorage.getItem('_ft')) { sessionStorage.setItem('_ft', 1); if (!keep) localStorage.clear(); localStorage.setItem('mnr_story', s); localStorage.setItem('mnr_tut', '2'); } } catch (e) {} }, [o.story === false ? '{}' : STORY, !!o.keep]);
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(w + 'x' + h + ' ' + e.message)); await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1${q}`, { waitUntil: 'domcontentloaded' });
    await p.waitForFunction(() => window.__mnr && document.getElementById('moreBtn'), null, { timeout: 15000 }); await sleep(400); p.ctx = ctx; return p; };
  const enter = async (p, touch) => { await p.evaluate(() => document.getElementById('moreBtn').click()); await sleep(200);
    const b = await p.$('#footBtn'); if (!b) return 'no button'; if (await b.isDisabled()) return 'locked';
    if (touch) await b.tap(); else await b.click(); await sleep(300); await p.waitForFunction(() => FOOT.on, null, { timeout: 12000 }).catch(() => {});
    for (let i = 0; i < 6 && !(await p.evaluate(() => FOOT.on)); i++) { await p.evaluate(() => { const c = document.getElementById('taleCard'); if (c && !c.hidden) (document.getElementById('taleTc') || c).click(); }); await sleep(250); }
    return (await p.evaluate(() => FOOT.on)) ? 'on' : 'not started'; };
  // layout audit: controls 44px+ inside the screen, never over the play box, no button on another or on the stick circle (8 px gaps), hint strip clear of the HUD, field size
  const audit = p => p.evaluate(() => { const o = { small: [], out: [], over: [], gap: [], stick: [], hint: [], field: [], scroll: document.documentElement.scrollWidth > innerWidth + 1 };
    const I = FOOT.hudInfo(), cv = document.getElementById('footC').getBoundingClientRect(), W = innerWidth, H = innerHeight, bx = I.box, touch = I.mode !== 'full';
    if (cv.left < -.5 || cv.top < -.5 || cv.right > W + .5 || cv.bottom > H + .5) o.out.push('canvas');
    const hit = (a, c, m) => a.left < c.right - 1 + m && a.right > c.left + 1 - m && a.top < c.bottom - 1 + m && a.bottom > c.top + 1 - m;
    const play = { left: bx.x, top: bx.y, right: bx.x + bx.w, bottom: bx.y + bx.h };
    for (const b of document.querySelectorAll('#footL .fb,#footL .fpad,#fPause')) { if (b.hidden || b.style.display === 'none') continue; const r = b.getBoundingClientRect();
      if (r.width < 44 || r.height < 44) o.small.push(b.id); if (r.left < 0 || r.top < 0 || r.right > W || r.bottom > H) o.out.push(b.id);
      if (b.id !== 'fPause' && hit(r, play, 0)) o.over.push(b.id); }
    const bs = [...document.querySelectorAll('#footL .fb')].filter(b => b.style.display !== 'none').map(b => [b.id, b.getBoundingClientRect()]);
    for (let i = 0; i < bs.length; i++) for (let j = i + 1; j < bs.length; j++) if (hit(bs[i][1], bs[j][1], 8)) o.gap.push(bs[i][0] + '/' + bs[j][0]);
    const sk = document.getElementById('fStick'); if (sk.style.display !== 'none') { const c = sk.getBoundingClientRect(), R = c.width / 2, cx = c.left + R, cy = c.top + R;
      for (const [id, r] of bs) { const nx = Math.max(r.left, Math.min(cx, r.right)), ny = Math.max(r.top, Math.min(cy, r.bottom)); if (Math.hypot(nx - cx, ny - cy) < R + 8) o.stick.push(id); } }
    const u = 1 / I.sc, h = I.hud; if (h && h.hint) { const t = h.hint; if (t.x < 0 || t.x + t.w > h.vw + .5) o.hint.push('outside'); for (const q of h.hud) if (t.x < q.x + q.w && t.x + t.w > q.x && t.y < q.y + q.h && t.y + t.h > q.y) o.hint.push('HUD'); }
    if (touch) { if (I.mode === 'port' && bx.h < H * .58) o.field.push('port ' + bx.h + '/' + H); if (I.mode === 'land' && (bx.h < H - 2 || cv.width < W - 1)) o.field.push('land ' + bx.h + '/' + H); if (bx.w < 420 * I.sc - 1) o.field.push('narrow'); }
    return o; });
  const clean = a => !a.small.length && !a.out.length && !a.over.length && !a.gap.length && !a.stick.length && !a.hint.length && !a.field.length && !a.scroll;
  try {
    // ---- flag off: no UI at all
    { const p = await open(390, 763, '&foot=0', { touch: true }); await p.evaluate(() => document.getElementById('moreBtn').click()); await sleep(300);
      const r = await p.evaluate(() => ({ btn: !!document.getElementById('footBtn'), layer: !!document.getElementById('footL'), st: FOOT.start('street1') }));
      ok('flag off: no button, no layer, start() refused', !r.btn && !r.layer && r.st === false, r); await p.ctx.close(); }
    // ---- locked before stage 3
    { const p = await open(390, 763, '', { touch: true, story: false }); const r = await enter(p, true); ok('locked until story stage 3 is cleared', r === 'locked', r); await p.ctx.close(); }
    for (const [w, h, name, touch] of [[390, 763, 'phone', true], [375, 553, 'phone-s', true], [1280, 720, 'desktop', false]]) {
      const p = await open(w, h, '', { touch }); const st = await enter(p, touch); ok(name + ': STREET RUN opens the stage', st === 'on', st);
      if (st !== 'on') { await p.ctx.close(); continue; }
      await sleep(300); const a = await audit(p); ok(name + ': layout audit (44px+, 8px gaps, off the stick, hint clear of the HUD, field size)', clean(a), a);
      const mode = await p.evaluate(() => [FOOT.S && document.getElementById('fStick').style.display !== 'none', document.getElementById('fJump').style.display !== 'none']);
      ok(name + ': touch pad shown only on touch screens', touch ? mode[0] && mode[1] : !mode[0] && !mode[1], mode);
      if (touch) { const au = await p.evaluate(() => { const o = { on: FOOT.autoOn(), fire: document.getElementById('fFire').style.display }; const S = FOOT.S; S.E.length = 0; const e = FOOT.env.spawn('grunt', S.P.x + 220, null); e.grace = 99; const s0 = S.shots; FOOT.sim(1.2); o.shots = S.shots - s0; S.E.length = 0; S.eb.length = 0; S.P.hp = S.P.max; return o; });
        ok(name + ': auto-fire is ON by default on touch (FIRE hidden) and shoots at an enemy ahead', au.on && au.fire === 'none' && au.shots >= 3, au);
        await p.evaluate(() => { FOOT.setAuto(false); FOOT.layout(); }); await sleep(100); const a3 = await audit(p); ok(name + ': auto-fire OFF: FIRE cluster passes the layout audit', clean(a3), a3); }
      // ---- input through the real page
      const x0 = await p.evaluate(() => FOOT.S.P.x);
      if (touch) { const r = await p.$eval('#fStick', e => { const b = e.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2, b.width]; });
        await p.mouse.move(r[0], r[1]); await p.mouse.down(); await p.mouse.move(r[0] + r[2] * .45, r[1], { steps: 3 }); await sleep(900); await p.mouse.up();
        const x1 = await p.evaluate(() => FOOT.S.P.x); ok(name + ': stick drag runs right', x1 > x0 + 80, [x0, x1]);
        const s0 = await p.evaluate(() => FOOT.S.shots); const f = await p.$eval('#fFire', e => { const b = e.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; });
        await p.mouse.move(f[0], f[1]); await p.mouse.down(); await sleep(600); await p.mouse.up();
        const s1 = await p.evaluate(() => FOOT.S.shots); ok(name + ': FIRE held shoots', s1 > s0 + 1, [s0, s1]);
        await p.touchscreen.tap(...await p.$eval('#fJump', e => { const b = e.getBoundingClientRect(); return [b.left + b.width / 2, b.top + b.height / 2]; })); await sleep(120);
        ok(name + ': JUMP tap leaves the ground', await p.evaluate(() => !FOOT.S.P.onGround || FOOT.S.P.vy !== 0));
      } else { await p.keyboard.down('KeyD'); await sleep(900); await p.keyboard.up('KeyD'); const x1 = await p.evaluate(() => FOOT.S.P.x); ok(name + ': D runs right', x1 > x0 + 80, [x0, x1]);
        const s0 = await p.evaluate(() => FOOT.S.shots); await p.keyboard.down('KeyJ'); await sleep(600); await p.keyboard.up('KeyJ'); ok(name + ': J shoots', (await p.evaluate(() => FOOT.S.shots)) > s0 + 1);
        await p.keyboard.down('KeyK'); await sleep(120); ok(name + ': K jumps', await p.evaluate(() => !FOOT.S.P.onGround)); await p.keyboard.up('KeyK');
        await p.keyboard.press('Escape'); await sleep(150); ok(name + ': Esc pauses (menu, buttons 44px+)', await p.evaluate(() => FOOT.S.paused && !document.getElementById('fMenu').hidden && [...document.querySelectorAll('#fMenu button')].every(b => b.getBoundingClientRect().height >= 44)));
        await p.click('#fResume'); await sleep(100); ok(name + ': RESUME', await p.evaluate(() => !FOOT.S.paused)); }
      // ---- hint text matches the ghost finger
      // ---- scripted bot: full stage
      await p.evaluate(BOT); if (process.env.GOD) await p.evaluate(() => { window.__god = 1; }); if (process.env.TRACE) { await p.evaluate(() => { window.__trace = 1; }); p.on('console', m => { if (/^TR/.test(m.text())) console.log(m.text()); }); } const runs = [];
      for (let r = 0; r < RUNS; r++) { await p.evaluate(() => { document.getElementById('fMenu').hidden = true; FOOT.start('street1'); });
        let out = null, tries = 0; for (let k = 0; k < 160 && !out; k++) { out = await p.evaluate(() => { FOOT.sim(10); const S = FOOT.S; if (window.__trace) console.log('TR t' + Math.round(S.time) + ' x' + Math.round(S.P.x) + ' cam' + Math.round(S.camX) + ' lock' + (S.lock && S.lock.id) + ' w' + S.P.w + S.P.lv + ' k' + S.kills + ' sh' + S.shots + ' E' + S.E.filter(e => !e.dead).map(e => e.id[0] + Math.round(e.x - S.P.x) + (e.grace > 0 ? 'g' : '')).join(',')); return S.end ? { end: S.end, t: Math.round(S.time), boss: !!S.boss, bossOn: S.bossOn, cp: !!S.cp, x: Math.round(S.P.x), hurts: S.hurts, hl: (S.hlog || []).join(' ') } : null; });
          if (out && !out.end.cleared && tries < 6) { tries++; const cpB = out.cp; await p.evaluate(c => document.getElementById(c ? 'fCp' : 'fAgain').click(), cpB); out = null; } }   // a player retries from the checkpoint
        if (out) out.tries = tries;
        out = out || await p.evaluate(() => ({ stuck: 1, t: FOOT.S.time, x: FOOT.S.P.x, lock: FOOT.S.lock, E: FOOT.S.E.filter(e => !e.dead).map(e => e.id + '@' + Math.round(e.x) + ',' + Math.round(e.y)) }));
        runs.push(out); }
      const fl = await p.evaluate(() => window.__fl);
      console.log('   ' + name + ' bot: ' + runs.map(o => o.end ? (o.end.cleared ? 'CLEAR ' + o.end.rank : 'down') + ' t' + o.t + ' retries' + o.tries + ' x' + o.x + ' hurts' + o.hurts + '[' + o.hl + ']' + (o.bossOn ? ' boss' : '') + ' score' + o.end.score : 'STUCK').join(' | ') + ' :: ' + JSON.stringify(fl));
      ok(name + ': bot never stuck (every run ends)', runs.every(o => o.end), runs.filter(o => !o.end));
      ok(name + ': bot reaches the checkpoint and the boss', runs.some(o => o.cp && o.bossOn), runs);
      ok(name + ': a bot run lasts 2-6 minutes', runs.some(o => o.end && o.end.cleared ? o.t >= 120 && o.t <= 360 : o.t > 60), runs.map(o => o.t));
      ok(name + ': weapons level up and down, pickups collected, kills', fl.up > 2 && fl.down > 0 && fl.pick > 3 && fl.kill > 20, fl);
      // results screen
      await p.evaluate(() => { FOOT.ctl = null; }); const rs = await p.evaluate(() => { const m = document.getElementById('fMenu'); return { shown: !m.hidden, btn: [...m.querySelectorAll('button')].map(b => [b.textContent, Math.round(b.getBoundingClientRect().height)]) }; });
      ok(name + ': results screen with RETRY / FLY ON / BACK TO CITY (44px+)', rs.shown && rs.btn.length >= 3 && rs.btn.every(b => b[1] >= 44) && rs.btn.some(b => b[0] === 'FLY ON'), rs);
      if (name === 'phone') { // rotation: landscape keeps the controls off the play area
        await p.setViewportSize({ width: 763, height: 390 }); await sleep(700); await p.evaluate(() => { document.getElementById('fMenu').hidden = true; FOOT.layout(); });
        const a2 = await audit(p); ok('phone rotated: controls beside the play area, field fills the screen', clean(a2), a2);
        await p.setViewportSize({ width: 390, height: 763 }); await sleep(700); }
      await p.evaluate(() => { document.getElementById('fMenu').hidden = false; }); await p.click('#fCity'); await sleep(400);
      for (let i = 0; i < 6; i++) { await p.evaluate(() => { const c = document.getElementById('taleCard'); if (c && !c.hidden) (document.getElementById('taleTc') || c).click(); }); await sleep(150); }
      ok(name + ': BACK TO CITY closes the layer', await p.evaluate(() => !FOOT.on && document.getElementById('footL').hidden));
      await p.ctx.close(); }
    // ---- landscape phones: the field is the whole screen, the pad sits over the side bands
    for (const [w, h] of [[763, 390], [844, 390]]) { const p = await open(w, h, '', { touch: true }); const st = await enter(p, true); ok('land ' + w + 'x' + h + ': STREET RUN opens', st === 'on', st); if (st !== 'on') { await p.ctx.close(); continue; }
      await sleep(400); for (const au of [true, false]) { await p.evaluate(a => { FOOT.setAuto(a); FOOT.layout(); }, au); await sleep(150); const a = await audit(p); ok('land ' + w + 'x' + h + ' auto-fire ' + (au ? 'ON' : 'OFF') + ': layout audit', clean(a), a); }
      await p.ctx.close(); }
    // ---- pause menu toggles auto-fire (touch), the choice is saved
    { const p = await open(390, 763, '', { touch: true }); const st = await enter(p, true); if (st === 'on') { await p.evaluate(() => { FOOT.step(1 / 60); document.getElementById('fPause').click(); }); await sleep(150);
        const t0 = await p.evaluate(() => document.getElementById('fAuto') && document.getElementById('fAuto').textContent); await p.click('#fAuto'); await sleep(150);
        const t1 = await p.evaluate(() => [document.getElementById('fAuto').textContent, document.getElementById('fFire').style.display, JSON.parse(localStorage.getItem('mnr_foot') || '{}').auto]);
        ok('pause menu: AUTO-FIRE toggle (ON -> OFF), FIRE appears, saved', t0 === 'AUTO-FIRE: ON' && t1[0] === 'AUTO-FIRE: OFF' && t1[1] !== 'none' && t1[2] === 0, [t0, t1]); }
      else ok('pause toggle: stage opens', false, st); await p.ctx.close(); }
    // ---- stats see the on-foot run
    { const p = await open(390, 763, '', { touch: true }); const st = await enter(p, true); if (st === 'on') { const r = await p.evaluate(() => { const g = () => JSON.parse(localStorage.getItem('mnr_stats') || '{"s":{}}').s, a = g(); const S = FOOT.S; S.P.hp = S.P.max;
          const e = FOOT.env.spawn('grunt', S.P.x + 200, null); e.hp = .01; e.grace = 0; S.E.forEach(x => x.hp = .01); FOOT.sim(1.5); FOOT.S.end || FOOT.stop(); return { a, f: window.RET && RET.st ? 1 : 0 }; }); await sleep(1800);
        const b = await p.evaluate(() => JSON.parse(localStorage.getItem('mnr_stats') || '{"s":{}}').s);
        ok('stats: on-foot run counted (runs, kills, time)', (b.runs | 0) > (r.a.runs | 0) && (b.kills | 0) > (r.a.kills | 0) && (b.time | 0) >= (r.a.time | 0), [r.a, b]); }
      else ok('stats: stage opens', false, st); await p.ctx.close(); }
    // ---- unit checks on the engine (desktop page)
    { const p = await open(1280, 720); await enter(p, false); await p.evaluate(() => { FOOT.stop(); FOOT.start('street1'); });   // engine unit checks on the street1 mock (footstage.js has its own test)
      const u = await p.evaluate(() => { const S = FOOT.S, P = S.P, o = {}; P.inv = 0; P.dashIF = 0;
        const give = k => { S.pk.push({ k, x: P.x, y: P.y - 36, vy: 0, t: 0, on: true }); FOOT.step(1 / 60); };
        give('w_hmg'); o.hmg1 = P.w + P.lv; for (let i = 0; i < 6; i++) give('w_hmg'); o.hmg5 = P.w + P.lv;
        const hit = () => { P.inv = 0; P.dashIF = 0; S.eb.push({ x: P.x, y: P.y - 30, vx: 0, vy: 0, r: 6, dmg: 1, life: 1 }); FOOT.step(1 / 60); };
        P.hp = 9; P.max = 9; hit(); o.afterHit = P.w + P.lv; for (let i = 0; i < 4; i++) hit(); o.lost = P.w + P.lv;
        give('shield'); give('shield'); o.sh = P.pw.shield && P.pw.shield.lv; const hp = P.hp; hit(); o.block = P.hp === hp;
        give('dbl'); give('dbl'); give('dbl'); give('dbl'); o.dbl = P.pw.dbl.lv; give('bomb'); o.bombs = P.bombs; P.hp = 1; give('heal'); o.heal = P.hp;
        give('slow'); give('magnet'); give('speed'); o.pw = Object.keys(P.pw).sort().join(',');
        const e = S.E[0] || null; o.cap = (() => { for (let i = 0; i < 200; i++) FOOT.env.shoot({ x: P.x + 300, y: P.y, w: 30, h: 60, facing: -1, grace: 0, tele: 0 }, Math.PI, 300, 1); S.time += 2; for (let i = 0; i < 60; i++) FOOT.step(1 / 60); return S.eb.length; })();
        return o; });
      ok('weapon: pickup = LV1, same pickup up to LV5 (cap)', u.hmg1 === 'hmg1' && u.hmg5 === 'hmg5', u);
      ok('weapon: a hit drops one level, LV0 = back to the pistol', u.afterHit === 'hmg4' && u.lost === 'pistol1', u);
      ok('power-ups: shield levels and blocks, double damage caps at LV3, bomb, heal, slow/magnet/speed', u.sh === 2 && u.block && u.dbl === 3 && u.bombs === 3 && u.heal === 2 && /magnet/.test(u.pw) && /slow/.test(u.pw) && /speed/.test(u.pw), u);
      ok('enemy bullets are capped', u.cap <= 40, u.cap);
      // telegraph: a queued shot never leaves before 0.4 s
      const tg = await p.evaluate(() => { FOOT.start('street1'); const S = FOOT.S; S.eb.length = 0; const e = { x: S.P.x + 300, y: S.P.y, w: 30, h: 60, facing: -1, grace: 0, tele: 0 }; FOOT.env.shoot(e, Math.PI, 300, 1); let t = 0; while (!S.eb.length && t < 3) { FOOT.step(1 / 60); t += 1 / 60; } return t; });
      ok('telegraph >= 0.4 s before every enemy shot', tg >= .39, tg);
      // checkpoint retry
      const cpr = await p.evaluate(() => { FOOT.start('street1'); const S = FOOT.S; S.P.x = S.st.cp + 5; S.P.maxX = S.P.x; S.camX = S.P.x - 300; FOOT.step(1 / 60); const had = !!S.cp; S.P.hp = 0; S.P.inv = 0; S.dead = .01; FOOT.step(1 / 30);
        const btn = document.getElementById('fCp'); if (btn) btn.click(); return { had, btn: !!btn, x: FOOT.S.P.x, cp: FOOT.S.st.cp, used: FOOT.S.cpUsed }; });
      ok('checkpoint: reached, FROM CHECKPOINT restarts there', cpr.had && cpr.btn && cpr.x >= cpr.cp && cpr.used, cpr);
      // idle hero dies
      const idle = await p.evaluate(() => { FOOT.ctl = null; document.getElementById('fMenu').hidden = true; FOOT.start('street1'); FOOT.sim(150); const S = FOOT.S; return { end: !!S.end, cleared: S.end && S.end.cleared, t: Math.round(S.time) }; });
      ok('idle hero goes down (no free win)', idle.end && !idle.cleared, idle);
      // save round trip
      const sv = await p.evaluate(() => { const S = FOOT.S; const k = RET.sioKeys.indexOf('mnr_foot') >= 0; FOOT.save().best.street1 = { score: 1234, rank: 'B', time: 200 }; localStorage.setItem('mnr_foot', JSON.stringify(FOOT.save())); return { k, raw: localStorage.getItem('mnr_foot') }; });
      ok('save: mnr_foot in the export list', sv.k, sv);
      await p.reload({ waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr && window.FOOT, null, { timeout: 15000 }); await sleep(300);
      ok('save: best survives a reload', await p.evaluate(() => FOOT.save().best.street1 && FOOT.save().best.street1.score === 1234));
      await p.ctx.close(); }
    ok('no page errors', !errs.length, errs.slice(0, 5));
  } catch (e) { ok('test crashed', false, e.stack); }
  await br.close(); srv.kill();
  const f = res.filter(x => !x).length; console.log(f ? f + ' FAILED' : 'ALL PASS (' + res.length + ')'); process.exit(f ? 1 : 0);
})();
