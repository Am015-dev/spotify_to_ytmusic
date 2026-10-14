# Strict review: Mainhattan Overdrive beta.60 (live) vs LEGO 2K Drive

Reviewer session, 2026-10-14. Build: `games/mainhattan-overdrive/` on `alex/brave-carson-rbpmlk` = **v90m-beta.60** (served locally).
Alex's verdict going in: "unplayable, repetitive, boring, not lively". This review agrees, and the numbers below say why.

**Overall: 2.8 / 10 against 2K Drive** (mean of 13 scored aspects; audio not scorable here). 10 = as good as 2K Drive at that aspect.

## How it was played (and what this can't tell you)
- Real input through the page: Playwright touch (CDP `Input.dispatchTouchEvent`: GAS, ◀ ▶, BRAKE, taps on cards and menus) and real key events,
  852×393 phone landscape plus a 393×852 portrait check, Frankfurt and Athens.
- One full cold start through the menus (STORY → NEW GAME → cutscene → Hot Drop). The other sessions used the game's own `?test=fra|ath` start
  (low graphics, story popups skipped) so the world could be reached at all.
- **Limit:** this container has no GPU. Software GL ran the full-quality game at **1–3 fps**, so wall-clock play was impossible. Game time was
  advanced with the game's own fixed-step hooks (`__mho.roamSim`, `__qa.step`, 0.05 s steps = a 20 fps phone), with input held between steps.
  About 6 game-minutes were driven by hand-steered or road-following input, plus 12 sim-minutes of the repo's monkey bot
  (`tools/qa/monkey.js`, 6 min per city). Real phone fps and audio could NOT be judged here; they are marked as such.
- "Road-follow player" = a script that holds GAS and steers toward the road 12 m + 0.9·v ahead, through the real ◀ ▶ touch buttons. It never brakes.
  A careful human brakes for corners, so its hit rate is an upper bound. Still: it should not wreck on a city loop in 60 s.

## References (2K Drive)
- Official Steam store screenshots (open world, Body Shop builder, race, cutscene, garage hub): `store.steampowered.com/app/1451810`
  (images `ss_3600efe1…`, `ss_4a763117…`, `ss_9dde75df…`, `ss_64f066f1…`, `ss_617697f6…`). They are used side by side in the grid only.
- IGN 8/10 and GameSpot 8/10 (scores via Wikipedia and OpenCritic): https://en.wikipedia.org/wiki/Lego_2K_Drive · https://opencritic.com/game/14797/lego-2k-drive
  (IGN: "incredible custom vehicle creation tool"; GameSpot: "raucous arcade racer that marries open-world racing and kart racing").
  Eurogamer 3/5: "bright humour and drift-heavy handling, scuffed by baggage and busywork" (OpenCritic excerpt). The ign.com and gamespot.com pages refused fetches (403).
- Gamecritics: drifting and boosting "intuitive", cars have "enough weight", destroyed scenery makes "a satisfying clicking sound", "every character is hilarious": https://gamecritics.com/c-j-salcedo/lego-2k-drive-review/
- Jump Dash Roll: "Driving is incredibly solid", the brake is for "sliding into well-timed drift", rubber-banding keeps races close, side quests "boil down to fetching", auto-transform "stays satisfying", cutscenes "reminiscent of The LEGO Movie", "the odd instance of pop-in and the occasional annoying frame drop": https://www.jumpdashroll.com/article/lego-2k-drive-review
- TechRadar ("one of the best racers ever built"; minigames "get old pretty quickly"): https://techradar.com/reviews/lego-2k-drive-review-one-of-the-best-racers-ever-built
- Metacritic 73 (PS5): https://www.metacritic.com/game/lego-2k-drive/ · Tom's Guide (grind/monetisation): https://www.tomsguide.com/reviews/lego-2k-drive-review-everything-isnt-awesome
- Earlier repo research with source lists: `docs/RACE2K_PLAN.md` (races, items, transforms) and `docs/GARAGE2K_GAP.md` (builder).

