// Screenshots + checks of the shared-kit preview (games/sands-of-qamar-next/index.html), with the guided first game.
//   node kit-shots.js [WxH,...]     shots land in shots/kit/ (gitignored); prints "FAIL ..." lines, then PROBLEMS n
// Serves the real games/ folder from a local http server (127.0.0.1 is a secure context) so the service worker and legal pages work as published.
const PW = require(process.env.PW || (require('child_process').execSync('npm root -g').toString().trim() + '/playwright'));
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..', 'games'), OUT = path.join(__dirname, 'shots', 'kit'); fs.mkdirSync(OUT, { recursive: true });
const SIZES = (process.argv[2] || '390x763,375x553,844x390,1366x768').split(',').map(s => s.split('x').map(Number));
const PORT = 19000 + (process.pid % 1000), BASE = 'http://127.0.0.1:' + PORT + '/';
const srv = require('child_process').spawn('python3', ['-m', 'http.server', String(PORT), '--bind', '127.0.0.1', '--directory', ROOT], { stdio: 'ignore' });
process.on('exit', () => { try { srv.kill(); } catch (e) { } });
(async () => {
  await new Promise(r => setTimeout(r, 800));
  const b = await PW.chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); let bad = 0;
  for (const [W, H] of SIZES) {
    const t = W + 'x' + H, phone = Math.min(W, H) <= 500;
    const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: phone, serviceWorkers: 'allow' });
    await ctx.route('**/*', r => new URL(r.request().url()).host === '127.0.0.1:' + PORT ? r.continue() : r.abort());
    const p = await ctx.newPage(); p.setDefaultTimeout(30000);
    const errs = []; p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon|WebSocket|GPU stall|WebGL/.test(m.text())) errs.push(m.text()); });
    const fail = (c, d) => { bad++; console.log('FAIL', t, c, d || ''); };
    const shot = async (n, scrolls) => { const r = await p.evaluate(() => ({ h: document.documentElement.scrollHeight, w: document.documentElement.scrollWidth, vh: innerHeight, vw: innerWidth })); if ((!scrolls && r.h > r.vh + 1) || r.w > r.vw + 1 || r.vw !== W) fail('page scrolls at ' + n, JSON.stringify(r)); await p.screenshot({ path: path.join(OUT, `${t}_${n}.png`) }); };
    const ev = (f, a) => p.evaluate(f, a);
    const glow = async () => { const g = await p.$('.gglow'); if (!g) return false; await g.scrollIntoViewIfNeeded().catch(() => { }); await g.click({ force: true }).catch(() => { }); await p.waitForTimeout(250); return true; };
    const waitMine = async (ms) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await ev(() => !!(G && (G.over || (me() && !UI.autoPlan))))) return true; await p.waitForTimeout(150); } return false; };
    await p.goto(BASE + 'sands-of-qamar-next/index.html');
    await ev(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(1500); await shot('01-title');
    await ev(() => { AIDELAY = 60; });
    await p.click('[data-ui=guided]'); await p.waitForTimeout(800);
    // round 1, one step at a time: the coach box and one glowing button
    const steps = {};
    for (let k = 0; k < 40; k++) {
      if (!(await waitMine(8000))) break;
      const s = await ev(() => { const g = guideStep(); return g ? (g.n || g.k) + ':' + G.phase + '/' + G.step : 'none'; });
      if (s === 'none' || /^lead/.test(s)) break;
      const n = s.split(':')[0]; if (!steps[n]) { steps[n] = 1; await shot('02-guide-step' + n); if (!(await p.$('.gglow'))) fail('no glowing button at guide step ' + s); }
      // undo once, on the tribe or tile step: take the step, then take it back
      if (!steps.undo && /turn\/(tile|sell)/.test(s) && (await ev(() => GX.undo.can()))) {
        steps.undo = 1; await shot('03-undo-ready'); const before = await ev(() => JSON.stringify(G));
        const ub = await p.$('[data-ui=kitundo]'); if (!ub) fail('no undo button'); else { await ub.click({ force: true }); await p.waitForTimeout(400); const after = await ev(() => JSON.stringify(G)); if (after === before) fail('undo changed nothing'); }
      }
      if (!(await glow())) { await ev(() => { const a = advice(); if (a && a.move) go(a.move); else if (a && a.plan) { UI.autoPlan = a.plan; runPlan(); } }); await p.waitForTimeout(250); }
    }
    console.log(t, 'guide steps seen', Object.keys(steps).join(' '), 'round', await ev(() => G.round));
    if (!steps['1'] || !steps['2'] || !steps['3']) fail('guided steps missing', Object.keys(steps).join(','));
    await waitMine(15000); await p.waitForTimeout(300);
    const rc = await ev(() => { const r = document.querySelector('.gx-recap'); return r && !r.hidden ? r.textContent.slice(0, 80) : ''; });
    if (!rc) console.log(t, 'recap: empty right now'); await shot('04-recap');
    if (await p.$('[data-ui=gok]')) { await shot('04b-now-you-lead'); await p.click('[data-ui=gok]', { force: true }); await p.waitForTimeout(200); }
    // reference
    await p.click('.gx-bar [data-gx="gx-refd"]'); await p.waitForTimeout(400); await shot('05-reference');
    const n = await ev(() => document.querySelectorAll('.gx-ref-it').length); if (n < 80) fail('reference has only ' + n + ' entries');
    await p.click('.gx-ref-it[data-ref="dj-wazira"]'); await p.waitForTimeout(250); await shot('06-reference-big');
    await p.click('.gx-ref-bh .gx-sb'); await p.fill('.gx-ref-q', 'palm'); await p.waitForTimeout(150); await shot('07-reference-search');
    await p.keyboard.press('Escape'); await p.waitForTimeout(250);
    // settings
    await p.click('.gx-bar [data-gx=setd]'); await p.waitForTimeout(350); await shot('08-settings');
    const secs = await ev(() => [...document.querySelectorAll('#setd .gx-sec h3')].map(x => x.textContent).join(','));
    if (!/^Game,Sound,Speed,Help,Graphics,Accessibility,About$/.test(secs)) fail('settings sections', secs);
    if (await ev(() => /Test speed|Show speed|Copy report/.test(document.body.innerText))) fail('developer tools visible without ?dev=1');
    await p.click('#setd-accessibility .gx-sb[data-v="1.15"]'); await p.click('#setd-accessibility .gx-tg');
    await ev(() => document.querySelector('#setd-about').scrollIntoView()); await p.waitForTimeout(150); await shot('09-settings-about');
    await p.keyboard.press('Escape'); await p.waitForTimeout(300); await shot('10-large-text-cb');
    await ev(() => GX.setPref({ text: 1, cb: false }));
    // finish the game: our seat plays the normal computer's moves
    await ev(() => { ANIM = 0; AIDELAY = 0; UI.coach = false; let n = 0; while (G && !G.over && n++ < 6000) { const s = sideToAct(); const m = aiMove(s); if (!m) break; go(m); } refresh(); });
    await p.waitForTimeout(800); await shot('11-game-over');
    if (!(await ev(() => !!(G && G.over)))) fail('game did not end');
    const st = await ev(() => ({ s: GNS.stats('sands'), a: Object.keys(GNS.earned('sands')) }));
    if (!st.s || st.s.played < 1) fail('no result stored'); else console.log(t, 'result stored: played', st.s.played, 'won', st.s.won, 'best', st.s.best, 'achievements', st.a.join(' '));
    const reg = await ev(async () => { try { const r = await navigator.serviceWorker.getRegistration(); return r ? r.scope : 'none'; } catch (e) { return 'err ' + e.message; } });
    console.log(t, 'service worker scope', reg);
    errs.forEach(e => fail('console', e));
    await ctx.close();
  }
  await b.close(); console.log('PROBLEMS', bad); srv.kill(); process.exit(bad ? 1 : 0);
})().catch(e => { console.error('FATAL', e); srv.kill(); process.exit(2); });
