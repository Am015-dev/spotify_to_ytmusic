# ART handoff (branch alex/od-art)
Build: `./art.sh pART1.py pART2.py pART3.py pCAR1.py` (base85.html = v85e overdrive.html, auto-created from commit c7aacb7), then `python3 tools/split_km.py overdrive.html outART`.
- pART1 / art.js: deep-blue sky; the old 900-box cloud layer (cloudsOn) was a white ceiling → replaced by 22 LEGO brick clouds on a far ring that follows the camera (2 draw calls). Green studded baseplate replaces walk/yard/park paving (both cities). Road texture: grey asphalt, light kerbs, white edge lines, double yellow centre. Roam forced to midday once (SET.tod='day', key mho_art_tod). Sky/light override in ART_light after applyMood/FL_apply. flash/hitFx clamped ≤ 1.
- pART2 / art2.js: brick trees (Frankfurt props tree/tree2/tree3/bush via ART_trees(D); Athens athTreeGeo + athTreeBy), autumn tints; no geometry studs (the first version had 6–10 M tris). A global MeshStandard hook adds procedural studs on up-facing untextured surfaces (fades with distance), a soft warm rim and gloss ≤ .5.
- pART3 / art3.js: contact shadow blob under the player car + up to 96 traffic cars (2 draw calls); boost = blue speed lines + FOV kick; HUD skin: purple NPC card with a yellow header and round portrait, thin boost bar at the bottom centre.
- pCAR1 (alex/od-cars) replaces pLG1 (Alex rejected pLG1).
Tools: tools/dev.js `/cshot` = canvas read back right after a render. The image viewer shows these PNGs paler than they are, so check colours by sampling pixels (/tmp px.py idea: decode PNG with zlib).
Open:
1. Athens giant plain beige wall (tPlay phone_ath_drive2 on art4) is still there. Not a BM.plain box ≥ 9 m (Batch/ABatch wrappers matched 0). Not walk (walk is green now). Suspect: another ribbon/polygon using node elevation p.y (like the v85d fix). Find it by GPU pick at the spot (geometry arrays are freed after upload, so raycasts miss).
2. Menu: no live 3D garage behind CHOOSE ACTIVITY yet; map screen not brick-styled.
3. tPlay: phone stuck, rotation and 12 px text fails also appear without art (v85 HUD/controls). Wall hits at 200+ km/h in GO! events: compare the run without art (run/car) against the run with art (run/art5).
