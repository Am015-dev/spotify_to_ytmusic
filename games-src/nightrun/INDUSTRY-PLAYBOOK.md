# Nightrun industry playbook: what pros do, how we measure it, where we stand (21 Oct 2026)

Why: owner: "boring, eye straining, impossible to understand, not strategic, full of visual flaws" (review 8: 46.3).
This file adds the LOOK / COMFORT / CLARITY side to `INDUSTRY-STANDARDS.md` (S01-S32 = enemies, pacing, bosses, decisions; not repeated here).
Ids PB01-PB24. Each has a principle, its source (site name), an automatable gate, and today's number.
Measured on `d924372`, built `games/mainhattan-nightrun`, headless Chromium 390x763 DPR 2, Normal, god-mode sweeping bot, stages 2 / 10 / 20 + stage-8 boss,
10 s of play at 30 fps per scene (flash, shake, object counts) + 2 frozen frames per scene rendered 5x (all / no enemy bullets / no enemies / no player bullets / backdrop only) for pixel contrast.
Method as `readable-test.js` (render a frame with/without a layer; the diff is that layer); scratch script not committed; 4 phone frames checked by eye.

Caveats: god mode + scripted stepping produced **0 shake and 0 flashes** (`comfort-test.js` covers them); player-bullet numbers are thin (bot rarely fired). The fresh-load "time to first enemy" probe failed (PLAY button not found by id); review 8's 25 s is quoted instead.

## 1. Readability (the screen must answer "what kills me?" in one glance)
Practice: enemy bullets are the brightest, most saturated thing on screen and may even clash with the art palette; small bullets drawn over big ones; player shots, enemies, hazards and pickups each own a colour that nothing else uses; player shots are semi-transparent / low-contrast; the backdrop is dark, low-detail and low-saturation behind the play band; the player hitbox is a small, always-visible dot (Game Developer "Bright, Slow, and Deadly"; shmups.wiki bullet-hell 101; itch.io bullet-hell jam tips and many jam reviews: "player bullets matching enemy bullets made it harder to read", "too many bullet colours hurt later bosses").

| Id | Gate (automatable) | Today (st2 / st10 / st20 / boss8) | Verdict |
|---|---|---|---|
| PB01 | Enemy-bullet luminance contrast vs local backdrop (6 css px ring), p10 >= 3:1, median >= 7:1 | median 16.9 / 14.7 / 14.1 / 17.0; **p10 11.6 / 1.42 / 1.44 / 1.75** | median PASS, worst 10% FAIL: bullets vanish over lit towers, lanes and FX |
| PB02 | Enemy contrast vs backdrop, median >= 3:1 | **3.7 / 1.42 / 1.40 / 5.7** | FAIL st10, st20: dark enemy sprites on a dark painted city |
| PB03 | Enemy on-screen size >= 28 css px (7% of 390), bosses >= 120 css px | by eye 20-30 css px; boss8 ~55 css px wide (magenta line drawing) | FAIL |
| PB04 | Hue ownership: enemy-bullet hues and pickup hues share no 30-degree bucket; player hues not used by enemy bullets | enemy bullets orange/yellow (25 of 35 blobs); **pickups are gold-yellow orbs**; boss8 enemy = magenta = some bullet stars | FAIL: "gold = good" and "orange/yellow = death" overlap |
| PB05 | Max distinct enemy-bullet hue buckets per scene <= 3 | 1 / 3 / 3 / 2 | PASS |
| PB06 | Backdrop behind the play band: mean luminance <= 0.08, luminance gradient (busyness) <= 0.010 | L 0.01-0.02 PASS; **busy 0.011 / 0.020 / 0.017 / 0.014** | FAIL: detailed towers, windows, rails at full detail under bullets |
| PB07 | Non-threat overlays (rings, lanes, zone circles, chevrons, edge bars) <= 5% of field area, none crossing the ship | by eye: full-height teal lane (st10, ~25% width), 2 green zone circles ~120 css px (st20), purple ring markers (st2), red edge bars + chevrons | FAIL |
| PB08 | No debug or placeholder graphics in a shipped frame (pixel hash of known placeholders = 0) | crossed orange "X" box (st10), boss drawn as magenta outline (boss8), overlapping "LEAK 2/2" text drawn twice (st2), tiny rotated "shielder" label (st20) | FAIL |

