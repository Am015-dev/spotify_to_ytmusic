# Game sprite animations with Google Flow: the strip method

Portable playbook for any project that needs 2D game animations (characters, bosses, machines, ships, weapon FX,
explosions, animated props). Proven on TALON / Mainhattan Nightrun, 2026-10-20 → 10-21: 229 sprite sheets, owner-approved.
Reference implementation (copy and adapt, don't rewrite), in the Windows asset pipeline (TALON_assets):
`strip_rules.py`, `build_nr_more.py`, `make_anim_sheets.py`, `eval_sprites.py`, `run_strip_group.sh`, `viewer/sprites.html`.

## 1. The method in one line
**One Flow image per action, all frames side by side in one row (a "strip")**, the character's own painting as the "@"
reference → cut into frames → one sprite sheet (`.webp` + `.json` with frames/fps/w/h/anchor) → owner reviews in a
viewer → regenerate only what fails.

Why: frames prompted one by one come out as unrelated poses (same leg forward, size jumps, no cycle). A strip is drawn as
one sequence, so the cycle, scale and ground line stay consistent. **1 image = 3-6 frames, no video credits.**

## 2. Pipeline
| Step | What | Output |
|---|---|---|
| 1 Reference | one clean painting/sheet per subject: white bg for bodies, **black bg for light FX** | uploaded once per Flow project as "@" ingredient |
| 2 Cards | a builder writes `prompts-strip.json` = `{style, cards: {strip-<who>-<act>: {prompt, ingredients, frames}}}` + `refs.txt` (FULL paths) | one folder per group, ≤ 10 refs per group |
| 3 Generate | Flow 16:9 for rows (9:16 only for column strips, e.g. long ships) | `strip-<who>-<act>.jpg` |
| 4 Cut + pack | split per figure, ONE scale for the whole strip, feet on the bottom edge (FX: centred) | `anim/<who>/<act>-strip.webp/.json` |
| 5 Auto-check | empty frames, clipped edges, size jumps, identical frames, leftover white, frame count ≠ card | flags list (`sprite_eval.json`) |
| 6 Owner review | viewer page: plays each sheet at game speed, ✓ Approve / ✎ Needs work + comment, red border = auto flags, Export JSON | `sprite_reviews.json` = the redo list |
| 7 Fix round | local fix if possible (mirror, re-cut, re-arrange), else regenerate with the owner's comment as an extra prompt line | back to step 5 |

Key naming: the act is ONE word without hyphens (`runshoot`, not `run-shoot`) because the cutter splits the key at the last "-".

## 3. Prompt rules (put them in ONE shared function every builder imports)
Each rule is a broken strip. Copy verbatim, fill `n`, facing, subject, background:

1. "2D game sprite sheet: EXACTLY {n} frames in ONE single horizontal row, left to right, never two rows, never a grid."
2. "Each frame inside its own equal-size slot with WIDE empty gaps between the slots; nothing (weapon, foot, cape, effect)
   reaches into or touches the neighbouring slot; draw the {subject} a little smaller so everything fits."
3. "Long weapons (spears, staffs, batons, rifles, cannons) are held upright or close to the body so they stay fully inside
   their own slot."
4. "Every frame shows the same {subject} at the same size and scale, standing on the same ground line, nothing cropped."
5. "Strict SIDE VIEW facing {RIGHT|LEFT} in EVERY frame, also while hit, falling and lying on the ground; the head stays
   on the same side in every frame and the {subject} never turns around." (no facing for FX)
6. "Draw ONLY the {subject} itself in each frame, never a scene, landscape, skyline or other buildings around it."
7. Background: "Flat plain pure white background, no floor, no shadows, no frame borders, no numbers, no text, no letters."
   / FX: "Flat pure black background with only the light, glow and colour of the effect, no scenery …"

Then: identity line ("Same character as the reference picture: identical design, colours, painted style") + the action's
cycle spelled out per frame ("1 contact, 2 down, 3 passing, 4 contact other leg, 5 down, 6 passing").

### Lessons from review rounds (add to prompts / process)
- **The reference's orientation beats the prompt.** If the reference faces left, prompt LEFT and describe the pose relative
  to the reference ("keeps exactly the orientation of the reference … falls FORWARD, head ends on the LEFT"). Prompting the
  opposite of the reference gives frames with mixed directions.
- **Light-FX strips need a still of the SAME effect as reference.** A different effect as ref (explosion for a shield) →
  Flow copies its shape (one big burst instead of a strip). A scenery ref → Flow draws skylines.
- **Rotors / spinning parts: "SOLID, SHARP blades, NO motion blur, NO transparent spinning discs".** Blurred pale discs on
  white get keyed out as background and overlap the neighbour.
- **Thrown/fired weapons: say the weapon stays in the hand**, the shot is a separate effect; otherwise the sword "fires".
- Columns only work in a **portrait 9:16** image; in 16:9 the model squeezes overlapping figures.
- Bodies/props on white, light effects on black. Dark smoke on black keys out (fade-out frames come out faint): accept or
  draw smoke-heavy FX on white.

## 4. Frames, layout, cut-out per kind
| Kind | Actions (frames) | Bg | Cut-out |
|---|---|---|---|
| Characters | run 6, idle 4, shoot 3, melee 4, die 4, jump 4, hurt 4, land 3 | white | AI remover (rembg `isnet-anime`) |
| Machines / animals / props with a body | idle 4, shoot 3, die 4 | white | colour-key matte with hole fill, small `hole_min` (~30 px) so gaps between legs/rotors are removed (AI remover makes machines see-through) |
| Bosses | idle 4, attack 4, hit 3, defeat 4 | white | colour-key matte, per-boss hole size |
| Ships | flame 4, death 4 (banking = code tilt) | white, **column, 9:16** | colour-key matte |
| Weapon FX | muzzle 3, impact 4, beam 4 | black | brightness → alpha (un-premultiplied) |
| Explosions | burst 5 | black | brightness → alpha |

Playback fps: run 12, idle 4, shoot 10, melee 10, die 8, jump 8, defeat 6, muzzle 18, impact 14, beam/burst 12.
Characters face RIGHT, bosses/enemy ships face LEFT (whatever the game needs; decide once, write it in the rules).

## 5. Cutting rules (the cutter, not the prompt)
- Cut per connected figure, pieces to the nearest figure centre; figures touching at a thin point split at the narrowest neck.
- ONE scale for the whole strip (crouches/bobs keep their height); feet on the bottom edge; FX centred.
- **Frame count comes from the card.** Keep EVERY card in `prompts-strip.json` forever (the generator skips existing
  images anyway). A re-run that dropped finished cards made the cutter fall back to a default: 5-frame explosions cut as 4
  (frames merged, "moving") and 3-frame muzzles as 4 (one flash cut in half). Keep per-act fallbacks equal to the builder.
- **Grids are refused** (no sheet built). If the 4 frames are fine but laid out 2×2: re-arrange the quadrants into a row
  locally instead of paying for a new image.
- **Direction fixes are owner decisions**: `MIRROR` (whole strip) / `MIRROR_FRAMES` (single frames, applied after MIRROR).
  Never auto-flip: a look-alike test and a vision model both guessed wrong.
- Tightly overlapping strips cannot be cut cleanly → regenerate, don't invent more cutting rules.

## 6. Review loop (what the owner liked)
- A viewer tab plays every sheet at game speed (speed slider, pause/step, optional smoothing), grouped by category.
- Per sheet: ✓ Approve / ✎ Needs work (click again = undo), comment box (a comment alone = needs work), red border + list
  of auto flags, filters All / Auto-flagged / To review / Approved / Needs work, "Approve shown unflagged", Export JSON
  (status, comment, flags, sheet path per item). Saved server-side on every click.
- After a fix: set the item back to "To review" and append `[what changed]` to the owner's comment; never mark it approved
  yourself. Look at every fixed sheet (contact sheet image) before handing it back.
- Many auto flags are false alarms (fade-out frames "empty", puffs "small first frame"); the owner's eye decides.

## 7. Running Flow
- Groups of **≤ 10 references** per Flow project (the asset list shows ~15; more and refs get lost).
- Two lanes in parallel when there is volume; chain each lane on its own previous group, never make one wait for the other.
- Cloned Chrome profiles lose the Google login after ~1.5 h: re-clone right before use or use the main lane profile.
- Never page-level Ctrl+A/Delete inside Flow (trashes project media).
- Small fix rounds (≤ 5 images) on one lane are faster than setting up a second.

## 8. Checklist for a new project
1. Reference paintings exist (white bg; FX stills on black). Decide facing per kind.
2. Copy `strip_rules.py` + a builder; list subjects × actions × frame counts; generate cards; read one prompt.
3. Pilot one character (run + idle) → cut → preview → fix the rules if something repeats.
4. Run the rest in ≤ 10-ref groups. Cut all. Run the auto-check.
5. Owner review in the viewer → export → fix round (local first, regenerate second) → re-review.
6. Hand the game `anim/<who>/<act>-strip.webp/.json` (+ smoothing values: key-frame holds, hit-stop + flash, squash,
   idle bob, cross-fade only for idle/FX).

## 9. Calm looping scenes (music-mix videos) — Late Show, 2026-10-21
Same method, used for a seamless background loop instead of game sprites (`TALON_assets/build_late_show_loop.py`,
`make_late_show_loop.py`): one Flow background plate (no moving parts) + one still per animated element + strips from
those stills, cut with `make_anim_sheets.strip_sheet`, layered in Python and piped to ffmpeg.
- **Every layer's cycle (frames / fps) must divide the loop length** (12 s: cat 4 fr @ 1 fps, beam 6 @ 2, rain 6 @ 6),
  so the last frame runs into the first. Smoothstep cross-fade between frames = calm, no hard cuts.
- Light layers (beam, rain) are added with a screen blend; sprites (cat) are alpha-composited, bottom-centre anchored.
- **Effect stills: style line WITHOUT scene words.** "…an old cinema on a rainy night" in the style made Flow paint a whole
  hall behind the beam and a cinema front behind the rain (that one became the video thumbnail).
- **Painterly animals on white: use the colour-key matte, not the AI remover** (rembg kept 1 % of the cat).
- Projector beam from behind the viewer: narrow source at the top edge, cone widening onto the screen; strong (0.85)
  because light added onto a bright room barely shows.
- Iterate placement on ONE rendered frame (`make_late_show_loop.py preview`), render the full loop once at the end.
- Cost: 4 stills + 2 redo + 3 strips = 9 Flow images for a 25-minute video.
