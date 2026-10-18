# Nightrun strict second review (18 Oct 2026)

Why a second review: the owner played the game and said: "Game is extremely repetitive. I doubt it is 58/100."
The first review (`REVIEW-2026-10-18.md`, 59.9/100) was too generous, for these reasons:
- its three reviewers only saw screenshots;
- its anchors were soft (5 = a shipped hobby game);
- content was counted as numbers (45 stages, 120 fusions, 16 weapons) instead of felt variety;
- menus, UI and performance carried a lot of the weight.

This review measures repetition first, with a bot that plays whole sessions, and then scores on a hard scale. No game code was changed.

## Headline
**HEADLINE 39.0 / 100**: the mean of the two harshest reviewers, each reviewer's score being the mean of their first-30-minutes and hour-3 scores.
- First 30 minutes: 45.3.
- Hour 3: 32.8.

The first review said 59.9, and the owner was right. The game is about average for its genre for half an hour (4-5 on most lines). From then on it repeats one loop, and by hour 3 it scores like a below-average store game (2-3 on variety, bosses and pacing).

## 1. Repetition audit (measured)
Script: `games-src/nightrun/repeat-audit.js`. Raw summary: `games-src/nightrun/review/repeat-audit.json`.
To reproduce: `NODE_PATH=$(npm root -g) node games-src/nightrun/repeat-audit.js` (about 2.5 min real time; `FRAMES=<dir>` also saves fight frames).

How it was run:
- The real page runs with stepped time (`?sim=1`).
- The bot is story-sim's dodge grid: about 50 ms reaction, fire taps 40% on the beat, a dash on the DROP downbeat, and an EMP when swamped.
- Story sessions play stages 1-45 in a row. A failed stage is retried once, then finished in god mode so its content is still logged.
- Endless runs 30 min in god mode. "endless-natural" is Endless until the bot dies.

What it logs, every time it happens:
- director wave, zoo wave, enemy spawn and bullet source;
- boss or mini-boss, the attack verb in use per phase, and phase changes;
- set piece, laser fence and DROP;
- pickups, mutators, song, district, hints and banners.

An **encounter** is a wave, zoo wave, set piece, fence, DROP, boss verb or boss.

### Summary per session
| Session | Game-min | Encounters/min | Distinct encounter types | **Repeat within 5 min** | Jaccard, consecutive stages (median) | Stages with 0 new things | New things: first 30 min / after | Last new thing (min) | Longest gap with nothing new (min) | Plain-loop share | Boss share | Fights / distinct boss kits | Songs |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| arcade-easy | 128.3 | 20.1 | 43 | **95%** | 0.61 | 18 | 57 / 30 | 110 | 17.8 | 60% | 9% | 10 / 8 | 10 |
| arcade-normal | 129.1 | 20.8 | 43 | **96%** | 0.63 | 15 | 59 / 28 | 109 | 19.9 | 60% | 10% | 10 / 9 | 11 |
| classic-normal | 165 | 20.7 | 43 | **96%** | 0.67 | 17 | 55 / 32 | 143 | 21.7 | 58% | 10% | 12 / 9 | 11 |
| arcade-hard | 192.8 | 23.9 | 43 | **97%** | 0.72 | 19 | 58 / 29 | 172 | 30.1 | 69% | 13% | 20 / 15 | 11 |
| endless-normal | 30 | 18.5 | 48 | **83%** | - | - | 97 / 0 | 29 | 3.6 | 26% | 69% | 17 / 8 | 9 |
| endless-hard | 30 | 36.8 | 47 | **92%** | - | - | 96 / 0 | 29 | 3.7 | 23% | 74% | 14 / 8 | 8 |
| endless-natural | 6.4 | 17.1 | 31 | **72%** | - | - | 57 / 0 | 5 | 1.2 | 22% | 71% | 4 / 4 | 4 |

Definitions:
- **Plain loop**: no boss, no set piece, no fence and no DROP window. Only waves.
- **Boss kit**: the set of attack verbs a boss uses.
- **Bot first-try failures** out of 45 stages: Easy 3, Normal 3, Classic 4, Hard 26. Normal is flat for a player who dodges, and Hard is a wall.
- **endless-natural**: the bot died at minute 6.4 of normal Endless.

### (a) Distinct encounters per 5-minute window (arcade-normal)
| Minute | 0 | 5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50 | 55 | 60 | 75 | 90 | 105 | 120 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Encounter types | 7 | 9 | 14 | 12 | 14 | 13 | 12 | 19 | 21 | 15 | 17 | 23 | 23 | 24 | 17 | 23 | 13 |
| Enemy kinds | 3 | 7 | 8 | 9 | 10 | 14 | 14 | 16 | 17 | 16 | 19 | 20 | 20 | 20 | 16 | 19 | 11 |

