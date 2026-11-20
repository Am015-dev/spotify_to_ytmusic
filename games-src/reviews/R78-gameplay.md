# R78 strict gameplay review: short-fuse

- Commit reviewed: `f64204d25aea9832156154ad0e2e8cc83c49b084` (origin/alex/brave-carson-rbpmlk, "shell calm pass"), reviewed 20 Nov 2026 (UTC).
- Reviewer: R78. Review only, no game code changed.
- **Verdict: FAIL.** Average 7.4. Row 5 (phone + calm) scores 4. The game's own infinite animations break the 0-loop bar, and tap targets are under 44 px at 375x553.

## Gates (each run alone, one after another)

| Run | Result |
|---|---|
| `--quick` #1 | PASS, 9/9 scenarios ok |
| `--quick` #2 | PASS, 9/9 scenarios ok |
| `--full` #1 | PASS: phone-check ok, sweep ok (4 games, 0 problems, won 1 / lost 3), lab WARN 9/12 (LAB rows differ from the scenario list) |
| `--full` #2 | PASS: phone-check ok, sweep ok (4 games, 0 problems, won 3 / lost 1), lab WARN 9/12 (same) |

Setup notes:
- The first gate attempt failed with `FileNotFoundError: node_modules/three/build`. This is the environment, not the game. After `npm i --no-save three@0.158 playwright@1.63.0 @playwright/test@1.63.0` the gates ran.
- `games/lab.html`, rewritten by `--full`, was restored and is not committed.

## How it was played

- Harness: the built page from `/tmp/x`, served by `gx-serve.js`. Chromium was set to `isMobile` and `hasTouch`, and every move was a touchscreen tap.
- Each game started from fresh storage. Every second I sampled:
  - helpers (bubbles, fingers, nudges, rings);
  - infinite animations;
  - text under 11 px;
  - tap targets under 44 px;
  - horizontal clipping and horizontal scroll.
- Tutorial ("Learn to play"): run to its end card at 375x667 and at 375x553. Both took 17 steps and ended in "Play job 1".
- Six full games: 3 crew, normal computer, jobs 1, 2 and 3 at each size, played as a first-timer who reads only the screen (tokens, cut wires, sort order).
  - Results: won 4, lost 2 (both "fuse burnt down", after 3 misses).
  - Length: 11 to 23 turns per game. Every game reached its result card.
- After the first turn of every game: tap the Hint bulb, then sample for 15 s. On job 3 at both sizes, also tap Hint, then "Show me", then sample for 15 s.

## Rules vs the original (repo notes: `short-fuse/rules-notes.md`, `missions.json`, `game/RULES-AUDIT.md`)

### Engine (`game/src/engine.js`)

Every core rule below matches the notes:
- setup: stands per player count (`stCount`), dial start = players, maximum 6, round-robin deal, one opening token per player on their own blue wire;
- Dual Cut (`legalDual`, `doDual`, `dualMiss`), in all three outcomes:
  - hit: both wires cut;
  - miss: dial −1 and a true token on the wire;
  - red: explosion;
- you may only name values you hold, and never red;
- the active player's own wire is never revealed;
- Solo Cut (`legalSolo`): all 4, or the last 2, never 3;
- Reveal Reds is forced at the start of a turn (`AG.forced`);
- yellow is one shared value with the yellow token;
- equipment unlocks after 2 cuts of its value (4 for double cards), works once, and keeps its timing classes;
- Twin Probe (`dualMiss`):
  - one red among the targets: no explosion, and the tag goes on the non-red wire;
  - all targets red: explosion;
- Damper (red: no token; miss: no dial step);
- Two-Value Probe (an announcement that you hold the other value);
- win and loss checks.

The computer crew decides from `knowledge(seat)` and samples possible deals (`src/ai.js` `aiMove`). It never sees hidden wires.

The 21 mission-level items in `game/RULES-AUDIT.md` are marked fixed. I did not re-verify all 66 jobs. I spot-checked jobs 1, 2, 3, 13, 14 and 26 against `missions.json`, and they match, including the rookie's Damper ban.

### Player-facing text: every mismatch I found

