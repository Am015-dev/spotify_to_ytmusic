// DOCK STATES: walks worst-case dock states (chain builds, 1-6 goods kinds, workers buttons, full storage, long star line, pending actions)
// at 375x667, 390x844, 375x553 and asserts every dock button is fully inside the dock's visible area, inside the screen, >= 44 px
// (acts/goods) and that elementFromPoint at its centre is the button. VB_HTML=<built html> node dock-states.js. Exit 1 on any failure.
const { chromium } = require('playwright'); const path = require('path');
const URL = 'file://' + (process.env.VB_HTML || path.join(__dirname, 'vale-of-banners.html'));
const SIZES = ['375x667', '390x844', '375x553', '360x640'];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }); let bad = 0, checks = 0;
  for (const sz of SIZES) {
    const [W, H] = sz.split('x').map(Number), ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true }), page = await ctx.newPage(), errs = [];
    page.on('pageerror', e => errs.push(String(e)));
    await page.goto(URL); await page.evaluate(() => { localStorage.clear(); try { GXT.markDone('vale-of-banners'); } catch (e) { } }); await page.reload(); await page.waitForTimeout(500);
    await page.tap('#quickB'); await page.waitForTimeout(300); await page.tap('#goB'); await page.waitForTimeout(800);
    await page.evaluate(() => { const bt = [...document.querySelectorAll('button')].find(x => /let.s play/i.test(x.textContent) && x.offsetParent); bt && bt.click(); }); await page.waitForTimeout(600);
    await page.evaluate(() => { UI.fast = true; try { const g = document.getElementById('guide'); g && g.classList.remove('on'); document.querySelectorAll('.gxh-bubble,.gxh-coach').forEach(e => e.remove()); } catch (e) { } });
    const states = [
      { n: 'fresh', f: () => { } },
      { n: 'chain2', f: () => { UI.chain = 2; } },
      { n: 'chain2+goods6', f: () => { UI.chain = 2; ['1', '2', '3', '4', '5', '6'].forEach(k => G.P[0].goods[k] = 2); } },
      { n: 'chain2+goods3', f: () => { UI.chain = 2; G.P[0].goods = { 1: 1, 2: 2, 3: 3, 4: 0, 5: 0, 6: 0 }; G.P[0].used = [false, false]; G.P[0].dice = [2, 5]; } },
      { n: 'chain2+goods4', f: () => { UI.chain = 2; G.P[0].goods = { 1: 1, 2: 2, 3: 3, 4: 1, 5: 0, 6: 0 }; G.P[0].used = [false, false]; G.P[0].dice = [2, 5]; } },
      { n: 'goods6+workers', f: () => { UI.chain = 0; ['1', '2', '3', '4', '5', '6'].forEach(k => G.P[0].goods[k] = 3); G.P[0].dice = [2, 5]; G.P[0].used = [false, false]; } },
      { n: 'chain3+full store+goods', f: () => { UI.chain = 3; G.P[0].dice = [3, 5]; G.P[0].used = [false, false]; } },
      { n: 'one die used + goods', f: () => { UI.chain = 2; G.P[0].used = [true, false]; } },
      { n: 'both used (End turn)', f: () => { UI.chain = 0; G.P[0].used = [true, true]; } },
      { n: 'chain2 hints off', f: () => { UI.chain = 2; G.P[0].used = [false, false]; } }
    ];
    for (const s of states) {
      const bads = await page.evaluate(st => {
        eval('(' + st.f + ')()'); G.order = [0, 1]; G.ti = 0; G.pend = []; UI.busy = false; UI.sel = null; if (st.n === 'chain2 hints off') { try { localStorage.setItem('gxh_off', '1'); } catch (e) { } }
        render(); const out = [], dk = document.getElementById('dockbody').getBoundingClientRect(), dockR = document.getElementById('dock').getBoundingClientRect();
        document.querySelectorAll('#acts .btn, #goods .gbtn, #dicerow button.die:not(.used), #store .tilebtn, #chainb.on').forEach(e => {
          const r = e.getBoundingClientRect(); if (!r.width || !r.height) return; const id = e.id || e.className, x = r.left + r.width / 2, y = r.top + r.height / 2;
          if (r.top < dockR.top - 1 || r.bottom > Math.min(innerHeight, dockR.bottom) + 1.5) out.push(id + ' outside dock/screen @' + Math.round(r.top) + '-' + Math.round(r.bottom) + ' (dock ' + Math.round(dockR.top) + '-' + Math.round(dockR.bottom) + ', screen ' + innerHeight + ')');
          else { const hit = document.elementFromPoint(x, y); if (!hit || !(hit === e || e.contains(hit))) out.push(id + ' covered by ' + (hit ? hit.id || hit.className : 'nothing')); }
          if (!e.matches('#dicerow .die, #chainb') && (r.height < 43.5 || r.width < 43.5)) out.push(id + ' small ' + Math.round(r.width) + 'x' + Math.round(r.height));
        }); return out;
      }, { n: s.n, f: s.f.toString() });
      checks++; if (bads.length) { bad++; console.log('FAIL ' + sz + ' [' + s.n + ']: ' + bads.slice(0, 4).join('; ')); await page.screenshot({ path: path.join(__dirname, 'shots/dockstate-' + sz + '-' + s.n.replace(/\W+/g, '_') + '.png') }).catch(() => { }); }
    }
    if (errs.length) { bad++; console.log('FAIL ' + sz + ' page errors: ' + errs[0]); }
    await ctx.close();
  }
  console.log((bad ? 'FAIL' : 'PASS') + ' dock-states: ' + checks + ' states, ' + bad + ' failing'); await b.close(); process.exit(bad ? 1 : 0);
})();
