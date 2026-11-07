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
  if (typeof GXT !== 'undefined') { var w = h('div'); w.innerHTML = GXT.menuHTML({ game: 'stitchwise', first: firstTime(), cls: 'btn', launch: tutStart }); while (w.firstChild) m.appendChild(w.firstChild); }
  m.appendChild(h('button.btn.alt', { type: 'button', 'data-a': 'rules' }, 'How to play'));
  card.appendChild(m); card.appendChild(h('p.sub', { style: 'font-size:.8rem;margin-top:10px' }, 'Original game. Patches, names and art are our own.')); st.innerHTML = ''; st.appendChild(card);
  try { GX.showDock && 0; } catch (e) { }
}
function renderSetup(st) {
  var S = UI.setup || (UI.setup = { lvl: UI.lvl || 'normal', mode: 'vs' });
  var card = h('div.card'); card.innerHTML = '<h2>Quick game</h2><p class="sub">33 patches, 9×9 quilts, 53 spaces of time.</p>';
  var seg = function (vals, cur, cb) { var d = h('div.seg'); vals.forEach(function (v) { var b = h('button' + (v[0] === cur ? '.on' : ''), { type: 'button' }, v[1]); b.onclick = function () { cb(v[0]); renderSetup(st); }; d.appendChild(b); }); return d; };
  card.appendChild(h('div.row', h('label', 'Who plays'), seg([['vs', 'You vs computer'], ['hot', 'Two players']], S.mode, function (v) { S.mode = v; })));
  if (S.mode === 'vs') card.appendChild(h('div.row', h('label', 'Computer strength'), seg([['easy', 'Easy'], ['normal', 'Normal'], ['hard', 'Hard']], S.lvl, function (v) { S.lvl = v; })));
  var go = h('button.btn.go', { type: 'button', style: 'width:100%;margin-top:6px' }, 'Start the game'); go.onclick = function () { UI.lvl = S.lvl; newGame(S.mode, { lvl: S.lvl }); };
  var back = h('button.btn.alt', { type: 'button', style: 'width:100%;margin-top:8px' }, 'Back'); back.onclick = function () { showStart(); };
  card.appendChild(go); card.appendChild(back); st.innerHTML = ''; st.appendChild(card);
}
document.addEventListener('click', function (e) {
  var t = e.target.closest('[data-a]'); if (!t) return; var a = t.dataset.a;
  if (a === 'offer') selectOffer(+t.dataset.k); else if (a === 'adv') doAdvance(); else if (a === 'rot') rotate(); else if (a === 'flip') flip(); else if (a === 'sew') confirmSew(); else if (a === 'cancel') cancelSel();
  else if (a === 'strip') { var sd = +t.dataset.seat; if (sd !== viewSeat()) showOppQuilt(sd); else if (G) toast('Buttons ' + G.btn[sd] + ' · income ' + G.inc[sd] + ' per spot · ' + swEmpty(G.board[sd]) + ' empty squares'); }
  else if (a === 'resume') loadGame(); else if (a === 'quick') showStart('setup'); else if (a === 'rules') { GX.show('rulesd'); }
  else if (a === 'story') storyOpen(); else if (a === 'result') showResult(); else if (a === 'again') { var lv = UI.lvl; newGame(UI.mode === 'hot' ? 'hot' : 'vs', { lvl: lv }); } else if (a === 'title') showStart(); else if (a === 'look') { $('#rs').hidden = true; }
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
  return '<div class="rules"><h3>The goal</h3><p>Finish with the most points. Points are your buttons, plus 7 if you complete a 7×7 square on your quilt, minus 2 for every empty square.</p>' +
    '<h3>On your turn, choose one</h3><ul><li><b>Sew a patch.</b> Look at the three patches just past the neutral marker. Pay the button cost, place it on your quilt (turn and flip it freely, no overlaps), then move your time token forward by its time cost.</li><li><b>Advance.</b> Move your time token to the space right in front of your opponent’s and take 1 button for every space you moved.</li></ul>' +
    '<h3>Who goes next?</h3><p>The token further back on the track plays. If both are on the same space, the one on top (who arrived last) plays. So a slow, big patch can give your opponent several turns in a row.</p>' +
    '<h3>Button spots</h3><p>When your token passes a button spot, you earn one button for every button printed on the patches on your quilt. Cheap patches with buttons on them early are an engine.</p>' +
    '<h3>Leather patches</h3><p>Five brown spaces on the track each hold a free 1×1 leather patch. The first player to pass one sews it on immediately, anywhere empty.</p>' +
    '<h3>The 7×7 bonus</h3><p>The first player to fill a full 7×7 block of squares earns 7 bonus points.</p>' +
    '<h3>The end</h3><p>The game ends when both tokens reach the last space. Highest score wins; on a tie, whoever reached the end first.</p>' +
    '<h3>Tips</h3><ul><li>Gaps of 1 or 2 squares are hard to fill later: keep the edges tidy.</li><li>Time is your real currency. A cheap patch that takes little time is often better than a big one.</li><li>Advance when you are short of buttons, or to get the next turn.</li></ul></div>';
}
function buildRules() { var w = h('div', { html: rulesHtml() }); var rb = h('button.btn.alt', { type: 'button', style: 'margin-top:8px' }, 'Replay the tutorial'); rb.onclick = function () { GX.close(); tutStart(); }; w.appendChild(rb); GX.drawer('rulesd', 'How to play', w); var dr = $('#rulesd .gx-drawer-body'); dr.innerHTML = ''; dr.appendChild(w); }
function buildMenu() {
  var btn = function (txt, f, cls) { var b = h('button.btn.alt.sm' + (cls || ''), { type: 'button' }, txt); b.onclick = f; return b; };
  GX.settings({ id: 'setd', title: 'Menu',
    game: function (S) { S.appendChild(GX.row('Game', [btn('Rules', function () { GX.show('rulesd'); }), btn('Tutorial', function () { GX.close(); tutStart(); }), btn('Restart', restart), btn('Title', function () { GX.close(); showStart(); })])); },
    sound: function (S) { S.appendChild(GX.row('Sound effects', GX.onoff(UI.sound, function (v) { UI.sound = !!v; try { localStorage.setItem('sw_sound', v ? '1' : '0'); } catch (e) { } if (v) sfx('pick'); }))); S.appendChild(GX.row('Music', [btn('Music picker', function () { try { GXMUS.open(); } catch (e) { toast('No music files yet'); } })], 'Silent until the music files are added')); },
    help: function (S) { try { var w = h('div'); w.innerHTML = GXH.settingsHTML({ rowClass: 'mrow', btnClass: 'btn' }); while (w.firstChild) S.appendChild(w.firstChild); } catch (e) { } },
    about: { name: 'Stitchwise', version: '1.0', text: 'An original quilting duel. All names, patches and art are our own.' }, shelf: '../' });
}
function restart() { GX.close(); if (UI.tutorial) { tutStart(); return; } if (UI.camp && typeof GXC !== 'undefined') { var id = UI.camp.id; GXC.play(id); return; } newGame(UI.mode === 'hot' ? 'hot' : 'vs', { lvl: UI.lvl }); }
// ---------- result
function showResult() {
  var rs = $('#rs'); rs.hidden = false; var a = swScore(G, 0), b = swScore(G, 1), w = swWinner(G), hot = UI.mode === 'hot'; artBg(rs, w === 0 ? 'result-win' : 'result-lose');
  var title = hot ? nameOf(w) + ' wins!' : w === 0 ? 'You win!' : nameOf(1) + ' wins.';
  var c = h('div.card'); c.appendChild(h('div.win', title));
  c.appendChild(h('div.rsgrid', { html: '<span class="h"></span><span class="h">' + nameOf(0) + '</span><span class="h">' + nameOf(1) + '</span>' +
    '<span>Buttons</span><b>' + a.btn + '</b><b>' + b.btn + '</b><span>7×7 bonus</span><b>' + (a.bonus ? '+7' : '0') + '</b><b>' + (b.bonus ? '+7' : '0') + '</b><span>Empty squares</span><b>' + a.empty + ' (-' + a.pen + ')</b><b>' + b.empty + ' (-' + b.pen + ')</b><span><b>Total</b></span><b>' + a.total + '</b><b>' + b.total + '</b>' }));
  if (a.total === b.total) c.appendChild(h('p.sub', 'Tied on points: the player who reached the end first wins.'));
  var row = h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;margin-top:10px' });
  row.appendChild(h('button.btn.go.grow', { type: 'button', 'data-a': 'again' }, 'Play again')); row.appendChild(h('button.btn.alt', { type: 'button', 'data-a': 'look' }, 'Look at the quilts')); row.appendChild(h('button.btn.alt', { type: 'button', 'data-a': 'title' }, 'Title'));
  c.appendChild(row); rs.innerHTML = ''; rs.appendChild(c); UI.rsShown = true;
}
