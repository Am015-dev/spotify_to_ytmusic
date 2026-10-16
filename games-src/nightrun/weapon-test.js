#!/usr/bin/env node
// Nightrun weapons + fusions test (stepped page). Prints pass/fail lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/weapon-test.js        (BOT=0 skips the stage-1 bot runs)
// 1 all 28 unordered pairs: equip, one volley + 5 s of play, one HUD draw and one fusion-banner draw, no page error, never above the player-bullet cap
// 2 each of the 8 weapons alone clears stage 1 with the story bot (same bot as story-sim.js)
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const src = fs.readFileSync(path.join(__dirname, 'story-sim.js'), 'utf8'), i0 = src.indexOf('const BOT = '), i1 = src.indexOf('\n(async');
const BOTSRC = src.slice(i0 + 'const BOT = '.length, i1).trim().replace(/;$/, '');
const IDS = ['arc', 'beat', 'disc', 'laser', 'mine', 'orbit', 'pulse', 'swarm'];
const PAIRS = []; for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) PAIRS.push([IDS[i], IDS[j]]);
const T = ({ a, b, L }) => {
  const m = window.__mnr, wp = window.__wp, errs = [], out = { fails: [], max: 0 };
  const E0 = NR.emit; NR.emit = function (e, d) { const l = this._h[e]; if (l) for (const f of l) { try { f(d); } catch (x) { errs.push(e + ': ' + x.message); } } };   // handler errors are swallowed by NR.emit: surface them
  m.startStory(1); m.simOn(true); m.god = true;
  wp.eq = [a, b]; wp._fk = null; wp.lvl(a, L); wp.lvl(b, L); wp.sync();
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
    const r = await p.evaluate(T, { a, b, L: (n++ % 2) ? 1 : 5 }); const msgs = [...r.fails, ...r.errs, ...perr.splice(0)];
    if (msgs.length) { bad++; console.log('FAIL pair ' + a + '+' + b + ': ' + msgs.slice(0, 3).join(' | ')); }
  }
  console.log((bad ? 'FAIL' : 'PASS') + ' fusions: ' + (28 - bad) + '/28 pairs equip, fire, draw, stay under the bullet cap');
  let w = 0;
  if (process.env.BOT !== '0') {
    for (const id of IDS) {
      await p.evaluate(id => { window.__mnr.god = false; window.__wp.eq = [id, null]; window.__wp._fk = null; for (const k of Object.keys(window.__wp.lv)) delete window.__wp.lv[k]; }, id);
      const r = await p.evaluate(`(${BOTSRC})`.replace(/^\((.*)\)$/s, '($1)') && new Function('o', 'return (' + BOTSRC + ')(o)'), { n: 1, PC: .4, MAXT: 420, endless: false }).catch(e => ({ err: e.message }));
      const ok = r && r.clear; if (ok) w++; console.log((ok ? 'PASS' : 'FAIL') + ' ' + id + ' alone clears stage 1' + (r && r.t ? ' (' + r.t + ' s, hits ' + r.hits + ', kills ' + r.kills + ')' : r && r.err ? ' ' + r.err : ' (dead ' + (r && r.dead) + ')'));
    }
  }
  if (perr.length) console.log('FAIL page errors: ' + perr.slice(0, 3).join(' | '));
  await br.close(); srv.kill(); process.exit(bad || (process.env.BOT !== '0' && w < 8) || perr.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
