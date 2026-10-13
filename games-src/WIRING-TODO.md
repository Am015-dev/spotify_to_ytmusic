# Wiring to-do: painted files pushed but not used by the live game (13 Oct 2026)

Generated from games/asset-viewer/flow.json (stage "pushed" = in games/<game>/media/ but the live page never loads it). Re-check a game by grepping its built index.html for `media/<name>.webp`. See games-src/FACELIFT.md for where each element goes.

| Game | 2D paintings to wire | 3D models to wire |
|---|---:|---:|
| crown-city-smash | 198 | 11 |
| sands-of-qamar | 102 | 5 |
| rampart-and-vine | 38 | 4 |
| shipwreck-isle | 37 | 11 |
| doorkick-dungeon | 33 | 6 |
| nebula-aces | 32 | 5 |
| final-approach | 29 | 0 |
| thornbound | 28 | 2 |
| lantern-dive | 28 | 0 |
| kaiten-kitchen | 23 | 2 |
| sunglaze | 23 | 2 |
| short-fuse | 22 | 2 |
| mainhattan-nightrun | 0 | 0 |
| cauldron-fair | 22 | 2 |
| tidewake | 22 | 2 |
| hollowbough | 19 | 2 |
| **Total** | **656** | **56** |

## crown-city-smash

Wired 13 Oct: all 182 `pc-*` card paintings (shop pop-up, board shop tiles, flying card, owned-card rows; lazy-loaded, listed in media.json "cards"), `icon-heart/energy/star` (flying pick-ups), `table-harbor-night/spire-gold` (loaded by name in paint.js, campaign unlock). 3D tower/fountain/Dot/Clampede models are live.

Still not loaded by the page (13 files; each needs a design decision, not just a hook):

| File | Why left |
|---|---|
| `icon-crown` | no crown glyph slot yet (Downtown 👑 is text in the chip name) |
| `ui-hud-chip` | chip text is read by the sweep; needs a 9-slice behind the existing chip |
| `ui-dice-tray` | dock tray is the shared kit panel; needs a 9-slice rule |
| `ui-button-ghost/pink/yellow` | no button variant uses them (cream/go/power cover all current buttons) |
| `ui-bubble-tail` | coach bubble uses ui-bubble without a tail |
| `back-brass-beetle`, `back-bulletin` | no face-down card is shown anywhere |
| `token-{energy,heart,star}.glb` (+ `*-lite.glb`, `@512`) | 3D pick-ups not hooked into the fx fly |
| 3 evolution paintings (`evo*`) | evolutions render as text rows |

## sands-of-qamar

3D: camel, lamp, meeple, palace, palm

