# Nightrun retention plan: 10+ hours of fun (16 Oct 2026)

Research and plan only. No game code was changed. Reference games are described generically. Sources are listed at the end with their URLs.

## Summary (10 lines)
1. **The economy is the biggest problem.** Maxing everything costs **141,780 Neon**: garage perks 99,060, weapons 41,660, ships, crew and themes 1,060. The bot earns about **16 Neon per stage**, roughly **390 Neon banked per hour**. That is **~360 hours** at median skill. One weapon from LV1 to LV10 costs 2,430 Neon, about 6 hours of play.
2. **Stages are long for phones.** A main stage lasts 158-326 s (mean 208 s) because it lasts as long as its song. One pass through all 45 stages is about 2.4 h of bot play time. Research puts phone sessions at 5-9 min.
3. **Clearing a stage pays nothing extra.** There is no first-clear bonus, no Neon for stars, no achievements, no rewards for the daily run and no mastery ranks. The only payout is kill Neon (`shop.js` NEON_K .032).
4. **Difficulty walls at stages 11-12, 18, 23 and 39-40.** With the default kit the bot clears 0-50% there. The challenge stages at 41 and 45 are 0%.
5. Players quit most over unfair or unreadable hits, difficulty cliffs, grind walls, intrusive ads, audio/visual lag, one dominant build and repetitive runs.
6. Players keep playing because of short runs with fast retries, failed runs that still pay, build variety, risk/reward scoring, optional difficulty ladders, achievements and unlock goals, and score goals.
7. **Plan:** fix the economy first (B1-B3), then add an arcade length and a run-end screen (B4-B5).
8. After that come goals (pilot rank, achievements, daily and weekly), then a Heat ladder and boss rush for after the story, then variety and comfort (reroll and banish, graze juice, latency onboarding, readability).
9. Targets: finish the economy in about 10-12 h at median skill. The first fun moment comes within 60 s. There is an unlock or a goal every 5-15 min for 10 h.
10. Never: ads, energy timers, paid currency, or grind as the only way past a wall.

## Top 10 annoyances (ranked by evidence)
| # | Theme | Evidence | Nightrun today |
|---|---|---|---|
| A1 | Unfair or unreadable hits: hitbox bigger than it looks, bullets that look like each other or like player shots | F15, F16, F17, F18 | Shots are telegraphed one beat ahead, and a safe path is proven (`f-checks.js`). The hitbox is never shown. High-contrast bullets is an option, but not the default. Many hits are counted as "other" (fences and beams, BALANCE.md round 2) |
| A2 | Difficulty cliffs and harsh early game without upgrades | F14, F19, F20, F9 | Bot clear rate: stage 11 is 50%, 12 is 50%, 18 is 0%, 23 is 0%, 39 is 0% and 40 is 0%. A fresh ship fails from stage 20 on (BALANCE.md) |
| A3 | Grind walls: prices rise, so old stages must be replayed | F14, F13, F22 | **Severe**: ~360 h to max everything, and the weapon price curve is 1.45^L (`wpx.js:6`) |
| A4 | Disruptive ads, paywalls and energy timers | F24 | None in the game. Keep it that way |
| A5 | Audio/visual offset on browser and phone | F28, F29, F30 | A latency slider and tap test exist (`a.js:126`, `c.js:160`), but they sit in Settings and nothing points the player to them |
| A6 | One dominant build or a solved meta | F21, F23 | BALANCE.md shows that the late build deals about 40x the damage of a fresh ship. No data yet on how often each weapon or fusion gets picked |
| A7 | Repetitive runs with weak rewards | F20, F23 | Clearing a stage gives stars only. The daily run gives a score and nothing else |
| A8 | Heavy meta-progression makes wins feel unearned | F22 | The soft scaling in `upsCalc()` already pushes back. Keep the power curve flat |
| A9 | Hits with no clear feedback | F17 | There is a hull pip and 1.5 s of invulnerability. There is no cause text when you are hit |
| A10 | Fatigue with the genre (many look-alike survivor games) | F21 | The rhythm hook is what sets Nightrun apart, so lean on it |

