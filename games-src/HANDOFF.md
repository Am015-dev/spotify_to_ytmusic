# Handoff: start a new session from this file

Repo `Am015-dev/spotify_to_ytmusic`, branch `alex/brave-carson-rbpmlk` (never merge to main). The site is
published from `games/` at https://am015-dev.github.io/spotify_to_ytmusic/. Private research lives in
`Am015-dev/game-night-private` (never copy it into the public repo).


## Story bubble + painted plate fix (13 Oct 2026): source done, only 1 of 15 deployed
- Shell: `gx-skin.css` speech bubble is a 9-slice (`22 62 34 30 fill`), `gx-campaign.css` scene/boss/result/sheet never scroll sideways, `?scn=story-scene` registered in `gx-campaign.js`. All painted buttons use `30 42 fill/14px Npx` (vertical caps, were `0 42` = stretched on tall buttons). Short Fuse nameplate/rack, Thornbound sheet head, Doorkick dock frame, Crown `#choice` fixed in their skin/layout css.
- `look-check.js` has two new checks (`panels`: scrollbar for decoration-only overflow, severe on x; `plates`: 9-slice/100% 100% distortion, >25% warn, >40% severe) and a `story-scene` screen. Calibrated: old final-approach build = 2 severe, fixed = 0.
- LIVE: cauldron-fair only. The other 14 are built from fixed sources but NOT deployed: full sweeps here take 20-60 min and failed under CPU load (final-approach phone-check slow 926ms; thornbound 375x553 bulb finger 4px off mid-spring; short-fuse help bubble covers target; crown phone-check browser crash; doorkick 1/24 sweep game; kaiten sweep ran >1 h). Not yet checked whether they also fail on the old build. Next: `python3 games-src/scripts/build-all.py --deploy <slug>` one game at a time on an idle machine (Crown needs `GAME_MS=420000`), then `look-check.js --baseline --game <slug>`, add-update (`--scn story-scene`).
- Known art issue (needs new art): Short Fuse `wire-tile-frame-c.webp` (100x240) is stretched onto 52x69 tiles. Sunglaze top bar content overflows 69 px at 1366 wide (hidden scrollbar, buttons cut).

## START HERE — orchestrator hand-off (13 Oct 2026, 21:00 UTC)
Read CLAUDE.md (Fast loop + Cost rules), then `PLAYBOOK.md`. Paste `games-src/BRIEF-TEMPLATE.md` into every new worker brief.
- **Deploy gate (owner, 13 Oct):** `build-all.py --deploy <slug>` = phone-check + scenarios + look check + QUICK sweep. Full sweep only `--full` (engine/rules changes).
- **Code:** start from `games-src/<dir>/MODULES.md` + `games-src/scripts/find.sh`; build outputs are untracked; `guard.py` (build + GitHub workflow) blocks regressions.
- **Owner pages:** `status.html` (versions, missing, not wired), `look/index.html` (look check), `next-wave.html` (to-make list, Waves 7-9, 3D A-E; laptop prompt files in `games-src/next-wave/`), asset viewer Games tab, `lab.html` (coming).
- **Cloud workers still running (check with get_session, model sonnet):**
  - `session_01VxGyhTM7mpMZhPEraRLygh` LAB menu + pinned in-game checklist with GO, all games (Doorkick first), `games/lab.html`.
  - ARCHIVED 21:29 (over time/context, owner rule): shared-skin bubble worker (shell fix pushed, only Cauldron live — the other games get it when the wiring workers redeploy them), faster-checks worker, old wiring batch A (overlapped the new wiring workers).
  - `session_01XvM88e6mByticHEdTcS4tq` Nightrun phone HUD: playfield ≥80% visible, power-ups as chips not banners (owner: "impossible to see on phone").
  - Wiring finish (13 Oct 21:28, 588/715 paintings + 47/59 models wired at start): `session_01USGHUaR7VayPywWkrGfMYc` Hollowbough+Rampart, `session_011XN3XWkxaDaz6hzkMhEdyv` Sands+Doorkick (+dk-tips, dk-status-line), `session_01FScDuF5uCNZdJFfDeUqTNh` Nebula+Lantern+Shipwreck, `session_018PZdut3kYbVEVaUDTUwQxr` Crown+Tidewake+Cauldron+Sunglaze, `session_01VZTUufsMh4x1FxGCz95a9S` Thornbound+Kaiten+Final Approach+Short Fuse. When all report: run wiring-status.py, check the asset viewer, report before→after.
  - `session_0173P8APho8S4jxLQSJj26oe` Nightrun K2: stages + map, difficulty curve, strategic shop/garage/market.
  - In this session's checkout a look fixer was deploying Crown, Sands, Tidewake, Thornbound, Cauldron (label sizes, tap targets, Got it button); check `git log` for "Look fixes" and finish any not live.
