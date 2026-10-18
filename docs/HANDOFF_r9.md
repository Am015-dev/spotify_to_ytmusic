# HANDOFF r9b (rev9 N2/N3/N4, fixes #5/#6)
- Pill (src/93_cars_lego.js CR_hud): objective line = ellipsised "Giver · Target" + fixed "→ N m"; giver dropped first; title hidden when it repeats the target; portrait pill max-width clears ⚙ (#tuG). Rival box name wraps 2 lines at 12 px (00_page.html #raceW .gap small).
- Garage (98y): roam EXIT/#ofExit/🐞/odPin hidden while #gbx is open; landscape RIDES panel 392 px so names wrap (clamp 4) instead of ellipsis.
- vehMode (20_race_world.js): free-roam CAR↔4×4 flips only after 1.5 s on the new surface; burst/sound/banner at most once per 4 s; races and boat unchanged.
- GOs in 99c7_rev5fix.js: r9b/pill-gear, r9b/garage-clear, r9b/veh-dwell (all PASS); r8b/pill-dist now also fails on overlap with #tuG. Shots 393×852 pill and 852×393 garage looked at.
- Left: xf1/grass red is the known one; no deploy, no OD_CHANGELOG touched.

# HANDOFF r9c (rev9 fix #4, Frankfurt nemesis arc)
- No new missions added: Frankfurt already has the arc (src/81_story_ath_m2_m3.js M3_DEF: ch3 "Duel: Ferreira & Çelik", ch4 "Duel: Brandt & Nakamura", ch4 "Finale: Vex Kaiser"); rev9 only counted the 9 side QUESTS. 17 story missions in all.
- Real bug fixed: the Kaiser/police cars assumed the legacy 3-child mesh, so "Finale: Vex Kaiser" threw on start with the LEGO npc car (children[0].material undefined). Now the light bar is the last child (M3_goon, kz thieves, siren flash).
- GO r9c/fra-arc (99c7_rev5fix.js, PASS): ≥12 missions, duel3 < duel4 < finale in M3_STORY with chapters 3/4/4, one mark per step, intro/win/lose lines + reward scene each, bot start builds 6 phases and chEnd(win) sets step 9, SKYCUP flag and crown; save restored.
- Not done (r9a owns tkStart): the arc runs on the M1 gate-race engine, not tkBuild kind:'rival'. 852×393 duel shot looked at: pill, controls and 12 px+ text fine.

# HANDOFF r9a: a pack of 5 in every city race (rev9 TOP-6 #1, N5)
1. src/98tk_city_duel.js: tkPack fills every tk race to 4 rivals with the city's drivers (the nemesis stays ai[0]). The pack band adds phase and offset per rival plus a leash past 70 m. `?pack=0` restores the old rosters. The 400 m let-go is kept, because rv2k/race-handsoff needs it.
2. GO r9a/pack5 (src/99c7_rev5fix.js) runs 4 races (Westend, GP, River, Akropolis). Last runs all PASS: 5 racers, POS n/5, bot 1st, 3-15 lead changes, max gaps 66-112 m. ?pack=0 gives 2 racers and up to 228 m behind.
3. Gate: unit 0 FAIL. TAG run: the remaining reds (garage-car, tk1/water, tk1/quick, tk1/courses-ath) are also red with ?pack=0, so they were red before. rv2k4/ath-cam is flaky both ways (0-2 swings).
4. NOT DONE: race frame time on the touch profile (pack vs ?pack=0). The tFrame race run (Westend) was too slow for the timebox. Next lane: copy tFrame with an 852x393 isMobile viewport, compare QS=pack=0 vs pack=1, and lower the AI LOD on touch if the median is over +2 ms.
5. Shot (852x393 Westend, 7 s in): "5TH /5", rival box, pack ahead on the road; one smashed vehicle lies on the right edge.
6. After the rebase: unit 0 FAIL. In the tChkGo TAG run, 5 of 6 PASS (pack5 GP, River and Akropolis, race-handsoff, r9c). In the warm tChkGo page, r9a/pack5 Westend (the first item) had a bot that never drove (DNF, 0 m). On a fresh page it is 2/2 PASS (8 lead changes, max gaps 56-86 m). Fix the warm-page start order next.

# HANDOFF r9a-perf: pack cost on touch
1. tools/perf1/tRaceTouch.js (852x393 isMobile/hasTouch, Graphics Auto, 30 s bot race, render stubbed, desktop CPU): Westend pack vs ?pack=0 median 17.4 vs 15.9 ms (p95 28.6/26.6, >50 ms 9/9); Akropolis 19.4 vs 20.2 (p95 38.3/41.3, >50 ms 31/39). AI update (tkStep) +0.1 ms; +15 draw calls (658 vs 643, 712 vs 695). Run-to-run noise is about 2 ms, so the pack is within the 2 ms budget: no LOD, no 3-racer default.
2. GO r9a/pack-cost (src/99c7_rev5fix.js, Westend + Akropolis): tkStep with 5 racers minus tkStep with the nemesis only, ms per frame, no graphics; pass = 5 racers and <= 0.5 ms. Measured 0.00-0.10 ms, both PASS.
3. Gate: unit 0 FAIL; TAG r9a,life1,xf1,terrain on the built page: 44/48. Reds: xf1/grass, xf1/water, life1/people (known). r9a/pack5#2 (River Run) failed once: behind 130 m at 167 s, the last 8 s of a 175 s race (limit 120); not touched by this lane, was 66-112 m before.
4. Next: River Run end-of-race gap in the pack5 GO (sample only while the bot is under 150 s or the leader has not finished).
## r9d (N1: life1/people, life1/smash)
- Bisect (THROTTLE=4, built pages): 6bc1079/c18f1a6/7a85bef/3ba64e9 = people pass but time swings 3.6-11 s (GO had a 10 s WALL limit); 56cb397 (boot-1) = "no people group with a clear run-up" 2/2. Quiet machine at HEAD: both green (desktop + touch). Not scale-1 or perf-17.
- Root cause: LIFE_fill's 1.5 ms budget skipped unbuilt cells in scan order (not nearest first) and the GOs filled once, so a slow page left the warp target half-built (no group / no smashable); GO also ended on 10 s wall, before a throttled page's car arrived.
- Fix (src/assets/lx/code.js): LIFE_fill builds cells nearest-first (budget kept); people/smash GOs fill until done; people ends on 6 s sim time (60 s wall cap). Reaction code is per frame, unchanged.
- tChkGo.js: DESKTOP=1 (no touch, 1280x720) and THROTTLE=n (CPU throttle) env options.
- Gate: build + unit 0 FAIL; TAG=life1,xf1,terrain,phone2 only known xf1/* reds; life1 7/7 desktop+touch; THROTTLE=6/8 people reacts (only harness SLOW label trips).
