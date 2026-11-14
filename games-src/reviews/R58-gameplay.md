# R58 strict gameplay review: vinegrave (14 Nov 2026)

Build reviewed: `shelf/W490-vinegrave-bench` at **b892d6632b4427f5ce397ba34de533f159c19951**.
Previous: R35 7.1 FAIL (site discs 27-30 px, newcomer could not win on Easy). F9 claims checked one by one below.

**Verdict: FAIL, average 6.9.** Rows 1, 4 and 5 are at 6. No stopper.

## Gates
| Gate | Result |
|---|---|
| `VIS_SLUGS="," build-all.py --quick vinegrave` | PASS (75 s; scn own checks 8/8; universal WARN: text clipped "0" `span.tn` in the board, see Phone row) |
| `--full` run 1 / run 2 (each alone) | PASS / PASS (4m03s / 4m07s; phone-check ok; rules-test 200 AI games ok; lab WARN on rows vs scenarios) |
| `node logic-test.js` | 138/138 pass (section Z = the F9 rules fixes) |
| Guided tutorial by touch, 390x844 / 375x667 / 375x553 | PASS at all three: 35/35 steps in order, every line 12 words or fewer, 71 s, 0 page errors |
| 8 full games by touch (reviewer script, 375x667 and 375x553, plain newcomer and glow follower, hints off and on) | 8/8 reached the result screen; 0 page errors, 0 stuck, 0 dead taps (the result sheet opens by itself) |

## Rules vs the original (from the repo's notes plus the published rulebook text, read online 14 Nov)
**The four engine fixes are right, not backwards.**
1. Second camp space costs double: the rulebook's tent example says the next player to use the site "will need to cover a cost of 2 Boots". `siteCost()` doubles the second space. Right. (The rulebook only shows the Boot case; doubling other icons is a fair reading.)
2. A Fear (Dread) card for each archaeologist taken back from a site with a guardian: rulebook "each time you take back an archaeologist from a site with a guardian, add 1 Fear card". Right.
3. Overcome a guardian from either space: rulebook "you must have an archaeologist on the guardian's site". Right. Note: fixes 2 and 3 never trigger in play. Guardians only appear on ruins, and ruins have one space (engine `cap` is only set on camps, same as the original), so the second-space branch is dead code. Harmless.
4. No reshuffle mid-round: rulebook "if your deck is out of cards, you can't draw any more", and the play area is shuffled under the deck at round end. Right.

Also checked and right in the engine: setup (6-card decks with 2 Dread, 2 explorers, starting goods by seat 2c | 1c1k | 2c1k | 1c2k, blocking tiles by player count), 5 rounds, one main action then pass, free actions (starting cards, boons, idols with no per-turn limit and each slot once), travel ladder (Jeep or Boat pays a Boot, Plane pays anything, 2 coins buy a Plane, Dread pays a Boot), explore costs and the guardian waking, guardian 5 points + boon, items to the bottom of the deck, artifacts free when bought and 1 tablet from hand, moon-staff exile of both neighbours, research (notebook never above the magnifier and never in the temple), temple tiles, Fear supply then -2 tiles, tie-break temple-first then research.

**Text that still disagrees with the engine (Rules row capped at 6):**
- R1. The coached first game says at the first dig: "Glowing camps are open. Send an explorer to dig. **One per site.**" (`data.js` coach.dig). Wrong: camps hold two explorers and the second pays double (the rules drawer says so correctly). Repro: Learn to play, finish the guided round, keep going into the coached game, make the first dig.
- R2. Coach line `travel`: "A card pays one, then **is discarded**." F9 says this word was fixed to "play area"; this line was missed. Cards go to the play area and come back under the deck at round end.
- R3. Coach `tiebreak` and the result sheet ("First into the temple wins ties.") leave out the research fallback. Incomplete rather than wrong.
- R4. RULES-AUDIT.md says "buying an artifact always resolves its effect" is listed under "Simplified on purpose", but the in-game list doesn't mention it.

## Clutter and loops (sampled every second through 8 games plus 16 s idle after the last action)
| Setting | Max helpers at once | Samples over 1 | Endless animations |
|---|---|---|---|
| Hints off (default), 6 games, both sizes | **1** (research nudge, which runs 3 times then holds) | 0 | **0** |
| Hints on (Menu), 2 games, 375x667 | **3**: badges "Best", "Best site" and "Best buy" together, plus the glow and the "Try: ..." prompt | 19 of 101 | **0** |

F9's "one glow (best move)" holds with hints off. Turning Hints on gives four pointers at once, and the "Best" badge covers the market card's "Free" chip. Screenshot: `/tmp/claude-0/rv/shots/hints-553.png` (reviewer scratch).

