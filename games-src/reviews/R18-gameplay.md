# R18 strict gameplay re-review (12 Nov 2026)

Scored by games-src/reviews/GAMEPLAY-RUBRIC.md. Each game was built from its own branch (game build.py), served next to its
games/<slug>/ media and played with Playwright touch (isMobile, hasTouch, `touchscreen.tap`, CDP touch drags) at 390x844 and
375x667, default speeds, fresh storage. Rules were checked against the published rulebooks online (notes kept outside the repo).

| Game | Total | Verdict | Lowest rows |
|---|---|---|---|
| stitchwise | 7.5 | PASS | 2 Tutorial 7, 5 Phone 7, 6 AI/pacing 7, 7 Feel 7 |
| rampart-and-vine | 7.5 | PASS | 4 Turn clarity 7, 5 Phone 7, 6 AI/pacing 7, 7 Feel 7 |
| short-fuse | 7.4 | FAIL | 6 AI/pacing 6; 2, 4, 5, 7 at 7 |

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

---

## 2. rampart-and-vine (shelf/W487-rampart-clean @ d4fae07b)

Played: "New here? Learn in 5 minutes" by touch to the end card at 390 (24 steps, 34 taps, 71 s) and 375 (24 steps, 33 taps, 69 s),
tapping only what the tutorial lights, then "Play a real game" (Easy Cobalt) to the result. Then 2 more default games from the menu.
No camera help from code: when no glow was visible I tapped an edge arrow or rotated the tile.
- Careless player (a random visible glow, a follower on a random spot 60% of the time, fields included): lost 7-28 (390) and 6-22 (375).
- Sensible new player (the strong spot about 1 turn in 3, followers on roads/towns/priories only): won 42-23 (390), lost 30-35 (375).
Each game: 36 of my turns, 211-221 s. My last tap to my next turn: median 3.8 s, max 7.9 s. 0 page errors, 0 console errors,
0 stuck states, 0 dead taps, no covered glow or covered button tapped in 4 games.

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 8 | Matches the published rules: edges must match, one follower on the tile just laid and never on a claimed feature, roads 1 per tile, towns 2 per tile + 2 per banner, priory 9 when surrounded, farmers 3 per finished town at the end, open features 1 per tile (towns + banners) at the end, majority wins and ties both score, 7 followers, 72 tiles. |
| 2 | Tutorial teaches | 8 | 24 one-line steps in rule order, 69-71 s, 5 Next-only steps, every core rule by doing, then a real game. Majority and ties are now shown on the board ("You 2, Hob 1: only you score" with two red and one blue follower on one road; "You 1, Hob 1: both score in full"). On a few steps the coach bubble folds to "•••" and only "Tap the lit tile to go on" shows. |
| 3 | First 10 seconds | 8 | "New here? Learn in 5 minutes" first, a goal card, glowing squares and "Your turn". |
| 4 | Turn clarity | 7 | "Your turn / Add a follower, or Skip.", rival captions ("Cobalt placed a priory."), Roads/Towns/Priories/Farms result table. The caption still says what, not where or what scored. |
| 5 | Phone play | 7 | Recentre 103x44, Hints 44x44, Menu 44x44, hand tile 92 px (375) / 124 px (390). Glows 53-118 px. Follower spots 48 px, 64 px or more centre to centre (gap 16 px) in every follower step measured (24). Glows that do not fit get "◀ 4 more" edge arrows (84x44) that slide the view; a tap on them always worked. Result card fits at 375 with Play again 143x65 and Menu 104x65 on screen. But at least one glow was off screen on 32-35 of 36 turns, so the arrows are a near-constant extra tap; the final-count labels were not re-checked. |
| 6 | AI and pacing | 7 | Rival moves are sensible; median wait 3.8 s, max 7.9 s; a game is about 3.7 min. A sensible new player won 1 of 2 (42-23) and lost 30-35; random play lost both by 16-21. Easy is now fair, not soft. |
| 7 | Feel | 7 | Tiles drop on painted squares, meeples stand on the board, score pops and the "Valley complete / The deeds are yours" end card. |
| 8 | Bugs | 8 | 2 tutorials + 4 games: 0 errors, 0 stuck, 0 dead taps. |
| | **Total** | **7.5** | **PASS**: every row is 7 or more; no stopper. |

