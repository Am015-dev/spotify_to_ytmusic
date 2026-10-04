// Screenshots + checks of the shared-kit preview (games/thornbound-new/index.html).
//   node kit-shots.js [WxH,...]     shots land in shots/kit/ (gitignored); prints "FAIL ..." lines, then PROBLEMS n
// Serves the real games/ folder from a local http server (127.0.0.1 is a secure context) so the service worker and legal pages work as published.
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
    const errs = []; p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon|WebSocket/.test(m.text())) errs.push(m.text()); });
    const fail = (c, d) => { bad++; console.log('FAIL', t, c, d || ''); };
    const shot = async (n, scrolls) => { const r = await p.evaluate(() => ({ h: document.documentElement.scrollHeight, w: document.documentElement.scrollWidth, vh: innerHeight, vw: innerWidth })); if ((!scrolls && r.h > r.vh + 1) || r.w > r.vw + 1 || r.vw !== W) fail('page scrolls at ' + n, JSON.stringify(r)); await p.screenshot({ path: path.join(OUT, `${t}_${n}.png`) }); };
    const ev = (f, a) => p.evaluate(f, a);
    const pri = async () => { const x = await p.$('#act .btn.pri:not([data-a=undo])'); if (x) { await x.click(); await p.waitForTimeout(150); return true; } return false; };
    const clearCards = () => ev(() => { for (let i = 0; i < 20 && UI.card && UI.card.kind !== 'over' && UI.card.kind !== 'pass'; i++) { UI.card = null; UI._cardKey = null; UI.noAnim = false; pump(); } });
    await p.goto(BASE + 'thornbound-new/index.html');
    await ev(() => { localStorage.clear(); });
    await p.reload(); await p.waitForTimeout(700); await shot('01-title');
    await ev(() => { AIDELAY = 0; });
    await p.click('#start [data-a=play]'); await p.waitForTimeout(250);
    await p.click('#start [data-a=guided]'); await p.waitForTimeout(400);
    for (let i = 0; i < 3; i++) { const c = await p.$('#act [data-a=coachok]'); if (c) { await c.click(); await p.waitForTimeout(150); } }
    await shot('01b-guide-bid');
    // the bid: the glowing button selects the card, then a confirm step
    await pri(); await shot('02-bid-confirm');
    if (!(await ev(() => !!UI.pendBid))) fail('no bid confirm step');
    await pri(); await p.waitForTimeout(200);
    // play on with the glowing button until the hidden-cards step, through any result cards
    for (let k = 0; k < 30; k++) { await clearCards(); if (await ev(() => G.q && G.q.kind === 'place' && viewSeatForQ() != null)) break; if (!(await pri())) await ev(() => pump()); }
    // undo: hide one card, then take it back
    const before = await ev(() => JSON.stringify(G));
    await pri(); await p.waitForTimeout(200);
    if (!(await ev(() => GX.undo.can()))) fail('undo not offered after hiding a card');
    else { await shot('03-undo-ready'); await p.click('#act [data-a=undo]'); await p.waitForTimeout(250); if (!(await ev(b => JSON.stringify(G) === b, before))) fail('undo did not restore the state'); }
    // finish round 1 by the glowing button; the recap strip fills while the Court acts
    for (let k = 0; k < 40; k++) { await clearCards(); if (await ev(() => G.round >= 2 || G.over)) break; if (!(await pri())) await ev(() => pump()); }
    for (let k = 0; k < 6; k++) { const c = await p.$('#act [data-a=coachok]'); if (c) { await c.click(); await p.waitForTimeout(120); } }
    await clearCards(); await p.waitForTimeout(200);
    const rc = await ev(() => { const r = document.querySelector('.gx-recap'); return r && !r.hidden ? r.textContent : ''; });
    if (!rc) console.log(t, 'recap: empty right now'); await shot('04-recap');
    console.log(t, 'after round 1: influence', await ev(() => G.pl.map(p => p.inf).join('-')));
    // reference: bar button, list, chips, big view, search
    await p.click('.gx-bar [data-gx="gx-refd"]'); await p.waitForTimeout(300); await shot('05-reference');
    const n = await ev(() => document.querySelectorAll('.gx-ref-it').length); if (n < 150) fail('reference has only ' + n + ' entries');
    await p.click('.gx-ref-it[data-ref="f-clans-13"]'); await p.waitForTimeout(200); await shot('06-reference-big');
    await p.click('.gx-ref-bh .gx-sb'); await p.fill('.gx-ref-q', 'herald'); await p.waitForTimeout(150); await shot('07-reference-search');
    await p.keyboard.press('Escape'); await p.waitForTimeout(200);
    // a hand card pop-up links to the reference
    const hc = await p.$('#handw .hc'); if (hc) { await hc.click(); await p.waitForTimeout(150); if (!(await p.$('#ppop [data-a=refcard]'))) fail('no "read it" link on the card pop-up'); else { await p.click('#ppop [data-a=refcard]'); await p.waitForTimeout(250); await shot('08-card-to-reference'); await p.keyboard.press('Escape'); await p.waitForTimeout(200); } }
    // settings: the same sections everywhere, no developer tools
    await p.click('.gx-bar [data-gx=setd]'); await p.waitForTimeout(300); await shot('09-settings');
    const secs = await ev(() => [...document.querySelectorAll('#setd .gx-sec h3')].map(x => x.textContent).join(','));
    if (!/^Game,Sound,Speed,Help,Graphics,Accessibility,About$/.test(secs)) fail('settings sections', secs);
    if (await ev(() => /Test speed|Show speed|Copy report/.test(document.querySelector('#setd').textContent))) fail('developer tools visible without ?dev=1');
    await p.click('#setd-accessibility .gx-sb[data-v="1.15"]'); await p.click('#setd-accessibility .gx-tg'); // large text, colour-blind help
    await ev(() => document.querySelector('#setd-about').scrollIntoView()); await p.waitForTimeout(150); await shot('10-settings-about');
    await p.keyboard.press('Escape'); await p.waitForTimeout(250); await shot('11-large-text-cb');
    await ev(() => GX.setPref({ text: 1, cb: false }));
    // finish the game with the suggestions, then read the result and the achievements
    await ev(() => { ANIM = 0; UI.guide = 'off'; let guard = 0;
      while (!G.over && guard++ < 4000) {
        if (UI.card) { if (UI.card.kind === 'over') break; if (UI.card.kind === 'pass') { UI.holder = UI.card.seat; UI.passed = UI.card.seat; } UI.card = null; UI._cardKey = null; UI.noAnim = false; pump(); continue; }
        if (UI.coachInfo) { coachOk(); continue; }
        const s = viewSeatForQ(); if (s == null) { const n0 = G.logN; pump(); if (G.logN === n0 && !UI.card) break; continue; }
        const m = suggest(s) || legal(s)[0]; humanMove(m.k); if (UI.pendBid) humanMove(m.k);
      }
      UI.card = null; UI._cardKey = null; pump(); });
    await p.waitForTimeout(400); await shot('12-game-over');
    if (!(await ev(() => G.over && UI.card && UI.card.kind === 'over'))) fail('no end card');
    const st = await ev(() => ({ s: GNS.stats('thornbound'), a: Object.keys(GNS.earned('thornbound')) }));
    if (!st.s || st.s.played < 1) fail('no result stored'); else console.log(t, 'result stored: played', st.s.played, 'won', st.s.won, 'best', st.s.best, 'achievements', st.a.join(' '));
    await ev(() => { const sc = document.querySelector('#pc .cd-sc'); if (sc) sc.scrollTop = sc.scrollHeight; }); await p.waitForTimeout(150); await shot('13-game-over-breakdown');
    // stats on the shelf home
    await p.goto(BASE + 'index.html'); await p.waitForTimeout(800);
    await ev(() => { try { openMine(); } catch (e) { } }); await p.waitForTimeout(300); await shot('14-shelf-stats', 1);
    const reg = await ev(async () => { try { const r = await navigator.serviceWorker.getRegistration(); return r ? r.scope : 'none'; } catch (e) { return 'err ' + e.message; } });
    console.log(t, 'service worker scope', reg);
    errs.forEach(e => fail('console', e));
    await ctx.close();
  }
  await b.close(); console.log('PROBLEMS', bad); srv.kill(); process.exit(bad ? 1 : 0);
})().catch(e => { console.error('FATAL', e); srv.kill(); process.exit(2); });
