# LEGO Racers (1999) → Mainhattan Overdrive: what to learn, how to rebuild (2026-10-24)

Alex, 24 Oct: "you can use this example they have the source code of the game" / "no need to copy … we can rebuild them in our garage" / "no need to play i want you to read the codes".
Sources read: github.com/isledecomp/racers (decomp; paths below are under `LEGORacers/`), racers-portable (same code, ported), warp.parts (a Svelte launcher that runs racers-portable as WebAssembly and streams LEGO.JAM; no game logic of its own), Laupetin/Lego-Racers-Mod (JAM/GDB tools; its README lists the asset types, nothing more).
**Copied nothing.** The code is decompiled proprietary software and the art is LEGO's, so these are facts in our own words. Units are the game's internal ones (speed per ms, distance in model units), so compare ratios, not raw values.

## 1. Facts from the code

**Race loop**
- Laps: the default is 3 (`src/save/gamestate.cpp`). Options offer 1-5 laps and up to 6 racers (`OptionsScreenBase`). A solo race forces 3 laps (`RaceSession::Initialize`).
- Checkpoints are planes in a graph. Each has up to 4 "next" links, so tracks can branch, with at most 254 nodes (`CheckpointGraph::Load`). Lap fraction is spread evenly along the main chain; branches are interpolated between it (`ComputeLapFractions`). Place = checkpoints passed + fraction; ties go to the distance to the next plane (`RaceState::UpdateStandings`).
- A lap counts only after the zone sequence pre-line → line → post-line (`Racer::CrossFinishLine`), then "time behind" shows for 2 s. There is no wrong-way message: driving backwards just loses progress.
- Circuit points by place: 30 / 20 / 10 / 3 / 2 / 1 (`g_circuitPointsByPosition`, `circuitstandings.cpp`).
- Rubber band: OFF for the first 15 s (`RaceSetup::Initialize`). After that, every AI behind the leader runs at ×1.05 route speed and every AI ahead of it at ×0.95 (`RaceSetup::Update`, `g_rubberBandScale` = 0.05). The player is never adjusted. It is mild and symmetric.

**Power-up bricks** (`src/race/powerups/`)
- There are 4 colour bricks, and you hold one (`ColorBrick`, `Racer::m_heldPowerupColor`): red = weapon, yellow = hazard, blue = shield, green = turbo. Driving through a different colour swaps it.
- White bricks stack 0-3 and set the power level of the next use. All of them are spent on that use (`WhiteBrick`). A dropped white brick goes home after 10 s.
- Colour bricks respawn after 3 s (`PickupBrick`); each brick can override that in the track data.
- What each colour does at levels 0-3 (`RacePowerupManager::UseRedPowerup`, `UseYellowPowerup`, …):

| Colour | L0 | L1 | L2 | L3 |
|---|---|---|---|---|
| Red | cannonball | grappling hook | lightning | homing missiles |
| Yellow | oil slick | dynamite | magnet | curse |
| Blue | shield 4 s | 6 s | 8 s | 10 s (+1 s fade, `shieldaction.h`) |
| Green | turbo 1 s | 1.5 s | 5 s | warp portal |

- Turbo: thrust ×8 (54 → 432, `drivecontroller.cpp`), halved after a wall hit. Max speed goes from 120 to 176 (×1.47, `racerphysics.cpp`), and grip ×1.5 (`RacerPhysics::StartBoost`).
- There is a budget of 25 live effects. The AI won't fire with 20 or more in play.

**AI** (`Racer::AiConsiderPowerup`, `RaceRouteRecord`, `RacerPhysics` route mode)
- AI cars don't steer toward points. They replay recorded driving lines (`.rrb`): front, middle and side lines, with up to 10 variants each, picked at random (`RaceSession::LoadRouteRecords`).
- Every route point stores the track width left and right. The AI drifts sideways inside that width, and the offset decays at 0.002/ms.
- Speed scale is clamped to −0.5…2.75. Spin-out ×0.1, curse ×0.5.
- Item use: a roll every 150 ms (300 ms after a pickup, 1 s after a failed roll). Each driver has a 0.2-1.0 chance per colour.
- Red fires only if a target is in a forward cone (cos 0.96 ≈ ±16°, ~10-250 units).
- Some drivers wait to collect white bricks first (their "charge colour"). The AI may turbo right off the line.

