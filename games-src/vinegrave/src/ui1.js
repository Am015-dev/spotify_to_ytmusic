// ===================== part 1: state, drawing helpers, render (one board: sites, research track, market; your tray below) =====================
const V = VD, $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
let G = null;
const UI = { mode: 'vs', humans: [0], view: 0, mv: [], insp: null, busy: false, camp: null, started: false, fast: false, opts: { opp: 1, lvl: 'easy', hot: false }, prefs: {}, tut: null, sel: null };
const COL = ['var(--p0)', 'var(--p1)', 'var(--p2)', 'var(--p3)'], HEX = ['#2bb3a6', '#e9a22a', '#d6493b', '#9a6ad6'];
const SAVEKEY = 'vinegrave-save', PREFKEY = 'vinegrave-prefs';
try { UI.prefs = JSON.parse(localStorage.getItem(PREFKEY) || '{}') || {}; } catch (e) { UI.prefs = {}; }
/* Play is clean: Hints (Menu, off by default) turns on previews, best badges and event notes. Learn to play coaches with Pell's bubble only. */
function hintsOn() { return UI.mode === 'tutorial' || !!UI.prefs.hints; }
function note(t, ms) { if (UI.mode !== 'tutorial' && UI.prefs.hints) toast(t, ms); }
function savePrefs() { try { localStorage.setItem(PREFKEY, JSON.stringify(UI.prefs)); } catch (e) { } document.body.classList.toggle('hints-on', !!UI.prefs.hints); }
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const RICON = { coin: 'coin', compass: 'compass', tablet: 'tablet', arrow: 'arrow', jewel: 'jewel' };
const WEAK_ART = { 'tr-boot': 1, 'tr-car': 1, 'tr-plane': 1, 'tr-ship': 1, 'res-arrow': 1, 'res-tablet': 1 };   /* W490: coin, compass, jewel are clear owner-art tokens now */   /* photo icons are mud at 20 px; the drawn glyphs stay */
function ic(k, label) { let art = RICON[k] ? 'res-' + k : (V.TRAVEL.indexOf(k) >= 0 ? 'tr-' + k : ''); if (WEAK_ART[art]) art = ''; return `<i class="ic" ${art ? 'data-art="' + art + '"' : ''} role="img" aria-label="${esc(label || V.RNAME[k] || V.TNAME[k] || k)}"><svg><use href="#s-${k}"/></svg></i>`; }
const PL = { coin: 'coins', compass: 'compasses', tablet: 'tablets', arrow: 'arrowheads', jewel: 'jewels' };
const rw = (k, n) => n === 1 ? V.RNAME[k] : PL[k];
const resWords = r => Object.keys(r).map(k => r[k] + ' ' + rw(k, r[k])).join(' and ');
function resHTML(r) { return Object.keys(r).map(k => `<span class="chip"><span class="num">${r[k]}</span>${ic(k)}</span>`).join(''); }
function opsHTML(ops) { return `<span class="sm">${esc(V.opText(ops))}</span>`; }
function effShort(c) {   /* a card's effect in 1-4 words for the card face ("+1 compass", "draw 2") */
  if (c.t === 'fear') return 'No effect';
  const one = o => o.g ? (Object.keys(o.g).length > 2 ? '+' + Object.values(o.g).reduce((a, b) => a + b, 0) + ' goods' : Object.keys(o.g).map(k => '+' + o.g[k] + ' ' + rw(k, o.g[k]).replace('arrowhead', 'arrow')).join(' ')) : o.p ? 'trade' : o.d ? 'draw ' + o.d : o.x ? 'exile' : o.r ? 'research' : o.b ? 'cheap buy' : o.fd ? 'free dig' : o.or ? 'choose' : '';
  const ops = (c.ops || []).map(one).filter(Boolean); if (ops.indexOf('trade') >= 0) return 'Trade'; if (ops.indexOf('choose') >= 0) return 'Choose one';
  const u = []; ops.forEach(o => { const f = u.find(x => x.o === o); if (f) f.n++; else u.push({ o, n: 1 }); });
  return u.slice(0, 2).map(x => x.n > 1 ? x.o + ' twice' : x.o).join(', ');
}
const CARD_GLYPH = { item: 'coin', art: 'compass', fear: 'guard' };
function cardHTML(id, o) {
  o = o || {}; const c = V.CARDS[id];
  const cost = c.t === 'item' ? `<span class="cost">${c.cost}${ic('coin')}</span>` : c.t === 'art' ? `<span class="cost">${c.cost}${ic('compass')}</span>` : '';
  const lab = c.name + (c.t === 'item' ? ', item, ' + c.cost + (c.cost === 1 ? ' coin' : ' coins') : c.t === 'art' ? ', artifact, ' + c.cost + (c.cost === 1 ? ' compass' : ' compasses') : '') + '. ' + c.text + ' Pays travel: ' + V.TNAME[c.tr] + '.';
  return `<button type="button" class="cd ${c.t}${o.glow ? ' glow' : ''}${o.sel ? ' sel' : ''}" ${o.a ? `data-a="${o.a}"` : ''} ${o.i != null ? `data-i="${o.i}"` : ''} ${o.r != null ? `data-r="${o.r}"` : ''} data-id="${id}" aria-label="${esc(lab)}">
    <span class="pic" data-art="card-${id}"><svg class="pg" aria-hidden="true"><use href="#s-${CARD_GLYPH[c.t] || 'card'}"/></svg></span>${cost}<span class="tr">${ic(c.tr)}</span>${c.vp ? `<span class="vp${c.vp < 0 ? ' neg' : ''}">${c.vp > 0 ? '+' + c.vp : c.vp}</span>` : ''}
    <span class="cn">${esc(c.name)}</span><span class="ef">${esc(effShort(c))}</span></button>`;
}
function pawnSVG(s, cls) { return `<svg class="meep ${cls || ''}" viewBox="0 0 20 28" style="color:${s === -2 ? '#9a9486' : HEX[s]}" aria-hidden="true"><use href="#s-meep"/></svg>`; }
function siteName(x) { return x.tile ? V.SITE[x.tile].name : (x.lvl === 1 ? 'Hidden ruin' : 'Deep ruin'); }
function siteHTML(x, i, glow, sel) {
  const hid = !x.tile, nm = siteName(x), occ = x.occ === -1 ? '' : x.occ === -2 ? (G.rival ? G.rival.name : 'Rival') : G.p[x.occ].name;
  const lab = nm + '. Travel ' + x.cost.map(t => V.TNAME[t]).join(' + ') + (hid ? '. Explore for ' + V.DISC[x.lvl] + ' compasses' : '. Dig for ' + resWords(V.SITE[x.tile].rew)) + (x.guard ? '. Guardian: ' + V.GUARD[x.guard].name : '') + (occ ? '. ' + occ + ' is here' : '');
  const rew = hid ? `<b>${V.DISC[x.lvl]}</b>${ic('compass')}` : Object.keys(V.SITE[x.tile].rew).map(k => `<b>${V.SITE[x.tile].rew[k]}</b>${ic(k)}`).join('');
  return `<button type="button" class="site l${x.lvl}${hid ? ' hid' : ''}${glow ? ' glow' : ''}${sel ? ' sel' : ''}${x.occ !== -1 ? ' taken' : ''}" data-a="site" data-i="${i}" aria-label="${esc(lab)}">
    <span class="pic" data-art="${hid ? 'site-hidden-' + x.lvl : 'site-' + x.tile}"></span>
    <span class="cost">${x.cost.map(t => ic(t)).join('')}</span>
    <span class="nm">${esc(nm)}</span>
    ${x.guard ? `<span class="gd" data-art="guard-${x.guard}"><svg aria-hidden="true"><use href="#s-guard"/></svg></span>` : ''}
    ${occ ? `<span class="occ"${x.occ >= 0 ? ` data-art="explorer-${x.occ}"` : ''}>${pawnSVG(x.occ)}</span>` : ''}
    <span class="rew">${rew}</span></button>`;
}
// ---------------------------------------------------------------- legal moves for the human who acts now
const isHuman = s => s >= 0 && G && !G.p[s].ai;
function myTurn() { if (!G || G.phase !== 'play' || UI.busy) return false; const s = VG.actor(G); return isHuman(s) && s === UI.view; }
function legal() { return myTurn() ? VG.moves(G) : []; }
function mvIndex(m) { let i = UI.mv.findIndex(x => VG.same(x, m) && VG.same(m, x)); if (i < 0) { UI.mv.push(m); i = UI.mv.length - 1; } return i; }
function mvBtn(m, label, cls, id) { return `<button type="button" class="btn ${cls || ''}" ${id ? 'id="' + id + '"' : ''} data-a="mv" data-m="${mvIndex(m)}">${label}</button>`; }
/* every main move that a tap on one board thing can make (site, market card, hand card, research track) */
function movesFor(k, x) {
  if (!myTurn()) return []; const L = VG.moves(G), q = G.q;
  if (q) { if (k === 'site' && q.h === 'site') return L.filter(m => m.t === 'ans' && m.v === x); if (k === 'row' && q.h === 'buy') return L.filter(m => m.t === 'ans' && m.v === x); return []; }
  if (k === 'site') return L.filter(m => m.s === x && (m.t === 'dig' || m.t === 'disc' || m.t === 'beat'));
  if (k === 'row') return L.filter(m => m.t === 'buy' && m.r === x);
  if (k === 'hand') return L.filter(m => m.t === 'play' && m.i === x);
  if (k === 'track') return L.filter(m => m.t === 'res' || m.t === 'temple');
  if (k === 'pawn') return L.filter(m => m.t === 'dig' || m.t === 'disc');
  return [];
}
// ---------------------------------------------------------------- W490 board view (flag: on by default, ?b2=0 = old terraces)
/* one painted map: camp at the bottom, ruins in the middle, deep ruins at the top; sites are painted places joined by trails */
const B2 = !/[?&]b2=0\b/.test(location.search);
if (B2) document.body.classList.add('vg-b2');
const B2POS = {   /* [x%, y%] per level and slot, zig-zag so the trails wind */
  0: [[15, 68], [33, 79], [51, 68], [69, 79], [87, 68]],   /* camp sits higher so its name labels stay on the map at 375x667 */
  1: [[15, 38], [33, 49], [51, 38], [69, 49], [87, 38]],
  2: [[21, 9], [42, 20], [63, 9], [84, 20]]
};
function mapB2(gS, S) {
  const per = { 0: [], 1: [], 2: [] }; G.sites.forEach((x, i) => per[x.lvl].push(i));
  const pos = {}; [0, 1, 2].forEach(lv => per[lv].forEach((i, k) => { pos[i] = (B2POS[lv][k] || [50, 50]); }));
  let path = ''; const line = (a, b) => { path += `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`; };
  per[0].forEach((i, k) => { if (k) line(pos[per[0][k - 1]], pos[i]); const up = per[1][k]; if (up != null) line(pos[i], pos[up]); });
  per[1].forEach((i, k) => { if (k) line(pos[per[1][k - 1]], pos[i]); const up = per[2][Math.min(per[2].length - 1, Math.round(k * (per[2].length - 1) / Math.max(1, per[1].length - 1)))]; if (up != null) line(pos[i], pos[up]); });
  per[2].forEach((i, k) => { if (k) line(pos[per[2][k - 1]], pos[i]); });
  const sign = (t, y) => `<span class="msign" style="top:${y}%">${t}</span>`;
  return `<svg class="trails" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="${path}"/></svg>` + sign('Deep ruins', 2) + sign('Ruins', 33) + sign('Camp', 62)
    + G.sites.map((x, i) => siteHTML(x, i, gS[i], S.k === 'site' && S.x === i).replace('<button ', `<button style="left:${pos[i][0]}%;top:${pos[i][1]}%" `)).join('');
}
// ---------------------------------------------------------------- render
function render() {
  if (!G) return; UI.mv = []; const L = legal(), q = G.q && myTurn() ? G.q : null, me = G.p[UI.view];
  const actor = VG.actor(G);
  if (UI.sel && (!myTurn() || UI.sel.at !== G.turns + ':' + G.round + ':' + G.p[UI.view].hand.length)) UI.sel = null;
  const S = UI.sel || {};
  $('#barstat').textContent = G.phase === 'over' ? 'Game over' : (UI.camp ? 'Stage ' + UI.camp.id.slice(1) + ' · ' : '') + 'Round ' + G.round + ' of ' + G.rounds;
  // score strip: every explorer, big score, explorers left, whose turn
  const tots = G.p.map((p, i) => VG.score(G, i).total), topT = Math.max.apply(null, tots.concat(G.rival ? [VG.rivalScore(G)] : [])), lead = tots.filter(t => t === topT).length === 1 && (!G.rival || VG.rivalScore(G) < topT) ? tots.indexOf(topT) : -1;
  const chip = (i, name, pts, ex, now, passed, ld) => `<button type="button" class="op${now ? ' now' : ''}${passed ? ' passed' : ''}${ld ? ' lead' : ''}" data-gx="scored" aria-label="${esc(name)}: ${pts} points${ld ? ', leading' : ''}${passed ? ', passed' : ''}">
    <span class="crest"${i >= 0 ? ` data-art="explorer-${i}"` : ''} style="--pc:${i >= 0 ? HEX[i] : '#9a9486'}"></span><span class="who">${esc(name)}</span><span class="pts"><b>${pts}</b> pts</span>
    <span class="exs">${ex == null ? '' : [0, 1].map(k => pawnSVG(i, k < ex ? '' : 'out')).join('')}</span>${passed ? '<span class="tagout">out</span>' : ''}</button>`;
  $('#opp').className = 'n' + (G.p.length + (G.rival ? 1 : 0));
  $('#opp').innerHTML = G.p.map((p, i) => chip(i, i === UI.view && UI.humans.length === 1 ? 'You' : p.name.split(' ')[0] === 'Dr' ? p.name.split(' ')[1] : p.name.split(' ')[0], tots[i], p.ex, actor === i && G.phase === 'play', p.passed, lead === i)).join('')
    + (G.rival ? chip(-2, G.rival.name.replace(/'s (expedition|crew)$/, ''), VG.rivalScore(G), null, false, false, false) : '');
  // sites: deep ruins, ruins, camp (nearest your tray)
  const gS = {}; L.forEach(m => { if (m.s != null && (m.t === 'dig' || m.t === 'disc' || m.t === 'beat')) gS[m.s] = 1; });
  if (q && q.h === 'site') VG.moves(G).forEach(m => { if (m.v != null) gS[m.v] = 1; });
  const ter = (lv, label) => `<div class="ter t${lv}"><span class="tl">${label}</span><div class="tiles">${G.sites.map((x, i) => x.lvl === lv ? siteHTML(x, i, gS[i], S.k === 'site' && S.x === i) : '').join('')}</div></div>`;
  if (B2) $('#map').innerHTML = mapB2(gS, S); else $('#map').innerHTML = ter(2, `Deep ruins · ${V.DISC[2]} compasses to explore`) + ter(1, `Ruins · ${V.DISC[1]} compasses to explore`) + ter(0, 'Camp · dig here for goods');
  $('#map').classList.toggle('pawnsel', S.k === 'pawn');
  // research track: rows 0..8 left to right, the temple last
  const trG = L.some(m => m.t === 'res' || m.t === 'temple');
  let tr = ''; for (let r = 0; r <= V.TOP; r++) {
    const mk = G.p.map((p, i) => (p.glass === r ? `<i class="mg" style="--pc:${HEX[i]}" title="${esc(p.name)}: magnifier"></i>` : '') + (p.note === r ? `<i class="nb" style="--pc:${HEX[i]}" title="${esc(p.name)}: notebook"></i>` : '')).join('') + (G.rival && Math.min(V.TOP, G.rival.rows) === r ? '<i class="mg" style="--pc:#9a9486"></i>' : '');
    const nx = myTurn() && (L.some(m => m.t === 'res' && m.k === 'g') && me.glass + 1 === r || L.some(m => m.t === 'res' && m.k === 'n') && me.note + 1 === r);
    tr += `<span class="tc${r === V.TOP ? ' top' : ''}${nx ? ' nx' : ''}"><span class="tn">${r === V.TOP ? '<svg class="star" aria-label="temple"><use href="#s-star"/></svg>' : r}</span><span class="tp">${V.GLASS_VP[r]}</span><span class="tm">${mk}</span></span>`;
  }
  const tb = $('#track'); tb.innerHTML = `<span class="tl">Research</span><span class="tcs">${tr}</span>`; tb.classList.toggle('glow', trG); tb.classList.toggle('sel', S.k === 'track'); tb.dataset.a = 'track';
  // market
  const gR = {}; L.forEach(m => { if (m.t === 'buy') gR[m.r] = 1; }); if (q && q.h === 'buy') VG.moves(G).forEach(m => { if (m.v != null) gR[m.v] = 1; });
  $('#row').innerHTML = `<span class="tl">Market<span class="lx"> · coins or compasses</span></span><div class="cards">` + G.row.map((id, r) => id ? cardHTML(id, { a: 'row', r, glow: gR[r], sel: S.k === 'row' && S.x === r }) : '<span class="cd back" data-art="card-back" aria-hidden="true"></span>').join('') + '</div>';
  renderTray(L, q, me, actor);
  document.body.classList.toggle('vg-mine', myTurn() && G.phase === 'play');
  if (typeof artApply === 'function') artApply();
  if (typeof bestBadges === 'function') try { bestBadges(); } catch (x) { }
  if (window.GXH) try { GXH.phase(helpPhase()); } catch (e) { }
  if (UI.insp) refreshInsp();
  if (UI.mode === 'tutorial' && typeof coachCheck === 'function') coachCheck(L);
}
function renderTray(L, q, me, actor) {
  const over = G.phase === 'over', mine = myTurn(), S = UI.sel;
  document.body.classList.toggle('vg-pick', !!mine && !over && !q && L.some(m => m.t !== 'pass' && !m.free));
  $('#dock').classList.toggle('mine', !!mine && !over);
  // prompt line + the one button that fits now
  let txt, acts = '';
  if (over) { txt = 'The expedition is over.'; acts = '<button type="button" class="btn go" data-a="showres">See the result</button>'; }
  else if (!mine) txt = actor < 0 ? 'The round is ending.' : who(actor) + ' is choosing. Tap to skip ahead.';
  else if (q) txt = qPrompt(q);
  else if (S) { const d = selInfo(S); txt = d.t; if (d.go) acts += mvBtn(d.go, d.label, 'go', 'gobtn'); if (S.k !== 'pawn') acts += '<button type="button" class="btn alt info" data-a="details" aria-label="Details">Details</button>'; }
  else txt = promptLine(L);
  const ps = L.find(m => m.t === 'pass');
  if (mine && !q && ps && !S) acts += mvBtn(ps, 'Pass', 'alt pass', 'passbtn');
  if (UI.coachFree && UI.mode === 'tutorial' && !over && !S) acts += '<button type="button" class="btn alt" data-a="tutleave">Leave</button>';
  $('#prompt').textContent = txt; $('#pacts').innerHTML = acts;
  // choices: a pending question, or the research track's options
  const qb = $('#qbox'); let qh = q ? qHTML(q) : (S && S.k === 'track' ? trackChoices() : '');
  qb.hidden = !qh; qb.innerHTML = qh;
  // your explorers (drag one onto a glowing site), then your goods in words
  const canGo = mine && !q && L.some(m => m.t === 'dig' || m.t === 'disc');
  $('#pawns').innerHTML = [0, 1].map(k => k < me.ex ? `<button type="button" class="pawn mine${canGo ? ' glow' : ''}${S && S.k === 'pawn' && k === me.ex - 1 ? ' sel' : ''}" data-a="pawn" aria-label="Your explorer: drag it to a glowing site"><span class="pa" data-art="explorer-${UI.view}"></span>${pawnSVG(UI.view)}</button>` : `<span class="pawn gone" aria-label="Explorer out on the island">${pawnSVG(UI.view, 'out')}</span>`).join('');
  $('#myres').innerHTML = V.RES.map(k => `<span class="rc${me.res[k] ? '' : ' zero'}"><span class="rv">${ic(k)}<b>${me.res[k]}</b></span><span class="rl">${rw(k, me.res[k] === 1 ? 1 : 2).replace('arrowheads', 'arrows').replace('arrowhead', 'arrow')}</span></span>`).join('');
  let ex = '';
  me.guards.forEach((g, k) => { ex += `<button type="button" class="tag${g.used ? ' used' : ''}" data-a="guard" data-k="${k}" aria-label="${esc(V.GUARD[g.id].name)}${g.used ? ', boon used' : ', boon ready'}"><span class="ic" data-art="guard-${g.id}"><svg><use href="#s-guard"/></svg></span><span>${g.used ? 'Used' : 'Boon'}</span></button>`; });
  me.idols.forEach((d, k) => { ex += `<button type="button" class="tag${d.used ? ' used' : ''}" data-a="idol" data-k="${k}" aria-label="${esc(V.IDOL[d.id].name)}${d.used ? ', in a shrine' : ''}"><span class="ic" data-art="${d.id}"><svg><use href="#s-idol"/></svg></span><span>${d.used ? 'Set' : 'Idol'}</span></button>`; });
  $('#extra').innerHTML = ex; $('#extra').hidden = !ex;
  const play = {}; L.forEach(m => { if (m.t === 'play') play[m.i] = 1; });
  $('#hand').classList.toggle('many', me.hand.length > 5);
  $('#hand').innerHTML = me.hand.length ? me.hand.map((id, i) => cardHTML(id, { a: 'hand', i, glow: play[i] && !q, sel: S && S.k === 'hand' && S.x === i }).replace('<button ', `<button style="--k:${(i - (me.hand.length - 1) / 2).toFixed(1)}" `)).join('') : '<span class="empty">No cards in hand. Your deck refills next round.</span>';
}
/* what the selected thing does, in one or two short lines, plus the move a second tap makes */
function selInfo(S) {
  const me = G.p[UI.view], ms = movesFor(S.k, S.x);
  if (S.k === 'pawn') return { t: 'Drag your explorer onto a glowing site.' };
  if (S.k === 'hand') { const c = V.CARDS[me.hand[S.x]]; if (!c) return { t: '' };
    if (ms[0]) return { t: c.name + '. ' + c.text + ' Tap again or drag it up.', go: ms[0], label: 'Play' };
    return { t: c.name + '. ' + (c.t === 'fear' ? 'No effect. Use it to pay travel.' : c.t === 'art' ? 'Playing it needs 1 tablet.' : c.text) }; }
  if (S.k === 'row') { const id = G.row[S.x]; if (!id) return { t: '' }; const c = V.CARDS[id], cw = c.cost + ' ' + (c.t === 'item' ? rw('coin', c.cost) : rw('compass', c.cost));
    return ms[0] ? { t: c.name + ', ' + cw + '. ' + c.text + ' Tap again to buy.', go: ms[0], label: 'Buy' } : { t: c.name + '. ' + c.text + ' You need ' + cw + '.' }; }
  if (S.k === 'site') { const x = G.sites[S.x], m = ms[0];
    if (!m) return { t: siteName(x) + '. ' + (x.tile ? 'Dig for ' + resWords(V.SITE[x.tile].rew) + '. ' : '') + whyNotSite(x) };
    if (m.t === 'beat') { const gd = V.GUARD[x.guard]; return { t: 'Fight the ' + gd.name + '. Pay ' + resWords(gd.cost) + '. Win 5 points and a boon.', go: m, label: 'Fight' }; }
    const pay = payWords(VG.payPlan(G, UI.view, x.cost));
    if (m.t === 'disc') return { t: 'Explore this ruin for ' + V.DISC[x.lvl] + ' compasses. ' + pay + ' A guardian wakes!', go: m, label: 'Explore' };
    return { t: siteName(x) + '. Dig for ' + resWords(V.SITE[x.tile].rew) + '. ' + pay, go: m, label: 'Dig' }; }
  if (S.k === 'track') { if (!ms.length) return { t: 'Research: you cannot pay the next row yet.' }; return ms.length === 1 ? { t: trackLine(ms[0]) + ' Tap again to climb.', go: ms[0], label: ms[0].t === 'temple' ? 'Buy tile' : 'Climb' } : { t: 'Research: pick what climbs.' }; }
  return { t: '' };
}
function payWords(pl) {
  if (!pl) return ''; const me = G.p[UI.view], cards = pl.cards.map(i => V.CARDS[me.hand[i]].name), list = cards.length > 1 ? cards.slice(0, -1).join(', ') + ' and ' + cards[cards.length - 1] : cards[0];
  return (cards.length ? 'You pay with ' + list + '.' : '') + (pl.coins ? (cards.length ? ' Plus ' : 'You pay ') + pl.coins + ' coins for a Plane.' : '') || 'No travel to pay.';
}
function trackLine(m) {
  const me = G.p[UI.view];
  if (m.t === 'temple') { const t = V.TEMPLE[m.k]; return 'Temple tile, ' + t.vp + ' points. Pay ' + resWords(t.cost) + '.'; }
  const row = (m.k === 'g' ? me.glass : me.note) + 1, T = V.TRACK[row];
  return (m.k === 'g' ? 'Magnifier' : 'Notebook') + ' to row ' + (row === V.TOP ? 'the temple' : row) + '. Pay ' + resWords(T.cost) + '.' + (Object.keys(T.bonus).length ? ' Get ' + resWords(T.bonus) + '.' : '');
}
function trackChoices() { const ms = movesFor('track'); if (ms.length < 2) return ''; return `<div class="qchoices">${ms.map(m => mvBtn(m, esc(trackLine(m)), 'go')).join('')}</div>`; }
function promptLine(L) {
  if (!L.some(m => m.t !== 'pass' && !m.free)) return 'Nothing left to do. Tap Pass.';
  let best = ''; if (UI.prefs.hints && UI.mode !== 'tutorial') try { const ev = typeof evalMoves === 'function' ? evalMoves() : []; if (ev.length) best = ' Try: ' + shortLabel(ev[0].m) + '.'; } catch (x) { }
  return 'Your turn: one main action. Starting cards are free. Tap or drag what glows.' + best;
}
function qPrompt(q) { return { exile: 'Exile a card, or skip.', or: 'Choose one effect.', buy: 'Tap a glowing card to buy it cheaper.', site: 'Tap a glowing site to dig for free.' }[q.h] || 'Choose.'; }
function qHTML(q) {
  const ms = VG.moves(G), p = G.p[UI.view];
  if (q.h === 'exile') return `<div class="qcards">${ms.filter(m => m.v).map(m => { const id = (m.v.z === 'hand' ? p.hand : m.v.z === 'play' ? p.play : p.disc)[m.v.i]; return cardHTML(id, { glow: id === 'dread' }).replace('<button type="button" class="cd', `<button type="button" data-a="mv" data-m="${mvIndex(m)}" class="cd`); }).join('')}</div>${mvBtn({ t: 'ans', v: null }, 'Skip', 'alt')}`;
  if (q.h === 'or') return `<div class="qchoices">${q.d.opts.map((o, i) => { const m = ms.find(x => x.v === i); const t = o.length ? esc(V.opText(o).replace(/^./, c => c.toUpperCase())) : 'Nothing'; return m ? mvBtn(m, t, 'go') : `<button type="button" class="btn" disabled>${t} (cannot pay)</button>`; }).join('')}</div>`;
  if (q.h === 'buy' || q.h === 'site') return mvBtn({ t: 'ans', v: null }, 'Skip', 'alt');
  return '';
}
function readMs(t, ms) { return Math.max(ms || 0, 4000 + 100 * String(t || '').split(/\s+/).filter(Boolean).length); }   /* 4 s + 1 s per 10 words, never less */
function toast(t, ms) {
  ms = readMs(t, ms); const e = $('#toast'); if ($('#coach.on') || ($('#fx') && !$('#fx').hidden)) return;   /* one message at a time */
  e.textContent = t; toast.n = (toast.n || 0) + 1; e.className = 'on t' + toast.n; clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('on'), ms);
}
