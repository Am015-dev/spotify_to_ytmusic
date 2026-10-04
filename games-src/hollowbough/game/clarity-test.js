// Clarity tests (jsdom): the things blind first-time players tripped over, each pinned by a test.   node clarity-test.js
const { JSDOM, VirtualConsole } = require('../../node_modules/jsdom'); const fs = require('fs');
const html = fs.readFileSync(__dirname + '/hollowbough.html', 'utf8');
let pass = 0, fail = 0;
function page(phone) {
  return new Promise(res => {
    const errs = []; const vc = new VirtualConsole(); vc.on('jsdomError', e => errs.push(String(e.message).slice(0, 200)));
    const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://gns.test/' + (phone ? '?phone=1' : ''), virtualConsole: vc,
      beforeParse(win) { if (phone) { Object.defineProperty(win, 'innerWidth', { value: 390, configurable: true }); Object.defineProperty(win, 'innerHeight', { value: 763, configurable: true }); } } });
    dom.window.addEventListener('load', () => { dom.window.eval('AIDELAY=0;ANIM=0;UI.noRec=true'); res({ w: dom.window, d: dom.window.document, errs }); });
  });
}
async function test(name, fn) { try { await fn(); pass++; } catch (e) { fail++; console.log('FAIL: ' + name + '\n   ' + e.message); } }
const ok = (c, m) => { if (!c) throw new Error(m || 'assertion failed'); };
const click = (w, el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
// play the human seat with the helper AI until `stop()` is true (cards/questions answered through the page state)
function drive(w, stop, max) {
  for (let n = 0; n < (max || 4000); n++) {
    if (stop()) return true;
    const st = w.eval(`(()=>{ if (G.phase==='over') return 'over'; if (UI.cards.length) { nextCard(); return 'card'; } const a=HB.actor(G); if (G.players[a].ai) { aiStep(); return 'ai'; } act(HB.AI.choose(G,a,'normal')); return 'me'; })()`);
    if (st === 'over' && stop()) return true; if (st === 'over') return false;
  }
  return stop();
}
(async () => {
  await test('Autumn with no free workers: the prompt never offers "Prepare for the end"', async () => {
    const { w } = await page(1);
    w.eval("newGame('vs',{np:2,level:'normal'})");
    const got = drive(w, () => w.eval("(()=>{const p=G.players[0];return G.phase!=='over'&&HB.actor(G)===0&&!G.q&&!UI.cards.length&&p.season===3&&availW(p)===0})()"));
    ok(got, 'reached Autumn with no free workers');
    w.eval('renderDock()');
    const t = w.document.querySelector('#prompt').textContent;
    ok(!/Prepare for the end/.test(t), 'prompt says: ' + t);
  });
  await test('message cards keep their buttons outside the scrolling text (Total never hidden under Continue)', async () => {
    const { w, d } = await page(1);
    w.eval("newGame('vs',{np:2,level:'normal'})");
    w.eval("pushCard({kind:'x',title:'t',body:h('p','x')})");
    const b = d.querySelector('#pc .cbtns'); ok(b, 'buttons exist');
    ok(!b.closest('.ph-body'), 'buttons sit inside the scrolling body');
  });
  await test('Pass is never the main (green) button while you still have workers', async () => {
    const { w, d } = await page(1);
    w.eval("newGame('vs',{np:2,level:'normal'})");
    drive(w, () => w.eval('HB.actor(G)===0&&!UI.cards.length&&!G.q'));
    w.eval('renderDock()');
    const p = d.querySelector('#acts [data-a=pass]');
    ok(!p || p.classList.contains('quiet'), 'Pass is styled as a main action: ' + (p && p.className));
  });
  await test('every point change is explained on screen with its cause (guided game, to the end)', async () => {
    const { w } = await page(1);
    w.eval("UI.coach={level:'off',seen:{}};newGame('vs',{np:2,level:'normal'})");
    drive(w, () => w.eval("G.phase==='over'"));
    const miss = w.eval('(UI.scoreAudit||{miss:["no audit"]}).miss'), n = w.eval('(UI.scoreAudit||{n:0}).n');
    ok(n > 10, 'only ' + n + ' point changes were announced');
    ok(miss.length === 0, 'unexplained point changes: ' + miss.slice(0, 3).join(' | '));
  });
  await test('qHint texts use only our own card names', async () => {
    const { w } = await page(0);
    const bad = ['Queen', 'The Inn', 'University', 'Cemetery', 'Dungeon', 'Monastery', 'Judge', 'Crane'];
    const all = ['queen', 'inn', 'university', 'cemetery', 'copy', 'trigger'].map(k => w.eval('qHint(' + JSON.stringify(k) + ')')).join(' ');
    const hit = bad.filter(b => all.indexOf(b) >= 0); ok(!hit.length, 'original names: ' + hit.join(', '));
  });
  console.log('\nclarity-test: ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
})();
