/* Redline Rally race feel: start lights, dashboard (speedometer, gear lever, heat gauge), live leaderboard, spin-out flash and skids,
   move preview on the track, turn tracker (round, phase, cards left), one-line round rating, podium and the championship. Loaded after ui.js. */
var RACE = { lights: null, spd: 0, spdT: 0, flash: 0, shake: 0, skids: [], ph: 'shift', rate: '', best: null, start: null };
var PHASES = [['shift', 'Shift'], ['play', 'Play'], ['move', 'Move'], ['react', 'React'], ['discard', 'Discard']];

/* ---------- start lights: five reds come on one by one, then all go out = GO. Never blocks input. ---------- */
function lightsStart() {
  if (UI.fast || window.ANIM === false) { RACE.lights = null; return; }
  RACE.lights = { t0: performance.now() };
  for (var k = 0; k < 5; k++) (function (k) { setTimeout(function () { sfx('beep'); }, 420 * k + 200); })(k);
  setTimeout(function () { sfx('lightsgo'); }, 420 * 5 + 300);
  setTimeout(function () { RACE.lights = null; }, 420 * 5 + 1300);
}
function lightsDraw(now, W) {
  var L = RACE.lights; if (!L) return; var t = L.freeze != null ? L.freeze : now - L.t0, on = Math.min(5, Math.floor((t - 200) / 420) + 1), out = t > 420 * 5 + 300;
  var r = Math.max(9, Math.min(18, W / 26)), gap = r * 2.6, w = gap * 5 + 16, x0 = W / 2 - w / 2, y0 = W < 500 ? 104 : 64;
  cx.fillStyle = 'rgba(10,12,18,.92)'; rr(x0, y0, w, r * 2 + 18, 12); cx.fill(); cx.strokeStyle = '#3a4152'; cx.lineWidth = 2; cx.stroke();
  for (var i = 0; i < 5; i++) {
    var lit = !out && i < on; cx.beginPath(); cx.arc(x0 + 8 + gap * i + gap / 2, y0 + 9 + r, r, 0, 7);
    cx.fillStyle = out ? '#2fd36b' : lit ? '#ff2a2a' : '#3b1416'; cx.shadowColor = lit ? '#ff2a2a' : out ? '#2fd36b' : 'transparent'; cx.shadowBlur = lit || out ? 16 : 0; cx.fill(); cx.shadowBlur = 0;
  }
  cx.font = '900 ' + Math.round(r * 1.1) + 'px sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'top'; cx.fillStyle = out ? '#2fd36b' : '#fff';
  cx.strokeStyle = '#000'; cx.lineWidth = 4; var tx = out ? 'GO!' : 'Lights...'; cx.strokeText(tx, W / 2, y0 + r * 2 + 24); cx.fillText(tx, W / 2, y0 + r * 2 + 24);
}

