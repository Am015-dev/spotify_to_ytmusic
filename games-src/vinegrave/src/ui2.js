// ===================== part 2: inspect sheets, input, moves, computer turns, effects, sound, save =====================
function openInsp(kind, x) { UI.insp = { kind, x }; refreshInsp(); $('#insp').hidden = false; $('#iscrim').hidden = false; const b = $('#insp .btn'); }
function closeInsp() { UI.insp = null; $('#insp').hidden = true; $('#iscrim').hidden = true; }
function refreshInsp() {
  const I = UI.insp; if (!I || !G) return closeInsp(); const L = legal(), q = G.q && myTurn() ? G.q : null, me = G.p[UI.view]; let h = '';
  const btns = []; const add = (m, label, cls) => btns.push(mvBtn(m, label, cls || 'go'));
  if (I.kind === 'site') {
    const x = G.sites[I.x], hid = !x.tile;
    h += `<h3>${esc(siteName(x))}</h3><div class="irow"><div class="big"><div class="site l${x.lvl}${hid ? ' hid' : ''}" style="width:120px;height:104px"><span class="pic" data-art="${hid ? 'site-hidden-' + x.lvl : 'site-' + x.tile}"><span class="ph"><svg><use href="#s-${hid ? 'compass' : 'leaf'}"/></svg></span></span></div></div><div>`;
    h += `<p>Travel: ${x.cost.map(t => ic(t) + ' ' + V.TNAME[t]).join(' + ')}</p>`;
    h += hid ? `<p>Discover: pay ${V.DISC[x.lvl]} ${ic('compass')} + travel. You find an idol, dig its loot, and a guardian wakes.</p>` : `<p>Dig: gain ${resHTML(V.SITE[x.tile].rew)}</p>`;
    if (x.occ !== -1) h += `<p>${esc(x.occ === -2 ? G.rival.name : G.p[x.occ].name)} is here this round.</p>`;
    if (x.guard) { const gd = V.GUARD[x.guard]; h += `<p><b>${esc(gd.name)}</b> guards it. Overcome: pay ${resHTML(gd.cost)} → 5 ${ic('star', 'points')} and a boon: ${esc(V.opText(gd.boon))}. Still here at round end? The explorer on it takes a Dread card.</p>`; }
    h += '</div></div>';
    L.forEach(m => {
      if (m.s !== I.x) return; const pl = (m.t === 'dig' || m.t === 'disc') ? VG.payPlan(G, UI.view, x.cost) : null;
      const how = pl ? ' <span class="sm">pays with ' + (pl.cards.map(i => V.CARDS[me.hand[i]].name).concat(pl.coins ? [pl.coins + ' coins (plane)'] : []).join(', ') || 'nothing') + '</span>' : '';
      if (m.t === 'dig') add(m, 'Dig here' + how); if (m.t === 'disc') add(m, 'Discover (' + V.DISC[x.lvl] + ' compasses)' + how); if (m.t === 'beat') add(m, 'Overcome the guardian');
    });
    if (q && q.h === 'site') VG.moves(G).forEach(m => { if (m.v === I.x) add(m, 'Dig here for free'); });
    if (!btns.length && myTurn() && !q) h += `<p class="sm">${whyNotSite(x)}</p>`;
  } else if (I.kind === 'row' || I.kind === 'hand') {
    const id = I.kind === 'row' ? G.row[I.x] : me.hand[I.x]; if (!id) return closeInsp(); const c = V.CARDS[id];
    h += `<h3>${esc(c.name)}</h3><div class="irow"><div class="big">${cardHTML(id, {})}</div><div><p><b>${c.t === 'item' ? 'Item' : c.t === 'art' ? 'Artifact' : c.t === 'fear' ? 'Dread (fear)' : 'Starting card'}</b>${c.t === 'item' ? ' · costs ' + c.cost + ' ' + ic('coin') : c.t === 'art' ? ' · costs ' + c.cost + ' ' + ic('compass') : ''}</p><p>${esc(c.text)}</p>`;
    h += `<p class="sm">Or discard it to pay one ${ic(c.tr)} ${V.TNAME[c.tr]} of travel.${c.vp ? ' Worth ' + c.vp + ' points at the end.' : ''}</p>`;
    if (c.t === 'item') h += '<p class="sm">Bought items go to the bottom of your deck.</p>'; if (c.t === 'art') h += '<p class="sm">Artifacts work at once when bought. Played later from your hand they cost 1 tablet.</p>';
    h += '</div></div>';
    L.forEach(m => { if (I.kind === 'row' && m.t === 'buy' && m.r === I.x) add(m, 'Buy it'); if (I.kind === 'hand' && m.t === 'play' && m.i === I.x) add(m, 'Play it' + (c.t === 'art' ? ' (1 tablet)' : '')); });
    if (q && q.h === 'buy' && I.kind === 'row') VG.moves(G).forEach(m => { if (m.v === I.x) add(m, 'Buy it ' + q.d.o + ' cheaper'); });
    if (!btns.length && myTurn() && !q) h += `<p class="sm">${I.kind === 'row' ? 'You cannot pay for it yet.' : c.t === 'fear' ? 'Dread does nothing when played: use it for travel.' : c.t === 'art' ? 'You need a tablet to play it.' : ''}</p>`;
  } else if (I.kind === 'track') {
    h += `<h3>Research track</h3><p class="sm">Your magnifier ${ic('up')} climbs first; your notebook may follow but never pass it. Each row costs what it shows and gives a bonus. The top row is the temple.</p><table class="sct"><tr><th>Row</th><th>Cost</th><th>Bonus</th><th>Pts</th></tr>`;
    for (let r = V.TOP; r >= 1; r--) h += `<tr><td>${r === V.TOP ? 'Temple' : r}${me.glass === r ? ' 🔍' : ''}${me.note === r ? ' 📓' : ''}</td><td>${resHTML(V.TRACK[r].cost)}</td><td>${resHTML(V.TRACK[r].bonus)}</td><td>${V.NOTE_VP[r]}/${V.GLASS_VP[r]}</td></tr>`;
    h += `</table><p class="sm">Points: notebook / magnifier. At the temple you buy tiles: ${V.TEMPLE.map((t, k) => t.vp + ' pts for ' + V.resText(t.cost) + ' (' + G.temple[k] + ' left)').join('; ')}.</p>`;
    L.forEach(m => { if (m.t === 'res') add(m, m.k === 'g' ? 'Climb with the magnifier' : 'Climb with the notebook'); if (m.t === 'temple') add(m, 'Temple tile: ' + V.TEMPLE[m.k].vp + ' points'); });
  } else if (I.kind === 'guard') {
    const g = me.guards[I.x], gd = V.GUARD[g.id];
    h += `<h3>${esc(gd.name)}</h3><div class="irow"><div class="big"><div class="fxcard" style="animation:none;padding:6px"><div class="por" data-art="guard-${g.id}" style="width:100px;height:100px"><svg><use href="#s-guard"/></svg></div></div></div><div><p>Overcome: worth 5 points.</p><p>Boon (once, free): ${esc(V.opText(gd.boon))}.</p>${g.used ? '<p class="sm">Boon already used.</p>' : ''}</div></div>`;
    L.forEach(m => { if (m.t === 'boon' && m.k === I.x) add(m, 'Use the boon (free)'); });
  } else if (I.kind === 'idol') {
    const d = me.idols[I.x], id = V.IDOL[d.id];
    h += `<h3>${esc(id.name)}</h3><p>Kept, it is worth ${V.IDOL_VP} points. Set it in a shrine for a boon now; then it is worth ${V.IDOL_USED_VP}. One idol per turn, ${V.SLOTS} shrine slots.</p>${d.used ? '<p class="sm">This idol is in a shrine.</p>' : ''}`;
    L.forEach(m => { if (m.t === 'idol' && m.k === I.x) add(m, 'Shrine: ' + V.SHRINE[m.sh].text, ''); });
  }
  $('#insp').innerHTML = `<button type="button" class="ix" data-a="ix" aria-label="Close">×</button>` + h + (btns.length ? `<div class="ibtns">${btns.join('')}</div>` : '');
  if (typeof artApply === 'function') artApply($('#insp'));
}
function whyNotSite(x) {
  const me = G.p[UI.view];
  if (x.occ !== -1) return 'Someone is already here this round.';
  if (!me.ex) return 'Both your explorers are out this round.';
  if (!x.tile && me.res.compass < V.DISC[x.lvl]) return 'You need ' + V.DISC[x.lvl] + ' compasses to discover it.';
  return 'Your hand cannot pay this travel (2 coins buy a plane).';
}
// ---------------------------------------------------------------- input
document.addEventListener('click', e => {
  const t = e.target.closest('[data-a]'); if (!t) return; const a = t.dataset.a;
  sfx.unlock();
  if (a === 'ix') { closeInsp(); return; }
  if (a === 'mv') { const m = UI.mv[+t.dataset.m]; if (m) { if (!tutAct({ what: 'mv', m })) return; closeInsp(); doMove(m); } return; }
  if (a === 'site' || a === 'row' || a === 'hand' || a === 'track' || a === 'guard' || a === 'idol') {
    if (!G) return; const x = a === 'site' || a === 'hand' ? +t.dataset.i : a === 'row' ? +t.dataset.r : +t.dataset.k;
    if (!tutAct({ what: a, x, id: t.dataset.id })) return;
    sfx.play('tap'); openInsp(a, x); return;
  }
  if (UIACT[a]) UIACT[a](t, e);
});
$('#iscrim').addEventListener('click', () => { if (typeof GXT !== 'undefined' && GXT.active()) return; closeInsp(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && UI.insp) closeInsp(); });
const UIACT = {};
function tutAct(x) { if (typeof GXT === 'undefined' || !GXT.active() || UI.mode !== 'tutorial') return true; return GXT.act(Object.assign({ type: 'tap' }, x)); }
// ---------------------------------------------------------------- moves and the computer
function doMove(m) {
  if (!G) return; const s = VG.actor(G), r = VG.apply(G, m);
  if (!r.ok) { toast('That move is not allowed now.'); render(); return; }
  if (window.GXH) try { GXH.hide(); } catch (e) { }
  const delay = showEvents(s);
  save(); render();
  UI.busy = true; setTimeout(() => { UI.busy = false; after(); }, UI.fast ? 0 : Math.min(delay, 900));
}
function after() {
  if (!G) return; render();
  if (G.phase === 'over') { clearSave(); setTimeout(showResult, UI.fast ? 0 : 900); return; }
  const s = VG.actor(G);
  if (!isHuman(s)) { schedule(); return; }
  if (s !== UI.view) { if (UI.humans.length > 1) showPass(s); else { UI.view = s; render(); } }
}
function aiDelay() { const b = typeof GX !== 'undefined' && GX.aiDelay ? GX.aiDelay(650) : 650; return UI.fast ? 0 : b; }
function schedule() {
  clearTimeout(schedule.t); if (!G || G.phase !== 'play') return; const s = VG.actor(G); if (isHuman(s)) return;
  schedule.t = setTimeout(aiStep, aiDelay());
}
function aiStep() {
  if (!G || G.phase !== 'play') return; const s = VG.actor(G); if (isHuman(s)) return;
  const m = (UI.mode === 'tutorial' && tutAI(s)) || VAI.choose(G, G.p[s].ai || 'normal');
  const r = m ? VG.apply(G, m) : { ok: false };
  if (!r.ok) { const ms = VG.moves(G); VG.apply(G, ms.find(x => x.t === 'pass') || ms[ms.length - 1]); }
  const d = showEvents(s); if (G.log.length && !d) toast(G.log[G.log.length - 1].t, 1600);
  save(); render();
  UI.busy = true; setTimeout(() => { UI.busy = false; after(); }, UI.fast ? 0 : Math.max(d, 200));
}
// ---------------------------------------------------------------- events: the discovery, the guardian, the boon
function showEvents(s) {
  let wait = 0; const ev = G.ev || [];
  ev.forEach(e => {
    if (e.k === 'discover') { const el = $(`.site[data-i="${e.site}"]`); wait = Math.max(wait, 1500); sfx.play('discover'); setTimeout(() => { const n = $(`.site[data-i="${e.site}"]`); if (n) n.classList.add('flip'); }, 30); toast((e.s === -2 ? G.rival.name : G.p[e.s].name) + ' discovers ' + V.SITE[e.tile].name + '!', 1800); }
    if (e.k === 'guardian') { wait = Math.max(wait, 2300); setTimeout(() => fxCard('guard', e.guard, V.GUARD[e.guard].name + ' wakes!', 'Overcome it for 5 points and a boon: ' + V.opText(V.GUARD[e.guard].boon) + '.'), 700); setTimeout(() => sfx.play('roar'), 700); }
    if (e.k === 'beat') { wait = Math.max(wait, 2000); sfx.play('win'); fxCard('guard', e.guard, 'Overcome!', G.p[e.s].name + ' tames ' + V.GUARD[e.guard].name + ': +5 points and a boon.', true); }
    if (e.k === 'idolfind') { sfx.play('coin'); }
    if (e.k === 'fear') { sfx.play('fear'); toast(G.log.filter(l => /Dread/.test(l.t)).slice(-1)[0].t, 2400); wait = Math.max(wait, 900); }
    if (e.k === 'round') { toast('Round ' + e.round + ' begins. The market shifts.', 2000); sfx.play('round'); wait = Math.max(wait, 1000); }
    if (e.k === 'gain' || e.k === 'dig' || e.k === 'buy') sfx.play('coin');
    if (e.k === 'research') sfx.play('step');
    if (e.k === 'rival') toast(G.log[G.log.length - 1].t, 1800);
  });
  return UI.fast ? 0 : wait;
}
function fxCard(kind, id, title, text, good) {
  if (UI.fast) return; const f = $('#fx'); f.hidden = false;
  f.innerHTML = `<div class="fxcard${good ? ' good' : ''}" data-help><div class="por" data-art="guard-${id}"><svg><use href="#s-guard"/></svg></div><b>${esc(title)}</b><span>${esc(text)}</span></div>`;
  if (typeof artApply === 'function') artApply(f);
  clearTimeout(fxCard.t); fxCard.t = setTimeout(() => { f.hidden = true; f.innerHTML = ''; }, 1700);
}
// ---------------------------------------------------------------- sound: small synth, silent until the first tap; muted from the Menu
const sfx = (() => {
  let ctx = null; const on = () => UI.prefs.sound !== false;
  const tone = (f, d, type, v, at) => { if (!ctx) return; const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + (at || 0); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(v || .08, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + d + .02); };
  const S = { tap: () => tone(520, .06, 'triangle', .05), coin: () => { tone(880, .08, 'square', .03); tone(1320, .1, 'square', .025, .06); }, step: () => { tone(440, .1, 'triangle', .06); tone(660, .12, 'triangle', .05, .08); },
    discover: () => { [392, 523, 659, 784].forEach((f, i) => tone(f, .25, 'triangle', .06, i * .09)); }, roar: () => { tone(90, .6, 'sawtooth', .09); tone(70, .7, 'sawtooth', .07, .1); },
    win: () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, .3, 'triangle', .07, i * .1)); }, fear: () => { tone(220, .4, 'sine', .07); tone(207, .5, 'sine', .06, .2); }, round: () => tone(330, .3, 'sine', .06) };
  return { unlock() { if (ctx || !on()) return; try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; } }, play(k) { if (!on() || UI.fast) return; try { this.unlock(); S[k] && S[k](); } catch (e) { } } };
})();
// ---------------------------------------------------------------- save / load
function save() { if (!G || UI.mode === 'tutorial' || UI.camp) return; try { localStorage.setItem(SAVEKEY, JSON.stringify({ G, mode: UI.mode, humans: UI.humans, view: UI.view })); if (window.GNS && GNS.saved) GNS.saved('vinegrave', true); } catch (e) { } }
function clearSave() { try { localStorage.removeItem(SAVEKEY); if (window.GNS && GNS.saved) GNS.saved('vinegrave', false); } catch (e) { } }
function hasSave() { try { return !!localStorage.getItem(SAVEKEY); } catch (e) { return false; } }
function loadSave() { try { const o = JSON.parse(localStorage.getItem(SAVEKEY)); if (!o || !o.G) return false; G = o.G; UI.mode = o.mode; UI.humans = o.humans; UI.view = o.view; UI.camp = null; enterGame(); return true; } catch (e) { return false; } }
