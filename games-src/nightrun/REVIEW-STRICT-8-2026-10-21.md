# Nightrun strict eighth review (21 Oct 2026, 20:20-21:20 UTC)

Measured on `844dcbb` (build stamp on the page: `4ea7ad9540 · 2026-10-21 19:50 UTC`, includes boss fit e91a86b). Every test used a frozen copy of the built game
(`games/mainhattan-nightrun` copied at 20:20 UTC); audio used a second copy with one test-only line (`window.__AU=AU`) so the audio graph could be tapped. No game code changed.
Tests ran one at a time. Screenshots: 84 phone shots (390x763 and 375x553, DPR 2) in `/tmp/r8/shots` (not committed); file names are quoted as evidence below.
Same 4 personas, 13 lines and weights as reviews 3-7.

## Headline
**HEADLINE 46.3 / 100** (52.5 before, **-6.2**). Mean of the two harshest: V 45.6 and R 46.9. Panel mean 47.6.
The numbers the old gates watch got better (audit hard FAILs moved, boss median 98 s, Normal human-model 50-60%), but this review looked and listened for the first time
and that is where the game falls apart: placeholder art and a debug label on the live street run, a fly screen of 80-140 moving objects with enemies a few pixels wide,
music that is low-passed to 2.5 kHz until you build a combo and ducked about twice a second under a constant 11-per-second tick of hit and shot sounds,
a 25-second text wall before the first stage, and 41 settings. The real-gamer score (12/100) is closer to what a player sees than our gates are.

## 1. Visual (looked at every shot)
| Screen | Defects seen (shot) |
|---|---|
| Title / HOME | Chromatic "glitch" offset on the logo (eye strain on every visit); PLAY subtitle wraps to an orphan "· ARCADE"; three stacked info strips (status, "Next:", STORY) before the 4 tiles; red badges sit on the tile text (MISSIONS "S"); build stamp shown on HOME; 375x553 the stamp wraps (01-title-fresh-a, 02-home-a, 02-home-b) |
| Section screens | MISSIONS / TRAINING: 45-50% of the screen empty below 4-5 pills; first pill magenta, others purple for no reason; Neon diamond yellow here, cyan in HANGAR, gem icon on prices: 3 currency glyphs (03-missions-a, 05-training-a, 04-hangar-a) |
| HANGAR (all tabs) | 10 tabs + an orphan PICK row eat 640 of 1526 px; then ~250 px of empty wallpaper before the list starts; list clipped at the bottom with a cut "RECOMMENDED" badge (04, 08, 10, 11-17) |
| Weapons | Weapon preview is a code placeholder (triangle + red dots); "power 1.21x → / 1.28x" and weapon names break mid-value (08-weapons-a) |
| Forge | Weapon icon is a pink "PU" circle (placeholder); 3 steps + hint + partners + text box: a lot of reading for one merge (09-forge-a) |
| Pilot | Class icons are plain shapes (triangle, ring, bar, diamond, dot); header says "ROOKIE (none)" while GUNNER is outlined as picked; "OVERCLOCK" appears unexplained (17-pilot-a) |
| Stage map | Detail card covers the selected node (node 25 sits on "ACT IV"); bottom sheet hides 40-60% of the map and stage 24; "ARCADE ~3 MIN" while stages measure 93 s (07-stagemap-a/b) |
| Settings | Row labels sit on the frame border; DATA tab clipped at the right edge; third Music option ("new only") clipped under the footer; heavy ornate frame per row; defaults MUSIC 45% / EFFECTS 80% (18, 19, 20-settings-*) |
| Lesson mini stage | All placeholder shapes (cyan triangle ship, pink discs, grey bars) unlike the real game; "TRY AGAIN" shown before the player did anything (22-lesson-stage-a) |
| Fly stages 2/6/10/14/20 | Enemies 10-25 px on a 390 px screen, dark on a dark busy backdrop; skyline art overlaid with a circuit-board tile = mud, visible tile seams (tower cut at y~830 in st2); 2-3 large translucent rings (~210 css px) and a row of red ">" flank chevrons on most frames; dashed centre line, HEAT, LINE, x1.0, x1, shield, "x~52s" orange label nobody can decode (24-28-*-a); 375x553: field shrinks, the button column overlaps the field edge, "x~64s" sits between buttons (26-st10-mid-b) |
| Bosses (st 8 / 24 / 40) | Boss drawn ~90 css px, parked at the left edge while the ship fires straight up; armour plates are white rectangles on the sprite; stage-40 full-height white laser (bright, eye strain); stage-40 backdrop mixes painted Parthenon with flat grey boxes and a clipped "HOLDS" label (29, 30, 31-boss-*) |
| Result | Buttons misaligned (NEXT STAGE left, two below off-centre); "2.417 Neon" with a dot separator vs "2400" elsewhere; logo glitch effect again; feedback row under everything (32-result-a) |
| Pit stop | Three cards with ~50% empty padding; "Nothing affordable yet · Garage: 62 ready" mixes two economies (32b-pitstop-a) |
| Pause | "PAUSED" and "PAUSE" both shown; left-aligned block in the middle of an empty screen (33-pause-a) |
| Street run | **Debug text on the live page: "bg-street-sky (placeholder)"** over flat purple rectangles; player cut off at the right edge while fighting; drones overlap the score and pause button; HUD panel is a plain box; bottom 30% is a black control pad (34-street-sec*-a). Note: my bot only reached sections 1-2 and the Warden gate; 3-7 were not captured |
| Lab | German "WARNUNG" banner half hidden under the panel; raw id "ZDRN" as a chip label; tab row clipped (35-lab-a) |
| Endless | Two ~420 px purple ring markers dominate, 5 flank chevrons, enemies tiny (36-endless-w15-a) |