- **Open items:** Nightrun quick sweep failed on rhythm/difficulty/story-lock/tune items after the boss deploy (likely K2's in-progress work; K2's deploy must clear them). Nightrun needs LAB/scenarios adopted after K2 (note above). Owner may want the Overdrive car-damage request handled by the Overdrive session (session_017iH3DB4VyxwKSdMwsco4Ut).
- **Fast tests, game-industry style** (owner: "lab tests are extremely stupid" / "fast tests like game industry"): `session_01FAqai6WD8dZNr6tGwzjBBW` builds the test pyramid on Crown + Doorkick: (1) engine unit + invariant tests and 1,000 seeded headless AI games in < 10 s (node, no browser); (2) thin UI smoke < 30 s (errors, 404s, glowing targets respond, text, numbers = engine); (3) owner QA via ✔ Test / LAB GO. Deploy gate = 1 + 2, < 60 s per game. If it works, roll out (Sonnet, 2-3 games per worker).
- **Watchdog:** routine `trig_01SnC3sNN1s8bCYNsQCoo8u1` runs hourly at :38 in a fresh **Haiku** session (not in any orchestrator): sends wrap-ups (commit, push, HANDOFF, deploy what passed), archives 20 min later, starts one replacement; log under "## Watchdog log" at the end of this file.
- **Owner is frustrated by slowness:** target ≤ 15 min per game from start to live; report real times. Hand off this orchestrator at ~150k context.

