// ===================== part 5: drawers (scores, log, cards, rules, menu), start screens, events, phone mode, boot =====================
function logHTML() { const e = h('div.logl'); for (let i = G.log.length - 1; i >= Math.max(0, G.log.length - 160); i--) e.appendChild(h('div.ll', h('span.lt', 'D' + G.log[i].round), ' ' + youText(G.log[i].t))); return e; }
function buildRules() {
  const root = h('div.rules');
  const sec = (t, ...k) => { root.appendChild(h('h3', t)); k.forEach(x => root.appendChild(x)); };
  const li = a => a.map(t => h('li', t));
  sec('Turn in one minute', h('ol', ...li([
    'Draw chips from your bag one by one. Each lands that many spaces along the dotted path in your cauldron.',
    'The white chips must add up to 7 or less. Over 7 and the cauldron explodes.',
    'Stop whenever you like. Your last chip decides your space: the big number is coins, the small brown badge is victory points.',
    'Then the day is counted: spend coins on new chips for your bag, spend rubies, and the next day begins.',
    'After day 9 the most victory points wins.'])), h('p.sm', 'The full rules follow.'));
  sec('The goal', h('p', 'You are a travelling potion-maker at the village fair. Over nine days you brew in your cauldron, sell what you make and stock your bag with better ingredients. The most victory points after day 9 wins.'));
  sec('How a day goes', h('ol', ...li([
    'The fair\'s seer turns up a fortune card. Purple cards happen at once, blue cards last all day.',
    'From day 2, anyone behind the leader gets a rat stone: your first chip starts one space further for every rat tail between you and the leader on the score track.',
    'Everybody brews at the same time. Draw a chip from your bag, it lands on the spiral as many spaces after the last chip as its number. Then decide: draw again, or stop.',
    'When everyone has stopped, the day is counted: the bonus die, chip powers, rubies, points, shopping.',
    'Spend rubies if you like, then the next day begins. Everything you drew goes back in your bag together with what you bought.'])));
  sec('Brewing and explosions', h('p', 'The white chips (Fizzpods) are dangerous. If the white numbers in your cauldron add up to more than 7, the cauldron explodes. The last chip stays, you must stop, and you must choose later: take the victory points of your space or shop with its coins, not both. Only white chips count towards the limit.'),
    h('p', 'Your flask can put the last white chip back into the bag (not the chip that exploded you), once per day. It stays empty until you refill it with 2 rubies.'),
    h('p', 'In the last day everybody secretly chooses Draw or Stop, and all choices are revealed together (Stir!). You can also draw at the same moment on every other day: the computers draw while you think.'));
  sec('The spiral', h('p', 'Your scoring space is the one right after your last chip. It shows coins (the big number, for shopping), victory points (the small brown number) and sometimes a ruby. Reach the last space and you get the spoon: 15 points and 35 coins.'));
  sec('Counting the day', h('ol', ...li([
    'Bonus die: among the cauldrons that did not explode, the one whose space has the most coins rolls the die (a tie on coins goes to the one further along the path; if even that is equal, they all roll). It gives 1 or 2 points, a ruby, one step further on for your droplet (your start marker), or a Marrow chip.',
    'Chip powers: black, green and purple chips act now (books say how).',
    'Rubies: a ruby on your scoring space gives you 1 ruby, even if you exploded.',
    'Points: you score the victory points of your space (exploded players choose points or shopping).',
    'Shopping: spend up to the coins of your space on one or two chips of different colours. Leftover coins are lost. Sold-out chips are gone.',
    'Rubies: 2 rubies move your droplet one space (your first chip starts further along every day) or refill the flask.'])));
  sec('The ingredient books', h('p', 'Orange and black are always in the shop. Green, blue and red come from the chosen set (1 to 4); yellow opens before day 2 and purple before day 3. Every colour has its own power: blue, red and yellow act when drawn, green, purple and black after the brew. Open the Cards drawer to read every book.'));
  sec('The last day and the end', h('p', 'On day 9 there is no shopping: every 5 coins and every 2 rubies you hold become 1 victory point. The most points wins; a tie goes to the cauldron that reached furthest on day 9.'));
  sec('Playing it', h('ul', ...li([
    'The ring on the spiral marks where you would score now. The box under the buttons shows the chance that the next chip explodes you.',
    'The small cauldrons at the top are the other players: tap one to watch it. Hot-seat plays one cauldron after the other with a pass screen, online everybody brews in parallel and the host collects every stop.',
    'The lightbulb at the top gives a hint for this very moment. The Menu switches the tips on or off and replays the Tutorial.'])));
  root.appendChild(h('div', { html: typeof CF_CREDITS !== 'undefined' ? CF_CREDITS : '' }));
  root.appendChild(h('p.sm', 'Cauldron Fair is an original game. Names, text and art are original; the rules follow the box.'));
  return root;
}
// the card reference: every chip, book, fortune card, the track
function buildRef() {
  const root = h('div.rules');
  const sec = (t, open, ...k) => { const d = h('details.refsec', open ? { open: true } : {}, h('summary', t)); k.forEach(x => d.appendChild(x)); root.appendChild(d); return d; };
  const supply = [['W', 'W1', 'W2', 'W3'], ['O', 'O1'], ['G', 'G1', 'G2', 'G4'], ['B', 'B1', 'B2', 'B4'], ['R', 'R1', 'R2', 'R4'], ['Y', 'Y1', 'Y2', 'Y4'], ['P', 'P1'], ['K', 'K1']];
  const t1 = h('table.reft'); t1.appendChild(h('tr', h('th', 'Chip'), h('th', 'In the box'), h('th', 'Where it comes from')));
  for (const row of supply) { const c = row[0]; t1.appendChild(h('tr', h('td', h('span.cb', chipN(c + (D.COLORS[c].vals[0]), 26), D.COLORS[c].name)), h('td', row.slice(1).map(k => k.slice(1) + ': ' + D.SUPPLY[k]).join(' · ')), h('td', c === 'W' ? 'Your starting bag (4 x 1, 2 x 2, 1 x 3) and a white 1 on day 6' : c === 'O' ? 'Shop, bonus die' : (c === 'Y' ? 'Shop from day 2' : c === 'P' ? 'Shop from day 3' : 'Shop')))); }
  sec('Reading the cauldron', true, h('ul', ...[ 'The big number on a space is its coins (what you can spend in the shop).', 'The small brown badge is its victory points; no badge means none.', 'A pink space with a ruby gives you a ruby when it is your scoring space.', 'The dotted path with arrows runs from the droplet (start) outwards to the spoon (15 VP and 35 coins).', 'The gold ring is the space you score if you stop now. A chip lands as many spaces further along as its number.'].map(x => h('li', x))));
  sec('Chips and how many exist (215)', true, h('p.sm', 'You start with 4 white 1, 2 white 2, 1 white 3, 1 Marrow and 1 Mossback. When a kind runs out it cannot be bought.'), t1);
  const bk = h('div'); const sets = G ? G.sets : { G: 1, B: 1, R: 1, Y: 1, P: 1 };
  const bookRow = (c, set, active) => { const b = c === 'O' ? D.BOOKS.O[0] : c === 'K' ? D.BOOKS.K[0] : D.BOOKS[c][set]; const pr = b.price.map((x, i) => [1, 2, 4][i] + ': ' + x).join(' · '); return h('div.rcard', chipN(c + '1', 40), h('div.rt', h('b', D.COLORS[c].name + (c === 'O' || c === 'K' ? '' : ' · ' + D.SET_NAMES[set]) + ' — ' + b.title + (active ? ' (in this game)' : '')), h('div.sm', 'Costs ' + pr + ' coins'), h('div', b.text))); };
  bk.appendChild(h('p.sm', 'The books of this game' + (G ? '' : ' (set 1 shown)') + ':')); ['O', 'K', 'G', 'B', 'R', 'Y', 'P'].forEach(c => bk.appendChild(bookRow(c, sets[c] || 1, true)));
  sec('Ingredient books in this game', true, bk);
  for (let s = 1; s <= 4; s++) { const d = h('div'); ['G', 'B', 'R', 'Y', 'P'].forEach(c => d.appendChild(bookRow(c, s, G && sets[c] === s))); sec(D.SET_NAMES[s] + ': all five books', false, d); }
  const fc = h('div'); D.FORTUNE.forEach(c => fc.appendChild(h('div.rcard', h('span.rfort.' + c.kind, fortImg(c, 'rfimg'), h('i', c.kind === 'blue' ? 'DAY' : 'NOW')), h('div.rt', h('b', c.name + ' (1)'), h('div', c.text)))));
  sec('Fortune cards (24: 11 blue, 13 purple)', false, h('p.sm', 'Blue cards last the whole day, purple cards happen at once. Options that name yellow or purple chips only work once that stall is open. ', h('a', { href: 'cards.html', target: '_blank', rel: 'noopener' }, 'See all 24 fortune paintings')), fc);
  const tt = h('table.reft'); tt.appendChild(h('tr', h('th', 'Space'), h('th', 'Coins'), h('th', 'VP'), h('th', 'Ruby')));
  for (let i = 1; i < D.TRACK_LEN; i++) tt.appendChild(h('tr', h('td', i === D.SPOON ? '53 (spoon)' : i), h('td', D.COINS[i]), h('td', D.VP[i]), h('td', D.RUBY[i] ? '◆' : '')));
  sec('The cauldron spiral (spaces 1 to 53)', false, h('p.sm', 'Chips sit on spaces 1 to 52. Your scoring space is the one after your last chip. Past 52 the chip stays on 52 and you score the spoon.'), tt);
  const dg = h('div.rcard', h('div.rt', h('b', 'The bonus die (6 faces)'), h('div', D.DIE.map(f => D.DIE_TEXT[f]).join(', ') + '.'), h('div.sm', 'Rolled by the cauldron on the highest coin number among those that did not explode.')));
  sec('Bonus die and rat tails', false, dg, h('div.rcard', h('div.rt', h('b', 'Rat tails'), h('div', 'The score track has a rat tail after every even number of victory points. Count the tails between you and the leader: that many spaces ahead of the droplet is where your first chip starts (from day 2).'))));
  return root;
}
function renderScores() {
  const b = $('#scorebody'); if (!b || !G) return; b.innerHTML = '';
  const order = G.players.slice().sort((a, c) => c.vp - a.vp);
  const mx = Math.max(20, ...G.players.map(p => p.vp));
  const t = h('table.reft'); t.appendChild(h('tr', h('th', 'Cauldron'), h('th', 'VP'), h('th', 'Rubies'), h('th', 'Droplet'), h('th', 'Flask'), h('th', 'Bag')));
  for (const p of order) t.appendChild(h('tr', h('td', h('span.nm', { style: 'display:flex;align-items:center;gap:6px' }, h('span', { html: avHTML(p.seat, 26) }), isMine(p.seat) ? 'You' : p.name)), h('td', h('b', p.vp)), h('td', p.rubies), h('td', p.droplet), h('td', p.flask ? 'full' : 'empty'), h('td', bagN(p))));
  b.appendChild(t);
  b.appendChild(h('h3', 'Score track'));
  for (const p of order) { const w = Math.min(100, 100 * p.vp / mx); b.appendChild(h('div', { style: 'display:flex;align-items:center;gap:8px;margin:5px 0' }, h('span', { style: 'width:62px;font-weight:800;font-size:13px' }, p.name), h('div', { style: 'flex:1;height:16px;border-radius:8px;background:#e9dcc0;overflow:hidden' }, h('i', { style: 'display:block;height:100%;border-radius:8px;width:' + w + '%;background:' + pcol(p.seat) })), h('b', p.vp))); }
  const ro = G.rep ? G.rep.round : 0; const days = []; for (let r = 1; r <= LASTD(); r++) if (G.hist.some(x => x.round === r)) days.push(r);
  if (days.length) { b.appendChild(h('h3', 'Each day')); const dt = h('table.reft'); const hr = h('tr', h('th', 'Cauldron')); days.forEach(r => hr.appendChild(h('th', 'D' + r))); dt.appendChild(hr); for (const p of G.players) { const rw = h('tr', h('td', p.name)); days.forEach(r => { const x = G.hist.find(y => y.round === r && y.seat === p.seat); rw.appendChild(h('td', x ? (x.boom ? '✖ ' : '') + '+' + x.gain : '')); }); dt.appendChild(rw); } b.appendChild(h('div', { style: 'overflow-x:auto' }, dt)); b.appendChild(h('p.sm', '✖ = the cauldron exploded that day.')); }
}
function renderDrawers() {
  if (!GX.open || !G) return;
  if (GX.open === 'logd') { const b = $('#logbody'); b.innerHTML = ''; b.appendChild(logHTML()); }
  if (GX.open === 'scored') renderScores();
  if (GX.open === 'setd') renderMenu();
  if (GX.open === 'refd') { const b = $('#refbody'); if (b && !b.dataset.k) { b.dataset.k = '1'; b.innerHTML = ''; b.appendChild(buildRef()); } }
}
function renderMenu() {
  const b = $('#setbody'); b.innerHTML = '';
  const online = typeof NET !== 'undefined' && NET.on;
  const row = (l, ...k) => b.appendChild(h('div.mrow', h('div.lbl', l), h('div.mbt', k)));
  const tog = (name, on, label) => h('button.btn' + (on ? '' : '.alt'), { 'data-a': name, type: 'button', 'aria-pressed': on ? 'true' : 'false' }, label + ': ' + (on ? 'On' : 'Off'));
  if (online) row('Online', h('button.btn', { 'data-a': 'netopen', type: 'button' }, 'Lobby'), h('button.btn.alt', { 'data-a': 'netleave', type: 'button' }, isHost() ? 'Close the room' : 'Leave the room'));
  else row('Game', h('button.btn', { 'data-a': 'menu', type: 'button' }, 'New game'), h('button.btn.alt', { 'data-a': 'save', type: 'button' }, 'Save'), h('button.btn.alt' + (hasSave() ? '' : '.dis'), { 'data-a': 'loadsave', type: 'button', disabled: hasSave() ? null : true }, 'Load'));
  if (!online) row('Computer speed', ...[['Fast', 150], ['Normal', 650], ['Slow', 1300]].map(([n, v]) => h('button.btn' + (AIDELAY === v ? '' : '.alt'), { 'data-a': 'speed', 'data-v': v, type: 'button' }, n)));
  if (!online) b.appendChild(tutNode('btn', true));
  if (typeof hlpInit === 'function') { hlpInit(); if (typeof GXH !== 'undefined') { const w = h('div'); w.innerHTML = GXH.settingsHTML({ rowClass: 'mrow', btnClass: 'btn' }); while (w.firstChild) b.appendChild(w.firstChild); } }
  row('Sound', tog('sound', UI.prefs.sound, 'Sound effects'), tog('music', UI.prefs.music, 'Music'), h('button.btn.alt', { 'data-a': 'musicopen', type: 'button' }, 'Choose music'));
  { const gp = typeof gfxPref === 'function' ? gfxPref() : 'auto'; row('Graphics' + (typeof PX !== 'undefined' && PX.on ? (gp === 'auto' ? ' (now ' + PX.q + ')' : '') : ' (simple view)'), ...[['auto', 'Auto'], ['high', 'High'], ['medium', 'Medium'], ['low', 'Low']].map(([v, n]) => h('button.btn' + (gp === v ? '' : '.alt'), { 'data-a': 'gfx', 'data-v': v, type: 'button', 'aria-pressed': gp === v ? 'true' : 'false' }, n))); }
  let sp = ''; try { sp = window.PerfHUD && PerfHUD.buttonsHTML ? PerfHUD.buttonsHTML('btn alt') : ''; } catch (e) { }
  row('Info', h('button.btn.alt', { 'data-a': 'rules', type: 'button' }, 'How to play'), h('button.btn.alt', { 'data-a': 'drawer', 'data-v': 'logd', type: 'button' }, 'Log'), h('button.btn.alt', { 'data-a': 'drawer', 'data-v': 'refd', type: 'button' }, 'Chips and cards'), h('span.tinyc', { html: sp }));
  b.appendChild(h('p.sm', 'Cauldron Fair is an original game. Names, text and art are original; the audio credits are in How to play.'));
}
// ---------- start screens: painted title -> setup (character cards) / online ----------
const SETCHOICES = [[1, 'Beginner set', 'Set 1: easiest to learn, recommended for a first game.'], [2, 'Set 2', 'Safe harbour, side pockets, double steps.'], [3, 'Set 3', 'Lucky sevens, pod pushers, roomier pots.'], [4, 'Set 4', 'Ruby treasure, upgrades, stretching roots.'], ['random', 'Random mix', 'Every colour gets a random set 1 to 4.']];
function optObj() { const o = UI.opt = UI.opt || Object.assign({}, DEF, { seats: DEF.seats.slice(), lvBy: Object.assign({}, DEF.lvBy) }); o.np = o.seats.length + 1; return o; }
function setNp(n) { const o = optObj(), want = Math.max(1, Math.min(3, n - 1)); const st = o.seats.slice().filter(c => c !== o.me); while (st.length > want) st.pop(); for (let c = 0; c < 4 && st.length < want; c++) if (c !== o.me && st.indexOf(c) < 0) st.push(c); o.seats = st; o.np = st.length + 1; }
function toggleChar(c) { const o = optObj(); if (c === o.me) return; const st = o.seats.slice(), i = st.indexOf(c); if (i >= 0) { if (st.length > 1) st.splice(i, 1); else { toast('At least one other maker joins you.'); return; } } else { if (st.length >= 3) st.shift(); st.push(c); } o.seats = st; o.np = st.length + 1; }
function setMe(c) { const o = optObj(); if (c === o.me) return; o.me = c; o.seats = o.seats.filter(x => x !== c); for (let k = 0; k < 4 && o.seats.length < Math.max(1, o.np - 1); k++) if (k !== c && o.seats.indexOf(k) < 0) o.seats.push(k); o.np = o.seats.length + 1; }
function logoSVG() { return '<svg viewBox="0 0 24 24"><circle cx="12" cy="13.5" r="9" fill="#2a8a80" stroke="#fff6dc" stroke-width="1.6"/><ellipse cx="12" cy="8.5" rx="8" ry="3" fill="#5fc6a8" stroke="#fff6dc" stroke-width="1.2"/><circle cx="9" cy="14.5" r="1.8" fill="#fff6dc"/><circle cx="14.5" cy="16.5" r="1.3" fill="#fff6dc"/><circle cx="15" cy="5.5" r="1.4" fill="#fff6dc" opacity=".8"/></svg>'; }
function tableLine(o) { const nm = o.seats.map(c => PN[c]); return 'You (' + PN[o.me] + ') + ' + nameList(nm) + ' · ' + o.np + ' makers'; }
function renderStart() {
  const s = $('#start'); s.hidden = false; s.innerHTML = '';
  const rs = $('#rs'); if (rs && !UI.rsOpen) { rs.hidden = true; }
  if (typeof NET !== 'undefined' && NET.on) { s.dataset.v = 'net'; netStartScreen(s); return; }
  if (!UI.sv) UI.sv = UI.onl ? 'online' : 'title';
  s.dataset.v = UI.sv;
  if (UI.sv === 'title') { s.appendChild(titleEl()); return; }
  if (KIT.ART.title) s.appendChild(h('img.ttl-bg.dim', { src: KIT.ART.title, alt: '' }));
  if (UI.sv === 'online') { s.appendChild(onlineEl()); return; }
  s.appendChild(setupEl());
}
function titleEl() {
  const bg = KIT.ART.title ? h('img.ttl-bg', { src: KIT.ART.title, alt: '' }) : h('div.ttl-bg.ttl-plain');
  const sv = hasSave();
  return h('div.ttl', bg, h('div.ttl-in',
    h('div', h('h1.logo', h('span.ic', { html: logoSVG() }), h('span', 'Cauldron Fair')), h('p.tag', 'Brew bold. Stop wise.')),
    h('div.tbtns',
      firstTime() ? tutNode('tbtn go') : null,
      h('button.tbtn.story', { 'data-a': 'story', type: 'button' }, h('b', '\u2728 Story'), h('span', campLine() || 'Ten chapters, three bosses')),
      h('button.tbtn' + (firstTime() ? '' : '.go'), { 'data-a': 'play', type: 'button' }, h('b', 'Play'), h('span', 'against the computer makers')),
      h('button.tbtn', { 'data-a': 'online', type: 'button' }, h('b', 'Online'), h('span', 'with friends, free')),
      sv ? h('button.tbtn', { 'data-a': 'loadsave', type: 'button' }, h('b', 'Resume'), h('span', 'your saved fair')) : null,
      h('button.tlink', { 'data-a': 'rules', type: 'button' }, 'How to play'))));
}
function charCard(c, o) {
  const ch = D.CHARS[c], me = c === o.me, on = me || o.seats.indexOf(c) >= 0, lv = (o.lvBy && o.lvBy[c]) || TEMPER[c];
  const card = h('article.dcard' + (on ? '.on' : ''), { 'aria-label': ch.name + (me ? ', you' : on ? ', at the table' : ', not at the table') }); card.style.setProperty('--dc', ch.css);
  card.append(h('div.dtop', h('div.dimg', { html: avHTML(c, 120).replace(/chefOf/, '') }), h('h3', ch.name, h('small', ch.title + (me ? ' · you' : on ? ' · ' + lv : '')))),
    h('div.dtx', h('p.story', ch.story), h('p.enjoy', ch.like),
      h('div.drow', me ? h('span.sm', 'You play this maker.') : h('button.chipb' + (on ? '.on' : ''), { 'data-a': 'seatchar', 'data-c': c, type: 'button', 'aria-pressed': on ? 'true' : 'false' }, on ? 'At the table ✓' : 'Invite'),
        !me && on ? h('span.lvs', ['easy', 'normal', 'hard'].map(v => h('button.chipb' + (lv === v ? '.on' : ''), { 'data-a': 'lv', 'data-c': c, 'data-v': v, type: 'button', 'aria-pressed': lv === v ? 'true' : 'false', 'aria-label': ch.name + ' plays ' + v }, v))) : null,
        !me ? h('button.chipb', { 'data-a': 'setme', 'data-c': c, type: 'button', 'aria-label': 'I want to play ' + ch.name }, 'Be ' + ch.name) : null)));
  return card;
}
function setupEl() {
  const o = optObj(), ph = isPh(), open = !!UI.cfgOpen;
  const head = h('div.shead', h('button.px.sback', { 'data-a': 'title', type: 'button', 'aria-label': 'Back to the title' }, '‹'), h('h2', 'Who brews at the fair?'));
  const sum = h('div.ssum', h('div.sfaces', [o.me].concat(o.seats).map(c => h('span', { html: avHTML(c, 64) }))), h('span.sline', tableLine(o) + ' · ' + (SETCHOICES.find(x => x[0] === o.sets) || SETCHOICES[0])[1]), h('button.btn.alt', { 'data-a': 'cfgopen', type: 'button', 'aria-expanded': open ? 'true' : 'false' }, 'Configure'));
  const cfg = h('div.cfg#cfg', { hidden: ph && !open ? true : null, role: ph ? 'dialog' : null, 'aria-label': ph ? 'Configure the table' : null },
    ph ? h('div.cfghead', h('b', 'Configure the table')) : null,
    h('div.seg', h('span.lbl', 'Table for'), [2, 3, 4].map(v => h('button.chipb' + (o.np === v ? '.on' : ''), { 'data-a': 'opt', 'data-k': 'np', 'data-v': v, type: 'button', 'aria-pressed': o.np === v ? 'true' : 'false' }, v))),
    h('div.seg', h('span.lbl', 'Ingredient books'), h('div.setpick', SETCHOICES.map(([v, n]) => h('button.chipb' + (o.sets === v ? '.on' : ''), { 'data-a': 'opt', 'data-k': 'sets', 'data-v': v, type: 'button', 'aria-pressed': o.sets === v ? 'true' : 'false' }, n)))),
    h('p.sm', (SETCHOICES.find(x => x[0] === o.sets) || SETCHOICES[0])[2]),
    h('div.dgrid', [0, 1, 2, 3].map(c => charCard(c, o))),
    ph ? h('div.cfgfoot', h('button.btn.go', { 'data-a': 'cfgclose', type: 'button' }, 'Done')) : null);
  const first = !UI.prefs.played;
  const bStart = h('button.sbtn' + (first ? '' : '.big'), { 'data-start': 'vs', 'data-a': 'start', 'data-m': 'vs', type: 'button' }, h('b', 'Start the fair'), h('span', 'You against ' + nameList(o.seats.map(c => PN[c]))));
  const bGuide = tutNode('sbtn' + (first ? ' big' : ''));
  const go = h('div.sgo', first ? [bGuide, bStart] : [bStart],
    h('div.sgrid3', first ? null : bGuide,
      h('button.sbtn', { 'data-start': 'hot', 'data-a': 'start', 'data-m': 'hot', type: 'button' }, h('b', 'Hot-seat'), h('span', o.np + ' people, one device')),
      h('button.sbtn', { 'data-start': 'ai', 'data-a': 'start', 'data-m': 'ai', type: 'button' }, h('b', 'Watch'), h('span', 'the makers play'))));
  return h('div.setup.scard', head, ph ? sum : h('p.ssub', 'Pick who is at the fair and choose a book set. Every maker has a temper; change their level if you like.'), cfg, go);
}
function onlineEl() {
  return h('div.setup.scard.onlv', h('div.shead', h('button.px.sback', { 'data-a': 'title', type: 'button', 'aria-label': 'Back to the title' }, '‹'), h('h2', 'Play online')),
    h('p.ssub', 'Host a fair and send friends the code or the link. Every browser connects directly; nobody sees your bag. Everybody brews at the same time. Empty seats go to the computer makers.'),
    h('details.online#onl', { open: true }, h('summary', 'Free, peer to peer'), h('div#netblock', netInner())));
}
function showStart() { try { GX.close(); } catch (e) { } UI.sv = 'title'; UI.cfgOpen = false; const pc = $('#pc'); if (pc) { pc.hidden = true; pc.innerHTML = ''; } closeRS(true); Object.keys(UI.tm).forEach(k => clearTimeout(UI.tm[k])); UI.tm = {}; renderStart(); }
// ---------- events ----------
document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-a],[data-start]');
  if (!t) { if (ev.target.closest('#cwrap,#caul') && G && G.phase === 'brew' && focusSeat() !== viewSeat()) { UI.fastAI = true; return; }
    if (ev.target.closest('#cwrap,#caul')) { const b = document.querySelector('.bagb:not([disabled])'); if (b) b.click(); } return; }   // tapping your own pot pulls a chip too
  const a = t.dataset.a, d = t.dataset;
  if (typeof netClick === 'function' && netClick(a, t)) return;
  if (d.start && !a) { newGame(d.start); return; }
  switch (a) {
    case 'mv': {
      const v = viewSeat(); if (UI.qT && Date.now() - UI.qT < 450 && t.closest('#qbox')) break;   // and so does the first brew screen after the report closed
      if (UI.advAt && Date.now() - UI.advAt < 450 && t.closest('#acts')) break;   // a pop-up that just opened under a finger ignores that tap
      if (BF.pulling) { if (t.classList.contains('bagb')) BF.fast = true; break; }   // during the pull: a tap on the bag hurries it, nothing else counts
      const m = (UI.legal[v] || [])[+d.i];
      if (m) {
        if (m.t === 'flask') { const pl = G.players[v], wc = pl.pot.filter(c => c.c === 'W').length; if (wc <= 1 && UI.flaskArm !== pl.ver) { UI.flaskArm = pl.ver; toast('That is your only white chip. Tap Flask again to put it back.'); break; } }
        if (m.t === 'ratset' || m.t === 'draw') UI.ratOpen = false;
        if (m.t === 'draw') UI.drawT = Date.now();
        else if (t.closest && t.closest('#qbox') && Date.now() - (UI.drawT || 0) < 600) break;   // a second quick tap on Draw must not pick the option that just appeared under the finger
        if (!tutAct({ what: 'mv', m })) break;      // the staged tutorial: only the asked move goes through (after every guard above, so the kit never moves on for a tap the game ignores)
        if (UI.tip && !UI.tip.modal && (m.t === 'draw' || m.t === 'stop')) { UI.tip = null; UI.tipMark = { round: G.round, log: G.logN }; renderTip(); }
        if (m.t === 'draw' && !UI.prefs.drew) { UI.prefs.drew = true; savePrefs(); }
        if (m.t === 'stop' && !UI.prefs.stopped) { UI.prefs.stopped = true; savePrefs(); }
        if (m.t === 'draw') { bfPull(m, v); break; }
        act(m, v);
      }
      break;
    }
    case 'hotgo': if (G && G.rep) { UI.hotShared = G.rep.round; closeRS(true); updateHolder(); checkReport(); render(); } break;
    case 'legx': UI.prefs.legendOff = true; savePrefs(); renderLegend(); break;
    case 'blgx': UI.prefs.blgSeen = true; savePrefs(); renderBlg(); break;
    case 'tipmore': UI.tipOpen = !UI.tipOpen; renderTip(); break;
    case 'fort': t.classList.toggle('open'); break;
    case 'fortchip': lpShow(t); break;
    case 'ratopen': if (!tutAct({ what: 'ratopen' })) break; UI.ratOpen = !UI.ratOpen; render(); break;
    case 'focus': UI.focus = +d.seat; UI.potSig = ''; render(); break;
    case 'rscont': if (!tutAct({ what: 'rscont' })) break; repContinue(); break;
    case 'shopsel': if (!tutAct({ what: 'shopsel', k: d.k })) break; shopToggle(d.k); break;
    case 'shopbuy': if (!tutAct({ what: 'shopbuy' })) break; shopBuy(); break;
    case 'rubysel': if (!tutAct({ what: 'rubysel', k: d.k })) break; rubySelect(d.k); break;
    case 'rubygo': if (!tutAct({ what: 'rubygo' })) break; rubyGo(); break;
    case 'shopclear': UI.shopSel = []; renderReport(); break;
    case 'take': takeDevice(); break;
    case 'tipok': tipOk(); break;
    case 'tipoff': UI.coach.level = 'off'; tipOk(); savePrefs(); break;
    case 'again': { const m = UI.mode, c = UI.cfg || {}; closeRS(true); UI.overShown = false; newGame(m === 'net' ? 'vs' : m, c); break; }
    case 'look': closeRS(true); UI.overShown = true; render(); break;
    case 'story': storyOpen(); break;
    case 'campfin': closeRS(true); campFinish(); break;
    case 'campgoal': campGoalToast(); break;
    case 'play': UI.sv = 'setup'; renderStart(); break;
    case 'online': UI.sv = 'online'; UI.onl = true; renderStart(); break;
    case 'title': UI.sv = 'title'; UI.cfgOpen = false; renderStart(); break;
    case 'cfgopen': UI.cfgOpen = true; renderStart(); break;
    case 'cfgclose': UI.cfgOpen = false; renderStart(); break;
    case 'seatchar': toggleChar(+d.c); renderStart(); break;
    case 'setme': setMe(+d.c); renderStart(); break;
    case 'gfx': setGfx && setGfx(d.v); renderMenu(); break;
    case 'menu': showStart(); break;
    case 'start': newGame(d.m, optObj()); break;
    case 'opt': { const o = optObj(); if (d.k === 'np') setNp(+d.v); else if (d.k === 'sets') o.sets = d.v === 'random' ? 'random' : +d.v; renderStart(); break; }
    case 'lv': { const o = optObj(); o.lvBy = Object.assign({}, o.lvBy); o.lvBy[+d.c] = d.v; renderStart(); break; }
    case 'rules': GX.show('rulesd'); break;
    case 'drawer': GX.show(d.v); break;
    case 'musicopen': try { GX.close(); } catch (x) { } renderMusic(); GX.show('musicd'); break;
    case 'mpick': musicPick(d.s, d.c); renderMusic(); break;
    case 'mprev': musicPreview(d.s); renderMusic(); break;
    case 'mprevx': musicPreviewStop(); renderMusic(); break;
    case 'mmus': UI.prefs.music = UI.prefs.music === false; savePrefs(); try { if (window.GA) GA.setMusic(UI.prefs.music); } catch (x) { } MUS.want = null; sndMusic(); renderMusic(); break;
    case 'save': toast(save() ? 'Game saved.' : 'Could not save.'); break;
    case 'loadsave': if (!loadSave()) toast('No saved game.'); break;
    case 'speed': AIDELAY = +d.v; savePrefs(); renderMenu(); break;
    case 'sound': UI.prefs.sound = !UI.prefs.sound; savePrefs(); try { if (window.GA) GA.setSfx(UI.prefs.sound); } catch (e) { } renderMenu(); break;
    case 'music': UI.prefs.music = !UI.prefs.music; savePrefs(); try { if (window.GA) GA.setMusic(UI.prefs.music); } catch (e) { } sndMusic(); renderMenu(); break;
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (UI.rsMode === 'final' && UI.overShown) closeRS(true); else if (UI.rsMode === 'report' && G && G.phase !== 'eval') repContinue(); } });
// ---------- phone mode ----------
function renderLegend() {
  const e = $('#legend'); if (!e) return; const on = G && UI.started && !UI.prefs.legendOff && (G.round <= 2 || UI.mode === 'guided') && G.phase !== 'over';
  e.hidden = !on; if (!on) { e.innerHTML = ''; return; } if (e.dataset.k) return; e.dataset.k = 1;
  e.append(h('span.lg.lgk', 'Spaces:'), h('span.lg', h('span.lgn', '12'), 'coins'), h('span.lg', h('span.lgb', '3'), 'VP'), h('span.lg', h('span', { html: ico('ruby', 16) }), 'ruby'), h('span.lg', 'path \u2192'), h('button.lgx', { 'data-a': 'legx', type: 'button', 'aria-label': 'Hide this key' }, '\u00d7'));
}
function renderBlg() {
  const e = $('#blg'); if (!e) return; const on = false;   // the header buttons carry their names on phones now
  e.hidden = !on; if (!on || e.dataset.k) return; e.dataset.k = 1;
  e.append(h('div', h('b', 'Top buttons, left to right: '), 'Scores, Log, Chips and cards, How to play, Menu.'), h('button.btn.go', { 'data-a': 'blgx', type: 'button' }, 'OK'));
}
function isPh() { return document.documentElement.classList.contains('ph'); }
function applyPhone() {
  const q = /[?&]phone=(\d)/.exec(location.search); const w = innerWidth, hh = innerHeight, short = Math.min(w, hh);
  let ph = short <= 500 || (window.matchMedia && matchMedia('(pointer:coarse)').matches && short <= 600);
  if (q) ph = q[1] === '1';
  const r = document.documentElement.classList, was = r.contains('ph');
  const shortP = ph && w < hh && hh < 600; r.toggle('ph', ph); r.toggle('ph-short', shortP); document.documentElement.style.setProperty('--dockh', (shortP ? 156 : Math.max(176, Math.min(214, Math.round(hh * .27)))) + 'px'); r.toggle('ph-p', ph && w < hh); r.toggle('ph-l', ph && w >= hh);
  document.documentElement.style.setProperty('--rail', Math.max(220, Math.min(292, Math.round(w * .33))) + 'px');
  document.documentElement.style.setProperty('--gx-sheet-h', (ph ? 'var(--dockh)' : '46dvh'));
  placePrompt(); if (was !== ph) { if (G && UI.started) render(); const st = $('#start'); if (st && !st.hidden && !(typeof NET !== 'undefined' && NET.on) && UI.sv === 'setup') renderStart(); }
}
let rzT = 0, rzT2 = 0, rzSig = '';
// One relayout path for window resize, orientationchange, visualViewport and the board's ResizeObserver. Each event used to cancel the
// others' timer, so the observer (which only re-rendered) could cancel applyPhone and leave the portrait layout classes on a landscape screen.
function relayout(force) {
  const bd = $('#board'), sig = innerWidth + 'x' + innerHeight + '|' + (bd ? bd.clientWidth + 'x' + bd.clientHeight : '');
  if (!force && sig === rzSig) return; rzSig = sig;
  applyPhone(); if (G && UI.started) { UI.potSig = ''; render(); if (UI.rsOpen && UI.rsMode === 'report') renderReport(); }
  if (typeof pxResize === 'function') { try { pxResize(true); } catch (e) { } }
}
function onResize() { clearTimeout(rzT); clearTimeout(rzT2); rzT = setTimeout(() => relayout(), 60); rzT2 = setTimeout(() => relayout(), 420); }   // iOS reports the old size for a moment after orientationchange
// ---------- boot ----------
function boot() {
  GX.init({ key: 'cf' });
  GX.drawer('rulesd', 'How to play', buildRules(), true);
  GX.drawer('refd', 'Chips, books and cards', h('div#refbody'), true);
  GX.drawer('logd', 'Log', h('div#logbody'));
  GX.drawer('scored', 'Scores and players', h('div#scorebody'));
  GX.drawer('setd', 'Menu', h('div#setbody'));
  extrasBoot();
  GX.onShow = id => { renderDrawers(); };
  loadPrefs(); applyPhone();
  addEventListener('resize', onResize); addEventListener('orientationchange', onResize);
  const bd = $('#board'); if (window.ResizeObserver) new ResizeObserver(() => { if (G && UI.started) onResize(); }).observe(bd);
  if (window.visualViewport) visualViewport.addEventListener('resize', onResize);
  if (window.GXV) GXV.watch(() => relayout(true));   // one debounced relayout for every size change (iOS reports the old size right after a rotation)
  try { if (window.GA) { const A = typeof GA_DATA !== 'undefined' ? GA_DATA : {}; GA.init({ sfx: A.sfx || {}, music: A.music || {}, key: 'cf' }); GA.setSfx(UI.prefs.sound); GA.setMusic(UI.prefs.music); } } catch (e) { }
  if (typeof pxPerfReg === 'function') pxPerfReg();
  if (typeof pxInit === 'function') pxInit().then(ok => { if (ok) { pxPerfReg(); if (G && UI.started) render(); } });
  if (/[?&]seed=(\d+)/.test(location.search)) UI.seed = +RegExp.$1;
  if (typeof netInit === 'function') netInit();
  renderStart();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