## 2. Audio (40 s real time per scene, music pack Mix, analysers on music bus, effects bus and master)
| Scene | SFX played /s | top ids /s (max in 1 s) | repeats < 120 ms | SFX calls /s (before rate limit) | voices max | peak dBFS | clips | SFX - music RMS | music ducks /40 s |
|---|---|---|---|---|---|---|---|---|---|
| Stage 2 | 12.7 | hit 5.5 (12), shot 3.8 (5), boom 1.8 (10), pick 1.1 (14) | hit 152, pick 22, boom 21 | 23.6 | 19 | -5.4 | 0 | **+2.4 dB** | 77 |
| Stage 10 | 14.4 | hit 7.3 (12), shot 3.9, pick 1.6 (11) | hit 210, pick 28 | 44.3 | 18 | -7.8 | 0 | +0.2 dB | 46 |
| Stage 20 | 13.8 | hit 7.7 (13), shot 3.9 | hit 263 | 60.3 | 14 | -7.9 | 0 | -1.4 dB | 42 |
| Boss (st 8) | 11.3 | hit 5.5 (11), shot 3.6 | hit 133 | 23.3 | 15 | -12.7 | 0 | -1.7 dB | 50 |
| Endless (start + its first boss; the jump to wave 15 did not take) | 12.1 | hit 6.4 (11), shot 3.7 | hit 102 | 25.3 | 16 | -10.0 | 0 | -2.5 dB | 19 |
Read: **no clipping, the limiter never works** (0 dB reduction). The "distortion" the owner hears is (a) the `layers` low-pass on the music: 2500 Hz at combo tier 0-1, dropped to **900 Hz on every hit** (`lyHit`), so the song is muffled most of a run;
(b) `duckMusic` on every boom / hurt / EMP: **1-2 dips per second**; (c) a constant tick layer: `hit` (triangle 220 Hz, 50 ms) is at its rate-limit ceiling, 5.5-7.7/s, 12-13 in a busy second, and `shot` 3.8/s for the whole run, so ~11 identical ticks per second sit on top of the music;
SFX are as loud as or louder than the music (+2.4 to -2.5 dB; a beat game wants SFX >= 6 dB under the music). Defaults MUSIC 45% vs EFFECTS 80% make it worse. Offenders: hit, shot, pick (bursts of 11-14/s), boom (10/s bursts), the duck, the low-pass.

