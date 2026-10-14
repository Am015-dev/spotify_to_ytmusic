# XF: LEGO 2K Drive automatic transformation (xform-1, 2026-10-14)

## What the 2K sources say (articles; the videos themselves could not be watched from the cloud, so no frame timings were verified)
- Street → off-road → water swap automatically by surface: "veer off the paved road … your car automatically turns into an all-terrain vehicle. Drive onto water and your car instantly transforms into a boat" (godisageek review).
- No button: the developers first tied it to a button and dropped that as "just wasn't very accessible" (stevivor interview).
- Falling into water never ends the run: you "transition to another vehicle and just keep on racing" (review).
- The mechanic was shown in a video on the official "LEGO 2K Hub" YouTube channel (TechRadar), plus the reveal trailer (insider-gaming: "vehicle morphing"). I could not open either video to measure timing.

## What we built (src/98xf_xform.js)
- Mapping: road/deck → street car, grass/dirt/sand/park → off-road form, water → boat (loadout = garage COLLECTION slots, default = the ride's own forms).
- Hysteresis: 0.3 s on the new surface, 1–2 m road-edge band, minimum 0.45 s between swaps, no swap in the air, surface reset on warp.
- Transform: 0.3 s squash → overshoot with one spin (drawn only), brick ring + build sound + the existing BOAT/4×4 label; speed, position and heading kept.
- Tests: checklist xf1/grass, water, land, kerb (📍 GO + auto, tools/tXf.js); shots tools/tXfShots.js → qa_xf/grid_xf1.jpg.

Sources: https://www.godisageek.com/reviews/lego-2k-drive-review/ · https://stevivor.com/features/interviews/lego-2k-drive-brings-building-exploration-and-imagination/ ·
https://www.techradar.com/news/lego-2k-drive-is-the-spiritual-successor-to-one-of-the-best-kart-racers-ever-made · https://insider-gaming.com/lego-2k-drive-trailer-shows-off-vehicle-morphing-and-a-chaotic-open-world/ · https://www.lego.com/en-us/categories/games/2kdrive
