# HANDOFF: layout (W111)
- Shipped ON (`?layout=0` = old): fix 20 section pills (one colour, centred), 21 result / pause buttons, 23 stage card beside node + sheet <= 50% + real length (m:ss), 25 live overlap test (stages 1-5, real taps).
- Fix 22 (controls strip below the field at 375x553, label above EMP) is OFF by default: `?strip=1` / `RET.layoutStrip`. With it, hud-cover at 375x553 is 21.0% (max 20%, band cells 5) because the field shrinks and the HUD stays at 11 px type.
  Turn it ON (RET.layoutStrip default true in layout.js) once the HUD diet (W106) brings 375x553 cover to <= 19%; layout-test.js already gates it with ?strip=1.
- Test: layout-test.js (33 checks). Not done: result screen (#stres, clear) was not separately measured, it shares the #over rules.