| # | File:line | Text / behaviour | Original | Severity |
|---|---|---|---|---|
| T1 | `game/tutor.js:44`, `game/coach.js:12` | The tutorial rewrites `EQUIP.eq6.v=2`, so Rewind shows and unlocks at **2**. | Rewind (card 6) unlocks after two **6s**. A new player is taught a wrong card value, then meets the real one in job 3. | minor (teaching) |
| T2 | `game/texts.js:163` ("Kept simple") | A hand with no legal cut skips its turn, and four rounds with no progress explode the bomb. | Not in the original. These are disclosed house rules. Keep them, but label them "house rule" in the help. | minor (disclosed) |
| T3 | `game/texts.js:180` (Info token entry) | "When the supply runs dry, a token is still 'spoken'". | The original has 26 physical tokens. This is a digital convenience. Label it as one. | nit |
| T4 | `game/story.js:19` | "cutting a red means boom". | The boom comes from **pointing at** a red in a dual cut. A Twin Probe touching one red is safe. `hlp.js:47` says this correctly. | nit |
| T5 | `shell/gx-tutor.js:251` (seen in the short-fuse tutorial) | On the last step, a tap off-target says **"Tap Next."**, but that step's button reads **"Finish"**. | Copy bug. | nit |
| T6 | `game/src/engine.js:349` | The AI move list only offers Triple Probes on 3 **adjacent** wires. `legalDual` accepts any 3. | The original allows any 3 wires on one stand. This only limits the AI, not the player. | nit |

**Rules verdict:** the engine is faithful on every core rule. There are no stoppers. The text has 1 minor teaching error (T1), 1 disclosed house rule that needs a label (T2), and 4 nits.

## Clutter (sampled every second)

| Path | Max helpers on screen | Max infinite animations visible |
|---|---|---|
| Tutorial 375x667 / 375x553 | 1 / 1 | **15 / 15** |
| Job 1-3 play 375x667 | 0 (the hint is an inline line) | **25 / 27 / 29** |
| Job 1-3 play 375x553 | 0 | **25 / 35 / 29** |
| 15 s after Hint (every game) | 0-1 | **25-35** |
| 15 s after Hint, then "Show me" (job 3, both sizes) | 1 bubble (it uses a class the calm-audit selector does not count) | **31** |

- **Helpers: PASS.** Never more than 1 on screen.
- **Loops: FAIL.** The 0 bar is never met. The shell calm pass made the hint and tutor pulses finite, but the game's own loops still run:
  - `gl` on every glowing tile, plate, gear card and chip: `game/table.css:117` (`animation:gl 1s ease-in-out infinite alternate`). This alone is 15 to 30 elements whenever it is your turn.
  - `sk-spark`, the fuse spark: `game/skin.css:29`, and `.spark` at `game/table.css:26`. It runs all the time.
  - `shk` on the bomb icon when the fuse is low: `game/table.css:28` (`.fz.danger .bm`). Seen on every game that reached 1 step.
  - Not triggered in my runs, but present: `.clk.low` at `game/table.css:46`, and `#ghost` (`gtap` / `gdrag`) at `game/table.css:191-192`.

## Phone (375x667 and 375x553)

- **Tap targets under 44 px:**
  - At 375x553, the wire tiles of 9 to 10 wire rows are **30x44**, both your own stand and crew stands (seen on jobs 1, 2 and 3). The `--tw` width is fitted in `tbl.js`, with a default of 40 at `table.css:71`.
  - The hint's **"Show me"** button is **71x28** at both sizes (`table.css:332` `#pv .wsd`).
  - The red/yellow marker chip `.jc.mk` (tappable) is 28 to 42 px tall (`skin.css:227`).
- **Text under 11 px:** the rotated "Stand 1" / "Stand 2" labels on a zoomed two-stand view are **10 px** (`table.css:393`, `font-size:10px`). Seen on jobs 2 and 3 at both sizes.
- **Clipping:**
  - `#say` (the status line) spans x 1-378 on a 375 px screen. A long line runs off the right edge (`skin.css:97`, `overflow:visible`).
  - The vertical "Stand 1" label goes to x −1 at 375x553.
  - At 375x553 the bottom row of Stand 2 sits flush on the screen edge, and the tile art is cropped.
- **No horizontal page scroll** in any sample.

## Scores (GAMEPLAY-RUBRIC.md)

| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | **7** | The core engine is faithful. Tutorial Rewind = 2 (T1). House rules not labelled (T2). Text nits T3-T6. |
| 2 | Tutorial teaches | **8** | 17 steps, one short line and one tap each, in rule order: goal, your stand, opening token, dual cut, hit and unlock, Twin Probe, miss and token, gear, yellow, red, solo, auto-reveal. It ends in a real job 1, with no "learn later" list. Loses points for T1 and T5. |
| 3 | First 10 seconds | **8** | A one-line pitch, a big Play button and a visible "Learn to play". The Goal card gives 1 sentence and 3 bullets. |
| 4 | Turn clarity | **7** | Every turn shows the tracker ("Job 3 · Your turn · 1 action · or play gear"), the score chips and a status line, and Hint explains its move. However, there are four stacked text bands before the board: tracker, chips, "Turn over" banner and status. The range labels on backs ("3·4", "6-8", "1·Y"), the "!" and "≠10" marks need the Hint or help to decode. The status line says "tap a crew wire to guess" while Hint says "solo-cut your 6s". |
| 5 | Phone play (+ calm bar) | **4** | 15 to 35 infinite animations on screen at all times (stopper for the owner's calm bar). Tiles are 30x44 at 375x553. "Show me" is 28 px tall. Stand labels are 10 px. The status line runs off the right edge. |
| 6 | AI and pacing | **8** | The computer crew is fair and quick ("tap to skip"). The first-timer strategy won 4 of 6 on normal. Games run 11 to 23 turns. |
| 7 | Feel | **8** | Snip and buzz, "+2" pops, fuse burn, shake on a miss, painted result card with a story line and a checklist of what you tried. |
| 8 | Bugs | **9** | 6 games and 2 tutorials had 0 page errors, 0 stuck states and 0 dead taps. The only console errors were two font loads my harness blocked on purpose. |

- **Average: 7.4. FAIL.** Row 5 is under 7, and the owner's 0-infinite-animation bar is missed.
- No stopper in play: no crash, nothing stuck, no rule broken.

## Repro steps for the row under 7 (row 5)

1. Build: `VIS_SLUGS="," python3 games-src/scripts/build-all.py --quick --out /tmp/x short-fuse`.
2. Open `/short-fuse/` at 375x553, set to touch, with clear storage. Tap **Play** (job 1, 3 crew, Normal), then **Go**, then tap any of your wires for the opening token.
3. On your turn, run `document.getAnimations().filter(a=>a.effect.getComputedTiming().iterations===Infinity).length` in the console. It returns about 25: every `.tile.glow` runs `gl`, and `.spark` runs `sk-spark`.
4. Measure any tile in a row of 9 or more wires: 30x44.
5. Tap the bulb. The "Show me" button is 71x28.
6. Job 2 or 3 (you have two stands): zoom a two-stand view. The "Stand 1" label is 10 px.

`node games-src/scripts/calm-audit.js /tmp/x short-fuse` reproduces the loop count.

## Prioritised fix list

1. **Kill the game's own infinite loops (P0, row 5).**
   - `table.css:117`: change `gl` to a finite pulse (for example `animation:gl .6s ease-in-out 2 alternate`), then a static glow (border or box-shadow), re-run only when the selection changes.
   - `skin.css:29` and `table.css:26`: run the fuse spark a few cycles after each burn, then show a static frame.
   - `table.css:28`: run `shk` 2 to 3 times when the fuse drops to 1, then stop.
   - Also make finite `table.css:46` (`.clk.low`) and `table.css:191-192` (`#ghost`).
   - Acceptance: calm-audit reports `loops=0`, also for 15 s after Hint and "Show me".
2. **Tap targets at 375x553 (P0, row 5).**
   - Never fit `--tw` under 44 px for a tappable row. Wrap long rows into two lines of 44 px or wider (the job 3 layout already wraps), or let the row scroll sideways.
   - Make `#pv .wsd` "Show me" at least 44 px tall (`table.css:332`).
   - Give `.jc.mk` at least 44 px height, or make it non-interactive (`skin.css:227`).
3. **Text and clipping (P1, row 5).**
   - Rotated stand labels: at least 11 px (`table.css:393`).
   - `#say`: `max-width:100%; overflow:hidden; text-overflow:ellipsis`, or a shorter line, so it never passes 375 px (`skin.css:97`).
   - Keep the vertical "Stand 1" label at x ≥ 0.
4. **Teaching accuracy (P1, rows 1-2).**
   - Use a gear card that really unlocks at 2 in the training rig, or show the real value. Do not rewrite Rewind to 2 (`tutor.js:44`, `coach.js:12`).
   - Make the shell nudge use the step's own button label ("Tap Finish.") (`shell/gx-tutor.js:251`).
5. **Label house rules (P2, row 1).** Head `texts.js:163` "Kept simple" as "House rules on this page (not in the box game)". Mark the "spoken" token at `texts.js:180` the same way.
6. **Turn-clarity trims (P2, row 4).**
   - When Hint suggests a solo cut, make the status line match ("Hint: solo-cut your 6s").
   - Fold the "Turn over" banner into the tracker line, to drop one text band at 375x553.
7. **Nits.**
   - `story.js:19`: "pointing at a red means boom".
   - `engine.js:349`: let the AI consider non-adjacent Triple Probe targets.
   - Count the hint bubble in calm-audit's helper selector, so audits see it.

Evidence (session scratchpad, not committed): per-step tutorial shots, a turn, mid-game and result shot for each game, and the hint and "Show me" shots at both sizes.
