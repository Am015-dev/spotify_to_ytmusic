#!/usr/bin/env node
// Garage layout checks (F3 + F7): weapon cards and the tab row at 1280x720, 1366x768, 390x763, 375x553.
//   NODE_PATH=$(npm root -g) node games-src/nightrun/wcard-test.js        env: GAME_DIR=...
// F3: no text node in a .wpt .card narrower than 6 characters; the BUY box overlaps no text; nothing sticks out of its card; names are one line.
// F7: every garage tab is >= 44x44 and fully reachable (tab row scrolls, WEAPONS can be scrolled into view); no SOON tab in the main row; settings chips >= 44 px tall.
const PW = require(process.env.PW || 'playwright'), path = require('path'), net = require('net'), cp = require('child_process');
const GAME_DIR = process.env.GAME_DIR || path.resolve(__dirname, '../../games/mainhattan-nightrun');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise(r => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const res = []; const ok = (n, p, i) => { res.push(p); console.log((p ? 'PASS ' : 'FAIL ') + n + (p || !i ? '' : ' :: ' + i)); };
const VPS = [['1280x720', { viewport: { width: 1280, height: 720 } }], ['1366x768', { viewport: { width: 1366, height: 768 } }], ['390x763', { viewport: { width: 390, height: 763 }, hasTouch: true, isMobile: true }], ['375x553', { viewport: { width: 375, height: 553 }, hasTouch: true, isMobile: true }]];
const CARDS = () => {
  const bad = [], cards = [...document.querySelectorAll('#gaCards.wpt .card')]; let nodes = 0;
  for (const c of cards) {
    const cr = c.getBoundingClientRect(), id = c.dataset.id, w = document.createTreeWalker(c, NodeFilter.SHOW_TEXT);
    const pr = c.querySelector('.pr'), prr = pr && pr.getBoundingClientRect();
    for (let n; (n = w.nextNode());) {
      const t = n.textContent.trim(); if (!t) continue; nodes++;
      const rg = document.createRange(); rg.selectNodeContents(n); const r = rg.getBoundingClientRect(), fs = parseFloat(getComputedStyle(n.parentElement).fontSize) || 12;
      if (t.length >= 6 && r.width < 6 * fs * .4) bad.push(id + ': text "' + t.slice(0, 20) + '" is ' + Math.round(r.width) + ' px wide');
      if (pr && !pr.contains(n) && r.width && prr.width && r.left < prr.right && r.right > prr.left && r.top < prr.bottom && r.bottom > prr.top) bad.push(id + ': BUY overlaps "' + t.slice(0, 20) + '"');
      if (r.right > cr.right + 1 || r.left < cr.left - 1) bad.push(id + ': text "' + t.slice(0, 20) + '" sticks out of its card');
    }
    const nm = c.querySelector('.n'); if (nm && nm.getClientRects()[0] && nm.querySelector('.nm') && nm.querySelector('.nm').getClientRects().length > (innerWidth >= 700 ? 1 : 2)) bad.push(id + ': name wraps');
    if (c.scrollHeight > c.clientHeight + 2) bad.push(id + ': content taller than card (' + c.scrollHeight + '>' + c.clientHeight + ')');
    if (pr && (prr.right > cr.right + 1 || prr.bottom > cr.bottom + 1)) bad.push(id + ': BUY sticks out of its card');
  }
  return { n: cards.length, nodes, bad };
};
const TABS = () => {
  const tb = document.querySelector('#garage .tabs'), out = { bad: [], names: [] }, tr = tb.getBoundingClientRect();
  for (const b of tb.querySelectorAll('button')) { const r = b.getBoundingClientRect(); out.names.push(b.textContent); if (r.height < 43.5 || r.width < 43.5) out.bad.push(b.textContent + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); }
  const wb = tb.querySelector('[data-t=weapons]'); if (wb) { wb.scrollIntoView({ inline: 'center', block: 'nearest' }); const r = wb.getBoundingClientRect(), t2 = tb.getBoundingClientRect(); out.weaponsVisible = r.left >= t2.left - 1 && r.right <= t2.right + 1; out.text = wb.scrollWidth <= wb.clientWidth + 1; }
  out.scrolls = tb.scrollWidth > tb.clientWidth + 1; out.pageX = document.documentElement.scrollWidth > innerWidth + 1;
  return out;
};
(async () => {
  const port = await freePort(), srv = cp.spawn('python3', ['-m', 'http.server', port, '--bind', '127.0.0.1'], { cwd: GAME_DIR, stdio: 'ignore' }); await sleep(800);
  const br = await PW.chromium.launch({ args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  try {
    for (const [name, o] of VPS) {
      const ctx = await br.newContext(o), p = await ctx.newPage(), errs = []; p.on('pageerror', e => errs.push(e.message));
      await p.addInitScript(() => { try { localStorage.setItem('mnr_bank', '2400'); } catch (e) { } });
      await p.goto(`http://127.0.0.1:${port}/?nomusic=1`); await sleep(1200);
      await p.evaluate(() => { const g = window.__ga; g.GA.bank = 2400; g.GA.tab = 'weapons'; g.openGarage('title'); }); await sleep(600);
      const c = await p.evaluate(CARDS); ok(`${name}: ${c.n} weapon cards, ${c.nodes} text nodes, no narrow text / overlap / overflow`, c.n >= 16 && !c.bad.length, c.n + ' cards; ' + c.bad.slice(0, 4).join(' | '));
      const t = await p.evaluate(TABS);
      ok(`${name}: garage tabs >= 44x44`, !t.bad.length, t.bad.join(', '));
      ok(`${name}: no SOON tab, WEAPONS tab present`, !t.names.includes('SOON') && t.names.includes('WEAPONS'), t.names.join(','));
      ok(`${name}: WEAPONS tab can be scrolled fully into view, text not clipped, no page scroll`, t.weaponsVisible && t.text && !t.pageX, JSON.stringify(t));
      await p.evaluate(() => { const g = window.__ga; g.GA.tab = 'ships'; g.openGarage('title'); }); await sleep(300);
      await p.evaluate(() => { document.querySelector('#garage .back, #gaBack, #garage [data-back]'); });
      await p.evaluate(() => { document.getElementById('garage').hidden = true; document.getElementById('title').hidden = false; });
      const sb = await p.evaluate(() => { const b = document.getElementById('moreBtn'); if (b) b.click(); const s = document.getElementById('setBtn'); if (s) s.click(); return [...document.querySelectorAll('#setm .seg button')].filter(x => x.getBoundingClientRect().width > 0).map(x => [x.textContent, Math.round(x.getBoundingClientRect().height)]); });
      ok(`${name}: settings chips >= 44 px tall (${sb.length} chips)`, sb.length > 5 && sb.every(x => x[1] >= 44), JSON.stringify(sb.filter(x => x[1] < 44)));
      ok(`${name}: no page errors`, !errs.length, errs.join(' | '));
      await ctx.close();
    }
  } finally { await br.close(); srv.kill(); }
  const f = res.filter(x => !x).length; console.log(f ? `${f} FAILED` : 'ALL PASS'); process.exit(f ? 1 : 0);
})();
