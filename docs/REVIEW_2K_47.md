# REVIEW_2K_47: og3b (HUD kit round 2), commit 7422f09

**Verdict: FAIL for this round, because of one flag-OFF regression: the race timer freezes at 00:00.0 with og3 OFF.** All 3 items of REVIEW_2K_45 are fixed, and ON looks and tests right. **?og3 can ship default ON as soon as the one-line timer fix below is green, and Alex's iPhone feel of hold-GAS agrees.** Until then, do not deploy trunk at or after 7422f09 with og3 OFF.

Built page out/rev47: 3,456,093 B, the same as the worker's figure, 6.9 KB under og2b's 3,463,034 B (rev46) and under the 3,460,403 cap. Phone profile: iPhone UA, touch, 852x393 + 390x844. Shots at 6x CPU; gates at the gate's own setting; feel probe at 1x.

## 1. Diff
- **Flag OFF is unchanged except for one line.** Every other edit is `if(OG3)` / `!OG3` (roamGauge, updHud speed/cells/pos/lap, raceW .pos/.tm, bxHud/bxPos/bxTm creation, BX_close touch restore). **But `setT(hudEl.tRace,'tr',fmt(raceT))` was deleted from `updHud` outright** (src/40_hud_input_menu.js, the tLap/tBest line), and nothing else writes `#tRace`. Measured OFF: `raceT` climbs, but `#tRace` stays "00:00.0" all race. Pre-og3b (148fe71) writes it. So this is red on trunk now, and only og3b caused it.
- **Deleted, not hidden: yes for what the player gets.** Under og3, the kit `remove()`s `#boostCells,#hullCells,#roamGauge,#hTime,#hPos .lab,#pos,#hBR,#hBL #lap,#raceW .pos/.tm`, and their per-frame writes are skipped. The display:none block is gone. The OFF markup/CSS stays in the page while the flag exists. Delete it at ship-ON (the handoff says so too).
- **Lazy chunk timing.** `XC_need('40h_hud_kit')` (6.5 KB) is requested at the top of 10z_lazy, next to the city data (fra 40 KB, ath 78+217 KB) that boot awaits. In every run the kit was in place in roam (0 page errors, `#hk` present at the first probe). But nothing awaits it: on a slow link, the reveal could show the old readouts, with the roam gauge frozen at 0 because its writes are skipped. It is never an empty HUD. Cheap guarantee: add `'40h_hud_kit'` to the `Promise.all` in 52_terrain_data.js when OG3.
- New GO: strip ≤ 34 px and no overlap with `OG3_car()`. It is sound, but it samples at the race start. At speed, the car's box touches the strip by 2–3 px (wheel bottoms, invisible in the shot). Margin, not a bug.

## 2. Look (details in docs/shots/rev47/SEEN.md)
`land_ON_over_OFF.jpg`, `port_ON_left_OFF_right.jpg`, `feel_ON_race_strip.jpg`, next to `ref2k_any_race_street_01.jpg`.
- ON reads as one game in all 3 modes and both orientations: the same top strip and the same thin bottom speed strip (landscape) or top-right pill (portrait). OFF still has three different HUDs. This answers Alex's "2 separate games" for the HUD.
- Roam top strip empty ✔. Speed strip 24 px on the bottom edge, below the bumper, like 2K's thin bar ✔. No double boost meter ✔.
- 0 HUD rects over the controls, 0 text under 12 px in all 6 ON views. (OFF race "KPH" is still 6.24 px, which og3 ON removes.)

## 3. Gates (BUILT page, phone profile; TAG=why,life1,xf1,terrain,onegame,one-speedo,gui/card,portrait = the lane tags, the portrait GOs and the default gate)
| check | og3 OFF | og3 ON (`?og1=1&og3=1`) |
|---|---|---|
| unit | 0 FAIL (5022 pass, 13 known) | same build |
| batch | 85/86 | 85/86 |
| fails | onegame/builder-car | onegame/builder-car |
| page errors | 0 | 0 |
- The only red is `onegame/builder-car`, which is red on trunk too (rev45: trunk, OFF and ON). It is og1's, not og3's.
- No GO covers the OFF race timer. That is why the gates are green over the regression. Add one with the fix.

## 4. Hold-GAS at 1x on touch
I could not judge it in real time here. With software GL, game time runs at about 1/20 of real time (16 s of wall clock = 0.7 s of race; `feel_ON_race_1x.jpg` is still at countdown "4"). What I measured: holding GAS through the countdown gives a PERFECT START at 73 km/h. Speed builds while held and drops to about 41 km/h on a lift, so a lift costs a lot (rev45: 72 → 37 km/h in 3 s), and it picks up again on press. Design-wise this is right for "one game": the same GAS button and rule as roam and the builder, and 2K is also hold-to-drive. The risk is the phone thumb: the right thumb now has to stay on GAS the whole race, while BOOST and items sit next to it. If the bottom-right cluster forces a lift to boost, races will feel worse than auto. **Alex's iPhone run decides this.** If it feels worse, keep auto-gas in Race Mode only under og3 and change nothing else.

## To ship ON (one HAIKU-size fix, about 15 min; then rule 17 applies: small measurable fix on green gates)
1. **Restore the OFF race timer:** put `setT(hudEl.tRace,'tr',fmt(raceT))` back inside the `!OG3` block of `updHud`. Add a GO line to race/one-speedo: OFF, after ≥ 1 s of race, `#tRace` ≠ "00:00.0".
2. (cheap guarantee) Await `40h_hud_kit` with the city data when OG3, so reveal can never show the old HUD.
3. At ship-ON, delete the OFF HUD markup/CSS/writes (`#hTime`, `#roamGauge`, `#boostCells`, `#bxHud`…) in the same lane that flips the default.
