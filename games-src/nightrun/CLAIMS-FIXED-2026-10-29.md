# Claims fixed (W267, 29 Oct 2026)

Source: REVIEW-2026-10-29.md (W266, 75 claims: 43 TRUE, 25 FALSE, 7 UNTESTABLE). Rule used: the SINGLE wrong side is fixed; no balance number was changed. Re-check = `qa/claims-check.js` (17 PASS lines, run on the built page) unless noted.

## Street instructions (top risk)
| What | Old behaviour | Truth measured | Fix | Re-check |
|---|---|---|---|---|
| Hints and notes hidden under purefoot | `streetlook.js:195` skipped the strip when `RET.purefoot` (on by default); BEHIND caption hidden too | with the live look: no strip at 2.5 s on phone/PC | code: strip drawn again; BEHIND caption now one line on the empty road strip (bottom), not over actors; overdrive/guard panel moves under the strip (`purefoot.js tells`) | PC 1440x860 + phone 390x763 shots: "D or → to run" / "Push the stick right", then dodge hint after 250 px, gone after 20 s (hintT); no overlap with hearts, actors or buttons. `claims-check` PASS (hint drawn) |
| Teaching notes (GUARD, PARRY, CLOSE CALL) never showed | `street2.js:106` zeroed `S.note.t` every frame; the GUARD note sat inside a draw wrapper purefoot skips | note set at 3 s, wiped | code: teaching notes carry `teach:1` and survive; GUARD note moved to logic (`streetguard.js sync`) | shot at 3.3 s shows "GUARD: hold to block hits from the front"; `claims-check` PASS |

## FALSE claims (25): 18 fixed (16 text, 2 code), 7 open. Flight 9
| # | Claim | Truth | Fix | Result |
|---|---|---|---|---|
| 1 | Power Amp "Power-ups last +10%" | scales only SLOW, MAGNET, TEMPO | text | claims-check PASS |
| 11 | Power Core "+8% damage" | hits above 2 count half (core/b.js DMG.hit, hk 2, half .5) | text "(a hit above 2x counts half)" | PASS (cap constants read from source) |
| 14 | Critical Core "hit 3x" | lands about 2.26x at base 1.32 | text "up to 3x (above 2x counts half)" | PASS |
| 15 | Crit Chip "about 2.5x" (2 copies) | code x3, then capped | text, both copies | build greps clean |
| 19 | Dash Capacitor "+N charges, max 5" | max 3, 4 from level 2; later levels only speed refill | text generated from the ABIL formula (`dashTxt`), also the in-run `dc` line | PASS x5 levels (text = ABIL.max/refill) |
| 25 | dash refill 1.7 s .. 1.2 s | 4.08 s .. 2.93 s (TIM.RF 2.4, timing default) | comment corrected to measured values | same PASS lines |
| 27 | on-beat dash refunds a fifth of a charge | never runs under timing; a dead-on-beat dash that parries a shot refunds a whole charge, with no shot nothing | text/comment (timing owns the refund; adding the fifth would change gated dash balance, so NOT done as code) | PASS: no shot n 2->2; shot n 2->3 |
| 30 | GLASS "damage x2" | about x1.76 after the cap | tip "up to x2" | PASS |
| 34 | breather "3.5-5 s empty field" | rest timer 3.5-5 s; measured empty gap 1.3-13.5 s | WAVES.md | doc only |

## Foot/story (16)
| # | Fix | Result |
|---|---|---|
| 1,2 | street3.js header: ~4-4.5 min, median clear 243-269 s | text |
| 3 | footstage.js header: old stage, live is 6 rooms / bigheavy | text |
| 4 | STREET2.md: no checkpoint on street3 | text |
| 5 | FOOT-ENEMIES.md: live roster is rusher, gunner, heavy, bigheavy | text |
| 6 | FOOT-ENEMIES.md: 1 damage = 1 whole heart | text |
| 13 | streetboss.js header: sboss ON by default | text |
| 20,21 | hints drawn (above) | shots + PASS |
| 8, 11, 12, 19, 26, 30, 32 | NOT DONE (see HANDOFF-W267.md) | open |

Docs: `ORCHESTRATOR-HANDOFF.md` bossplay table row + 3 mentions now say ON (bosses/bossplay.js:20).

## UNTESTABLE (7)
| # | Claim | Resolution |
|---|---|---|
| 29 | EMP CHARGE "meter fills x2" | measured: doubles the fill but the grit meter rescales it (ratio 3.1 in one run, not 2); number removed, text "charges faster"; PASS on > off |
| 35 | gold leader 1.6x hull | number removed from WAVES.md (not measured) |
| 36 | after 22 s the rest flies out | code-traced only (waves.js:103 TMAX 22 calls flee()); not measured in play; doc left, still unmeasured |
| 37 | weapon DPS 2.5x at L10 | comment now says the card shows a displayed power number, DPS not measured |
| 38 | Wide EMP 35% | number removed from the text |
| 39 | TEMPO "faster waves 1.5x" | removed from the header comment (no player text promised it) |
| 40 | BUBBLE absorbs one hit | NOT DONE |
