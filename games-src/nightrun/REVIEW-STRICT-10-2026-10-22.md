# Nightrun strict tenth review (22 Oct 2026, 04:43-05:10 UTC)

Measured on `90e88fe1` (Merge nr/W142), a frozen copy of `games/mainhattan-nightrun` served by `python3 -m http.server`. Headless Chromium,
390x763 and 375x553 (DPR 2, touch), ~90 shots looked at. No game code changed. Stage scenes: god mode, auto-fire, a sine-drift bot,
hand-stepped, measured every 6th frame (enemies in the HUD band, text boxes overlapping, text on enemies). New player: no save, no input. Audio: `audio-gates-test.js MEASURE=1`.
Same personas, lines, weights, scale as reviews 3-9.

## Headline
**HEADLINE 47.9 / 100** (46.9 before, **+1.0**). Mean of the two harshest: V 47.4 and R 48.3. Panel 49.1.
Wins: no title banner at stage start, ship sprite from frame 1, DASH / EMP carry words and charge numbers, RETRY is the first button after a death,
drill bar is AGAIN + SKIP, endless now reaches wave 10, forge "PU" disc gone. Unmoved first-minute quitters:
enemies fly in **under the score strip** on every stage (19-50% of frames), **a new tutorial caption every ~5 s during combat**, full-height lanes / beams / chevron grids,
the boss **WARNUNG banner** (200 css px) still covers the middle of the field and the ship, and the **effects are now 14-40 dB under the music** (a hit is not heard).

## 1. Review-9 fixes, verified
| # | Fix | Verdict | Evidence |
|---|---|---|---|
| 1 | Stage title chip | **VERIFIED** (stage) / new twin | st10-early, st20-early, leg10-early: no title band. But the boss intro `banner('WARNUNG',...)` (b.js L179) is the same 3 s band, 60 px font, mid-field, hiding the ship (end-boss-a, end-w5-a) |
| 2 | Overlay captions | **PARTIAL** | Laser band, gravity well, safe lane, laser fence now captioned. Still no words: grey ">" chevron grid across the field (st6-late-a, 6x6 marks), red ">" side marks (every stage), orange "!" triangle beside the ship (st10-mid-a, leg10-mid-a), sideways "mine" / "turret" text on enemies (st3-mid-b, st14-mid-a), yellow "?", 700 px thin green ring (st14-late-a). Full-height bright beams remain: white 10 css px column through the ship at 10 s of the first run (np-10-a), solid red one on st 14 (st14-mid-a) |
| 3 | Enemies below the HUD band | **NOT FIXED for the player** | Resting fixed, entering not: 99% of enemies enter at the top edge (x = W+40) and crawl through the band. Frames with an enemy inside the band: st1 40%, st3 19%, st6 27%, st10 45.5%, st14 50.4%, st20 22%, endless 11%. Longest single stay: gunship 3.5 s, mine 2.8 s, drone 1.5-2 s (st10). `hudband-test` passes because it exempts enemies on screen < 2 s. Bosses sit in the band too (end-boss-a, end-w5-a) |
| 4 | Endless boss deadline | **PARTIAL** | Endless reached wave 10 (was stuck at 0). Wave times (game s): w1 6, w2 21, w3 32, w4 47, **w5 144 -> w6 444** (300 s on the boss wave, promised ~90 s), w7-w10 in 56 s |
| 5 | One label queue / captions in free space | **PARTIAL** | Ship floaters: 0-1 overlaps per stage (was the garble). Still: two captions overlapping each other for ~9-11 s on st 3 (gravity-well box + "WHITE TICKS" box, 89-112 sampled frames, both phones) and in endless (100); score pop-ups stacked into one smear ("+75 1224 1836", st14-late-a); caption box under the ship (np-10-a); text over enemies 20-136 sampled frames per 55 s stage |
| 6 | Ship drawn from frame 1 | **VERIFIED** | Hull sprite in every shot from 1.7 s |
| 7 | Button words | **VERIFIED** | "DASH 3", "EMP 2", "SHIELD", "HOMING" above the buttons, both phones. On 375x553 the "TAP: use SLOW now" chip covers half of the DASH button (st10-late-b) |
| 8 | RETRY after death | **VERIFIED** | New player dies at 20.6 s (390) / 22 s (375): first button RETRY (y 406 / 290), then STAGES, TITLE |
| 9 | No wave text over the boss | **PARTIAL** | Stage-8 boss: clean, SAFE LANE labelled (boss-15-a). Endless boss: WARNUNG band + "BIG LETTER = your grade" caption with no letter on screen + "ARMOUR HOLDS" + "New: hail curtain" + an achievement toast over the score and boss bar (end-w5-a). "NEXT WAVE" 40 px over a live field on st 10 (st10-late-b) |
| 10 | Enemy contrast rim | **PARTIAL** | Big enemies read (white halo disc). The commonest enemy, the cyan lozenge drone, is ~20x8 css px and dim on dark districts (st10-mid-a, end-w10-a) |
| 11 | One currency | **PARTIAL** | One glyph (♦) + the word Neon. "2.400" still in the forge header (hangar-forge-b) and "Score 3.865" on the death card |
| 12 | Drill bar | **VERIFIED** | AGAIN + SKIP only (school-move-6-b). |
| 13 | Forge icons | **PARTIAL** | No "PU" text; weapons are plain coloured dots; inventory still "SLOT 2", "NO CORE", "NO" (clipped word) |
| 14 | Menu leftovers | **VERIFIED** (mostly) | HOME: one status box + story strip, PLAY one line, no clipped settings tab at 375. Red dot on TRAINING, 127 controls in settings remain |
| 15 | Audio mix | **NOT FIXED (over-corrected)** | Music - effects RMS: **st1 14.2 dB, st6 40.5 dB, st10 25.8 dB** (effects -38.6 / -58.5 / -48.1 dBFS). No ducks, filter open, no clipping, 2-3.5 sounds/s (good). The gate only asks ">= 6 dB", so 40 dB passes |

