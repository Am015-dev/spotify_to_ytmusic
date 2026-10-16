# Strict review #2: Mainhattan Overdrive v90m-beta.74 (live) vs LEGO 2K Drive

Reviewer session review2k-2, 2026-10-16. Build: trunk `0de3cef` built with `tools/build.sh v90m-beta.74` (= live `games/mainhattan-overdrive/` on `alex/brave-carson-rbpmlk`), served locally.
Script: `tools/tRv2k2.js <url> <out> fra|ath|por|cold` (prints `R {...}` lines; shots in `docs/shots/review2k2/`, 852×393, portrait shots `por_*` 393×852).

**Overall: 3.8 / 10 against 2K Drive** (mean of 13 scored aspects; audio not scorable). Review 1 (beta.60): 2.8. The world now *looks* far closer to 2K (blue sky, brick clouds, brick trees, cars and people on the streets), and the review-1 driving fixes hold. But **the races are now unwinnable for a normal driver** (DNF in all 3 races I ran, rival 59 s / 75 s, 0 lead changes), which is worse for fun than review 1's "race plays itself".

## How it was played (and what this can't tell you)
- Real built page, Playwright touch context (isMobile, hasTouch), 852×393 and 393×852. Frankfurt and Athens via `?test=fra|ath` (menus skipped), plus one cold start to the menu.
- No GPU: software GL. Game time is advanced with the game's own fixed step (`roamStep(1/30)`), so speeds/places are sim results, not wall clock. Five browsers shared 4 CPUs, so the boot times below are inflated (single-run numbers from shaders-1 are quoted next to them).
- "Human-like bot" = the repo's `tkBot` (`src/98tk_go.js`): follows the race line with **150 ms reaction lag and brakes for corners** (a careful phone player). "Road-follow" = the review-1 driver (gas held, steers 12 m + 0.9·v ahead, never brakes).
- Not done in the timebox: on-foot, full story mission played to the end, Main River Run + garage + builder shots (the fra script was still racing when this was written; see "Open" at the end), audio, real phone fps.

## References (2K Drive)
- Review-1 sources still apply (Steam store shots `ss_3600efe1…` etc., Jump Dash Roll, Gamecritics, TechRadar, Metacritic): see `docs/REVIEW_2K.md`.
- New for this review:
  - VGC: rubber-banding is "severe" and "works in reverse": it drops you to the back and makes first place a battle until the last lap or two: https://videogameschronicle.com/review/review-lego-2k-drive-is-a-light-hearted-treat-with-a-big-issue-at-launch
  - Gfinity 6/10: Mario-Kart-style weapons; the game "equalises the distance"; tracks "well-designed and interesting": https://www.gfinityesports.com/article/lego-2k-drive-review
  - Destructoid: item chaos (portal item into walls): https://www.destructoid.com/lego-2k-drive-review-destructoid-lego-racer/
  - GamesRadar: "Forza Horizon 5 rebuilt with LEGO"; separate drift and sharp-turn controls reward skill; auto street/boat/off-road swap: https://gamesradar.com/lego-2k-drive-review
  - Game Informer: Bricklandia is the best feature; auto-morphing a highlight: https://gameinformer.com/review/lego-2k-drive/stud-your-engines
  - Total Gaming Addicts (rubber-banding dampens it): https://totalgamingaddicts.com/lego-2k-drive-pc-review-great-racing-fun-for-smaller-gamers/
  - Steam page (delisted 2026-05-19, servers off 2027-05-31; screenshots no longer fetchable): https://store.steampowered.com/app/1451810/LEGO_2K_Drive/
- Take-away used for scoring: **2K races are close by design** (you trade places until the end) and item-heavy; driving forgives contact; transforms are a celebrated moment.

