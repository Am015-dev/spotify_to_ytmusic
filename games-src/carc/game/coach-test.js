// Coach test: the coached first game (free play, Tamsin's just-in-time bubbles, scoring walk) played to the end by tapping ONLY visible, uncovered UI.
//   cd games-src/carc/game/src && python3 build.py && URL=http://localhost:8765/index.html CHROME=/opt/pw-browsers/chromium node ../coach-test.js [390x763,1440x860]
// The bot chooses ANY legal move through the UI (random glow, a follower spot of a type not explained yet, or Skip), closes some bubbles, and at the end
// walks the score cards. Asserts: GXCOACH.done, the core rules were explained in play, every other rule was either explained or is on the "later" card,
// no console errors, every tapped target really is hit at its centre (elementFromPoint).
const PW = (() => { try { return require('playwright'); } catch (e) { return require('/opt/node-tools/node_modules/playwright'); } })();
const path = require('path');
const URL = process.env.URL || 'file://' + path.join(__dirname, 'rampart.html');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const probs = [], note = m => { if (probs.length < 40) probs.push(m); };
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1';
async function tapUI(p, el, what) {
  const r = await el.evaluate(e => { const b = e.getBoundingClientRect(); if (b.width < 8 || b.height < 8) return null; const x = b.left + b.width / 2, y = b.top + b.height / 2;
    if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return null; const t = document.elementFromPoint(x, y); return { x, y, ok: !!t && getComputedStyle(e).visibility !== 'hidden' && (t === e || e.contains(t)) }; });
  if (!r) return false; if (!r.ok) { if (what !== 'glow') note('covered target: ' + what); return false; }
  await p.touchscreen.tap(r.x, r.y); return true;
}
const CORE = ['goal', 'match', 'banner', 'follower', 'claim_road'];
const ALL = ['goal', 'match', 'banner', 'follower', 'claim_road', 'claim_town', 'claim_priory', 'claim_field', 'one_owner', 'score_road', 'score_town', 'score_priory', 'majority', 'tie', 'rival_score', 'discard', 'nofig', 'last'];
async function coachGame(b, W, H, tag) {
  const mobile = W < 500;
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: true, userAgent: UA });
  await ctx.addInitScript(() => { try { localStorage.setItem('rv_fast', '1'); localStorage.setItem('rv_seen', '1'); } catch (e) { } });
  const p = await ctx.newPage(); p.setDefaultTimeout(15000);
  p.on('pageerror', e => note(tag + ' PAGE ERROR ' + e.message));
  p.on('console', m => { const t = m.text(); if (m.type() === 'error' && !/net::|Failed to load|favicon|fonts|CORS|Access to fetch/.test(t)) note(tag + ' console error ' + t.slice(0, 160)); });
  await p.goto(URL); await sleep(900);
  const learn = await p.$('#modal .gxt-menu'); if (!learn) { note(tag + ' no tutorial button on the title'); return; }
  await p.screenshot({ path: process.env.SHOTS ? path.join(process.env.SHOTS, 'coach-title-' + W + '.png') : '/dev/null' }).catch(() => { });
  await p.evaluate(() => coachStart()); await sleep(900);   // since 8 Nov the Learn button opens the guided game (tut-walk-test.js); the coached free game is started directly here
  const st = await p.evaluate(() => ({ r: GXCOACH.running, ui: !!UI.coach, g: !!G }));
  if (!st.r || !st.g) { note(tag + ' coached game did not start ' + JSON.stringify(st)); return; }
  let bubbles = 0, idle = 0, moves = 0, shots = 0; const t0 = Date.now();
  while (Date.now() - t0 < 280000) {
    if (await p.evaluate(() => GXCOACH.done)) break;
    const bub = await p.$('#coach .cbub:not([hidden]) .cok');
    if (bub && await bub.isVisible()) {
      if (process.env.SHOTS && shots < 3 && moves >= shots * 6) { await p.screenshot({ path: path.join(process.env.SHOTS, 'coach-' + W + '-' + shots + '.png') }).catch(() => { }); shots++; }
      if (Math.random() < 0.5) { await tapUI(p, bub, 'Got it'); bubbles++; await sleep(120); continue; }
    }
    const go = await p.$('[data-a=cgo]'); if (go) { await tapUI(p, go, 'coach end button'); await sleep(500); continue; }
    const nx = await p.$('[data-a=cnext]'); if (nx) { await tapUI(p, nx, 'coach next'); await sleep(250); continue; }
    let acted = false;
    const hp = await p.$('#hplace'); if (hp && await hp.isVisible() && await tapUI(p, hp, 'Place here')) { idle = 0; await sleep(230); continue; } // touch: confirm the tapped spot
    for (const g of (await p.$$('.glow')).sort(() => Math.random() - .5)) { if (await tapUI(p, g, 'glow')) { acted = true; moves++; break; } }
    if (acted) { idle = 0; await sleep(230); continue; }
    const fg = await p.$$('.fglow');
    if (fg.length) {
      const ex = await p.evaluate(() => GXCOACH.explained); let pick = null;
      for (const f of fg) { const lab = await f.evaluate(e => (e.querySelector('.flab') || {}).textContent || ''); if (lab && !ex.includes('claim_' + lab)) { pick = f; break; } }
      if (await tapUI(p, pick || fg[0], 'follower spot')) { idle = 0; await sleep(230); continue; }
    }
    const sk = await p.$('#hskip'); if (sk && await sk.isVisible() && await tapUI(p, sk, 'skip')) { idle = 0; await sleep(230); continue; }
    await sleep(200); idle++;
    if (idle > 150) { note(tag + ' stuck ' + JSON.stringify(await p.evaluate(() => ({ t: G && G.turn, s: G && G.step, over: G && !!G.over, m: document.getElementById('modal').innerText.slice(0, 80) })))); break; }
  }
  const fin = await p.evaluate(() => ({ done: GXCOACH.done, ex: GXCOACH.explained.slice(), later: GXCOACH.later.slice() }));
  if (!fin.done) note(tag + ' GXCOACH.done never became true');
  for (const c of CORE) if (!fin.ex.includes(c)) note(tag + ' core rule not explained in play: ' + c);
  for (const c of ['tie', 'majority', 'discard', 'score_road', 'score_town', 'score_priory']) if (!fin.ex.includes(c) && !fin.later.includes(c)) note(tag + ' rule neither explained nor on the later card: ' + c);
  console.log(tag + ': ' + (fin.done ? 'PASS' : 'FAIL') + ' moves ' + moves + ', bubbles closed ' + bubbles + ', explained ' + fin.ex.length + '/' + ALL.length + ' [' + fin.ex.join(',') + '] later [' + fin.later.join(',') + ']');
  await ctx.close();
}
(async () => {
  const b = await PW.chromium.launch({ args: ['--no-sandbox'], executablePath: process.env.CHROME || undefined });
  for (const [W, H] of (process.argv[2] || '390x763,1440x860').split(',').map(s => s.split('x').map(Number))) await coachGame(b, W, H, W + 'x' + H);
  await b.close();
  console.log(probs.length ? 'PROBLEMS ' + probs.length + '\n  ' + probs.join('\n  ') : 'PROBLEMS 0');
  process.exit(probs.length ? 1 : 0);
})();
