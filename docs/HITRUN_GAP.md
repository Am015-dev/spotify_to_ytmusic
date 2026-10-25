# Hit & Run gap: why ours feels "sloppy" next to it (design lane hitrun-gap-r25j)

2026-10-25. Alex tonight: "It's not ready yet, not even close to Hit and Run, very sloppy."
This is a plan, not code. It compares the first minutes of both games through scripted touch and key input, on the phone profile.

## How I looked (and what the lab cannot tell)
- **Ours:** `out/rev25` (trunk 29cb86c59 + docs, one commit behind ca219b3; the only later code change is the wall bumper, drivefeel-r25g). Real boot with no `?test`, iPhone UA, 852x393 touch.
  - Script: `docs/shots/hitrun-gap/tools/ours.js.txt`. The fail screen comes from `ours_fail.js.txt`, which uses a `?test=fra` start and calls the game's own `qvFail(ch,'TIME UP')`.
- **Reference:** https://vheissu.github.io/hit-and-run-web/, same profile. Scripts: `tools/ref.js.txt` (NEW GAME path) and `tools/ref2.js.txt` (free drive in a car).
  - The repo has no licence and ships Fox/Radical assets. Its shots are in `docs/shots/hitrun-ref/` (README: internal reference only, never shipped). I used ideas only and read no code.
- **Lab limits (be honest):** this is software GL. Ours ran at 5.5 fps in roam; the reference ran at 1.25 fps in the car and 0.25 fps in its story intro.
  - Every time below is a lab time. Lab times rank the two games against each other; they are not phone times.
  - **Not measured:** frame hitches on a phone, for either game. Ours has its own gate (perf/ios-reveal, still red in fra per REVIEW_2K_22-24). The reference can only be judged on a real iPhone, which is out of scope here.
  - **Not reached in the reference:** a car-vs-car crash. At 1.25 fps the car left the road onto a lawn instead. Its mission fail/retry screen was not reached either; a timer fail takes minutes of game time at 0.25 fps. For those two, I used what its repo docs say (docs/wiki/learn/hit-and-run.md) and marked it so.
- I looked at all 14 shots. Pairs: ours in `docs/shots/hitrun-gap/ours_*.jpg`, reference in `docs/shots/hitrun-ref/*.jpg`.

## The 6 pairs

### 1. First drivable frame
| | Hit & Run web | Ours |
|---|---|---|
| Path | Title "PRESS START" → NEW GAME → "Loading the mission…" → Krusty TV intro (SKIP) → **Homer on foot**: "The Cola Caper / TALK TO MARGE". Free drive (Continue) puts you in the car. | Welcome card "PLAY · Hot Drop" → tap → **a "CHOOSE TRACK" race menu fills the screen** (10 → 50 s lab) → loader "Raising Frankfurt" → driving, gas on |
| Taps to control | 2 (+1 SKIP) for the story, 1 for free drive | **1** |
| Lab time, tap → control | story 30 s plus the intro; free drive 0 s once the level is loaded (it loads before the title: ready at 28-43 s) | **76 s** (the PLAY tap at 4.7 s, control at 81 s) |
| What the frame shows | `1_first_drivable.jpg`: the car on a real street, with a sidewalk, kerb, mailbox, hydrant, lamp posts and driveways | `ours_1_first_drivable.jpg`: **the loader card still covers the screen at "READY 100 %"** while the car already has control |
| Seconds until you know what to do | 0: one 3-word objective sits top centre, and the radar arrow points at it | 0-1: "Hold GAS · steer ◀ ▶" and nothing more, which is fine for free roam |

**Sloppy moments:** (a) the race-track picker shows after "PLAY your first drive". It is the wrong screen, live for ~40 s (lab). (b) Control starts behind the loader. **The reference loads the world behind its title screen, so pressing start is instant.**

