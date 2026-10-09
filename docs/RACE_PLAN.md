# RACE PLAN (race worker, 2026-10-09): "we have functionalities but the races are boring"

## 0. The reference
Video: youtube.com/watch?v=UDpcEFCvkEo, "Lego 2K Drive – Rival Race Max Speed, Chasm Crossing, Hauntsborough – Story Mode", 308 s.
- The video download itself was blocked here (YouTube bot check, HTTP 403).
- What I did get:
  - the 4 HD thumbnails (start, 25 %, 50 %, 75 %);
  - the full YouTube storyboard: 65 frames, one every ~4.7 s, 160×90, via yt-dlp `-f sb0`.
- Saved in `docs/race_ref/`:
  - `hd_*.jpg` (1280×720);
  - `01…11_*.jpg` (storyboard tiles upscaled ×4, blurry but readable);
  - `storyboard_0..2.jpg` (the raw sheets).
- Web: speedrun.com lists Chasm Crossing (best 2:07.81 for 3 laps, so ~43 s per lap).
- Reviews (2023) describe the 2K Drive race systems:
  - Boost fills from smashing and drifting; a full meter gives a ram state.
  - Glowing item orbs.
  - Rubber-banding, criticised as "lose first place at the last moment through no fault of your own" (ramblingbrick, gamespot, godisageek, checkpointgaming).

### Traits seen in the frames (frame index × 4.7 s ≈ video time)
| trait | what the frames show | frame |
|---|---|---|
| Pre-race | Intro card: track name, RIVAL portrait and name, first-place prizes, PRESS TO START, a glowing start ring on the ground. Then a ~20 s flyover of the track with a big title logo | 1–6, hd_intro_card |
| Countdown | The camera sits beside the player's car (side and front view of the car), with a huge yellow "3"; at "1" it is behind the car, the start gate ahead and rivals' name tags with position numbers | 7, hd_countdown |
| Grid | **The player starts 8TH, at the back**, with the whole pack ahead in view | 8, hd_countdown |
| First minute | 8th → 7th → 5th → 4th → 1st in ~25 s of racing: overtakes through the pack are the opening act | 8–12 |
| Boost | Twin boost jets visible in ~60 % of race frames: boost is used constantly, not rationed | 9–50 |
| Mid race | Mostly 1st, but lap 2 drops to 2nd/3rd/4th/6th/3rd (items, pack fights), then back to 1st: the pack stays close | 30–42 |
| HUD | Big ordinal position top-left (8TH), 8-name standings list (desktop), LAP 1/3 + race time top-right, minimap bottom-left, boost arc bottom-centre | all |
| Track | Cobble/dirt road ~3–4 cars wide, grass and hills at the edges (no walls), fences, pumpkins, white bracket checkpoint gates, chevron boards at corners | 12–50 |
| Air | Jumps off ledges with long air time; WRONG WAY + respawn timer | 46, hd_jump |
| Laps | 3 short laps (~45 s each) | 7–51 |
| Finish | "1ST" big letters + an orbiting camera around the car → "YOU WON A FLAG!" → "RIVAL BEATEN!" (rival minifig) → RESULTS + PRIZES → back in the world: a crowd of minifigs cheering around a podium disc | 51–55, hd_finish |

## 1. Our races before (live v89b1 src, `tools/tRace.js` phone 852×393, real touch, fast mode, HQ shots in `qa_race/base`)
| | grand (Frankfurt) | hafen (Frankfurt) | akro (Athens) |
|---|---|---|---|
| race length (1 lap) | 120 s | 80 s | 114 s |
| player place every 10 s | 1 1 1 3 2 1 1 1 1 1 1 2 | 1 1 2 2 2 2 4 | 1 1 1 3 3 1 1 1 2 6 6 |
| final place | 2/8 | 5/8 | 6/8 |
| time with a rival within 20 m | 37 s (31 %) | 36 s (45 %) | 60 s (52 %) |
| field spread 1st→last at 60 s | 365 m | 257 m | 145 m |
| overtakes (all cars) / player place changes | 45 / 6 | 31 / 12 | 53 / 14 |
| jumps / boosts / items | 5 / 14 / 8 | 3 / 7 / 3 | 1 / 14 / 4 |
| dead stretches ≥6 s (nothing near, no event) | 7.3, 6.7, 9.8 s | 7.2 s | 7.0, 6.3, 6.6 s |

**Why it is boring, in numbers:**
1. **The player starts on POLE** (`setupRace`: the player is ship n−1, which is grid slot 0). He leads from the first metre: 1st in 75 % of the 10 s samples on grand. There is no one to chase and no opening climb.
2. **Then the rubber band steals the end.** AI behind the player got up to +13 % speed at 260 m. They catch up late and pass: akro went 1st → 6th in the last 20 s, hafen 2nd → 5th. This is exactly the 2K criticism ("lose first place at the last moment").
3. **The checklist strip** (Alex's test checklist) sits top-centre during the whole race and covers the "2ND FINISH" banner (shot `qa_race/base/grand_phone_end.jpg`).
4. The countdown is a plain chase view with a small number. The finish goes straight to a table: no car showcase, no podium.

## 2. Ranked changes (what the reference and the numbers support)
1. **Start at the back** of a tight grid (8th, best AI on pole): the 2K opening climb. *(done, RF)*
2. **Fair rubber band**:
   - In the first 65 % of the race, AI more than 35 m ahead wait (up to −10 %) so the pack stays reachable.
   - The catch-up from behind (up to +9 %) fades to 20 % over the last 25 %, so nobody steals the win at the line. *(done, RF_rub)*
3. **Place-change feedback**: ▲ 4TH / ▼ 5TH pop under the position counter. *(done)*
4. **Countdown showcase**: the camera swings from the car's nose to behind it during 3·2·1 (frame 7). *(done)*
5. **Finish**: orbit camera around the car, plus a top-3 podium strip on the results with RIVAL BEATEN! in rival races. *(done)*
6. **The checklist folds to its chip** during the countdown, the race and the finish. *(done)*
7. Next, not done (the numbers don't demand them yet; 5. in the lessons says less is more):
   - checkpoint gates with split gaps;
   - 2–3 shorter laps (tracks are 4–7 km, so a 1-lap race is already 80–120 s);
   - a bigger ordinal position HUD;
   - the crowd podium scene in the world.

## 3. After (RF build) — see the bottom of this file (filled in after the tRace runs)
