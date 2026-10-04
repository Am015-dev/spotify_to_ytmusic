// jsdom unit tests for the GX kit (shell.js + gx-kit.js) and the master volume in gameaudio.js.
//   node games-src/shell/test/kit-test.js        prints one line per test, then "kit-test: N passed, M failed"
const path = require('path'), fs = require('fs');
const SP = path.resolve(__dirname, '..', '..');
const { JSDOM } = require(path.join(SP, 'node_modules', 'jsdom'));
const rd = p => fs.readFileSync(path.join(SP, p), 'utf8');
const SHELL = rd('shell/shell.js'), KIT = rd('shell/gx-kit.js'), GA = rd('audio/gameaudio.js');
let pass = 0, fail = 0;
function page(o) {
  o = o || {};
  const html = `<!doctype html><html><head><style>${rd('shell/shell.css')}${rd('shell/gx-kit.css')}</style></head><body>
<div class="gx-app"><header class="gx-bar"><b>Game</b><span class="gx-sp"></span><button class="gx-ibtn" data-gx="logd">Log</button></header>
<div class="gx-main"><main class="gx-board"></main><aside class="gx-dock"><div class="gx-dock-head"><span class="gx-dt">x</span></div><div class="gx-dock-body" id="db"></div></aside></div></div>
<script>${SHELL}</script>${o.ga ? `<script>${GA}</script>` : ''}<script>${KIT}</script></body></html>`;
  const dom = new JSDOM(html, { runScripts: 'dangerously', pretendToBeVisual: true, url: o.url || 'https://gns.test/game/', beforeParse(w) {
    if (o.ls) for (const k in o.ls) w.localStorage.setItem(k, o.ls[k]);
    if (o.vibrate) w.navigator.vibrate = p => { w.__buzz = (w.__buzz || []).concat([p]); return true; };
    w.HTMLElement.prototype.scrollIntoView = function () { };
  } });
  const w = dom.window; w.GX.init({ key: 't' }); return w;
}
const click = (w, e) => e.dispatchEvent(new w.MouseEvent('click', { bubbles: true }));
function test(name, fn) { try { fn(); pass++; console.log('ok   ' + name); } catch (e) { fail++; console.log('FAIL ' + name + '\n     ' + (e && e.stack || e).toString().split('\n').slice(0, 3).join('\n     ')); } }
const eq = (a, b, m) => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error((m || 'value') + ': expected ' + JSON.stringify(b) + ', got ' + JSON.stringify(a)); };
const ok = (c, m) => { if (!c) throw new Error(m || 'assertion failed'); };

// ---------------- the kit must not replace any existing shell API
test('shell API untouched: every method of shell.js is the same function after the kit loads', () => {
  const { JSDOM: J } = require(path.join(SP, 'node_modules', 'jsdom'));
  const plain = new J(`<body><script>${SHELL}</script></body>`, { runScripts: 'dangerously' }).window.eval('Object.keys(GX)');
  const w = page(); w.GX.settings({}); const src = w.eval('Object.keys(GX).filter(k => typeof GX[k] === "function").map(k => [k, GX[k].toString()])');
  const base = new J(`<body><script>${SHELL}</script></body>`, { runScripts: 'dangerously' }).window.eval('Object.keys(GX).filter(k => typeof GX[k] === "function").map(k => [k, GX[k].toString()])');
  const now = Object.fromEntries(src);
  for (const [k, f] of base) { if (k === 'show' && now[k] !== f) { ok(/base\.apply/.test(now[k]), 'show is wrapped, not replaced'); continue; } eq(now[k], f, 'GX.' + k); }
  ok(plain.length > 5);
});
test('shell behaviour kept: data-gx buttons still toggle drawers with the kit loaded', () => {
  const w = page(), d = w.document; w.GX.drawer('logd', 'Log', d.createElement('div'));
  click(w, d.querySelector('[data-gx=logd]')); eq(w.GX.open, 'logd'); click(w, d.querySelector('[data-gx=logd]')); eq(w.GX.open, null);
});

