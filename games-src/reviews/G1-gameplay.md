# G1 gameplay review (8 Nov 2026)

Strict review against `games-src/reviews/GAMEPLAY-RUBRIC.md`. Each game was built from its own branch (game's own build.py)
and served next to its `games/<slug>/media` folder. Played with Playwright touch only (`page.touchscreen.tap`, CDP touch drags)
at 390x844, plus a layout pass at 375x667. Each game got the tutorial to its last step, then one full game against the default
computer to the result screen. Rules were checked against the published rulebook (notes kept local, outside the repo).
Screenshots: `games-src/reviews/G1-shots/`.

Summary

| Game | Total | Verdict | Lowest rows | Stopper |
|---|---|---|---|---|
| stitchwise | 4.0 (raw 6.1, capped) | FAIL | Bugs 4, Tutorial 5, Phone 5 | dead tap in tutorial step 1 |
| thornbound | 4.0 (raw 5.5, capped) | FAIL | Bugs 4, Tutorial 5, Turn clarity 5, Phone 5 | "Tap to go on" does nothing |
| rampart-and-vine | 6.8 | FAIL | Phone 6, AI 6, Feel 6 | none found |

---

## 1. stitchwise (branch shelf/W491-stitchwise-real, d312f104)

| # | Row | Score |
|---|---|---|
| 1 | Rules fidelity | 8 |
| 2 | Tutorial teaches | 5 |
| 3 | First 10 seconds | 7 |
| 4 | Turn clarity | 7 |
| 5 | Phone play | 5 |
| 6 | AI and pacing | 7 |
| 7 | Feel | 6 |
| 8 | Bugs | 4 |
| | **Total** | **4.0** (raw 6.1, capped at 4 by the dead tap) **FAIL** |

Rules: these all match the rulebook. Buy one of the 3 patches after the marker; time track 0-53; whoever is behind moves next, and the
token on top moves first on a tie; Advance = one space past the rival, +1 button per space; 9 income spots and 5 leather spots;
a 7x7 square is worth +7; score = buttons - 2 per empty square. Patches rotate and flip. The tutorial's score maths is right
(25 + 7 - 32x2 = -32).

Findings
- **Row 8 / 2 (STOPPER).** Tutorial step 1/8 says "Only the 3 patches after the spool are for sale. Tap this." I tapped the
  first of those 3 patches and nothing happened. Only the third card, which has a slightly thicker ring, responds. A new player
  does exactly what the text says and gets a dead tap. Shots: `sw-02-learn1.jpg`, `sw-03-learn2.jpg` (unchanged after the tap),
  `sw-04-learn3.jpg` (after tapping card 3).
- **Row 2.** The tutorial teleports the game without saying so. After one 2-space Advance, the track jumped from You 3 / Marden 4
  to You 9 / Marden 14. Steps later it jumped from 23 to 30 / 34, and my quilt was suddenly full of patches I never bought.
  The rival ends the "game" with 1 button and 74 empty squares (-147). It reads as a slideshow, not "a guided first game".
  Shots: `sw-08.jpg` → `sw-09.jpg` (jump), `sw-12.jpg` (quilt auto-filled), `sw-15-tutend.jpg`.
- **Row 5.** At 375x667 the market cards overlap. The patch picture covers the cost, time and income text ("3 but", "4 t",
  "inc"), and pictures run into the next card. Shots: `sw-375-b.jpg`, `sw-375-c.jpg`.
- **Row 5.** Card labels ("button", "time", "income") and the strip numbers are 12-13px. The time-track squares are about
  14px wide, too small to read or tap. Shot: `sw-02-learn1.jpg`.
- **Row 4.** The rival's quilt is never on screen in play. You can't see their gaps or their 7x7 race without opening a
  panel. Shot: `sw-r2.jpg`.
- **Row 7.** Dragging a patch onto the quilt snaps well, and "Good spot! Tap Sew it on" is good feedback (`sw-r2.jpg`). But
  the patch is a flat colour block while you drag it ("Red = no room" when the block is red-orange is confusing,
  `sw-04-learn3.jpg`). The rival's turns only show up as numbers changing.
- **Row 6.** The full game vs Poppy (normal) went to the result screen: Poppy 15, me -79 (I played badly). Poppy's 15 is
  beatable for a new player who keeps buying patches. The game lasted 43 turns, a sensible length. Shot: `sw-result.jpg`.
- Bugs: 0 page errors and 0 console errors across the tutorial and two full games.

## 2. thornbound (branch shelf/W489-thornbound-rules, f76bafdf)

| # | Row | Score |
|---|---|---|
| 1 | Rules fidelity | 7 |
| 2 | Tutorial teaches | 5 |
| 3 | First 10 seconds | 6 |
| 4 | Turn clarity | 5 |
| 5 | Phone play | 5 |
| 6 | AI and pacing | 6 |
| 7 | Feel | 6 |
| 8 | Bugs | 4 |
| | **Total** | **4.0** (raw 5.5, capped at 4 by the dead tap) **FAIL** |

Rules: the structure matches the published game. It has 5 rounds (4 short / 6 long), a secret bid each round, a Kingdom Card
taken from the Great Road, cards hidden face-down in regions, Clashes I-III fought in order, three Councils to govern, Lore from
Journey, and Influence as the score. The full game showed Spring → Summer (clash tally) → Autumn → Winter phases every round. The
solo mode and a few printed values are still guesses (the branch's own rules notes say so). These were not tested
card by card.

Findings
- **Row 8 / 2 (STOPPER).** Tutorial step 20/28 and 22/28 show "WATCH - Watch the board. Tap to go on." I tapped 6 times below
  the board and once on the board centre. Nothing advanced. The step only moved on by itself after about 10 s of waiting.
  Shots: `tb-t22.jpg`.
- **Row 2.** 28 steps. Steps 1-4 are "Next" text bubbles with nothing to do (`tb-02.jpg`). The words don't match: "Your Heir is
  strongest. Tap the Tablelands, where your Herald is." Heir or Herald? (`tb-ta-6.jpg`). It teaches one round only, then
  drops you on a setup screen. Summer/Autumn/Winter and the end of the game are never walked through.
- **Row 4.** The hand is six cards that look the same: the same art, a big number and an unlabelled icon (sword, eye). They have no
  name and no effect text in the hand. The header said "Round 4 of 5" while the board's round marker said "ROUND 3" at the same moment.
  The Court's score "13" has a "6" badge drawn over it. Shot: `tb-real-100.jpg`.
- **Row 5.** At 375x667 the Coin/Whispers/Pledges/Favour/Tactics chips sit over the bottom of the board. The Cairn Field and
  Ossuary labels are cut off, and the hand cards are cut off at the bottom edge. Pile labels are 12-13px. Shot: `tb-375b.jpg`.
- **Row 3.** The first in-game screen is busy: 5 icon buttons, 2 score bars, a goal pill, 6 locations, 5 pile chips and 6 cards.
  The instruction line ("Tap a card, then tap a region to hide it there.") is clear (`tb-real-02.jpg`). The "Got it" goal card is
  3 bullets of rules text (`tb-375b.jpg` before closing).
- **Row 6.** The full 2-player game (me vs Court, default level) went to the result screen: Court 27, me 2 (I played randomly).
  It ran about 240 logged actions over 5 rounds, a sensible length. A new player beating the Court is unproven. Shot: `tb-result.jpg`.
- **Row 7.** The board art and the result screen look good (`tb-result.jpg`). But play is "tap card, tap region", and clashes show
  as number discs swapping. Little moves.
- Bugs: 0 page errors and 0 console errors. No stuck state in the full game.

## 3. rampart-and-vine (branch shelf/W487-rampart-clean, 717f102c, source games-src/carc)

| # | Row | Score |
|---|---|---|
| 1 | Rules fidelity | 8 |
| 2 | Tutorial teaches | 7 |
| 3 | First 10 seconds | 7 |
| 4 | Turn clarity | 7 |
| 5 | Phone play | 6 |
| 6 | AI and pacing | 6 |
| 7 | Feel | 6 |
| 8 | Bugs | 7 |
| | **Total** | **6.8 FAIL** (rows 5, 6, 7 below 7) |

Rules: these match the rulebook. It has 72 tiles (start tile has a town edge over a road; 70 left after the first draw), 7 followers each, and
one tile then an optional follower each turn. Roads score 1 per tile, finished towns 2 per tile (+ banners), and priories 9 with 8
neighbours. Farmers score 3 per finished town at the end. Unfinished features score at the end. The river and other expansions are
offered on the title screen.

Findings
- **Row 5.** At 375x667 the score chips are cut off ("Cob...", `rv-375.jpg`). The tile counter is 13px. Title-screen chips (rivals,
  level, expansions) are 40px tall, under 44px (`rv-01-open.jpg`).
- **Row 6.** In the full game vs Cobalt (default) Cobalt won 86 to 23. That's a strong score for 2 players. A first-timer is unlikely
  to win on the default level. Shot: `rv-result.jpg`.
- **Row 4 / 7.** Placing a tile takes a tap on a glow, then "Tap again to place" plus a "Place here" button (`rv-real-180.jpg`).
  That's clear but slow. Placed tiles and meeples look good, but the rival's turns go by fast with little to follow.
- **Row 2.** 24 steps, mostly "do it" taps: turn the tile, place it, claim a road, priory, close a town, farmer, skip a follower.
  About 8 steps are "Next" bubbles. It then starts a real game (`rv-02.jpg`, `rv-real-02.jpg`).
- Bugs: 0 page errors and 0 console errors. Tutorial and full game ran to the result with no stuck state and no dead tap seen.
