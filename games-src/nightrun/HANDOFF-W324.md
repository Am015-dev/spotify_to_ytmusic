# HANDOFF W324 (readability: boss bar, multiplier / power labels, HUD vs touch buttons). Branch nr/W324-readable, not deployed.

## What changed (owner files)
- Boss bar: `parts/render/pureboss.js` `PB.bar` (the owner under purelook; the old bars in hud/c.js and render/diet.js read G.boss, which PB hides). Was one 4 px orange line on the top edge with no name.
  Now a framed bar with the name ("BOSS · NAME" / "MINI-BOSS · NAME"), 4 segments, "PHASE n" at the right, drawn from the moment the boss is spawned (it used to wait until x < W).
  Phone: full width under the score strip. Landscape / PC: starts right of the score + multiplier so it never covers them.
  The bar was already present for the reviewer's shots only as the thin line; the boss in those shots was the mini-boss or the spawn frame (boss still off screen, shot taken before the first boss frame).
- Multiplier: `parts/hud/multhud.js` (owner of the number in the lean HUD). Phone: "×1.2 POINTS". Landscape / PC: "POINTS MULTIPLIER" under the number (long caption for the first seconds as before).
- Power timer: `parts/powers/power.js` `PW.hud`: "7 BARS" -> "7 BARS LEFT" (bars of the song until the power-up ends). It is a power-up timer (TEMPO UP = double-time fire, score ×2), not a music tempo.
- HUD panel vs touch buttons: `parts/render/diet.js` `DIET.hudL` (the lean HUD owns the panel at 844x390 and PC; hud/c.js drawHUD is the full-HUD copy and is untouched). With `touchUI` the panel shows HULL only (118 px wide); DASH / EMP live on the buttons. PC keeps HULL / DASH / EMP.
- Tests: `qa/copy-test.js` (+2 checks: boss bar names the boss, multiplier carries the word POINTS), `qa/w324-boss-shot.js` (new, boss-arrival screenshot, ONLY=phone|land|pc JUMP=1 PRE=x OUT=dir).

## Shots (looked at, not committed; /tmp/w324 in the worker container)
- before PC (a-pc-boss): 4 px orange line across the top, no name; "x1.0" bare; power panel "MAGNET STORM 7 BARS"; HULL/DASH/EMP panel.
- after PC (h-pc-boss): framed bar "MINI-BOSS · TRESOR-WART" with 4 segments, "×1.0 / POINTS MULTIPLIER" under the score, panel unchanged on PC.
- after phone 390x763 (j-phone-boss): bar full width under the score strip, "MINI-BOSS · ZENTRAL-ICE", "PHASE 2" at the right, "×1.2 POINTS" in the strip. One glance: the bar tells which one is the boss.
- before/after 844x390 (c-land vs h-land): panel was HULL + DASH + EMP next to the DASH / EMP buttons; now HULL only. Bar clear of the multiplier.

## Run / not run (honest)
- PASS copy-test (0 failed), bossbar-layout-test 0 failed, claims-check all PASS.
- NOT RUN (machine load 20 on 4 cores, 45 min cap): flow-test 91/0, gauntlet-shell 399/0, gauntlet-flight phone shooter 4/4 boss killed, fps probe. A partial gauntlet (SEEDS=4 JUMP=1 PAR=2 WALL=300) gave seed 2: boss seen + killed, next stage started, 0 errors, hud 0/25; seed 1 died before the boss; seeds 3-4 did not finish. Re-run these on a quiet machine before merging.
## Left / not done
- Boss body size: the stage-1 boss art (`PB.boss` wd factor 1.2 PC / 1.9 phone) is unchanged; the mini-boss vault is ~14% of the PC width. A bigger body needs a hitbox-vs-art decision (art is already ~1.8x the hitbox) - owner call, not changed.
- Phone power chips (`PW.chips`) are rings with icons and no words (rule 8 b: read by shape); not touched.
