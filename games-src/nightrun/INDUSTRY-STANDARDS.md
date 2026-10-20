# Nightrun: industry standards (targets bots and reviewers judge against)

Why: the owner does not have time to test; so the genre's common practice is turned into numbers a bot can check.
Every target is a RANGE. **hard** = must hold (a FAIL blocks a release); **guide** = tune towards it, a FAIL is a work item.
Measured by `games-src/nightrun/industry-audit.js` (writes `review/industry-audit.json`). Run:
`NODE_PATH=$(npm root -g) node games-src/nightrun/industry-audit.js` (about 5 min; `RUN_REPEAT=1` first refreshes the cross-session numbers, about 15 min).

**How to run**
- Full: `NODE_PATH=$(npm root -g) node games-src/nightrun/industry-audit.js`. Sims, then counter-test, abil-test, tutorial-test and weapon-test one after another; writes `review/industry-audit.json` (`standards`, `measures`, `harness`).
- Quick, about 1 min: add `--quick`. One stage, no seeds, no non-god runs, no tutorial or weapon tests. Use it while developing; its numbers are not gate-grade.
- Gate: add `--gate`. Exit code 1 when any **hard** standard FAILs. Without it the audit only prints.
- Each SKIP line says why it is not measured. A SKIP is not a PASS.
Ids S01-S32 match the audit's output. Genre references are called A-J here (horizontal and vertical shooters, bullet-hell, run-and-gun, rhythm-action, dash-based action and roguelite shooters).
Where a number comes from a source it is the source's own; where the sources were qualitative the range is a practitioner estimate and is marked (est.).
The range is for a Normal-difficulty, mid-build player unless stated.

## 1. Enemies: life, kill time, density
| Id | Standard | Range | Level | Practice behind it | Measured how |
|---|---|---|---|---|---|
| S01 | Median on-screen life of the shortest-lived enemy kind (enter view -> removed) | >= 1.5 s | hard | A fodder enemy that dies in under a second is never seen; fodder in the references lives 2-5 s, one to five shots (ref. G: most enemies die in 1-5 shots) | audit: per-kind life from first frame in view |
| S02 | Kills less than 0.7 s after entering view, share of all kills | <= 15% | hard | Same; the player must see the enemy before it dies | audit |
| S03 | Median on-screen life, all kinds | 3-10 s (est.) | guide | Mid enemies 4-12 s, elites 8-20 s | audit (`lifeByKind` in the json) |
| S04 | Enemy bullets on screen, mean | 12-60 (est.; horizontal shooters, not dense bullet-hell) | guide | Density is the main difficulty lever across difficulty levels (ref. C); readability needs speed or count to be traded | audit, sampled every 0.1 s |
| S05 | Enemy bullets on screen, p95, non-boss | <= 150 | hard | Readability ceiling on a phone | audit |
| S06 | Bullet density ramp, late stage / early stage | 1.5-3.5x (est.) | guide | Difficulty ramps per stage; a flat curve reads as no progression | audit (stage 3 vs stage 30) |
| S07 | Enemies on screen at once, mean | 3-10 (est.) | guide | | audit |
| S08 | Spawns per minute (swarm members count) | 20-80 (est.) | guide | | audit |
| S09 | One enemy kind's share of spawns | <= 35% | hard | Existing gate (repeat-audit) | audit |
| S17 | Spawn-schedule Jaccard across seeds, stage 10 (type x 3 s) | <= 0.35 | hard | Replays should differ, but the stage keeps its identity | audit, 3 seeds, 90 s |
| S18 | Median per-enemy fire-interval CV | >= 0.25 | guide | A metronome (CV < 0.1) is read by ear; the references vary delay and count | audit |
| S19 | Share of seeds with a distinct first-15 spawn order | >= 0.67 | guide | | audit |

