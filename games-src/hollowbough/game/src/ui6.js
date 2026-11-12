// ===================== part 6: coach, drawers (log, rules, menu, rivals), start screen, events, phone mode, boot =====================
// (the old guided-game advice cards are gone: first-time help is the gx-help kit, see ui11.js)
// ---- drawers
const RULES = `<h3>How a turn works</h3><ol class="hwt"><li>The banner shows whose turn it is. The top line says what to do.</li><li>Tap a glowing place for a worker. Tap a glowing card to build it.</li><li>The move plays out, then your points or goods show.</li><li>Rivals play the same way.</li><li>When all workers are out, Prepare. When you are done, Pass.</li></ol>
<h3>The goal</h3><p>Build the best city. A city holds up to 15 cards. When all have passed, add up your points. Cards, tokens, bonuses, events and the Long Road all count. The highest total wins.</p>
<h3>How a turn goes</h3><p>On your turn, do <b>one</b> of these:</p><ul><li><b>Place a worker</b> on an open place and use it at once.</li><li><b>Play a card</b> from your hand or from the meadow by paying its price.</li><li><b>Prepare</b> (only when all your workers are out).</li></ul><p>When you are done, <b>Pass</b>. You take no more turns. Your city still scores.</p>
<h3>Places for workers</h3><ul><li><b>Brown places</b> give resources, cards or a point token. Some are Shared. Others take one worker.</li><li><b>Forest places</b> (green) take one worker. In a four-player game, two can share.</li><li><b>The Barter Burrow</b> trades cards for resources. Discard 2 cards, get 1 resource.</li><li><b>The Long Road</b> opens in Autumn. Discard 5, 4, 3 or 2 cards. The worker stays and scores that many points.</li><li><b>Destinations</b> are red cards in your city. A worker there uses the card. Open ones can be visited by rivals. The owner gets a point token.</li><li><b>Events</b> need a worker and the right city. Each can be claimed once.</li></ul>
<h3>Playing cards</h3><p>Pay the price in twigs, resin, pebbles and berries. Play from your hand or the eight-card meadow. Your hand holds 8 cards. A <b>unique</b> card can be in your city once. A common card can be in as often as you like.</p><p><b>Playing free:</b> each critter has one matching building. If you own it and it has no token, play the critter free. Put a token on the building. Each building does this once.</p><p>Some cards (Lantern Rest, Pulley Lift, Thornhold Cells, Gavel Marten, Hostler Hedgehog) change the price. They show as extra buttons when you play a card.</p>
<h3>Changes in this version</h3><ul><li>Resources never run out.</li><li>Each destination holds one worker. Cards with a permanent helper hold two.</li><li>Solo: a tie with the bear is a loss.</li><li>A worker on a claimed event comes home like the others.</li><li>The cemetery shows the top four cards of the discard pile.</li><li>An empty deck is refilled from the discard pile.</li></ul>
<h3>Card colours</h3><ul><li><b>Tan, Traveler:</b> works once when played.</li><li><b>Green, Production:</b> works when played, then every Spring and Autumn.</li><li><b>Red, Destination:</b> a place for workers.</li><li><b>Blue, Governance:</b> a lasting bonus or discount.</li><li><b>Purple, Prosperity:</b> bonus points at the end.</li></ul>
<h3>Seasons</h3><p>Everyone starts in Winter with 2 workers. <b>Spring</b> gives +1 worker and runs production. <b>Summer</b> gives +1 worker and 2 meadow cards. <b>Autumn</b> gives +2 workers and runs production again. Each player moves through seasons alone.</p>
<h3>Scoring</h3><p>Count printed card points, point tokens, purple bonuses, events and Long Road workers. Ties go to more events, then more leftover resources.</p>
<h3>Solo play</h3><p>You play Old Grimbeard. He picks places and cards by dice. You win with more points than he has. Pick Grumpy, Gruff or Ghastly.</p>
<h3>Tips</h3><ul><li>Build production early. It pays every Spring and Autumn.</li><li>Keep cheap cards in hand. Watch the meadow too.</li><li>Tap the lightbulb for a good move and why.</li></ul>`;
function logHTML() { const e = h('div.logl'); for (let i = G.log.length - 1; i >= Math.max(0, G.log.length - 150); i--) e.appendChild(h('div.ll', h('span.lt', G.log[i].turn), ' ' + G.log[i].t)); return e; }
function renderRival(seat) {
  const b = $('#rivalbody'); if (!b || !G) return; b.innerHTML = ''; seat = seat == null ? (UI.rseat != null ? UI.rseat : 0) : seat; UI.rseat = seat;
  const tabs = h('div.rtabs'); for (let s = 0; s < G.np; s++) tabs.appendChild(h('button.btn' + (s === seat ? '.on' : '.alt'), { 'data-a': 'rtab', 'data-seat': s, type: 'button' }, pawn(s, 14), ' ' + G.players[s].name));
  if (G.grim) tabs.appendChild(h('button.btn' + (seat === 'G' ? '.on' : '.alt'), { 'data-a': 'rtab', 'data-seat': 'G', type: 'button' }, D.soloName));
  b.appendChild(tabs);
  if (seat === 'G') {
    const g = HB.grimScore(G); b.appendChild(h('div.kv', h('span', 'Points so far'), h('b', g.total)));
    b.appendChild(h('p.sm', D.soloName + ' picks a meadow card with a die each turn. His city:'));
    G.grim.city.forEach(id => b.appendChild(rowCard(id)));
    return;
  }
  const p = G.players[seat], sc = score(seat);
  b.appendChild(h('div.rhead', pawn(seat, 28), h('div', h('b', p.name), h('div.sm', (p.ai ? 'Computer (' + p.ai + ')' : 'Player') + ' · ' + SEASN[p.season] + (p.passed ? ' · passed' : '')))));
  b.appendChild(h('div.kv', h('span', 'Points so far'), h('b', sc.total)));
  [['Cards in the city', sc.cards, 'points printed on your buildings and critters'], ['Point tokens', sc.tokens, 'tokens from cards and places'], ['Events', sc.events, 'flags you claimed (3 each for basic events)'], ['Bonus cards', sc.bonus, 'prosperity bonuses'], ['Journey', sc.journey, 'workers on the Long Road']].forEach(r => { if (r[1] || r[0] === 'Cards in the city') b.appendChild(h('div.kv.why', h('span', r[0] + ': ' + r[2]), h('b', '+' + r[1]))); });
  b.appendChild(h('div.kv', h('span', 'Workers'), h('b', availW(p) + ' free of ' + p.workers)));
  b.appendChild(h('div.kv', h('span', 'Cards in hand'), h('b', p.hand.length)));
  const rr = h('div.rrow'); RESK.forEach(k => rr.appendChild(h('span.rs', ic(k, 20), h('b', p.res[k])))); rr.appendChild(h('span.rs', ic('point', 20), h('b', p.pts))); b.appendChild(rr);
  const evs = []; G.bev.forEach(e => { if (e.o === seat) evs.push(D.basicEvents[e.k].name); }); G.sev.forEach(e => { if (e.o === seat) evs.push(D.specialEvents[e.k].name); });
  b.appendChild(h('div.kv', h('span', 'Events'), h('b.l', evs.join(', ') || 'none')));
  b.appendChild(h('h4', 'City (' + HB.cityCount(G, seat) + '/15)'));
  p.city.forEach(e => b.appendChild(rowCard(e.id, e)));
  if (!p.city.length) b.appendChild(h('p.sm', 'Empty so far.'));
}
function rowCard(id, e) {
  const c = cdef(id); const bits = []; if (e) { if (e.occ) bits.push('occupied'); if (e.tok) bits.push(e.tok + ' tokens'); if (e.w) bits.push(e.w + ' workers'); if (e.pris && e.pris.length) bits.push(e.pris.length + ' prisoners'); }
  return h('div.rc', cardEl(id, 54, { entry: e }), h('div', h('b', c.name), h('div.sm', TYPEN[c.type] + ' · ' + c.pts + ' pt' + (bits.length ? ' · ' + bits.join(', ') : '')), ...textLines(c.text).map(t => h('div.sm', t))));
}
function renderDrawers() {
  if (!GX.open || !G) return;
  if (GX.open === 'logd') { const b = $('#logbody'); b.innerHTML = ''; b.appendChild(logHTML()); }
  if (GX.open === 'rivald') renderRival();
}
// ---- start screen
function renderStart() {
  const s = $('#start'); s.hidden = false; s.innerHTML = '';
  if (NET.on) { netStartScreen(s); return; }
  const o = UI.opt = UI.opt || Object.assign({}, DEF);
  const seg = (l, key, vals, fmt) => h('div.seg', h('span.lbl', l), vals.map(v => h('button.chipb' + (o[key] === v ? '.on' : ''), { 'data-a': 'opt', 'data-k': key, 'data-v': v, type: 'button' }, fmt ? fmt(v) : v)));
  const modes = (firstTime() ? [['guided', 'Guided']] : []).concat([['vs', 'vs computer'], ['solo', 'Solo'], ['hot', 'Hot-seat'], ['ai', 'Watch']]).concat(window.CAMPAIGN ? [['story', 'Story']] : []);
  const mode = o.mode || (firstTime() ? 'guided' : 'vs');
  const playBtn = h('button.sbtn.big', { 'data-start': 'play', 'data-a': 'play', type: 'button' }, h('b', mode === 'story' ? 'Play the story' : 'Play'));
  const learnBtn = typeof GXT !== 'undefined' ? h('button.btn.learn', { 'data-a': 'learn', type: 'button' }, tutDone() ? 'Replay the coached first game' : 'New here? Learn in 5 minutes') : null;
  const startBtns = firstTime() && !tutDone() && learnBtn ? [learnBtn, playBtn] : [playBtn, learnBtn];   // first visit: the coached first game comes first
  const card = h('div.scard',
    h('h1', h('span', { html: ICO.tree }), 'Hollowbough'),
    h('p.tag', 'Build a woodland city. Outlast the winter.'),
    startBtns,
    h('div.opts',
      h('div.seg', h('span.lbl', 'Mode'), modes.map(m => h('button.chipb' + (mode === m[0] ? '.on' : ''), { 'data-a': 'opt', 'data-k': 'mode', 'data-v': m[0], type: 'button' }, m[1]))),
      mode === 'vs' || mode === 'hot' ? seg('Players', 'np', [2, 3, 4]) : null,
      mode === 'vs' ? seg('Computer', 'level', ['easy', 'normal', 'hard']) : null,
      mode === 'solo' ? seg('Rival', 'solo', [1, 2, 3], v => D.soloLevels[v - 1]) : null),
    netBlock(),
    hasSave() ? h('button.btn', { 'data-a': 'loadsave', type: 'button' }, 'Continue saved game') : null);
  s.appendChild(h('div.skylogo', { 'aria-hidden': 'true' }, 'Hollowbough', h('small', 'Build a woodland city. Outlast the winter.')));
  s.appendChild(card);
}
function showStart() { try { GX.close(); } catch (e) { } closePop(); UI.cards = []; clearTimeout(UI.tm); renderStart(); }
// card text in short lines (one idea per line, ~12 words): split at ; and at sentence ends, then at commas when still long
function textLines(t) { const out = []; String(t || '').split(/;\s*|(?<=\.)\s+/).forEach(s => { s = s.trim(); if (!s) return; if (s.split(/\s+/).length <= 12) { out.push(s); return; } let cur = ''; s.split(/,\s*/).forEach(c => { const n = cur ? cur + ', ' + c : c; if (cur && n.split(/\s+/).length > 12) { out.push(cur + ','); cur = c; } else cur = n; }); if (cur) out.push(cur); }); return out.flatMap(s => { const w = s.split(/\s+/); if (w.length <= 12) return [s]; const r = []; for (let i = 0; i < w.length; i += 10) r.push(w.slice(i, i + 10).join(' ')); return r; }); }
// ---- events
document.addEventListener('click', ev => {
  if (UI.zoomAt && Date.now() - UI.zoomAt < 450) { ev.preventDefault(); return; }
  const z = $('#zoom'); if (z && !z.hidden) { closeZoom(); return; }
  if (UI.lp) { UI.lp = false; return; }
  const t = ev.target.closest('[data-a],[data-start]');
  if (!t) { if (UI.sel && !ev.target.closest('[data-help]')) { UI.sel = null; render(); } return; }   // help (bulb, bubbles, rules cards) must not cancel an open choice
  const a = t.dataset.a, d = t.dataset;
  if (netClick(a, t)) return;
  if (d.start && !a) { newGame(d.start); return; }
  switch (a) {
    case 't': onTarget(d.t, t); break;
    case 'tm': { const m = UI.tm2 && UI.tm2[+d.mi]; if (m) { if (typeof tutGate === 'function' && !tutGate(UI.sel ? 'o:' + d.mi : tgOf(m), !!UI.sel)) break; UI.sel = null; actFrom(m, t); } break; }
    case 'selx': UI.sel = null; render(); break;
    case 'city': if (!UI.animBusy) { UI.sel = null; UI.cityOpen = { logN: G.logN }; snd('click', { vol: .4 }); render(); } break;
    case 'handtog': UI.handHide = !UI.handHide; snd('click', { vol: .4 }); render(); break;
    case 'cityx': UI.cityOpen = null; render(); break;
    case 'noop': break;
    case 'chip': UI.rseat = d.seat === 'G' ? 'G' : +d.seat; GX.show('rivald'); renderRival(UI.rseat); break;
    case 'rtab': renderRival(d.seat === 'G' ? 'G' : +d.seat); break;
    case 'cont': nextCard(); break;
    case 'take': takeDevice(); break;
    case 'again': { if (campOn()) { const dd = UI.camp; UI.cards = []; GXC.play(dd.id); break; } const m = UI.mode, c = UI.cfg || {}; UI.cards = []; newGame(m, { np: c.np, level: c.level, solo: c.solo }); break; }
    case 'menu': UI.camp = null; showStart(); break;
    case 'story': storyOpen(); break;
    case 'campfin': campFinish(); break;
    case 'start': if (d.m !== 'ai' && tutOffer(() => newGame(d.m))) break; newGame(d.m); break;
    case 'play': { const m = (UI.opt && UI.opt.mode) || (firstTime() ? 'guided' : 'vs'); if (m === 'guided') { if (tutOffer(() => newGame('guided'))) break; newGame('guided'); break; } if (m === 'story') { storyOpen(); break; } if (m !== 'ai' && tutOffer(() => newGame(m))) break; newGame(m); break; }
    case 'learn': tutStart(); break;
    case 'guided': if (tutOffer(() => newGame('guided'))) break; newGame('guided'); break;
    case 'opt': { UI.opt = UI.opt || Object.assign({}, DEF); UI.opt[d.k] = isNaN(+d.v) ? d.v : +d.v; renderStart(); break; }
    case 'rules': GX.show('rulesd'); break;
    case 'save': save(); toast('Game saved.'); break;
    case 'loadsave': if (!loadSave()) toast('No saved game.'); break;
    case 'speed': AIDELAY = +d.v; break;
    case 'sound': UI.sound = UI.sound === false; try { if (window.GA) { GA.setSfx(UI.sound); GA.setMusic(UI.sound); } } catch (e) { } GX.renderSettings(); break;
  }
});
// long-press on a card or a place: a big view with the details (the only place the details are written)
{ let lpT = 0, lpS = null;
  document.addEventListener('pointerdown', e => {
    const z = e.target.closest('[data-zoom]'); if (!z || (e.button != null && e.button > 0)) return;
    UI.lp = false; lpS = { x: e.clientX, y: e.clientY }; clearTimeout(lpT);
    lpT = setTimeout(() => { UI.lp = true; openZoom(z.dataset.zoom); try { navigator.vibrate && navigator.vibrate(12); } catch (x) { } }, 430);
  });
  // a plain tap on the draw pile / discards / seasons tile (nothing to play there) opens the same big view
  document.addEventListener('click', e => { const z = e.target.closest('.tile[data-zoom]'); if (z && ['deck', 'disc', 'tree'].includes(z.dataset.k) && !UI.lp && !z.classList.contains('glow')) openZoom(z.dataset.zoom); });
  document.addEventListener('pointermove', e => { if (lpS && Math.hypot(e.clientX - lpS.x, e.clientY - lpS.y) > 12) clearTimeout(lpT); });
  ['pointerup', 'pointercancel'].forEach(n => document.addEventListener(n, () => { clearTimeout(lpT); lpS = null; }));
  document.addEventListener('contextmenu', e => { if (e.target.closest('[data-zoom]')) e.preventDefault(); });
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (UI.sel) { UI.sel = null; render(); } closeZoom(); } });
// ---- phone mode
function applyPhone() {
  const q = /[?&]phone=(\d)/.exec(location.search); const vm = (window.GXV ? GXV.now() : { w: innerWidth, h: innerHeight }), w = vm.w, hh = vm.h, short = Math.min(w, hh);
  let ph = short <= 500 || (window.matchMedia && matchMedia('(pointer:coarse)').matches && short <= 600);
  if (q) ph = q[1] === '1';
  const r = document.documentElement.classList, was = r.contains('ph');
  r.toggle('ph', ph); r.toggle('ph-p', ph && w < hh); r.toggle('ph-l', ph && w >= hh);
  placePrompt(); if (was !== ph) { if (G && UI.started) render(); }
}
function onResize() { applyPhone(); if (G && UI.started) renderBoard(); }
// ---- boot
function boot() {
  GX.init({ key: 'hb' });
  GX.drawer('rulesd', 'How to play', h('div.rules', { html: RULES }), true);
  GX.drawer('logd', 'Log', h('div#logbody'));
  GX.drawer('rivald', 'Cities and players', h('div#rivalbody'));
  extrasBoot();
  GX.onShow = id => { renderDrawers(); };
  kitBoot();
  applyPhone();
  if (window.GXV) GXV.watch(onResize); else { addEventListener('resize', onResize); addEventListener('orientationchange', onResize); }
  const bd = $('#board'); if (window.ResizeObserver) new ResizeObserver(() => { if (G && UI.started) renderBoard(); }).observe(bd);
  try { if (window.GA) { const A = typeof GA_DATA !== 'undefined' ? GA_DATA : {}; GA.init({ sfx: A.sfx || {}, music: A.music || {}, key: 'hb' }); GX.applyPrefs(); }; } catch (e) { }
  try { if (window.PerfHUD && PerfHUD.register) PerfHUD.register({ game: 'Hollowbough' }); } catch (e) { }
  if (/[?&]seed=(\d+)/.test(location.search)) UI.seed = +RegExp.$1;
  netInit();
  renderStart();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
