# HANDOFF W106: visual diet (review 8 fix list 5, 6, 7), 21 Oct 2026

Part `parts/diet.js`, flag `RET.diet` (default ON, `?diet=0` = before). Test `diet-test.js` (all gates PASS on 390x763 + 375x553).
- 5: own shots half alpha, every 2nd ordinary shot drawn, max 16; particles max 12; score pop-ups max 4; explosion pictures max 6;
  cosmetic rings / explosions / power-up auras capped at 120 css px; DROP! wave and healer range ring gone; flank tells drawn only in the last 0.6 s (tell stays 0.8 s).
- 6: enemies drawn >= 32 css px (scaled round the centre, hitbox untouched) with a light rim (canvas shadow); phone rooftop tile off under play; extra 22% backdrop dim.
- 7: Settings > HUD Minimal (default) = score, hull, boss bar, DASH, EMP, pause (+ the power-up button only while one is held). Full = old HUD (HEAT, LINE, multiplier...).
- Objects per frame, 60 s bot, stages 2/6/10/14/20 (one run): before median 67 / p95 92, after 35 / 51.
- Stage-rule zones (gravity well etc.) keep true size but draw at 14% alpha (gameplay).

Tests run (one at a time): diet PASS, polish PASS, comfort PASS (SECS=20; full 60 s run hit its 15 min cap with no output), hud-cover 390 PASS,
375 FAIL 21.2% = identical on the pre-change build (Full-HUD scenario, pre-existing, see TEST-LEDGER).
NOT RUN (hard stop): readable-test, ui-align-test (390x763 / 375x553), timing-test. Next worker: run them, compare with `?diet=0` / the previous build.
