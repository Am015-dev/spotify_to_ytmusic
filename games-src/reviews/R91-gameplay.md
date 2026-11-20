# R91 strict gameplay review: vale-of-banners

**Verdict: FAIL, average 6.8** (rows 1, 4, 5, 6 under 7; no stopper).
Reviewed commit: `f3c8282ad16c62f345f2d033dd147a342e5ff903` (origin/alex/brave-carson-rbpmlk, contains cb812c16 shell calm pass). Reviewer: R91, 20 Nov 2026, ~15:30 UTC.
Review only: no game code was changed.

## Gates (run alone, one after the other)
| Run | Result |
|---|---|
| `--quick` #1 | PASS (scenarios 9/9) |
| `--quick` #2 | PASS |
| `--full` #1 | PASS (phone-check ok, rules-test sweep 40/40 AI games, 0 stuck, 0 invariant breaks; LAB test WARN 3/8 only: LAB rows lack `menu`) |
| `--full` #2 | PASS (games/lab.html rewrite discarded, not committed) |

Note for the orchestrator: the brief's `VIS_vale-of-bannersS=","` is a mangled `VIS_SLUGS=","`. With the literal text, `--quick` FAILS 6/9 on
"snapshot doesn't exist" because vale-of-banners has no visual baselines on ui-baselines (only rampart-and-vine and sunglaze). All four runs above used `VIS_SLUGS=","`.
Also `node logic-test.js`: 192/192 rule asserts pass.

## Strict checks
### Rules vs the original (engine + every player-facing text)
Engine: faithful. 192/192 headless asserts pass. I read the rules notes and checked the core: 2 dice + workers (1<->6 wrap), take / build / sell (1 silver + 2/3/4 per crate) / 2 workers,
back lane 2 silver once a turn, keep = free action, mine 1 silver per season, barge = all goods of one stall + track step, 8 buildings, region 1..36 + 10/8/6/4/2,
colour bonus 5/6/7 and 2/3/4, end +1 silver / +1 crate / +1 per 2 workers, tie = more empty spaces then further back (engine.js:319). All match.
Known, documented deviation still open: stall spaces in the original are colour-coded (and the 3-player stall-6 keep/mine rotation); ours draw at random (rules-notes.md, W505).

