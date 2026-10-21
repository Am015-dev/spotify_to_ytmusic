## tr9-chunk-r22d6 (2026-10-21, alex/od-int2): TR9_cap split into boot steps
1. src/53_terrain_roads.js: TR_roadDist+TR9_cap are one generator (TR9_gen); TR9_queue runs it in ~14 ms RFS.S steps (re-queued after the running step, then TR_bridgeEnds). src/51_city_net.js rfGrid now walks RFS.S by index. ?t9ch=0 = one task, ?t9c=0 = no cap.
2. Frankfurt: 12 steps, longest 14.3 ms (30 ms under CPU contention), was 244 ms one task. W.h hash 6081225f identical chunked vs ?t9ch=0.
3. Athens NOT chunked: its grading runs inside AB_auto (sync, no yield point), 275-339 ms still one task; deferring would change the ground later steps read. GO why/tr9-chunk (src/99t9_chunk.js) PASSes both, asserts chunked==one-task hash on a seeded grid and fra step <= 50 ms, reports ath.
4. Gates (built): unit 0 FAIL; life1/xf1/terrain/why ath 24/24; fra only xf1 timeouts under contention, xf1 alone 6/6. ios-reveal (loaded lab, noisy): fra still link 1 (known red), ath no links.
5. Left: Athens needs TR_roadsInit deferred out of AB_auto (then redo profile p.y reads and QTC) to chunk; ios-reveal rerun on an idle box.
