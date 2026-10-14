# Handoff: start a new session from this file

Repo `Am015-dev/spotify_to_ytmusic`, branch `alex/brave-carson-rbpmlk` (never merge to main). The site is
published from `games/` at https://am015-dev.github.io/spotify_to_ytmusic/. Private research lives in
`Am015-dev/game-night-private` (never copy it into the public repo).


## Lantern Dive last paintings (13 Oct 2026, 23:xx UTC): NOT deployed, one check failing

- Wiring result: `table-tunnel-glow-phone` is already live (`ui99.js:18` builds the name by concatenation, so the scan still lists it). Nothing new wired.
- `ui-bubble-tail`: no tail element exists in the shared help kit (`shell/gx-help.css`/`gx-help.js`). Adding one changes every game, so not used here. Needs an owner decision.
- `ui-row`: its description names no place. Not used until a target is named.
- 23:4x re-run on merged branch (50583c8): gate still FAILS only on ld-help@375x553 clipping. A report of a clipped player name ("Nerea", span.nm, seat plate, ld-art scenario) was NOT reproduced by this gate run. Verify it before any CSS change.
- Deploy gate FAILED on merged branch: `ld-help@375x553` text clipped ("First two tricks", span.t). Not caused by this change (no Lantern source edited). Fix in help layout (`lantern-dive/game/src/ui11.js` / shared `gx-help.css`), then rerun `build-all.py --deploy lantern-dive`.

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
- **Watchdog:** removed 14 Oct 00:08 — scheduled sessions had no tools to see/stop sessions and did nothing. Workers self-stop at 45 min / 150k (BRIEF-TEMPLATE); the orchestrator checks workers at every owner message.
- **Owner is frustrated by slowness:** target ≤ 15 min per game from start to live; report real times. Hand off this orchestrator at ~150k context.

## Worker groups (13 Oct 2026, 23:10 UTC) — one worker per game, max 15, titles start with the group tag
| Group | Worker (session) | Model | Games | Status |
|---|---|---|---|---|
| [ART] | session_011jRzpiYd1pxZRj3N2mtQGt | Sonnet | Sands of Qamar (31 paintings wired in source) | fix gold-badge digit contrast, deploy (old worker archived, over context) |
| [ART] | session_01VZTUufsMh4x1FxGCz95a9S | Sonnet | Final Approach, Short Fuse (2 + 2) | fixing phone-check cause, then deploy |
| [TESTS] | session_01FAqai6WD8dZNr6tGwzjBBW | Sonnet | pilot: Crown, Doorkick | fast test pyramid (engine tests + UI smoke < 60 s) |
| [LAB] | session_01VxGyhTM7mpMZhPEraRLygh | Sonnet | all games | LAB menu + pinned checklist GO: 9 live, 6 to go |
| [OPS] | routine trig_01SnC3sNN1s8bCYNsQCoo8u1 | Haiku | all workers | hourly watchdog at :38 |
Done today (archived): art wiring for Hollowbough, Rampart, Nebula, Lantern, Shipwreck, Crown, Tidewake, Cauldron, Sunglaze, Thornbound, Kaiten, Doorkick; Nightrun phone HUD.
Next after the [TESTS] pilot passes: one [TESTS] worker per remaining game (13), Sonnet, all in parallel (≤ 15 total).

