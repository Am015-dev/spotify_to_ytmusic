# R85 strict gameplay review: lantern-dive

**Verdict: FAIL.** Average of the 8 rows: **5.9**. One stopper (2-diver dives) caps the total at **4.0**. Rows under 7: Rules 6, Tutorial 6, Turn clarity 5, Phone 4, Bugs 3.

- Reviewed commit: `f3c8282a` (origin/alex/brave-carson-rbpmlk, newer than cb812c16, so it includes the shell calm pass).
- Reviewer: R85, playing as a newcomer by touch only. No game code was edited.
- Date: 20 Nov 2026, 15:00 to 15:40 UTC.

## Gates (2 runs each, run alone)
The brief's `VIS_lantern-diveS=","` is not a valid shell variable name (bash exits 127). With `env` it is ignored, so `visual.spec.js` falls back to SCN_SLUGS. It then fails 3 of 10 checks because no visual baselines exist locally. I therefore ran the gates with `VIS_SLUGS=","`, which is the evident intent.

| gate | run 1 | run 2 |
|---|---|---|
| `--quick --out /tmp/x lantern-dive` | PASS, 7/7 scenarios | PASS, 7/7 scenarios |
| `--full --out /tmp/x lantern-dive` | **FAIL** (details below) | **FAIL** (same result) |

`--full` details, the same in both runs:
- phone-check PASS at all 6 sizes.
- lab WARN 9/12: the LAB rows lack `menu`.
- `sweep.js` FAIL: 4 games, 4 with problems, 3 dives unfinished.
  - Part of this is a test gap. The "stuck in play, cands btnSignal/btnReady" state is the deliberate pre-trick wait ("Signal now, or tap Ready.", ui2.js:404). The sweep never taps Ready because `iMustAct()` is false there.
  - The 375x553 2-diver issues ("seat covers a job card", "nothing to tap in assign") are **real**; see Phone and Bugs below.

`games/lab.html`, rewritten by `--full`, was restored and not committed.

## Rules vs the original game (engine and every player-facing text)
Engine: **correct.**
- `node logic-test.js` passes 206/206 and `node rules-test.js` passes 105/105.
- All 8 fix rows of AUDIT-RULES.md are now in the engine: job 49 at engine.js:47, jobs 51/52 at :114, dive 19 at :347/:365, the 57/58 re-deal at :200, conflicting pairs at :221-257, limit-impossible jobs at :244-248, win at once at :170, and the drone barred from comparison jobs at :349.
- The 96 job texts match the engine logic. Over 30 were spot-checked, including every Lantern, total, exact-count and first/last-trick job.

Text mismatches (all under `games-src/lantern-dive/`):

| # | file:line | text says | rules / engine | severity |
|---|---|---|---|---|
| 1 | game/src/data.js:138 (dive 8) | "No diver may ever **hold** two more 9s" | counts 9s **won** in tricks (engine.js:165; the fail message itself says "won") | WRONG |
| 2 | game/src/data.js:150 (dive 20) | "ever **hold** two more 1s" | won in tricks | WRONG |
| 3 | game/src/data.js:151 (dive 21) | same "hold" | won in tricks | WRONG |
| 4 | game/src/ui5.js:19 | "no holding two more 9s" (rules drawer example) | won | MISLEADING |
| 5 | game/src/ui5.js:12; ui11.js:62, :68; ui4.js:7; ui12.js:59, :94, :97 | signal "once per **dive**" (7 places, 3 of them in the tutorial) | once per **attempt**: engine.js:184 resets `pingUsed` on every deal, as the published rules do | MISLEADING |
| 6 | game/src/data.js:172 (drone story) | "cards lie face up in two rows" | 7 face-up on 7 face-down (ui5.js:16 says so; the two texts contradict) | MISLEADING |
| 7 | game/src/ui5.js:9 step 5 | "Each diver may signal once. Then play the tricks." | a signal may also come between any two later tricks | MINOR |
| 8 | data.js:29, :67, :68 (jobs 7, 45, 46) | no "No Lanterns" note | engine.js:42-44 forbids Lanterns in the trick (jobs 6, 47-49 do say so) | MINOR |
| 9 | data.js:30-32, :36 (jobs 8-10, 14) | "win a trick by playing a 6/5/3/2" | only a colour card counts (engine.js:57); a winning Lantern 3 does not | MINOR |
| 10 | ui5.js:9 step 3 | job hand-out without the passing rule | may pass only with fewer jobs than divers; every job is taken in one round | MINOR |
| 11 | ui5.js:10 | trick counts for 4 and 5 divers only | 3 divers: 13 tricks, one card is never played | MINOR |
| 12 | ui5.js:40 (flare token card) | "Light it before a dive" | after the jobs are taken, before any signal (ui5.js:14 is right) | MINOR |
| 13 | ui5.js:14, ui11.js:56 | flare "left or right" | with 2 divers it is a swap (engine.js:449-455) | MINOR |
| 14 | ui5.js:16 | a face-down drone card turns up when the card on top is played | turns up when the trick ends | MINOR |
| 15 | ui5.js:13 | only the Captain is barred from comparison jobs | the drone is barred too (engine.js:349) | MINOR |
| 16 | ui12.js:92 (tutorial `flare`) | "A flare swaps cards" | each diver passes one card to a neighbour, all the same way | MINOR |

