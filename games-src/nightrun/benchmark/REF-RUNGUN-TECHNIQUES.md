# REF-RUNGUN-TECHNIQUES: what "the run-and-gun reference" does, as testable rules (W220, 24 Oct 2026)

Reference = the hand-animated 1930s-cartoon run-and-gun boss rush (2017), on foot and in flight. Sources are public only
(interviews, making-of articles, player analyses). No build of it was opened. Where no public number exists the line says
**NO PUBLIC NUMBER**; the gate then uses a craft number from general game-feel sources, marked **(craft)**, which is our choice, not the reference's.
Owner rule (WORKER-RULES 17f0): our art is good; remove our overlays first, then judge. Code cannot paint art.

Sources (hard rule: URLs that contain the reference's name are not written here; find each by outlet + title words, all public)
- S1 Game Developer (gamedeveloper.com), art feature "how it nailed the look and feel of classic 1930s cartoons": film noise, line work, 60,000+ frames
- S2 Game Developer, "Road to the IGF" interview with the studio: hand ink, boss-first design, hitbox revisions
- S3 https://www.gameinformer.com/feature/2022/11/30/building-a-boss (3 phases, cut distracting ideas, 300 h painted background)
- S4 Nintendo Everything, "lack of health bars explained" (trade-press report of the co-director's interview): no health bars, why
- S5 Giant Bomb review of the reference: pink = parry, colour-blind caveat
- S6 EventHubs, 17 Dec 2021, "fighting game hitboxes made me better at" the reference: hitbox smaller than the drawing
- S7 GamesRadar "the making of" and Windows Central "how the team brings its animations to life": 24 fps vs 60 fps, "animating on the ones"
- S8 https://sonichurricane.com/?p=1043 (impact freeze = hit stop, frames by attack weight)
- S9 an indie developer's 2013 "art of screenshake" talk (summary https://rpgplayground.com/research-making-a-juicy-game/): shot = camera kick 6 px, shake +4 that decays fast
- Open-source code to read (permissive licence, check LICENSE before copying anything): https://github.com/WaffleAWT/Godot-4.1-Platform-Shooter (MIT, platform shooter demo, basic HUD and enemies). No good MIT run-and-gun with hit stop was found; do not copy code, only compare ideas.

## 1. Animation frame rate, drawn on the ones
- How: every frame hand-drawn and inked, animated "on the ones" (a new drawing every frame at 24 fps), movement runs at 60 fps on top (S7). 60,000+ frames drawn (S1). Line thickness and taper change from frame to frame like period film, and the picture is slightly soft (S1).
- Number: 24 fps animation, 60 fps motion. Frame counts per cycle: NO PUBLIC NUMBER.
- Ours: sprite sheets play from `parts/render/draw.js` / `parts/street/foot.js`; the clock is a fixed animation rate, not the game loop rate.
- Gate: sprite frame index advances at 24 fps (+-1) while x moves every game tick; a 10 s recording shows no animation frame held longer than 1/12 s outside deliberate holds.

## 2. Squash and stretch, anticipation
- How: rubber-hose limbs, "pushing the crazy further worked best" (S2). Bosses start strange and grow bigger as the fight escalates (S2).
- Number: NO PUBLIC NUMBER for squash ratios. (craft) 10-20% on jumps/landings, 2-4 frames.
- Ours: `parts/street/streetfeel.js` (landing, hit), enemy sprite scale in `parts/enemies/scale.js`.
- Gate: on landing and on every enemy windup the sprite's scale changes by >= 8% for 2-4 frames and returns to 1.0; no sprite scales 3x vs another (game-look: texel size within 1.5x).

## 3. Layered parallax and foreground passes
- How: looped animation over painted watercolour backgrounds (S7). Painted backgrounds are the one place errors are noticed: "only noticeable if you do a bad job and it becomes jarring" (S3). Layer count and ratios: NO PUBLIC NUMBER (do not infer from copies).
- Ours: `parts/street/streetlook.js` (3-layer parallax), `parts/render/bg.js`, `docs FLOW-FLIGHT-LAYERS.md`.
- Gate: >= 3 background layers + 1 foreground pass; scroll ratios strictly increasing toward camera (e.g. 0.1/0.3/0.6/1.0/1.3, game-look); foreground alpha <= 0.35 and never covers the player or a telegraph.

## 4. Film grain, dust, scratches: one pass over ALL layers
- How: the dust, hairs and noise are scanned from real film, not generated (S1). The whole frame is treated, backgrounds and characters together; this is why sprites do not look pasted.
- Number: NO PUBLIC NUMBER for opacity/frequency. (craft) grain alpha <= 0.06, re-seeded at 12-24 Hz; scratches <= 1 per second.
- Ours: ONE full-canvas pass at the end of the frame (`parts/render/bg.js` scanlines/vignette slot; `comfort.js` scan setting). Never per-sprite grain.
- Gate: grain is drawn exactly once per frame after every layer incl. HUD-free play field; turning the flag off changes the whole picture, not single sprites; `?pure=1` shows art with no pass.

## 5. Readable against busy backgrounds
- How: characters are inked with a dark outline over flat colour, backgrounds are softer, lower-contrast and painted (S1, S2). Cut ideas that were "too visually distracting" (S3). Palette is period-limited and subdued (S1 secondary).
- Ours: `parts/render/readable.js`, `legible.js`, `streetblend.js`.
- Gate: grayscale test passes (player, each enemy kind and enemy bullets separate from backdrop by value alone); backdrop max saturation < play-layer saturation; outline weight identical across actors (game-look strict critic 2-3).

## 6. Boss phases and telegraphs as animation (no UI markers)
- How: bosses are designed gameplay-first, art fits the attack, and animators revised characters many times to match hitboxes and attack timing (S2). Fights escalate in phases (a sample boss has 3 phases, the last neither longest nor hardest, whole fight under 2 minutes, S3). Attack cues live in the boss body: windup pose, then the attack.
- Number: windup frame counts NO PUBLIC NUMBER.
- Ours: `parts/bosses/bossmoves.js` (every hit telegraphed >= 0.5 s), `bossvis.js`, `streetboss.js`.
- Gate: each boss verb has a distinct windup pose >= 0.5 s on screen BEFORE its hitbox is active (sim logs windup start < hit start by >= 30 ticks); no ring/arrow/"!" marker drawn by code during a windup.

## 7. Hit feedback: flash, hit-stop, sound
- How: no public reference numbers for flash or shake. General craft: hit stop is 8-16 frames in fighting games by attack weight (S8); a shot kicks the camera 6 px with +4 shake that decays quickly (S9).
- Ours: `streetfeel.js` (hit-stop 33/50/100 ms light/mid/kill), `streetguard.js` (parry 70 ms), `fx/fx.js`.
- Gate: hit-stop 33-100 ms (2-6 frames at 60 fps), flash <= 0.1 s white, shake <= 6 px decaying under 0.25 s, one distinct sound per class (hit, kill, parry); projectile hits never freeze the shooter (S8).

## 8. Parry and dodge design
- How: pink objects can be parried by a jump-press (S5); the parry hitbox is generous, the player's hurtbox is smaller than the drawing (S6). Windows in frames: NO PUBLIC NUMBER. Known weakness: colour alone (S5), no colour-blind mode.
- Ours: `parts/street/streetguard.js` (PARRY = 0.15 s, hold 0.4 s), `streetdodge.js` (8 i-frames = 0.13 s, `?dodgei=0` old).
- Gate: parry-able things differ by SHAPE or motion as well as colour; player hurtbox <= 70% of sprite width; bot sim (`qa/streetsim.js` BOTS=dodge,parry) clears a parry >= 90% when pressed within the window and 0% outside it.

## 9. Bullets that read
- How: projectiles are drawn like everything else, on-model, one reserved accent colour for the parry-able kind (S5). Enemy shots drawn over player shots (our rule 17d).
- Ours: bullet sprites `parts/weapons`, `parts/enemies/visible.js`.
- Gate: enemy-shot colour used by no other object; silhouette of each enemy shot unique per enemy kind; bullet test of game-look passes on the phone shot.

## 10. HUD minimalism
- How: no boss health bar: bars push players to chase DPS and look at the bar instead of the cues (S4). HUD stays at screen edges: a few hearts/cards. Text uses period-style lettering (S1).
- Ours: `parts/hud/`.
- Gate: <= 3 non-art marks inside the play field at once (clutter test); boss has no bar over the sprite; hit points read through the boss's own damage states.

## 11. Common bugs to avoid (from the above and our history)
- Per-sprite grain/tint instead of one pass (reads pasted). Gate: section 4.
- Hit-stop applied inside the headless sim, which changes bot sampling (`streetfeel.js` already skips it when `S.sim`). Gate: sim results identical with and without hit-stop.
- Telegraph shorter than reaction time (< 0.5 s) or hidden behind foreground pass.
- Parry window tied to frame rate, not time: 0.15 s must equal 0.15 s at 30 and 144 Hz displays.
- Squash applied to the hurtbox (hit area changes with art). Gate: hurtbox constant while sprite squashes.
- Sprite state missing: a still image where a sheet exists (idle/attack/hit/defeat).
- Colour-only information (pink parry): add shape/motion.

## Open items (not found publicly, ask the owner or measure on our own game, never from a copy)
Layer counts and ratios, grain strength, windup frame counts, parry frame window, hit-stop frames, i-frames, screen-shake px.

## The arcade run-and-gun (1996, hand-drawn soldiers, tanks, explosions) (W220 add-on, 24 Oct 2026)
Same source rules: public interviews and articles only; no emulator page, ROM, recompilation or decompiled build was opened.
Sources (named by outlet + title words, the game's name is not written here):
- A1 Time Extension, "The Making Of" feature with the director and team (soldiers shoot only straight up, shots re-aimed at nimble humans, 18-month build, two bad location tests, ~6 months redesign)
- A2 Automaton, interview with the lead animator (long detailed animations made programmers optimise; art team wanted to stand out among fighting games). Page body was cut off in my fetch: only the headline was read.
- A3 a 2026 Foro3D retrospective, "when excess of 2D art surpasses 3D": every sprite has an uncommon number of frames, every explosion or destruction effect is a unique hand-drawn sequence
- A4 roundtable of the team's pixel artists reported by trade press: human sprites were so small that one misplaced pixel broke a face, so they placed pixels one at a time
- Open-source code to compare ideas (no ROM-derived code): Abuse (public-domain source, side-scrolling run-and-gun), OpenBOR (community 2D engine, check its LICENSE first)
- Not used on purpose: a GitHub "recompilation" project that needs a ROM dump.
NO PUBLIC NUMBER found for: sprite sizes, frames per animation, explosion frame counts, frame rate. (A comment on A1 claims 30 fps; unverified, ignore.)

### R1. Big, readable characters, hand-placed pixels
- How: at small sprite size every pixel decides the face (A4); heavy per-sprite animation for soldier and vehicle alike (A3); long cycles were worth the performance cost (A2).
- Ours: actor scale `parts/enemies/scale.js`, street sizes `streetlook.js`.
- Gate: at phone size (390x763) the player and each enemy are >= 1/12 of the short side (rule 17d) and a face/weapon silhouette is still telling at 1x.

### R2. Explosions and debris as authored art
- How: each explosion or destruction is its own drawn sequence, not one stock boom (A3).
- Ours: owner fx sheets in `parts/fx/fx.js`; game-look says normal blend + brief additive core.
- Gate: >= 3 distinct explosion sheets (small, vehicle, boss) in use, no code-drawn circle/arc explosion, debris is sprite pieces; each plays to its last frame.

### R3. Enemy wind-ups
- How: no public frame data. The lead animator's long cycles imply visible anticipation poses (inference, not a source claim). A1 says enemy shots were re-aimed to suit nimble humans, i.e. aimed shots at a moving target.
- Ours: `bossmoves.js` telegraph >= 0.5 s; foes in `streetfoe.js`, `footen.js`.
- Gate: every aimed enemy shot is preceded by a pose >= 0.25 s (grunt) / 0.5 s (boss) and fired at the position the player had at wind-up end, so a move after the pose dodges it.

### R4. Player and bullets readable on busy scenes
- How: no public statement. Design constraint from A1: soldiers shoot only straight up, not diagonally, so lanes stay simple.
- Ours: `render/readable.js`, `legible.js`; shot rules rule 17d.
- Gate: grayscale + silhouette tests of game-look pass on a busy shot with >= 6 enemies and 2 explosions; enemy bullets use the reserved colour.

### R5. Hit feedback
- How: no public numbers. Respawn invincibility is a known exploit and must be tuned (A1).
- Ours: `streetfeel.js` hit-stop 33/50/100 ms; `streetdodge.js` i-frames.
- Gate: respawn i-frames <= 2.0 s (craft) and drawn as a blink of the sprite alpha, not a code ring; every kill plays an explosion sheet.

### R6. Cost of long animations (bug class)
- How: heavy animation slowed the original game and forced optimisation (A2).
- Gate: 6 enemies + boss + 3 explosions on screen keeps frame time p95 < 20 ms on the phone profile; sprites preloaded (`footq.js`).
