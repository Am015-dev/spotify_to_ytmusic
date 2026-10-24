# W208 bullets (flag RET.shots, default ON, `?shots=0` = old look)

Shots: `stage1-heavy-fire-phone-390x763.webp`, `stage1-heavy-fire-pc-1440x860.webp` (stage 1, heavy fire, stepped sim, WebP q82).

Gate numbers (`qa/shots-probe.js`, stage 1, 3 runs x 90 s game time, stepped, phone 390x763, ring 14 px round each shot, backdrop alone via LGB.grab):
- player shots: luminance contrast vs backdrop median 17:1, p10 11:1, 0 of ~1030 sampled below 3:1; lit width 8 CSS px; (baseline: faint cyan slivers, owner: "not visible")
- enemy shot looks in stage 1: 5 (pink ball, orange diamond, red ring, yellow needle, lime square); shell / rocket / homing add 3 more later
- enemy shots drawn under player shots: 0 (enemy pass runs after explosions, player shots before)
- simhunt: same severe kinds with the flag on and off (unexplained deaths, pre-existing); guard.py ok

Comparison: reference frame URL not set, no benchmark frame could be fetched from this sandbox (orchestrator: add an id-only URL here). Against the rule 17(d) list of a well-regarded modern side-scroller: player shots bright and under, enemy shots dark-outlined with white core, one shape + colour per shooter: met. Still short of it: player bolts are small slivers on the phone, the lime squares are large and boxy, and the weapon pictures are 96 px art stretched, so the sprite art itself is the limit (rule 17f), not tint. Own BULLETS score 22/100 (owner's last < 10, cap +15).

## game-look "Check before reporting" (honest, per row; colorize.md applied to the bullet colour roles only, critique.md not read in full)
- SHIPS: not touched by W208. The enemy hulls in the pair still look pasted over the backdrop (flat, no haze or light spill); other workers own this.
- BULLETS: roles are now separate: enemy = pink / orange / red / yellow / lime (all warm, nothing else warm and saturated on the play layer), player = cyan-white, pickups = purple. Still sloppy: the enemy shots are drawn with arc / fillRect shapes, which game-look forbids where art exists; I used no owner picture for them (only fx-bullet-* exist for orb / needle / shell / rocket and they are dim, 96 px, and read as a different style next to the player pictures). Player bolts: weapon picture plus a drawn cyan lens, so two styles on one shot. Needed sprites (Flow list): one bright 5-variant enemy shot sheet in one outline weight, one player bolt per weapon at the same texel size. The dark underlay is a fix for the backdrop, not for the art.
- ENVIRONMENT: unchanged and the weakest row: the backdrop is as busy as the play layer and lit from a different side than the ship glow; shots stand out only because of the dark underlays and outlines.
- FEEL: muzzle / hit sparks are 50 % larger, nothing else changed; explosions still draw over the backdrop with additive pictures and no smoke. Most of the frame still looks sloppy; the probe numbers show readability only, not that it looks good.
