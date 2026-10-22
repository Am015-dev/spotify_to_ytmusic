# HANGAR2 review (22 Oct 2026, worker H1): the hangar as a game screen, flag RET.hangar2 (?hangar2=0 = old)

Part: `parts/menus/hangar2.js` (one `PARTS_EXTRA.append` line). Test: `qa/hangar2-test.js`. Screenshots (out of git) with Playwright at
1440x860, 1280x720 and 390x763 dpr 2, bank 140, every hangar tab, before (base build) and after, each looked at.
Player decision it sharpens: "what do I spend on next": the selected item, its effect, level and ONE price button sit in one place next to the
ship and its four stat bars (hull, damage, fire rate, dash), so a purchase visibly moves a bar on the ship you fly.

| tab | before (what was wrong) | after | verdict |
|---|---|---|---|
| UPGRADES (PC) | full-width 2-column grid of long cards, 24-32 px icons, 12-13 px text, every card a different border colour, a full-width BUY button in each card, filter-chip row + "recommended next" strip, no ship | 3 columns: ship bay (painted ship art with slow hover + glow, name, 4 stat bars, 6 equipment slots) / tiles (72 px icon, 17 px name, level, pips, price line) / right panel (112 px icon, 26 px name, level, 18 px effect, pips, one 64 px BUY button, "Need N ◆" disabled state). Chips and the recommended strip hidden; one amber accent | done |
| SHIP (PC) | same long cards; ship pictures 46 px; "Need 20 more" boxed chips | ship tiles with 72 px art, cyan accent, EQUIPPED / BUY / Need N in one plain price line; panel shows the ship and EQUIPPED or the price | done |
| WEAPONS (PC) | 3-column long cards with big UNLOCK buttons, a different border colour per weapon | weapon tiles (72 px art, name + level/LOCKED, pips, price), pink accent; panel: icon, name, LV, one-line effect, pips, BUY LV2 ◆ 11 | done (the "power 1.00x → 1.07x" and LV3 lines are dropped from tiles, effect line only) |
| PILOT | its own screen (classes.js), centred 750 px | unchanged; reached from the PILOT tab or the bay's PILOT slot | not changed (left: own screen) |
| FORGE | its own screen (forgeone.js) | unchanged; the tab moved into MORE (4 big tabs: SHIP, WEAPONS, PILOT, UPGRADES + small MORE) | done for the tab row; the screen itself not restyled |
| MORE: ability / crew / looks | ability: own screen; crew/looks: same long cards | tiles with 72 px icons on PC; per-tab accent (crew amber, ability/looks violet) | done |
| phone 390 | 6 tabs incl. FORGE, chip row cut at the edge, no ship | 4 tabs + MORE, ship bay on top (ship art + name + slot row that scrolls), list below as before (tap still buys at once); tab/slot/tile text >= 14 px (test) | done |
| 1280x720 | same as 1440 | same 3-column layout, panel button at the bottom of the panel, tiles scroll | done |

Gates: build.py ok; screenshots 0 page errors at all 3 sizes; qa/hangar2-test.js 0 failed (PC: 4 tabs + MORE, bay + 4 bars, panel, no chips,
icons >= 64 px, a pressed tile selects without buying, the panel button buys; phone text >= 14 px; ?hangar2=0 = old); hub-test (SMOKE) 0 failed
(forge row now opens via MORE > FORGE); menufix-test 0 failed (updated for layout only: 4 tabs + MORE, FORGE in the MORE sheet, list measured
from under the ship bay); menufix2, menufix3, forgeui 0 failed; garagefix: only 'tabs keep their own scroll' fails, which fails on the base
build too (base: 6 fails incl. SHIP tap target 42 px, now 2); ui-align-test did not finish inside 8 min (not run to the end); fingerprint:
state hashes vary run to run on base and on this build alike (fly10/fly14 differ on base too); run 2 here matched the stored fly2/fly6/boss/
endless10 states, run 1 had other fly2/fly6 states (not seen on base: unproven either way, hangar2 changes no game state); street draw hash differs (draw only); guard.py ok; simhunt: the same 2 severe kinds as base (unexplained deaths).
Input: every tap reaches a button as a synthetic click from the pointerup handler in qa-hooks/g.js, so on PC (>= 1024x600) a pointerdown on
a tile just before its click = 'select'; the panel button or a 2nd press buys. `.click()` from code (tests) and phones keep the old instant action.
Left: the PILOT, FORGE and ABILITY screens are their own overlays and keep their old look; the bay's stat bars come from upgrade levels
(Hull = hull plating + shields, Damage = power core + critical, Fire rate = rapid coil, Dash = dash capacitor), not from ship type.
