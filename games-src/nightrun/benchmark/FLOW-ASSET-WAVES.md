# Asset waves for Google Flow (24 Oct 2026)

Every prompt is ready to paste: replace `[style block]` with the style block below. Make Wave 1 first. Drop finished files into the folders named in each row (or just send them to me).

### Format rules for every asset (from HANDOFF-SPRITES-2026-10-22.md and ASSET-WIRING.md section 4)

- **Animations**: one horizontal strip per state, `games-src/anims/mainhattan-nightrun/sheets/<actor>/<state>-strip.webp` plus `<state>-strip.json`.
  The json fields are `frames`, `fps`, `w`, `h` (cell), `anchor` = [w/2, h] (feet on the cell bottom), `body` (px of the standing height), `metres` {h, w} and `px_per_m`.
- **Cell height is the same for every state of one actor.** Feet touch the bottom edge in every frame, except jumps and thrown states, which are drawn airborne inside the cell.
  The body height is the same in every frame (4% bob allowed). Never stretch crouch or dash frames.
- Kai's numbers (existing): cell height **326 px**, body **256 px**, **1.8 m**, 142.22 px/m. Cell widths vary per state (106-241 px today).
- Foes: body **256 px**, cell height about 1.15 x body (weapons and hair fit). Metres are given per foe.
- Background **transparent**. If Flow cannot do transparency, use flat plain white and cut it out with `games-src/scripts/cutout.py`.
- Camera: **side view, facing right**, the same slight top-down street angle as the existing sheets (camera at chest height, a few degrees from above).
- Effects (FX) are centred in their cell and have no feet. Pickups and props sit on the cell bottom.
- After a delivery: `ingest-assets.py --check`, then `qa/spritecut.js`, then check Kai is still drawn (decode budget, `FQ.miss.kai`).
- New ids enter the registry as `nr.foot.<thing>.<state>` (`asset-registry.py`).

**Style block (paste first in every prompt; it describes our sheets, not the benchmark):**

> Painted cyberpunk Frankfurt 2099 street, hand-painted game art, rain-wet, teal and magenta neon rim light, crisp dark outline, chunky readable silhouette that reads at small size, slightly top-down side view, facing right, feet on the bottom edge of every cell, same body height in every frame, transparent background, no text, no letters, no logos.

**Kai (attach `kai/idle-strip.webp` as the reference in Flow):** a lean young courier in a dark hooded jacket with teal neon piping, a data satchel on the back, boots, fingerless gloves, a compact pistol and a short street knife.

Each prompt below is ready to paste. It already starts with the style block.

---

### WAVE 1: up-close combat (biggest fun gain: fun gaps 1, 2, 3, 4, 6, 9). 24 images

Why first: every Wave 1 asset turns an existing button into a decision (combo, grab, throw, special). They are all for Kai, the 3 street foes we already have, and a few props.

#### Kai's new moves (6 strips, cell height 326, body 256, 1.8 m, anchor feet bottom-centre)

| id / file | what and why (gap) | frames | fps | cell w x h | loop |
|---|---|---|---|---|---|
| `kai/finisher-strip.webp` | Hit 4 of the knife chain: a spinning back-kick that launches the foe (gap 1) | 5 | 14 | 260 x 326 | once |
| `kai/grab-strip.webp` | Holding a foe by the collar, ready to throw (gap 2) | 3 | 8 | 200 x 326 | loop |
| `kai/throw-strip.webp` | Hip throw that hurls the held foe forward (gap 2) | 5 | 14 | 280 x 326 | once |
| `kai/dashattack-strip.webp` | Running shoulder-bash at the end of a dash (gap 3) | 4 | 16 | 260 x 326 | once |
| `kai/special-strip.webp` | OVERDRIVE: drives the knife into the road and a teal shock ring bursts out (gap 4) | 8 | 16 | 300 x 326 | once |
| `kai/taunt-strip.webp` | A cocky "come on" wave that fills OVERDRIVE (gap 4, personality) | 4 | 8 | 160 x 326 | once |

