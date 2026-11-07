# Emberclimb: playable in one minute (W383)

Screens judged at 390x763 and 1440x860 (title, guide steps 1-3, quick pick, map, first turn, enemy turn, result), as a newcomer, with an impeccable-style critique (clarity, feedback, hierarchy, readability).

## The 10 worst problems (before) -> after

| # | Problem (before) | After |
|---|---|---|
| 1 | The enemy turn is invisible: tap End turn and ~0.6 s later everything has changed (your HP, enemy Block, Strength), no caption, no idea what happened. | FIXED: End turn starts a step-by-step enemy turn: 'Enemy turn' banner, then each enemy glows, the dock says what it does ("Gape Grub raises 6 Block and grows stronger (+3).") for 0.8 s, it acts with lunge/shake/pops, then the dock says the result ("You lost 7 HP (5 blocked by your Block).") for 0.9 s. Tap anywhere = 3x faster. Never instant (only ?anim=0 for tests). |
| 2 | No turn banner: nothing says whose turn it is. | FIXED: big centre banner 'Your turn' (green) / 'Enemy turn' (red) at every turn change, dock title says the same; removed when the fight ends. |
| 3 | Enemy intent is a cryptic glyph row ("sword 10 shield 5", "arrow +3"). You must tap it to learn what it means. | FIXED: intents read in words next to the icon: 'Hits 10', 'Block 6', 'Strength +3', 'Weak 1', '+2 Dazed', 'Spikes 7'; tap still explains. |
| 4 | The one instruction line is generic ("Tap a card to lift it. Out of energy? End turn.") and does not change with the situation (card lifted, out of energy, which enemy to tap). | FIXED: the dock line follows the situation: 'Tap a glowing card to pick it. You have 3 energy.' / 'Now tap the glowing enemy to play Cinder Strike.' / 'Tap Plate Guard again to play it.' / 'No more cards you can play. Tap End turn.' / enemy captions. |
| 5 | Nothing glows when a card is lifted: the enemy you should tap is not highlighted, and unplayable cards look almost the same as playable ones. | FIXED: lifting a card dims every other card; unplayable cards are grey; targets glow (kept); End turn pulses when nothing is playable. |
| 6 | Card pictures are empty broken frames on PC (temp glyph slot) and a coloured band on phone; type is only a small word. | FIXED: the empty temp frame glyph is dropped; the picture slot shows a code-drawn sword (attack), shield (skill) or arrow (power) until real art lands (slot kept). |
| 7 | The energy orb is a bare "3" with no label; newcomers do not know cards cost energy. | FIXED: 'Energy' label under the coin (13 px phone, 16 px PC). |
| 8 | Pile chips "↓ 5", "↺ 0" are cryptic. | FIXED: 'Draw 5' and 'Used 0'. |
| 9 | Hits show a bare number; no reason ("-6 Cinder Strike"), and the enemy's hit on you is gone before you look. | FIXED: pops carry the reason on a solid backing: '-6 Cinder Strike', '-3 poison', '-7 spikes', '+5 Blk'; the enemy's hit on you is also written in the dock until the next step. |
| 10 | Status chips ("Str 3") and the enemy name (13 px grey) are hard to read and explain nothing. | FIXED: status chips spelled out ('Strength 3', 'Vulnerable 2'), 14 px; enemy names white bold 15 px on a dark backing (17 px PC). |

Also (owner note): chapter 2 was too easy (first-legal bot 100%).

Chapter 2: new boss Warden Captain (iron-warden art, 56-60 HP) with a new move, Spikes: a 3-step loop Hits 11 -> Block 10 + Spikes 7 -> Hits 22. While Spikes are up, every attack card you play on it hurts you for 7 (Block soaks it). A thinking player plays skills on the spikes turn and blocks the 22. Bot (200 seeds 7000+, `node bal-c2.js 200`): first-legal 100% -> 80%, ai bot 95.5%.

## Also
- Help opens with 'How a turn works' in 5 short lines (first rules card, also first in every phase's list).
- Guide reward step spotlights the first reward card (was the whole row; its centre could be a gap).

## Tests (all at 390x763 unless noted)
- `node tools/tut-end.js`: tutorial from fresh storage, taps every spotlit element's centre (elementFromPoint must be the element), 7 steps, end card, 'Play a real game' opens the hero pick, Skip works: PASS phone + PC (1440x860).
- `node tools/play-taps.js both`: Quick game to its result and Story chapter 1 (guide) + chapter 2 to the chapter result by tapping only visible, uncovered UI, animations on: PASS.
- build-all --quick PASS (11/11 scenarios), rules-test 100 PASS, smoke PASS, ui-audit A-F 0 on phone, phone-s, pc. 0 console errors.
- Shots: playable-shots/ (title, first turn, rival turn, result; phone webp).

## Remaining
- Real card pictures and backgrounds still missing (code shapes stand in).
- Hand cards hide during the enemy turn (by design: focus on the enemy); a human could want to see them.
- Shared kit: Playwright 1.56.1 needs a browser-build-1194 shim in /opt/pw-browsers (outside the repo).

## Addendum 1: the tutorial is a real guided climb
`src/tutor.js` is now one short real climb (Warrior, seed 7, 7 rooms: fight, treasure, fight, campfire, shop, event, boss) played from setup to the
"Climb won" result screen against the real enemy AI, in 4 chapters (first fight; map, treasure and a harder fight; campfire, shop, event; boss and
the end). Leaving saves the chapter (`emberclimb.tutch`); the next launch starts there. Two free-play steps let the player win a fight on their own
(the bubble hides, the dock line instructs, End turn and potions stay live). Coverage checklist: TUTORIAL-COVERAGE.md. `tools/tut-end.js` plays the
whole guided climb at 390x763 and 1440x860 by tapping spotlit centres (uncovered) and fails if any of the 42 step ids was not shown.

## Addendum 2: tabletop rules
All 23 WRONG/MISSING items of games-src/rules-check/emberclimb.md fixed in the engine, each with a rules-test case R01-R23 (details in
rules-notes.md). Shelf numbers stay 3x the tabletop scale (`D.SCALE = 3`: Weak -3 per hit, Wrath +3 per hit and 3 HP to end a turn in it, rest heals
9, Shiv 3); caps in `D.CAPS`. UI follow-ups done here: intents use `E.previewHit`, Weak/Vulnerable/Poison texts, rest amount, Scry picker
(tap cards to discard, Done), Miracle button (+1 energy), multi-relic rewards. SIMPLIFIED items are stated in Help > "Simplified on purpose".
Balance after (`node bal.js 200`): Warrior 39%, Rogue 47%, Automaton 51%, Monk 36%; chapter 2 first-legal 83%, ai 95%.
Known: duo runs became easy (enemy HP x1.6 table is an approximation); 3-act mode (`opt.acts`) exists in the engine but Quick game still plays 1 act.
