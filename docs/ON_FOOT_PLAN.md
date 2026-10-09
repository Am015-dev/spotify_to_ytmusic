# ON_FOOT_PLAN: minifig on foot, car-jacking, brawls, blasters, wanted level

Written 2026-10-09 against base f0a4e32b (v88w src). Docs only, no src changes yet. Alex asked for this himself (2026-10-09), so the feature freeze does not apply.
Sources are numbered [n] and listed at the end. Each research fact was checked online on 2026-10-09; anything marked *unverified* could not be confirmed.

## 0. Three design choices (decided; recommended options taken)
1. **Tone: LEGO City Undercover.** Nobody bleeds and nobody dies.
   - A hit minifig **pops apart into 6 to 8 bricks plus a few studs**, then snaps back together and gets up after 3 s.
   - Blasters fire **bricks or studs**. Police "arrest" you with a cuff-and-respawn, not a "Wasted" screen.
   - Why: LCU is rated ESRB E10+ for cartoon violence, PEGI 7 [1][2]. GTA V is rated M for blood and gore [3].
   - LCU's developers deliberately avoided "becoming a Grand Theft Auto game" and swapped a big gun for a grapple gun [4]. Its producer said "the city is a very safe world" [5].
   - LCU itself lets you knock down enemies but never smash people [6]. We go one step further, as Alex asked: peds come apart into bricks and rebuild themselves. That is still gore-free.
2. **Car-jacking is a comic "commandeer", not theft with punches.**
   - Tap ENTER near a traffic car. The driver hops out, waves a fist, says "HEY!", runs off, and you get +1 star.
   - In GTA a stolen car seen by police gives 1★ [7][8]. LCU uses the "commandeer" framing [5][9].
   - We keep the GTA star so the sandbox has stakes, but use the LCU slapstick so the tone stays LEGO.
3. **Phone controls are context buttons around a floating left joystick.**
   - On foot, the left thumb area becomes a floating stick, which replaces ◀ ▶.
   - The right side keeps at most 4 big context buttons. Together with pause, the screen never shows more than 5 buttons.
   - Aiming is automatic: the blaster locks on to the nearest target in a cone, and tapping a target switches lock.
   - Why: reviewers called fiddly combat touch the worst part of the GTA mobile ports [10][11]. San Andreas mobile won praise for "generous auto-aim and a handy touch-to-target" plus contextual buttons [12][13].
   - Floating sticks test at least as well as fixed ones [14]. Apple and Android set touch targets at ≥44 pt / 48 dp [15][16].

## 1. Research summary (what we copy, with sources)
| Mechanic | Reference behaviour | Our version |
|---|---|---|
| Enter / exit | One context button. The character walks to the door first, and a moving car throws you off [7]. LCU: press X next to a car and Chase hops straight in [5]. | One ENTER/EXIT button. Short tween (0.35 s exit, 0.45 s enter), no door animation. *Real animation timings could not be verified.* |
| Car-jack | The driver is pulled out. Some fight back or flee. Police nearby give 1★ [7][8]. LCU: drivers hand over the car willingly, and a whistle stops traffic [9]. | Driver pops out and flees. 20 % of tough drivers (vans, trucks) shove back once. +1★. |
| Melee | GTA V: lock-on with light and heavy hits, plus dodge [17]. LCU: counter on a prompt, throw, then mash to cuff [18][19]. | One PUNCH button. A 3-tap combo knocks the target down into bricks. Peds that fight back show a "!" just before they swing, which gives the player a counter window. |
| Shooting | GTA V assisted aim snaps to the nearest target, and a timer breaks the lock [20][21]. San Andreas mobile: auto-aim plus tap-to-target [12]. The Definitive Edition mobile ports use "GTA V style controls and targeting" [22]. LCU guns are cartoon lasers that stun or paint enemies [1]. | BLAST auto-locks the nearest target in a 35° cone within 25 m. Tapping a ped switches the lock. Shots are stud projectiles, and a hit makes the target pop into bricks. |
| Wanted | GTA V gains: 1★ for stealing a car or attacking a civilian, 3★ for attacking police [8]. It loses stars through police vision cones with a cooldown of 30/45/60/75/90 s for 1–5★, and the minimap shows the cones [8][23]. GTA III / VC: SWAT at 4★, FBI at 5★, army at 6★ [24]. | 1–5★ with the same cooldowns, shortened to 15/25/35/45/60 s for phone sessions. No cones on the minimap: a simple "LOS = line of sight" ring instead. |
| Ped reaction | GTA: flee or fight back [7]. Unmodded GTA V police are effectively omniscient; witness calls exist only in mods [25]. | Peds within 12 m flee. 1 in 6 "tough" peds fight back. A "📞" bubble ped adds +1★ after 2 s unless you knock it down first, which gives a readable cause and counterplay. |
| Camera / stick | Left stick, swipe the right half to turn the camera, action buttons on the right (Goat Simulator mobile) [26][27]. Goat Sim 3 mobile: touch camera too fast [28]. Floating stick, small dead zone, fine control near the centre [14][29]. | Auto-follow camera behind the minifig, plus an optional swipe on the empty right half capped at 120°/s. No pitch control. |
| Knockdown / respawn | GTA V: "Wasted", 10 % cash fine capped at $10k [30]. LCU: lose studs and reappear on the spot (*weak source*) [31]. | Player at 0 hearts: pops into bricks, loses 10 % studs (capped at 500), and rebuilds at the spot 2 s later. Busted at ≥1★: same, plus stars cleared and a respawn at the police station. |

