# V85 handoff (branch alex/od-v85, last deploy v85c = 7f03dbe; beta artifact v61)
1. Patch order: od-v84 build + pQA8 + pV85.py (module v85.js). Rebuild: copy pre-v85 overdrive.html, `python3 pV85.py`, split with tools/split_km.py.
2. v85: HUD diet (minimap, speed, one objective line, 5 s cards), soft speed-scaled steering + road auto-align, drift = BRAKE+steer, lower camera, less fog/bloom, graded dark asphalt, hot-drop road ribbon + rolling start.
3. v85b/c: Pointer Events + capture on controls (iframe/WKWebView robustness, unverified on a device), SPEED DEMON 160 km/h as one small line, dusk/dawn tint warm, procedural window grid in the LK shader for plain vertical walls.
4. v85c fixed my own v85b bug: BRAKE had been moved on top of GAS (CSS in v85.js).
5. Open: the giant beige/plain blocks in Athens are NOT identified. They are merged BM.plain meshes (hub children ~1415/1585); the window grid is only a stand-in. Roads were not simplified; no edge water added (Alex: no water at edges).
6. Landscape-buttons bug not reproduced in Chromium (59 px insets, rotation, hit-tests clean); WebKit and the artifact iframe are untested.
7. Tools: tools/dev.js (persistent phone browser with HTTP control), tools/tHit.js, tools/tShot.js; start a static server on :8766 first.
8. Test clock gotcha: dev.js starts the fake rAF clock at performance.now(); otherwise Athens shows a huge uFlash/uHit wash.
9. pLG1.py (LEGO designs) was not received here; forward to session_018zxcXZaWQxSCR3kmdPxWMZ if it arrives.
10. No further deploys from this session.
