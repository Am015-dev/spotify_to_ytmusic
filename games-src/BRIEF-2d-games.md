# Brief: a new 2D card or dice game for the Game Night Shelf (Oct 2026)

Read this whole file before starting, then follow it. SP = `games-src/`. SK = the board-game skill folder
`/root/.claude/skills/synced/a4d6dc18-41a1-407a-8f28-f599cc53a347_c5b95a10-5341-4c72-9d9b-18daf2be6bcc/boardgame-builder`.
Read `SK/SKILL.md` and `SK/references/lessons-learnt.md`, `ip-rules.md`, `layout-shell.md`, `newcomer-ux.md`,
`online-p2p.md`, `audio-perf.md`, `testing.md` and `rubric.md` first. `SP/BRIEF-games.md` is the older 3D brief:
its hard rules still apply, except where this file says otherwise (here the table is 2D PixiJS, not Three.js).

**Reference build: Kaiten Kitchen** (`SP/kaiten/`). It is the newest and best game on the shelf. Copy its
structure, build script, shell use, phone detection, title and setup screens, PixiJS table, art generator,
audio bundle and every test script, and adapt them. Read `SP/kaiten/PLAN.md`, `game/UI-REPORT.md`,
`game/ONLINE-REPORT.md`, `kit/KIT-REPORT.md` and `game/build.py` before you write code.

## What the user wants (in their own words over many rounds)
- **The real game.** Full rules and every mode, variant and scenario in the base box. Simplify the interface,
  never the game. Simplified versions were called boring every time.
- **Fun and good-looking.** They compared our games with a professional adaptation and preferred its painted
  art, cards that visibly fly between places, and calm screens. Kaiten Kitchen's painted table is the answer;
  match or beat it.
- **Phone first.** Most play is on an iPhone. No page scroll, nothing covering the board, popups that close,
  nothing clipped at real phone heights (Safari bars take space).
- **Easy to learn.** A guided first game, a dock that always says what to do now, a "why" on suggestions.
- **Online with friends for free** (P2P over WebRTC, no server), plus hot-seat and computer players.

## Hard rules
- **Copyright.** Mechanics, numbers and structure exactly; title, every name, all card/mission text and all art
  original. Never put the original game's or publisher's name in the shipped HTML (not even "plays like").
  Real names may appear only in `ref` fields of private research data.
- **Research material.** Fetch the official rulebook (PDF) and FAQ, and cross-check with BGG threads. Keep
  rulebooks, FAQs, scans and saved pages ONLY in `/home/user/game-night-private/<slug>-research/` (a private
  repo; I commit it). Never put them in the public repo or the page. Your `rules-notes.md` in your folder is in
  your own words with a **Confirmed vs. guessed** section and exact numbers.
- **One self-contained HTML file**, built by your `build.py` (like `SP/kaiten/game/build.py`), working offline.
  PixiJS: reuse `SP/kaiten/vendor/pixi.min.js` (MIT, keep the licence file credited) exactly as Kaiten embeds it.
- **Shared modules are read-only for you:** `SP/shell/*`, `SP/net/netroom.js`, `SP/net/trystero.min.js`,
  `SP/perf/perfhud.js`, `SP/audio/gameaudio.js`, `SP/phfit.js`, anything in another game's folder. If you need
  a change, write it as a proposed patch in your report. Copy files into your folder if you must fork.
- **Do not touch `games/`** (it deploys live) and don't commit or push; I verify and deploy.
- No model identifiers anywhere. Don't touch the Mainhattan games.

## Must have
1. **Engine** (`src/engine.js`, `data.js`): all state in one JSON-safe `G` (no functions; pending questions are
   `{h, d}`), `validMoves(seat)`, `performMove(move, seat)`, `sideToAct()`, `checkInvariants()` (component
   conservation), `render_game_to_text()`, seeded RNG, save/load in localStorage with try/catch.
