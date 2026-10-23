# Street stage review, 23 Oct 2026 (W158, live beta.166, branch head e91c5e81)

Player-equivalent score: **14/100** (players' anchor 10-12). The stage now runs, loads, pauses and keeps one song. It still does not play well. The camera pins Kai to the right edge. Foes reach him from behind. Reflexes beat thinking.

## How it was measured (all stepped, no real-time play beyond 25 s)
- `qa/streetsim.js`: 200 seeded runs (4 bots x 50) at x2120 real time, 17 s wall.
- Own stepped probe (FOOT.sim 1/60 + streetlook draw), phone 390x763 and PC 1440x860, two runs each: normal, then low-health floor (to reach the boss). Shots at start, first foe, gunner call, cover block, boss, end, pause; looked at, not committed.
- Every enemy draw call recorded with its effective opacity (ART.drawAnim hook, split by normal / lamp pass / dying).
- Camera: Kai's screen position each step. Steam prop: pixel cover of each sheet frame plus every on-screen draw. Pause and resume through the real buttons and the Escape key, in real time.

## Owner complaints, one by one
| Complaint | Verdict | Evidence |
|---|---|---|
| All enemies are transparent | **FIXED** | Normal draws of live foes: 0 of 1,597 below opacity 1.0. Dying foes: min 0.91. The only low-opacity draws (934) are the additive lamp-light pass on top of the solid sprite. Boss (WARDEN) solid in the shots. |
| Very easy | **PARTLY** | The idle bot dies (50/50, median 21 s). The human-style bot clears 44%. The perfect-reflex bot clears 88% (gate 50-80%: FAIL). The low-health-floor probe still went down at 2:30-2:36. It is hard now, but hard on reflexes. |
| Not strategic | **NOT** | Gunner-first (the intended kill order) clears 52% vs 44% for "shoot the nearest", only +8 points. Cover blocks 0.1 shots per run, ducked shots 0.0-0.5 per run. Reaction speed alone takes 52% to 88%. Kai stands still 45 s of each ~160 s run. The decisions exist on paper ("CALLING HELP", cover chips) but do not pay. |
| Steam prop placed badly and disappears | **NOT** | Placement is still a hash per 400-unit cell (streetlook.js:69-73), unrelated to drains or vents, on the road line. Sheet frames 0 and 4 hold 24% and 29% of frame 2's pixels (11.9k / 14.1k vs 49.4k), so it fades to almost nothing every loop. In two runs only 81/400 and 205/400 sampled steam draws were on screen. It was never visible in 14 shots. |
| Screen moves slow | **NOT** (worse than it sounds) | Walking forward, Kai is in the right 30% of the view 86% (phone) and 97% (PC) of the time. P.x - camX sits at the clamp: 313 of 330 units (phone), 743 of 760 (PC). The wave gate (street3.js:35) holds the camera. Kai is cut off at the right edge in 5 shots, so there is nothing to see ahead. Rushers come in from the left edge behind him. |
| Music not on beat | **NOT** | Enemy fire on the half beat ships behind `?beat` (beta.164), off by default. Nothing else is beat-locked. Not measurable at sim speed (audio clock). |
| One song one stage | **FIXED** | S3.snd.starts = [0] (one start of `street1` at t=0), blocked = []. No stage2 song first. |
| Music distorted by jingles | **FIXED (technically)** | Jingles off everywhere (6e09bd8e); the street refuses stings (0 tried). Mix quality (clipping, ducking) not measured: needs a real-time audio capture (<= 60 s). |
| Stages play without loading assets | **FIXED (local server)** | Veil "LOADING STREET RUN n%" for 4.0 s (phone) / 4.3 s (PC); afterwards 0 pending sheets. Not tested on the real network: on live, the 8 s cap could still start a run with missing art. |
| Music not playing | **PARTLY** | street1 is in the wait list and starts at t=0 (S3.song = street1). Audible playback not verified headless. |
| Some assets not shown | **PARTLY** | All sheets drawn. But code-drawn stand-ins remain on screen: a white 50% box over a hit crate (street2.js:27), black crack strokes on a broken crate, flat pink "+" discs for heals, faint floating "+50". |
| If I pause the game freezes | **FIXED (not reproduced)** | Pause button: game time frozen (3.22 -> 3.22 s over 1.5 s), menu shown. RESUME: +2.02 s game time in 2 s wall. Escape pause/resume the same. Phone layout with touch: same. Not tried on a real phone or with the tab hidden. |

## Scores (start at 11, move only on evidence)
| Category | Score | Why |
|---|---|---|
| Fun | 13 | Fights last longer and the gunner's call is a real idea. But you get hit from behind and cannot see ahead. |
| Strategy | 11 | Kill order +8 points, cover 0.1 blocks per run, ducking about 0: no decision pays. |
| Fairness | 9 | Kai pinned to the right edge, rushers arrive from off-screen behind him. 45% of hearts go to gunner bullets that perfect reflexes dodge but humans don't. |
| Tension curve | 18 | Threat peak at 85-91% of the run (plan 86%), idle bot dies, the boss shows up at ~2:26. The best gate is still off (88%). |
| Looks | 19 | The painted street and the solid sprites look good. Points lost to Kai cut off at the edge, white flash boxes, code-drawn discs and cracks. |
| Sound | 12 | One song, no jingles. Not on the beat. Mix not verified. |
| Clarity | 12 | "CALLING HELP" and the boss bar read well. Red pulsing circles, pink "+" discs and ghost blobs near the feet have no caption. |
| **Headline (player-equivalent)** | **14/100** | |

## The 5 most important fixes, ranked, each with a measurable gate
1. **Camera leads Kai.** Drop or soften the wave gate hold (street3.js:35 / foot.js:244 camK). Gate (stepped, phone and PC): Kai in the right 30% of the view < 10% of steps while moving forward, and his body box 100% on screen.
2. **No hits from off-screen or behind.** Spawn rushers ahead or with a visible 1 s warning at the edge they come from. Gate (streetsim): every melee hit comes from a foe on screen >= 1.2 s before it, and < 20% of hearts are lost to foes behind Kai's facing.
3. **Make the decisions pay.** Cover should stop a gunner volley that would otherwise cost 2 hearts; killing the gunner first should stop the calls. Gate (streetsim): gunner-first clears >= 20 points more than shoot-nearest at the same reaction time, cover blocks >= 3 per strategic run, perfect-reflex bot 50-80%.
4. **Remove code-drawn junk.** No white 50% flash box (street2.js:27), no stroke cracks, heals drawn from a sheet or captioned. Gate: ui-audit counts 0 fillRect/arc over props or pickups per frame, and every new on-screen shape is captioned the first time it shows (rule 8).
5. **Steam and beat.** Put steam on fixed vent/drain spots away from the fight lane and ping-pong or re-cut the sheet so no frame falls below 60% of the fullest. Turn on `?beat` once a <= 60 s real-time audio check shows >= 90% of enemy shots within 60 ms of a half beat. Gate: steam visible >= 1 s whenever its spot is on screen, plus that audio check.
