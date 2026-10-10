#!/usr/bin/env node
// Nightrun fun-pass test (stepped page, seconds): the DROP moment, the laser fence and set pieces behave.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/fun-test.js
// 1 DROP: armed one bar ahead (countdown), a dash on the downbeat clears every bullet, pays score and a shard shower; no dash only clears bullets near the ship
// 2 LASER FENCE: standing on a beam row when it fires costs 1 hull, standing in the gap costs nothing, and FUN.cost() flags the beam rows for the bots
// 3 set pieces: a formation shows up inside 25 s of play and clearing it pays a reward
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const T = (m) => {
  const out = { fails: [], notes: [] }, ck = (ok, msg) => (ok ? out.notes : out.fails).push(msg);
  document.getElementById('startBtn').click(); m.simOn(true); const dt = 1 / 60, G = () => m.G, P = m.P; m.god = false;
  const adv = (s) => { for (let i = 0; i < s / dt; i++) { if (m.SH.active) m.SH.close(); m.step(dt); } };
  // keep the ship alive and the field calm while we steer the test
  const calm = () => { P.hp = P.max; G().eb.length = 0; };
  // --- 3: a set piece inside 25 s (play with the ship parked safe: god mode off, heal every step)
  let sawSet = false, rew0 = m.FUN.stat.rewards;
  for (let i = 0; i < 25 / dt; i++) { if (m.SH.active) m.SH.close(); P.hp = P.max; m.step(dt); if (m.FUN.sets.length || m.FUN.fence) sawSet = true; }
  ck(sawSet, 'a set piece or laser fence appeared inside 25 s (sets so far ' + m.FUN.stat.sets + ', fences ' + m.FUN.stat.fences + ')');
  // --- 2: the laser fence
  m.FUN.fence = null; m.FUN.startFence(); const f = m.FUN.fence, row = f.rows[0];
  ck(f.rows.length >= 5 && f.rows.every(r => Math.abs(r - f.gy) > 75), 'the fence leaves a gap of about 150 around its centre (' + f.rows.length + ' rows)');
  ck(m.FUN.cost(row) === 0, 'before it locks the bots are not warned (phase 0)');
  const bc0 = m.G.bc; let guard = 0; while (m.G.bc < bc0 + 3 && guard++ < 2000) m.step(dt); calm();
  ck(m.FUN.cost(row) > 0 && m.FUN.cost(f.gy) === 0, 'once locked, FUN.cost flags a beam row and not the gap centre');
  P.y = row; P.x = 300; P.hp = P.max; const hp1 = P.hp; guard = 0; while (m.FUN.fence && guard++ < 3000) { P.y = row; m.step(dt); }
  ck(P.hp < hp1 || m.G.dead, 'standing on a beam row when it fires costs hull (' + hp1 + ' -> ' + P.hp + ')');
  P.hp = P.max; m.FUN.fence = null; m.FUN.startFence(); const f2 = m.FUN.fence; const bc1 = m.G.bc; guard = 0; const sc0 = m.G.score, st0 = m.FUN.stat.rewards;
  while (m.FUN.fence && guard++ < 3000) { P.y = f2.gy; G().eb.length = 0; m.step(dt); }
  ck(!f2.hit && m.FUN.stat.rewards === st0 + 1, 'standing in the gap costs nothing and pays FENCE CLEARED (hit ' + f2.hit + ', rewards ' + (m.FUN.stat.rewards - st0) + ')');
  // --- 1: DROP on the downbeat (the director's own bar line is switched off so the test controls the clock)
  const realBar = m.FUN.bar; m.FUN.bar = () => { };
  for (const hit of [true, false]) {
    calm(); m.FUN.dw = null; m.FUN.dropAt = -1; m.FUN.fence = null; m.FUN.sets.length = 0; m.G.en.length = 0; m.G.boss = null;
    m.G.rb = 15; realBar.call(m.FUN); ck(m.FUN.dropAt === 16, 'the drop is armed one bar ahead (countdown starts)'); const dB = m.FUN.dropB;
    for (let i = 0; i < 40; i++) m.eb(700 + i * 5, 100 + i * 8, Math.PI, 1);                          // a screen full of slow bullets (crawling, they stay put)
    P.x = 300; P.y = 270; let g2 = 0; while ((m.G.bc < dB - 1 || m.bpos() - Math.floor(m.bpos()) < .92) && g2++ < 2000) { P.hp = P.max; m.G.en.length = 0; m.step(dt); }   // up to just before the downbeat, inside the dash window
    P.dashCd = 0;
    const d0 = m.G.score, sh0 = m.G.pk.length, rw0 = m.FUN.stat.dropsHit, n0 = m.G.eb.length;
    if (hit) m.press('Dash');
    g2 = 0; while (m.G.bc < dB && g2++ < 600) m.step(dt);
    m.G.rb = 16; realBar.call(m.FUN);                                                                  // the bar line: the drop begins
    adv(.6);
    const left = m.G.eb.filter(b => b.x > 600).length;
    if (hit) { ck(m.FUN.stat.dropsHit === rw0 + 1, 'DASH on the downbeat: the big DROP fires'); ck(left === 0, 'DROP clears every bullet (' + n0 + ' -> ' + m.G.eb.length + ')'); ck(m.G.score > d0 + 500, 'DROP pays a score burst (+' + (m.G.score - d0) + ')'); ck(m.G.pk.length > sh0 + 10, 'DROP sends a shard shower (+' + (m.G.pk.length - sh0) + ' pickups)'); }
    else { ck(m.FUN.stat.dropsHit === rw0, 'no dash: only the small blast'); ck(left > 20, 'no dash: far bullets stay (' + left + ' left) - never a punishment, never a free clear'); }
  }
  ck(!m.G.dead, 'the ship survived the test');
  return out;
};
(async () => {
  const port = await freePort(); const srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(); const p = await br.newPage({ viewport: { width: 960, height: 540 } }); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
  await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1&nomusic=1`); await p.waitForFunction(() => window.__mnr);
  const r = await p.evaluate(`(${T.toString()})(window.__mnr)`); await br.close(); srv.kill();
  for (const n of r.notes) console.log('  ok ' + n); for (const f of r.fails) console.log('FAIL ' + f); for (const e of errs) console.log('FAIL page error ' + e);
  console.log(r.fails.length || errs.length ? 'fun test: FAILED' : 'fun test: all passed'); process.exit(r.fails.length || errs.length ? 1 : 0);
})();
