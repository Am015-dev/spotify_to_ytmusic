# Nightrun strict third review (20 Oct 2026)

Build under review: branch head `bea5928` (the built page `games/mainhattan-nightrun/index.html`, built from the same parts).
It includes RET.mustmove, abil, counter, reward, deck, hintdiet, roster, vary, bossmoves and vary2.
**`parts/react.js` (enemy brains, W5) is not merged.** Nothing in this build makes enemies react to the player, so the predictability work is unmeasured and scored as not done.

The owner's complaints: "not fun, below 30/100, predictable enemies, dash and EMP useless, needs to be more strategic and timing".
Method: the same as `REVIEW-STRICT-2026-10-18.md` (39.0): measure first, then score with the same four personas, the same 13 lines and the same weights. No game code was changed.
Raw audit: `review/repeat-audit-3.json`. The old audit, `review/repeat-audit.json`, is kept for comparison.

## Headline
**HEADLINE 43.7 / 100** (it was 39.0, so +4.7). That is the mean of the two harshest reviewers, V 42.4 and R 45.1.
- Panel mean: 45.2.
- First 30 minutes: 49.9 (was 46.5).
- Hour 3: 40.5 (was 33.9).

What improved is measured content variety: repetition, boss kits and plain-loop time.
What did not improve is what the owner complained about:
- the enemies are *more* predictable than before;
- DASH matters now, but only as a panic reflex;
- horizontal positioning, the weapon choice on Normal and EMP timing decide almost nothing.

## 1. Repetition audit (repeat-audit.js, same bot, same configs)
| Metric (arcade-normal unless named) | 18 Oct (39.0) | Now | Fund gate |
|---|---|---|---|
| Repeat within 5 min | 96% | **84%** (classic 86, hard 83, easy 76, endless 65 / hard 85) | < 75%: **missed** |
| Jaccard, consecutive stages (median) | 0.63 | **0.25** (classic 0.27, hard 0.46) | < 0.45: met |
| Plain-loop share | 60% | **37%** (classic 39, hard 41) | < 35%: **missed by 2 points** |
| New things per 30 game-min (pickups excluded), from min 0 | 38 · 17 · 4 · 5 | 98 · 72 · 72 · 58 · 18 · 24 · 17 · 4 | ≥ 40 after min 60: met up to min 120 only |
| New *mechanics* per 30 min | 33 · 15 · 3 · 3 | 53 · 36 · 38 · 30 · 6 · 11 · 7 | |
| Longest gap with no new mechanic | 19.9 min | **28.4 min** (classic 45.6) | |
| Stages with 0 new things | 15 / 45 | 0 / 45 | |
| Drone share of spawns / of enemy bullets | 59.5% / 63% | **31.9% / 41.5%** | ≤ 35% spawns: met |
| Hint lines shown per session | 1,123 (top hint 190) | **39** (no hint more than 3 times) | |
| Boss verbs in total / distinct kits | 7 / 9 of 10 | **49 / 20 kits in 22 fights** | |
| Boss kit size; verbs shared per pair (median / max) | 4-6; 3 / 6 | **8-11; 1 / 3**: 43 of 45 pairs share ≤ 2 | ≥ 6 kits sharing ≤ 2: met |
| Songs (top-4 share of time) | 11 (66%) | 10 (63%) | |

**A new red flag.** The audit bot (the old dodger) now fails 40 of 45 Normal stages on the first try (3 before), and 43 of 45 on Hard. Endless-natural dies at minute 0.9 (6.4 before).
- The only difference from the test bots that clear 100% is one line: they read the must-move column strike from `MM.cost` (an oracle).
- So the strike is the one thing that kills any player who does not read it.
- Fresh single-stage runs confirm it: stage 3 clears, while stages 10 and 20 fail on both tries.
- Session minutes are inflated by these retries (226 game-min instead of 129). Retries replay content that has already been seen, so the novelty numbers above are, if anything, lower than a good player would see.