The game has 43 encounter types in total. From minute 55 on, every 5-minute window shows 17-25 of them: the whole deck is reshuffled every 5 minutes.

### (b) Novelty curve: new things per stage (arcade-normal)
- **Stages with zero new things: 15 of 45:** 23, 25, 26, 27, 28, 30, 31, 36, 38, 39, 41, 42, 43, 44, 45.
- **Stages whose only new thing is a boss name or one formation: 8:** 29, 32, 33, 37, 40, and 12, 15 (one bullet source each).

| Stages | New things per stage (pickup kinds excluded) |
|---|---|
| 1-8 | 10 · 0 · 7 · 6 · 9 · 2 · 4 · 6 |
| 9-16 | 4 · 0 · 5 · 0 · 3 · 2 · 1 · 2 |
| 17-24 | 4 · 2 · 3 · 2 · 1 · 2 · 0 · 4 |
| 25-32 | 0 · 0 · 0 · 0 · 1 · 0 · 0 · 1 |
| 33-40 | 1 · 2 · 2 · 0 · 1 · 0 · 0 · 1 |
| 41-45 (challenges) | 0 · 0 · 0 · 0 · 0 |

### (c) Repetition ratio
- **96%** of all encounters (arcade-normal, 2,690 of them) repeat one seen in the previous 5 game-minutes.
- The other sessions: Classic 96%, Easy 95%, Hard 97%, Endless 83% (Endless 92% on Hard).

The three most repeated encounters (arcade-normal, 129 min):
1. **Turret wave**: 305 times (11.3%), one every 25 s.
2. **Drone sine line**: 299 times (11.1%).
3. **Drone straight line**: 241 times (9.0%).

Next come chargers 209, drone V 206, **DROP 190**, **WEAVE set piece 166** and **LASER FENCE 141**.
The "fun layer" (fun.js) is itself the most repeated content: DROP, WEAVE and FENCE fire 497 times, a special event every 11 s (median).

### (d) Jaccard similarity between consecutive stages (enemies, waves, boss verbs and bullet sources)
- Median: Easy 0.61, Normal 0.63, Classic 0.67, Hard 0.72.
- From stage 18 on, 15 of the 28 stage pairs are ≥ 0.7.
- The highest are stage 10 (0.95, vs stage 9), 28 (0.87), 31 (0.85), 23, 26 and 39 (0.84).

A stage is two-thirds the same as the one before it, and the stage name and the music are often the only difference.

### (e) Boss reuse
- **Attack verbs in the whole game: 7:** fan5, fan7, fan9, ring, spiral, laser and summon.
  - fan5, fan7 and fan9 are one aimed fan in three sizes, so there are really **5 verbs**.
- **Every boss and mini-boss is a subset of them.**
  - arcade-normal: 10 fights, 9 distinct verb kits.
  - KRONOS and TALOS are the same kit: fan7, fan9, laser, ring, spiral, summon.
  - MESSE-WÄCHTER and BRÜCKEN-WÄCHTER differ by one verb. So do TRESOR-WART and SCHRANKEN-WART.
- **All of them share the same rules** (armour.js): 3 HP phases, a damage cap, a lane beam in phase 3, and an 8-beat "exposed" last stand.
  - Phases change the order of the verbs and the fan size, not the verbs themselves.
- **In mechanics, the game has about 5 boss behaviours across 10 story fights and 17 Endless fights in 30 min.**
  - In Endless, HOPLITE comes 5 times and BRÜCKEN-WÄCHTER 3 times in 30 min.
  - The three mini-bosses rotate every ~50 s of district time.
- **Bullets:** drones fire 63% of all enemy bullets (elite 3-fan 44.5% + single aimed 18.6%). All boss verbs together are 18%.

### (f) The same verb loop
The player's verbs never change in the whole game: move, auto-fire, beat-tap, dash. Only the meta screens add decisions.
- **Plain loop**: 60% of story time is waves only, 69% on Hard.
- Special events (set piece, fence, DROP, boss) come every 11 s (median), but they are the same three events every time.
- **Longest stretch in which nothing new appears:**
  - arcade-normal: **19.9 min**, minutes 89-109, stages 33-40;
  - classic: **21.7 min**;
  - Hard: **30.1 min**.
- **After the last new boss (minute 109), nothing new appears for the rest of the session.** The 5 challenge stages add rules (no-hit, speed, perfect) but no content.