## 2. Visual polish ("juice", but on a budget)
Practice: a hit needs anticipation (wind-up / telegraph), impact (hit-stop 50-120 ms on heavy hits only, flash on the struck sprite, not the screen) and follow-through (particles, number); screen shake uses a "trauma" value squared and decaying, reserved for big events; restraint matters: juice cannot fix poor responsiveness (GDC "Juice it or lose it"; trauma-shake model credited to a GDC math talk; wayline.io game-feel lessons; eastondev "where does game feel come from"). One light direction and one palette per stage; parallax only on far layers.

| Id | Gate | Today | Verdict |
|---|---|---|---|
| PB09 | Every boss attack has a telegraph >= 0.5 s before first damage (`bmMark`/`bmTelBul` logged) | boss verbs have marks (bossmoves.js); not measured here | SKIP (add to bossmoves-test) |
| PB10 | Shake: amplitude <= 1.5% of short side; shaking frames <= 10% of play; hit-stop only on kills of elites / boss phase breaks | 0 in sim (not triggered) | SKIP here; comfort-test owns it |
| PB11 | Player's own stuff (shots, muzzle, rings, particles) <= 35% of moving objects | review 8: **60-70%** (80-143 objects/frame) | FAIL |
| PB12 | HUD: <= 6 items during play, all outside the play band | review 8: 15+ items; my frames: score, hull pips, progress bar, 3 big buttons, plus in-field "x4 +30%", "READY" over enemy fire | FAIL |

## 3. Pacing and strategy (why it reads as "boring, dumb")
Practice: intensity drawn as a curve with peaks AND valleys; a breather before the climax; contrast keeps a level compelling (World of Level Design pacing series; bugnet encounter pacing). Risk/reward: grazing (skimming bullets) pays score/meter; bombs are stored and the player decides when to spend; graze rewards must not stack so risk stays real (shmups.system11 forum design threads; reviews of graze-based shooters). Enemy roles that need different answers (shielded, flanker, sniper, swarm). Bosses are readable puzzles: few attacks per phase, each with a tell and a safe answer. Difficulty by pattern shape and speed, not by bullet count.

| Id | Gate | Today | Verdict |
|---|---|---|---|
| PB13 | Intensity curve: per 10 s bucket (enemy bullets x speed + enemies), >= 1 valley < 50% of the stage peak every 45 s | not computed; `pacing.js` exists; review 8 calls play "one long flat swarm" | TODO gate |
| PB14 | Risk/reward: score share from a risky act (graze / beat-dash / close kill) >= 30% for a top bot, < 10% for a safe camper | not measured; beat-dash 93% vs no-dash 37% clear (review 8) shows the beat matters | TODO gate |
| PB15 | Kill-by-role diversity: the best answer differs per role; Shannon entropy of (role -> weapon/ability used) >= 1.5 bits | S30 answer value 0.67x (hard FAIL, review 8) | FAIL |
| PB16 | Difficulty contrast: Legend vs Normal must change what the eye sees (pattern kinds, speed), bullets p95 not just +15% | p95 20 vs 17 at st10 (review 8) | FAIL |

## 4. Onboarding
Practice: teach by doing, one idea at a time, a visible goal in the first minute, constrain the first screen; never a wall of text; text advances on tap, never on a timer (uxplanet "interact, don't tell"; kompassify FTUE guide; Game Accessibility Guidelines "player pacing").

| Id | Gate | Today | Verdict |
|---|---|---|---|
| PB17 | Fresh load to first enemy on screen <= 8 s, <= 2 taps | review 8: ~25 s of story cards | FAIL |
| PB18 | Each new mechanic shown alone, in play, with <= 7 words; mechanics shown before stage 3 <= 3 | review 8: drag, auto-fire, beat shot, DASH, EMP, HEAT, LINE, x~ label at once | FAIL |