// ---------------- prefs
test('prefs: defaults, stored once as gns-prefs, html classes and CSS variable', () => {
  const w = page();
  eq(w.GX.pref('master'), 1); eq(w.GX.pref('text'), 1); eq(w.GX.pref('cb'), false);
  w.GX.setPref('cb', true); w.GX.setPref('lefty', true); w.GX.setPref('text', 1.3); w.GX.setPref('reduce', true);
  const h = w.document.documentElement;
  ok(h.classList.contains('cb') && h.classList.contains('lefty') && h.classList.contains('gx-reduce'), 'classes');
  eq(h.style.getPropertyValue('--gx-text'), '1.3');
  const s = JSON.parse(w.localStorage.getItem('gns-prefs')); eq(s.cb, true); eq(s.text, 1.3);
  eq(Object.keys(w.localStorage).filter(k => /pref/.test(k)), ['gns-prefs'], 'one key only');
});
test('prefs: read back on the next page load (another game shares them)', () => {
  const w = page({ ls: { 'gns-prefs': JSON.stringify({ anim: 'fast', ai: 'slow', cb: true }) } });
  eq(w.GX.pref('anim'), 'fast'); eq(w.GX.animMs(400), 200); eq(w.GX.aiDelay(650), 1300);
  ok(w.document.documentElement.classList.contains('cb'));
});
test('prefs: broken JSON and a throwing localStorage do not break the page', () => {
  const w = page({ ls: { 'gns-prefs': '{nope' } });
  eq(w.GX.pref('master'), 1);
  Object.defineProperty(w, 'localStorage', { get() { throw new Error('denied'); } });
  w.GX.setPref('text', 1.15); eq(w.GX.pref('text'), 1.15);
});
test('prefs: onPref listeners, animMs 0 when off or reduced', () => {
  const w = page(); const got = []; w.GX.onPref((k, v) => got.push([k, v]));
  w.GX.setPref('anim', 'off'); eq(got, [['anim', 'off']]); eq(w.GX.animMs(300), 0);
  w.GX.setPref({ anim: 'slow', reduce: true }); eq(w.GX.animMs(300), 0);
  w.GX.setPref('reduce', false); eq(w.GX.animMs(300), 480);
});
test('haptics: vibrate when on and supported, silent when off or missing', () => {
  const w = page({ vibrate: 1 }); w.GX.buzz(30); eq(w.__buzz, [30]);
  w.GX.setPref('haptics', false); w.GX.buzz(30); eq(w.__buzz, [30]);
  const w2 = page(); eq(w2.GX.buzz(10), false);
});
test('colour-blind marks: one symbol per seat, wraps around', () => {
  const w = page(); eq(w.GX.mark(0), '●'); eq(w.GX.mark(1), '▲'); eq(w.GX.mark(8), '●'); eq(w.GX.mark(-1), w.GX.SYMBOLS[7]);
});
test('volume: master/music/effects reach gameaudio (GA.setVolume master is new and persisted)', () => {
  const w = page({ ga: 1 }); w.GA.init({ key: 'zz' });
  w.GX.setPref('master', 0.4); w.GX.setPref('music', 0.2); w.GX.setPref('sfx', 0.6);
  const s = w.GA.state(); eq(s.masterVol, 0.4); eq(s.musVol, 0.2); eq(s.sfxVol, 0.6);
  eq(w.localStorage.getItem('zz_ga_mastervol'), '0.4');
  // the old calls behave as before
  w.GA.setVolume('sfx', 0.3); eq(w.GA.state().sfxVol, 0.3); w.GA.setVolume('other', 0.1); eq(w.GA.state().sfxVol, 0.1);
});

