// ===================== part 4: step cards (one at a time), guide tips, round score pad, final result =====================
function pushCard(c) { UI.cards.push(c); if (UI.cards.length === 1) drawCard(); }
function nextCard() { UI.cards.shift(); drawCard(); if (!UI.cards.length) { render(); schedule(); } }
function drawCard() {
  const pc = $('#pc'); if (!pc) return;
  const c = UI.cards[0];
  if (!c) { pc.hidden = true; pc.innerHTML = ''; pc.dataset.card = ''; return; }
  closePop(); pc.hidden = false; pc.innerHTML = ''; pc.dataset.card = c.kind;
  const bs = (c.buttons || [{ label: 'Got it', a: 'cont' }]).map(b => h('button.btn' + (b.cls ? '.' + b.cls : ''), { type: 'button', 'data-a': b.a }, b.label));
  pc.append(h('div.ph-head', h('div.ph-t', h('b', c.title), h('span', c.sub || '')), c.kind === 'pass' ? null : h('button.px', { 'data-a': 'cont', type: 'button', 'aria-label': 'Close' }, '×')), h('div.ph-body', c.body, h('div.cbtns', bs)));
  if (c.kind === 'pass') { try { const b = pc.querySelector('[data-a=take]'); if (b) b.focus({ preventScroll: true }); } catch (e) { } }
}
// ---- guide: no tip cards in any mode. The only nudge left is a ghost finger on the glowing Twin Sticks (ui8).
function coachTip(key) {
  UI.coach.seen[key] = 1; UI.coach.turn = G.round + '.' + G.turn;
  if (key === 'twinReady') UI.tip = { key, turn: UI.coach.turn };
  render();
}
function coachCheck() {
  return false;   // tips are the help kit's coach bubbles now (ui10)
  const lv = UI.coach.level; if (lv === 'off' || !G || G.phase !== 'pick') return false;
  const v = viewSeat(); if (v < 0 || !canPick() || UI.cards.length) return false;
  const turn = G.round + '.' + G.turn; if (UI.coach.turn === turn) return false;
  const seen = UI.coach.seen, p = G.players[v], c = KK.tableCounts(p.table);
  if (!seen.twinReady && c.chop && p.hand.length >= 2) { coachTip('twinReady'); return true; }
  return false;
}
// ---- round end: the count happens ON the trays. Each kind of set lights up on every tray, its points pop out of it and
// fly into the diner's score chip, which climbs. Tap the table to hurry. Then one big button. No tables, no sentences.
const winLine = () => {
  const ws = G.winners || [], v = viewSeat();
  if (ws.length > 1) return ws.indexOf(v) >= 0 ? 'A tie, and you share it!' : 'It is a tie!';
  return ws[0] === v ? 'You win!' : pname(ws[0]) + ' wins!';
};
const tw = ms => ANIM ? new Promise(r => setTimeout(r, ms * (UI.fast ? .25 : 1))) : Promise.resolve();
const seatBox = s => document.querySelector('#tbl .seat[data-seat="' + s + '"]');
const chipOf = s => { const b = seatBox(s); return b ? b.querySelector('.av .sc') : null; };
const ctrC = e => { if (!e) return null; const r = e.getBoundingClientRect(); return r.width || r.height ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : null; };
function tallyPop(txt, from, to, cls) {
  if (!ANIM || !document.body.animate || pxRM()) return Promise.resolve();
  const a = ctrC(from), b = ctrC(to); if (!a) return Promise.resolve();
  const el = h('div.tpop' + (cls ? '.' + cls : ''), txt); el.style.left = Math.round(a.x) + 'px'; el.style.top = Math.round(a.y) + 'px'; document.body.appendChild(el);
  const dx = b ? b.x - a.x : 0, dy = b ? b.y - a.y : -26, f = UI.fast ? .35 : 1;
  const an = el.animate([{ transform: 'translate(-50%,-50%) scale(.4)', opacity: 0 }, { transform: 'translate(-50%,-80%) scale(1.3)', opacity: 1, offset: .28 }, { transform: 'translate(-50%,-60%) scale(1.05)', opacity: 1, offset: .5 },
    { transform: 'translate(calc(-50% + ' + dx + 'px),calc(-50% + ' + dy + 'px)) scale(' + (b ? .55 : 1) + ')', opacity: b ? .95 : 0 }], { duration: 700 * f, easing: 'ease-in-out' });
  return new Promise(res => { const done = () => { el.remove(); res(); }; an.onfinish = done; an.oncancel = done; setTimeout(done, 1500); });
}
// one tray element per (seat, kind of pile); a seat whose pile is not drawn (small tray) falls back to its counter
function trayEl(s, k) { const b = seatBox(s); return b ? (b.querySelector('.grp[data-k="' + k + '"]') || b.querySelector('.ctr') || b) : null; }
const TSTEPS = ['maki', 'tempura', 'sashimi', 'dumpling', 'nigiri', 'wasabi'];
function tallyParts(s, step, val) {
  // -> [{k, v, z}] piles of seat s that score `val` in this step
  const b = seatBox(s); const have = k => !!(b && b.querySelector('.grp[data-k="' + k + '"]'));
  if (step === 'maki') return have('roll') ? [{ k: 'roll', v: val }] : [];
  if (step === 'tempura' || step === 'sashimi' || step === 'dumpling') return have(step) ? [{ k: step, v: val }] : [];
  const parts = []; let sum = 0;
  if (b) for (const g of b.querySelectorAll('.grp[data-k^="n-"],.grp[data-k^="pn-"]')) {
    const k = g.dataset.k, kk = k.replace(/^p?n-/, ''), on = k[0] === 'p', n = +g.dataset.n, base = NIG[kk] * n;
    if (step === 'nigiri') { parts.push({ k, v: base }); sum += base; } else if (on) { parts.push({ k, v: 2 * base }); sum += 2 * base; }
  }
  if (step === 'wasabi' && have('wasabi')) parts.push({ k: 'wasabi', v: 0, z: true });
  if (sum !== val) return val ? [{ k: parts.length ? parts[0].k : 'ctr', v: val }] : parts.filter(x => x.z);   // never lose a point: one pop for the seat
  return parts.filter(x => x.v || x.z);
}
async function runTally(sc, last, tok) {
  const np = G.np, F = UI.fz, flights = [];
  UI.news = null; UI.fast = false; F.tally = new Array(np).fill(0); F.msg = 'Counting round ' + sc.round; render();
  const ok = () => tok === UI.seq && UI.rsOpen && UI.fz === F;
  const bump = s => { const c = chipOf(s); if (!c) return; c.textContent = String(bankedOf(s) + F.tally[s]); if (ANIM && c.animate && !pxRM()) c.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.6)' }, { transform: 'scale(1)' }], { duration: 300 }); snd('coin', { vol: .45 }); };
  const give = (s, el, v, z) => {
    z = z || !v;
    if (el && el.classList) el.classList.add(z ? 'tl0' : 'tl');
    if (z) { flights.push(tallyPop('0', el, null, 'z')); return; }
    flights.push(tallyPop((v > 0 ? '+' : '−') + Math.abs(v), el, chipOf(s), v < 0 ? 'neg' : '').then(() => { if (!ok()) return; F.tally[s] += v; bump(s); }));
  };
  if (ANIM) { snd('round', { duck: true }); await tw(350); }
  for (const step of TSTEPS) {
    if (!ok()) return;
    let any = false;
    for (let s = 0; s < np; s++) {
      const val = sc.seats[s][step] || 0;
      for (const p of tallyParts(s, step, val)) { any = true; give(s, trayEl(s, p.k), p.v, p.z); }
      if (!tallyParts(s, step, val).length && val) { any = true; give(s, trayEl(s, 'ctr'), val); }
    }
    if (any) await tw(430);
  }
  await Promise.all(flights); flights.length = 0; if (!ok()) return;
  await tw(150);
  for (let s = 0; s < np; s++) if (F.tally[s] !== sc.seats[s].total) { console.error('tally mismatch seat ' + s + ': ' + F.tally[s] + ' vs ' + sc.seats[s].total); F.tally[s] = sc.seats[s].total; bump(s); }
  if (last) {
    // dessert: the custard cups light up, the most scores, the fewest loses
    F.msg = 'Custard cups count'; renderDock(); await tw(350);
    const fin = G.final;
    for (let s = 0; s < np; s++) { const el = trayEl(s, 'pud'); if (fin.pudding[s] > 0 && el && el.classList) el.classList.add('tl'); }
    await tw(450);
    for (let s = 0; s < np; s++) { const pts = fin.puddingPts[s]; if (pts) give(s, trayEl(s, 'pud'), pts); }
    await Promise.all(flights); flights.length = 0; if (!ok()) return;
    for (let s = 0; s < np; s++) if (bankedOf(s) + F.tally[s] !== fin.totals[s]) { console.error('final mismatch seat ' + s + ': ' + (bankedOf(s) + F.tally[s]) + ' vs ' + fin.totals[s]); F.tally[s] = fin.totals[s] - bankedOf(s); bump(s); }
    await tw(300);
  }
  return true;
}
function rsBar(btns) {
  const rs = $('#rs'); UI.rsOpen = true; rs.hidden = false;
  rs.replaceChildren(h('div.rsbox.bar', { role: 'group', 'aria-label': 'Next' }, btns.map(b => h('button.btn' + (b.cls ? '.' + b.cls : ''), { type: 'button', 'data-a': b.a }, b.label))));
}
function showRound(sc, ge) {
  const rs = $('#rs'); UI.rsOpen = true; rs.hidden = false; rs.innerHTML = '';
  const last = G.phase === 'over', tok = UI.seq, F = UI.fz;
  UI.rsInfo = { sc, ge, skip: !ANIM, done: false, last };
  if (!(F && F.tables)) {   // online: the next round is already dealt, so there is no frozen table to count on
    rsBar([{ label: last ? 'Result' : 'Next round', a: 'rsnext', cls: 'go' }]);
    clearTimeout(UI.rsT); const info = UI.rsInfo; UI.rsT = setTimeout(() => { if (UI.rsOpen && UI.rsInfo === info) afterRound(ge); }, NET.on ? 30000 : 6000);
    return;
  }
  (async () => {
    let done = false; try { done = await runTally(sc, last, tok); } catch (e) { console.error(e); done = true; }
    if (!done || tok !== UI.seq || !UI.rsOpen) return;
    UI.rsInfo.done = true; F.msg = null;
    if (last) {
      F.crown = true; markWinners();
      if (campOn()) { renderDock(); await tw(1500); if (tok === UI.seq && UI.rsOpen) afterRound(ge); }
      else showFinal();
      return;
    }
    F.msg = 'Round ' + sc.round + ' scored'; renderDock();
    rsBar([{ label: 'Next round', a: 'rsnext', cls: 'go' }]);
    try { document.querySelector('#rs [data-a=rsnext]').focus({ preventScroll: true }); } catch (e) { }
  })();
}
function skipCount() { UI.fast = true; }
// winners get a crown and a glow on their seat
function markWinners() {
  if (!G || G.phase !== 'over') return;
  for (const s of G.winners || []) { const av = document.querySelector('#tbl .seat[data-seat="' + s + '"] .av'); if (av && !av.classList.contains('win')) { av.classList.add('win'); av.appendChild(h('span.crown', { html: KIT.iconSVG('crown', { size: 26 }) })); } }
}
function showFinal() {
  const rs = $('#rs'); UI.rsOpen = true; rs.hidden = false;
  const ws = G.winners || [], me = viewSeat(), iWin = me >= 0 && ws.includes(me);
  if (UI.fz) UI.fz.crown = true; UI.overShown = true; renderDock(); markWinners();
  const bs = NET.on ? netOverButtons() : [{ label: 'Play again', a: 'again', cls: 'go' }, { label: 'Menu', a: 'menu', cls: 'alt' }];
  rs.replaceChildren(h('div.rsbox.bar', { role: 'group', 'aria-label': 'Result' }, bs.map(b => h('button.btn' + (b.cls ? '.' + b.cls : ''), { type: 'button', 'data-a': b.a === 'cont' ? 'rsclose' : b.a }, b.label))));
  const humanWin = NET.on ? iWin : ws.some(s => G.players[s] && !G.players[s].ai);
  if (humanWin) { snd('win', { duck: true }); celebrate($('#rs')); } else snd('round', { duck: true });
  if (humans().length || NET.on) lsSet('kk_done', '1');
  if (UI.mode !== 'net') lsSet('kk_save', '');
}
function celebrate(box) {
  if (!ANIM) return; const c = h('div.conf'); const cols = ['#e5553a', '#e0a31c', '#2a97a0', '#7a5ac8', '#5aa83c', '#f4b6d2'];
  for (let i = 0; i < 40; i++) { const e = h('i'); e.style.left = Math.round(Math.random() * 100) + '%'; e.style.background = cols[i % cols.length]; e.style.animationDelay = (Math.random() * 2) + 's'; e.style.animationDuration = (2 + Math.random() * 2) + 's'; c.appendChild(e); }
  $('#rs').appendChild(c); setTimeout(() => c.remove(), 6000);
}
function closeRS() { const rs = $('#rs'); rs.hidden = true; rs.innerHTML = ''; UI.rsOpen = false; clearTimeout(UI.rsT); }