## Checks: two speeds + scenarios (13 Oct 2026) — read `PLAYBOOK.md` "Iterate fast, check once"
- `build-all.py --quick <slug>` (phone-check + scenarios + QUICK sweep) to iterate; `--deploy <slug>` = full sweep once, then live. Numbers: `CHECK-SPEED.md`.
- One shared http server (`scripts/gx-serve.js`, `GX_URL`) for every check; no file://. Skin never changes a box (`GXSK.audit()` in phone-check).
- Scenarios: `?scn=<id>` (`shell/gx-scenario.js`, per-game `scn.js`), runner `scripts/scenario-test.js <slug>`, shelf checklist "▶ Try this" + "Scenarios only" filter (`add-update.py --scn`).
- **Mainhattan Nightrun (K2's code, not touched here):** the runner already works for it (`node games-src/scripts/scenario-test.js mainhattan-nightrun` serves `games/mainhattan-nightrun/`). K2 only has to inline `shell/gx-scenario.js` + a new `scn.js` (before the game scripts) and register, with `GXS.add({id,name,ask,setup,checks})`, these scenarios (ids `nr-*`): `nr-lab-boss-<boss>` one per boss in the LAB boss gallery (boss card/portrait visible, name readable, tap opens its detail, on-screen numbers = engine), `nr-stage-map` (stage map: nodes visible, next stage glows, tap enters it), `nr-shop` / `nr-garage` / `nr-market` (items readable at 390x763, 375x553, 1366x768, buying changes credits as the engine says), plus the generic `nr-board` and `nr-zoom`. Add `nightrun` to `GAMES`/`SWEEPS` in `build-all.py` when its build is wired.

## Orchestrator state (13 Oct 2026)
- Owner pages: shelf What's new panel (`games/updates.json`, add with `games-src/scripts/add-update.py`), missing assets `games/missing.html`, facelift list `games/facelift.html` (`games-src/FACELIFT.md`), screenshot grid `games/shots.html` (rebuild: `games-src/scripts/shots-gallery.py`).
- 3D: owner's Pixal3D models at FULL detail in `games/<game>/models/<item>.glb` + `-lite.glb` (phones/Low) + sprites; `games-src/facelift-3d/MODELS.md`. Never decimate the owner's models below 40k tris / 1024 px textures without asking.
- In progress (cloud workers, 13 Oct): Crown + Doorkick UI kits + 3D, Sands 3D; 3D wiring for the other 12 board games (earlier workers stopped at the weekly usage limit: check `git log` for "Facelift" before redoing anything).
- Crown City Smash plays on the board (13 Oct): `kot/onboard.js` + `onboard.css` move the real dice, Roll, SMASH! (hangs over Downtown), End turn, painted market cards (hold 400 ms or hover to read, tap to buy, touch taps twice), your cards and the Stay/Yield questions onto the board; the panel keeps status and advice. Tests: `kot/onboard-test.js` (4 sizes), `tutor-test.js`, `sweep.js` (flags controls off the board).
- Owner rules this week: credits = "Art and music by Am015-dev", never name the music/art tools; "Shuffle all songs" is the default music; music never changes playback rate; check a live link (curl 200) before sending it; look at PC layouts as well as phone.
- Open owner decisions: replace the few CC BY tracks (credits must stay while used); open games as separate pages instead of the shelf iframe (frees memory fully).

## Mainhattan Nightrun L1 (13 Oct 2026): stages, map, difficulty, strategy
- Story is 40 stages (8 per district) plus 5 optional challenge stages (no-hit, speed, perfect-beat) on a painted scrollable route map (`parts/map.js`); tap a node, read the plate, PLAY. Old saves move by stage name (`v40`). How it works: `games-src/nightrun/STORY.md`.
- One tuning table (`LV`, `HULL`, `TUNE.dm`, `TUNE.lenK` at the top of `parts/story.js`); check it with `RUNS=16 STAGES=$(seq -s, 1 45) node games-src/nightrun/story-sim.js` (bot clears stages 1-16 every time, about 80% of 33-40; the bot keeps moving, the anti-idle beam hit it before).
- Strategy layer: `parts/paths.js` (tables), `parts/strategy.js` (pit stop, heat, slots, selling, boss picks), market and loadout in `parts/meta.js`; `strategy-test.js` checks the numbers. Open: balance numbers of synergies and set bonuses are first guesses; the HUD contrast findings of `ui-align-test.js` (K1's) are still open.

## Mainhattan Nightrun J1 (10 Oct 2026)
- Music is locked at playbackRate 1 with natural pitch (`NR.music.setRate` ignores everything but 1); TEMPO UP = double-time fire + score x2, SLOW GROOVE = world at 0.6x (`PW.wk`) + soft low-pass, master limiter. `audio-test.js` asserts rate 1 and no clipping through TEMPO, SLOW, DROP, low hull.
- `parts/fun.js`: set pieces every 6 bars (WEAVE, LASER FENCE, district formation), DROP every 16 bars (dash on the downbeat), shard showers; mini-boss every ~26 bars. `fun-test.js` covers it; bots call `FUN.cost(y)`.
- Art: boss portraits and ship cards in round badges, phone rooftop strips (`fix-art.py`), both mini-boss paintings and the shield-link beam wired. Still to paint: 13 base perk icons (`assets-extra.md`, `games/missing.html`).

## Standing rules
- Never write an original game's, publisher's or designer's name in the public repo or the site. No model names
  in files or commits.
- Publish live once checks pass (owner, 5 Oct); preview folders are retired and deleted.
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

## Final Approach + Short Fuse: art wired, deploy blocked by phone-check (13 Oct 2026)
Wired in source and pushed (skin.css + `fa-art` / `sf-art` scenarios + checklist items); Thornbound and Kaiten Kitchen are live.
`build-all.py --deploy <slug>` stops at phone-check. **The currently live games fail the same checks** (run `GAMES_DIR=$PWD/games PC_OUT_DIR=/tmp/pc node games-src/scripts/phone-check.js <slug>`), so the new art is not the cause.
- **final-approach:** "slow" = one tap in every run takes 400-950 ms (limit 800). It is always the same tap: placing a die on "Axis, any die" (the 4th move). Median tap is ~120 ms. A GPU upload warm-up of all PIXI textures after `pxTextures()` (ui7.js) did not change it, so it is not first-use texture upload; next step is a CDP profile of that tap (suspects: the computer's reply / `render()` after a placement, PIXI scene rebuild).
- **short-fuse:** "2 dead taps" in the rotation scenarios (P>L, stale; sometimes L>P): after rotating, taps on the candidates "2" and "Wire C" change nothing within 1 s. Not investigated yet; start with the rotation relayout (`gx-viewport.js` + the game's resize handler) and whether the board is re-laid out before the candidates are tapped.
- `phone-check.js` now prints each tap's latency (slow taps labelled) and which taps were dead, to make this faster to chase.
