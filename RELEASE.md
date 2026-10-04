# Release 82 (phase 1): v81 + cityvar + juice + garage

## Patch order (onto base.html = live v81)
```
./reapply.sh pCV1.py pCV2.py pJU1.py pGB1.py     → REAPPLY_OK
python3 tools/split_km.py overdrive.html out      → out/overdrive.html + out/km.js
```
| # | branch | patch | anchor |
|---|---|---|---|
| 1 | alex/od-cityvar | pCV1.py (cv.js) | `window.__mho={` |
| 2 | alex/od-cityvar | pCV2.py | Athens `const put=(U,x,z,ry,c,s,fr)=>{…` |
| 3 | alex/od-juice | pJU1.py (ju.js) | `window.__mho={` |
| 4 | alex/od-garage | pGB1.py (gb.js) | `window.__mho={` |

All anchors applied cleanly on v81 (none of them uses a longer `window.__mho={xyz` anchor). Module order in the page: cv → ju → gb → `window.__mho`.

## Sizes
| file | bytes |
|---|---|
| base.html (v81) | 3,547,490 |
| overdrive.html (unsplit) | 3,623,051 (**over the 3.6 MB cap** → deploy the split build) |
| out/overdrive.html | 1,661,602 |
| out/km.js | 1,961,516 |

## Tests (each in its own dir + own port, every *.js re-ported; `tools/mktestdir.sh <name> <port> [split]`)
| test | unsplit | split (out/, km.js beside it) |
|---|---|---|
| `node smoke.js .` | SMOKE PASS 12/12 | SMOKE PASS 12/12 |
| tCV.js rules | 28/0 (ALL PASS) | — |
| tJU.js (ROUTE_S=180 CALM_S=90 PERF=1) | 52/2 | — |
| tGB.js | 32/0 | — |
| tools/tBA.js | 30/0 | 30/0 |
| tools/tBF.js | 9/1 (BF3 known) | 9/1 (BF3 known) |
| tools/tOut.js (real deploy files out/overdrive.html + km.js, three.js CDN URLs routed to the vendored r164) | — | OUTBOOT PASS (KM blob loaded, car drives, 0 errors) |

The split build was booted for the first time here: smoke, tBA and tBF pass on it the same as on the unsplit page.

### Failures / fixes
- **tBF BF1 (fixed in the test, tools/tBF.js):** gb.js now refuses the garage during an event (on purpose, same intent as BF2). The test forced the hidden button and expected the garage overlay. That left the pause menu open and caused 3 more failures (BF1 "map closed", BF5 camera, and a crash on `#rcGo`). Bisect: base v81 and cv+ju pass; gb only fails. The test now asserts "garage refused, pause closed, event still running" when the overlay doesn't open. No game code changed.
- tBF BF3 "car stuck inside a building": known harmless (terrain).
- tJU "fra: time to top speed 3.77 s (target 4–6)": base v81 with JU off is also 3.68 s. This comes from v81 handling, not JU.
- tJU "ath: FOV fast 85.37 (cruise 73.08 + 12.3, target +8–11)": a small JU tuning overshoot on v81. Not fixed (tuning call for the juice owner).
- Text in `release/out_boot.jpg` shows mojibake ("Thatâ€™s") because python http.server serves the fragment page without a charset. base v81 is the same: the publish skeleton adds the `<meta charset>`. Not a regression.

Screens: release/smoke_unsplit.png, release/smoke_split.png, release/out_boot.jpg.

## Phase 2 (pending)
Rebuild from v81 in this order: otg2, ownerbugs, ownerbugs2, cityvar, juice, garage. Then rerun everything on the unsplit and split builds.
