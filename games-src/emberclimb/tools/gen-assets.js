// Generates assets.json (the manifest), ../next-wave/flow-2d/emberclimb/prompts-wave{1,2,3}[-tall|-wide|-square].json and ASSETS.md from the data tables.
// Re-run after changing cards/enemies/relics: node tools/gen-assets.js
var fs = require('fs'), path = require('path');
var src = ['data.js', 'engine.js', 'ai.js'].map(function (f) { return fs.readFileSync(path.join(__dirname, '..', 'src', f), 'utf8'); }).join('\n') + '\nmodule.exports=EC;';
var m = { exports: {} }; new Function('module', src)(m); var EC = m.exports, D = EC.D;
var STYLE = 'Hand-painted 2D dark-fantasy storybook illustration for a deck-building card game, warm ember-orange and deep charcoal palette with cool blue accents, bold readable silhouettes, soft painterly shading, clean confident edges, flat 2D view (no 3D render, no photo), absolutely no text, no letters, no numbers, no watermark.';
var items = [];
function add(stem, kind, w, h, ratio, alpha, wave, slot, prompt) { items.push({ stem: stem, kind: kind, w: w, h: h, ratio: ratio, alpha: alpha, wave: wave, slot: slot, prompt: prompt }); }
var WH = 'on a flat plain white background, one single object centred with generous margin, no ground shadow';
// ---- backgrounds (9:16, cover-fitted so any screen crops from the centre)
var BG = [
  ['bg-title', 1, 'Title screen', 'a lone glowing tower of dark stone rising into an ember-lit stormy sky, tiny campfire at its foot, a winding path leading up, empty sky area in the upper third'],
  ['bg-map', 1, 'Map screen', 'a vertical parchment-and-slate map of a mountain climb, faded paths and ink-stained clouds, calm empty centre where nodes sit'],
  ['bg-battle-1', 1, 'Fight 1 (floors 1,4,7)', 'a torchlit mossy dungeon hall seen head-on, stone floor and two pillars, empty centre for combatants'],
  ['bg-battle-2', 2, 'Fight 2 (floors 2,5,8)', 'a damp swamp ruin with broken arches and glowing mushrooms, empty centre for combatants'],
  ['bg-battle-3', 2, 'Fight 3 (floors 3,6,9)', 'a high rope-bridge terrace at dusk between two stone towers, empty centre for combatants'],
  ['bg-elite', 2, 'Elite fights', 'a red-lit arena of cracked obsidian with chains hanging from above, ominous, empty centre'],
  ['bg-boss-mire-behemoth', 2, 'Boss: mire behemoth', 'a vast sunken marsh cavern with giant reeds and pale lights in the fog, empty centre'],
  ['bg-boss-ashen-wraith', 2, 'Boss: ashen wraith', 'a burnt cathedral nave full of drifting ash and tiny candle flames, empty centre'],
  ['bg-boss-gate-colossus', 2, 'Boss: gate colossus', 'a colossal stone gateway courtyard with glowing runes in the walls, empty centre'],
  ['bg-reward', 2, 'Reward and treasure screens', 'a quiet stone alcove with a draped table and a soft golden light from above, dark edges, calm empty centre'],
  ['bg-rest', 2, 'Campfire screen', 'a cosy campfire clearing under tall dark pines, sparks floating upward, calm empty centre'],
  ['bg-shop', 2, 'Shop screen', 'a lantern-lit wayside market stall with hanging pots and curtains, no people, calm empty centre'],
  ['bg-event', 2, 'Event screen', 'a misty forest crossroads with a faint glow between trees, calm empty centre'],
  ['bg-victory', 3, 'Win screen', 'sunrise breaking over the tower summit, golden clouds and a banner, hopeful, empty centre'],
  ['bg-defeat', 3, 'Lose screen', 'the tower base at night with a dying campfire and falling ash, sorrowful, empty centre']
];
BG.forEach(function (b) { add(b[0], 'bg', 1080, 1920, '9:16', false, b[1], b[2], STYLE + ' Vertical background scene: ' + b[3] + '. No characters, no UI.'); });
// ---- heroes
Object.keys(D.H).forEach(function (k) { var H = D.H[k]; add('hero-' + k, 'portrait', 768, 1024, '3:4', true, 1, 'Title select, battle panel (' + H.name + ')', STYLE + ' Full-body character portrait of ' + H.art + ', heroic three-quarter pose, ' + WH + '.'); });
// ---- card frames, back
[['attack', 'a red-orange ornate metal card frame with a sword motif'], ['skill', 'a blue steel ornate card frame with a shield motif'], ['power', 'a violet crystalline ornate card frame with a star motif'], ['status', 'a plain grey cracked stone card frame']].forEach(function (f) {
  add('frame-' + f[0], 'ui', 500, 700, '5:7', true, 1, 'Overlay on every ' + f[0] + ' card (window: upper half, y 14%-53%)', STYLE + ' Card frame overlay, ' + f[1] + ', portrait 5:7 rectangle, a large empty rectangular window in the upper half and a plain title bar strip above it, the window and the whole outside also flat plain white, no text.');
});
[['common', 'a small plain grey rivet gem'], ['uncommon', 'a small cut blue sapphire gem in a silver setting'], ['rare', 'a small radiant gold gem in an ornate gold setting']].forEach(function (g) {
  add('gem-' + g[0], 'ui', 500, 700, '5:7', true, 1, 'Rarity badge overlay at the card bottom centre (' + g[0] + ')', STYLE + ' Rarity badge for a card: ' + g[1] + ' centred near the bottom edge of an otherwise empty portrait 5:7 canvas, everything else flat plain white.');
});
add('card-back', 'card', 500, 700, '5:7', false, 1, 'Draw pile icon, card back', STYLE + ' Back of a playing card, symmetrical ornate ember-and-tower emblem on dark leather, portrait 5:7, full bleed.');
// ---- cards
D.ORDER.forEach(function (id) {
  var c = D.CARDS[id], wave = (c.rar === 's' || id === 'shiv') ? 1 : 2;
  var who = { w: 'warrior', s: 'rogue', a: 'automaton', m: 'monk', n: 'neutral', z: c.rar === 'k' ? 'curse' : 'status' }[c.hero];
  add(id, 'card', 512, 384, '4:3', false, wave, 'Card art window (' + c.name + ', ' + who + ')', STYLE + ' Card illustration, wide 4:3, one dramatic focal subject: ' + c.art + '. Full bleed, no border, no frame.');
});
// ---- enemies
Object.keys(D.ENEMIES).forEach(function (id) {
  var e = D.ENEMIES[id], w1 = ['mire-slug', 'gnawer', 'rust-tick', 'gape-grub', 'hex-acolyte'].indexOf(id) >= 0 ? 1 : 2;
  add('enemy-' + id, 'portrait', 768, 768, '1:1', true, w1, 'Battle enemy: ' + e.name + (e.boss ? ' (boss)' : e.elite ? ' (elite)' : ''), STYLE + ' Enemy creature portrait of ' + e.art + ', menacing facing the viewer, ' + WH + '.');
});
// ---- relics, potions, events
Object.keys(D.RELICS).forEach(function (id) { var r = D.RELICS[id]; add('relic-' + id, 'token', 256, 256, '1:1', true, r.rar === 's' ? 1 : 2, 'Relic icon: ' + r.name, STYLE + ' Game item icon of ' + r.art + ', ' + WH + '.'); });
Object.keys(D.POTIONS).forEach(function (id) { var p = D.POTIONS[id]; add('pot-' + id, 'token', 256, 256, '1:1', true, 2, 'Potion belt and rewards: ' + p.name, STYLE + ' Game item icon of a potion: ' + p.art + ', ' + WH + '.'); });
Object.keys(D.EVENTS).forEach(function (id) { var e = D.EVENTS[id]; add('event-' + id, 'card', 512, 384, '4:3', false, 2, 'Event screen picture: ' + e.name, STYLE + ' Wide 4:3 scene: ' + e.art + '. Full bleed, no border.'); });
// ---- map nodes
[['node-monster', 'two crossed swords', 1], ['node-elite', 'a horned skull with red glowing eyes', 1], ['node-rest', 'a small campfire', 1], ['node-shop', 'a coin purse and scales', 1], ['node-event', 'a glowing question-mark-shaped wisp (no real text)', 1], ['node-treasure', 'a closed ornate chest', 1], ['node-boss', 'a spiked golden crown on a dark spire', 1]].forEach(function (n) {
  add(n[0], 'token', 256, 256, '1:1', true, n[2], 'Map node icon', STYLE + ' Round map marker icon: ' + n[1] + ', ' + WH + '.');
});
// ---- intents, status, orbs, stances, small icons
[['intent-attack', 'a single red sword pointing down'], ['intent-attack-big', 'two large red crossed swords with a spark'], ['intent-defend', 'a blue shield'], ['intent-buff', 'a golden upward arrow with a glow'], ['intent-debuff', 'a purple skull with a thin curse swirl'], ['intent-weak', 'a purple downward arrow over a drooping sword'], ['intent-vuln', 'a red crosshair target ring'], ['intent-frail', 'a cracked dashed-outline blue shield'], ['intent-poison', 'a green poison droplet'], ['intent-burn', 'an orange flame'], ['intent-slime', 'a green slime blob with drips'], ['intent-daze', 'a yellow swirl of dizzy stars'], ['intent-unknown', 'a grey question mark in a dark bubble'], ['intent-sleep', 'a blue sleeping moon with drifting zigzag puffs (no letters)']].forEach(function (n) {
  add(n[0], 'icon', 128, 128, '1:1', true, 1, 'Enemy intent bubble', STYLE + ' Bold simple game icon: ' + n[1] + ', ' + WH + '.');
});
[['st-str', 'a clenched red fist'], ['st-vuln', 'a cracked orange shield'], ['st-weak', 'a drooping grey sword'], ['st-poison', 'a green droplet with a skull shape'], ['st-frail', 'a blue shield with a long crack']].forEach(function (n) { add(n[0], 'icon', 128, 128, '1:1', true, 2, 'Status chip icon', STYLE + ' Bold simple status icon: ' + n[1] + ', ' + WH + '.'); });
[['orb-L', 'a glowing blue lightning orb'], ['orb-F', 'a pale cyan frost orb with ice facets'], ['orb-D', 'a swirling violet-black dark orb']].forEach(function (n) { add(n[0], 'token', 128, 128, '1:1', true, 2, 'Automaton orb slot', STYLE + ' Game orb icon: ' + n[1] + ', ' + WH + '.'); });
[['stance-w', 'a red flame mask in rage'], ['stance-c', 'a calm blue lotus']].forEach(function (n) { add(n[0], 'icon', 128, 128, '1:1', true, 2, 'Monk stance badge', STYLE + ' Stance badge icon: ' + n[1] + ', ' + WH + '.'); });
add('icon-energy', 'ui', 256, 256, '1:1', true, 1, 'Energy orb behind the number', STYLE + ' Round glowing golden-orange energy orb with a bright core, ' + WH + '.');
add('icon-remove', 'icon', 128, 128, '1:1', true, 2, 'Shop: remove a card', STYLE + ' Icon of golden scissors cutting a card corner, ' + WH + '.');
// ---- wave 3: dice and fx
for (var i = 1; i <= 6; i++) add('die-' + i, 'token', 192, 192, '1:1', true, 3, 'Dice roll popup (face ' + i + ')', STYLE + ' A single six-sided die seen from the front, ivory with ember-orange pips, showing exactly ' + i + ' pip' + (i > 1 ? 's' : '') + ', ' + WH + '.');
[['fx-slash', 'a bright white-orange diagonal slash streak'], ['fx-block-burst', 'a blue shield-shaped burst of light'], ['fx-heal-sparkle', 'green-gold healing sparkles rising'], ['fx-poison-cloud', 'a small green poison cloud puff'], ['fx-fire-burst', 'a round orange fire burst']].forEach(function (n) { add(n[0], 'fx', 256, 256, '1:1', true, 3, 'Effect over a target', STYLE + ' Effect sprite: ' + n[1] + ', ' + WH + '.'); });
// ---- write
var out = path.join(__dirname, '..');
fs.writeFileSync(path.join(out, 'assets.json'), JSON.stringify({ style: STYLE, items: items }, null, 1));
var fd = path.join(out, '..', 'next-wave', 'flow-2d', 'emberclimb'); fs.mkdirSync(fd, { recursive: true });
var shape = function (it) { var r = it.w / it.h; return r < 0.99 ? 'tall' : r > 1.01 ? 'wide' : 'square'; };
[1, 2, 3].forEach(function (w) {
  var sel = items.filter(function (x) { return x.wave === w; }), groups = { all: sel, tall: [], wide: [], square: [] };
  sel.forEach(function (x) { groups[shape(x)].push(x); });
  Object.keys(groups).forEach(function (g) {
    if (!groups[g].length) return; var cards = {}; groups[g].forEach(function (x) { cards[x.stem] = x.prompt; });
    fs.writeFileSync(path.join(fd, 'prompts-wave' + w + (g === 'all' ? '' : '-' + g) + '.json'), JSON.stringify({ cards: cards, style: STYLE, notes: 'Emberclimb 2D wave ' + w + '. ' + (g === 'all' ? 'Every item of the wave; the -tall/-wide/-square files split it by ratio.' : g + ' images only.') + ' Save each result as media/<stem>.webp (alpha where the manifest says so). No text in any picture.', wave: w, meta: { game: 'emberclimb', count: groups[g].length } }, null, 1));
  });
});
// ASSETS.md
var md = ['# Emberclimb assets (2D only)', '', 'Every picture is a named slot: drop `games/emberclimb/media/<stem>.webp` and it is drawn, with no code change. Missing file = tidy code-drawn placeholder. Manifest: `assets.json` (regenerate everything with `node tools/gen-assets.js`). Prompts: `games-src/next-wave/flow-2d/emberclimb/prompts-wave{1,2,3}.json` (also split `-tall`, `-wide`, `-square`).', '', '## Fit rules', '- `card`, `bg`, `board` kinds are cover-fitted (cropped, never stretched). `portrait`, `token`, `icon`, `ui`, `fx` are contain-fitted (never stretched).', '- Card frames (`frame-*`, `gem-*`) are full-card overlays 5:7; their window sits at y 14%-53% of the card, full width. Card art (`4:3`) shows behind it.', '- Backgrounds are 9:16 and centre-cropped on wide screens. Keep the centre calm.', '', '## Drop files in (3 steps, see PLAYBOOK "Finished pictures from the owner")', '1. Generate a wave in Google Flow from the prompts file, key the white background to transparent where `alpha` is true, save as `<stem>.webp`.', '2. Put the files in `assets-inbox/emberclimb/` and run `python3 games-src/scripts/ingest-assets.py` (`--check` first = dry run).', '3. Tell the orchestrator; it runs the build-all deploy. The placeholders stay as fallback.', ''];
[1, 2, 3].forEach(function (w) {
  var sel = items.filter(function (x) { return x.wave === w; });
  md.push('## Wave ' + w + ' (' + sel.length + ' pictures)', '', '| stem | kind | size | ratio | alpha | slot |', '|---|---|---|---|---|---|');
  sel.forEach(function (x) { md.push('| ' + x.stem + ' | ' + x.kind + ' | ' + x.w + 'x' + x.h + ' | ' + x.ratio + ' | ' + (x.alpha ? 'yes' : 'no') + ' | ' + x.slot + ' |'); });
  md.push('');
});
var crp = path.join(__dirname, '..', 'temp-art', 'CREDITS.md'); if (fs.existsSync(crp)) md.push('', fs.readFileSync(crp, 'utf8'));
fs.writeFileSync(path.join(out, 'ASSETS.md'), md.join('\n'));
var cnt = [1, 2, 3].map(function (w) { return items.filter(function (x) { return x.wave === w; }).length; });
console.log('items', items.length, 'wave1/2/3', cnt.join('/'));