/* ---------- world layer (inside the camera transform): skid marks, move preview ---------- */
function raceWorld(now) {
  var tk = T(G);
  RACE.skids = RACE.skids.filter(function (s) { return now - s.t < 9000; });
  RACE.skids.forEach(function (s) {
    var a = 1 - (now - s.t) / 9000; cx.strokeStyle = 'rgba(15,15,15,' + (0.7 * a).toFixed(2) + ')'; cx.lineWidth = 7; cx.lineCap = 'round';
    for (var o = -1; o <= 1; o += 2) { cx.beginPath(); for (var k = 0; k <= 10; k++) { var q = tk.space(s.p - 1.4 + k * 0.14, s.lane), w = Math.sin(k * 0.9) * 10 + o * 12; var x = q.x - Math.sin(q.a) * w, y = q.y + Math.cos(q.a) * w; if (k) cx.lineTo(x, y); else cx.moveTo(x, y); } cx.stroke(); }
  });
  var pv = RACE.prev; if (!pv || !G || G.phase !== 'plan') return;
  /* corners crossed: green = safe, orange = burns heat, red = spin */
  pv.ks.forEach(function (k) {
    var q = tk.at(k.p * tk.seg), col = pv.spin ? '#ff3b30' : (pv.sp - k.limit - pv.ul > 0) ? '#ff9a2e' : '#3ddc84';
    cx.strokeStyle = col; cx.lineWidth = 14; cx.setLineDash([]); cx.beginPath(); cx.moveTo(q.x + Math.sin(q.a) * 66, q.y - Math.cos(q.a) * 66); cx.lineTo(q.x - Math.sin(q.a) * 66, q.y + Math.cos(q.a) * 66); cx.stroke();
  });
  /* path dots and ghost car at the landing space */
  var c = G.cars[pv.car]; cx.fillStyle = 'rgba(255,255,255,.75)';
  for (var p = c.pos + 1; p <= pv.L; p++) { var q2 = tk.space(p, 0); cx.beginPath(); cx.arc(q2.x, q2.y, 7, 0, 7); cx.fill(); }
  var g = tk.space(pv.spin ? pv.stop : pv.L, 0); cx.save(); cx.globalAlpha = 0.5 + 0.25 * Math.sin(now / 180); cx.translate(g.x, g.y); cx.rotate(g.a);
  cx.strokeStyle = pv.spin ? '#ff3b30' : '#fff'; cx.lineWidth = 5; cx.setLineDash([10, 8]); rr(-40, -20, 80, 40, 9); cx.stroke(); cx.setLineDash([]); cx.restore();
  var lb = pv.spin ? 'SPIN' : pv.burn ? '-' + pv.burn + ' heat' : 'safe';
  cx.font = '900 30px sans-serif'; cx.textAlign = 'center'; cx.textBaseline = 'bottom'; cx.lineWidth = 7; cx.strokeStyle = '#000'; cx.fillStyle = pv.spin ? '#ff5a4a' : pv.burn ? '#ffb347' : '#8cf0b4';
  cx.strokeText(lb, g.x, g.y - 34); cx.fillText(lb, g.x, g.y - 34);
  if (pv.slip) { cx.font = '800 24px sans-serif'; cx.fillStyle = '#8ce6ff'; cx.strokeText('slipstream +' + slipN(G) + '?', g.x, g.y + 62); cx.fillText('slipstream +' + slipN(G) + '?', g.x, g.y + 62); }
}