## 2. What exists in src (hook points)
- **Peds:** `HUB.peds` / `pedInit` / `pedStep` (60_city_build.js:986–997). These are 110 peds drawn as **10 InstancedMeshes, one per body part**, so the limbs already animate.
  - Peds already leap aside from the car (`jv`, `kx/kz`) and shout through `feed()`.
  - The lively crowd adds about 56–74 more: `LV_step` 98l_lively.js:118, `LV_pedPut` :16, clusters `LV_clStep` :187.
  - Scale: `SC_K.ped=.48` (96_scale_qa.js:6) gives about 2.0 m. QA8 (96:135–150) clamps any figure taller than 2.2 m.
- **Minifigs:**
  - `minifig(col)` 41_career_quests.js:43 builds a Group with separate limb meshes. Use it for the **player on foot** and named NPCs.
  - `GAR_fig` 98_garage_driver.js:14 builds the merged driver. The garage figure `GB_figGet()` sets the player's look, and `GB_FIG.t` already has `'police'`.
- **Player car:** `RO` (41:2), `roamStep` 71_roam_drive.js:20 (wrapped in about 13 files), `roamCam` :264, `roamPose` :244, `roamHud` :297. The main loop calls them at 72_roam_map_loop_boot.js:139.
  - Car health and wreck: `RO.hp`, `roamDamage`/`roamWreck` 71:84–92. `roamWreck` has a 70-brick InstancedMesh burst, **which we reuse for the ped brick pop**.
- **Traffic:** `HUB.cars` (60:968, NC=150), with each type drawn as one InstancedMesh in `HUB.cim`. `HCAR` types already include **police** (60:938).
  - `hubTrafficStep` 70_roam_world.js:60. Smash path: `OB_car` 90:31, `W10_bump`, `CR_tumbleStart`.
  - Traffic cars have no driver: `CR_cityGeo` strips `drv` at 93:296.
- **Collisions:** `roamHit(x,z,rad,y)` and `groundAt(x,z,y)` in 53_terrain_roads.js:195/188, and `bldPush` :197. The M1 goons already use the walker pattern `roamHit(x,z,2.2,y+1)`.
- **Touch:** `#touch` with `#steerZone #tL #tR #tG #tB #tF #tN #tD #tP` (00_page.html:686). `TOUCH` 40_hud_input_menu.js:62, handlers :84–85. Roam hides `#tF #tD` (96_scale_qa.js:162).
- **Missions:** `QUESTS` 41:21 already has "Stop, Thief!" (Kommissar Becker 👮) and chases. `qStart`/`qStep` 41:50/73. M1 goons and `M1.hp` (80_story_m1.js:5,54–77).
- **No** wanted level, police AI or on-foot code exists yet.
- **Perf (v88w):** Frankfurt 195 draws, Athens 205 (OD_CHANGELOG, 10_core.js:19). v88v: Frankfurt 264 draws / 1.08 M tris, Athens 242 / 0.98 M (docs/HANDOFF_world.md:8). Target ≤200 draws in Frankfurt (:17). CPU: `pedStep` 0.4–0.6 ms, `hubTrafficStep` 1.6–2.8 ms (docs/HANDOFF_perf.md).
- **Gate:** `tools/tPlay.js` on origin/alex/od-qa. It checks hits ≤1/min, stuck ≤3 %, humanoid ≤2.2 m, ≤3 rings, controls alive after rotation, no HUD over controls, text ≥12 px, 0 console errors.

