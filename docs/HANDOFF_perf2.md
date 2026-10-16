# HANDOFF perf2 (2026-10-16)
- tools/perfdrive.js (30 s scripted drive, med/high tier) + docs/PERF_BISECT2.md. Partial: 40 high, 61 med/high, 63 med (shards overwrote one log; 20/30/50/55 missing).
- Result: no >20 % jump in calls/tris 40->61. Heap +35 %, programs +24 %. Med/high = ~2x calls and tris vs the low tier perf-1 measured; tier is the main cost.
- 63 shows more >50 ms hitches (168 vs ~70) but drove 6x farther: not comparable. 18 shadow renders/frame at med too: check.
- Left: rerun per-shard logs incl. 40 med, 20/30/50/55, same-distance drive; try DPR cap + med shadow trim behind a TUNE flag. No fix/flag added.
