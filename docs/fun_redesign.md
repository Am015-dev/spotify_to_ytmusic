# Mainhattan Overdrive: fun redesign (story, activities, progression)

The owner's feedback (2026-10-03, verbatim): "the mini games are very small in duration and quite boring, not as the 2K Drive, there is no narrative or continuation or a way for the user to do things ... none of the game are interesting, eg check how 2k drive and other games do it, this is very bad results."
Earlier feedback: quests felt like "transfer a crate 100 m". The owner wants repeatable events with new locations, retry, longer multi-stage quests, clear guidance, and "quests and adventures everywhere like Witcher". Liked: chaos and smashing, chases and combat, stunts and racing, story missions.

What this covers: design only, no code. It is grounded in `overdrive_v75.html`, `rf7/qv2.js` and `review/quests_v2.md`.
Evidence key: [src] is backed by a linked source (listed in §6). [kb] comes from general knowledge of the game and was not confirmed by a source in this session, so treat it as a design target, not a fact.

---

## 1. What the reference games do (patterns that make events fun and long enough)

### 1.1 LEGO 2K Drive
- **The spine is a rookie-to-champion story with a villain.** You rise from rookie to champion against "charismatic rivals" to win the Sky Cup. Clutch Racington (mentor) and his robot S.T.U.D. "point out new quests to complete and races to challenge". Shadow Z is the villain who "doesn't want to share the streets with anyone" [src: lego.2k.com modes; 2K support]. Game Informer: the "constant barrage of dialogue kept me giggling" [src].
- **Four themed regions, each closed by a big race.** Turbo Acres is the tutorial hub, where you "learn basic driving techniques and enter practice races". Big Butte opens after *all tutorial events*. Prospecto Valley and Hauntsborough open at a *required rank*. Each biome has a final Grand Brick Arena race "unlocked by rank", and all of it leads to the Sky Cup [src: racinggames.gg biomes]. You collect checkered flags from rivals and medals from the Grand Brick Arena [src: 2K modes].
- **Three layers of activity.**
  (a) **On-the-Go events (OTG)**: blue gates you drive through. They last "a few seconds or up to a couple of minutes" and have gold medals; there is a trophy for gold in every OTG [src: ggrecon preview, PushSquare trophies].
  (b) **Quests**: given by characters. Examples: "recovering rogue rockets or lost bats, delivering flowers or even catching a criminal in a police cruiser". Rewards include whole unique vehicles. Only 20 quests in total [src: twinfinite via search]. Quests often hand you a **special vehicle** that changes the verb, such as the lawnmower that cuts weed patches until crystals grow [src: PushSquare trophy guide].
  (c) **World challenges and minigames**: "fighting off Robots in various Minigames", Red Light Green Light runway races, stone-skipping boat races, an alien EMP-grenade fight [src: ggrecon preview, 2K modes].
- **Rewards are things, not percentages.** Rivals give cars and perks. Story level 30 is a trophy. There are 1,000 unique LEGO pieces for the builder [src: Wikipedia, PushSquare].
- **What critics disliked (avoid it):** mandatory "fetch for townsfolk / smash robots" quests that block races, an overwhelming first hour, slow XP gating late in the game, and challenges that "repeat themselves" [src: Shacknews, purexbox/jumpdashroll via search]. So 2K's best part is not its quests. It is races with rivals, the dialogue, and smashing.

### 1.2 Forza Horizon 5
- **A story cut into chapters, shown as missions with characters.** There are 6 Horizon Stories. For example, "Born Fast" has 8 chapters against a rich street-racing club. After chapter 1 the story branches into two parallel chapters. One chapter asks you to *lose on purpose*, but gives ★★★ for winning anyway, which is a twist in the objective itself [src: mapmaster/guides via search].
- **Showcases are cinematic set pieces against a non-car opponent**: a cargo plane with wingsuit bikers, a hovercraft, a train, monster trucks. The first one unlocks at the start of the game as the *second* story objective [src: mapmaster Showcase].
- **The opening drops you into the action.** A car falls out of a plane onto a volcano, then drops into a race already in progress in a second biome, then a third [src: gamesbeat/VGC].
- **PR stunts are 10–40 s snacks with 3 stars**: speed trap, speed zone (average speed, cutting corners fails), danger-sign jump (you must land cleanly), drift zone, and trailblazer (any route) [src: racinggames.gg].
- **Progression is "snackable".** Accolades (~2,000 micro goals) feed chapter unlocks, so *anything* you enjoy moves the story forward. Expeditions open each festival hub [src: GTPlanet].

