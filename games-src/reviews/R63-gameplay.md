> **[REVIEW R63] summary (the scheduled report to the orchestrator was refused, so it is here):** vinegrave 75cff6df. Gates: quick PASS,
> full PASS x2, guided tutorial PASS at 667 and 553. Rules: engine and all reachable texts right (one wrong line only in hidden
> `?tut=coach`, ui4.js:100). Clutter: hints off max 1 helper, 0 loops. Hints on max 2 (1 sample), 1 endless loop (help bubble pulse).
> **STOPPER at 375x553:** `vg-squeeze` (ui1.js:183, style.css:582) hides the map and research track when the dock has 3 buttons;
> 32 of 149 turns affected, 15 dead taps. Fairness: glow follower 61 %. Rows 7/8/7/6/4/7/7/5, average 6.4, capped at 4.0. **FAIL.**
> Top fix: use vg-squeeze only while a chooser is open, and keep the map about 150 px at 553.

# R63 strict gameplay review: vinegrave (14 Nov 2026)

Build reviewed: `shelf/W490-vinegrave-bench` at **75cff6dfbd1d0a7746abd0b2c66dbaaae1ac2eea** ("hints add no second pointer").
Previous: R58 6.9 FAIL (Rules 6, Turn clarity 6, Phone 6). F10 claims checked one by one below.

**Verdict: FAIL. Total capped at 4.0 because of a stopper at 375x553. Without the cap the average would be 6.4.**
The stopper: at 375x553, when the dock shows a row of buttons (boon, idol, assistant), the island map and the research track are
hidden or crushed while a site still glows. The move the game suggests can't be seen or tapped.

## Gates
| Gate | Result |
|---|---|
| `VIS_SLUGS="," build-all.py --quick vinegrave` | PASS (78 s; scn own checks 8/8; universal WARN: text clipped "Camp" `span.msign` at x -4, the row sign is cut at the left edge) |
| `--full` run 1 / run 2 (each alone) | PASS / PASS (4m46s / 4m50s; phone-check ok; rules-test 200 AI games ok; lab WARN rows vs scenarios, same as R58) |
| `node logic-test.js` | 138/138 pass |
| Guided tutorial by touch (`guided-tut-test.js`, run at 375x667 and 375x553) | PASS at both: 35/35 steps in order, every line 12 words or fewer, end card in 71 s, 0 page errors |
| `tut-test.js` (old coached tutorial) | FAIL, but the test is out of date: "Learn to play" now opens the guided round. The coached mode is only reachable with `?tut=coach` (see R-1) |
| 17 full games by touch (reviewer script, 375x667 and 375x553, glow follower and plain newcomer, hints off and on, 1 s sampler, 16 s idle in round 2) | 17/17 reached the result screen; 0 page errors, 0 stuck states. **Dead taps on glowing or legal pieces: 0 at 667 with hints off, 1 at 667 with hints on (under the help bubble), 15 at 553** (13 on sites hidden or overlapped by P1/P2, 2 under the help bubble). 2 more were my script tapping the action button while a card animation opened; I don't count those |

## Rules vs the original (repo notes, RULES-AUDIT.md, R58's rulebook read)
Engine: nothing has changed since R58 except the Easy rival's weights (`ai.js` EASY p0 0.75 to 0.65). The four engine fixes R58
confirmed still hold: second camp space pays double, a Dread card for each explorer taken back from a guardian site, overcome from
either space, and no reshuffle mid-round.

F10 text claims, checked in the source and in play:
- Coach `travel` now says "waits in your play area". Right.
- Coach `dig` now says "A camp holds two; the second pays double." Right.
- Coach `tiebreak`, the result sheet and the rules drawer all say "first into the temple, else higher research". Right.
- "An artifact's effect always applies when you buy it" is now listed under "Simplified on purpose". Right.
- No player text says "discard" or "one per site" any more (checked with grep).
- I checked every guided-tutorial line (`ui4.js` 148-203), the rules drawer and the rival notes. All of them match the engine.

