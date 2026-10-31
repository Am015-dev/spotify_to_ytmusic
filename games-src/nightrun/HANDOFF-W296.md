# W296 x2 sprite strips: LOOK, budget, wire proof (branch nr/W296-sprites, from nr/W265-expand + main working branch)
Flag `?expand=1` stays **default OFF**. Originals untouched. Not deployed. Generated index.html / sw.js not committed: rebuild (`python3 games-src/nightrun/parts/build.py`) before any deploy so the precache list matches the 16 strips.

## KEEP / DROP (44 strips existed after W265; W265's 23 drops stay dropped)
LOOKED at contact sheets old/new (bosses, foes, props) and flame-crop sheets (all ships; green dot = original frame).
- KEEP, looked fine (16 shipped, 11.6 MB): bosses bruecken-waechter, flusskrake, hoplite, schranken-wart, talos, tresor-wart (idle); foes bruiser, grunt, knife, shield, turret, warden (idle); props neon, police, windows (loop); ship-nova (flame).
  Soft spots seen, kept: talos / shield in-betweens slightly softer in stills; prop-police glow fades through a translucent ring (a fade, not a ghost).
- DROP after LOOK (8, ghosting / smear): ship-ecdrone, ship-eflank, ship-drift (fuzzy doubled flame in-between), ship-std (translucent box behind the flame), ship-esniper, ship-eswarm, ship-ezdrone (fuzzy flame blobs), ship-ehealer (cross emblem smudges across the hull).
- DROP for size only (19, looked fine): ship-ebomber, ec, ecarrier, echarger, ecrawler, ecruiser, ediver, edrone, egtank, egturret, egunship, einterceptor, ekamikaze, eminelayer, eturret, ezbomber, lancer, swg, syn, tri (flame). Flight flames already play at 24 fps, so ships go first; lancer would put the total over 12 MB.
All three lists are in strip-expand.py (SKIP, BUDGET_SKIP); a full run reproduces the shipped set.

## Media: 31.3 MB -> 11.6 MB (11,610,010 bytes), lossless
Lossy was measured, not shipped: webp q92/q96/q100 + alpha 100 changes the original frames by up to 15-40 levels premultiplied (p99.9 5-18, mean 0.4-1.1) on talos, grunt, nova, ec, police, so no strip meets the 2-level gate; those strips stay lossless. Originals are pixel-identical inside every x2 strip (checked on re-read by the script). Lossy q92 of all 36 looked-OK strips would have been 9.1 MB; not used.

## Wire proof (headless chromium, real input, ?expand=1)
- Street phone 390x763 (touch) and PC 1440x860 (mouse + keys), gauntlet-foot dodger bot with JUMP=152 (boss-isolated start, real input): both started and ran to the BIG HEAVY phase; shots LOOKED AT (/tmp only, not in repo): the heavy and Kai, no ghosting, no doubled edges, same size and feet. 0 page errors, 0 console errors.
- x2 strips actually drawn in play (hook on ART.anim, counts of draws of the decoded x2 bitmap): street phone prop-police 1038, knife 113; street PC prop-police 840, knife 161; 7 x2 strips decoded in each run.
- Same size / anchor / feet: the x2 json keeps w, h, anchor, body of the original; frame 0 of each x2 strip is pixel-identical to the original, so the frame-0 bbox diff is 0 px. Cycle time unchanged: frames/fps equal for all 16 (checked from the jsons). Loop closes last -> first. Until the x2 strip decodes the original plays (ART.x2), switch step pixel-identical (W265).
- NOT PROVEN: (1) the BIG HEAVY idle drawn as an x2 strip by name: the bot run showed the heavy on screen but its draw log was not captured, and the separate short street runs (no boss) logged only police + knife, (2) an expanded ship flame in a flight run: with ship nova owned and equipped the flight ran (phone + PC, no errors) but the nova flame strip (original too, flag off) was still not decoded after 20 s, so no x2 flame was drawn; I could not show it. (3) pop at the loop / pop-in measured only by the W265 numbers, not re-measured here.

## Perf (phone 390x763 dpr 3, 4x CPU, street, playability-probe 25 s, 3 alternating runs)
off 21.9 / 20.9 / 21.4 fps (mean 21.4); on 20.9 / 18.8 / 20.4 (mean 20.0): -6.5%, lower in 3 of 3 pairs; p95 frame 133-150 ms both. 0 errors. Decoded-image memory: performance.memory does not see it; computed from the strips: the 16 x2 strips decode to 65.8 MB vs 32.9 MB for the originals they replace = up to +33 MB if all are loaded (street loads about 7 per run).

## Flag default: leave OFF, because
1. Decoded memory +33 MB worst case is unmeasured on a device, and the iPhone reload / memory history (beta.164) says do not add that blind.
2. fps -6.5% in every pair (inside the 10% budget but consistently on the wrong side), on a laptop headless run, not a phone.
3. Flight ship flame x2 and the boss idle by name are not shown drawn in play.
To ship: one real-phone run of street with ?expand=1 (memory in Safari / Chrome remote debug), then flip the default in streetfeel.js line 10 and delete the flag test in art.js ART.x2 (rule 18b). Owner option to save memory: keep only the bosses + 6 foes (decoded about 40 MB less than all 16 on screen at once).
