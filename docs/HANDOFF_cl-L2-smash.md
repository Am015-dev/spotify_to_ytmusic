# HANDOFF cl-L2-smash
1. `CL.smash` (?cl=smash, in ?cl=all, default OFF) in src/99cl_loop.js: inside the Frankfurt core box props smash at >= 15 km/h (small) / >= 30 km/h (big, stalls); wraps SM2_smash/SM2_prop, SM2 file untouched, outside the core = old gate; traffic stays 45.
2. Each core prop smash tops up to >= 20 bricks, >= 3 studs and a 50 ms HIT_stop; speed loss is smashCheck's own (2-8 %).
3. GO `why/smash` (in 99cl_loop.js): bin + stall at 30 km/h smashed, 20 bricks, 3 studs, loss <= 30 %; bin 20 smashes; 10 and 12 km/h bump. Built page: unit 0 FAIL, TAG=life1,xf1,terrain,why all green for fra + ath, flag off and ?cl=all.
4. Shot docs/shots/cl-L2/smash-roemer-852x393.png (tools/tCLsmashShot.js): stall burst at 35 km/h at Paulsplatz spawn.
5. Left: flag threshold is 14.9/29.9 (float margin); car smashes wait for the traffic brain; studs/bricks counts are fixed, not scaled by speed; Athens parked.

## Fix round (review #23), PAUSED, unpushed
- Uncommitted in working tree: src/99cl_loop.js (CL_burst: pooled forward/up spray, 6 studs, SM2.n.bricks counted, no top-up when debris pool > 85 % busy) + src/98sm2_smash2.js (smash2/tap uses 10 km/h inside the core) + tools/tCLchain.js. NOT yet tested after these edits.
- Findings: smash2/tap 0 bricks was SM2.n.bricks not counted; my 6x-CPU chain (frame JS ms) showed no flag-on regression (max 236-305 vs 238-364); life1/smash at THROTTLE=6 failed 1 of 2 flag-on runs, 0 of 3 off, cause unknown. Still to do: build, unit, TAG smash2,why,life1 on fra+ath with ?cl=smash and ?cl=all, one close 852x393 shot.
