# HANDOFF races-3 (2026-10-18, landed on alex/od-int2; GOs races3/route + races/finish green)
1. GP DNF: root cause was a 48 m dead-end stub in the route ((-600,360)→(-552,360)→(-772,360)) that tkDespike kept (min leg ≥ 40): the bot's look-ahead folded back onto the car and it circled. tkDespike now also cuts near-U-turns (>150°) on stubs < 120 m and any exact retrace; tkGeoOf starts the finish leg (and its gates) at the corner when the stub tip was cut. Akropolis had two such stubs ((-2772,333), (-2239,-60)): fixed too. Stuck detector (71_roam_drive.js): the bot lifts the gas every ~1 s so stkT never reached 4 s; a separate 6 s / < 15 m / gas > 1 s window (RO.npT, RO.npHop) now forces the hop.
2. River boat stall (-245,-157): TR_pre applied the raw terrain grade (0.8) at the quay edge at the slip top, dragging 14 m/s to 0. TR_onSlip (on and 6 m past a slipway) now skips the drag. GP 1st x9 (84 s). River finishes ~6 of 8 (tRaces, same on and off trunk merge), Akropolis ~7 of 8.
3. Gates: unit 0 FAIL; races3/route (static: no U-turn stubs, finish gates on route, slipways drag-free) and races/finish (GP 3 of 3; River and Akropolis >= 2 of 3) PASS; life1/xf1/terrain/rv2k2 reds identical to trunk. GO rows/items live in 99c3_rv2k3.js (RV3A_rows, listed before the checklist in src/LAZY): 99c_checklist.js is 27 B under its 200 KB cap.
4. Open flakes (River and Akropolis gated at 2 of 3; Westend not gated): River: the bot arrives at 42 m/s at the finish-leg corner (-315,446), overshoots to (-285,560-598) and never gets back (rec/hop do not free it; ~1 run in 4).  Westend (TK_C) DNFs 2 of 6 on trunk too (290 m straight jump (660,-33)→(573,-310) through the city, stalls near (594,-141)); Akropolis stalls ~1 of 6 at (-2100,490) about 650 m in.
5. Probe recipe: tkBot on G.pA, log RO.stkT/npT/h per 0.5 s from t=72 s; dump roamHit map only after warm-up (HUB.grid holds colliders near the player only); tools/tRaces.js <url> 3 gp,river,akro.

# HANDOFF races-5 (2026-10-18, branch alex/races5-wip, NOT merged to trunk: races/finish red once)
1. River: cause = a boost pad put the bot at 56 m/s into the finish-leg corner (-315,446); tkBot's corner horizon (30+1.5v) was too short. Horizon now 30+1.5v+v^2/25 (98tk_go.js). River 8/8 (was ~3/4).
2. Westend: cause = route A leg (660,-33)->(573,-310) had no street within 40 m of both ends, so tkLeg returned a 290 m straight line through buildings (stall ~(630,-140)). tkLeg retries at 75 m (follows Neue Mainzer Str.); longest leg 49 m; Westend 8/8 (was 4/8).
3. Akropolis: did NOT reproduce (8/8 before and after), so no cause found for (-2100,490); legs there are 60-90 m zigzags (-2089,560)->(-2158,509)->(-2184,508)->(-2213,565) if it comes back.
4. GO races/finish now gates River, GP, Westend and Akropolis 3 of 3 (Westend added). Unit 0 FAIL. Full GO run: races/finish RED once: GP run 1 DNF (stuck from 30 s near (209,299)), the other GP runs and a separate 6x tRaces gp (6/6) pass; the life1/xf1/terr1 reds match the known list, but life1/smash, life1/carousel and terr1/fps were not compared with trunk (run in parallel, slow).
5. Next: reproduce the GP run-1 DNF right after the River runs on one warm page (state left over from the boat?) before merging.

# HANDOFF races-6 (2026-10-18, races5 merged onto alex/od-int2)
1. Merged origin/alex/od-int2 + races5 (River v^2 braking horizon, Westend 75 m leg fallback). Unit 0 FAIL.
2. GP DNF is not a boat leak: it recurred in run 2 at the same spot (209,259-299, crawls at 5-14 m/s), so it is location/traffic-bound, not run-order state. tkStart now resets the stuck/hop windows (RO.stk*, np*, nudgeT) anyway; GO order is now Grand Prix, River, Westend.
3. Built page, TAG=races alone, fra, 2 runs with GP first: races/finish green both. Full GO (races,life1,xf1,terrain,rv2k2) before the reorder: only known reds + SLOW-only flags from parallel load (content marks all OK); pace#1 avg 114 km/h OK.
4. Open: the (209,299) GP crawl (~1 run in 6 when GP is not first); probe there with traffic cars near RO.

# HANDOFF races-7 (2026-10-18, branch alex/races6-wip: NO code fix, GP crawl at (209,259-299) did NOT reproduce)
1. Built r6 from 44e056a. GP (menu 'grand', route pA) 26 runs on warm pages: 6 GP-first, 4 after River (River x4 -> GP x4 -> Westend x4), 10 more with the probe: all 1st, 86-90 s, stuck 0. No frame with v < 16 within 45 m of (209,279) in the 10 probe runs.
2. So the ~1-in-6 crawl is not tied to run order or to the 'races' page alone; the earlier hits came in the full GO (races,life1,xf1,terrain,rv2k2 in parallel, slow frames). Likely dt/load-dependent: check with a throttled CPU (--cpu-throttling) or the full GO page, not a clean tRaces page.
3. Reading found nothing at the source: the GP rival is a pure path-follower (tkStep: a.s += a.v*dt, gap rubber band, no traffic yield, no CR_npcPush). The 5-14 m/s crawl is the player-bot (tkBot) in RV3A_race pushed by traffic/npc at that junction, not the rival.
4. Added tools/tGpProbe.js (hooks tkBot, logs near-car state x/z/v/yo/k/hold when v < 16 near (209,279)). Run it inside the full-GO page to catch the cause; no gate run was needed (no src change).
5. Next: run the probe with CPU throttling or inside the GO; if cars with yo/hold sit on the line, clear traffic on the race route in tkStart (race-only).

# HANDOFF races-8 (2026-10-18, branch alex/races7-wip, NOT merged to trunk: TAG gate not run)
1. Akropolis/GP did NOT reproduce under CPU=4 (tRaces CPU=4: gp 6/6 1st 86-92 s, akro 4/4 1st so far, stuck 0), so no root cause; detector is a safety net.
2. tkRock(W,t,s) in 98tk_go.js (sim time, rolling window): net route progress < 15 m in 6 s, any gas -> tkBot backs out + RO.stkT=4.01 (roam hop). 71_roam_drive npT window now also fires without gas when RO.sp.tk is racing.
3. tkStart moves held traffic (yo/stop/wait/hold) within 14 m of route pA away (SIMP_clearTraffic, race-only).
4. Unit 0 FAIL incl. new tools/unit/logic_rock.js (oscillation fires <= 6 s at dt 1/60..0.5; 8 m/s quiet). tRaces/tGpProbe take CPU=<rate>.
5. Left: TAG=races,life1,rv2k2 on built out/r8 vs trunk, then merge + push HEAD:alex/od-int2.
