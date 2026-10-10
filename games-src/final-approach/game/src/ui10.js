// ===================== part 10: help (gx-help kit): coach bubbles the first time, the lightbulb on demand, rules cards =====================
// Bubbles: once per phase, short, pointing at the panel. The bulb: the computer crew's own move (FA.AI.move, the same one the ghost finger uses) + a short why + rules cards.
// ---------------------------------------------------------------- pictures for the rules cards (inline SVG in the cockpit's colours)
const hB = '#2f6fd0', hO = '#e8821f', hK = '#14202c', hG = '#f2b92c', hC = '#fff4dc';
const HP = {
  plane: () => '<svg viewBox="0 0 64 64"><path d="M32 6l5 20 21 12v6l-21-4 0 12 6 5v4l-11-3-11 3v-4l6-5V40l-21 4v-6l21-12z" fill="#e8f0f6" stroke="' + hK + '" stroke-width="2.5" stroke-linejoin="round"/></svg>',
  strip: () => '<svg viewBox="0 0 64 64"><rect x="3" y="20" width="58" height="24" rx="5" fill="#2c3e4c" stroke="' + hK + '" stroke-width="2.5"/><path d="M22 20v24M42 20v24" stroke="#8f9daa" stroke-width="2"/><path d="M10 32l5-2v4zM29 28l3 4-3 4-3-4zM48 28l3 4-3 4-3-4z" fill="' + hC + '"/><rect x="47" y="14" width="12" height="6" rx="2" fill="' + hG + '"/></svg>',
  air: () => '<svg viewBox="0 0 64 64"><rect x="4" y="38" width="56" height="14" rx="3" fill="#44525e" stroke="' + hK + '" stroke-width="2.5"/><path d="M12 45h8M28 45h8M44 45h8" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M26 12l3 10 11 6v3l-11-2v6l3 2v2l-6-1.500-6 1.500v-2l3-2v-6l-11 2v-3l11-6z" fill="#e8f0f6" stroke="' + hK + '" stroke-width="2" stroke-linejoin="round" transform="translate(4 0) scale(.9)"/></svg>',
  die: (n, c) => '<svg viewBox="0 0 64 64"><rect x="10" y="10" width="44" height="44" rx="9" fill="' + (c === 'o' ? hO : hB) + '" stroke="' + hK + '" stroke-width="3"/><text x="32" y="43" text-anchor="middle" font-size="30" font-weight="800" fill="#fff" font-family="Arial,sans-serif">' + (n == null ? '?' : n) + '</text></svg>',
  dice2: () => '<svg viewBox="0 0 64 64"><rect x="4" y="16" width="30" height="30" rx="7" fill="' + hB + '" stroke="' + hK + '" stroke-width="2.5"/><rect x="32" y="22" width="28" height="28" rx="7" fill="' + hO + '" stroke="' + hK + '" stroke-width="2.5"/><circle cx="14" cy="26" r="2.500" fill="#fff"/><circle cx="24" cy="36" r="2.500" fill="#fff"/><circle cx="42" cy="32" r="2.500" fill="#fff"/><circle cx="50" cy="40" r="2.500" fill="#fff"/><circle cx="50" cy="32" r="2.500" fill="#fff"/><circle cx="42" cy="40" r="2.500" fill="#fff"/></svg>',
  speech: () => '<svg viewBox="0 0 64 64"><path d="M8 12h48a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H30l-12 12V44H8a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z" fill="' + hC + '" stroke="' + hK + '" stroke-width="3" stroke-linejoin="round"/><path d="M14 24h36M14 33h22" stroke="' + hB + '" stroke-width="4" stroke-linecap="round"/></svg>',
  mute: () => '<svg viewBox="0 0 64 64"><path d="M8 12h48a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H30l-12 12V44H8a4 4 0 0 1-4-4V16a4 4 0 0 1 4-4z" fill="' + hC + '" stroke="' + hK + '" stroke-width="3" stroke-linejoin="round"/><path d="M16 38L48 18M16 18l32 20" stroke="#d8402c" stroke-width="5" stroke-linecap="round"/></svg>',
  seatP: () => '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="' + hB + '" stroke="#fff" stroke-width="3"/><text x="32" y="43" text-anchor="middle" font-size="30" font-weight="800" fill="#fff" font-family="Arial,sans-serif">P</text></svg>',
  seatC: () => '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="' + hO + '" stroke="#fff" stroke-width="3"/><text x="32" y="43" text-anchor="middle" font-size="30" font-weight="800" fill="#fff" font-family="Arial,sans-serif">C</text></svg>',
  alt: () => '<svg viewBox="0 0 64 64"><rect x="6" y="6" width="52" height="11" rx="4" fill="' + hB + '"/><rect x="6" y="20" width="52" height="11" rx="4" fill="' + hO + '"/><rect x="6" y="34" width="52" height="11" rx="4" fill="' + hB + '"/><circle cx="50" cy="26" r="4" fill="#9a4fe0" stroke="#fff" stroke-width="1.500"/><path d="M12 52h40" stroke="' + hG + '" stroke-width="3" stroke-dasharray="4 4"/><path d="M32 60l-5-6h10z" fill="' + hG + '"/></svg>',
  axis: (tilt) => '<svg viewBox="0 0 64 64"><g transform="rotate(' + (tilt || 0) + ' 32 24)"><path d="M6 24h52" stroke="' + hK + '" stroke-width="4" stroke-linecap="round"/><path d="M6 24l-4 18h16zM58 24l-4 18h-16z" fill="#8f9daa" stroke="' + hK + '" stroke-width="2.500" stroke-linejoin="round"/></g><circle cx="32" cy="24" r="5" fill="' + hG + '" stroke="' + hK + '" stroke-width="2"/><path d="M32 29v24M20 56h24" stroke="' + hK + '" stroke-width="4" stroke-linecap="round"/></svg>',
  prop: () => '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="#2c3e4c" stroke="' + hK + '" stroke-width="2.500"/><path d="M32 32C26 22 28 10 32 8c4 2 6 14 0 24zM32 32c10-6 22-4 24 0-2 4-14 6-24 0zM32 32c6 10 4 22 0 24-4-2-6-14 0-24zM32 32c-10 6-22 4-24 0 2-4 14-6 24 0z" fill="#dbe3ea" stroke="' + hK + '" stroke-width="1.500"/><circle cx="32" cy="32" r="4" fill="' + hG + '"/></svg>',
  gauge: () => '<svg viewBox="0 0 64 64"><path d="M6 46a26 26 0 0 1 52 0z" fill="#1c2c38" stroke="' + hK + '" stroke-width="2.500"/><path d="M13 44a20 20 0 0 1 8-15" stroke="' + hB + '" stroke-width="5" fill="none"/><path d="M51 44a20 20 0 0 0-8-15" stroke="' + hO + '" stroke-width="5" fill="none"/><path d="M32 46L44 24" stroke="#fff" stroke-width="3" stroke-linecap="round"/><circle cx="32" cy="46" r="4" fill="' + hG + '"/><text x="14" y="58" font-size="11" font-weight="800" fill="' + hB + '" font-family="Arial,sans-serif">≤4</text><text x="40" y="58" font-size="11" font-weight="800" fill="' + hO + '" font-family="Arial,sans-serif">≤8</text></svg>',
  radio: () => '<svg viewBox="0 0 64 64"><circle cx="32" cy="38" r="5" fill="' + hG + '" stroke="' + hK + '" stroke-width="2"/><path d="M20 28a17 17 0 0 0 0 20M44 28a17 17 0 0 1 0 20M12 20a29 29 0 0 0 0 36M52 20a29 29 0 0 1 0 36" stroke="#fff" stroke-width="3.500" stroke-linecap="round" fill="none"/><path d="M32 43v14" stroke="#fff" stroke-width="3.500" stroke-linecap="round"/></svg>',
  gear: () => '<svg viewBox="0 0 64 64"><path d="M32 6v30M20 36h24" stroke="#8f9daa" stroke-width="5" stroke-linecap="round"/><circle cx="20" cy="46" r="9" fill="#2c3e4c" stroke="#e8f0f6" stroke-width="3"/><circle cx="44" cy="46" r="9" fill="#2c3e4c" stroke="#e8f0f6" stroke-width="3"/><circle cx="20" cy="46" r="3" fill="#8f9daa"/><circle cx="44" cy="46" r="3" fill="#8f9daa"/></svg>',
  flap: () => '<svg viewBox="0 0 64 64"><path d="M4 22L60 10v12L4 34z" fill="#e8f0f6" stroke="' + hK + '" stroke-width="2.500" stroke-linejoin="round"/><path d="M4 34L60 22v8L40 44 4 44z" fill="' + hO + '" stroke="' + hK + '" stroke-width="2.500" stroke-linejoin="round"/><path d="M10 52h44" stroke="' + hK + '" stroke-width="3" stroke-linecap="round" stroke-dasharray="3 5"/></svg>',
  brake: (n) => '<svg viewBox="0 0 64 64"><rect x="6" y="14" width="52" height="36" rx="9" fill="#5a2a22" stroke="#e8f0f6" stroke-width="3"/><text x="32" y="40" text-anchor="middle" font-size="26" font-weight="800" fill="#fff" font-family="Arial,sans-serif">' + (n == null ? '2' : n) + '</text></svg>',
  cup: () => '<svg viewBox="0 0 64 64"><path d="M12 22h34v18a14 14 0 0 1-14 14h-6a14 14 0 0 1-14-14z" fill="#e8f0f6" stroke="' + hK + '" stroke-width="3" stroke-linejoin="round"/><path d="M46 28h4a7 7 0 0 1 0 14h-6" fill="none" stroke="' + hK + '" stroke-width="3"/><path d="M22 6c-3 4 3 6 0 10M32 6c-3 4 3 6 0 10" stroke="#8f9daa" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M16 30h26" stroke="#6b4a2a" stroke-width="5"/></svg>',
  plus: () => '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="#6b4a2a" stroke="#fff" stroke-width="3"/><path d="M32 20v24M20 32h24" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>',
  reroll: () => '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="#8a4fd8" stroke="#fff" stroke-width="3"/><path d="M20 30a12 12 0 0 1 21-6M44 34a12 12 0 0 1-21 6" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M42 16v10H32zM22 48V38h10z" fill="#fff"/></svg>',
  tap: () => '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="18" fill="rgba(242,185,44,.2)" stroke="' + hG + '" stroke-width="4"/><path d="M30 14v26l-6-5-4 4 14 14h14l4-20-8-2-4-4-4 1-2-4z" fill="#fff" stroke="' + hK + '" stroke-width="2.500" stroke-linejoin="round"/></svg>',
  aside: () => '<svg viewBox="0 0 64 64"><rect x="8" y="14" width="30" height="30" rx="7" fill="' + hB + '" stroke="' + hK + '" stroke-width="2.500"/><path d="M42 40l16 12M58 40L42 52" stroke="#d8402c" stroke-width="5" stroke-linecap="round"/><text x="23" y="36" text-anchor="middle" font-size="20" font-weight="800" fill="#fff" font-family="Arial,sans-serif">?</text></svg>',
  stop: () => '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="#d8402c" stroke="#fff" stroke-width="3"/><path d="M21 21l22 22M43 21L21 43" stroke="#fff" stroke-width="6" stroke-linecap="round"/></svg>',
  star: () => '<svg viewBox="0 0 64 64"><path d="M32 6l7.500 17 18.500 1.600-14 12 4.400 18.400L32 45l-16.400 10 4.400-18.400-14-12L24.500 23z" fill="' + hG + '" stroke="#8a6a1a" stroke-width="3" stroke-linejoin="round"/></svg>',
  token: () => '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="22" fill="#2f9a4a" stroke="#fff" stroke-width="3"/><text x="32" y="41" text-anchor="middle" font-size="26" font-weight="800" fill="#fff" font-family="Arial,sans-serif">4</text></svg>',
  swap: () => '<svg viewBox="0 0 64 64"><rect x="4" y="20" width="22" height="22" rx="6" fill="' + hB + '" stroke="' + hK + '" stroke-width="2.500"/><rect x="38" y="20" width="22" height="22" rx="6" fill="' + hO + '" stroke="' + hK + '" stroke-width="2.500"/><path d="M28 26h8M32 22l4 4-4 4M36 38h-8M32 34l-4 4 4 4" stroke="' + hK + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/></svg>'
};
function hpics(items) { return '<div class="gxh-pics">' + items.map(it => it === '>' ? '<span class="gxh-ar">&rarr;</span>' : '<figure>' + (HP[it[0]] ? HP[it[0]](it[2], it[3]) : '') + (it[1] ? '<figcaption>' + it[1] + '</figcaption>' : '') + '</figure>').join('') + '</div>'; }
// ---------------------------------------------------------------- where each bubble points
const hq = s => () => document.querySelector(s);
const hfirst = (...sels) => () => { for (const s of sels) { const e = document.querySelector(s); if (e && e.getBoundingClientRect().width) return e; } return null; };
const hmine = () => document.querySelector('#pz .tray.' + (actSeat() === 1 ? 'c' : 'p'));
const HLP_STEPS = {
  brief: { target: hfirst('#says .say', '#acts [data-a=ready]'), title: 'Plan, then roll', text: 'Tap a phrase to tell your partner a plan, never dice values. Then tap Roll.', pic: () => HP.speech() },
  die: { target: hfirst('#pz .tray.p .die.can', '#pz .tray.c .die.can', '#pz .tray'), title: 'Pick a die', text: 'Only you see these dice. Tap one, then a glowing space.', pic: () => HP.dice2() },
  space: { target: hfirst('#pz .slot.legal'), title: 'Tap a glowing space', text: 'Tap a glowing space to place it. Tap the die again to undo.' },
  rr: { target: hfirst('#acts [data-a=rrpick]', '#pz .tray .die.can'), title: 'Choose dice to reroll', text: 'Tap the dice you want to roll again, then tap the green button. None is fine.', pic: () => HP.reroll() },
  token: { target: hfirst('#pz .die[data-d=p]', '#pz .tray'), title: 'Place the extra die', text: 'This die must be placed too. Tap it, then a glowing space.', pic: () => HP.token() },
  swap: { target: hfirst('#pz .tray.p .die.can', '#pz .tray.c .die.can', '#pz .tray'), title: 'Hand-over swap', text: 'Your partner offered a die. Pick one of yours to swap with it.', pic: () => HP.swap() }
};
// the learning ladder (story chapters 1-6): one bubble the first time each system is on the panel, and its own rules cards
const LADSYS = ['', 'axis', 'engines', 'radio', 'gear', 'brakes', 'conc'];
Object.assign(HLP_STEPS, {
  'sys-axis': { target: hq('#pz .dial.axd'), title: 'Keep it level', text: 'Drop a die on the axis. The plane tilts toward the higher die. Equal dice keep it level.', pic: () => HP.axis(0) },
  'sys-engines': { target: hq('#pz .gau'), title: 'Engines set speed', text: 'The two engine dice add up to your speed. Low holds, medium moves one space, high two.', pic: () => HP.gauge() },
  'sys-radio': { target: hfirst('#pz .slot[data-slot=ra0]'), title: 'Clear the way', text: 'The radio clears a plane ahead. A 1 clears your space, a 2 the next one, and so on.', pic: () => HP.radio() },
  'sys-gear': { target: hfirst('#pz .slot[data-slot=lg0]'), title: 'Wheels and flaps', text: 'Gear takes 1-2, 3-4, 5-6; flaps go in order. Land with all of them down.', pic: () => HP.gear() },
  'sys-brakes': { target: hfirst('#pz .badge.brk', '#pz .slot[data-slot=br0]'), title: 'Brakes', text: 'Brakes set how fast you may land. Place 2, then 4, then 6. Landing speed must stay within them.', pic: () => HP.brake(4) },
  'sys-conc': { target: hfirst('#pz .slot[data-slot=co0]', '#pz .chipr'), title: 'Coffee and rerolls', text: 'A die on a coffee space earns a token to nudge a later die by one. Rerolls redo your dice.', pic: () => HP.cup() }
});
// ---------------------------------------------------------------- the rules cards (<= 20 words each, a picture each): every cockpit slot, in plain words
const HLP_RULES = [
  { phase: 'sys-axis', title: 'How to win', text: 'Land with the plane level. Seven rounds, and both crew put a die on the axis every round.', pic: () => hpics([['plane', 'Both crew'], '>', ['axis', 'Level', 0]]) },
  { phase: 'sys-axis', title: 'Higher die wins', text: 'The plane tilts toward the higher die, by the difference. Equal dice change nothing.', pic: () => hpics([['axis', 'Higher side', 12], ['axis', 'Equal: level', 0]]) },
  { phase: 'sys-axis', title: 'A tilt of 3 is a spin', text: 'Answer your partner’s die with a close one. A spin loses the flight at once.', pic: () => hpics([['stop', 'Tilt 3']]) },
  { phase: 'sys-engines', title: 'Speed from two dice', text: 'Both crew put a die on the engines. Together they make your speed.', pic: () => hpics([['prop', 'Two dice'], '>', ['gauge', 'Speed']]) },
  { phase: 'sys-engines', title: 'Blue and orange', text: 'Up to the blue marker you stay. Up to orange you move one space. Above it, two.', pic: () => hpics([['gauge', 'Markers']]) },
  { phase: 'sys-engines', title: 'Stop on the airport', text: 'Reach the airport before the last round, then hold. Too fast overshoots the runway.', pic: () => hpics([['strip', 'Approach'], '>', ['air', 'Airport']]) },
  { phase: 'sys-radio', title: 'Planes block you', text: 'Leaving a space with a plane in it is a collision. Clear the way first.', pic: () => hpics([['strip', 'Plane ahead']]) },
  { phase: 'sys-radio', title: 'The radio counts ahead', text: 'A die of 1 clears your own space, 2 the next one, 3 the one after.', pic: () => hpics([['radio', 'Radio'], '>', ['strip', 'Clear it']]) },
  { phase: 'sys-radio', title: 'Pilot one, co-pilot two', text: 'The pilot has one radio space, the co-pilot two. Any value works.', pic: () => hpics([['seatP', 'One'], ['seatC', 'Two']]) },
  { phase: 'sys-gear', title: 'Landing gear', text: 'Three gear spaces take 1-2, 3-4 and 5-6, in any order. Only the pilot uses them.', pic: () => hpics([['gear', 'Pilot: gear']]) },
  { phase: 'sys-gear', title: 'Flaps in order', text: 'Four flap spaces take 1-2, 2-3, 4-5, 5-6, top to bottom. Co-pilot only.', pic: () => hpics([['flap', 'Co-pilot: flaps']]) },
  { phase: 'sys-gear', title: 'All down to land', text: 'Each gear and flap raises a speed marker. Every one must be down at the landing.', pic: () => hpics([['gear', 'Gear'], ['flap', 'Flaps'], '>', ['air', 'Land']]) },
  { phase: 'sys-brakes', title: 'Set the brakes', text: 'Brake spaces take exactly 2, then 4, then 6, in that order. Only the pilot uses them.', pic: () => hpics([['brake', 'First', 2], ['brake', 'Then', 4], ['brake', 'Last', 6]]) },
  { phase: 'sys-brakes', title: 'Speed within the brakes', text: 'In the last round the plane stops: the engine total must be no more than the brakes.', pic: () => hpics([['gauge', 'Speed'], '>', ['brake', 'Brakes', 4]]) },
  { phase: 'sys-conc', title: 'Coffee tokens', text: 'A die on a coffee space earns a token. Spend one to change a die by one.', pic: () => hpics([['die', 'Spare', 2], '>', ['cup', 'Coffee'], '>', ['plus', '+1 / -1']]) },
  { phase: 'sys-conc', title: 'Reroll tokens', text: 'A reroll token lets both crew roll their unplaced dice again, once.', pic: () => hpics([['reroll', 'Token'], '>', ['dice2', 'New dice']]) },
  { phase: 'sys-conc', title: 'Now the full game', text: 'You know every control. Later flights hide each crew’s dice and add fuel, wind and more.', pic: () => hpics([['plane', 'Full game']]) },
  { title: 'How to win', text: 'Land together in the last round: clear all planes, lower gear and flaps, level the axis, slow down.', pic: () => hpics([['plane', 'Both crew'], '>', ['air', 'Land']]) },
  { title: 'One round', text: 'Share a plan, roll, then take turns placing one die each. You never say dice values.', pic: () => hpics([['speech', 'Plan'], '>', ['dice2', 'Roll'], '>', ['tap', 'Place']]) },
  { title: 'Win or lose together', text: 'A spin, a crash, an empty Axis or Engines space, or a failed landing loses for both.', pic: () => hpics([['stop', 'Any one']]) },
  { phase: 'brief', title: 'Talk plans, not dice', text: 'Tap a phrase to share a plan. Never say the values of your dice. Then tap Roll my dice.', pic: () => hpics([['speech', 'Plan'], '>', ['dice2', 'Roll']]) },
  { phase: 'brief', title: 'Then stay silent', text: 'After the roll your placed dice are your only words. Watch where your partner puts theirs.', pic: () => hpics([['mute', 'Silence'], '>', ['die', 'Your word', 4]]) },
  { phase: 'brief', title: 'Blue and orange', text: 'Pilot is blue, Co-pilot orange. Blue spaces are the Pilot’s, orange the Co-pilot’s. Grey spaces take either.', pic: () => hpics([['seatP', 'Pilot'], ['seatC', 'Co-pilot']]) },
  { phase: 'brief', title: 'The altitude strip', text: 'One row per round. Its colour says who places first. A purple dot adds a reroll token.', pic: () => hpics([['alt', 'One per round'], ['reroll', 'Reroll']]) },
  { phase: 'die', title: 'Axis: every round', text: 'Both crew put a die on the Axis. The plane tilts toward the higher die. Tilt of 3 loses.', pic: () => hpics([['axis', 'Higher side', 12], ['axis', 'Equal: level', 0]]) },
  { phase: 'die', title: 'Engines: every round', text: 'Both fill the Engines. Sum: up to blue marker stays, up to orange moves 1, above moves 2.', pic: () => hpics([['prop', 'Two dice'], '>', ['gauge', 'Speed']]) },
  { phase: 'die', title: 'Radio clears planes', text: 'A die on the Radio clears one plane that many spaces ahead. Your own space counts as 1.', pic: () => hpics([['radio', 'Radio'], '>', ['strip', 'Clear a plane']]) },
  { phase: 'die', title: 'Rerolls and Coffee', text: 'A reroll token rerolls all unplaced dice, for both crew. Spare dice earn Coffee tokens.', pic: () => hpics([['reroll', 'Reroll'], ['cup', 'Coffee']]) },
  { phase: 'space', title: 'Gear and flaps', text: 'Pilot lowers three gears, Co-pilot extends four flaps in order. All must be done to land.', pic: () => hpics([['gear', 'Pilot: gear'], ['flap', 'Co-pilot: flaps']]) },
  { phase: 'space', title: 'Brakes: 2, then 4, then 6', text: 'Set the brakes in order, exact values. In the last round your engine total must stay within them.', pic: () => hpics([['brake', 'First', 2], ['brake', 'Then', 4], ['brake', 'Last', 6]]) },
  { phase: 'space', title: 'Coffee tokens', text: 'A die on a Coffee space earns a token. Spend tokens to change a later die by 1.', pic: () => hpics([['die', 'Spare', 2], '>', ['cup', 'Coffee'], '>', ['plus', '+1 / -1']]) },
  { phase: 'space', title: 'Nothing fits?', text: 'If no space takes the die, tap Put it aside. Coffee can change its value by one first.', pic: () => hpics([['aside', 'Put aside']]) },
  { phase: 'rr', title: 'Reroll tokens', text: 'Spending a token lets both crew reroll any unplaced dice, once. Either crew can spend one any time.', pic: () => hpics([['reroll', 'Token'], '>', ['dice2', 'New dice']]) },
  { phase: 'rr', title: 'Pick the odd ones', text: 'Tap only the dice that do not fit the open jobs. Tap the green button to confirm.', pic: () => hpics([['die', 'Keep', 3], ['die', 'Reroll', 1]]) },
  { phase: 'token', title: 'Extra die', text: 'Some twists give a die you must place right away. Tap it, then a glowing space.', pic: () => hpics([['token', 'Extra die'], '>', ['tap', 'Place it']]) },
  { phase: 'token', title: 'Same spaces as always', text: 'It goes on the same spaces as your other dice, with the same rules. Coffee can bend it.', pic: () => hpics([['token', 'Extra'], ['cup', 'Coffee']]) },
  { phase: 'swap', title: 'Hand-over', text: 'Both crew swap one die, without saying the values. Pick which of yours to give.', pic: () => hpics([['swap', 'Swap']]) },
  { phase: 'swap', title: 'Pick a spare', text: 'Give the die that fits your open jobs least. You still must place every die.', pic: () => hpics([['die', 'Give', 5], '>', ['die', 'Get', '?', 'o']]) }
];
// ---------------------------------------------------------------- phases: null when the player has nothing to decide
function hlpPhase() {
  try {
    if (!G || !UI.started || G.result) return null;
    const v = actSeat(); if (typeof v !== 'number' || v < 0 || !mayAct(v) || !myTurn()) return null;
    if (G.phase === 'brief') return 'brief';
    if (G.lad && G.phase === 'place' && !G.pend && G.turn === v) return 'sys-' + LADSYS[G.lad];
    if (G.phase !== 'place') return null;
    if (G.pend) return G.pend.h === 'rr' ? 'rr' : G.pend.h === 'wt' ? 'swap' : 'token';
    if (G.turn !== v) return null;
    return typeof UI.sel === 'number' && UI.sel >= 0 ? 'space' : 'die';
  } catch (e) { return null; }
}
// ---------------------------------------------------------------- the advice: the computer crew's move, in a few words
function capW(t, n) { const w = String(t || '').replace(/\s+/g, ' ').trim().split(' '); return w.length <= n ? w.join(' ') : ''; }
function hlpWhy(m, v) {
  if (m.t === 'say') return 'A short plan helps your partner. Never say dice values.';
  if (m.t === 'ready') return 'Plans are shared. Roll your dice.';
  if (m.t === 'rr') return 'Your hand does not fit the open jobs: spend a reroll.';
  if (m.t === 'toss') return 'Nothing takes this die: put it aside.';
  if (m.t !== 'place') return '';
  const val = m.d === 'p' ? G.pend.d.val : G.dice[v][m.d].v, S = FA.SLOT[m.to], o = 1 - v;
  switch (S.grp) {
    case 'radio': { const at = G.pl.pos + val - 1, n = at >= 1 && at <= G.planes.length ? G.planes[at - 1] : 0; return n ? 'A ' + val + ' on the radio clears the plane on ' + (at === G.planes.length ? 'the airport' : 'space ' + at) + '.' : 'The radio clears nothing here: this just uses up a spare die.'; }
    case 'axis': { const x = G.slots['ax' + o]; if (x) { const nx = G.pl.axis + (v === 0 ? x.v - val : val - x.v); return 'Axis ' + val + ' against ' + x.v + ': the plane ends ' + (nx === 0 ? 'level' : 'tilted ' + Math.abs(nx) + (nx < 0 ? ' left' : ' right')) + '.'; } return 'The Axis goes first: a middle value leaves the most room.'; }
    case 'engines': { const x = G.slots['en' + o]; if (x) { const sm = val + x.v + FA.windMod(G); if (FA.isFinal(G)) return 'Landing speed ' + sm + ' against brakes ' + FA.brakeVal(G) + '.'; const adv = sm <= G.pl.aeroB ? 0 : sm <= G.pl.aeroO ? 1 : 2; return 'Engines total ' + sm + ': the plane ' + (adv ? 'moves ' + adv + (adv > 1 ? ' spaces' : ' space') : 'stays put') + '.'; } return 'Engines: you set half the speed, your partner adds the rest.'; }
    case 'gear': return 'Lowers a landing gear. All three must be down to land.';
    case 'flaps': return 'Extends a flap. All four must be out to land.';
    case 'brakes': case 'ice': return 'Sets a brake. The last-round speed must stay within it.';
    case 'conc': return 'A spare die on Coffee earns a token to bend a later die by one.';
    case 'kero': return 'Fuel space: this burns ' + val + ', skipping it burns ' + D.keroSkip + '.';
    case 'intern': return 'This trains the trainee: place the next token too.';
  }
  return '';
}
const hlpDie = (v, d) => document.querySelector(d === 'p' ? '#pz .die[data-d="p"]' : '#pz .die[data-s="' + v + '"][data-d="' + d + '"]');
// one plan for the glow, the finger and the bulb: { to: element getter, from: element getter | null, why }
function hlpPlan() {
  if (!G || G.result || UI.dragging) return null;
  const v = actSeat(); if (typeof v !== 'number' || v < 0 || !myTurn()) return null;
  let m = null; try { m = FA.AI.move(G, v, 'normal', { noMC: true }); } catch (e) { return null; }
  if (!m) return null;
  const why = capW(hlpWhy(m, v), 15); if (!why) return null;
  const sel = typeof UI.sel === 'number' ? UI.sel : -1;
  if (m.t === 'say') { const q = '#says [data-a=say][data-c="' + m.c + '"]'; return (e => e && e.getBoundingClientRect().width > 0)(document.querySelector(q)) ? { m, why, to: () => document.querySelector(q), from: null } : null; }
  if (m.t === 'ready') return { m, why, to: () => document.querySelector('#acts [data-a=ready]'), from: null };
  if (m.t === 'rr') return G.pend ? null : { m, why, to: () => document.querySelector('#acts [data-a=rr]'), from: null };
  if (m.t === 'toss') { if (!hlpDie(v, m.d)) return null; return sel === m.d && document.querySelector('#acts [data-a=toss]') ? { m, why, to: () => document.querySelector('#acts [data-a=toss]'), from: null } : { m, why, to: () => hlpDie(v, m.d), from: null }; }
  if (m.t !== 'place' || m.c || typeof m.d === 'undefined') return null;   // a coffee move needs two taps the finger cannot show: rules cards only
  if (!hlpDie(v, m.d) || !document.querySelector('#pz .slot[data-slot="' + m.to + '"]')) return null;
  return { m, why, to: () => document.querySelector('#pz .slot[data-slot="' + m.to + '"]'), from: sel === m.d ? null : () => hlpDie(v, m.d) };
}
function hlpSuggest() { const p = hlpPlan(); return p && p.to() ? { why: p.why, key: p.m.t + ':' + (p.m.to || p.m.c || p.m.d), target: p.to, from: p.from } : null; }
// ---------------------------------------------------------------- wiring
let _hlpInit = false;
function hlpInit() {
  if (_hlpInit || typeof GXH === 'undefined') return; _hlpInit = true;
  GXH.init({ game: 'final-approach', defaultOn: true, steps: HLP_STEPS, rules: HLP_RULES, avoid: '#pz .slot.legal,#pz .die.can,#pz .die.sel,#pz .die[data-d=p],#acts .btn,#says .say.rec' });
  GXH.bulb({ el: '#bulbbtn', suggest: hlpSuggest, rulesFor: () => G && G.lad ? 'sys-' + LADSYS[G.lad] : hlpPhase() });
}
function hlpAfter() {
  hlpInit(); if (typeof GXH === 'undefined') return;
  const vis = id => { const e = document.getElementById(id); return !!(e && !e.hidden); };
  const busy = !G || !UI.started || G.result || (typeof tutOn === 'function' && tutOn()) || UI.rsOpen || UI.dragging || UI.busy || UI.hold || vis('start') || vis('pass') || vis('rs') || vis('netbox') || (typeof GX !== 'undefined' && GX.open);
  GXH.phase(busy ? null : hlpPhase());
}
setInterval(() => { try { hlpAfter(); } catch (e) { } }, 500);