| Wave / kind | File (media/…webp) | What it is |
|---|---|---|
| Wave 0 main set | `ui-act-banner` | a blank horizontal cloth banner in lapis blue with copper fringe at both ends, centre empty, single object, ce |
| Wave 0 main set | `ui-bubble` | a blank speech-bubble panel made of cream paper with a copper outline and a tiny curl at one corner, single ob |
| Wave 0 main set | `ui-bubble-tail` | a small pointed speech-bubble tail made of cream paper with a copper outline, single object, centred, plain fl |
| Wave 0 main set | `ui-button-cream` | a blank rounded button plate, cream enamel with a copper rim, soft top highlight, centre empty, single object, |
| Wave 0 main set | `ui-button-go` | a blank rounded button plate, terracotta-orange enamel with a dark copper rim, soft top highlight, centre empt |
| Wave 0 main set | `ui-button-power` | a blank rounded button plate, violet enamel with a gold rim, soft top highlight, centre empty, single object,  |
| Wave 0 main set | `ui-panel` | an aged parchment panel with gilt filigree in the four corners and a thin copper border, the whole centre plai |
| Wave 0 main set | `ui-row` | a blank wide parchment strip with a thin copper edge and a small lapis diamond at the left end, centre empty,  |
| Wave 0 redo | `ui-button-cream` | a blank wide horizontal pill-shaped button plate about three times wider than tall, cream enamel with a copper |
| Wave 0 redo | `ui-button-go` | a blank wide horizontal pill-shaped button plate about three times wider than tall, terracotta-orange enamel w |
| Wave 0 redo | `ui-button-power` | a blank wide horizontal pill-shaped button plate about three times wider than tall, violet enamel with a gold  |
| Wave 1 Wave 1 | `glyph-city` | a round brass medallion with an embossed tall minaret in the middle, lapis-blue enamel background, one bold sh |
| Wave 1 Wave 1 | `glyph-exchange` | a round brass medallion with an embossed balance scale with a spice bowl in the middle, lapis-blue enamel back |
| Wave 1 Wave 1 | `glyph-lake` | a round brass medallion with an embossed single rolling wave in the middle, lapis-blue enamel background, one  |
| Wave 1 Wave 1 | `glyph-large` | a round brass medallion with an embossed pair of market-stall awnings in the middle, lapis-blue enamel backgro |
| Wave 1 Wave 1 | `glyph-oasis` | a round brass medallion with an embossed palm tree beside a small pool in the middle, lapis-blue enamel backgr |
| Wave 1 Wave 1 | `glyph-sacred` | a round brass medallion with an embossed domed shrine in the middle, lapis-blue enamel background, one bold sh |
| Wave 1 Wave 1 | `glyph-small` | a round brass medallion with an embossed market-stall awning in the middle, lapis-blue enamel background, one  |
| Wave 1 Wave 1 | `glyph-village` | a round brass medallion with an embossed small flat-roofed house in the middle, lapis-blue enamel background,  |
| Wave 1 Wave 1 | `glyph-workshop` | a round brass medallion with an embossed blacksmith anvil in the middle, lapis-blue enamel background, one bol |
| Wave 1 Wave 1 | `good-fakir` | a glowing violet crystal ball on a small brass stand, a tiny star inside, three-quarter view, single object, c |
| Wave 1 Wave 1 | `good-fish` | one plump silver fish with a blue back, simple friendly shape, three-quarter view, single object, centred, pla |
| Wave 1 Wave 1 | `good-gold` | a stack of two gold ingots with a stamped crescent, warm shine, three-quarter view, single object, centred, pl |
| Wave 1 Wave 1 | `good-ivory` | a single curved elephant tusk, polished cream ivory with a brass cap, three-quarter view, single object, centr |
| Wave 1 Wave 1 | `good-jewels` | a small heap of three faceted gemstones, ruby, sapphire and emerald, glinting, three-quarter view, single obje |
| Wave 1 Wave 1 | `good-papyrus` | a rolled papyrus scroll tied with a red cord, one end unrolled, three-quarter view, single object, centred, pl |
| Wave 1 Wave 1 | `good-pottery` | a round-bellied terracotta jug with a lapis-blue painted band and two handles, three-quarter view, single obje |
| Wave 1 Wave 1 | `good-silk` | a folded bolt of red silk cloth with a ruffled corner, gold thread edge, three-quarter view, single object, ce |
| Wave 1 Wave 1 | `good-spice` | a small copper bowl heaped with orange-red spice powder and two dried chillies, three-quarter view, single obj |
| Wave 1 Wave 1 | `good-wheat` | a tied sheaf of golden wheat ears, three-quarter view, single object, centred, plain flat white background, no |
| Wave 1 Wave 1 | `icon-basket` | a small hand-painted icon of a woven basket with a lid, bold, readable at 24 px, single object, centred, plain |
| Wave 1 Wave 1 | `icon-camel` | a small hand-painted icon of a standing camel silhouette, bold, readable at 24 px, single object, centred, pla |
| Wave 1 Wave 1 | `icon-coin` | a small hand-painted icon of a gold coin with a crescent, bold, readable at 24 px, single object, centred, pla |
| Wave 1 Wave 1 | `icon-star` | a small hand-painted icon of a gold five-point star, bold, readable at 24 px, single object, centred, plain fl |
| Wave 1 Wave 1 | `item-carpet` | a small rolled flying carpet with tassels and a swirl of wind, single object, centred, plain flat white backgr |
| Wave 1 Wave 1 | `item-flute` | a reed pipe with a tassel, single object, centred, plain flat white background, no shadow, no text |
| Wave 1 Wave 1 | `item-gem5` | a chunky silver bangle set with small turquoise stones, single object, centred, plain flat white background, n |
| Wave 1 Wave 1 | `item-gem7` | a small carved jade casket with a gold clasp, single object, centred, plain flat white background, no shadow,  |
| Wave 1 Wave 1 | `item-gem9` | a gold diadem shaped like sun rays with a red jewel, single object, centred, plain flat white background, no s |
| Wave 1 Wave 1 | `item-horn` | a curved ram horn overflowing with fruit and coins, single object, centred, plain flat white background, no sh |
| Wave 1 Wave 1 | `item-lamp` | a polished brass oil lamp, single object, centred, plain flat white background, no shadow, no text |
| Wave 1 Wave 1 | `item-scimitar` | a curved scimitar with glowing orange ember patterns, single object, centred, plain flat white background, no  |
| Wave 1 Wave 1 | `item-talisman` | a round copper charm with a storm cloud and a lightning bolt, single object, centred, plain flat white backgro |
| Wave 1 Wave 1 | `thief-artisan` | a hooded cutpurse bust in a violet purple scarf with a tiny curved knife, single object, centred, plain flat w |
| Wave 1 Wave 1 | `thief-assassin` | a hooded cutpurse bust in a brick red scarf with a tiny curved knife, single object, centred, plain flat white |
| Wave 1 Wave 1 | `thief-builder` | a hooded cutpurse bust in a cobalt blue scarf with a tiny curved knife, single object, centred, plain flat whi |
| Wave 1 Wave 1 | `thief-elder` | a hooded cutpurse bust in a cream white scarf with a tiny curved knife, single object, centred, plain flat whi |
| Wave 1 Wave 1 | `thief-merchant` | a hooded cutpurse bust in a leaf green scarf with a tiny curved knife, single object, centred, plain flat whit |
| Wave 1 Wave 1 | `thief-vizier` | a hooded cutpurse bust in a golden yellow scarf with a tiny curved knife, single object, centred, plain flat w |
| Wave 1 Wave 1 | `token-camel-0` | a round clay game token seen from above with a thick charcoal black rim and a cream centre stamped with a stan |
| Wave 1 Wave 1 | `token-camel-1` | a round clay game token seen from above with a thick teal rim and a cream centre stamped with a standing camel |
| Wave 1 Wave 1 | `token-camel-2` | a round clay game token seen from above with a thick rose pink rim and a cream centre stamped with a standing  |
| Wave 1 Wave 1 | `token-camel-3` | a round clay game token seen from above with a thick cedar brown rim and a cream centre stamped with a standin |
| Wave 1 Wave 1 | `token-camel-4` | a round clay game token seen from above with a thick slate grey rim and a cream centre stamped with a standing |
| Wave 1 Wave 1 | `token-palace` | a small sandstone palace with one gold onion dome and two slim towers, slightly top-down view, single object,  |
| Wave 1 Wave 1 | `token-palm` | a small round-topped date palm with five curved fronds and two dates, slightly top-down view, single object, c |
| Wave 1 Wave 1 | `token-tent-0` | a round clay game token seen from above with a thick charcoal black rim and a cream centre stamped with a smal |
| Wave 1 Wave 1 | `token-tent-1` | a round clay game token seen from above with a thick teal rim and a cream centre stamped with a small striped  |
| Wave 1 Wave 1 | `token-tent-2` | a round clay game token seen from above with a thick rose pink rim and a cream centre stamped with a small str |
| Wave 1 Wave 1 | `token-tent-3` | a round clay game token seen from above with a thick cedar brown rim and a cream centre stamped with a small s |
| Wave 1 Wave 1 | `token-tent-4` | a round clay game token seen from above with a thick slate grey rim and a cream centre stamped with a small st |
| Wave 1 Wave 1 | `ui-badge-cream` | a blank round cream enamel seal coin with a raised copper rim and a tiny sunburst, no marking, single object,  |
| Wave 1 Wave 1 | `ui-badge-gold` | a blank round gold seal coin with a raised rim and a tiny sunburst, no marking, single object, centred, plain  |
| Wave 1 Wave 1 | `ui-finger` | a painted pointing hand, index finger out, cuff with a copper bracelet, single object, centred, plain flat whi |
| Wave 1 Wave 1 | `ui-goods-card` | a blank small playing-card shape in cream paper with a thin gilded edge and tiny corner flourishes, centre emp |
| Wave 1 Wave 1 | `ui-nameplate` | a blank cream paper label with torn edges and a thin brown outline, flat, single object, centred, plain flat w |
| Wave 1 Wave 1 | `ui-seat-chip` | a blank cream scoreboard plaque with a thin brown wooden border and a small rope loop on each side, centre emp |
| Wave 1 Wave 1 | `ui-spot` | a blank tall wooden peg-board slot with a small coin dish at the bottom, greyscale, soft carved edges, single  |
| Wave 1 Wave 1 | `ui-tile-frame-blue` | a square ornamental picture-frame border, glazed lapis-blue ceramic with tiny gold studs in the corners, thin, |
| Wave 1 Wave 1 | `ui-tile-frame-red` | a square ornamental picture-frame border, glazed terracotta-red ceramic with tiny gold studs in the corners, t |
| Wave 1 Wave 1 | `ui-trophy` | a small copper trophy cup with a lapis band and two handles, single object, centred, plain flat white backgrou |
| Wave 1 Wave 1 (16:9) | `fx-sparkle` | a small burst of gold sparkles with four-point stars shown in 8 stages in one row from a tiny glint to fading, |
| Wave 1 Wave 1 (16:9) | `ui-djinn-bar` | a long narrow banner plaque in deep violet lacquer with a thin hammered-gold border and small gold stars at bo |
| Wave 1 Wave 1 (16:9) | `ui-ribbon` | a blank curling ribbon banner in terracotta with gold edges, centre empty, single object, centred, plain flat  |
| Wave 1 Wave 1 djinns (4:3) | `djinn-amir` | a splendid djinn emir with a feathered turban and a heavy gold chain, waist-up, body ending in a curl of colou |
| Wave 1 Wave 1 djinns (4:3) | `djinn-burhan` | a regal djinn taking a giant stride across a tiled floor, carrying a small palace on one palm, waist-up, body  |
| Wave 1 Wave 1 djinns (4:3) | `djinn-dalil` | a friendly djinn guide holding up a lantern and a little glowing compass orb, a blank tag dangling from his be |
| Wave 1 Wave 1 djinns (4:3) | `djinn-dukkan` | a sly djinn shopkeeper behind a stall counter hung with goods, waist-up, body ending in a curl of coloured smo |
| Wave 1 Wave 1 djinns (4:3) | `djinn-fath` | a stern djinn herder with a rope, a camel standing behind him on a crowd of tiny figures, waist-up, body endin |
| Wave 1 Wave 1 djinns (4:3) | `djinn-ghulam` | a sneaky dark-smoke djinn boy with two curved daggers and a wide grin, waist-up, body ending in a curl of colo |
| Wave 1 Wave 1 djinns (4:3) | `djinn-hafiz` | a calm protector djinn standing behind a shield shaped like a big lock, waist-up, body ending in a curl of col |
| Wave 1 Wave 1 djinns (4:3) | `djinn-harith` | a jolly round djinn with a fat purse, coins clinking out of it every time he laughs, waist-up, body ending in  |
| Wave 1 Wave 1 djinns (4:3) | `djinn-hikma` | an elderly bearded djinn sage reading an open ancient book, glowing eyes, waist-up, body ending in a curl of c |
| Wave 1 Wave 1 djinns (4:3) | `djinn-jamal` | a handsome djinn riding a camel made of smoke, waist-up, body ending in a curl of coloured smoke, expressive f |
| Wave 1 Wave 1 djinns (4:3) | `djinn-jawhar` | a djinn jeweller with a loupe, holding a glowing jewel up to the light, waist-up, body ending in a curl of col |
| Wave 1 Wave 1 djinns (4:3) | `djinn-khanjar` | a djinn with a curved dagger, a gold coin balanced on the flat of the blade, waist-up, body ending in a curl o |
| Wave 1 Wave 1 djinns (4:3) | `djinn-majlis` | three little smoke djinns sitting around a low table with a glowing lamp, waist-up, body ending in a curl of c |
| Wave 1 Wave 1 djinns (4:3) | `djinn-nakhla` | a tall djinn with palm fronds for hair and clusters of dates in both hands, waist-up, body ending in a curl of |
| Wave 1 Wave 1 djinns (4:3) | `djinn-nuraya` | a graceful djinn lifting a small glowing domed palace out of a swirl of sand, waist-up, body ending in a curl  |
| Wave 1 Wave 1 djinns (4:3) | `djinn-qasra` | a proud djinn architect holding a rolled plan and a tiny glowing palace, waist-up, body ending in a curl of co |
| Wave 1 Wave 1 djinns (4:3) | `djinn-qirsh` | a burly djinn mason with a trowel and a hammer, two tall stacks of gold coins beside him, waist-up, body endin |
| Wave 1 Wave 1 djinns (4:3) | `djinn-rawda` | a playful djinn gardener with a watering can, a palm sprouting beside her, waist-up, body ending in a curl of  |
| Wave 1 Wave 1 djinns (4:3) | `djinn-ruya` | a dreamy djinn gazing into a crystal ball that shows three tiny lamps, waist-up, body ending in a curl of colo |
| Wave 1 Wave 1 djinns (4:3) | `djinn-sadim` | a stoic guardian djinn with a shield of woven smoke standing in front of two small figures, waist-up, body end |
| Wave 1 Wave 1 djinns (4:3) | `djinn-sana` | a djinn craftsman with a chisel and a half-carved brass lamp, waist-up, body ending in a curl of coloured smok |
| Wave 1 Wave 1 djinns (4:3) | `djinn-sirra` | a veiled djinn in a star-patterned robe whispering a secret, one bright eye visible, waist-up, body ending in  |
| Wave 1 Wave 1 djinns (4:3) | `djinn-suqra` | a cheerful djinn dealer fanning out a handful of blank goods cards like a magician, waist-up, body ending in a |
| Wave 1 Wave 1 djinns (4:3) | `djinn-tamuz` | a grinning djinn pulling three small wooden figures out of a bottomless velvet bag, waist-up, body ending in a |
| Wave 1 Wave 1 djinns (4:3) | `djinn-tariq` | a swift djinn runner with a coin pouch, a trail of tiny gold coins behind his footsteps, waist-up, body ending |
| Wave 1 Wave 1 djinns (4:3) | `djinn-wahha` | a gentle green-smoke djinn planting a palm sapling that sprouts as she waves her hand, waist-up, body ending i |
| Wave 1 Wave 1 djinns (4:3) | `djinn-wazira` | a dignified djinn vizier in a tall turban with a golden quill and three small scrolls, waist-up, body ending i |
| Wave 1 Wave 1 djinns (4:3) | `djinn-zarifa` | a serene pale-blue smoke djinn woman holding two glowing orbs that melt into one, waist-up, body ending in a c |

