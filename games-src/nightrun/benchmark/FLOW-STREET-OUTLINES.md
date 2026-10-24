# Street sprites with outlines, for Google Flow (24 Oct 2026)

Why: the critic scores Kai and the olive street foes 3/10 on "stands out from the street" and "find the player". The art is good,
but the characters have no dark outline or top rim light, so they melt into the busy painted street. Code must not tint them
(owner rule). This is a REDRAW of the existing strips with the same frames, poses and cell sizes, only easier to read.

## For every strip
- Attach the existing strip (from `games-src/anims/mainhattan-nightrun/sheets/<actor>/`) as the reference and keep EVERY pose,
  frame count, cell size and feet position exactly the same.
- Add a clean **3 px dark outline** (near-black violet #120a1c) around the whole figure and a thin **top rim light** (cyan on Kai,
  warm orange on foes) on the head and shoulders, as if lit by street neon from above.
- Transparent background (or flat #00FF00 to cut out). No text, no logos.
- Kai: **lighter hoodie** (mid grey-blue) with one **red accent** (scarf or stripe), so he is the lightest, clearest figure on the street.
- Foes keep their colours but get the outline and rim; olive greens one step darker so Kai stands out.

**Prompt (one per strip):** `Redraw this sprite strip exactly: same character, same N frames, same poses and cell size. Add a clean
3-pixel near-black outline around the figure and a thin cyan (Kai) / warm orange (foes) rim light on the head and shoulders from
neon above. [Kai only: make the hoodie a lighter grey-blue with one red scarf accent.] Transparent background, no text.`

## The strips (file | frames | cell w x h)
| File | Frames | Cell |
|---|---|---|
| `kai/aimdiag-strip.webp` | 3 | 148 x 326 |
| `kai/aimup-strip.webp` | 3 | 137 x 326 |
| `kai/combo2-strip.webp` | 4 | 183 x 326 |
| `kai/combo3-strip.webp` | 4 | 200 x 326 |
| `kai/crouchshoot-strip.webp` | 3 | 199 x 326 |
| `kai/dash-strip.webp` | 4 | 224 x 326 |
| `kai/die-strip.webp` | 4 | 216 x 326 |
| `kai/grenade-strip.webp` | 4 | 180 x 326 |
| `kai/hurt-strip.webp` | 4 | 145 x 326 |
| `kai/idle-strip.webp` | 4 | 106 x 326 |
| `kai/jump-strip.webp` | 4 | 167 x 326 |
| `kai/land-strip.webp` | 3 | 148 x 326 |
| `kai/melee-strip.webp` | 4 | 187 x 326 |
| `kai/run-strip.webp` | 6 | 149 x 326 |
| `kai/runshoot-strip.webp` | 6 | 241 x 326 |
| `kai/shoot-strip.webp` | 3 | 187 x 326 |
| `kai/victory-strip.webp` | 4 | 119 x 326 |
| `grunt/die-strip.webp` | 4 | 225 x 262 |
| `grunt/idle-strip.webp` | 4 | 127 x 262 |
| `grunt/jump-strip.webp` | 4 | 187 x 262 |
| `grunt/melee-strip.webp` | 4 | 225 x 262 |
| `grunt/run-strip.webp` | 6 | 180 x 262 |
| `grunt/shoot-strip.webp` | 3 | 196 x 262 |
| `gunman/die-strip.webp` | 4 | 245 x 259 |
| `gunman/idle-strip.webp` | 4 | 95 x 259 |
| `gunman/jump-strip.webp` | 4 | 187 x 259 |
| `gunman/melee-strip.webp` | 4 | 249 x 259 |
| `gunman/run-strip.webp` | 6 | 162 x 259 |
| `gunman/shoot-strip.webp` | 3 | 194 x 259 |
| `bruiser/die-strip.webp` | 4 | 258 x 275 |
| `bruiser/idle-strip.webp` | 4 | 127 x 275 |
| `bruiser/jump-strip.webp` | 4 | 229 x 275 |
| `bruiser/melee-strip.webp` | 4 | 271 x 275 |
| `bruiser/run-strip.webp` | 6 | 192 x 275 |
| `bruiser/shoot-strip.webp` | 3 | 236 x 275 |

Priority: Kai's `idle, run, shoot, melee, hurt` first, then grunt and gunman `idle, run, shoot`. Drop finished files into the same
folder names (or send them); the game picks them up with no code change.