2. **Computer players** for every seat at easy / normal / hard. For co-op games the AI must be a real
   teammate that follows the communication limits of the rules (it may not peek at hidden information).
3. **Modes:** vs computer, hot-seat (with pass-the-device screens where information is hidden, never online),
   watch, online (host + join with a code and invite link, the host runs the rules, clients send moves,
   hidden information stripped per seat with a whitelist strip, simultaneous decisions collected per seat,
   leaving seat taken by the computer).
4. **Screens:** painted title (Play / Online / Resume only when a save exists / How to play), setup with a
   one-line summary + Configure on phones, short original story cards and "choose this if you enjoy…" lines
   where the game has characters or roles, a guided first game, rules drawer in your own words, reference
   drawer listing every card/token/mission with counts, end screen with a score breakdown.
5. **Painted 2D table in PixiJS** like Kaiten: an original painted art set made by a re-runnable generator in
   `<slug>/paint/` (SVG painting rasterised to WebP with Playwright Chromium, ≤ ~1.5 MB art), a manifest so
   the user's own images can replace any picture by file name, cards/dice/tokens that fly and re-flow with
   eased motion, small sprite effects, DOM kept for layout, tap targets (≥ 44 px) and accessibility.
   Graphics setting Auto/High/Medium/Low registered with PerfHUD; Low has no filters or particles; fallback
   WebGL → canvas → DOM view, never a blank screen. Write `ART-PROMPTS.md` (Google Flow / ComfyUI prompts
   for every picture, file names, size, transparent background, no text) like `SP/kaiten/ART-PROMPTS.md`.
6. **Audio:** real CC0 samples bundled like `SP/audio/kaiten/` (licence snapshots, ASSETS.md, credits), with
   the synth as fallback, music optional, all off-able.
7. **Phone layout:** the shared `PH` phone detection used by Kaiten (`html.ph`, `?phone=1/0`), safe-area
   padding, the dock as a bottom sheet, nothing clipped. Use `SP/phfit.js` guard in `lay-phone.js`.

## Tests you must run and pass (adapt Kaiten's scripts; report every number)
- `rules-test.js` (a test per tricky rule), `gauntlet.js` (every player count and mode/variant, 0 errors,
  0 stalls, sensible lengths; for co-op games report the win rate per difficulty/mission band),
  `cover.js` (random + AI with invariants after every move; every card/mission/power fires),
  `hidden-test.js` (no hidden info reaches a client or the hot-seat screen it shouldn't),
  `click.js` (jsdom, real buttons only, every mode incl. guided and hot-seat), `lay.js` (1366x768, 1920x1080,
  768x1024, 1100x700), `lay-phone.js` at 390x844, 390x763, 390x664, 375x553, 412x780, 844x390, 750x342
  (0 PROBLEMS each), `px-test.js` (animations finish, sprites match the engine, fallbacks work),
  `net-strip-test.js` and a `SP/net/p2p-<code>.js` + `-phone.js` real WebRTC test on your own relay port.
- Playwright: NODE_PATH `/tmp/claude-0/-home-user-spotify-to-ytmusic/5a36d2af-8697-5203-aeea-a0f2a3329615/scratchpad/node_modules`,
  `executablePath: '/opt/pw-browsers/chromium'`. Run tests from your game folder so shots land in its
  gitignored `shots/`. The machine is slow and shared by other agents: generous timeouts, long jobs in the
  background with output to files (commands are killed after ~5 minutes). Never `pkill -f` a pattern that
  appears in your own command line.
- **Look at your screenshots yourself** (title, setup, guided turn, mid-game, end, at 1366x768, 390x763 and
  844x390) and fix anything ugly, clipped or overlapping. PROBLEMS 0 is not enough on its own.

## Report back
Files, file size, a table of every test with numbers, screenshot paths, what's confirmed vs. guessed in the
rules, what's not done, honest weaknesses (art, AI strength, untested real devices), and proposed patches to
shared modules if any.