/* ---------- screen layer: dashboard, leaderboard, flash, lights ---------- */
function raceHud(now, W, H) {
  if (!G) return; var c = G.cars[UI.focus] || G.cars[0];
  RACE.spd += (RACE.spdT - RACE.spd) * ((UI.fast || window.ANIM === false) ? 1 : 0.08);
  /* leaderboard, top-left */
  var rk = rankList(G), fs = W < 500 ? 13 : 15, showLb = hintsOn();
  if (showLb) { rh = fs + 7, bw = W < 500 ? 104 : 150, n = rk.length;
  var lx = W - bw - 6, ly = H - (rh * n + 10) - 6; if (H < 260) ly = 6; cx.fillStyle = 'rgba(8,12,20,.78)'; rr(lx, ly, bw, rh * n + 10, 8); cx.fill();
  cx.font = '800 ' + fs + 'px sans-serif'; cx.textBaseline = 'middle';
  rk.forEach(function (ci, k) {
    var o = G.cars[ci], y = ly + 5 + rh * k + rh / 2; cx.fillStyle = COLS[o.col].hex; cx.fillRect(lx + 4, y - rh / 2 + 3, 5, rh - 6);
    cx.textAlign = 'left'; cx.fillStyle = o.human ? '#ffd24a' : '#fff'; var nm = (k + 1) + ' ' + (o.human && !G.hot ? 'You' : o.name.split(' ')[0]); cx.fillText(nm, lx + 14, y);
    cx.textAlign = 'right'; cx.fillStyle = '#c9d2e3'; cx.fillText(o.fin ? 'FIN' : 'L' + Math.min(G.laps, Math.floor(o.pos / T(G).N) + 1), lx + bw - 5, y);
  });
  }
  /* dashboard, bottom-left: speedometer, gear lever, heat gauge */
  var R = W < 500 ? 30 : 42, bx = 8, by = H - R * 2 - 18, dw = R * 2 + R * 1.3 + R * 0.9 + 34;
  if (H > 240) {
    cx.fillStyle = 'rgba(8,12,20,.8)'; rr(bx, by, dw, R * 2 + 12, 12); cx.fill();
    var ox = bx + 6 + R, oy = by + 6 + R, a0 = Math.PI * 0.8, a1 = Math.PI * 2.2, max = 20, f = Math.min(1, RACE.spd / max);
    cx.lineWidth = R * 0.18; cx.lineCap = 'butt'; cx.strokeStyle = '#2a3140'; cx.beginPath(); cx.arc(ox, oy, R * 0.86, a0, a1); cx.stroke();
    cx.strokeStyle = f > 0.7 ? '#ff4d3a' : f > 0.45 ? '#ffb347' : '#3ddc84'; cx.beginPath(); cx.arc(ox, oy, R * 0.86, a0, a0 + (a1 - a0) * f); cx.stroke();
    var na = a0 + (a1 - a0) * f; cx.strokeStyle = '#fff'; cx.lineWidth = 3; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(ox, oy); cx.lineTo(ox + Math.cos(na) * R * 0.7, oy + Math.sin(na) * R * 0.7); cx.stroke();
    cx.fillStyle = '#fff'; cx.textAlign = 'center'; cx.textBaseline = 'middle'; cx.font = '900 ' + Math.round(R * 0.5) + 'px sans-serif'; cx.fillText(String(Math.round(RACE.spd)), ox, oy + R * 0.42);
    cx.font = '700 ' + Math.max(10, Math.round(R * 0.28)) + 'px sans-serif'; cx.fillStyle = '#9aa6bb'; cx.fillText('SPEED', ox, oy - R * 0.28);
    /* gear lever: H-gate 1-2 / 3-4, the knob sits in the current gear */
    var gx = bx + R * 2 + 18, gw = R * 1.1, gy = by + 8 + R * 0.26, gh = R * 2 - 4 - R * 0.52, gear = (G.phase === 'plan' && c.i === UI.seat && !c.plan && !UI.busy) ? UI.gear : c.gear;   /* lever follows the gear you pick */
    RACE.gk = RACE.gk == null || UI.fast || window.ANIM === false ? gear : RACE.gk + (gear - RACE.gk) * 0.25; if (Math.abs(RACE.gk - gear) < 0.02) RACE.gk = gear;
    cx.strokeStyle = '#59627a'; cx.lineWidth = 4; cx.beginPath(); cx.moveTo(gx, gy); cx.lineTo(gx, gy + gh); cx.moveTo(gx + gw, gy); cx.lineTo(gx + gw, gy + gh); cx.moveTo(gx, gy + gh / 2); cx.lineTo(gx + gw, gy + gh / 2); cx.stroke();
    var gpos = function (g) { return [gx + (g >= 3 ? gw : 0), gy + (g % 2 ? 0 : gh)]; }, gf = Math.floor(RACE.gk), gt = Math.min(4, gf + 1), gq = RACE.gk - gf, pa = gpos(gf), pb = gpos(gt), kx, ky;
    /* knob path through the H-gate: out to the middle bar, across, then in */
    if (gq === 0) { kx = pa[0]; ky = pa[1]; } else { var mid = gy + gh / 2; if (gq < 0.33) { kx = pa[0]; ky = pa[1] + (mid - pa[1]) * gq / 0.33; } else if (gq < 0.66) { kx = pa[0] + (pb[0] - pa[0]) * (gq - 0.33) / 0.33; ky = mid; } else { kx = pb[0]; ky = mid + (pb[1] - mid) * (gq - 0.66) / 0.34; } } cx.fillStyle = '#ffd24a'; cx.beginPath(); cx.arc(kx, ky, R * 0.26, 0, 7); cx.fill();
    cx.fillStyle = '#111'; cx.font = '900 ' + Math.round(R * 0.32) + 'px sans-serif'; cx.fillText(String(gear), kx, ky + 1);
    /* heat gauge: fills as engine heat is burned; red = close to a spin */
    var cap = ENGINE0 + (c.xh || 0), used = cap - c.eng, hx = gx + gw + 18, hw = R * 0.5, hy = by + 8, hh = R * 2 - 4, hf = Math.max(0, Math.min(1, used / cap));
    cx.fillStyle = '#2a3140'; rr(hx, hy, hw, hh, 5); cx.fill();
    cx.fillStyle = c.eng <= 1 ? '#ff3b30' : c.eng <= 3 ? '#ff9a2e' : '#ffcf4a'; rr(hx, hy + hh * (1 - hf), hw, hh * hf, 5); cx.fill();
    cx.fillStyle = '#fff'; cx.font = '900 ' + Math.max(11, Math.round(R * 0.3)) + 'px sans-serif'; cx.fillText(String(c.eng), hx + hw / 2, hy + hh / 2);
  }
  if (RACE.flash) { var fa = RACE.flashHold ? 0.7 : 1 - (now - RACE.flash) / 700; if (fa > 0) { cx.fillStyle = 'rgba(255,30,20,' + (0.45 * fa).toFixed(2) + ')'; cx.fillRect(0, 0, W, H); } else RACE.flash = 0; }
  lightsDraw(now, W);
}
function camShake(now) { if (!RACE.shake || RACE.flashHold) return 0; var a = 1 - (now - RACE.shake) / 500; if (a <= 0) { RACE.shake = 0; return 0; } return Math.sin(now / 18) * 10 * a; }
function raceSpin(e) { RACE.flash = performance.now(); RACE.shake = RACE.flash; RACE.skids.push({ p: e.to + 1, lane: laneOf(e.car), t: RACE.flash }); sfx('skid'); }

