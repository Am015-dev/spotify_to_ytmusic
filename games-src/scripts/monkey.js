// MONKEY playout: seeded random-tap fuzz of ONE game at machine speed (turbo.js), asserting invariants after every tap.
//   node games-src/scripts/monkey.js <slug> [--seed N] [--steps 400] [--file /abs/game.html] [--replay out.json] [--out dir] [--limit 45] [--pc]
// What it does: loads /<slug>/ (gx-serve.js) at 402x874 (touch) under turbo (timers/rAF/clock ~100x), taps the start button, then each step picks ONE
// random actionable element (button, role=button, link, onclick, cursor:pointer, data-a/id/cell/... attrs) that is visible, >= 24 px, not disabled and not
// covered at its centre; highlighted ones (class legal/valid/hl/glow/pulse/target/...) get 4x weight; menu/restart/new-game/quit/settings/help/etc. are
// denied. If nothing qualifies it taps a random point on the biggest canvas. The RNG is seeded, so seed + same build = same run.
// Invariants checked after EVERY step (a violation is recorded with the step number and the last 5 taps):
//   error     pageerror / console.error / unhandled rejection (noise such as audio autoplay, ResizeObserver, failed external loads is ignored)
//   blank     DOM has no visible text, no canvas and no actionable element
//   frozen    no actionable element and no game-over text, and still none after 3 s of game time (turbo tick)
//   overlay   elementFromPoint at the viewport centre is a fixed/absolute layer covering >= 90% of the screen, see-through or empty of actionable
//             children, for 5 consecutive steps (a ghost layer swallowing every tap)
// Last-resort taps (only when nothing else is actionable): a dialog's close/ok/skip button, then a random canvas point.
// Stops at: game-over text (game over|victory|defeat|you won/lost|final score|winner:|wins the game|you win!), --steps, or --limit seconds (default 45 so a run stays under 60 s; hard exit 3).
// Output: JSON summary on stdout {slug, seed, steps, gameOver, secs, errors[], stuck[]} and a replay file (default $TMPDIR/monkey/<slug>-<seed>.json, or --out dir)
//   with the taps; re-run exactly with:  node games-src/scripts/monkey.js <slug> --replay <file>   (replays the recorded x,y taps, same invariants).
// Exit code: 0 clean, 1 invariant violations. Needs the game's page at games/<slug>/ (or --file). Never edits anything in the repo.
const fs = require('fs'), path = require('path'), os = require('os');
const ROOT = path.resolve(__dirname, '..', '..');
const { chromium } = require(fs.existsSync(path.join(ROOT, 'games-src', 'node_modules', 'playwright')) ? path.join(ROOT, 'games-src', 'node_modules', 'playwright') : 'playwright');
const gx = require('./gx-serve.js');
const { turbo, budget, tick } = require('./turbo');
const arg = (n, d) => { const i = process.argv.indexOf('--' + n); return i > 0 ? process.argv[i + 1] : d; };
const SLUG = process.argv[2];
if (!SLUG || SLUG.startsWith('--')) { console.log('usage: node monkey.js <slug> [--seed N] [--steps 400] [--file abs.html] [--replay file.json] [--out dir] [--limit 45]'); process.exit(2); }
const REPLAY = arg('replay') ? JSON.parse(fs.readFileSync(arg('replay'), 'utf8')) : null;
const SEED = REPLAY ? REPLAY.seed : +arg('seed', 1), STEPS = +arg('steps', 400), LIMIT = +arg('limit', 45);
const OUT = arg('out', path.join(os.tmpdir(), 'monkey'));
function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const NOISE = /NotAllowedError|AudioContext|autoplay|play\(\) failed|ResizeObserver|play\(\) request|The play\(\)|net::ERR_(FAILED|BLOCKED|INTERNET|NAME|ABORTED)|favicon|GPU stall|WebGL|requestFullscreen|Fullscreen|Permissions policy|vibrate|Failed to load resource|WebSocket connection/i;
const OVER = /game over|victory!?(?! condition)|defeat|you (won|lost)\b|final scores?|winner:|wins the game|you win!/i;

