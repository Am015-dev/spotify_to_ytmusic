# PERF worker handoff (alex/od-perf, 2026-10-09)

Brief: EFFICIENCY_PLAN.md top 2 (one WebGL context; shader warm-up). Base = live src v89g (19449fa).

## Done (src)
- `src/98zp_perf_ctx.js` (new, before 99_api in ORDER):
  - P1_off(w,h): offscreen "renderer" on the main renderer → 4x MSAA RT (isXRRenderTarget trick = canvas-identical tone map + sRGB), readback, `.canvas()` / `.url()` (tiny stored PNG blob, no toDataURL).
  - P1_view(cvs): builder "renderer" (GB.r). While #gbx is open the main canvas #c moves under #gbC (opacity 0), builder draws there via MSAA RT + copy quad; composer.render and resize() are skipped while it owns #c; MutationObserver on #gbx[hidden] puts #c back + resize().
  - GS_thumbs replaced: lazy queue, ≤6 ms per frame, visible tiles first, cache unchanged.
  - P1_later: menu car cards (W13) drawn after the first menu frame, one per frame.
  - P2_compile(sc,cam[,async]): compiles for composer.readBuffer. ROOT CAUSE found: every renderer.compile() warm-up ran with no render target = canvas variant (sRGB + tone map), never used by the composer path → ~50 wasted programs. Menu 107→66 programs, Fra roam 159→96.
  - P2_warm after first menu frame (boot no longer compiles before the menu), P2_warm right after hubEnter in roamLoad (GPU links while JS builds), GS_thumb warm at menu idle.
- Edits: 10_core (GB.r=P1_view), 40 (W13 via P1_off, lazy teamCard), 98s (GS_thumb via P1_off; PMREM with main renderer — the facade broke it = darker garage), 98pa/98u/98y (T.r.url()), 30/60/72/98l (P2_compile), 72 boot.
- Verified identical shots: team cards (pixel-identical), garage RIDES + BUILD + thumbnails (diff only animated crew).

## Tools
- tools/eff/probe_ctx.js (probe_min + WebGL context count), p1shots.js (before/after shots), p1gb.js (garage from menu), p1feat.js (search/tray/turn/paint/rotation/close; arg3 = iframe page), p1prof.js (CPU profile, URL arg), p1progs.js (program keys).
- Local server: `cd out && python3 -m http.server 8770`; builds out/pbase (v89g), p1, p2, p3.
- Results: docs/eff/p1/*.json, cmp.py prints the table.

## Left
feature check (p1feat on p3 + iframe), tPlay once on split build (tools/build.sh --local, :8766), full shot set, REVIEW to reviewer, after PASS: merge live src, OD_CHANGELOG entry, out/<ver>, DEPLOY to coordinator.
