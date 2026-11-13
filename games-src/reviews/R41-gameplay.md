# R41 strict gameplay review (13 Nov 2026)

Reviewer R41. Rubric: `GAMEPLAY-RUBRIC.md` (8 rows, PASS needs every row >= 7, a stopper caps the total at 4).
Every game was built fresh from its branch in its own worktree. Both gates ran with `VIS_SLUGS=","`. All play was on the
**staged** build (build-all `--quick --out` folder served by `gx-serve.js`), by `page.touchscreen.tap` only, phone viewports
(isMobile, hasTouch). The machine has 4 cores and ran 3-5 browsers at once, so the rival wait times below are inflated by load.

## Summary

| Game | Commit | Quick gate | Full gate | Rows (R/T/F10/TC/Ph/AI/Feel/Bugs) | Avg | Verdict |
|---|---|---|---|---|---|---|
| sands-of-qamar | 7101e2b2 | PASS | PASS | 8/8/7/7/7/7/7/8 | 7.4 | **PASS** |
| nebula-aces | 51cec217 | PASS | PASS | 7/7/8/7/7/7/8/8 | 7.4 | **PASS** |
| vale-of-banners | e9fab6a0 | PASS | PASS | 8/5/7/7/7/7/7/4 | 6.5 | **4.0** (capped: tutorial stuck at 375x553), **FAIL** |

Screenshots are local to the review session and were not committed.

---

## 1. sands-of-qamar (shelf/W497-sands-gameplay @ 7101e2b2931492a53a241c92f5b9cccbdad873cb): 7.4, PASS

**Gates**
- `--quick`: **PASS** (11/11 scenarios, 110.7 s).
- `--full`: **PASS** (phone-check 66.1 s; `rules-test.js ok: ai games 200 stuck 0 / PASS rules-test`; the usual LAB 9/12 warning, which does not block).

**What I played** (default setup: 2 players, Play vs computer)

| Run | Size | How | Result | Time | Taps | Longest / median rival wait |
|---|---|---|---|---|---|---|
| tutorial | 375x667 | taps only the highlighted target | 41 steps, 0 problems, 3 count pages, ends on "Play a real game" | - | - | - |
| tutorial | 375x553 | same | 41 steps, 0 problems | - | - | - |
| f1 | 375x667 | hint follower (taps the planner's glowing pick, the chooser's "best") | **won 215-172** | 127 s | 161 | 6.3 / 3.9 s |
| f2 | 375x667 | hint follower | **won 221-173** | 128 s | 156 | 7.8 / 3.2 s |
| f4 | 375x667 | hint follower | **won 204-192** | 125 s | 129 | 7.3 / 3.1 s |
| f5 | 375x667 | hint follower | **won 203-188** | 131 s | 173 | 7.5 / 2.9 s |
| f3 | 390x844 | hint follower | **won 235** | 140 s | 159 | 6.6 / 3.7 s |
| r1 | 375x667 | random glowing target | lost ("So close! Just a few points short") | 116 s | 112 | 9.1 / 3.5 s |
| r2 | 375x667 | random glowing target | lost 214-224 | 143 s | 159 | 7.3 / 3.2 s |
| m1 | 375x553 | 30 % random glowing, else hint | lost (Teal 204) | 139 s | 145 | 8.5 / 3.4 s |
| m2 | 375x667 | 30 % random glowing, else hint | **won 260** | 129 s | 132 | 7.6 / 3.0 s |

0 page or console errors and 0 stuck states in 9 games and 2 tutorials. 0 taps landed on a covered target. My driver flagged a
few "dead" taps; all of them were the first good of "Pick two goods" or the Earn −/+ stepper, which change a selection my
state key did not track, so they are not dead.

**R38 findings, checked**
- **Tiles >= 44 px: fixed.** At every one of my decisions (about 1,400 across 9 games, Earn and sell steps included) every glowing
  tile, spot, good, djinn and chooser chip was 44x44 or bigger at 375x667, 390x844 and 375x553. The market and djinn rows now
  hide on steps where they can't be used, so the grid keeps its size.
