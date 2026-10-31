# hills-r30t handoff
1. Root cause: memFree packed the Athens ridge as a streamed chunk centred on the world origin (bounding sphere taken before the group follows the camera), so far from the origin the stream hid it for good.
2. Fix: `'ridge'` added to MEMF.skip in src/98mf_memfree.js (camera-following backdrop, never freed/streamed; also covers the Frankfurt ridge). Memory cost: a few KB of CPU arrays.
3. GO `bug/ath-hills-drawn` (src/99c7_rev5fix.js): layer 0 + visible + drawn at spawn, origin, (-2600,2400). FAIL 0/3 before, PASS 3/3 after.
4. Gates on built page, phone profile: unit 0 FAIL, TAG=glbuf PASS (now takes the no-stream-entry path), default gate 78/78. Under 6x CPU why/solid-bld and why/quiet-start fail identically on the unfixed build (not caused by this).
5. Shots docs/shots/hills30t: far spot shows blue-grey hills after, none before; at the spawn buildings block the horizon in both.