## 5. Comfort and eye strain
Practice: no more than 3 flashes in any 1 s (WCAG 2.3.1, w3.org; the Harding test applies the same idea to video and TV); avoid flicker and repeating patterns; high text/UI contrast (4.5:1); options to turn off background movement, shake and flashes (Game Accessibility Guidelines; WCAG understanding docs; accessibility settings in big releases: camera shake None/Reduced/Full, photosensitivity mode).

| Id | Gate | Today | Verdict |
|---|---|---|---|
| PB19 | WCAG-style flashes per 1 s window <= 3 (16x32 luminance grid, >= 25% of cells change >= 0.1, opposing pairs) | 0 in all four scenes | PASS (sim only) |
| PB20 | Saturated red area <= 2% of screen per frame | max 0.2% | PASS |
| PB21 | No full-screen-height bright beams (luminance > 0.8 over > 20% height) without a 0.5 s dimmed warning | review 8: full-height white laser (st40); my st10: full-height teal lane | FAIL |
| PB22 | Logo/text effects: no chromatic offset or jitter on static text | review 8: HOME, result, pause | FAIL |

## 6. QA practice
Practice: tiered tests (smoke per change, regression per merge, full device farm before release); soak during active play (30 min-4 h) for memory and frame drift; device matrix chosen from audience risks, not counts; capture fps / memory per build and compare; track drop-off per onboarding step (oceanviewgames QA best practices; bugnet long-session stability; drizz device matrix; GameBench).

| Id | Gate | Today | Verdict |
|---|---|---|---|
| PB23 | Every push: smoke (load, 1 stage, 0 page errors) + pixel gates PB01-PB08 on 3 frozen frames at 390x763 and 375x553 | 0 page errors here; PB gates not in CI | TODO |
| PB24 | Weekly 30-min soak at 390x763: fps p5 >= 50, heap growth <= 10% | not run | TODO |

## 7. Ranked fix list (top 12)
| # | Problem (evidence) | Industry fix | Gate | Size | Owner file (WHERE.md) |
|---|---|---|---|---|---|
| 1 | Enemies dark on dark city, contrast 1.4:1 (st10/20), 20-30 css px | Rim light / bright outline + one owned hue per enemy; scale fodder to >= 28 css px | PB02 median >= 3:1, PB03 | M | foeart.js (FOEART), art.js |
| 2 | Backdrop too detailed under bullets (busy 0.014-0.020) | Dim + blur the play band (dark scrim 40-60%, detail only at screen edges), far layers only parallax | PB06 busy <= 0.010, PB01 p10 >= 3:1 | S | bg/draw (backdrop), readable.js |
| 3 | Pickups gold = enemy bullets orange/yellow | Colour grammar: enemy bullets magenta/orange only, pickups green/cyan, player shots pale blue at 50% alpha | PB04 no shared hue bucket | S | bulletart.js, powerups.js, art.js |
| 4 | Placeholder / debug graphics in play (X box, outline boss, duplicate "LEAK" text, "shielder" label) | Ship nothing unfinished; a missing asset falls back to a finished generic sprite, never a label | PB08 = 0 | S | leak.js, shapes.js, bossvis.js |
| 5 | Overlays: full-height lane, zone circles, rings, chevrons, edge bars | One overlay at a time, thin, 20-30% alpha, off the ship; telegraph then fade | PB07 <= 5% area | M | holdline.js, anticamp.js, flankers.js, fxwave.js |
| 6 | 60-70% of moving objects are the player's own | Fewer, fatter, translucent player shots; particles capped (e.g. 24) | PB11 <= 35% | M | diet.js, fxwave.js, polish.js |
| 7 | 25 s of story before the first enemy; 8 mechanics at once | Play first: enemy within 8 s, story after stage 1; one mechanic per lesson, tap to advance | PB17, PB18 | M | story.js / tale.js, tut.js, lessons.js |
| 8 | Boss ~55 css px magenta outline, parked at the edge | Boss >= 120 css px, centred, 2-3 readable attacks per phase, each with a 0.5 s tell | PB03, PB09 | L | bossvis.js, bossmoves.js, armour.js |
| 9 | HUD 15+ items, text over the field ("READY", "x4 +30%") | 6 items max, all in the top bar; banners only in valleys | PB12 <= 6 | M | hud (looks), uikit.js |
| 10 | No valleys: one flat swarm | Author the intensity curve as data: 30 s build, 10 s peak, 8 s rest, boss after a breather | PB13 | M | pacing.js, stagescripts.js, dir.js |
| 11 | Roles do not need different answers (S30 0.67x); Legend only faster | Each role has one weak point (shield = beat shot, flanker = dash); Legend adds pattern kinds | PB15 >= 1.5 bits, PB16 | L | zoo.js, counter.js, hard.js |
| 12 | No risk/reward beyond survival | Graze meter: skimming bullets fills the EMP; capped per bullet; EMP held is score-multiplier risk | PB14 | M | power.js / powerups.js, counter.js |