**Physics** (`RacerCarBody`, `RacerPhysics`, `DriveController`)
- Top speed has no clamp: drag = mass·thrust / vmax², so speed settles where drag equals thrust. The player's base vmax is 110 and the AI route vmax is 120.
- Braking thrust is ×2.
- Steering: the tightest radius is 40 and the widest 4096 (`SetTurnRadius`). The radius widens with speed: v²·mass / (grip·g) (`ComputeMinTurnRadius`).
- Grip defaults to lateral 3.0 and friction 0.25. Every surface can override grip, friction and rolling resistance (`.tmb`, `SurfaceTable`).
- Powerslide needs ≥ 3 wheels down, no wall contact, and the car's facing within ~32° of its velocity (`CanPowerslide`). It banks the car up to 45° and ends below speed 0.03.
- Air: gravity 39 (×4 while airborne). Landing bounce is ×1.15-1.3, and the car is kept within 45° of upright.
- Walls: the speed into the wall is removed, then 30 % of the rest (`ApplyWallResponse`). A nose-first hit adds a 200 ms yaw kick, so a crash costs time without stopping the car dead. A spin-out lasts 0.6 s.
- Stats run 0-100. Accel and top speed move only ±5 %, and handling scales steering 0.7-1.0 (`SetAccelerationStat`, `SetHandlingStat`).

**Camera** (`RaceCameraController`, `g_defaultCameraFov`)
- FOV is 65, +30 during warp, and shake is clamped to 40-80.
- 3 player views (pitch°, height°, distance): near (5, 35, 20), mid (8, 25, 30) and far-high (8, 45, 10).
- Lag: position 0.05-0.10, rotation 0.25 (exponential). The closest the camera gets is 12, and the turn look-ahead gain is 80. View changes blend over 2 s.

**Track / level data**
- One race file (`.rab`, read in `RaceSession::Initialize`) names every part of a track:
  - world `.wdb`: models, LOD scene nodes, sprites, lights, UV-scrolling materials (`GolWorldDatabase::Load`)
  - sky `.skb`: timed keyframes of top, middle and bottom colours (`RaceSkyState::Load`)
  - checkpoints `.cpb`
  - start grid `.spb`: position + facing (`RaceState::LoadStartPositions`)
  - power-ups `.pwb`: colour-brick position + colour + optional respawn, white-brick positions (`ParseColorBricks` / `ParseWhiteBricks`)
  - hazards `.hzb`: 21 types (hammer, rolling rock, sweep cannon, lava geyser, snowfall, ghost, warp pad, …) with trigger radius, interval and period (`HazardManager::LoadHazards`)
  - surfaces `.tmb`
  - triggers `.trb`, timers `.tib`, events `.evb`
  - AI lines `.rrb`
  - camera start pose and map bounds
- Every file can be mirrored (Y negated) for reverse tracks.
- Track width lives in the AI-line points: one s8 byte × 0.125 per side, so ≤ ~16 units each way.

**Car builder**
- Grid: 10 × 6 cells, up to 15 high, 64 pieces at most (`CarBuildModel::Initialize` / `TestPlacement`; `CarBuildPieceList` caps the list at 64).
- Only the free bricks count. Their volume adds mass and moves the centre of mass (`ComputeHighPieceCentroid`).
- Each 20 cells of volume give +1 handling and +1 top speed but −1 accel (`RaceState::CreateRacer`). So a bigger car is a bit faster but slower off the line.
- The chassis (`.cmb`) sets the base stats, mass, wheel positions and driver mount. The 4 driver colour stats only steer the AI's item use.

## 2. What makes a LEGO Racers race fun (with numbers)
1. **Short, dense races**: 3 laps × 6 racers, and a lap counts only through the line zones.
2. **Readable item choice**: 4 colours, each one a role (attack / trap / defend / speed), with 1 slot. Picking the brick colour IS the decision.
3. **Stacking for a payoff**: 0-3 white bricks turn a cannonball into homing missiles, or a 1 s turbo into 5 s. Hold or spend: a risk-reward call every few seconds, and bricks respawn every 3 s.
4. **A fair pack**: the AI drives human-recorded lines with lane wobble, and the rubber band is only ±5 % and only after 15 s. Overtakes feel earned.
5. **Crashes cost time, not the race**: walls take 30 % of speed, a spin-out takes 0.6 s, and turbo grip is ×1.5.
6. **Track gimmicks** (21 hazard types) are triggered set pieces on a timer, so each lap has a moment.

