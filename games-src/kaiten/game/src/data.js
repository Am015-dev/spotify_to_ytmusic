// Kaiten Kitchen static data. Internal `id` strings are for code only; players see `name` and `text`.
(function (g) {
var KK = g.KK = g.KK || {};
KK.DATA = {
  game: 'Kaiten Kitchen',
  rounds: 3,
  handSize: { 2: 10, 3: 9, 4: 8, 5: 7 },
  // order here = order of card instance ids 0..107
  types: [
    { id: 'tempura', name: 'Crispy Prawn', copies: 14, group: 'set', text: 'Collect two Crispy Prawns for 5 points. A lone one scores nothing.' },
    { id: 'sashimi', name: 'Fish Slice', copies: 14, group: 'set', text: 'Collect three Fish Slices for 10 points. One or two score nothing.' },
    { id: 'dumpling', name: 'Steam Bun', copies: 14, group: 'set', text: 'The more Steam Buns you stack, the better: 1, 3, 6, 10, then 15 points for five or more.' },
    { id: 'roll2', name: 'Seaweed Roll', copies: 12, group: 'maki', icons: 2, text: 'Two roll icons. Most icons this round scores 6, second most scores 3.' },
    { id: 'roll3', name: 'Seaweed Roll', copies: 8, group: 'maki', icons: 3, text: 'Three roll icons. Most icons this round scores 6, second most scores 3.' },
    { id: 'roll1', name: 'Seaweed Roll', copies: 6, group: 'maki', icons: 1, text: 'One roll icon. Most icons this round scores 6, second most scores 3.' },
    { id: 'salmon', name: 'Sunset Nigiri', copies: 10, group: 'nigiri', value: 2, text: 'Worth 2 points, or 6 if it lands on Fire Paste.' },
    { id: 'squid', name: 'Moon Nigiri', copies: 5, group: 'nigiri', value: 3, text: 'Worth 3 points, or 9 if it lands on Fire Paste.' },
    { id: 'egg', name: 'Sun Nigiri', copies: 5, group: 'nigiri', value: 1, text: 'Worth 1 point, or 3 if it lands on Fire Paste.' },
    { id: 'wasabi', name: 'Fire Paste', copies: 6, group: 'wasabi', text: 'The next nigiri you play lands on it and scores triple. With no nigiri it scores nothing.' },
    { id: 'chop', name: 'Twin Sticks', copies: 4, group: 'chop', text: 'Keep it on the table. On a later turn pick two cards from your hand, then put Twin Sticks back into that hand.' },
    { id: 'pudding', name: 'Custard Cup', copies: 10, group: 'pudding', text: 'Kept until the game ends. Most Custard Cups score 6, fewest lose 6 (nobody loses points in a 2-player game).' }
  ],
  dumplingPts: [0, 1, 3, 6, 10, 15],
  tempuraPair: 5, sashimiSet: 10, makiFirst: 6, makiSecond: 3, puddingMost: 6, puddingFewest: 6
};
if (typeof module === 'object' && module.exports) module.exports = KK.DATA;
})(typeof globalThis !== 'undefined' ? globalThis : this);
