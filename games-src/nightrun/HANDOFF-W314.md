# HANDOFF W314 (GOLD decision): gate NOT met; instrument fixed; no game change shipped
- done: found why W299/W303/W308 could not reproduce: the game dice were unseeded and runs shared a page (same seed twice: 1/4 identical). humanbot.js now seeds Math.random per run
  and FRESH=1 loads a page per run (4/4 bit-identical). qa/push-gate.js: RUNS 24 paired seeds, SEEDBASES 0,1000 (all must pass), clear / score / hearts lost / GOLD per bot, paired wins.
- numbers (base 0 | base 1000, HOLD/PUSH/CHOOSE clear %): base 60/49/65 | 65/42/53; best CHOOSE: DASH-ready repair + last-hull punisher 68/83/89 | 58/79/78 (PUSH = CHOOSE);
  no repair + punisher 58/46/72 | 69/35/47. Full table: BALANCE-W314.md (7 tries x 2 bases x 216 runs).
- wrong: no variant passes twice; repair on GOLD always pays PUSH (more GOLDs) as much as CHOOSE; the punisher at hull <= 1/2 does not bite once a repair exists.
  No variant is no-worse than base on every bot, so waves.js is unchanged (as the brief says).
- next (design, not constants): make the reward depend on the CHOICE, not the count: e.g. one GOLD per fifth is already the cap, so let a GOLD be claimable only for the squad
  the player marks (or the first squad of a fifth: commit or skip), or make pushing a gun squad cost a visible resource PUSH cannot refill. Measure with this gate only (about 10 min per build with 4 gates in parallel, PAR=1 each).
- NOT run: gauntlet-flight, flow-test, claims-check, copy-test, fps (no game file changed; W305 8/8 and 91/0, 17/0, 15/0 stand). humanbot results for other tests are now seeded (repeatable) but numbers will differ from older runs.
- files: games-src/nightrun/humanbot.js, qa/push-gate.js, BALANCE-W314.md, HANDOFF-W314.md.
