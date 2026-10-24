# W217: `RET.purefoot`, the street drawn with the owner's art only

Flag `RET.purefoot`, default ON (it is better than the old look on every critic row below); `?purefoot=0` = the old look exactly.
Code: `parts/street/purefoot.js` (new, the outermost `F.look.draw`), one export line at the end of `streetlook.js` (`SL._p`), three
`!RET.purefoot` guards in `streetlook.js` `slHud`, the flag + DPR line in `foot.js`, one line in `build.py`. Also a phone-button fix in
`streetguard.js` (below).

Shots: stage `zeil`, seed 7, stepped with `FOOT.sim(1/60)` by a fighting bot (stops when foes are on screen, steps back towards foes
behind, fires), then ONE draw (`qa/purefoot-shot.js`). On and off are the same step of the same run (phone step 5816, PC step 3122:
same foes, same positions, same shot in the air).
- `phone-purefoot-off.webp` / `phone-purefoot-on.webp` (390x763, rendered at 3x, saved at 1x)
- `pc-purefoot-off.webp` / `pc-purefoot-on.webp` (1440x860)

## Inventory: what the street renderer adds on top of the owner's art, and what purefoot does with it

Line numbers are on this branch (`parts/street/...` unless named).

| What | Where | With purefoot |
|---|---|---|
| Lamp light added over actors under a lamp ('lighter' redraw) | street3.js:116 | off (street3 wrapper not run) |
| Lamp pools + neon glow discs (radial gradients, 'lighter') | street3.js:133-138 | off |
| Wet-road mirror of the whole canvas + dark gradient under the road line | street3.js:142-143 | off (the painted floor already has its reflections) |
| Full-screen colour grade: multiply violet .22 + screen pink .05 | street3.js:144-145 | off |
| Scene grade / rim light / reflection / contact shadow / rain per actor | streetblend.js:43-70 (flag `blend`, already off) | off |
| Floor shadow ellipse under every actor (rgba(0,0,0,.38)) | streetlook.js:56, drawn :153 | off; the soft radial sprite `FA.shadow` (footart.js:32, called from art/art.js:221) stays: it reads as a contact shadow |
| Occlusion fade: a prop in front of Kai drops to 40% | streetlook.js:59 (`occl`) | off: props solid, drawn in depth order |
| Wind-up / shot telegraph: pulsing red disc at the chest | streetlook.js:139 | off: the foe shows its `shoot` sheet |
| Melee wind-up: red stroked box round the foe | streetlook.js:140 | off: the foe shows its `melee` sheet |
| Front-shield bar (blue rect) | streetlook.js:143 | off |
| Shield ring (code arc), dash afterimage box | streetlook.js:149-150 | off |
| Muzzle fallback white disc | streetlook.js:152 | off (owner muzzle picture `fx-ft-*-muzzle` only) |
| Enemy shots: dark ring + flat disc (READ.footEb) or disc + white core | streetlook.js:157, render/readable.js:63 | owner `fx-bullet-enemy` orb as a keyed copy (alpha from brightness, faint outer glow cut, cropped to the core), normal blend, 14 units wide (about the pistol muzzle flash; round 2, orchestrator: the first version drew it ~150 px) |
| Player shots without a picture: rects / discs | streetlook.js:155 | owner `fx-ft-*` bullet pictures only |
| Effects: slash arcs, rings (e.g. CALLING HELP ring, streethard.js:50), particle squares | streetlook.js:160-163 | off; owner fx pictures (`f.pic`) and the arc picture stay |
| Floating text in the field ("+120", "+180 BEAT", "CALLING HELP") | streetlook.js:165-166, streethard.js:46 | off |
| Pickup name under the picture / name-only fallback / disc + icon | streetlook.js:132-134 | picture only (not drawn until it has loaded) |
| Checkpoint flag rects (two copies) | streetlook.js:122, footstage.js:177 | off |
| Platform bars (flat road only) | streetlook.js:121 | off |
| Sign pole + flat prop box with white stroke | streetlook.js:124-126 | off; street2 prop pictures; a prop with no picture keeps a plain box (it blocks shots) |
| Placeholder backdrop tiles with labels | streetlook.js:66-73 | not reached while the painted layers are loaded (same as before) |
| Stage hook drawings: danger lanes (dashed), pound marks (ellipse), flamer tongue (gradient), fire patch (rect), heal beam (line) | footstage.js:179-183 | lanes / marks / beam off (the attack pose is the tell); flamer tongue and fire patch as owner `fx-ft-flame` pictures |
| Guard arc, guard meter + "GUARD" label, "OPEN" over staggered foes, full-screen white parry flash | streetguard.js:71-76 | off in the field; the guard meter (GUARD / GUARD BROKEN) is an edge-HUD row under the hearts panel while guarding or refilling |
| Combo panel "N HITS / in a row, keep hitting" | streetcombo.js:24-32 | off |
| OVERDRIVE panel + caption | streetfeel.js:53-60 | edge-HUD row under the hearts panel (same plate style): meter, then "OVERDRIVE READY: BOMB" blinking when full |
| Hint line in the field ("GUARD: hold to block...") | streetlook.js:190 | off |
| BEHIND caption ("foe arriving from the left") | streetlook.js:192 | only the arrow at the left edge |
| Section progress bar under the HUD | streetlook.js:198 (stage hook hud) | off |
| HUD panel (hearts, weapon, bombs, power-ups, fever), score + time, boss bar | streetlook.js:174-197 | kept: edge HUD |
| Backing store capped by a 2.2 MP budget (then the browser scales the canvas up) | foot.js:427 | full device pixel ratio (max 3), no budget |
| Image smoothing quality | (default low unless footq sets it) | `high` every frame |
| Actor scale | one world scale K for all (streetlook.js slFrame) | unchanged: Kai and foes already share one texel scale |
| Walk lean, recoil, dust puffs, borrowed-hit white flash | streetfeel.js:87, art/art.js:223 | kept: motion of the owner sheets / owner dust picture |

