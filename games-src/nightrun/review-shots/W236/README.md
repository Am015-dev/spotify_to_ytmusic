# W236 flight review frames (seed 1; phone 390x763 and PC 1440x860 at t 45, PC boss 6 s into the fight)

Cause of the "two near-identical helis on top of each other": not the sheet (each drone frame is one twin-rotor heli) and not the formation. They were death-clip ghosts (ART.gh): a ghost aged only by the render's dt, a stepped run renders with dt 0, so every kill stayed on screen as a frozen extra heli at frame 1 of its death clip (10 of them at t 45). Ghosts now also age by game time (art.js).
Also fixed: spread.js only spaced foes at spawn, so foes an AI brought together later still overlapped (0.79 on PC seed 1). A per-tick separation (SEP) now pushes overlapping foes apart, and the carrier's middle gun plate no longer sits 34 px inside the hull.

- pc-t45: two helis, each drawn once, far apart; the stacked pairs at x 830-950 are gone. The field is sparse at this moment (two foes on screen).
- phone-t45: one heli at upper left, drawn once (the clump of 4 is gone); a second heli is half cut off by the top edge.
- pc-boss: the boss still reads as a pale lavender-white box to my eye, though its mean luminance is within .055 of the brightest foe. A gentler PC lift (curve power 2.2 instead of 3) dropped it to -0.10/-0.14 with contrast 2.83, failing both gates, so power 3 stays. The raw art is a mid violet-grey (mean RGB 88,73,109): the pale look comes from our lift, and the gates as written cannot accept a darker boss on this backdrop.

Gates (qa/w231probe.js, 3 seeds x 2 devices, stepped): 5 of 6 runs pass every gate. Boss luminance diff: PC -0.055 / -0.036 / -0.034, phone -0.026 / -0.051 / -0.019. Overlap: PC <= 0.078 (W235: 0.79), phone <= 0.027 (W235: 0.71). Boss contrast >= 3.69, boss white <= 2.5%.
FAIL: PC seed 2, player contrast vs strongest foe -4.40 at t 10. The bot's path changed, so the player flies under the score panel (player contrast 3.2). The gate counts this; it is not a draw bug.
