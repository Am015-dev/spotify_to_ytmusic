# Testing a game properly

All four layers must pass with 0 errors before delivery. Templates are in `assets/tests/` and `scripts/`.

1. **Gauntlet** (jsdom, `ANIM=0; AIDELAY=0`): computer vs computer at every player count and every expansion combination. Report the win split per seat, game length and scores. Target 0 errors and 0 stalls. Measure a stall as "no change in a signature of `G` for N steps".
2. **Coverage** (`cover.js`): mixed AI and random legal moves, with `checkInvariants()` after every move (component conservation, no negative resources, legal phase). Print a list of every card, power, tile and scoring rule, and whether it fired. Anything that never fires is either a bug or needs a forced scenario test.
3. **Clicker** (`click.js`, jsdom): plays only through `[data-act]`, `[data-opt]` and board elements, in several configurations: solo, all-human hot-seat, watch, every expansion, and with and without animation. The 2D fallback board must be clickable.
4. **Layout** (`lay.js`, Playwright, real WebGL via `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`):
   - Run at 1366×768, 1920×1080, 768×1024 and 390×844.
   - Check that the page doesn't scroll, the board is uncovered (`elementFromPoint` on a 5×5 grid), every popup opens and closes (✕ and Esc), the dock is visible on decisions, and there are no console errors.
   - Save screenshots and **look at them**.
5. **Rules tests** for tricky rules, as named scenarios. Also run forced-card runs (`force.js`) that put every card into play at least once.
6. **Online** (see `online-p2p.md`): the p2p template over a local relay.
7. **Human-like blind playtest** (`scripts/drive-serve.js`, see `board-first-play.md`): the real gate for clarity and fun.
8. `node --check x.js` after every build. The build writes the joined scripts to `x.js`.

## Sandbox tips
- **Use the installed Playwright:** `PW=$(npm root -g)/playwright` and `require(process.env.PW)`. Never run `playwright install`.
- **Serve the page from a fake origin:** `context.route('**/*', r => url.startsWith('https://gns.test/') ? r.fulfill({body: html}) : r.abort())`. This makes it a secure context, blocks Google Fonts (otherwise `load` hangs), and needs no web server; loopback through the proxy returned 405.
- **For live sites,** launch with `proxy:{server:process.env.HTTPS_PROXY}` and `--ignore-certificate-errors`.
- **For logic-only browser tests,** `--disable-3d-apis` makes pages load much faster. The WebGL errors it logs are then expected.
- **For an untouched GPU path,** keep a hook to step the simulation (`__game.at(n)`). Real-time countdowns don't advance at SwiftShader frame rates.
- **Commands are killed after ~5 minutes.** Run long tests with `run_in_background`, or `bash script.sh > out.txt &`, and wait with an until-loop. Never chain sleeps.
- **jsdom lacks `TextEncoder`, `RTCPeerConnection` and WebGL.** Guard every library that touches them at load time.
