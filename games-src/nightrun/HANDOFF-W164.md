# W164 camera lead + fixed steam vents (nr/W164-cam, flag RET.cam2, OFF by default, ?cam2=1 = on)

Measured with qa/cam2-test.js (stepped, 60 s, Kai runs right), before (old) -> after (?cam2=1):
- Kai in the right 30% of the view: phone 98.9% -> 0%, PC 95.7% -> 0% of running steps (mean position 94% -> 34% phone, 32% PC from the left).
- Camera never moves backwards; follows at 14/s (95% in 0.2 s); biggest step 4 units per 1/60 s.
- Steam: smallest drawn frame 26% -> 64% of the largest; plume 0.9 -> 1.7 characters; on screen 6.6% -> 16.8% of frames (phone), 0% -> 36.8% (PC); no pops.
- streetdraw, footvis, streetsong, focus, footlab (after the climax fix), guard: pass.

Why it is off: streetsim (50 runs per bot) gets easier because foes now enter ~230 units (phone) from Kai instead of ~20:
- clears nearest 18% -> 70%, gfirst 70% -> 78%, dodge 84% -> 100%.
- New FAILs vs today: kill order matters (70 vs 18 -> 78 vs 70), cover prevents >= 3 hits (3.3 -> 0.0); ducking 2.7 -> 0.1 (failed before too). Threat peak now passes.
Next step: retune for the new geometry (foes cross the gap faster or gunners fire earlier, more cover on the way), then flip the default to on (`!/[?&]cam2=0/`).
Other changes: street3.js camera cap = boss screen (the clock still decides when the boss comes); a forward runner reaches the last screen in ~33 s and waits for the clock. qa/streetsim.js takes env Q.
