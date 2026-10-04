// Screenshots + checks of the shared-kit preview (games/short-fuse-next/index.html) and the shelf home.
//   node kit-shots.js [WxH,...]     shots land in shots/kit/ (gitignored); prints "FAIL ..." lines, then PROBLEMS n
// Serves the real games/ folder from a local http server so the service worker, legal pages and shelf work as published.
const PW = require(process.env.PW || (require('child_process').execSync('npm root -g').toString().trim() + '/playwright'));
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..', '..', 'games'), OUT = path.join(__dirname, 'shots', 'kit'); fs.mkdirSync(OUT, { recursive: true });
const SIZES = (process.argv[2] || '390x763,375x553,844x390,1366x768').split(',').map(s => s.split('x').map(Number));
const PORT = 19000 + (process.pid % 1000), BASE = 'http://127.0.0.1:' + PORT + '/';
const srv = require('child_process').spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1', '--directory', ROOT], { stdio: 'ignore' });
process.on('exit', () => { try { srv.kill(); } catch (e) { } });
(async () => {
  await new Promise(r => setTimeout(r, 800));
  const b = await PW.chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' }); let bad = 0;
  for (const [W, H] of SIZES) {
    const t = W + 'x' + H, phone = Math.min(W, H) <= 500;
    const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: phone, serviceWorkers: 'allow' });
    const ext = new Set(); await ctx.route('**/*', r => { const h = new URL(r.request().url()).host; if (h === '127.0.0.1:' + PORT) return r.continue(); ext.add(h); r.abort(); });
    const p = await ctx.newPage(); p.setDefaultTimeout(30000);
    const errs = []; p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon/.test(m.text())) errs.push(m.text()); });
    const fail = (c, d) => { bad++; console.log('FAIL', t, c, d || ''); };
    const shot = async (n, scrolls) => { const r = await p.evaluate(() => ({ h: document.documentElement.scrollHeight, w: document.documentElement.scrollWidth, vh: innerHeight, vw: innerWidth })); if ((!scrolls && r.h > r.vh + 1) || r.w > r.vw + 1 || r.vw !== W) fail('page scrolls at ' + n, JSON.stringify(r)); await p.screenshot({ path: path.join(OUT, `${t}_${n}.png`) }); };
    const ev = (f, a) => p.evaluate(f, a);
    await p.goto(BASE + 'short-fuse-next/index.html'); await p.waitForTimeout(500);
    await ev(() => { localStorage.clear(); }); await p.reload(); await p.waitForTimeout(1200);
    await shot('01-title');
    if (!(await p.$('#start .tbtn.go[data-a=tutorial]'))) fail('the guided game is not the main button for a new player');
    await p.click('#start [data-a=stplay]'); await p.waitForTimeout(300); await shot('02-setup');
    if (await p.$('[data-a=stboard]')) { await p.click('[data-a=stboard]'); await p.waitForTimeout(250); await shot('03-mission-board'); await p.click('.jt[data-n="1"]'); await p.waitForTimeout(200); }
    await p.click('[data-a=sttitle]'); await p.waitForTimeout(200);
    await p.click('[data-a=tutorial]'); await p.waitForTimeout(1500); await shot('04-guided-brief');
    // play the guided job through the dock until our turn comes round again after the computers acted
    const ack = async () => { const bt = await p.$('[data-a=briefok]:visible, [data-a=coach]:visible, [data-a=myack]:visible, [data-a=coachok]:visible'); if (bt) { await bt.click().catch(() => { }); await p.waitForTimeout(150); return true; } return false; };
    let recap = '';
    for (let i = 0; i < 200 && !recap; i++) {
      if (await ack()) continue;
      const st = await ev(() => ({ my: !!(UI.V && UI.V.legal), q: !!(UI.V && UI.V.q && UI.V.q.who === UI.V.seat), r: (() => { const r = document.querySelector('.gx-recap'); return r && !r.hidden ? r.textContent : ''; })() }));
      if (st.my && st.r) { recap = st.r; break; }
      if (st.q) { await ev(() => { const s = UI.V.seat; const m = aiMove(s); if (m) act(m, s); }); await p.waitForTimeout(200); continue; }
      if (st.my) { await ev(() => { const s = UI.V.seat; const m = aiMove(s); if (m) act(m, s); }); await p.waitForTimeout(300); continue; }
      await p.waitForTimeout(300);
    }
    if (!recap) fail('no recap strip on a later turn'); await shot('05-recap');
    // "undo" in Short Fuse is for the unconfirmed choice: point, then Start again / Change (a Snip reveals, so it cannot be taken back)
    const pa = await p.$('.palist .pa'); if (pa) { await ev(() => { const d = document.querySelector('.palist'); if (d) d.open = true; }); await (await p.$('.palist .pa')).click(); await p.waitForTimeout(200); await shot('06-choice-take-back'); const ch = await p.$('[data-a=untarget]:visible, [data-a=cancel]:visible'); if (!ch) fail('no way to take the choice back'); else { await ch.click(); await p.waitForTimeout(200); if (await ev(() => !!(UI.sel && UI.sel.tg && UI.sel.tg.length))) fail('the choice was not taken back'); } }
    else if (!phone) fail('no Point from a list buttons on our turn');
    // reference
    await p.click('.gx-bar [data-gx="gx-refd"]'); await p.waitForTimeout(300); await shot('07-reference');
    const n = await ev(() => document.querySelectorAll('.gx-ref-it').length); if (n < 150) fail('reference has only ' + n + ' entries');
    const first = await p.$('.gx-ref-it'); await first.click(); await p.waitForTimeout(200); await shot('08-reference-big');
    await p.click('.gx-ref-bh .gx-sb'); await p.fill('.gx-ref-q', 'probe'); await p.waitForTimeout(150); await shot('09-reference-search');
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    // settings
    await p.click('.gx-bar [data-gx=setd]'); await p.waitForTimeout(300); await shot('10-settings');
    const secs = await ev(() => [...document.querySelectorAll('#setd .gx-sec h3')].map(x => x.textContent).join(','));
    if (!/^Game,Sound,Speed,Help,Graphics,Accessibility,About$/.test(secs)) fail('settings sections', secs);
    if (await ev(() => /Test speed|Show speed|Copy report/.test(document.querySelector('#setd').textContent))) fail('developer tools visible without ?dev=1');
    await p.click('#setd-accessibility .gx-sb[data-v="1.15"]'); await p.click('#setd-accessibility .gx-tg');
    await p.evaluate(() => document.querySelector('#setd-about').scrollIntoView()); await p.waitForTimeout(150); await shot('11-settings-about');
    await p.keyboard.press('Escape'); await p.waitForTimeout(300); await shot('12-large-text-cb');
    await ev(() => GX.setPref({ text: 1, cb: false }));
    // finish the job with the computer's moves for every seat, then the end card with the result
    await ev(() => { UI.coach = false; UI.brief = null; UI.myAck = true; clearTimeout(UI.aiT); UI.aiT = null; let g = 0; while (G && !G.over && g++ < 3000) { let st = aiStep(); if (!st) { const s = sideToAct(); if (s >= 0) { const m = aiMove(s); if (m) st = { seat: s, m }; } } if (!st) for (const q of G.seats) { const vm = validMoves(q.i); if (vm.length) { st = { seat: q.i, m: vm[0] }; break; } } if (!st) break; performMove(st.m, st.seat); } refresh(); });
    await p.waitForTimeout(1500); await shot('13-game-over');
    const st = await ev(() => ({ s: GNS.stats('shortfuse'), a: Object.keys(GNS.earned('shortfuse')) }));
    if (!st.s || st.s.played < 1) fail('no result stored'); else console.log(t, 'result stored: played', st.s.played, 'won', st.s.won, 'achievements', st.a.join(' '));
    const extGame = [...ext]; ext.clear();
    await ev(() => { localStorage.setItem('shortfuse_save1', '{"G":{"mission":3,"turn":4},"ui":{}}'); });
    await p.goto(BASE + 'index.html'); await p.waitForTimeout(800);
    await ev(() => openMine()); await p.waitForTimeout(300); await shot('14-shelf-stats', 1);
    const reg = await ev(async () => { try { const r = await navigator.serviceWorker.getRegistration(); return r ? r.scope : 'none'; } catch (e) { return 'err ' + e.message; } });
    console.log(t, 'service worker scope', reg, 'outside requests from the game', extGame.join(' ') || 'none');
    if (extGame.length) fail('the game page requested another server', extGame.join(' '));
    errs.forEach(e => fail('console', e));
    await ctx.close();
  }
  await b.close(); console.log('PROBLEMS', bad); srv.kill(); process.exit(bad ? 1 : 0);
})().catch(e => { console.error('FATAL', e); srv.kill(); process.exit(2); });