## Top 10 addiction drivers (ranked by evidence)
| # | Driver | Evidence | Nightrun today |
|---|---|---|---|
| D1 | Short runs and an instant retry | F1, F4, F11, F12 | Stages last 3-5.5 min. Retry exists, but no stage is shorter than 2.6 min |
| D2 | A failed run still pays toward something visible | F1, F13, F2 | A run banks Neon, but about 16 Neon against a 2,430 weapon track feels like nothing |
| D3 | Build variety and synergies | F5, F6, F23, F8 | Strong on paper: 16 weapons, 120 fusions, paths, sets and heat. There is no reroll or banish in the run beyond the pit-stop reroll |
| D4 | Risk/reward scoring (multiplier, graze), so deaths feel like your own fault | F11, F12 | Tier x1-4 and graze +1 exist. There is no graze spark or near-miss callout |
| D5 | Optional difficulty ladder with better rewards after the first win | F7, F8, F9 | Missing. The difficulty setting gives no reward |
| D6 | Achievements and unlock conditions as side goals | F3, F6 | Missing |
| D7 | Visible score goals and leaderboards | F12, F11 | Only local best and daily best |
| D8 | A polished core and juice | F10, F32 | Good already: beat-synced layers, gold shots, rings |
| D9 | Daily run with a shared seed | F31 | Exists (`b.js:77` seeds from `todayN()`), with no streak and no reward |
| D10 | Low friction: free, instant start | F4 | Browser, no install. The tutorial is about 3 min and can be skipped |

Benchmarks: median phone game D1 22%, D7 4%, D30 0.7%; top 10% reach 40%, 12% and 4% (F25). Median session 5-6 min, top quartile 8-9 min, about 4 sessions a day (F26). Mid-core games hold about 20% D7 (F27).
Weak evidence: there is no data that juice or daily runs raise retention by themselves (F31, F32), so B8 and B11 are the cheap versions.

## Audit numbers (measured 16 Oct 2026, headless story bot, Normal, default kit, 2 runs per stage, perfect-chance 0.4)
- **Run length per stage (seconds):** stages 1-10 take 169-258; 11-20 take 158-326; 21-30 take 169-255; 31-40 take 170-285. Challenges 41-45 take 35-118. The main-stage mean is 208 s and all 45 stages add up to 146 min.
- **Clear rate below 100%:** stages 11, 12, 20, 30, 34, 35, 37 at 50%; stages 18, 23, 39, 40 at 0%; challenges 41 and 45 at 0%, 43 and 44 at 50%. Hits per stage run from 0 to 8.5 and are highest at 11, 12 and 18.
- **Neon:** 4-34 Neon earned per stage (mean 16; late stages pay about twice what early ones do). A run banks the Neon left over plus 30% of what was earned (`shop.js:33`), so ~16-21 Neon a stage if nothing is spent in the pit, or **about 300-390 Neon per hour**. Endless adds +5 a district (`shop.js:114`). The tutorial gift is 60 (`tut.js` TUT_GIFT).
- **Cost to max everything:** 141,780 Neon. That is 22 garage perks at the `tpPrice` curve (99,060), 16 weapons at 9 levels each plus unlocks (16 x 2,430 + 2,880 = 41,660), 5 ships (610), 3 crew (270) and 3 themes (180). The daily market items are extra.
- **Hours to max the economy:** median skill (bot) ~360 h. A skilled player, with on-beat kills at 1.5x and tier +3, at about 2x the Neon, ~180 h. A novice at about 0.7x, ~500 h. Even weapons alone take about 107 h at median skill.
- **Distinct builds:** 16 weapons, 2 slots and 120 fusions, 7 ships, 22 perks with 4-8 equip slots, 3 paths, and sets. What is actually viable has not been measured. `weapon-test` shows each weapon clears stage 1 alone. BALANCE.md only measured the Pulse+Swarm and Lance+Cannon pairs at late stages. **Gap:** there is no table of weapon pick rate versus clear rate.
- **First session:** the flight school takes about 3 min (`tut.js`, 25 s cap per step, SKIP shown). The first gold shot comes within about 30 s. The first stage takes 171 s with no death. The bot's first likely death is stage 11, about 35-40 min in. The first garage purchase (Laser 30 Neon) is possible after the tutorial gift.
- **What unlocks when today (median):** 10 min: a stage or two, 60+30 Neon, one weapon unlock. 1 h: about 15 stages, ~400 Neon, perks at 45-120 each. 3 h: story mostly done, ~1,200 Neon, LV3-4 on one weapon. 10 h: ~3,900 Neon, under 3% of the economy, with nothing new to aim at beyond prices.
- **Replay hooks that exist:** endless with mutators per loop; a seeded daily run with a daily best; 3 stars per stage; 5 challenge stages; a daily market with 2 buys and a sale; the Lab (sandbox).
- **Replay hooks missing:** achievements, pilot rank, first-clear rewards, a Heat ladder after the story, boss rush, a weekly challenge, streaks, cosmetics earned by play, a run-end "next unlock" bar, and a shorter arcade mode.
- **Annoyances found in the code:**
  - Stage length is fixed to the song (`story.js:88` `stLen`), so a stage can never be shorter than 66 bars.
  - The pit stop has a 10 s timer (`shop.js:16` PIT_SECS), but in story it opens only after the stage ends (`story.js:126`), so there are no choices mid-run.
  - Latency calibration is only in Settings (`c.js:160`).
  - Clearing a stage pays no Neon (`story.js:151` `finish()`).
  - Weapon prices grow 45% a level (`wpx.js:6`) and the garage was priced on purpose for "many runs" (`upgrades.js:19`).
  - There is no hit cause on screen. The HUD shows only `DAILY`/`BEST` (`c.js:29`).

