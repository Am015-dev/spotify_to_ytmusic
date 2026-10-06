# GB — LEGO brick builder + driver minifig (tag GB)

## What changed
`gb.js` (one module, inserted by `pGB1.py` at one anchor, see ANCHORS.md) extends the existing garage `#gbx`:
- **BRICKS tab → full-screen brick builder** on the current car. A stud grid is snapped to the car's own hull (raycast per cell; cockpit cells kept free for the driver).
  12 pieces: 1×1, 1×2, 2×2, 2×4, slope, tile, round, wedge, spoiler, exhaust, light, flag; 12 colours.
  Tools: place / paint / delete (also right-click), rotate (⟳ or R), undo (↶ or Ctrl+Z, mirrored pairs undo as one step), symmetric MIRROR mode (M), CLEAR, 3 presets (RACER, DOZER, PARADE), budget 120 bricks.
  Input: mouse (click = place, drag = orbit, wheel = zoom, hover ghost) and touch (tap = place, one- or two-finger drag = orbit, pinch = zoom); palette + colours at the bottom, toolbar at the top (wraps on phones).
- **World**: bricks + driver become ONE merged vertex-coloured geometry, plus one emissive geometry (lights/visor/exhaust glow) → ≤ 2 draw calls, cached per build.
  Bricks are visual only; handling mods are small and clamped to −5 %…+6 % per stat (weight → hull+/acc−, spoilers → grip, exhausts → accel). Saved inside the per-slot `mho_build`.
- **DRIVER tab**: minifig with 8 options each for face, hair/hat, torso, legs, colour; some locked behind story flags (Brandt, Ferreira, Çelik, Moreau, Sky Cup), Brick Packs and stars.
  Saved per slot (`mho_gbfig`). The driver sits in the cockpit in the world, stands next to the car in the garage, and its portrait (“YOU”) appears in every cutscene line box.
- **Garage during events stays blocked**: base v80 didn't actually hide the pause-menu GARAGE button (`#roamExit` was bound to the unwrapped function), so gb.js wraps `roamPauseOpen` + `gbOpen`. Existing PARTS/PAINT/HORN tabs are unchanged.

## Patch order
`./reapply.sh pGB1.py` → REAPPLY_OK. Page 3.39 MB (≤ 3.6 MB).

## Tests (`node tGB.js [A B C D E]`), all real input except where noted
- A (desktop, 16/16): existing paint+part clicks still work · builder opens (176 grid cells) · **30 bricks placed by mouse clicks** (37 clicks, all 12 piece types) · undo by button and Ctrl+Z · mirror places a twin, one undo removes both · R rotates · paint and right-click delete · budget caps at 120 · 3 presets load (17/20/22 bricks) · mods within bounds · **in the world: 2 meshes, renderer draw-call delta 0 vs bricks hidden** (merged; 2208 tris) · **reload: build persists and rebuilds identically** · slot 2 empty.
- B (1/1): quick-race lap, held throttle (race auto-steer), stock 102.3 s vs RACER build 101.8 s → **−0.5 %** (limit ±10 %).
- C (6/6): **phone portrait 10 bricks placed by touch taps** · undo by tap · two-finger drag orbits + pinches without placing · portrait layout: no overlaps, everything on screen, 73 % canvas free, buttons ≥ 28 px · landscape layout same (52 % free) · landscape tap places.
- D (7/7): 8 options per category · Flames locked on a fresh save, unlocked after the Ferreira flag · parts picked by click · **minifig persists after reload** · driver in the car (1 merged mesh, no bricks) · **cutscene shows the player portrait with the chosen parts**.
- E (1/1): during an event the pause GARAGE button is hidden and the garage won't open.
- Zero page/console errors in every run.
- **Smoke**: `node smoke.js .` → SMOKE PASS (590 s); I looked at `smoke/sheet.png` and the driver is visible in the cockpit.
  Run order: A/B/D ran before the last two small edits (wider camera on phone portrait, the pause-button wrapper); C, E and smoke ran after them.

Screenshots: `shots/gb_builder_desk.jpg`, `gb_builder_phone.jpg`, `gb_builder_land.jpg`, `gb_city.jpg` (built car in Frankfurt), `gb_driver_desk.jpg`, `gb_cutscene.jpg`.

## Known gaps
- Bricks snap with a heightmap (no overhangs); deleting a lower brick leaves the bricks above it floating.
- If you change PARTS after building, bricks keep their saved heights and can clip or float a little over the new parts.
- On some chassis the presets drop a few pieces that don't fit (counts above).
- The player only appears as the listener portrait. No story lines were written for "YOU".
- Touch has no hover ghost: a tap places the brick straight away (undo is one tap).
