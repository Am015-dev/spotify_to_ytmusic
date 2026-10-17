# TBKit: visual kit for "The Thornbound Throne"
Art direction: OVERGROWN RUIN PAINTING. Candlelit parchment cards, gold-leaf frames, mossy ruins, ivy and thorns, four faction colours. Everything is procedural SVG (painterly via feTurbulence displacement/grain/wash filters, layered washes, gold-leaf gradients, ivy and thorn vector motifs). No external assets.

Files (all in this folder): `kit.js` (global `TBKit`, 203 KB incl. 2 embedded OFL fonts, plain script, no dependencies), `demo.html` (self-contained, built from `demo-src.html`), `build.py`, `parts/p1..p9*.js` (sources), `shoot.js` (Playwright screenshots), `perf.js`, `shots/`, `ASSETS.md`.
Use: `<script src="kit.js">` (or paste inline), then `TBKit.ready.then(...)` (fonts loaded; text wrapping is measured with the real font). `TBKit.mount()` runs automatically (injects fonts/CSS and one hidden `<svg id="tb-defs">` of shared gradients/filters/symbols). Respects `prefers-reduced-motion`.

## Factions (ids)
`gilded` Gilded Court (crimson + tarnished gold, crown emblem) | `heath` Heathbound Clans (moss + bone, standing-stone ring) | `lantern` Lantern Rising (ember orange + soot, lantern) | `choir` Pale Choir (silver-violet + ink, crescent) | `neutral` Market (leather brown + thorn vine, rose coin). `TBKit.FACTIONS[id]` = {name, short, blurb, main, dark, light, accent, paper, ink, glyph}. Each has its own frame ornament style (gold filigree corners / ivy chain / riveted iron / star-and-moon / thorn vine), emblem, back, herald hat, token colours. Colour is never the only signal: emblem, hat and name accompany it.

## Cards
- `TBKit.card(spec, size)` -> `<svg>` element (class `tb-card`, viewBox 260x372, aria-label with title/strength/cost/text). Cached: each distinct spec+size class is built once as a template and cloned (about 0.65 ms per clone, 2 ms first build on the test box; `cacheStats()`).
- `TBKit.cardSVG(spec, size)` markup string (needs `mount()` first, same page). `TBKit.cardBack(faction,size)`; `TBKit.clearCache()`.
- `size`: a width in px (height = width x 1.4308), or `'small'` (60 x 86), `'medium'` (130), `'large'`/`'enlarged'` (260 x 372).
- spec: `{faction, title, value (strength badge, top-left), cost (coin, top-right), type, typeLabel?, art, text, flavor?, tag?, num?, faceDown?}`
  - `type` icon + label: `unit, edict, relic, oath, rite, ploy, trade, omen` (`typeLabel` overrides the label, e.g. "Knight").
  - `text` effect text: Garamond 16 -> 13 px (SVG units on the 260 px card, i.e. 13 px or more when enlarged), auto-fit in up to 6 lines, `\n` or `|` = new paragraph; `flavor` optional italic line.
  - `faceDown: true` or `cardBack()` gives the faction back (emblem medallion on diamond lattice).
- Small (<= 110 px wide) automatically uses the lite layout: huge strength number, art, type icon, cost; no filters (cheap to draw 50+ on screen). 111+ px uses the full layout.
- `TBKit.art(key, faction?, widthPx)` -> just the painted illustration (220x152) as `<svg>`. `TBKit.artKeys` = list. Cloth colour follows the card's faction (neutral cards use the key's default faction).
- `TBKit.cardTypes`, `TBKit.emblemSVG(faction, size)`.

### Art keys (48)
Gilded: `knight herald guard noble regent hound duelist throne` | Heath: `clan_warrior clan_chief hunter seer wolf stag boar bear ravens` | Lantern: `rioter lantern_bearer barricade bellringer mob beacon` | Choir: `moon_priest choir spirit moonmoth eclipse vigil` | Market/neutral: `spy thief merchant caravan tribute feast` | Places: `ruin_arch ruin_tower standing_stones broken_bridge gate thorns` | Relics/objects: `banner chalice blade crown oath key tome`. Unknown key falls back to `ruin_arch`.