## The 10-hour timeline (after the backlog)
| When | What the player does | What they get |
|---|---|---|
| 0-3 min | Flight school, or SKIP. First gold shot at under 30 s | 60 Neon gift, first latency check (B10) |
| 3-15 min | Stages 1-3 as 3-min Arcade cuts (B4) | First-clear Neon (B1); unlock a 2nd weapon; pilot rank 2 (B6) |
| 15-60 min | Stages 4-12, first mini-boss, first boss | 3-5 achievements (B7); first fusion; LV3 on the main weapon; daily run streak day 1 (B11) |
| 1-3 h | District 2-3, first wall at stage 11-12, mercy kicks in after 2 losses (B3) | Rank 5-8; ships Triplet and Echo; 2 perks at LV3; first cosmetic trail (B15) |
| 3-5 h | Districts 4-5, challenge stages, story clear | The Heat ladder opens (B8); boss rush opens (B9); weekly challenge (B11) |
| 5-8 h | Heat 1-5 runs with mutators, boss rush splits, a build for each weapon | Heat medals, LV6 abilities on 4-6 weapons, about 60% of the economy |
| 8-10 h+ | Heat 6-10, endless milestones, no-hit and time attack | LV10 on favourite weapons, full garage at about 10-12 h for a median player, collection 80% |

## Backlog (ordered; each item is a ready brief)
Common rules for every item:
- Build with `python3 games-src/nightrun/parts/build.py`, then run `sweep.js` (full), `rotate-test.js`, `afk-test.js`, `balance-test.js`, `guard.py` and `stamp-copyright.py`.
- Never break the entry grace, on-screen floor or shot cap (`DMG` in `b.js`) or the anti-idle beam.
- Each item gets a flag in a new `RET` object at the top of a new part `parts/ret.js` (built in after `meta.js`). With the flag off, the game must play exactly as it does today.
- Headless checks only, no screenshots.
- Model: Sonnet. One fixer, one round, report in 150 words or less.

**B1. First-clear and star rewards** (S, flag `RET.clearPay`, order 1, deps none, +1.5 h, A3 A7 D2)
- Deliverable: clearing a stage pays `40 + 12*n` Neon the first time, plus 25 per new star, and 10% of that on later clears.
- Files: `story.js` `ST.finish()` (line ~151), via a wrapper in `ret.js`, plus one line on the result panel (`srStars`).
- Tests: in a new `ret-test.js`, clear stage 1 twice in sim and check the bank goes up by the first-clear amount and then by 10%. With the flag off, the bank does not change.
- Risk: none for balance, because enemies are unchanged.

**B2. Economy retune to about 10-12 h** (M, flag `RET.econ`, order 2, deps B1, +3-5 h of meaningful upgrades, A3 A8 D2)
- Deliverable: scale `WPX_PRICE` to `30*1.28^(L-1)` (1,380 a weapon), cap garage perk prices at about 1/3 (`tpPrice` x .33), and set `NEON_K` to .045.
- Files: `wpx.js:6`, `upgrades.js:19`, `shop.js:17`, and one sim check in `ret-test.js`.
- Target: total cost ÷ (median Neon per hour, measured with `story-sim` + B1) = 10-12 h. Print the number.
- Tests: an economy script that sums every price from the live page (`__mnr`) and runs story-sim for stages 1, 8, 20 and 30. It fails if the computed hours fall outside 9-13.
- Risk: power arrives sooner. `balance-test.js` must stay 32 PASS, and `upsCalc` soft scaling stays on.

