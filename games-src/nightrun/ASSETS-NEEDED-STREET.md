# Street run background: layers needed from the owner (21 Oct 2026)

Right now the street run draws placeholders: plain flat rectangles, each labelled with its asset id ("bg-street-far (placeholder)").
Each file below replaces its placeholder automatically once it is saved in `games/mainhattan-nightrun/media/foot/` and listed in
`media/ready.json` (`python3 games-src/nightrun/make-placeholders.py`). The code is in `parts/streetlook.js` (flag streetlook); `slPic` looks the files up.
The old `media/foot/bg-sky|far|mid|near|floor.webp` are mock placeholders (flat rectangles, about 38 KB each), so the game no longer uses them.

How each layer is drawn: it is scaled to the height of the sky (road line to the top of the screen; about 400 to 540 game units), its width
follows the file's aspect ratio, and it repeats sideways, so **the left and right edges must tile seamlessly**. The road line is the
**bottom edge** of the far and mid layers. Leave everything above the skyline transparent.

Style block (paste first, the same as FOOT-FLOW-PROMPTS.md): *Painted cyberpunk Frankfurt 2099, hand-painted game art, rain, teal and magenta neon,
readable silhouettes, crisp dark outline, chunky shapes that read at small size*

| id (save as `foot/<id>.webp`) | size px | frames | facing | scroll | used in | Flow prompt |
|---|---|---|---|---|---|---|
| bg-street-sky | 2048x1024 | 1 | none | fixed | streetlook.js slBackdrop (sky) | Night sky over a cyberpunk Frankfurt, deep violet to magenta gradient towards the horizon, thin rain haze, a few dim stars, a small crescent moon in the upper right corner, no buildings, no text, 2048x1024, painted, calm and dark so characters read on top |
| bg-street-far | 2048x768, seamless left/right, transparent above the skyline | 1 | none | x0.12 | streetlook.js slBlit far | Distant skyline silhouette of a cyberpunk Frankfurt banking district at night: many slim towers and antennas with tiny red lights, very dark blue-violet, almost flat, sparse dim windows, bottom edge is the ground line, transparent sky above the towers, seamless horizontal tile, 2048x768, no text |
| bg-street-mid | 2048x768, seamless left/right, transparent above the roofs | 1 | none | x0.4 | streetlook.js slBlit mid | Mid-distance street facades of a cyberpunk Frankfurt district at night: 6 to 8 mid-rise buildings, lit windows in warm amber and cyan (about one in four lit), a few neon shop signs bolted to the walls, darker than the actors, bottom edge is the pavement line, transparent sky above the roofs, seamless horizontal tile, 2048x768, no text |
| bg-street-road | 1024x140, seamless left/right | 1 | none | x1 | streetlook.js slBackdrop road | Side view of a wet asphalt street strip at night, a curb line along the top edge, faint amber lane dashes, magenta and teal neon reflections in puddles, seamless horizontal tile, 1024x140, no text, dark enough for a progress bar to read on top |

Props on the road already use the approved prop sheets (`prop-car`, `prop-police`, `prop-holo`, `prop-beacon`, `prop-steam`).
Signs are left out (`prop-neon`, `prop-banner`) because their art floats in the air and has no pole or wall. Optional for a later wave:

| id | size px | frames | facing | used in | Flow prompt |
|---|---|---|---|---|---|
| prop-neon-pole (sheet `prop-neon-pole/loop`) | 4 x 192x384 strip | 4 | none | streetlook.js ART.footProps | The same flickering neon sign as prop-neon, now mounted on a dark steel street pole that stands on the ground, the pole bottom touches the bottom edge of the frame, 4 frames of neon flicker, transparent background, no text |
