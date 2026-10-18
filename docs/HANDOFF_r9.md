# HANDOFF r9b (rev9 N2/N3/N4, fixes #5/#6)
- Pill (src/93_cars_lego.js CR_hud): objective line = ellipsised "Giver · Target" + fixed "→ N m"; giver dropped first; title hidden when it repeats the target; portrait pill max-width clears ⚙ (#tuG). Rival box name wraps 2 lines at 12 px (00_page.html #raceW .gap small).
- Garage (98y): roam EXIT/#ofExit/🐞/odPin hidden while #gbx is open; landscape RIDES panel 392 px so names wrap (clamp 4) instead of ellipsis.
- vehMode (20_race_world.js): free-roam CAR↔4×4 flips only after 1.5 s on the new surface; burst/sound/banner at most once per 4 s; races and boat unchanged.
- GOs in 99c7_rev5fix.js: r9b/pill-gear, r9b/garage-clear, r9b/veh-dwell (all PASS); r8b/pill-dist now also fails on overlap with #tuG. Shots 393×852 pill and 852×393 garage looked at.
- Left: xf1/grass red is the known one; no deploy, no OD_CHANGELOG touched.
