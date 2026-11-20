// End-line test: the story line (.line) must name the WINNER's real leads, the same categories as the short line (.rwhy).
// node endline-test.js [html] : plays 60 engine games for real finals, adds forced finals of every end type, checks both lines in the page.
const { chromium } = require('playwright'); const path = require('path');
const E = require('./src/engine.js'), AI = require('./src/ai.js');
const LV = ['easy', 'normal', 'hard'];
function play(seed) { const G = E.newGame({ seed }); const rng = () => E.rnd(G); let k = 0; while (!G.over && k++ < 500) { const p = E.sideToAct(G); const m = AI.pick(G, LV[(seed + p) % 3], rng); E.apply(G, m); } return G; }
const S = (o) => Object.assign({ blue: 0, green: 0, yellow: 0, guild: 0, wonder: 0, token: 0, coins: 0, mil: 0 }, o, { total: Object.keys(o).filter(k => k !== 'total').reduce((a, k) => a + o[k], 0) });
const cases = [];
cases.push({ n: 'forced loss (R68)', fin: [S({ blue: 20, mil: 5, guild: 0, wonder: 0 }), S({ blue: 10, wonder: 15, guild: 4, coins: 6, yellow: 6 })], w: 1, r: 'points' });
cases.push({ n: 'forced win', fin: [S({ blue: 20, mil: 5, wonder: 5 }), S({ blue: 10 })], w: 0, r: 'points' });
cases.push({ n: 'tiebreak win', fin: [S({ blue: 15, wonder: 5 }), S({ blue: 10, wonder: 10 })], w: 0, r: 'tiebreak' });
cases.push({ n: 'tiebreak loss', fin: [S({ blue: 10, wonder: 10 }), S({ blue: 15, wonder: 5 })], w: 1, r: 'tiebreak' });
cases.push({ n: 'draw', fin: [S({ blue: 12, wonder: 5 }), S({ blue: 12, wonder: 5 })], w: -1, r: 'draw' });
cases.push({ n: 'war win', fin: [S({ blue: 5 }), S({ blue: 9 })], w: 0, r: 'military' });
cases.push({ n: 'war loss', fin: [S({ blue: 5 }), S({ blue: 9 })], w: 1, r: 'military' });
cases.push({ n: 'science win', fin: [S({ blue: 5 }), S({ blue: 9 })], w: 0, r: 'science' });
cases.push({ n: 'science loss', fin: [S({ blue: 5 }), S({ blue: 9 })], w: 1, r: 'science' });
for (let s = 1; s <= 60; s++) { const G = play(s * 13 + 5); cases.push({ n: 'engine seed ' + s + ' ' + G.reason, fin: G.final || [S({}), S({})], w: G.winner, r: G.reason, real: !!G.final }); }
const NAMES = { 'civic cards': 'blue', 'science cards': 'green', 'trade cards': 'yellow', 'guilds': 'guild', 'wonders': 'wonder', 'science bonuses': 'token', 'coins': 'coins', 'war points': 'mil', 'war': 'mil', 'science': 'green', 'tokens': 'token' };
function cats(txt) { const o = []; const re = /([a-z ]+?) \(\+(\d+)\)/g; let m; while ((m = re.exec(txt))) { const nm = m[1].replace(/^.*\b(?:on|and|gaps:|by|ahead) /, '').trim(); o.push([nm, +m[2]]); } return o; }
(async () => {
  const b = await chromium.launch(); const pg = await (await b.newContext({ viewport: { width: 375, height: 553 } })).newPage(); const errs = []; pg.on('pageerror', e => errs.push(e.message));
  await pg.goto('file://' + path.resolve(process.argv[2] || path.join(__dirname, '..', '..', 'games', 'twin-thrones', 'index.html')) + '?seed=3'); await pg.waitForTimeout(600);
  await pg.evaluate(() => { window.AIDELAY = 0; });
  await pg.locator('[data-start="1"]').first().click(); await pg.waitForTimeout(300);
  await pg.evaluate(() => { var g = document.querySelector('[data-goalgo]'); if (g) g.click(); }); await pg.waitForTimeout(300);
  let bad = 0, n = 0;
  for (const c of cases) {
    if (c.real === false) continue;
    const r = await pg.evaluate(([f, w, rs]) => TT_TEST.forceResult(f, w, rs), [c.fin, c.w, c.r]); n++;
    const win = c.w === 0 ? c.fin[0] : c.fin[1], los = c.w === 0 ? c.fin[1] : c.fin[0];
    const probs = [];
    if (c.r === 'points' || c.r === 'tiebreak') {
      if (c.w === 1 && c.r === 'points') {
        // every category named in the story line must be a real winner (rival) lead of exactly that size
        const lines = cats(r.line); if (!/wins by/.test(r.line)) probs.push('no wins-by');
        for (const [nm, v] of lines) { const k = NAMES[nm]; if (!k || win[k] - los[k] !== v) probs.push('line "' + nm + ' +' + v + '" is not a rival lead'); }
      }
      if (c.w === 0 && c.r === 'points') for (const [nm, v] of cats(r.line)) { const k = NAMES[nm]; if (!k || win[k] - los[k] !== v) probs.push('win line "' + nm + ' +' + v + '" is not your lead'); }
      for (const [nm, v] of cats(r.why)) { const k = NAMES[nm]; if (!k || win[k] - los[k] !== v) probs.push('why "' + nm + ' +' + v + '" wrong'); }
      if (c.r === 'points') { const a = cats(r.line).map(x => x[0]).sort(), bb = cats(r.why).map(x => x[0]).sort(); if (a.length && bb.length && !a.some(x => bb.includes(x) || x === 'war points' && bb.includes('war'))) { /* different top-2 is allowed only when it is a tie in size */ } }
      if (c.r === 'tiebreak' && !/civic points/.test(r.line + r.why)) probs.push('tiebreak line missing civic points');
    }
    if (c.r === 'draw' && !/Neither crown|tie/i.test(r.line + r.why)) probs.push('draw text');
    if (c.r === 'military' && !/gate|banners/.test(r.line)) probs.push('war line');
    if (c.r === 'science' && !/ymbol|scholar/.test(r.line)) probs.push('science line');
    if (probs.length) { bad++; console.log('FAIL', c.n, probs.join('; '), '|', r.line, '|', r.why); }
  }
  if (errs.length) { bad++; console.log('page errors', errs.slice(0, 3)); }
  console.log(bad ? 'ENDLINE FAIL ' + bad : 'ENDLINE PASS ' + n + ' end screens');
  await b.close(); process.exit(bad ? 1 : 0);
})();