## 2. Bosses
| Id | Standard | Range | Level | Practice behind it | Measured how |
|---|---|---|---|---|---|
| S10 | Median stage-boss fight length | 40-135 s | hard | Boss timers of about 100 s (ref. A); W52: district bosses are puzzles (armour floor 80 s + one puzzle phase), so the audit bot Normal target is <= 135 s; the short-fight roguelite (ref. G) keeps bosses under 30 s but has far smaller bosses | audit (boss window, first frame to last) |
| S11 | Fewest phases in a stage boss | >= 3 | hard | Three phases is the common teaching length (ref. B); easy modes remove phases rather than shorten them | audit; `bossmoves-audit.js` for kits |
| S12 | Distinct attacks per boss fight | 6-12 (est.) | guide | Heavy and light phases alternate (ref. C); each phase adds one idea | audit |
| - | Every attack telegraphed before it hurts | 100% | hard | Stated for the whole boss list of ref. B | `bossplay-test.js`, `bossmoves-test.js`, `counter-test.js` |
| - | Boss kits sharing <= 2 attacks per pair | >= 6 kits | hard | Existing gate | `repeat-audit.js` (bossKits) |
| - | Mini-boss spacing | one per 3-6 stages (stage, mid-boss, stage, boss rhythm, ref. C) | guide | | `repeat-audit.js` |

## 3. Pacing, novelty, run length
| Id | Standard | Range | Level | Practice behind it | Measured how |
|---|---|---|---|---|---|
| S13 | Repeat within 5 min | < 75% | hard | Existing gate | `repeat-audit.js` |
| S14 | Plain-loop share of play time | < 35% | hard | Existing gate | `repeat-audit.js` |
| S15 | Longest gap with no new mechanic | <= 15 min | hard | The references add one or two mechanics per boss or level, a new idea every 5-10 min (ref. B) | `repeat-audit.js` (longestMechGapMin) |
| S16 | New things per 30 game-min | >= 40, never below 20 | guide | | `repeat-audit.js` |
| S25 | Stage length, median | 90-240 s | hard | Stage = one clear idea; arcade stages 2-4 min; the roguelite shooter's first full run is 15-20 min over about 10 areas (ref. G) | audit |
| S26 | Checkpoints per stage of 150 s or longer | >= 1 | guide | Room-sized checkpoints and no life limit in ref. D; classic arcade has none but a 7-stage loop | audit: checkpoint plan the page builds per story stage (CPPROBE), worst stage of 150 s or longer; `ret-cp-test.js` checks the behaviour |
| - | Run length (until a natural stop) | 10-30 min | guide | Session length of the references; 30 min is also the target of the survival-style reference (ref. H) | `repeat-audit.js` gameMinutes per session |
| S27 | Choice points per hour (cards, forks, loadout swaps) | >= 6 | guide | The roguelite references offer 3-4 options per level-up (ref. G: 4) or per room | audit: `pitStart` count in the arcade sim; SKIP with the reason while the pit stop never fires there (0 in repeat-audit arcade-normal); `choices-test.js` for the card logic |

## 4. Player verbs: dash, panic button, power-ups, risk and reward
| Id | Standard | Range | Level | Practice behind it | Measured how |
|---|---|---|---|---|---|
| S20 | Panic button (EMP / bomb) uses per minute, competent bot | 0.3-1.5 (est.) | guide | A bomb is scarce and valuable (ref. C), but a never-used one is dead UI | audit |
| S21 | Dash uses per minute | 3-10 (est.) | guide | | audit |
| S22 | Share of dashes that are last-moment reflexes (bullet within 60 px) | <= 70% | guide | Dash with invulnerability frames became the core verb in two references (ref. E, F); a patch that gave them was called the most significant change and was then trimmed, not removed (ref. E) | audit; `abil-test.js` for value |
| S30 | Answer value: hull lost without the right answer vs with it, per threat | ratio >= 2x on every threat, parry included | hard | One right answer per threat is fine, only if it pays | audit: worst threat of `counter-test.js` (hull lost without / with the timed answer; denominator at least 1). `abil-test.js` clear rates are logged in `harness.abilClear` |
| S31 | Weapon spread: worst weapon's median on-screen life at LV10 within 15% of the all-weapon median | <= 15% | guide | | audit: `visible-test.js` with ALL=1, `max |weapon median / all-weapon median - 1|`. Not the stage-1 clear time: that is time-locked (every weapon clears in the same stage time, see section 6) |
| - | Death penalty on power-ups | lose some, not all; a rank system eases the next life | guide | Ref. A strips every power-up and lowers rank; a recovery wave follows. Players call the cycle a trap if the rank cannot keep up | `strategy-test.js`, `choices-test.js` |
| - | Scoring: chain or graze reward with a visible cap | chain doubles per link, 9 links (ref. B); graze gauge (ref. C) | guide | | `ret-test.js` (reward) |
| S29 | Real decisions per minute (a choice with a trade-off) | >= 6 (est.) | guide | | audit, proxy: dash charges spent + EMP uses (`ABIL.stat`) + card picks (`CHO.log`, not `pair`), per game-minute. Bot presses, so an upper bound on a player's choices |