Prompts:
- **kai/finisher**: `[style block]` A sprite strip of 5 frames in one horizontal row, equal cells 260x326 px. Same character as the reference: Kai, a lean young courier in a dark hooded jacket with teal neon piping, a data satchel, boots, fingerless gloves, a short street knife. The frames show a spinning back-kick finisher: 1 pivot on the front foot, 2 body turning away with the hood swinging, 3 back leg extended at waist height with a teal motion streak, 4 follow-through, 5 landing in a ready stance. Feet on the bottom edge except during the kick, same body height in every frame.
- **kai/grab**: `[style block]` A sprite strip of 3 frames in one horizontal row, equal cells 200x326 px. Same character as the reference (Kai). Kai holds an invisible opponent by the collar with both hands at chest height, arms forward, knees bent, leaning back to take the weight. The 3 frames are a small struggle loop (slight shift of weight). Leave empty space in front of the hands where the foe will be drawn.
- **kai/throw**: `[style block]` A sprite strip of 5 frames in one horizontal row, equal cells 280x326 px. Same character as the reference (Kai). A hip throw of an invisible opponent: 1 both hands gripping forward, 2 Kai turns his hip in, 3 hands swing up over the shoulder, 4 hands fully forward releasing, a teal streak along the arc, 5 recovery stance. Feet stay on the bottom edge.
- **kai/dashattack**: `[style block]` A sprite strip of 4 frames in one horizontal row, equal cells 260x326 px. Same character as the reference (Kai). Running shoulder-bash: 1 low sprint lean, 2 shoulder forward with the arm tucked and the hood flapping back, a short teal speed trail behind, 3 impact pose fully extended, 4 skid stop with one boot sliding. Same body height (the lean is a pose, not a smaller figure).
- **kai/special**: `[style block]` A sprite strip of 8 frames in one horizontal row, equal cells 300x326 px. Same character as the reference (Kai). OVERDRIVE move: 1-2 Kai crouches and the jacket piping glows brighter teal, 3 jumps a little, 4-5 drives the knife down into the road and lands kneeling, 6-8 a flat teal-and-white shock ring spreads along the ground at his feet and fades. Feet on the bottom edge at the start and end.
- **kai/taunt**: `[style block]` A sprite strip of 4 frames in one horizontal row, equal cells 160x326 px. Same character as the reference (Kai). A cocky taunt: Kai flips the knife in one hand and waves the other hand "come on" towards the right, with a confident grin. Relaxed stance, feet on the bottom edge.

#### Foe reaction states for the 3 live street foes (9 strips; the throws, juggles and finishers need them)

The foe cell heights and metres are those of the existing sheets: grunt (rusher) 262 / 1.85 m, gunman 259 / 1.8 m, bruiser (heavy) 275 / 2.0 m; body 256 for all. Attach each foe's `idle-strip.webp` as the reference.

| id / file | frames | fps | cell w x h | loop | why |
|---|---|---|---|---|---|
| `grunt/knockdown-strip.webp`, `gunman/knockdown-strip.webp`, `bruiser/knockdown-strip.webp` | 5 | 12 | 300 x actor cell | once (holds last frame) | finisher, throw and juggle landing (gaps 1, 2, 9) |
| `grunt/thrown-strip.webp`, `gunman/thrown-strip.webp`, `bruiser/thrown-strip.webp` | 4 | 14 | 260 x actor cell | loop | the foe as a flying projectile (gap 2) |
| `grunt/getup-strip.webp`, `gunman/getup-strip.webp`, `bruiser/getup-strip.webp` | 3 | 10 | 240 x actor cell | once | a readable "back in the fight" beat |

