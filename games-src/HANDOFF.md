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

## 10 Oct 2026: painted art + Treblo music wired in 4 games (live)
Nebula Aces, Sunglaze, Tidewake, Crown City Smash. Each has a small `media.js` (Crown: `paint.js`) next to its sources: table skin (3D plane under the grid/board/table; Sunglaze also paints the phone board table), title and end banners (hero strips on the start and result panels), `GXC.init` `artBase`/`endArt`, and music slots.
- **Shared:** `shell/gx-music.js` (`GXMUS.init({key,slots,slot,on,toggle})`: per-screen cross-faded music, Music picker drawer, volume, preview, Shuffle / All songs / Off). `GXC.init({endArt:{win,lose}})` paints the story result screen.
- **Music files:** `python3 audio/tools/music_treblo.py audio/<game>/treblo ../games/<slug>/music --caps tavern=60,main=100,fight=100` (caps keep the decoded loops under ~35 MB each; uncapped loops made the 375x553 sweep time out its coach bubbles). `audio-data.js` lists them as `url:music/...`. Credits now say Treblo.
- **Not wired (no face-down card exists in these games):** `back-*.webp` in Nebula, Sunglaze, Tidewake, Crown. Crown tables only show at the front edge of the 3D city (blocks cover the rest); the flat 2D fallback map is opaque.
- Crown's phone-check needs `GAME_MS=420000` (its six scenarios take ~180 s here, the default per-game limit, and the old build only just fit); Crown sweep 16 games 0 failures.
- Sweeps: Nebula 16 battles 0 failures; Sunglaze 16 games 0 failures (an earlier 24-game run under CPU load had timing failures that vanished once music loops were capped); Tidewake 14 games 0 failures (one 375x553 `lay` popup-covers-Place failure in a 32-game run did not reproduce on old or new); sweeps now ignore the file:// `Fetch API cannot load` console line.

## NOW (5 Oct, evening) — start here
Same owner prompt as before (commit, merge, push to `alex/brave-carson-rbpmlk`, deploy games that pass, two Sonnet workers).
Commits carry NO attribution lines. If `/dev/null` is a symlink (`ls -la /dev/null`), phone-check cannot run: a fresh session fixes it.

- **Live this session:** kaiten-kitchen (board-first merged with story mode), tidewake (story mode; "Skip to my turn" instant).
- **Pending, in order:**
  1. DONE 6 Oct: nebula-aces live with story mode. iPhone start failure: the 3D scene was built and `warm3D()` compiled a dozen
     shader programs plus one full render synchronously in the `load` handler, so a real GPU stalled before the first paint (and
     any throw there left the page without a battle). Now `boot3D()` (ui.js) runs after the first paint, a throw, a missing GPU or
     a lost WebGL context drops to the flat 2D board; `boot-test.js` emulates 7 GPU failure modes (WebKit itself is not installed
     here, so an owner check on a real iPhone is still wanted). `sweep.js` (20 battles + 4 story sorties, both phone sizes) is green.
     Text diet: `brief.js` cuts any block over 8 words to 7 words (long-press shows the full text).
  2. DONE 6 Oct: crown-city-smash live with story mode (`kot/campaign.js`). Same 3D start fix, `brief.js`, `sweep.js`,
     `boot-test.js`, `campsim.js` (chapter win rate by simulation: chapter 1 is 62% for an easy-level stand-in and 88% for a
     normal-level one). Short phones get a slightly lower tray so the board stays above 55%.
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
