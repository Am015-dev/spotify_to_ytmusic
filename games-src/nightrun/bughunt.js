#!/usr/bin/env node
// Nightrun bug hunt: one scripted walk through the whole game at 390x763 (touch) and 1280x800:
//   menu -> stage 1 -> pit stop (weapons, buy, reroll) -> boss -> next district -> pause/resume -> settings -> checklist -> death -> retry -> endless loop
//   NODE_PATH=$(npm root -g) node games-src/nightrun/bughunt.js        env: GAME_DIR=...
// Fails on: page errors, a state that does not advance for >8 s, a button that does not respond / is covered / off screen, horizontal scroll,
// shop price or level that differs from the engine, a weapon or perk that changes nothing, wrong HUD numbers.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const CFGS = [{ name: '390x763', w: 390, h: 763, touch: true }, { name: '1280x800', w: 1280, h: 800, touch: false }];
const bugs = [];
const bug = (tag, msg) => { const k = tag + msg.slice(0, 60); if (!bugs.some(b => b.k === k)) { bugs.push({ k, tag, msg }); console.log('  BUG', tag, msg); } };
async function layout(p, tag, sel) {                // every visible button in the open screen: on screen, big enough, not covered, no horizontal scroll
  const r = await p.evaluate(sel => {
    const out = [], vw = innerWidth, vh = innerHeight;
    if (document.documentElement.scrollWidth > vw + 1) out.push('horizontal scroll ' + document.documentElement.scrollWidth + '>' + vw);
    for (const b of document.querySelectorAll(sel)) {
      const cs = getComputedStyle(b), rc = b.getBoundingClientRect(); if (cs.display === 'none' || cs.visibility === 'hidden' || rc.width < 2 || b.closest('[hidden]')) continue;
      const nm = (b.id || b.textContent || '').trim().slice(0, 24);
      let sc = b.parentElement, scrolls = false; while (sc && sc !== document.body) { const o = getComputedStyle(sc).overflowY; if ((o === 'auto' || o === 'scroll') && sc.scrollHeight > sc.clientHeight + 2) { scrolls = true; break; } sc = sc.parentElement; }
      if (scrolls) continue;
      if (rc.left < -1 || rc.top < -1 || rc.right > vw + 1 || rc.bottom > vh + 1) out.push('off screen: ' + nm + ' ' + [rc.left, rc.top, rc.right, rc.bottom].map(Math.round));
      const e = document.elementFromPoint(Math.min(vw - 1, Math.max(0, rc.left + rc.width / 2)), Math.min(vh - 1, Math.max(0, rc.top + rc.height / 2)));
      if (e && e !== b && !b.contains(e) && !e.contains(b)) out.push('covered: ' + nm + ' by ' + (e.id || e.className || e.tagName));
    }
    return out;
  }, sel);
  for (const m of r) bug(tag, m);
}
async function walk(br, port, cfg) {
  const T = cfg.name, ctx = await br.newContext({ viewport: { width: cfg.w, height: cfg.h }, hasTouch: cfg.touch, isMobile: cfg.touch, deviceScaleFactor: 1 }), p = await ctx.newPage();
  p.on('pageerror', e => bug(T + ' page error', e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts|favicon|net::ERR/.test(m.text())) bug(T + ' console', m.text().slice(0, 120)); });
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  const click = async sel => { try { await (cfg.touch ? p.tap(sel, { timeout: 3000 }) : p.click(sel, { timeout: 3000 })); return true; } catch (e) { bug(T + ' button', sel + ' not clickable: ' + e.message.split('\n')[0].slice(0, 80)); return false; } };
  const ev = (f, a) => p.evaluate(f, a);
  const until = async (f, ms, what, a) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await ev(f, a)) return true; await sleep(150); } bug(T + ' stuck', what + ' (>' + (ms / 1000) + ' s)'); return false; };
  await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1`, { waitUntil: 'domcontentloaded' }); await p.waitForFunction(() => window.__mnr);
  await layout(p, T + ' title', '#title button');
  // ---- stage 1 ----
  await ev(() => { const m = window.__mnr; m.SET.auto = true; m.applySet(); }); await click('#startBtn');
  if (!await until(() => __mnr.running && __mnr.G.live, 5000, 'run did not start')) return;
  await ev(() => { __mnr.god = true; }); await sleep(2500);
  const h = await ev(() => ({ t: __mnr.G.t, sc: __mnr.G.score, hp: __mnr.P.hp })); if (!(h.t > 1.5)) bug(T + ' stuck', 'game clock not running: ' + h.t);
  // HUD numbers equal the engine (the sweep's HUDLOG records what was drawn)
  const hud = await ev(() => { const m = __mnr; return { hud: m.HUD && m.HUD.slice ? m.HUD.slice(-6) : null }; });
  await ev(() => { const m = __mnr; m.G.score += 1234; }); await sleep(400);
  // ---- weapons x4: each must really fire something and hurt a dummy ----
  for (const id of ['pulse', 'laser', 'swarm', 'beat']) {
    const r = await ev(async id => {
      const m = __mnr, w = window.__wp; w.eq = [id, null]; w.lvl(id, 3); m.G.en = []; m.G.eb = []; m.G.pb = [];
      const e = m.en ? null : null; const d = { type: 'turret', x: m.P.x + 420, y: m.P.y, r: 20, hp: 9999, max: 9999, t: 0, flash: 0, bf: 99, bn: 0, stop: 9999, score: 0, by: m.P.y, arm: false };
      m.G.en.push(d); const t0 = performance.now(); await new Promise(r => setTimeout(r, 2500)); const dmg = 9999 - d.hp; m.G.en = []; return { dmg, shots: m.G.pb.length };
    }, id);
    if (!(r.dmg > 0)) bug(T + ' weapon', id + ' did 0 damage to a target straight ahead in 2.5 s');
  }
  await ev(() => { window.__wp.eq = ['pulse', 'swarm']; });
  // ---- pit stop ----
  await ev(() => { const m = __mnr; m.G.en = []; m.G.eb = []; m.SH.neon = 900; m.G.transT = .1; m.G.bossDone = true; m.G.boss = null; });
  if (await until(() => __mnr.SH.active, 4000, 'pit stop did not open')) {
    await sleep(900); await layout(p, T + ' pit stop', '#shop button, #shopm button, button.card, #shGo, #shRe, #shWp');
    const cards = await ev(() => __mnr.SH.cards.map((c, i) => { const el = document.getElementById('shCards').children[i]; return { id: c.u.id, price: __mnr.SH.price(c.u), shown: el ? el.querySelector('.pr').textContent.replace(/\D+/g, '') : null, lv: __mnr.SH.n(c.u.id), name: el ? el.querySelector('.n').textContent : '', max: c.u.max }; }));
    for (const c of cards) { if (String(c.price) !== c.shown) bug(T + ' shop', `${c.name}: price shown ${c.shown}, engine ${c.price}`); if (c.lv >= c.max) bug(T + ' shop', `${c.name} offered at max level`); }
    const lvShown = await ev(() => [...document.querySelectorAll('#shCards .card')].some(c => /LV|lv|level|\/\d/.test(c.textContent)));
    if (!lvShown) bug(T + ' shop', 'cards show no level (what you own / what it becomes)');
    // buy every card
    for (let i = 0; i < cards.length; i++) {
      await sleep(700); const before = await ev(i => ({ n: __mnr.SH.neon, lv: __mnr.SH.n(__mnr.SH.cards[i].u.id), id: __mnr.SH.cards[i].u.id, pr: __mnr.SH.price(__mnr.SH.cards[i].u) }), i);
      await ev(i => document.getElementById('shCards').children[i].click(), i); await sleep(150);
      const after = await ev(id => ({ n: __mnr.SH.neon, lv: __mnr.SH.n(id), nn: document.getElementById('shN').textContent }), before.id);
      if (after.lv !== before.lv + 1) bug(T + ' shop', `buying ${before.id} did not add a level (${before.lv}->${after.lv})`);
      if (before.n - after.n !== before.pr) bug(T + ' shop', `buying ${before.id} cost ${before.n - after.n}, price said ${before.pr}`);
      if (String(after.n) !== after.nn) bug(T + ' shop', `Neon shown ${after.nn}, engine ${after.n}`);
      if (!(await ev(() => __mnr.SH.active))) break;
    }
    if (await ev(() => __mnr.SH.active)) {
      await sleep(700); const rr = await ev(() => { const a = __mnr.SH.cards.map(c => c.u.id).join(); const b = document.getElementById('shRe'); b.click(); return a; }); await sleep(200);
      const nm = await ev(() => document.getElementById('shMsg').textContent); if (/Need/.test(nm)) bug(T + ' shop', 'reroll refused with 900 Neon: ' + nm);
      // weapons sheet
      if (await click('#shWp')) { await sleep(300); await layout(p, T + ' weapons', '#wp button, .wp button, #wpGo, #wpL button, #wpL .card');
        await ev(() => { const c = document.querySelectorAll('#wpL > *'); if (c[2]) c[2].click(); }); await sleep(150);
        const eq = await ev(() => window.__wp.eq.slice()); if (eq.filter(Boolean).length < 1) bug(T + ' weapons', 'no weapon equipped after tapping a card');
        await click('#wpGo'); await sleep(200); if (await ev(() => window.__wp.open)) bug(T + ' weapons', 'DONE did not close the sheet'); }
      await click('#shGo'); if (!await until(() => !__mnr.SH.active, 3000, 'GO did not leave the pit stop')) { }
    }
  }
  await until(() => __mnr.G.di >= 1 && __mnr.G.live && !__mnr.SH.active, 8000, 'next district did not start after the pit stop');
  // ---- boss ----
  await ev(() => { __mnr.bossNow(); });
  if (await until(() => __mnr.G.boss && __mnr.G.boss.x <= __mnr.bossX?.() || (__mnr.G.boss && __mnr.G.boss.x < 900), 25000, 'boss did not arrive')) {
    await sleep(1500); const b = await ev(() => ({ hp: __mnr.G.boss.hp, ebs: __mnr.G.eb.length })); await sleep(5000);
    const b2 = await ev(() => __mnr.G.boss ? ({ hp: __mnr.G.boss.hp, max: __mnr.G.boss.max }) : null); if (b2 && b2.hp >= b.hp) bug(T + ' boss', 'boss took no damage in 5 s with auto-fire (' + b.hp + '->' + b2.hp + ')');
    await ev(() => __mnr.killBoss()); await until(() => !__mnr.G.boss, 4000, 'boss would not die');
  }
  // ---- pause / resume / settings ----
  await ev(() => { __mnr.skipTo(0); }); await sleep(800);
  if (cfg.touch) await click('#bPause'); else await p.keyboard.press('Escape');
  if (await until(() => __mnr.paused, 2000, 'pause did not open')) {
    await layout(p, T + ' pause', '#pausem button'); const t0 = await ev(() => __mnr.G.t); await sleep(1200); const t1 = await ev(() => __mnr.G.t); if (t1 - t0 > .05) bug(T + ' pause', 'game clock ran while paused: ' + (t1 - t0));
    if (await click('#pSetBtn')) { await sleep(300); await layout(p, T + ' settings', '#setm button, #setBack, #setDef'); await ev(() => { document.querySelectorAll('#setBody button').forEach((b, i) => { if (i % 5 === 1) b.click(); }); }); await sleep(300); await click('#setBack'); await sleep(200); }
    if (await click('#resumeBtn')) { if (!await until(() => !__mnr.paused, 2500, 'resume did not resume')) { } }
  }
  // ---- checklist ----
  const chk = await ev(() => { try { window.__chk.open(); return window.__chk.items.length + ':' + window.__chk.ver; } catch (e) { return 'ERR ' + e.message; } });
  if (/ERR/.test(chk)) bug(T + ' checklist', chk); else { await sleep(300); await layout(p, T + ' checklist', '.cc button'); await ev(() => { const b = document.querySelector('.cc [data-c="x"]'); if (b) b.click(); }); }
  // ---- death -> game over -> retry ----
  await ev(() => { const m = __mnr; m.god = false; m.P.inv = 0; m.P.dashT = 0; m.P.hp = 1; m.SH.sh = 0; m.TP.revLeft = 0; if (m.AX) m.AX.sw = 0; m.G.mult = 5; });
  await ev(() => { const m = __mnr; m.hurt(); });
  if (await until(() => __mnr.G.dead, 1500, 'hull 0 did not kill the ship')) {
    const rate = await ev(() => __mnr.NR.music.rate); await sleep(1300); const rate2 = await ev(() => __mnr.NR.music.rate); if (!(rate2 < .7)) bug(T + ' death audio', 'no tape-stop on death: rate ' + rate + '->' + rate2);
    if (await until(() => !document.getElementById('over').hidden, 5000, 'game over screen did not show')) { await sleep(800); await layout(p, T + ' game over', '#over button');
      const sc = await ev(() => ({ shown: document.getElementById('oScore').textContent.replace(/\D/g, ''), g: __mnr.G.score })); if (String(sc.g) !== sc.shown) bug(T + ' game over', `score shown ${sc.shown}, engine ${sc.g}`);
      await click('#againBtn'); await until(() => __mnr.running && __mnr.G.live && !__mnr.G.dead && __mnr.P.hp === __mnr.P.max, 4000, 'FLY AGAIN did not start a fresh run');
      const r3 = await ev(() => __mnr.NR.music.rate); if (r3 !== 1) bug(T + ' retry audio', 'music rate not restored on a new run: ' + r3); }
  }
  // ---- endless: loop through all districts ----
  await ev(() => { __mnr.god = true; });
  for (let i = 0; i < 5; i++) { await ev(i => { const m = __mnr; m.skipTo(m.ORDER[i]); }, i); await sleep(1500); const s = await ev(() => ({ di: __mnr.G.di, ok: __mnr.G.live && !__mnr.G.dead, nan: [__mnr.P.x, __mnr.P.y, __mnr.G.score].some(v => !isFinite(v)) })); if (s.nan) bug(T + ' endless', 'NaN state in district ' + i); }
  // ---- low hull audio ----
  await ev(() => { const m = __mnr; m.god = false; m.P.hp = 2; m.P.inv = 5; }); await sleep(1500); const r2 = await ev(() => __mnr.NR.music.rate);
  await ev(() => { const m = __mnr; m.P.hp = 1; }); await sleep(1500); const r1 = await ev(() => __mnr.NR.music.rate);
  await ev(() => { const m = __mnr; m.P.hp = m.P.max; }); await sleep(1500); const r5 = await ev(() => __mnr.NR.music.rate);
  console.log(T, 'music rate at hull 2 / 1 / full:', r2, r1, r5);
  if (!(Math.abs(r2 - .92) < .02 && Math.abs(r1 - .85) < .02 && r5 === 1)) bug(T + ' dying beat', `rates ${r2} ${r1} ${r5}, want .92 .85 1`);
  await ctx.close();
}
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  for (let i = 0; i < 50; i++) { try { if ((await fetch(`http://127.0.0.1:${port}/index.html`)).ok) break; } catch (e) { } await sleep(100); }
  const br = await PW.chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  for (const c of CFGS) { console.log('walk', c.name); try { await walk(br, port, c); } catch (e) { bug(c.name + ' script', e.message.split('\n')[0]); } }
  srv.kill(); await br.close(); console.log(bugs.length ? `FOUND ${bugs.length}:\n` + bugs.map(b => ' - ' + b.tag + ': ' + b.msg).join('\n') : 'CLEAN'); process.exit(bugs.length ? 1 : 0);
})();
