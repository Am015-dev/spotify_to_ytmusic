# OG2 — On-the-Go events on the v81 base (with AU)

Build: `./reapply.sh pAU1.py pAU2.py pOG1.py` → REAPPLY_OK. The page is 3.59 MB.

## Fixes

### 1. Portrait map drag / pinch (tBA regression)
- **Cause:** OG's `#ogMapP` "AREA COMPLETION" panel was 192×404 px in a 390×844 viewport. It sat over the centre of `#roamMapC`, so pointer events never reached the map canvas: drag gave dx 0 / dy 0 and pinch gave no zoom change.
- **Fix:** in portrait (`max-aspect-ratio:1/1`) the panel collapses to a one-line chip (`AREA COMPLETION 37% ▾`). Tapping it expands the full list. Landscape and desktop are unchanged.

### 2. Event tiers on v81
These changes are in `og.js`; the probe numbers come from the key bot.
- **Drift:** the bot scores at most ~1600 pts on v81, so the old gold of 1800 was out of reach. The tiers are now **180 / 450 / 1100**.
- **Long Jump:**
  - The tiers are now **30 / 42 / 54 m**. At 21/28/33/34/40 m/s the bot measures about 24/37/48/50/65 m.
  - Jump spots now require flat ground: every 8 m along 110 m in both directions must be within ±2.5 m of the start height.
  - Distance is now measured where the car first comes back down to road height. Flying off the road onto lower ground had scored 76.9 m at 28 m/s.
- **A wreck no longer cancels an event.** v81 has a wreck-and-rebuild sequence (`RO.wk`) that silently ended the event, so the bot read the previous run's medal. The wreck now pauses the event instead.
- **Stud Rush:**
  - The tiers are now **9 / 14 / 22** studs.
  - The time limit is now at least 12 s (was 20 s), so a full clear needs about 17 m/s on every route length.
  - Results: 12 m/s gives 16–19 studs, 8 m/s gives 12–13.
- **Density:** the gap fix-up pass now triggers at 125 m (was 140 m). This leaves room for spots pruned under later mission marks. Athens A had shown a 154 m gap.

### 3. Audio source peak (tAU)
- **What the numbers show:** live sources did not grow over the 5 minutes (late ≤ early). The failure was a burst peak (max 168) from many one-shots inside one compressed sim burst.
- **Voice cap:** `au.js` now caps voices at `AU_VCAP=110` live sources in `AU.osc` / `AU.noise`; voices over the cap are dropped and counted in `AU_M.drop`. The max is now about 100.
- **Brick clatter fix:** a `//` comment had swallowed the brick-clatter loop in `au.js`; the loop is restored.

## Test and build-script changes
- **pAU1 / pAU2:** v81 already embeds an older AU module. `pAU1` now swaps that exact block for `au.js`, and `pAU2` skips text swaps the base already has.
- **ogbot:** `lastRes` is cleared on every run.
- **tOG:**
  - The completion tests now pick collectibles that have an approach route. This fixes the Node crash `appr(...).P` of null at the end of the run.
  - A crash is now reported as a FAIL.

## Results (final build)
- `node tBA.js` → 30/30
- `node tOG.js` → 43/43, 0 fail, no crash. The suite now has 43 checks, not 42.
- `node tAU.js` → 18/18. The live-source check reads early 35 / late 30–42 / max 98–101.
- `node smoke.js .` → SMOKE PASS. See `smoke/sheet.png`.

## Known gaps
- tAU's "race crossfade" failed twice when it ran alongside tOG (the bus was still at 0 after 2.5 s). It passes when run alone. This looks like main-thread starvation on this box.
- Tier margins are a few units wide in places: long jump 47.5 against silver 42, drift 622 against silver 450.
- base.html (v81) and docs/modules are not committed, per the README rule. They come from `alex/overdrive-devkit`.
