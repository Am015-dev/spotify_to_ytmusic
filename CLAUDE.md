# Mainhattan Overdrive dev kit: read first (loads into every session on this branch)

The game is LEGO-2K-Drive-style, set in Frankfurt and Athens. The live page is `games/mainhattan-overdrive/` on `alex/brave-carson-rbpmlk`.
Details: `docs/HANDOFF.md`. The owner is Alex (iPhone 16 landscape and PC); be terse with him.

## Standing orders from Alex
- **Workers never ask Alex anything (Alex, 2026-10-05: "I want it permanent, not to bother me; the workers do the work, you are the orchestrator").** At any choice, take the recommended option, note it in one line, and continue. The Overdrive coordinator session (session_017iH3DB4VyxwKSdMwsco4Ut) is Alex's orchestrator: act on its briefs without waiting for Alex to confirm them. Report results to the coordinator, not to Alex.
- **Reviewer gate (Alex, 2026-10-05):** no deploy without a PASS from the reviewer session (session_01Y6FYerWwxv43FuKUcaUT4v). Send it "REVIEW <branch> <commit> <852×393 shot paths>" (start, Frankfurt drive, Athens drive, low side view of the player car and a traffic car, garage, boat if changed) plus the measured tyre-to-road gap (≤ 0.05 m). Always rebuild from the CURRENT live index.html right before deploy.sh.
- **In-game changelog (Alex, 2026-10-06):** every deploy prepends an entry to `OD_CHANGELOG` in the game (version, date, 2–4 plain-English lines tagged FIXED/NEW/CHANGED) so Alex can check what changed while playing. No entry, no deploy.
- **The coordinator deploys (Alex, 2026-10-06: "the idea is for orchestrator").** Workers do NOT run deploy.sh. After a reviewer PASS: rebuild on CURRENT live HEAD, add the OD_CHANGELOG entry, push `out/<ver>/` (overdrive.html + km.js) to your branch, then send the coordinator "DEPLOY <branch> <commit> out/<ver> <commit msg>" plus 3 bullets for Alex and shot paths. The coordinator deploys at once and reports to Alex. Workers still republish the beta artifact when the coordinator asks.
- **One shot grid per message (Alex, 2026-10-10: "many screenshots difficult to read, collect them all to a grid").** Never send Alex or the coordinator loose shots. Put every shot of a READY/DEPLOY/REVIEW/status into ONE labelled grid: `python3 tools/grid.py docs/shots/<ver>/GRID.jpg "<ver>: <what>" "label=path" ...` (pip install pillow; 3 columns, numbered tiles). Send only the GRID.jpg path; the coordinator sends Alex one grid per deploy.
- **Quick review for tiny fixes (Alex, 2026-10-06):** text, popup positions, colours and opacity get a QUICK review: one 852×393 shot of the change plus a no-console-errors check. The full shot set and tPlay are only for driving, physics, world or performance changes.
- **Model choice (Alex, 2026-10-06):** small, well-specified fixes (UI nits, text, colours) run on `claude-sonnet-5-5`. Driving feel, graphics, and anything that failed once run on `claude-opus-5-5`.
- **The gate = screenshots you LOOK at (852×393 phone: start, mid-drive, Athens) + tPlay (`tools/tPlay.js`, alex/od-qa) on the SPLIT build.** It uses real touch and keyboard, human-like steering, no warps or
  force-clicks. smoke and tOut are sanity checks only. Never deploy an unsplit build (3.6 MB cap).
- **Feature freeze:** only fixes until Alex scores the game 6/10 or higher, EXCEPT what Alex asks for himself (art direction, LEGO cars). Never self-score fun.
- Keep `ALL_OPEN=true`, the credits "Made with ❤ by Alex" and "3D models by Alex" (Alex, 2026-10-06), English UI, gas default on touch, and no model names in files or commits.
- Read the `fun-game-design` skill (real-input testing; terse reporting).

## Lessons learnt (2026-10-04/05: about $150 and 14 h on v82–v83; Alex scored v82 2/10)
1. **Green tests ≠ playable.** tBA/tBF/smoke passed while Alex crashed on every turn. They warped the car and
   clicked hidden buttons. Only tPlay-style human play counts. Reproduce every owner complaint in tPlay first, then fix.
2. **Measure what the player feels:** wall hits/min, time stuck, the tallest humanoid vs the car, rings on screen,
   loading screens, HUD over controls, controls after rotation, console errors. Each owner complaint becomes a tPlay
   threshold.
