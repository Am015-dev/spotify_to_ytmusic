# Facelift list: CSS elements still to paint (Flow) and 3D candidates (TRELLIS)

Page version with screenshots and copy buttons: https://am015-dev.github.io/spotify_to_ytmusic/facelift.html

- Date: 10 Oct 2026. Source: each game opened with Playwright at 390x763 (touch) and 1280x800, a real game vs the computer, plus the page CSS and each game's art hand-off notes. Screenshots are small thumbnails (full-size ones are in games-src/facelift-shots/).
- Flow rules (same as MISSING-ASSETS.md): paste the game's style block in front of every prompt, same seed and settings within a game, never feed in scans of any original game, no text, letters or numbers inside pictures. For cut-outs ask for a flat white background (we key it); for 9-slice frames ask for an empty centre and we cut the corners. Make everything at 1024 px or larger; we crop and convert to WebP.
- Sizes below are what we publish, not what Flow makes. 'Kit pack' = the shared chrome (top bar, icon buttons, panels, bubble, story map nodes): paint it once for Sands, and if the owner likes it re-run it for each game with the palette words swapped (about 14 files each).

## Summary

| Game | Elements to paint (files) | TRELLIS candidates | Priority |
|---|---:|---:|---|
| Sands of Qamar | 22 (129) | 4 | High |
| Crown City Smash | 6 (210) | 4 | High |
| Nebula Aces | 5 (31) | 2 | Medium |
| Doorkick Dungeon | 7 (33) | 2 | Medium |
| Shipwreck Isle | 4 (39) | 3 | Medium |
| Sunglaze | 6 (20) | 2 | High |
| Rampart & Vine | 5 (38) | 1 | High |
| Short Fuse | 5 (21) | 2 | High |
| Tidewake | 5 (22) | 2 | High |
| Hollowbough | 4 (23) | 1 | Low |
| The Thornbound Throne | 5 (29) | 2 | Medium |
| Kaiten Kitchen | 4 (23) | 1 | Medium |
| Lantern Dive | 4 (28) | 1 | Medium |
| Cauldron Fair | 5 (22) | 2 | Medium |
| Final Approach | 5 (27) | 1 | Medium |
| Mainhattan Nightrun | 3 (8) | 0 | Low |
| **Total** | **95 (703)** | **30** | |

Priority = what players see most that is still a CSS box or emoji. Files include the 14-file kit pack per game and, for Crown City Smash, 182 power-card pictures.

## TRELLIS, how it fits

