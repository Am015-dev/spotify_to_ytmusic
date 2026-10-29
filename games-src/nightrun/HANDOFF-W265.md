# W265 make the x2 expansion safe (branch nr/W265-expand, from nr/W256-expand + main working branch)
Flag RET.expand (?expand=1) stays **default OFF**. Originals untouched. Not deployed.

## Per strip: 44 KEEP (technically), 23 DROP
Gate now silhouette overlap >= .88 (was .85). Newly failing: kai/idle (.862), mech/idle (.871). Rejected by the numbers (13): boss-messe-waechter, boss-sek-adler, boss-zentral-ice, drone, fx-shield/glow, kai, mech, prop-banner, prop-beacon, prop-car, prop-drone, prop-steam, sniper.
LOOK (contact sheets old/new, all 54 that passed) dropped 10 more although the numbers pass: gunman/idle and jetpack/hover (ghosted gun arm / flame), prop-holo/loop (glitch frames blur to ghosts), boss-kronos/idle (smeared doubled spikes), ship-ebait (bright flame blob), ship-egate (ghost beacon), ship-esplitter + ship-emine (doubled flame / spike), ship-eshielder + ship-hv (grey streak behind the flame). They are listed in SKIP in strip-expand.py.
KEEP (44): bosses bruecken-waechter, flusskrake, hoplite, schranken-wart, talos, tresor-wart (idle); foes bruiser, grunt, knife, shield, turret, warden (idle); props neon, police, windows (loop); 26 ship-*/flame (all except the dropped ones). Soft spots seen but kept: talos and flusskrake in-betweens are slightly softer in stills.

## Media
Added media: **31.3 MB lossless** (webp method 6; was 41.9 MB): bosses 6.8, foes 2.0, props 2.3, ships 20.3. Target <= 8 MB NOT met.
Lossy q90 + alpha q100 would be about 10 MB (12.7 MB measured on the earlier 56 set) but it changes the original frames inside the x2 strip (worst premultiplied error 20-45 levels, p99.9 10-18), which breaks "originals within 1 level", so it is not shipped. `EXPAND_LOSSY=1 python3 games-src/scripts/strip-expand.py` writes lossy and refuses strips whose originals exceed EXPAND_TOL (default 1): nothing passes at q90.
Original frames are pixel-identical inside every written x2 strip (checked after re-reading the written file).
To reach 8 MB: keep only bosses + foes + props (11.1 MB, still over), fewer ships, or accept lossy. Owner decision.

## Bugs fixed in the wiring
- street3.js: the on-foot idle ping-pong ran at S3.IDLE per frame, so an x2 strip (twice the frames) took twice as long. Now rate x2, and the loop-closing in-between is left out of the ping-pong (cycle time unchanged).
- art.js drawAnim: ART.anim first, so record and strip never disagree for one frame when the x2 strip finishes decoding; the aS record carries x2.

## Wire check (headless, all 44 keys, flag 0 vs 1)
Cell w/h, anchor, body identical; frames x2; fps x2; cycle time (holds from smoothing.json repeated per pair) identical to 1e-6; frame-0 render bbox diff 0 px, same pixel count. Hitboxes not touched (art only). Lazy load: the original plays until the x2 strip is decoded; the switch step is pixel-identical (0). Loop point: wrap step <= largest normal step on grunt / hoplite / ecruiser (no flash).

## Perf (phone 390x763 dpr 3, 4x CPU, flight, 6 s rAF, 3 alternating runs; headless noise about +-10%)
off 15.9 / 14.1 / 15.8 = 15.3 fps; on 15.5 / 15.2 / 16.4 = 15.7 fps. JS heap 9.4 MB both. x2 strips fetched in flight: 5 files, 1.27 MB. Decoded bitmap memory is outside the JS heap and was NOT measured. No console errors.

## Real input
Phone touch (tap FLIGHT, tap ON FOOT, taps in play) and PC mouse + keyboard (click FLIGHT / ON FOOT, arrows, space, D): both modes start and run, no console or page errors; x2 strips drawn in play (ship-std flame, prop-police, grunt, bruiser, shield, knife idle).
LOOKED at: phone street shot with bruiser, shield, knife and Kai: crisp, no ghosting.
NOT verified in play: an expanded boss idle (the lab boss never entered within 20 s). Boss strips were only checked on the contact sheets and by the static draw test.
Scratchpad (not in repo): shots /tmp/claude-0/-home-user-spotify-to-ytmusic/a1ee3a00-b530-5318-b87b-e17d40ab92e7/scratchpad/shots/ ; contact sheets .../scratchpad/sheets/sheet00..13.png

## Flag default: leave OFF
No real-device fps run, decoded-memory cost unmeasured, boss idle not seen in play, 31 MB against the 8 MB target. Next: owner picks the media budget (drop ships? lossy?), then one real-phone run.
