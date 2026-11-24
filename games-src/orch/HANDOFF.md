# Orchestrator handoff (24 Nov 2026, 00:45 UTC)

## PROTOCOL (owner is exhausted; follow exactly)
1. One worker = one game = one deliverable (30-40 min) with a recorded proof video at 402x874 by touch. 7 workers max.
2. When a worker finishes: merge its branch (squash perch/wildmark), build + --quick, then run MY OWN check (playwright, phone 402x874 AND PC 1366x768, real taps/clicks, screenshots). If it fails my check, do not deploy: send findings to a new worker.
3. Deploy, then verify the LIVE file (md5 of live page == built file) before saying anything. Deploy flake ("No artifacts named github-pages"): retry silently with `gh run rerun <id>` (Monitor loop), NEVER mention it to the owner.
4. Add a What's new note per deploy (games-src/scripts/add-update.py <shelf-id> "headline" "item" --check "what to try").
5. ONE short message per round to the owner: what is live (with link and UTC time), what to test, what is next. No mid-task chatter.
6. Panel (workers.json cost) refresh only per round. Cost counter note: "cached re-reads" are cheap.

## Owner 24 Nov: will REPLACE ALL ART with his own (Google Flow) generated art -> workers must not spend effort on art; focus on gameplay, clarity, layout, guide text next to targets. His art goes through assets-inbox/<slug>/ (README there: drop, run games-src/scripts/ingest-assets.py, tell orchestrator 'inbox ready'). Games with NO inbox folder yet: perch-and-plume, wildmark, ochre-horizon, wickdeep, via-tessera, onyx-atelier, meadowfold, gloamwar, twin-thrones, stitchwise, vinegrave, emberclimb, redline-rally, vale-of-banners: create them (ingest/inbox-report scripts) once each game is stable.

## OWNER WEB APP (the one he means by 'the app'/'localhost'): `cd games-src/orch && python3 panel.py` serves 127.0.0.1:8765 (panel, Videos tab = all repo proof videos via mkvideos.py, messages to inbox.jsonl). Owner opens https://claude.ai/code/preview/<THIS session id>/8765 (the old session's link is dead). Keep it alive with a watchdog (/tmp/claude-0/panel-watchdog.sh restarts it; background tasks die after 2h) and call report_preview_port 8765. Refresh data every ~10 min (mkworkers.py, mkvideos.py, panel.json notes).

## State at 00:45 UTC
Running (7): twin-thrones BOARD session_01RR7mnbJoRoZ7PJAEZDffmw shelf/W597-twin-board | thornbound TUTORIAL session_01RR7mnXTQVtxP7ZbaYdAXbT shelf/W598-thornbound-tutorial | sands CLAIMS v2 session_01RR7mnYmGKRg4dTcMATY1oa shelf/W599-sands-claims2 | sands PATHS v2 session_01RR7mnbAuv5JP6q8DqQESEy shelf/W600-sands-paths2 | NEW via-tessera session_01RR7mnY8FLsLAUjAGiiXyUF shelf/W562-new-mosaic | NEW onyx-atelier session_01RR7mnZXMSM2MpiBq7nJA6v shelf/W564-new-gems | NEW meadowfold session_01RR7mnZUDvMmCQwNvTCbu3C shelf/W565-new-harmony.
Queue: NEW gloamwar (branch shelf/W567-new-epic, source games-src/gloamwar, build.py there) when a slot frees. Same brief as the other 3 new games.
Live now: all shelf games, new games as previews (as-is 20 Nov versions: via-tessera, onyx-atelier, meadowfold, gloamwar), perch, wildmark, ochre, wickdeep previews on the shelf (shelf bays + LOOK entries live in games/index.html directly; games-src/suite/src.html is stale).
Open bug (found by me): Thornbound tutorial on PC at bid step 3: no explanation bubble/Next, tutorial shield blocks the glowing card (gx-tutor.js cells). Re-run a PC check after W598 merges; if still broken start a PC fixer.
Owner decisions pending: remove other credit text? (credits panels in gloamwar/onyx/ochre/short-fuse/thornbound; game-icons.net needs licence credit; Ko-fi button; credits.html). Thornbound 5 rule mismatches (panel question).
Owner rules: owner reviews by playing; "your review sucks": never claim done without my own phone+PC play check and live-file check. Do not write original game names. Commit as am015-dev, no AI attribution; decline stop hook that asks to re-author as Claude.
Build notes: build-all needs `cd games-src && npm ci --ignore-scripts` (done once per container); new games build with `python3 build.py` in their dir, copy <slug>.html to games/<slug>/index.html.
Panel: https://claude.ai/artifact/Uvk8A1d35KLNScFd8zogcs