const PAGE = `(() => {
if (window.__mk) return;
const DENY = /^(menu|quit|exit|restart|resign|settings?|sound|music|mute|help|rules?|how to play|tutorial|learn|new here|credits|privacy|terms|shop|buy|share|feedback|reset|delete|clear|fullscreen|language|new game|new run|play again|main menu|home|back|close|skip|⚙|☰|≡|✕|×|x|\\?)$/i;
const DENYA = /(restart|new-?game|newgame|menu|quit|settings|gear|mute|help|credit|share|reset|home|\\bgx-ibtn\\b|gxh-bulb|data-gx)/i;
const LEGAL = /(^|[-_ ])(legal|valid|hl|highlight|hint|avail|playable|selectable|target|glow|pulse|pri|primary|next|go|yes|can)([-_ ]|$)/i;
function vis(e) { const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return null; for (let p = e; p && p.nodeType === 1; p = p.parentElement) { const cs = getComputedStyle(p); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.1) return null; } return r; }
function inter(e, cs) {
  const t = e.tagName;
  if (t === 'BUTTON' || t === 'SUMMARY' || (t === 'A' && e.hasAttribute('href')) || (t === 'INPUT' && /button|checkbox|radio/.test(e.type))) return true;
  const rl = e.getAttribute('role'); if (rl === 'button' || rl === 'tab' || rl === 'menuitem' || rl === 'option') return true;
  if (e.hasAttribute('onclick')) return true;
  for (const a of e.attributes) if (/^data-(a|act|action|id|idx|cell|card|k|v|go|pick|choose|tile|slot|sq|hex|node|opt|row|col|r|c|i|x|y)$/.test(a.name) && cs.cursor === 'pointer') return true;
  return cs.cursor === 'pointer' && !(e.parentElement && getComputedStyle(e.parentElement).cursor === 'pointer');
}
function desc(e) { let s = e.tagName.toLowerCase(); if (e.id) s += '#' + e.id; if (typeof e.className === 'string' && e.className.trim()) s += '.' + e.className.trim().split(/\\s+/).slice(0, 3).join('.'); const t = (e.innerText || e.getAttribute('aria-label') || '').trim().replace(/\\s+/g, ' ').slice(0, 24); return t ? s + '"' + t + '"' : s; }
function actionable() {
  const out = [];
  for (const e of document.body.querySelectorAll('*')) {
    const cs = getComputedStyle(e); if (cs.pointerEvents === 'none' || !inter(e, cs)) continue;
    const r = vis(e); if (!r || r.right <= 0 || r.bottom <= 0 || r.left >= innerWidth || r.top >= innerHeight) continue;
    if (Math.min(r.width, r.height) < 24) continue;
    if (e.disabled || e.getAttribute('aria-disabled') === 'true') continue;
    const cx = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), cy = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
    const top = document.elementFromPoint(cx, cy); if (!(top && (e === top || e.contains(top) || top.contains(e)))) continue;
    const txt = (e.innerText || e.getAttribute('aria-label') || e.title || '').trim().replace(/\\s+/g, ' ').slice(0, 40);
    const cls = typeof e.className === 'string' ? e.className : '';
    const start = /^(start|play|begin|deal|vs\\.?\\s*(the\\s*)?(computer|cpu|ai|bot)|solo|1 player|quick( game| play)?|battle|enter|new game|new run)\\b/i.test(txt) || e.matches('[data-a=start]');
    out.push({ x: cx, y: cy, d: desc(e), start, closer: /^(close|back|ok|okay|got it|done|continue|next|skip|skip tutorial|✕|×|x)$/i.test(txt) || /\\b(close|dismiss)\\b/i.test(e.getAttribute('aria-label') || ''), deny: (DENY.test(txt) || DENYA.test(cls + ' ' + (e.id || '') + ' ' + [...e.attributes].map(a => a.name).join(' '))) && !start, legal: LEGAL.test(cls) });
  }
  return out;
}
function canvasPt(rnd) { let best = null, ba = 0; for (const c of document.querySelectorAll('canvas')) { const r = vis(c); if (r && r.width * r.height > ba) { ba = r.width * r.height; best = r; } } return best ? { x: best.left + best.width * (0.1 + 0.8 * rnd), y: best.top + best.height * (0.1 + 0.8 * rnd) } : null; }
function state() {
  const txt = (document.body.innerText || '').replace(/\\s+/g, ' ').trim();
  let top = document.elementFromPoint(innerWidth / 2, innerHeight / 2), ghost = null;
  for (let e = top; e && e !== document.body && e !== document.documentElement; e = e.parentElement) {
    const cs = getComputedStyle(e); if (cs.position !== 'fixed' && cs.position !== 'absolute') continue;
    const r = e.getBoundingClientRect(); if (r.width * r.height < 0.9 * innerWidth * innerHeight) continue;
    const bg = cs.backgroundColor, clear = /rgba\\(.*,\\s*0\\)|transparent/.test(bg) && cs.backgroundImage === 'none';
    const kids = [...e.querySelectorAll('*')].filter(k => inter(k, getComputedStyle(k)) && vis(k)).length;
    if ((clear || +cs.opacity < 0.1 || !txt) && kids === 0 && e.tagName !== 'CANVAS' && !/gx-hud|stage|game|board|app|root|wrap/i.test(e.id + ' ' + e.className)) ghost = desc(e);
    break;
  }
  return { len: txt.length, canvas: !!document.querySelector('canvas'), over: txt, ghost };
}
window.__mk = { actionable, canvasPt, state };
window.__mkErr = [];
addEventListener('unhandledrejection', e => window.__mkErr.push('unhandled rejection: ' + (e.reason && (e.reason.stack || e.reason.message) || e.reason)));
})();`;