## Measurements (beta.60)
| what | Frankfurt | Athens |
|---|---|---|
| Cold start: load → CHOOSE ACTIVITY → STORY → slots → NEW GAME → loading → 2 dialogue taps → first input | ≈ 100 s, 5 taps (software GL) | – |
| `?test` start (menus skipped, low gfx) → drivable | 36–42 s | 50 s |
| 0 → 117 km/h on GAS (straight road) | 5 s | – |
| Road-follow player, 60 s: avg / max km/h | 124 / 212 | 75 / 179 |
| Road-follow player, 60 s: wall/prop hits | **7 /min**, health hit **0** (wrecked) | **13 /min**, health **0** (wrecked) |
| Single worst hit | 100 → 22 health | – |
| Monkey bot, 6 sim-min each: "stuck" (gas held, < 1 m/s for 3 s) | 12 cells | 14 cells |
| Monkey total | **35 stuck events in 12 min = 2.9 /min**, 3 tyre-gap cells (up to 0.55 m), 1 camera-blocked cell | |
| Rival duel (Grand Prix) with **zero steering, zero input** (race auto-gas) | run 1 (fixed 0.05 s steps): **won 1st/2, ★★★, 2:27, 180 km/h**; run 2 (GO, real frame clock): **soft-lock**, 2nd, pinned to a tunnel wall in boat form, still racing at 7:21, no respawn, no DNF | – |
| Transform road → water → boat | 0.4 s, speed kept 54 → 60 km/h | – |
| Garage: player ride on screen | **5 %** of the screen (one floating tyre) | – |
| Stop, Thief! card | 130 words (auto count incl. stars table), goal "three times" vs HUD "RAM THE VAN 4×" | – |

