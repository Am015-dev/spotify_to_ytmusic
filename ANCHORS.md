# BA anchors (Athens + touch play-test fixes)

Patch order: `pBA1.py` (only patch).

| # | patch | anchor (exact old string) | what happens |
|---|---|---|---|
| 1 | pBA1.py | `window.__mho={` | the whole of `ba.js` is inserted immediately **before** it. Nothing else changes. |

Runtime re-binding (not a text anchor): `ba.js` wraps the module-level function `M1_tw` (ITEM button placement, from m1.js):
`M1_tw=(f=>function(){f();…})(M1_tw)`. The original runs first; the wrapper only moves `#tW` down if it hits a top-right HUD button.
All CSS is in one `<style id="baCss">` added at load. Selectors used: `#roamGauge`, `#athDP`, `#roamPark`, `#roamPlate`, `#roamMap .mh`.
