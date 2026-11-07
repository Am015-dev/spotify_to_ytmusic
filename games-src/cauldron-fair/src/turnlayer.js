// ===================== part 13: the turn layer: a banner for whose turn it is, one always-visible instruction line, the rivals' draws one chip at a time,
// the story voice in the tutorial bubbles and a loss outro for Story chapters. It only READS the game (G, UI) and never sends a move. =====================
const RF = { n: -1, q: [], cur: null, tm: 0, seen: -1 };
const rfOn = () => G && UI.started && !UI.sim && !hotSeat() && !(typeof NET !== 'undefined' && NET.on && false) && viewSeat() >= 0;
function rfBox() { let e = $('#rfeed'); if (!e) { e = h('div#rfeed', { role: 'status', 'aria-live': 'polite' }); document.body.appendChild(e); e.addEventListener('click', () => { rfNext(true); }); } return e; }
function rfCaption(e) {
  const p = G.players[e.seat]; if (!p) return null; const nm = p.name;
  if (e.t === 'place' && e.how !== 'side' && e.chip) { const k = e.chip.c + e.chip.v; return { seat: e.seat, key: k, text: nm + ' draws ' + nameOf(k) + ' and moves to space ' + e.pos + '.' }; }
  if (e.t === 'boom') return { seat: e.seat, text: nm + '\'s pot EXPLODES! Too many white chips.', boom: 1 };
  if (e.t === 'flask') return { seat: e.seat, text: nm + ' tips the flask: a white chip goes back.' };
  if (e.t === 'stop') { const last = p.pot[p.pot.length - 1]; return { seat: e.seat, text: e.boom ? nm + ' is out of the brew.' : nm + ' stops' + (last ? ' at space ' + last.pos : '') + ' and keeps the score.' }; }
  return null;
}
function rfNext(fast) {
  clearTimeout(RF.tm); RF.tm = 0; const box = rfBox();
  const c = RF.q.shift();
  if (!c) { RF.cur = null; box.classList.remove('on'); return; }
  RF.cur = c; box.className = 'on' + (c.boom ? ' bm' : '');
  box.innerHTML = '<span class="rfav">' + avHTML(c.seat, 30) + '</span>' + (c.key ? '<span class="rfchip">' + chipHTML(c.key, 30) + '</span>' : '') + '<span class="rft">' + c.text.replace(/</g, '&lt;') + '</span>';
  RF.tm = setTimeout(() => rfNext(), fast ? 200 : (RF.q.length > 3 ? 450 : 1000));
}
function rfScan() {
  if (!G) return; if (RF.n < 0 || G.evN < RF.n) { RF.n = G.evN; RF.q = []; return; }
  const v = viewSeat(), ev = G.events.filter(e => e.n > RF.n); RF.n = G.evN;
  if (!rfOn()) return;
  for (const e of ev) { if (e.seat == null || e.seat === v || !G.players[e.seat] || !G.players[e.seat].ai) continue; const c = rfCaption(e); if (c) RF.q.push(c); }
  if (RF.q.length > 8) RF.q.splice(0, RF.q.length - 8);
  if (RF.q.length && !RF.cur) rfNext();
}
// ---- the instruction line
function instrInfo() {
  if (!G || !UI.started || G.phase === 'over' || UI.rsOpen || UI.sim || tutOn() || (UI.start && !$('#start').hidden)) return null;
  const v = viewSeat(); if (v < 0 || hotSeat() || UI.pass != null) return null;
  const me = G.players[v], wait = G.players.filter(p => p.seat !== v && ((G.phase === 'brew' && (p.st === 'draw')) || (G.phase !== 'brew' && p.q))).map(p => p.name);
  if (G.phase === 'brew' && me.st === 'draw' && !me.lock && !me.q) {
    if (G.round === LASTD()) return { who: 'YOUR TURN', text: 'Last day: pick Draw or Stop in secret. Everyone reveals together.' };
    if (!me.pot.length) return { who: 'YOUR TURN', text: 'Tap the bag to draw your first chip.' };
    const ws = CF.whiteSum(me), lim = CF.limitOf(G, me), safe = lim - ws;
    return { who: 'YOUR TURN', text: safe <= 0 ? 'The pot is full of white (' + ws + '/' + lim + '). Another white chip explodes it. Draw, or Stop and score.' : 'White ' + ws + ' of ' + lim + '. Draw another chip, or Stop to keep your space.' };
  }
  if (me.q && !EVAL_Q[me.q.h]) { const t = promptInfo().text; return { who: 'YOUR TURN', text: t || 'Make your choice.' }; }
  if (G.phase === 'brew') { if (me.lock) return { who: 'WAITING', text: 'You decided. Waiting for ' + (wait.join(' and ') || 'everyone') + '.', rival: 1 }; return { who: wait.length ? wait[0].toUpperCase() + '\'S TURN' : 'DAY ENDS', text: (me.boom ? 'Your pot exploded. ' : 'You stopped. ') + (wait.length ? 'Watch ' + wait.join(' and ') + ' draw, one chip at a time.' : 'Counting the day.'), rival: 1 }; }
  return null;
}
function instrBar() {
  let e = $('#instr'); if (!e) { e = h('div#instr', { role: 'status', 'aria-live': 'polite' }); document.body.appendChild(e); }
  const i = instrInfo(); if (!i) { e.hidden = true; return; }
  e.hidden = false; e.className = i.rival ? 'rv' : '';
  const html = '<b>' + i.who.replace(/</g, '&lt;') + '</b><span>' + i.text.replace(/</g, '&lt;') + '</span>'; if (e.dataset.h !== html) { e.dataset.h = html; e.innerHTML = html; }
  const db = $('#dockbody'), pd = $('#promptDock'), vis = pd && pd.getBoundingClientRect().width > 0;
  if (vis) { e.hidden = true; return; }           // wide screens already show the prompt line in the panel
  const top = db ? db.getBoundingClientRect().top : innerHeight - 200; e.style.bottom = Math.max(0, innerHeight - top + 4) + 'px';
}
// ---- the turn banner: slides in when the turn changes hands
let TB = { key: '', tm: 0 };
function turnBanner() {
  if (!G || !UI.started || UI.sim || tutOn() || hotSeat()) { return; }
  const v = viewSeat(); if (v < 0) return; const me = G.players[v];
  let key, text = '', cls = '';
  if (G.phase === 'brew') {
    const wait = G.players.filter(p => p.seat !== v && p.st === 'draw');
    if (me.st === 'draw' && !me.lock) { key = 'my' + G.round; text = 'Day ' + G.round + ' · Your turn to brew'; }
    else { key = 'wt' + G.round + (wait[0] ? wait[0].seat : 'x'); if (wait.length) { text = wait[0].name + '\'s turn to brew'; cls = 'rv'; } else key = 'none'; }
  } else if (G.phase === 'eval') { key = 'ev' + G.round; text = 'Day ' + G.round + ' · Counting up'; cls = 'ev'; } else return;
  if (key === TB.key) return; TB.key = key; if (!text) return;
  let b = $('#tbanner'); if (!b) { b = h('div#tbanner', { role: 'status', 'aria-live': 'polite' }); document.body.appendChild(b); }
  b.textContent = text; b.className = cls; void b.offsetWidth; b.classList.add('on'); clearTimeout(TB.tm); TB.tm = setTimeout(() => b.classList.remove('on'), 1700);
}
setInterval(() => { try { rfScan(); instrBar(); turnBanner(); } catch (e) { } }, 200);
// ---- story voice in the tutorial: text from story-data.js, the guide's portrait on the bubble
(function () {
  const ts = tutSteps; tutSteps = function () {
    return ts().map(s => { const t = STORY.steps[s.id]; if (t) { s.title = t[0]; s.say = t[1]; } return s; });
  };
  const mo = new MutationObserver(() => { document.querySelectorAll('.gxt-bub .gxh-bd:not([data-por])').forEach(bd => { bd.dataset.por = 1; const im = h('img.tutpor', { src: STORY.guide.img, alt: STORY.guide.name, width: 36, height: 36 }); bd.insertBefore(im, bd.firstChild); }); });
  try { mo.observe(document.body, { childList: true, subtree: true }); } catch (e) { }
})();
// ---- Story chapters: a lost chapter plays its own outro (the shared kit shows one outro; we swap it just before the result)
(function () {
  const cf = campFinish; campFinish = function () {
    try { const ch = window.CAMPAIGN && UI.camp && window.CAMPAIGN.chapters.find(c => c.id === UI.camp.id); if (ch) { ch.outroWin = ch.outroWin || ch.outro; ch.outro = !campIsWon(G) && STORY.outroLose[ch.id] ? STORY.outroLose[ch.id] : ch.outroWin; } } catch (e) { console.error(e); }
    return cf.apply(this, arguments);
  };
})();
// ---- Quick game: a flavour line on day 1 and one in the result
(function () {
  const ng = newGame; newGame = function (mode) { const r = ng.apply(this, arguments); try { if (mode === 'ai' || mode === 'vs' || mode === undefined) setTimeout(() => { if (G && G.round === 1 && UI.started && !UI.camp && !tutOn()) toast(STORY.quickIntro[Math.abs(parseInt(G.seed, 10) || 0) % STORY.quickIntro.length]); }, 600); } catch (e) { } return r; };
})();
// ---- Quick game result: one line in the game's voice under the winner
(function () {
  const sf = showFinal; showFinal = function () { const r = sf.apply(this, arguments); try { if (!UI.camp && UI.mode !== 'tutorial' && G) { const v = viewSeat(), w = $('#rs .win > div'); if (w && !w.querySelector('.rsvoice')) { const line = G.winners.length > 1 ? STORY.quickTie : v >= 0 && G.winners.indexOf(v) >= 0 ? STORY.quickWin : STORY.quickLose; w.appendChild(h('div.rsvoice', line)); } } } catch (e) { console.error(e); } return r; };
})();
