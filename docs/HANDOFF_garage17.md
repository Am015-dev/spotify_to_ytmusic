# garage-17 handoff (2026-10-10). Branch alex/od-garage17
## Shipped
- v89z (live): BUILD + ▶ GUIDE for OFF-ROAD / WATER rides. src/98fb_form_build.js (tag FB_). Root cause: builder + guide only edited the street car's GB.d.bricks.
  Form session: FB_begin swaps GB.d.bricks to S.off()/S.boat() (saved edits first), and FB_end saves to mho_gar.fb['<set>|off|boat'] (only when it differs from the preset) and restores the car.
  S.off/S.boat are wrapped (FB_wrap) so the drive / cards / guide use the edits. store.set('mho_build') is blocked while a form is open. Test: g17/fb.js.
- v90b (READY, reviewer PASS 9891f495): build-up animation when a ride shows in the garage (src/98ba_build_anim.js, tag BA_; window.__ba).
  Guide step order, 32 batches, 1.5–3 s, tap to skip. BUILD camera fits boats/off-road (98fb: BC_gk / GB_cam wrappers, boat pitch 0.62).
  Tests: g17/ba.js, g17/cam.js, g17/lazy.js / lazy2.js (lazy models from v90a).
## Notes
- v90a lazy loader (98ld_run) wraps FB_begin / GAR_select; the build-up starts on the LD_redraw → gbRender after a chunk arrives.
- bc/enter ev() evaluates in module scope; p.evaluate cannot see GB etc.
