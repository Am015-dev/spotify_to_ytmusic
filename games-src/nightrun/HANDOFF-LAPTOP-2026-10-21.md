# Nightrun: handoff to run from the laptop (written 21 Oct 2026, 21:20 UTC)

Read this first, then `games-src/nightrun/WORKER-RULES.md`, `WHERE.md` (8 KB feature map), `REVIEW-STRICT-8-2026-10-21.md` (newest honest review), `ASSETS-PENDING-2026-10-21.md` (+ `-P2`, `-P3`), `ASSET-POLICY.md`, and the older `ORCHESTRATOR-HANDOFF.md`.

## 1. Where things are
- Repo `am015-dev/spotify_to_ytmusic`, branch `alex/brave-carson-rbpmlk` (never `main`). Pages deploys `games/**` on every push to that branch.
- Live game: https://am015-dev.github.io/spotify_to_ytmusic/mainhattan-nightrun/ . The build stamp (title screen, Settings) must match `STAMP=` in `games/mainhattan-nightrun/index.html`. Phones keep an old copy: remove the home-screen icon, reopen from Safari, or Settings > Check for update.
- Asset viewer: https://am015-dev.github.io/spotify_to_ytmusic/asset-viewer/ (Flow tab, Mainhattan Nightrun batches).
- Source: `games-src/nightrun/parts/*.js` (about 100 files, 1.6 MB) joined by `parts/build.py` into `games/mainhattan-nightrun/index.html` + `sw.js` (commit both together). Never edit the built html.

## 2. Run it on the laptop
```
git clone https://github.com/am015-dev/spotify_to_ytmusic && cd spotify_to_ytmusic
git checkout alex/brave-carson-rbpmlk
npm i -g playwright && npx playwright install chromium     # tests use Playwright (NODE_PATH=$(npm root -g))
python3 games-src/nightrun/parts/build.py                   # note: build.py has a hardcoded repo path at line 2: edit it to your clone path
python3 games-src/scripts/guard.py                          # repo gate (size limits, layer rules, header warnings)
cd games/mainhattan-nightrun && python3 -m http.server 8765  # open http://127.0.0.1:8765/index.html?nomusic=1
```
Useful query flags: `?lab` menus via LAB button, `?sim=1`, `?<flag>=0` switches a feature layer off (see WHERE.md), `?legend=1` turns on the unfinished Legend layer.
Tests: `NODE_PATH=$(npm root -g) node games-src/nightrun/<name>-test.js`, ONE AT A TIME (parallel runs give false failures, seen 21 Oct). Heavy bot suites: `humanbot.js` (env `BOTS`, `STAGES`, `RUNS`, `DIFF`).

## 3. Honest state
- Newest independent review (R8, 21:03 UTC, measured commit 844dcbb): headline 46.3/100 (was 52.5). Real gamers said 12/100: boring, eye strain, messy, no story. R8 confirmed: muffled music + ~11 SFX ticks/s, 80-143 objects per frame, tiny dark enemies, 15+ HUD items, 25 s of story text before play, 41 settings, placeholders visible, Legend looks like Normal, Easy is a walkover; Normal is about right now.
- Owner decision (21 Oct 21:10): FREEZE features, then CONSOLIDATE the code (45 flag layers wrap and override each other; nobody can debug it). W112 builds the plan + a seeded fingerprint gate first (new files only), the refactor starts after the running fixes land.
- Assets: the repo does NOT contain the full-size images of many things the owner generated (street city layers sky/far/mid/near/floor exist only as 256 px thumbnails in `games/asset-viewer/flowthumbs/`; the other ~160 'generated' items likewise). The game shows placeholders until the owner drops full-size files into `assets-inbox/mainhattan-nightrun/` and `python3 games-src/scripts/ingest-assets.py [--check]` runs. `ASSETS-PENDING-*.md` is the register (626 ids: 121 to paint, 327 delivered-but-not-in-game, 178 probably superseded). `python3 games-src/scripts/pending-assets.py` regenerates it; always quote its numbers, never answer 'yes we have everything'.
- NO new assets from us (ASSET-POLICY.md): flat labelled placeholders + a Flow prompt line in an `ASSETS-NEEDED-*.md`; tinting/scaling existing approved art is allowed.

