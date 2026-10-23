# HANDOFF W173: belt floor (street), flag RET.belt (default OFF, ?belt=1 on)

Player decision it creates (rule 13): **line up to hit, or step out of line to dodge.** Up/down walks into / out of the street;
your shots, knife and every foe attack only land within 15% of the band in depth. Measure: streetsim `W173 D2` (share of foe
attacks the dodge bot avoids by depth).

## What is in (foot.js, streetlook.js, qa/streetsim.js)
- D1: every actor, shot, pickup and prop has a depth `z` (0 back by the wall, 1 front = the old road line). Kai: W/S, arrows or the
  stick's vertical axis (1.2 band/s); jump stays on its own button and is a height. With the flag on there is no crouch and no up/down aim.
  The painted backdrop's road line moves up by the band (27% of the view tall), the floor layer fills it.
- D2: `zok()` gate (ZT = .15) on Kai's bullets/knife/grenades vs foes and props, foe bullets (they carry the shooter's z), foe melee
  (`env.melee`, so the boss too), touch damage, pickups (.22). `S.zmiss` counts foe attacks dodged by depth.
  Not gated (area blasts on purpose): rocket/grenade explosions (`boom`), barrel blasts, the arc gun's chain.
- D3: foes spawn on lanes .15/.85/.5/.3/.7; far from Kai they keep their lane, within 300 units the closest foe (and the boss, and any foe
  winding up a shot) drifts into Kai's line at .42/s (boss .32), the others hold lanes beside him. Every 3rd foe of a wave enters from
  behind (with the W161 BEHIND warning when fairstreet is on).
- D4: streetlook draws foes + Kai sorted back to front every frame, a floor shadow under each (smaller in the air), 0.9-1.0 scale by depth;
  shots, grenades, pickups and props use their own depth; sparks take the depth of the nearest actor.
- First-time hint: "W/S or ↑/↓ (stick up/down): step nearer or further to dodge" until Kai has moved in depth.

## Gates (RUNS=8, flag on unless said)
- streetsim flag OFF: identical per-bot numbers to the pre-W173 build (diffed).
- streetsim flag ON (Q='&belt=1'): PASS D1 (band 27%, 90% of depth slices used), D2 (47% of attacks dodged by depth), D3 (median spread 31%);
  idle dies, melee fairness and behind-share PASS. FAIL that also fail with the flag off: best bot 60-80%, nearest 25-40%, threat peak.
  New FAILs with the flag on: ducking gate (no crouch on the belt: expected, replace it with D2 when belt goes default),
  4 STUCK runs (gfirst 35997/43916, dodge 12240/20159) in the boss lock: the bot stops damaging the boss for > 25 s
  (its depth targeting during the boss fight; the dodge runs still clear). Next worker: fix the bot or the boss depth chase first.
- Built file switched to belt ON: footvis-test, streetdraw-test, streetsong-test, focus-test, footlab-test all PASS; guard.py ok.
- Phone 390x763 screenshot (belt on, not committed): the road band reads clearly; nit: props are drawn before all actors, so Kai
  standing behind a wall-side crate (z < .12) is drawn over it. Fix: put props into the depth sort.

## Left / ideas
- D5 (later worker): props are at z .12 by the wall; make crates/barrels at mixed depths, barrel blasts hurt foes at any depth in
  radius (already), knock foes into props (knockback in depth). Hazards that hurt foes too.
- Platforms (st.plats) and the stage hook's lanes are still drawn at the front line (no depth) - check footstage stages with the flag on.
- Old draw path (?streetlook=0) has no belt drawing.
- Balance: the bots' clear rates move with the belt (nearest 0%, gfirst 38%, dodge 100%); tune after the owner plays.
