# HANDOFF W262 (gauntlet, shell)
Branch nr/W262-gauntlet-shell. Done: qa/gauntlet-shell.js, GAUNTLET-SHELL-2026-10-29.md (defects D1-D7), CLAIMS-SHELL-2026-10-29.md, fixes D1-D4 (parts/core/a.js, b.js, hud/c.js, lab/lab2.js).
Left: run hub-test.js and menufix-test.js to the end and add hangar / shop / pit stop / daily / map / stats / profile rows with `?focus=0`; measure the UNTESTABLE claims (assist speeds, beat window, repetitive sounds); decide D6 (install row placement); fix the stale selector in ret-saveio-test.js (D7); keyboard focus order inside Settings.
Run: `NODE_PATH=$(npm root -g) node games-src/nightrun/qa/gauntlet-shell.js` (about 6 min; SECTION=... for one part).