### Earlier findings (R9)
| R9 finding | Status | Evidence |
|---|---|---|
| Row 5: at 375 a legal square sat under the hand tray, Recentre did not help (8 turns) | **Fixed**: no glow under the tray or a button in 4 games; off-screen glows get edge arrows | R18-shots/rv-375-arrow.png |
| Row 5: follower spots edge to edge, one pair overlapping | **Fixed**: 48 px spots, 64 px+ apart, labels clear | rv-375-figspots.png, rv-390-figspots.png |
| Row 5: result Menu off screen at 375 | **Fixed**: Play again + Menu in one row on screen | rv-375-result.png |
| Row 5: Recentre 40 px tall, Hints 43x44 | **Fixed**: 103x44 and 44x44 | rv-375-mid.png |
| Row 2: majority and ties only told | **Fixed**: both shown on the board with followers and a label | rv-375-tut16-majority.png, rv-375-tut17-tie.png |
| Row 5: end-count label clipped at 375, "Valley" peeking | **Not re-checked** (I did not capture the final count frame) | n/a |
| Row 4: caption says what, not where | **Not fixed** (small) | rv-375-mid.png |
| Row 6: Easy maybe soft | **No longer soft**: careless play lost 2 of 2, sensible play won 1 of 2 | rv-390-s-result.png, rv-375-s-result.png |

### New findings
- Row 5. Did: counted turns with a glow outside the view (4 games). Happened: 32-35 of 36 turns; the "N more" arrows work, but on small phones you often tap an arrow before you can see all your choices. Shot: R18-shots/rv-375-arrow.png
- Row 2. Did: the majority step at 375. Happened: the coach bubble folds to "•••", only "Tap the lit tile to go on" shows; the board label says the rule, but two framed tiles (red and blue) make "the lit tile" unclear. Shot: rv-375-tut16-majority.png
- Row 6. Did: 2 games of random play. Happened: lost 7-28 and 6-22 (farmers placed early and lost). A new player who taps without thinking will lose; one who claims roads and towns can win. Shots: rv-375-result.png, rv-390-s-result.png
- Positive: rival turn caption "Cobalt placed a priory." and the follower step with four clear labelled spots. Shots: rv-375-mid.png, rv-375-figspots.png

---

## 3. short-fuse (shelf/W488-short-fuse-sprites @ 9d5a47e0)

Played: "Learn to play" by touch to the end at 390 and 375 (22 steps, 10 of them Next-only, 27 taps, 43 s), then "Play job 1"
and "Next job" by touch, default settings (3 crew, Normal). The player reads only the screen (tokens, cut wires, low-to-high
order), takes free solo cuts, and otherwise points at the crew wire whose clues best fit a number it holds.
- 390: job 1 won (24 s, 8 taps), job 2 won (37 s, 13 taps), job 3 lost, red cut (39 s, 15 taps); job 4 lost, fuse out (28 s, 11 taps).
- 375: job 1 won (27 s, 9 taps), job 2 won clean (34 s, 11 taps), job 3 lost, red cut (39 s, 15 taps); job 4 lost, fuse out (32 s, 9 taps).
- Size checks at 375: job 4 with 2 crew (lost, 32 s), job 12 with 5 crew (won 53/53, 83 s).
My last tap to my next turn: median 4.0-4.9 s with 3 crew, 2.3 s with 2 crew, 9.2 s (max 13.3 s) with 5 crew.
0 page errors, 0 console errors, 0 stuck states, 0 dead taps; every tap centre hit its own button.

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 8 | Dual cut, solo cut, yellow only matches yellow, red pointed at = boom, a red-only hand reveals itself, info token on a miss, validation, equipment after 2 cuts of its value, fuse length by crew size, foreman with 2 stands at 3 crew. House rule (no cut in four rounds explodes) is disclosed in Rules. |
| 2 | Tutorial teaches | 7 | 22 one-line steps, every core rule, real taps for token, dual cut, Twin Probe miss, Rewind, yellow, red and solo cut, then job 1. The red tap now explains itself ("Tap your red: never say red or point at one."). But 10 of 22 steps are still Next-only reading (goal, mine, crew, fuse, tokens2, hit, crew1, wrongres, crew2, win). |
| 3 | First 10 seconds | 8 | One-line pitch, big Play, "Learn to play"; the job card has the goal, 3 bullets, a tip and a clean-job goal. |
| 4 | Turn clarity | 7 | "Plum is choosing", "Everyone shows a wire", Red at / Yellow at strip, tappable name plates, brief-card tips. At 375 the "Stand 1" tag still sits on the top of the foreman's first wire row. |
| 5 | Phone play | 7 | Fixed: every wire is 44x49 px or larger in jobs 1-4 and 12 at 2, 3 and 5 crew (390: mine 58x77 in job 1); name plates 114-136x44; a crowded crew area scrolls with a "▾ more wires below" cue. Not fixed: the 5 header icons (Job card, Equipment, How to play, Hints, Menu) are 40x44. |
| 6 | AI and pacing | 6 | Job 1 is still 24-27 s and 8-9 taps (R8: 25-31 s, 6-8 taps); job 2 34-37 s. Then a steep wall: my screen-reading player lost jobs 3 and 4 at both sizes (0 of 4; 2 by a red cut, 2 by the fuse at 22/51). With 5 crew each of my turns waits 9 s (max 13 s). |
| 7 | Feel | 7 | SNIP stamp, shake on a miss, validation ticks fill in, art-led DEFUSED / BOOM cards with "Next job / Again / Jobs". |
| 8 | Bugs | 9 | 2 tutorials + 10 jobs: 0 errors, 0 stuck, 0 dead taps; every job reached its result card. |
| | **Total** | **7.4** | **FAIL**: row 6 is below 7. No stopper. |

