# HANDOFF integ84 (2026-10-17): camloop onto trunk? NO, not pushed
- Trunk f986b64+: TAG=life1,xf1,terrain 41/42, red = life1/ath-density (also green on the merged run, so it is flaky). Camloop merged on that trunk: 42/42, unit 0 FAIL.
- Trunk moved to 4ccd800; camloop merged onto it builds, unit 0 FAIL (4923 pass), merge is clean (no conflicts).
- GO cam/stable did NOT finish under tools/tChkGo.js: Frankfurt alone hung 900 s (page lost), and again with timeout 300 on the 4ccd800 merge. Athens never ran to the end. Gate not met, so nothing pushed to alex/od-int2.
- Likely cause: the GO drives 1800 frames with real setTimeout(run,0) chunks under software GL, which is far slower than the 95 s the camloop lane saw; it needs the fake-clock path (like rv2k tkRun) or fewer frames/chunk.
- Next: make cam/stable run on the fake clock (or N=60*30 -> 20*30) and re-run fra+ath alone; then push the merge (branch alex/integ84 holds the clean merge + this note).

## rev84 gate (2026-10-17), NOT pushed to trunk
- Hang cause found: the GO never wrote its verdict into goI._t (the lazy chunk has no goSay), so tChkGo waited the full secs:900. Fix 337da3d: `__chk.goSay` exposed, GO reports through it, secs 90. Drive itself is ~45 s per city.
- Now it finishes, but the verdict is not stable: fra via tChkGo green (64 s); fra standalone probe red twice (tele 1-2, band 3-19); ath red (band 27-41: camera 1-2.6 m while 4x4 at 30 km/h, median 7.4 m).
- Revert test (trunk 98cam_size_cam.js, fra): red too (tele 1, band 3), so the GO does not separate fixed from unfixed yet. The gate band (0.35-2 x median) is also crossed by the real fix when the camera pulls in on narrow Athens streets.
- Next: make the GO deterministic (fake clock / fixed seed start) and judge only the far/close step right after a form flip; then re-run fra+ath fixed vs reverted.
