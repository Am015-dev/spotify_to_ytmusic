# Tidewake: playable pass (W402, then W411, 7 Nov 2026)

W402 added the phone turn banner, the story prologue and Pieces in Menu. W411 replaced the forced-step tutorial with a coached first game (Addendum 4).
W411 also added per-step rival captions, fixed the audit in the game's own CSS and kit copy, and fixed the 7 items W402 left open.
Proof:
- `game/coach-test.js`: the coached game from fresh storage, random legal moves by UI taps, both sizes, every rule explained.
- `game/ui-play-test.js`: a Quick game and Story chapter 1 to the result, visible uncovered taps only, 390x763.
- `build-all.py --quick tidewake` PASS; rules-test 38/38.

## The 10 worst problems, before / after
| # | Problem (first minute) | Status |
|---|---|---|
| 1 | Phone lay turn had no "whose turn / what now" banner | FIXED (W402) |
| 2 | Tutorial bubbles were bare instructions | FIXED (W402 story). W411: no forced steps any more; Osk coaches a real game (TUTORIAL-COVERAGE.md) |
| 3 | Top bar had 6 buttons | FIXED (W402) |
| 4 | Title: two big primary buttons, setup layout changed between first and later visits | FIXED (W411): one primary (first visit: "Play with Osk's help"; later: Story); "Play now" renamed "Quick game"; the button order is the same on every visit. Audit F 0 on every size |
| 5 | The first-turn coach bubble covers part of the board | FIXED in the coached game: Osk's bubble sits in the panel flow and coach-test checks it never overlaps the board. In a normal game the shared help bubble (gx-help) still places itself. Telling it to avoid the board moved its arrow over an edge number, so that change was reverted |
| 6 | Hand tiles have no printed name | EXPLAINED: every current tile is the same kind (four wake lines). Each one already prints its outcome (SAFE / RISKY / SINKS badge and a plain line such as "sails 2 squares"). The two special tiles are labelled GATE and CANNON. Osk names the Rift Gate when you first hold it |
| 7 | Rival turn caption cut to 8 words | FIXED (W411): the full line (up to 18 words). Each rival step holds about 1 s; a tap on the board or the caption skips to the next step (`ui2.js`) |
| 8 | Contrast under 4.5:1 on Menu, Rules drawer, Story map act labels | FIXED in `skin.css`: solid backing for drawer text, buttons and act labels; disabled buttons no longer fade to 50%. Left: the Menu's bottom buttons (they sit below the fold) and two Rules paragraphs (the drawer slides in from off-screen) are still flagged. These look like audit timing/scroll artefacts |
| 9 | Desktop text under 16px (146 nodes) | FIXED: a desktop type scale in `skin.css` (>= 1024 wide). The board's edge numbers and compass letter are drawn at a real px size, scaled down (KIT_PATCHES A11 in `build.py`; the kit file is untouched). Audit A 0 on pc, phone and phone-s |
| 10 | Phone setup screen leaves the lower half empty | FIXED for returning players: a 3-line "Goal / Each turn / You sink" card under the board while you choose a start. A first-time player gets the help tip there instead (showing both put two instruction lines on screen) |

## Audit (rules A-F, staged build, W411)
Before W411: phone A25 B8 E1 F1 | phone-s A25 B4 F1 | pc A146 B22 E7.
After (final run, staged build): phone A0 B3 C0 D0 E2 F0 | phone-s A0 B0 C0 D0 E0 F0 | pc A0 B2 C0 D0 E8 F0. So the gate "A-F 0" is met on phone-s only.
A run before the last changes gave pc E1 and phone E1, so E varies from run to run.
E left:
- The shared help bubble's last button: it hides itself with a style change, which the audit ignores.
- A locked Story chapter node.
- On pc, the start-mark list buttons. After the first mark is taken the others are no longer legal; a tap now writes a "not free" / "wait" line in the result box, but the audit still reads it as dead. Not solved.

## Rival turns
Each step of a rival's move plays in order with its caption (dice, leviathans, the tile, the sail, any sinking): about 1 s per caption line, the animations as before. A tap skips the current step; "Skip to my turn" skips them all.
