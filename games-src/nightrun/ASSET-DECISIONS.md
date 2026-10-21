# Asset decisions for the owner (21 Oct 2026)

## What the viewer's "525 pushed, not wired" really is
- The scan reads quoted names in the game code. Most of the 230 non-strip items (fx-*, fg-*, wpmount-*, wp-*, rule-*-icon, rx-*, ui-*) were already drawn by code that
  builds the name at run time ('fg-'+id, 'wpmount-'+wid, 'rx-'+state, 'fx-w-'+wid+'-bullet'), which the scan cannot see. They are now also listed as literals in
  `parts/arthooks.js` (`AH.IDS`), so the viewer counts them.
- **284 of the 288 files in these groups are generated PLACEHOLDER pictures** (hatched box, label "PLACEHOLDER", made by make-placeholders.py), not art. Only
  ui-bubble, ui-bubble-tail, ui-hud-bars and ui-hud-mult are real, and those were already drawn. `placeholder_guard.py` forbids listing a placeholder in
  media/ready.json, and the game draws a picture only when it is listed there, so the placeholders are (correctly) never shown to players: the code shape draws instead.
  When real art is generated and ingested (ingest-assets.py adds it to ready.json) every hook draws it with no code change.
- To see a hook working now, `arthooks-test.js` lists every id in ready.json for a test page and checks each one draws (and does not draw while unlisted).

## Needs an owner decision (nothing has no place; these are the judgement calls)
- fx-ft-blood-spark: drawn when an on-foot enemy dies (not at every bullet hit). Say if it should be per hit instead.
- fx-eb-plasma: drawn as the enemy "shell" bullet (kind s) when no fx-bullet-shell picture is listed. Say if it should be a new enemy bullet kind instead.
- fx-boom-ground-dust: drawn under rocket blasts on the road and under a warden's death on foot. fx-boom-debris: drawn with a gunship or mine explosion in space.
- fx-pw-pickup-glow (power-up picked up), fx-pw-level-up (weapon level rises), fx-pw-fever-aura (while fever is on), fx-pw-shield-bubble (while a shield charge is up), fx-pw-bomb-pulse (EMP ring): additions over the existing code shapes.
- fx-w34-ui-ring-charge: the DASH / EMP button ring while it is recharging (class rgC); ready and empty already existed.
- fx-eb-shockwave-ring: a ring where a boss fires pulse_ring. The ground shockwave verb keeps its column.

## From the runtime coverage run (W93, 21 Oct 2026)

1. **soon-* (7 real files):** the garage SOON tab (`soonDraw`, meta.js:73) is unreachable since the tab was removed. Put the tab back, show the cards somewhere else (e.g. the end of the MENU sheet), or retire the 7 files?
2. **90 % target:** 564 of 887 images are generated placeholders (not in `ready.json`), so at most 36 % of all files can draw. Real files covered: 234 of 323 (72.4 %). The 89 left have hooks but need moments the headless driver cannot reach (list and reasons in the report). Accept 72 % as measured, or ask for a longer human-played coverage session?
3. **fx-explosion-big / -boss / hit-spark / shockwave / orb-homing:** superseded by the `anim/fx-boom-*` clips; only drawn when sprites are off. Keep as the sprites-off fallback or retire?
4. **spr-* stills (spr-boss-*, spr-en-*, spr-ship-*):** fallbacks next to the strips; 4 of 6 real ones drew only as the strip loads. Keep or drop?
5. **fx-fuse-tag-* (14):** only on the WEAPONS fusion banner; confirm that banner is the intended home (it also needs a fused pair equipped).
6. **ach-* (30), fg-* (44), fl-* (12), rule-*, rx-*, bp-*, ui-* and the remaining placeholder groups:** placeholders by policy; they draw as flat shapes with their hooks already in place and become art when ingested. Nothing to wire.
7. **anim/prop-drone, prop-windows, pk-coin, pk-health:** hooks exist (seeded prop placement, pickup draw); confirm they appear in play, the headless run did not sample them.
