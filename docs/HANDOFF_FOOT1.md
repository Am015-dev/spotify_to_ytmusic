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
