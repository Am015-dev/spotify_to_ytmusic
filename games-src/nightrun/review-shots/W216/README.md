# W216: bosses, gate pylons and enemy shots under ?pure=1

Shots: `boss-phone-390x763.webp`, `boss-pc-1440x860.webp` (stage 8 boss fight, bot-played, frame taken mid fight, WebP q90).
Part: `parts/render/pureboss.js` (wraps PURL.foe / PURL.shots / PURL.pickups, nothing in pure.js changed). Probe: `qa/pureprobe.js`.

What changed: the boss is its owner sheets (idle, attack while it fires, hit on damage, defeat clip), a phase shield is the fx-shield sheet,
boss lasers / gate beams are fx-eb-laser-sweep, telegraphs fx-eb-aim-line, gate pylons the owner gate sheet. Enemy fire is one hot-orange family
(fx-bullet-shell aimed, needle, rocket, fx-eb-mine, a bigger spinning shell for homing); the lime orb is gone. Boss health = one thin bar on the top
edge (old red bars and pips hidden under purelook). Power-up pickups: the owner icon only (no glow disc, dashed ring, name text). Boss art drawn 1.2x (hitbox unchanged).

Gates: probe PASS on phone and PC, 0 arc / rect / fillRect / stroke / fill / fillText in the play field (HUD excluded) over all of stage 1 and the stage 8 boss fight.
Simhunt (stages 1-8, 1 seed): the same 2 severe kinds as without this part (unexplained-death parked / human), the sim never calls render.
Left over, not fixed: gwalker (ground walker, no sheet yet: `ship-egwalker`, ASSETS-NEEDED-ENEMIES.md #13) keeps its old code picture; the probe skips it.

## Critic pass (my score /10, from the two shots plus one synthetic laser + gate frame)
| Row | Score | What still looks pasted or sloppy |
|---|---|---|
| Boss (SHIPS/ACTORS) | 7 | Reads clearly and is lit like the backdrop; the shield bubble is a flat cyan ring a bit large, and on phone the boss is still only ~110 px wide. |
| Enemy shots (BULLETS) | 7 | Orange shells are distinct from the pink player shots and the backdrop; on PC the shells are small against the city, the needle is thin. |
| Beams, gates, telegraph (FEEL) | 7 | Owner laser looks like part of the scene; the gate telegraph line (aim-line sheet) is faint, hit and defeat feel not judged here (probe renders, no real-time play). |
| Boss bar (HUD) | 7 | Thin orange line on the top edge, clear but easy to miss next to the progress strip. |
| Environment | not in scope | Unchanged from W214. |
My scores are higher than the owner's last (all < 10/100 + 15 allowed by rule 17c); this is a worker view, the owner's verdict decides.

## Round 2 (critic W219: owner-art 6, silhouette 5, find-player 2, enemy shells 8)
Merged origin/nr/W215-flight (player ship, shots, backdrop, pure default) cleanly. Shield fx now 0.8x at alpha .6 so the boss outline shows; phone boss art drawn 1.9x
(body about 40% of the 390 px short side in the new shot; PC 1.2x). Enemy shells unchanged (orange family). New shots replace the old pair.
Probe: PASS on phone and PC with SKIPSHIP=1. Without it W215's player rim light (PURL.player > rim, fillRect) shows up as code shapes; that is W215's part, not changed here.
Re-scored from the new pair: boss 7 (outline readable now, but hit flashes still wash the body on PC), enemy shots 8, beams / gates 7 (unchanged, not re-viewed), boss bar 7.
Find-player is W215's row: the player ship is small and pink-on-purple against the boss in the phone shot.