/* ---------- move preview (plan phase): landing, corner cost, spin, slipstream ---------- */
function previewSet(ci) {
  if (ci == null) { RACE.prev = null; return ci; } var c = G.cars[UI.seat]; if (!c || G.phase !== 'plan' || UI.sel.length !== needCards(c, UI.gear)) { RACE.prev = null; return ci; }
  var ul = 0; UI.sel.forEach(function (j) { var u = upgId(c.hand[j]); if (u) ul += UPG[u].lim; });
  var L = landing(G, c, c.pos + ci.sp + ci.adr), N = T(G).N, stop = L;
  if (ci.spin) { var bad = null, left = c.eng - ci.cost; ci.ks.forEach(function (k) { if (bad) return; var need = Math.max(0, ci.sp - k.limit - ul); if (need > left) bad = k; else left -= need; }); stop = bad ? Math.max(c.pos, bad.p - 1) : L; }
  var slip = L < total(G) && G.cars.some(function (o) { return o !== c && (o.pos % N === L % N || o.pos % N === (L + 1) % N); });
  RACE.prev = { car: c.i, L: L, stop: stop, ks: cornersIn(G, c.pos, L), sp: ci.sp, ul: ul, burn: ci.burn, spin: ci.spin, slip: slip };
  ci.slip = slip; return ci;
}

