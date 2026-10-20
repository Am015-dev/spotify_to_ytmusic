// Screenshot helper: node shoot.js [WxH] [phone] [np] [gfx] -> shots/s_<size>_*.png
// title, setup (+ Configure sheet on phones), first turn, lifted plate, serve flight, reveal, landed, mid game, group info, round scoring, final, hot-seat card
const PW = require(process.env.PW || (require('child_process').execSync('npm root -g').toString().trim() + '/playwright'));
const fs = require('fs'), path = require('path'); const OUT = path.join(__dirname, 'shots'); fs.mkdirSync(OUT, { recursive: true });
const html = fs.readFileSync(path.join(__dirname, 'kaiten.html'));
const [W, H] = (process.argv[2] || '1366x768').split('x').map(Number); const PH = process.argv[3] === 'phone'; const NP = +(process.argv[4] || 4); const GFX = process.argv[5] || 'high';
(async () => {
  const b = await PW.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext(Object.assign({ viewport: { width: W, height: H }, deviceScaleFactor: 1 }, PH ? { isMobile: true, hasTouch: true } : {}));
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load/.test(m.text())) errs.push(m.text()); });
  const t = `${W}x${H}`; const sh = n => p.screenshot({ path: path.join(OUT, `s_${t}_${n}.png`) });
  const idle = async () => { for (let k = 0; k < 80; k++) { if (await p.evaluate(() => canPick() && !UI.busy && !(PX.on && PX.state().moving))) return; await p.evaluate(() => { const c = document.querySelector('#pc:not([hidden]) [data-a=cont],#pc:not([hidden]) [data-a=take]'); if (c) c.click(); }); await p.waitForTimeout(120); } };
  await p.goto('https://gns.test/'); await p.waitForTimeout(1500);
  await p.evaluate(g => { try { localStorage.setItem('kk_save', ''); } catch (e) { } if (PX.on) setGfx(g); }, GFX);
  await sh('00title');
  await p.click('[data-a=play]'); await p.waitForTimeout(400); await sh('01setup');
  if (PH) { await p.click('[data-a=cfgopen]'); await p.waitForTimeout(300); await sh('02configure'); await p.click('#cfg .cfghead [data-a=cfgclose]'); await p.waitForTimeout(200); }
  await p.evaluate(np => { UI.seed = 7; AIDELAY = 650; UI.opt.np = np; setNp(np); renderStart(); }, NP);
  await p.click('[data-start=vs]'); await p.waitForTimeout(1600); await idle();
  await sh('10turn');
  await p.click('#belt .hc[data-up="1"] >> nth=2'); await p.waitForTimeout(260); await sh('12flight');   // one tap grabs
  for (let k = 0; k < 60; k++) { if (await p.evaluate(() => !!document.querySelector('#stage'))) break; await p.waitForTimeout(60); } await p.waitForTimeout(500); await sh('11stage');
  for (let k = 0; k < 60; k++) { if (await p.evaluate(() => !!document.querySelector('.kk-cloche.kk-lift'))) break; await p.waitForTimeout(60); } await p.waitForTimeout(300); await sh('13reveal');
  for (let k = 0; k < 40; k++) { if (await p.evaluate(() => UI.fz && !UI.fz.slots)) break; await p.waitForTimeout(50); } await p.waitForTimeout(260); await sh('14landing');
  for (let k = 0; k < 60; k++) { if (await p.evaluate(() => !!document.querySelector('.flyc.pass'))) break; await p.waitForTimeout(50); } await p.waitForTimeout(550); await sh('14pass');
  await idle();
  // play a few turns, then shoot the middle of the round
  for (let turn = 0; turn < 4; turn++) { await idle(); await p.evaluate(() => { UI.sel = [0]; serveSel(); }); await p.waitForTimeout(400); }
  await idle(); await p.waitForTimeout(600); await sh('15mid');
  await p.evaluate(() => { const g = document.querySelector('#tbl .seat.me .grp'); if (g) g.click(); }); await p.waitForTimeout(300); await sh('16groupinfo'); await p.evaluate(() => closePop());
  // finish round 1 quickly, shoot the score pad once the counting is done
  await p.evaluate(() => { AIDELAY = 0; ANIM = 0; });
  for (let k = 0; k < 200; k++) { const o = await p.evaluate(() => ({ rs: !$('#rs').hidden, pk: canPick() })); if (o.rs) break; if (o.pk) await p.evaluate(() => { UI.sel = [0]; serveSel(); }); await p.waitForTimeout(80); }
  await p.waitForTimeout(800); await sh('20roundpad');
  for (let k = 0; k < 400; k++) { const o = await p.evaluate(() => ({ rs: !$('#rs').hidden, pk: canPick(), over: G.phase === 'over' && UI.overShown })); if (o.over) break; if (o.rs) { await p.evaluate(() => { const n = document.querySelector('#rs [data-a=rsnext]'); if (n) n.click(); }); } else if (o.pk) await p.evaluate(() => { UI.sel = [0]; serveSel(); }); await p.waitForTimeout(60); }
  await p.waitForTimeout(700); await sh('21final');
  await p.evaluate(() => { document.querySelector('#rs [data-a=rsclose]').click(); }); await p.waitForTimeout(400); await sh('22aftergame');
  await p.evaluate(() => { ANIM = 1; AIDELAY = 650; showStart(); }); await p.waitForTimeout(300); await sh('23title-resume');
  await p.click('[data-a=play]'); await p.waitForTimeout(200); await p.click('[data-start=hot]'); await p.waitForTimeout(800); await sh('24hotpass');
  console.log(t, 'errors', JSON.stringify(errs));
  await b.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
