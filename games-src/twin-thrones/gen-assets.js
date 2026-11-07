// Generates assets.json, the Flow prompt files and ASSETS.md from src/data.js.  node gen-assets.js
var fs = require('fs'), path = require('path'), D = require('./src/data.js');
var STYLE = 'Flat 2D hand-painted storybook illustration, bold clean ink outlines, warm gouache texture, limited palette of terracotta, teal, ochre and ivory, soft light from the top left, an ancient sun-baked fantasy kingdom, strictly two-dimensional, no 3D render, no photograph, no text, no letters, no numbers, no border, no frame.';
var ALPHA = ' One single object centered on a flat plain white background, no ground shadow, clean edges so it can be keyed out.';
var items = [];
function add(stem, kind, w, h, ratio, alpha, wave, slot, prompt) { items.push({ stem: stem, kind: kind, w: w, h: h, ratio: ratio, alpha: alpha, wave: wave, slot: slot, prompt: prompt + (alpha ? ALPHA : '') }); }
// wave 1: the first minute
add('title-bg', 'bg', 2048, 1152, '16:9', false, 1, 'Title screen background (centre stays calm, cropped on phones)', 'Two rival stone thrones facing each other across a golden valley at dawn, two distant walled cities, banners in teal and ochre, wide calm composition with the middle left empty');
add('table-bg', 'bg', 2048, 2048, '1:1', false, 1, 'Game table behind everything', 'A dark teal carved stone table surface seen from above with faint gold inlay patterns and worn edges, empty in the middle');
add('military-board', 'board', 1800, 240, '15:2', false, 1, 'Conflict track strip', 'A long horizontal strip of battlefield ground from a teal fortress gate on the left to an ochre fortress gate on the right, nineteen stones laid in a row, trampled earth');
add('military-pawn', 'token', 256, 256, '1:1', true, 1, 'The conflict pawn', 'A gold-and-bronze war standard pawn on a round base');
add('coin', 'icon', 256, 256, '1:1', true, 1, 'Coin icon next to coin counts', 'A single thick gold coin with a simple sun relief');
[1, 2, 3].forEach(function (a) { add('back-age' + a, 'card', 500, 700, '5:7', false, 1, 'Face-down pyramid cards of age ' + a, ['', 'A deep blue card back with a repeating pattern of small bronze tools', 'A warm brown card back with a repeating pattern of laurel branches', 'A royal purple card back with a repeating pattern of tiny crowns'][a]); });
add('city-board-p1', 'board', 1500, 300, '5:1', false, 1, 'Strip behind the bottom player\'s city', 'A teal-banner themed city strip: a long carved wooden ledge with a tiny skyline of teal-roofed houses on the horizon');
add('city-board-p2', 'board', 1500, 300, '5:1', false, 1, 'Strip behind the top player\'s city', 'An ochre-banner themed city strip: a long carved stone ledge with a tiny skyline of ochre-roofed houses on the horizon');
add('portrait-p1', 'portrait', 512, 512, '1:1', false, 1, 'Bottom player portrait', 'A confident young ruler with a teal cloak and a thin gold circlet, head and shoulders, calm expression');
add('portrait-p2', 'portrait', 512, 512, '1:1', false, 1, 'Top player portrait', 'A sharp-eyed rival ruler with an ochre cloak and a bronze crown, head and shoulders, cunning smile');
// cards
D.CARDS.forEach(function (c) {
  var wave = (c.age === 1 && ['brown', 'grey', 'blue', 'red'].indexOf(c.col) >= 0) ? 1 : 2;
  add(c.stem, 'card', 500, 700, '5:7', false, wave, 'Card face: ' + c.nm + ' (age ' + c.age + ', ' + c.col + '; the name, cost and numbers are drawn by code over the picture)', 'Picture for a game card: ' + c.art + '. Fill the whole tall frame, strong focal subject in the middle, the top fifth and bottom fifth kept quiet for overlays.');
});
D.WONDERS.forEach(function (w) { add(w.stem, 'card', 700, 500, '7:5', false, 2, 'Wonder card: ' + w.nm, 'Picture for a wonder card: ' + w.art + '. Fill the whole wide frame, monumental scale, strong focal subject in the middle.'); });
D.TOKENS.forEach(function (t) { add(t.stem, 'token', 256, 256, '1:1', true, 2, 'Progress token: ' + t.nm, 'A round bronze medallion token showing ' + t.art); });
// wave 3: polish
add('result-victory', 'bg', 2048, 1152, '16:9', false, 3, 'Result screen when you win', 'A triumphant throne room with a golden sunbeam, confetti of petals, banners raised, calm centre');
add('result-defeat', 'bg', 2048, 1152, '16:9', false, 3, 'Result screen when you lose', 'A quiet empty throne room at dusk, long shadows, a single fallen banner, calm centre');
[['wood', 'a neat bundle of three logs'], ['clay', 'a lump of red clay with a thumbprint'], ['stone', 'a squared grey stone block'], ['glass', 'a small blue glass flask'], ['papyrus', 'a rolled papyrus scroll tied with string']].forEach(function (r) { add('res-' + r[0], 'icon', 256, 256, '1:1', true, 3, 'Resource icon: ' + r[0], 'An icon of ' + r[1]); });
[['wheel', 'a spoked cart wheel'], ['scale', 'a small balance scale'], ['quill', 'a feather quill and inkpot'], ['mortar', 'a mortar with a pestle'], ['sundial', 'a stone sundial'], ['globe', 'a small armillary globe'], ['law', 'a stone tablet with a carved scale']].forEach(function (r) { add('sci-' + r[0], 'icon', 256, 256, '1:1', true, 3, 'Science symbol: ' + r[0], 'An icon of ' + r[1]); });
add('icon-shield', 'icon', 256, 256, '1:1', true, 3, 'Shield (military) icon', 'A round bronze war shield with a red boss');
add('icon-vp', 'icon', 256, 256, '1:1', true, 3, 'Victory point icon', 'A gold laurel wreath star');
add('fx-lift-dust', 'fx', 512, 512, '1:1', true, 3, 'Dust puff when a card lifts', 'A soft puff of warm sand-coloured dust');
add('fx-coin-burst', 'fx', 512, 512, '1:1', true, 3, 'Coin burst when coins are won', 'A small fan of flying gold coins');
add('fx-pawn-glow', 'fx', 512, 512, '1:1', true, 3, 'Glow behind the sliding pawn', 'A soft golden radial glow with tiny sparks');
var seen = {}; items.forEach(function (i) { if (seen[i.stem]) throw new Error('dup ' + i.stem); seen[i.stem] = 1; if (!/^[a-z0-9-]+$/.test(i.stem)) throw new Error('bad stem ' + i.stem); });
fs.writeFileSync(path.join(__dirname, 'assets.json'), JSON.stringify({ style: STYLE, items: items }, null, 1));
var out = path.join(__dirname, '..', 'next-wave', 'flow-2d', 'twin-thrones'); fs.mkdirSync(out, { recursive: true });
[1, 2, 3].forEach(function (w) {
  var sub = items.filter(function (i) { return i.wave === w; }), all = { cards: {} }, wide = { cards: {} }, tall = { cards: {} }, sq = { cards: {} };
  sub.forEach(function (i) { var t = STYLE + ' ' + i.prompt; all.cards[i.stem] = t; (i.w > i.h ? wide : i.h > i.w ? tall : sq).cards[i.stem] = t; });
  fs.writeFileSync(path.join(out, 'prompts-wave' + w + '.json'), JSON.stringify(all, null, 1));
  [['wide', wide], ['tall', tall], ['square', sq]].forEach(function (p) { if (Object.keys(p[1].cards).length) fs.writeFileSync(path.join(out, 'prompts-wave' + w + '-' + p[0] + '.json'), JSON.stringify(p[1], null, 1)); });
});
var md = '# Twin Thrones art slots\n\nEvery picture the game shows is a named slot. Drop `<stem>.webp` (or png) in, rebuild, done. Source of truth: `assets.json` (made by `node gen-assets.js` from `src/data.js`). No text, letters or numbers go inside any picture: the game draws names, costs and numbers over it.\n\n';
md += 'Counts: ' + [1, 2, 3].map(function (w) { return 'wave ' + w + ' = ' + items.filter(function (i) { return i.wave === w; }).length; }).join(', ') + ', total ' + items.length + '.\n\n';
md += '## Drop-in steps (owner)\n1. Generate a wave in Google Flow with `games-src/next-wave/flow-2d/twin-thrones/prompts-waveN*.json` (the `-tall`, `-wide`, `-square` files group the same prompts by shape). Save each result as `<stem>.png` (the key name in the json).\n2. Put the files in `assets-inbox/twin-thrones/` and run `python3 games-src/scripts/ingest-assets.py` (`--check` first = dry run). It crops to the size in the table and writes `games/twin-thrones/media/<stem>.webp`.\n3. Rebuild with `python3 games-src/scripts/build-all.py twin-thrones`; the page picks up every stem whose file exists. No code change.\n\n';
[1, 2, 3].forEach(function (w) { md += '## Wave ' + w + '\n\n| stem | kind | size | alpha | slot |\n|---|---|---|---|---|\n'; items.filter(function (i) { return i.wave === w; }).forEach(function (i) { md += '| ' + i.stem + ' | ' + i.kind + ' | ' + i.w + 'x' + i.h + ' (' + i.ratio + ') | ' + (i.alpha ? 'yes, white bg' : 'no') + ' | ' + i.slot + ' |\n'; }); md += '\n'; });
fs.writeFileSync(path.join(__dirname, 'ASSETS.md'), md);
console.log('items', items.length, [1, 2, 3].map(function (w) { return items.filter(function (i) { return i.wave === w; }).length; }).join('/'));
