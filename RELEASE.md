# Release 82 — PHASE 2 BUILD (full test matrix RUNNING, results pending)

## Phase 2 patch order (onto base.html = live v81)
```
./reapply.sh pAU1.py pAU2.py pOG1.py pOB1.py pOB2.py pOB3.py pOC1.py pCV1.py pCV2.py pRL1.py pJU1.py pGB1.py   → REAPPLY_OK
python3 tools/split_km.py overdrive.html out
```
otg2 (pAU1, pAU2, pOG1) → ownerbugs (pOB1–3) → ownerbugs2 (pOC1) → cityvar (pCV1, pCV2) → **pRL1 (integration)** → juice (pJU1) → garage (pGB1). Workers' pDR*/pSM* go last.
- pAU1 swaps v81's embedded AU block for the new au.js (v81 contains docs/modules/au.js exactly). pAU2 skips the text swaps v81 already has.
- Conflict fixed: pOC1 and pCV2 both edit the Athens `const put=(U,x,z,ry,c,s,fr)=>{` line. pCV2.py now accepts either form and inserts `CV_put` after `OC_fix`.
- **pRL1.py (new):** in the 2a run, tOC's height audit failed in Athens A–D (thousands of poly buildings outside the owner's per-district storey range). The cause is CV's ±1–2 storey variation, and its 7–12 storey Kifisias towers, being applied after OC's clamp. pRL1 clamps CV's storey pick through `OC_fix`, inside the expression, so CV's details use the final height. Side effect: the Kifisias glass towers are capped at OC's district maximum.

Sizes: overdrive.html 3,727,384 (over the 3.6 MB cap → split is mandatory) · out/overdrive.html 1,761,673 · out/km.js 1,961,521.

---
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
