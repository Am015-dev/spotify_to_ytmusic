---
name: "game-night-builder"
description: Turn a published board game into a playable single-file browser game with faithful mechanics, original names and art, a computer opponent for every side, and automated balance testing. Use whenever the user gives a BoardGameGeek link (boardgamegeek.com/boardgame/...), names a board or card game and asks to "make it", "build it", "recreate it", "clone it", "make a playable version", or wants a digital version of a tabletop game, even if they don't say "skill" or "board game". Also use when improving, rebalancing or restyling a game built this way.
---

# Board game builder

Build a fun, faithful, playable browser version of a real board game in one HTML file. Prove it works with automated games and layout checks, then put it on the Game Night Shelf.

The single most important lesson: **people want the real game.** Every simplified version ("one unit type, 15 minutes") was called boring. Implement the actual rules from the rulebook, every expansion included. Simplify the *interface*, never the *game*.

The second most important lesson: **players don't read.** They look at the board and touch things. Every game that passed AI reviews with text-heavy docks was called "confusing" and "boring" by the owner on a phone. Make the game playable by touching the board, put the real game's fun moment centre stage, and gate "done" on human-like blind testers. Read `references/board-first-play.md`.

**Read `references/lessons-learnt.md` first**, including the cost rules at the end. It lists every complaint and bug from building nine games for this user, in the order the requests arrived: real rules, then a card list, board-first layout, newcomer guidance, AAA graphics, real audio, a speed tool, free hosting and online play. Build all of it in from the start; retrofitting it later cost far more.

## Workflow

Do the steps in order without stopping to ask permission between them. The user prefers direct execution and a finished result. The only question to ask is the art direction (step 3).

### 1. Research the rules (never from memory alone)
- Use a research agent where possible. It should fetch the BGG page (players, playtime, weight), the official rulebook PDF, the FAQ and errata, and the BGG forum rules threads.
- It writes `rules-notes.md`, with components and exact counts, setup per player count, the turn, every action, end and scoring, and every number. It also writes data JSON (cards, tiles, missions, scenarios) with original names and `ref` fields for the real names, plus `sources.md`.
- It must keep a **Confirmed vs. guessed** section.
- Huge games: keep every system that creates decisions, and cut only bookkeeping. List the cuts.
- Research data with real names or card text stays in a research folder and is never shipped or committed.

### 2. Copyright
Read `references/ip-rules.md`. Mechanics, numbers and structure copy exactly. Names, card text, art and logos are original. Tell the user once, in one line.

### 3. Pick a look once, up front
Ask one question with 3 concrete art directions fitted to the theme, each with a short preview. Then follow `references/graphics-aaa.md` (the AAA tabletop brief) and `references/visual-style.md`. For sound, models, textures and fonts read `references/free-assets.md`. CC0 comes first, CC-BY needs a Credits entry, and NC/ND is never allowed. Log every asset in `ASSETS.md`.

### 4. Build the engine and the page
Read `references/architecture.md`, `references/layout-shell.md` and `assets/briefs/BRIEF-games.md`. The essentials:
- **One HTML file** built by `build.py`. It inlines the shell (`assets/shell/`), Three.js r158 UMD, `assets/perf/perfhud.js`, `assets/audio/gameaudio.js` plus the game's audio data, `assets/net/trystero.min.js` + `netroom.js`, and the game scripts. It also writes `x.js` for `node --check`.
- **State** lives in one JSON-safe `G`, with no functions (pending questions are `{h, d}` handler keys). Expose `validMoves`, `performMove`, `sideToAct`, `checkInvariants`, the test hooks `ANIM`, `AIDELAY`, `setSeed`, `newGame` and `UI.sim`, and a localStorage save wrapped in try/catch.
- **Computer players** for every seat, at easy, normal and hard. Modes: solo vs computer, hot-seat (any mix), watch, and online (`references/online-p2p.md`).
- **Board-first play** (`references/board-first-play.md`):
  - portrait phone first;
  - the board is the screen, and you tap or drag the piece itself while legal targets glow;
  - one line of text, at most 8 words;
  - a ghost finger shows the first move;
  - visible cause and effect, with the computer's moves animated;
  - the real game's fun moment as the centrepiece.
  - The page never scrolls, and popups close with ✕, Esc or a tap outside.
- **Newcomer guidance** (`references/newcomer-ux.md`) only where it doesn't add text over the board: a hands-on guided first game taught in layers, trustworthy suggestions, and the goal and score race always visible.
- **Story mode:** a chapter map, bosses and a difficulty curve (`board-first-play.md`).
- **A card and token reference drawer** listing every component with counts and effects in your own words.
- **3D scene** with a 2D fallback board (used by jsdom tests and software GPUs), plus a Graphics setting (Auto/High/Medium/Low).
- **PerfHUD** (`?fps=1` / F9, Test speed, auto step-down, idle saver) and real CC0 audio with the synth as fallback (`references/audio-perf.md`).

### 5. Test until it holds up
Follow `references/testing.md`:
- a gauntlet of computer vs computer games at every player count and expansion;
- coverage with invariants after every move, where every card fires;
- a jsdom clicker in every mode;
- a Playwright layout check at 4 sizes, plus screenshots **you look at**;
- rules scenario tests;
- online tests over a local relay.
- Use `references/balance-playbook.md` for balance: competitive seats 40–60%, co-ops a target win rate.

Then run a **rules audit** (an agent compares the build with the rulebook) and the **human-like blind playtest** with `scripts/drive-serve.js` (`references/board-first-play.md`). The testers read only the first 8 words of any text and decide in 2 seconds.
- Acceptance: ≤2 lost moments after the first minute, ≤3 dead taps, every tester names an exciting moment, fun ≥4/5, and every tester can state the goal.
- Take a baseline first, then up to 3 rework rounds.
- Click and layout tests passing doesn't mean the game is clear or fun.

### 6. Deliver
Follow `references/delivery.md`:
- publish the artifact;
- add the game to the shelf with a real screenshot cover;
- push the sources (`games-src/`) and the built page (`games/`) so GitHub Pages redeploys;
- check the live URL.

Score honestly against `references/rubric.md`. Reply tersely: what was built, a table of test numbers, the score, what wasn't tested, and how to try it.

## Cost rules (they matter more than speed)
- Work in ONE session with at most 2 subagents. Do 1–2 games per session, finished to the bar.
- Keep the coordinator context small; hand off to a fresh session with a short `HANDOFF.md`.
- No PR subscriptions, polling or scheduled wake-ups unless asked.
- Prove the approach on one game before fanning out.
- Merge your own work and never ask the user to review PRs.
- Publish to a preview path, keep one `previews.html`, and end with **one link** plus before → after numbers.

## Working at scale (only when the user asks for it)
- Write one brief per kind of work and point each agent at it. The templates are in `assets/briefs/`: games, graphics, perf and audio, online.
- Run at most 2–3 heavy agents at once (6 was too costly), and give each its own folder and ports.
- Agents never edit shared modules; they propose patches.
- After a container restart, resume agents with SendMessage; the files survive.
- Verify agent claims yourself before reporting them.

## Iterating on feedback
- The user swears when frustrated. Treat it as a precise bug report and find the real cause: too simplified, ugly, confusing, or stale.
- Rebuild rather than patch when the foundation is wrong.
- Keep old versions. If the work won't fit in one turn, stop at a safe point and say exactly what's next.

## Game-type notes
See "Game families" in `references/architecture.md`: dice-chuckers, map/area control, deck-builders, worker placement, co-ops, hidden information, simultaneous decisions, and co-op deduction (wire-cutting or hidden-hand games), where the AI teammates must reason only from public information.
