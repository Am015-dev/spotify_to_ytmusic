# HANDOFF race17 (race worker 17, 2026-10-07): race15 rework → ONE combined review

Branch `alex/od-race15` (race15 a+b+c) with live v87r src merged in (garage8a 5c23efb8 = live 528b4ab, LIVE_OK byte-compare).
Coordinator session_017iH3DB4VyxwKSdMwsco4Ut, reviewer session_01Y6FYerWwxv43FuKUcaUT4v. Workers never run deploy.sh.

## What changed in src (on top of race15)
- `30_race.js`: R17 rail cushion (player, races): within 1.5–4.5 m of a wall/island while sliding toward it, slip + heading ease parallel and speed scrubs a little. Never pushes away.
- `30_race.js`: race rubber band (R15_on, not arena): pull toward the player (+13 % at 260 m behind, −5 % when far ahead) + toward the leader (+5 % at 400 m).
- `31_race_r15.js`: SHORTCUT boards are overhead cantilever gantries from outside the barrier, 30×10.3 m, 9 m clear, yellow on black (`R15_signTex`, `R15_mesh`).
- `98z_race_items.js`: WEB overlay (#v85web, owned by 96) restyled from 98z via `getElementById` (96's `const V85W` is NOT visible from 98z: first try failed silently): centre only, z-index 2 (under HUD/controls), blind only for the first ~2.6 s of the 4.5 s slow.
- `98z_race_items.js`: SHIELD bubble in races = rim-only fresnel shader (`R17_SH`). Root cause of the "ghost boat": the GHOST item (car clones at opacity .35, gone from the race set since slice c) AND the solid-looking additive shield ellipsoid (seen as a teal disc over the car from above; shot r17a/grand_phone_sign_dirt before the fix).
- `ORDER`: 98x, 98t (live) then 98z.

## Tools
- `tools/r17probe.js` (used by tRace, `R17=0` to switch off): pack (ships' dist), ray tyre gaps from each tyre's LOWEST VERTEX along −road normal (the old box method read −0.2 m on 8–11° banks: rotated-AABB artefact), horizontal wall rays minus local half width.
- `tools/tRace.js`: RACE_RESULT adds `pack{t15,t30,t60,t90}`, `overtakes`, `plPlaceChanges`, `wallClearMinPerLap/P10/Med`, `tyreRay`, `aiTyre`. `R17SHOTS=1`: grid (front/back), beside_ai + side_low, tightest-corner strip (entry/apex/exit + R17 corner log), assist test (1.5 s hands-off, 1 s steer away), web hit on the player (0.3/2.2 s), hard brake after 75 s (trace + stop distance). `HQ=1`: shots render at 852×393 instead of fast mode's 426×196. `DIAG=1`: tyre diag.
- `tools/r17sum.py bench.txt…`: per-track means.
- Servers: :8766 repo (stack), :8767 `../wt_live` (live v87r src, `tools/build.sh live --local`).

## Numbers (fast mode, real touch, 2 runs/track unless noted)
| | live v87r | stack |
|---|---|---|
| walls/min grand / hafen / akro | 2.13 / 1.21 / 2.66 | 0 / 0.26 (6 runs) / 0 |
| pack 1st→last t15/t30/t60 grand | 128/336/644 | 208/336/618 |
| hafen | 165/296/260 | 172/194/204 |
| akro | 172/190/430 | 250/298/408 |
| overtakes / player place changes | 50–57 / 13–20 | 33–48 / 5–19 |
| wall clearance P10 / median (m) | −0.2…−1.7 / 1.1–3.3 | 0.5–3.0 / 9–12 |
| tyre ray p50 / min (m) | 0.006 / −0.1…−0.23 | 0.003 / −0.1 (plane gap 0.000) |
Hard brake: stack grand 226→0 in 183 m (hit from behind mid-way), akro 211→0 160 m 5.8 s; live grand 208→0 164 m 5.95 s.
Benches: qa_race/live17b, qa_race/r17a (gitignored scratch; review copies go to docs/shots/race17/).

## State / next
- Fixes for sign mirroring and the web overlay rebuilt at 15:5x; grand HQ rerun → qa_race/r17hq/grand_* (LOOK at web_hit + sign shots).
- Then: copy shots to docs/shots/race17/, commit, send ONE REVIEW. After PASS: rebuild on CURRENT live, OD_CHANGELOG entry, out/<next ver>, DEPLOY to the coordinator.
