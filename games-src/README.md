# Game Night Shelf: source

This folder holds the source for the games in `../games/`. Each game is built into one self-contained HTML file, which you then copy into `../games/<game>/index.html`.

After copying a build in, run `python3 scripts/stamp-copyright.py` to add the copyright notice to the page head (it skips pages that already have it). Everything here is all rights reserved; see `../LICENSE`.

## Setup

```sh
cd games-src
npm install                   # three@0.158 (inlined into builds), jsdom (headless tests), trystero + esbuild + ws (online play)
npm install -g playwright     # only for the layout checks and screenshot scripts
```

- Builds need Python 3.
- The Playwright scripts load Playwright from `$(npm root -g)/playwright`.
- Headless Chromium needs `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader` for WebGL; the scripts already pass these.

## Games

| Game | Source | Build (run in the source folder) | Output → copy to |
|---|---|---|---|
| Sands of Qamar | `ft/src/` | `python3 build.py` | `ft/sands.html` → `games/sands-of-qamar/` |
| Crown City Smash | `kot/` | `python3 build.py` | `kot/kot2.html` → `games/crown-city-smash/` |
| Shipwreck Isle | `rc/` | `python3 build.py` | `rc/shipwreck.html` → `games/shipwreck-isle/` |
| Nebula Aces | `xw/` | `python3 build.py` | `xw/nebula.html` → `games/nebula-aces/` |
| Doorkick Dungeon | `munch/` | `python3 build.py` | `munch/doorkick.html` → `games/doorkick-dungeon/` |
| Sunglaze | `azul/game/src/` | `python3 build.py` | `azul/game/sunglaze.html` → `games/sunglaze/` |
| Rampart & Vine | `carc/game/src/` | `python3 build.py` | `carc/game/rampart.html` → `games/rampart-and-vine/` |

- Each build also writes `x.js`, the page's scripts joined together. Run `node --check x.js` after every build.
- Build outputs are git-ignored.
- All seven builds reproduce the files in `../games/` byte for byte.

Each game follows the same structure:
- **Game state:** a single JSON-safe state object `G`.
- **Rules:** `validMoves` / `performMove` / `sideToAct` in `engine.js`.
- **Computer players:** `ai.js`.
- **Rendering:** a Three.js scene in `three3d.js` (Doorkick uses DOM/SVG with `gfx.js`).
- **Interface:** `ui.js`.
- **Shared layout shell:** `shell.js` / `shell.css`.
- **Test hooks:** `AIDELAY`, `ANIM`, `setSeed`, `UI.sim`.

## Tests

Run them from each game's folder unless noted, and read the header of each script for its arguments.

- **Sands of Qamar** (`ft/`):
  - `gauntlet.js`: computer-vs-computer games;
  - `cover.js`: coverage, with invariants checked every move;
  - `click.js`: jsdom clicker;
  - `lay.js`: Playwright layout check;
  - `perf.js`.
- **Crown City Smash:**
  - from `games-src/`: `node scripts/rulestest.js kot/kot2.html`, plus `scripts/gauntlet.js`, `scripts/uiclick4.js`, `scripts/nettest.js` and `scripts/coverage.js`;
  - `kot/layoutcheck.js` (Playwright).
- **Shipwreck Isle** (`rc/`): `rules-test.js`, `force.js`, `gauntlet.js`, `adv-test.js`, `click.js`, `lay.js` (with a `SIZES=` filter), `np.js` (new-player replay with screenshots).
- **Nebula Aces** (`xw/`): `unit.js`, `gxw2.js` (gauntlet), `cover.js`, `coverh.js`, `pwshell.js` (Playwright layout), `pwplay.js`.
- **Doorkick Dungeon** (`munch/`): `rules-test.js`, `cards-test.js`, `force.js`, `gauntlet.js`, `click.js`, `warn-check.js`, `board-test.js` (Playwright), `newcomer.js`.
- **Sunglaze** (`azul/game/`): `gauntlet.js` (or `run_gauntlet.sh`), `cover.js`, `click.js`, `lay.js`.
- **Rampart & Vine** (`carc/game/`): `graph_test.js`, `geo_test.js`, `gauntlet.js`, `cover.js`, `click.js`, `lay.js`.