### 2. Street with traffic at speed
| | Hit & Run web | Ours |
|---|---|---|
| Speed in the shot | 40 km/h (avg 67, max 99 over 28 samples) | 80 km/h (avg 53, max 112 over 30 samples) |
| Cars visible / near | 1-3 cars visible, far ahead (its documented pool is 5 slots, spawned within 65 m of a point 40 m ahead of the camera) | 75 cars in the city. Within 40 m: avg **0.9**. Within 80 m: avg 7.2. |
| Street | Coherent human scale: 2-lane road, kerb, grass strip, sidewalk, driveways, hydrants, mailboxes, lamp posts, hedges, houses set back. Everything sits on the ground. | Wide road with yellow centre lines and grass verges. **No sidewalk and no kerb** in this shot. Props are scattered at mixed scales (a balloon tree, a bin cart, minifigs on grass). **A floating blue wrench pickup sits in the sky over the road.** A magenta seam runs along a roof edge (left). |
| Feel | Calm, readable, "a place" | Busy but random, "a level made of parts" |

**Honest note:** traffic density is not where Hit & Run wins. Its free-drive street is just as sparse. It wins on **street coherence**: every metre of the roadside is a believable, human-scale object. That gap is the visual half of "sloppy".

### 3. A crash / smash
| | Hit & Run web | Ours |
|---|---|---|
| What happened | Not reached in a car (the car left the road onto a lawn, `3_crash_attempt.jpg`, and +1 coin popped). On foot, Homer walks into a parked Buzz Cola truck and stops against it, solid (`3b_onfoot_bump.jpg`). | Staged nose-in at 40 km/h into the nearest NPC car, 14 m ahead (`ours_3_crash.jpg`) |
| Contact | Per its docs: every car is a rigid body. Impulse, damage from closing speed > 8 m/s, and the Hit & Run meter adds +5 per bump and +25 per smashed car, so cops come at 100. | **Never touched.** Closest 7.5 m; the target drove away at 37 km/h. Our car still lost **40 → 18 km/h** with hp 100 → 100, so we braked against nothing. Same as WHY_NOT_2K gap 3 (4/4 misses on 21 Oct): **not fixed.** |
| Objects that react | Props (hydrants, fences, mailboxes) break, spill coins and stay broken (docs) | Not measurable here, because contact never happened |

**Sloppy moment:** you aim at a car, it slips away, and you slow down anyway. That is the opposite of a car game's promise.

### 4. Mission start
| | Hit & Run web | Ours |
|---|---|---|
| How | Story: walk to a character (TALK TO MARGE). Replay: pause → MISSION SELECT, a list of 8 missions + races (`4_mission_select.jpg`) | Drive into a world marker. The test drove 30 s at a marker 136 m away and **never reached it**, so it started through `chStart` (a player would find it on the map) |
| What you get | One title line + one objective line, top centre, over the live world | A **6-line purple "COACH KAI" card** over the world ("3 stages, about 4.6 km. First: FIND 4 GOLDEN BRICKS IN BANKENVIERTEL (1/3). Twist: A RIVAL DOES THE SAME JOB…"), plus a timer pill, a banner "STUD RUSH: BANKENVIERTEL · 1/3 · ◀ Go · left in 40 m", then a **3.2 s countdown that brakes the car** (`chStep` `ch.cd`) |
| Words to read before driving | 3 | ~40 |

### 5. Mission HUD
| | Hit & Run web | Ours |
|---|---|---|
| Shot | `5_mission_hud.jpg`: "The Cola Caper" + "TALK TO MARGE", coin counter, a radar with a direction arrow; 7 touch buttons + START | `ours_5_mission_hud.jpg`: timer 02:29.0, the banner with the stage and the turn instruction, a minimap, 5 buttons + speed |
| Where to go | Radar arrow + objective word | The text "left in 40 m". **No guide line or arrow is visible on the road in the shot,** even though the card says "Follow the yellow line!" |
| Count | 3 text items | 3 text items: **parity**. Our HUD is now as lean as theirs (WHY_NOT_2K gap 6 is closed). |

