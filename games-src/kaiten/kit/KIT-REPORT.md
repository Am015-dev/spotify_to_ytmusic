# Kaiten Kitchen art kit (KKKit)
Files: `kit.js` (global `KKKit`, ~83 KB, no deps), `demo.html` (built by `python3 build.py` from `demo-src.html` + `parts/p1..p6.js`), `shoot.js` (Playwright shots to `shots/`).
Style: conveyor-belt diner, gouache look: flat opaque paint, warm-brown ink outlines, soft top-left rim light + bottom-right shade overlay, brush-wobble edge filter (`kk-fx-lite`) and paper grain (`kk-fx-full`, cards >= 170 px). Each card = a round plate seen from above (rim colour + rim ornament per food type) on a linen placemat, a paper name chit, and a coaster badge with the scoring-rule icon. Faces are our own: eyebrows, lids, steam, sweat drops, per-food mood (proud prawn, sleepy fish, startled bun, determined rolls, smug/dreamy/happy nigiri, fiery paste, winking sticks, blissful custard in a chef hat).
Shared gradients/filters are mounted once into the page (`KKKit.mount()`, automatic); SVG strings reference them. Use `{standalone:true}` (or `cardURL`) when the SVG is used as an `<img>`/canvas source.

## API (all sizes in CSS px; functions return SVG strings unless noted)
- `cardSVG(type, {w=120, fx:'auto|full|lite|none', variant:'nigiri'|on:'salmon|squid|egg' (wasabi only), selected, dim, standalone})`; height = round(w*1.4). Types: `tempura sashimi dumpling roll1 roll2 roll3 salmon squid egg wasabi chop pudding`. Name text >= 13 px at every width (2 lines when narrow, 1 line from ~120 px); w >= 170 adds a short rule caption.
- `cardLayout(w)` geometry; `TYPES[type]` = `{name, l:[line1,line2], c (plate colour), rule (icon name), ruleText, group}`; `ORDER`.
- `backSVG({w})` indigo wave-scale back with a steaming-plate medallion (no logo/text). `pileSVG({w, count, kind:'deck'|'discard', top:type})` stacked layers + count bubble, empty = dashed plate outline.
- `plateSVG(type, {d=64, on})` bare plate+food for belt riders / counter stacks.
- Belt: `beltSegmentSVG({h=72, period=96})` tiles seamlessly in x; `beltCSS({h,period,selector,seconds})` returns CSS (background-repeat + scroll keyframes, honours reduced motion); `beltEl({h,period,seconds})` returns a ready scrolling `<div class="kk-belt">`.
- `counterSVG({w,h,seat})` wooden counter (planks, lip, shade); `seat` 0-4 adds a cloth runner in the player colour. Cards are overlaid by the UI (demo overlaps them with a 72 % step so names stay readable).
- `avatarSVG(i, {size})` five original chefs (Mina, Taro, Odile, Kofi, Pip; `AVATARS`, `PLAYERS` = `{name,c,d,t}` seat colours); `seatSVG(i,{w,name,score,active})` avatar + name pill + score bubble, gold glow when active.
- `iconSVG(name,{size,type|c,bare})`, names in `iconNames`: pair set ladder most second v1 v2 v3 x3 swap dessert most6 fewest6 crown coin star check. `ruleIcon(type)`.
- `roundMarkerSVG(n, 'todo|current|done',{size})`, `roundTrackSVG(current,{total=3,size})`, `scorePadSVG({w,round,rows:[{i,name,rounds:[a,b,c],dessert,total,you}]})` (order-slip look, 14-18 px numbers).
- Reveal: `clocheSVG({w})`; `clocheOn(hostEl)` covers a positioned element with a cloche, returns `{lift({delay,onLift}) -> Promise, remove()}` (lid lifts, steam puffs, sparkles; `onLift` is the hook for the cloche sound); `revealAll([hostEl..],{stagger,onLift})`.
- Table: `applyTable(el,'day'|'night')`, `tableCSS(mood)`.
- DOM/canvas: `el(svg)`, `cardEl(type,opts)` (cached clone), `cardURL/backURL`, `cardImg`, `drawCard(ctx,type|'back',x,y,w,opts) -> Promise`.
- CSS helpers injected: `.kk-deal`, `.kk-land`, `@keyframes kk-glide` (plates gliding), `kk-steam`, `kk-spark`.

## What I looked at (Chromium; shots in `shots/`: desktop-*.png, phone-p-*.png at half size, desktop-night-counter.png)
Cards at 70/100/150/240 px, plates, backs/piles, belt, counters with stacks, chefs and seat tags, icons, score pad, round markers, cloche. Fixed along the way: wasabi swirl read as the wrong emoji (now a flaming grated mound), nigiri looked like mushrooms (flatter drooping topping), muddy grain on white food, overlapping score-pad column labels, steamer dangling lines, low-contrast captions. 120 cards at 70 px build in ~20-80 ms, no page errors, no horizontal scroll at 1366/390/844.

## Honest weaknesses
- At 70 px the rule badge (22 px) is only a hint (nigiri digits and x3 read, pair/set/ladder are small); the UI should show the rule text on tap (`TYPES[t].ruleText`).
- Name text uses `textLength` so it fits any fallback font, which can slightly squeeze/stretch glyphs; fonts are not bundled (Nunito if installed, else system sans).
- Many filtered SVGs at once are heavy on weak phones (not tested on a real device); use `fx:'none'` or `cardImg` for big lists.
- The belt is a decorative strip; plates riding on it are the UI's job (`kk-glide`, `plateSVG`). The cloche is a stylised side-view dome over a top-down card.
- Moon/Sunset nigiri are the least distinct from each other at 70 px (colour and moon/sun motif carry it). Dessert badge is small. Avatars are busts only, no poses.
