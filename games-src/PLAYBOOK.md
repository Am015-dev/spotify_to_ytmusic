# Playbook: change one place, land in every game

Roles: **Orchestrator** = main model (plans, decides, deploys). **Worker** = Sonnet (builds, fixes). **Script** = no AI.
Read root `CLAUDE.md` first (hard rules, cost rules). The live `games/<slug>/index.html` changes only after the owner OKs it;
use `--suffix -next` for previews. Never touch Mainhattan / Overdrive; Ticket to Ride is on hold.

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

## C. Bug fix
1. Reproduce with a script first: add a check to `phone-check.js` (if every game could hit it) or the game's `sweep.js`,
   and watch it fail. It stays in the repo so the bug cannot come back.
2. Fix it in `games-src/shell/` if the bug is in shared code, otherwise in that game only.
3. `build-all.py <affected slugs>` (all slugs if the fix is in shell/).
4. Check: the new check passes and phone-check says PASS. Then `--deploy` (live), push, check the live page.
   No AI testers for bugs.

## Efficiency rules (from CLAUDE.md)
- Test once, at the end: one full sweep right before deploy. After merging origin, run only a quick sweep (RUNS=8) unless the merge touched your game's logic. Never run the full sweep twice in a row; never restart a full sweep just because origin moved (owner, 8 Oct 2026: "extremely slow").
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