## 2. Orchestrator's last look, checked
| Claim | Verdict |
|---|---|
| Enemies drawn inside the top HUD band at st 10, entering from the top | **TRUE**. 45.5% of st-10 frames; 40 of 42 st-10 enemies entered through the band; formations spawn at `W+40` and move 70-120 units/s, so each spends 1-3.5 s under the score |
| Bright cyan beams across the upper field | **Not reproduced as cyan**. Cyan-pixel share of the upper field <= 0.23% on every stage. What crosses the upper field: teal-green safe-lane edges full height (st10, st6, end), a white 10 px column (np-10-a), a solid red laser (st14-mid-a), 4 thin cyan spokes not seen this time |
| SFX 20-60 dB under the music | **TRUE** (14-40 dB measured, s6 worst). a -58 dBFS hit under -18 dBFS music is inaudible |

## 3. What a player sees (beyond section 1)
- First 60 s, new player: 1.7 s a ringed enemy behind the score and "ENRAGED" over the ship; 10 s a white full-height column through the ship, 3 of 7 hull gone; 7 captions in 20 s; a parked player dies at 20.6 s.
- St 6 late: 3 texts at once (DASH THROUGH, RED LINES caption, LASER FENCE strip) + "TAP: use SHIELD now", a 6x6 grid of grey ">" marks. St 14: solid red beam, sideways enemy labels, pop-up smear. St 20: two full-height red side bars.
- Stage-8 boss is the calmest screen in the game, but slow (bar ~70% after 40 s of auto-fire). Endless wave 10: two enemies and "New: swarm".
- Street Run: hero, turret, shots fine; backdrop still flat purple blocks; "ARENA LOCK" unexplained. HOME and Hangar: tidy.

