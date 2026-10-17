#!/usr/bin/env node
// Screenshots of the F update into games-src/nightrun/playtest/f-*.png: endless mid-song, a dense section, Athens (portrait, landscape), the new upgrades on the ship, the new ships, the pit stop and the garage.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/f-shots.js        env: ONLY=athens,dense,...
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process'), fs = require('fs');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun'), OUT = path.join(__dirname, 'playtest');
const ONLY = (process.env.ONLY || '').split(',').filter(Boolean), want = n => !ONLY.length || ONLY.includes(n);
const sleep = ms => new Promise(r => setTimeout(r, ms));
function freePort() { return new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); }); }
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME_DIR], { stdio: 'ignore' });
  await sleep(800);
  const browser = await PW.chromium.launch(), errs = [];
  const open = async (w, h, touch, init) => { const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch, deviceScaleFactor: 2, userAgent: touch ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148' : undefined });
    const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message)); await p.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
    if (init) await p.addInitScript(init);
    await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1&all=1`); await p.waitForFunction(() => window.__mnr); await sleep(400); return p; };
  const shot = async (p, name) => { await p.screenshot({ path: path.join(OUT, 'f-' + name + '.png') }); console.log('  f-' + name + '.png'); };
  const run = (p, fn, a) => p.evaluate(fn, a);
  const startRun = async p => { await run(p, () => { document.getElementById('startBtn').click(); }); await sleep(300); };
  const bot = `window.__botOn=1;setInterval(()=>{const m=window.__mnr;if(!m||!m.running||m.paused||m.SH.active)return;const G=m.G,P=m.P;let ty=270,bd=1e9;for(const e of G.en){if(e.type==='boss'){ty=e.y;break}const dx=e.x-P.x;if(dx>0&&dx<bd&&e.x<940){bd=dx;ty=e.type==='gate'?e.gy:e.y}}
    let bc=1e18,bx=P.x,by=P.y;for(let ix=-5;ix<=5;ix++)for(let iy=-5;iy<=5;iy++){const cx=P.x+ix*24,cy=P.y+iy*24;if(cx<40||cx>700||cy<40||cy>480)continue;let c=0;for(const b of G.eb){const d=Math.hypot(b.x+b.vx*.14-cx,b.y+b.vy*.14-cy);if(d<70)c+=(70-d)*(70-d)}for(const e of G.en){const d=Math.hypot(e.x-cx,e.y-cy),r=e.r+55;if(d<r)c+=(r-d)*(r-d)*3}c+=Math.abs(cy-ty)*.6+Math.abs(cx-240)*.15;if(c<bc){bc=c;bx=cx;by=cy}}m.touchTo(bx,by)},50);`;
  if (want('endless')) {                                  // portrait, endless, in the middle of the first song
    const p = await open(390, 763, true); await startRun(p); await run(p, () => { __mnr.god = true; __mnr.G.dbar = 18; __mnr.DIR.bar = 17; __mnr.DIR.theme = null; }); await p.evaluate(bot); await sleep(9000); await shot(p, 'endless-mid'); await p.context().close(); }
  if (want('dense')) {                                    // loop 2, a loud part, mutators on, the dense look
    const p = await open(390, 763, true); await startRun(p); await run(p, () => { const m = __mnr; m.god = true; m.G.loop = 1; m.skipTo(2); m.DIR.mut = ['hail', 'rush']; m.DIR.bsK = 1; m.G.dbar = 40; m.DIR.bar = 39; m.DIR.theme = null; m.G.pos = 2; }); await p.evaluate(bot); await sleep(11000); await shot(p, 'dense-portrait');
    const q = await open(844, 390, true); await startRun(q); await run(q, () => { const m = __mnr; m.god = true; m.G.loop = 1; m.skipTo(2); m.DIR.mut = ['hail', 'rush']; m.G.dbar = 40; m.DIR.bar = 39; m.DIR.theme = null; }); await q.evaluate(bot); await sleep(11000); await shot(q, 'dense-landscape');
    await p.context().close(); await q.context().close(); }
  if (want('athens')) {
    const p = await open(390, 763, true); await startRun(p); await run(p, () => { const m = __mnr; m.god = true; m.skipTo(4); m.G.dbar = 12; }); await p.evaluate(bot); await sleep(4500); await shot(p, 'athens-portrait');
    await run(p, () => { __mnr.G.scroll += 900; }); await sleep(2500); await shot(p, 'athens-portrait-2'); await p.context().close();
    const q = await open(375, 553, true); await startRun(q); await run(q, () => { const m = __mnr; m.god = true; m.skipTo(4); m.G.dbar = 12; }); await q.evaluate(bot); await sleep(4500); await shot(q, 'athens-portrait-375'); await q.context().close();
    const l = await open(844, 390, true); await startRun(l); await run(l, () => { const m = __mnr; m.god = true; m.skipTo(4); m.G.dbar = 12; }); await l.evaluate(bot); await sleep(4500); await shot(l, 'athens-landscape'); await l.context().close();
    const d = await open(1280, 800, false); await startRun(d); await run(d, () => { const m = __mnr; m.god = true; m.skipTo(4); m.G.dbar = 12; }); await d.evaluate(bot); await sleep(4500); await shot(d, 'athens-desktop'); await d.context().close(); }
  if (want('upgrades')) {                                 // the new upgrades on the ship: wing cannons, rear gun, piercing spike, beat drones, overdrive ring
    for (const [w, h, touch, nm] of [[844, 390, true, 'landscape'], [390, 763, true, 'portrait']]) { const p = await open(w, h, touch); await startRun(p);
      await run(p, () => { const m = __mnr; m.god = true; for (const id of ['sc', 'sc', 'rg', 'rg', 'pc', 'bd', 'bd', 'og', 'as', 'rc', 'cl']) m.SH.add(id); m.G.dbar = 10; m.AX.od = 70; m.P.x = 300; m.P.y = 270; });
      await p.evaluate(bot); await sleep(5000); await run(p, () => { __mnr.AX.od = 100; __mnr.NR.emit('kill', { e: { type: 'drone', x: 0, y: 0, pf: 1 }, boss: false }); }); await sleep(800); await shot(p, 'upgrades-' + nm); await p.context().close(); } }
  if (want('ships')) {                                    // garage: the new ships, and the TUNE tab with the new perks
    const own = JSON.stringify({ ship_tri: true, ship_swg: true, ship_syn: true, up_pc: true, up_cl: true }), p = await open(390, 763, true, `localStorage.setItem('mnr_bank','900');localStorage.setItem('mnr_own',${JSON.stringify(own)});`);
    await run(p, () => { document.getElementById('gaBtn').click(); }); await sleep(300); await shot(p, 'garage-tune');
    await run(p, () => { document.querySelector('.tabs button[data-t="ships"]').click(); }); await sleep(250); await shot(p, 'garage-ships');
    await run(p, () => { document.querySelector('.tabs button[data-t="crew"]').click(); }); await sleep(250); await shot(p, 'garage-crew'); await p.context().close();
    for (const ship of ['swg', 'syn']) { const q = await open(844, 390, true, `localStorage.setItem('mnr_own',${JSON.stringify(own)});localStorage.setItem('mnr_ship','"${ship}"');`); await startRun(q); await run(q, () => { __mnr.god = true; __mnr.G.dbar = 6; __mnr.P.x = 250; }); await q.evaluate(bot); await sleep(3500); await shot(q, 'ship-' + ship); await q.context().close(); } }
  if (want('pit')) {                                      // the pit stop with the new cards
    const p = await open(390, 763, true, `localStorage.setItem('mnr_own',${JSON.stringify(JSON.stringify({ up_pc: true, up_cl: true, up_bt: true, up_og: true, up_bd: true, up_wn: true }))});`); await startRun(p);
    await run(p, () => { const m = __mnr, h = m.SH; m.god = true; h.neon = 180; h.live = true; h.pit(() => { }); const ids = ['sc', 'cl', 'og']; h.cards = ids.map(id => ({ u: h.UPG.find(u => u.id === id), sold: false })); h.draw(); }); await sleep(900); await shot(p, 'pit-new'); await p.context().close(); }
  await browser.close(); srv.kill();
  if (errs.length) console.log('PAGE ERRORS', errs.slice(0, 5)); else console.log('no page errors');
})().catch(e => { console.error(e); process.exit(2); });
