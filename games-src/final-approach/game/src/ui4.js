// ===================== part 4: guided first flight (tips), end card, drawers =====================
var GUIDED_SCRIPT = [[[6,4,6,3],[4,3,4,4]],[[1,5,2,3],[4,1,5,5]],[[4,2,1,6],[3,1,2,4]],[[2,4,2,4],[2,5,4,1]],[[6,5,2,2],[6,2,1,4]],[[1,1,5,5],[2,6,6,2]],[[4,2,4,3],[5,6,4,6]]];   // found by guided-search.js: each control has a die to teach with, and two computer crews win 80% of 60 flights
// Each tip has a short line (s) shown as a banner in the dock (never over the dice tray, Roll or the briefing phrases) and a full text (x) behind "More".
// While a tip is up, the control it talks about pulses on the panel (TIPHL in part 2).
const TIPS = [
  { id: 'welcome', g: 1, when: () => G.phase === 'brief' && G.round === 0, t: 'Welcome aboard', s: 'You are Ines, the Pilot (blue). Ravi flies orange. Land in 7 rounds.', x: 'You are Captain Ines Marlow, the Pilot (blue). Your co-pilot, Ravi, plays the orange side. Land the plane in seven rounds, one altitude row per round. This first flight is Port Alder, the friendliest airport. I will introduce one control at a time, and the control I talk about pulses on the panel.' },
  { id: 'brief', g: 1, when: () => G.phase === 'brief' && G.round === 0, t: 'The briefing', s: 'Tap a phrase to share a plan (never dice values), then Roll.', x: 'Before each roll you may talk strategy: "we need to clear traffic", "let us move two spaces". You never say dice values. Tap a phrase to tell Ravi your plan, then press Roll. After the roll both of you stay silent: the dice you place are your only words.' },
  { id: 'alt', g: 1, when: () => G.phase === 'brief' && G.round === 0, t: 'The altitude strip', s: 'One row per round. Its colour shows who places first.', x: 'Every round the plane sinks one row: seven rows, seven rounds, no waiting. The colour of each row (and the name next to it) says who places the first die that round: blue is the Pilot, orange the Co-pilot. A purple dot means a reroll token comes aboard at that altitude.' },
  { id: 'dice', g: 1, when: () => G.phase === 'place' && G.round === 0 && myTurn(), t: 'Your dice', s: 'Your blue dice: only you see them. Tap a die, then a glowing space.', x: 'Your four blue dice sit behind your screen at the bottom: only you can see them. Ravi’s orange dice are hidden from you. Players alternate: tap a die, then tap a glowing space on the panel. You must place every die.' },
  { id: 'axis', g: 1, ctl: 1, when: () => myTurn() && selFits('axis'), t: 'Control 1: the Axis', s: 'Both crew fill the Axis every round. It tilts toward the higher die.', x: 'Each round both crew must put one die on the Axis (the two spaces beside the round dial). The plane tilts toward the higher die by the difference (5 against 3 tilts 2). Equal dice keep it level. A tilt of 3 is a spin: you lose at once. The tilt carries over, and the plane must be level when it lands.' },
  { id: 'engines', g: 1, ctl: 1, when: () => myTurn() && selFits('engines'), t: 'Control 2: the Engines', s: 'Both crew fill the Engines too: the sum moves the plane 0, 1 or 2.', x: 'Both crew also put one die on the Engines (beside the speed gauge). Add them: up to the blue marker the plane stays put, up to the orange marker it moves one space, above it moves two. Leaving a space that still holds a plane is a collision, and moving past the airport is an overshoot. An empty Axis or Engines space at the end of a round loses the flight.' },
  { id: 'track', g: 1, ctl: 1, when: () => G.phase === 'place' && myPlaced() >= 1 && myTurn(), t: 'The approach strip', s: 'Your route: clear the planes on a space before you leave it.', x: 'The strip at the top is your route. Your plane is the glowing space. Planes in your way must be cleared before you leave their space. The airport is the last space: you must be there when the last altitude starts.' },
  { id: 'radio', g: 1, ctl: 1, when: () => myTurn() && selFits('radio'), t: 'Control 3: the Radio', s: 'Radio: clears a plane that many spaces ahead (your space is 1).', x: 'A die on the Radio, any value, clears one plane. Count from your own space as 1: a 3 clears the plane on the space two ahead of you. The pilot has one radio space, the co-pilot has two.' },
  { id: 'rr', g: 1, ctl: 1, when: () => G.rrHand > 0 && G.phase === 'place' && myTurn() && !G.pend && myPlaced() >= 2, t: 'The Reroll button', s: 'Reroll: either of you, any time. Both reroll any unplaced dice.', x: 'A reroll token lets both crew reroll any of their unplaced dice, once, behind their screens. Tokens come from the altitude strip. Either crew may spend one at any time while dice are left, also during the partner’s turn. Use it when your hand does not fit the jobs that are waiting.' },
  { id: 'hint', g: 1, ctl: 1, when: () => G.round >= 1 && G.phase === 'place' && myTurn(), t: 'The Hint button', s: 'Hint shows what the computer would do, and why. Guess first!', x: 'Not sure? Press Hint: it picks the die and the space the computer crew would choose and explains why, under your die in this panel. It is a suggestion, not a rule. You learn faster if you guess first and then compare.' },
  { id: 'gear', g: 1, ctl: 1, when: () => G.round >= 1 && myTurn() && selFits('gear'), t: 'Control 4: Landing gear', s: 'Pilot: three gears (1-2, 3-4, 5-6). Each raises the blue marker.', x: 'The pilot lowers the landing gear: any of the three spaces, a 1-2, a 3-4 and a 5-6. All three must be down to land. Each gear raises the blue engine marker, so slow speeds become easier and one-space moves harder.' },
  { id: 'flaps', g: 1, when: () => G.round === 2 && G.phase === 'place', t: 'Control 5: Flaps', s: 'Ravi: four flaps, in order. Each raises the orange marker.', x: 'The co-pilot extends the flaps, in order from the top: 1-2, then 2-3, then 4-5, then 5-6. All four must be out to land. Each flap raises the orange marker, so a two-space move needs a bigger sum. Ravi handles these; watch how the markers move.' },
  { id: 'brakes', g: 1, when: () => G.round === 3 && G.phase === 'place' && myTurn(), t: 'Control 6: Brakes', s: 'Brakes: exactly 2, then 4, then 6. They count in the last round.', x: 'The brakes only matter in the last round, but they need exact values in order: a 2, then a 4, then a 6. In the final round your engine total must be no more than the brake value. Set them early.' },
  { id: 'conc', g: 1, when: () => G.round === 4 && G.phase === 'place' && myTurn(), t: 'Control 7: Concentration', s: 'A spare die on Coffee earns a token: ±1 on any later die.', x: 'A die you cannot use anywhere can go on Concentration (the Coffee spaces) for a coffee token. Spend tokens on any later die to add or subtract 1 (never wrapping 1 to 6): pick a die, then use the − and + buttons under it. The die in your tray shows the new value.' },
  { id: 'final', g: 1, when: () => G.round === 6 && G.phase === 'brief', t: 'The landing round', s: 'Last round: no move. Speed must be no more than the brakes.', x: 'This is the last round. The plane does not move: your engine total is compared with the brakes. To win by the end of the round: no planes left, all gear and flaps down, the axis exactly level, and the speed no greater than the brakes.' },
  // normal flights with Guide "Full": a short set written for the seat you actually fly (the g:1 set above is the guided Pilot flight at Port Alder)
  { id: 'n-welcome', g: 2, when: () => G.phase === 'brief' && G.round === 0, t: 'Your seat', s: () => 'You are ' + name(UI.seat) + ', the ' + SEATN[UI.seat] + ' (' + (UI.seat ? 'orange' : 'blue') + '). ' + name(1 - UI.seat) + ' flies ' + (UI.seat ? 'blue' : 'orange') + '. Land in ' + (D.rounds - G.row0) + ' rounds.', x: () => 'You fly the ' + SEATN[UI.seat] + ' seat (' + (UI.seat ? 'orange' : 'blue') + ' dice, the ' + (UI.seat ? 'right' : 'left') + ' side of the panel). Your crewmate ' + name(1 - UI.seat) + ' flies the ' + SEATN[1 - UI.seat] + ' seat. Talk plans in the briefing, never dice values; after the roll your placed dice are your only words.' },
  { id: 'n-dice', g: 2, when: () => G.phase === 'place' && myTurn(), t: 'Your dice', s: () => 'Your ' + (UI.seat ? 'orange' : 'blue') + ' dice: only you see them. Tap a die, then a glowing space.', x: () => 'Your four ' + (UI.seat ? 'orange' : 'blue') + ' dice are behind your screen; ' + name(1 - UI.seat) + '’s dice are hidden from you. Players alternate until all eight dice are placed. Spaces marked ' + (UI.seat ? 'C' : 'P') + ' are yours; grey spaces take either crew.' },
  { id: 'n-mand', g: 2, ctl: 1, when: () => myTurn() && (selFits('axis') || selFits('engines')), t: 'Axis and Engines', s: 'Both crew must fill the Axis and the Engines every round.', x: 'Each round both crew put one die on the Axis (the plane tilts toward the higher die; a tilt of 3 is a spin) and one on the Engines (the sum against the blue and orange markers moves the plane 0, 1 or 2 spaces). An empty Axis or Engines space at the end of a round loses the flight.' },
  { id: 'n-role', g: 2, ctl: 1, when: () => myTurn() && myPlaced() >= 1, t: () => 'The ' + SEATN[UI.seat] + '’s jobs', s: () => UI.seat ? 'You extend the flaps in order and have two radio spaces.' : 'You lower the landing gear and set the brakes: 2, then 4, then 6.', x: () => UI.seat ? 'The Co-pilot extends the four flaps strictly in order (1-2, 2-3, 4-5, 5-6); each raises the orange marker. You have two radio spaces to clear planes ahead.' : 'The Pilot lowers the three landing gears (1-2, 3-4, 5-6, any order; each raises the blue marker) and sets the brakes with exactly 2, then 4, then 6. The brakes only count in the last round. You have one radio space.' },
  { id: 'n-hint', g: 2, ctl: 1, when: () => myTurn() && myPlaced() >= 2, t: 'Hint', s: 'Stuck? Hint shows what the computer would do, and why.', x: 'Hint picks the die and space the computer crew would choose and explains why, under your die. Guess first, then compare.' },
  { id: 'welcome2', g: 0, when: () => G.phase === 'brief' && G.round === 0, t: 'Briefing and silence', s: 'Talk plans before the roll, never dice values. Then silence.', x: 'Talk strategy before you roll, never dice values. After the roll stay silent: your placements are your words.' }
];
// one control tip per die you place: the next one waits until you have placed a die, and control tips come when the die you picked fits that control
function myPlaced() { const v = actSeat(); return typeof v === 'number' && v >= 0 ? Object.values(G.slots).filter(d => d.s === v && d.k !== 'i' && d.k !== 'x').length : 0; }
function selFits(grp) { return typeof UI.sel === 'number' && UI.sel >= 0 && !G.pend && selectedLegal().some(k => FA.SLOT[k].grp === grp); }
const tval = v => typeof v === 'function' ? v() : v;
function myTurn() { const v = actSeat(); return typeof v === 'number' && v >= 0 && mayAct(v) && FA.pending(G).includes(v); }
function coachTick() {
  const c = UI.coach; if (!G || !UI.started || G.result || c.level === 'off') return;
  if (UI.mode === 'net' || UI.mode === 'hot' && UI.holder < 0) return;
  if (c.tip) return;
  const gate = G.round + ':' + myPlaced();
  for (const t of TIPS) { if (c.seen[t.id]) continue; const on = t.g === 0 ? c.level === 'light' && UI.mode !== 'guided' : t.g === 1 ? UI.mode === 'guided' : c.level === 'full' && UI.mode === 'vs'; if (!on) continue;   // g:2, the role-aware set, speaks to one person at one seat
    if (t.ctl && c.gate === gate) continue; let ok = false; try { ok = t.when(); } catch (e) { } if (ok) { if (t.ctl) c.gate = gate; c.tip = t.id; c.more = false; showTip(t); return; } }
}
function showTip(t) {
  const pc = $('#pc'); if (!pc) return; pc.hidden = false; pc.innerHTML = ''; const c = UI.coach;
  const ids = TIPS.filter(x => x.g === t.g).map(x => x.id), n = ids.indexOf(t.id) + 1;
  pc.append(h('div.tbr', h('div.tbt', h('div.tbh', h('b', tval(t.t)), h('span', t.g && n ? (t.g === 1 ? 'Step ' : 'Tip ') + n + ' of ' + ids.length : 'Tip')), h('p', tval(c.more ? t.x : t.s))), h('button.btn.go', { type: 'button', 'data-a': 'tipok' }, 'Got it')),
    h('div.cbtns', c.more ? null : h('button.btn.alt', { type: 'button', 'data-a': 'tipmore', 'aria-expanded': 'false' }, 'More'), h('button.btn.alt', { type: 'button', 'data-a': 'tipoff' }, 'No more tips')));
  if (typeof renderDock === 'function' && G) renderDock();
  applyHL();
}
function tipMore() { const c = UI.coach; c.more = true; const t = TIPS.find(x => x.id === c.tip); if (t) showTip(t); }
function applyHL() { const pz = $('#pz'); if (!pz) return; pz.querySelectorAll('.hl').forEach(e => e.classList.remove('hl')); const id = UI.coach && UI.coach.tip; if (id && TIPHL[id]) for (const sel of TIPHL[id]) pz.querySelectorAll(sel).forEach(e => e.classList.add('hl')); }
function tipOk() { const c = UI.coach, pc = $('#pc'); if (c.tip) c.seen[c.tip] = 1; c.tip = ''; c.more = false; if (pc) { pc.hidden = true; pc.innerHTML = ''; } applyHL(); if (G && UI.started) renderDock(); setTimeout(coachTick, 150); }
// ---------- end card ----------
// ---- the story card at the start of a flight (airport, what is special today, how the colours work)
function showStory() {
  const rs = $('#rs'); if (!rs || !G || G.result) return; const sc = scenOf(), ap = D.airports[sc.ap], band = D.diffs[sc.col] || {};
  UI.rsOpen = true; rs.hidden = false; rs.innerHTML = ''; rs.className = 'story';
  const mods = sc.mods.map(m => D.mods[m]).concat(G.mods.traffic ? [D.mods.traffic] : []).concat(G.mods.tabs ? [D.mods.turns] : []);
  const box = h('div.rsbox.stbox', { role: 'dialog', 'aria-label': 'Flight story' },
    ART['end-land'] ? h('img.stimg', { src: ART['end-land'], alt: '' }) : null,
    h('h2', ap.name + ': ' + sc.title), h('p.sm.muted', (band.name || sc.col) + ' · ' + ap.wx + ', ' + ap.tod + ' · ' + name(0) + ' (Pilot, blue) and ' + name(1) + ' (Co-pilot, orange)'),
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
  const root = h('div.rules'), sec = (t, ...k) => { root.appendChild(h('h3', t)); k.forEach(x => root.appendChild(x)); };
  sec('The goal', h('p', 'You and your crewmate fly an airliner onto the runway. You are the Pilot (blue) and the Co-pilot (orange). You win or lose together. The game lasts seven rounds, one altitude row each. By the end of the last round the plane must be on the airport with a clear track, the gear and flaps down, a level axis, and a slow enough speed.'));
  sec('How a round goes', h('ol', ...['Round start: the altitude row appears (it may bring a reroll token), and the traffic die may add planes.', 'Briefing: talk strategy, never dice values. Then both crew roll four dice behind their screens.', 'Silence. The first player (shown on the altitude row) puts one die on a free space of their colour, then you alternate until all eight dice are used.', 'End of round: both axis and both engine dice must be there. The plane sinks one row and the dice come back.'].map(t => h('li', t))));
  sec('Every control', h('ul', ...[
    'Axis (both, mandatory): the plane tilts toward the higher die by the difference. Tilt of 3 = spin = lost. It never resets.',
    'Engines (both, mandatory): the sum against the two markers (blue starts at 4, orange at 8): 0, 1 or 2 spaces. Leaving a space with a plane is a collision; passing the airport is an overshoot.',
    'Radio: pilot one space, co-pilot two, any value. It removes a plane from the space that many steps ahead (1 = your own space).',
    'Landing gear (pilot): 1-2, 3-4, 5-6 in any order. Each raises the blue marker by one.',
    'Flaps (co-pilot): 1-2, 2-3, 4-5, 5-6 strictly in order. Each raises the orange marker by one.',
    'Brakes (pilot): exactly 2, then 4, then 6. They only count in the last round.',
    'Concentration: any die, a coffee token (up to 3). Spend tokens to add or subtract 1 from any die you place (1 to 6, no wrapping).',
    'Reroll token: either crew may spend it at any time while dice are unplaced (also on the partner’s turn): both crew may reroll any of their unplaced dice once.'].map(t => h('li', t))));
  sec('The last round', h('p', 'The plane does not move. Your engine total must be no more than the brake value (and the brakes must be at least 2). At the end of the round you win only if every one of these holds: no planes left, all gear and flaps down, the axis level, and that speed check passed.'));
  sec('You lose at once if', h('ul', ...['the tilt reaches 3', 'an axis or engine die is missing at the end of a round', 'you leave a space that holds a plane, or pass the airport', 'the last altitude starts and you are not at the airport', 'the fuel runs out (fuel scenarios)', 'your final speed is above the brakes'].map(t => h('li', t))));
  sec('Modules', h('div', ...Object.keys(D.mods).map(k => h('div.rcard', h('div.rt', h('b', D.mods[k].name), h('div', D.mods[k].text))))));
  sec('Ability cards', h('div', ...Object.keys(D.abilities).map(k => h('div.rcard', h('div.rt', h('b', D.abilities[k].name), h('div', D.abilities[k].text))))));
  sec('Playing on a phone', h('ul', ...['Tap a die in your tray, then tap a glowing space. Tap the die again to put it back.', 'Coffee buttons appear under the selected die when you hold tokens.', 'Hot-seat: a pass screen hides everything between turns. Online: you only ever see your own dice.', 'Hint shows what the computer crew would do and why, under the selected die (never over the buttons).', 'Each control space is labelled (Axis, Engine, Radio, Gear, Flap, Brake, Coffee). The altitude strip colour shows who places first. The ✓ button lists the landing checklist.'].map(t => h('li', t))));
  root.appendChild(h('div', { html: '<section class="credits-audio"><h3>Credits</h3><p>Sound effects and jingles by Kenney (kenney.nl, CC0); ambience and music from OpenGameArt contributors under CC0 (full list in the licence log). Painted art is original and made by the generator in the repository. Names, text and art are original; the rules follow the rulebook.</p></section>' }));
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
  b.appendChild(h('div.kv', h('span', 'Airport'), h('b', ap.name))); b.appendChild(h('p', ap.blurb)); b.appendChild(h('div.kv', h('span', 'Scenario'), h('b', sc.title + ' (' + D.diffs[sc.col].name + ')'))); b.appendChild(h('p.sm', sc.text));
  b.appendChild(h('div.kv', h('span', 'Weather'), h('b', ap.wx + ', ' + ap.tod))); if (G.mods) for (const m of sc.mods) b.appendChild(h('div.why', h('b', D.mods[m].name + ': '), D.mods[m].text));
  if (G.mods.tabs) b.appendChild(h('div.why', h('b', D.mods.turns.name + ': '), D.mods.turns.text)); if (G.mods.traffic) b.appendChild(h('div.why', h('b', D.mods.traffic.name + ': '), D.mods.traffic.text));
  for (const a of G.abil) b.appendChild(h('div.why', h('b', D.abilities[a].name + ': '), D.abilities[a].text));
  for (const s of [0, 1]) b.appendChild(h('div.rcard', ART['crew-' + s] ? h('img.ri', { src: ART['crew-' + s], alt: '' }) : null, h('div.rt', h('b', D.crew[s].name + (G.ai[s] ? ' (computer ' + G.ai[s] + ')' : '')), h('div.sm', D.crew[s].story))));
}
function renderMenu() {
  const b = $('#setbody'); b.innerHTML = ''; const row = (l, ...k) => b.appendChild(h('div.mrow', h('div.lbl', l), h('div.mbt', k)));
  const tog = (n, on, label) => h('button.btn' + (on ? '' : '.alt'), { 'data-a': n, type: 'button', 'aria-pressed': on ? 'true' : 'false' }, label + ': ' + (on ? 'On' : 'Off'));
  if (typeof NET !== 'undefined' && NET.on) row('Online', h('button.btn', { 'data-a': 'netopen', type: 'button' }, 'Lobby'), h('button.btn.alt', { 'data-a': 'netleave', type: 'button' }, typeof isHost === 'function' && isHost() ? 'Close the room' : 'Leave the room'));
  else row('Game', h('button.btn', { 'data-a': 'menu', type: 'button' }, 'New flight'), h('button.btn.alt', { 'data-a': 'save', type: 'button' }, 'Save'), h('button.btn.alt' + (hasSave() ? '' : '.dis'), { 'data-a': 'loadsave', type: 'button', disabled: hasSave() ? null : true }, 'Load'));
  if (!(typeof NET !== 'undefined' && NET.on)) { row('Computer speed', ...[['Fast', 150], ['Normal', 650], ['Slow', 1300]].map(([n, v]) => h('button.btn' + (AIDELAY === v ? '' : '.alt'), { 'data-a': 'speed', 'data-v': v, type: 'button' }, n))); row('Guide', ...['full', 'light', 'off'].map(n => h('button.btn' + ((UI.coach.level || UI.prefs.guide) === n ? '' : '.alt'), { 'data-a': 'guide', 'data-v': n, type: 'button' }, n[0].toUpperCase() + n.slice(1)))); row('Flight story card', ...[[true, 'On'], [false, 'Off']].map(([v, n]) => h('button.btn' + ((UI.prefs.story !== false) === v ? '' : '.alt'), { 'data-a': 'story', 'data-v': v ? '1' : '0', type: 'button' }, n))); }
  row('Sound', tog('sound', UI.prefs.sound, 'Sound effects'), tog('music', UI.prefs.music, 'Music'));
  { const g = UI.prefs.gfx || 'auto'; row('Graphics' + (typeof PX !== 'undefined' && PX.on ? (g === 'auto' ? ' (now ' + PX.q + ')' : '') : ' (simple view)'), ...[['auto', 'Auto'], ['high', 'High'], ['medium', 'Medium'], ['low', 'Low']].map(([v, n]) => h('button.btn' + (g === v ? '' : '.alt'), { 'data-a': 'gfx', 'data-v': v, type: 'button', 'aria-pressed': g === v ? 'true' : 'false' }, n))); }
  let sp = ''; try { sp = window.PerfHUD && PerfHUD.buttonsHTML ? PerfHUD.buttonsHTML('btn alt') : ''; } catch (e) { }
  row('Info', h('button.btn.alt', { 'data-a': 'rules', type: 'button' }, 'How to play'), h('span.tinyc', { html: sp }));
  b.appendChild(h('p.sm', 'Final Approach is an original co-operative landing game. Names, text and art are original; audio credits are in How to play.'));
}
function renderDrawers() { if (!GX.open || !G) return; if (GX.open === 'logd') { const b = $('#logbody'); b.innerHTML = ''; b.appendChild(logHTML()); } if (GX.open === 'crewd') renderCrew(); if (GX.open === 'setd') renderMenu(); }
