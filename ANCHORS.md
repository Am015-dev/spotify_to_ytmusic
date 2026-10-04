# DR anchors (alex/od-drive)
| patch | anchor | what |
|---|---|---|
| pDR1.py | `window.__mho={` (insert before, 1×) | drp.js: `window.__dr` measurement API only (no behaviour change) |
| pDR2.py | `window.__mho={` (insert before, 1×) | dr.js: driving-flow fixes |

Apply last (after cv/ju/gb/ownerbugs modules). Both apply cleanly on devkit base.html (live v82), release-82 overdrive.html and plain v81.

Functions dr.js wraps (reassigned module-scope `function` bindings): `CE_streets` (after cityvar's wrapper), `lzPropsG`, `smashCheck`,
`buildHubTraffic` (after cityvar's wrapper), `hubTrafficStep` (after cityvar's wrapper).
Reads: `cityAt fillAt abAt lzRoadD trailDist mtnDist CE_roadE inRiver onAnyDeck inR PARKS PLAZAS LMX hillH groundY cbox mergeG gridAddTo HUB RO`.
CSS: one `<style>` appended for `body.touch #qTrk …` and `body.touch #roamPlate` (landscape). Disable everything with `?dr=0`.