## Measurements (beta.74)
| what | Frankfurt | Athens |
|---|---|---|
| Cold load → CHOOSE ACTIVITY menu (5 browsers on 4 CPUs) | 42.6 s, 14 visible buttons | – |
| STORY → first frame, single run on this box (shaders-1, RV2K_STATUS #7) | 39–43 s (target ≤ 30) | – |
| `?test` start → drivable (contended) | 136–150 s | 173 s |
| Road-follow 30 s: avg km/h / hits / lowest health | 106 / 0 / 96 (landscape) · 77 and 63 (portrait runs) | **31** / 0 / 96 (a side-quest card opened over the road and stopped the car) |
| Westend Split, human-like bot | **DNF at 115 s**, Rossi 1:15.23, lead changes **0**, never ahead | – |
| Westend Split, hands-off | DNF at 115 s (review-1 #1 still fixed) | – |
| Main River Run (Quick Race build), human-like bot | **DNF at 108 s**, lead changes 0, boat form reached, 1 wall hit | – |
| Akropolis Cup Final, human-like bot | – | **DNF at 99 s**, Drakos 0:58.97, lead changes **0**, 1 stuck, 2 wall hits |
| Akropolis Cup Final, hands-off | – | DNF at 99 s |
| Transform brick burst | no burst code in `src/98xf_xform.js` / `src/assets/xf/code.js` (grep `burst`) | – |
| Dev UI on screen | ✔0/26 chip + 🐞 at the left edge in every shot; **two** ✔0/26 chips in portrait | same |

## Scores vs 2K Drive (one 852×393 shot per aspect, `docs/shots/review2k2/`)
| # | aspect | score (r1) | what 2K Drive does | what we do (evidence) | the gap | the single highest-impact fix |
|---|---|---|---|---|---|---|
| 1 | First 60 s / onboarding | **3** (3) | PLAY → funny cutscene → driving in a minute. | Still CHOOSE ACTIVITY first: 4 cards + 5 pills + 5 header buttons (14), the "New in v90m-beta.74 · SEE ×" banner covers the title, ✔0/26 + 🐞 on the left. STORY → first frame 39–43 s. `a_menu.jpg` | Same structure as review 1; only cosmetics improved. | First launch: no menu, straight into the Hot Drop; menu after the first drive. |
| 2 | Free-roam driving feel | **5** (3) | Solid, forgiving, fast. | Frankfurt road-follow 106 km/h avg, 0 hits, health 96: the wall fixes work. Athens 31 km/h: you are stopped by a quest card (row 4). `fra_drive.jpg` | Fine on a straight; no drift/boost skill layer felt in 30 s. | Keep; make crossing a marker non-blocking (row 4). |
| 3 | On foot | **n/p** (2) | Not a pillar. | Not played this time. | – | – |
| 4 | Story mission / side quest | **3** (3) | Funny voiced scenes; events start with a small prompt. | Driving through the Koulouri Rush marker at speed opens a full SIDE QUEST card (quote, GOAL paragraph, ★ table, rewards; ~40 words) over the road, with "CHAIN 5 ×1 +10 STUDS" printed across it. Stop, Thief! card is now 20 words (r1 #10 fixed). `ath_drive.jpg` | A modal on the road; still text instead of a scene. | Markers show a 1-line start pill you can drive past; the card only on stop. |
| 5 | Races (Westend Split, Akropolis final) | **1** (2) | Close kart races: rubber-banding keeps you trading places, items every lap. | Human-like driver: **DNF in all three** (Westend Split, Main River Run, Akropolis final; Rossi 1:15, Drakos **0:58.97** for a story final), 0 lead changes, never ahead. The result panel sits over the road while the car keeps driving at 56 km/h; race HUD shows only "Checkpoint 3/5 → 20 m" (no position/rival gap); a pink "CHAIN 68 ×5 +340 STUDS" lands on the start gantry. `westend_bot_1.jpg`, `akropolis_bot_0.jpg` | A careful player cannot win either race. Review 1: races needed no player; now they can't be won. | Tune rival pace to the human-like bot (bot wins by 2–6 s with a clean lap) + catch-up so the gap stays < 60 m; DNF only after 2× the rival time. |
| 6 | The builder | **n/s** (2) | Body Shop, car in the centre. | Not re-shot in the timebox (rv2k/drawer PASS in rev-74: 12/12 pictured, 0 overlaps). | – | – |
| 7 | Garage | **n/s** (2) | Showroom. | Not re-shot (rv2k/garage-car PASS in rev-74: 13 %, 7 cards). | – | – |
| 8 | Vehicle transform | **5** (6) | Brick burst + whoosh every swap. | Swaps work: Main River Run became a boat and sits well in the water at 64 km/h (water is flat grey, not blue). Still no burst: the review-1 fix was never built. Score down because 2 reviews later the moment is still missing. `river_bot_0.jpg` | No celebration. | 0.3 s brick burst + camera kick on each swap (GO `rv2k2/burst`). |
| 9 | Traffic / pedestrians / lights | **5** (3) | Lively valley. | Moving traffic visible ahead, people and stalls on the verges, a police car beside you in portrait. `fra_drive.jpg` | Better; still no reactions measured. | Count and raise moving cars/people near the player (GO `rv2k2/traffic`). |
| 10 | HUD / menus | **4** (3) | Clean HUD, one objective. | One objective pill at the top (good), TAP TAP = SMASH pill, ✔0/26 dev chip and 🐞 always on, score popups ("CHAIN 68 ×5") in mid-screen over the road, result panel while driving. `westend_bot_0.jpg` | Less noise than r1 but still dev UI and floating score text. | Hide dev chip/🐞 behind the pause menu for players; score popups to the edge. |
| 11 | Performance (boot) | **3** (3, unverified on phone) | Console. | STORY first frame 39–43 s here (target 30); `?test` boots 136–173 s with contention. `a_menu.jpg` | Not measured on a phone. | Phone measurement by Alex; then cut the two program-link stalls (shaders-1). |
| 12 | Audio | **n/s** | – | – | – | – |
| 13 | World art | **6** (3) | Saturated brick world. | Deep blue sky, brick clouds, brick trees (green/red/orange), city skyline, flags; looks LEGO now. Hills are flat green wedges; Athens has a large translucent green ring over the road ahead (`ath_roam.jpg`). `fra_roam.jpg` | Big step; ground still flat. | Brick-textured terrain on hills. |
| 14 | Portrait | **3** (2) | n/a | Car fills the lower half, BOOST far from GAS, **two ✔0/26 chips**, Becker objective text cut off at the right edge. `por_fra_drive.jpg` | Cramped, duplicate dev UI. | One dev chip, wrap the objective pill. |

Scored aspects (1, 2, 4, 5, 8, 9, 10, 11, 13, 14): mean 3.8.

## Review 1 TOP 10 re-check on beta.74
| r1 # | GO | status on beta.74 | evidence |
|---|---|---|---|
| 1 | rv2k/race-handsoff | ✅ still fixed (hands-off = DNF) but **over-corrected**: a careful human also DNFs | this review, rows 5 |
| 2 | rv2k/walls | ✅ 0 hits / 30 s Frankfurt and Athens | road-follow |
| 3 | rv2k/stuck | ✅ (RV2K_STATUS); Akropolis bot got stuck once | akropolis_bot |
| 4 | rv2k/objectives | ⚠ GO passes (flaky once in rev-74) but a full quest card opens while driving in Athens | ath_drive |
| 5 | rv2k/devui | ✅ by the GO (edge chip) / ❌ to a player: chip + 🐞 always visible, doubled in portrait | por_fra_drive |
| 6 | rv2k/garage-car | ✅ rev-74 single run (not re-shot) | HANDOFF_rev74 |
| 7 | rv2k/onboard | ❌ 39–43 s, menu first | a_menu |
| 8 | rv2k/drawer | ✅ rev-74 | HANDOFF_rev74 |
| 9 | rv2k/foliage | ✅ (SLOW-only) | RV2K_STATUS |
| 10 | rv2k/card | ✅ Stop, Thief! 20 words; ❌ in spirit for side quests (Koulouri Rush ~40 words) | ath_drive |
No code regression found in the r1 fixes; the regression is in fun: races moved from "auto-win" to "can't win".

## TOP 10 problems by player impact (checklist GOs, ver `rv2k2`, `rv:2026-10-16`)
| rank | problem | why it kills the fun | acceptance test (pass line) | GO id | measured on beta.74 |
|---|---|---|---|---|---|
| 1 | Races are unwinnable and have no back-and-forth | Every race ends "DNF · rival wins"; no tension | Westend Split, human-like bot: finishes, ≥ 2 lead changes, median gap ≤ 60 m | `rv2k2/close` | ❌ DNF 115 s, 0 lead changes, never ahead |
| 2 | Akropolis final unwinnable / dirty | The story climax is lost in 59 s | Human-like bot finishes, 0 stuck, ≤ 3 wall hits | `rv2k2/akro` | ❌ DNF 99 s, Drakos 58.97 s, 1 stuck, 2 hits |
| 3 | Quest card opens over the road while driving | Stops you dead mid-drive (Athens avg 31 km/h) | Through the nearest quest marker at 79 km/h: no card, still > 29 km/h | `rv2k2/cardstop` | ❌ seen in ath_drive (GO not yet run; see Open) |
| 4 | First screen is a 14-button menu, banner over title | Players wait 40 s then must choose | CHOOSE ACTIVITY ≤ 5 buttons, banner over title 0 px² | `rv2k2/menu` | ❌ 14 buttons (cold run) |
| 5 | Driving pace (Athens) | City driving feels slow | 60 s road-follow avg ≥ 90 km/h and ≤ 1.5 hits/min, both cities | `rv2k2/pace` | ❌ Athens 31 km/h (30 s), Frankfurt ✅ 106 km/h |
| 6 | Transform has no brick burst | 2K's signature moment missing (r1 #8) | Slipway swap + ≥ 1 burst object 0.3 s later | `rv2k2/burst` | ❌ no burst code |
| 7 | Races without items | 2K races are item fights | ≥ 3 item bricks fired by the human-like bot in Westend Split | `rv2k2/items` | pending GO run |
| 8 | Street life near the player | "Not lively" (Alex) | ≥ 6 cars within 120 m, ≥ 4 moving, ≥ 8 pedestrians within 60 m | `rv2k2/traffic` | pending GO run (visual: cars ahead in fra_drive) |
| 9 | Text under 12 px | Standing order, phone readability | 0 visible text nodes < 12 px | `rv2k2/tiny` | ❌ portrait: BRAKE and BOOST labels < 12 px (tRv2k2 por) |
| 10 | HUD over touch controls | Standing order | 4/4 controls found, 0 px² HUD over them | `rv2k2/hudctl` | pending GO run (rev-74 saw TAP TAP touching ◀ ▶) |
Also added: `rv2k2/near` (≥ 4 activity markers within 400 m of the start, nearest ≤ 150 m).
Results of the GO run (`TAG=rv2k2/`, built page) are appended below when it finishes.

## Other bugs seen
- Result panel (DNF · … WINS) stays on screen while the car keeps driving at 26–56 km/h (akropolis_bot_0..2, westend_bot_1).
- `RO.veh` reads `ship` during the dry Westend Split and in hands-off runs (label or state bug; races logged `ship/offroad`).
- Pink score popup "CHAIN 68 ×5 +340 STUDS" centred over the checkpoint gantry; "CHAIN 5 ×1 +10 STUDS" printed across the quest card.
- Athens start: a big translucent green ring/sphere hangs over the road ahead (ath_roam).
- Portrait: two ✔0/26 chips; the Becker objective pill is cut off at the right edge.
- Race HUD has no position or rival gap, only "Checkpoint 3/5".
- GO harness: `tkBot` is in lazy chunk X5; a GO must `XC_need('X5')` first (fixed in the rv2k2 GOs).

## Since review 1 (delta)
- Up: world art 3→6, driving 3→5, traffic 3→5, HUD 3→4, portrait 2→3: the city finally looks and drives like a LEGO game.
- Down: races 2→1 (unwinnable instead of auto-won), transform 6→5 (burst still missing two reviews later).
- Unchanged: onboarding 3 (menu first, 40 s), story 3 (text cards; now they pop up mid-drive).

## Open (not done in the timebox)
Quick Race (grand) / garage / builder shots from `tools/tRv2k2.js … fra` were still running at write time; the GO run `TAG=rv2k2/` likewise. Grid not made.
