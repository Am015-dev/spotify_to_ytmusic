# Google Flow: expand our sprite strips with the method we already proved

Our 229 approved sheets were made with the STRIP method (games-src/anims/FLOW-SPRITE-STRIPS.md): ONE Flow image per action, all frames side by side in
one row, the character's own painting as the "@" reference, then cut into frames. It stays the method. Frame-by-frame images and video drift; a strip
is drawn as one sequence, so cycle, scale and ground line stay consistent. What changes: MORE frames per action (we have 3-6; smooth needs 8-16).
Nothing is replaced: the approved strip stays as the reference and as a fallback; a new strip only goes in after the owner's viewer review.

## Frame targets (games-src/nightrun/ASSET-SPEC-SMOOTH.md has the full list)
Kai idle 8 (@10-12 fps), run 8 (@14), hit 6, melee 6, dash 6, jump 8, die 8; common foes run 8, idle 8, melee 6; each boss idle 8-12, attack 8-12.

## How to get 8 frames when one strip holds 4-6: two strips of ONE cycle
Ask for the cycle in two halves, with the SAME reference and the SAME shared rules, so both halves keep the same design and scale:
- Strip A = frames 1-4 of the 8-frame cycle, strip B = frames 5-8. Name them strip-<who>-<act>a and strip-<who>-<act>b (act stays one word).
- Spell out every frame in each prompt, so strip B continues exactly where strip A ends and frame 8 leads back into frame 1.
- Or try 6-8 frames in one 16:9 row first (rule 2: draw the subject a little smaller, wide gaps). If a row of 8 comes out cramped or touching, use the two-strip way.
- If Flow returns a 2x4 grid, we re-arrange the quadrants into a row locally (no new image needed).

## Steps in Flow (what you do)
1. New Flow project "Nightrun expand". Upload as "@" ingredients: the CURRENT approved strip of the action (e.g. media/anim/kai/run-strip.webp on white)
   and, if you have it, Kai's reference painting. Attach both to every card of that character.
2. Image mode, 16:9, paste the prompt below (fill {n}, the frame list, the facing), generate 4 takes, keep the one that looks like the reference character
   with the cleanest row. Download the image as strip-kai-run-a.jpg etc.
3. Send the images (or drop them in games-src/nightrun/incoming/flow/). We cut, scale, pack, auto-check and show them in the viewer for your approve or needs work.

## Prompt (shared rules from the strip method, copied verbatim, only the blanks change)
> Same character as the reference picture: identical design, colours, painted style and outline weight. 2D game sprite sheet: EXACTLY {n} frames in ONE single horizontal row, left to right, never two rows, never a grid. Each frame inside its own equal-size slot with WIDE empty gaps between the slots; nothing (weapon, foot, cape, effect) reaches into or touches the neighbouring slot; draw the character a little smaller so everything fits. Every frame shows the same character at the same size and scale, standing on the same ground line, nothing cropped. Strict SIDE VIEW facing RIGHT in EVERY frame; the head stays on the same side and the character never turns around. Draw ONLY the character itself in each frame, never a scene or buildings. Flat plain pure white background, no floor, no shadows, no frame borders, no numbers, no text, no letters. The cycle, frame by frame: {frame list}.

## Frame lists to paste (cycles spelled out)
- **Kai run, 8 frames, two strips of 4**
  - A (frames 1-4): 1 contact, front leg extended, rear arm forward; 2 down, body lowest, knee bent; 3 passing, rear leg swings under the body; 4 up, push-off, body highest.
  - B (frames 5-8): 5 contact, other leg extended, other arm forward; 6 down; 7 passing, other leg swings under; 8 up, push-off, leads back into frame 1.
- **Kai idle, 8 frames, two strips of 4 (bigger, gentle breath than the current one)**
  - A: 1 neutral stand; 2 inhale, chest and shoulders rise, jacket lifts slightly; 3 held breath, slight head tilt up; 4 start to exhale, shoulders begin to drop.
  - B: 5 exhale, shoulders lowest, weight shifts to the other foot; 6 settle, satchel swings back; 7 small head turn back; 8 returns to the neutral stand of frame 1.
- **Kai hit, 6 frames (one strip)**: 1 ready stance; 2 impact, head snaps back; 3 recoil, body leans back, arms out; 4 stagger, one step back; 5 recover, weight returns forward; 6 ready stance again.
- Other actions: same pattern, one line per frame, the first and last frames equal the first pose of the cycle.

## Things we learned (from the strip playbook, keep them)
- The reference's orientation beats the prompt: if the reference faces left, prompt LEFT.
- Long weapons held close to the body so they stay inside their slot. Spinning parts: "SOLID, SHARP, NO motion blur".
- Bodies on white, light effects on black. Each action key is ONE word without hyphens.

## Pass checks (we run them, plus your viewer review)
Frame count equals the card; no empty or clipped frames; no size jumps; neighbouring-frame silhouette overlap >= 85%; colour drift < 6 per channel;
foot line within 2 px; no white fringe; frame 8 close to frame 1 (the loop). Only strips you approve in the viewer go into the game.