## 2. Skill expression (Normal, clear rate; bot harnesses from mustmove/abil/counter/reward-test)
| Bot | Stage 3 | Stage 10 | Stage 20 | Source |
|---|---|---|---|---|
| parked (never moves), 8 weapons × 3 heights | 0% | 0% | 0% | mustmove-test |
| hop (48 px every 1.5 s, blind) | 0% | 0% | 0% | mustmove-test |
| tracker (lines up with the nearest foe, no dodge) | 0% | 0% | 0% | mustmove-test |
| dodger (reads the strike), reflex dash when a bullet is within 30 px | 100% | 100% | 78-100% | reward-test, probe |
| bold (hugs enemies) | 100% | 100% | 100% | reward-test (score +26% vs dodge) |
| camper (parked at x=70, tracks height only, reflex dash) | 89-100% | 100% | 89-100% | reward-test, probe |
| the same dodger, **no DASH and no EMP** | 11% | 56% | 22% | probe (3 weapons × 3 runs) |
| the same dodger, DASH and EMP pressed at random (same rate) | 56% | 89% | 44% | probe |
| stationary DASH/EMP spammer | 0% | 0% | 0% (stage 8) | abil-test |

- **Hard, mid build:** dodger 50%, no dash 0%, random 17%, camper 8%.
- **Hard, max build (stages 20 and 30, 16 weapons):** dodger 75%, **camper 78%**.
- **Counter-test, a timed vs random sequence:** 4 vs 11 hull lost.
- **Per threat (hull lost without the answer vs with it):**
  - laser wall dashed through: 7 vs 0;
  - curtain EMP: 5 hits vs 0;
  - warden EMP strip: kill in 4.2 s vs 1.3 s;
  - dash → EMP combo: 110 vs 50 damage;
  - **seeker parry: 4 vs 3. This check FAILS: the parry barely pays.**

**Reading:**
- DASH is no longer useless. Without it, Normal clears drop from 93% to 30%.
- But the winning use is a reflex: dash whenever a bullet is within 30 px. It is not a planned or beat-timed use.
- EMP is pressed about 0.1 times per minute by the best bot. Its value is narrow: curtains and wardens.
- Moving horizontally is worth nothing: the camper equals the dodger on Normal, and beats it on Hard with a max build.

## 3. Predictability (5 seeds, Math.random seeded, stages 3/10/20 Normal, 90 s, god mode, fixed path)
react.js is absent, so this compares `?vary=0&vary2=0` with the default.

| Stage | Spawn-schedule Jaccard across seeds (type × 3 s) | Distinct first-15 spawn orders | Spawns, sd | Fire-interval CV (median per enemy) | Share of enemies whose path turns ≥ 2× |
|---|---|---|---|---|---|
| 3, vary off | 0.14 | 5/5 | 13.7 | n/a | 0.38 |
| 3, **default** | **0.95** | **1/5** | 3.6 | n/a | 0.00 |
| 10, vary off | 0.19 | 5/5 | 16.2 | 0.43 | 0.32 |
| 10, **default** | **0.57** | 5/5 | 3.9 | **0.04** | 0.12 |
| 20, vary off | 0.09 | 5/5 | 15.7 | 0.46 | 0.05 |
| 20, **default** | **0.56** | 5/5 | 5.3 | 0.36 | 0.09 |

**What this means:**
- The variety work made stages different from *each other*, but each stage is now much the same on every replay.
- Stage 3 is the same script on every replay (0.95).
- Stage 10's enemies fire on a metronome (CV 0.04).
- Paths are straighter than before (turning paths: 0.38 → 0.00 on stage 3).

The owner's "predictable enemies" is now *measurably worse* than in the 39.0 build, and nothing reacts to the player.

## 4. Strategy depth
**Decisions per minute** (dodger, Normal, stages 3/10/20):
- 90-px lane changes: about 55 per minute. They are reflex steering.
- DASH: 1.2-8.8 per minute, about 4.5 on average.
- EMP: about 0.1 per minute.
- Counter threats to answer: about 3.7 per minute (9-10 per 2.5-minute stage).
- Pickups: 7.3 per minute, all automatic: there is no choice.
- Pit-stop cards: 0 logged (`pitStart` still does not fire in sim).
- Loadout: one choice before the stage.

Only the threat answers (about 3.7 per minute) and the loadout are real decisions. None of them is a trade-off: each threat has exactly one right answer.

| Threat | Answer | Value of the answer (measured) |
|---|---|---|
| column strike (must-move) | move out of the column | 0% → 100% clear; it is the main killer |
| laser wall | dash through | 7 → 0 hull |
| curtain | EMP | 5 → 0 hits |
| warden (shield) | EMP strip | 4.2 → 1.3 s to kill |
| seeker | parry dash | 4 → 3 hull (weak) |
| packs | dash, then EMP | 2.2× damage |