Prompts (paste once per foe, replacing `<FOE>` with the existing foe's look from its idle sheet: "a street thug in a cheap neon hoodie", "a gunman in a long dark coat with a visor", or "a hulking bruiser with an armoured shoulder plate"):
- **<foe>/knockdown**: `[style block]` A sprite strip of 5 frames in one horizontal row, equal cells 300 x <actor cell> px. Same character as the reference: <FOE>. Knocked down by a heavy hit from the left: 1 head snapped back, 2 airborne falling backwards, 3 hits the road with a small splash, 4 bounces slightly, 5 lies flat on the back. The body stays the same size; the lying pose uses the cell width, with the lowest point on the bottom edge.
- **<foe>/thrown**: `[style block]` A sprite strip of 4 frames in one horizontal row, equal cells 260 x <actor cell> px. Same character as the reference: <FOE>. Thrown through the air and tumbling: a horizontal body spinning head over heels, 4 frames of a full rotation, arms and legs flailing, a faint motion smear. Centred in the cell, the same body size as the reference.
- **<foe>/getup**: `[style block]` A sprite strip of 3 frames in one horizontal row, equal cells 240 x <actor cell> px. Same character as the reference: <FOE>. Getting up from lying on the back: 1 pushing up on one elbow, 2 one knee down, 3 standing, shaking the head. Feet on the bottom edge in frames 2-3.

#### Props you use (3 strips; gap 6)

| id / file | states | frames | fps | cell | metres | loop |
|---|---|---|---|---|---|---|
| `prop-bin/idle-strip.webp` + `prop-bin/break-strip.webp` | idle, break | 1 + 5 | -, 14 | 120 x 160 | 1.0 m tall | -, once |
| `prop-cone/idle-strip.webp` (a throwable road cone; it spins in flight by rotation in code) | idle | 1 | - | 80 x 110 | 0.7 m | - |
| `prop-drum/idle-strip.webp` + `prop-drum/break-strip.webp` (a throwable, rollable oil drum; replaces the code barrel) | idle, break | 1 + 6 | -, 16 | 120 x 160 | 0.9 m | -, once |

- **prop-bin**: `[style block]` Two sprite strips. First: 1 frame, 120x160 px, a dented cyberpunk street trash bin with a hinged lid, a faint magenta neon sticker, standing on the bottom edge. Second: a 5-frame strip, equal cells 120x160 px, the same bin bursting: lid flies off, bags and cans spill, the bin crumples, debris settles, and the last frame is a flattened bin on the bottom edge.
- **prop-cone**: `[style block]` 1 frame, 80x110 px: a battered orange-and-teal reflective traffic cone with a thin glowing stripe, standing on the bottom edge.
- **prop-drum**: `[style block]` Two strips, cells 120x160 px. Idle, 1 frame: a rusty steel oil drum with a hazard stripe and a teal glowing chemical label shape (no letters), standing upright on the bottom edge. Break, 6 frames: the drum dents, splits and bursts in a short orange-and-teal blast with flying metal shards, fading to smoke.

#### Pickups, impact FX and HUD bits (4)

| id / file | what | frames | fps | cell | loop | anchor |
|---|---|---|---|---|---|---|
| `pk-noodles/idle-strip.webp` | Big heal from breakables (the street's comfort food; gap 6, rest beats) | 4 | 6 | 96 x 96 | loop (steam bob) | bottom |
| `fx-impact-heavy/burst-strip.webp` | A comic impact star for finishers, throws and kills (gap 9) | 5 | 24 | 192 x 192 | once | centre |
| `hud-combo/digits.webp` | Combo counter digits 0-9 plus the word plate "HITS" (gap 9) | 11 cells | - | 64 x 80 each | - | - |
| `hud-overdrive/frame.webp` + `hud-overdrive/fill.webp` | OVERDRIVE meter frame and fill (gap 4) | 1 + 1 | - | 320 x 48 | - | - |

- **pk-noodles**: `[style block]` A 4-frame strip, equal cells 96x96 px: a steaming takeaway noodle box with chopsticks and a small teal neon glow around it, on the bottom edge; the steam curls rise and loop across the 4 frames.
- **fx-impact-heavy**: `[style block, but centred in the cell instead of feet on the bottom]` A 5-frame strip, equal cells 192x192 px: a hand-painted impact burst, a jagged white-hot star with teal and magenta rim spikes and small debris flecks. 1 small flash, 2 full star, 3 star with speed lines, 4 breaking into flecks, 5 faint smoke ring. No text.
- **hud-combo**: Painted cyberpunk game UI, crisp dark outline, teal and magenta neon. 11 equal cells of 64x80 px in one row: the digits 0 1 2 3 4 5 6 7 8 9 as chunky italic neon-tube numerals, then a small plate with the word HITS in the same style. Transparent background. (This one asset is allowed to contain characters.)
- **hud-overdrive**: Painted cyberpunk game UI, crisp dark outline. Two images of 320x48 px: 1) an empty meter frame, a dark steel capsule with teal neon edges and three tick marks; 2) the fill bar only, a bright teal-to-white energy bar with a soft glow that fits inside the frame. Transparent background, no text.