## rampart-and-vine

WIRED and live 13 Oct 2026 (all 2D files: per-colour pieces, icons, score pill, tray, rotate button, ribbon, trophy, Wave 4 kit). 3D models: other worker.

## shipwreck-isle

3D: sw-carpenter, sw-cook, sw-explorer, sw-fire, sw-friday, sw-palisade, sw-palm-a, sw-palm-b, sw-palm-c, sw-raft, sw-shelter

| Wave / kind | File (media/…webp) | What it is |
|---|---|---|
| Wave 3 Wave 3 | `hex-beach` | a top-down hexagon-shaped tile of white-sand beach with shells and a surf edge, hand-painted, soft light, no t |
| Wave 3 Wave 3 | `hex-fog-a` | a top-down hexagon-shaped tile of thick dark volcanic mist, soft rim, centre calm, seamless, no text |
| Wave 3 Wave 3 | `hex-fog-b` | a top-down hexagon-shaped tile of swirling slate-grey cloud, soft rim, centre calm, seamless, no text |
| Wave 3 Wave 3 | `hex-fog-c` | a top-down hexagon-shaped tile of drifting grey sea fog with thin wisps, soft rim, centre calm, seamless, no t |
| Wave 3 Wave 3 | `hex-hills` | a top-down hexagon-shaped tile of rolling green hills with scrub, hand-painted, soft light, no text |
| Wave 3 Wave 3 | `hex-mountains` | a top-down hexagon-shaped tile of grey rocky mountain peaks, hand-painted, soft light, no text |
| Wave 3 Wave 3 | `hex-plains` | a top-down hexagon-shaped tile of open grassy plains with wildflowers, hand-painted, soft light, no text |
| Wave 3 Wave 3 | `hex-river` | a top-down hexagon-shaped tile of a winding river between green banks, hand-painted, soft light, no text |
| Wave 3 Wave 3 | `icon-act-build` | a small hand-painted icon of a hammer resting on a plank in a wood-and-rope style, bold, readable at 28 px, si |
| Wave 3 Wave 3 | `icon-act-camp` | a small hand-painted icon of a tidy camp bedroll beside a lantern in a wood-and-rope style, bold, readable at  |
| Wave 3 Wave 3 | `icon-act-explore` | a small hand-painted icon of a rolled map with a spyglass in a wood-and-rope style, bold, readable at 28 px, s |
| Wave 3 Wave 3 | `icon-act-gather` | a small hand-painted icon of a woven basket with coconuts and twigs in a wood-and-rope style, bold, readable a |
| Wave 3 Wave 3 | `icon-act-hunt` | a small hand-painted icon of a wooden spear crossed with a bow in a wood-and-rope style, bold, readable at 28  |
| Wave 3 Wave 3 | `icon-act-rest` | a small hand-painted icon of a hammock slung between two palm stumps in a wood-and-rope style, bold, readable  |
| Wave 3 Wave 3 | `icon-act-threat` | a small hand-painted icon of a cracked wooden shield with a beast claw mark in a wood-and-rope style, bold, re |
| Wave 3 Wave 3 | `icon-res-food` | a small hand-painted icon of a coconut and a fish, bold, readable at 24 px, single object, centred, plain flat |
| Wave 3 Wave 3 | `icon-res-fur` | a small hand-painted icon of a folded animal pelt, bold, readable at 24 px, single object, centred, plain flat |
| Wave 3 Wave 3 | `icon-res-palisade` | a small hand-painted icon of a short palisade of sharpened stakes, bold, readable at 24 px, single object, cen |
| Wave 3 Wave 3 | `icon-res-pfood` | a small hand-painted icon of strips of dried fish hanging on a string, bold, readable at 24 px, single object, |
| Wave 3 Wave 3 | `icon-res-roof` | a small hand-painted icon of a thatched palm-leaf roof, bold, readable at 24 px, single object, centred, plain |
| Wave 3 Wave 3 | `icon-res-shelter` | a small hand-painted icon of a small lean-to shelter, bold, readable at 24 px, single object, centred, plain f |
| Wave 3 Wave 3 | `icon-res-weapon` | a small hand-painted icon of a stone-tipped spear, bold, readable at 24 px, single object, centred, plain flat |
| Wave 3 Wave 3 | `icon-res-wood` | a small hand-painted icon of a bundle of logs tied with rope, bold, readable at 24 px, single object, centred, |
| Wave 4 Wave 4 kit | `ui-bubble` | a blank speech-bubble panel made of sun-bleached sailcloth with a rope-lashed driftwood outline and a tiny cur |
| Wave 4 Wave 4 kit | `ui-bubble-tail` | a small pointed speech-bubble tail made of sun-bleached sailcloth with a rope-lashed driftwood outline, single |
| Wave 4 Wave 4 kit | `ui-button-cream` | a blank wide horizontal pill-shaped button plate about three times wider than tall, sand-cream with a rope-las |
| Wave 4 Wave 4 kit | `ui-button-go` | a blank wide horizontal pill-shaped button plate about three times wider than tall, coral-orange with a rope-l |
| Wave 4 Wave 4 kit | `ui-button-power` | a blank wide horizontal pill-shaped button plate about three times wider than tall, jungle-green with a rope-l |
| Wave 4 Wave 4 kit | `ui-drawer-head` | a strip of weathered driftwood planks with a rope-lashed driftwood edge line, seamless left to right, empty, n |
| Wave 4 Wave 4 kit | `ui-iconbtn` | a blank round rope-lashed driftwood button with a turquoise ring, centre empty, single object, centred, plain  |
| Wave 4 Wave 4 kit | `ui-node-boss` | a round rope-lashed driftwood medallion with a turquoise ring, centre blank, larger with a small crown on top, |
| Wave 4 Wave 4 kit | `ui-node-done` | a round rope-lashed driftwood medallion with a turquoise ring, centre blank, with a small laurel at the bottom |
| Wave 4 Wave 4 kit | `ui-node-locked` | a round rope-lashed driftwood medallion with a turquoise ring, centre blank, dull and darkened with a small pa |
| Wave 4 Wave 4 kit | `ui-node-open` | a round rope-lashed driftwood medallion with a turquoise ring, centre blank, bright and polished, single objec |
| Wave 4 Wave 4 kit | `ui-panel` | a sun-bleached sailcloth panel with ornate rope-lashed driftwood corners and a thin rope-lashed driftwood bord |
| Wave 4 Wave 4 kit | `ui-row` | a blank wide strip of sun-bleached sailcloth with a thin rope-lashed driftwood edge and a small turquoise diam |
| Wave 4 Wave 4 kit | `ui-topbar` | a long strip of weathered driftwood planks, seamless left to right, empty, no text |

## doorkick-dungeon

3D: die, door, hero-grub, hero-morwen, hero-pip, hero-tansy

