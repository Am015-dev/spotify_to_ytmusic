# What the benchmark brawlers do better, on the owner's 6 points (W195, 24 Oct 2026)

Owner, 24 Oct: "on foot is boring, the enemies slide to me, they do not run, the figures do not blend well inside, game is not very
strategic, no defense parry button, knife and melee attacks hit from distance, there is low opacity with blinking enemies, no sound
effects ... without distorting the music." Rows L1-V1 are in STREET-BAR.md. Section 2 of STREET-REVIEW-AND-ASSETS-2026-10-24.md
(combos, grabs, roster, props) is not repeated here.

Games compared (no names, per CLAUDE.md): **benchmark** = the 2022 pixel-art arcade-licence brawler; **B** = a 2020 hand-drawn
retro-sequel brawler; **C** = a 2022/23 anime-style brawler sequel; plus general sources on crowd AI and game mixing.
**Honest limit:** the web has almost no frame or dB numbers for these games. Numbers below come from fan guides and dev interviews;
anything not found is marked "not found", never guessed.

How we measured beta.186 (live build, `parts/build.py`): a stepped probe on `qa/streetsim.js` (DBG observer, 20 runs: gfirst + dodge,
10 each, ~3000 s of game time), code reads with file:line, and one phone (390x763) + one PC (1440x860) screenshot 7 s into the street
(not committed). The probe's draw hook recorded 0 foe draws (`FOOT.look.draw` in sim does not reach `ART.fE`), so foe alpha is from code, not a stepped count.

## 1. Enemy locomotion ("they slide to me, they do not run")
- **Benchmark / B:** foes run with full cycles; B's foes change approach speed with the player's facing: some walk faster when your back
  is turned, some back away as you come and saunter back when you turn (fan guide, steamcommunity). Dodging a ranged attack = step out of
  its depth line. Foe walk/run speeds and stride numbers: not found.
