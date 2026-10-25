# W246 flow: start / stop / quit / game end (25 Oct 2026)
Test: `GAME_DIR=<dir with index.html> NODE_PATH=$(npm root -g) node games-src/nightrun/qa/flow-test.js` (SHOTS=dir saves pause/over/clear/boss shots; also in smoke.sh).
Drives the real game at 390x763 touch and 1440x860 mouse: FLIGHT -> pause (touch button / P) -> frozen -> RESUME (3-2-1) -> pause -> TITLE -> FLIGHT -> die -> game over -> RETRY -> die -> TITLE -> stage clear -> result -> RETRY -> boss gate -> boss down -> result -> TITLE; also death inside the clear banner, and the iOS "Play full screen" card (shown on title, never covers FLIGHT, gone at runStart). Every button must be >= 44 px, on screen, not covered. 49 checks, all PASS.
## Found and fixed
1. Pause screen (focus mode): RETRY sat alone half width, TITLE full width (hidden SETTINGS button broke the grid). Now RETRY | TITLE share a row under RESUME (menus/focus.js).
2. Clear of the stage went boss -> PIT STOP upgrade shop (10 s timer, HUD drawn over its title, nothing to buy for) -> result. In focus mode a clear now goes straight to the result (story/story.js, ST.tick).
## Checked, not broken
Start, pause, resume, quit, retry, game over, stage-clear and boss result screens: all reachable on phone and PC, buttons >= 44 px. Fullscreen card closes on runStart. Dying inside the clear banner still shows the clear.
## Still open
- Pause has no SETTINGS/mute in focus mode (hidden on purpose); RETRY/TITLE from pause have no confirm.
- Boss kill is entered at ST.bossDown: boss armour (bosses/armour.js) restores hp, so the test does not shoot it.
- smoke.sh: fingerprint fails 9 checks on the base branch too (stale hashes after the ship outline/shadow commits); sprites "hoplite boss arrives" fails, not re-checked on base.