**B3. Mercy after losses** (S, flag `RET.mercy`, order 3, deps none, +0.5 h of play that would otherwise be lost to quitting, A2 A3)
- Deliverable: after 2 failed tries on the same stage, offer "+1 hull this try". After 4, also lower the stage level by 0.3. Stars are still earned. The offer resets after a clear.
- Files: `story.js` `setLevel()` (line ~98), `HULL`, and the result panel button.
- Tests: in sim, fail stage 18 twice, then check that `P.hp` is +1 and the level is lowered only after 4 fails.
- Risk: the damage cap and entry grace are untouched.

**B4. Arcade cut: 3-minute stages** (M, flag `RET.arcade`, order 4, deps none, +1.5 h of mobile sessions, D1, phone-session fit F26)
- Deliverable: a STORY toggle, "Full / Arcade". Arcade sets `stLen` to `min(bars, 80)`, the boss enters at `len-32`, and the goals scale with `stK`.
- Files: `story.js:88-89` `stLen`/`stK`, and the toggle on the map plate (`map.js`).
- Tests: stages 1-40 in Arcade all end under 200 s in sim. The song switch still lands on a whole bar (`NR.sw` log). The boss armour floors still hold (boss >= 45 s).
- Risk: the music cut point must be a bar line, so reuse `AU.xfade`.

**B5. Run-end screen with the next unlock and a ONE MORE button** (S, flag `RET.endcard`, order 5, deps B1, +1 h, D1 D2)
- Deliverable: the result and game-over panels show Neon banked, a progress bar to the cheapest thing not yet owned ("Laser LV4: 58/84"), and a big RETRY/NEXT button focused by default.
- Files: `story.js` result (`srNext`) and `c.js` game over (`oNeon`).
- Tests: the bar's numbers equal `WP.price` and `GA.bank`. The button responds to a tap at 390x763 and 375x553. Nothing is covered (sweep).

**B6. Pilot rank (XP for every run)** (M, flag `RET.rank`, order 6, deps B1, +1 h, D2 D6)
- Deliverable: XP = score/1000 + 50 per star. 30 ranks on a curve that tops out at about 10 h. Each rank pays Neon and some ranks unlock a cosmetic (B15).
- Files: new `ret.js`, a hook on `NR.on('runEnd')`, and the title chip.
- Tests: the XP math is unit-checked, and rank 30 needs 10±1.5 h at the median Neon/score per hour from story-sim.

