# REVIEW_2K_49: og2c (8b13821), og2 round 3: Race Mode from city rings (flag ?og2)

**Verdict: PASS. ?og2 can ship default ON.** All 3 REVIEW_2K_46 items are fixed in the product. The flag-OFF behaviour is unchanged, and every gate is green with the flag ON and OFF.

Built page: out/r49 of 8b13821 (index.html 3,458,092 B, split build), served locally. Phone profile: iPhone UA, 852x393 touch. Unit: 0 FAIL (5022 pass, 13 known).

## 1. Diff (4 files, +34/-6)
- **Flag OFF unchanged.** `OG2_sep` returns at once with og2 OFF. `OG2_place` and the `roamMarks` tie-break only touch markers with `m.og2`, and those exist only with the flag ON (`OG2_marks` is called only under `OD_FLAG('og2')`). The OFF gate is 90/90 and the GOs report "flag og2 OFF: 0 og2 markers".
- **Item 1 (why/drive-start ath): product fix.** The root cause was the free-roam spawn road snap, which ran after the rings were placed and left the "Marios Antoniou" ring 10 m from the real spawn. Its chip then hid the first-drive hint pill. Rings now keep >= 80 m from ATH_SPAWN and from its snap. The why/drive-start check itself is not changed.
- **Item 2 (chip at the GP ring): product fix.** `OG2_sep` moves an og2 ring >= 25 m clear of any other marker, and `roamMarks` prefers the og2 ring the car is inside (d < 11). The new GO onegame/ring-chip parks in every og2 ring (fra 7, ath 10) and asserts chip title == marker title.
- **Item 3 (return cap): real.** The cap is now 3 s, with a 6 s wait, so a slow return is measured and fails instead of timing out at the cap.
- Notes, not blockers:
  - `OG2_trip` now clears a level-up queued by an earlier GO on the same warm page. That is test isolation: on a real fresh save the level-up still fires, and I saw it as a toast after the return (below), not a wall.
  - The ring-chip GO falls back to the whole chip/card text when it finds no `<b>` title. That is a little loose, but the real chip I saw shows the exact title.

## 2. Gates (built page, phone profile)
| check | og2 OFF | og2 ON (`?og2=1`) |
|---|---|---|
| TAG=onegame,race/racemode-all,race/one-speedo,racefree,why,life1,xf1,terrain (fra+ath) | **PASS 90/90**, 0 errors | **PASS 90/90**, 0 errors |
| why/drive-start ath, 3 in a row, 1x | | **3/3** (hint pill 179x27, speed>5 km/h in 0.3-0.4 s) |
| why/drive-start ath, 3 in a row, **6x CPU** | | **3/3** (0.7-1.1 s) |
| unit | 0 FAIL | same build |

The batch includes onegame/ring-chip, onegame/race-roundtrip, the default gate (why, life1, xf1, terrain) and the race tags. The ON why/drive-start runs used 3 boots in total (batch + 1x + 6x); the ring positions differ by boot, so these are independent layouts. The og3b flag-OFF race-timer regression (timer-r31f lane) did not show up in these tags; it is not counted against og2 either way.

## 3. Play (real CDP touch, 6x CPU, fresh save, fra; docs/shots/rev49/SEEN.md)
GAS pad from 22 m behind the Grand Prix ring, then BRAKE. The chip reads **"📍 GRAND PRIX · RACE · TAP TO OPEN"** (it offered the Eiserner Steg leap in rev46). 1 tap on the chip opens the "Grand Prix · Race" card. PLAY → race in 1.2 s. On the results there is no level-up wall, and 1 tap on BACK TO FREE ROAM → city in **0.4 s**, **0 m / 0 rad**. The level-up appears as a top toast. No card or chip pops up again in the next 4 s. 0 page errors. Taps in total: chip, PLAY, back.

Still a separate game: the race is the neon night hex track with no GAS pad (A_4_race_drive.jpg). That is og3/S3 work, not og2, and it is now the main thing behind Alex's "2 separate games".

## Ship
Flip og2 default ON (rule 11). Next for Alex's words: og3 (race look and HUD/GAS pad the same as the city).

Shots: docs/shots/rev49 (SEEN.md; harness play_rev49.js).
