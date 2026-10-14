# Playbook: change one place, land in every game

Roles: **Orchestrator** = main model (plans, decides, deploys). **Worker** = Sonnet (builds, fixes). **Script** = no AI.
Read root `CLAUDE.md` first (hard rules, cost rules). A finished game goes straight to `games/<slug>/index.html` once its checks pass (owner, 5 Oct; `-next` previews are retired). Never touch Mainhattan / Overdrive; Ticket to Ride is on hold.

## Iterate fast, check once (two speeds; numbers in `CHECK-SPEED.md`)
- **Iterate with `--quick`:** `python3 games-src/scripts/build-all.py --quick <slug>` = build + stamp + phone-check + the game's scenario tests
  (`?scn=` states, seconds each) + a QUICK sweep (4 games, one rotation). Run it after every small fix. Never run the full sweep to iterate.
- **Go live with `--deploy`:** `build-all.py --deploy <slug>` = the same checks (QUICK sweep; owner, 13 Oct 2026). Add `--full` (full sweep + rotate-test) only for engine/rules changes,
  once, then copies the passing game into `games/`. Run it once, right before going live (not after each fix, not again after a merge unless
  the merge touched your game's logic). `--no-sweep` skips the sweep: only for a change that cannot touch play, and say why in the commit.
- **One shared http server:** build-all.py starts `scripts/gx-serve.js` once and passes `GX_URL` to every check. Sweeps, rotate-tests,
  phone-check and the scenario runner open `GX_URL/<slug>/` with the real media, music and models: never file://, never a per-game route hack
  (fetch errors from file:// were fixed four times by four workers). In a sweep use `const gx = require('../scripts/gx-serve.js'); URL = await gx.url('<slug>', {file: <built html>})`
  and honour `QUICK=1` (4 games).
- **Skin keeps size:** the painted UI skin (`shell/gx-skin.css`, each game's `skin.css`) draws plates with `border-image` / background only
  and never changes an element's width, height, padding, margin, font or border width (`scripts/skin-size-fix.py <skin.css>` does the
  mechanical part). `phone-check.js` fails a game when `GXSK.audit()` finds a button, bar or panel whose box moves by more than 2 px with
  the skin on versus off, and prints which computed property moved.
- **Scenarios ("spawn the requirement only"):** every game registers scenarios in its own `scn.js` (see `shell/gx-scenario.js`,
  worked example `munch/scn.js`): `?scn=<id>` skips menus and tutorial, seeds the RNG, builds the exact state and shows a "Test:" tag;
  `scripts/scn-run.js` (Playwright Test: `node_modules/.bin/playwright test`, config `playwright.config.js`, env `SCN_SLUGS=<slug>`) runs every scenario at 390x763 (`--project=phone`; `phone-s` 375x553 and `pc` 1366x768 with --full) over http. Write a scenario for every owner request
  (it is the repro that stays), put its `ask` line in the What's new entry with `add-update.py ... --scn <id>` so the owner gets "▶ Try this".
  Every game needs at least `<prefix>-board` and `<prefix>-zoom`.

## A scenario must find bugs (owner, 13 Oct 2026: "the lab tests are extremely stupid, not finding any bugs")
"Element visible / text matches / font >= 12 px" passes on a broken game. A scenario counts only if it:
1. **acts with REAL taps** (`{kind:'play', steps:[{sel, until, max}], idle, verify}`: the runner touch-taps, nothing is forced during the action),
2. **asserts the OUTCOME in the engine** in `verify(before, after)` (energy dropped by the cost, the card is in the hand, the market refilled, YOU/MONSTERS moved by the card's value, the winner and the loot are right, on-screen numbers equal the engine),
3. **ends in a valid next state**: `idle()` must become true (no stuck state > 8 s: nothing changing for 8 s fails; the computer's turn completes) and the next turn must start,
4. **is killed by `scripts/scenario-mutate.js`**: it breaks the feature (dead/throwing handler, hidden/covered/shrunk element, off-by-one number, and your own `mut:[{name, js}]` engine mutants: change a cost, skip the refill, swap a score) and the scenario must FAIL on every mutant. A survivor means the scenario is useless: fix it or delete it. Target: >= 90% killed per game, and every scenario needs at least one `mut` unless it only checks looks.
Every scenario also gets these invariants for free (`gx-scenario.js`): no console/page error, no failed same-origin request (404 image/music/model), no text under 11 px / clipped / overlapping, no covered button, no horizontal scroll, every element with `data-engine="G.pl[0].en"` shows that engine value (settles for 5 s), and every glowing legal target (`GXS.glowSel`) answers a real tap. Mark numbers worth proving with `data-engine`. A finding a game cannot fix now goes into `GXS.known` (regex + why) in its `scn.js` AND `HANDOFF.md`, never silently.
Run: `cd games-src && SCN_SLUGS=<slug> node_modules/.bin/playwright test --project=phone` (fast, every build; needs `npm install` in games-src; `-g <scn-id>` for one scenario) and `node games-src/scripts/scenario-mutate.js <slug>` (about 2-4 min a game; run when you add or change a scenario, not on every build). No screenshots.

## Fast delivery (owner, 13 Oct 2026: "better checklists and tests, less playing the game and waiting for hours")
Every change, however small, ships as: **code + scenario + checklist item**, in that order, in one deploy.
1. **Scenario first.** For each requirement in the brief, register a `?scn=<id>` scenario (`games-src/shell/gx-scenario.js`)
   that builds that exact moment directly (no menus, no playing there) with an `ask` line (8 words or fewer) and machine
   `checks`. The scenario is the spec: write it before the fix, watch the scenario test fail, then make it pass.
2. **Iterate with `build-all.py --quick <slug>`** (phone-check + scenario tests + 4-game sweep, minutes). Never run the full
   sweep while iterating.
3. **`--deploy` as soon as the scenarios pass** (no sweep; `--full` only for engine/rules changes). Small batches: 1-3 games per worker, deploy each
   game as soon as it passes; never hold finished games back for the rest of a batch.
4. **Checklist item per scenario:** `add-update.py <game> "headline" "item" --check "what to try" --scn <id>` so the owner
   gets a "▶ Try this" button that opens that moment. The owner tests scenarios, not whole games.
5. **Report** = before/after numbers + the scenario ids. No "play a few games to check" steps for the owner, ever.
6. Hand off at ~150k context tokens with a HANDOFF note; long sessions get slow and expensive (see "Read less" below).

## Read less: code maps, find.sh, guards (owner, 13 Oct 2026)
Workers were re-reading 270-650k tokens of their own context, mostly whole UI files and built output. Now:
1. `games-src/scripts/find.sh --maps` lists each game's `MODULES.md` (generated, not committed; `find.sh --refresh` or any `build-all.py` run rebuilds them).
   It gives every source file in build order with size and purpose, its functions with line numbers, and which later file overrides which function.
2. `games-src/scripts/find.sh <symbol|text> [game]` prints `file:line` and which definition wins. Read only that range.
3. Built html, `x.js` and the joined `ui.js` are git-ignored and skipped by search (`.ignore` files). The numbered `ui1..uiN.js` parts are the real sources.
4. `scripts/guard.py` (every build + `.github/workflows/guard.yml`) stops big non-media files, growth of sources over 120 KB, new override layer files and tracked build outputs.
5. Start every worker session from `games-src/BRIEF-TEMPLATE.md`. Numbers: `games-src/CHECK-SPEED.md` (Tokens).

## The tools (all scripts, no AI)
- `python3 games-src/scripts/build-all.py [slugs] [--out DIR] [--no-check] [--deploy [--suffix -next]]`
  Builds each game with its own build.py, stages `<out>/<slug>/index.html` (default `games-src/.staging/`), stamps the
  copyright, runs `phone-check.js` on the staged files (6 phone scenarios), prints PASS/FAIL per game, and with
  `--deploy` copies only PASSING games into `games/`. `--list` prints every slug and build command. About 35 s per game.
- `node games-src/scripts/phone-check.js <slugs>` (env `GAMES_DIR`, `PC_OUT_DIR`; needs `NODE_PATH=/opt/node-tools/node_modules`).
- `node games-src/shell/test/kit-test.js` tests the shared kit (jsdom).
- Per-game `sweep.js` / `rotate-test.js` (Cauldron Fair, Sunglaze today) play the real page and assert every step.

## Shared files (games-src/shell/): the only place for cross-game code
`shell.js` + `shell.css` (board-first shell, every game), `gx-kit.js/.css` (menu, settings, reference, undo, recap;
see `GX-KIT.md`), `gx-campaign.js/.css` (story mode; see `CAMPAIGN.md`), `gx-viewport.js` (phone rotation/viewport fit).
A game inlines them in its `build.py` from `../shell/` (never a local copy). Game-specific code stays in the game.

## A. New game (orchestrator briefs, one Sonnet worker builds)
1. Orchestrator: pick the game, write a tiny brief (slug, source folder `games-src/<dir>/`, the files to read).
   Research the rules in the private repo only; original names, art and text (skill `boardgame-builder`, `references/ip-rules.md`).
2. Worker: copy the build.py of a shared-kit game (Cauldron Fair; Hollowbough for gx-kit; Lantern Dive for gx-viewport) and
   inline `shell.js`, `gx-kit.js`, `gx-campaign.js`, `gx-viewport.js` and their css from `games-src/shell/`. No local copies.
3. Worker: engine + AI for every side with a headless rules test and a balance sweep (`references/testing.md`, `balance-playbook.md`).
4. Worker: board-first UI (`clarity-briefs/BOARD-FIRST.md`, `references/board-first-play.md`): the board fills the screen, tap the
   piece, legal targets glow, one line of 8 words or fewer, ghost finger, scores pop where earned, the computer's moves animate.
   Make the real game's fun moment the centrepiece. Portrait phone first (390x763, 375x553).
5. Worker: `campaign.json` from day one (chapters, bosses, curve; `shell/CAMPAIGN.md`) and `GXC.init` wired.
6. Worker: copy `cauldron-fair/sweep.js` as the game's `sweep.js` (and `rotate-test.js`), point it at the game, get it green.
7. Script: add the game to `GAMES` in `scripts/build-all.py`; `build-all.py <slug>` must print PASS (phone-check).
8. Optional: ONE blind tester on `scripts/drive-serve.js` (Sonnet) only to rate fun/clarity. Never for bugs.
9. Orchestrator: `build-all.py <slug> --deploy` → live at `games/<slug>/`; push; check the live page. Then the owner plays it
   and their bug reports go into recipe C.

## B. Improvement for ALL games
1. Worker (one): change `games-src/shell/*` once. Run `kit-test.js`. Keep every existing call working (opt-in).
2. Script: `build-all.py` (all games, staged). Read the PASS/FAIL list.
3. Orchestrator: `build-all.py --deploy` (live). Only PASSING games move; push; check the live pages.
4. Failing games: one Sonnet worker per game, brief = slug + the failing line + files. Fix in that game, rebuild just that slug,
   then deploy it the same way.
5. Games still on stale shell copies (see Migration) will NOT get the change until migrated: do the migration first.

## After every live deploy
After every live deploy, run `python3 games-src/scripts/add-update.py <game-id> "headline" "item" ["item"...] --check "what to try"` with 1-5 plain-words items; the shelf's What's new panel shows them to the owner.
To-make list for the laptop (missing + facelift + look-check, with prompts): rerun `python3 games-src/scripts/next-wave.py` after look-check and after wiring-status; it writes `games/next-wave.html`, `games-src/NEXT-WAVE.md` and the `games-src/next-wave/` prompt files, and refreshes `games/status.json`.
Production waves (poses, 3D and art variety, split into days of at most 380 images; Wave 7, 8, 9 and 3D wave A to E): edit `games-src/scripts/wave7_data.py`, then rerun `python3 games-src/scripts/make-wave7.py` -> `next-wave.py` -> `viewer-plan.py` (prompt files in `games-src/next-wave/`, see its README.md; `viewer-plan.py` puts them in `games/asset-viewer/flow.json` as planned batches; commit the three outputs together).
Versions and what is missing: `python3 games-src/scripts/game-status.py` writes `games/status.json` (version = commits touching `games/<slug>/`, wired/unwired art, still-to-make list). `build-all.py --deploy` and `wiring-status.py` run it; commit the file with the deploy. It feeds the shelf version chips, `games/status.html` and `games/asset-viewer/games.html`.

## C. Bug fix
1. Reproduce with a script first: add a check to `phone-check.js` (if every game could hit it) or the game's `sweep.js`,
   and watch it fail. It stays in the repo so the bug cannot come back.
2. Fix it in `games-src/shell/` if the bug is in shared code, otherwise in that game only.
3. `build-all.py <affected slugs>` (all slugs if the fix is in shell/).
4. Check: the new check passes and phone-check says PASS. Then `--deploy` (live), push, check the live page.
   No AI testers for bugs.

## Efficiency rules (from CLAUDE.md)
- Test once, at the end: iterate with `build-all.py --quick <slug>`, then `--deploy <slug>` (no sweep; `--full` only for engine/rules changes). After merging origin, run only `--quick` unless the merge touched your game's logic. Never run the full sweep twice in a row; never restart a full sweep just because origin moved (owner, 8 Oct 2026: "extremely slow").
- One worker per game, a tiny brief that names the files; reports under 150 words; at most 2 subagents at once.
- Always set the model: orchestrator on main, workers on Sonnet, plain copying/downloads on Haiku. No new cloud sessions.
- Scripts do the checking (build-all, phone-check, sweep); AI testers only for new-game blind tests, never for bugs.
- Keep the orchestrator session short: plan, dispatch, review the PASS/FAIL table, deploy. Don't read big files; use ls/grep/head.
- No PR subscriptions, polling or wake-ups. Merge your own work (`git fetch origin alex/brave-carson-rbpmlk && git merge`, never force-push).
- Hand off with an updated `games-src/HANDOFF.md`. End with ONE link plus 5 lines (before -> after, what is weak).

## One-off migration: stale local copies -> shared files
State on 5 Oct (15 games): 8 inline the shared `shell.js` already (cauldron-fair, kaiten-kitchen, final-approach, short-fuse,
tidewake, hollowbough, thornbound, lantern-dive). 7 still read a LOCAL `shell.js` + `shell.css` from their own folder:

| slug | build dir (games-src/) | local copies | note |
|---|---|---|---|
| crown-city-smash | kot | shell.js, shell.css | identical to shared |
| nebula-aces | xw | shell.js, shell.css | identical to shared |
| sands-of-qamar | ft/src | shell.js, shell.css | identical to shared |
| rampart-and-vine | carc/game/src | shell.js, shell.css | identical to shared |
| shipwreck-isle | rc | shell.js, shell.css | identical to shared; gx-campaign already shared |
| sunglaze | azul/game/src | shell.js, shell.css | identical to shared; gx-campaign already shared |
| doorkick-dungeon | munch | shell.js, shell.css | local shell.js is NEWER (drawer `bg()` makes the page behind inert); css identical |

Step 0 (orchestrator or one worker): port munch's `bg(on)` + the two `this.bg(true/false)` calls from `munch/shell.js` into
`shell/shell.js`, run `kit-test.js`; otherwise migrating doorkick would lose that fix and the other games would still lack it.
Then, per game, the exact change in its `build.py` (the loop already does `open(SRC.get(f,f))`, so only the map changes):
- Add `'shell.js': '<rel>/shell/shell.js'` to the game's `SRC` dict (rc/azul/munch already have a `SRC` dict; kot, xw, ft, carc have
  an `SRC` dict or must add one) where `<rel>` reaches `games-src/` (`../` for kot/xw/rc/munch, `../../` for ft/src,
  `../../../` for carc/game/src and azul/game/src).
- Replace the local css read: `open('shell.css').read()` -> `open('<rel>/shell/shell.css').read()`
  (kot and xw read it in their `extra`/`h.replace` lines; munch, rc, carc, azul, ft in their `head.html` replace).
- Delete the local `shell.js` and `shell.css` (`git rm`) so nobody patches a copy again.
- Check: `build-all.py <slug>` prints PASS, and `cmp` the staged page against the previous build (only the shell diff may show).
Then the same for the other shared parts a game is missing: `gx-campaign.js` + `gx-campaign.css` (story mode: missing in
kot, xw, ft, carc, kaiten, final-approach, short-fuse, tidewake, hollowbough, lantern-dive; needs `campaign.json` + `GXC.init`),
`gx-kit.js/.css` (only hollowbough has it), `gx-viewport.js` (only lantern-dive has it; roll out after its worker lands it).
Do the migration as one worker per game (Sonnet), each followed by `build-all.py <slug>`; the games' own css/js stay as they are.

- After a round with new screenshots, run `python3 games-src/scripts/shots-gallery.py`: it rebuilds games/shots.html, the owner's grid of every worker screenshot.

## Look check (does it LOOK right? no AI)
`games-src/scripts/look-check.js` opens every shelf game at 390x763, 375x553 (phone, 3x, touch) and 1366x768 (PC), on the start
screen, the board, mid-game (a few taps on glowing targets), the Help panel and a card hold. It never plays a game. It reports
text under 11 px (phone) / 12 px (PC), contrast under 3:1 measured against the real pixels behind the text, cut-off or overlapping
text, failed fonts, buttons with no visible label / under 40 px / covered, broken, stretched, blurry or hard-cropped pictures,
blank canvases, small boards, overlapping or spilling cards, sideways scroll and console errors. Every finding has a red-boxed crop.
- Run: `NODE_PATH=/opt/node-tools/node_modules node games-src/scripts/look-check.js [--game <slug>] [--sizes phone,small,pc]`
  (one game takes about 100 s; run games one at a time). Output: `games/look/index.html`, `report.json`, `needs-art.json`
  (findings only new art can fix: flat CSS plates, blurry or stretched pictures).
- Gate: `build-all.py --deploy` runs `look-check.js --gate` on each passing game. Only NEW severe findings against
  `games-src/look-baseline.json` block the deploy; everything else is report-only. Skip with `--no-look`.
- After a real fix, re-save the baseline: `look-check.js --baseline --game <slug>`. Scene drivers live in
  `games-src/scripts/look-scenes.json` (a copy of the ones in asset-viewer/screens.html).
- An owner bug report about looks ("can't read it", "button has no label") goes into the fixer's brief first, then run the look check on that game.

## LAB and test mode (owner, 13 Oct 2026)
Every deployed game carries the 🧪 LAB (test mode only; `shell/LAB.md`): build-all inlines `gx-lab-core.js`, `gx-lab.js`, `gx-lab.css` into the staged page, so a game only needs `scn.js`. Per game: `<prefix>-board`, `<prefix>-zoom`, `<prefix>-help`, the shared `story-scene`, and a scenario for every item of its newest What's new entries (`scripts/set-scn.py <game-id> <date> 3=<scn-id>`).
`build-all.py --quick/--deploy` also runs `scripts/lab-test.js` (off = no LAB element; on = LAB lists GXSLIST and every GO passes its checks; pinned checklist -> shelf -> `games/lab.html`), and after a deploy refreshes `games/scenarios.json` (`scripts/lab-index.js`) and `games/lab.html` (`scripts/lab-page.py`). Brief for a scenarios worker: `games-src/lab/BRIEF-scenarios.md`.