## 3. New modules (all before `99_api.js` in src/ORDER)
| file | prefix | holds |
|---|---|---|
| `src/98of_onfoot.js` | `OF_` | Player minifig, state machine `RO.foot` (`'car'`, `'exit'`, `'walk'`, `'enter'`), walk physics, foot camera, ENTER/EXIT. P1–P2. |
| `src/98of_fight.js` | `OFF_` | Punch combo, ped knockdown into bricks and rebuild, brick-pop pool, fight-back peds. P3. |
| `src/98of_wanted.js` | `WNT_` | Stars, line-of-sight cooldown, police spawn and AI, blaster and auto-lock, BUSTED. P4. |
| `src/98of_cast.js` | `CST_` | Named NPCs and the 3 mini-missions that plug into `QUESTS`. P5. |

Per-frame hook: wrap `roamStep` as `const _rs=roamStep; roamStep=dt=>RO.foot&&RO.foot!=='car'?OF_step(dt):_rs(dt);` and do the same for `roamCam` → `OF_cam`.
- While on foot, the parked car stays in the world as a static object at `RO.x,RO.z,RO.h`. Its speed is 0, and it gets a collider through `hubGridAdd`.
- Test API: add `__mho.foot = { state, x, z, stars, hp, lock, ko }` to 99_api.js. That one-line change goes in the P1 PR.

## 4. Phases

### P1: EXIT/ENTER and walking (shippable alone)
**Controls and HUD (852×393)**
- The **ENTER/EXIT** button **replaces BRAKE (`#tB`)** while the car's speed is below 8 km/h. It shows a 🚪 icon and keeps the same spot and size, so no new button is added.
  - While driving at speed it is BRAKE as now.
  - On foot it stays visible as ENTER whenever a car is within 3.5 m. Otherwise it hides.
- On foot:
  - `#tL`/`#tR` are hidden. A **floating stick** appears wherever the left thumb lands inside `#steerZone` (left 40 % of the screen), with a 70 px ring, a 10 % dead zone and a squared response curve [29].
  - `#tG` GAS becomes **RUN**: walk at 1.6 m/s, run at 5 m/s while held. Run is the default when the stick is pushed past 85 %, so GAS is optional.
  - `#tN` BOOST becomes **JUMP**, 0.9 m high.
  - Buttons on screen: stick, ENTER, RUN, JUMP, pause = 5.
- HUD is unchanged: minimap, speed (shows "ON FOOT"), one objective line.
- Keyboard: WASD/arrows move, Shift runs, Space jumps, F or E enters/exits. 80:109 already maps F/E to `M1_fire`, so on foot `OF_` claims them only when `M1` is inactive.

**Build**
- `OF_exit()`:
  - Car v→0, then spawn `minifig(GB_figGet colours)` at the driver-side door: offset 1.4 m left of the car, ground `groundAt`. Scale it with `SC_K.fig` so it is **1.8 m ± 0.05**.
  - Hide the seated `drv` brick.
- `OF_step(dt)`:
  - Stick vector → camera-relative velocity, accel 20 m/s², turn rate 720°/s.
  - Collide with `roamHit(x,z,0.35,y+1)` then `bldPush`. Ground is `groundAt(x,z,y)`. Step-up allowed up to 0.45 m, so kerbs are fine and walls are not.
  - Car bodies: reuse `OB_carP` with r 0.35. Walking into a moving traffic car means it brakes, as it already does for the player.
