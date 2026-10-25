# Flow test: continuous sprite frames (paste-ready)

Why: our strips have 3-6 frames per action at 4-14 fps. Smooth side-scrolling animation needs 8-16 frames for an idle breath, 8 for a run cycle,
12-16 for a hit or dash, 16+ for a jump, at 12-24 fps. Poses painted one by one drift in shape and colour; a clip does not.
Targets and sheet rules: games-src/nightrun/ASSET-SPEC-SMOOTH.md (branch nr/W253-smooth).

## Method (one character, two actions first)
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
