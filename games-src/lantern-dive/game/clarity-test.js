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
const answerDlgs = (w, d) => { let n = 0; while (!d.querySelector('#dlg').hidden && n++ < 20) click(w, d.querySelector('[data-a=dlgok]')); };
test('tips never hide the action buttons on a phone', async () => {
  const { w, d } = await page(1);
  w.eval(`lsSet('ld_tips', '{}'); newGame('vs', { np: 4, kind: 'log', mission: 2 }); coachCheck();`);
  for (let k = 0; k < 300 && !w.eval('UI.tip && iMustAct()'); k++) { w.eval('if (UI.tip && !iMustAct()) tipOk(); schedule()'); await new Promise(r => setTimeout(r, 10)); }
  ok(w.eval('!!UI.tip && iMustAct()'), 'no tip on the player\'s turn in a first normal dive');
  const css = [...d.querySelectorAll('style')].map(x => x.textContent).join('\n');
  ok(!/tipon #acts[^{]*\{display:none/.test(css) && !/tipon[^{]*#acts\{display:none/.test(css), 'a CSS rule hides #acts while a tip is shown');
  ok(d.querySelector('#acts').children.length > 0, 'no buttons under the tip');
});
test('acting answers the tip (a job taken while a tip is open closes it)', async () => {
  const { w } = await page(1);
  w.eval(`lsSet('ld_tips', '{}'); UI.seed = 3; newGame('vs', { np: 4, kind: 'log', mission: 2 });`);
  for (let k = 0; k < 300 && !(w.eval("UI.tip && UI.tip.id === 'pickjob'")); k++) { w.eval("if (UI.tip && UI.tip.id !== 'pickjob') tipOk(); schedule()"); await new Promise(r => setTimeout(r, 10)); }
  ok(w.eval("UI.tip && UI.tip.id") === 'pickjob', 'tip ' + w.eval('UI.tip && UI.tip.id'));
  w.eval(`doMove(LD.moves(G, 0).find(m => m.t === 'take' || m.t === 'pass'))`);
  ok(!w.eval('UI.tip && UI.tip.id === "pickjob"'), 'tip still open after acting');
});
test('training dive: Mara pops up, waits for an answer, and only the card she names can be led', async () => {
  const { w, d } = await page(1);
  click(w, d.querySelector('[data-a=guided]'));
  ok(!d.querySelector('#dlg').hidden && /Mara/.test(d.querySelector('#dlg').textContent), 'no Mara dialog at the start');
  w.eval('schedule()'); ok(w.eval('UI.dlg') && w.eval("G.phase") === 'assign', 'play moved on under the dialog');
  for (let k = 0; k < 400 && !(w.eval("G.phase === 'play' && G.trick.turn === 0 && G.tricks.length === 0")); k++) { answerDlgs(w, d); w.eval("if (!UI.dlg && iMustAct()) { const m = LD.moves(G, 0).find(x => x.t === 'take' || x.t === 'nosig' || (x.t === 'dist' && !x.on)); if (m) doMove(m); } schedule()"); await new Promise(r => setTimeout(r, 5)); }
  answerDlgs(w, d);
  const c9 = w.eval('D.card(0, 9)'), legal = w.eval('[...legalCards(0)]');
  ok(legal.length === 1 && legal[0] === c9, 'legal cards ' + JSON.stringify(legal));
  const other = w.eval('G.players[0].hand.find(c => c !== ' + c9 + ')'); w.eval('tapHand(' + other + ')'); ok(w.eval('UI.sel') !== other, 'another card could be lifted');
});
test('Descent: the map starts at the Sunlit Reef with 3 oxygen tanks; a lost dive costs one tank, 3 losses restart the zone', async () => {
  const { w, d } = await page(1);
  w.eval(`lsSet('ld_desc', ''); UI.sv = 'descent'; renderStart();`);
  ok(/Sunlit Reef/.test(d.querySelector('#start').textContent), 'no reef on the map');
  ok(d.querySelectorAll('#start .tank.full').length === 3, 'tanks ' + d.querySelectorAll('#start .tank.full').length);
  w.eval(`Desc.save({ v: 1, z: 0, s: 2, o2: 3, stars: {}, best: 0, met: { intro: 1 } });`);
  for (const left of [2, 1]) { w.eval(`descGo(); G.phase = 'over'; G.result = { ok: false, why: 'x', tasks: G.tasks.map(() => 0), det: [] }; UI.overShown = false; showResult();`); ok(w.eval('Desc.load().o2') === left && w.eval('Desc.load().s') === 2, 'after a loss: ' + w.eval("lsGet('ld_desc')")); }
  w.eval(`descGo(); G.phase = 'over'; G.result = { ok: false, why: 'x', tasks: G.tasks.map(() => 0), det: [] }; UI.overShown = false; showResult();`);
  ok(w.eval('Desc.load().o2') === 3 && w.eval('Desc.load().s') === 0, 'out of air did not restart the zone: ' + w.eval("lsGet('ld_desc')"));
  ok(/Out of air/.test(d.querySelector('#rs').textContent), 'no out-of-air message');
});
test('Descent boss: intro dialog, health bar = jobs, a curse dialog before each cursed trick, beating it opens the next zone', async () => {
  const { w, d } = await page(1);
  w.eval(`Desc.save({ v: 1, z: 0, s: 3, o2: 3, stars: {}, best: 0, met: { intro: 1 } }); descGo();`);
  ok(w.eval('!!G.boss') && /Snapjaw/.test(d.querySelector('#dlg').textContent), 'no boss intro');
  let curses = 0, seenBar = false;
  for (let k = 0; k < 3000 && w.eval("G.phase") !== 'over'; k++) {
    if (!d.querySelector('#dlg').hidden) { if (/casts/.test(d.querySelector('#dlg').textContent)) { curses++; ok(w.eval('G.trick.plays.length') === 0 && w.eval('!!G.trick.cu'), 'curse dialog not at the start of a cursed trick'); } click(w, d.querySelector('[data-a=dlgok]')); continue; }
    if (d.querySelector('#bossbar')) { seenBar = true; ok(d.querySelectorAll('#bossbar .hp i').length === w.eval('G.tasks.length'), 'health bar size'); }
    w.eval("if (!UI.busy && iMustAct()) { const m = LD.AI.choose(G, 0, 'normal'); if (m) doMove(m); }"); await new Promise(r => setTimeout(r, 2));
  }
  ok(seenBar, 'no boss bar'); const cursed = w.eval('G.tricks.filter(k => k.cu).length'); ok(curses === cursed || curses === cursed + (w.eval('G.trick && G.trick.cu && G.trick.plays.length === 0') ? 1 : 0), 'curse dialogs ' + curses + ' cursed tricks ' + cursed);
  w.eval(`G.result.ok = true; G.descDone = 0; UI.overShown = false; showResult();`);
  ok(w.eval('Desc.load().z') === 1 && w.eval('Desc.load().o2') === 3, 'boss win did not open zone 2: ' + w.eval("lsGet('ld_desc')"));
});

(async () => {
  for (const [name, fn] of T) { try { await fn(); pass++; console.log('ok  ', name); } catch (e) { fail++; console.log('FAIL', name, '-', e.message); } }
  console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
})();
