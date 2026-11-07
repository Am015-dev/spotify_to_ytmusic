# Redline Rally: art direction

**Style:** Kenney flat top-down racing look: thick soft outlines, two-tone cel shading, one warm sunset palette (navy #1b2a41, orange #e87722, cream #f4e9cd, teal asphalt, Kenney grass green). One pack family for everything, so the cars, the track, the cards and the portraits share the same drawing.

**Packs:** Racing Pack (cars, ground tiles, trees, rocks, tyres, cones, tribunes, tents, chevrons, barriers) for the world; Toon Characters 1 (six characters, front pose, one per driver, team-colour backdrop with chequer rim) for portraits; Kenney UI Pack proportions for the panels (cream rim, navy outline, top highlight).

**Slots:** all 43 in assets.json. Boards are laid exactly along the guide centreline (road width 124, same corner positions the game uses for its signs): sand (Sunline) or dirt (Hairpin) run-off, white edge lines, orange/white kerbs on the corners, tyre walls on the outside, chequered start line, scenery kept out of the corner-sign ring. Cards: type colour field, chequer flag borders, one clear object in a disc, the area above the disc left calm for the speed number the game draws. Cars: nose to the right, shadow, 256x128.

**Why not generated art:** the owner rejects anything that looks like code-drawn HTML; real CC0 pack art is the quality bar. Only the trophy cup and the corner-sign disc are drawn (no pack has them), in the same outline and palette.

**Rebuild:** `tools/fetch-packs.sh`, render the vector sheets (tools/render-vectors.js, tools/render-toons.js), `PACKS=... python3 compose.py`, `python3 install.py --force`.
