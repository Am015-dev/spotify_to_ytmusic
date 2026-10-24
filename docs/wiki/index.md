# Wiki index (read this first, then only the 1-2 pages you need)
Rules: [SCHEMA.md](SCHEMA.md) | history: [log.md](log.md) | pins: [sources/racers.md](sources/racers.md)

## LEGO Racers study (facts in our words, no copied code)
- [racers/race-loop.md](racers/race-loop.md): laps, checkpoint graph, standings, points
- [racers/rubber-band.md](racers/rubber-band.md): 15 s off, then x1.05 / x0.95; ours is stronger
- [racers/powerup-bricks.md](racers/powerup-bricks.md): 4 colours, white stacking, level table
- [racers/ai-lines.md](racers/ai-lines.md): recorded lines, lane width, item-use rolls
- [racers/physics.md](racers/physics.md): drag/thrust, turn radius, powerslide, walls
- [racers/camera.md](racers/camera.md): FOV, 3 views, lag
- [racers/file-formats.md](racers/file-formats.md): .rab/.wdb/.pwb/.hzb/.spb etc.
- [racers/car-builder.md](racers/car-builder.md): 10x6x15 grid, 64 pieces, stats from volume

- [racers/code/rubber-band.md](racers/code/rubber-band.md): LGPL excerpt of the rubber-band update
- [racers/code/powerup-stacking.md](racers/code/powerup-stacking.md), [racers/code/ai-line-follow.md](racers/code/ai-line-follow.md), [racers/code/camera.md](racers/code/camera.md): LGPL excerpts
- [sources/licences.md](sources/licences.md): what we may port from each repo (LGPL/MIT/GPL), no assets

## Our game (key files, invariants, known bugs)
- [game/build-and-deploy.md](game/build-and-deploy.md): build.sh, ORDER/LAZY, deploy.sh, PUBLISH_FILES, Beta
- [game/tests-and-gates.md](game/tests-and-gates.md): unit, GO checklist, gate.sh, bughunt, bot
- [game/traffic.md](game/traffic.md): NPC cars, law, contact, phone compaction
- [game/on-foot.md](game/on-foot.md): minifig walking, edges, collisions
- [game/vehicles-xform.md](game/vehicles-xform.md): cars, auto transform, driving, damage
- [game/garage-and-models.md](game/garage-and-models.md): builder, collection, LDraw chunks
- [game/races-and-tracks.md](game/races-and-tracks.md): race world, items, duels, proto, quests
- [game/render-and-perf.md](game/render-and-perf.md): tiers, culling, streaming, telemetry, iPhone gate
- [game/flags.md](game/flags.md): OD_FLAG, preview build, flag lifecycle
- [game/shot-library.md](game/shot-library.md): shot IDs, tools/shot.js, 2K references

## Elsewhere (not wiki)
src/MAP.md (one line per module), CLAUDE.md (binding rules), docs/DESIGN_racers_rebuild.md (3-lane rebuild plan), docs/LESSONS_and_old_rules.md.
