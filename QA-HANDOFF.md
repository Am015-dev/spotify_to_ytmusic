# od-qa handoff (branch alex/od-qa)

Read QA.md first: ranked issues, evidence and before/after numbers for pQA1–3.

## Patch order (on alex/od-release-82 RELEASE.md)
```
ORD="pAU1.py pAU2.py pOG1.py pOB1.py pOB2.py pOB3.py pOC1.py pCV1.py pCV2.py pRL1.py pJU1.py pRL2.py pGB1.py pDR1.py pDR2.py pSC1.py pSC2.py pSM1.py pSM2.py pSM3.py pSM4.py pSM5.py pSM6.py pRL3.py pRL4.py"
./reapply.sh $ORD pQA1.py pQA2.py pQA3.py pQA4.py pQA5.py pQA6.py pQA7.py pQA8.py   → REAPPLY_OK
```
pSC2.py, sc2.js, pRL3.py and pRL4.py are copies from alex/od-scale and alex/od-release-82, kept here so the test build is reproducible.

| patch | status | what |
|---|---|---|
| pQA1 | tested (QA.md) | round collider corners (bHit) |
| pQA2 + qa.js | tested | phone HUD layout, map above tracker, camera guard in every city (must stay the outermost roamCam wrapper), no keyboard hints on touch |
| pQA3 | tested by a smoke run | double-tap BRAKE parks only below 15 km/h |
| pQA4 | **partly tested** | missions: goons/van rubber-band to the player, stop at route end while you are within 300 m, wider ram window (8.5 m / 8 m/s), +30 % stage time, drift-zone easing (drift from 50 km/h, 1.8× points, +30 % window) |
| pQA5 | **untested** | Athens density: keeps 2/5 of the traffic and 5/9 of the small street props |
| pQA6 | **untested** | phone ❚❚ opens the pause menu; HUD text ≥ 12 px on touch |
| pQA7 + qa7.js | **tested** (tPlay rotation check: before ◀ ▶ "NO RESPONSE", after all ok); sent to the integrator | rotation-proof touch: stale touch ids dropped, layout re-run after rotation |
| pQA8 + qa8.js | **check running at handoff** | minifigs tagged and clamped to 1.85 m if > 2.2 m, `window.__qaHumans()`; only the nearest otg2 event ring drawn; marker ground rings hidden beyond 160 m |

## Open items (what to do next)
1. **Missions winnable.** With pQA4, the debug driver got through Hot Drop stages 1–4. It then failed stage 5 "Drift home" at 4/420; the drift easing landed after that run. Re-test Hot Drop and Koulouri Rush, then the rest of chapter 1 in both cities.
   tPlay's driver weaves with DRIFT held when the tracker asks for drift points.
2. **Athens density** (pQA5) and **12 px text + pause button** (pQA6). Confirm with tPlay that:
   - smashes are about 6–8 per minute
   - there are 1–2 cars within 120 m
   - the new "no HUD text under 12 px" gate passes
   - no HUD element overlaps a touch control
3. **Athens wall hits under 1 per minute.** Still 7.6–12/min on v83 without pSC2.
   - The phone half of the run **with** pSC2 (v83 + pSC2 + pRL3/4, no pQA, older tPlay) is in:
     - Frankfurt: 0.98 wall hits/min.
     - **Athens: 2.96 wall hits/min** (down from 9–12 without pSC2), 0.8 % stuck, 6.7 smashes/min, **18.6 cars within 120 m**. The traffic density needs pQA5.
     - The desktop half did not finish.
   - If it is still over 1/min, try in this order, then measure again:
     - a wider setback (SC_K.sbA in sc2.js)
     - shrink Athens colliders: `hubAddB({…hw:w/2-.3…})` in the Athens `put`
     - a gentler glance angle (SC_K.glance 35 → 45)
4. **Giants and rings.** Quick check on the full pQA1–8 build (phone, 1 game-minute per city, `qa/tPlay_pQA1-8_phone_quick.json`):
   - Tallest humanoid: 1.86 m. Pedestrians 1.84 m, seated garage driver 1.6 m, moped goon rider 1.86 m. PASS.
     No quest/marker minifig was within 160 m during that short drive, so marker figures still need an in-world measurement.
   - Rings on screen: Frankfurt max 0. **Athens max 4, average 2.7: FAIL.** Find which torus meshes are still visible in Athens (probably ATC/quest marker rings at 12 m, or district gates) and thin them.
   - Rotation check: PASS. Console errors: 0.
   - Same quick run: Athens 2.93 wall hits/min, Frankfurt 11.6 % stuck (1 minute only, not significant).
   The earlier part of this item: tPlay gates: tallest humanoid ≤ 2.2 m (from `__qaHumans()`), and ≤ 3 rings on screen while free-roaming. Add the phone screenshot strip of each humanoid type next to the car to QA.md.
5. Once all of the above passes, send the integrator the final patch list and the coordinator the tPlay before/after table.

## Running tPlay (the release gate)
```
python3 tools/split_km.py local_dbg.html <dir>/sp && mv <dir>/sp/overdrive.html <dir>/local_dbg.html && mv <dir>/sp/km.js <dir>/   # split build
(cd <dir> && python3 -m http.server <port> &) ; ln -s $PWD/node_modules <dir>/node_modules
MIN=5 node tools/tPlay.js http://127.0.0.1:<port>/local_dbg.html <outdir>
```
- Env: `MODE=phone|desk|both`, `MIN` = game minutes per city, `CITIES=fra,ath`, `THROTTLE=4`, `SHOTS=0|1`.
- `DEBUG=1` prints the driver state every 3 s. Mission progress shows in the `qt` field.
- Cost: one MODE=both, MIN=5 run takes about 85 min of wall-clock when two runs share the box. MIN=1–2.5 is enough for a quick check.
- It writes `<outdir>/tPlay.json` plus screenshots.
- Gates:
  - wall hits ≤ 1 per minute
  - stuck ≤ 3 %
  - 0 console errors
  - 0 page reloads
  - 0 Athens loading screens
  - pedestrians ≤ 1.2× adult scale
  - tallest humanoid ≤ 2.2 m
  - ≤ 3 rings on screen
  - no HUD over touch controls
  - no HUD text under 12 px (phone)
  - no collider on the road
  - camera inside a building ≤ 2 %
  - rotation check: every control answers after 3 rotations

## Pitfalls (each cost a run)
- **CDP multi-touch:** a finger that is merely missing from a `touchMove` is NOT lifted. tPlay lifts all fingers and re-presses the others after 440 ms of real time (game time is frozen meanwhile). Re-pressing faster than 320 ms real is the game's double-tap PARK/roll gesture.
- **Time:** tPlay drives `requestAnimationFrame` itself (`window.__tick`). Do not use `roamSim` in tPlay, and don't count real time as game time.
- **Killing tests:** never `pkill -f "...tPlay.js..."` or `pgrep -f` with the script name in the same shell command. It matches the shell itself and kills your own command (exit 144). Save PIDs to a file instead.
- **Reloads:** the page can reload under the player (e.g. an Athens district fallback). tPlay merges the stats across the reload and fails the "never reloads" gate.
- **Desktop pause:** use MENU (#roamExit) → RESUME. On the phone ❚❚ opened Settings before pQA6.
- **Build file:** `reapply.sh` overwrites the tracked overdrive.html. Run `git checkout overdrive.html` before committing.
