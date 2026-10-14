# foot-1 handoff (2026-10-13), branch alex/od-foot @ cda092d — READY sent, GO 31/31

## Done (on-foot lane)
- Tests: src/99c_checklist.js v90n/foot-go-{walk,phone,npc,obj,jump} (📍 GO = OF_go(kind) in src/98of_onfoot.js), automated by
  `node tools/tFootGo.js <url>/index.html <outdir> [walk,phone,npc,obj,jump]` (SHOTS=1 for 3 shots). ~3 min for all.
- Movement: OF_tv (continuous stick speed), OF_camYaw follows after 0.25 s, stride-matched legs (OF.footV), OF.jQ jump buffer.
- Interact: OF_acts/OF_use/OF_actStep (HI/SIT/TALK/ENTER/TAKE, one button = #tB), ped stand+wave via p.ofS in pedStep (src/60_city_build6.js),
  peds are not knocked while RO.foot!=='car'. Mission card GO while on foot → OF_reset (back in car) first.
- Test-mode quirk: 98tq's skip() auto-clicks #rcGo, so the mission test counts OF.n.card instead of the card staying open.

## Next in queue (not started): cam: vehicle-size chase camera (coordinator brief 2026-10-13 22:37)
- Existing code: src/98bc_bigcars.js BC_dims/BC_apply (chase distance × size^.65 via SC_K.cam + SC_rcam), BC_tall (raises RCAM heights for tall rides),
  BC_upd re-measures per ride. Start by writing the cam: tests (GO bus / longest truck / small sports car / on foot; ray from camera to a road point
  10 m ahead of the nose not blocked by the ride; ride 15-35 % of screen height at 852×393 and portrait), then check why BC_apply is not enough for
  the long flatbed (likely look-at point / height not derived from length).

## cam-1 (2026-10-13), alex/od-foot @ 84773e2 — READY sent, GO 35/35
- src/98cam_size_cam.js (CAM_): CAM_prof = ride side profile (vertices → 0.5 m bins, car frame); CAM_solve per RCAM mode: keep stock if it passes,
  else grid-search b/h (pitch puts the road 10 m past the nose at 62 % screen height) with clearance ≥ 0.3 m over the profile and fill 16-34 %.
  roamCam wrapper eases RCAM fields (≤ 4 m/s on the real clock); SC_rcam wrapper restores the eased values. Refit 30 frames after a ride change / on rotation.
- On-foot camera height OF_CAMH = 2.9 (98of). Tests: v90n/cam-go-* in 99c, `node tools/tCamGo.js <url>/index.html <out>` (FAIL lines only, ALL=1 all, SHOTS=1, BEFORE=1 old camera).
- All rides: `node tools/tCamAll.js <url>/index.html` = __cam.audit(): every ride (157) built off-screen, chase cam solved for 852×393 + 393×852, virtual
  camera raycast/projection; asserts road 10 m past the nose not hidden + lower middle, fill 15-35 %, ride's rear edge on screen (≤ 98 %). ~38 s. STOCK=1 = old camera (15/157).

## cam-1 → next worker (2026-10-13 late), alex/od-foot @ 898cca2+
- Pushes go to alex/od-foot (session branch rule); int-3 merges from it.
- cam perf (68c996d): CAM refits only on ride/aspect/mode change, active mode, coarse-to-fine. tools/tPerfCmp.js = 3 fixed views, frame ms, busy CPU, top fns (PROF=1).
- DMG (src/98dmg_damage.js, flag DMG.on, ?dmg=0 off): DMG_impact(kmh normal speed) is THE hit; roamBounce wrapper supplies the wall normal speed,
  roamDamage(5|12) = traffic (closing speed), other amounts (falls/quests) ÷ class. Debris pool 60 (DMG_throw/DMG_debStep), missing panels =
  DMG_panels(frac) collapsing outer bricks' triangles in a cloned geometry (geometry.userData.bid/bt from GB_geo), smoke <50 %, fire <20 %, 0 → roamWreck
  (existing 2 s rebuild), 5 s no hit → repair. Hull bar #rgHull hidden at 100 %. Tests: v90n/dmg-go-{light,medium,wreck,graze}, `node tools/tDmgGo.js <url>` (14/14).
- Gotcha: with ?draw=0 the ride mesh is not moved between a warp and the next frame; DMG_panels offsets by RO − mesh position.
- Phase 2 DONE: DMG_traf (hook in 70_roam_world.js smash condition): pin no longer bursts, burst only side-dash / > 60 km/h closing / > 150 km/h; bumps > 25 km/h throw 2-4 bricks + DMG_impact.
- NEXT: repair pickup / prop smash +5 (LEGO 2K style).
