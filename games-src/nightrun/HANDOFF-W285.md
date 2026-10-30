# W285 deployable check (branch nr/W285-deployable from nr/W284-phone-flight), 30 Oct 2026. Not deployed. Verdict: DO NOT SHIP
Logs and shots (not committed): /tmp/claude-0/-home-user-spotify-to-ytmusic/8de4be48-4008-519a-8ffc-12f0d8690130/scratchpad/ (live/, rc/ = smoke logs; fp/ = fingerprint shots + hashes; b/ = boss shots; final1.txt).
## 1. smoke.sh, live branch (origin/alex/brave-carson-rbpmlk b18dd910b, W255 look) vs RC (W284), one browser at a time
| test | live | RC |
|---|---|---|
| fingerprint | FAIL (8 of 8 scenarios differ from stored hashes) | FAIL (8 of 8) |
| hud-cover, ui-align x3, hub 54, story 31, flow 61 | PASS | PASS |
| sprites (hoplite boss arrives; f8 fx sheets not drawn, fx 0) | FAIL 2 of 38 | FAIL 2 of 38 (same two) |
| labfull | PASS | PASS (W284's single fail did not reproduce: flaky, not RC-caused) |
No test fails on the RC only. fingerprint and sprites are PRE-EXISTING (fail on live too): not fixed.
## 2. fingerprint: RC hash vs live hash (same harness, same seeds)
fly6, fly10, fly14, endless10, legend10: state AND draw hash identical on RC and live, so the RC changed nothing there; the stored hashes are stale since before W255 (live fails them too). fly2, boss: state identical, draw-call hash differs; shots of both builds (fp/live, fp/rc) LOOKED at: visually identical, no defect seen, cause of the draw count not found. street: state hash differs (street gameplay changed W274-W282); the harness shot of the street scene shows the title screen (the street canvas is not on screen in that headless drive), so that scene was NOT looked at; RC street was looked at in the boss shots instead. Verdict: NO hash regenerated (not all 8 looked at, and the owner task said never regenerate unseen). fingerprints.json unchanged. fingerprint-test.js gained SHOTS=dir (writes a jpeg per scenario; read-only).
## 3. Boss head under the name bar: FIXED (game code)
Cause measured: on 390x763 the body sheet's opaque top was y 129-154 px, the name bar spans y 151-181: head hidden (-52..-27 px). Fix (owner: purefoot.js dE0 + streetlook.js slHud): slHud stores the bar bottom (SL.barBot); the boss is drawn scaled about its feet until its head top is >= 8 px under the bar (draw only, hitboxes unchanged; scale floor .45). Tuning is conservative: phone boss is drawn about 40 % smaller than before; clearance now 42 px phone, 8.5 px 844x390, 67 px PC. A follow-up can tune the factor (1.25 in purefoot.js) to ~1.1 for a bigger boss on phone, but 844x390 sits at 8.5 px already. bossbar-layout-test now ASSERTS the clearance (measures the biggest drawImage = body sheet, not halos): PASS at 3 sizes; NUDGE=1 (head 20 px up) FAILS at 844x390 (proof it can fail). Shot looked at: b/spawn-390x763.png (head clear under the bar).
## 4. Final verification (final tree)
PASS: flake8 0, build, flow-test 61, gauntlet-shell, claims-check, focus-test, bossbar-layout-test (3 sizes). preload-test 15 pass. NOT RE-RUN on the final tree (out of the 60 min): streetsong, streetdraw, footvis, smoke.sh, streetsim gates, 3-size page loads, 8 PC flight runs. They passed on the RC before this change (RELEASE-CHECK rows 17-20, 22) but the boss draw change touches street rendering.
## Verdict: DO NOT SHIP
Reasons: (1) final verification incomplete on the changed tree; (2) phone flight not resolved (RC 4/8 = control 4/8, no regression, but dodger 1/4); (3) boss draw is conservatively small on phone, needs a look from the owner; (4) fingerprint and sprites smoke tests fail on live too (pre-existing), fingerprints.json stale.
## Next (one task, sonnet)
Re-run the rows not re-run (streetsong, streetdraw, footvis, smoke, streetsim x3, page loads, PC flight 8 runs) on this tree; tune the boss scale factor with a shot at 390x763 and 844x390; look at the street fingerprint scene by rendering it with the foot canvas visible, then regenerate the 8 hashes (UPDATE=1) in a separate commit.
