// ===================== part 13: the turn layer: a banner for whose turn it is, one always-visible instruction line, the rivals' draws one chip at a time,
// the story voice in the tutorial bubbles and a loss outro for Story chapters. It only READS the game (G, UI) and never sends a move. =====================
const RF = { n: -1, q: [], cur: null, tm: 0, seen: -1 };
const msgOK = () => { try { return typeof GXH !== 'undefined' && GXH.enabled() && !(typeof COACH !== 'undefined' && COACH.on) && UI.mode !== 'tutorial'; } catch (e) { return false; } };   // W471: extra messages only with Hints on, never over the coach bubble
const rfOn = () => msgOK() && G && UI.started && !UI.sim && !hotSeat() && !(typeof NET !== 'undefined' && NET.on && false) && viewSeat() >= 0;
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
  let e = $('#instr'); if (!e) { e = h('div#instr', { 'aria-live': 'polite' }); document.body.appendChild(e); }
  let i = instrInfo(); { const n = UI.instrNote, me = viewSeat() >= 0 && G ? G.players[viewSeat()] : null; if (n && me && me.ver === n.ver && i) i = Object.assign({}, i, { text: n.text }); else UI.instrNote = null; }
  document.documentElement.classList.toggle('hasinstr', !!i); if (!i) { e.hidden = true; return; }
  e.hidden = false; e.className = i.rival ? 'rv' : '';
  const html = '<b>' + i.who.replace(/</g, '&lt;') + '</b><span>' + i.text.replace(/</g, '&lt;') + '</span>'; if (e.dataset.h !== html) { e.dataset.h = html; e.innerHTML = html; }
  const db = $('#dockbody'), pd = $('#promptDock'), vis = pd && pd.getBoundingClientRect().width > 0;
  if (vis) { e.hidden = true; return; }           // wide screens already show the prompt line in the panel
  if (!isPh() && db) { if (e.parentElement !== db) db.prepend(e); e.classList.add('indock'); e.style.bottom = ''; return; }   // W471: on desktop it is the first line of the panel, not floating over it
  if (e.parentElement !== document.body) { document.body.appendChild(e); e.classList.remove('indock'); }
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
  if (key === TB.key) return; TB.key = key; if (!text || !msgOK()) return;
  let b = $('#tbanner'); if (!b) { b = h('div#tbanner', { role: 'status', 'aria-live': 'polite' }); document.body.appendChild(b); }
  b.textContent = text; b.className = cls; void b.offsetWidth; b.classList.add('on'); clearTimeout(TB.tm); TB.tm = setTimeout(() => b.classList.remove('on'), 4500);
}
setInterval(() => { try { rfScan(); instrBar(); turnBanner(); if (UI.rsOpen && $('#lpb') && !(LP.src && LP.src.closest && LP.src.closest('#rs'))) lpHide(); } catch (e) { } }, 200);
// ---- story voice in the tutorial: text from story-data.js, the guide's portrait on the bubble
(function () {
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
  const ng = newGame; newGame = function (mode) { const r = ng.apply(this, arguments); try { if (mode === 'ai' || mode === 'vs' || mode === undefined) setTimeout(() => { if (G && G.round === 1 && UI.started && !UI.camp && !tutOn() && UI.mode !== 'tutorial') goalCard(); }, 600); } catch (e) { } return r; };
})();
// ---- Quick game result: one line in the game's voice under the winner
(function () {
  const sf = showFinal; showFinal = function () { const r = sf.apply(this, arguments); try { if (!UI.camp && UI.mode !== 'tutorial' && G) { const v = viewSeat(), w = $('#rs .win > div'); if (w && !w.querySelector('.rsvoice')) { const line = G.winners.length > 1 ? STORY.quickTie : v >= 0 && G.winners.indexOf(v) >= 0 ? STORY.quickWin : STORY.quickLose; w.appendChild(h('div.rsvoice', line)); } } } catch (e) { console.error(e); } return r; };
})();
// ---- W471 Goal card: one plain sentence and three bullets. Opens on day 1 of a Quick game and from the Day chip; stays until tapped.
function goalCard(force) {
  let e = $('#goalcard'); if (e) e.remove(); if (!G) return;
  if (!force && (/[?&]scn=/.test(location.search) || (typeof GXS !== 'undefined' && GXS.running && GXS.running()))) return;   // scenario runs drive the board directly

  const n = LASTD();
  e = h('div#goalcard', { role: 'dialog', 'aria-label': 'The goal' });
  e.innerHTML = '<div class="gc"><div class="gck">The goal</div><h3>Have the most points after ' + n + ' days.</h3><ul><li>Chips from your bag move along your pot.</li><li>Stop before the white chips pass 7, or it explodes.</li><li>Your last space pays coins and points.</li></ul><button type="button" class="gcok">Let\u2019s brew</button></div>';
  e.addEventListener('click', () => { e.remove(); });
  document.body.appendChild(e);
}
window.goalCard = goalCard;
document.addEventListener('click', ev => { const d = ev.target.closest && ev.target.closest('#barstat .dayn'); if (d && !UI.camp) goalCard(true); });

