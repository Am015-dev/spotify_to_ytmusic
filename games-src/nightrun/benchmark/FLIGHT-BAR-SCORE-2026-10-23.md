# Flight bar score: story stage 1 (W174, 23 Oct 2026, review only, no game code changed)

Build: live `games/mainhattan-nightrun` at f874ba5 (`RET.stage1fun` ON, Normal). All numbers come from stepped sim (`qa/simhunt.js`,
`__mnr.step`, 390x763 phone), 50 seeds per bot, 350 runs in all, about 8 min real time. Screens: benchmark/flight/ (compared, not retaken).

Bots (scratch probe = simhunt.js plus a recorder, not committed; rebuild it from the notes under the table):
- **human**: simhunt's human-model bot (dodges, fires on the beat, never chases pickups, fires an EMP when 4+ bullets are within 150 px).
- **parked**: never moves, fires on the beat.
- **drift**: parked bot on a slow sine path (the "hold fire, drift" mindless player), hull refilled so every wave gets measured.
- **human-imm**: human bot with hull refilled (hits per wave counted, 50/50 reach the boss).
- **greedy**: human bot that flies to the nearest medal (shard) when no bullet is within 55 px.
- **emp-peak**: human bot that cannot use EMP before bar 37 (FINAL PUSH).

## The table (16 rows)

| # | Gate | Measured | Result | Lives in parts/ |
|---|---|---|---|---|
| W1 | per wave: smart bot loses less hull than the drift bot | hits/run over the stage: smart 4.0, drift 12.0. Per group: smart lower in 17 of 20; **not** lower at bar 1 (0.02 vs 0), bar 7 first shooter (0.18 vs 0.14), bar 17 (0 vs 0) | FAIL (3/20) | `waves/stage1fun.js` S1F.T |
| W2 | >= 6 enemy kinds, 0 triple repeats | kinds: drone, charger, turret, gunship, mini-boss = **5** (the gold courier is a recoloured drone). Triple repeats: 0 | FAIL (kinds) | `waves/stage1fun.js` S1F.T; kinds in `enemies/alive.js` |
| W3 | seeded waves identical run to run | the bar + type order is the same in 49/50 runs (the 50th differs by one late spawn); positions within one 20 px bucket | PASS | `waves/slice.js` SL.beat, `stage1fun.js` |
| W4 | >= 30% of waves have 2+ fire sources | 38% of 1.5 s windows with fire have 2+ shooters (by script: 6 of 19 groups) | PASS | `waves/stage1fun.js` S1F.T |
| P1 | a breather after every peak | peaks (most hits per group): bar 5, 13, 43, boss. After 5 comes bar 7 (lighter), after 13 the bars 15-17 rest (0 hits), after 43 the bars 44-46 gap. The 21-31 run has no breather, but no group there is a peak | PASS | `stage1fun.js` S1F.T, CAPS/CDS |
| P2 | >= 1 mid-stage set piece | **0**: tanks at bars 13/27 are ordinary foes; BOUNTY and SWARM are announcements over normal groups | FAIL | none (would go in `stage1fun.js`) |
| P3 | warning + 2-3 phases visible | "WARNUNG" banner the frame the boss spawns off-screen (x = W+120), so about 1-2 s of warning and no lead-in; PHASE 2 and FINAL PHASE banners: 3 phases seen in 100% of boss fights (human-imm 50/50). Patterns: fan5 + ring only | PASS (weak warning) | `core/b.js` spawnBoss 176-183, bossBeat 258-260; `story/story.js` 150 |
| P4 | 2-3 min; median gap <= 4 s; no empty screen > 5 s | 150 s with the boss (boss ~28 s). Median gap between dangerous moments 3.4-3.5 s, but ~10 gaps of over 5 s per run (p90 gap 10.5 s); screen empty > 5 s in 4-8 of 50 human runs (max 7.1 s) | FAIL (empty) | `stage1fun.js` S1F.T (bars 15-17, 30, 44-46) |
| R1 | top bot score >= 2x safe bot score | median score: greedy 150 k, human (safe) 84 k = **1.79x**. Greedy takes the same hits (4.0/run) and clears as often (36 vs 38/50): chasing medals costs nothing, so it is reward without risk | FAIL | `core/b.js` kill 210, shard pickup 414; `core/h.js` 23 |
| R2 | safe bot loses >= 30% of medals | human bot loses 40% (2499 of 6274), drift 48%, greedy 2% | PASS | `core/b.js` kill 210-215 (drops), 414 |
| R3 | multiplier visible; breaks on hit | breaks: yes (`hurt` halves G.mult and drops a combo tier). Visible: **no**: the default HUD Minimal shows score, hull, boss bar, DASH, EMP, pause; the x-multiplier and combo only in HUD Full. Benchmark screens: score only | FAIL | `core/b.js` hurt 230-231; `hud/c.js` 72-75; `render/diet.js` 12 |
| R4 | EMP-at-peak bot beats EMP-early bot | clear: emp-peak 34/50, early (human) 38/50. EMP is not a scarce resource: the meter refills it, human bot fires a median **5 EMPs per run**, first at bar 2.5 | FAIL | `powers/abilities.js` gain 48-49; `stage1fun.js` runStart (1 charge) |
| F1 | enemy bullets read on 3 backdrops | stage 1 has one backdrop; bullets are dark rim + bright lime orb + white core by construction. In the screens the cyan medal diamonds look like bullets | PASS (by code) | `fx/fx.js` bullets 23-29 |
| F2 | 100% of kills: flash, explosion, popup | every `kill()` does burst + white burst + score floater + boom sfx (100% by code); the mini-boss's break-apart not verified | PASS | `core/b.js` kill 210-211 |
| F3 | 0 unexplained deaths | human: 0 of 12-15 deaths per 50 runs. Parked: **8 of 50** deaths with no bullet or body within 60 px (the anti-idle static discharge) | FAIL | `core/h.js` 20-25 (STILL) |
| F4 | backdrop mean luminance in range | mean luma of the 4 benchmark screens: PC 23.0 / 23.6, phone 28.0 / 29.6 of 255; 92-93% (PC) and 76-78% (phone) of pixels darker than 40 | FAIL | `render/bg.js` bgFor 19, bgpFor 44 |

