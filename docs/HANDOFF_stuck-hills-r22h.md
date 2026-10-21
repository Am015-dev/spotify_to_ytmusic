# stuck-hills-r22h
- Cause: the escape ladder (98esc_escape.js) only runs OFF the road (3 m past the road edge); a wedge between a slope and a building next to a road never started it.
- Fix: src/99skh_stuck.js (before 99_api.js): gas held + ground speed < 1 m/s for 2.5 s -> reverse-assist; 5 s -> ESC_lift re-place with BACK ON THE ROAD {must:1}; >35 deg slope + standing car slides down the fall line (or along a wall). ?stk=0 off.
- GO stuck/hills (both cities): 3 pinned >35 deg wedges, free in ~5.1 s, reverse at ~2.6 s.
- Lab probe: 120 uphill starts on >35 deg Athens slopes never wedged > 3 s (the slope slide already works); the trap is the wall/corner pin.
- Left: no real-phone repro yet; 150 s seeded drive compare not run (detector is inert unless standing with gas).
