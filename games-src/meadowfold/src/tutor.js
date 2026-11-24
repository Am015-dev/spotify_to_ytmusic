// Meadowfold tutorial = a guided first game vs an Easy rival. Each step: one line (12 words max), only the taught move glows.
// After the scripted two turns the real game goes on with the same board; the Hint button stays available.
var TUT = null;
function tutStart() {
  UI.mode = 'tut';
  newGame({ np: 2, humans: 1, ai: 'easy', side: 'A', spirits: false, seed: 11, seats: [{ name: 'You', ai: null }, { name: 'Rival', ai: 'easy' }] });
  // scripted start: put the taught tokens and the duck card in place (counts stay exact: swap with the pouch)
  function give(i, cols) { G.central[i].forEach(function (c) { G.bag[c]++; }); G.central[i] = cols.map(function (c) { G.bag[c]--; return c; }); }
  give(0, ['leaf', 'water', 'mount']); give(1, ['mount', 'mount', 'trunk']);
  var di = G.row.indexOf(5); if (di < 0) { var dk = G.deck.indexOf(5); G.deck[dk] = G.row[0]; G.row[0] = 5; } else if (di) { G.row[di] = G.row[0]; G.row[0] = 5; }
  TUT = { i: 0, sc0: 0 }; var tm = setInterval(function () { if (!TUT || UI.mode !== 'tut') return clearInterval(tm); tutShow(); }, 250);
  UI.tab = 'row'; render();
}
var TUT_STEPS = [
  { say: 'Tap the glowing pocket to take 3 tokens.', ok: function (m) { return m.t === 'take' && m.i === 0; } },
  { say: 'Place the leaves: a small tree.', sel: 'leaf', ok: function (m) { return m.t === 'place' && G0hand(m) === 'leaf' && m.k === '2,2'; }, only: '2,2' },
  { say: 'Put the water beside the tree.', sel: 'water', ok: function (m) { return m.t === 'place' && G0hand(m) === 'water' && m.k === '1,1'; }, only: '1,1' },
  { say: 'Grey is a mountain. Place it here.', sel: 'mount', ok: function (m) { return m.t === 'place' && m.k === '3,3'; }, only: '3,3' },
  { say: 'Invite the duck: its card says Fits now.', tab: 'row', ok: function (m) { return m.t === 'card'; }, card: 0 },
  { say: 'Its home is ready! Tap the duck.', tab: 'mine', ok: function (m) { return m.t === 'cube'; }, wantSel: true },
  { say: 'Great! Tap End turn. The rival plays.', ok: function (m) { return m.t === 'end'; } },
  { say: 'Take the pocket with two grey tokens.', ok: function (m) { return m.t === 'take'; }, pocketHas: 'mount' },
  { say: 'Stack grey on grey: taller scores more.', sel: 'mount', ok: function (m) { return m.t === 'place' && m.k === '3,3'; }, only: '3,3' },
  { say: 'Mountains score only beside another mountain.', sel: 'mount', ok: function (m) { return m.t === 'place' && m.k === '3,2'; }, only: '3,2' },
  { say: 'Trunk now; leaves on top later.', sel: 'trunk', ok: function (m) { return m.t === 'place'; } },
  { say: 'Finish the game. Invite animals that need few tokens.', end: true }
];
function G0hand(m) { return m && m.h != null && TUT && TUT.lastHand ? TUT.lastHand[m.h] : null; }
function tutCur() { return TUT && TUT_STEPS[TUT.i]; }
window.tutAllow = function (m) {
  var st = tutCur(); if (!st || st.end || UI.mode !== 'tut') return true;
  if (G.cur !== 0) return true;
  TUT.lastHand = G.turn.hand.slice();
  if (m.t === 'take' && st.pocketHas) return m.i === 0 && st.ok(m);
  if (st.only && m.t === 'place' && m.k !== st.only) return false;
  if (st.sel && m.t === 'place' && G.turn.hand[m.h] !== st.sel) return false;
  return st.ok(m);
};
// ---- guide bubble: sits next to the thing it points at, arrow touching it, on the side that covers no choice ----
function tq(sel) { return sel ? document.querySelector(sel) : null; }
function tHit(a, b) { return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top; }
function tutTarget(st) {
  var tk = tq('#takeB'); if (tk && getComputedStyle(tk).visibility === 'visible') return { sel: '#takeB', say: 'Tap Invite. The duck joins you.' };
  if (st.end) return { sel: '#dock .acard', say: st.say, btn: 'Got it' };
  if (st.pocketHas || TUT.i === 0) return { sel: '.pocket.glow', say: st.say };
  if (st.card !== undefined) return { sel: '.acard[data-row="0"]', say: st.say };
  if (TUT.i === 5) return UI.sel && UI.sel.kind === 'card' ? { sel: '#map .hx.glow', say: 'Tap the glowing hex to settle it.' } : { sel: '.acard.ready', say: st.say };
  if (TUT.i === 6) return { sel: '#endB', say: st.say };
  return { sel: '#map .hx.glow', say: st.say };
}
function tutBubble(text, sel, res, btn) {
  var c = document.getElementById('tbub'); if (!c) { c = document.createElement('div'); c.id = 'tbub'; document.body.appendChild(c); }
  c.classList.toggle('res', !!res); c.innerHTML = '<span class="t">' + esc(text) + '</span>' + (btn ? '<button type="button" class="tskip" id="tutok">' + btn + '</button>' : '');
  TUT.anchor = sel; var W = innerWidth, H = innerHeight, A = 10;
  var te = tq(sel) || tq('#map'), t = te.getBoundingClientRect();
  c.style.width = Math.min(300, W - 16) + 'px'; c.style.left = '0px'; c.style.top = '0px';
  var bw = c.offsetWidth, bh = c.offsetHeight, cx = (t.left + t.right) / 2, cy = (t.top + t.bottom) / 2, left = Math.max(8, Math.min(W - 8 - bw, cx - bw / 2));
  var choices = [t]; if (!res) document.querySelectorAll('.pocket.glow, #map .hx.glow, .acard.ready, #endB.go, #takeB').forEach(function (e) { var r = e.getBoundingClientRect(); if (r.width && getComputedStyle(e).visibility === 'visible') choices.push(r); });
  var cand = [{ d: 'below', top: t.bottom + A, left: left, pen: 0 }, { d: 'above', top: t.top - A - bh, left: left, pen: 0 },
    { d: 'right', top: cy - bh / 2, left: t.right + A, pen: 1 }, { d: 'left', top: cy - bh / 2, left: t.left - A - bw, pen: 1 }], best = null;
  cand.forEach(function (k) {
    var box = { left: k.left, right: k.left + bw, top: k.top, bottom: k.top + bh }, sc = k.pen;
    if (box.top < 4) sc += 1000 + 4 - box.top; if (box.bottom > H - 4) sc += 1000 + box.bottom - H + 4; if (box.left < 6) sc += 1000; if (box.right > W - 6) sc += 1000;
    choices.forEach(function (r) { if (tHit(box, r)) sc += 100; });
    k.sc = sc; if (!best || sc < best.sc) best = k;
  });
  c.style.left = best.left + 'px'; c.style.top = Math.max(4, Math.min(H - bh - 4, best.top)) + 'px';
  c.className = (res ? 'res ' : '') + { below: 'arr-up', above: 'arr-down', right: 'arr-l', left: 'arr-r' }[best.d];
  c.style.setProperty('--ax', Math.max(18, Math.min(bw - 18, cx - best.left)) + 'px'); c.style.setProperty('--ay', Math.max(14, Math.min(bh - 14, cy - parseFloat(c.style.top))) + 'px');
  var ok = document.getElementById('tutok'); if (ok) ok.onclick = function () { tutHide(); TUT = null; render(); };
}
function tutHide() { var c = document.getElementById('tbub'); if (c) c.remove(); var l = document.getElementById('line'); if (l) l.classList.remove('tutoff'); }
window.tutBubbleAnchor = function () { var c = document.getElementById('tbub'); return c ? { sel: TUT && TUT.anchor, res: c.classList.contains('res'), text: c.textContent } : null; };
window.tutAfter = function (m) {
  var st = tutCur(); if (!st || UI.mode !== 'tut') return;
  var me = G.seats[0], d = E.score(me).total - (TUT.sc0 || 0); TUT.sc0 = E.score(me).total;
  var r = { take: ['You took 3 tokens: +0 points, ' + G.turn.hand.length + ' left to place', '#hand'], place: ['Placed: +' + d + ' points, ' + G.turn.hand.length + ' left to place', '#map [data-k="' + m.k + '"]'],
    card: ['You invited it: ' + me.cards.length + ' of 4 cards kept', '#mycards'], cube: ['Animal settled: +' + d + ' points', '#map [data-k="' + m.k + '"]'], end: ['Turn over: the rival plays', '#seats'] }[m.t];
  if (r) TUT.res = { text: r[0], sel: r[1], until: m.t === 'end' ? Infinity : Date.now() + 1800 };
  if (r && m.t !== 'end') setTimeout(function () { if (TUT) tutShow(); }, 1850);
  if (!st.end) TUT.i++;
  render();
};
window.tutRender = function () { var st = tutCur(); tutShow(); if (st && UI.mode === 'tut' && G && !G.over && !st.end && G.cur === 0 && !UI.busy) tutFix(); };
function tutShow() {
  var line = document.getElementById('line'), st = tutCur();
  if (!st || UI.mode !== 'tut' || !G || G.over) { tutHide(); return false; }
  line.classList.add('tutoff');
  if (TUT.res && Date.now() < TUT.res.until && !(TUT.res.until === Infinity && G.cur === 0 && !UI.busy)) { if (!tq(TUT.res.sel)) TUT.res.sel = '#map'; tutBubble(TUT.res.text, TUT.res.sel, true); return false; }
  TUT.res = null;
  if (G.cur !== 0 || UI.busy) { var c0 = document.getElementById('tbub'); if (c0) c0.remove(); return false; }
  var tg = tutTarget(st); tutBubble(tg.say, tg.sel, false, tg.btn); return !st.end;
}
function tutFix() {
  var st = tutCur();
  if (st.pocketHas && !TUT.fixed) { TUT.fixed = 1; if (G.bag.mount >= 2 && G.bag.trunk >= 1) { G.central[0].forEach(function (c) { G.bag[c]++; }); G.central[0] = ['mount', 'mount', 'trunk']; G.bag.mount -= 2; G.bag.trunk--; setTimeout(render, 0); } }
  // select the taught token / tab so only the taught move glows
  if (st.sel && UI.sel && UI.sel.kind === 'tok' && G.turn.hand[UI.sel.h] !== st.sel) { var h = G.turn.hand.indexOf(st.sel); if (h >= 0) { UI.sel = { kind: 'tok', h: h }; setTimeout(render, 0); } }
  if (st.tab && UI.tab !== st.tab) { UI.tab = st.tab; setTimeout(render, 0); }
};