**R-1 (wrong text, but only in a mode players can't reach):** `ui4.js:100`, the coach's note on a rival dig: "Tamsin dug a camp. **It is
closed to you this round.**" This is wrong: a camp has a second space that anyone can take for double the cost (and the rival may
have dug a ruin, not a camp). It only shows in the old coached free play (`?tut=coach`). No button or link opens that mode, and the
guided tutorial never reaches its `free` step (it goes from g-pass straight to the score walk, so 0 coach bubbles in a full guided run).
A normal player never sees it, so I do not cap Rules for it. Fix it or delete the dead coached mode.

## Clutter and loops (sampled every second; 17 games plus a 16 s idle in round 2 of each)
| Setting | Max helpers at once | Samples over 1 | Endless animations |
|---|---|---|---|
| Hints off (default), 6 games, both sizes | **1** (research nudge or a toast) | 0 of 736 | **0** |
| Hints on, 11 games, both sizes | **2** (once: help bubble + research nudge, 375x553) | 1 of 1283 | **1: `gxh-pulse` / `gxh-ring`** |

- F10's "hints show only the glow" holds: no gold badges, no "Try:" line, never more than 1 glowing piece outside a chooser.
- **L1, an endless loop with hints on:** the shared help bubble ("Exile a card. Removing Dread cards helps your deck." with "Got it")
  has a pulsing ring. Both stay until the player taps Got it: still running, unchanged, after 30 s. Over the 16 s idle the
  sampler measured 15 s of nonstop pulsing. Repro: Menu > Hints on, Start, play to round 2 and get an exile chooser, then wait.
  Screenshot (reviewer scratch): `shots/gxh-667-t30.png`.
- **L2:** the same bubble sits over the board and the market: one tap on a glowing site at 375x667 hit `gxh-bub` (dead tap), and
  at 553 one hit `gxh-tx`.

## Phone (375x667 and 375x553)
- At game start at 553 the R58 problem is fixed: the research track (y 209-344) ends above the dock (y 350), and both markers show.
  Every tap target is 44 px or more and the page doesn't scroll.
- Market cards at 553 are 119x47. They show cost, the effect in plain words ("Draw 2 cards", "+2 compasses +1 coin") and points, but
  no name. **Is a card with no visible name OK for a first-timer?** Yes, mostly: the effect is what you decide on. Two catches: the
  log and rival notes say "Tamsin bought Brush Machete", a name that appears nowhere on the board; and the unlabelled 12 px chip
  "−2 coin" (it means 2 coins short) looks like a Dread-style "−2 points". Acceptable, but label the chip.
- **P1, the stopper (375x553):** `ui1.js:183` adds `vg-squeeze` whenever `#map` is shorter than 80 px, and `style.css:582` then hides
  `#map` and `#track` (visibility hidden, pointer-events none). It was meant for the tall exile chooser. But a dock row of 3
  buttons (Boon + Idol + an assistant, or 2 assistants + one more) also makes the map shorter than 80 px. The whole island and the
  research track disappear on a normal turn, and the prompt still says "What glows is a strong move", though the glowing site is
  hidden. Measured: in 2 games at 553 (moves chosen by the normal AI for me), **32 of 149 of my turns** had a legal or glowing site
  that couldn't be tapped. Assistants stay for the rest of the game, so once you have one this keeps happening.
  Screenshot: `shots/hid-375-1.png` (first run: an empty map, a toast, the dock with "A Broker / A Camp").
- **P2 (375x553):** with 2 dock buttons the map is 80-90 px tall: Ruins and Camp rows overlap, the Camp row slides under the dock
  and only the "Research" label shows. Screenshot: `shots/hid-375-1.png` (second run: "Boon / Idol / Porter").
- **P3:** "Camp" row sign cut at the left edge (scn WARN). Chooser cards break words mid-word ("Creepin g Dread"). 12 px text on the
  market shortfall chips.
- Repro for P1/P2: 375x553, Start, play until you hold a guardian boon or an idol and hire an assistant from the research track. On
  your next turn the map is gone or crushed.

