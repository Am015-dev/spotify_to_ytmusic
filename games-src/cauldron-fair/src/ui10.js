// ===================== part 10: help (gx-help kit): coach bubbles the first time, the lightbulb on demand =====================
// One bubble per phase of play (title <= 4 words, text <= 20 words), shown the first time that phase is reached, pointing at the thing to tap.
// The bulb: the game's own advice (the same CF.AI.choose move that makes the "sug" glow, the same bfDecide as the brew line) + a short why + rules cards.
// Nothing here appears on its own twice; Menu > Tips switches it off. While the staged tutorial runs (ui11.js) all of this stays quiet.
// ---------------------------------------------------------------- pictures for the rules cards (the game's own chips and icons)
function hpics(items) {
  return '<div class="gxh-pics">' + items.map(it => it === '>' ? '<span class="gxh-ar">&rarr;</span>' :
    '<figure>' + (it[0] === 'chip' ? chipHTML(it[1], 56) : ico(it[1], 56)) + (it[2] ? '<figcaption>' + it[2] + '</figcaption>' : '') + '</figure>').join('') + '</div>';
}
const hq = s => () => { const e = document.querySelector(s); return e && e.getBoundingClientRect().width ? e : null; };
const hfirst = (...sels) => () => { for (const s of sels) { const e = document.querySelector(s); if (e && e.getBoundingClientRect().width) return e; } return null; };
const HLP_STEPS = {
  first: { target: hfirst('#acts .bagb:not(.off)', '#acts .bagb'), title: 'Pull a chip', text: 'Tap the bag. The chip lands on the spiral, as many spaces on as its number.', pic: () => hpics([['ico', 'bag']]) },
  brew: { target: hfirst('#acts .brow', '#acts .stopb'), title: 'Draw or stop', text: 'Draw for more coins and points, or Stop to keep your space. Whites must stay at 7 or less.', pic: () => hpics([['chip', 'W2']]) },
  hot: { target: hfirst('#acts .stopb', '#acts .brow'), title: 'Close to boiling', text: 'Another white chip may explode the pot. Stop now, or use the flask on the last white.', pic: () => hpics([['ico', 'boom']]) },
  last: { target: hfirst('#acts .brow', '#acts .bagb'), title: 'The last day', text: 'Everyone secretly picks Draw or Stop, then all show together. No shopping today.', pic: () => hpics([['ico', 'bag']]) },
  card: { target: hfirst('#qbox .opts', '#qbox'), title: 'Fortune card', text: 'Today\'s card lets you choose something. Tap the option you want.', pic: () => hpics([['ico', 'ruby']]) },
  chip: { target: hfirst('#qbox .opts', '#qbox'), title: 'Chip power', text: 'A chip lets you choose. Place the chip it shows, or put it all back.', pic: () => hpics([['chip', 'B1']]) },
  boom: { target: hfirst('#rs .ds.me .dtile', '#rs .dtile', '#rs .dec'), title: 'Boom! Choose', text: 'Your pot exploded. Take the victory points, or the coins to go shopping.', pic: () => hpics([['ico', 'boom']]) },
  shop: { target: hfirst('#rs .stalls', '#rs .mkt'), title: 'The fair stalls', text: 'Tap chips to buy them for your bag: up to two, different colours.', pic: () => hpics([['ico', 'coin']]) },
  ruby: { target: hfirst('#rs .rpot', '#rs .rbar', '#rs .rboard'), title: 'Spend rubies', text: '2 rubies move your droplet one space on, or refill your flask. Then go on.', pic: () => hpics([['ico', 'ruby']]) },
  power: { target: hfirst('#rs .dsheet', '#rs .dec', '#rs .rsbody'), title: 'Chip power', text: 'A chip in your pot earned a bonus. Tap the reward you want.', pic: () => hpics([['chip', 'G1']]) }
};
// ---------------------------------------------------------------- the rules cards (<= 20 words each, a picture each); a card without a phase is general
const HLP_RULES = [
  { title: 'The goal', text: 'You brew for nine days. Chips earn coins and victory points. The most points after day 9 wins.', pic: () => hpics([['ico', 'bag'], '>', ['ico', 'vp', 'Points'], '>', ['ico', 'check', 'Winner']]) },
  { title: 'One day', text: 'Draw chips one by one and stop when you like. Then count the day, shop, and begin again.', pic: () => hpics([['ico', 'bag', 'Draw'], '>', ['ico', 'coin', 'Count'], '>', ['chip', 'B1', 'Shop']]) },
  { title: 'Explosions', text: 'White chips add up. More than 7 and the cauldron explodes: you must stop and give something up.', pic: () => hpics([['chip', 'W2', '2'], ['chip', 'W3', '3'], ['chip', 'W3', '3'], '>', ['ico', 'boom', '8']]) },
  { phase: 'first', title: 'Pull a chip', text: 'Tap the bag. The chip moves forward along the spiral by its number.', pic: () => hpics([['ico', 'bag'], '>', ['chip', 'G2', 'Moves 2']]) },
  { phase: 'first', title: 'Your scoring space', text: 'The ring sits one space past your last chip. Its coins buy chips, its points win the game.', pic: () => hpics([['ico', 'coin', 'Coins'], ['ico', 'vp', 'Points'], ['ico', 'ruby', 'Ruby']]) },
  { phase: 'first', title: 'White chips', text: 'The meter adds up your white chips. Seven is the limit; one more and the pot explodes.', pic: () => hpics([['chip', 'W1'], ['chip', 'W2'], ['chip', 'W3'], '>', ['ico', 'boom', 'Over 7']]) },
  { phase: 'brew', title: 'Draw or stop', text: 'Drawing travels further for more coins and points, but risks an explosion. Stop keeps your space.', pic: () => hpics([['ico', 'bag', 'Draw'], ['ico', 'check', 'Stop']]) },
  { phase: 'brew', title: 'The danger meter', text: 'It shows the chance that the next chip explodes you. When it turns red, think about Stop.', pic: () => hpics([['chip', 'W3', 'Risky']]) },
  { phase: 'brew', title: 'The flask', text: 'Once a day the flask puts the white chip you just drew back in the bag. Rubies refill it.', pic: () => hpics([['ico', 'flask', 'Flask'], '>', ['ico', 'bag', 'Back']]) },
  { phase: 'brew', title: 'The bonus die', text: 'When everyone has stopped, the safe cauldron with the most coins rolls the bonus die for a prize.', pic: () => hpics([['ico', 'die', 'Die']]) },
  { phase: 'hot', title: 'Close to boiling', text: 'Your whites are near 7. A white chip may explode you; other colours are safe.', pic: () => hpics([['chip', 'W3'], '>', ['ico', 'boom']]) },
  { phase: 'hot', title: 'The flask', text: 'Just drew a white? Tap the flask to put it back. You cannot save the chip that exploded you.', pic: () => hpics([['ico', 'flask', 'Flask'], '>', ['ico', 'bag', 'Back']]) },
  { phase: 'hot', title: 'If it explodes', text: 'Your last chip stays and you must stop. Then you choose: the points, or the coins to shop.', pic: () => hpics([['ico', 'boom'], '>', ['ico', 'vp', 'Points'], ['ico', 'coin', 'Coins']]) },
  { phase: 'last', title: 'Stir!', text: 'On the last day everybody secretly chooses Draw or Stop. All choices are shown together.', pic: () => hpics([['ico', 'bag', 'Draw'], ['ico', 'check', 'Stop']]) },
  { phase: 'last', title: 'Final count', text: 'No shop today. Every 5 coins and every 2 rubies you hold become 1 victory point.', pic: () => hpics([['ico', 'coin', '5'], ['ico', 'ruby', '2'], '>', ['ico', 'vp', '1']]) },
  { phase: 'last', title: 'Who wins', text: 'The most points wins. A tie goes to the cauldron that reached furthest today.', pic: () => hpics([['ico', 'vp'], '>', ['ico', 'check', 'Winner']]) },
  { phase: 'card', title: 'Fortune cards', text: 'Each day opens with a card. Purple cards happen now, blue cards last the whole day.', pic: () => hpics([['ico', 'ruby', 'Purple: now'], ['ico', 'drop', 'Blue: all day']]) },
  { phase: 'card', title: 'Choose a reward', text: 'Read the options and tap one. The card text above tells you what each one does.', pic: () => hpics([['chip', 'B2'], ['ico', 'ruby', '3']]) },
  { phase: 'card', title: 'The rat stone', text: 'From day 2, if you trail the leader your first chip starts further on. Tap the rat to use less.', pic: () => hpics([['ico', 'rat', 'Head start']]) },
  { phase: 'chip', title: 'Chip powers', text: 'Some coloured chips have a power when they land. Blue and yellow ones may ask you to choose.', pic: () => hpics([['chip', 'B1'], ['chip', 'Y1']]) },
  { phase: 'chip', title: 'Place or put back', text: 'A peeked chip can be your next chip, with its power. Or put them all back in the bag.', pic: () => hpics([['chip', 'B2'], '>', ['ico', 'bag', 'Back']]) },
  { phase: 'boom', title: 'You exploded', text: 'The last chip stays and the day ends for you. You still score a ruby if your space has one.', pic: () => hpics([['ico', 'boom'], ['ico', 'ruby']]) },
  { phase: 'boom', title: 'Points or coins', text: 'Take the victory points on your space, or the coins to buy chips. Not both.', pic: () => hpics([['ico', 'vp', 'Points'], ['ico', 'coin', 'Coins']]) },
  { phase: 'boom', title: 'Coins buy chips', text: 'Better chips make a stronger bag for the next days. Points win the game today.', pic: () => hpics([['ico', 'coin'], '>', ['chip', 'B1'], '>', ['ico', 'bag']]) },
  { phase: 'shop', title: 'Buy for your bag', text: 'Spend up to your coins on one or two chips of different colours. New chips go in your bag.', pic: () => hpics([['ico', 'coin'], '>', ['chip', 'B1'], ['chip', 'G1']]) },
  { phase: 'shop', title: 'Each colour has a power', text: 'Orange is plain. Green gives rubies, blue peeks, red slides, black counts moths. Tap and hold to read.', pic: () => hpics([['chip', 'O1'], ['chip', 'G1'], ['chip', 'B1'], ['chip', 'R1'], ['chip', 'K1']]) },
  { phase: 'shop', title: 'Locked stalls', text: 'The yellow stall opens on day 2 and the purple one on day 3. Sold-out chips are gone.', pic: () => hpics([['chip', 'Y1', 'Day 2'], ['chip', 'P1', 'Day 3']]) },
  { phase: 'ruby', title: 'Spend rubies', text: 'Every 2 rubies do one thing: move your droplet one space, or refill the flask.', pic: () => hpics([['ico', 'ruby', '2'], '>', ['ico', 'drop', 'Droplet']]) },
  { phase: 'ruby', title: 'The droplet', text: 'Your first chip starts at the droplet. Moving it on gives you a head start every day.', pic: () => hpics([['ico', 'drop'], '>', ['chip', 'G1']]) },
  { phase: 'ruby', title: 'Keep them?', text: 'Unspent rubies are not lost. At the end of the game 2 rubies count as 1 victory point.', pic: () => hpics([['ico', 'ruby', '2'], '>', ['ico', 'vp', '1']]) },
  { phase: 'power', title: 'Chip powers', text: 'Green, purple and black chips act after the brew, if they sit near the end of your pot.', pic: () => hpics([['chip', 'G1'], ['chip', 'P1'], ['chip', 'K1']]) },
  { phase: 'power', title: 'Pick a reward', text: 'The glowing option is a good choice. Read the others if you like, then tap one.', pic: () => hpics([['ico', 'check']]) }
];
// ---------------------------------------------------------------- the phase the player is deciding in (null when there is nothing to decide)
const HP_CARDQ = { pick: 1, swap: 1, clear: 1, bribe: 1, bounty: 1, fork: 1, haggle: 1, restart: 1 }, HP_CHIPQ = { crow: 1, peek: 1, y1: 1, side: 1 };
function hlpPhase() {
  try {
    if (!G || !UI.started || G.phase === 'over' || tutOn()) return null;
    const v = viewSeat(); if (v < 0 || (hotSeat() && UI.holder < 0)) return null;
    const p = G.players[v];
    if (UI.rsOpen) { if (UI.rsMode !== 'report' || STG.run || !p.q) return null; const q = p.q.h; return q === 'de' ? 'boom' : q === 'shop' ? 'shop' : q === 'ruby' ? 'ruby' : EVAL_Q[q] ? 'power' : null; }
    if (p.q) return HP_CARDQ[p.q.h] ? 'card' : HP_CHIPQ[p.q.h] ? 'chip' : null;
    if (G.phase !== 'brew' || p.st !== 'draw' || p.lock || BF.pulling || focusSeat() !== v) return null;
    if (G.round === LASTD()) return 'last';
    if (!p.pot.length) return 'first';
    return CF.risk(G, v).pBoom >= .3 ? 'hot' : 'brew';
  } catch (e) { return null; }
}
// ---------------------------------------------------------------- the bulb: the game's own advice, as a target and a short why (<= 15 words)
function capW(t, n) { const w = String(t || '').replace(/\s+/g, ' ').trim().split(' '); return w.length <= n ? w.join(' ') : ''; }
function hlpWhy(p, q, m) {
  const pct = () => Math.round(CF.risk(G, p.seat).pBoom * 100), sp = CF.spaceOf(p);
  if (!q) {
    if (m.t === 'draw') return 'Only ' + pct() + '% to explode, so another chip is worth the risk.';
    if (m.t === 'flask') return 'Too hot: the flask puts the last white chip back in the bag.';
    return pct() + '% to explode. Stop and keep ' + D.COINS[sp] + ' coins and ' + D.VP[sp] + ' points.';
  }
  switch (q.h) {
    case 'de': return m.o === 'vp' ? 'Few coins here, so the victory points are worth more.' : q.d.coins + ' coins buy more for your bag than ' + q.d.vp + ' points.';
    case 'shop': return 'These chips make your bag stronger for the coins you have.';
    case 'ruby': return m.drop || m.flask ? (m.flask && !m.drop ? 'Refill the flask so you can use it tomorrow.' : 'A further start gives every day a head start.') : 'Keep the rubies: 2 of them are worth a point at the end.';
    case 'pick': return m.o === 'rubies' ? 'Rubies buy droplet steps and flask refills.' : 'A new chip makes your bag stronger.';
    case 'crow': case 'peek': return m.idx < 0 ? 'None of these chips helps now: put them all back.' : 'This chip fits your pot best. Place it.';
    default: return 'This is the best option for your bag right now.';
  }
}
function hlpSuggest() {
  try {
    if (!G || !UI.started || G.phase === 'over' || tutOn() || BF.pulling || (hotSeat() && UI.holder < 0)) return null;
    const v = viewSeat(); if (v < 0 || focusSeat() !== v) return null; const p = G.players[v], q = p.q;
    if (UI.rsOpen) {
      if (UI.rsMode !== 'report' || STG.run || !q) return null;
      const m = (q.h === 'shop' || q.h === 'ruby') ? null : CF.AI.choose(G, v, 'normal'); const sel = document.querySelector('#rs .tok.on, #rs .rtg.here');
      let tgt;
      if (q.h === 'shop') tgt = document.querySelector('#rs .tok.sug:not(.on):not([disabled])') || document.querySelector('#rs [data-a=shopbuy]');
      else if (q.h === 'ruby') tgt = document.querySelector('#rs .rtg.sug:not(.here), #rs .rbt.sug') || document.querySelector('#rs [data-a=rubygo]');
      else tgt = document.querySelector('#rs [data-a=mv].sug, #rs .dpick.sug');
      if (!tgt || !tgt.getBoundingClientRect().width) return null;
      const why = capW(hlpWhy(p, q, q.h === 'ruby' ? (UI.rubySel || {}) : q.h === 'shop' ? {} : m || {}), 15); if (!why) return null;
      return { why, target: () => tgt.isConnected ? tgt : null };
    }
    if (q) {
      const btn = document.querySelector('#qbox [data-a=mv].sug'); if (!btn) return null;
      const m = (UI.legal[v] || [])[+btn.dataset.i]; if (!m) return null; const why = capW(hlpWhy(p, q, m), 15); if (!why) return null;
      return { why, target: () => btn.isConnected ? btn : document.querySelector('#qbox [data-a=mv].sug') };
    }
    if (G.phase !== 'brew' || p.st !== 'draw' || p.lock) return null;
    const legal = UI.legal[v] || mvList(v);
    let m = CF.AI.choose(G, v, 'normal'); if (!m || (m.t !== 'draw' && m.t !== 'stop' && m.t !== 'flask')) return null;
    if (G.round === LASTD() && m.t === 'flask') return null;
    const sel = m.t === 'draw' ? '#acts .bagb:not(.off)' : m.t === 'stop' ? '#acts .stopb:not(.off)' : '#acts .flb'; const why = capW(hlpWhy(p, null, m), 15);
    if (!why || !document.querySelector(sel) || !legal.some(x => x.t === m.t)) return null;
    return { why, target: () => document.querySelector(sel) };
  } catch (e) { return null; }
}
// ---------------------------------------------------------------- wiring
let _hlpInit = false;
function hlpInit() {
  if (_hlpInit || typeof GXH === 'undefined') return; _hlpInit = true;
  GXH.init({ game: 'cauldron-fair', defaultOn: true, steps: HLP_STEPS, rules: HLP_RULES, avoid: '#acts button,#qbox button,.tok,.dpick,.rtg,.rbt,.sbc,#rs .confirm,#ratchip button' });
  GXH.bulb({ el: '#bulbbtn', suggest: hlpSuggest, rulesFor: hlpPhase });
}
function hlpAfter() {
  hlpInit(); if (typeof GXH === 'undefined') return;
  const st = $('#start'), busy = !G || !UI.started || G.phase === 'over' || tutOn() || (st && !st.hidden) || UI.mode === 'ai' || !!GX.open || Date.now() < BF.fxUntil || (UI.rsOpen && UI.rsMode !== 'report');
  GXH.phase(busy ? null : hlpPhase());
}
