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

## game-icons.net animal silhouettes (Meadowfold)

- Source: https://game-icons.net (repo https://github.com/game-icons/icons)
- Authors: Lorc, Delapouite, Caro Asercion, Skoll
- Licence: CC BY 3.0 (https://creativecommons.org/licenses/by/3.0/)
- Files: `meadowfold/src/icons.js` (42 icon paths: list with authors in `meadowfold/ASSETS.md`)
- Shown to players: Meadowfold Menu > About.