- Walk animation: swing the limbs of the `minifig` Group (the same sinusoid as `pedStep`), 2.2 Hz walking and 3.4 Hz running.
- `OF_cam`: behind and above the minifig at 4.5 m back and 2.2 m up, lerp 6/s, with collision pull-in using `roamHit` along the ray (use the existing camera-in-building guard).
- `OF_enter(car)`: tween the minifig to the door over 0.45 s, then restore car mode. For **your own car only** in P1.

**Perf:** +1 draw (the minifig Group merged into one mesh with vertex colours, or 6 small meshes at most). Tris +0.3 k. Total ≤ v88w +2 draws.

**tPlay acceptance (real touch, on the split build)**
- Exit at stop → walk 40 m along the pavement → re-enter, **3 runs in Frankfurt + 3 in Athens**:
  - Success 6/6, at most 30 s each.
  - Stuck ≤3 % of on-foot time. Camera inside a building ≤2 %.
  - Player minifig height 1.75–1.85 m, versus a ped of about 1.8–2.0 m.
- Controls answer after 3 rotations, in both car and foot mode. No HUD over the stick. 0 console errors.
- Exit while the car is moving above 8 km/h is not offered: the button reads BRAKE.

**Risks**
- *Scale*: the player fig, the peds (scaled by .48) and the drivers (scaled by 1.5×drv) use three different scale paths. Add `OF_` to the QA8 tag list and check all three in one shot.
- *Collision vs visuals*: building colliders sit 0.5 m out from the walls (lesson 3), so a walker would stop short of the facade. Use radius 0.35 and accept the gap; do not shrink the colliders.
- *Steep Athens shelves*: `groundAt` steps above 0.45 m block the walker. That is intended.

**Estimate:** 1 session, about 4 h, including tPlay and a shot set.

### P2: car-jacking (+1★)
**Controls:** the same ENTER button. Near a traffic car (≤3.5 m, car speed <25 km/h), ENTER reads 🚗 **TAKE**.
- Traffic within 10 m of a walking player already brakes, because `hubTrafficStep` brakes for the player position. Point it at the foot position so you can step into the road and stop cars, like LCU's whistle [9].
**Build**
- `OF_jack(c)`:
  - Mark the `HUB.cars[c]` instance dead without a tumble, and copy its type `k` and colour into the player car. The player car becomes that model: build it with `CR_cityGeo(HCAR[k])` and add the `drv` brick back.
  - Spawn a **flee ped** from the `HUB.peds` pool (take the farthest ped and re-seat it with `pedPlace`). Show the "HEY!" `feed()` bubble and a 0.4 s hop, then run at 5 m/s away from the player for 6 s, then rejoin the graph.
  - Your old car stays parked for 60 s, then is recycled.
- 20 % of drivers of a van, truck or garbage truck "shove back": one push of 1.5 m knockback with no damage, then they flee. This is a cheap fight-back that sets up P3.
- Stars: **stub `WNT_add(1,'jack')`** that only shows ★ in the speed box. The full system arrives in P4.

**HUD:** ★ icons appended to the speed readout, so no new HUD element.

**Perf:** +0 draws (pool reuse). Traffic count unchanged, since 149 + the player's car.

**tPlay:** 5 jacks per city. Each must succeed in at most 20 s from the exit. The driver must be visible fleeing ≥3 m in the shot. Wall hits after the jack ≤1/min over the next 60 s of driving. 0 errors.

**Risks**
- The driverless traffic models need a driver at the moment of the jack. Use the seated `GAR_fig` merge, which is already used for the player.
- A traffic type swap must not leak geometry: dispose the old player geometry.
- A truck's camera and collider differ (98bc_bigcars.js). Run tPlay on a truck jack explicitly.

**Estimate:** 1 session, about 3–4 h.

### P3: punch, combo, knockdown into bricks, fight-back
**Controls (on foot)**
- **PUNCH** takes the RUN (`#tG`) slot, since running is already automatic at a full stick push.
- Buttons: stick, ENTER/TAKE, PUNCH, JUMP, pause = 5.

