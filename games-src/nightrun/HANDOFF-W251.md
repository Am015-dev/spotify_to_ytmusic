# W251 phone boss (branch nr/W251-boss)
Change: `parts/render/pureboss.js` PB.boss turns the owner's boss sheet upright in portrait (rotMode), scales it to <= 75% of the play width,
keeps the boss y inside the field with a 10% margin (`PB.keep`, tick), records the drawn box in `e._bb`. `parts/art/art.js` SPR.boss: no extra
additive white hit flash in portrait (the hit sheet shows the hit; the flash clipped the sprite white). PC path unchanged (all guarded by rotMode).
Measured (stage 8 boss, phone 390x763, stepped, 8 seeds, god-mode bot; gate script was a scratch file, not committed):
- in-field (box inside 8% side margin, above the HUD band): 97.2-97.8% of frames (before: 0%, box ran past the field). The rest is the entry slide.
- hitbox vs drawn box centre (pixel diff, boss removed vs drawn): median 3.5 px, 80th percentile 5-15 px (higher while shots/shield add pixels).
- white clip: 0-3 of ~150 sampled frames above 10% of boss pixels at L>.9 (max 17%), before: ~5-30% in hit-flash frames. NOT fully 0.
Not done: only the Sek-Adler (stage 8) was measured; the other nine bosses use the same path but were not run. The boss still faces screen-left (side view
sprites cannot face down); a nose-down boss needs top-down art. Old non-purelook path (draw.js drawBoss) untouched. Boss attacks (lasers, bullets) spawn
from e.x/e.y, unchanged. Look at the phone boss shot yourself before deploy.