## 3. What we already have
| LEGO Racers | Ours (file) | Gap |
|---|---|---|
| ? bricks, 1 slot | 6 items (missile/turbo/shield/web/mines/lightning) on rainbow "?" bricks, 4 across every ~650 m, 2.5 s respawn (`src/98z_race_items.js`) | Random item, no colour choice, no white-brick power levels |
| Rubber band ±5 % after 15 s | `RF_rub`: up to +9 % / −20 %, the catch-up fades over the last 25 % (`src/98rf_race_fun.js`) | Ours is far stronger; Racers keeps the AI honest |
| Recorded AI lines in a lane width | Spline rivals + city-duel route builder with split routes (`src/98tk_city_duel.js`) | No lane width or wobble per point |
| Turbo ×1.47 vmax, grip ×1.5 | Drift-to-boost, boost meter, brickbash (`src/98k_boost2k.js`) | Fine; already richer |
| FOV 65, distance 20-30, lag 0.1/0.25 | FOV 62 +26 at speed (`30_race*`) | Close enough |
| 10×6×15 builder, 64 pieces, weight → stats | Garage builder, 250-brick budget, `GB_mods` (top −1.2 %, accel −3 % at full) (`src/92_garage_builder.js`), LDraw sets (`src/98ld*`) | Ours only penalises; Racers trades accel for top speed |
| Start grid, gantry, kerbs, chevrons | Westend `?proto=1` start + first 380 m (`src/98pr_proto.js`) | Has visuals; no track gimmick, items not coloured |

## 4. Rebuild plan: ONE race (the Westend proto stretch), with our own code, every piece from our garage builder
Each step is a 45-60 min lane behind `?proto=1`, with a GO assert and one 852×393 phone shot. They are ordered by visible impact.

1. **Colour bricks + white stacking (medium).**
   - Build the 4 pickups as garage-builder models: a red, yellow, blue or green 2×2 brick tower with a stud crown. White pickups are 1×1 bricks.
   - Map our existing items onto the colours: red = missile, yellow = mines/web, blue = shield, green = turbo.
   - White bricks stack to 3 and set the level: missile → twin homing; shield 4/6/8/10 s; turbo 1/1.5/5 s.
   - HUD: one colour slot + 3 white pips, ≥ 12 px, clear of the controls.
   - Respawn 3 s, white home after 10 s.
   - GO: pick up green + 2 white → turbo lasts 5 s ±0.1.
   - Shot target: two coloured brick rows in frame + HUD slot reading "GREEN ●●○".
2. **Rivals as garage-built cars on lane-width lines (medium).**
   - The 4 grid rivals get 4 distinct LDraw/garage presets.
   - Each route point gets left/right width (from road w). Rivals wobble inside it, with an offset decay ~0.002/ms.
   - Item use: roll per driver at 0.2-1.0 every 150 ms. Red fires only inside a ±16° cone.
   - On this stretch only, swap `RF_rub` for the Racers band: off for 15 s, then ±5 %.
   - GO: the spread of rival lateral offsets is > 1.5 m, and the band stays within 0.95-1.05.
   - Shot target: 3+ distinct rivals within 30 m, side by side, mid-stretch.
3. **One track gimmick + a data-described stretch (high: new hazard + data shape touch 4+ modules).**
   - Put the stretch into one JSON "race file" like `.rab`:
     - grid slots
     - brick spots (colour + respawn)
     - hazard list (type, trigger radius, period)
     - sky keyframes
   - `98pr_proto.js` builds from that JSON.
   - Add one hazard built in the garage builder: a swinging red-brick hammer on the bend (period 3 s, trigger radius 25 m). A hit means a 0.6 s spin-out and −30 % speed.
   - GO: the hammer hits the player at least once in 5 bot laps, and the race never stalls.
   - Shot target: the hammer mid-swing over the kerbs, with the gantry in view.

Not taken: the warp portal, curse and ghost (low value on a 380 m stretch), and the 64-piece cap (ours is 250 and works).
