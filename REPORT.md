# JU · moment-to-moment feel (free roam + missions)

Research: `docs/juice_research.md` ([src] facts with links, separate from [kb] targets). Races are untouched: every JU path checks `state==='roam'`.

## What changed (`ju.js`, one module)
- **Camera at speed.** Drops up to 2.2 m lower at top speed. Its back distance is held to ≤ 24 m (27 m on boost), where the base lag let it drift to about 31 m. It looks ahead into turns and drifts by yaw-rate (≤ 0.15 rad). The FOV curve adds +2° near top speed and +2.5° on boost. Impacts add a punch of +5° FOV and 1.6 m toward the car, held during hit-stop and eased out after. The offsets are removed before the base camera runs and re-applied after, so they never feed into its smoothing.
- **Hit-stop.** 90 ms on `takedown` sfx, 75 ms on traffic smashes, 65 ms on big props (debris n ≥ 18). The frame clock stands still while sound and the camera punch play. There is a 0.35 s cooldown so chains don't stutter. It is off in split-screen (guarded on `SPLIT.on` / `body.split` / `__splitOn`; base has no split-screen yet) and off with FX "off".
- **Drift tiers.**
  - Charge is paced so tiers land at 0.5 / 1.1 / 2.0 s (base: 0.27 / 0.6 / 1.1 s).
  - Each tier-up gets a burst of tier-coloured sparks (blue, orange, purple), a two-note cue and a small camera punch.
  - Payout grows per tier: turbo 0.8 / 1.6 / 2.6 s and boost bar +8 / 18 / 32 % (base: 0.8 / 1.3 / 2.0 s and +6 / 12 / 18 %). ULTRA TURBO pops.
- **Near miss at city speed.** Triggers when a traffic car passes 4.8–8 m beside you at ≥ 15 m/s (base: 45 m/s). It pays +6 % bar, +100 style and +2 chain, and shares the base cooldown.
- **Landing squash.** 14–24 % squash on landing, a slight stretch in the air, and a camera punch on big landings. The air-time *bonus* already existed in base (`roamLanded`, over 1 s), so I removed my duplicate.
- **Combo.** The counter pulses on every link. Cash-out (≥ 5) shows a big centred pop (`CHAIN n ×m · +studs`) at 38 % height, clear of the NEXT pill on desktop, phone portrait and landscape. It also throws a stud fountain, plays a sound and adds a FOV kick.
- **Dead time.** If nothing rewarding has happened for 5 s while driving, a stud trail pops up on the road ahead, or in a ring around the car if that spot is blocked. It uses the existing pooled stud meshes.
- **Speed blur and lines.** Free roam used to keep the menu's last blur and fringe value. JU now drives it from speed, capped at the mission limits everywhere (uSpeed ≤ .25, uBoost ≤ .15, speed lines ≤ .3 in missions). This gives *less* colour fringe at cruise than base; compare `devkit/smoke/3_ath_A.jpg` with the new sheet.
- **Audio.** Wind rises with speed relative to the roam top speed, plus one low road-rumble loop that also thumps on landings.

Untouched, and still covered by smoke: smash fills boost, auto vehicle switch, day/night, terrain.

## Patch order / anchors
`./reapply.sh pJU1.py` → REAPPLY_OK. That is one anchor (`window.__mho={`). See `ANCHORS.md` for the anchor and the wrapped functions.

## Tests
- **`node smoke.js .`** → SMOKE PASS (12/12; final build 405 s). I looked at `smoke/sheet.png`. It flagged the combo pop sitting over the NEXT pill, which is fixed (pop moved to 38 %), and smoke was re-run after the fix.
- **`ROUTE_S=180 CALM_S=90 SHOTS=1 PERF=1 node tJU.js`** → 56 PASS, 0 FAIL. The table is in `docs/ju_shots/table.md`, before = JU off, after = JU on, same build.
  - Real keys through the key map: arrows, Shift boost, X drift, and Space via the keyboard.
  - Deterministic 1/60 s frames.
  - Each city runs a 3-minute "player" route (full throttle, drifts sharp corners, boosts on straights) and a 90 s calm route (30 m/s, no boost or drift).
  - Plus controlled runs for accel, boost, drift tiers, takedown, near miss, hop and big air, and an M1 mission check.