## Shared audio and speed tool

- **`audio/gameaudio.js`:** the playback module every game inlines. It decodes lazily on the first gesture and falls back to the game's synthesized sounds.
- **`audio/<game>/audio-data.js`:** each game's CC0 or CC-BY sound effects and music as base64 MP3. Each folder also has a `MAP.md` (event to sample) and a `credits.html`.
- **Licence log:** `audio/ASSETS.md` for every audio file, with snapshots of the licence pages in `audio/licence-snapshots/`. `audio/tools/` rebuilds the bundles, but needs the raw downloads, which are not committed.
- **Swapping a sound:** edit `SND_MAP` at the top of that game's `sound.js`. `s:null` goes back to the synth, and `vol` sets the level.
- **`perf/perfhud.js`:** the speed tool. It provides:
  - the overlay (`?fps=1` or F9);
  - Test speed and Copy report;
  - automatic quality step-down and step-up;
  - the idle battery saver.
  
  `perf/INTEGRATE.md` explains how to add it to a game.

## Online play (free, peer to peer)

Every game can be played online with friends without a server:
- **Finding each other:** players meet through public Nostr relays, which only see an encrypted handshake.
- **Playing:** after that, moves go directly between the browsers over WebRTC.

The files:
- **`net/trystero.min.js`:** Trystero 0.25.4 (MIT, see `net/TRYSTERO-LICENSE.txt`), bundled from `net/entry.mjs` with `npx esbuild net/entry.mjs --bundle --format=iife --global-name=Trystero --minify`. The file then gets a one-line guard so it only loads where WebRTC exists (jsdom has none).
- **`net/netroom.js`:** a small room layer with the same shape as the claude.ai room capability. It handles lobby, presence, broadcast, per-peer send, leave on tab close, and stable per-browser ids for rejoining.
- **`<game>/net.js`:** each game's online layer.
  - The host's page runs the rules and the computer players.
  - Clients render what the host sends and send back small move messages.
  - The host checks every move and applies it through the same code path a local player uses.
  - Hidden information (hands, dials, deck order, the random seed) is removed from what each client receives.
  - Each game's `ONLINE-REPORT.md` describes its seat model, simultaneous decisions, host migration and test results.

Tests:
- **Over real WebRTC:** `net/p2p-<game>.js` plays full games between separate Chromium contexts, using a local relay (`node net/relay.js <port>`, started by the scripts).
  - The pages are served from a fake `https://gns.test/` origin, and everything else is blocked.
  - Each script's header lists its options: leave, rejoin, bad moves, host leaving, screenshots.
- **Transport only:** `net/rj.js` checks leave and rejoin.
- Real relays and real networks can only be tested from a normal browser. Some strict networks block direct connections and would need a TURN server, which can be set with `window.NETROOM_TURN`.

## The shelf and the reference page

- **Shelf:** `suite/src.html` is the source of the Game Night Shelf.
  - `../games/index.html` is the same page. The two Mainhattan games (`mainhattan-nightrun/`, `mainhattan-overdrive/`) are built in another project and copied into `../games/` as finished pages; their shelf entries are also kept in `mh_entry.txt` and `od_entry.txt`.
- **Card and token reference:** `refpage/gen.py` merges the `ref_*.json` files into `refpage/reference.html`. Copy that to `../games/reference.html`.

## Not included

- **Research data** with the original games' real names and card texts: rulebook extracts, card lists, BGA and open-source tile data.
- **Scripts that need that data:**
  - `ft/build_data.py`, `rc/build_cards.py` and `kot/extract_bga.py`;
  - `xw/gen.py`;
  - `carc/game/src/gen_data.py` (needs `tiles.json`).
  
  They were only needed once, to generate the data files that are committed (`data.js`, `cards-*.js`, and so on), so you won't need them to change or rebuild the games.
- **Screenshots, test logs and old backups.**

## Briefs

- `BRIEF-games.md`: the standard every new game follows.
- `BRIEF-graphics.md`: the graphics standard.
- `*/GRAPHICS-REPORT.md`: what each graphics pass changed, with test and performance numbers.
- `*/rules-notes.md`: the rules as implemented.
