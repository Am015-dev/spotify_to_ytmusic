// Clarity tests (jsdom): bugs and cause -> effect promises found by the blind newcomer playtests.   node clarity-test.js
// Each test was written to fail on the build before the fix (see ../CLARITY-REPORT.md).
let JSDOM, VirtualConsole;
try { ({ JSDOM, VirtualConsole } = require('../../node_modules/jsdom')); } catch (e) { ({ JSDOM, VirtualConsole } = require('jsdom')); }
const fs = require('fs'), path = require('path');
const html = fs.readFileSync(path.join(__dirname, 'lantern-dive.html'), 'utf8');
let pass = 0, fail = 0;
const ok = (x, m) => { if (!x) throw new Error(m || 'expected true'); };
function page(phone) {
  return new Promise(res => {
    const vc = new VirtualConsole(); const errs = []; vc.on('jsdomError', e => errs.push(String(e.message).slice(0, 200)));
    const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: 'https://gns.test/' + (phone ? '?phone=1' : ''), virtualConsole: vc,
      beforeParse(win) { if (phone) { Object.defineProperty(win, 'innerWidth', { value: 390, configurable: true }); Object.defineProperty(win, 'innerHeight', { value: 763, configurable: true }); } } });
    dom.window.addEventListener('load', () => { dom.window.eval('ANIM=0;AIDELAY=0;UI.seed=7'); res({ w: dom.window, d: dom.window.document, errs }); });
  });
}
const T = [];
const test = (name, fn) => T.push([name, fn]);
const click = (w, el) => el.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));

test('result card: a job that is done is never labelled "Not finished"', async () => {
  const { w, d } = await page(1);
  w.eval(`newGame('vs',{np:3,kind:'log',mission:3}); UI.cards=[]; UI.tip=null;
    G.tasks=[{id:0,owner:1,pn:-1},{id:8,owner:2,pn:-1}]; G.phase='over';
    G.result={ok:false,why:'A job cannot be done any more.',tasks:[1,-1],det:['','Trick 13: Nerea won it with Lantern 4.']}; UI.overShown=false; showResult();`);
  const rows = [...d.querySelectorAll('#rs .rjob')].map(r => r.textContent);
  ok(rows.length === 2, 'rows ' + rows.length);
  ok(!/Not finished/.test(rows[0]), 'done job says: ' + rows[0]);
});

// ---------- Hint and the computer divers (node, no page) ----------
const TL = require('./tlib.js'), LD = TL.LD;
const vetoState = sd => { const G = TL.setup(4, ['K6 C7 T3 T7', '', '', 'L4'], [[18, 2]], { lead: 3, void: { 0: [4] }, seed: sd }); TL.play(G, [[3, TL.h('L4')[0]]]); return G; };
test('hint / computer: never throw away a card a teammate must win when a safe card exists (audit P1-1)', async () => {
  const K6 = TL.h('K6')[0];
  for (let sd = 1; sd <= 12; sd++) for (const lv of ['easy', 'normal', 'hard']) {
    const G = vetoState(sd); ok(G.trick.turn === 0, 'turn ' + G.trick.turn);
    const m = LD.AI.choose(G, 0, lv); ok(m && m.t === 'play', 'no play'); ok(m.c !== K6, lv + ' seed ' + sd + ' threw away the Kelp 6 that Bram must win');
  }
});
test('hint: always gives a plain reason, also when leading', async () => {
  for (let sd = 1; sd <= 8; sd++) {
    const G = LD.newGame({ players: 4, seed: sd, mission: { kind: 'log', id: 5 } }); G.players.forEach((p, i) => { p.ai = i ? 'normal' : null; });
    let g = 0; while (G.phase !== 'play' && g++ < 200) { const s = LD.pending(G)[0]; const m = G.players[s].ai ? LD.AI.choose(G, s) : LD.moves(G, s).find(x => x.t === 'take') || LD.moves(G, s).find(x => x.t !== 'ping') || LD.moves(G, s)[0]; LD.apply(G, s, m); }
    g = 0; while (G.phase === 'play' && G.trick.turn !== 0 && g++ < 50) LD.AI.step(G);
    if (G.phase !== 'play') continue;
    const m = LD.AI.choose(G, 0, 'normal'); if (m.t !== 'play') continue;
    const why = LD.AI.why(G, 0, m.c); ok(why && why.length > 8, 'seed ' + sd + ': empty reason for ' + LD.DATA.cardName(m.c));
  }
});

test('cause -> effect: after a trick the dock says who won it and with which card; jobs taken are named', async () => {
  const { w, d } = await page(1);
  w.eval(`UI.prefs.guide='off'; newGame('ai',{np:4,kind:'log',mission:5});`);
  for (let k = 0; k < 400 && w.eval('G.tricks.length') < 1; k++) await new Promise(r => setTimeout(r, 10));
  await new Promise(r => setTimeout(r, 50));
  const t = d.querySelector('#news').textContent;
  ok(/Trick 1: .+ won with .+\./.test(t), 'news: ' + t);
  const k = w.eval('G.tricks[0]'); ok(t.includes(w.eval('pname(' + k.w + ')') + ' won with ' + w.eval('cname(' + k.wc + ')')), 'wrong winner in: ' + t);
});
test('tips never hide the action buttons on a phone', async () => {
  const { w, d } = await page(1);
  w.eval(`newGame('guided');`);
  ok(w.eval('!!UI.tip'), 'no tip at the start of the guided dive');
  const css = [...d.querySelectorAll('style')].map(x => x.textContent).join('\n');
  ok(!/tipon #acts[^{]*\{display:none/.test(css) && !/tipon[^{]*#acts\{display:none/.test(css), 'a CSS rule hides #acts while a tip is shown');
  ok(d.querySelector('#acts').children.length > 0, 'no buttons under the tip');
});
test('acting answers the tip (a job taken while a tip is open closes it)', async () => {
  const { w } = await page(1);
  w.eval(`newGame('guided'); while (UI.tip && UI.tip.id !== 'pickjob') tipOk();`);
  ok(w.eval("UI.tip && UI.tip.id") === 'pickjob', 'tip ' + w.eval('UI.tip && UI.tip.id'));
  w.eval(`doMove(LD.moves(G, 0).find(m => m.t === 'take'))`);
  ok(!w.eval('UI.tip && UI.tip.id === "pickjob"'), 'tip still open after acting');
});
test('guided dive: Hint teaches a colour card first instead of ending the dive at once', async () => {
  const { w } = await page(1);
  w.eval(`newGame('guided'); UI.tip=null; doMove(LD.moves(G, 0).find(m => m.t === 'take'));`);
  for (let k = 0; k < 300 && !(w.eval("G.phase==='play' && G.trick.turn===0")); k++) { w.eval('UI.tip=null; if (G.phase!=="play") { const m = LD.moves(G,0).find(x=>x.t==="nosig"||x.t==="dist"&&!x.on); if (m) doMove(m); } schedule()'); await new Promise(r => setTimeout(r, 10)); }
  w.eval('UI.tip=null; doHint()');
  ok(w.eval('UI.hint && suitOf(UI.hint.c) < 4'), 'hint suggested ' + w.eval('UI.hint && cname(UI.hint.c)'));
});

(async () => {
  for (const [name, fn] of T) { try { await fn(); pass++; console.log('ok  ', name); } catch (e) { fail++; console.log('FAIL', name, '-', e.message); } }
  console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
})();
