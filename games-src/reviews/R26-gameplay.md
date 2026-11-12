# R26 gameplay re-review (12 Nov 2026)

Strict re-review by `GAMEPLAY-RUBRIC.md`. Each branch was checked out locally, `origin/alex/brave-carson-rbpmlk` merged in locally (not pushed),
and gated with `VIS_SLUGS="," build-all.py --full --out /tmp/r26 <slug>` (scenarios + phone-check). Each build was served next to its
`games/<slug>/media` and played with real touch only (`touchscreen.tap`), from the title screen, on default settings, at 390x844 and 375x667.
Rules were re-checked against the published games online; notes stayed local. Screenshots: `R26-shots/`.

| Game | Total | Result | Gate | Lowest rows |
|---|---|---|---|---|
| wildmark | **7.5** | **PASS** | **PASS** | First 10 s 7, Turn clarity 7, Phone 7, Feel 7 |
| vale-of-banners | **7.0** | **FAIL** | **FAIL** | Bugs 6 (gate dead taps) |
| perch-and-plume | **4.0** (avg 6.4, capped) | **FAIL** | **PASS** | Bugs 4 (tutorial step 2 stopper), Tutorial 5, Phone 6 |

---

## 1. wildmark (shelf/W507-wildmark-gameplay @ beca4024, merged locally): 7.5, PASS

