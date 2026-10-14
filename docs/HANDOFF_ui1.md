# HANDOFF ui-1 (2026-10-14)
1. Done: card (20 words, QV_RAMS shared constant), devui (checklist = left-edge chip outside the garage, 🐞 left edge below it), objectives (src/99ui_hud.js governor: ≤2 widgets, hint only when stopped, portrait hint hidden while moving), single/no save slot skips the picker, intro cutscene 3.2 s/line.
2. Small: keyboard GAS/brake kept under touch input (30_race2), duplicate feed lines dropped, RO.h wrapped when |h|>50.
3. Checker tweaks (99c): objectives GO budget 30 s, m1Next bar not counted as a popup, juPop/crSmPop (score pops) not counted as objectives, boot GO also reports taps.
4. Measured: rv2k objectives/devui/card ✅ (objectives passed 3 of 3 final reruns after being flaky at 3 widgets for one tick); life1,xf1,terrain 38/38; unit 0 FAIL. onboard: ?test start 24.5 s; real STORY path (1 tap, no slot screen) NOT measured on the built page.
5. Left: measure real load→roam (≤30 s needs load-time work, not UI); slot picker only returns with ≥2 saves (set window.__slotPick); shot docs/shots/ui1/first_roam.png.
