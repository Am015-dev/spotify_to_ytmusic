# Copy audit (W295, 31 Oct 2026)

Runtime capture of every string a player reached at 390x763 and 1440x860 (title, settings incl. Assist and More, flight, boss warning, result, game over, pause, story card, foot hint) by `qa/copy-test.js` (DOM text + canvas fillText). Static source list: `python3 games-src/nightrun/qa/copy-extract.py` (3028 candidate string literals in parts/, file:line, heuristic; run it for the raw list, most lab/ and qa-hooks/ entries are developer tools not reachable from the title).

Classes: UI language = English; proper noun = German place/boss name kept (same spelling and diacritics everywhere); dev/debug = must go; truth = TRUE / FALSE / UNTESTABLE against the code (W266/W267 ledgers).

## Changed strings (before -> after)

| file:line | before | after | class / truth |
|---|---|---|---|
| core/b.js:183, waves/stage1fun.js:69, render/calm.js:33 | WARNUNG | WARNING | UI language (German) |
| core/b.js:109 | SCHICHT n | LOOP n | UI language (German) |
| core/b.js:445 | SEKTOR FREI | SECTOR CLEAR | UI language (German) |
| head.html:150 | Kurierflug 404 | Courier run | UI language; meaningless number |
| head.html:168 | KURIER ABGESTÜRZT / Courier down | COURIER DOWN / Spend Neon in the garage, then go again | UI language (German); sub line repeated the title |
| qa-hooks/g.js:143-146, menus/hub.js:93 | CHECKLIST button ("owner test list", Test checklist) | not built for players; `?chk=1` brings it back | dev text |
| hangar/meta.js:73 | PLACEHOLDER tag on SOON cards | removed | dev text |
| hud/c.js:205,219 | TAP TEST | TAP CHECK | "test" is a dev word; gauntlet-shell/sweep expectations updated |
| drills/lessons.js:68 | Test flight: both weapons fire together | Practice flight: both weapons fire together | dev word |
| story/story.js:171 | 36 PERFECT · you 0 / Score 300K · you 12K | 36 PERFECT hits (you: 0) / Score 300K (you: 12K) | unclear |
| profile/ret.js:28 | Ready in Garage: PULSE SPREAD LV2 11 | ... · 11 Neon | raw number |
| difficulty/cp.js:76, hangar/shop.js:119 | Banked +3 · garage 117 | Banked +3 · in garage: 117 | unclear |
| profile/ret.js:406 | World speed: "...The music and the beat do not change" | "Slows the whole game down: enemies, bullets and scrolling." | UNTESTABLE sentence removed |
| profile/ret.js:407 | Enemy bullets: "...so there is more time to dodge" | "Enemy bullets fly slower." | UNTESTABLE |
| profile/ret.js:409 | Beat window: "More time to hit the beat..." | "Widens the beat window for a PERFECT, on top of Timing window." | UNTESTABLE reworded to what it does |
| profile/ret.js:410 | Timing window: "How exact a tap has to be" | "Tight asks for exact taps, Loose forgives them." | UNTESTABLE |
| profile/ret.js:411 | Big bullets: "...white halo. The real hit size is unchanged" | "Draws enemy bullets bigger." | UNTESTABLE (hit size not measured), removed |
| profile/ret.js:412 | High-contrast bullets: "Bright white halo..." | "Adds a white halo to enemy bullets." | halo not looked at |
| profile/ret.js:413 | Reduced motion: "no strobing, no count-up" | "Calmer effects." | UNTESTABLE |
| render/readable.js:79 | Show hitbox: "marks the only spot that can be hit" | "Shows a small white dot on the ship, at the spot that can be hit." | UNTESTABLE |
| profile/ret.js:419 | Assist note: "It never blocks progress and never costs Neon" | "Assist makes the game easier. A run with ... is marked ⓐ..." | UNTESTABLE sentence removed |
| render/calm.js:15-19 | boss warning chip 12 px | 17 px (floor 16), chip 30 px high; a long boss line keeps the boss name | readability (size constants only) |