/* ---------- turn tracker: round, lap, phase, cards left; plus the last round's rating ---------- */
function setPhase(ph) { RACE.ph = ph; tracker(); }
function tracker() {
  var d = document.getElementById('trk'); if (!d) { var body = document.querySelector('.gx-dock-body'); if (!body) return; d = document.createElement('div'); d.id = 'trk'; body.insertBefore(d, body.firstChild); }
  if (!G) return; var me = G.cars[UI.seat] || G.cars[0], lap = Math.min(G.laps, Math.floor(me.pos / T(G).N) + 1);
  var mine = G.phase === 'plan' || (curCar(G) && curCar(G).i === me.i) || G.pend;
  var dt = document.getElementById('dockt'); if (dt) dt.textContent = 'Round ' + G.round + ' · Lap ' + lap + '/' + G.laps + ' · Deck ' + me.deck.length + ' · Discard ' + me.disc.length + (G.wx && G.wx !== 'dry' ? ' · ' + WEATHER[G.wx].name : '');
  var rk = rankList(G), pl = rk.indexOf(me.i) + 1, ld = G.cars[rk[0]], gap = ld.pos - me.pos, nm = function (c) { return c.human && !G.hot ? 'You' : c.name.split(' ')[0]; };
  var lead2 = rk[1] != null ? me.pos - G.cars[rk[1]].pos : 0, sc = pl === 1 ? 'You lead' + (rk[1] != null ? (lead2 ? ' by ' + lead2 + ' over ' + nm(G.cars[rk[1]]) : ', level with ' + nm(G.cars[rk[1]])) : '') : 'You ' + ord(pl) + ' of ' + rk.length + ' · ' + (gap ? nm(ld) + ' leads by ' + gap : 'level with ' + nm(ld));
  var h = '<button type="button" class="score" id="scoreL" title="Race order: tap for why">' + esc(sc) + '<i>why?</i></button><ol class="phs" aria-label="Your turn phases">';
  PHASES.forEach(function (p) { h += '<li class="' + (mine && RACE.ph === p[0] ? 'on' : '') + '">' + p[1] + '</li>'; });
  h += '</ol>';
  d.innerHTML = h; var sb = document.getElementById('scoreL'); if (sb) sb.onclick = scoreWhy;
}
/* the computer's best plan for this hand, as a yardstick for the round rating */
function rateStart(c) {
  try { var g2 = JSON.parse(JSON.stringify(G)), p = aiPlan(g2, g2.cars[c.i]), sp = 0, avg = avgSpeed(c); p.cards.forEach(function (x) { var u = upgId(x); sp += u ? UPG[u].sp : x === 'X' ? avg : +x; }); if (p.boost) sp += avg; RACE.best = { sp: Math.round(sp) }; } catch (e) { RACE.best = null; }
  RACE.start = { pos: c.pos, heat: c.stats.heat, spins: c.stats.spins, ci: c.i };
}
function rateRound() {
  var s = RACE.start; if (!s || !G || !G.cars[s.ci]) { RACE.start = null; return; } var c = G.cars[s.ci], d = c.pos - s.pos, ht = c.stats.heat - s.heat, sp = c.stats.spins > s.spins, b = RACE.best ? RACE.best.sp : d, k, t;
  if (sp) { k = 'poor'; t = 'Poor: you spun out. Brake earlier next time.'; }
  else if (d >= b - 1 && ht <= 2) { k = 'good'; t = 'Good: ' + d + ' spaces for ' + ht + ' heat.'; }
  else if (d < b - 2) { k = 'okay'; t = 'Okay: ' + d + ' spaces. The best play went about ' + b + '.'; }
  else { k = ht > 2 ? 'okay' : 'good'; t = (ht > 2 ? 'Okay: ' : 'Good: ') + d + ' spaces, ' + ht + ' heat burned.'; }
  RACE.rate = t; RACE.rateK = k; RACE.start = null; RACE.rateShow = 1; tracker();
}

/* ---------- podium (result screen) ---------- */
function podiumHtml(rank) {
  var top = rank.slice(0, 3), order = [1, 0, 2], h = '<div class="pod3">';
  order.forEach(function (k) { var ci = top[k]; if (ci == null) return; var c = G.cars[ci]; h += '<div class="ps p' + (k + 1) + '"><span class="pc" style="background:' + COLS[c.col].hex + '"></span><b>' + esc(c.human && !G.hot ? 'You' : c.name.split(' ')[0]) + '</b><div class="blk">' + (k + 1) + '</div></div>'; });
  return h + '</div>';
}