**B7. Achievements (40) with Neon rewards** (M, flag `RET.ach`, order 7, deps B6, +1 h, D6)
- Deliverable: 40 checks on engine events. Examples: first fusion, 100 PERFECTs, a no-hit boss, every weapon at LV3, a 7-day daily streak, Heat 5. Each pays 30-300 Neon. Shown as a grid tab in the garage.
- Files: `ret.js` and a garage tab (in meta.js's tab bar).
- Tests: each achievement is fired by a scripted engine event in sim. The toast never covers buttons (sweep).

**B8. Heat ladder after the story** (L, flag `RET.heat`, order 8, deps B2, +2 h, D5)
- Deliverable: Heat 1-10 on any cleared stage, chosen from 6 mutators (Turbo, Hailstorm, Elite Guard, -1 hull, no heal drops, faster tier decay). Each Heat level gives +20% Neon and a medal.
- Files: the mutator code that already exists (`dir.js` mutators, `TUNE2`), plus a `ST.setLevel` wrapper.
- Tests: `f-checks.js safepath` passes at Heat 10. The bot clears Heat 1 on stage 8 at >= 80%. `afk-test` still kills an idle ship.

**B9. Boss rush and endless milestones** (M, flag `RET.rush`, order 9, deps B8, +1 h, D1 D7)
- Deliverable: boss rush is the 5 bosses and 5 mini-bosses back to back on one hull bar, with a split timer and a best time. Endless pays a milestone (Neon + medal) at districts 5, 10 and 15.
- Files: `story.js` boss defs, `b.js` `nextDi()`.
- Tests: in sim, the rush ends after 10 fights. The armour floors hold (each boss >= 25/45/60 s). The splits are saved.

**B10. Latency onboarding** (S, flag `RET.lat`, order 10, deps none, A5)
- Deliverable: after the first stage (or right after the tutorial), a one-line card: "Taps feel late? Tune in 8 taps". It runs the existing tap test (`a.js:126`). It also shows automatically if the median on-beat error over a stage is above 60 ms.
- Files: `c.js:196`, `tut.js` end card.
- Tests: in sim, feed taps 90 ms late and check that the card shows and `SET.sync` moves by about 90±10.

**B11. Daily streak and weekly challenge** (M, flag `RET.daily`, order 11, deps B1, +1 h over days, D9)
- Deliverable: the daily run pays 50 + 10 per streak day (capped at 7), and missing a day only resets the streak. No timer, no gift that can be missed. A weekly seed is a fixed stage + Heat 3 + 2 mutators, with a best score and a 300 Neon medal.
- Files: `a.js:36` `dailyBest`, `c.js:218`, `b.js:77` seed.
- Tests: fake `todayN()` across 9 days and check the streak math. The weekly seed gives the same waves twice.

**B12. In-run reroll and banish** (S, flag `RET.banish`, order 12, deps none, +0.5 h, A6 D3)
- Deliverable: in the pit stop, long-pressing a card banishes it for the run (2 per run). The first reroll in each pit stop is free.
- Files: `shop.js` `deal()`, `reroll` (lines ~42-58).
- Tests: a banished card id never appears again in 200 deals. The pit's 10 s timer is unchanged.

**B13. Weapon pick and clear telemetry (sim only), then rebalance the outliers** (M, flag none (test only), order 13, deps B2, A6 D3)
- Deliverable: `build-sim.js` plays stages 8, 20 and 30 with each of the 16 weapons and 20 random fusions and writes a viability table into BALANCE.md. Any weapon below 60% clear on stage 20 gets a number tweak.
- Files: `wpx.js` `WPD`, BALANCE.md.
- Tests: every weapon at LV5 clears stage 20 >= 70%. No weapon is above 2x the median DPS.

**B14. Graze and near-miss juice** (S, flag `RET.graze`, order 14, deps none, D4 A9)
- Deliverable: a graze makes a small spark and a +1 tick at the ship (one per beat, as in the rules). A hit shows a 3-word cause ("BEAM", "RAMMED", "SHOT") for 1 s.
- Files: graze code (`C.n` gain in `g.js`/`b.js`), the hit handler.
- Tests: in sim, the graze count equals the sparks drawn. The cause text matches the hit-cause classifier from `story-sim.js`. Text stays at 8 words or fewer.

**B15. Cosmetics earned by play (trails and ship skins)** (M, flag `RET.cos`, order 15, deps B6 B7, +0.5 h, D6)
- Deliverable: 12 trails and 8 skins, each tied to a rank or achievement. Use placeholder hue shifts now, and add slots to the next-wave art list (`ASSETS-NEEDED.md`).
- Files: `garage.js` THEMES pattern and `draw.js` ship draw.
- Tests: perf-desktop frame cost +5% or less. The skin persists after a reload.

**B16. Readability defaults** (S, flag `RET.read`, order 16, deps none, A1)
- Deliverable: high-contrast enemy bullets on by default, a small hitbox dot shown on the ship while it moves fast or during the boss, and player shots never in the enemy-bullet hues.
- Files: Settings defaults (`mnr_set`), and the ship draw.
- Tests: in `bullet-shots.js`-style numeric checks (no images), the enemy versus player bullet hue distance is >= 60°. Settings migrate.

**B17. Time attack and no-hit ladders on cleared stages** (S, flag `RET.ta`, order 17, deps B4, +0.5 h, D7)
- Deliverable: on any 3-star stage, a TIME button (kill goal, best time) and a NO-HIT button (medal).
- Files: reuse the `CHALL` challenge kinds `speed`/`nohit` (`story.js`).
- Tests: the sim bot can start either one on stage 1. The best time is saved.

**What NOT to do (with evidence):**
- No ads of any kind (F24: 52% would quit over disruptive ads).
- No energy or stamina timers, and no daily gift that is lost if you miss a day. Streaks pause instead of punishing (A4).
- No paid currency, and no paid power (F24, F22).
- Don't grow meta power faster than skill (F22). Keep `upsCalc` soft scaling and the `DMG` caps.
- Don't make old-stage farming the only way past a wall (F13, F14). Use mercy (B3) and first-clear pay (B1) instead.
- Don't add more weapons before the viability table exists (B13; F21, F23).

## Sources (accessed 16 Oct 2026)
- F1 genre critique, https://jboger.substack.com/p/the-secret-sauce-of-vampire-survivors (n.d.)
- F2 genre critique (editorial), https://bloody-disgusting.com/editorials/3702804/vampire-survivors/ (n.d.)
- F3, F4 review, https://nme.com/reviews/game-reviews/vampire-survivors-review-3332668 (n.d.)
- F5 forum thread, https://forum.quartertothree.com/t/brotato-arena-based-auto-shooter-with-crazy-variety-build/156437 (n.d.)
- F6 review, https://superjumpmagazine.com/brotato-is-a-tasty-roguelike-snack (n.d.)
- F7 developer interview, https://www.tomsguide.com/uk/features/hades-exclusive-interview-supergiant (n.d.)
- F8 genre critique, https://mechanicsofmagic.com/2021/05/25/critical-play-is-this-game-balanced-slay-the-spire/ (2021-05-25)
- F9 patch coverage, https://destructoid.com/?p=252740 (n.d.)
- F10 developer postmortem (talk coverage), https://www.pocketgamer.biz/video-a-dead-cells-post-mortem-from-motion-twins-sebastian-bernard (2018)
- F11 review, https://cybershack.com.au/cybershack/australian-review-geometry-wars-3-sometimes-love-dont-feel-like-it-should/ (n.d.)
- F12 review, https://gamespot.com/reviews/geometry-wars-3-dimensions-review/1900-6415977/ (n.d.)
- F13 review, https://gameinformer.com/games/sky_force_reloaded/b/xboxone/archive/2018/01/18/sky-force-reloaded-review (2018-01-18)
- F14 review, https://purenintendo.com/review-sky-force-reloaded-nintendo-switch/ (n.d.)
- F15 forum thread (Steam), https://steamcommunity.com/app/377860/discussions/0/154645539342221159 (n.d.)
- F16 devlog comment, https://itch.io/post/16632227 (n.d.)
- F17 Steam review analysis, https://vaporlens.app/app/1124830/touhou_blooming_chaos (n.d.)
- F18 genre critique, https://significant-bits.com/the-1-pixel-collision-box (n.d.)
- F19 review, https://www.nintendolife.com/reviews/switch-eshop/thumper (n.d.)
- F20 user reviews, https://rawg.io/reviews/1627807 (n.d.)
- F21 forum thread (mirror), https://twt.omada.cafe/r/roguelites/comments/1nl3opy/a_serious_question_about_oversaturated_vampire/nf3n8gb/?context=3 (~Sep 2025)
- F22 forum post, https://piefed.keyboardvagabond.com/c/games/p/232999/meta-progression-in-roguelites-was-fun-for-a-while-but-it-s-starting-to-f (n.d.)
- F23 design article, https://www.feedme.design/why-we-cant-stop-playing-these-roguelites (n.d.)
- F24 survey summary, https://www.emarketer.com/content/poor-in-game-ads-push-1-5-mobile-gamers-quit-threaten-brand-loyalty (n.d.)
- F25 mobile benchmark, https://gamedevreports.substack.com/p/gameanalytics-mobile-and-pc-game (2026)
- F26 mobile benchmark, https://www.pocketgamer.biz/mobile-players-can-we-have-your-attention-please (n.d.)
- F27 mobile benchmark, https://appagent.com/?p=61637 (n.d.)
- F28 devlog, https://ddrkirby.com/rhythm-quest/devlog/10.html (2021-08-06)
- F29 forum thread, https://forum.godotengine.org/t/rhythm-game-has-a-165-ms-delay-running-on-mobile/133858 (n.d.)
- F30 academic thesis, https://theses.liacs.nl/pdf/2019-2020-TubergenJvan.pdf (2019-20)
- F31 design article, https://www.gamedeveloper.com/design/the-24-hour-ticket-examining-daily-runs- (2017-10-23)
- F32 design talk coverage, https://gamedeveloper.com/design/squeezing-more-juice-out-of-your-game-design- (n.d.)

Evidence gaps: no source isolates energy timers, unskippable intros, menu tedium, music fatigue or mobile run length as a measured churn cause. Those items rest on the session-length benchmarks (F26) and on the owner's own reports.