## Scores vs 2K Drive (one 852×393 shot per aspect, `docs/shots/review2k/`)
| # | aspect | score | what 2K Drive does | what we do (evidence) | the gap | the single highest-impact fix |
|---|---|---|---|---|---|---|
| 1 | First 60 s / onboarding | **3** | Opens on a LEGO-Movie-style cutscene, then you are driving in a rich valley within a minute (Steam ss_64f066f1; Jump Dash Roll on cutscenes). | Menu first: CHOOSE ACTIVITY with 8 choices, an update banner, a 🐞 over the logo; then save slots, ~20 s loading, two dialogue taps; ≈ 100 s and 5 taps to first input. The checklist dev bar sits mid-screen over the very first scene. `s03_first_roam.jpg` | 5 taps and ~100 s of nothing vs ~1 tap; dev UI in the opening shot. | First launch goes straight into the Hot Drop (no menu, no slot picker); every menu comes after the first drive. |
| 2 | Free-roam driving feel | **3** | "Driving is incredibly solid", drift/boost "intuitive", weighty cars, glancing contact is forgiven (Jump Dash Roll, Gamecritics). | Fast and responsive on a straight (0–117 km/h in 5 s), but a road-following driver hits something 7×/min (Frankfurt) and 13×/min (Athens) and is wrecked in under 60 s; one hit took 78 % health. Monkey: 2.9 dead stops/min. A car sat beached on a roadside red/yellow barrier piece. `stuck_fra_barrier.jpg` | Driving is a fight with the scenery, not a flow. | Cut collision damage and make every roadside piece a sliding (not stopping) collider; target ≤ 1.5 hits/min for the road-follow player. |
| 3 | On foot | **2** | Not a pillar of 2K Drive (reviews don't mention it); the minifig is a presenter in cutscenes and hubs. | Spawned inside a cluster of minifigs around a table; drag-to-walk, RUN, JUMP; nothing to do, nothing to pick up. `foot_fra.jpg` | A mode with no purpose. | Hide on-foot until it has one job (e.g. walk into the garage); never spawn into a crowd. |
| 4 | A story mission | **3** | Story beats are funny cutscenes with voiced characters; missions are varied (chases, rescues), though reviewers flag fetch-y side quests (Gamecritics, Jump Dash Roll). | Stop, Thief!: a card of ~6 blocks (GOAL / WHERE / STAGES / TWIST / stars table), goal "three times" while the HUD says "RAM THE VAN 4×"; missions don't play themselves (good) but the briefing is a wall of text and contradicts itself. `m_thief_card.jpg` | Text instead of a scene; contradictory numbers. | One-line card ("Ram the van 3×") + the van shown driving off as a 3-s camera shot. |
| 5 | A race | **2** | Kart-style races with items on open-world courses, rubber-banding keeps them close; the boost/drift is the skill (RACE2K_PLAN, Jump Dash Roll; Steam ss_9dde75df). | Rival duel won **★★★ with no input at all** (auto-gas and auto-steer drove the whole 2:27 lap at 180 km/h). A second hands-off run soft-locked: pinned to a tunnel wall in boat form, still racing at 7:21, no respawn. Track is a neon "tron" void, not the city; HUD timer under the 🐞; the dev bar covers the left third. `race_t18.jpg` | The race needs no player. That alone makes it boring. | Remove race auto-steer (keep a mild lane assist that can't win alone) and add rival pressure so a hands-off run finishes last. |
| 6 | The builder | **2** | Body Shop: the car fills the centre, a held 3D brick, drawer sorted by category, guided builds; IGN's headline praise (Steam ss_4a763117). | BUILD tab: tiles are text ("3009 Brick 1×6 Brick 1×6"), labels overlap the + buttons, only 1 of 14 tiles shows a recognisable brick, and the car being built is not on screen (one floating tyre). `builder_L.jpg` | A spreadsheet next to a missing car. | Put the car in the centre and show each brick as a rendered 3D thumbnail; text only on long-press. |
| 7 | Garage | **2** | A themed hub (neon GARAGE sign, workshop) and a car showroom you can turn (Steam ss_617697f6, ss_4a763117). | Grey floor, one floating tyre, a minifig; the ride covers 5 % of the screen; "owned 156/156" yet the 156 ride cards sit below the screen edge (first card at y = 460 on a 393 px screen). 🐞 covers the ride name. `garage_L.jpg` | The garage shows nothing you own. | Frame the selected ride at ≥ 12 % of the screen and put the first row of ride cards on screen. |
| 8 | Vehicle transform (road / off-road / boat) | **6** | Automatic street ↔ off-road ↔ boat, instant brick burst, "go practically anywhere with no slowing down" (RACE2K_PLAN sources, Jump Dash Roll: "stays satisfying"). | Works: water → boat in 0.4 s, speed kept (54 → 60 km/h), boat sits in the water; grass → off-road buggy. A large white wake blob covers the bottom of the screen. `xf_boat.jpg` | Missing the celebratory moment (no burst, no camera beat seen), otherwise close. | Add a 0.3 s brick-burst + whoosh + small camera kick on each swap. |
| 9 | Traffic / NPC life | **3** | A lively valley: traffic, NPCs with jokes, set pieces, an airship overhead (Steam ss_3600efe1). | Frankfurt has parked/traffic cars and standing crowds (minifigs bunched in clumps); Athens main road at 162 km/h shows no moving car; a traffic car ran into us at the Frankfurt slipway spawn. `ath_drive.jpg` | People stand, cars are sparse; nothing reacts to you. | Fewer, moving NPCs that react (jump aside, cheer, honk) along the roads you drive. |
| 10 | HUD / menus | **3** | Clean racing HUD: position, lap, item, boost; world objectives appear one at a time (Steam ss_9dde75df). | Up to 5 objectives at once (story + sprint + CONE SLALOM + DRIFT HERE + CHAIN + chapter banner) plus hint popups (BRIX "Tap the NEXT bar"); dev checklist bar mid-screen; 🐞 over logo / timer / garage title; duplicate "ROSSI · TURBO BURST" lines in the race. `fra_hud_noise.jpg` | Noise everywhere; nothing tells you the one thing to do. | One objective line, everything else on the map; dev bar collapsed to an edge chip. |
| 11 | Performance (fps, boot) | **3** (unverified on a phone) | Console/PC game; reviewers note "the odd pop-in and occasional frame drop" (Jump Dash Roll). | Cold start ≈ 100 s to first input here; test start 36–50 s; fps can't be measured without a GPU (1–3 fps software GL). Scored on boot time only. `s02_newgame.jpg` (the loading screen already shows the dev bar). | Boot is 3× the 30 s a phone player waits. | Load the first district only, start driving, stream the rest. |
| 12 | Audio | **n/s** | Voiced cast, music, satisfying brick-click destruction sound (Gamecritics). | Not heard: no audio device in the container. Files exist (`music/`). | — | Owner check on the phone. |
| 13 | World art / look | **3** | Saturated, detailed LEGO valley; brick-built scenery everywhere (Steam ss_3600efe1, ss_617697f6). | Off-road areas are a flat lime plane with low-poly green shards; big plain slabs (a tall red block in the first shot); the city streets look decent in places (Athens). `fra_roam_6s.jpg` | Empty, flat ground between the good bits. | Replace flat lime ground with brick-textured terrain and clustered LEGO plants. |
| 14 | Portrait (393×852) | **2** | n/a (console). | A "Portrait works too · OK" modal pops up over the road at 132 km/h; "SMASH 20" text sits on the route arrow text. `ath_portrait.jpg` | Modal while driving. | Never show a modal while the car moves. |

## TOP 10 problems by player impact (each is now a checklist test `rv:2026-10-14`, ver `rv2k`)
| rank | problem | why it kills the fun | acceptance test (numeric pass line) | GO id | dry run on beta.60 code |
|---|---|---|---|---|---|
| 1 | Races play themselves (★★★ with zero input) or soft-lock (stuck 7+ min, no respawn/DNF) | No skill, no tension: "boring" by construction; or a race that never ends | Hands-off rival race: it **ends within 240 s** and you finish **not 1st** | `rv2k/race-handsoff` | ❌ run 1 won ★★★; run 2 still racing after 360 s (`race_softlock.jpg`) |
| 2 | Wall/prop hits and wrecks | Every corner punishes you; "unplayable" | Road-follow 60 s from the Frankfurt start: **≤ 1.5 hits/min and health never 0** | `rv2k/walls` | ❌ 6.0/min, lowest health 43 |
| 3 | Dead stops (stuck) | Gas held, car doesn't move | Each worst monkey cluster: GAS 3 s moves **≥ 5 m**; monkey rerun **≤ 0.3 stuck/min** (now 2.9) | `rv2k/stuck` | spot 1 ✅ 5.1 m; monkey 2.9/min ❌ |
| 4 | Objective and popup noise | No clear goal; "repetitive, boring" | 60 s free roam: **≤ 2 objective/hint widgets at once, 0 OK-popups while moving** | `rv2k/objectives` | ❌ 4 at once |
| 5 | Dev UI on the player's screen | Covers the road; looks unfinished | Checklist bar overlaps the centre 60 % by **0 px²**; 🐞 overlaps **0** HUD items | `rv2k/devui` | ❌ 13 396 px² |
| 6 | Garage shows no car, cards off screen | The reward screen shows nothing you own | Ride covers **≥ 12 %** of the screen; ≥ 6 ride cards in view (visual) | `rv2k/garage-car` | ❌ 5 % |
| 7 | 100 s / 5 taps to first input | Players quit before driving | Cold start **≤ 30 s and ≤ 2 taps** to driving (phone) | `rv2k/onboard` | visual (test start skips menus); measured ≈ 100 s here |
| 8 | Builder drawer is text, labels overlap | The headline 2K feature is unusable | Every drawer tile has a part picture ≥ 32 px, **0 tiles with overlapping labels** | `rv2k/drawer` | ❌ 1 overlapping tile (pictures: visual check) |
| 9 | Camera inside bushes/walls | You can't see the road at speed | **≤ 2 %** of 0.25 s samples with anything between camera and car on the Messe → Mainkai road | `rv2k/foliage` | ✅ 0/115 twice (also with a car → camera ray): the GO route does not reproduce the leaves shot yet; treat as a visual check until it does |
| 10 | Mission card: wall of text, wrong number | Players don't read; then the HUD contradicts the card | Card **≤ 25 words**; card goal number **=** HUD goal number | `rv2k/card` | ❌ 130 words, 3× vs 4× |

## Other bugs seen (not in the top 10)
- Keyboard GAS stops responding after any touch input in the same session (touch GAS keeps working). Hybrid PC/touch players and key-driven tests are affected.
- The rival race HUD shows "ROSSI · TURBO BURST" twice; the race timer sits under the 🐞.
- The `xf1/water` GO's own scripted drive stopped at 0 km/h after a traffic car hit it at the slipway spawn (GO reported ❌).
- Car heading is not wrapped: the monkey recorded `h = 148688374` rad after spins (harmless today, a trap for any heading maths).
- On foot: F at speed does nothing (expected), but the 🚪 EXIT button only appears when stopped and nothing explains it.

## Grid
`docs/shots/review2k/GRID.jpg`: the worst 9 moments, ours on the left, the 2K Drive Steam store shot on the right where one fits.
