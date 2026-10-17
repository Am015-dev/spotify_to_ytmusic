# HANDOFF perf2 (2026-10-16)
- tools/perfdrive.js (30 s scripted drive, med/high tier) + docs/PERF_BISECT2.md. Partial: 40 high, 61 med/high, 63 med (shards overwrote one log; 20/30/50/55 missing).
- Result: no >20 % jump in calls/tris 40->61. Heap +35 %, programs +24 %. Med/high = ~2x calls and tris vs the low tier perf-1 measured; tier is the main cost.
- 63 shows more >50 ms hitches (168 vs ~70) but drove 6x farther: not comparable. 18 shadow renders/frame at med too: check.
- Left: rerun per-shard logs incl. 40 med, 20/30/50/55, same-distance drive; try DPR cap + med shadow trim behind a TUNE flag. No fix/flag added.

# perf-2 (2026-10-17) alex/perf-wip
- GC is the hitch source: ~400 MB/s garbage in Athens. Fixed QS_shutSet (1.9 GB/20 s), roamTerr scratch, DEV_yield, B2_pump, CV.act.
- A/B ath p95 192->176, max 2747->1647. fra p95 102->108, max 1269->686 (paired, noisy). Target (p95<=16, max<=50) NOT met.
- Next: LF_drapeOk/LF_tileG arrays (~2 GB), DEST_find scan (~1.5 GB), QA ticker, TR_G deopt, draw calls. Details in docs/PERF_1.md "perf-2".
