# HANDOFF phone-1 (phone HUD, 2026-10-16)
- Code: src/99ui_hud.js (phone-1 block) + 1 line in src/99_api.js (TAP TAP pill 22 px above ◀ ▶). Shots: docs/shots/phone1/{before,after}, script tools/tPhone1.js.
- Done: all touch labels ≥ 12 px (BRAKE/BOOST/DRIFT/FIRE/GAS 15 px); score popups (#juPop, #hitPop, #roamCombo, #feed) in a small column under ⚙ at the right edge; objective pill wraps inside the screen (portrait: between minimap and ⚙); race result (#spRes) hidden until the car < 1.5 m/s (4 s cap); BOOST sized next to GAS in portrait; extra ✓ n/N chips deduped.
- Measured (built page): unit 0 FAIL; rv2k2/tiny ✅ landscape + portrait (0 px < 12); rv2k2/hudctl ✅ 4/4, 0 px² both orientations; rv2k/devui ✅; life1 ✅ except life1/ath-density.
- Not mine, same on the untouched baseline: rv2k/objectives = 3 widgets (roamArrow + roamPop + crSmHint) when run alone, life1/ath-density ❌. Popup column was checked by rect (JU_pop does not paint in the ?test start).
- Left: roamPop quest-progress card ("SMASH 20 0/20") still sits over the objective pill at the top centre in portrait; couldn't find the 2nd ✔0/26 chip in the DOM, so dedupe is a guard only.
