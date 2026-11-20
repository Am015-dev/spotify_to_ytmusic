// Calm audit (owner, Nov 2026): every shelf game at 375x667 must run 0 infinite animations and show at most 1 helper at once,
// also for the 20 s after a Hint/bulb tap and on the Guided / first-time path.
//   node scripts/calm-audit.js [stageDir=.staging] [slug ...]      (stageDir = a build-all --out folder; served like the live site by gx-serve.js)
//   CALM_SECS=20 (seconds sampled per path, one sample a second)
// Two paths per game:
//   play    the game's start scenario (?scn=, the first one that looks like a board/turn state), then a tap on the Hint/bulb button if there is one
//   guided  a fresh load (empty storage), then a tap on the Learn / Guided / Tutorial button if there is one (nothing else is tapped: a waiting tutorial step)
// loops      = the most distinct VISIBLE elements running an infinite animation in one sample (document.getAnimations() iterations Infinity that are
//              running, plus CSS animation-iteration-count infinite on visible elements), over both paths
// maxHelpers = the most helpers on screen at once: open bubbles (.gxh-bub.on, .gxt-bub), fingers (.gxh-finger, .gxt-fin, #finger), idle-nudge outlines
//              (.nudge), step banner (#line .stepn), preview/verdict strip (#pv), #coach/#coachb, #toast.on, the drag-start ring (.gxh-ring.from), and a highlight ring shown with no bubble. A bubble's own target ring is part of that bubble.
// Prints  <slug> loops=N maxHelpers=M  per game (details after two spaces), then the looping elements (selector + animation name) so they can be traced.
// Never fails the build: it measures. Exit 0.
const path = require('path'), fs = require('fs');
const PW = (() => { try { return require('playwright'); } catch (e) { return require(path.join(__dirname, '..', 'node_modules', 'playwright')); } })();
const gx = require('./gx-serve.js');
const SKIP = new Set(['mainhattan-overdrive', 'deep-signal', 'nightrun']);
const SECS = +process.env.CALM_SECS || 20;
const sleep = ms => new Promise(r => setTimeout(r, ms));

function slugs() {   // build-all's GAMES table, read from the file (one source of truth)
  const t = fs.readFileSync(path.join(__dirname, 'build-all.py'), 'utf8'), m = t.split('GAMES = {')[1].split('\n}')[0];
  return [...m.matchAll(/^\s*"([a-z0-9-]+)":/gm)].map(x => x[1]).filter(s => !SKIP.has(s));
}

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
  const bub = n('.gxh-bub.on,.gxt-bub'), fing = n('.gxh-finger,.gxt-fin,#finger'), nudge = n('.nudge'), extra = n('#coach,#coachb,#toast.on,#pv:not([hidden]),#verdict,#line .stepn'), from = n('.gxh-ring.from'), ring = n('.gxh-ring:not(.from),.gxt-ring');
  return { loops: [...loops.values()], helpers: bub + fing + nudge + from + extra + (!bub && ring ? 1 : 0), parts: { bub, fing, nudge, from, ring, extra } };
};

