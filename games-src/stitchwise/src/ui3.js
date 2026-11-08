// ui3: title, setup, rules drawer, patch pictures, menu, result screen
function logoHtml() { var cols = ['#c0527a', '#e0a82e', '#2a8a80', '#4a86b8', '#c8553d', '#6b8e4e', '#8a5ba6', '#d98a3d', '#3f6fa0', '#b0486a']; var s = ''; for (var i = 0; i < 10; i++) s += '<i style="background:' + cols[(i * 3) % 10] + '"></i>'; return '<div class="qlogo">' + s + '</div>'; }
function firstTime() { try { return !localStorage.getItem('sw_seen'); } catch (e) { return true; } }
function showStart(view) {
  var st = $('#start'); st.hidden = false; UI.started = UI.started && !!G; $('#rs').hidden = true; try { GX.close(); } catch (e) { } artBg(st, 'bg-title');
  if (view === 'setup') return renderSetup(st);
  var camp = typeof campLine === 'function' ? campLine() : '';
  var card = h('div.card', { html: logoHtml() + '<h1>Stitchwise</h1><p class="sub">A quilting duel for two. Buy patches, sew them on, run out the clock.</p>' });
  var m = h('div.menu');
  if (hasSave()) m.appendChild(h('button.btn.go', { type: 'button', 'data-a': 'resume' }, 'Continue your game', h('small', 'Pick up where you stopped')));
  if (window.CAMPAIGN && typeof GXC !== 'undefined') m.appendChild(h('button.btn' + (hasSave() ? '' : '.go'), { type: 'button', 'data-a': 'story' }, 'Story: The Quilter’s Year', h('small', camp || 'Three county fairs, ten stages, three champions')));
  m.appendChild(h('button.btn', { type: 'button', 'data-a': 'quick' }, 'Quick game', h('small', 'Against the computer or a friend on this screen')));
  m.appendChild(h('button.btn' + (firstTime() ? '.go' : ''), { type: 'button', 'data-a': 'start', 'data-tut': '1' }, 'Learn: your first game', h('small', 'A real game; Aunt Wren coaches you as you play')));
  m.appendChild(h('button.btn.alt', { type: 'button', 'data-a': 'rules' }, 'How to play'));
  card.appendChild(m); st.innerHTML = ''; st.appendChild(card);
  try { GX.showDock && 0; } catch (e) { }
}
function renderSetup(st) {
  var card = h('div.card'); card.innerHTML = '<h2>Quick game</h2><p class="sub">Pick your opponent. 33 patches, 9\u00D79 quilts, 53 spaces of time.</p>';
  var m = h('div.menu'), opt = function (label, small, cls, f) { var b = h('button.btn' + cls, { type: 'button' }, label, h('small', small)); b.onclick = f; m.appendChild(b); };
  opt('Easy computer', 'Gentle and a little careless: a good first match', '.go', function () { UI.lvl = 'easy'; newGame('vs', { lvl: 'easy' }); showGoal(); });
  opt('Normal computer', 'Tidy quilts and sensible timing', '', function () { UI.lvl = 'normal'; newGame('vs', { lvl: 'normal' }); showGoal(); });
  opt('Hard computer', 'Looks ahead at your replies. Beats a naive player about 9 in 10', '', function () { UI.lvl = 'hard'; newGame('vs', { lvl: 'hard' }); showGoal(); });
  opt('Two players', 'Pass the screen: both quilts stay in the open', '.alt', function () { newGame('hot', {}); showGoal(); });
  opt('Back', '', '.alt', function () { showStart(); });
  card.appendChild(m); st.innerHTML = ''; st.appendChild(card);
}
document.addEventListener('click', function (e) {
  var t = e.target.closest('[data-a]'); if (!t) return; var a = t.dataset.a;
  if (a === 'offer') selectOffer(+t.dataset.k); else if (a === 'adv') doAdvance(); else if (a === 'rot') rotate(); else if (a === 'flip') flip(); else if (a === 'sew') confirmSew(); else if (a === 'cancel') cancelSel();
  else if (a === 'strip') { if (G) { showScoreDrawer(); return; } var sd = +t.dataset.seat; if (sd !== viewSeat()) showOppQuilt(sd); else if (G) toast('Buttons ' + G.btn[sd] + ' · income ' + G.inc[sd] + ' per spot · ' + swEmpty(G.board[sd]) + ' empty squares'); }
  else if (a === 'resume') loadGame(); else if (a === 'quick') showStart('setup'); else if (a === 'rules') { GX.show('rulesd'); }
  else if (a === 'story') storyOpen(); else if (a === 'start') tutStart(); else if (a === 'goalok') closeGoal(); else if (a === 'whatdo') whatDo(); else if (a === 'skipmap') { coachSkipToMap(); } else if (a === 'result') showResult(); else if (a === 'again') { var lv = UI.lvl; newGame(UI.mode === 'hot' ? 'hot' : 'vs', { lvl: lv }); } else if (a === 'title') showStart(); else if (a === 'look') { $('#rs').hidden = true; }
  else if (a === 'campfin') { $('#rs').hidden = true; }
});
function showOppQuilt(seat) { var d = $('#oppd .gx-drawer-body') || null; var body = h('div', { style: 'display:flex;flex-direction:column;align-items:center;gap:8px' }); var saved = UI.cs; UI.cs = Math.min(34, Math.floor((Math.min(innerWidth, 420) - 60) / 9)); var q = quiltEl(seat, 'opp'); body.appendChild(q); var sc = swScore(G, seat); body.appendChild(h('div', { html: '<b>' + nameOf(seat) + '</b>: ' + G.btn[seat] + ' buttons, income ' + G.inc[seat] + ' per spot, ' + sc.empty + ' empty squares' })); UI.cs = saved;
  q.style.setProperty('--cs', Math.min(34, Math.floor((Math.min(innerWidth, 420) - 60) / 9)) + 'px'); GX.drawer('oppd', nameOf(seat) + '’s quilt', body); var dr = $('#oppd .gx-drawer-body'); dr.innerHTML = ''; dr.appendChild(body); GX.show('oppd'); }