## 3. Difficulty (headless human-model suite, mid build, RUNS=10 per cell; owner/late builds on Legend as a check)
| Bot | Easy st 3/10/20 | Normal | Hard | Legend |
|---|---|---|---|---|
| human-model | 100/100/100 | **60/60/50** | 10/30/0 | **0/0/0** (owner build 0/0/0) |
| oracle dodger | 100/100/100 | 90/100/70 | 60/30/20 | 10/0/0 (owner 20/0/0) |
| no-oracle sharp (90 ms, no lapses) | 100/100/100 | 60/40/70 | 30/10/0 | 0/0/0 |
| no-dash | 100/100/100 | 20/30/60 | 30/0/0 | 0/0/0 |
| beat-timed dash | 100/100/100 | **100/90/90** | 80/30/20 | 20/0/0 (owner 40/0/0) |
| random dash/EMP | 100/100/100 | 90/40/40 | 0/10/10 | 0/0/0 |
| camper x=70 | 0/0/0 | 0/0/0 | 0/0/0 | 0/0/0 |
Endless (human / oracle / sharp): Normal wave 10 100/100/100, wave 25 10/20/30; Legend wave 10 **0/0/0**.
- Normal is fixed by the numbers: human 57% (target 60-85), beat 93% vs no-dash 37%: **the beat now matters**. Easy is flat 100% with 0-3 hits: no challenge at all.
- **Legend is not easy for any bot** (human-model 0%, target <= 25%: PASS on paper). The owner's "very easy on Legend" does not come from the setting failing: I set LEGEND in the settings UI, it reached the stage (DF d 4.7, bs 2.4, fr 6.6) and survived a reload.
  What the player SEES barely changes: enemy bullets on screen (median / p95) at stage 10: Easy 6/13, Normal 8/17, Legend 11/20; stage 3: 7/16 vs 10/22. A parked ship dies after 19.4 s on Normal and 15.5 s on Legend.
  Legend also starts with **6 hull vs 5 on Normal**. So Legend is a speed test the eye cannot read as "harder", and a human with direct touch steering (520 px/s, 1.5x finger gain) is far better than the 180-200 ms bot model. Verdict: the bots cannot reproduce the owner's claim; the felt difficulty contrast is too small. Needs a live play log from the owner (stage, mode, build) to settle.
- Camper 0% on every difficulty: camping is punished (good), but so hard that it is not a measurement of anything.

## 4. Complexity and clarity
- On-screen objects per frame (60 s bot runs, 960x540 field): stage 3 median 80 / p95 120 / max 143; stage 10 55 / 79 / 96; stage 20 83 / 119 / 143; endless 62 / 88 / 104. Of these only 3-9 are enemies and 8-25 enemy bullets; the rest is the player's own bullets (up to 64), particles (29), rings (up to 14) and flashes. **The player's own effects are 60-70% of everything on screen.**
- HUD items in a fly stage: score, multiplier, combo x1, chain bar, hull pips, HEAT bar, LINE bar, shield count, boss bar, phase dots, progress line, "x~NNs" label, pause, DASH, EMP, plus ring markers and flank chevrons: **15+ distinct items**.
- Settings: **41 controls** (36 segment rows + 5 sliders) in 5 groups; `hc` and `rm` appear twice.
- Taps from HOME: every feature in <= 2 taps (hub-test), but HANGAR alone has 10 tabs + PICK.
- First 30 seconds for a new player: 6 opening cards (auto 4.3 s each), then a briefing card that waits for a tap; **the first enemy is met after ~25 s of text**. The player must then understand drag, auto-fire, the gold beat shot, DASH, EMP, HEAT, LINE and the x~ label with only "NEW: move to dodge. Shots on the beat glow gold" said.

