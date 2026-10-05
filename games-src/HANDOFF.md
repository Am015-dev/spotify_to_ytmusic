# Handoff: start a new session from this file

Repo `Am015-dev/spotify_to_ytmusic`, branch `alex/brave-carson-rbpmlk` (never merge to main). The site is
published from `games/` at https://am015-dev.github.io/spotify_to_ytmusic/. Private research lives in
`Am015-dev/game-night-private` (never copy it into the public repo).

## Standing rules
- Never write an original game's, publisher's or designer's name in the public repo or the site. No model names
  in files or commits.
- A live game is replaced only after the owner OKs a preview (`games/<slug>-next/` or `thornbound-new/`).
- Don't edit the Mainhattan / Overdrive games; other sessions own them. Ticket to Ride is on hold.
- Read the root `CLAUDE.md` (lessons learnt + cost rules), then `games-src/BRIEF-2d-games.md`.

## NOW (5 Oct, end of day) — start here
Start a FRESH session on **Sonnet** with this prompt (typed by the owner):
> Owner authorisation: commit, merge and push to `alex/brave-carson-rbpmlk` and deploy games that pass their checks live.
> Follow games-src/HANDOFF.md and games-src/PLAYBOOK.md. Finish the pending games, two workers at a time, all on Sonnet.

Finished games go LIVE once `phone-check.js <slug>` passes 6/6 (rerun once if it fails; a repeat failure is real).
- **Live with story mode + phone fixes:** sunglaze, cauldron-fair, doorkick-dungeon (incl. its board-first branch),
  thornbound (redesign), lantern-dive, kaiten-kitchen, final-approach (readable rework), shipwreck-isle, hollowbough.
- **Pending, in order:**
  1. tidewake: story mode + GXV done in source (`games-src/tidewake/game/tidewake.html`), but taps are ~1 s slow after
     rotation (phone-check fails twice). Fix the slow relayout, then deploy.
  2. kaiten-kitchen: merge `origin/board/kaiten-kitchen` (board-first work never merged; conflicts in game/src/ui8.js,
     ui.js with the story-mode ui8.js: rename one), rebuild, deploy.
  3. crown-city-smash: merge `origin/board/crown-city-smash` (conflict in games-src/kot/build.py with the shared-shell
     migration), then story mode.
  4. nebula-aces: board-first branch is merged now; add story mode, fix "portrait start" phone failure.
  5. shipwreck-isle: owner says it still has the old narrative-text style. Board-first rework like final-approach
     (board ≥60% of portrait, one 8-word line, no text panels, round results animated on the board).
  6. short-fuse, rampart-and-vine, sands-of-qamar: story mode (+ phone fixes for short-fuse, sands-of-qamar).
  7. Faster loading for every game (recipe B): show the board first, lazy-load three.js, audio and portraits.
  8. final-approach: some slot labels overlap their P/C badges.
- 14 stale local shell.js/shell.css copies (kot, xw, ft, carc, rc, azul, munch) are unused; deleting them was blocked
  for sessions, the owner can delete them.
- The owner should add the allow rules listed in the last session's runbook to `.claude/settings.json` (sessions
  can't); then deploys never stall.

## Where things stand (4 Oct 2026)
- **Thornbound** is the quality pilot. It has blind playtests (`games-src/thornbound/playtest-1/`) and the spec
  `games-src/thornbound/CLARITY-PLAN.md`. A redesign is being built into `games/thornbound-new/`. Next: run 3 NEW
  blind testers with `games-src/scripts/drive-serve.js` against the acceptance bar in the plan; iterate; then
  show the owner.
- **Previews waiting for the owner:**
  - hollowbough-next (with the shared kit)
  - kaiten-kitchen-next
  - crown-city-smash-next
  - final-approach
  - cauldron-fair
  - lantern-dive
- **Shared kit:** `games-src/shell/gx-kit.js` (reference drawer, settings, undo, recap, stats). The guide is
  `games-src/shell/GX-KIT.md`.
- **Kit rollout to the other games: PAUSED.** 7 cloud sessions were stopped; their partial work is on branches
  `rollout/*`. Resume only with the clarity standard from Thornbound, one game at a time.
- **Audits:** `games-src/AUDIT-SUITE.md` and each game's `AUDIT-PRODUCT.md`.
- **Shelf:** the 3 new games are not on it yet. To add them, run `games-src/room/add-new-games.py` (covers are
  ready).
- **Art:** the owner will make art with Google Flow later; each game has a prompt list in `ART-PROMPTS.md`.