### 1.3 Others
- **Mario Kart World free roam**: more than 300 P-switches. Each mission is short, but each has a **hand-made idea tied to its place**, for example "grab blue coins amongst falling leaves" or coins next to Piranha Plants. The reward is a collectible sticker [src: Dexerto, Nintendo Life].
- **The Crew Motorfest playlists**: 15 themed mini-campaigns of **6–10 events**, each with a narrator or host who explains why it matters. **Loaner cars** fit each event, finishing the playlist gives an exclusive car, and the events "pinball" between event types [src: EGM, GGRecon via search].
- **Burnout Paradise**: events start at *any* traffic-light junction with no loading. There are 5 verbs: Race; **Road Rage** (a takedown quota within a time limit); **Marked Man** (reach a destination while cars try to wreck you); Stunt Run (score attack); Burning Route (a route for each car) [src: Codex Gamicus, TheSixthAxis].
- **Crash Team Racing adventure mode**: 5 hub worlds. Trophy races open tracks, and each hub's trophies open a **boss race** whose key opens the finale. Relic races (time-freeze crates) and CTR token challenges are mastery layers, and every win gives a kart part or skin [src: Wikipedia, PlayStation Blog].
- **Spider-Man (2018/2)**: side content is "parceled out as the story progresses so players aren't overwhelmed", and it **evolves**. The types: crimes (fights, car chases), strongholds (escalating waves), photo landmarks, collectibles with lore, puzzle minigames. Activities announce themselves in the world, for example drones flying past or symbols beamed into the sky [src: PushSquare, GDC 2024 SM2 session, review snippets].
- **Witcher 3 / CDPR**: "every quest — even fetch/deliver — should be memorable … always twists". They create **information gaps** ("we want the players to want the story"), cut repeated exposition, and anchor new ideas in familiar ones (MAYA) [src: GameBanshee/ComicBook, GameDeveloper GDC 2023 takeaways].

### 1.4 The patterns, distilled (P1–P12)
| # | Pattern | Target number for us |
|---|---|---|
| P1 | **Story mission = set piece**: authored place, named character physically there, 3–4 phases that *escalate*, with a reveal or twist in the middle | 4–7 min story missions |
| P2 | **Opposition with behaviour**: goons, rivals, cops, a boss vehicle; "drive A→B" alone is never the content | ≥1 active opponent in 80% of activities |
| P3 | **Escalation per phase**: each phase adds one new pressure (more chasers, a time bonus, a split target, the boss arrives) | new pressure every 45–75 s |
| P4 | **Snacks + meals**: OTG/PR stunts 15–90 s for density; activities 2–5 min; story 4–7 min; chapter finale race 3–5 min | as listed |
| P5 | **Characters and banter**: mentor and villain lines during play, short cutscene beats at the start and end, rival taunts | a line every 20–30 s inside missions |
| P6 | **Always "what next"**: a mentor sidekick points at the next story beat; the result screen offers the next thing | one button "NEXT →" on every result |
| P7 | **Gates by story or any fun activity**, never by grinding XP (2K was criticised for this; FH5 accolades let anything count) | chapter needs story beats + N of any activity |
| P8 | **Tangible rewards**: cars from rivals, special vehicles that change the verb, abilities, parts, stickers | one *thing* per mission, one *new verb* per chapter |
| P9 | **Place-specific ideas**: each event uses its location (a train track, a bridge, a stadium, a market) | each authored event names its landmark |
| P10 | **Immediate retry, no loading**; events start where you are (Burnout) | retry < 2 s |
| P11 | **A hook in the first 3 minutes**: a dramatic open, mentor intro, villain insult, then a first real event | villain on screen by 3:00 |
| P12 | **Unfold content gradually**: start with few icons and add types per chapter (Spider-Man) | 3 types in chapter 1, then +2 per chapter |

---

## 2. Honest diagnosis: our game against these patterns

What exists (v75): 8 Frankfurt rivals (`RIVAL_EV`), boss Kaiser (`BOSS_EV`), 4 chapters (`CHAPTERS`), 6 challenge events (`EVENTS`), 6 modes (`MODE_EV`), 15 OTG, 9 quests (`QUESTS`), 10 city sprints (`SPRINTS`), 5 cups (`CUPS`), 3×3 story questlines per city (`QV_SQ`), and about 10 dynamic encounter templates (`QV_ENC`). Systems: the quests-v2 stage engine with A* GPS, seeded layouts, retry, twists (rival/chasers/rush/combo/heavy), 12 perks, garage parts (`GB_PARTS`), 4 upgrade stats (`UPG`), XP and levels, studs, and a 6-step tutorial (`TUT`).

