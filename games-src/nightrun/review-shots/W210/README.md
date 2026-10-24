# W210 shipmove: stage 1, busy moment (flag `?shipmove=1`, default off)

Shots: `stage1-phone.webp` (390x763, turned world) and `stage1-pc.webp` (1440x860), stepped sim then a short real-time render, flag on. Taken before the last sway tweak (motion only, not visible in a still).

Size comparison: NOT DONE. I could not view a benchmark-game frame in this session, so no ratios of that game are claimed. Ours: player hull 16% of the short side, fighters 0.8x of it, gunships 1.5x. The owner (or a worker with a reference URL) should compare the pair against a modern side-scrolling shoot-'em-up frame.

## game-look "Check before reporting" (honest, per row)
- SHIPS: enemies are 1.3-1.5x their old drawn size, the player is unscaled, so texel density differs by up to ~1.5x (the limit the skill allows, no more). Banking along velocity works but is shallow (max 0.35 rad). Outlines and shading still differ between our player sheet and the enemy sheets: still looks pasted in places. Code cannot fix that (rule 17f); better enemy sheets are the real fix.
- BULLETS: not touched by this task. Enemy and player shots are still small next to the bigger ships (see the white-streaked dots in the PC shot): still sloppy.
- ENVIRONMENT: not touched. The backdrop is as bright and busy as the play layer, so ships do not pop; this is the biggest remaining problem and belongs to another worker.
- FEEL: explosions are the existing sheets, unchanged. Larger hit radius (half the art growth) makes bigger ships easier to hit; balance held in the sim (human clear 55/100/100% stages 1-3, on and off) but nobody has played it. Feel needs the owner's eyes.

Gates run (stepped, stage 1): constant-velocity stretches > 1 s: 0 on vs 5-8 per 24 runs off; hull 16.4% / 15.8% of the short side; simhunt stages 1-6: no new severe kinds. NOT run to a result: guard.py, smoke.sh. Do not turn the flag on by default before they pass.
