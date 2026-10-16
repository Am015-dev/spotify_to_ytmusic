# HANDOFF burst-1 (2026-10-16)
1. Transform burst: xfBurst() (src/30_race.js) = 16 instanced team-colour bricks named brickfx_burst, 0.34 s, disposed after; + AU 'whoosh' sfx + shake kick; called from FL_burst (roam road↔boat) and vehMode (race), skipped while RO.rcT>0 (warp grace). GO rv2k2/burst was broken (never warped to the slipway): now it does; PASS.
2. Water: ENV_water ramp brighter/bluer (#43d3e6/#2b8fe8/#1456c4), metalness .06, emissive follows the ramp: Main reads blue, not slate (docs/shots/burst1/river.jpg).
3. Street life: GO counted ped.x (always 0), now _x/_z of the active LV_pn peds. Fra 25-27 cars/20+ moving/12-23 peds. Athens was 7 cars/3 moving: LV_trFar 160 and recycle ring 80-170 (Athens only) -> 11/7/20. Not CPU-measured beyond the GO frame times (no change seen).
4. Gate (built page): unit 0 FAIL; TAG=rv2k2/burst,rv2k2/traffic,debris1,xf1,life1,life3,terrain: only SLOW-time fails (parallel run), every ✅.
5. Left: rv2k2/traffic GO is Frankfurt-only (Athens measured ad hoc); water still has a bright sky band mid-river; burst shot taken by forcing xfBurst beside the car (real swap is covered by the GO).
