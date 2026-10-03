// ===================== part 5: drawers (diners, log, rules, menu), start screen, events, phone mode, boot =====================
function logHTML() { const e = h('div.logl'); for (let i = G.log.length - 1; i >= Math.max(0, G.log.length - 150); i--) e.appendChild(h('div.ll', h('span.lt', 'R' + G.log[i].round + '.' + G.log[i].turn), ' ' + G.log[i].t)); return e; }
function buildRules() {
  const root = h('div.rules');
  const sec = (t, ...k) => { root.appendChild(h('h3', t)); k.forEach(x => root.appendChild(x)); };
  sec('The goal', h('p', 'You are a diner at a conveyor-belt sushi bar. Collect plates over three rounds and score points for sets, pairs, ladders and races. The highest total after the third round wins. Ties go to the diner with more Custard Cups.'));
  sec('How a round goes', h('ol', ...[
    'Everyone is dealt a hand: 10 plates with 2 diners, 9 with 3, 8 with 4 and 7 with 5.',
    'All diners secretly pick one plate from their hand at the same time. On your phone or computer: tap a plate to lift it, tap it again (or press Serve) to confirm.',
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
    'Hot-seat: the hands are hidden between diners, with a "pass the device" screen. Online: friends see only their own hand.'].map(t => h('li', t))));
  root.appendChild(h('div', { html: '<section class="credits-audio"><h3>Credits</h3><p>Music: &ldquo;Jazz Slower&rdquo; by Pro Sensory (OpenGameArt, CC0). Ambience: &ldquo;The Shop collection: convenience store drinks fridge drone 2&rdquo; by LEGIT Audio (OpenGameArt, CC0). Sound effects: Casino Audio, Impact Sounds, Interface Sounds, Music Jingles, RPG Audio and UI Audio by Kenney (kenney.nl, CC0). All sounds were trimmed, loudness-normalised and converted for this game.</p><p>Online play uses Trystero (MIT). Names, card text and art are original.</p></section>' }));
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
  let sp = ''; try { sp = window.PerfHUD && PerfHUD.buttonsHTML ? PerfHUD.buttonsHTML('btn alt') : ''; } catch (e) { }
  row('Info', h('button.btn.alt', { 'data-a': 'rules', type: 'button' }, 'How to play'), h('span.tinyc', { html: sp }));
  b.appendChild(h('p.sm', 'Kaiten Kitchen is an original conveyor-belt card game. Names, card text and art are original; the audio credits are in How to play.'));
}
// ---------- start screen ----------
function renderStart() {
  const s = $('#start'); s.hidden = false; s.innerHTML = '';
  const rs = $('#rs'); if (rs && !UI.rsOpen) { rs.hidden = true; }
  if (NET.on) { netStartScreen(s); return; }
  const o = UI.opt = UI.opt || Object.assign({}, DEF, { lv: DEF.lv.slice() });
  const seg = (l, key, vals, fmt) => h('div.seg', h('span.lbl', l), vals.map(v => h('button.chipb' + (o[key] === v ? '.on' : ''), { 'data-a': 'opt', 'data-k': key, 'data-v': v, type: 'button' }, fmt ? fmt(v) : v)));
  const lvRows = []; for (let k = 1; k < o.np; k++) lvRows.push(h('div.seg', h('span.lbl', h('span', { html: avatarS(k, 40) }), PN[k]), ['easy', 'normal', 'hard'].map(v => h('button.chipb' + ((o.lv[k - 1] || 'normal') === v ? '.on' : ''), { 'data-a': 'lv', 'data-seat': k, 'data-v': v, type: 'button' }, v))));
  const card = h('div.scard',
    h('h1', h('span', { html: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="#fbf0da" stroke="#4a2a22" stroke-width="1.6"/><circle cx="12" cy="12" r="7" fill="#e5553a" stroke="#4a2a22" stroke-width="1.2"/><circle cx="12" cy="12" r="3.2" fill="#fbf0da" stroke="#4a2a22" stroke-width="1"/></svg>' }), 'Kaiten Kitchen'),
    h('div.chefs', [0, 1, 2, 3, 4].map(i => h('span', { html: avatarS(i, 96) }))),
    h('p.tag', 'A conveyor-belt sushi card game for 2 to 5. Everyone picks a plate at the same time, then the hands slide to the left. Build the best meal over three rounds.'),
    h('button.sbtn.big', { 'data-start': 'guided', 'data-a': 'guided', type: 'button' }, h('b', 'Guided first game'), h('span', 'You and one friendly computer; short tips explain each plate the first time you meet it.')),
    h('div.opts', seg('Diners', 'np', [2, 3, 4, 5]), lvRows.length ? h('p.sm', 'Computer level for each chef:') : null, lvRows),
    h('div.sgrid',
      h('button.sbtn', { 'data-start': 'vs', 'data-a': 'start', 'data-m': 'vs', type: 'button' }, h('b', 'Play vs computer'), h('span', 'You against 1 to 4 chefs')),
      h('button.sbtn', { 'data-start': 'hot', 'data-a': 'start', 'data-m': 'hot', type: 'button' }, h('b', 'Hot-seat'), h('span', '2 to 5 people, one device')),
      h('button.sbtn', { 'data-start': 'ai', 'data-a': 'start', 'data-m': 'ai', type: 'button' }, h('b', 'Watch computers'), h('span', 'Sit back and learn'))),
    netBlock(),
    h('div.srow2', hasSave() ? h('button.btn', { 'data-a': 'loadsave', type: 'button' }, 'Continue saved game') : null, h('button.btn.alt', { 'data-a': 'rules', type: 'button' }, 'How to play')));
  s.appendChild(card);
}
function showStart() { try { GX.close(); } catch (e) { } closePop(); UI.cards = []; const pc = $('#pc'); if (pc) { pc.hidden = true; pc.innerHTML = ''; } closeRS(); clearTimeout(UI.tm); renderStart(); }
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
    case 'again': { const m = UI.mode, c = UI.cfg || {}; UI.cards = []; closeRS(); newGame(m === 'net' ? 'vs' : m, { np: c.np, level: c.level, lv: c.lv }); break; }
    case 'menu': showStart(); break;
    case 'start': newGame(d.m); break;
    case 'guided': newGame('guided'); break;
    case 'opt': { const o = UI.opt = UI.opt || Object.assign({}, DEF, { lv: DEF.lv.slice() }); o[d.k] = isNaN(+d.v) ? d.v : +d.v; if (d.k === 'level') o.lv = [d.v, d.v, d.v, d.v]; renderStart(); break; }
    case 'lv': { const o = UI.opt = UI.opt || Object.assign({}, DEF, { lv: DEF.lv.slice() }); o.lv = (o.lv || DEF.lv).slice(); o.lv[+d.seat - 1] = d.v; renderStart(); break; }
    case 'rules': GX.show('rulesd'); break;
    case 'save': toast(save() ? 'Game saved.' : 'Could not save.'); break;
    case 'loadsave': if (!loadSave()) toast('No saved game.'); break;
    case 'speed': AIDELAY = +d.v; savePrefs(); renderMenu(); break;
    case 'guide': UI.coach.level = d.v; UI.coach.keep = d.v === 'full'; renderMenu(); break;
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
  r.toggle('ph', ph); document.documentElement.style.setProperty('--dockh', Math.max(150, Math.min(206, Math.round(hh * .26))) + 'px'); r.toggle('ph-p', ph && w < hh); r.toggle('ph-l', ph && w >= hh);
  placePrompt(); if (was !== ph) { if (G && UI.started) render(); }
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
  const bd = $('#board'); if (window.ResizeObserver) new ResizeObserver(() => { if (G && UI.started) { clearTimeout(rzT); rzT = setTimeout(() => { if (G && UI.started) render(); }, 40); } }).observe(bd);
  try { if (window.GA) { const A = typeof GA_DATA !== 'undefined' ? GA_DATA : {}; GA.init({ sfx: A.sfx || {}, music: A.music || {}, key: 'kk' }); GA.setSfx(UI.prefs.sound); GA.setMusic(UI.prefs.music); } } catch (e) { }
  try { if (window.PerfHUD && PerfHUD.register) PerfHUD.register({ game: 'Kaiten Kitchen', anchor: '.gx-board', corner: 'tl', isAnimating: () => !!UI.busy, idleMode: 'demand' }); } catch (e) { }
  if (/[?&]seed=(\d+)/.test(location.search)) UI.seed = +RegExp.$1;
  netInit();
  renderStart();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
