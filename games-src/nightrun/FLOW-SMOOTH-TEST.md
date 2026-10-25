# Flow test: continuous sprite frames (paste-ready)

Why: our strips have 3-6 frames per action at 4-14 fps. Smooth side-scrolling animation needs 8-16 frames for an idle breath, 8 for a run cycle,
12-16 for a hit or dash, 16+ for a jump, at 12-24 fps. Poses painted one by one drift in shape and colour; a clip does not.
Targets and sheet rules: games-src/nightrun/ASSET-SPEC-SMOOTH.md (branch nr/W253-smooth).

## Method A (preferred): EXPAND the sheets we already have, do not replace them
Our existing frames are the keyframes. Keep every one of them, in the same order, untouched. Flow only adds the in-between frames.
1. Take two neighbouring frames of an existing strip, for example Kai idle frame 1 and frame 2 (cut them from media/anim/kai/idle-strip.webp).
2. Use them as the START and END frame of a short clip ("first frame to last frame" if Flow offers it; otherwise start frame plus the prompt
   below). Ask for 3 in-between poses.
3. Repeat for 2-3, 3-4 and 4-1 (the loop closes back to the first frame). A 4-frame strip becomes 16 frames: 4 originals + 12 new in-betweens.
4. Rebuild the strip with originals and new frames in order, same cell size and anchor, raise its fps in the sheets json to match. The old strip
   stays in git history; nothing is deleted.
Prompt for each pair:
> Two key poses of the same character are given as the first and last frame. Create the smooth in-between motion only: 3 intermediate poses, same character design, same colours, same outline weight, same camera, same scale, same flat background. No new details, no style change, no zoom, no pan.
Pass checks: first and last frames are pixel-identical to the originals; each in-between lies between its neighbours (silhouette overlap >= 85% with both);
colour drift < 6 per channel; foot line within 2 px.

## Method B (only where there is no existing art for an action): clips from the reference

1. Reference: the existing Kai reference sheet (foot-kai-sheet in FOOT-FLOW-PROMPTS.md). Use it as the start image for every clip.
2. Generate a short looping clip per action with the prompts below. Keep the same seed, style block and reference for every clip.
3. Extract frames at 12-16 fps, cut the background (games-src/scripts/cutout.py), align every frame to one foot anchor and one cell size,
   2-4 px transparent padding, save as a strip (frames x cell wide, one cell high) in games/mainhattan-nightrun/media/anim/<who>/<act>-strip.webp
   with its sheets json (frames, fps, w, h, anchor) in games-src/anims/mainhattan-nightrun/sheets/<who>/.
4. Pass checks (measurable): idle 8-12 frames, run 8; consecutive-frame silhouette overlap >= 85%; colour drift first-to-last < 6 per channel;
   foot line varies <= 2 px; no background fringe; last frame is not identical to the first.

## Style block (put in front of every prompt)
> Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon, readable silhouettes, crisp dark outline, chunky shapes that read at small size

## Prompts
**Kai idle (target 10 frames @ 12 fps)**
> Same character as the reference (Kai, the courier). Locked camera, no zoom or pan. Flat plain neutral background, no cast shadow, no motion blur. Full body, facing right, feet on the same line the whole time. Slow breathing idle: shoulders rise and fall, weapon hand relaxed, jacket and satchel settle slightly. Seamless loop. Same painted style, outline weight and colours as the reference throughout.

**Kai run (target 8 frames @ 14 fps)**
> Same character as the reference (Kai). Locked camera, flat plain neutral background, no cast shadow, no motion blur. Run cycle in place, 8 poses per stride at constant speed, leaning forward, feet touch the same ground line, arms swinging, satchel bouncing. Seamless loop. Same style, outline and colours as the reference.

**Kai hit (target 6 frames @ 16 fps, not a loop)**
> Same character as the reference (Kai). Locked camera, flat plain neutral background. Takes a hit: head snaps back, body recoils, one step back, recovers to the ready stance. 6 poses, strong anticipation and recovery, same style and colours as the reference.

**Boss idle, as separate layers (target 12 frames @ 12 fps each)**
- Body layer: > Same boss as the reference. Locked camera, flat plain neutral background. Only breathing: chest and shoulders move slightly. Arms held completely still. Seamless loop.
- Arms layer: > Same boss as the reference. Locked camera, flat plain neutral background. Only the arms move (slow sway); the body is completely still. Seamless loop.
- Draw both on one shared pivot; the game composites body, then arms, then effects.

**Flight enemy bank (target 8 frames @ 12 fps)**
> Same enemy ship as the reference, top-down three-quarter view, flat plain neutral background, locked camera. Engine flicker and a slow bank left to right and back. Seamless loop. Same style and colours as the reference.

## Do not
- Ask for a sprite sheet in one image (frames drift).
- Let the tool add shadows, ground, text or a new camera angle.
- Change the character's design between clips.
