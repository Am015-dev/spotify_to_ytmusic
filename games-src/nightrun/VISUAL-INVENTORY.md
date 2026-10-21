# Nightrun fly-stage VISUAL INVENTORY (W120, 21 Oct 2026)

Owner: "so many unexplainable visuals, gamer is angry and confused" (score 11/100). Rule 8 of WORKER-RULES.md: every thing on screen is
(S) readable by its shape/colour, (C) captioned in plain words the first time it shows, (W) already plain words, or (R) removed.
Fix layer: `parts/explain.js`, flag `RET.explain` (default ON, `?explain=0` = before). Gate: `explain-test.js`.

**How measured.** 390x763 phone, built game on python http.server, `?sim=1&all=1`, god mode, seeded random, bot flies + fires.
Scenes: story stages 1, 4, 8 (ends in a boss), 12, a forced boss (stage 8 + bossNow), endless to wave 11. Every 30th frame (20th boss,
60th endless) one full render is traced: each canvas fill/stroke/fillRect/strokeRect/fillText/strokeText/drawImage is keyed by the
first stack frame above the ctx wrappers and shared paint helpers (`part.js:function`). "every frame" = >3000 traced calls,
"often" >400, "some stages" >40, else rare. Rows: explain ON run + ?explain=0 run.

**Approved list.** The backticked keys below ARE the approved list: explain-test.js fails on any traced site not listed here.
A new visual must get a row (and a verdict) here before it ships.

## What explain.js changes
- Captions (zonehint.js pattern, one at a time, each at most once per run, upright in the turned portrait world): beat, hull, btn, chain,
  grade, edge, lane, supply, gaterun, warn, tell, counter, leak (texts: `EXP.TXT`). The gravity-well caption (zonehint.js) now uses the same upright box.
- Ship: at most 2 rings round the ship per frame (arcs r>18 centred on the ship; the beat cue draws first and keeps its 2). Before: up to 5.
- Removed: the graze-chain arc and "x4 +30%" on the ship; the beat-pulse bars on the 4 screen edges (kept only red at 1 hull);
  the whole-screen tier tint.
- Words: EMP timer "x~97s" -> "full in 97s"; floater "CHAIN x4" -> "CHAIN 4", "LEAK 1/3" -> "PAST 1 of 3", "LEAK" -> "GOT PAST";
  READY (one bar before the next wave) -> NEXT WAVE. counter.js DASH THROUGH and timing.js OVERLOAD: EMP now drawn upright (wtxt).