### (g) Music, backgrounds, sprites, power-ups
**Music:** 11 tracks in 129 min (5.1 per hour, counting the 3 boss tracks).
- Four stage tracks carry 85 of 129 minutes: stage2 27.2, stage3 26.1, athina 16.3, stage1 15.8 min.
- The Story assigns only 3 songs to the 32 Frankfurt stages and 2 to the 8 Athens stages (`parts/story.js:78`).
- Song sections never change the rules. The density follows the loudness (dir.js), so a song plays louder or quieter, never differently.

**Backgrounds:** 5 districts, each about 25 minutes long (8 stages × 2.5-3 min). The same backdrop runs for 25 minutes.

**Sprites:**
- The drone sprite is 59.5% of the 9,000+ spawns, and the top 3 sprites are 77%.
- Each of the 8 zoo kinds is ≤ 1.5% of spawns.
- The 3 ground units are 5% together.

**Pickups:** 402 weapon-ups, 144 EMP and 61 hull. 18 power-up kinds, each 5-39 times.
- Each power-up tip is shown again at every pickup. "WINGS: two drones shoot the off-beats" was shown 182 times.

**Hints in one session:**
| Hint | Times |
|---|---|
| DROP COMING: DASH ON THE DOWNBEAT | 190 |
| WEAVE: shoot on the beat | 166 |
| LASER FENCE: find the gap | 141 |
| SET PIECE | 115 |
| SHOOT THE CAGE | 64 |

