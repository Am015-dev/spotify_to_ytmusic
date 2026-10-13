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
| L8 | **No overlap (flyover ok)** | the course never comes within 110 m of a non-adjacent part of itself, EXCEPT a crossing ≥ 12 m above/below whose close run is ≤ 260 m (a FLYOVER: abutments + deck, no hills there) | two ribbons at the same height would merge; a figure eight over itself is a 2K / Trackmania staple (track-2) |
| L9 | **Jumps** | 1–4 per lap (jump, big ramp, gap jumps), each on a near-straight (R > 250 m within ±60 m), ≥ 300 m apart, flight path (0–160 m) ≥ 120 m from other parts of the course | a jump in a corner throws you off; a jump under a flyover hits the deck (track-2 found one) |
| L10 | **Shortcut with a trade-off** | ≥ 1 water, off-road or stunt route, on a bend (it must be shorter on the inside), 200–800 m | MK: a shortcut must cost something; 2K: shortcuts use the transform |
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

## track-2 (2026-10-13): stunts and alternative roads
Alex: "make tracks, but make sure they are fun as the ones in youtube meaning high stunts, alternative roads, fun is important".

### What the reference frames show (watch-and-describe, `docs/race_ref/*.jpg`)
- `08_jump_air.jpg`, `hd_jump_wrongway_lap3.jpg`: the car is airborne **high above the course** (a full car-height or more over the next road, the
  checkpoint arch and a castle tower below) after a ramp at a crest; the landing is on a **lower** road (a drop), so the flight is long. The HUD stays the
  same; the camera pulls up and back a little. UNVERIFIED: exact air time (frames are stills); we estimate 2–3 s from the speed and drop.
- `storyboard_0/1/2`: boost trails, wide roads, gates; ramps every lap; a water section where the boat shape takes over; the pack spreads over 2 lines.
- Elevation: the course climbs and dives (hill crests, a cliff road above water); landmarks (towers, castle, arches) are on screen most of the time.

### Web check (sources; community, not developer data)
- 2K Drive: "track designs offer elevated shortcuts and aerial power-ups"; "cars can jump much higher than you'd normally get in kart racers";
  shortcuts open through the auto-switch onto water / off-road; "jumping just before the end of a ramp gives a speed boost" (TechRadar review,
  racinggames.gg beginner guide, si.com preview).
- Mario Kart 8: ramps and off-road cuts are the risky lines; a ramp to an upper platform gives an inside line and an extra jump boost but is
  stat-dependent; safer routes stay slower (zoe-pilgrim MK8 case study devlog, Prima guide, myunidays shortcut list).
- Trackmania (trackmania.exchange accessibility checklist, community rules doc): jumps must be visible ahead and obvious where to go; smooth
  landings (no hard, unsmooth landings); downtime between action sequences; a risky line needs a safe alternative; "think in 3D" (ramps, walls).
- UNVERIFIED for 2K: lap length, exact jump heights, split timing balance. Loops / corkscrews / wall rides: 2K has big ramps, half-pipes on some
  tracks (UNVERIFIED), no full loops in the frames we have; our race engine is a spline with a lateral offset (no roll past ~20°), so a loop or wall
  ride would need a new physics mode → SKIPPED (note: a banked turn up to 19° is the safe version of a wall ride).

### New pieces (builder palette) and how they fly (src/98ts_track_stunts.js)
| piece | what | numbers (TB_ST) |
|---|---|---|
| BIG RAMP | the course itself rises y = h·u² over L metres, steep back face, launch at the lip vy = v·2h/L + 1, floaty gravity | h 5.2 m, L 38 m, g 14 → 2–3 s air at 200 km/h, no fail |
| WATER GAP / ROAD GAP | kicker + a 64 m gap over water (splash) or a road with traffic, 9 m down | h 4.2 m, L 32 m, g 15; needs ≈ 160 km/h, else into the gap → respawn (AI always clears) |
| BANK | the corner around it banks to 19° and grips +45 % (C26 lateral mu) | take it flat out |
| STUNT SC | a split: an asphalt lane behind the island with a lane kicker (wedge 22 m wide) | lane top speed auto-balanced (see L17) |
| LANDMARK | Messeturm, Kaiserdom, Römer, Eiserner Steg (an arch you drive under), Mainhattan skyline · Akropolis, Syntagma, Lykavittos, Plaka, Piraeus | sight range 600–2400 m |
| FLYOVER | automatic where the course crosses itself ≥ 12 m apart | abutment skirts, deck underside, no hills |
Juice: the chase cam lifts ≤ 2.2 m and backs off ≤ 2.4 m in the air; a 0.22 s slow-mo at the apex; dust ring + shake + "STUNT 2.6 s" award and a short boost on landing.

### New lint rules
| ID | rule | pass when | why |
|---|---|---|---|
| L16 | **Big stunts** | ≥ 2 ramps / gap jumps per lap with ≥ 1.5 s estimated air (and the gap cleared at the estimated speed) | "high stunts" (Alex); 2K jumps are long and high |
| L17 | **Route splits** | ≥ 2 splits per lap of ≥ 2 kinds (boat / dirt / stunt), each on a bend, 200–800 m; the alt lane's top speed = base × length ratio ρ × measured factor, so every route is within ±5 % (checked in tRace, road vs alt) | "alternative roads" (Alex); MK / Trackmania: a risky line next to a safe one |
| L18 | **Landmark on screen** | a landmark inside ±38° of the heading (±63° when < 200 m) and within its sight range ≥ 50 % of the lap time | 2K: a landmark is always on screen; you name the place you race in |
| L19 | **Elevation range** | highest − lowest point ≥ 15 m | climbs and drops (the reference jump is off a crest onto a lower road) |
