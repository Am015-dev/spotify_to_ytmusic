# rev41 SEEN: Athens ridge, before (trunk 7e81d9d) / after (glbuf-r30r e955498)
Recipe: docs/shots/rev41/probe.js: built page, ?test=ath, iPhone UA, 852x393 touch, 6x CPU until ready. State dumps: state_trunk.json / state_fix.json.

- B_spawn (cam 1884,-3178, 3.8 km from the origin): before and after are the same frame (only the birds differ). Long Athens avenue, pink/ochre blocks, deep blue sky, brick clouds. **No hills on the horizon in either shot.** Ridge state is the same in both: rc=1, colours = the recolour (top 0.078/0.110/0.216 linear = #4f5d80, low = #8a90a2), Uint8 packed, BUT `layers=0`, memFree entry `on:false` at (0,83) r 1200, d = 2567 m > ro 1800.
- A_origin (warped to 0,150; cam lands at -1,-80): before and after both show the car against apartment façades and a lawn (the view is blocked by buildings, no horizon). Ridge state identical in both builds: recolour colours, `layers=0`, entry `on:false` 6 s after the warp.
- Verdict for this lane: the fix changes nothing you can see. The ridge has the same colours as before. The missing hills come from memFree's stream entry, which was already wrong on trunk (handoff item 4). That needs its own lane.
