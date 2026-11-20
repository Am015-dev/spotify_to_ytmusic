// Map validator: every scenario parses, doors join exactly 2 rooms, all rooms reachable, 4 starts in room 0, legend complete.
global.window = global; require('./src/data.js'); require('./src/scen.js'); require('./src/engine.js');
const D = WDD, E = WD; let bad = 0;
for (const s of D.SCEN_LIST) {
  const errs = [];
  const w = s.map.map(r => r.length);
  const m = E.parseMap(s, 4);
  const doors = Object.keys(m.hex).filter(k => m.hex[k].t === 'door');
  doors.forEach(k => { if (m.hex[k].rooms.length !== 2) errs.push('door ' + k + ' joins ' + m.hex[k].rooms.length + ' rooms'); });
  if (m.starts.length < 4) errs.push('starts ' + m.starts.length);
  const r0 = m.starts.length ? m.hex[m.starts[0]].room : -1;
  if (m.starts.some(k => m.hex[k].room !== r0)) errs.push('starts in several rooms');
  // reachability over doors
  const seen = { [r0]: 1 }; let ch = true;
  while (ch) { ch = false; doors.forEach(k => { const rs = m.hex[k].rooms; if (rs.some(r => seen[r]) && rs.some(r => !seen[r])) { rs.forEach(r => seen[r] = 1); ch = true; } }); }
  if (Object.keys(seen).length !== m.rooms) errs.push('rooms ' + m.rooms + ' reachable ' + Object.keys(seen).length);
  s.map.join('').split('').forEach(c => { if (/[a-zA-Z]/.test(c) && !'SDTXo'.includes(c) && !s.legend[c]) errs.push('no legend ' + c); });
  if (s.goal.t === 'loot' && (s.map.join('').split('T').length - 1) < s.goal.n) errs.push('not enough T');
  if ((s.goal.t === 'escape' || s.goal.t === 'reach') && !s.map.join('').includes('X')) errs.push('no X');
  if (s.goal.t === 'objs' && (s.map.join('').split('A').length - 1) < s.goal.n) errs.push('not enough A');
  if (m.place.some(p => m.hex[p.k].room === r0) && s.goal.t !== 'survive') errs.push('monster in start room');
  const counts = [2, 3, 4].map(np => E.parseMap(s, np).place.length);
  console.log((errs.length ? 'FAIL ' : 'ok   ') + String(s.id).padStart(2) + ' ' + s.n.padEnd(20) + ' rooms ' + m.rooms + ' monsters ' + counts.join('/') + ' ' + errs.join('; '));
  bad += errs.length ? 1 : 0;
}
console.log(bad ? bad + ' maps FAIL' : 'all ' + D.SCEN_LIST.length + ' maps ok'); process.exit(bad ? 1 : 0);
