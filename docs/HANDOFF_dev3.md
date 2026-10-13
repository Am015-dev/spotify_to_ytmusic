# HANDOFF dev3 (branch alex/od-dev3 from od-dev1; PR #97) — stopped by coordinator (lane cap)

## Done (all pushed)
1. SIZE-2 ride scale: `RSZ.F` table (src/98sz_ride_scale.js, ride id -> scale f) puts all 157 rides in class (car 4-5, van 5-6, bus 11-13, truck 8-12, ±20 %); driver counter-scaled (RSZ.cf) so he stays 1.80 m;
   `RSZ.D` lifts the driver (plates) on open cockpits whose torso showed < 0.3 m above the door line. Frankfurt traffic bus was squeezed to 4.9 m (96_scale_qa.js carL.def): now 10.3 m (carL.bus/carWn/carS).
   Audit/fit code: src/98sz2_ride_audit.js (`RSZ.audit(fit)`, `RSZ.meas`, `RSZ_go`, `RSZ_human`). Regenerate the tables after changing a ride/driver: `node qa_dev3/tEv.js <local_dbg.html> fra qa_dev3/scale_fit.js out.json`, then copy `f`/`dy` of failing rides into RSZ.F / RSZ.D.
2. HUMAN HEIGHT: every humanoid 1.80 m (SC_K.ped .43, fig .45, moped .60, RSZ.fig 2.17; on-foot was 1.80). GO `v90k/rv-human` measures the five types (±3 %). Exempt: stock Speed-Champions garage driver (1.55 seated, open cockpit).
3. GO test fixes: shadow (nearest live car; empty target was falsy), park-sit (polls ≤2.5 s), palms message, pinned chip only walks the current city, bigrig item retired.
4. Token savers: 10_core/30_race/60_city_build split into <40 KB parts (tools/split_part.js; build byte-identical; OD_CHANGELOG is in src/10_core2.js), docs/MODULES.md one line per module (9.7 KB; `modmap.py --full` for the long one), `QUIET=1` for tools/tChkGo.js.
5. Checklist: rv-scale, rv-human (rv:2026-10-13). tChkGo now fails an item whose message has ❌. Full GO suite before the human change: 223/223 PASS (QUIET=1 node tools/tChkGo.js <local_dbg.html> <outdir>).

## Not done
- Green plate seam at street→ramp start (2 tries: qa_dev3/tRay.js, tTop.js; seam is a ~1 m green strip along the road centre under the ramp start, not the chevron pads of abPads; art-1 has it).
- Tyre-to-road gap / drive check on the rescaled rides (BC measures world scale so should follow; unverified by drive).
- rv:2026-10-13 items 4 (kerb-parked off-road, ped crossing gap, Athens upside-down start, home-1 bricks) were handed to dev-4.

## Tools (qa_dev3/)
tEv.js (eval code file, full result to a file), tGrid.js + scale_grid.js (offscreen ride+minifig render grid), tRvScale.js (PASS/FAIL all rides), tPark.js, tRay.js, tTop.js, hum.js.
