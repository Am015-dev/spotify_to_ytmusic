# HANDOFF perf1 (2026-10-16)
- tools/perfbisect.js + docs/PERF_BISECT.md: 7 builds (40-62) x fra/ath, calls/tris/geo/tex/prog/heap/ms.
- Result: no >20 % jump in any scene metric 40->62 at the start spots, low tier (test mode forces low). Heap +43 % and programs +24 % by beta.45, flat after.
- Cause not found here: likely older than beta.40, or med/high tier, or in-drive streaming.
- Left: rerun with Q=med/high and with prof.js while driving; probe beta.1-39. No fix/flag added.