Player-facing text mismatches (fix all):
| # | Where | Text | Problem |
|---|---|---|---|
| T1 | src/ui.js:357 (`TWHY.pas`) | "animals score when the region fills" | WRONG rule. A pasture scores when it is placed (engine + coach say so). This text is the ★ hint line and the tile card reason, so every game shows it. |
| T2 | src/ui.js:919 (How to play, "Our own changes") | "A fourth kind of goods does not fit and is lost." | Contradicts the engine (W437, checklist #82): the crate stays on its stall. |
| T3 | src/ui.js:919 | "All tiles come from one shuffled pile." | Contradicts the engine: 40 black-backed tiles feed only the back lane (checklist #180-183). |
| T4 | src/ui.js:911, src/story.js:60 (coach `pas` say + later) | "every animal of that kind nearby" | Imprecise: only same animals in the same meadow (outlined region) count; same animals in a neighbouring meadow do not (checklist #89). |
| T5 | src/story.js:39 (`tut.result.say`) | "Score 1 per silver, crate and lore" | Wrong (lore scrolls pay 3 per building kind / 1 per sale / 4 per animal kind). Only `.win`/`.lose` of this object are used (ui.js:831), so this is dead text: delete it. |
| T6 | src/story.js:8-38 (`tut.*` except `result`) | e.g. "Win: most points when spring ends" | Dead prologue text from an old tutorial; it also states a wrong win condition. Delete. |
| T7 | src/ui.js:894-919 (How to play) | missing | No game length (5 seasons x 5 rounds), no storage limit (3, then discard), no "max 3 goods kinds", "the track" is never explained as turn order. |

### First-timer play (tutorial + 3 full games by touch)
- Tutorial: `tut-walk.js` against the staged build passes at 390x844, 375x667, 360x640, 375x553 and 1440x900: 49 steps, every rule in order (dice > goal > take > storage > build > region > end > order > white > sell > workers > kinds > bend > wrap > back > keep > building > hall > pasture > lore > barge > discard > colour > season > final > tie), each target on screen, then a real game. Clear, but long (49 steps) and on some steps the coach also writes into the prompt line under the bubble (step 10: bubble "Each round the white die..." plus prompt "Old Odo: Two dice, two actions...") = two voices at once.
- 3 Quick games on defaults (rival Gentle, hints on), touch taps only, newcomer policy (reads previews and glows, ignores the ★): 375x667 LOST 79-138, 375x667 LOST 122-124, 375x553 LOST 58-120. 93-96 decisions, ~5 min each, 0 errors, 0 stuck, 0 no-progress taps.
- Headless check, same policies vs Gentle, 60 seeds: newcomer wins 14/60 (23 %, average -27); ★ follower wins 35/60 (58 %, +6.5). A newcomer who does not follow the ★ rarely wins on the default level.
- Whose turn / what to do: clear. Turn banner, "Your move" panel, one prompt line + one ★ reason line, goal card before turn 1 (4 short lines).

### Clutter (sampled once a second)
| Measure | Result | Need |
|---|---|---|
| Infinite animations at once, play (my touch games) | **9 (667), 10 (553)** `.glow` on every legal storage tile, goods pile and stall tile, plus `.aipick {aip}` | 0 |
| calm-audit.js (scn vb-board + bulb, 20 s) | **loops=3** (`#mt-4-1 .glow`, `#gd-2 .glow`, `#gd-4 .glow`); title: `#tutB.glow` | 0 |
| Helpers (bubble/finger/nudge classes) | 0-1 | <= 1 |
| Helpers counting glows by class | **up to 11 glowing elements at once** | <= 1 |
Own loops: src/head.html:50 `.glow` (known) and **src/head.html:203 `.tilebtn.aipick` `aip .5s infinite alternate` (not on the known list)**.

### Phone (375x667, 375x553)
- Text: nothing under 11 px. OK.
- Taps: **estate spaces `button.cell` are 39x44** (all 37) at both sizes, under 44 wide. White die chip 36x36 (not a control, fine).
- Clipped: **season label in the top bar is cut to "Spring ...", "Harvest ...", "Game o..."** at both sizes; rival name cut to "Azu..." in the score strip at 667.
- Overlap: at 375x553 the turn banner sits over the Hints and bulb buttons for ~1 s every turn; score floaters ("+2 goods sold", "+4 animals") cover the tabs / score strip briefly. Transient, not blocking.
- Dead taps: 0.
- Result card: the result art is squeezed into an 8 px high strip (ui.js:817 `height:8px`) and reads as a broken image icon.

## Scores (GAMEPLAY-RUBRIC.md)
| # | Row | Score | Why |
|---|---|---|---|
| 1 | Rules fidelity | **6** | Engine right, but the ★ / tile text teaches a wrong pasture rule (T1) and How to play states two rules the engine does not use (T2, T3). |
| 2 | Tutorial teaches | 7 | Every core rule in order, one line + one tap, real game after. Long (49 steps); coach line in the prompt doubles the bubble on some steps. |
| 3 | First 10 seconds | 8 | Goal card: aim + 4 short steps, the glow and ★ point at the first move. |
| 4 | Turn clarity | **6** | Prompt + ★ line are good, but up to 10-11 pulsing glows at once bury the one thing to do; season name truncated. |
| 5 | Phone play | **6** | Estate spaces 39 px wide; top-bar season label clipped; banner covers Hints/bulb at 553. |
| 6 | AI and pacing | **6** | Brisk, sensible rival, ~5 min games. Newcomer 0/3 by touch, 14/60 headless on Gentle; only ★ followers win often. |
| 7 | Feel | 7 | Dice roll, floaters, build pops, count-up result. Result art squashed. |
| 8 | Bugs | 8 | 0 errors, 0 stuck, 0 dead taps in 3 touch games + tutorial at 5 sizes + 4 gates. |

**Average 6.8. FAIL** (rows 1, 4, 5, 6 < 7; clutter check fails: loops 9-10, glows 11).

## Repro steps (rows under 7)
- Row 1 (T1): Quick game, take any Pasture tile with hints on; the ★ line / tile card says "...: animals score when the region fills". Build it: points arrive at once.
- Row 1 (T2/T3): Menu > Rules > scroll to "Our own changes".
- Row 4 / clutter: Quick game, turn 2+ with 3 stored tiles and 2-3 goods kinds: every storage tile and goods pile pulses (`.glow`, infinite). `CALM_SECS=20 node scripts/calm-audit.js /tmp/x vale-of-banners` -> loops=3.
- Row 5: 375x553 or 375x667, any game: top-left reads "Spring ..."; `document.querySelector('#ec-0').getBoundingClientRect().width` = 39.
- Row 6: 3 Quick games on defaults playing what the previews and glows suggest without the ★: lost 3/3 (by 59, 2, 62).

## Fix list (priority order, for a fixer)
1. **Clutter (blocks PASS):** make `.glow` a static ring (no infinite animation; a one-shot 2-pulse at most) and glow ONLY the ★ target; other legal targets get a quiet static outline. Remove the infinite `aip` loop (head.html:203): one 0.5 s pulse then static. Title `#tutB` glow: static. Re-run calm-audit -> loops=0, glows<=1.
2. **T1:** ui.js:357 `pas: 'scores its meadow\'s animals now'`.
3. **T2, T3:** ui.js:919 replace with "A fourth kind of goods stays on its stall." and "The back lane gets only its own tiles." (or delete both lines; the first is not our change).
4. **T4:** ui.js:911 and story.js:60: "in the same meadow" instead of "nearby".
5. **T5, T6:** delete dead `VSTORY.tut.*` text except `result.win/lose` (story.js:8-39).
6. **T7:** add to How to play: "5 seasons of 5 rounds", "Storage holds 3 tiles; a 4th makes you drop one", "You hold at most 3 kinds of goods", "The track sets turn order: higher goes first".
7. **Phone:** estate cells >= 44x44 at 375 wide (shrink gutters or let the board use the full width); top-bar season label must fit (short form "Spring 1/5" or drop the flag text); keep the turn banner off the Hints/bulb buttons at 375x553.
8. **AI:** soften Gentle until a newcomer who ignores the ★ wins about 1 in 2 (now 23 %): more noise / more whims, or cap its look at colour bonuses. Re-check with the 60-seed sim (newbie-policy vs gentle).
9. **Tutorial:** do not write the coach line into the prompt while a tutorial bubble is open (one voice per step); trim steps that only say "Tap End turn" where possible.
10. **Result card:** give the result art its real height or drop the 8 px slot (ui.js:817).
