# Assets: The Thornbound Throne visual kit
All artwork (cards, map, tokens, heralds, icons, emblems) is original and drawn procedurally as SVG by `kit.js`. No images, no external downloads at runtime, nothing copied from or traced after any existing game.

## Fonts (embedded as base64 woff2 inside kit.js, Latin subset)
| File | Font | Author | Licence | Source | Date | Changes |
|---|---|---|---|---|---|---|
| fonts/cinzel.woff2 | Cinzel, wght 700 instance | Natanael Gama | SIL OFL 1.1 (fonts/OFL-cinzel.txt) | https://github.com/google/fonts/tree/main/ofl/cinzel | 2026-10-02 | instanced at 700, subset to U+0020-00FF + punctuation, woff2 |
| fonts/fell.woff2 | EB Garamond, wght 600 instance (family name in code: "TB Body"; the file name is a leftover from an earlier IM Fell trial) | Georg Duffner, Octavio Pardo | SIL OFL 1.1 (fonts/OFL-ebg.txt) | https://github.com/google/fonts/tree/main/ofl/ebgaramond | 2026-10-02 | instanced at 600, subset, woff2, lnum feature kept |
| fonts/fellit.woff2 | EB Garamond Italic, wght 500 instance | same | same | same | 2026-10-02 | same |
OFL requires the licence text to travel with the font: keep `fonts/OFL-*.txt` next to any redistribution, and credit "Cinzel (Natanael Gama) and EB Garamond (Georg Duffner, Octavio Pardo), SIL OFL 1.1" on the game's Credits screen. (`fonts/OFL-unused.txt` is a stray copy, safe to delete.)
Fallback stack when fonts fail: Palatino Linotype / Book Antiqua / Georgia / serif.

## Tooling (not shipped in the game)
Playwright 1.56 + Chromium (screenshots), fontTools + brotli (font subsetting), Pillow (screenshot crops). Build: `python3 build.py` joins `parts/p*.js` into `kit.js` and inlines it into `demo.html` from `demo-src.html`.
