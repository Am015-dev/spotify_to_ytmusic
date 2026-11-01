# HANDOFF W312 (street touch layout)

## Done
- ONE owner for every touch button position: foot.js `layout()` (landscape) and streetlook.js `SL.layout` (portrait). GUARD is now a normal button
  (#fGuard built in foot.js, key `guard` in `L.btn`, same pointer handlers as the others). streetguard.js no longer builds, moves or observes
  buttons (removed `btn()`, the MutationObserver and the re-seat that pushed BOMB next to the stick and GUARD into the play box). Keys I / ; unchanged.
- Layout decisions (written down, buttons not shrunk):
  - Portrait auto ON: row 1 [DASH, JUMP(big)], row 2 [BOMB, GUARD, KNIFE].
  - Portrait auto OFF: row 1 [GUARD, DASH, FIRE(big)], row 2 [BOMB, KNIFE, JUMP]. (GUARD joins the DASH/FIRE row: a 4th button in row 2 would hit the stick.)
  - Landscape (right band, outside the play box): ON [DASH, JUMP] / [BOMB, KNIFE] / [GUARD]; OFF [DASH, FIRE] / [KNIFE, JUMP] / [BOMB, GUARD].

## Numbers
foot-test.js control rows (run on the built game, RUNS default), all PASS:
- PASS phone: layout audit / PASS phone: auto-fire OFF: FIRE cluster passes the layout audit / PASS phone rotated: controls beside the play area
- PASS phone-s: layout audit / PASS phone-s: auto-fire OFF
- PASS land 763x390 auto-fire ON / OFF: layout audit; PASS land 844x390 auto-fire ON / OFF: layout audit
- qa/bossbar-layout-test.js: 10 PASS, 0 failed. qa/streetdraw-test.js: 3 PASS.

## Screenshots (/tmp/w312-*.png, not committed; ON FOOT started by a real tap), each looked at
- port-on 390x763: below the field, stick left; right: BOMB/GUARD/KNIFE top row, DASH + big JUMP below; nothing overlaps, hearts/wave chip clear.
- port-off 390x763: right: BOMB/KNIFE/JUMP top row, GUARD/DASH + big FIRE below; GUARD 52 px right of the stick circle edge, nothing overlaps.
- l763 (auto ON): stick bottom-left band; right band GUARD / BOMB+KNIFE / DASH+JUMP, all outside the field.
- l844 (auto OFF): right band BOMB+GUARD / KNIFE+JUMP / DASH+FIRE, all outside the field; HUD and hint on the field untouched.

## Wrong / not run
- qa/footvis-test.js could NOT run here: it does `git archive 58585ec51` (OLD_REF) and this checkout is shallow (fetch of that sha fails). Not 171/0 proven; run it on a full clone.
- gauntlet-foot has no "duelist" strategy; I used `dodger` (guard/parry bot) PLAT=phone,land SEEDS=2 (land = 844x390). Result vs the base build (same bot, same seeds):
  - phone 390x763 dodger x2: died at the boss, bossHp 205 / 270 left (base: 212 / 205). NOT cleared, same as base, so no regression; the bot, not the layout, loses the boss. Controls work by touch (stick, JUMP, KNIFE, GUARD rows PASS; one run showed a 180 ms 'jump leaves the ground' timing flake, passed 3 of 3 reruns, base passes).
  - land 844x390 dodger x1 (RUNS=2 not finished, time): CLEARED the boss at t=367 s. Its only FAIL 'result buttons not usable: fCity w420 h48' is identical on the base build (not caused by this change; owner: result screen in landscape).
- foot-test bot rows (stale, W311) still fail; not touched. Fallback portrait rows in foot.js `layout()` mirror streetlook (only used if F.look is absent).

## Files
parts/street/foot.js, parts/street/streetlook.js, parts/street/streetguard.js, HANDOFF-W312.md
