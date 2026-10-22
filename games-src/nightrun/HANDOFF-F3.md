# HANDOFF F3 (22 Oct 2026): street3, the Zeil street as one 2.5-3 min stage on one song

Flag `RET.street3` (default ON, `?street3=0` = the street2 stage exactly). Code: `parts/street/street3.js`; test `qa/street3-test.js` (RUNS=4, ~4 min).
`qa/streetfeel-test.js` now defaults to `Q=&street3=0` (it measures the street2 layout); `qa/street2-test.js` needs `Q='&street3=0'`.

What it does
- One stage, one song: street1 (192 s) from the first beat; musicpack's lock/boss/clear switches are blocked on this stage; no checkpoints, no captions, no warning sting.
- Pace by the clock: the camera may not run ahead of a gate that moves with the stage time (it never pulls the camera back); the gate reaches the boss at 145 s. 8 beats of calm
  (3.75 s at the song's 128 bpm), 12 waves with threat 2 -> 8 (rusher 1, gunner 2, heavy 4; monotonic; a heavy every third wave from threat 7; one gunner a wave, two from wave 7), peak at 136 s, breather,
  then the big heavy once the street is clear (12 s at most). Max 5 foes on screen. Log: `FOOT.S.s3.waves`, `.spawnLog`, `.hpLog`.
- Kai gets one heart more (6); a heal drops beside him when he is two hearts down (at most one per 12 s) and one in the breather, up to two as the big heavy walks in (its charge hits for 2). Idle spawns are off (the clock sets the pace).
- Gunners reload 1.4x slower on this stage; walks/approaches of all foes at 70% (lunges and charges unchanged).
- Loading: the STREET RUN hold also waits for the painted street layers and prop pictures, so the first drawn frame is the full-size art.
- Animation: no cross-fade on foot sheets, idle ping-pong 0-1-2-3-2-1 at 7 fps, shots/melee/hurt 12 fps one-shots, die 8 fps; idle<->walk switches on the next 1/12 s boundary.
- Light: warm lamp pools on the road every 520 units (whoever stands in one is drawn a second time additively), neon spill, wet-road reflection, prop contact shadows,
  one grade (multiply #d9c6ff 22% + a 5% pink screen), all under the HUD; static props snapped to device pixels.

Numbers (last run, after merging 1750c228 + footlab): clears 3/4 at 165.2 / 173.2 / 166.9 s, peak at 81% of the run, frame rates idle 6.67 (target 7) / shots 12.0, max upscale 0.76 (1440x860) and
1.02 (390x763@2), rusher walk 210 u/s (was 300), 0 page errors.

Left to do / known
1. Merged audio work moved the song tempo (intro 4.6 s -> 3.75 s) and cut clears from 3/4 to 1/4 until the boss moved to 145 s and the boss heals were added: re-run street3-test after audio merges.
2. streetfeel-test "body heights" fails on gunner with or without street3 (also with ?street3=0, i.e. the base): comes with the merged sheet refresh 43afc826, not street3.
3. simhunt FAIL is the flight game's "ship dies with no bullet within 60 px" (unexplained-death); the street is not in simhunt.
4. The lamp pools are at fixed world x; the painted lamp posts sit in parallax layers, so pools and posts do not line up (cones were removed for that reason).
5. fingerprint-test: street changes (expected). fly6 / fly10 / endless10 flip between two hashes on the SAME page from run to run (checked twice on one build:
   fly6 e2f0e31c.. or 70b52b23.., fly10 c9f1cc94.. or 3f92ffd0..), and legend10 differs also with street3 forced off: those are not street3 (flaky or from the merged E1/H1 work).