// ---------------- settings
test('settings: drawer with the fixed section order, game rows, prefs rows change prefs', () => {
  const w = page(); const d = w.document;
  w.GX.settings({ game: S => S.appendChild(w.GX.row('Game', d.createTextNode('New game'))), help: S => S.appendChild(w.GX.row('Rules', d.createTextNode('x'))), about: { name: 'Test game', version: '1.0' } });
  w.GX.show('gx-setd');
  const secs = [...d.querySelectorAll('#gx-setd .gx-sec h3')].map(x => x.textContent);
  eq(secs, ['Game', 'Sound', 'Speed', 'Help', 'Accessibility', 'About'], 'sections (Graphics skipped when empty)');
  const big = [...d.querySelectorAll('#gx-setd-accessibility .gx-sb')].find(b => b.textContent === 'Large'); click(w, big);
  eq(w.GX.pref('text'), 1.15);
  const sl = d.querySelector('#gx-setd-sound input[type=range]'); sl.value = '30'; sl.dispatchEvent(new w.Event('input')); eq(w.GX.pref('master'), 0.3);
  const tg = d.querySelector('#gx-setd-accessibility .gx-tg'); click(w, tg); eq(w.GX.pref('cb'), true); eq(tg.getAttribute('aria-checked'), 'true');
  ok(d.querySelector('#gx-setd-about a[href="../credits.html"]') && d.querySelector('#gx-setd-about a[href="../privacy.html"]'), 'legal links');
  ok(!d.querySelector('#gx-setd-developer'), 'no developer tools without ?dev=1');
  ok(![...d.querySelectorAll('#gx-setd button')].some(b => /Test speed|Show speed|Copy report/.test(b.textContent)), 'dev buttons hidden');
});
test('settings: developer section only with ?dev=1', () => {
  const w = page({ url: 'https://gns.test/game/?dev=1' }); w.GX.settings({}); w.GX.show('gx-setd');
  const t = w.document.querySelector('#gx-setd-developer').textContent; ok(/Show speed/.test(t) && /Test speed/.test(t) && /Copy report/.test(t));
});
test('settings: the game\'s own onShow hook still runs', () => {
  const w = page(); let seen = []; w.GX.onShow = id => seen.push(id); w.GX.settings({});
  w.GX.drawer('logd', 'Log', w.document.createElement('div')); click(w, w.document.querySelector('[data-gx=logd]'));
  w.GX.show('gx-setd'); eq(seen, ['logd', 'gx-setd']);
});

// ---------------- reference
const SECTIONS = [
  { id: 'cards', title: 'Cards', items: [
    { id: 'c1', name: 'Twig Barge', count: 3, text: 'Gain 2 twigs.', tags: ['Green', 'Building'], picture: '<svg viewBox="0 0 10 10"></svg>' },
    { id: 'c2', name: 'Hedge Inn', count: 2, text: 'A place to stay.', tags: ['Red', 'Building'] },
    { id: 'c3', name: 'Ballad Finch', count: 2, text: 'Sing away cards for points.', tags: ['Tan', 'Critter'] }] },
  { id: 'events', title: 'Events', items: [{ id: 'e1', name: 'Harvest Gathering', text: 'Needs 4 green cards.', tags: ['Basic'] }] }];
