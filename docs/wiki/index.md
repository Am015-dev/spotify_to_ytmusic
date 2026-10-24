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
- Proto-2 2K look (?proto=1, golden sun, haze, glows, speed lines): docs/HANDOFF_look2k-r24j.md, shots docs/shots/proto2, tool tools/tProto2.js
- Proto-3 (?proto=1: phone bloom, sky env gloss, car contact AO; cast shadows WIP behind PROTO.K.shCast): docs/HANDOFF_look2k-r3.md, shots docs/shots/proto3, tool tools/tProto3.js
- [game/render-and-perf.md](game/render-and-perf.md): tiers, culling, streaming, telemetry, iPhone gate
- [game/flags.md](game/flags.md): OD_FLAG, preview build, flag lifecycle
- [game/shot-library.md](game/shot-library.md): shot IDs, tools/shot.js, 2K references

## Learned from other browser games (techniques in our words)
- [learn/streaming.md](learn/streaming.md): fiveplay.lol io worker: range reads, hints, OPFS store, build-id URLs, progress
- [learn/phone-profile.md](learn/phone-profile.md): their low-memory profile: 2 cores, mip skip, shadows off; GPU 1.16 -> 0.5 GB
- [learn/stk.md](learn/stk.md): SuperTuxKart chase camera ported (SKC): one smoothed length + FOV, wall hysteresis, GO cam/steady
- [learn/threads-gpu.md](learn/threads-gpu.md): OffscreenCanvas GPU worker, shader packs, recipe prewarm, COOP/COEP on our hosts

## Plans
- [plan/open-world-streaming.md](plan/open-world-streaming.md): 7 iPhone-first lanes: low-mem profile, chunk cache, car swap, prewarm, tiles, read-ahead

## Elsewhere (not wiki)
src/MAP.md (one line per module), CLAUDE.md (binding rules), docs/DESIGN_racers_rebuild.md (3-lane rebuild plan), docs/LESSONS_and_old_rules.md.
