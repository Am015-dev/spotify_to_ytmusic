# HANDOFF telemetry-r20g
1. src/98ps_session.js (after the beacon): `session` doc into collection `perf` (sid+seq, latest seq wins), flushed on pagehide/hidden, every 60 s after the first playable frame; ≤ 1 write/20 s (pagehide: 5 s), ≤ 30 docs; no db (live site) = silent; `?pbb=0` off.
2. Fields: build/ua/vp/dpr/gpu/city/ri(prog)/heap, bootMs + phase{fetch,eval,build,reveal}, long3 (frames >50 ms in the first 3 s after the first playable frame), roam/race {n,p50,p95,max}, gapMs+gapState, errN/err[], hint{cores,mem,saveData,batt,chg,cap30}.
3. `node tools/perf_report.js <export.json|dir>`: worst offenders vs budgets (boot ≤ 6 s, gap ≤ 100 ms, p95 ≤ 33 ms, long3 = 0).
4. GO perf/session-doc (shape + rate limit + cap, stubbed db). Built page: unit 0 FAIL, GO + life1,xf1,terrain 43/43. Reveal/precompile code untouched (only wraps ldHide to stamp a time).
5. Left: the coordinator deploys to Beta (add an OD_CHANGELOG entry); build phase boundary = first ldHide, so a late first loader hide shifts time from build to reveal.
