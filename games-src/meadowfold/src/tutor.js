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
  TUT = { i: 0 };
  UI.tab = 'row'; render();
}
var TUT_STEPS = [
  { say: 'Tap the glowing pocket to take 3 tokens.', ok: function (m) { return m.t === 'take' && m.i === 0; } },
  { say: 'Place the leaves: a small tree.', sel: 'leaf', ok: function (m) { return m.t === 'place' && G0hand(m) === 'leaf' && m.k === '2,2'; }, only: '2,2' },
  { say: 'Put the water beside the tree.', sel: 'water', ok: function (m) { return m.t === 'place' && G0hand(m) === 'water' && m.k === '1,1'; }, only: '1,1' },
  { say: 'Grey is a mountain. Place it here.', sel: 'mount', ok: function (m) { return m.t === 'place' && m.k === '3,3'; }, only: '3,3' },
  { say: 'Invite an animal: tap the duck card.', tab: 'row', ok: function (m) { return m.t === 'card'; }, card: 0 },
  { say: 'Its home is ready! Tap the duck.', tab: 'mine', ok: function (m) { return m.t === 'cube'; }, wantSel: true },
  { say: 'Great! Tap End turn. The rival plays.', ok: function (m) { return m.t === 'end'; } },
  { say: 'Take the pocket with two grey tokens.', ok: function (m) { return m.t === 'take'; }, pocketHas: 'mount' },
  { say: 'Stack grey on grey: taller scores more.', sel: 'mount', ok: function (m) { return m.t === 'place' && m.k === '3,3'; }, only: '3,3' },
  { say: 'Mountains score only beside another mountain.', sel: 'mount', ok: function (m) { return m.t === 'place' && m.k === '3,2'; }, only: '3,2' },
  { say: 'Trunk now; leaves on top later.', sel: 'trunk', ok: function (m) { return m.t === 'place'; } },
  { say: 'Now finish the game. Hint helps.', end: true }
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
window.tutAfter = function (m) {
  var st = tutCur(); if (!st || UI.mode !== 'tut') return;
  if (!st.end) TUT.i++;
  render();
};
window.tutRender = function () {
  var line = document.getElementById('line'), st = tutCur();
  if (!st || UI.mode !== 'tut' || !G || G.over || G.cur !== 0 || UI.busy) { if (line) line.classList.toggle('tutline', false); return; }
  line.classList.add('tutline');
  line.innerHTML = esc(st.say) + (st.end ? ' <button type="button" class="tskip" id="tutok">Got it</button>' : ' <small>' + (TUT.i + 1) + '/' + (TUT_STEPS.length - 1) + '</small>');
  if (st.end) { var b = document.getElementById('tutok'); b.onclick = function () { TUT = null; line.classList.toggle('tutline', false); render(); }; return; }
  if (st.pocketHas && !TUT.fixed) { TUT.fixed = 1; if (G.bag.mount >= 2 && G.bag.trunk >= 1) { G.central[0].forEach(function (c) { G.bag[c]++; }); G.central[0] = ['mount', 'mount', 'trunk']; G.bag.mount -= 2; G.bag.trunk--; setTimeout(render, 0); } }
  // select the taught token / tab so only the taught move glows
  if (st.sel && UI.sel && UI.sel.kind === 'tok' && G.turn.hand[UI.sel.h] !== st.sel) { var h = G.turn.hand.indexOf(st.sel); if (h >= 0) { UI.sel = { kind: 'tok', h: h }; setTimeout(render, 0); } }
  if (st.tab && UI.tab !== st.tab) { UI.tab = st.tab; setTimeout(render, 0); }
};
