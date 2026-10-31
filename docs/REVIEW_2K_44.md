# REVIEW_2K_44: og2 (one game S2: Race Mode races start from city markers and bring you back), commit c85998f

**Verdict: FAIL for ship-ON. Keep it in trunk behind `?og2` (the code is safe and flag OFF is unchanged), but it is NOT ON in the next deploy until the 3 items below are fixed.** The plumbing is right and reuses the existing systems. A real touch player still sees a level-up wall plus a 2-tap exit after a finish, and the card's promise doesn't match the race.

Built page out/rev44: 3,455,403 B, the same as the worker's figure. Phone profile (iPhone UA, 852x393 touch); the gates ran at the gate's own CPU setting, and the play ran at 1x under SwiftShader.

## 1. Diff
- **Flag OFF is unchanged.** `markKey` for `mode` now reads `ev.id||ev.k`, and no `MODE_EV` entry has an `id`, so the keys are the same. `OG2_place` only touches `og2` marks. `OG2_back` and `MODE.back` are guarded by `OD_FLAG('og2')`. The `!m.og2` checks in `tkWants`/`tkMarkOf` are no-ops OFF. The GO reports 0 og2 markers with the flag OFF.
- **ON reuses the existing code; no parallel system.** The og2 marks are ordinary `kind:'mode'` and `kind:'rival'` catalog entries. They use the same marker meshes, `roamOpen` card, `RQ` chip and `roamGo` → `startRace` path. The return goes through the existing `roamPost`, with one `OG2_back()` override. The car is placed by a small golden-angle spiral (`OG2_place`) on `rfSnap` road points 75–185 m from `g_city`.
- Small notes: `MODE.back` is not cleared if the player leaves the race through the menu. They would warp back to the old spot on their next roam entry, which is acceptable. The GO "finish" is a forced DNF clock (`raceT=236`) followed by a synthetic `#roamBack.click()`. That click works even when the button is covered, which is how the GO missed item 1.

## 2. Feel (one paragraph)
In Frankfurt, driving toward an og2 marker with the real GAS pad works. The purple chequered ring reads well from 20–45 m, the card is clean, and PLAY drops you into the race in about 20 s of SwiftShader load. That is 2 taps in all (the chip or card, then PLAY), with no menu maze, which is a real improvement over 5 taps. But the race is plainly another game. It is a neon night hex track, with a different HUD and no GAS button, and the card's "3 laps" turns into LAP 1/1. That part is S3/S4 work, but it is what Alex will feel. After a finish, a fresh save gets the LEVEL UP dialog on top of the results, with BACK TO FREE ROAM visible under it but not touchable. Getting back to driving takes CONTINUE + BACK, 2 taps where S2 allows 1 or fewer, so the "back where you were" moment is behind a wall. The return itself (per the GO, synthetic) lands at 0 m / 0 rad with the hub reused. I could not complete a real-touch return inside the timebox, because the run stayed on the level-up dialog. **Markers near the garage:** 7 og2 markers sit 120–240 m from `g_city`, and 9 of 75 markers are within 200 m. The free-roam spawn is 586 m away, so the start isn't crowded. But it is a pocket of 6 identical purple "· Race" rings a few blocks apart, sharing colour and icon with the Zone/Arena Mode markers. That's fine for a first version; real-place spots (one race per district, near its landmark) would make the city feel like the race map.

## 3. Gates (BUILT page, phone profile; TAG=onegame,race/racemode-all,race/one-speedo,racefree,why,life1,xf1,terrain = the default gate + this lane's tags)
| check | flag OFF | flag ON (`?og2=1`) |
|---|---|---|
| unit | 0 FAIL (5019 pass, 13 known) | same build |
| onegame/race-roundtrip | PASS (0 og2 markers) | PASS fra (grand finish, cup quit, hafen finish) + ath (akro, PAPPAS quit, synt): 2 taps, 0 m / 0 rad, hub reused |
| racemode-all, one-speedo, racefree, life1, xf1, terrain | PASS | PASS |
| batch total | 84/87: why/solid-bld, why/hud6, why/hud6#1 | 84/87: why/hud6, why/hud6#1, why/speedfeel#1 (SLOW 84.5 s > 79 s) |
| page errors | 0 | 0 (play run: 0) |

The why/hud6 misses also happen OFF (in rev43 too: a known flake, which needs an owner under rule 15). why/solid-bld (OFF only) and why/speedfeel (ON only, a time-limit miss under load) are not og2 code paths. So og2 adds no new red.

## 4. Shots
See docs/shots/rev44/1–6, what I see in SEEN.md, and the harness in play_rev44.js.

## To ship ON (one SONNET lane, about 45 min; then ON at the next deploy; rule 11)
1. **1 tap back after a finish, with real touch.** When `RO.fromRoam` is set and the race came from an og2 marker, the level-up dialog's CONTINUE also returns to the city, or the level-up shows as a toast in the city after the return. Change the GO to tap the visible top element at the `#roamBack` centre (`elementFromPoint`), with no `.click()`, and assert 1 tap or fewer on a fresh save that levels up.
2. **The card tells the truth.** The og2 race card's lap count equals `RC.laps` of the race it starts (today "3 laps" vs LAP 1/1). Either start with the track's laps, or write the real count on the card. GO: card text laps == RC.laps for all 6 fra + 4 ath markers.
3. **Pause "MENU" says where it goes.** Under og2, `#quitBtn` reads "🌍 BACK TO CITY", because it returns to the city, not the menu. Optional in the same lane: spread the og2 markers to real-place spots (`MARKPOS` per track id, near each track's district) instead of the garage spiral.