## Canvas draw sites
| key | what it is | player should | how often, scenes of 6 | verdict |
|---|---|---|---|---|
| `ai.js:drawEnemy` | smart enemy aim line | dodge | often 3/6 | S |
| `armour.js:drawPlayer` | boss sweep band: thin orange warning, then red | leave the band | rare 1/6 | S |
| `arsenal.js:PW.draw` | active power-up aura | nothing | some stages 2/6 | S, 2-ring cap |
| `arsenal.js:PW.glyph` | power-up glyph | collect | some stages 3/6 | S |
| `art.js:ART.bigGet` | big picture (boss part) | shoot | rare 1/6 | S |
| `art.js:ART.fxDraw` | hit / death sparks | nothing | every frame 6/6 | S |
| `art.js:ART.ghosts` | enemy trail ghosts | nothing | some stages 1/6 | S |
| `art.js:SPR.boss` | boss sprite | shoot | some stages 2/6 | S |
| `art.js:SPR.foe` | warship sprite | shoot | often 3/6 | S |
| `art.js:SPR.shield` | shield bubble on the ship | none (it blocks a hit) | some stages 2/6 | S |
| `art.js:SPR.ship` | ship sprite | fly | often 6/6 | S |
| `athens.js:drawBossX` | Athens boss shape | shoot | some stages 1/6 | S |
| `bg.js:drawBGP` | city backdrop | nothing | often 6/6 | S |
| `bossmoves.js:BMV.draw` | boss attack telegraphs and hazards | move out | often 2/6 | S |
| `bossplay.js:BPL.draw` | boss gates, blackout lanes | go to the lit lane | often 2/6 | S |
| `bossplay.js:BPL.tri` | boss gate triangles | shoot them | often 1/6 | S |
| `bossvis.js:BV.over` | boss phase overlay | nothing | often 3/6 | S |
| `bossvis.js:beam` | boss laser beam | stay out | rare 2/6 | S |
| `bossvis.js:drawBoss` | boss body tint | shoot | some stages 1/6 | S |
| `c.js:banner` | stage number banner | read | some stages 6/6 | W |
| `c.js:render` | score pops "+100" floaters, chain words | nothing | every frame 6/6 | W |
| `c.js:shotDraw` | own shots | nothing | every frame 6/6 | S |
| `c.js:tierGlow` | whole-screen tint per combo tier | nothing (decor) | some stages 4/6 | R |
| `comfort.js:drawEnemy` | enemy glow (capped) | nothing | every frame 6/6 | S |
| `counter.js:draw` | threat tell rings, DASH THROUGH wall | DASH through / EMP | often 4/6 | C counter + W |
| `diet.js:DIET.hudP` | HUD: score + top progress bar | nothing | every frame 6/6 | S |
| `diet.js:banner` | stage banner "Deliver the data" | read | some stages 6/6 | W |
| `diet.js:drawBGP` | backdrop dim veil | nothing | often 6/6 | S |
| `diet.js:drawEnemy` | enemy scale for phone | shoot | rare 4/6 | S |
| `diet.js:pips` | hull squares top right | keep them | every frame 6/6 | C hull |
| `dir.js:drawEnemy` | enemy outline | shoot | often 5/6 | S |
| `dir.js:drawWarn` | spawn / rain marks at the top edge | move away | often 4/6 | C warn |
| `draw.js:bossPaint` | boss hit flash | nothing | some stages 1/6 | S |
| `draw.js:draw` | weapon mount slot 2 mark | nothing | often 6/6 | S |
| `draw.js:drawBossBody` | boss body + name | shoot | often 3/6 | S |
| `draw.js:drawEnemy` | enemy glow | shoot | often 5/6 | S |
| `draw.js:drawPickups` | pickup glow | collect | every frame 6/6 | S |
| `draw.js:drawPlayer` | player ship | fly | often 6/6 | S |
| `draw.js:hpBar` | enemy / boss HP bar | shoot | often 5/6 | S |
| `draw.js:mount` | weapon mount dots on the ship | nothing | often 6/6 | S |
| `draw.js:pkPaint` | pickup sprite | collect | every frame 6/6 | S |
| `explain.js:RWD.draw` | pickup highlight ring (graze reward) | collect it | often 6/6 | S |
| `explain.js:box` | first-appearance caption box | read | often 5/6 | S |
| `flavor.js:drawBrk` | breakable lamp/crate | shoot for Neon | often 4/6 | S |
| `flavor.js:drawCap` | capsule pickup | collect | often 3/6 | S |
| `flavor.js:drawMedal` | medal pickup | collect | some stages 2/6 | S |
| `flavor.js:drawSec` | secret marker | shoot | some stages 3/6 | S |
| `flavor.js:front` | prop front layer | nothing | rare 4/6 | S |
| `fleet.js:draw` | warship hull | shoot | some stages 2/6 | S |
| `fleet.js:over` | warship turret marks | shoot turrets | some stages 2/6 | S |
| `foeart.js:body` | enemy ship sprite | shoot | every frame 6/6 | S |
| `foeart.js:marker` | enemy kind marker | shoot | often 5/6 | S |
| `foeart.js:post` | enemy afterglow | nothing | some stages 1/6 | S |
| `foeart.js:idle` | enemy ship sprite, idle pose | shoot | rare (seed-dependent) | S |
| `fun.js:draw` | set piece picture | as above | some stages 4/6 | S |
| `fun.js:evDraw` | set piece: laser lane, supply ring, gate rings, gust arrows | leave / fly in / fly through | some stages 2/6 | C lane,supply,gaterun |
| `legible.js:band` | darker play band behind the action (city kept at the edges) | nothing | every frame | S |
| `legible.js:enemy` | pale under-glow behind each enemy (readability) | shoot | every frame | S |
| `legible.js:halo` | dark halo under enemy bullets (readability) | dodge | every frame | S |
| `fx.js:bar` | beat pulse bars on 4 screen edges | nothing (decor) | every frame 6/6 | R: kept only red at 1 hull, caption edge |
| `fx.js:ring` | beat cue: 2 rings close on the ship | DASH when they meet | often 6/6 | C beat |
| `fxwave.js:FXW.bullet` | enemy bullet picture | dodge | every frame 6/6 | S |
| `grit.js:draw` | enemy gimmick marks: plate, shield ring, medic cross+link, evasive chevrons | shoot from the side / kill medic first | often 3/6 | S |
| `grit.js:link` | medic heal link line | kill the medic | rare 1/6 | S |
| `leak.js:art` | ground walker | shoot before it passes | often 2/6 | C leak |
| `novelty.js:mark` | late-run elite mark | shoot | some stages 1/6 | S |
| `polish.js:RWD.draw` | graze chain arc + "x4 +30%" on the ship | graze bullets | often 6/6 | R (explain on) |
| `power.js:coin` | power-up coin | collect | some stages 4/6 | S |
| `power.js:draw` | power-up glyph | collect | rare 1/6 | S |
| `power.js:marker` | glowing enemy that drops a power-up | kill it | some stages 3/6 | S |
| `power.js:pickup` | power-up pickup + name | collect | some stages 3/6 | W |
| `powlevels.js:PW.draw` | held power-up level glyph (star) | use it | some stages | S |
| `powerups.js:PW.draw` | timed power-up effect | nothing | some stages 1/6 | S |
| `react.js:RX.over` | pink tell ring on an enemy | move | often 5/6 | C tell |
| `readable.js:bullets` | enemy bullet core | dodge | every frame 6/6 | S |
| `readable.js:dim` | backdrop darkening for contrast | nothing | often 6/6 | S |
| `readable.js:dot` | ship hit dot | dodge with it | every frame 6/6 | S |
| `readable.js:ring` | dangerous bullet ring | dodge | often 6/6 | S |
| `rules.js:draw` | stage mechanic shapes (echo, well) | depends on rule card | often 3/6 | S + rule card |
| `rules.js:ring` | gravity well purple dashed rings | fly round; shots bend | often 2/6 | C (zonehint) |
| `shop.js:ring` | pit-stop shield ring on the ship | none | often 4/6 | S, counts in the 2-ring cap |
| `timing.js:draw` | OVERLOAD: EMP ring + words / red hit-lock ring | press EMP | rare 5/6 | W |
| `uikit.js:UIK.bossShadow` | boss drop shadow | nothing | some stages 2/6 | S |
| `uikit.js:draw` | hint bubble (shape tips, gusts) | read | some stages 6/6 | W |
| `upgrades.js:SH_` | power-up glyph shape | collect | some stages 1/6 | S |
| `variants.js:VAR.mark` | variant pips above enemy (tougher) | shoot more | every frame 5/6 | S |
| `zonehint.js:draw` | gravity-well caption (old drawer) | read | some stages 2/6 | S (explain draws it upright) |
| `zoo.js:art` | zoo enemy picture | shoot | rare 3/6 | S |
| `zoo.js:over` | zoo enemy overlay (+ for split) | shoot | some stages 3/6 | S |

## DOM HUD and buttons (seen in every scene)
| element | what it is | verdict |
|---|---|---|
| #bPause "II" | pause | S |
| #bDash "DASH" + ::after number | dash, charges left | W + C btn |
| #bEmp "EMP" + ::after number + ::before timer | EMP, charges, "full in 97s" | W + C btn |
| #bPwr star + "TRADE"/"12s" label | trade the held power-up (stages 8, 12, endless) | W |
| #retReady "NEXT WAVE" | one bar before the next wave | W |
| #retPop big letter S/A/B/C | grade for the last 16 bars | C grade |

## Left for later (not done in this task)
- Two HUD rows (score + progress bar, hull squares) kept; the hull squares are captioned.
- Gravity wells are still 2 large rings each; they are captioned, not shrunk (rules.js owner).
- The 2-ring cap keeps the first two drawn (beat cue), so the pit-stop shield ring and power-up aura can be hidden while the beat cue shows.
