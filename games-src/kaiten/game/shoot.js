// Screenshot helper: node shoot.js [WxH] [phone] -> shots/s_<size>_*.png (start, turn, selected, reveal, pass, round pad, final, hot-seat card)
const PW = require(process.env.PW || (require('child_process').execSync('npm root -g').toString().trim() + '/playwright'));
const fs = require('fs'), path = require('path'); const OUT = path.join(__dirname, 'shots'); fs.mkdirSync(OUT, { recursive: true });
const html = fs.readFileSync(path.join(__dirname, 'kaiten.html'));
const [W, H] = (process.argv[2] || '1366x768').split('x').map(Number); const PH = process.argv[3] === 'phone'; const NP = +(process.argv[4] || 4);
(async () => {
  const b = await PW.chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await b.newContext(Object.assign({ viewport: { width: W, height: H }, deviceScaleFactor: 1 }, PH ? { isMobile: true, hasTouch: true } : {}));
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load/.test(m.text())) errs.push(m.text()); });
  const t = `${W}x${H}`; const sh = n => p.screenshot({ path: path.join(OUT, `s_${t}_${n}.png`) });
  await p.goto('https://gns.test/' + (PH ? '?phone=1' : '')); await p.waitForTimeout(700); await sh('0start');
  await p.evaluate(np => { UI.seed = 7; AIDELAY = 200; UI.opt = { np, level: 'normal', lv: ['normal', 'normal', 'normal', 'normal'] }; }, NP);
  await p.click('[data-start=vs]'); await p.waitForTimeout(1200);
  for (let k = 0; k < 6; k++) { await p.evaluate(() => { try { while (UI.cards.length) nextCard(); } catch (e) { } }); await p.waitForTimeout(100); }
  await sh('1turn');
  await p.evaluate(() => { const h = G.players[0].hand; UI.sel = [2]; render(); }); await p.waitForTimeout(300); await sh('2sel');
  // play three turns, shoot the reveal
  for (let turn = 0; turn < 3; turn++) {
    await p.evaluate(() => { UI.sel = [0]; serveSel(); }); await p.waitForTimeout(turn === 1 ? 1100 : 2600);
    if (turn === 1) { await sh('3cover'); await p.waitForTimeout(500); await sh('4reveal'); await p.waitForTimeout(900); await sh('5landed'); await p.waitForTimeout(1500); }
    for (let k = 0; k < 20; k++) { if (await p.evaluate(() => canPick())) break; await p.waitForTimeout(250); }
  }
  await sh('6mid');
  await p.evaluate(() => { const g = document.querySelector('#tbl .seat.me .grp'); if (g) g.click(); }); await p.waitForTimeout(300); await sh('7groupinfo'); await p.evaluate(() => closePop());
  // finish round 1 quickly
  await p.evaluate(() => { AIDELAY = 0; ANIM = 0; });
  for (let k = 0; k < 120; k++) { const o = await p.evaluate(() => ({ rs: !$('#rs').hidden, pk: canPick(), over: G.phase === 'over' })); if (o.rs) break; if (o.pk) await p.evaluate(() => { UI.sel = [0]; serveSel(); }); await p.waitForTimeout(150); }
  await p.waitForTimeout(500); await sh('8roundpad');
  await p.evaluate(() => { ANIM = 1; });
  await p.evaluate(() => { ANIM = 0; });
  for (let k = 0; k < 400; k++) { const o = await p.evaluate(() => ({ rs: !$('#rs').hidden, pk: canPick(), over: G.phase === 'over' && UI.overShown })); if (o.over) break; if (o.rs) { await p.evaluate(() => { const n = document.querySelector('#rs [data-a=rsnext]'); if (n) n.click(); }); } else if (o.pk) await p.evaluate(() => { UI.sel = [0]; serveSel(); }); await p.waitForTimeout(80); }
  await p.waitForTimeout(600); await sh('9final');
  await p.evaluate(() => { document.querySelector('#rs [data-a=rsclose]').click(); }); await p.waitForTimeout(300); await sh('10aftergame');
  // hot seat
  await p.evaluate(() => { showStart(); }); await p.waitForTimeout(200);
  await p.click('[data-start=hot]'); await p.waitForTimeout(600); await sh('11hotpass');
  console.log('errors', JSON.stringify(errs));
  await b.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