## 5. Story
- A first-time player meets the story at once (6 opening cards in 21 s, then the stage-1 briefing). Too much at once, all before play.
- Cast contradiction: the opening card calls **LUMEN "Mechanic, a garage on the Mainufer"**; the cast table names LUMEN the city AI and PFANN the mechanic.
- In stages 1-5 (stepped, god mode) I saw one in-stage comms line (stage 4, the mini-boss) and the chapter text on the stage-4 result. The stage-1 briefing card stayed in the page while the engine was stepped under it (scripted stepping, may not happen with a real tap); a real overlap test is still owed.
- The stage start banner ("1 · FIRST RUN / Deliver the data. Stay alive.") is drawn over a field where enemies already fire (23-briefing-st1-a).

## 6. Organisation
- Built `index.html` 1.73 MB; media 127 MB; parts 1.70 MB in 103 files (largest g.js 63 KB, foot.js 63 KB, ret.js 54 KB).
- 101 `*-test.js` files; `TEST-LEDGER.md` is from 20 Oct (66 tests, 40 NOT-RUN): stale. Bot suites run fast (7 bots x 3 stages x 10 runs in 30-50 s).
- **WHERE.md is stale**: `where.py --check` fails; no rows for `hub`, `comfort`, `bossfit`.
- guard.py: ok, 34 old parts without the FLAG/TEST header. `games-src/HANDOFF.md` is 157 KB (the file agents are told to read first). 37 markdown files (1.2 MB) in nightrun/.

## 7. Industry audit and headline
`--gate` exit 1: **20 PASS / 10 FAIL (hard: S23 0.49, S30 0.67x) / 2 SKIP** (review 7: 21 / 9 / 2, hard S01, S10). S01 now 1.5 s PASS, S10 98.4 s PASS. New/still FAIL: S03 2.9 s, S04 10.4, S06 1.31, S20 2.45/min, S22 0.97, S23 0.49 (hard), S28 2 assists, S29 5.72, S30 0.67x (hard; was 5x), S31 0.31.

### Panel (same lines and weights; first 30 min / hour 3)
| # | Line | W | V | R | M | P |
|---|---|---|---|---|---|---|
| 1 | Core feel | 14 | 5.0/4.5 | 5.0/4.5 | 5.5/5.0 | 5.5/5.0 |
| 2 | Variety | 16 | 6.0/5.5 | 6.3/5.8 | 6.5/6.3 | 6.3/6.0 |
| 3 | Bosses | 8 | 5.0/4.5 | 5.2/4.5 | 5.5/5.0 | 5.8/5.0 |
| 4 | Difficulty | 10 | 5.0/4.5 | 5.0/4.5 | 5.2/4.6 | 5.0/4.5 |
| 5 | Build depth | 8 | 4.5/3.8 | 4.5/3.6 | 5.0/4.0 | 4.8/3.8 |
| 6 | Music / beat | 8 | 4.0/3.5 | 3.8/3.5 | 4.3/3.8 | 4.3/3.8 |
| 7 | Readability | 8 | 4.0/3.5 | 4.5/4.0 | 4.5/4.0 | 4.5/4.0 |
| 8 | Audio | 4 | 2/2 | 2/2 | 2.5/2 | 3/2 |
| 9 | Onboarding | 6 | 4.8 | 4.8 | 4.5 | 5.0 |
| 10 | Progression | 8 | 5.0/4.2 | 5.0/4.0 | 5.2/4.3 | 5.0/4.0 |
| 11 | On-foot | 3 | 4.0/3.5 | 4.0/3.5 | 4.0/3.5 | 3.5/3.0 |
| 12 | Touch | 5 | 5.5 | 6.5 | 6.5 | 5.5 |
| 13 | Polish | 2 | 3.5/3.0 | 4.0/3.5 | 4.0/3.5 | 3.5/3.0 |
| | **Weighted 30 / h3** | | 47.9/43.3 | 49.4/44.4 | 51.9/47.1 | 51.0/45.6 |
| | **Reviewer** | | **45.6** | **46.9** | 49.5 | 48.3 |
- V: "Muffled music, a tick-tick-tick on top, things I can barely see, and a street level with 'placeholder' written on the sky."
- R: "On Normal the beat dash finally matters. On Legend the screen looks the same as Normal, just faster."
- M: "Lots of content, but half the menus are empty space and the other half are ten tabs."
- P: "No clipping, but SFX at music level, 2 ducks a second, a 900 Hz low-pass on every hit. 41 settings. WHERE.md stale."