**7 PASS / 9 FAIL.** Other numbers: human clear 74-76% (37/50 and 38/50, deaths in the peak bars 37-48), parked dies at a median 15.5 s,
bounty taken in 50/50 runs (the bot shoots the courier as it passes, so the "risk" is never taken), grazes per run median 22.

## Player-equivalent score: 13/100 (players: 10-12)

| Category | Score | Why (evidence, not fixes) |
|---|---|---|
| Fun (decisions) | 2/20 | No decision bites: the BOUNTY is taken for free (50/50), EMP refills (5 per run), medals carry no risk (greedy = same hits). Every 10 s the player still only dodges. |
| Tension / pacing | 4/20 | Better than before: median danger gap 7.6 -> 3.5 s and a boss (W160 numbers), but ~10 dead gaps over 5 s per run and no set piece. +1 over the players. |
| Fairness / clarity | 3/20 | Deaths readable for a moving player; the multiplier, which drives the score, is hidden; medals look like bullets. |
| Looks | 2/20 | Mean luma 23-30/255; PC is a dark purple wall (F4). |
| Sound | 2/20 | Not measured here; stays at the players' level. |

The bots prove the stage runs, rises and ends with a 3-phase boss; only a player can say if it is fun. Nothing above moved the players' view of
"boring" except pacing, hence +1.

## The 5 biggest gaps as worker tasks (fun first; each one deliverable, flag OFF by default, 30 min)

Common to all: read WORKER-RULES.md; code in `parts/waves/stage1fun.js` unless named; gate with the scratch-probe method below, 50 seeds per
bot, stepped; push to `nr/<Wxx>`; flag off (`?flagname=1` turns it on) until the owner plays it.

