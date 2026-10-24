# W218 (HUD overlaps + live smoke failures)

Fixed (all in HUD/menu/UI code; flight and street drawing untouched):
- hud/multhud.js: one caption at a time. The "SCORE MULTIPLIER" line shows only in the free row and not while a banner, hint, EXP/ZH caption or boss bar is up; CHAIN BROKEN is drawn in the bar next to the number, never as a second row.
- powers/power.js + powlevels.js: power card "NAME LVn" is one label that shrinks to the room left of "N BARS" (was two texts that met).
- street/streetguard.js: GUARD button key covers every button, so a relayout that puts BOMB back no longer leaves GUARD on top of it.
- render/diet.js, hud/c.js: the ♪ now-playing note is not drawn on a touch screen in landscape (it sat on PAUSE / DASH).
- menus/ui2.js, hangar2.js, hangar3.js: selected pink #c8308a->#9c1d63 (contrast); ui2: back arrow plate padding 0 so the glyph is centred.
Tests that were stale (live title is FOCUS mode, street is one level, hangar MORE is tiles): hub-test and story-test open with ?focus=0; hub-test uses #h3M_* tiles; labfull-test expects 1 + checkpoints foot sections; ui-align-test skips the covered check for pointer-events:none labels (DASH / EMP words).
Not reproduced: the "stray big letter over the hint line" (no <=3 char text >= 24 px in the top 400 px over six stages, 9 s each).
Still failing at base, not HUD: fingerprint fly2 (and 2 others), sprites "hoplite boss arrives" (parallel flight/street workers).