## Left on purpose
- German proper nouns: Frankfurt am Main, Bankenviertel, Mainufer, Ostend, Messe, Taunusanlage, Eiserner Steg, EZB-Sperrzone, Hammering Man, Plaka, ATHINA, Zeil, TRESOR-WART, ZENTRAL-ICE, MESSE-WÄCHTER, BRÜCKEN-WÄCHTER. Spelling consistent in code (checked by grep).
- `render/bg.js:11` billboard "ZENTRALBANK · STABILITÄT DURCH KONTROLLE": in-world sign art, not UI.
- Settings rows without a description (FPS cap, Ducking, Music reacts ...): no claim made, nothing to fix; labels only.

## Runtime strings by screen (English UI unless marked)

| screen | text | class |
|---|---|---|
| boss-warning | DASH | UI (English) |
| boss-warning | DASH 3 | UI (English) |
| boss-warning | EMP | UI (English) |
| boss-warning | EMP 2 | UI (English) |
| boss-warning | HULL | UI (English) |
| boss-warning | II | UI (English) |
| boss-warning | WARNING · something huge is closing in | UI (English) |
| boss-warning-carrier | DASH | UI (English) |
| boss-warning-carrier | DASH 3 | UI (English) |
| boss-warning-carrier | EMP | UI (English) |
| boss-warning-carrier | EMP 2 | UI (English) |
| boss-warning-carrier | HULL | UI (English) |
| boss-warning-carrier | II | UI (English) |
| boss-warning-carrier | WARNING · something huge is closing in | UI (English) |
| flight | DASH | UI (English) |
| flight | DASH 3 | UI (English) |
| flight | EMP | UI (English) |
| flight | EMP 2 | UI (English) |
| flight | HULL | UI (English) |
| flight | II | UI (English) |
| flight | SCORE MULTIPLIER: a hit halves it | UI (English) |
| flight-early | 1 · FIRST RUN · Deliver the data. Stay alive. | UI (English) |
| flight-early | DASH | UI (English) |
| flight-early | DASH 3 | UI (English) |
| flight-early | EMP | UI (English) |
| flight-early | EMP 2 | UI (English) |
| flight-early | HULL | UI (English) |
| flight-early | II | UI (English) |
| flight-early | SCORE MULTIPLIER: a hit halves it | UI (English) |
| foot-hint | BOMB | UI (English) |
| foot-hint | BRONZE ACHIEVEMENT | UI (English) |
| foot-hint | D or → to run | UI (English) |
| foot-hint | DASH | UI (English) |
| foot-hint | FLIGHT | UI (English) |
| foot-hint | Frankfurt am Main · 2099 · Courier run | UI + proper noun |
| foot-hint | GUARD | UI (English) |
| foot-hint | II | UI (English) |
| foot-hint | JUMP | UI (English) |
| foot-hint | KNIFE | UI (English) |
| foot-hint | LAB | UI (English) |
| foot-hint | MAINHATTAN | UI + proper noun |
| foot-hint | NIGHTRUN | UI (English) |
| foot-hint | ON FOOT | UI (English) |
| foot-hint | PISTOL | UI (English) |
| foot-hint | Push the stick right | UI (English) |
| foot-hint | SETTINGS | UI (English) |
| foot-hint | Short and Sweet | UI (English) |
| foot-hint | ●×2 | UI (English) |
| foot-hint-late | BOMB | UI (English) |
| foot-hint-late | BRONZE ACHIEVEMENT | UI (English) |
| foot-hint-late | D or → to run | UI (English) |
| foot-hint-late | DASH | UI (English) |
| foot-hint-late | FLIGHT | UI (English) |
| foot-hint-late | Frankfurt am Main · 2099 · Courier run | UI + proper noun |
| foot-hint-late | GUARD | UI (English) |
| foot-hint-late | II | UI (English) |
| foot-hint-late | JUMP | UI (English) |
| foot-hint-late | KNIFE | UI (English) |
| foot-hint-late | LAB | UI (English) |
| foot-hint-late | MAINHATTAN | UI + proper noun |
| foot-hint-late | NIGHTRUN | UI (English) |
| foot-hint-late | ON FOOT | UI (English) |
| foot-hint-late | PISTOL | UI (English) |
| foot-hint-late | Push the stick right | UI (English) |
| foot-hint-late | SETTINGS | UI (English) |
| foot-hint-late | Saved | UI (English) |
| foot-hint-late | Short and Sweet | UI (English) |
| foot-hint-late | ●×2 | UI (English) |
| game-over | +3 Neon | UI (English) |
| game-over | 1 · FIRST RUN | UI (English) |
| game-over | 1 · FIRST RUN · Deliver the data. Stay alive. | UI (English) |
| game-over | 46 READY | UI (English) |
| game-over | BORING | UI (English) |
| game-over | BRONZE ACHIEVEMENT | UI (English) |
| game-over | Banked | UI (English) |
| game-over | COURIER | UI (English) |
| game-over | DASH | UI (English) |
| game-over | DOWN | UI (English) |
| game-over | EMP | UI (English) |
| game-over | FUN | UI (English) |
| game-over | GARAGE | UI (English) |
| game-over | Goal | UI (English) |
| game-over | HULL | UI (English) |
| game-over | How did this run feel? (optional) | UI (English) |
| game-over | MINI-BOSS | UI (English) |
| game-over | Neon | UI (English) |
| game-over | PULSE SPREAD LV2 | UI (English) |
| game-over | RETRY | UI (English) |
| game-over | Reached | UI (English) |
| game-over | Ready in Garage: | UI (English) |
| game-over | SAME AGAIN | UI (English) |
| game-over | SILVER ACHIEVEMENT | UI (English) |
| game-over | Score | UI (English) |
| game-over | Short and Sweet | UI (English) |
| game-over | Spend Neon in the garage, then go again | UI (English) |
| game-over | Stage 1 failed | UI (English) |
| game-over | TITLE | UI (English) |
| game-over | This run: | UI (English) |
| game-over | Untouched | UI (English) |
| game-over | · 1 stage reached | UI (English) |
| game-over | · 11 Neon | UI (English) |
| game-over | · Perfect | UI (English) |
| game-over | · in garage: 117 | UI (English) |
| pause | 1 · FIRST RUN · Deliver the data. Stay alive. | UI (English) |
| pause | BRONZE ACHIEVEMENT | UI (English) |
| pause | DASH | UI (English) |
| pause | EMP | UI (English) |
| pause | First Light | UI (English) |
| pause | HULL | UI (English) |
| pause | Hull 4/5 · Shield ×0 · Dash 3/3 | UI (English) |
| pause | PAUSE | UI (English) |
| pause | RESUME | UI (English) |
| pause | RETRY | UI (English) |
| pause | Short and Sweet | UI (English) |
| pause | TITLE | UI (English) |
| result | +102 Neon · first clear | UI (English) |
| result | +12 Neon · medals | UI (English) |
| result | 36 PERFECT hits (you: 0) | UI (English) |
| result | ACT I · Stage 1 clear | UI (English) |
| result | BORING | UI (English) |
| result | BRONZE ACHIEVEMENT | UI (English) |
| result | DASH | UI (English) |
| result | EMP | UI (English) |
| result | FIRST RUN | UI (English) |
| result | FUN | UI (English) |
| result | First Light | UI (English) |
| result | Get the drive out of the bank towers before Kronos locks them. | UI + proper noun |
| result | HULL | UI (English) |
| result | How did this run feel? (optional) | UI (English) |
| result | NO HIT | UI (English) |
| result | NO LEAK | UI (English) |
| result | Neon | UI (English) |
| result | No hull lost | UI (English) |
| result | PULSE SPREAD LV2 | UI (English) |
| result | RETRY | UI (English) |
| result | Ready in Garage: | UI (English) |
| result | SAME AGAIN | UI (English) |
| result | SPEED CLEAR | UI (English) |
| result | STAGE CLEAR · ZENTRAL-ICE down · +1000 | UI + proper noun |
| result | STORY · CHAPTER 1/10 | UI (English) |
| result | Score | UI (English) |
| result | Stage clear | UI (English) |
| result | TITLE | UI (English) |
| result | WARNING · something huge is closing in | UI (English) |
| result | · 11 Neon | UI (English) |
| settings | AUDIO | UI (English) |
| settings | Aim assist | UI (English) |
| settings | Assist | UI (English) |
| settings | Auto-fire | UI (English) |
| settings | Blue-orange | UI (English) |
| settings | Button size | UI (English) |
| settings | CONTROLS | UI (English) |
| settings | Classic only | UI (English) |
| settings | Colour theme | UI (English) |
| settings | DATA | UI (English) |
| settings | DEFAULTS | UI (English) |
| settings | DISPLAY | UI (English) |
| settings | DISPLAY / COMFORT | UI (English) |
| settings | DONE | UI (English) |
| settings | Difficulty | UI (English) |
| settings | Easy | UI (English) |
| settings | Effects volume | UI (English) |
| settings | Flash intensity | UI (English) |
| settings | Full | UI (English) |
| settings | GAME | UI (English) |
| settings | GAMEPLAY | UI (English) |
| settings | Hard | UI (English) |
| settings | High | UI (English) |
| settings | Large | UI (English) |
| settings | Left | UI (English) |
| settings | Legend | UI (English) |
| settings | Master | UI (English) |
| settings | Medium | UI (English) |
| settings | Minimal | UI (English) |
| settings | More | UI (English) |
| settings | Music mix | UI (English) |
| settings | Music volume | UI (English) |
| settings | Neon | UI (English) |
| settings | New only | UI (English) |
| settings | Normal | UI (English) |
| settings | Particles | UI (English) |
| settings | Quality | UI (English) |
| settings | Reduced | UI (English) |
| settings | Right | UI (English) |
| settings | SETTINGS | UI (English) |
| settings | Screen shake | UI (English) |
| settings | Sensitivity | UI (English) |
| settings | Small | UI (English) |
| settings | Terminal | UI (English) |
| settings | Text size | UI (English) |
| settings | Touch layout | UI (English) |
| settings | Very hard | UI (English) |
| settings | save · backup · lab · tutorial · extras › | UI (English) |
| settings | speed · bullets · hull · timing › | UI (English) |
| settings-assist | +120 ms | UI (English) |
| settings-assist | +60 ms | UI (English) |
| settings-assist | ASSIST | UI (English) |
| settings-assist | Adds a white halo to enemy bullets. Never marks a run. | UI (English) |
| settings-assist | Assist | UI (English) |
| settings-assist | Assist makes the game easier. A run with World speed, Enemy bullets, Extra hull or Beat window on is | UI (English) |
| settings-assist | Beat window | UI (English) |
| settings-assist | Big bullets | UI (English) |
| settings-assist | Calm mode | UI (English) |
| settings-assist | Calmer effects. Never marks a run. | UI (English) |
| settings-assist | Colour-blind palette | UI (English) |
| settings-assist | DEFAULTS | UI (English) |
| settings-assist | DONE | UI (English) |
| settings-assist | Deuteranopia | UI (English) |
| settings-assist | Draws enemy bullets bigger. Never marks a run. | UI (English) |
| settings-assist | Enemy bullets | UI (English) |
| settings-assist | Enemy bullets fly slower. Marks the run ⓐ. | UI (English) |
| settings-assist | Everything counts | UI (English) |
| settings-assist | Extra hull | UI (English) |
| settings-assist | High-contrast bullets | UI (English) |
| settings-assist | Loose | UI (English) |
| settings-assist | Normal | UI (English) |
| settings-assist | Protanopia | UI (English) |
| settings-assist | Reduced motion | UI (English) |
| settings-assist | Show hitbox | UI (English) |
| settings-assist | Shows a small white dot on the ship, at the spot that can be hit. Never marks a run. | UI (English) |
| settings-assist | Slower | UI (English) |
| settings-assist | Slowest | UI (English) |
| settings-assist | Slows the whole game down: enemies, bullets and scrolling. Marks the run ⓐ. | UI (English) |
| settings-assist | Start every run with 2 more hull. Marks the run ⓐ. | UI (English) |
| settings-assist | Tight | UI (English) |
| settings-assist | Tight asks for exact taps, Loose forgives them. Never marks a run. | UI (English) |
| settings-assist | Timing window | UI (English) |
| settings-assist | Widens the beat window for a PERFECT, on top of Timing window. Marks the run ⓐ. | UI (English) |
| settings-assist | World speed | UI (English) |
| settings-assist | ‹ Settings | UI (English) |
| settings-more | 0 ms | UI (English) |
| settings-more | Audio | UI (English) |
| settings-more | BUILD | UI (English) |
| settings-more | Beat cue | UI (English) |
| settings-more | CHECK FOR UPDATE | UI (English) |
| settings-more | COPY CODE | UI (English) |
| settings-more | DEFAULTS | UI (English) |
| settings-more | DELETE | UI (English) |
| settings-more | DONE | UI (English) |
| settings-more | Data | UI (English) |
| settings-more | Display | UI (English) |
| settings-more | Ducking | UI (English) |
| settings-more | EXPORT FILE | UI (English) |
| settings-more | Empty | UI (English) |
| settings-more | FPS cap | UI (English) |
| settings-more | FPS counter | UI (English) |
| settings-more | Full | UI (English) |
| settings-more | Glow | UI (English) |
| settings-more | IMPORT CODE | UI (English) |
| settings-more | IMPORT FILE | UI (English) |
| settings-more | Keep music playing when paused | UI (English) |
| settings-more | LOAD | UI (English) |
| settings-more | Large | UI (English) |
| settings-more | Last backup: never | UI (English) |
| settings-more | Last saved: 10/31/2026, 2:27:19 PM | UI (English) |
| settings-more | Last saved: 10/31/2026, 2:27:36 PM | UI (English) |
| settings-more | Latency | UI (English) |
| settings-more | MORE | UI (English) |
| settings-more | Medium | UI (English) |
| settings-more | More | UI (English) |
| settings-more | Music reacts | UI (English) |
| settings-more | Mute all | UI (English) |
| settings-more | OPEN LAB | UI (English) |
| settings-more | REPLAY TUTORIAL | UI (English) |
| settings-more | Reduce repetitive sounds | UI (English) |
| settings-more | Rhythm | UI (English) |
| settings-more | SAVE | UI (English) |
| settings-more | Save | UI (English) |
| settings-more | Save / Load | UI (English) |
| settings-more | Scan lines | UI (English) |
| settings-more | Small | UI (English) |
| settings-more | TAP CHECK | UI (English) |
| settings-more | build ac0d7ee4d3 · 2026-10-31 14:27 UTC | UI (English) |
| settings-more | sprites on / music pack on / lessons on / classes on / on-foot on / street stage on / fever on / fla | UI (English) |
| settings-more | ‹ Settings | UI (English) |
| story-card | 1 · FIRST RUN · Deliver the data. Stay alive. | UI (English) |
| story-card | BRONZE ACHIEVEMENT | UI (English) |
| story-card | DASH | UI (English) |
| story-card | Dispatcher, the voice in your ear | UI (English) |
| story-card | EMP | UI (English) |
| story-card | FLIGHT | UI (English) |
| story-card | Frankfurt am Main · 2099 · Courier run | UI + proper noun |
| story-card | HULL | UI (English) |
| story-card | LAB | UI (English) |
| story-card | MAINHATTAN | UI + proper noun |
| story-card | NIGHTRUN | UI (English) |
| story-card | ODA | UI + proper noun |
| story-card | ON FOOT | UI (English) |
| story-card | SETTINGS | UI (English) |
| story-card | SKIP | UI (English) |
| story-card | Saved | UI (English) |
| story-card | Short and Sweet | UI (English) |
| story-card | The drop is inside the Zeil underpass. No sh | UI + proper noun |
| story-card | tap to continue | UI (English) |
| title | FLIGHT | UI (English) |
| title | Frankfurt am Main · 2099 · Courier run | UI + proper noun |
| title | LAB | UI (English) |
| title | MAINHATTAN | UI + proper noun |
| title | NIGHTRUN | UI (English) |
| title | ON FOOT | UI (English) |
| title | SETTINGS | UI (English) |
