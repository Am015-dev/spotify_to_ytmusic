# Strict review #3: Mainhattan Overdrive v90m-beta.81 (live) vs LEGO 2K Drive

Reviewer session review2k-3, 2026-10-17. Build: trunk `e18bbe2` built with `tools/build.sh v90m-beta.81` (= live beta.81 `d092fdd` on `alex/brave-carson-rbpmlk` plus the cosmetic pillclip commit), served locally.
Script: `tools/tRv2k2.js <url> docs/shots/review2k3 fra|ath|por|cold` (unchanged from review #2, four browsers in parallel on 4 CPUs) + `TAG=rv2k2/ node tools/tChkGo.js` (built page, 12/12 runner-PASS, 296 s). Shots: `docs/shots/review2k3/`, 852×393 (portrait `por_*` 393×852). I looked at every shot.

**Overall: 4.4 / 10 against 2K Drive** (mean of 12 scored aspects; 4.5 on review #2's 10 aspects, vs **3.8** in review #2, 2.8 in review #1).
The big win is Westend Split: a careful driver now **wins it with 5–16 lead changes and a 20 m median gap**, and loses in portrait by 0.56 s. That is a 2K race. The home screen is one PLAY button. But it is the only fair race: Main River Run, the Grand Prix Quick Race and the Akropolis final (in a real play-through) still end in DNF. And in free roam the car still gets **parked at 0 km/h with gas held**, first behind traffic and then under a quest card, in both cities.

## How it was played
- Same method as review #2: real built page, Playwright touch context, software GL, game time advanced with `roamStep(1/30)`. Human-like bot = `tkBot` (150 ms lag, brakes for corners). Road-follow = gas held, steers 12 m + 0.9·v ahead.
- Boot times are inflated (4–5 browsers on 4 CPUs): cold menu 242 s here. Not comparable. The tChkGo fast boots (`draw=0`) were fra 32–36 s and ath 57 s.
- Not done: on-foot, audio, story mission to the end, real phone fps, side-by-side reference shots (Steam screenshots are delisted; references are the review #2 links).

## Measurements (beta.81, r2 = beta.74)
| what | beta.81 | r2 |
|---|---|---|
| Home screen | **1 button** ("▶ PLAY Hot Drop · your first drive"), credits shown | 14 buttons |
| Road-follow 30 s from spawn, Frankfurt | 116 / 127 km/h (2 runs), 0 hits, health 96 | 106 |
| Road-follow 30 s from spawn, Athens | **29 km/h**, ends at 0 km/h under a SIDE QUEST card | 31 |
| rv2k2/pace 60 s, Frankfurt (-375,475) | **31 km/h**: 118 km/h, then traffic 4–12 m ahead, 0 km/h at (140,408) for 40 s, quest card opens (`0c` in trace) | – |
| Westend Split, human-like bot | **1st 2:30.9, 5 lead changes, gap median 21 m** (GO run: 1st 164.6 s, 16 changes, 20 m) | DNF, 0 changes |
| Westend Split, portrait | 2nd, 2:41.38 vs Rossi 2:40.82, **10 lead changes** | – |
| Westend Split, hands-off | DNF (good) | DNF |
| Main River Run, bot | **DNF**, 0 changes, gap median 1238 m | DNF |
| Grand Prix Quick Race, bot | **DNF, 4th**, 2 changes, gap median 176 m (max 655 behind); rivals 2:11–2:19 | – |
| Akropolis final, bot, after 30 s Athens roam | **DNF**, 0 changes, gap median 709 m, Drakos 1:57.00 | DNF, Drakos 0:58.97 |
| Akropolis final, rv2k2/akro GO (fresh page) | 1st 126.9 s, 0 stuck, 1 wall hit | – |
| Items fired, Westend bot | 8 | – |
| Street life at the Frankfurt start (GO) | 32 cars ≤ 120 m, 27 moving, 33 people ≤ 60 m; 44 cars ≤ 250 m 5 s after a 1.6 km warp | – |
| Transform burst (GO) | 2 burst objects 0.3 s after ship → offroad | none |
| Text < 12 px | 0 landscape, 0 portrait | BRAKE/BOOST < 12 px (portrait) |
| Console errors | 0 (all runs) | – |

## Scores vs 2K Drive
| # | aspect | r3 | r2 | what 2K Drive does | what we do (evidence, shot) | the single highest-impact fix |
|---|---|---|---|---|---|---|
| 1 | First 60 s / onboarding | **5** | 3 | PLAY → cutscene → driving in a minute. | One big PLAY button with "Hot Drop · your first drive", credits under it. Logo badge overlaps the WELCOME bar slightly. Boot not measured cleanly (contended). `a_menu.jpg` | Measure STORY → first frame on a phone; cut the program-link stalls. |
| 2 | Free-roam driving feel | **4** | 5 | Forgiving, fast, never stuck. | From spawn 116–127 km/h, 0 hits (`fra_drive.jpg`, 145 km/h with traffic ahead). But from the pace spot the car sits at 0 km/h behind traffic for 40 s with gas held; Athens averages 29 km/h. Down 1: a held-gas car parked in traffic is worse than r2. | Traffic ahead must yield or let you pass (no 0 km/h > 3 s with gas held). |
| 3 | On foot | n/p | n/p | – | Not played. | – |
| 4 | Story / side quest | **3** | 3 | Small prompt you drive past; scenes. | At speed the card no longer opens (GO 108 km/h). But once the car is stopped near a marker the full SIDE QUEST card (quote, ★ table, rewards, LET'S GO/LATER) opens and the car stays at 0 km/h with gas held; "CHAIN 32 ×3 +192 STUDS" beside it. `ath_drive.jpg` | Holding GAS dismisses the card (or it never opens while GAS is held). |
| 5 | Races | **4** | 1 | Close kart races, items every lap. | Westend Split: win by a car length, 5–16 lead changes, 8 items, `?` bricks on the road (`westend_bot_0.jpg`); portrait loss by 0.56 s. But River Run DNF (1.2 km behind), Grand Prix DNF 4th, Akropolis DNF after free roam (`akropolis_bot_2.jpg`). No place/gap on the HUD ("Checkpoint 4/5" only). A LEVEL UP card covers the top centre mid-race at 117 km/h (`westend_bot_1.jpg`). | Apply the Westend Split pacing to every course (River, Grand Prix, Akropolis). |
| 6 | Builder | **3** | n/s | Body Shop, car in the centre. | The garage BUILD tab opens MY TRACK: a palette and buttons around a **black void**, "0 pieces", no ground or grid. `builder.jpg` | Show the ground/grid and a start piece in the builder view. |
| 7 | Garage | **5** | n/s | Showroom. | Car big in the centre, 156 street rides, filters, SAVE & DRIVE. Card labels cut off ("SUPER …", "Orange …", "Midnigh…"); the 🐞 button sits over the PAINT tab. `garage.jpg` | Two-line card labels; move 🐞 out of the garage. |
| 8 | Vehicle transform | **6** | 5 | Brick burst + whoosh every swap. | The burst exists now (GO: 2 objects). The boat on the Main looks right; the water is pale blue/white rather than deep blue. `river_bot_0.jpg` | Camera kick + sound on the swap; deeper water colour. |
| 9 | Traffic / pedestrians | **6** | 5 | Lively valley. | 32 cars / 27 moving / 33 people near the start; the city refills after a warp; police car, people at stalls (`westend_bot_1.jpg`). Traffic also blocks the lane (row 2). | Yield or overtake logic (row 2). |
| 10 | HUD / menus | **4** | 4 | Clean HUD, one objective. | Tidy left stack, one top pill. Still: ✔0/13 chip + 🐞 in every shot, LEVEL UP card and the "Frankfurt · Chapter 1" toast during a race, the result panel while the car drives at 101–117 km/h, and the STORY pill on top of the race result (`westend_bot_2.jpg`, `quick_grand_bot_0.jpg`). | No cards/toasts during a race; stop the car at the result. |
| 11 | Performance (boot) | **3** | 3 | Console. | Fast test boot 32–36 s Frankfurt, 57 s Athens (`draw=0`); cold menu 242 s here under contention. No phone numbers. | Phone measurement by Alex. |
| 12 | Audio | n/s | n/s | – | – | – |
| 13 | World art | **6** | 6 | Saturated brick world. | Deep blue sky, brick clouds, red/orange brick trees (`fra_roam.jpg`); Athens skyline good (`akropolis_bot_1.jpg`). The big translucent green sphere marker is still on the road at the Athens start (`ath_roam.jpg`); smash debris is still large black/white slabs (`por_fra_drive.jpg`). | Smaller, LEGO-shaped debris; a ground ring marker instead of the sphere. |
| 14 | Portrait | **4** | 3 | n/a | One dev chip (was 2), 0 tiny text, a close race. But smash debris fills a third of the screen in front of the car, the car fills the lower half, and the 🐞 sits on the result table (`por_fra_drive.jpg`, `por_portrait_westend_0.jpg`). | Debris cap by screen area in portrait; pull the camera back. |

Mean, 12 scored (1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14): **4.4**. Review #2's 10 aspects only: 4.5 (r2 3.8).

## Review #2 TOP 10 re-check (beta.81, `TAG=rv2k2/` on the built page + the play-through above)
| r2 # | GO | GO line now | play-through | verdict |
|---|---|---|---|---|
| 1 | rv2k2/close | 1st 164.6 s, 16 lead changes, gap 20 m ✅ | 1st, 5 changes, 21 m | **PASS** |
| 2 | rv2k2/akro | 1st 126.9 s, 0 stuck, 1 hit ✅ | **DNF** after 30 s Athens roam (gap 709 m, Drakos 1:57) | **PASS (GO) / FAIL (play)** |
| 3 | rv2k2/cardstop | no card at 79 km/h, 108 km/h after 1.5 s ✅ | card opens once stopped; Athens avg 29 km/h | **PASS (GO) / FAIL in spirit** |
| 4 | rv2k2/menu | 1 button, banner 0 px² ✅ | `a_menu.jpg` | **PASS** |
| 5 | rv2k2/pace | **31 km/h ❌** (runner printed PASS: harness bug, see below) | Frankfurt from spawn 116–127; Athens 29 | **FAIL** |
| 6 | rv2k2/burst | 2 burst objects ✅ | – | **PASS** |
| 7 | rv2k2/items | 8 fired ✅ | `?` bricks on the road | **PASS** |
| 8 | rv2k2/traffic | 32 / 27 / 33 ✅ (+ warp-traffic 44 ✅) | `westend_bot_1.jpg` | **PASS** |
| 9 | rv2k2/tiny | 0 ✅ | portrait 0 | **PASS** |
| 10 | rv2k2/hudctl | 4/4 controls, 0 px² ✅ | – | **PASS** |
**9 of 10 pass by their GO line; 7 of 10 pass in play** (akro and cardstop pass only on a fresh page). Also `rv2k2/near` PASS (4 markers within 400 m, nearest 48 m).

## NEW TOP 10 by player impact (checklist GOs, ver `rv2k3`, `rv:2026-10-17`, pending: no GO code yet)
Items are at the top of `OD_CHECKLIST` in `src/99c_checklist.js` in a compact form (that file is 1 KB under the 200 KB lint cap); the full test is here.
| rank | problem | evidence | acceptance test (pass line) | GO id |
|---|---|---|---|---|
| 1 | Akropolis final (the story climax) is lost in a real play-through | DNF, 709 m median gap, Drakos 1:57; GO on a fresh page wins | After 30 s road-follow in Athens (as `tRv2k2 ath`), the human-like bot finishes 1st or 2nd with median gap ≤ 60 m; 3 runs | `rv2k3/akro-play` |
| 2 | Car parked behind traffic with gas held | pace trace: 0 km/h at (140,408) for 40 s, traffic 4–12 m ahead; Athens 29 km/h | 60 s road-follow from the rv2k2/pace spots, both cities: avg ≥ 90 km/h and never 0 km/h for > 3 s with GAS held | `rv2k3/jam` |
| 3 | Only one fair race | River Run DNF (1238 m gap), Grand Prix DNF 4th (176 m median, 655 max) | Human-like bot on Main River Run and Grand Prix Quick Race: finishes, ≥ 2 lead changes, median gap ≤ 60 m | `rv2k3/races` |
| 4 | Pop-ups mid-race | LEVEL UP card + chapter toast at 117 km/h in Westend Split | During a race (RO.sp active), 0 px² of cards/toasts in the centre 60 % of the screen | `rv2k3/racepop` |
| 5 | Result panel while the car keeps driving | 101 / 105 / 113 km/h under the panel | Within 2 s of the result panel the car is ≤ 10 km/h (auto-brake or finish cutscene) | `rv2k3/finish` |
| 6 | Quest card freezes a stopped car | `ath_drive.jpg`: card at 0 km/h, gas held | With the card open and GAS held, the card closes and the car is > 30 km/h 3 s later | `rv2k3/gascard` |
| 7 | No place or rival gap in the race HUD | "Checkpoint 4/5 → 475 m" only (r2 too) | During a race the HUD shows the place (1st/2nd…) and the gap to the nearest rival | `rv2k3/pos` |
| 8 | Dev UI covers player UI | 🐞 over the garage PAINT tab and the portrait result table; ✔0/13 chip in every shot | 🐞 and chip overlap any button or panel: 0 px² (garage, results, portrait) | `rv2k3/devui2` |
| 9 | Builder is a black void | `builder.jpg`: MY TRACK, 0 pieces, black canvas | Opening BUILD shows ground/grid: centre 50 % of the canvas < 20 % pure-black pixels | `rv2k3/builder` |
| 10 | Portrait smash debris blocks the view | `por_fra_drive.jpg`: slabs over a third of the screen | Portrait, 70 km/h smash: debris covers ≤ 10 % of the screen 0.5 s later | `rv2k3/debris-por` |

## Other bugs seen
- **Harness:** `tools/tChkGo.js` printed `PASS` for `rv2k2/pace` although the GO line ends with ❌ (31 km/h). Cause: `tools/chkgo_verdict.js` `oneLine()` cuts the text to 200 chars BEFORE the ❌ test, and the pace line (with its km/h trace) ends at ~700 chars. Test the full text, truncate only for printing. rev-79..81 may have counted pace as green because of this.
- `RO.veh` still reads `ship` / `ship/offroad` during the dry Westend Split and Akropolis (r2 bug, unchanged).
- Result panel shows the STORY pill ("Hot Drop · Last Train → 595 m") on top of it; the Rossi time is "—" when you win.
- Akropolis race shot 0: a huge white van tipped on its side fills the left third of the screen (`akropolis_bot_0.jpg`); a smash with no cap on vehicle size.
- `fra_roam.jpg`: at 0 km/h the BRAKE button is replaced by a yellow EXIT button next to BOOST (easy to hit by mistake when you want to reverse).
- Athens start: the translucent green sphere marker over the road (r2, unchanged).
- Garage ride card labels truncated ("SUPER …", "AWES…").
- `tRv2k2.js` life probe reads `traffic` (now `HUB.cars`), so `*_life` prints 0; use the rv2k2/traffic GO.

## Since review #2 (delta)
- Up: onboarding 3→5 (one PLAY), races 1→4 (Westend Split is a real race), transform 5→6 (burst), traffic 5→6, portrait 3→4.
- Down: driving 5→4 (stops dead in traffic).
- Same: story 3, HUD 4, boot 3, world art 6.
- New scores: builder 3, garage 5.