Rules verdict: the engine matches the original. The texts have 3 WRONG and 3 MISLEADING items (9 locations), and the tutorial itself teaches the wrong unit for signals.

## First-timer play (touch, 375x667 and 375x553)
- The title screen reads well: "New here? Learn in 5 minutes" is the big gold button, with "Dive together. Do not talk about your cards." above it.
- Tutorial: 22 steps in about 44 s at both sizes, one short line and one highlighted tap per step, in order. It covers the goal, Captain, taking jobs, failing, flare, the Lantern signal ban, the signal, following suit, highest-of-led wins, winner leads, no forced win, void, trumps, and winning at once. It ends with "Dive won! You know the rules" and then a real game. Lines are in the scratch log (tutorial-lines.txt).
  - It skips the hand-out turn order with passing and the trick-count / Commander-comparison job types.
  - It teaches "one signal per dive" (wrong unit).
- Real dives on the default level ("Dive 3, difficulty 4, You + 3 computers"), as a careful newcomer (the game's own easy-level choice, never signalling):
  - 375x667: won 2 of 3, twice.
  - 375x553: won 2 of 3.
  - As a naive newcomer (always the lowest legal card) at 375x553: won 1 of 3. The two losses came in 6 s each, on "win the first two tricks".
- Dives last 20 to 53 s. The computers are brisk and play sensibly. A newcomer can win on the default level.
- 2 divers (dive 5) at 375x667 and 375x553: **not playable** (see Bugs).
- 3 and 5 divers start correctly. They wait at "Signal now, or tap Ready." before trick 1, which is clear.

## Clutter (sampled every second, 375x667 / 375x553)

| path | max helpers (bubble, finger, nudge, ring) | max elements with glow classes | max infinite animations visible |
|---|---|---|---|
| title, first 10 s | 0 | 0 | 0 |
| tutorial | 1 | **13** | **14** |
| real dives | 0 | **10** | **11** |
| 15 s after Hints + bulb, 375x667 | 1 | 3 | **3** |
| 15 s after Hints + bulb, 375x553 | **2** (bubble + drag finger) | 4 | **5** (incl. `#finger.drag.go{fgdrag}`) |

- Infinite loops seen, beyond the known `game/head.html:345 jgl` (`.jcard.glow`):
  - head.html:321 `.tslot.turn{glowp}`
  - head.html:376 `.hc.glow::after{glowp}` (every playable hand card, up to 10 at once)
  - head.html:334 `#cenmark{glowp}`
  - head.html:311 `.dc.glow{glowp}`
  - head.html:283 `.seat.glow{seatglow}`
  - head.html:387-389 `#finger` `fgtap`, `fgring` and `fgdrag`
- `scripts/calm-audit.js` reports `loops=1 maxHelpers=0`. That undercounts: it finds no bulb (the bulb only appears after the "Hints" toggle), and its guided path taps "Rules" instead of the tutorial.

Clutter verdict: **fails** the 0-infinite-loops rule everywhere a turn is live. It also fails the 1-helper rule after a bulb tap at 375x553, and when glows are counted by class.

## Phone (375x553 is the binding size)
- Text: nothing under 11 px was seen. The turn prompt is 15 px.
- Taps:
  - At 375x553 the hand is one row of 10 overlapping cards (44x62), each showing **35 px** of width.
  - The job chips under "You" (`button.jc.me`) are **359x34** at both sizes.
- No horizontal scroll at either size.
- Clipping and overlap:
  - With Hints on, the turn prompt is cut to "Your turn: pl…" at 375x553 (q553/hint-on.png). In other states it disappears (probe/bulb-375x553.png).
  - The bulb bubble "Bram wins this trick." covers Bram's card in the trick it talks about.
  - 2 divers, both sizes: the job pool stacks vertically under the drone row. The first job is half covered by the drone row. The third is cut off by the table edge and, at 375x553, sits under "Signal ready" (`elementFromPoint` hits `.sgt`, a dead target). The drone row covers the trick slot during play.

## Scores (games-src/reviews/GAMEPLAY-RUBRIC.md)

| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | **6** | Engine correct and all audit rows fixed, but 3 WRONG dive texts (hold vs won) and "once per dive" in 7 player-facing places, including the tutorial. |
| 2 | Tutorial teaches | **6** | Good structure (22 one-line, one-tap steps ending in a real game). It teaches the signal unit wrongly, says the flare "swaps cards", omits hand-out passing, and runs up to 14 infinite glows. |
| 3 | First 10 seconds | 8 | Clear title, one big "Learn" button. After the tutorial, the set-up screen still makes "Tutorial ✓" the big gold button and "Start the dive" a plain row. |
| 4 | Turn clarity | **5** | Prompt top left (15 px) is good on 4 divers. At 375x553 it is cut or missing with Hints on. The gold "playable" glow is the same gold as the Sunstar suit frame. 2 divers: "Tap a drone card." with all drone cards drawn blank. |
| 5 | Phone play | **4** | Hand cards 35 px wide at 375x553, job chips 34 px tall, bulb bubble over its subject. 2-diver job pool clipped and one job untappable. Drone row over the trick slot. |
| 6 | AI and pacing | 8 | Brisk, sensible computers. The default level is winnable by a newcomer (4 of 6 careful, 1 of 3 naive). Dives are 20 to 53 s. |
| 7 | Feel | 7 | Painted table, cards fly from the seats, a toast on an illegal tap ("Follow Kelp if you can."), result card with art. The constant pulsing undercuts the calm the owner asked for. |
| 8 | Bugs | **3** | 0 page errors and 0 stuck states in 6 four-diver dives plus the tutorial at both sizes. **Stopper:** a 2-diver dive cannot be played as a human, because the drone's face-up cards render blank. |

Average 47/8 = **5.9**, capped at **4.0** by the stopper. **FAIL.**

## Repro steps for rows under 7
1. **Stopper: blank drone cards (row 8, also rows 4 and 5).**
   - Open `?` at 375x667 and run in the console `newGame('vs',{np:2,mission:5,kind:'log',level:'normal'})`. Or use Free play → Configure → 2 divers → dive 5.
   - Tap Dive, then OK on "New rule", take a job, and play until the prompt says "Tap a drone card."
   - All 7 face-up drone cards show as blank blue backs. The DOM `.dc` holds the card (e.g. "2", "4", "5"), but `html.ldpx .dc svg.card{visibility:hidden}` (head.html:221) hides it, and the painted layer (ui7.js:181-197) does not show the face.
   - Screenshots (scratch): probe/play2p-667.png, probe/assign2-667.png.
2. **2-diver job pool (row 5).** Same start, at 375x553.
   - The 3 job cards stack vertically from y=165 to y=424. Card 1 is half under the drone row.
   - Card 3 is under `.sgt` ("Signal ready") and cannot be tapped.
   - The "New rule" bubble first covers cards 1 and 2.
   - Screenshot: probe/assign2-2p.png.
3. **Hand too tight (row 5).** At 375x553 in any 4-diver dive with a 10-card hand, the cards overlap to a 35 px visible width.
4. **Prompt cut (rows 4 and 5).** At 375x553, tap "Hints". The bulb appears and the prompt shrinks to "Your turn: pl…". After a bulb tap it can vanish.
5. **Bulb clutter (row 5, Clutter).** At 375x553 in your turn, tap Hints and then the bulb. A bubble "Bram wins this trick." covers Bram's trick card, and a looping drag finger (`#finger.drag.go`, fgdrag, infinite) shows at the same time: 2 helpers and 1 loop for 15 s.
6. **Glow ambiguity (row 4).** Sunstar cards have a gold frame, and playable cards get a gold pulsing frame. In a Lantern trick, the Sunstar cards look playable (p667/turn-3-play.png).
7. **Text (rows 1 and 2).** See the rules table: items 1-6.

## Prioritized fix list
1. **P0, stopper.** Make the drone's face-up cards visible in the painted layer: draw `.dc` faces in ui7, or exclude `.dc` from head.html:221. Re-test a full 2-diver dive by touch at 375x553.
2. **P0.** Lay out the 2-diver job pool and drone row so that every job card is fully visible and tappable at 375x553 and 375x667, and the drone row never covers the trick slot. Add a `?scn=` scenario for 2-diver assign and play.
3. **P1.** Remove the infinite animations, using the calm pattern: pulse 3 times, then a still ring.
   - head.html:321, 345, 376, 334, 311, 283 and 387-389.
   - Show one glow per decision, not one per playable card. Use a non-gold "playable" mark, such as a lift or a white edge, so Sunstar frames don't read as playable.
4. **P1.** After a bulb tap, show the bubble only, with no looping finger. Place the bubble so it never covers its subject card.
5. **P1.** Fix the texts:
   - data.js:138, :150, :151 and ui5.js:19: "hold" → "have won".
   - "once per dive" → "once per attempt" in ui5.js:12, ui11.js:62 and :68, ui4.js:7, ui12.js:59, :94 and :97.
   - data.js:172: "face up in two rows" → "7 face up on top of 7 face down".
6. **P2.** At 375x553, make hand cards at least 44 px visible (two rows like 375x667) and job chips at least 44 px tall. Keep the turn prompt on one full line when Hints is on.
7. **P2.** MINOR texts 7-16. Make "Start the dive" the gold primary on the set-up screen once the tutorial is done. Teach hand-out passing in the tutorial or the first real dive.
8. **P3.** Test tooling:
   - Teach sweep.js the pre-trick "Ready" wait.
   - Make calm-audit.js open the tutorial and tap "Hints" before the bulb.
   - Fix the brief's env var (`VIS_SLUGS=","`).
