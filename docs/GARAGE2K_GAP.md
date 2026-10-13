# LEGO 2K Drive builder vs ours: gap list (garage worker 7, 2026-10-07)

Alex (2026-10-07, 4/10): "the garage builder is still not even close to the 2K Drive."

## Sources (checked online today; the shots are in docs/shots/garage7/)
- Official Steam store screenshot of the Body Shop, "Gold Driller Truck": `ref_2k_bodyshop.jpg` (store.steampowered.com/app/1451810, ss_4a76…).
- Gameplay frames from garage videos (YouTube auto-frames): `ref_2k_heldbrick.jpg` ("LEGO 2K Drive: Master Class Build Tutorial", EVrzg5GuuSw) and `ref_2k_newvehicle.jpg` ("How GOOD is the Car Building in LEGO 2K Drive?", FPiW926m0Tc).
- Text: 2K garage page (bricks "sorted by type and category via the easy-access Brick Drawer"); GTPlanet review (undo; flat/metallic/glow paint; about 20×30×12 studs); DualShockers interview (chassis first, then bricks one by one, about 350 parts, mirror tool); GamesFuze and GamerTagZero guides (Build Limit bar, yellow arrow marks the front); NintendoLife and RapidReviews ("controls a little fiddly", "sometimes things snap in the wrong place").
- Not found online: a clear Brick Drawer screenshot. The "CURRENT" tile in the action bar shows the held part as a 3D render (seen in both video frames). Whether the drawer itself uses 3D thumbnails is UNVERIFIED.

Side by side: `docs/shots/garage7/gap_side_by_side.jpg` (top: 2K, bottom: ours v87n at 852×393).

## Traits: 2K vs ours (v87n)
| # | 2K Drive (seen in the shots) | ours v87n (`ours_v87n_builder.png`) |
|---|---|---|
| 1 | **Setting:** the car sits in a real LEGO garage hall: a big workshop with blue roller doors, a neon "GARAGE" sign, shelves, paint cans and mechanic minifigs walking around. | A dark navy void with a cyan neon ring. No room and no people. |
| 2 | **Platform and light:** a light-grey tiled build platform with a blue LED dotted border and a big yellow arrow marking the front. Bright key light, so the car casts crisp shadows on the tiles. | A dark disc. No shadows, so the car floats. |
| 3 | **Camera framing:** a high 3/4 view. The whole car is in frame, slightly right of centre, taking about 50% of the width. The UI sits only in the corners and along the bottom. | The car's roof is cut off by the toolbar and its nose sits behind the parts panel; at 852×393 roughly 40% of the car is under the UI. |
| 4 | **Held part:** the selected part floats at the target spot in its real colour and is framed by 4 corner brackets: red = can't attach, green = fits. The tooltip says "ROTATE THE BRICK · MOVE TO THE HIGHLIGHT". You place it with PLACE. | A tap places the part at once. The ghost exists only for mouse hover; on touch you never see where it will go, so a wrong tap costs an undo. |
| 5 | **Action bar:** big labelled icon buttons along the bottom: PLACE · CANCEL · ROTATE · STEP VERTICAL · COLOR (a 3D colour swatch) · CURRENT (a 3D render of the held part) · MODIFIERS. ZOOM · UNDO · REDO sit top right. | A top toolbar of small 36 px buttons with glyphs (↶ ⟳ ✚ 🖌 🗑) plus text buttons. |
| 6 | **Part picker:** the Brick Drawer, sorted by type and category; the current part is shown in 3D. | Text chips with a tiny glyph (▭ ▮), so all bricks look the same and the shapes can't be told apart. |
| 7 | **Counters:** a red banner with the vehicle name and two bars: bricks 219/350 and flair 2/350. | The "🧱 33/120 · Light" chip with a fill bar. Close enough. |
| 8 | **Feedback:** brick-shower transitions (dozens of bricks fly across the screen when you enter or leave the build), a click sound and a snap. | A click sound only. |

## Ranked gaps (by how much they change Alex's first impression)
1. **Dark void → lit LEGO garage hall** (traits 1 and 2): walls, roller doors, a neon GARAGE sign, a grey tiled platform with blue LED dots, a yellow front arrow, real shadows, mechanic minifigs. This is the first thing you see; today it reads as "a menu over a black screen".
2. **Placement with a held-part preview** (traits 4 and 5): tap shows the part in place with green/red corner brackets, and a big PLACE · ROTATE · CANCEL bar confirms. Placing then ends with a pop: the brick drops in, flashes, and a puff of studs.
3. **3D part thumbnails** (trait 6, plus CURRENT): each palette button shows a rendered 3D model of the part in the chosen colour.
4. Camera framing so the whole car sits between the toolbar and the palette (trait 3). It comes with gap 1.
5. A brick-shower transition when entering or leaving the build (trait 8).
6. STEP VERTICAL and REDO (trait 5).

## Plan for this release (gaps 1–3, with 4 folded in)
New module `src/98s_garage_studio.js` (tag `GS_`), garage-only, wrapping the existing functions:
- **Studio:** the garage hall built from boxes and canvas textures, the platform, LED dots, the arrow, the minifig mechanics (`GB_figGeo`), the GARAGE neon, and shadow-mapped key light. It replaces the navy disc and the cyan ring in `GB.sc`.
- **Held part:** on touch, a tap moves the held part (opaque, real colour) and shows the screen-space corner brackets plus a bottom PLACE · ROTATE · CANCEL bar; PLACE (or a second tap on the same spot) places it. Mouse hover and click keep working as before.
- **Pop:** the new part drops 0.25 m with an overshoot, flashes white and throws stud confetti, plus the click sound.
- **Thumbnails:** each part is rendered once per colour into a 96 px image with `GB.r` and a render target. Only the open category is rendered.
