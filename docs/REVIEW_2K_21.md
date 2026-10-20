# Review #21: game feel, measured (trunk od-int2 `ca2c66e`, built as `rv21`)

Lens: an arcade-racing art director and QA lead, comparing against LEGO 2K Drive, Forza Horizon and Mario Kart. Reviews r16 to r20 covered performance, heap and HUD fit, so this one looks only at **feel**. Each opinion below is turned into a target with a number that a GO check or bot can assert without graphics.

## How I measured
- **Drive bot** (`?test=fra&draw=0`, 1280×720, keyboard input through `K`, read through `__oc.ev`): samples speed, `camera.fov`, `RO.camB`, camera yaw lag, yaw rate, `CTL.steer`, drift slip (`RO.h − RO.vh`), `shake`, `fovKick`, speed-line opacity, `FX.uSpeed` and every `AU.sfx` call. Runs: 11 s full gas, steering at 18 and 111 km/h, handbrake drift at about 105 km/h, 4 s of boost, braking from 106 km/h.
- **Caveat:** this box runs at about 15 fps, so game time is 0.82 × wall time. All times below are in **game time** (from the global `T`).
- **Shots** (I looked at all four), in `docs/shots/rev21/`: 852×393 Frankfurt at rest and at boost, 402×812 Athens at rest and at boost. No text under 12 px was found at either size.
- **Steering at speed** is worked out from the code (`D24_shape` in `src/98d_drive24.js` and `maxR` in `src/71_roam_drive.js`, using live TUNE values: stLim 1.4, mu 15, WB 2.7, stAng .55, stFall 14, top 147 km/h). My 111 km/h run was too short to read a steady yaw rate, so the fix lane must confirm these numbers first.

## Numbers today
| What | Now | Arcade reference |
|---|---|---|
| FOV at rest → 113 km/h → boost at 178 km/h (landscape) | 66° → 80.8° → **103.6°** (+37.6°) | Forza Horizon / 2K Drive chase cam: about +8 to +12° in total |
| FOV in portrait, at rest → boost | 95.7° → 104.5° (vertical) | — |
| Car width on screen at boost, 852×393 | about 10 % of the width (shot `fra852_1boost`) | 2K Drive: about 20–25 % |
| Speed-line opacity in free roam | **0 in every sample** (only the race path sets it, `src/30_race3.js:217`) | Visible from about 70 % of top speed |
| Radial blur `uSpeed` | 0 → 0.25 at boost | — |
| 0–50 / 0–100 km/h | 2.0 s / 4.3 s | — |
| Braking | 106 → 66 km/h in 1.0 s (about 1.1 g) | ✅ |
| Steering ramp to full lock at 18 km/h | 0.32 s | 0.15–0.20 s |
| Camera yaw lag at 18 km/h | settles at 0.12 rad (7°) after 0.4 s (camK 6.67, τ 0.15 s) | ✅ Forza-like |
| Chase distance pull-in, 0 → top speed | 7.5 → 7.1 m | ✅ |
| Yaw rate at 50 / 100 / 150 km/h (derived) | 1.10 / 0.33 / **0.14 rad/s** (turn radius 13 / 84 / **294 m**) | 2K Drive keeps cars turnable at top speed (radius about 150 m or less) |
| Drift slip angle | 3° at entry → 25° only after **1.3 s** → 39° after 2.3 s | Mario Kart / 2K Drive: full drift angle in about 0.3–0.4 s |
| Touch drift | GAS + BRAKE + steer held together (`src/98k_boost2k.js:27`); no DRIFT button in either shot | One button or one gesture |
| Sound cues | `pick` fired 5× in one frame and 14× in 0.6 s; `crash` + `takedown`, and `whoosh` ×2 + `brick` ×2, fired in the same frame | One trigger per cue per 70 ms; pitch rises along a pickup chain |
| Hit feedback (takedown at 105 km/h) | crash + takedown sounds, `shake` up to 0.35, no hit-stop | Burnout / 2K Drive: 50–80 ms hit-stop and 0.4–0.6 shake |