| Wave / kind | File (media/…webp) | What it is |
|---|---|---|
| Wave 3 Wave 3 | `icon-gear` | a small hand-painted icon of a crossed sword and shield, bold, readable at 24 px, single object, centred, plai |
| Wave 3 Wave 3 | `icon-hand` | a small hand-painted icon of a fan of three blank playing cards, bold, readable at 24 px, single object, centr |
| Wave 3 Wave 3 | `icon-level` | a small hand-painted icon of a gold level gem, bold, readable at 24 px, single object, centred, plain flat whi |
| Wave 3 Wave 3 | `pile-door` | a short stack of dungeon cards with a heavy wooden door painted on the top card, single object, centred, plain |
| Wave 3 Wave 3 | `pile-treasure` | a short stack of dungeon cards with a treasure chest painted on the top card, single object, centred, plain fl |
| Wave 3 Wave 3 | `token-curse` | a small cracked violet curse token with a swirling smoky hex mark, no letters, single object, centred, plain f |
| Wave 3 Wave 3 | `ui-clash-hero` | a round blue shield medallion, bold, thick ink outline, centre empty, single object, centred, plain flat white |
| Wave 3 Wave 3 | `ui-clash-monster` | a round red skull-crest medallion, bold, thick ink outline, centre empty, single object, centred, plain flat w |
| Wave 3 Wave 3 | `ui-medallion` | an ornate round brass-and-oak medallion frame with a small gem at the bottom for a level badge, centre empty,  |
| Wave 3 Wave 3 | `ui-parchment` | a stained parchment sheet with a burnt edge and a thin gilt line, centre plain, single object, centred, plain  |
| Wave 3 Wave 3 | `ui-rival-chip` | a blank carved-wood name plaque with a brass edge, wider than tall, centre empty, single object, centred, plai |
| Wave 3 Wave 3 | `ui-slot-body` | a small brass-edged oak plaque with a breastplate silhouette stamped in it, single object, centred, plain flat |
| Wave 3 Wave 3 | `ui-slot-class` | a small brass-edged oak plaque with a sword silhouette stamped in it, single object, centred, plain flat white |
| Wave 3 Wave 3 | `ui-slot-feet` | a small brass-edged oak plaque with a boot silhouette stamped in it, single object, centred, plain flat white  |
| Wave 3 Wave 3 | `ui-slot-hands` | a small brass-edged oak plaque with a glove silhouette stamped in it, single object, centred, plain flat white |
| Wave 3 Wave 3 | `ui-slot-head` | a small brass-edged oak plaque with a helmet silhouette stamped in it, single object, centred, plain flat whit |
| Wave 3 Wave 3 | `ui-slot-race` | a small brass-edged oak plaque with a pointed ear silhouette stamped in it, single object, centred, plain flat |
| Wave 3 Wave 3 | `ui-swords` | two crossed swords, bold, thick ink outline, single object, centred, plain flat white background, no shadow, n |
| Wave 3 Wave 3 (16:9) | `ui-ledger-head` | a strip of stained parchment with a burnt edge and a thin gilt line, seamless left to right, empty, no text |
| Wave 4 Wave 4 kit | `ui-bubble` | a blank speech-bubble panel made of aged parchment with a dark iron outline and a tiny curl at one corner, sin |
| Wave 4 Wave 4 kit | `ui-bubble-tail` | a small pointed speech-bubble tail made of aged parchment with a dark iron outline, single object, centred, pl |
| Wave 4 Wave 4 kit | `ui-button-cream` | a blank wide horizontal pill-shaped button plate about three times wider than tall, bone-cream with a dark iro |
| Wave 4 Wave 4 kit | `ui-button-go` | a blank wide horizontal pill-shaped button plate about three times wider than tall, torch-orange with a dark i |
| Wave 4 Wave 4 kit | `ui-button-power` | a blank wide horizontal pill-shaped button plate about three times wider than tall, dungeon-purple with a dark |
| Wave 4 Wave 4 kit | `ui-drawer-head` | a strip of dark oak with iron bands with a dark iron edge line, seamless left to right, empty, no text |
| Wave 4 Wave 4 kit | `ui-iconbtn` | a blank round dark iron button with a torch-orange ring, centre empty, single object, centred, plain flat whit |
| Wave 4 Wave 4 kit | `ui-node-boss` | a round dark iron medallion with a torch-orange ring, centre blank, larger with a small crown on top, single o |
| Wave 4 Wave 4 kit | `ui-node-done` | a round dark iron medallion with a torch-orange ring, centre blank, with a small laurel at the bottom, single  |
| Wave 4 Wave 4 kit | `ui-node-locked` | a round dark iron medallion with a torch-orange ring, centre blank, dull and darkened with a small padlock at  |
| Wave 4 Wave 4 kit | `ui-node-open` | a round dark iron medallion with a torch-orange ring, centre blank, bright and polished, single object, centre |
| Wave 4 Wave 4 kit | `ui-panel` | a aged parchment panel with ornate dark iron corners and a thin dark iron border, the whole centre plain and e |
| Wave 4 Wave 4 kit | `ui-row` | a blank wide strip of aged parchment with a thin dark iron edge and a small torch-orange diamond at the left e |
| Wave 4 Wave 4 kit | `ui-topbar` | a long strip of dark oak with iron bands, seamless left to right, empty, no text |

## nebula-aces

3D: na-lancer, na-rock-a, na-rock-b, na-rock-c, na-talon

| Wave / kind | File (media/…webp) | What it is |
|---|---|---|
| Wave 3 Wave 3 | `icon-evade` | a small glowing swirling arrow badge in brass and indigo, bold, readable at 24 px, single object, centred, pla |
| Wave 3 Wave 3 | `icon-focus` | a small glowing eye badge in brass and indigo, bold, readable at 24 px, single object, centred, plain flat whi |
| Wave 3 Wave 3 | `icon-hull` | a small glowing armour plate badge in brass and indigo, bold, readable at 24 px, single object, centred, plain |
| Wave 3 Wave 3 | `icon-lock` | a small glowing crosshair badge in brass and indigo, bold, readable at 24 px, single object, centred, plain fl |
| Wave 3 Wave 3 | `icon-shield` | a small glowing shield badge in brass and indigo, bold, readable at 24 px, single object, centred, plain flat  |
| Wave 3 Wave 3 | `ui-move-card-green` | a blank rounded flight-plan card, taller than wide, mint-green, with a thin gold border and a small rivet in e |
| Wave 3 Wave 3 | `ui-move-card-red` | a blank rounded flight-plan card, taller than wide, signal-red, with a thin gold border and a small rivet in e |
| Wave 3 Wave 3 | `ui-move-card-white` | a blank rounded flight-plan card, taller than wide, cream, with a thin gold border and a small rivet in each c |
| Wave 3 Wave 3 (16:9) | `ship-anvil` | a assault bomber with a pointed lance nose, swept wing plates, a heavy belly ordnance pod and armoured cheeks, |
| Wave 3 Wave 3 (16:9) | `ship-hauler` | a boxy long-haul freighter with cargo pods along a spine, a forward bridge and a dorsal turret, cream hull wit |
| Wave 3 Wave 3 (16:9) | `ship-herald` | a stubby shuttle on an inverted-gull delta wing with canted ventral fins, dark gunmetal hull with red trim, cl |
| Wave 3 Wave 3 (16:9) | `ship-keel` | a crescent flying-wing strike fighter with a central cockpit pod and wingtip engine pods, cream hull with oran |
| Wave 3 Wave 3 (16:9) | `ship-kestrel` | a flattened lifting-body courier ship with swept tail wings and twin engines, cream hull with orange trim, cle |
| Wave 3 Wave 3 (16:9) | `ship-maul` | a widened arrowhead bomber with armour plates and two finned ordnance pods, dark gunmetal hull with red trim,  |
| Wave 3 Wave 3 (16:9) | `ship-needle` | a slim hexagonal dart interceptor with swept wings and twin engines at the wing roots, cream hull with orange  |
| Wave 3 Wave 3 (16:9) | `ship-razor` | a arrowhead interceptor with long forward-raked razor wings and wingtip cannons, dark gunmetal hull with red t |
| Wave 3 Wave 3 (16:9) | `ship-warden` | a angular armoured wedge gunship with a stepped bridge, weapon pylons and twin drives, dark gunmetal hull with |
| Wave 3 Wave 3 (4:3) | `arena-floor` | a painted star-chart sector seen from above, deep indigo with faint nebula clouds and tiny stars, busier edges |
| Wave 4 Wave 4 kit | `ui-bubble` | a single flat interface element, no spaceships, no vehicles, no scene, no background art: a blank speech-bubbl |
| Wave 4 Wave 4 kit | `ui-bubble-tail` | a single flat interface element, no spaceships, no vehicles, no scene, no background art: a small pointed spee |
| Wave 4 Wave 4 kit | `ui-button-cream` | a blank wide horizontal pill-shaped button plate about three times wider than tall, pale grey enamel with a br |
| Wave 4 Wave 4 kit | `ui-button-go` | a blank wide horizontal pill-shaped button plate about three times wider than tall, signal-orange enamel with  |
| Wave 4 Wave 4 kit | `ui-button-power` | a blank wide horizontal pill-shaped button plate about three times wider than tall, indigo enamel with a brush |
| Wave 4 Wave 4 kit | `ui-drawer-head` | a strip of dark gunmetal panelling with a brushed steel edge line, seamless left to right, empty, no text |
| Wave 4 Wave 4 kit | `ui-iconbtn` | a single flat interface element, no spaceships, no vehicles, no scene, no background art: a blank round brushe |
| Wave 4 Wave 4 kit | `ui-node-boss` | a single flat interface element, no spaceships, no vehicles, no scene, no background art: a round brushed stee |
| Wave 4 Wave 4 kit | `ui-node-done` | a round brushed steel medallion with a cyan ring, centre blank, with a small laurel at the bottom, single obje |
| Wave 4 Wave 4 kit | `ui-node-locked` | a round brushed steel medallion with a cyan ring, centre blank, dull and darkened with a small padlock at the  |
| Wave 4 Wave 4 kit | `ui-node-open` | a round brushed steel medallion with a cyan ring, centre blank, bright and polished, single object, centred, p |
| Wave 4 Wave 4 kit | `ui-panel` | a smoked indigo glass panel with ornate brushed steel corners and a thin brushed steel border, the whole centr |
| Wave 4 Wave 4 kit | `ui-row` | a blank wide strip of smoked indigo glass with a thin brushed steel edge and a small cyan diamond at the left  |
| Wave 4 Wave 4 kit | `ui-topbar` | a long strip of dark gunmetal panelling, seamless left to right, empty, no text |

