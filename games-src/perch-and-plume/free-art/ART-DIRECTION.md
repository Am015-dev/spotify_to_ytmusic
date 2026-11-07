# Perch and Plume art direction (free kit, round 2)

**Style:** one flat-vector family, Kenney flat look (CC0 style language: no outlines, soft flat colour, rounded shapes, big friendly eye).
All 186 slots are SVG rendered by Chromium (`render.js`), so every edge is crisp at any size. No glyph icons, no text in pictures.

**Birds (120):** no CC0 pack has 40 real species in one hand, so every bird comes from ONE parametric bird sprite (`birds.py`):
same body/wing/head/eye construction for all, varied per species by shape (beak cone/thin/dagger/hook/curved/duck/shield,
tail short/long/forked/cocked/plumes, neck and legs for waders, crests, caps, masks, bibs, speckles/streaks) and recoloured per
species from its plumage description. The variant word (amber, ashen, cobalt...) tints plumage 14% and sky 12%.
Each stands on its habitat scene: forest = pine silhouettes + mossy branch (or trunk for woodpecker/treecreeper);
grassland = warm sky, golden hills, fence post; wetland = reeds, calm water (waders stand in it, ducks/grebes/coots swim).
The bird fills ~65% of the square so it reads at 120 px; the game's own habitat band sits on top.

**Other slots:** food = wooden discs (#c8925a) with flat food pictures; nests, eggs, goal tiles in habitat colours
(forest #4f8a4a, grassland #d2b25a, wetland #4a8cc4); bonus cards and card back = cream card, wood/moss frame, a framed
picture built from the same birds; feeder/tray/cube/rosette in the same wood palette; rows/mat = low-detail habitat strips;
title/result = tall layered field-station landscape with birds perched in it; map = parchment with the three regions.

**Portraits (8):** Kenney Toon Characters 1 (CC0, vector idle pose, clothes/hair/skin recoloured), via ../../wildmark/free-art/compose.py.

**Why:** the owner rejected glyph-on-gradient art. One construction for every bird keeps 120 cards consistent; Kenney's flat
language matches the portraits. Rebuild: `PACKS=<dir> python3 compose.py <outdir>` (PACKS as in wildmark, needed only for portraits).