- TRELLIS gives one GLB mesh from ONE picture. Source image rules: one subject, 3/4 front view, plain light-grey (#d9d9d9) background, even soft light, no cast shadow, no text, 1024x1024. A flat painted cut-out works only if it is already shown 3/4 and un-occluded; otherwise paint a new 1-subject image.
- After TRELLIS: decimate to the triangle budget (Blender Decimate or gltf-transform simplify), bake a 512 px texture (1024 only for hero pieces), export GLB with meshopt + WebP textures. Budget: under 300 KB per file (the 8 Crown monsters today are 0.48-1.15 MB: over budget).
- Two ways to use a GLB. (1) three.js games (Crown City Smash, Nebula Aces, Shipwreck Isle, Sunglaze, Tidewake): load it as a board piece behind the existing quality toggle. (2) DOM/Pixi/canvas games: do NOT add a 3D runtime; pre-render sprites or a 12-24 frame turntable strip from the GLB (transparent WebP) and use them like any painting. Pixi games already use pixi.js, which cannot load a GLB.
- Honest limits: at 18-24 px a good 2D paint is as readable as a render, so 3D mostly buys consistent lighting, lift/tilt frames and one 'hero moment' per game (door kick, bomb, bag draw, djinn summon, wire cut). Faces/characters and anything with pixel-exact patterns (tiles, dice, wires, route lines) stay 2D.

## Sands of Qamar (`games/sands-of-qamar/`)

**High priority.** The board tiles and table are painted, but everything that sits on them is still a CSS box or an emoji: pieces, tokens, goods, djinn cards, chips, buttons, bars, panels, the story map. All 28 djinns share one placeholder lamp. Tech: DOM/CSS grid, no WebGL.

- Already painted: 10 tile paintings (+ ravine, lake), 3 card backs, 5 tables (+ phone default), title + phone title, win/lose end art, 12 story portraits (35 files in media/). All wired.
- Keep in code: Tile owner ring and glow states, bid coin costs, seat score numbers, the 6 tribe colours (hex exact), line text, score table (all live text).
- Screenshots: `games-src/facelift-shots/sands-title.jpg` (Title), `games-src/facelift-shots/sands-bid.jpg` (Bid phase), `games-src/facelift-shots/sands-board.jpg` (Move phase), `games-src/facelift-shots/sands-close-top.jpg` (Close-up top (2x)), `games-src/facelift-shots/sands-close-bottom.jpg` (Close-up goods (2x)), `games-src/facelift-shots/sands-djinns.jpg` (Djinns pop-up), `games-src/facelift-shots/sands-menu.jpg` (Menu drawer), `games-src/facelift-shots/sands-story-map.jpg` (Story map), `games-src/facelift-shots/sands-chapter.jpg` (Chapter sheet), `games-src/facelift-shots/sands-end.jpg` (End screen), `games-src/facelift-shots/sands-desktop.jpg` (1280 end screen)

Style block (paste in front of every prompt): > Hand-painted gouache illustration for a bazaar-and-palace bidding game, warm sand, copper and lapis blue, lantern light, soft rim light, matte paper texture, slightly wobbly dark brown outline, simple readable silhouette, no text

### S1. Meeples: the six tribes  [3D candidate]
- Where: On every tile (up to ~10 per tile, 12-18 px), in seat chips (9 px), in the tribe pop-over (28 px), in every flying/drop animation, in help bubbles
- Now: Two CSS blobs per piece: a circle head over a rounded body, flat colour, thin dark outline, white highlight. Nothing painted.
- Target: `games/sands-of-qamar/media/meeple-{vizier,elder,merchant,builder,assassin,artisan}.webp`: 6 files, 128x152 px, transparent WebP (shown at 9-28 px; keep the silhouette fat and simple). The six colours are the rules, so keep the hex values exact: Advisor #f2c230, Sage #f4f1ea, Trader #3fa34d, Mason #2f6fd6, Shadow #d23a2e, Crafter #9a5bd0. Glow/lift stays CSS.
- Prompt (after the style block): a single chunky wooden game piece shaped like a small bazaar traveller, round head, plain robe with a flared hem, no face details, painted solid saturated {COLOUR} gouache with a soft top-left highlight, front view, single object, centred, plain flat white background, no shadow, no text   (run once per colour: golden yellow, cream white, leaf green, cobalt blue, brick red, violet purple; same seed)

### S2. Camel owner tokens (+ Crafters tents)  [3D candidate]
- Where: Lower-right corner of every claimed tile (18 px); seat chip camel counter
- Now: Emoji camel (and emoji tent) inside a CSS circle in the player colour with a white ring.
- Target: `games/sands-of-qamar/media/token-camel-{0..4}.webp and token-tent-{0..4}.webp`: 10 files, 96x96 px, transparent. Player colours: #2b2b33 Onyx, #119e98 Teal, #ff4fa3 Rose, #8b5a2b Cedar, #6d7b8d Slate (the ring colour is what says who owns the tile).
- Prompt (after the style block): a round clay game token seen from above with a thick {COLOUR} rim and a cream centre stamped with a standing camel silhouette in the rim colour (second set: a small striped tent instead of the camel), single object, centred, plain flat white background, no shadow, no text

### S3. Palm and palace markers  [3D candidate]
- Where: On Oasis and Hamlet tiles when planted/built (15 px, with a x2/x3 count)
- Now: Emoji palm and castle with a white text-shadow.
- Target: `games/sands-of-qamar/media/token-palm.webp, token-palace.webp`: 2 files, 96x96 px, transparent. The xN count stays text.
- Prompt (after the style block): (file 1) a small round-topped date palm with five curved fronds and two dates, (file 2) a small sandstone palace with one gold onion dome and two slim towers; single object, centred, plain flat white background, no shadow, no text; slightly top-down view

### S4. Tile frames (red and blue edge)
- Where: Around all 30 tiles of the bazaar grid
- Now: 2 px CSS border, blue or red (blue-colour tiles are the ones Masons count), plus a 4 px inset ring in the owner colour. The tile paintings themselves are done.
- Target: `games/sands-of-qamar/media/ui-tile-frame-blue.webp, ui-tile-frame-red.webp`: 2 files, 192x192 px, 9-slice (corners 24 px), transparent PNG/WebP, centre empty. KEEP the owner ring in CSS: it is the rule signal.
- Prompt (after the style block): a square ornamental picture-frame border, glazed {lapis-blue / terracotta-red} ceramic with tiny gold studs in the corners, thin, centre filled flat white (we key it out), seen straight on

### S5. Value badges and name plates
- Where: Top-right gold number on every tile; cream name pill top-left; number circle on djinn bars
- Now: Gold CSS circle with a brown border; cream CSS pill (the name is cut off at 390 px: 'Shri.', 'Baz...').
- Target: `games/sands-of-qamar/media/ui-badge-gold.webp, ui-badge-cream.webp, ui-nameplate.webp`: badges 96x96 transparent; name plate 9-slice 192x56 transparent. Numbers and names stay live text.
- Prompt (after the style block): a blank round gold seal coin with a raised rim and a tiny sunburst, no marking, single object, centred, plain flat white background, no shadow, no text   |   (plate) a blank cream paper label with torn edges and a thin brown outline, flat, single object, centred, plain flat white background, no shadow, no text

### S6. Tile kind glyphs (fixes the truncated names)
- Where: Replace the cut-off text on tiles (9 kinds)
- Now: Text pill 'Baz...', 'Shri.', 'Ha...' at 11 px; the paintings are good but the name does not fit.
- Target: `games/sands-of-qamar/media/glyph-{village,sacred,oasis,small,large,workshop,exchange,city,lake}.webp`: 9 files, 96x96 px, transparent round medallion, readable at 24 px. Hamlet = house, Shrine = dome, Oasis = palm and pool, Bazaar Stall = awning, Grand Bazaar = two awnings, Workshop = anvil, Spice Exchange = scales with a spice bowl, Wonder City = minaret, Lake = wave.
- Prompt (after the style block): a round brass medallion with an embossed {SYMBOL} in the middle, lapis-blue enamel background, one bold shape, no letters, single object, centred, plain flat white background, no shadow, no text

### S7. Goods icons (10)
- Where: Market row (9 cards, 34 px tall), your goods chips, flying goods, sell chooser, seat counters, card list
- Now: Emoji on a cream CSS card (tusk, gem, medal, scroll, scarf, chilli, fish, wheat, jug, crystal ball).
- Target: `games/sands-of-qamar/media/good-{ivory,jewels,gold,papyrus,silk,spice,fish,wheat,pottery,fakir}.webp`: 10 files, 192x192 px, transparent WebP (drawn at 19-26 px: bold, one object, strong colour).
- Prompt (after the style block): {OBJECT}, three-quarter view, single object, centred, plain flat white background, no shadow, no text   (objects: a single curved elephant tusk, polished cream ivory with a brass cap; a small heap of three faceted gemstones, ruby, sapphire and emerald, glinting; a stack of two gold ingots with a stamped crescent, warm shine; a rolled papyrus scroll tied with a red cord, one end unrolled; a folded bolt of red silk cloth with a ruffled corner, gold thread edge; a small copper bowl heaped with orange-red spice powder and two dried chillies; one plump silver fish with a blue back, simple friendly shape; a tied sheaf of golden wheat ears; a round-bellied terracotta jug with a lapis-blue painted band and two handles; a glowing violet crystal ball on a small brass stand, a tiny star inside)

### S8. Goods card frame
- Where: Behind every goods icon in the market row and your hand strip
- Now: Cream-to-sand CSS gradient, 1 px brown border, inset gold ring.
- Target: `games/sands-of-qamar/media/ui-goods-card.webp`: 1 file, 9-slice 160x200 PNG/WebP with alpha, corners 20 px; cream paper with a thin gilt edge, centre calm. Green/gold glow states stay CSS.
- Prompt (after the style block): a blank small playing-card shape in cream paper with a thin gilded edge and tiny corner flourishes, centre empty, single object, centred, plain flat white background, no shadow, no text

### S9. Djinn portraits (28)
- Where: Djinns pop-up (the lamp icon), Card list, Players sheet, tooltips; could also thumbnail the 3 on-offer bars
- Now: One identical SVG genie-lamp for all 28; only the background hue changes by name. The on-board bars show just the name and points.
- Target: `games/sands-of-qamar/media/djinn-{k}.webp (k = the 28 keys in the djinn table)`: 28 files, 480x360 px (4:3), opaque WebP. Ship at 360x270 if size matters (~25 KB each).
- Prompt (after the style block): one prompt per djinn, listed in the 'Djinn prompts' table; append to each: , waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape

### S10. Djinn bar on the table
- Where: The 2-3 face-up djinns under the goods row
- Now: Purple CSS gradient bar, gold border, cream number circle, card-back painting tinted behind it.
- Target: `games/sands-of-qamar/media/ui-djinn-bar.webp`: 1 file, 9-slice 512x96 px, transparent; deep violet lacquer with a gold edge, clear centre. Text stays live.
- Prompt (after the style block): a long narrow banner plaque in deep violet lacquer with a thin hammered-gold border and small gold stars at both ends, centre plain, single object, centred, plain flat white background, no shadow, no text

### S11. Items (Crafters expansion) and Cutpurses
- Where: Only when the Crafters / Cutpurse sets are on: item tags, thief buttons, Players sheet
- Now: Text tags and buttons with a wand and a thief emoji, no pictures at all.
- Target: `games/sands-of-qamar/media/item-{gem5,gem7,gem9,carpet,lamp,flute,scimitar,talisman,horn}.webp, thief-{assassin,builder,merchant,vizier,elder,artisan}.webp`: 15 files, 192x192 px, transparent. Lower priority (expansions are off by default).
- Prompt (after the style block): Items: Silver Bangle = a chunky silver bangle set with small turquoise stones; Jade Casket = a small carved jade casket with a gold clasp; Sun Diadem = a gold diadem shaped like sun rays with a red jewel; Wind Rug = a small rolled flying carpet with tassels and a swirl of wind; Brass Lamp = a polished brass oil lamp; Reed Pipe = a reed pipe with a tassel; Ember Blade = a curved scimitar with glowing orange ember patterns; Storm Charm = a round copper charm with a storm cloud and a lightning bolt; Plenty Horn = a curved ram horn overflowing with fruit and coins. Cutpurses: a hooded cutpurse bust in a {COLOUR} scarf with a tiny curved knife. Each: single object, centred, plain flat white background, no shadow, no text

### S12. Seat chips and stat icons
- Where: Top of the screen: one chip per player (score race), also in the Players sheet and the end table
- Now: Cream rounded box with a coloured border; coin, camel, tent, Mystic, basket, djinn emoji and a text star.
- Target: `games/sands-of-qamar/media/ui-seat-chip.webp + icon-{coin,camel,star,basket,djinn}.webp`: chip 9-slice 256x120 transparent; 5 icons 96x96 transparent (Mystic reuses good-fakir). Player-colour border stays CSS.
- Prompt (after the style block): a blank cream scoreboard plaque with a thin brown wooden border and a small rope loop on each side, centre empty, single object, centred, plain flat white background, no shadow, no text   |   icons: a gold coin with a crescent, a standing camel silhouette, a gold five-point star, a woven basket with a lid, a small brass lamp

### S13. Buttons (3 kinds)
- Where: Action buttons under the board ('End turn', 'Sell', 'Skip'), Play/Story buttons on the title, bid buttons, choice chips
- Now: Cream gradient pill (normal), terracotta gradient (main action), lilac gradient (djinn power), 2 px brown border.
- Target: `games/sands-of-qamar/media/ui-button-cream.webp, ui-button-go.webp, ui-button-power.webp`: 3 files, 9-slice 256x96 px, transparent, normal state only (pressed = CSS shift). Text stays live.
- Prompt (after the style block): a blank rounded button plate, {cream enamel with a copper rim / terracotta-orange enamel with a dark copper rim / violet enamel with a gold rim}, soft top highlight, centre empty, single object, centred, plain flat white background, no shadow, no text

### S14. Turn-order spots
- Where: Bidding phase: 9 (or 12 at 5 players) spots in a row under the board
- Now: Cream boxes with a coin cost; a taken spot fills solid with the bidder's colour.
- Target: `games/sands-of-qamar/media/ui-spot.webp`: 1 file, 9-slice 128x160, GREYSCALE so CSS can tint it with the player colour (background-blend-mode: multiply).
- Prompt (after the style block): a blank tall wooden peg-board slot with a small coin dish at the bottom, greyscale, soft carved edges, single object, centred, plain flat white background, no shadow, no text

### S15. Top bar and icon buttons
- Where: Every screen (hint bulb, djinn lamp, log, menu; desktop also players, cards, rules, sound, music, speed, settings)
- Now: Dark-brown CSS gradient bar, text title, round-corner buttons with thin line SVG icons.
- Target: `games/sands-of-qamar/media/ui-topbar.webp, ui-iconbtn.webp, icon-{hint,djinn,log,menu,players,cards,rules,sound,music,speed,settings,newgame}.webp`: bar 1024x88 repeat-x opaque (carved dark wood, brass inlay); icon button 9-slice 96x96 transparent; 12 icons 128x128 transparent. SHARED KIT: if liked, re-run with the palette words swapped for each game.
- Prompt (after the style block): (bar) a long strip of carved dark walnut with a thin brass inlay line and tiny lapis studs, seamless left to right, empty   |   (icons) a small hand-painted brass-and-lapis icon of {a lit lamp bulb / a genie lamp / a rolled ledger scroll / three brass bars / ...}, bold, readable at 24 px, single object, centred, plain flat white background, no shadow, no text

### S16. Menu drawer rows
- Where: Menu drawer (Players and scores, Djinns, Card list, How to play, Sound, Music, Speed, Settings, Story, New game)
- Now: Cream rows, each with a text-size emoji icon (camel, genie, card, book, speaker, notes, fast-forward, gear, scroll, plus).
- Target: `games/sands-of-qamar/media/ui-row.webp (+ the S15 icons)`: 1 file, 9-slice 512x88 transparent; reuse the S15 icon set instead of emoji.
- Prompt (after the style block): a blank wide parchment strip with a thin copper edge and a small lapis diamond at the left end, centre empty, single object, centred, plain flat white background, no shadow, no text

### S17. Parchment panels (menu, results, drawers)
- Where: Start menu box, end-of-game screen, every drawer and sheet, card-list cards
- Now: Cream gradient box, 3 px brown border, sticky button row. The painted title and end pictures sit behind or above it.
- Target: `games/sands-of-qamar/media/ui-panel.webp, ui-drawer-head.webp`: panel 9-slice 512x512 transparent PNG (aged parchment, gilt filigree corners, calm centre); drawer head 1024x96 repeat-x (dark wood, brass trim).
- Prompt (after the style block): an aged parchment panel with gilt filigree in the four corners and a thin copper border, the whole centre plain and empty, single object, centred, plain flat white background, no shadow, no text   |   (head) a strip of dark carved wood with a brass edge line, seamless

### S18. Coach bubble and choice pop-over
- Where: Tutorial bubbles ('Buy turn order'), the pop-over for a choice (#chz)
- Now: Cream rounded box, orange border, red 'Got it' button.
- Target: `games/sands-of-qamar/media/ui-bubble.webp, ui-bubble-tail.webp`: bubble 9-slice 256x160, tail 64x48, transparent.
- Prompt (after the style block): a blank speech-bubble panel made of cream paper with a copper outline and a tiny curl at one corner, single object, centred, plain flat white background, no shadow, no text   |   a small matching pointed tail

### S19. Ghost finger (first-move hint)
- Where: Opening move of each phase for new players
- Now: Inline SVG pointing hand with a CSS ring.
- Target: `games/sands-of-qamar/media/ui-finger.webp`: 1 file, 136x184 transparent; keep the CSS ring. Optional.
- Prompt (after the style block): a painted pointing hand, index finger out, cuff with a copper bracelet, soft shadow, single object, centred, plain flat white background, no shadow, no text

### S20. Story map (shared campaign kit)
- Where: Story mode: chapter map with ten nodes in three acts, chapter sheet, results
- Now: Cream radial-gradient CSS background, brown dashed CSS road, number discs (grey locked, green open, portrait ring on bosses), dark act banners, cream chapter sheet with star goals.
- Target: `games/sands-of-qamar/media/story-map.webp, ui-node-{open,locked,done,boss}.webp, ui-act-banner.webp, ui-star-{on,off}.webp`: map 780x2200 tall opaque (scrolls; NO road, the CSS road keeps following the node positions); nodes 160x160 transparent (numbers stay text); banner 9-slice 1024x96; stars 64x64.
- Prompt (after the style block): (map) a tall painted old caravan map on parchment seen from above: sand dunes, a lake, a ruined fort, an oasis, a palace city at the top, empty winding space in the middle for a road, no text, no marks   |   (node) a round brass medallion with a lapis ring, centre blank   |   (star) a gold five-point star with a soft glow

### S21. Result screen furniture
- Where: End-of-game screen (trophy line, headline, score table)
- Now: Trophy emoji, plain heading, cream table. The painted win/lose pictures are done.
- Target: `games/sands-of-qamar/media/ui-trophy.webp, ui-ribbon.webp`: trophy 192x192 transparent; ribbon 9-slice 768x160 (an empty banner for 'You win!' text).
- Prompt (after the style block): a small copper trophy cup with a lapis band and two handles, single object, centred, plain flat white background, no shadow, no text   |   a blank curling ribbon banner in terracotta with gold edges, centre empty

### S22. Score pop-ups and flying pieces
- Where: Where points are earned: '+8' floating text, goods/coins/camels flying to the chips
- Now: Green text with a white halo; flying emoji.
- Target: `games/sands-of-qamar/media/fx-sparkle.webp (+ reuse icons)`: 1 file, 8 frames in a 1024x128 strip, additive glow on black. The '+8' text stays text.
- Prompt (after the style block): a small burst of gold sparkles with four-point stars, 8 stages from a tiny glint to fading, on a pure black background

### Djinn prompts (S9): file `games/sands-of-qamar/media/djinn-<key>.webp`, 480x360

Append to each: `waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape`

| Key | Name | Pts | Prompt (after the style block) |
|---|---|---:|---|
| zarifa | Zarifa | 5 | a serene pale-blue smoke djinn woman holding two glowing orbs that melt into one, waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape |
| tamuz | Tamuz | 8 | a grinning djinn pulling three small wooden figures out of a bottomless velvet bag, waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape |
| harith | Harith | 6 | a jolly round djinn with a fat purse, coins clinking out of it every time he laughs, waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape |
| sadim | Sadim | 6 | a stoic guardian djinn with a shield of woven smoke standing in front of two small figures, waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape |
| nuraya | Nuraya | 6 | a graceful djinn lifting a small glowing domed palace out of a swirl of sand, waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape |
| qirsh | Qirsh | 4 | a burly djinn mason with a trowel and a hammer, two tall stacks of gold coins beside him, waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape |
| wahha | Wahha | 8 | a gentle green-smoke djinn planting a palm sapling that sprouts as she waves her hand, waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape |
| burhan | Burhan | 10 | a regal djinn taking a giant stride across a tiled floor, carrying a small palace on one palm, waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape |
| nakhla | Nakhla | 8 | a tall djinn with palm fronds for hair and clusters of dates in both hands, waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape |
| ghulam | Ghulam | 8 | a sneaky dark-smoke djinn boy with two curved daggers and a wide grin, waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape |
| wazira | Wazira | 6 | a dignified djinn vizier in a tall turban with a golden quill and three small scrolls, waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape |
| sirra | Sirra | 6 | a veiled djinn in a star-patterned robe whispering a secret, one bright eye visible, waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape |
| dalil | Dalil | 6 | a friendly djinn guide holding up a lantern and a little glowing compass orb, a price tag dangling from his belt, waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape |
| rawda | Rawda | 10 | a playful djinn gardener with a watering can, a palm sprouting beside her, waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape |
| jamal | Jamal | 4 | a handsome djinn riding a camel made of smoke, waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape |
| tariq | Tariq | 6 | a swift djinn runner with a coin pouch, a trail of tiny gold coins behind his footsteps, waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape |
| qasra | Qasra | 6 | a proud djinn architect holding a rolled plan and a tiny glowing palace, waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape |
| khanjar | Khanjar | 6 | a djinn with a curved dagger, a gold coin balanced on the flat of the blade, waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape |
| hikma | Hikma | 6 | an elderly bearded djinn sage reading an open ancient book, glowing eyes, waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape |
| ruya | Ru’ya | 4 | a dreamy djinn gazing into a crystal ball that shows three tiny lamps, waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape |
| suqra | Suqra | 8 | a cheerful djinn dealer fanning out a handful of goods cards like a magician, waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape |
| fath | Fath | 4 | a stern djinn herder with a rope, a camel standing behind him on a crowd of tiny figures, waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape |
| amir | Amir | 6 | a splendid djinn emir with a feathered turban and a heavy gold chain (promo djinn), waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape |
| majlis | Majlis | 0 | three little smoke djinns sitting around a low table with a glowing lamp (promo djinn), waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape |
| dukkan | Dukkan | 0 | a sly djinn shopkeeper behind a stall counter hung with goods (promo djinn), waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape |
| jawhar | Jawhar | 6 | a djinn jeweller with a loupe, holding a glowing jewel up to the light (Crafters set), waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape |
| sana | San’a | 6 | a djinn craftsman with a chisel and a half-carved brass lamp (Crafters set), waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape |
| hafiz | Hafiz | 6 | a calm protector djinn standing behind a shield shaped like a big lock (Cutpurse set), waist-up, body ending in a curl of coloured smoke, expressive face, soft plain backdrop in the djinn's colour, 4:3 landscape |

#### TRELLIS for Sands of Qamar

| Item | Source image for TRELLIS | GLB target and budget | Use | Value |
|---|---|---|---|---|
| Meeple (one base mesh, 6 colours) | NEW Flow image: the S1 meeple in 3/4 front view on plain light-grey (#d9d9d9), even soft light, no cast shadow | models/meeple.glb, 40-60 KB, <=1.5k triangles, 256 px base texture or flat material; recolour per tribe | Pre-render 6 sprites (128x152) and 6 'lifted' sprites with a soft contact shadow from one fixed 3/4 camera; the same camera is used for the camel, palm and palace so the whole piece family has one light. | Medium. At 18 px a good 2D paint is just as readable; the gain is one consistent light and free lift/drop frames. |
| Camel figurine (owner token) | NEW Flow image: a carved wooden camel standing, 3/4 view, light-grey background (not the flat S2 token) | models/camel.glb, 80-120 KB, <=3k triangles | Pre-render 5 colour-saddle sprites (96x96) for the tile corner; hero view in the Players sheet. | Low-medium. |
| Palm and palace miniatures | NEW Flow images: palm tree on a tiny sand base; palace with dome on a tiny base | models/palm.glb 50-80 KB, models/palace.glb 80-110 KB | Pre-render sprites for the x1/x2/x3 stacks on tiles (stack = same sprite offset up). Shows height and lighting that a flat icon cannot. | Medium. |
| Djinn lamp + summoning moment | The S15 'djinn' icon painting or a NEW 'brass oil lamp, 3/4 view' Flow image | models/lamp.glb, 150-250 KB, <=6k triangles (smoke is NOT in the mesh) | Pre-render a 24-frame turntable strip (24 x 256x256 WebP, ~60 KB) shown big in the 'summon a djinn' pop-up, with the painted djinn portrait rising out of CSS smoke. This is the game's tactile centrepiece (the Shrine moment) and currently has none. | High (the one place 3D helps). |
| Tiles, goods, djinn portraits, panels, buttons | n/a | n/a | Do NOT 3D. Tiles are 60 px painted squares, goods are 24 px icons, djinns are characters (2D paint reads better), UI is flat. Adding three.js (~150 KB) only for pieces is not justified: use TRELLIS as an offline asset factory and ship sprites. | None. |


## Crown City Smash (`games/crown-city-smash/`)

**High priority.** The 3D board and monsters are the strongest art on the shelf; the weak parts are the 182 text-only power cards and the cream CSS chrome. Tech: three.js board + DOM dock.

- Already painted: 10 monster portraits + 10 cut-outs, 8 GLB monsters (0.5-1.15 MB each), 2 card backs, 2 tables, title, end art, 3 boss clips.
- Keep in code: Dice faces and pips, card numbers/costs, HUD numbers, text.
- Screenshots: `games-src/facelift-shots/crown-city-smash-menu.jpg` (Menu), `games-src/facelift-shots/crown-city-smash-board.jpg` (3D board), `games-src/facelift-shots/crown-city-smash-desktop.jpg` (Desktop menu)

Style block (paste in front of every prompt): > Bold hand-painted gouache illustration for a cheerful giant-monster city-brawl dice game, thick dark ink outline, saturated neon-night city colours, playful and a little menacing but never gory, simple readable silhouette, centred, no text

### C1. Power-card pictures
- Where: Card shop (3 face-up), owned cards, card zoom, reference list
- Now: 182 base-deck cards (+24 keyword-set cards, costumes, menace tiles, curses, evolutions) print as a CSS frame with a gradient art band and no picture.
- Target: `games/crown-city-smash/media/pc-{id}.webp (id = key in games-src/kot/data.js)`: one 360x220 (3:2) opaque WebP per card; start with the 182-card base deck; ~15 KB each
- Prompt (after the style block): a cartoon picture of '{CARD NAME}': {the one-line effect shown as a picture, e.g. Corrosive Drool = a monster dripping green acid on a car}, one clear subject, no frame, no text, landscape 3:2   (names and effects come from the data file; generate in batches of 10 with the same seed)

### C2. Menu and dialog panels
- Where: Start menu, monster picker, end screen, Players/Cards drawers
- Now: Cream paper CSS panels with a soft shadow; buttons are CSS enamel.
- Target: `games/crown-city-smash/media/ui-panel.webp, ui-drawer-head.webp, ui-button-{yellow,pink,ghost}.webp`: panel 9-slice 512x512 PNG alpha; head 1024x96 repeat-x; 3 buttons 9-slice 256x96
- Prompt (after the style block): a blank comic-book caption panel in cream paper with a thick dark ink border and a halftone corner, centre empty, single object, centred, plain flat white background, no shadow, no text

### C3. Monster HUD chips and stat icons  [3D candidate]
- Where: Top strip: one chip per monster (portrait cut-out is painted); heart, energy, star counters
- Now: CSS chip with a coloured outline; heart/energy/star are text glyphs/emoji.
- Target: `games/crown-city-smash/media/ui-hud-chip.webp, icon-{heart,energy,star,crown}.webp`: chip 9-slice 192x72 transparent; 4 icons 96x96 transparent
- Prompt (after the style block): a glossy red heart / a yellow lightning-bolt battery cell / a gold star / a small gold crown, chunky, thick ink outline, single object, centred, plain flat white background, no shadow, no text

### C4. Dice tray and Roll/Done bar
- Where: Bottom dock in portrait (the dice and the Roll button)
- Now: Dark CSS tray with a gradient; dice are CSS ivory cubes (keep).
- Target: `games/crown-city-smash/media/ui-dice-tray.webp`: 9-slice 768x256, transparent; the dice stay code (pips must be pixel-exact)
- Prompt (after the style block): a long rounded dice tray lined with green felt and a dark wood rim, seen from above, empty, single object, centred, plain flat white background, no shadow, no text

### C5. Energy cubes, stars, hearts as pickups  [3D candidate]
- Where: Gain/loss animations and floating '+3' pop-ups
- Now: Plain text and emoji pop-ups.
- Target: `games/crown-city-smash/media/fx-{energy,star,heart}.webp`: 3 files, 128x128 transparent (also used flying to the chips)
- Prompt (after the style block): a glowing green energy cube with a bolt / a gold star / a red heart, chunky, single object, centred, plain flat white background, no shadow, no text

### C6. Shared UI kit skin
- Where: Top bar, drawers, coach bubble, story map and nodes (shared campaign kit)
- Now: Dusk-purple CSS chrome and a CSS story map.
- Target: `games/crown-city-smash/media/ui-topbar.webp, story-map.webp, ui-node-*.webp, ui-bubble.webp, icon set`: same 14-file recipe as Sands S15-S20; palette: neon pink, teal, dusk purple
- Prompt (after the style block): see the Sands S13, S15, S17 prompts and swap in this game's style block

#### TRELLIS for Crown City Smash

| Item | Source image for TRELLIS | GLB target and budget | Use | Value |
|---|---|---|---|---|
| Clampede and Dot (the 2 monsters with no GLB) | Existing painted cut-outs cut-clampede.webp and cut-dot.webp (3/4 view, transparent): feed directly | models/clampede.glb, models/dot.glb, <300 KB each | Same loader as the other 8 monsters (3D board piece, turntable in the monster picker). | High (the roster is incomplete in 3D). |
| Re-budget the 8 existing monsters | Re-export of the existing GLBs | 8 files now 0.48-1.15 MB (6.6 MB total) -> <300 KB each (meshopt + 512 px WebP textures) | Faster first paint on phones; no visible change. | High for load time, not a facelift. |
| Skyscraper variants + city centre | NEW Flow images: 4 different neon downtown towers, 3/4 view on light grey; a plaza fountain | models/tower-{a..d}.glb 60-100 KB each, models/fountain.glb 80 KB | Replace the procedural box buildings of buildCity with 4 hand-made silhouettes (instanced); the fountain is the Downtown centrepiece. | Medium. |
| Energy cube, star and heart tokens | C5 paintings | models/token-*.glb, 10-20 KB each | Instanced 3D pickups that fly to the HUD. | Low-medium. |


## Nebula Aces (`games/nebula-aces/`)

**Medium priority.** The arena is 3D but the ships are extruded silhouettes and the cards use flat drawings. Hulls are where a facelift shows. Tech: three.js arena + DOM panels.

- Already painted: 12 pilot portraits, 2 card backs, 2 tables (+ nebula7), title, end art.
- Keep in code: Manoeuvre arrows, dice faces (d8), shield/hull numbers, range grid lines.
- Screenshots: `games-src/facelift-shots/nebula-aces-battle.jpg` (Arena), `games-src/facelift-shots/nebula-aces-squads.jpg` (Squads), `games-src/facelift-shots/nebula-aces-desktop.jpg` (Desktop)

Style block (paste in front of every prompt): > Hand-painted gouache sci-fi illustration for a starfighter duel game, deep indigo space, glowing engine light, clean readable shapes, retro-futurist, rich but not neon colours, no text

### N1. Ship side-view art on pilot cards  [3D candidate]
- Where: Squads picker and pilot cards (every ship in both factions)
- Now: A flat orange/red vector silhouette on a gradient band.
- Target: `games/nebula-aces/media/ship-{id}.webp`: one 512x192 transparent side view per hull (about 6-8 hulls)
- Prompt (after the style block): a {HULL: heavy lancer fighter / light talon fighter / wedge interceptor / ...} starfighter in clean side view flying right, panel lines, small pennant decals without letters, engine glow, single object, centred, plain flat white background, no shadow, no text

### N2. Manoeuvre cards (planning)
- Where: Planning phase: the white / green / red move cards
- Now: CSS gradient cards with drawn arrows (keep the arrows).
- Target: `games/nebula-aces/media/ui-move-card-{white,green,red}.webp`: 3 frames, 160x220 transparent, arrow area empty
- Prompt (after the style block): a blank rounded flight-plan card, {cream / mint-green / signal-red}, with a thin gold border and a small rivet in each corner, centre empty, single object, centred, plain flat white background, no shadow, no text

### N3. Arena floor
- Where: Under the 3D grid in play
- Now: Dark scene with a cyan grid and red/orange deployment bands.
- Target: `games/nebula-aces/media/arena-floor.webp`: 2048x1536 opaque; calm centre, busier edges; the range grid stays drawn in code
- Prompt (after the style block): a painted star-chart sector seen from above, deep indigo with faint nebula clouds and tiny stars, a very calm empty centre, no grid, no text

### N4. Focus / evade / lock / shield / hull icons
- Where: Pilot tags on the board and in cards
- Now: Coloured CSS pills with text.
- Target: `games/nebula-aces/media/icon-{focus,evade,lock,shield,hull}.webp`: 5 files, 96x96 transparent
- Prompt (after the style block): a small glowing {eye / swirl arrow / crosshair / shield / armour plate} badge in brass and indigo, bold, readable at 24 px, single object, centred, plain flat white background, no shadow, no text

### N5. Glass dock, drawers and Launch button
- Where: Bottom dock, drawers, setup screen
- Now: Navy glass CSS gradients with an amber button.
- Target: `games/nebula-aces/media/ui-panel.webp, ui-button-launch.webp, ui-topbar.webp, icon set`: same kit recipe as Sands S15-S20; palette: indigo, brass, amber
- Prompt (after the style block): see the Sands S13, S15, S17 prompts and swap in this game's style block

#### TRELLIS for Nebula Aces

| Item | Source image for TRELLIS | GLB target and budget | Use | Value |
|---|---|---|---|---|
| Starfighter hulls (6-8) | NEW Flow images per hull: 3/4 front view, light-grey background (not the flat N1 side view) | models/na-{dart,wedge,hammer,...}.glb, <200 KB each, <=8k triangles, 512 px texture | Replace the extruded flat hulls on the 3D board; turntable in the squad picker. | High (ships are the game). |
| Asteroids x3 | NEW Flow image: lumpy cratered rock, 3 variants | models/na-rock-{a,b,c}.glb, 30-50 KB each | Replace procedural rockGeo; instanced. | Low. |


## Doorkick Dungeon (`games/doorkick-dungeon/`)

**Medium priority.** Cards and table are painted; the surrounding HUD plaques, piles, medallions and chips are still CSS. Tech: DOM/CSS, painted table.

- Already painted: 147 card paintings, portraits, backs, tables, title, end art, 6 boss clips.
- Keep in code: Dice faces (.die3), card text/levels, level step numbers.
- Screenshots: `games-src/facelift-shots/doorkick-dungeon-board.jpg` (Board), `games-src/facelift-shots/doorkick-dungeon-hand.jpg` (Hand), `games-src/facelift-shots/doorkick-dungeon-desktop.jpg` (Desktop)

Style block (paste in front of every prompt): > Storybook gouache illustration for a cheerful, slightly grubby fantasy dungeon card game, warm torchlight against deep brown stone, thick dark-brown ink outline, simple readable silhouette, matte paper texture, no text
(Derived from the boss-clip prompt: the repo has no written style block for this game.)

### D1. Hero medallion
- Where: Centre of the table: your hero in a ring with a level badge
- Now: Painted portrait inside a CSS gradient ring, CSS level pill.
- Target: `games/doorkick-dungeon/media/ui-medallion.webp`: 512x512 transparent ring (portrait stays separate)
- Prompt (after the style block): an ornate round brass-and-oak medallion frame with a small gem at the bottom for a level badge, centre empty, single object, centred, plain flat white background, no shadow, no text

### D2. Rival chips
- Where: Three chips along the top (portrait, level, gear count, hand count)
- Now: Dark brown CSS pills with small icons.
- Target: `games/doorkick-dungeon/media/ui-rival-chip.webp, icon-{level,gear,hand}.webp`: chip 9-slice 256x96; 3 icons 96x96 transparent
- Prompt (after the style block): a blank carved-wood name plaque with a brass edge, centre empty, single object, centred, plain flat white background, no shadow, no text   |   a gold level gem / a crossed sword-and-shield / a fan of three cards

### D3. Door and treasure piles
- Where: Left and right of the hero: the two decks with their counts
- Now: CSS stacked rectangles.
- Target: `games/doorkick-dungeon/media/pile-door.webp, pile-treasure.webp`: 2 files, 256x256 transparent
- Prompt (after the style block): a short stack of dungeon cards with a heavy wooden door printed on the top card / a stack with a treasure chest on top, single object, centred, plain flat white background, no shadow, no text

### D4. Parchment ledger panels and drawers
- Where: Dock under the table, Rivals sheet, Diary, card zoom
- Now: Parchment CSS gradients with a gilt hairline.
- Target: `games/doorkick-dungeon/media/ui-parchment.webp, ui-ledger-head.webp`: panel 9-slice 512x512; head 1024x96 repeat-x
- Prompt (after the style block): a stained parchment sheet with a burnt edge and a thin gilt line, centre plain, single object, centred, plain flat white background, no shadow, no text

### D5. Gear slot plaques and curse tokens
- Where: 'In play' row under the hero (Head / Body / Feet / Hands / Class / Race), curse markers
- Now: Brass-edged CSS plaques with text.
- Target: `games/doorkick-dungeon/media/ui-slot-{head,body,feet,hands,class,race}.webp, token-curse.webp`: 7 files, 96x96 transparent
- Prompt (after the style block): a small brass-edged oak plaque with a {helmet / breastplate / boot / glove / sword / pointed ear} silhouette stamped in it, single object, centred, plain flat white background, no shadow, no text

### D6. Clash medallions and swords
- Where: Fight screen: hero vs monster strength numbers
- Now: Two CSS circles with gradients and a crossed-swords glyph.
- Target: `games/doorkick-dungeon/media/ui-clash-hero.webp, ui-clash-monster.webp, ui-swords.webp`: 3 files, 256x256 transparent
- Prompt (after the style block): a round blue shield medallion / a round red skull-crest medallion / two crossed swords, bold, thick ink outline, single object, centred, plain flat white background, no shadow, no text

### D7. Buttons and top bar
- Where: Story, Start, How to play, Music; the HUD bar
- Now: Parchment gradient buttons, dark-wood CSS bar.
- Target: `games/doorkick-dungeon/media/ui-button-*.webp, ui-topbar.webp, icon set`: kit recipe as Sands S13/S15; palette: oak, brass, parchment
- Prompt (after the style block): see the Sands S13, S15, S17 prompts and swap in this game's style block

#### TRELLIS for Doorkick Dungeon

| Item | Source image for TRELLIS | GLB target and budget | Use | Value |
|---|---|---|---|---|
| The kickable door (the game's moment) | NEW Flow image: a heavy iron-banded dungeon door, 3/4 view, light-grey background | models/door.glb, 120-180 KB, <=5k triangles | Pre-render a 12-frame door-kick strip (hinge swing + dust) played at every door; replaces a text 'Kick' result. | High (it is in the name). |
| Hero minis x4 + d6 | NEW Flow images: 4 standee-style heroes (Pip, Morwen, Grub, Tansy); an ivory die | models/hero-*.glb 100 KB each | Pre-rendered level-up turntable and card zoom; dice stay CSS 3D. | Low-medium. |
| Everything else | n/a | n/a | Cards and table are 2D paintings; no other 3D. | None. |


## Shipwreck Isle (`games/shipwreck-isle/`)

**Medium priority.** The island and pieces are code-built; the cards are painted. Hex textures, action chips and pawns carry the facelift. Tech: three.js island + DOM.

- Already painted: 17 story portraits, 2 card backs, tables, title, end art; 61 art files (beasts, inventions, discoveries, items) exist, some not wired yet.
- Keep in code: Weather dice and numbers, round counters, text.
- Screenshots: `games-src/facelift-shots/shipwreck-isle-island.jpg` (Island), `games-src/facelift-shots/shipwreck-isle-camp.jpg` (Camp panel), `games-src/facelift-shots/shipwreck-isle-desktop.jpg` (Desktop)

Style block (paste in front of every prompt): > Tropical castaway gouache illustration for a co-operative island survival card game, turquoise, sand, jungle green and driftwood colours, soft rim light, matte paper texture, slightly wobbly dark ink outline, simple readable silhouette that works small, centred, plenty of margin, no text

### W1. Unexplored hex fog
- Where: The 3D island: every undiscovered hex is a dark smoky tile
- Now: Grey-black procedural canvas texture with cloud noise.
- Target: `games/shipwreck-isle/media/hex-fog-{a,b,c}.webp`: 3 files, 512x444 hex texture, tileable edge, opaque (mapped on the hex mesh)
- Prompt (after the style block): a top-down hex tile of thick dark volcanic mist, swirling slate-grey cloud, soft rim, centre calm, seamless, no text

### W2. Explored hex terrain
- Where: The island hexes once revealed (beach, jungle, rock, marsh, ruin)
- Now: Procedural canvas textures + 3D trees.
- Target: `games/shipwreck-isle/media/hex-{beach,jungle,rock,marsh,ruins}.webp`: 5 files, 512x444 hex, opaque (check the real terrain list in the game before painting)
- Prompt (after the style block): a top-down hex tile of {white-sand beach with shells / dense jungle canopy / grey rocky ridge / reedy marsh with a pool / overgrown stone ruin}, hand-painted, soft light, no text

### W3. Action chips and resource icons
- Where: Plan row (tool, fire, pot, build, rest ...), camp status (food, dry food, wood, fur, shelter, roof, palisade, weapon)
- Now: Round white CSS discs with line glyphs; tiny emoji in the Camp panel.
- Target: `games/shipwreck-isle/media/icon-act-*.webp, icon-res-*.webp`: about 8 + 9 files, 128x128 / 96x96 transparent
- Prompt (after the style block): a small hand-painted {tool} icon in a wood-and-rope style, bold, readable at 28 px, single object, centred, plain flat white background, no shadow, no text

### W4. Camp panel and plan dock
- Where: Camp status sheet, planning table, 'Start day' bar, Continue button
- Now: Dark-brown / paper CSS panels, orange gradient button.
- Target: `games/shipwreck-isle/media/ui-panel.webp, ui-button-go.webp, ui-topbar.webp, icon set`: kit recipe as Sands S13/S15/S17; palette: driftwood, rope, turquoise
- Prompt (after the style block): see the Sands S13, S15, S17 prompts and swap in this game's style block

#### TRELLIS for Shipwreck Isle

| Item | Source image for TRELLIS | GLB target and budget | Use | Value |
|---|---|---|---|---|
| Castaway figures x4 | NEW Flow images: carpenter, cook, explorer, friend (standing, base disc) | models/sw-{carpenter,cook,explorer,friday}.glb, <=15k triangles, <250 KB each | Replace procedural pawnGroup pawns on the island; turntable in the camp panel. | High (3D island, pawns are the actors). |
| Shelter, palisade, fire, raft | NEW Flow images per structure | models/sw-{shelter,palisade,fire,raft}.glb, 60-120 KB each | Built on the island as you play (build moment). | Medium. |
| Palms/jungle props x3 | NEW Flow images | models/sw-palm-{a,b,c}.glb 30-60 KB (instanced) | Replace procedural jtree trees. | Low-medium. |


## Sunglaze (`games/sunglaze/`)

**High priority.** Painted skins sit under it, but plates, rack, wall and tiles are code. Tiles stay code on purpose. Tech: three.js table (desktop) + DOM phone board.

- Already painted: 11 portraits, 3 card backs, 5 table skins (+ phone), title, end art.
- Keep in code: Tile glyph patterns and the 5 glaze colours (must stay distinct), score tracks, penalty numbers.
- Screenshots: `games-src/facelift-shots/sunglaze-board.jpg` (Phone board), `games-src/facelift-shots/sunglaze-menu.jpg` (Menu), `games-src/facelift-shots/sunglaze-desktop.jpg` (Desktop)

Style block (paste in front of every prompt): > Hand-painted gouache illustration for a glazed-tile mosaic workshop game, jewel-bright glaze colours, warm kiln glow, matte paper texture, slightly wobbly dark ink outline, simple readable silhouette, no text

### G1. Kiln plates  [3D candidate]
- Where: Phone and 3D table: the 4-5 round plates that hold 4 tiles each
- Now: Flat rust-red discs.
- Target: `games/sunglaze/media/kiln-disc.webp, kiln-disc-empty.webp`: 2 files, 512x512 transparent painted terracotta plates (tiles are drawn on top)
- Prompt (after the style block): a round glazed terracotta plate seen from above, wide rim with a wavy cream pattern, flat dished middle, soft rim light, single object, centred, plain flat white background, no shadow, no text

### G2. Centre pool
- Where: The cream oval in the middle where leftover tiles gather (with the first-player sun)
- Now: Cream oval with sunburst rays drawn in canvas.
- Target: `games/sunglaze/media/pool-oval.webp`: 640x384 transparent painted wooden tray, sunburst inlay
- Prompt (after the style block): a large oval wooden serving tray seen from above with a pale sunburst inlay and a brass rim, middle empty, single object, centred, plain flat white background, no shadow, no text

### G3. Player rack: pattern rows and floor
- Where: Your staircase of pattern rows and the minus-point floor row
- Now: Beige rounded CSS cells with a thin border; pink minus cells.
- Target: `games/sunglaze/media/ui-rack-frame.webp, ui-rack-cell.webp, ui-floor-cell.webp`: frame 9-slice 512x512; cells 96x96 transparent
- Prompt (after the style block): a blank carved wooden tile rack with shallow square dishes, warm oak, seen from above, single object, centred, plain flat white background, no shadow, no text

### G4. Mosaic wall cells
- Where: Your 5x5 palace mosaic
- Now: Faint CSS cells with ghost tile glyphs.
- Target: `games/sunglaze/media/ui-wall-cell.webp`: 96x96 transparent shallow plaster dish; glyph ghosts stay code
- Prompt (after the style block): a shallow square plaster recess with a hairline gold edge, single object, centred, plain flat white background, no shadow, no text

### G5. Tile gloss overlay (optional)
- Where: Over every tile (same for all colours)
- Now: Flat glyph squares.
- Target: `games/sunglaze/media/tile-gloss.webp`: 128x128 transparent soft glaze highlight + slight chip; the 5 colours stay code so they remain distinct
- Prompt (after the style block): a soft glossy glaze highlight shape with tiny chips on the corner, white on black, no colour

### G6. Sun token and buttons  [3D candidate]
- Where: First-player marker; Begin / Story buttons, player pills
- Now: Canvas sun disc; CSS gradient buttons.
- Target: `games/sunglaze/media/token-sun.webp, ui-button-*.webp, ui-topbar.webp, icon set`: kit recipe as Sands S13/S15; palette: kiln orange, cobalt, cream
- Prompt (after the style block): a round brass sun token with a smiling face and short rays, single object, centred, plain flat white background, no shadow, no text   |   see the Sands S13, S15, S17 prompts and swap in this game's style block

#### TRELLIS for Sunglaze

| Item | Source image for TRELLIS | GLB target and budget | Use | Value |
|---|---|---|---|---|
| Kiln plates (ceramic dish) | G1 painting, or NEW Flow image: glazed plate 3/4 view | models/plate.glb, 60-90 KB | 3D table: dished plate meshes instead of flat discs; sprite for the phone board. | Medium. |
| Sun first-player token | G6 painting | models/sun.glb, 40-60 KB | Hero piece on the 3D table, tilts when it moves. | Medium. |
| Tiles | n/a | n/a | Do NOT use TRELLIS: tiles must keep crisp code-drawn patterns; keep the extruded slabs. | None. |


## Rampart & Vine (`games/rampart-and-vine/`)

**High priority.** Tiles and table are painted; the followers on top are still drawn discs although the painted pieces exist in media/. Tech: DOM/SVG tiles.

- Already painted: 15 portraits, 3 backs, tables, 14 tile textures, 4 piece paintings (meeple, champion, mason, hog), title, end art.
- Keep in code: Tile edges and feature geometry (pixel-exact), score numbers, placement ghosts.
- Screenshots: `games-src/facelift-shots/rampart-and-vine-board.jpg` (Board), `games-src/facelift-shots/rampart-and-vine-late.jpg` (Late game), `games-src/facelift-shots/rampart-and-vine-desktop.jpg` (Desktop)

Style block (paste in front of every prompt): > Hand-painted gouache illustration for a medieval valley tile-laying game, green fields, stone towers and vines, warm afternoon light, matte paper texture, slightly wobbly dark brown outline, simple readable silhouette, no text

### R1. Followers in player colours  [3D candidate]
- Where: On every claimed road/town/field/monastery (18-26 px)
- Now: Drawn SVG discs with a tiny meeple glyph, red or blue. The painted piece-*.webp files exist in media/ but are not used.
- Target: `games/rampart-and-vine/media/piece-{meeple,champ,mason,hog}-{red,blue,green,yellow}.webp`: 16 files, 128x128 transparent (the 4 existing 256 px paints are one colour: wire them first, then paint or recolour per player)
- Prompt (after the style block): a chunky painted wooden {meeple follower / knight champion / mason with a trowel / little pig} game piece in {COLOUR}, front view, single object, centred, plain flat white background, no shadow, no text

### R2. Score pills and counters
- Where: Top strip (You / Cobalt scores, follower and tile counters)
- Now: Dark CSS pills with dots.
- Target: `games/rampart-and-vine/media/ui-score-pill.webp, icon-{follower,tile,score}.webp`: pill 9-slice 192x64; icons 96x96 transparent
- Prompt (after the style block): a blank wooden name-peg plaque with a small shield on the left, single object, centred, plain flat white background, no shadow, no text

### R3. Tile tray
- Where: Bottom bar with the drawn tile and the rotate button
- Now: Cream CSS strip, round rotate badge.
- Target: `games/rampart-and-vine/media/ui-tray.webp, ui-rotate-btn.webp`: tray 9-slice 768x192 (wooden tray); rotate 96x96
- Prompt (after the style block): a shallow oak tray with a leather lining and rope handles at the sides, seen from above, empty, single object, centred, plain flat white background, no shadow, no text

### R4. Buttons and pills
- Where: Skip, Play now, difficulty pills, Story
- Now: Terracotta / cream CSS pills.
- Target: `games/rampart-and-vine/media/ui-button-*.webp, ui-topbar.webp, icon set`: kit recipe; palette: terracotta, oak, vine green
- Prompt (after the style block): see the Sands S13, S15, S17 prompts and swap in this game's style block

### R5. Result banner
- Where: 'Valley complete' and the win/lose popup
- Now: Plain text.
- Target: `games/rampart-and-vine/media/ui-ribbon.webp, ui-trophy.webp`: ribbon 768x160; trophy 192x192
- Prompt (after the style block): a blank green-and-gold ribbon banner / a small silver goblet with a vine wrapped around it, single object, centred, plain flat white background, no shadow, no text

#### TRELLIS for Rampart & Vine

| Item | Source image for TRELLIS | GLB target and budget | Use | Value |
|---|---|---|---|---|
| Followers x4 kinds (recolour) | The 4 existing painted piece-*.webp (transparent cut-outs: feed directly; a 3/4 view works best, paint one new if needed) | models/piece-{meeple,champ,mason,hog}.glb, 30-60 KB each | Pre-render 4 colours x 4 kinds as sprites with a contact shadow; stacks on tiles look solid. | Medium. |
| Tile towers/trees | n/a | n/a | Tiles are flat textures on purpose (edge matching). | None. |


## Short Fuse (`games/short-fuse/`)

**High priority.** The table is painted but the things you play with, the wire tiles and the fuse bar, are flat CSS. Tech: DOM/CSS, painted table.

- Already painted: 8 portraits, 2 backs, 3 tables (+ phone), title, end art; 28 equipment/character card paintings (cards.html).
- Keep in code: Wire colours and numbers (rule-critical), the dual-cut markers, job text.
- Screenshots: `games-src/facelift-shots/short-fuse-board.jpg` (Board), `games-src/facelift-shots/short-fuse-job.jpg` (Job card), `games-src/facelift-shots/short-fuse-desktop.jpg` (Desktop title)

Style block (paste in front of every prompt): > Workshop gouache illustration for a cheerful bomb-defusal crew card game, warm lamplight against cool blueprint blues, brass and copper wire, slightly wobbly dark ink outline, matte paper texture, simple readable silhouette, no text

### F1. Wire tile body
- Where: The whole play area: 2 rows x 8 of tall blue tiles with orange wires, your hand of 6
- Now: Flat blue CSS rectangles with orange stripes and numbers.
- Target: `games/short-fuse/media/wire-tile-frame.webp`: 9-slice 160x240, GREYSCALE enamel plate with rivets so CSS can tint blue/red/yellow; numbers and wire colours stay code
- Prompt (after the style block): a tall blank enamel control plate with four rivets, a small clamp at the top and a coiled copper wire stub at the bottom, greyscale, single object, centred, plain flat white background, no shadow, no text

### F2. Wire racks
- Where: Each player's row of tiles
- Now: Dark CSS strip.
- Target: `games/short-fuse/media/ui-rack.webp`: 9-slice 768x192 transparent brass rail with clips
- Prompt (after the style block): a long brass mounting rail with spring clips seen from the front, single object, centred, plain flat white background, no shadow, no text

### F3. Fuse track and bomb  [3D candidate]
- Where: Top strip: striped bar, bomb glyph, 0/24 counter
- Now: Orange/brown striped CSS bar and a tiny glyph.
- Target: `games/short-fuse/media/ui-fuse-track.webp, icon-bomb.webp, fx-fuse-spark.webp`: track 1024x64 repeat-x; bomb 96x96; spark strip 512x64 (8 frames)
- Prompt (after the style block): a round black cartoon bomb with a short lit fuse and a brass band, single object, centred, plain flat white background, no shadow, no text   |   a thin rope fuse running left to right, seamless

### F4. Equipment and job card frames
- Where: Equipment cards in hand, Job card sheet
- Now: CSS rounded cards, teal title band.
- Target: `games/short-fuse/media/ui-eq-frame.webp, ui-job-sheet.webp`: 9-slice 256x356 / 512x512
- Prompt (after the style block): a blank riveted blueprint card with a brass corner bracket, centre empty, single object, centred, plain flat white background, no shadow, no text

### F5. Name plates and buttons
- Where: 'Plum is choosing', player chips, Play/Story/More
- Now: Orange and blue CSS pills.
- Target: `games/short-fuse/media/ui-nameplate.webp, ui-button-*.webp, ui-topbar.webp`: kit recipe; palette: brass, copper, blueprint blue
- Prompt (after the style block): see the Sands S13, S15, S17 prompts and swap in this game's style block

#### TRELLIS for Short Fuse

| Item | Source image for TRELLIS | GLB target and budget | Use | Value |
|---|---|---|---|---|
| The bomb (centrepiece) | NEW Flow image: cartoon workshop bomb with a timer and wires, 3/4 view, light-grey background | models/bomb.glb, 150-250 KB, <=6k triangles | Pre-render a wobbling 12-frame idle strip for the top of the table and a 10-frame boom strip for failure; the 'wire cut' moment finally has a thing being cut. | High (single best 3D use here). |
| Cutter pliers | NEW Flow image: red-handled wire cutters, 3/4 view | models/pliers.glb 60 KB | Snip animation sprite when a wire is cut. | Medium. |
| Wire tiles | n/a | n/a | No 3D: colours and numbers must be pixel-exact. | None. |


## Tidewake (`games/tidewake/`)

**High priority.** The 3D table is attractive; on a phone the board is dark teal squares, and ships/leviathans are procedural. Tech: three.js 3D table (desktop) + 2D board (phone).

- Already painted: 12 portraits, 3 backs, 5 tables (+ phone), title, end art.
- Keep in code: Route lines on tiles (rule-critical), numbers 1-8, dice faces.
- Screenshots: `games-src/facelift-shots/tidewake-board.jpg` (Phone board), `games-src/facelift-shots/tidewake-menu.jpg` (Menu), `games-src/facelift-shots/tidewake-desktop.jpg` (Desktop 3D)

Style block (paste in front of every prompt): > Hand-painted gouache illustration for a sea-tile navigation game with giant sea leviathans, deep teal water, warm lantern light, foam and scales, matte paper texture, slightly wobbly dark navy outline, simple readable silhouette, no text

### T1. Sea tile water
- Where: All 46 tiles and the open sea of the board (phone: dark teal squares)
- Now: Flat dark teal canvas squares with checker tint; route lines drawn over them.
- Target: `games/tidewake/media/tile-water-{a,b,c,d}.webp`: 4 tileable 256x256 opaque variants; the wake route lines stay drawn in code
- Prompt (after the style block): a top-down square of deep teal sea water with soft wave crests and a few foam flecks, seamless, no text

### T2. Board frame and start rings
- Where: The perimeter ring of gold slots numbered 1-8 around the board
- Now: Gold rings, plain numbers.
- Target: `games/tidewake/media/board-frame.webp, ring-slot.webp`: frame 9-slice 1024x1024 transparent (carved dark wood with brass), ring 96x96 transparent
- Prompt (after the style block): a carved dark-wood sea-chart frame with brass corner fittings, centre empty, single object, centred, plain flat white background, no shadow, no text   |   a round brass buoy ring seen from above

### T3. Compass rose centre
- Where: Middle of the board
- Now: Canvas-drawn gold star.
- Target: `games/tidewake/media/compass-rose.webp`: 768x768 transparent painted brass compass rose, 8 points
- Prompt (after the style block): a hand-painted brass-and-gold compass rose with eight points seen from above, single object, centred, plain flat white background, no shadow, no text

### T4. Captain name tags
- Where: Floating tags over the board (purple/teal pills), Crews sheet
- Now: Glass-pill CSS.
- Target: `games/tidewake/media/ui-nametag.webp`: 9-slice 192x56 transparent rope-edged tag
- Prompt (after the style block): a small blank luggage tag with a rope loop and a thin brass rim, single object, centred, plain flat white background, no shadow, no text

### T5. Dock, buttons, panels
- Where: Bottom dock (hint, place, rotate), top bar, sheets
- Now: Cream/teal CSS.
- Target: `games/tidewake/media/ui-panel.webp, ui-button-*.webp, ui-topbar.webp, icon set`: kit recipe; palette: teal, brass, cream
- Prompt (after the style block): see the Sands S13, S15, S17 prompts and swap in this game's style block

#### TRELLIS for Tidewake

| Item | Source image for TRELLIS | GLB target and budget | Use | Value |
|---|---|---|---|---|
| Junk ship (8 captain colours) | NEW Flow image: a small Chinese-style junk with batten sails, 3/4 view, light-grey background | models/junk.glb, 120-200 KB, <=8k triangles; sails recoloured per captain | Replace procedural buildShip3D on the 3D table; sprites for the phone 2D board. | High. |
| Leviathan | NEW Flow image: serpent head and coils, 3/4 view | models/leviathan.glb, 200-280 KB, <=10k triangles | Replace buildLevCreature; surfaces from a tile when it wakes (the game's big beat). | High. |
| Buoys and markers | n/a | n/a | Tiny; keep procedural. | None. |


## Hollowbough (`games/hollowbough/`)

**Low priority.** Nearly everything is painted. The counters, pegs and dial are small drawn shapes. Tech: DOM/CSS, painted cards.

- Already painted: 48 cards, 39 place/event paintings, bench, mat, 6 portraits, 4 backs, tables, title, end art.
- Keep in code: All counts and card text.
- Screenshots: `games-src/facelift-shots/hollowbough-board.jpg` (Board), `games-src/facelift-shots/hollowbough-menu.jpg` (Menu), `games-src/facelift-shots/hollowbough-desktop.jpg` (Desktop)

Style block (paste in front of every prompt): > Storybook watercolour and gouache illustration for a woodland city-building game, woodland critters and tree houses in autumn colours, soft brown outline, matte paper texture, simple readable silhouette, no text
(Derived from the hand-off note ('storybook watercolour and gouache, woodland critters and buildings in autumn colours'); no written block in the repo.)

### H1. Resource tokens
- Where: Row chips everywhere: twigs, resin, pebbles, berries
- Now: Small drawn SVG discs.
- Target: `games/hollowbough/media/icon-{twig,resin,pebble,berry}.webp`: 4 files, 96x96 transparent
- Prompt (after the style block): a small bundle of twigs / a golden resin drop / a smooth grey pebble / a cluster of red berries, single object, centred, plain flat white background, no shadow, no text

### H2. Worker pegs  [3D candidate]
- Where: On places you claim
- Now: Round coloured CSS pegs.
- Target: `games/hollowbough/media/token-worker-{red,blue,green,yellow}.webp`: 4 files, 96x96 transparent
- Prompt (after the style block): a tiny acorn-capped woodland worker peg in {COLOUR}, single object, centred, plain flat white background, no shadow, no text

### H3. Season wheel
- Where: Bottom centre dial (season + draw pile)
- Now: Coloured CSS segments.
- Target: `games/hollowbough/media/ui-season-wheel.webp`: 256x256 transparent wooden dial with 4 carved leaf sections
- Prompt (after the style block): a round wooden dial divided into four seasons with a leaf, flower, sun and snowflake motif, single object, centred, plain flat white background, no shadow, no text

### H4. Panels, buttons
- Where: Start menu, Cities sheet, Prepare/Pass buttons
- Now: Cream paper and green/red CSS pills.
- Target: `games/hollowbough/media/ui-panel.webp, ui-button-*.webp, ui-topbar.webp`: kit recipe; palette: moss green, bark brown, cream
- Prompt (after the style block): see the Sands S13, S15, S17 prompts and swap in this game's style block

#### TRELLIS for Hollowbough

| Item | Source image for TRELLIS | GLB target and budget | Use | Value |
|---|---|---|---|---|
| Worker pegs and the Ever Tree | H2 paintings; the existing ever_tree card art | models/worker.glb 30 KB; models/ever-tree.glb 250 KB | Pre-rendered sprites; hero turntable at the end of the game. | Low. |
| Everything else | n/a | n/a | Cards are the art; the board is a painted DOM table. 3D adds little. | None. |


## The Thornbound Throne (`games/thornbound/`)

**Medium priority.** The map and cards are painted; chips, strength discs and sheets are plain CSS. Tech: DOM/SVG over a painted map.

- Already painted: 51 kingdom cards, 4 basic cards, map (+phone), throne, track, 10 portraits, 4 backs, tables, title, end art.
- Keep in code: Faction tokens and the strength numbers (readability/rules).
- Screenshots: `games-src/facelift-shots/thornbound-board.jpg` (Map), `games-src/facelift-shots/thornbound-panel.jpg` (Faction sheet), `games-src/facelift-shots/thornbound-desktop.jpg` (Desktop)

Style block (paste in front of every prompt): > Dark-fairytale court painting in deep green, crimson and tarnished gold, candlelit, painterly brushwork, rich shadows, no text, no lettering, no frame.

### B1. Region plates for strength numbers
- Where: On each region: the green/red/orange discs showing 5, ?, 10
- Now: Flat CSS circles with white numbers.
- Target: `games/thornbound/media/token-strength-{green,red,orange}.webp`: 3 files, 128x128 transparent, empty centre (numbers stay code)
- Prompt (after the style block): a round enamelled wax seal plate in {deep green / crimson / amber} with a tarnished-gold rim, centre empty, single object, centred, plain flat white background, no shadow, no text

### B2. Faction emblems and resource icons
- Where: Player chips, info sheet (Influence, Lore, Supporters, Pledges)
- Now: Circle glyphs and text.
- Target: `games/thornbound/media/emblem-{heath,gilded,lantern,choir}.webp, icon-{influence,lore,supporter,pledge}.webp`: 8 files, 96x96 transparent
- Prompt (after the style block): a small heraldic {antlered / golden-crowned / lantern / moth-wing} badge in tarnished gold on dark green, single object, centred, plain flat white background, no shadow, no text

### B3. Information sheet
- Where: Faction and decision sheet (long cream page with red link underlines)
- Now: Plain cream CSS page.
- Target: `games/thornbound/media/ui-sheet.webp, ui-sheet-head.webp`: 9-slice 512x512 aged vellum with a dark vignette edge; head 1024x96
- Prompt (after the style block): an aged vellum sheet with a darker burnt edge and a thin crimson border line, centre plain, single object, centred, plain flat white background, no shadow, no text

### B4. Round banner and coach banner
- Where: Red 'Round 1' shield on the map; the amber help banner
- Now: CSS shield and box.
- Target: `games/thornbound/media/ui-round-shield.webp, ui-bubble.webp`: shield 192x224 transparent; bubble 9-slice
- Prompt (after the style block): a crimson heraldic pennant shield with gold trim, centre empty, single object, centred, plain flat white background, no shadow, no text

### B5. Buttons and top bar
- Where: Learn / Story / Play / Online, icon bar
- Now: Gold/black CSS pills.
- Target: `games/thornbound/media/ui-button-*.webp, ui-topbar.webp, icon set`: kit recipe; palette: deep green, crimson, tarnished gold
- Prompt (after the style block): see the Sands S13, S15, S17 prompts and swap in this game's style block

#### TRELLIS for The Thornbound Throne

| Item | Source image for TRELLIS | GLB target and budget | Use | Value |
|---|---|---|---|---|
| Crown (coronation moment) | NEW Flow image: a tarnished-gold crown with thorns, 3/4 view | models/crown.glb 120 KB | Pre-rendered turntable on the winner banner. | Medium. |
| Throne | The existing painted media/throne.webp | models/throne.glb 250 KB | Optional hero turntable on the title. | Low. |
| Map | n/a | n/a | The painted map is the board; no 3D. | None. |


## Kaiten Kitchen (`games/kaiten-kitchen/`)

**Medium priority.** The belt, stage and plates are painted; the cloches and chrome are not. Tech: Pixi + DOM, painted stage/belt.

- Already painted: 14 plate characters, belt, stage, 6 diners, 3 backs, tables, title, end art.
- Keep in code: Card values and set counters.
- Screenshots: `games-src/facelift-shots/kaiten-kitchen-belt.jpg` (Round start), `games-src/facelift-shots/kaiten-kitchen-reveal.jpg` (Reveal), `games-src/facelift-shots/kaiten-kitchen-desktop.jpg` (Desktop)

Style block (paste in front of every prompt): > Hand-painted gouache illustration for a cosy card game, top-down view of a single round ceramic plate, the food on the plate is a cute character with an expressive face, warm-brown ink outline with a slightly wobbly brush edge, soft rim light, matte paper texture, simple readable silhouette, centred, plenty of margin, plain transparent background, no text

### K1. Cloches  [3D candidate]
- Where: The 3 domes over everyone's pick at the start of each round
- Now: Grey gradient CSS/SVG domes.
- Target: `games/kaiten-kitchen/media/cloche.webp, cloche-open.webp`: 2 files, 384x384 transparent brass cloche closed and lifted
- Prompt (after the style block): a small brass serving cloche dome with a round knob handle, 3/4 side view, warm highlight, single object, centred, plain flat white background, no shadow, no text

### K2. Diner name tags
- Where: Under each cloche/card (Mina / Odile / Kofi)
- Now: Coloured CSS pills.
- Target: `games/kaiten-kitchen/media/ui-nametag-{red,gold,purple}.webp`: 3 files, 9-slice 192x56
- Prompt (after the style block): a blank paper chopstick-sleeve label, {red / gold / purple}, single object, centred, plain flat white background, no shadow, no text

### K3. Counter-score icons
- Where: Diners sheet (plates, custard cups, fire paste multipliers)
- Now: Text and small emoji.
- Target: `games/kaiten-kitchen/media/icon-{plate,cup,paste,star}.webp`: 4 files, 96x96 transparent
- Prompt (after the style block): a tiny round white plate / a custard cup / a green paste mound / a gold star, single object, centred, plain flat white background, no shadow, no text

### K4. Panels, buttons
- Where: Diners sheet, start menu, reveal banner
- Now: Cream CSS.
- Target: `games/kaiten-kitchen/media/ui-panel.webp, ui-button-*.webp, ui-topbar.webp`: kit recipe; palette: lantern red, wood, cream
- Prompt (after the style block): see the Sands S13, S15, S17 prompts and swap in this game's style block

#### TRELLIS for Kaiten Kitchen

| Item | Source image for TRELLIS | GLB target and budget | Use | Value |
|---|---|---|---|---|
| Cloche + plate | K1 painting; ART-PROMPTS-3D kk-cloche / kk-plate | models/cloche.glb 80 KB; models/plate.glb 60 KB | Pre-render a 12-frame cloche-lift strip for the reveal beat. | Medium. |
| Food characters | n/a | n/a | The characters are faces: keep painted 2D. | None. |


## Lantern Dive (`games/lantern-dive/`)

**Medium priority.** Cards are code-drawn around painted emblems; the phone table is a flat blue box. Tech: Pixi + DOM.

- Already painted: Suit emblems, card back, ping/flare/commander tokens, divers, drone, table, title, 11 portraits, 2 backs, end art.
- Keep in code: Card numbers, trump marker, trick count.
- Screenshots: `games-src/facelift-shots/lantern-dive-table.jpg` (Phone table), `games-src/facelift-shots/lantern-dive-menu.jpg` (Menu), `games-src/facelift-shots/lantern-dive-desktop.jpg` (Desktop)

Style block (paste in front of every prompt): > Hand-painted gouache illustration for a calm co-operative deep-sea card game, deep blue and teal water, a small warm golden lantern glow as the only strong warm light, soft rim light, visible gentle brush texture on matte paper, slightly wobbly dark navy ink outline, simple readable silhouette that still works at 40 pixels, rich but not neon colours, centred, plenty of margin, no text

### L1. Card faces
- Where: Hand, trick area, last trick
- Now: CSS cream card with corner numbers and a small emblem in the teal middle.
- Target: `games/lantern-dive/media/card-face-{coral,tide,kelp,sunstar,lantern}.webp`: 5 frames, 320x448 transparent (corner numbers and the emblem stay layers)
- Prompt (after the style block): a blank playing card face in cream paper with a thin {pink-red / blue / green / yellow / brass} border and tiny bubbles in the corners, middle empty, single object, centred, plain flat white background, no shadow, no text

### L2. Trick pad and phone table
- Where: Phone: the large rounded dark-blue rectangle
- Now: Plain blue gradient rounded box.
- Target: `games/lantern-dive/media/ui-trick-pad.webp, table-tunnel-glow-phone.webp`: pad 9-slice 512x512 transparent; phone table 768x1376 opaque
- Prompt (after the style block): a vertical deep-sea cave view in dark blue with faint light shafts, calm empty centre, no text

### L3. Seat chips and air/tank/boss HP icons
- Where: Divers around the table; boss HP bar, air tank
- Now: CSS chips with line icons.
- Target: `games/lantern-dive/media/ui-seat.webp, icon-{air,tank-full,tank-empty,heart,tick,cross}.webp`: chip 9-slice 192x72; 6 icons 96x96
- Prompt (after the style block): a small brass diving-helmet badge / a blue air tank, full and empty, single object, centred, plain flat white background, no shadow, no text

### L4. Buttons and panels
- Where: The Descent / Story / Free play buttons, job sheet
- Now: Blue and gold CSS pills.
- Target: `games/lantern-dive/media/ui-button-*.webp, ui-panel.webp, ui-topbar.webp`: kit recipe; palette: navy, teal, lantern gold
- Prompt (after the style block): see the Sands S13, S15, S17 prompts and swap in this game's style block

#### TRELLIS for Lantern Dive

| Item | Source image for TRELLIS | GLB target and budget | Use | Value |
|---|---|---|---|---|
| Brass lantern | NEW Flow image: brass diving lantern, 3/4 view | models/lantern.glb 100 KB | Pre-rendered glowing sprite for the Commander/trump moments. | Low. |
| Everything else | n/a | n/a | Card game on a painted 2D table; 3D adds nothing. | None. |


## Cauldron Fair (`games/cauldron-fair/`)

**Medium priority.** Painted cauldron, chips and stage; the stall boards and buttons are CSS. Tech: Pixi + DOM, painted stage.

- Already painted: Cauldron, 8 chips, bags, makers, stage, 25 fortune cards, pass screen, tables, title, end art.
- Keep in code: Chip numbers, price numbers (5/10/19), score counters.
- Screenshots: `games-src/facelift-shots/cauldron-fair-board.jpg` (Cauldron), `games-src/facelift-shots/cauldron-fair-market.jpg` (Market), `games-src/facelift-shots/cauldron-fair-desktop.jpg` (Desktop title)

Style block (paste in front of every prompt): > Hand-painted gouache illustration for a cosy fantasy-fair board game, warm brown ink outline with a slightly wobbly brush edge, soft rim light, matte paper texture, rich but warm colours, simple readable silhouette that still works at 60 px wide, centred, plenty of margin, no text, no numbers

### CF1. Market stall panels
- Where: The day-start market: 6 stalls (Marrow, Mossback, Wren Feather ...)
- Now: Translucent brown CSS boxes with faint ghost chips on a painted stage.
- Target: `games/cauldron-fair/media/ui-stall.webp, ui-stall-locked.webp`: 2 files, 9-slice 384x256 transparent wood plank board with a carved header strip and three empty round slots
- Prompt (after the style block): a market stall counter board of rough planks with a small cloth header and three round empty dishes, seen from above, single object, centred, plain flat white background, no shadow, no text

### CF2. Awning banner
- Where: Top of the market screen
- Now: Red/white CSS stripe.
- Target: `games/cauldron-fair/media/awning.webp`: 1024x160 repeat-x transparent scalloped red-and-cream awning
- Prompt (after the style block): a scalloped red-and-cream striped awning edge seen from the front, seamless left to right, single object, centred, plain flat white background, no shadow, no text

### CF3. Price slot dishes
- Where: Under each stall (1 / 2 / 4 chips with the 5 / 10 / 19 prices)
- Now: Grey CSS circles.
- Target: `games/cauldron-fair/media/ui-slot.webp`: 96x96 transparent shallow clay dish
- Prompt (after the style block): a shallow round clay dish seen from above, single object, centred, plain flat white background, no shadow, no text

### CF4. Draw and Stop buttons, chip progress bar
- Where: Cauldron round: 'Draw', 'Stop after a chip', 0/7 bar with the boom marker
- Now: Brown/cream CSS buttons.
- Target: `games/cauldron-fair/media/btn-draw.webp, btn-stop.webp, ui-chipbar.webp, icon-boom.webp`: buttons 9-slice 320x120; bar 512x64; icon 96x96
- Prompt (after the style block): a big friendly clay button with a drawstring bag on it / a clay button with a stop hand / a pot with a puff of smoke, single object, centred, plain flat white background, no shadow, no text

### CF5. Panels and kit
- Where: Pass screen, scores, menus
- Now: Cream CSS.
- Target: `games/cauldron-fair/media/ui-panel.webp, ui-button-*.webp, ui-topbar.webp`: kit recipe; palette: fair-lantern orange, plum, cream
- Prompt (after the style block): see the Sands S13, S15, S17 prompts and swap in this game's style block

#### TRELLIS for Cauldron Fair

| Item | Source image for TRELLIS | GLB target and budget | Use | Value |
|---|---|---|---|---|
| Ingredient bag | The existing painted bag-ember / bag-moss | models/bag.glb 100 KB | Pre-render a shake/open strip: the bag draw IS the fun moment. | Medium. |
| Clay ingredient chips (8) | The 8 existing chip-*.png from games-src/cauldron-fair/art | models/chip.glb 20 KB, 8 recolours | Pre-rendered tumbling chip sprites when drawn. | Low-medium. |


## Final Approach (`games/final-approach/`)

**Medium priority.** Most of the cockpit is painted; weather icons, phrase buttons and sheets are plain. Tech: Pixi + DOM.

- Already painted: Cockpit plate, window frame, tray, dial, gauge, dice atlas, plane views, skies/terrain strips, crew, 13 portraits, tables, title, end art.
- Keep in code: Dice faces, instrument needles/ticks, altitude numbers.
- Screenshots: `games-src/facelift-shots/final-approach-cockpit.jpg` (Cockpit), `games-src/facelift-shots/final-approach-menu.jpg` (Menu), `games-src/facelift-shots/final-approach-desktop.jpg` (Desktop)

Style block (paste in front of every prompt): > Hand-painted gouache illustration for a cosy cockpit game, chunky soft shapes with a slightly wobbly dark navy outline, matte paper grain, rich but warm colours (teal panel, warm cream highlights, blue and orange crew colours), gentle rim light, soft drop shadow, crisp and readable at very small sizes, simple silhouettes, no text, no numbers

### FA1. Weather and time icons
- Where: Briefing and altitude strip (snow, rain, fog, clear; dawn, day, dusk, night)
- Now: Plain text ('snow, dawn').
- Target: `games/final-approach/media/icon-wx-{snow,rain,fog,clear}.webp, icon-time-{dawn,day,dusk,night}.webp`: 8 files, 96x96 transparent
- Prompt (after the style block): a tiny {snowflake cloud / rain cloud / fog bank / sun} badge, bold, single object, centred, plain flat white background, no shadow, no text

### FA2. Phrase buttons
- Where: Desktop radio panel ('Move one space', 'Hold position' ...)
- Now: Outline CSS pills.
- Target: `games/final-approach/media/ui-phrase.webp`: 9-slice 256x72 transparent cream push-button
- Prompt (after the style block): a blank cream radio push-button with a thin navy rim, single object, centred, plain flat white background, no shadow, no text

### FA3. Briefing sheet and checklist
- Where: Flight briefing drawer
- Now: White CSS sheet with a coloured goal box.
- Target: `games/final-approach/media/ui-sheet.webp, ui-check.webp`: sheet 9-slice 512x512 clipboard paper; checkbox 64x64
- Prompt (after the style block): a pale clipboard sheet with a metal clip and a faint checklist margin, single object, centred, plain flat white background, no shadow, no text

### FA4. Roll button and altitude strip
- Where: 'Roll my dice' green button, round/altitude strip
- Now: Green CSS button; gauge dots drawn.
- Target: `games/final-approach/media/ui-button-roll.webp, ui-altbar.webp`: 9-slice 320x120; strip 512x64
- Prompt (after the style block): a chunky green cockpit push-button with a die symbol, single object, centred, plain flat white background, no shadow, no text

### FA5. Panels and kit
- Where: Menus, drawers, top bar
- Now: Dark CSS.
- Target: `games/final-approach/media/ui-panel.webp, ui-topbar.webp, icon set`: kit recipe; palette: teal panel, cream, blue/orange
- Prompt (after the style block): see the Sands S13, S15, S17 prompts and swap in this game's style block

#### TRELLIS for Final Approach

| Item | Source image for TRELLIS | GLB target and budget | Use | Value |
|---|---|---|---|---|
| Airliner (banking approach) | The existing painted planeside/planefront (3/4 view needed: paint one new) | models/plane.glb 150-250 KB, <=8k triangles | Pre-render 15 bank angles x 2 (gear up/down); the window shows continuous tilt on the final approach. | Medium. |
| Dice | Existing dice atlas | n/a | Keep the atlas. | None. |


## Mainhattan Nightrun (`games/mainhattan-nightrun/`)

**Low priority.** Already the most painted game; only the menu and HUD chrome are flat. Tech: Canvas 2D shooter (143 painted files).

- Already painted: 5 stage backdrops + layers, 10 bosses, ship kit icons, difficulty emblems, fx sprites, garage and pause paintings, title, end art.
- Keep in code: HUD pips and bars, multiplier numbers, the Test Lab page.
- Screenshots: `games-src/facelift-shots/mainhattan-nightrun-menu.jpg` (Menu), `games-src/facelift-shots/mainhattan-nightrun-game.jpg` (Game), `games-src/facelift-shots/mainhattan-nightrun-desktop.jpg` (Desktop)

Style block (paste in front of every prompt): > Painted neon-noir sci-fi illustration for an arcade skyline shooter, magenta and cyan glow against deep indigo night city, clean readable shapes, no text
(Derived from the existing sprite set. The game belongs to the orchestrator: list only, do not edit from this list.)

### NR1. Menu button plates
- Where: Title: STORY / ENDLESS / NORMAL / DAILY RUN / GARAGE / SETTINGS / WEAPONS
- Now: Flat parallelogram CSS buttons (pink, cyan, purple).
- Target: `games/mainhattan-nightrun/media/ui-btn-{pink,cyan,violet}.webp`: 3 files, 9-slice 256x96 transparent
- Prompt (after the style block): a blank angular sci-fi button plate with a glowing {magenta / cyan / violet} edge, single object, centred, plain flat white background, no shadow, no text

### NR2. HUD housing
- Where: Top-left bars (hull, heat, dash, emp) and the x1 multiplier plate
- Now: Thin CSS bars and text.
- Target: `games/mainhattan-nightrun/media/ui-hud-bars.webp, ui-hud-mult.webp`: 2 files, 9-slice 512x96 / 192x64 (keep the pips in code)
- Prompt (after the style block): a slim dark sci-fi gauge housing with a neon trim, channel empty, single object, centred, plain flat white background, no shadow, no text

### NR3. Touch buttons
- Where: Pause, DASH, EMP on phone
- Now: Plain outlined circles.
- Target: `games/mainhattan-nightrun/media/ui-touch-{pause,dash,emp}.webp`: 3 files, 128x128 transparent
- Prompt (after the style block): a round glowing neon push-button with a {pause / double-chevron dash / pulse-ring} symbol, single object, centred, plain flat white background, no shadow, no text

#### TRELLIS for Mainhattan Nightrun

| Item | Source image for TRELLIS | GLB target and budget | Use | Value |
|---|---|---|---|---|
| None recommended | n/a | n/a | A 2D shooter with 143 painted sprites; 3D would change the look. Skip. | None. |