## final-approach

3D: none

| Wave / kind | File (media/…webp) | What it is |
|---|---|---|
| Wave 3 Wave 3 | `icon-time-dawn` | a tiny sun half-risen over a horizon with a pink sky badge, bold, single object, centred, plain flat white bac |
| Wave 3 Wave 3 | `icon-time-day` | a tiny bright sun high in a blue sky badge, bold, single object, centred, plain flat white background, no shad |
| Wave 3 Wave 3 | `icon-time-dusk` | a tiny orange sun setting over a horizon badge, bold, single object, centred, plain flat white background, no  |
| Wave 3 Wave 3 | `icon-time-night` | a tiny crescent moon with two small stars badge, bold, single object, centred, plain flat white background, no |
| Wave 3 Wave 3 | `icon-wx-clear` | a tiny bright sun badge, bold, single object, centred, plain flat white background, no shadow, no text |
| Wave 3 Wave 3 | `icon-wx-fog` | a tiny fog bank badge, bold, single object, centred, plain flat white background, no shadow, no text |
| Wave 3 Wave 3 | `icon-wx-haze` | a tiny hazy sun behind a pale veil badge, bold, single object, centred, plain flat white background, no shadow |
| Wave 3 Wave 3 | `icon-wx-rain` | a tiny rain cloud badge, bold, single object, centred, plain flat white background, no shadow, no text |
| Wave 3 Wave 3 | `icon-wx-snow` | a tiny snowflake cloud badge, bold, single object, centred, plain flat white background, no shadow, no text |
| Wave 3 Wave 3 | `icon-wx-storm` | a tiny storm cloud with a lightning bolt badge, bold, single object, centred, plain flat white background, no  |
| Wave 3 Wave 3 | `ui-button-roll` | a chunky green cockpit push-button with a die symbol, single object, centred, plain flat white background, no  |
| Wave 3 Wave 3 | `ui-check` | a small empty cream checkbox square with a navy rim, single object, centred, plain flat white background, no s |
| Wave 3 Wave 3 | `ui-sheet` | a pale clipboard sheet with a metal clip and a faint checklist margin, single object, centred, plain flat whit |
| Wave 3 Wave 3 (16:9) | `ui-altbar` | a long narrow teal cockpit panel strip with rivets, empty, single object, centred, plain flat white background |
| Wave 3 Wave 3 (16:9) | `ui-phrase` | a blank cream radio push-button with a thin navy rim, wide and short, single object, centred, plain flat white |
| Wave 4 Wave 4 kit | `ui-bubble` | a blank speech-bubble panel made of cream instrument-panel plastic with a brushed aluminium outline and a tiny |
| Wave 4 Wave 4 kit | `ui-bubble-tail` | a small pointed speech-bubble tail made of cream instrument-panel plastic with a brushed aluminium outline, si |
| Wave 4 Wave 4 kit | `ui-button-cream` | a blank wide horizontal pill-shaped button plate about three times wider than tall, warm cream with a brushed  |
| Wave 4 Wave 4 kit | `ui-button-go` | a blank wide horizontal pill-shaped button plate about three times wider than tall, crew-orange with a brushed |
| Wave 4 Wave 4 kit | `ui-button-power` | a blank wide horizontal pill-shaped button plate about three times wider than tall, crew-blue with a brushed a |
| Wave 4 Wave 4 kit | `ui-drawer-head` | a strip of a teal cockpit panel strip with rivets with a brushed aluminium edge line, seamless left to right,  |
| Wave 4 Wave 4 kit | `ui-iconbtn` | a blank round brushed aluminium button with a teal ring, centre empty, single object, centred, plain flat whit |
| Wave 4 Wave 4 kit | `ui-node-boss` | a round brushed aluminium medallion with a teal ring, centre blank, larger with a small crown on top, single o |
| Wave 4 Wave 4 kit | `ui-node-done` | a round brushed aluminium medallion with a teal ring, centre blank, with a small laurel at the bottom, single  |
| Wave 4 Wave 4 kit | `ui-node-locked` | a round brushed aluminium medallion with a teal ring, centre blank, dull and darkened with a small padlock at  |
| Wave 4 Wave 4 kit | `ui-node-open` | a round brushed aluminium medallion with a teal ring, centre blank, bright and polished, single object, centre |
| Wave 4 Wave 4 kit | `ui-panel` | a cream instrument-panel plastic panel with ornate brushed aluminium corners and a thin brushed aluminium bord |
| Wave 4 Wave 4 kit | `ui-row` | a blank wide strip of cream instrument-panel plastic with a thin brushed aluminium edge and a small teal diamo |
| Wave 4 Wave 4 kit | `ui-topbar` | a long strip of a teal cockpit panel strip with rivets, seamless left to right, empty, no text |

## lantern-dive

3D: none

| Wave / kind | File (media/…webp) | What it is |
|---|---|---|
| Wave 3 Wave 3 | `icon-air` | a small hand-painted icon of a cluster of rising air bubbles, bold, readable at 24 px, single object, centred, |
| Wave 3 Wave 3 | `icon-cross` | a small hand-painted icon of a red sea-glass cross mark, bold, readable at 24 px, single object, centred, plai |
| Wave 3 Wave 3 | `icon-heart` | a small hand-painted icon of a coral-red heart, bold, readable at 24 px, single object, centred, plain flat wh |
| Wave 3 Wave 3 | `icon-tank-empty` | a small hand-painted icon of a blue air tank, empty, dull and dented, bold, readable at 24 px, single object,  |
| Wave 3 Wave 3 | `icon-tank-full` | a small hand-painted icon of a blue air tank, full, with a bright gauge, bold, readable at 24 px, single objec |
| Wave 3 Wave 3 | `icon-tick` | a small hand-painted icon of a green sea-glass tick mark, bold, readable at 24 px, single object, centred, pla |
| Wave 3 Wave 3 | `ui-trick-pad` | a blank rounded panel of dark deep-sea glass with a thin brass rim, centre empty, single object, centred, plai |
| Wave 3 Wave 3 (16:9) | `ui-seat` | a small blank brass diving-helmet badge plate, wider than tall, centre empty, single object, centred, plain fl |
| Wave 3 Wave 3 (3:4) | `card-face-coral` | a blank playing card face in cream paper with a thin coral pink-red border and tiny bubbles in the corners, mi |
| Wave 3 Wave 3 (3:4) | `card-face-kelp` | a blank playing card face in cream paper with a thin green border and tiny bubbles in the corners, middle empt |
| Wave 3 Wave 3 (3:4) | `card-face-lantern` | a blank playing card face in cream paper with a thin brass border and tiny bubbles in the corners, middle empt |
| Wave 3 Wave 3 (3:4) | `card-face-sunstar` | a blank playing card face in cream paper with a thin golden yellow border and tiny bubbles in the corners, mid |
| Wave 3 Wave 3 (3:4) | `card-face-tide` | a blank playing card face in cream paper with a thin blue border and tiny bubbles in the corners, middle empty |
| Wave 3 Wave 3 (9:16) | `table-tunnel-glow-phone` | a vertical deep-sea cave view in dark blue with faint light shafts from above, calm empty centre, no text |
| Wave 4 Wave 4 kit | `ui-bubble` | a blank speech-bubble panel made of weathered sea-chart paper with a brass outline and a tiny curl at one corn |
| Wave 4 Wave 4 kit | `ui-bubble-tail` | a small pointed speech-bubble tail made of weathered sea-chart paper with a brass outline, single object, cent |
| Wave 4 Wave 4 kit | `ui-button-cream` | a blank wide horizontal pill-shaped button plate about three times wider than tall, pale sand with a brass rim |
| Wave 4 Wave 4 kit | `ui-button-go` | a blank wide horizontal pill-shaped button plate about three times wider than tall, lantern-gold with a brass  |
| Wave 4 Wave 4 kit | `ui-button-power` | a blank wide horizontal pill-shaped button plate about three times wider than tall, deep-teal with a brass rim |
| Wave 4 Wave 4 kit | `ui-drawer-head` | a strip of a riveted brass and teal hull strip with a brass edge line, seamless left to right, empty, no text |
| Wave 4 Wave 4 kit | `ui-iconbtn` | a blank round brass button with a sea teal ring, centre empty, single object, centred, plain flat white backgr |
| Wave 4 Wave 4 kit | `ui-node-boss` | a round brass medallion with a sea teal ring, centre blank, larger with a small crown on top, single object, c |
| Wave 4 Wave 4 kit | `ui-node-done` | a round brass medallion with a sea teal ring, centre blank, with a small laurel at the bottom, single object,  |
| Wave 4 Wave 4 kit | `ui-node-locked` | a round brass medallion with a sea teal ring, centre blank, dull and darkened with a small padlock at the bott |
| Wave 4 Wave 4 kit | `ui-node-open` | a round brass medallion with a sea teal ring, centre blank, bright and polished, single object, centred, plain |
| Wave 4 Wave 4 kit | `ui-panel` | a weathered sea-chart paper panel with ornate brass corners and a thin brass border, the whole centre plain an |
| Wave 4 Wave 4 kit | `ui-row` | a blank wide strip of weathered sea-chart paper with a thin brass edge and a small sea teal diamond at the lef |
| Wave 4 Wave 4 kit | `ui-topbar` | a long strip of a riveted brass and teal hull strip, seamless left to right, empty, no text |

