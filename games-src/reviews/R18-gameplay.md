# R18 strict gameplay re-review (12 Nov 2026)

Scored by games-src/reviews/GAMEPLAY-RUBRIC.md. Each game was built from its own branch (game build.py), served next to its
games/<slug>/ media and played with Playwright touch (isMobile, hasTouch, `touchscreen.tap`, CDP touch drags) at 390x844 and
375x667, default speeds, fresh storage. Rules were checked against the published rulebooks online (notes kept outside the repo).

| Game | Total | Verdict | Lowest rows |
|---|---|---|---|
| stitchwise | 7.5 | PASS | 2 Tutorial 7, 5 Phone 7, 6 AI/pacing 7, 7 Feel 7 |

---

## 1. stitchwise (shelf/W491-stitchwise-real @ 338c701c)

Played: "Learn to play" by touch to the score card three times (390 once, 375 twice): 15 screens, 21-22 taps, 26-27 s, real drags
for both placements, Rotate, Flip, the free 1x1 and the Watch step; then "Play a real game" (Easy Poppy) to the result each time.
New-player policy: buy the glowing patch with the most income, sew it where the ghost lands or on a random empty square, Rotate up
to 3 times, else Advance. Results: 390 lost 8-34 (20 of my turns, 51 s of play), 375 won 17-7 (16 turns, 47 s), 375 won 30-25
with the 7x7 bonus (17 turns, 57 s). My action to my next turn: median 1.5-2.1 s, max 3.7 s. 0 page errors, 0 console errors,
0 stuck states, 0 dead taps (a repeated tap on the 1x1 gap was my script tapping again during the sew animation; the first tap
had already sewn the patch). No text under 14 px in 17 measured screens.

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 8 | Matches the published rules: 9x9 quilt, 5 starting buttons, 3 patches after the marker, furthest back plays next, Advance = 1 button per space, 9 income spots (5, 11 ... 53) paying the buttons on your quilt, 5 leather 1x1s (20, 26, 32, 44, 50) to the first to pass, first full 7x7 = +7, buttons - 2 per empty square. |
| 2 | Tutorial teaches | 7 | Every rule in order, one short line and one action per screen, real drags, ends on a real game. Still a staged endgame (starts at space 36 on a pre-sewn quilt), and the step counter stalls: "8/10" twice, "10/10" on five screens in a row. |
| 3 | First 10 seconds | 8 | Goal line on the title and "Learn to play" is now the first, highlighted button; the tutorial's first line says what to tap. |
| 4 | Turn clarity | 8 | Glowing buyable patches with "need 1 more" / "no room", "Advance +N buttons", "Good spot! Tap Sew it on", red stripes = no room. Tapping the track opens a sheet: "Time track / You move next: furthest back plays", full names, "0 of 53", key to income and leather. |
| 5 | Phone play | 7 | Real-game quilt 40 px (390) / 30-31 px (375) idle and 38 px placing; tutorial quilt now the same (31 idle / 38 placing at 375, was 19). Offers about 103x110, all buttons 44 px+. The on-board track is still 18x20 px squares, but it is a 371x76 tap target that opens a readable sheet (~33 px spaces at 375). Small overlaps remain: "+8 pts" pop on the You plate; at 375 in the tutorial "Mar..." is cut and the red "47" track tag hides behind "46". |
| 6 | AI and pacing | 7 | Rival is brisk (median 1.5-2.1 s). A careless new player won 2 of 3 against Easy Poppy (17-7, 30-25) and lost 8-34 once. A game is 16-20 of your turns. |
| 7 | Feel | 7 | Ghost patch follows the drag, tokens walk the track, "+N buttons" pops, result card with both quilts, count-up and ribbon line. |
| 8 | Bugs | 8 | 3 tutorials + 3 games: 0 errors, 0 stuck, 0 dead taps. Only the small visual overlaps in row 5. |
| | **Total** | **7.5** | **PASS**: every row is 7 or more; no stopper. |

### Earlier findings (R16)
| R16 finding | Status | Evidence |
|---|---|---|
| Row 5: track squares 18x20 at 375 | **Fixed by the sheet**: tap the track, spaces ~33 px with full names and who moves next; board strip still 18x20 (visual only) | R18-shots/sw-375-track-sheet.png |
| Row 5/2: tutorial quilt 19 px at 375 | **Fixed**: 31 px idle, 38 px placing (40 px at 390) | sw-375-tut01-buy.png, sw-375-tut09-leather2.png |
| Row 4/5: track tags cut ("larden 43/53") / overlapping | **Mostly fixed**: tags are numbers only and no longer cut by the edge; at 375 the red tag can still sit half behind the teal one ("▶46 47") | sw-375-tut14-end.png |
| Row 4: prompt cut at 375 ("No patch fits. Tap") | **Fixed**: "Nothing fits →", "Tap a glowing patch, or" wraps; no prompt overflow in 17 checks | sw-375-mid.png |
| Row 5: "+2 buttons" pop over Rules/Menu | **Fixed**: 0 pops over the top bar in 3 games; a "+8 pts" pop now sits on the You plate instead | sw-375-mid.png |
| Row 3: "Story" first on the title | **Fixed**: "Learn to play" first and highlighted | sw-390-title.png |
| Row 2: staged endgame tutorial | **Not changed** (acceptable): starts at space 36 with a pre-sewn quilt | sw-390-tut08-leather.png |

### New findings
- Row 2. Did: walked the tutorial. Happened: the counter reads 8/10 on two screens and 10/10 on five (flip, place2, sew2, end, score), so it looks stuck near the end. Shot: R18-shots/sw-375-tut14-end.png
- Row 5. Did: tutorial at 375, last Advance screen. Happened: rival plate reads "Mar..." next to "15 buttons", and "+7" crowds the You plate. Shot: sw-375-tut14-end.png
- Row 5. Did: 375 game, an Advance with income. Happened: "+8 pts" pop sits over the top of the You plate. Shot: sw-375-mid.png
- Row 5. Did: tutorial leather step at 390. Happened: Marden's "+2 buttons" pop overlaps his "11 buttons". Shot: sw-390-tut08-leather.png
- Row 6. Did: 3 real games as a careless player. Happened: won 17-7 and 30-25 at 375, lost 8-34 at 390 (11 empty squares). Shots: sw-375-result-final.png, sw-390-result.png
- Positive: placing is easy at 375 (38 px squares, big Rotate / Flip / Sew it on / Cancel). Shot: sw-375-placing.png
