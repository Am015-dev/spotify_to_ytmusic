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
function effShort(c, nb) {   /* a card's effect in 1-4 words for the card face ("+1 compass", "draw 2") */
  if (c.t === 'fear') return 'No effect';
  const one = o => o.g ? (Object.keys(o.g).length > 2 ? '+' + Object.values(o.g).reduce((a, b) => a + b, 0) + ' goods' : Object.keys(o.g).map(k => '+' + o.g[k] + ' ' + rw(k, o.g[k]).replace('arrowhead', 'arrow')).join(' ')) : o.p ? 'trade' : o.d ? 'draw ' + o.d : o.x ? 'exile' : o.r ? 'climb research' : o.b ? 'cheap buy' : o.fd ? 'free dig' : o.or ? 'choose' : '';
  const ops = (c.ops || []).map(one).filter(Boolean); if (ops.indexOf('trade') >= 0) return 'Trade'; if (ops.indexOf('choose') >= 0) return 'Choose one';
  const u = []; ops.forEach(o => { const f = u.find(x => x.o === o); if (f) f.n++; else u.push({ o, n: 1 }); });
  return u.slice(0, 2).map(x => (x.n > 1 ? x.o + ' twice' : x.o).replace(/(\+\d+|draw|free|cheap) /g, nb ? '$1\u00a0' : '$1 ')).join(' ');
}
/* market cards: what the card does, in words a friend would say ("Buy an item for 2 less"), led by one icon */
const NUMW = n => n + '';
function opPlain(o) {
  if (o.g) { const ks = Object.keys(o.g); return { k: ks[0], t: ks.length > 1 && ks.every(k => o.g[k] === 1) ? '+1 ' + ks.map(k => V.RNAME[k]).join(', ') : ks.map(k => '+' + o.g[k] + ' ' + rw(k, o.g[k])).join(' ') }; }
  if (o.d) return { k: 'card', t: 'Draw ' + o.d + (o.d > 1 ? ' cards' : ' card') };
  if (o.x) return { k: 'exile', t: 'Remove a card' };
  if (o.r) return { k: 'up', t: (o.r === 'g' ? 'Magnifier' : 'Notebook') + ' up 1' };
  if (o.b) return { k: 'cart', t: 'Buy ' + (o.b === 'i' ? 'an item' : 'an artifact') + ' ' + o.o + ' cheaper' };
  if (o.fd) return { k: 'boot', t: 'Dig, no travel' };
  if (o.or) { const a = o.or.map(x => x.map(opPlainLow).join(' + ')); return { k: (opPlain(o.or[0][o.or[0].length - 1]) || {}).k || 'card', t: a.join(' or ') }; }
  return null;
}
function opPlainLow(o) { if (o.p) return Object.keys(o.p).map(k => 'pay ' + o.p[k] + ' ' + rw(k, o.p[k])).join(', ').replace(/^pay (.*)$/, '$1 →'); const r = opPlain(o); return r ? r.t.replace(/^[A-Z]/, c => c.toLowerCase()) : ''; }
function effPlain(c) {
  const ps = (c.ops || []).map(opPlain).filter(Boolean); if (!ps.length) return '';
  const rs = (c.ops || []).filter(o => o.r); if (rs.length > 1) ps.splice(0, ps.length, rs[0].r === rs[1].r ? { k: 'up', t: (rs[0].r === 'g' ? 'Magnifier' : 'Notebook') + ' up 2' } : { k: 'up', t: 'Magnifier and notebook up 1' });
  const xs = ps.filter(x => x.k === 'exile').length; let list = ps;
  if (xs > 1) list = [{ k: 'exile', t: 'Remove ' + xs + ' cards' }].concat(ps.filter(x => x.k !== 'exile'));
  const t = list.map((x, i) => i ? x.t.replace(/^[A-Z](?=[a-z])/, ch => ch.toLowerCase()) : x.t).join(', ').replace(/ → \+/g, ' → ');
  return `${ic(list[0].k, '')}<span>${esc(t.replace(/arrowhead/g, 'arrow'))}</span>`;
}
function mktHTML(id, o) {
  const c = V.CARDS[id], k = c.t === 'item' ? 'coin' : 'compass';
  const lab = c.name + (c.fa ? ', free action' : '') + ', ' + (c.t === 'item' ? 'item' : 'artifact') + ', costs ' + c.cost + ' ' + rw(k, c.cost) + '. ' + c.text + (c.vp ? ' Worth ' + c.vp + ' points.' : '') + ' Pays travel: ' + V.TNAME[c.tr] + '.' + (o.need ? ' ' + o.needT : '');
  return `<button type="button" class="cd mc ${c.t}${o.glow === 2 ? ' can' : o.glow ? ' glow' : ''}${o.sel ? ' sel' : ''}${o.need ? ' poor' : ''}" data-a="row" data-r="${o.r}" data-id="${id}" aria-label="${esc(lab)}">
    <span class="pic" data-art="card-${id}"><svg class="pg" aria-hidden="true"><use href="#s-${k}"/></svg></span>
    <span class="mtop"><span class="mcost ${k}" aria-hidden="true">${ic(k, '')}<b>${c.cost}</b></span>${c.fa ? '<span class="mfree" aria-hidden="true">Free</span>' : ''}<span class="msp"></span><span class="tr">${ic(c.tr)}</span>${c.vp ? `<span class="mvp" aria-hidden="true"><b>${c.vp}</b>${ic('star', '')}</span>` : ''}</span>
    ${o.need ? `<span class="need">${o.need}</span>` : ''}<span class="mef">${effPlain(c)}</span></button>`;
}
const CARD_GLYPH = { item: 'coin', art: 'compass', fear: 'guard' };
function cardHTML(id, o) {
  o = o || {}; const c = V.CARDS[id];
  const cost = c.t === 'item' ? `<span class="cost">${c.cost}${ic('coin')}</span>` : c.t === 'art' ? `<span class="cost">${c.cost}${ic('compass')}</span>` : '';
  const lab = c.name + (c.fa ? ', free action' : '') + (c.t === 'item' ? ', item, ' + c.cost + (c.cost === 1 ? ' coin' : ' coins') : c.t === 'art' ? ', artifact, ' + c.cost + (c.cost === 1 ? ' compass' : ' compasses') : '') + '. ' + c.text + ' Pays travel: ' + V.TNAME[c.tr] + '.';
  return `<button type="button" class="cd ${c.t}${o.glow === 2 ? ' can' : o.glow ? ' glow' : ''}${o.sel ? ' sel' : ''}" ${o.a ? `data-a="${o.a}"` : ''} ${o.i != null ? `data-i="${o.i}"` : ''} ${o.r != null ? `data-r="${o.r}"` : ''} data-id="${id}" aria-label="${esc(lab)}">
    <span class="pic" data-art="card-${id}"><svg class="pg" aria-hidden="true"><use href="#s-${CARD_GLYPH[c.t] || 'card'}"/></svg></span>${cost}<span class="tr">${ic(c.tr)}</span>${c.vp ? `<span class="vp${c.vp < 0 ? ' neg' : ''}">${c.vp > 0 ? '+' + c.vp : c.vp}</span>` : ''}
    <span class="cn">${esc(c.name)}</span><span class="ef">${c.fa ? 'Free: ' : ''}${esc(effShort(c, o.a === 'row'))}</span>${o.need ? `<span class="need">${o.need}</span>` : ''}</button>`;
}
function pawnSVG(s, cls) { return `<svg class="meep ${cls || ''}" viewBox="0 0 20 28" style="color:${s === -2 ? '#9a9486' : HEX[s]}" aria-hidden="true"><use href="#s-meep"/></svg>`; }
function siteName(x) { return x.tile ? V.SITE[x.tile].name : (x.lvl === 1 ? 'Hidden ruin' : 'Deep ruin'); }
function siteHTML(x, i, glow, sel) {
  const hid = !x.tile, nm = siteName(x), occ = x.occ === -1 ? '' : x.occ === -2 ? (G.rival ? G.rival.name : 'Rival') : G.p[x.occ].name;
  const lab = nm + '. Travel ' + VG.siteCost(x).map(t => V.TNAME[t]).join(' + ') + (hid ? '. Explore for ' + V.DISC[x.lvl] + ' compasses' : '. Dig for ' + resWords(V.SITE[x.tile].rew)) + (x.guard ? '. Guardian: ' + V.GUARD[x.guard].name : '') + (occ ? '. ' + occ + ' is here' : '');
  const rew = hid ? `<b>${V.DISC[x.lvl]}</b>${ic('compass')}` : Object.keys(V.SITE[x.tile].rew).map(k => `<b>${V.SITE[x.tile].rew[k]}</b>${ic(k)}`).join('');
  return `<button type="button" class="site l${x.lvl}${hid ? ' hid' : ''}${glow === 2 ? ' can' : glow ? ' glow' : ''}${sel ? ' sel' : ''}${x.occ !== -1 && !(x.cap > 1 && x.occ2 === -1) ? ' taken' : ''}" data-a="site" data-i="${i}" aria-label="${esc(lab)}">
    <span class="pic" data-art="${hid ? 'site-hidden-' + x.lvl : 'site-' + x.tile}"></span>
    <span class="cost">${VG.siteCost(x).map(t => ic(t)).join('')}</span>
    <span class="nm">${esc(nm)}</span>
    ${x.guard ? `<span class="gd" data-art="guard-${x.guard}"><svg aria-hidden="true"><use href="#s-guard"/></svg></span>` : ''}
    ${occ ? `<span class="occ"${x.occ >= 0 ? ` data-art="explorer-${x.occ}"` : ''}>${pawnSVG(x.occ)}</span>` : ''}${x.occ2 != null && x.occ2 >= 0 ? `<span class="occ occ2" data-art="explorer-${x.occ2}">${pawnSVG(x.occ2)}</span>` : ''}${x.lvl === 0 && x.cap > 1 && x.occ2 === -1 && x.occ !== -1 ? '<span class="sp2" aria-hidden="true">+1</span>' : ''}
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
if (B2 && typeof ResizeObserver !== 'undefined') try { const fit = () => { const m = document.getElementById('map'); if (!m) return; const h = m.getBoundingClientRect().height; m.style.setProperty('--ms', h ? Math.max(0.62, Math.min(1, h / 290)).toFixed(2) : 1); };
  addEventListener('DOMContentLoaded', () => { const m = document.getElementById('map'); if (m) new ResizeObserver(fit).observe(m); fit(); }); if (document.getElementById('map')) new ResizeObserver(fit).observe(document.getElementById('map')); } catch (e) { }   /* sites scale with the map's height */
if (B2) document.body.classList.add('vg-b2');
const B2FLAT = { 0: [[15, 82], [33, 82], [51, 82], [69, 82], [87, 82]], 1: [[15, 47], [33, 47], [51, 47], [69, 47], [87, 47]], 2: [[21, 12], [42, 12], [63, 12], [84, 12]] };   /* short maps: three straight rows so 46 px discs never overlap */
const B2POS = {   /* [x%, y%] per level and slot, zig-zag so the trails wind */
  0: [[15, 69], [33, 79], [51, 69], [69, 79], [87, 69]],
  1: [[15, 41], [33, 53], [51, 41], [69, 53], [87, 41]],
  2: [[21, 11], [42, 23], [63, 11], [84, 23]]
};
function mapB2(gS, S) {
  const per = { 0: [], 1: [], 2: [] }; G.sites.forEach((x, i) => per[x.lvl].push(i));
  if (UI.flat == null) UI.flat = innerWidth < 1000 && innerHeight < 700;   /* F15: decided once per game from the screen size, never from how tall the map is right now */
  const flat = !!UI.flat, mh = document.getElementById('map') ? document.getElementById('map').clientHeight || 999 : 999;
  const pos = {}; [0, 1, 2].forEach(lv => per[lv].forEach((i, k) => { pos[i] = ((flat ? B2FLAT : B2POS)[lv][k] || [50, 50]); }));
  /* F14 (R93 P4): short phones use a strict grid so no pill overlaps: each site = cost column (16 px icons) + 32 px circle, loot pill
     under the circle (14 px text); rows of 51 px (deep, ruins, camp); deep sites get a 2-column cost block in wider cells */
  const mw = document.getElementById('map') ? document.getElementById('map').clientWidth : 300;
  if (flat) [0, 1, 2].forEach(lv => { const n = per[lv].length, cw = mw / n, rowY = (lv === 2 ? 0 : lv === 1 ? 1 : 2), cy = 2 + 16 + rowY * Math.max(51, (mh - 4) / 3);
    per[lv].forEach((i, k) => { const off = lv === 2 ? 36 + 16 : 18 + 16; pos[i] = [100 * (k * cw + Math.min(cw - 16, off + Math.max(0, (cw - off - 18) / 2))) / mw, 100 * cy / mh]; }); });
  let path = ''; const line = (a, b) => { path += `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`; };
  per[0].forEach((i, k) => { if (k) line(pos[per[0][k - 1]], pos[i]); const up = per[1][k]; if (up != null) line(pos[i], pos[up]); });
  per[1].forEach((i, k) => { if (k) line(pos[per[1][k - 1]], pos[i]); const up = per[2][Math.min(per[2].length - 1, Math.round(k * (per[2].length - 1) / Math.max(1, per[1].length - 1)))]; if (up != null) line(pos[i], pos[up]); });
  per[2].forEach((i, k) => { if (k) line(pos[per[2][k - 1]], pos[i]); });
  const sign = (t, y) => `<span class="msign" style="top:${y}%">${t}</span>`;
  return `<svg class="trails" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="${path}"/></svg>` + (flat ? '' : sign('Deep<span class="lx"> ruins</span>', 2) + sign('Ruins', 36) + sign('Camp', 69))
    + G.sites.map((x, i) => siteHTML(x, i, gS[i], S.k === 'site' && S.x === i).replace('<button ', `<button style="left:${pos[i][0]}%;top:${pos[i][1]}%" `)).join('');
}
// ---------------------------------------------------------------- render
/* which legal main moves glow: in a real game only the single strongest move (by the computer's own scoring, within 1.5 points of the best),
   so a newcomer who taps what glows plays well; the tutorial, a pending question and hot-seat keep every legal move glowing */
function glowSet(L, q) {
  if (G && UI.mode === 'tutorial' && !q) return tutGlow(L);
  if (q || !G || UI.mode === 'hot' || typeof evalMoves !== 'function') return L;
  let ev = []; try { ev = evalMoves(); } catch (x) { return L; } if (!ev.length) { const f = L.find(m => m.t !== 'pass'); return f ? [f] : L; }   /* only free plays left: the first one glows */
  const key = m => m.t === 'res' || m.t === 'temple' ? 't' : m.t === 'buy' ? 'r' + m.r : m.t === 'play' ? 'h' + m.i : m.s != null ? 's' + m.s : m.t;
  const top = ev[0].v, keys = []; ev.forEach(e => { const k = key(e.m); if (keys.length < 1 && e.v >= top - 1.5 && keys.indexOf(k) < 0) keys.push(k); });
  return L.filter(m => keys.indexOf(key(m)) >= 0);
}
/* guided first game: only what the current step asks for glows (a glowing site during "Play a card" was a dead tap) */
function tutGlow(L) {
  let st = null; try { st = typeof GUIDED !== 'undefined' && GUIDED && !UI.coachFree && GXT.active() ? GXT.current() : null; } catch (x) { } if (!st) return L;
  const mt = st.wait && st.wait.match; if (!mt) return L; const me = G.p[UI.view];
  const forms = m => [{ what: 'mv', m }].concat(m.s != null ? [{ what: 'site', x: m.s }] : m.t === 'play' ? [{ what: 'hand', x: m.i, id: me.hand[m.i] }] : m.t === 'buy' ? [{ what: 'row', x: m.r, id: G.row[m.r] }] : m.t === 'res' || m.t === 'temple' ? [{ what: 'track' }] : []);
  const f = L.filter(m => forms(m).some(a => { try { return !!mt(a); } catch (x) { return false; } }));
  return f.length ? f : L;
}
function render() {
  if (!G) return; if (yourTurnClear()) { const t = $('#toast'); if (t) t.classList.remove('on'); } if (myTurn()) document.querySelectorAll('.aimark').forEach(e => e.classList.remove('aimark'));   /* the rival's mark never sits beside your glow */ UI.mv = []; const L = legal(), q = G.q && myTurn() ? G.q : null, me = G.p[UI.view];
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
    + (G.rival ? chip(-2, G.rival.name.replace(/'s (expedition|crew)$/, ''), VG.rivalScore(G), null, false, false, false) : '')
    + (typeof whyText === 'function' && whyText() && G.phase === 'play' ? `<div class="why" id="whyline" aria-live="off">${esc(whyText())}</div>` : '');
  // sites: deep ruins, ruins, camp (nearest your tray)
  const GL = glowSet(L, q), gl = m => GL.indexOf(m) >= 0 ? 1 : 2;   /* the strongest few moves glow; other legal ones get a faint ring (R29: following the glow scores well) */
  const gS = {}; L.forEach(m => { if (m.s != null && (m.t === 'dig' || m.t === 'disc' || m.t === 'beat')) gS[m.s] = Math.min(gS[m.s] || 2, gl(m)); });
  if (q && q.h === 'site') VG.moves(G).forEach(m => { if (m.v != null) gS[m.v] = 1; });
  const ter = (lv, label) => `<div class="ter t${lv}"><span class="tl">${label}</span><div class="tiles">${G.sites.map((x, i) => x.lvl === lv ? siteHTML(x, i, gS[i], S.k === 'site' && S.x === i) : '').join('')}</div></div>`;
  if (B2) { $('#map').innerHTML = mapB2(gS, S); $('#map').classList.toggle('flat', !!UI.flat); } else $('#map').innerHTML = ter(2, `Deep ruins · ${V.DISC[2]} compasses to explore`) + ter(1, `Ruins · ${V.DISC[1]} compasses to explore`) + ter(0, 'Camp · dig here for goods');
  $('#map').classList.toggle('pawnsel', S.k === 'pawn');
  // research track: rows 0..8 left to right, the temple last
  const trG = GL.some(m => m.t === 'res' || m.t === 'temple'), trC = !trG && L.some(m => m.t === 'res' || m.t === 'temple');
  /* F14 (R93): the research track is the original's PATH MAP: each row shows its 1-2 spaces with the cost of the bridge into them; a gold
     corner = a bonus tile still there; your next legal spaces glow; tokens sit in their space */
  const nxSp = {}; if (trG && myTurn()) L.forEach(m => { if (m.t === 'res') nxSp[((m.k === 'g' ? me.glass : me.note) + 1) + '_' + m.to] = 1; });
  const costMini = c => Object.keys(c).map(k => (c[k] > 1 ? `<b>${c[k]}</b>` : '') + ic(k)).join('');
  const tok = (r, j) => G.p.map((p, i) => (p.glass === r && (r === 0 || r === V.TOP || (p.gpos || 0) === j) ? `<i class="mg" style="--pc:${HEX[i]}" title="${esc(p.name)}: magnifier"></i>` : '') + (p.note === r && (r === 0 || (p.npos || 0) === j) ? `<i class="nb" style="--pc:${HEX[i]}" title="${esc(p.name)}: notebook"></i>` : '')).join('') + (G.rival && Math.min(V.TOP, G.rival.rows) === r && (r === 0 || r === V.TOP || (G.rival.pos || 0) === j) ? '<i class="mg" style="--pc:#9a9486"></i>' : '');
  let tr = ''; for (let r = 0; r <= V.TOP; r++) {
    const sps = r === 0 ? [null] : V.PATH[r];
    const cells = sps.map((sp, j) => { const bt = r > 0 && r < V.TOP && G.rbt && G.rbt[r + '_' + j] != null, nx = nxSp[r + '_' + j];
      return `<span class="sp${bt ? ' bt' : ''}${nx ? ' nx' : ''}${sps.length === 1 ? ' one' : ''}" data-sp="${j}"${sp ? ` aria-label="${esc('Row ' + r + (sps.length > 1 ? (j ? ' right' : ' left') : '') + ': costs ' + resWords(sp.c) + (bt ? ', bonus tile here' : ''))}"` : ''}>${sp ? `<span class="spc">${costMini(sp.c)}</span>` : ''}<span class="tm">${tok(r, j)}</span></span>`; }).join('');
    const nx = Object.keys(nxSp).some(k => +k.split('_')[0] === r);
    tr += `<span class="tc${r === V.TOP ? ' top' : ''}${nx ? ' nx' : ''}"><span class="tn">${r === V.TOP ? '<svg class="star" aria-label="temple"><use href="#s-star"/></svg>' : r}${V.ASST_REC.indexOf(r) >= 0 ? '<span class="tas" title="Notebook here: hire an assistant"><svg><use href="#s-meep"/></svg></span>' : ''}${V.ASST_UP.indexOf(r) >= 0 ? '<span class="tas gold" title="Notebook here: upgrade an assistant"><svg><use href="#s-meep"/></svg></span>' : ''}</span><span class="sps">${cells}</span><span class="tp">${V.GLASS_VP[r]}</span></span>`;
  }
  const tb = $('#track'); tb.innerHTML = `<span class="tl">Research</span><span class="tcs">${tr}</span>`; tb.classList.toggle('glow', trG); tb.classList.toggle('can', trC); tb.classList.toggle('sel', S.k === 'track'); tb.dataset.a = 'track';
  // market
  const gR = {}; L.forEach(m => { if (m.t === 'buy') gR[m.r] = Math.min(gR[m.r] || 2, gl(m)); }); if (q && q.h === 'buy') VG.moves(G).forEach(m => { if (m.v != null) gR[m.v] = 1; });
  const canMain = myTurn() && !q && L.some(m => m.t !== 'pass' && !m.free);
  const needOf = id => { if (!canMain) return 0; const c = V.CARDS[id], k = c.t === 'item' ? 'coin' : 'compass', n = c.cost - (me.res[k] || 0); return n > 0 ? n : 0; };
  $('#row').innerHTML = `<span class="tl">Market<span class="lx"> · need N = how many more you must earn · ${'\u2605'}N = points at the end</span></span><div class="cards">` + G.row.map((id, r) => { const n = id && !gR[r] ? needOf(id) : 0, kk = id && V.CARDS[id].t === 'item' ? 'coin' : 'compass'; return id ? mktHTML(id, { r, glow: gR[r], sel: S.k === 'row' && S.x === r, need: n ? '<span class="nw">need</span>' + n + ic(kk) : '', needT: n ? 'You need ' + n + ' more ' + rw(kk, n) + '.' : '' }) : '<span class="cd back" data-art="card-back" aria-hidden="true"></span>'; }).join('') + '</div>';
  renderTray(L, q, me, actor);
  document.body.classList.toggle('vg-mine', myTurn() && G.phase === 'play');
  if (typeof artApply === 'function') artApply();
  if (typeof bestBadges === 'function') try { bestBadges(); } catch (x) { }
  if (window.GXH) try { GXH.phase(helpPhase()); } catch (e) { }
  if (UI.insp) refreshInsp();
  if (UI.mode === 'tutorial' && typeof coachCheck === 'function') coachCheck(L);
  { const tb = $('#track'); if (tb) tb.classList.toggle('nudge', !!(tb.classList.contains('glow') && myTurn() && !q && !UI.sel && G.phase === 'play')); }
  guidedGlow();
  if (typeof yourTurnNow === 'function' && yourTurnNow()) { if (typeof rivalCap === 'function') rivalCap(''); document.querySelectorAll('.vpop:not(.onchip)').forEach(e => e.remove()); }   /* F12: your turn starts with a clear board */
  document.body.classList.remove('vg-squeeze');   /* F14 (R93): no chooser ever hides the board: 2+ button choosers are a bottom sheet (style.css .vg-sheet) */
}
setInterval(() => { if (typeof UI !== 'undefined' && UI.mode === 'tutorial') guidedGlow(); }, 250);   /* the tutor changes step without a render */
/* guided tutorial step: only the step's target glows, so a tap on anything else is never a dead tap on a glowing piece */
function guidedGlow() {
  try { if (UI.mode !== 'tutorial' || !window.GXT || !GXT.active()) return; const st = GXT.current(); if (!st || !st.wait || typeof st.target !== 'function') return;
    const t = st.target(); if (!t) return; document.querySelectorAll('#map .glow,#row .glow,#hand .glow,#pawns .glow,#track.glow').forEach(e => { if (e !== t && !t.contains(e) && !e.contains(t)) e.classList.remove('glow'); });
    const b = t.getBoundingClientRect(), cx = b.left + b.width / 2, cy = b.top + b.height / 2, hit = cx > 0 && cy > 0 && cx < innerWidth && cy < innerHeight && document.elementFromPoint(cx, cy);
    if (t.matches('button') && !t.classList.contains('glow') && !t.querySelector('.glow') && hit && (hit === t || t.contains(hit))) t.classList.add('glow');   /* the one thing to tap glows */ } catch (x) { }
}
function renderTray(L, q, me, actor) {
  const over = G.phase === 'over', mine = myTurn(), S = UI.sel, GL = glowSet(L, q), gl = m => GL.indexOf(m) >= 0 ? 1 : 2;
  document.body.classList.toggle('vg-pick', !!mine && !over && !q && L.some(m => m.t !== 'pass' && !m.free));
  $('#dock').classList.toggle('mine', !!mine && !over);
  // prompt line + the one button that fits now
  let txt, acts = '';
  if (over) { txt = 'The expedition is over.'; acts = '<button type="button" class="btn go" data-a="showres">See the result</button>'; }
  else if (!mine) txt = actor < 0 ? 'The round is ending.' : (who(actor) === 'You' ? 'Your turn is next.' : who(actor) + ' is playing. Tap to hurry.');
  else if (q) txt = qPrompt(q);
  else if (S) { const d = selInfo(S); txt = d.t; if (d.go) acts += mvBtn(d.go, d.label, 'go', 'gobtn'); if (S.k !== 'pawn') acts += '<button type="button" class="btn alt info" data-a="details" aria-label="Details">Details</button>'; }
  else txt = promptLine(L);
  const ps = L.find(m => m.t === 'pass');
  if (mine && !q && ps && !(S && selInfo(S).go)) acts += mvBtn(ps, 'Pass', 'alt pass', 'passbtn');
  if (UI.coachFree && UI.mode === 'tutorial' && !over && !S) acts += '<button type="button" class="btn alt" data-a="tutleave">Leave</button>';
  $('#prompt').textContent = txt; $('#pacts').innerHTML = acts;
  // choices: a pending question, or the research track's options
  const qb = $('#qbox'); let qh = q ? qHTML(q) : (S && S.k === 'track' ? trackChoices() : '');
  if (q && qh && mine) { const t = document.createElement('div'); t.innerHTML = qh; const bs = t.querySelectorAll('button');   /* F12 (R69 P2): a chooser with one button is a dock button, never a box that squeezes the island */
    if (bs.length === 1 && !t.querySelector('.cd')) { const b = bs[0];
      if (b.classList.contains('go')) { txt = ({ asst: me.apend > 0 ? 'Hire ' : 'Upgrade: ', tbon: 'Temple bonus: ' }[q.h] || '') + b.textContent;   /* F13: the prompt says what the one button does */ b.textContent = { asst: me.apend > 0 ? 'Hire' : 'Upgrade', tbon: 'Take it' }[q.h] || 'Take it'; b.setAttribute('aria-label', txt); }
      if (!b.id) b.id = 'gobtn'; acts = b.outerHTML + acts; qh = ''; $('#prompt').textContent = txt; $('#pacts').innerHTML = acts; } }
  if (qh) qh = `<div class="qt"><b>${esc(q ? qPrompt(q) : 'Research: pick a space.')}</b></div>` + qh;   /* F14 (R93 P5): on phones the chooser is a bottom sheet over the hand; its title says what to pick, the island and track stay in view */
  qb.hidden = !qh; qb.innerHTML = qh; document.body.classList.toggle('vg-sheet', !!qh);
  const qc = qb.querySelector('.qcards'), qg = qc && qc.querySelector('.cd.glow'); if (qg) qc.scrollLeft = Math.max(0, qg.offsetLeft - qc.offsetLeft - 8);   /* the suggested card is in view (R29: cut at 375) */
  // your explorers (drag one onto a glowing site), then your goods in words
  const canGo = mine && !q && GL.some(m => m.t === 'dig' || m.t === 'disc');
  $('#pawns').innerHTML = [0, 1].map(k => k < me.ex ? `<button type="button" class="pawn mine${S && S.k === 'pawn' && k === me.ex - 1 ? ' sel' : ''}" data-a="pawn" aria-label="Your explorer: drag it to a glowing site"><span class="pa" data-art="explorer-${UI.view}"></span>${pawnSVG(UI.view)}</button>` : `<span class="pawn gone" aria-label="Explorer out on the island">${pawnSVG(UI.view, 'out')}</span>`).join('');
  $('#myres').innerHTML = V.RES.map(k => `<span class="rc${me.res[k] ? '' : ' zero'}"><span class="rv">${ic(k)}<b>${me.res[k]}</b></span><span class="rl">${rw(k, me.res[k] === 1 ? 1 : 2).replace('arrowheads', 'arrows').replace('arrowhead', 'arrow')}</span></span>`).join('');
  /* F12 (R69 stopper): ready chips come first, one each; spent ones of a kind merge into one chip ("Set x3"), so the strip stays short and what you can use is in view */
  let ex = '', sp = '';
  const spent = (a, ks, ic0, word, aria) => { if (!ks.length) return ''; const n = ks.length; return `<button type="button" class="tag used${n > 1 ? ' many' : ''}" data-a="${a}" data-k="${ks[0]}" aria-label="${n} ${aria}"><span class="ic" ${ic0}</span><span>${word}${n > 1 ? '<i class="xn">×' + n + '</i>' : ''}</span></button>`; };
  me.guards.forEach((g, k) => { if (!g.used) ex += `<button type="button" class="tag" data-a="guard" data-k="${k}" aria-label="${esc(V.GUARD[g.id].name)}, boon ready"><span class="ic" data-art="guard-${g.id}"><svg><use href="#s-guard"/></svg></span><span>Boon</span></button>`; });
  me.idols.forEach((d, k) => { if (!d.used) ex += `<button type="button" class="tag" data-a="idol" data-k="${k}" aria-label="${esc(V.IDOL[d.id].name)}"><span class="ic" data-art="${d.id}"><svg><use href="#s-idol"/></svg></span><span>Idol</span></button>`; });
  (me.asst || []).forEach((a, k) => { const d = V.ASSTBY[a.id], h = `<button type="button" class="tag asst${a.ex ? ' used' : ''}${a.gold ? ' gold' : ''}" data-a="asst" data-k="${k}" aria-label="${esc(d.name)}${a.gold ? ' (gold)' : ''}${a.ex ? ', resting until next round' : ', ready'}"><span class="ic aic">A</span><span>${esc(d.name.split(' ')[0])}</span></button>`; if (a.ex) sp += h; else ex += h; });
  (me.tv || []).forEach(t => { ex += `<span class="tag tvc" aria-label="${V.TNAME[t]} of travel, this turn only"><span class="ic">${ic(t)}</span><span>${V.TNAME[t]} now</span></span>`; });
  const ug = me.guards.map((g, k) => g.used ? k : -1).filter(k => k >= 0), ui = me.idols.map((d, k) => d.used ? k : -1).filter(k => k >= 0);
  ex += spent('guard', ug, ug.length ? `data-art="guard-${me.guards[ug[0]].id}"><svg><use href="#s-guard"/></svg>` : '', 'Used', ug.length === 1 ? 'boon used' : 'boons used')
    + spent('idol', ui, ui.length ? `data-art="${me.idols[ui[0]].id}"><svg><use href="#s-idol"/></svg>` : '', 'Set', ui.length === 1 ? 'idol in a shrine' : 'idols in shrines') + sp;
  $('#extra').innerHTML = ex; $('#extra').hidden = !ex; document.body.classList.toggle('vg-hasex', !!ex); exFit();
  const play = {}; L.forEach(m => { if (m.t === 'play') play[m.i] = Math.min(play[m.i] || 2, gl(m)); });
  $('#hand').classList.toggle('many', me.hand.length > 5);
  $('#hand').innerHTML = me.hand.length ? me.hand.map((id, i) => cardHTML(id, { a: 'hand', i, glow: q ? 0 : play[i], sel: S && S.k === 'hand' && S.x === i }).replace('<button ', `<button style="--k:${(i - (me.hand.length - 1) / 2).toFixed(1)}" `)).join('') : '<span class="empty">No cards in hand. Your deck refills next round.</span>';
}
/* F12: the chip strip scrolls sideways when it is full; an edge fades where more chips wait, and a glowing chip is scrolled into view */
function exFit() {
  const e = $('#extra'); if (!e) return;
  if (!e.dataset.f) { e.dataset.f = '1'; e.addEventListener('scroll', exFade, { passive: true }); }
  const sig = [...e.children].map(c => (c.dataset.a || 't') + (c.dataset.k || '') + (c.classList.contains('used') ? 'u' : '')).join(','), nw = sig !== e.dataset.sig; e.dataset.sig = sig;
  requestAnimationFrame(() => { if (nw) e.scrollLeft = 0;   /* new or changed chips: back to the start, where the ready ones are */
    exShow(e.querySelector('.tag.glow, .tag.gxh-on')); exFade(); });
}
function exShow(g) { const e = $('#extra'); if (g && e && e.contains(g) && e.scrollWidth > e.clientWidth + 1) { const er = e.getBoundingClientRect(), r = g.getBoundingClientRect(); if (r.left < er.left + 2 || r.right > er.right - 2) { e.scrollLeft += r.left - er.left - 8; exFade(); } } return g; }   /* a hinted chip is scrolled into view */
function exFade() { const e = $('#extra'); if (!e) return; const m = e.scrollWidth - e.clientWidth; e.classList.toggle('fl', m > 1 && e.scrollLeft > 2); e.classList.toggle('fr', m > 1 && e.scrollLeft < m - 2); }
/* what the selected thing does, in one or two short lines, plus the move a second tap makes */
function selInfo(S) {
  const me = G.p[UI.view], ms = movesFor(S.k, S.x);
  if (S.k === 'pawn') return { t: 'Drag your explorer onto a glowing site.' };
  if (S.k === 'hand') { const c = V.CARDS[me.hand[S.x]]; if (!c) return { t: '' };
    if (ms[0]) return { t: c.name + ': ' + effShort(c) + '. Or drag it up.', go: ms[0], label: 'Play' };
    return { t: c.name + '. ' + (c.t === 'fear' ? 'No effect. Use it to pay travel.' : c.t === 'art' ? 'Playing it needs 1 tablet.' : c.text) }; }
  if (S.k === 'row') { const id = G.row[S.x]; if (!id) return { t: '' }; const c = V.CARDS[id], cw = c.cost + ' ' + (c.t === 'item' ? rw('coin', c.cost) : rw('compass', c.cost));
    return ms[0] ? { t: c.name + ': ' + effShort(c) + '.', go: ms[0], label: 'Buy · ' + cw } : { t: c.name + ': you need ' + cw + '.' }; }
  if (S.k === 'site') { const x = G.sites[S.x], m = ms[0];
    if (!m) return { t: siteName(x) + '. ' + (x.tile ? 'Dig for ' + resWords(V.SITE[x.tile].rew) + '. ' : '') + whyNotSite(x) };
    if (m.t === 'beat') { const gd = V.GUARD[x.guard]; return { t: 'Fight the ' + gd.name + '. Pay ' + resWords(gd.cost) + '. Win 5 points and a boon.', go: m, label: 'Fight' }; }
    const pay = payShort(VG.payPlan(G, UI.view, VG.siteCost(x)));   /* F12 (R69 P2): two short lines at most; Details has the full pay line */
    if (m.t === 'disc') return { t: 'Explore: ' + V.DISC[x.lvl] + ' compasses' + pay + '. A guardian wakes!', go: m, label: 'Explore' };
    return { t: 'Dig: ' + resWords(V.SITE[x.tile].rew) + pay + '.', go: m, label: 'Dig' }; }
  if (S.k === 'track') { if (!ms.length) return { t: trackWhy() }; return ms.length === 1 ? { t: trackLine(ms[0]), go: ms[0], label: ms[0].t === 'temple' ? 'Buy tile' : ms[0].k === 'g' ? 'Magnifier up' : 'Notebook up' } : { t: 'Research: pick a space.' }; }
  return { t: '' };
}
function trackWhy() {   /* why the research path cannot climb now: the missing goods, in words */
  const me = G.p[UI.view], miss = c => { const o = {}; Object.keys(c).forEach(k => { if ((me.res[k] || 0) < c[k]) o[k] = c[k] - (me.res[k] || 0); }); return o; };
  if (me.glass >= V.TOP) { const t = V.TEMPLE.find((x, k) => G.temple[k] > 0); return t ? 'Temple tile: you need ' + resWords(miss(t.cost)) + ' more.' : 'No temple tiles left.'; }
  const nx = (me.glass === 0 ? V.START_TO : V.PATH[me.glass][me.gpos || 0].to).map(j => V.PATH[me.glass + 1][j].c);
  return 'Next space costs ' + nx.map(c => resWords(c)).join(' or ') + '. You need ' + resWords(miss(nx[0])) + (nx.length > 1 ? ' (or ' + resWords(miss(nx[1])) + ')' : '') + ' more.';
}
function payShort(pl) {   /* ' + Bone Whistle + 2 coins' : what the travel costs you, in as few words as fit */
  if (!pl) return ''; const me = G.p[UI.view], n = pl.cards.length, parts = n === 1 ? [V.CARDS[me.hand[pl.cards[0]]].name] : n ? [n + ' cards'] : [];
  if (pl.coins) parts.push(pl.coins + ' coins for a Plane'); if ((pl.tv || []).length) parts.push('token'); if ((pl.boons || []).length) parts.push('boon');
  return parts.length ? ' + ' + parts.join(' + ') : '';
}
function payWords(pl) {
  if (!pl) return ''; const me = G.p[UI.view], cards = pl.cards.map(i => V.CARDS[me.hand[i]].name), list = cards.length > 1 ? cards.slice(0, -1).join(', ') + ' and ' + cards[cards.length - 1] : cards[0];
  const extra = ((pl.tv || []).length ? ' Your travel token pays too.' : '') + ((pl.boons || []).length ? ' A guardian boon pays too.' : '');
  return ((cards.length ? 'You pay with ' + list + '.' : '') + (pl.coins ? (cards.length ? ' Plus ' : 'You pay ') + pl.coins + ' coins for a Plane.' : '') + extra).trim() || 'No travel to pay.';
}
function trackLine(m) {
  const me = G.p[UI.view];
  if (m.t === 'temple') { const t = V.TEMPLE[m.k]; return 'Temple tile, ' + t.vp + ' points. Pay ' + resWords(t.cost) + '.'; }
  const row = (m.k === 'g' ? me.glass : me.note) + 1, T = V.TRACK[row], j = m.to || 0, sp = V.PATH[row][j] || V.PATH[row][0], tile = G.rbt && G.rbt[row + '_' + j] != null ? V.RBONUS[G.rbt[row + '_' + j]] : null, side = V.PATH[row].length > 1 ? (j ? ' right' : ' left') : '';
  return (m.k === 'g' ? 'Magnifier' : 'Notebook') + ' to row ' + (row === V.TOP ? 'the temple' : row + side) + '. Pay ' + resWords(sp.c) + '.' + (Object.keys(T.bonus).length || tile ? ' Get ' + resWords(Object.assign({}, T.bonus)) + (tile ? (Object.keys(T.bonus).length ? ' + bonus tile ' : 'bonus tile ') + resWords(tile) : '') + '.' : '') + (m.k === 'g' && V.GLASS_VP[row] ? ' Scores ' + V.GLASS_VP[row] + ' at the end.' : '') + (m.k === 'n' && V.ASST_REC.indexOf(row) >= 0 ? ' You hire an assistant.' : m.k === 'n' && V.ASST_UP.indexOf(row) >= 0 ? ' You upgrade an assistant.' : '');
}
function trackChoices() { const ms = movesFor('track'); if (ms.length < 2) return ''; return `<div class="qchoices">${ms.map(m => mvBtn(m, esc(trackLine(m)), 'go')).join('')}</div>`; }
function promptLine(L) {
  if (!L.some(m => m.t !== 'pass')) return 'Nothing left to do. Tap Pass.';
  if (!L.some(m => m.t !== 'pass' && !m.free)) return 'A free play is left: tap what glows, or Pass.';   /* F12 (R69): never "nothing left" while a free card glows */
  const nr = researchNudge(); if (nr) return nr;
  return (UI.mode === 'tutorial' || UI.mode === 'hot' ? 'Your turn. Tap or drag what glows.' : 'Your turn. What glows is a strong move.');
}
/* research is the big lever (R25): when climbing (or a temple tile) is about as strong as your best move, the prompt says so, with the reason, and the track pulses */
function researchNudge() {
  if (UI.mode === 'tutorial' || typeof evalMoves !== 'function') return '';
  try { const ev = evalMoves(); if (!ev.length) return ''; const r = ev.find(x => x.m.t === 'res' || x.m.t === 'temple'); if (!r || ev[0].v - r.v > 0.6) return '';
    if (r.m.t === 'temple') return 'Temple tile: points now. Tap Research.';
    const me = G.p[UI.view], row = (r.m.k === 'g' ? me.glass : me.note) + 1, T = V.TRACK[row], gift = T && Object.keys(T.bonus || {}).length;
    return gift ? 'Climb research: a gift now, points later.' : 'Climb research: big points at the end.'; } catch (x) { return ''; }
}
function qPrompt(q) { return { exile: 'Exile a card, or skip.', or: 'Choose one effect.', buy: 'Tap a glowing card to buy it cheaper.', site: 'Tap a glowing site to dig for free.', asst: (G.p[UI.view].apend > 0 ? 'Hire an assistant. Once a round, free.' : 'Upgrade an assistant to gold.'), tbon: 'You found the temple! Take a bonus tile.' }[q.h] || 'Choose.'; }
function qHTML(q) {
  const ms = VG.moves(G), p = G.p[UI.view];
  if (q.h === 'exile') return `<div class="qcards">${ms.filter(m => m.v).map(m => { const id = (m.v.z === 'hand' ? p.hand : m.v.z === 'play' ? p.play : p.disc)[m.v.i]; return cardHTML(id, { glow: id === 'dread' }).replace('<button type="button" class="cd', `<button type="button" data-a="mv" data-m="${mvIndex(m)}" class="cd`); }).join('')}</div>${mvBtn({ t: 'ans', v: null }, 'Skip', 'alt')}`;
  if (q.h === 'or') return `<div class="qchoices">${q.d.opts.map((o, i) => { const m = ms.find(x => x.v === i); const t = o.length ? esc(V.opText(o).replace(/^./, c => c.toUpperCase())) : 'Nothing'; return m ? mvBtn(m, t, 'go') : `<button type="button" class="btn" disabled>${t} (cannot pay)</button>`; }).join('')}</div>`;
  if (q.h === 'buy' || q.h === 'site') return mvBtn({ t: 'ans', v: null }, 'Skip', 'alt');
  if (q.h === 'tbon') return `<div class="qchoices">${ms.map(m => mvBtn(m, esc('Bonus: ' + V.resText(V.TBONUS[G.tb[m.v.b]]) + '.'), 'go')).join('')}</div>`;
  if (q.h === 'asst') return `<p class="qhelp">${p.asst && p.asst.length ? 'Upgrading makes one assistant stronger.' : 'An assistant is a helper: once a round it does the effect below, then rests.'}</p><div class="qchoices">${ms.map(m => { if (m.v.g != null) { const d = V.ASSTBY[G.aSt[m.v.g][0]]; return mvBtn(m, esc(d.name + ': ' + V.opText(d.s) + (d.main ? ' (your action)' : '') + '.'), 'go'); } const a = p.asst[m.v.u], d = V.ASSTBY[a.id]; return mvBtn(m, esc('Gold ' + d.name + ': ' + V.opText(d.gd) + '.'), 'go'); }).join('')}</div>`;
  return '';
}
function readMs(t, ms) { return Math.max(ms || 0, 4000 + 100 * String(t || '').split(/\s+/).filter(Boolean).length); }   /* 4 s + 1 s per 10 words, never less */
function yourTurnClear() { return !!(G && UI.mode !== 'tutorial' && G.phase === 'play' && $('#start').hidden && myTurn()); }
function toast(t, ms) {
  ms = readMs(t, ms); const e = $('#toast'); if ($('#coach.on') || ($('#fx') && !$('#fx').hidden)) return;   /* one message at a time */
  if (yourTurnClear()) return;   /* R29: never over the board on your turn (a tap on a market card hit it) */
  e.textContent = t; toast.n = (toast.n || 0) + 1; e.className = 'on t' + toast.n; clearTimeout(toast.t); toast.t = setTimeout(() => e.classList.remove('on'), ms);
}
