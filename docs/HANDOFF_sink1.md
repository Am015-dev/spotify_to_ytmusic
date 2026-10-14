# sink-1 (2026-10-14), alex/od-int2: "the sinking is still not solved at the beginning of the game" (Alex, beta.56)

## Why every earlier fix "passed"
All sink checks (OF_sinkChk, OF_parkChk, OF_dropRun, matrix tyre gap, qa wheel_gap) measure the tyres against `groundAt` (the physics ground).
The player sees the DRAWN surface. At the real starts the drawn surface was above `groundAt`, so the tyres read +0.03 m while they sat 0.3 m deep.

## Root causes (all fixed)
1. **v85 start ribbon** (`v85Road`, src/96_scale_qa.js): on every quest start (Hot Drop too) a 16 m asphalt ribbon at `groundY + 0.34`, visual only,
   from when Hot Drop began on bare paving. The real road is there now → tyres 0.32 m inside the ribbon (side shot: asphalt a third up the wheels).
   Ribbon removed; the "face down the route, rolling" start is kept.
2. **Jump ramps** (`addRamp`, src/70_roam_world.js): the 0.6 m box was centred on the slope line `roamTerr` drives on → drawn top 0.30 m above it.
   Box now hangs below the line (top = driven slope, lip flush with the road). Affects every ramp in both cities.
3. **Athens start on the LIFE "AIR TIME" kicker** (lazy models/lx.js, 2068,-1640): the kicker registers its RO.ramps pair seconds AFTER the spawn settled
   (the "ground changes after settle" case); the parked car ended on its edge, two tyres inside the red side rail (-0.33 m).
   `LIFE_kick` (src/assets/lx/code.js) no longer places kickers within 35 m (+ half length) of a garage marker; `roamPost` and any later change of
   `RO.ramps` under a parked car outside a job run `RO_clearRamps` (src/98sk_start_sink.js), like `roamWarp` already did.
4. **Hot Drop parachute landing** (src/80_story_m1.js scene tick): landed car held level on the 5 % slope for the rest of the scene (front -6 cm, rear +11 cm).
   Now lands on `groundAt` and `CR_carPose` settles the wheels each scene frame.
5. **Story vehicles** (`M1_put`: Hilde's tow truck, Kaiser, goons) were set level at the ground under their centre: on the Hot Drop slope the truck's
   front tyres floated 22 cm, rear 12 cm in the road. `SKS_seat` (wrapper on M1_put) tilts them to the ground under their wheels, lowest tyre +3 cm.

## Tests
- Shots (852×393): qa_sink1/fra_start_side_beta56.jpg (asphalt a third up the wheels) vs fra_start_side_fixed.jpg.
- Checklist `sink1/start-sink-fra`, `sink1/start-sink-ath`, `sink1/sink-spots` (src/98sk_start_sink.js, SKS_*). Measures tyres vs `groundAt` AND vs the drawn
  surface: `SKS_pic` = orthographic height picture straight down (16-bit depth), vehicles/traffic instances/fx hidden, window 0.5 m above the tyre bottom.
  (A raycast can't be used: the live page frees CPU geometry after upload.) Pass: player 0..0.05 above ground (-0.02 allowed), traffic ≤ 0.10 (4-corner seat on camber),
  nobody deeper than 0.08 (traffic 0.12) in the drawn road (asphalt is drawn +4.5 cm FRA / +6 cm ATH over `groundAt`, +2 cm strip interpolation).
- tChkGo honours a GO's `secs` budget (start-sink fra 75 s: the full parachute scene + 15 s).
- Real boot, no test flags: `node tools/sink/tStart.js <page url> <outdir> fra|ath phone|desk 15` (taps STORY → NEW GAME; same SKS measure, injected
  into older builds). ~5 min per run in software GL.

## Not mine / open
- Athens asphalt is drawn +6..+10 cm over groundAt; scooters (#scoot) and parked LDraw vans sit on the ground line (no +3 cm seat): up to 10 cm into the road.
- Kerb-parked traffic may put a tyre on the 25 cm kerb-stone strip (fra 2003,-12: -0.27): listed as a warning by the GO.
- In software GL the GO's GAS phase drives only 3-6 m (the height pictures slow the game loop); the real-boot tool drives ~100 m.
- LIFE kickers sit in traffic lanes; traffic uses groundY there and drives through the wedge (not at the starts any more).
- life1/smash FAILs on beta.56 too (pre-existing). Athens console error 'Cannot read properties of null (reading 1)' on beta.56 too.
- Kerb-parked traffic straddles the kerb line (Frankfurt 1967-1998, z 10-12): the 0.25 m kerb strip runs under the car middle (v90k/kerb-parked area).
- Coordinator matrix wheel_gap fra -2401,149 / -1921,149 (t_v7612_1, phone): not reproduced on current src (tyres +0.018, drawn -0.017; 637 roam starts 0 tyre fails).
