# Third-party code and assets

Code or assets in this repo that we did not write. Keep each source's copyright line and licence text with the files that use it.

## Sprite Fusion pixel-art VFX (code)

- Source: https://www.spritefusion.com/pixel-art-vfx (per-effect ZIPs at /downloads/pixel-art-vfx/<name>.zip)
- Author: Hugo Duprez. Copyright (c) 2026 Hugo Duprez
- Licence: MIT (text below; also kept in the header of every ported file)
- Used in (ported from TypeScript to plain browser JS, behind the `?fx=1` flag, off by default):
  - `tidewake/fx/px.js`: pixel buffer, dithered dot, splash ring, colours, seeded random, noise (from rain.ts)
  - `tidewake/fx/rain.js`: rain squall on a Rogue Wave (from rain.ts, adapted to a board seen from above, made finite)
  - `tidewake/fx/spray.js` and `tidewake/fx/records/spray-drafts.js` are our own effects; they draw with px.js
- Shown to players: one line in Tidewake's Credits drawer (`tidewake/game/body.html`).
- Not used: ice, black-hole, movement (downloaded and read; no Tidewake moment fits them).

```
MIT License

Copyright (c) 2026 Hugo Duprez

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Wickdeep (games-src/wickdeep)

- **Sprite Fusion pixel-art VFX (code, MIT, Copyright (c) 2026 Hugo Duprez)**: `wickdeep/fx/slash.js`, `impact.js`, `heal.js`, `shield.js`,
  from https://www.spritefusion.com/downloads/pixel-art-vfx/<name>.zip. TypeScript types stripped with esbuild and wrapped as globals
  (SF_slash, SF_impact, SF_heal, SF_shield); MIT header kept in each file (licence text above). One-shot only (slash/impact on hits,
  heal on heals, shield on shields), off with reduced motion or animations off. Not used: fire, ice, poison, lightning, sparkle.
- **Tiny Dungeon by Kenney (art, CC0 1.0)**: `wickdeep/art/tiny-dungeon.png` (the packed 12x11 tilemap), licence in
  `wickdeep/art/tiny-dungeon-LICENSE.txt`. Source: https://opengameart.org/content/tiny-dungeon (kenney_tinydungeon.zip), www.kenney.nl.
  Hero, monster, door, trap, chest and pillar sprites; some monsters recoloured in code.
- **Silkscreen font (OFL 1.1, Copyright 2001 The Silkscreen Project Authors)**: `wickdeep/art/silkscreen-400.woff2`, `silkscreen-700.woff2`,
  licence `wickdeep/art/OFL-silkscreen.txt`. Source: Google Fonts (https://fonts.google.com/specimen/Silkscreen).
- Credits line shown in the game's Menu > About.
