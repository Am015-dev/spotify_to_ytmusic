# BF: Frankfurt play-test, bug fixes

**What:** I played Frankfurt with bots and real keys and clicks, covering free roam driving, Chapter 1 (Hot Drop, Ebbelwoi Heist, Bridge Toll, the Rossi race), Takedown Hunt, Smash Rampage, 20 "?" and side quests with R-key retry, a rival race and a track race from roam, the map, the garage, the pause menu and the phone portrait and landscape HUD. I found 6 bugs and fixed all 6 in `bf.js`, embedded by `pBF1.py`. Each one has a regression check in `tBF.js`.
**Patch order:** `./reapply.sh pBF1.py` (one anchor, see ANCHORS.md).

## Bugs found and fixed
| # | Bug (how it was reproduced) | Fix |
|---|---|---|
| BF1 | **The world kept running behind full-screen overlays.** With the GARAGE builder open in the middle of an event, holding ↑ for 2 s drove the car 51 m and the event clock ran for 2 s. With the full map open (M key or the pause menu), the event clock ran too and goons could hit you. | `roamStep` does nothing (and the engine sound is muted) while the map, garage, settings, logbook or pause menu is open. |
| BF2 | **Garage during an event silently aborted the mission.** Pause → GARAGE → SAVE calls `enterRoam()`, which runs `chAbort()`. | GARAGE is hidden in the pause menu while an event or sprint runs. |
| BF3 | **A car inside a building collider was stuck for good.** Warping to the Römer block (75,-5) left it stuck 85 s with gas held. The anti-stuck turn finds no free spot and there is no reset. | After 2 s inside a collider, the car is moved to the nearest street ("↺ BACK ON THE ROAD"). Frankfurt only. |
| BF4 | **Escape on race results sent you to the title menu.** After a race started from free roam, Escape on the results screen called `toMenu()` and you lost your place in the city. | Escape does what BACK TO FREE ROAM does when that button is shown. |
| BF5 | **The chase camera clipped into buildings next to walls.** Measured with real-time driving on real keys: 5–23 frames inside a building per ~2,000 frames at the Hauptwache, Hot Drop start and Market. The occlusion check only looks straight back and keeps the camera at least 4 m behind. | After `roamCam`, a camera inside a building is pulled toward the car, or lifted above it. Frankfurt only. |
| BF6 | **Phone landscape HUD overlaps.** The mission HP bar was drawn over the stage timer and stars panel (1,931 px² overlap). The district plate was hidden under the minimap ("nnenstadt"). | Landscape CSS: the HP bar now sits under `#raceW` and the plate starts to the right of the minimap. |

## What I checked and found working (no change needed)
- All 6 Chapter 1 and activity missions finish with the m1 bot and no page errors: hotdrop 269 s, heist 262 s, toll 288 s, hunt 31 s, rampage 39 s, duel 254 s of game time.
- 20 quests and side challenges: every v2 quest finishes, and the R key retries each one from its results screen. Restart and abandon work from both the pause menu and the R key.
- The rival race and track race from roam reach results, with no errors. The season event is correctly locked.
- Random free-roam driving with real keys from 8 start points: no NaN, and no stuck stretch longer than 0.6 s on streets.

## Tests
- `node tBF.js` → **10 pass, 0 fail** on the patched build. The same test on the unpatched base gives 3 pass, 7 fail, which reproduces every bug above.
- `node smoke.js .` → **SMOKE PASS** (370 s). I looked at `smoke/sheet.png` and nothing is broken on screen.
- Screenshot: `shots/bf_land_hunt.jpg` (landscape phone, Takedown Hunt HUD after the fix).

## Known gaps
- Smoke's Athens 700 m drive picks a random direction, and it sometimes crosses into another district, which reloads the page and crashes the shot. The unpatched base does this too on some seeds. On my build it happened in 3 smoke runs before one passed cleanly.
- In free roam, the **P** key opens Settings and Escape opens the pause menu. This is inconsistent but doesn't block play, so I left it.
- `__mho.roamSim` no longer advances while a full-screen overlay is open, so tests have to close overlays before simulating.
- I didn't test cups from the title menu or the Athens story.