## Ranked fixes (player-visible impact per cost)

### 1. FOV overshoot: the car shrinks to a dot at boost
- **What's wrong:** speed and boost FOV stack to +37.6° (66° → 103.6°). At 852×393 the car falls to about 10 % of the screen width and the street bends into a fisheye (`fra852_1boost.jpg`). The cause is `roamCam` in `src/71_roam_drive.js:301`: `fovSpd*W + 7*W²` (capped at 24, with W up to 1.4 on boost), plus 6 for nitro, plus `fovKick*.6` (the boost kick is 9).
- **Target:** at most +10° at top speed without boost; boost adds at most +5°; the total stays at **≤ +15° over the resting FOV** (≤ 81° in landscape at the default setting). The car stays at **≥ 16 % of the viewport width** at boost on 852×393.
- **Assert (no graphics):** GO `feel/fov`: hold gas and boost for 4 s and record `camera.fov − fov0` (max ≤ 15). Project the 8 corners of the player car's bounding box with `camera`, and check box width ÷ `innerWidth` ≥ 0.16 at 852×393.
- **Model:** Sonnet (tuning). **Effort:** S (about 30 min, TUNE values and one line).

### 2. Speed lines never show in free roam
- **What's wrong:** `speedLines` opacity was 0 in all 2,000+ roam samples (3 bot runs). Only the race camera drives it. After fix 1, speed has to come from lines and blur instead of FOV, so ship 1 and 2 in the same deploy.
- **Target:** opacity 0 below 60 % of `RO.top`; it rises to **0.15–0.30** between 80 % and 100 %; boost adds 0.12. It fades in about 0.3 s.
- **Assert:** GO `feel/lines`: at rest the opacity is 0; after 4 s of gas and boost, opacity ≥ 0.15 and `speedLines.mesh.visible` is true in the roam scene.
- **Model:** Sonnet. **Effort:** S.

### 3. Drifting on touch needs three inputs at once
- **What's wrong:** in free roam a touch drift needs GAS **and** BRAKE (pressed while GAS is held) **and** steer. The arrows sit under the left thumb, so the right thumb must cover GAS and BRAKE through the "seam". Neither phone shot shows a DRIFT button (`#tD` exists in `src/00_page.html:214`). Drifting is the game's core skill (mini-turbo tiers, DRIFT KING, the "DRIFT HERE" quest seen in the portrait shot), and a phone player can barely reach it.
- **Target:** a touch drift starts with **≤ 2 simultaneous touches** (steer + one drift input) at ≥ 43 km/h (`B2K_DMIN` 12 m/s). `RO.dDir ≠ 0` within 0.15 s. The button is visible at 852×393 and 402×812, and the GO ui/hud-clear check still passes.
- **Assert:** GO `feel/touch-drift`: dispatch `touchstart` on ▶ and on the drift input at 60 km/h, then check `RO.dDir` within 0.15 s. Reuse the rect test from ui/hud-clear for overlap.
- **Model:** Sonnet (UI). **Effort:** M.

### 4. Understeer at speed: the car can't take a city corner above about 100 km/h
- **What's wrong:** the grip limit in `D24_shape` (`k = atan(stLim·mu·WB/v²)/dm`, minimum 0.12) multiplied by the `maxR` speed falloff gives a yaw rate of 1.10 rad/s at 50 km/h but only **0.14 rad/s at 150 km/h**: a 294 m turn radius at 0.6 g. A city block is about 100 m, so above about 120 km/h you can only go straight or drift. Also, in one 111 km/h sample, `CTL.steer` rose to 0.16 and then **fell back to 0 after 0.25 s while ▶ was still held**; repro this before tuning.
- **Target:** at steady full lock, yaw rate **≥ 0.45 rad/s at 100 km/h** and **≥ 0.25 rad/s at 150 km/h** (radius ≤ 170 m, about 1.0 g); 50 km/h stays at 0.9–1.2 rad/s; steer reaches 90 % of its target in **≤ 0.20 s** (now 0.32 s at 18 km/h).
- **Assert:** a unit test in `node tools/unit/run.js` that feeds `D24_shape` and the `maxR` formula with v = 14 / 28 / 42 m/s and full input, and checks the yaw-rate bands; plus GO `feel/steer`: hold speed with a cruise hold (set `RO.v` each frame) and hold ▶ for 1 s in an open plaza, then read the mean `RO.yr` over the last 0.5 s.
- **Model:** Sonnet (tuning, with measurement first). Move it to Opus only if two Sonnet lanes miss. **Effort:** M.

