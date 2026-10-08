# bug23 handoff: Hot Drop "extremely fast + teleports" (branch alex/od-bug23)

Alex (iPhone, beta): "first mission the car is driving extremely fast and teleports also has lot of bugs".
Src = live v87x + bug23 fixes, merged with live v87z src (origin/alex/od-fix21 c05ca90, music). Build: `tools/build.sh v88a`.

## Harness
- `tools/tM1.js <url> <out>`: fresh save → STORY → Hot Drop, phone 852×393, real CDP touch, follows arrow/GPS, taps scenes.
  `BETA=1` = iframe852.html + `claude.use('db')` stub returning an empty db. Logs per frame: car jumps > 3 m (setter trap on RO.x/z with
  callsite), goon/truck jumps > 4 m (on-screen flag), camera cuts > 8 m (fade flag), y drops, NaN, UNSTUCK, speed histogram, truck speed.
- `tools/probe23.js <url> <probe.js>`: fresh story start + in-page probe (qa23/pr_boost.js = flat-out gas then gas+BOOST speed trace).

## Root causes
1. "Extremely fast": BOOST in the city ran to **213 km/h**. tt = top×1.5 in the city, and the boost push (TUNE.bPush 20 m/s²) was added
   ABOVE tt, with only a 1.5/s pull back → equilibrium tt + 48 km/h. Hilde says "hold BOOST on the straights". Hilde's truck ran 158 km/h
   (44 m/s, speed stepped 0→122 instantly); Kaiser in Tail ran 194 km/h.
2. "Teleports" (the player car never jumped > 3 m in any run): ram knockback moved a goon 10–14 m in ONE frame (a path-locked van then
   snapped back the next frame = 2×10 m on screen); rammers re-routed every 1.3 s from the nearest road node (6–9 m snaps); thief vans spawned
   0–8 m off their path and on the same spot (stacked, then a 20 m snap); scene starts/ends and story warps cut the camera 56–103 m with no fade;
   the chute drop ended 40 m up and the car appeared on the road.
3. Empty/partial TUNE db: TU_apply resets to defaults, then sets numbers only (TU_set ignores non-finite) → no NaN possible; 0 NaN frames in beta runs.

## Fixes (src/)
- 71_roam_drive.js: `BG23_cap` boost/turbo push fades to 0 at the boosted top; city boost bonus .5→.25 (tt ≈ 148 km/h). Probe: gas 118, boost max 148.
- 80_story_m1.js: truck 26/22/14/6 m/s, Kaiser 30/27/23/18 m/s, both with smooth accel (+5/−8 m/s²); follow time cap max(75, L/18+15) s;
  `BG23_cut()` black cut on scene start/end + every `M1_warp` (checkpoint restore included); thief vans spawn on their path, 14 m apart;
  `BG23_knock` (knockback = decaying slide, van = visual offset); `BG23_rp` re-route starts at the goon; chute descends 17 m/s.
- 96_scale_qa.js: arrow label = stage verb (Follow/Ram/Tail/Fight/Drift/Go), was "Deliver" in every story phase.

## Numbers (tM1, 9–10 game min, phone touch)
| | before (live) | after |
|---|---|---|
| boost top, city (probe) | 213 km/h | 148 |
| truck max | 158 km/h | 94 |
| player max in mission (bot) | 144–157 | 139–148 |
| car teleports | 0 | 0 |
| goon/truck jumps > 4 m | 12 (10 on screen) | 0 |
| camera cuts w/o fade | 3 | 0 (3 faded) |
| stage reached (bot) | thieves/tail fail | thieves/tail fail (beta run reached Drift Home earlier) |
The bot fails Tail/Thieves both before and after (bot pinned on quay walls; stuck check fixed to position-based). Mission not completed by the bot in any run.

## Other bugs seen (not fixed)
- Drift Home 420 pts/24 s: bot got 0 (bot drift input is weak; unverified for humans).
- Hilde's truck hidden behind the radio bubble at the follow start (852×393).
- Goons > 600 m away are relocated 230 m behind the player (off-screen, left as is).

## Status
- Review set running: qa23/review (tPlay phone both cities, t4/nbside side + gap, t4/fx19gap traffic gap).
- Next: rebuild v88a with the label fix, mid-drive shots (tM1 mid_*), REVIEW to session_01Y6FYerWwxv43FuKUcaUT4v, then changelog + out/v88a (+music, tune.json) + DEPLOY.
