# Street review vs the benchmark beat-'em-up, and the art waves (W183, 24 Oct 2026)

Build: `alex/brave-carson-rbpmlk` at beta.182 (belt floor, leading camera, prop fade, 3-phase boss, hit feel, attack slots, one song are all on).
The benchmark is the 2022 pixel-art belt beat-'em-up the owner named on 23 Oct. In this repo it is called "the benchmark beat-'em-up" only.

How ours was measured (rule 9 x100, no real-time play):
- `qa/streetsim.js` with `RUNS=100`: 4 bots x 100 seeds = 400 runs, 56,800 s of game time stepped in 51 s (x1110 real time).
  The run used the per-step probe `qa/hitfeel-probe.js` (hit-stop, shake, knockback, telegraphs, attackers at once).
- A second pass of 300 runs (bots nearest, gfirst, dodge) used `qa/bossprobe.js` (B1-B4).
- Two phone shots (390x763) were taken in stepped mode for the changed screens (belt floor, boss). They were looked at, not committed.
- The camera, the old street and the start screen were compared with the saved shots in `benchmark/street/` (not retaken).
- Rows that no code change has touched since 23 Oct (P1, P2) carry the 23 Oct measurement. They are marked "carried".

The benchmark was judged from reviews, move lists and guides (sources are linked under each claim).

---

## 1. Strict score: both games on the 22 rows of STREET-BAR.md

