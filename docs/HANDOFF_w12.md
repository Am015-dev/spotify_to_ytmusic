# Worker 12 (2026-10-07): Autobahn asphalt on the ground + LEGO paint. Build out/v87m (on live v87l c4345ca). Reviewer PASS 889218f (perf condition met).
## 1. Tyres sunk 0.37 m into the Autobahn
Root cause: `abBuild` (60) drew the ribbon at groundY + r.y*2.5 (0.25-0.6 m); physics/traffic use groundY. Also ART8's `abStrip` (98) checks only midpoints, so 10x38 m cells sagged 7-13 cm off groundY.
Fix: `AB_RY(r)=.03+r.y*.1` (53) for ribbons and boost pads (70); `W12_abStrip` (60) checks every triangle on a 2 m grid, adds columns/rows until |asphalt-groundY-AB_RY| <= 2.5 cm.
Result: player gap Autobahn -0.016..-0.027 m, city -0.007..-0.009 m; 152 random Autobahn points: asphalt 2.2-5.6 cm over groundY, grass >= 5.8 cm under it. +64k tris.
Open (pre-existing, not touched): city start spot is a grass lot with no road mesh, tyre +0.06 m.
## 2. Red read pink
Root cause (side-view probe, `tools/tW12.js VAR=1`): player paint got sky env at 1.2 (traffic .6) -> blue-white veil on low channels; Neutral tone map desaturates bright saturated paint to white.
Fix (90, end): player vertex-colour paint env cap .6 (`W12P.env`), hue-preserving soft knee (K .55 -> .76) after opaque_fragment on car materials only (`W12_paint`, chained onBeforeCompile + cache key).
Red 245,51,69 -> 238,21,22; blue 58,110,246 -> 9,94,234; yellow 249,200,80 -> 238,179,21.
## Perf (tools/fpsCmp.js, + autobahn route; ms/frame median, software GL) live v87l vs v87m
park 624.2/616.5 (-1.2%) · hill 646.7/648.2 (+0.2%) · city 604.5/610.1 (+0.9%) · autobahn 408.3/411.4 (+0.8%).
## tPlay FAST phone 2 min: fra stuck 6.5 %, ath 6.9 %, DRIFT 'hidden' after rotations: identical on live (pre-existing). 0 console errors.
Tools: tools/tW12.js (TAG=… paint before/after; VAR=1 env/tonemap variants; RIB=1 ribbon-vs-ground sampler, PT='[[x,z]]'), tW11.js side/tyre.