test('reference: top-bar button, sections, counts, search', () => {
  const w = page(), d = w.document;
  w.GX.reference(SECTIONS, { label: 'Cards', picture: (it, big) => it.id === 'c2' ? '<i class="pp"></i>' : null });
  const b = d.querySelector('.gx-bar [data-gx="gx-refd"]'); ok(b, 'bar button'); eq(b.textContent, 'Cards');
  ok(b.previousElementSibling.classList.contains('gx-sp'), 'placed after the spacer');
  click(w, b); ok(d.getElementById('gx-refd').classList.contains('on'), 'opens');
  eq(d.querySelectorAll('.gx-ref-it').length, 4); ok(/7 pieces in the box/.test(d.querySelector('.gx-ref-n').textContent), d.querySelector('.gx-ref-n').textContent);
  ok(d.querySelector('.gx-ref-it[data-ref=c2] .pp') && d.querySelector('.gx-ref-it[data-ref=c1] svg'), 'pictures from callback and item');
  const q = d.querySelector('.gx-ref-q'); q.value = 'twigs'; q.dispatchEvent(new w.Event('input'));
  eq([...d.querySelectorAll('.gx-ref-it b')].map(x => x.textContent), ['Twig Barge']);
  q.value = 'hedge stay'; q.dispatchEvent(new w.Event('input')); eq(d.querySelectorAll('.gx-ref-it').length, 1);
  q.value = 'zzz'; q.dispatchEvent(new w.Event('input')); eq(d.querySelectorAll('.gx-ref-it').length, 0); ok(/Nothing matches/.test(d.querySelector('.gx-ref-list').textContent));
});
test('reference: section chips and tag chips filter (AND)', () => {
  const w = page(), d = w.document; w.GX.reference(SECTIONS); w.GX.show('gx-refd');
  const chip = t => [...d.querySelectorAll('.gx-chip')].find(x => x.textContent.startsWith(t));
  click(w, chip('Events')); eq(d.querySelectorAll('.gx-ref-it').length, 1);
  click(w, chip('Cards')); eq(d.querySelectorAll('.gx-ref-it').length, 3);
  click(w, chip('Building')); eq(d.querySelectorAll('.gx-ref-it').length, 2);
  click(w, chip('Red')); eq([...d.querySelectorAll('.gx-ref-it b')].map(x => x.textContent), ['Hedge Inn']);
  click(w, chip('Red')); eq(d.querySelectorAll('.gx-ref-it').length, 2, 'chip toggles off');
});
test('reference: big view with next/previous, back to the list', () => {
  const w = page(), d = w.document; w.GX.reference(SECTIONS); w.GX.show('gx-refd');
  click(w, d.querySelector('.gx-ref-it[data-ref=c2]'));
  const V = d.querySelector('.gx-ref-big'); ok(!V.hidden && d.querySelector('.gx-ref-list').hidden, 'big view shown');
  eq(V.querySelector('h3').textContent, 'Hedge Inn'); ok(/2 in the box/.test(V.textContent));
  click(w, [...V.querySelectorAll('button')].find(b => b.getAttribute('aria-label') === 'Next')); eq(V.querySelector('h3').textContent, 'Ballad Finch');
  V.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true })); eq(d.querySelector('.gx-ref-big h3').textContent, 'Hedge Inn');
  click(w, [...d.querySelectorAll('.gx-ref-big button')].find(b => /All/.test(b.textContent))); ok(d.querySelector('.gx-ref-big').hidden && !d.querySelector('.gx-ref-list').hidden);
});
test('reference: refOpen jumps straight to an item; inGame chip', () => {
  const w = page(), d = w.document; w.GX.reference(SECTIONS, { inGame: it => it.id !== 'c3' });
  ok(w.GX.refOpen('e1')); ok(d.getElementById('gx-refd').classList.contains('on')); eq(d.querySelector('.gx-ref-big h3').textContent, 'Harvest Gathering');
  w.GX.close(); w.GX.show('gx-refd'); ok(d.querySelector('.gx-ref-big').hidden, 'reopening shows the list');
  click(w, [...d.querySelectorAll('.gx-chip')].find(x => x.textContent === 'In this game')); eq(d.querySelectorAll('.gx-ref-it').length, 3);
  eq(w.GX.refOpen('nope'), false);
});
test('reference: Esc closes the drawer (shell behaviour kept)', () => {
  const w = page(), d = w.document; w.GX.reference(SECTIONS); w.GX.show('gx-refd');
  d.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); ok(!d.getElementById('gx-refd').classList.contains('on'));
});

