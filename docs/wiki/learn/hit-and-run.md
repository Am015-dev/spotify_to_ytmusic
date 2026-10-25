# Hit & Run web port (Three.js, no licence): world logic, driving, campaigns

Source: github.com/Vheissu/hit-and-run-web (README, docs/PORTING.md, NATIVE_ANALYSIS.md, MOVEMENT_PHYSICS.md, PURSUIT_PARITY.md; src/campaign/{types,engine}.ts, src/traffic.ts, src/main.ts, tests/campaign.test.ts), read 25 Oct via raw.githubusercontent.com, nothing cloned.
LICENCE: the repo has no licence file and ships assets converted from a commercial PS2 game. IDEAS ONLY: no code, no data tables, no assets. Everything below is our own words; the numbers are design facts (speeds, timers, radii) the repo documents.
Same rule as the LEGO Racers port ([../racers/physics.md](../racers/physics.md)); licence row in [../sources/licences.md](../sources/licences.md).

## What it is
A Three.js rebuild of a 2003 open-world driving game (Springfield, 7 level variants, on-foot + in-car, 89 scripted missions, 610 stages). Its mission data is compiled from the original scripts; the engine around it is new. Most value for us is the mission/stage model and the "world has rules" layer, not the car model.

## 1. World logic
**How it works there**
- Each level loads whole (all scene parts downloaded in parallel with a progress bar), no zone streaming. Roads are explicit directional lane quads with junction links; traffic follows lane centres (an early two-way reading made head-on crashes).
- Traffic: a small fixed pool (5 slots), re-searched every 200 ms around a point 40 m ahead of the camera heading; spawn within 65 m, despawn beyond 75 m, first 3 s uses a 100 m radius; the spawn test predicts lane and player positions 1.5 s ahead so nothing pops in front of you. Flat 60 km/h cruise speed. Ordinary cars brake for a stopped player, other cars and NPCs.
- Hit & Run meter (the "wanted level"): 0-100. Offences add heat: car bump +5 (shared 1.5 s quiet period), smash a car +25, smash a prop +7.5, hit a pedestrian +10, kick one +13. Heat decays 1 pt/s (level 1 is gentler to the player: 3/s, level 2 1.5/s), a 3 s delay after an offence, 6/s while chased, 10/s inside buildings. Warning at 78 (rearm below 60), pursuit starts at 100 and ends below 5.
- Pursuit: 1 cruiser in early levels, 2 later (cap set by the level script). Caught = a chaser within 10 m for 0.75 s while you are under 30 km/h (1.5 s on foot). Penalty: lose 50 coins (never below 0), short freeze, no mission restart. Switching to another car clears heat; interiors and missions can disable the meter.
- Collectibles: coins on the ground (diamond-shaped pickup reach, wider from a car, 0.4 s magnet pull before credit); crates kicked/rammed spill 10 coins, other props 1; a loose-coin pool of 200 that bounces (gravity 21, bounce 0.6) and fades after 11 s; smashed props stay smashed in the save; collected coins persist per level.
- No day/night clock: "day flow" is the level list (morning, dusk, Halloween variants of the same map) chosen by the chapter.
- Interiors are separate rooms entered by a door interaction; pursuit, offences and traffic pause inside.

**How ours works**: roam traffic `src/70_roam_world.js:hubTrafficStep` + `src/98w_w13_traffic.js` (see [../game/traffic.md](../game/traffic.md)); studs/magnet `roamMagnet` in `src/41_career_quests.js`; smash `src/98sm2_smash2.js`; no wanted meter; one persistent city, no interiors.

