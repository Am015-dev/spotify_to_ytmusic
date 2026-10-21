# W125 handoff (Flight School: never empty, drills stop, SKIP DEMO)

Done (parts/schoolfull.js, parts/school.js, school-full-test.js; all school-full-test lines PASS):
- Dodge and fan drills run their own timed volleys (SF.VOL): volley at once when a rep starts, round 2/3 = more volleys, shorter interval, denser fan. Empty seconds per round are measured (`__schoolfull.state.em`), watchdog fires a short aimed fan after 2.4 s empty. Gaps shortened (round 1.1 s, fail 1 s, success .6 s). Max empty stretch with a bot: 1.1 s on 15 fly drills (pick 2.4, weapons 3.0 while the bot cannot play weapons).
- shut()/run()/LIST/SKIP now fully stop a running drill (tut, lesson, foot) via stopDrill(); a new drill starts cleanly.
- SKIP DEMO button (#sfDemo) for tut, lesson and foot; a cleared drill replays with no demo (SCH.was).

Bot clear rate (RUNS=3, real input, no god, 180 s cap, scratch bot, 390x763 sim): shoot, dash, pick, shield, swarm, charger, bomber, carrier, gate, move 3/3 in 54-81 s; fan 3/3 in 102-112 s; leader 3/3 (62-163 s, 2 slow); dodge 1/3 (bot hits in round 3; softened once, re-measure).
NOT done: emp and weapons drills not cleared by the bot (bot cannot release fire to cool guns, cannot drive the weapon panel) so those two are unmeasured for clear rate; lessons and foot "empty seconds" not measured; real-input bot is not yet in the repo (only in the worker scratch); no phone screenshots were viewed (time).
Next: put the bot in school-full-test.js, release-fire hook for emp, panel hook for weapons, re-run dodge RUNS=8.
