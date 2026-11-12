// ===================== part 2: details sheet, input (tap, tap again, drag), moves, computer turns, effects, sound, save =====================
function openInsp(kind, x) { UI.insp = { kind, x }; refreshInsp(); $('#insp').hidden = false; $('#iscrim').hidden = false; }
function closeInsp() { UI.insp = null; $('#insp').hidden = true; $('#iscrim').hidden = true; }
function refreshInsp() {
  const I = UI.insp; if (!I || !G) return closeInsp(); const L = legal(), q = G.q && myTurn() ? G.q : null, me = G.p[UI.view]; let h = '';
  const btns = []; const add = (m, label, cls) => { const pv = previewText(m); btns.push(mvBtn(m, label + (pv ? `<span class="pv">${esc(pv)}</span>` : ''), cls || 'go')); };
  if (I.kind === 'site') {
    const x = G.sites[I.x], hid = !x.tile;
    h += `<h3>${esc(siteName(x))}</h3><div class="irow"><div class="big"><div class="site l${x.lvl}${hid ? ' hid' : ''}"><span class="pic" data-art="${hid ? 'site-hidden-' + x.lvl : 'site-' + x.tile}"></span></div></div><div>`;
    h += `<p>Travel: ${x.cost.map(t => ic(t) + ' ' + V.TNAME[t]).join(' + ')}. Each card pays one icon.</p>`;
    h += hid ? `<p>Explore: pay ${V.DISC[x.lvl]} compasses and the travel.</p><p>You find an idol and loot. A guardian wakes.</p>` : `<p>Dig: get ${resWords(V.SITE[x.tile].rew)}.</p>`;
    if (x.occ !== -1) h += `<p>${esc(who(x.occ))} is here this round.</p>`;
    if (x.guard) { const gd = V.GUARD[x.guard]; h += `<div class="gport" data-art="guard-${x.guard}"><svg><use href="#s-guard"/></svg></div><p><b>${esc(gd.name)}</b> guards it.</p><p>Fight it: pay ${resWords(gd.cost)}. Win 5 points and a boon.</p><p>Boon: ${esc(V.opText(gd.boon))}.</p><p>Still here at round end? Take a Dread card.</p>`; }
    h += '</div></div>';
    L.forEach(m => { if (m.s !== I.x) return; if (m.t === 'dig') add(m, 'Dig here'); if (m.t === 'disc') add(m, 'Explore it'); if (m.t === 'beat') add(m, 'Fight the guardian'); });
    if (q && q.h === 'site') VG.moves(G).forEach(m => { if (m.v === I.x) add(m, 'Dig here for free'); });
    if (!btns.length && myTurn() && !q) h += `<p class="sm">${whyNotSite(x)}</p>`;
  } else if (I.kind === 'row' || I.kind === 'hand') {
    const id = I.kind === 'row' ? G.row[I.x] : me.hand[I.x]; if (!id) return closeInsp(); const c = V.CARDS[id];
    h += `<h3>${esc(c.name)}</h3><div class="irow"><div class="big">${cardHTML(id, {})}</div><div><p><b>${c.t === 'item' ? 'Item' : c.t === 'art' ? 'Artifact' : c.t === 'fear' ? 'Dread' : 'Starting card'}</b>${c.t === 'item' ? ': costs ' + c.cost + ' ' + rw('coin', c.cost) : c.t === 'art' ? ': costs ' + c.cost + ' ' + rw('compass', c.cost) : ''}.</p><p>${esc(c.t === 'fear' ? 'It does nothing. It costs 1 point.' : c.text)}</p>`;
    h += `<p class="sm">Or use it to pay one ${V.TNAME[c.tr]} of travel.</p>${c.vp ? `<p class="sm">Worth ${c.vp} ${Math.abs(c.vp) === 1 ? 'point' : 'points'} at the end.</p>` : ''}`;
    if (c.t === 'item') h += '<p class="sm">Bought items go under your deck.</p>'; if (c.t === 'art') h += '<p class="sm">Artifacts work at once when bought.</p><p class="sm">Played from your hand, they cost 1 tablet.</p>';
    h += `<p><button type="button" class="btn alt" data-a="cards" data-id="${id}">See all cards</button></p></div></div>`;
    L.forEach(m => { if (I.kind === 'row' && m.t === 'buy' && m.r === I.x) add(m, 'Buy it'); if (I.kind === 'hand' && m.t === 'play' && m.i === I.x) add(m, 'Play it' + (c.t === 'art' ? ' (1 tablet)' : '')); });
    if (q && q.h === 'buy' && I.kind === 'row') VG.moves(G).forEach(m => { if (m.v === I.x) add(m, 'Buy it ' + q.d.o + ' cheaper'); });
  } else if (I.kind === 'track') {
    h += `<h3>Research track</h3><p>Your magnifier climbs first. Your notebook follows, never past it.</p><p>Each row costs what it shows and gives a bonus.</p><p>The top row is the temple. There you buy temple tiles.</p><table class="sct"><tr><th>Row</th><th>Cost</th><th>Bonus</th><th>Points</th></tr>`;
    for (let r = V.TOP; r >= 1; r--) h += `<tr><td>${r === V.TOP ? 'Temple' : r}${me.glass === r ? ' (you)' : ''}</td><td>${resHTML(V.TRACK[r].cost)}</td><td>${resHTML(V.TRACK[r].bonus)}${V.FIRST[r] && !(G.firstTaken && G.firstTaken[r]) ? ' <span class="sm">first: </span>' + resHTML(V.FIRST[r]) : ''}</td><td>${V.GLASS_VP[r]}</td></tr>`;
    h += `</table><p class="sm">Points shown are for the magnifier.</p><p class="sm">Temple tiles left:</p>${V.TEMPLE.map((t, k) => `<p class="sm">${t.vp} points: ${G.temple[k]} left</p>`).join('')}`;
    L.forEach(m => { if (m.t === 'res' || m.t === 'temple') add(m, esc(trackLine(m))); });
  } else if (I.kind === 'guard') {
    const g = me.guards[I.x], gd = V.GUARD[g.id];
    h += `<h3>${esc(gd.name)}</h3><div class="gport" data-art="guard-${g.id}"><svg><use href="#s-guard"/></svg></div><p>Beaten: worth 5 points.</p><p>Boon (once, free): ${esc(V.opText(gd.boon))}.</p>${g.used ? '<p class="sm">Boon already used.</p>' : ''}`;
    L.forEach(m => { if (m.t === 'boon' && m.k === I.x) add(m, 'Use the boon (free)'); });
  } else if (I.kind === 'asst') {
    const a = me.asst[I.x]; if (!a) return closeInsp(); const d = V.ASSTBY[a.id];
    h += `<h3>${esc(d.name)}${a.gold ? ' (gold)' : ''}</h3><p>Once a round${d.main ? ' (uses your action)' : ', free'}: ${esc(V.opText(a.gold ? d.gd : d.s))}.</p>${a.gold ? '' : `<p class="sm">Gold side: ${esc(V.opText(d.gd))}.</p>`}<p class="sm">Your notebook on row ${V.ASST_UP.join(' or ')} turns one gold.</p>${a.ex ? '<p class="sm">Resting: ready again next round.</p>' : ''}`;
    L.forEach(m => { if (m.t === 'asst' && m.k === I.x) add(m, d.main ? 'Use it (your action)' : 'Use it (free)'); });
    if (!a.ex && !L.some(m => m.t === 'asst' && m.k === I.x) && myTurn()) h += '<p class="sm">You cannot pay its cost yet.</p>';
  } else if (I.kind === 'idol') {
    const d = me.idols[I.x], id = V.IDOL[d.id];
    h += `<h3>${esc(id.name)}</h3><p>Worth ${V.IDOL_VP} points at the end.</p><p>Set it in a shrine for a free boon now.</p><p class="sm">One idol a turn. Each empty shrine slot is worth points too.</p>${d.used ? '<p class="sm">This idol is in a shrine.</p>' : ''}`;
    L.forEach(m => { if (m.t === 'idol' && m.k === I.x) add(m, 'Shrine: ' + V.SHRINE[m.sh].text, ''); });
  }
  $('#insp').innerHTML = `<button type="button" class="ix" data-a="ix" aria-label="Close">×</button>` + h + (btns.length ? `<div class="ibtns">${btns.join('')}</div>` : '');
  if (typeof artApply === 'function') artApply($('#insp'));
}
function whyNotSite(x) {
  const me = G.p[UI.view];
  if (x.occ !== -1) return 'Someone is already here.';
  if (!me.ex) return 'Both explorers are already out.';
  if (!x.tile && me.res.compass < V.DISC[x.lvl]) return 'You need ' + V.DISC[x.lvl] + ' compasses to explore.';
  return 'You cannot pay this travel. 2 coins buy a Plane.';
}
// ---------------------------------------------------------------- input: tap selects (it lifts, the line says what it does), tap again does it; or drag it
function act(m) { if (!m) return; if (!tutAct({ what: 'mv', m })) return; UI.sel = null; try { navigator.vibrate && navigator.vibrate(12); } catch (x) { } closeInsp(); doMove(m); }
function pick(k, x, id) {
  if (!G) return;
  if (k === 'guard' || k === 'idol' || k === 'asst') { if (!tutAct({ what: k, x })) return; sfx.play('tap'); openInsp(k, x); return; }
  const ms = movesFor(k, x), S = UI.sel;
  if (G.q && ms.length) { act(ms[0]); return; }   /* answering a question: one tap */
  if (k === 'site' && S && S.k === 'pawn') { const m = ms.find(z => z.t === 'dig' || z.t === 'disc'); if (m) { act(m); return; } }
  const same = S && S.k === k && (k === 'track' || S.x === x);
  if (same && ms.length === 1) { act(ms[0]); return; }
  if (same && k === 'pawn') { UI.sel = null; render(); return; }
  if (!tutAct({ what: k, x, id })) return;
  sfx.play('tap'); UI.sel = { k, x, at: G.turns + ':' + G.round + ':' + G.p[UI.view].hand.length }; render();
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-a]'); if (!t) return; const a = t.dataset.a;
  sfx.unlock();
  if (a === 'ix') { closeInsp(); return; }
  if (a === 'mv') { const m = UI.mv[+t.dataset.m]; if (m) act(m); return; }
  if (a === 'details') { const S = UI.sel; if (S) { openInsp(S.k, S.x); } return; }
  if (a === 'site' || a === 'row' || a === 'hand' || a === 'track' || a === 'guard' || a === 'idol' || a === 'asst' || a === 'pawn') {
    const x = a === 'site' || a === 'hand' ? +t.dataset.i : a === 'row' ? +t.dataset.r : +t.dataset.k; pick(a, x, t.dataset.id); return;
  }
  if (UIACT[a]) UIACT[a](t, e);
});
/* drag: a hand card up onto the island plays it; an explorer onto a glowing site goes there; a market card down to your tray buys it */
const DR = { src: null, on: false, sup: 0 };
function dragKind(el) { if (!el || !myTurn() || G.q || UI.busy) return null; if (typeof GXT !== 'undefined' && GXT.active() && !UI.coachFree) return null;
  if (el.matches('#hand .cd')) { const m = movesFor('hand', +el.dataset.i)[0]; return m ? { k: 'hand', m, targets: [$('#board')] } : null; }
  if (el.matches('.pawn.mine')) { const ms = movesFor('pawn'); return ms.length ? { k: 'pawn', ms, targets: ms.map(m => $(`.site[data-i="${m.s}"]`)).filter(Boolean) } : null; }
  if (el.matches('#row .cd')) { const m = movesFor('row', +el.dataset.r)[0]; return m ? { k: 'row', m, targets: [$('#dock')] } : null; }
  return null; }