Why it is boring (specific):
1. **The "narrative" is 4 text pop-ups.** `storyCheck()` shows one `#story` panel when the flag count crosses 0/2/4/6. Nothing happens in the world. No character appears, no event changes the city, there is no mid-mission dialogue tied to the plot, and no scene. Kaiser exists only as a race and a line of text. **This misses P1, P5 and P11.**
2. **Rivals and cups are cut off from the open world.** A rival duel calls `worldCfg()` and loads a *circuit* (`grand/hafen/sky/fraport`). The free roam (the part the owner sees) has no story progress in it. The story moves forward only on separate laps of a circuit. 2K and FH5 put rival races *in* the world.
3. **Quests v2 made events longer by adding distance, not content.** `qvPk()` picks random road-graph nodes 900–2500 m apart, so a "3-stage delivery" is about 3 × 60 s of driving along the yellow line with one text line per stage. The `par` formula literally adds GPS length / 32 m/s. Longer travel time with a timer is not more interesting; this is exactly the "boring" the owner reported after v2. **This misses P1, P3 and P9.**
4. **There is almost no opposition in free roam.** Item boxes and weapons exist only in circuit races (`#itemBox`, the `sig*` behaviours). In free roam the only opponents are the fleeing van (`chase`), optional "chasers" goons and the escort rammers. You cannot fight in the city, so the owner's "chases & combat" wish is largely unserved. **This misses P2.**
5. **Every template is the same shape with different text.** Collect = drive to zone, grab 4 bricks, three times. Smash = 5 piles, three times. Photo = stop on a ring. The QV_SQ questlines reuse the same generic kinds: Green Sauce = collect → deliver → race. Locations are random graph nodes, so no event uses a landmark (Römer, Eiserner Steg, Hbf, the airport, the Acropolis) as part of the idea. **This misses P9 and Witcher's "always a twist".**
6. **Nothing escalates inside an event.** Stages are parallel copies (`for k<3`). Twists are chosen once per replay (`QV_TW`) and stay constant. No phase changes the rules halfway. **This misses P3.**
7. **There is no "what next" after the tutorial.** `TUT` ends with "Glowing beacons start races and events… Have fun!" Then you face roughly 70 equal markers and encounters. Nothing ranks the story above a random OTG, so "there is no … way for the user to do things" is accurate. **This misses P6 and P12** (everything shows at once).
8. **Rewards are invisible numbers.** Upgrades give +3% top speed. Perks are passive. Studs buy more percentages. Rival cars exist (`v_rossi` and so on), which is good, but **no reward ever unlocks a new verb**: no special vehicle, no new ability, no new place to go. **This misses P8.**
9. **Athens appears stuck at chapter 1.** `ATH_RIVAL_EV=[]` while `nFlags()` and `chapter()` count `ATH_RIVAL_EV`; Athens flags are counted by `athNF()` over `ATH_TRK_EV`. As read, Athens chapters 2–4 can never trigger (verify with a test). Athens also has no in-world rival marks: `roamCatalog()` returns only garages and the flight for Athens, and its races sit behind a menu (`buildWorldAth`).
10. **The economy pays for repetition, not novelty.** Most of the variety comes from re-seeding the same 10 templates. Once the player sees the pattern (in about 3 events), the game has nothing new to show.

In short, we built a good engine for *placement and guidance* (graph, GPS, seeds, retry) and filled it with *errands*. The redesign keeps the engine and changes the content. Missions should be hand-authored set pieces with opponents and escalating phases, inside a real story that unlocks new verbs.

---

## 3. Redesigned core loop (both cities)

### 3.1 Loop in three sentences
- **Every 10 s** the player decides how to deal with an opponent or obstacle: ram, dodge, take a shortcut, use an item, smash for boost.
- **Every minute** a mission phase changes the rules (the target splits, the boss arrives, the bridge collapses, cops join), or the player clears a snack (OTG/stunt) on the way.
- **Across sessions** the story moves forward chapter by chapter. Each chapter gives a **new car and a new ability** that opens new activities, shortcuts and places in the city.

### 3.2 Story structure (template per city)
`Chapter = intro scene → 3 story missions (4–7 min each, authored) → "street rep" gate → rival showdown in the world → chapter finale (circuit cup race or boss set piece) → reward scene (car + ability)`.
- **Street Rep (gate)** replaces flags and XP gating. Story missions give the most rep, but *every* activity type, encounter, OTG and stunt also gives rep (P7, FH5 accolades). The next showdown needs about 3 of the chapter's 8–12 side activities, which is roughly 15 minutes of choice, never grind.
- **Scene beats ("comic cutscenes")** are cheap and fit the engine. Letterbox bars, the camera orbits or cuts to a 2-shot of two LEGO minifig cars, and 2–4 speaker lines in the existing speaker panel (yellow name tab and portrait). Skippable with one tap. Used at mission start and end, and at each phase change mid-mission (a 1-line radio pop that does not stop gameplay).
- **Kaiser's Schattenwerk crew** is the recurring villain faction (black and gold goon cars). It shows up in free roam as patrols, blockades and story set pieces, so the villain is *present* in the world, not only in text.
- **Sidekick guidance** (S.T.U.D. analogue): "BRIX", a small radio drone voice next to Hilde. It gives one hint per idle minute, always pointing at the next story beat.