## thornbound

3D: crown, throne

| Wave / kind | File (media/…webp) | What it is |
|---|---|---|
| Wave 3 Wave 3 | `emblem-clans` | a small antlered heraldic badge in tarnished gold on teal, single object, centred, plain flat white background |
| Wave 3 Wave 3 | `emblem-gathering` | a small moth-wing heraldic badge in tarnished gold on violet, single object, centred, plain flat white backgro |
| Wave 3 Wave 3 | `emblem-nobility` | a small golden-crowned heraldic badge in tarnished gold on royal blue, single object, centred, plain flat whit |
| Wave 3 Wave 3 | `emblem-uprising` | a small lantern heraldic badge in tarnished gold on crimson, single object, centred, plain flat white backgrou |
| Wave 3 Wave 3 | `icon-influence` | a small hand-painted icon of a tarnished-gold signet ring, bold, readable at 24 px, single object, centred, pl |
| Wave 3 Wave 3 | `icon-lore` | a small hand-painted icon of an old closed book with a crimson ribbon, bold, readable at 24 px, single object, |
| Wave 3 Wave 3 | `icon-pledge` | a small hand-painted icon of a round council seal with a raised hand on it, bold, readable at 24 px, single ob |
| Wave 3 Wave 3 | `icon-supporter` | a small hand-painted icon of a small hooded figure holding a candle, bold, readable at 24 px, single object, c |
| Wave 3 Wave 3 | `token-strength-green` | a round enamelled wax seal plate in deep green with a tarnished-gold rim, centre empty, single object, centred |
| Wave 3 Wave 3 | `token-strength-orange` | a round enamelled wax seal plate in amber with a tarnished-gold rim, centre empty, single object, centred, pla |
| Wave 3 Wave 3 | `token-strength-red` | a round enamelled wax seal plate in crimson with a tarnished-gold rim, centre empty, single object, centred, p |
| Wave 3 Wave 3 | `ui-round-shield` | a crimson heraldic pennant shield with gold trim, centre empty, single object, centred, plain flat white backg |
| Wave 3 Wave 3 | `ui-sheet` | an aged vellum sheet with a darker burnt edge and a thin crimson border line, centre plain, single object, cen |
| Wave 3 Wave 3 (16:9) | `ui-sheet-head` | a strip of aged vellum with a dark burnt edge and a thin crimson line, seamless left to right, empty, no text |
| Wave 4 Wave 4 kit | `ui-bubble` | a blank speech-bubble panel made of aged vellum with a tarnished gold outline and a tiny curl at one corner, s |
| Wave 4 Wave 4 kit | `ui-bubble-tail` | a small pointed speech-bubble tail made of aged vellum with a tarnished gold outline, single object, centred,  |
| Wave 4 Wave 4 kit | `ui-button-cream` | a blank wide horizontal pill-shaped button plate about three times wider than tall, ivory with a tarnished gol |
| Wave 4 Wave 4 kit | `ui-button-go` | a blank wide horizontal pill-shaped button plate about three times wider than tall, crimson velvet with a tarn |
| Wave 4 Wave 4 kit | `ui-button-power` | a blank wide horizontal pill-shaped button plate about three times wider than tall, deep-green velvet with a t |
| Wave 4 Wave 4 kit | `ui-drawer-head` | a strip of black wood with thorny gold vines with a tarnished gold edge line, seamless left to right, empty, n |
| Wave 4 Wave 4 kit | `ui-iconbtn` | a blank round tarnished gold button with a crimson ring, centre empty, single object, centred, plain flat whit |
| Wave 4 Wave 4 kit | `ui-node-boss` | a round tarnished gold medallion with a crimson ring, centre blank, larger with a small crown on top, single o |
| Wave 4 Wave 4 kit | `ui-node-done` | a round tarnished gold medallion with a crimson ring, centre blank, with a small laurel at the bottom, single  |
| Wave 4 Wave 4 kit | `ui-node-locked` | a round tarnished gold medallion with a crimson ring, centre blank, dull and darkened with a small padlock at  |
| Wave 4 Wave 4 kit | `ui-node-open` | a round tarnished gold medallion with a crimson ring, centre blank, bright and polished, single object, centre |
| Wave 4 Wave 4 kit | `ui-panel` | a aged vellum panel with ornate tarnished gold corners and a thin tarnished gold border, the whole centre plai |
| Wave 4 Wave 4 kit | `ui-row` | a blank wide strip of aged vellum with a thin tarnished gold edge and a small crimson diamond at the left end, |
| Wave 4 Wave 4 kit | `ui-topbar` | a long strip of black wood with thorny gold vines, seamless left to right, empty, no text |

## kaiten-kitchen

3D: cloche, plate

| Wave / kind | File (media/…webp) | What it is |
|---|---|---|
| Wave 3 Wave 3 | `icon-cup` | a small hand-painted icon of a pink custard pudding cup, bold, readable at 24 px, single object, centred, plai |
| Wave 3 Wave 3 | `icon-paste` | a small hand-painted icon of a small mound of bright green fire paste, bold, readable at 24 px, single object, |
| Wave 3 Wave 3 | `icon-plate` | a small hand-painted icon of a tiny round white plate, bold, readable at 24 px, single object, centred, plain  |
| Wave 3 Wave 3 | `icon-star` | a small hand-painted icon of a gold star, bold, readable at 24 px, single object, centred, plain flat white ba |
| Wave 3 Wave 3 (16:9) | `ui-nametag-gold` | a blank paper chopstick-sleeve label in mustard gold, wide and short, single object, centred, plain flat white |
| Wave 3 Wave 3 (16:9) | `ui-nametag-green` | a blank paper chopstick-sleeve label in leaf green, wide and short, single object, centred, plain flat white b |
| Wave 3 Wave 3 (16:9) | `ui-nametag-purple` | a blank paper chopstick-sleeve label in violet, wide and short, single object, centred, plain flat white backg |
| Wave 3 Wave 3 (16:9) | `ui-nametag-red` | a blank paper chopstick-sleeve label in tomato red, wide and short, single object, centred, plain flat white b |
| Wave 3 Wave 3 (16:9) | `ui-nametag-teal` | a blank paper chopstick-sleeve label in teal, wide and short, single object, centred, plain flat white backgro |
| Wave 4 Wave 4 kit | `ui-bubble` | a blank speech-bubble panel made of washi paper with a lacquered red wood outline and a tiny curl at one corne |
| Wave 4 Wave 4 kit | `ui-bubble-tail` | a small pointed speech-bubble tail made of washi paper with a lacquered red wood outline, single object, centr |
| Wave 4 Wave 4 kit | `ui-button-cream` | a blank wide horizontal pill-shaped button plate about three times wider than tall, cream ceramic with a lacqu |
| Wave 4 Wave 4 kit | `ui-button-go` | a blank wide horizontal pill-shaped button plate about three times wider than tall, salmon-orange ceramic with |
| Wave 4 Wave 4 kit | `ui-button-power` | a blank wide horizontal pill-shaped button plate about three times wider than tall, indigo ceramic with a lacq |
| Wave 4 Wave 4 kit | `ui-drawer-head` | a strip of a bamboo and red-lacquer strip with a lacquered red wood edge line, seamless left to right, empty,  |
| Wave 4 Wave 4 kit | `ui-iconbtn` | a blank round lacquered red wood button with a gold ring, centre empty, single object, centred, plain flat whi |
| Wave 4 Wave 4 kit | `ui-node-boss` | a round lacquered red wood medallion with a gold ring, centre blank, larger with a small crown on top, single  |
| Wave 4 Wave 4 kit | `ui-node-done` | a round lacquered red wood medallion with a gold ring, centre blank, with a small laurel at the bottom, single |
| Wave 4 Wave 4 kit | `ui-node-locked` | a round lacquered red wood medallion with a gold ring, centre blank, dull and darkened with a small padlock at |
| Wave 4 Wave 4 kit | `ui-node-open` | a round lacquered red wood medallion with a gold ring, centre blank, bright and polished, single object, centr |
| Wave 4 Wave 4 kit | `ui-panel` | a washi paper panel with ornate lacquered red wood corners and a thin lacquered red wood border, the whole cen |
| Wave 4 Wave 4 kit | `ui-row` | a blank wide strip of washi paper with a thin lacquered red wood edge and a small gold diamond at the left end |
| Wave 4 Wave 4 kit | `ui-topbar` | a long strip of a bamboo and red-lacquer strip, seamless left to right, empty, no text |