1. **W175 RISK MEDALS (Sonnet). R1 + R4, "chase the medal or stay safe".** File: `stage1fun.js` new block hooking the shard pickup
   (`core/b.js:414` via `NR.on`, do not edit b.js) and `powers/abilities.js` gain. Change: medals (shards) are worth x3 when picked up within
   1.5 s of spawning (near the kill, i.e. in the fire), worth x1 later; on Stage 1 the EMP meter does not refill (1 charge for the whole stage,
   the SWARM decision becomes real). Flag `RET.s1risk` OFF. Gate: greedy median score >= 2.0x human median AND greedy takes more hits than
   human (risk exists); emp-peak clear rate >= early clear rate + 10 points (or EMP uses/run == 1).
2. **W176 MID SET PIECE (Opus, design). P2 + W2, "which plate first".** File: `stage1fun.js` S1F.T bars 21-27 + one new spawner in the same
   file. Change: replace the 21-27 groups with a big carrier that crosses slowly (3 breakable gun plates, each with its own fire pattern, the
   core opens when two are down; plates drop medals). It is the 6th enemy kind. Flag `RET.s1carrier` OFF. Gate: >= 6 kinds; carrier fight
   10-20 s; smart bot (human-imm) hits in bars 21-30 < drift bot hits; 0 new simhunt severe findings.
3. **W177 BOUNTY WITH TEETH (Sonnet). W1 + fun, "fly into the fans or not".** File: `stage1fun.js` bar 18 group + the courier rule. Change:
   the courier only pays when collected by touch (a gold pickup it drops when shot, sitting between the two guns for 3 s), not by shooting it
   on the way; first-shooter wave (bar 7) gets a second gun from the other side so drifting there costs hull. Flag `RET.s1bounty` OFF.
   Gate: bounty taken by the human bot < 50% and by greedy > 70%; per-group hits smart < drift in 20/20 groups.
4. **W178 SHOW THE MULTIPLIER (Sonnet). R3, "keep the chain or play safe".** File: `hud/c.js` minimal HUD draw (72-75) for flight only.
   Change: in HUD Minimal show the multiplier big next to the score (x2.4 style, captioned "SCORE x" the first time), flash red and say
   "CHAIN BROKEN" when a hit halves it. Flag `RET.multhud` OFF. Gate: ui-audit.spec.js passes; simhunt 0 new text-overlap; phone + PC shot
   of one frame compared with benchmark/flight/ (only this screen retaken).
5. **W179 NO DEAD AIR + BOSS LEAD-IN (Haiku, data-table edits). P4 + P3.** File: `stage1fun.js` S1F.T and LEAD. Change: add one light group
   (2 popcorn) inside each gap that the probe shows over 5 s (bars ~15-16, 30, 44-46: keep each breather at 2-4 s, not 0), and a 1-bar
   "WARNUNG" sweep (banner + siren) at bar LEAD-1 before spawnBoss. Flag `RET.s1gaps` OFF. Gate: runs with empty screen > 5 s = 0/50 and
   gaps > 5 s per run <= 3; a breather of 2-4 s still after bars 13 and 43; warning >= 2 s before the boss enters.

Not in the top 5 (polish, later): F4 brighter PC backdrop (`render/bg.js`, Sonnet), F3 explain the static discharge on screen
(`core/h.js` STILL, Haiku: a visible beam/caption before it hurts), F1 medals recoloured away from bullet colours.

## How it was measured (to repeat)
- Baseline: `STAGES=1-1 SEEDS=50 ENDLESS=0 PAR=6 JSON=x.json node qa/simhunt.js` (human + parked, 73 s, 1 severe = 8 unexplained parked deaths).
- Probe: a copy of simhunt.js with an extra recorder at the top of `window.__rec`: hull drops tagged with `G.dbar`; each new enemy's type and
  bar (fingerprint); each new enemy bullet assigned to the nearest foe within 60 px, distinct sources per 1.5 s window; every shard in `G.pk`
  tracked, "got" if it vanished within 90 px of the ship, else "lost"; `G.boss.ph` values seen. Variants via `VAR=` (imm: hull refilled;
  drift: `touchTo(200+70 sin .5t, 270+160 sin .37t)` with the parked bot; greedy: `touchTo` the nearest shard within 260 px when no bullet
  within 55 px; emppeak: EMP charges held until bar 37). Luma: PIL mean of benchmark/flight/*.webp.
