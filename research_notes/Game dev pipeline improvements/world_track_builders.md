# World and track builders for a LEGO-2K-Drive-style three.js racer

Scope: how shipped racing and open-world games build worlds and tracks, how their in-game builders work, which level-design principles keep tracks fun, and concrete specs for the Mainhattan Overdrive piece builder (8 m grid, 2 m height steps).
Marking: **[UNVERIFIED]** means from memory or community lore with no source found in this pass. "Inference" means my reasoning from cited facts.

## Q1. Trackmania (2020) and TM Nations editor: grid, heights, catalogue, free/mixed mapping, UGC, author-time validation

### Takeaway
Trackmania uses a coarse block grid (TM2020: 32 × 32 × 8 units). Free/ghost placement modes let advanced players escape that grid. Every track must be driven to the finish by its author before it can be published, which sets the "author time" that the medals are derived from. Validation by driving and daily curation (Track of the Day) are the core of its UGC loop.

### Cited Findings
- The TM2020 editor grid is **32 × 32 × 8**. A community plugin nudges free-placed blocks "in multiples of the grid size (32x32x8)" ([Advanced Free Block Mode README](https://github.com/schl3ck/OPPlugin-advanced-free-block-mode); [Openplanet listing](https://openplanet.dev/plugin/advancedfreeblockmode)). The source does not confirm that the units are metres; the community commonly treats them as metres **[UNVERIFIED units]**.
- In older TM games, the base block size differed per environment. Island blocks were "almost twice as big" as Coast blocks, while Desert, Rally and Snow blocks shared one size ([Nadeo wiki: Environments](https://nadeo.fandom.com/wiki/Environments)).
- In TM Nations, the middle mouse button raised and lowered the height of the dirt/terrain base unit ([KatsBits community](https://www.katsbits.com/community/index.php/topic,133.0.html)). This means terrain height was also quantised in steps.
- Placement modes: TM2020 has a "free block mode" (off-grid placement), and the editor offers a "ghost" preview/placement mode ([Openplanet plugin](https://openplanet.dev/plugin/advancedfreeblockmode); [devtrackers user report on ghost mode](https://devtrackers.gg/trackmania/p/6945e5f6-map-editor-freeze-upon-placement-of-a-platform-block)). No primary source was found that defines "mixed mapping". The community meaning is combining normal, ghost (overlapping blocks allowed) and free (off-grid, any rotation) placement **[UNVERIFIED definition]**.
- The full map editor is included in the free Starter Access tier of TM2020 ([Wikipedia: Trackmania 2020](https://en.wikipedia.org/wiki/Trackmania_(2020_video_game))).
- Medals: each map has four fixed times: Author, Gold, Silver and Bronze. The Author medal (green) is for beating the author's own validation time ([vjeux blog](https://blog.vjeux.com/?p=553); [GGRecon](https://ggrecon.com/guides/trackmania-author-medals)). Author times are hidden in-game without plugins ([GGRecon](https://ggrecon.com/guides/trackmania-author-medals)).
- Example Track of the Day: Author 58.055 s, Gold 62.000, Silver 70.000, Bronze 88.000 ([devtrackers TOTD 20-05-2023](https://devtrackers.gg/trackmania/p/92351a6c-totd-20-05-2023-seasonal-sprint-by-evo-xlrb-discussion)).
- Track of the Day is a daily showcase of community maps curated by Ubisoft Nadeo and released at 19:00 CE(S)T. A Cup of the Day is run on it three times a day. Authors are told the route should be **fully respawnable from every checkpoint** and **approachable for less experienced players** ([doc.trackmania.com: What is TOTD](https://doc.trackmania.com/play/what-is-totd/)).
- Trackmania Exchange (TMX) runs Knockouts that need a steady supply of new maps, and submitted maps are reviewed ([TMX](https://trackmania.exchange/s/ft/13)). One player complains that map review lets through only "boring" maps, which is an anecdote ([ReedyBear blog](https://reedybear.bearblog.dev/trackmania-feedback-boring-maps/)).

### Inferences
- In the TOTD example, Gold ≈ Author × 1.07, Silver ≈ × 1.2 and Bronze ≈ × 1.5, rounded up to whole seconds. This matches the widely repeated default rule (Gold +6 %, Silver +20 %, Bronze +50 %) **[UNVERIFIED as official rule]**. It is a cheap, proven way to give any user track three difficulty targets automatically.
- The height step is ¼ of the horizontal grid (8 / 32). Our builder's 2 m / 8 m is the same 1:4 ratio, so ramps of one step per tile give a 14° slope (atan(2/8)). That is a sensible default ramp.
- The UGC scene thrives because of four things:
  - a free editor;
  - mandatory proof that the track is finishable (author validation);
  - automatic medals that create replay goals on every track;
  - a daily curated spotlight plus a competitive cup that gives creators an audience.

### Gaps
- Official Nadeo documentation of the block size in metres, the exact height step in metres, and the full block catalogue (road, dirt, platform, water, deco, etc.) could not be fetched (trackmania.wiki returned 403).
- No statistic was found for the number of uploaded maps or for TMX size.
- No primary definition of "mixed mapping" was found.

## Q2. Other builders: Hot Wheels Unleashed 1/2, Mario Kart 8, LEGO 2K Drive, Forza Horizon EventLab, Fortnite UEFN, ModNation Racers, Roblox

### Takeaway
The most-used builders all do three things:
- They constrain building to snapping pieces or a spline, so tracks always connect.
- They put the track inside a pre-made, interesting environment with "hooks" to build around.
- They require one drive-through validation lap before publishing.

ModNation's "drive to draw the road, then sculpt terrain and add breadcrumb shortcuts" is the closest existing model to "full drivable terrain with a course on it".

### Cited Findings
**Hot Wheels Unleashed 1/2 (Milestone)**
- Tracks are built from orange "modules". Special modules include fire rings and cannons; animated ones include giant spiders, snakes and gorillas. Every module must work for every vehicle type and fit narrow environment spaces ([Game Developer: HWU2 Track Builder](https://www.gamedeveloper.com/design/a-closer-look-at-hot-wheels-unleashed-2---turbocharged-track-builder)).
- Building steps ([same source](https://www.gamedeveloper.com/design/a-closer-look-at-hot-wheels-unleashed-2---turbocharged-track-builder)):
  1. Pick an environment.
  2. Place the start and choose a circuit or a point-to-point course.
  3. Build the track in Construction mode, setting straight length, curve orientation and banking, and ramp angle per module.
  4. Place the finish. Auto-closure can join a circuit.
  5. Validate.
- Build modes are Construction, Modify (with auto-closure to reconnect the track), an always-available Interactive Object placement (boost stickers that use no fuel, breakable barriers), and colour/side-wall customisation ([same](https://www.gamedeveloper.com/design/a-closer-look-at-hot-wheels-unleashed-2---turbocharged-track-builder)).
- Test mode is available from the pause menu at any time. Validation requires a full lap through all checkpoints with the "Tractor", a large vehicle chosen to catch unjumpable ramps and tunnels that are too narrow ([same](https://www.gamedeveloper.com/design/a-closer-look-at-hot-wheels-unleashed-2---turbocharged-track-builder)).
- Environments were designed first and tracks were built into them. Arcade emphasises verticality, while Backyard is flat. "Gameplay hooks" (cabinets, treehouse planks) invite building, and invisible "ghost" modules attach to them. Asset spacing is measured so vehicles can pass. The design goal is "easy to understand yet deep enough to express their creativity" (lead designer Francesco Riggi). Players made more than 500,000 tracks in HWU1 ([same](https://www.gamedeveloper.com/design/a-closer-look-at-hot-wheels-unleashed-2---turbocharged-track-builder)).
- Budget: a pre-release estimate was about 30 pieces ([GTPlanet 2021](https://www.gtplanet.net/hot-wheels-unleashed-track-builder-20210709/)). A mod page says the per-area limit is 1,400–2,000 and raises it to 9,999; units are unclear, probably a cost budget ([Nexus Mods](https://www.nexusmods.com/hotwheelsunleashed/mods/5)). Treat both as unofficial.

**ModNation Racers (United Front Games, 2010)**
- Players "drive out" the track, then use Quick Edit for width, lift and bank. Advanced Edit sets the position, elevation and slope of path points, with 4 points across each section for road, fence and run-off on each side, plus a smoothing button ([PlayStation Blog, Mark Riddell](https://blog.playstation.com/2009/12/23/modnation-racers-track-studio-walkthrough-with-track-designer-mark-riddell/)).
- Props snap to the ground by default and can be "unpinned" for height. The tool can flatten terrain under a building, "spray" fences over hills, and lasso-select props. Auto Populate dresses the track for casual users ([same](https://blog.playstation.com/2009/12/23/modnation-racers-track-studio-walkthrough-with-track-designer-mark-riddell/)).
- The "Erase Surface" road style lets the road fade into driving on bare terrain (rally). Advanced Sculpt brushes are available. Surface and Ground Cover brushes paint visible paths "so players don't get lost". Breadcrumbs leaving and rejoining the road become raceable shortcuts, and AI and weapons still work on them ([same](https://blog.playstation.com/2009/12/23/modnation-racers-track-studio-walkthrough-with-track-designer-mark-riddell/)).
- PSP version: sinking terrain makes water, and paths are painted ([PS Blog PSP polish](https://blog.playstation.com/2010/04/16/modnation-racers-psp-final-polish-and-detailing-in-track-studio/)). Vita "Road Trip": terrain is sculpted with the front/rear touch panels, lowering it for lakes and rivers and raising it for mountains. This is a direct touch precedent ([PS Blog Road Trip](https://blog.playstation.com/?p=64672)).
- At GDC 2010, editing road alignment, textures and props such as ramps was described as smooth ([Shacknews](https://shacknews.com/article/62760/modnation-racers-hands-on-from)). No GDC postmortem was found.

**Mario Kart 8 (Nintendo EPD, Yabuki/Konno)**
- Anti-gravity came out of a scrapped "drill underground" idea. It let courses use the whole 3D space instead of 2D layouts. Physics, speed, camera and items all had to be rebalanced ([Nintendo Everything](https://nintendoeverything.com/konno-and-yabuki-on-how-f-zero-led-to-mario-kart-struggling-with-anti-gravity-in-mk8-sunshine-airport-came-from-previous-entrys-development); [MyNintendoNews](https://mynintendonews.com/2013/06/18/previously-scrapped-ideas-for-mario-kart-8-led-to-anti-gravity-mechanic/)).
- Konno: course splits let players "continue driving on the ground, or maybe go into the antigravity area to avoid an enemy or pick up an extra block", which changes strategy. Bumping other racers in anti-gravity gives a boost, so light characters can use those sections ([GoNintendo](https://gonintendo.com/stories/217968-mario-kart-8-the-antigravity-idea-blue-shell-returns-not-addi)).
- Mario Circuit is laid out as a Möbius strip ([Super Mario Wiki](https://www.mariowiki.com/Mario_Circuit_(MK8))).
- Glide ramps, Lakitu fishing the player back onto the course in about 1–2 s, and boost-pad shortcuts that need a mushroom are genre conventions **[UNVERIFIED specifics]**.

**LEGO 2K Drive (Visual Concepts, 2023)**
- Vehicles change form automatically by surface: a street car on road, an off-roader off the road, and a boat on water ([racinggames.gg](https://racinggames.gg/article/lego-2k-drive-release-date-trailer-ps5-and-everything-you-need-to-know); [Insider Gaming](https://insider-gaming.com/lego-2k-drive-trailer-shows-off-vehicle-morphing-and-a-chaotic-open-world/)).
- The world is a set of standalone "Biomes" joined by fast travel, not one seamless map, because of load times on some platforms. Named biomes include Turbo Acres (pavement), Big Butte County (desert) and Prospecto Valley (waterways) ([Press Start feature](https://press-start.com.au/features/2023/04/25/how-lego-2k-drives-open-world-driving-puts-fun-at-the-forefront/); [Insider Gaming](https://insider-gaming.com/lego-2k-drive-trailer-shows-off-vehicle-morphing-and-a-chaotic-open-world/)).
- Pillars: transformation, destruction and the driving model. Instant road/off-road/water transitions meant the team "really needed to plan for where surfaces were placed". Destroyed LEGO objects give back health and boost (Design Director David Msika, Lead World Designer Jon Dunsmoor) ([Press Start](https://press-start.com.au/features/2023/04/25/how-lego-2k-drives-open-world-driving-puts-fun-at-the-forefront/)).
- "Every corner has something for you to discover" (Msika). "Our races live in the world… outside of that content, it's still got to be fun" (Dunsmoor). Players can reach mountain tops and drive through canyons and rivers (art director Emmanuel Valdez). Development took 4–5 years ([Press Start](https://press-start.com.au/features/2023/04/25/how-lego-2k-drives-open-world-driving-puts-fun-at-the-forefront/); [GamesBeat](https://gamesbeat.com/how-visual-concepts-tackled-lego-2k-drive-interview/); [Brick Fanatics](https://www.brickfanatics.com/five-years-spent-developing-lego-2k-drive)).

**Forza Horizon 5 EventLab (Playground Games)**
- A race must start at an existing race activation point. From there the creator drives anywhere and drops checkpoints, making a circuit or a point-to-point race. Hundreds of props are available, some breakable ([GTPlanet](https://www.gtplanet.net/forza-horizon-5-event-lab-20211110/)).
- EventLab 2.0 (12 Sep 2023) added:
  - multi-select with move, rotate and duplicate;
  - user prefabs ("mega props") shareable with the community;
  - snapping for fences and walls;
  - primitive shapes (cubes, wedges, cylinders) with surface types snow, ice, grass, tarmac and dirt;
  - favourites;
  - time and weather settings;
  - posters from the photo camera.

  EventLab Island is a blank 2 km² canvas with the highest prop budget ([Xbox Wire](https://news.xbox.com/en-us/2023/09/12/forza-horizon-5-event-lab-2/); [GTPlanet](https://www.gtplanet.net/?p=112574)).

**Fortnite UEFN Rocket Racing (Epic)**
- The Track device is a spline with editable points and tangents and a Style Editor. Colour coding marks the track type: green Primary, blue Secondary, white Cosmetic. Epic recommends extending the primary spline from the start line until it closes the loop ([Epic docs: Track devices](https://dev.epicgames.com/documentation/en-us/uefn/using-rocket-racing-track-devices-in-unreal-editor-for-fortnite); [Creating RR islands](https://dev.epicgames.com/documentation/uefn/creating-rocket-racing-islands-in-unreal-editor-for-fortnite)).
- A track needs exactly one start and one finish checkpoint. Validation runs on session launch, upload and publish ([Epic docs: Checkpoints](https://dev.epicgames.com/documentation/fortnite/using-rocket-racing-checkpoint-devices-in-unreal-editor-for-fortnite)).
- Known issue at launch: vehicles clipped through buildings at high speed ([Fortnite news](https://www.fortnite.com/news/build-your-own-rocket-racing-islands-with-uefn)).

**Roblox**
- There is no native road tool; creators asked for one ([DevForum request](https://devforum.roblox.com/t/new-road-creation-tools/84475)).
- Plugins fill the gap. RoadForge is a spline road with banking, width and auto-conform to the ground, plus companion terrain and scatter tools ([Godberry](https://godberrystudios.com/tools/roblox/roadforge/index.md)). Beautiful Roads is node-based ([DevForum](https://devforum.roblox.com/t/beautiful-roads-plugin-beta-0-4/511940)). A terrain-plugin author notes that finishing terrain means bouncing between the terrain editor, painting and a road plugin ([DevForum Terrain Studio v2](https://devforum.roblox.com/t/plugin-terrain-studio-v2-generate-paint-and-finish-terrain/4728181)).

### Inferences
- Two proven paradigms exist:
  - **(a) snap-pieces on a grid** (Trackmania, HWU): always connects, easy on touch, risks a "blocky toy track" feel;
  - **(b) spline/drive-out road over sculptable terrain** (ModNation, UEFN, RoadForge): organic, off-road friendly.

  The owner's complaints (flat, walled ribbon) point to a hybrid: grid pieces for the course plus a heightfield terrain that the pieces sit on and that stays drivable everywhere (ModNation "Erase Surface" + breadcrumbs).
- HWU's environment-first approach and LEGO 2K's "races live in the world" both say the same thing: the builder should place courses INTO the existing Frankfurt/Athens worlds, not onto an empty plane.

### Gaps
- No exact piece counts or official budget numbers for the HWU catalogues.
- No detail on LEGO 2K Drive's internal world tools or its in-game builder, beyond the vehicle builder with more than 1,000 pieces.
- No Mario Kart 8 developer quotes on shortcut or respawn design specifically.

## Q3. Level-design principles for fun racing tracks; studio world-building pipelines; touch builder UX

### Takeaway
The cited sources consistently support four principles:
- risky shortcuts and alternate routes (never free);
- elevation that shapes pacing;
- jumps as split-second decisions;
- respawn from every checkpoint.

Studios build worlds with rule-based procedural placement over hand-authored terrain and landmarks (Guerrilla, Playground with Houdini). I found no GDC talk dedicated to racing-track layout in this pass.

### Cited Findings
- **Shortcuts:** alternate roads should not give a shortcut unless taking it carries risk. The hardest sections belong on side roads and shortcuts, while the main path stays balanced ([SuperTuxKart: Advanced Gameplay Design](https://supertuxkart.net/Making_Tracks:_Advanced_Gameplay_Design)).
- **Elevation:** elevation changes make tracks more fun ([SuperTuxKart](https://supertuxkart.net/Making_Tracks:_Advanced_Gameplay_Design)). Downhills build speed before climbs and shape the pace of each sector ([GTPlanet track designers thread](https://www.gtplanet.net/forum/threads/calling-all-track-designers-show-off-your-work.130128/post-9913711); forum opinion).
- **Jumps:** a ramp creates a split-second decision ([Staffordshire level design doc](https://gradex.staffs.ac.uk/wp-content/uploads/2024/05/4673_Experimental-Level-Design-Doc-Beacon-GP-Turbo-Sliders-Unlimited.docx); student work).
- **Splits as strategy:** see MK8 Konno above ([GoNintendo](https://gonintendo.com/stories/217968-mario-kart-8-the-antigravity-idea-blue-shell-returns-not-addi)).
- **Respawn:** TOTD requires routes "fully respawnable from every checkpoint" ([doc.trackmania.com](https://doc.trackmania.com/play/what-is-totd/)).
- **Readability:** paint surface paths so players don't get lost (ModNation, [PS Blog](https://blog.playstation.com/2009/12/23/modnation-racers-track-studio-walkthrough-with-track-designer-mark-riddell/)).
- **Landmarks first:** Forza Horizon 6's Japan started from landmarks, then biome, then iconic roads (art director Don Arceta) ([traxion.gg](https://traxion.gg/forza-horizon-6-developer-on-recreating-japan-were-always-our-own-worst-critics/); [Top Gear](https://www.topgear.com/car-news/gaming/secrets-behind-a-forza-horizon-world-map-playground-games-spills-all)).
- Original Forza Horizon road variety: fast soft foothill curves, winding passes, switchbacks and dirt tracks across plains ([Game Informer / Gamereactor coverage](https://www.gamereactor.eu/?p=21020)).
- In FH2, drivable area was about 3× FH1, and "everything needs collision data and has to look good up close" (Ralph Fulton) ([Game Informer Afterwords](https://gameinformer.com/b/features/archive/2014/10/31/afterwords-forza-horizon-2)).
- **Procedural + hand-authored:**
  - Playground used Houdini proceduralism to build FH5's Mexican locations ([80.lv](https://cdn.80.lv/articles/using-proceduralism-houdini-to-create-forza-horizon-5-s-locations)).
  - Guerrilla's GDC 2017 talk (Jaap van Muijden) covers GPU run-time procedural placement with a graph editor for artist rules. Goals: art-directable, data-driven, deterministic, locally stable. It handles almost all vegetation, 500+ asset types and more than 100k objects at about 250 µs GPU ([GDC Vault](https://www.gdcvault.com/play/1024120/GPU-Based-Run-Time-Procedural); [Guerrilla slides PDF](https://www.guerrilla-games.com/media/News/Files/GDC2017_VanMuijden_GPUBasedProceduralPlacementInHorizonZeroDawn.pdf)).
- **Builder UX already cited:**
  - snapping (EventLab 2.0 walls and fences; TM grid);
  - multi-select, duplicate and prefabs (EventLab);
  - auto-closure of loops (HWU);
  - test from the pause menu at any time (HWU);
  - smoothing button (ModNation);
  - touch sculpting with front/rear panels (ModNation Vita).
- **Mario Kart 8 track width and kerbs vs walls:** no source found **[UNVERIFIED]**. The common guidance is to use soft-edged run-off (grass or sand that slows the car) instead of walls, so glancing errors cost time but don't stop the car.

### Inferences
- Respawn rule for us: respawn only when (fall below the terrain or water minimum) OR (distance from the course spline > R for > T seconds). Respawn on the last passed checkpoint, facing the course direction. This copies the TOTD "respawnable everywhere" requirement without invisible walls.
- Use rule-based scatter (trees, lamps, LEGO deco) driven by the terrain and piece tags, similar to the Guerrilla and Playground approach but tiny and deterministic (seeded). Hand-place landmarks (Römer, Main Tower, Eiserner Steg, Acropolis, Lycabettus) as anchors.

### Gaps
- I found no GDC talk specifically on racing-track layout. Candidates to check manually on GDC Vault: Criterion/Burnout, Playground, Nintendo, Milestone **[UNVERIFIED existence]**.
- There are no published numeric guidelines (e.g. jump airtime seconds, shortcut time gain) from studios. The numbers below are my proposals.
- No source on touch-specific builder UX, beyond ModNation Vita.

## Recommended specs for the Mainhattan Overdrive builder (inference, built on the findings above)

**Grid and heights**
- 8 m tiles with 2 m height steps. Height is ¼ of the tile, the same ratio as Trackmania's 32 × 8. One step per tile gives a 14° slope (the default ramp); 2 steps per tile gives 26.6° (a "steep" piece, max 2 tiles long).
- Height range 0 to +40 m (20 steps). Water level is −1 m.

**Terrain**
- The heightfield is a separate layer from the pieces and is drivable everywhere (no invisible walls).
- Tools:
  - Raise and Lower brushes in 2 m steps, radius 1–4 tiles;
  - Smooth;
  - Flatten-to-piece, which drops terrain under a road piece, as in ModNation's flatten-under-building;
  - Paint surface: grass, sand, dirt, asphalt, cobble;
  - Water: lowering below −1 m creates water, where the car becomes a boat, as in LEGO 2K Drive.
- Off-road surfaces slow the car about 10–25 % instead of walls.

**Pieces (v1, at most ~16; more only on demand)**
- Straight (1 and 2 tiles);
- Curve 90° in 3 radii (1, 2, 3 tiles);
- S-bend;
- Ramp up and down (1 step per tile);
- Steep ramp;
- Banked curve;
- Kicker jump (launch about 2 m above the deck);
- Gap landing;
- Bridge or elevated deck (pillars auto-generated to the terrain);
- Tunnel-through-terrain;
- Boost pad;
- Checkpoint gate;
- Start/finish;
- Splitter and merger for alternate routes;
- Water entry slope (road→boat);
- Dirt-road variant of straight and curve (rally feel, like ModNation's Erase Surface).

Every piece must work for the car and the boat transition. Validate with the widest car, as HWU did with the "Tractor".

**Placement UX (touch first)**
- Path-extend mode: the next piece auto-attaches to the open end, as in HWU Construction mode. The thumb picks from a bottom carousel; buttons rotate, raise and lower.
- Auto-close loop when the end is near the start, as in HWU.
- At least 50 undo steps.
- Two-finger orbit/pan and pinch zoom; one-finger tap to select.
- Snap ghost preview in green (valid) or red (gaps or slope too steep).
- One-tap Test Drive from the current piece, not only from the start, and one-tap back to the editor at the same camera.

**Validation**
- Publishing requires one clean lap through every checkpoint (Trackmania/HWU/UEFN pattern). That lap sets the author time.
- Medals are computed automatically as Gold = author × 1.06, Silver × 1.2 and Bronze × 1.5, rounded up (Trackmania-style; ratio unverified as official).

**Respawn**
- Respawn only when below the terrain minimum, more than 40 m from the course for more than 3 s, or upside-down for more than 2 s.
- Return to the last checkpoint within 1.5 s; no walls.

**Sharing**
- Tracks are serialised as compact JSON (piece id, x, z, step, rotation; terrain deltas as an RLE height grid) into a URL hash or code string, so no server is needed.
- Optional "track of the day" rotation among a few built-in tracks.

**World integration**
- Courses are placed inside the Frankfurt and Athens maps around landmarks, as with HWU gameplay hooks and LEGO 2K's "races live in the world".
- Scatter deco is procedural and seeded, and kept away from the road setback.

**Fun metrics (tPlay-measurable thresholds; proposals)**
- At least 3 elevation changes of 4 m or more per lap.
- At least 1 jump with 0.6–1.5 s airtime.
- At least 1 split or shortcut that saves 3–8 % of lap time with added risk.
- Lap 45–90 s.
- No straight longer than 6 s at top speed.
- Landmark visible at least 50 % of the time.
- Respawns per lap ≤ 1 for a bot at medium skill.
- Wall or prop hits per minute ≤ 2.
- Time below 30 % top speed ≤ 5 % of the lap.
- Bronze reachable by a cautious tPlay bot.
- The author lap must exist before publishing.