function dropAt(x, y) { const D = DR.d; if (!D) return null; for (const t of D.targets) { const r = t.getBoundingClientRect(); if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return t; } return null; }
document.addEventListener('pointerdown', e => { const s = e.target.closest && e.target.closest('#hand .cd, .pawn.mine, #row .cd'); if (!s || e.button > 0) return; DR.src = s; DR.id = e.pointerId; DR.x0 = e.clientX; DR.y0 = e.clientY; DR.on = false; }, true);
document.addEventListener('pointermove', e => {
  if (!DR.src || e.pointerId !== DR.id) return; const dx = e.clientX - DR.x0, dy = e.clientY - DR.y0;
  if (!DR.on) { if (dx * dx + dy * dy < 100) return; DR.d = dragKind(DR.src); if (!DR.d) { DR.src = null; return; }
    DR.on = true; const r = DR.src.getBoundingClientRect(), g = DR.src.cloneNode(true); g.classList.add('dragghost'); g.classList.remove('glow', 'sel'); g.removeAttribute('data-a');
    g.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px`; document.body.appendChild(g); DR.g = g; DR.r = r; DR.src.classList.add('dragging');
    DR.d.targets.forEach(t => t.classList.add('dropok')); document.body.classList.add('vg-dragging'); }
  DR.g.style.transform = `translate(${dx}px,${dy}px) scale(1.08) rotate(${Math.max(-8, Math.min(8, dx / 20))}deg)`;
  const hit = dropAt(e.clientX, e.clientY); DR.d.targets.forEach(t => t.classList.toggle('drophover', t === hit));
  if (hit && hit !== DR.last) try { navigator.vibrate && navigator.vibrate(6); } catch (x) { } DR.last = hit;
}, true);
function dragEnd(e, cancel) {
  if (!DR.src) return; const was = DR.on, d = DR.d, src = DR.src; DR.src = null; DR.on = false; if (!was) return;
  DR.sup = Date.now(); const hit = cancel ? null : dropAt(e.clientX, e.clientY);
  d.targets.forEach(t => t.classList.remove('dropok', 'drophover')); document.body.classList.remove('vg-dragging'); src.classList.remove('dragging');
  const g = DR.g; DR.g = null;
  if (hit) { try { navigator.vibrate && navigator.vibrate(18); } catch (x) { } g.remove(); sfx.play('tap');
    const m = d.k === 'pawn' ? d.ms.find(z => $(`.site[data-i="${z.s}"]`) === hit) : d.m; UI.dropFrom = g.getBoundingClientRect ? { left: e.clientX - DR.r.width / 2, top: e.clientY - DR.r.height / 2, width: DR.r.width, height: DR.r.height } : null; act(m); UI.dropFrom = null; }
  else { try { g.animate([{ transform: g.style.transform }, { transform: 'none' }], { duration: 220, easing: 'ease-out' }); } catch (x) { } setTimeout(() => g.remove(), 230); }
}
document.addEventListener('pointerup', e => { if (e.pointerId === DR.id) dragEnd(e, false); }, true);
document.addEventListener('pointercancel', e => { if (e.pointerId === DR.id) dragEnd(e, true); }, true);
document.addEventListener('click', e => { if (Date.now() - DR.sup < 450) { e.stopPropagation(); e.preventDefault(); } }, true);
$('#iscrim').addEventListener('click', () => { if (typeof GXT !== 'undefined' && GXT.active() && !UI.coachFree) return; closeInsp(); });
document.addEventListener('keydown', e => { if (e.key !== 'Escape') return; if (UI.insp) closeInsp(); else if (UI.sel) { UI.sel = null; render(); } });
/* a tap on empty board drops the selection */
document.addEventListener('click', e => { if (!UI.sel || !G) return; if (e.target.closest('[data-a],#dock,.gx-bar,#insp,.gx-drawer,.gxt-cell,.gxt-bub')) return; if (e.target.closest('#board')) { UI.sel = null; render(); } });
const UIACT = {};
UIACT.hints = () => { UI.prefs.hints = !UI.prefs.hints; savePrefs(); if (window.GXH) try { GXH.setEnabled(hintsOn()); if (!hintsOn()) GXH.hide(); } catch (e) { } render(); };
function tutAct(x) { if (typeof GXT === 'undefined' || !GXT.active() || UI.mode !== 'tutorial') return true; if (UI.coachFree) return true;   /* coached game: every legal move is allowed */ return GXT.act(Object.assign({ type: 'tap' }, x)); }
// ---------------------------------------------------------------- moves and the computer
function doMove(m) {
  if (!G) return; const best = UI.mode === 'tutorial' && typeof coachOn === 'function' && coachOn() && !m.free && m.t !== 'ans' ? VAI.choose(G, 'hard') : null;
  const s = VG.actor(G), b = snapS(s), F = fxBefore(m, s), sc0 = s >= 0 ? VG.score(G, s).total : 0, r = VG.apply(G, m);
  if (!r.ok) { render(); return; }
  if (window.GXH) try { GXH.hide(); } catch (e) { }
  const delay = showEvents(s);
  save(); render(); actFx(m, s, F, b); if (best) coachMove(m, best);
  const dp = s >= 0 ? VG.score(G, s).total - sc0 : 0;   /* say where points come from, so a rival's jump is never a mystery */
  if (!UI.fast && m.t !== 'ans' && (!m.free || dp)) $('#prompt').textContent = moveCaption(m, s) + (dp > 0 ? ` +${dp} ${dp === 1 ? 'point' : 'points'}.` : dp < 0 ? ` ${dp} ${dp === -1 ? 'point' : 'points'}.` : '');
  UI.busy = true; setTimeout(() => { UI.busy = false; after(); }, UI.fast ? 0 : Math.max(500, Math.min(delay, 800)));
}
function after() {
  if (!G) return; render();
  if (G.phase === 'over') { clearSave(); setTimeout(() => { try { if (typeof CO !== 'undefined') { CO.q.length = 0; coachHide(); } } catch (x) { } showResult(); if (UI.mode === 'tutorial' && typeof coachScoreStart === 'function') try { coachScoreStart(); } catch (x) { console.warn(x); } }, UI.fast ? 0 : 900); return; }
  const s = VG.actor(G);
  if (!isHuman(s)) { schedule(); return; }
  UI.rivalT0 = 0; UI.quick = false;
  if (s !== UI.view) { if (UI.humans.length > 1) showPass(s); else { UI.view = s; render(); } }
}
function aiDelay() { const b = typeof GX !== 'undefined' && GX.aiDelay ? GX.aiDelay(650) : 650; return UI.fast ? 0 : UI.quick ? 150 : b; }
function schedule() {
  clearTimeout(schedule.t); if (!G || G.phase !== 'play') return; const s = VG.actor(G); if (isHuman(s)) return;
  schedule.t = setTimeout(aiStep, aiDelay());
}
function finishSolo() {   /* the rest of the rivals' round at once; one line says how many moves they made */
  const r0 = G.round; let n = 0;
  while (G.phase === 'play' && !isHuman(VG.actor(G)) && n < 400) { const s = VG.actor(G), m = VAI.choose(G, G.p[s].ai || 'normal'); const r = m ? VG.apply(G, m) : { ok: false }; if (!r.ok) { const ms = VG.moves(G); VG.apply(G, ms.find(x => x.t === 'pass') || ms[ms.length - 1]); } n++; }
  UI.quick = false; G.ev = []; save(); UI.busy = false; rivalCap(''); fxHide();
  if (n) toast((G.p.length > 2 ? 'The rivals' : G.p[1].name) + (G.round !== r0 || G.phase !== 'play' ? ' finished the round.' : ' played ' + n + ' more ' + (n > 1 ? 'moves.' : 'move.')), 1400);
  after();
}
function aiStep() {
  if (!G || G.phase !== 'play') return; const s = VG.actor(G); if (isHuman(s)) return;
  if (!UI.rivalT0) UI.rivalT0 = Date.now();   /* the wait budget counts from the end of the human's move, guardian card included */
  if (!$('#fx').hidden) { schedule.t = setTimeout(aiStep, 200); return; }   /* the guardian card is still up: wait for it */
  /* every human has passed: the rivals finish the round briskly; after 3 s the rest happens at once (no wait over 4 s) */
  /* wait budget (R20: no wait over 4 s): a rival run starts brisk; after 1.2 s (or once every human passed) steps are quick; after 2.4 s the rest of the run happens at once */
  const solo = !UI.fast && UI.mode !== 'tutorial' && G.p.every(p => p.ai || p.passed);
  if (!UI.rivalT0) UI.rivalT0 = Date.now(); const el = Date.now() - UI.rivalT0;
  UI.quick = !UI.fast && UI.mode !== 'tutorial' && (solo || el > 1200);
  if (UI.quick && el > 2400) { finishSolo(); return; }
  const m = (UI.mode === 'tutorial' && tutAI(s)) || VAI.choose(G, G.p[s].ai || 'normal') || VG.moves(G).find(x => x.t === 'pass'), g0 = G;
  const cap = m ? moveCaption(m, s) : '', el0 = m ? moveEl(m, s) : null;
  UI.busy = true;
  if (!UI.fast) { $('#prompt').textContent = cap; $('#pacts').innerHTML = ''; if (el0) el0.classList.add('aimark'); rivalCap(cap); }
  turnWait(UI.fast ? 0 : UI.quick ? 260 : 600, () => {   /* step 1: show what the rival is about to do (caption + its target pulses) */
    if (G !== g0 || G.phase !== 'play' || VG.actor(G) !== s) { UI.busy = false; return; }
    const b = snapS(s), F = m ? fxBefore(m, s) : {};
    const r = m ? VG.apply(G, m) : { ok: false };
    if (!r.ok) { const ms = VG.moves(G); VG.apply(G, ms.find(x => x.t === 'pass') || ms[ms.length - 1]); }
    const d = showEvents(s); save(); render(); if (typeof coachRival === 'function') coachRival(m);
    if (!UI.fast) { $('#prompt').textContent = cap; actFx(m, s, F, b); }
    turnWait(UI.fast ? 0 : UI.quick ? 420 : Math.min(Math.max(d, 1000), 1500), () => { UI.busy = false; rivalCap(''); after(); });   /* step 2: the result stays readable before the next step */
  });
}
// ---------------------------------------------------------------- turn presentation: caption, target pulse, pieces fly, score pop; tap to speed up
function who(s) { return s === -2 ? (G.rival ? G.rival.name : 'Rival') : G.p[s].name; }
function short(s) { const n = who(s); return n === 'You' ? 'You' : n.split(' ')[0] === 'Dr' ? n.split(' ')[1] : n.split(' ')[0]; }
function chipOf(s) { if (!G) return null; const i = s === -2 ? G.p.length : s; return $('#opp').children[i] || null; }
function moveEl(m, s) {
  if (!m || !G) return null;
  if (m.s != null && (m.t === 'dig' || m.t === 'disc' || m.t === 'beat')) return $(`.site[data-i="${m.s}"]`);
  if (m.t === 'buy') return $(`#row .cd[data-r="${m.r}"]`);
  if (m.t === 'res' || m.t === 'temple') return $('#track');
  if (m.t === 'play' && s === UI.view) return $(`#hand .cd[data-i="${m.i}"]`);
  return chipOf(s);
}
function moveCaption(m, s) {
  const n = short(s), you = n === 'You', v = (a, b) => you ? a : b, p = s >= 0 ? G.p[s] : null;
  switch (m.t) {
    case 'play': { const c = p && V.CARDS[p.hand[m.i]]; return c ? `${n} ${v('play', 'plays')} ${c.name}.` : `${n} ${v('play', 'plays')} a card.`; }
    case 'dig': return `${n} ${v('send', 'sends')} an explorer to ${siteName(G.sites[m.s])}.`;
    case 'disc': return `${n} ${v('explore', 'explores')} a hidden ruin!`;
    case 'beat': return `${n} ${v('fight', 'fights')} the guardian!`;
    case 'buy': return `${n} ${v('buy', 'buys')} ${V.CARDS[G.row[m.r]].name}.`;
    case 'res': return `${n} ${v('climb', 'climbs')} the research track.`;
    case 'temple': return `${n} ${v('buy', 'buys')} a temple tile.`;
    case 'pass': return `${n} ${v('pass', 'passes')} for this round.`;
    case 'boon': return `${n} ${v('use', 'uses')} a guardian boon.`;
    case 'idol': return `${n} ${v('set', 'sets')} an idol in a shrine.`;
    case 'asst': { const a = p && p.asst[m.k]; return `${n} ${v('use', 'uses')} ${a ? 'the ' + V.ASSTBY[a.id].name : 'an assistant'}.`; }
    default: return `${n} ${v('choose', 'chooses')}.`;
  }
}
function snapS(s) { if (!G || s < 0 || !G.p[s]) return null; const p = G.p[s]; return { res: Object.assign({}, p.res), sc: VG.score(G, s) }; }
const SC_WHY = { research: 'research', temple: 'temple tile', idols: 'idol', slots: 'shrine slot', guards: 'guardian', cards: 'card points', fear: 'Dread card' };
function diffText(s, b) {
  if (!b || !G || s < 0) return null; const a = snapS(s), res = [];
  V.RES.forEach(k => { const d = a.res[k] - b.res[k]; if (d) res.push((d > 0 ? '+' : '') + d + ' ' + rw(k, Math.abs(d))); });
  const dv = a.sc.total - b.sc.total;
  return { vp: dv ? (dv > 0 ? '+' : '') + dv + (Math.abs(dv) === 1 ? ' point' : ' points') : '', res: res.slice(0, 3).join('  '), neg: dv < 0 };
}
function popAt(rect, t, n) {
  if (!rect || !t || (!t.vp && !t.res)) return;
  { const fx = document.getElementById('fx'); if (fx && !fx.hidden && (n || 0) < 12) { setTimeout(() => popAt(rect, t, (n || 0) + 1), 450); return; } }   /* never stack pills on the guardian card: they wait until it closes */
  const e = document.createElement('div'); e.className = 'vpop' + (t.neg ? ' neg' : '') + (t.chip ? ' onchip' : ''); e.setAttribute('aria-hidden', 'true');
  e.innerHTML = (t.vp ? `<b>${esc(t.vp)}</b>` : '') + (t.res ? `<span>${esc(t.res)}</span>` : '');
  document.body.appendChild(e); const w = e.offsetWidth, x = Math.max(6, Math.min(innerWidth - w - 6, rect.left + rect.width / 2 - w / 2)), y = t.chip ? Math.max(2, rect.top + rect.height / 2 - e.offsetHeight / 2) : Math.max(60, Math.min(innerHeight - 70, rect.top + rect.height / 2 - 20));
  e.style.left = x + 'px'; e.style.top = y + 'px'; setTimeout(() => e.remove(), 1700);
}
function fly(from, html, to, o) {   /* a piece glides from where it was to where it goes */
  if (!from || !html || !to || reducedMo() || UI.fast) return; o = o || {}; const g = document.createElement('div'); g.className = 'flyc'; g.innerHTML = html; const c = g.firstElementChild; if (!c) return;
  const w = o.w || from.width, h = o.h || from.height, fx = from.left + from.width / 2 - w / 2, fy = from.top + from.height / 2 - h / 2;
  g.style.cssText = `left:${fx}px;top:${fy}px;width:${w}px;height:${h}px`; c.style.width = '100%'; c.style.height = '100%'; c.classList && c.classList.remove('glow', 'aimark', 'sel'); document.body.appendChild(g);
  const dx = to.left + to.width / 2 - (fx + w / 2), dy = to.top + to.height / 2 - (fy + h / 2), dur = o.dur || 520;
  try { g.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${dx * .5}px,${dy * .5 - 40}px) scale(${o.mid || 1.1})`, opacity: 1, offset: .5 }, { transform: `translate(${dx}px,${dy}px) scale(${o.end || .5})`, opacity: o.fade === false ? 1 : .15 }], { duration: dur, easing: 'cubic-bezier(.4,.1,.3,1)', fill: 'forwards' }); } catch (x) { }
  setTimeout(() => g.remove(), dur + 40);
}
function reducedMo() { return document.documentElement.classList.contains('gx-reduce') || (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }
/* before a move: where its pieces start (an explorer, paying cards, a bought or played card) */
function fxBefore(m, s) {
  if (UI.fast || !G || !m) return {}; const F = {}, R = el => el && el.getBoundingClientRect();
  if (m.t === 'dig' || m.t === 'disc') { F.pawn = UI.dropFrom || (s === UI.view ? R($('#pawns .pawn.mine:last-of-type') || $('#pawns .pawn.mine')) : R(chipOf(s))); F.ps = s;
    if (s === UI.view) { const pl = VG.payPlan(G, s, G.sites[m.s].cost); if (pl) F.pay = pl.cards.map(i => { const e = $(`#hand .cd[data-i="${i}"]`); return e ? { r: R(e), html: e.outerHTML } : null; }).filter(Boolean); } }
  if (m.t === 'buy' || (m.t === 'play' && s === UI.view)) { const e = moveEl(m, s); if (e) F.card = { r: UI.dropFrom || R(e), html: e.outerHTML }; }
  if (m.t === 'play' && s !== UI.view && s >= 0 && G.p[s].hand[m.i] && chipOf(s)) F.card = { r: R(chipOf(s)), html: cardHTML(G.p[s].hand[m.i]), w: 64, h: 90 };
  if (s >= 0 && G.p[s]) F.pts = VG.score(G, s).total;
  return F;
}
function actFx(m, s, F, b) {   /* after a move: pieces fly to where they go, the place it lands bounces, then what it gave pops */
  if (UI.fast || !G || !m) return; F = F || {}; const el = moveEl(m, s), tr = el && el.getBoundingClientRect();
  if (F.pts != null) { const cb = chipOf(s) && chipOf(s).querySelector('.pts b'); if (cb && VG.score(G, s).total !== F.pts) cb.textContent = F.pts; }
  if (F.pawn && tr) walkTo(F.pawn, m.s, F.ps);
  (F.pay || []).forEach((p, k) => setTimeout(() => fly(p.r, p.html, tr, { end: .3 }), 80 + k * 90));
  if (F.card) { const dest = m.t === 'buy' ? (s === UI.view ? $('#hand') : chipOf(s)) : $('#map'); fly(F.card.r, F.card.html, dest && dest.getBoundingClientRect(), { end: m.t === 'play' ? 1.3 : .4, w: F.card.w, h: F.card.h, dur: m.t === 'play' && s !== UI.view ? 800 : 520 }); }
  if (el && (m.t === 'beat' || m.t === 'res' || m.t === 'temple' || ((m.t === 'dig' || m.t === 'disc') && !F.pawn))) { setTimeout(() => { const n = moveEl(m, s); if (n) { n.classList.remove('landed'); void n.offsetWidth; n.classList.add('landed'); } }, m.t === 'dig' || m.t === 'disc' ? 520 : 0); }
  const d = diffText(s, b), late = m.t === 'dig' || m.t === 'disc' ? 900 : 560;
  if (d) setTimeout(() => {
    if (d.res) { if (s === UI.view) gainFly(b, tr); else popUnder(chipOf(s), { res: d.res }); }
    if (d.vp) setTimeout(() => { popUnder(chipOf(s), { vp: d.vp, neg: d.neg }); tickPts(s, F.pts); }, d.res ? 450 : 0);
  }, late);
}
/* the explorer walks the trail: in at the camp edge, up through the nearest site of each lower level, onto its site */
function walkTo(from, si, ps) {
  if (!from || reducedMo() || UI.fast) return; const x = G.sites[si], tEl = $(`.site[data-i="${si}"]`), map = $('#map'); if (!tEl || !map) return;
  const c = e => { const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, mr = map.getBoundingClientRect(), T = c(tEl);
  const pts = [[from.left + from.width / 2, from.top + from.height / 2], [Math.max(mr.left + 20, Math.min(mr.right - 20, T[0])), mr.bottom - 8]];
  for (let lv = 0; lv < x.lvl; lv++) { let best = null, bd = 1e9; G.sites.forEach((y, i) => { if (y.lvl !== lv) return; const e = $(`.site[data-i="${i}"]`); if (!e) return; const p = c(e), dd = Math.abs(p[0] - T[0]); if (dd < bd) { bd = dd; best = p; } }); if (best) pts.push(best); }
  pts.push(T);
  const occ = tEl.querySelector('.occ'); if (occ) occ.style.opacity = '0';
  const g = document.createElement('div'); g.className = 'walker'; g.innerHTML = pawnSVG(ps); document.body.appendChild(g);
  const o = pts[0], frames = pts.map((p, k) => ({ transform: `translate(${p[0] - 20}px,${p[1] - 44}px) rotate(${k % 2 ? -6 : 6}deg)`, offset: k / (pts.length - 1) }));
  g.style.left = '0px'; g.style.top = '0px'; const dur = 380 + 230 * (pts.length - 1);
  try { g.animate(frames, { duration: dur, easing: 'ease-in-out', fill: 'forwards' }); } catch (e) { }
  setTimeout(() => { g.remove(); if (occ) occ.style.opacity = ''; const n = $(`.site[data-i="${si}"]`); if (n) { n.classList.remove('landed'); void n.offsetWidth; n.classList.add('landed'); } }, dur + 40);
}
/* your goods: each one flies from where you got it into its counter, and the counter bumps */
function gainFly(b, from) {
  if (!b) return; const a = snapS(UI.view), rcs = [...document.querySelectorAll('#myres .rc')];
  V.RES.forEach((k, j) => { const dlt = a.res[k] - b.res[k], rc = rcs[j]; if (!dlt || !rc) return;
    if (dlt > 0 && from) for (let n = 0; n < Math.min(dlt, 3); n++) setTimeout(() => fly(from, `<span class="rv">${ic(k)}</span>`, rc.getBoundingClientRect(), { w: 30, h: 30, end: .8, dur: 480 }), n * 110);
    setTimeout(() => { const r2 = document.querySelectorAll('#myres .rc')[j]; if (r2) { r2.classList.remove('bump'); void r2.offsetWidth; r2.classList.add('bump'); } }, 480 + Math.min(dlt, 3) * 110); });
}
/* a rival's pill on the board; your own on your chip */
function popUnder(chip, t) {
  if (!chip) return; const r = chip.getBoundingClientRect(), mp = $('#map');
  if (mp && chip !== chipOf(UI.view)) { const m = mp.getBoundingClientRect(); popAt({ left: r.left, width: r.width, top: m.top + 64, height: 0 }, t); return; }   /* a rival's pill sits on the board, never on the market */ popAt(r, Object.assign({ chip: true }, t));   /* your own pill pops ON your chip: never over the market or the research track (R25) */
}
/* the chip's points count up to the new total */
function tickPts(s, from) {
  const chip = chipOf(s), bEl = chip && chip.querySelector('.pts b'); if (!bEl || from == null) return; const to = VG.score(G, s).total; if (to === from) return;
  const t0 = performance.now(), dur = 600; bEl.classList.remove('tick'); void bEl.offsetWidth; bEl.classList.add('tick');
  const st = () => { const k = Math.min(1, (performance.now() - t0) / dur), e = chipOf(s), bb = e && e.querySelector('.pts b'); if (!bb) return; bb.textContent = Math.round(from + (to - from) * k); if (k < 1) requestAnimationFrame(st); };
  requestAnimationFrame(st);
}
/* the rival's move in one line on the board, where your eyes are */
function rivalCap(t) {
  let e = $('#rcap'); if (!e) { e = document.createElement('div'); e.id = 'rcap'; e.setAttribute('aria-hidden', 'true'); document.body.appendChild(e); }
  if (!t) { e.classList.remove('on'); return; } const m = $('#map'); e.style.top = ((m ? m.getBoundingClientRect().top : 120) + 6) + 'px'; e.textContent = t; e.classList.add('on');
}
function turnWait(ms, fn) { clearTimeout(turnWait.t); turnWait.fn = fn; turnWait.t = setTimeout(() => { turnWait.fn = null; fn(); }, ms); }
function speedUp() { if (!turnWait.fn || !G || myTurn()) return; const f = turnWait.fn; turnWait.fn = null; clearTimeout(turnWait.t); f(); }
document.addEventListener('pointerdown', e => { if (turnWait.fn && G && !myTurn() && !(e.target.closest && e.target.closest('.gx-drawer,.gx-scrim,#insp,.gx-bar,.gxt-top,.gxt-end,#fx'))) speedUp(); }, true);
function turnBanner() { }
// ---------------------------------------------------------------- events: the discovery, the guardian, the boon
function showEvents(s) {
  let wait = 0; const ev = G.ev || [];
  ev.forEach(e => {
    if (typeof coachEvent === 'function') coachEvent(e, s);
    if (e.k === 'discover') { const el = $(`.site[data-i="${e.site}"]`); wait = Math.max(wait, 1500); sfx.play('discover'); setTimeout(() => { const n = $(`.site[data-i="${e.site}"]`); if (n) n.classList.add('flip'); }, 30); const who = e.s === -2 ? G.rival.name : G.p[e.s].name; setTimeout(() => { const n = $(`.site[data-i="${e.site}"]`); if (n) n.classList.add('burst'); }, 60); note(who + (who === 'You' ? ' discover ' : ' discovers ') + V.SITE[e.tile].name + '!', 1800); }
    if (e.k === 'guardian') { wait = Math.max(wait, 2600); setTimeout(() => { fxCard('guard', e.guard, V.GUARD[e.guard].name + ' wakes!', ['Fight it for 5 points and a boon.', 'Still beside it at round end? Take a Dread card.']); shake(); }, 600); setTimeout(() => sfx.play('roar'), 600); }
    if (e.k === 'beat') { wait = Math.max(wait, 2600); sfx.play('win'); const w = G.p[e.s].name; fxCard('guard', e.guard, (w === 'You' ? 'You beat ' : short(e.s) + ' beats ') + V.GUARD[e.guard].name + '!', ['+5 points and a boon.', 'Boon: ' + V.opText(V.GUARD[e.guard].boon) + '.'], true); }
    if (e.k === 'idolfind') { sfx.play('coin'); }
    if (e.k === 'fear') { sfx.play('fear'); note(G.log.filter(l => /Dread/.test(l.t)).slice(-1)[0].t, 2400); wait = Math.max(wait, 900); }
    if (e.k === 'round') { note('Round ' + e.round + ' begins. The market shifts.', 2000); sfx.play('round'); wait = Math.max(wait, 1000); }
    if (e.k === 'gain' || e.k === 'dig' || e.k === 'buy') sfx.play('coin');
    if (e.k === 'research') sfx.play('step');
    if (e.k === 'rival') note(G.log[G.log.length - 1].t, 1800);
  });
  return UI.fast ? 0 : UI.quick ? Math.min(wait, 400) : wait;
}
function fxCard(kind, id, title, text, good) {
  if (UI.fast || UI.quick) return; const f = $('#fx'); f.hidden = false; f.className = good ? 'good' : 'bad';
  f.innerHTML = `<div class="fxcard${good ? ' good' : ''}" data-help><div class="rays" aria-hidden="true"></div><div class="por" data-art="guard-${id}"><svg><use href="#s-guard"/></svg></div><b>${esc(title)}</b>${[].concat(text).map(l => `<span>${esc(l)}</span>`).join('')}<small class="sm">Tap to close</small></div>`; try { coachHide(); } catch (e) { }
  if (typeof artApply === 'function') artApply(f);
  f.onclick = fxHide; clearTimeout(fxCard.t); fxCard.t = setTimeout(fxHide, Math.min(3000, readMs(title + ' ' + [].concat(text).join(' ')) + 800));   /* readable: 4 s + 1 s per 10 words; a tap closes it sooner */
  try { $('#toast').classList.remove('on'); } catch (e) { }   /* gone before the next turn starts (R3 bug 4); a tap closes it sooner */
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
// ---------------------------------------------------------------- W378c: see how you score (previews, best-value badges, turn rating, "Turn over: why")
function diffOn(c, s) {
  const a = c.p[s], b = G.p[s], res = [];
  V.RES.forEach(k => { const d = a.res[k] - b.res[k]; if (d) res.push((d > 0 ? '+' : '') + d + ' ' + V.RNAME[k] + (Math.abs(d) === 1 ? '' : 's')); });
  const sa = VG.score(c, s), sb = VG.score(G, s), vp = sa.total - sb.total, why = Object.keys(SC_WHY).filter(k => sa[k] !== sb[k]).map(k => SC_WHY[k]);
  const rs = (a.glass - b.glass) + (a.note - b.note);
  return { res, vp, why, rs };
}
function evalMoves() {   /* every main move you can make now, simulated on a copy: what it yields and how strong it is */
  if (!G || G.phase !== 'play' || !myTurn() || G.q) return [];
  const s = VG.actor(G), me = G.p[s], key = G.turns + ':' + G.round + ':' + JSON.stringify(me.res) + me.hand.join() + G.row.join() + me.ex;
  if (evalMoves.k === key) return evalMoves.v; const out = [];
  VG.moves(G).forEach(m => { if (m.free || m.t === 'pass' || m.t === 'ans') return; try { const c = VG.clone(G), r = VG.apply(c, m); if (!r || !r.ok) return; out.push({ m, v: VAI.value(c, s, 'hard'), d: diffOn(c, s) }); } catch (x) { } });
  out.sort((x, y) => y.v - x.v); evalMoves.k = key; evalMoves.v = out; return out;
}
const sameMv = (a, b) => !!a && !!b && (VG.same ? VG.same(a, b) : JSON.stringify(a) === JSON.stringify(b));
function previewText(m) {
  if (!hintsOn()) return ''; const e = evalMoves().find(x => sameMv(x.m, m)); if (!e) return '';
  const p = []; if (e.d.vp) p.push((e.d.vp > 0 ? '+' : '') + e.d.vp + (Math.abs(e.d.vp) === 1 ? ' point' : ' points') + (e.d.why.length ? ' (' + e.d.why.join(', ') + ')' : ''));
  if (e.d.rs > 0) p.push('+' + e.d.rs + ' research step' + (e.d.rs > 1 ? 's' : '')); p.push(...e.d.res.slice(0, 3));
  return p.length ? 'You get: ' + p.join(', ') : 'No goods now. It helps later turns.';
}
function shortLabel(m) {
  const me = G.p[UI.view];
  switch (m.t) { case 'play': return 'play ' + V.CARDS[me.hand[m.i]].name; case 'dig': return 'dig at ' + siteName(G.sites[m.s]); case 'disc': return 'explore a hidden ruin';
    case 'beat': return 'overcome the guardian'; case 'buy': return 'buy ' + V.CARDS[G.row[m.r]].name; case 'res': return 'climb the research track'; case 'temple': return 'buy a temple tile'; case 'asst': return 'use your assistant'; case 'boon': return 'use a boon'; case 'idol': return 'set an idol'; default: return m.t === 'ans' ? 'choose' : 'pass'; }
}
function bestBadges() {   /* gold badges: the strongest site and the strongest market card for you right now */
  document.querySelectorAll('[data-badge]').forEach(e => e.removeAttribute('data-badge'));
  if (!hintsOn()) return; const ev = evalMoves(); if (!ev.length) return;
  const top = ev[0], site = ev.find(x => x.m.s != null && /dig|disc|beat/.test(x.m.t)), buy = ev.find(x => x.m.t === 'buy');
  const mark = (x, t) => { if (!x) return; const el = moveEl(x.m, UI.view); if (el && !el.dataset.badge) el.dataset.badge = t; };
  mark(top, 'Best'); mark(site, 'Best site'); mark(buy, 'Best buy');
}
function rateMove(m, ev) {   /* good / okay / poor, compared with the strongest move */
  if (!ev || !ev.length) return null; const i = ev.findIndex(x => sameMv(x.m, m)), best = ev[0];
  if (i === 0) return { k: 'good', t: 'Good move: the best option this turn.' };
  const gap = i < 0 ? 99 : best.v - ev[i].v;
  return gap <= 2.5 || i === 1 ? { k: 'okay', t: 'Okay move. Slightly better: ' + shortLabel(best.m) + '.' } : { k: 'poor', t: 'Weak move. Much better was: ' + shortLabel(best.m) + '.' };
}
