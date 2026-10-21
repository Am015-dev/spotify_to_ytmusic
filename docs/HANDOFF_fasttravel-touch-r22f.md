# HANDOFF fasttravel-touch-r22f (2026-10-21)
- Root cause: `#roamFT` lost the CSS cascade (96_scale_qa `bottom:auto` is earlier than the 00_page rule `bottom:12px`), so on the map it became a 299×338 px slab (top 10 → bottom 12) covering the map; refusals (cooldown 15 s, event running) only used `say()`, whose HUD toast is not visible under the map, so a refused tap looked like a dead button.
- Fix: `#roamMap #roamFT` (higher specificity) = 44 px high, top centre; `ftNote()` in 70_roam_world.js also prints the refusal on the button while the map is open.
- GO `travel/ft-touch` (src/99cft_fttouch.js, before 99_api.js): touch pointer + click on the button centre, asserts it is the hit element, 44-90 px high, and you arrive at the garage (3510 m, 2.4 s).
- Lab could not reproduce a dead tap on a free-roam car (touch, dsf 1 and 3); if Alex still sees none-click, it is a refusal state (event active / 15 s cooldown), now visible on the button.
- Left: the HUD toast (#msg inside hidden #hud) does not show in roam in the lab test page; not checked on the real page.
