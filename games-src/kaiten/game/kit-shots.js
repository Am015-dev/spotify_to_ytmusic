// Screenshots + checks of the shared-kit preview (games/kaiten-kitchen-next/index.html) and the shelf home.
//   node kit-shots.js [WxH,...]     shots land in shots/kit/ (gitignored); prints "FAIL ..." lines, then PROBLEMS n
// Serves the real games/ folder from a local http server (127.0.0.1 is a secure context) so the service worker,
// legal pages and shelf work as published.
const PW = require(process.env.PW || (require('child_process').execSync('npm root -g').toString().trim() + '/playwright'));
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..', '..', 'games'), OUT = path.join(__dirname, 'shots', 'kit'); fs.mkdirSync(OUT, { recursive: true });
const SIZES = (process.argv[2] || '390x763,375x553,844x390,1366x768').split(',').map(s => s.split('x').map(Number));
const PORT = 18000 + (process.pid % 1000), BASE = 'http://127.0.0.1:' + PORT + '/';
const srv = require('child_process').spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1', '--directory', ROOT], { stdio: 'ignore' });
process.on('exit', () => { try { srv.kill(); } catch (e) { } });
(async () => {
  await new Promise(r => setTimeout(r, 800));
  const b = await PW.chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' }); let bad = 0;
  for (const [W, H] of SIZES) {
    const t = W + 'x' + H, phone = Math.min(W, H) <= 500;
    const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: phone, serviceWorkers: 'allow' });
    await ctx.route('**/*', r => new URL(r.request().url()).host === '127.0.0.1:' + PORT ? r.continue() : r.abort());
    const p = await ctx.newPage(); p.setDefaultTimeout(30000);
    const errs = []; p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon/.test(m.text())) errs.push(m.text()); });
    const fail = (c, d) => { bad++; console.log('FAIL', t, c, d || ''); };
    const shot = async (n, scrolls) => { const r = await p.evaluate(() => ({ h: document.documentElement.scrollHeight, w: document.documentElement.scrollWidth, vh: innerHeight, vw: innerWidth })); if ((!scrolls && r.h > r.vh + 1) || r.w > r.vw + 1 || r.vw !== W) fail('page scrolls at ' + n, JSON.stringify(r)); await p.screenshot({ path: path.join(OUT, `${t}_${n}.png`) }); };
    const ev = (f, a) => p.evaluate(f, a);
    await p.goto(BASE + 'kaiten-kitchen-next/index.html'); await p.waitForTimeout(500);
    await ev(() => { localStorage.clear(); }); await p.reload(); await p.waitForTimeout(600);
    await shot('01-title');
    await p.click('#start [data-a=play]'); await p.waitForTimeout(300);
    if (!(await p.$('#start .sbtn.big[data-start=guided]'))) fail('the lesson is not the big button for a first game');
    await p.click('[data-start=guided]'); await p.waitForTimeout(500); await shot('02-lesson-step');
    // the lesson: six scripted steps through the real buttons (Show me -> glowing plate -> Serve)
    for (let k = 0; k < 6; k++) {
      await p.waitForSelector('#pc:not([hidden]) [data-a=cont]', { timeout: 20000 }).catch(() => fail('no lesson card at step ' + (k + 1)));
      await p.click('#pc [data-a=cont]'); await p.waitForTimeout(250);
      const tt = await p.$('#belt .hc.tut'); if (!tt) { fail('no glowing plate at step ' + (k + 1)); break; }
      if (k === 0) await shot('03-lesson-glow');
      await tt.click(); await p.waitForTimeout(150);
      if (!(await p.$('#acts [data-a=serve].tut'))) fail('Serve is not glowing at step ' + (k + 1));
      await p.click('#acts [data-a=serve]');
      await p.waitForFunction(n => G.turn > n || G.round > 1, k + 1, { timeout: 20000 }).catch(() => fail('turn did not advance at step ' + (k + 1)));
      await p.waitForFunction(() => !UI.busy, null, { timeout: 20000 }).catch(() => { });
    }
    await p.waitForSelector('#pc:not([hidden]) [data-a=cont]', { timeout: 20000 }).catch(() => fail('no hand-over card')); await p.waitForTimeout(200);
    await shot('04-lesson-done'); await p.click('#pc [data-a=cont]'); await p.waitForTimeout(200);
    const rc = await ev(() => { const r = document.querySelector('.gx-recap'); return r && !r.hidden ? r.textContent : ''; });
    if (!rc) fail('no recap strip after a reveal'); await shot('05-recap');
    // undo: serve, then take it back inside the take-back window
    await ev(() => { UI.prefs.undo = 'long'; });
    const c = await p.$('#belt .hc[data-up="1"]:not(.locked)'); await c.click(); await p.waitForTimeout(150);
    const before = await ev(() => JSON.stringify(G)); await p.click('#acts [data-a=serve]'); await p.waitForTimeout(250);
    await shot('06-undo-ready');
    const ub = await p.$('#acts [data-a=undo]'); if (!ub) fail('no Undo button after serving'); else { await ub.click(); await p.waitForTimeout(200); if (!(await ev(b => JSON.stringify(G) === b && !UI.hold && UI.sel.length === 1, before))) fail('undo did not restore the belt'); }
    await shot('07-undone');
    // reference: bar button, list, chips, big view
    await p.click('.gx-bar [data-gx="gx-refd"]'); await p.waitForTimeout(300); await shot('08-reference');
    const n = await ev(() => document.querySelectorAll('.gx-ref-it').length); if (n < 18) fail('reference has only ' + n + ' entries');
    await p.click('.gx-ref-it[data-ref=p-wasabi]'); await p.waitForTimeout(200); await shot('09-reference-big');
    await p.click('.gx-ref-bh .gx-sb'); await p.fill('.gx-ref-q', 'custard'); await p.waitForTimeout(150); await shot('10-reference-search');
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    // "Read it big" from a plate group on the table
    const g = await p.$('#tbl .grp:not(.shelf)'); if (g) { await g.click(); await p.waitForTimeout(150); const rb = await p.$('#ppop [data-a=refbig]'); if (!rb) fail('no Read it big on a plate pop-up'); else { await rb.click(); await p.waitForTimeout(250); if (!(await ev(() => GX.open === 'gx-refd' && !document.querySelector('.gx-ref-big').hidden))) fail('Read it big did not open the big view'); await p.keyboard.press('Escape'); await p.waitForTimeout(150); } }
    // settings: the same sections everywhere, no developer tools
    await p.click('.gx-bar [data-gx=setd]'); await p.waitForTimeout(300); await shot('11-settings');
    const secs = await ev(() => [...document.querySelectorAll('#setd .gx-sec h3')].map(x => x.textContent).join(','));
    if (!/^Game,Sound,Speed,Help,Graphics,Accessibility,About$/.test(secs)) fail('settings sections', secs);
    if (await ev(() => /Test speed|Show speed|Copy report/.test(document.querySelector('#setd').textContent))) fail('developer tools visible without ?dev=1');
    await p.click('#setd-accessibility .gx-sb[data-v="1.15"]'); await p.click('#setd-accessibility .gx-tg');
    await p.evaluate(() => document.querySelector('#setd-about').scrollIntoView()); await p.waitForTimeout(150); await shot('12-settings-about');
    await p.keyboard.press('Escape'); await p.waitForTimeout(200); await shot('13-large-text-cb');
    await ev(() => GX.setPref({ text: 1, cb: false }));
    // finish the meal fast (engine moves for every seat), then the final card with the result and achievements
    await ev(() => { ANIM = 0; AIDELAY = 0; UI.prefs.undo = 'off'; UI.coach.level = 'off'; UI.tut = null; UI.cards = []; clearTimeout(UI.tm); UI.seq++; const pc = document.getElementById('pc'); pc.hidden = true;
      while (G.phase !== 'over') { const s = KK.pending(G)[0]; KK.apply(G, s, { pick: KK.AI.choose(G, s, 'normal').pick }); }
      UI.busy = false; UI.fz = null; closeRS(); render(); showFinal(); });
    await p.waitForTimeout(400); await shot('14-game-over');
    const st = await ev(() => ({ s: GNS.stats('kaiten'), a: Object.keys(GNS.earned('kaiten')) }));
    if (!st.s || st.s.played < 1) fail('no result stored'); else console.log(t, 'result stored: played', st.s.played, 'won', st.s.won, 'best', st.s.best, 'achievements', st.a.join(' '));
    if (await ev(() => !!localStorage.getItem('kk_save'))) fail('save not cleared at game over');
    // the shelf home: continue row, stats and achievements
    await ev(() => { localStorage.setItem('kk_save', '{"sv":2,"G":{}}'); });
    await p.goto(BASE + 'index.html'); await p.waitForTimeout(800);
    if (!(await ev(() => !document.getElementById('controw').hidden))) fail('no continue row on the shelf');
    await ev(() => openMine()); await p.waitForTimeout(300); await shot('15-shelf-stats', 1);
    const reg = await ev(async () => { try { const r = await navigator.serviceWorker.getRegistration(); return r ? r.scope : 'none'; } catch (e) { return 'err ' + e.message; } });
    console.log(t, 'service worker scope', reg);
    errs.forEach(e => fail('console', e));
    await ctx.close();
  }
  await b.close(); console.log('PROBLEMS', bad); srv.kill(); process.exit(bad ? 1 : 0);
})().catch(e => { console.error('FATAL', e); srv.kill(); process.exit(2); });
