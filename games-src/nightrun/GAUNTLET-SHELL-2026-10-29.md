# GAUNTLET-SHELL (W262, 29 Oct 2026)

Test: `qa/gauntlet-shell.js` (real touch taps on 390x763, real mouse + keyboard on 1440x860; sections title, settings, behaviour, back, load, saves, sw; `SECTION=claims` measures the Assist promises). Reuses `qa/lib.js`; `qa/flow-test.js` and `saves-test.js` were run first and pass; `ret-pwa-test.js` partly run (its listed checks passed), the rest unfinished.
Every settings row (39 on PC, 38 on a phone) was pressed option by option: the press lands on the control, exactly one option shows pressed, the value is in `mnr_set`, the game follows where a check exists, the final state survives a reload, and DEFAULTS resets and stores. Sliders: tap at 25% and 75%, printed value, stored value, keyboard step.

| # | defect | evidence | fix | re-run |
|---|---|---|---|---|
| D1 | A save with `mnr_best` = `null` (valid JSON, damaged) stops the game booting: no title, 4 page errors | boot with each corrupt key alone; only `mnr_best` failed | `load()` in parts/core/a.js returns the default for a stored null or wrong type (one owner of every `mnr_*` read) | all 10 corrupt keys boot; saves section PASS |
| D2 | Escape did not leave the LAB (EXIT button did) | back section: Escape pressed, title still hidden | Escape handler beside EXIT in parts/lab/lab2.js | back section PASS (388 checks, 0 failed, both sizes) |
| D3 | Settings > Quality did nothing: Low, Medium, High gave the same drawing buffer (259378 px phone, 1166400 px PC) | behaviour section | parts/core/b.js: under the current look the pixel size is scaled by QD[q]/QD.M for Low; Medium and High keep today's size (High cannot exceed the screen's own resolution) | behaviour section PASS |
| D4 | FPS counter row was offered on a phone but the counter only draws on a PC or with ?test=1 | `FPSOK()` false on touch; behaviour section | parts/hud/c.js: the row is hidden when the counter cannot draw (`FPSOK0`) | settings + behaviour sections PASS |
| D5 | (test bug, not game) `rm` / `hc` first matched the hidden Comfort copy; calibration, mute row on the wrong page; ON FOOT first-time story card needs SKIP; offline stage start waits up to 8 s | script errors in the first runs | script fixed | n/a |
| D6 | OPEN: the INSTALL APP / "Offline ready" row is only built by the MORE sheet, which FOCUS mode hides, so a player never sees the install button or the offline note | code read (ret.js RET.pwaX.build hooks `#moreBtn`) | not fixed: where it should live (Settings > More) is an owner decision | none |
| D7 | OPEN (test): `ret-saveio-test.js` fails "buttons readable" at 3 sizes because the backup buttons now live on the Settings > More page; the game works (gauntlet saves section passes) | existing test | not fixed: old test selector | none |

Not covered, said plainly: garage / hangar purchases, shop, pit stop, daily, story map, stats, profile, tutorial, what's-new. They are hidden doors in FOCUS mode; `hub-test.js` and `menufix-test.js` were stopped unfinished, so there is no result for them from this pass. Keyboard focus order was checked on the title only (not inside settings). Nothing was deployed.
