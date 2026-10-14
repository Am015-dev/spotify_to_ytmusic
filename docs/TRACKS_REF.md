# LEGO 2K Drive race tracks: reference traits (research 2026-10-14)

Scope: race tracks only (not the vehicle builder). Numbers marked "est." are my estimates from looking at
the screenshots listed; anything not seen in a source is marked UNVERIFIED. Car width ≈ 2 m in our game scale.

## (a) Sources
- S1 Steam store, app 1451810 (description + 5 screenshots): https://store.steampowered.com/app/1451810
  (API used: https://store.steampowered.com/api/appdetails?appids=1451810)
- S2 Brickipedia wikitext, "Courses" section (fandom page 402s; MediaWiki API works):
  https://brickipedia.fandom.com/api.php?action=parse&page=LEGO_2K_Drive&prop=wikitext&format=json
- S3 Destructoid review: https://www.destructoid.com/reviews/lego-2k-drive-review-destructoid-lego-racer/
- S4 Jump Dash Roll review: https://www.jumpdashroll.com/article/lego-2k-drive-review
- S5 Game Informer review: https://gameinformer.com/review/lego-2k-drive/stud-your-engines
- S6 racinggames.gg biome guide: https://racinggames.gg/misc/lego-2k-drive-map-every-biome-in-bricklandia/
- S7 TechRadar review (via search snippet; page body truncated): https://techradar.com/reviews/lego-2k-drive-review-one-of-the-best-racers-ever-built
- YouTube frames (img.youtube.com maxresdefault / maxres1-3 = auto frames at ~25/50/75 %):
  - Y1 "ALL TRACKS Gameplay" W8OMD3i3nsA  https://www.youtube.com/watch?v=W8OMD3i3nsA
  - Y2 "Vessel Run (Race)" 0Njewiva3Tw  https://www.youtube.com/watch?v=0Njewiva3Tw
  - Y3 "Shortcut Cowboy Gold" (Rapid Falls) 8mdAFDuHm0Y  https://www.youtube.com/watch?v=8mdAFDuHm0Y
  - Y4 "Shortcut Ace Gold, Big Butte" CBsqWB7mSx8  https://www.youtube.com/watch?v=CBsqWB7mSx8
  - Y5 "Swampus Race" dyu28N1IExw; Y6 "Chasm Crossing" mvPC7BDngHg; Y7 "Dust Devil Run" ZJnecQMJDb4;
    Y8 "Sky Cup" M5P0d2nVSZI (https://www.youtube.com/watch?v=<id>)
- YouTube watch pages/storyboards were blocked (Google "sorry" captcha), so no video descriptions or storyboards.

### Downloaded reference images (docs/shots/trk4/, not resized)
| file | source URL | shows |
|---|---|---|
| ref_1.jpg | https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1451810/ss_3600efe16881770c902912d82cdd000fc01e4cde.1920x1080.jpg | Turbo Acres overview: circuit with red/white kerbs, open grass both sides, kicker ramp, bridge, water channel with boats racing |
| ref_2.jpg | https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1451810/ss_9dde75dfa95a84e8d598f47c18bdb2e01ec2c41b.1920x1080.jpg | split-screen race: wide asphalt, low guardrail outside, glowing yellow chevron boards, item boxes, boost flames |
| ref_3.jpg | https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1451810/ss_617697f67ebc566157a94850a58febdf78b6040c.1920x1080.jpg | Big Butte: asphalt road + parallel dirt road, open grass/trees, cliffs, brick clouds |
| ref_4.jpg | https://img.youtube.com/vi/0Njewiva3Tw/maxres3.jpg | Vessel Run race, lap 2/2: boat on river between cliffs, foam-noodle arches as gates |
| ref_5.jpg | https://img.youtube.com/vi/8mdAFDuHm0Y/maxresdefault.jpg | Rapid Falls shortcut run: off-roader on open grass beside the asphalt, waterfall |
| ref_6.jpg | https://img.youtube.com/vi/CBsqWB7mSx8/maxres3.jpg | "Runway Roundabout shortcuts": wide road, yellow centre line, guardrail, chevrons |

## (b) Traits observed
Track list and biomes (S2): 4 race biomes + 1 DLC area, 7 courses each + a Grand Brix arena:
- Turbo Acres (S1/S6; wiki spells "Turbo Aces"): Racing 101, Sky Cup Grand Prix. Grassland, pavement (S1: "lush fields on Turbo Acres' pavement").
- Big Butte (desert/canyon, S6): Butte Loops, Drive-Thru Derby, Dust Devil Run, Glaze Overdrive, Infin8 Loop, Runaway Roundabout, The Abduction 500, Big Butte Grand Prix Arena.
- Prospecto Valley (lakes, beaches, rolling hills, S6): Cat Scratch Highway, Clover Mines, Down on the Farm, Gold Rush, Rapid Falls, Switchback & Forth, Vessel Run, Grand Brix Arena.
- Hauntsborough (always night, "most challenging tracks ... littered with obstacles", S6): Chasm Crossing, Flytrap, Headless Horsepower, High Stakes, Immortal Coil, Spidersprout Swallows, Swampus, Grand Brix Arena.
- Stargaze Summit (DLC): Astroid Valley, Icy Straights, Njord Fjord, Orbital Speedtrack, Snowswitch Mountain, Winddrift Slopes, Zero-Gravity Gauntlet.
- Count at launch: 26 (S3) vs 24 (S4). Mostly lap races, "a few point-to-point runs" (S4).
- Laps seen in HUD: Vessel Run 2 (Y2), Swampus 3 (Y5), Chasm Crossing 3 (Y6), Sky Cup 4 (Y1/Y8). Grid = 8 racers (Y1, Y2, Y5, Y6 standings).

Road width: est. 4-6 car widths (≈ 8-14 m at car width 2 m; real game scale UNVERIFIED) on circuit asphalt
(ref_1, ref_2, ref_6); town roads 4+ lanes (Y4 frame maxres1, open-world event). Rivers in water sections are
est. 8-15 car widths wide (ref_4, Y3 maxres1).

Verges / openness: grass or dirt drivable right up to the asphalt edge, no walls, on most visible
sections (ref_1, ref_3, ref_5). Est. ≥ 50 % of visible lap length in ref_1 has open verge on at least one side.
BUT "brutal slow down when you veer off track" in must-win races (S5) → off-road is drivable but slower
unless the car transforms. Weeds slow you down (S3).

Shortcuts / alternate routes: confirmed as a core feature. Events "Race through the shortcuts of Rapid Falls"
(Y3) and "Race through the Runway Roundabout shortcuts" (ref_6/Y4 HUD text). AI uses "shortcuts you may not
have had a chance to discover yet" (S3). Per-lap count: UNVERIFIED; est. 1-3 per track (Y3/Y4 events are
built around them). Parallel dirt road beside asphalt in ref_3.

Jumps / ramps: Sky Cup loading hint "Risky jumps are the key to victory!" (Y8). Kicker ramp visible on the
Turbo Acres circuit (ref_1, left-centre). Biome events include "jumping over houses" (S5). Boats ramp off rocks
for height and boost (S7 snippet, Swampus). Jumps per lap and air time: UNVERIFIED (est. 1-3 jumps, ~1-2 s air).

Boost: drifting/boosting are core (S1 "Master the art of drifting, boosting, jumping"); boost meter bar at the
bottom-centre of every race HUD (Y1-Y6). Boost flames in ref_2, ref_6. Floor boost pads: UNVERIFIED (not seen).

Terrain transformation road→off-road→water: automatic on surface change, street racer / off-roader / boat
(S3, S4, S7 snippet, S5). Seen in one race: Vessel Run is mostly water with boat (ref_4); Swampus = boat in swamp
(Y5); Rapid Falls = grass + river (Y3, ref_5); ref_1 has a water channel inside the circuit.

Breakables: "Tracks are littered with power-ups and obstacles"; obstacles largely destructible into bricks (S4).
"Tires and water noodles ... act as charming obstacles" (S5). Item boxes on track in ref_2 (row of 4 glowing
discs) and Y5 (row of 4). Density: UNVERIFIED; est. a cluster every few hundred metres.

Hazards: twisters (Dust Devil Run hint, Y7), little alligators you bounce off (Swampus hint, Y5), giant spider
webs / car-sized spiders (Y6 frame, S6, S3), "Don't fall off the road, it's a long way down!" (Chasm Crossing, Y6).

Open biome vs walled corridor: mix. Open circuits through open landscape (ref_1, ref_3, ref_5); canyon/cliff
corridors in Vessel Run river (ref_4, Y2) and Big Butte canyons (S6 "twisty canyon trails").

Barriers / railings: low metal guardrail on the outside of fast bends (ref_2, ref_6, Y1 maxres3 start straight);
red/white kerbs on Turbo Acres circuit (ref_1); glowing chevron boards mark corners (ref_2, ref_6, Y2). Chasm
Crossing hint implies NO rail on its high section (Y6). Bridge in ref_1 has only a low edge. Full walls: not seen.

Controls (game, console): gas, brake/handbrake drift (S4 "brake pedal is used mainly for drifting"; S3 "90-degree
turns" via handbrake), boost, jump (S1), items. Touch layout: n/a (console/PC game).

## (c) Targets for our builder (mapped to tests)
1. Drivable width ≥ 24 m on ≥ 90 % of lap: 2K asphalt is est. 4-6 car widths plus a drivable verge, so 24 m
   = road + open verge combined is consistent with ref_1/ref_3. Keep asphalt ~12-16 m, verge the rest.
2. ≥ 2 route choices per lap: matches "shortcuts" events (Y3, ref_6) and AI shortcut use (S3); one should be
   an off-road or water cut (ref_3 parallel dirt road, ref_5).
3. ≥ 30 % of lap with open drivable space beside the road: ref_1/ref_3/ref_5 show it is the norm; make off-road
   slower than asphalt (S5), not blocked.
4. ≥ 3 jumps ≥ 1 s air: kickers exist (ref_1, Y8 hint); exact count/air UNVERIFIED, our target is a design choice.
5. AI completes a lap, never stuck > 2 s: S3 says AI is competitive and takes shortcuts; use rubber-banding
   lightly (S3/S4 complain about it).
6. Race touch buttons gas/brake/steer/boost/pause: game uses gas, brake-as-drift, boost, jump; boost meter
   bar bottom-centre (Y1-Y6). Race HUD in 2K: position big top-left, lap x/y + timer top-right, standings
   list left, minimap bottom-left, boost bar bottom-centre (Y1, Y2, Y5, Y6).
7. Railings only on fast outer bends (low guardrail) and as chevron boards; no walls on open sections.
8. Grid of 8, 2-4 laps per race, mix road / off-road / water within one lap.