- **Crowd rule (general):** an attacker "token" pool: a foe must hold a token to attack (2 at once is common); the others strafe in depth
  for 1-2 s and wait (battle-circle tutorial, code.tutsplus; a shooter's GDC combat talk, as summarised in dev write-ups). We have the cap (E2); we lack the strafing.
- **beta.186, measured** (all strips play 6 frames at 12 fps = one 0.5 s cycle, whatever the speed):

| foe | median speed (units/s) | ground per cycle / body height | steps moving in a non-run pose | moonwalk (run pose, moving backwards) | run pose standing still |
|---|---|---|---|---|---|
| rusher (h 62) | 210 | 1.7 (natural run ~1.6-2.0) | 20% (0.3 s lunge at 860 u/s in `melee` pose) | 6.5% (`back` state, street2.js:47) | 25 steps |
| gunner (h 64) | 105 | 0.8 (feet skate ~50%) | 39% (walks to cover in shoot/crouch pose) | 2.5% | 602 steps = 10 s (clamped at the screen edge) |
| heavy (h 80) | 49 | 0.3 (treadmill, ~80% error) | 46% (wind/charge poses while moving) | 0.2% | 43 |
- **Gap:** one fixed cycle rate for every speed, a lunge and a back-off that glide, a gunner running in place at the edge. Only the
  rusher's forward run plants its feet. Foes walk straight at Kai's x; nothing circles.
- **Covered by:** W190 (L1: stride error <= 20%, 0 frames moving while idle) if it scales playback rate by speed and gives lunge/back-off
  their own poses. **Missing:** circling/waiting foes (new task N1).

## 2. How the figures sit in the scene ("they don't blend in")
- **B:** hand-drawn HD, ~1000 frames per hero and 300-400 per foe, animation built on the original timings (+1-2 frames per punch)
  (dev interview, animeherald; wiki). **Benchmark:** pixel art with the same pixel scale for actors and backgrounds. Palette limits,
  outline colour, shadow type, per-stage tint: not found for any game.
- **beta.186, screenshots:** the street is a thick-outlined, painted magenta/violet scene; Kai is a cool grey figure with a thin outline,
  no rim light, no visible contact shadow on PC or phone, and no wet-road reflection, although the road is drawn wet. The knife foe gets a
  magenta tint and a shadow ellipse, so foes sit better than Kai. Rain draws over both (good).
- **Gap:** different line weight and value range from the background; Kai unlit. **Covered by:** W194 (V1: grade, contact shadow,
  reflection, neon rim; actor-to-scene colour distance halved). Add to W194's gate: Kai and foes both get it.

## 3. Defence ("no defence/parry button")
- **Benchmark:** no block button. Defence is a dodge roll with "plentiful" invincibility (review, nintendolife), an escape roll usable
  while being hit, a wake-up roll, and a rising attack invincible until its apex, input window about 1-4 frames (fan guide, steamah).
  Specials cost no health; the meter fills from hits and taunts (dev interview, pcgames.de).
- **B:** no block either: a defensive special with short invincibility that costs recoverable health, won back by landing hits; a
  tech-roll after throws and knockdowns; i-frames on landing a grab (wiki). Frame counts: not found.
- **C:** a real block with a timed parry that opens the foe for a punish; reviewers call the window tight ("~20% success" for one
  player on the first game) (reviews: kotaku, godisageek; Steam forum).
- **beta.186:** buttons BOMB, KNIFE, DASH, JUMP (phone screenshot); no block or parry; the knife cuts bullets (foot.js:240) and stepping
  in depth dodges (D2). **Gap:** no move that answers a close attack and pays back. **Covered by:** W192 (G1: hold block, tap-parry
  opens the attacker; gate parry bot -30% hearts). **Lesson from the benchmark:** give the parry a generous window (>= 8 frames) or C's
  "too tight" complaint follows, and make the gain visible (foe staggers 0.6 s, hit-stop + spark).

## 4. Melee reach ("knife and melee hit from distance")
- **Benchmark:** a jab's first active frame lands between frame 3 and frame 11 depending on the character (fan guide). Devs say the old
  games needed pixel-perfect depth lining up, and they made depth matching more forgiving on purpose (pcgames.de interview). Active-frame
  counts, hitbox sizes and depth tolerance in pixels: not found.
- **B:** base combo 4-5 hits, the first two stagger; game speed locked to 60 fps (wiki, pcgamingwiki).
- **beta.186, code + probe:** Kai's knife box is 62 units from his centre, live on the press frame (0 frames of startup, foot.js:238).
  With a 28-unit body and a 28-unit rusher, it lands with up to **48 units of air between the bodies** (0.77 of a foe's height). Depth
  tolerance: 0.15 of the band (146 px on PC) = ~22 px. Foe melee is fine: 174 measured hits on Kai, max gap 6 units (rusher), 0 over 8.
- **Gap:** the reach problem is Kai's knife, not the foes. **Covered by:** W191 (M1: 0 hits with a gap > 8). Add to W191: 3-frame
  startup and 2-3 active frames, so the knife swing is seen before it lands, like the benchmark's jab.

## 5. Foe hurt feedback ("low opacity, blinking enemies")
- **B:** the white flash is the hit feedback; i-frames show as a white flash and make the foe immune to stagger; every foe falls after
  at most 8 hits, so nothing can be juggled forever (fan guide, wiki). **General:** hit-stop 2-4 frames on a light hit, 6-10 on a heavy one (pixel combat guide, gamineai);
  one 3D fighter uses ~7 / 11 frames (frame wiki). Benchmark's flash colour, blink on death, knockdown i-frames: not found.
- **beta.186, code:** live foes are forced to alpha 1.0 (streetlook.js:141). The hit is a white silhouette at 0.8 alpha for 0.08 s
  (art.js:68-69). Things that read as "blinking": every attack wind-up draws a **red disc on the foe's chest pulsing 0-0.7 alpha at
  4.8 Hz** (streetlook.js:139) for at least 0.4 s; dead foes fade (footstage.js:196); a pickup blinks after 13 s.
- **Gap:** the telegraph is a strobing light, not a pose. **Covered by:** W190 (L2: 0 blink cycles). Add to W190: the tell becomes a
  held wind-up pose + one steady glow; no alpha below 1.0 on a live foe.

## 6. Sound ("no sound effects; shots, kicks, hits must vary without distorting the music")
- **Benchmark / B / C:** reviews praise "meaty" hits; variant counts, layering, pitch spread and mix levels: not found.
- **General mixing guidance:** priority order is player SFX > enemy SFX > music > ambience; when ducking is used it is 6-12 dB with a
  fast attack (dev forum, bugnet guide). Our owner forbids any duck, so the answer is the opposite: keep the effects small and
  mid-frequency so they never need room made for them.
- **beta.186, code:** the "pure" mix (puremusic.js:12-16) silences every effect in a run except `hurt`, `pick` and `boom`; `shot`, `hit`
  and `graze` (the knife) are off. Each effect is one fixed synth blip (a.js:401-406: `shot` = one 60-note sine for every weapon), with no
  variants and no pitch spread. The song is never ducked or filtered and the effects bus is 0.22 x volume (about -13 dB).
- **Gap:** 3 sounds, 1 variant each; no kick or hit sound at all. **Covered by:** W193 (S1 variants, S2 no duck, effect peak <= song
  -6 dB). Add to W193: 3 variants per sound with +/-6% pitch and +/-1.5 dB gain spread, and sounds the stepped sim can log (probe saw 0 calls).

## New tasks (each ~45 min; only what W190-W194 do not cover)
- **N1 CIRCLE AND WAIT (Sonnet, flag `?circle=1`).** Foes without an attack slot (E2) strafe in depth at walk speed with a walk-back
  pose, 1-2 s per leg, at 140-220 units from Kai, and turn to face him. Decision: whom to break first from a ring that's closing.
  Gate: non-attacking foes within 250 units stand still < 20% of their time; D3 depth spread >= 30%; dodge-bot clear rate moves <= 8 points.
- **N2 DODGE WITH I-FRAMES (Sonnet, flag `?dodgei=1`).** The benchmark's answer to danger is a roll, not a block. DASH gets 8
  invincible frames (0.13 s); a dash through an attack in its last 0.15 s gives a "CLOSE CALL" 0.5 s slow-down and a free knife crit.
  Decision: block (W192) and stay, or dash through. Gate: a dash bot loses >= 25% fewer hearts than gfirst; 0 i-frames outside the dash.
- **N3 SOUND EVENT LOG (Haiku chore, 15 min).** Make `AU.sfx` record its name before the audio-context check, so streetsim can count
  sounds per action; W193's variant gate needs it. Gate: a 10-run probe logs >= 1 call for shot, hit, knife, kick, hurt, boom.

## Score of beta.186 on rows L1-V1 (0/1, measured)
| row | score | measured |
|---|---|---|
| L1 foes run, feet planted | 0 | moving in a non-run pose: rusher 20%, gunner 39%, heavy 46% of moving steps; heavy 0.3 body heights per cycle (~80% stride error) |
| L2 solid, flash not blink | 0 | alpha forced to 1.0 (code), but a 4.8 Hz red-disc strobe on every wind-up (>= 2 blink cycles per attack) |
| G1 defence button | 0 | no block or parry input (4 buttons: bomb, knife, dash, jump) |
| M1 melee in contact | 0 | Kai's knife lands with up to 48 units of air; foes pass (max 6 units over 174 hits) |
| S1 every action its own sound | 0 | 3 sounds live (hurt, pick, boom), 1 variant each; shots, hits, knife silent |
| S2 effects never duck the song | 1 | no duck/filter on the song; effects bus 0.22 (about -13 dB); peak against the song not measured |
| V1 actors lit by the scene | 0 | Kai unlit, no contact shadow, rim or reflection in both screenshots; foes partly tinted |
**1 / 7.** Player-equivalent effect on the street score (rule 10): unchanged; these rows describe why it sits at the players' 10-12/100.