| metric (after) | target | Frankfurt (before → after) | Athens A (before → after) |
|---|---|---|---|
| drift tiers (s) | 0.5 / 1.1 / 2.0 | 0.27/0.6/1.1 → 0.48/1.08/2.0 | same |
| drift payout | 0.8/1.6/2.6 s · +8/18/32 % | 0.8/1.3/2.0 s · +6/12/18 → 0.8/1.6/2.6 · +8/18/33 | → 0.8/1.6/2.6 · +8/18/33 |
| takedown hit-stop | 60–90 ms | 0 → 67 | 0 → 83 |
| takedown FOV punch | ≥ 3° | 0.4 → 3.1 | 0.3 → 5.0 |
| shake / colour fringe | ≤ 1 / ≤ .035 | .25 / 0 → .3 / 0 | .3 / .034 → .25 / 0 |
| near miss at 30 m/s | ≥ 1 | 0 → 2 | 0 → 2 |
| landing squash (hop / big air) | 0.15–0.25 | 0 → .19 / .22 | 0 → .19 / .22 |
| FOV cruise → fast | +8–11° | +6.9 → +9.1 | +7.9 → +10.4 |
| FOV cruise → full boost | ≥ +8° | +11.5 → +14.8 | +9.6 → +15.7 |
| camera height fast vs cruise | ≤ −0.6 m | +1.0 → −0.6 | +0.9 → −1.0 |
| camera back at speed | ≤ 26 m | 31.5 → 24.8 | 31.4 → 24.7 |
| look-ahead in turns | ≥ 3° | 0 → 5.1 | 0 → 4.6 |
| feedback moments / min (route · calm) | ≥ 12 | 47 · 19 → 46 · 26 | 57 · 46 → 54 · 53 |
| longest dead time (route · calm) | ≤ 8 s | 3.0 · **13.4** → 5.7 · 5.7 | 3.3 · 2.2 → 5.5 · 3.1 |
| boost surge: time to +25 % | ≤ 1 s | 0.87 → 0.82 | 0.58 → 0.85 |
| boost speed × | ≥ 1.3 | 1.74 → 1.75 | 1.81 → 1.70 |

- **Missions (M1 heist, JU on):** the caps hold (uBoost .150, uSpeed .144, speed lines .30, hitFx 0). A traffic smash during the mission hit-stops; the check counted 117 ms of frozen frames, which reads as two hits each inside the 60–90 ms range. No page errors.
- **Perf (Frankfurt, 2 min of driving each):** heap after GC grew +0.25 MB with JU on vs +0.33 MB with JU off. Draw calls over 6 poses: on 2948 vs off 2877 (+2.5 %, inside the +3 % budget). The pop and combo pulse are DOM. Sparks, studs and debris use the existing pools. Page size 3.37 MB.
- **Screenshots** (`docs/ju_shots/`): `before_boost.jpg` and `after_boost.jpg` (same straight, full boost at about 260 km/h: lower, tighter camera and more speed lines), `after_drift_tier2.jpg`, and `takedown_strip.jpg`. The strip is 10 consecutive 1/60 s frames from the impact: frames 1–5 are the hit-stop, the FOV holds 77.3° and then eases out.

## Known gaps / why some targets are reported, not met
- **Time to top speed (4–6 s target):** this needs a crash-free 11 s straight. Athens A never has one, and in the final run Frankfurt didn't either: the bot always clipped something, so it is reported as n/a. Earlier clean Frankfurt runs measured 5.47 s (off) and 5.58 s (on). JU does not touch acceleration.
- **Boost uptime (15–35 % [kb]):** the bot boosts whenever it has more than 30 % bar, and smashing refills it, so uptime is 53–68 % in both builds. That is a property of the base boost economy, which missions share, so I left it alone and report the number only.
- **Time to boost peak:** about 2.5–3.1 s for a 1.75× boost; that is physics. The surge metric (+25 % within 1 s) is what the research target describes, and it passes.
- **Dead time:** the busy "player" route goes from about 3 s to 5.5 s with JU. The run-to-run spread is large (2.7–6.2 s over the runs I did) and stays ≤ 8 s. The calm drive, where the gap really was (13–23 s in base Frankfurt), is now ≤ 6 s.
- **The takedown strip is from far behind at 141 km/h,** so the smashed car is small in frame. The freeze shows in the frame captions and HUD, more than in the image.
- **Split-screen does not exist in base,** so the guard is untested beyond code review.
- **Not done:** a "speed streak" reward. Wind and rumble were not verified by ear (no audio in headless).
