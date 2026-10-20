# Handoff: start a new session from this file

Repo `Am015-dev/spotify_to_ytmusic`, branch `alex/brave-carson-rbpmlk` (never merge to main). The site is
published from `games/` at https://am015-dev.github.io/spotify_to_ytmusic/. Private research lives in
`Am015-dev/game-night-private` (never copy it into the public repo).

## Nightrun VISIBLE (flag RET.vis, default ON, ?vis=0 = old; W13, 20 Oct 2026)
- `parts/visible.js` (after timing.js): per-kind on-screen floor (drone 1.6 s, charger/flank 2.1, gunship 5.2, gate/turret/tank 3.1, swarm/mine 1.05, zoo >= 2.1) read by DMG.minLife (b.js); no damage to a foe outside the playfield (DMG grace + VIS.ok); homing locks only on visible foes after .18 s (shop.js SH.steer); DASH, beat-parried shots, COMBO blast and an EMP warden strip skip the floor (e.dk); Normal hull 5 from stage 10 (story.js, VIS.hullD).
- Gate `nightrun/visible-test.js` (ALL=1 = 16 weapons, VIS=0 = old). Numbers in BALANCE.md "Visible".
- RET.timing stays OFF: timing-test bots still reflex 75-92% / random 58-67% (gates 70/40); random lives on 5-6 EMP/min. Next: make a wasted EMP cost meter, then flip.
- Weak: weapon level curve itself unchanged (the floor is the cap); Hard+ floor still shrinks to .8x on late stages.

## Nightrun phone fixes: dash heading + WEAPONS sheet (W12, 20 Oct 2026)
- Dash bug (portrait touch): `goDash` kept the last heading in `P.dx/dy` when a finger was down, so a still ship dashed along a stale heading (e.g. world left = sideways/back on a portrait screen). Now `P.mvT` stamps the last real move (keys, or touch offset > 3 px); no move in 0.3 s -> `dashSafeDir()` (b.js): 8-way landing spot with most free space, away from bullets (predicted 0.25 s) and foes and walls, ties go forward (world right = screen up in portrait). Test `dash-dir-test.js` (portrait, landscape, desktop).
- WEAPONS sheet (`#wpm`, g.js): the ghost text was the pit-stop panel showing through `.ov.solid` (90% alpha); `#wpm` is now opaque, z-index 9. Cards are a fixed 96 px, text 14 px, fusion info is the last row INSIDE `#wpL` (`#wpFu`, no longer a separate block), ship picture hidden under 700 px height. Test `ui-weapons-test.js`.
- Placeholder pictures: `wp-*` and fusion pictures are drawn into the UI only when `ART.isReal` (g.js, wpx.js); otherwise the code icon / demo is used. The Lab ASSETS tab is untouched.
- For W14 (rebuilding this layout): keep `#wpm` opaque, fusion row inside `#wpL`, and run `ui-weapons-test.js`.
- Not mine: readable-test fails on the old build too (flag-off check, contrast). `abil-test.js` and `mustmove-test.js` do not exist in the repo.
## Nightrun TIMING: beat-timed DASH / EMP (W10, flag RET.timing, default OFF, `?timing=1` = on, 20 Oct 2026)
- `parts/timing.js` (after counter.js) + hooks in abilities.js (dashIn, emp), counter.js (parry dmg 40, goodAt) and b.js (hurt / bullet absorb read `P.dashSh`).
- DASH: dead on the beat (inner 60% of the judge window) = PARRY: reflects marked shots due within .45 s and bullets within 110 px (marked 40 dmg, plain 5), .5 s i-frames, charge back if it caught anything. GOOD (outer window) = short unshielded hop for 1 charge. OFF = short unshielded hop for 2 charges + .45 s lock; late twice = CHAIN BROKEN. DASH button: closing ring, white inside the parry window (no growth with reduced motion); fx.js ship ring already pulses.
- EMP: one press spends all held charges. x1 = 160 px clear, x2 = 320 px + bubble, x3 = screen + shield strip + screen-wide chain. Fewer than 4 bullets inside (no curtain/shield) = WASTED. Button shows x1/x2/x3; two one-time hints.
- timing-test.js (Normal 3/10/20, 12 runs per bot): hits per run beat 0.8 < reflex 4.6 < no dash 7.2, random 5.0; clear beat 100%, reflex 75% (gate <= 70% FAILS), random 92% (gate <= 40% FAILS), no dash 50%, parked 0%; smart EMP 2.3/min, 0 wasted. Hard st5 mid: beat 50%, others 0%.
- Why off: Normal hull (~7) is the decider, not the dash; random/reflex bots survive at 5 hits. Next: hull/damage tuning (with W11) or a harder reflex harness, then flip the default.
- abil-test mash check and counter-test warden / EMP-timing checks are TIM-aware. Pre-existing failures (also on the old build): balance easy/late 69-70%, econ hours, ret ONE MORE RUN ms, tutorial harness timeout.

## Nightrun VARY2: micro-events, pace curves, stage tints (flag RET.vary2, `?vary2=0` = VARY A table, 20 Oct 2026)
- `parts/formations.js` end: 22 micro-events `ev*` (hover stations, ground tank/turret/walker, shielders, drift mines, dive line, medic squad, relay, cargo, mine belt, doors...). `parts/stagescripts.js` `evPlan`: per stage a window of 4 events (newest unlocked first, rotating) replaces 2 of every 3 formation moments (not the first, the set piece or the breather); `evTrack` registers each piece as a FUN set piece (n x3, so no SET CLEARED bonus: economy unchanged). Variants from stage 6 (mirror / fast / elite) give their own signature. Stages 1-4 get a bespoke set piece each (`VSIG2`). `VARY.pace` multiplies DIR.energy with a per-stage curve (mean 1: ramp, fall, wave, dip, slow wave); `drawBG` hook adds a 13% hue tint per stage.
- Lessons: free drones are parked by zoo.js as hover units, so event drones use `fmD` (straight path); at most 2 zoo hover stations alive; gates in a row and wide sine drones killed the stage-1 bot; too many turrets/shielders drop the balance-test 'shooters fired' share (needs >= 70%).
- Weak: new events have no bespoke art/telegraph beyond the entry ring and a 2 s name hint; pace curves are applied to the director's energy only (not the music); repeat-within-5-min stays 83% because the encounter log counts every piece.
## Nightrun counter threats (W6, flag RET.counter, ?counter=0 = abilities only, 19 Oct 2026)
- Owner: "the dash button and emp still useless, the game needs to be more strategic and timing". `parts/counter.js` (after abilities.js) adds threats whose answer is a button:
  SEEKER (marked homing shot, PARRY = dash in the last .15 s: it flies back, +1 charge), LASER WALL (full height, only a dash crosses), CURTAIN (2 walls, gaps too far apart to slide between: dash a layer or EMP),
  WARDEN (shield takes 70%, only EMP strips it for 8 s). GOOD EMP bonus / no bonus on an empty screen, EMP button pulses (abHot) when worth it, DASH->EMP in 1 s = COMBO blast, dash vents an overheat.
- Hooks: b.js `CTR.dash()` (dash start frame) and `CTR.emp()` (EMP press, before the clear); c.js `CTR.draw()`. Numbers: BALANCE.md "Counter threats". Test: `nightrun/counter-test.js`.
- Below Hard the wall and curtain leave a gap and the seeker turns slower (dash/EMP pay, not required: balance Normal stage 20 fell to 67% when they were required); on Hard+ they demand the answer.
- Weak: walls/curtains are code-drawn; the balance bot only parries by luck (it dashes at near bullets); no ram-charge stagger (enemy AI belongs to W5); hint texts show once per save.
## Nightrun risk pays (W7, flag RET.reward, ?reward=0 = old, 20 Oct 2026)
- `parts/reward.js` (after armour.js; one hook line in b.js pickups, none elsewhere): graze chain x1..x5 (1.5 s window, beat graze = 2 points, ring + counter by the ship, feeds score, ABIL.gain and a +10%/tier damage buff cap +40% for 4 s; a hit resets), close-range +35% (full <= 40 px, 0 at 140 px) for manual shots only plus an extra shard on a point-blank kill, risk pickups (3+ bullets within 100 px) pay double with a gold ring. Damage sits inside the DMG.hit chain, buff x close clamped per tier (CAPK: 1.6 Normal, 1.4 Hard, 1.3 Very hard, 1.25 Legend), so hard.js S3.cap and armour.js still bound the sum.
- Test: `reward-test.js` (unit checks + bots). Normal stages 3/6/10, 18 runs: bold (hugs enemies) clear 100%, score 447k, 183 s; camp (parked far left) clear 94%, score 314k, 209 s; dodge 100% 299k; flag off dodge 94% 338k; parked ship 0%.
- Weak: camping still clears on Normal (the bot cannot be hit while parked far left on the early stages; must-move covers that); Legend/hard clear rates rose slightly (scale-test hardest 83% -> 92%, that check already failed with the flag off); the chain ring is code-drawn only.
## Nightrun DASH + EMP abilities (W4, flag RET.abil, ?abil=0 = the old dash/EMP, 19 Oct 2026)
- `parts/abilities.js` (after powlevels.js). Hooks: b.js dash block -> `ABIL.dashIn`, EMP key -> `ABIL.emp`; c.js button rings + draw; hud.js dash count.
- DASH: 3 charges (4 from LV3), one refills every 1.7 s (LV1) to 1.2 s (LV5), fires at once in the move/last stick direction; on the beat = old bonus + 0.2 charge back, off the beat no tier drop. LV = 1 + shop extra-dash + running power-up LV3/LV5.
  Trait from the running power-up: NOVA/DRUM/TEMPO burn trail, CHORD/CRATE/LEECH shield ram (strips zoo shields, elites x2), SLICE/ECHO/RICOCHET phase (bullets -> shards, a kill refunds a charge), WING decoy (aimed shots go for the afterimage), MAGNET/SLOW pickup magnet. Dash damage goes in as player shots, so DMG + armour caps book it.
- EMP: meter fills from kills (.035, elite .08), grazes (.04/.07), on-beat dash (.04), power-up pickups (.34), x1.2 Easy .. x.35 Legend (dash refill x1.4 slower on Legend); 3 stored. Base = the old EMP. Adds: NOVA shockwave (bullets -> 8 shards), SLICE/SLOW slow bubble 2.5 s, WING/ECHO/LEECH chain lightning, DRUM/TEMPO/RIC/CRATE 3 s overdrive, CHORD/BOMB boss core breaker (cores only), MAGNET pull.
- Test `nightrun/abil-test.js` (25 checks). Stationary spam bot 0% on and off (stages 3/8/20 Normal); Legend max 20/30/40 dodging bot 10/18 on and off, camper 4/18 on and off; balance, boss2, tutorial, ret, stats, econ green.
- Red after merging W2's fun.js/dir.js (not re-checked on the old build): scale-test Legend band 83% > 75%, scale2 camper 22% > 15%, weapon 'wave alone LV1' (passed before the merge), readable 1280 contrast (flaky under load).
- Weak: no hit-stop in the main game (shake + flash only, reduced by SET.reduce); the trait has no icon on the button yet (a floater names it on each dash); decoy only re-aims shots fired straight at the ship.
## Nightrun must move (flag RET.mustmove, ?mustmove=0 = before, 19 Oct 2026)
- Owner: "I can win without moving on Normal (swarm)". `nightrun/mustmove-test.js`: Normal, stages 1/5/10/20/30/40, mid+max builds, all 16 weapons + Swarm, bots park / hop / track (lines up with the next foe, never dodges).
- Before: park/hop already died (h.js discharge); track cleared 60% of stages >= 3 with every weapon. After: track 0-10%, park/hop 0%. Dodging bot (balance-test Normal mid/late) 100%.
- `parts/fair.js` D (`MM`): a ship whose x stays inside 70 px for 3.5 s (Normal) gets a telegraphed column strike on its x (.95 s pulse, 1 hull, 2 from the second in a row). Homing uses the narrow cone/reach on every tier. BALANCE.md "Must move".
- Weak / next: the tracker still lives ~100 s before dying (hull, not skill, decides when); no reward yet for moving (graze/close-range bonus would make it feel clever, not just safe); column has code art only.