### 6. Fail / retry
| | Hit & Run web (docs, not reached in the lab) | Ours |
|---|---|---|
| Screen | Fail message per condition (timeout, lost target, wrecked…). Enter = retry **from the last checkpoint stage**; restart from the start is a second option. | `ours_6_fail_retry.jpg`: "TIME UP · No stars this time · try again", ↺ RETRY / 🔀 NEW ROUTE / ✕ QUIT. Clean and centred. |
| Retry cost | Replays only the failed stage | Retry restarts the **whole 3-stage, 4.6 km run** (1.0 s lab to control) |
| Fail reasons | 6 shared fail records, each with its own message | Mostly TIME UP; no shared condition vocabulary |

Ours is close here. The gap is the checkpoint, not the screen.

### Side finding (not a pair): the mission clock in a lab run
`?test=fra` + `chStart`: `RO.ch.v2.left` stayed at 148.99 after 8 s of gas, while the 3.2 s countdown was still running at lab fps. This is not a bug, but any GO that times a mission must step past `ch.cd` first.

## Ranked gaps (what makes ours feel sloppy, worst first)
Sizes: S = one lane (~40 min), M = 2 lanes, L = design + 2-3 lanes. Model per CLAUDE.md rule 2. Each fix reuses an existing system and ships behind a flag that defaults OFF until its GO passes.

| # | Gap (player words) | Evidence | Fix concept (reuse) | Model / size | GO number to hit |
|---|---|---|---|---|---|
| 1 | **"I can't hit anything: cars slip away and I slow down for nothing."** | Pair 3: 0 contact, 40 → 18 km/h at 7.5 m. WHY_NOT_2K: 4/4 misses. Unchanged for 4 days. | Execute step 1 of PLAN_TRAFFIC_BRAIN: within 25 m of the player, NPC cars keep their lane and speed (switch off the yield `98ayd` and NC evasive offsets there). Contact goes through ONE writer (`99sc_solidcars` + `W10_bump`): an impulse to both, bricks via `CR_smashHit`, and no speed loss without a box overlap. | **OPUS** (traffic core, 4+ modules, and rule 9: it has had its two lanes) / M | GO `hr/hit`: nose-in at 20/40/60 km/h from 14 m, 10 runs each: contact ≤ 1.5 s in ≥ 9/10; our speed loss before contact ≤ 5 %; 0 frames with overlapping boxes |
| 2 | **"The street looks like random parts."** | Pair 2: no sidewalk or kerb, mixed-scale props, a floating wrench in the sky, a roof seam. The reference is a coherent human-scale street. | A "street kit" pass on the Frankfurt core (~1.5 km): kerb + sidewalk strip from the existing street polylines (`hubRoads`), with street furniture placed by rule (lamp every 25 m, a bin/hydrant/sign every 40 m, at human scale `SC_*`). Pickups sit at car height, never above 3 m. Fix the roof seam. Side-by-side shots against `docs/shots/hitrun-ref/2_street_traffic.jpg` and a 2K reference. | **OPUS** plan + **SONNET** build / L | GO `hr/street`: ≥ 90 % of core street length has a kerb + sidewalk; ≥ 6 props per 100 m within 8 m of the kerb; 0 pickups > 3 m above the ground; 0 props outside 0.5-2x human scale |
| 3 | **"I tapped PLAY and got a race-track menu, then a loader over my car."** | Pair 1: CHOOSE TRACK visible 10 → 50 s lab after "PLAY · Hot Drop"; the first control frame is under the loader card. | Hide `#menu` the moment PLAY starts loading; show the loader at once. Give control only after the loader fade ends. Later: load Frankfurt behind the title card, as the reference does. | **SONNET** / S | GO `hr/boot`: from the PLAY tap to control, 0 samples with `#menu` visible; 0 frames with `RO.on && #ld2` visible; real touch path |
| 4 | **"Starting a mission is a wall of text and a wait."** | Pair 4: ~40 words, a 6-line modal, a 3.2 s braking countdown, versus 3 words in the reference. | One objective line (≤ 6 words) in the banner, with the coach line as a 2 s toast that does not cover the road. Keep the countdown only for races; quests start rolling. | **SONNET** / S | GO `hr/mstart`: marker → car ≥ 20 km/h with gas in ≤ 2 s game time; first objective ≤ 6 words; 0 modal cards over 30 % of the screen |
| 5 | **"I don't see where to go."** | Pair 5: "left in 40 m" with no visible guide line, although the card promises one. The test could not reach a marker 136 m away in 30 s. | Draw the existing qv GPS path (`qvPath`) as a yellow on-road ribbon for the next 120 m, plus an arrow over the target; the marker beam is visible from 300 m. | **SONNET** / S | GO `hr/guide`: in a quest, ribbon pixels are visible in front of the car in ≥ 95 % of samples; a bot steering only by the ribbon finishes stage 1 |
| 6 | **"Smashing has no point."** | No consequence layer. The reference makes every hit a choice: heat +5/+25, cops at 100, busted = lose coins, not the mission. | Heat meter on top of the existing smash events: one cruiser from the race AI cars, spawned 100 m **behind** you; busted = −studs, no mission reset; off during missions and races. Design first (hit-and-run.md idea 3). Needs gap 1 first. | **OPUS** design, then **SONNET** / L | GO `hr/heat`: 3 car smashes in 10 s → meter ≥ 75; a cruiser spawns behind (angle > 120° from heading); caught at < 30 km/h for 0.75 s → studs −50; 0 cops during a quest |
| 7 | **"Failing sends me all the way back."** | Pair 6: retry = the whole 3-stage, 4.6 km run. | `checkpoint` flag per qv stage; RETRY = the current stage with its timer slice; RESTART = from the start (hit-and-run.md idea 1, the `qvCond` table). | **SONNET** / S | GO `hr/retry`: fail in stage 2 → RETRY puts the car at stage 2's start in ≤ 1 s with stage 1 kept; each fail reason shows its own message |
| 8 | **"Traffic is never near me."** | Pair 2: 0.9 cars within 40 m on average, out of 75. The reference is just as sparse, so this ranks low. | Spawn ring ahead of the camera, with 1.5 s path prediction (hit-and-run.md idea 5): move cars from far streets into the 40-90 m ring ahead, never inside the view cone. | **SONNET** / S | GO `hr/near`: 60 s roam at > 40 km/h → avg cars within 40 m ≥ 2.5; 0 pops in view (`99iv_inview`) |

