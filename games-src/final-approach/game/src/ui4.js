// ===================== part 4: guided first flight script, end card, drawers =====================
var GUIDED_SCRIPT = [[[6,4,6,3],[4,3,4,4]],[[1,5,2,3],[4,1,5,5]],[[4,2,1,6],[3,1,2,4]],[[2,4,2,4],[2,5,4,1]],[[6,5,2,2],[6,2,1,4]],[[1,1,5,5],[2,6,6,2]],[[4,2,4,3],[5,6,4,6]]];   // found by guided-search.js: each control has a die to teach with, and two computer crews win 80% of 60 flights
// (the old tip cards are gone: the help kit in ui10.js gives the coach bubbles, the lightbulb and the rules cards)
// one control tip per die you place: the next one waits until you have placed a die, and control tips come when the die you picked fits that control
function myPlaced() { const v = actSeat(); return typeof v === 'number' && v >= 0 ? Object.values(G.slots).filter(d => d.s === v && d.k !== 'i' && d.k !== 'x').length : 0; }
function selFits(grp) { return typeof UI.sel === 'number' && UI.sel >= 0 && !G.pend && selectedLegal().some(k => FA.SLOT[k].grp === grp); }
const tval = v => typeof v === 'function' ? v() : v;
function myTurn() { const v = actSeat(); return typeof v === 'number' && v >= 0 && mayAct(v) && FA.pending(G).includes(v); }
function coachTick() { }   // kept so older call sites stay valid; see ui10.js
function applyHL() { }
// ---------- end card ----------
// ---- the story card at the start of a flight (airport, what is special today, how the colours work)
function showStory() {
  const rs = $('#rs'); if (!rs || !G || G.result) return; const sc = scenOf(), ap = D.airports[sc.ap], band = D.diffs[sc.col] || {};
  UI.rsOpen = true; rs.hidden = false; rs.innerHTML = ''; rs.className = 'story';
  const mods = sc.mods.map(m => D.mods[m]).concat(G.mods.traffic ? [D.mods.traffic] : []).concat(G.mods.tabs ? [D.mods.turns] : []);
  const box = h('div.rsbox.stbox', { role: 'dialog', 'aria-label': 'Flight story' },
    ART['end-land'] ? h('img.stimg', { src: ART['end-land'], alt: '' }) : null,
    goalCard(true), h('h2', ap.name + ': ' + sc.title), h('p.sm.muted', (band.name || sc.col) + ' · ', wxImg('wx-' + ap.wx), wxImg('time-' + ap.tod), ap.wx + ', ' + ap.tod + ' · ' + name(0) + ' (Pilot, blue) and ' + name(1) + ' (Co-pilot, orange)'),
    h('p', sc.text), h('p.sm', ap.blurb),
    mods.length ? h('div', h('b', 'Today'), ...mods.map(m => h('div.why', h('b', m.name + ': '), m.text))) : h('p.sm', 'No extra rules today: just the panel, the track and each other.'),
    ...G.abil.map(a => h('div.why', h('b', D.abilities[a].name + ': '), D.abilities[a].text)),
    h('div.cbtns', h('button.btn.go', { type: 'button', 'data-a': 'rsclose' }, 'To the briefing')));
  rs.appendChild(box);
}
function closeRS() { const rs = $('#rs'); if (rs) { rs.hidden = true; rs.innerHTML = ''; rs.className = ''; } UI.rsOpen = false; if (G && G.result) { if (typeof pxClearEnd === 'function') pxClearEnd(); hideRecap(); if (UI.started) render(); } }   // 'Look at the panel': the ending picture goes and the final panel is drawn again
function checkRows(c) {
  const rows = [['planes', 'No planes left on the approach track'], ['gear', 'All landing gear down'], ['flaps', 'All flaps out'], ['axis', 'Axis level'], ['speed', 'Speed no more than the brakes'], ['intern', 'Trainee fully trained'], ['ice', 'Icy-runway brakes finished']];
  return rows.filter(r => r[0] in c).map(r => h('div.chk', h('i.' + (c[r[0]] ? 'ok' : 'no'), c[r[0]] ? '✓' : '×'), r[1]));
}
const LANDED_WHY = ['landed', 'checks', 'speed'];
const LOSS_T = { mandatory: 'an Axis or Engines space was empty', spin: 'the plane tilted into a spin', collision: 'collision with a plane on the approach', overshoot: 'the plane overshot the airport', corridor: 'the axis was outside the corridor', fuel: 'out of fuel', short: 'not at the airport when the last altitude began', timeout: 'out of time' };
const LOSS_TIP = { mandatory: 'Every round both crew must put a die on the Axis and on the Engines. The panel warns you (red pulse) when your last dice are needed there.', spin: 'A tilt of 3 either way is a spin. Watch the dial and answer your crewmate’s axis die with a close value.', collision: 'Clear a plane with the Radio before you leave its space: a die showing n clears the space n - 1 ahead of you.', overshoot: 'Near the airport keep the engine sum at or under the blue marker: the plane then stays where it is.', corridor: 'On a space with a corridor tab the axis must be in one of its positions when you leave (C = level, L/R = tilted toward the Pilot/Co-pilot).', fuel: 'Use the fuel space every round (any die burns its value; skipping burns 6), or keep the engine dice close when fuel leaks.', short: 'You must be on the airport space when the last altitude starts: plan the moves round by round.' };
function lossText(R) {
  if (R.why === 'mandatory' && Array.isArray(R.miss) && R.miss.length) return R.miss.map(k => name(+k[2]) + ' (' + pname(+k[2]) + ') had no die on the ' + (k[0] === 'a' ? 'Axis' : 'Engines')).join('; ') + ' at the end of the round.';
  return R.msg;
}
function showFinal() {
  const rs = $('#rs'); if (!rs || !G || !G.result) return; UI.rsOpen = true; rs.hidden = false; rs.innerHTML = ''; rs.className = '';
  const R = G.result, sc = scenOf(), ap = D.airports[sc.ap];
  const stats = G.used || {};
  const box = h('div.rsbox.' + (R.win ? 'win' : 'lose'), { role: 'dialog', 'aria-label': 'Flight debrief' },
    h('h2', R.win ? 'Landed at ' + ap.name + '!' : 'Flight lost'),
    h('p', R.win ? 'The passengers applaud. ' + sc.title + ' is done' + (UI.mode === 'guided' ? ': you have flown the first flight.' : '.') : lossText(R)),
    // the landing checklist only when the landing itself was judged; an earlier loss shows just what went wrong and how to avoid it
    LANDED_WHY.includes(R.why) ? h('div', checkRows(R.checks || {})) : h('div', h('div.chk', h('i.no', '×'), h('span', 'Round ' + (G.round + 1) + ' at ' + altRows()[G.round + G.row0][0] + ' ft: ' + (LOSS_T[R.why] || 'flight lost'))), LOSS_TIP[R.why] ? h('p.sm', LOSS_TIP[R.why]) : null),
    h('div.kv', h('span', 'Rounds flown'), h('b', (G.round + 1) + ' of ' + (D.rounds - G.row0))), h('div.kv', h('span', 'Coffee earned'), h('b', String(stats.coffeeGain || 0))), h('div.kv', h('span', 'Planes cleared by radio'), h('b', String(stats.radioClear || 0))), h('div.kv', h('span', 'Rerolls spent'), h('b', String(stats.rerollUse || 0))),
    h('div.cbtns', UI.mode === 'net' ? (typeof isHost === 'function' && isHost() ? h('button.btn.go', { type: 'button', 'data-a': 'again' }, 'Fly again') : h('span.sm', 'The host can start another flight.')) : h('button.btn.go', { type: 'button', 'data-a': 'again' }, 'Fly again'), UI.mode !== 'net' && R.win ? h('button.btn', { type: 'button', 'data-a': 'nextsc' }, 'Next airport') : null, h('button.btn.alt', { type: 'button', 'data-a': 'rsclose' }, 'Look at the panel'), h('button.btn.alt', { type: 'button', 'data-a': 'menu' }, 'Menu')));
  rs.appendChild(box);
}
// ---------- drawers ----------
// the log grouped by round (newest first, the current round open), without the "(pilot)" / "(co-pilot)" suffixes
function logHTML() {
  const e = h('div.logl'), by = new Map(); for (const l of G.log.slice(-200)) { const r = l.r || 0; if (!by.has(r)) by.set(r, []); by.get(r).push(l.t.replace(/ \((pilot|co-pilot)\)/g, '')); }
  const rows = altRows(), rs = [...by.keys()].sort((a, b) => b - a);
  rs.forEach((r, i) => { const R = r > 0 ? rows[r - 1 + G.row0] : null; const d = h('details.lgr', { open: i === 0 ? true : null }, h('summary', r > 0 ? 'Round ' + r + (R ? ' · ' + R[0] + ' ft' : '') : 'Before the flight', h('span.lgn', ' (' + by.get(r).length + ')')));
    by.get(r).slice().reverse().forEach(t => d.appendChild(h('div.ll', t))); e.appendChild(d); });
  return e;
}
function buildRules() {
  // short lines a friend would say at the table (owner, 8 Nov 2026: max ~12 words per line)
  const root = h('div.rules'), sec = (t, ...k) => { root.appendChild(h('h3', t)); k.forEach(x => root.appendChild(x)); }, L = (tag, a) => h(tag, ...a.map(t => h('li', t)));
  const split = t => String(t).split(/(?<=[.!?])\s+/).filter(Boolean);
  sec('The goal', L('ul', ['You and your crewmate land a plane together.', 'You win or lose as one crew.', 'Seven rounds. One altitude row each round.', 'Be on the airport when the last round starts.', 'Last round: runway clear, gear and flaps down, wings level.', 'And the speed must not beat the brakes.']));
  sec('How a turn works', L('ol', ['A banner says whose turn it is.', 'Pick one of your dice. Legal spaces glow.', 'Put it on a glowing space. A chip says what changed.', 'Your crewmate does the same. Tap the board to hurry them.', 'When all dice are down, the round ends.']));
  sec('How a round goes', L('ol', ['The new altitude row may bring a reroll token.', 'Talk strategy, never dice numbers. Then roll.', 'Silence. Take turns, one die each, until all are used.', 'Both axis and both engine dice must be down.', 'The plane sinks one row. The dice come back.']));
  sec('Every control', L('ul', ['Axis: both of you, every round.', 'The plane tips toward the higher die by the difference.', 'A tilt of 3 is a spin. You lose.', 'Engines: both of you, every round. The two dice add up.', 'Up to the blue marker you stay. Up to orange, one space.', 'Above orange, two spaces.', 'Leaving a space with a plane is a crash.', 'Passing the airport is a crash too.', 'Radio: any die. It clears a plane that many spaces ahead.', 'Gear (pilot): 1-2, 3-4, 5-6, any order. Each lifts blue.', 'Flaps (co-pilot): 1-2, 2-3, 4-5, 5-6 in order. Each lifts orange.', 'Brakes (pilot): exactly 2, then 4, then 6.', 'Brakes only count in the last round.', 'Coffee: any die earns a token. Hold up to 3.', 'A token adds or takes 1 from a die you place.', 'Reroll token: either of you may spend it, any time.', 'Then both of you may reroll unplaced dice once.']));
  sec('The last round', L('ul', ['The plane does not move.', 'Your engine total must not beat the brakes.', 'The brakes must be at least 2.', 'You win if all landing checks are green.']));
  sec('You lose at once if', L('ul', ['the tilt reaches 3', 'an axis or engine die is missing', 'you leave a space that holds a plane', 'you fly past the airport', 'the last round starts away from the airport', 'the fuel runs out', 'your final speed beats the brakes']));
  sec('House rules in this version', L('ul', ['Speed may equal the brakes.', 'A die that fits nowhere is thrown away.', 'Trainee tokens are placed at once.', 'Talk uses set phrases, never numbers.', 'The timer pauses on pass screens.', 'The newer expansion is not included.']));
  sec('Modules', h('div', ...Object.keys(D.mods).map(k => h('div.rcard', h('div.rt', h('b', D.mods[k].name), ...split(D.mods[k].text).map(t => h('div', t)))))));
  sec('Ability cards', h('div', ...Object.keys(D.abilities).map(k => h('div.rcard', h('div.rt', h('b', D.abilities[k].name), ...split(D.abilities[k].text).map(t => h('div', t)))))));
  sec('Playing on a phone', L('ul', ['Tap a die, then a glowing space.', 'Tap the die again to put it back.', 'Coffee buttons show when you hold tokens.', 'Hot-seat hides everything between turns.', 'Online, you only see your own dice.', 'The bulb turns hints on and off.']));
  root.appendChild(h('div', { html: '<section class="credits-audio"><h3>Credits</h3><p>Sounds by Kenney (kenney.nl, CC0).</p><p>Ambience and music: OpenGameArt contributors, CC0.</p><p>Painted art is original, made in this repository.</p><p>Names, text and art are original.</p></section>' }));
  return root;
}
function buildRef() {
  const root = h('div.rules'), tr = (t, ...k) => { root.appendChild(h('h3', t)); k.forEach(x => root.appendChild(x)); };
  tr('Every airport and scenario (21)', h('div', ...['green', 'yellow', 'red', 'black'].map(col => h('div', h('div.band', h('i', { style: 'background:' + D.diffs[col].c }), D.diffs[col].name + ' (' + D.scenarios.filter(s => s.col === col).length + ')'), ...D.scenarios.filter(s => s.col === col).map(s => { const t = D.tracks[s.trk]; return h('div.rcard', h('div.rt', h('b', D.airports[s.ap].name + ': ' + s.title), h('div.sm', t.size + ' spaces, ' + t.sp.reduce((a, x) => a + x[0], 0) + ' planes at the start' + (scExtras(s).length ? ', ' + scExtras(s).join(', ') : '') + (s.ab ? ', ' + s.ab + ' ability card' + (s.ab > 1 ? 's' : '') : '')))); })))));
  tr('Components', h('ul', ...['4 blue dice (pilot) and 4 orange dice (co-pilot), rolled behind screens', '1 traffic die with faces 2, 3, 3, 4, 4, 5', '12 plane tokens, 3 coffee tokens, 3 reroll tokens', 'Blue and orange engine markers, a red brake marker', 'Approach strips (21) and two altitude tracks: green/yellow (rerolls at 6000 and 2000 ft) and red/black (reroll at 6000 ft)', 'Module parts: fuel track (starts at 20), wind dial, six trainee tokens, icy-runway brake track, 60-second timer', 'Six ability cards'].map(t => h('li', t))));
  tr('Spaces on the panel', h('ul', ...['Axis 1+1, Engines 1+1 (mandatory)', 'Radio 1 pilot + 2 co-pilot', 'Landing gear 3 (pilot): 1-2, 3-4, 5-6', 'Flaps 4 (co-pilot): 1-2, 2-3, 4-5, 5-6, in order', 'Brakes 3 (pilot): 2, 4, 6, in order', 'Concentration 3 (either)', 'Fuel 1 (either), Trainee 1+1, Icy-runway brakes 4 columns x 2'].map(t => h('li', t))));
  return root;
}
function renderCrew() {
  const b = $('#crewbody'); if (!b || !G) return; b.innerHTML = ''; const sc = scenOf(), ap = D.airports[sc.ap];
  // phones: the long goal, the landing checklist and the briefing phrases live here, not on the board
  if (isPh()) {
    if (UI.camp && UI.camp.goal) b.appendChild(h('div.why', h('b', 'Chapter goal: '), UI.camp.goal.text));
    b.appendChild(h('h3.drh', 'Goal')); b.appendChild(h('div.drgoal', goalFull()));
    b.appendChild(h('h3.drh', 'Landing checklist')); for (const [ok, t] of landList()) b.appendChild(h('div.cr', h('span.ck' + (ok === true ? '.ok' : ok === false ? '.no' : ''), ok === true ? '✓' : ok === false ? '!' : ''), t));
    const v = actSeat();
    if (G.phase === 'brief' && !G.result) { b.appendChild(h('h3.drh', 'Briefing phrases')); b.appendChild(h('p.sm', 'Before the roll you may say one thing. After the roll: silence, your placed dice do the talking.'));
      const sy = h('div.sayrow'); for (const s of [0, 1]) for (const c of G.say[s]) sy.appendChild(h('span.sbub.' + (s ? 'c' : 'p'), (who(s) === 'You' ? 'You said' : name(s) + ' says') + ': “' + SAYT[c] + '”'));
      if (typeof v === 'number' && v >= 0 && mayAct(v)) for (const m of FA.validMoves(G, v).filter(m => m.t === 'say')) sy.appendChild(h('button.say', { type: 'button', 'data-a': 'say', 'data-c': m.c }, SAYT[m.c])); b.appendChild(sy); }
    b.appendChild(h('h3.drh', 'The airport'));
  }
  b.appendChild(h('div.kv', h('span', 'Airport'), h('b', ap.name))); b.appendChild(h('p', ap.blurb)); b.appendChild(h('div.kv', h('span', 'Scenario'), h('b', sc.title + ' (' + D.diffs[sc.col].name + ')'))); b.appendChild(h('p.sm', sc.text));
  b.appendChild(h('div.kv', h('span', 'Weather'), h('b.wxb', wxImg('wx-' + ap.wx), wxImg('time-' + ap.tod), ap.wx + ', ' + ap.tod))); if (G.mods) for (const m of sc.mods) b.appendChild(h('div.why', h('b', D.mods[m].name + ': '), D.mods[m].text));
  if (G.mods.tabs) b.appendChild(h('div.why', h('b', D.mods.turns.name + ': '), D.mods.turns.text)); if (G.mods.traffic) b.appendChild(h('div.why', h('b', D.mods.traffic.name + ': '), D.mods.traffic.text));
  for (const a of G.abil) b.appendChild(h('div.why', h('b', D.abilities[a].name + ': '), D.abilities[a].text));
  for (const s of [0, 1]) b.appendChild(h('div.rcard', ART['crew-' + s] ? h('img.ri', { src: ART['crew-' + s], alt: '' }) : null, h('div.rt', h('b', D.crew[s].name + (G.ai[s] ? ' (computer ' + G.ai[s] + ')' : '')), h('div.sm', D.crew[s].story))));
}
function renderMenu() {
  const b = $('#setbody'); b.innerHTML = ''; const row = (l, ...k) => b.appendChild(h('div.mrow', h('div.lbl', l), h('div.mbt', k)));
  const tog = (n, on, label) => h('button.btn' + (on ? '' : '.alt'), { 'data-a': n, type: 'button', 'aria-pressed': on ? 'true' : 'false' }, label + ': ' + (on ? 'On' : 'Off'));
  if (typeof NET !== 'undefined' && NET.on) row('Online', h('button.btn', { 'data-a': 'netopen', type: 'button' }, 'Lobby'), h('button.btn.alt', { 'data-a': 'netleave', type: 'button' }, typeof isHost === 'function' && isHost() ? 'Close the room' : 'Leave the room'));
  else row('Game', h('button.btn', { 'data-a': 'menu', type: 'button' }, 'New flight'), h('button.btn.alt', { 'data-a': 'save', type: 'button' }, 'Save'), h('button.btn.alt' + (hasSave() ? '' : '.dis'), { 'data-a': 'loadsave', type: 'button', disabled: hasSave() ? null : true }, 'Load'));
  if (!(typeof NET !== 'undefined' && NET.on)) { row('Computer speed', ...[['Fast', 150], ['Normal', 900], ['Slow', 1300]].map(([n, v]) => h('button.btn' + (AIDELAY === v ? '' : '.alt'), { 'data-a': 'speed', 'data-v': v, type: 'button' }, n))); row('Flight story card', ...[[true, 'On'], [false, 'Off']].map(([v, n]) => h('button.btn' + ((UI.prefs.story !== false) === v ? '' : '.alt'), { 'data-a': 'story', 'data-v': v ? '1' : '0', type: 'button' }, n))); }
  { const tb = tutEl('btn'); if (tb) row('Learn', tb); }
  if (typeof hlpInit === 'function') { hlpInit(); if (typeof GXH !== 'undefined') { const w = document.createElement('div'); w.innerHTML = GXH.settingsHTML({ rowClass: 'mrow', btnClass: 'btn' }); while (w.firstChild) b.appendChild(w.firstChild); } }
  row('Sound', tog('sound', UI.prefs.sound, 'Sound effects'), tog('music', UI.prefs.music, 'Music'), h('button.btn.alt', { 'data-a': 'musicopen', type: 'button' }, 'Choose music'));
  { const g = UI.prefs.gfx || 'auto'; row('Graphics' + (typeof PX !== 'undefined' && PX.on ? (g === 'auto' ? ' (now ' + PX.q + ')' : '') : ' (simple view)'), ...[['auto', 'Auto'], ['high', 'High'], ['medium', 'Medium'], ['low', 'Low']].map(([v, n]) => h('button.btn' + (g === v ? '' : '.alt'), { 'data-a': 'gfx', 'data-v': v, type: 'button', 'aria-pressed': g === v ? 'true' : 'false' }, n))); }
  let sp = ''; try { sp = window.PerfHUD && PerfHUD.buttonsHTML ? PerfHUD.buttonsHTML('btn alt') : ''; } catch (e) { }
  row('Info', h('button.btn.alt', { 'data-a': 'rules', type: 'button' }, 'How to play'), h('span.tinyc', { html: sp }));
  b.appendChild(h('p.sm', 'An original co-operative landing game. Names, text and art are original.'));
}
function renderDrawers() { if (!GX.open || !G) return; if (GX.open === 'logd') { const b = $('#logbody'); b.innerHTML = ''; b.appendChild(logHTML()); } if (GX.open === 'crewd') renderCrew(); if (GX.open === 'setd') renderMenu(); }