## Kingdom map
`const map = TBKit.map({container, players, locations, w, h, trackLen, compact, quality, seed, links, rot, onTap(id, info), onHover(id)})` -> controller; `map.el` is the `<svg class="tb-map">` (viewBox `0 0 w h`, default 1000x1000; use e.g. `h:1120` in portrait phones so it fills the screen). Scales to its container width.
- `players`: array of faction ids (or `{faction,name}`), seat index = array index (1-4 seats).
- `locations`: `[{id, name, type, x?, y?, links?:[ids]}]`; 8-12 recommended (works for 3-12). `type`: `castle forest moor village abbey bridge stones harbor mine market tower hills`. **Data hook:** `map.setLocations(list)` re-lays out everything for any number of locations (auto ring layout, roads, painted terrain avoiding the places; `x,y` override a place, `links` give custom roads, default = ring + a few spokes to the throne). `TBKit.layoutLocations(list,{w,h})` -> `{pos, links}` (pure function), `TBKit.defaultLocations(n)` = the 12 original names: Ashgrave Keep, Brackenmoor, Sunken Abbey, Thistlewick, Mournwood, Gallow Ford, Hagstone Ring, Cinder Quay, Rookhollow Mine, Vesper Market, Gloamreach Tower, Barrowfell.
- Always present: painted overgrown land (river, lake, woods, hills, wild ruins, fog, ivy coast, thorn hedge), the throne at the centre (`id: 'throne'`, tappable, also a herald destination), gilded influence track around the edge (`trackLen` spaces, default 40, number on every 5th), round banner top-left.
- Slots: per location per seat a face-down card slot: `map.setSlot(locId, seat, {count, faceDown, card:spec, value, winner, loser})` (empty dashed slot in faction colour by default; `null` clears), `map.clearSlots([locId])`.
- Heralds: `map.setHerald(seat, locId)`, `map.moveHerald(seat, locId) -> Promise` (hops along the roads, BFS path), `map.heraldAt(seat)`.
- Influence: `map.setInfluence(seat, n[, {immediate}]) -> Promise` (token walks the track space by space; wraps mod trackLen), `map.influence(seat)`.
- Round: `map.setRound(n, total)`.
- Interaction: `map.highlight([ids])` (pulsing gold ring on legal targets), `map.select(id)`, `map.pulse(id)`, `map.setOwner(locId, seat|null)` (tints the medallion), `map.locations()` (with x,y), `map.locPos(id)`, `map.locEl(id)`, `map.slotEl(id,seat)`, `map.destroy()`. Tap/click/Enter/Space on a location (hit area ~196x180 units, about 70 px on a phone) calls `onTap(id, {seat?, el, event})`; `seat` is set if a slot was hit. Locations are `role=button` with `aria-label`.
- Reveal on the map: `map.revealSlots(locId, [{seat, card:spec, winner?}], {stagger}) -> Promise` flips each slot (scaleX), shows a clash seal, rings the winner and dims losers; `map.resetReveal(locId)`.
- `compact: true` (phones): bigger plaques, slots and heralds, location names only shown for highlighted/selected places (tap -> engine pop-up). `quality:'low'` drops SVG filters (faster on weak devices). With 11+ locations clusters shrink to 84% automatically.

## Tokens
`TBKit.token(kind, {faction, n}, sizePx)` -> `<svg>` (`tokenSVG` = string). Kinds: `influence` (faction crown disc, optional number), `coin`, `grain`, `iron` (generic resource set of 3), `herald` (meeple in faction colour, size = height), `clash` (crossed-swords seal), `reveal` (eye), `tie`, `winner` (laurel crown), `first` (first-player thorn ring), `round` (wax seal with number). `TBKit.tokenKinds`.

## Reveal / clash animation
- `TBKit.flipCard(spec, size)` -> `div.tb-flipcard` (3D flip, starts face-down): `.flip()` / `.unflip()` return Promises, `.isUp()`, `.setResult('winner'|'loser'|'tied'|null)`.
- `TBKit.clash([{el, winner, col?}], {stagger, sparkParent, tie}) -> Promise`: flips the cards in turn, plays a clash spark, then lifts and glows the winner (laurel crown pops in) and dims/greys the losers.
- `TBKit.clashPanel(container, [{faction, name, card:spec, strength, winner}], {size, run, delay, stagger, tie}) -> {el, play(), reset()}` builds the whole labelled row (strength number appears on reveal).
- On the map use `map.revealSlots`.

## Demo and screenshots
`demo.html` (open directly): auto layout by size. `?mode=pp` (phone portrait play mock), `pl` (phone landscape), `dk` (desktop), `gal` (full gallery: frames, backs, small cards, 48 art keys, tokens, clash, 8- and 12-location maps). `window.DEMO`, `openCard(key)`, `revealDemo()` are test hooks. Shots in `shots/` (Chromium via Playwright, DPR 1): `phone-portrait-390x844{,-card,-clash}.png`, `phone-landscape-844x390{,-clash}.png`, `desktop-1366x768.png` (clash played), `gallery-full.png` + three crops. All viewed and iterated (fixed footer overlap, map crowding for 8/12 places, throne label, token sizes, bottom-row overflow, phone name clutter -> compact mode).

## Measured (this box, headless Chromium, software GL)
40 enlarged cards first build 88 ms; 200 cached clones 131 ms; 40 cached small cards 13 ms; full map build 16 ms. 0 console errors in all runs.

## Notes / known gaps
- Nobody tested on a real phone. Phone portrait map at 390 px: slots about 17 px wide, location names hidden unless selected (by design: tap -> pop-up); text on cards is readable only when enlarged (260 px, >= 13 px effect text).
- Figures are stylised painted silhouettes (no faces); beasts are simple. Art is deterministic per key (seeded), so cards never change between renders.
- `cardSVG` strings reference shared defs and fonts of the page; they do not work as standalone `<img>` data URLs.
- Pop-ups, hand strips and buttons in `demo.html` are mock UI for the screenshots, not part of the kit.
- Font note: `fonts/fell.woff2` is actually EB Garamond (see ASSETS.md).