- **Score pop: fixed in real games.** 207 pops in 9 games, **0** over the tile grid. The pop now sits in the score bar
  ("Teal scores 12 pts from Advisors"). In the tutorial the old floating "You −3 pts" / "You +6 pts" chips still land on tiles
  (tut-11, tut-30 shots), and in real games a pop that fires as the game ends sits over the result card's title.
- **Hint follower: now wins, and not too easily.** The follower won 5 of 5 by 12-48 points. A newcomer who taps any glowing thing
  lost 2 of 2 by about 10 points, and the mixed player went 1-1. The default rival is beatable but still beats careless play,
  and every loss card says how close it was. A whole game takes about 2 minutes.
- **Tutorial count page:** "The count" now lists Land, Coins, Palms, Palaces, Advisors, Djinns, Goods and Total per player.

**Rules**: since R38 only UI files changed (board.css, coach.js, juice.js, playable.js, score.js, ui2.js). The engine and AI
are untouched, and the gate's 200 AI games are clean. The new `scGlowHint` only narrows which legal moves glow; the other legal
moves stay tappable.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Engine unchanged since R38's 8; glow narrowing does not remove legal moves. |
| 2 | Tutorial teaches | 8 | **Up from 7.** 41 one-line steps, 0 problems at 375x667 and 375x553, every core rule in order, the last count page now breaks the total down by source, then "Play a real game". |
| 3 | First 10 seconds | 7 | One-line pitch, player count, "New here? Learn by playing", a 3-line goal card. Three tiles glow on the first move with nothing marking the suggested one, so a newcomer picks at random. |
| 4 | Turn clarity | 7 | **Up from 6.** The pop is in the score bar and names the reason. At 375x553 the reason is cut ("Teal scores 6 pts from …"), and the last pops cover the result card's title. |
| 5 | Phone play | 7 | **Up from 5.** Every target >= 44 px at all three sizes, nothing over the grid. At 375x553 the result card's Play again / View the board buttons sit over the score table (Palms, Palaces and Total rows hidden), and the tile names are dropped, leaving only art and numbers. |
| 6 | AI and pacing | 7 | **Up from 5.** Hint follower 5/5, random tapper 0/2 by ~10 points, mixed 1/1. Games ~2 min. Rival waits 3 s median, 6-9 s worst under load. |
| 7 | Feel | 7 | Same juice as R38 (drop notes, landing ring, sparks, coin flight, count-up). |
| 8 | Bugs | 8 | 0 errors, 0 stuck, 0 real dead taps in 9 games and 2 tutorials. |
| | **Total** | **7.4** | 8+8+7+7+7+7+7+8 = 59/8 = 7.4. **PASS**, no stopper. |

**Fix list (none blocks the pass)**
1. Row 5: at 375x553 keep the result card's Total row above its buttons, or make the table scroll above a fixed button row.
   Repro: play a game to the end at 375x553 (m1 result shot).
2. Row 4: stop queued score pops when the game ends (they sit over "You win!"). Repro: any game at 375x667; the last pop
   "Teal scores 15 pts from …" covers the result title (f2 result shot). At 375x553, shorten the pop text so the reason fits.
3. Row 3: mark the suggested start among the three glowing tiles (a ★ or a brighter glow). Right now the planner's pick looks
   the same as the other two.
4. Tutorial: move the floating "You −3 pts" / "You +6 pts" chips off the tiles, like the real-game pop (tut-11, tut-30).
5. Balance watch: the hint follower won 5/5. If the owner wants it closer to half, ease the hint or strengthen the rival
   slightly; non-followers already lose narrowly.

---

## 2. nebula-aces (shelf/W486-nebula-bench @ 51cec217bb75fbcd09c6d824cac90a74925b2f2e): 7.4, PASS

**Gates**
- `--quick`: **PASS** (9/9 scenarios, 137.1 s). The "8 px inside every dialog" check passed this time (dialog padding is now 10 px).
- `--full`: **PASS** (phone-check 109.7 s; `rules-test.js ok: PASS rules-test`; LAB 9/12 warning, not blocking).