What I played (real touch only, `touchscreen.tap`, fresh storage, default settings, started from the title by tapping):
- Tutorial at 375x667 from "New here? Learn in 5 minutes": 46 steps, 46 taps, 42 s, ends on "You win! You 33 Bram 26" with
  "Play a real game". Every target on screen, uncovered and at least 48x44; 0 dead taps; 0 lines over 12 words; 0 text under 14 px.
  Longest silent wait 3.4 s (Bram's turns, 4 times).
- Two full games from the title's "Play against 1 computer ranger" (default Gentle rival Bram), both to the result screen:
  - 375x667, "careful" newcomer (column with the highest "up to +N", spot with the highest "+N", first animal spot): **lost 57-69**, 20 turns, 80 taps.
  - 390x844, "casual" newcomer (random column, first visible spot, random animal spot): **won 55-52**, 20 turns, 77 taps.
- Rival wait (my last tap to my next turn): median 3.2 s, max 3.6 s. A game took about 2 min of driver time.
- 0 page errors, 0 console errors, 0 stuck states, 0 dead taps (market, spot, Place, animal) in 40 game turns and the tutorial.
- Rules re-checked online this pass (notes local only): pick a tile with its animal, place it touching your area, animal only on a
  matching empty tile, keystone gives an acorn, acorn buys any animal or a wipe, three alike may be swept, four alike are swept,
  20 turns, largest-area bonus, acorns 1 point, tie on acorns. All match.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Re-checked online this pass: turn steps, wipes (3 optional / 4 forced), acorn powers, 20 turns, area bonus and tie-break all match. |
| 2 | Tutorial teaches | 8 | 46 one-line steps, one tap each, every rule done by doing, 42 s, ends in a real game. Bram's turns leave 3.4 s with nothing to do. |
| 3 | First 10 seconds | 7 | "New here?" first, one big Play. The goal card's headline is clear ("Have more points than Bram after 20 turns") but it carries 3 rule bullets (about 80 words), and a flavour toast ("Rangers are out early this year. Grow faster.") sits on the card beside Start; "Grow faster" reads like a rule that does not exist. |
| 4 | Turn clarity | 7 | "1/3 Drag or tap a tile + animal pair", "up to +N" on every column, "+N" badges on spots, "What should I do?". Two identical bulb icons sit side by side in the top bar (hint and hints switch) and are hidden under the "Your turn" banner on turn start. Result line "Bram beat you most on animal cards 18 vs 48 (you first)" is awkward. |
| 5 | Phone play | 7 | Fixed: the market folds away while placing; board 84% of the screen at 375x667 and 86% at 390x844 (64-66% at pick). Hidden legal spots are now rare: 1 spot just past the left edge in 7 of 20 turns at 375 and 3 of 20 at 390, always with a "◀ 1" arrow (R23: up to 8 per turn). Gate PASS. Still: 13 px animal counters at 390, the turn-1 toast over the lower valley and over the goal card. |
| 6 | AI and pacing | 8 | Bram moves in about 3 s. On defaults the careful newcomer lost by 12 and the casual one won by 3: winnable, not a given. 20 turns is a sensible length. |
| 7 | Feel | 7 | Tiles drop, animals hop, score pops, painted terrains; unchanged. |
| 8 | Bugs | 8 | Tutorial plus two real games to the result screen at both sizes: 0 errors, 0 stuck, 0 dead taps. Gate PASS (it logs "1 dead" in 4 of 6 scenarios, within its limit). |
| | **Total** | **7.5** | **PASS** (every row >= 7, no stopper) |

**Gate** (`VIS_SLUGS="," build-all.py --full --out /tmp/r26 wildmark`): **PASS**. phone-check 390x763, 375x553, 844x390, P>L, L>P,
stale all PASS, errors none (1 dead tap logged in 390x763, 375x553, P>L and stale); rules-test PASS (8 games); lab WARN 3/8 (lab rows
differ from scenarios; not a gate fail).

### Earlier findings (R23)
| Finding | Status | Evidence |
|---|---|---|
| 375x667: legal spots off screen in 8 of 17 turns (up to 8 per turn) | **Fixed in the main**: board 84% while placing; 1 spot past the left edge in 7 of 20 turns, arrow shown. | R26-shots/wm375c-hidden-t14.jpg |
| "Your turn" banner covers spots mid-valley | **Fixed**: it now sits on the top bar (but covers the two bulb buttons for about 1.5 s). | R26-shots/wm375c-t1-0s.jpg |
| Gate FAIL (market off screen in landscape/rotate, board 50% at 375x553, 15-word text) | **Fixed**: gate PASS in all 6 scenarios. | gate log |
| Did not reach a real game's result screen | **Done**: two real games to the result screen. | R26-shots/wm375c-result.jpg, R26-shots/wm390r-result.jpg |
| Market labels / badges 13 px | **Fixed** for labels; four 13 px animal counters remain at 390. | R26-shots/wm390r-mid.jpg |
| Gentle soft for a careful player | **Changed**: careful newcomer lost 57-69, casual won 55-52. Fine for a first game. | R26-shots/wm375c-result.jpg |
| Known: turn-1 toast over the lower valley | **Not fixed**: still there at 0 s and 1.5 s, over the bottom tiles. | R26-shots/wm375c-t1-1.5s.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 3 / 5 | Tapped Play at 375x667 | The goal card (about 80 words) opens with the flavour toast "Rangers are out early this year. Grow faster." drawn on top of it next to Start. "Grow faster" is not a rule in a quick game. | R26-shots/wm375c-goal.jpg |
| 4 | First turn, top bar | Two identical bulb icons side by side (Hint and Hints switch), no labels; the "Your turn" banner covers them at the start of each turn. | R26-shots/wm375c-t1-0s.jpg, R26-shots/wm375c-t1-1.5s.jpg |
| 5 | 375x667, turns 14-20 | One legal spot just past the left edge each turn although the right side of the view is empty; a "◀ 1" arrow shows it. | R26-shots/wm375c-hidden-t14.jpg |
| 4 | Result screen after a loss | "Bram beat you most on animal cards 18 vs 48 (you first)": the order note makes the line hard to read. | R26-shots/wm375c-result.jpg |
| 2 (good) | Tutorial by touch | 46 steps, 46 taps, 42 s, 0 covered or dead taps, all targets 48x44+. | R26-shots/wm375-tut-end.jpg |

---

## 2. vale-of-banners (shelf/W505-vale-gameplay @ 61c44b33 after a local merge of the base branch): 7.0, FAIL

What I played (built with `VIS_SLUGS="," build-all.py --full`, served next to `games/vale-of-banners/media`, real touch only, fresh storage,
started from the title by tapping):
- Tutorial ("New? Learn to play") to the end card at 375x667 and 390x844: 48 steps, 49 taps, 62 s each, 0 repeat taps, longest silent
  wait 2.1 s, every target on screen, uncovered and at least 44x44 (smallest 44x44). 0 errors. Ends in a real game.
- Three full Quick games on defaults (title > Play > setup already on "2" and "Gentle" > Start), to the result screen. As a new player I
  tapped the ★ about half the time, otherwise a random glowing target. I never tapped while the rival played.

| Game | Size | Result | Time | Taps / decisions | ★ / own | Rival wait median / max |
|---|---|---|---|---|---|---|
| g1 | 375 | **lost 74-84** | 4.7 min | 163 / 122 | 45 / 77 | 1.4 s / 10.1 s |
| g2 | 390 | **lost 64-67** | 4.5 min | 175 / 132 | 49 / 83 | 1.1 s / 11.0 s |
| g3 | 375 | **won 82-61** | 5.0 min | 191 / 145 | 56 / 89 | 0.5 s / 10.7 s |

- 0 page errors, 0 console errors, 0 stuck states. Dead taps: 0 in g2 and g3. (In g1 my driver counted 19 "dead" taps on the season
  cards, but its check ignored the card itself; with a check that includes the card, g2 and g3 show 0, so I count g1 as 0 too.)
- Hints are **on by default** now: the top bar shows a labelled "Hints on" button. 0 of 399 decisions had no ★ on screen.
- Waits: up to 10-11 s once or twice a game. Up to 3 browsers were running on 4 cores, so these may run long.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | I checked again against the published rules online (5 seasons x 5 rounds, 2 dice plus the white goods die, take/build/sell/workers, ±1 per worker, buy from the back lane for 2 silver once per turn, tiles refill each season while goods stay, region bonus by size plus season, end scoring 1 per goods, 1 per silver, 1 per 2 workers). Tutorial lines and result table agree. Nothing invented. |
| 2 | Tutorial teaches | 7 | Fixed: the star now matches the coach on every step (step 3 "Tap the mine" and ★ are on the same tile). Max wait 2.1 s. Still: 48 steps, 14 of them Next-only. Between steps 14 and 15 the rival jumps from 0 to 27 points, and the board fills with "+16 region full" and "+5 colour finished" pops that nobody explains. The coach bubble still covers the prompt line on step 26 (and on most Next steps). |
| 3 | First 10 seconds | 7 | Title, then a big Play. The setup screen comes first with defaults already chosen, then a 4-line goal card. You now move first, so the rival no longer plays behind the card. "Hints on" is labelled. |
| 4 | Turn clarity | 7 | Fixed: a ★ on every decision, with a reason line under the prompt ("★ Take Mine: pays silver every season, costs 1 worker. Fits a space now.", "★ Build Mine: +11 pts, region full"). On doubles (5,5) the ★ sits on the one "5 → 2 workers" button. Still: when the ★ is on End turn (about 28 times a game) there is no reason line. Once or twice a game a teaching note ("A number on a tile = workers it costs...") replaces the ★ line while the ★ stays on a tile. That note also explains the red worker badges, which is now fixed. |
| 5 | Phone play | 7 | Every target I tapped at both sizes was on screen, uncovered and 44 px or more. The "Your turn" banner still lies over the score strip, and its fading copy stays over the scores at the start of a turn. |
| 6 | AI and pacing | 7 | A new player taking the ★ about half the time won 1 of 3 (82-61) and lost 2 close games (by 10 and 3). A game takes 4.5-5 min, rival waits median 0.5-1.4 s. The result card says "Close one: just 3 points short". Winnable but not given, which suits a first game. Not higher: one 10-11 s wait per game. |
| 7 | Feel | 7 | Unchanged: dice and tiles fly, regions flash, score pops, the camera follows, full result table with honest copy. |
| 8 | Bugs | 6 | Tutorial at 2 sizes and 3 full games: 0 errors, 0 stuck, 0 dead taps. But the `--full` phone-check gate **FAILS** in all 6 scenarios with "2-3 dead taps (2 / Gentle)": the gate's taps on the setup chips "2" and "Gentle", which are already selected, change nothing. |
| | **Total** | **7.0** | **FAIL** (row 8 under 7 because the gate fails; no stopper) |

Gate: **FAIL**. `phone-check: 390x763 FAIL 2 dead taps (2 / Gentle); 375x553 FAIL 2 dead taps; 844x390 FAIL 2 dead taps; P>L FAIL 3 dead taps; L>P FAIL 3 dead taps; stale FAIL 3 dead taps; errors none`. The scenarios themselves passed.

### Earlier findings (R21 + fixer's known issues)
| Finding | Status | Evidence |
|---|---|---|
| Hints off by default, behind an unlabelled ☆ | **Fixed**: on by default, labelled "Hints on" button. | R26-shots/vale-g-390-first.jpg |
| ★ gives no reason | **Fixed** for every ★ except End turn (no line there) and 1-2 times a game when a teaching note replaces the line. | R26-shots/vale-g-375-starwhy.jpg, R26-shots/vale-g-390-nowhy1.jpg |
| Prompt and ★ say different things (g3 d1) | **Mostly fixed**: the prompt and the ★ line agree on most decisions. Once or twice a game, a teaching note stands in for the ★ line. | R26-shots/vale-g-390-nowhy1.jpg |
| Tutorial step 3: ★ on stall 1, coach on stall 4 | **Fixed** (star = coach on every step). | R26-shots/vale-tut-375-03.jpg |
| Doubles ★ bug | **Fixed**: the ★ is on the single "5 → 2 workers" button. | R26-shots/vale-g-375-dead2.jpg |
| New player loses on defaults | **Fixed in part**: ★ about half the time won 1 of 3, lost by 10 and by 3. | R26-shots/vale-g2-375-result.jpg, R26-shots/vale-g-375-result.jpg, R26-shots/vale-g2-390-result.jpg |
| Coach bubble over the prompt at step 26 | **Not fixed** (also on most Next steps). | R26-shots/vale-tut-375-26.jpg, R26-shots/vale-tut-390-26.jpg |
| 0 → 27 rival jump and pops with no line (steps 14-15) | **Not fixed**. | R26-shots/vale-tut-375-15.jpg |
| Goal card while the rival already moves | **Fixed**: you move first; the card shows on your own turn. | R26-shots/vale-g-390-first.jpg |
| Red worker badge unexplained | **Fixed** by a prompt note ("A number on a tile = workers it costs..."). | R26-shots/vale-g-390-nowhy1.jpg |
| Build prompt "+N" while spaces show "1/3" | **Fixed**: "Glowing spaces: +N scores now, 2/5 is region progress." | R26-shots/vale-g-390-dead1.jpg |
| "Your turn" banner over the score strip, pops on top | **Not fixed**. | R26-shots/vale-g-375-starwhy.jpg, R26-shots/vale-g-390-dead1.jpg |
| Season change as a 3-line paragraph | Not seen as a card in my games; the season beat now passes as a short card. | - |
| Known: 5-14 taps per game on the "Turn over" card / mid-animation | **Not measured as a new player would tap**: I waited out the rival turns. With waiting, 0 dead taps. | - |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 8 | `--full` build, phone-check gate | FAIL in all 6 scenarios: "2-3 dead taps (2 / Gentle)", the setup chips that are already selected. | gate log |
| 4 | Followed the ★ in 3 games | About 28 times a game the ★ sits on End turn with no reason line. 1-2 times a game a teaching note replaces the ★ line while the ★ is on a tile. | R26-shots/vale-g-390-nowhy1.jpg |
| 6 | 3 default games, ★ about half the time | Won 82-61, lost 74-84 and 64-67. 4.5-5 min each. One 10-11 s wait per game (machine was busy). | R26-shots/vale-g2-375-result.jpg |
| 5 | Start of my turns at both sizes | The fading "Your turn" banner sits over the score strip ("You 2 pts ★ leads"). | R26-shots/vale-g-390-dead1.jpg |
| 2 | Tutorial at both sizes | 48 steps, 14 of them Next-only. The prompt line is covered by the coach bubble on most Next steps. | R26-shots/vale-tut-375-26.jpg |

---

## 3. perch-and-plume (shelf/W508-perch-gameplay @ 1196f255): 4.0 (capped; uncapped average 6.4), FAIL

What I played (branch checked out locally, `origin/alex/brave-carson-rbpmlk` merged locally, built with
`VIS_SLUGS="," build-all.py --full`, served next to `games/perch-and-plume/media`, real touch only via `touchscreen.tap`, defaults):
- Tutorial from the title's "New here? Learn in 5 minutes" to the real game it starts with, at 375x667 and 390x844:
  21 steps, 26-27 taps, 33-35 s, 0 page errors. Every lit target was 44 px or more. **Except step 2 at both sizes** (see findings).
- Two Quick games (title > Quick game > Start the year > Keep these; defaults: 2 players, Easy rival Fern, hints on), as a newcomer who
  takes "Best" about half the time and otherwise taps a random lit target:
  - 390x844: **lost 35-48**, 206 s, 163 taps, Best taken 58 of 157 decisions.
  - 375x667: **won 42-38**, 174 s, 112 taps, Best taken 53 of 109 decisions.
- Wait from my last tap to my next turn: median 1.6 s (390) and 2.3 s (375), max 6.6 s.
- 0 page errors, 0 console errors, 0 stuck states in both games, 0 tapped targets under 44 px, 0 text items under 14 px on the result screens.
- Rotation: started a game at 390x844, rotated to 844x390 and 667x375, then back to 375x667.
- Rules re-checked online this pass (core rulebook and a rules summary; notes kept local).

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Re-checked online: 4 rounds with 8/7/6/5 actions, row yields, egg cost by column (free, 1, 1, 2, 2), one trade on the bonus spaces (grassland pays 1 food for +1 egg), any 2 food for 1 when playing, tray refill, goals 4/1/0 to 7/4/3, final scoring and tie on leftover food: all match `rules-notes.md` and what I saw. 120 own birds instead of 170 (a stated simplification). |
| 2 | Tutorial teaches | 5 | Short and good otherwise: 21 one-line steps, one target each, 33 s, ends in a real game. But step 2's target is invisible at both sizes and every tap is swallowed (finding 1). The 8/7/6/5 shrinking actions are still not taught: "Practice: 4 actions. Real games: 4 rounds." |
| 3 | First 10 seconds | 7 | Starting hand with a goal line ("most points after 4 rounds...") and "Keep these"; the four actions say what they give; a "Best" badge. A toast covers the second hand card for a moment. |
| 4 | Turn clarity | 7 | Prompt always says what to tap ("Tap Play to put Tidal Wren in your forest"), Best badges, "Grub or seed?" choice is clear. "leads" appears only after the first move (fixed). Small flaw: while Fern's move is still playing, the dock already says "Your turn" and the action buttons look live (the tap is held and applied about 0.4-1.2 s later, so it is not lost). |
| 5 | Phone play | 6 | Portrait is fine: targets 44 px+, no text under 14 px, nothing cut off in my shots. Board share (my measure of the board element): 54% at 390x844, 48% at 375x667. After rotating a running game to landscape the dock shrinks to a 132 px strip at the top right with about 200 px of empty space under it; the prompt and the four action buttons are scrolled out of it, only hand-card tops show. At 667x375 the score names are cut to "Y..." and "F...". |
| 6 | AI and pacing | 7 | Waits median 1.6-2.3 s, max 6.6 s; a game is about 3-3.5 min. The mixed newcomer won 1 of 2 (42-38, lost 35-48): winnable, not a given. |
| 7 | Feel | 7 | Painted birds, rival's card shown when played ("Fern plays"), food and eggs fly, clear result table. Unchanged. |
| 8 | Bugs | 4 | Both games: 0 errors, 0 stuck, 0 dead taps on lit targets. But tutorial step 2 is a dead-tap trap for a new player (finding 1). The gate passes, yet phone-check still logs "1 dead" in 3 of 6 scenarios. |
| | **Total** | **4.0** | **FAIL**: capped at 4 by the tutorial step-2 stopper (every tap dead, target hidden). Uncapped average 6.4; rows 2, 5 and 8 under 7. |

Gate: **PASS**. `--full` result "1/1 PASS": phone-check PASS in all 6 scenarios (390x763, 375x553, 844x390, P>L, L>P, stale), errors none,
rules-test 240/240 AI games finished. Still logged inside the PASS: "1 dead" tap in 390x763, P>L and stale; lab-test WARN 3/8 (LAB rows differ from scenarios).

### Earlier findings (R23)
| Finding | Status | Evidence |
|---|---|---|
| Gate FAIL: "2 dead taps (+2 eggs / +1 cards)" | **Fixed** as a gate result (PASS), but phone-check still records 1 dead tap in 3 scenarios. | gate log |
| Gate: 23-word text | **Fixed** (not in the gate output). | gate log |
| Gate: board 49% after rotate | **Fixed** for the gate (PASS); my measure 56% at 844x390, 47% at 667x375, 48% at 375x667. But see the landscape dock finding. | R26-shots/pp-land-landscape844.jpg |
| Tutorial step 2 target covered (2 taps needed) | **Not fixed, worse**: now 0 visible pixels at both sizes; every tap is swallowed until you drag the dock down. | R26-shots/pp-tut375-s2.jpg, R26-shots/pp-tut390-s2.jpg |
| 8/7/6/5 actions never taught | **Not fixed**. | R26-shots/pp-tut375-s2-afterdrag.jpg |
| Mixed newcomer wins 1 of 2 | Same: won 42-38 (375), lost 35-48 (390). | R26-shots/pp-g375-result.jpg, R26-shots/pp-g390-result.jpg |
| Waits max 6.4 s | Same: max 6.6 s, median 1.6-2.3 s. | log |
| "leads" shown before anyone moved (fixer claim) | **Fixed**: "You 0 pts / Fern 0 pts" after Keep these; "leads" only after a move. | R26-shots/pp-g375-turn1.jpg |

### New findings
| Row | What I did | What happened | Screenshot |
|---|---|---|---|
| 2 / 8 (stopper) | Tutorial step 2 ("One action per turn. Practice: 4 actions. Real games: 4 rounds."), 375x667 and 390x844 | The lit target is the round tracker inside the dock, which is scrolled 107 px down, so the tracker sits under the board / dock header with 0 visible pixels. There is no Next button; every tap anywhere is blocked and only "pulses" the hidden tracker. My first run made 119 taps without moving on. It goes on only after dragging the dock down, which nothing tells you to do. | R26-shots/pp-tut375-s2.jpg, R26-shots/pp-tut390-s2.jpg, R26-shots/pp-tut375-s2-afterdrag.jpg |
| 5 | Started a game at 390x844, rotated to 844x390 and 667x375 | The dock becomes a 132 px strip in the top right with about 200 px of empty dark space below; the prompt and the 4 action buttons are scrolled out, only hand-card tops show. At 667x375 the score chips read "Y..." and "F...". | R26-shots/pp-land-landscape844.jpg, R26-shots/pp-land-landscape667.jpg |
| 4 | Tapped "Get food" while Fern's move was still on screen (4 times) | The dock head already said "Your turn" and the buttons looked live; the prompt still said "Fern takes grub from the feeder". The tap was held and applied 0.4-1.2 s later ("Tap a glowing food die"), so not lost, but the turn label is early. | R26-shots/pp-g390-yourturn-during-fern.jpg, R26-shots/pp-g390-buffered-tap.jpg |
| 5 | 375x667 game | Board element is 48% of the screen (54% at 390x844); the gate's 55% rule is met only at its own sizes. | R26-shots/pp-land-back375.jpg |
| 3 | Real game start after the tutorial | A "fresh spring morning" toast lies over the second starting-hand card for about 2 s. | R26-shots/pp-tut375-end.jpg |