// ---------------- undo
function undoGame(w, o) {
  const S = { st: { turn: 'me', n: 0, hand: [1, 2], deck: [5, 6] } };
  w.GX.undo.config(Object.assign({ get: () => S.st, set: s => { S.st = s; }, owner: s => s.turn }, o || {}));
  return S;
}
test('undo: snapshot before a move, restore it, several steps', () => {
  const w = page(), S = undoGame(w);
  ok(!w.GX.undo.can());
  w.GX.undo.snap('a'); S.st.n = 1; w.GX.undo.check();
  w.GX.undo.snap('b'); S.st.n = 2; w.GX.undo.check();
  eq(w.GX.undo.size(), 2); eq(w.GX.undo.label(), 'b');
  ok(w.GX.undo.undo()); eq(S.st.n, 1); ok(w.GX.undo.undo()); eq(S.st.n, 0); ok(!w.GX.undo.undo());
});
test('undo: sealed when the turn passes to someone else', () => {
  const w = page(), S = undoGame(w);
  w.GX.undo.snap(); S.st.n = 1; S.st.turn = 'ai'; w.GX.undo.check(); ok(!w.GX.undo.can());
});
test('undo: sealed when hidden information is revealed (game predicate)', () => {
  const w = page(), S = undoGame(w);
  const reveal = (a, b) => b.deck.length < a.deck.length;
  w.GX.undo.snap(); S.st.n = 1; w.GX.undo.check(reveal); ok(w.GX.undo.can());
  w.GX.undo.snap(); S.st.hand.push(S.st.deck.pop()); w.GX.undo.check(reveal); ok(!w.GX.undo.can()); eq(w.GX.undo.why, 'reveal');
});
test('undo: seal() on confirm; snapshots are deep copies', () => {
  const w = page(), S = undoGame(w);
  w.GX.undo.snap(); S.st.hand.push(9); w.GX.undo.undo(); eq(S.st.hand, [1, 2]);
  w.GX.undo.snap(); w.GX.undo.seal('confirm'); ok(!w.GX.undo.can());
});
test('undo: drop() forgets a refused move without restoring', () => {
  const w = page(), S = undoGame(w);
  w.GX.undo.snap(); S.st.n = 5; w.GX.undo.drop(); ok(!w.GX.undo.can()); eq(S.st.n, 5);
});
test('undo: off online unless the game opts in; onChange reports', () => {
  const w = page(); let on = true, seen = [];
  undoGame(w, { online: () => on, onChange: c => seen.push(c) });
  ok(!w.GX.undo.snap(), 'no snapshot online'); ok(!w.GX.undo.can());
  undoGame(w, { online: () => on, allowOnline: true, onChange: c => seen.push(c) }); ok(w.GX.undo.snap()); ok(w.GX.undo.can());
  ok(seen.includes(true));
});

// ---------------- recap
test('recap: collects lines while others play, one strip, expand and dismiss', () => {
  const w = page(), d = w.document; const box = w.GX.recap.attach('#db'); w.GX.recap.seats([0, 1, 2]);
  ok(box.hidden, 'hidden while empty');
  w.GX.recap.push(['Fern placed a worker on Berry Patch.', 'Fern gained 1 berry.'], 1); w.GX.recap.push('Quill played Twig Barge.', 2);
  ok(!box.hidden); eq(box.querySelector('.gx-recap-n').textContent, '3'); eq(box.querySelector('.gx-recap-1').textContent, 'Quill played Twig Barge.');
  click(w, box.querySelector('.gx-recap-h')); eq(box.querySelectorAll('li').length, 3);
  click(w, box.querySelector('.gx-recap-x')); ok(box.hidden); eq(w.GX.recap.lines(0), []);
  eq(w.GX.recap.lines(1), ['Quill played Twig Barge.'], 'other seats keep their own summary');
});
test('recap: mark() at the human decision clears it; view() switches seat (hot-seat)', () => {
  const w = page(); const box = w.GX.recap.attach('#db'); w.GX.recap.seats([0, 1]);
  w.GX.recap.push('Player 2 played a card.', 1); eq(w.GX.recap.lines(0).length, 1); eq(w.GX.recap.lines(1).length, 0, 'own moves not repeated');
  w.GX.recap.mark(0); ok(box.hidden);
  w.GX.recap.push('Player 1 played a card.', 0); w.GX.recap.view(1); ok(!box.hidden); eq(box.querySelector('.gx-recap-1').textContent, 'Player 1 played a card.');
});