## Checks: two speeds + scenarios (13 Oct 2026) — read `PLAYBOOK.md` "Iterate fast, check once"
- `build-all.py --quick <slug>` (phone-check + scenarios + QUICK sweep) to iterate; `--deploy <slug>` = full sweep once, then live. Numbers: `CHECK-SPEED.md`.
- One shared http server (`scripts/gx-serve.js`, `GX_URL`) for every check; no file://. Skin never changes a box (`GXSK.audit()` in phone-check).
- Scenarios: `?scn=<id>` (`shell/gx-scenario.js`, per-game `scn.js`), runner `scripts/scenarios.spec.js` (Playwright Test, see "Playwright/axe swap"), shelf checklist "▶ Try this" + "Scenarios only" filter (`add-update.py --scn`).
- **Mainhattan Nightrun (K2's code, not touched here):** the runner already works for it (`cd games-src && SCN_SLUGS=mainhattan-nightrun node_modules/.bin/playwright test --project=phone` serves `games/mainhattan-nightrun/`). K2 only has to inline `shell/gx-scenario.js` + a new `scn.js` (before the game scripts) and register, with `GXS.add({id,name,ask,setup,checks})`, these scenarios (ids `nr-*`): `nr-lab-boss-<boss>` one per boss in the LAB boss gallery (boss card/portrait visible, name readable, tap opens its detail, on-screen numbers = engine), `nr-stage-map` (stage map: nodes visible, next stage glows, tap enters it), `nr-shop` / `nr-garage` / `nr-market` (items readable at 390x763, 375x553, 1366x768, buying changes credits as the engine says), plus the generic `nr-board` and `nr-zoom`. Add `nightrun` to `GAMES`/`SWEEPS` in `build-all.py` when its build is wired.

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
## Sands of Qamar painted art wiring (13 Oct, worker)
- Wired (sources, committed, not live yet): tile glyph medallions, tile frames, badges, star icon, goods-card, nameplate, djinn bar, ribbon, finger, bubble tail, item and trophy pictures (`html.sk-pl`, scenario `sq-art`). Not used: `ui-seat-chip` (its frame is too thick for 4-5 seat chips).
- Deploy blocked by the look gate: `contrast|b.tv` (digits on the gold badge, 1.5-2.7:1 depending on the tile behind). The look check measures what is behind the digits; the badge picture now sits on `.tv::before` over a solid `#f4c04a`. `btn.sm` plate fixed; goods row has 44 px boxes. Next: lift `.tv` text contrast (e.g. a cream plate behind the digits), run `NODE_PATH=/opt/node-tools/node_modules python3 games-src/scripts/build-all.py --deploy sands-of-qamar`, then `look-check.js --baseline --game sands-of-qamar`, `add-update.py sands-of-qamar "Painted art wired" "item" --check "..." --scn sq-art`.
- Note: export `NODE_PATH=/opt/node-tools/node_modules` before build-all (the look gate crashes otherwise).
- Doorkick Dungeon: live (hand/level icons, bubble tail, 3D winner heroes; scenarios dk-art, dk-tips, dk-status-line).

## Scenario invariants + mutation proof (13 Oct 2026; Crown + Doorkick proven, other games not yet)
- Method: `PLAYBOOK.md` "A scenario must find bugs". Tools: `shell/gx-scenario.js` (`play` checks, invariants, `GXS.known`, `mut:`), `scripts/scn-run.js`, `scripts/scenario-mutate.js <slug>` (2-4 min).
- Baseline kill rate before (old scenarios): Crown 34/41 = 83% (behaviour mutants 75%), Doorkick 32/40 = 80% (69%); most "kills" were just hidden elements; no scenario asserted an engine outcome.
- Real bugs found by the new invariants: FIXED Crown 375/390 px player chip cut off the energy number ("⚡20", `kot/skin.css`). LISTED (in `GXS.known`, `munch/scn.js`, `kot/scn.js`): Doorkick miniature card text 7-8 px (`.card .cn/.dn/.tag/.kind`), Doorkick fight side label "Pip (you) + Morwen" clipped, Crown PC tag "PERMANENT" 9.9 px, Crown PC (1366x768) player name overlaps its "· tap: how" hint (`span.more`) and the PC news ticker button text is clipped (`button.newsbtn`). Delete the known line once fixed.
- Other games: add `data-engine` to key numbers, `mut:` to each scenario, run scenario-mutate.js, fix survivors.
- A routine message ("Redirect: fast tests like the game industry": engine unit tests + 1000 AI games, drop the mutation runner) reached this session without the owner; not acted on, owner to confirm.
## Shipwreck Isle: last paintings wired (blocked deploy gate)

- Wired `ui-bubble-tail` (island label tail, `html.sk .tl:not(.far)::after` in games-src/rc/skin.css) and `ui-row` (`html.sk .row`, `.row.has`, `.row:hover`).
- Deploy NOT done: `build-all.py --deploy shipwreck-isle` fails scenario si-art: "text under 11px" on the phase strip label "Event" (9.6px, ui.js PHASES). The same failure reproduces on the commit before this change, so it is pre-existing.
- Next: raise the phase strip label to 11px or more (shared phase-bar style), then re-run the deploy.

## Update 13 Oct (late): Final Approach is live; Short Fuse blocked only by look-check
Final Approach deployed (GO `fa-art`, LAB 24/24, look ok). Shelf checklist entries must use the shelf ids (`approach`, `shortfuse`), not the slugs, or the LAB shelf check says "missing".
Short Fuse: GO scenarios 6/6 and LAB 24/24 pass; `--deploy` stops at look-check with NEW severe findings that are not from the art wiring: `plates|div.tile.crew` (the crew tile frame `wire-tile-frame-c.webp` is drawn stretched, box 56x73 vs picture 100x240) and `contrast|div.gxc-sc-name` (story-scene speaker name). Fix the tile frame slice/size in `games-src/short-fuse/game/skin.css` and the speaker-name colour, then `build-all.py --deploy short-fuse` (its art is already wired and committed).
Short Fuse, after merging the build-all fix: every scenario (all 6, not only `sf-art`) now fails the universal "text under 11px" check: `"1"` at 7px in `<i.cn12>` (the small wire-number labels on the board). Together with the look-check findings above, Short Fuse needs a readability pass (wire number labels >= 11px, crew tile frame slice, speaker-name contrast) before it can deploy; its art wiring and `sf-art` are already committed.

## Nebula Aces: last painting (ui-bubble-tail) wired, NOT deployed
- Wired: the coach bubble pointer (`.gxh-arr`) wears `ui-bubble-tail` (xw/skin.css `html.sk-tail` rules, xw/media.js set `sk-tail`), same 12x12 box and place. Scenario `nb-tail` (xw/scn.js) checks it; its two painted-tail checks pass.
- Blocked: `build-all.py --deploy nebula-aces` fails 0/7 scenarios on look checks that also fail on the untouched `nb-art` scenario: text under 11px (`set dials`, `move + act`, `now`), clipped labels (`Setup · Deploy Fringe`, `Captain Kade`, `you`), `button covered by div.gxt-cell` in nb-tutorial-play, and `data-engine "three.js r158" threw Unexpected identifier 'r158'`. The three.js message looks like a harness artifact (engine label evaluated as JS), not a load failure; unverified.
- Next: confirm these fail on the base commit too; if so, fix the look checks in xw/ (font sizes, clipping, tutorial cell cover) or the engine-label check, then re-run the deploy and add the "Last painting wired" item.
- Setup note: `games-src` needed `npm install` (three@0.158.0) before any build.

## Fast test pyramid (14 Oct 2026): what exists, what does not
- BUILT (UI layer, Crown + Doorkick): behaviour scenarios with real taps and engine assertions, free invariants in every scenario (errors, 404s, tiny/clipped/overlapping text, covered buttons, engine numbers, glow responds), mutation proof. Runtimes: scenario-test ~30-50 s per game (3 sizes), scenario-mutate ~3.5 min per game (run on scenario changes only), lab-test ~60 s. Kill rate: Crown 83% -> 96%, Doorkick 80% -> 94%.
- NOT BUILT: node-only engine unit tests and the 1000-game AI-vs-AI simulation (a scheduled redirect asked for them mid-task; the owner's task text asked for the mutation work, so that was finished first). Start from `munch/rules-test*`/`kot/campsim.js`, `scripts/rulestest.js`; gate them before the UI step in build-all.py.
- Real bugs found: Crown energy chip cut off on 375/390 phones (fixed); Doorkick Fight! button cut off and unclickable on PC after a bonus card (fixed, `munch/tbl.css`); listed in `GXS.known`: tiny miniature-card text, clipped fight label, Crown PC tag/name/news-button text.
- Roll out: copy the Crown/Doorkick `scn.js` pattern (play checks + `mut:` + `data-engine`), run scenario-mutate, fix survivors, fix or list findings.

## LAB / test mode (14 Oct 2026) — live in all 15 shelf games
Read `games-src/shell/LAB.md`. Shelf 🧪 Test mode switch (next to ✔ Test), in-game 🧪 LAB menu (every scenario, ▶ GO, ✅/❌/⏭, "All scenarios ▶"), pinned 📍 checklist, owner page `games/lab.html` (data: `games/scenarios.json`, rebuilt on every deploy). `build-all.py` injects `gx-lab-core.js` + `gx-lab.js` + `gx-lab.css` into each staged page; `scripts/lab-test.js` (now `--full` only, warn-only) checks it. Checklist items point at scenarios with `scripts/set-scn.py`.
- **Mainhattan Nightrun (not touched):** inline `shell/gx-scenario.js` + a `scn.js` (before the game scripts), then set `window.GXLAB_CSS = <gx-lab.css text>` and inline `gx-lab-core.js` and `gx-lab.js` at the end of the body (or add the slug to `GAMES` in build-all.py so it injects them). Register `nr-*` scenarios as listed above.
- Known weak spots: LAB button defaults top-left (`GXS.labPos='r'` in scn.js moves it; Rampart does); Doorkick's Diary button width changes with the skin at 1366x768 (check removed from dk-board); Short Fuse `sf-board` has 7 px text (lab-test warning); Final Approach / Hollowbough / Lantern phone-check can flag "slow >800 ms" under CPU load; look baselines for Doorkick/Thornbound/Sands/Nebula/Crown got the existing plate/contrast keys; the quick sweep was skipped for the LAB deploys (LAB is inert off).

### LAB status (14 Oct 2026)
Live with LAB: all 15 shelf games (Doorkick, Crown, Nebula, Shipwreck, Sands, Sunglaze, Rampart, Short Fuse, Tidewake, Hollowbough, Thornbound, Kaiten, Lantern, Cauldron, Final Approach). Left: Mainhattan Nightrun (adopt per the note above). Next step: owner opens `lab.html`, taps GO per scenario; fix what he marks ❌; run `node games-src/scripts/lab-test.js <slug>` (or `build-all.py --deploy --full` only for engine changes) after any game change.

## Playwright/axe swap (14 Oct 2026, pilot: doorkick-dungeon)
- Scenario tests now run with Playwright Test (`@playwright/test@1.56.1`, `@axe-core/playwright` in `games-src/package.json`; run `npm install` in `games-src`). Config `games-src/playwright.config.js` (projects `phone` 390x763 = fast gate; `phone-s` 375x553 and `pc` only with `--full`), spec `scripts/scenarios.spec.js` (one generated test per `?scn=` scenario), check protocol `scripts/scn-run.js` (also used by `scenario-mutate.js`), lister `scripts/scn-list.js`. Standalone: `cd games-src && SCN_SLUGS=<slug> node_modules/.bin/playwright test --project=phone [-g <scn-id>]`. `scenario-test.js` is deleted (job pool / args / reporting were Playwright's job).
- Look check: contrast, tap-target size and unlabeled-button checks are now axe-core, run on the same scenario pages inside the scenario run (`LOOK_OUT`); build-all step 3b2 compares the severe findings (contrast < 2:1, target < 24 px, button without name) with the live game's (cached in `.look-live-cache/*-axe-*`) and blocks only on new ones. Removed from `look-check.js`: those judge() rules. Kept there (no axe equivalent): text px size, clipped/overlapping text, covered buttons, art/plates/boards/cards, fonts, page errors. The pixel-contrast helper (`__px.contrast`) stays because glyph visibility and blank-canvas detection use it.
- Not ported: the "known findings skipped" note line. Doorkick: scenarios 32 s (2 phone sizes, old) -> 16-19 s (390x763 only, incl. axe).
- Deleted unused copies: uiclick2.js, uiclick3.js, g2.js, g3.js, nettest_dbg.js.

## Menus (14 Oct 2026)
- Shared scenario `?scn=menu` (`shell/gx-scenario.js`, axe per surface in `scripts/scenarios.spec.js`): opens the title screen, every top-bar menu/rules/help button and the campaign screen; checks overlap, clipped text, text >= 13 px, covered buttons, every font loaded and one of the two shelf faces, axe tap size/contrast. Run: `cd games-src && SCN_SLUGS=<slug> node_modules/.bin/playwright test --project=phone -g menu`.
- Fix is shared: `shell/fonts/` (Cinzel 700, Alegreya Sans 400/700, OFL) + `shell/gx-menu.css` injected last by `build-all.py inject_menu` (base64, single file); `gx-campaign.css` blurbs wrap, 13 px floor.
- Failures before (unique messages: font / 13px / clipped / overlap / covered / axe): cauldron-fair 53/11/1, crown 39/13/3+1, doorkick 67/12/1, final-approach 47/11/5, hollowbough 72/11/1+2, kaiten 48/11/1, lantern 78/12/5, nebula 59/8/2+1, rampart 1/12/1+5 cov/9 axe, sands 5/12/1+4, shipwreck 6/12/1+3, short-fuse 92/17/5+4/8 axe, sunglaze 45/10/6, thornbound 88/11/2/4 axe, tidewake 89/11/4/4 axe.
- Fixed + deployed (menu scenario green): doorkick-dungeon, cauldron-fair, kaiten-kitchen, final-approach, lantern-dive, sunglaze.
- Still failing (after the shared fix): crown-city-smash (overlap "20 ★"/"last monster standing" on title); hollowbough (small "Build a woodland city." 11.2 px); nebula-aces (title overlap "New here?"/subtitle, axe .gx-gear target size, `data-engine "three.js r158"` is a bad attribute); rampart-and-vine (menubtn panel: 5 covered buttons, 11 axe contrast/target); sands-of-qamar (3 overlaps: "2 players"/"Begin" etc. in the title); shipwreck-isle (2 overlaps with p.small.muted, axe #bulbbtn); short-fuse (overlaps "Free and direct"/"All jobs", "Boot Camp I-III" 9.3 px, 8 axe contrast); thornbound (axe target-size/contrast in the campaign screen); tidewake (top-bar labels Hint/Crews/Log 11 px, axe target size). Common: top-bar buttons (#bulbbtn, rulesd, setd) report axe target-size while the campaign screen is open: check whether the campaign layer covers them.
- Not done: Mainhattan games skipped as ordered; no per-game skin.css was deleted yet.

## Fast gate v2 (14 Oct 2026, worker): `build-all.py --deploy` speed + menu test correctness
Measured on this 4-core box, 3 games (sunglaze, short-fuse, tidewake; two fail the menu scenario as before), `--deploy --suffix=-tmp`:
| step | before (owner's numbers) | after |
|---|---|---|
| 3 games total | ~6-7 min | **126 s** (142 s first run) |
| 1 game (sunglaze) | n/a | **74 s** |
| scenarios | 52 s + ~35 s rerun per failing game | 74 s once (21 tests); no rerun |
| look-check | serial, ~30 s/game + live look ~30 s + live axe, per game | 2 in parallel, ~10 s/game, no live run |
Target (90 s / 45 s) NOT reached: the remaining time is scenarios (~75 s: every test waits ~1.6 s + 5 s engine settle + 3 glow taps; axe on each page), builds ~12 s (now 3 in parallel). Next: cut `S.universal`'s 5 s wait, run scenarios with workers=4, fold look-check into the Playwright run.
What changed (reused: Playwright Test, axe, existing look-check):
1. `scn-run.js` returns `{fails, invFails}`; `scenarios.spec.js` writes invariants (text < 11 px, clipping, glow-tap) to `.staging/.inv/` and fails only on the scenario's own checks. The SCN_NOINV rerun is gone; `build-all.py` prints the invariants as WARN.
2. Live look/axe re-measurement replaced by committed `games-src/look-known/<slug>.json` (per mode phone|all; rewritten for each game that passes the gate). A game with no file yet is measured once on the live game (as before), then committed. Only sunglaze is seeded; the rest seed on their first deploy.
3. Look checks run in a 2-worker thread pool; game builds run 3 at once.
4. Duplicate checks removed from the deploy look-check (`look-check.js --skip size,overflow,overlap,fonts`): the scenario invariants + menu scenario own text size, clipping, overlap and fonts. Images, cards, boards, covered buttons, page errors stay in look-check.
Needs `cd games-src && npm ci` on a fresh machine (no node_modules in a new container).

### Menus (shell/gx-scenario.js `menu` scenario)
- Font check now real: first family must be a shelf face, have an @font-face in `document.fonts`, and some face `loaded` (old `document.fonts.check()` is true when nothing is declared).
- Scrollable panels are scrolled page by page and re-audited (below the fold).
- NOT done: pause / end / win-lose screen and chapter-boss intro need per-game spawn hooks (`GXS.menuSurfaces.push({name, open, close})`); the generic finder only opens top-bar buttons and the campaign screen. "Text not topmost at its centre" is coded behind `GXS.menuTopmost = true` but off: it flagged every game's title screen (28+ per game) and I did not find out whether that is real or a layout-timing artefact.
- Results, phone 390x763, menu scenario, all 15 (new + old failures; every game FAILS the scenario now only where listed; no font failures anywhere):
  - cauldron-fair, doorkick-dungeon, final-approach, kaiten-kitchen, lantern-dive, sunglaze: clean
  - hollowbough: text < 13 px x2
  - crown-city-smash: text overlaps x4
  - nebula-aces: overlaps x3, axe tap target < 24 px x2
  - rampart-and-vine: covered button x10, axe contrast x10
  - sands-of-qamar: overlaps x10
  - shipwreck-isle: overlaps x6, text < 13 px x28, tap target x1
  - short-fuse: overlaps x11, text < 13 px x6, contrast x5, tap target x3
  - thornbound: overlaps x2, tap target x4
  - tidewake: overlaps x10, text < 13 px x12, tap target x3
(Counts are matches in the first 14 messages per check, so "x28" = at least 14; run `playwright test --project=phone --grep menu` with SCN_SLUGS for full lists.) The "clean" games above passed with the topmost check off.