### 3.3 Frankfurt campaign: "Kaiser's Mainhattan" (4 chapters plus finale, about 3–4 h)
| Ch | Title / theme | Story missions (authored, landmark-bound) | Showdown / finale | Reward: car + **new verb** |
|---|---|---|---|---|
| 1 | **Neu in Mainhattan**: Hilde's garage is broke; Kaiser's crew "taxes" Sachsenhausen | M1 *Hot Drop* (opening, §3.7) · M2 *Ebbelwoi Heist*: Kaiser's goons steal the cider truck at the Apfelwein market; chase it, it splits into 3 vans, ram each one, the barrels spill and the street becomes a slick drift zone, then deliver back while 2 goons hunt you · M3 *Bridge Toll*: the Schattenwerk barricades the Alte Brücke; smash the toll booths, survive 2 waves of rammers, then jump the raised drawbridge | **Street duel vs Luca Rossi**: point-to-point Römer → Zeil → Hauptwache *in the world* with items on | Fulmine Rosso + **Item Slot in free roam** (item boxes appear across the city) |
| 2 | **Die Hafenbande**: the harbour crew works for Kaiser, smuggling at Osthafen | M4 *Marked Man: Hafen*: carry Jana Weber's evidence crate from Osthafen to the police HQ while 4 crew cars try to wreck you (Burnout Marked Man) · M5 *River Rampage*: boat chase on the Main under the bridges, ram the smuggler boats, then auto-morph onto the quay for the finale · M6 *Crane Crash*: smash 3 container stacks so the giant ball rolls down into the smugglers' hideout gate | **Duel vs Weber + Moreau** (3-car, Hafen → EZB) · **Finale**: *Mainhattan Cup* circuit race 1 (Grand) | Mainschiff + **Ram Plough** (smash reinforced walls, which opens 4 shortcuts and the "Wall" activities) |
| 3 | **Kaisers Schatten**: Kaiser frames you; the police hunt you | M7 *Framed*: escape 3 police cars through the Bankenviertel to a car wash (hide = stop inside, heat drops), then race to stop Kaiser's courier · M8 *Train Job*: Showcase race against the S-Bahn across the Main to the Hbf; beat it to the station to grab the evidence · M9 *Tower Party*: Ferreira and Çelik hold the Main Tower plaza; takedown waves (Road Rage), then the boss truck | **Duel vs Ferreira (missiles) and Çelik (mines)** · **Finale**: Storm Cup race 1 | Míssil Verde + **Rocket Hop** (charged jump: rooftops, roof shortcuts, stud arcs) |
| 4 | **Das Finale**: the Sky Cup | M10 *Airport Showcase*: race the cargo plane down the Startbahn West · M11 *Blackout*: Kaiser cuts the city's power; at night, smash 4 generators across 4 districts while his elite guard hunts you · M12 *The Crown*: Kaiser's armoured hauler carries the Sky Cup across the city; 3 phases (ram → it drops mines → it boosts onto the Autobahn) | **Boss: Vex Kaiser** at the Sky Cup Grand Arena (circuit, 3 laps, bespoke boss lines) | Kaiserkrone + epilogue: Athens invite |

Rivals 5–8 (Okafor, Brandt, Nakamura and others) become **optional "Rival Street Duels"** that are always available in the world after chapter 2, each paying out its car.

