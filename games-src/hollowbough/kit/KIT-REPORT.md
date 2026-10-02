# Hollowbough visual kit: report and API
Files: kit.js (global `HBKit`, ~80 KB plain script, no deps), demo.html (self-contained, built by `python3 build.py` from demo-src.html + parts/p*.js), shoot.js (Playwright screenshots into shots/), ASSETS.md.
Style: storybook watercolour. Cream paper cards with ink outlines; art groups pass through SVG filters (`hb-wc`: feTurbulence + feDisplacementMap wobble, unsharp-style pigment edge, paper grain; `hb-wcl` lite displacement for small cards); soft translucent blob washes for skies/hills; paper/fibre noise on cards and table.

## API
- `HBKit.card(spec, size[, {id}]) -> <svg>`. spec: `{art, name, type:'traveler|production|destination|governance|prosperity', kind:'critter|construction' (default from art), unique:bool, cost:{twig,resin,pebble,berry}, points:n, text}`. size: `'small'` (64x90, no effect text), `'large'` (260x364, effect text 13.5 units = 13.5 px at 260 wide), a width number (<=120 uses the small layout) or `{w,h}`. Type colour: tinted title band + solid bottom band with label; critter = leaf badge + paw marker, construction = shield badge + house marker; Unique = star pill, Common = dot pill; cost pills with count bubbles.
- Cache: one template per (spec, layout); each call returns `cloneNode(true)`. `HBKit.stats()`; `clearCache()`. `cardURL(spec,size)` / `cardImg(spec,size)` give a standalone data-URL / <img> (defs embedded) for canvas or very large lists.
- `HBKit.art(key, w)` art-only svg (100x62 box). `HBKit.mount()` inserts shared filter defs (called automatically).
- `resource(kind,px)`, `point(n|null,px)`, `occupied(px)`, `worker(0..4|name,px)` (ember, river, honey, moss, automa=grey; each has a chest glyph leaf/drop/sun/star/moon so colour is not the only cue), `season('winter|spring|summer|autumn',px)`.
- `plaque(kind,{label,sub,slots,taken,w})` kinds `basic|forest|haven|journey|event`: painted wooden plaque with icon, label, optional effect text, worker-slot dots.
- `evertree({w,season})`: 600x720 painted tree with 4 season markers (current one glowing); `HBKit.evertreeSlots` = normalised marker centres `{season,x,y}`.
- `table(w,h,'paper'|'forest')` svg; `tableURL(mood)` data URL; `applyTable(el,mood)` sets the background.
- Data: `artKeys`, `critterKeys`, `constructionKeys`, `TYPES`, `PLAYER`, `RES`, `resources`, `seasons`.

## Art keys (58)
Critters (32): mouse_farmer squirrel_shopkeeper hedgehog_bard frog_judge owl_historian badger_king rabbit_queen mole_miner beetle_architect fox_wanderer shrew_ranger pigeon_postal turtle_teacher bat_doctor toad_undertaker hedgehog_monk mouse_fool shrew_sweeper squirrel_woodcarver rabbit_peddler frog_innkeeper badger_harvester owl_judge fox_peddler mole_historian bat_bard turtle_monk toad_shopkeeper beetle_woodcarver pigeon_ranger mouse_queen hedgehog_farmer
Constructions (26): farm mine refinery barge store inn chapel monastery palace castle theatre school museum university cemetery ruins postoffice fairground courthouse clocktower lookout crane storehouse dungeon evertree windmill

## Tests / what I looked at (Chromium, Playwright; screenshots in shots/)
desktop 1366 / phone 390x844 / phone 844x390: `*-crit`, `*-cons`, `*-tok`, `*-board`, `*-stress`, phone `*-enlarged` (tap-to-enlarge modal). I viewed desktop crit/cons/tok/board and phone crit/enlarged and fixed: off-centre titles, plaque label overlapping icon, table background not covering page, modal taller than landscape viewport, streaky table texture.
Perf: 150 small cards built+appended in ~90-220 ms cold (template cache; mostly 58 unique builds), no page errors, no horizontal scroll at any size. Real-device performance not tested (no phone); heavy filters mean >300 large cards at once is not advised, use `cardURL` images or the 'small' layout.
Known rough edges: small-card titles are ~7 px (the art, cost, points and type colour are the readable cues; tap to enlarge); mole/beetle/bat species are the least refined; windmill blades are plain.
