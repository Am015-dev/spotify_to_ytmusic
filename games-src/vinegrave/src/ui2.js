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
    if (x.guard) { const gd = V.GUARD[x.guard]; h += `<div class="fxcard" style="animation:none;padding:6px;display:inline-block"><div class="por" data-art="guard-${x.guard}" style="width:96px;height:96px"><svg><use href="#s-guard"/></svg></div></div><p><b>${esc(gd.name)}</b> guards it. Overcome: pay ${resHTML(gd.cost)} → 5 ${ic('star', 'points')} and a boon: ${esc(V.opText(gd.boon))}. Still here at round end? The explorer on it takes a Dread card.</p>`; }
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
    h += `<p class="sm">Or discard it to pay one ${ic(c.tr)} ${V.TNAME[c.tr]} of travel.${c.vp ? ' Worth ' + c.vp + (Math.abs(c.vp) === 1 ? ' point' : ' points') + ' at the end.' : ''}</p>`;
    h += `<p><button type="button" class="btn alt" data-a="cards" data-id="${id}">See it among all cards</button></p>`; if (c.t === 'item') h += '<p class="sm">Bought items go to the bottom of your deck.</p>'; if (c.t === 'art') h += '<p class="sm">Artifacts work at once when bought. Played later from your hand they cost 1 tablet.</p>';
    h += '</div></div>';
    L.forEach(m => { if (I.kind === 'row' && m.t === 'buy' && m.r === I.x) add(m, 'Buy it'); if (I.kind === 'hand' && m.t === 'play' && m.i === I.x) add(m, 'Play it' + (c.t === 'art' ? ' (1 tablet)' : '')); });
    if (q && q.h === 'buy' && I.kind === 'row') VG.moves(G).forEach(m => { if (m.v === I.x) add(m, 'Buy it ' + q.d.o + ' cheaper'); });
    if (!btns.length && myTurn() && !q) h += `<p class="sm">${I.kind === 'row' ? 'You cannot pay for it yet.' : c.t === 'fear' ? 'Dread does nothing when played: use it for travel.' : c.t === 'art' ? 'You need a tablet to play it.' : ''}</p>`;
  } else if (I.kind === 'track') {
    h += `<h3>Research track</h3><p class="sm">Your magnifier ${ic('up')} climbs first; your notebook may follow but never pass it, and never enters the temple. Each row costs what it shows and gives a bonus; the first magnifier to some rows takes an extra reward. The top row is the temple.</p><table class="sct"><tr><th>Row</th><th>Cost</th><th>Bonus</th><th>Pts</th></tr>`;
    for (let r = V.TOP; r >= 1; r--) h += `<tr><td>${r === V.TOP ? 'Temple' : r}${me.glass === r ? ' 🔍' : ''}${me.note === r ? ' 📓' : ''}</td><td>${resHTML(V.TRACK[r].cost)}</td><td>${resHTML(V.TRACK[r].bonus)}${V.FIRST[r] ? `<br><span class="sm">first: ${G.firstTaken && G.firstTaken[r] ? 'taken' : ''}</span>${G.firstTaken && G.firstTaken[r] ? '' : resHTML(V.FIRST[r])}` : ''}</td><td>${V.NOTE_VP[r]}/${V.GLASS_VP[r]}</td></tr>`;
    h += `</table><p class="sm">Points: notebook / magnifier (in the temple the magnifier scores ${V.TEMPLE_ARRIVE.join('/')} by order of arrival). At the temple you buy tiles: ${V.TEMPLE.map((t, k) => t.vp + ' pts for ' + V.resText(t.cost) + ' (' + G.temple[k] + ' left)').join('; ')}.</p>`;
    L.forEach(m => { if (m.t === 'res') add(m, m.k === 'g' ? 'Climb with the magnifier' : 'Climb with the notebook'); if (m.t === 'temple') add(m, 'Temple tile: ' + V.TEMPLE[m.k].vp + ' points'); });
  } else if (I.kind === 'guard') {
    const g = me.guards[I.x], gd = V.GUARD[g.id];
    h += `<h3>${esc(gd.name)}</h3><div class="irow"><div class="big"><div class="fxcard" style="animation:none;padding:6px"><div class="por" data-art="guard-${g.id}" style="width:100px;height:100px"><svg><use href="#s-guard"/></svg></div></div></div><div><p>Overcome: worth 5 points.</p><p>Boon (once, free): ${esc(V.opText(gd.boon))}.</p>${g.used ? '<p class="sm">Boon already used.</p>' : ''}</div></div>`;
    L.forEach(m => { if (m.t === 'boon' && m.k === I.x) add(m, 'Use the boon (free)'); });
  } else if (I.kind === 'idol') {
    const d = me.idols[I.x], id = V.IDOL[d.id];
    h += `<h3>${esc(id.name)}</h3><p>Worth ${V.IDOL_VP} points at the end, in a shrine or not. Set it in a shrine for a one-time boon now: it fills your next empty shrine slot, which then loses its ${V.IDOL_SLOT_VP[me.idols.filter(d => d.used).length] || 0} point(s). One idol per turn, ${V.SLOTS} shrine slots.</p>${d.used ? '<p class="sm">This idol is in a shrine.</p>' : ''}`;
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
  if (!G) return; const s = VG.actor(G), b = snapS(s), el0 = moveEl(m, s), from = el0 && el0.getBoundingClientRect(), html = el0 && el0.classList.contains('cd') ? el0.outerHTML : '', r = VG.apply(G, m);
  if (!r.ok) { toast('That move is not allowed now.'); render(); return; }
  if (window.GXH) try { GXH.hide(); } catch (e) { }
  const delay = showEvents(s);
  save(); render(); actFx(m, s, from, html, b);
  if (!UI.fast && m.t !== 'ans' && !m.free) $('#prompt').textContent = moveCaption(m, s);
  UI.busy = true; setTimeout(() => { UI.busy = false; after(); }, UI.fast ? 0 : Math.max(650, Math.min(delay, 1200)));
}
function after() {
  if (!G) return; render(); turnBanner(); if (typeof myTurn === 'function' && myTurn() && !$('#fx').hidden) fxHide();
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
  const m = (UI.mode === 'tutorial' && tutAI(s)) || VAI.choose(G, G.p[s].ai || 'normal') || VG.moves(G).find(x => x.t === 'pass'), g0 = G;
  const cap = m ? moveCaption(m, s) : '', el0 = m ? moveEl(m, s) : null;
  UI.busy = true;
  if (!UI.fast) { $('#docktitle').textContent = who(s) + '’s turn'; $('#prompt').textContent = cap; if (el0) el0.classList.add('aimark'); }
  turnWait(UI.fast ? 0 : 900, () => {   /* step 1: show what the rival is about to do (caption + its target pulses) */
    if (G !== g0 || G.phase !== 'play' || VG.actor(G) !== s) { UI.busy = false; return; }
    const b = snapS(s), from = el0 && el0.getBoundingClientRect(), html = el0 && el0.classList.contains('cd') ? el0.outerHTML : '';
    const r = m ? VG.apply(G, m) : { ok: false };
    if (!r.ok) { const ms = VG.moves(G); VG.apply(G, ms.find(x => x.t === 'pass') || ms[ms.length - 1]); }
    const d = showEvents(s); save(); render();
    if (!UI.fast) { $('#docktitle').textContent = who(s) + '’s turn'; $('#prompt').textContent = cap; actFx(m, s, from, html, b); }
    turnWait(UI.fast ? 0 : Math.max(d, 1000), () => { UI.busy = false; after(); });   /* step 2: the result stays readable before the next step */
  });
}
// ---------------------------------------------------------------- turn presentation (W378): banner, caption, target pulse, fly, score pop; tap to speed up
function who(s) { return s === -2 ? (G.rival ? G.rival.name : 'Rival') : G.p[s].name; }
function short(s) { const n = who(s); return n === 'You' ? 'You' : n.split(' ')[0]; }
function moveEl(m, s) {
  if (!m || !G) return null;
  if (m.s != null && (m.t === 'dig' || m.t === 'disc' || m.t === 'beat')) return $(`.site[data-i="${m.s}"]`);
  if (m.t === 'buy') return $(`#row .cd[data-r="${m.r}"]`);
  if (m.t === 'res' || m.t === 'temple') return $('#track');
  if (m.t === 'play' && s === UI.view) return $(`#hand .cd[data-i="${m.i}"]`);
  if (s >= 0) return $('#opp').children[s] || null;
  return null;
}
function moveCaption(m, s) {
  const n = short(s), you = n === 'You', v = (a, b) => you ? a : b, p = s >= 0 ? G.p[s] : null;
  switch (m.t) {
    case 'play': { const c = p && V.CARDS[p.hand[m.i]]; return c ? `${n} ${v('play', 'plays')} ${c.name}. ${c.t === 'fear' ? '' : c.text}` : `${n} ${v('play', 'plays')} a card.`; }
    case 'dig': return `${n} ${v('send', 'sends')} an explorer to ${siteName(G.sites[m.s])} to dig.`;
    case 'disc': return `${n} ${v('explore', 'explores')} a hidden ruin!`;
    case 'beat': return `${n} ${v('fight', 'fights')} the guardian at ${siteName(G.sites[m.s])}.`;
    case 'buy': return `${n} ${v('buy', 'buys')} ${V.CARDS[G.row[m.r]].name} from the market.`;
    case 'res': return `${n} ${v('climb', 'climbs')} the research track.`;
    case 'temple': return `${n} ${v('take', 'takes')} a temple tile.`;
    case 'pass': return `${n} ${v('pass', 'passes')}: done for this round.`;
    case 'boon': return `${n} ${v('use', 'uses')} a guardian boon.`;
    case 'idol': return `${n} ${v('set', 'sets')} an idol in a shrine.`;
    default: return `${n} ${v('make', 'makes')} a choice.`;
  }
}
function snapS(s) { if (!G || s < 0 || !G.p[s]) return null; const p = G.p[s]; return { res: Object.assign({}, p.res), sc: VG.score(G, s) }; }
const SC_WHY = { research: 'research', temple: 'temple tile', idols: 'idol', slots: 'shrine slot', guards: 'guardian', cards: 'card points', fear: 'Dread card' };
function diffText(s, b) {
  if (!b || !G || s < 0) return null; const a = snapS(s), res = [];
  V.RES.forEach(k => { const d = a.res[k] - b.res[k]; if (d) res.push((d > 0 ? '+' : '') + d + ' ' + V.RNAME[k] + (Math.abs(d) === 1 ? '' : 's')); });
  const dv = a.sc.total - b.sc.total, why = Object.keys(SC_WHY).filter(k => a.sc[k] !== b.sc[k]).map(k => SC_WHY[k]);
  return { vp: dv ? (dv > 0 ? '+' : '') + dv + (Math.abs(dv) === 1 ? ' point' : ' points') + (why.length ? ': ' + why.join(', ') : '') : '', res: res.slice(0, 3).join('  '), neg: dv < 0 };
}
function popAt(rect, t) {
  if (!rect || !t || (!t.vp && !t.res)) return; const e = document.createElement('div'); e.className = 'vpop' + (t.neg ? ' neg' : ''); e.setAttribute('aria-live', 'polite');
  e.innerHTML = (t.vp ? `<b>${esc(t.vp)}</b>` : '') + (t.res ? `<span>${esc(t.res)}</span>` : '');
  document.body.appendChild(e); const w = e.offsetWidth, x = Math.max(6, Math.min(innerWidth - w - 6, rect.left + rect.width / 2 - w / 2)), y = Math.max(60, Math.min(innerHeight - 70, rect.top + rect.height / 2 - 20));
  e.style.left = x + 'px'; e.style.top = y + 'px'; setTimeout(() => e.remove(), 1700);
}
function fly(from, html, to) {   /* a card glides from where it was to where it goes (380 ms) */
  if (!from || !html || !to || reducedMo()) return; const g = document.createElement('div'); g.className = 'flyc'; g.innerHTML = html; const c = g.firstElementChild; if (!c) return;
  g.style.cssText = `left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px`; c.style.width = '100%'; c.style.height = '100%'; c.classList.remove('glow', 'aimark'); document.body.appendChild(g);
  const dx = to.left + to.width / 2 - (from.left + from.width / 2), dy = to.top + to.height / 2 - (from.top + from.height / 2);
  try { g.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${dx}px,${dy}px) scale(.45)`, opacity: .2 }], { duration: 380, easing: 'cubic-bezier(.4,.1,.3,1)', fill: 'forwards' }); } catch (x) { }
  setTimeout(() => g.remove(), 420);
}
function reducedMo() { return document.documentElement.classList.contains('gx-reduce') || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
function actFx(m, s, from, html, b) {   /* after a move: animate it, then pop what it gave */
  if (UI.fast || !G || !m) return; const el = moveEl(m, s), tr = el && el.getBoundingClientRect();
  if (m.t === 'buy' || m.t === 'play') { const dest = s === UI.view && m.t === 'buy' ? $('#hand') : s === UI.view ? $('#map') : $('#opp').children[s]; fly(from, html, dest && dest.getBoundingClientRect()); }
  if (el && (m.t === 'dig' || m.t === 'disc' || m.t === 'beat' || m.t === 'res' || m.t === 'temple')) { el.classList.remove('landed'); void el.offsetWidth; el.classList.add('landed'); }
  const at = (m.t === 'play' || m.t === 'buy') ? (s === UI.view ? $('#myres') : $('#opp').children[s]) : el;
  setTimeout(() => popAt((at && at.getBoundingClientRect()) || tr || from, diffText(s, b)), 260);
}
function turnWait(ms, fn) { clearTimeout(turnWait.t); turnWait.fn = fn; turnWait.t = setTimeout(() => { turnWait.fn = null; fn(); }, ms); }
function speedUp() { if (!turnWait.fn || !G || myTurn()) return; const f = turnWait.fn; turnWait.fn = null; clearTimeout(turnWait.t); f(); }
document.addEventListener('pointerdown', e => { if (turnWait.fn && G && !myTurn() && !(e.target.closest && e.target.closest('.gx-drawer,.gx-scrim,#insp,.gx-bar,.gxt-top,.gxt-end'))) speedUp(); }, true);
function turnBanner() {
  if (!G || G.phase !== 'play' || UI.fast) return; const s = VG.actor(G); if (s === UI.bannerFor) return; UI.bannerFor = s; if (s === -1) return;
  const mine = isHuman(s), b = $('#tbanner'); if (!b) return;
  b.textContent = mine ? (UI.humans.length > 1 ? who(s) + ', your turn' : 'Your turn') : who(s) + '’s turn'; b.className = 'on' + (mine ? ' me' : '');
  clearTimeout(turnBanner.t); turnBanner.t = setTimeout(() => { b.className = ''; }, 1100);
}
// ---------------------------------------------------------------- events: the discovery, the guardian, the boon
function showEvents(s) {
  let wait = 0; const ev = G.ev || [];
  ev.forEach(e => {
    if (e.k === 'discover') { const el = $(`.site[data-i="${e.site}"]`); wait = Math.max(wait, 1500); sfx.play('discover'); setTimeout(() => { const n = $(`.site[data-i="${e.site}"]`); if (n) n.classList.add('flip'); }, 30); const who = e.s === -2 ? G.rival.name : G.p[e.s].name; setTimeout(() => { const n = $(`.site[data-i="${e.site}"]`); if (n) n.classList.add('burst'); }, 60); toast(who + (who === 'You' ? ' discover ' : ' discovers ') + V.SITE[e.tile].name + '!', 1800); }
    if (e.k === 'guardian') { wait = Math.max(wait, 2700); setTimeout(() => { fxCard('guard', e.guard, V.GUARD[e.guard].name + ' wakes!', 'Overcome it for 5 points and a boon: ' + V.opText(V.GUARD[e.guard].boon) + '.'); shake(); }, 600); setTimeout(() => sfx.play('roar'), 600); }
    if (e.k === 'beat') { wait = Math.max(wait, 2300); sfx.play('win'); const w = G.p[e.s].name; fxCard('guard', e.guard, 'Overcome!', w + (w === 'You' ? ' tame ' : ' tames ') + V.GUARD[e.guard].name + ': +5 points and a boon.', true); }
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
  if (UI.fast) return; const f = $('#fx'); f.hidden = false; f.className = good ? 'good' : 'bad';
  f.innerHTML = `<div class="fxcard${good ? ' good' : ''}" data-help><div class="rays" aria-hidden="true"></div><div class="por" data-art="guard-${id}"><svg><use href="#s-guard"/></svg></div><b>${esc(title)}</b><span>${esc(text)}</span><small class="sm">Tap to close</small></div>`;
  if (typeof artApply === 'function') artApply(f);
  f.onclick = fxHide; clearTimeout(fxCard.t); fxCard.t = setTimeout(fxHide, 1800);   /* gone before the next turn starts (R3 bug 4); a tap closes it sooner */
}
function fxHide() { const f = $('#fx'); if (!f) return; clearTimeout(fxCard.t); f.hidden = true; f.innerHTML = ''; f.className = ''; }
function shake() { const b = $('#bd'); if (!b || document.documentElement.classList.contains('gx-reduce')) return; b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 600); }
// ---------------------------------------------------------------- sound: small synth, silent until the first tap; muted from the Menu
const sfx = (() => {
  let ctx = null; const on = () => UI.prefs.sound !== false;
  const tone = (f, d, type, v, at) => { if (!ctx) return; const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + (at || 0); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(v || .08, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + d + .02); };
  const S = { tap: () => tone(520, .06, 'triangle', .05), coin: () => { tone(880, .08, 'square', .03); tone(1320, .1, 'square', .025, .06); }, step: () => { tone(440, .1, 'triangle', .06); tone(660, .12, 'triangle', .05, .08); },
    discover: () => { [392, 523, 659, 784].forEach((f, i) => tone(f, .25, 'triangle', .06, i * .09)); }, roar: () => { tone(90, .6, 'sawtooth', .09); tone(70, .7, 'sawtooth', .07, .1); tone(140, .35, 'square', .04, .05); tone(55, .9, 'sawtooth', .06, .25); },
    win: () => { [523, 659, 784, 1046].forEach((f, i) => tone(f, .3, 'triangle', .07, i * .1)); }, fear: () => { tone(220, .4, 'sine', .07); tone(207, .5, 'sine', .06, .2); }, round: () => tone(330, .3, 'sine', .06) };
  return { unlock() { if (ctx || !on()) return; try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; } }, play(k) { if (!on() || UI.fast) return; try { this.unlock(); S[k] && S[k](); } catch (e) { } } };
})();
// ---------------------------------------------------------------- save / load
function save() { if (!G || UI.mode === 'tutorial' || UI.camp) return; try { localStorage.setItem(SAVEKEY, JSON.stringify({ G, mode: UI.mode, humans: UI.humans, view: UI.view })); if (window.GNS && GNS.saved) GNS.saved('vinegrave', true); } catch (e) { } }
function clearSave() { try { localStorage.removeItem(SAVEKEY); if (window.GNS && GNS.saved) GNS.saved('vinegrave', false); } catch (e) { } }
function hasSave() { try { return !!localStorage.getItem(SAVEKEY); } catch (e) { return false; } }
function loadSave() { try { const o = JSON.parse(localStorage.getItem(SAVEKEY)); if (!o || !o.G) return false; G = o.G; UI.mode = o.mode; UI.humans = o.humans; UI.view = o.view; UI.camp = null; enterGame(); return true; } catch (e) { return false; } }