**Weapons:**
- On Normal with a mid build, every weapon tried clears.
- On Hard stage 30 with a max build, 10 of 16 weapons clear for the dodger.
- **The dominant combination is Well + Swarm at max build:** stage 30 in 163 s with 14 hits, against a median of about 227 s and 28 hits for the field.
- **The max build trivialises positioning:** the camper clears 78% on Hard, against 8% with a mid build.
- Pulse + Swarm dies early (33-46 s) on Hard stage 20 with the dodger: an outlier.

## 5. Panel (same personas, lines and weights as the 39.0 review; first 30 min / hour 3)
| # | Line | W | V | R | M | P | Mean 30 | Mean h3 | 18 Oct |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Core feel | 14 | 5/4.5 | 5.5/4.5 | 6/5 | 6/5 | 5.6 | 4.8 | 5.5/4.5 |
| 2 | Variety / repetition | 16 | 5/4 | 5.5/4 | 5.5/4.5 | 5.5/4.5 | 5.4 | 4.2 | 4.0/2.0 |
| 3 | Bosses | 8 | 5.5/4.5 | 5.5/4.5 | 5.5/5 | 6/5 | 5.6 | 4.8 | 4.0/2.5 |
| 4 | Difficulty / fairness / pacing | 10 | 4/3 | 5/4 | 4.5/3.5 | 5/3.5 | 4.6 | 3.5 | 4.8/3.0 |
| 5 | Build depth | 8 | 4/3 | 4/3 | 4.5/3.5 | 4.5/3.5 | 4.2 | 3.2 | 4.0/3.0 |
| 6 | Music / beat | 8 | 5/3 | 4.5/3 | 5/4 | 5.5/4 | 5.0 | 3.5 | 5.3/3.5 |
| 7 | Readability | 8 | 4/3 | 5/4.5 | 4.5/4 | 5/4 | 4.6 | 3.9 | 4.8/4.0 |
| 8 | Audio (capped at 5) | 4 | 4/3 | 3/2 | 3/2 | 4/3 | 3.5 | 2.5 | 3.5/2.5 |
| 9 | Onboarding | 6 | 5/5 | 5/5 | 4.5/4.5 | 5/5 | 4.9 | 4.9 | 5.0/5.0 |
| 10 | Progression | 8 | 5/3.5 | 5/3.5 | 5/3.5 | 5/3.5 | 5.0 | 3.5 | 5.0/3.0 |
| 11 | On-foot | 3 | 4/3 | 4/3 | 4/3 | 3/3 | 3.8 | 3.0 | 3.8/3.0 |
| 12 | Touch | 5 | 5/5 | 6/6 | 6/6 | 5/5 | 5.5 | 5.5 | 5.5/5.5 |
| 13 | Polish | 2 | 4.5/4 | 5/4.5 | 5/4.5 | 4.5/4 | 4.8 | 4.2 | 4.8/4.5 |
| | **Weighted, 30 min / hour 3** | | 47.0 / 37.7 | 50.1 / 40.1 | 50.4 / 42.0 | 51.9 / 42.1 | 49.9 | 40.5 | 46.5 / 33.9 |
| | **Reviewer score** | | **42.4** | **45.1** | 46.2 | 47.0 | panel 45.2 | | 39.0 headline |

**Why each persona scored as they did:**
- **V (bullet-hell veteran):** "Stages are scripts I can memorise. A fire CV of 0.04 is a metronome. One column strike kills a player who does not read it, and every other dodge is a panic dash. Horizontal movement is pointless."
- **R (rhythm player):** "The dash that wins is the one at a bullet, not the one on the beat. The songs still never change the rules."
- **M (mobile critic):** "Hints are fixed (1,123 → 39) and the stages differ. The hour-3 retention hook is still only Garage numbers, and a max build lets you camp."
- **P (producer):** "Three of the five fund gates are met (Jaccard, novelty after 60, boss kits). Repeat is 84% (gate 75%) and plain loop 37% (gate 35%). I would not fund it yet. I would fund a two-week sprint on enemy reactions and dash timing."

