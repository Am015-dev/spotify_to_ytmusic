# Tidewake playtest r1 — impatient first-timer (phone 390x763)

Shots dir: /tmp/claude-0/-home-user-spotify-to-ytmusic/1d2e1a4d-12fa-57fc-9474-f0613c3562e1/scratchpad/r1-9332/
Setup: default settings (Me vs computers, Standard, leviathans on). Skipped guided game. Result: **Victory in 10 turns, ~22 actions.** I made 4 tile placements total.

## Per-screen log
screenshot | what I think is happening | what I'd do | confidence 1-5 | confusion | fun 1-5
---|---|---|---|---|---
002.png | Title/menu. Big teal "Guided first game", smaller "Start with these settings". Lots of settings below the fold. | Skip guide, tap "Start with these settings" | 4 | Is "Start with these settings" the normal Play button? Doesn't read as Play. Which settings — I hadn't looked at them. | 3
003-Start_with_these.png | Board 6x6 with gold dots all around the edge, some serpent tiles already on board. "Choose your start. Tap an edge square, then a gold mark." | Tap "Best start" | 3 | Which colour am I? No idea. Why are there serpents already on the board? Two-step (square then mark) start is fiddly; Best start is a relief. | 3
004-Best_start.png | "Monster wake roll 5+3=8: the leviathans stir!" Red ship top col 2, blue ship right row 4. | Continue | 2 | Monster roll before I have done anything. Still don't know which ship is mine. | 3
005-Continue.png / 007 / 009 | "Vermilion is playing", "Vermilion rolls 5+3=8". Leviathans shuffle around one by one with pink arrows. | Wait, then Skip | 2 | Is Vermilion me? It says Vermilion "is playing" while I'm doing nothing — feels like a computer turn. Slow animation; I got bored. | 2
010-error.png | Suddenly my hand: 3 tiles with red ✗ / green ✓ badges, "Off the edge" warning on board, rotate buttons, Place (disabled). Hint: "Tap the glowing square in front of your ship to see your tiles." | Pick the ✓ tile | 4 | Hint text says tap the glowing square to see tiles but the tiles are already shown. Now I realise red ship at top = me (the ring/"start" label). The ✓/✗ badges are great. | 4
011-264_472.png | Preview line: "Stop: column 2, row 2". | Place | 4 | — clear, nice. | 4
012-Place.png | T2. Monster wake roll 5+1=6 stir. Tile placed but my ship still drawn on top edge. Ship-icon counter 5 → 3. | Continue | 2 | Did my ship move? Preview said row 2. What is the number next to the ship icon (5→3)? | 3
013-Continue.png | Now my ship is at col2/row2. "Cobalt is playing, rolls 5+1=6". | Skip | 3 | Ship move shown a beat late. Monster roll is attributed to a player name. | 3
014-Skip.png | "Cobalt is thinking..." Only 3 leviathans visible now; previously ~6. | wait | 2 | Where did the other leviathans go? | 2
016.png | Jumped to T4 (from T2). Calm roll 4+6=10. Green ship (Jade) gone from left edge; new tiles at left and right. | Continue | 1 | I skipped and lost 2 turns of info. Jade vanished without me seeing why. | 2
017-Continue.png | My turn: all 3 tiles ✓. All say "Stop: column 1, row 1". | try other tiles | 2 | All three tiles give the same stop?? Label overlaps the ship; "start" ring is on col2 row1-2, hard to see where I actually am. | 3
018 / 019 | Same "column 1, row 1" for tiles 2 and 3. | Rotate | 2 | Not obvious that the path just runs through my earlier tile. | 3
020-160_533.png | Turn right rotates ALL hand tiles; now tiles 1–2 ✗, tile 3 ✓ "Stop: column 2, row 3". | Place | 3 | Rotation applies to whole hand (fine, but surprising). | 3
021-Place.png | T5, stir roll. Counter 3→2. | Continue | 2 | Counter keeps changing; I guess it's leviathan count? | 3
023-wait.png | "Cobalt is playing, rolls 2+4=6", leviathan moving with arrow. Teal leviathan at col1 row2 gone. | Skip | 2 | Leviathans vanish and reappear. | 2
024-error / 026.png | Skip timed out; now T7, tile pile 43→46, counter 2→4. A red leviathan is ON the green ship at left row 4. | Continue | 1 | Pile count went UP. Why? Big jump T5→T7. | 2
027 / 029.png | Roll banner now lists "1. Krakenreach rolled 3: moves north", "2. Reefwyrm rolled 2: moves east". Green ship gone. Leviathan now right next to me. | Continue | 3 | This per-leviathan list is the first time I understood monster moves. Good! But it's still the same 2+4 roll shown from earlier. | 3
032.png | My turn. New teal leviathan appeared bottom-right corner. Tiles ✓ ✓ ✗. | pick a safe tile heading to centre | 3 | Where did the new leviathan come from? | 3
034-160_533.png | Rotated: "Stop: column 2, row 4". | Place | 4 | — | 4
035-Place.png / 037.png | T8: roll 2+1=3 calm, then a second "Rolling..." dice banner in the same turn. | Continue | 2 | Two monster rolls back-to-back with no explanation of whose. | 2
040.png | My turn T9. Tile 1 ✗ "Hits Krakenreach" (red label partly covered by "start"). | pick another | 4 | Danger warning is good, but label overlaps. | 4
041 / 042 | Tile 2 → col 1 row 4 (next to kraken). Tile 3 → col 3 row 4. | Place tile 3 | 4 | — | 4
043-Place.png / 045.png | "Victory! Vermilion is the last junk afloat." Cobalt and Jade "sunk (crushed by a leviathan)". 10 turns, 13 leviathan moves. Play again / New game / Rules, and a separate Continue. | stop | 3 | I won without seeing Cobalt sink — the blue ship is still drawn on the board in the victory shot. Only now explicitly told I am Vermilion. Extra "Continue" below the Victory card is odd. | 3

