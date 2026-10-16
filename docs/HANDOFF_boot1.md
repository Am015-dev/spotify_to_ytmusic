# HANDOFF boot1 (2026-10-16)
- Profiled real STORY boot on the built page (tools in scratchpad, not committed): menu 5.3 s, roamLoad 9→37.5 s (city build ground/paving ~15 s, street map 4 s, GPU warm 3.5 s), then a 10 s first-frame program-link stall, intro at ~49 s.
- Shipped: GFX_pre (src/98gx_gfx.js) applies ACES/sun shadow/plastic keys before ldPrewarm, so the first roam frame relinks 26 programs, not 61. Intro 49.0 -> 47.3 s here. `?bootgfx=0` = old order.
- Gate: unit 0 FAIL; TAG rv2k/onboard,life1,xf1,terrain,v90m 45/45 on built page.
- Not done (needs its own lane): build only the start district before handoff (gndBuild/paving/lzRoad ~15 s CPU), cut program count (~175; share materials), avoid avatar() canvas readback waiting on pending GPU links (tutStep, 6 s here).
- Shot docs/shots/boot1/first_drive.jpg: intro frame, geometry present at start spot.
