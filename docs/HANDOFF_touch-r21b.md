# touch-r21b
- Free-roam touch drift now starts with steer + BRAKE held (2 thumbs, GAS not needed) at >= 43 km/h (src/98k_boost2k.js, one clause in B2K.req); D26 still needs BRAKE held 0.35 s with |steer| >= 0.5, so a tap only brakes.
- GO `phone2/touch-drift` (src/99c7_rev5fix.js): real touch events on BRAKE + steer field, GAS off, asserts RO.dDir = 1 within 0.8 s game time and a 0.15 s tap does not drift. PASS; unit 0 FAIL; TAG=life1,xf1,terrain,phone2 45/45 on the built page.
- No UI added (no new button, no HUD change); on-screen hint texts still say GAS+BRAKE and still work.
- Left: hint/tutorial text could say "steer + hold BRAKE"; a visible DRIFT button was not added (5-button rule, v85 CSS hides #tD). No real-phone check yet.
