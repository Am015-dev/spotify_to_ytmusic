// Screenshots + checks of the shared-kit preview (games/hollowbough-next/index.html) and the shelf home.
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
    await p.goto(BASE + 'hollowbough-next/index.html');
    await p.waitForTimeout(400); await shot('01-title');
    await ev(() => { localStorage.clear(); AIDELAY = 0; });
    await p.click('[data-start=guided]'); await p.waitForTimeout(300);
    // read the guide cards, let the computer play a little, then take our own turns through the real buttons
    const cont = async n => { for (let i = 0; i < n; i++) { const c = await p.$('#pc:not([hidden]) [data-a=cont]'); if (!c) break; await c.click(); await p.waitForTimeout(80); } };
    await cont(2); await shot('01b-guide');
    // our own turns: the helper's pick, played through act(); guide cards are read with Continue
    for (let k = 0; k < 14; k++) { await ev(() => { if (G.phase === 'over') return; if (UI.cards.length) { nextCard(); return; } const a = HB.actor(G); if (!G.players[a].ai) act(HB.AI.choose(G, a, 'normal')); }); await p.waitForTimeout(120); }
    for (let k = 0; k < 10; k++) { if (await ev(() => G.phase !== 'over' && !UI.cards.length && !G.players[HB.actor(G)].ai && !G.q)) break; await ev(() => { if (UI.cards.length) nextCard(); else { const a = HB.actor(G); if (!G.players[a].ai) act(HB.AI.choose(G, a, 'normal')); } }); await p.waitForTimeout(120); }
    await p.waitForTimeout(300);
    const rc = await ev(() => { const r = document.querySelector('.gx-recap'); return r && !r.hidden ? r.textContent : ''; });
    if (!rc) fail('no recap strip after computer turns'); await shot('02-recap');
    // undo: find a step of ours that keeps the decision with us and reveals nothing, take it, then undo it
    const u = await ev(() => { const a = HB.actor(G); if (G.players[a].ai || G.q) return 'not my turn';
      for (const m of HB.moves(G, a)) { const c = JSON.parse(JSON.stringify(G)); const r = HB.apply(c, m); if (r.ok && c.q && c.q.who === a && !revealed(G, c)) { const before = JSON.stringify(G); act(m); return { m: m.label || m.type, can: GX.undo.can(), before }; } }
      return 'none'; });
    if (u && u.can) { await p.waitForTimeout(150); await shot('03-undo-ready'); const ub = (await p.$('#pc:not([hidden]) [data-a=undo]')) || (await p.$('#acts [data-a=undo]')); if (!ub) fail('no undo button'); else { await ub.click(); await p.waitForTimeout(200); const same = await ev(b => JSON.stringify(G) === b, u.before); if (!same) fail('undo did not restore the state'); } }
    else console.log(t, 'undo: no undoable step found right now (' + JSON.stringify(u && u.m || u) + ')');
    // reference: bar button, list, chips, big view
    await p.click('.gx-bar [data-gx="gx-refd"]'); await p.waitForTimeout(300); await shot('04-reference');
    const n = await ev(() => document.querySelectorAll('.gx-ref-it').length); if (n < 90) fail('reference has only ' + n + ' entries');
    await p.click('.gx-ref-it[data-ref=c12]'); await p.waitForTimeout(200); await shot('05-reference-big');
    await p.click('.gx-ref-bh .gx-sb'); await p.fill('.gx-ref-q', 'berries'); await p.waitForTimeout(150); await shot('06-reference-search');
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    // settings: the same sections everywhere, no developer tools
    await p.click('.gx-bar [data-gx=setd]'); await p.waitForTimeout(300); await shot('07-settings');
    const secs = await ev(() => [...document.querySelectorAll('#setd .gx-sec h3')].map(x => x.textContent).join(','));
    if (!/^Game,Sound,Speed,Help,Accessibility,About$/.test(secs)) fail('settings sections', secs);
    if (await ev(() => /Test speed|Show speed|Copy report/.test(document.querySelector('#setd').textContent))) fail('developer tools visible without ?dev=1');
    await p.click('#setd-accessibility .gx-sb[data-v="1.15"]'); await p.click('#setd-accessibility .gx-tg'); // large text, colour-blind help
    await p.evaluate(() => document.querySelector('#setd-about').scrollIntoView()); await p.waitForTimeout(150); await shot('08-settings-about');
    await p.keyboard.press('Escape'); await p.waitForTimeout(200); await shot('09-large-text-cb');
    await ev(() => GX.setPref({ text: 1, cb: false }));
    // finish the game (our moves by the hint AI), read the result and the achievements
    await ev(() => { let guard = 0; UI.coach.level = 'off'; while (G.phase !== 'over' && guard++ < 3000) { if (UI.cards.length) { UI.cards = []; continue; } const a = HB.actor(G); if (G.players[a].ai) { aiStep(); clearTimeout(UI.tm); } else act(HB.AI.choose(G, a, 'normal')); clearTimeout(UI.tm); } UI.cards = []; UI.overShown = false; schedule(); });
    await p.waitForTimeout(300);
    for (let i = 0; i < 4; i++) { const ov = await ev(() => UI.cards[0] && UI.cards[0].kind); if (ov !== 'over') { const c = await p.$('#pc:not([hidden]) [data-a=cont]'); if (c) await c.click(); await p.waitForTimeout(100); } }
    await shot('10-game-over');
    const st = await ev(() => ({ s: GNS.stats('hollowbough'), a: Object.keys(GNS.earned('hollowbough')) }));
    if (!st.s || st.s.played < 1) fail('no result stored'); else console.log(t, 'result stored: played', st.s.played, 'won', st.s.won, 'best', st.s.best, 'achievements', st.a.join(' '));
    // the shelf home: continue row, stats and achievements
    await ev(() => { localStorage.setItem('hb_save1', '{"G":{}}'); });
    await p.goto(BASE + 'index.html'); await p.waitForTimeout(800);
    if (!(await ev(() => !document.getElementById('controw').hidden))) fail('no continue row on the shelf');
    await shot('11-shelf', 1);
    await ev(() => openMine()); await p.waitForTimeout(300); await shot('12-shelf-stats', 1);
    const reg = await ev(async () => { try { const r = await navigator.serviceWorker.getRegistration(); return r ? r.scope : 'none'; } catch (e) { return 'err ' + e.message; } });
    console.log(t, 'service worker scope', reg);
    await p.goto(BASE + 'credits.html'); await p.waitForTimeout(200); await shot('13-credits', 1);
    errs.forEach(e => fail('console', e));
    await ctx.close();
  }
  await b.close(); console.log('PROBLEMS', bad);
})();
