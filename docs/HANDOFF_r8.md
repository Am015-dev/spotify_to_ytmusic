# HANDOFF r8a (shortcut scan)
- src/98dest_destruct.js DEST_find: nodes scanned nearest the player first (sorted once), each passing candidate published at once (DEST.sc grows, DEST_mark adds arrows to one group), 250 m spacing and cap 9 kept.
- Scan ends (DEST.done) at 9 or all nodes covered and frees its tables; DEST_step stops calling it. Callers that waited for `DEST.sc` now wait for `DEST.done` (98dest_go.js, tools/dest/shots.js).
- GO rev5fix/dest-sc-time (99c7_rev5fix.js): Athens 9 shortcuts after 38 s of steps (3rd at 25 s), all pass DEST_open, scan idle once done. Before: sc null at 300 s (670/22,700 nodes). dest/shortcut green in both cities.
- Gate: unit 0 FAIL; TAG=life1,xf1,terrain only known reds (xf1/*, terr1 tyre SLOW). Not deployed, no changelog.
- Left: shortcuts are first-found, not best-ranked; 4 of 9 are dropped by the 350 m re-check (streamed tiles), so ~5 usable per city.

## r8b (HUD and UI text)
- Pill: `.crD` distance is `flex:0 0 auto`; CR_hud drops the "CH n · " prefix when the pill overflows (src/93_cars_lego.js).
- PC HUD (≥1000 px, hover): speed box bottom-right, KM/H 12 px, rival name box 150 px (src/99ui_hud.js). Phone unchanged (phone rival name still ellipsised at 852).
- Builder tiles: min-height + wrap, "LONG RAMP UP" fits (src/98b2_builder2.js). DNF: TK.last.place null via tkFinPlace (src/98tk_city_duel.js); results already said DNF.
- GOs r8b/pill-dist, dnf-noplace, pc-hud in src/99c7_rev5fix.js: all PASS. Unit 0 FAIL; life1/xf1/terrain only the known xf1/grass red.
- Not done: builder label has no GO; hands-off tool `fin:true` comes from the tRv2k2 helper, not the game.

# HANDOFF r8c (rev8 bugs 2, 3, 5, 7)
1. Cyan ellipse/arc: the LIFE pop-marker ring (InstancedMesh `ring`, 6 m torus, src/assets/lx/code.js) sat under the camera at the Athens spawn. It is no longer drawn with the camera inside it or within 1.5 m of its rim (LIFE_ringCam); the v88v torus guard never covered instanced rings. Found by bisect: tools/tR8cyan.js.
2. RGB split (src/10_core4.js FX): the offset is clamped to uCAcap = 0.0015 UV (0 on coarse pointer), and uCAk = FX_caK() fades it in from 85 to 100 % of top speed. Hit/flash uCA can no longer blow past the cap (it was ~15 px).
3. Near canopy (src/98fc_foliage_cam.js): a crown centre within FC.nearR = 10 m of the camera, above the car and not behind the lens, is hidden like the line-of-sight trees.
4. GOs r8c/near-ring, chroma-cap, near-canopy (src/99c7_rev5fix.js): 4/4 PASS. Shots before/after: Athens ellipse gone, Akropolis 189 km/h fringing gone, Westend CP4 clean.
5. Gate: unit 0 FAIL; TAG=r8c,life1,xf1,terrain 45/46. life1/smash is flaky on trunk too (1/2 vs 1/2 here). Left: trees now pop out ~4 m ahead of the car; tune FC.nearR if Alex notices.