### 5. The drift takes too long to "snap" in
- **What's wrong:** after the handbrake drift starts, the slip angle is 3° at entry and reaches 25° only after **1.3 s**; it peaks at 39° at 2.3 s. Mario Kart and 2K Drive snap to the drift angle almost at once, so the drift reads as a deliberate move. Today the mini-turbo tier 1 (0.5 s) fires before the car looks like it is drifting.
- **Target:** slip angle **≥ 25° within 0.40 s** of `RO.dDir` being set, held at 30–45° while steering into the turn. Exit back to < 5° within 0.35 s of release.
- **Assert:** GO `feel/drift`: at 70 km/h, set handbrake + left, sample `|angDiff(RO.h, RO.vh)|` at +0.4 s (≥ 0.44 rad) and at +1.5 s (0.52–0.79 rad), then release and check < 0.09 rad at +0.35 s.
- **Model:** Sonnet (tuning `TUNE.drSlip` / `drGrip` and the `RO.vh` follow rate). **Effort:** S–M.

### 6. Sound cues stack into noise
- **What's wrong:** on a stud run, `pick` fired **5 times in one frame** and 14 times in 0.6 s. `crash` + `takedown` and `whoosh` ×2 + `brick` ×2 also fired in single frames. On phone speakers this sounds like clipping, not a reward.
- **Target:** each cue fires **at most once per 70 ms**, with at most 3 voices of one cue at a time. A pickup chain raises the pitch by one semitone per pickup, up to +12, and resets after 0.6 s (the Mario coin / 2K stud pattern).
- **Assert:** GO `feel/sfx`: wrap `AU.sfx` and drive the stud-rush start for 10 s; check that no cue repeats within 70 ms. A unit test on the limiter covers the pitch chain.
- **Model:** Sonnet. **Effort:** S.

### 7. Smash and takedown impacts have no punch
- **What's wrong:** a takedown at 105 km/h plays two sounds and `shake` ≤ 0.35, with no hit-stop and no FOV punch. The game's tagline is "HIT FAST = SMASH" (hint on the start screen), but the hit doesn't land.
- **Target:** a takedown at ≥ 80 km/h gives a **60 ms hit-stop** (sim time scale ≤ 0.2) followed by `shake` 0.45–0.6 that decays in ≤ 0.3 s, plus `fovKick` ≥ 6. A small bump (< 40 km/h) stays below 0.2 shake with no hit-stop.
- **Assert:** GO `feel/hit`: drive into a seeded traffic car at 100 km/h and record the sim-dt dip (one or more frames with scale ≤ 0.2, total ≤ 80 ms) and the `shake` peak within 0.1 s.
- **Model:** Sonnet. **Effort:** S–M.

## Checked and fine (no lane needed)
- Chase camera: yaw lag τ 0.15 s, 7.5 → 7.1 m pull-in, crest and wall handling. It is in line with Horizon.
- Braking at about 1.1 g, and acceleration (0–100 km/h in 4.3 s) is acceptable.
- Collision sounds and shake exist (`roamBounce`: crash or bump, shake 0.3–0.7). The drift mini-turbo tiers and boost flames read well; in the portrait boost shot the flames and the radial streaks give the best speed feel.
- No HUD text under 12 px at 852×393 or 402×812. At boost the wrench pickup ring sits in the middle of the road view (minor).

## Order for the coordinator
Ship 1 and 2 in the same deploy (fix 1 removes speed feel; fix 2 brings it back). Next do 3, then run 4 and 5 as one Sonnet lane pair (both are handling: measure first, then tune). 6 and 7 are small and independent.