/* ---------- championship: three tracks, points per place (house values), the same drivers every race ---------- */
function champLoad() { try { return JSON.parse(lsGet('rr_champ') || 'null'); } catch (e) { return null; } }
function champSave(ch) { lsSet('rr_champ', ch ? JSON.stringify(ch) : ''); }
function champStart(fresh) {
  var ch = fresh ? null : champLoad(); if (ch && champOver(ch)) ch = null;
  var s = UI.set, o = { track: CHAMP_TRACKS[ch ? ch.race : 0], laps: s.laps, opp: s.opp, hum: 1, diff: s.diff, upg: false, wx: s.wx, sup: s.sup, champ: true };
  if (ch) o.opp = ch.rows.length - 1;
  startGame(o);
  if (!ch) { ch = champNew(G.cars.map(function (c) { return c.name; })); ch.rows.forEach(function (r, i) { r.drv = G.cars[i].drv; }); champSave(ch); }
  else { G.cars.forEach(function (c, i) { var r = ch.rows[i]; if (r) { c.name = r.name; c.drv = r.drv; } }); }
  UI.champ = ch; banner('Championship race ' + (ch.race + 1) + ' of ' + ch.tracks.length + ': ' + TK[G.track].name, null, 'round'); tracker();
}
function champResult() {
  var ch = UI.champ; champAward(ch, G.rank); champSave(ch); var t = champTable(ch), over = champOver(ch), me = G.cars.filter(function (c) { return c.human; })[0];
  var rows = t.map(function (r, k) { var c = G.cars[r.i]; return '<tr class="' + (c && c.human ? 'you' : '') + '"><td>' + (k + 1) + '</td><td><i class="pc" style="background:' + COLS[c ? c.col : 0].hex + '"></i>' + esc(r.name) + '</td><td>' + r.res.join(' · ') + '</td><td><b>' + r.pts + '</b></td></tr>'; }).join('');
  var champ = t[0], youWon = me && champ.i === me.i;
  var head = over ? '<h2>' + (youWon ? 'You are the champion!' : esc(champ.name) + ' is the champion') + '</h2>' : '<h2>Championship: after race ' + ch.race + ' of ' + ch.tracks.length + '</h2>';
  UI.lockModal = true; sfx(over && youWon ? 'win' : 'card');
  modal(head + podiumHtml(G.rank) + '<p class="rl">Points per place: ' + CHAMP_PTS.join(', ') + '. Ties: more wins, then the better last race.</p><table class="champ"><thead><tr><th>#</th><th>Driver</th><th>Places</th><th>Pts</th></tr></thead><tbody>' + rows + '</tbody></table><div class="row" style="margin-top:10px">' +
    (over ? '<button class="big" id="cNew">New championship</button>' : '<button class="big" id="cNext">Next race: ' + esc(TK[ch.tracks[ch.race]].name) + '</button>') + '<button class="ghostb" id="home">Title</button></div>');
  $('#mx').hidden = true;
  if (over) { champSave(null); $('#cNew').onclick = function () { UI.lockModal = false; champStart(true); }; } else $('#cNext').onclick = function () { UI.lockModal = false; champStart(false); };
  $('#home').onclick = function () { UI.lockModal = false; UI.champ = null; showTitle(); };
}