## 8. Defects
| id | area | sev | evidence | owner |
|---|---|---|---|---|
| D01 | audio | S1 | music low-passed 2500 Hz at tier 0-1, 900 Hz on every hit (`lyHit`, a.js lpHz) | Sonnet |
| D02 | audio | S1 | `duckMusic` 42-77 times per 40 s (1-2/s) on boom / hurt / EMP | Sonnet |
| D03 | audio | S1 | `hit` 5.5-7.7 plays/s (12-13 in a second, 102-263 repeats < 120 ms per 40 s), `shot` 3.8/s all run | Sonnet |
| D04 | audio | S2 | SFX RMS = music RMS (+2.4..-2.5 dB); defaults MUSIC 45% / EFFECTS 80% | Haiku |
| D05 | audio | S3 | `pick` bursts 11-14/s, `boom` bursts 10/s | Sonnet |
| D06 | street | S1 | "bg-street-sky (placeholder)" text and flat boxes on the live street run (34-street-sec3-a, sec8-a) | Haiku (hide label) + assets |
| D07 | fly visual | S1 | enemies 10-25 css px, dark on dark busy backdrop; circuit tile over skyline = mud, visible seams (24-28) | Opus |
| D08 | clutter | S1 | 80-143 objects/frame, 60-70% are the player's own bullets / particles / rings (clutter.log) | Opus |
| D09 | clutter | S2 | 2-3 big translucent ring markers (~210 css px) and red flank chevrons on most frames (24, 28, 36) | Sonnet |
| D10 | HUD | S2 | 15+ HUD items; "x~52s" label undecodable; HEAT / LINE / x1 / x1.0 side by side | Opus |
| D11 | difficulty | S2 | Legend looks like Normal: bullets p95 20 vs 17 at st 10; parked death 15.5 vs 19.4 s; Legend hull 6 > Normal 5 | Opus |
| D12 | difficulty | S2 | Easy 100% for every bot, 0-3 hits: no challenge | Sonnet |
| D13 | onboarding | S1 | ~25 s of story cards before the first enemy (story.log) | Sonnet |
| D14 | story | S2 | LUMEN called "Mechanic" in the opening; cast table says city AI, PFANN = mechanic | Haiku |
| D15 | bosses | S2 | boss ~90 css px parked at the left edge; armour plates as white rectangles (29-31) | Sonnet |
| D16 | eye strain | S2 | full-height white laser (31-boss-st40); logo chromatic offset on HOME / result / pause | Haiku |
| D17 | backdrop | S2 | stage 40: painted Parthenon + flat grey placeholder boxes + clipped "HOLDS" (31-boss-st40) | assets + Haiku |
| D18 | lesson | S2 | lesson mini stages use placeholder shapes, "TRY AGAIN" before any input (22-lesson-stage-a) | Sonnet |
| D19 | hangar | S2 | 10 tabs + orphan PICK, ~250 px dead wallpaper, list clipped (04, 08-17) | Sonnet |
| D20 | menus | S3 | MISSIONS / TRAINING 45-50% empty; first pill a different colour (03, 05) | Haiku |
| D21 | UI | S3 | 3 currency glyphs and 2 number formats ("2.417" vs "2400") | Haiku |
| D22 | weapons/forge/pilot | S2 | placeholder icons: weapon preview shapes, "PU" circle, class shapes (08, 09, 17) | assets + Haiku |
| D23 | pilot | S3 | "ROOKIE (none)" while GUNNER outlined; OVERCLOCK unexplained (17) | Haiku |
| D24 | stage map | S3 | detail card covers the node; sheet hides 40-60% of the map; "ARCADE ~3 MIN" vs 93 s stages (07) | Haiku |
| D25 | settings | S2 | 41 controls, duplicates hc / rm; DATA tab clipped; 3rd music option clipped; labels on frame borders (18-20) | Sonnet |
| D26 | result/pause | S3 | misaligned result buttons; PAUSED + PAUSE (32, 33) | Haiku |
| D27 | 375x553 | S3 | button column overlaps the play field; "x~64s" between buttons; stamp wraps (26-st10-mid-b, 02-home-b) | Haiku |
| D28 | lab | S4 | "WARNUNG" half hidden; raw id "ZDRN"; tab row clipped (35-lab-a) | Haiku |
| D29 | street | S2 | player cut off at the right edge in combat; drones over score / pause (34-street-sec3-a) | Sonnet |
| D30 | audit | S2 | hard FAILs S23 0.49 (first-try no-oracle) and S30 0.67x (answer value, was 5x) | Sonnet |
| D31 | audit | S3 | S03 2.9 s, S04 10.4, S06 1.31 (late stages not denser), S20, S22, S28, S29, S31 | Sonnet |
| D32 | docs | S3 | WHERE.md stale (no hub / comfort / bossfit); TEST-LEDGER from 20 Oct (40 NOT-RUN); HANDOFF.md 157 KB | Haiku |
| D33 | story | S3 | stage-start banner drawn over live fire (23-briefing-st1-a); in-stage overlap test still owed | Sonnet |
| D34 | home | S4 | build stamp on HOME; red badge over tile text (02-home-a) | Haiku |

