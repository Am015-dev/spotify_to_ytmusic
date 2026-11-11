// Guided dive + a lost dive result card: node look2.js WxH [phone] [tag] -> shots/look2_<tag>_<size>_*.png
const PW = require(process.env.PW || (require('child_process').execSync('npm root -g').toString().trim() + '/playwright'));
const fs = require('fs'), path = require('path'); const OUT = path.join(__dirname, 'shots');
const html = fs.readFileSync(path.join(__dirname, 'lantern-dive.html'));
const [W, H] = (process.argv[2] || '390x763').split('x').map(Number); const PH = process.argv[3] === 'phone'; const TAG = process.argv[4] || 'a';
(async () => {
  const b = await PW.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext(Object.assign({ viewport: { width: W, height: H }, deviceScaleFactor: +(process.env.DPR || 1) }, PH ? { isMobile: true, hasTouch: true } : {}));
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const sh = n => p.screenshot({ path: path.join(OUT, `look2_${TAG}_${W}x${H}_${n}.png`) });
  await p.goto('https://gns.test/'); await p.waitForTimeout(1500);
  await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } UI.seed = 4; AIDELAY = 60; ANIM = 1; showStart(); UI.sv = 'setup'; renderStart(); document.querySelector('[data-start=guided]').click(); });
  await p.waitForTimeout(2500); await sh('g1welcome');
  let n = 0;
  for (let k = 0; k < 600; k++) {
    const st = await p.evaluate(() => ({ over: G.phase === 'over', tip: UI.tip && UI.tip.id, must: iMustAct() && canAct(), ph: G.phase, tr: G.tricks.length }));
    if (st.over) break;
    if (st.tip) { if (n++ < 6) { await p.waitForTimeout(300); await sh('g2tip_' + st.tip); } await p.evaluate(() => { document.querySelector('#tip [data-a=tipok]').click(); }); await p.waitForTimeout(250); continue; }
    if (st.must) { await p.evaluate(() => { const mv = myMoves(); const pick = mv.find(m => m.t === 'take') || mv.find(m => m.t === 'pass') || mv.find(m => m.t === 'dist' && !m.on) || mv.find(m => m.t === 'nosig') || mv.find(m => m.t === 'play' && m.c !== 38) || mv.find(m => m.t === 'play') || mv[0]; if (pick) doMove(pick); }); }
    await p.waitForTimeout(180);
  }
  await p.waitForTimeout(1500); await sh('g3result');
  // a lost dive on a normal game
  await p.evaluate(() => { ANIM = 0; AIDELAY = 0; closeRS(); const o = optObj(); o.kind = 'log'; o.mission = 9; setNp(4); showStart(); UI.seed = 33; UI.sv = 'setup'; renderStart(); document.querySelector('[data-start=vs]').click(); UI.coach.level = 'off'; UI.tip = null; renderTip(); });
  for (let k = 0; k < 800; k++) { const st = await p.evaluate(() => ({ over: G.phase === 'over' && UI.overShown, must: iMustAct() && canAct() })); if (st.over) break; if (st.must) await p.evaluate(() => { const mv = myMoves(); const pick = mv.find(m => m.t === 'take') || mv.find(m => m.t === 'pass') || mv.find(m => m.t === 'dist' && !m.on) || mv.find(m => m.t === 'nosig') || mv.find(m => m.t === 'predict') || mv.find(m => m.t === 'play') || mv[0]; if (pick) doMove(pick); }); await p.waitForTimeout(40); }
  await p.waitForTimeout(700); await sh('r1lost');
  console.log('errors', JSON.stringify(errs)); await b.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