### (h) A median player's first 30 minutes: what is genuinely new, and when (arcade-normal, Normal)
| Min | New | Kind of new |
|---|---|---|
| 0.0 | drones, elite drones | shape |
| 0.1 | WEAVE set piece | event (the same every ~33 s from now on) |
| 0.4 | LASER FENCE | **rule** (a gap in a laser grid) |
| 0.7 | DROP: dash on the downbeat | **rule** (the game's one rhythm decision) |
| 4.9 | turret | shape |
| 5.3-9.0 | ground tank, ground turret, ground walker | shape |
| 7.6 | shielder (hit from the side) | **rule** |
| 11.9 | first mini-boss: laser, fan, ring | **rule** (laser telegraph) |
| 12.9 | kamikaze (dodge the dive) | rule (mild) |
| 16.6 | turret-line set piece | shape |
| 19.9 | first boss: summon, fan9 | shape (a boss made of known verbs) |
| 22.1 | splitter | rule (mild) |
| 26.3 | swarm, swarm set piece | shape |
| 26.8 | bomber (leave the red rings) | **rule** |
| 30-60 | spiral (35.6), sniper (36.7), healer (43.4), gate (47.2), carrier (49.5), minelayer (57.5) | 2 rules (sniper line, healer priority) |
| 60-129 | 3 boss names, 2 mini-boss names, phalanx/pillars/wedge formations | no new rule |

That makes 6 genuinely new rules in the first 30 minutes, 2 in the next 30, and **0 in the 70 after that**.
- The game shows its whole decision vocabulary (dodge, fence gap, DROP dash, side-hit, laser telegraph) within 12 minutes.
- Everything after that is new paint on the same five answers.

### Caveats (what the bot cannot see)
- It does not feel hit-stop or sound, and it does not read hints.
- Endless boss share (~70%) is high because god mode lets fights run against the armour damage cap. In story the boss share is 10%.
- The "Dash on the pulse" hint repeats only because the bot never sets the tutorial flag.
- Pit-stop offers were not logged: `pitStart` did not fire in sim mode.

## 2. Strict panel
Four separate reviewers, each on the build-tier model. Each got the audit digest, 24 tour screenshots (390×763) and 6 eight-frame fight sequences (1 s apart).
They were given a hostile mandate and the calibrated scale: 3 = hobby prototype, 4 = below the genre average, 5 = genre average, 6 = decent, 7 = commercially viable. Content counts earned nothing.

Lines and weights (new, fixing the old weighting):

| Line | Weight |
|---|---|
| Core feel | 14 |
| Encounter variety and repetition | 16 |
| Boss design | 8 |
| Difficulty, fairness and pacing | 10 |
| Build depth that changes play | 8 |
| Music and beat integration | 8 |
| Visual readability | 8 |
| Audio | 4 |
| Onboarding | 6 |
| Progression and retention | 8 |
| On-foot mode | 3 |
| Touch and mobile | 5 |
| Polish and trust | 2 |
| **Total** | **100** |

Nothing was adjusted. Audio is capped at 5, because nobody could listen.

### Scores per reviewer (0-10 per line; weighted /100)
Personas:
- **V**: a hardcore bullet-hell veteran.
- **R**: a rhythm-game player.
- **M**: a mobile design critic who judges retention.
- **P**: an adversarial producer deciding whether to fund.

The first number is the first 30 minutes, the second is hour 3.

| # | Line | Weight | V | R | M | P | Mean 30 min | Mean hour 3 | First review |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Core moment-to-moment feel | 14 | 5 / 4 | 5 / 4 | 6 / 5 | 6 / 5 | 5.5 | 4.5 | 5.7 |
| 2 | Encounter variety / repetition | 16 | 4 / 2 | 4 / 2 | 4 / 2 | 4 / 2 | **4.0** | **2.0** | 5.7 (enemy/boss) and 7.7 (content) |
| 3 | Boss design | 8 | 4 / 2 | 4 / 3 | 4 / 3 | 4 / 2 | 4.0 | 2.5 | (in 5.7) |
| 4 | Difficulty / fairness / pacing | 10 | 4 / 2 | 5 / 4 | 5 / 3 | 5 / 3 | 4.8 | 3.0 | 5.3 |
| 5 | Build depth that changes play | 8 | 4 / 3 | 4 / 3 | 4 / 3 | 4 / 3 | 4.0 | 3.0 | 7.7 |
| 6 | Music / beat integration | 8 | 5 / 3 | 5 / 3 | 5 / 4 | 6 / 4 | 5.3 | 3.5 | 6.3 |
| 7 | Visual readability | 8 | 4 / 3 | 5 / 5 | 5 / 4 | 5 / 4 | 4.8 | 4.0 | 5.3 |
| 8 | Audio (data only, capped at 5) | 4 | 4 / 3 | 3 / 2 | 3 / 2 | 4 / 3 | 3.5 | 2.5 | 5.0 |
| 9 | Onboarding | 6 | 5 / 5 | 5 / 5 | 5 / 5 | 5 / 5 | 5.0 | 5.0 | 5.0 |
| 10 | Progression / retention | 8 | 5 / 3 | 5 / 3 | 5 / 3 | 5 / 3 | 5.0 | 3.0 | 7.7 |
| 11 | On-foot mode | 3 | 4 / 3 | 4 / 3 | 4 / 3 | 3 / 3 | 3.8 | 3.0 | 4.7 |
| 12 | Touch / mobile | 5 | 5 / 5 | 6 / 6 | 6 / 6 | 5 / 5 | 5.5 | 5.5 | 5.0 |
| 13 | Polish / trust | 2 | 5 / 4 | 5 / 5 | 5 / 5 | 4 / 4 | 4.8 | 4.5 | 5.7 |
| | **Weighted, first 30 min** | 100 | **44.3** | **46.2** | **47.6** | **47.8** | **46.5** | | |
| | **Weighted, hour 3** | | **30.4** | **35.1** | **35.5** | **34.4** | | **33.9** | |
| | **Reviewer score (mean of the two)** | | **37.3** | **40.7** | **41.5** | **41.1** | panel mean **40.2** | | **59.9** |

- **Lowest reviewer:** V, 37.3.
- **Headline:** the mean of the two harshest, V and R, is **39.0**.
- **No reviewer would keep playing after 30 minutes, and the producer would not fund it.**
- What would change the producer's decision: a measured re-run of this audit in which, after minute 60:
  - at least 40 new things appear per 30 minutes;
  - the plain-loop share is under 35%;
  - there are at least 6 boss kits, sharing no more than 2 verbs each.

All four reviewers named the same three problems:
1. **One loop on repeat.**
   - Drones are 59.5% of spawns, and 96% of encounters repeat within 5 minutes.
   - WEAVE, FENCE and DROP come every ~11 s, each with the same hint text, about 190 times.
   - The fun layer has become the repetition.
2. **Bosses are skins of one kit.**
   - There are 7 verbs, and 3 of them are one fan.
   - Every boss has the same armour, the same phase-3 beam and the same last stand. KRONOS and TALOS are identical.
   - In the frames, the boss is often a dark silhouette with a few pink dots.
3. **No curve.**
   - Normal: 3 first-try failures in 45 stages. Hard: 26.
   - Nothing new appears after minute ~58 except boss names. Stages 41-45 have 0 new things.

Smaller readability notes from the frames:
- An achievement toast and the WARNUNG banner cover the top 40% of the phone screen during fights (st21, st32, st40, endless).
- Late bullets are small, dark-pink dots on a dark backdrop.

### Why the score dropped from 59.9 to 39.0 (-20.9; the parts overlap, so they are rounded)
| Change | Effect | Why |
|---|---|---|
| Content no longer earns points (depth 7.7, content 7.7, progression 7.7 before) | about -7 | 16 weapons and 120 fusions do not change how any encounter is answered: the same move, auto-fire, beat-tap and dash. The audit found no decision that builds alter. Progression is now judged on what is new to do, and that stops at about minute 58. |
| A variety line weighted 16, measured instead of seen | about -4 | 96% repeat within 5 min, consecutive stages 0.63 Jaccard, 15 of 45 stages with nothing new, a 20-30 min longest drought. The first review had no measurement and scored 5.7. |
| Hour 3 is scored separately | about -5 | Every line that depends on novelty (variety, bosses, pacing, music, progression) falls 1.5-2 points by hour 3. The first review only judged the first minutes. |
| Bosses scored on their own line (8) | about -1 | 5 real verbs, the same armour rules, identical kits (KRONOS = TALOS). |
| Stricter anchors (5 = genre average, not hobby) | about -2 | A line that was a "shipped hobby game" 5 is now a 4, below the genre average. |
| Hygiene lines dropped (performance 8.0, accessibility 6.7 before) | about -1 | 59 fps and the PWA are expected, not a feature. Polish now weighs 2. |
| Music now judged on what it changes | about -1 | The beat events are real, but identical in every song. 4 tracks carry 66% of the time. |

## 3. Benchmarks, strict
These benchmarks were re-chosen for a strict comparison, and one acclaimed "variety standard" (F) was added. Real names and sources are in the report message only, not in the repo.
- Every score is an **estimate from public information** (review aggregates, published counts of bosses, stages and levels), not from play.
- They use the same scale and the same 13 weights.
- On-foot is n/a for all but D, and n/a lines drop out.

| Line (weight) | **Nightrun** (30 min / hour 3) | A: premium mobile vertical shooter | B: rhythm rail shooter | C: roguelite auto-shooter | D: run-and-gun boss rush | E: precision platformer (polish/UX) | F: rhythm "music album" game (variety standard) |
|---|---|---|---|---|---|---|---|
| 1 Feel (14) | 5.5 / 4.5 | 7 | 8 | 8 | 9 | 10 | 7 |
| 2 Variety (16) | 4.0 / 2.0 | 6 | 7 | 6 | 9 | 9 | 10 |
| 3 Bosses (8) | 4.0 / 2.5 | 7 | 8 | 4 | 10 | 7 | 8 |
| 4 Difficulty (10) | 4.8 / 3.0 | 7 | 6 | 7 | 8 | 10 | 6 |
| 5 Build depth (8) | 4.0 / 3.0 | 5 | 3 | 9 | 6 | 3 | 2 |
| 6 Music/beat (8) | 5.3 / 3.5 | 3 | 10 | 3 | 5 | 7 | 10 |
| 7 Readability (8) | 4.8 / 4.0 | 7 | 8 | 5 | 9 | 9 | 8 |
| 8 Audio (4) | 3.5 / 2.5 | 6 | 10 | 6 | 9 | 9 | 10 |
| 9 Onboarding (6) | 5.0 / 5.0 | 7 | 7 | 8 | 6 | 10 | 8 |
| 10 Progression (8) | 5.0 / 3.0 | 7 | 4 | 9 | 6 | 7 | 5 |
| 11 On-foot (3) | 3.8 / 3.0 | n/a | n/a | n/a | 8 | n/a | n/a |
| 12 Touch (5) | 5.5 / 5.5 | 8 | 3 | 8 | 3 | 3 | 7 |
| 13 Polish (2) | 4.8 / 4.5 | 7 | 9 | 7 | 9 | 10 | 9 |
| **Weighted /100** | **46.5 / 33.9 (headline 39.0)** | **63.5** | **68.4** | **66.4** | **76.7** | **80.3** | **74.5** |
| Distinct enemy/boss behaviours, as best known publicly | 5 boss verbs in total; 18 enemy kinds, 63% of bullets from drones; about 0 new rules per hour after hour 1 | 15 campaign stages, a large boss on most stages, each with its own pattern set: about 3-5 new bosses per hour | 5 areas, each ending in a different multi-form boss, in about 1-1.5 h: about 4-5 bosses per hour, a new visual and sound theme per area | Enemies are simple chasers, and the variety comes from builds (a new weapon or evolution every 1-2 min) and stages (one per 30 min); bosses are big enemies | About 19 boss fights, each with 3-4 phases and its own attacks: about 3 bosses (10+ new attack patterns) per hour in a 6-10 h first clear | 8 chapters, each built on its own new mechanic, plus sub-mechanics per screen: about 1-2 new mechanics per hour, every screen a new puzzle | 23 levels in about 1-1.5 h, almost every level a new mechanic (riding, swordfights, driving, rail shooting, bullet-hell, duels): about 15 new mechanics per hour |

We are below every benchmark on every novelty line, by 3 to 8 points by hour 3. The gap comes from felt variety, not from content volume (on which Nightrun leads several benchmarks).
The cheapest lesson comes from F and D: **every level or boss is built around one idea it alone uses.** Nightrun builds every stage and boss from one shared pool.

## 4. Repetition remedy plan
The fixes are ranked by felt variety gained per unit of cost. **Gain** is the expected move on the variety, boss and pacing lines. **Cost**: XS < 2 h, S < half a day, M about 1 day, L 2-3 days.

How every fix is checked: re-run `repeat-audit.js` before and after. The fund condition is:
- repeat within 5 min under 75%;
- consecutive-stage Jaccard under 0.45;
- plain loop under 35%;
- at least 40 new things per 30 min after minute 60;
- at least 6 boss kits that share no more than 2 verbs.

Each worker brief below names the gate that applies to it.

| Rank | Fix | Module(s) and data tables | Gain | Cost | Quick win? |
|---|---|---|---|---|---|
| 1 | Event deck instead of the WEAVE / FENCE / DROP metronome | `parts/fun.js:15-27` (`setPiece`, `bar`) | high | S | yes |
| 2 | Hint diet: each event/power-up hint once per stage, then never | `parts/fun.js:20-26`, `parts/power.js:24`, `parts/powerups.js:36`, `parts/flavor.js:51,79` | medium (felt nagging) | XS | yes |
| 3 | Per-district rosters and drone cap (drones ≤ 35% of spawns, one signature kind per stage) | `parts/dir.js:79-90` (`pickTheme`, `pool`), `parts/zoo.js:15,140` (`pz`, `pick`), `parts/story.js:22` (CITYS waves) | high | S | yes |
| 4 | Stage rules: one rule-changing modifier per story stage (the MUTS exist, but only in Endless loop ≥ 1) | `parts/dir.js:17` (MUTS → 14 rules), `parts/dir.js` `begin`, `parts/story.js:22` (a rule column), `parts/story.js:100` (`setLevel`) | very high | M | |
| 5 | Boss moveset library: 12 new verbs, 2 signature verbs per boss, phases change grammar | `parts/b.js:172` (`spawnBoss` tab), `parts/b.js:245-262` (`bossBeat` switch), `parts/paths.js:30` (BPATS), `parts/athens.js:13` (ATAB), `parts/dir.js:19` (MINIS), `parts/armour.js` | very high | L | |
| 6 | Formation library: 20 → 40 formations, per-stage recipes, no-repeat window | `parts/dir.js:124-145` (PATS), `parts/story.js:22` (waves → recipe) | high | M | |
| 7 | Song sections change the rules (verse waves / chorus DROP / bridge dodge-only / outro gauntlet) | `parts/songs.js` (SONGM + section marks), `parts/dir.js:60,79` (phrase → theme), `games-src/nightrun/analysis/song-energy.py` | high | M | |
| 8 | Mid-stage mini-challenges every ~60 s (rescue, chase, no-fire bar, gate run, beat-lock), each with a reward | `parts/flavor.js` (cage/convoy hooks), `parts/fun.js` (deck from fix 1), `parts/hud.js` | medium-high | M | |
| 9 | Route choice on the stage map: 2 branches per city with different rules or rosters | `parts/map.js`, `parts/story.js:22,78` (CITYS order, unlock) | medium | M | |
| 10 | Difficulty curve and music spread: Normal steeper (3 → about 8 first-try fails), Hard flatter (26 → about 14), use all 11 tracks across the 40 stages | `parts/story.js` LV table (line 13), DIFFS `parts/b.js:87`, song choice `parts/story.js:78` | medium | S | yes |

**Quick wins:** 1, 2, 3 and 10. Each is under half a day, and together they take about 2 worker-days.

Expected effect on the audit:
- repeat within 5 min drops from 96% to about 80%;
- plain loop drops from 60% to about 45%;
- the variety line moves from 4/2 to about 5/3.

Fixes 4 and 5 are the ones that change hour 3.

### Worker briefs (paste as is, one worker per brief on the build-tier model; sweep before any deploy)

**V1 Event deck (fun.js)**
1. Today `FUN.setPiece` (`parts/fun.js:15`) cycles weave → fence → weave every 6 bars, and the DROP comes every 16 bars (`bar()`, line 23). In 129 min that is 497 times, a special event every 11 s.
2. Replace it with a per-stage deck of at least 8 event kinds: weave, fence, turret line, swarm, drop, and 3 new ones.
   - Suggested new kinds: a "crossfire" from both edges, a "moving gap wall" and a "beat gate" (pass only on the beat).
3. Each kind may appear at most 2 times per stage and never twice in a row. The deck order is shuffled per stage with `GR()`.
4. The DROP comes only on the song's highest-energy phrase (`songEnergy`), at most 2 per stage.
5. Set the gap between events from the song: 8-12 bars, not a fixed 6.
6. Put the change behind `RET.deck` (`?deck=0` = old).
7. Run `repeat-audit.js`. The gate: `setPieces` counts drop by at least 40% and no kind is above 25% of events.
8. Run `fun-test.js`, `ret-*` and the sweep.

**V2 Hint diet**
1. These hints repeat at every event: DROP 190, WEAVE 166, FENCE 141, SET PIECE 115, "WINGS" 182, "SHOOT THE CAGE" 64 per session (`review/repeat-audit.json` → hints).
2. Show each event hint the first 2 times in a save, then never. Keep a save key `mnr_hintseen`. Files: `parts/fun.js:20,22,26`, `parts/flavor.js:51,79`.
3. Power-up tips at `parts/power.js:24`: show them only the first time each kind is picked up. `powerups.js:36` already does this for PW2.
4. The countdown visual (DROP 4-3-2-1) stays. It is the cue, and text is not needed.
5. Check that `hint-test.js` still passes and that the hint equals the ghost finger.
6. Gate: in `repeat-audit.js`, no hint is shown more than 3 times per session.

**V3 Rosters and drone cap**
1. Drones are 59.5% of spawns and fire 63% of all enemy bullets. The 8 zoo kinds are each ≤ 1.5%.
2. In `parts/dir.js` `pool()` (line 86), add a per-stage roster from the `parts/story.js` CITYS row: one **signature kind**, used in at least 30% of its waves, and a banned list.
3. Cap drone formations (droneLine / droneSine / droneV / snake / eliteV) at 35% of spawns per stage. Fill the rest from the roster.
4. Each stage from stage 9 gets a signature kind that its 2 neighbouring stages do not have: one zoo kind, gunship, gate, mines or swarm.
5. Raise `ZOO.pz` (`parts/zoo.js:15`) to 0.4 for a stage's signature kind.
6. Re-tune with `story-sim.js` (clear rates within ±10% of before).
7. Gate: drone share ≤ 35% and median consecutive-stage Jaccard ≤ 0.5 in `repeat-audit.js`.

**V4 Stage rules (largest gain)**
1. Story stages have no rules today. `DIR.begin` only adds MUTS in Endless loop ≥ 1 (`parts/dir.js:31`, `MUTS` line 17).
2. Extend MUTS to 14 rules. The 6 that exist, plus:
   - REVERSE (enemies enter from the left);
   - DARK (a spotlight around the ship, bullets glow);
   - GRAVITY LANE (a band that pulls the ship);
   - BEAT-ONLY FIRE (shots only on the beat, double damage);
   - NO DASH;
   - NARROW (the playfield shrinks to 70% height);
   - MIRROR (enemy fire mirrored on the beat);
   - SPEED LANES (the scroll changes per phrase).
3. Add a rule column to the CITYS rows (`parts/story.js:22`). Each rule appears in at most 2 stages and every stage from stage 3 gets one.
4. Show it as a 1-line card on stage start (≤ 8 words), with a ghost finger for the first one.
5. Each rule has a test hook (`window.__mnr.MUTS`) and a measured clear rate (`story-sim.js` with `STAGES=`).
6. Behind `RET.rules` (`?rules=0` = old).
7. Gate: `repeat-audit.js` shows "mut" events in at least 30 stages, and no stage has 0 new things.

**V5 Boss moveset library**
1. All 10 bosses and mini-bosses use subsets of 7 verbs (`parts/b.js:253` switch: fan5/7/9, ring, spiral, laser, summon) plus the same armour rules. KRONOS and TALOS are identical.
2. Add 12 verbs to the switch:
   - sweep beam;
   - wall with a moving gap;
   - homing mines;
   - split into 2 clones;
   - bullet curtain from the top;
   - rotating gap ring;
   - charge across the screen;
   - shield order (hit cores in sequence);
   - absorb shots, then release them;
   - on-beat stomp (a shockwave on the downbeat);
   - mirror lasers;
   - arena shrink.
3. Every boss gets 2 signature verbs no other boss uses (BPATS `parts/paths.js:30`, the `spawnBoss` tab at `parts/b.js:172`, ATAB `parts/athens.js:13`, MINIS `parts/dir.js:19`).
4. Phase 2 and phase 3 must each add a verb, not only reorder and resize them.
5. Every verb is telegraphed for at least 1 beat (`e.arm`). Check `boss-check.js`, `boss2-test.js` and the bot's hit causes.
6. Gate: `repeat-audit.js` `distinctBossVerbKits` = fights, and no 2 kits share more than 2 verbs.

**V6 Formation library**
1. The director has 20 formations (`parts/dir.js:124-145`). The top 3 waves (turret 11.3%, droneSine 11.1%, droneLine 9%) are 31% of all encounters.
2. Add 20 formations, for example:
   - helix, staircase, pincer-from-rear, box, spiral-in, zipper, curtain, escort, relay, decoy, column-drop, crossing pairs, rotating cross, wave-on-beat-2-and-4, stagger, mirror-pair, chaser-chain, sniper-nest, mine-lane, shield-wall.
3. Add a no-repeat window: a formation id may not recur within 6 bars.
4. The CITYS waves list becomes a recipe: `[intro, body, peak]` formation sets per stage, with the peak on the loudest phrase.
5. Each formation answers to one verb the player already has (dodge, side-hit, dash, gap). Name it in a comment.
6. Gate: in `repeat-audit.js`, no wave is above 6% of encounters, and 60 or more distinct encounter types per session.

**V7 Song sections change the rules**
1. The density follows the loudness (`DIR.energy`), but a verse and a chorus play the same.
2. In `games-src/nightrun/analysis/song-energy.py`, add section marks (intro / verse / chorus / bridge / outro) to SONGM in `parts/songs.js`.
3. The DIR phrase (`parts/dir.js:60`) maps the section to a theme family:
   - verse: ranks and turrets;
   - chorus: DROP + swarm;
   - bridge: dodge-only (no enemy HP, bullets only, score for grazes);
   - outro: elite gauntlet.
4. Give each section change a 1-bar visual cue (backdrop colour shift), with no text.
5. Gate: in `repeat-audit.js`, the per-5-min mix differs between sections, and per stage at least 3 section themes are seen.

**V8 Mini-challenges every ~60 s**
1. The only interruptions today are the 3 events from V1.
2. Add 6 mini-challenges, each lasting 4-8 bars, with a clear reward (shards, a weapon-up, a hull piece):
   - escort the data sprite;
   - chase a fleeing courier;
   - no-fire bar (dodge only);
   - gate run;
   - beat-lock (hit 4 PERFECTs);
   - kill the leader before it escapes.
3. Hooks: `parts/flavor.js` (cage and convoy already exist), and the V1 deck.
4. Each has a one-line card of ≤ 8 words and a success or fail pop where it happens.
5. Gate: in `repeat-audit.js`, at least 2 challenges per stage, and the plain-loop share is under 45%.

**V9 Route choice**
1. The stage list is linear (`parts/story.js` CITYS).
2. Per city, after the mini-boss, offer 2 branches (`parts/map.js`), each with a different rule (from V4) or roster (from V3) and a visible reward.
3. Both branches lead to the boss. Stars count per branch.
4. Save: `sSave` gets a branch field. Migrate old saves to branch A.
5. Run `ret-*` and `map` tests plus the sweep on the map screen at 390×763 and 375×553.

**V10 Curve and music spread**
1. Bot first-try failures out of 45 stages: Easy 3, Normal 3, Hard 26. That is flat, then a wall.
2. In `parts/story.js:13` LV, make Normal rise faster after stage 16 (+0.35 per stage). Target: the bot fails about 8 stages first try on Normal.
3. Soften Hard: `TUNE.dm.hard.lv` (`parts/story.js:16`) .3 → .15, and DIFFS hard `fan`/`d` in `parts/b.js:87`. Target: about 14 first-try failures.
4. The song choice in `parts/story.js:78` uses only stage1, stage2 and stage3 for 32 stages. Rotate all 7 stage tracks (stage1-3, endless, endless2, athina, athina2) so that no track plays in 2 consecutive stages.
5. Gate: in `repeat-audit.js`, no track is above 15% of minutes, and the bot's first-try failure counts are in the target bands.