## What is wrong, in plain words (for the owner)
The game sounds bad because of three things we built on purpose: the music is muffled until you build a combo and muffled again every time an enemy is hit, it dips in volume one or two times a second, and a short "tick" plays about eleven times a second for every shot and hit, as loud as the music. Nothing clips; it is our own effects. It looks bad because the screen is full of our own bullets, sparks and big circles while the enemies are tiny and dark on a busy, dark background, and several screens still show placeholder shapes, one even shows the word "placeholder" on the street level. Menus are either half empty or have ten tabs; settings have 41 switches. A new player reads 25 seconds of story before seeing an enemy, and is told almost nothing about what the bars mean. On difficulty: our bots die on Legend every time, so the setting works, but Legend looks almost the same as Normal (only about a quarter more bullets, just faster, and one extra hull), so it does not feel harder; Easy is a walk-over. Normal is now about right.

## Fix list (top 25, in order)
| # | Fix | Tier |
|---|---|---|
| 1 | Music always open: remove the tier low-pass and the 900 Hz hit dip (keep drums-by-tier), stop ducking except for the boss-in sting | Sonnet |
| 2 | One quiet shot sound per beat at most; `hit` max 4/s with pitch/volume variation, merged into the beat; no per-hit tick on Normal kills by default | Sonnet |
| 3 | Mix: SFX bus 6-8 dB under music; defaults MUSIC 70% / EFFECTS 50%; pick/boom burst caps (2 per 250 ms) | Sonnet |
| 4 | Hide every placeholder label in live builds (street sky text, raw ids) and block it with a guard check | Haiku |
| 5 | Player-effect diet: own bullets half alpha and fewer, particles cap 12, no rings larger than 120 css px, flank chevrons only for 0.6 s before an entry | Opus |
| 6 | Enemy readability: enemies >= 32 css px with a light rim; backdrop dimmed 40% and the circuit tile removed under play | Opus |
| 7 | HUD diet to 6 items (score, hull, boss bar, DASH, EMP, pause); HEAT / LINE / x~ behind FULL HUD | Opus |
| 8 | Legend that looks harder: +50-80% visible bullets, Legend hull <= Normal, faster telegraphs; Easy with real pressure (human-model 85-95%, not 100% with 0 hits) | Opus |
| 9 | First 30 s: opening cut to 2 cards (max 8 s) after the first wave, not before; briefing one line on the start banner | Sonnet |
| 10 | Fix LUMEN / PFANN mix-up in the opening text | Haiku |
| 11 | Bosses drawn at >= 140 css px, centred lane, plates as art not white boxes; ship auto-aims at the boss on Normal | Sonnet |
| 12 | Eye strain: white full-height laser to a tinted beam with 60% alpha; drop the logo chromatic offset | Haiku |
| 13 | HANGAR: 5 tabs (Ship, Weapons, Forge, Pilot, Upgrades) + one MORE sheet; list starts under the tabs; no dead wallpaper | Sonnet |
| 14 | Settings to <= 20 controls; remove duplicates; move assists to one Assist page; fix clipped tab and option | Sonnet |
| 15 | Lessons drawn with the real sprites; no TRY AGAIN before input | Sonnet |
| 16 | Hard audit FAILs: S30 answer value back to >= 2x, S23 first-try no-oracle 55-90% | Sonnet |
| 17 | Late-stage density ramp (S06 >= 1.5) and S04 mean bullets >= 12, without raising clutter (fix 5 first) | Sonnet |
| 18 | Street run: camera keeps the player in the left third; HUD panel styled; drones kept off the HUD | Sonnet |
| 19 | One currency glyph and one number format everywhere | Haiku |
| 20 | MISSIONS / TRAINING / PROFILE: centre the pills, same colour, no half-empty screens | Haiku |
| 21 | Result and pause layout: centred buttons, one title | Haiku |
| 22 | 375x553: controls below the field, label above buttons | Haiku |
| 23 | Stage map: card beside the node, sheet half height, real stage length | Haiku |
| 24 | Regenerate WHERE.md, rerun the TEST-LEDGER, split HANDOFF.md under 20 KB | Haiku |
| 25 | Live overlap test for story cards and the start banner on stages 1-5 (real taps, `?story=2`) | Haiku |

