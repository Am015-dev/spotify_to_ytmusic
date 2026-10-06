# v87d (pART8 on live v87c 1bc1f9f): road flicker proof, in motion

Probe: tools/a8/zf.js `__ZF`. Each frame it renders roads alone (no culling) and then roads + terrain with the game's real polygonOffsets.
It counts road pixels that come out grass. Grass more than 0.5 m in front of a road (hills hiding it) counts as occlusion, not flicker.
The check runs with a 24-bit depth buffer and again with a 16-bit one (a stand-in for phone GPU precision).
Columns: frame, x, z, km/h, autopilot offset, road px on screen, grass-on-road px (24-bit), grass-on-road px (16-bit).

| run | frames | grass-on-road px per frame |
|---|---|---|
| live v87a, Frankfurt (probe_live_v87a_fra.txt) | 32 | 0-15 (24-bit), 42-92 (16-bit), in nearly every frame |
| live v87a, Athens (probe_live_v87a_ath.txt) | 21 | 0 most frames, then bursts of 18, 89, 262, 734, 855, 1796, 3166, 2336 = the "road turns green" flicker |
| candidate, Athens, same spot and route (probe_cand_ath_samespot_as_live.txt) | 29 | 0 / 0 every frame |
| candidate, Frankfurt chase strip (fra/, probe_cand_fra.txt, 50-68 km/h) | 36 | 0 / 0 every frame |
| candidate, Athens chase strip (ath/, probe_cand_ath.txt, 27-62 km/h) | 36 | 0 / 0 every frame |

Cause: since pART7 the grass mesh follows the ground within 3 cm, so it sat almost flush with the road and only a tiny polygonOffset separated them.
On a lower-precision depth buffer they z-fight as the camera moves.
pART8 dips the grass 10 cm under every road footprint, and the road strips drape within 4 cm.
Tyre gap, Frankfurt plain road (1920, -60): +0.003 / +0.013 / +0.026 m.