## 4. Running workers (cloud sessions, started 20:19-21:10 UTC; each must create a '[DONE Wxx]' trigger into the orchestrator session when finished)
| id | task | model | session |
|---|---|---|---|
| W100 | audio: SFX voice cap, cooldowns, limiter, music not muffled, SFX/Music sliders | sonnet | session_01SrRTm8inh5YaarG9LsrGzm |
| W102 | garage: buying must not jump scroll, compact grid | sonnet | session_01NXQbKfMsgizGSqkZanyzeV |
| W103 | forge on one screen without scrolling | opus | session_01ChUgkVGsbdrV4RcGhXaE2B |
| W104 | TRAINING = Flight School drills | sonnet | session_01K9poE5DHUdU7xeu35q3hgN |
| W105 | on-foot sprites: preload, constant size, sharpness | sonnet | session_01GLHtJFGdCf6LbZvHsDQYM6 |
| W106 | effects diet, enemy readability, HUD to 6 items | opus | session_01Ei9UdrPfhiWnahKZQwx4Rn |
| W107 | Legend hard but beatable (W101 layer clears 0%), Easy pressure | opus | session_01AqLHcutRj3fQxxa2tUfzRL |
| W108 | first 30 s opening, big bosses + auto-aim, tinted laser | sonnet | session_01GJM7KdmSTs3GKJyyTAGuVF |
| W109 | settings <= 20 controls, street camera/HUD | sonnet | session_01Rh84uXnPLp6YEEm1LKL2QQ |
| W110 | placeholder labels hidden, LUMEN/PFANN, currency glyph, docs | haiku | session_01SbCNYqzYmzQ2H52MugxYCg |
| W111 | layout fixes 20-23, 25 (pills, result/pause, 375x553, stage map) | sonnet | session_01XExgYuz2RuXoAaxmVQMwF2 |
| W112 | consolidation plan + fingerprint harness + smoke suite (no code moves) | opus | session_01UxpaqXwEqoXHwuY4wEQyK8 |
Orchestrator (this cloud session, will be retired): `session_01MS7iGyBWDerEAyagJ6ir4U`. Recurring safety-net trigger `trig_018Avd1MQyn5nKHbWYayT17Y` (hourly :20).
If you take over: (a) replace the orchestrator session id in `WORKER-RULES.md` and in new briefs, (b) delete/disable that trigger, (c) workers already running will still report to the OLD id: check them with list_sessions (status IDLE/COMPLETED = finished) and `git log origin/alex/brave-carson-rbpmlk`.

## 5. Not yet started (do after the running fixes land; fix list = REVIEW-STRICT-8 section 'Fix list')
13 Hangar 5 tabs + MORE; 15 lessons with real sprites; 16 audit hard FAILs S30/S23; 17 late-stage density (after the effect diet); the CONSOLIDATION refactor (steps in W112's CONSOLIDATION-PLAN.md, each gated by `fingerprint-test.js` + `smoke.sh`); Legend default ON only when `legend-test.js` gates pass (human-model 8-25%, oracle 35-65% on stages 10/20).

## 6. Rules that matter (from CLAUDE.md and the owner)
- Never write an original game's/publisher's/designer's name in the repo; no model names, Co-Authored-By, Claude-Session or AI attribution in files/commits/PRs. No force-push; `git fetch && git merge` before every push; `git add` explicit paths.
- Do not edit Mainhattan Overdrive. `armour.js` HP/caps and `hard.js` DPS ceiling are never changed.
- Screenshots: the owner asked (21 Oct) for visual review: UI/art workers must LOOK at phone screenshots (390x763, 375x553) of every screen they change, never commit them. (`CLAUDE.md` still has the old 'no screenshots' line: the harness blocked me from editing it; please change that line yourself.)
- Briefs must be event-driven: worker's LAST action = create_trigger into the orchestrator session with '[DONE Wxx] 5 lines'; hard stop 45 min (60 Opus); tests one at a time; push increments. A wake-up sent later as a follow-up is NOT accepted by workers as authorisation: put it in the first brief.
- Orchestrator rules learned the hard way: arm the next check BEFORE ending a turn; never promise a check-in time that is not scheduled; verify 'done' with the owner's own scan (`python3 games-src/scripts/wiring-status.py`, the asset viewer) not with my own grep; run tests alone.

## 7. Cost/speed facts (21 Oct)
Worker runtime: Sonnet 20-35 min typical, Opus design 45-200 min (long bot measurements). No sign of model downgrade (73 of 74 sessions served the configured model; the other was an upgrade). The delays were orchestration: missing wake-ups, no time limit, one big push at the end.