## 4. Scores (same lines, weights and scale; first 30 min / hour 3)
| # | Line | W | V | R | M | P |
|---|---|---|---|---|---|---|
| 1 | Core feel | 14 | 5.3/4.7 | 5.3/4.7 | 5.7/5.2 | 5.7/5.2 |
| 2 | Variety | 16 | 6.0/5.5 | 6.3/5.8 | 6.5/6.3 | 6.3/6.0 |
| 3 | Bosses | 8 | 4.9/4.2 | 4.9/4.2 | 5.3/4.7 | 5.2/4.6 |
| 4 | Difficulty | 10 | 5.0/4.4 | 5.2/4.6 | 5.3/4.7 | 5.2/4.6 |
| 5 | Build depth | 8 | 4.6/3.8 | 4.5/3.6 | 5.0/4.0 | 4.8/3.8 |
| 6 | Music / beat | 8 | 4.0/3.5 | 3.8/3.5 | 4.3/3.8 | 4.3/3.8 |
| 7 | Readability | 8 | 5.0/4.5 | 5.1/4.5 | 5.1/4.5 | 5.1/4.5 |
| 8 | Audio (re-measured) | 4 | 1.8/1.8 | 1.8/1.8 | 2.3/2.0 | 2.5/2.0 |
| 9 | Onboarding | 6 | 5.6 | 5.6 | 5.4 | 5.8 |
| 10 | Progression | 8 | 5.2/4.3 | 5.2/4.1 | 5.4/4.4 | 5.2/4.1 |
| 11 | On-foot | 3 | 3.8/3.3 | 3.8/3.3 | 4.0/3.5 | 3.5/3.0 |
| 12 | Touch | 5 | 6.0 | 6.8 | 6.8 | 6.0 |
| 13 | Polish | 2 | 4.2/3.5 | 4.4/3.7 | 4.5/3.8 | 4.2/3.5 |
| | **Weighted 30 / h3** | | 50.0/44.8 | 51.0/45.6 | 53.4/48.4 | 52.3/47.0 |
| | **Reviewer** | | **47.4** | **48.3** | 50.9 | 49.7 |
- Up: readability (+0.3-0.4: no banner at start, ship visible, words on buttons), bosses (+0.3: endless moves on), touch (+0.3-0.5), progression (+0.2: RETRY first).
- Down: audio (-0.2: effects buried; a shooter with silent hits feels like a screensaver). Onboarding only +0.2: the captions are a wall of text during live fire.
- V: "It teaches me ten symbols in my first 20 seconds while I'm being shot, then kills me." R: "I can't hear my gun."
- M: "Menus finally tidy." P: "Each fix added a caption; lanes, grids and marks stay."

## 5. New / open defects (repro = shot / stage / time / phone)
| id | sev | defect | repro |
|---|---|---|---|
| F01 | S1 | Enemies enter through the HUD band and stay 1-3.5 s under the score; bosses park there | st10/st14 40-50% of frames, both phones, np-1.7-a |
| F02 | S1 | Effects 14-40 dB under the music; hits inaudible on st 6 | audio-gates MEASURE s1/s6/s10 |
| F03 | S1 | Caption flood: ~1 new caption every 5 s during combat (7 in the first 20 s, ~12 per stage) | np-*, st1, st6-late-a |
| F04 | S1 | Boss intro WARNUNG band (200 css px, 3 s) over the middle of the field and the ship | end-boss-a, end-w5-a; b.js L179 |
| F05 | S2 | Unexplained marks: grey ">" grid, red ">" side marks, orange "!" by the ship, "ENRAGED", sideways "mine"/"turret", yellow "?", giant green ring | st6-late-a, st10-mid-a, st14-late-a |
| F06 | S2 | Full-height bright columns: white 10 px through the ship (first run 10 s), solid red (st 14), green lane edges | np-10-a, st14-mid-a |
| F07 | S2 | Endless boss wave lasts 300 s (deadline says ~90 s) | endless 390, w5 144 s -> w6 444 s |
| F08 | S2 | Two caption boxes on top of each other (gravity well + one EXP caption) | st3 both phones, endless |
| F09 | S2 | Hint strip cuts its sentence: "EMP spends all charges: hold 3 for the" | st10/st20/leg10 early, timing.js L93 via ABIL.tip |
| F10 | S2 | Caption names the wrong place / an absent thing: "MARK AT THE TOP EDGE" (marks are on the left), "BIG LETTER" with no letter, "PINK BAR" with no bar near | st20-early-a, end-boss-a, leg10-mid-a |
| F11 | S2 | A parked new player dies at 20 s on stage 1; 3 of 7 hull gone by 10 s | np-10-a, np-dead-* |
| F12 | S3 | Score pop-ups stack into one smear | st14-late-a, st1 (+260/+130) |
| F13 | S3 | "TAP: use SLOW now" covers the DASH button on 375x553; "LASER ON" caption clipped at the field edge | st10-late-b, leg10-mid-a |
| F14 | S3 | "2.400" in the forge header, "Score 3.865" on the death card; forge cells "SLOT 2 / NO CORE / NO" | hangar-forge-b, np-dead-a |
| F15 | S3 | Achievement toast over the score and the boss bar | end-w5-a |

