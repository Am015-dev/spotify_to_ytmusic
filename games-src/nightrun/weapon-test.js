#!/usr/bin/env node
// Nightrun weapons + fusions test (stepped page). Prints pass/fail lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/weapon-test.js        (BOT=0 skips the stage-1 bot runs)
// 1 pairs: all 28 old pairs + 20 random new pairs: equip, one volley + 5 s of play, one HUD draw and one fusion-banner draw, no page error, never above the player-bullet cap (PAIRS=all tests all 120)
// 2 each of the 16 weapons alone clears stage 1 with the story bot (same bot as story-sim.js) at permanent level 1 and at level 10
// 3 the purchase flow: money drops by the price, the level rises, no buying without money (the bank never goes negative), saved levels survive a reload, the garage card buys
// 4 DPS: damage dealt to a row of dummies over 10 s at level 10 is at most 2.5x level 1 (weapon only: the ship's own guns are subtracted)
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const src = fs.readFileSync(path.join(__dirname, 'story-sim.js'), 'utf8'), i0 = src.indexOf('const BOT = '), i1 = src.indexOf('\n(async');
const BOTSRC = src.slice(i0 + 'const BOT = '.length, i1).trim().replace(/;$/, '');
const OLD = ['arc', 'beat', 'disc', 'laser', 'mine', 'orbit', 'pulse', 'swarm'];
const IDS = [...OLD, 'flame', 'frost', 'drone', 'rail', 'shell', 'storm', 'wave', 'well'];
const key = (a, b) => (a < b ? [a, b] : [b, a]);
const PAIRS = [], NEWP = [];
for (let i = 0; i < IDS.length; i++) for (let j = i + 1; j < IDS.length; j++) { const p = key(IDS[i], IDS[j]); (OLD.includes(p[0]) && OLD.includes(p[1]) ? PAIRS : NEWP).push(p); }
let seed = 7; const rng = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const picked = process.env.PAIRS === 'all' ? NEWP.slice() : NEWP.slice().sort(() => rng() - .5).slice(0, 20);
PAIRS.push(...picked);
const T = ({ a, b, L }) => {
  const m = window.__mnr, wp = window.__wp, errs = [], out = { fails: [], max: 0 };
  const E0 = NR.emit; NR.emit = function (e, d) { const l = this._h[e]; if (l) for (const f of l) { try { f(d); } catch (x) { errs.push(e + ': ' + x.message); } } };   // handler errors are swallowed by NR.emit: surface them
  m.startStory(1); m.simOn(true); m.god = true;
  wp.eq = [a, b]; wp._fk = null; wp.perm(a, L); wp.perm(b, L); wp.sync();
  const f = wp.fu(); if (!f || f.id !== 'fu-' + a + '-' + b || !f.name || !f.tx) out.fails.push('no fusion for ' + a + '+' + b);
  const cap = (window.matchMedia('(pointer:coarse)').matches ? 44 : 64), G = () => m.G, P = m.P;
  const dt = 1 / 60; let fired = 0;
  for (let i = 0; i < 300; i++) {
    if (m.SH.active) m.SH.close(); P.hp = P.max; P.y = 270 + 120 * Math.sin(i / 40); P.x = 200;
    if (i % 6 === 0) { m.SH.volley(P.x + 22, P.y + 2, 0); fired++; }
    m.step(dt); out.max = Math.max(out.max, G().pb.length);
  }
  if (out.max > cap) out.fails.push('bullets ' + out.max + ' > cap ' + cap);
  // HUD + banner draws
  try { const c = document.createElement('canvas').getContext('2d'); wp.fuT = 3; wp.hud(c, 20, 20, 1); wp.fuIcon(c, f, 112); wp.draw(); wp.drawWorld(1); } catch (x) { errs.push('draw: ' + x.message); }
  if (!document.getElementById('wpFu').textContent.includes(f.name.toUpperCase())) out.fails.push('banner misses the fusion name');
  NR.emit = E0; m.abort();
  out.errs = errs; out.vol = fired; return out;
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(); const p = await br.newPage({ viewport: { width: 960, height: 540 } }); const perr = []; p.on('pageerror', e => perr.push(e.message));
  await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1&nomusic=1`); await p.waitForFunction(() => window.__mnr && window.__wp, null, { timeout: 10000 });
  let bad = 0, n = 0;
  for (const [a, b] of PAIRS) {
    const r = await p.evaluate(T, { a, b, L: (n++ % 2) ? 1 : 10 }); const msgs = [...r.fails, ...r.errs, ...perr.splice(0)];
    if (msgs.length) { bad++; console.log('FAIL pair ' + a + '+' + b + ': ' + msgs.slice(0, 3).join(' | ')); }
  }
  console.log((bad ? 'FAIL' : 'PASS') + ' fusions: ' + (PAIRS.length - bad) + '/' + PAIRS.length + ' pairs equip, fire, draw, stay under the bullet cap');
  let w = 0, nbot = 0;
  if (process.env.BOT !== '0') {
    for (const L of [1, 10]) for (const id of IDS) {
      nbot++;
      await p.evaluate(({ id, L }) => { window.__mnr.god = false; const wp = window.__wp; wp.eq = [id, null]; wp._fk = null; wp.lv = {}; wp.xp = {}; wp.pl = { pulse: 1 }; wp.perm(id, L); }, { id, L });
      const r = await p.evaluate(`(${BOTSRC})`.replace(/^\((.*)\)$/s, '($1)') && new Function('o', 'return (' + BOTSRC + ')(o)'), { n: 1, PC: .4, MAXT: 420, endless: false }).catch(e => ({ err: e.message }));
      const ok = r && r.clear; if (ok) w++; console.log((ok ? 'PASS' : 'FAIL') + ' ' + id + ' alone at level ' + L + ' clears stage 1' + (r && r.t ? ' (' + r.t + ' s, hits ' + r.hits + ', kills ' + r.kills + ')' : r && r.err ? ' ' + r.err : ' (dead ' + (r && r.dead) + ')'));
    }
  }
  // 4 DPS: five dummies in a column 150 px in front of the ship; weapon damage = total - the ship's own guns (no weapon equipped)
  let dbad = 0;
  if (process.env.DPS !== '0') {
    const D = ({ id, L, secs }) => {
      const m = window.__mnr, wp = window.__wp; m.startStory(1); m.simOn(true); m.god = true; wp.lv = {}; wp.xp = {}; wp.pl = { pulse: 1 };
      wp.eq = id ? [id, null] : [null, null]; wp._fk = null; if (id) wp.perm(id, L); wp.reset(); wp.sync();
      const G = () => m.G, P = m.P, dum = []; const DX = 200 + ({ orbit: 55, storm: 50, flame: 100 }[id] || 150); for (const dy of [-80, -40, 0, 40, 80]) dum.push({ type: 'drone', dummy: 1, x: DX, y: 270 + dy, r: 16, hp: 1e6, max: 1e6, hq: 1e6, flash: 0, t: 0, bf: 99, bn: 0, gr: 0, tin: 0, by: 270 + dy });
      let dealt = 0; const dt = 1 / 60;
      for (let i = 0; i < Math.round(secs * 60); i++) {
        if (m.SH.active) m.SH.close(); P.hp = P.max; P.x = 200; P.y = 270 + 50 * Math.sin(i / 60 * 1.6);
        G().en = G().en.filter(e => e.dummy); G().eb = []; for (const d of dum) if (!G().en.includes(d)) G().en.push(d);
        if (i % 8 === 0) m.SH.volley(P.x + 22, P.y + 2, 0);
        m.step(dt);
        for (const d of dum) { dealt += 1e6 - d.hp; d.hp = d.hq = 1e6; d.x = DX; d.y = P.y + (d.by - 270); d.dead = 0; d.dying = 0; d.chl = 0; }
      }
      m.abort(); return dealt / secs;
    };
    const base = (await p.evaluate(D, { id: null, L: 1, secs: 10 }) + await p.evaluate(D, { id: null, L: 1, secs: 10 })) / 2;
    for (const id of IDS) {
      const a = [], b = []; for (let r = 0; r < 2; r++) { a.push(await p.evaluate(D, { id, L: 1, secs: 10 })); b.push(await p.evaluate(D, { id, L: 10, secs: 10 })); }
      const d1 = Math.max(.01, a.reduce((x, y) => x + y) / 2 - base), d10 = Math.max(0, b.reduce((x, y) => x + y) / 2 - base), ratio = d10 / d1;
      const ok = ratio <= 2.5 && d10 >= d1 * .9; if (!ok) dbad++;
      console.log((ok ? 'PASS' : 'FAIL') + ' dps ' + id + ': weapon ' + d1.toFixed(1) + '/s at LV1 -> ' + d10.toFixed(1) + '/s at LV10 = ' + ratio.toFixed(2) + 'x (ship guns ' + base.toFixed(1) + '/s)');
    }
  }
  // 3 purchase flow on a fresh profile (no ?all=1, so weapons are locked until bought)
  let pbad = 0;
  {
    const ctx2 = await br.newContext({ viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true }); const q = await ctx2.newPage(); const qerr = []; q.on('pageerror', e => qerr.push(e.message));
    await q.addInitScript(() => { if (!localStorage.getItem('mnr_seeded')) { localStorage.setItem('mnr_seeded', '1'); localStorage.setItem('mnr_bank', '500'); } });
    await q.goto(`http://127.0.0.1:${port}/index.html?sim=1&nomusic=1`); await q.waitForFunction(() => window.__mnr && window.__wp, null, { timeout: 10000 });
    const chk = (c, msg) => { if (!c) { pbad++; console.log('FAIL purchase: ' + msg); } };
    const r1 = await q.evaluate(() => { const { GA, gsave } = window.__ga; const wp = window.__wp, o = {}; o.start = [GA.bank, wp.pl.pulse, wp.pl.laser | 0];
      o.locked = !wp.has('laser'); wp.toggle('laser'); o.eqLocked = wp.eq.slice();
      const price = wp.price('laser'); const b0 = GA.bank; const r = wp.buy('laser'); o.unlock = [r.ok, price, b0 - GA.bank, wp.pl.laser];
      const p2 = wp.price('laser'), b1 = GA.bank, r2 = wp.buy('laser'); o.lv2 = [r2.ok, p2, b1 - GA.bank, wp.pl.laser];
      o.eff = wp.lvOf('laser'); GA.bank = 5; const r3 = wp.buy('laser'); o.poor = [r3.ok, r3.why, GA.bank, wp.pl.laser];
      GA.bank = 0; const r4 = wp.buy('storm'); o.zero = [r4.ok, GA.bank, wp.pl.storm | 0]; GA.bank = 100000; for (let i = 0; i < 12; i++) wp.buy('laser'); o.max = [wp.pl.laser, GA.bank]; const r5 = wp.buy('laser'); o.over = [r5.ok, r5.why, wp.pl.laser];
      GA.bank = 777; gsave(); wp.save(); o.prices = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(l => wp.price('pulse') && 0 || 0); return o; });
    chk(r1.start[0] === 500 && r1.start[1] === 1 && r1.start[2] === 0, 'fresh profile: 500 Neon, pulse LV1, laser locked ' + JSON.stringify(r1.start));
    chk(r1.locked && JSON.stringify(r1.eqLocked) === '["pulse",null]', 'a locked weapon cannot be equipped');
    chk(r1.unlock[0] && r1.unlock[1] === r1.unlock[2] && r1.unlock[3] === 1, 'unlock takes exactly its price and gives LV1 ' + JSON.stringify(r1.unlock));
    chk(r1.lv2[0] && r1.lv2[1] === 40 && r1.lv2[2] === 40 && r1.lv2[3] === 2, 'LV1->2 costs 40 and gives LV2 ' + JSON.stringify(r1.lv2));
    chk(r1.eff === 2, 'effective level = permanent level outside a run ' + r1.eff);
    chk(!r1.poor[0] && r1.poor[1] === 'money' && r1.poor[2] === 5 && r1.poor[3] === 2, 'cannot buy without money, bank untouched ' + JSON.stringify(r1.poor));
    chk(!r1.zero[0] && r1.zero[1] === 0 && r1.zero[2] === 0, 'bank 0: nothing bought, never negative ' + JSON.stringify(r1.zero));
    chk(r1.max[0] === 10 && r1.max[1] >= 0 && !r1.over[0] && r1.over[1] === 'max', 'level stops at 10 ' + JSON.stringify([r1.max, r1.over]));
    await q.reload(); await q.waitForFunction(() => window.__mnr && window.__wp, null, { timeout: 10000 });
    const r2 = await q.evaluate(() => [window.__ga.GA.bank, window.__wp.pl.laser, window.__wp.pl.pulse, window.__wp.pl.storm | 0]);
    chk(r2[0] === 777 && r2[1] === 10 && r2[2] === 1 && r2[3] === 0, 'save/reload keeps Neon and levels ' + JSON.stringify(r2));
    // the garage card buys too
    const r3 = await q.evaluate(() => { const { GA, openGarage } = window.__ga; GA.bank = 500; GA.tab = 'weapons'; openGarage('title'); const card = document.querySelector('#gaCards .card[data-id="swarm"]'); if (!card) return { err: 'no swarm card' };
      const o = { text: card.textContent.replace(/\s+/g, ' ').slice(0, 200), canvas: !!card.querySelector('canvas') }; const b0 = GA.bank, pr = window.__wp.price('swarm'); card.click(); o.after = [b0 - GA.bank, pr, window.__wp.pl.swarm];
      o.cards = document.querySelectorAll('#gaCards .card').length; o.noScroll = document.documentElement.scrollWidth <= innerWidth + 1; return o; });
    chk(!r3.err && r3.after[0] === r3.after[1] && r3.after[2] === 1 && r3.cards === 16 && r3.canvas && /LOCKED|LV/.test(r3.text) && r3.noScroll, 'garage WEAPONS card buys, 16 cards, icon, no sideways scroll ' + JSON.stringify(r3));
    const ab = await q.evaluate(() => Object.values(window.__ga.WPD).every(d => d.tx.length <= 40 && d.ab && d.ab.length === 3 && d.ab.every(x => x.length <= 34) && d.p >= 0));
    chk(ab, 'every card text is short (<= 40 chars) and has 3 level lines');
    if (qerr.length) { pbad++; console.log('FAIL purchase page errors: ' + qerr.slice(0, 3).join(' | ')); }
    console.log((pbad ? 'FAIL' : 'PASS') + ' purchase flow'); await ctx2.close();
  }
  if (perr.length) console.log('FAIL page errors: ' + perr.slice(0, 3).join(' | '));
  await br.close(); srv.kill(); process.exit(bad || pbad || dbad || (process.env.BOT !== '0' && w < nbot) || perr.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