## Phone (375x667 and 375x553)
- Tap targets measured: site discs 46x46, hand cards 69-75 x 88-93, market 118x73 (667) and 58x64 (553), Pass 60x44, pawns 44x48, bar buttons 44x44. All 44 px or more. F9 claim confirmed.
- **P1, hidden at 553:** the research track's rows 0 and 1 sit under the dock (rows at y 335-376, dock top at y 350). Both research markers start on row 0, so at game start you can't see your own research position. The scn WARN "text clipped: 0 span.tn" is this. Screenshot: `/tmp/claude-0/rv/shots/map-553-zoom.png`.
- **P2, 553:** market cards shrink to 58x64 and show cost and art only, with no name and no effect. The player has to tap each of the 6 cards to learn what it does.
- P3: camp loot chips ("1 compass 1 coin", "1 tablet") overlap the camps' travel-cost icons, and the "Best site" badge covers them completely when Hints are on.
- 4-5 text runs at 12-13 px (rubric asks 14 px).

## Fairness (default level Easy, 2 players)
| Player | Win rate |
|---|---|
| Glow follower, headless `bench-glow.js 200` | **45 %** (avg 30.0 vs 27.5) |
| Simple-plan newcomer, `bench-newplayer.js 200` | 73 % |
| Plain newcomer, random legal move, headless 200 games (reviewer script) | 38 % |
| Browser by touch: plain newcomer | 1 of 4 (59-32 win; losses 17-38, 16-24, 16-24) |
| Browser by touch: glow follower | 2 of 4 (66-27 win, 24-24 win on tie-break; losses 22-23, 22-26) |

A newcomer can now win on Easy, so R35's blocker is gone. But F9's "glow follower about 3/4" doesn't hold (45 %), and the glow is barely better than random play (38 %) while a fixed simple plan wins 73 %. "What glows is a strong move" is weak advice.

## Scores (GAMEPLAY-RUBRIC.md)
| # | Row | Score | Why / repro for anything under 7 |
|---|---|---|---|
| 1 | Rules fidelity | **6** | Engine right and the 4 fixes right. A newcomer is still told two wrong rules: R1 "One per site" (camps hold two) and R2 "discarded". Engine and every text must agree. |
| 2 | Tutorial teaches | 8 | 35 steps, one line and one tap each, every core rule in order, works at all 3 sizes. Not taught: the double-cost second camp space. The temple step is a "practice jump". |
| 3 | First 10 seconds | 7 | Goal sheet, then "Your turn. What glows is a strong move." with one glowing piece and Pass in view. |
| 4 | Turn clarity | **6** | Hints off is clean. Repro: Menu > Hints on, start a game: Best + Best site + Best buy badges, the glow and "Try: buy ..." all show at once (max 3 badges, 19 % of samples over 1 helper). The "Best" badge covers the card's Free chip. Also the glow advises a move that wins only 45 %. |
| 5 | Phone play | **6** | Targets 44+ everywhere. Repro at 375x553: start a game and look at the Research column: rows 0-1 and both markers are under the dock (P1). Market cards show no name or effect (P2). Loot chips overlap cost icons (P3). |
| 6 | AI and pacing | 7 | The rival is brisk (games of 108-148 s with fast taps, about 35 turns). A newcomer wins on Easy (38-73 % by style). Glow guidance is weak (see Fairness). |
| 7 | Feel | 7 | Pieces land, cards flip and burst, the guardian wakes with a shake, the research nudge runs 3 times then holds, nothing loops forever. |
| 8 | Bugs | 8 | 8 full games plus 3 tutorial runs: 0 errors, 0 stuck states, 0 dead taps; gates green twice. |

**Average 6.9 (55/8). FAIL** (rows 1, 4 and 5 are under 7).

## Top fixes (in order)
1. Fix coach `dig` to say camps take two (the second pays double), and coach `travel` to say "goes to your play area". Then grep every player text for "discard" and "one per site".
2. At 375x553, fit the whole research track (rows 0-8) above the dock, or scroll the track so the lowest marker is always visible.
3. Hints on: show one pointer at a time. Keep "Best" only, or the glow only, and drop the "Best site" / "Best buy" badges and the "Try:" line when the glow already shows the move. Never cover a card's Free chip.
4. At 553, show at least a one-line effect on market cards (or a name), not cost and art only.
5. Make the glow pick the move a strong player would make (the simple-plan bench wins 73 %), or soften the prompt from "a strong move"; re-bench to at least 60 %.
6. Add the research tie-break fallback to the coach tie-break line and the result sheet. List "an artifact's effect always fires when bought" under "Simplified on purpose".
