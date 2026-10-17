# HANDOFF rev-80 (2026-10-17): v90m-beta.80 = GO
1. Tested trunk sha c9327a1 (hudstack-1). Built v90m-beta.80, page 3,136,399 B (split). Changelog commit adds the beta.80 entry only. Not deployed.
2. Unit 0 FAIL (4823 pass, 13 known). TAG=hudstack1,rv2k2,slow1,life1,xf1,terrain 46/57: hudstack1/stack FAILED in the combined run (no cards shown, run order) but PASSES alone; life1/people fail in combined + 1 alone run, passes 2 of 2 on rerun (flaky); life1/carousel, terrain-tyre-ath pass alone; rest are SLOW-only (xf1/*, tyre-fra, fps-fra, smash) as known.
3. TAG=rv2k 18/23: objectives (timed out in the combined run) and rv2k2/akro pass alone; drawer, foliage, card SLOW-only.
4. Shots docs/shots/rev80/hud_land.png (852x393) and hud_port.png (393x852), looked at: Frankfurt next to the marker, SMASH 20 active. Prompt, objective card stacked, 0 px2 overlap, readable. Port: prompt sits right next to the minimap edge, clear.
5. Left: combined-run hudstack1/stack fails when run after other items (state bleed); consider reset at start of HUDSTACK_go.