**Lesson ("Tutorial") by touch**, the game's lesson walker plus my own sampler of the coach bubble every 90 ms
(a hit counts if it stays more than 450 ms over a hull circle from `BF.circ()` or a `#tags .tag` nameplate):

| Size | Lesson result | Coach bubbles | Settled over a ship or nameplate | Leave lesson | ✕ |
|---|---|---|---|---|---|
| 375x667 | all checks pass, 23 rules taught in order, duel + flight drill, end card starts a real game | 21 | **0** | 81x44 | 44x44 |
| 390x844 | same | 21 | **0** | 81x44 | 44x44 |

"Secret dials" and "Arc, range, order" no longer hide Slate: the bubble now docks above or below the ships (shots
neb-tut/fly.png, shoot.png). One new problem: in **"Spend focus"** at 375x667 the bubble sits over the attack dice in the
dice panel, so the line "focus faces become hits" talks about dice you can't see (neb-tut/usefocus.png). "Use focus" is still
tappable.

**Quick games** (Launch > Start, default rival), the game's UI-only `playbot.js`, SUG=1 = taps the ★ suggested move and the
recommended action / target:

| Run | Size | How | Result | Rounds | Taps | Time |
|---|---|---|---|---|---|---|
| s1 | 375x667 | suggestions | **won** | 31 | 155 | 319 s |
| s2 | 375x667 | suggestions | **won** | 6 | 34 | 120 s |
| s4 | 375x667 | suggestions | **won** | 13 | 75 | 220 s |
| s5 | 375x667 | suggestions | lost | 7 | 40 | 185 s |
| s6 | 375x667 | suggestions | lost | 8 | 48 | 113 s |
| s7 | 375x667 | suggestions | **won** | 8 | 49 | 138 s |
| s8 | 375x667 | suggestions | **won** | 7 | 38 | 98 s |
| s3 | 390x844 | suggestions | lost | 9 | 62 | 200 s |
| n1 | 375x667 | first offered move, no ★ | **won** | 7 | 39 | 159 s |

0 page or console errors, 0 stuck states. Suggestion follower 5 wins in 8, games mostly 6-13 rounds (one 31-round drag).