**Wave 1 size: 24 images, about 90 frames.** That is 6 Kai strips, 9 foe-reaction strips, 5 prop images (idle and break counted separately), 1 pickup strip, 1 FX strip and 2 HUD images.

---

### WAVE 2: the crowd (fun gap 5). 6 new foe types x 6-7 states = 40 strips

Before painting: section 4, task 2 wires the 8 foot foes we already have (knife, ninja, flamer, hound, jetpack, medic, sniper, shield).
Wave 2 adds only roles nobody else has. Each foe gets these states: idle (4 f, 4 fps, loop), walk (6 f, 10 fps, loop), windup (3 f, 8 fps, once: the telegraph, >= 0.4 s readable),
attack (4 f, 14 fps, once), hurt (2 f, 10 fps, once), knockdown (5 f, 12 fps, once), die (4 f, 8 fps, once). Body 256 px, feet on the cell bottom.

| id | role (the answer it asks for) | metres | cell h | extra state |
|---|---|---|---|---|
| `foe-grappler` | Grabs Kai if he stands still in its line. Answer: keep moving in depth, or knock it down first. | 1.95 m | 290 | `hold` (3 f, loop): holding the air at chest height |
| `foe-lobber` | Throws arcing neon bottles at Kai's depth line from the back of the band. Answer: change depth. | 1.75 m | 270 | `throw` replaces attack (a lob arc) |
| `foe-skater` | Hover-skater who charges across depth lines (up/down the band). Answer: jump or step sideways. | 1.8 m | 280 | `ride` (4 f, 12 fps, loop) replaces walk |
| `foe-bombbot` | Waddling bomb robot that arms itself when hit. Answer: throw it into the crowd before it blows. | 0.9 m | 140 (body 120) | `armed` (4 f, 16 fps, loop, red blink) |
| `foe-taser` | Rushes with a stun prod; the stun breaks combos. Answer: dash through, or hit it during its 0.6 s wind-up. | 1.8 m | 280 | - |
| `foe-pest` | Swarm micro-drone fodder, 3 at a time, which clings to Kai. Answer: the special or a sweep; it rewards combos. | 0.5 m | 96 (body 72), hovers | `cling` (2 f, loop) |

