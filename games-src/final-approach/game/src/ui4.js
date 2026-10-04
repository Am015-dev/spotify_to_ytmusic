// ===================== part 4: guided first flight (tips), end card, drawers =====================
var GUIDED_SCRIPT = [];
const TIPS = [
  { id: 'welcome', g: 1, when: () => G.phase === 'brief' && G.round === 0, t: 'Welcome aboard', x: 'You are Captain Ines Marlow, the Pilot (blue). Your co-pilot, Ravi, plays the orange side. Land the plane in seven rounds, one altitude row per round. This first flight is Port Alder, the friendliest airport. I will introduce one control at a time.' },
  { id: 'brief', g: 1, when: () => G.phase === 'brief' && G.round === 0, t: 'The briefing', x: 'Before each roll you may talk strategy: "we need to clear traffic", "let us move two spaces". You never say dice values. Tap a phrase to tell Ravi your plan, then press Roll. After the roll both of you stay silent: the dice you place are your only words.' },
  { id: 'dice', g: 1, when: () => G.phase === 'place' && G.round === 0, t: 'Your dice', x: 'Your four blue dice sit behind your screen at the bottom: only you can see them. Ravi’s orange dice are hidden from you. Players alternate: tap a die, then tap a glowing space on the panel. You must place every die.' },
  { id: 'axis', g: 1, when: () => G.phase === 'place' && G.round === 0 && myTurn(), t: 'Control 1: the axis', x: 'Each round both crew must put one die on the Axis. The plane tilts toward the higher die by the difference (5 against 3 tilts 2). Equal dice keep it level. A tilt of 3 is a spin: you lose at once. The tilt carries over, and the plane must be level when it lands.' },
  { id: 'engines', g: 1, when: () => G.phase === 'place' && G.round === 0 && myTurn(), t: 'Control 2: the engines', x: 'Both crew also put one die on the Engines. Add them: up to the blue marker the plane stays put, up to the orange marker it moves one space, above it moves two. Moving past a space that still holds a plane is a collision, and moving past the airport is an overshoot.' },
  { id: 'track', g: 1, when: () => G.phase === 'place' && G.round === 0, t: 'The approach track', x: 'The strip at the top is your route. Your plane is the glowing space. Planes in your way must be cleared before you leave their space. The airport is the last space: you must be there when the last altitude starts.' },
  { id: 'radio', g: 1, when: () => G.phase === 'place' && G.round === 0 && myTurn(), t: 'Control 3: the radio', x: 'A die on the Radio, any value, clears one plane. Count from your own space as 1: a 3 clears the plane on the space two ahead of you. The pilot has one radio space, the co-pilot has two.' },
  { id: 'alt', g: 1, when: () => G.round === 1 && G.phase === 'brief', t: 'The altitude track', x: 'Every round the plane sinks one row. The row also says who places first and whether a reroll token comes aboard. Seven rows, seven rounds: there is no waiting.' },
  { id: 'gear', g: 1, when: () => G.round === 1 && G.phase === 'place' && myTurn(), t: 'Control 4: landing gear', x: 'The pilot lowers the landing gear: any of the three spaces, a 1-2, a 3-4 and a 5-6. All three must be down to land. Each gear raises the blue engine marker, so slow speeds become easier and one-space moves harder.' },
  { id: 'flaps', g: 1, when: () => G.round === 2 && G.phase === 'place', t: 'Control 5: flaps', x: 'The co-pilot extends the flaps, in order from the top: 1-2, then 2-3, then 4-5, then 5-6. All four must be out to land. Each flap raises the orange marker, so a two-space move needs a bigger sum. Ravi handles these; watch how the markers move.' },
  { id: 'brakes', g: 1, when: () => G.round === 3 && G.phase === 'place' && myTurn(), t: 'Control 6: brakes', x: 'The brakes only matter in the last round, but they need exact values in order: a 2, then a 4, then a 6. In the final round your engine total must be no more than the brake value. Set them early.' },
  { id: 'conc', g: 1, when: () => G.round === 4 && G.phase === 'place' && myTurn(), t: 'Control 7: concentration and coffee', x: 'A die you cannot use anywhere can go on Concentration for a coffee token. Spend tokens on any later die to add or subtract 1 (never wrapping 1 to 6). Pick a die, then use the coffee buttons under it.' },
  { id: 'rr', g: 1, when: () => G.round >= 4 && G.rrHand > 0 && G.phase === 'place' && myTurn() && !G.pend, t: 'Reroll tokens', x: 'A reroll token lets both crew reroll any of their unplaced dice, once, behind their screens. Tokens come from the altitude track. Use one when your hand does not fit the jobs that are waiting.' },
  { id: 'final', g: 1, when: () => G.round === 6 && G.phase === 'brief', t: 'The landing round', x: 'This is the last round. The plane does not move: your engine total is compared with the brakes. To win by the end of the round: no planes left, all gear and flaps down, the axis exactly level, and the speed no greater than the brakes.' },
  { id: 'welcome2', g: 0, when: () => G.phase === 'brief' && G.round === 0, t: 'Briefing and silence', x: 'Talk strategy before you roll, never dice values. After the roll stay silent: your placements are your words.' }
];
function myTurn() { const v = viewSeat(); return typeof v === 'number' && v >= 0 && mayAct(v) && FA.pending(G).includes(v); }
function coachTick() {
  const c = UI.coach; if (!G || !UI.started || G.result || c.level === 'off') return;
  if (UI.mode === 'net' || UI.mode === 'hot' && UI.holder < 0) return;
  if (c.tip) return;
  for (const t of TIPS) { if (c.seen[t.id]) continue; if (t.g === 0 ? c.level === 'light' : (UI.mode === 'guided' || c.level === 'full' && t.g)) { let ok = false; try { ok = t.when(); } catch (e) { } if (ok) { if (c.level === 'light' && t.g) continue; c.tip = t.id; showTip(t); return; } } }
}
function showTip(t) {
  const pc = $('#pc'); if (!pc) return; pc.hidden = false; pc.innerHTML = '';
  const ids = TIPS.filter(x => x.g === 1).map(x => x.id), n = ids.indexOf(t.id) + 1;
  pc.append(h('div.ph-head', h('div.ph-t', h('b', t.t), h('span', t.g && n ? 'First flight, step ' + n + ' of ' + ids.length : 'Tip')), h('button.px', { type: 'button', 'data-a': 'tipok', 'aria-label': 'Close tip' }, '×')), h('div.ph-body', h('p', t.x), h('div.cbtns', h('button.btn.go', { type: 'button', 'data-a': 'tipok' }, 'Got it'), h('button.btn.alt', { type: 'button', 'data-a': 'tipoff' }, 'No more tips'))));
}
function tipOk() { const c = UI.coach, pc = $('#pc'); if (c.tip) c.seen[c.tip] = 1; c.tip = ''; if (pc) { pc.hidden = true; pc.innerHTML = ''; } setTimeout(coachTick, 150); }
// ---------- end card ----------
function closeRS() { const rs = $('#rs'); if (rs) { rs.hidden = true; rs.innerHTML = ''; } UI.rsOpen = false; }
function checkRows(c) {
  const rows = [['planes', 'No planes left on the approach track'], ['gear', 'All landing gear down'], ['flaps', 'All flaps out'], ['axis', 'Axis level'], ['speed', 'Speed no more than the brakes'], ['intern', 'Trainee fully trained'], ['ice', 'Icy-runway brakes finished']];
  return rows.filter(r => r[0] in c).map(r => h('div.chk', h('i.' + (c[r[0]] ? 'ok' : 'no'), c[r[0]] ? '✓' : '×'), r[1]));
}
function showFinal() {
  const rs = $('#rs'); if (!rs || !G || !G.result) return; UI.rsOpen = true; rs.hidden = false; rs.innerHTML = '';
  const R = G.result, sc = scenOf(), ap = D.airports[sc.ap];
  const stats = G.used || {};
  const box = h('div.rsbox.' + (R.win ? 'win' : 'lose'), { role: 'dialog', 'aria-label': 'Flight debrief' },
    h('h2', R.win ? 'Landed at ' + ap.name + '!' : 'Flight lost'),
    h('p', R.win ? 'The passengers applaud. ' + sc.title + ' is done' + (UI.mode === 'guided' ? ': you have flown the first flight.' : '.') : R.msg),
    h('div', checkRows(R.checks || {})),
    h('div.kv', h('span', 'Rounds flown'), h('b', (G.round + 1) + ' of ' + (D.rounds - G.row0))), h('div.kv', h('span', 'Coffee earned'), h('b', String(stats.coffeeGain || 0))), h('div.kv', h('span', 'Planes cleared by radio'), h('b', String(stats.radioClear || 0))), h('div.kv', h('span', 'Rerolls spent'), h('b', String(stats.rerollUse || 0))),
    h('div.cbtns', UI.mode === 'net' ? (typeof isHost === 'function' && isHost() ? h('button.btn.go', { type: 'button', 'data-a': 'again' }, 'Fly again') : h('span.sm', 'The host can start another flight.')) : h('button.btn.go', { type: 'button', 'data-a': 'again' }, 'Fly again'), UI.mode !== 'net' && R.win ? h('button.btn', { type: 'button', 'data-a': 'nextsc' }, 'Next airport') : null, h('button.btn.alt', { type: 'button', 'data-a': 'rsclose' }, 'Look at the panel'), h('button.btn.alt', { type: 'button', 'data-a': 'menu' }, 'Menu')));
  rs.appendChild(box);
}
// ---------- drawers ----------
function logHTML() { const e = h('div.logl'); for (let i = G.log.length - 1; i >= Math.max(0, G.log.length - 150); i--) e.appendChild(h('div.ll', h('span.lt', 'R' + G.log[i].r), ' ' + G.log[i].t)); return e; }
function buildRules() {
  const root = h('div.rules'), sec = (t, ...k) => { root.appendChild(h('h3', t)); k.forEach(x => root.appendChild(x)); };
  sec('The goal', h('p', 'You and your crewmate fly an airliner onto the runway. You are the Pilot (blue) and the Co-pilot (orange). You win or lose together. The game lasts seven rounds, one altitude row each. By the end of the last round the plane must be on the airport with a clear track, the gear and flaps down, a level axis, and a slow enough speed.')));
  sec('How a round goes', h('ol', ...['Round start: the altitude row appears (it may bring a reroll token), and the traffic die may add planes.', 'Briefing: talk strategy, never dice values. Then both crew roll four dice behind their screens.', 'Silence. The first player (shown on the altitude row) puts one die on a free space of their colour, then you alternate until all eight dice are used.', 'End of round: both axis and both engine dice must be there. The plane sinks one row and the dice come back.'].map(t => h('li', t))));
  sec('Every control', h('ul', ...[
    'Axis (both, mandatory): the plane tilts toward the higher die by the difference. Tilt of 3 = spin = lost. It never resets.',
    'Engines (both, mandatory): the sum against the two markers (blue starts at 4, orange at 8): 0, 1 or 2 spaces. Leaving a space with a plane is a collision; passing the airport is an overshoot.',
    'Radio: pilot one space, co-pilot two, any value. It removes a plane from the space that many steps ahead (1 = your own space).',
    'Landing gear (pilot): 1-2, 3-4, 5-6 in any order. Each raises the blue marker by one.',
    'Flaps (co-pilot): 1-2, 2-3, 4-5, 5-6 strictly in order. Each raises the orange marker by one.',
    'Brakes (pilot): exactly 2, then 4, then 6. They only count in the last round.',
    'Concentration: any die, a coffee token (up to 3). Spend tokens to add or subtract 1 from any die you place (1 to 6, no wrapping).',
    'Reroll token: both crew may reroll any of their unplaced dice once.'].map(t => h('li', t))));
  sec('The last round', h('p', 'The plane does not move. Your engine total must be no more than the brake value (and the brakes must be at least 2). At the end of the round you win only if every one of these holds: no planes left, all gear and flaps down, the axis level, and that speed check passed.')));
  sec('You lose at once if', h('ul', ...['the tilt reaches 3', 'an axis or engine die is missing at the end of a round', 'you leave a space that holds a plane, or pass the airport', 'the last altitude starts and you are not at the airport', 'the fuel runs out (fuel scenarios)', 'your final speed is above the brakes'].map(t => h('li', t))));
  sec('Modules', h('div', ...Object.keys(D.mods).map(k => h('div.rcard', h('div.rt', h('b', D.mods[k].name), h('div', D.mods[k].text))))));
  sec('Ability cards', h('div', ...Object.keys(D.abilities).map(k => h('div.rcard', h('div.rt', h('b', D.abilities[k].name), h('div', D.abilities[k].text))))));
  sec('Playing on a phone', h('ul', ...['Tap a die in your tray, then tap a glowing space. Tap the die again to put it back.', 'Coffee buttons appear under the selected die when you hold tokens.', 'Hot-seat: a pass screen hides everything between turns. Online: you only ever see your own dice.', 'Hint shows what the computer crew would do and why.'].map(t => h('li', t))));
  root.appendChild(h('div', { html: '<section class="credits-audio"><h3>Credits</h3><p>Sound effects and jingles by Kenney (kenney.nl, CC0); ambience and music from OpenGameArt contributors under CC0 (full list in the licence log). Painted art is original and made by the generator in the repository. Names, text and art are original; the rules follow the rulebook.</p></section>' }));
  return root;
}
function buildRef() {
  const root = h('div.rules'), tr = (t, ...k) => { root.appendChild(h('h3', t)); k.forEach(x => root.appendChild(x)); };
  tr('Every airport and scenario (21)', h('div', ...['green', 'yellow', 'red', 'black'].map(col => h('div', h('div.band', h('i', { style: 'background:' + D.diffs[col].c }), D.diffs[col].name + ' (' + D.scenarios.filter(s => s.col === col).length + ')'), ...D.scenarios.filter(s => s.col === col).map(s => { const t = D.tracks[s.trk]; return h('div.rcard', h('div.rt', h('b', D.airports[s.ap].name + ': ' + s.title), h('div.sm', t.size + ' spaces, ' + t.sp.reduce((a, x) => a + x[0], 0) + ' planes at the start' + (s.mods.length ? ', ' + s.mods.map(m => D.mods[m].name).join(', ') : '') + (t.sp.some(x => x[2]) ? ', ' + D.mods.turns.name : '') + (t.sp.some(x => x[1]) ? ', ' + D.mods.traffic.name : '') + (s.ab ? ', ' + s.ab + ' ability card' + (s.ab > 1 ? 's' : '') : '')))); })))));
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
  if (!(typeof NET !== 'undefined' && NET.on)) { row('Computer speed', ...[['Fast', 150], ['Normal', 650], ['Slow', 1300]].map(([n, v]) => h('button.btn' + (AIDELAY === v ? '' : '.alt'), { 'data-a': 'speed', 'data-v': v, type: 'button' }, n))); row('Guide', ...['full', 'light', 'off'].map(n => h('button.btn' + ((UI.coach.level || UI.prefs.guide) === n ? '' : '.alt'), { 'data-a': 'guide', 'data-v': n, type: 'button' }, n[0].toUpperCase() + n.slice(1)))); }
  row('Sound', tog('sound', UI.prefs.sound, 'Sound effects'), tog('music', UI.prefs.music, 'Music'));
  { const g = UI.prefs.gfx || 'auto'; row('Graphics' + (typeof PX !== 'undefined' && PX.on ? (g === 'auto' ? ' (now ' + PX.q + ')' : '') : ' (simple view)'), ...[['auto', 'Auto'], ['high', 'High'], ['medium', 'Medium'], ['low', 'Low']].map(([v, n]) => h('button.btn' + (g === v ? '' : '.alt'), { 'data-a': 'gfx', 'data-v': v, type: 'button', 'aria-pressed': g === v ? 'true' : 'false' }, n))); }
  let sp = ''; try { sp = window.PerfHUD && PerfHUD.buttonsHTML ? PerfHUD.buttonsHTML('btn alt') : ''; } catch (e) { }
  row('Info', h('button.btn.alt', { 'data-a': 'rules', type: 'button' }, 'How to play'), h('span.tinyc', { html: sp }));
  b.appendChild(h('p.sm', 'Final Approach is an original co-operative landing game. Names, text and art are original; audio credits are in How to play.'));
}
function renderDrawers() { if (!GX.open || !G) return; if (GX.open === 'logd') { const b = $('#logbody'); b.innerHTML = ''; b.appendChild(logHTML()); } if (GX.open === 'crewd') renderCrew(); if (GX.open === 'setd') renderMenu(); }
