#!/usr/bin/env node
// W216 probe: under ?pure=1 the play field (everything except the HUD) draws no code shapes (arc / ellipse / rect / fillRect / stroke / fill / fillText),
// in stage 1 and through its boss fight. Steps the sim at x200+ (no real time), renders a frame every 20 steps. PASS/FAIL lines only.
//   GAME_DIR=<dir with index.html + media> NODE_PATH=$(npm root -g) node qa/pureprobe.js     env: SHOT=<dir> (one phone shot mid boss fight, png)  W=390 H=763  STAGE=1
const { boot, open, ok, done, sleep } = require('./lib');
(async () => {
  const b = await boot(), Wd = +process.env.W || 390, Hd = +process.env.H || 763, tot = { C: {}, seen: {}, bossFrames: 0, frames: 0, ebKinds: {}, err: null };
  for (const stage of (process.env.STAGES || '1,8').split(',').map(Number)) {
  const p = await open(b.br, b.base, Wd, Hd, '?sim=1&all=1&pure=1&nomusic=1', 1, Wd < 700);
  const hb = require('fs').readFileSync(require('path').resolve(__dirname, '../humanbot.js'), 'utf8'), a0 = hb.indexOf('const BOT = (o) => {'), a1 = hb.indexOf('\n};\n(async', a0);
  const BOTSRC = hb.slice(a0 + 'const BOT = '.length, a1 + 3);
  const R = await p.evaluate(`(async()=>{const BOT=${BOTSRC};const stage=${stage},shot=${!!process.env.SHOT},W_=900,SHOTAT=${+process.env.SHOTAT || 10};
    const m = window.__mnr, C = {}, seen = {}; const fb = {}; let seenBoss = -1, phase = 'stage', bossAt = -1, frames = 0, bossFrames = 0, ebKinds = {}, err = null, shotDone = false; m.god = true;
    for (const k of ['arc', 'ellipse', 'rect', 'fillRect', 'stroke', 'fill', 'fillText', 'strokeText', 'strokeRect']) { const o = CanvasRenderingContext2D.prototype[k]; CanvasRenderingContext2D.prototype[k] = function () { if (!window.PB.hud && this.canvas.width >= 300 && !/ART\\.bg|bigGet/.test(new Error().stack)) { const key = phase + ':' + k; C[key] = (C[key] || 0) + 1; if (!seen[key]) seen[key] = (new Error().stack || '').split('\\n').slice(2, 8).map(s => s.trim().replace(/\\(.*[\\\\/]/, '(')).join(' < '); } return o.apply(this, arguments); }; }
    const pp = PURL.player; if (${!!process.env.SKIPSHIP}) PURL.player = function () { window.PB.hud++; try { return pp.apply(this, arguments); } finally { window.PB.hud--; } };   // SKIPSHIP=1: W215 owns the player ship (its rim light fills rects)
    const pf = PURL.foe; PURL.foe = function (e) { const r = pf.apply(this, arguments); if (!r) fb[phase + ':' + e.type + (e.zt ? '/zoo' : '') + (e.gnd ? '/gnd' : '')] = 1; return r; };
    const la = window.LEAK.art; window.LEAK.art = function (e) { if (e.type !== 'gwalker') fb['LEAK-' + e.type] = 1; window.PB.hud += e.type === 'gwalker' ? 1 : 0; try { return la.apply(this, arguments); } finally { if (e.type === 'gwalker') window.PB.hud--; } };   // gwalker has no sheet yet (ship-egwalker, ASSETS-NEEDED-ENEMIES.md #13): its old picture stays, not counted
    window.__rec = (mm, i) => { if (m.G.en.some(e => e.type === 'boss')) seenBoss = m.G.t; if (m.G.boss && bossAt < 0) { bossAt = m.G.t; phase = 'boss'; } if (shot && m.G.boss && m.G.boss.x < W_ * .8 && m.G.t - bossAt > SHOTAT) throw 'SHOT'; if (i % 20 || err) return;
      try { m.render(m.G.t, 1 / 60); frames++; if (m.G.boss) bossFrames++; for (const e of m.G.eb) ebKinds[(e.k || '-') + (e.hm > 0 ? 'h' : '')] = 1; } catch (e) { err = String(e.stack || e).slice(0, 300); } };
    for (const k in m.ART.ANIM.s) m.ART.anim(k); for (const n of m.ART.pkN) m.ART.load('pk-' + n); await new Promise(r => setTimeout(r, 6000));   // real play has the sheets loaded; the stepped sim never waits for them
    let r; try { r = BOT({ n: stage, build: 'fresh', bot: 'human', seed: 1, diff: 'normal', MAXT: 300 }); } catch (e) { if (e !== 'SHOT') throw e; r = 'shot'; m.render(m.G.t, 1 / 60); }
    return { fb, seenBoss, r: r && JSON.stringify(r).slice(0, 400), C, seen, frames, bossFrames, bossAt, ebKinds, err, t: m.G.t };})()`).catch(e => ({ err: 'harness ' + e.message }));
  for (const k in R.C || {}) { tot.C[stage + ':' + k] = R.C[k]; tot.seen[stage + ':' + k] = R.seen[k]; } Object.assign(tot.ebKinds, R.ebKinds); tot.bossFrames += R.bossFrames || 0; tot.frames += R.frames || 0; if (process.env.SHOT && process.env.SYN) await p.evaluate(`(()=>{const G=__mnr.G,b=G.boss;if(b)b.lasers.push({x:b.x-30,y:b.y,a:Math.PI*.98,t:5});G.en.push({type:'gate',x:420,y:0,gy:380,gap:150,r:12,on:1,hp:1,max:1,flash:0,t:0},{type:'gate',x:300,y:0,gy:200,gap:140,r:12,tele:1,hp:1,max:1,flash:0,t:0});})()`);
    if (process.env.SHOT) { for (let k = 0; k < 4; k++) { await sleep(700); await p.evaluate('window.__mnr.render(window.__mnr.G.t, 1 / 60)'); } await sleep(300); await p.screenshot({ path: process.env.SHOT + '/boss-' + Wd + 'x' + Hd + '-s' + stage + '.png' }); } tot.err = tot.err || R.err; console.log(stage, 'fallback drawEnemy types', JSON.stringify(R.fb), 'boss seen', R.seenBoss, String(R.r).slice(0, 300)); await p.context().close(); }
  const R = tot;
  console.log(JSON.stringify(R.C), JSON.stringify(R.ebKinds), 'frames', R.frames, 'boss frames', R.bossFrames);
  ok('no render error', !R.err, R.err); ok('boss fight reached and rendered', R.bossFrames > 3, JSON.stringify(R));
  const all = Object.keys(R.C || {}), bad = all.filter(k => !/^[2-9]\d*:stage:/.test(k)), info = all.filter(k => !bad.includes(k)); for (const k of info) console.log('INFO (before the boss, other enemies / not in the gate) ' + k + '=' + R.C[k]); for (const k of bad) console.log('  ' + k + '=' + R.C[k] + ' @ ' + String(R.seen[k]).replace(/index.html[^:]*:/g, '@')); ok('0 code-drawn shapes in the play field (stage + boss)', !bad.length, bad.length + ' kinds');
  await b.close(); done('pureprobe');
})();