### 3.4 Athens campaign: "Drakos' Akropolis" (3 chapters, about 2 h)
- Ch1 *Kalos irthes*: M1 *Koulouri Rush* (Yiayia's bakery van is hijacked in Monastiraki; chase through the narrow Plaka streets, which are tight and full of smashable market stalls). M2 *Moped Swarm*: Drakos' moped gang steals tourists' bags on Ermou; take down 12 mopeds in 3 minutes, then the gang leader. M3 *Acropolis Climb*: a stunt hill climb up Dionysiou Areopagitou with ramps and stud arcs. Duel vs Pappas. Reward: **Ghost** item (pass through traffic).
- Ch2 *Ta stena*: the Stolen Amphora becomes a real heist (Marked Man to the museum, then a boat chase at Piraeus as an optional extension), a Metro showcase (race the metro from Syntagma to Omonia over ground), and Lycabettus "King of the Hill" (hold the summit against 4 cars). Duel vs Lambrou on Vasilissis Sofias. Reward: **Magnet** (pulls studs and bricks, and lets you tow the giant ball).
- Ch3 *O Drakos*: Blackout at Syntagma, the Taverna Night street party (Stunt Show with crowd meter), and the finale in the Panathenaic Stadium (`ATH_BOSS_EV`).
- Fix: Athens chapter counting uses its own flag list, and Athens rivals become in-world marks.

### 3.5 Role of races and cups and of free-roam activities
- **Story missions** carry the plot (12 in Frankfurt, 9 in Athens). They are hand-authored and replayable for stars.
- **Rival Street Duels** happen *in the world*, on point-to-point routes with items, using the existing `SPRINTS` engine and adding the item slot. Winning gives a flag and the rival's car.
- **Circuits and cups** are chapter finales and late-game replay (CTR boss races). Each cup race opens with a rival scene beat. Cups unlock liveries and "Mirror/Storm" variants. They are not needed for each chapter, only for the finale.
- **Free-roam activities** (§4) are the "meals" that fill a session. Each district has 3–5, and they unlock by chapter (P12). Dynamic encounters (`QV_ENC`) stay as the "?" layer, but they draw from the §4 catalogue rather than the old errands.
- **Snacks** (OTG gates, speed traps, jumps, drift zones, stud arcs, golden bricks) stay as the density layer, 15–90 s.

### 3.6 Rewards that matter
- **One new verb per chapter**: free-roam item slot → Ram Plough → Rocket Hop → (Athens) Ghost, Magnet. Each one opens new shortcuts, new collectible spots and new activity variants (walls, rooftop stud arcs), so the world grows without new geometry (a light Metroidvania).
- **Special vehicles from quests** (2K lawnmower pattern): Taxi Turbo (taxi fares pay double), Bin Lorry (anything you smash becomes studs ×2 in Chain Rampage), Police Interceptor (unlocks the "Bust" variant of chases), Boat Racer. You switch at a garage or at a quest giver.
- **Garage**: each story mission's ★★★ gives a named part (exists: `GB_PARTS` quest/pack gates); move them from "pack N" to story and activity gates so every part has a story.
- **Visible upgrades**: each `UPG` level changes something you can see (exhaust flame size, a boost-trail colour, a louder engine).
- **District liberation**: clearing a district's Blockade (A9) turns the Schattenwerk flags into Hilde-green ones, unlocks fast travel and adds the district's activities. This is visible progress on the map.

### 3.7 The first 30 minutes, minute by minute (Frankfurt, new save)
| Time | What happens | Pattern |
|---|---|---|
| 0:00 | **Hot Drop**: a cargo plane flies over Fraport, your car drops out on a parachute onto the Startbahn, and Hilde comes on the radio: "Late for your own job interview, rookie!" Steering and boost are taught by doing, with no prompt walls | P11 |
| 0:45 | You follow Hilde's car into the city along the A5; stud arcs teach boost refills; the first smash of a bin chain teaches the CHAIN counter | P5 |
| 2:00 | **Kaiser appears**: his black and gold car blows past and smashes Hilde's car into a fountain. Scene beat (3 lines): "Cute garage, Oma. Mine now." | P11 |
| 2:30 | **M1 continues as a chase**: follow Kaiser's two goons and ram each one twice (teaches ramming and takedown slow-mo); goon 2 drops crates (teaches dodging) | P2, P3 |
| 4:30 | Goons wrecked; Kaiser escapes over the Main; a drift lesson as you take the Mainkai curves back to the garage. Result card: ★ stars, studs, **"NEXT → Hilde's garage (600 m)"** | P6 |
| 5:30 | **Garage scene**: Hilde explains the stakes, and BRIX the drone is introduced. The first part (Shark Jaw nose) is equipped live. The map shows *only*: M2, 2 OTG gates, 1 activity (Takedown Hunt), 1 golden brick | P12 |
| 7:00 | On the way to M2: drive through an OTG gate, *Speed Trap Mainkai* (20 s) | P4 |
| 8:00 | **M2 Ebbelwoi Heist** (≈6 min): 3 phases plus a spill drift zone and a return under fire | P1, P3 |
| 14:00 | Result: rep bar shows 2/5 toward the Rossi duel; BRIX suggests "Takedown Hunt in Sachsenhausen, 400 m" | P6, P7 |
| 15:00 | **Activity: Takedown Hunt** (A2, ≈3 min): 8 goon takedowns, then the lieutenant | P2 |
| 18:30 | Snacks on the way: a golden brick on a roof (reached by the ramp chain), a jump gate | P4 |
| 20:00 | **M3 Bridge Toll** (≈5 min): smash the toll booths, survive rammer waves, jump the drawbridge as it rises (scripted) | P1, P9 |
| 25:00 | Chapter scene: Luca Rossi challenges you ("Show me what you have, rookie!") | P5 |
| 26:00 | **Street Duel vs Rossi** (≈3.5 min, in the world, Römer → Zeil → Hauptwache, items on) | P2 |
| 29:30 | Win: Fulmine Rosso and the **Item Slot unlock scene**; item boxes pop up across the city. Chapter 2 title card; the map adds Getaway, Chain Rampage and Stunt Show icons | P8, P12 |

On the touch build: no step needs more than steer, boost, drift, hop and the one item button.

---

## 4. Activity catalogue (12 + snacks), buildable in our engine

General rules for all: every activity has a **named host** (a character with 3–6 lines), **3–4 phases where each phase adds one pressure**, a **seeded twist** (existing `QV_TW`, extended), **instant retry** (existing ↺/RETRY/NEW ROUTE), **★ by score or time** shown live, and an **authored anchor** (landmark start plus 1–2 landmark-bound phases). Seeded layouts fill in the parts in between. Distances between phases stay **≤ 700 m**, because the content is the action, not the drive.

**A1 Getaway (Marked Man)** · verb: survive and reach a goal · 3–4 min.
Phases: (1) grab the package at a landmark, and 3 goons spawn; (2) a 1.2–2 km run to the safehouse while goons ram you (HP 5); (3) halfway through, a road is blocked, so the GPS reroutes and a heavier goon truck joins; (4) the safehouse garage door closes in 10 s, so a final sprint.
Twists: cops instead of goons; night with no minimap; a fragile package (bumps cost HP); a decoy (two packages, one is a bomb that must be thrown into the river).
Fail/retry: HP 0 means retry at the last phase checkpoint (phase checkpoints are new and cheap: save the stage index and car position).
Juice: goon cars tumble on takedown, slow-mo on the final door, the stud fountain.
Why fun: chase plus combat plus driving lines; Burnout's most loved mode.
Engine: escort and chase AI reused in reverse (goons target the player); the `cpBeam` goal.

**A2 Takedown Hunt (Road Rage)** · verb: wreck enemies · 2–3 min.
Phases: wave 1, 4 goon cars; wave 2, 4 more plus a shield car (only boost-rams count); boss lieutenant with 3 HP who boosts away and drops mines. The timer gets +10 s per takedown.
Twists: in a stadium arena or car park; mopeds in Athens (fast and fragile); "Bust" with the police interceptor.
Juice: takedown camera, a combo counter, a spark burst.
Why fun: pure chaos and combat, the owner's top wish.
Engine: traffic cars with an aggressor brain (circuit AI `aggr` behaviour moved into roam), `hitPop`, takedown sfx (exists).

**A3 Heist Pursuit (multi-phase chase)** · verb: catch and ram · 3–4 min.
Phases: (1) the van flees, ram it 3×; (2) it **splits into 3 cars** fleeing in different directions, so the player chooses the order; (3) the last one drives onto a boat or the bridge, so auto-morph and follow onto the Main (Frankfurt) or towards Piraeus (Athens); (4) return the loot while 2 goons hunt you.
Twists: the van drops oil slicks; the getaway driver uses the Ghost item; a helicopter spotlight hints the route.
Engine: `chase` stage (exists) with split spawning, plus boats (exist).

**A4 Rival Street Duel** · verb: race a named rival through the city · 2.5–4 min.
A point-to-point race over 3–5 km with **items on**, 2 marked shortcuts (one needs the current chapter's verb) and rival taunts at gates. Its signature behaviour comes from `RIVAL_EV.sig`: Ferreira fires missiles, Çelik drops mines.
Twists: rain or night; "no items"; a rival in a loaner car.
Engine: the `SPRINTS` engine plus free-roam item boxes plus `sigTick` moved into roam.

**A5 Chain Rampage** · verb: destroy everything · 2–3 min.
Phases: (1) chain 15 smashes before the combo timer (3 s) runs out; (2) the **giant ball** appears, so push it down a street into a "bowling" set of 10 brick pins at a landmark (the Römer plaza, Monastiraki square); (3) the brick tower boss: hit it at 150+ km/h 3 times as it regrows its layers.
Twists: Bin Lorry (studs ×2); a time-freeze crate (CTR relic); "no braking".
Engine: smashables, chain counter (exists), giant ball (exists), `spree`/`boss` stages (exist); add pins as a smashable group.

**A6 Stunt Show** · verb: air, flips, drift for a crowd · 2–3 min.
A crowd meter drains over time and fills with jumps, near-misses, drifts and smashes. Phase 2 opens a ramp line (spawned ramps across a plaza). Phase 3, "finale": land one jump over 60 m through a burning hoop.
Twists: double points in the air; mirror; "smash only" crowd.
Juice: confetti, crowd cheer sfx, camera on landing.
Engine: ramps, `jump/dpts/vmax` stages; add a crowd meter (a HUD bar).

**A7 Ticking Crate (delivery with a twist)** · verb: rush and juggle · 2–3 min.
The crate is a "stud bomb" with a 25 s fuse. **Smashing props, near misses and drifts add +1 to +2 s.** Deliver it to 3 stops, each ≤ 600 m apart. At stop 2 the receiver isn't there: follow his moving car and drive alongside it for 5 s.
Twists: two crates (fuse shared); chasers; uphill only (Lycabettus).
Why fun: it turns the hated "move a crate" into a rhythm of smashing and drifting.
Engine: `go` stages, combo timer bonus (exists in `combo` twist), and a follow stage (the escort car with an inverted objective).

**A8 Showcase: Beat the Train/Plane/Boat** · verb: race a huge non-car opponent · 3–4 min, authored, 1 per chapter.
S-Bahn across the Main to the Hbf; cargo plane on the Startbahn West; a tour boat versus your car along the quays; the Athens metro (Syntagma → Omonia); a ferry at Piraeus. The opponent follows a fixed spline; the player has an off-road shortcut and a jump over the track as the "signature moment".
Engine: a spline-mover mesh (a train is a box chain) plus a `race` stage with a non-AI rival position.

**A9 Blockade (district stronghold)** · verb: liberate a district · 4–5 min.
Phases: (1) smash 3 barricades at district entries, each guarded by 2 goons; (2) defend the "Hilde beacon" by ramming goons that try to destroy it within 60 s (*the player is the defender, armed with items*, unlike 2K's disliked passive wave defence); (3) the lieutenant's armoured car: ram it while it is stunned from hitting a barrier.
Reward: the district turns green, plus fast travel, its activities and a garage discount.
Engine: smash plus takedown AI plus a beacon prop with HP.

**A10 Brick Hunt with clues** · verb: explore and read the city · 3–4 min.
BRIX shows a **photo clue** (a cropped render of a landmark or a street corner). Find the spot and stop on it to get the next clue; 4 clues end at a hidden treasure crate. Proximity "hot/cold" ping only, and the GPS is off; this is the one activity about knowing the real city.
Twists: night; rooftop clue (needs Rocket Hop); Athens Greek-alphabet clue.
Engine: offscreen camera snapshot to canvas, plus `go` stages without GPS.

**A11 River/Harbour Run** · verb: boat chase or boat race · 2–3 min.
Phases: (1) a boat race through gates under 5 bridges; (2) a smuggler boat to ram; (3) jump onto the quay (auto-morph) and finish on land.
Engine: boats, the river gates OTG (exists), the chase stage on water.

**A12 King of the Hill** · verb: hold a zone · 2–3 min.
Hold a 30 m circle (Lycabettus summit, the Römerberg, the Opernplatz) for 60 s in total while 4–6 cars push you out. Items spawn in the ring.
Twists: shrinking ring; giant ball rolls through; ice (low grip).
Engine: zone stage plus aggressor AI (from A2).

**Snacks (keep and polish):** OTG gates (checkpoint, speed trap, long jump, drift zone, collect), stud arcs, golden bricks, roof bricks, jump gates. Targets: 15–90 s, 3 stars, no briefing card (start on drive-through, like 2K's blue gates and FH5 PR stunts). Retire the generic multi-zone "collect 4 bricks ×3" and "smash 5 piles ×3" as standalone quests; they become phases of A5 and A10.

**What becomes of the existing content:** `q_cider` → part of M2; `q_thief` → A3; `q_wedding` escort → a convoy phase inside M5 only (critics disliked escort as a standalone); `q_taxi` → a Taxi Turbo special-vehicle side job (A7 variant, the fare meter as the fuse); `q_photo` → A10; `q_walls` → Ram Plough showcase; `q_stunt` → A6; `q_ball` → A5 phase 2; `q_pigeons` → snack set; `QV_SQ` lines → rewritten as 3-part side stories that use A1–A12 phases (Green Sauce: A7 → A3 against the "herb thieves" → an A4 duel against Krause).

---

## 5. Prioritised build plan

### Milestone 1: "The first 30 minutes are a game" (largest fun gain)
Scope:
1. **Scene-beat system**: letterbox, camera 2-shot or orbit on two cars, 2–4 lines in the speaker panel, tap to skip; a mid-mission radio line that doesn't pause. Hilde, Kaiser and Rossi portraits exist.
2. **Free-roam opponents**: goon cars, which are traffic cars with an aggressor brain (target the player, ram, flee at low HP, takedown on a boost-ram), HP for the player in missions, and the takedown cam.
3. **Free-roam item boxes** (Missile, Mines, Ghost first): reuse the circuit item code, plus one fire button on touch.
4. **Mission scripting on the qv2 stage engine**: authored stage lists with fixed landmark anchors, `on`-enter hooks (spawn goons, switch route, scene beat), **phase checkpoints** for retry.
5. **Chapter 1 content**: M1 Hot Drop (opening), M2 Ebbelwoi Heist, M3 Bridge Toll, Rossi Street Duel in the world, Item Slot unlock, plus 2 activities (A2 Takedown Hunt, A5 Chain Rampage) and the existing OTG.
6. **Guidance**: a "NEXT" objective pill (always the story unless an activity is running), BRIX idle hints, and a NEXT button on every result card. **Progressive reveal**: only chapter-1 icons on the map.
7. **Fix the Athens chapter counter**, so the chapter function counts Athens flags (`athNF`) (small, independent).

Testable (Playwright with real input, plus the owner's score):
- A bot plays a new save and reaches M2 within 8 minutes. The scene beats are skippable and count ≤ 4 taps in total.
- Each story mission measures 4–7 min for a bot at 50 m/s and has ≥ 3 phases with distinct objectives (asserted from the stage list).
- Goons ram the player (a contact event is logged), and takedowns register.
- Retry from a phase checkpoint takes < 2 s. Only chapter-1 marks are visible on a fresh save.
- Frame budget holds with 6 goons, and there are no page errors.
- **Ground truth: the owner's 0–10 score and one sentence on M1–M3** (the skill rule: never self-score).

Risks: goon AI pathing in the real Frankfurt streets (mitigate: reuse the GPS graph for goons and teleport-respawn them out of view); touch control load with an item button (check the button rects); scene camera clipping into buildings (choose the camera from the 2 best of 6 candidate positions using `roamHit`); scope creep in the writing (cap each mission at 12 lines).

### Milestone 2: "Frankfurt campaign complete, new verbs"
- Chapters 2–4 (M4–M12) and the Kaiser finale with boss lines; Weber, Moreau, Ferreira and Çelik duels in the world; the cup finale races get rival scene beats.
- Abilities: Ram Plough (reinforced walls plus 4 shortcuts), Rocket Hop (charged jump plus rooftop stud arcs).
- Activities A1, A3, A6, A7, A8 (S-Bahn and plane), A9 Blockades (5 districts, map colour), A11, A12.
- Street Rep gate replaces the flags-only chapter gate. Rewards move to story and activity gates (parts, special vehicles: Taxi Turbo, Bin Lorry, Police Interceptor).
- `QV_ENC` encounters draw from A1–A12 templates (seeded variants), keeping 8–15 alive.
Tests: each chapter can be completed by a bot; every activity type has a measured 2–5 min duration and ≥ 1 opponent or pressure per phase; each ability opens at least 1 shortcut used by a mission; owner score per chapter.
Risks: content volume (about 9 missions × 12 lines × 3–4 phases), so author missions as data rows on the stage engine and do not write custom code per mission; Showcase splines on real geography (the S-Bahn line needs a clear corridor, so use the rail-yard area and the Main bridges that exist in RF data).

### Milestone 3: "Athens campaign + long tail"
- The Athens 3-chapter campaign (§3.4), Ghost and Magnet abilities, the moped swarm, the Metro showcase, King of the Hill on Lycabettus, and in-world Athens rival duels; the Panathenaic finale.
- A10 Brick Hunt with photo clues in both cities, a daily "Hilde's Job Board" (3 seeded activities with a bonus), and side-story rewrites of `QV_SQ` (3 per city) using A-type phases.
- Cups as replay: Mirror/Storm variants unlock liveries; ★★★ mastery stickers per district (Mario Kart World sticker pattern).
Tests: an Athens new arrival reaches chapter 2; there are no Frankfurt names in the Athens logic; the save namespaces hold; the owner's score.
Risks: Athens narrow streets versus goon AI and the giant ball (tune the spawn rules per district); size budget for the single file (scene text and stage data are small; the main cost is goon AI and the scene camera code, estimated at +40–70 KB).

### Why this order
M1 alone answers every point of the latest complaint: narrative (scene beats, Kaiser in the world), continuation (chapter 1 → duel → unlock), "a way for the user to do things" (NEXT guidance, progressive reveal), and length plus interest (4–7 min phased set pieces with opponents). It reuses the qv2 engine, so it changes content and AI, not infrastructure.

---

## 6. Sources
- LEGO 2K Drive modes (official): https://lego.2k.com/drive/features/modes/ · 2K support "Game Modes": https://support.2k.com/hc/articles/15735213738899
- Biomes and unlocks: https://racinggames.gg/article/lego-2k-drive-map-every-biome-in-bricklandia
- OTG, quests and world challenges: https://www.ggrecon.com/articles/lego-2k-drive-preview/ · https://twinfinite.net/reviews/lego-2k-drive-review/
- Trophy list (Racing 101, Grand Brick Arena, OTG gold, quests, lawnmower): https://pushsquare.com/guides/lego-2k-drive-trophy-guide-all-trophies-and-how-to-get-the-platinum
- Reviews: https://shacknews.com/article/135697/lego-2k-drive-review-score-pc · https://gameinformer.com/review/lego-2k-drive/stud-your-engines · https://www.ggrecon.com/reviews/lego-2k-drive-review/ · https://www.purexbox.com/reviews/xbox-series-x/lego-2k-drive · https://jumpdashroll.com/article/lego-2k-drive-review · https://en.wikipedia.org/wiki/Lego_2K_Drive
- Forza Horizon 5 campaign: https://gtplanet.net/?p=111430 · Stories: https://mapmaster.io/games/forza-horizon-5-playstation/guides/Born%20Fast · Showcases: https://mapmaster.io/games/forza-horizon-5-playstation/guides/Showcase · PR stunts: https://racinggames.gg/article/forza-horizon-5-what-are-the-best-cars-for-pr-stunts · Opening: https://gamesbeat.com/forza-horizon-5-has-another-high-octane-opening/
- Mario Kart World P-switches: https://www.dexerto.com/wikis/mario-kart-world/p-switch-missions/ · https://nintendolife.com/guides/mario-kart-world-south-sea-collectibles-crown-city-dk-spaceport-koopa-troopa-beach
- The Crew Motorfest playlists: https://egmnow.com/the-crew-motorfest-pick-your-poison/ · https://www.ggrecon.com/reviews/the-crew-motorfest-review/
- Burnout Paradise events: https://gamicus.fandom.com/wiki/Burnout_Paradise · https://www.thesixthaxis.com/2008/03/02/burnout-paradise/
- Crash Team Racing adventure: https://en.wikipedia.org/wiki/Crash_Team_Racing · https://blog.playstation.com/?p=211657
- Spider-Man side content: https://pushsquare.com/news/2018/08/hands_on_what_kind_of_side-content_is_in_marvels_spider-man · https://schedule.gdconf.com/session/rebuilding-the-open-world-loop-in-marvels-spider-man-2/899311
- Witcher 3 / CDPR quest design: https://www.gamedeveloper.com/marketing/10-key-takeaways-from-the-quest-design-of-cyberpunk-2077-and-the-witcher-3 · https://comicbook.com/comicbook/news/the-witcher-3-developers-promise-you-wont-find-two-identical-sid/