| # | Gate | Ours, beta.182 (measured) | Ours | Benchmark (judged from research) | Bench |
|---|---|---|---|---|---|
| F1 | Hit-stop 2-4 f light, 5-8 heavy/kill | 100% of 41,823 landed hits get 2-5 frames; 12,125 of 12,146 kills (99.8%) get >= 5. On 23 Oct it was 0 frames. | **PASS** | Reviews call the combat "crunchy" and "satisfying" (TheGamer (2022 review or guide; URL left out because it carries the original name), Nintendo Life (2022 review or guide; URL left out because it carries the original name)). No source counts the frames. | PASS (judged) |
| F2 | 100% of hits flinch + spark; knockback scales | Flash, hit pose and spark on 100% of hits. Only 54.5% of hits push the foe more than 5 units: boss and heavy front-plate hits do not recoil, by design. | **PASS** (weak) | Foes reel, get knocked down and get juggled; there are wall-to-wall air juggles (Nintendo Life (2022 review or guide; URL left out because it carries the original name)). | PASS |
| F3 | 0 shakes on misses | 0 shakes from Kai's misses; the shotgun whiff shake is gone (was 44 per run). The 2.5 "other" shakes per run come from boss pound and leap landings and from blasts, not from misses. | **PASS** | Judged: the screen shakes on big impacts and boss slams. | PASS (judged) |
| F4 | A light hit throws Kai <= 64 units | Median 53 units, max 61 (n = 4,124 hurts). | **PASS** | Light hits cause a flinch; heavy hits cause a knockdown with a roll-out (move list (2022 review or guide; URL left out because it carries the original name)). | PASS |
| E1 | Every attack telegraphed >= 0.4 s | Rusher 6,861 of 6,861 (min 0.73 s), heavy 654 (min 0.8), boss charge 1,477 (min 0.8), gunner open shots 366 (min 0.5). **Gunner charge-mode shots: 46 of 50 under 0.4 s in the probe.** `street2.js:56` does set a 0.5 s `tele` before these shots, so the probe or the code is wrong. Unproven, so it counts as FAIL. | **FAIL** (1 attack, unproven) | Judged PASS for grunts. | PASS (judged) |
| E2 | <= 2 attackers at once | Steps with more than 2 foes winding up or attacking: 0.115% (3,977 of 3.45 M steps). 203 of 400 runs have a moment with 3, and 1 run has 4. The slots hold attack starts but not every case. | **FAIL** (rare) | Grunts circle and take turns; the screen gets crowded only in 4-6 player co-op. | PASS (judged) |
| E3 | 0 unreadable hits | Melee: 0 of 3,024 hits came from a foe on screen < 1.2 s (min 1.52 s). Bullets: the same open question as E1 (151 gunner bullet hearts, some may be charge shots). | **FAIL** (tied to E1) | Grunts are fine, but bosses "don't always feel fair" (Easy Allies (2022 review or guide; URL left out because it carries the original name)). | PARTIAL |
| E4 | >= 4 foe types, each with its own counter | **3 types live**: rusher, gunner, heavy. The shield guard (`streetfoe.js`) is behind `?shieldfoe=1`, and 0 guards spawned in 400 runs. Eight more foot sheets exist but are not used on the street: knife, ninja, flamer, hound, jetpack, medic, sniper, gunman. | **FAIL** | 25 roster entries: 16 colours of ninja grunt (each colour has its own weapon or move) plus 9 robot, alien and stone types, including flyers and dogs (list (2022 review or guide; URL left out because it carries the original name)). | PASS |
| B1 | 2-3 phases, each adds an attack, named | 3 phases in 100% of fights (27/27, 40/40, 69/69). Each is named on the bar ("BIG HEAVY · PHASE 2: GROUND POUND"). | **PASS** | 16 bosses, one per stage, plus double bosses (StrategyWiki (2022 review or guide; URL left out because it carries the original name)). No source counts the phases. | PASS (judged) |
| B2 | 3-5 attacks, each dodged >= 70% by the dodge bot | 4 attacks. Dodge bot: barrel throw 100%, charge 98%, leap 100%, **ground pound 46%**. Nearest bot: pound 41%, leap 8%. | **FAIL** (pound) | Bosses charge, shoot, summon and throw you toward the foreground, each with a read (Nintendo Life (2022 review or guide; URL left out because it carries the original name)). | PASS |
| B3 | >= 1 s window after every attack | 99% of attacks, median 1.0 s (exactly on the gate). | **PASS** (on the line) | The first boss is stunned after each charge (StrategyWiki (2022 review or guide; URL left out because it carries the original name)). | PASS |
| B4 | Fight 45-90 s for the dodge bot | Median 67.5 s (52-102 s); nearest 60 s, gfirst 63 s. On 23 Oct it was 7.4 s. | **PASS** | Judged: about 1-2 min per boss. | PASS (judged) |
| B5 | Bigger than foes; bar + name | Bar, name and phase on screen. The boss is 90 units tall against a heavy's 80 (1.13x). | **PASS** (weak) | Bosses are large, with a named bar. | PASS |
| D1 | Floor band >= 25% of the view, actors use >= 60% of it | Band 27% of the view; 80% of depth slices are used. | **PASS** (close) | A deep belt floor, the core of the genre. | PASS |
| D2 | Out-of-depth attacks miss; depth dodges >= 30% | 1,349 out-of-depth misses vs 1,064 hits = 56% avoided by depth. | **PASS** | Core of the genre. | PASS |
| D3 | Attackers spread >= 30% of the band | 32% median spread. | **PASS** (close) | Foes come from both sides and from the back. | PASS |
| D4 | Depth sort + shadow under every actor | Sorted every frame (`streetlook.js:152`, `SL.band`), and the shots show a floor shadow. There is no numeric probe. | **PASS** (no probe) | Yes. | PASS |
| D5 | >= 3 interactive prop kinds | 4: crate (cover, breakable), gold crate, post, and barrel (its blast hurts foes and the boss charge sets it off). But nothing can be picked up, thrown or knocked a foe into, and there is no hazard on a timer. | **PASS** (weak) | Spikes, traffic and pits hurt foes too; crates and vending machines break for food (TheGamer tips (2022 review or guide; URL left out because it carries the original name)). | PASS |
| P1 | footvis + spritecut pass | Carried from 23 Oct: actors pass, but 6 prop or still cells are cut at the edge and prop-steam jumps. No commit has touched those sheets since. | **FAIL** (props) | "Superbly animated" (Nintendo Life); EGM calls the visuals its best feature. | PASS |
| P2 | One song per level, no jingles | Carried: streetsong and soundlab pass. | **PASS** | One track per stage, with vocal tracks on set pieces (IGN: one of the best soundtracks of the year (2022 review or guide; URL left out because it carries the original name)). | PASS |
| P3 | Kai in the right 30% < 10% | Leading camera on since beta.181. cam2-test measured 0% on 23 Oct; the saved shot `street-running-phone-camera-NEW` agrees. | **PASS** | Judged. | PASS |
| P4 | Actors >= 1/8 of the screen; HUD never covers the fight | Actors about 1/6 of the screen. **New since the belt floor:** the boss bar ("BIG HEAVY · PHASE n", y ≈ 515-540 of 763) and the run-progress bar sit on the front 15% of the floor band. A foe or Kai at the front depth has its legs under the bar. A "HEAL" placeholder label also floats on the road. | **FAIL** | Crowded 4-6 player screens are "visually unclear" (Nintendo Life); solo play is clear. | PARTIAL |