## 6. Ranked top-15 fixes
| # | Problem | Fix | Measurable gate | Owner file (WHERE.md) | Size | Tier |
|---|---|---|---|---|---|---|
| 1 | F01 band | Enemies spawn at the band's lower edge with a 0.3 s warp-in (or fly the band at >= 600 u/s); boss rest x <= 868 - r. Change hudband-test: no exemption for entering enemies | 0 enemies inside the band for > 0.3 s, all stages 1-20 + endless, both phones; band frames <= 3% | formations.js `FM.u` / b.js `en()`, armour.js boss rest, hudband-test.js | M | Sonnet |
| 2 | F02 audio | Set effects 6-10 dB under the music (not 14-40); per-sound trims so shot/hit sit at -30..-26 dBFS | audio-gates: 6 <= music - SFX <= 10 dB on s1/s6/s10; hit RMS >= -32 dBFS | mix.js `K.sfx`, a.js | S | Sonnet |
| 3 | F03 caption flood | Max 3 captions in the first stage, then 1 per stage; the rest move to a pre-stage card or the pause screen "What's on screen" list | first 60 s of stage 1: <= 3 captions; any stage: <= 1 caption per 20 s | explain.js `EXP`, zonehint.js | M | Opus |
| 4 | F04 boss banner | Boss intro = the same top chip as stage titles (<= 28 px, 2 s) + boss name on its bar | review9-test #1 extended to boss intro: no band pixels in the middle 60% | b.js L179 `banner('WARNUNG')`, calm.js | S | Haiku |
| 5 | F05 marks | Remove grey ">" grid and red side marks (or one caption "ARROWS = enemies enter here"), drop "ENRAGED" and sideways enemy labels, orange "!" | overlay-test: 0 drawn kinds outside `EXP.OVL`; no rotated fillText on enemies | flankers.js, readable.js, foeart.js, explain.js | M | Sonnet |
| 6 | F06 columns | Player / enemy beams <= 6 css px, <= 50% alpha above the ship; lane edges dashed and dim | pixel scan: no column > 6 css px with luma > 180 over > 45% field height | calm.js, fxwave.js, rules.js lane draw | S | Sonnet |
| 7 | F11 first-run lethality | Stage 1 first run: no aimed fire for 15 s, parked player survives >= 45 s | new-player bot (no input) alive at 45 s, stage 1, both phones | rules.js / density.js stage 1, first30 flag | S | Sonnet |
| 8 | F07 endless boss | Enforce the 90 s deadline in endless (armour cracks, boss leaves) | endless bot: every boss wave <= 100 game s; wave 10 by <= 260 s | armour.js `B2X`, endramp.js | S | Sonnet |
| 9 | F08/F12 text overlap | zonehint captions go through the same EXP queue; score pop-ups merge into one per 0.3 s near a point | 0 overlapping text boxes (> 4 px) in 55 s of st 1/3/10/14, endless 2 min | zonehint.js, explain.js, fun.js pop-ups | S | Sonnet |
| 10 | F10 wrong captions | A caption shows only when its thing is on screen and points at it (leader line); fix "TOP EDGE" text to where the mark is | explain-test: caption id fires only with its object visible; text matches side | explain.js `EXP.TXT` | S | Haiku |
| 11 | F09/F13 clipped text | Hint strip wraps to 2 lines; captions clamp inside the field; button chips never over a button | ui-audit: no text with scrollWidth > clientWidth or canvas text past the field edge, both phones | abilities.js `ABIL.tip`, explain.js, layout.js | S | Haiku |
| 12 | F15 toast | Achievement toast waits until no boss intro / bottom of screen | 0 toast frames over the score strip or boss bar | ret.js achievements (toast) | S | Haiku |
| 13 | Drone readability | Cyan lozenge drone 1.5x size + dark outline | legible-test drone median contrast >= 4.5, size >= 28 css px | foeart.js, art.js | S | Sonnet |
| 14 | F14 forge/format | Real weapon icons on forge cards; empty cells say "EMPTY"; one number format (2400) | text scan: no `\d\.\d{3}`, no "NO" cell label | forgeui.js `FGU`, inventory.js, garage.js | S | Haiku |
| 15 | Gate honesty | hudband-test (entering enemies) and audio-gates (upper bound) gate what the player sees | both tests FAIL on today's build, PASS after #1 / #2 | hudband-test.js, audio-gates-test.js | S | Haiku |

## Assets for the owner (separate, not code)
- Street Run backdrop layers; forge weapon icons; review-8 sound items.

## Reproduce
Scratchpad `r10/shots.js` (`ONLY=`, `VP=a|b`), `probe2.js`, `audio-gates-test.js MEASURE=1`.
