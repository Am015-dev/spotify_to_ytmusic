// ===================== part 5: drawers (diners, log, rules, menu), start screen, events, phone mode, boot =====================
function logHTML() { const e = h('div.logl'); for (let i = G.log.length - 1; i >= Math.max(0, G.log.length - 150); i--) e.appendChild(h('div.ll', h('span.lt', 'R' + G.log[i].round + '.' + G.log[i].turn), ' ' + G.log[i].t)); return e; }
function buildRules() {
  const root = h('div.rules');
  const sec = (t, ...k) => { root.appendChild(h('h3', t)); k.forEach(x => root.appendChild(x)); };
  sec('The goal', h('p', 'You are a diner at a conveyor-belt sushi bar. Collect plates over three rounds and score points for sets, pairs, ladders and races. The highest total after the third round wins. Ties go to the diner with more Custard Cups.'));
  sec('How a round goes', h('ol', ...[
    'Everyone is dealt a hand: 10 plates with 2 diners, 9 with 3, 8 with 4 and 7 with 5.',
    'All diners secretly pick one plate from their hand at the same time. On your phone or computer: tap a plate to lift it, then press Serve to confirm (with "Tap twice to serve" on in the menu, a second tap on the plate serves it too).',
    'When everyone has chosen, the covers lift together and the plates land on your counters.',
    'Then every hand slides one seat to the left, around the table. You pick again from the hand you just received.',
    'When the hands are empty the round is scored. Everything except Custard is cleared away and a new hand is dealt.'].map(t => h('li', t))));
  sec('Every plate', h('div', ...D.types.map(t => {
    const id = t.id; const rule = { tempura: 'pair', sashimi: 'set', dumpling: 'ladder', roll1: 'most', roll2: 'most', roll3: 'most', salmon: 'v2', squid: 'v3', egg: 'v1', wasabi: 'x3', chop: 'swap', pudding: 'dessert' }[id];
    return h('div.rcard', cardDiv(id, 64), h('div.rt', h('b', t.name + (t.copies ? ' (' + t.copies + ')' : '')), h('div', t.text)));
  })));
  sec('Scoring a round', h('ul', ...[
    'Crispy Prawn: 5 points for every pair.', 'Fish Slice: 10 points for every set of three.', 'Steam Bun: 1, 3, 6, 10, 15 points for 1, 2, 3, 4, 5 or more buns.',
    'Seaweed Rolls: add up the roll icons on your counter. The most icons scores 6. The second most scores 3. If several diners tie for the most, they split 6 (rounded down) and nobody scores second place. Ties for second split 3. Diners with no icons never score.',
    'Nigiri: Sunset 2, Moon 3, Sun 1 point. Fire Paste: your next nigiri lands on it and scores triple. A Fire Paste with no nigiri scores nothing, and each paste only takes one nigiri.'].map(t => h('li', t))));
  sec('Twin Sticks', h('p', 'Keep them on your counter. On a later turn you may serve two plates from the hand you are holding: press "Use Twin Sticks", pick two plates and serve them. The sticks then go back into that hand (they are passed on) and you have used them. A Fire Paste and a nigiri served together land on each other.'));
  sec('Custard', h('p', 'Custard Cups are never cleared away. At the end of the third round the diner with the most Custard scores 6 and the diner with the fewest loses 6. Ties split the points (rounded down). With two diners nobody loses points. If everybody has the same number, nobody scores.'));
  sec('Playing it', h('ul', ...[
    'The small green +N on a plate is what serving it scores you right now (switch it off in the menu).',
    'The glowing seat shows who is still choosing. Covered plates on the right of each counter mean that diner has chosen.',
    'Tap a group of plates on any counter to see what it is worth right now. Tap a chef to see their whole table.',
    'Hot-seat: the hands are hidden between diners, with a "pass the device" screen. Online: friends see only their own hand.',
    'Your meal is saved after every turn. If you close the page or switch apps, choose Resume on the title screen.'].map(t => h('li', t))));
  sec('Words used in the game', h('dl.gloss', ...[
    ['Belt', 'the hand of plates you are holding this turn. It moves on to the next diner after every pick.'],
    ['Counter', 'the plates you have served this round, in front of your seat.'],
    ['Serve', 'confirm the plate you lifted. Everybody serves at the same time, then the covers lift.'],
    ['Roll race', 'the Seaweed Roll contest: add up the roll icons on each counter. Most icons scores 6, second most 3.'],
    ['Nigiri', 'the Sunset, Moon and Sun plates. They score their number straight away.'],
    ['Fire Paste bonus', 'a nigiri served onto a waiting Fire Paste scores triple; the extra points show as this row on the score pad.'],
    ['Sweets', 'Custard Cups. They stay on your counter until the end of the meal.'],
    ['Order slip / score pad', 'the paper that adds up every diner\'s rounds and the custard at the end.'],
    ['+N', 'the small green number on a plate: what serving it would score you right now.']].map(([t, d]) => [h('dt', t), h('dd', d)]).flat()));
  root.appendChild(h('div', { html: '<section class="credits-audio"><h3>Credits</h3><p>Music: &ldquo;Jazz Slower&rdquo; by Pro Sensory (OpenGameArt, CC0). Ambience: &ldquo;The Shop collection: convenience store drinks fridge drone 2&rdquo; by LEGIT Audio (OpenGameArt, CC0). Sound effects: Casino Audio, Impact Sounds, Interface Sounds, Music Jingles, RPG Audio and UI Audio by Kenney (kenney.nl, CC0). All sounds were trimmed, loudness-normalised and converted for this game.</p><p>Online play uses Trystero (MIT). The painted table is drawn with PixiJS (MIT). Names, card text and art are original; the paintings were made for this game.</p></section>' }));
  return root;
}
function renderRival(seat) {
  const b = $('#rivalbody'); if (!b || !G) return; b.innerHTML = '';
  seat = seat == null ? (UI.rseat != null ? UI.rseat : focusSeat()) : seat; UI.rseat = seat;
  const tabs = h('div.rtabs');
  for (let s = 0; s < G.np; s++) { const bt = h('button.btn' + (s === seat ? '.on' : '.alt'), { 'data-a': 'rtab', 'data-seat': s, type: 'button' }); const av = h('span', { html: avatarS(s, 64) }).firstChild; av.style.cssText = 'width:26px;height:26px;display:inline-block;vertical-align:middle;margin-right:5px'; bt.append(av, pname(s)); tabs.appendChild(bt); }
  b.appendChild(tabs);
  const p = G.players[seat], tab = tables(), info = seatScoreInfo(tab), gs = groupsOf(seat, tab, info).list, pcs = pudCounts();
  b.appendChild(h('div.rhead', h('span', { html: avatarS(seat, 96) }), h('div', h('b', p.name), h('div.sm', (p.ai ? 'Computer (' + p.ai + ')' : (NET.on && seat === NET.mySeat ? 'You' : 'Diner')) + (G.phase === 'pick' ? (p.picked ? ' · has chosen' : ' · is choosing') : '')))));
  b.querySelector('.rhead svg').style.cssText = 'width:52px;height:52px';
  const bank = G.rs.map(r => r[seat].total);
  b.appendChild(h('div.kv', h('span', 'Rounds banked'), h('b', bank.length ? bank.join(' + ') + ' = ' + bank.reduce((a, c) => a + c, 0) : 'none yet')));
  if (G.phase !== 'over' && tab[seat].length) b.appendChild(h('div.kv', h('span', 'This round so far'), h('b', '+' + info.rs[seat].total)));
  b.appendChild(h('div.kv', h('span', 'Custard cups'), h('b', pcs[seat])));
  b.appendChild(h('div.kv', h('span', 'Plates in hand'), h('b', G.phase === 'over' ? 0 : G.players[seat].hand.length)));
  b.appendChild(h('h4', 'On the counter'));
  if (!gs.length) b.appendChild(h('p.sm', 'Nothing served yet this round.'));
  gs.forEach(g => b.appendChild(h('div.rcard', cardDiv(g.k === 'roll' ? 'roll2' : g.type, 54, g.on), h('div.rt', h('b', g.hint), h('div.sm', g.tip)))));
}
function renderDrawers() {
  if (!GX.open || !G) return;
  if (GX.open === 'logd') { const b = $('#logbody'); b.innerHTML = ''; b.appendChild(logHTML()); }
  if (GX.open === 'rivald') renderRival();
  if (GX.open === 'setd') renderMenu();
}
function renderMenu() {
  const b = $('#setbody'); b.innerHTML = '';
  const row = (l, ...k) => b.appendChild(h('div.mrow', h('div.lbl', l), h('div.mbt', k)));
  const tog = (name, on, label) => h('button.btn' + (on ? '' : '.alt'), { 'data-a': name, type: 'button', 'aria-pressed': on ? 'true' : 'false' }, label + ': ' + (on ? 'On' : 'Off'));
  if (NET.on) row('Online', h('button.btn', { 'data-a': 'netopen', type: 'button' }, 'Lobby'), h('button.btn.alt', { 'data-a': 'netleave', type: 'button' }, isHost() ? 'Close the room' : 'Leave the room'));
  else row('Game', h('button.btn', { 'data-a': 'menu', type: 'button' }, 'New game'), h('button.btn.alt', { 'data-a': 'save', type: 'button' }, 'Save'), h('button.btn.alt' + (hasSave() ? '' : '.dis'), { 'data-a': 'loadsave', type: 'button', disabled: hasSave() ? null : true }, 'Load'));
  if (!NET.on) row('Computer speed', ...[['Fast', 150], ['Normal', 650], ['Slow', 1300]].map(([n, v]) => h('button.btn' + (AIDELAY === v ? '' : '.alt'), { 'data-a': 'speed', 'data-v': v, type: 'button' }, n)));
  if (!NET.on) row('Guide', ...['full', 'light', 'off'].map(n => h('button.btn' + (UI.coach.level === n ? '' : '.alt'), { 'data-a': 'guide', 'data-v': n, type: 'button' }, n[0].toUpperCase() + n.slice(1))));
  row('Help on the belt', tog('hints', UI.prefs.hint, 'Show +N scores'), tog('tap2', UI.prefs.tap2, 'Tap twice to serve'));
  row('Sound', tog('sound', UI.prefs.sound, 'Sound effects'), tog('music', UI.prefs.music, 'Music'));
  { const g = gfxPref(); row('Graphics' + (PX.on ? (g === 'auto' ? ' (now ' + PX.q + ')' : '') : ' (simple view)'), ...[['auto', 'Auto'], ['high', 'High'], ['medium', 'Medium'], ['low', 'Low']].map(([v, n]) => h('button.btn' + (g === v ? '' : '.alt'), { 'data-a': 'gfx', 'data-v': v, type: 'button', 'aria-pressed': g === v ? 'true' : 'false' }, n))); }
  let sp = ''; try { sp = window.PerfHUD && PerfHUD.buttonsHTML ? PerfHUD.buttonsHTML('btn alt') : ''; } catch (e) { }
  row('Info', h('button.btn.alt', { 'data-a': 'rules', type: 'button' }, 'How to play'), h('span.tinyc', { html: sp }));
  b.appendChild(h('p.sm', 'Kaiten Kitchen is an original conveyor-belt card game. Names, card text and art are original; the audio credits are in How to play.'));
}
// ---------- start screens: painted title -> setup (diner cards) / online ----------
// the four chefs who can join you (you are seat 0 with Mina's portrait). Default level = the character's temper; every level can be changed.
const DINERS = {
  1: { lv: 'hard', story: 'Taro cooks noodles on the night shift and eats his supper at the belt long after midnight. He counts every plate that rolls past and remembers exactly who took the last prawn.', enjoy: 'Choose Taro if you enjoy a sharp rival who punishes every loose plate.' },
  2: { lv: 'normal', story: 'Odile ran a bakery for forty years and still wears her tall hat to dinner. She has never once left without dessert, and she will happily tell you about it.', enjoy: 'Choose Odile if you enjoy a fair, steady race with the custard on the line.' },
  3: { lv: 'normal', story: 'Kofi drives the number 9 bus and knows every regular by name. He loves a roll race, cheers when he wins it and cheers just as loudly when he loses.', enjoy: 'Choose Kofi if you enjoy a lively table where the seaweed rolls are always fought over.' },
  4: { lv: 'easy', story: 'Pip saved up pocket money all month for this dinner and wants to try one of everything. Pip picks whichever plate looks the happiest.', enjoy: 'Choose Pip if you enjoy a relaxed first meal with room to try things out.' }
};
const SEAT_ORDER = [2, 3, 1, 4];
function optObj() { const o = UI.opt = UI.opt || Object.assign({}, DEF, { lv: DEF.lv.slice(), seats: DEF.seats.slice() }); if (!Array.isArray(o.seats)) o.seats = chefsFor(o.np || 3, o).slice(1); if (!o.lv) o.lv = DEF.lv.slice(); o.np = o.seats.length + 1; return o; }
function setNp(n) { const o = optObj(), want = Math.max(1, Math.min(4, n - 1)); const st = o.seats.slice(); while (st.length > want) st.pop(); for (const c of SEAT_ORDER) { if (st.length >= want) break; if (st.indexOf(c) < 0) st.push(c); } o.seats = st; o.np = st.length + 1; }
function toggleChef(c) { const o = optObj(), st = o.seats.slice(), i = st.indexOf(c); if (i >= 0) { if (st.length > 1) st.splice(i, 1); else { toast('At least one chef joins you.'); return; } } else st.push(c); o.seats = st; o.np = st.length + 1; }
function logoSVG() { return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="#fbf0da" stroke="#4a2a22" stroke-width="1.6"/><circle cx="12" cy="12" r="7" fill="#e5553a" stroke="#4a2a22" stroke-width="1.2"/><circle cx="12" cy="12" r="3.2" fill="#fbf0da" stroke="#4a2a22" stroke-width="1"/></svg>'; }
function tableLine(o) { const nm = o.seats.map(c => PN[c]); return 'You + ' + nameList(nm) + ' · ' + o.np + ' diners'; }
function renderStart() {
  const s = $('#start'); s.hidden = false; s.innerHTML = '';
  const rs = $('#rs'); if (rs && !UI.rsOpen) { rs.hidden = true; }
  if (NET.on) { s.dataset.v = 'net'; netStartScreen(s); return; }
  if (!UI.sv) UI.sv = UI.onl ? 'online' : 'title';
  s.dataset.v = UI.sv;
  if (UI.sv === 'title') { s.appendChild(titleEl()); return; }
  if (KIT.ART.title) s.appendChild(h('img.ttl-bg.dim', { src: KIT.ART.title, alt: '' }));
  if (UI.sv === 'online') { s.appendChild(onlineEl()); return; }
  s.appendChild(setupEl());
}
function titleEl() {
  // a saved meal comes first: Resume leads the buttons
  const bg = KIT.ART.title ? h('img.ttl-bg', { src: KIT.ART.title, alt: '' }) : h('div.ttl-bg.ttl-plain');
  const sv = hasSave();
  return h('div.ttl', bg, h('div.ttl-in',
    h('h1.logo', h('span.ic', { html: logoSVG() }), h('span', 'Kaiten Kitchen')),
    h('p.tag', 'Grab a plate, pass the belt.'),
    h('div.tbtns',
      sv ? h('button.tbtn.go', { 'data-a': 'loadsave', type: 'button' }, h('b', 'Resume'), h('span', (si => si ? 'your meal, round ' + si.round + ' of ' + D.rounds + ' · ' + si.np + ' diners' : 'your saved meal')(saveInfo()))) : null,
      h('button.tbtn' + (sv ? '' : '.go'), { 'data-a': 'play', type: 'button' }, h('b', sv ? 'New game' : 'Play'), h('span', 'against the computer chefs')),
      h('button.tbtn', { 'data-a': 'online', type: 'button' }, h('b', 'Online'), h('span', 'with friends, free'))),
    h('button.tlink', { 'data-a': 'rules', type: 'button' }, 'How to play')));
}
function dinerCard(c, o) {
  const d = DINERS[c], on = o.seats.indexOf(c) >= 0, lv = o.lv[c - 1] || 'normal', pc = KIT.PLAYERS[c];
  const card = h('article.dcard' + (on ? '.on' : ''), { 'aria-label': PN[c] + (on ? ', at the table' : ', not at the table') });
  card.style.setProperty('--dc', pc.c);
  card.append(h('div.dtop', h('div.dimg', { html: avatarC(c, 120) }), h('h3', PN[c], h('small', on ? lv : 'not invited'))), h('div.dtx', h('p.story', d.story), h('p.enjoy', d.enjoy),
    h('div.drow', h('button.chipb.seatb' + (on ? '.on' : ''), { 'data-a': 'seatchef', 'data-c': c, type: 'button', 'aria-pressed': on ? 'true' : 'false' }, on ? 'At the table ✓' : 'Invite'),
      on ? h('span.lvs', ['easy', 'normal', 'hard'].map(v => h('button.chipb' + (lv === v ? '.on' : ''), { 'data-a': 'lv', 'data-seat': c, 'data-v': v, type: 'button', 'aria-pressed': lv === v ? 'true' : 'false', 'aria-label': PN[c] + ' plays ' + v }, v))) : null)));
  return card;
}
function setupEl() {
  const o = optObj(), ph = isPh(), open = !!UI.cfgOpen;
  const head = h('div.shead', h('button.px.sback', { 'data-a': 'title', type: 'button', 'aria-label': 'Back to the title' }, '‹'), h('h2', 'Who is at the counter?'));
  const sum = h('div.ssum', h('div.sfaces', o.seats.map(c => h('span', { html: avatarC(c, 64) }))), h('span.sline', tableLine(o)), h('button.btn.alt', { 'data-a': 'cfgopen', type: 'button', 'aria-expanded': open ? 'true' : 'false' }, 'Configure'));
  const cfg = h('div.cfg#cfg', { hidden: ph && !open ? true : null, role: ph ? 'dialog' : null, 'aria-label': ph ? 'Configure the table' : null },
    ph ? h('div.cfghead', h('b', 'Configure the table'), h('button.btn', { 'data-a': 'cfgclose', type: 'button' }, 'Done')) : null,
    h('div.seg', h('span.lbl', 'Table for'), [2, 3, 4, 5].map(v => h('button.chipb' + (o.np === v ? '.on' : ''), { 'data-a': 'opt', 'data-k': 'np', 'data-v': v, type: 'button', 'aria-pressed': o.np === v ? 'true' : 'false' }, v))),
    h('div.dgrid', [1, 2, 3, 4].map(c => dinerCard(c, o))),
    ph ? h('div.cfgfoot', h('button.btn.go', { 'data-a': 'cfgclose', type: 'button' }, 'Done')) : null);
  const n = o.np - 1;
  // until a first meal is finished, the guided game is the big button
  const first = !lsGet('kk_done');
  const bMeal = cls => h('button.sbtn' + cls, { 'data-start': 'vs', 'data-a': 'start', 'data-m': 'vs', type: 'button' }, h('b', first ? 'Normal game' : 'Start the meal'), h('span', 'You against ' + nameList(o.seats.map(c => PN[c]))));
  const bGuide = cls => h('button.sbtn' + cls, { 'data-start': 'guided', 'data-a': 'guided', type: 'button' }, h('b', first ? 'Start: guided first game' : 'Guided first game'), h('span', '1 on 1 with ' + PN[o.seats[0]] + ', with tips' + (first ? ' (recommended)' : '')));
  const go = h('div.sgo',
    first ? bGuide('.big') : bMeal('.big'),
    h('div.sgrid3',
      first ? bMeal('') : bGuide(''),
      h('button.sbtn', { 'data-start': 'hot', 'data-a': 'start', 'data-m': 'hot', type: 'button' }, h('b', 'Hot-seat'), h('span', o.np + ' people, one device')),
      h('button.sbtn', { 'data-start': 'ai', 'data-a': 'start', 'data-m': 'ai', type: 'button' }, h('b', 'Watch'), h('span', 'the chefs play'))));
  return h('div.setup.scard', head, ph ? sum : h('p.ssub', 'Invite the chefs you want at the belt. Each one has a temper; change their level if you like.'), cfg, go);
}
function onlineEl() {
  return h('div.setup.scard.onlv', h('div.shead', h('button.px.sback', { 'data-a': 'title', type: 'button', 'aria-label': 'Back to the title' }, '‹'), h('h2', 'Play online')),
    h('p.ssub', 'Host a table and send friends the code or the link. Every browser connects directly; nobody sees another hand. Empty seats go to the computer chefs.'),
    h('details.online#onl', { open: true }, h('summary', 'Free, peer to peer'), h('div#netblock', netInner())));
}
function showStart() { try { GX.close(); } catch (e) { } closePop(); UI.cards = []; UI.sv = 'title'; UI.cfgOpen = false; const pc = $('#pc'); if (pc) { pc.hidden = true; pc.innerHTML = ''; } closeRS(); clearTimeout(UI.tm); renderStart(); }
// ---------- events ----------
document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-a],[data-start]'); const pop = $('#ppop');
  if (!t) { if (UI.pop && pop && !pop.contains(ev.target) && !ev.target.closest('#pc,.gx-drawer,#rs')) closePop(); return; }
  const a = t.dataset.a, d = t.dataset;
  if (netClick(a, t)) return;
  if (d.start && !a) { newGame(d.start); return; }
  switch (a) {
    case 'hcard': tapHand(+d.i); break;
    case 'serve': serveSel(); break;
    case 'twin': toggleTwin(); break;
    case 'hint': hint(); break;
    case 'unsel': UI.sel = []; UI.rec = null; render(); break;
    case 'grp': openGroup(+d.seat, d.k); break;
    case 'seat': case 'chip': UI.rseat = +d.seat; GX.show('rivald'); renderRival(UI.rseat); break;
    case 'rtab': renderRival(+d.seat); break;
    case 'popx': closePop(); break;
    case 'cont': nextCard(); break;
    case 'take': takeDevice(); break;
    case 'rsnext': afterRound(UI.rsInfo && UI.rsInfo.ge); break;
    case 'rsskip': skipCount(); break;
    case 'rsclose': closeRS(); break;
    case 'again': { const m = UI.mode, c = UI.cfg || {}; UI.cards = []; closeRS(); newGame(m === 'net' ? 'vs' : m, { np: c.np, level: c.level, lv: c.lv, seats: c.seats || undefined }); break; }
    case 'play': UI.sv = 'setup'; renderStart(); break;
    case 'online': UI.sv = 'online'; UI.onl = true; renderStart(); break;
    case 'title': UI.sv = 'title'; UI.cfgOpen = false; renderStart(); break;
    case 'cfgopen': UI.cfgOpen = true; renderStart(); try { const c = $('#cfg'); if (c) c.querySelector('button').focus({ preventScroll: true }); } catch (e) { } break;
    case 'cfgclose': UI.cfgOpen = false; renderStart(); break;
    case 'seatchef': toggleChef(+d.c); renderStart(); break;
    case 'gfx': setGfx(d.v); renderMenu(); break;
    case 'menu': showStart(); break;
    case 'start': newGame(d.m); break;
    case 'guided': newGame('guided'); break;
    case 'opt': { const o = optObj(); if (d.k === 'np') setNp(+d.v); else { o[d.k] = isNaN(+d.v) ? d.v : +d.v; if (d.k === 'level') o.lv = [d.v, d.v, d.v, d.v]; } renderStart(); break; }
    case 'lv': { const o = optObj(); o.lv = (o.lv || DEF.lv).slice(); o.lv[+d.seat - 1] = d.v; renderStart(); break; }
    case 'rules': GX.show('rulesd'); break;
    case 'save': toast(save() ? 'Game saved.' : 'Could not save.'); break;
    case 'loadsave': if (!loadSave()) toast('No saved game.'); break;
    case 'speed': AIDELAY = +d.v; savePrefs(); renderMenu(); break;
    case 'guide': UI.coach.level = d.v; UI.coach.keep = d.v === 'full'; UI.coach.userOff = d.v === 'off'; if (d.v === 'off') UI.tip = null; renderMenu(); break;
    case 'hints': UI.prefs.hint = !UI.prefs.hint; savePrefs(); renderMenu(); if (G) render(); break;
    case 'tap2': UI.prefs.tap2 = !UI.prefs.tap2; savePrefs(); renderMenu(); if (G) render(); break;
    case 'sound': UI.prefs.sound = !UI.prefs.sound; savePrefs(); try { if (window.GA) GA.setSfx(UI.prefs.sound); } catch (e) { } renderMenu(); break;
    case 'music': UI.prefs.music = !UI.prefs.music; savePrefs(); try { if (window.GA) GA.setMusic(UI.prefs.music); } catch (e) { } sndMusic(); renderMenu(); break;
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (UI.pop) closePop(); else if (UI.rsOpen && UI.mode && G && G.phase === 'over' && UI.overShown) closeRS(); } });
// ---------- phone mode ----------
function applyPhone() {
  const q = /[?&]phone=(\d)/.exec(location.search); const w = innerWidth, hh = innerHeight, short = Math.min(w, hh);
  let ph = short <= 500 || (window.matchMedia && matchMedia('(pointer:coarse)').matches && short <= 600);
  if (q) ph = q[1] === '1';
  const r = document.documentElement.classList, was = r.contains('ph');
  r.toggle('ph', ph); if (UI.prefs.tap2 == null) UI.prefs.tap2 = !ph;   // phones: Serve button only by default (no accidental second tap)
  try { const bb = document.querySelector('.gx-bar').getBoundingClientRect(); document.documentElement.style.setProperty('--kkbar', Math.max(0, Math.round(bb.bottom)) + 'px'); } catch (e) { }
  document.documentElement.style.setProperty('--dockh', Math.max(160, Math.min(240, Math.round(hh * .31))) + 'px'); r.toggle('ph-p', ph && w < hh); r.toggle('ph-l', ph && w >= hh);
  placePrompt(); if (was !== ph) { if (G && UI.started) render(); const st = $('#start'); if (st && !st.hidden && !NET.on && UI.sv === 'setup') renderStart(); }
}
let rzT = 0;
function onResize() { clearTimeout(rzT); rzT = setTimeout(() => { applyPhone(); if (G && UI.started) render(); }, 60); }
// ---------- boot ----------
function boot() {
  GX.init({ key: 'kk' });
  GX.drawer('rulesd', 'How to play', buildRules(), true);
  GX.drawer('logd', 'Log', h('div#logbody'));
  GX.drawer('rivald', 'Diners and scores', h('div#rivalbody'));
  GX.drawer('setd', 'Menu', h('div#setbody'));
  GX.onShow = id => { renderDrawers(); };
  loadPrefs(); applyPhone();
  addEventListener('resize', onResize); addEventListener('orientationchange', onResize);
  addEventListener('pagehide', () => { try { flushSave(); } catch (e) { } });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') try { flushSave(); } catch (e) { } });
  const bd = $('#board'); if (window.ResizeObserver) new ResizeObserver(() => { if (G && UI.started) { clearTimeout(rzT); rzT = setTimeout(() => { if (G && UI.started) render(); }, 40); } }).observe(bd);
  try { if (window.GA) { const A = typeof GA_DATA !== 'undefined' ? GA_DATA : {}; GA.init({ sfx: A.sfx || {}, music: A.music || {}, key: 'kk' }); GA.setSfx(UI.prefs.sound); GA.setMusic(UI.prefs.music); } } catch (e) { }
  pxPerfReg();
  pxInit().then(ok => { if (ok) { pxPerfReg(); if (G && UI.started) render(); } });
  if (/[?&]seed=(\d+)/.test(location.search)) UI.seed = +RegExp.$1;
  netInit();
  renderStart();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
