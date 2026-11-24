// hud.js (W731): helpers for the clean play screen (score race: turnui.js scoreHTML; podium: screens.js gameOver).
// Always on screen: the score race (you vs rival, who leads, by how much), whose turn + what to do, round and actions left.
// Everything else (score breakdown, round goals, log, rules, bird details) opens in a window from a small icon button.
// Feedback: every point you or the rival earn bumps that score and floats "+N" from it. End of the year: a podium, not a table.
var HUD = { last: null };
var SRC = [['birds', 'Birds', '#5c8a3e'], ['eggs', 'Eggs', '#d9a43a'], ['goals', 'Round goals', '#3f7fa8'], ['bonus', 'Bonus card', '#a05aa8'], ['cache', 'Stored food', '#b0643a'], ['tuck', 'Tucked', '#6b6b6b']];
function hudName(i) { return i === UI.view && humans().length === 1 ? 'You' : G.pl[i].name; }
function hudTurnLine() {
  if (!G || G.phase === 'over') return 'The year is over';
  var cur = PP.sideToAct(G), who = humans().length > 1 ? G.pl[cur].name + ': ' : 'Your turn: ';
  if (!isHuman(cur)) return G.pl[cur].name + ' is playing';
  if (G.q || UI.pend || UI.sel != null) return who + 'finish your move';
  return who + 'pick one action';
}
// "+N" floats up from a score that just grew, and the number pops
function hudBump() {
  if (!G) return; var sc = G.pl.map(function (p, i) { return PP.scoreOf(G, i).total; }), was = HUD.last; HUD.last = sc;
  if (!was || was.length !== sc.length) return;
  sc.forEach(function (v, i) {
    var dv = v - was[i]; if (dv <= 0) return;
    var b = document.querySelector('#opps .rc[data-seat="' + i + '"]'); if (!b) return;
    b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
    var f = document.createElement('span'); f.className = 'rplus'; f.textContent = '+' + dv; b.appendChild(f);
    setTimeout(function () { if (f.parentNode) f.parentNode.removeChild(f); }, 1300);
    if (i === UI.view) try { sfx('goal'); } catch (e) { }
  });
}
// where the points came from: one stacked bar per player with the parts named under it (no table)
function hudPodium(sc, winners) {
  var order = sc.map(function (s, i) { return i; }).sort(function (a, b) { return (winners.indexOf(b) >= 0) - (winners.indexOf(a) >= 0) || sc[b].total - sc[a].total; });
  return '<div class="podium">' + order.map(function (i, k) { var w = winners.indexOf(i) >= 0;
    return '<div class="pod' + (w ? ' win' : '') + (i === UI.view ? ' me' : '') + '"><div class="pdhead"><span class="pdr">' + (w ? 'Winner' : ['1st', '2nd', '3rd', '4th', '5th'][k]) + '</span><span class="pdn">' + esc(G.pl[i].name) + '</span><b class="pdt" data-v="' + sc[i].total + '" data-engine="G.final[' + i + '].total">' + sc[i].total + '</b></div>' + hudSplit(sc[i], true) + '</div>'; }).join('') + '</div>';
}
function hudCount(el) { if (UI.fast || (window.GXS && GXS.on)) return; $$('.pdt', el).forEach(function (b) { var v = +b.dataset.v, t0 = Date.now(); b.textContent = '0'; var iv = setInterval(function () { var k = Math.min(1, (Date.now() - t0) / 1200); b.textContent = Math.round(v * (1 - Math.pow(1 - k, 3))); if (k >= 1) clearInterval(iv); }, 30); }); }
function hudSplit(s, big) {
  var t = Math.max(1, s.total), bar = '', key = '';
  SRC.forEach(function (x) { var v = s[x[0]] || 0; if (x[0] === 'tuck' && s.lead) v += s.lead; if (!v) return;
    bar += '<i style="width:' + (100 * v / t) + '%;background:' + x[2] + '"></i>';
    key += '<span><i style="background:' + x[2] + '"></i>' + x[1] + ' <b>' + v + '</b></span>'; });
  return '<div class="split' + (big ? ' big' : '') + '"><div class="sbar">' + (bar || '<i style="width:100%;background:#999"></i>') + '</div><div class="skey">' + (key || '<span>No points yet</span>') + '</div></div>';
}
// close button on the pop-up card; the Menu gains Hints and Screen map (they left the top bar)
document.addEventListener('click', function (e) { var t = e.target.closest && e.target.closest('[data-a="popx"]'); if (t) { var p = $('#pop'); if (p) p.hidden = true; } });
(function () {
  var addMenu = function () {
    var S = document.querySelector('#setd .gx-dr-body') || document.querySelector('#setd'); if (!S || S.querySelector('.hudmore')) return;
    var row = document.createElement('div'); row.className = 'hudmore';
    var mk = function (txt, fn) { var b = document.createElement('button'); b.type = 'button'; b.className = 'btn'; b.textContent = txt; b.onclick = fn; return b; };
    row.appendChild(mk('Hints on / off', function () { var b = $('#bulbbtn'); if (b) b.click(); }));
    row.appendChild(mk('Screen map', function () { try { GX.close(); } catch (e) { } var b = $('#mapbtn'); if (b) b.click(); }));
    S.insertBefore(row, S.firstChild);
  };
  document.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('#menubtn')) [30, 200].forEach(function (ms) { setTimeout(addMenu, ms); }); }, true);
})();