Prompts (replace `[state frames]` with each state line; one prompt per state, attach the foe's idle strip once it exists):
- **foe-grappler** reference + idle: `[style block]` A sprite strip of 4 frames in one horizontal row, equal cells 240x290 px. A new original street foe: a broad-shouldered dock brawler in a sleeveless padded vest with magenta neon cable tattoos glowing on the arms, a shaved head, heavy work gloves and wide stance. Idle breathing loop, arms half-raised, ready to grab. 1.95 m tall, chunky silhouette, clearly different from the courier hero.
- **foe-grappler** windup / attack / hold / hurt / knockdown / die: `[style block]` Same character as the reference (the dock brawler). A sprite strip of `<n>` frames in one horizontal row, equal cells `<w>`x290 px: `<windup: crouches, arms spread wide, a red glint in the eyes (readable warning) | attack: lunging bear-hug forward | hold: holding an invisible person at chest height | hurt: head snapped back | knockdown: falls backward onto the road and lies flat | die: collapses and fades to grey smoke>`.
- **foe-lobber** reference + idle: `[style block]` A sprite strip of 4 frames, cells 220x270 px. A new original street foe: a wiry rooftop punk in a ragged poncho made of tarp, goggles, holding a glowing magenta glass bottle, satchel full of bottles. Idle loop, tossing the bottle up and catching it.
  Other states: `[style block]` Same character as the reference (the bottle punk). `<n>` frames, cells `<w>`x270 px: `<windup: leans back with the bottle raised high, the bottle glowing brighter | throw: overhead lob, the bottle leaves the hand in frame 3 | hurt | knockdown | die>`.
  Plus **fx-bottle-splash**: `[style block, centred]` A 5-frame strip, cells 160x96 px: a magenta glowing liquid splash spreading flat on wet asphalt, then fizzing out.
- **foe-skater** reference + ride: `[style block]` A sprite strip of 4 frames, cells 260x280 px. A new original street foe: a lanky hover-skater in a reflective windbreaker and a full-face helmet with a teal visor, riding a low hover-board that glows underneath, crouched for speed. Ride loop, with the board humming and a teal under-glow flicker.
  Other states: `<windup: kicks back and the board's glow turns red | attack: low ramming dash with a speed streak | hurt | knockdown: thrown off the board, the board skids away | die>`.
- **foe-bombbot** reference + walk: `[style block]` A sprite strip of 6 frames, cells 140x140 px (the figure is 120 px tall). A new original small robot foe: a squat barrel-shaped bomb robot on two stubby legs, a round glass dome on top with a fuse light, dented yellow-and-black hazard paint. A waddling walk loop.
  Other states: `<armed: the dome blinks red and the robot shivers, 4 frames | attack: hops forward | hurt: knocked over | die: bursts in a small orange blast with shards>`.
- **foe-taser** reference + idle: `[style block]` A sprite strip of 4 frames, cells 240x280 px. A new original street foe: a private-security guard in a cheap blue-grey uniform with a mirrored half-visor and a long stun prod crackling with white-blue sparks. Idle loop with the prod sparking.
  Other states: `<windup: raises the prod and it charges bright white for a long beat | attack: lunging jab with an electric arc | hurt | knockdown | die>`.
- **foe-pest** reference + hover: `[style block, the figure hovers in the cell centre instead of standing]` A sprite strip of 4 frames, cells 96x96 px. A new original micro-drone foe: a fist-sized buzzing drone with four tiny rotors, one big magenta eye-lens and grabber claws. Hover loop.
  Other states: `<cling: claws open, clamped forward, 2 frames | hurt: spins off-balance | die: pops into sparks>`.

Wave 2 size: **40 strips + 1 FX strip** (6 foes x about 7 states). About 190 frames. Paint one whole foe at a time (reference first) and deliver it as one batch.

---

### WAVE 3: the set piece and the second boss (fun gaps 7, 8, 10). 24 strips

#### New boss: `boss-dock-titan`, the crane-yard foreman (the street's second boss, phase sheets)

A 2.8 m cyborg wrestler with a hydraulic crane arm. Body 384 px, cell 448 px tall, `metres` {h 2.8, w 1.2}, feet on the cell bottom, all states the same body height. Phase 3 is the same sheets tinted red-hot in code (tinting is allowed by the policy).

| state file (`boss-dock-titan/<state>-strip.webp`) | frames | fps | cell w | loop | phase / answer |
|---|---|---|---|---|---|
| idle | 4 | 4 | 360 | loop | - |
| walk | 6 | 8 | 380 | loop | - |
| lariat-windup / lariat | 3 / 4 | 8 / 14 | 420 / 460 | once | P1: spinning crane-arm lariat. Answer: change depth. |
| grab-windup / grab / slam | 3 / 3 / 5 | 8 / 12 / 14 | 420 / 420 / 460 | once | P1: grabs Kai and slams him. Answer: dash away during the 0.6 s wind-up. |
| plate-rip / plate-throw | 4 / 4 | 10 / 14 | 420 / 440 | once | P2: rips a road plate and throws it along a depth line. Answer: step out of the line. |
| stomp-windup / stomp | 3 / 4 | 8 / 14 | 380 / 420 | once | P3: overdrive stomp; 3 shock rings in a row. Answer: jump the ring. |
| stun | 4 | 6 | 380 | loop | the 1-1.5 s opening after every attack |
| roar | 5 | 10 | 400 | once | phase change (named on screen) |
| hurt | 2 | 10 | 380 | once | - |
| die | 6 | 8 | 480 | once | - |

Prompts:
- Reference + idle: `[style block]` A sprite strip of 4 frames in one horizontal row, equal cells 360x448 px. A new original boss: a 2.8 m tall cyborg dock foreman, barrel chest in a stained high-visibility harness with teal and magenta neon strips, one human arm and one huge yellow hydraulic crane arm ending in a three-finger claw, a welding-mask face plate with a glowing slit, steel-toed boots. Idle breathing loop with hydraulics hissing. Much bigger and heavier than any street foe.
- Other states: `[style block]` Same character as the reference (the cyborg dock foreman). A sprite strip of `<n>` frames, equal cells `<w>`x448 px: `<walk: heavy stomping walk | lariat-windup: crane arm pulled far back, its claw glowing red | lariat: full spinning swing of the crane arm with a wide motion arc | grab-windup: crouches with the claw open and reaching | grab: the claw snaps shut on empty air in front | slam: lifts the claw overhead and smashes down, road cracks | plate-rip: digs the claw into the road and tears up a metal plate | plate-throw: hurls the plate forward flat like a disc | stomp-windup: lifts one leg high and the boots glow orange | stomp: stomps and a shock ring bursts at the foot | stun: kneeling and panting, steam venting from the arm | roar: rears up and roars, sparks burst from the arm | hurt: rocks back | die: crane arm sparks, he topples and falls flat in smoke>`.
- **fx-shock-ring**: `[style block, centred, flat on the floor]` A 6-frame strip, cells 320x96 px: a flat orange-and-white shock ring rolling outward along wet asphalt, seen from slightly above, fading.
- **prop-road-plate**: `[style block]` 1 frame, 200x60 px: a thick torn steel road plate with rivets and rain glints, seen from the side, flat. (It spins in code.)

Wave 3 boss: **19 strips** (16 boss states counting each wind-up separately, 2 FX and prop, 1 shared tint) plus the bar name in code.

#### Set piece and hazards (gap 6, 7)

| id / file | what | frames | fps | cell | metres | loop |
|---|---|---|---|---|---|---|
| `prop-hovercar-pass/loop-strip.webp` | A traffic hover car that crosses the back lane of the belt (hazard for all; 1 s warning lights) | 4 | 12 | 640 x 220 | 4.5 m long | loop |
| `fx-lane-warning/loop-strip.webp` | Floor warning chevrons glowing along a depth line, the 1 s tell | 4 | 12 | 512 x 64 | - | loop |
| `prop-hydrant/idle-strip.webp` + `prop-hydrant/burst-strip.webp` | A hydrant you break; its water jet pushes foes for 3 s | 1 + 6 | -, 14 | 120 x 260 | 0.8 m (+ jet) | -, loop |
| `buddy-drone-ally/assist-strip.webp` | The once-per-stage ally (gap 10): a courier friend who drops in, makes 3 kicks and leaves | 10 | 14 | 300 x 326 | 1.75 m | once |
| `kai/victory2-strip.webp` | A stage-clear pose with the satchel thrown over the shoulder (personality) | 6 | 8 | 200 x 326 | 1.8 m | once |

- **prop-hovercar-pass**: `[style block, side view, the car floats a little above the bottom edge]` A 4-frame strip, cells 640x220 px: a battered cyberpunk hover taxi in yellow and teal, with headlights blazing magenta-white, streaking right to left with motion blur and a rain spray under it. A 4-frame loop of the hover glow.
- **fx-lane-warning**: `[style block, flat on the road, seen from slightly above]` A 4-frame strip, cells 512x64 px: a row of glowing red-orange arrow chevrons painted in light on the wet asphalt, pulsing brighter across the 4 frames. No text.
- **prop-hydrant**: `[style block]` Idle: 1 frame, 120x260 px, a squat cyberpunk fire hydrant with a teal cap at the bottom of the cell. Burst: 6 frames, the same cell: the cap blows off and a strong white water jet shoots up and forward with spray, looping in frames 3-6.
- **buddy-drone-ally**: `[style block]` A sprite strip of 10 frames, cells 300x326 px. A new original friendly courier: a girl in a magenta windbreaker with roller skates and a delivery helmet (an ally, not a foe). She drops in from above (1-2), lands (3), makes three fast kicks forward (4-8), waves and skates off to the left (9-10). Feet on the bottom edge from frame 3.
- **kai/victory2**: `[style block]` Same character as the reference (Kai). A sprite strip of 6 frames, cells 200x326 px: Kai slings the data satchel over his shoulder, tips two fingers from his hood brim and grins. Feet on the bottom edge.

Wave 3 size: **19 boss strips + 7 set-piece strips = about 26 images**, about 150 frames.

**Totals: Wave 1 = 24 images (about 90 frames), Wave 2 = 41, Wave 3 = 26.** Every one has a placeholder slot first (ASSET-POLICY.md), so the code can be built and tested before the art lands.

---

