// ===================== part 4: pop-ups (location, card, event), recommendation, pending decisions =====================
// ---- recommendation (the normal AI's pick for the human seat) and a plain-words reason
function computeRec(force) {
  if (!G || G.phase === 'over') { UI.rec = null; return; }
  const a = HB.actor(G), p = G.players[a];
  if (p.ai || a !== viewSeat() || (UI.noRec && !force)) { UI.rec = null; return; }
  const key = G.logN + ':' + G.turn + ':' + (G.q ? G.q.kind + G.q.opts.length : '');
  if (UI.recKey === key && UI.rec) return;
  try { UI.rec = { m: HB.AI.choose(G, a, 'normal') }; } catch (e) { UI.rec = null; }
  UI.recKey = key;
}
function why(m, seat) {
  if (!m) return '';
  const p = G.players[seat];
  if (m.type === 'prepare') return 'All your workers are out. Preparing brings them home' + (p.season === 0 ? ', gives you a new worker and runs your production cards.' : p.season === 1 ? ', gives you a new worker and lets you take 2 cards from the meadow.' : ', gives you 2 new workers and runs your production cards.');
  if (m.type === 'pass') return 'There is little left worth doing, so ending your game now is reasonable.';
  if (m.type === 'worker') {
    if (m.k === 'basic') { const b = D.basic[m.i]; return 'A solid, simple gain: ' + b.text.replace(/ Shared\.$/, '').toLowerCase() + (b.shared ? ' (it never fills up).' : ' (only one worker fits, so it may be gone next turn).'); }
    if (m.k === 'forest') return D.forest[G.forest[m.i]].text + ' This forest place is only open to one worker.';
    if (m.k === 'haven') return 'You can turn spare cards into the resources you are missing.';
    if (m.k === 'journey') return 'Autumn only: the worker scores ' + D.journey[m.i].points + ' points at the end of the game.';
    if (m.k === 'event') { const e = m.e === 'b' ? D.basicEvents[G.bev[m.i].k] : D.specialEvents[G.sev[m.i].k]; return 'You can claim ' + e.name + ' right now, and nobody else can then.'; }
    if (m.k === 'dest') return cname(m.c) + ' is ready: ' + cdef(m.c).text;
  }
  if (m.type === 'play') {
    const c = cdef(m.card); let s = c.name + ' is worth ' + c.pts + ' point' + (c.pts === 1 ? '' : 's') + '. ';
    if (m.how === 'occupy') s += 'It is free: it takes the empty slot on ' + cname(m.via) + ', so you keep your resources. ';
    else if (m.how === 'pay') s += 'You can pay for it now. ';
    else s += 'This way costs you less than paying in full. ';
    if (c.type === 'production') s += 'Production cards pay you every Spring and Autumn.';
    else if (c.type === 'prosperity') s += 'It also scores bonus points at the end.';
    else if (c.type === 'governance') s += 'It helps you for the rest of the game.';
    return s;
  }
  if (m.type === 'choose' && G.q) return 'The computer helper would pick this one.';
  return '';
}
// ---- popup shell
function popHead(title, sub) { return h('div.ph-head', h('div.ph-t', h('b', title), sub ? h('span', sub) : null), h('button.px', { 'data-a': 'popx', type: 'button', 'aria-label': 'Close' }, '×')); }
function closePop() { UI.pop = null; const p = $('#ppop'); if (p) { p.hidden = true; p.innerHTML = ''; } const b = $$('.sel'); b.forEach(x => x.classList.remove('sel')); }
function placePop() {
  const p = $('#ppop'), dock = $('#dock'); if (!p || p.hidden) return;
  const dr = dock.getBoundingClientRect(); let top = 0, bottom = 0;
  const t = UI.pop && UI.pop.trig;
  if (t === 'hand') { const r = $('#handS').getBoundingClientRect(); bottom = Math.max(0, dr.bottom - r.top); }
  else if (t === 'city') { const r = $('#cityS').getBoundingClientRect(); top = Math.max(0, r.bottom - dr.top); }
  p.style.top = top + 'px'; p.style.bottom = bottom + 'px';
}
function setPop(o, build) {
  UI.pop = o; const p = $('#ppop'); p.hidden = false; p.innerHTML = ''; p.setAttribute('data-pop', o.kind); p.setAttribute('role', 'dialog'); p.setAttribute('aria-modal', 'true');
  build(p); placePop();
  const bd = p.querySelector('.ph-body'); if (bd) bd.scrollTop = 0;
}
function moveBtn(m, inner, cls) {
  UI.pm = UI.pm || []; const i = UI.pm.push(m) - 1; const rec = UI.rec && UI.rec.m && sameM(UI.rec.m, m);
  return h('button.btn.go' + (rec ? '.rec' : '') + (cls ? '.' + cls : ''), { 'data-a': 'do', 'data-mi': i, type: 'button' }, inner, rec ? h('span.star', '★ suggested') : null);
}
function reasonBox(t) { return document.createComment(''); }
// ---- reasons a worker can't go somewhere
function whyNotWorker(kind, i) {
  const a = HB.actor(G), p = G.players[viewSeat() >= 0 ? viewSeat() : 0];
  if (viewSeat() < 0) return 'Only the player holding the device can place workers.';
  if (a !== viewSeat() || G.players[a].ai) return 'It is not your turn yet.';
  if (G.q) return 'Finish the current choice first.';
  if (availW(p) <= 0) return 'All your workers are already out. Prepare for the next season to bring them home.';
  const ws = workersAt(kind, i);
  if (kind === 'basic' && !D.basic[i].shared && ws.length) return 'Taken by ' + pname(ws[0]) + ' (only one worker fits here).';
  if (kind === 'forest' && ws.length >= (G.np === 4 ? 2 : 1)) return 'Full: ' + pname(ws[0]) + ' is already here.';
  if (kind === 'forest' && ws.indexOf(viewSeat()) >= 0) return 'You already have a worker here.';
  if (kind === 'haven' && p.hand.length < 2) return 'You need at least 2 cards in your hand to use this.';
  if (kind === 'journey' && p.season < 3) return 'The Long Road only opens in Autumn (your last season).';
  return 'Not available right now.';
}
function openTile(kind, i) {
  kind = String(kind); i = +i;
  if (/deck|disc/.test(kind)) return openInfo('deck');
  if (kind === 'tree') return openInfo('seasons');
  const v = viewSeat(), mm = myMoves().filter(m => m.type === 'worker');
  UI.pm = [];
  const info = tileInfo(kind, i);
  setPop({ kind: 'tile', k: kind, i, trig: 'board' }, p => {
    const body = h('div.ph-body');
    if (kind === 'journey') {
      p.appendChild(popHead('Place a worker on the Long Road?', 'Autumn only'));
      body.appendChild(h('p', 'Discard cards from your hand equal to the spot number. The worker stays for the rest of the game and scores that many points at the end. A spot with a pawn is taken.'));
      for (let j = 0; j < 4; j++) {
        const jj = D.journey[j], m = mm.find(x => x.k === 'journey' && x.i === j), ws = workersAt('journey', j).length;
        const ws2 = G.players.some(pl => pl.dep.some(d => d.k === 'journey' && d.i === j)) || (G.grim && G.grim.ji === j);
        const lab = h('span', h('b', 'Spot ' + jj.points), ' · discard ' + jj.discard + ' · scores ' + jj.points + (jj.shared ? ' (shared)' : ''));
        if (m) body.appendChild(moveBtn(m, lab));
        else body.appendChild(h('button.btn.go.dis', { disabled: true, type: 'button' }, lab, h('span.sm', ws2 && !jj.shared ? 'taken' : (v >= 0 && G.players[v].season < 3 ? 'autumn only' : 'not enough cards'))));
      }
    } else {
      const nm = info.name;
      const m = mm.find(x => (kind === 'haven' && x.k === 'haven') || ((kind === 'basic' || kind === 'forest') && x.k === kind && x.i === i) || (kind === 'bev' && x.k === 'event' && x.e === 'b' && x.i === i) || (kind === 'sev' && x.k === 'event' && x.e === 's' && x.i === i));
      const isEv = kind === 'bev' || kind === 'sev';
      const evo = isEv ? (kind === 'bev' ? G.bev : G.sev)[i] : null;
      p.appendChild(popHead(isEv ? nm : 'Place a worker here?', isEv ? 'Event' : nm));
      if (!isEv) body.appendChild(h('div.gain', h('b', 'You gain: '), info.text.replace(/ Shared\.$/, '')));
      else {
        body.appendChild(h('p', info.text));
        const need = h('ul.need');
        if (kind === 'bev') { const nd = D.basicEvents[G.bev[i].k].need; for (const c in nd) { const have = v >= 0 ? G.players[v].city.filter(e => cdef(e.id).type === c).length : 0; need.appendChild(h('li' + (have >= nd[c] ? '.y' : '.n'), (have >= nd[c] ? '✓ ' : '✗ ') + nd[c] + ' ' + (HBKit.TYPES[c] ? HBKit.TYPES[c].label : c) + ' cards in your city (you have ' + have + ')')); } }
        else { const sp = D.specialEvents[G.sev[i].k]; for (const k of sp.req) { const has = v >= 0 && G.players[v].city.some(e => cdef(e.id).key === k); need.appendChild(h('li' + (has ? '.y' : '.n'), (has ? '✓ ' : '✗ ') + 'In your city: ' + D.cards.find(c => c.key === k).name)); } if (sp.colors) for (const c in sp.colors) need.appendChild(h('li', 'Needs ' + sp.colors[c] + ' ' + c + ' cards')); }
        body.appendChild(need);
        if (evo.o !== -1 && evo.o != null) body.appendChild(reasonBox('Already claimed by ' + pname(evo.o) + '.'));
        if (kind === 'sev') { const sc = D.specialEvents[G.sev[i].k].score; body.appendChild(h('p.sm', 'Scores at the end of the game. Claiming also costs a free worker.')); }
      }
      const ws = (kind === 'basic' || kind === 'forest' || kind === 'haven') ? workersAt(kind, i) : [];
      if (ws.length) body.appendChild(h('div.occ', 'Workers here: ', ws.map(s => pawn(s, 18)), ' ', ws.map(pname).join(', ')));
      if (kind === 'basic' || kind === 'forest' || kind === 'haven') body.appendChild(h('p.sm', info.shared ? 'Any number of workers fit.' : 'One worker fits here.'));
      if (m) {
        body.appendChild(moveBtn(m, isEv ? 'Claim it (use a worker)' : 'Place worker'));
        if (UI.rec && sameM(UI.rec.m, m)) body.appendChild(reasonBox(why(m, v)));
      } else if (!(isEv && evo.o !== -1)) body.appendChild(reasonBox(isEv ? (v < 0 ? 'Only the device holder can claim events.' : (G.players[v].dep.length >= G.players[v].workers ? 'You have no free workers.' : 'You do not meet the requirements yet.')) : whyNotWorker(kind, i)));
    }
    p.appendChild(body); body.appendChild(h('button.btn.alt.cancel', { 'data-a': 'popx', type: 'button' }, 'Cancel'));
  });
}
function openInfo(which) {
  setPop({ kind: 'info', trig: 'board' }, p => {
    const body = h('div.ph-body');
    if (which === 'deck') {
      p.appendChild(popHead('Draw pile and discards'));
      body.appendChild(h('div.kv', h('span', 'Draw pile'), h('b', G.deck.length + ' cards')));
      body.appendChild(h('div.kv', h('span', 'Discard pile'), h('b', G.discard.length + ' cards')));
      body.appendChild(h('div.kv', h('span', 'Hand limit'), h('b', '8 cards')));
      body.appendChild(h('div.kv', h('span', 'City limit'), h('b', '15 cards')));
      body.appendChild(h('p.sm', 'Cards you draw come from the pile. When it runs out the discards are shuffled into a new pile.'));
    } else {
      p.appendChild(popHead('Seasons'));
      body.appendChild(h('p.sm', 'Each player moves through the seasons on their own. You may Prepare for the next season only when all your workers are placed.'));
      G.players.forEach((pl, s) => { const nx = pl.season < 3 ? SEASN[pl.season + 1] : null; body.appendChild(h('div.kv', h('span', pawn(s, 16), ' ' + pl.name), h('b', HBKit.season(SEAS[pl.season], 20), ' ' + SEASN[pl.season] + ' · ' + pl.workers + ' workers'))); });
      body.appendChild(h('div.tree', HBKit.elderheart({ w: 150, season: SEAS[Math.max(0, focusSeat() >= 0 ? G.players[focusSeat()].season : 0)] })));
    }
    p.appendChild(body); body.appendChild(h('button.btn.alt.cancel', { 'data-a': 'popx', type: 'button' }, 'Close'));
  });
}
// ---- card pop-up: src = 'meadow' | 'hand' | 'city'
function missingText(cost, res) { const a = []; for (const r of RESK) { const d = (cost[r] || 0) - res[r]; if (d > 0) a.push(d + ' more ' + rname(r, d)); } return a.join(', '); }
function whyNotPlay(id, from) {
  const v = viewSeat(); if (v < 0) return 'Only the player holding the device can play cards.';
  const p = G.players[v], c = cdef(id);
  if (HB.actor(G) !== v || G.players[HB.actor(G)].ai) return 'It is not your turn yet.';
  if (G.q) return 'Finish the current choice first.';
  if (c.unique && p.city.some(e => cdef(e.id).key === c.key)) return 'You already have this unique card in your city.';
  if (HB.cityCount(G, v) >= 15 && c.key !== 'wanderer') return 'Your city is full (15 cards).';
  if (c.key === 'ruins') return 'Old ruins need a construction in your city to raze.';
  const miss = missingText(c.cost, p.res);
  if (miss) return 'You cannot pay yet: you need ' + miss + '.' + (c.kind === 'critter' ? ' (A free occupy needs your ' + (D.cards.find(x => x.key === c.linked) || { name: 'matching construction' }).name + ' with no token on it.)' : '');
  return 'You cannot play this right now.';
}
function howLabel(m) {
  switch (m.how) {
    case 'pay': return [h('b', 'Pay'), costEl(cdef(m.card).cost, 18)];
    case 'occupy': return [h('b', 'Play it free'), h('span.sm', 'occupies ' + cname(m.via))];
    case 'innkeeper': return [h('b', 'Send away ' + cname(m.via)), h('span.sm', 'cuts 3 berries off the price')];
    case 'crane': return [h('b', 'Dismantle ' + cname(m.via)), h('span.sm', 'cuts 3 resources off the price')];
    case 'dungeon': return [h('b', 'Use ' + (D.cards.find(x => x.key === 'dungeon') || { name: 'the cells' }).name), h('span.sm', 'lock a critter below it, cut 3 resources')];
    case 'judge': return [h('b', 'Swap one resource'), h('span.sm', 'the Gavel Marten lets you pay with another kind')];
  }
  return [h('b', 'Play')];
}
function openCard(src, id, seat, slot, trig) {
  id = +id; const v = viewSeat(); UI.pm = [];
  const c = cdef(id);
  setPop({ kind: 'card', src, id, trig: trig || (src === 'meadow' ? 'board' : src === 'hand' ? 'hand' : 'city') }, p => {
    p.appendChild(popHead(c.name, TYPEN[c.type] + ' · ' + (c.kind === 'critter' ? 'Critter' : 'Construction') + ' · ' + (c.unique ? 'Unique' : 'Common')));
    const body = h('div.ph-body');
    const w = isPh() ? 104 : 150;
    const ent = src === 'city' ? G.players[seat].city.find(e => e.id === id) : null;
    const left = h('div.cardbox', cardEl(id, w, { entry: ent }));
    const right = h('div.cinfo', h('div.cc', h('b', 'Cost '), costEl(c.cost, 16), h('b', ' · ' + c.pts + ' pt')), h('p.ct', c.text), h('p.sm', TYPEHELP[c.type]));
    if (c.kind === 'critter') { const lk = D.cards.find(x => x.key === c.linked); right.appendChild(h('p.sm', 'Free if you own ' + (c.linked === 'any' ? 'the Elderheart Oak' : lk ? lk.name : '?') + ' with no token on it.')); }
    if (ent) { const l = []; if (ent.occ) l.push('occupied'); if (ent.tok) l.push(ent.tok + ' point token(s)'); if (ent.pris && ent.pris.length) l.push(ent.pris.length + ' prisoner(s)'); if (ent.w) l.push(ent.w + ' worker(s) inside'); if (ent.stock) l.push('stock ' + costText(ent.stock)); if (l.length) right.appendChild(h('p.sm', l.join(', '))); }
    const cw = h('div.cwrap', left, right);
    const acts = h('div.pacts');
    if (src === 'city') {
      const mm = myMoves().filter(m => m.type === 'worker' && m.k === 'dest' && m.c === id);
      if (cdef(id).color === 'red' || cdef(id).key === 'storehouse') {
        if (mm.length) { acts.appendChild(moveBtn(mm[0], seat === v ? 'Place a worker here' : 'Visit with a worker')); if (UI.rec && sameM(UI.rec.m, mm[0])) acts.appendChild(reasonBox(why(mm[0], v))); }
        else acts.appendChild(reasonBox(seat === v ? (HB.actor(G) !== v ? 'Not your turn.' : 'A worker cannot go here now (it may be full, or its condition is not met).') : 'Only Open destinations can be visited in a rival city.'));
      } else acts.appendChild(h('p.sm', 'This card works by itself; no worker is needed.'));
    } else {
      const mm = myMoves().filter(m => m.type === 'play' && m.card === id && m.from === src);
      if (mm.length) { mm.forEach(m => acts.appendChild(moveBtn(m, howLabel(m)))); const rm = UI.rec && UI.rec.m; if (rm && mm.some(m => sameM(m, rm))) acts.appendChild(reasonBox(why(rm, v))); }
      else acts.appendChild(reasonBox(whyNotPlay(id, src)));
    }
    body.appendChild(acts); body.appendChild(cw); body.appendChild(h('div.pacts2', h('button.btn.alt', { 'data-a': 'refcard', 'data-id': id, type: 'button' }, 'Read it big'), h('button.btn.alt.cancel', { 'data-a': 'popx', type: 'button' }, 'Close')));
    p.appendChild(body);
  });
}
// ---- prepare / pass / hint
function openPrep() {
  const v = viewSeat(), m = movesFor(v).find(x => x.type === 'prepare'); if (!m) return; UI.pm = [];
  const p = G.players[v], nx = p.season + 1;
  setPop({ kind: 'prep', trig: 'other' }, pp => {
    pp.appendChild(popHead('Prepare for ' + SEASN[nx], 'Season change'));
    const body = h('div.ph-body');
    body.appendChild(h('div.seasonrow', HBKit.season(SEAS[p.season], 34), h('span', '→'), HBKit.season(SEAS[nx], 44)));
    const ul = h('ul.need');
    ul.appendChild(h('li', 'Your ' + p.dep.filter(d => !d.perm).length + ' placed workers come home (workers on the Long Road, Abbey and Rest stay).'));
    ul.appendChild(h('li', 'You get ' + [1, 1, 2][p.season] + ' new worker' + ([1, 1, 2][p.season] > 1 ? 's' : '') + ' (' + (p.workers + [1, 1, 2][p.season]) + ' in total).'));
    ul.appendChild(h('li', nx === 2 ? 'Take up to 2 cards from the meadow.' : 'All your green Production cards gather their goods, in any order you like.'));
    if (nx === 3) ul.appendChild(h('li', 'Autumn is the last season. The Long Road opens.'));
    body.appendChild(ul); body.appendChild(moveBtn(m, 'Prepare for ' + SEASN[nx]));
    if (UI.rec && sameM(UI.rec.m, m)) body.appendChild(reasonBox(why(m, v)));
    body.appendChild(h('button.btn.alt.cancel', { 'data-a': 'popx', type: 'button' }, 'Not yet'));
    pp.appendChild(body);
  });
}
function openPass() {
  const v = viewSeat(), m = movesFor(v).find(x => x.type === 'pass'); if (!m) return; UI.pm = [];
  setPop({ kind: 'pass', trig: 'other' }, pp => {
    pp.appendChild(popHead('Pass for the rest of the game?'));
    const body = h('div.ph-body');
    body.appendChild(h('p', 'You will take no more turns. Your workers stay where they are and your city is scored when everyone has passed. ' + (G.players[v].season < 3 ? 'You have not reached Autumn yet: you may be giving up turns you could use.' : '')));
    body.appendChild(moveBtn(m, 'Yes, I am done'));
    if (UI.rec && sameM(UI.rec.m, m)) body.appendChild(reasonBox(why(m, v)));
    body.appendChild(h('button.btn.alt.cancel', { 'data-a': 'popx', type: 'button' }, 'Keep playing'));
    pp.appendChild(body);
  });
}
function openHint() {
  const v = viewSeat(); computeRec(true); const m = UI.rec && UI.rec.m; UI.pm = [];
  setPop({ kind: 'hint', trig: 'other' }, pp => {
    pp.appendChild(popHead('Suggestion'));
    const body = h('div.ph-body');
    if (!m) body.appendChild(h('p', 'No suggestion right now.'));
    else {
      body.appendChild(h('div.gain', h('b', m.label || 'Move')));
      body.appendChild(reasonBox(why(m, v)));
      body.appendChild(moveBtn(m, 'Do it'));
      // highlight on the board
      renderBoard(); renderDock();
    }
    body.appendChild(h('button.btn.alt.cancel', { 'data-a': 'popx', type: 'button' }, 'Close'));
    pp.appendChild(body);
  });
}
// ---- pending decision card (one at a time)
function qHint(k) {
  return ({ discard: 'Tap a card to discard it. Tap Done when you have finished.', resource: 'Pick the resource you want.', meadow: 'Tap a card to take it.', production: 'Production cards run one after another. Pick the next one.', ruins: 'The razed card goes away and you get its cost back.', recipient: 'Pick which rival receives it.', give: 'Pick what to give.', stack: 'How many to place?', trigger: 'Several effects fired at once. Choose the order.', queen: 'The Queen plays a cheap card for free.', inn: 'The Inn plays a meadow card for 3 fewer resources.', university: 'The University disbands one of your cards and refunds it.', cemetery: 'Reveal cards from the pile, then play one for free.', copy: 'Pick which location to copy.' })[k] || '';
}
function renderQ() {
  const pc = $('#pc');
  if (!G || G.phase === 'over' || !G.q || UI.cards.length) { if (!UI.cards.length) { pc.hidden = true; pc.innerHTML = ''; } return; }
  const q = G.q, v = viewSeat();
  if (q.who !== v || G.players[q.who].ai) { pc.hidden = true; return; }
  closePop();
  pc.hidden = false; pc.innerHTML = ''; pc.setAttribute('data-card', 'q'); pc.setAttribute('data-kind', q.kind);
  pc.appendChild(h('div.ph-head', h('div.ph-t', h('b', q.title), h('span', qHint(q.kind) || 'Your choice')), GX.undo.can() ? h('button.btn.alt.undo', { 'data-a': 'undo', type: 'button', 'aria-label': 'Undo my last step' }, '↶ Undo') : null));
  const body = h('div.ph-body.qbody');
  const rm = UI.rec && UI.rec.m && UI.rec.m.type === 'choose' ? UI.rec.m : null;
  const hasCards = q.opts.some(o => o.card !== undefined), hasRes = q.opts.some(o => o.res !== undefined);
  const grid = h('div.qgrid' + (hasCards ? '.cards' : '') + (hasRes ? '.res' : ''));
  q.opts.forEach((o, i) => {
    let b;
    const star = rm && rm.i === i;
    if (o.card !== undefined) b = h('button.qo.qcard' + (star ? '.rec' : ''), { 'data-a': 'q', 'data-i': i, type: 'button' }, cardEl(o.card, isPh() ? 56 : 70), h('span.ql', o.label));
    else if (o.res !== undefined) b = h('button.qo.qres' + (star ? '.rec' : ''), { 'data-a': 'q', 'data-i': i, type: 'button' }, ic(o.res, 30), h('span.ql', o.label));
    else b = h('button.qo.qtext' + (star ? '.rec' : ''), { 'data-a': 'q', 'data-i': i, type: 'button' }, h('span.ql', o.label));
    if (star) b.appendChild(h('span.star', '★'));
    grid.appendChild(b);
  });
  body.appendChild(grid);
  if (rm) body.appendChild(h('p.sm', '★ = what the computer helper would choose.'));
  pc.appendChild(body);
}