**Turn banners vs ships.** In my first runs the sampler counted banners that were fading out (still in the DOM, opacity near 0),
so I added an opacity check (ancestors' opacity product >= 0.6) and re-ran 2 games with a screenshot at the moment of each hit:
57 banners, **0** settled over a hull or nameplate during play. The only hits were the setup goal card (a modal) and the final
VICTORY card. Matches the fix (`placeBan` now also avoids `#tags .tag`).

Two smaller things I saw in the shots:
- Combat at 375x667: the "Your turn: Combat / Kael Varro can shoot. Pick a target." banner overlaps the "Fire at Nightjar ·
  range 1 · 4 dice vs 3" tip, so two text lines collide (neb-s2/s06).
- When a game ended right after my driver's tap, its next tap could land on "Play again", which goes to the title. That is my
  driver's race, not a game bug; a clean end shows the VICTORY / DEFEAT card with Debrief and Play again (s3, s4).

**Rules**: since R38 only board.js (banner/bubble placement), tutor.js (bubble layout), board.css and phone.css changed. Engine
untouched; stress, focus, range, bump and the off-mat refusal behaved as before in the lesson drill.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 7 | Engine unchanged. The R32 Rules-screen wording notes are still not re-checked. |
| 2 | Tutorial teaches | 7 | **Up from 6.** The bubble hides no ship or nameplate (0/21 at both sizes) and Leave lesson is 81x44. But "Spend focus" covers the dice it explains at 375x667. |
| 3 | First 10 seconds | 8 | Title, Launch, goal card, Start. |
| 4 | Turn clarity | 7 | One hint line and a finger every step; banners clear of ships. The combat banner and the fire tip overlap at 375. |
| 5 | Phone play | 7 | **Up from 6.** Targets >= 44 px, text >= 14 px, lesson bubble and banners clear of ships and nameplates. The dice cover in "Spend focus" and the combat text overlap are left. |
| 6 | AI and pacing | 7 | Follower 5/8, varied games of 6-13 rounds; one 31-round game drags. |
| 7 | Feel | 8 | 3D flights, tumbling dice, laser lines, painted result card. |
| 8 | Bugs | 8 | 0 errors, 0 stuck, 0 dead taps in 2 lessons and 9 games. |
| | **Total** | **7.4** | 7+7+8+7+7+7+8+8 = 59/8 = 7.4. **PASS**, no stopper. |

**Fix list (none blocks the pass)**
1. Rows 2/5: add the dice panel (`#bfdice` / the "You shoot" card) to `BF.placeCoach`'s avoid list, or dock the bubble above
   the ships during the dice steps. Repro: Tutorial at 375x667, step "Spend focus" (neb-tut/usefocus.png).
2. Row 4: keep the combat banner clear of the fire tooltip ("Fire at … · range · dice vs dice"). Repro: Quick game at 375x667,
   first combat step (neb-s2/s06).
3. Row 6: cap or nudge very long games (31 rounds seen); for example the rival closes in when nobody has hit for 5 rounds.
4. Row 1: re-check the Rules screen wording notes from R32.

---

## 3. vale-of-banners (shelf/W505-vale-gameplay @ e9fab6a013dfdc9c163e5a55e31adcd7c6a57913): 4.0 (capped), FAIL

**Gates**
- `--quick`: **PASS** (6/6 scenarios, 76.5 s).
- `--full`: **PASS** (phone-check 60.5 s; `rules-test.js ok: AI games: 40/40 finished, stuck 0, invariant breaks 0 / PASS 37 checks`;
  LAB 3/8 warning, not blocking).

Everything below ran on the **staged** build (`build-all.py --quick --out`, 1.6 MB page with the shell's gx-menu.css, served by
`gx-serve.js`), as R37 asked.

**Dock: fixed at all four sizes.** The game's own `dock-check.js` (now pointed at the staged URL) audits, at every one of your
decisions, that every dock button, glowing market tile, ★ tile, view tab and the workers chip is fully on screen, uncovered,
outside the turn banner and 44x44 or bigger. Its driver taps glowing things like a newcomer. I ran 2 full games per size:

| Size | Games to the result | Dock checks | Problems | Dock top / height | Smallest estate cell |
|---|---|---|---|---|---|
| 375x667 | 2/2 (lost 70-135, 97-106) | 252 | **0** | 417 / 250 px | 42 px |
| 360x640 | 2/2 (lost 82-128, 90-142) | 252 | **0** | 390 / 250 px | 38 px |
| 375x553 | 2/2 (lost 109-136, 89-139) | 254 | **0** | 306 / 247 px | 32 px |
| 390x844 | 2/2 (lost 102-153, 87-146) | 260 | **0** | 594 / 250 px | 55 px |

The worker row ("6 → 2 workers") is now fully inside the dock in every shot. The cost: at 375x553 the dock takes 247 of 553 px
and the board gets about 250 px, so the estate opens zoomed with a "Fit" button. Glowing cells stayed >= 44 px (the audit checks
them); only non-glowing cells shrink to 32-38 px.

**★ follower and newcomer games** (`newbie-test.js` pointed at the staged URL, default Gentle rival, hints on):

| Size | Style | Result | Time |
|---|---|---|---|
| 375x667 | ★ follower | lost 115-131 | 4.4 min |
| 375x667 | ★ follower | **won 131-126** | 4.6 min |
| 360x640 | ★ follower | **won 153-126** | 4.5 min |
| 375x553 | ★ follower | **won 121-110** | 4.7 min |
| 390x844 | ★ follower | **won 140-102** | 4.4 min |
| 375x667 | newcomer policy (reads previews, ignores ★) | **won 135-110** | 5.0 min |

0 covered taps, 0 page or console errors in all 14 games. (The ~20 "no-progress taps" per ★ game are taps that select a storage
tile before placing it, which don't change the game counter.)

**Tutorial ("Learn to play") on the staged build, the game's `tut-walk.js`:**

| Size | Result |
|---|---|
| 390x844 | PASS, 49 steps, ★ = coach on 49/49, every rule in order, longest wait 2.3 s |
| 375x667 | PASS, 49 steps, same |
| 360x640 | PASS, 49 steps, same |
| **375x553** | **STUCK at step 7/49 ("region")**, on two runs |

**Stopper: the tutorial freezes at 375x553.** After step 6 ("Build next to your land: same colour, same number as a die.") the
player builds, and step 7 never shows. The top bar says 7/49 with the "…" waiting dots, the prompt says "Both dice used. Tap End
turn.", and tapping End turn does nothing (the tutorial blocks it). I waited 6 minutes. The only ways out are "Skip tutorial" or
the menu, so a new player on a short phone can't finish the lesson. Cause: step `region` (ui.js line 1021) targets `#r-vp`, and
head.html line 367 hides it on short phones (`@media (max-height:600px) … #r-vp{display:none}`), so gx-tutor stays in its
`pend` phase forever. Shots: vale-tut/stuck-phone-xxs-1.png, wait-phone-xxs.png.

Other things I saw in the shots (not blocking):
- At 360x640 the rival's name in the score strip is cut ("Az… 22 pts") while a "+2 goods sold" chip sits on it.
- At 375x553 the "Your turn" banner covers the top bar's buttons for a moment, and the "+4 beacon" chip sits on the storage tiles.

**Rules**: the commit changes only layout (build.py, head.html, body.html, phone.js, ui.js layout code, feel.js) and the dock tests.
Engine untouched; 40/40 AI games clean.

| # | Row | Score | Why |
|---|-----|------:|-----|
| 1 | Rules fidelity | 8 | Unchanged and right (R37). |
| 2 | Tutorial teaches | 5 | **Down from 8.** 49 good steps at 390x844, 375x667 and 360x640, but at 375x553 it freezes at step 7 of 49. |
| 3 | First 10 seconds | 7 | Big Play, defaults set, short goal card, ★ on turn 1. |
| 4 | Turn clarity | 7 | Prompt line, ★ with a reason, points on the tabs. Feedback chips sometimes sit on the score strip. |
| 5 | Phone play | 7 | **Up from 5.** Dock fully on screen and every control >= 44 px in all 1,018 checks at the four sizes. At 375x553 the board is only ~250 px tall and opens zoomed. |
| 6 | AI and pacing | 7 | ★ follower won 4 of 5, the newcomer policy won, careless glow-tapping lost 8 of 8 (by 9-64). Games 2.2-5 min. |
| 7 | Feel | 7 | Dice, flying tiles, region and goods chips, honest result lines ("A clear loss, 50 points behind"). |
| 8 | Bugs | 4 | 0 errors and 14 games finished, but the tutorial is stuck at 375x553 (stopper). |
| | **Total** | **4.0** | Raw 8+5+7+7+7+7+7+4 = 52/8 = 6.5, **capped at 4: the tutorial gets stuck at 375x553.** **FAIL**. |

**Fix list**
1. **Stopper (rows 2/8):** make step `region` show on short phones. Either point it at an element that is visible at
   <= 600 px height (the points on the view tabs, which carry the score there), or stop hiding `#r-vp` during the tutorial.
   Also make gx-tutor fall back to an untargeted bubble when a target stays hidden for ~2 s, so one hidden element can never
   freeze a lesson. Repro: Learn to play at 375x553 on the staged build, tap the glowing targets; it stops after the first build.
   Check: `tut-walk.js` with a 375x553 entry, pointed at the staged URL (it only tests 390x844, 375x667, 360x640 and the bare file today).
2. Row 5: at 375x553 the dock takes ~45 % of the screen. Consider a shorter dice row or prompt there so the board gets more room.
3. Row 4 (minor): keep the "+N" feedback chips off the score strip and the storage tiles; don't cut the rival's name at 360 px.

R37 status:

| R37 finding | Status now |
|---|---|
| Dock cut at 375x667 / 360x640 / 375x553 on the staged build | **Fixed** (0 problems in 1,018 checks) |
| Stuck games at 375x553 (only legal move under the edge) | **Fixed** in play (2/2 glow games and 1/1 ★ game finished) |
| Dock check ran on the bare file | **Fixed** (dock-check.js and dock-states.js default to the staged build) |
| Tutorial at short sizes | **New stopper** at 375x553 |
