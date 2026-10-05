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

## NOW (5 Oct, evening) — start here
Same owner prompt as before (commit, merge, push to `alex/brave-carson-rbpmlk`, deploy games that pass, two Sonnet workers).
Commits carry NO attribution lines. If `/dev/null` is a symlink (`ls -la /dev/null`), phone-check cannot run: a fresh session fixes it.

- **Live this session:** kaiten-kitchen (board-first merged with story mode), tidewake (story mode; "Skip to my turn" instant).
- **Pending, in order:**
  1. nebula-aces: live page is ROLLED BACK to the pre-board-first build (owner: new build loads slowly on iPhone). Source now
     has board-first + story mode + `warm3D()` limited to software GL (the likely slow start). Rebuild, phone-check, deploy,
     ask the owner to time the load on iPhone.
  2. crown-city-smash: board-first merged + story mode wired (`kot/campaign.js`, board-test 21/21). Phone-check fails: L>P
     rotation leaves the full-screen advice card (UI.adv, small X) over the dice; full run takes ~189 s vs 180 s limit
     (reported as "stuck 8s"), slowness unexplained. Fix both, then deploy.
  3. shipwreck-isle: board-first rework done in source (`rc/bf.js`, `bf-test.js`; board 66% / 61% of portrait). Needs
     phone-check, then deploy. Weak: 375x553 camp job list covers the board; landscape unchecked; online keeps old layout.
  4. short-fuse, rampart-and-vine, sands-of-qamar: story mode (+ phone fixes for short-fuse, sands-of-qamar).
  5. Faster loading for every game (recipe B): board first, lazy-load three.js, audio and portraits.
  6. final-approach: some slot labels overlap their P/C badges.
- Workers running phone-check at the same time slow each other down: wait with `while pgrep -f phone-check.js ...` first.
- 35 fully merged branches can be deleted by the owner (sessions get 403 on branch deletes).

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
