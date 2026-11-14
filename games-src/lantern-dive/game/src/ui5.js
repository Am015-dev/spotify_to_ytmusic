// ===================== part 5: drawers (jobs, log, rules, reference, menu), start screens, events, phone mode, boot =====================
function logHTML() { const e = h('div.logl'); if (!G) return e; for (let i = G.log.length - 1; i >= Math.max(0, G.log.length - 160); i--) e.appendChild(h('div.ll', h('span.lt', 'A' + G.log[i].att), ' ' + G.log[i].t)); return e; }
function buildRules() {
  const root = h('div.rules');
  const sec = (t, ...k) => { root.appendChild(h('h3', t)); k.forEach(x => root.appendChild(x)); };
  const ul = a => h('ul', ...a.map(t => h('li', t))), ol = a => h('ol', ...a.map(t => h('li', t)));
  sec('How a turn works', ol(['Read the line at the top. It says what to do now.', 'Glowing cards are playable. Dim cards are blocked.', 'Tap a glowing card. It slides to the table.', 'Each diver plays one card in turn.', 'The highest card of the led colour wins. A Lantern beats every colour.']));
  sec('The goal', h('p', 'You are a team of divers on a deep-sea expedition. Each dive lays out job cards. Every job is a condition on the tricks one diver wins. You win the dive together when every job is done, and you lose it together the moment one job cannot be done. Do not talk about your cards. Use signals instead.'));
  sec('How a dive goes', ol(['Everyone gets a hand. The diver with Lantern 4 is the Captain.', 'Job cards are drawn until their numbers add up to the dive\'s difficulty. Use the number for your team size.', 'Take jobs one at a time. The Captain goes first, then clockwise, until none are left.', 'Optional: light the distress flare to pass cards.', 'Each diver may signal once. Then play the tricks. The Captain leads first. The winner of each trick leads next.', 'Every job done wins the dive. If one job cannot be met, the attempt is lost. Deal again.']));
  sec('The cards', h('p', '40 cards: Coral, Tide, Kelp and Sunstar, numbered 1 to 9, plus Lanterns 1 to 4. Lanterns beat every colour. With 3 divers, one has 14 cards and one card is never played. 4 divers play 10 tricks. 5 divers play 8.'));
  sec('A trick', ul(['The leader plays any card. Everyone must follow its colour if they can. Lanterns count as a colour. If you cannot follow, play anything.', 'A Lantern beats every colour. The highest Lantern wins. With no Lantern, the highest card of the led colour wins.', 'You are never forced to win.', 'Tap Last trick to see the previous trick. Only that one.']));
  sec('Signals', ul(['Once per dive, each diver may show one colour card. It must be their highest, lowest or only card of that colour. The token says which: top, bottom or middle.', 'You cannot show Lanterns. Signal between tricks only. The mark stays, even if it stops being true.', 'Murky water: the shown card gets no mark. Deep narcosis: tokens share a pool, two fewer than divers. Anyone may use one between tricks. Unknown waters: draw a colour card first. 1-3 normal, 4-6 murky, 7-9 narcosis.']));
  sec('Jobs', ul(['A job is done when it is met and cannot fail. A job breaks when it cannot be met.', 'Three jobs compare your tricks with the Captain\'s. The Captain cannot take them.', 'If both "first trick" and "first two tricks" are out and nobody can take both, swap one for a job of the same value.']));
  sec('The distress flare', h('p', 'Before signals, the team may light the flare. Everyone passes one colour card left, or everyone right. It stays lit until the dive is won. The logbook counts one extra attempt. You may pass again each attempt.'));
  sec('Special dives', ul(['Captain\'s call (dives 10, 13): the Captain takes all jobs or hands them to a willing diver. If handed over, signal before the first trick.', 'One diver takes all jobs. Dive 6: team vote. Dives 14, 15, 16: volunteer in turn, yes or no. Dive 26: two volunteers.', 'Open briefing (dives 17, 28-31, deep dives): talk about jobs. Never about cards.', 'Some dives add limits. Examples: no holding two more 9s than another diver, or never leading Coral. Each dive shows its rule when it starts.', 'Clock dives (14, 15, 16, 26): beat the clock, or skip it and use the other rule shown. Turn the clock on in setup.']));
  sec('Two divers and the drone', h('p', 'With two divers, a drone joins as a third player. Its 14 cards lie in two rows: 7 face up, 7 face down. The Captain takes its jobs and plays its face-up cards. A face-down card turns up after the card on top is played.'));
  sec('On your phone', ul(['Tap a card to lift it. Tap again, or press Play, to play it. Dim cards are blocked. Tap a diver or job for details.', 'The bottom panel says what to do now. The Hint button suggests a card and why.', 'Hot-seat: a screen hides hands between turns. Online: you see only your own cards. There is no chat, only signals and emotes.']));
  root.appendChild(h('div', { html: '<section class="credits-audio"><h3>Credits</h3><p>Art and music by Am015-dev. Sounds were trimmed, loudness-normalised and converted for this game. Online play uses Trystero (MIT). The painted table is drawn with PixiJS (MIT). Names, job text and art are original; the paintings are by Am015-dev.</p></section>' }));
  return root;
}
// ---- reference drawer: every card, job and dive, with counts ----
function buildRef() {
  const root = h('div#refbody');
  const tab = UI.refTab || 'cards';
  const tabs = h('div.tabs', [['cards', 'Cards (40)'], ['jobs', 'Jobs (96)'], ['dives', 'Dives (32)'], ['tokens', 'Tokens']].map(([k, n]) => h('button.chipb' + (tab === k ? '.on' : ''), { 'data-a': 'reftab', 'data-v': k, type: 'button' }, n)));
  root.append(tabs);
  if (tab === 'cards') {
    D.suits.forEach(su => { root.append(h('h3', { style: 'margin:8px 0 4px' }, su.name + (su.id === 4 ? ' (trump, 4 cards)' : ' (9 cards)'))); const g = h('div.cgrid'); const n = su.id === 4 ? 4 : 9; for (let v = 1; v <= n; v++) g.append(h('div.cdv', { html: cardS(D.card(su.id, v), 44) })); root.append(g); });
    root.append(h('p.sm', 'Reminder card (5): sits in your hand while your shown card is on the table.'));
  } else if (tab === 'jobs') {
    root.append(h('p.sm', 'Numbers are each job\'s difficulty for 3, 4 and 5 divers. 96 jobs.'));
    const l = h('div.jlist'); TASKS.forEach(t => l.append(h('div.jr', h('span.nn', t.id + 1), h('span', { style: 'flex:1' }, t.t + (t.cap ? '' : ' (not for the Captain)')), h('span.dd', t.d.join(' / '))))); root.append(l);
  } else if (tab === 'dives') {
    const p = Prog.load(); const l = h('div.jlist');
    D.missions.forEach(m => l.append(h('div.jr', h('span.nn', m.id), h('span', { style: 'flex:1' }, h('b', m.name), ' ', m.sel === 'fixed' ? 'Four fixed jobs.' : 'Difficulty ' + (m.timer && m.timer.altD ? m.d + ' (' + m.timer.altD + ' without the clock)' : m.d) + (m.guess ? '*' : '') + '.', m.rule ? h('div.sm', m.rule) : null), h('span.dd', p.done[m.id] ? p.done[m.id] + ' att.' : ''))));
    root.append(l, h('p.sm', '* This difficulty number is unconfirmed.'), h('p.sm', D.deep.note));
  } else {
    root.append(h('div.rcard', h('span', { style: 'width:56px;display:block', html: KIT.pingSVG({ size: 56 }) }), h('div.rt', h('b', 'Signal token (one per diver)'), h('div', 'Placed on a shown card. Top is highest, middle is only, bottom is lowest. Green is ready, red is spent.'))));
    root.append(h('div.rcard', h('span', { style: 'width:56px;display:block', html: KIT.pingSVG({ size: 56, spent: true }) }), h('div.rt', h('b', 'Spent signal'), h('div', 'Red after use. In murky water it sits beside the card.'))));
    root.append(h('div.rcard', h('span', { style: 'width:56px;display:block', html: KIT.flareSVG({ size: 56, on: true }) }), h('div.rt', h('b', 'Distress flare (1)'), h('div', 'Light it before a dive. Everyone passes a card. It adds one attempt.'))));
    root.append(h('div.rcard', h('span', { style: 'width:56px;display:block', html: KIT.cmdSVG({ size: 56 }) }), h('div.rt', h('b', 'Captain badge (1)'), h('div', 'Goes to the diver with Lantern 4. They pick jobs first and lead first.'))));
    root.append(h('div.rcard', h('span', { style: 'width:56px;display:block', html: KIT.reminderSVG({ w: 40 }) }), h('div.rt', h('b', 'Reminder card (5)'), h('div', 'Sits in your hand while your signalled card is on the table.'))));
    root.append(h('div.rcard', h('span', { style: 'width:56px;display:block', html: KIT.droneSVG({ size: 56 }) }), h('div.rt', h('b', 'The drone (two divers)'), h('div', D.helper.story))));
  }
  return root;
}
function renderJobDrawer() {
  const b = $('#jobbody'); if (!b) return; b.innerHTML = '';
  if (!G) { b.append(h('p.sm', 'No dive running.')); return; }
  b.append(h('p.sm', 'All jobs this attempt. Tap one for details.'));
  G.tasks.forEach((t, i) => { const st = jobSt(i); b.append(h('div.rjob' + (st > 0 ? '.ok' : st < 0 ? '.bad' : ''), { 'data-a': 'job', 'data-i': i, style: 'cursor:pointer' }, h('span.mk', { html: st > 0 ? KIT.iconSVG('tick', 24) : st < 0 ? KIT.iconSVG('cross', 24) : KIT.iconSVG('list', 24) }), h('span', h('b', (t.owner >= 0 ? pname(t.owner) : 'Unclaimed') + ': '), jobText(i) + ' (' + jobDiff(i) + ')'))); });
  if (G.mission.rule) b.append(h('p.sm', { style: 'margin-top:8px' }, 'Dive rule: ' + G.mission.rule));
  b.append(h('p.sm', 'Signalling: ' + ({ normal: 'normal', murky: 'murky water (no marks)', narc: 'deep narcosis (shared pool)', none: 'none' }[G.comm]) + (G.unk >= 0 ? '. Drawn colour card: ' + cname(G.unk) + '.' : '.')));
}
function renderDrawers() {
  if (!GX.open) return;
  if (GX.open === 'logd') { const b = $('#logbody'); b.innerHTML = ''; b.appendChild(logHTML()); }
  if (GX.open === 'setd') renderMenu();
  if (GX.open === 'jobd') renderJobDrawer();
  if (GX.open === 'refd') { const b = $('#refwrap'); b.innerHTML = ''; b.append(buildRef()); }
}
function renderMenu() {
  const b = $('#setbody'); b.innerHTML = '';
  const row = (l, ...k) => b.appendChild(h('div.mrow', h('div.lbl', l), h('div.mbt', k)));
  const tog = (name, on, label) => h('button.btn' + (on ? '' : '.alt'), { 'data-a': name, type: 'button', 'aria-pressed': on ? 'true' : 'false' }, label + ': ' + (on ? 'On' : 'Off'));
  if (NET.on) row('Online', h('button.btn', { 'data-a': 'netopen', type: 'button' }, 'Lobby'), h('button.btn.alt', { 'data-a': 'netleave', type: 'button' }, isHost() ? 'Close the room' : 'Leave the room'));
  else row('Game', h('button.btn', { 'data-a': 'menu', type: 'button' }, 'New dive'), h('button.btn.alt', { 'data-a': 'save', type: 'button' }, 'Save'), h('button.btn.alt' + (hasSave() ? '' : '.dis'), { 'data-a': 'loadsave', type: 'button', disabled: hasSave() ? null : true }, 'Load'));
  if (!NET.on) row('Computer speed', ...[['Fast', 150], ['Normal', 650], ['Slow', 1300]].map(([n, v]) => h('button.btn' + (AIDELAY === v ? '' : '.alt'), { 'data-a': 'speed', 'data-v': v, type: 'button' }, n)));
  if (!NET.on) { const tr = h('div.mrow', { html: tutBtn('btn') }); b.appendChild(tr); }
  
  row('Sound', tog('sound', UI.prefs.sound, 'Sound effects'), tog('music', UI.prefs.music, 'Music'), h('button.btn.alt', { 'data-a': 'musicopen', type: 'button' }, 'Choose music'));
  { const gg = gfxPref(); row('Graphics' + (PX.on ? (gg === 'auto' ? ' (now ' + PX.q + ')' : '') : ' (simple view)'), ...[['auto', 'Auto'], ['high', 'High'], ['medium', 'Medium'], ['low', 'Low']].map(([v, n]) => h('button.btn' + (gg === v ? '' : '.alt'), { 'data-a': 'gfx', 'data-v': v, type: 'button', 'aria-pressed': gg === v ? 'true' : 'false' }, n))); }
  let sp = ''; try { sp = /[?&]perf=1/.test(location.search) && window.PerfHUD && PerfHUD.buttonsHTML ? PerfHUD.buttonsHTML('btn alt') : ''; } catch (e) { }   // Show speed / Test speed only behind ?perf=1
  row('Info', h('button.btn.alt', { 'data-a': 'rules', type: 'button' }, 'How to play'), h('button.btn.alt', { 'data-a': 'ref', type: 'button' }, 'Cards, jobs, dives'), h('span.tinyc', { html: sp }));
  if (NET.on) row('Emotes (no card talk)', ...['👍', '👋', '👏', '🫧'].map(e => h('button.btn.alt', { 'data-a': 'emote', 'data-v': e, type: 'button', 'aria-label': 'Emote ' + e }, e)));
  b.appendChild(h('p.sm', 'Lantern Dive is an original co-op card game. Audio credits are in How to play.'));
}
// ---------- start screens: painted title -> setup (dive, crew) / online ----------
const SEAT_ORDER = [0, 1, 2, 3];
// the first real dive (R5): dive 1 is the guided dive (one job, over in two tricks), so a new logbook starts on dive 3, a full dive with several jobs.
// Dives 1 and 2 stay one tap away in the logbook grid.
function startDive() { const p = Prog.load(); return p.cur <= 1 && !p.done[1] && !p.done[2] ? 3 : Math.min(32, p.cur || 1); }
function optObj() { const o = UI.opt = UI.opt || Object.assign({}, DEF, { mission: startDive(), lv: DEF.lv.slice(), seats: DEF.seats.slice() }); if (!Array.isArray(o.seats)) o.seats = chefsFor(o.np || 4, o).slice(1); if (!o.lv) o.lv = DEF.lv.slice(); o.np = o.seats.length + 1; return o; }
function setNp(n) { const o = optObj(), want = Math.max(1, Math.min(4, n - 1)); const st = o.seats.slice(); while (st.length > want) st.pop(); for (const c of SEAT_ORDER) { if (st.length >= want) break; if (st.indexOf(c) < 0) st.push(c); } o.seats = st; o.np = st.length + 1; }
function toggleChef(c) { const o = optObj(), st = o.seats.slice(), i = st.indexOf(c); if (i >= 0) { if (st.length > 1) st.splice(i, 1); else { toast('You need at least one other diver.'); return; } } else if (st.length < 4) st.push(c); o.seats = st; o.np = st.length + 1; }
function firstTime() { try { return !Object.keys(Prog.load().done || {}).length && !lsGet('ld_save') && !(typeof GXT !== 'undefined' && GXT.status('lantern-dive').seen); } catch (e) { return false; } }
function logoSVG() { return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="#0e2146" stroke="#ffd873" stroke-width="1.4"/><circle cx="13" cy="9" r="4.4" fill="#ffe9a6" stroke="#0b1f3a" stroke-width="1"/><path d="M13 13.4C13 16 10 16 8 19" fill="none" stroke="#ffd873" stroke-width="1.6" stroke-linecap="round"/></svg>'; }
function missionLine(o) {
  const kind = o.kind || 'log';
  if (kind === 'log') { const m = D.missions[(o.mission | 0) - 1] || D.missions[0]; return 'Dive ' + m.id + ': ' + m.name + (m.sel === 'fixed' ? '' : ' · difficulty ' + m.d); }
  if (kind === 'free') return 'Free dive · difficulty ' + o.d;
  if (kind === 'job') return 'Job practice · ' + TASKS[Math.max(0, Math.min(95, (o.job | 0) - 1))].s;
  return 'Deep dive · difficulty ' + o.deep;
}
function tableLine(o) { const nm = o.seats.map(c => D.names[c]); return 'You + ' + nameList(nm) + ' · ' + o.np + ' players' + (o.np === 2 ? ' + a drone' : ''); }
function renderStart() {
  const s = $('#start'); s.hidden = false; s.innerHTML = '';
  const rs = $('#rs'); if (rs && !UI.rsOpen) { rs.hidden = true; }
  if (NET.on) { s.dataset.v = 'net'; netStartScreen(s); return; }
  if (!UI.sv) UI.sv = UI.onl ? 'online' : 'title';
  s.dataset.v = UI.sv;
  if (UI.sv === 'title') { s.appendChild(titleEl()); return; }
  if (KIT.ART.title) s.appendChild(h('img.ttl-bg.dim', { src: KIT.ART.title, alt: '' }));
  if (UI.sv === 'online') { s.appendChild(onlineEl()); return; }
  if (UI.sv === 'descent') { s.appendChild(descentEl()); return; }
  s.appendChild(setupEl());
}
// W479: the owner\'s painted crew and the real 3D lantern fill the title screen (the lantern <img> becomes the live .glb model when the device allows)
const CAMP_CREW = [['brack', 'Brack'], ['bram', 'Bram'], ['dag', 'Dag'], ['nerea', 'Nerea'], ['sumi', 'Sumi'], ['echo', 'Echo']], CAMP_FOES = [['lampless', 'Lampless'], ['maze', 'Maze'], ['undertow', 'Undertow']];
const campPic = (k, n) => h('figure.cpic', h('img', { src: 'media/camp-' + k + '.webp', alt: n, width: 50, height: 50, decoding: 'async', draggable: 'false' }), h('figcaption', n));
function heroEl() {
  return h('div.hero', h('img.herolan', { src: 'models/lantern.webp', alt: 'The lantern', width: 150, height: 150, decoding: 'async', draggable: 'false', 'data-spin': window.LD_SOFT ? '0' : null }),
    h('div.crew', { 'aria-label': 'Your crew' }, CAMP_CREW.map(c => campPic(c[0], c[1]))),
    h('div.crew.foes', { 'aria-label': 'Dangers below' }, CAMP_FOES.map(c => campPic(c[0], c[1]))));
}
function titleEl() {
  const bg = KIT.ART.title ? h('img.ttl-bg', { src: KIT.ART.title, alt: '' }) : h('div.ttl-bg.ttl-plain');
  const sv = hasSave();
  return h('div.ttl', bg, h('div.ttl-in',
    h('h1.logo', h('span.ic', { html: logoSVG() }), h('span', 'Lantern Dive')),
    h('p.tag', 'Dive together. Do not talk about your cards.'),
    heroEl(),
    h('div.tbtns',
      firstTime() ? h('div.tutw', { html: tutBtn('tbtn go') }) : (window.CAMPAIGN
        ? h('button.tbtn.go.story', { 'data-a': 'story', type: 'button' }, h('b', 'Play Story'), ' ', h('span', campLine()))
        : h('button.tbtn.go.story', { 'data-a': 'descent', type: 'button' }, h('b', 'The Descent'), ' ', h('span', '4 zones, 4 bosses'))),
      sv ? h('button.tbtn.res', { 'data-a': 'loadsave', type: 'button' }, h('b', 'Continue'), ' ', h('span', 'your saved dive')) : null,
      h('div.qg', h('div.qgl', 'Quick game'),
        h('div.qrow',
          firstTime() && window.CAMPAIGN ? h('button.qseg', { 'data-a': 'story', type: 'button' }, 'Story') : null,
          window.CAMPAIGN ? h('button.qseg', { 'data-a': 'descent', type: 'button' }, 'Descent') : null,
          h('button.qseg', { 'data-a': 'play', type: 'button' }, 'Free play'),
          h('button.qseg', { 'data-a': 'online', type: 'button' }, 'Online'),
          firstTime() ? null : h('div.tutw', { html: tutBtn('qseg') }))))));
}
function dinerCard(c, o) {
  const b = D.blurbs[c], on = o.seats.indexOf(c) >= 0, lv = o.lv[c] || b.lv || 'normal', pc = KIT.DIVERS[c];
  const card = h('article.dcard' + (on ? '.on' : ''), { 'aria-label': D.names[c] + (on ? ', in the team' : ', not in the team') });
  card.style.setProperty('--dc', pc.helm);
  card.append(h('div.dtop', h('div.dimg', { html: avatarC(c, 120) }), h('h3', D.names[c], h('small', on ? lv : 'not invited'))), h('div.dtx', h('p.story', b.story), h('p.enjoy', b.enjoy),
    h('div.drow2', h('button.chipb.seatb' + (on ? '.on' : ''), { 'data-a': 'seatchef', 'data-c': c, type: 'button', 'aria-pressed': on ? 'true' : 'false' }, on ? 'In the crew ✓' : 'Invite'),
      on ? h('span.lvs', ['easy', 'normal', 'hard'].map(v => h('button.chipb' + (lv === v ? '.on' : ''), { 'data-a': 'lv', 'data-seat': c, 'data-v': v, type: 'button', 'aria-pressed': lv === v ? 'true' : 'false', 'aria-label': D.names[c] + ' plays ' + v }, v))) : null)));
  return card;
}
function diveCfg(o) {
  const ph = isPh(), kind = o.kind || 'log', p = Prog.load();
  const seg = (l, key, vals, lab) => h('div.seg', h('span.lbl', l), vals.map(v => h('button.chipb' + (o[key] === v ? '.on' : ''), { 'data-a': 'opt', 'data-k': key, 'data-v': v, type: 'button', 'aria-pressed': o[key] === v ? 'true' : 'false' }, lab ? lab[v] : v)));
  const out = [h('div.seg', h('span.lbl', 'Kind of dive'), [['log', 'Logbook'], ['free', 'Free dive'], ['job', 'Job practice'], ['deep', 'Deep dive']].map(([v, n]) => h('button.chipb' + (kind === v ? '.on' : ''), { 'data-a': 'opt', 'data-k': 'kind', 'data-v': v, type: 'button', 'aria-pressed': kind === v ? 'true' : 'false' }, n)))];
  if (kind === 'log') {
    const cur = Math.min(32, o.mission | 0 || p.cur || 1);
    out.push(h('p.ssub', missionLine(Object.assign({}, o, { mission: cur }))));
    const g = h('div.lgrid'); D.missions.forEach(m => { const dn = p.done[m.id], lock = m.id > Math.max(p.cur, 1) + 0 && false; g.append(h('button.lcell' + (cur === m.id ? '.cur' : '') + (dn ? '.dn' : ''), { 'data-a': 'pickdive', 'data-v': m.id, type: 'button' }, h('b', m.id + '. ' + m.name), h('span', (m.sel === 'fixed' ? 'Fixed jobs' : 'Difficulty ' + m.d) + (m.cmt !== 'normal' || m.timer ? ' · ' + (m.timer ? 'timed' : ({ murky: 'murky water', narc: 'narcosis', unknown: 'unknown waters', none: 'no signals' }[m.cmt] || m.cmt)) : '')), dn ? h('span.at', 'Done in ' + dn + ' attempt' + (dn === 1 ? '' : 's')) : (p.tries[m.id] ? h('span.at', p.tries[m.id] + ' failed') : null))); });
    out.push(g);
    if (m32done(p)) out.push(h('p.sm', 'All 32 dives logged. Deep Dive starts at difficulty 18.'));
  } else if (kind === 'free') {
    out.push(seg('Difficulty', 'd', [3, 5, 7, 9, 12, 15, 18], null), seg('Signalling', 'cmt', ['normal', 'murky', 'narc', 'unknown', 'none'], { normal: 'normal', murky: 'murky water', narc: 'narcosis', unknown: 'unknown waters', none: 'none' }));
  } else if (kind === 'job') {
    const j = Math.max(1, Math.min(96, o.job | 0 || 1)), t = TASKS[j - 1];
    out.push(h('div.seg', h('span.lbl', 'Job card'), h('button.chipb', { 'data-a': 'jobstep', 'data-v': -10, type: 'button', 'aria-label': 'Back ten' }, '−10'), h('button.chipb', { 'data-a': 'jobstep', 'data-v': -1, type: 'button', 'aria-label': 'Previous job' }, '‹'), h('b', { style: 'min-width:38px;text-align:center' }, j), h('button.chipb', { 'data-a': 'jobstep', 'data-v': 1, type: 'button', 'aria-label': 'Next job' }, '›'), h('button.chipb', { 'data-a': 'jobstep', 'data-v': 10, type: 'button', 'aria-label': 'Forward ten' }, '+10')), h('p.ssub', t.s + ': ' + t.t));
  } else {
    out.push(h('p.ssub', 'Deep dive at difficulty ' + o.deep + '. Open briefing, only the use of the flare is noted. Each success raises the number.'), h('div.seg', h('span.lbl', 'Difficulty'), h('button.chipb', { 'data-a': 'deepstep', 'data-v': -1, type: 'button' }, '−'), h('b', { style: 'min-width:38px;text-align:center' }, o.deep), h('button.chipb', { 'data-a': 'deepstep', 'data-v': 1, type: 'button' }, '+')));
  }
  out.push(h('div.seg', h('span.lbl', 'Clock'), h('button.chipb' + (o.timer ? '.on' : ''), { 'data-a': 'opt', 'data-k': 'timer', 'data-v': o.timer ? 0 : 1, type: 'button', 'aria-pressed': o.timer ? 'true' : 'false' }, o.timer ? 'On (real-time dives)' : 'Off'), h('span.sm', 'Only dives 14, 15, 16 and 26 have a clock.')));
  return out;
}
const m32done = p => !!p.done[32];
function setupEl() {
  const o = optObj(), ph = isPh(), open = !!UI.cfgOpen;
  const head = h('div.shead', h('button.px.sback', { 'data-a': 'title', type: 'button', 'aria-label': 'Back to the title' }, '‹'), h('h2', 'Set up the dive'));
  const sum = h('div.ssum', h('div.sfaces', o.seats.map(c => h('span', { html: avatarC(c, 64) }))), h('span.sline', missionLine(o) + ' · ' + tableLine(o)), h('button.btn.alt', { 'data-a': 'cfgopen', type: 'button', 'aria-expanded': open ? 'true' : 'false' }, 'Configure'));
  const cfg = h('div.cfg#cfg', { hidden: ph && !open ? true : null, role: ph ? 'dialog' : null, 'aria-label': ph ? 'Set up the dive' : null },
    ph ? h('div.cfghead', h('b', 'Set up the dive'), h('button.btn', { 'data-a': 'cfgclose', type: 'button' }, 'Done')) : null,
    diveCfg(o),
    h('div.seg', h('span.lbl', 'Team size'), [2, 3, 4, 5].map(v => h('button.chipb' + (o.np === v ? '.on' : ''), { 'data-a': 'opt', 'data-k': 'np', 'data-v': v, type: 'button', 'aria-pressed': o.np === v ? 'true' : 'false' }, v))),
    h('div.dgrid', [0, 1, 2, 3].map(c => dinerCard(c, o))),
    ph ? h('div.cfgfoot', h('button.btn.go', { 'data-a': 'cfgclose', type: 'button' }, 'Done')) : null);
  // first visit (nothing in the logbook yet): the guided dive is the big button, so a player who taps the big button learns first
  const fresh = (() => { try { return !Object.keys(Prog.load().done || {}).length; } catch (e) { return false; } })();
  const bStart = (big) => h('button.sbtn' + (big ? '.big' : ''), { 'data-start': 'vs', 'data-a': 'start', 'data-m': 'vs', type: 'button' }, h('b', 'Start the dive'), ' ', h('span', missionLine(o)));
  const bGuided = (big) => h('div.tutw', { html: tutBtn('sbtn' + (big ? ' big' : '')) });
  const go = h('div.sgo',
    fresh ? bGuided(true) : bStart(true),
    h('div.sgrid3',
      fresh ? bStart(false) : bGuided(false),
      h('button.sbtn', { 'data-start': 'hot', 'data-a': 'start', 'data-m': 'hot', type: 'button' }, h('b', 'Hot-seat'), ' ', h('span', o.np + ' people, one device')),
      h('button.sbtn', { 'data-start': 'ai', 'data-a': 'start', 'data-m': 'ai', type: 'button' }, h('b', 'Watch'), ' ', h('span', 'computers play'))));
  return h('div.setup.scard', head, ph ? sum : h('p.ssub', 'Choose a dive and your crew. You can change each computer diver\'s level.'), cfg, go);
}
function onlineEl() {
  return h('div.setup.scard.onlv', h('div.shead', h('button.px.sback', { 'data-a': 'title', type: 'button', 'aria-label': 'Back to the title' }, '‹'), h('h2', 'Play online')),
    h('p.ssub', 'Host a dive and send friends the code or link. Nobody sees another hand. Computers fill empty seats. There is no chat, only signals.'),
    h('details.online#onl', { open: true }, h('summary', 'Free and direct'), h('div#netblock', netInner())));
}
function showStart() { try { GX.close(); } catch (e) { } UI.dlg = null; try { drawDlg(); } catch (e) { } closePop(); UI.cards = []; UI.sv = 'title'; UI.cfgOpen = false; clearInterval(UI.clk); const pc = $('#pc'); if (pc) { pc.hidden = true; pc.innerHTML = ''; } const pa = $('#pass'); if (pa) { pa.hidden = true; pa.innerHTML = ''; } closeRS(); clearTimeout(UI.tm); renderStart(); }
// ---------- events ----------
document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-a],[data-start]'); const pop = $('#ppop');
  if (!t) { if (UI.pop && !tutOn() && pop && !pop.contains(ev.target) && !ev.target.closest('#pc,.gx-drawer,#rs')) closePop(); return; }
  const a = t.dataset.a, d = t.dataset;
  if (netClick(a, t)) return;
  if (d.start && !a) { newGame(d.start); return; }
  const num = x => x === undefined ? undefined : +x;
  switch (a) {
    case 'hcard': tapHand(+d.id); break;
    case 'dcard': tapDrone(+d.id); break;
    case 'playcard': playSel(); break;
    case 'signal': sigStart(); break;
    case 'pingok': sigOk(); break;
    case 'noping': UI.pingSel = false; UI.sel = -1; render(); schedule(); break;
    case 'doping': { const m = myMoves().find(x => x.t === 'ping' && x.c === UI.sel); if (m && canAct()) doMove(m); break; }
    case 'ready': UI.preReady = true; render(); schedule(); break;
    case 'nosig': { const m = myMoves().find(x => x.t === 'nosig'); if (m && canAct()) doMove(m); break; }
    case 'pool': tapJob(+d.i); break;
    case 'pingc': tapPing(+d.id); break;
    case 'take': { const m = myMoves().find(x => x.t === 'take' && x.i === num(d.i)); if (m && canAct()) doMove(m); else toast('You cannot take that job.'); break; }
    case 'pass': case 'done': case 'keep': case 'offer': case 'accept': case 'decline': case 'yes': case 'no': { const m = myMoves().find(x => x.t === a); if (m && canAct()) doMove(m); break; }
    case 'vote': { const m = myMoves().find(x => x.t === 'vote' && x.f === num(d.f)); if (m && canAct()) doMove(m); break; }
    case 'dist': { const on = d.on === 'true'; const m = myMoves().find(x => x.t === 'dist' && x.on === on && (!on || x.dir === num(d.dir))); if (m && canAct()) doMove(m); break; }
    case 'give': { const m = myMoves().find(x => x.t === 'give' && x.c === UI.giveSel); if (m && canAct()) doMove(m); break; }
    case 'predict': { const m = myMoves().find(x => x.t === 'predict' && x.n === num(d.n)); if (m && canAct()) doMove(m); break; }
    case 'job': openJob(+d.i); break;
    case 'seat': { const vm = canAct() && G && G.phase === 'assign' && myMoves().find(x => x.t === 'vote' && x.f === +d.seat); if (vm) doMove(vm); else openSeat(+d.seat); break; }
    case 'last': if (tutOn() && !GXT.act({ type: 'tap', what: 'last' })) break; openLast(); break;
    case 'popx': if (tutOn() && !GXT.act({ type: 'tap', what: 'popx' })) break; closePop(); break;
    case 'tipok': tipOk(); break;
    case 'result': UI.overShown = false; showResult(); break;
    case 'nextdive': nextDive(); break;
    case 'retrysame': closeRS(); if (NET.on) { if (isHost()) { nextAttempt(true); } } else nextAttempt(true); break;
    case 'retrynew': closeRS(); if (NET.on) { if (isHost()) { nextAttempt(false); } } else nextAttempt(false); break;
    case 'rsclose': closeRS(); break;
    case 'takedev': case 'takeDevice': takeDevice(); break;
    case 'play': UI.sv = 'setup'; renderStart(); break;
    case 'story': campOpen(); break;
    case 'campfin': closeRS(); campFinish(); break;
    case 'descent': UI.sv = 'descent'; renderStart(); break;
    case 'descgo': closeRS(); descGo(); break;
    case 'descmap': closeRS(); showStart(); UI.sv = 'descent'; renderStart(); break;
    case 'descreset': descReset(); break;
    case 'dlgok': dlgOk(); break;
    case 'title': UI.sv = 'title'; UI.cfgOpen = false; renderStart(); break;
    case 'online': UI.sv = 'online'; UI.onl = true; renderStart(); break;
    case 'cfgopen': UI.cfgOpen = true; renderStart(); try { const c = $('#cfg'); if (c) c.querySelector('button').focus({ preventScroll: true }); } catch (e) { } break;
    case 'cfgclose': UI.cfgOpen = false; renderStart(); break;
    case 'seatchef': toggleChef(+d.c); renderStart(); break;
    case 'gfx': setGfx(d.v); renderMenu(); break;
    case 'menu': showStart(); break;
    case 'start': newGame(d.m); break;
    case 'opt': { const o = optObj(); if (d.k === 'np') setNp(+d.v); else if (d.k === 'kind') { o.kind = d.v; if (d.v === 'log' && !o.mission) o.mission = Prog.load().cur > 32 ? 32 : Prog.load().cur; if (d.v === 'deep') o.deep = Math.max(D.deep.start, Prog.load().deep.level); } else if (d.k === 'timer') o.timer = d.v === '1'; else { o[d.k] = isNaN(+d.v) ? d.v : +d.v; } renderStart(); break; }
    case 'pickdive': { const o = optObj(); o.mission = +d.v; renderStart(); break; }
    case 'jobstep': { const o = optObj(); o.job = Math.max(1, Math.min(96, ((o.job | 0) || 1) + (+d.v))); renderStart(); break; }
    case 'deepstep': { const o = optObj(); o.deep = Math.max(1, Math.min(60, (o.deep | 0) + (+d.v))); renderStart(); break; }
    case 'lv': { const o = optObj(); o.lv = (o.lv || DEF.lv).slice(); o.lv[+d.seat] = d.v; renderStart(); break; }
    case 'rules': GX.show('rulesd'); break;
    case 'ref': UI.refTab = UI.refTab || 'cards'; GX.show('refd'); break;
    case 'reftab': UI.refTab = d.v; { const b = $('#refwrap'); b.innerHTML = ''; b.append(buildRef()); } break;
    case 'save': toast(save() ? 'Dive saved.' : 'Could not save.'); break;
    case 'loadsave': if (!loadSave()) toast('No saved dive.'); break;
    case 'speed': AIDELAY = +d.v; savePrefs(); renderMenu(); break;
    case 'hints': hintsToggle(); break;
    case 'guide': UI.coach.level = d.v; UI.prefs.guide = d.v; savePrefs(); renderMenu(); break;
    case 'sound': UI.prefs.sound = !UI.prefs.sound; savePrefs(); try { if (window.GA) GA.setSfx(UI.prefs.sound); } catch (e) { } renderMenu(); break;
    case 'music': UI.prefs.music = !UI.prefs.music; savePrefs(); try { if (window.GA) GA.setMusic(UI.prefs.music); } catch (e) { } sndMusic(); renderMenu(); break;
    case 'musicopen': try { GX.close(); } catch (x) { } renderMusic(); GX.show('musicd'); break;
    case 'mpick': musicPick(d.s, d.c); renderMusic(); break;
    case 'mall': { const on = MLOOPS.every(k => MUS.pick[k] === 'all'); MLOOPS.forEach(k => musicPick(k, on ? MDEF[k] : 'all')); renderMusic(); break; }
    case 'mprev': musicPreview(d.s); renderMusic(); break;
    case 'mprevx': musicPreviewStop(); renderMusic(); break;
    case 'mmus': UI.prefs.music = UI.prefs.music === false; savePrefs(); try { if (window.GA) GA.setMusic(UI.prefs.music); } catch (x) { } MUS.want = null; sndMusic(); renderMusic(); break;
    case 'emote': netEmote(d.v); break;
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (UI.pop && !tutOn()) closePop(); else if (UI.pop) { }  else if (UI.rsOpen && G && G.phase === 'over' && UI.overShown) closeRS(); } });
// ---------- phone mode ----------
function applyPhone() {
  const q = /[?&]phone=(\d)/.exec(location.search); const vm = (window.GXV ? GXV.now() : { w: innerWidth, h: innerHeight }), w = vm.w, hh = vm.h, short = Math.min(w, hh);
  let ph = short <= 500 || (window.matchMedia && matchMedia('(pointer:coarse)').matches && short <= 600);
  if (q) ph = q[1] === '1';
  const r = document.documentElement.classList, was = r.contains('ph');
  r.toggle('ph', ph); r.toggle('ph-p', ph && w < hh); r.toggle('ph-l', ph && w >= hh);
  placePrompt(); if (was !== ph) { if (G && UI.started) render(); const st = $('#start'); if (st && !st.hidden && !NET.on && UI.sv === 'setup') renderStart(); }
}
function relayout() { applyPhone(); if (G && UI.started) render(); if (typeof pxResize === 'function') { try { pxResize(true); } catch (e) { } } }
// ---------- boot ----------
function boot() {
  GX.init({ key: 'ld' });
  GX.drawer('rulesd', 'How to play', buildRules(), true);
  GX.drawer('refd', 'Cards, jobs, dives', h('div#refwrap'), true);
  GX.drawer('jobd', 'All jobs', h('div#jobbody'));
  GX.drawer('logd', 'Log', h('div#logbody'));
  GX.drawer('setd', 'Menu', h('div#setbody'));
  GX.onShow = id => { renderDrawers(); };
  loadPrefs(); applyPhone();
  GXV.watch(relayout);
  try { if (window.GA) { const A = typeof GA_DATA !== 'undefined' ? GA_DATA : {}; GA.init({ sfx: A.sfx || {}, music: A.music || {}, key: 'ld' }); GA.setSfx(UI.prefs.sound); GA.setMusic(UI.prefs.music); } } catch (e) { }
  pxPerfReg();
  pxInit().then(ok => { if (ok) { pxPerfReg(); if (G && UI.started) render(); } });
  if (/[?&]seed=(\d+)/.test(location.search)) UI.seed = +RegExp.$1;
  netInit();
  renderStart();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
