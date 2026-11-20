// Calm sampler for Lantern Dive (F1, Nov 2026): 0 infinite animations and at most 1 helper on every path a newcomer takes, one sample a second.
//   node calm-lantern.js [file=/tmp/x/lantern-dive/index.html]   (CALM_SECS=12 per path)
// Paths, each at 375x667 and 375x553: the title (10 s), the tutorial (tap "Learn", then follow every highlighted step), a 4-diver dive with Hints on and a bulb
// tap on your turn, a 2-diver dive (the drone). The same SAMPLE as scripts/calm-audit.js. Prints loops / maxHelpers per path; exits 1 when loops > 0 or helpers > 1.
const { chromium } = require('playwright');
const path = require('path');
const gx = require('../../scripts/gx-serve.js');
const FILE = path.resolve(process.argv[2] || '/tmp/x/lantern-dive/index.html'), SECS = +process.env.CALM_SECS || 12;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const SAMPLE = () => {
  const vis = e => {
    if (!e || !e.isConnected || (e.closest && e.closest('[hidden]'))) return false;
    for (let x = e; x && x !== document.documentElement; x = x.parentElement) { const s = getComputedStyle(x); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.05) return false; }
    let r = e.getBoundingClientRect(); if (r.width < 2 && r.height < 2 && e.firstElementChild) r = e.firstElementChild.getBoundingClientRect();   // a 0x0 anchor (the ghost finger) is as visible as its drawing
    return r.width > 1 && r.height > 1 && r.right > 0 && r.bottom > 0 && r.left < innerWidth && r.top < innerHeight;
  };
  const name = e => (e.tagName || '').toLowerCase() + (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 3).join('.') : '');
  const loops = new Map();
  for (const a of document.getAnimations()) {
    try {
      if (a.playState !== 'running' || a.effect.getComputedTiming().iterations !== Infinity) continue;
      const t = a.effect.target, el = t && (t.nodeType === 1 ? t : null); if (!el || !vis(el)) continue;
      loops.set(el, name(el) + ' {' + (a.animationName || 'js') + '}');
    } catch (e) { }
  }
  for (const el of document.querySelectorAll('body *')) {
    const s = getComputedStyle(el); if (s.animationName === 'none' || !/infinite/.test(s.animationIterationCount) || s.animationPlayState === 'paused') continue;
    if (!loops.has(el) && vis(el)) loops.set(el, name(el) + ' {' + s.animationName + '}');
  }
  const n = sel => [...document.querySelectorAll(sel)].filter(vis).length;
  const bub = n('.gxh-bub.on,.gxt-bub'), fing = n('.gxh-finger,.gxt-fin,#finger'), nudge = n('.nudge'), from = n('.gxh-ring.from'), ring = n('.gxh-ring:not(.from),.gxt-ring');
  return { loops: [...loops.values()], helpers: bub + fing + nudge + from + (!bub && ring ? 1 : 0), parts: { bub, fing, nudge, from, ring } };
};
async function watch(p, R, tag, secs, act) {
  for (let k = 0; k < secs; k++) {
    if (act) await act(k).catch(() => { });
    await sleep(1000);
    const s = await p.evaluate(SAMPLE).catch(() => null); if (!s) continue;
    if (s.loops.length > R.loops) { R.loops = s.loops.length; R.at = tag + '@' + k + ' ' + s.loops.join(', '); }
    if (s.helpers > R.helpers) { R.helpers = s.helpers; R.hAt = tag + '@' + k + ' ' + JSON.stringify(s.parts); }
  }
}
const tapSel = async (p, sel) => { const c = await p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(x => { const r = x.getBoundingClientRect(); return r.width > 4 && !x.closest('[hidden]'); }); if (!e) return null; const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, sel); if (c) await p.touchscreen.tap(c[0], c[1]); return !!c; };
const drive = p => p.evaluate(() => {   // play on as a careful newcomer: close dialogs, tap Ready, take the computer's suggested move
  const ok = document.querySelector('#dlg button, #rstep button, .gxh-bub.on .gxh-ok'); if (ok) { ok.click(); return; }
  const rd = document.querySelector('#acts [data-a="ready"]'); if (rd && !UI.busy) { rd.click(); return; }
  if (UI.started && !UI.busy && iMustAct() && G.phase !== 'over') { const m = LD.AI.choose(G, viewSeat(), 'normal'); if (m) doMove(m); }
});
(async () => {
  const URL = await gx.url('lantern-dive', { file: FILE });
  const b = await chromium.launch(); let bad = false; const rows = [];
  for (const [W, H] of [[375, 667], [375, 553]]) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    const run = async (tag, fn) => { const p = await ctx.newPage(); const R = { loops: 0, helpers: 0 }; try { await fn(p, R); } catch (e) { R.err = String(e.message).slice(0, 80); } await p.close(); rows.push(`${W}x${H} ${tag.padEnd(9)} loops=${R.loops} maxHelpers=${R.helpers}${R.at ? '  loops: ' + R.at : ''}${R.hAt && R.helpers > 1 ? '  helpers: ' + R.hAt : ''}${R.bubble ? '  bulb: ' + R.bubble : ''}${R.err ? '  ERR ' + R.err : ''}`); if (R.loops > 0 || R.helpers > 1 || R.err) bad = true; };
    await run('title', async (p, R) => { await p.goto(URL); await sleep(1500); await watch(p, R, 'title', 10); });
    await run('tutorial', async (p, R) => {
      await p.goto(URL); await sleep(1500); await p.evaluate(() => { try { localStorage.clear(); } catch (e) { } }); await p.reload(); await sleep(1500);
      await p.evaluate(() => { try { showStart(); } catch (e) { } }); await sleep(300);
      if (!(await tapSel(p, '#start [data-gxt-open]'))) throw new Error('no Learn button');
      await sleep(600); await p.evaluate(() => { AIDELAY = 300; });
      await watch(p, R, 'tutorial', SECS * 4, async () => {   // do what each step asks: Next, or a tap in the spotlight
        const t = await p.evaluate(() => { const s = GXT.state(); if (!s.active || !s.shown) return null; const nb = document.querySelector('.gxt-bub .gxt-next'); if (!s.wait && nb) { const r = nb.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; } return s.hole ? [s.hole.cx, s.hole.cy] : null; });
        if (t) await p.touchscreen.tap(t[0], t[1]);
      });
    });
    await run('hints', async (p, R) => {
      await p.goto(URL + (URL.includes('?') ? '&' : '?') + 'scn=ld-board'); await p.waitForFunction(() => window.GXSCN && GXSCN.ready, null, { timeout: 30000 }).catch(() => { });
      await sleep(800); await tapSel(p, '#hintstog');
      for (let i = 0; i < 120; i++) { await sleep(200); if (await p.evaluate(() => G.phase === 'play' && iMustAct() && !UI.busy && !document.querySelector('#acts [data-a="ready"]'))) break; await drive(p); }
      if (!(await tapSel(p, '#bulbbtn'))) throw new Error('no bulb to tap'); await sleep(500); R.bubble = await p.evaluate(() => { const e = document.querySelector('.gxh-bub.on'); return e ? e.textContent.slice(0, 40) : 'none'; }); await watch(p, R, 'bulb', SECS);
      await watch(p, R, 'play', SECS, async () => drive(p));
    });
    await run('2-divers', async (p, R) => {
      await p.goto(URL); await sleep(2000);
      await p.evaluate(() => { try { GX.close(); } catch (e) { } AIDELAY = 400; UI.seed = 6; newGame('vs', { np: 2, mission: 5, kind: 'log', level: 'normal' }); if (!UI.prefs.hints) hintsToggle(); render(); });
      await watch(p, R, '2div', SECS * 2, async () => drive(p));
    });
    await ctx.close();
  }
  await b.close(); gx.close && gx.close();
  console.log(rows.join('\n')); console.log(bad ? 'CALM FAIL' : 'CALM PASS');
  process.exit(bad ? 1 : 0);
})();
