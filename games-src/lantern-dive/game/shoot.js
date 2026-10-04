// Screenshot helper: node shoot.js [WxH] [phone] [np] [gfx] [mission] -> shots/s_<size>_*.png
// title, setup (+ Configure sheet on phones), job hand-out, flare, signal, first turn, lifted card, trick on the felt, sweep, mid dive, job popup, result, hot-seat card
const PW = require(process.env.PW || (require('child_process').execSync('npm root -g').toString().trim() + '/playwright'));
const fs = require('fs'), path = require('path'); const OUT = path.join(__dirname, 'shots'); fs.mkdirSync(OUT, { recursive: true });
const html = fs.readFileSync(path.join(__dirname, 'lantern-dive.html'));
const [W, H] = (process.argv[2] || '1366x768').split('x').map(Number); const PH = process.argv[3] === 'phone'; const NP = +(process.argv[4] || 4); const GFX = process.argv[5] || 'high'; const MIS = +(process.argv[6] || 7);
(async () => {
  const b = await PW.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext(Object.assign({ viewport: { width: W, height: H }, deviceScaleFactor: 1 }, PH ? { isMobile: true, hasTouch: true } : {}));
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load/.test(m.text())) errs.push(m.text()); });
  const t = `${W}x${H}`; const sh = n => p.screenshot({ path: path.join(OUT, `s_${t}_${n}.png`) });
  const human = () => p.evaluate(() => iMustAct() && canAct());
  const idle = async (max = 200) => { for (let k = 0; k < max; k++) { if (await p.evaluate(() => (iMustAct() && !UI.busy && !UI.tip) || G.phase === 'over')) return; await p.evaluate(() => { const c = document.querySelector('#pass:not([hidden]) [data-a=takedev]'); if (c) c.click(); }); await p.waitForTimeout(100); } };
  await p.goto('https://gns.test/'); await p.waitForTimeout(1800);
  await p.evaluate(g => { try { localStorage.clear(); } catch (e) { } if (PX.on) setGfx(g); }, GFX);
  await sh('00title');
  await p.click('[data-a=play]'); await p.waitForTimeout(400); await sh('01setup');
  if (PH) { await p.click('[data-a=cfgopen]'); await p.waitForTimeout(300); await sh('02configure'); await p.click('#cfg .cfghead [data-a=cfgclose]'); await p.waitForTimeout(200); }
  await p.evaluate(([np, m]) => { UI.seed = 11; AIDELAY = 400; const o = optObj(); o.kind = 'log'; o.mission = m; setNp(np); renderStart(); }, [NP, MIS]);
  await p.click('[data-start=vs]'); await p.waitForTimeout(1500);
  await p.evaluate(() => { UI.coach.level = 'off'; UI.tip = null; renderTip(); });
  await idle(); await sh('10assign');
  for (let k = 0; k < 60; k++) {
    const ph = await p.evaluate(() => G.phase); if (ph === 'play') break;
    if (await human()) {
      await p.evaluate(() => { const ph = G.phase, mv = myMoves(); if (ph === 'assign') { const tk = mv.find(m => m.t === 'take'); if (tk) { UI.job = tk.i; render(); } } });
      if (k === 0) { await p.waitForTimeout(300); await sh('11jobsel'); }
      await p.evaluate(() => { const ph = G.phase, mv = myMoves(); const pick = mv.find(m => m.t === 'take') || mv.find(m => m.t === 'pass') || mv.find(m => m.t === 'done') || mv.find(m => m.t === 'dist' && !m.on) || mv.find(m => m.t === 'give') || mv.find(m => m.t === 'predict' && m.n === 1) || mv.find(m => m.t === 'nosig') || mv.find(m => m.t === 'yes') || mv.find(m => m.t === 'keep') || mv.find(m => m.t === 'vote') || mv[0]; if (pick) doMove(pick); });
    }
    await p.waitForTimeout(250);
  }
  await p.waitForTimeout(1200); await idle(); await sh('20firstturn');
  // play a few tricks
  for (let k = 0; k < 6; k++) { await idle(); if (!(await human())) break; if (k === 1) { await p.evaluate(() => { const pm = myMoves().find(m => m.t === 'play'); if (pm) { UI.sel = pm.c; render(); } }); await p.waitForTimeout(350); await sh('21lifted'); } await p.evaluate(() => { const pm = myMoves().filter(m => m.t === 'play'); if (pm.length) doMove(pm[0]); }); await p.waitForTimeout(k === 2 ? 700 : 300); if (k === 2) await sh('22flight'); }
  await p.waitForTimeout(700); await sh('23mid');
  await p.evaluate(() => { const c = document.querySelector('.jc'); if (c) c.click(); }); await p.waitForTimeout(300); await sh('24jobpop'); await p.evaluate(() => closePop());
  await p.evaluate(() => { AIDELAY = 0; ANIM = 0; });
  for (let k = 0; k < 300; k++) { const o = await p.evaluate(() => ({ over: G.phase === 'over' && UI.overShown, mine: iMustAct() && canAct() })); if (o.over) break; if (o.mine) await p.evaluate(() => { const pm = myMoves().filter(m => m.t === 'play'); const any = pm[0] || myMoves()[0]; if (any) doMove(any); }); await p.waitForTimeout(40); }
  await p.waitForTimeout(600); await sh('30result');
  await p.evaluate(() => { document.querySelector('#rs [data-a=rsclose]').click(); }); await p.waitForTimeout(400); await sh('31after');
  await p.evaluate(() => { ANIM = 1; AIDELAY = 650; showStart(); }); await p.waitForTimeout(300); await sh('32title-resume');
  await p.click('[data-a=play]'); await p.waitForTimeout(200); await p.click('[data-start=hot]'); await p.waitForTimeout(900); await sh('33hotpass');
  console.log(t, 'errors', JSON.stringify(errs));
  await b.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
