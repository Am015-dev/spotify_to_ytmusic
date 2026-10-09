# Board and table art audit (laptop → Linux session, 2026-10-09)

Which play surfaces are still the old CSS/SVG/canvas placeholders, what is already painted but not wired, and what the laptop is painting now with Google Flow. Line numbers are from read-only surveys of `games-src/` and the built pages. Overdrive is not covered (another session owns it).

## 1. Wiring or CSS fixes only (the paintings already exist)
| Game | Problem | Fix |
|---|---|---|
| Hollowbough | Painted `table-*.webp` loads on `.gx-board` (`index.html:672-673`, `tableApply` `:6865`), but the opaque wood-grain `.tbl` div (`head.html:188`, built `:558`), the vignette rect (`:6562`) and the meadow bench + rope posts (`:6555-6561`) are drawn on top. | Add `html[data-timg] .tbl{display:none}` and hide the vignette and bench the same way. |
| Sands of Qamar | All 35 files in `games/sands-of-qamar/media/` are unused. The board is a parchment gradient (`ft/src/board.css:10`); tiles are CSS/emoji (`ui.js:57-64`). `GXC.init` (`ui3.js:79`) has no `artBase`. | `artBase:'media/'`; `table-default(-phone)` on `.gx-board`; `tile-<k>` as tile background under the icons; title/end/back/table unlocks. See `ft/PAINTED-ART-HANDOFF.md`. |
| Shipwreck Isle | Part-2 media is unused: 17 `camp-*` (no `artBase` in `campaign.js:7`), `back-cross/-lifeboat`, `table-beach(-phone)`, `table-temple-ruins`, `table-homestead`, `title(-phone)`, `end-win/-lose`. Page backdrop is a body gradient (`rc/head.html:67`). Also `disc-*`, `wreck-*`, `char-*` were pushed to `games-src/rc/art/` but are not in `games/shipwreck-isle/art/` yet. | Wire as in `rc/PAINTED-ART-HANDOFF.md` part 2. |
| Cauldron Fair | `media/table-phone.webp` and `title-phone.webp` are unused (phone uses the embedded landscape `table`/`title`). | Load the `-phone` files in portrait. |
| Kaiten Kitchen | `media/title-phone.webp` unused (title is embedded `KK_ART.title`, `:7675`). | Portrait title. |
| Short Fuse | `media/title-phone.webp` unused (only `title.webp`, `:5461`). | Portrait title. |
| Final Approach | `media/title-phone.webp` unused. No default table file: the Pixi plate is the procedural stand-in (`src/ui7.js:35`). | Portrait title; default table (being painted, below). |
| Shelf (`games-src/suite/src.html`, built `games/index.html`) | Painted app icon replaces `games/icons/icon-180/192/512(-maskable).png` (same names: works as is). New `icons/favicon-32.png` and `icons/share.jpg` (1200×630) are not linked yet. | Add `<link rel="icon" href="icons/favicon-32.png" sizes="32x32">`, `og:image` / `twitter:image` = absolute URL of `icons/share.jpg` (+ `og:image:width` 1200, `height` 630, `twitter:card` `summary_large_image`). Painted box covers already replaced `games/covers/<id>.jpg` in place (Nebula still to come). |
| Crown City Smash, Nebula Aces, Sunglaze, Tidewake | No loader reads `media/table-*`, `back-*`, `title*`, `end-*` at all. | Port the loader from `cauldron-fair/src/ui12.js:34,103` / `lantern-dive/game/src/ui2.js:23`; `campaign.json` portraits drop in via `artBase`. |

## 2. Being painted on the laptop now (queued in Google Flow; pushed per game when done)
- **Thornbound:** `media/map.webp` + `map-phone.webp` (hook `mapApply`, `:6752`, already there: this is the real fix for the old SVG board), the 4 faction `art/basic-*.webp`, plus `thornbound-throne` (keyed centrepiece for `buildThrone`, `:2374`) and `thornbound-track` (track lane space, `:2370`).
- **Hollowbough:** the 39 location/event paintings (forest, basic, events; keys = in-game keys, wiring in `ui10.js` `spotArt` + `build.py` `art_js`), `hollowbough-bench` (the meadow bench) and `hollowbough-mat` (wood tray for the player `.strip`, `:521`).
- **Cauldron Fair:** `cauldron-stage` (market stage `#rs.stg`, `:569`), `cauldron-pass` (+`-phone`, pass screen `.passc`, `:249`), Tamsin redo.
- **Kaiten Kitchen:** `kaiten-stage` (`#stage`, `:455`), `kaiten-belt` (tileable belt for the Pixi tiling sprite, `:5202`).
- **Final Approach:** `approach-table` + `-phone` (default table for `tableApply`, `ui13.js:7-22`).
- **Mainhattan Nightrun:** `nightrun-garage` (+`-phone`, garage/pit-stop `.pg`, `head.html:22`) and `nightrun-pause` (`#pausem`/`#setm`, `head.html:23`); keep the dark overlay on top for legibility.
- **Rampart & Vine:** table skins, portraits (names already in `campaign.json`), backs, title/end and field textures (`tex-*` under the SVG tiles only; the edge-matching SVG stays).
- **Crown City Smash, Nebula Aces, Sunglaze, Tidewake, Lantern Dive:** every image item in `MISSING-ASSETS.md` (106), plus their Treblo music (5 cues × 2 each).
- **Shelf:** painted box covers for the 10 games whose cover is a screenshot, a painted app icon (+ favicon) and a share image (`og:image`).

## 3. Keep in code (pixel-exact, functional or text-heavy)
Dice faces (Doorkick `.die3`, Crown, Nebula d8, Tidewake), wake-tile route lines (Tidewake), Rampart tile edges, Final Approach instrument panels and atlases, Sunglaze tile glyphs and score tracks (glaze textures only with care: the 5 colours must stay distinct), Short Fuse wire colours and numbers, Thornbound faction tokens, HUD pips (Nightrun), all text cards, chips and buttons.