## sunglaze

3D: plate, sun

| Wave / kind | File (media/…webp) | What it is |
|---|---|---|
| Wave 1 Wave 1 | `kiln-disc` | a round glazed terracotta plate seen from above, wide rim with a wavy cream pattern, flat dished middle, soft  |
| Wave 1 Wave 1 | `kiln-disc-empty` | a round glazed terracotta plate seen from above, wide rim with a wavy cream pattern, flat dished middle, sligh |
| Wave 1 Wave 1 | `tile-gloss` | a soft glossy glaze highlight shape on a square tile with tiny chips on the corner, white on black, no colour, |
| Wave 1 Wave 1 | `token-sun` | a round brass sun token with a smiling face and short rays, single object, centred, plain flat white backgroun |
| Wave 1 Wave 1 | `ui-floor-cell` | a single shallow square dish in dusty pink clay with a hairline crack, seen from above, empty, single object,  |
| Wave 1 Wave 1 | `ui-rack-cell` | a single shallow square dish carved in warm oak, seen from above, empty, single object, centred, plain flat wh |
| Wave 1 Wave 1 | `ui-rack-frame` | a blank carved wooden tile rack with shallow square dishes, warm oak, seen from above, single object, centred, |
| Wave 1 Wave 1 | `ui-wall-cell` | a shallow square plaster recess with a hairline gold edge, single object, centred, plain flat white background |
| Wave 1 Wave 1 (16:9) | `pool-oval` | a large oval wooden serving tray seen from above with a pale sunburst inlay and a brass rim, middle empty, sin |
| Wave 4 Wave 4 kit | `ui-bubble` | a blank speech-bubble panel made of cream glazed ceramic with a copper outline and a tiny curl at one corner,  |
| Wave 4 Wave 4 kit | `ui-bubble-tail` | a small pointed speech-bubble tail made of cream glazed ceramic with a copper outline, single object, centred, |
| Wave 4 Wave 4 kit | `ui-button-cream` | a blank wide horizontal pill-shaped button plate about three times wider than tall, cream glaze with a copper  |
| Wave 4 Wave 4 kit | `ui-button-go` | a blank wide horizontal pill-shaped button plate about three times wider than tall, kiln-orange glaze with a c |
| Wave 4 Wave 4 kit | `ui-button-power` | a blank wide horizontal pill-shaped button plate about three times wider than tall, cobalt glaze with a copper |
| Wave 4 Wave 4 kit | `ui-drawer-head` | a strip of glazed terracotta tiles with a copper edge line, seamless left to right, empty, no text |
| Wave 4 Wave 4 kit | `ui-iconbtn` | a blank round copper button with a cobalt glaze ring, centre empty, single object, centred, plain flat white b |
| Wave 4 Wave 4 kit | `ui-node-boss` | a round copper medallion with a cobalt glaze ring, centre blank, larger with a small crown on top, single obje |
| Wave 4 Wave 4 kit | `ui-node-done` | a round copper medallion with a cobalt glaze ring, centre blank, with a small laurel at the bottom, single obj |
| Wave 4 Wave 4 kit | `ui-node-locked` | a round copper medallion with a cobalt glaze ring, centre blank, dull and darkened with a small padlock at the |
| Wave 4 Wave 4 kit | `ui-node-open` | a round copper medallion with a cobalt glaze ring, centre blank, bright and polished, single object, centred,  |
| Wave 4 Wave 4 kit | `ui-panel` | a cream glazed ceramic panel with ornate copper corners and a thin copper border, the whole centre plain and e |
| Wave 4 Wave 4 kit | `ui-row` | a blank wide strip of cream glazed ceramic with a thin copper edge and a small cobalt glaze diamond at the lef |
| Wave 4 Wave 4 kit | `ui-topbar` | a long strip of glazed terracotta tiles, seamless left to right, empty, no text |

## cauldron-fair

3D: bag, chip

| Wave / kind | File (media/…webp) | What it is |
|---|---|---|
| Wave 3 Wave 3 | `btn-draw` | a big friendly clay button with a drawstring bag on it, single object, centred, plain flat white background, n |
| Wave 3 Wave 3 | `btn-stop` | a big friendly clay button with a raised stop hand on it, single object, centred, plain flat white background, |
| Wave 3 Wave 3 | `icon-boom` | a small cauldron pot with a puff of smoke bursting out, single object, centred, plain flat white background, n |
| Wave 3 Wave 3 | `ui-slot` | a shallow round clay dish seen from above, single object, centred, plain flat white background, no shadow, no  |
| Wave 3 Wave 3 | `ui-stall` | a market stall counter board of rough planks with a small cloth header and three round empty dishes, seen from |
| Wave 3 Wave 3 | `ui-stall-locked` | a market stall counter board of rough planks with a small cloth header and three round empty dishes, dimmed, a |
| Wave 3 Wave 3 (16:9) | `awning` | a scalloped red-and-cream striped awning edge seen from the front, seamless left to right, single object, cent |
| Wave 3 Wave 3 (16:9) | `ui-chipbar` | a long narrow carved wooden track with seven shallow round pockets in a row, empty, single object, centred, pl |
| Wave 4 Wave 4 kit | `ui-bubble` | a blank speech-bubble panel made of fairground parchment with a copper outline and a tiny curl at one corner,  |
| Wave 4 Wave 4 kit | `ui-bubble-tail` | a small pointed speech-bubble tail made of fairground parchment with a copper outline, single object, centred, |
| Wave 4 Wave 4 kit | `ui-button-cream` | a blank wide horizontal pill-shaped button plate about three times wider than tall, cream with a copper rim, s |
| Wave 4 Wave 4 kit | `ui-button-go` | a blank wide horizontal pill-shaped button plate about three times wider than tall, pumpkin-orange with a copp |
| Wave 4 Wave 4 kit | `ui-button-power` | a blank wide horizontal pill-shaped button plate about three times wider than tall, potion-purple with a coppe |
| Wave 4 Wave 4 kit | `ui-drawer-head` | a strip of striped painted fair-booth wood with a copper edge line, seamless left to right, empty, no text |
| Wave 4 Wave 4 kit | `ui-iconbtn` | a blank round copper button with a potion green ring, centre empty, single object, centred, plain flat white b |
| Wave 4 Wave 4 kit | `ui-node-boss` | a round copper medallion with a potion green ring, centre blank, larger with a small crown on top, single obje |
| Wave 4 Wave 4 kit | `ui-node-done` | a round copper medallion with a potion green ring, centre blank, with a small laurel at the bottom, single obj |
| Wave 4 Wave 4 kit | `ui-node-locked` | a round copper medallion with a potion green ring, centre blank, dull and darkened with a small padlock at the |
| Wave 4 Wave 4 kit | `ui-node-open` | a round copper medallion with a potion green ring, centre blank, bright and polished, single object, centred,  |
| Wave 4 Wave 4 kit | `ui-panel` | a fairground parchment panel with ornate copper corners and a thin copper border, the whole centre plain and e |
| Wave 4 Wave 4 kit | `ui-row` | a blank wide strip of fairground parchment with a thin copper edge and a small potion green diamond at the lef |
| Wave 4 Wave 4 kit | `ui-topbar` | a long strip of striped painted fair-booth wood, seamless left to right, empty, no text |

## mainhattan-nightrun

All painted files in media/ are now loaded by the live page (J2 wired the 22 UI kit files).

## short-fuse

3D: bomb, pliers

