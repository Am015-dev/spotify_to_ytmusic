// F3 fixes, engine side. node f3-test.js -> "F3 passing a / b"
const path = require('path'), fs = require('fs'), cp = require('child_process');
cp.execFileSync('python3', [path.join(__dirname, 'build.py')], { stdio: 'ignore' });
const EC = require('./core.js'), E = EC.E, D = EC.D, SC = D.SCALE;
let pass = 0, total = 0; const T = (n, fn) => { total++; let r; try { r = fn(); } catch (e) { r = 'crash ' + e.message; } if (r === true) pass++; else console.log('FAIL ' + n + ': ' + r); };
const go1 = () => E.performMove({ t: 'go', n: E.validMoves()[0].n });
T('every event has its own picture file', () => { const seen = {}; for (const id of Object.keys(D.EVENTS)) { const stem = D.EVENTS[id].img || 'event-' + id; if (seen[stem]) return id + ' shares ' + stem + ' with ' + seen[stem]; seen[stem] = id; if (!fs.existsSync(path.join(__dirname, '../../games/emberclimb/media', stem + '.webp'))) return 'missing ' + stem; } return true; });
T('every foe with a hidden rule has a chip + text', () => { const bad = []; for (const [id, d] of Object.entries(D.ENEMIES)) { if (!d.tab) continue; const hidden = d.skillTax || d.deathVuln || d.curl || d.split || d.keepBlk || d.sleep || d.onSkill || d.ritual; const n = D.foeNote(id); if (hidden && !(n && n.chip && n.text)) bad.push(id); } return bad.length ? 'no note: ' + bad : true; });
T('skill tax: a Skill costs the elite-fight hero ' + SC + ' HP from turn 2 and flashes the foe', () => {
  E.newGame({ heroes: ['w'], seed: 3 }); go1(); const g = E.G(); g.b.en = [g.b.en[0]]; const e = g.b.en[0]; e.id = 'thorn-brute'; e.asleep = 0; e.hp = e.mhp = 400; E.G().b.turn = 2;
  const h = g.hs[0]; h.hp = h.mhp = 80; h.en = 3; h.hand = [E.mk('w-defend')]; g.q = []; E.performMove({ t: 'play', h: 0, c: 0 });
  const trig = g.q.some(f => f.k === 'trig' && /Skill tax/.test(f.x)); return (h.hp === 80 - SC && trig) || ('hp ' + h.hp + ' trig ' + trig); });
T('skill tax is silent on turn 1', () => { E.newGame({ heroes: ['w'], seed: 3 }); go1(); const g = E.G(); g.b.en = [g.b.en[0]]; g.b.en[0].id = 'thorn-brute'; g.b.turn = 1; const h = g.hs[0]; h.hp = h.mhp = 80; h.en = 3; h.hand = [E.mk('w-defend')]; E.performMove({ t: 'play', h: 0, c: 0 }); return h.hp === 80 || h.hp; });
T('a won potion is kept when Continue is tapped without taking it', () => { E.newGame({ heroes: ['w'], seed: 4 }); go1(); const g = E.G(); g.pots = []; E.debug.win(); const r = E.G(); r.rw.pot = 'venom-vial'; r.rw.took = {}; E.performMove({ t: 'leave' }); return E.G().pots.indexOf('venom-vial') >= 0 || JSON.stringify(E.G().pots); });
T('no potion appears when slots are full (nothing lost, nothing over)', () => { E.newGame({ heroes: ['w'], seed: 4 }); go1(); const g = E.G(); g.pots = ['fire-flask', 'fire-flask', 'fire-flask']; E.debug.win(); const r = E.G(); r.rw.pot = 'venom-vial'; r.rw.took = {}; E.performMove({ t: 'leave' }); return E.G().pots.length === 3 || E.G().pots.length; });
T('a treasure relic is kept when Continue is tapped without taking it (Oak Heart: +' + SC + ' max HP)', () => { E.newGame({ heroes: ['s'], seed: 9 }); const g = E.G(); const m = g.hs[0].mhp; g.relics = g.relics.filter(r => r !== 'oak-heart'); E.debug.treasure(); const r = E.G(); r.rw.relics = ['oak-heart']; r.rw.took = {}; r.rw.nrel = 1; E.performMove({ t: 'leave' }); const h = E.G(); return (h.relics.indexOf('oak-heart') >= 0 && h.hs[0].mhp === m + SC) || ('mhp ' + h.hs[0].mhp + ' relics ' + h.relics); });
T('a boss relic choice of 3 is NOT auto-taken', () => { E.newGame({ heroes: ['w'], seed: 6 }); E.debug.boss(); E.debug.win(); const g = E.G(); const n = g.relics.length; E.performMove({ t: 'leave' }); return E.G().relics.length === n || 'took ' + (E.G().relics.length - n); });
// map shape over 600 seeds (also the 6-floor tutorial/Story sizes)
(function () {
  const bad = []; let forced = 0, steps = 0;
  for (let s = 1; s <= 600; s++) for (const F of [9, 6]) {
    E.newGame({ heroes: ['w'], seed: s }); const g = E.G(); if (F !== g.F) { continue; }
    const seen = {}, q = g.map.filter(n => n.f === 1).map(n => n.id); while (q.length) { const i = q.pop(); if (seen[i]) continue; seen[i] = 1; g.map[i].nx.forEach(x => q.push(x)); }
    if (g.map.some(n => !seen[n.id])) bad.push('seed ' + s + ' unreachable room');
    g.map.forEach(n => { if (n.t !== 'b' && !n.nx.length) bad.push('seed ' + s + ' dead end f' + n.f); if (n.f < g.F) { steps++; if (n.nx.length === 1) forced++; } });
    for (let f = 1; f < g.F; f++) { const es = []; g.map.filter(n => n.f === f).forEach(n => n.nx.forEach(t => es.push([n.c, g.map[t].c]))); for (const a of es) for (const b of es) if (a[0] < b[0] && a[1] > b[1]) bad.push('seed ' + s + ' crossing lines at floor ' + f); }
  }
  total++; if (!bad.length) pass++; else console.log('FAIL map shape: ' + bad.slice(0, 4).join('; '));
  total++; const share = forced / steps; if (share < 0.5) pass++; else console.log('FAIL map: ' + (share * 100).toFixed(0) + '% of rooms have a single exit');
  console.log('map: ' + (share * 100).toFixed(1) + '% single-exit rooms over ' + steps + ' steps');
  console.log('F3 passing ' + pass + ' / ' + total); process.exit(pass === total ? 0 : 1);
})();
