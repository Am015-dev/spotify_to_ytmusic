// ===================== part 8: the Descent (zones, oxygen, bosses with curses), character dialogs, Mara's training dive =====================
// The Descent and the boss curses are our own addition on top of the published rules (see ../rules-notes.md, "Descent mode").
// ---------- characters (code-drawn portraits; placeholders until painted art replaces them) ----------
const CHAR = {
  mara: { name: 'Mara', role: 'your old dive instructor', col: '#e9b44c' },
  eel: { name: 'Snapjaw the Eel', role: 'boss of the Sunlit Reef', col: '#6fbf73',
    intro: 'Sssso… fresh divers in MY reef. I bite when you least expect it. Every second trick I twist the rules!',
    hit: ['Ow! My tail!', 'Grrr… lucky trick.', 'Sssstop that!'], win: 'Hah! Back to the surface with you!', lose: 'Nooo… my reef… take it, then.' },
  witch: { name: 'The Kelp Witch', role: 'boss of the Kelp Forest', col: '#b27fd6',
    intro: 'Welcome to my garden, little lights. I put Lanterns to sleep and turn the tides upside down.',
    hit: ['You cut my kelp!', 'Hmph. A clever trick.', 'My garden… withers!'], win: 'Tangled at last. Swim home, little lights.', lose: 'My spells… unravelled. Pass, then.' },
  angler: { name: 'The Gloom Angler', role: 'boss of the Twilight Trench', col: '#5fa8d9',
    intro: 'Follow my little light… In my trench every colour bites, Lanterns doze, and the low ones rise.',
    hit: ['My lure! You dimmed it!', 'Ghhh… sharper than you look.', 'The dark remembers this!'], win: 'Into the dark you go. Forever.', lose: 'My light… goes out…' },
  leviathan: { name: 'The Leviathan', role: 'the deep itself', col: '#e05a5a',
    intro: 'I AM THE ABYSS. EVERY TRICK, MY CURSE. FINISH YOUR JOBS… IF YOU CAN.',
    hit: ['THE DEEP… TREMBLES.', 'YOU… WOUND ME?', 'IMPOSSIBLE!'], win: 'THE ABYSS KEEPS WHAT IT TAKES.', lose: 'THE LANTERNS… REACH… THE BOTTOM. YOU HAVE WON.' }
};
function portraitSVG(id, size) {
  const s = size || 96, w = (b) => '<svg viewBox="0 0 100 100" width="' + s + '" height="' + s + '" aria-hidden="true">' + b + '</svg>';
  const bg = c => '<defs><radialGradient id="pg' + id + '" cx="50%" cy="40%" r="65%"><stop offset="0" stop-color="' + c + '" stop-opacity=".55"/><stop offset="1" stop-color="#04122a"/></radialGradient></defs><circle cx="50" cy="50" r="49" fill="url(#pg' + id + ')" stroke="' + c + '" stroke-width="3"/>';
  if (id === 'mara') return w(bg('#e9b44c') +
    '<circle cx="50" cy="52" r="34" fill="#c98f35" stroke="#8a5a1c" stroke-width="3"/><circle cx="50" cy="52" r="24" fill="#bfe6f5" stroke="#8a5a1c" stroke-width="3"/>' +
    '<circle cx="50" cy="55" r="15" fill="#f1c7a0"/><path d="M36 50 Q50 34 64 50 Q60 42 50 41 Q40 42 36 50Z" fill="#e8e8e8"/><circle cx="45" cy="55" r="2.2" fill="#2b2b2b"/><circle cx="55" cy="55" r="2.2" fill="#2b2b2b"/>' +
    '<path d="M44 62 Q50 66 56 62" stroke="#7a3b2b" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="21" cy="52" r="4" fill="#8a5a1c"/><circle cx="79" cy="52" r="4" fill="#8a5a1c"/><circle cx="50" cy="19" r="4" fill="#8a5a1c"/><path d="M58 47 l6 -4" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>');
  if (id === 'eel') return w(bg('#6fbf73') +
    '<path d="M18 78 Q30 40 55 30 Q80 22 86 44 Q88 60 70 64 L40 70 Q30 74 26 84Z" fill="#4f9a55" stroke="#2c5e31" stroke-width="3"/>' +
    '<path d="M48 62 L86 50 L84 58 Z" fill="#7a1f1f"/><path d="M52 61 l3 -6 l3 5 l3 -6 l3 5 l3 -6 l3 5 l3 -6 l3 5" stroke="#fff" stroke-width="2" fill="none"/>' +
    '<circle cx="66" cy="38" r="7" fill="#ffe36b"/><circle cx="67" cy="38" r="3" fill="#111"/><path d="M58 30 L74 33" stroke="#2c5e31" stroke-width="3" stroke-linecap="round"/><path d="M30 60 q6 -4 10 0 M34 70 q6 -4 10 0" stroke="#2c5e31" stroke-width="2" fill="none"/>');
  if (id === 'witch') return w(bg('#b27fd6') +
    '<path d="M22 90 Q20 50 35 30 Q50 12 65 30 Q80 50 78 90Z" fill="#3f7a46"/><path d="M28 88 Q26 60 34 44 M72 88 Q74 60 66 44 M40 90 Q38 70 42 56 M60 90 Q62 70 58 56" stroke="#2a5530" stroke-width="4" fill="none" stroke-linecap="round"/>' +
    '<ellipse cx="50" cy="50" rx="15" ry="18" fill="#b9a6d8"/><path d="M38 44 L46 47 M62 44 L54 47" stroke="#2b1b3d" stroke-width="2.5" stroke-linecap="round"/><circle cx="44" cy="51" r="2.8" fill="#e8ff7a"/><circle cx="56" cy="51" r="2.8" fill="#e8ff7a"/>' +
    '<path d="M43 61 Q50 57 57 61" stroke="#2b1b3d" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M30 26 L50 6 L70 26 Z" fill="#5b2f7a" stroke="#2b1b3d" stroke-width="2"/><circle cx="50" cy="8" r="3" fill="#e8ff7a"/>');
  if (id === 'angler') return w(bg('#5fa8d9') +
    '<path d="M50 30 Q42 8 64 10" stroke="#9fc7e8" stroke-width="2.5" fill="none"/><circle cx="66" cy="11" r="6" fill="#fff6a8"/><circle cx="66" cy="11" r="11" fill="#fff6a8" opacity=".25"/>' +
    '<path d="M12 56 Q20 26 52 26 Q84 26 90 56 Q84 82 52 84 Q22 84 12 56Z" fill="#26405e" stroke="#0d1c2e" stroke-width="3"/>' +
    '<path d="M24 62 Q52 80 86 60 L84 66 Q52 92 26 68Z" fill="#0b0f18"/><path d="M28 64 l4 7 l4 -6 l4 8 l4 -7 l4 8 l4 -7 l4 8 l4 -7 l4 7 l4 -7 l4 6 l4 -6" stroke="#f2f2f2" stroke-width="2" fill="none"/>' +
    '<circle cx="62" cy="44" r="8" fill="#d7f0ff"/><circle cx="64" cy="45" r="4" fill="#0b0f18"/><path d="M52 36 L72 38" stroke="#0d1c2e" stroke-width="3" stroke-linecap="round"/>');
  return w(bg('#e05a5a') +
    '<path d="M6 70 Q20 30 50 22 Q82 16 94 44 Q96 70 70 80 Q40 92 6 70Z" fill="#2b1d3f" stroke="#120a1f" stroke-width="3"/>' +
    '<path d="M20 64 Q30 58 40 64 Q50 70 60 62 Q70 54 82 60" stroke="#4b3470" stroke-width="3" fill="none"/>' +
    '<ellipse cx="62" cy="42" rx="14" ry="10" fill="#ffcf4a"/><ellipse cx="62" cy="42" rx="3.5" ry="9" fill="#120a1f"/><path d="M44 30 L80 34" stroke="#120a1f" stroke-width="4" stroke-linecap="round"/>' +
    '<path d="M18 50 q4 -8 8 0 q4 -8 8 0" stroke="#4b3470" stroke-width="2" fill="none"/>');
}
const CURSE = {
  low: { name: 'Undertow', text: 'The LOWEST card of the led colour wins the trick. Lanterns still beat colours (the highest Lantern wins as usual).', short: 'Lowest wins' },
  sleep: { name: 'Lantern Sleep', text: 'Lanterns sleep this trick: a Lantern played on a colour wins nothing.', short: 'Lanterns sleep' },
  any: { name: 'Riptide', text: 'Every colour counts: the highest number wins, whatever its colour. Lanterns still beat colours.', short: 'Any colour wins' }
};
// ---------- the Descent: 4 zones x (3 dives + a boss), 3 oxygen tanks per zone ----------
const DESC = [   // difficulty tuned with desc-gauntlet.js (all-computer crew, first-try wins: about 70% / 55% / 35% / 25% per zone)
  { id: 'reef', name: 'Sunlit Reef', depth: '10 m', dives: [{ d: 2 }, { d: 3 }, { d: 4 }], boss: { id: 'eel', d: 4, pool: ['low'], every: 2 } },
  { id: 'kelp', name: 'Kelp Forest', depth: '40 m', dives: [{ d: 4 }, { d: 5, cmt: 'murky' }, { d: 5 }], boss: { id: 'witch', d: 6, pool: ['sleep', 'low'], every: 2 } },
  { id: 'twi', name: 'Twilight Trench', depth: '200 m', dives: [{ d: 6 }, { d: 7 }, { d: 7, cmt: 'murky' }], boss: { id: 'angler', d: 7, pool: ['any', 'sleep', 'low'], every: 2 } },
  { id: 'abyss', name: 'The Abyss', depth: '4000 m', dives: [{ d: 8 }, { d: 8, cmt: 'murky' }, { d: 9 }], boss: { id: 'leviathan', d: 8, pool: ['low', 'sleep', 'any'], every: 1 } }
];
const O2MAX = 3;
const Desc = {
  load() { let o = null; try { o = JSON.parse(lsGet('ld_desc') || 'null'); } catch (e) { } if (!o || o.v !== 1) o = { v: 1, z: 0, s: 0, o2: O2MAX, stars: {}, best: 0, met: {} }; return o; },
  save(o) { try { lsSet('ld_desc', JSON.stringify(o)); } catch (e) { } }
};
function descStage(p) { p = p || Desc.load(); const Z = DESC[Math.min(p.z, DESC.length - 1)]; const boss = p.s >= Z.dives.length; const st = boss ? Z.boss : Z.dives[p.s]; return { Z, zi: Math.min(p.z, DESC.length - 1), si: p.s, boss, d: st.d, cmt: st.cmt || 'normal', bossDef: boss ? Z.boss : null, done: p.z >= DESC.length }; }
function descentEl() {
  const p = Desc.load(), cur = descStage(p);
  const box = h('div.setup.scard.desc', h('div.shead', h('button.px.sback', { 'data-a': 'title', type: 'button', 'aria-label': 'Back to the title' }, '‹'), h('h2', 'The Descent')));
  box.append(h('div.dmara', h('span.dpt', { html: portraitSVG('mara', 56) }), h('p', p.z >= DESC.length ? 'You reached the bottom of the sea. Legendary! Start again any time.' : cur.boss ? 'Boss ahead: ' + CHAR[cur.bossDef.id].name + '. Every finished job hits it. Watch its curses!' : 'Each zone: 3 dives, then a boss. A failed dive costs one oxygen tank. Out of air = back to the top of the zone.')));
  const o2 = h('div.o2', h('b', 'Oxygen'), ...Array.from({ length: O2MAX }, (_, i) => h('span.tank' + (i < p.o2 ? '.full' : ''), { 'aria-hidden': 'true' })), h('span.sr', p.o2 + ' of ' + O2MAX + ' tanks'));
  box.append(o2);
  const goSlot = h('div.dgo'); box.append(goSlot);
  const map = h('div.dmap');
  DESC.forEach((Z, zi) => {
    const locked = zi > p.z, zc = h('div.dzone' + (zi === p.z ? '.cur' : '') + (locked ? '.lock' : '') + (zi < p.z ? '.won' : ''));
    zc.append(h('div.dzh', h('b', (zi + 1) + '. ' + Z.name), h('span', Z.depth)));
    const row = h('div.dsteps');
    Z.dives.forEach((x, si) => { const done = zi < p.z || (zi === p.z && si < p.s), here = zi === p.z && si === p.s; row.append(h('span.dstep' + (done ? '.ok' : '') + (here ? '.here' : ''), { title: 'Difficulty ' + x.d }, done ? (p.stars[zi + ':' + si] ? '★' : '✓') : String(si + 1))); });
    const bdone = zi < p.z, bhere = zi === p.z && p.s >= Z.dives.length;
    row.append(h('span.dstep.boss' + (bdone ? '.ok' : '') + (bhere ? '.here' : ''), { html: portraitSVG(Z.boss.id, 34) + (bdone ? '<b class="bx">\u2714</b>' : ''), title: CHAR[Z.boss.id].name + (bdone ? ' (defeated)' : '') }));
    zc.append(row); map.append(zc);
  });
  box.append(map);
  const lab = p.z >= DESC.length ? 'Start a new descent' : cur.boss ? 'Fight ' + CHAR[cur.bossDef.id].name : 'Dive ' + (cur.si + 1) + ' of ' + cur.Z.name;
  goSlot.append(h('div.sgo', h('button.sbtn.big', { 'data-a': p.z >= DESC.length ? 'descreset' : 'descgo', type: 'button' }, h('b', lab), ' ', h('span', p.z >= DESC.length ? 'from the Sunlit Reef' : 'You + Nerea, Bram and Sumi · difficulty ' + cur.d + (cur.cmt === 'murky' ? ' · murky water' : ''))),
    h('button.tlink', { 'data-a': 'guided', type: 'button' }, 'Training dive with Mara')));
  return box;
}
function descGo() {
  const p = Desc.load(); if (p.z >= DESC.length) { descReset(); return; }
  const st = descStage(p);
  newGame('descent', { np: 4, kind: 'free', d: st.d, cmt: st.cmt, boss: st.bossDef ? { id: st.bossDef.id, pool: st.bossDef.pool, every: st.bossDef.every } : null });
  if (G) {
    p.tries = p.tries || {}; const key = st.zi + ':' + st.si; p.tries[key] = (p.tries[key] || 0) + 1; Desc.save(p);
    G.desc = { zi: st.zi, si: st.si, tryN: p.tries[key] }; G.share = 1; G.mission.name = st.Z.name + (st.bossDef ? ' boss' : ' dive ' + (st.si + 1));
    if (G.log && G.log.length) G.log.forEach(e => { if (e && typeof e.t === 'string') e.t = e.t.replace('Free dive', G.mission.name); });
    render(); autosave();
  }
}
function descReset() { Desc.save({ v: 1, z: 0, s: 0, o2: O2MAX, stars: {}, best: Desc.load().best || 0, met: Desc.load().met || {} }); UI.sv = 'descent'; renderStart(); }
function isBoss() { return !!(G && G.boss); }
function bossChar() { return G && G.boss ? CHAR[G.boss.id] : null; }
// called by showResult for Descent dives: updates oxygen / progress once and adds the story and the buttons
function descResult(box, ok) {
  const p = Desc.load(), B = bossChar(); let st = descStage(p);
  if (G.desc) { const Z = DESC[G.desc.zi]; st = { Z, zi: G.desc.zi, si: G.desc.si, boss: G.desc.si >= Z.dives.length }; }
  if (!G.descDone) {
    G.descDone = 1;
    p.fail = p.fail || {}; const key = st.zi + ':' + st.si;
    if (ok) { if (!p.fail[key]) p.stars[key] = 1; if (st.boss) { p.z++; p.s = 0; p.o2 = O2MAX; p.best = Math.max(p.best || 0, p.z); } else p.s++; }
    else { p.fail[key] = 1; p.o2--; if (p.o2 <= 0) { p.s = 0; p.o2 = O2MAX; G.descOut = 1; } }
    Desc.save(p);
  }
  if (B && ok) box.prepend(h('div.bdef', h('span.dpt', { html: portraitSVG(G.boss.id, 64) }), h('div', h('b', B.name + ' defeated!'), h('span', 'Every job hit home. ' + (DESC[p.z] ? DESC[p.z].name + ' is open, tanks refilled.' : 'The sea is yours.')))));
  const say = (who, txt) => box.append(h('div.say', h('span.dpt', { html: portraitSVG(who, 52) }), h('p', h('b', CHAR[who].name + ': '), txt)));
  if (B) say(G.boss.id, ok ? B.lose : B.win);
  if (ok) say('mara', st.boss ? 'You beat ' + B.name + '! Fresh tanks — on to ' + (DESC[p.z] ? DESC[p.z].name : 'the surface, legends') + '.' : 'Well dived! ' + (p.stars[st.zi + ':' + st.si] ? 'First try — that is a star. ' : '') + 'Next: ' + (descStage(p).boss ? 'the boss of this zone.' : 'dive ' + (descStage(p).si + 1) + '.'));
  else if (G.descOut) say('mara', 'Out of air! Back up to the start of ' + st.Z.name + ' with full tanks. You know the waters now.');
  else say('mara', 'That cost one oxygen tank (' + p.o2 + ' left). Read the red cross: that job broke. Try the dive again.');
  const bt = h('div.cbtns');
  bt.append(h('button.btn.go', { 'data-a': 'descgo', type: 'button' }, ok ? (p.z >= DESC.length ? 'See the map' : 'Next dive') : 'Dive again'));
  bt.append(h('button.btn.alt', { 'data-a': 'rsclose', type: 'button' }, 'Look at the table'));
  bt.append(h('button.btn.alt', { 'data-a': 'descmap', type: 'button' }, 'Map'));
  box.append(bt);
}
// ---------- dialogs: a character pops up, play waits until the player answers ----------
function showDlg(d) { UI.dlg = d; drawDlg(); }
function drawDlg() {
  const el = $('#dlg'); if (!el) return; const d = UI.dlg;
  if (!d) { el.hidden = true; el.innerHTML = ''; return; }
  el.hidden = false; el.innerHTML = '';
  const who = CHAR[d.who] || CHAR.mara;
  el.append(h('div.dbox' + (d.curse ? '.curse' : '') + (d.who !== 'mara' ? '.bossd' : ''), { role: 'dialog', 'aria-modal': 'true', 'aria-label': d.title || who.name },
    h('div.dtop2', h('span.dpt', { html: portraitSVG(d.who || 'mara', 76) }), h('div', h('b', who.name), h('small', who.role))),
    d.title ? h('h3', d.title) : null, h('p', d.body),
    h('div.cbtns', h('button.btn.go', { 'data-a': 'dlgok', type: 'button' }, d.btn || 'OK'))));
}
function dlgOk() { const d = UI.dlg; UI.dlg = null; drawDlg(); if (d && d.then) try { d.then(); } catch (e) { console.error(e); } render(); schedule(); }
// one check per schedule(): opens the next dialog that is due. Returns true while a dialog is open (play waits).
function storyCheck() {
  if (UI.dlg) return true;
  if (!G || !UI.started || UI.busy || UI.cards.length || G.phase === 'over' || isClient()) return false;
  UI.said = UI.said || {};
  const once = (k, d) => { if (UI.said[k]) return false; UI.said[k] = 1; showDlg(d); return true; };
  if (UI.mode === 'descent') {
    const st = descStage(), p = Desc.load(), B = bossChar();
    if (G.tricks.length === 0 && G.phase === 'assign') {
      if (!p.met.intro && once('intro', { who: 'mara', title: 'The Descent', body: 'Four zones, deeper and harder. Each zone: three dives, then a boss. A failed dive costs one oxygen tank (you have ' + O2MAX + '). Do every job to clear a dive. Ready?', btn: 'Let\'s dive', then: () => { const q = Desc.load(); q.met.intro = 1; Desc.save(q); } })) return true;
      if (B && once('boss' + G.att, { who: G.boss.id, title: G.att === 1 ? B.name + ' appears!' : B.name + ' is waiting', body: B.intro + ' Curses: ' + G.boss.pool.map(c => CURSE[c].name + ' (' + CURSE[c].short.toLowerCase() + ')').join(', ') + '. Each job you finish hits me.', btn: 'Bring it on' })) return true;
      if (!B && st.si === 0 && G.att === 1 && once('zone', { who: 'mara', title: st.Z.name + ' · ' + st.Z.depth, body: st.zi === 0 ? 'Shallow and bright. Pick jobs your cards can do, and help the others with theirs.' : st.zi === 1 ? 'Murky water ahead: in some dives a shown card does not tell if it is the highest or lowest.' : st.zi === 2 ? 'The trench is dark and the jobs are many. Use your signal early.' : 'The Abyss. The Leviathan curses EVERY trick. Good luck, diver.', btn: 'Dive' })) return true;
    }
    if (B && G.phase === 'play' && G.trick && G.trick.plays.length === 0 && G.trick.cu) {
      const C = CURSE[G.trick.cu], n = G.tricks.length, nx = G.boss.sched.findIndex((c, i) => i > n && c);
      const tail = ' This trick only' + (nx >= 0 ? '; the next curse comes on trick ' + (nx + 1) + '.' : '.');
      // the full pop-up only the first time a curse appears in a fight; later it is a line in the dock and the red tag on the boss bar
      if (!UI.said['cut' + G.att + G.trick.cu]) { UI.said['cut' + G.att + G.trick.cu] = 1; UI.said['cu' + G.att + ':' + n] = 1; showDlg({ who: G.boss.id, curse: 1, title: B.name + ' casts ' + C.name + '!', body: C.text + tail, btn: 'Brace!' }); return true; }
      if (!UI.said['cu' + G.att + ':' + n]) { UI.said['cu' + G.att + ':' + n] = 1; UI.hitAt = Date.now(); UI.news = (UI.news || []).concat(['\u2620 Trick ' + (n + 1) + ': ' + B.name + ' casts ' + C.name + ' \u2014 ' + C.short.toLowerCase() + '.']).slice(-3); render(); }
    }
  }
  if (UI.mode === 'guided') return tutCheck(once);
  return false;
}
// ---------- the boss bar on the table ----------
function bossBar() {
  const fe = $('#felt'); if (!fe) return; let bb = $('#bossbar');
  if (!isBoss() || G.phase === 'assign') { if (bb) bb.remove(); fe.classList.remove('bosson'); return; }
  if (!bb) { bb = h('div#bossbar'); fe.prepend(bb); }
  fe.classList.add('bosson');
  const B = bossChar(), n = G.tasks.length, done = G.tasks.filter((t, i) => jobSt(i) > 0).length, cu = G.phase === 'play' && G.trick ? G.trick.cu : '';
  bb.className = (UI.hitAt && Date.now() - UI.hitAt < 700 ? 'hit' : '');
  bb.innerHTML = '';
  const nx = G.boss.sched.findIndex((c, i) => i > G.tricks.length && c);
  bb.append(h('span.bpt', { html: portraitSVG(G.boss.id, 34) }), h('div.bmid', h('b', B.name), h('div.hp', { 'aria-label': 'Boss health ' + (n - done) + ' of ' + n }, ...Array.from({ length: n }, (_, i) => h('i' + (i < n - done ? '.on' : ''))))),
    cu ? h('span.bcu', { title: CURSE[cu].text }, '☠ ' + CURSE[cu].short) : h('span.bcu.calm', nx >= 0 ? 'Curse on trick ' + (nx + 1) : 'No curse'));
}
// ---------- Mara's training dive (replaces the old tip chain in guided mode) ----------
// The guided deal is stacked (see data.js guided): you hold L4 L3 C2 C6 C9 T3 T7 K1 K5 K8 S2 S6 S9; your job is to win the Lantern 3.
const TUT = { lead: [D.card(0, 9), D.card(1, 3), D.card(4, 3)] };
function tutOnly() {
  if (UI.mode !== 'guided' || !G || G.phase !== 'play' || G.trick.turn !== viewSeat()) return -1;
  const L3 = D.card(4, 3);
  if (G.trick.plays.length) return G.trick.ls === 4 && G.players[viewSeat()].hand.includes(L3) && !G.trick.plays.some(p => p.c > L3) ? L3 : -1;
  const k = Math.min(G.tricks.length, 2), want = TUT.lead[k];
  return G.players[viewSeat()].hand.includes(want) ? want : -1;
}
function tutCheck(once) {
  const v = viewSeat(), myTurn = G.phase === 'play' && G.trick.turn === v;
  if (G.phase === 'assign' && G.tricks.length === 0) {
    if (once('t0', { who: 'mara', title: 'Welcome, diver!', body: 'I\'m Mara. In Lantern Dive the whole crew wins or loses TOGETHER. Each dive has job cards; each job belongs to ONE diver. Do every job and the dive is won.', btn: 'Show me' })) return true;
    if (iMustAct() && once('t1', { who: 'mara', title: 'Take a job', body: 'This job says: win the Lantern 3. You will win it when the Lantern 3 is in a trick YOU win. Tap the job card on the table, then press "Take this job".', btn: 'Got it' })) return true;
  }
  if (G.phase === 'distress' && iMustAct() && once('tf', { who: 'mara', title: 'The distress flare', body: 'Optional help: everyone passes one card. We do not need it today — press "No flare".', btn: 'OK' })) return true;
  if ((G.phase === 'signal' || G.phase === 'play' && G.tricks.length === 0) && iMustAct() && LD.pingMoves(G, v).length && once('ts', { who: 'mara', title: 'Signals', body: 'Once per dive you may SHOW the crew one card: your highest, lowest or only card of a colour. Skip it for now — press "No signal".', btn: 'OK' })) return true;
  if (myTurn && G.trick.plays.length === 0) {
    if (G.tricks.length === 0 && once('t2', { who: 'mara', title: 'Your first trick', body: 'You lead: you play first and choose the colour. Everyone must follow that colour if they can, and the HIGHEST card of it wins. Lead your Coral 9 (it glows).', btn: 'Lead it' })) return true;
    if (G.tricks.length === 1 && once('t3', { who: 'mara', title: 'You won it!', body: 'The highest Coral took the trick, and the winner leads next. Now lead your Tide 3: a low card loses on purpose. Losing tricks is a tool too.', btn: 'Lead it' })) return true;
    if (G.tricks.length >= 2 && G.players[v].hand.includes(D.card(4, 3)) && once('t5', { who: 'mara', title: 'Lanterns are trumps', body: 'A Lantern beats every colour, and the highest Lantern wins. Nerea and Bram only hold lower Lanterns. Lead your Lantern 3 now to win it — that finishes your job!', btn: 'Lead it' })) return true;
  }
  if (myTurn && G.trick.plays.length > 0 && tutOnly() >= 0 && once('t6', { who: 'mara', title: pname(G.trick.lead) + ' led a Lantern for you!', body: 'Lanterns are trumps: they beat every colour, and the highest Lantern wins. A Lantern lead must be followed with a Lantern. Play your Lantern 3: it beats ' + G.trick.plays.map(p => cname(p.c)).join(' and ') + ', so you win it and finish your job!', btn: 'Play it' })) return true;
  if (myTurn && G.trick.plays.length > 0 && G.trick.ls < 4 && LD.playable(G, v).length < G.players[v].hand.length && once('t4', { who: 'mara', title: 'Follow the colour', body: pname(G.trick.lead) + ' led ' + D.suits[G.trick.ls].name + '. You MUST play ' + D.suits[G.trick.ls].name + ' if you have it — the dim cards are not allowed. You never have to win.', btn: 'OK' })) return true;
  if (G.tricks.length >= 1 && G.tricks.length < 3 && G.tricks[G.tricks.length - 1].w !== v && once('tl' + G.tricks.length, { who: 'mara', title: pname(G.tricks[G.tricks.length - 1].w) + ' won that trick', body: 'With ' + cname(G.tricks[G.tricks.length - 1].wc) + ', the highest card. That is fine: your job only cares about the Lantern 3. Teamwork tip: when a teammate is winning a trick, you can throw in a card THEY need for their job.', btn: 'OK' })) return true;
  return false;
}
