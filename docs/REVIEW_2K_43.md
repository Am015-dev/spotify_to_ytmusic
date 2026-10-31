# REVIEW_2K_43: og1 (one game S1: the builder DRIVE uses your roam car), commits 1a70ae9..8771115

**Verdict: FAIL on feel, so NOT ON in the next deploy.** The code is safe to keep in trunk behind `?og1` (flag OFF unchanged, gates not worse), and the GO `onegame/builder-car` passes. But S1's own goal ("it is his car with his handling") is not met: it is his car and his buttons, on the builder's own physics, with a slower launch and a different camera.

Built page out/rev43 (3,454,074 B, +31 B), phone profile (iPhone UA, 852x393 touch), 1x and 6x CPU.

## 1. Diff
- **Flag OFF**: the behaviour is the same as before. `BX_car` still caches the old mesh (`!BX.carT`), `BX_step` factors are ×1, `BX_camDrive`/`BX_input` are unchanged, `bx-o-btn`/`fs-btn` use `BX_dBtns()` (it returns `BX_DRIVE_BTNS` when OFF), and `SKC_fv` is a pure extract of the old FOV line. There is one side effect when OFF: `BX_driveStop`/`BX_close` always call `BX_ogShow(false)`, which sets `#touch.hidden=true`. After closing the builder in the city, the roam controls stay hidden until the next touch, when the 40_hud touchstart handler shows them again (measured: state roam, `#touch` hidden after close). This is minor, but it is a change with the flag OFF.
- **Flag ON: builder-only paths that are still used.** The physics is still **`BX_step`** (builder integrator: linear power curve `acc·(1−v/top)`, its own yaw/grip model, no drift). Only the numbers are swapped for roam's (top 40.7, acc 8.6, grip). The camera is a new `BX_ogCam` that copies the roam chase/SKC maths but not roam's height and distance layers. Input is the shared `ctlPlayer` + `#touch` (good), with `BX_input` keys added on top; `c.drift` is ignored. The builder HUD is still the builder's own (S3 is planned for that).
- The shipped lazy chunk `99c9og_onegame_go.js` exposes `window.__og.ev` (an eval hook) on the live page. It is test-only, so keep it out of the live page or accept it like the other GO chunks.

## 2. Feel (one paragraph)
With real CDP touch on the phone profile (hold GAS + ◀/▶, 60 s each; SwiftShader ran only about 8 s of game time per minute, so a real-iPhone play is still needed), the builder with `?og1=1` is plainly the red hot-rod from the city. GAS and BRAKE are in the same thumb spots, and the cyan BOOST appears when it is ready. It also needs GAS held, exactly like roam (the `city` throttle setting is pedal-in-roam), while the OFF builder auto-gasses. That is consistent, but it is new for builder players. It does **not** drive like the same car. In game time with gas held, roam (real `roamStep`) reaches **6.6 / 13.8 / 20.5 / 31.7 / 42.5 m/s at 1 / 2 / 3 / 5 / 8 s**. The ON builder reaches **9 / 15 / 17 / 22 / 25 m/s** (OFF: 17 / 24 / 25 / 30 / 42). So the launch is about 17 % slower at 3 s and 30-40 % slower at 5-8 s. **The gentler launch is a bug, not the piece grip.** The acc is the same 8.6, but `BX_step` uses the linear power curve `(1−v/top)` where roam uses `(1−(v/top)^W13S.cp)` with cp = 2 (plus the C26 throttle ramp). The old builder hid this with acc 22. There is also no drift in the builder (roam has DRIFT). On camera, I measure the ON camera **further back than roam** (horizontal distance 8.6 m vs 6.0 m on average while driving; 7.5 vs 6.4 m at rest). In the shots the car is about 105 px wide at rest vs 180 px in roam. Height relative to each car's anchor is +0.3-0.5 m in my measurement; the worker reports −0.35 m against a different anchor. Either way the framing is not roam's. FOV matches (66° → 70°). Off the deck, on grass, the car floats visibly above its shadow (3b shot).

## 3. Gates (BUILT page, phone profile)
| check | flag OFF | flag ON |
|---|---|---|
| unit | 0 FAIL (5019 pass) | same build |
| TAG=onegame (`onegame/builder-car`) | measured inside the GO (it runs OFF and ON) | **PASS at 1x and 6x CPU** |
| default gate (`why,life1,xf1,terrain`) | 75/78 batch: why/hud6 ×2, why/quiet-dirt#1 | 75/78 batch: why/hud6 ×2, why/speedfeel#1 |
| solo re-run of those misses | 6/6 | 5/6 (why/quiet-dirt#1, which also failed OFF and on trunk per the worker: trunk flake) |
| builder GOs (bx*, via the GO runner) | 26 items spawn-only (by design they say "run tools/bx/tTracks.js"), 0 errors | identical: spawn-only, 0 errors |
| tools/bx/tTracks + tOpen (real touch) | timed out at 40 min each under SwiftShader in this container: no verdict from me (the worker reports all ✔ OFF and ON) | same |

The hud6 misses are load flakes: they fail OFF too and pass solo. They are not og1's, but rule 15 applies: why/hud6 portrait ("stopped again: boost + bar gone") and why/quiet-dirt#1 need an owner.

## 4. Shots
docs/shots/rev43: 1_roam_*, 2_builder_OFF_*, 3_builder_ON_*; what I see is in SEEN.md.

## To ship ON (one SONNET lane, about 60 min, then ON at the next deploy; rule 11)
1. **Launch = roam.** Under og1, `BX_step` uses roam's power curve `acc·(1−(v/top)^W13S.cp)` (plus the C26 throttle ramp, or a shared helper exported from 71). Add to the GO: v at 3 s and 5 s from standstill with gas held within ±10 % of `roamStep` (today 17 vs 20.5, 22 vs 31.7).
2. **Camera = roam.** Port roam's chase distance and height layers into `BX_ogCam` (or share the function). GO: at the same speed, camera distance and height behind the car within ±0.3 m of roam, and the car's on-screen width within ±10 % (today 105 vs 180 px at rest).
3. **Car sits on the ground** off the deck: the gap between the wheels and the ground is ≤ 0.15 m on grass and on the deck (the roamPose lift `1.6·hover−0.5` with the shadow at gy+0.08 shows a visible float). Also leave `#touch` as it was on `BX_close` when the flag is OFF.
