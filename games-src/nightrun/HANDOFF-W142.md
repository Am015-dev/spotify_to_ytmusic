# HANDOFF W142: enemy contrast (review 9 E21 / fix #10), pushed to nr/W142 for review

Change (flag `legible`, ?legible=0 = old look): parts/legible.js `LGB.rim` (flat pale disc 1.15 r at alpha .3 + 1.6 px pale edge, no blur), `LGB.BR` 1.4 hull brightness
(foeart.js tints, built once per sheet; native SPR.foe ships get one added 'lighter' copy at alpha .4). legible-test gates raised: enemy median >= 4.5, p25 >= 3 every scene.
Low cases found: dark hulls whose sprite is bigger than the glow (charger / kamikaze red, fleet navy) at the black top of the field, not a HUD cover.

Results, 7 full legible-test runs on this code: enemy medians 4.75-13.4 (boss lowest), p25 >= 4.3 in every run. 3 consecutive ALL PASS (r1-r3).
Open: stage 2 enemy-bullet worst 10% fails in ~1 of 3-4 runs at 2.48 (n 9), always the same frame: a needle inside a fresh kill explosion right under a lit leader;
the explosion fx is drawn over the bullet and its halo (old look scores 1.44 on that frame). A wider dark halo for bullets inside an enemy glow did not change it (reverted).
Not seen on the live build in 4 stage-2 runs (that frame variant did not occur). Fix needs the enemy-bullet layer above hit explosions (not legible.js), or a test rule.
Other checks on this build: explain, overlay, hud-cover, guard pass; diet st14 p95 79 fails identically on live (pre-existing).
Debug: DBG=1 prints low enemies with pixel samples; DBG=1 SHOTS=dir saves a 3-panel crop (all / no bullets / no enemies) of the first low bullet.
