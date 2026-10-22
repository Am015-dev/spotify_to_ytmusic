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

## H2 (22 Oct 2026): fixes after the orchestrator's 1440x860 review
Screenshots (out of git) at 1440x860, 2000x1240 and 390x763 dpr 2, every tab plus MORE (ability, crew, looks, loadout, market, pick, forge), before and after, each looked at.

| tab | was | now | verdict vs HANGAR-AUDIT |
|---|---|---|---|
| SHIP | starter stat bars ~8 % | bars start at 34 % (starter, no upgrades) and fill with upgrade levels (ships differ in their shot, not in these 4 stats) | pass |
| WEAPONS | 8 debug placeholders ('wp-frost 256x256'...), ~40 px art in 160 px tiles, LOCKED twice, faded locked tiles | the 8 placeholder files leave media/ready.json (md5 added to placeholders.json), so no screen shows them; without painted art a tile shows an emblem: weapon colour ring + its projectile art (fx-w-<id>-bullet, else the vector demo); icon canvas 128x128 drawn at 72 px; locked = full contrast + one amber padlock badge + 'UNLOCK ◆ N'; 'power 1.00x' lines hidden | pass |
| PILOT | old inner layout, 12 px text, grey skill rows, panel 'Nothing here yet' | class tiles (64 px emblem in its colour, name, one-line perk); panel: big emblem, name, perk, Power/Speed/Guard bars with words (low/medium/high), the class perk lines, ONE pick button (= #clsPick); skills as tiles (name + XP price); phone keeps the details + pick button under the tiles | pass (class emblems are still the game's vector shapes, no portrait art exists) |
| UPGRADES | pass | text >= 15 px on PC | pass |
| MORE: ability / crew / looks | same frame and tiles | unchanged | pass |
| MORE: loadout / market | empty 'Nothing here yet' panel | a tab without tiles drops the panel and uses its width | partial: the perk loadout's own 13 px rows are not restyled |
| MORE: FORGE | own overlay | placeholders gone there too (same ready.json fix); layout unchanged | FAIL: still its own screen, not the 3-column frame (left for the next worker) |

Gates: qa/hangar2-test.js extended (no visible text /\d+x\d+/, min font 15 px PC / 14 px phone on SHIP/WEAPONS/PILOT/UPGRADES, tile opacity >= .85, no placeholder wp- file in ready.json, PILOT panel with 3 bars + pick button, starter stat bar 30-40 %): 0 failed.
Asset registry: asset-registry.py stops on its own gate (master list and live tree disagree on 247/1088 rows, before this change), so the registry was not rebuilt; the 8 rows (nr.hangar.wp-drone/flame/frost/rail/shell/storm/wave/well) become not-delivered (needs-art) on the next run that passes that gate, because their files are now in placeholders.json.

## H3 (22 Oct 2026): MORE as a page, FORGE in the frame (flag RET.hangar3, ?hangar3=0 = the MORE pop-up and the stand-alone forge)
Part: `parts/menus/hangar3.js` (one `PARTS_EXTRA.append` line). Screenshots (out of git) at 1440x860, 2000x1240 and 390x763 dpr 2: MORE, FORGE empty, FORGE with slot A filled, RECIPES, CREW from MORE; before and after, each looked at.
Player decision it sharpens: "which section do I need now" (MORE: every section is a picture + one plain line + a count, e.g. '0 of 24 forged', '1 on ship') and "is this merge worth its cost" (FORGE: the two inputs and the result drawn big on the left, the cost on the MERGE button and the stat changes in the right panel, next to the recipe list).

| page | before | after | verdict |
|---|---|---|---|
| MORE (PC) | small centred pop-up of 8 plain text buttons over a dimmed hangar | a page inside the frame (same header, tabs, ship bay): 7 tiles with 80 px drawn icons in the section colour, name, one-line purpose, a badge where a count exists (SHOP: Neon, PICK WEAPONS: on ship, FORGE: forged of 24); the right panel shows the hovered tile with an OPEN button; MORE tab lit, no other tab lit | pass |
| MORE section (crew, ability, looks, load, shop) | opened from the pop-up | a tile opens it in the middle column with the right detail panel (hangar2's own frame), MORE stays lit | pass |
| FORGE (PC) | own full-screen overlay, hangar header gone, 3 empty slots in a row, colour-dot weapon icons, half the screen empty | hangar header + tabs + BACK stay; left = slot A + slot B (170 px, 104 px emblems) and the result (200 px, 128 px art), ship slots under them; middle = WEAPONS / MODS / PRESETS as a small segmented chip row, owned items as 168 px tiles with 72 px emblems; right = MERGE panel (status, Neon + scrap, stat changes, MERGE with its cost, UNDO, RECIPES); RECIPES and item info open in that panel, not over the screen | pass (hybrid result art is still the forge's vector shapes; no painted art exists) |
| weapon icons (forge, all sizes) | a plain colour disc when wpmount art is not loaded | emblem: colour ring + the weapon picture, or its projectile art, never a dot | pass |
| phone 390 | MORE pop-up sheet; forge one-screen | MORE page as 2-column tiles (72 px icons, text >= 14 px) under the bay; forge keeps forgeone's one-screen layout with its own back button (showing the hangar header there breaks forge2-test's one-screen gate: 699 > 641 px) | MORE pass; FORGE phone: header not shown (left) |

Gates: qa/hangar2-test.js + H3 checks (PC and phone: MORE renders no role=dialog / aria-modal, 7 tiles, icons >= 72 px, text >= 14 px; FORGE keeps #gaBack + tabs (PC) or #fuBack (phone) and MERGE; #garage display none after BACK from SHIP/WEAPONS/PILOT/UPGRADES/FORGE, every MORE section and the MORE page; 0 page errors): 0 failed. menufix-test now runs with ?hangar3=0 (it tests the pop-up, which is the flag-off path): 0 failed. forgeui, forge, forge2 tests: 0 failed. guard.py ok.
