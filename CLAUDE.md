# Mainhattan Overdrive dev kit: read first (loads into every session on this branch)

The game is LEGO-2K-Drive-style, set in Frankfurt and Athens. The live page is `games/mainhattan-overdrive/` on `alex/brave-carson-rbpmlk`.
Details: `docs/HANDOFF.md`. The owner is Alex (iPhone 16 landscape and PC); be terse with him.

## Standing orders from Alex
- **Deploy without asking.** When a split build passes the gate, run `bash tools/deploy.sh <outdir> "<msg>"`,
  republish the beta artifact (claude.ai/artifact/P6zT2b2SwfHYguRTtb67Ug, with km.js in `files`) and tell Alex what changed.
- **The gate is `tools/tPlay.js` (alex/od-qa) on the SPLIT build.** It uses real touch and keyboard, human-like steering, no warps or
  force-clicks. smoke and tOut are sanity checks only. Never deploy an unsplit build (3.6 MB cap).
- **Feature freeze:** only fixes until tPlay passes AND Alex scores the game 6/10 or higher. Never self-score fun.
- Keep `ALL_OPEN=true`, the credits "Made with ❤ by Alex", English UI, gas default on touch, and no model names in files or commits.
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

## Cost and speed rules (99.8% of the tokens were context re-reads)
- Set `model` on EVERY cloud session: `claude-sonnet-5-5` to build, fix, test and integrate; Opus only for hard design calls.
- Run at most one fix worker plus one integrator at a time. Parallel workers on one 3.7 MB file caused rebuild loops.
- Use a fresh session per task and write a handoff before ~150k context. Never keep going in a 400k+ context.
- Run a test once in the background and wait for its notification. No `sleep`/`grep` polling loops and no scheduled check-ins.
- Release candidates: build with `reapply.sh` in the RELEASE.md order, split, run tPlay once, deploy. No 22-run matrices.
- The fixer deploys its own green build with `tools/deploy.sh`. Don't hand off between sessions just to deploy.
- The coordinator only routes feedback; it does no technical work and no unfiltered `list_sessions`.