## Assets the owner should supply
- Street run: sky and street backgrounds (3 layers per section), HUD panel frame, Warden arena.
- Stage-40 backdrop buildings to replace the flat grey boxes; a clean dark backdrop variant per district for play (no circuit tile).
- Boss armour-plate art (per boss) to replace the white rectangles; a tinted laser beam sprite.
- Weapon icons (16) and in-card weapon previews; hybrid / forge icons; 5 pilot-class portraits.
- Lesson mini-stage sprite set (or permission to reuse the stage sprites).
- Enemy sprites at a larger base size with a light rim, and small-ship markers for fleet ships.
- Sound: a soft beat-locked shot, 3-4 varied hit sounds, a quiet pickup, 1-2 explosion layers (current ones are code synth ticks).

## Reproduce
Scripts in `/tmp/r8` (not committed): `shots.js` (84 shots), `story.js` (`?story=2`, first 60 s real time), `clutter.js` / `dens.js` (objects per frame, density per difficulty),
`audio.js` (GAME_DIR = build copy with `window.__AU=AU`), `legend.js` (Legend set through the settings UI), `hb.js` = `humanbot.js` + bots sharp / nodash / beat / random / camper
(`DIFF=<d> BOTS=human,dodger,sharp,nodash,beat,random,camper BUILDS=mid STAGES=3,10,20 RUNS=10`; endless `ENDLESS=1 STAGES=10,25`).
Audit: `CONFIGS=arcade-normal repeat-audit.js`, then `SEEDS=5 REPEAT=<f> industry-audit.js --gate`. All with `NODE_PATH=$(npm root -g) GAME_DIR=<frozen copy at 844dcbb>`, one at a time.