**Out of reach for a browser game on an iPhone, so do not chase:**
- Voiced, animated story cutscenes and the on-foot character acting of the reference (TV intro, talk-to-NPC scenes): no voice actors, no animators.
- Its 89-mission volume and its writing/humour.
- Full rigid-body physics for every traffic car. Use kinematic cars with one solid contact writer (gap 1), which is enough for the feel.
- Frame-time parity on an iPhone with the reference cannot be proven from this lab. Our own perf/ios-reveal gate stays the truth.

**Where we already match or beat it** (do not spend lanes here): 1-tap start to driving with gas on; a lean phone HUD (5 buttons + speed + minimap, versus its 7 buttons); a clean fail card; drift, boost and a garage, which it does not have.

## Tomorrow: the first 3 lanes (in this order)
1. **SONNET `hr-boot+mstart` (gaps 3 + 4, S + S, ~60-90 min):** no race menu after PLAY, no control under the loader, a one-line mission start without the braking countdown. This is the cheapest, most visible "not sloppy" change for Alex's first minute. GOs `hr/boot` and `hr/mstart` must FAIL on live first (rule 13).
2. **OPUS `hr-hit` (gap 1, M):** contact through one writer near the player, per PLAN_TRAFFIC_BRAIN step 1. The reviewer looks at a before/after shot pair at 40 km/h. GO `hr/hit` ≥ 9/10.
3. **OPUS `hr-street` plan (gap 2, plan only, ~40 min):** a kerb/sidewalk/furniture rule set for the 1.5 km Frankfurt core. It carries the reference pair `docs/shots/hitrun-ref/2_street_traffic.jpg` vs `docs/shots/hitrun-gap/ours_2_street_traffic.jpg` and the `hr/street` numbers. The SONNET build follows the day after.

After those: guide ribbon (5), stage retry (7), heat-meter design (6, only once `hr/hit` is green), spawn ring (8).
