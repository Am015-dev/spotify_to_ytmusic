# Wildmark rules notes (own words)

Components: 85 habitat tiles (25 single-terrain keystones, 5 per terrain, one animal each; 60 split tiles, 6 per terrain
pair, 2-3 animals), 5 starter triads, 100 animal tokens (20 each of bear, elk, salmon, hawk, fox), acorn tokens.
Setup: each player a starter triad; tile supply = players x 20 + 3 (solo: 43); 4 face-up tile+token pairs.
Turn: optional sweeps (four matching tokens sweep automatically, repeatedly; three matching may be swept once per turn);
acorn powers (take any tile with any token; replace any number of tokens); take a pair; place the tile adjacent to your
map in any rotation; place the token on an empty tile showing that animal or return it; a token on a keystone earns an
acorn. Refill. 20 turns each.
Scoring (A cards): bears in groups of exactly 2 (1-4+ pairs: 4/11/19/27); elk straight lines (1-4: 2/5/9/13, each elk
in one line); salmon runs where each salmon touches at most 2 salmon (1-7+: 2/5/8/12/16/20/25); hawks touching no hawk
(1-8+: 2/5/8/11/14/18/22/26); fox 1 per different animal adjacent. Habitats: largest connected group per terrain, edges
must match. Majority: 2 players 2 (tie 1 each); 3-4 players 3 first, 1 second, tie for first 2 each (three-way 1 each),
no second place after a tie. Solo: +2 per habitat of 7+. Acorns 1 point each. Tie-break: most acorns.

## Card sets B-D (implemented in src/cards.js; Quick game "Mixed B-D", Story act 3)
Bear B trio 10 each; C groups 1/2/3 = 2/5/8, +3 for one of each; D groups 2/3/4 = 5/8/13. Elk B shapes 1/2/triangle/diamond = 2/5/9/13;
C any group by size 2,4,7,10,14,18,23,28; D elk around one space by size 2,5,8,12,16,21. Salmon B runs 1-5+ = 2,4,9,11,17; C runs 3/4/5+ =
10/12/15; D 1 per salmon + 1 per touching animal. Hawk B lone hawks with a line of sight, 2-8+ = 5,9,12,16,20,24,28; C 3 per sight line;
D sight pairs by kinds between = 4,7,9,11. Fox B kinds of animal pairs next to it 1-3 = 3,5,7; C most common neighbour count; D fox pairs by
kinds of animal pairs around = 5,7,9,11.

## Cross-check against the rulebook online (7 Nov)
Checked against an online rules reference (rulespal.com/cascadia/rulebook) and the official rules PDF listing: tile supply 43/63/83 and
solo 43 = match; four-of-a-kind sweep (repeat) and optional three-of-a-kind once per turn = match; acorn powers = match; majority bonuses
(2p 2 / tie 1; 3-4p 3+1, two-way tie 2 each, 3-4-way tie 1 each, no second place after a tie, tie for second 0) = match; solo +2 for 7+ =
match; solo removal (tile and token furthest from the stacks) = match (we return that token to the bag); tie-break most acorns then shared
= match. Card patterns B-D match the reference descriptions; their POINT TABLES were not on the pages found, so the B-D numbers above are
from memory (guessed). The reference names the original game: kept as a URL only.

## Confirmed vs guessed
- Confirmed (well known): counts, turn order, sweeps, acorn powers, A-card point tables, habitat and majority rules.
- Guessed / simplified: exact tile terrain/animal distribution and starter triads are our own balanced set; elk lines
  are split greedily longest-first; the solo removal returns the token to the bag; B-D cards not yet implemented.
