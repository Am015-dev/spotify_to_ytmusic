# HANDOFF W147 (review 10 fixes #4, #12, #14)

Branch nr/W147. Flags: none new (these fixes are on by default, RET.calm / RET.menufix already gate their owners).

## Done (gates run one at a time on the full build)
- #4 boss intro: calm.js banner override now treats the boss intro ("WARNUNG") as the same top chip as the stage title (2 s, 24 css px, name + sub on one line). review9-test #1 extended to the boss intro (sek-adler, hoplite): PASS.
- #12 achievement toast: stats.js only uses the bottom slot (the top holds the score strip and the boss bar) and waits while a boss intro banner is up. menufix2 14/14, menufix3 19/19 (after the E14 format assertion below), phone-check mainhattan-nightrun: 0 errors.
- #14 forge: empty loadout cells say "EMPTY" (no "NO CORE" / "NO PASSIVE"); fmtN (a.js) is now plain digits, "2400" not "2.400". Text scan of forge/inventory/garage code: no NO label, no thousands dot.
- Test updates that encoded the old format: menufix3-test E14 (now expects 2400, no dot); ret-trans-test (expectations use fmtN, '5000').

## Not done
- #14 real weapon icons on forge cards: NOT done. FG.icon already prefers media/wpmount-<id>.webp, but those files are placeholders (about 8 KB, not listed in media/ready.json), so the cards still draw the colour shape. Real art is an owner asset (review 10 "Assets for the owner": forge weapon icons). NO NEW ASSETS policy, so no code change.
- calm-test FAILS on "legend st10: at most 2 rings per enemy (max 3)". Same failure on the baseline parts (checked by stashing my parts changes), so it predates this branch and is not from W147.

## Tests run
review9-test ALL PASS; menufix2-test 14/14; menufix3-test ALL PASS (19); calm-test FAIL (pre-existing, see above); hud-cover-test PASS; guard.py ok; ret-trans-test ALL PASS; phone-check mainhattan-nightrun pass.