## Fairness (default level Easy, 2 players)
| Player | Win rate |
|---|---|
| Glow follower, headless `bench-glow.js 200` | **61 %** (avg 33.7 vs 26.6). F10 claim confirmed |
| Simple-plan newcomer, `bench-newplayer.js 200` | 74 % |
| Plain newcomer, random legal move, headless 200 games (reviewer script) | 50 % (31.3 vs 27.6) |
| Browser by touch, glow follower, 375x667 (hints on) | 4 of 5 (78-19, 67-35, 40-36, 31-21; one 29-30 loss) |
| Browser by touch, glow follower, 375x553 hints off | 2 of 2 (67-28, 65-25) |
| Browser by touch, glow follower, 375x553 hints on | 2 of 5 (the glowing site was hidden in several turns, P1) |
| Browser by touch, plain newcomer (random glowing or legal piece) | 0 of 5 (16-33, 21-33, 14-25, 14-30, 22-34) |

The glow now points to a strong move: it wins more than random play (61 % vs 50 %), and by touch the follower wins easily at 667.
A newcomer who ignores the glow and taps at random loses on Easy in the browser. That's fair, because the game tells you to follow
the glow. Game length: 84-167 s with fast taps, about 30-35 of my turns.

## Scores (GAMEPLAY-RUBRIC.md)
| # | Row | Score | Why / repro for anything under 7 |
|---|-----|-------|----------------------------------|
| 1 | Rules fidelity | 7 | Engine right. Every text a player can reach now matches it (R58's R1-R4 fixed). One wrong line in the hidden `?tut=coach` mode (R-1). |
| 2 | Tutorial teaches | 8 | Guided round, 35 steps, one line and one tap each, works at 667 and 553 by touch. Still doesn't teach the double-cost second camp space (it is in the rules drawer). |
| 3 | First 10 seconds | 7 | Goal sheet, then one glowing piece, the prompt and Pass in view, at both sizes. |
| 4 | Turn clarity | **6** | Hints off is clean (1 glow, max 1 helper). Repro, Hints on: Menu > Hints on, play to an exile chooser in round 2, then wait. The help bubble pulses endlessly (L1) and covers the board, which caused a dead tap (L2). At 553 the prompt says "What glows" while the glowing site is hidden (P1). The "−2 coin" shortfall chip has no label. |
| 5 | Phone play | **4** | Stopper at 375x553: `vg-squeeze` hides the map and research track whenever the dock has a row of 3 buttons (P1), and with 2 buttons the rows overlap and the Camp row sits under the dock (P2). Repro above. 667 is fine. |
| 6 | AI and pacing | 7 | Brisk rival, sensible games. Glow follower 61 % headless and 4 of 5 by touch at 667. A random tapper loses, which is fair. |
| 7 | Feel | 7 | Same as R58: pieces land, cards fly, the guardian shakes. With hints off nothing loops; the one endless pulse (L1) only runs with hints on. |
| 8 | Bugs | **5** | 0 errors, 0 stuck, 17/17 games to the result sheet, gates green twice. But 15 dead taps on glowing or legal sites at 553 (13 from P1/P2, 2 under the help bubble) and 1 at 667 under the help bubble (L2). |

**Average of rows: 6.4 (51/8). Total capped at 4.0 (stopper P1 at 375x553). FAIL** (rows 4, 5 and 8 under 7).

## Top fixes (in order)
1. P1/P2: at 375x553 the map and research track must stay visible and tappable whatever the dock holds. Use `vg-squeeze` only while a
   chooser (`#qbox`) is open. Fit the extra row of boon, idol and assistant buttons on the same line as the resources, or shrink it
   to 44 px icon chips, so the map keeps at least 3 rows of 46 px discs (about 150 px). Gate: a ?scn= at 375x553 holding boon +
   idol + 2 assistants, where every legal site's centre must hit the site (elementFromPoint).
2. L1/L2: with hints on, the help bubble must stop pulsing after 2-3 cycles and hide itself after about 8 s. It must never cover a
   glowing piece or the open chooser.
3. R-1: fix or delete `ui4.js:100` ("closed to you this round"), better still the whole hidden `?tut=coach` mode, and update or
   retire `tut-test.js` so it stops failing.
4. Label the market shortfall chip ("need 2 coins") at 14 px. Fix the "Camp" row sign clipped at the left edge and the mid-word
   breaks in chooser card names.
5. Teach the double-cost second camp space in one guided-tutorial line.