/* ---------- Play mode: the "why" of the race order opens on tap only ---------- */
function scoreWhy() {
  var rk = rankList(G), N = T(G).N, rows = rk.map(function (ci, k) { var c = G.cars[ci]; return '<tr class="' + (c.human ? 'you' : '') + '"><td>' + (k + 1) + '</td><td><i class="pc" style="background:' + COLS[c.col].hex + '"></i>' + esc(c.human && !G.hot ? 'You' : c.name) + '</td><td>' + (c.fin ? 'finished ' + ord(c.fin) : 'lap ' + Math.min(G.laps, Math.floor(c.pos / N) + 1) + ', ' + (total(G) - c.pos) + ' to go') + '</td><td>heat ' + c.eng + '</td></tr>'; }).join('');
  modal('<h2>Race order</h2><p>The car furthest round the track is ahead. Two cars on one space? The first one there is ahead. The race ends when all cars finish ' + G.laps + ' lap' + (G.laps > 1 ? 's' : '') + '.</p><table class="champ"><tbody>' + rows + '</tbody></table>');
}
/* ---------- Play mode: one "Goal" card before turn 1 ---------- */
function goalCard(then) {
  UI.lockModal = true;
  modal('<h2>Goal: first across the line after ' + G.laps + ' lap' + (G.laps > 1 ? 's' : '') + '</h2><ul class="goal"><li><b>Gear = cards.</b> Gear 3 means you play 3 cards.</li><li><b>Add them up.</b> The total is how far you drive.</li><li><b>Corners burn heat.</b> Too fast with no heat? You spin.</li></ul>' +
    (G.wx && G.wx !== 'dry' ? '<p class="wxl"><b>' + esc(WEATHER[G.wx].name) + ':</b> ' + esc(WEATHER[G.wx].txt) + '</p>' : '') + '<button class="big" id="goalB" style="width:100%">Start the race</button>');
  $('#mx').hidden = true; $('#goalB').onclick = function () { UI.lockModal = false; closeModal(); then(); };
}
function setHints(on) {
  UI.hints = !!on; lsSet('rr_hints', on ? '1' : '0');
  var b = document.getElementById('hintT'); if (b) { b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.firstChild.textContent = on ? 'Hints ✓' : 'Hints'; b.setAttribute('aria-label', 'Hints ' + (on ? 'on' : 'off')); b.classList.toggle('on', !!on); }
  var bl = document.getElementById('bulbbtn'); if (bl) bl.hidden = !hintsOn();
  if (G && G.phase === 'plan' && !UI.busy && !$('#game').hidden && G.cars[UI.seat] && !G.cars[UI.seat].plan) drawPlan(); else tracker();
}
/* ---------- scenery (R9: "fill the infield, not a flat grey strip"): grass, trees, stands, run-off sand in the track art's
   flat style, drawn over the art with the road cut out, so the art's road and kerbs stay on top. One cached layer per track. */
