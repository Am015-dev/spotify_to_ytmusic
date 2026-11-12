# R16 strict gameplay re-review (12 Nov 2026)

Scored by games-src/reviews/GAMEPLAY-RUBRIC.md. Each game was built from its branch with its own build.py, served next to its
games/<slug>/media folder, and played with Playwright touch taps at 390x844 and 375x667 from fresh storage at default speed (no test
hooks for speed). The real rulebooks were read online; notes stayed local. Shots: games-src/reviews/R16-shots/.

| Game | Total | Verdict | Lowest rows |
|---|---|---|---|
| kaiten-kitchen | 7.8 | PASS | 5 Phone 7, 6 AI/pacing 7 |
| stitchwise | 7.0 | FAIL | 5 Phone 6 |
| emberclimb | see section 3 | | |

---

## 1. kaiten-kitchen (shelf/W499-kaiten-gameplay @ b37ac08c)

Played: "New here? Learn in 5 minutes" by touch at 390 (27 steps, 55 s, one line and one tap each, ended "You won 37 to 16").
Then 6 full 3-diner games by touch to the result: 2 at 390 with random picks (lost 26-41-36, 34-42-36), 3 at 375 picking the dish
with the biggest "+N" badge (lost 37-40-36, **won 56-35-52**, then lost 34-37-35 when the chefs stepped up after the win), 1 in
landscape 844x390 (lost 30-47-40). Each game took 1.2-1.3 min. 0 page errors, 0 console errors, 0 stuck states, 0 dead taps.
I did not hit the help bubble that will not close.

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 8 | Checked against the published rules: hand size, set scores (pair 5, three fish 10, buns 1/3/6/10/15), paste triples the next nigiri, sticks go back into the hand, roll race 6/3 with a first-place tie splitting 6 and no second, custard most +6 / fewest -6 only with 3+ diners, ties split rounded down, custard breaks tied totals. Result tables add up. |
| 2 | Tutorial teaches | 8 | Every rule is met by doing it, in order, one 8-12 word line and one tap per step, no Next buttons, no "later" list, then "Play a real game". The tutorial uses 2 diners and the custard end rules are only a tap on a chip, not played out. |
| 3 | First 10 seconds | 8 | The empty title panel is gone: a 3-line "Pick one dish / Pass your hand / Most points wins" board and a big red "New here?" button. |
| 4 | Turn clarity | 8 | "YOUR TURN Tap a dish to take it.", +N value badges on each dish, chips under each table (need 2, 1st +6, -3). The result now shows the winner first with a per-round and per-category breakdown, including custard. |
| 5 | Phone play | 7 | Dish cards 78x109 (375) / 80x112 (390), top buttons 44x44, text 14 px+, Play again / Menu 156x48 in portrait and landscape. But the hand row is cluttered: dishes sit at different heights with loose "+1 / +2" bubbles between them, and the right-hand dish is cut by the screen edge. |
| 6 | AI and pacing | 7 | Fixed: pick-to-pick is 2.1-2.2 s (min 1.9, max 2.5 s), down from 9.5 s. A 3-round meal takes about 1.2 min. Easy chefs until the first win. A sensible new player can win (1 of 3 with the badge policy), but random-ish picking lost 3 of 3, some by 15. |
| 7 | Feel | 8 | Dishes fly to the reveal, covers lift together, hands slide on the belt, score chips pop, art result card. |
| 8 | Bugs | 8 | 6 full games plus the tutorial: 0 errors, 0 stuck, 0 dead taps. Small layout glitch: the "-3 roll race" pop sits across Kofi's table. |
| | **Total** | **7.8** | **PASS**: every row is 7 or more; no stopper. |

### Earlier findings (G3)
| G3 finding | Status | Evidence |
|---|---|---|
| Row 3: big empty parchment panel on the title | **Fixed** (3-step "how you win" board) | R16-shots/kaiten-01-title-390.png |
| Row 6: 9.5 s forced wait per pick | **Fixed**: 2.1-2.2 s median, 2.5 s max, measured over 162 picks | kaiten-04-mid-hand-cut-390.png |
| Row 6: sensible play lost 4 of 4 | **Partly fixed**: easy chefs first; badge policy won 1 of 3, random lost 3 of 3 | kaiten-07-result-win-375.png |
| Row 4: result shows totals only | **Fixed**: winner first, rounds + categories + custard | kaiten-05-result-breakdown-390.png |
| Row 1/4: custard tie chip "-6" | **Not reproduced** (no custard tie came up); single fewest chip showed -6 correctly | kaiten-05-result-breakdown-390.png |
| Row 8/4: 375 art/label mix-up | **Not seen** in 3 games at 375 | kaiten-06-mid-375.png |
| Row 5: result buttons on cut-off plate shapes | **Fixed**, also in landscape | kaiten-08-result-landscape-844.png |
| Row 3: "Normal game" vs "Start the meal" | **Fixed**: one name, "Start the meal" | n/a |

