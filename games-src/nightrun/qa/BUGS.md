# QA runner findings (W124, 21 Oct 2026)

Run: `bash games-src/nightrun/qa/qa.sh` (QA_ONLY=monkey,soak,save,perf,assets,sweep,canvas to pick). About 8 min; PASS/FAIL lines. Runs on a fresh build of parts/. Details of each check: header comment of each qa/*.js.

## Fixed
1. Garage perk cards (390x763): the "TRADE-OFF: ..." chip was `white-space:nowrap` and stuck 40 px out of its card. Fix: parts/strategy.js line 89, `b.bad` wraps. Sweep passes on a fresh build.

## Open (for the orchestrator)
1. Story intro, 844x390 landscape: canvas text "1 · FIRST RUN" overlaps the stage hint "Deliver the data..." (434 px2). Repro: `node nightrun/ui-align-test.js` with VP=844x390 ONLY=story-stage.
2. Boss HUD, 844x390 landscape: "BREAK 1/2", "ARMOUR HOLDS" and "Fly to each drone ro..." overlap each other (485-677 px2). Repro: VP=844x390 ONLY=hud-boss. (Pre-existing; W112 noted garage-looks/story-map at the same size.)
3. 390x763 hud-run canvas check failed once in one of two runs (1 finding, not captured); flaky overlap, re-run ONLY=hud-run a few times.
4. Perf, stage 6 (stepped, god mode bot): frame cost p95 about 90 ms against p50 about 16 ms in two runs; about 5% of frames hitch (max 180 ms). Other stages p95 30-55 ms. Repro: `FRAMES=500 node qa/perf.js` and read the stage-6 line. Objects per frame p95 reached 71-74 on endless and stage 14 (diet target 64; the gate is 80).
5. Monkey, seed 1: button "CORE" (forge slot, text only, no id) changed nothing on 3 of 3 taps (the page text did not change; may only redraw a canvas). Check parts/forgeone.js line 169 area. May be a false positive, a selected slot tapped again.
6. Soak (10 game-min, 3 districts, 74 pit stops): no failure. JS heap 11.7 -> 13.2 MB (+13%, steady upward slope, under the 30% gate). Watch it.

## Checks that pass
save/resume (13), asset-load (417 files, 229 anim strips, all decode, no placeholder), phone sweep (66 screen openings, nothing outside the viewport), DOM text overflow (after fix), soak.

## Runner notes
- Monkey saw `blob:` "failed requests" (audio object URLs aborted on reload); lib.js now ignores blob: URLs. Not re-run after that change.
- Frame-time gates are loose (p50 33 ms, p95 100 ms) because this box draws on a software canvas; draw-call gate 250 (measured 100-135).
- Not run in the final pass because of the 45 min stop: a second monkey run after the blob filter; FULL=1 soak.
