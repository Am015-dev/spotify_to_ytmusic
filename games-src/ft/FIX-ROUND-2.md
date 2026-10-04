# Sands of Qamar: fix round, stage 2 (Oct 2026)

Preview: `games/sands-of-qamar-next/index.html` (new, stamped). Live `games/sands-of-qamar/` untouched.

## What changed
- **Shared kit** (`src/ui9.js`, `src/refdata.js`, `src/kit.css`, build.py): the Menu replaces the loose top-bar toggles (sound, music,
  speed, gear, New game) and the old Settings/Menu drawers; all options kept (graphics Auto/High/Medium/Low, sound, music, guide on/off,
  new game, save). "Cards" reference: 80 entries (tribes, tiles, goods, 28 djinns each with its own sign, items, Cutpurses, pieces) with
  counts, search, chips, big view; the djinn row on the board opens it. Undo of your own steps (sealed on a turn change or any draw; the
  drop-by-drop undo inside a move stays). "Since your turn" strip replaces the "While you waited…" block that pushed the bid buttons below
  the fold. `GNS.result` + 10 achievements, offline, About. Developer tools only with `?dev=1`. Colour-blind marks on tribe dots and
  player chips. Rematch button at game over.
- **Guided first game** (title → "Guided first game"): you against an easy computer on a fixed sultanate; round 1 explained in 5 steps
  (bid, move, tribe, tile, end of turn), each with a "why" and one glowing button (the suggested move); then "Now you lead".
- **Computer levels** (`levels.js`, 2 players, seats swapped): before, hard vs easy 50%. Now easy ignores the Advisor majority and goods
  sets and overbids; hard looks one move ahead. Hard–easy 20–0, normal–easy 20–0, hard–normal 31–9 (78%), 3 players 10–2.
- **Rules text:** equal totals share the win (as the engine already did; rulebook not re-checked, see below); "In one minute" summary and
  word list; "an Advisor"; no "the end is near" line after the game.

## Tests (final build)
| Test | Result |
|---|---|
| rules-test.js (new) | 5 passed |
| net-strip-test.js (new: no RNG, decks sorted, poisoned copy identical) | 12 games, 399 packets, 0 leaks, 0 differences |
| gauntlet.js 2/3/4/5 players + expansions | 95 games, 0 errors, 0 stalls |
| cover.js 40 | 0 errors, 0 invariant failures (rare cards fire randomly, same as before) |
| click.js (7 configs) / click-phone.js | 0 errors / 0 errors |
| lay-d.js 1366x768, 1920x1080, 768x1024, 1100x700 | PROBLEMS 0 |
| lay-phone.js all 7 phone sizes | 0 problems at every size |
| kit-shots.js 390x763, 375x553, 844x390, 1366x768 | PROBLEMS 0 (guided steps 1–5 + undo at every size) |
| net/p2p-ft.js 3 players, LEAVE/REJOIN, p2p-ft-phone.js | pages agree, 0 errors |

Screenshots: `shots/kit/` (gitignored).

## Left
- Tie rule: the text now matches the engine (shared win); confirm against the rulebook.
- 3D pawns are still told apart by colour only (marks are in the 2D chips, not on the pawns); card art is code-drawn.
- Online: a rival's face-down Crafter items are sent to every client (the page hides them); relay timeout message (shared netroom).
- Google Fonts still loaded from the network.
