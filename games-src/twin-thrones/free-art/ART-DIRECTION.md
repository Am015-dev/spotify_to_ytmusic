# Twin Thrones: art direction (free kit, round 3)

**Style:** one family only, the KayKit *Medieval Hexagon Pack* (CC0): chunky low-poly medieval buildings and props on hex tiles, soft shadows,
flat saturated colours. Every picture is a real render of those models (three.js, orthographic isometric camera, same light, same angle), so cards,
wonders, tokens, boards and scenes look like one printed set, not icons on gradients.

**Cards (88 slots, 500x700):** one bold object per card, big enough to read at 60 px wide on a 390 px phone. The frame carries the colour code:
brown raw goods, grey manufactured goods, blue civic, green science, yellow trade, red military, purple guilds. Building roofs use the
same colour family where the pack offers it (blue/green/yellow/red variants). Top ~20 % is calm colour (the game draws its band there), bottom ~15 % is a
dark strip (the game draws costs there). The object stands on a thin hex pad; prop scenes (logs, stone, crates) use a smaller pad and bigger props.
**Wonders (700x500):** the pack's largest pieces (castles, towers, mountains, mill on water) on a warm sandstone hex sheet with a gold frame.
**Progress tokens, science, shield, VP:** round gold-ringed medallions, parchment disc; tokens hold a pack render, the seven science marks and the
shield/laurel icons are small game-icons.net glyphs (type badges only, never the main picture). Coin is drawn in the same gold ring with a hex emboss.
**Boards and scenes:** conflict track and city strips are hex rows rendered top-down with the two castles at the ends; title, victory and defeat are hex
islands in the sea (defeat = ruins, desaturated, dusk); table is a dark teal hex cloth; portraits are the two castles on a faction-colour hex wash.
**Card backs:** age colour (navy, brown, violet), hex lattice, gold medallion with the watch tower, 1/2/3 pips.
**Palette:** pack grass lime #b5c22a, sea blue #2f86be, gold #e8bd4c, ink #2b1d0e, frame colours listed in compose.py.
**Honest limits:** the pack has no people, animals, ships or statues, so subjects are expressed with buildings and props (a watch tower for the
colossus, a stepped mountain for the pyramid). Wonders are the weakest set; a figure/ship pack (Quaternius, KayKit Adventurers) would lift them.
**Rebuild:** `sh tools/fetch-packs.sh`, `node tools/render-glyphs.js $PACKS`, `python3 tools/specs.py $PACKS/specs.json`, `node tools/render.js $PACKS/specs.json $PACKS/out`,
`python3 compose.py`, `python3 contact.py`, `python3 install.py --force`.
