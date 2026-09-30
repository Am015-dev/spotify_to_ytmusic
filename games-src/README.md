# Game Night Shelf: source

This folder holds the source for the games in `../games/`. Each game is built into one self-contained HTML file, which you then copy into `../games/<game>/index.html`.

## Setup

```sh
cd games-src
npm install                   # three@0.158 (inlined into builds), jsdom (headless tests)
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

## The shelf and the reference page

- **Shelf:** `suite/src.html` is the source of the Game Night Shelf.
  - `../games/index.html` is the same page without the two Mainhattan entries; those games live elsewhere. The entry snippets are in `mh_entry.txt` and `od_entry.txt`.
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