### New findings
- Row 5/4. Did: looked at my hand on round 2 turn 3 at 390. Happened: dishes at different heights, "+1 / +2" bubbles float between cards, the 4th dish is cut at the right edge. Shot: R16-shots/kaiten-04-mid-hand-cut-390.png
- Row 8. Did: watched the roll scoring at 390. Happened: the "-3 roll race" pop is drawn over Kofi's table and name. Shot: kaiten-04-mid-hand-cut-390.png
- Row 6. Did: played 3 games at 390/844 with random picks. Happened: lost all three to the easy chefs (by 15, 8 and 17). Shots: kaiten-05-result-breakdown-390.png, kaiten-08-result-landscape-844.png
- Row 2. Did: the tutorial. Happened: it is a 2-diner table, but the real game is 3 diners; "fewest custard loses 6" is only a tap on a chip. Shot: kaiten-03-tut-end-390.png
- Positive: tutorial step with the sticks. Shot: kaiten-02-tut-sticks-390.png

---

## 2. stitchwise (shelf/W491-stitchwise-real @ 7af08c3a)

Played: "Learn: your first game" by touch at 390 and 375 (12 rule steps, about 30 s each, real drags, Rotate, Flip, Sew), then the real
game it hands over to, to the result, at both sizes. My new-player policy: buy the glowing patch with the most income, sew it where the
ghost lands, Rotate up to 3 times, else Advance. 390: 15 of my turns. 375: 19 of my turns, lost 6-19 to Poppy. 0 page errors, 0 stuck.

| # | Row | Score | Why |
|---|-----|-------|-----|
| 1 | Rules fidelity | 8 | Matches the published rules: 3 patches after the marker, furthest behind plays next, Advance 1 button per space, income on button spots, first past a leather square gets the 1x1, first 7x7 = +7, buttons - 2 per empty square, tie goes to the one who reached the end first (engine swWinner). |
| 2 | Tutorial teaches | 7 | Every step is one line and one action. The wrong-gap tap on the leather step now says "That gap is for your next patch. Tap the single square." Still a staged endgame from space ~42 with a pre-sewn quilt, and at 375 the tutorial quilt is only 19 px per square. |
| 3 | First 10 seconds | 7 | Clear goal line on the title. "Story" is still the first button; "Learn: your first game" is third. |
| 4 | Turn clarity | 7 | Glowing buyable patches, "need 1 more" / "no room" tags, "Advance +2 buttons". At 375 the prompt is cut: "No patch fits. Tap" then the button. |
| 5 | Phone play | 6 | Fixed in the real game: quilt squares 40 px (390) and 31 px (375), in both buying and placing. Not fixed: time-track squares 18x24 (390) / 18x20 (375); in the tutorial the quilt is 27 px (390) and 19 px (375); track tags are still cut ("larden 43/53", "oppy 13/53"); "+2 buttons" pops over the Rules/Menu buttons. Still "tiny on phone" for the track and the tutorial. |
| 6 | AI and pacing | 7 | Rival waits 2.3-2.7 s median, max 3.5 s (my action to my next turn). A game is about 15-19 of my turns. The naive policy lost 6-19 at 375 (21 empty squares), so a first win needs some care. |
| 7 | Feel | 7 | Ghost patch, tokens walk, "+N buttons" pops, result card with both quilts and a count-up. |
| 8 | Bugs | 7 | 0 errors, 0 stuck, 0 dead taps. Visual glitches: cut and overlapping track tags, pop over the header, cut prompt at 375. |
| | **Total** | **7.0** | **FAIL**: row 5 is below 7. No stopper. |

### Earlier findings (R7)
| R7 finding | Status | Evidence |
|---|---|---|
| Row 2/8: "11/10" step counter | **Fixed** as far as seen: 8/10, 9/10, no "11/10" in two walks | sw-02-tut-leather-wrong-tap-msg-390.png |
| Row 2: silent wrong tap at "sew it anywhere" | **Fixed**: explains the wrong gap | sw-02-tut-leather-wrong-tap-msg-390.png |
| Row 4/5: track tag cut ("arden") and tags overlapping | **Not fixed**: "42/53 larden 43/53" in the tutorial at both sizes; "You 12/53 oppy 13/53" in the 390 game | sw-01-tut-leather-tag-cut-390.png, sw-03-game-tags-overlap-390.png |
| Row 5: 375 idle quilt 24 px, track 18x20 px | **Partly fixed**: game quilt 31 px; track still 18x20; tutorial quilt 19 px | sw-05-game-375.png, sw-04-tut-quilt-19px-375.png |
| Row 3: "Story" is the highlighted first button | **Not fixed** | sw-08-title-390.png |

### New findings
- Row 5/2. Did: the tutorial at 375. Happened: the quilt is 19 px per square, and the leather step asks for a tap on one of those squares. Shot: R16-shots/sw-04-tut-quilt-19px-375.png
- Row 4. Did: a turn at 375 where nothing fit. Happened: the line reads "No patch fits. Tap" and is cut by the Advance button. Shot: sw-06-prompt-cut-375.png
- Row 5. Did: advanced in the game and in the tutorial. Happened: the "+2 buttons" pop sits on the Rules and Menu buttons. Shots: sw-01-tut-leather-tag-cut-390.png, sw-05-game-375.png
- Row 6. Did: timed the rival. Happened: 2.3-2.7 s median, slower than R7's 1.1 s but brisk enough. Lost 6-19 at 375. Shot: sw-07-result-375.png
