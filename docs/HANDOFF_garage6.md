# Garage worker 6 handoff (2026-10-07)

## Done: v87l NEW BUILD. Reviewer PASS on aba9902; DEPLOY sent to the coordinator (alex/od-garage5 2079d63, out/v87l)
- Base: the live v87k source, ported onto the v87j module layout (10_core, 70, 71 and 95 from alex/od-w10). verify_live gives LIVE_MATCH.
  Note: od-w10 re-split live, so the garage modules sit inside 98_garage_driver.js there. This branch keeps 98g/98p/98q/98r separate.
- src/98r_garage_newbuild.js changes:
  - The builder view is raised 12% (setViewOffset) while in builder mode. Before, the car's nose sat on the parts panel and Chrome's touch adjustment sent hood taps to the panel buttons.
  - gap() counts only wheels inside visible forms.
  - New probes `__gnb.saved()` and `__gnb.fit()`.
- t4/nb.js:
  - Builds a Poseidon-style car: hl, tl, arch×2, b16, ws4 (before the hood), cs24 hood, cs24 rear (rot 2), spoiler, t16.
  - Paints the hood and the door stripes white.
  - Taps again when a slow frame turns a tap into a long press.
  - Checks the save key (mho_build).
  - DRIVE=1 holds GAS with a real touch until 25 km/h.
  - Run it on out/<ver>/index.html (split). Do not use ?fast=1: fast mode freezes the builder canvas in shots.
- Results: 15 → 33 bricks, save 33=33, 35 km/h in Frankfurt, tyre gap 0.03 m, 0 console errors. Shots: docs/shots/garage6_newbuild/.

## Follow-ups (from the reviewer)
1. A low side view of My Build next to a traffic car.
2. A 12 px check on the builder part-button labels at 852×393.
3. Open: the spoiler can't be painted with a tap; the cause wasn't found (nb.js paints the door stripes instead). On phones the ✔ DONE button wraps to a second toolbar line (this was there before this work).
