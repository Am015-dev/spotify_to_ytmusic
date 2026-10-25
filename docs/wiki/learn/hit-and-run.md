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

## 2. Car driving
**How it works there**
- Rigid body, four suspension contacts, per-tyre forces, rear-wheel drive, handbrake = locked rear slip (physics step capped at 1/120 s). Spring stiffness scales with mass, gravity and travel; damping is the critical value for that spring. An upright torque plus steering-assisted roll recovery rights a flipped, slow car; centre of mass is lowered.
- Damage: a hard wall hit adds speed*0.55 to a 0-100 damage bar and bounces back at a quarter speed; 100 = destroyed (mission fail, or respawn in free roam).
- R key: "return to road and repair" at any time in free roam; falling below the map bottom triggers it (or a mission fail "return to the mission").
- Chase camera: distance 8.1 m / height 3.55, wide mode 12.5 m, hood mode; raycast from the car to the camera pulls it in at walls; position follows with exp-damped lerp (rate 5.5), look target faster (9); FOV 55 widening by ~speed*0.16 up to +6 (speed feel); B = look behind; conversation shots take over the camera in missions.
- Cruise control H (50 km/h, any brake cancels): a phone-friendly idea. On foot: walk 4 / run 8 m/s, double jump, kick, car roof carries the player.
- AI drivers share the player solver (steer + pedal inputs); look-ahead >= 5 m or 0.8 s of travel.

**How ours works**: roam physics `src/71_roam_drive.js:roamStep`, damage `src/98dmg_damage.js`, auto-transform [../game/vehicles-xform.md](../game/vehicles-xform.md), camera `src/98sc_stkcam.js` ([stk.md](stk.md)), on foot [../game/on-foot.md](../game/on-foot.md). Ours is arcade-LEGO (boost, drift, transform), theirs is sim-lite; keep ours.

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
