// Crown City Smash scenario lessons test (turbo, machine speed). Usage: node games-src/kot/lessons-test.js [402x874,1366x768]
// Asserts per size: every lesson is solved by a scripted solution with REAL taps (win, 3 stars, no hint); a wrong move fails with a message and Retry
// restarts it; the player can tap anything (every die, button and card is uncovered and a die tap toggles it); hint nudge then show; 0 JS errors.
// Writes a start-of-lesson contact sheet per size to kot/proof/lessons-<size>-sheet.jpg (+ the cells).
const PW = (() => { try { return require('playwright'); } catch (e) { return require('../node_modules/playwright'); } })();
const { turbo, budget, tick } = require('../scripts/turbo');
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, '..', '.staging', 'crown-city-smash', 'index.html'));
const SIZES = (process.argv[2] || '402x874,1366x768').split(',').map(s => s.split('x').map(Number));
const PROOF = path.join(__dirname, 'proof'); fs.mkdirSync(PROOF, { recursive: true });
const probs = [];
const IDS = ['keep', 'enter', 'claws', 'city', 'heal', 'buy', 'sweep', 'yield', 'win20', 'game'];
async function run(b, W, H) {
  const tag = W + 'x' + H, phone = W < 600, note = m => probs.push(tag + ': ' + m), shots = [];
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: true, serviceWorkers: 'block' });
  await turbo(ctx);
  await ctx.route('**/*', r => new URL(r.request().url()).host === 'gns.test' ? r.fulfill({ status: 200, contentType: 'text/html', body: html }) : r.abort());
  const p = await ctx.newPage(); p.setDefaultTimeout(20000);
  p.on('pageerror', e => note('PAGE ERROR ' + e.message));
  p.on('console', m => { if (m.type() === 'error' && !/net::|Failed to load|favicon|WebGL/.test(m.text())) note('console error ' + m.text().slice(0, 140)); });
  await p.addInitScript(() => { try { localStorage.setItem('ccs_tour2', '1'); localStorage.setItem('ccs_gfx', 'low'); localStorage.setItem('ccs_bf1', JSON.stringify({ keep: 1, roll: 1, done: 1, buy: 1 })); } catch (e) { } });
  await p.goto('https://gns.test/?gl=0' + (phone ? '' : ''));
  await p.waitForFunction(() => window.GXST && window.CCL && GXST.state(), null, { timeout: 30000 });
  await p.evaluate(() => { window.__ev = []; addEventListener('gxst', e => __ev.push(e.detail.type + ':' + (e.detail.id || ''))); });
  const st = () => p.evaluate(() => GXST.state());
  const tapSel = async (sel, what) => {
    const pt = await p.evaluate(s => { const e = [...document.querySelectorAll(s)].find(e => { const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4; }); if (!e) return null; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2, u = document.elementFromPoint(x, y); return { x, y, ok: !!u && (u === e || e.contains(u) || u.contains(e)) }; }, sel);
    if (!pt) { note('nothing to tap: ' + (what || sel)); return false; } if (!pt.ok) note('something covers ' + (what || sel));
    await p.touchscreen.tap(pt.x, pt.y); await tick(p, 500); return true;
  };
  const live = id => p.waitForFunction(id => { const s = GXST.state(); return s.id === id && s.phase === 'play' && s.live; }, id, { timeout: 25000 });
  const myTurn = () => p.waitForFunction(() => humanTurn() && !UI.busy && !UI.choice, null, { timeout: 15000 });
  const die = k => tapSel('#dice .die[data-die="' + k + '"]', 'die ' + k);
  const smash = () => tapSel('#pacts [data-act="resolve"]', 'SMASH');
  const roll = () => tapSel('#pacts [data-act="reroll"]', 'Roll');
  const endT = () => tapSel('#pacts [data-act="end"]', 'End turn');
  const buyCard = async () => {   // first tap reads on a phone, second buys
    for (let i = 0; i < 3; i++) { if (await p.evaluate(() => G.pl.filter(q => q.human)[0].cards.length > 0 || (G.tf && G.tf.bought))) break; await tapSel('#pshop [data-shop="0"], #buymini [data-card="0"]', 'card 0'); }
  };
  const phase = (want, ms) => p.waitForFunction(w => GXST.state().phase === w, want, { timeout: ms || 20000 }).then(() => true, () => false);
  const SOLVE = {
    keep: async () => { await die(0); await die(1); await roll(); await smash(); },
    enter: async () => { await smash(); },
    claws: async () => { await smash(); },
    city: async () => { await die(0); await die(1); await roll(); await smash(); },
    heal: async () => { await die(0); await die(1); await roll(); await smash(); },
    buy: async () => { await smash(); await myTurn(); await buyCard(); },
    sweep: async () => { await smash(); await myTurn(); await tapSel('#pacts [data-act="sweep"]', 'Sweep'); await myTurn(); await buyCard(); },
    yield: async () => { await p.waitForSelector('#choice [data-opt="yield"]', { state: 'visible' }); await tapSel('#choice [data-opt="yield"]', 'Yield'); },
    win20: async () => { await smash(); await myTurn(); await endT(); },
    game: async () => {
      await p.evaluate(() => { CCL.L.mine = []; for (let i = 0; i < 30; i++) CCL.L.mine.push(['3', '3', '3', '3', 'E', 'H']); CCL.L.riv = []; for (let i = 0; i < 30; i++) CCL.L.riv.push(['H', 'E', '1', '2', 'E', 'H']); });
      for (let g = 0; g < 40; g++) {
        const s = await st(); if (s.phase !== 'play') break;
        const w = await p.evaluate(() => (G.winner ? 'over' : humanTurn() && !UI.busy && !UI.choice ? G.phase : 'wait'));
        if (w === 'roll') await smash(); else if (w === 'buy') await endT(); else await tick(p, 400);
      }
    }
  };
  const T0 = Date.now(); const solve = async id => { if (process.env.V) console.log(id, ((Date.now() - T0) / 1000).toFixed(1)); await SOLVE[id](); if (!(await phase('win', 25000))) { const s = await st(); note(id + ': scripted solution did not win (phase ' + s.phase + (s.msg ? ', ' + s.msg : '') + ')'); } };
  // 1) picker lists every lesson
  await p.evaluate(() => GXST.picker()); await tick(p, 300);
  let s = await st(); const n = await p.evaluate(() => document.querySelectorAll('.gxst-pick').length);
  if (s.phase !== 'picker' || n !== IDS.length) note('picker shows ' + n + ' of ' + IDS.length + ' lessons');
  await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-picker.png') });
  // 2) wrong move on lesson 1 fails with a message, Retry restarts
  await tapSel('.gxst-pick[data-id="keep"]', 'lesson 1'); await live('keep'); await tick(p, 800);
  shots.push(await p.screenshot({ type: 'jpeg', quality: 70 }));
  // tap anything: nothing of the kit covers a die or a button; a die tap toggles it
  const cov = await p.evaluate(() => [...document.querySelectorAll('#dice .die, #pacts [data-act]')].filter(e => { const r = e.getBoundingClientRect(); if (r.width < 4) return false; const u = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return u && u.closest('.gxst-card'); }).length);
  if (cov) note(cov + ' board items under the lesson card');
  await die(2); if (!(await p.evaluate(() => G.dice[2].k))) note('a die tap did nothing'); await die(2);
  await smash();   // wrong: a pair scores nothing
  if (!(await phase('fail'))) note('a wrong move did not fail');
  s = await st(); if (!/\w{4}/.test(s.msg || '')) note('fail has no message');
  await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-fail.png') });
  await tapSel('.gxst-ft .pri', 'Retry'); await live('keep'); await tick(p, 500);
  // 3) hint: nudge then show, ring never under the card
  await tapSel('.gxst-bulb', 'hint'); await tapSel('.gxst-bulb', 'hint'); s = await st();
  if (s.hint !== 2 || !s.target) note('show-me hint has no target'); if (s.overlap) note('card covers the hinted target');
  await solve('keep'); s = await st(); if (s.stars !== 1) note('two hints should give 1 star, got ' + s.stars);
  // 4) every other lesson via Next, solved with no hint (3 stars, or par)
  for (let i = 1; i < IDS.length; i++) {
    await tapSel('.gxst-ft .pri', 'Next'); await live(IDS[i]).catch(() => note(IDS[i] + ' did not start')); await tick(p, 800);
    shots.push(await p.screenshot({ type: 'jpeg', quality: 70 }));
    await solve(IDS[i]); s = await st(); if (s.phase === 'win' && s.stars < 3 && IDS[i] !== 'game') note(IDS[i] + ': clean solve gave ' + s.stars + ' stars');
  }
  await p.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-win.png') });
  s = await st(); if (Object.keys(s.best).length !== IDS.length) note('progress saved for ' + Object.keys(s.best).length + '/' + IDS.length);
  // 5) buy: a one-shot card fails with a message; ending the turn unspent fails
  await tapSel('.gxst-hd .gxst-ib[aria-label="Close"]', 'close'); await p.evaluate(() => GXST.start('buy')); await live('buy');
  await smash(); await myTurn(); await endT(); if (!(await phase('fail'))) note('buy: ending the turn unspent did not fail');
  // 6) close, Lessons reopens the picker
  await tapSel('.gxst-hd .gxst-ib[aria-label="Close"]', 'close'); if ((await st()).open || await p.$('.gxst-card')) note('close left the card');
  await tapSel('.gxst-q', 'Lessons'); s = await st(); if (!s.open || s.phase !== 'picker') note('Lessons did not reopen the picker');
  const ev = await p.evaluate(() => __ev.join(',')); ['start', 'fail', 'retry', 'hint', 'win', 'close', 'picker'].forEach(t => { if (ev.indexOf(t + ':') < 0) note('no ' + t + ' event'); });
  // contact sheet of lesson starts
  const cols = phone ? 5 : 3, cw = phone ? 260 : 455, ch = Math.round(cw * H / W);
  const cells = shots.map((bf, i) => { fs.writeFileSync(path.join(PROOF, 'lessons-' + tag + '-' + IDS[i] + '.jpg'), bf); return '<figure><img src="data:image/jpeg;base64,' + bf.toString('base64') + '"><figcaption>' + (i + 1) + ' ' + IDS[i] + '</figcaption></figure>'; }).join('');
  const sp = await ctx.newPage(); await sp.setViewportSize({ width: cols * (cw + 8) + 8, height: Math.ceil(shots.length / cols) * (ch + 30) + 8 });
  await sp.setContent('<style>body{margin:4px;background:#222;display:flex;flex-wrap:wrap;font:14px sans-serif;color:#fff}figure{margin:4px;width:' + cw + 'px}img{width:100%;display:block}figcaption{padding:2px}</style>' + cells);
  await sp.screenshot({ path: path.join(PROOF, 'lessons-' + tag + '-sheet.jpg'), type: 'jpeg', quality: 72, fullPage: true });
  await ctx.close();
}
(async () => {
  const stop = budget(+process.env.BUDGET || 150000, 'crown lessons');
  const b = await PW.chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
  for (const [W, H] of SIZES) { const n = probs.length, t0 = Date.now(); await run(b, W, H).catch(e => probs.push(W + 'x' + H + ': CRASH ' + e.message.split('\n')[0])); console.log((probs.length === n ? 'PASS ' : 'FAIL ') + W + 'x' + H + ' ' + ((Date.now() - t0) / 1000).toFixed(1) + 's'); }
  await b.close(); stop(); probs.forEach(x => console.log('  ' + x)); process.exit(probs.length ? 1 : 0);
})();