## Colour grammar (one colour per role; parts/legible.js, flag `legible`, ?legible=0 = old; gate legible-test.js)
| Role | Hue family (deg) | Colours in code | Never used for |
|---|---|---|---|
| Enemy bullets and enemy fire | warm: pink / red / orange (270-60) | READ.D #ff2d78 with white core and dark halo (LGB.HALO); painted orb, shell, rocket keep their warm pictures; homing orb turned warm; needle gets a white core line | pickups, player shots |
| Player shots | cool: cyan / blue / white (160-285) | READ.SHOT #7fe6ff, READ.SHOT2 #e6f8ff at ~70% alpha | enemy fire, pickups |
| Pickups (shards, hull, upgrade, EMP) | green (~137) | LGB.PK #5dff8a (glow and ring) | enemy fire (shells and orbs are orange, so no gold pickups) |
| Music power coins | leaf green (~105) | LGB.COIN #7dff5d (glow, dashed ring, label; the coin picture stays) | enemy fire |
| Hazards (mines, wells, zones) | purple (260-300) | target only: not recoloured by W126 (overlays belong to W120); telegraph strokes already sit on a dark halo (readable.js) | pickups |
| Enemies | own sprite colours on a pale under-glow (LGB.GLOW #e9e2ff, alpha LGB.st per district) | - | - |
| Elite marker | gold ring #ffd23d (draw.js) | - | pickups |

Measured by legible-test.js (390x763 DPR 2, 7 scenes, 3 frozen frames each, ?legible=0 -> default):
enemy contrast median 2.70/-/10.39/9.35/3.00/2.47/2.57 -> 3.49/-/7.44/6.93/3.94/3.34/3.32 (stages 2/6/10/14/20/boss/endless 10; stage 6 frames had no enemy in the measured area; gate >= 3);
enemy-bullet worst 10% 4.07/15.9/1.54/1.54/2.92/17.5/1.60 -> 6.60/16.0/18.0/19.1/12.9/19.6/17.0 (gate >= 3);
backdrop busyness p90 0.016/0.014/0.009/0.009/0.017/0.016/0.016 -> 0.007/0.008/0.004/0.004/0.008/0.008/0.008 (gate <= 0.010);
enemy-bullet pixels warm 100%, pickup hues >= 45 deg from every bullet hue bucket, player shots 192/197 deg.
Method notes: contrast = WCAG ratio of linear luminance; an enemy = median of its changed pixels vs the median backdrop within 1.6 r; a bullet = the better of its bright p95 or dark p10
(its outline) vs the ring 6 css px outside; busyness = gamma-luma gradient over 1 css px, p90 of 24 css px cells in the middle 76% of the short side. Banners and hints are switched off while measuring.

Sources (site names): Game Developer (Bright, Slow, and Deadly), shmups.wiki, shmups.system11.org, itch.io jam posts and reviews, tvtropes (danmaku), w3.org / WCAG 2.3.1, Game Accessibility Guidelines, caniplaythat, publisher support pages (photosensitivity / camera shake options), eastondev, wayline.io, dev.to (hit-stop / shake), World of Level Design, bugnet, uxplanet, kompassify, oceanviewgames, drizz, GameBench (fitgap).
