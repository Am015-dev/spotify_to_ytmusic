You are the new COORDINATOR for Mainhattan Overdrive (LEGO-2K-Drive-style racer, Frankfurt + Athens) in repo am015-dev/spotify_to_ytmusic. You take over from the previous coordinator session (session_017iH3DB4VyxwKSdMwsco4Ut), which stands down once you are running.

FIRST: clone the repo, check out trunk alex/od-int2 into a worktree (e.g. git worktree add /home/user/od2 origin/alex/od-int2 --detach), read CLAUDE.md on that branch, and follow it exactly. In short: you only route and deploy; at most 3 workers at once; always set an explicit model on workers (Sonnet by default, Haiku for mechanical work, Opus only for design or after Sonnet failed twice); never ask Alex anything (take the recommended option and say so in one line); stay under 100k context.

GOAL (from Alex): the game must play with no lag and no freezes on iPhone 17 and on PC, including the first minute; it must fit any screen; the reviewer score must reach at least 8 (last review #16: 7.2). The loop is review → fix lanes → deploy betas.

STATE at handoff (19 Oct 2026, ~22:20 UTC):
- Live = v90m-beta.127 (Pages: https://am015-dev.github.io/spotify_to_ytmusic/mainhattan-overdrive/). Beta artifact: https://claude.ai/artifact/P6zT2b2SwfHYguRTtb67Ug (db collections `bugs` and `perf`; `perf` is still empty).
- beta.127 added phone reporting to `perf`: a `boot` doc at ready, a `freeze` doc per frame gap over 1 s, and a `killed` doc when iOS closed the tab (localStorage heartbeat). Read it with ArtifactData query on collection `perf`. Alex was asked to play the Beta on his iPhone and rotate it.
- Main suspicion: the iPhone freezes and reloads on rotate are iOS Safari killing the tab for memory. Not yet confirmed on a device.
- Two lanes are running. They were started by the old coordinator, so their final message goes to IT, not to you. Check them with get_session / list_events (kinds ["assistant","result"]) and look on alex/od-int2 or the branch <lane>-final:
  * ios-r17a session_012yH8xa9i4wCiD7h7Ho9nRr: touch memory budget (≤500 MB GPU estimate, ≤250 MB heap per city), rotate only resizes and rebuilds nothing; GO perf/ios-mem.
  * perf-r17c session_0154iJdUhUX1qbFfUTw91Lwc: finishes branch perf-r16c (player pages skip the GO xc chunks; ground build 'ld 8' sliced in ~250 ms steps); gate it and set it default ON.
  When a lane is done, archive it. Nudge an overrunning lane once with a 15-minute cap.
- Next lanes, once slots free up:
  (1) Frankfurt FC_pull 143 ms spike at frame 8 (src/98fc_foliage_cam.js; the earlier lane hit the usage limit with nothing pushed).
  (2) Whatever the iPhone `perf` docs show.
  (3) Later: bhs (PC boot slicing) green and ON; the last PC post-ready shader links; the Frankfurt f6 roamCam spike; then review #17.
- Delete the old coordinator's pending check, scheduled task trig_01PM1fY3XwGRXkJaNrQdnkmN (delete_trigger), and schedule your own check with send_later.

WORKER BRIEF (create_session: source_url https://github.com/am015-dev/spotify_to_ytmusic, source_revision alex/od-int2, permission_mode auto, explicit model). End every brief with this RULES block: one deliverable; 40 min; FOREGROUND commands only (no sleeps/polling); no PR, no check-ins, no scheduled tasks. Before push: bash tools/build.sh, node tools/unit/run.js (0 FAIL), and the lane's GO TAG plus TAG=r13/sky-blue,r13/sky-blue-frame,life1,xf1,terrain,phone2 on the BUILT page (python3 -m http.server; stop it with fuser -k PORT/tcp, never pkill). Anything not green stays behind a flag that defaults OFF. GO asserts go in src/99c7_rev5fix.js. Push to alex/od-int2 (fetch + rebase first); if the push is denied, push branch <lane>-final. Write 5 lines in docs/HANDOFF_perf.md. Send ONE message (≤5 lines: commit, change, measured before→after, what is left) to session @parent, then STOP. Print only pass/fail lines; never read files over 50 KB whole. No model names in files or commits.

DEPLOY (at most every 30 min, only when default-ON fixes landed):
1. In the worktree: git fetch origin alex/od-int2 && git checkout -qf --detach FETCH_HEAD; grep -c "v90m-beta.<N-1>'" src/10_core2.js (must be 1).
2. Insert right after the line `const OD_CHANGELOG=[` this entry:
   {v:'v90m-beta.N',date:'<d Mon yyyy>',items:[{t:'FIXED',s:'...'}]},
   Give it 2-4 plain-English items. Allowed tags: FIXED, NEW, CHANGED only (the unit lint fails on anything else).
3. bash tools/build.sh v90m-beta.N, then check out/v90m-beta.N/index.html:
   - grep -c "ALL_OPEN=true" = 1
   - "3D models by Alex" ×4
   - "Made with ❤ by Alex" ×1
   - ls xc | wc -l = 14
   - page under the 3.6 MB cap
   - node tools/unit/run.js shows 0 FAIL
4. Gate, SOLO, on the built page served by python3 -m http.server 87xx:
   TAG=r13/sky-blue,r13/sky-blue-frame,life1,xf1,terrain,phone2,perf/pc-boot-lt,perf/pc-post-ready-link,perf/alloc-rate,perf/pc-roam-30s,perf/heap-30s,perf/touch-first-frames,perf/beacon-boot (+ new lane GOs) QUIET=1 timeout 590 node tools/tChkGo.js http://localhost:87xx/index.html <scratch>/gN
   Parse <scratch>/gN/tChkGo.json: d['res'] is a list of {id,c,ok,said}. Known reds that do not block a deploy: xf1/grass SLOW (>10 s on this box) and terr1/terrain-tyre-ath under load. Then fuser -k 87xx/tcp.
5. Deploy: DEPLOY_TRAILER="Co-Authored-By: ...\nClaude-Session: <your session url>" timeout 600 bash tools/deploy.sh out/v90m-beta.N "v90m-beta.N: <msg>". If it prints "not yet served", verify later with curl.
6. Commit "changelog: v90m-beta.N" with the same trailer. Loop up to 4 times: fetch, rebase onto FETCH_HEAD, unit, push origin HEAD:alex/od-int2 (workers may have pushed in between).
7. Beta folder <scratch>/bN:
   - beta.html = index.html with <title>Overdrive Beta</title> inserted after <head>
   - also copy km.js, models.js, tune.json, models/{lx,as,xf,qa}.js and all xc/*.js
   Publish with the Artifact tool: url = the Beta artifact, file_path beta.html, root = bN, a files map listing every copied file, label beta.N. On a first publish from your session, first run Artifact action list scope files on the url (otherwise the publish is refused as "unread").

REPORTING: after each deploy or important finding, tell Alex in plain words: what changed for him, what is measured, and what is next. No jargon, no questions.