// ---------------- results / achievements
test('GNS: results, stats, best score, streaks, per-game achievements', () => {
  const w = page();
  w.GNS.achievements('hb', [{ id: 'first', name: 'First win', how: 'Win a game', test: r => r.won }, { id: 'big', name: 'Big city', how: '50+ points', test: r => r.score >= 50 }, { id: 'three', name: 'Three games', how: 'Play 3', test: (r, s) => s.played >= 3 }]);
  const earned = []; w.GNS.onEarn(a => earned.push(a.id));
  const seats = [{ name: 'You', me: true }, { name: 'Fern', ai: 'easy' }];
  let r = w.GNS.result({ game: 'hb', mode: 'vs', seats, winner: 1, scores: [40, 45], turns: 60, ms: 60000 });
  eq(r.stats.played, 1); eq(r.stats.won, 0); eq(r.earned.length, 0);
  r = w.GNS.result({ game: 'hb', mode: 'vs', seats, winner: 0, scores: [52, 45], turns: 70, ms: 70000 });
  eq(r.stats.won, 1); eq(r.stats.best, 52); eq(r.earned.map(a => a.id), ['first', 'big']); eq(earned, ['first', 'big']);
  r = w.GNS.result({ game: 'hb', mode: 'solo', seats: [{ name: 'You', me: true }], winner: 0, scores: [30], turns: 40 });
  eq(r.earned.map(a => a.id), ['three']); eq(r.stats.streak, 2); eq(r.stats.modes, { vs: 2, solo: 1 });
  eq(Object.keys(w.GNS.earned('hb')).sort(), ['big', 'first', 'three']);
  eq(w.GNS.results('hb').length, 3); eq(JSON.parse(w.localStorage.getItem('gns-achdef')).hb.length, 3, 'definitions stored for the shelf');
  // a second result for the same achievement does not earn it again
  r = w.GNS.result({ game: 'hb', seats, winner: 0, scores: [60, 1] }); eq(r.earned.length, 0);
});
test('GNS: hot-seat (no "me") counts as played, not won; saves map', () => {
  const w = page(); const r = w.GNS.result({ game: 'x', mode: 'hot', seats: [{ name: 'A' }, { name: 'B' }], winner: 0, scores: [1, 0] });
  eq(r.stats.played, 1); eq(r.stats.won, 0);
  w.GNS.saved('x', true); ok(JSON.parse(w.localStorage.getItem('gns-saves')).x > 0); w.GNS.saved('x', false); eq(JSON.parse(w.localStorage.getItem('gns-saves')), {});
});
test('GNS: results list capped at 200', () => {
  const w = page(); for (let i = 0; i < 205; i++) w.GNS.result({ game: 'y', seats: [{ me: true }], winner: 0 });
  eq(w.GNS.results().length, 200); eq(w.GNS.stats('y').played, 205);
});

// ---------------- offline
test('offline: registers ../sw.js with scope ../ and shows the update notice', () => {
  const w = page(); const calls = []; const ls = {};
  Object.defineProperty(w.navigator, 'serviceWorker', { value: { controller: {}, register: (u, o) => { calls.push([u, o.scope]); return Promise.resolve(); }, addEventListener: (t, f) => { ls[t] = f; } } });
  ok(w.GX.offline()); eq(calls, [['../sw.js', '../']]);
  ls.message({ data: { type: 'gns-update', url: 'https://gns.test/other/' } }); ok(!w.document.querySelector('.gx-update'), 'other page: no notice');
  ls.message({ data: { type: 'gns-update', url: 'https://gns.test/game/index.html' } }); ok(w.document.querySelector('.gx-update'), 'notice');
  eq(w.document.querySelector('.gx-update').textContent, 'A new version is ready — tap to reload');
});
test('offline: nothing happens without a service worker or on file://', () => {
  const w = page(); eq(w.GX.offline(), false);
});

console.log(`kit-test: ${pass} passed, ${fail} failed`);
process.exitCode = fail ? 1 : 0;
