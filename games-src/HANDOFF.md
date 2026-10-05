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

## NOW (5 Oct) — start here
Read `games-src/PLAYBOOK.md` (recipes A new game, B improvement for all games, C bug fix). Finished games go LIVE
(owner's decision; no previews). Goal: every shelf game has story mode and works in portrait, landscape and rotation.
- Live with story mode + phone fixes: Sunglaze, Cauldron Fair, Doorkick Dungeon, Thornbound (redesign).
- In progress: Lantern Dive (also creates the shared `shell/gx-viewport.js`).
- Next, in order:
  1. Migration (playbook "One-off migration"): port munch's newer `shell.js` (drawer inert fix) into `games-src/shell/`,
     then switch the 7 games on stale copies to inline the shared files. After this, recipe B reaches every game.
  2. Recipe B: add `gx-viewport.js` to every game via the shared kit; `build-all.py --deploy`.
  3. Story mode for the 10 games without it (one Sonnet worker each, 2 at a time; adapter templates
     `azul/game/src/campaign.js`, `cauldron-fair/src/ui8.js`); games with no `campaign.json` get one written first.
  4. Phone-check failures to fix: nebula-aces (portrait start), short-fuse, sands-of-qamar, kaiten-kitchen (rotation).
- `phone-check.js` is sometimes flaky at game start ("couldn't start"): rerun once before treating it as a failure.

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
