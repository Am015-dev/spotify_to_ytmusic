// Twin Thrones data: cards, wonders, progress tokens, pyramid layouts. All names/text original. (FLAG: none)
var TT = (typeof TT !== 'undefined') ? TT : {};
(function () {
  var RES = ['wood', 'clay', 'stone', 'glass', 'papyrus'];
  var RC = { W: 'wood', C: 'clay', S: 'stone', G: 'glass', P: 'papyrus' };
  function cost(s) { var o = {}; (s || '').split(' ').forEach(function (t) { if (!t) return; if (t[0] === '$') o.coin = +t.slice(1); else o[RC[t[0]]] = +t.slice(1); }); return o; }
  var COLS = ['brown', 'grey', 'blue', 'green', 'yellow', 'red', 'purple'];
  var CARDS = [];
  // [id, name, age, col, cost, extra, art subject]
  function A(id, nm, age, col, c, x, art) { var o = { id: id, nm: nm, age: age, col: col, cost: cost(c), art: art }; for (var k in x) o[k] = x[k]; o.stem = id; CARDS.push(o); }
  var P = function (r, n) { var o = {}; o[r] = n; return o; };
  // ---- Age I (23)
  A('a1-timber-stand', 'Timber Stand', 1, 'brown', '', { prod: P('wood', 1) }, 'a stack of felled pine logs beside a rope hoist');
  A('a1-hewing-camp', 'Hewing Camp', 1, 'brown', '$1', { prod: P('wood', 1) }, 'woodcutters with axes in a sunlit clearing');
  A('a1-mud-basin', 'Mud Basin', 1, 'brown', '', { prod: P('clay', 1) }, 'a terracotta-red clay pool with wooden paddles');
  A('a1-brick-cut', 'Brick Cut', 1, 'brown', '$1', { prod: P('clay', 1) }, 'rows of drying mud bricks on a riverbank');
  A('a1-rock-face', 'Rock Face', 1, 'brown', '', { prod: P('stone', 1) }, 'a pale cliff with chisel marks and a sledge');
  A('a1-gravel-pit', 'Gravel Pit', 1, 'brown', '$1', { prod: P('stone', 1) }, 'a deep stone pit with a rope ladder and baskets');
  A('a1-glass-kiln', 'Glass Kiln', 1, 'grey', '$1', { prod: P('glass', 1) }, 'a glowing beehive kiln with blue glass bottles');
  A('a1-reed-press', 'Reed Press', 1, 'grey', '$1', { prod: P('papyrus', 1) }, 'reed bundles pressed into pale sheets on a frame');
  A('a1-open-stage', 'Open Stage', 1, 'blue', '', { vp: 3, gives: 'mask' }, 'a semicircle stone stage with two painted masks');
  A('a1-shrine', 'Wayside Shrine', 1, 'blue', '', { vp: 3, gives: 'moon' }, 'a small roadside shrine under a silver crescent');
  A('a1-bathhouse', 'Bathhouse', 1, 'blue', 'S1', { vp: 3, gives: 'drop' }, 'a tiled bathing pool with rising steam');
  A('a1-herb-garden', 'Herb Garden', 1, 'green', 'G1', { sci: 'wheel', vp: 1 }, 'a walled herb garden with a cart wheel by the gate');
  A('a1-weights-hall', 'Weights Hall', 1, 'green', 'P1', { sci: 'scale', vp: 1 }, 'a bronze balance scale on a merchant table');
  A('a1-scribe-room', 'Scribe Room', 1, 'green', '$2', { sci: 'quill', gives: 'book' }, 'a scribe at a slanted desk with a long quill');
  A('a1-remedy-shop', 'Remedy Shop', 1, 'green', '$2', { sci: 'mortar', gives: 'gear' }, 'a stone mortar and pestle among hanging herbs');
  A('a1-roadside-inn', 'Roadside Inn', 1, 'yellow', '', { coin: 4, gives: 'jug' }, 'a cosy inn with a lantern and a pile of coins');
  A('a1-timber-depot', 'Timber Depot', 1, 'yellow', '$3', { price: ['wood'] }, 'a harbour warehouse stacked with timber and a price tablet');
  A('a1-clay-depot', 'Clay Depot', 1, 'yellow', '$3', { price: ['clay'] }, 'a covered market stall piled with clay jars');
  A('a1-stone-depot', 'Stone Depot', 1, 'yellow', '$3', { price: ['stone'] }, 'a loading dock with cut stone blocks and a crane');
  A('a1-pony-pen', 'Pony Pen', 1, 'red', 'W1', { shields: 1, gives: 'horse' }, 'a fenced paddock with a saddled pony and a spear rack');
  A('a1-barrack-yard', 'Barrack Yard', 1, 'red', 'C1', { shields: 1, gives: 'sword' }, 'a drilling yard with soldiers and crossed swords');
  A('a1-stake-fence', 'Stake Fence', 1, 'red', '$2', { shields: 1, gives: 'tower' }, 'a sharpened wooden palisade around a camp');
  A('a1-lookout', 'Lookout', 1, 'red', '', { shields: 1 }, 'a lone wooden watchtower on a hill at dusk');
  // ---- Age II (23)
  A('a2-sawpit', 'Sawpit', 2, 'brown', '$2', { prod: P('wood', 2) }, 'two sawyers cutting planks over a pit, big timber yard');
  A('a2-kiln-yard', 'Kiln Yard', 2, 'brown', '$2', { prod: P('clay', 2) }, 'a busy brickworks with two smoking kilns');
  A('a2-deep-quarry', 'Deep Quarry', 2, 'brown', '$2', { prod: P('stone', 2) }, 'a stepped quarry with oxen dragging large blocks');
  A('a2-glassblower', 'Glassblower', 2, 'grey', '', { prod: P('glass', 1) }, 'a glassblower shaping a glowing amber flask');
  A('a2-drying-rack', 'Drying Rack', 2, 'grey', '', { prod: P('papyrus', 1) }, 'long racks of drying papyrus sheets in the wind');
  A('a2-judges-hall', "Judges' Hall", 2, 'blue', 'W2 G1', { vp: 5 }, 'a columned hall with three judges on a raised bench');
  A('a2-hero-monument', 'Hero Monument', 2, 'blue', 'C2', { vp: 4, from: 'mask', gives: 'column' }, 'a tall statue of a spear-bearing hero on a plinth');
  A('a2-sun-temple', 'Sun Temple', 2, 'blue', 'P1 W1', { vp: 4, from: 'moon', gives: 'sun' }, 'a golden-roofed temple with a sun disc over the door');
  A('a2-water-arch', 'Water Arch', 2, 'blue', 'S3', { vp: 5, from: 'drop' }, 'a tall stone aqueduct arch carrying a bright stream');
  A('a2-podium', "Speaker's Podium", 2, 'blue', 'S1 W1', { vp: 4, gives: 'podium' }, 'a carved stone podium before a crowded plaza');
  A('a2-star-gazers', 'Star Gazers', 3, 'green', 'W2 G1 P1', { sci: 'sundial', vp: 3 }, 'a rooftop sundial and a tube pointed at the night sky');
  A('a2-chart-room', 'Chart Room', 3, 'green', 'S1 P2', { sci: 'globe', vp: 2, from: 'lamp' }, 'a table of sea charts with a small brass globe');
  A('a2-herbarium', 'Herbarium', 2, 'green', 'W1 P2', { sci: 'wheel', vp: 1, gives: 'harp' }, 'pressed plants on shelves and a spinning cart wheel');
  A('a2-measure-hall', 'Measure Hall', 2, 'green', 'W1 G2', { sci: 'scale', vp: 1, gives: 'lamp' }, 'a hall of standard weights and a carved ruler');
  A('a2-open-bazaar', 'Open Bazaar', 2, 'yellow', '$3 C1', { choice: ['glass', 'papyrus'] }, 'a crowded bazaar with glass beads and rolled scrolls');
  A('a2-caravan-post', 'Caravan Post', 2, 'yellow', '$2 G1 P1', { choice: ['wood', 'clay', 'stone'] }, 'a desert caravan resting at a post with loaded camels');
  A('a2-customs-quay', 'Customs Quay', 2, 'yellow', '$4', { price: ['glass', 'papyrus'] }, 'a toll gate on a quay with a ledger-keeper');
  A('a2-brewhouse', 'Brewhouse', 2, 'yellow', '', { coin: 6, gives: 'barrel' }, 'giant barrels and a foamy vat in a brewhouse');
  A('a2-horse-yard', 'Horse Yard', 2, 'red', 'C1 W1', { shields: 1, from: 'horse' }, 'riders breaking in horses in a training ring');
  A('a2-barracks', 'Great Barracks', 2, 'red', '$3', { shields: 1, from: 'sword' }, 'a long barracks hall with racks of shields');
  A('a2-archery-range', 'Archery Range', 2, 'red', 'S1 W1 P1', { shields: 2, gives: 'target' }, 'archers shooting at straw targets at sunrise');
  A('a2-parade-ground', 'Parade Ground', 2, 'red', 'C2 G1', { shields: 2, gives: 'helmet' }, 'a marching column with banners on a paved square');
  A('a2-city-wall', 'City Wall', 2, 'red', 'S2', { shields: 2 }, 'a thick crenellated city wall with a gate');
  // ---- Age III (20)
  A('a3-pantheon', 'Hall of Many Gods', 3, 'blue', 'C1 W1 P2', { vp: 6, from: 'sun' }, 'a grand domed hall ringed with small god statues');
  A('a3-gardens', 'Terrace Gardens', 3, 'blue', 'C2 W2', { vp: 6, from: 'column' }, 'stepped palace gardens with fountains and cypress trees');
  A('a3-town-hall', 'Council Hall', 3, 'blue', 'S3 W2', { vp: 7 }, 'a stately council hall with a bronze door and banners');
  A('a3-palace', 'Throne Palace', 3, 'blue', 'C1 S1 W1 G2', { vp: 7 }, 'a gleaming palace with towers on a hill');
  A('a3-obelisk', 'Sky Obelisk', 3, 'blue', 'S2 G1', { vp: 5 }, 'a single tall carved obelisk piercing the clouds');
  A('a3-fountain', 'Grand Fountain', 3, 'blue', 'C2 S1 P1', { vp: 5, from: 'podium' }, 'a grand plaza fountain with leaping stone dolphins');
  A('a3-planetarium', 'Planetarium', 3, 'green', 'S1 W1 G2', { sci: 'sundial', vp: 3 }, 'a domed observatory with a bronze orrery of planets');
  A('a3-globe-hall', 'Globe Hall', 3, 'green', 'C1 G1 P1', { sci: 'globe', vp: 2, from: 'harp' }, 'a hall dominated by a huge painted world globe');
  A('a3-scholar-court', 'Scholars\' Court', 2, 'green', 'S1 W1 G1', { sci: 'quill', vp: 2, from: 'book' }, 'scholars debating under an arcade with scroll cases');
  A('a3-apothecary-guild', 'Healers\' House', 2, 'green', 'C2 S1', { sci: 'mortar', vp: 2, from: 'gear' }, 'a healer binding a wound beside a wall of jars');
  A('a3-trade-chamber', 'Trade Chamber', 3, 'yellow', 'P2', { perCol: { cols: ['grey'], coin: 3 }, vp: 3 }, 'merchants sealing contracts in a grand chamber');
  A('a3-beacon-quay', 'Beacon Quay', 3, 'yellow', 'C2 G1', { perCol: { cols: ['yellow'], coin: 1 }, vp: 3, from: 'jug' }, 'a harbour tower with a burning beacon and ships');
  A('a3-sand-arena', 'Sand Arena', 3, 'yellow', 'C1 S1 W1', { perWonder: 2, vp: 3, from: 'barrel' }, 'a packed oval arena with a banner-waving crowd');
  A('a3-grand-port', 'Grand Port', 3, 'yellow', 'G1 P1 W1', { perCol: { cols: ['brown'], coin: 2 }, vp: 3 }, 'a wide port with stacked crates and many sails');
  A('a3-armory', 'Armory', 3, 'yellow', 'S2 G1', { perCol: { cols: ['red'], coin: 1 }, vp: 3 }, 'a vaulted armory of helmets, spears and shields');
  A('a3-bastion', 'Bastion', 3, 'red', 'S2 C1 P1', { shields: 2, from: 'tower' }, 'a heavy corner bastion with siege-proof towers');
  A('a3-siege-yard', 'Siege Yard', 3, 'red', 'W3 G1', { shields: 2, from: 'target' }, 'builders assembling a wooden siege tower');
  A('a3-arsenal', 'Arsenal', 3, 'red', 'C3 W2', { shields: 3 }, 'a vast arsenal with catapults under construction');
  A('a3-war-pavilion', 'War Pavilion', 3, 'red', '$8', { shields: 3 }, 'a general\'s red war tent among cavalry pickets');
  A('a3-high-fort', 'High Fort', 3, 'red', 'C2 S2', { shields: 2, from: 'helmet' }, 'a mountain fort bridged by a narrow stone causeway');
  // ---- Guilds (7)
  function G(id, nm, c, cols, art, x) { var o = { guild: { cols: cols, vp: 1, coin: 1 } }; for (var k in x) o.guild[k] = x[k]; A(id, nm, 3, 'purple', c, o, art); }
  G('g-merchants', "Merchants' League", 'C1 W1 G1 P1', ['yellow'], 'a guild banner over a table of stamped coins and weights');
  G('g-shipowners', "Shipowners' Union", 'C1 S1 G1 P1', ['brown', 'grey'], 'a fleet of painted sailing ships at anchor');
  G('g-builders', "Builders' Lodge", 'S2 C1 G1 W1', ['wonder'], 'masons raising a monument with a crane and plumb line', { vp: 2, coin: 0 });
  G('g-magistrates', "Magistrates' Bench", 'W2 C1 P1', ['blue'], 'robed magistrates seated in a half-circle');
  G('g-scientists', "Scholars' Circle", 'C2 W2', ['green'], 'a circle of scholars around a glowing brass instrument');
  G('g-tacticians', "Tacticians' Order", 'S2 C1 P1', ['red'], 'a war council around a sand-table map with markers');
  G('g-moneylenders', "Moneylenders' Hall", 'W2 S2', ['coins'], 'a vault door and chests spilling gold coins', { vp: 0, coin: 0, per3: 1 });
  var WONDERS = [];
  function Wn(id, nm, c, x, art, text) { var o = { id: id, stem: id, nm: nm, cost: cost(c), art: art, text: text }; for (var k in x) o[k] = x[k]; WONDERS.push(o); }
  Wn('w-bronze-titan', 'Bronze Titan', 'C3 G1', { vp: 3, shields: 2 }, 'a colossal bronze giant straddling a harbour mouth', '3 points, 2 shields');
  Wn('w-sky-tomb', 'Sky Tomb', 'S3 P1', { vp: 9 }, 'a huge stepped stone pyramid at sunset', '9 points');
  Wn('w-moon-grove', 'Moon Grove', 'W1 S1 G1 P1', { coin: 12, again: 1 }, 'a silver-lit sacred grove with a white temple', '12 coins, play again');
  Wn('w-terraced-orchard', 'Terraced Orchard', 'W2 G1 P1', { vp: 3, coin: 6, again: 1 }, 'hanging terraces of fruit trees and waterfalls', '3 points, 6 coins, play again');
  Wn('w-archive-of-dust', 'Archive of Dust', 'W3 G1 P1', { vp: 4, library: 1 }, 'a vast library hall with towering scroll shelves', '4 points, pick a progress token from 3');
  Wn('w-marble-barrow', 'Marble Barrow', 'C2 G2 P1', { vp: 2, revive: 1 }, 'a gleaming white tomb with mourning statues', '2 points, rebuild a discarded card free');
  Wn('w-stone-riddle', 'Stone Riddle', 'S1 C1 G2', { vp: 6, again: 1 }, 'a giant stone beast with a woman\'s face in the desert', '6 points, play again');
  Wn('w-beacon-isle', 'Beacon Isle', 'P2 S1 W1', { vp: 4, choice: ['wood', 'clay', 'stone'] }, 'a tall lighthouse on a rocky isle at night', '4 points, 1 raw material of your choice each turn');
  Wn('w-grand-arena', 'Grand Arena', 'S2 W1 G1', { vp: 3, shields: 1, destroy: 'grey' }, 'a roaring chariot arena beneath a huge banner', '3 points, 1 shield, discard a rival grey card');
  Wn('w-thunder-idol', 'Thunder Idol', 'W1 C1 S1 P2', { vp: 3, shields: 1, destroy: 'brown' }, 'a towering ivory-and-gold idol holding lightning', '3 points, 1 shield, discard a rival brown card');
  Wn('w-merchant-road', 'Merchant Road', 'S2 C2 P1', { vp: 3, coin: 3, steal: 3, again: 1 }, 'a long paved road lined with statues and mule trains', '3 points, +3 coins, rival loses 3, play again');
  Wn('w-sunken-harbor', 'Sunken Harbor', 'W2 S1 C1', { vp: 2, again: 1, choice: ['glass', 'papyrus'] }, 'a sheltered harbour with sunken mosaic quays', '2 points, play again, 1 glass or papyrus each turn');
  var TOKENS = [
    { id: 't-agriculture', stem: 't-agriculture', nm: 'Fertile Fields', vp: 4, coin: 6, text: '6 coins now, 4 points', art: 'golden wheat fields with a plough ox' },
    { id: 't-architecture', stem: 't-architecture', nm: 'Master Builders', text: 'Wonders cost 2 fewer resources', art: 'a drafting compass over a stone blueprint' },
    { id: 't-economy', stem: 't-economy', nm: 'Open Trade', text: "Rival's trade payments go to you", art: 'two merchants shaking hands over a scale' },
    { id: 't-law', stem: 't-law', nm: 'Code of Law', sci: 'law', text: 'Counts as a science symbol', art: 'a stone tablet with a balance carved on it' },
    { id: 't-masonry', stem: 't-masonry', nm: 'Fine Masonry', text: 'Blue cards cost 2 fewer resources', art: 'a mason fitting a carved cornerstone' },
    { id: 't-mathematics', stem: 't-mathematics', nm: 'Number Lore', text: '3 points per progress token, at game end', art: 'an abacus beside a counting board' },
    { id: 't-philosophy', stem: 't-philosophy', nm: 'Deep Thought', vp: 7, text: '7 points', art: 'a bearded thinker under an olive tree' },
    { id: 't-strategy', stem: 't-strategy', nm: 'War Doctrine', text: 'New red cards give +1 shield', art: 'a general\'s map table with carved figures' },
    { id: 't-theology', stem: 't-theology', nm: 'Sacred Rites', text: 'Your wonders all let you play again', art: 'priests raising a flame at a hilltop altar' },
    { id: 't-urbanism', stem: 't-urbanism', nm: 'City Planning', coin: 6, text: '6 coins now, +4 coins whenever you build by chain', art: 'a grid-plan town seen from above with new roofs' }
  ];
  // Pyramid layouts: rows of [x positions, faceUp]. A card (r,x) is covered by cards at (r+1, x-1) and (r+1, x+1).
  function row(xs, up) { return { xs: xs, up: up }; }
  var LAYOUT = {
    1: [row([-1, 1], 1), row([-2, 0, 2], 0), row([-3, -1, 1, 3], 1), row([-4, -2, 0, 2, 4], 0), row([-5, -3, -1, 1, 3, 5], 1)],
    2: [row([-5, -3, -1, 1, 3, 5], 1), row([-4, -2, 0, 2, 4], 0), row([-3, -1, 1, 3], 1), row([-2, 0, 2], 0), row([-1, 1], 1)],
    3: [row([-1, 1], 1), row([-2, 0, 2], 0), row([-3, -1, 1, 3], 1), row([-2, 2], 0), row([-3, -1, 1, 3], 1), row([-2, 0, 2], 0), row([-1, 1], 1)]
  };
  TT.RES = RES; TT.COLS = COLS; TT.CARDS = CARDS; TT.WONDERS = WONDERS; TT.TOKENS = TOKENS; TT.LAYOUT = LAYOUT;
  TT.BYID = {}; CARDS.concat(WONDERS, TOKENS).forEach(function (c) { TT.BYID[c.id] = c; });
  TT.SCI = ['wheel', 'scale', 'quill', 'mortar', 'sundial', 'globe', 'law'];
})();
if (typeof module !== 'undefined') module.exports = TT;
