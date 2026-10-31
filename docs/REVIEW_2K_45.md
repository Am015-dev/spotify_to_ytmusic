# REVIEW_2K_45: og3 (one game S3: one HUD kit for roam, Race Mode and the builder DRIVE), commit e6a72b9

**Verdict: FAIL for ship-ON. Keep og3 in trunk behind `?og3` (flag OFF is unchanged and safe), but it is NOT default ON in the next deploy.** The kit does what Alex asked for: in landscape and portrait the 3 modes now share one top strip and one speed pill in one font, and it reads as one game. Three things block shipping it ON: its own GO is red in the gate, the speed pill covers the car, and the old readouts are hidden but not deleted (the boost meter shows twice).

Built page: out/rev45 is 3,462,028 B, the same as the worker's figure. Trunk before og3 (35095b9, out/pre45) is 3,455,403 B, so the lane adds **+6.6 KB to the page and deletes nothing**. The design's size row says a lane adding more than 5 KB must delete as much. Phone profile: iPhone UA, touch, 852x393 + 390x844; shots at 6x CPU; gates at the gate's own setting.

## 1. Diff
- **Flag OFF is unchanged.** `OG3=OD_FLAG('og3')` guards everything: the style, `body.og3`, `#hk` and the 100 ms tick are created only when ON. `thrEff` changes only under OG3, and `BX_hud` returns early only under OG3. The GO edits (`one-speedo`) branch on OG3. OFF gate: the same rows fail as on trunk.
- **ON is one module, but the old code stays.** `40h_hud_kit.js` draws, and `roamHud`/`updHud`/`BX_hud` only supply data (`BX.hkd`, `RO`, `pl`). That part is right. But the old readouts are only hidden with `display:none!important`, so `roamHud`/`updHud` still write them every frame. One was missed: the segmented `#boostCells` meter still shows next to `#hkBoost` in roam and race. **Duplicates deleted: no** (the handoff defers this to "when og3 ships ON").
- **Behaviour change:** under og3, Race Mode on touch becomes `pedal` (hold GAS). Measured: OFF the car reaches 96 km/h with no touch; ON it coasts from 72 to 37 km/h after GAS is released. This follows the design ("GAS in all 3 modes"). It still meets "gas default on touch", because the GAS button is there by default. But races no longer auto-accelerate, and Alex should feel that on a real iPhone before it ships.

## 2. Look (details in docs/shots/rev45/SEEN.md)
ON vs OFF in all 3 modes, landscape and portrait (`land_ON_over_OFF.jpg`, `port_ON_over_OFF.jpg`), next to `ref2k_any_race_street_01.jpg`.
- It reads as one game: the same strip, pill, font and minimap slot. OFF shows three different HUDs, including the race's neon "079 KPH" and the builder's text line.
- Text: ON has 0 elements under 12 px in all 6 views. OFF race has "KPH" at 6.24 px, so og3 fixes a real phone bug.
- Over the controls: 0 HUD rects ON in all 6 views. Over the car: the bottom-centre pill covers the rear of the car in the landscape race and touches it in roam and builder. 2K keeps that area clear and puts only a thin boost bar on the bottom edge.
- Noise: roam shows "-- FREE 0:16.7" (no place, and a stopwatch since entering roam), and the builder shows "--" before a place is known.

## 3. Gates (BUILT page, phone profile; TAG=why,life1,xf1,terrain,onegame,one-speedo,gui/card,portrait)
| check | trunk 35095b9 | og3 OFF | og3 ON (`?og1=1&og3=1`) |
|---|---|---|---|
| unit | | 0 FAIL (5022 pass, 13 known) | same build |
| batch | 84/85 | **85/86** | **84/86** |
| fails | onegame/builder-car | onegame/builder-car | onegame/builder-car, **onegame/hud** |
| page errors | 0 | 0 | 0 |
- **The 86th row is `onegame/builder-car`.** It fails the same way on trunk, OFF and ON: the builder car mesh has 6 parts at 2.57x1.76x4.43 m vs roam's 9 parts at 2.57x2.48x5.23 m. Top speed, FOV and touch pass. This is an og1 miss, not og3.
- **`onegame/hud` is red ON in the gate:** "roam 852x393 and 390x844: no GAS". In my standalone run (`shots_rev45.js`, the same build and flags) GAS is visible in roam, before and after the builder (`enterRoam`). So the failure depends on GO order. It runs right after `onegame/builder-car`, and `BX_close → BX_ogShow(false)` sets `#touch.hidden=true`. The harness's fast `__tq.reset` back to roam evidently does not undo that, while `enterRoam` does. Under rule 15 we don't ship through a red, and the worker's "passing" was a different order or flag set (og2 on too).
- race/one-speedo, gui/card, the portrait GOs and life1/xf1/terrain pass both OFF and ON.

## To ship ON (one SONNET lane, about 45 min)
1. **Make onegame/hud green in the gate order.** Make `BX_close` restore `#touch.hidden=!TOUCH.on` (or have the GO enter roam with `enterRoam`). Re-run the full TAG list ON, so the only red is builder-car, which is og1's to fix.
2. **Get the speed pill off the car.** In landscape, move the pill into the gap beside the controls, or shrink it to a strip on the bottom edge (≤ 34 px tall, as in 2K's thin bar). Make roam's top strip show just the time or nothing (no "--" and no "FREE" stopwatch). Add a GO assert: the pill rect does not overlap the projected player-car bbox in all 3 modes at 852x393.
3. **Delete, not hide.** Remove `#boostCells` (the double boost meter), the hidden `#roamGauge/#hTime/#hPos/#hBR/#bxHud/#bxPos/#bxTm/#raceW .pos .tm` readouts with their CSS, and the readout writes in `roamHud`/`updHud`/`BX_hud`, behind og3 (or at ship-ON). The page should end at or below trunk + 5 KB, per the design's size row.
