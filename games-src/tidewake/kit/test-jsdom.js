// jsdom smoke test: no WebGL -> 2D SVG fallback must draw everything and the API must never throw.
const { JSDOM } = require('../../node_modules/jsdom'); const fs = require('fs');
const dom = new JSDOM('<!doctype html><body><canvas id="c"></canvas><div id="fb"></div></body>', { runScripts: 'outside-only', pretendToBeVisual: true });
const w = dom.window; w.eval(fs.readFileSync(__dirname + '/kit.js', 'utf8'));
const K = w.TWKit; let fails = 0; const ok = (c, m) => { if (!c) { fails++; console.log('FAIL', m); } else console.log('ok  ', m); };
const fb = w.document.getElementById('fb'); let clicked = null;
const r = K.init(w.document.getElementById('c'), { fallback: fb, fonts: false, onClick: p => { clicked = p; } });
ok(r.ok === false && r.mode === '2d', 'falls back to 2d without WebGL');
const L = K.layouts(); ok(L.length === 35 && L.every(l => l.length === 4), '35 layouts of 4 paths');
(async () => {
  await K.placeTile(1, 1, { paths: L[3] }); await K.placeTile(2, 1, { paths: L[9], rot: 1 });
  ok(fb.querySelectorAll('svg path').length > 40, 'svg board + tiles drawn');
  await K.placeLeviathan(3, 2, { arrows: [{ dir: 0, n: 2 }, { dir: 2, n: 5 }] });
  const e = K.edgeSquare('top', 3); K.addShip('a', { color: 2, c: e.c, r: e.r, port: e.ports[0], splash: false }); K.addShip('b', { color: 5, c: 5, r: 3, port: 3, splash: false });
  ok(fb.querySelectorAll('[data-ship]').length === 2, '2 ships drawn');
  K.riftGate(0, 5, true); K.maelstrom(4, 1, true); K.rogueMarker('left', 3, true); K.highlightLine({ row: 3 }); K.rogueWaveTile(5, 5, true); K.setLegal([{ c: 0, r: 0 }]);
  K.ghost(3, 3, L[5], { rot: 1, enter: 0 }); ok(fb.querySelectorAll('svg').length >= 1, 'specials + ghost without throwing');
  const tr = K.trace({ '1,1': K.rotate(L[3], 0) }, 1, 1, 0); ok(Array.isArray(tr), 'trace returns steps');
  await K.moveShip('a', [{ c: 2, r: 0, from: 0, to: 5 }], { dur: .1 }); ok(true, 'moveShip resolves in 2d');
  await K.collide('a', 'b'); await K.sinkShip('a'); ok(!K.getState().ships.some(s => s.id === 'a'), 'sunk ship removed');
  await K.rollDice([{ kind: 'gold', value: 4 }, { kind: 'blue', value: 2 }]); ok(fb.querySelectorAll('[data-die]').length === 2, 'dice shown');
  await K.cannonShot({ from: 'b', to: { c: 2, r: 2 } }); await K.rogueWaveSweep({ edge: 'left', index: 3 }); await K.destroyTile(1, 1);
  ok(K.getState().tiles.length === 1, 'tile destroyed');
  const p = K.pick(0, 0); ok(p === null || typeof p === 'object', 'pick works');
  ok(K.cardSVG(L[0], { rot: 2 }).indexOf('<svg') === 0 && K.cardURL(L[0]).indexOf('data:image/svg') === 0, 'card images');
  ok(typeof K.stats().frames === 'number' && typeof K.isAnimating() === 'boolean', 'stats/isAnimating');
  K.clearBoard(); ok(K.getState().ships.length === 0, 'clearBoard');
  console.log(fails ? fails + ' FAILED' : 'ALL OK'); process.exit(fails ? 1 : 0);
})().catch(e => { console.log('EXC', e); process.exit(1); });
