// Component reference for Kaiten Kitchen in the shared GX.reference format (JSON-safe, so node can read it too).
//   KK.refSections(DATA) -> [{id, title, items:[{id, name, count, text, tags, meta, extra, pic}]}]
// `pic` says what to draw ({type: plate type}); the page turns it into a painted plate card.
(function (g) {
  var KK = g.KK = g.KK || {};
  var GROUP = { set: 'Set', maki: 'Roll race', nigiri: 'Nigiri', wasabi: 'Booster', chop: 'Tool', pudding: 'End of game' };
  var META = {
    tempura: 'Pairs · 5 points a pair', sashimi: 'Sets of three · 10 points a set', dumpling: 'Ladder · 1, 3, 6, 10, 15',
    roll1: 'Roll race · 1 icon', roll2: 'Roll race · 2 icons', roll3: 'Roll race · 3 icons',
    salmon: 'Nigiri · 2 points (6 on Fire Paste)', squid: 'Nigiri · 3 points (9 on Fire Paste)', egg: 'Nigiri · 1 point (3 on Fire Paste)',
    wasabi: 'Triples your next nigiri', chop: 'Serve two plates on a later turn', pudding: 'Kept to the end · most +6, fewest −6'
  };
  var EXTRA = {
    tempura: 'A lone prawn scores nothing, so take the first one only if a second is likely to come round.',
    sashimi: 'One or two Fish Slices score nothing. With few diners the hands come back to you, which makes sets easier.',
    dumpling: 'Five buns is the top of the ladder: a sixth one adds nothing.',
    roll1: 'Add up every roll icon on your counter this round. Ties for the most split 6 (rounded down) and nobody scores second.',
    roll2: 'Add up every roll icon on your counter this round. Ties for the most split 6 (rounded down) and nobody scores second.',
    roll3: 'Add up every roll icon on your counter this round. Ties for the most split 6 (rounded down) and nobody scores second.',
    salmon: 'A nigiri served after a Fire Paste lands on the oldest waiting paste.',
    squid: 'The best nigiri to put on a Fire Paste: 9 points.',
    egg: 'Cheap on its own, but still 3 points on a Fire Paste.',
    wasabi: 'Each paste takes one nigiri. A paste served together with a nigiri (Twin Sticks) lands under it.',
    chop: 'After you use them, the sticks go back into the hand you are holding and move on to the next diner.',
    pudding: 'Custard is never cleared at the end of a round. With two diners nobody loses points for the fewest. Ties for the most decide the winner when totals are equal.'
  };
  KK.refSections = function (D) {
    D = D || KK.DATA;
    var plates = D.types.map(function (t) {
      return { id: 'p-' + t.id, name: t.name + (t.icons ? ' (' + t.icons + ' icon' + (t.icons > 1 ? 's' : '') + ')' : ''), count: t.copies, text: t.text,
        tags: [GROUP[t.group] || t.group, t.group === 'pudding' ? 'Kept' : 'Cleared each round'], meta: META[t.id] || '', extra: EXTRA[t.id] || '', pic: { type: t.id } };
    });
    var hs = D.handSize, total = D.types.reduce(function (a, t) { return a + t.copies; }, 0);
    var rules = [
      { id: 'r-pick', name: 'Picking a plate', text: 'Everyone secretly picks one plate from the belt in their hand at the same time. When all have chosen, the covers lift together, then every hand passes one seat to the left.', tags: ['Turn'], meta: 'Every turn' },
      { id: 'r-hand', name: 'Hand sizes', text: 'Each round everyone is dealt ' + hs[2] + ' plates with 2 diners, ' + hs[3] + ' with 3, ' + hs[4] + ' with 4 and ' + hs[5] + ' with 5.', tags: ['Round'], meta: D.rounds + ' rounds' },
      { id: 'r-race', name: 'Roll race', text: 'Most roll icons this round scores ' + D.makiFirst + ', second most ' + D.makiSecond + '. Ties for the most split ' + D.makiFirst + ' (rounded down) and nobody scores second; ties for second split ' + D.makiSecond + '. No icons, no points.', tags: ['Scoring', 'Round'], meta: 'Scored at the end of each round', pic: { type: 'roll3' } },
      { id: 'r-paste', name: 'Fire Paste bonus', text: 'A nigiri served onto a waiting Fire Paste scores triple. The score pad shows the extra points as their own row.', tags: ['Scoring'], meta: 'Nigiri × 3', pic: { type: 'wasabi', on: 'squid' } },
      { id: 'r-custard', name: 'Custard at the end', text: 'After the third round the most Custard Cups score +' + D.puddingMost + ' and the fewest lose ' + D.puddingFewest + ' (not with 2 diners). Ties split the points, rounded down. If everyone has the same number, nobody scores.', tags: ['Scoring', 'End of game'], meta: 'Once, after round 3', pic: { type: 'pudding' } },
      { id: 'r-tie', name: 'Ties', text: 'The highest total wins. A tie goes to the diner with more Custard Cups; if that is tied too, the win is shared.', tags: ['End of game'], meta: 'Final result' }
    ];
    var box = [
      { id: 'x-deck', name: 'Plate cards', count: total, text: D.types.length + ' kinds of plate (three of them Seaweed Rolls with 1, 2 or 3 icons). The whole deck is shuffled once; the plates left over after a deal wait for the next round.', tags: ['Box'] },
      { id: 'x-pad', name: 'Score pad', count: 1, text: 'Adds up every diner\'s three rounds and the custard at the end.', tags: ['Box'] }
    ];
    return [{ id: 'plates', title: 'Plates', items: plates }, { id: 'rules', title: 'Scoring', items: rules }, { id: 'box', title: 'In the box', items: box }];
  };
  if (typeof module === 'object' && module.exports) module.exports = KK.refSections;
})(typeof window !== 'undefined' ? window : globalThis);
