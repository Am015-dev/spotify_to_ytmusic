# The Thornbound Throne: UI report

Built file: `game/thornbound.html` (single file, ~0.84 MB: shell, PerfHUD, TBKit, data/engine/ai, GameAudio + the Thornbound audio pack, UI). Sources: `game/src/{head.html,body.html,ui1..ui6.js}`; `python3 build.py` joins `ui1..6` into `src/ui.js`, writes `thornbound.html` and `x.js` (for `node --check`).

## What the player sees
* **Map first.** TBKit map with the 6 real locations (3 regions x 2, no adjacency) plus the throne. Each region is a dashed panel with its two locations and one card strip for the region (the kit slots are moved from the region's first location to the strip; the second location's slots are hidden). Heralds (dimmed at court until placed), influence tokens on the track, round banner, +1/+2 reward coin on each location, Favour disc marker, clash-order markers I/II/III, Supporter counters. Locations are tappable (hit area ~196 x 140 units, 70+ px on a phone); tap a location or a strip -> pop-up; tap the throne -> Great Road, Councils, Favour, order.
* **Dock** (right column on desktop, under the board in portrait phones, right rail in landscape): round roadmap (7 steps), the ONE decision now (recommended option starred with a "why"), hand fan (tap -> enlarged card pop-up with full text, actions, recommended why), rival chips (influence, cards, Favour; tap -> info pop-up).
* **Guided steps:** bids (suggested button + hand), Great Road resolution (kingdom cards with rules text), Herald (tap map location -> reward pop-up -> "Place my Herald here"), face-down cards (tap a hand card or a location -> region/card choice), Spring/Day/Autumn action menus (Supporters as 1..n buttons per region), clash order, clash result cards (kit `clashPanel` flip + map `revealSlots`, strengths, winner, log lines, Influence deltas), location claim, councils/sel/pick questions generically, end-of-round summary, game over.
* **One card at a time:** bids revealed, each clash, round summary, coach tips ("Full tips" guide), hot-seat pass screen, game over. Nothing stacks.
* **Modes:** vs computer (2-4 players, own side, easy/normal/hard per computer), hot-seat with pass-the-device (hand/face-down cards only for the holder; the pass screen shows no hand), watch computers (pause/step/speed), guided first game (2 players, short, easy computer, full tips), rules drawer in our own words, log, "My board and piles" drawer, menu (guide level, speed, sound, music, graphics, PerfHUD buttons, save now, credits), autosave + Continue.
* **Sound:** `audio-data.js` (key `tbt`): click, place, flip, clash, win, influence, herald, bid, fanfare, lose; synth fallback. `bell`/`tense` are mapped (`SFXMAP`, `musicFor`) but not yet triggered at round start (see gaps).
* **Hidden info:** every render uses `TB.stripView(G, holder)`; hand cards and my own face-down cards carry `data-owner` + `data-up="1"`; the clicker asserts none belongs to another seat or shows during a pass screen.

## Test hooks
`ANIM`, `AIDELAY`, `newGame('me'|'hot'|'ai'|'guided', {np,length,levels,seed})`, `G`, `UI` (`UI.card`, `UI.pop`, `UI.holder`, `UI.guide`), `pump()`, `humanMove(k)`, `viewSeatForQ()`, `MAP.m` (kit map), `setSeed/setAiSeed`.

## Engine adapter (no engine edits)
`hookEngine()` wraps `TB.internal.AG` handlers (`roundStart, bidReveal, clashReveal, clashTally, regionDone, cleanup`) to queue UI events (bids, clash results, round summary). If the engine renames these handlers the cards silently stop appearing (warning only). AI: `TB.AI.choose(G,seat,level)`; "recommended" = the Hard AI's move for the human (Normal when ANIM=0, for speed).

## Tests (this box, 4 shared cores, one size at a time)
* `lay.js` 1366x768, 1920x1080, 768x1024: PROBLEMS 0 each (no scroll, 6 locations + throne hit-test to the map, dock visible, popups/drawers open+close by Esc, hot-seat pass screen shows no hand). Map share: 0.48 / 0.50 / 0.32 of the screen (710 / 1022 / 504 px square; 768x1024 uses the shell sheet under the board).
* `lay-phone.js` 390x844 (board 390), 844x390 (390), 360x740 (360), 740x360 (360): board = 1.00 of the short side; PROBLEMS 0 on 390x844, 844x390, 360x740 (final run); 740x360 see report. A full guided round by touch only (taps on map locations, hand cards, pop-ups), no scroll, tap targets >= 44 px, text >= 13 px, pop-ups never over the board, 0 console errors.
* `click.js` (jsdom): configs 0-9 (guided, me 3p/4p, hot 2p/3p, watch 4p, PHONE me/hot/guided, 2p extended hard): 0 errors, 0 hidden-info violations, every game reaches the end card.

## Known gaps
* Nobody tested on a real phone. Swipe/long-press not used; only taps.
* Round `bell` and `tense` music not triggered automatically; audio balance not auditioned.
* Day-step results for human-visible mid-clash steps are shown as a recap line, not as a flip panel (the flip panel appears when the clash ends).
* Generic questions (castle Govern etc.) list one button per option; long lists scroll inside the dock.
* The map is always square (letterboxed on wide desktop screens); region strips use 44x62-unit kit slots (about 17 px on a phone), so card detail is read in the region pop-up.
* Map slots show the clash total, not each card.
* Online play, solo (the Sim) not built.
