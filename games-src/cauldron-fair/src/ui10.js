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
  first: { target: hfirst('#acts .bagb:not(.off)', '#acts .bagb'), title: 'Pull a chip', text: 'Tap the bag. The chip moves as many spaces as its number.', pic: () => hpics([['ico', 'bag']]) },
  brew: { target: hfirst('#acts .brow', '#acts .stopb'), title: 'Draw or stop', text: 'Each space shows coins (big number), points (small badge) and rubies. Draw for more, or Stop to keep it.', pic: () => hpics([['chip', 'W2']]) },
  hot: { target: hfirst('#acts .stopb', '#acts .brow'), title: 'Close to boiling', text: 'Another white chip may explode the pot. Stop, or use the flask.', pic: () => hpics([['ico', 'boom']]) },
  last: { target: hfirst('#acts .brow', '#acts .bagb'), title: 'The last day', text: 'Everyone picks Draw or Stop in secret. Then all show. No shop today.', pic: () => hpics([['ico', 'bag']]) },
  card: { target: hfirst('#qbox [data-a=mv].sug', '#qbox [data-a=mv]', '#qbox'), title: 'Fortune card', text: 'Today\'s card gives a choice. Tap the one you want.', pic: () => hpics([['ico', 'ruby']]) },
  chip: { target: hfirst('#qbox [data-a=mv].sug', '#qbox [data-a=mv]', '#qbox'), title: 'Chip power', text: 'Place the chip shown, or put them all back.', pic: () => hpics([['chip', 'B1']]) },
  boom: { target: hfirst('#rs .ds.me .dtile', '#rs .dtile', '#rs .dec'), title: 'Your pot exploded', text: 'Take the victory points or the coins.', pic: () => hpics([['ico', 'boom']]) },
  shop: { target: hfirst('#rs .tok.sug:not(.on):not([disabled])', '#rs .tok:not(.on):not([disabled])', '#rs .stalls'), title: 'The fair stalls', text: 'Tap chips to buy up to two. Pick different colours.', pic: () => hpics([['ico', 'coin']]) },
  ruby: { target: hfirst('#rs .rbt.rdrop', '#rs .rtg:not(.here)', '#rs .rbar', '#rs .rpot'), title: 'Spend rubies', text: '2 rubies move your droplet one space or refill your flask.', pic: () => hpics([['ico', 'ruby']]) },
  power: { target: hfirst('#rs .dec [data-a=mv].sug', '#rs .dec [data-a=mv]', '#rs .dsheet'), title: 'Chip power', text: 'One of your chips gives a reward. Tap the one you want.', pic: () => hpics([['chip', 'G1']]) }
};
// ---------------------------------------------------------------- the rules cards (<= 20 words each, a picture each); a card without a phase is general
const HLP_RULES = [
  { title: 'The goal', text: 'Most points after 9 days wins. Draw chips. Stop before the whites pass 7. Your last space scores.', pic: () => hpics([['ico', 'bag'], '>', ['ico', 'vp', 'Points'], '>', ['ico', 'check', 'Winner']]) },
  { title: 'One day', text: 'Draw chips and stop when you like. Then count your score and shop.', pic: () => hpics([['ico', 'bag', 'Draw'], '>', ['ico', 'coin', 'Count'], '>', ['chip', 'B1', 'Shop']]) },
  { title: 'Explosions', text: 'White chips add up. Over 7 and your pot explodes. You must stop.', pic: () => hpics([['chip', 'W2', '2'], ['chip', 'W3', '3'], ['chip', 'W3', '3'], '>', ['ico', 'boom', '8']]) },
  { phase: 'first', title: 'Pull a chip', text: 'Tap the bag. The chip moves forward along the spiral by its number.', pic: () => hpics([['ico', 'bag'], '>', ['chip', 'G2', 'Moves 2']]) },
  { phase: 'first', title: 'Your scoring space', text: 'The ring sits one space past your last chip. Coins buy chips. Points win.', pic: () => hpics([['ico', 'coin', 'Coins'], ['ico', 'vp', 'Points'], ['ico', 'ruby', 'Ruby']]) },
  { phase: 'first', title: 'White chips', text: 'The meter adds up your white chips. Over 7 and the pot explodes.', pic: () => hpics([['chip', 'W1'], ['chip', 'W2'], ['chip', 'W3'], '>', ['ico', 'boom', 'Over 7']]) },
  { phase: 'brew', title: 'Draw or stop', text: 'Drawing scores more but risks an explosion. Stop keeps your space.', pic: () => hpics([['ico', 'bag', 'Draw'], ['ico', 'check', 'Stop']]) },
  { phase: 'brew', title: 'The danger meter', text: 'It shows the chance your next chip explodes. If it is red, think about stopping.', pic: () => hpics([['chip', 'W3', 'Risky']]) },
  { phase: 'brew', title: 'The flask', text: 'Once a day, the flask puts your last white chip back. Rubies refill it.', pic: () => hpics([['ico', 'flask', 'Flask'], '>', ['ico', 'bag', 'Back']]) },
  { phase: 'brew', title: 'The bonus die', text: 'When all have stopped, the richest safe cauldron rolls the bonus die.', pic: () => hpics([['ico', 'die', 'Die']]) },
  { phase: 'hot', title: 'Close to boiling', text: 'Your whites are near 7. A white chip may explode your pot. Other colours are safe.', pic: () => hpics([['chip', 'W3'], '>', ['ico', 'boom']]) },
  { phase: 'hot', title: 'The flask', text: 'Drew a white? Tap the flask to put it back. It cannot undo an explosion.', pic: () => hpics([['ico', 'flask', 'Flask'], '>', ['ico', 'bag', 'Back']]) },
  { phase: 'hot', title: 'If it explodes', text: 'Your last chip stays and you stop. Then pick the points or the coins.', pic: () => hpics([['ico', 'boom'], '>', ['ico', 'vp', 'Points'], ['ico', 'coin', 'Coins']]) },
  { phase: 'last', title: 'Stir!', text: 'On the last day everyone picks Draw or Stop in secret. Then all show.', pic: () => hpics([['ico', 'bag', 'Draw'], ['ico', 'check', 'Stop']]) },
  { phase: 'last', title: 'Final count', text: 'No shop today. Every 5 coins or 2 rubies make 1 point.', pic: () => hpics([['ico', 'coin', '5'], ['ico', 'ruby', '2'], '>', ['ico', 'vp', '1']]) },
  { phase: 'last', title: 'Who wins', text: 'Most points wins. A tie goes to the pot that reached furthest today.', pic: () => hpics([['ico', 'vp'], '>', ['ico', 'check', 'Winner']]) },
  { phase: 'card', title: 'Fortune cards', text: 'Each day starts with a card. Purple is instant. Blue lasts all day.', pic: () => hpics([['ico', 'ruby', 'Purple: now'], ['ico', 'drop', 'Blue: all day']]) },
  { phase: 'card', title: 'Choose a reward', text: 'Read the options and tap one.', pic: () => hpics([['chip', 'B2'], ['ico', 'ruby', '3']]) },
  { phase: 'card', title: 'The rat stone', text: 'From day 2, trailing players start further on. Tap the rat to use less.', pic: () => hpics([['ico', 'rat', 'Head start']]) },
  { phase: 'chip', title: 'Chip powers', text: 'Some chips have a power when they land. Blue and yellow may ask you to choose.', pic: () => hpics([['chip', 'B1'], ['chip', 'Y1']]) },
  { phase: 'chip', title: 'Place or put back', text: 'Place a peeked chip as your next chip. Or put them all back.', pic: () => hpics([['chip', 'B2'], '>', ['ico', 'bag', 'Back']]) },
  { phase: 'boom', title: 'You exploded', text: 'Your last chip stays and your day ends. You still get a ruby if your space has one.', pic: () => hpics([['ico', 'boom'], ['ico', 'ruby']]) },
  { phase: 'boom', title: 'Points or coins', text: 'Take your space\'s points, or its coins. Not both.', pic: () => hpics([['ico', 'vp', 'Points'], ['ico', 'coin', 'Coins']]) },
  { phase: 'boom', title: 'Coins buy chips', text: 'Better chips help on later days. Points win the game.', pic: () => hpics([['ico', 'coin'], '>', ['chip', 'B1'], '>', ['ico', 'bag']]) },
  { phase: 'shop', title: 'Buy for your bag', text: 'Buy one or two chips of different colours. They go in your bag.', pic: () => hpics([['ico', 'coin'], '>', ['chip', 'B1'], ['chip', 'G1']]) },
  { phase: 'shop', title: 'Each colour has a power', text: 'Orange has no power. Green gives rubies, blue peeks, red moves, black counts. Hold a chip to read it.', pic: () => hpics([['chip', 'O1'], ['chip', 'G1'], ['chip', 'B1'], ['chip', 'R1'], ['chip', 'K1']]) },
  { phase: 'shop', title: 'Locked stalls', text: 'Yellow opens on day 2, purple on day 3. Sold-out chips are gone.', pic: () => hpics([['chip', 'Y1', 'Day 2'], ['chip', 'P1', 'Day 3']]) },
  { phase: 'ruby', title: 'Spend rubies', text: 'Spend 2 rubies to move your droplet one space or refill the flask.', pic: () => hpics([['ico', 'ruby', '2'], '>', ['ico', 'drop', 'Droplet']]) },
  { phase: 'ruby', title: 'The droplet', text: 'Your first chip starts at the droplet. Move it on for a head start each day.', pic: () => hpics([['ico', 'drop'], '>', ['chip', 'G1']]) },
  { phase: 'ruby', title: 'Keep them?', text: 'Unspent rubies stay. At the end, 2 rubies make 1 point.', pic: () => hpics([['ico', 'ruby', '2'], '>', ['ico', 'vp', '1']]) },
  { phase: 'power', title: 'Chip powers', text: 'Green, purple and black chips near the end act after the brew.', pic: () => hpics([['chip', 'G1'], ['chip', 'P1'], ['chip', 'K1']]) },
  { phase: 'power', title: 'Pick a reward', text: 'The glowing option is a good pick. Tap one.', pic: () => hpics([['ico', 'check']]) }
];
// ---------------------------------------------------------------- the phase the player is deciding in (null when there is nothing to decide)
const HP_CARDQ = { pick: 1, swap: 1, clear: 1, bribe: 1, bounty: 1, fork: 1, haggle: 1, restart: 1 }, HP_CHIPQ = { crow: 1, peek: 1, y1: 1, side: 1 };
function hlpPhase() {
  try {
    if (!G || !UI.started || G.phase === 'over' || tutOn()) return null;
    const v = viewSeat(); if (v < 0 || (hotSeat() && UI.holder < 0)) return null;
    const p = G.players[v];
    if (UI.rsOpen) { if (UI.rsMode !== 'report' || STG.run || !p.q) return null; const q = p.q.h; return q === 'de' ? 'boom' : q === 'shop' ? (innerHeight < 700 && innerWidth < 600 ? null : 'shop') : q === 'ruby' ? 'ruby' : EVAL_Q[q] ? 'power' : null; }
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
    if (m.t === 'draw') return !p.pot.length ? 'Your pot is empty, so drawing a chip is safe.' : pct() === 0 ? 'No chip in your bag can explode you now. Draw again.' : 'Only ' + pct() + '% to explode, so another chip is worth the risk.';
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
    const fm = legal.find(x => x.t === 'flask'), dec = bfDecide(p, null, fm);      // the brew line and the ghost finger first: the bulb never contradicts them
    let m = dec.act ? { t: dec.act } : CF.AI.choose(G, v, 'normal'); if (!m || (m.t !== 'draw' && m.t !== 'stop' && m.t !== 'flask')) return null;
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
  GXH.init({ game: 'cauldron-fair', defaultOn: false, steps: HLP_STEPS, rules: HLP_RULES, avoidPad: 10, tapFirst: true, avoid: '#fortchip,#fort,.ct,#acts button,#qbox button,.tok,.dpick,.rtg,.rbt,.sbc,#rs .confirm,#ratchip button' });
  GXH.bulb({ el: '#bulbbtn', suggest: hlpSuggest, rulesFor: hlpPhase });
}
function hlpAfter() {
  hlpInit(); if (typeof GXH === 'undefined') return;
  const st = $('#start'), busy = (typeof COACH !== 'undefined' && COACH.on) || !!document.querySelector('#goalcard') || !G || !UI.started || G.phase === 'over' || tutOn() || (st && !st.hidden) || UI.mode === 'ai' || !!GX.open || Date.now() < BF.fxUntil || (UI.rsOpen && UI.rsMode !== 'report');
  GXH.phase(busy ? null : hlpPhase());
}
