# HANDOFF prewarm-r20m
- Added PREW_run (src/98bp_warmall.js): under the curtain, one representative per program drawn through the composer (1-px scissor) + 1-px readPixels. Touch/lowmem only. DEFAULT OFF (?prewarm=1 on): in software GL it costs 3.7-4.1 s at 6x (the pipeline build itself), over the 1.5 s budget; perf/touch-first-frames fails with it on.
- src/98ps_session.js: session doc now has lf (frames > 50 ms in first 5 s: [ms since reveal, frame ms, programs before, after]), pRev, pRoam, prew.
- GO perf/ios-reveal boots with prewarm=1 and asserts programs at reveal == at +5 s: 122 == 122 (passes that line). The gate still FAILs the same way with and without prewarm: 1 link + a 7 s stall at ~2.2-2.8 s (not the pipeline build; untouched).
- Next: enable on a real iPhone via ?prewarm=1 and read doc.lf/prew; flip the default once the freeze is gone, then raise the touch-first-frames curtain budget by prew.ms.
