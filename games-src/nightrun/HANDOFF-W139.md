# HANDOFF W139: legible enemy rim (review 9 E21 / fix #10), NOT finished, no code pushed

Goal: legible-test enemy median >= 4.5 in every scene, p25 >= 3. Result: not reachable by the glow alone; nothing switched on.

Tried (parts/legible.js `LGB.enemy`, after the two existing glow discs): one flat pale disc (fill GLOW, radius 1.2 x r, alpha RA) plus a 1.6 px pale edge line, same source-over pass, no blur.
- RA .45-.55: median stage 10 / 14 / 20 / boss / endless 10 rose to 6-14 (from 2.3-9). Boss median 2.7 -> 6-8, p25 2.0 -> 4.3-4.8.
- RA .8: bullets over the disc lose contrast: stage 10 bullet worst 10% fell to 2.79 (gate 3). Even .55 gave 1.9-2.8 in 2 of 5 runs. Keep RA <= .35 or draw the disc under the bullet halo only.
- Cheaper radial extra (third glow sprite at 1.3 r) only gave +1 to +2: not enough.

Why p25 stays low in stage 2 (1.3-1.6) and endless 10 (2.9): the low enemies are the same few, all at the top of the field (game x 830-870, canvas y 99-138 at DPR 1.5, i.e. just entering). Their changed pixels have luminance 0.01-0.03 on a black backdrop, so the under-glow is not visible there at all although LGB.enemy ran (e._lg=1). Enemies at the same height in the boss scene are fine, so it is not a plain HUD rectangle. Next step: dump a 120 px crop of the frame with and without enemies at one such enemy (A vs Be in legible-test.js RUN) and find what paints over the glow (suspects: top fade in hud.js / READ.dim band, spawn-in alpha in VAR.in). Stage 6 never has an enemy in the measured area (n 0), so its gate passes vacuously.

Run-to-run variance is large (stage 2 old-look median 1.4-2.7 between runs; few enemies per frame), so the final gate needs RUNS-style repeats or a larger sample before p25 >= 3 can be enforced.

Patch kept out of git (rim only, ~6 lines): ask the orchestrator or re-apply from the notes above.
