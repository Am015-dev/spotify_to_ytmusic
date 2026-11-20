// Bulb loop test: in every hand-pick state (charity: too many cards; Bad Stuff: pick a card to lose) tap the bulb and count how often
// the bulb bubble is built over the next 15 s. One help bubble must settle: at most 2 builds per tap.
//   node bulbloop-test.js [sizes=375x667,375x553,360x640]   (needs doorkick.html: python3 build.py)
const PW = (() => { try { return require('playwright') } catch (e) { return require('/opt/node-tools/node_modules/playwright') } })();
const fs = require('fs'); const html = fs.readFileSync(__dirname + '/doorkick.html'); const localRoute = require('./local-route.js');
const SIZES = (process.argv[2] || '375x667,375x553,360x640').split(',').map(s => s.split('x').map(Number));
const WAIT = +(process.env.WAIT || 15000);
const sleep = ms => new Promise(r => setTimeout(r, ms));
// charity with the outcome of a failed run still on the table; and a Bad Stuff pick from hand and items (the slug pick)
const STATES = {
  charity: () => { const ids = Object.keys(G.C).map(Number).filter(i => !cd(i).d || cd(i).d); const p = P(0); const free = ids.filter(i => !p.hand.includes(i)).slice(40, 46); p.hand.push(...free); G.active = 0; G.q = null; G.cb = null; G.phase = 'charity'; render() },
  badstuff: () => { const p = P(0); G.active = 0; G.cb = null; G.phase = 'after'; G.slug = { p: 0, left: 2 }; slugNext(); render() },
};
(async () => {
  const browser = await PW.chromium.launch(); let fails = 0; const lines = [];
  for (const [W, H] of SIZES) {
    const ctx = await browser.newContext({ viewport: { width: W, height: H }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 }); await localRoute(ctx, html);
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('https://gns.test/?phone=1'); await sleep(900); await p.evaluate(() => { try { localStorage.clear(); localStorage.setItem('dkd_offer', '1') } catch (e) { } }); await p.reload(); await sleep(1200);
    await p.addStyleTag({ content: '#dkgoal{display:none!important}' });
    await p.evaluate(() => { window.schedule = function () { }; window.__bub = 0; new MutationObserver(ms => { for (const m of ms) for (const n of m.addedNodes) if (n.nodeType === 1 && n.classList.contains('gxh-bulbb')) window.__bub++ }).observe(document.body, { childList: true, subtree: true }) });
    for (const [nm, fn] of Object.entries(STATES)) for (const seed of [3, 7]) {
      await p.evaluate(sd => { ANIM = 0; setSeed(sd); newGame('solo', 4); UI.speed = 4; UI.hints = true; try { if (aiTimer) { clearTimeout(aiTimer); aiTimer = null } } catch (e) { } const g = document.getElementById('dkgoal'); if (g) g.remove(); const m = document.getElementById('modal'); if (m) m.hidden = true; try { GX.close && GX.close() } catch (e) { } }, seed); await sleep(300);
      let err = null; try { await p.evaluate(`(${fn})()`) } catch (e) { err = e.message.split('\n')[0] } await sleep(600);
      const st = await p.evaluate(() => ({ ph: G.phase, q: G.q && G.q.kind, act: sideToAct() }));
      await p.evaluate(() => { window.__bub = 0 });
      const b = await p.$('#bulbbtn'); if (!b || !(await b.isVisible())) { lines.push(`SKIP ${W}x${H} ${nm} s${seed}: no bulb (${JSON.stringify(st)})`); continue }
      await b.tap({ timeout: 5000 });
      // the R75 loop: something that must stay clear (a ring, a glow) ends up under the bubble after the kit placed it; the kit does not avoid it,
      // so a relayout put the fresh bubble on the same spot again, forever. Put a ring under the bubble to provoke it.
      await sleep(900); await p.evaluate(() => { const bb = document.querySelector('.gxh-bub.on.gxh-bulbb'); if (!bb) return; const r = bb.getBoundingClientRect(); const g = document.createElement('div'); g.className = 'gxh-ring f17probe'; g.style.cssText = `position:fixed;left:${r.left + r.width / 2 - 20}px;top:${r.top + r.height / 2 - 20}px;width:40px;height:40px;pointer-events:none`; document.body.appendChild(g) });
      await sleep(WAIT - 900); await p.evaluate(() => document.querySelectorAll('.f17probe').forEach(e => e.remove()));
      const r = await p.evaluate(() => ({ n: window.__bub, rules: !!document.querySelector('.gxh-rules,.gxh-rcard'), on: document.querySelectorAll('.gxh-bub.on').length }));
      const tag = `${W}x${H} ${nm} s${seed} ${JSON.stringify(st)}: ${r.n} bulb bubble build(s) in ${WAIT / 1000} s${r.rules ? ' (rules card)' : ''}`;
      if (err || r.n > 2) { fails++; lines.push('FAIL ' + tag + (err ? ' ' + err : '')) } else lines.push('ok   ' + tag);
      await p.keyboard.press('Escape'); await p.evaluate(() => { try { GXH.hide() } catch (e) { } document.querySelectorAll('.gxh-rules').forEach(e => e.remove()) });
    }
    if (errs.length) { fails++; lines.push(`FAIL ${W}x${H} page errors: ${[...new Set(errs)].slice(0, 3).join(' | ')}`) }
    await ctx.close();
  }
  await browser.close(); lines.forEach(l => console.log(l));
  console.log(`[bulbloop] ${fails ? 'FAIL' : 'PASS'}: the bulb bubble settles (<= 2 builds in ${WAIT / 1000} s after each tap) in charity and Bad Stuff hand picks at ${SIZES.map(s => s.join('x')).join(', ')}`);
  process.exit(fails ? 1 : 0);
})();
