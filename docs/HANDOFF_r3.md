# R3 handoff (2026-10-08)

Branch `alex/od-r3` (draft PR #67, base `alex/od-r2`). It started from `alex/od-r2` (= live v88c src; `tools/verify_live.sh` gave LIVE_MATCH).
Coordinator = session_017iH3DB4VyxwKSdMwsco4Ut, reviewer = session_01Y6FYerWwxv43FuKUcaUT4v.

## A) v88d = music fix + TEST_MODE (built WITHOUT R3)
- v88d is built from the local worktree branch `tmp-v88d` (`/home/user/v88d`; it was merged into `alex/od-r3`, so all its commits are on the branch). To rebuild it elsewhere:
  `git checkout -b v88d <the v88d commit>`, then `tools/build.sh v88d`. The v88d tree has no `98v_r3_levels.js` in ORDER.
- **Music root cause (src/98m_music.js):**
  - The first-gesture handler ran on `pointerdown`. A touch pointerdown is not a gesture that unlocks media on iOS or in iframes, so `MUS_tick` returned and play() ran later from setInterval. That play() was refused and never retried.
  - It also used `preload=none` with no prefetch, and downloaded `menu.mp3` twice.
- **Music fix:**
  - Slot 0 prefetches `music/menu.mp3` at load (`preload=auto`). Other tracks load lazily.
  - The GainNode route is wired on the first gesture (`MUS_wire`).
  - `MUS_tick(true)` calls play() inside the handler.
  - Every pointerdown/pointerup/touchend/click/keydown retries a paused current track.
  - The idle slot is blessed with a silent wav.
  - Test hooks: `__mus.knob(tune,set)` and `__mus.st().tTap/tPlay`.
- **Timing (`t4/r3mus.js`, real Chromium autoplay policy):**
  - Live iframe: no audible music within 15 s after a tap.
  - New iframe: play() was refused on pointerdown (NotAllowedError), then the touchend retry played it, from one tap.
  - Standalone, tap to estimated audio start: live ≈7.8 s, new ≈3.7 s.
  - BUT this box needs 2–6 s just to deliver the tap to JS (swiftshader renders the menu at about 1 fps), so it cannot show the <300 ms target. Fast mode didn't help. Try a tiny viewport.
  - Not verifiable here: iPhone Safari.
- **TEST_MODE (`src/99x_test_mode.js`; flag `TEST_MODE=true` next to `ALL_OPEN` in 10_core.js; `?test=0` = off for one visit):**
  - Store hooks show 999,999 studs and all cars owned on READ, and write back the REAL values. Checked: spending 1,200 leaves the raw save unchanged and the shown studs stay 999,999.
  - Overrides: `gbReq`, `perkUnlocked`, `perkSlots`=3, `teamLocked`, `markLocked`=false, `markKnown`=true, menu boss button enabled.
  - Logbook tab "ALL (TEST)": every map event, grouped by kind. Tap = route + fastTravel.
  - ⚙ drawer forced on, 44 px. In the garage it sits left of SAVE & DRIVE (it covered the studs counter).
  - IMPORTANT: the module must sit BEFORE `99_api.js` in ORDER (99_api closes `</script>`). Page globals aren't on window (module script), so tests go through `window.__tm`.
  - Results tm1: studs 999,999, 14/14 cars, 0 locked in RIDES/PAINT/PERKS, 3 slots, all 70 map marks unlocked and known. ⚙ visible and on top on the menu, garage and roam. DRIVER showed 1 disabled control (not identified).
  - The logbook test was blocked by Oma Hilde's intro dialogue on a fresh save; `t4/tmtest.js` now taps SKIP first.
- v88d status: see the bottom of this file.

## B) R3 "Levels matter" (PRO_PLAN items 4, 5, 6) in src/98v_r3_levels.js (+ small edits in 98u, 98p, 98q)
- **2K facts verified online:**
  - The official PC manual says one perk per Performance Class, 3 total.
  - racinggames.gg: C = 1 slot, +1 at B, +1 at A.
  - ggrecon/destructoid: the driver level sets the 4 base stats (Top Speed, Acceleration, Health, Handling).
- **Done (code):**
  - `perkSlots` unlocks at levels 1/10/20 (it was 8/16), with the class.
  - 4 race-only stat perks: Handling Boost L2, Accel Boost L6, Top Speed Boost L8, Health Boost L24. They are applied in a `setupRace` wrap. `st` deltas are also set on tank/glass/crown.
  - Level road: `R3_road(L)` and `R3_next(L)` give "Next: Lvl N · reward".
  - PERKS mode = 2K perks screen: class badge, LVL, XP bar, 4 purple bars with a white level line plus perk ticks, and a C/B/A slot column. `#gbStats` is hidden in PERKS.
  - DRIVER mode: profile card (portrait, name, hero, next, flags/rides/perks counts).
  - Pause/title PROFILE: hero in the driver card, a LEVEL LINE card, and the STATS counters folded under "MORE STATS ▾".
  - Level-up card `#r3Up`, which replaces the old LEVEL UP toast via an addXP wrap:
    - menus: modal with CONTINUE (+ ⚡ PERKS if a perk unlocked);
    - free roam: mini, non-blocking, auto-hides after 5 s;
    - races: queued until the race ends.
  - SHOWROOM: RIDES context bar 6th tile 🏁 SHOWROOM → full-screen tabs, carousel of 3D cards (G9C_render), 3-card loadout. Tap = equip.
  - Test API `window.__r3` (up, setLvl, stats, show, slots, eq).
- **Test results so far** (`t4/r3perks.js`, 852×393 touch, LVL=12; build r3b, before the TEST_MODE merge):
  - 0 console errors; audit found 0 small targets / 0 tiny text in garage, showroom and level-up; profile ✕ 39×30 (old).
  - Screenshots looked at.
  - Fixed after that run (NOT re-shot): level-up ribbon clipped, "New in" bubble over the card, ACCELERATION too long → ACCEL, slot tile layout.
  - Perk equip by tap not proven: the test now scrolls the perk into view.
  - Showroom images were blank after 6 s: the test now waits 25 s (renders are slow here).
- **NOTE:** the R3 build now includes TEST_MODE (3 slots, all open). Use `?test=0` for R3 shots of locked slots and level gating.

## Left for the next worker (R3)
1. Rebuild (`tools/build.sh r3c --local`).
2. Run the PERKS/showroom test with test mode off: `node t4/r3perks.js "http://127.0.0.1:<port>/out/r3c/index.html?test=0" <out>`.
   - LOOK at every shot.
   - Check that equipping a perk shows green ticks on the bars.
   - Check the showroom has ≥3 cards with pictures.
   - Check the level-up card is not clipped.
3. PC 1280×720 + IFRAME=1 runs of the same.
4. Full gate: start, Frankfurt drive, Athens drive, tyre gap ≤0.05 m (t4/r2drive.js from R2), 0 console errors; tRace balance check (PRO_PLAN gate).
5. REVIEW → after PASS: rebuild on CURRENT live HEAD (v88d once deployed), OD_CHANGELOG entry, out/<ver> + tune.json + music.
   - The changelog must say slots moved from 8/16 to 10/20 (a player at level 8–9 loses slot 2 until level 10).
6. Polish ideas: perk list items could show their class letter; the showroom has no stat chips per car (only weight + rarity).