## Strict critic pass (game-look SKILL.md), vs the benchmark beat-'em-up

Benchmark frame: https://store.steampowered.com/app/1361510 (store screenshots, a busy street fight with 3-4 foes).
Scores 0-10 per row, from the shots in this folder.

| Test | off | on | What still fails with purefoot on, and the fix |
|---|---|---|---|
| 1 Owner-art (code marks in the field) | 2 | 8 | Only edge HUD left (hearts panel + the overdrive / guard plate under it). The HUD panel is code text on the owner's plate; numbers are fine, the PISTOL / bomb lines could be owner icons |
| 2 Grayscale (actors vs street by value) | 4 | 6 | The olive-green foes and the dark hooded Kai sit at the same value as the dark street; the benchmark outlines every actor. Art fix (not code): a 2-3 px dark outline + lighter top-light on the actor sheets |
| 3 Silhouette | 6 | 7 | Rusher / gunner / Kai read apart by shape (knife, pistol arm, hood). Two rushers side by side merge |
| 4 Find-the-player (phone) | 4 | 6 | Kai is the only hooded figure, but is no brighter than the foes. A clean rim/engine-like accent in the Kai sheet would do it (art) |
| 5 Bullets | 4 | 7 | Gunner shot = a small lime owner orb (flash-sized), a colour nothing else uses. Player pistol shots are small; muzzle flash carries them. Its hit radius (26) is now larger than the picture |
| 6 Clutter (non-art marks) | 1 (8 marks: hint, progress bar, 2 OVERDRIVE lines, HITS panel, CALLING HELP, +180 BEAT, pink squares) | 9 (0) | - |
| 7 Benchmark side by side | 2 | 6 | Still amateur next to the benchmark: actors are thin and small against a very detailed painting (benchmark actors are chunkier with stronger outlines), and the foreground rubble strip takes ~20% of the phone field |

Weakest three with purefoot on: grayscale (6), find-the-player (6), benchmark (6). All three are art fixes (outlines and top light on
the actor sheets), not code; per WORKER-RULES 17(f) no tint or glow was added to fake them. Rule 17(c) cap: owner street baseline < 10,
so no row may be reported above 25/100 on the owner scale; the 0-10 values here are the critic test scores, not that row score.
Not done by rule (rows 2, 4, 7 < 7): the owner decides from the two pairs.

## Gameplay

Identical. The sim never draws. `qa/streetsim.js`, 20 runs x 4 bots, on vs `Q=&purefoot=0`: the same table to the decimal
(idle 0/20 cleared, median death 19.6 s; nearest 8/20, 124 / 248.7 s; gfirst 15/20, 124 / 264.7 s; dodge 13/20, 124.1 / 241.1 s), x300+.

## Also fixed

`streetguard.js:55`: the GUARD phone button only re-placed itself when KNIFE moved, so after a relayout that put BOMB back in its old
slot (a restart) BOMB and GUARD sat on top of each other (two labels on one button). The key now covers every button.

## Tests

`streetlook-test.js` now also counts a pickup drawn as a picture (purefoot draws no disc). Its other results are the same as on the base
branch (props 1.7 characters, feet off the road line, layer speeds and the `test ran` error in the behave section fail there too); the
HUD-text row passes with purefoot (the 9 px GUARD label under Kai is gone). `qa/occl-test.js` checks the occlusion fade, which purefoot
does not draw: run it with `?purefoot=0`.
