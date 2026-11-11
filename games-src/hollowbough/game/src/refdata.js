// Component reference for Hollowbough in the shared GX.reference format (JSON-safe, so node can read it too:
// the shelf-wide reference page is generated from the same function).
//   HB.refSections(DATA) -> [{id, title, items:[{id, name, count, text, tags, meta, extra, pic}]}]
// `pic` says what to draw ({card: instance id} or {place, i} ...); the page turns it into a picture.
(function (g) {
  var HB = g.HB = g.HB || {};
  var RES = ['twig', 'resin', 'pebble', 'berry'];
  var TYPE = { traveler: 'Traveler', production: 'Production', destination: 'Destination', governance: 'Governance', prosperity: 'Prosperity' };
  var COLOUR = { traveler: 'tan', production: 'green', destination: 'red', governance: 'blue', prosperity: 'purple' };
  var HELP = { traveler: 'Acts once when played.', production: 'Acts when played, then again every Spring and Autumn.', destination: 'A place in your city where you can send a worker.', governance: 'Gives a lasting bonus or discount.', prosperity: 'Scores bonus points at the end of the game.' };
  function rname(r, n) { return r === 'berry' ? (n === 1 ? 'berry' : 'berries') : r === 'resin' ? 'resin' : (n === 1 ? r : r + 's'); }
  function cost(c) { var a = []; RES.forEach(function (r) { if (c && c[r]) a.push(c[r] + ' ' + rname(r, c[r])); }); return a.join(', ') || 'free'; }
  HB.refSections = function (D) {
    D = D || HB.DATA;
    var byKey = {}; D.cards.forEach(function (c) { byKey[c.key] = c; });
    var norm = function (k) { return String(k || '').replace(/_/g, ''); };
    var find = function (k) { if (byKey[k]) return byKey[k]; var n = norm(k); for (var x in byKey) if (norm(x) === n) return byKey[x]; return null; };
    var first = 0, cards = [];
    D.cards.forEach(function (c, i) {
      var tags = [TYPE[c.type], c.kind === 'critter' ? 'Critter' : 'Construction', c.unique ? 'Unique' : 'Common'];
      var pair;
      if (c.kind === 'critter') { var l = c.linked === 'any' ? null : find(c.linked); pair = c.linked === 'any' ? 'Free with any construction that has an open slot' : l ? 'Free if you own ' + l.name + ' with no token on it' : ''; }
      else { var crit = D.cards.filter(function (x) { return x.kind === 'critter' && (norm(x.linked) === norm(c.key)); }).map(function (x) { return x.name; }); pair = c.linked === 'any' ? 'Lets you play any one critter for free (once)' : crit.length ? 'Lets you play ' + crit.join(' or ') + ' for free (once)' : ''; }
      cards.push({ id: 'c' + i, name: c.name, count: c.copies, text: c.text, tags: tags,
        meta: 'Costs ' + cost(c.cost) + ' · ' + c.pts + ' point' + (c.pts === 1 ? '' : 's') + ' · ' + COLOUR[c.type],
        extra: [HELP[c.type], pair ? pair + '.' : ''].filter(Boolean).join(' '), pic: { card: first } });
      first += c.copies;
    });
    var places = [];
    D.basic.forEach(function (b, i) { places.push({ id: 'b' + i, name: b.name, count: 1, text: b.text.replace(/ Shared\.$/, ''), tags: ['Basic place', b.shared ? 'Shared' : 'One worker'], meta: b.shared ? 'Any number of workers' : 'One worker only', pic: { place: 'basic', i: i } }); });
    D.forest.forEach(function (f, i) { places.push({ id: 'f' + i, name: f.name, count: 1, text: f.text, tags: ['Forest place', 'One worker'], meta: 'Forest card: 3 are dealt in a 2-player game, 4 with 3 or 4 players. One worker (two in a 4-player game).', pic: { place: 'forest', i: i } }); });
    places.push({ id: 'haven', name: D.haven.name, count: 1, text: D.haven.text.replace(/ Shared\.$/, ''), tags: ['Basic place', 'Shared'], meta: 'Any number of workers', pic: { place: 'haven' } });
    places.push({ id: 'road', name: D.journeyName, count: D.journey.length, text: 'Autumn only. Discard ' + D.journey.map(function (j) { return j.discard; }).join(', ') + ' cards from your hand; that worker stays for the rest of the game and scores the same number of points. Only the 2-point spot takes more than one worker.', tags: ['Basic place', 'Autumn'], meta: D.journey.length + ' spots: ' + D.journey.map(function (j) { return j.points + ' pts'; }).join(', '), pic: { place: 'journey' } });
    var events = [];
    D.basicEvents.forEach(function (e, i) { events.push({ id: 'e' + i, name: e.name, count: 1, text: e.text, tags: ['Basic event', e.pts + ' points'], meta: 'Always on the board · claimed with a worker', pic: { event: 'b', i: i } }); });
    D.specialEvents.forEach(function (e, i) {
      var req = (e.req || []).map(function (k) { var c = find(k); return c ? c.name : null; }).filter(Boolean);
      events.push({ id: 's' + i, name: e.name, count: 1, text: e.text, tags: ['Special event', e.pts ? e.pts + ' points' : 'Points vary'], meta: (req.length ? 'Needs ' + req.join(' and ') + ' in your city' : 'See the text') + ' · 4 of the 16 are dealt each game', pic: { event: 's', i: i } });
    });
    var C = D.components || {}, R = C.resources || {}, box = [];
    box.push({ id: 'x-deck', name: 'Cards', count: C.deck_cards || 128, text: D.cards.length + ' different cards. Unique cards can be in a city only once; common cards any number of times.', tags: ['Box'] });
    box.push({ id: 'x-workers', name: 'Workers', count: C.workers_total || 24, text: (C.workers_per_player || 6) + ' per player: 2 at the start, +1 in Spring, +1 in Summer, +2 in Autumn.', tags: ['Box'] });
    RES.forEach(function (r) { if (R[r]) box.push({ id: 'x-' + r, name: r === 'berry' ? 'Berries' : r === 'resin' ? 'Resin' : r[0].toUpperCase() + r.slice(1) + 's', count: R[r], text: 'A resource used to pay for cards.', tags: ['Box', 'Resource'], pic: { res: r } }); });
    var pt = C.point_tokens || {};
    box.push({ id: 'x-points', name: 'Point tokens', count: (pt['1pt'] || 0) + (pt['3pt'] || 0), text: (pt['1pt'] || 0) + ' worth 1 point and ' + (pt['3pt'] || 0) + ' worth 3 points.', tags: ['Box'], pic: { point: 1 } });
    box.push({ id: 'x-occ', name: 'Occupied tokens', count: C.occupied_tokens || 20, text: 'Mark a construction whose free critter slot has been used.', tags: ['Box'], pic: { occ: 1 } });
    box.push({ id: 'x-die', name: 'Solo die', count: 1, text: 'An eight-sided die that tells ' + (D.soloName || 'the solo rival') + ' which meadow card to take.', tags: ['Box', 'Solo'] });
    return [
      { id: 'cards', title: 'Cards', items: cards },
      { id: 'places', title: 'Places', items: places },
      { id: 'events', title: 'Events', items: events },
      { id: 'box', title: 'In the box', items: box }
    ];
  };
  if (typeof module === 'object' && module.exports) module.exports = HB.refSections;
})(typeof window !== 'undefined' ? window : globalThis);