## 5. Fairness, forgiveness, accessibility, onboarding
| Id | Standard | Range | Level | Practice behind it | Measured how |
|---|---|---|---|---|---|
| S23 | First-try stage clear, a competent bot with no oracle (Normal) | 55-90% | hard | A reflex player should clear most stages first try, not 11% | `repeat-audit.js` (firstTryFails) |
| S24 | Hull hits per stage, competent non-god bot | 3-8 (est.) | guide | | audit: non-god runs on stages 3, 8, 20 (quick: 3); a hull drop (`P.hp` falls) is one contact; dash, invuln and god mode excluded; mean per run |
| S28 | Assist options (game speed, hit tolerance, auto-aim, extra dashes, ...) | >= 3 | guide | Ref. D ships slow-down, extra dashes and invincibility, achievements stay on; its hidden aids are input buffering, grace windows and corner correction | audit (setting keys); `ret-assist-test.js` |
| - | Input forgiveness: buffer or grace window on dash and EMP | present | guide | Ref. D | `timing-test.js` |
| S32 | Time to first kill in a new session | <= 20 s | guide | A one-stick, one-button rhythm game (ref. I) is playable at once; the references teach one idea per fight | audit: `FIRSTKILL` line of `tutorial-test.js` (kill event, from the flight school start; worst of desktop and phone) |
| - | Hint lines per session, no hint more than 3 times | <= 60 | guide | | `repeat-audit.js` |

## 6. Reading the results
- A hard FAIL is a release blocker for the flagged feature, not for the whole game: switch the feature off (flag) as the rules say.
- The audit bot dodges and dashes at a bullet; it is not a skilled player. Numbers that depend on skill (S22, S23, S24) are lower bounds on difficulty.
- S01 is dominated by the shortest-lived kind (`lifeByKind` in the json names it).
- Review the standards once per quarter: each time a source gives a number, replace the (est.) range.

## 7. Audit fixes (measurement only, 20 Oct 2026, head d690123)
- S20 (EMP per minute): the audit bot now presses EMP when 4+ enemy bullets are within 200 px (humanbot.js rule, radius 200). Full run: 2.22/min, now above the 0.3-1.5 band (the bot is too eager). Read as a finding for the bot, not as a game result. Not tuned here.
- S27 (choice points): the audit sets `SH.live` before a story run so a stage end reaches the pit stop (`SH.pit`). Still 0 pit stops in 14.4 game-min of sim, so the pit stop does not fire in the sim even with that set. Recorded as SKIP. Card screens are counted per 10 game-min as `cardScreensPer10Min` once a pit fires (needs the choices flag on). Not diagnosed further; the cause is in the stage-end / shop path.
- S30 (ability value): the abil-test "stationary DASH/EMP spam bot" over three runs: with abilities 0% / 0% / 0%, without 0% / 0% / 33%. Median 0% with, 0% without. The gate (S30) itself is the counter-test hull ratio, not this clear rate; its 0.5x FAIL is the noisy edge the S30 note already flagged.
- S31 (weapon spread): per-weapon median on-screen life at LV10 (visible-test ALL=1), the spread is worst weapon vs median of all weapons. Table (median s, all = 3.08): storm 3.90 (worst, +27%), mine 3.45, arc 3.43, orbit 3.42, rail 3.38, drone 3.38, frost 3.37, flame 3.23, well 3.23, beat 3.07, laser 3.03, wave 2.97, disc 2.92, swarm 2.90, shell 2.73, pulse 2.68. FAIL 0.27 against the 15% target.
- The audit bot's storm and mine runs make the largest gap; use the table to pick which weapon to tune first.
