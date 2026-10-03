# Brief for building a board game for the Game Night Shelf (read fully before starting)

The user wants **the real game**: full rules including the listed expansions and variants. Simplify the interface, never the game.
The reference build is **Sands of Qamar** (Five Tribes) in `SP/ft/`. Copy its structure and test scripts and adapt them.
SP = games-src

## Hard rules
- **Copyright.** Mechanics, numbers and structure copy exactly. The game title, names, card texts and art are **original**: rename everything, and draw everything yourself in code (Three.js meshes, canvas, SVG).
  - Never put real card texts in the page.
  - Keep your research files with the real names in your folder only.
- **Page file.** One self-contained HTML file.
  - Build it with a `build.py` like `SP/ft/src/build.py`. It inlines the shell, Three.js from `SP/node_modules/three/build/three.min.js` (same trimming trick) and your scripts.
  - It also writes `x.js` for `node --check`.
- **Board-first layout** (the user's explicit request: no scrolling, nothing covering the board, closable popups):
  - Use the shared shell: copy `SP/ft/src/shell.css` and `shell.js`, and read `SP/shell/SPEC.md`.
  - Structure: `.gx-app` > `.gx-bar` (title plus buttons with `data-gx="<drawerId>"`), then `.gx-main` > `.gx-board` (the 3D canvas `#c3`, plus a hidden 2D fallback), then the in-flow `.gx-dock` (what to do now).
  - Drawers (`.gx-drawer`) hold the log, player sheets, card list and rules. They close with ✕, Esc, or a click on the scrim.
  - The page never scrolls at 1366×768, 1920×1080, 768×1024 and 390×844.
  - The dock is visible whenever a human must decide (call `GX.showDock()`).
  - Hide `.gx-bar .gx-ibtn>span` labels under 640px.
  - Add `[hidden]{display:none!important}`: a `display:flex` rule on a hidden element once covered the whole 3D board.
- **Card and token list in the system.** The user explicitly asked for this.
  - Add a `refd` drawer that lists every tile, card, token and scoring table with counts and plain-English effects.
  - Also write `dump_ref.js` that writes `SP/ref_<slug>.json`: an array of `{s: section, n: name, tags: [..], t: text, c: count|null, sub: []}`. See `SP/ft/dump_ref.js`. I add it to the shared reference page myself.
- **Players and modes.**
  - A computer player for every seat, with easy, normal and hard levels.
  - Human vs computer, hot-seat (any mix), and watch-computer mode.
  - All state is in one JSON-safe object `G`. No functions in `G`: pending questions are `{h: handlerKey, d: data}`, as in `QH` in `SP/ft/src/engine.js`.
  - Provide `validMoves(seat)`, `performMove(move, seat)`, `sideToAct()`, `checkInvariants()` and `render_game_to_text()`.
  - Test hooks: `AIDELAY`, `ANIM`, `setSeed`, `newGame`, `G.over`, `G.winText`, `UI.sim`.
  - Save to localStorage, with every access in try/catch.
- **Look.** A 3D scene (Three.js r158, toon or standard materials, soft shadows) in an art direction that fits the theme. Pick it yourself and make it beautiful, not grey boxes.
  - The camera fits the whole board for any aspect ratio (see `fitDist` in `SP/ft/src/three3d.js`).
  - Legal targets glow clearly: a bright outline or ring, not a faint emissive.
  - Use readable in-scene labels where they help.
  - Warm fonts from Google Fonts only.
  - Synthesized Web Audio sound: effects plus optional music.
- **Explain the game as it is played.**
  - The dock always says what the game is waiting for, in plain words, with buttons for every option.
  - The rules drawer is written in your own words.
  - Show a score breakdown at the end.

## Tests you must run and pass (adapt the scripts in `SP/ft/`)
1. `gauntlet.js`: computer vs computer at every player count and every expansion combination, 0 errors, 0 stalls, and sensible scores and game lengths.
2. `cover.js`: mixed AI and random play. Show that every card, tile, power and scoring rule actually fires, with `checkInvariants` after every move. The invariants include component conservation: every tile or card is counted exactly once.
3. `click.js`: jsdom, playing only through the page's buttons and tiles, in several configurations including all-human hot-seat and every expansion, with 0 errors. jsdom has no WebGL, so the 2D fallback map must be clickable.
4. `lay.js`: Playwright with real WebGL, at the 4 sizes.
   - `PW=$(npm root -g)/playwright`
   - Launch args `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`, and `setDefaultTimeout(150000)`, because the machine is slow.
   - Must end with PROBLEMS 0: no scroll, the board uncovered (use `elementFromPoint` on a 5×5 grid), every popup opens and closes, and the dock is visible on decisions.
   - Save screenshots into `shots/` and **look at them** with the Read tool. Fix anything ugly, clipped or overlapping.
5. `node --check x.js` after every build.

Any single command is killed after about 5 minutes. Run long jobs in the background, write their output to files, and read the files afterwards.

## Lessons from earlier bugs
- **Phase and step names drift.** A power once checked `G.phase==='move'` while the real phase was `'turn'`, so it never fired. The coverage test is what caught it.
- **Conserve components.** A paid card was not returned to the discard pile, and a Mystic card was double-returned. Test conservation.
- **No closures in `G`.** A question with `run:()=>` closures breaks save/load and JSON: use handler keys.
- **Load order.** Something defined in a later script must not be used at load time by an earlier one.
- **Stalls.** When a player cannot legally do anything (for example cannot pay), the rules usually say what happens. Implement that, and list it as an assumption if the rules are unclear.

## Deliverables (do NOT publish, commit or touch `SP/suite` or the git repo; I integrate)
- The built HTML in your folder.
- `rules-notes.md`: components with counts, the turn, scoring, each expansion or variant, and **a list of assumptions** where sources disagreed or were missing.
- The test scripts and their outputs.
- Screenshots.
- A short report: what is included; the test numbers (gauntlet win split per seat, game length, scores); the coverage list; the layout results; known gaps.
