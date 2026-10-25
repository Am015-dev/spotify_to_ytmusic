# W256 expand small-motion strips (branch nr/W256-expand)
Owner: strips are EXPANDED, never replaced. Originals untouched; flag RET.expand (?expand=1, default OFF).

## What was built
- games-src/scripts/strip-expand.py: optical-flow in-between (k=1) per pair, premultiplied warp, loop closed, lossless webp, originals checked pixel-identical after re-reading the file. Out: media/anim/<who>/<act>x2-strip.webp + sheets/<who>/<act>x2-strip.json (frames x2, fps x2), media/ready.json, sheets/expand-report.json.
- Auto-check gate per in-between: semi-transparent area <= 2x larger neighbour; silhouette IoU with both neighbours >= 0.85; colour drift < 6/channel; originals identical.
- Result: 56 strips written, 11 rejected (not written): boss-messe-waechter/idle, boss-sek-adler/idle, boss-zentral-ice/idle, drone/idle, sniper/idle, fx-shield/glow, prop-steam/glow, prop-banner/loop, prop-beacon/loop, prop-car/loop, prop-drone/loop. Both glow strips fail (soft rings change shape faster than the 85% overlap allows).
- Wiring (one owner each): flag in parts/street/streetfeel.js (next to RET.bodyscale); ART.x2 + aS/anim in parts/art/art.js (x2 strip used when decoded, else the original; in-betweens replace the idle/flame cross-fade; owner holds repeat per pair); build.py _anim() puts x2 sheets in ART.ANIM.x so ART.ANIM.s counts are unchanged.
- Cost: +41 MB of lossless media (lazy loaded, only fetched with the flag on). Re-encode with a slower webp method would shrink it.

## Gates
- Phone fps (local build, 4x CPU, flight, 6 s rAF): off 9.5 / 14.7, on 12.5 / 12.3. The sandbox is too noisy (+-25%) to prove "within 5%": not conclusive; re-run on the real device before turning the flag on. No errors, x2 strips fetched (5) with flag on.
- Hitbox: unchanged (art only, same cell size/anchor). Streetsim: not run (no logic touched).

## Review pack (scratchpad, not in repo)
Dir: /tmp/claude-0/-home-user-spotify-to-ytmusic/dd89dc31-a6b9-518b-8bbe-2b69a77961e5/scratchpad/pack  (<who>-<act>-old.gif, -new.gif, -before-after.png)
- boss-hoplite/idle, grunt/idle, kai/idle, ship-ecruiser/flame, fx-shield/glow (REJECTED, shown for reference), prop-neon/loop.
- Looked at the PNGs for kai idle, grunt idle, ship-ecruiser flame, fx-shield glow. Did NOT eyeball hoplite and prop-neon (they pass all numbers: overlap .93/.995).
- Honest verdict: flame BETTER (smooth pulse, no artefacts); grunt idle SAME-to-slightly-better (a touch softer in stills, smoother in motion); Kai idle WORSE in stills: in-betweens are softer and show a grey smear behind the boots (overlap .862, only just passes). Recommend excluding kai/idle or tightening the gate to overlap >= 0.88 before enabling. Shield glow would look fine but fails the gate.
