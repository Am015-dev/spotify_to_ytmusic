# BA — Athens + touch play-test (bugs found, fixed, regression-tested)

**Patch order:** `pBA1.py` (inserts `ba.js` before `window.__mho={`; see ANCHORS.md). CSS plus one runtime wrap of `M1_tw`. Page size goes from 3,209,292 to 3,211,537 bytes.

## Bugs (each reproduced on the unpatched base by `tBA.js`, fixed by pBA1)
| id | where | bug | fix |
|---|---|---|---|
| BA-1 | phone portrait, gas-pedal mode | DRIFT button sits on the speed gauge and the 🧱 brick counter (48×15 px overlap) | gauge moves up to clear the right-hand button stack (`calc` based on the same clamps the buttons use) |
| BA-2 | map, both orientations (Athens and Frankfurt) | header "MAP · tap an icon…" is light blue straight on the map tiles (hard to read on the Athens map) and in portrait runs under the ✕ button | dark backing pill, ends before ✕, ellipsis |
| BA-3 | Athens map, portrait | the A–D district picker is 4 stacked two-line buttons (180 px, 23 % of the map) and covers map labels | 2×2 grid, 85 px tall, clear of the zoom buttons |
| BA-4 | phone, parked | "🅿 PARKED" banner covers the NEXT pill (portrait and landscape) | banner moved below NEXT (narrower and wraps in portrait so it misses the horn button) |
| BA-5 | phone landscape | ITEM button (`#tW`) is placed on top of the ⟳ AUTO / vehicle button | `M1_tw` wrapped: moves `#tW` below any top-right HUD button it hits, only if it stays clear of the touch buttons |
| BA-6 | phone (visible in landscape) | first letter of the district name on the plate is hidden under the minimap ("olonaki") | plate text padding starts right of the minimap |

## Checked, no bug found
- All 4 districts boot with no page or console errors. DRIVE TO gates A→B, B→C and C→D: keyboard drive through the gate switches the district. The car arrives within 3 m of where it crossed, with the same heading and speed, on the ground, and drives on.
- All 7 Athens world races (akro/synt/pana/kifi, boss included): 45 s each with throttle held. Distance covered 1162–1443 m, no vertical-velocity spikes, no errors.
- Quests in A–D via the in-page bot: no crashes; most finish with stars. The TIME UP results came from the crude bot.
- Touch with real CDP touch input: GAS pedal hold drives the car, double-tap BRAKE parks and GO unparks, ITEM fires, map drag follows the finger exactly (60,40 px), pinch zooms, the own-district button warps.

## Tests
- `node tBA.js`: **30/30 PASS** (portrait 390×844, landscape 844×390, gate A→B). On the unpatched base: 4 FAIL in portrait (BA-1 to BA-4); BA-5 and BA-6 were added after landscape runs and screenshots showed them.
- `node smoke.js .`: **SMOKE PASS** (12/12, 363 s). `smoke/sheet.png` checked by eye.
- Screenshots: `ba_hud_port.jpg`, `ba_hud_land.jpg`, `ba_map_port.jpg`.

## Known gaps
- In district B, "Sesame Emergency" stage 3 near Lycabettus: the quest GPS (`qv.nav`) alternated between a 12-node and a 60-node route, and the teleporting bot shuttled between (457,-1313) and (478,-1278) without finishing. Real keyboard driving along the 60-node route reaches the target (no stuck, no hop). Not reproduced with real input; not fixed.
- The double-tap on BRAKE is dispatched as in-page TouchEvents 120 ms apart: CDP round-trips on this box take ~4 s, longer than the game's 320 ms double-tap window.
- B→A, C→B and D→C gates were not driven. They use the same code path as the ones tested.
