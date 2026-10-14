# Brief: scenarios for the LAB (one Sonnet worker, several games, one game at a time)
Read first: root `CLAUDE.md` (hard rules: no original game/publisher/designer names, no model names or AI attribution lines, never force-push), `games-src/shell/LAB.md`,
`games-src/shell/gx-scenario.js` (header = the API) and the worked examples `games-src/munch/scn.js` (Doorkick) and `games-src/kot/scn.js` (Crown).
Do NOT run git, never deploy (`--deploy` is the orchestrator's), never edit Mainhattan games.

## Per game (slug, build dir, prefix are in your task line)
1. Make sure the game's `build.py` inlines `scn.js` right after `gx-scenario.js` and BEFORE the game scripts (see munch/build.py; add the `<script src="scn.js"></script>` tag to the page body file too). If the game already has `scn.js`, extend it.
2. Register these scenarios with `GXS.add({id, name, ask, ls, seed, when, setup, checks, group})` (ids EXACT):
   - `<prefix>-board`  (group 'Board')  the start board of a fresh game, no menus; checks: board visible, fills the screen (>55 % portrait), main controls visible and not covered, no line of text over 8 words, no sideways scroll.
   - `<prefix>-zoom`  (group 'Cards')   the big card / piece / tile zoom open on one real item; checks: it is visible, its name and text readable (>= 12 px), a tap closes it.
   - `<prefix>-help`  (group 'UI')      the Help / rules / lightbulb opened (use the game's own help API, see its hlp / gx-help usage); checks: visible, readable, closes.
   - `story-scene` already exists (shared, from gx-campaign.js): do nothing for it.
   - One scenario for EACH item of the game's newest What's new entries (`python3 games-src/scripts/set-scn.py <game-id> --list`): build the exact moment that item talks about (e.g. "buttons keep their labels" -> the screen with those buttons, `text` checks on each label). Several items may share one scenario; items that are not visible (music, rules text) point at the closest scenario (board / help). EVERY item of the newest 4 entries gets a scenario (lab-test needs at least one). Point each item at its scenario: `python3 games-src/scripts/set-scn.py <game-id> <date> 3=<scn-id> 4=<scn-id>` (only this script edits games/updates.json).
   Give every scenario an `ask` of 8 words or fewer and a `group` (Board, Cards, Story, Bosses or UI). Seed it. `ls: {...}` to skip first-run tutorial offers (copy how Doorkick/Crown do it). Use `GXS.wait` instead of fixed sleeps. Checks use REAL taps where an action is tested (`kind:'tap'`).
3. Run `python3 games-src/scripts/build-all.py --quick --out /tmp/claude-0/stage-<slug> <slug>` (your own --out folder; it builds, runs phone-check, scenarios at 390x763 / 375x553 / 1366x768, lab-test, and a quick sweep; about 3 min). It must print PASS. To iterate on one scenario faster, build once, then
   `cd games-src && GX_STAGE=/tmp/claude-0/stage-<slug> SCN_SLUGS=<slug> node_modules/.bin/playwright test --project=phone -g <id>` (private server over that folder). A script error: fix the script, never rerun blindly. A real game bug found by a check: fix a one-liner, otherwise report it (never weaken a check to hide it).
4. Report per game in under 60 words: scenario ids, PASS/FAIL line, anything weak. Stop after your games.