async function tapText(p, re) {   // the first visible button whose text or label matches re
  return p.evaluate(src => {
    const re = new RegExp(src, 'i');
    const b = [...document.querySelectorAll('button,[role=button],a.btn,.btn')].find(e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4 && getComputedStyle(e).visibility !== 'hidden' && re.test((e.textContent || '') + ' ' + (e.getAttribute('aria-label') || '')); });
    if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, t: (b.textContent || b.getAttribute('aria-label') || '').trim().slice(0, 30) };
  }, re.source).then(async c => { if (c) await p.touchscreen.tap(c.x, c.y); return c; });
}
async function tapBulb(p) {
  const c = await p.evaluate(() => {
    const b = [...document.querySelectorAll('#bulbbtn,.gxh-bulb,#whatbtn,[aria-label*="hint" i],[aria-label*="suggest" i]')].find(e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4 && !e.closest('[hidden]') && getComputedStyle(e).visibility !== 'hidden' && r.bottom > 0 && r.top < innerHeight; });
    if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  });
  if (c) await p.touchscreen.tap(c.x, c.y); return !!c;
}
async function watch(p, R, tag) {
  for (let k = 0; k < SECS; k++) {
    await sleep(1000);
    const s = await p.evaluate(SAMPLE).catch(() => null); if (!s) continue;
    if (s.loops.length > R.loops) R.loops = s.loops.length;
    s.loops.forEach(l => R.loopers.add(tag + ' ' + l));
    if (s.helpers > R.helpers) { R.helpers = s.helpers; R.hAt = tag + '@' + (k + 1) + 's ' + JSON.stringify(s.parts); }
  }
}
function pickScn(list) {
  const bad = /tutor|learn|guided|menu|title|over|end|win|lose|offer|help|rules|shelf|lab|campaign|setting|result|score|online|net|lobby/i;
  const good = /board|start|turn|play|open|fresh|first|main|round|deal|setup|game/i;
  return (list.find(s => good.test(s.id) && !bad.test(s.id)) || list.find(s => !bad.test(s.id)) || list[0] || {}).id;
}
async function game(browser, base, slug) {
  const R = { loops: 0, helpers: 0, loopers: new Set(), notes: [] };
  const ctx = await browser.newContext({ viewport: { width: 375, height: 667 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
  try {
    // play: the start scenario + a bulb tap
    let p = await ctx.newPage(); p.setDefaultTimeout(15000);
    await p.goto(`${base}/${slug}/?scn=list`, { waitUntil: 'load', timeout: 45000 }).catch(() => { });
    const list = await p.waitForFunction(() => window.GXSCN && window.GXSCN.ready, null, { timeout: 20000 }).then(() => p.evaluate(() => (window.GXSLIST || []).map(s => ({ id: s.id })))).catch(() => []);
    const id = pickScn(list);
    if (id) {
      await p.goto(`${base}/${slug}/?scn=${encodeURIComponent(id)}`, { waitUntil: 'load', timeout: 45000 }).catch(() => { });
      await p.waitForFunction(() => window.GXSCN && window.GXSCN.ready, null, { timeout: 20000 }).catch(() => R.notes.push('scn not ready'));
    } else {
      await p.goto(`${base}/${slug}/`, { waitUntil: 'load', timeout: 45000 }).catch(() => { });
      await sleep(800); const s = await tapText(p, /^\s*(play|start|new game|vs|quick)/); R.notes.push(s ? 'start "' + s.t + '"' : 'no start');
    }
    await sleep(900);
    const bulb = await tapBulb(p); R.notes.push('scn=' + (id || '-') + (bulb ? ' +bulb' : ' nobulb'));
    await watch(p, R, 'play');
    await p.close();
    // guided: fresh storage, the Learn / Guided button, then hands off
    p = await ctx.newPage(); p.setDefaultTimeout(15000);
    await p.goto(`${base}/${slug}/`, { waitUntil: 'load', timeout: 45000 }).catch(() => { });
    await p.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) { } });
    await p.reload({ waitUntil: 'load' }).catch(() => { }); await sleep(1200);
    const g = await tapText(p, /learn|guided|tutorial|how to play|teach me|first game/);
    R.notes.push(g ? 'guided "' + g.t + '"' : 'no guided button');
    if (g) { await sleep(800); await tapText(p, /^\s*(start|begin|let'?s go|yes|ok)\b/); }
    await watch(p, R, 'guided');
    await p.close();
  } catch (e) { R.notes.push('crash ' + String(e.message).slice(0, 80)); }
  await ctx.close();
  return R;
}
(async () => {
  const args = process.argv.slice(2), stage = args[0] && !/^[a-z0-9-]+$/.test(args[0]) || (args[0] && fs.existsSync(args[0])) ? args.shift() : null;
  const want = args.length ? args : slugs();
  const srv = await gx.startServer({ stage: stage || undefined }), base = srv.base.replace(/\/+$/, '');
  let exe; try { if (!fs.existsSync(PW.chromium.executablePath()) && fs.existsSync('/opt/pw-browsers/chromium')) exe = '/opt/pw-browsers/chromium'; } catch (e) { }
  const browser = await PW.chromium.launch({ args: ['--no-sandbox'], executablePath: exe });
  const all = [];
  for (const slug of want) {
    const R = await game(browser, base, slug); all.push([slug, R]);
    console.log(`${slug} loops=${R.loops} maxHelpers=${R.helpers}  ${R.notes.join(', ')}${R.hAt ? ' | max at ' + R.hAt : ''}`);
  }
  console.log('\nlooping elements:');
  for (const [slug, R] of all) for (const l of R.loopers) console.log('  ' + slug + ' ' + l);
  await browser.close(); await srv.close(); process.exit(0);
})();
