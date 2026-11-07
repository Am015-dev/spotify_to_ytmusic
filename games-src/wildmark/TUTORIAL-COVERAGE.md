# Wildmark tutorial coverage

The tutorial is one real, short solo game (fixed seed 11, market stacked each turn by `tutFix`). It runs 3 turns, from the starting
tiles to the final score and result screen. It has 4 chapters. Proof: `node tutorial-end.js` drives it by real taps at 390x763 and
1440x860. It asserts every step below was shown and every spotlit target is uncovered (PASS on both sizes, W376).

Legend: [x] taught by doing or seeing it in the tutorial; [~] taught elsewhere, never in the tutorial (honest gap).

## Chapter 1: First turn
- [x] Goal: 20 turns, grow a valley, most points wins. Step `goal`.
- [x] Each animal scores its own pattern; the chips show the points. Step `cards`.
- [x] Setup: everyone starts with 3 starting tiles. Seen on the board at step `goal`.
- [x] The market: take one tile and the animal under it. Step `take`.
- [x] A tile must touch your valley; tap a glowing spot. Step `spot`.
- [x] Confirm the placement (Place). Step `ok`.
- [x] An animal only goes on an empty tile that shows that animal. Step `tok`.
- [x] Keystone (single terrain, gold rim): an animal there earns an acorn. Steps `tok` and `acorn`.

## Chapter 2: Scoring
- [x] Split tiles can be turned so matching edges touch. Step `rot`.
- [x] Habitat scoring: 1 point per tile in your largest joined group of a terrain. Step `ok2` (and the "+1 habitat" toast).
- [x] Bear card: pairs score. Steps `take2`, `spot2`, `tok2`, `pair` (the pair lights up, +4).
- [~] The other animal cards (elk lines, salmon runs, lone hawks, fox neighbours). Step `cards` points at them, and each score
  toast states the card's rule the first time it scores. They are not built in the tutorial.

## Chapter 3: Special moves
- [x] Three matching animals in the market may be swept once per turn. Step `sweep`.
- [x] Spend an acorn: any tile with any animal. Steps `free`, `freet`, `freek`.
- [x] Placing an animal is optional: return it if it would spoil a pattern. Step `tok3`.
- [~] Spend an acorn to replace any animals in the market. Help drawer ("Keystones and acorns"); the button is visible in step `free`.
- [~] Four matching animals are replaced automatically. Help drawer ("Crowded market").
- [~] The acorn supply holds 25; an empty supply gives no acorn (engine rule, rules-test `acorn-supply-25`). Not in the tutorial.
- [~] Market pairs never move; taken slots refill in place (engine rule, rules-test `market-pairs-stay`). Seen in every turn.
- [x] Solo: the rightmost tile and animal leave the market after each turn. Seen between the tutorial turns (solo game).

## Chapter 4: Final score
- [x] Final scoring: animals plus habitats plus unused acorns (1 point each). Step `end`, result table.
- [~] Habitat majority bonus with rivals (2 players 2/tie 1; 3-4 players 3 and 1). Not in the solo tutorial; the result table marks
  it "+" in a real game, and the help drawer explains it.
- [~] Tie-break: most acorns left, then a shared win. Help drawer ("Ties").
- [~] The rival's turn. Not in the tutorial (solo); the first Quick game shows it step by step with a "<Rival>'s turn" banner and captions.

Not covered (time, W376): a two-player tutorial with the rival's turn and the majority bonus; the story narrative (ADDENDUM 3).