// ---------- patch pictures
function showPatch(pid) {
  var p = PATCHES[pid], b = h('div.big'); b.appendChild(patchShape(pid, '', 34)); b.appendChild(h('h2', p.name)); b.appendChild(h('div.facts', { html: '<span>' + btnIc() + ' costs ' + p.cost + '</span><span>' + timeIc() + ' takes ' + p.time + '</span><span>' + btnIc() + ' earns ×' + p.inc + '</span>' }));
  b.appendChild(h('p', { style: 'text-align:center;margin:4px 0' }, p.n + ' squares. Pay ' + p.cost + ' button' + (p.cost === 1 ? '' : 's') + ', move your time token ' + p.time + ' space' + (p.time === 1 ? '' : 's') + '. ' + (p.inc ? 'Every time you pass a button spot it pays you ' + p.inc + ' button' + (p.inc === 1 ? '' : 's') + '.' : 'It earns no buttons at button spots.') + ' Covering ' + p.n + ' squares saves ' + p.n * 2 + ' points at the end.')); b.appendChild(h('p.sub', { style: 'text-align:center;font-size:.85rem' }, 'You can turn and flip it when you place it.'));
  GX.drawer('bigd', p.name, b); var dr = $('#bigd .gx-drawer-body'); dr.innerHTML = ''; dr.appendChild(b); GX.show('bigd');
}
function buildPatchList() {
  var g = h('div.refgrid'); PATCHES.forEach(function (p) { var b = h('button', { type: 'button', 'aria-label': p.name }, patchShape(p.id, '', 9), h('div.meta', { style: 'display:flex;gap:6px;font-weight:700;font-size:12px', html: facts(p) })); b.onclick = function () { showPatch(p.id); }; g.appendChild(b); });
  var w = h('div', h('p.sub', { style: 'font-size:.9rem' }, 'All 33 patches, in every game. Tap one to see it large. Icons: cost in buttons, time, buttons it earns at each button spot.'), g); GX.drawer('patchd', 'All patches', w, true); var dr = $('#patchd .gx-drawer-body'); dr.innerHTML = ''; dr.appendChild(w);
}
function rulesHtml() {
  return '<div class="rules"><h3>How a turn works</h3><ol class="howturn"><li>The player further back on the track takes the turn.</li><li>Tap a glowing patch, drag it onto your quilt, tap Sew it on.</li><li>You pay its buttons and your token moves its time.</li><li>Or tap Advance: jump past your rival, +1 button per space.</li><li>At the end: buttons minus 2 per empty square. Most wins.</li></ol><h3>The goal</h3><p>Finish with the most points. Points are your buttons, plus 7 if you complete a 7×7 square on your quilt, minus 2 for every empty square.</p>' +
    '<h3>On your turn, choose one</h3><ul><li><b>Sew a patch.</b> Look at the three patches just past the neutral marker. Pay the button cost, place it on your quilt (turn and flip it freely, no overlaps), then move your time token forward by its time cost.</li><li><b>Advance.</b> Move your time token to the space right in front of your opponent’s and take 1 button for every space you moved.</li></ul>' +
    '<h3>Who goes next?</h3><p>The token further back on the track plays. If both are on the same space, the one on top (who arrived last) plays. So a slow, big patch can give your opponent several turns in a row.</p>' +
    '<h3>Gold spots (income)</h3><p>When your token passes a gold button spot, you earn one button for every button printed on the patches on your quilt. Cheap patches with buttons on them early are an engine.</p>' +
    '<h3>Leather patches</h3><p>Five brown spaces on the track each hold a free 1×1 leather patch. The first player to pass one sews it on immediately, anywhere empty.</p>' +
    '<h3>The 7×7 bonus</h3><p>The first player to fill a full 7×7 block of squares earns 7 bonus points.</p>' +
    '<h3>The end</h3><p>The game ends when both tokens reach the last space. Highest score wins; on a tie, whoever reached the end first.</p>' +
    '<h3>Simplified on purpose</h3><ul><li>Seat 1 (you, in Story and the tutorial) starts; in a Quick game the first player is random.</li><li>A free leather patch is skipped if your quilt has no empty square left.</li><li>Patch costs, times and buttons are our own table; a few values may differ from printed sets.</li></ul>' +
    '<h3>Tips</h3><ul><li>Gaps of 1 or 2 squares are hard to fill later: keep the edges tidy.</li><li>Time is your real currency. A cheap patch that takes little time is often better than a big one.</li><li>Advance when you are short of buttons, or to get the next turn.</li></ul></div>';
}
function buildRules() { var w = h('div', { html: rulesHtml() }); var rb = h('button.btn.alt', { type: 'button', style: 'margin-top:8px' }, 'Replay the tutorial'); rb.onclick = function () { GX.close(); tutStart(); }; w.appendChild(rb); GX.drawer('rulesd', 'How to play', w); var dr = $('#rulesd .gx-drawer-body'); dr.innerHTML = ''; dr.appendChild(w); }
function buildMenu() {
  var btn = function (txt, f, cls) { var b = h('button.btn.alt.sm' + (cls || ''), { type: 'button' }, txt); b.onclick = f; return b; };
  GX.settings({ id: 'setd', title: 'Menu',
    game: function (S) { S.appendChild(GX.row('This game', [btn('Rules', function () { GX.show('rulesd'); }), btn('Tutorial', function () { GX.close(); tutStart(); }), btn('Restart', function () { var b = this; if (G && UI.started && !G.over && !UI.tutorial && !b.dataset.sure) { b.dataset.sure = '1'; b.textContent = 'Tap again to restart'; setTimeout(function () { delete b.dataset.sure; b.textContent = 'Restart'; }, 3000); return; } restart(); }), btn('Title', function () { GX.close(); showStart(); })])); },
    sound: function (S) { S.appendChild(GX.row('Sound effects', GX.onoff(UI.sound, function (v) { UI.sound = !!v; try { localStorage.setItem('sw_sound', v ? '1' : '0'); } catch (e) { } if (v) sfx('pick'); }))); if (window.SW_MUSIC && window.SW_MUSIC.length) S.appendChild(GX.row('Music', [btn('Music picker', function () { try { GXMUS.open(); } catch (e) { } })])); },
    help: function (S) { try { var w = h('div'); w.innerHTML = GXH.settingsHTML({ rowClass: 'mrow', btnClass: 'btn' }); while (w.firstChild) S.appendChild(w.firstChild); } catch (e) { } },
    about: { name: 'Stitchwise', version: '1.0', text: 'An original quilting duel. All names, patches and art are our own.' }, shelf: '../' });
}
function restart() { GX.close(); if (UI.tutorial || UI.coach) { tutStart(); return; } if (UI.camp && typeof GXC !== 'undefined') { var id = UI.camp.id; GXC.play(id); return; } newGame(UI.mode === 'hot' ? 'hot' : 'vs', { lvl: UI.lvl }); }
// ---------- result
function bonusTileHtml() { var i = artImg('bonus-tile', 'ic'); if (!i) return ''; i.width = i.height = 22; return i.outerHTML + ' '; }
function emptyIdx(seat) { var r = []; G.board[seat].forEach(function (p, i) { if (p === -1 || p === 99) r.push(i); }); return r; }
function tieText(w) { return 'Tied on points: ' + nameOf(w) + ' reached the end first and wins the tie-break.'; }
// the end of the game: both quilts side by side, empty squares counted down (-2 each), bonus, then the winner banner
function showResult(o) {
  o = o || {}; try { GXH.hide(); } catch (e) { } var rs = $('#rs'); rs.hidden = false; rs.className = 'ov rsv'; var sc = [swScore(G, 0), swScore(G, 1)], w = swWinner(G), hot = UI.mode === 'hot';
  artBg(rs, 'bg-title'); var saved = UI.cs, saveNew = UI.newCells; UI.newCells = {}; var wide = innerWidth >= 700;
  UI.cs = Math.max(13, Math.min(40, Math.floor(((Math.min(innerWidth, 900) - 60) / 2 - 16) / 9), Math.floor((innerHeight - (innerHeight < 500 ? 236 : 260) - (UI.coach ? 120 : 0)) / 9)));
  var c = h('div.rv'), cols = h('div.rvcols'), cells = [], tot = [], pen = [];
  [0, 1].forEach(function (s) {
    var q = quiltEl(s, 'rvq'); q.removeAttribute('id'); q.style.setProperty('--cs', UI.cs + 'px'); q.style.backgroundImage = 'none'; q.classList.remove('art');
    var qs = $$('.qc', q), emp = emptyIdx(s).map(function (i) { return qs[i]; }); emp.forEach(function (e) { e.classList.add('emp'); }); cells.push(emp);
    var bt = h('b.rvn', '0'), tt = h('b.rvt', String(sc[s].btn + (sc[s].bonus ? 7 : 0))); tot.push(tt); pen.push(bt);
    cols.appendChild(h('div.rvcol' + (w === s ? '.win' : ''), { 'data-seat': s }, h('div.rvname', h('span.dot', { style: 'background:' + (s === 0 ? 'var(--me)' : 'var(--opp)') }), nameOf(s)), q,
      h('div.rvtally', h('div', { html: btnIc() + ' Buttons <b>' + sc[s].btn + '</b>' }), h('div', { html: bonusIc() + ' 7×7 bonus <b>' + (sc[s].bonus ? '+7' : '0') + '</b>' }), h('div.rvpen', 'Empty ', h('b.rvec', '0'), ' × -2 = ', bt), h('div.rvsum', 'Total ', tt))));
  });
  c.appendChild(h('div.rvhead', 'The quilts are done')); c.appendChild(cols); var ban = h('div.rvban'); c.appendChild(ban); var acts = h('div.rvacts'); c.appendChild(acts);
  rs.innerHTML = ''; rs.appendChild(c); UI.rsShown = true; UI.cs = saved; UI.newCells = saveNew; var seqId = ++UI.seq2;
  var setTotals = function (s, n) { $('.rvec', $$('.rvcol', c)[s]).textContent = n; pen[s].textContent = n ? '-' + n * 2 : '0'; tot[s].textContent = sc[s].btn + (sc[s].bonus ? 7 : 0) - n * 2; };
  var finishUp = function () {
    if (seqId !== UI.seq2) return; [0, 1].forEach(function (s) { cells[s].forEach(function (e) { e.classList.add('x'); }); setTotals(s, sc[s].empty); });
    var A = sc[0].total, B = sc[1].total, title = hot ? nameOf(w) + ' wins!' : w === 0 ? 'You win!' : nameOf(1) + ' wins.';
    ban.className = 'rvban on ' + (w === 0 || hot ? 'won' : 'lost'); ban.innerHTML = '<div class="rvt1">' + title + '</div><div class="rvt2">' + nameOf(0) + ' ' + A + ' – ' + B + ' ' + nameOf(1) + '</div>' + (A === B ? '<div class="rvt3">' + tieText(w) + '</div>' : '');
    var QS = ((window.CAMPAIGN || {}).story || {}).quick, WK = (((window.CAMPAIGN || {}).story || {}).final || {}).walk; if (!UI.coach && WK) { var a0 = sc[0], b0 = sc[1]; ban.appendChild(h('div.rvt3.walk', WK.replace('{b}', a0.btn).replace('{x}', a0.bonus ? 7 : 0).replace('{e}', a0.empty).replace('{t}', a0.total).replace('{ob}', b0.btn).replace('{ox}', b0.bonus ? 7 : 0).replace('{oe}', b0.empty).replace('{ot}', b0.total).replace('Marden', nameOf(1)))); } if (UI.coach) coachFinal(ban, w, A, B); else if (!UI.camp && !hot && QS) ban.appendChild(h('div.rvt3.wren', (A === B ? QS.tie : w === 0 ? QS.win : QS.lose).replace('{name}', nameOf(1))));
    $$('.rvcol', c).forEach(function (e) { e.classList.add('done'); }); acts.textContent = ''; sfx('fanfare');
    if (w === 0 || hot) { for (var k = 0; k < 18; k++) c.appendChild(h('i.cf', { style: 'left:' + (Math.random() * 100) + '%;background:' + PAL[k % PAL.length] + ';animation-delay:' + (Math.random() * .6) + 's' })); } else sfx('thud');
    if (o.after) { var cb = h('button.btn.go.grow', { type: 'button' }, 'Continue'); cb.onclick = function () { o.after(); }; acts.appendChild(cb); cb.focus(); }
    else if (UI.coach && UI.prologue) { acts.appendChild(h('button.btn.go.grow', { type: 'button', 'data-a': 'story' }, 'Start the Story')); acts.appendChild(h('button.btn.alt', { type: 'button', 'data-a': 'title' }, 'Title')); }
    else { acts.appendChild(h('button.btn.go.grow', { type: 'button', 'data-a': 'again' }, UI.coach ? 'Play a real game' : 'Play again')); acts.appendChild(h('button.btn.alt', { type: 'button', 'data-a': 'title' }, 'Title')); }
  };
  var mx = Math.max(sc[0].empty, sc[1].empty), step = amt(1) ? Math.max(28, Math.min(110, Math.floor(2600 / Math.max(1, mx)))) : 0;
  if (!step || o.instant) { finishUp(); return; }
  var n = 0, skip = h('button.btn.alt.sm.rvskip', { type: 'button' }, 'Skip'); skip.onclick = function () { n = 1e9; }; acts.appendChild(skip);
  var tick = function () {
    if (seqId !== UI.seq2) return; if (n >= mx) { setTimeout(finishUp, amt(250)); return; }
    [0, 1].forEach(function (s) { if (n < cells[s].length) { cells[s][n].classList.add('x'); setTotals(s, n + 1); } }); sfx('tick'); n++; setTimeout(tick, step);
  };
  setTimeout(tick, amt(500));
}