## 2. Car driving (read from src/vehicle-physics.ts, physics.ts, pursuit.ts, main.ts)
**How it works there** (sim-lite rigid body: mass 1500 kg default, gravity 9.81, physics step <= 1/120 s)
- Grip: 4 wheel contacts, each with a spring (stiffness from mass/gravity/travel, damper = a fraction of critical) and a lateral force proportional to sideways speed, clamped by a grip limit = 2.48 x the wheel's load. Lateral stiffness is 95 normally, 55 when slipping, scaled by surface (grass 0.7, sand/gravel/etc 0.6) and faded in below 15 % of top speed. Steering: 30 deg lock, shrinking 27 % at top speed; input smoothed (rate 10).
- Power: rear wheels only, gas 4.5 m/s2, brake 8 (+3 when rolling forward), reverse capped at 50 km/h. No speed clamp: drag = 2*gas*mass/top^2 * v^2, so top speed (155 km/h default) is where drag meets thrust and slopes/impacts can exceed it. Coast drag when off the gas. Full throttle under 9 % of top = burnout (75 % thrust) and steering adds a donut torque.
- Handbrake/drift: not a separate drift mode. Handbrake above 5 % of top speed forces a "slip" state: front lateral stiffness +40 %, rear -40 % (rear steps out), a small extra decel. Slip also starts on its own when tyre force exceeds the grip limit, and ends when slow, off the gas, or aligned within ~15 deg of velocity with little steering. Gas in slip uses its own scale. No drift score, no boost.
- Air: wheels off the ground give no drive or steering (airborne cars only rotate by physics); angular speed capped 12 rad/s, damping e^-0.8t. A upright torque (stronger the more tilted, from 10 deg) plus rotational damping rights the car; if nearly stopped and flipped, steering rolls it back. When the roof is down the centre of mass drops (easier to flip over). A "stranded on fence/kerb" assist gives drive force for up to 1 s while the body touches and rear wheels hang free.
- Collisions: box vs world triangles with impulse + friction (0.55) + restitution 0.12 above 1 m/s. Damage only from closing speed > 8 m/s on flat faces (> 2 on walls): (speed - 2) x 0.85, scaled by the car's hit points; 100 = destroyed. The older arcade path adds speed x 0.55 and bounces back at a quarter speed. Damage is a mission-fail condition, not a visual wreck.
- Return to road (R): resets pose onto the road, clears damage and velocity at any time in free roam (and falling below the map or 100 damage triggers it); in a mission it fails with "return to the mission" instead.
- Camera: raycast anchor 1.6 m above the car, pulled in 0.35 m before walls and kept 1 m above ground; distance 8.1 m / height 3.55 (wide 12.5 / 6.5, hood 0.2 / 1.55); position lerps at rate 5.5, look-at at 9; FOV 55 + speed x 0.16 (max +6). On foot, camera yaw follows the walk heading at 2.2 rad/s.
- Chasers (pursuit.ts): spawn on road points 100 m from the player, choosing the ones furthest BEHIND the player's heading, with a short delay between spawns; use the same physics as the player; retire when 5 s after the meter ends or beyond the removal radius (75 m class). Capture rules in section 1.

**How ours differs**: ours is arcade kinematic, not forces. `src/71_roam_drive.js:roamStep` eases a yaw rate (sharper slow, calmer fast; 0.45x in air), velocity heading follows with surface grip (road/dirt/water constants), hand-brake drift is a state (`RO.dDir`, `hbOk`, drift speed hook from `src/98k_boost2k.js`) that scores and fills boost, a hop button, ramp launch (`rampV`), wall assist, and a steering assist. Damage (`src/98dmg_damage.js`) is richer than theirs (panels fly off, smoke below 50 %, fire below 20 %, wreck + rebuild in 2 s, repair after 5 s without a hit, per-hit cap 12). Camera `src/98sc_stkcam.js` (STK-style, [stk.md](stk.md)) is at least as good. LEGO Racers numbers: [../racers/physics.md](../racers/physics.md).
**What is worth taking**: nothing in the force model (it would fight our feel; our tunable arcade steering is the product). Three small rules are worth a lane:
1. **Aligned-with-velocity recovery of the drift state** (XS): drift ends when heading is within ~15 deg of velocity with little steering and gas off; their slip never "sticks". Check ours cannot stay in `RO.dDir` after the player straightens (GO assert). Cheap, prevents a feel bug.
2. **No air control + self-righting torque** (S, 1 SONNET): keep the car from steering mid-air (we use 0.45x), but add a gentle upright torque and an "R / auto after 3 s upside down" recovery so a flip never strands a phone player. Their stranded-on-kerb assist (drive force for <= 1 s while the body touches and wheels hang) matches our unstick; compare thresholds.
3. **Chasers appear behind you** (S, with the heat-meter lane): pick spawn points furthest behind the heading on the road graph, 100 m away, one at a time with a delay; retire 5 s after the meter ends. Avoids cops popping up in front.

