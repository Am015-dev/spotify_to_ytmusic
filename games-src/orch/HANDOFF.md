# Orchestrator handoff (23 Nov 2026, 23:10 UTC)

Read CLAUDE.md first. Then only this file; rules.md and pending.md here have detail if needed (read the bottom parts only).

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
