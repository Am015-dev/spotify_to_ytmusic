# TRACK_FUN: what makes a race track fun (track-1, 2026-10-13)

Alex: "make the tracks with a track builder so they are not so boring". He scored our races 2/10 (boring, narrow, slow).
Each rule below is a **lint rule** the in-game TRACK BUILDER checks live (`TB_lint` in `src/98tb_track_builder.js`).
Numbers are ours, tuned to our race engine (open course: 96 m drivable, asphalt in the middle; top speed ~62 m/s ≈ 225 km/h).
UNVERIFIED = no source confirmed it; it is our judgement from the reference frames and our own measurements.

## Sources and what they say
- **Our 2K Drive storyboard** (`docs/race_ref/*.jpg`, 2K Drive YouTube race): the road is 4–6 car widths wide, the pack fights side by side,
  the surface changes every 20–30 s (asphalt → cobbles → dirt → water), checkpoint gates and chevron boards mark every corner, a jump
  every lap, boost trails everywhere, a landmark always on screen. Race 2:46 (one speedrun split; `docs/RACE2K_PLAN.md` S12).
- **docs/RACE2K_PLAN.md**: 2K races are 2–3 min; shortcuts are frequent and mostly work because of the auto-transform (water, off-road);
  the AI uses them too. Item pickups glow and respawn.
- **docs/HANDOFF_race17.md / RACE_PLAN.md** (our measurements): 18 m tracks gave 1.2–2.7 wall hits/min and "narrow"; 38 m and the
  96 m open courses removed wall hits. Live laps were 95–147 s with ONE lap per race → no rhythm to learn.
- **Mario Kart** (StrategyWiki Mario Circuit / Luigi Circuit; NintendoWorldReport forum): walls stop corner cutting; the one real
  shortcut is a gravel cut that needs a mushroom → **a shortcut must cost something** (an item, rough ground, risk). Players praise
  shortcuts that "helped a lot if you pulled them off but really hurt if you screwed up". Forum opinion, not developer data.
- **Trackmania** (official blog "send your royal maps in review"; trackmania.exchange Fullspeed theme; builder posts): build in short
  segments and test each one; keep the flow (no speed checks that kill momentum); grade difficulty; avoid copy-paste repetition.
- **Game Developer, "A Rational Approach to Racing Game Track Design" (McMillan 2011)**: corner difficulty = race line + clipping points;
  the wider the road the straighter the race line (so wide tracks need tighter or more varied corners to stay interesting).
- **MTM2 "sightlines" tutorial**: the player must see where the course goes; terrain and props should lead the eye, not suggest a
  false straight. → signs/chevrons at every corner tighter than "fast", gates at checkpoints.

## The rules (lint IDs as shown in the builder)
| ID | rule | pass when | why |
|---|---|---|---|
| L1 | **Lap time** | 35–75 s estimated | short laps you learn by lap 2; 2K/MK laps are ~40–60 s (UNVERIFIED for 2K) |
| L2 | **Race time** | 120–180 s (laps × lap + 6 s start) | 2K races are 2–3 min (RACE2K_PLAN S12) |
| L3 | **Width** | drivable width ≥ 30 m (open course 96 m) | 18 m was "narrow" (Alex); pack racing needs 4+ car widths |
| L4 | **No long straight** | no stretch with radius > 400 m longer than 12 s | flow needs a decision every few seconds (Trackmania, our "boring") |
| L5 | **Corner mix** | ≥ 2 fast (R 180–450 m), ≥ 2 medium (R 90–180 m), ≥ 1 tight (R 55–90 m) | rhythm = varied corners (McMillan) |
| L6 | **Left and right** | each direction ≥ 30 % of the corners | an all-one-way loop is an oval |
| L7 | **Drivable radius** | tightest corner R ≥ 55 m | the 96 m ribbon folds inside a tighter corner; hairpins kill flow |
| L8 | **No overlap** | the course never comes within 110 m of a non-adjacent part of itself | two 96 m ribbons must not cross (no bridges in open courses) |
| L9 | **Jumps** | 1–3 per lap, each on a near-straight (R > 250 m within ±60 m), ≥ 300 m apart | 2K jumps every lap; a jump in a corner throws you off |
| L10 | **Shortcut with a trade-off** | ≥ 1 water or off-road route, on a bend (it must be shorter on the inside) | MK: a shortcut must cost something; 2K: shortcuts use the transform |
| L11 | **Boost pads** | 2–6 per lap (jumps also get one automatically) | juice without clutter (lesson 5: less is more) |
| L12 | **Item rows** | 2–5 rows per lap, ≥ 400 m apart | a decision per item row, not a carpet of boxes |
| L13 | **Elevation** | ≥ 15 m climb per lap, max grade ≤ 10 % | hills give sight lines and crests; flat = boring (2K frames) |
| L14 | **Checkpoints and landmarks** | ≥ 3 checkpoint gates, ≤ 25 s between gates | landmarks you name, gates you aim for (sight lines) |
| L15 | **Surface mix** | ≥ 2 surface kinds (asphalt edge, grass, dirt, sand, cobbles, water route) | 2K changes surface every ~20–30 s and transforms the car |

## Estimated lap time (L1, L2, L4, L14)
Speed profile along the spline sampled every 2 m: top speed 62 m/s on asphalt-grip sectors (×0.9 on grass/dirt/sand sectors),
corner speed √(13 · R) m/s, accelerate 7 m/s², brake 16 m/s² (forward and backward passes). Calibrated once against a real
test drive (see docs/HANDOFF_track.md for the measured factor). It is an estimate for design, not a promise.

## What the lint cannot check (judge by playing)
Fun. Whether a shortcut feels worth it, whether a jump lands well, whether the landmarks read. Test-drive every track.
