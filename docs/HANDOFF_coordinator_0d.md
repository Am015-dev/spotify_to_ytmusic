# Coordinator handoff (OD 0d -> 0e), 2026-10-22 ~03:15 UTC
Read CLAUDE.md first. Live = beta.150 (cc77a4e on alex/brave-carson-rbpmlk). Beta page https://claude.ai/artifact/P6zT2b2SwfHYguRTtb67Ug (v316 = beta.150).
## Alex's state (angry, scores 4.5/100)
Complaints tonight: invisible cars (FIXED beta.150), pass-through buildings (FIXED beta.148/149), cars change on camera turn (FIXED beta.150), popups/annoying quests (FIXED beta.150 quiet-start), empty/boring world, power-ups/races/speed below bad. Wants: benchmark vs LEGO 2K Drive (docs/BENCH_2K.md, docs/shots/library (INDEX.md; ref2k_* ids), mean ~3.8/10). Promise made: no docs/cleanup lanes until playable; every update names one thing to try and where. Never ask Alex.
## Shipped this session
beta.145 drive-first+terrain; 146 hud-cam+rv3a; 147 tr9-chunk; 148 A2 roadside buildings solid; 149 solid-bld r2 (sets, sloped floors, fence capsules); 150 solid-cars (phone draw-slot reuse = invisible/changing cars; HT_hit skips at nodes) + quiet-start (no Athens chapter card, no prompts >20 km/h, no buggy swap, street car grips dirt).
## Reviewed PASS, on trunk, not yet live
- c770768 xf1/water test fix (#33 PASS) -> ship next deploy.
- 0575445 cl-L1 core zone (#31 PASS), 216594b cl-L3 studs v2 (#28 PASS), 766be61 cl-L2 smash fix (#32 PASS): all behind ?cl= flags, default OFF.
## Blocking ?cl=core,studs ON for Frankfurt
perf/ios-reveal fra with flag: 1/4 PASS: one shader (stud coin material) compiles after reveal (programs 118->119 LATE, prewarm aborted 48/67). Fix (small SONNET): add coin material to prewarm, rerun ios-reveal x3 (need 2/3 green), then flip core,studs default ON for fra and ship.
## Running lanes
- speed-boost-feel-r22e4 OPUS session_011Af3Qyk5PucscAdG2Z5HY4 (FOV/streaks/boost VFX).
- glossy-cars-r22e5 OPUS session_01FKduDh2eanJ3roe1tJfaNv (shiny ABS cars, env map).
- Reviewer OPUS session_018PMBBNkPqRVd3jzKrBcA2d (reviews numbered; next #34).
## Queue (Alex priority order)
1 coin prewarm + flip core,studs ON (above). 2 smash look r3 (L2 worker session_01UAb7bjravewPeYqhETsM1M): wider sideways fan, smaller bricks thrown further, bright gold studs arcing over the car, remove +60-90 ms spike on smash frame at 6x; then flip ?cl=smash ON. 3 NC_hid guard: treat zero-scale matrix at the car's slot as hidden for contact (alive scale-0 car = stale matrix after respawn = invisible solid car); why/solid-cars logs c.dead/respawn. 4 street life / emptiness (BENCH gap). 5 traffic brain build B1-B5 (docs/PLAN_TRAFFIC_BRAIN.md). 6 small: fra shed boxes 0.7 m inset; collide-audit wall fra -698,2187; ath bot/nav resets near 1800,-2900 after bFloor; chk-headroom (uncommitted in its session_012uFTEC9x2nrU988cCJp5gU, 99c_checklist.js 31 B under cap); camera-clear peds+lamps; minimap 38-47 px small; Athens TR9 not chunked.
## Deploy recipe
Same as docs/HANDOFF_coordinator_0c.md. Build from the newest REVIEWED commit (git worktree --detach <sha> + cherry-pick changelog commit); npm i three@0.164.1 --no-save in the worktree; smoke TAG=why,life1,xf1,terrain fra+ath; deploy.sh; sed title; Artifact publish url=Beta root=out/<ver> with km.js models.js tune.json models/{as,lx,xf,qa}.js + every xc/*.js (now 22 incl 99cs_solid.js). Branch cleanup is blocked by the permission classifier (needs Alex).
## Known reds
perf/reveal-hang fra, perf/ios-reveal fra (default), ctb/collide, traffic/fit, ath bot/nav#1, xf1/grass (intermittent), terr1/terrain-tyre-ath; why/drive-start/core/hud6 flake only in mixed batches.
