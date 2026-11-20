# R101 strict gameplay review: lantern-dive

Reviewed: `origin/shelf/W578-lantern-strict` at **dc98c2c08a3a84fd53092c4529fca71aa7f533f3** (F1 fixer on R85's list). Reviewer only: no game code changed.

**Verdict: FAIL. Average 6.8.** Rows 4, 5 and 7 are below 7. The cold tester said the game was playable but only "moderately" fun.
Nothing stopped play (no stopper, so no cap at 4).

## Gates
| Gate | Run 1 | Run 2 |
|---|---|---|
| `build-all.py --quick lantern-dive` | PASS, 9/9 scenarios, 77 s | PASS, 9/9 scenarios, 76 s |
| `build-all.py --full lantern-dive` | PASS (guard ok, sweep 4 games, 0 problems), 143 s | PASS, 165 s |
| `node logic-test.js` | 206/206 rules pass | |
| `node game/rules-test.js` | 105 passed, 0 failed | |
| `calm-lantern.js` (15 s per path, both sizes) | CALM PASS: loops 0, max 1 helper on every path | |
| `scripts/calm-audit.js` | loops 0, maxHelpers 0 (its "play" path found no bulb, so I also sampled by hand, below) | |

`games/lab.html` and `games/scenarios.json`, which `--full` rewrote, were restored and are not committed.

## Scores (GAMEPLAY-RUBRIC.md)
| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | 7 | The engine matches the published rules: 206 checklist rules and 105 rule tests pass, and all 96 job texts agree with the card list. Five short texts are imprecise (see the list below). The worst one is the short job label: "Win with a 3" hides "colour card, not a Lantern". |
| 2 | Tutorial teaches | 7 | 22 steps, each one short line and one tap, in rule order (goal, Captain, jobs, failure, flare, signals, follow suit, trumps, early win), then "Play a real game". No dead taps at 375x553. Cold tester: the bubble arrives 1 to 2 s after the screen changes, and the switch from "Lantern 3" (job) to "Kelp 3" (signal) was not explained. |
| 3 | First 10 seconds | 8 | Clean title with the art behind it, one big "New here? Learn in 5 minutes" button and four quick-game buttons. No wall of text. |
| 4 | Turn clarity | 6 | The prompt and the gold seat outline make the turn clear. But: (a) short job titles hide the condition that matters, so the cold tester played Lantern 3 on "Win with a 3" and lost; (b) "Same as Captain" is never explained on the board; (c) with Hints off (the default) the flare step is only "Light the distress flare?" with No flare / Pass left / Pass right, and nothing says what it costs or why you would use it; (d) during a pass, nothing says which card to give. |
| 5 | Phone play | 5 | "+1 trick", "Job done!" and "Job broken" pop-ups start off the left edge (left = −12 to −25 px) at both sizes, 41 times in 13 dives, and are clipped over the You panel. Drone cards are 38x53 px (under 44 wide). Seat tap areas are about 140x28 px. The Configure sheet is 2528 px tall, and tapping a Team size jumps it back to the top (scrollTop 1050 → 0, both sizes). The two hand rows overlap in the bottom 100 px. Text is never under 11 px (audit every 6 polls: 0 hits). |
| 6 | AI and pacing | 7 | Computer divers play briskly: median 3.0 s and at most 4.6 s from my tap to my next turn. A dive takes 30 to 50 s. A careful newcomer (easy-level picks) won 4 of 6 dives at 375x667; a naive one (lowest glowing card) won 3 of 6 at 375x553. That is about the hoped-for half. The cold human won 0 of 3 real attempts, but those losses came from the clarity faults in row 4. |
| 7 | Feel | 6 | Cards fly and sweep to the winner, the table shakes, and the art is good. But a 4-job dive is over in about 30 s, and with the detail hidden the cold tester felt the dives were "more like guessing than planning". The large empty table at 375x553 makes the hand feel cramped. |
| 8 | Bugs | 8 | Tutorial twice, plus 13 full dives by touch at 375x667 and 375x553 (2-diver ×5, 3-diver ×2, 4-diver ×6): 0 page errors, 0 stuck states, 0 dead taps. One possible stale text, not reproduced: the bulb bubble said "Nerea wins the trick with Sunstar 6" while the trick on the table was Kelp (screenshot below). |

**Average 6.8** (7+7+8+6+5+7+6+8 = 54 / 8). PASS needs every row at 7 or more → **FAIL**.

## Clutter (sampled every second)
- 0 infinite animations on every path: title, tutorial, Hints on plus bulb tap, 15 s after the bulb, 15 s after the Hints tap, and all 13 dives.
- At most **1 helper** on screen (the bubble) on every path, including the 2-diver dives at both sizes. In 4-diver dives with Hints off the count stayed at 0.

## Cold play (independent subagent, no history, touch only, 375x667, about 12 minutes)
Quoted as it reported:
> 1. Could I play it? Yes. The 22-step tutorial walked me through everything and I won it. The real games were playable, but I only understood about half of what was going on.
> 2. Fun? Moderately. The tutorial was charming and the art is good. The real dives felt more like guessing than planning.
> 3. Play again? Maybe once or twice, mainly to see if the job-card logic clicks.
> 4. Confusing: The tutorial hint bubble appears about 1-2 s after the screen changes, so the first screen looks like it has no instructions. Step 9 said "tap Lantern 3". Later steps asked for Kelp 3 with no explanation of the switch. In the real game, job cards truncate. "Win with a 3" was really "colour 3, not a Lantern", and I wasted a Lantern 3 on it. The full text is only in the Jobs modal. Nothing explains what "Same as Captain" means. I took "win as many tricks as the Captain" and then won too many tricks without realising. The hand-pass step has no hint about which card to pass. A name tag ("Bram", "Nerea") appears on one card without explanation. After a failed attempt, the next attempt starts straight away. My blind taps skipped the fail screen, so I never saw how attempts 2 and 3 ended. I only found out from the Log. The table layout changes between games (3 players on top, then a cross layout). My taps landed differently. Turn indication was fine: the top-left hint text ("Your turn: play a card") was clear.
> 5. Dead taps / bugs: nothing was dead. In tutorial step 2 I tapped a non-glowing job and nothing happened, which is correct. The hand overlap is a small tap-target problem.
> 6. Results: Tutorial: won. Real dive 1 (attempt 1): lost. Real dive 2, attempts 2 and 3: lost. Score: 1 win (tutorial), 3 losses.

Video of the first 3 minutes: `games-src/reviews/R101-first-3-min-375x667.webm`.
**Cold verdict:** playable, but not clearly fun ("moderately").

## The F1 tester's open points, checked one by one
| Open point | Result |
|---|---|
| Short job titles hide the colour-card detail | **Confirmed.** `data.js:119` SHORT has "Win with a 3/2/5/6", while the full texts (`data.js:30-36`) say "colour …, not a Lantern". The cold tester lost a dive to this. |
| Flare prompt unexplained outside the tutorial | **Confirmed** with Hints off (the default): the bar says only "Light the distress flare?" (`ui2.js:385`). The explanation exists only as a Hints tip (`ui4.js:6`). |
| Configure long; a Team size tap scrolls to the top | **Confirmed.** The `#cfg` sheet is 2528 px tall (3.8 screens at 667, 4.6 at 553). Tapping 2 at scrollTop 1050 sets it to 0, at both sizes. |
| "+1 trick" pop-up clipped over the You panel | **Confirmed.** `.fl.plus` lands at left −12 to −25 px, as do "Job done!" and "Job broken", at both sizes. |
| Mara Goal modal repeats each dive | **Confirmed.** `ui3.js:48` opens it on every `newGame` in vs mode and has no "seen" flag. |
| At 375x553 labels drop (You, Signal); job cards only dots | **Partly.** At 553 the You seat shows only the avatar and the ★ count (no "You" word). "Signal" stays on the button and "Signal ready" shows at 667. Job chips keep their short title plus difficulty dots ("A whole colour ••••"), so they are not dots only. |

## Rules vs the original: player-facing text mismatches
The engine has none (logic-test 206/206, rules-test 105/105). The texts that say less than the rule:
1. `game/src/data.js:119` (SHORT): "Win with a 6 / 5 / 3 / 2" drops "colour card, not a Lantern" (the full texts at `data.js:30-36` are right). This label is what the board shows.
2. `game/src/ui11.js:40` (bulb "Play anything"): "A Lantern wins the trick." Missing: unless a higher Lantern is played (`ui11.js:73` says it correctly).
3. `game/src/ui4.js:9` (tip "nofollow"): "Other colours never win. A Lantern does." Same omission.
4. `game/src/ui11.js:38` (bulb "You lead"): "Everyone follows its colour." Missing: "if they can".
5. `game/src/ui12.js:145` (murky tip): "a signal shows the card, but no token." The rule puts the token beside the card with no mark; `ui5.js:12` and `data.js:139` say this correctly.

Everything else checked matches the rules: the goal, Captain and Lantern 4, the draft order and passing, the three Captain-comparison jobs, the flare (one colour card each, all one way, never Lanterns, one extra attempt, offered again), signals (highest/lowest/only, once per attempt, between tricks, never Lanterns, murky/narcosis/unknown), follow suit, trumps, no forced win, the winner leads, the dive is won as soon as every job is done, one broken job fails the attempt, and the drone (14 cards in 7 face-up/face-down pairs, the Captain plays it).

## Repro steps for rows under 7
- **Row 4.** Free play → Start, with Hints off. (a) Take a "Win with a 3" job and play Lantern 3 to win a trick: the job is not done. The board label never said "colour". (b) Fail an attempt → "Light the distress flare?" appears with no explanation (`flare-553.png`).
- **Row 5.** Free play → Configure → scroll to Team size → tap 2: the sheet jumps to the top. Win any trick at 375x553 with 2 divers: "+1 trick" appears at x −12 and is cut off at the left edge. At 2 divers, measure `#opp .dc`: 38x53 px.
- **Row 7.** Play Dive 3 with 4 divers: it is over in about 30 s and 8 card plays. The cold tester felt it was guessing because the job detail is hidden.

## Prioritised fix list
1. **Board job labels must carry the rule:** "Colour 3 wins a trick" (not "Win with a 3"), "Same tricks as Captain", and so on. Tapping a job chip on the board should show the full text in one tap.
2. **Explain the flare inline when Hints are off:** one line under the buttons, e.g. "Everyone passes one card. Costs one attempt."
3. **Keep the pop-ups on screen:** clamp `.fl.plus` and the job-done/broken toasts inside 8 px of the edges, never over the You panel.
4. **Configure:** a Team size tap must not reset the scroll. Put Team size and Start at the top, and fold the 32-dive list.
5. **Show the Mara Goal modal once** (first dive only, store a seen flag).
6. **Tap targets:** drone cards at least 44 px wide (or a larger invisible hit area); seat buttons at least 44 px tall.
7. **Failed attempt:** hold the fail result until the player taps it, so a newcomer sees why the attempt broke before the next deal.
8. **Fix the five rule texts listed above** (Lantern "unless a higher Lantern", "if they can", murky "token without a mark").
9. **Tutorial:** show the bubble together with the screen change, not 1 to 2 s after. Say why the signal step switches to Kelp 3.
10. Check the bulb bubble for stale trick text ("wins with Sunstar 6" on a Kelp trick).

## Screenshots (reviewer scratch, not committed)
Tutorial strip 375x553 `me/m-tut.png`; board, "+1 trick" and result `me/m-play1.png`; 2-diver board after a flare pass `me/375x553-np2-stuck.png` (that "stuck" was a gap in my script, not the game); bulb bubble `me/bulb-667.png`; Configure `me/375x553-cfg-open.png`; flare `me/flare-553.png`.