| Wave / kind | File (media/…webp) | What it is |
|---|---|---|
| Wave 1 Wave 1 | `icon-bomb` | a round black cartoon bomb with a short lit fuse and a brass band, single object, centred, plain flat white ba |
| Wave 1 Wave 1 | `ui-eq-frame` | a blank tall riveted blueprint card with a brass corner bracket, centre empty, single object, centred, plain f |
| Wave 1 Wave 1 | `ui-job-sheet` | a blank square riveted blueprint sheet with brass corner brackets, centre empty, single object, centred, plain |
| Wave 1 Wave 1 | `wire-tile-frame` | a tall blank enamel control plate with four rivets, a small clamp at the top and a coiled copper wire stub at  |
| Wave 1 Wave 1 (16:9) | `fx-fuse-spark` | a small fuse spark shown in 8 stages in one row, from a tiny ember to a bright crackling spark, on a pure blac |
| Wave 1 Wave 1 (16:9) | `ui-fuse-track` | a thin rope fuse running straight left to right, seamless, plain flat white background, no text |
| Wave 1 Wave 1 (16:9) | `ui-nameplate` | a blank brass name plate with two rivets and a thin copper wire edge, centre empty, single object, centred, pl |
| Wave 1 Wave 1 (16:9) | `ui-rack` | a long brass mounting rail with spring clips seen from the front, single object, centred, plain flat white bac |
| Wave 4 Wave 4 kit | `ui-bubble` | a blank speech-bubble panel made of blueprint paper with a brass outline and a tiny curl at one corner, single |
| Wave 4 Wave 4 kit | `ui-bubble-tail` | a small pointed speech-bubble tail made of blueprint paper with a brass outline, single object, centred, plain |
| Wave 4 Wave 4 kit | `ui-button-cream` | a blank wide horizontal pill-shaped button plate about three times wider than tall, cream enamel with a brass  |
| Wave 4 Wave 4 kit | `ui-button-go` | a blank wide horizontal pill-shaped button plate about three times wider than tall, warning-orange enamel with |
| Wave 4 Wave 4 kit | `ui-button-power` | a blank wide horizontal pill-shaped button plate about three times wider than tall, blueprint-blue enamel with |
| Wave 4 Wave 4 kit | `ui-drawer-head` | a strip of riveted workbench wood with a brass edge line, seamless left to right, empty, no text |
| Wave 4 Wave 4 kit | `ui-iconbtn` | a blank round brass button with a copper wire ring, centre empty, single object, centred, plain flat white bac |
| Wave 4 Wave 4 kit | `ui-node-boss` | a round brass medallion with a copper wire ring, centre blank, larger with a small crown on top, single object |
| Wave 4 Wave 4 kit | `ui-node-done` | a round brass medallion with a copper wire ring, centre blank, with a small laurel at the bottom, single objec |
| Wave 4 Wave 4 kit | `ui-node-locked` | a round brass medallion with a copper wire ring, centre blank, dull and darkened with a small padlock at the b |
| Wave 4 Wave 4 kit | `ui-node-open` | a round brass medallion with a copper wire ring, centre blank, bright and polished, single object, centred, pl |
| Wave 4 Wave 4 kit | `ui-panel` | a blueprint paper panel with ornate brass corners and a thin brass border, the whole centre plain and empty, s |
| Wave 4 Wave 4 kit | `ui-row` | a blank wide strip of blueprint paper with a thin brass edge and a small copper wire diamond at the left end,  |
| Wave 4 Wave 4 kit | `ui-topbar` | a long strip of riveted workbench wood, seamless left to right, empty, no text |

## tidewake

3D: junk, leviathan

| Wave / kind | File (media/…webp) | What it is |
|---|---|---|
| Wave 1 Wave 1 | `board-frame` | a carved dark-wood sea-chart frame with brass corner fittings, centre empty, single object, centred, plain fla |
| Wave 1 Wave 1 | `compass-rose` | a hand-painted brass-and-gold compass rose with eight points seen from above, no letters, single object, centr |
| Wave 1 Wave 1 | `ring-slot` | a round brass buoy ring seen from above, centre empty, single object, centred, plain flat white background, no |
| Wave 1 Wave 1 | `tile-water-a` | a top-down square of deep teal sea water, calm, soft wave crests, seamless tileable, no objects, no text |
| Wave 1 Wave 1 | `tile-water-b` | a top-down square of deep teal sea water, gentle ripples and a few foam flecks, seamless tileable, no objects, |
| Wave 1 Wave 1 | `tile-water-c` | a top-down square of deep teal sea water, rolling crests with foam lines, seamless tileable, no objects, no te |
| Wave 1 Wave 1 | `tile-water-d` | a top-down square of deep teal sea water, a slow swirl and scattered foam, seamless tileable, no objects, no t |
| Wave 1 Wave 1 (16:9) | `ui-nametag` | a small blank luggage tag with a rope loop and a thin brass rim, single object, centred, plain flat white back |
| Wave 4 Wave 4 kit | `ui-bubble` | a blank speech-bubble panel made of sea-chart parchment with a brass outline and a tiny curl at one corner, si |
| Wave 4 Wave 4 kit | `ui-bubble-tail` | a small pointed speech-bubble tail made of sea-chart parchment with a brass outline, single object, centred, p |
| Wave 4 Wave 4 kit | `ui-button-cream` | a blank wide horizontal pill-shaped button plate about three times wider than tall, cream lacquer with a brass |
| Wave 4 Wave 4 kit | `ui-button-go` | a blank wide horizontal pill-shaped button plate about three times wider than tall, lantern-orange lacquer wit |
| Wave 4 Wave 4 kit | `ui-button-power` | a blank wide horizontal pill-shaped button plate about three times wider than tall, deep-teal lacquer with a b |
| Wave 4 Wave 4 kit | `ui-drawer-head` | a strip of dark teal lacquered wood with a brass edge line, seamless left to right, empty, no text |
| Wave 4 Wave 4 kit | `ui-iconbtn` | a blank round brass button with a teal lacquer ring, centre empty, single object, centred, plain flat white ba |
| Wave 4 Wave 4 kit | `ui-node-boss` | a round brass medallion with a teal lacquer ring, centre blank, larger with a small crown on top, single objec |
| Wave 4 Wave 4 kit | `ui-node-done` | a round brass medallion with a teal lacquer ring, centre blank, with a small laurel at the bottom, single obje |
| Wave 4 Wave 4 kit | `ui-node-locked` | a round brass medallion with a teal lacquer ring, centre blank, dull and darkened with a small padlock at the  |
| Wave 4 Wave 4 kit | `ui-node-open` | a round brass medallion with a teal lacquer ring, centre blank, bright and polished, single object, centred, p |
| Wave 4 Wave 4 kit | `ui-panel` | a sea-chart parchment panel with ornate brass corners and a thin brass border, the whole centre plain and empt |
| Wave 4 Wave 4 kit | `ui-row` | a blank wide strip of sea-chart parchment with a thin brass edge and a small teal lacquer diamond at the left  |
| Wave 4 Wave 4 kit | `ui-topbar` | a long strip of dark teal lacquered wood, seamless left to right, empty, no text |

## hollowbough

3D: ever-tree, worker

| Wave / kind | File (media/…webp) | What it is |
|---|---|---|
| Wave 4 Wave 4 kit | `ui-bubble` | a blank speech-bubble panel made of birch-bark paper with a carved bark outline and a tiny curl at one corner, |
| Wave 4 Wave 4 kit | `ui-bubble-tail` | a small pointed speech-bubble tail made of birch-bark paper with a carved bark outline, single object, centred |
| Wave 4 Wave 4 kit | `ui-button-cream` | a blank wide horizontal pill-shaped button plate about three times wider than tall, cream with a carved bark r |
| Wave 4 Wave 4 kit | `ui-button-go` | a blank wide horizontal pill-shaped button plate about three times wider than tall, autumn-orange with a carve |
| Wave 4 Wave 4 kit | `ui-button-power` | a blank wide horizontal pill-shaped button plate about three times wider than tall, moss-green with a carved b |
| Wave 4 Wave 4 kit | `ui-drawer-head` | a strip of a carved branch with leaves with a carved bark edge line, seamless left to right, empty, no text |
| Wave 4 Wave 4 kit | `ui-iconbtn` | a blank round carved bark button with a autumn orange ring, centre empty, single object, centred, plain flat w |
| Wave 4 Wave 4 kit | `ui-node-boss` | a round carved bark medallion with a autumn orange ring, centre blank, larger with a small crown on top, singl |
| Wave 4 Wave 4 kit | `ui-node-done` | a round carved bark medallion with a autumn orange ring, centre blank, with a small laurel at the bottom, sing |
| Wave 4 Wave 4 kit | `ui-node-locked` | a round carved bark medallion with a autumn orange ring, centre blank, dull and darkened with a small padlock  |
| Wave 4 Wave 4 kit | `ui-node-open` | a round carved bark medallion with a autumn orange ring, centre blank, bright and polished, single object, cen |
| Wave 4 Wave 4 kit | `ui-panel` | a birch-bark paper panel with ornate carved bark corners and a thin carved bark border, the whole centre plain |
| Wave 4 Wave 4 kit | `ui-row` | a blank wide strip of birch-bark paper with a thin carved bark edge and a small autumn orange diamond at the l |
| Wave 4 Wave 4 kit | `ui-topbar` | a long strip of a carved branch with leaves, seamless left to right, empty, no text |
| Wave 5 Wave 5 | `icon-berry` | a cluster of red berries, bold, readable at 24 px, single object, centred, plain flat white background, no sha |
| Wave 5 Wave 5 | `icon-pebble` | a smooth grey pebble, bold, readable at 24 px, single object, centred, plain flat white background, no shadow, |
| Wave 5 Wave 5 | `icon-resin` | a golden resin drop, bold, readable at 24 px, single object, centred, plain flat white background, no shadow,  |
| Wave 5 Wave 5 | `icon-twig` | a small bundle of twigs tied with grass, bold, readable at 24 px, single object, centred, plain flat white bac |
| Wave 5 Wave 5 | `ui-season-wheel` | a round wooden dial divided into four seasons with a leaf, flower, sun and snowflake motif carved in each quar |
