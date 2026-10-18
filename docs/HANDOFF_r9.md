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
