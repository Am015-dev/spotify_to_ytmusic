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

## Done: v87n (follow-ups). Reviewer QUICK PASS on 2c42a8f; DEPLOY sent to the coordinator (alex/od-garage5 8d9f28f, out/v87n, on live v87m 55e8c4d)
- Base: the v87m source from alex/od-w12 (files 10, 53, 60, 70, 90), ported onto this branch's split garage-module layout. verify_live gives LIVE_MATCH.
  The od-w10 and od-w12 workers re-split live, which puts the garage modules back inside 98_garage_driver.js. Port with `git checkout origin/<their branch> -- <non-garage files>` and then run verify_live.
- Builder text is now 12 px or larger on phones (part buttons, toolbar, limit chip). The toolbar fits on one line: the chip reads "🧱 n/120 · class" on phones, and the button reads "🆕 NEW". The check is `t4/px12.js` (lists visible texts under 12 px).
- Side view: `t4/nbside.js` builds the car through the builder hooks, freezes a traffic car and parks My Build behind it.
  The camera is set through the `__gnb.cam([px,py,pz,tx,ty,tz])` test hook (composer wrapper; `__gnb.cam(null)` turns it off).
  Shots: docs/shots/garage6_v87n/.

## Follow-ups (from the reviewer)
1. Done in v87n: side view and 12 px.
3. Open: the spoiler can't be painted with a tap; the cause wasn't found (nb.js paints the door stripes instead). (DONE wrapping is fixed in v87n.)
