# Dead code measurement (consolidation step 7), 22 Oct 2026, worker C2

Result: **0 functions deleted, 0 files deleted, parts/ unchanged (1,961,088 bytes, 16,530 lines in 123 files before and after).**
No function passed the rule "never ran in any drive AND nothing outside other deleted functions mentions its name". Details below.

## How it was measured
Chromium precise coverage (CDP `Profiler.startPreciseCoverage`) attached to every page of every run by `qa/covhook.js`
(`NODE_OPTIONS="--require games-src/nightrun/qa/covhook.js" COVDIR=<dir> node <test>`), counts merged over one build:
fingerprint-test (8 scenarios, 73 s), simhunt (285 runs, 175 s), ui-align 390x763 + 844x390, hub SMOKE=1, menufix 1-3, school, lessons,
labfull, labassets, footstage, foot, story, tutorial, sprites SMOKE, stats, forgeui, saves, tale, hud-cover (22 scripts, about 25 min).
`qa/deadfns.py analyze "<cov glob>"` maps each never-run function to its part file and checks the name against the code corpus
(parts, every test, qa/, scripts/; word match, so strings and `__` hooks count as references).

## Numbers
- 5,317 functions in the page script, 3,558 named; **857 named never ran (24%, 214 KB of bodies)** across all 22 scripts
  (the 9-minute drive alone: 1,360 / 45% / 397 KB). The UI crawl and simhunt exercised about 500 of the drive's "dead" functions.
- Of the 857, only **95 are plain `function name(){}` declarations** (76 found exactly once in a part); the rest are inline callbacks,
  `X.y=function` members, object methods and test-API getters. **Orphaned declarations (safe to delete): 0.**
- 60 of the 76 are still named from live code in a branch the drives never take (46 KB); 8 only from dead callbacks (2.9 KB).
- Unreferenced non-declaration members: 51, 2 KB, nearly all `get x()` test-API getters (tut, school, c): skipped by rule.

## Why nothing was deleted, and what is left
Removing any of the 60 means editing a live caller, i.e. deciding that its fallback never matters. That is a behaviour change, not dead-code removal.
They cluster into superseded fallbacks, each tied to a decision:
| cluster | KB | held up by | decision needed |
|---|---|---|---|
| foot.js placeholder street drawing: drawBg, drawHud, hsh and the body of `draw` after its first line | 4.7 | `draw` returns early when `F.look.draw` paints (hook set by a later street part; check which) | find who sets `F.look`; if always, drop the fallback |
| bg.js procedural backdrops: lmSprite, buildBG, skyline, drawNear, drawHammer, buildBGP, roofLayer, blitL, dispOf | 11 | `bgFor/bgpFor` take the painted stub when `ART.stubOk` | owner: painted backdrops are the only path? |
| footart.js: hum, mac, pp, FA.bg/scenery/pickup/floorY | 12 | FA.draw, painted foot art | same as foot above |
| athens.js + athens2.js: athSprite, drawSea, athensP | 11 | same names defined in both files | check which copy wins, delete the other (step 3) |
| formations.js: 80 of 124 named functions never ran (13 KB) | 13 | pattern tables looked up by name/stage | needs a per-pattern drive (all 45 stages x all variants) |
| rules.js 48/87, lessons.js 47/104, schoolfull.js 31/46, forgeone.js 23/32, wpx.js 15/35, flavor.js 15/50 | 8+4+4+5+4+8 | dynamic tables / UI branches | crawl gaps first (map node taps, chest/medal screens, drill rounds) |
| labassets 20, labfull 22, c.js 37 (test API) | 9+6+17 | Lab menus and `__mnr` stay | none |
Default-OFF flags (not touched): `build2` (choices.js), `fleetArr` (fleet.js), `layoutStrip` (layout.js).

## Next step (suggested, in this order)
1. Owner decision on the bg/foot/footart fallbacks above (one commit per module); this coverage run shows them unreached, the fingerprint must stay identical.
2. Extend the crawl before deleting UI parts: the stage-map node tap (mapPick), market and preset buttons (mktBuy, loadPreset), tutorial offer, save-slot confirm.
3. Re-run `deadfns.py` after each such removal: functions only the removed branch used become orphans and the tool lists them.

## Observed while running (not caused by this task; hook on or off alike)
Failing lines in the unchanged tree: ui-align 844x390 (story-stage, hud-run, hud-boss, game-over), footstage `?footstage=0`, foot (4), menufix (1),
tutorial (1), tale (2): all in the flag-off or landscape halves that the DEL-OFF steps retire. Fingerprint 8/8 identical with the hook on.
simhunt on the same tree: 285 runs, 40 issue kinds listed, 66 unexplained-death runs (37 parked + 29 human), 2 severe kinds: inside C1's 61-69 band.