var SCENE = {};
function sceneryLayer(id) {
  if (SCENE[id]) return SCENE[id];
  var tk = TK[id], c = document.createElement('canvas'); c.width = 1000; c.height = 600; var g = c.getContext('2d'); g.scale(0.5, 0.5);
  var seed = 7; for (var q = 0; q < id.length; q++) seed = (seed * 31 + id.charCodeAt(q)) >>> 0;
  function rnd() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }
  function dRoad(x, y) { var m = 1e9; for (var i = 0; i < tk.dense.length; i += 2) { var p = tk.dense[i], d = (p[0] - x) * (p[0] - x) + (p[1] - y) * (p[1] - y); if (d < m) m = d; } return Math.sqrt(m); }
  /* grass with mowing stripes */
  g.fillStyle = '#2d6a45'; g.fillRect(0, 0, 2000, 1200);
  g.fillStyle = '#327550'; for (var sx = -1200; sx < 2000; sx += 120) { g.beginPath(); g.moveTo(sx, 1200); g.lineTo(sx + 60, 1200); g.lineTo(sx + 60 + 1200, 0); g.lineTo(sx + 1200, 0); g.closePath(); g.fill(); }
  /* run-off sand on the outside of every corner */
  tk.list.forEach(function (k) {
    var a = tk.at(k.idx * tk.seg), ox = a.x - Math.sin(a.a) * 150, oy = a.y + Math.cos(a.a) * 150;
    g.save(); g.translate(ox, oy); g.rotate(a.a); g.fillStyle = '#d9c08a'; g.beginPath(); g.ellipse(0, 0, 150, 58, 0, 0, 7); g.fill();
    g.fillStyle = 'rgba(160,130,80,.35)'; for (var t = 0; t < 14; t++) { g.beginPath(); g.arc((rnd() - .5) * 220, (rnd() - .5) * 70, 3, 0, 7); g.fill(); } g.restore();
    /* tyre wall behind the sand */
    var wx = a.x - Math.sin(a.a) * 222, wy = a.y + Math.cos(a.a) * 222;
    for (var w = -5; w <= 5; w++) { var px = wx + Math.cos(a.a) * w * 22, py = wy + Math.sin(a.a) * w * 22; g.fillStyle = '#1b1e24'; g.beginPath(); g.arc(px, py, 10, 0, 7); g.fill(); g.fillStyle = w % 2 ? '#e8e4d8' : '#d23a2c'; g.beginPath(); g.arc(px, py, 4.5, 0, 7); g.fill(); }
  });
  /* grandstands along the start straight, on the outside */
  [-3, -1.6, 1.6].forEach(function (o, n) {
    var a = tk.at(o * tk.seg * 1.4), bx = a.x - Math.sin(a.a) * 205, by = a.y + Math.cos(a.a) * 205;
    if (bx < 90 || bx > 1910 || by < 60 || by > 1140) return;
    g.save(); g.translate(bx, by); g.rotate(a.a);
    g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(-106, -26, 220, 64); g.fillStyle = '#5a6478'; g.fillRect(-110, -32, 220, 64); g.fillStyle = '#c8352b'; g.fillRect(-110, -38, 220, 10);
    var cols = ['#ffd24a', '#4a9bff', '#ff6b5a', '#f1f4fa', '#3ec47c', '#c08cff'];
    for (var r = 0; r < 3; r++) for (var s = 0; s < 18; s++) { g.fillStyle = cols[(r * 7 + s * 3 + n) % cols.length]; g.beginPath(); g.arc(-100 + s * 11.8, -16 + r * 17, 4.6, 0, 7); g.fill(); }
    g.restore();
  });
  /* trees and tents wherever there is room (not on or next to the road) */
  for (var y = 60; y < 1160; y += 64) for (var x = 60; x < 1960; x += 64) {
    var px = x + (rnd() - .5) * 44, py = y + (rnd() - .5) * 44, d = dRoad(px, py), r0 = rnd();
    if (d < 175) continue;
    if (r0 < 0.3) { var R = 22 + rnd() * 16; g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.arc(px + 7, py + 9, R, 0, 7); g.fill(); g.fillStyle = '#1f5a36'; g.beginPath(); g.arc(px, py, R, 0, 7); g.fill(); g.fillStyle = '#2b7646'; g.beginPath(); g.arc(px - R * .25, py - R * .25, R * .62, 0, 7); g.fill(); }
    else if (r0 < 0.47 && d < 330) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(px - 26, py - 16, 58, 40); var tc = rnd() < .5 ? '#e8e4d8' : '#ffb347'; g.fillStyle = tc; g.beginPath(); g.moveTo(px - 30, py + 18); g.lineTo(px, py - 22); g.lineTo(px + 30, py + 18); g.closePath(); g.fill(); g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.moveTo(px, py - 22); g.lineTo(px + 30, py + 18); g.lineTo(px, py + 18); g.closePath(); g.fill(); }
  }
  /* cut the road out so the track art's road, kerbs and start line show through */
  g.globalCompositeOperation = 'destination-out'; g.lineJoin = 'round'; g.lineCap = 'round'; g.lineWidth = 172; g.beginPath();
  tk.dense.forEach(function (p, i) { if (i) g.lineTo(p[0], p[1]); else g.moveTo(p[0], p[1]); }); g.closePath(); g.stroke();
  g.globalCompositeOperation = 'source-over';
  return (SCENE[id] = c);
}
