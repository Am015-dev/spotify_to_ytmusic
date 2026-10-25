# HANDOFF W253: smooth motion (branch nr/W253-smooth, flag RET.smooth, `?smooth=1`, default OFF)

Done (code, owner art untouched):
- art.js `ART.aS` / `ART.aframe` / `ART.drawAnim`: strips with 2-6 frames, < 12 fps, continuous acts (ART.SMA: idle hover walk fly glow loop spin flame run block heal), not fx-/wpn-, cross-fade into the next frame for the whole frame time (smoothstep). Under smooth, muzzle / impact / burst lose their old late cross-fade (crisp). Attacks, hits, shoot, die stay hard frames.
- Idle / hover strips with 3+ frames ping-pong (0,1,2,3,2,1) when their last frame is not close to frame 0 (`ART.ppOpen`, 16x16 mean difference > 6).
- foot.js `hitstop(ms,a,b)`: with smooth, a hit freezes only the named actors (enemy `e.hs` skips its step; Kai `P.hs` runs at dt x 0.05, input still read), 2-4 frames (<= 66 ms); Kai hurt = 40 ms (2.4 frames). Phase changes and the finisher stay global. Sim path (`S.sim`) is untouched.
- Already existing, NOT duplicated: squash (sm.squash), flyer banking (SPR.ship, sm.ship_bank), enemy recoil.
Not done: anticipation dip before dash / attack, landing overshoot (needs a draw offset in streetlook; check IN.drawWho first), parts/render/pure.js not touched.
Measured: streetsim RUNS=12 (flag off, same as sim with flag on): idle 0%, nearest 42%, gfirst 75%, dodge 75% (small sample; gates not worse). Idle pixel diff (6 boss idles, 60 fps, frame to frame): mean lower with smooth on 4 of 6 (e.g. 0.775 -> 0.668), higher on 2 (ping-pong adds motion: kronos 0.587 -> 0.755); the max step is ~5-7 in BOTH modes at frame boundaries, so I could not show a lower max: the "no new flicker" gate is not proven. Phone fps benchmark and phone/PC shots NOT run (time), so the default stays off.
Next: run benchmark/playability-load.js with and without ?smooth=1, take one phone + one PC pair of foot and flight, then flip the default.
