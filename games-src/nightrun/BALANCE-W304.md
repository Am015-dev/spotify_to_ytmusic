# W304 street boss duel, final constants (branch nr/W304-duel3 from nr/W300-duel2). Code: parts/street/streetboss.js tuning block. Everything else in BALANCE-W300.md holds.

| constant | W300 | W304 | why |
|---|---|---|---|
| GRACE (answer still counts after the READ end, s) | .13 | .18 | a 600 ms reader answers at .64-.95 s after the telegraph (measured, see HANDOFF-W304.md); accepted until .74 / .84 / 1.00 s (PC) |
| TGRACE (extra on a touch screen, s) | .04 | .02 | phone late reader on top of GRACE .13: 1/6 at .04, 3/6 at .06, 4/6 at .08; on top of .18: 1/6 at 0, 5/6 at .02 (a 6-seed cell moves 4 runs for .02 s) |
| duel log entry | [attack, t, result] | [attack, t, result, first answer s after the telegraph, key] | measures the real answer latency (touch dispatch to game state) |
Everything else (TEL, READ end, PUN, damage, HP) is unchanged from BALANCE-W300.md.

The late reader (fixed 600 ms, polled every few game frames at TS 3) is a knife edge: PC late went 0/6 at GRACE .13, 1/6 at .17, 6/6 at .19 (TGRACE 0). One hundredth of a second of window moves
it 20 points. A fixed-latency bot cannot say more than that; a human has spread. Use .18 as the centre and re-measure with 8+ seeds when anything changes the poll rate.

## streetsim (qa/streetsim.js), why the DUEL block "did nothing" in W300
Two bugs, both in the bot, not the game:
1. The bot answered GUARD / DASH by setting I.guard / I.dash = 1 and nothing ever cleared them (street2-test's ctl only resets l, r, u, d, fire, jump). After the first answer the keys stayed held, so the duel's
   edge test (key down now, up before) never fired again for GUARD or DASH: every later swing / charge read "none". Fix: the DUEL block clears I.guard and I.dash every frame before answering.
2. The belt build's jump filter (streetsim.js, "I.jumpP && P.onGround && P.y > 464") cancelled the POUND answer (JUMP) because sb_tel is not in its list of threat states. Fix: it leaves the jump alone while a boss telegraph is on.
Reaction times (game s after the telegraph starts): gfirst .30-.50 (unchanged), dodge .25-.40 (unchanged), nearest .50-1.00 (was .45-.80, which won the boss 96%).
The reach check: a boss CHARGE / POUND hit is a telegraphed attack that was answered wrongly or too late (sbL entry with '+hit'); those are counted and left out of the fist-reach test by design
(the old r.band field was overwritten by the floor-band number, so the count was always 0: renamed r.duelHits). A hurt with no telegraph (not in sbL) still fails the check.
