# HANDOFF W254: look merge (branch nr/W254-look, from alex/brave-carson-rbpmlk, not deployed)
## Merged (in order)
W248-merge (W238 W239 W243): merged. W246-flow: merged. W244-light: merged, conflict in pureboss.js (W239 vignette kept, boss drawn through PURL.ink). W245-clean: merged. W250-parallax: merged, then MID layer dropped (see Perf). W251-boss: merged, conflict in pureboss.js (rotated phone boss now also drawn through PURL.ink; vignette kept).
NOT merged: W253-smooth (its HANDOFF says the no-flicker gate is not proven, fps not run), W252-grain, W242-start. HANDOFF-W253.md does not exist.
## Tests, merged build vs base build (same machine, sequential)
| test | merged | base |
| flow-test | 61 pass, 0 fail (a first run had 3 fails while I ran screenshots at the same time: load, not a bug) | 0 fail, 61 pass (merged test file on base build) |
| focus-test | 15/15 | 15/15 |
| preload-test | 15/15 | 15/15 |
| visible-test | 16/16 | 3 FAIL (zoo-efdrone, zoo-einterceptor on screen < 2 s): merged is better |
| streetsim RUNS=6 | FAIL: best bot/nearest clear 83% (gate 60-80 / 25-40), threat peak, kill order, W243 gfirst/dodge 83% (want 75/65), cover hits, W196 stand-still 20.2%, seed==realtime | FAIL: gfirst 83%, nearest 67%, threat peak, cover hits, seed==realtime |
Differences: merged streetsim is easier (83% for all bots) and fails 4 gates base passes (kill order, W243 gfirst, W243 dodge, W196 stand-still). RUNS=6 is a small sample; W248/W243 own this balance, re-run with RUNS=12.
smoke.sh: NOT RUN on either build: its first test (fingerprint-test) sat with no output for 5+ minutes in this sandbox and I killed it on both.
## Perf (phone 390x763, 4x CPU throttle, rAF fps over 8 s of flight, my script scratchpad/shots.js; playability-load.js only measures load time)
base 12.3 / 11.6 fps. merged 6.0 / 4.9 fps (about -55%). merged without W250 mid layer 5.3 / 6.0 (the mid layer is NOT the cause; dropped anyway per the rule, vtile .3 line removed in pure.js).
The remaining ~50% loss is somewhere else in the combined build (suspects: W244 PURL.ink per actor/pickup/boss, W246/W245): bisect by flag next.
## Shots (scratchpad, not in repo; last run = merged without mid layer, god mode, bot)
/tmp/claude-0/-home-user-spotify-to-ytmusic/72c1992f-18f7-5d83-b5c7-baa5b17de672/scratchpad/shots/phone-flight-2s.png
.../shots/phone-flight-10s.png, phone-dense.png, phone-boss.png, phone-street.png, pc-flight-2s.png, pc-flight-10s.png, pc-dense.png, pc-boss.png, pc-street.png (same folder)
Note: the "boss" shots show a normal wave, the boss had not entered yet (my script is weak there). Street = Kai on the zeil street.
## Three worst remaining problems (from looking at the phone flight, phone street and PC dense shots)
1. Performance: about half the phone fps of base at 4x throttle. Must be fixed before any deploy.
2. Phone flight backdrop: rooftop side strips are a top-down view over a street-level painting; busy circuit-board texture on both sides competes with the ships and bullets, reads as a different picture from the centre.
3. Phone street: the ground is a flat band with the character; sky strip on top is cut hard at the horizon (visible line across the whole width), Kai has no shadow/ink edge matching the flight look; HUD panel crowds the top-left.
Not verified: a real boss shot on phone/PC.
