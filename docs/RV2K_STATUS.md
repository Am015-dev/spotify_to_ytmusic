# RV2K status (2026-10-16, built page out/rv2km = od-int2 e5e1dd3, software GL, fake-clock driver for long GOs, each GO run alone)
| # | item (GO) | measured | |
|---|---|---|---|
| 1 | race-handsoff | finished 2nd, race ended (<240 s) | ✅ |
| 2 | walls | Frankfurt 5.0 hits/min, lowest health 65; Athens 8.0/min, lowest health 55 (target ≤1.5/min; health never 0 holds) | ❌ |
| 3 | stuck | spot 1 moves 5.1 m in 1.4 s ✅; monkey rerun 6 sim-min/city: 9 stuck in 11.9 min = 0.76/min (was 2.9; target ≤0.3). 5 of 9 are one Athens cluster x 1650–1980, z −1440…−1740 (same area as the foliage/camera hits); 2 at Fra 8012,7054 (y 1270, off-map hill) and Fra 808,2639 | ❌ |
| 4 | objectives | max 2 widgets at once, 0 popups while moving | ✅ |
| 5 | devui | 0 px² over centre 60 %, 🐞 clear | ✅ |
| 6 | garage-car | ride 13 % of screen, 7 cards in view | ✅ |
| 7 | onboard | boot-1 profile (built page, software GL, real STORY path, page ms): script parse+boot 2.3 s → menu 5.3 s → STORY tap → roamLoad starts 9 s (xc chunks + slot) → ground/paving/Autobahn 10→25 s (CPU city build, ~15 s) → buildings/trees/traffic 25→30 s → street map 30→34 s → GPU warm-up 34→37.5 s → roamPost 37.5 s → first frame 10 s stall (program links) → intro cutscene 49 s. Done: GFX roam state applied inside the loader (GFX_pre), first-frame relinks 61→26 programs; intro at 47.3 s (was 49.0), roamPost→intro 13.6→9.9 s. Still ❌ vs ≤30 s: city build 15 s CPU + ~175 programs link serial at software GL | ❌ |
| 8 | drawer | 12/12 tiles pictured, 0 overlapping labels | ✅ |
| 9 | foliage | 13/120 = 11 % samples occluded (≤2 %); needs car→camera line-of-sight pull-in (see HANDOFF_world1) | ❌ |
| 10 | card | 20 words, goal 4× = HUD 4× | ✅ |

Gate: `node tools/unit/run.js` 0 FAIL (4665 pass, 13 known). tChkGo TAG=rv2k,life1,xf1,terrain: 45/53; async GOs are judged before they finish, so the table above uses each GO run alone. Other fails: xf1/grass and xf1/kerb (echo of other GOs' async lines), life1/people SLOW 10.6 s (load).
Why walls/stuck differ from the race-1 handoff (0/min, 96 health): not found in the time box. The GO drives with real WASD events and a fake 60 Hz clock; I did not bisect the TUNE flags. First thing to check: whether `TUNE.dmgGlance/dmgCap/dmgInv` are in the built `tune.json`, and hit positions (roamDamage hook is not reachable from outside the module; log from inside the GO).
New: GO `rv2k/walls-ath` (Athens road-follow).