### Earlier findings (R8)
| R8 finding | Status | Evidence |
|---|---|---|
| Row 5: crew wires 25x33, own 30x40 at 375 from job 4 | **Fixed**: 44x49 minimum in jobs 1-4 and 12, 2-5 crew, with a scroll cue | R18-shots/sf-375-j4-job1-start.png, sf-375-c5j12-job1-start.png, sf-375-c2j4-job1-start.png |
| Row 5: name plates 26 px tall | **Fixed**: 44 px tall | sf-375-j4-job1-start.png |
| Row 5: header icons 40x44 | **Not fixed**: still 40x44 | sf-375-job2-brief.png |
| Row 4: "Stand 1" label on the first wire at 375 | **Not fixed** | sf-375-j4-job1-start.png |
| Row 2: red tap does nothing | **Partly fixed**: the tap now explains the rule; the reveal is still automatic on the last line | sf-375-tut20-red.png |
| Row 2: 10 of 22 steps Next-only | **Not fixed** | sf-375-tut06-tokens2.png |
| Row 6: job 1 is 25-31 s, 6-8 taps | **Not fixed**: 24-27 s, 8-9 taps; brief tips and a clean-job goal were added | sf-375-job1-result.png, sf-390-job1-result.png |
| Row 6: jobs 2-4 won 3 of 7 | **Worse in my runs**: jobs 2 won 2 of 2, jobs 3-4 won 0 of 4 (3 crew) and 0 of 1 (2 crew) | sf-375-job3-result.png, sf-375-j4-job1-result.png |
| Row 4: scissors badges and gear cards unnamed | **Not re-checked** in detail | n/a |

### New findings
- Row 6. Did: chained jobs 1-4 with "Next job" at both sizes. Happened: jobs 1-2 are won in 24-37 s with 8-13 taps; job 3 ended "BOOM! A red wire was cut" both times and job 4 "The fuse ran out" at 22/51. Shots: R18-shots/sf-375-job3-result.png, sf-375-j4-job1-result.png
- Row 6. Did: job 12 with 5 crew at 375. Happened: 83 s for 12 of my taps; I waited 9.2 s median and 13.3 s max between my turns. Shot: sf-375-c5j12-job1-result.png
- Row 5. Did: measured the top bar in every job. Happened: Job card / Equipment / How to play / Hints / Menu are 40 px wide. Shot: sf-375-job2-brief.png
- Row 4/5. Did: job 4 at 375. Happened: the "Stand 1" tag overlaps the top of the foreman's first wire row; the "▾ more wires below" cue is clear. Shot: sf-375-j4-job1-start.png
- Positive: job cards now carry a tip and a clean-job goal ("Tip Yellows match only yellow", "★ Clean job: at most 1 miss"). Shot: sf-375-job2-brief.png
