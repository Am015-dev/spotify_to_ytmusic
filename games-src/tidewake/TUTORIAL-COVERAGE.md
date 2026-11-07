# Tidewake: tutorial coverage (the Lantern Race, a coached first game)

Since W411 the tutorial is a REAL game, not forced steps. You (Vermilion) race Cobalt (the real computer, easy) under Grandmother Osk's eye.
Every legal move is allowed from turn 1. The only forced taps are the intro bubble ("Next") and its card ("Cast off"): 2.
The piles are only reordered (`oskRig` in `game/ui10.js`): the Rift Gate is in your first hand, two Deck Cannons are on top of the tile pile, and the Maelstrom and the Rogue Wave rise early.
Osk speaks just in time: once per rule, the first time it matters, in one bubble docked in the side panel. It never sits over the board, never blocks a tap and closes with x.
She also comments on Cobalt's moves and on a good or poor move of yours. At the end a 4-card walk counts the race with your real numbers.
Its last card, "Things you'll meet later", lists every rule that did not come up.
Words: `game/texts.js` (`OSK_TEXT`, `OSK_RIVAL`). Logic: `game/ui10.js`. Story: STORY.md (the prologue "The Lantern Race"; finishing it offers "Start chapter 1").
Proof: `game/coach-test.js` plays the whole game from fresh storage with random legal moves, all by UI taps, at 390x763 and 1440x860.
It asserts that every rule below was seen on screen or on the later card, at most 2 forced taps, the bubble is never over the board, never two bubbles, and 0 console errors.

| Rule (id) | When Osk explains it (trigger) | Story beat |
|---|---|---|
| [x] goal: last junk afloat wins (goal) | intro step before the first move | "Cobalt swears the Reach is his. Last junk afloat keeps the lantern." |
| [x] choose a start mark; blocked-start relocation (reloc) | as soon as your junk sits on its mark; again if a relocation choice appears | "If a leviathan blocks your start before you sail, move to another free mark" |
| [x] dice: 6, 7 or 8 wakes the leviathans, other totals calm (roll) | first roll, with the real total | "Dice at dawn" |
| [x] leviathan move: one square along an arrow, or a turn (levmove) | first leviathan move in the log | "The deep stirs" |
| [x] lay a tile at your bow: pick, turn, place; SAFE / SINKS (lay) | your first lay turn | "Lay a current" |
| [x] sail to the end of the wake; draw back to 3 (sail) | after your first tile | "Well sailed!" |
| [x] sail on through other captains' tiles (chain) | Cobalt's first tile (rival comment) | "Cobalt moves" |
| [x] two junks on one wake both sink (collide) | Cobalt's second tile, or a collision | "Mind his wake" |
| [x] a leviathan entering a square destroys the tile and sinks the junk (levsink) | first such event, or your junk next to a leviathan | "Leviathans bite" |
| [x] Deck Cannon: keep it, fire it to save yourself (cannon) | you draw one (the keep/discard card) or hold one | "A Deck Cannon!" |
| [x] Rogue Wave: roll its strength or capsize, it grows (wave) | the wave rises | "Rogue Wave!" |
| [x] Rift Gate: lay it, or keep it to escape when you would sink (gate) | you hold it (first lay turn) or one opens | "A Rift Gate" |
| [x] Maelstrom: moves on calm rolls, swallows what it enters (mael) | it rises | "The Maelstrom" |
| [x] elimination swap: sink a rival, swap tiles with his hand (swap) | your second lay turn while Cobalt floats, or the swap card | "Sink him, gain tiles" |
| [x] end: last junk afloat wins (end) | game over: Osk's line, then walk card 3 "The one rule that scores" | "The lantern" |
| [x] tie: the last junks sink together = draw (tie) | if it happens; else the later card | "A shared fate" |
| [x] teams and solo variants (more) | always on the later card (not in a 2-captain race) | "Teams and solo" |

Measured (coach-test.js, random legal moves, 2 runs per size): 13-15 of 17 rules came up on screen during the game. The rest (usually tie, more, sometimes cannon) were on the later card.
Scoring walk (4 cards): How it ended (each junk's fate), Currents laid (yours and Cobalt's, number of turns), The one rule that scores (who won and why), Things you'll meet later.
The old forced-step tutorial (17 spotlight steps, `game/tutor-test.js`) was removed. `src/tutscript.js` (its scripted dice) stays in the build, unused, and its own engine test still passes.