## Final report

### 1. Goal and one round, in my own words
You captain a junk (ship) on the edge of a 6x6 sea. Last junk afloat wins. On your turn you get 3 current tiles; you pick one, rotate it, and lay it on the square in front of your ship; your ship then follows the current lines until it stops at an empty square. Don't let the line take you off the edge or into a leviathan. Between turns 2 dice are rolled ("monster wake roll"): on 6, 7 or 8 the leviathans each roll and move a step, crushing ships they land on. The computers do the same.

### 2. Top 10 confusion moments
1. Never told which ship/colour is mine until the Victory screen ("Vermilion") — 003-Start_with_these.png, 004-Best_start.png, 005-Continue.png
2. "Vermilion is playing / rolls 5+3=8" while I did nothing — felt like an AI turn, but Vermilion was me — 005-Continue.png
3. Number beside the ship icon in the top bar (5→3→2→4→3) never explained — 004, 012-Place.png, 021-Place.png, 026.png
4. Tile pile count went UP (43→46, 44→47) — 026.png, 043-Place.png
5. After Place, my ship stayed at the old spot, then moved a screen later — 012-Place.png vs 013-Continue.png
6. All three tiles showed the same "Stop: column 1, row 1"; labels overlap the ship and the "start" ring, so it's hard to tell where I am — 017-Continue.png, 018, 019
7. Hint "Tap the glowing square in front of your ship to see your tiles" stays up while the tiles are already shown — 010-error.png and every hand screen
8. Two monster wake rolls in the same turn (calm 2+1=3, then "Rolling..." again) — 035-Place.png, 037.png
9. Skip jumped ahead 2 turns (T2→T4, T5→T7) and I missed everything, including an opponent sinking — 016.png, 026.png
10. Starting screen: "Choose your start. Tap an edge square, then a gold mark" — two-step, every edge glowing; plus serpents already on the board with no label — 003-Start_with_these.png

### 3. "What just happened?" moments
- Jade (green) vanished from the left edge between T2 and T4 — 014-Skip.png → 016.png
- Leviathans disappear and new ones pop up (6 → 3 → new teal one at bottom-right) — 014-Skip.png, 023-wait.png, 032.png
- Red leviathan sitting on top of the green ship, then the ship is gone — 026.png → 029.png
- Pile count went up — 026.png
- Won suddenly: "Cobalt sunk (crushed by a leviathan)", yet the blue ship is still drawn on the board in the Victory screenshot — 043-Place.png, 045.png
- Rotate button rotated all 3 tiles in my hand at once and changed which ones were ✓/✗ — 020-160_533.png

### 4. Too much on screen
- Main menu: Quick start + Play online + How to play (3 modes) + Variant (4) + No-leviathans checkbox + more below the fold; "Start with these settings" asks me to read settings first — 002.png
- Start-pick board: every edge square glows with gold double rings, so it's very busy — 003-Start_with_these.png
- Hand screen: stop label, "start" label, "Hits Krakenreach" label and the ship all stack on one square — 017, 040.png
- Five unlabeled icon buttons at the top (captains, log, how to play, pieces, menu); I never tapped them because I didn't know what they were.
- The bottom half of the screen is mostly empty dark space, but the important labels are crammed onto the board.

### 5. Fun verdict
**3/5.** The core moment (pick a tile, see the ✓/✗ badge and the "Stop: column X, row Y" path, dodge a sea serpent) is quick and satisfying, and I won in about 4 decisions. But most of the game was me pressing Continue/Skip through monster rolls I didn't understand, and the opponents died off-screen. It was over before it got tense. Would I press Play again? Yes, once: it's short and the tile preview feels clever. I'd want to know which ship is mine and to see why the others sank.