**Tally: ours 15 / 22 rows PASS** (23 Oct: 3 / 17). The fails are E1, E2, E3, E4, B2, P1 and P4. **Benchmark 20 / 22** (E3 and P4 partial).

What the shots show (phone, stepped):
- The belt floor reads well: a wide wet road with depth and a shadow under the boss.
- The boss stood at the left screen edge, half cut off. That may be a side effect of forcing the sim forward for the shot, so check it in the owner's play.
- Kai was not in either forced shot. The camera may simply not have followed the teleported state, but it is worth a 10-second look in the owner's play.

### Player-equivalent score (rule 10)

Ours is anchored to the players' 10-12 and the 23 Oct 13/100. Each category moves only on before/after evidence.

The benchmark's score comes from its reception:
- OpenCritic top-critic average 87, 95% recommend ([OpenCritic](https://opencritic.com/game/13252)).
- Metacritic 84-87 by platform.
- Steam users 96% positive of 6,010 ([Steam](https://store.steampowered.com/app/1361510)).
- Common complaints: short (2.5-4 h), repetitive late stages, boss fairness, light progression.

| Category | Ours (was 23 Oct) | Evidence for ours | Benchmark | Evidence for the benchmark |
|---|---|---|---|---|
| Fun | 15 (11) | The boss is now a 60-70 s fight with 4 attacks instead of 7 s. But the verb is still "hold fire and step": one button decides most of the fight. | 88 | "Fast, crunchy" combat; co-op chaos. Complaint: repetitive late. |
| Combat depth | 9 (-) | Shoot plus a knife and a dash. The combo2/combo3 sheets exist but no combo chain or finisher uses them. No grab, throw, super or juggle. | 82 | 4-hit string, dash bash and slide, aerial dive, super jump, automatic grab with 3 throws, a super meter filled by hits and taunts, dodge with invincibility frames, 3 co-op team moves (move list (2022 review or guide; URL left out because it carries the original name)). |
| Enemy variety | 9 (10) | 3 live types; the shield guard is still off. With the floor wider, the same 3 types feel thinner. | 78 | About 10 distinct kinds plus colour variants. Critics note "grunts become grating" on repeat. |
| Bosses | 22 (8) | 3 named phases, a 1 s opening after 99% of attacks, a 67 s median fight. One boss for the whole level; the pound is dodged only 46%; it is barely bigger than a heavy. | 82 | 16 bosses, double-boss fights, set pieces (blimp chase, throw toward the foreground). "Not always fair." |
| Environment | 12 (8) | A real belt floor (27% band, 56% of attacks dodged by depth). Props are only cover and barrels. Nothing can be thrown or used against foes on purpose, and there are no hazards on a timer. | 85 | Traffic, spikes and pits hit foes too; breakables drop food; vehicle and hoverboard stages. |
| Feel | 22 (9) | Hit-stop on 100% of hits, kill freeze, Kai's shove <= 61 units, 0 whiff shakes. | 92 | Crunchy, satisfying, superbly animated. |
| Look | 20 (18) | Painted street, the depth band reads, props fade in front of Kai. A boss half off screen and the "HEAL" placeholder label hurt. | 95 | The visuals are its best feature. |
| Sound | 12 (12) | One song; no hit-sound weight work. | 95 | Praised soundtrack, vocal tracks, voice barks. |
| Clarity | 13 (12) | Phase names on screen, a caption per attack. The boss and progress bars cover the front of the floor; there is a placeholder label. | 75 | Clear solo, cluttered in 4-6 player co-op. |
| **Player-equivalent** | **16 / 100** (13) | +3: the boss and the feel moved on measured numbers. The core verb and the roster did not. | **86 / 100** | The critic average (84-87) and Steam 96%, minus the "short and repetitive" complaints. |

What the tests prove: the rows above are numbers from 700 stepped runs. What only the owner can judge: whether the street is fun to play now.
The gap to the benchmark is 70 points, and most of it is combat depth, roster and environment, not polish.

---

## 2. Why the benchmark is fun: 10 things it does that we don't

Our street is an on-foot shooter on a belt floor. The benchmark is a melee brawler. We do not need to drop the gun, because it is Kai's identity.
But nearly all of its fun comes from **what you can do to a foe up close**, and Kai has almost nothing there.

| # | What it does | What to build on our street | Measurable gate | File / area | Tier | New art? |
|---|---|---|---|---|---|---|
| 1 | **Combo string with a finisher**: a 4-hit chain where the last hit knocks the foe down and into others ("bowling"). | The KNIFE button chains melee -> combo2 -> combo3 within 0.35 s windows. Hit 3 is a finisher: 8 frames of hit-stop, knockdown, 160-unit launch; a launched foe hurts the foes it hits. | A melee bot lands 3-hit chains in >= 60% of strings; >= 25% of finishers hit a second foe; streetsim clear gates still pass | new `parts/street/streetmelee.js` (flag `?combo=1`), hooks `IN.dmgE` | Sonnet | No for the basic chain (kai/melee, combo2, combo3 exist). Yes for a real finisher pose and for foe knockdown frames (Wave 1). |
| 2 | **Grab and throw**: walk into a stunned foe to grab it, then throw it at the crowd or off the screen. | Grab a foe that is flinching or knocked down (touch it during the stun), then throw it forward or backward. The thrown body is a projectile that hits every foe in its depth line. | >= 1 extra foe hit per throw on average; time to clear wave 5 down >= 15% for a grab bot vs the gfirst bot | `streetmelee.js` | Sonnet (Opus if a first try fails) | Yes: kai/grab, kai/throw, foe/thrown (Wave 1) |
| 3 | **Dash attack and slide**: running moves that open a crowd and cross depth. | DASH + KNIFE gives a shoulder-bash that knocks back everything in its line and ends the dash. | Dash attack hits >= 2 foes in >= 30% of uses; the depth dodge share stays >= 30% | `streetmelee.js` + `foot.js` dash | Sonnet | Placeholder from the kai/dash sheet now; kai/dashattack in Wave 1 |
| 4 | **Super meter and taunt**: hits fill a meter, a button spends it on a screen-clearing special, and taunting fills it at a risk. | An OVERDRIVE meter (caption "OVERDRIVE: hit without getting hurt") fills from landed hits and empties on a hurt. Full = BOMB button turns into a special (the grenade sheet plus the existing fx-boom). | The meter fills about every 25-40 s for the dodge bot; specials hit >= 3 foes in >= 50% of uses | `streetfeel.js` (the meter) + the HUD in `streetlook.js` | Sonnet | Wave 1: kai/special, kai/taunt, a HUD meter frame |
| 5 | **Enemy roster with roles**: about 10 kinds, each forcing a different answer (shielded, ranged, jumper, flyer, dog, heavy). | Wire the 8 foot foes we already have, one role each (see section 4, task 2). Then add the Wave 2 foes: grappler, lobber, skater, bomb bot, taser, swarm. | >= 6 live types; each type's time to kill differs >= 30% between a bot that uses its counter and one that does not | `street2.js` / `streetfoe.js` (`FE.*`), street3 wave plan | Opus (design), Sonnet (wiring) | 8 foes: no (sheets exist). The 6 Wave 2 foes: yes. |
| 6 | **An environment you use**: hazards and breakables that hurt foes too, and props to throw. | Throwable props (trash bin, road cone, barrel: pick up with KNIFE next to it, throw on release). A hydrant jet. A traffic lane at the back of the band where a hover car crosses every 12 s with a 1 s warning and hits anyone in that depth. | >= 15% of foe kills by the environment for a bot that uses it; 0 unannounced hazard hits on Kai | `street2.js` props (`crate`, `barrel`), `streetlook.js` | Sonnet | Wave 1 (throwables), Wave 3 (traffic hover car, hydrant) |
| 7 | **Level gimmicks and set pieces**: a chase, a hoverboard run, a vehicle beat between fights. | Split the street's 12 waves into 3 beats: alley brawl, then a traffic crossing (gimmick 6), then a rooftop of the hover taxi with wind. The "rest beat" between them is one breakable-food room. | Threat curve with >= 2 dips and a peak at 82-88% (today's streetsim gate fails at 63%) | `street3.js` wave plan | Opus | Wave 3 background pieces |
| 8 | **Boss set pieces**: every stage ends on a different boss; some throw you at the screen, some come in pairs. | A second, different boss (Wave 3). Fix today's pound (46% dodged) so each attack has one clear answer. Move the boss bar off the floor band. | B2: every attack dodged >= 70% by the dodge bot; P4: 0 HUD pixels over the floor band | `streetboss.js`, `streetlook.js` HUD | Sonnet now, Opus for the new boss | Wave 3 (new boss) |
| 9 | **Feedback you can count**: a combo counter, KO bounces, juggles, score pops for a foe thrown off the screen. | A COMBO counter (caption "hits in a row") that breaks when Kai is hurt. A knocked-down foe bounces once and can be hit again in the air (juggle) for 0.4 s. | Median best combo per run >= 12 for the dodge bot; counter visible 100% of the time while it is > 1 | `streetfeel.js` + `streetlook.js` | Sonnet | Wave 1: impact FX and combo digits |
| 10 | **Personality and co-op feel**: taunts, idle charm, voice barks, team moves, revive. | Solo game, so the co-op feel becomes a callable ally: once per stage, the courier drone drops a buddy for 8 s who copies Kai's attacks. Add a victory pose, a taunt, and foe barks as text bubbles (2 words max). | Owner's play score; the buddy is used in >= 50% of bot runs that reach wave 6 | `streetfeel.js` | Opus (feel) | Wave 3: buddy sheet, taunt; victory pose exists (kai/victory) |

The fun-game-design rule to keep in front of every one of these: **every 10 seconds the player must decide something.**
Today the 10-second decision is "which depth line, which foe first". After items 1-4 it becomes "shoot from range or close in for a combo, grab that one and throw it into the gunner, or save OVERDRIVE for the heavy".

---

## 3. Asset waves for Google Flow (the owner makes the art)

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

## 4. The 5 biggest code changes with EXISTING art (ready-to-run worker tasks)

Each task: one deliverable, about 30 min, flag off by default, branch `nr/W18x-<name>`. Read WORKER-RULES.md first (rules 9, 10, 15, 16).
The gate is a stepped streetsim (RUNS=100) plus the change's own probe; `guard.py` and one smoke run.

1. **W184 KNIFE COMBO + FINISHER (Sonnet).** New part `parts/street/streetmelee.js` (flag `?combo=1`, `PARTS_EXTRA.append`).
   - KNIFE pressed within 0.35 s of the last hit chains `kai/melee` -> `combo2` -> `combo3`. These are existing sheets; re-timing is allowed.
   - Hit 3 is the finisher: 8-frame hit-stop, shake 6, the foe launched 160 units. A launched foe that touches another foe in its depth line deals 1 damage and flinches it.
   - Add a `melee` bot to `qa/streetsim.js` that closes in and chains.
   - Gate: chains of 3 in >= 60% of the bot's strings; >= 25% of finishers hit a second foe; all streetsim gates that passed today still pass, flag on and off.
   - Player decision it creates (rule 13): shoot from safety, or close in for a finisher that clears a group.
2. **W185 FOUR MORE FOES FROM EXISTING SHEETS (Opus design, then a Sonnet wiring pass).** Turn on the shield guard (`?shieldfoe=1` default on) and add 3 foes in the `FE.*` style of `street2.js` / `streetfoe.js`, one role each:
   - `ninja` (block / dash / slash): blocks frontal shots, dashes in depth. Answer: knife or bait the dash.
   - `hound` (run / pounce / bite): fast and low, pounces from the back of the band. Answer: jump.
   - `flamer` (walk / spray / hit): denies an area in its line for 1.5 s. Answer: change depth.
   Place them in the street3 waves (no more than 2 new types per wave).
   - Gate: >= 6 live types in streetsim hearts-by-source and time-to-kill; each new type's time to kill differs >= 30% between a counter bot and gfirst; casual clear stays 25-40%, dodge 60-80%.
   - Load `fun-game-design` first.
3. **W186 BOSS POUND FIX + HUD OFF THE FLOOR (Sonnet).** These are rows B2 and P4.
   - In `streetboss.js`, the ground pound is dodged 41-46%. Make the wave's tell and its answer one clear thing: the wave travels along Kai's depth line only, 0.8 s wind-up, so stepping out of the line OR jumping both work. The nearest bot's leap dodge is 4-8%: give the leap a 0.8 s shadow mark.
   - In `streetlook.js`, move the boss bar and the progress bar above the far edge of the floor band (or into the HUD panel). Remove the floating "HEAL" placeholder label from the road.
   - Gate: `bossprobe.js` shows every attack dodged >= 70% by the dodge bot and >= 40% by the nearest bot; a stepped probe finds 0 HUD rectangles overlapping the band rectangle on 390x763 and 1440x860; fight median stays 45-90 s.
4. **W187 OVERDRIVE METER + SPECIAL (Sonnet).** In `streetfeel.js` (flag `?overdrive=1`).
   - The meter fills +1 per landed hit and +4 per kill, and drops to 0 on a hurt (risk). Caption on first show: "OVERDRIVE: land hits without getting hurt".
   - When full, BOMB becomes the special: the existing `kai/grenade` pose plus `fx-boom-large-electric` as a ground ring, 3 damage to everything within 220 units in all depths.
   - Use a plain placeholder bar labelled `hud-overdrive` until Wave 1 art arrives.
   - Gate: the dodge bot fills it every 25-40 s (median); specials hit >= 3 foes in >= 50% of uses; casual and dodge clear rates move <= 8 points.
5. **W188 COMBO COUNTER + KNOCKDOWN BOUNCE (Sonnet).** In `streetfeel.js` + `streetlook.js` (flag `?combocount=1`).
   - A "HITS" counter shows while the streak is > 1 and breaks on a hurt or after 2 s without a hit.
   - Finisher, throw and blast kills make the foe bounce once (0.4 s juggle window) using its `die` frame 1 tilted; this re-uses existing frames by rotation and is allowed.
   - Gate: median best streak per run >= 12 for the dodge bot; the counter is drawn on 100% of steps where the streak is > 1 (stepped draw probe); 0 HUD overlap with the floor band.

Chore to run first (Haiku, 10 min): settle E1 and E3. Write a 20-line stepped probe that logs `e.tele` on the gunner's `charge` state for 50 runs of the nearest bot, and report the gap from `tele` start to bullet spawn. If it is >= 0.4 s, the hitfeel-probe gunner branch is wrong; fix the probe and mark E1 PASS. If not, the `street2.js:56` path is skipped somewhere and needs a Sonnet fix.