## 3. Campaigns (the part worth studying)
**How it works there**
- Data hierarchy: Chapter (= level, 7) -> Mission list in order, plus optional missions (bonus, street races, wager race) -> Mission = setup commands + optional intro mission (cutscene/dialogue first) + Stages. A chapter also has an `initial` command list (give start car, etc.) and a `schedule` (what unlocks when).
- Stage = one objective + commands + fail conditions + a `checkpoint` flag. Objective types (19): goto, getin, talkto, dialogue, interior, gooutside, race, follow, losetail, delivery, dump (ram a target and it drops items), destroy, pickupitem, destroyboss, timer, fmv, buycar, buyskin, coins (pay a fee).
- Fail conditions are separate small records per stage: timeout, out-of-vehicle for N s, vehicle damage below a floor, follow-distance exceeded for 2 s ("you lost your target"), lost cargo, target finished first, finishing position worse than N (race). Each carries its own message string.
- Engine states: loading -> running -> between-stages (0.2 s, 0.8 s if a "stage complete" banner) -> ... -> mission-complete (3 s) -> next mission or chapter-complete -> campaign-complete; plus failed. Engine is pure: it takes a snapshot of the world each tick (player position, on foot?, vehicle, entity states, interact pressed, dialogue/movie done) and returns effects (prepare, banner, failed, purchase, collect, drop). That made all 610 stages unit-testable with fake snapshots, no graphics.
- Retry: Enter on the fail screen reloads from the last checkpoint stage (replays that stage's setup commands, restores the timer and cargo); retry-from-start is a second option. Checkpoints are saved to disk, so quitting mid-mission resumes there.
- Optional missions: starting one remembers the story mission + checkpoint, and returning from it resumes the story exactly. Completing all street races of a chapter, or the bonus mission, grants that chapter's reward (car or outfit); wager races pay double the entry fee.
- Economy: coins buy cars/outfits at sellers; a purchase is idempotent (cannot charge twice).

**How ours works**: `src/41_career_quests.js` has `QUESTS` (side quests with NPCs, kind deliver/ball/chase...), quests v2 `qvGraph`/`qvStep`/`qvFail`/`qvNext` (seeded multi-stage layouts, TIME UP, retry/restart), OTG one-off challenges (checkpoint, smash, collect, chase, speed...), story missions `src/80_story_m1.js`, `src/81_story_ath_m2_m3.js` (hand-coded per mission), race menu modes. Stages exist but the objective list is code, not data, and there is no shared fail-condition vocabulary or chapter/unlock schedule.

## Port the idea (ranked by player-visible value per cost)
1. **Fail-condition + retry-from-checkpoint vocabulary** (S, ~1 SONNET lane): lift the 6 reusable fail records (timeout, out-of-car N s, hull floor, lost target 2 s, lost cargo, beaten) into one `qvCond` table used by `qvStep` and the story missions; fail screen with Retry (last checkpoint stage) / Restart / Quit. Gain: every quest fails with a clear message and a one-tap retry, which phones need. GO: state asserts per condition.
2. **Pure engine + snapshot tests** (M, ~1-2 lanes): split mission progress from the world: `step(snapshot,dt) -> effects`. Lets bots test every mission headless (we have a bot gate, rule 16). Do it for new missions first, not a rewrite.
3. **"Heat" meter for smash chaos** (M, ~1 lane + design): our smash and takedown fun has no consequence. A 0-100 meter fed by smashes/bumps (use our own numbers), with one cop car pursuit and a "busted = lose studs, not the mission" penalty, decaying faster in tunnels/garages. Makes free roam feel alive. Needs a design plan first (cop spawn, siren audio, phone HUD, off switch for missions).
4. **Mission chain with optional detours** (M, ~1 lane): remember story mission + checkpoint when the player takes a side quest/race, then return exactly. We have both halves, not the link. See the state machine below.
5. **Traffic spawn by camera-ahead point with 1.5 s prediction** (S, ~1 lane, perf-positive): spawn near a point ahead of the camera heading, despawn behind at a slightly larger radius, never inside the view cone or into the player's predicted path. Likely cures pop-in complaints and fits the one-writer rule in the traffic brain plan. Also: cruise-control button (S, HAIKU-sized) for touch.

## Proposed state machine for our cities (Frankfurt, Athens)
```
City { id, missions[] (story order), optional[] (side quests, races, bonus), initial[], unlocks[] }
Mission { id, title, intro? (dialogue stage list), stages[], optional?: bool, reward? }
Stage { objective, params, conds[], checkpoint?: bool, banner? }
Objective: goto | getin | talk | dialogue | interior | chase(follow/ram) | escape | deliver | collect | smash | race | timer | buy
Cond: timeout | outOfCar(N) | hullFloor | lostTarget(dist,2s) | lostCargo | beaten(pos)
Engine: loading -> running -> stageDone(0.2-0.8s) -> [next stage | missionDone(3s)] ; running -> failed -> retry(checkpoint) | restart | quit
Detour: start(optional) pushes {story, checkpoint}; missionDone/quit pops it
Save: {city, mission, phase, stage, checkpoint{stage,timer,cargo}, completed[], story?}
```
Mapping: our `qvStep` kinds (`go`, `chase`...) are objectives; `ch.v2.si` is the stage index; add `checkpoint` + `conds` as data on each quest layout, then move story m1-m3 to the same table. Do not rebuild what exists: first lane is just the cond table + fail UI (proposal 1).

## Do not port
Level-sized whole-map loads (our streaming plan is better, [../plan/open-world-streaming.md](../plan/open-world-streaming.md)); sim-lite vehicle forces; on-foot walking collision; interiors; anything from the PS2 converter pipeline.
