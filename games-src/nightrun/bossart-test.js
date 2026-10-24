#!/usr/bin/env node
// Boss art states, stepped (prints pass/fail only):  NODE_PATH=$(npm root -g) node games-src/nightrun/bossart-test.js
//   env: GAME_DIR=<dir with index.html>, ONLY=kronos,hoplite, FLAG=0 (A/B: ?bossart=0), STEPS=3600 (frames per boss, 60 per game second)
// Every flight boss is fought through the real page in stepped simulation (__mnr.step + render, no waits, far above x200).
// Each rendered frame records which strip the boss drew (idle / attack / hit / defeat; STILL = the single picture). Gates:
//  attack drawn on >= 90% of the frames where the boss winds up or fires (e.arm, e.fireT > 0 or a move zone telegraphing / striking) that are not a hit frame; hit drawn within 1 frame of every damage;
//  defeat strip plays in full on the kill; 0 still-picture frames while the boss is on screen.
const PW = require('playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun'), ONLY = (process.env.ONLY || '').split(',').filter(Boolean);
const STEPS = +process.env.STEPS || 3600, QX = process.env.FLAG === '0' ? '&bossart=0' : '';
const IDS = ['sek-adler', 'flusskrake', 'zentral-ice', 'kronos', 'tresor-wart', 'bruecken-waechter', 'schranken-wart', 'messe-waechter', 'hoplite', 'talos'];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const fp = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const PAGE = (steps) => {
  const m = window.__mnr, G = m.G, ART = m.ART, SPR = m.SPR;
  const o = { atk: 0, atkOk: 0, still: 0, dmg: 0, hitLate: 0, kill: false, defFrames: 0, defTot: 0, states: {}, bad: [] };
  let keys = [], ret, defKey; const od = ART.drawAnim, os = SPR.boss;
  ART.drawAnim = function (c, key) { const mt = /^boss-[^/]+\/(idle|attack|hit|defeat)$/.exec(key); if (mt) { keys.push(mt[1]); if (mt[1] === 'defeat') defKey = key; } return od.apply(this, arguments); };
  SPR.boss = function () { ret = os.apply(this, arguments); return ret; };
  if (!G.boss) return { err: 'no boss' };
  let pend = -1, killAt = -1;
  for (let i = 0; i < steps; i++) {
    const b = G.boss; m.P.hp = 99; 
    if (b) { if (killAt < 0 && b.hp < 1) b.hp = 1; if (i % 90 === 45) { b.hp -= Math.max(1, b.max * .004); b.flash = Math.max(b.flash, .06); pend = 1; o.dmg++; } if (i === Math.floor(steps * .8) && killAt < 0) killAt = i;
      if (killAt >= 0) { b.bmG = null; if (b.b2) b.b2.ref = -1; b.minBar = 0; b.floor = 0; b.hp = -1; } }   // the kill: armour and guard floors off
    keys = []; ret = undefined;
    const r0 = b && b.r; if (b) b.r = -4;   // the ship's own shots cannot reach the boss during the step, so the only damage is the scripted one
    try { m.step(1 / 60); if (b) b.r = r0; m.render(G.t, 1 / 60); } catch (e) { o.bad.push('throw ' + String(e.message).slice(0, 80)); break; }
    const live = keys.filter(k => k !== 'defeat');
    if (G.boss && G.boss.x < 960) {
      const e = G.boss, key = live[0];
      if (ret === false || !key) { o.still++; if (o.bad.length < 3) o.bad.push(`f${i} ret=${ret} x=${Math.round(e.x)}`); } else o.states[key] = (o.states[key] || 0) + 1;
      const acts = e.ph !== undefined && (e.arm || e.fireT > 0 || (window.BMV && BMV.hz.some(z => !z.mk && G.t >= z.t0 && G.t < z.on + .42)));
      if (acts && key !== 'hit') { o.atk++; if (key === 'attack') o.atkOk++; }   // a hit frame overrides the attack by design
      if (pend >= 0) { if (key === 'hit') pend = -1; else if (pend-- === 0) o.hitLate++; }
    } else if (killAt >= 0) { o.kill = true; if (keys.includes('defeat')) { o.defFrames++; if (!o.defTot) o.defTot = ART.aS(defKey).tot; } else if (o.defFrames) break; }
  }
  ART.drawAnim = od; SPR.boss = os; return o;
};
(async () => {
  const fails = [], lines = [], port = await fp(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' }); await sleep(700);
  const br = await PW.chromium.launch();
  for (const id of IDS) {
    if (ONLY.length && !ONLY.includes(id)) continue;
    const ctx = await br.newContext({ viewport: { width: 390, height: 763 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true }), p = await ctx.newPage();
    p.on('pageerror', e => fails.push(`${id}: page error ${e.message}`)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    await p.addInitScript(() => { try { localStorage.setItem('mnr_tipdone', 'true'); localStorage.setItem('mnr_fscard', '99'); } catch (e) { } });
    await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1&bpauto=1&boss=${id}${QX}`);
    try { await p.waitForFunction(() => window.__mnr && __mnr.G.boss && __mnr.G.boss.x <= 791, null, { timeout: 25000 }); } catch (e) { fails.push(`${id}: boss did not arrive`); await ctx.close(); continue; }
    await p.addStyleTag({ content: '#labP{display:none!important}' });
    const r = await p.evaluate(`(${PAGE.toString()})(${STEPS})`);
    if (r.err) { fails.push(`${id}: ${r.err}`); await ctx.close(); continue; }
    const pct = r.atk ? r.atkOk / r.atk : 1, bad = [], need = Math.floor(r.defTot * 60) - 2;
    if (pct < .9) bad.push(`attack drawn ${(pct * 100).toFixed(0)}% of ${r.atk} attack frames`);
    if (r.hitLate) bad.push(`${r.hitLate} of ${r.dmg} damage events without hit within 1 frame`);
    if (r.still) bad.push(`${r.still} still-picture frames (${r.bad.join('; ')})`);
    if (!r.kill) bad.push('boss never died'); else if (!r.defFrames || r.defFrames < need) bad.push(`defeat played ${r.defFrames} of ${need} frames`);
    lines.push(`${bad.length ? 'FAIL' : 'ok  '} ${id}: ${JSON.stringify(r.states)} attack ${r.atkOk}/${r.atk} hitLate ${r.hitLate}/${r.dmg} still ${r.still} defeat ${r.defFrames}/${need}`);
    for (const b of bad) fails.push(`${id}: ${b}`);
    await ctx.close();
  }
  await br.close(); srv.kill(); console.log(lines.join('\n'));
  console.log(fails.length ? 'FAIL\n' + fails.slice(0, 40).join('\n') : 'bossart PASS'); process.exit(fails.length ? 1 : 0);
})();