## 6. The five worst remaining problems
1. **Enemies are scripted and predictable.**
   - Replays of a stage match 0.56-0.95, against 0.09-0.19 with vary off. Stage 10 fires with CV 0.04.
   - There is no reaction to the player: react.js is not merged.
2. **The difficulty is one wall, the must-move strike.**
   - A player who does not read it fails 40 of 45 Normal stages. One who does clears 93-100% with 3-6 hits.
   - There is no gradient between the two.
3. **DASH is a reflex, not a decision.**
   - The best rule is "dash when a bullet is within 30 px". Random dashing still clears 63% against 93% for the reflex.
   - EMP is pressed 0.1 times per minute, and the seeker parry pays 1 hull (the check fails).
4. **Positioning and builds do not matter.**
   - The camper equals the dodger (93% vs 93% on Normal), and beats it on Hard with a max build (78% vs 75%).
   - On Normal every weapon clears. Well + Swarm max is about 30% faster and takes half the hits of the median.
5. **Hour-3 repetition is still above the gate.**
   - Repeat within 5 min is 84% (gate 75%), and the plain loop 37% (gate 35%).
   - Novelty collapses after min 120 (18-24 per 30 min, then 4). The longest stretch with no new mechanic is 28-46 min.

## 7. The top five remedies (cheapest first; each with the gate that proves it)
1. **Merge enemy reactions (W5 react.js) behind a flag.**
   - Enemies aim where the player will be, flank a camper, and punish a repeated dodge.
   - Gate: this predictability probe shows spawn-schedule Jaccard across seeds ≤ 0.35, fire CV ≥ 0.25, and the camper's Normal clear below the dodger's by ≥ 25 points.
2. **Make the column strike readable and graded.**
   - It warns on the beat, does partial damage on the first hit, and has 3 tiers by stage.
   - Gate: the audit bot without the oracle clears ≥ 60% on Normal, and the dodger with the oracle ≤ 90% on stage 20.
3. **Make DASH and EMP beat- and window-timed decisions.**
   - Perfect-beat dash = parry plus reflect. An off-beat dash costs a charge.
   - EMP charges come from grazes and stack into a bigger burst, so holding it is a choice.
   - Gate: reflex-dash bot ≤ 70%, beat-timed bot ≥ 90%, random ≤ 40%; the seeker check passes.
4. **Rein in the max build on Hard, and add real choices.**
   - Make Hard scale with permanent levels, and offer pit-stop or pickup *choices* (2 of 3).
   - Gate: Hard camper with max build ≤ 30%; the best weapon within 15% of the median time.
5. **Content tail after min 120.**
   - Add per-replay remixes (mirrored or shuffled set-piece order with a seed) and song-section rules.
   - Gate: repeat within 5 min ≤ 75%, plain loop ≤ 35%, ≥ 30 new things per 30 min after min 120.

## 8. Verdict against the owner's complaints
| Complaint | Status |
|---|---|
| "Predictable enemies" | **Worse** (measured above). |
| "Dash and EMP useless" | **Half fixed.** DASH matters, as a reflex: 93% vs 30% without it. EMP is still marginal. |
| "Needs to be more strategic and timing" | **Not fixed.** About 3.7 real decisions per minute, each with one right answer. Positioning and timing on the beat are not rewarded. |
| "Not fun" | **Partly answered.** The variety jumped (repeat 96 → 84%, Jaccard 0.63 → 0.25, 49 boss verbs), and the headline rose from 39.0 to 43.7. That is still clearly below the genre average (50). |

## 9. Benchmarks (unchanged strict estimates, same lines and weights; names only in the report message)
| | Nightrun now | A | B | C | D | E | F |
|---|---|---|---|---|---|---|---|
| Weighted /100 | **49.9 / 40.5 (headline 43.7)** | 63.5 | 68.4 | 66.4 | 76.7 | 80.3 | 74.5 |

The gap to the nearest benchmark (A) shrank from 24.5 to 19.8 points.

**To reproduce:**
- Audit: `OUT=games-src/nightrun/review/repeat-audit-3.json node games-src/nightrun/repeat-audit.js`.
- The tests: `mustmove-test.js` (with `STAGES=3,10,20`), `reward-test.js` (with `STAGES=3,10,20 RUNS=4 REPORT=1`), `counter-test.js` and `abil-test.js`.
- The predictability and weapon probes were throwaway scratch scripts built on the reward-test bot. They are not committed.
