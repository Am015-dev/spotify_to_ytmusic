// Screenshots + checks of the shared-kit preview (games/tidewake-next/index.html) and the shelf home.
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
  const b = await PW.chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); let bad = 0;
  for (const [W, H] of SIZES) {
    const t = W + 'x' + H, phone = Math.min(W, H) <= 500;
    const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: phone, serviceWorkers: 'allow' });
    await ctx.route('**/*', r => new URL(r.request().url()).host === '127.0.0.1:' + PORT ? r.continue() : r.abort());
    const p = await ctx.newPage(); p.setDefaultTimeout(60000);
    const errs = []; p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon/.test(m.text())) errs.push(m.text()); });
    const fail = (c, d) => { bad++; console.log('FAIL', t, c, d || ''); };
    const shot = async (n, scrolls) => { const r = await p.evaluate(() => ({ h: document.documentElement.scrollHeight, w: document.documentElement.scrollWidth, vh: innerHeight, vw: innerWidth })); if ((!scrolls && r.h > r.vh + 1) || r.w > r.vw + 1 || r.vw !== W) fail('page scrolls at ' + n, JSON.stringify(r)); await p.screenshot({ path: path.join(OUT, `${t}_${n}.png`) }); };
    const ev = (f, a) => p.evaluate(f, a);
    // a human seat's turn, played with the hard advisor through act() (the page's own entry point for a tap)
    const myTurns = async n => { for (let k = 0; k < n; k++) { const done = await ev(() => { if (!G || G.over) return 1; const d = sideToAct(); if (d < 0 || !G.seats[d].human || UI.busy) return 0; const m = aiMove(d, 'hard'); if (m) act(m, d); return 0; }); if (done) break; await p.waitForTimeout(250); } };
    await p.goto(BASE + 'tidewake-next/index.html');
    await ev(() => { localStorage.clear(); });
    await p.reload(); await p.waitForTimeout(1200); await shot('01-title');
    await ev(() => { AIDELAY = 0; ANIM = 0; });
    await p.click('[data-a=guided]'); await p.waitForTimeout(800);
    await ev(() => { AIDELAY = 0; ANIM = 0; });
    await shot('01b-guide');
    // a normal 3-captain game against the computer for the recap, take-back and game over
    await ev(() => { showStart(); }); await p.waitForTimeout(300); await p.click('#quickgo'); await p.waitForTimeout(600);
    await ev(() => { AIDELAY = 0; ANIM = 0; });
    await myTurns(3); await p.waitForTimeout(800);
    const rc = await ev(() => { const r = document.querySelector('.gx-recap'); return r && !r.hidden ? r.textContent : ''; });
    if (!rc) fail('no recap strip after computer turns'); await shot('02-recap');
    // take-back: make one move, then take it back from the Menu
    for (let k = 0; k < 60; k++) { if (await ev(() => { const d = sideToAct(); return G.over || (d >= 0 && G.seats[d].human && !UI.busy); })) break; await p.waitForTimeout(250); }
    const u = await ev(() => { const d = sideToAct(); if (G.over || d < 0 || !G.seats[d].human) return 'not my turn'; const before = JSON.stringify(G); const m = aiMove(d, 'hard'); act(m, d); return { can: GX.undo.can(), before }; });
    if (u && u.can) {
      await p.waitForTimeout(400); await p.click('.gx-bar [data-gx=setd]'); await p.waitForTimeout(300); await shot('03-undo-ready');
      const ub = await p.$('#setd [data-a=rewind]'); if (!ub) fail('no take-back button in the menu'); else { await ub.click(); await p.waitForTimeout(400); const same = await ev(b => JSON.stringify(G) === b, u.before); if (!same) fail('take-back did not restore the state'); }
      await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    } else console.log(t, 'take-back: not available right now (' + JSON.stringify(u) + ')');
    // reference: bar button, list, big view, search
    await p.click('.gx-bar [data-gx="gx-refd"]'); await p.waitForTimeout(400); await shot('04-reference');
    const n = await ev(() => document.querySelectorAll('.gx-ref-it').length); if (n < 50) fail('reference has only ' + n + ' entries');
    const copies = await ev(() => document.querySelector('.gx-ref-n').textContent); if (!/56|7\d/.test(copies)) console.log(t, 'reference count line', copies);
    await p.click('.gx-ref-it[data-ref=lev1]'); await p.waitForTimeout(250); await shot('05-reference-big');
    await p.click('.gx-ref-bh .gx-sb'); await p.fill('.gx-ref-q', 'u-turn'); await p.waitForTimeout(200); await shot('06-reference-search');
    await p.keyboard.press('Escape'); await p.waitForTimeout(250);
    // settings: the same sections everywhere, no developer tools
    await p.click('.gx-bar [data-gx=setd]'); await p.waitForTimeout(300); await shot('07-settings');
    const secs = await ev(() => [...document.querySelectorAll('#setd .gx-sec h3')].map(x => x.textContent).join(','));
    if (!/^Game,Sound,Speed,Help,(Graphics,)?Accessibility,About$/.test(secs)) fail('settings sections', secs);
    if (await ev(() => /Test speed|Show speed|Copy report/.test(document.querySelector('#setd').textContent))) fail('developer tools visible without ?dev=1');
    await p.click('#setd-accessibility .gx-sb[data-v="1.15"]'); await p.click('#setd-accessibility .gx-tg'); // large text, colour-blind help
    await p.evaluate(() => document.querySelector('#setd-about').scrollIntoView()); await p.waitForTimeout(150); await shot('08-settings-about');
    await p.keyboard.press('Escape'); await p.waitForTimeout(400); await shot('09-large-text-cb');
    await ev(() => GX.setPref({ text: 1, cb: false }));
    // finish the game (every seat by the advisor), read the result and the achievements
    await ev(() => { ANIM = 0; let guard = 0; while (!G.over && guard++ < 4000) { const st = aiStep(true); if (!st) break; act(st.m, st.seat); } });
    await p.waitForTimeout(800); await shot('10-game-over');
    const st = await ev(() => ({ s: GNS.stats('tidewake'), a: Object.keys(GNS.earned('tidewake')), over: !!document.querySelector('[data-over]') }));
    if (!st.over) fail('no game-over card');
    if (!st.s || st.s.played < 1) fail('no result stored'); else console.log(t, 'result stored: played', st.s.played, 'won', st.s.won, 'achievements', st.a.join(' '));
    // the shelf home: continue row, stats and achievements
    await ev(() => { localStorage.setItem('tidewake_save1', '{"phase":"play","seats":[{}]}'); GNS.saved('tidewake', true); });
    await p.goto(BASE + 'index.html'); await p.waitForTimeout(900);
    if (!(await ev(() => { const c = document.getElementById('controw'); return c && !c.hidden; }))) console.log(t, 'note: no continue row on the shelf (tidewake-next is a preview)');
    await ev(() => { if (typeof openMine === 'function') openMine(); }); await p.waitForTimeout(400); await shot('12-shelf-stats', 1);
    const reg = await ev(async () => { try { const r = await navigator.serviceWorker.getRegistration(); return r ? r.scope : 'none'; } catch (e) { return 'err ' + e.message; } });
    console.log(t, 'service worker scope', reg);
    errs.forEach(e => fail('console', e));
    await ctx.close();
  }
  await b.close(); console.log('PROBLEMS', bad); srv.kill(); process.exit(bad ? 1 : 0);
})().catch(e => { console.error('FATAL', e); srv.kill(); process.exit(2); });