**Combat**
- Tap PUNCH → hits 1, 2, 3 within 0.6 s of each other.
- Target: the nearest ped within 1.6 m inside a 70° cone in front. Snap-turn to it (a soft lock, like GTA V's lock-on melee [17]).
- Hits 1–2 make the target stagger. Hit 3, or 3 hits in total, is a **knockdown**:
  1. The ped's instance is hidden.
  2. 8 bricks in the ped's colours plus 3 studs pop out of the pooled `roamWreck` brick InstancedMesh.
  3. After 3 s the bricks fly back together and the ped stands up. Then it flees, or 1 in 6 fights back.

**Fight-back peds**
- A "!" sprite shows 0.5 s before the swing. That is the counter window: PUNCH during it gives a 1-hit knockdown, like LCU's counter on a prompt [18].
- A hit on the player removes 1 of 4 hearts. Hearts recover 1 every 8 s out of combat.
- At 0 hearts the player pops apart, loses 10 % studs (max 500), and rebuilds in place.

**Ped reactions:** peds within 12 m of a knockdown flee, using the existing leap code. One "📞 caller" ped per brawl (a random flee ped) gives +1★ after 2 s unless you knock it down first.

**HUD:** 4 small heart bricks shown inside the speed box, only while on foot. No new panel.

**Perf**
- The brick pop reuses the `roamWreck` InstancedMesh, so +0 draws. The pool holds 70 bricks, enough for 8 pops at once.
- The "!" sprite is +1 draw while visible. `pedStep` CPU stays under 0.8 ms.

**tPlay**
- 20 PUNCH taps against 5 peds: every ped is knocked down within 6 taps, and every knocked-down ped stands up again within 4 s. All 110 peds stay counted (no leak).
- Humanoid ≤2.2 m, which includes the rebuild animation. 0 errors. fps ≥ the v88w baseline minus 5 % in a 5-ped brawl.

**Risks**
- *Pool leak*: knocked-out peds must return to the pool, or the crowd shrinks over time. Assert `HUB.peds.filter(p=>p.ko).length ≤ 8`.
- *HUD clutter*: the hearts go inside the existing box only.

**Estimate:** 1–1.5 sessions, about 5 h.

### P4: blaster with auto-lock, wanted 1–5★, police chase
**Controls**
- On foot, after the blaster is unlocked (picked up from a 🔫 brick crate or bought for 500 studs), **BLAST** replaces JUMP (`#tN`). Jump moves to swipe-up on the stick zone.
- Buttons: stick, ENTER, PUNCH, BLAST, pause = 5.
- Lock-on:
  - Auto-locks the nearest valid target inside a 35° cone within 25 m, with a line-of-sight check by `roamHit` ray samples.
  - A yellow brick ring marks the target. **Tapping on a ped anywhere** on the right half switches the lock [12][20].
  - Hold BLAST to fire 4 shots/s. Each projectile is a stud travelling at 40 m/s. 2 hits knock a ped into bricks; police take 3.
- In the car, BLAST is not offered. FIRE `#tF` stays race-only.

**Wanted rules (WNT_)**
| ★ | Caused by | Response |
|---|---|---|
| 1 | Car-jack, knockdown seen by a caller | 1 police car (`HCAR` 'police') re-routed toward you, plus 1 cop minifig on foot when you are on foot |
| 2 | Hitting a cop, 3 knockdowns | 2 cars, aggressive ramming using the M1 goon `hunt` code |
| 3 | Blasting a cop | 3 cars plus a roadblock (2 cars parked across the nearest road node) |
| 4 | Knocking down 3 cops | 4 cars, heavy SWAT van (the `truck` model, police livery) |
| 5 | Continued attacks at 4★ | 5 cars max plus army jeeps. A helicopter is out (perf); Alex's "army in case of serious condition" lives here only |

- Losing stars: when no police unit has line of sight (≤60 m, a `roamHit` ray every 0.25 s), the stars flash. A cooldown of **15/25/35/45/60 s** for 1–5★ clears them all, and being seen again resets it. This is GTA V's model [8], shortened for the phone.
- Busted: a cop minifig reaches you on foot, or your car is boxed in with speed <3 km/h for 3 s. Show "BUSTED", play the cuff pop, lose 10 % studs, and respawn at the police station (see CITY_LIFE_PLAN §6). Stars are cleared.

**Police AI**
- Police cars take a traffic slot. Their route is overridden to path toward you with `qvPath` (41), and the ram behaviour comes from `M1_goonStep` (80:63).
- Cops on foot are pooled `HUB.peds` re-skinned with `GB_FIG` torso `'police'` colours: walk toward you, punch, and knock down into bricks like anyone else.
- At most 5 police cars and 4 cops on foot at once.

**HUD:** the stars in the speed box flash while cooling down. The minimap shows police as blue dots, using the existing marker draw. No vision cones on the minimap; they are too busy for 852×393.

**Perf**
- The projectile pool is 1 InstancedMesh of 24 studs (+1 draw). The lock ring is +1. Police cars reuse the `HUB.cim` police instance, so +0.
- Total P1–P4 ≤ v88w **+5 draws**, so ≤200 in Frankfurt (195+5) and Athens at ≤210. Tris +5 k.
- CPU: police pathing at most 1 `qvPath` call per unit per second.

**tPlay**
- Scripted human flow: jack → 1★ → drive away → lose stars in ≤60 s of driving out of sight. Pass in 3/3 runs per city.
- Blaster lock: tap BLAST 10× near 3 peds → ≥8 hits.
- 3★ chase for 90 s: wall hits ≤2/min (police ramming counts separately), fps ≥ baseline −8 %, 0 errors, ≤5 police cars alive.

**Risks**
- Police swarms make the game unplayable. Keep the caps and the cooldowns short.
- Roadblocks placed onto colliders must be checked with `roamHit`, and must never be placed on a ramp approach.

**Estimate:** 2 sessions, about 8 h.

### P5: named characters and 3 mini-missions
Use the existing `minifig()` with a "!" marker (41:43), so givers look the same as today's quest givers. Each one becomes a `QUESTS` entry (41:21) with a new `kind:'foot'`, handled in `CST_step`.
1. **Kommissar Becker 👮** (already in QUESTS, Frankfurt): "Catch the bike thief". The thief runs on foot; knock him down and press ENTER to cuff him. Reward 300 studs.
2. **Lena the Thief 🦹** (Athens, Monastiraki): "Grab the getaway car". Jack a specific red sports car while it stops at a light, then lose 2★. Reward 400 studs plus that car added to the garage.
3. **Rival crew "Hafenbande"** (reuse M2 names, Frankfurt docks): a brawl of 3 crew peds who fight back; win within 60 s. Reward 500 studs.

- Scale check: every named NPC gets the QA8 tag.
- tPlay: each mission is winnable in ≤3 tries by the tPlay human bot, and no mission giver is taller than 2.2 m.
- **Estimate:** 1.5 sessions, about 6 h.

## 5. Build order and total
1. **P1** (4 h). Ship it once the reviewer passes it. This alone answers "get out of the vehicle".
2. **P2** (3–4 h).
3. **P3** (5 h).
4. **P4** (8 h).
5. **P5** (6 h).

Total about 26 h, or 6–7 worker sessions, one at a time and each with its own reviewer pass and deploy.
- Alex can play P1–P2 after about 1 day.
- Interleave the quick wins from CITY_LIFE_PLAN (ramps, speeds, truck share) first. The combined order is in CITY_LIFE_PLAN §9.

## Sources
1. ESRB, LEGO City Undercover (E10+, cartoon lasers stun or paint enemies; vehicles break into bricks): https://www.esrb.org/ratings/32710/lego-city-undercover/
2. Nintendo UK, LEGO City Undercover (PEGI 7): https://nintendo.co.uk/Games/Nintendo-Switch/LEGO-CITY-Undercover-1177194.html
3. ESRB, Grand Theft Auto V (M, Blood and Gore, Intense Violence): https://www.esrb.org/ratings/33073/grand-theft-auto-v/
4. Nintendo Everything, LCU developers wanted to avoid making a GTA game (grapple gun): https://nintendoeverything.com/lego-city-undercover-dev-says-the-team-wanted-to-avoid-making-a-gta-game-talks-scrapped-zombie-mechanic-talk/
5. GamesBeat, LCU preview (commandeer, "very safe world", press X next to a car): https://gamesbeat.com/lego-city-undercover-preview/
6. Outcyders, LCU beginner's guide ("You can't smash a person"): https://www.outcyders.net/article/lego-city-101-a-beginners-guide-lego-city-undercover
7. Grand Theft Wiki, Carjacking: https://www.grandtheftwiki.com/Carjacking
8. Grand Theft Wiki, Wanted Level in GTA V (causes, responses, 30–90 s cooldowns): https://www.grandtheftwiki.com/Wanted_Level_in_GTA_V
9. Outcyders, whistle to stop traffic, drivers give cars up willingly: https://www.outcyders.net/article/lego-city-101-a-beginners-guide-lego-city-undercover
10. AppSpy, GTA Vice City mobile review (combat controls "sticky"): https://www.appspy.com/grand-theft-auto-vice-city-review
11. Destructoid, Vice City mobile, shifting d-pad (*search summary only; page returned 403*): https://www.destructoid.com/?p=115439
12. Pocket Gamer, GTA San Andreas mobile (generous auto-aim, touch-to-target): https://www.pocketgamer.com/articles/055978/grand-theft-auto-san-andreas/
13. Gematsu, San Andreas mobile contextual controls: https://www.gematsu.com/2013/11/grand-theft-auto-san-andreas-coming-to-mobile-devices
14. UPI repository, floating vs fixed joystick study: https://repository.upi.edu/101077
15. Apple design tips (44×44 pt): https://developer.apple.com/design/tips/
16. Android accessibility (48×48 dp): https://developer.android.com/guide/topics/ui/accessibility/apps
17. Gamepressure, GTA V melee: https://www.gamepressure.com/gtav/melee-fights/z055e1
18. Nintendo, LCU Wii U electronic manual (counter, throw, grab): https://www.nintendo.com/eu/media/downloads/games_8/emanuals/wii_u_6/lego_city_undercover/ElectronicManual_WiiU_LegoCityUndercover_en.pdf
19. GoNintendo, LCU (cuff by button mash): https://www.gonintendo.com/archives/192143-lego-city-undercover-tons-of-new-info
20. MP1st, GTA V targeting modes: https://mp1st.com/?p=45234
21. Kotaku, GTA V aim assist snaps to the nearest target: https://kotaku.com/two-important-things-gta-v-is-still-getting-wrong-1405642943
22. Game Informer, GTA Trilogy Definitive Edition on Netflix mobile: https://www.gameinformer.com/news/2023/12/14/grand-theft-auto-the-trilogy-definitive-edition-comes-to-netflix-and-mobile-today
23. Game8, GTA V police vision cones on the minimap: https://game8.co/games/GTA-5/archives/377842
24. WikiGTA, Wanted level in GTA III / VC (army at 6★): https://en.wikigta.org/wiki/Wanted_level
25. GTABoom, RDR witness system modded into GTA V: https://www.gtaboom.com/gta-5-gets-rdrs-witness-system-42f2
26. Pocket Gamer, Goat Simulator mobile review: https://www.pocketgamer.com/goat-simulator/review/
27. GSMArena, Goat Simulator iOS/Android controls: https://blog.gsmarena.com/goat-simulator-ios-android-game-review/
28. TouchArcade, Goat Simulator 3 mobile review: https://toucharcade.com/2024/01/29/goat-simulator-3-mobile-review-iphone-15-pro-performance-graphics-ipad-multiplayer-online/
29. Bugnet, virtual joystick tuning (dead zone, response curve): https://bugnet.io/blog/how-to-fix-mobile-virtual-joystick-feeling-bad
30. Grand Theft Wiki, Death (GTA V 10 % fine capped at $10k): https://www.grandtheftwiki.com/Death
31. StrategyWiki, LCU walkthrough (stud loss on death; *weak, page returned 403*): https://strategywiki.org/wiki/LEGO_City_Undercover/Walkthrough
