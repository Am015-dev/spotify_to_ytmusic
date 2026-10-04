// Quick visual check: node look.js WxH [phone] [np] [mission] [tag]  -> shots/look_<tag>_<size>_*.png
const PW = require(process.env.PW || (require('child_process').execSync('npm root -g').toString().trim() + '/playwright'));
const fs = require('fs'), path = require('path'); const OUT = path.join(__dirname, 'shots'); fs.mkdirSync(OUT, { recursive: true });
const html = fs.readFileSync(path.join(__dirname, 'lantern-dive.html'));
const [W, H] = (process.argv[2] || '390x763').split('x').map(Number); const PH = process.argv[3] === 'phone'; const NP = +(process.argv[4] || 3); const MIS = +(process.argv[5] || 7); const TAG = process.argv[6] || 'a';
(async () => {
  const b = await PW.chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext(Object.assign({ viewport: { width: W, height: H }, deviceScaleFactor: +(process.env.DPR || 1) }, PH ? { isMobile: true, hasTouch: true } : {}));
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  const sh = n => p.screenshot({ path: path.join(OUT, `look_${TAG}_${W}x${H}_${n}.png`) });
  await p.goto('https://gns.test/'); await p.waitForTimeout(1500);
  await p.evaluate(([np, m]) => { try { localStorage.clear(); } catch (e) { } UI.seed = 21; AIDELAY = 200; ANIM = 1; const o = optObj(); o.kind = 'log'; o.mission = m; setNp(np); showStart(); UI.sv = 'setup'; renderStart(); document.querySelector('[data-start=vs]').click(); }, [NP, MIS]);
  await p.waitForTimeout(2500);
  await p.evaluate(() => { UI.coach.level = 'off'; UI.tip = null; renderTip(); });
  const must = () => p.evaluate(() => iMustAct() && canAct());
  const wait = async () => { for (let k = 0; k < 400; k++) { if (await must()) return true; await p.waitForTimeout(150); } return false; };
  await wait(); await p.waitForTimeout(1500); await sh('1assign'); await p.evaluate(() => { ANIM = 0; AIDELAY = 30; });
  // job pop-up from my own chip / pool card
  let shots = 0, ph0 = '';
  for (let k = 0; k < 400 && shots < 7; k++) {
    if (!(await wait())) break;
    const st = await p.evaluate(() => ({ ph: G.phase, tr: G.tricks.length, pl: G.trick ? G.trick.plays.length : 0 }));
    if (st.ph !== ph0 && ['distress', 'pass', 'signal'].includes(st.ph)) { await p.waitForTimeout(700); await sh('2' + st.ph); }
    ph0 = st.ph;
    if (st.ph === 'play' && st.tr === 1 && st.pl === 0 && shots < 3) { shots = 3; await p.waitForTimeout(900); await sh('3play'); await p.evaluate(() => { const c = document.querySelector('.jc'); if (c) c.click(); }); await p.waitForTimeout(500); await sh('4pop'); await p.evaluate(() => closePop()); await p.evaluate(() => { document.querySelector('#pile [data-a=last]') && document.querySelector('#pile [data-a=last]').click(); }); await p.waitForTimeout(500); await sh('5last'); await p.evaluate(() => closePop()); }
    await p.evaluate(() => { const ph = G.phase, mv = myMoves(); const pick = (ph === 'assign' && (mv.find(m => m.t === 'take') || mv.find(m => m.t === 'pass'))) || (ph === 'play' && mv.find(m => m.t === 'play')) || mv.find(m => m.t === 'dist' && m.on && m.dir === 1) || mv.find(m => m.t === 'give') || mv.find(m => m.t === 'nosig') || mv.find(m => m.t === 'predict') || mv[0]; if (pick) doMove(pick); });
    await p.waitForTimeout(250);
    if (st.ph === 'play' && st.tr === 3 && shots < 4) { shots = 4; await p.waitForTimeout(900); await sh('6mid'); }
  }
  console.log('errors', JSON.stringify(errs)); await b.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