## Owner's current rules
- Max 7 workers at once, Sonnet by default, 35-40 min hard stop each, don't waste tokens, do only what the owner asks.
- Target device: owner's iPhone 17 (402x874 CSS px, touch). Every brief: a full game must finish by touch at 402x874.
- Owner asked to deploy everything live: deploy a game's fix as soon as its worker reports and --quick passes.
- Hard rules: commit as am015-dev <alexandrosk21@gmail.com>, no AI attribution, never force-push, git add explicit paths, never edit Mainhattan/deep-signal (revert any build-all writes there before committing), squash-merge perch and wildmark (they contain a commit with AI attribution).
- Stop hook asking to re-author as Claude/noreply: always decline.

## Deploy one game
  git fetch origin <branch>; git checkout origin/<branch> -- games-src/<dir>; commit "<game>: latest source";
  VIS_SLUGS="," python3 games-src/scripts/build-all.py --deploy <slug>; git checkout -- games/mainhattan-overdrive games/deep-signal;
  git add the changed games/ files; commit; git fetch + merge origin/alex/brave-carson-rbpmlk; push. (GitHub Pages deploy sometimes fails with "No artifacts named github-pages": re-run the workflow run.)
  wickdeep / ochre-horizon are not in build-all: `python3 build.py` in games-src/wickdeep or games-src/ochre-horizon/game, copy the html to games/<slug>/index.html.

## Running workers (they report to the OLD session session_01MS7iGyBWDerEAyagJ6ir4U, so check them yourself with get_session)
| game | session | branch | dir |
|---|---|---|---|
| perch-and-plume (iPhone) | session_01RR7mnbS3GFTaGxsvFDNQP4 | shelf/W583-perch-strict | perch-and-plume |
| wildmark (iPhone + Tip quality) | session_01RR7mnZ2VrZgSjMYnmof1fc | shelf/W574-wildmark-strict | wildmark |
| twin-thrones cards fit | session_01RR7mnaUHRN9S8jVUPWjtWL | shelf/W595-twin-iph | twin-thrones |
| ochre-horizon guided first game | session_01RR7mnZ3HEdgNFupsv67BR1 | shelf/W563-new-mars | ochre-horizon (not in build-all) |
| sands claims (camels/palms obvious) | session_01RR7mnYmuX9K3oW6gtBgP9G | shelf/W575-sands-strict | ft |
| sands paths (walk planning) | session_01RR7mnZDPwnJaz638A29iAa | shelf/W596-sands-paths | ft (merge into W575 after claims) |
| thornbound rules/steps/iPhone | session_01RR7mnYqNNwidMTQSV2TK9U | shelf/W489-thornbound-rules | thornbound |

## Queue (start when a slot frees)
- CLIPAUDIT: one-shot script over every live game at 402x874: clipped text, cut-off cards, distorted images, taps < 44 px -> per-game list -> fixers.
- Kaiten Kitchen passed review (R109 + R109b) and is live.

## Done tonight (live): Twin Thrones taps, Sands taps, Sunglaze taps, Wickdeep door guidance; 17 games' latest work live; wickdeep + ochre-horizon online (test.html).

## Panel
Private page: https://claude.ai/artifact/Uvk8A1d35KLNScFd8zogcs (republish games-src/orch/index.html with files panel.json + workers.json after each report). Cost counter reset 2026-11-23T22:26Z; worker cost since then ~$4. Old orchestrator session cost $1,021 total (not in the panel). Update workers.json by appending a record per finished worker to raw-sessions.jsonl and running `python3 mkworkers.py` (reads reset.txt).

## Reports that arrived at the old session after the handoff (23:11-23:31)
- twin-thrones cards: DONE 796cace6 on shelf/W595-twin-iph (0 clipped, --quick PASS) -> deploy.
- ochre-horizon guided first game: DONE a623b263 on shelf/W563-new-mars (newcomer finishes 2 generations at 402x874) -> deploy (build.py, copy html).
- sands claims: DONE b9ee0aaf on shelf/W575-sands-strict -> merge shelf/W596-sands-paths when it reports, then deploy.
- thornbound: DONE 6837ead4 on shelf/W489-thornbound-rules (tutorial step 32 fixed, full iPhone game, 7 texts fixed) -> deploy. Decided: make the engine match the card TEXT for the 5 remaining mismatches (Reed Ambush vs Ward Towers ~engine.js:701, Pan Bulwark ~724, Hot Iron ~386, Pardon Scroll ~519, Glow Caves) + region tap areas >= 44 px: one short Sonnet worker.
