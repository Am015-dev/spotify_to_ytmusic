// ===================== part 10: help (gx-help kit): coach bubbles the first time, the lightbulb on demand =====================
// Phases = the moments the player decides something. Bubbles show once per phase; the bulb gives the computer's own advice (KK.AI.choose, the same
// call the old Hint used) with a short why, and rules cards. Nothing here changes the rules or appears on its own twice.
const HPIC = {
  card: (k, w) => cardNode(k, w || 56).outerHTML,
  row: ks => '<div style="display:flex;gap:6px;justify-content:center;align-items:center">' + ks.map(k => '<div style="width:46px;height:64px">' + cardNode(k, 46).outerHTML + '</div>').join('') + '</div>',
  belt: () => '<svg viewBox="0 0 64 64"><rect x="4" y="38" width="56" height="12" rx="6" fill="#4a2a22"/><circle cx="14" cy="44" r="3" fill="#f2c27a"/><circle cx="32" cy="44" r="3" fill="#f2c27a"/><circle cx="50" cy="44" r="3" fill="#f2c27a"/><circle cx="32" cy="24" r="12" fill="#fbf0da" stroke="#4a2a22" stroke-width="3"/><circle cx="32" cy="24" r="6" fill="#e5553a"/><path d="M8 12h12M14 8l-6 4 6 4" fill="none" stroke="#e5553a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  num: n => '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="26" fill="#fbf0da" stroke="#4a2a22" stroke-width="3"/><text x="32" y="44" text-anchor="middle" font-size="34" font-weight="800" fill="#e5553a" font-family="Georgia,serif">' + n + '</text></svg>',
  flag: () => '<svg viewBox="0 0 64 64"><path d="M16 8v50" stroke="#4a2a22" stroke-width="4" stroke-linecap="round"/><path d="M16 10h34l-8 12 8 12H16z" fill="#e5553a" stroke="#4a2a22" stroke-width="3" stroke-linejoin="round"/></svg>'
};
const HLP_STEPS = {
  pick: { target: () => $('#belt'), title: 'Take one dish', text: 'Tap the dish you want. Your other plates pass to the next diner.' },
  twin: { target: () => document.querySelector('#tbl .grp.usable'), title: 'Twin Sticks ready', text: 'Tap the glowing sticks, then two dishes. You take both this turn.' },
  twin2: { target: () => $('#belt'), title: 'Pick two dishes', text: 'Tap two dishes. The Twin Sticks then go back into the hand you pass.' },
  tally: { target: () => document.querySelector('#rs [data-a=rsnext]'), title: 'Round scored', text: 'Every set, roll race and nigiri was just counted. Tap for the next round.' }
};
const HLP_RULES = [
  { phase: 'pick', title: 'Pick and pass', text: 'Everyone takes one dish at the same time. Then every hand passes to the next diner.', pic: HPIC.belt },
  { phase: 'pick', title: 'Sets and buns', text: 'Two Prawns score 5, three Fish Slices 10. Steam Buns score 1, 3, 6, 10, then 15.', pic: () => HPIC.row(['tempura', 'sashimi', 'dumpling']) },
  { phase: 'pick', title: 'Rolls and nigiri', text: 'Most roll icons score 6, second most 3. Nigiri score 1 to 3, tripled on Fire Paste.', pic: () => HPIC.row(['roll2', 'salmon', 'wasabi']) },
  { phase: 'pick', title: 'Custard at the end', text: 'Custard Cups score only when the game ends: most scores 6, fewest loses 6.', pic: () => HPIC.card('pudding', 64) },
  { phase: 'twin', title: 'Twin Sticks', text: 'Keep them on the table. On a later turn take two dishes from your hand at once.', pic: () => HPIC.card('chop', 64) },
  { phase: 'twin', title: 'How to use them', text: 'Tap the glowing sticks, then tap two dishes. The sticks return to the hand you pass.', pic: HPIC.belt },
  { phase: 'twin2', title: 'Two dishes', text: 'Tap two dishes from your hand. You take both, then the hand passes on.', pic: () => HPIC.row(['tempura', 'tempura']) },
  { phase: 'twin2', title: 'Sticks go back', text: 'The Twin Sticks are put back into your hand, so the next diner can use them.', pic: () => HPIC.card('chop', 64) },
  { phase: 'tally', title: 'Counting a round', text: 'Sets, rolls, buns and nigiri are scored now. Custard waits until the game ends.', pic: () => HPIC.row(['tempura', 'roll2', 'dumpling']) },
  { phase: 'tally', title: 'Three rounds', text: 'The meal lasts three rounds. The highest total after round three wins.', pic: () => HPIC.num(3) }
];
function hlpSticks() { return document.querySelector('#tbl .seat.me .grp.usable') || document.querySelector('#tbl .grp.usable'); }
function hlpPhase() {
  if (!G || !UI.started || UI.cards.length || tutOn()) return null;
  const st = $('#start'); if (st && !st.hidden) return null;
  if (UI.rsOpen) return document.querySelector('#rs [data-a=rsnext]') ? 'tally' : null;
  if (G.phase !== 'pick' || !canPick() || UI.drag) return null;
  if (UI.twin) return 'twin2';
  return hlpSticks() && G.players[viewSeat()].hand.length >= 2 ? 'twin' : 'pick';
}
const hlpCap = (t, n) => { const w = t.split(/\s+/); return w.length <= n ? t : w.slice(0, n).join(' ').replace(/[,;:]$/, '') + '.'; };
function hlpWhy(v, mv) {
  if (mv.pick.length === 2) return 'Twin Sticks: take these two dishes together this turn.';
  const id = mv.ids[0], k = tkey(id), g = gainOf(v, [id]), c = KK.tableCounts(G.players[v].table), plus = g > 0 ? ' +' + g + ' now.' : '';
  let t;
  if (k === 'tempura') t = g > 0 ? 'Pairs up with your Crispy Prawn:' + plus : 'Two Crispy Prawns score 5; you need a partner.';
  else if (k === 'sashimi') t = g > 0 ? 'Completes three Fish Slices:' + plus : 'Three Fish Slices score 10; this starts a set.';
  else if (k === 'dumpling') t = 'Every Steam Bun scores more than the last.' + plus;
  else if (k === 'roll1' || k === 'roll2' || k === 'roll3') t = 'Roll icons: the most this round scores 6.';
  else if (k === 'salmon' || k === 'squid' || k === 'egg') t = c.wasabiUnused > 0 ? 'Lands on your Fire Paste and scores triple:' + plus : TY[k].name + ' scores' + plus.replace(' now.', ' now.');
  else if (k === 'wasabi') t = 'Fire Paste triples the next nigiri you take.';
  else if (k === 'chop') t = 'Twin Sticks let you take two dishes later.';
  else if (k === 'pudding') t = 'Custard Cups pay at the end: most scores 6.';
  else t = 'The best dish for you right now.';
  return hlpCap(t.replace(/:\s*\+/, ': +'), 15);
}
function hlpSuggest() {
  if (tutOn() || !G || !canPick() || UI.drag || UI.twin && UI.sel.length >= 2) return null;
  const v = viewSeat(); let mv; try { mv = KK.AI.choose(G, v, 'normal'); } catch (e) { return null; }
  if (!mv || !mv.pick || !mv.pick.length) return null;
  const why = hlpWhy(v, mv), cardAt = i => () => document.querySelector('#belt .hc[data-i="' + i + '"]');
  if (mv.pick.length === 2 && !UI.twin) { if (!hlpSticks()) return null; return { why, key: mv.pick.join(','), target: hlpSticks }; }
  const idx = mv.pick.find(i => UI.sel.indexOf(i) < 0); if (idx == null || !document.querySelector('#belt .hc[data-i="' + idx + '"]')) return null;
  return { why, key: mv.pick.join(','), target: cardAt(idx) };
}
let _hlpInit = false;
function hlpInit() {
  if (_hlpInit || typeof GXH === 'undefined') return; _hlpInit = true;
  GXH.init({ game: 'kaiten-kitchen', defaultOn: true, steps: HLP_STEPS, rules: HLP_RULES, avoid: '#belt .hc[data-up="1"],#tbl .grp.usable,#rs .btn,#acts .btn,#labacts .lbtn' });
  GXH.bulb({ el: '#bulbbtn', suggest: hlpSuggest, rulesFor: () => hlpPhase() || 'pick' });
}
function hlpAfter() { hlpInit(); if (typeof GXH !== 'undefined') GXH.phase(hlpPhase()); }
hlpInit(); setInterval(() => { try { hlpAfter(); } catch (e) { } }, 450);
{ const _ng = newGame; newGame = function (mode) { if (mode === 'guided' && typeof GXH !== 'undefined') { hlpInit(); GXH.reset(); GXH.setEnabled(true); } return _ng.apply(this, arguments); }; }
