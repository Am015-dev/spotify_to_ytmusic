#!/usr/bin/env node
// Flankers gate (flag RET.flankers, ?flankers=0 = W29 bullet-stream flush). Prints pass/fail lines only.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/flankers-test.js     env: PW=playwright GAME_DIR=<dir>
// Each kind spawns after the tell, draws (phone portrait + landscape), is killable (drops a shard), obeys ebCap; max 3 alive, 8 s cool-down,
// only while camping 3 s; a dodger swing never sees one; flag off = the old bullet-stream flush.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const UNIT = (flagOn) => {
  const m = window.__mnr, out = []; const ok = (n, c, x) => out.push((c ? 'PASS ' : 'FAIL ') + n + (x !== undefined ? ' ' + x : ''));
  m.SET.diff = 'normal'; try { m.applySet(); } catch (e) { } m.startStory(4); m.simOn(true); for (let i = 0; i < 30; i++) m.step(1 / 60);
  const F = window.FLK, A = window.AC, G = m.G, P = m.P;
  const camp = () => { A.buf = Array.from({ length: 60 }, () => 60 + Math.random() * 20); A.lv = 1; };
  const run = (s) => { for (let i = 0; i < s * 60; i++) { camp(); m.touchTo(70, P.y); m.step(1 / 60); } };
  const fk = () => G.en.filter(e => e.fk && !e.dead && e.hp > 0);
  if (!flagOn) {
    ok('flag off: FLK.on false', !F.on);
    G.en.length = 0; G.eb.length = 0; run(30);
    ok('flag off: no flanker enemies, bullet-stream tells as before', fk().length === 0 && A.stat.flush > 0, 'flush=' + A.stat.flush);
    m.abort(); return out;
  }
  ok('flag on with ?flankers=1', F.on);
  ok('tell >= 0.6 s', F.TELL >= .6, F.TELL);
  G.en.length = 0; G.eb.length = 0; A.tells = []; F.reset(); F.cd = 0;
  run(1.5); ok('no flanker before camping 2 s', fk().length === 0 && F.stat.spawn === 0);
  F.cd = 0; let sawTell = false; for (let i = 0; i < 600 && F.stat.spawn === 0; i++) { camp(); m.touchTo(70, P.y); m.step(1 / 60); }
  sawTell = F.tells.length > 0; ok('camping 2 s -> a flanker tell', F.stat.spawn === 1 && sawTell, 'spawn=' + F.stat.spawn);
  const t0 = F.tells[0] ? F.tells[0].t : 0; ok('tell lasts >= 0.6 s before the enemy exists', fk().length === 0 && t0 >= .6, t0.toFixed(2));
  // each kind: force-spawn, draw, hit, kill
  for (const k of ['diver', 'crawler', 'bait']) {
    G.en.length = 0; G.eb.length = 0; G.pk.length = 0; F.tells = []; F.cd = 99;
    const e = F.mk({ k, x: 70, y: P.y, up: 0, bx: 300, by: P.y > 270 ? 120 : 420 });
    ok(k + ' spawns as an enemy (hp, score, id)', G.en.includes(e) && e.hp > 0 && e.score > 0 && F.K[k].id === 'flanker-' + k, 'hp=' + e.hp);
    e.x = k === 'crawler' ? 30 : 300; e.y = 200; let drew = true; try { m.step(1 / 60); m.draw && m.draw(); } catch (er) { drew = false; }
    ok(k + ' draws without error', drew);
    const kills = F.stat.kill; e.hp = 0; m.step(1 / 60); m.step(1 / 60);
    ok(k + ' killable, counts a kill', F.stat.kill === kills + 1 && !G.en.includes(e));
  }
  // contact hurts
  G.en.length = 0; P.inv = 0; P.dashT = 0; const hp0 = P.hp; const d = F.mk({ k: 'diver', x: P.x, y: P.y }); d.x = P.x; d.y = P.y; d.tx = P.x; m.step(1 / 60);
  ok('flanker contact hurts the ship (hull or shield hit)', P.hp < hp0 || P.inv > 0, hp0 + '->' + P.hp);
  // caps: bullets stay under ebCap with a crawler shooting
  G.en.length = 0; G.eb.length = 0; P.hp = P.max; const cr = F.mk({ k: 'crawler', x: 30, y: 100 }); cr.hp = 999; cr.sf = 0; let mx = 0;
  for (let i = 0; i < 1200; i++) { P.inv = 9; P.hp = P.max; G.eb.length < 200 && 0; if (cr.dead) break; m.step(1 / 60); mx = Math.max(mx, G.eb.length); }
  ok('crawler shots obey ebCap', mx <= 35, 'max ' + mx);
  // max 3 alive, 8 s cool-down
  G.en.length = 0; G.eb.length = 0; G.pk.length = 0; F.reset(); F.hold = 9; F.cd = 0; F.stat.spawn = 0; F.n = 0; A.tells = [];
  A.cd = 0; run(.3); const a1 = F.stat.spawn; A.cd = 0; run(.3);
  ok('8 s cool-down between flankers', a1 === 1 && F.stat.spawn === 1, a1 + '/' + F.stat.spawn);
  F.cd = 0; F.mk({ k: 'diver', x: 70, y: P.y }); F.mk({ k: 'bait', x: 70, y: P.y, bx: 300, by: 100 }); F.mk({ k: 'crawler', x: 30, y: 100 });
  F.cd = 0; F.tells = []; const before = F.stat.spawn; A.cd = 0; run(.5);
  ok('max 3 alive', F.stat.spawn === before && fk().length <= 3, fk().length);
  // dodger: swing 150-290 never flagged, never sees one
  G.en.length = 0; F.reset(); F.stat.spawn = 0; A.buf = []; A.lv = 0;
  for (let i = 0; i < 1800; i++) { m.touchTo(220 + 70 * Math.sin(i / 60 * .55), 270 + 100 * Math.sin(i / 60 * .9)); m.step(1 / 60); }
  ok('dodger swing: no flanker', F.stat.spawn === 0 && F.hold < 2, F.hold.toFixed(1));
  // gap: dive column is a single lane and the bait sits >= 96 px off the ship row
  F.reset(); F.cd = 0; F.hold = 9; A.cd = 0; P.y = 270; for (let i = 0; i < 40 && !F.tells.length; i++) { F.n = 2; camp(); m.touchTo(70, 270); m.step(1 / 60); A.cd = 0; }
  const bt = F.tells.find(q => q.k === 'bait'); ok('bait hovers >= 96 px off the ship row', !bt || Math.abs(bt.by - 270) >= 96, bt ? bt.by : 'n/a');
  m.abort(); return out;
};
const SHAPES = () => {   // phone portrait + landscape draw check
  const m = window.__mnr, out = []; m.startStory(4); m.simOn(true); for (let i = 0; i < 30; i++) m.step(1 / 60);
  const F = window.FLK, G = m.G, P = m.P; G.en.length = 0;
  for (const k of ['diver', 'crawler', 'bait']) { const e = F.mk({ k, x: 70, y: P.y, bx: 300, by: 120 }); e.x = 200; e.y = 200; }
  F.tells = [{ k: 'diver', t: .5, x: 70, y: 200 }, { k: 'crawler', t: .5, up: 1 }, { k: 'bait', t: .5, bx: 300, by: 150 }];
  try { for (let i = 0; i < 20; i++) { m.step(1 / 60); } out.push('PASS draws in this viewport'); } catch (e) { out.push('FAIL draw ' + e.message); }
  m.abort(); return out;
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 800));
  const br = await PW.chromium.launch(); let fails = 0; const errs = [];
  const mk = async (q, vp) => { const p = await br.newPage({ viewport: vp || { width: 960, height: 540 } }); p.on('pageerror', e => errs.push(e.message)); await p.goto(`http://127.0.0.1:${port}/index.html?sim=1&all=1${q || ''}`); await p.waitForFunction(() => window.__mnr && window.__mnr.TR.list.length > 0, null, { timeout: 8000 }).catch(() => { }); return p; };
  const pr = l => { console.log(l); if (l.startsWith('FAIL')) fails++; };
  for (const [q, f] of [['&flankers=1', true], ['&flankers=0', false]]) { const u = await mk(q); for (const l of await u.evaluate(UNIT, f)) pr((f ? '' : '[off] ') + l); await u.close(); }
  for (const [nm, vp] of [['phone portrait', { width: 390, height: 844 }], ['phone landscape', { width: 844, height: 390 }]]) { const u = await mk('&flankers=1', vp); for (const l of await u.evaluate(SHAPES)) pr(nm + ': ' + l); await u.close(); }
  pr((errs.length ? 'FAIL ' : 'PASS ') + 'no page errors' + (errs.length ? ' ' + errs[0] : ''));
  await br.close(); srv.kill(); console.log(fails ? 'FLANKERS FAIL ' + fails : 'FLANKERS PASS'); process.exit(fails ? 1 : 0);
})();
