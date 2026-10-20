# UI noise audit (Alex: "a lot of pop ups, very distracting screen"), trunk `d889732`, built `rv22o`

## How I measured
- **Real first-run flow**, not the test start: localStorage cleared, then **▶ PLAY**. The test start skips story and tutorial popups, so it would hide the problem. Then 5 minutes of real-time driving with the gas held and a random steer every ~4 s.
- **Runs:** Frankfurt and Athens, at 852×393 and 402×812, with touch emulation.
- **Logger** (`docs/shots/uinoise/scripts/ui.js`): every 300 ms it records every visible, positioned DOM overlay with text that covers ≥ 0.2 % of the screen. For each one: id, text, % of screen area, % of it inside the road-centre box (30–70 % of the width, 30–75 % of the height), whether it overlaps the touch controls, and the car speed.
- **Summary per element:** times shown, share of time on screen, max area, time on screen above 40 km/h. Raw table: `docs/shots/uinoise/popup_log_summary.txt`.
- **Desktop:** I measured the minimap at 850×870 (Alex's PC window), at 1920×1080, and at both phone sizes. My 850×870 first-run drive timed out, so the desktop measurements come from the test start.
- I looked at every saved shot. Caveat: the bot drives on SwiftShader at 10–15 fps, so game time runs a little slower than wall time. Counts per minute are per wall minute.

## What a player sees in the first 5 minutes
| # | Element | Trigger | Size (% of screen) | On screen | Shown at > 40 km/h | Covers road centre / controls |
|---|---|---|---|---|---|---|
| 1 | `#roamTut` **TUTORIAL 1/6 … 2/6** + SKIP (Athens) | city entry, on every new slot | 7.8 % land / **11 % portrait** | **91–92 % of 5 min** (stuck on step 1–2: the steps wait for actions the player may never do) | yes, 214–256 s at up to 190 km/h | **40 % of it over the road centre** (land), overlaps BOOST in portrait |
| 2 | `#story` chapter card "CHAPTER 1 · WELCOME TO ATHENS" (about 80 words) | city entry | 35 % land / **48 % portrait** | 20–24 s until CONTINUE | no (car stopped) | 51 % over the road, covers BOOST |
| 3 | `div.tk` Oma Hilde story box + SKIP (Frankfurt Hot Drop) | mission start | 22 % land / 18.5 % portrait | 24–32 s, tap to continue | no | 34 % over the road |
| 4 | `#npcSay` Oma Hilde coaching balloon ("Hold BOOST on the straight…") | mission coaching | **9.7–10.2 %** | 3 times, 4–7 s each (0.6/min) | **yes, at 115 km/h** | 45 % over the road centre (top half of the view) |
| 5 | `#roamPop` **DRIFT HERE 0.0 / 4 s of drift** | OTG drift zone | 1.6–2.9 % | **73–79 %** of the time | yes | overlaps the tutorial card text in portrait (two texts on top of each other, `ath_402x812_14_ogArea.jpg`) |
| 6 | `#rotateHint` "📱↻ Portrait works too…" | first roam in portrait | **14 %** | 9–20 s | no | 54 % over the road |
| 7 | `#ogArea` "📍 KOUKAKI 16 % COMPLETE" | entering a district | 1.5–2.7 % | 22–34 s, twice in 5 min | yes | sits on the ⚙ settings button (top right) |
| 8 | `#crSmHint` "HIT FAST = SMASH" | free roam | 1.3 % | 2 times, 57–96 s (19–32 %) | yes | top band, next to the minimap |
| 9 | `#roamArrow` quest pill + `#m1Next` NEXT pill ("🥨 Yiayia Froso · Koulouri Rush → 1491 m") | always | 2.2–3.1 % each | 64–89 % + 24–30 %, **both together** in Athens (two lines saying the same thing) | yes | top centre |
| 10 | `#raceW` race timer "04:20.0" | a race card was accepted | 0.6 % | 17–22 % | — | stacks on top of the quest pill |
| 11 | `#hitPop` / `#juPop` "💥 SMASH!", "+COMBO ×3", "CHAIN 26 ×3 +156 STUDS" | smashes | 0.6–1.7 % | short (2–7 s each) | yes | small, fine |
| 12 | `#roamTop` "WRONG VEHICLE FOR DIRT · ⟳" | off-road in a road car | 2.3 % | 5 s | yes | top |
| 13 | "START RACE" offer card | a race start point on the route | — (my driver tapped it 8–13 times in 5 min) | repeats on every pass | — | blocks the screen until tapped |
| 14 | Minimap `#roamMini` (permanent) | always | 182 px = **21.4 % of the width on PC 850×870** (9.5 % at 1920), 92 px = 10.8 % land, 104 px = **25.9 % portrait** | 100 % | — | on PC it also covers the boost bar and the "✔ 0/14" chip (`pc_850x870.jpg`) |
| 15 | FPS / debug overlay `#fps` ("51fps · worst 34ms · JS 6 · 367dc") | Settings → **FPS counter = On** (`SET.perf`) | 1–2 % | always when on | — | bottom left. **Not on by default** (hidden in all 4 of my fresh profiles); Alex's profile has it switched on and saved |
| 16 | Permanent chips: ⚙ `#tuG`, 🐞 `#qaBugTop`, BRICKBASH `#b2kM`, EXIT, ↺ rescue, pause | always | 0.3–0.6 % each | 100 % | — | 5–6 separate buttons around the edges |

Worst moments, side by side:
- Athens landscape at 167 km/h (`ath_852x393_13_ogArea.jpg`): **7 overlays at once**: quest pill, district banner, minimap, DRIFT HERE, TUTORIAL 2/6 card with SKIP, ⚙, BRICKBASH.
- Athens portrait at 166 km/h (`ath_402x812_14_ogArea.jpg`): the tutorial card and DRIFT HERE are drawn on top of each other, and the speed reads "166 KM/H" behind them.
- Frankfurt at 115 km/h (`fra_852x393_14_npcSay.jpg`): the coaching balloon covers the top of the road above the car.
- 2K Drive / Forza Horizon (described): while driving there is one objective line at the top, a small minimap of about 10 % of the width, the speedometer, and **one** transient toast at a time (≤ 2 s). Story text only shows while the car is stopped or in a cutscene. Tutorials are a single line per step, shown once.

**Pedestrian clumping** (Alex's PC shot: about 12 minifigs standing in a clump at the right kerb): I could not count it from state. `HUB.peds` positions are edge-relative (fields `e`, `t`, `side`), and my world-space probe found 0 within 150 m. It needs a world-space probe in the fix lane (item 9).

## Rules for the cut
1. **One non-essential popup per 60 s**, at most one on screen at a time. Essential, always allowed: rescue / ROAD BUSY, race countdown and results, a crash or wrong-way warning.
2. **Nothing non-essential above 40 km/h.** It queues until the car is under 40 km/h for 1.5 s, or is dropped after 20 s.
3. **Nothing over the road centre box** (30–70 % of the width × 30–75 % of the height) while driving. Story text and cards only with the car stopped (|v| < 2).
4. **One top line**: quest pill, NEXT pill, race timer and district banner merge into a single compact line ≤ 420 px wide on landscape, ≤ 92 % of the width on portrait.
5. **Tutorials only on the first run** (per save, not per city), one line per step, auto-advance after 6 s if the step is not done, never more than 1 step per 30 s.
6. **No repeated toasts**: the same text at most once per 3 minutes. Hints like "HIT FAST = SMASH" or "WRONG VEHICLE" at most 3 times per session.

## Ranked fixes (screen area × frequency, cost)
| # | Fix | Target (number) | GO assert idea (no graphics) | Model, effort |
|---|---|---|---|---|
| 1 | **Tutorial card** (`#roamTut`): first run only; auto-advance or hide after 6 s; never at > 40 km/h; move it out of the road box; never draw it together with `#roamPop` | ≤ 30 s total on screen in the first 5 min (now 270 s); 0 frames at > 40 km/h; 0 frames overlapping `#roamPop` | `ui/tut`: fresh slot, hold gas 120 s (sim); sum `#roamTut` visible time ≤ 30 s, time with `RO.v > 11` = 0, rect ∩ road box = 0; a second city entry shows 0 s | Sonnet, S |
| 2 | **Popup governor in `say()` / `npcSay()`** (one choke point, 211 + 11 call sites): queue, rate 1 per 60 s, speed gate 40 km/h, same-text 3 min, essential whitelist | ≤ 1 non-essential overlay per 60 s; 0 at > 40 km/h; 0 repeats of the same text within 180 s | `ui/governor`: fire 20 mixed `say` / `npcSay` calls in 10 s at 100 km/h → ≤ 1 shown, the rest queued; essential `ESC_manual` text shows at once | Sonnet, M |
| 3 | **Story cards** (`#story`, `div.tk`) only while stopped, max 35 words per page (split into pages), never cover BOOST/GAS | ≤ 30 % of the screen on portrait (now 48 %); 0 overlap with `#touch .tbtn`; ≤ 35 words per page | `ui/story`: open chapter 1 in both cities and orientations; rect area ≤ 30 %, ∩ touch buttons = 0, word count ≤ 35 | Sonnet, S (text split: Haiku) |
| 4 | **One top line**: merge `#roamArrow`, `#m1Next`, `#raceW`, `#ogArea` (district % moves to the map screen) | ≤ 1 top element in the centre band, width ≤ 420 px on landscape; 0 overlap with ⚙ / EXIT | `ui/topline`: count visible elements with top < 15 % of the height and centre x within 25–75 % → ≤ 1; rect ∩ `#tuG` = 0 | Sonnet, S–M |
| 5 | **Coaching balloon** `#npcSay`: compact one line at the bottom-centre above the boost bar, ≤ 4 % of the screen, ≤ 3 s, only while < 40 km/h, or as audio only when fast | ≤ 4 % area; 0 frames at > 40 km/h; ∩ road box = 0 | `ui/coach`: trigger 3 coach lines at 100 km/h → 0 shown until v < 11, then each ≤ 3 s | Sonnet, S |
| 6 | **Minimap** size by viewport, not fixed px | ≤ 12 % of the width on PC (now 21.4 % at 850 px wide), ≤ 18 % on phone landscape (10.8 %, ok), ≤ 22 % on portrait (25.9 %); never covers the boost bar or chips | `ui/minimap`: at 850×870, 1920×1080, 852×393, 402×812: `#roamMini` width / innerWidth within targets, ∩ other HUD = 0 | Haiku (CSS clamp), S |
| 7 | **Rotate hint** `#rotateHint`: once per device, ≤ 4 s, at the bottom edge | ≤ 6 % of the screen; ∩ road box = 0; shown once per device | `ui/rotate`: a second boot in portrait shows 0 s | Haiku, S |
| 8 | **Repeated offers and hints**: "START RACE" offer, `#crSmHint`, `#roamTop` wrong vehicle, `DRIFT HERE` banner | race offer only when the player stops at the start point (not on every pass); hint texts ≤ 3 per session; DRIFT HERE only inside its zone (now 73–79 % of the time) | `ui/repeat`: drive a 5 min bot route; each text shows ≤ 3 times; `#roamPop` visible only while the OTG zone is within 60 m | Sonnet, S |
| 9 | **Pedestrian clumps at the kerb** | no more than 4 minifigs within 4 m of each other; idle groups ≤ 3 | `life/ped-spread`: convert `HUB.peds` (edge-relative e, t, side) to world space, find the max cluster within 4 m in 150 m around the player → ≤ 4 | Sonnet, S |
| 10 | **Permanent chips** (⚙, 🐞, BRICKBASH, EXIT, ↺, pause): group ⚙ + 🐞 + EXIT into the pause menu on phones; keep pause and ↺ | ≤ 3 permanent buttons outside the touch controls on phones | `ui/chips`: count visible `#tuG, #qaBugTop, #b2kM, #roamExit, #tU, #tP` on touch → ≤ 3 | Haiku, S |
| 11 | **FPS overlay**: default is already off; hide it on the Beta unless `?dbg=1`, even when the saved setting is On (Alex's profile) | 0 % unless `?dbg=1` | `ui/fps`: with `SET.perf = true` and no `?dbg=1`, `#fps` stays hidden | Haiku, XS |

Order: 2 (the governor) and 1 (tutorial) first: together they remove most of the time and area. Then 4 + 5 (top line, coach), then 3 and 6. 7, 10 and 11 are Haiku-size cleanups and can share one lane.

Files: shots and the raw table in `docs/shots/uinoise/`; logger and analysis in `docs/shots/uinoise/scripts/` (`ui.js` = real first-run driver and popup logger, `ana.py` = per-element table, `pc.js` = minimap and FPS sizes).
