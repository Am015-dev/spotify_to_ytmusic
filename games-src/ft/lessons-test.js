// Scenario lessons (src/lessons.js): per lesson the scripted solution must WIN and the wrong line must FAIL with a message,
// on the real engine (headless). Then, in the browser at 402x874 and 1366x768: every lesson starts, shows ONE card, the card
// never covers the highlighted target, and the scripted solution wins through the GXST judge. Run: node lessons-test.js [--logic]
const fs = require('fs'), vm = require('vm'), path = require('path');
const t0 = Date.now(); let fails = 0; const out = [];
const C = { console, Math, Date, JSON, setTimeout, clearTimeout, setInterval: () => 0, performance: { now: Date.now },
  window: { addEventListener() {} }, document: { addEventListener() {}, querySelector: () => null, body: { classList: { add() {}, remove() {} } } } };
vm.createContext(C);
for (const f of ['data', 'djinns', 'engine', 'ai', 'comm', 'lessons']) vm.runInContext(fs.readFileSync(path.join(__dirname, 'src', f + '.js'), 'utf8'), C, { filename: f });
const run = s => vm.runInContext(s, C); run('UI.sim=true;var tileEl=()=>null;');
C.__n = run('LESSONS.length');
function play(i, line) {
  run(`(()=>{const sp=LESSONS[${i}];commNew(-1,Object.assign({me:{camels:8,coins:10},rivalSet:{camels:8,coins:10}},sp));G.comm=null;LS.c0=G.pl[0].coins;
    if(sp.id==='sell')G.pl[0].res=['fish','pottery']})()`);
  for (const m of line) {
    const mv = m === 'dj' ? run(`validMoves(0).find(x=>x.act==='tile'&&x.dj)`) : m;
    if (!mv) return 'no move for ' + JSON.stringify(m);
    C.__m = mv; const r = run('performMove(__m,0)');
    if (!r || r.success === false) return 'illegal ' + JSON.stringify(mv) + ' legal=' + JSON.stringify(run('validMoves(0)'));
  }
  return { win: run(`!!LESSONS[${i}].success()`), fail: run(`LESSONS[${i}].fail()`) };
}
for (let i = 0; i < C.__n; i++) {
  const id = run(`LESSONS[${i}].id`), s = play(i, run(`LESSONS[${i}].solve`)), w = play(i, run(`LESSONS[${i}].wrong`));
  const ok = typeof s === 'object' && s.win && !s.fail && typeof w === 'object' && !w.win && typeof w.fail === 'string';
  if (!ok) fails++; out.push(`${ok ? 'PASS' : 'FAIL'} ${id}: solve=${JSON.stringify(s)} wrong=${JSON.stringify(w)}`);
  const g = run(`LESSONS[${i}].goal`); if (!/^Your goal: /.test(g) || g.split(/[.!?](\s|$)/).filter(x => x && x.trim()).length > 2) { fails++; out.push(`FAIL ${id}: goal must be one "Your goal: ..." sentence`); }
}
console.log(out.join('\n'));
if (process.argv.includes('--logic')) { console.log(`${fails ? 'FAIL' : 'PASS'} logic, ${((Date.now() - t0) / 1000).toFixed(1)} s`); process.exit(fails ? 1 : 0); }
(async () => {
  const { chromium } = require('playwright'); const b = await chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
  const url = 'file://' + path.join(__dirname, 'sands.html');
  for (const [w, h] of [[402, 874], [1366, 768]]) {
    const pg = await b.newPage({ viewport: { width: w, height: h } });
    await pg.addInitScript(() => { try { localStorage.setItem('soq_lessons', '{}'); } catch (e) { } });
    await pg.goto(url); await pg.waitForFunction(() => window.GXST && typeof lsOpen === 'function', null, { timeout: 15000 });
    for (let i = 0; i < C.__n; i++) {
      const id = run(`LESSONS[${i}].id`), line = run(`LESSONS[${i}].solve`);
      const r = await pg.evaluate(async ([i, line]) => {
        const wait = ms => new Promise(r => setTimeout(r, ms)); lsOpen(); GXST.start(i); await wait(450);
        const hit = (a, b) => a && b && a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
        const card = document.querySelector('.gxst-card'), cr = card && card.getBoundingClientRect();
        const tgt = document.querySelector('.ls-target'), tr = tgt && tgt.getBoundingClientRect();
        const bubbles = [...document.querySelectorAll('.gxh-bub,.commb,.tourw,.coachb,.gd-bub,[role="dialog"]')].filter(e => { const q = e.getBoundingClientRect(); return q.width > 2 && q.height > 2 && getComputedStyle(e).visibility !== 'hidden'; }).length;
        const off = cr && (cr.left < 0 || cr.top < 0 || cr.right > innerWidth + 1 || cr.bottom > innerHeight + 1);
        const goal = (document.querySelector('.gxst-goal') || {}).textContent || '';
        for (const m of line) {
          const mv = m === 'dj' ? validMoves(0).find(x => x.act === 'tile' && x.dj) : m;
          go(mv); await wait(120);
        }
        let s = null; for (let k = 0; k < 20 && !(s && s.phase === 'win'); k++) { await wait(150); s = GXST.state(); }
        return { phase: s && s.phase, goal, target: !!tr, overlap: hit(cr, tr), bubbles, off };
      }, [i, line]);
      const ok = r.phase === 'win' && r.target && !r.overlap && r.bubbles === 1 && !r.off && /^Your goal: /.test(r.goal);
      if (!ok) fails++; out.push(`${ok ? 'PASS' : 'FAIL'} ${w}x${h} ${id}: ${JSON.stringify(r)}`); console.log(out[out.length - 1]);
    }
    await pg.close();
  }
  await b.close();
  console.log(`${fails ? 'FAIL' : 'PASS'} lessons, ${((Date.now() - t0) / 1000).toFixed(1)} s`); process.exit(fails ? 1 : 0);
})();
