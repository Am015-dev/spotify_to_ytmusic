# FEEL: make a game respond to the hand (gx-feel.js + gx-feel.css)

Owner, Nov 2026: "on phone they do not feel like games, no functionality of phone or pc is used, it's a static spreadsheet."
The feel layer fixes that without touching rules. Pilots: **Wildmark** (`wildmark/src/feel.js`) and **Perch & Plume**
(`perch-and-plume/src/feel.js`). Every game opts in with one file of its own (~150 lines). Nothing changes for a game that
does not load it.

## 0. Include it (build.py)
```python
SRC['gx-feel.js'] = os.path.join(SH, 'gx-feel.js')          # right after gx-kit.js
# ... the game's own feel.js LAST (after every UI file: it wraps take/act/render/apply)
css += '\n' + rd(os.path.join(SH, 'gx-feel.css'))            # with the other shell css
```
```html
<script src="gx-kit.js"></script>
<script src="gx-feel.js"></script>
...
<script src="feel.js"></script>   <!-- last -->
```
`GXF` is global (also `GX.feel`). It reads the kit's shared prefs: **Animations** speed / off, **Reduce motion**,
**Vibration**, **Effects** volume, and its own `tsfx` ("Touch sounds"; add the row with `GXF.settingsRows(S)` in your
Settings `sound:` section). In `?fast=1` test runs set `GXF.off = true` so every flight resolves at once.

## 1. Drag and drop (tap stays)
```js
GXF.drag({
  items: '#hand .card',                          // delegated: re-rendered items keep working
  axis: 'up',                                    // optional, touch only: a sideways swipe scrolls the hand instead
  data: el => canPlayNow(el) ? { i: +el.dataset.i } : null,   // null = not draggable now (a tap still clicks)
  start: d => { UI.dragSpots = true; drawBoard(); },          // optional: draw drop spots BEFORE targets are read
  targets: d => legalSpots(d).map(s => ({ el: spotEl(s), s, rect: () => rowEl(s).getBoundingClientRect() })),
  drop: (d, t) => { if (!rulesSay(d, t)) return false; doMove(d, t); return true; },   // false = spring back
  ghost: (el, d) => pieceNode(d),                // optional (default: a clone of el)
  size: () => ({ w: 90, h: 100 }),               // optional: lift the piece at board scale, centred on the finger
  end: (d, ok) => { UI.dragSpots = false; }      // optional
});
```
What players get for free: the piece lifts (shadow, tilt) and floats 28 px above a finger; every legal target glows
(`.gxf-ok`); the one under the piece lights up (`.gxf-hov`) with a soft tick and a 4 ms buzz; drop = snap into place +
sound + buzz; a bad drop springs back and shakes. The click after a drag is swallowed, so `drop` is the only action.
Rules for `drop`: call the SAME functions the tap path calls (they hold the tutorial gates and the engine call); never
touch the engine directly. If your board redraws mid-drag (timers), the drag re-reads `targets()` by itself.
Add `data-gxf-drag` to draggable elements in your render (grab cursor, hover lift, `touch-action:none`;
`data-gxf-drag="up"` keeps horizontal scrolling for hands). Disable drags in the scripted tutorial (taps are taught there).
SVG targets: glow comes from CSS `stroke`, so point `el` at a polygon/ring, not a `<g>`.

## 2. Camera (board as a place)
SVG boards that already pan (Wildmark) keep their own camera; add a "lean in" on the cell that changed (see `focusCell`
in `wildmark/src/feel.js`: glide to the cell at 1.3x, the game's own fit glides back later).
DOM boards: `var cam = GXF.camera(viewportEl, contentEl, { max: 2.4, ignore: '[data-gxf-drag], button, [data-a]' })`
gives pinch-zoom and one-finger pan (only when zoomed, so page taps/scrolls stay) on phones, wheel zoom at the pointer,
mouse drag-pan on empty board and double-click 1x/1.6x on PC. `cam.focus(el, holdMs, z)` glides in, holds, glides back
(skipped while the player is zoomed or moved the board in the last 4 s); `cam.glideTo`, `cam.reset`, `cam.zoomBy`.

## 3. Motion
- `GXF.fly(from, to, { node, ms, arc, scale, spin, fade })` (Promise): from/to are elements or rects. **Measure the
  source BEFORE the move** (the render removes it): wrap your `apply`/`take` and snapshot rects first (both pilots do).
- `GXF.hop(el)` token lands, `GXF.settle(el)` tile settles, `GXF.pulse(el)`, `GXF.shake(el)`.
- `GXF.points(fromEl, scoreEl, '+3')`: the number flies into the score, which pulses; a coin tick plays.
- Counters roll: mark numbers `data-gxf-roll="<stable key>"` in your render and call `GXF.rollAll(root)` after it
  (wrap `render`); call `GXF.rollReset()` on a new game.
- `GXF.beat('Round 2', '8 actions each')` (Promise, ~1.3 s, tap skips) for round or game end.
- The rival: animate each step at readable speed (flight 500-560 ms, then hop), the camera leaning in on its move.
All lengths go through `GXF.ms()` = kit animation speed; 0 when reduced motion or animations are off.

## 4. Feedback
`GXF.tick(kind)` = sound + vibration (`pick hover drop deny flip hop score coin beat tick`). Sounds are synthesized
(no files, no licence), 0.35 x master x effects by default. Set `GXF.mute = () => myOwnSoundSwitchIsOff` to follow
the game's own switch. Hover states and cursors come from the CSS. Keyboard:
```js
GXF.keys({ digit: n => pick(n), ArrowLeft: ..., Enter: confirm, z: undoIfRulesAllow, Escape: cancel, '+': zoomIn },
         { when: () => inGame() });   // ignored while typing or while a drawer is open; return false = not handled
```
Shelf convention: 1-9 pick the nth choice, arrows move between spots/cards, Enter confirms, R/Space rotate, Z undo only
where the rules allow it (an unconfirmed pick), Esc backs out, + / - / 0 zoom.

## 5. Less spreadsheet
Show state with pieces: the dragged piece, glowing spots and flying points replace "Tap X then Y" lines. Keep one
compact score line (hide sub-totals; the breakdown opens on tap) and numbers only where they decide a move.
Keep Addendum 7 (clean Play mode): the feel layer adds no text, no bubbles and no toasts.

## 6. Gate (copy for each game)
- build passes, the game's own tests pass;
- one full game by DRAG only and one by TAP only both reach the result, phone (CDP touch) + PC (mouse):
  `wildmark/feel-test.js`, `DRAG=1 node perch-and-plume/play.js phone|pc game` (and without `DRAG` for tap);
- no long task over 100 ms during animated turns on a 4x CPU-throttled phone (measure WITHOUT screenshots: a
  screenshot is itself a long task);
- a 6-frame strip per viewport (390x844, 1440x900): `python3 scripts/feel-strip.py <frames.json> <out.png>`.

## Pitfalls
- Load the game's feel.js last; it wraps globals (`take`, `act`, `render`, `apply`, `startGame`). Assign both
  `window.x = ...` and `x = window.x`.
- Long tasks: two renders in one drop handler cost ~100 ms on a slow phone. Do the second step in
  `requestAnimationFrame` (see the token drop in Wildmark).
- Don't hide (visibility) a real draggable while its flight lands: use opacity, or the player cannot grab it.
- An existing long-press (big card view) must cancel when a drag starts (`GXF.dragging()`).