(async () => {
  const stop = budget((LIMIT + 25) * 1000, 'monkey ' + SLUG);
  fs.mkdirSync(OUT, { recursive: true });
  const t0 = Date.now(), rnd = rng(SEED), taps = [], errors = [], stuck = [];
  const file = arg('file');
  const url = await gx.url(SLUG, file ? { file } : {});
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const ctx = await browser.newContext({ viewport: { width: 402, height: 874 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1 });
  await ctx.route(u => !/^(http:\/\/127\.0\.0\.1|data:|blob:|about:)/.test(u.href || String(u)), r => r.abort());
  await turbo(ctx); await ctx.addInitScript(PAGE);
  const page = await ctx.newPage();
  let step = 0;
  const rec = (kind, msg) => { const k = kind + msg.slice(0, 80); if (errors.some(e => e.k === k)) return; errors.push({ k, kind, step, msg: msg.slice(0, 300), last5: taps.slice(-5).map(t => t.d + '@' + Math.round(t.x) + ',' + Math.round(t.y)) }); };
  page.on('pageerror', e => { if (!NOISE.test(e.message)) rec('error', 'pageerror: ' + e.message.split('\n')[0] + ' @ ' + String(e.stack || '').split('\n').slice(1, 3).map(x => x.trim().replace(/^at /, '').replace(/http:\/\/[^/]+/, '')).join(' < ')); });
  page.on('console', m => { if (m.type() === 'error' && !NOISE.test(m.text())) rec('error', 'console.error: ' + m.text().split('\n')[0]); });
  page.on('dialog', d => d.dismiss().catch(() => { })); page.on('popup', p => p.close().catch(() => { }));
  let overMsg = '', gameOver = false, ghostRun = 0, started = false, noAct = 0;
  try {
    await page.goto(url, { waitUntil: 'load', timeout: 30000 }); await tick(page, 1500);
    for (step = 1; step <= STEPS && !gameOver && (Date.now() - t0) < LIMIT * 1000; step++) {
      let pick;
      if (REPLAY) { pick = REPLAY.taps[step - 1]; if (!pick) break; }
      else {
        const acts = await page.evaluate(() => window.__mk.actionable());
        let pool = acts.filter(a => !a.deny);
        const starts = pool.filter(a => a.start);
        if (!started && starts.length) { pool = starts; started = true; }
        else if (started) pool = pool.filter(a => !a.start || rnd() < 0.15);
        if (!pool.length) pool = acts.filter(a => a.closer);   // only a dialog's own close/ok button is left: use it
        if (!pool.length) { const c = await page.evaluate(r => window.__mk.canvasPt(r), rnd()); if (c) pool = [{ x: c.x, y: c.y, d: 'canvas' }]; }
        if (!pool.length) {
          await tick(page, 3000);   // frozen check: still nothing 3 s of game time later?
          const again = (await page.evaluate(() => window.__mk.actionable())).filter(a => !a.deny || a.closer), st = await page.evaluate(() => window.__mk.state());
          if (OVER.test(st.over)) { gameOver = true; break; }
          if (!again.length) { if (++noAct >= 2) { stuck.push({ step, kind: 'frozen', msg: 'no actionable element for 3 s of game time; text: ' + st.over.slice(0, 120), last5: taps.slice(-5).map(t => t.d) }); break; } }
          continue;
        }
        noAct = 0;
        const w = pool.map(a => a.legal ? 4 : 1), tot = w.reduce((a, b) => a + b, 0); let r = rnd() * tot, i = 0;
        while (i < pool.length - 1 && (r -= w[i]) > 0) i++;
        pick = pool[i];
      }
      taps.push({ x: pick.x, y: pick.y, d: pick.d });
      try { await page.touchscreen.tap(pick.x, pick.y); } catch (e) { rec('error', 'tap failed: ' + e.message.split('\n')[0]); }
      await tick(page, 400);
      const errs = await page.evaluate(() => { const a = window.__mkErr.slice(); window.__mkErr.length = 0; return a; });
      for (const m of errs) if (!NOISE.test(m)) rec('error', m.split('\n')[0]);
      const st = await page.evaluate(() => window.__mk.state()), n = (await page.evaluate(() => window.__mk.actionable())).length;
      if (st.len < 3 && !st.canvas && !n) { stuck.push({ step, kind: 'blank', msg: 'DOM went blank', last5: taps.slice(-5).map(t => t.d) }); break; }
      ghostRun = st.ghost ? ghostRun + 1 : 0;
      if (ghostRun === 5) { stuck.push({ step, kind: 'overlay', msg: 'transparent full-screen layer over centre for 5 steps: ' + st.ghost, last5: taps.slice(-5).map(t => t.d) }); break; }
      if (step > 5 && OVER.test(st.over)) { gameOver = true; overMsg = (OVER.exec(st.over) || {}).input ? st.over.slice(Math.max(0, st.over.search(OVER) - 30), st.over.search(OVER) + 50) : ''; }
    }
  } catch (e) { rec('error', 'harness: ' + e.message.split('\n')[0]); }
  if (stuck.length) try { await page.screenshot({ path: path.join(OUT, `${SLUG}-${SEED}-stuck.png`) }); } catch (e) { }
  await browser.close(); stop();
  try { process.stdout.write(''); } catch (e) { }
  const rf = REPLAY ? null : path.join(OUT, `${SLUG}-${SEED}.json`);
  if (rf) fs.writeFileSync(rf, JSON.stringify({ slug: SLUG, seed: SEED, taps }));
  const summary = { slug: SLUG, seed: SEED, steps: taps.length, gameOver, overMsg, secs: +((Date.now() - t0) / 1000).toFixed(1), errors: errors.map(({ k, ...e }) => e), stuck, replay: rf };
  console.log(JSON.stringify(summary, null, 1));
  process.exit(errors.length || stuck.length ? 1 : 0);
})().catch(e => { console.error('monkey crashed:', e.message); process.exit(2); });
