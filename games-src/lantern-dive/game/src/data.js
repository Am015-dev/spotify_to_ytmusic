// ===================== Lantern Dive: data (suits, 96 job cards, 32 dives, names) =====================
// All wording is original. Numbers (difficulty per crew size, counts, thresholds) follow the rules research (rules-notes.md).
// Suits 0..3 are the colour suits (cards 1-9); suit 4 is the trump suit, the Lanterns (cards 1-4).
// Job card kinds (see engine.js `jobStatus`): cmp trick pred with cards valn coln colx avoidc avoidv avoidsub allcol onecol
//   subx nolead skip none ntr pos run pred eqcol morecol.  d = [3 divers, 4 divers, 5 divers] difficulty, cap:0 = the Commander may not take it.
(function (g) {
'use strict';
const SUITS = [
  { id: 0, name: 'Coral', short: 'Co', c: '#e2607f', dk: '#8d2540', sym: 'branch' },
  { id: 1, name: 'Tide', short: 'Ti', c: '#3f82da', dk: '#1d4a93', sym: 'wave' },
  { id: 2, name: 'Kelp', short: 'Ke', c: '#3fa86d', dk: '#1a6a3e', sym: 'frond' },
  { id: 3, name: 'Sunstar', short: 'Su', c: '#f1b82e', dk: '#9a6a05', sym: 'star' },
  { id: 4, name: 'Lantern', short: 'La', c: '#ffe7a0', dk: '#b88410', sym: 'lantern' }
];
const sid = n => SUITS.findIndex(s => s.name.toLowerCase() === n);
// card id: 0..35 colour cards (suit*9 + value-1), 36..39 lanterns 1..4
const card = (suit, v) => suit === 4 ? 36 + v - 1 : suit * 9 + v - 1;
const CO = 0, TI = 1, KE = 2, SU = 3, LA = 4;
// helpers to write the table below
const J = (d, t, o) => Object.assign({ d, t, cap: 1 }, o);
const TASKS = [
  /* 0 */ J([2, 3, 3], 'Win more tricks than every other diver.', { k: 'cmp', op: 'more', vs: 'each' }),
  /* 1 */ J([3, 4, 5], 'Win more tricks than all the other divers put together.', { k: 'cmp', op: 'more', vs: 'all' }),
  /* 2 */ J([2, 2, 3], 'Win fewer tricks than every other diver.', { k: 'cmp', op: 'fewer', vs: 'each' }),
  /* 3 */ J([2, 2, 3], 'Win more tricks than the Commander does.', { k: 'cmp', op: 'more', vs: 'cap', cap: 0 }),
  /* 4 */ J([2, 2, 2], 'Win fewer tricks than the Commander does.', { k: 'cmp', op: 'fewer', vs: 'cap', cap: 0 }),
  /* 5 */ J([4, 3, 3], 'Win exactly as many tricks as the Commander does.', { k: 'cmp', op: 'eq', vs: 'cap', cap: 0 }),
  /* 6 */ J([2, 3, 3], 'Win a trick in which every card is lower than 7 (no Lanterns).', { k: 'trick', p: 'lt', v: 7 }),
  /* 7 */ J([2, 3, 4], 'Win a trick in which every card is higher than 5.', { k: 'trick', p: 'gt', v: 5 }),
  /* 8 */ J([2, 3, 3], 'Win a trick by playing a 6.', { k: 'with', v: 6 }),
  /* 9 */ J([2, 3, 4], 'Win a trick by playing a 5.', { k: 'with', v: 5 }),
  /* 10 */ J([3, 4, 5], 'Win a trick by playing a 3.', { k: 'with', v: 3 }),
  /* 11 */ J([1, 2, 2], 'Win a 5 by playing a 7.', { k: 'with', v: 7, cp: 5 }),
  /* 12 */ J([3, 4, 5], 'Win an 8 by playing a 4.', { k: 'with', v: 4, cp: 8 }),
  /* 13 */ J([2, 3, 4], 'Win a 6 by playing another 6.', { k: 'with', v: 6, cp: 6 }),
  /* 14 */ J([3, 4, 5], 'Win a trick by playing a 2.', { k: 'with', v: 2 }),
  /* 15 */ J([1, 1, 1], 'Win the Coral 3.', { k: 'cards', cs: [card(CO, 3)] }),
  /* 16 */ J([1, 1, 1], 'Win the Sunstar 1.', { k: 'cards', cs: [card(SU, 1)] }),
  /* 17 */ J([1, 1, 1], 'Win the Tide 4.', { k: 'cards', cs: [card(TI, 4)] }),
  /* 18 */ J([1, 1, 1], 'Win the Kelp 6.', { k: 'cards', cs: [card(KE, 6)] }),
  /* 19 */ J([3, 4, 5], 'Win all four 3s.', { k: 'valn', v: 3, n: 4, op: 'ex' }),
  /* 20 */ J([3, 4, 5], 'Win at least three 5s.', { k: 'valn', v: 5, n: 3, op: 'ge' }),
  /* 21 */ J([3, 4, 5], 'Win at least three 9s.', { k: 'valn', v: 9, n: 3, op: 'ge' }),
  /* 22 */ J([2, 2, 2], 'Win at least two 7s.', { k: 'valn', v: 7, n: 2, op: 'ge' }),
  /* 23 */ J([4, 5, 6], 'Win all four 9s.', { k: 'valn', v: 9, n: 4, op: 'ex' }),
  /* 24 */ J([3, 4, 4], 'Win exactly three 6s.', { k: 'valn', v: 6, n: 3, op: 'ex' }),
  /* 25 */ J([2, 3, 3], 'Win exactly two 9s.', { k: 'valn', v: 9, n: 2, op: 'ex' }),
  /* 26 */ J([2, 3, 3], 'Win the Tide 1, 2 and 3.', { k: 'cards', cs: [card(TI, 1), card(TI, 2), card(TI, 3)] }),
  /* 27 */ J([2, 2, 3], 'Win the Tide 6 and the Sunstar 7.', { k: 'cards', cs: [card(TI, 6), card(SU, 7)] }),
  /* 28 */ J([2, 2, 3], 'Win the Coral 5 and the Sunstar 6.', { k: 'cards', cs: [card(CO, 5), card(SU, 6)] }),
  /* 29 */ J([2, 2, 3], 'Win the Kelp 5 and the Tide 8.', { k: 'cards', cs: [card(KE, 5), card(TI, 8)] }),
  /* 30 */ J([2, 2, 3], 'Win the Tide 5 and the Coral 8.', { k: 'cards', cs: [card(TI, 5), card(CO, 8)] }),
  /* 31 */ J([2, 2, 3], 'Win the Coral 9 and the Sunstar 8.', { k: 'cards', cs: [card(CO, 9), card(SU, 8)] }),
  /* 32 */ J([2, 2, 2], 'Win the Coral 1 and the Kelp 7.', { k: 'cards', cs: [card(CO, 1), card(KE, 7)] }),
  /* 33 */ J([2, 3, 3], 'Win the Sunstar 9 and the Tide 7.', { k: 'cards', cs: [card(SU, 9), card(TI, 7)] }),
  /* 34 */ J([3, 4, 4], 'Win the Kelp 3, the Sunstar 4 and the Sunstar 5.', { k: 'cards', cs: [card(KE, 3), card(SU, 4), card(SU, 5)] }),
  /* 35 */ J([3, 4, 5], 'Win the Kelp 2 in the very last trick.', { k: 'cards', cs: [card(KE, 2)], last: 1 }),
  /* 36 */ J([4, 4, 4], 'Win exactly one Coral card and exactly one Kelp card.', { k: 'colx', parts: [{ c: CO, n: 1, op: 'ex' }, { c: KE, n: 1, op: 'ex' }] }),
  /* 37 */ J([3, 3, 3], 'Win at least seven Sunstar cards.', { k: 'coln', c: SU, n: 7, op: 'ge' }),
  /* 38 */ J([2, 3, 3], 'Win at least five Coral cards.', { k: 'coln', c: CO, n: 5, op: 'ge' }),
  /* 39 */ J([3, 4, 4], 'Win exactly two Kelp cards.', { k: 'coln', c: KE, n: 2, op: 'ex' }),
  /* 40 */ J([3, 4, 4], 'Win exactly two Tide cards.', { k: 'coln', c: TI, n: 2, op: 'ex' }),
  /* 41 */ J([3, 3, 4], 'Win exactly one Coral card.', { k: 'coln', c: CO, n: 1, op: 'ex' }),
  /* 42 */ J([2, 2, 2], 'Win no Coral cards.', { k: 'avoidc', cs: [CO] }),
  /* 43 */ J([2, 3, 4], 'Win at least one card of each colour (Lanterns do not count).', { k: 'allcol' }),
  /* 44 */ J([3, 4, 5], 'Win every card of at least one colour.', { k: 'onecol' }),
  /* 45 */ J([2, 5, 6], 'Win a trick that holds only even numbers (2, 4, 6, 8).', { k: 'trick', p: 'even' }),
  /* 46 */ J([2, 4, 5], 'Win a trick that holds only odd numbers (1, 3, 5, 7, 9).', { k: 'trick', p: 'odd' }),
  /* 47 */ J([3, 3, 4], 'Win a trick worth more than 23 / 28 / 31 (3 / 4 / 5 divers), no Lanterns.', { k: 'trick', p: 'sumgt', th: [23, 28, 31] }),
  /* 48 */ J([3, 3, 4], 'Win a trick worth less than 8 / 12 / 16 (3 / 4 / 5 divers), no Lanterns.', { k: 'trick', p: 'sumlt', th: [8, 12, 16] }),
  /* 49 */ J([3, 3, 4], 'Win a trick whose card values add up to 22 or 23.', { k: 'trick', p: 'sumeq', vs: [22, 23] }),
  /* 50 */ J([3, 3, 3], 'Win exactly one Lantern.', { k: 'subx', n: 1, redeal: 'all4' }),
  /* 51 */ J([3, 3, 3], 'Win the Lantern 1 and no other Lantern.', { k: 'subx', n: 1, only: 1, redeal: 'l1' }),
  /* 52 */ J([3, 3, 3], 'Win the Lantern 2 and no other Lantern.', { k: 'subx', n: 1, only: 2, redeal: 'l2' }),
  /* 53 */ J([1, 1, 1], 'Win the Lantern 3.', { k: 'cards', cs: [card(LA, 3)] }),
  /* 54 */ J([3, 3, 4], 'Win exactly two Lanterns.', { k: 'subx', n: 2, redeal: 'l234' }),
  /* 55 */ J([3, 4, 4], 'Win exactly three Lanterns.', { k: 'subx', n: 3, redeal: 'all4' }),
  /* 56 */ J([1, 1, 1], 'Win no Lanterns.', { k: 'avoidsub' }),
  /* 57 */ J([3, 3, 3], 'Win the Coral 7 using a Lantern.', { k: 'wsub', c: card(CO, 7) }),
  /* 58 */ J([3, 3, 3], 'Win the Kelp 9 using a Lantern.', { k: 'wsub', c: card(KE, 9) }),
  /* 59 */ J([4, 3, 3], 'Never lead a trick with Coral, Sunstar or Tide.', { k: 'nolead', cs: [CO, SU, TI] }),
  /* 60 */ J([2, 1, 1], 'Never lead a trick with Coral or Kelp.', { k: 'nolead', cs: [CO, KE] }),
  /* 61 */ J([2, 2, 2], 'Win no Kelp cards.', { k: 'avoidc', cs: [KE] }),
  /* 62 */ J([2, 2, 2], 'Win no Sunstar cards.', { k: 'avoidc', cs: [SU] }),
  /* 63 */ J([3, 3, 3], 'Win no Coral and no Tide cards.', { k: 'avoidc', cs: [CO, TI] }),
  /* 64 */ J([3, 3, 3], 'Win no Sunstar and no Kelp cards.', { k: 'avoidc', cs: [SU, KE] }),
  /* 65 */ J([3, 3, 2], 'Win no 8s and no 9s.', { k: 'avoidv', vs: [8, 9] }),
  /* 66 */ J([1, 1, 1], 'Win no 9s.', { k: 'avoidv', vs: [9] }),
  /* 67 */ J([1, 2, 2], 'Win no 5s.', { k: 'avoidv', vs: [5] }),
  /* 68 */ J([2, 2, 2], 'Win no 1s.', { k: 'avoidv', vs: [1] }),
  /* 69 */ J([3, 3, 3], 'Win no 1s, 2s or 3s.', { k: 'avoidv', vs: [1, 2, 3] }),
  /* 70 */ J([1, 2, 3], 'Win none of the first four tricks.', { k: 'skip', n: 4 }),
  /* 71 */ J([1, 2, 2], 'Win none of the first three tricks.', { k: 'skip', n: 3 }),
  /* 72 */ J([2, 3, 3], 'Win none of the first five tricks.', { k: 'skip', n: 5 }),
  /* 73 */ J([4, 3, 3], 'Win no tricks at all.', { k: 'none' }),
  /* 74 */ J([3, 2, 2], 'Never win two tricks in a row.', { k: 'run', n: 2, m: 'no' }),
  /* 75 */ J([2, 3, 3], 'Win the very last trick.', { k: 'pos', last: 1 }),
  /* 76 */ J([2, 3, 4], 'Win the first three tricks.', { k: 'pos', first: 3 }),
  /* 77 */ J([1, 1, 2], 'Win the first two tricks.', { k: 'pos', first: 2 }),
  /* 78 */ J([1, 1, 1], 'Win the first trick.', { k: 'pos', first: 1 }),
  /* 79 */ J([3, 4, 4], 'Win both the first and the last trick.', { k: 'pos', first: 1, last: 1 }),
  /* 80 */ J([4, 4, 4], 'Win the last trick and no other trick.', { k: 'pos', last: 1, only: 1 }),
  /* 81 */ J([4, 3, 3], 'Win the first trick and no other trick.', { k: 'pos', first: 1, only: 1 }),
  /* 82 */ J([3, 2, 2], 'Win exactly one trick.', { k: 'ntr', n: 1 }),
  /* 83 */ J([2, 2, 2], 'Win exactly two tricks.', { k: 'ntr', n: 2 }),
  /* 84 */ J([1, 1, 1], 'Win two tricks in a row.', { k: 'run', n: 2, m: 'ge' }),
  /* 85 */ J([2, 3, 4], 'Win three tricks in a row.', { k: 'run', n: 3, m: 'ge' }),
  /* 86 */ J([2, 3, 5], 'Win exactly four tricks.', { k: 'ntr', n: 4 }),
  /* 87 */ J([3, 3, 4], 'Win exactly three tricks, one straight after the other.', { k: 'run', n: 3, m: 'ex' }),
  /* 88 */ J([3, 3, 3], 'Win exactly two tricks, one straight after the other.', { k: 'run', n: 2, m: 'ex' }),
  /* 89 */ J([3, 2, 2], 'Predict your exact number of tricks, out loud for everybody to see.', { k: 'pred', open: 1 }),
  /* 90 */ J([4, 3, 3], 'Predict your exact number of tricks and keep the number secret.', { k: 'pred', open: 0 }),
  /* 91 */ J([4, 4, 4], 'Win as many Coral cards as Sunstar cards (at least one of each).', { k: 'eqcol', a: CO, b: SU }),
  /* 92 */ J([2, 3, 3], 'Win a trick holding as many Kelp as Sunstar cards (at least one each).', { k: 'eqcol', a: KE, b: SU, tr: 1 }),
  /* 93 */ J([2, 3, 3], 'Win a trick holding as many Coral as Tide cards (at least one each).', { k: 'eqcol', a: CO, b: TI, tr: 1 }),
  /* 94 */ J([1, 1, 1], 'Win more Sunstar cards than Tide cards (no Tide at all is fine).', { k: 'morecol', a: SU, b: TI }),
  /* 95 */ J([1, 1, 1], 'Win more Coral cards than Kelp cards (no Kelp at all is fine).', { k: 'morecol', a: CO, b: KE })
];
const SHORT = ['Most tricks', 'More than all others', 'Fewest tricks', 'More than Commander', 'Fewer than Commander', 'Same as Commander', 'Trick all below 7', 'Trick all above 5', 'Win with a 6', 'Win with a 5', 'Win with a 3', 'Win a 5 with a 7', 'Win an 8 with a 4', 'Win a 6 with a 6', 'Win with a 2',
  'Coral 3', 'Sunstar 1', 'Tide 4', 'Kelp 6', 'All four 3s', 'Three or more 5s', 'Three or more 9s', 'Two or more 7s', 'All four 9s', 'Exactly three 6s', 'Exactly two 9s', 'Tide 1, 2, 3', 'Tide 6 + Sunstar 7', 'Coral 5 + Sunstar 6', 'Kelp 5 + Tide 8', 'Tide 5 + Coral 8', 'Coral 9 + Sunstar 8', 'Coral 1 + Kelp 7', 'Sunstar 9 + Tide 7', 'Kelp 3, Sunstar 4+5', 'Kelp 2 in last trick',
  'One Coral, one Kelp', '7+ Sunstar cards', '5+ Coral cards', 'Exactly 2 Kelp', 'Exactly 2 Tide', 'Exactly 1 Coral', 'No Coral', 'One of each colour', 'A whole colour', 'Trick of evens', 'Trick of odds', 'Rich trick', 'Poor trick', 'Trick of 22 or 23', 'Exactly one Lantern', 'Lantern 1 only', 'Lantern 2 only', 'Lantern 3', 'Exactly two Lanterns', 'Exactly three Lanterns', 'No Lanterns', 'Coral 7 by Lantern', 'Kelp 9 by Lantern',
  'Lead no Coral/Sun/Tide', 'Lead no Coral/Kelp', 'No Kelp', 'No Sunstar', 'No Coral or Tide', 'No Sunstar or Kelp', 'No 8s or 9s', 'No 9s', 'No 5s', 'No 1s', 'No 1s, 2s, 3s', 'None of first four', 'None of first three', 'None of first five', 'No tricks', 'Never two in a row', 'The last trick', 'First three tricks', 'First two tricks', 'The first trick', 'First and last', 'Only the last', 'Only the first', 'Exactly 1 trick', 'Exactly 2 tricks', '2 tricks in a row', '3 tricks in a row', 'Exactly 4 tricks', 'Exactly 3 in a row', 'Exactly 2 in a row', 'Predict (open)', 'Predict (secret)', 'Coral = Sunstar', 'Kelp = Sunstar in a trick', 'Coral = Tide in a trick', 'Sunstar over Tide', 'Coral over Kelp'];
TASKS.forEach((t, i) => { t.id = i; t.s = SHORT[i]; });

// ---- the 32 dives. d = overall difficulty (job cards are drawn until the 3/4/5-diver values add up to exactly d)
// cmt: normal | murky (show a card, no token) | narc (shared pool of players-2 tokens) | unknown (draw a colour card: 1-3 normal, 4-6 murky, 7-9 narc) | none
// sel: draft | free | vote | cmd | one | two | cmdnone | hard | fixed
// guess:1 = the difficulty value could not be read in the research sources (see rules-notes.md)
const M = (id, name, d, o) => Object.assign({ id, name, d, cmt: 'normal', sel: 'draft' }, o);
const MISSIONS = [
  M(1, 'Shallow Water', 1, { brief: 'Training day in the bay. One small job, then the logbook is yours.' }),
  M(2, 'The First Tide', 2, { brief: 'Two stone tablets came up in a fishing net. The crew dives to find where they came from.' }),
  M(3, 'Air, Power, Light', 4, { brief: 'A base waits on the sea floor. Learn its three life systems before you move in.' }),
  M(4, 'The Long Descent', 4, { guess: 1, brief: 'You pilot the little submersible down yourselves. Everybody else watches the dark rise past the windows.' }),
  M(5, 'Five Chambers', 5, { brief: 'Walk the five chambers of the base and report that every system hums.' }),
  M(6, 'One Diver Swims Alone', 5, { sel: 'vote', rule: 'The whole crew agrees, without a word about cards, which one diver takes every job.', brief: 'A porthole was opened too early. Somebody has to fix it, and fast.' }),
  M(7, 'Mapping the Slope', 6, { brief: 'First proper outing: test the suits and chart the ground around the base.' }),
  M(8, 'Share the Pearls', 6, { guess: 1, gap: { v: 9, gap: 2 }, rule: 'No diver may ever have won two more 9s than any other diver.', brief: 'The pearl rations are disappearing. Time for a talk about sharing.' }),
  M(9, 'The Old Wreck', 7, { cmt: 'murky', rule: 'Murky water: to signal, show a card as usual, but the ping token does not go on it. Put it beside the card, spent side up.', brief: 'A centuries-old ship lies close by. Strong currents blur every message.' }),
  M(10, 'The Inscription', 4, { sel: 'cmd', rule: 'The Commander takes every job, or hands them all to a willing diver. If handed over, all signalling must happen before the first trick.', brief: 'Inside the wreck: a tablet covered in carved signs, snapped off at the bottom.' }),
  M(11, 'Whispers', 8, { cmt: 'narc', rule: 'Deep narcosis: there are two fewer ping tokens than divers and they sit in the middle. Anyone may take one at any time between tricks, silently, and signal at once. Several signals by one diver are allowed.', brief: 'The base answered. Nobody is surprised but you. You move the talk to a secure channel.' }),
  M(12, 'The Quiet Lead', 6, { guess: 1, m12: 1, rule: 'No trick may be led with a Coral card or a Lantern.', brief: 'The tablet is fragile. Handle it with extreme care, and never start the cutting with the loud tools.' }),
  M(13, 'Charting the Region', 5, { sel: 'cmd', rule: 'The Commander takes every job, or hands them all to a willing diver. If handed over, all signalling must happen before the first trick.', brief: 'The carvings describe a coast that does not exist here. Draw up a plan to survey the water.' }),
  M(14, 'Emergency Drill', 4, { guess: 1, sel: 'one', timer: { sec: 210, alt: 'murky' }, rule: 'One volunteer takes all the jobs. Beat the clock (3:30), or play without a clock and use murky water.', brief: 'An alarm drill, at the worst possible moment.' }),
  M(15, 'Jellyfish Bloom', 5, { guess: 1, sel: 'one', timer: { sec: 180, alt: 'narc' }, rule: 'One volunteer takes all the jobs. Beat the clock (3:00), or play without a clock and use deep narcosis.', brief: 'A swarm drifts into the base. One diver is stranded outside and a suit is torn.' }),
  M(16, 'The Leak', 6, { sel: 'one', timer: { sec: 150, alt: 'none' }, rule: 'One volunteer takes all the jobs. Beat the clock (2:30), or play without a clock and without any signalling.', brief: 'The injured diver needs care and the infirmary is flooding. Both at once.' }),
  M(17, 'The Singing Statues', 9, { sel: 'free', rule: 'Open briefing: talk freely about who takes which job, but never about your cards. One diver may take all jobs.', brief: 'The sculptures seem to be older than anything on record, and the crew works as one.' }),
  M(18, 'The Hollow', 9, { brief: 'The way to the next chamber is close. Something about it feels wrong.' }),
  M(19, 'The Narrow Cave', 9, { sel: 'hard', rule: 'The Commander takes the most difficult job first.', brief: 'A drone found a maze of tunnels, some only one diver wide.' }),
  M(20, 'The Labyrinth', 10, { cmt: 'unknown', gap: { v: 1, gap: 2 }, rule: 'Unknown waters: before dealing, draw a colour card at random. 1-3: normal signalling, 4-6: murky water, 7-9: deep narcosis. No diver may ever have won two more 1s than any other diver.', brief: 'The tunnels fork again and again, and the radio keeps dropping out.' }),
  M(21, 'Echoes', 10, { guess: 1, cmt: 'unknown', gap: { v: 1, gap: 2 }, rule: 'Unknown waters: draw a colour card first (1-3 normal, 4-6 murky, 7-9 deep narcosis). No diver may ever have won two more 1s than any other diver.', brief: 'The base computer has finished its analysis. It has also given itself a name.' }),
  M(22, 'The Sunken Archive', 11, { cmt: 'unknown', rule: 'Unknown waters: draw a colour card first (1-3 normal, 4-6 murky, 7-9 deep narcosis).', brief: 'Rooms full of shelves, and not one of them was built by anybody you know.' }),
  M(23, 'Single File', 11, { guess: 1, cmt: 'unknown', m23: 1, rule: 'Unknown waters: draw a colour card first. No signalling until just before the second trick. The winner of the first trick must always have more tricks than any other diver.', brief: 'A dangerously narrow bend. Follow the leader and do not waste a breath.' }),
  M(24, 'Cold Rations', 12, { cmt: 'unknown', rule: 'Unknown waters: draw a colour card first (1-3 normal, 4-6 murky, 7-9 deep narcosis).', brief: 'Not very deep any more, but it feels that way. Dinner is a paste in a tube.' }),
  M(25, 'The Lightbearer', 12, { cmt: 'unknown', sel: 'cmdnone', rule: 'Unknown waters: draw a colour card first. The Commander never takes a job: skip the Commander each time round.', brief: 'Creatures flee from your lamps into the cracks. You are not wanted here.' }),
  M(26, 'The Giant in the Dark', 10, { cmt: 'unknown', sel: 'two', timer: { sec: 300, alt: null, altD: 12 }, rule: 'Unknown waters: draw a colour card first. Two volunteers take all the jobs, at least one each. Beat the clock (5:00) at difficulty 10, or play without a clock at difficulty 12.', brief: 'A giant squid fills the tunnel behind you. Decoys, thrusters, everything!' }),
  M(27, 'The Glow Path', 12, { guess: 1, cmt: 'unknown', m27: 1, rule: 'Unknown waters: draw a colour card first. The Sunstar 5 must be the very last card played in the final trick of the dive (with three divers it may not be the card left over).', brief: 'Lights show a path through the weeds, and a yellow glow waits at the end.' }),
  M(28, 'The Paved Road', 14, { sel: 'free', rule: 'Open briefing: talk freely about who takes which job, but never about your cards.', brief: 'The sea floor looks paved. Somebody walked here, long ago.' }),
  M(29, 'Reputation', 15, { sel: 'free', rule: 'Open briefing: talk freely about who takes which job, but never about your cards.', brief: 'There are things you would not write in the official report.' }),
  M(30, 'The Shadow', 16, { sel: 'free', rule: 'Open briefing: talk freely about who takes which job, but never about your cards.', brief: 'Something terrible once happened in this place, and its shadow is still here.' }),
  M(31, 'The Flood Carvings', 17, { sel: 'free', rule: 'Open briefing: talk freely about who takes which job, but never about your cards.', brief: 'Pictures of a great flood, scratched into the rock as a warning.' }),
  M(32, 'The Last Corridor', 0, { sel: 'fixed', fixed: [73, 87, 84, 79], rule: 'The four jobs are fixed: no tricks at all; exactly three tricks in a row; two tricks in a row; the first and the last trick. Take them clockwise as usual.', brief: 'The light is fading. Concentrate. One mistake and the dark closes in.' })
];
const DEEP = { start: 18, sel: 'free', note: 'After dive 32: start at difficulty 18 and raise it by one for every dive you complete. Open briefing every time. Attempts are no longer counted; only whether the distress flare was used.' };
const NAMES = ['Nerea', 'Bram', 'Sumi', 'Dag', 'Lio'];
const BLURBS = [
  { story: 'Nerea trained as a harbour pilot and counts everything twice: air, minutes, and the cards on the table.', enjoy: 'Choose Nerea if you like a careful teammate who plans the whole dive.', lv: 'hard' },
  { story: 'Bram fixes pumps for a living and trusts his hands more than maps. He plays his cards and hopes for the best.', enjoy: 'Choose Bram if you like a steady crewmate who rarely panics.', lv: 'normal' },
  { story: 'Sumi studies deep-sea fish and signals the moment she sees something useful. She loves a good ping.', enjoy: 'Choose Sumi if you like a teammate who talks with her tokens.', lv: 'normal' },
  { story: 'Dag is new to diving and gets every job he can carry. He is learning, and he is cheerful about it.', enjoy: 'Choose Dag if you want a relaxed first dive with room for mistakes.', lv: 'easy' }
];
const HELPER = { name: 'Echo', story: 'Echo is the little drone that rides along on two-diver dives. Its cards lie face up in a double row; the Commander flies it.' };
const DATA = {
  v: 1, suits: SUITS, tasks: TASKS, missions: MISSIONS, deep: DEEP, names: NAMES, blurbs: BLURBS, helper: HELPER,
  ncards: 40, ntasks: TASKS.length,
  // card value limits: colour 1..9, lanterns 1..4
  card, suitOf: id => id < 36 ? Math.floor(id / 9) : 4, valOf: id => id < 36 ? id % 9 + 1 : id - 36 + 1,
  cardName: id => (id < 36 ? SUITS[Math.floor(id / 9)].name + ' ' + (id % 9 + 1) : 'Lantern ' + (id - 36 + 1))
};
g.LDDATA = DATA;
if (typeof module === 'object' && module.exports) module.exports = DATA;
})(typeof globalThis !== 'undefined' ? globalThis : this);