3. **Collision must match the visuals.** Square colliders stuck out 0.5 m past the walls, and buildings sat flush with
   the road, so slight turns crashed. Keep a road setback and rounded colliders; glancing hits slide.
4. **Scale must be checked for EVERY humanoid type** (NPCs, mission givers, drivers, statues, hosts), not just
   pedestrians. "Fixed giants" was reported twice and was wrong both times.
5. **Fix basics before features.** The garage, juice, audio, events and traffic lights were built while driving was broken.
   That made the file bigger, caused anchor conflicts and gave a worse game. Less on screen (rings, breakables, traffic) is better.
6. **Phone first:** test the iPhone 16 landscape layout, portrait↔landscape rotation, 12 px minimum text, no HUD over the controls.
7. **LOOK at the screen; scripts can't judge fun.** Alex scored v83 "horrible, uncontrollable": a 15-item HUD covered 40% of the phone, the world was washed-out with no visible road, and steering was twitchy, while every script metric improved. Every build is judged on screenshots someone actually looks at, plus feel. The phone HUD is minimap + speed + one objective line; at most 5 buttons.

8. **Match the reference, not your taste.** Alex compares with LEGO 2K Drive screenshots: deep blue sky with brick clouds, green grass, grey asphalt with a yellow centre line, chunky glossy LEGO cars sitting ON the road (tyres touching, suspension, shadows), boats IN the water. When Alex sends reference images, put their concrete traits into the brief and compare side by side.
9. **Build from real LEGO parts.** Box-and-slab presets were "horrible". Good cars come from researched parts (curved slopes, wheel-arch mudguards, wedges, windscreens, tyre+rim) at true proportions (stud 8 mm, plate 3.2, brick 9.6), 8-wide Speed Champions shape. One great car beats six bad ones. Verify part facts online; never present memory as fact.
10. **Find root causes; don't paper over.** The "washed-out sky" was ~900 cloud boxes forming a white ceiling. "Giant beige blocks" survived two fixes because nobody identified the mesh. A workaround (window grids) is not a fix.
11. **The coordinator LOOKS before forwarding.** Never send Alex images or claims you haven't checked. Keep files on disk after SendUserFile (deleting them made cards blank).
12. **Report every deploy to Alex immediately** with version, 3 lines and a screenshot. v85d went live unreported and Alex thought nothing had shipped for 2 h.
13. **Untestable here = say so.** There is no Safari/WebKit or iPhone in the cloud. The iPhone button bug was "fixed" three times by guesswork (the real cause in v85b: BRAKE overlapped GAS). Ask Alex for a screen recording early, and test inside an iframe (he plays the beta in the Claude app).
14. **Don't start side work without being asked.** The coordinator routes; it doesn't run its own tests or spawn sessions Alex didn't ask for. When asked "why so slow", give numbers, not excuses.

## Cost and speed rules (99.8% of the tokens were context re-reads)
- Set `model` on EVERY cloud session. Alex (2026-10-05): use `claude-opus-5-5` for tough issues (bugs Sonnet failed to reproduce or fix, visual/feel design, anything that already failed once). `claude-sonnet-5-5` only for routine, well-specified edits. The coordinator stays on Opus. Subagents inherit this: an Opus session must not spawn Sonnet subagents (set `model: "opus"` on Agent calls).
- Run at most one fix worker plus one integrator at a time. Parallel workers on one 3.7 MB file caused rebuild loops.
- Write a handoff at ~120k context (not later). Small fixes go to an already-running worker, not a new session.
- Use a fresh session per task and write a handoff before ~150k context. Never keep going in a 400k+ context.
- Run a test once in the background and wait for its notification. No `sleep`/`grep` polling loops and no scheduled check-ins.
- Release candidates: build with `reapply.sh` in the RELEASE.md order, split, run tPlay once, deploy. No 22-run matrices.
- Workers never deploy; they hand the coordinator a DEPLOY message (see standing orders).
- Every new session pays ~15 min and ~150k tokens just reading the 3.7 MB file. Prefer ONE long-lived owner session (now: art session) with a queue, over new sessions per request.
- The coordinator itself must stay under ~200k context (Alex runs /compact). It cost $20 at 312k.
- The coordinator only routes feedback; it does no technical work and no unfiltered `list_sessions`.