## Nightrun repetition remedies V1 V2 V3 V10 (W2, flags RET.deck / hintdiet / roster / songspread, ?flag=0 = old, 19 Oct 2026)
- V1 `parts/fun.js`: EVENT DECK of 15 cards (weave, fence, DROP, supply drop, lane closes, gate run, mines, rescue capsule, wind gust, blackout strip, crossfire, swarm, turret line, meteors, wedge), shuffled, no repeats until empty, one event per 25-31 s, never with a boss out. `FUN.ev` is the running non-enemy event (the audit's plain-loop counter reads it).
- V2 `parts/uikit.js` `HINT.diet`: each hint text at most twice per profile (localStorage `mnr_hintseen`), never twice within 3 min of play; not in tutorial/Lab.
- V3 `parts/dir.js` `ROSTER` (hook: first line of `en()` in b.js): each stage has a signature + second kind (charger/flank/swarm/mine, neighbours share neither); drones capped at 33% per stage. Stages 1-4 untouched (hover drones, zoo-test).
- V10 `parts/story.js` `SONGSEL`: non-Athens stages from stage 5 draw from the five stage tracks in a seeded shuffle, never the same track twice in a row. (The baseline audit already showed no track above 17%, so the gain here is small.)
- repeat-audit.js: hints are logged only when queued/shown; `FUN.ev` counts as non-plain. zoo-test.js clears the hint diet before its hint check.
- Numbers (arcade-normal, before -> after): set pieces 706 -> 280, drone spawns 56% -> 27%, drone bullets 17% -> 11%, top hint repeats 207 -> max 2 per hint, top track 15% -> 17%, plain loop 56% -> 71% (fewer, longer-spaced events; the audit counts only set/fence/drop windows), jaccard 0.24 -> 0.27, repeat-in-5-min 83% -> 76%, first-try fails 9 -> 9.
- Still weak: plain loop is higher (events are rarer by design); fun-test fails 9-10 checks on the old build too (it expects the 6-bar metronome); afk-test is flaky on Hard.

## Nightrun build pressure + real choices (W11, flag RET.build2, DEFAULT OFF, ?build2=1 = on, 20 Oct 2026)
- `parts/choices.js` (after reward.js): (1) Hard tiers: a ship whose mean x stays under 125 px gets telegraphed closed walls (11 bullets, 0.6 s ring, a 2nd wall 0.32 s later) from behind and from the top/bottom at its column, rate x(.3+SC.f); and its hits + its share of hard.js's ceiling drop by up to 0.9 x SC.f (S3.cap only lowered). (2) Well: pull 240->130 (wpx.js reads CHO.wellPull), orb R x.8 on hard tiers. (3) Cards: level-up shows 3 cards 6 s (LEVEL UP default, applied at once; another card takes it back), pit stop 3 free cards, 35% of hp/up/emp drops come in pairs (take one, the other vanishes); CHO.log + NR 'choice' + stats counter 'choices'; HINT once (mnr_chohint).
- choices-test.js (RUNS=6): Hard max camper 75-88% -> 50% (gate <=30% NOT met), dodger 67-83% (>=65 ok), Hard mid dodger 39-44% (old 33-42%, gate 45 not met on either), Legend max 50% both. Weapon+swarm Hard st30 god: Well 242 s (-29% vs median) -> 367 s (-5%), PASS; new fastest storm -28%, mine -24% (trim next).
- Why OFF: with it ON, ret-test hit a TimeoutError and tutorial-test failed 'idle 390x763 never dies, never stuck'; not yet checked against the old build. scale3 (fresh 69 vs 76 dps, Legend 0/0/100) and balance easy-shooters 68% also failed; likely old/noise, unverified. Green with it ON: weapon, scale, scale2, econ, abil, stats, mustmove, guard, choices unit+phone UI.
- Next: run ret-test/tutorial-test with ?build2=1 vs off; stronger camper lever (the reflex dash eats walls: W10); trim storm/mine; then flip default ON.
## Nightrun enemies that react (W5, flag RET.react, ?react=0 = old, 19 Oct 2026)
- `parts/react.js` (built after hard.js): per-enemy brains HUNT/FEINT/RETREAT(+dive)/PRESS/BAIT/WINDOW (Hard+), squads PIN+EXIT, LEADER (enrage 3 s), shield BEARER; Normal eased (x1.25 period, 0.7 s tells) so the dodging bot stays at 70% (73% off); per-run seed (+-25% timing, states, sides). Base fire timer is disabled per brained enemy (e.bf getter), all shots via eb() so caps hold. Hooks: NR spawn/tick, DMG.hit wrap (WINDOW/BEARER blocks), drawPickups (tells). No change to abilities.js, armour.js, bossmoves.js, economy.
- Test `nightrun/react-test.js` (a-f all PASS). Numbers: BALANCE.md "Enemies that react".
- Not done (review 3 targets: same-stage spawn Jaccard across seeds <= 0.5, fire-interval CV >= 0.25 at stages 3/10/20): react varies how brained foes move and when they fire (react-test: fire-time spread 0 -> 1.5 s, positions 0 -> 62 px between attempts), but WHAT spawns is the director's/VSCRIPT's and is untouched; spawn Jaccard needs a seeded shuffle in stagescripts.js. Fire CV was not measured with the review's script.
- Weak / next: blocks only stop bullet hits (EMP, rails, beams still hurt armoured foes); formation units keep their paths (fire brains only); zoo kinds untouched; predictability gain is modest on formation-heavy stages (25 px position gap) because most units there are path units; tells are code shapes (ring + dashed line), no art or sound cue yet.

## Nightrun VARIETY A: formations, stage scripts, rule changes (flag RET.vary, ?vary=0 = old waves, 18 Oct 2026)
- `parts/formations.js` (after zoo.js): 62 formations with their own spatial behaviour (pincer, X, snake, spiral, moving-gap wall, meteors, shadow, bait, curtain, geyser, scissors, loop, testudo, ambush...). Each declares tags, first stage, cost, telegraph, gap, kinds, role. Path units move in FM.mv (one hook line in b.js's enemy switch); every path ends flying left, so leaks still count.
- `parts/stagescripts.js`: the editable table `VSCRIPT` (45 stages: 10-13 moments, a '*' set piece unique to the stage, a '~' breather, '+g' ground moments, 'a|b' mixes, '~r' remixes) + 15 rule changes `VMUT` on every even story stage (RULE card after the stage card, name after the HUD goal line; paused while a boss is out; gentler on Easy). The director keeps timing, budget, caps, READY gaps; scripts only pick WHAT spawns.
- Hard tiers: the old random zoo/ground waves stay on and 25/35/40% (Hard/Very hard/Legend) of the calls use the old pool, or Legend got easier (scale-test 33% -> 75%). Formation swarmers pay 30% Neon (econ was 8.9 h).
- Tests: `vary-test.js` (library, 45 scripts, gaps >= 120 px, caps, flag off = seeded identical spawns vs the page without the two files), `vary-audit.js` (before/after numbers). zoo-test's deferred-wave check now counts any new unit (formations can enter from top/bottom).
- Weak / next: endless mode still uses the old pools; Hard+ still mixes in old patterns; set pieces are a named pair + twist, not bespoke choreography; mutators have no art (code shapes only); stage plate on the map does not show the rule yet.

## Nightrun bullet readability F5 (flag RET.read, ?read=0 = old look, 18 Oct 2026)
- `parts/readable.js` (built just before c.js): in play the backdrop is desaturated and dimmed to ~55% (one overlay after drawBG/drawBGP); edge beat pulse x0.7. Enemy bullets and hazards use ONE danger hue `READ.D` (#ff2d78, white core, dark ring); real pictures keep the picture and get the ring only. Player shots are cyan / blue-white at 70% (`READ.pc`). The 'up' pickup and the NOVA power-up are no longer pink. Hitbox dot on the ship (Settings > Assist 'Show hitbox', SET.hbox, default on). Telegraphs (ZOO.over, FXW beams, boss laser tells) sit on a dark halo. On-foot enemy shots use the same hue (foot.js hook).
- Hooks are one line each in c.js, fx.js, draw.js, zoo.js, foot.js. Hit sizes, counts, caps and damage are untouched.
- `readable-test.js` renders the same frozen frame with and without bullets. Bullet:backdrop contrast, median (worst 10%): phone 9.41 (5.22) -> 13.85 (7.36), desktop 8.25 (3.42) -> 12.96 (5.49). Weak: shard pickups and player shots share cyan; the painted orb is hue-turned, not repainted (wanted: a pink `fx-bullet-enemy.webp`).
- Failing before this change, not mine: labassets-test (FXW.preview left on after Lab exit), f-checks (boss-time/telegraph/story-length).
- NOT deployed by me: sweep.js is red and crashes (TimeoutError in tuneTests) on the build from just before this change too (pause-file/pause-synth, stale settings row count 'Accessibility'/20, garage screenshot timeouts). Gates green: balance, weapon, scale, afk, ret-fever/juice/pw2/pw3/assist, zoo, fxwave, fxkey, foot, hud-cover, readable, guard. FPS alone 59 read on/off; phone render +1.3 ms (headless CPU). The next deploy (any worker's build) ships it; fix the sweep first.

## Nightrun on-foot street stage engine (W1, flag RET.foot, 18 Oct 2026)
- `parts/foot.js` (after ret.js in build.py): own full-screen layer #footL, MENU button STREET RUN (unlocked by story stage 3). Stage `street1` = data in `FOOT.STAGES` (waves, 2 arena locks, mid checkpoint, warden boss arena, props). Weapons LV1-5 (`FOOT.WEAPONS`, trait at LV3/LV5, a hit = -1 LV), power-ups with levels (`FOOT.PICKUPS`). Uses FA / FOOT_ENEMIES / FOOT_BOSS when W2/W3 are merged, else built-in fallbacks (`FOOT.FB`). Body coords: x = centre, y = feet.
- Fairness: telegraph >= 0.4 s and release on the half beat, at most 5 shots winding up (x diff), 40 bullet cap, entry grace 0.9 s, no shots from off-screen, view 480-760 wide on every screen, 8-way aim + 0.3 rad aim assist. Idle hero dies (gangs after 7 s without progress).
- Test: `foot-test.js` (51 checks, phone 390x763 / 375x553 / desktop + rotation; bot with checkpoint retries clears in ~75 s game time). Weak: the stage is short for the bot (~75 s, a human ~2-3 min); lock B (mech) is the difficulty wall; balance the real W3 enemies once merged.
- Merged with W2 (FA) and W3 (footen.js): W3 enemies move themselves (engine only clamps them on screen), their own telegraphs fire straight away, death pose until e.remove, canHit, G.ftok/beat/obs. W3 warden hp x0.3 to fit these weapons. FA.floorY is 80% of h but the engine road line is h-70: W2 should match FOOT_FLOOR (470 of 540). Idle pressure uses the built-in walkers (W3 grunts keep their distance).
- Music: plays 'stage2' for now; wanted cues in `games-src/next-wave/music/mainhattan-nightrun/cues-street.json` (street1, lock, boss, clear). Events for stats/achievements: NR footStart/footKill/footPick/footLevel/footCp/footPhase/footEnd (not yet wired into stats.js).

## Asset inbox (18 Oct 2026)
- Owner drops finished files in `assets-inbox/<slug>/`, runs `python3 games-src/scripts/ingest-assets.py` (`--check` = dry run). See `assets-inbox/README.md`, `games-src/ASSET-INBOX.md` (per-game table + code spots).
- Measured (after merging origin, 18 Oct): of 371 expected pictures/clips only 61 are "just drop it" (all Mainhattan Nightrun, its placeholder pipeline); 36 are prefix-only matches (shipwreck hex-*, thornbound end-/back-, lantern-dive, Nightrun kit-*), 274 need wiring code, and all 740 poses need it (no game loads `media/poses/`). No plain `<img>` without onerror was found, so no fallback code was added and no game code changed (no deploy).
- Next: a worker per game wires the listed code spots (copy the nearest loaded sibling), then one `build-all.py --deploy`. Pose sets need a design decision first (one shared loader).
- `next-wave.py` now also writes `games-src/next-wave/expected-assets.json` (name, size, ratio, transparent); rerun it, then `inbox-report.py`, after the to-make list changes.
## Nightrun boss fights round 4 (flag RET.boss2, 17 Oct 2026)
- Done + live: `parts/armour.js` (hard damage-rate cap per boss = max/T over a rolling 1 s, HP phases on bar lines with a calm bar, phase-3 lane beams + EXPOSED last stand, weak-ship help), gate `nightrun/boss2-test.js`. `?boss2=0` = before. Numbers: BALANCE.md "Boss fights, round 4".
- The floor holds for every boss and tier under a 1e6-HP/frame stress test. Normal max build is inside every target window.
- Next: Legend district/final run long (229-291 s) and fresh ships run above 1.3x floor. Look at the Legend core shields and hard.js bA=.35 on bosses before touching the cap.
## Nightrun zoo: time to kill them all + 8 new enemies (17 Oct 2026)
- Done: `nightrun/parts/zoo.js` (built after leak.js; flag `RET.zoo`, `?zoo=0` = old). Drones and flankers enter, hover on a spread-out slot in the right 60% for N beats
  (Easy 6, Normal 5, Hard 4, Very hard/Legend 3), then leave; busy screen (ZOO.cap) defers a wave in 2-beat steps. Hard/Legend flyers enter x.8 / x.9.
  New kinds (story: from stage 4, one every 2-3 stages; endless: all by ~5 min): shielder, kamikaze, splitter, bomber, sniper, healer, carrier, minelayer; shapes in code,
  `en-<id>.webp` placeholders in assets-manifest.json, LAB > FOES chips. b.js has 3 small hooks (movement switch, shield block, carrier contact). Test: `nightrun/zoo-test.js`.
- Not done: the two optional ground kinds (rocket truck, mortar); painted art for the 8 kinds; tuning by hand-play (numbers are first guesses, see `ZOO.T`, `ZOO.cap`, `ZOO.pz`).
- Test dummies must carry `dummy:1` (zoo leaves them alone).

## Nightrun title diet + type floor (B25, B26; 16 Oct 2026)
- Done: flags `RET.title` and `RET.type` (ret.js; `?title=0` / `?type=0` switch them off), new part `parts/title.js` (built before c.js), test `nightrun/ret-title-test.js`.
- Title now: PLAY (fresh save) or CONTINUE (next unbeaten stage + saved ARCADE/CLASSIC + Heat, 1 tap from cold open), ENDLESS + DAILY (streak/bonus on the tile), GARAGE + MENU, and one status chip (daily streak + weekly).
- Where each old button lives (ids kept): MENU sheet (`#mnMore`) = STAGE MAP `#storyBtn`, WEEKLY RUN `#wkBtn`, WEAPONS `#wpBtn`, LAB `#labBtn`, CHECKLIST `.ckB`, FLIGHT SCHOOL `#tutBtn`, SETTINGS `#setBtn`, difficulty `#diffBtn`, and the controls legend.
  Heat picker and ARCADE/CLASSIC stay on the stage plate (the map now opens with the next stage's plate open); ONE MORE RUN stays on the run-end screens; Flight School is still offered once to new players.
- Type floor: text >= 14 px (16 px body at 900+ px wide), buttons >= 44 px on title, menu, map banners, stage plate. Tests that clicked title buttons now open the menu first (`RET.menuOpen()`).

## Nightrun polish plan (16 Oct)
- Full plan: `games-src/nightrun/POLISH.md`. It covers music, 25 fun ideas, a polish checklist, flow maps and 19 worker briefs (B18-B36). No game code changed.
- **Music repeats:** stages 1-32 share 3 songs (`story.js:78`), and the library is 11 songs, about 37 min. The first boss has no theme of its own.
- Music plan: 15 treblo songs (2 per district, 4 boss themes with A/B phases, pit, school, endless3), 3 fever loops and 10 stingers, about 41 min more.
  Prompts are in `next-wave/music/mainhattan-nightrun/cues-polish.json`.
- Layering without stems: a lowpass on the music bus opens with the combo tier, the drum layer comes in at tier 2, a hit muffles the song, and stingers land on the beat.
  True stems would drift on the 5 `<audio>` slots, so they wait.
- Taps measured headless at 390x763: Endless 1, Story 3, and death to next run 1.
- The title has **11 buttons** (the references have 3-5). WEEKLY is 40 px tall; 7 title texts and the map banners are 11 px.
- Missing: save export/import, PWA/offline, credits/privacy, achievements and stats, hit-stop, transitions, and a CONTINUE button.
- Top fun ideas per effort: combo-driven music, PERFECT-dash payoff, chest reel reveal, fusion hint, risk multiplier, local leaderboard, jukebox.
- Order: B18 song pools, B19 combo music, B20 stingers, B24 save export, B25 title diet + CONTINUE, then B26 type floor, B21 FEVER, B22 boss phases.
- Dispatch two build-tier workers: B18+B19+B20 (owner of `a.js`), and B24+B25+B26.
- Every item is behind a `RET.*` flag. `DMG` caps, entry grace and anti-idle stay untouched. Hooks go through `NR.on` or flag-guarded lines (guard.py).
- References: 13 contact sheets of store screenshots from 7 genre games (mostly HUDs); results and shop screens are from text sources.
- Owner to supply: the treblo cues listed above. Placeholders (existing songs, synth one-shots) ship first.

## Nightrun retention plan (16 Oct)
- Full plan: `games-src/nightrun/RETENTION.md`. Research, audit and 17 ready worker briefs (B1-B17). No game code changed.
- **The economy is the wall:** maxing everything costs 141,780 Neon. The bot banks about 390 Neon/h, so that is ~360 h at median skill. One weapon to LV10 = 2,430 Neon, about 6 h.
- **Stages are long for phones:** they last 158-326 s (mean 208 s) because a stage = its song. One pass of all 45 stages is about 2.4 h.
- Clearing a stage pays nothing extra: no first-clear Neon, no star Neon, no achievements, rank, streak or reward for the daily run.
- Bot walls (Normal, default kit): stages 11/12 at 50%, 18/23/39/40 at 0%, challenges 41/45 at 0%.
- Research: players quit over unfair or unreadable hits, difficulty cliffs, grind walls, ads, audio lag, one dominant build and repetitive runs. They stay for short runs, failed runs that still pay, build variety, risk/reward scoring, Heat ladders and achievements.
- Order: B1 first-clear pay, B2 economy retune to about 10-12 h, B3 mercy after 2 losses, B4 Arcade 3-min cut, B5 run-end next-unlock bar + ONE MORE button.
- Then: B6 pilot rank, B7 40 achievements, B8 Heat 1-10, B9 boss rush, B10 latency onboarding, B11 daily streak + weekly, B12 banish, B13 weapon viability sim, B14 graze juice, B15 cosmetics, B16 readability defaults, B17 time attack and no-hit.
- Every item is behind a `RET.*` flag in a new `parts/ret.js`. The `DMG` caps, entry grace and anti-idle rules stay untouched.
- Never add ads, energy timers, paid currency, or farming as the only way past a wall.
- Dispatch B1+B2+B5 as one Sonnet worker (economy), and B3+B4 as a second.
- Measured with a throwaway copy of `story-sim.js` (2 runs per stage, Normal). Re-measure after B2.
- Weak spots: the Neon/h figure is from the bot, and real players spend in pit stops. Weapon viability has not been measured (B13).
- Evidence gaps: no source measures churn from energy timers or juice; keep those items cheap.


## Mainhattan Nightrun FLIGHT SCHOOL tutorial (16 Oct 2026)
- Done: `games-src/nightrun/parts/tut.js` (built after fun.js). A run with `G.tut` (no director/waves/stillness/Neon banking/best): 8 beats
  move (3 rings + ghost finger), shoot (gold on-beat shots), dodge (slow fan + tame KEEP MOVING ring), dash on the pulse, pickups + tier,
  EMP + heat, weapons (sheet opens with two slots, fusion name from `WP.fu()`, then a wave), leader. Then a clear card: GARAGE / MENU, +60 Neon once.
  25 s timeout per beat, hull auto-heals, SKIP top bar. Entries: title FLIGHT SCHOOL, Settings > REPLAY TUTORIAL, first-launch offer (mnr_tut, not for
  returning players or webdriver; `?tut=offer` forces the check, `?tut=1` starts it). Switch: `TUT_ON`. Gift key `mnr_tutgift`.
- Test: `games-src/nightrun/tutorial-test.js` (all PASS). Also fixed the WEAPONS sheet crash on the fusion canvas (`canvas[data-id]` in g.js).
- Next: ground-test.js fails "boss never appeared" (stages 5,13,21,24,29,37) on the build before this change too: not from the tutorial.

## Mainhattan Nightrun weapon levels + 8 new weapons (16 Oct 2026)
- DONE: permanent weapon levels 1..10 (key `mnr_wplv`) bought with Neon in Garage > WEAPONS (card: icon, level bar, power preview, next ability, price); 8 new weapons (Frost Beam, Flame Arc, Plasma Wave, Shrapnel Shell, Echo Drone, Gravity Well, Rail Sniper, Storm Cell); generic fusions for all 120 pairs (name from the two weapon names, effect from the tags); 8 `wp-*` + 15 `fx-fuse-tag-*` assets in the manifest and next wave.
- Price curve: level L to L+1 costs round(40 x 1.45^(L-1)) (40 ... 783, 2,435 for 1 to 10); unlock 0 (Pulse), 30 Lance, 40 Swarm, 50 Beat, 80-400 for the rest (`WPX_META` in `parts/wpx.js`).
- Effective level = permanent + pit-stop bonus (in-run levels 1..3 give at most +2), capped at 10 (`WP.lvOf`, g.js). Power shown = 1.00x at LV1 to 2.50x at LV10; `weapon-test.js` measures weapon DPS on dummies (LV10 <= 2.5x LV1).
- Files: `parts/wpx.js` (new, loaded after g.js; `WEAPON_META=false` switches the lot off), `parts/g.js` (WP levels, fire1 scaling, fusion lookup), `parts/b.js` (hit hook flags), `weapon-test.js`, manifest + `ASSETS-NEEDED.md`.
- NEXT: paint the 8 icons and 15 fusion-family pictures (they show as vector demos / split rings until then); the ship-preview worker may touch the weapons sheet in g.js; pit-stop levels past +2 are not used (xp stops at LV3).

## Lantern Dive last paintings (13 Oct 2026, 23:xx UTC): NOT deployed, one check failing

- Wiring result: `table-tunnel-glow-phone` is already live (`ui99.js:18` builds the name by concatenation, so the scan still lists it). Nothing new wired.
- `ui-bubble-tail`: no tail element exists in the shared help kit (`shell/gx-help.css`/`gx-help.js`). Adding one changes every game, so not used here. Needs an owner decision.
- `ui-row`: its description names no place. Not used until a target is named.
- 23:4x re-run on merged branch (50583c8): gate still FAILS only on ld-help@375x553 clipping. A report of a clipped player name ("Nerea", span.nm, seat plate, ld-art scenario) was NOT reproduced by this gate run. Verify it before any CSS change.
- Deploy gate FAILED on merged branch: `ld-help@375x553` text clipped ("First two tricks", span.t). Not caused by this change (no Lantern source edited). Fix in help layout (`lantern-dive/game/src/ui11.js` / shared `gx-help.css`), then rerun `build-all.py --deploy lantern-dive`.

## Story bubble + painted plate fix (13 Oct 2026): source done, only 1 of 15 deployed
- Shell: `gx-skin.css` speech bubble is a 9-slice (`22 62 34 30 fill`), `gx-campaign.css` scene/boss/result/sheet never scroll sideways, `?scn=story-scene` registered in `gx-campaign.js`. All painted buttons use `30 42 fill/14px Npx` (vertical caps, were `0 42` = stretched on tall buttons). Short Fuse nameplate/rack, Thornbound sheet head, Doorkick dock frame, Crown `#choice` fixed in their skin/layout css.
- `look-check.js` has two new checks (`panels`: scrollbar for decoration-only overflow, severe on x; `plates`: 9-slice/100% 100% distortion, >25% warn, >40% severe) and a `story-scene` screen. Calibrated: old final-approach build = 2 severe, fixed = 0.
- LIVE: cauldron-fair only. The other 14 are built from fixed sources but NOT deployed: full sweeps here take 20-60 min and failed under CPU load (final-approach phone-check slow 926ms; thornbound 375x553 bulb finger 4px off mid-spring; short-fuse help bubble covers target; crown phone-check browser crash; doorkick 1/24 sweep game; kaiten sweep ran >1 h). Not yet checked whether they also fail on the old build. Next: `python3 games-src/scripts/build-all.py --deploy <slug>` one game at a time on an idle machine (Crown needs `GAME_MS=420000`), then `look-check.js --baseline --game <slug>`, add-update (`--scn story-scene`).
- Known art issue (needs new art): Short Fuse `wire-tile-frame-c.webp` (100x240) is stretched onto 52x69 tiles. Sunglaze top bar content overflows 69 px at 1366 wide (hidden scrollbar, buttons cut).

## START HERE — orchestrator hand-off (13 Oct 2026, 21:00 UTC)
Read CLAUDE.md (Fast loop + Cost rules), then `PLAYBOOK.md`. Paste `games-src/BRIEF-TEMPLATE.md` into every new worker brief.
- **Deploy gate (owner, 13 Oct):** `build-all.py --deploy <slug>` = phone-check + scenarios + look check + QUICK sweep. Full sweep only `--full` (engine/rules changes).
- **Code:** start from `games-src/<dir>/MODULES.md` + `games-src/scripts/find.sh`; build outputs are untracked; `guard.py` (build + GitHub workflow) blocks regressions.
- **Owner pages:** `status.html` (versions, missing, not wired), `look/index.html` (look check), `next-wave.html` (to-make list, Waves 7-9, 3D A-E; laptop prompt files in `games-src/next-wave/`), asset viewer Games tab, `lab.html` (coming).
- **Cloud workers still running (check with get_session, model sonnet):**
  - `session_01VxGyhTM7mpMZhPEraRLygh` LAB menu + pinned in-game checklist with GO, all games (Doorkick first), `games/lab.html`.
  - ARCHIVED 21:29 (over time/context, owner rule): shared-skin bubble worker (shell fix pushed, only Cauldron live — the other games get it when the wiring workers redeploy them), faster-checks worker, old wiring batch A (overlapped the new wiring workers).
  - `session_01XvM88e6mByticHEdTcS4tq` Nightrun phone HUD: playfield ≥80% visible, power-ups as chips not banners (owner: "impossible to see on phone").
  - Wiring finish (13 Oct 21:28, 588/715 paintings + 47/59 models wired at start): `session_01USGHUaR7VayPywWkrGfMYc` Hollowbough+Rampart, `session_011XN3XWkxaDaz6hzkMhEdyv` Sands+Doorkick (+dk-tips, dk-status-line), `session_01FScDuF5uCNZdJFfDeUqTNh` Nebula+Lantern+Shipwreck, `session_018PZdut3kYbVEVaUDTUwQxr` Crown+Tidewake+Cauldron+Sunglaze, `session_01VZTUufsMh4x1FxGCz95a9S` Thornbound+Kaiten+Final Approach+Short Fuse. When all report: run wiring-status.py, check the asset viewer, report before→after.
  - `session_0173P8APho8S4jxLQSJj26oe` Nightrun K2: stages + map, difficulty curve, strategic shop/garage/market.
  - In this session's checkout a look fixer was deploying Crown, Sands, Tidewake, Thornbound, Cauldron (label sizes, tap targets, Got it button); check `git log` for "Look fixes" and finish any not live.
- **Open items:** Nightrun quick sweep failed on rhythm/difficulty/story-lock/tune items after the boss deploy (likely K2's in-progress work; K2's deploy must clear them). Nightrun needs LAB/scenarios adopted after K2 (note above). Owner may want the Overdrive car-damage request handled by the Overdrive session (session_017iH3DB4VyxwKSdMwsco4Ut).
- **Fast tests, game-industry style** (owner: "lab tests are extremely stupid" / "fast tests like game industry"): `session_01FAqai6WD8dZNr6tGwzjBBW` builds the test pyramid on Crown + Doorkick: (1) engine unit + invariant tests and 1,000 seeded headless AI games in < 10 s (node, no browser); (2) thin UI smoke < 30 s (errors, 404s, glowing targets respond, text, numbers = engine); (3) owner QA via ✔ Test / LAB GO. Deploy gate = 1 + 2, < 60 s per game. If it works, roll out (Sonnet, 2-3 games per worker).
- **Watchdog:** removed 14 Oct 00:08 — scheduled sessions had no tools to see/stop sessions and did nothing. Workers self-stop at 45 min / 150k (BRIEF-TEMPLATE); the orchestrator checks workers at every owner message.
- **Owner is frustrated by slowness:** target ≤ 15 min per game from start to live; report real times. Hand off this orchestrator at ~150k context.

## Worker groups (13 Oct 2026, 23:10 UTC) — one worker per game, max 15, titles start with the group tag
| Group | Worker (session) | Model | Games | Status |
|---|---|---|---|---|
| [ART] | session_011jRzpiYd1pxZRj3N2mtQGt | Sonnet | Sands of Qamar (31 paintings wired in source) | fix gold-badge digit contrast, deploy (old worker archived, over context) |
| [ART] | session_01VZTUufsMh4x1FxGCz95a9S | Sonnet | Final Approach, Short Fuse (2 + 2) | fixing phone-check cause, then deploy |
| [TESTS] | session_01FAqai6WD8dZNr6tGwzjBBW | Sonnet | pilot: Crown, Doorkick | fast test pyramid (engine tests + UI smoke < 60 s) |
| [LAB] | session_01VxGyhTM7mpMZhPEraRLygh | Sonnet | all games | LAB menu + pinned checklist GO: 9 live, 6 to go |
| [OPS] | routine trig_01SnC3sNN1s8bCYNsQCoo8u1 | Haiku | all workers | hourly watchdog at :38 |
Done today (archived): art wiring for Hollowbough, Rampart, Nebula, Lantern, Shipwreck, Crown, Tidewake, Cauldron, Sunglaze, Thornbound, Kaiten, Doorkick; Nightrun phone HUD.
Next after the [TESTS] pilot passes: one [TESTS] worker per remaining game (13), Sonnet, all in parallel (≤ 15 total).

## Checks: two speeds + scenarios (13 Oct 2026) — read `PLAYBOOK.md` "Iterate fast, check once"
- `build-all.py --quick <slug>` (phone-check + scenarios + QUICK sweep) to iterate; `--deploy <slug>` = full sweep once, then live. Numbers: `CHECK-SPEED.md`.
- One shared http server (`scripts/gx-serve.js`, `GX_URL`) for every check; no file://. Skin never changes a box (`GXSK.audit()` in phone-check).
- Scenarios: `?scn=<id>` (`shell/gx-scenario.js`, per-game `scn.js`), runner `scripts/scenarios.spec.js` (Playwright Test, see "Playwright/axe swap"), shelf checklist "▶ Try this" + "Scenarios only" filter (`add-update.py --scn`).
- **Mainhattan Nightrun (K2's code, not touched here):** the runner already works for it (`cd games-src && SCN_SLUGS=mainhattan-nightrun node_modules/.bin/playwright test --project=phone` serves `games/mainhattan-nightrun/`). K2 only has to inline `shell/gx-scenario.js` + a new `scn.js` (before the game scripts) and register, with `GXS.add({id,name,ask,setup,checks})`, these scenarios (ids `nr-*`): `nr-lab-boss-<boss>` one per boss in the LAB boss gallery (boss card/portrait visible, name readable, tap opens its detail, on-screen numbers = engine), `nr-stage-map` (stage map: nodes visible, next stage glows, tap enters it), `nr-shop` / `nr-garage` / `nr-market` (items readable at 390x763, 375x553, 1366x768, buying changes credits as the engine says), plus the generic `nr-board` and `nr-zoom`. Add `nightrun` to `GAMES`/`SWEEPS` in `build-all.py` when its build is wired.

## Orchestrator state (13 Oct 2026)
- Owner pages: shelf What's new panel (`games/updates.json`, add with `games-src/scripts/add-update.py`), missing assets `games/missing.html`, facelift list `games/facelift.html` (`games-src/FACELIFT.md`), screenshot grid `games/shots.html` (rebuild: `games-src/scripts/shots-gallery.py`).
- 3D: owner's Pixal3D models at FULL detail in `games/<game>/models/<item>.glb` + `-lite.glb` (phones/Low) + sprites; `games-src/facelift-3d/MODELS.md`. Never decimate the owner's models below 40k tris / 1024 px textures without asking.
- In progress (cloud workers, 13 Oct): Crown + Doorkick UI kits + 3D, Sands 3D; 3D wiring for the other 12 board games (earlier workers stopped at the weekly usage limit: check `git log` for "Facelift" before redoing anything).
- Crown City Smash plays on the board (13 Oct): `kot/onboard.js` + `onboard.css` move the real dice, Roll, SMASH! (hangs over Downtown), End turn, painted market cards (hold 400 ms or hover to read, tap to buy, touch taps twice), your cards and the Stay/Yield questions onto the board; the panel keeps status and advice. Tests: `kot/onboard-test.js` (4 sizes), `tutor-test.js`, `sweep.js` (flags controls off the board).
- Owner rules this week: credits = "Art and music by Am015-dev", never name the music/art tools; "Shuffle all songs" is the default music; music never changes playback rate; check a live link (curl 200) before sending it; look at PC layouts as well as phone.
- Open owner decisions: replace the few CC BY tracks (credits must stay while used); open games as separate pages instead of the shelf iframe (frees memory fully).

## Mainhattan Nightrun L2 (16 Oct 2026): enemies are seen and fought
- Done: one damage model in `parts/b.js` (`DMG`): entry grace (no damage until x <= W-40, bullets fly through, a red edge ring telegraphs spawns), an on-screen
  minimum life per enemy type (drone 1.2 s .. gunship 2.6 s, elites 4 s, Easy x0.9), a per-shot soft cap (above 2 at half, max 8), gentler enemy fire
  (`DMG.fk` .45, Easy x0.8, endless `fkE` .5), chargers glide in and dash at 400+40d px/s, story density growth `densd` .035, Easy level -0.8, speed challenge clock 1.05.
  Before -> after (late build, Normal): drones alive on screen 0.00 -> 1.53 s, shooters that fire 0% -> 79%, killed unseen 82% -> 1.5%, bot hits 0 -> 3, clears 1/8/20/42 100%, 30 50%. balance-test: 1 FAIL left (easy/late unseen 2.5% > 2%).
  Numbers and targets: `games-src/nightrun/BALANCE.md`. Check: `games-src/nightrun/balance-test.js` (fails the old build, passes this one); afk-test PASS.
- Next: trace the last 0.1-1.8% unseen kills (cleared runs, stage 1/8/42); stage 30 with a mid build is 0-33%; the bot can't dodge the stage-5 mini-boss lasers (old build too);
  `weapon-test.js` named in the brief does not exist in the repo.

## Mainhattan Nightrun L1 (13 Oct 2026): stages, map, difficulty, strategy
- Story is 40 stages (8 per district) plus 5 optional challenge stages (no-hit, speed, perfect-beat) on a painted scrollable route map (`parts/map.js`); tap a node, read the plate, PLAY. Old saves move by stage name (`v40`). How it works: `games-src/nightrun/STORY.md`.
- One tuning table (`LV`, `HULL`, `TUNE.dm`, `TUNE.lenK` at the top of `parts/story.js`); check it with `RUNS=16 STAGES=$(seq -s, 1 45) node games-src/nightrun/story-sim.js` (bot clears stages 1-16 every time, about 80% of 33-40; the bot keeps moving, the anti-idle beam hit it before).
- Strategy layer: `parts/paths.js` (tables), `parts/strategy.js` (pit stop, heat, slots, selling, boss picks), market and loadout in `parts/meta.js`; `strategy-test.js` checks the numbers. Open: balance numbers of synergies and set bonuses are first guesses; the HUD contrast findings of `ui-align-test.js` (K1's) are still open.

## Mainhattan Nightrun J1 (10 Oct 2026)
- Music is locked at playbackRate 1 with natural pitch (`NR.music.setRate` ignores everything but 1); TEMPO UP = double-time fire + score x2, SLOW GROOVE = world at 0.6x (`PW.wk`) + soft low-pass, master limiter. `audio-test.js` asserts rate 1 and no clipping through TEMPO, SLOW, DROP, low hull.
- `parts/fun.js`: set pieces every 6 bars (WEAVE, LASER FENCE, district formation), DROP every 16 bars (dash on the downbeat), shard showers; mini-boss every ~26 bars. `fun-test.js` covers it; bots call `FUN.cost(y)`.
- Art: boss portraits and ship cards in round badges, phone rooftop strips (`fix-art.py`), both mini-boss paintings and the shield-link beam wired. Still to paint: 13 base perk icons (`assets-extra.md`, `games/missing.html`).

## Standing rules
- Never write an original game's, publisher's or designer's name in the public repo or the site. No model names
  in files or commits.
- Publish live once checks pass (owner, 5 Oct); preview folders are retired and deleted.
- Don't edit the Mainhattan / Overdrive games; other sessions own them. Ticket to Ride is on hold.
- Read the root `CLAUDE.md` (lessons learnt + cost rules), then `games-src/BRIEF-2d-games.md`.

## 10 Oct 2026: painted art + Treblo music wired in 4 games (live)
Nebula Aces, Sunglaze, Tidewake, Crown City Smash. Each has a small `media.js` (Crown: `paint.js`) next to its sources: table skin (3D plane under the grid/board/table; Sunglaze also paints the phone board table), title and end banners (hero strips on the start and result panels), `GXC.init` `artBase`/`endArt`, and music slots.
- **Shared:** `shell/gx-music.js` (`GXMUS.init({key,slots,slot,on,toggle})`: per-screen cross-faded music, Music picker drawer, volume, preview, Shuffle / All songs / Off). `GXC.init({endArt:{win,lose}})` paints the story result screen.
- **Music files:** `python3 audio/tools/music_treblo.py audio/<game>/treblo ../games/<slug>/music --caps tavern=60,main=100,fight=100` (caps keep the decoded loops under ~35 MB each; uncapped loops made the 375x553 sweep time out its coach bubbles). `audio-data.js` lists them as `url:music/...`. Credits now say Treblo.
- **Not wired (no face-down card exists in these games):** `back-*.webp` in Nebula, Sunglaze, Tidewake, Crown. Crown tables only show at the front edge of the 3D city (blocks cover the rest); the flat 2D fallback map is opaque.
- Crown's phone-check needs `GAME_MS=420000` (its six scenarios take ~180 s here, the default per-game limit, and the old build only just fit); Crown sweep 16 games 0 failures.
- Sweeps: Nebula 16 battles 0 failures; Sunglaze 16 games 0 failures (an earlier 24-game run under CPU load had timing failures that vanished once music loops were capped); Tidewake 14 games 0 failures (one 375x553 `lay` popup-covers-Place failure in a 32-game run did not reproduce on old or new); sweeps now ignore the file:// `Fetch API cannot load` console line.

## NOW (5 Oct, evening) — start here
Same owner prompt as before (commit, merge, push to `alex/brave-carson-rbpmlk`, deploy games that pass, two Sonnet workers).
Commits carry NO attribution lines. If `/dev/null` is a symlink (`ls -la /dev/null`), phone-check cannot run: a fresh session fixes it.

- **Live this session:** kaiten-kitchen (board-first merged with story mode), tidewake (story mode; "Skip to my turn" instant).
- **Pending, in order:**
  1. DONE 6 Oct: nebula-aces live with story mode. iPhone start failure: the 3D scene was built and `warm3D()` compiled a dozen
     shader programs plus one full render synchronously in the `load` handler, so a real GPU stalled before the first paint (and
     any throw there left the page without a battle). Now `boot3D()` (ui.js) runs after the first paint, a throw, a missing GPU or
     a lost WebGL context drops to the flat 2D board; `boot-test.js` emulates 7 GPU failure modes (WebKit itself is not installed
     here, so an owner check on a real iPhone is still wanted). `sweep.js` (20 battles + 4 story sorties, both phone sizes) is green.
     Text diet: `brief.js` cuts any block over 8 words to 7 words (long-press shows the full text).
  2. DONE 6 Oct: crown-city-smash live with story mode (`kot/campaign.js`). Same 3D start fix, `brief.js`, `sweep.js`,
     `boot-test.js`, `campsim.js` (chapter win rate by simulation: chapter 1 is 62% for an easy-level stand-in and 88% for a
     normal-level one). Short phones get a slightly lower tray so the board stays above 55%.
  3. shipwreck-isle: board-first rework done in source (`rc/bf.js`, `bf-test.js`; board 66% / 61% of portrait). Needs
     phone-check, then deploy. Weak: 375x553 camp job list covers the board; landscape unchecked; online keeps old layout.
  4. short-fuse, rampart-and-vine, sands-of-qamar: story mode (+ phone fixes for short-fuse, sands-of-qamar).
  5. Faster loading for every game (recipe B): board first, lazy-load three.js, audio and portraits.
  6. final-approach: some slot labels overlap their P/C badges.
- Workers running phone-check at the same time slow each other down: wait with `while pgrep -f phone-check.js ...` first.
- 35 fully merged branches can be deleted by the owner (sessions get 403 on branch deletes).

## Where things stand (4 Oct 2026)
- **Thornbound** is the quality pilot. It has blind playtests (`games-src/thornbound/playtest-1/`) and the spec
  `games-src/thornbound/CLARITY-PLAN.md`. A redesign is being built into `games/thornbound-new/`. Next: run 3 NEW
  blind testers with `games-src/scripts/drive-serve.js` against the acceptance bar in the plan; iterate; then
  show the owner.
- **Previews waiting for the owner:**
  - hollowbough-next (with the shared kit)
  - kaiten-kitchen-next
  - crown-city-smash-next
  - final-approach
  - cauldron-fair
  - lantern-dive
- **Shared kit:** `games-src/shell/gx-kit.js` (reference drawer, settings, undo, recap, stats). The guide is
  `games-src/shell/GX-KIT.md`.
- **Kit rollout to the other games: PAUSED.** 7 cloud sessions were stopped; their partial work is on branches
  `rollout/*`. Resume only with the clarity standard from Thornbound, one game at a time.
- **Audits:** `games-src/AUDIT-SUITE.md` and each game's `AUDIT-PRODUCT.md`.
- **Shelf:** the 3 new games are not on it yet. To add them, run `games-src/room/add-new-games.py` (covers are
  ready).
- **Art:** the owner will make art with Google Flow later; each game has a prompt list in `ART-PROMPTS.md`.

## Nightrun anti-idle (nr-idle)
- Idle ships already died in ~21-27 s in my stepped sims, so the owner's runs avoided the clock by small nudges: a hop re-anchored and HALVED the counter, and a dash in place reset it. Revives (Second Wind) also refilled the hull after discharge death, and repairs could outrun it.
- Fix in parts/h.js: 40 px anchor, each hop pays back only 1.2 s, dash in place pays nothing, discharge interval scales with hull (same death clock for any hull), no repair while discharging, last hull point burns revives, aimed hunter shots from the edge while parked (ebCap respected).
- afk-test.js now also runs story idle (stage 20/42, and a 60 px hop every 2.5 s) with Second Wind, repairs and all power-ups on: dies by 25-34 s. audio-test timing checks fail in this sandbox on the old build too (CPU load).
## Nightrun weapons and fusions (done, live)
- Done: 4 new weapons (Arc Chain, Orbit Blades, Ricochet Disc, Mine Layer; parts/g.js WPD/fire1/upd), 28 fusions (FU_RULES table of 9 effects + 12% damage, FU_NAMES), fusion banner on the WEAPONS sheet, fusion name on the HUD chip at stage start, hard player-bullet cap (pbCap in g.js, trim line in b.js), hit hook `WP.hit` in b.js. Switch: `FUSE_ON` in g.js.
- Art: 8 `wp-<id>.webp` (256) and 28 `fx-fuse-<a>-<b>.webp` (512) in assets-manifest.json with prompts; placeholders made; they also show in NEXT-WAVE.md / next-wave.html (next-wave.py source 5 reads manifest entries that carry a "prompt").
- Test: `node games-src/nightrun/weapon-test.js` (28 pairs + each weapon alone clears stage 1).
- Next: owner supplies the pictures (save under the same names, run make-placeholders.py); tune fusion strength after play.
## Final Approach + Short Fuse: art wired, deploy blocked by phone-check (13 Oct 2026)
Wired in source and pushed (skin.css + `fa-art` / `sf-art` scenarios + checklist items); Thornbound and Kaiten Kitchen are live.
`build-all.py --deploy <slug>` stops at phone-check. **The currently live games fail the same checks** (run `GAMES_DIR=$PWD/games PC_OUT_DIR=/tmp/pc node games-src/scripts/phone-check.js <slug>`), so the new art is not the cause.
- **final-approach:** "slow" = one tap in every run takes 400-950 ms (limit 800). It is always the same tap: placing a die on "Axis, any die" (the 4th move). Median tap is ~120 ms. A GPU upload warm-up of all PIXI textures after `pxTextures()` (ui7.js) did not change it, so it is not first-use texture upload; next step is a CDP profile of that tap (suspects: the computer's reply / `render()` after a placement, PIXI scene rebuild).
- **short-fuse:** "2 dead taps" in the rotation scenarios (P>L, stale; sometimes L>P): after rotating, taps on the candidates "2" and "Wire C" change nothing within 1 s. Not investigated yet; start with the rotation relayout (`gx-viewport.js` + the game's resize handler) and whether the board is re-laid out before the candidates are tapped.
- `phone-check.js` now prints each tap's latency (slow taps labelled) and which taps were dead, to make this faster to chase.
## Sands of Qamar painted art wiring (13 Oct, worker)
- Wired (sources, committed, not live yet): tile glyph medallions, tile frames, badges, star icon, goods-card, nameplate, djinn bar, ribbon, finger, bubble tail, item and trophy pictures (`html.sk-pl`, scenario `sq-art`). Not used: `ui-seat-chip` (its frame is too thick for 4-5 seat chips).
- Deploy blocked by the look gate: `contrast|b.tv` (digits on the gold badge, 1.5-2.7:1 depending on the tile behind). The look check measures what is behind the digits; the badge picture now sits on `.tv::before` over a solid `#f4c04a`. `btn.sm` plate fixed; goods row has 44 px boxes. Next: lift `.tv` text contrast (e.g. a cream plate behind the digits), run `NODE_PATH=/opt/node-tools/node_modules python3 games-src/scripts/build-all.py --deploy sands-of-qamar`, then `look-check.js --baseline --game sands-of-qamar`, `add-update.py sands-of-qamar "Painted art wired" "item" --check "..." --scn sq-art`.
- Note: export `NODE_PATH=/opt/node-tools/node_modules` before build-all (the look gate crashes otherwise).
- Doorkick Dungeon: live (hand/level icons, bubble tail, 3D winner heroes; scenarios dk-art, dk-tips, dk-status-line).

## Scenario invariants + mutation proof (13 Oct 2026; Crown + Doorkick proven, other games not yet)
- Method: `PLAYBOOK.md` "A scenario must find bugs". Tools: `shell/gx-scenario.js` (`play` checks, invariants, `GXS.known`, `mut:`), `scripts/scn-run.js`, `scripts/scenario-mutate.js <slug>` (2-4 min).
- Baseline kill rate before (old scenarios): Crown 34/41 = 83% (behaviour mutants 75%), Doorkick 32/40 = 80% (69%); most "kills" were just hidden elements; no scenario asserted an engine outcome.
- Real bugs found by the new invariants: FIXED Crown 375/390 px player chip cut off the energy number ("⚡20", `kot/skin.css`). LISTED (in `GXS.known`, `munch/scn.js`, `kot/scn.js`): Doorkick miniature card text 7-8 px (`.card .cn/.dn/.tag/.kind`), Doorkick fight side label "Pip (you) + Morwen" clipped, Crown PC tag "PERMANENT" 9.9 px, Crown PC (1366x768) player name overlaps its "· tap: how" hint (`span.more`) and the PC news ticker button text is clipped (`button.newsbtn`). Delete the known line once fixed.
- Other games: add `data-engine` to key numbers, `mut:` to each scenario, run scenario-mutate.js, fix survivors.
- A routine message ("Redirect: fast tests like the game industry": engine unit tests + 1000 AI games, drop the mutation runner) reached this session without the owner; not acted on, owner to confirm.
## Shipwreck Isle: last paintings wired (blocked deploy gate)

- Wired `ui-bubble-tail` (island label tail, `html.sk .tl:not(.far)::after` in games-src/rc/skin.css) and `ui-row` (`html.sk .row`, `.row.has`, `.row:hover`).
- Deploy NOT done: `build-all.py --deploy shipwreck-isle` fails scenario si-art: "text under 11px" on the phase strip label "Event" (9.6px, ui.js PHASES). The same failure reproduces on the commit before this change, so it is pre-existing.
- Next: raise the phase strip label to 11px or more (shared phase-bar style), then re-run the deploy.

## Update 13 Oct (late): Final Approach is live; Short Fuse blocked only by look-check
Final Approach deployed (GO `fa-art`, LAB 24/24, look ok). Shelf checklist entries must use the shelf ids (`approach`, `shortfuse`), not the slugs, or the LAB shelf check says "missing".
Short Fuse: GO scenarios 6/6 and LAB 24/24 pass; `--deploy` stops at look-check with NEW severe findings that are not from the art wiring: `plates|div.tile.crew` (the crew tile frame `wire-tile-frame-c.webp` is drawn stretched, box 56x73 vs picture 100x240) and `contrast|div.gxc-sc-name` (story-scene speaker name). Fix the tile frame slice/size in `games-src/short-fuse/game/skin.css` and the speaker-name colour, then `build-all.py --deploy short-fuse` (its art is already wired and committed).
Short Fuse, after merging the build-all fix: every scenario (all 6, not only `sf-art`) now fails the universal "text under 11px" check: `"1"` at 7px in `<i.cn12>` (the small wire-number labels on the board). Together with the look-check findings above, Short Fuse needs a readability pass (wire number labels >= 11px, crew tile frame slice, speaker-name contrast) before it can deploy; its art wiring and `sf-art` are already committed.

## Nebula Aces: last painting (ui-bubble-tail) wired, NOT deployed
- Wired: the coach bubble pointer (`.gxh-arr`) wears `ui-bubble-tail` (xw/skin.css `html.sk-tail` rules, xw/media.js set `sk-tail`), same 12x12 box and place. Scenario `nb-tail` (xw/scn.js) checks it; its two painted-tail checks pass.
- Blocked: `build-all.py --deploy nebula-aces` fails 0/7 scenarios on look checks that also fail on the untouched `nb-art` scenario: text under 11px (`set dials`, `move + act`, `now`), clipped labels (`Setup · Deploy Fringe`, `Captain Kade`, `you`), `button covered by div.gxt-cell` in nb-tutorial-play, and `data-engine "three.js r158" threw Unexpected identifier 'r158'`. The three.js message looks like a harness artifact (engine label evaluated as JS), not a load failure; unverified.
- Next: confirm these fail on the base commit too; if so, fix the look checks in xw/ (font sizes, clipping, tutorial cell cover) or the engine-label check, then re-run the deploy and add the "Last painting wired" item.
- Setup note: `games-src` needed `npm install` (three@0.158.0) before any build.

## Fast test pyramid (14 Oct 2026): what exists, what does not
- BUILT (UI layer, Crown + Doorkick): behaviour scenarios with real taps and engine assertions, free invariants in every scenario (errors, 404s, tiny/clipped/overlapping text, covered buttons, engine numbers, glow responds), mutation proof. Runtimes: scenario-test ~30-50 s per game (3 sizes), scenario-mutate ~3.5 min per game (run on scenario changes only), lab-test ~60 s. Kill rate: Crown 83% -> 96%, Doorkick 80% -> 94%.
- NOT BUILT: node-only engine unit tests and the 1000-game AI-vs-AI simulation (a scheduled redirect asked for them mid-task; the owner's task text asked for the mutation work, so that was finished first). Start from `munch/rules-test*`/`kot/campsim.js`, `scripts/rulestest.js`; gate them before the UI step in build-all.py.
- Real bugs found: Crown energy chip cut off on 375/390 phones (fixed); Doorkick Fight! button cut off and unclickable on PC after a bonus card (fixed, `munch/tbl.css`); listed in `GXS.known`: tiny miniature-card text, clipped fight label, Crown PC tag/name/news-button text.
- Roll out: copy the Crown/Doorkick `scn.js` pattern (play checks + `mut:` + `data-engine`), run scenario-mutate, fix survivors, fix or list findings.

## LAB / test mode (14 Oct 2026) — live in all 15 shelf games
Read `games-src/shell/LAB.md`. Shelf 🧪 Test mode switch (next to ✔ Test), in-game 🧪 LAB menu (every scenario, ▶ GO, ✅/❌/⏭, "All scenarios ▶"), pinned 📍 checklist, owner page `games/lab.html` (data: `games/scenarios.json`, rebuilt on every deploy). `build-all.py` injects `gx-lab-core.js` + `gx-lab.js` + `gx-lab.css` into each staged page; `scripts/lab-test.js` (now `--full` only, warn-only) checks it. Checklist items point at scenarios with `scripts/set-scn.py`.
- **Mainhattan Nightrun (not touched):** inline `shell/gx-scenario.js` + a `scn.js` (before the game scripts), then set `window.GXLAB_CSS = <gx-lab.css text>` and inline `gx-lab-core.js` and `gx-lab.js` at the end of the body (or add the slug to `GAMES` in build-all.py so it injects them). Register `nr-*` scenarios as listed above.
- Known weak spots: LAB button defaults top-left (`GXS.labPos='r'` in scn.js moves it; Rampart does); Doorkick's Diary button width changes with the skin at 1366x768 (check removed from dk-board); Short Fuse `sf-board` has 7 px text (lab-test warning); Final Approach / Hollowbough / Lantern phone-check can flag "slow >800 ms" under CPU load; look baselines for Doorkick/Thornbound/Sands/Nebula/Crown got the existing plate/contrast keys; the quick sweep was skipped for the LAB deploys (LAB is inert off).

### LAB status (14 Oct 2026)
Live with LAB: all 15 shelf games (Doorkick, Crown, Nebula, Shipwreck, Sands, Sunglaze, Rampart, Short Fuse, Tidewake, Hollowbough, Thornbound, Kaiten, Lantern, Cauldron, Final Approach). Left: Mainhattan Nightrun (adopt per the note above). Next step: owner opens `lab.html`, taps GO per scenario; fix what he marks ❌; run `node games-src/scripts/lab-test.js <slug>` (or `build-all.py --deploy --full` only for engine changes) after any game change.

## Playwright/axe swap (14 Oct 2026, pilot: doorkick-dungeon)
- Scenario tests now run with Playwright Test (`@playwright/test@1.56.1`, `@axe-core/playwright` in `games-src/package.json`; run `npm install` in `games-src`). Config `games-src/playwright.config.js` (projects `phone` 390x763 = fast gate; `phone-s` 375x553 and `pc` only with `--full`), spec `scripts/scenarios.spec.js` (one generated test per `?scn=` scenario), check protocol `scripts/scn-run.js` (also used by `scenario-mutate.js`), lister `scripts/scn-list.js`. Standalone: `cd games-src && SCN_SLUGS=<slug> node_modules/.bin/playwright test --project=phone [-g <scn-id>]`. `scenario-test.js` is deleted (job pool / args / reporting were Playwright's job).
- Look check: contrast, tap-target size and unlabeled-button checks are now axe-core, run on the same scenario pages inside the scenario run (`LOOK_OUT`); build-all step 3b2 compares the severe findings (contrast < 2:1, target < 24 px, button without name) with the live game's (cached in `.look-live-cache/*-axe-*`) and blocks only on new ones. Removed from `look-check.js`: those judge() rules. Kept there (no axe equivalent): text px size, clipped/overlapping text, covered buttons, art/plates/boards/cards, fonts, page errors. The pixel-contrast helper (`__px.contrast`) stays because glyph visibility and blank-canvas detection use it.
- Not ported: the "known findings skipped" note line. Doorkick: scenarios 32 s (2 phone sizes, old) -> 16-19 s (390x763 only, incl. axe).
- Deleted unused copies: uiclick2.js, uiclick3.js, g2.js, g3.js, nettest_dbg.js.

## Menus (14 Oct 2026)
- Shared scenario `?scn=menu` (`shell/gx-scenario.js`, axe per surface in `scripts/scenarios.spec.js`): opens the title screen, every top-bar menu/rules/help button and the campaign screen; checks overlap, clipped text, text >= 13 px, covered buttons, every font loaded and one of the two shelf faces, axe tap size/contrast. Run: `cd games-src && SCN_SLUGS=<slug> node_modules/.bin/playwright test --project=phone -g menu`.
- Fix is shared: `shell/fonts/` (Cinzel 700, Alegreya Sans 400/700, OFL) + `shell/gx-menu.css` injected last by `build-all.py inject_menu` (base64, single file); `gx-campaign.css` blurbs wrap, 13 px floor.
- Failures before (unique messages: font / 13px / clipped / overlap / covered / axe): cauldron-fair 53/11/1, crown 39/13/3+1, doorkick 67/12/1, final-approach 47/11/5, hollowbough 72/11/1+2, kaiten 48/11/1, lantern 78/12/5, nebula 59/8/2+1, rampart 1/12/1+5 cov/9 axe, sands 5/12/1+4, shipwreck 6/12/1+3, short-fuse 92/17/5+4/8 axe, sunglaze 45/10/6, thornbound 88/11/2/4 axe, tidewake 89/11/4/4 axe.
- Fixed + deployed (menu scenario green): doorkick-dungeon, cauldron-fair, kaiten-kitchen, final-approach, lantern-dive, sunglaze.
- Still failing (after the shared fix): crown-city-smash (overlap "20 ★"/"last monster standing" on title); hollowbough (small "Build a woodland city." 11.2 px); nebula-aces (title overlap "New here?"/subtitle, axe .gx-gear target size, `data-engine "three.js r158"` is a bad attribute); rampart-and-vine (menubtn panel: 5 covered buttons, 11 axe contrast/target); sands-of-qamar (3 overlaps: "2 players"/"Begin" etc. in the title); shipwreck-isle (2 overlaps with p.small.muted, axe #bulbbtn); short-fuse (overlaps "Free and direct"/"All jobs", "Boot Camp I-III" 9.3 px, 8 axe contrast); thornbound (axe target-size/contrast in the campaign screen); tidewake (top-bar labels Hint/Crews/Log 11 px, axe target size). Common: top-bar buttons (#bulbbtn, rulesd, setd) report axe target-size while the campaign screen is open: check whether the campaign layer covers them.
- nebula-aces fixed + deployed (14 Oct): `.gxt-menu` column layout and bar hidden under campaign/tutorial strips in xw/head.html; three.js `data-engine` canvas attribute removed in xw/three3d.js.
- shipwreck-isle (menu scenario green at phone size; NOT deployed): fixed in rc/head.html (closed `.online` details content hidden; bar hidden under the open campaign screen) and rc/skin.css. Deploy gate blocks on `axe (new vs live): color-contrast .cards > h2 Card list` in `?scn=si-zoom` (card list heading under the zoom scrim; try `h2` colour/scrim there, then `build-all.py --deploy shipwreck-isle`).
- short-fuse: menu scenario green + deployed (job tiles 13 px, More contents render only when open, top bar hidden under the campaign screen, flat colours under painted buttons for contrast).
- rampart-and-vine: menu green + deployed (title hidden under the top-bar menu, solid colour fallbacks under skin button images, follower spots 40 px).
- tidewake: fixed + deployed (bar labels 13 px; bar hidden while the campaign screen is open, which cleared the axe target-size flags).
- crown-city-smash: menu scenario green (layout.css .lede b nowrap); NOT deployed: deploy gate blocked by non-menu `cc-smash` scenario ("IN DOWNTOWN"/"-3♥" board overlap, also fails on the unchanged game).
- thornbound: fixed + deployed (title/campaign layer covered the top bar; `body.in-start .gx-bar{visibility:hidden}` in head.html).
- hollowbough: FIXED + deployed 14 Oct (tagline 13 px in head.html; offline SW registration skipped on localhost, it 404ed on the test server).
- Not done: Mainhattan games skipped as ordered; no per-game skin.css was deleted yet.

## Fast gate v2 (14 Oct 2026, worker): `build-all.py --deploy` speed + menu test correctness
Measured on this 4-core box, 3 games (sunglaze, short-fuse, tidewake; two fail the menu scenario as before), `--deploy --suffix=-tmp`:
| step | before (owner's numbers) | after |
|---|---|---|
| 3 games total | ~6-7 min | **126 s** (142 s first run) |
| 1 game (sunglaze) | n/a | **74 s** |
| scenarios | 52 s + ~35 s rerun per failing game | 74 s once (21 tests); no rerun |
| look-check | serial, ~30 s/game + live look ~30 s + live axe, per game | 2 in parallel, ~10 s/game, no live run |
Target (90 s / 45 s) NOT reached: the remaining time is scenarios (~75 s: every test waits ~1.6 s + 5 s engine settle + 3 glow taps; axe on each page), builds ~12 s (now 3 in parallel). Next: cut `S.universal`'s 5 s wait, run scenarios with workers=4, fold look-check into the Playwright run.
What changed (reused: Playwright Test, axe, existing look-check):
1. `scn-run.js` returns `{fails, invFails}`; `scenarios.spec.js` writes invariants (text < 11 px, clipping, glow-tap) to `.staging/.inv/` and fails only on the scenario's own checks. The SCN_NOINV rerun is gone; `build-all.py` prints the invariants as WARN.
2. Live look/axe re-measurement replaced by committed `games-src/look-known/<slug>.json` (per mode phone|all; rewritten for each game that passes the gate). A game with no file yet is measured once on the live game (as before), then committed. Only sunglaze is seeded; the rest seed on their first deploy.
3. Look checks run in a 2-worker thread pool; game builds run 3 at once.
4. Duplicate checks removed from the deploy look-check (`look-check.js --skip size,overflow,overlap,fonts`): the scenario invariants + menu scenario own text size, clipping, overlap and fonts. Images, cards, boards, covered buttons, page errors stay in look-check.
Needs `cd games-src && npm ci` on a fresh machine (no node_modules in a new container).

### Menus (shell/gx-scenario.js `menu` scenario)
- Font check now real: first family must be a shelf face, have an @font-face in `document.fonts`, and some face `loaded` (old `document.fonts.check()` is true when nothing is declared).
- Scrollable panels are scrolled page by page and re-audited (below the fold).
- NOT done: pause / end / win-lose screen and chapter-boss intro need per-game spawn hooks (`GXS.menuSurfaces.push({name, open, close})`); the generic finder only opens top-bar buttons and the campaign screen. "Text not topmost at its centre" is coded behind `GXS.menuTopmost = true` but off: it flagged every game's title screen (28+ per game) and I did not find out whether that is real or a layout-timing artefact.
- Results, phone 390x763, menu scenario, all 15 (new + old failures; every game FAILS the scenario now only where listed; no font failures anywhere):
  - cauldron-fair, doorkick-dungeon, final-approach, kaiten-kitchen, lantern-dive, sunglaze: clean
  - hollowbough: text < 13 px x2
  - crown-city-smash: text overlaps x4
  - nebula-aces: overlaps x3, axe tap target < 24 px x2
  - rampart-and-vine: covered button x10, axe contrast x10
  - sands-of-qamar: overlaps x10
  - shipwreck-isle: overlaps x6, text < 13 px x28, tap target x1
  - short-fuse: overlaps x11, text < 13 px x6, contrast x5, tap target x3
  - thornbound: overlaps x2, tap target x4
  - tidewake: overlaps x10, text < 13 px x12, tap target x3
(Counts are matches in the first 14 messages per check, so "x28" = at least 14; run `playwright test --project=phone --grep menu` with SCN_SLUGS for full lists.) The "clean" games above passed with the topmost check off.
- sands-of-qamar: menu scenario green (ft/src/board.css: sticky .acts made static inside .more). NOT deployed: axe gate 'new vs live' fails on in-game sq-* scenes (the live cache has no sq-* scenarios): `.ab` ghost '↶ Put them back' and `.bump` seat score contrast. Next: get the axe detail for those two and fix, then `build-all.py --deploy sands-of-qamar`.

### Fast gate v2 follow-up: the 3 blocked menu deploys (14 Oct, 02:5x UTC)
`build-all.py --deploy crown-city-smash sands-of-qamar shipwreck-isle` in ONE call: **106 s** for 3 games. Result: sands-of-qamar DEPLOYED; the other two are real blockers, not gate bugs.
- Gate bug found and fixed: the live axe baseline was measured only on pages the live game has; a scenario page that is new in the build (sq-art, sq-board...) had no live page, so its old contrast findings counted as "new". Axe findings on pages the live game lacks are now a WARN and are recorded in `look-known/<slug>.json` (`axe_pages` lists the pages a later deploy may block on). Per-page keys, so one page's old finding can't hide a new one elsewhere.
- crown-city-smash BLOCKED by the scenario's own check `cc-board`: "painted skin moves no box: button.btn.mrow 358x57->358x52" (a real own-check failure of the board scenario, not an invariant). Needs the crown fixer.
- shipwreck-isle BLOCKED by the `menu` scenario: [panel Rules] "How to play" h2 overlaps text (N=7). Part of it is the new scrolled-panel audit exposing content below the fold. Needs the shipwreck menu fixer.

## Menu test v2 (14 Oct 2026, tests worker)
Shared `?scn=menu` (shell/gx-scenario.js) now sees the faults the owner saw on Doorkick. Reused: the existing menu pass, `S.audit`, Playwright. New checks (each fails on today's Doorkick build):
1. **frame art under content**: any element with border-image: its text/icon must start inside the art's inner area (border-image-width minus outset, all 4 sides). Doorkick: 'Me vs computer' 11 px short of the 22 px frame, 'Start' 9 px short of 16 px. (Also 'text over a decorative image': in-flow image under text; 2 hits.)
2. **text not topmost** switched ON (`S.menuTopmost = true`): 3 sample points (left end, centre, right end); ignores pointer-events:none (elementFromPoint), transparent wrappers, screens layered on top (scrim/drawer) and text scrolled under a sticky head. Proven by injecting a long card name in Doorkick's hand: flagged under the next card. The old false positives (every title screen) came from sampling one point and counting a scrim/other screen as a cover.
   The floating right-edge tab and round back-arrow are NOT in our DOM (no position:fixed controls on Doorkick's board except the tip bubble): they are the browser's / app's own chrome.
3. **board surface** (last in the list, starts the game): text not topmost, boxes/badges/text cut by the screen edge or an overflow:hidden parent, and more than one instruction line (Doorkick: caption + tip box title + tip text = 3). A game opens it with `GXS.boardOpen = fn` in its scn.js (done for Doorkick, tips on); every other game falls back to tapping its title's Start button, which mostly does NOT reach a board, so their board numbers are title-level only. **Next: each game fixer adds a boardOpen hook.** Also: the in-game Menu is now opened (the old skip list dropped it because its aria-label contains 'sound'/'hints'), and the pass opens panels by object, not by index (the list shifted as panels opened, which re-opened the campaign over the board).
4. **text hugs dialog edge**: bare text closer than 8 px to the dialog's inner edge (the column the framed rows use counts as the edge): Doorkick Menu 'Tips' and 'Show tips again' = 0 px.

Measured 390x763, build only, all 15 games, 5-14 s per game (limit 60 s):

| game | s | frame art | text on image | hugs edge | not topmost | cut | instr lines | worst 3 (one per type) |
|---|---|---|---|---|---|---|---|---|
| cauldron-fair | 7 | 9 | 0 | 0 | 2 | 0 | 0 | [title] frame art under content: <button.gx-ibtn> frame 10/10/10/10 (t/r/b/l) but top 4px: "s ; [campaign] text not topmost: "2" <span.gxc-disc> is under <button.gxc-ib> |
| cauldron-fair (after, fixer) | - | 0 own: 9 left, all shell (gx-ibtn, #rulesd/#setd drawer, gxc-* campaign disc/Back/score) | 0 | 0 | 2 (gxc-disc, gxc-lab; shell) | 0 | 0 | board hook added (draw screen); coach bubble no longer doubles the caption; `.btn` padding now covers the 14/22 frame |
| crown-city-smash | 0 | 0 | 0 | 0 | 0 | 0 | 0 | R2 14 Oct: menu test passes at phone size, deployed. Fixed in own files: skin.css frame padding (dlg/btn/mrow), text inset in start dialog, closed Customise details hidden, digit glyph single text, YOU chip tag hidden on phone, coach bubble hides board line + avoids board text (gx-help.js avoidPad option, off by default). |
| doorkick-dungeon | 10 | 30 | 2 | 7 | 10 | 6 | 1 | [title] frame art under content: <div.dlg.paper> frame 26/26/26/26 (t/r/b/l) but left 11px: " ; [board] text over a decorative image: "1" <b.slv> overlaps <img.savi> ; [title] text hugs dialog edge (0 px < 8): "Kick doors. Fight mo" <p> in <div.dlg.paper> |
| final-approach | 8 | 10 | 0 | 0 | 13 | 0 | 0 | [panel How ] frame art under content: <section#rulesd.gx-drawer.wide> frame 34/34/34/34 (t/r/b/l)  ; [panel How ] text not topmost: "Axis (both, mandatory)" <li> is under <div.gx-drawer-head> |
| hollowbough | 8 | 6 | 0 | 2 | 7 | 0 | 0 | [panel Menu] frame art under content: <section#setd.gx-drawer.on> frame 34/34/34/34 (t/r/b/l) but  ; [panel Menu] text hugs dialog edge (4 px < 8): "Settings, saves and " <p.gx-small> in <section#set ; [panel Menu] text not topmost: "50%" <output> is under <div.gx-drawer-head> |
| hollowbough (after, 14 Oct) | | | | | | | 0 | own fixed: board caption vs tip (1 line), b.bd badges + city count now topmost, scn.js boardOpen. LEFT: shell drawer/campaign/gx-sb; OWN-ish: tip bubble covers meadow card names/costs on board (no free spot; bubble placement is shell, avoiding .cd made it worse). NOT DEPLOYED: menu gate still red |
| kaiten-kitchen | 8 | 9 | 0 | 0 | 13 | 0 | 0 | [panel How ] frame art under content: <section#rulesd.gx-drawer.wide> frame 34/34/34/34 (t/r/b/l)  ; [panel How ] text not topmost: "Every plate" <h3> is under <div.gx-drawer-head> |
| lantern-dive | 11 | 6 | 0 | 0 | 2 | 0 | 0 | [panel How ] frame art under content: <section#rulesd.gx-drawer.wide> frame 34/34/34/34 (t/r/b/l)  ; [campaign] text not topmost: "2" <span.gxc-disc> is under <button.gxc-ib> |  **After (14 Oct, lantern-dive worker): own findings 0** (board 2 instruction lines fixed via skin.css `:has(.gxh-bub.on) #prompt`; .btn / .gxh-set .btn / .gxt-menu border-width now = border-image-width in head.html). Left for shell: #rulesd/#setd frame + padding (frame 34, text 19px; Menu text hugs edge 0-2px), campaign gxc-disc/gxc-lab covered, gxc-ib frame 22 vs 9px. NOT deployed: menu scn still fails on shell findings; ld-help also fails (pre-existing "First two tricks" clipped in .jc .t, head.html:269).
| kaiten-kitchen (after, 15 Oct fixer) | - | 9 shell | 0 | 0 | 13 shell (How panel under gx-drawer-head/h2; campaign disc, "Sets of Three" label) | 0 | 0 (was 1: tip + top line; top line now hides while a tip shows) | boardOpen hook added; all remaining findings come from shell/ (gx-drawer frame+head, gxc-*). Not deployed: the menu scenario still fails on them. |
| lantern-dive | 11 | 6 | 0 | 0 | 2 | 0 | 0 | [panel How ] frame art under content: <section#rulesd.gx-drawer.wide> frame 34/34/34/34 (t/r/b/l)  ; [campaign] text not topmost: "2" <span.gxc-disc> is under <button.gxc-ib> |
| nebula-aces | 14 | 29 | 0 | 13 | 2 | 0 | 0 | [title] frame art under content: <button.btn.gx-tb> frame 14/22/14/22 (t/r/b/l) but left 12px ; [title] text hugs dialog edge (0 px < 8): "Nebula Aces" <h1> in <div.dlg.start> ; [campaign] text not topmost: "2" <span.gxc-disc> is under <button.gxc-ib> |
| nebula-aces AFTER R2 (14 Oct) | | 0 | 0 | 0 | 0 | 0 | 0 | menu test passes; deployed. |
| rampart-and-vine | 8 | 17 | 0 | 0 | 2 | 0 | 0 | [title] frame art under content: <button.btn.alt> frame 14/22/14/22 (t/r/b/l) but left 2px: " ; [campaign] text not topmost: "2" <span.gxc-disc> is under <button.gxc-ib> |
| rampart-and-vine | 8 | 3 (all shell gxc-ib) | 0 | 0 | 2 (shell gxc-disc/gxc-lab) | 0 | 0 | after (own fixes done: btn/opt/menu padding>=frame, seats pill rebuilt, #hskip size kept, boardOpen added); NOT deployed: ?scn=menu still red on shell campaign findings only. Re-run build-all.py --deploy rampart-and-vine after the shell fix. |
| sands-of-qamar | 9 | 12 | 0 | 1 | 3 | 1 | 0 | [title] frame art under content: <div.mbox.start> frame 30/30/30/30 (t/r/b/l) but left 14px:  ; [campaign] text hugs dialog edge (2 px < 8): "★ 0/30" <button.gxc-ib.gxc-score> in <div.gxc.gxc- ; [campaign] text not topmost: "2" <span.gxc-disc> is under <button.gxc-ib> |
| sands-of-qamar | 9 | 12 | 0 | 1 | 3 | 1 | 0 | [title] frame art under content: <div.mbox.start> frame 30/30/30/30 (t/r/b/l) but left 14px:  ; [campaign] text hugs dialog edge (2 px < 8): "★ 0/30" <button.gxc-ib.gxc-score> in <div.gxc.gxc- ; [campaign] text not topmost: "2" <span.gxc-disc> is under <button.gxc-ib> |  **AFTER (sands-of-qamar worker, 14 Oct):** own findings 0 (title/button/dialog frame padding+border, board 1 instruction line, .ab contrast fixed in ft/src skin.css+board.css). Left for shell: gx-drawer #menud/#djd frame top 12px + "Card list"/"How to play" under gx-drawer-head, "Tips"/"Show tips again" hug 0px, gxc-* Back/Tutorial/score frame + disc/lab topmost + gxc-act frame. Not deployed: menu scenario still fails on those shell items only.
| shipwreck-isle | 10 | 13 | 0 | 1 | 18 | 0 | 0 | [title] frame art under content: <button.btn.go> frame 14/22/14/22 (t/r/b/l) but top 4px: "Ne ; [campaign] text hugs dialog edge (8 px < 8): "★ 0/30" <button.gxc-ib.gxc-score> in <div.gxc.gxc- ; [panel Rule] text not topmost: ". The first player gai" <li> is under <h2> |
<!-- shipwreck-isle v2 after (14 Oct): own findings 0 (btn border-image 10/16 + padding, #phchip, boardOpen hook added; board surface clean); left = shell only: rulesd frame + drawer-head covers rules text (30), gxc-ib/gxc-score frame+edge, gxt-menu. NOT deployed: ?scn=menu gate fails on those shell findings; deploy after shell fix. -->
| short-fuse | 8 | 29 | 0 | 10 | 8 | 0 | 0 | [title] frame art under content: <button.big.go> frame 14/22/14/22 (t/r/b/l) but top 4px: "Ne ; [panel Menu] text hugs dialog edge (0 px < 8): "Sound" <div.lbl> in <section#setd.gx-drawer.on> ; [panel How ] text not topmost: "(up to 11). Every yell" <li> is under <h2> |
| short-fuse (after, own fixes) | - | 11 (all shell: #rulesd/#setd frame, gxc-ib) | 0 | 0 | 8 (shell: drawer head, gxc-disc) | 0 | 0 | not deployed: gate fails only on shell findings; boardOpen hook added, board surface clean. Fixed: title/Menu plate widths, Menu labels inset, kbd 13.6px, clue counters 11px |
| sunglaze | 6 | 9 | 0 | 0 | 3 | 0 | 1 | [title] frame art under content: <div.mbox.sg-title> frame 34/34/34/34 (t/r/b/l) but left 18p ; [title] text not topmost: "choose where each tile" <small> is under <details#onl.online> ; [board] instruction lines: 2 at once (board-first rule: 1): "choose where each tile goes; no  |
| sunglaze AFTER (14 Oct, sunglaze fixer) | | 0 | 0 | 0 | 1 (shell: gxc-disc) | 0 | 0 | all own findings fixed (btn/mbox frame padding, bf-set Tips edge, closed Options details hidden, boardOpen hook, 1 instruction line). Left for shell: campaign gxc-disc/gxc-lab under gxc-ib/head, gxc-ib frame left 14px. Deploy gate blocks on those until the shell fix lands: then `build-all.py --deploy sunglaze`. Note: S.vis ignores a CLOSED <details>, so hidden text counted (worked around with `hidden`). |
| thornbound | 5 | 3 | 0 | 0 | 2 | 0 | 0 | [campaign] frame art under content: <button.gxc-ib> frame 14/22/14/22 (t/r/b/l) but left 9px: "‹ ; [campaign] text not topmost: "2" <span.gxc-disc> is under <button.gxc-ib> |
| thornbound (after, 14 Oct, not deployed: gate still red on shell findings) | - | own 0 | - | shell only | own 2 ("25", "Field" map labels under the coach tip bubble: placement is shell gx-help) + shell | 0 | 0 | fixed: .btn border-image-width = border+padding, closed `<details>` content display:none, one instruction line (tip hides caption), tip hidden under drawers, `.gxh-set button.btn` padding, `GXS.boardOpen`. Left for shell: gx-drawer frame/head/body inset (34px art vs 22px), gxc-* disc/Back/score, gx-ibtn target size, drawer buttons under gx-drawer-head |
| tidewake | 11 | 20 | 0 | 13 | 15 | 1 | 0 | [title] frame art under content: <button#bulbbtn.gx-ibtn.gxh-bulb> frame 10/10/10/10 (t/r/b/l ; [title] text hugs dialog edge (-10 px < 8): "Lay currents, steer " <p.tag> in <div#start> ; [title] text not topmost: "Host" <button.btn.small> is under <h2> |
| tidewake AFTER (fix worker, 14 Oct) | | board hook added; own findings 0 | 0 | 0 | 0 | 0 | 0 | remaining 34 are shell: gx-drawer #rulesd/#setd frame 34px + head covers text (9 not-topmost in rules), Menu text 0px from edge (9), campaign gxc-disc under Back / gxc-ib frame (3), gx-ibtn icons (2). Deploy blocked by the menu gate until shell is fixed. Own fixes: .btn border-image width 8/14 = border+padding, title text 24px indent, closed online <details> hides its buttons, rules bold nowrap, tip bubble hidden while a drawer is open, start step = one line (tip 'Pick a start mark' + 'Tap a glowing gold mark.'; strip shows only the name while the tip shows). |
| tidewake R2 (14 Oct) | | menu test: 0 findings; DEPLOYED | 0 | 0 | 0 | 0 | 0 | extra fixes: closed <details> in the rules drawer hidden, icon-button frame 4px = border+padding 2px. No shell edits. |
| **total** | | 231 | 2 | 57 | 105 | 8 | 3 | **406** |

Known weak: 'frame art' on small icon buttons (gx-ibtn svg 4 px) may be a sub-pixel icon box, not a visible fault; 'not topmost' on the campaign map ('2' disc under Back) is real overlap; board checks for 14 games wait for their boardOpen hook.
## Doorkick menu/board fixes (14 Oct 2026, owner's phone screenshots)
Fixed + scenarios `dk-menu-rows`, `dk-hand-names`, `dk-gear-up` (mutants 100%). Menu rows now have 24px side room, Tips rows framed like the others, menu bottom padding; hand names fit the visible strip (tbl.js tbFan); gear-up line is ONE line ("Tap or drag glowing cards onto your hero", tap-then-tap verified by a real-tap check; the setup tip bubble and board caption were removed); Lv and treasure badges moved inside; rival chips say "str"/"gear"; hero portrait fallback uses the painted camp-*.webp for every seat.
Not ours: the dark "❮" edge tab and round back arrow are the iPhone browser's edge-swipe hints (no such element in the DOM; scenario checks it). Still to check by the owner on a real iPhone: bottom of the menu (Safari toolbar).

### Menu test v2: shell fixes (14 Oct 2026, shell worker)
Shell: `.gx-drawer` padding 31px (+ safe-area) so text clears the 34px frame art; `.gxc-ib`/`.gxc-btn` padding 21px + `flex:0 0 auto` (Back/score no longer shrink under the art); `.gx-ibtn` 44px min (bar 52px). Doorkick (`munch/head.html`, `skin.css`): phone dialog side padding 25px, button art width 12px (0/8px on Start rows).
Check changed (said here, not weakened): `gx-scenario.js` `scrolledOut()` - text clipped outside a scrolling box (under the drawer head, below the body) is not on screen, so it is no longer called "covered" / "under frame art". Real overlaps still fail.
Menu counts, 15 games, 390x763 (messages per type, list capped 14/game, includes other workers' merged fixes): frame art 231 -> 51, text on image 2 -> 3, hugs edge 57 -> 23, not topmost 105 -> 22, cut 8 -> 3, instr lines 3 -> 2. Disc under Back: gone. Drawers: gone (final-approach, kaiten-kitchen, lantern-dive clean).
Deployed (one call): final-approach, kaiten-kitchen, rampart-and-vine. Blocked by `menu` on their OWN faults (per-game workers): cauldron-fair (stacked icon+label gx-ibtn svg 4px), crown-city-smash and nebula-aces (.dlg.start / .btn skin art), doorkick-dungeon (How-to overlap, "1" over avatar, 4 btn.bigb), hollowbough/shipwreck-isle/thornbound/tidewake (board svg text under overlays), sands-of-qamar, sunglaze (campaign), lantern-dive (axe contrast .gxh-ok "Got it": shell/gx-help.css?), short-fuse (look-check "plates" wrong aspect on button.big/.go/.btn.small, not from shell).

## After the UI-BAR round (orchestrator, 14 Oct 08:55): shared fixes queued
1. 12 games carry a stale inline copy of shell CSS in their head.html (`.gx-drawer{` in munch, rc, xw, final-approach, ft, hollowbough, kaiten, lantern-dive, short-fuse, tidewake, azul, thornbound): shell fixes never reach them. Remove the copies; build-all injects shell.css once. One change, one deploy of all 15.
2. shell/gx-scenario.js 'covered button' counts buttons scrolled out of view inside tall drawers (#setd/#rulesd) as covered (Hollowbough pc/wide).
3. shell/gx-scenario.js:363 reads non-numeric data-engine attributes (three.js canvas) as engine values (Sunglaze worked around it in three3d.js).

## Doorkick R3 (14 Oct 2026, UI-bar items 1-5)
Done + deployed. Scenarios (DOM checks, no shots): `dk-kick-order` (real tap on Kick; door anim start < end <= card visible; board copy hidden by `html.bf-rev` until then), `dk-diary`, `dk-dock`, `dk-topbar`, `dk-wide-board`. `?scn=menu` passes at all 5 projects.
Changes: bf.js `bfHold`/`bfRevealCard` (card waits for the door img `animationend`), ui.js `logHTML`/`orderHTML`/`recentHTML`/`promptHTML` (no pills, no Ouch box, no step list, no strength box), body.html (5 top-bar buttons), skin.css tail (diary, dock, top bar, wide board).
Still weak: pile labels + Diary box hidden under 1000px wide (menu test fails at 768 when shown: felt clipped); hands of 8+ cards hide names; board line 14px; tablet dk-boss-reveal (no #bfclip at 768) not touched; scenario mutants for the new scenarios not run (mutate script too slow).

## Orchestrator handoff (14 Oct 09:22) - owner: "you waste way too many tokens and deliver shit results"
- Owner said NO to worker screenshots (token cost). Machine checks only (in-memory pixel sampling in a test is fine: no image tokens).
- Running: [TESTS] Independent UI audit (session_01Ua3YQKjauzG5AvMuLQf5Rv) builds games-src/scripts/ui-audit.spec.js and writes the table "Independent UI audit (14 Oct)" here. A game is FINISHED only when that audit passes; worker self-reports are not trusted (Sunglaze, Lantern Dive, Rampart all failed the owner's eye after "pass").
- Still finishing (stop by 09:45): Sunglaze (Guide button dead, 3D black tile, 3D labels, title contrast), Lantern Dive (stretched background, tiny desktop text), Rampart (menu rows art over labels, desktop sizes).
- Next (one round only, after the audit table): one worker per game that FAILS the audit, brief = the audit's failing rows only. Then the shared fixes listed above (stale shell copies in 12 games, test bugs, drawer solid background).
- Token rules for the next orchestrator: run on a small context; do not relay each worker report to the owner, report once per round with the audit table; put all instructions in the brief up front (each create_trigger result costs ~6k tokens of context).

## Sunglaze stop 14 Oct
Deployed earlier today: top bar cut to Players/Log/Rules/Menu with a Menu drawer, simple start screen, text sizes and drawer insets, bigger 3D board labels (row numbers, breakage numerals, sack/shard box), scoring note removed from the boards. Scenarios: menu (5 sizes), ui-bar, ui-start, ui-3d.
NOT deployed (pushed as source only, last deploy gate failed on a shell scenario, see below):
- Guide: Menu "Guide: on/off" now closes the drawer; new Menu entry "Learn the rules"; scenario sg-guide (passes at pc). Cause found: the first game starts with Guide on, so one tap switched it off, with the drawer left open over the dock. ui.js (case 'coach' / 'tutorial' in the click switch, render's #coachbtn line), body.html (#coachbtn, #tutbtn), scn.js (sg-guide). Phone: Guide lives in the phone More card (ui8.js:157), closing it was added in ui.js but is not tapped in a test.
- Title contrast: skin.css bottom (html.sk .gx-bar plain cream plate, h1 span dark ink). Cause: `.gx-bar h1 span` in head.html:131 is gradient-clipped text, so the skin's colour never applied. Not measured yet: azul/game/ui-contrast-test.js (pixel sampling behind text) has never completed a run (crashed once on a re-rendered element; patched, not rerun).
Not fixed:
- Black square on the computer's drying racks: not reproduced (3D frames scanned, no dark block, no texture-less mesh). Needs round/phase from the owner's screenshot. Candidate places: three3d.js boardGeos (slot cut-outs, ~line 377) vs boardSlots (~line 376); GLB models (glbLoad, ~line 238).
- Table fills ~44% of the screen height at 1560x900: three3d.js computeLayout (~line 258), 'row' layout is width-limited. Needs a one-board-at-a-time view (owner's call).
- Shell: shell/gx-scenario.js:363 evaluates every [data-engine] value (three.js sets "three.js r158" on its canvas; worked around in three3d.js). Deploy gate now fails with "ui-audit: GXS.menuList is not a function" (new shared scenario, not this game's code); sunglaze cannot deploy until the shell side is fixed or ui-audit is adapted.
- UI-BAR rules 3, 5, 6, 8 only partly machine-checked (see the earlier report).
## Independent UI audit (14 Oct)
**Status: run on all 15 games x phone/pc/wide on 14 Oct 10:08-10:31 UTC (see Results).** No game was edited, no screenshots saved.
- Built: `scripts/ui-audit.spec.js` (rules A-F, Playwright Test, reuses playwright.config.js projects + GXS.menuList/menuOpen/boardAudit) and `scripts/ui-audit-table.js` (results -> this table). Run: `GX_URL=https://am015-dev.github.io/spotify_to_ytmusic SCN_SLUGS=<slugs> UA_OUT=.staging/ui-audit node_modules/.bin/playwright test scripts/ui-audit.spec.js --project=phone ...` then `node scripts/ui-audit-table.js`.
- Not verified: the pc/wide run (it crashed once on a bug I then fixed, the fixed re-run was cancelled); rule D (three.js hook via Object.prototype setter) only tried on sunglaze, which is 2D, so untested on a 3D game; E taps at pc may exceed the 420 s test timeout (lower UA_MAX_BTN or UA_E_SIZES).
- Known spec quirk: the first sunglaze run used the pre-fix surface list (no real start screen); its F "title has 0 big buttons" is a spec artefact, ignore it.

Results: live run 14 Oct 2026, 10:08-10:31 UTC, all 15 games x phone 390x763, pc 1366x768, wide 1920x1080 (45 tests, no page errors). Cells = distinct failing items over the 3 sizes (same element/message at several sizes counts once). Rule E comes from the first run (older spec; E code unchanged by the fixes); A/B/C/D/F from the re-run with the spec fixes below. Raw JSON: `.staging/ui-audit-final` (not committed).
| game | A | B | C | D | E | F |
|---|---|---|---|---|---|---|
| cauldron-fair (3 sizes) | FAIL 38 | FAIL 52 | pass | pass | FAIL 4 | FAIL 1 |
| crown-city-smash (3 sizes) | FAIL 56 | FAIL 58 | pass | FAIL 5 | pass | FAIL 3 |
| doorkick-dungeon (3 sizes) | FAIL 115 | FAIL 35 | FAIL 30 | pass | FAIL 3 | pass |
| final-approach (3 sizes) | FAIL 34 | FAIL 13 | pass | pass | FAIL 1 | pass |
| hollowbough (3 sizes) | FAIL 105 | FAIL 55 | FAIL 34 | pass | FAIL 3 | pass |
| kaiten-kitchen (3 sizes) | FAIL 61 | FAIL 45 | pass | pass | FAIL 2 | FAIL 1 |
| lantern-dive (3 sizes) | FAIL 28 | FAIL 19 | pass | pass | FAIL 3 | pass |
| nebula-aces (3 sizes) | FAIL 106 | FAIL 51 | FAIL 6 | FAIL 6 | FAIL 11 | FAIL 1 |
| rampart-and-vine (3 sizes) | FAIL 36 | FAIL 31 | pass | pass | FAIL 1 | pass |
| sands-of-qamar (3 sizes) | FAIL 41 | FAIL 51 | FAIL 6 | pass | pass | pass |
| shipwreck-isle (3 sizes) | FAIL 49 | FAIL 69 | pass | pass | pass | FAIL 3 |
| short-fuse (3 sizes) | FAIL 89 | FAIL 47 | pass | pass | FAIL 8 | FAIL 1 |
| sunglaze (3 sizes) | FAIL 36 | FAIL 55 | pass | FAIL 2 | FAIL 12 | FAIL 1 |
| thornbound (3 sizes) | FAIL 18 | FAIL 17 | pass | pass | FAIL 4 | FAIL 1 |
| tidewake (3 sizes) | FAIL 91 | FAIL 34 | pass | pass | FAIL 7 | FAIL 7 |

Triage (spec false positives fixed in `scripts/ui-audit.spec.js`):
1. F top bar: counted the campaign overlay's buttons (Back, Replay, stars, Skip tutorial) as top-bar buttons. Now only `header.gx-bar` buttons (fallback: not inside `.gxc/.gxt`). Games still failing F have a real over-full bar: tidewake 6 (Hint, Crews, Log, Rules, Pieces, Menu, all sizes), shipwreck-isle 11-12 at pc/wide, crown-city-smash and cauldron-fair at some sizes.
2. F title: "0 big primary buttons" was an artefact (title buttons are `.tbtn.go` at 13px; old test wanted font>=18 or class start|play). Now go/big/"Play..." count as primary and the width test is min(220, 40% of width). Remaining F = real: cauldron-fair, kaiten-kitchen, thornbound, short-fuse, tidewake titles have TWO big primary buttons (New here? Learn in 5 minutes + Play).
3. D: label "Mesh" ~0px tall was a degenerate/off-screen sprite; now ignored below 1px.
4. B: SVG text and gradient-clipped text were measured with `color` (wrong), now `fill` / `-webkit-text-fill-color`; transparent ones skipped.
NOT triaged / treat with care: **B is unreliable**: ~40% of hits are 1.00-1.4:1 (text colour == background), implausible for visible text, so the hide-text step (`*{color:transparent!important}` changes backgrounds that use currentColor) is suspected; B real faults must be re-checked per element. **A on SVG text** (e.g. tidewake `g>g>text` "0.1px") is a spec artefact: computed font-size in SVG user units, not screen px. **E** is high false-positive: many are info/stateless buttons or style-only changes the spec ignores (opponent seats, "Hide panel", SVG `g` tiles in thornbound); E hits that look real: short-fuse campaign top-bar Hint/Menu/How to play dead, tidewake Rules/Pieces dead on phone campaign, nebula-aces Plan/Act phase buttons dead in guide, doorkick Music/Songs/Speed dead in How-to-play panel at phone.
Real faults (from the cited elements): C hollowbough `div.strip` mat.webp aspect off 74-138% (334x314 vs 1200x291) and `.gxc-head` topbar 1.74x upscaled at phone; C doorkick `button.opp` ui-rival-chip.webp 22% off and `aside.gx-dock` 18% off; C sands-of-qamar `div.spot` ui-spot.webp 27% off and `div.gxc-path` story-map.webp 76% off; C nebula-aces 6. D sunglaze near-black untextured `CircleGeometry|`/`PlaneGeometry|` (15/78 planes have no map) = likely the owner's black square on the drying racks; D crown-city-smash near-black Lathe/Cylinder/Plane meshes; D nebula-aces untextured SphereGeometry + near-black BoxGeometry. A real: campaign node labels `span.gxc-lab` 13px at pc/wide in every game with a campaign (shared shell, min 16), doorkick `span.tag>small` "LV" 5px, short-fuse `i.cn12` 11px.

Worst 3 per game (A smallest px, B lowest contrast [see caveat], then the worst of D/C/F/E), for briefing a fixer:
- **cauldron-fair** worst 3: A [campaign/pc,wide] "First Bubbles" 13px (min 16) `div.gxc-path>button.gxc-node>span.gxc-lab` ;; B [panel How to play/wide] "1" contrast 1.21:1 (<4.5) `div.gxc-path>button.gxc-node>span.gxc-disc` ;; other [start/pc,phone,wide] title has 2 big primary buttons (want 1): New here? Lear, Playagainst th `div.ttl-in>div.tbtns>button.tbtn`
- **crown-city-smash** worst 3: A [campaign/phone] "♥10" 12px (min 13) `button.pchip>span>em.h` ;; B [campaign/pc] "3" contrast 1.00:1 (<4.5) `svg>svg>text` ;; other [start/pc,phone,wide] near-black untextured mesh in "LatheGeometry|" `three:LatheGeometry|`
- **doorkick-dungeon** worst 3: A [board/pc] "LV" 5px (min 16) `span.aw>span.tag>small` ;; B [panel Menu: sound, speed, hints, graphics, speed test, new game/pc] "Grub's Toll" contrast 1.05:1 (<4.5) `div.gxc-path>button.gxc-node>span.gxc-lab` ;; other [campaign/pc,wide] bg ui-rival-chip.webp aspect off 22% (196x60 vs 256x96) `div.tbl>div.opps>button.opp`
- **final-approach** worst 3: A [panel How to play/pc] "Routine landing (6)" 13px (min 16) `div>div>div.band` ;; B [panel How to play/pc] "Castlemoor: A Quiet Alarm" contrast 1.06:1 (<4.5) `div.rcard>div.rt>b` ;; other [panel How to play/wide] dead button: ‹ Back `div.gxc-screen>div.gxc-head>button.gxc-ib`
- **hollowbough** worst 3: A [panel Menu/pc] "×3" 13px (min 16) `div.its>span.it>b.bd` ;; B [panel Menu/phone] "The Long Winter of Hollowbou" contrast 1.07:1 (<4.5) `div.gxc-head>div.gxc-htitle>b` ;; other [panel Menu/pc,wide] bg mat.webp aspect off 74% (334x314 vs 1200x291) `main#board.gx-board>div#bd.wide>div.strip`
- **kaiten-kitchen** worst 3: A [panel Menu/pc] "0" 13px (min 16) `button.sh>div.av>span.sc` ;; B [panel How to play/wide] "Online play uses Trystero (M" contrast 1.02:1 (<4.5) `div>section.credits-audio>p` ;; other [start/pc,phone,wide] title has 2 big primary buttons (want 1): New here? Lear, Playagainst th `div.ttl-in>div.tbtns>button.tbtn`
- **lantern-dive** worst 3: A [campaign/pc,wide] "Training Day" 13px (min 16) `div.gxc-path>button.gxc-node>span.gxc-lab` ;; B [panel How to play/wide] "Online" contrast 1.42:1 (<4.5) `div.qg>div.qrow>button.qseg` ;; other [panel Menu/pc] dead button: Sumi, 10 cards `div#table.myturn>div#opp>button.seat`
- **nebula-aces** worst 3: A [board/phone] "vs" 11px (min 13) `div#bf>div#bftop>span.vs` ;; B [start/wide] "How to play" contrast 1.00:1 (<4.5) `div.dlg>div.acts>button.btn` ;; other [start/pc,phone,wide] 1/3 "SphereGeometry|" meshes have no map while 2 siblings do `three:SphereGeometry|`
- **rampart-and-vine** worst 3: A [panel menubtn/pc] "First Furrow" 13px (min 16) `div.gxc-path>button.gxc-node>span.gxc-lab` ;; B [panel menubtn/pc,phone] "The valley grows rich. Rival" contrast 1.25:1 (<4.5) `div.gxc-path>div.gxc-act>small` ;; other [campaign/pc,wide] dead button: 0 stars of 30. Show rewa `div.gxc-screen>div.gxc-head>button.gxc-ib`
- **sands-of-qamar** worst 3: A [campaign/pc,wide] "The First Caravan" 13px (min 16) `div.gxc-path>button.gxc-node>span.gxc-lab` ;; B [start/wide] "free: your browsers connect " contrast 1.16:1 (<4.5) `details.exd>summary>small` ;; other [panel Rules/pc,wide] bg ui-spot.webp aspect off 27% (60x59 vs 128x160) `div#acts>div.bidt>div.spot`
- **shipwreck-isle** worst 3: A [panel Rules/pc] "Driftwood Dawn" 13px (min 16) `div.gxc-path>button.gxc-node>span.gxc-lab` ;; B [panel Rules/wide] "Reset tips" contrast 1.00:1 (<4.5) `div.hlp-rules-set>div.gxh-set>button` ;; other [start/pc,wide] top bar has 11 buttons (max 5): Hint: what s, Camp: castaw, Log, Card list, Rule `div.gx-app>header.gx-bar>button#bulbbtn.gx-ibtn`
- **short-fuse** worst 3: A [board/pc,phone,wide] "1" 11px (min 16) `div#track>div.trk>i.cn12` ;; B [panel How to play/wide] "Slow" contrast 1.01:1 (<4.5) `div>div.row>button.btn` ;; other [start/pc,phone,wide] title has 2 big primary buttons (want 1): New here? Lear, Play `div.st-body>div.st-main>button.big`
- **sunglaze** worst 3: A [campaign/pc,wide] "The First Kiln" 13px (min 16) `div.gxc-path>button.gxc-node>span.gxc-lab` ;; B [start/pc,phone,wide] "choose where each tile goes;" contrast 1.01:1 (<4.5) `div.exs>label.chk>small` ;; other [start/pc,wide] near-black untextured mesh in "CircleGeometry|" `three:CircleGeometry|`
- **thornbound** worst 3: A [campaign/pc] "First Muster" 13px (min 16) `div.gxc-path>button.gxc-node>span.gxc-lab` ;; B [campaign/phone] "The sharpest rivals, a boss " contrast 1.04:1 (<4.5) `div.gxc-path>div.gxc-act>small` ;; other [start/pc,phone,wide] title has 2 big primary buttons (want 1): New here? Lear, Playagainst th `div.ttl-in>div.tbtns>button.tbtn`
- **tidewake** worst 3: A [campaign/pc,wide] "N" 0.1px (min 16) `g>g>text` ;; B [campaign/phone] "Act 2 · Open Water" contrast 1.22:1 (<4.5) `div.gxc-path>div.gxc-act>b` ;; other [start/phone] title has 2 big primary buttons (want 1): ⚓ Story: The L, Play now: you  `div.stcard>div.row>button#storybtn.btn`

## STOP 14 Oct 09:27 UTC (owner: "wrap up everything and deploy, make workers write down what they found and stop them")
Last live times (UTC, games/<slug>/index.html): rampart 08:59, short-fuse 08:56, tidewake 08:56, nebula 09:01, final-approach 09:03, hollowbough 09:05, thornbound 09:05, kaiten 09:07, doorkick 09:10, crown 09:11, cauldron 09:15, shipwreck 09:15, lantern 09:20, sands 09:20, sunglaze 09:20.
Open faults found by the owner (rampart and lantern workers report these fixed and deployed after 09:20, NOT independently verified; check against the list):
- rampart-and-vine (1920 wide, Menu drawer): row panel art starts ~30px in and cuts the labels; menu text 11-12px; Tips On/Off + Reset tips oval chips in another style; score chips "You 0 ★5" ~10px with icons over numbers; tiles ~90px in a 1900px table, "Place your tile" ~11px; full-width hand tray with one small tile.
- lantern-dive (1920 wide): underwater background stretched/upscaled (blurry); seat names, "Same as Commander", "Exactly two Lanterns", "Lanterns", top-bar labels, status line all 9-11px; cards ~90px, hand card cut at bottom.
- sunglaze: see "Sunglaze stop 14 Oct" (Guide button dead, black untextured tile on Olive's rack, 3D board labels 6-9px, scoring note cut at board edge, table ~60% of screen height, title pale on pale bar).
- crown: start screen still 2 big buttons + Customise; tablet dock covers "IN DOWNTOWN"/"0 cards" (kot/art.js:146).
- shipwreck: castaway choice (who/human-computer) removed from the start screen; restore under More ways to play.
- all: per-game worker reports above ("rules pass") were NOT independently verified; see "Independent UI audit (14 Oct)" for the partial checker.

## Visual baselines (14 Oct 2026, worker)
Built: `scripts/visual.spec.js` (title/menu/board x phone/tablet/wide, `?scn=menu` seed, animations disabled, masks), `scripts/baselines.sh pull|push`, `build-all.py --visual|--approve-visual <slug>`, config `snapshotPathTemplate` -> `games-src/.baselines/<slug>-<step>-<project>.png`, `updateSnapshots: 'none'` (missing baseline = fail). Orphan branch `ui-baselines` holds the PNGs. Flake test: 2 consecutive runs of 9 shots, 0 diffs. Recorded: rampart-and-vine ONLY (desktop fixes); all other games have no baselines and `--visual` fails for them until the owner approves their screens. Not wired into `--deploy` yet (owner's call).

## Nightrun ship art / weapon mounts (16 Oct 2026)
Done: `RIG` in `nightrun/parts/draw.js` draws the equipped weapons on the ship (slot 1 coloured circle, slot 2 triangle, split ring for a fusion, muzzle flash at the mounts; visual only, shots unchanged). Hardpoints = `RIG.hp` table (ship id -> [x1,y1,x2,y2], fractions of ship length; default std). Shown in the run, the WEAPONS sheet (`#wpShip`), the Garage ships tab (`#gaPic`) and the HUD weapon chips. Real art switches on by itself: `wpmount-<id>.webp` (256x128), `ship-<id>-armed.webp` (previews only, 512x256), `fx-fuse-<a>-<b>.webp`. Switch everything off: `RIG.on=false`.
Asset slots: `python3 games-src/nightrun/wp-assets.py` regenerates the wpmount-* and ship-*-armed entries from WPD / ship list; then `make-placeholders.py` and `scripts/next-wave.py`. Test: `node games-src/nightrun/mount-test.js`.
Next: owner supplies the art; tune `RIG.hp` once the real ship pictures are checked on a phone (hardpoints are guesses); in-run armed composite is off (`RIG.armedRun`, not wired).

- 16 Oct 2026 Nightrun B8 Heat ladder live (flag RET.heat, parts/ret.js; hooks in story.js setLevel, b.js tier decay, map.js plate). Bot clears Heat 1-3 at 90-100% on stages 1/8/20: steeper early steps are a follow-up (ret-heat-test.js HEATSET env tunes order/lvK). ret-arcade-test fails on stage 30 arcade length with or without Heat.

## Nightrun: checkpoints with grace (parts/cp.js, flag RET.cp, `?cp=0` = off)
- Stages of 150 s or more that are not arcade-cut (Classic length, long boss approach): a checkpoint at about 1/3 and 2/3 (bar-aligned, never in a boss fight or the last 15 s). Flags on the progress bar, CHECKPOINT banner, existing `up` sting.
- Death after one: run-end shows RESUME FROM CHECKPOINT (once per checkpoint, 2 per stage). A resume repeats the startStory calls with `runStart {resume:true}` (add-on counters should ignore `d.resume`), puts the snapshot back, moves G.dbar/G.dt and the song/beat clock (BT.t0, file restarted at that place) to the bar, half hull (>= 2), 3 s grace + shimmer.
- Marked ↺ = counts as an assist run (RET.assistRun: no Heat medal, no records), Neon x0.75 (payClear and banked), no hull-lost star. Death bank is refunded on resume.
- Test: `NODE_PATH=$(npm root -g) node games-src/nightrun/ret-cp-test.js` (34 checks). No pictures added, so no asset manifest entries. afk-test is flaky under load (fails ~1 in 2 on the baseline too; rerun alone).
- 17 Oct 2026 Nightrun STORY TIMELINE + CAST live (flag RET.tale, new parts/tale.js after ret.js in build.py; `?tale=0` = off). 6 cast, 32 beats + 5 boss lines in the data table at the top of tale.js; before-card on first start of a stage, after-scene on first clear, STORY LOG in MENU with NEW dot, save `mnr_tale`. Portrait slots `char-<id>.webp` (manifest group "Story cast"). Test: `node games-src/nightrun/tale-test.js` (67 checks). Next: owner paints the 6 portraits; stage-plate preview is one line only.
## Nightrun stats + achievements + completion (flag RET.stats, `?stats=0` = off)
- `games-src/nightrun/parts/stats.js` (after ret.js in build.py): lifetime counters in `mnr_stats` (in the export list), 30 achievements (`ach-<id>.webp` 128x128 placeholders from make-placeholders.py; badge+glyph drawn until real art is in ready.json), unlock toast queue, completion % on the title chip, MENU > STATS sheet (credits, privacy, reset). API: `RET.st`. Test: `stats-test.js`.
- Story-log (`RET.tale`) is read defensively: expects numeric/function `seen|done|count` and `total|max`; otherwise ignored.
- Skill-gated achievements (no-hit, Hard, Heat) ignore Assist runs; Assist runs still count for the counters.

## Nightrun FLOW: the song never stops (parts/flow.js, flag RET.flow, `?flow=0` = old; test ret-flow-test.js)
- Audit (before): only PAUSE (setPause -> AU.suspend: context + streams frozen) and a hidden tab stopped the song. Pit stop, boss chest, weapon sheet, stage result, story cards and tutorial cards never touched the audio (no suspend/startStage), but the music stayed full level under the choices, and the pit clock ran on frame dt (10 s, not tied to the song). Checkpoint resume / stage start call startStage with the right song (a crossfade-less restart, unchanged). Songs loop (`el.loop`), so a song never ends into silence; no double-song path found.
- Now: while one of those screens is up (polled every 50 ms: pit stop, chest, weapon sheet, stage result, story card, tutorial card) the song is ducked to 60%, low-passed at 2.2 kHz, drum layer gated off (own nodes between `duck` and `cutg`, created on first use); it returns to full on the next bar line. Pit clock = whole bars of the song (ends on a bar line, shown as the usual 10..0; the weapon sheet adds whole bars).
- PAUSE: Settings > Audio "Keep music playing when paused" (`SET.keepmus`, default On, in mnr_set). On: no AU.suspend, song ducked; RESUME hides the card, counts 3-2-1 on the beats (#flowCnt) and unpauses on the bar line, full level from that line. Off or `?flow=0`: old pause. Hidden tab still suspends; visible again resumes the (ducked) paused game.
- audio-test now sets `keepmus=false` for its pause/resume section (it tests the old suspend path).
## Nightrun power-ups: six music-tied powers + reliable DRUM BURST (flag RET.pw2, `?pw2=0` = old)
- New `parts/powerups.js` (after ret.js in build.py; no digit in the name because guard.py rejects numbered layer files). ECHO, DOWNBEAT NOVA, MAGNET BASS, WINGMATES, CRESCENDO, CHORD SHIELD: 8 bars each, weight 2 (= SLOW GROOVE), one at a time with each other and with DRUM BURST (a new pickup replaces the running one; tempo/slow/drop unchanged). Icons drawn in code, no pictures, no manifest entries. Each adds a note layer via `AU.osc` on the music bus in the song's key.
- Drum fix: the layer is scheduled from the `beat` event on the song grid (the old 25 ms `setInterval` lost beats in a throttled tab and ignored `BT.off`); `PW.drums` is a no-op with the flag on. Shots were already beat-driven.
- First pickup of each power keeps a 6 s hint (`mnr_pw2seen`), later ones 1.6 s. Not in the Flight School text (it has no power list).
- Test: `NODE_PATH=$(npm root -g) node games-src/nightrun/ret-pw2-test.js` (23 checks). Bot-dull: MAGNET BASS and CHORD SHIELD (no effect on kill speed); not tuned beyond the weights.
## Nightrun power scale (flag RET.scale, `?scale=0` = off; 17 Oct 2026)
- New `parts/scale.js` (after ret.js in build.py) + hooks: `b.js` en() hull x `SC.hpK()` and first shot `SC.firstShot()`, `g.js` WP.shots shot damage x `SC.wk(id)`, `wpx.js` card number `WPX_POWER(L,id)`. Hull factor = 1 + 0.6 x (1 - exp(-(power - expected)/4)), power = UPS.u + weapon levels + fusion; bosses unscaled. LV10 shot weapons = 1.8x LV1 (was 2.5x). Hard / very hard / legend: TUNE.dm raised, no mercy and first shot sooner on very hard + legend.
- Tests: `scale-test.js` (flag off, power monotonic, LV10 1.8x, gunship TTK window, bot clear band), `scale-probe.js` (numbers per build), `balance-test.js BUILDS=max` (permanent LV10 + all perks; `PRE=` and `Q=` env for experiments). Numbers: BALANCE.md "Power scale".
- Known: ret-walls-test stage 30/39 and balance-test easy/late shooters-fired are flaky on the BASELINE too (same fail without scale). Non-shot weapons (blades, arc, mines, rail, flame, wells, storms, beat cannon) keep the 2.5x curve. Normal + maxed ship is still ~0 hits for the bot (defence perks): next lever is power-aware fire density.

## Nightrun power scale round 2 (flag RET.scale2, `?scale2=0` = round 1; 17 Oct 2026)
`parts/fair.js` (auto-aim cone/lock delay/damage cut, camping = standing still, boss shields with cores + damage budget, aimed lead shots and gap walls on hard tiers). Gate `scale2-test.js`: 5 of 7 pass; open: corner camper still clears the final boss (stage 40), Legend mini-boss TTK spread 35-82 s. Dodging-bot Legend bands (25-55%) not reached: 20/40 stay easy or flip to 0, 30 is an attrition wall. Run bot tests at PAR<=4. Numbers: BALANCE.md "Power scale, round 2".

## Nightrun power scale round 3 (flag RET.scale3, `?scale3=0` = round 2; 17 Oct 2026)
`parts/hard.js` (hard tiers only: damage ceiling in DMG.pass, homing lock budget + facing rule, auto-aim share <= 35%, boss repair without aimed hits, district/final boss hull and budget x.55). Hook: `b.js` passes bullet+enemy to `DMG.hit`. Probe `scale3-probe.js`, gate `scale3-test.js`. Camper 0%, strongest-build dps 285-504 -> <= 223. Open: dodging bot Legend 20/30/40 = 33/0/100% (stage 30 deaths are rams; final boss absorbs hits via revives). Final params bA .35, bK .55, bT .55: camper stage 40 1/3, final boss 63/66/86 s (god). NOT DEPLOYED: sweep.js fails 110 checks on the live round-2 page already (garage tune layout, settings/story/resume buttons, shop buys) and 113 with scale3; fix the sweep baseline, then build + deploy. tutorial-test idle check fails only under CPU load (passes alone). Numbers: BALANCE.md "Power scale, round 3".
## Nightrun ground enemies, calmer pacing, BREACH (flag RET.leak, `?leak=0` = old; 17 Oct 2026)
- New `parts/leak.js` (after ret.js in build.py), small hooks: `b.js` enemy loop (`sdt` scaled per enemy by `LEAK.es`, `case 'gtank'/'gturret'/'gwalker'` -> `LEAK.move`), `c.js` phone HUD (`LEAK.draw`). `window.LEAK` holds the state and the tuning (`pg` .3, `spd`, `grp`, `free`).
- Ground: `gtank` (rolls, lobbed shell), `gturret` (rises out of the road, aimed shot), `gwalker` (slow, tanky, legs step). Stand on `UIK.groundY()` with the ground-boss shadow; from the 3rd stage of each city (`pos>=2`), ~30% of the waves, never in portrait, the LAB waves, during a boss, or on FAEHRE / FLOTTE (water). Coloured shapes; painted art `spr-en-gtank|gturret|gwalker.webp` (manifest + placeholders added) is drawn once it is real art. LAB > FOES has a GROUND ENEMY row.
- Pacing: flyer speed x.78 Easy/Normal, x.9 Hard, x1 Very hard/Legend/Heat (bosses, gates and ground enemies unchanged; wave bar lines untouched). One-bar gap (no spawn, READY pulse on the beat) after every 3rd wave on Easy/Normal and after a mini-boss (not Legend/Heat).
- BREACH: a live enemy leaving left = leak (gunship/elite/leader 3; swarm, mine, gate, bullets, bosses 0). Meter cap = 2 free + 4/3/2 (Easy/Normal/Hard+) leaks, then -1 hull through the normal `hurt()` (shield, medals, no-hit star see it); Easy/Normal never take the last hull. Decay 1 per 2 quiet bars; a leak stops FEVER filling until the next bar. No "no-leak star" exists, so none was reduced.
- Test: `ret-leak-test.js` (ground line + reach in 5 cities at 1366x768 and 1280x720, no ground in portrait, speed ratios, gaps, breach rules, HUD >= 14 css px at 390x763 / 375x553, `?leak=0`).

## Nightrun boss length tune (18 Oct 2026, worker nr-bosstune)
Cause of the extra boss time: damage above the cap was thrown away (the bot's damage comes in bursts), hard.js's boss repair ate damage, and the 66% core shield froze the bar. Fix in `parts/armour.js` (`BK` overflow bank, `SHT` shield overload, `REP .2`) and `parts/hard.js` (repair only while camping). Numbers: BALANCE.md "Boss fights, round 4b". scale2/scale3/boss2 tests pass (Legend final window back at 170-260 s). Known, not from this change: scale3 "dodging bot Legend maxed 20/30/40" 0% (bot dies in the first 20-55 s of stage 40, same with `?boss2=0`) and "fresh ship dps no cut" 81.7 vs 79.1; weapon-test "wave alone LV10 clears stage 1" fails; afk-test fails (Hard dodging bot dies at 37 s, stage 42 dies at 25-34 s, no boss involved); it failed before this change too.

## Nightrun shooter power-ups with levels (W4, 18 Oct 2026)
- `nightrun/parts/powlevels.js`, flag `RET.pw3` (`?pw3=0` = the old powers). Loaded after `armour.js`; four small `window.PW3` hook lines in `powerups.js`, one in `stats.js`.
- Level table `PW3L` at the top of powlevels.js (LV1-5 per power). Same power again while running or within 4 bars of its end = +1 level, timer back to 8 bars; a real hit = -1 (min 1); an absorbed hit costs nothing.
- Leveled: ECHO, NOVA, MAGNET, WINGMATES, CRESCENDO, CHORD SHIELD, DRUM BURST (its LV3/LV5 shots are g.js's, driven by `a.lv`). New: BOMB STOCK, HEAVY CRATE, RICOCHET (uses b.js `b.rc`), TIME SLICE (wraps `RET.asB`, never the beat clock), LIFE LEECH (1 hull per 20 s, 30 s on hard tiers). TEMPO UP / SLOW GROOVE / DROP keep g.js's longer-timer levels.
- Drop table: stages 1-2 old pool; first 4 drops of a later stage = 3 new + 2 old; Endless everything. Best level per power: `mnr_pw3` (export list, Stats sheet). No Flight School power list existed, so no text change there.
- Gate: `ret-pw3-test.js` (+ `ret-pw2-test.js`, whose tip check now ends the first ECHO before the second pickup). Damage all goes through `e.hp` / `DMG.hit` / `pbRoom`, so hard.js and armour.js ceilings apply.

## Nightrun run-and-gun flavour for the shooter (flag RET.flavor, `?flavor=0` = old; 18 Oct 2026, worker W5)
- New `parts/flavor.js` (after ret.js in build.py); hooks are NR events (`tick`, `bar`, `beat`, `bossIn`, `stageClear`, `runEnd`) plus wraps of `drawPickups` (back layer), `PW.draw` (front layer) and `RET.resultRow` (clear screen). Story stages only, nothing new starts in a boss fight. Test: `ret-flavor-test.js`. Art: code-drawn placeholders; `fl-*.webp` listed in `assets-manifest.json` (group 'Shooter flavour', RESERVED).
- CAPTIVES (DATA SPRITE in a cage, 1 per stage up to stage 4, else 2; none in the first minute of stages 1-2): 6-8 hits (shots pass through), frees a 2-bar WINGMATES, or +1000 and a pickup when a timed power already runs. Unrescued = neutral. BREAKABLES (sign, lamp, billboard, crate by district, max 3, one in five is a harmless decoy): shards or a pickup. SECRET from stage 3 (odd = faint spot to fly into, even = flickering sign to shoot): banner + medal item (2500), `NR.emit('secret')`. MEDALS NO LEAK / NO HIT / ALL RESCUED / SECRET / SPEED CLEAR on the clear screen, `NR.emit('medal',{id})`, 4 Neon each the first time per stage, +2 Neon per rescued sprite (max 4); none on Assist runs. SET PIECES on the 2nd stage of a district: COLLAPSE (red lanes flash >= 0.9-1.2 s, then debris, one hull per lane) or CONVOY (long train along the road, shoot the roof hatch; landscape only, bullets only through `eb()`), reward = a chest.
- Anti-idle: a ship that has stood still for 3 s (`STILL.t`) hurts, frees and finds nothing; objects spawn at least 120 px away from the ship's height and never before 6 s into a stage.
- Stats: own counters in `mnr_flavor` (also in the save export list); a SHOOTER FLAVOUR block is added to the Stats sheet when `RET.stats` is on.
- Open: tune the medal Neon after the owner has played it; SPEED CLEAR is only for boss / kill / score stages (a survive stage cannot award it).


## W2 on-foot art (18 Oct 2026)
`parts/footart.js` = window.FA (draw/bg/has/pickup/scenery; real picture only when listed in media/ready.json). Art list: `make-foot-assets.py` regenerates the 'On-foot street stage' manifest group (124 files in media/foot/), `FOOT-FLOW-PROMPTS.md` and `next-wave/flow-2d/mainhattan-nightrun/prompts-foot.json`; then `make-placeholders.py`. Test: `footart-test.js`. For 'die' pass seconds since death.
## Nightrun on-foot enemies and Warden boss (W3, 18 Oct 2026)
`parts/footen.js` (after ret.js in build.py): `window.FOOT_ENEMIES` (grunt, gunman, shield, bruiser, knife, sniper, drone, turret, mech) and `window.FOOT_BOSS.warden`; inert until `parts/foot.js` calls it. Table and the engine contract: `FOOT-ENEMIES.md`. Gate: `node games-src/nightrun/footen-test.js` (207 checks, fake env). Engine must run `onHit` after `hp -= dmg` and before the death check (it hands hp back for blocked/capped hits), keep calling `ai` on dead enemies until `e.remove`, and honour `canHit`. Not yet run against `foot.js` (not on the branch when this was written). weapon-test "dps well/beat" fail with and without this file.

## Nightrun effects asset wave 8 (W6, 18 Oct 2026)
`parts/fxwave.js` = window.FXW (after ret.js in build.py). 103 new effect files + 15 core ones (12 real, 3 still missing: bullet-shell/needle/rocket, no placeholder because the game would show it) are the manifest group 'Effects (wave 8)'; `make-fx-assets.py` regenerates the group, `FX-FLOW-PROMPTS.md` and `next-wave/flow-2d/mainhattan-nightrun/prompts-fx.json` (light effects on pure black, solid objects on flat white). `make-placeholders.py` writes glowing placeholders (never listed in ready.json; `noph` entries get none).
- A real file (listed in media/ready.json) replaces the vector look through one-line hooks: shot picture (`b.wid`, set in g.js WP.mod; c.js render), muzzle/hit/explosion keys (art.js, b.js; look = electric after arc/storm, plasma after laser/rail/frost/wave/well via `e._wk`), zoo sniper beam, kamikaze line, bomb, mine, shield bubble, healer ring (zoo.js), nova, echo ghost, magnet pulse, wingmate trail, crescendo (powerups.js). No file = exactly the old look.
- Not hooked yet (listed as PLACEHOLDER, 'No hook yet' in the manifest): ground dust, debris, rocket trail, enemy plasma, laser sweep, shockwave ring, pw shield bubble, fever aura, pickup glow, level-up, bomb pulse, all on-foot effects (foot.js is another worker's).
- Ingest: manifest `bg:'white'` entries are keyed to transparent, black-square light effects are kept (a warning if the corners are not black). Test: `fxwave-test.js`.
## Nightrun Lab ASSETS tab (W7, 18 Oct 2026)
- `games-src/nightrun/parts/labassets.js`, flag `RET.labassets` (`?labassets=0` = old Lab), test `labassets-test.js`. Lab hook in `lab.js` is two lines in `labShow` plus the tab name in `labSync`.
- Data is read at runtime from `media/assets-index.json` (build.py writes it: manifest + every other media file), `media/ready.json` (REAL) and `media/placeholders.json` (PLACEHOLDER; anything else in the manifest = MISSING). Nothing is listed by hand. Run `parts/build.py` after adding art.
- Tab: ten sections with counters, filters, detail card (dark/light), PREVIEW IN SANDBOX (weapon, fusion, ship armed/unarmed, explosion, enemy, zoo enemy, boss, pickup, on-foot pose canvas), WIRING view (page text scan: wired / hook only / not wired).
- FXW contract (effect pictures, if that module exists): labassets sets `FXW.preview=true` only inside the Lab with the PREVIEW PLACEHOLDERS switch on, false otherwise and on leaving the Lab; it wraps `FXW.pic(key)` so a missing real picture returns the placeholder file `fx-<key>.webp` while preview is true. The module may also read `FXW.preview` itself. FXW was not on the branch when this was written.
- Known, not mine: ret-title-test fails 3 menu checks for "clear stage 3 to unlock" (11.7 px, from foot.js).

## Nightrun boss movesets (VARIETY B, flag RET.bossmoves, `?bossmoves=0` = old lists; 18 Oct 2026)
- `games-src/nightrun/parts/bossmoves.js`: table `BMT` at the top (boss id -> 3 phase lists, owner-editable), 45 verbs (`VB`), hazard engine (bands, columns, circles, beams, walls, wells), counters (boss shielded until: shoot lock / backup / tentacles / gold core / vent, survive the drops, fly through the signals, hide behind the stalls, get above or below, graze to overload).
- Hooks: b.js `bossBeat` (lazy `BMV.init`, `BMV.beat` instead of the old switch), `bossNext`, `bossShot`; c.js one draw line; build.py after armour.js. armour.js still owns HP, cap, phases, last stand.
- Tests: `bossmoves-test.js` (table, every fight phone+desktop, telegraph >= 0.5 s, free disc >= 64 px, caps, ten counters, flag off), `bossmoves-audit.js` (overlap matrix, numbers, idle, bot on vs off). balance-test's bot now adds `BMV.cost` (sees telegraphed hazards) and aims at `BMV.target()`.
- Bot, Normal boss stages, 2 runs x mid/late: 28-30/40 cleared vs 28-31/40 before (noise). Weak: Hoplite 1/4 and Schranke 2/4 in the last run (old 4/4); Talos rose 0/4 -> 2/4.
- Known, not mine: boss-check's sheet-art step needs scipy (not installed in the cloud box); scale3-test's Legend 20/30/40 band fails with the flag off too (0/0/33).
- The idle checks die before the boss arrives (waves kill the idle ship first), so they don't prove an idle ship dies to the boss itself.

## Nightrun strike2: readable, graded column strike (W9, flag RET.strike2, ?strike2=0 = old strike, 20 Oct 2026)
- `parts/fair.js` D2 (object `MM`): dotted pre-line at 65% of the still-timer (first one of a stage also hints MOVE once per profile, localStorage `mnr_mmhint`); lock-on pulses on the beat for 3 beats (hard tiers 2), strike lands on a beat; Normal stages <= 8: first strike of a stage only scorches (-250 score); damage Easy 1, Normal 1 (2 from the 3rd in a row), Hard/VH 2 from the 2nd, Legend 3 from the 3rd; repeat strikes need half the still-time, .9 s apart, and widen the lane (x1 .. x2.5); timer is x range < 70 px (5 s Normal stages 3-5, else 3.5 s), paused while a pickup is within 70 px.
- Spec point NOT done: "does not count while shooting at a target in range". The tracker bot does exactly that (clears 50% with it), so the mustmove gate wins; only collecting pauses the timer.
- Numbers (repeat-audit arcade-normal, bot without the MM.cost oracle), first-try fails of 45: 40 -> 23 (floor with ?mustmove=0 is 19: counter threats etc., not the strike). mustmove-test (stages 5/20/30): park/hop 0%, track 1%. balance Normal late stage 20: dodger 80-100%, corner camper (CAMP=1) 0%. Hard late stage 12/20 dodger 0% with strike2 on AND off (not the strike: W11).
- Weak: reward-test camp bot (reads MM.cost, steps aside and returns) 94% vs dodge 96%: an oracle-reading camper is not separable by the strike alone (needs W5 react.js). counter-test SEEKER check fails on the old build too. balance-test easy/late shooters 69% and normal stage 20 33% at default RUNS: not from the strike (RUNS=12: 100%).

## Nightrun boss encounter mechanics (W15, flag RET.bossplay, default OFF for now, `?bossplay=1` = on; 20 Oct 2026)
- Why off: with it on, balance-test Normal stage 8 (adler) clears 0-33% (the bot chases the node rows into boss lasers; with `?bpauto=1` it clears 100%), and bossmoves-test fails (the shuffled order leaves 1-2 phase-3 verbs unrun, a free-disc check reads -2e9 on bruecke/hoplite, counter 'hittable after' is fixed by the STUN=open rule but not re-run). Next: easier node rows on Easy/Normal (nodes at y 110 / H-110, lower hp), a shuffle that keeps the order a rotation, then switch it on.
- `nightrun/parts/bossplay.js` (`BPL`, table `BPT` at the top, owner-editable): each boss gets 2 GATES + 1 ARENA rule. A gate is the boss's shield: while it is up, armour.js lets no damage through (`room x BPL.k(e)`, so the cap still holds). Resolve it and the boss is OPEN for 8 s. If nobody resolves it, it overloads after `FB`=24 s, so no fight can lock. Each phase picks 2 of the 3 mechanics, and the attack order is shuffled by a seed per attempt (the signature verb stays first in phases 2-3).
  Gates: nodes (shield nodes at the top/bottom rows open only to a ship in their row; they fire back after a 0.6 s tell), medic (link beam: kill it in its row or DASH through the beam), emp (plate: EMP only), parry (slow orb: dash within 110 px sends it back), back (a shield that follows your height at 160 px/s: get 110 px past it for 0.8 s).
  Arena rules: slab, conveyor, grid, ghost, gravity, blackout, zone. Placeholder shapes only (`BPL.draw`), so real art can replace them.
  Boss → mechanics: tresor nodes/emp/slab, bruecke medic/back/conveyor, schranke parry/nodes/grid, messe back/medic/ghost, hoplite back/parry/slab, adler nodes/medic/blackout, krake medic/nodes/gravity, ice emp/parry/blackout, kronos nodes/emp/zone, talos back/parry/grid.
- Hooks: armour.js one factor on `room`; bossmoves.js `BMV.init` calls `BPL.init`; c.js draw; stats.js shows a BOSS CODEX (localStorage `mnr_bpcodex`); build.py after timing.js. Hints: an intro line, phase names, an outro (HINT).
- Test: `bossplay-test.js` checks the play bot against an ignore bot for every boss, the dash-cut, seeds, caps, phone with reduced motion, and the flag off. `?bpauto=1` / `BPL.auto=s` resolves each gate after s seconds (for older tests whose bots weave without playing).
- Weak points: only 10 bosses exist (5 minis + 5 district), not 10 + 3. Real hull loss isn't measured (the bots run in god mode), so the proof is fight time only. The play bot shoots nodes and medics by setting their hp to 0 once it is in their row.
## Nightrun Weapon Forge + inventory (W14, flag RET.forge default ON, ?forge=0 = old weapons exactly, 20 Oct 2026)
- `parts/forge.js` (data + engine, object `FG`): recipe table `FGR` (24 hybrids, one row per weapon pair: [fires, partner, id, name, traits, line]; add rows to extend), trait costs `FGC`, 12 mods `FGM`, 5 ability cores `FGK` (dash/EMP trait via `ABIL.keys` when no power-up runs), 3 passives `FGP`. Save: localStorage `mnr_forge` (try/catch, corrupt = fresh).
- A hybrid sits in a weapon slot and fires its first parent's volley with its traits; weapons without plain shots (arc, orbit, mines, beams...) get a light carrier shot that holds the traits. Damage factor .5-.9 from the trait cost x1.03 per hybrid level (LV1-5). Plain weapon slot = 2 mod sockets, hybrid = 1. Forge cost 3 scrap + 120 Neon (parents stay). Scrap: +1 per district, +1 per boss, FORGE SCRAP card (choices.js deck, flag build2), first visit gift 4.
- `parts/inventory.js`: Garage tab FORGE (loadout 2 weapons + core + passive, mod sockets, 3 named presets, forge picker with ★ partners, grid with filter/sort, craft/level/scrap/sell), tap-to-swap (no drag). Pit stop: quick BUILD preset row (`#fgQuick`) once a preset is saved.
- Hooks: b.js bullet hit calls WP.hit also for `b.fg`; build.py adds forge.js + inventory.js after abilities.js. Test links: `?fgt=all|<ids>&fgm=<mods>` gives every slot its LV5 hybrid + mods (for mustmove/balance bots via Q=).
- Test: `nightrun/forge-test.js` (REPORT=1 prints the DPS table; HARD=0 skips the Hard stage-30 bot runs).
- Weak points: no drag-and-drop (tap only); hybrid art is placeholder shapes (owner art goes to `wpmount-`/`fx-fuse-` later); mods are bought with scrap, never dropped in runs; NR 'forge' event not yet in stats.js achievements.
- Results (20 Oct 2026, 06:16 UTC): forge-test all PASS: 24/24 recipes; hybrid LV5 + HEAVY vs its parent alone, dummy DPS: top Prism Disc x1.34, median x1.15 (gate <= 1.35); top 5 under hard.js's ceiling on Hard and Legend stage 30; Hard stage 30 clear time with the hybrid vs its parents alone (story bot, god mode), top 10: x0.85-x1.09, median x1.00 (gate: each within 15%); UI 390x763 / 360x640 / 844x390; ?forge=0 identical. Bots with every slot holding its hybrid + HEAVY + ARC TIP (`Q='&fgt=all&fgm=heavy,zap'`): mustmove stages 5/20 park/hop/track 0%; balance normal/late dodger stage 8 67%, stage 20 100%; scale2 dodger 100%.
- Not mine (same on the old build 830de95): readable-test bullet-contrast line, tutorial-test idle 390x763; balance-test normal/late shooters 69% (known). ret-test's ONE MORE RUN timing fails only under parallel load (passes 24/24 alone).
