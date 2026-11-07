// ===================== part 1: state, drawing helpers, render =====================
const V = VD, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
let G = null;
const UI = { mode: 'vs', humans: [0], view: 0, mv: [], insp: null, busy: false, camp: null, started: false, fast: false, opts: { opp: 1, lvl: 'normal', hot: false }, prefs: {}, hints: true, tut: null };
const COL = ['var(--p0)', 'var(--p1)', 'var(--p2)', 'var(--p3)'], HEX = ['#2bb3a6', '#e9a22a', '#d6493b', '#9a6ad6'];
const SAVEKEY = 'vinegrave-save', PREFKEY = 'vinegrave-prefs';
try { UI.prefs = JSON.parse(localStorage.getItem(PREFKEY) || '{}') || {}; } catch (e) { UI.prefs = {}; }
function savePrefs() { try { localStorage.setItem(PREFKEY, JSON.stringify(UI.prefs)); } catch (e) { } }
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const RICON = { coin: 'coin', compass: 'compass', tablet: 'tablet', arrow: 'arrow', jewel: 'jewel' };
function ic(k, label) { const art = RICON[k] ? 'res-' + k : (V.TRAVEL.indexOf(k) >= 0 ? 'tr-' + k : ''); return `<i class="ic" ${art ? 'data-art="' + art + '"' : ''} role="img" aria-label="${esc(label || V.RNAME[k] || V.TNAME[k] || k)}"><svg><use href="#s-${k}"/></svg></i>`; }
function resHTML(r) { return Object.keys(r).map(k => `<span class="chip"><span class="num">${r[k]}</span>${ic(k)}</span>`).join(''); }
function opsHTML(ops) {
  return (ops || []).map(o => {
    if (o.g) return resHTML(o.g);
    if (o.p) return '<span class="chip">−</span>' + resHTML(o.p) + '<span class="chip">→</span>';
    if (o.d) return `<span class="chip"><span class="num">${o.d}</span>${ic('card', 'draw')}</span>`;
    if (o.x) return `<span class="chip">${ic('exile', 'exile a card')}</span>`;
    if (o.r) return `<span class="chip">${ic('up', 'research step')}</span>`;
    if (o.b) return `<span class="chip">${ic('cart', 'buy cheaper')}<span class="num">−${o.o}</span></span>`;
    if (o.fd) return `<span class="chip"><span class="ic" role="img" aria-label="free dig"><svg viewBox="0 0 20 28" style="color:#fff"><use href="#s-meep"/></svg></span></span>`;
    if (o.or) return o.or.map(x => x.length ? opsHTML(x) : '<span class="chip">—</span>').join('<span class="chip">/</span>');
    return '';
  }).join('');
}
function cardHTML(id, o) {
  o = o || {}; const c = V.CARDS[id], cost = c.t === 'item' ? c.cost + ' ' + ic('coin') : c.t === 'art' ? c.cost + ' ' + ic('compass') : '';
  const lab = c.name + (c.t === 'item' ? ', item, ' + c.cost + ' coins' : c.t === 'art' ? ', artifact, ' + c.cost + ' compasses' : '') + '. ' + c.text + ' Travel: ' + V.TNAME[c.tr] + '.';
  return `<button type="button" class="cd ${c.t}${o.glow ? ' glow' : ''}${o.sel ? ' sel' : ''}" ${o.a ? `data-a="${o.a}"` : ''} ${o.i != null ? `data-i="${o.i}"` : ''} ${o.r != null ? `data-r="${o.r}"` : ''} data-id="${id}" aria-label="${esc(lab)}">
    <span class="ct"><span class="chip">${cost}</span>${ic(c.tr)}</span>
    <span class="cn">${esc(c.name)}</span>
    <span class="pic" data-art="card-${id}"><span class="ph" aria-hidden="true">${esc(c.name.split(' ').map(w => w[0]).join('').slice(0, 2))}</span></span>
    ${c.vp ? `<span class="vp">${c.vp > 0 ? c.vp : c.vp}</span>` : ''}
    <span class="fx">${c.t === 'fear' ? '<span class="sm" style="color:#f6e6e6">no effect</span>' : opsHTML(c.ops)}</span></button>`;
}
function meep(s) { return `<svg class="meep" viewBox="0 0 20 28" style="color:${s === -2 ? '#888' : HEX[s]}" aria-hidden="true"><use href="#s-meep"/></svg>`; }
function siteName(x) { return x.tile ? V.SITE[x.tile].name : (x.lvl === 1 ? 'Unknown ruin' : 'Deep ruin'); }
function siteHTML(x, i, glow) {
  const hid = !x.tile, nm = siteName(x), occ = x.occ === -1 ? '' : x.occ === -2 ? (G.rival ? G.rival.name : 'Rival') : G.p[x.occ].name;
  const lab = nm + '. Travel ' + x.cost.map(t => V.TNAME[t]).join(' + ') + (hid ? '. Discover for ' + V.DISC[x.lvl] + ' compasses' : '. Dig for ' + V.resText(V.SITE[x.tile].rew)) + (x.guard ? '. Guardian: ' + V.GUARD[x.guard].name : '') + (occ ? '. ' + occ + ' is here' : '');
  return `<button type="button" class="site l${x.lvl}${hid ? ' hid' : ''}${glow ? ' glow' : ''}" data-a="site" data-i="${i}" aria-label="${esc(lab)}">
    <span class="pic" data-art="${hid ? 'site-hidden-' + x.lvl : 'site-' + x.tile}"><span class="ph" aria-hidden="true"><svg><use href="#s-${hid ? 'compass' : 'leaf'}"/></svg></span></span>
    <span class="nm">${esc(hid ? '' : nm)}</span>
    <span class="cost">${x.cost.map(t => ic(t)).join('')}</span>
    ${x.guard ? `<span class="gd" data-art="guard-${x.guard}"><svg aria-hidden="true"><use href="#s-guard"/></svg></span>` : ''}
    ${occ ? `<span class="occ">${meep(x.occ)}</span>` : ''}
    <span class="rew">${hid ? `<span class="chip"><span class="num">${V.DISC[x.lvl]}</span>${ic('compass')}</span>` : resHTML(V.SITE[x.tile].rew)}</span></button>`;
}
// ---------------------------------------------------------------- legal moves for the human who acts now
const isHuman = s => s >= 0 && G && !G.p[s].ai;
function myTurn() { if (!G || G.phase !== 'play' || UI.busy) return false; const s = VG.actor(G); return isHuman(s) && s === UI.view; }
function legal() { return myTurn() ? VG.moves(G) : []; }
function mvIndex(m) { let i = UI.mv.findIndex(x => VG.same(x, m) && VG.same(m, x)); if (i < 0) { UI.mv.push(m); i = UI.mv.length - 1; } return i; }
function mvBtn(m, label, cls) { return `<button type="button" class="btn ${cls || ''}" data-a="mv" data-m="${mvIndex(m)}">${label}</button>`; }
// ---------------------------------------------------------------- render
function render() {
  if (!G) return; UI.mv = []; const L = legal(), q = G.q && myTurn() ? G.q : null, me = G.p[UI.view];
  const actor = VG.actor(G);
  $('#barstat').textContent = G.phase === 'over' ? 'Game over' : 'Round ' + G.round + ' of ' + G.rounds;
  // opponents strip
  $('#opp').innerHTML = G.p.map((p, i) => `<button type="button" class="op${actor === i ? ' now' : ''}${p.passed ? ' passed' : ''}" data-gx="scored" aria-label="${esc(p.name)}: ${VG.score(G, i).total} points${p.passed ? ', passed' : ''}"><span class="dot" style="background:${HEX[i]}"></span><span>${esc(p.name)}</span><span class="vp">${VG.score(G, i).total}</span>${ic('star', 'points')}<span class="chip">${p.ex}<span class="ic" aria-label="explorers"><svg viewBox="0 0 20 28" style="color:${HEX[i]}"><use href="#s-meep"/></svg></span></span></button>`).join('')
    + (G.rival ? `<button type="button" class="op" data-gx="scored" aria-label="${esc(G.rival.name)}: ${VG.rivalScore(G)} points"><span class="dot" style="background:#888"></span><span>${esc(G.rival.name)}</span><span class="vp">${VG.rivalScore(G)}</span>${ic('star', 'points')}</button>` : '');
  // map
  const gS = {}; L.forEach(m => { if (m.s != null && (m.t === 'dig' || m.t === 'disc' || m.t === 'beat')) gS[m.s] = 1; });
  if (q && q.h === 'site') VG.moves(G).forEach(m => { if (m.v != null) gS[m.v] = 1; });
  const ter = lv => G.sites.map((x, i) => x.lvl === lv ? siteHTML(x, i, gS[i]) : '').join('');
  $('#map').innerHTML = `<div class="ter t2"><span class="tl">Deep ruins</span>${ter(2)}</div><div class="ter t1"><span class="tl">Ruins</span>${ter(1)}</div><div class="ter t0"><span class="tl">Camp</span>${ter(0)}</div>`;
  // research track
  const trG = L.some(m => m.t === 'res' || m.t === 'temple');
  let tr = ''; for (let r = V.TOP; r >= 0; r--) {
    const mk = G.p.map((p, i) => (p.glass === r ? `<i class="g" style="background:${HEX[i]}" title="${esc(p.name)} magnifier"></i>` : '') + (p.note === r ? `<i style="background:${HEX[i]}" title="${esc(p.name)} notebook"></i>` : '')).join('') + (G.rival && Math.min(V.TOP, G.rival.rows) === r ? '<i class="g" style="background:#888"></i>' : '');
    tr += `<span class="trow${r === V.TOP ? ' top' : ''}"><span class="rn">${r === V.TOP ? '★' : r}</span><span class="mk">${mk}</span>${r ? `<span class="rp">${resHTML(V.TRACK[r].cost)}</span>` : ''}</span>`;
  }
  const tb = $('#track'); tb.innerHTML = tr; tb.classList.toggle('glow', trG); tb.dataset.a = 'track';
  // market row
  const gR = {}; L.forEach(m => { if (m.t === 'buy') gR[m.r] = 1; }); if (q && q.h === 'buy') VG.moves(G).forEach(m => { if (m.v != null) gR[m.v] = 1; });
  $('#row').innerHTML = G.row.map((id, r) => id ? cardHTML(id, { a: 'row', r, glow: gR[r] }) : '<span class="cd back" aria-hidden="true"></span>').join('');
  // dock
  renderDock(L, q, me, actor);
  if (typeof artApply === 'function') artApply();
  if (window.GXH) try { GXH.phase(helpPhase()); } catch (e) { }
  if (UI.insp) refreshInsp();
}
function renderDock(L, q, me, actor) {
  const over = G.phase === 'over', mine = myTurn();
  $('#docktitle').textContent = over ? 'Expedition over' : mine ? (G.p.length > 1 && UI.humans.length > 1 ? me.name + ', your turn' : 'Your turn') : (actor === -1 ? '' : G.p[actor].name + ' is thinking…');
  $('#prompt').textContent = over ? 'The expedition is over.' : !mine ? 'Watch the other explorers.' : q ? qPrompt(q) : promptLine(L);
  $('#myres').innerHTML = V.RES.map(k => `<span class="chip"><span class="num">${me.res[k]}</span>${ic(k)}</span>`).join('') + `<span class="chip"><span class="num">${me.ex}</span><span class="ic" aria-label="explorers ready"><svg viewBox="0 0 20 28" style="color:${HEX[UI.view]}"><use href="#s-meep"/></svg></span></span><span class="chip sm">Deck ${me.deck.length} · Discard ${me.disc.length}</span>`;
  const qb = $('#qbox');
  if (q) { qb.hidden = false; qb.innerHTML = qHTML(q); } else { qb.hidden = true; qb.innerHTML = ''; }
  const play = {}; L.forEach(m => { if (m.t === 'play') play[m.i] = 1; });
  $('#hand').innerHTML = me.hand.length ? me.hand.map((id, i) => cardHTML(id, { a: 'hand', i, glow: play[i] && !q })).join('') : '<span class="sm">No cards left in your hand.</span>';
  const ps = L.find(m => m.t === 'pass');
  $('#acts').innerHTML = (mine && !q && ps ? mvBtn(ps, 'Pass (end my round)', 'alt') : '') + (over ? '<button type="button" class="btn go" data-a="showres">See the result</button>' : '');
  // guardians and idols you hold (free actions)
  let ex = '';
  me.guards.forEach((g, k) => { ex += `<button type="button" class="tag" data-a="guard" data-k="${k}" aria-label="${esc(V.GUARD[g.id].name)}${g.used ? ', boon used' : ', boon ready'}">${ic('guard', 'guardian')}<span>${g.used ? 'used' : 'Boon'}</span></button>`; });
  me.idols.forEach((d, k) => { ex += `<button type="button" class="tag" data-a="idol" data-k="${k}" aria-label="${esc(V.IDOL[d.id].name)}${d.used ? ', in a shrine' : ''}"><span class="ic" data-art="${d.id}"><svg><use href="#s-idol"/></svg></span><span>${d.used ? 'set' : 'Idol'}</span></button>`; });
  $('#extra').innerHTML = ex;
}
function promptLine(L) {
  if (L.length === 1) return 'Nothing left to do: pass.';
  return 'Pick one action: tap a glowing thing.';
}
function qPrompt(q) { return { exile: 'Exile a card, or skip.', or: 'Choose one effect.', buy: 'Pick a card to buy cheaper.', site: 'Pick a site to dig for free.' }[q.h] || 'Choose.'; }
function qHTML(q) {
  const ms = VG.moves(G), p = G.p[UI.view];
  if (q.h === 'exile') return `<b>Exile a card</b><span class="sm">It leaves the game for good. Dread cards are the best to lose.</span><div class="qcards">${ms.filter(m => m.v).map(m => { const id = m.v.z === 'hand' ? p.hand[m.v.i] : p.disc[m.v.i]; return `<span style="display:flex;flex-direction:column;align-items:center" class="sm">${cardHTML(id, { a: 'mv', glow: id === 'dread' }).replace('data-a="mv"', 'data-a="mv" data-m="' + mvIndex(m) + '"')}${m.v.z === 'hand' ? 'hand' : 'discard'}</span>`; }).join('')}</div>${mvBtn({ t: 'ans', v: null }, 'Skip', 'alt')}`;
  if (q.h === 'or') return `<b>Choose one</b><div style="display:flex;flex-wrap:wrap;gap:6px">${q.d.opts.map((o, i) => { const m = ms.find(x => x.v === i); return m ? mvBtn(m, o.length ? opsHTML(o) + '<span class="sm">' + esc(V.opText(o)) + '</span>' : 'Nothing', 'go') : `<button type="button" class="btn" disabled>${opsHTML(o)} <span class="sm">can't pay</span></button>`; }).join('')}</div>`;
  if (q.h === 'buy') return `<b>Buy ${q.d.k === 'i' ? 'an item' : 'an artifact'} ${q.d.o} cheaper</b><span class="sm">Tap a glowing card in the market.</span>${mvBtn({ t: 'ans', v: null }, 'Skip', 'alt')}`;
  if (q.h === 'site') return `<b>Dig without travel</b><span class="sm">Tap a glowing site on the map.</span>${mvBtn({ t: 'ans', v: null }, 'Skip', 'alt')}`;
  return '';
}
function toast(t, ms) { const e = $('#toast'); e.textContent = t; e.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('on'), ms || 2200); }
