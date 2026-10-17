# Crown City Smash: media handoff (laptop session -> Linux session)

The laptop session makes images, Flow clips and 3D models only. Testing and the live deploy happen on Linux.

## What is on the branch (alex/brave-carson-rbpmlk)
- `games-src/kot/media.js`: story clip player, portrait slots, GLB reader (`CCMedia.loadGLB`), `?old3d=1` (built models), `?preview=1` and any `-next` page (open all chapters, replay clips).
- `games-src/kot/three3d.js`: GLB characters hooked into `buildMonster`; `monFace()` / `monPic()` use the Flow pictures in menus; `story.js`, `board.js`, `net.js` use `monFace`.
- `games/crown-city-smash/models/*.glb`: 8 characters (no Clampede). ~12k triangles, 1024 px JPEG texture, 0.5-1.1 MB each, loaded only when that monster is in a match.
- `games/crown-city-smash/media/media.json`: lists clips, portraits, avatars, models. `tools/media-tools.py manifest` rewrites it.
- `games/crown-city-smash-next/index.html`: preview build (adds `<base href="../crown-city-smash/">`, assets come from the live folder). **Live page `games/crown-city-smash/index.html` has NOT been rebuilt with the models yet.**

## To do on Linux before the live deploy
1. `python3 games-src/scripts/build-all.py crown-city-smash` (phone-check must PASS).
2. `cd games-src/kot && NODE_PATH=/opt/node-tools/node_modules node media-test.js` (clip player) and `node sweep.js` (several seeds, GAMES=3 STORY=1 ROT=1).
3. Compare against `?old3d=1` if the sweep shows timeouts: on the laptop (software GPU) the sweep with the models had 2 failures (90 s tap timeout, story game over 300 s) and the no-model baseline had none. If the Linux sweep shows the same, lighten the models (no shadow from the GLB meshes, 512 px textures, ~8k triangles) in `CCMedia.loadGLB` / `tools`.
4. `python3 games-src/scripts/build-all.py --deploy crown-city-smash`, then commit, merge origin, push.

## Known issues
- Clampede has no Flow picture, so it keeps the built model and drawn art.
- Voltusk and Glacyx files face -Z / +X; `YAW` in `media.js` turns them to +Z.
- The models were baked with nvdiffrast / nvdiffrec (NVIDIA non-commercial). The owner said to ship; keep this in mind for any "tip-supported" release.
- 3D models were made with TRELLIS.2 (MIT) on the A100 VM; DINOv3 came from an ungated copy (camenduru/dinov3-vitl16-pretrain-lvd1689m).
