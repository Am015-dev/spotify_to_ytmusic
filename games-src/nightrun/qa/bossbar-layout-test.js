// W280: with the street boss on, the boss name bar, the hint/teach line and the edge meter (OVERDRIVE / GUARD, purefoot.js tells) never overlap.
// Reads the HUD boxes the frame itself drew (FOOT._in.L().hud.hud + hud.hint) on 390x763, 844x390 (touch) and 1440x860.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/qa/bossbar-layout-test.js     env: GAME_DIR (a built dir)
const { chromium } = require('playwright'), cp = require('child_process'), path = require('path'), net = require('net');
const GAME = process.env.GAME_DIR || path.resolve(__dirname, '../../../games/mainhattan-nightrun');
const SIZES = [[390, 763, 1], [844, 390, 1], [1440, 860, 0]];
const port0 = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const SEED = () => { try { localStorage.setItem('mnr_story', JSON.stringify({ stars: { 1: 3, 2: 3, 3: 2 }, snap: {}, all: false, v30: 1, v40: 1 })); localStorage.setItem('mnr_tut', '2'); localStorage.setItem('mnr_foot', '{"seen":{"b":1,"a":1},"hint":1}'); localStorage.removeItem('mnr_guard'); } catch (e) {} };
(async () => {
  const port = await port0(), srv = cp.spawn('python3', ['-m', 'http.server', String(port), '--bind', '127.0.0.1', '--directory', GAME], { stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 1200)); const br = await chromium.launch(); let fails = 0;
  for (const [w, h, touch] of SIZES) {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, hasTouch: !!touch, isMobile: !!touch }); await ctx.addInitScript(SEED);
    const p = await ctx.newPage(); await p.goto(`http://127.0.0.1:${port}/index.html?nomusic=1`); await p.waitForFunction(() => window.FOOT && FOOT.S3, null, { timeout: 20000 });
    await p.evaluate(() => { const F = FOOT; F.ctl = (S, I) => { for (const k in I) if (typeof I[k] === 'number') I[k] = 0; }; RET.tale = false; F.start('zeil'); F.sim(1, 1 / 60); const S = F.S; S.time = 152; S.P.x = 7350; S.camX = 7250; S.P.hp = 99; });
    await p.waitForFunction(() => FOOT.S && FOOT.S.boss && FOOT.S.boss.seen, null, { timeout: 30000 });
    // the moment from the shot: teach line up, OVERDRIVE filling, GUARD meter refilling
    await p.evaluate(() => { const S = FOOT.S; S.note = { teach: 1, t: 5, txt: 'GUARD: hold to block hits from the front' }; if (FOOT.OD) FOOT.OD.v = FOOT.OD.max * .4; if (S.gd) S.gd.m = .5; });
    await p.waitForTimeout(400);
    const r = await p.evaluate(() => { const L = FOOT._in.L(), H = L.hud || {}; return { boxes: (H.hud || []).map(b => [b.x, b.y, b.w, b.h].map(v => Math.round(v))), hint: H.hint && [H.hint.x, H.hint.y, H.hint.w, H.hint.h].map(v => Math.round(v)), boss: !!FOOT.S.boss }; });
    const all = r.boxes.concat(r.hint ? [r.hint] : []), ov = [];
    for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) { const a = all[i], b = all[j]; if (a[0] < b[0] + b[2] - 1 && a[0] + a[2] > b[0] + 1 && a[1] < b[1] + b[3] - 1 && a[1] + a[3] > b[1] + 1) ov.push(JSON.stringify(a) + ' x ' + JSON.stringify(b)); }
    const bossBar = r.boxes.some(b => b[2] > .6 * (r.boxes[0] ? Math.max(...r.boxes.map(q => q[0] + q[2])) : w) && b[3] <= 40);
    const ok = r.boss && bossBar && r.boxes.length >= 4 && !ov.length; if (!ok) fails++;
    console.log((ok ? 'PASS' : 'FAIL') + ` ${w}x${h}: ${r.boxes.length} HUD boxes + hint ${!!r.hint}, boss bar drawn ${bossBar}, overlaps ${ov.length}${ov.length ? ' :: ' + ov.join(' | ') : ''}`);
    if (process.env.SHOTS) await p.screenshot({ path: path.join(process.env.SHOTS, `hud-${w}x${h}.png`) });
    await ctx.close(); }
  await br.close(); srv.kill(); console.log(fails ? `FAIL bossbar-layout: ${fails} sizes` : 'PASS bossbar-layout: 0 failed'); process.exit(fails ? 1 : 0); })();
