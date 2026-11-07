// Story flow check with real taps: starts chapter 2 (goal: 3 forest birds), forces a year that is WON but with the goal MISSED, checks the
// result screen states it with the count, the story shows a loss with retry; then a year with the goal met shows stars that match.
//   node story-check.js [phone|pc|land] [url]
const { chromium } = require('playwright');
const path = require('path');
const SIZE = process.argv[2] || 'phone', URL = process.argv[3] || 'file://' + path.join(__dirname, 'perch-and-plume.html');
const VP = { phone: [390, 763, 1], land: [844, 390, 1], pc: [1440, 860, 0] }[SIZE];
let fails = 0; const log = (ok, m) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + SIZE + ' ' + m); };
(async () => {
  const b = await chromium.launch(), ctx = await b.newContext({ viewport: { width: VP[0], height: VP[1] }, hasTouch: !!VP[2], isMobile: !!VP[2], deviceScaleFactor: 1 });
  const p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error' && !/ERR_FILE_NOT_FOUND/.test(m.text())) errs.push(m.text()); });
  await p.goto(URL); await p.waitForTimeout(500);
  const tap = async s => { const l = p.locator(s).first(); VP[2] ? await l.tap({ timeout: 5000 }) : await l.click({ timeout: 5000 }); await p.waitForTimeout(250); };
  const run = async (want) => {   // want: 'miss' (won year, 1 forest bird) | 'hit' (goal met)
    await p.goto(URL); await p.evaluate(() => { const k = 'gns-campaign-perch-and-plume', o = JSON.parse(localStorage.getItem(k) || '{}'); o.v = 1; o.unlocked = o.unlocked || []; o.ch = o.ch || {}; if (!o.ch.c1) o.ch.c1 = { beaten: true, stars: 3, best: null, tries: 1, losses: 0, easy: false }; localStorage.setItem(k, JSON.stringify(o)); });
    await p.reload(); await p.waitForTimeout(600); await tap('[data-t="story"]'); await p.waitForTimeout(600);
    await p.evaluate(() => { const n = document.querySelector('.gxc-node[aria-label^="Chapter 2:"]'); n.setAttribute('data-tut-tap', '1'); n.scrollIntoView({ block: 'center' }); }); await p.waitForTimeout(300); { const l = p.locator('[data-tut-tap]').first(); VP[2] ? await l.tap({ force: true }) : await l.click({ force: true }); await p.waitForTimeout(500); await p.evaluate(() => document.querySelector('[data-tut-tap]').removeAttribute('data-tut-tap')); }
    for (let k = 0; k < 24; k++) {   // intro scene / boss card: tap through like a player
      await p.waitForTimeout(400);
      const r = await p.evaluate(() => { if (document.getElementById('keepgo') && document.getElementById('setup') && !document.getElementById('setup').hidden) return 'in'; const b = [...document.querySelectorAll('.gxc button:not(.gxc-node)')].find(x => /play|start|begin|skip|continue|next|let/i.test(x.textContent) && x.offsetParent); if (b) { b.setAttribute('data-tut-tap', '1'); return 'btn'; } return 'none'; });
      if (r === 'in') break; if (r === 'btn') { if (process.env.DBG) console.log('tap button', await p.evaluate(() => document.querySelector('[data-tut-tap]').outerHTML.slice(0, 160))); await tap('[data-tut-tap]'); await p.evaluate(() => { const e = document.querySelector('[data-tut-tap]'); if (e) e.removeAttribute('data-tut-tap'); }); }
    }
    const goalLine = await p.evaluate(() => (document.querySelector('#setup .goalline') || {}).textContent || '');
    log(/3 or more birds in your forest/.test(goalLine), 'starting-hand screen shows the chapter goal');
    await tap('#keepgo'); await p.waitForTimeout(1500);
    const bar = await p.evaluate(() => { const e = document.querySelector('#goalbar'); return e && !e.hidden && e.getBoundingClientRect().height > 0 ? e.textContent : ''; });
    log(/Forest birds: 0 of 3/.test(bar), 'live goal tracker visible in play: "' + bar.trim() + '"');
    await p.evaluate(want => {
      const ids = PP.DATA.birds.filter(x => x.h.indexOf('F') >= 0 && x.c.length).map(x => x.id), gid = PP.DATA.birds.filter(x => x.h.indexOf('G') >= 0).map(x => x.id);
      G.pl[0].board[0] = ids.slice(0, want === 'hit' ? 3 : 1).map(id => ({ id, eggs: 1, cache: 0, tuck: 0 }));
      G.pl[0].board[1] = gid.slice(0, 5).map(id => ({ id, eggs: 2, cache: 0, tuck: 0 }));
      G.pl[1].board = [[], [], []]; render();
    }, want);
    const live = await p.evaluate(() => document.querySelector('#goalbar').textContent);
    log(want === 'hit' ? /3 of 3.*met/.test(live) : /1 of 3/.test(live) && !/met/.test(live), 'tracker updates live: "' + live.trim() + '"');
    await p.evaluate(() => { G.phase = 'over'; G.q = null; G.final = G.pl.map((x, i) => PP.scoreOf(G, i)); G.winner = G.final[0].total >= G.final[1].total ? 0 : 1; UI.busy = false; gameOver(); });
    await p.waitForSelector('#result:not([hidden]) #again', { timeout: 5000 }); await p.waitForTimeout(300);
    const res = await p.evaluate(() => document.querySelector('#result').innerText);
    return res;
  };
  // LOSS on the goal although the year was won
  let res = await run('miss');
  log(/Goal missed/.test(res) && /You won the year/.test(res) && /You had 1 of 3/.test(res), 'result screen: goal missed with the count while the year was won');
  log(!/Goal met/.test(res) && /needs? .*goal|only cleared when its goal|Stars are earned once the goal/.test(res), 'result screen explains the stars need the goal');
  await p.screenshot({ path: path.join(__dirname, 'shots', SIZE + '-result-miss.png') }).catch(() => { });
  await tap('#again'); await p.waitForTimeout(900);
  const sh = await p.evaluate(() => (document.querySelector('.gxc') || document.body).innerText);
  log(/Not this time|try again|Try again|Retry/i.test(sh), 'story shows the loss message');
  const retry = await p.evaluate(() => [...document.querySelectorAll('.gxc button')].map(b => b.textContent.trim()).filter(t => /again|retry|play/i.test(t)));
  log(retry.length > 0, 'a retry button is offered: ' + retry.join('|'));
  await p.screenshot({ path: path.join(__dirname, 'shots', SIZE + '-story-loss.png') }).catch(() => { });
    // WIN with the goal met
  res = await run('hit');
  log(/Goal met/.test(res) && /3 of 3/.test(res), 'result screen: goal met with the count');
  const ticked = await p.evaluate(() => [...document.querySelectorAll('#result .goalstars li')].map(l => l.classList.contains('on')));
  const m = await p.evaluate(() => { const g = campMetrics(G); return { score: g.score, won: g.won }; });
  log(ticked[0] === true && ticked[1] === (m.score >= 45) && ticked[2] === m.won, 'result star list matches the facts ' + JSON.stringify(ticked) + ' score ' + m.score + ' won ' + m.won);
  await tap('#again'); await p.waitForTimeout(900);
  const stars = await p.evaluate(() => { const o = JSON.parse(localStorage.getItem('gns-campaign-perch-and-plume') || '{}'); return o.ch && o.ch.c2 || null; });
  const want = 1 + (m.score >= 45 ? 1 : 0) + (m.won ? 1 : 0);
  log(stars && stars.beaten && stars.stars === want, 'stored stars match the goals met: ' + JSON.stringify(stars) + ' expected ' + want);
  await p.screenshot({ path: path.join(__dirname, 'shots', SIZE + '-story-win.png') }).catch(() => { });
  log(errs.length === 0, 'no page or console errors' + (errs.length ? ' ' + errs.slice(0, 2).join(' | ') : ''));
  await b.close(); console.log((fails ? 'FAIL' : 'PASS') + ' story-check ' + SIZE); process.exit(fails ? 1 : 0);
})();