// W471: phone text floor. Owner rule: no text under 14px on a phone. Any element with its own text that computes smaller is raised to 14px.
(function () {
  let t = 0;
  const run = () => { t = 0; if (!document.documentElement.classList.contains('ph')) return;
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), seen = new Set();
    for (let n; (n = w.nextNode());) { const p = n.parentElement; if (!p || seen.has(p) || !n.nodeValue.trim() || p.closest('svg,script,style')) continue; seen.add(p);
      if (parseFloat(getComputedStyle(p).fontSize) < 14) p.style.setProperty('font-size', '14px', 'important'); } };
  const mo = new MutationObserver(recs => { if (!document.documentElement.classList.contains('ph')) return; for (const r of recs) for (const n of r.addedNodes) { const els = n.nodeType === 1 ? [n, ...n.querySelectorAll('*')] : n.parentElement ? [n.parentElement] : []; for (const e of els) { if (e.closest('svg,script,style')) continue; if ([...e.childNodes].some(c => c.nodeType === 3 && c.nodeValue.trim()) && parseFloat(getComputedStyle(e).fontSize) < 14) e.style.setProperty('font-size', '14px', 'important'); } } if (!t) t = setTimeout(run, 120); });   // before the frame paints
  const go = () => { mo.observe(document.body, { childList: true, subtree: true, characterData: true }); run(); };
  if (document.body) go(); else addEventListener('DOMContentLoaded', go);
  addEventListener('resize', () => { if (!t) t = setTimeout(run, 120); });
})();
// ---- W471 round 2: drag the real card or chip onto its target. Choice cards go into the cauldron, shop chips into the bag.
// Picking one up makes the target glow; a drop on it snaps in with a vibrate tick and does exactly what a tap does. A miss flies back. Taps still work.
const DRAG = { on: null };
const dragSpec = el => {
  if (!el || !el.closest) return null;
  const card = el.closest('#qbox [data-a=mv]:not([disabled])'); if (card) return { el: card, target: () => document.querySelector('#cwrap') };
  const tok = el.closest('#rs .tok:not([disabled])'); if (tok) return { el: tok, target: () => document.querySelector('#rs .sbimg') };
  return null;
};
function dragEnd(drop) {
  const d = DRAG.on; DRAG.on = null; if (!d) return;
  const t = d.target(); if (t) t.classList.remove('droptgt', 'dropover'); d.el.classList.remove('dragsrc');
  if (!d.ghost) return;
  const tr = t && t.getBoundingClientRect(), g = d.ghost, gr = g.getBoundingClientRect();
  const hit = drop && tr && d.x >= tr.left - 12 && d.x <= tr.right + 12 && d.y >= tr.top - 12 && d.y <= tr.bottom + 12;
  const to = hit ? { x: tr.left + tr.width / 2 - gr.width / 2, y: tr.top + tr.height / 2 - gr.height / 2, s: .35 } : { x: d.r0.left, y: d.r0.top, s: 1 };
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches || ANIM === 0;
  const fin = () => { g.remove(); if (hit) { DRAG.skipUntil = 0; d.el.click(); } };
  if (hit) { try { navigator.vibrate && navigator.vibrate(12); } catch (e) { } snd('plop'); }
  if (reduce) { fin(); return; }
  try { const a = g.animate([{ transform: g.style.transform }, { transform: 'translate(' + to.x + 'px,' + to.y + 'px) scale(' + to.s + ')', opacity: hit ? .2 : 1 }], { duration: hit ? 180 : 220, easing: 'ease-out', fill: 'forwards' }); a.onfinish = fin; } catch (e) { fin(); }
}
document.addEventListener('pointerdown', ev => {
  if (ev.button > 0 || DRAG.on) return; const s = dragSpec(ev.target); if (!s) return;
  DRAG.on = Object.assign(s, { x0: ev.clientX, y0: ev.clientY, x: ev.clientX, y: ev.clientY, r0: s.el.getBoundingClientRect(), ghost: null, id: ev.pointerId });
}, true);
document.addEventListener('pointermove', ev => {
  const d = DRAG.on; if (!d || ev.pointerId !== d.id) return; d.x = ev.clientX; d.y = ev.clientY;
  if (!d.ghost) {
    if (Math.hypot(d.x - d.x0, d.y - d.y0) < 10) return;
    const t = d.target(); if (!t) { DRAG.on = null; return; }
    d.ghost = d.el.cloneNode(true); d.ghost.removeAttribute('data-a'); d.ghost.classList.add('dragghost'); d.ghost.style.width = d.r0.width + 'px'; d.ghost.style.height = d.r0.height + 'px';
    document.body.appendChild(d.ghost); d.el.classList.add('dragsrc'); t.classList.add('droptgt'); try { navigator.vibrate && navigator.vibrate(6); } catch (e) { }
  }
  const t = d.target(), tr = t && t.getBoundingClientRect();
  if (tr) t.classList.toggle('dropover', d.x >= tr.left - 12 && d.x <= tr.right + 12 && d.y >= tr.top - 12 && d.y <= tr.bottom + 12);
  d.ghost.style.transform = 'translate(' + (d.r0.left + d.x - d.x0) + 'px,' + (d.r0.top + d.y - d.y0) + 'px) scale(1.06)';
  ev.preventDefault();
}, { capture: true, passive: false });
document.addEventListener('pointerup', ev => { const d = DRAG.on; if (!d || ev.pointerId !== d.id) return; if (d.ghost) DRAG.skipUntil = Date.now() + 400; dragEnd(true); }, true);
document.addEventListener('pointercancel', () => dragEnd(false), true);
// the click that the browser sends after a drag is not a tap
document.addEventListener('click', ev => { if (DRAG.skipUntil && Date.now() < DRAG.skipUntil && ev.isTrusted) { ev.stopPropagation(); ev.preventDefault(); } }, true);
