// Plays like a player with REAL taps/clicks (Playwright): a full game to the result screen, the tutorial, and Story chapters 1-2.
// The move is chosen with the game's own advice (PPAI) and then performed by tapping the element a person would tap.
//   node play.js [phone|pc] [game|tutorial|story|all] [url]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const SIZE = process.argv[2] || 'phone', WHAT = process.argv[3] || 'all';
const URL = process.argv[4] || 'file://' + path.join(__dirname, 'perch-and-plume.html');
const VP = SIZE === 'pc' ? { width: 1440, height: 860 } : { width: 390, height: 763 }, TOUCH = SIZE !== 'pc';
let fails = 0; const log = (ok, m) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + SIZE + ' ' + m); };
async function tap(p, sel) {
  const el = typeof sel === 'string' ? await p.$(sel) : sel; if (!el) throw new Error('no element ' + sel);
  await el.scrollIntoViewIfNeeded().catch(() => { });
  if (TOUCH) await el.tap({ timeout: 5000 }); else await el.click({ timeout: 5000 });
}
// one step of the human: returns 'done' | 'wait' | 'acted'
async function step(p) {
  const st = await p.evaluate(() => {
    const vis = s => { const e = document.querySelector(s); return e && !e.hidden && e.getBoundingClientRect().width > 0; };
    if (vis('#result')) return { k: 'result' };
    if (vis('#pass')) return { k: 'pass' };
    if (vis('#setup') && document.getElementById('keepgo')) return { k: 'keep' };
    if (document.querySelector('.gxc') && getComputedStyle(document.querySelector('.gxc')).display !== 'none' && document.querySelector('.gxc').offsetParent !== null) return { k: 'gxc' };
    if (!G || G.phase === 'over') return { k: 'wait' };
    if (!myTurn()) return { k: 'wait' };
    if (UI.pend) return { k: 'sel', s: '#acts [data-a="playgo"]' };
    if (UI.gsDie != null) return { k: 'sel', s: '#acts [data-a="mv"]' };
    const m = PPAI.choose(G, UI.view, 'normal'); if (!m) return { k: 'stuck', why: 'no move q=' + (G.q && G.q.h) };
    const J = s => '[data-m=\'' + JSON.stringify(s) + '\']';
    if (m.t === 'act') return { k: 'sel', s: '.ract[data-h="' + ['food', 'eggs', 'cards'].indexOf(m.a) + '"]' };
    if (m.t === 'play') { if (UI.sel !== m.i) return { k: 'sel', s: '#hand .bc[data-i="' + m.i + '"]' }; return { k: 'sel', s: '.row[data-h="' + m.h + '"] .slot.next' }; }
    if (m.t === 'die') return { k: 'sel', s: '.die[data-i="' + m.i + '"]' };
    if (m.t === 'reroll' || m.t === 'skip' || m.t === 'pickb' || (m.t === 'bonus' && (!m.yes || m.f))) return { k: 'mv', m };
    if (m.t === 'egg' || m.t === 'trade' || (m.t === 'bonus' && m.h != null)) return { k: 'sel', s: '.bc[data-a="bird"][data-h="' + m.h + '"][data-c="' + m.c + '"]' };
    if (m.t === 'tray') return { k: 'sel', s: '.bc[data-a="tray"][data-i="' + m.i + '"]' };
    if (m.t === 'deck') return { k: 'sel', s: '#deckb' };
    if (m.t === 'tuck' || (m.t === 'bonus' && m.i != null)) return { k: 'sel', s: '#hand .bc[data-i="' + m.i + '"]' };
    return { k: 'stuck', why: 'unmapped ' + JSON.stringify(m) };
  });
  if (st.k === 'result') return 'done';
  if (st.k === 'wait') return 'wait';
  if (st.k === 'stuck') throw new Error(st.why);
  if (st.k === 'pass') { await tap(p, '#passgo'); return 'acted'; }
  if (st.k === 'keep') { await tap(p, '#keepgo'); return 'acted'; }
  if (st.k === 'gxc') return 'gxc';
  if (st.k === 'mv') {
    const h = await p.evaluateHandle(m => [...document.querySelectorAll('#acts [data-a="mv"]')].find(b => { const x = JSON.parse(b.dataset.m); return Object.keys(m).every(k => JSON.stringify(x[k]) === JSON.stringify(m[k])); }) || null, st.m);
    const el = h.asElement(); if (!el) throw new Error('no button for ' + JSON.stringify(st.m)); await tap(p, el); return 'acted';
  }
  await tap(p, st.s); return 'acted';
}
async function playOut(p, label, maxMs) {
  const t0 = Date.now(); let last = '', since = Date.now(), n = 0;
  while (Date.now() - t0 < maxMs) {
    let r; try { r = await step(p); } catch (e) { log(false, label + ': ' + e.message.split('\n')[0]); return false; }
    if (r === 'done') { log(true, label + ': reached the result screen after ' + n + ' taps, ' + Math.round((Date.now() - t0) / 1000) + ' s'); return true; }
    if (r === 'gxc') return 'gxc';
    if (r === 'acted') n++;
    const fp = await p.evaluate(() => G ? G.turn + ':' + JSON.stringify(G.q && G.q.h) + ':' + G.log.length + ':' + UI.busy : '-');
    if (fp !== last) { last = fp; since = Date.now(); } else if (Date.now() - since > 12000) { log(false, label + ': stuck 12 s at ' + fp); return false; }
    await p.waitForTimeout(r === 'wait' ? 150 : 60);
  }
  log(false, label + ': timed out'); return false;
}
(async () => {
  fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true });
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: VP, hasTouch: TOUCH, isMobile: TOUCH });
  await ctx.addInitScript(() => { try { localStorage.setItem('gns-prefs', JSON.stringify({ anim: 'fast', ai: 'fast' })); } catch (e) { } });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('pageerror ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console ' + m.text()); });
  if (WHAT === 'game' || WHAT === 'all') {
    await p.goto(URL); await p.waitForTimeout(600);
    await tap(p, '[data-t="quick"]'); await tap(p, '[data-n="3"]'); await tap(p, '[data-go]');
    await playOut(p, 'quick game 3 players', 600000);
    await p.screenshot({ path: `shots/play-${SIZE}-result.png` });
  }
  if (WHAT === 'tutorial' || WHAT === 'all') {
    await p.goto(URL); await p.waitForTimeout(600);
    await p.evaluate(() => { localStorage.removeItem('pp-played'); localStorage.removeItem('gxt-perch-and-plume'); });
    await p.goto(URL); await p.waitForTimeout(600);
    await tap(p, '[data-gxt-open]'); await p.waitForTimeout(800);
    // follow every step: tap the spotlighted target, or Next
    const t0 = Date.now(); let steps = 0, lastId = '', same = 0;
    while (Date.now() - t0 < 180000) {
      const s = await p.evaluate(() => { if (!GXT.active()) return { done: true }; const c = GXT.current(); return { id: c && c.id, next: !!document.querySelector('.gxt-next:not([hidden]),[data-gxt-next]') }; });
      if (s.done) break;
      if (s.id === lastId) same++; else { same = 0; lastId = s.id; steps++; }
      if (same > 120) { log(false, 'tutorial stuck at step ' + s.id); break; }
      const acted = await p.evaluate(() => {
        const c = GXT.current(); if (!c) return 'none';
        const nb = [...document.querySelectorAll('button')].find(b => /^(next|got it|start|ok|finish)\b/i.test(b.textContent.trim()) && b.closest('[data-help]') && b.offsetParent);
        if (!c.wait && nb) { nb.setAttribute('data-tut-tap', '1'); return 'next'; }
        return 'target';
      });
      if (acted === 'next') { await tap(p, '[data-tut-tap]').catch(() => { }); await p.evaluate(() => { const e = document.querySelector('[data-tut-tap]'); if (e) e.removeAttribute('data-tut-tap'); }); await p.waitForTimeout(250); continue; }
      // tap what the spotlight asks for (a container -> its first glowing piece), like a newcomer following the bubble
      const can = await p.evaluate(() => {
        const c = GXT.current(); if (!c || !c.target || !myTurn() || (c.ready && !c.ready())) return false;
        let t = c.target(); if (!t || !t.getBoundingClientRect) return false;
        if (!t.matches('button,.bc,.die,.slot') ) t = t.querySelector('.glow') || t;
        document.querySelectorAll('[data-tut-tap]').forEach(e => e.removeAttribute('data-tut-tap'));
        t.setAttribute('data-tut-tap', '1'); return true;
      });
      if (can) await tap(p, '[data-tut-tap]').catch(() => { });
      await p.waitForTimeout(can ? 300 : 250);
    }
    const end = await p.evaluate(() => !GXT.active() || /know the basics/i.test(document.body.innerText));
    log(end, 'tutorial reached its end card (' + steps + ' steps seen)');
    await p.screenshot({ path: `shots/play-${SIZE}-tutorial-end.png` });
  }
  if (WHAT === 'story' || WHAT === 'all') {
    for (const ch of ['c1', 'c2']) {
      await p.goto(URL); await p.waitForTimeout(600);
      await tap(p, '[data-t="story"]'); await p.waitForTimeout(600);
      // open the chapter through the map like a player: tap its node, then skip/continue through the intro and boss card
      const opened = await p.evaluate(id => { const n = document.querySelector('.gxc-node[aria-label^="Chapter ' + id.slice(1) + ':"]'); if (n) { n.setAttribute('data-tut-tap', '1'); return true; } return false; }, ch);
      if (opened) await tap(p, '[data-tut-tap]'); else { log(false, 'story ' + ch + ': chapter node not found on the map'); continue; }
      for (let k = 0; k < 24; k++) {
        await p.waitForTimeout(400);
        const btn = await p.evaluate(() => { if (G && UI.camp && document.querySelector('.gxc') && !document.querySelector('.gxc').offsetParent) return 'in'; const b = [...document.querySelectorAll('.gxc button')].find(x => /play|start|begin|skip|continue|next|let/i.test(x.textContent) && x.offsetParent); if (b) { b.setAttribute('data-tut-tap', '1'); return 'btn'; } return G && UI.camp ? 'in' : 'none'; });
        if (k === 23) await p.screenshot({ path: `shots/play-${SIZE}-story-${ch}-stuck.png` });
        if (btn === 'in') break; if (btn === 'btn') { await tap(p, '[data-tut-tap]'); await p.evaluate(() => { const e = document.querySelector('[data-tut-tap]'); if (e) e.removeAttribute('data-tut-tap'); }); }
      }
      const r = await playOut(p, 'story ' + ch, 600000);
      if (r === true) { await tap(p, '#again'); await p.waitForTimeout(1200); const gx = await p.evaluate(() => !!document.querySelector('.gxc') && /star|won|lost|try|again|chapter/i.test(document.querySelector('.gxc').innerText)); const prog = await p.evaluate(() => JSON.stringify(GXC.progress().ch)); log(gx && prog.indexOf('"' + ch + '":{') >= 0, 'story ' + ch + ': story result screen shows and the attempt is saved ' + prog); await p.screenshot({ path: `shots/play-${SIZE}-story-${ch}.png` }); }
    }
  }
  log(errs.length === 0, 'no page or console errors' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
  await b.close();
  console.log(fails ? 'FAIL play ' + SIZE : 'PASS play ' + SIZE);
  process.exit(fails ? 1 : 0);
})();
