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
Goal: EVERY shelf game gets story mode and works on a phone in portrait, landscape and after rotating
(skip Mainhattan/Overdrive and Ticket to Ride).
- Done: Sunglaze (`sunglaze-next`) and Cauldron Fair (`cauldron-fair`) have story mode and the rotation fix, both live
  on their previews. Shipwreck Isle (`shipwreck-isle-next`) has story mode.
- In progress: one-round fixes on Sunglaze (hint, rival scoring, no-fit kilns) and Cauldron Fair (big explosion,
  rival brew, one after-round screen), each with its own `sweep.js`; `games-src/scripts/phone-check.js` (all games,
  portrait/landscape/rotation, no AI) → `phone-check-results.md`.
- Next, 2 helpers at a time, one game each = rotation fix (pattern in CLAUDE.md) + story mode wiring
  (template: `games-src/azul/game/src/campaign.js`, `games-src/cauldron-fair/src/ui8.js`, `games-src/shell/CAMPAIGN.md`);
  deploy to the preview only after phone-check passes:
  1. games failing phone-check that already have `campaign.json` (final-approach, hollowbough, kaiten, lantern-dive,
     short-fuse, thornbound, tidewake, carc, ft, kot, munch, xw);
  2. the rest of those;
  3. games with no campaign yet (write `campaign.json` + `CAMPAIGN-DESIGN.md` first).

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
