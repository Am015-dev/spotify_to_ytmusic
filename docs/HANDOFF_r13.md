# HANDOFF r13c (sky blue)
- N4 root cause: the sky sphere mesh had no `userData.sky`, so memFree (default ON in the LOWMEM tier) freed its position array after the first draw and the sphere went black on re-upload. Fix: `sky.userData.sky=1` (src/10_core4.js), which MEMF.skip already honours.
- N5: Frankfurt day horizon (.48,.68,.92) -> (.30,.56,.95), fog #b9cff0 -> #a6c4ee (src/98gx_gfx.js). Athens unchanged.
- GO r13/sky-blue (src/99c7_rev5fix.js, both cities): mid + horizon blue (b > r+.15, b > .45), background not dark, sky mesh flagged. PASS with lowmem=1 and 0.
- Shots (852x393, built page): docs/shots/r13c/ (Athens lowmem before/after, both cities after). Unit 0 FAIL; life1/xf1/terrain: only SLOW (>10 s on this slow box) fails, content lines pass.
- Left: no deploy / changelog (coordinator). Athens horizon (.62,.66,.78) is still hazy by design.
