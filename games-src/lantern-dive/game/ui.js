// ===================== part 1: globals, helpers, view model =====================
var ANIM = 1, AIDELAY = 650;
var G = null;
var UI = { started: false, mode: 'vs', cfg: null, holder: -1, sel: -1, job: -1, pingSel: false, giveSel: -1, pop: null, cards: [], fz: null, busy: false, seq: 0, over: null, overShown: false,
  coach: { level: 'full', seen: {}, keep: false }, prefs: { sound: true, music: true, gfx: 'auto', guide: 'full', timer: false, speed: 650 }, enter: '', tm: null, rq: [], chefs: null, hint: null, why: '', predN: -1, evN: 0, timerAt: 0 };
const D = LD.DATA, TASKS = D.tasks, KIT = LDKit;
const suitOf = D.suitOf, valOf = D.valOf;
// painted art: LD_ART (data URIs made by build.py) -> blob URLs so the card <svg>s carry short links. Without blob URLs (jsdom) the kit keeps its own vector drawings.
(function () {
  try {
    if (typeof LD_ART === 'undefined' || /jsdom/i.test(navigator.userAgent || '') || !window.URL || !URL.createObjectURL || !window.Blob || !window.atob) return;
    const m = {};
    for (const k in LD_ART) { const p = LD_ART[k].split(','), mime = (/data:([^;]+)/.exec(p[0]) || [0, 'image/webp'])[1], bin = atob(p[1]), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); m[k] = URL.createObjectURL(new Blob([u], { type: mime })); }
    KIT.setArt(m);
  } catch (e) { }
})();
const $ = s => /^#[\w-]+$/.test(s) ? document.getElementById(s.slice(1)) : document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const DEF = { np: 4, level: 'normal', lv: ['hard', 'normal', 'normal', 'easy'], seats: [0, 1, 2], mission: 1, kind: 'log', d: 6, cmt: 'normal', deep: 18, job: 1, timer: false };
const YOU = 4;     // diver portrait index of "you"
// tiny element builder: h('div.cls#id', {attr:..}, ...kids)
function h(sel, at) {
  const m = /^([a-z0-9]*)((?:[.#][\w-]+)*)$/i.exec(sel) || [0, 'div', ''];
  const e = document.createElement(m[1] || 'div');
  const cls = []; (m[2] || '').replace(/([.#])([\w-]+)/g, (_, k, v) => { if (k === '#') e.id = v; else cls.push(v); });
  if (cls.length) e.className = cls.join(' ');
  let i = 2;
  if (at && typeof at === 'object' && !(at instanceof Node) && !Array.isArray(at)) { for (const k in at) { const v = at[k]; if (v == null || v === false) continue; if (k === 'text') e.textContent = v; else if (k === 'html') e.innerHTML = v; else e.setAttribute(k, v === true ? '' : v); } } else i = 1;
  for (; i < arguments.length; i++) add(e, arguments[i]);
  return e;
}
function add(e, k) { if (k == null || k === false) return; if (Array.isArray(k)) k.forEach(x => add(e, x)); else e.appendChild(k instanceof Node ? k : document.createTextNode(String(k))); }
const _nodes = new Map();
function svgEl(s) { const t = document.createElement('template'); t.innerHTML = s.trim(); return t.content.firstChild; }
function artNode(key, strFn) { let t = _nodes.get(key); if (!t) { t = svgEl(strFn()); _nodes.set(key, t); } return t.cloneNode(true); }
const _art = new Map();
function cached(key, fn) { let v = _art.get(key); if (v === undefined) { v = fn(); _art.set(key, v); } return v; }
const cardN = (id, w, dim) => { const n = artNode('c|' + id + '|' + w + '|' + (dim ? 1 : 0), () => KIT.cardSVG(id, { w, dim })); n.classList.add('card'); return n; };
const backN = w => { const n = artNode('b|' + w, () => KIT.backSVG({ w })); n.classList.add('card'); return n; };
const cardS = (id, w) => cached('cs|' + id + '|' + w, () => KIT.cardSVG(id, { w }));
const iconS = (n, s) => cached('i|' + n + '|' + s, () => KIT.iconSVG(n, s));
const cname = id => D.cardName(id);
// portraits: a seat shows a diver portrait; the drone has its own
const chefOf = s => G && G.players[s] && G.players[s].helper ? -1 : (UI.chefs && UI.chefs[s] != null ? UI.chefs[s] : (s === 0 ? YOU : (s - 1) % 4));
const avatarS = (s, size) => { const c = chefOf(s); return c < 0 ? cached('dr|' + size, () => KIT.droneSVG({ size })) : cached('a|' + c + '|' + size, () => KIT.avatarSVG(c, { size })); };
const avatarC = (c, size) => cached('a|' + c + '|' + size, () => KIT.avatarSVG(c, { size }));
const avN = (s, size) => svgEl(avatarS(s, size));
// ---- game helpers ----
const humans = () => G ? G.players.map((p, i) => (p.ai || p.helper) ? -1 : i).filter(i => i >= 0) : [];
const hotSeat = () => !!G && !NET.on && humans().length > 1;
const watching = () => !!G && humans().length === 0;
function viewSeat() { if (!G) return -1; if (NET.on) return NET.mySeat; if (hotSeat()) { if (UI.holder < 0 && G.phase === 'distress' && !UI.cards.length) { const p = LD.pending(G).find(s => !G.players[s].ai && !G.players[s].helper); return p != null ? p : -1; } return UI.holder; } const hs = humans(); return hs.length ? hs[0] : -1; }
const pname = s => G && G.players[s] ? G.players[s].name : '?';
const nameList = a => a.length <= 1 ? (a[0] || '') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1];
const ntrOf = () => G ? G.ntr : 10;
const isOver = () => G && G.phase === 'over';
function jobs(s) { const o = []; G.tasks.forEach((t, i) => { if (t.owner === s) o.push(i); }); return o; }
const jobDef = i => TASKS[G.tasks[i].id];
const jobShort = i => TASKS[G.tasks[i].id].s;
const jobText = i => TASKS[G.tasks[i].id].t;
const jobDiff = i => TASKS[G.tasks[i].id].d[G.np - 3];
function jobSt(i) { if (!G) return 0; if (G.phase === 'over' && G.result) return G.result.tasks[i]; return LD.jobStatus(G, i); }
// tricks won per seat (public)
function tricksWon() { const a = new Array(G.np).fill(0); for (const k of G.tricks) a[k.w]++; return a; }
// the cards a seat has shown with the ping and not yet played
function shownBy(s) { return G.pings.filter(p => p.seat === s && !G.pl[p.c]); }
function seatsClockwise(from) { const o = []; for (let k = 1; k < G.np; k++) o.push((from + k) % G.np); return o; }
function myMoves() { const v = viewSeat(); return v >= 0 && G ? LD.moves(G, v) : []; }
function mvKey(m) { return m ? m.t + ':' + (m.c != null ? m.c : '') + ':' + (m.i != null ? m.i : '') + ':' + (m.n != null ? m.n : '') + ':' + (m.f != null ? m.f : '') + ':' + (m.on != null ? m.on : '') + ':' + (m.dir || '') + ':' + (m.k || '') : ''; }
function canAct() { const v = viewSeat(); return !!G && v >= 0 && !UI.busy && !UI.cards.length && !UI.fz && !isOver() && !(NET.on && NET.role === 'client' && !NET.hostPeer); }
function iMustAct() { const v = viewSeat(); return v >= 0 && G && !isOver() && LD.pending(G).includes(v); }
// the dive label in the bar
function diveLabel() {
  if (UI.mode === 'descent' && G.desc && typeof DESC !== 'undefined') { const Z = DESC[G.desc.zi]; return Z.name + ' · ' + (G.boss ? CHAR[G.boss.id].name : 'dive ' + (G.desc.si + 1) + ' of 3') + (G.desc.tryN > 1 ? ' · try ' + G.desc.tryN : ''); }
  const m = G.mission; if (m.kind === 'log') return 'Dive ' + m.id; if (m.kind === 'deep') return 'Deep dive ' + m.d; return m.name;
}
function toast(t) { const el = $('#toast'); if (!el) return; el.textContent = t; el.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('on'), 2400); }
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }
function loadPrefs() { try { const p = JSON.parse(lsGet('ld_prefs') || '{}'); Object.assign(UI.prefs, p); if (p.speed != null) AIDELAY = p.speed; } catch (e) { } }
function savePrefs() { lsSet('ld_prefs', JSON.stringify(Object.assign({}, UI.prefs, { speed: AIDELAY }))); }
const wait = ms => ANIM ? new Promise(r => setTimeout(r, ms * (AIDELAY > 0 ? Math.max(.35, AIDELAY / 650) : .35))) : Promise.resolve();
// ---- the logbook: progress saved on this device ----
const Prog = {
  d: null,
  load() { if (this.d) return this.d; let o = null; try { o = JSON.parse(lsGet('ld_prog') || 'null'); } catch (e) { } if (!o || o.v !== 1) o = { v: 1, cur: 1, att: {}, done: {}, flare: {}, deep: { level: D.deep.start, wins: 0, best: 0 }, tries: {} }; this.d = o; return o; },
  save() { lsSet('ld_prog', JSON.stringify(this.d)); },
  // an attempt of a logbook dive ended
  ended(G) {
    const p = this.load(), m = G.mission; if (G.noProg) return;
    if (m.kind === 'log') {
      p.tries[m.id] = (p.tries[m.id] || 0) + 1;
      if (G.distress) p.flare[m.id] = true;
      if (G.result.ok) { const n = (p.tries[m.id] || 1) + (p.flare[m.id] ? 1 : 0); if (!p.done[m.id] || n < p.done[m.id]) p.done[m.id] = n; p.att[m.id] = p.done[m.id]; p.cur = Math.max(p.cur, Math.min(33, m.id + 1)); p.tries[m.id] = 0; }
    } else if (m.kind === 'deep') {
      if (G.result.ok) { p.deep.wins++; p.deep.level = m.d + 1; p.deep.best = Math.max(p.deep.best, m.d); p.deep.flare = p.deep.flare || {}; p.deep.flare[m.d] = !!G.distress; }
    }
    this.save();
  },
  reset() { this.d = null; try { localStorage.removeItem('ld_prog'); } catch (e) { } this.load(); }
};
// ===================== part 2: render (bar, other divers, felt, my seat, hand, dock) =====================
const isPh = () => document.documentElement.classList.contains('ph');
function actorSeat() {
  if (!G || G.phase === 'over') return -1;
  switch (G.phase) {
    case 'assign': return G.as.actor;
    case 'distress': return G.cap;
    case 'predict': { const t = G.tasks.find(t => TASKS[t.id].k === 'pred' && t.pn < 0); return t ? t.owner : -1; }
    case 'signal': return G.sig.actor;
    case 'play': return G.trick ? G.trick.turn : -1;
  }
  return -1;
}
// ---- sizes: hand card width, trick card width, drone card width, portrait size (CSS variables) ----
function layoutVars() {
  const bd = $('#bd'); if (!bd) return; const W = bd.clientWidth || 360, H = bd.clientHeight || 600, ph = isPh(), land = ph && GXV.now().w > GXV.now().h;
  let hw = ph ? (land ? Math.max(44, Math.min(48, Math.round(H * .13))) : Math.max(48, Math.min(60, Math.round(H * .092)))) : Math.max(60, Math.min(104, Math.round(H * .125)));
  const np = G ? G.np : 4, opp = np - 1;
  let cw = ph ? Math.max(40, Math.min(56, Math.round(hw * .95))) : Math.max(60, Math.min(124, Math.round(Math.min(H * .165, W * .1))));
  const dw = ph ? Math.max(40, Math.min(46, Math.floor((W - 16) / 7) - 4)) : Math.max(46, Math.min(60, Math.floor((W - 40) / 7) - 6));
  const short = ph && !land && GXV.now().h < 640; document.documentElement.classList.toggle('ph-short', short); if (short) hw = 44;
  const av = ph ? (land || short ? 30 : 34) : 44;
  const r = document.documentElement.style; r.setProperty('--hw', hw + 'px'); r.setProperty('--cw', cw + 'px'); r.setProperty('--dw', dw + 'px'); r.setProperty('--av', av + 'px');
  if (KIT.ART.table && !document.documentElement.style.getPropertyValue('--tableimg')) r.setProperty('--tableimg', 'url("' + KIT.ART.table + '")');
}
// ---- the bar ----
function renderBar() {
  const bs = $('#barstat'); if (!bs) return; bs.innerHTML = '';
  if (G && UI.started) {
    bs.append(h('span', diveLabel() + (UI.mode === 'descent' ? '' : ' · attempt ' + G.att)));
    if (G.distress) bs.append(h('span', { html: KIT.flareSVG({ size: 20, on: true }), title: 'Distress flare is lit' }));
    if (G.clock) { const t = h('span.tm' + (UI.clockLeft != null && UI.clockLeft < 20 ? '.low' : ''), clockText()); t.id = 'clk'; bs.append(t); }
  }
  placePrompt(); placePile();
}
function clockText() { const s = Math.max(0, Math.round(UI.clockLeft != null ? UI.clockLeft : (G ? G.clock : 0))); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function placePrompt() {
  const bp = $('#barprompt'), pr = $('#prompt'); if (!bp || !pr) return;
  if (document.documentElement.classList.contains('ph-p')) { if (pr.parentNode !== bp) bp.appendChild(pr); } else { const pd = $('#promptDock'); if (pd && pr.parentNode !== pd) pd.appendChild(pr); }
}
// Last trick / Won buttons and the "Follow ..." line live in the felt's bottom strip; on a landscape phone they move into the dock so they can never cover a card
function placePile() {
  const pile = $('#pile'), lead = $('#lead'), felt = $('#felt'), dp = $('#dockpile'); if (!pile || !lead || !felt || !dp) return;
  const into = document.documentElement.classList.contains('ph-l') ? dp : felt;
  if (pile.parentNode !== into) { into.appendChild(lead); into.appendChild(pile); }
}
// ---- job chips ----
function jobChip(i, o) {
  o = o || {}; const st = jobSt(i), d = jobDef(i);
  // chips on another diver's panel are plain text (the panel itself is the tap target and opens that diver's jobs); only your own chips are buttons
  const cls = '.jc' + (st > 0 ? '.ok' : st < 0 ? '.bad' : '') + (o.me ? '.me' : '') + (o.opp ? '.opp' : '');
  const b = o.opp ? h('span' + cls, { 'aria-label': jobShort(i) + (st > 0 ? ', done' : st < 0 ? ', failed' : ', open') }) : h('button' + cls, { type: 'button', 'data-a': 'job', 'data-i': i, 'aria-label': jobShort(i) + (st > 0 ? ', done' : st < 0 ? ', failed' : ', open') });
  const sm = h('span.sm'); if (st > 0) sm.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12.5L9.5 18L20 6"/></svg>'; else if (st < 0) sm.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke-linecap="round"><path d="M6 6L18 18M18 6L6 18"/></svg>'; else sm.innerHTML = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3.4" fill="#fff" stroke="none"/></svg>';
  b.append(sm, h('span.t', d.s));
  if (o.me) { const df = h('span.df'); for (let k = 0; k < jobDiff(i); k++) df.append(h('i')); b.append(df); }
  return b;
}
// ---- the other divers (and the drone) ----
function pingTok(s, size) {
  const p = G.players[s]; if (p.helper) return null;
  if (G.comm === 'none') return h('span.tok', { html: KIT.pingSVG({ size, spent: true }), title: 'No signalling in this dive' });
  if (G.comm === 'narc') return null;
  return h('span.tok', { html: KIT.pingSVG({ size, spent: !!p.pingUsed }), title: p.pingUsed ? 'Ping used' : 'Ping ready' });
}
function shownEl(s) {
  const sh = shownBy(s); if (!sh.length) return null;
  if (document.documentElement.classList.contains('ph-short')) {   // small phones: a colour pill ("3 low") instead of a mini card
    const w = h('span.shownw', { style: 'display:flex;gap:3px' });
    sh.slice(0, 2).forEach(p => w.append(h('span.spill', { style: 'background:' + D.suits[suitOf(p.c)].c + ';color:' + (suitOf(p.c) === 3 || suitOf(p.c) === 4 ? '#1b1405' : '#fff'), title: cname(p.c) }, String(valOf(p.c)) + (p.k === 'high' ? '\u25B2' : p.k === 'low' ? '\u25BD' : p.k === 'only' ? '\u25CF' : ''))));
    return w;
  }
  const wrap = h('span.shownw', { style: 'display:flex;gap:3px' });
  sh.slice(0, 3).forEach(p => { const e = h('span.shown', { title: cname(p.c) + (p.k === 'high' ? ' (their highest)' : p.k === 'low' ? ' (their lowest)' : p.k === 'only' ? ' (their only one)' : '') }); e.append(cardN(p.c, 30)); if (p.k) e.append(h('span.mk', { html: KIT.pingSVG({ size: 19, k: p.k }) })); wrap.append(e); });
  return wrap;
}
function oppEl(s, act) {
  const p = G.players[s], won = tricksWon()[s], cm = s === G.cap;
  if (p.helper) return droneEl(s, act);
  const b = h('button.op' + (act === s ? '.act' : ''), { type: 'button', 'data-a': 'seat', 'data-seat': s, 'data-key': 'seat' + s, 'aria-label': p.name + (cm ? ', Commander' : '') + ', ' + p.hand.length + ' cards' });
  const av = h('span.av', { html: avatarS(s, 80) }); if (cm) av.append(h('span.cm', { html: KIT.cmdSVG({ size: 19 }), title: 'Commander' }));
  const top = h('span.top', av, h('span.who', h('span.nm', p.name), h('span.cnt', h('span', h('b', p.hand.length), p.hand.length === 1 ? ' card' : ' cards'), h('span', h('b', won), won === 1 ? ' trick' : ' tricks'))));
  b.append(top);
  const pg = h('span.pg'); const t = pingTok(s, 22); if (t) pg.append(t); const sh = shownEl(s); if (sh) pg.append(sh);
  if (pg.childNodes.length) b.append(pg);
  const js = jobs(s); const jb = h('span.jobs');
  const shown = js.slice(0, 2); shown.forEach(i => jb.append(jobChip(i, { opp: 1 }))); if (js.length > 2) jb.append(h('span.jc.more', '+' + (js.length - 2) + ' more'));
  b.append(jb);
  return b;
}
function droneEl(s, act) {
  const p = G.players[s], v = viewSeat();
  const b = h('div.op.drone' + (act === s ? '.act' : ''), { 'data-seat': s, 'data-key': 'seat' + s });
  const av = h('span.av', { html: avatarS(s, 80) });
  const top = h('span.top', av, h('span.who', h('span.nm', p.name + ' (drone)'), h('span.cnt', h('span', h('b', p.hand.length), ' cards'), h('span', h('b', tricksWon()[s]), tricksWon()[s] === 1 ? ' trick' : ' tricks'))));
  const js = jobs(s); const jb = h('span.jobs', { style: 'flex:1;min-width:0;flex-direction:row;flex-wrap:wrap;gap:3px;margin-left:6px' });
  js.slice(0, 3).forEach(i => { const c = jobChip(i); c.style.width = 'auto'; jb.append(c); }); if (js.length > 3) jb.append(h('span.jc.more', '+' + (js.length - 3)));
  const head = h('div', { style: 'display:flex;align-items:center;gap:4px' }, h('button.op', { type: 'button', 'data-a': 'seat', 'data-seat': s, style: 'flex:0 0 auto;max-width:none;background:transparent;border-color:transparent;padding:0', 'aria-label': 'Drone ' + p.name }, top), jb);
  b.append(head);
  const row = h('div.drow');
  const myTurn = G.phase === 'play' && G.trick.turn === s && G.cap === v && !UI.fz;
  const legal = myTurn ? LD.playable(G, s) : [];
  (p.stacks || []).forEach(st => {
    const top2 = st[0], hasBot = st[1] !== -1;
    const w = h('div.dstack', h('div.dbk' + (hasBot ? '' : '.none')));
    if (top2 >= 0) {
      const can = legal.includes(top2);
      const c = h('button.dc' + (can ? '.can' : (myTurn ? '.dim' : '')) + (UI.sel === top2 ? '.sel' : ''), { type: 'button', 'data-a': 'dcard', 'data-id': top2, 'data-px': 'card', 'data-pk': 'h:' + top2, 'aria-label': cname(top2) + (can ? ', playable' : '') });
      c.append(cardN(top2, 46)); w.append(c);
    }
    row.append(w);
  });
  b.append(row); return b;
}
function renderOpp(v) {
  const box = $('#opp'); box.innerHTML = ''; if (!G) return;
  box.style.setProperty('--jr', String(Math.min(2, Math.max(1, Math.ceil(G.tasks.length / Math.max(1, G.np))))));
  const act = G.phase === 'play' && G.trick ? G.trick.turn : actorSeat();
  const from = v >= 0 ? v : 0;
  for (const s of seatsClockwise(from)) box.append(oppEl(s, act));
}
// ---- the felt: trick slots, the pool of jobs, status lines ----
function slotPos(rel, n, W, H, ch) {
  // rel 0 = the bottom seat (me); seats go clockwise (to the left first). Returns centre in px.
  const th = rel * 2 * Math.PI / n, rx = Math.max(40, W * (n > 4 ? .36 : .31)), ry = Math.max(20, Math.min(H * .27, ch ? (H - ch) / 2 : 999));
  return [W / 2 - Math.sin(th) * rx, H / 2 + (n > 2 ? Math.cos(th) * ry : Math.cos(th) * ry)];
}
function playsShown() { if (UI.fz && UI.fz.plays) return UI.fz.plays; return G && G.phase === 'play' && G.trick ? G.trick.plays : (G && G.phase === 'over' && G.trick ? G.trick.plays : []); }
function renderFelt(v) {
  const felt = $('#felt'), slots = $('#slots'), pool = $('#pool'), txt = $('#felttxt'), lead = $('#lead'), pile = $('#pile'); if (!felt) return;
  slots.innerHTML = ''; pool.innerHTML = ''; lead.innerHTML = ''; pile.innerHTML = '';
  const from = v >= 0 ? v : 0;
  const assign = G.phase === 'assign' || (G.phase === 'distress' && false);
  pool.hidden = !assign || !G.tasks.some(t => t.owner < 0); slots.hidden = assign && !pool.hidden;
  // status line
  let line = '';
  if (assign) { const n = G.tasks.filter(t => t.owner < 0).length; line = n + ' job' + (n === 1 ? '' : 's') + ' left to hand out · every job must be done'; }
  else if (G.phase === 'play' || G.phase === 'signal') { const nd = G.tasks.filter((t, i) => jobSt(i) > 0).length; line = 'Trick ' + Math.min(G.ntr, G.tricks.length + 1) + ' of ' + G.ntr + ' · jobs done ' + nd + ' of ' + G.tasks.length + (G.phase === 'signal' ? ' · signal round' : ''); }
  else if (G.phase === 'distress') line = 'The jobs are taken. Before the dive: the distress flare';
  else if (G.phase === 'pass') line = 'Everyone passes one card';
  else if (G.phase === 'predict') line = 'Predictions';
  else if (G.phase === 'over') line = G.result && G.result.ok ? 'Dive complete' : 'Dive failed';
  txt.textContent = line;
  if (!pool.hidden) {
    G.tasks.forEach((t, i) => {
      if (t.owner >= 0) return; const d = TASKS[t.id], mineTurn = iMustAct() && G.phase === 'assign';
      const c = h('button.jcard' + (UI.job === i ? '.sel' : '') + (mineTurn ? '' : '.off'), { type: 'button', 'data-a': 'pool', 'data-i': i, 'data-key': 'job' + i, 'aria-pressed': UI.job === i ? 'true' : 'false' });
      const dd = h('span.dd', { title: 'How hard the job is (dots). The jobs on the table add up to the dive\'s difficulty.' }, 'Difficulty ', ...Array.from({ length: jobDiff(i) }, () => h('i')));
      c.append(h('b', d.s), h('span', d.t), dd);
      if (!d.cap) c.append(h('span', { style: 'font-weight:800;color:#8a3a10' }, 'Not for the Commander'));
      pool.append(c);
    });
    return renderLead(lead, pile, v);
  }
  const W = felt.clientWidth || 300, H = felt.clientHeight || 160, n = G.np;
  const shown = playsShown(), act = G.phase === 'play' && G.trick && !UI.fz ? G.trick.turn : -1;
  const winS = UI.fz && UI.fz.winner != null && UI.fz.win ? UI.fz.winner : -1;
  const small = document.documentElement.classList.contains('ph-short'), strip = (isPh() && GXV.now().w > GXV.now().h) || small ? 0 : 46, top = (small ? 26 : 20) + (G.boss && G.phase !== 'assign' ? 46 : 0);   // a boss bar takes the felt's top band   // small phones: Last trick sits in the felt's top corner, not in a bottom strip   // the bottom strip holds Last trick / Won (never over a played card)
  for (let rel = 0; rel < n; rel++) {
    const s = (from + rel) % n; const [x, y0] = slotPos(rel, n, W, Math.max(60, H - strip - top), (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cw')) || 56) * 1.4 + 4), y = y0 + top;
    const slot = h('div.tslot' + (act === s ? '.turn' : '') + (winS === s ? '.win' : ''), { 'data-seat': s, style: 'left:' + x + 'px;top:' + y + 'px' });
    const pl = shown.find(p => p.s === s);
    if (pl) { const tc = h('div.tc', { 'data-px': 'card', 'data-id': pl.c, 'data-pk': 't:' + pl.c, 'data-seat': s, role: 'img', 'aria-label': pname(s) + ' played ' + cname(pl.c) }); tc.append(cardN(pl.c, 80)); slot.append(tc); }
    slots.append(slot);
  }
  renderLead(lead, pile, v);
}
function renderLead(lead, pile, v) {
  if (G.phase === 'play' && G.trick && G.trick.plays.length) { const ls = G.trick.ls; lead.append(h('span', { html: KIT.emblemSVG(ls, 22) }), h('span', ls === 4 ? 'Lanterns led: follow with a Lantern' : 'Follow ' + D.suits[ls].name)); }
  else if (G.phase === 'play' && G.trick) { lead.append(h('span', pname(G.trick.turn) === 'You' ? 'You lead' : pname(G.trick.turn) + ' leads')); }
  if (G.tricks.length) pile.append(h('button.pbtn', { type: 'button', 'data-a': 'last' }, 'Last trick'));
}
// ---- my seat and my jobs ----
function renderMine(v) {
  const box = $('#mine'); box.innerHTML = ''; if (!G) return;
  const s = v >= 0 ? v : 0, p = G.players[s], act = (G.phase === 'play' && G.trick ? G.trick.turn : actorSeat()), cm = s === G.cap;
  const me = h('button.me' + (act === s ? '.act' : ''), { type: 'button', 'data-a': 'seat', 'data-seat': s, 'data-key': 'seat' + s, 'aria-label': 'Your seat' });
  const av = h('span.av', { html: avatarS(s, 80) }); if (cm) av.append(h('span.cm', { html: KIT.cmdSVG({ size: 18 }) }));
  me.append(av, h('span.who', h('span.nm', v >= 0 && (UI.mode !== 'hot' && !NET.on) ? 'You' : p.name), h('span.cnt', tricksWon()[s] + (tricksWon()[s] === 1 ? ' trick' : ' tricks'))));
  box.append(me);
  const t = pingTok(s, 30); if (t) box.append(t);
  if (G.comm === 'narc') box.append(h('span.pbtn', { style: 'cursor:default' }, 'Pool ' + G.pool));
  const mj = h('div.mjobs'); const js = jobs(s);
  if (!js.length && G.phase !== 'assign') mj.append(h('span.sm', 'No jobs for you: help the others.'));
  js.forEach(i => mj.append(jobChip(i, { me: true })));
  if (G.two && G.cap === s) { const hj = jobs(G.helper); hj.forEach(i => { const c = jobChip(i, { me: true }); c.prepend(h('span', { style: 'font-size:12px;opacity:.75' }, 'Drone:')); mj.append(c); }); }
  box.append(mj);
}
// ---- my hand ----
function legalCards(v) {
  if (v < 0 || !G || UI.busy) return null;
  const ph = G.phase;
  if (ph === 'play' && G.trick && ctlSeat(G.trick.turn) === v && !UI.pingSel) { const own = !G.players[G.trick.turn].helper; const t1 = tutOnly(); if (own && t1 >= 0) return new Set([t1]); return own ? new Set(LD.playable(G, G.trick.turn)) : new Set(); }
  if (UI.pingSel) return new Set(LD.pingMoves(G, v).map(m => m.c));
  if (ph === 'pass' && LD.moves(G, v).length) return new Set(LD.moves(G, v).map(m => m.c));
  return null;
}
const ctlSeat = s => G.players[s].helper ? G.cap : s;
function renderHand(v) {
  const box = $('#hand'); box.innerHTML = ''; box.style.height = ''; box.style.minHeight = ''; box.classList.remove('two'); if (!G) return;
  if (v < 0 || (hotSeat() && UI.holder < 0)) { box.append(h('div.handnote', G.phase === 'over' ? 'The dive is over.' : (watching() ? 'Watching the computer divers.' : 'Waiting for the next diver to take the device.'))); return; }
  const hand = G.players[v].hand; if (!hand.length) { box.append(h('div.handnote', G.phase === 'over' ? '' : 'No cards left.')); return; }
  const legal = legalCards(v), pinged = new Set(G.pings.filter(p => p.seat === v && !G.pl[p.c]).map(p => p.c)); const pk = new Map(G.pings.filter(p => p.seat === v).map(p => [p.c, p.k]));
  // the card(s) that came to me in the distress pass: the difference between my hand while passing and my hand afterwards
  if (G.phase === 'pass') UI.passSnap = { key: G.seed + ':' + G.att + ':' + v, hand: hand.slice() };
  let got = new Set(); if (UI.passSnap && UI.passSnap.key === G.seed + ':' + G.att + ':' + v && G.phase !== 'pass' && G.phase !== 'assign' && G.phase !== 'distress' && !G.tricks.length && !(G.trick && G.trick.plays.some(p => p.s === v))) got = new Set(hand.filter(c => !UI.passSnap.hand.includes(c)));
  const btns = [];
  hand.forEach((c, i) => {
    const dim = legal && !legal.has(c);
    const cls = 'hc' + (UI.sel === c ? '.sel' : '') + (dim ? '.dim' : '') + (pinged.has(c) ? '.pinged' : '') + (UI.pingSel && legal && legal.has(c) ? '.pk' : '') + (UI.giveSel === c ? '.sel' : '') + (got.has(c) ? '.got' : '');
    const b = h('button.' + cls.split('.').filter(Boolean).join('.'), { type: 'button', 'data-a': 'hcard', 'data-id': c, 'data-px': 'card', 'data-pk': 'h:' + c, 'aria-label': cname(c) + (dim ? ', not allowed now' : '') + (pinged.has(c) ? ', shown to the team' : '') + (got.has(c) ? ', you got this card in the flare pass' : ''), 'aria-pressed': UI.sel === c ? 'true' : 'false' });
    b.append(cardN(c, 84));
    if (pinged.has(c)) b.append(h('span.rm', { html: KIT.pingSVG({ size: 26, k: pk.get(c) }), title: 'You showed this card' }));
    if (got.has(c)) b.append(h('span.gotb', 'New'));
    btns.push(b);
  });
  // Layout (absolute): one row when every card keeps >= 44 px (and >= 55 % of its width) visible, else two rows. A tap in the middle of a card always lands on that card.
  const hw = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hw')) || 60, W = Math.max(200, box.clientWidth - 12), n = hand.length, ch = hw * 1.4;
  const need = Math.max(44, hw * .55), maxP = hw * 1.04;
  const pitchFor = m => m > 1 ? Math.min(maxP, (W - hw) / (m - 1)) : 0;
  const rows = n > 1 && pitchFor(n) < need && n >= 7 ? 2 : 1, per = rows === 2 ? Math.ceil(n / 2) : n, pitch = pitchFor(per);
  const rowStep = Math.round(ch * .64), padTop = document.documentElement.classList.contains('ph-short') ? 14 : 20;
  box.classList.toggle('two', rows === 2); box.style.setProperty('--rs', rowStep + 'px');
  box.style.height = Math.round(padTop + ch + (rows === 2 ? rowStep : 0) + 4) + 'px'; box.style.minHeight = box.style.height;
  btns.forEach((b, i) => {
    const r = rows === 2 && i >= per ? 1 : 0, k = r ? i - per : i, m = r ? n - per : per;
    const rowW = hw + (m - 1) * pitch, x = Math.round((box.clientWidth - rowW) / 2 + k * pitch), y = padTop + r * rowStep;
    if (r) b.classList.add('r2'); b.style.left = x + 'px'; b.style.top = y + 'px'; b.style.zIndex = String(1 + i); box.append(b);
  });
  box.dataset.rows = rows; box.dataset.pitch = Math.round(pitch);
  if (UI.sel >= 0) { const sb = box.querySelector('.hc.sel'); if (sb) sb.style.zIndex = '40'; }
}
// ---- the dock: what to do now ----
function dockModel(v) {
  const ph = G.phase, mv = v >= 0 ? LD.moves(G, v) : [], must = iMustAct(), M = { p: '', sub: '', info: '', acts: [], cls: '' };
  const act = actorSeat(), who = act >= 0 ? pname(act) : '';
  const btn = (label, a, o) => M.acts.push(Object.assign({ label, a }, o || {}));
  if (!G) return M;
  if (ph === 'over') { M.p = G.result && G.result.ok ? 'Dive complete!' : 'The dive failed.'; M.sub = G.result ? G.result.why : ''; btn('Result', 'result'); return M; }
  if (UI.busy) { M.p = 'The cards move…'; return M; }
  if (hotSeat() && UI.holder < 0 && G.phase !== 'distress') { M.p = 'Pass the device on.'; return M; }
  switch (ph) {
    case 'assign': {
      const A = G.as; const left = G.tasks.filter(t => t.owner < 0).length;
      if (A.mode === 'vote') {
        if (must && mv.length) { M.p = 'Vote: which diver takes every job?'; M.sub = 'No talk about cards. A tie goes to the Commander\'s vote.'; M.cls = 'mine'; G.players.filter(p => !p.helper).forEach(p => btn(p.seat === v && p.name !== 'You' ? p.name + ' (you)' : p.name, 'vote', { f: p.seat })); }
        else { M.p = 'Waiting for the other votes…'; }
        return M;
      }
      if (!must || !mv.length) { M.p = who ? who + (A.mode === 'cmd' && A.stage === 'ask' ? ' is deciding whether to take every job…' : ' is choosing…') : 'Handing out the jobs…'; M.sub = left + ' job' + (left === 1 ? '' : 's') + ' left'; return M; }
      M.cls = 'mine';
      if (A.mode === 'cmd') {
        if (A.stage === 'keep') { M.p = 'Commander\'s call: keep every job, or offer them?'; M.sub = 'If you offer them, a willing diver takes all of them and all signalling happens before the first trick.'; if (mv.some(m => m.t === 'keep')) btn('Keep every job', 'keep', { cls: 'go' }); btn('Offer them to the team', 'offer'); }
        else { M.p = 'Will you take every job?'; btn('Yes, I take them', 'accept', { cls: 'go' }); btn('No', 'decline', { cls: 'alt' }); }
        return M;
      }
      if (A.mode === 'vol') { M.p = A.need === 1 ? 'Will you take every job? Answer yes or no only.' : 'Will you volunteer to take the jobs with another diver? Yes or no only.'; btn('Yes', 'yes', { cls: 'go' }); if (mv.some(m => m.t === 'no')) btn('No', 'no', { cls: 'alt' }); else M.sub = 'You are the last one: you have to say yes.'; return M; }
      if (A.mode === 'free') { M.p = 'Open briefing: take the jobs you want, then press Done.'; M.sub = 'Talk about jobs, never about cards.'; }
      else if (A.mode === 'hardfirst') { M.p = 'The Commander takes the most difficult job first.'; }
      else if (A.mode === 'split') { M.p = 'Share the jobs with your partner (at least one each).'; }
      else { M.p = act === v || (G.players[act] && G.players[act].helper) ? (G.players[act].helper ? 'Pick a job for the drone.' : 'Your turn: pick a job.') : 'Pick a job.'; M.sub = left + ' job' + (left === 1 ? '' : 's') + ' left. Tap a job card on the table.'; }
      const sel = UI.job >= 0 && G.tasks[UI.job] && G.tasks[UI.job].owner < 0 ? UI.job : -1;
      if (sel >= 0) { const ok = mv.find(m => m.t === 'take' && m.i === sel); M.info = '<b>' + esc(jobShort(sel)) + '</b>: ' + esc(jobText(sel)) + ' Difficulty ' + jobDiff(sel) + '.' + (ok ? '' : !TASKS[G.tasks[sel].id].cap && act === G.cap ? ' The Commander may not take this job.' : ' You cannot take this one.'); btn('Take this job', 'take', { i: sel, cls: 'go', dis: !ok }); }
      else if (mv.some(m => m.t === 'take')) btn('Take this job', 'take', { dis: true, cls: 'go' });
      if (mv.some(m => m.t === 'pass')) btn('Pass', 'pass', { cls: 'alt' });
      if (mv.some(m => m.t === 'done')) btn('Done', 'done', { cls: 'alt' });
      return M;
    }
    case 'distress': {
      if (!must) { M.p = (who === 'You' ? 'You' : 'The Commander, ' + who) + ' decides about the flare…'; M.sub = 'If it is lit, every diver passes one card. Nobody else has to choose yet.'; return M; }
      M.cls = 'mine'; const lit = G.distress;
      M.p = lit ? 'Pass cards again this attempt?' : 'Light the distress flare?'; M.sub = lit ? 'The flare stays lit until the dive is won.' : 'Every diver passes one card (not a Lantern). The dive then counts one extra attempt.';
      btn(lit ? 'No passing' : 'No flare', 'dist', { on: false, cls: 'alt' });
      M.eq = 1;
      const two = G.hn === 2; if (two) btn(lit ? 'Pass a card' : 'Light the flare', 'dist', { on: true, dir: 1, cls: 'alt' });
      else { btn('Pass left', 'dist', { on: true, dir: 1, cls: 'alt' }); btn('Pass right', 'dist', { on: true, dir: -1, cls: 'alt' }); }
      return M;
    }
    case 'pass': {
      if (!must || !mv.length) { M.p = 'Waiting for the others to pass a card…'; return M; }
      M.cls = 'mine'; const dir = G.pass.dir; M.p = 'Pick a card to pass ' + (G.hn === 2 ? 'to your partner.' : (dir > 0 ? 'to your left.' : 'to your right.')); M.sub = 'Lanterns cannot be passed.';
      const sel = UI.giveSel >= 0 && mv.some(m => m.c === UI.giveSel) ? UI.giveSel : -1;
      btn(sel >= 0 ? 'Pass ' + cname(sel) : 'Pass the card', 'give', { c: sel, dis: sel < 0, cls: 'go' }); return M;
    }
    case 'predict': {
      if (!must || !mv.length) { M.p = who + ' is predicting their tricks…'; return M; }
      M.cls = 'mine'; const o = G.tasks[mv[0].i], open = TASKS[o.id].open; M.p = (G.players[o.owner].helper ? 'Predict the drone\'s tricks' : 'How many tricks will you win?'); M.sub = open ? 'Everybody will see your number.' : 'Your number stays secret until the end.';
      mv.forEach(m => btn(String(m.n), 'predict', { n: m.n, i: m.i, cls: UI.predN === m.n ? 'go' : 'alt' })); return M;
    }
    case 'signal': {
      if (!must) { M.p = who + ' may signal…'; M.sub = 'Signal round: each diver can show a card or skip.'; return M; }
      M.cls = 'mine'; { const again = G.sig && G.pings.some(p => p.n === G.tricks.length && p.seat !== v); M.p = again ? 'Someone just signalled. Signal now, or skip again?' : 'Signal: show a card, or skip.'; M.sub = again ? 'The signal round goes on until everyone skips in a row.' : 'Show your highest, lowest or only card of a colour. Once per dive.'; }
      const pm = mv.filter(m => m.t === 'ping');
      if (UI.pingSel) { const sel = UI.sel >= 0 ? pm.find(m => m.c === UI.sel) : null; M.p = sel ? 'Show ' + cname(sel.c) + (sel.k === 'high' ? ' as your highest?' : sel.k === 'low' ? ' as your lowest?' : sel.k === 'only' ? ' as your only one?' : '?') : 'Tap the card you want to show.'; M.sub = 'The green-ringed cards can be shown.'; btn(sel ? 'Show it' : 'Show the card', 'doping', { dis: !sel, cls: 'go' }); btn('Cancel', 'noping', { cls: 'alt' }); }
      else { if (pm.length) btn('Signal…', 'signal', { cls: 'go' }); btn('No signal', 'nosig', { cls: pm.length ? 'alt' : 'go' }); }
      return M;
    }
    case 'play': {
      const T = G.trick, turn = T.turn, helper = G.players[turn].helper, ctl2 = ctlSeat(turn);
      const myTurn = v >= 0 && ctl2 === v;
      const pm = mv.filter(m => m.t === 'ping');
      if (UI.pingSel && pm.length) { const sel = UI.sel >= 0 ? pm.find(m => m.c === UI.sel) : null; M.cls = 'mine'; M.p = sel ? 'Show ' + cname(sel.c) + (sel.k === 'high' ? ' as your highest?' : sel.k === 'low' ? ' as your lowest?' : sel.k === 'only' ? ' as your only one?' : '?') : 'Tap the card you want to show.'; M.sub = 'Signals happen between tricks. The green-ringed cards can be shown.'; btn(sel ? 'Show it' : 'Show the card', 'doping', { dis: !sel, cls: 'go' }); btn('Cancel', 'noping', { cls: 'alt' }); return M; }
      if (myTurn) {
        M.cls = 'mine';
        const sel = UI.sel >= 0 ? UI.sel : -1; const legal = helper ? new Set(LD.playable(G, turn)) : new Set(LD.playable(G, turn));
        M.p = helper ? 'You fly ' + pname(turn) + ': tap one of its face-up cards.' : (T.plays.length ? 'Your turn: play a card.' : 'You lead: play any card.');
        M.sub = T.plays.length ? (T.ls === 4 ? 'Follow with a Lantern if you can.' : 'Follow ' + D.suits[T.ls].name + ' if you can. With no ' + D.suits[T.ls].name + ' left you may play anything, and a Lantern would win.') : '';
        { const k = G.seed + ':' + G.logN + ':' + G.att + ':' + G.tricks.length + ':' + T.plays.length + ':' + v; if (UI.abk !== k) { UI.abk = k; let r = null; try { r = LD.AI.allBreak(G, v); } catch (e) { } UI.ab = r; }
          if (UI.ab) { const j = UI.ab.job; M.p = 'Careful: every card you can play breaks ' + (j >= 0 ? 'a job.' : 'the dive rule.'); M.sub = j >= 0 ? 'Whatever you play, \u201c' + TASKS[G.tasks[j].id].t.replace(/\.$/, '') + '\u201d will fail. Try Hint to see the least bad card.' : 'Whatever you play, the dive rule is broken.'; M.warn = 1; } }
        if (UI.hint && UI.hint.c != null) M.info = '<b>Suggestion: ' + esc(cname(UI.hint.c)) + '.</b> ' + esc(UI.hint.why || '');
        btn(sel >= 0 && legal.has(sel) ? 'Play ' + cname(sel) : 'Play the card', 'playcard', { c: sel, dis: !(sel >= 0 && legal.has(sel)), cls: 'go' });
        if (pm.length) btn('Signal…', 'signal', { cls: 'alt' });
        btn('Hint', 'hint', { cls: 'alt' });
      } else {
        M.p = who ? who + (G.players[turn].ai ? ' is thinking…' : ' to play.') : ''; M.sub = T.plays.length ? 'Following ' + (T.ls === 4 ? 'Lanterns' : D.suits[T.ls].name) + '.' : '';
        if (pm.length) btn('Signal…', 'signal', { cls: 'alt' });
      }
      return M;
    }
  }
  return M;
}
function renderDock(v) {
  const pr = $('#prompt'), ac = $('#acts'), inf = $('#info'), ro = $('#roster'); if (!pr) return;
  const M = dockModel(v); pr.className = M.cls || '';
  pr.innerHTML = ''; pr.append(M.p || ''); const ps = $('#psub'), phn = isPh(); if (M.sub && !phn) pr.append(h('small', M.sub)); if (ps) { ps.innerHTML = ''; ps.hidden = !(phn && M.sub); if (phn && M.sub) ps.textContent = M.sub; }
  { const nw = $('#news'); if (nw) { const L = (UI.news || []).slice(isPh() ? -1 : -3); nw.innerHTML = ''; nw.hidden = !L.length || G.phase === 'over' || (isPh() && !!(UI.hint && UI.hint.c != null && G.phase === 'play' && iMustAct())); L.forEach((t, k) => nw.append(h('div' + (k === L.length - 1 ? '.nw1' : ''), t))); } }
  inf.hidden = !M.info; inf.className = M.info ? 'why' : ''; inf.innerHTML = M.info || '';
  ac.classList.toggle('many', M.acts.length > 6); ac.innerHTML = ''; M.acts.forEach(a => { const b = h('button.btn' + (a.cls ? '.' + a.cls : '') + (a.dis ? '.dis' : ''), { type: 'button', 'data-a': a.a, disabled: a.dis ? true : null }, a.label); for (const k of ['c', 'i', 'n', 'f', 'on', 'dir']) if (a[k] !== undefined) b.dataset[k] = a[k]; ac.append(b); });
  // who is still deciding (simultaneous phases)
  ro.innerHTML = ''; if (G.phase === 'pass' || (G.phase === 'assign' && G.as.mode === 'vote')) { const pend = new Set(LD.pending(G)); G.players.filter(p => !p.helper).forEach(p => ro.append(h('span.rchip' + (pend.has(p.seat) ? '.w' : '.r'), { html: avatarS(p.seat, 48) }, p.name + (pend.has(p.seat) ? ' …' : ' ✓')))); }
  { const fe = $('#felt'); if (fe) fe.classList.toggle('roston', ro.childNodes.length > 0); }
  // desktop: the dock lists every job (who has it, done / failed / open) instead of sitting empty
  const js = $('#jobsum'); if (js) { js.innerHTML = ''; js.hidden = isPh() || !G.tasks.length; if (!js.hidden) {
    js.append(h('div.jsh', 'All jobs' + (G.mission.d ? ' · difficulty ' + G.mission.d : '')));
    G.tasks.forEach((t, i) => { const st = jobSt(i), own = t.owner; js.append(h('button.jsr' + (st > 0 ? '.ok' : st < 0 ? '.bad' : ''), { type: 'button', 'data-a': 'job', 'data-i': i, 'aria-label': jobShort(i) },
      h('span.jav', { html: own >= 0 ? avatarS(own, 48) : '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="none" stroke="#b9d2ee" stroke-width="2" stroke-dasharray="3 3"/></svg>' }),
      h('span.jtx', h('b', own >= 0 ? pname(own) : 'On the table'), h('span', TASKS[t.id].t)),
      h('span.jst', { html: st > 0 ? KIT.iconSVG('tick', 22) : st < 0 ? KIT.iconSVG('cross', 22) : '' }))); }); } }
  const dt = document.querySelector('.gx-dt'); if (dt) dt.textContent = M.cls === 'mine' ? 'Your turn' : 'What is happening';
  const bp = $('#barprompt'); if (bp && !bp.contains(pr)) { /* desktop: prompt stays in the dock */ }
  renderTip();
}
function renderTip() {
  const t = $('#tip'); if (!t) return; t.innerHTML = ''; document.documentElement.classList.toggle('tipon', !!UI.tip);
  if (!UI.tip) return;
  const c = h('div.tipcard', h('div.th', h('b', UI.tip.title), h('button.btn.small', { type: 'button', 'data-a': 'tipok' }, UI.tip.btn || 'Got it')), h('p', UI.tip.body));
  t.append(c);
}
function render() {
  if (!G || !UI.started) return;
  layoutVars();
  const v = viewSeat();
  renderBar(); renderOpp(v); renderFelt(v); try { bossBar(); } catch (e) { console.error(e); } renderMine(v); renderHand(v); renderDock(v);
  try { netRenderHook(); } catch (e) { }
  try { pxDirty(); } catch (e) { }
  const rg = $('#start'); if (rg && !rg.hidden && UI.started && !NET.on) { /* start screen closes in newGame */ }
}
// ===================== part 3: game flow (new game, AI driver, human actions, event sequences, hot-seat, save) =====================
function lvAt(opt, k) { const a = opt.lv || DEF.lv; return a[Math.max(0, Math.min(3, k))] || opt.level || 'normal'; }
// which divers sit at the table: seat 0 is you (portrait YOU), the others are companions 0..3 chosen on the setup screen
function chefsFor(np, opt) {
  const pick = Array.isArray(opt.seats) ? opt.seats.filter((c, i, a) => c >= 0 && c <= 3 && a.indexOf(c) === i) : [];
  const n = Math.max(1, np - 1); if (pick.length >= n) return [YOU].concat(pick.slice(0, n));
  const out = [YOU].concat(pick); for (let c = 0; c <= 3 && out.length < np; c++) if (out.indexOf(c) < 0) out.push(c);
  return out;
}
function missionFrom(opt) {
  if (opt.kind === 'free') return { kind: 'free', d: opt.d, cmt: opt.cmt };
  if (opt.kind === 'job') return { kind: 'free', d: 1, jobs: [Math.max(1, Math.min(96, opt.job | 0 || 1)) - 1] };
  if (opt.kind === 'deep') return { kind: 'deep', level: opt.deep };
  return { kind: 'log', id: Math.max(1, Math.min(32, opt.mission | 0 || 1)) };
}
function resetUI(mode, cfg) {
  clearTimeout(UI.tm); UI.seq++; UI.rq = [];
  Object.assign(UI, { started: true, mode, cfg, holder: -1, sel: -1, job: -1, pingSel: false, giveSel: -1, pop: null, cards: [], fz: null, busy: false, over: null, overShown: false, enter: 'deal', hint: null, why: '', predN: -1, tip: null, evN: G.evN, clockLeft: G.clock || null, timerAt: 0 });
  const st = $('#start'); if (st) st.hidden = true; const rs = $('#rs'); if (rs) { rs.hidden = true; rs.innerHTML = ''; } const pa = $('#pass'); if (pa) { pa.hidden = true; pa.innerHTML = ''; }
  try { GX.close(); } catch (e) { } closePop(); const pc = $('#pc'); if (pc) { pc.hidden = true; pc.innerHTML = ''; }
}
function newGame(mode, o) {
  o = o || {};
  const opt = Object.assign({}, DEF, UI.opt || {}, o);
  let np = Math.max(2, Math.min(5, opt.np | 0 || 4)), names = [], ai = [];
  if (mode === 'guided') { np = 3; opt.kind = 'log'; opt.mission = 1; }
  if (mode === 'net') { np = opt.np; names = opt.players.map(p => p.name); ai = opt.players.map(p => p.ai || null); }
  const chefs = mode === 'net' ? null : chefsFor(np, opt);
  if (mode !== 'net') for (let i = 0; i < np; i++) {
    const c = chefs[i], lv = c !== YOU ? lvAt(opt, c) : (opt.level || 'normal');
    if (mode === 'hot') { names.push(i === 0 ? 'Diver 1' : 'Diver ' + (i + 1)); ai.push(null); }
    else if (mode === 'ai') { names.push(D.names[c]); ai.push(lv); }
    else if (i === 0) { names.push('You'); ai.push(null); }
    else { names.push(D.names[c]); ai.push(mode === 'guided' ? 'normal' : lv); }
  }
  UI.chefs = chefs;
  let mission = mode === 'net' ? (opt.mission && typeof opt.mission === 'object' ? opt.mission : missionFrom(opt)) : missionFrom(opt);
  const seed = UI.seed != null ? UI.seed : (Date.now() ^ (Math.random() * 1e9)) | 0;
  let tries = 0;
  // the guided first dive is a fixed, stacked deal that cannot be lost: you hold the Commander's Lantern 4 AND the Lantern 3, the job is to win the Lantern 3
  const gs = mode === 'guided' ? guidedStack() : null;
  G = LD.newGame({ players: np, seed, names, ai, mission, timer: !!opt.timer, stack: gs, boss: mode === 'descent' ? opt.boss || null : null });
  G.noProg = mission.kind !== 'log' && mission.kind !== 'deep';
  resetUI(mode, { np, level: opt.level, lv: (opt.lv || DEF.lv).slice(), seats: chefs ? chefs.slice(1) : null, kind: opt.kind, mission: opt.mission, d: opt.d, cmt: opt.cmt, deep: opt.deep, job: opt.job, timer: !!opt.timer });
  UI.news = [];
  UI.coach = { level: mode === 'guided' ? 'full' : (UI.prefs.guide === 'light' ? 'light' : UI.prefs.guide === 'off' ? 'off' : 'light'), seen: {}, keep: false };
  if (mode === 'guided') UI.coach.level = 'off'; // Mara's dialogs teach the training dive (ui8.js)
  UI.said = {}; UI.dlg = null; try { drawDlg(); } catch (e) { }
  placePrompt(); render(); sndMusic(); autosave(); schedule();
}
function guidedStack() {
  const L = { C: 0, T: 1, K: 2, S: 3, L: 4 }, h = t => t.split(' ').map(x => D.card(L[x[0]], +x.slice(1)));
  return { tasks: D.guided.tasks.slice(), hands: D.guided.hands.map(h), nopass: true };
}
function nextAttempt(same) {
  if (!G || G.phase !== 'over') return;
  const fresh = !same;
  LD.nextAttempt(G, { same: !fresh });
  const keep = { mode: UI.mode, cfg: UI.cfg };
  clearTimeout(UI.tm); UI.seq++; UI.rq = [];
  Object.assign(UI, { holder: -1, sel: -1, job: -1, pingSel: false, giveSel: -1, pop: null, cards: [], fz: null, busy: false, over: null, overShown: false, enter: 'deal', hint: null, predN: -1, tip: null, evN: G.evN, clockLeft: G.clock || null, timerAt: 0 });
  const rs = $('#rs'); if (rs) { rs.hidden = true; rs.innerHTML = ''; } UI.rsOpen = false;
  closePop(); render(); sndMusic(); autosave(); if (NET.on && isHost()) netPush(true); schedule();
}
// ---------- the turn driver ----------
function aiWants() {
  if (!G || G.phase === 'over') return false;
  for (const s of LD.pending(G)) if (G.players[s].ai) return true;
  if (G.phase === 'play' && G.trick.plays.length === 0) for (const p of G.players) if (p.ai && !p.helper && LD.canPing(G, p.seat) && LD.AI.pingChoice(G, p.seat)) return true;
  return false;
}
function schedule() {
  clearTimeout(UI.tm);
  if (!G || !UI.started) return;
  if (G.phase === 'over') { if (!UI.busy && !UI.overShown) showResult(); return; }
  if (UI.busy) return;
  if (isClient()) { try { coachCheck(); } catch (e) { } return; }
  if (UI.cards.length) return;
  if (UI.tip && UI.mode === 'guided') return;
  try { if (storyCheck()) return; } catch (e) { console.error(e); }
  if (G.clock && G.clockRun && UI.timerAt === 0) { UI.timerAt = Date.now(); UI.clockLeft = G.clock; startClock(); }
  if (aiWants()) {
    const d = AIDELAY <= 0 ? 0 : Math.round(AIDELAY * (.25 + .6 * Math.random()));
    const tok = UI.seq; UI.tm = setTimeout(() => { if (tok === UI.seq) aiTurn(); }, d); return;
  }
  if (hotSeat()) hotNext();
  try { coachCheck(); } catch (e) { console.error(e); }
}
function aiTurn() {
  if (!G || UI.busy || G.phase === 'over') return;
  let ok = false; try { ok = LD.AI.step(G); } catch (e) { console.error(e); }
  if (!ok) { schedule(); return; }
  afterApply(G.events.slice());
}
function commit(seat, mv) {
  if (!G || G.phase === 'over') return false;
  const r = LD.apply(G, seat, mv);
  if (!r.ok) { snd('error'); toast(r.error || 'That did not work.'); return false; }
  const evs = G.events.slice(); const v = viewSeat();
  if (seat === v) { UI.sel = -1; UI.job = -1; UI.pingSel = false; UI.giveSel = -1; UI.hint = null; UI.predN = -1; }
  if (hotSeat()) { const nx = LD.pending(G).filter(s => !G.players[s].ai); if (!nx.includes(UI.holder)) UI.holder = -1; }
  afterApply(evs); return true;
}
const ANIM_EV = new Set(['play', 'trick', 'swap', 'take', 'ping', 'deal', 'over', 'job']);
function afterApply(evs) {
  if (NET.on && isHost()) { try { netRecord(evs); netPush(); } catch (e) { console.error(e); } }
  autosave();
  if (evs.some(e => e.t === 'play' || e.t === 'trick' || e.t === 'swap' || e.t === 'take' || e.t === 'ping')) { playEvs(evs); return; }
  if (evs.some(e => e.t === 'over')) { playEvs(evs); return; }
  render(); schedule();
}
// ---------- human actions ----------
function doMove(mv) {
  const v = viewSeat(); if (v < 0) return false;
  if (UI.tip) { markSeen(UI.tip.id); UI.tip = null; renderTip(); } // acting answers the tip
  if (isClient()) { netAct(mv); UI.sel = -1; UI.pingSel = false; UI.giveSel = -1; UI.job = -1; render(); return true; }
  return commit(v, mv);
}
function pickMove(pred) { return myMoves().find(pred); }
function tapHand(id) {
  if (!canAct()) { if (G && !isOver()) toast(UI.busy ? 'One moment…' : 'Wait for your turn.'); return; }
  const v = viewSeat(), ph = G.phase;
  if (UI.pingSel) { const ok = LD.pingMoves(G, v).some(m => m.c === id); if (!ok) { snd('error'); toast('That card cannot be shown: pick your highest, lowest or only card of a colour.'); return; } UI.sel = UI.sel === id ? -1 : id; snd('click'); render(); return; }
  if (ph === 'pass') { const ok = myMoves().some(m => m.t === 'give' && m.c === id); if (!ok) { snd('error'); toast('Lanterns cannot be passed.'); return; } UI.giveSel = UI.giveSel === id ? -1 : id; snd('click'); render(); return; }
  if (ph === 'play') {
    const T = G.trick, turn = T.turn;
    if (ctlSeat(turn) !== v || G.players[turn].helper) { toast(G.players[turn].helper ? 'Tap the drone\'s cards to play for it.' : 'Wait for ' + pname(turn) + '.'); return; }
    const legal = LD.playable(G, turn); if (!legal.includes(id)) { snd('error'); const ls = T.ls; toast(T.plays.length ? 'You must follow ' + (ls === 4 ? 'the Lantern lead' : D.suits[ls].name) + ' if you can.' : 'That card cannot lead now.'); return; }
    if (tutOnly() >= 0 && id !== tutOnly()) { snd('error'); toast('Mara: lead the glowing ' + cname(tutOnly()) + ' this time.'); return; }
    if (UI.sel === id) { playSel(); return; }
    UI.sel = id; UI.hint = null; snd('click', { vol: .4 }); render(); return;
  }
  toast('You cannot play a card right now.');
}
function tapDrone(id) {
  if (!canAct() || G.phase !== 'play') return; const T = G.trick, turn = T.turn, v = viewSeat();
  if (!G.players[turn].helper || ctlSeat(turn) !== v) { toast('It is not the drone\'s turn.'); return; }
  if (!LD.playable(G, turn).includes(id)) { snd('error'); toast('The drone must follow ' + (T.ls === 4 ? 'the Lantern lead' : D.suits[T.ls].name) + '.'); return; }
  if (UI.sel === id) { playSel(); return; } UI.sel = id; snd('click', { vol: .4 }); render();
}
function playSel() {
  if (!canAct() || UI.sel < 0 || G.phase !== 'play') return; const v = viewSeat(), turn = G.trick.turn;
  const m = myMoves().find(x => x.t === 'play' && x.c === UI.sel); if (!m) { snd('error'); return; }
  doMove(m);
}
function doHint() {
  const v = viewSeat(); if (!canAct() || !iMustAct()) return;
  let m; try { m = LD.AI.choose(G, v, 'normal'); } catch (e) { return; } if (!m) return;
  // guided first dive: the lesson comes first. While fewer than 3 tricks are played, suggest a colour card so the trick rules can be seen.
  if (UI.mode === 'guided' && G.phase === 'play' && G.tricks.length < 3 && m.t === 'play' && suitOf(m.c) === 4) {
    const col = myMoves().filter(x => x.t === 'play' && suitOf(x.c) < 4).sort((a, b) => valOf(a.c) - valOf(b.c));
    if (col.length) { UI.hint = { c: col[0].c, why: 'Lesson first: play a low colour card and watch how the trick is won. Keep your Lanterns for your job.' }; UI.sel = col[0].c; render(); return; }
  }
  if (m.t === 'play') { let why = ''; try { why = LD.AI.why(G, v, m.c); } catch (e) { } UI.hint = { c: m.c, why }; UI.sel = m.c; render(); }
  else if (m.t === 'take') { UI.job = m.i; render(); toast('A good job for you: ' + jobShort(m.i)); }
  else { toast('Suggested: ' + (m.t === 'ping' ? 'signal ' + cname(m.c) : m.t)); }
}
// ---------- hot-seat ----------
function hotNext() {
  if (!hotSeat() || UI.cards.length || UI.busy) return;
  const pend = LD.pending(G).filter(s => !G.players[s].ai); if (!pend.length) return;
  // the flare decision needs no hidden information: nobody has to take the device, and the hand stays hidden meanwhile
  if (G.phase === 'distress') { if (UI.holder >= 0) { UI.holder = -1; render(); } return; }
  if (UI.holder >= 0 && pend.includes(UI.holder)) return;
  const nx = pend[0]; UI.holder = -1; UI.sel = -1; UI.job = -1; UI.pingSel = false; UI.giveSel = -1;
  pushCard({ kind: 'pass', seat: nx, title: 'Pass the device to ' + pname(nx), body: 'Hand the device to ' + pname(nx) + '. Their cards stay hidden until they press the button.', btn: pname(nx) + ' is ready' });
  render();
}
function pushCard(c) { UI.cards.push(c); drawCard(); }
function drawCard() {
  const pa = $('#pass'); if (!pa) return; const c = UI.cards[0];
  if (!c) { pa.hidden = true; pa.innerHTML = ''; return; }
  pa.hidden = false; pa.innerHTML = '';
  pa.append(h('div.pbox', { role: 'dialog', 'aria-modal': 'true', 'aria-label': c.title }, h('h2', c.title), h('p', c.body), h('button.btn.go', { type: 'button', 'data-a': 'takedev' }, c.btn || 'Continue')));
}
function takeDevice() { const c = UI.cards[0]; if (!c || c.kind !== 'pass') return; UI.cards.shift(); UI.holder = c.seat; drawCard(); render(); schedule(); }
// ---------- the event sequences: cards fly to the table, the trick is swept to its winner ----------
// ---------- "what just happened": one plain line per event that touches the team (jobs taken, tricks won, jobs done or failed, signals) ----------
function trickWhy(e, cu) {
  const lan = e.plays.filter(p => suitOf(p.c) === 4).length, ws = suitOf(e.wc);
  if (ws === 4) return lan > 1 ? ', the highest Lantern.' : ': a Lantern beats every colour.';
  if (cu === 'low') return ', the lowest ' + D.suits[ws].name + ' (Undertow curse).';
  if (cu === 'any') return ', the highest number of any colour (Riptide curse).';
  if (cu === 'sleep' && lan) return ', the highest ' + D.suits[ws].name + ': the Lanterns slept (curse).';
  return ', the highest ' + D.suits[ws].name + '.';
}
function newsFrom(evs) {
  const out = [], q = '“', qq = '”';
  for (const e of evs) {
    if (e.t === 'deal') UI.news = [];
    else if (e.t === 'take') out.push((e.seat === viewSeat() ? 'You took ' : pname(e.seat) + ' took ') + q + jobShort(e.i) + qq + '.');
    else if (e.t === 'swap') out.push('Every diver passed one card ' + (G.hn === 2 ? 'to the partner.' : e.dir > 0 ? 'to the left.' : 'to the right.'));
    else if (e.t === 'ping') out.push(pname(e.seat) + ' showed ' + cname(e.c) + (e.k ? ': ' + (e.seat === viewSeat() ? 'your' : 'their') + (e.k === 'high' ? ' highest ' : e.k === 'low' ? ' lowest ' : ' only ') : ' ') + (e.k ? D.suits[suitOf(e.c)].name + '.' : '(highest, lowest or only one?)') + (e.seat === viewSeat() ? '' : ' Their signal is now used (red cross).'));
    else if (e.t === 'trick') { const ti = G.tricks.findIndex(k => k.plays[0].c === e.plays[0].c); out.push((ti >= 0 ? 'Trick ' + (ti + 1) + ': ' : '')  + pname(e.w) + ' won with ' + cname(e.wc) + trickWhy(e, ti >= 0 ? G.tricks[ti].cu : '')); }
    else if (e.t === 'job' && e.st > 0 && isBoss()) { UI.hitAt = Date.now(); const B = bossChar(); out.push('\u2714 ' + pname(G.tasks[e.i].owner) + ' finished \u201c' + jobShort(e.i) + '\u201d. ' + B.name + ' takes a hit: \u201c' + B.hit[(G.tasks.filter((t, k) => jobSt(k) > 0).length - 1) % B.hit.length] + '\u201d'); setTimeout(() => { try { bossBar(); } catch (er) { } }, 750); }
    else if (e.t === 'job' && e.st > 0) out.push('✔ ' + pname(G.tasks[e.i].owner) + ' finished ' + q + jobShort(e.i) + qq + '.');
    else if (e.t === 'job' && e.st < 0) out.push('✖ ' + (G.tasks[e.i].owner === viewSeat() ? 'Your' : pname(G.tasks[e.i].owner) + '’s') + ' job ' + q + jobShort(e.i) + qq + ' can no longer be done.');
  }
  if (out.length) UI.news = (UI.news || []).concat([out.join(' ')]).slice(-3); // one sentence per moment
}
function drainQ() { if (UI.rq.length && !UI.busy) { const q = UI.rq.shift(); playEvs(q); } }
async function playEvs(evs) {
  if (UI.busy) { UI.rq.push(evs); return; }
  const tok = UI.seq; UI.busy = true; closePop();
  try {
    const tr = evs.find(e => e.t === 'trick'), pls = evs.filter(e => e.t === 'play'), sw = evs.find(e => e.t === 'swap'), take = evs.filter(e => e.t === 'take'), pg = evs.filter(e => e.t === 'ping');
    try { newsFrom(evs); } catch (e) { console.error(e); }
    if (pls.length) snd('play');
    if (pg.length) snd('ping');
    if (sw) { snd('pass'); try { animatePass(); } catch (e) { } }
    if (take.length) snd('take');
    if (tr) {
      UI.fz = { plays: tr.plays.map(p => ({ s: p.s, c: p.c })), winner: tr.w, win: false };
      render(); await wait(ANIM ? 1000 : 0); if (tok !== UI.seq) return;
      UI.fz.win = true; render(); snd('trick'); await wait(ANIM ? 1100 : 0); if (tok !== UI.seq) return;
      UI.pxExit = { seat: tr.w }; UI.fz = null; render(); await wait(520); if (tok !== UI.seq) return;
      for (const j of evs.filter(e => e.t === 'job')) { if (j.st > 0) snd('done'); else if (j.st < 0) snd('fail'); }
    } else { render(); await wait(pls.length ? 420 : (take.length ? 380 : 220)); if (tok !== UI.seq) return; }
    if (evs.some(e => e.t === 'start') ) { /* nothing */ }
  } catch (e) { console.error(e); UI.fz = null; }
  UI.busy = false; UI.fz = null;
  try { render(); } catch (e) { console.error(e); }
  if (G && G.phase === 'over') { schedule(); drainQ(); return; }
  schedule(); drainQ(); if (NET.on && isHost()) netPush(true);
}
function animatePass() {
  if (!document.body.animate || !ANIM) return;
  const np = G.np, dir = (G.pass && G.pass.dir) || 1, rect = s => { const e = document.querySelector('[data-key="seat' + s + '"]'); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2 - 15, y: r.top + r.height / 2 - 21 }; };
  const ds = LD.diverSeats(G);
  for (let k = 0; k < ds.length; k++) {
    const a = rect(ds[k]), b = rect(ds[((k + dir) % ds.length + ds.length) % ds.length]); if (!a || !b) continue;
    const el = h('div.pkt'); el.innerHTML = KIT.backSVG({ w: 30 }); el.style.left = '0'; el.style.top = '0'; document.body.appendChild(el);
    const an = el.animate([{ transform: 'translate(' + a.x + 'px,' + a.y + 'px)', opacity: 0 }, { transform: 'translate(' + a.x + 'px,' + a.y + 'px)', opacity: 1, offset: .12 }, { transform: 'translate(' + b.x + 'px,' + b.y + 'px)', opacity: 1, offset: .88 }, { transform: 'translate(' + b.x + 'px,' + b.y + 'px)', opacity: 0 }], { duration: 800 * Math.max(.5, AIDELAY / 650), easing: 'ease-in-out' });
    an.onfinish = () => el.remove(); setTimeout(() => el.remove(), 1500);
  }
}
// ---------- the clock (real-time dives) ----------
function startClock() {
  clearInterval(UI.clk); if (!G || !G.clock) return;
  UI.clk = setInterval(() => {
    if (!G || G.phase === 'over' || !UI.started) { clearInterval(UI.clk); return; }
    if (UI.busy && false) return;
    UI.clockLeft = Math.max(0, G.clock - (Date.now() - UI.timerAt) / 1000);
    const c = $('#clk'); if (c) { c.textContent = clockText(); c.classList.toggle('low', UI.clockLeft < 20); }
    if (UI.clockLeft <= 0 && !isClient()) { clearInterval(UI.clk); if (LD.expire(G)) afterApply(G.events.slice()); }
  }, 250);
}
// ---------- save / load (local games only) ----------
function hasSave() { return !!lsGet('ld_save'); }
function autosave() { if (NET.on || !G || !UI.started) return false; return save(true); }
function save(quiet) {
  if (NET.on || !G || !UI.started) return false;
  try { const g = LD.clone(G); delete g.events; lsSet('ld_save', JSON.stringify({ G: g, mode: UI.mode, cfg: UI.cfg, chefs: UI.chefs || null, coach: UI.coach })); return true; } catch (e) { return false; }
}
function loadSave() {
  if (NET.on) return false;
  let o; try { o = JSON.parse(lsGet('ld_save')); } catch (e) { return false; }
  if (!o || !o.G || !Array.isArray(o.G.players) || o.G.v !== 1) return false;
  G = o.G; G.events = [];
  try { if (G.phase !== 'over' && LD.checkInvariants(G).length) { G = null; return false; } } catch (e) { return false; }
  UI.chefs = Array.isArray(o.chefs) && o.chefs.length === G.hn ? o.chefs : null;
  resetUI(o.mode || 'vs', o.cfg || null); if (o.coach) UI.coach = o.coach;
  UI.timerAt = 0; placePrompt(); render(); sndMusic();
  if (G.phase === 'over') showResult(); else schedule();
  return true;
}
// ===================== part 4: guide tips, pop-ups (job, diver, last trick) and the result card =====================
// ---------- tips: one at a time, never stacked; the guided dive shows all of them, other dives each tip once per device ----------
const TIPS = [
  { id: 'welcome', when: () => UI.mode === 'guided' && G.phase === 'assign' && G.tricks.length === 0, title: 'Welcome aboard', body: 'Your team wins or loses together. Each job card is a task for ONE diver. Do every job and the dive is won.', btn: 'Next' },
  { id: 'commander', when: () => G.phase === 'assign' && G.cap >= 0, title: () => G.cap === viewSeat() ? 'You are the Commander' : pname(G.cap) + ' is the Commander', body: () => (G.cap === viewSeat() ? 'You hold Lantern 4, the strongest card, so you pick a job first and lead the first trick.' : pname(G.cap) + ' holds Lantern 4, so picks a job first and leads the first trick.') + ' The gold badge on an avatar marks the Commander.' },
  { id: 'pickjob', when: () => G.phase === 'assign' && iMustAct() && UI.mode !== 'net' && !G.players[G.as.actor].helper && G.as.mode === 'draft', title: 'Pick a job', body: 'Tap a job card, then "Take this job". Pick one your cards can do.' },
  { id: 'flare', when: () => G.phase === 'distress' && iMustAct(), title: 'Distress flare (optional)', body: 'Light it and everyone passes one card to a neighbour. It costs one extra attempt in the logbook. "No flare" is fine.' },
  { id: 'signal', when: () => G.phase === 'signal' && iMustAct(), title: 'Signal (optional)', body: 'Once per dive you may show the team one card: your highest, lowest or only card of a colour. Or skip.' },
  { id: 'gplan', when: () => UI.mode === 'guided' && G.phase === 'play' && G.tricks.length === 0 && iMustAct() && G.trick.plays.length === 0, title: 'Your plan', body: 'Your job: win the Lantern 3. You also hold Lantern 4, so it is safe. First play a few colour cards to see how tricks work. The dive ends the moment your job is done.' },
  { id: 'lead', when: () => UI.mode === 'guided' && G.phase === 'play' && iMustAct() && G.trick.plays.length === 0 && !G.players[G.trick.turn].helper, title: 'You lead', body: 'Tap a card, then Play. Everyone plays one card; the highest card of the colour you led wins the trick.' },
  { id: 'follow', when: () => G.phase === 'play' && iMustAct() && G.trick.plays.length > 0 && !G.players[G.trick.turn].helper && LD.playable(G, G.trick.turn).length < G.players[G.trick.turn].hand.length, title: 'Follow the colour', body: 'You must play the colour that was led if you have it (dim cards are not allowed). You never have to win.' },
  { id: 'nofollow', when: () => G.phase === 'play' && iMustAct() && G.trick.plays.length > 0 && G.trick.ls < 4 && !G.players[G.trick.turn].helper && !G.players[G.trick.turn].hand.some(c => suitOf(c) === G.trick.ls), title: 'None of that colour', body: 'Play anything. Another colour never wins; a Lantern always does.' },
  { id: 'trump', when: () => G.phase === 'play' && G.trick.plays.some(p => suitOf(p.c) === 4) || (UI.fz && UI.fz.plays.some(p => suitOf(p.c) === 4)), title: 'Lanterns are trumps', body: 'A Lantern beats every colour. With several Lanterns the highest wins.' },
  { id: 'won', when: () => UI.mode === 'guided' && G.tricks.length >= 1 && G.phase === 'play' && !UI.busy && iMustAct(), title: 'The winner leads next', body: () => 'Whoever wins a trick leads the next one. The line above the buttons tells you who won and why.' },
  { id: 'jobdone', when: () => G.phase === 'play' && G.tasks.some((t, i) => jobSt(i) > 0) && !UI.busy, title: 'A job is done', body: 'Green tick = done for good. A red cross would end the dive.' }
];
function seen(id) { return !!UI.coach.seen[id]; }
function markSeen(id) { UI.coach.seen[id] = 1; if (UI.coach.level !== 'full') { try { const s = JSON.parse(lsGet('ld_tips') || '{}'); s[id] = 1; lsSet('ld_tips', JSON.stringify(s)); } catch (e) { } } }
function seenEver(id) { try { return !!JSON.parse(lsGet('ld_tips') || '{}')[id]; } catch (e) { return false; } }
function coachCheck() {
  if (!G || !UI.started || UI.coach.level === 'off' || UI.tip || UI.cards.length || UI.dlg) return;
  if (UI.busy || (G.phase === 'play' && UI.fz)) return;
  if (viewSeat() < 0) return;
  const light = UI.coach.level === 'light';
  for (const t of TIPS) {
    if (UI.coach.seen[t.id]) continue; if (light && seenEver(t.id)) continue;
    if (light && !['commander', 'pickjob', 'flare', 'signal', 'follow', 'nofollow', 'trump', 'jobdone'].includes(t.id)) continue;
    let ok = false; try { ok = t.when(); } catch (e) { }
    if (!ok) continue;
    const title = typeof t.title === 'function' ? t.title() : t.title, body = typeof t.body === 'function' ? t.body() : t.body;
    UI.tip = { id: t.id, title, body, btn: t.btn || 'Got it' }; renderTip(); return;
  }
}
function tipOk() { if (!UI.tip) return; markSeen(UI.tip.id); UI.tip = null; renderTip(); schedule(); coachCheck(); }
// ---------- pop-ups inside the dock ----------
function closePop() { UI.pop = null; document.documentElement.classList.remove('popon'); const p = $('#ppop'); if (p) { p.hidden = true; p.innerHTML = ''; } }
function openPop(title, sub, body) {
  const p = $('#ppop'); if (!p) return; UI.pop = { title }; document.documentElement.classList.add('popon');
  p.innerHTML = ''; p.hidden = false;
  p.append(h('div.ph-head', h('div.ph-t', h('b', title), sub ? h('span', sub) : null), h('button.px', { 'data-a': 'popx', type: 'button', 'aria-label': 'Close' }, '×')), h('div.ph-body', body));
  if (document.documentElement.classList.contains('ph-p')) { const fe = $('#felt'); if (fe) { const fr = fe.getBoundingClientRect(); p.style.height = Math.round(Math.max(200, Math.min(innerHeight * .55, innerHeight - fr.bottom))) + 'px'; } } else p.style.height = '';
}
function openJob(i) {
  if (!G || !G.tasks[i]) return; const t = G.tasks[i], d = TASKS[t.id], st = jobSt(i);
  const kids = [h('p', d.t)];
  kids.push(h('div.kv', h('span', 'Taken by'), h('b', t.owner >= 0 ? pname(t.owner) : 'nobody yet')));
  kids.push(h('div.kv', h('span', 'Difficulty (' + G.np + ' divers)'), h('b', jobDiff(i))));
  kids.push(h('div.kv', h('span', 'State'), h('b', st > 0 ? 'Done' : st < 0 ? 'Failed' : 'Open')));
  if (d.k === 'pred' && t.pn >= 0) kids.push(h('div.kv', h('span', 'Prediction'), h('b', d.open || G.phase === 'over' || ctlSeat(t.owner) === viewSeat() ? (t.pn === -2 ? 'secret' : t.pn) : 'secret')));
  if (!d.cap) kids.push(h('p.sm', 'The Commander may not take this job.'));
  kids.push(h('p.sm', hintFor(d)));
  openPop(d.s, 'Job card', kids);
}
function hintFor(d) {
  const k = d.k;
  if (k === 'cmp') return 'Count the tricks each diver wins. Ties do not count as more or fewer.';
  if (k === 'cards') return 'You win a card by winning the trick it is in.';
  if (k === 'with') return 'The card you play to win the trick has to be a colour card of that number.';
  if (k === 'pos') return 'The first trick is the first one played; the last is the final one of the dive.';
  if (k === 'pred') return 'Aim for exactly your number of tricks at the end.';
  if (k === 'subx') return 'Lanterns you win count: every Lantern in a trick you win.';
  if (k === 'avoidc' || k === 'avoidv' || k === 'avoidsub') return 'Cards in tricks you win count as won, even the ones other divers played.';
  return 'All cards in the tricks you win count as won by you.';
}
function openSeat(s) {
  if (!G) return; const p = G.players[s], kids = [];
  kids.push(h('div', { style: 'display:flex;gap:10px;align-items:center' }, h('span.av56', { style: 'width:56px;height:56px;flex:0 0 56px;display:block', html: avatarS(s, 96) }), h('div', h('b', p.name + (s === G.cap ? ' (Commander)' : '')), h('div.sm', p.helper ? 'The drone: ' + pname(G.cap) + ' flies it and decides without talking.' : (p.ai ? 'Computer diver (' + p.ai + ')' : (NET.on && s === NET.mySeat ? 'You' : 'Diver'))))));
  kids.push(h('div.kv', h('span', 'Cards in hand'), h('b', p.hand.length)));
  kids.push(h('div.kv', h('span', 'Tricks won'), h('b', tricksWon()[s])));
  if (!p.helper) kids.push(h('div.kv', h('span', 'Ping'), h('b', G.comm === 'none' ? 'No signalling in this dive' : G.comm === 'narc' ? 'Shared pool: ' + G.pool + ' left' : (p.pingUsed ? 'Used' : 'Ready'))));
  const sh = shownBy(s); sh.forEach(x => kids.push(h('div.kv', h('span', 'Showed'), h('b', cname(x.c) + (x.k === 'high' ? ' (highest)' : x.k === 'low' ? ' (lowest)' : x.k === 'only' ? ' (only one)' : '')))));
  const js = jobs(s); kids.push(h('h4', { style: 'margin:6px 0 0' }, js.length ? 'Jobs' : 'No jobs'));
  js.forEach(i => kids.push(h('div.rjob' + (jobSt(i) > 0 ? '.ok' : jobSt(i) < 0 ? '.bad' : ''), h('span.mk', { html: jobSt(i) > 0 ? KIT.iconSVG('tick', 22) : jobSt(i) < 0 ? KIT.iconSVG('cross', 22) : KIT.iconSVG('list', 22) }), h('span', jobText(i)))));
  openPop(p.name, 'Diver', kids);
}
function openLast() {
  if (!G || !G.tricks.length) return; const k = G.tricks[G.tricks.length - 1];
  const row = h('div', { style: 'display:flex;gap:8px;flex-wrap:wrap;justify-content:center' });
  k.plays.forEach(p => row.append(h('div', { style: 'display:flex;flex-direction:column;align-items:center;gap:3px;font-size:13px;font-weight:800' }, h('div', { style: 'width:62px;height:87px', html: cardS(p.c, 62) }), pname(p.s) + (p.s === k.w ? ' ★' : ''))));
  openPop('Last trick', 'Trick ' + (k.n + 1), [row, h('p', pname(k.w) + ' won it with ' + cname(k.wc) + '.'), h('p.sm', 'Only the most recent trick can be looked at again.')]);
}
// ---------- the result card ----------
function showResult() {
  if (!G || G.phase !== 'over' || UI.overShown) return; UI.overShown = true;
  try { Prog.ended(G); } catch (e) { console.error(e); }
  clearInterval(UI.clk);
  const rs = $('#rs'); rs.hidden = false; rs.innerHTML = ''; UI.rsOpen = true;
  const R = G.result, ok = R.ok, m = G.mission, p = Prog.load();
  const box = h('div.rsbox', { role: 'dialog', 'aria-modal': 'true', 'aria-label': ok ? 'Dive complete' : 'Dive failed' });
  box.append(ok ? h('div.win', h('span', { html: KIT.iconSVG('star', 34) }), h('span', 'Dive complete!')) : h('div.lose', h('span', { html: KIT.iconSVG('cross', 30) }), h('span', 'The dive failed.')));
  if (!ok && R.why) box.append(h('p', R.why));
  if (ok && G.tricks.length < G.ntr && G.mission.id !== 27) box.append(h('p.sm', 'Every job was done after trick ' + G.tricks.length + ', so the dive ended at once. Cards still in hand do not matter.'));
  box.append(h('p.sm', diveLabel() + (UI.mode === 'descent' ? '' : ' · attempt ' + G.att) + (G.distress ? ' · distress flare lit (+1)' : '')));
  // done = tick; broken = cross + which trick, card and diver broke it; never broken (the dive stopped for another reason) = "not finished"
  G.tasks.forEach((t, i) => {
    const st = R.tasks[i], det = R.det && R.det[i], nb = ok || st > 0 ? '' : st < 0 ? (det || 'It could not be met by the end of the dive.') : 'Not finished: the dive ended first.';
    box.append(h('div.rjob' + (st > 0 ? '.ok' : st < 0 ? '.bad' : '.open'), h('span.mk', { html: st > 0 ? KIT.iconSVG('tick', 24) : st < 0 ? KIT.iconSVG('cross', 24) : '<svg class="ic" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 12H18"/></svg>' }), h('span', h('b', pname(t.owner) + ': '), jobText(i), nb ? h('small.why', nb) : null)));
  });
  if (!ok && !guidedWon()) box.append(h('p.sm', 'Tip: the red cross marks the job that broke the dive. Grey jobs were still open.'));
  if (ok && UI.mode === 'guided') guidedDebrief(box);
  if (m.kind === 'log') {
    if (ok) { const n = p.done[m.id]; box.append(h('p', 'Logged in your logbook: dive ' + m.id + ' done in ' + n + ' attempt' + (n === 1 ? '' : 's') + (p.flare[m.id] ? ' (the flare counts one).' : '.'))); }
    else box.append(h('p.sm', 'Attempts so far on this dive: ' + (p.tries[m.id] || 0) + '. If the jobs could not be done from the start, try with new jobs.'));
  } else if (m.kind === 'deep' && ok) box.append(h('p', 'Deep dive ' + m.d + ' complete. The next one is difficulty ' + (m.d + 1) + '.'));
  if (UI.camp && typeof GXC !== 'undefined' && GXC.active()) { campResult(box, ok); rs.append(box); snd(ok ? 'win' : 'lose'); return; }
  if (UI.mode === 'descent') { descResult(box, ok); rs.append(box); snd(ok ? 'win' : 'lose'); return; }
  const bt = h('div.cbtns');
  const host = !NET.on || isHost();
  if (ok) {
    if (UI.mode === 'guided') bt.append(h('button.btn.go', { 'data-a': 'descgo', type: 'button' }, 'Start The Descent'));
    else if (host && m.kind === 'log' && m.id < 32) bt.append(h('button.btn.go', { 'data-a': 'nextdive', type: 'button' }, 'Next dive'));
    else if (host && m.kind === 'log') bt.append(h('button.btn.go', { 'data-a': 'nextdive', type: 'button' }, 'Deep dive ' + D.deep.start));
    else if (host && m.kind === 'deep') bt.append(h('button.btn.go', { 'data-a': 'nextdive', type: 'button' }, 'Next: deep dive ' + (m.d + 1)));
    else if (host) bt.append(h('button.btn.go', { 'data-a': 'retrysame', type: 'button' }, 'Play again'));
  } else if (host) {
    bt.append(h('button.btn.go', { 'data-a': 'retrysame', type: 'button' }, 'Try again (same jobs)'));
    bt.append(h('button.btn', { 'data-a': 'retrynew', type: 'button' }, 'Try again (new jobs)'));
  }
  bt.append(h('button.btn.alt', { 'data-a': 'rsclose', type: 'button' }, 'Look at the table'));
  bt.append(h('button.btn.alt', { 'data-a': NET.on ? 'netopen' : 'menu', type: 'button' }, NET.on ? 'Lobby' : 'Menu'));
  box.append(bt); rs.append(box); snd(ok ? 'win' : 'lose');
}
function guidedWon() { return UI.mode === 'guided' && G && G.result && G.result.ok; }
function guidedDebrief(box) {
  const me = viewSeat(), mine = tricksWon()[me >= 0 ? me : 0] || 0;
  box.append(h('div.debrief', h('b', 'What you just learned'), h('ul',
    h('li', 'A job card tells ONE diver what to do with the tricks that diver wins. Yours: win the Lantern 3.'),
    h('li', 'Lanterns are trumps: any Lantern beats every colour, and the highest Lantern wins. You held the two highest, so the job was safe.'),
    h('li', 'The whole team wins when every job is done, and the dive ends at once. It took ' + G.tricks.length + ' trick' + (G.tricks.length === 1 ? '' : 's') + ' and you won ' + mine + '.'),
    h('li', 'Next dives have jobs for every diver. Watch the job chips under each name, and use the signal token to tell your team one card you hold.'))),
    h('div.say', h('span.dpt', { html: portraitSVG('mara', 52) }), h('p', h('b', 'Mara: '), 'You are ready. Now take on The Descent: four zones, and a boss at the bottom of each.')));
}
function closeRS() { const rs = $('#rs'); if (rs) { rs.hidden = true; rs.innerHTML = ''; } UI.rsOpen = false; }
function nextDive() {
  if (!G || G.phase !== 'over' || NET.on && !isHost()) return;
  const m = G.mission; const o = Object.assign({}, UI.opt || {});
  if (m.kind === 'log') { if (m.id < 32) { o.kind = 'log'; o.mission = m.id + 1; } else { o.kind = 'deep'; o.deep = Math.max(D.deep.start, Prog.load().deep.level); } }
  else if (m.kind === 'deep') { o.kind = 'deep'; o.deep = m.d + 1; }
  closeRS(); const mode = UI.mode === 'guided' ? 'vs' : UI.mode;
  UI.opt = Object.assign(UI.opt || {}, { kind: o.kind, mission: o.mission, deep: o.deep });
  if (NET.on) { netStart(); return; }
  newGame(mode, Object.assign({}, UI.cfg || {}, { kind: o.kind, mission: o.mission, deep: o.deep, np: (UI.cfg && UI.cfg.np) || G.hn, seats: UI.cfg && UI.cfg.seats || undefined }));
}
// ===================== part 5: drawers (jobs, log, rules, reference, menu), start screens, events, phone mode, boot =====================
function logHTML() { const e = h('div.logl'); if (!G) return e; for (let i = G.log.length - 1; i >= Math.max(0, G.log.length - 160); i--) e.appendChild(h('div.ll', h('span.lt', 'A' + G.log[i].att), ' ' + G.log[i].t)); return e; }
function buildRules() {
  const root = h('div.rules');
  const sec = (t, ...k) => { root.appendChild(h('h3', t)); k.forEach(x => root.appendChild(x)); };
  const ul = a => h('ul', ...a.map(t => h('li', t))), ol = a => h('ol', ...a.map(t => h('li', t)));
  sec('The goal', h('p', 'You are a team of divers on a deep-sea expedition. Each dive lays out job cards. Every job is a condition on the tricks one diver wins. You win the dive together when every job is done, and you lose it together the moment one job cannot be done. Nobody may talk about their cards: you can only use the ping signal.'));
  sec('How a dive goes', ol(['Everybody is dealt a hand. The diver with Lantern 4 is the Commander.', 'Job cards are drawn until their numbers add up to the dive\'s difficulty (the number for your team size counts).', 'Jobs are taken: the Commander first, then clockwise, one job at a turn, until none are left.', 'Optionally, light the distress flare to pass cards (see below).', 'Divers may signal once (see below), then the tricks are played. The Commander leads the first trick; each trick is led by the winner of the one before.', 'When every job is done the dive is won. If one job can no longer be done, the attempt is lost: deal again.']));
  sec('The cards', h('p', '40 cards: four colours (Coral, Tide, Kelp, Sunstar) numbered 1 to 9, and four Lanterns numbered 1 to 4. The Lanterns are the trump suit. With 3 divers one diver has 14 cards and one card is never played; 4 divers play 10 tricks, 5 divers 8 tricks.'));
  sec('A trick', ul(['The leader plays any card. Everybody must follow the colour that was led if they can (Lanterns count as a colour too). If you cannot follow, play anything.', 'A Lantern beats every colour; the highest Lantern wins. With no Lantern, the highest card of the led colour wins.', 'You are never forced to win.', 'You may look again at the most recent trick only (the "Last trick" button).']));
  sec('Signals (the ping)', ul(['Once per dive each diver may show one colour card from the hand, face up: it must be their highest, their lowest or their only card of that colour. The token marks which one (top, bottom or middle).', 'Lanterns cannot be shown. Signals only happen between tricks. The mark does not change afterwards, even if it stops being true.', 'Murky water: the card is shown but gets no mark. Deep narcosis: the tokens are in a shared pool (two fewer than divers) and anyone can use one at any time between tricks. Unknown waters: draw a colour card first: 1-3 normal, 4-6 murky, 7-9 narcosis.']));
  sec('Jobs', ul(['A job is done when it is met and can no longer fail. It fails when it can no longer be met.', 'Three jobs compare with the Commander (more, fewer or equally many tricks); the Commander cannot take those.', 'If both "win the first trick" and "win the first two tricks" lie on the table and nobody could take both, one is swapped for another job of the same value.']));
  sec('The distress flare', h('p', 'Before any signalling, the team may light the flare. Every diver passes one colour card to the left (or everybody to the right). It stays lit until the dive is won, and the dive counts one extra attempt in your logbook. You may pass again at the start of each later attempt, or not.'));
  sec('Special dives', ul(['Commander\'s call (dives 10, 13): the Commander takes all jobs or hands them to a willing diver. If handed over, all signalling happens before the first trick.', 'One diver takes all jobs: by team vote (dive 6) or by volunteering in turn, answering only yes or no (dives 14, 15, 16; two volunteers in dive 26).', 'Open briefing (dives 17, 28-31, deep dives): talk freely about the jobs, never about cards.', 'Limits: some dives forbid winning two more 9s (or 1s) than another diver, leading Coral or a Lantern, and more. The rule of each dive is in the panel when you start it.', 'Real-time dives (14, 15, 16, 26): beat a clock, or play without it and use the alternative rule shown with the dive. Turn the clock on in the setup screen.']));
  sec('Two divers and the drone', h('p', 'With two divers a drone joins as a third team member. Its 14 cards lie in a double row, 7 face up on top of 7 face down. The Commander takes jobs for it, plays its face-up cards and decides without talking. A face-down card turns up only after the card on top of it was played, between tricks.'));
  sec('On your phone', ul(['Tap a card to lift it, tap it again (or press Play) to play. Dim cards are not allowed now. Tap a diver or a job chip for details; "Last trick" shows the previous trick.', 'The panel at the bottom always says what to do now. The Hint button shows a suggestion with the reason.', 'Hot-seat: a pass-the-device screen hides every hand. Online: you only ever see your own cards. There is no chat, only the pings and a few neutral emotes.']));
  root.appendChild(h('div', { html: '<section class="credits-audio"><h3>Credits</h3><p>Audio, all public-domain (CC0): music &ldquo;Underwater Theme&rdquo; by Spring Spring and ambience &ldquo;Underwater Ambient Pad&rdquo; by isaiah658 (OpenGameArt); sound effects from the Casino Audio, Impact Sounds, Interface Sounds, Music Jingles and UI Audio packs by Kenney (kenney.nl). They were trimmed, loudness-normalised and converted for this game. Online play uses Trystero (MIT). The painted table is drawn with PixiJS (MIT). Names, job text and art are original; the paintings were made for this game.</p></section>' }));
  return root;
}
// ---- reference drawer: every card, job and dive, with counts ----
function buildRef() {
  const root = h('div#refbody');
  const tab = UI.refTab || 'cards';
  const tabs = h('div.tabs', [['cards', 'Cards (40)'], ['jobs', 'Jobs (96)'], ['dives', 'Dives (32)'], ['tokens', 'Tokens']].map(([k, n]) => h('button.chipb' + (tab === k ? '.on' : ''), { 'data-a': 'reftab', 'data-v': k, type: 'button' }, n)));
  root.append(tabs);
  if (tab === 'cards') {
    D.suits.forEach(su => { root.append(h('h3', { style: 'margin:8px 0 4px' }, su.name + (su.id === 4 ? ' (trump, 4 cards)' : ' (9 cards)'))); const g = h('div.cgrid'); const n = su.id === 4 ? 4 : 9; for (let v = 1; v <= n; v++) g.append(h('div.cdv', { html: cardS(D.card(su.id, v), 44) })); root.append(g); });
    root.append(h('p.sm', 'Reminder card x5 (put in your hand while your shown card is on the table), card back x1 design.'));
  } else if (tab === 'jobs') {
    root.append(h('p.sm', 'Numbers are the job\'s worth for 3 / 4 / 5 divers. 96 jobs.'));
    const l = h('div.jlist'); TASKS.forEach(t => l.append(h('div.jr', h('span.nn', t.id + 1), h('span', { style: 'flex:1' }, t.t + (t.cap ? '' : ' (not for the Commander)')), h('span.dd', t.d.join(' / '))))); root.append(l);
  } else if (tab === 'dives') {
    const p = Prog.load(); const l = h('div.jlist');
    D.missions.forEach(m => l.append(h('div.jr', h('span.nn', m.id), h('span', { style: 'flex:1' }, h('b', m.name), ' ', m.sel === 'fixed' ? 'Four fixed jobs.' : 'Difficulty ' + (m.timer && m.timer.altD ? m.d + ' (' + m.timer.altD + ' without the clock)' : m.d) + (m.guess ? '*' : '') + '.', m.rule ? h('div.sm', m.rule) : null), h('span.dd', p.done[m.id] ? p.done[m.id] + ' att.' : ''))));
    root.append(l, h('p.sm', '* the difficulty number of this dive could not be confirmed from the sources; see rules-notes.md.'), h('p.sm', D.deep.note));
  } else {
    root.append(h('div.rcard', h('span', { style: 'width:56px;display:block', html: KIT.pingSVG({ size: 56 }) }), h('div.rt', h('b', 'Ping token (one per diver)'), h('div', 'Put on a shown card: top = highest, middle = only, bottom = lowest of that colour in the hand. Green side ready, red side spent.'))));
    root.append(h('div.rcard', h('span', { style: 'width:56px;display:block', html: KIT.pingSVG({ size: 56, spent: true }) }), h('div.rt', h('b', 'Spent ping'), h('div', 'Flipped to red after use. In murky water it sits beside the card without a mark.'))));
    root.append(h('div.rcard', h('span', { style: 'width:56px;display:block', html: KIT.flareSVG({ size: 56, on: true }) }), h('div.rt', h('b', 'Distress flare (1)'), h('div', 'Lit before a dive: everybody passes a card, the dive counts one extra attempt.'))));
    root.append(h('div.rcard', h('span', { style: 'width:56px;display:block', html: KIT.cmdSVG({ size: 56 }) }), h('div.rt', h('b', 'Commander badge (1)'), h('div', 'Goes to the diver holding Lantern 4. Picks jobs first and leads the first trick.'))));
    root.append(h('div.rcard', h('span', { style: 'width:56px;display:block', html: KIT.reminderSVG({ w: 40 }) }), h('div.rt', h('b', 'Reminder card (5)'), h('div', 'Shown in your hand while your signalled card lies on the table.'))));
    root.append(h('div.rcard', h('span', { style: 'width:56px;display:block', html: KIT.droneSVG({ size: 56 }) }), h('div.rt', h('b', 'The drone (two divers)'), h('div', D.helper.story))));
  }
  return root;
}
function renderJobDrawer() {
  const b = $('#jobbody'); if (!b) return; b.innerHTML = '';
  if (!G) { b.append(h('p.sm', 'No dive running.')); return; }
  b.append(h('p.sm', 'All jobs of this attempt. Tap one for details.'));
  G.tasks.forEach((t, i) => { const st = jobSt(i); b.append(h('div.rjob' + (st > 0 ? '.ok' : st < 0 ? '.bad' : ''), { 'data-a': 'job', 'data-i': i, style: 'cursor:pointer' }, h('span.mk', { html: st > 0 ? KIT.iconSVG('tick', 24) : st < 0 ? KIT.iconSVG('cross', 24) : KIT.iconSVG('list', 24) }), h('span', h('b', (t.owner >= 0 ? pname(t.owner) : 'Unclaimed') + ': '), jobText(i) + ' (' + jobDiff(i) + ')'))); });
  if (G.mission.rule) b.append(h('p.sm', { style: 'margin-top:8px' }, 'Dive rule: ' + G.mission.rule));
  b.append(h('p.sm', 'Signalling: ' + ({ normal: 'normal', murky: 'murky water (no marks)', narc: 'deep narcosis (shared pool)', none: 'none' }[G.comm]) + (G.unk >= 0 ? '. Drawn colour card: ' + cname(G.unk) + '.' : '.')));
}
function renderDrawers() {
  if (!GX.open) return;
  if (GX.open === 'logd') { const b = $('#logbody'); b.innerHTML = ''; b.appendChild(logHTML()); }
  if (GX.open === 'setd') renderMenu();
  if (GX.open === 'jobd') renderJobDrawer();
  if (GX.open === 'refd') { const b = $('#refwrap'); b.innerHTML = ''; b.append(buildRef()); }
}
function renderMenu() {
  const b = $('#setbody'); b.innerHTML = '';
  const row = (l, ...k) => b.appendChild(h('div.mrow', h('div.lbl', l), h('div.mbt', k)));
  const tog = (name, on, label) => h('button.btn' + (on ? '' : '.alt'), { 'data-a': name, type: 'button', 'aria-pressed': on ? 'true' : 'false' }, label + ': ' + (on ? 'On' : 'Off'));
  if (NET.on) row('Online', h('button.btn', { 'data-a': 'netopen', type: 'button' }, 'Lobby'), h('button.btn.alt', { 'data-a': 'netleave', type: 'button' }, isHost() ? 'Close the room' : 'Leave the room'));
  else row('Game', h('button.btn', { 'data-a': 'menu', type: 'button' }, 'New dive'), h('button.btn.alt', { 'data-a': 'save', type: 'button' }, 'Save'), h('button.btn.alt' + (hasSave() ? '' : '.dis'), { 'data-a': 'loadsave', type: 'button', disabled: hasSave() ? null : true }, 'Load'));
  if (!NET.on) row('Computer speed', ...[['Fast', 150], ['Normal', 650], ['Slow', 1300]].map(([n, v]) => h('button.btn' + (AIDELAY === v ? '' : '.alt'), { 'data-a': 'speed', 'data-v': v, type: 'button' }, n)));
  if (!NET.on) row('Guide', ...['full', 'light', 'off'].map(n => h('button.btn' + (UI.coach.level === n ? '' : '.alt'), { 'data-a': 'guide', 'data-v': n, type: 'button' }, n[0].toUpperCase() + n.slice(1))));
  row('Sound', tog('sound', UI.prefs.sound, 'Sound effects'), tog('music', UI.prefs.music, 'Music'));
  { const gg = gfxPref(); row('Graphics' + (PX.on ? (gg === 'auto' ? ' (now ' + PX.q + ')' : '') : ' (simple view)'), ...[['auto', 'Auto'], ['high', 'High'], ['medium', 'Medium'], ['low', 'Low']].map(([v, n]) => h('button.btn' + (gg === v ? '' : '.alt'), { 'data-a': 'gfx', 'data-v': v, type: 'button', 'aria-pressed': gg === v ? 'true' : 'false' }, n))); }
  let sp = ''; try { sp = /[?&]perf=1/.test(location.search) && window.PerfHUD && PerfHUD.buttonsHTML ? PerfHUD.buttonsHTML('btn alt') : ''; } catch (e) { }   // Show speed / Test speed only behind ?perf=1
  row('Info', h('button.btn.alt', { 'data-a': 'rules', type: 'button' }, 'How to play'), h('button.btn.alt', { 'data-a': 'ref', type: 'button' }, 'Cards, jobs, dives'), h('span.tinyc', { html: sp }));
  if (NET.on) row('Emotes (no card talk)', ...['👍', '👋', '👏', '🫧'].map(e => h('button.btn.alt', { 'data-a': 'emote', 'data-v': e, type: 'button', 'aria-label': 'Emote ' + e }, e)));
  b.appendChild(h('p.sm', 'Lantern Dive is an original deep-sea co-op trick game. Names, job text and art are original; the audio credits are in How to play.'));
}
// ---------- start screens: painted title -> setup (dive, crew) / online ----------
const SEAT_ORDER = [0, 1, 2, 3];
function optObj() { const o = UI.opt = UI.opt || Object.assign({}, DEF, { lv: DEF.lv.slice(), seats: DEF.seats.slice() }); if (!Array.isArray(o.seats)) o.seats = chefsFor(o.np || 4, o).slice(1); if (!o.lv) o.lv = DEF.lv.slice(); o.np = o.seats.length + 1; return o; }
function setNp(n) { const o = optObj(), want = Math.max(1, Math.min(4, n - 1)); const st = o.seats.slice(); while (st.length > want) st.pop(); for (const c of SEAT_ORDER) { if (st.length >= want) break; if (st.indexOf(c) < 0) st.push(c); } o.seats = st; o.np = st.length + 1; }
function toggleChef(c) { const o = optObj(), st = o.seats.slice(), i = st.indexOf(c); if (i >= 0) { if (st.length > 1) st.splice(i, 1); else { toast('At least one diver joins you.'); return; } } else if (st.length < 4) st.push(c); o.seats = st; o.np = st.length + 1; }
function logoSVG() { return '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10.5" fill="#0e2146" stroke="#ffd873" stroke-width="1.4"/><circle cx="13" cy="9" r="4.4" fill="#ffe9a6" stroke="#0b1f3a" stroke-width="1"/><path d="M13 13.4C13 16 10 16 8 19" fill="none" stroke="#ffd873" stroke-width="1.6" stroke-linecap="round"/></svg>'; }
function missionLine(o) {
  const kind = o.kind || 'log';
  if (kind === 'log') { const m = D.missions[(o.mission | 0) - 1] || D.missions[0]; return 'Dive ' + m.id + ': ' + m.name + (m.sel === 'fixed' ? '' : ' · difficulty ' + m.d); }
  if (kind === 'free') return 'Free dive · difficulty ' + o.d;
  if (kind === 'job') return 'Job practice · ' + TASKS[Math.max(0, Math.min(95, (o.job | 0) - 1))].s;
  return 'Deep dive · difficulty ' + o.deep;
}
function tableLine(o) { const nm = o.seats.map(c => D.names[c]); return 'You + ' + nameList(nm) + ' · ' + o.np + ' players' + (o.np === 2 ? ' + a drone' : ''); }
function renderStart() {
  const s = $('#start'); s.hidden = false; s.innerHTML = '';
  const rs = $('#rs'); if (rs && !UI.rsOpen) { rs.hidden = true; }
  if (NET.on) { s.dataset.v = 'net'; netStartScreen(s); return; }
  if (!UI.sv) UI.sv = UI.onl ? 'online' : 'title';
  s.dataset.v = UI.sv;
  if (UI.sv === 'title') { s.appendChild(titleEl()); return; }
  if (KIT.ART.title) s.appendChild(h('img.ttl-bg.dim', { src: KIT.ART.title, alt: '' }));
  if (UI.sv === 'online') { s.appendChild(onlineEl()); return; }
  if (UI.sv === 'descent') { s.appendChild(descentEl()); return; }
  s.appendChild(setupEl());
}
function titleEl() {
  const bg = KIT.ART.title ? h('img.ttl-bg', { src: KIT.ART.title, alt: '' }) : h('div.ttl-bg.ttl-plain');
  const sv = hasSave();
  return h('div.ttl', bg, h('div.ttl-in',
    h('h1.logo', h('span.ic', { html: logoSVG() }), h('span', 'Lantern Dive')),
    h('p.tag', 'Dive together. Say nothing. Trust the lantern.'),
    h('div.tbtns',
      window.CAMPAIGN ? h('button.tbtn.go.story', { 'data-a': 'story', type: 'button' }, h('b', '\u2728 Story'), ' ', h('span', campLine())) : null,
      h('button.tbtn' + (window.CAMPAIGN ? '' : '.go'), { 'data-a': 'descent', type: 'button' }, h('b', 'The Descent'), ' ', h('span', '4 zones, 4 bosses')),
      h('button.tbtn', { 'data-a': 'guided', type: 'button' }, h('b', 'Training'), ' ', h('span', 'a dive with Mara, step by step')),
      h('button.tbtn', { 'data-a': 'play', type: 'button' }, h('b', 'Free play'), ' ', h('span', 'any dive, any crew')),
      h('button.tbtn', { 'data-a': 'online', type: 'button' }, h('b', 'Online'), ' ', h('span', 'with friends, free')),
      sv ? h('button.tbtn', { 'data-a': 'loadsave', type: 'button' }, h('b', 'Resume'), ' ', h('span', 'your saved dive')) : null),
    h('button.tlink', { 'data-a': 'rules', type: 'button' }, 'How to play')));
}
function dinerCard(c, o) {
  const b = D.blurbs[c], on = o.seats.indexOf(c) >= 0, lv = o.lv[c] || b.lv || 'normal', pc = KIT.DIVERS[c];
  const card = h('article.dcard' + (on ? '.on' : ''), { 'aria-label': D.names[c] + (on ? ', in the team' : ', not in the team') });
  card.style.setProperty('--dc', pc.helm);
  card.append(h('div.dtop', h('div.dimg', { html: avatarC(c, 120) }), h('h3', D.names[c], h('small', on ? lv : 'not invited'))), h('div.dtx', h('p.story', b.story), h('p.enjoy', b.enjoy),
    h('div.drow2', h('button.chipb.seatb' + (on ? '.on' : ''), { 'data-a': 'seatchef', 'data-c': c, type: 'button', 'aria-pressed': on ? 'true' : 'false' }, on ? 'In the team ✓' : 'Invite'),
      on ? h('span.lvs', ['easy', 'normal', 'hard'].map(v => h('button.chipb' + (lv === v ? '.on' : ''), { 'data-a': 'lv', 'data-seat': c, 'data-v': v, type: 'button', 'aria-pressed': lv === v ? 'true' : 'false', 'aria-label': D.names[c] + ' plays ' + v }, v))) : null)));
  return card;
}
function diveCfg(o) {
  const ph = isPh(), kind = o.kind || 'log', p = Prog.load();
  const seg = (l, key, vals, lab) => h('div.seg', h('span.lbl', l), vals.map(v => h('button.chipb' + (o[key] === v ? '.on' : ''), { 'data-a': 'opt', 'data-k': key, 'data-v': v, type: 'button', 'aria-pressed': o[key] === v ? 'true' : 'false' }, lab ? lab[v] : v)));
  const out = [h('div.seg', h('span.lbl', 'Kind of dive'), [['log', 'Logbook'], ['free', 'Free dive'], ['job', 'Job practice'], ['deep', 'Deep dive']].map(([v, n]) => h('button.chipb' + (kind === v ? '.on' : ''), { 'data-a': 'opt', 'data-k': 'kind', 'data-v': v, type: 'button', 'aria-pressed': kind === v ? 'true' : 'false' }, n)))];
  if (kind === 'log') {
    const cur = Math.min(32, o.mission | 0 || p.cur || 1);
    out.push(h('p.ssub', missionLine(Object.assign({}, o, { mission: cur }))));
    const g = h('div.lgrid'); D.missions.forEach(m => { const dn = p.done[m.id], lock = m.id > Math.max(p.cur, 1) + 0 && false; g.append(h('button.lcell' + (cur === m.id ? '.cur' : '') + (dn ? '.dn' : ''), { 'data-a': 'pickdive', 'data-v': m.id, type: 'button' }, h('b', m.id + '. ' + m.name), h('span', (m.sel === 'fixed' ? 'Fixed jobs' : 'Difficulty ' + m.d) + (m.cmt !== 'normal' || m.timer ? ' · ' + (m.timer ? 'timed' : ({ murky: 'murky water', narc: 'narcosis', unknown: 'unknown waters', none: 'no signals' }[m.cmt] || m.cmt)) : '')), dn ? h('span.at', 'Done in ' + dn + ' attempt' + (dn === 1 ? '' : 's')) : (p.tries[m.id] ? h('span.at', p.tries[m.id] + ' failed') : null))); });
    out.push(g);
    if (m32done(p)) out.push(h('p.sm', 'All 32 dives logged! The Deep Dive keeps going from difficulty 18.'));
  } else if (kind === 'free') {
    out.push(seg('Difficulty', 'd', [3, 5, 7, 9, 12, 15, 18], null), seg('Signalling', 'cmt', ['normal', 'murky', 'narc', 'unknown', 'none'], { normal: 'normal', murky: 'murky water', narc: 'narcosis', unknown: 'unknown waters', none: 'none' }));
  } else if (kind === 'job') {
    const j = Math.max(1, Math.min(96, o.job | 0 || 1)), t = TASKS[j - 1];
    out.push(h('div.seg', h('span.lbl', 'Job card'), h('button.chipb', { 'data-a': 'jobstep', 'data-v': -10, type: 'button', 'aria-label': 'Back ten' }, '−10'), h('button.chipb', { 'data-a': 'jobstep', 'data-v': -1, type: 'button', 'aria-label': 'Previous job' }, '‹'), h('b', { style: 'min-width:38px;text-align:center' }, j), h('button.chipb', { 'data-a': 'jobstep', 'data-v': 1, type: 'button', 'aria-label': 'Next job' }, '›'), h('button.chipb', { 'data-a': 'jobstep', 'data-v': 10, type: 'button', 'aria-label': 'Forward ten' }, '+10')), h('p.ssub', t.s + ': ' + t.t));
  } else {
    out.push(h('p.ssub', 'Deep dive at difficulty ' + o.deep + '. Open briefing, only the use of the flare is noted. Each success raises the number.'), h('div.seg', h('span.lbl', 'Difficulty'), h('button.chipb', { 'data-a': 'deepstep', 'data-v': -1, type: 'button' }, '−'), h('b', { style: 'min-width:38px;text-align:center' }, o.deep), h('button.chipb', { 'data-a': 'deepstep', 'data-v': 1, type: 'button' }, '+')));
  }
  out.push(h('div.seg', h('span.lbl', 'Clock'), h('button.chipb' + (o.timer ? '.on' : ''), { 'data-a': 'opt', 'data-k': 'timer', 'data-v': o.timer ? 0 : 1, type: 'button', 'aria-pressed': o.timer ? 'true' : 'false' }, o.timer ? 'On (real-time dives)' : 'Off'), h('span.sm', 'Only dives 14, 15, 16 and 26 have a clock.')));
  return out;
}
const m32done = p => !!p.done[32];
function setupEl() {
  const o = optObj(), ph = isPh(), open = !!UI.cfgOpen;
  const head = h('div.shead', h('button.px.sback', { 'data-a': 'title', type: 'button', 'aria-label': 'Back to the title' }, '‹'), h('h2', 'Plan the dive'));
  const sum = h('div.ssum', h('div.sfaces', o.seats.map(c => h('span', { html: avatarC(c, 64) }))), h('span.sline', missionLine(o) + ' · ' + tableLine(o)), h('button.btn.alt', { 'data-a': 'cfgopen', type: 'button', 'aria-expanded': open ? 'true' : 'false' }, 'Configure'));
  const cfg = h('div.cfg#cfg', { hidden: ph && !open ? true : null, role: ph ? 'dialog' : null, 'aria-label': ph ? 'Configure the dive' : null },
    ph ? h('div.cfghead', h('b', 'Configure the dive'), h('button.btn', { 'data-a': 'cfgclose', type: 'button' }, 'Done')) : null,
    diveCfg(o),
    h('div.seg', h('span.lbl', 'Team size'), [2, 3, 4, 5].map(v => h('button.chipb' + (o.np === v ? '.on' : ''), { 'data-a': 'opt', 'data-k': 'np', 'data-v': v, type: 'button', 'aria-pressed': o.np === v ? 'true' : 'false' }, v))),
    h('div.dgrid', [0, 1, 2, 3].map(c => dinerCard(c, o))),
    ph ? h('div.cfgfoot', h('button.btn.go', { 'data-a': 'cfgclose', type: 'button' }, 'Done')) : null);
  // first visit (nothing in the logbook yet): the guided dive is the big button, so a player who taps the big button learns first
  const fresh = (() => { try { return !Object.keys(Prog.load().done || {}).length; } catch (e) { return false; } })();
  const bStart = (big) => h('button.sbtn' + (big ? '.big' : ''), { 'data-start': 'vs', 'data-a': 'start', 'data-m': 'vs', type: 'button' }, h('b', 'Start the dive'), ' ', h('span', missionLine(o)));
  const bGuided = (big) => h('button.sbtn' + (big ? '.big' : ''), { 'data-start': 'guided', 'data-a': 'guided', type: 'button' }, h('b', big ? 'Guided first dive (start here)' : 'Guided first dive'), ' ', h('span', 'You + 2 computer divers, with tips'));
  const go = h('div.sgo',
    fresh ? bGuided(true) : bStart(true),
    h('div.sgrid3',
      fresh ? bStart(false) : bGuided(false),
      h('button.sbtn', { 'data-start': 'hot', 'data-a': 'start', 'data-m': 'hot', type: 'button' }, h('b', 'Hot-seat'), ' ', h('span', o.np + ' people, one device')),
      h('button.sbtn', { 'data-start': 'ai', 'data-a': 'start', 'data-m': 'ai', type: 'button' }, h('b', 'Watch'), ' ', h('span', 'the divers play'))));
  return h('div.setup.scard', head, ph ? sum : h('p.ssub', 'Choose the dive and who comes along. Each computer diver has a temper; change their level if you like.'), cfg, go);
}
function onlineEl() {
  return h('div.setup.scard.onlv', h('div.shead', h('button.px.sback', { 'data-a': 'title', type: 'button', 'aria-label': 'Back to the title' }, '‹'), h('h2', 'Play online')),
    h('p.ssub', 'Host a dive and send friends the code or the link. Every browser connects directly; nobody sees another hand. Empty seats go to the computer divers. There is no chat: talk with the pings only.'),
    h('details.online#onl', { open: true }, h('summary', 'Free, peer to peer'), h('div#netblock', netInner())));
}
function showStart() { try { GX.close(); } catch (e) { } UI.dlg = null; try { drawDlg(); } catch (e) { } closePop(); UI.cards = []; UI.sv = 'title'; UI.cfgOpen = false; clearInterval(UI.clk); const pc = $('#pc'); if (pc) { pc.hidden = true; pc.innerHTML = ''; } const pa = $('#pass'); if (pa) { pa.hidden = true; pa.innerHTML = ''; } closeRS(); clearTimeout(UI.tm); renderStart(); }
// ---------- events ----------
document.addEventListener('click', ev => {
  const t = ev.target.closest('[data-a],[data-start]'); const pop = $('#ppop');
  if (!t) { if (UI.pop && pop && !pop.contains(ev.target) && !ev.target.closest('#pc,.gx-drawer,#rs')) closePop(); return; }
  const a = t.dataset.a, d = t.dataset;
  if (netClick(a, t)) return;
  if (d.start && !a) { newGame(d.start); return; }
  const num = x => x === undefined ? undefined : +x;
  switch (a) {
    case 'hcard': tapHand(+d.id); break;
    case 'dcard': tapDrone(+d.id); break;
    case 'playcard': playSel(); break;
    case 'hint': doHint(); break;
    case 'signal': if (canAct() && LD.pingMoves(G, viewSeat()).length) { UI.pingSel = true; UI.sel = -1; render(); } break;
    case 'noping': UI.pingSel = false; UI.sel = -1; render(); break;
    case 'doping': { const m = myMoves().find(x => x.t === 'ping' && x.c === UI.sel); if (m && canAct()) doMove(m); break; }
    case 'nosig': { const m = myMoves().find(x => x.t === 'nosig'); if (m && canAct()) doMove(m); break; }
    case 'pool': { if (!canAct()) break; UI.job = UI.job === +d.i ? -1 : +d.i; snd('click', { vol: .4 }); render(); break; }
    case 'take': { const m = myMoves().find(x => x.t === 'take' && x.i === num(d.i)); if (m && canAct()) doMove(m); else toast('You cannot take that job.'); break; }
    case 'pass': case 'done': case 'keep': case 'offer': case 'accept': case 'decline': case 'yes': case 'no': { const m = myMoves().find(x => x.t === a); if (m && canAct()) doMove(m); break; }
    case 'vote': { const m = myMoves().find(x => x.t === 'vote' && x.f === num(d.f)); if (m && canAct()) doMove(m); break; }
    case 'dist': { const on = d.on === 'true'; const m = myMoves().find(x => x.t === 'dist' && x.on === on && (!on || x.dir === num(d.dir))); if (m && canAct()) doMove(m); break; }
    case 'give': { const m = myMoves().find(x => x.t === 'give' && x.c === UI.giveSel); if (m && canAct()) doMove(m); break; }
    case 'predict': { const m = myMoves().find(x => x.t === 'predict' && x.n === num(d.n)); if (m && canAct()) doMove(m); break; }
    case 'job': openJob(+d.i); break;
    case 'seat': openSeat(+d.seat); break;
    case 'last': openLast(); break;
    case 'popx': closePop(); break;
    case 'tipok': tipOk(); break;
    case 'result': UI.overShown = false; showResult(); break;
    case 'nextdive': nextDive(); break;
    case 'retrysame': closeRS(); if (NET.on) { if (isHost()) { nextAttempt(true); } } else nextAttempt(true); break;
    case 'retrynew': closeRS(); if (NET.on) { if (isHost()) { nextAttempt(false); } } else nextAttempt(false); break;
    case 'rsclose': closeRS(); break;
    case 'takedev': case 'takeDevice': takeDevice(); break;
    case 'play': UI.sv = 'setup'; renderStart(); break;
    case 'story': campOpen(); break;
    case 'campfin': closeRS(); campFinish(); break;
    case 'descent': UI.sv = 'descent'; renderStart(); break;
    case 'descgo': closeRS(); descGo(); break;
    case 'descmap': closeRS(); showStart(); UI.sv = 'descent'; renderStart(); break;
    case 'descreset': descReset(); break;
    case 'dlgok': dlgOk(); break;
    case 'title': UI.sv = 'title'; UI.cfgOpen = false; renderStart(); break;
    case 'online': UI.sv = 'online'; UI.onl = true; renderStart(); break;
    case 'cfgopen': UI.cfgOpen = true; renderStart(); try { const c = $('#cfg'); if (c) c.querySelector('button').focus({ preventScroll: true }); } catch (e) { } break;
    case 'cfgclose': UI.cfgOpen = false; renderStart(); break;
    case 'seatchef': toggleChef(+d.c); renderStart(); break;
    case 'gfx': setGfx(d.v); renderMenu(); break;
    case 'menu': showStart(); break;
    case 'start': newGame(d.m); break;
    case 'guided': newGame('guided'); break;
    case 'opt': { const o = optObj(); if (d.k === 'np') setNp(+d.v); else if (d.k === 'kind') { o.kind = d.v; if (d.v === 'log' && !o.mission) o.mission = Prog.load().cur > 32 ? 32 : Prog.load().cur; if (d.v === 'deep') o.deep = Math.max(D.deep.start, Prog.load().deep.level); } else if (d.k === 'timer') o.timer = d.v === '1'; else { o[d.k] = isNaN(+d.v) ? d.v : +d.v; } renderStart(); break; }
    case 'pickdive': { const o = optObj(); o.mission = +d.v; renderStart(); break; }
    case 'jobstep': { const o = optObj(); o.job = Math.max(1, Math.min(96, ((o.job | 0) || 1) + (+d.v))); renderStart(); break; }
    case 'deepstep': { const o = optObj(); o.deep = Math.max(1, Math.min(60, (o.deep | 0) + (+d.v))); renderStart(); break; }
    case 'lv': { const o = optObj(); o.lv = (o.lv || DEF.lv).slice(); o.lv[+d.seat] = d.v; renderStart(); break; }
    case 'rules': GX.show('rulesd'); break;
    case 'ref': UI.refTab = UI.refTab || 'cards'; GX.show('refd'); break;
    case 'reftab': UI.refTab = d.v; { const b = $('#refwrap'); b.innerHTML = ''; b.append(buildRef()); } break;
    case 'save': toast(save() ? 'Dive saved.' : 'Could not save.'); break;
    case 'loadsave': if (!loadSave()) toast('No saved dive.'); break;
    case 'speed': AIDELAY = +d.v; savePrefs(); renderMenu(); break;
    case 'guide': UI.coach.level = d.v; UI.prefs.guide = d.v; savePrefs(); renderMenu(); break;
    case 'sound': UI.prefs.sound = !UI.prefs.sound; savePrefs(); try { if (window.GA) GA.setSfx(UI.prefs.sound); } catch (e) { } renderMenu(); break;
    case 'music': UI.prefs.music = !UI.prefs.music; savePrefs(); try { if (window.GA) GA.setMusic(UI.prefs.music); } catch (e) { } sndMusic(); renderMenu(); break;
    case 'emote': netEmote(d.v); break;
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') { if (UI.pop) closePop(); else if (UI.rsOpen && G && G.phase === 'over' && UI.overShown) closeRS(); } });
// ---------- phone mode ----------
function applyPhone() {
  const q = /[?&]phone=(\d)/.exec(location.search); const vm = (window.GXV ? GXV.now() : { w: innerWidth, h: innerHeight }), w = vm.w, hh = vm.h, short = Math.min(w, hh);
  let ph = short <= 500 || (window.matchMedia && matchMedia('(pointer:coarse)').matches && short <= 600);
  if (q) ph = q[1] === '1';
  const r = document.documentElement.classList, was = r.contains('ph');
  r.toggle('ph', ph); document.documentElement.style.setProperty('--dockh', Math.max(108, Math.min(128, Math.round(hh * .15))) + 'px'); r.toggle('ph-p', ph && w < hh); r.toggle('ph-l', ph && w >= hh);
  placePrompt(); if (was !== ph) { if (G && UI.started) render(); const st = $('#start'); if (st && !st.hidden && !NET.on && UI.sv === 'setup') renderStart(); }
}
function relayout() { applyPhone(); if (G && UI.started) render(); if (typeof pxResize === 'function') { try { pxResize(true); } catch (e) { } } }
// ---------- boot ----------
function boot() {
  GX.init({ key: 'ld' });
  GX.drawer('rulesd', 'How to play', buildRules(), true);
  GX.drawer('refd', 'Cards, jobs, dives', h('div#refwrap'), true);
  GX.drawer('jobd', 'All jobs', h('div#jobbody'));
  GX.drawer('logd', 'Log', h('div#logbody'));
  GX.drawer('setd', 'Menu', h('div#setbody'));
  GX.onShow = id => { renderDrawers(); };
  loadPrefs(); applyPhone();
  GXV.watch(relayout);
  try { if (window.GA) { const A = typeof GA_DATA !== 'undefined' ? GA_DATA : {}; GA.init({ sfx: A.sfx || {}, music: A.music || {}, key: 'ld' }); GA.setSfx(UI.prefs.sound); GA.setMusic(UI.prefs.music); } } catch (e) { }
  pxPerfReg();
  pxInit().then(ok => { if (ok) { pxPerfReg(); if (G && UI.started) render(); } });
  if (/[?&]seed=(\d+)/.test(location.search)) UI.seed = +RegExp.$1;
  netInit();
  renderStart();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
// ===================== part 6: sound (shared gameaudio samples; silent without Web Audio) =====================
// SND_MAP: one line per event. s:null means silent (a sample may be re-tuned by ear later: change s / vol here).
const SND_MAP = { click: { s: 'click', vol: .5 }, play: { s: 'play', vol: .7 }, slide: { s: 'slide', vol: .55 }, pass: { s: 'pass', vol: .6 }, take: { s: 'take', vol: .65 }, ping: { s: 'ping', vol: .7 }, trick: { s: 'trick', vol: .65 },
  done: { s: 'done', vol: .7 }, fail: { s: 'fail', vol: .7 }, deal: { s: 'deal', vol: .6 }, tick: { s: 'tick', vol: .4 }, win: { s: 'win', vol: .8 }, lose: { s: 'lose', vol: .75 }, error: { s: 'error', vol: .5 } };
// fallback when the sample bundle is missing (or Web Audio samples did not load): a few quiet oscillator notes
let SYN = null;
const SYN_N = { click: [[660, .04, 'square', .03]], play: [[220, .07, 'triangle', .08]], slide: [[300, .1, 'sine', .04]], pass: [[260, .12, 'sine', .04]], take: [[520, .08, 'triangle', .06]], ping: [[880, .3, 'sine', .1], [1320, .25, 'sine', .04]],
  trick: [[330, .08, 'triangle', .07], [440, .1, 'triangle', .07]], done: [[523, .1, 'sine', .08], [784, .18, 'sine', .08]], fail: [[300, .15, 'sawtooth', .05], [200, .3, 'sawtooth', .05]], deal: [[400, .05, 'square', .02]], tick: [[1200, .02, 'square', .02]],
  win: [[523, .14, 'triangle', .1], [659, .14, 'triangle', .1], [784, .3, 'triangle', .1]], lose: [[392, .2, 'sine', .09], [294, .4, 'sine', .09]], error: [[140, .12, 'square', .05]] };
function synth(name, vol) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC || /jsdom/i.test(navigator.userAgent || '')) return; const seq = SYN_N[name]; if (!seq) return;
    if (!SYN) SYN = new AC(); if (SYN.state === 'suspended') SYN.resume(); let t = SYN.currentTime;
    seq.forEach(([f, d, w, g]) => { const o = SYN.createOscillator(), a = SYN.createGain(); o.type = w; o.frequency.value = f; a.gain.setValueAtTime(0, t); a.gain.linearRampToValueAtTime(g * vol, t + .01); a.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(a); a.connect(SYN.destination); o.start(t); o.stop(t + d + .02); t += Math.min(d, .12); });
  } catch (e) { }
}
function snd(name, o) {
  try {
    if (UI.prefs && UI.prefs.sound === false) return;
    const m = SND_MAP[name] || { s: name, vol: 1 }; if (!m.s) return; if (!window.GA || !GA.has(m.s)) { synth(name, (o && o.vol != null ? o.vol : 1) * (m.vol != null ? m.vol : 1)); return; }
    const oo = Object.assign({}, o || {}); oo.vol = (oo.vol != null ? oo.vol : 1) * (m.vol != null ? m.vol : 1); GA.play(m.s, oo);
  } catch (e) { }
}
function sndMusic() {
  try {
    if (!window.GA) return;
    if (UI.prefs.music === false || !G || !UI.started) { GA.music(null); GA.stopLoop && GA.stopLoop('sea'); return; }
    GA.music('main', { vol: .3 }); if (GA.loop && GA.has && GA.has('sea')) GA.loop('sea', { vol: .14, fade: 1.5 });
  } catch (e) { }
}
document.addEventListener('click', e => { const t = e.target.closest('button'); if (t && !t.disabled && !t.matches('.hc,.dc,[data-a=play],[data-a=hcard],[data-a=dcard]')) snd('click'); }, true);
// ===================== part 7: the painted table (PixiJS 8: WebGL, else Pixi's canvas renderer, else the plain DOM view) =====================
// The DOM stays the layout, hit and accessibility layer: every card in your hand, every card on the table and every drone card is still a real
// <button> / box with data-px="card". When the Pixi table is on (html.ldpx) those boxes keep their place but hide their own SVG pictures, and
// pxSync() (after every render()) moves painted card sprites to their boxes. Cards ease to new places, a card you play flies from your hand
// to its slot, other divers' cards fly from their portrait, a finished trick is swept to the winner. Sprites only mirror what the DOM shows,
// so hidden hands stay hidden: a sprite exists only for a card the DOM shows face up.
const PX = { on: false, app: null, q: 'high', res: 1, kind: '', B: null, cv: null, L: {}, objs: new Map(), tweens: [], parts: [], tex: {}, img: {}, faceP: {}, dirty: true, t: 0, last: 0, err: '', ready: false, raf: 0, nPlay: 0, nSweep: 0 };
const PXQ = { high: { pr: 2, fx: 1, blur: true, parts: 1, bub: 1 }, medium: { pr: 1.5, fx: .55, blur: false, parts: .5, bub: .6 }, low: { pr: 1.5, fx: 0, blur: false, parts: 0, bub: 0 } };
const pxRM = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } };
function gfxAuto() { const n = navigator.hardwareConcurrency || 4, mem = navigator.deviceMemory || 4, ph = isPh(); if (n <= 2 || mem <= 2) return 'low'; if (PX.soft) return 'low'; return ph ? 'medium' : 'high'; }
function gfxPref() { return UI.prefs.gfx || 'auto'; }
function gfxLevel() { const p = gfxPref(); return p === 'auto' ? (PX.autoQ || gfxAuto()) : p; }
// ---- boot: inject the stored Pixi source, make the renderer, load the textures ----
async function pxInit() {
  try {
    if (/jsdom/i.test(navigator.userAgent || '') || /[?&]px=0/.test(location.search) || typeof LD_ART === 'undefined' || !KIT.ART.emb0) return false;
    if (!window.PIXI) { const src = document.getElementById('pixi-src'); if (!src) return false; const s = document.createElement('script'); s.textContent = src.textContent; document.head.appendChild(s); }
    if (!window.PIXI || !PIXI.Application) return false;
    const bd = $('#bd'); const cv = document.createElement('canvas'); cv.id = 'pxc'; cv.setAttribute('aria-hidden', 'true'); bd.insertBefore(cv, bd.firstChild);
    PX.q = gfxLevel(); PX.res = pxBasePR();
    const want = /[?&]px=canvas/.test(location.search) ? ['canvas'] : ['webgl', 'canvas'];
    let app = null;
    for (const pref of want) {
      try { const a = new PIXI.Application(); await a.init({ canvas: cv, backgroundAlpha: 0, antialias: false, resolution: PX.res, autoDensity: true, preference: pref, autoStart: false, sharedTicker: false, width: Math.max(16, bd.clientWidth), height: Math.max(16, bd.clientHeight), powerPreference: 'low-power', failIfMajorPerformanceCaveat: false, hello: false }); app = a; PX.kind = (a.renderer && a.renderer.name) || pref; break; }
      catch (e) { PX.err += pref + ': ' + (e && e.message || e) + '; '; }
    }
    if (!app) { cv.remove(); return false; }
    PX.app = app; PX.cv = cv;
    try { const gl = app.renderer.gl; if (gl) { const ext = gl.getExtension('WEBGL_debug_renderer_info'); const r = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : ''; if (/swiftshader|llvmpipe|software/i.test(r)) PX.soft = true; PX.gpu = r; } } catch (e) { }
    if (gfxPref() === 'auto') { PX.q = gfxLevel(); pxSetRes(pxBasePR()); }
    cv.addEventListener('webglcontextlost', e => { e.preventDefault(); pxOff('context lost'); });
    await pxTextures();
    const st = app.stage; const C = () => new PIXI.Container();
    PX.L = { felt: C(), amb: C(), hand: C(), trick: C(), fly: C(), fx: C() };
    for (const k of ['felt', 'amb', 'hand', 'trick', 'fly', 'fx']) st.addChild(PX.L[k]);
    PX.L.hand.sortableChildren = true; PX.L.trick.sortableChildren = true;
    PX.handMask = new PIXI.Graphics(); st.addChild(PX.handMask); PX.L.hand.mask = PX.handMask;
    PX.handBg = new PIXI.Sprite(PX.tex.handgrad); PX.L.felt.addChild(PX.handBg);
    PX.mat = new PIXI.Graphics(); PX.L.felt.addChild(PX.mat);
    PX.caus = new PIXI.TilingSprite({ texture: PX.tex.caustic, width: 10, height: 10 }); PX.caus.alpha = .5; PX.L.felt.addChild(PX.caus);
    PX.on = true; PX.ready = true; document.documentElement.classList.add('ldpx');
    pxApplyQ();
    const hd = $('#hand'); if (hd) hd.addEventListener('scroll', pxDirty, { passive: true });
    if (window.ResizeObserver) new ResizeObserver(() => { pxResize(); }).observe(bd);
    pxResize(); pxLoop();
    return true;
  } catch (e) { console.warn('painted table off:', e); pxOff(String(e && e.message || e)); return false; }
}
function pxOff(why) {
  PX.on = false; PX.err += (why || '') + ';'; document.documentElement.classList.remove('ldpx');
  try { if (PX.cv) PX.cv.remove(); } catch (e) { }
  try { if (G && UI.started) render(); } catch (e) { }
}
function pxBasePR() { const d = window.devicePixelRatio || 1; const q = PXQ[PX.q] || PXQ.high; const w = Math.min(q.pr, d); return window.PerfHUD && PerfHUD.pixelRatio ? PerfHUD.pixelRatio(w) : w; }
function pxSetRes(v) { PX.res = v; if (PX.app && PX.app.renderer) { try { PX.app.renderer.resolution = v; pxResize(true); } catch (e) { } } }
function pxApplyQ() {
  PX.q = gfxLevel(); pxSetRes(pxBasePR());
  const q = PXQ[PX.q];
  try { PX.L.fx.filters = q.blur ? [new PIXI.BlurFilter({ strength: 1.4, quality: 2 })] : null; } catch (e) { }
  if (PX.caus) PX.caus.visible = !!q.fx;
  if (!q.bub) { for (const p of PX.parts) if (p.kind === 'bub') p.life = 0; }
  PX.dirty = true;
}
function setGfx(v) { UI.prefs.gfx = v; savePrefs(); PX.autoQ = null; if (PX.on) { pxApplyQ(); pxPerfReg(); } }
// ---- textures: painted pictures (blob URLs from LD_ART) + small generated sprites ----
function pxLoadImg(url) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; }); }
async function pxTextures() {
  const ids = Object.keys(KIT.ART);
  await Promise.all(ids.map(async k => { try { const im = await pxLoadImg(KIT.ART[k]); PX.img[k] = im; PX.tex[k] = PIXI.Texture.from(im); } catch (e) { } }));
  const mk = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); return PIXI.Texture.from(c); };
  const radial = stops => (x, w, h) => { const g = x.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2); stops.forEach(s => g.addColorStop(s[0], s[1])); x.fillStyle = g; x.fillRect(0, 0, w, h); };
  PX.tex.shadow = mk(64, 64, radial([[0, 'rgba(0,8,24,.6)'], [.55, 'rgba(0,8,24,.3)'], [1, 'rgba(0,8,24,0)']]));
  PX.tex.glow = mk(64, 64, radial([[0, 'rgba(255,224,130,.95)'], [.5, 'rgba(255,200,80,.4)'], [1, 'rgba(255,190,60,0)']]));
  PX.tex.puff = mk(48, 48, radial([[0, 'rgba(220,244,255,.9)'], [.45, 'rgba(200,236,255,.5)'], [1, 'rgba(200,236,255,0)']]));
  PX.tex.spark = mk(32, 32, (x, w, h) => { x.translate(w / 2, h / 2); x.fillStyle = '#fff3b0'; x.strokeStyle = '#0b2038'; x.lineWidth = 1.5; x.beginPath(); for (let i = 0; i < 8; i++) { const r = i % 2 ? 4 : 14, a = i / 8 * Math.PI * 2; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fill(); x.stroke(); });
  PX.tex.bub = mk(24, 24, (x, w, h) => { x.strokeStyle = 'rgba(220,244,255,.85)'; x.lineWidth = 2; x.beginPath(); x.arc(w / 2, h / 2, 9, 0, Math.PI * 2); x.stroke(); x.fillStyle = 'rgba(255,255,255,.7)'; x.beginPath(); x.arc(w / 2 - 3, h / 2 - 3, 2.4, 0, Math.PI * 2); x.fill(); });
  PX.tex.ring = mk(96, 96, (x, w, h) => { x.strokeStyle = 'rgba(255,224,130,.95)'; x.lineWidth = 6; x.beginPath(); x.arc(w / 2, h / 2, 40, 0, Math.PI * 2); x.stroke(); });
  PX.tex.cardShadow = mk(80, 108, (x, w, h) => { x.filter = 'blur(6px)'; x.fillStyle = 'rgba(0,6,20,.6)'; x.beginPath(); x.roundRect ? x.roundRect(12, 12, w - 24, h - 24, 8) : x.rect(12, 12, w - 24, h - 24); x.fill(); });
  PX.tex.cardGlow = mk(96, 124, (x, w, h) => { x.filter = 'blur(8px)'; x.fillStyle = 'rgba(255,216,115,.95)'; x.beginPath(); x.roundRect ? x.roundRect(14, 14, w - 28, h - 28, 10) : x.rect(14, 14, w - 28, h - 28); x.fill(); });
  PX.tex.handgrad = mk(4, 64, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(2,10,24,0)'); g.addColorStop(.3, 'rgba(2,10,24,.5)'); g.addColorStop(1, 'rgba(2,10,24,.6)'); x.fillStyle = g; x.fillRect(0, 0, w, h); });
  // caustics: soft light pools only (filled radial blobs, no outlines)
  PX.tex.caustic = mk(256, 256, (x, w, h) => { x.clearRect(0, 0, w, h); let s = 7; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; for (let i = 0; i < 16; i++) { const cx = r() * w, cy = r() * h, rr = 22 + r() * 40; for (const [ox, oy] of [[0, 0], [w, 0], [-w, 0], [0, h], [0, -h]]) { const g = x.createRadialGradient(cx + ox, cy + oy, 0, cx + ox, cy + oy, rr); g.addColorStop(0, 'rgba(170,230,255,.16)'); g.addColorStop(1, 'rgba(170,230,255,0)'); x.fillStyle = g; x.beginPath(); x.ellipse(cx + ox, cy + oy, rr, rr * .7, 0, 0, 7); x.fill(); } } });
}
function svgImgP(svg) { return pxLoadImg('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)); }
// a card face at w CSS px, drawn straight on a canvas (no SVG decoding, so it is ready at once): paper, frame, the painted emblem, crisp numerals
function pxFace(id, w) {
  const r = Math.min(2, Math.max(1, window.devicePixelRatio || 1)), key = id + '|' + w + '|' + r;   // faces are always drawn at the screen's own sharpness (2x phones), whatever the graphics level
  if (PX.tex['f:' + key]) return PX.tex['f:' + key];
  const s = suitOf(id), v = valOf(id), lan = s === 4, su = D.suits[s], H = Math.round(w * 1.4);
  const c = document.createElement('canvas'); c.width = Math.round(w * r); c.height = Math.round(H * r); const x = c.getContext('2d'); x.scale(r, r);
  const rad = w * .085, bw = Math.max(1.6, w * .026), INK = '#0b1f3a';
  const rr = (X, Y, W2, H2, R) => { x.beginPath(); if (x.roundRect) x.roundRect(X, Y, W2, H2, R); else x.rect(X, Y, W2, H2); };
  const g = x.createLinearGradient(0, 0, w, H); g.addColorStop(0, lan ? '#16336b' : '#fffaf0'); g.addColorStop(1, lan ? '#0a1730' : '#e9dfc2');
  rr(bw / 2, bw / 2, w - bw, H - bw, rad); x.fillStyle = g; x.fill(); x.lineWidth = bw; x.strokeStyle = INK; x.stroke();
  rr(w * .05, w * .05, w * .9, H - w * .1, rad * .7); x.lineWidth = Math.max(1.2, w * .02); x.strokeStyle = lan ? '#d9b04a' : su.c; x.globalAlpha = .85; x.stroke(); x.globalAlpha = 1;
  if (lan) { x.fillStyle = '#9fd0ff'; for (let i = 0; i < 9; i++) { x.globalAlpha = .5; x.beginPath(); x.arc(w * (.12 + ((i * 37) % 76) / 100), H * (.1 + ((i * 53) % 80) / 100), w * (.008 + (i % 3) * .004), 0, 7); x.fill(); } x.globalAlpha = 1; }
  const im = PX.img['emb' + s]; const ew = w * .56;
  if (im) x.drawImage(im, (w - ew) / 2, H * .5 - ew * .5, ew, ew);
  const FAM = "Nunito,'Trebuchet MS','Segoe UI',system-ui,'DejaVu Sans',sans-serif";
  const corner = rot => { x.save(); if (rot) { x.translate(w / 2, H / 2); x.rotate(Math.PI); x.translate(-w / 2, -H / 2); }
    x.font = '900 ' + (w * .3) + 'px ' + FAM; x.textBaseline = 'alphabetic'; x.textAlign = 'left'; x.lineJoin = 'round'; x.lineWidth = w * .04; x.strokeStyle = lan ? INK : '#fff'; x.strokeText(String(v), w * .15, w * .36); x.fillStyle = lan ? '#ffd873' : su.dk; x.fillText(String(v), w * .15, w * .36);
    if (im) x.drawImage(im, w * .1, w * .41, w * .2, w * .2); x.restore(); };
  corner(false); corner(true);
  const tex = PIXI.Texture.from(c); PX.tex['f:' + key] = tex; return tex;
}
function pxBack(w) {
  const r = Math.min(2, Math.max(1, PX.res)), key = 'bk|' + w + '|' + r; if (PX.tex[key]) return PX.tex[key];
  const H = Math.round(w * 1.4), c = document.createElement('canvas'); c.width = Math.round(w * r); c.height = Math.round(H * r); const x = c.getContext('2d'); x.scale(r, r);
  const rr = w * .085; x.beginPath(); x.roundRect ? x.roundRect(1, 1, w - 2, H - 2, rr) : x.rect(1, 1, w - 2, H - 2); x.save(); x.clip(); if (PX.img.back) x.drawImage(PX.img.back, 0, 0, w, H); else { x.fillStyle = '#12356c'; x.fillRect(0, 0, w, H); } x.restore();
  x.lineWidth = Math.max(1.2, w * .026); x.strokeStyle = '#0b1f3a'; x.stroke();
  const t = PIXI.Texture.from(c); PX.tex[key] = t; return t;
}
// make every card face for the sizes in use ahead of time, in small chunks, so a card never flies in without its picture
function pxPrewarm() {
  if (!PX.on) return; const hw = Math.round(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hw')) || 60), cw = Math.round(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cw')) || 50), dw = Math.round(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dw')) || 44);
  const key = hw + '|' + cw + '|' + dw + '|' + PX.res; if (PX.warm === key) return; PX.warm = key; const ws = [...new Set([hw, cw, dw])]; let i = 0; const all = []; for (const w of ws) for (let id = 0; id < 40; id++) all.push([id, w]);
  const step = () => { if (!PX.on || PX.warm !== key) return; for (let k = 0; k < 14 && i < all.length; k++, i++) pxFace(all[i][0], all[i][1]); if (i < all.length) setTimeout(step, 16); }; step();
}
// ---- the layout read: one pass over the DOM after each render ----
let pxQueued = false;
function pxDirty() { if (!PX.on || pxQueued) return; try { if (window.PerfHUD && PerfHUD.wake) PerfHUD.wake(); } catch (e) { } pxQueued = true; requestAnimationFrame(() => { pxQueued = false; try { pxSync(); } catch (e) { console.error(e); } }); }
function pxResize(force) {
  if (!PX.app) return; const bd = $('#bd'); const w = Math.max(16, bd.clientWidth), h = Math.max(16, bd.clientHeight);
  if (force || w !== PX.w || h !== PX.h) { PX.w = w; PX.h = h; try { PX.app.renderer.resize(w, h, PX.res); } catch (e) { } PX.dirty = true; }
  pxDirty();
}
function pxRect(el, B) { const r = el.getBoundingClientRect(); return { x: r.left - B.left, y: r.top - B.top, w: r.width, h: r.height }; }
function pxDrawFelt(R) {
  const g = PX.mat; g.clear(); if (!R) return;
  g.roundRect(R.x + 4, R.y + 2, R.w - 8, R.h - 4, 22).fill({ color: 0x0d3b6e, alpha: .5 });
  g.roundRect(R.x + 4, R.y + 2, R.w - 8, R.h - 4, 22).stroke({ color: 0x8fcdf5, alpha: .3, width: 2 });
  g.roundRect(R.x + 12, R.y + 9, R.w - 24, R.h - 18, 16).stroke({ color: 0xffd873, alpha: .16, width: 1.5 });
  PX.caus.x = R.x + 4; PX.caus.y = R.y + 2; PX.caus.width = Math.max(1, R.w - 8); PX.caus.height = Math.max(1, R.h - 4);
  PX.feltR = R;
}
function pxSeatRect(s, B) { const e = document.querySelector('[data-key="seat' + s + '"]'); return e ? pxRect(e, B) : null; }
function pxSync() {
  if (!PX.on || !G || !UI.started) { if (PX.on) pxClear(); return; }
  try { if (window.PerfHUD && PerfHUD.wake) PerfHUD.wake(); } catch (e) { }   // a table change must never wait for the idle-frame saver
  const bd = $('#bd'); const B = bd.getBoundingClientRect(); PX.B = B;
  const seen = new Set(), now = performance.now();
  const ent = UI.enter || ''; UI.enter = ''; const exit = UI.pxExit; UI.pxExit = null;
  pxPrewarm(); const fl = $('#felt'); if (fl) pxDrawFelt(pxRect(fl, B));
  const hz = $('#handz'); PX.handR = hz ? pxRect(hz, B) : null;
  const els = [...document.querySelectorAll('#bd [data-px=card]')];
  let hi = 0;
  els.forEach(el => {
    const key = el.dataset.pk, R = pxRect(el, B), id = +el.dataset.id; seen.add(key);
    const isTrick = key[0] === 't', isHand = key[0] === 'h';
    let o = PX.objs.get(key), fresh = false;
    if (!o && isTrick) { const old = PX.objs.get('h:' + id); if (old && !seen.has('h:' + id)) { PX.objs.delete('h:' + id); old.key = key; old.detached = false; old.c.parent && old.c.parent.removeChild(old.c); PX.L.trick.addChild(old.c); old.layer = 'trick'; PX.objs.set(key, old); o = old; PX.nPlay++; } }
    if (!o) { o = pxCardObj(key, isTrick ? 'trick' : 'hand'); fresh = true; }
    o.id = id; o.sel = el.classList.contains('sel'); o.dim = el.classList.contains('dim'); o.pk = el.classList.contains('pk'); o.pinged = el.classList.contains('pinged');
    o.tx = R.x; o.ty = R.y; o.tw = R.w; o.seatOf = +(el.dataset.seat || -1); o.drone = el.classList.contains('dc');
    if (isHand) { o.z = ++hi; o.c.zIndex = o.z; } else o.c.zIndex = 50 + (o.idx || 0);
    if (fresh) {
      if (isTrick) {
        const sr = o.seatOf >= 0 ? pxSeatRect(o.seatOf, B) : null;
        if (sr && ANIM) { o.x = sr.x + sr.w / 2 - R.w * .3; o.y = sr.y + sr.h / 2 - R.w * .4; o.w = R.w * .6; o.a = 0; PX.nPlay++; } else { o.x = R.x; o.y = R.y; o.w = R.w; }
      } else if (ANIM && ent === 'deal' && !o.drone) { o.x = PX.w / 2 - R.w / 2; o.y = -R.w * 1.6; o.w = R.w * .7; o.delay = now + hi * 32; o.rot = -.4 + hi * .06; o.flip = 1; o.flipUntil = now + 1100 + hi * 40; }
      else { o.x = R.x; o.y = R.y; o.w = R.w; }
    }
    pxCardTex(o);
  });
  for (const [key, o] of [...PX.objs]) {
    if (seen.has(key) || o.detached) continue;
    if (!ANIM || !PX.ready) { pxKill(o); continue; }
    o.detached = true; o.c.parent && o.c.parent !== PX.L.fly && (o.c.parent.removeChild(o.c), PX.L.fly.addChild(o.c)); o.c.zIndex = 100;
    if (key[0] === 't' && exit && exit.seat != null) {
      const sr = pxSeatRect(exit.seat, B); PX.nSweep++;
      if (sr) { const idx = o.seatOf; pxTween(o, { x: sr.x + sr.w / 2 - o.w * .2, y: sr.y + sr.h / 2 - o.w * .3, w: o.w * .4, a: 0 }, 480, 'in', () => pxKill(o), { delay: 0 }); continue; }
    }
    pxTween(o, { a: 0, y: o.y + 18 }, 240, 'in', () => pxKill(o));
  }
  if (PX.handR && PX.handBg) { PX.handBg.x = PX.handR.x; PX.handBg.y = PX.handR.y; PX.handBg.width = PX.handR.w; PX.handBg.height = PX.handR.h; }
  if (PX.handR) { PX.handMask.clear(); PX.handMask.rect(PX.handR.x, PX.handR.y - 40, PX.handR.w, PX.handR.h + 44).fill(0xffffff); }
  // ripples and sparks requested by the UI
  if (UI.pxPing != null) { const sr = pxSeatRect(UI.pxPing, B); UI.pxPing = null; if (sr) pxRipple(sr.x + sr.w / 2, sr.y + sr.h / 2); }
  if (UI.pxSpark != null) { const e = document.querySelector('[data-i="' + UI.pxSpark + '"]'); UI.pxSpark = null; if (e) { const r = pxRect(e, B); pxBurst(r.x + r.w / 2, r.y + r.h / 2); } }
  PX.dirty = true;
}
function pxClear() { for (const [, o] of PX.objs) pxKill(o); if (PX.mat) PX.mat.clear(); PX.dirty = true; }
// ---- cards ----
function pxCardObj(key, layer) {
  const c = new PIXI.Container(); const sh = new PIXI.Sprite(PX.tex.cardShadow), gl = new PIXI.Sprite(PX.tex.cardGlow), lg = new PIXI.Sprite(PX.tex.glow), sp = new PIXI.Sprite(PIXI.Texture.EMPTY);
  sh.anchor.set(.5); gl.anchor.set(.5); lg.anchor.set(.5); sp.anchor.set(.5); gl.alpha = 0; lg.alpha = 0; c.addChild(sh, gl, lg, sp);
  const o = { key, kind: 'card', layer, c, sh, gl, lg, sp, x: 0, y: 0, w: 60, tx: 0, ty: 0, tw: 60, a: 1, s: 1, sq: 0, rot: 0, flip: 0, lift: 0, idx: 0 };
  (layer === 'trick' ? PX.L.trick : PX.L.hand).addChild(c); PX.objs.set(key, o); return o;
}
function pxCardTex(o) {
  const w = Math.round(o.tw || 60); const t = pxFace(o.id, w);
  if (t) { o.face = t; } o.faceW = w; o.backT = pxBack(w);
}
function pxKill(o) { PX.objs.delete(o.key); for (const t of PX.tweens) if (t.o === o) t.dead = true; PX.tweens = PX.tweens.filter(t => !t.dead); try { o.c.destroy({ children: true }); } catch (e) { } PX.dirty = true; }
// ---- tweens ----
const EASE = { out: t => 1 - Math.pow(1 - t, 3), in: t => t * t * t, io: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, back: t => { const c = 1.6; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); } };
function pxTween(o, to, ms, ease, done, extra) {
  const k = ANIM && !pxRM() ? Math.max(.5, AIDELAY > 0 ? Math.min(1.6, AIDELAY / 650) : .5) : 0;
  const tw = Object.assign({ o, to, from: {}, t0: performance.now() + ((extra && extra.delay) || 0), ms: Math.max(1, ms * (k || 0)), ease: EASE[ease] || EASE.out, done }, extra || {});
  for (const p in to) tw.from[p] = o[p];
  PX.tweens.push(tw); o.busy = (o.busy || 0) + 1; PX.dirty = true; return tw;
}
function pxStepTweens(now) {
  const done = [];
  for (const tw of PX.tweens.slice()) {
    if (tw.dead || now < tw.t0) continue;
    const u = Math.min(1, (now - tw.t0) / tw.ms), e = tw.ease(u), o = tw.o;
    for (const p in tw.to) o[p] = tw.from[p] + (tw.to[p] - tw.from[p]) * e;
    if (tw.arc) o.y -= Math.sin(u * Math.PI) * tw.arc;
    if (tw.step) tw.step(u);
    if (u >= 1) { tw.dead = true; done.push(tw); }
  }
  if (done.length) PX.tweens = PX.tweens.filter(t => !t.dead);
  for (const tw of done) { tw.o.busy = Math.max(0, (tw.o.busy || 0) - 1); if (tw.done) try { tw.done(); } catch (er) { console.error(er); } }
}
// ---- effects ----
function pxPart(kind, x, y, o) {
  const q = PXQ[PX.q]; if (!q.parts && kind !== 'bub') return; if (kind === 'bub' && !q.bub) return; if (PX.parts.length > 120) return;
  const sp = new PIXI.Sprite(PX.tex[kind === 'ring' ? 'ring' : kind]); sp.anchor.set(.5); sp.x = x; sp.y = y;
  (o.noFilter || kind === 'bub' ? PX.L.amb : PX.L.fx).addChild(sp);
  PX.parts.push(Object.assign({ sp, kind, t: 0, vx: 0, vy: 0, g: 0, life: 1, s0: 1, s1: 1, a0: 1, rot: 0 }, o)); PX.dirty = true;
}
function pxStepParts(dt) {
  const keep = [];
  for (const p of PX.parts) {
    p.t += dt; const u = p.t / p.life; if (u >= 1) { p.sp.destroy(); continue; }
    p.vy += p.g * dt; p.sp.x += p.vx * dt; p.sp.y += p.vy * dt; p.sp.rotation += p.rot * dt;
    const s = p.s0 + (p.s1 - p.s0) * u; p.sp.scale.set(s); p.sp.alpha = p.a0 * (u < .15 ? u / .15 : 1 - (u - .15) / .85);
    keep.push(p);
  }
  PX.parts = keep;
}
function pxBurst(x, y) { const q = PXQ[PX.q]; const n = q.parts ? Math.round(10 * q.parts) + 4 : 0; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2 + Math.random() * .4, sp = 50 + Math.random() * 60; pxPart('spark', x, y, { vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, g: 120, life: .7 + Math.random() * .3, s0: .5 + Math.random() * .4, s1: .2, rot: (Math.random() - .5) * 6, noFilter: true }); } }
function pxRipple(x, y) { if (!PXQ[PX.q].parts) return; pxPart('ring', x, y, { life: 1, s0: .2, s1: 1.4, a0: .9, noFilter: true }); pxPart('ring', x, y, { life: 1.3, s0: .1, s1: 2.0, a0: .6, noFilter: true }); }
function pxAmbient(dt) {
  const q = PXQ[PX.q]; if (!q.bub || pxRM() || !PX.feltR) return;
  PX.amb = (PX.amb || 0) + dt; if (PX.amb < .55 / q.bub) return; PX.amb = 0;
  const R = PX.feltR; const x = 6 + Math.random() * (PX.w - 12), y = PX.h - 10;
  pxPart('bub', x, y, { vx: (Math.random() - .5) * 10, vy: -(24 + Math.random() * 30), life: 6 + Math.random() * 4, s0: .5 + Math.random() * .7, s1: .6 + Math.random() * .8, a0: .5, noFilter: true });
}
// ---- the frame ----
function pxLoop() {
  const PH = window.PerfHUD && PerfHUD.live ? PerfHUD : null;
  const tick = ts => { PX.raf = (PH ? PH.raf : requestAnimationFrame)(tick); try { pxFrame(ts); } catch (e) { console.error(e); } };
  PX.raf = (PH ? PH.raf : requestAnimationFrame)(tick);
}
function pxMoving() { return PX.tweens.length > 0 || [...PX.objs.values()].some(o => !o.detached && (Math.abs(o.x - o.tx) > .5 || Math.abs(o.y - o.ty) > .5 || Math.abs(o.w - o.tw) > .5)); }
const PerfHUDtesting = () => !!(window.PerfHUD && PerfHUD.testing);
function pxFrame(ts) {
  if (!PX.on) return;
  const now = performance.now(), dt = Math.min(.05, Math.max(0, (now - (PX.last || now)) / 1000)); PX.last = now; PX.t += dt;
  const q = PXQ[PX.q], snap = !ANIM || pxRM();
  pxStepTweens(now); pxStepParts(dt); pxAmbient(dt);
  let moving = PX.tweens.length > 0 || PX.parts.length > 0;
  if (PX.caus && PX.caus.visible && !snap) { PX.caus.tilePosition.x += dt * 9; PX.caus.tilePosition.y += dt * 5; moving = true; }
  const kf = snap ? 1 : 1 - Math.exp(-dt * 13);
  for (const [, o] of PX.objs) {
    if (o.kind !== 'card') continue;
    if (!o.detached && !o.busy && !(o.delay && now < o.delay)) { o.x += (o.tx - o.x) * kf; o.y += (o.ty - o.y) * kf; o.w += (o.tw - o.w) * kf; if (o.flip && (Math.abs(o.y - o.ty) < 6 || (o.flipUntil && now > o.flipUntil))) o.flip = 0; if (o.rot && !o.busy) o.rot *= (1 - kf); if (o.a < 1 && !o.detached) o.a += (1 - o.a) * kf; }
    if (o.delay && now >= o.delay) o.delay = 0;
    if (!o.detached && (Math.abs(o.x - o.tx) > .4 || Math.abs(o.y - o.ty) > .4 || Math.abs(o.w - o.tw) > .4 || o.a < .99)) moving = true;
    const lift = o.sel && !o.detached ? 1 : 0; o.lift += (lift - o.lift) * (snap ? 1 : 1 - Math.exp(-dt * 16));
    const w = o.w, h = w * 1.4, c = o.c;
    c.x = o.x + w / 2; c.y = o.y + h / 2; c.rotation = o.rot || 0; c.alpha = o.a * (o.delay ? 0 : 1);
    const tex = o.flip ? o.backT : o.face; if (tex && o.sp.texture !== tex) o.sp.texture = tex;
    const sc = (o.s || 1) * (1 + o.lift * .05);
    o.sp.width = w * sc; o.sp.height = h * sc; o.sp.alpha = tex ? 1 : 0;
    o.sp.tint = o.dim && !o.detached && o.layer === 'hand' ? 0xa9b8d0 : 0xffffff;
    o.sh.width = w * 1.25; o.sh.height = h * 1.18; o.sh.x = 3 + o.lift * 4; o.sh.y = 5 + o.lift * 8; o.sh.alpha = tex ? .55 + o.lift * .2 : 0;
    const lan = o.id >= 36, pulse = .8 + .2 * Math.sin(PX.t * 3 + o.id);
    o.gl.width = w * (o.pk ? 1.14 : 1.5); o.gl.height = h * (o.pk ? 1.1 : 1.35); o.gl.tint = o.pk ? 0x35c27b : 0xffffff; o.gl.alpha = tex ? (o.lift * (q.fx ? .9 : .6) + (o.pk ? .55 : 0)) * pulse : 0;
    o.lg.width = w * 1.9; o.lg.height = w * 1.9; o.lg.alpha = lan && q.fx && !o.dim ? .28 * pulse : 0;
    if (o.lift > .01 && o.lift < .99) moving = true; if (o.pk || (lan && q.fx)) moving = true;
  }
  PX.moving = moving;
  if (moving || PX.dirty || PerfHUDtesting()) { PX.dirty = false; try { PX.app.renderer.render(PX.app.stage); PX.frames = (PX.frames || 0) + 1; } catch (e) { pxOff('render: ' + (e && e.message)); } }
}
// ---- PerfHUD: levels, pixel ratio cap, "something is moving" for the idle saver
function pxPerfReg() {
  try {
    if (!window.PerfHUD || !PerfHUD.register) return;
    const shim = PX.on ? { getPixelRatio: () => PX.res, setPixelRatio: v => pxSetRes(v), get domElement() { return PX.cv; }, getContext: () => PX.app && PX.app.renderer && PX.app.renderer.gl || null } : null;
    PerfHUD.register({ game: 'Lantern Dive', anchor: '.gx-board', corner: 'tl', renderer: shim, levels: ['high', 'medium', 'low'],
      getLevel: () => PX.q, isAuto: () => gfxPref() === 'auto',
      setLevel: (l, why) => { if (why === 'apply') setGfx(l); else { PX.autoQ = l; pxApplyQ(); } try { if (GX.open === 'setd') renderMenu(); } catch (e) { } },
      basePR: () => { const d = window.devicePixelRatio || 1; return Math.min((PXQ[PX.q] || PXQ.high).pr, d); }, onPixelRatio: v => pxSetRes(v),
      isAnimating: () => !!UI.busy || !!PX.tweens.length || !!PX.parts.length || !!PX.moving, idleMode: PX.on ? 'throttle' : 'demand', idleFps: 10 });
  } catch (e) { }
}
// share of painted (non-transparent) pixels in the canvas: the table is never blank
function pxPainted() { try { const c = PX.app.renderer.extract.canvas({ target: PX.app.stage, resolution: .25 }); const x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 20) n++; return +(n / (d.length / 4)).toFixed(3); } catch (e) { return -1; } }
// test hook: where every sprite is and whether anything still moves (px-test.js)
PX.state = () => ({ nPlay: PX.nPlay || 0, nSweep: PX.nSweep || 0, on: PX.on, kind: PX.kind, q: PX.q, res: PX.res, tweens: PX.tweens.length, parts: PX.parts.length, moving: pxMoving(), frames: PX.frames || 0, err: PX.err, blur: !!(PX.L.fx && PX.L.fx.filters && PX.L.fx.filters.length), canvasOK: pxPainted(),
  objs: [...PX.objs.values()].filter(o => !o.detached).map(o => ({ key: o.key, id: o.id, layer: o.layer, x: o.x, y: o.y, w: o.w, tx: o.tx, ty: o.ty, tw: o.tw, face: !!o.face && o.sp.texture === o.face, alpha: o.c.alpha })) });
// ===================== part 8: the Descent (zones, oxygen, bosses with curses), character dialogs, Mara's training dive =====================
// The Descent and the boss curses are our own addition on top of the published rules (see ../rules-notes.md, "Descent mode").
// ---------- characters (code-drawn portraits; placeholders until painted art replaces them) ----------
const CHAR = {
  mara: { name: 'Mara', role: 'your old dive instructor', col: '#e9b44c' },
  eel: { name: 'Snapjaw the Eel', role: 'boss of the Sunlit Reef', col: '#6fbf73',
    intro: 'Sssso… fresh divers in MY reef. I bite when you least expect it. Every second trick I twist the rules!',
    hit: ['Ow! My tail!', 'Grrr… lucky trick.', 'Sssstop that!'], win: 'Hah! Back to the surface with you!', lose: 'Nooo… my reef… take it, then.' },
  witch: { name: 'The Kelp Witch', role: 'boss of the Kelp Forest', col: '#b27fd6',
    intro: 'Welcome to my garden, little lights. I put Lanterns to sleep and turn the tides upside down.',
    hit: ['You cut my kelp!', 'Hmph. A clever trick.', 'My garden… withers!'], win: 'Tangled at last. Swim home, little lights.', lose: 'My spells… unravelled. Pass, then.' },
  angler: { name: 'The Gloom Angler', role: 'boss of the Twilight Trench', col: '#5fa8d9',
    intro: 'Follow my little light… In my trench every colour bites, Lanterns doze, and the low ones rise.',
    hit: ['My lure! You dimmed it!', 'Ghhh… sharper than you look.', 'The dark remembers this!'], win: 'Into the dark you go. Forever.', lose: 'My light… goes out…' },
  leviathan: { name: 'The Leviathan', role: 'the deep itself', col: '#e05a5a',
    intro: 'I AM THE ABYSS. EVERY TRICK, MY CURSE. FINISH YOUR JOBS… IF YOU CAN.',
    hit: ['THE DEEP… TREMBLES.', 'YOU… WOUND ME?', 'IMPOSSIBLE!'], win: 'THE ABYSS KEEPS WHAT IT TAKES.', lose: 'THE LANTERNS… REACH… THE BOTTOM. YOU HAVE WON.' }
};
function portraitSVG(id, size) {
  const s = size || 96, w = (b) => '<svg viewBox="0 0 100 100" width="' + s + '" height="' + s + '" aria-hidden="true">' + b + '</svg>';
  const bg = c => '<defs><radialGradient id="pg' + id + '" cx="50%" cy="40%" r="65%"><stop offset="0" stop-color="' + c + '" stop-opacity=".55"/><stop offset="1" stop-color="#04122a"/></radialGradient></defs><circle cx="50" cy="50" r="49" fill="url(#pg' + id + ')" stroke="' + c + '" stroke-width="3"/>';
  if (id === 'mara') return w(bg('#e9b44c') +
    '<circle cx="50" cy="52" r="34" fill="#c98f35" stroke="#8a5a1c" stroke-width="3"/><circle cx="50" cy="52" r="24" fill="#bfe6f5" stroke="#8a5a1c" stroke-width="3"/>' +
    '<circle cx="50" cy="55" r="15" fill="#f1c7a0"/><path d="M36 50 Q50 34 64 50 Q60 42 50 41 Q40 42 36 50Z" fill="#e8e8e8"/><circle cx="45" cy="55" r="2.2" fill="#2b2b2b"/><circle cx="55" cy="55" r="2.2" fill="#2b2b2b"/>' +
    '<path d="M44 62 Q50 66 56 62" stroke="#7a3b2b" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="21" cy="52" r="4" fill="#8a5a1c"/><circle cx="79" cy="52" r="4" fill="#8a5a1c"/><circle cx="50" cy="19" r="4" fill="#8a5a1c"/><path d="M58 47 l6 -4" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>');
  if (id === 'eel') return w(bg('#6fbf73') +
    '<path d="M18 78 Q30 40 55 30 Q80 22 86 44 Q88 60 70 64 L40 70 Q30 74 26 84Z" fill="#4f9a55" stroke="#2c5e31" stroke-width="3"/>' +
    '<path d="M48 62 L86 50 L84 58 Z" fill="#7a1f1f"/><path d="M52 61 l3 -6 l3 5 l3 -6 l3 5 l3 -6 l3 5 l3 -6 l3 5" stroke="#fff" stroke-width="2" fill="none"/>' +
    '<circle cx="66" cy="38" r="7" fill="#ffe36b"/><circle cx="67" cy="38" r="3" fill="#111"/><path d="M58 30 L74 33" stroke="#2c5e31" stroke-width="3" stroke-linecap="round"/><path d="M30 60 q6 -4 10 0 M34 70 q6 -4 10 0" stroke="#2c5e31" stroke-width="2" fill="none"/>');
  if (id === 'witch') return w(bg('#b27fd6') +
    '<path d="M22 90 Q20 50 35 30 Q50 12 65 30 Q80 50 78 90Z" fill="#3f7a46"/><path d="M28 88 Q26 60 34 44 M72 88 Q74 60 66 44 M40 90 Q38 70 42 56 M60 90 Q62 70 58 56" stroke="#2a5530" stroke-width="4" fill="none" stroke-linecap="round"/>' +
    '<ellipse cx="50" cy="50" rx="15" ry="18" fill="#b9a6d8"/><path d="M38 44 L46 47 M62 44 L54 47" stroke="#2b1b3d" stroke-width="2.5" stroke-linecap="round"/><circle cx="44" cy="51" r="2.8" fill="#e8ff7a"/><circle cx="56" cy="51" r="2.8" fill="#e8ff7a"/>' +
    '<path d="M43 61 Q50 57 57 61" stroke="#2b1b3d" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M30 26 L50 6 L70 26 Z" fill="#5b2f7a" stroke="#2b1b3d" stroke-width="2"/><circle cx="50" cy="8" r="3" fill="#e8ff7a"/>');
  if (id === 'angler') return w(bg('#5fa8d9') +
    '<path d="M50 30 Q42 8 64 10" stroke="#9fc7e8" stroke-width="2.5" fill="none"/><circle cx="66" cy="11" r="6" fill="#fff6a8"/><circle cx="66" cy="11" r="11" fill="#fff6a8" opacity=".25"/>' +
    '<path d="M12 56 Q20 26 52 26 Q84 26 90 56 Q84 82 52 84 Q22 84 12 56Z" fill="#26405e" stroke="#0d1c2e" stroke-width="3"/>' +
    '<path d="M24 62 Q52 80 86 60 L84 66 Q52 92 26 68Z" fill="#0b0f18"/><path d="M28 64 l4 7 l4 -6 l4 8 l4 -7 l4 8 l4 -7 l4 8 l4 -7 l4 7 l4 -7 l4 6 l4 -6" stroke="#f2f2f2" stroke-width="2" fill="none"/>' +
    '<circle cx="62" cy="44" r="8" fill="#d7f0ff"/><circle cx="64" cy="45" r="4" fill="#0b0f18"/><path d="M52 36 L72 38" stroke="#0d1c2e" stroke-width="3" stroke-linecap="round"/>');
  return w(bg('#e05a5a') +
    '<path d="M6 70 Q20 30 50 22 Q82 16 94 44 Q96 70 70 80 Q40 92 6 70Z" fill="#2b1d3f" stroke="#120a1f" stroke-width="3"/>' +
    '<path d="M20 64 Q30 58 40 64 Q50 70 60 62 Q70 54 82 60" stroke="#4b3470" stroke-width="3" fill="none"/>' +
    '<ellipse cx="62" cy="42" rx="14" ry="10" fill="#ffcf4a"/><ellipse cx="62" cy="42" rx="3.5" ry="9" fill="#120a1f"/><path d="M44 30 L80 34" stroke="#120a1f" stroke-width="4" stroke-linecap="round"/>' +
    '<path d="M18 50 q4 -8 8 0 q4 -8 8 0" stroke="#4b3470" stroke-width="2" fill="none"/>');
}
const CURSE = {
  low: { name: 'Undertow', text: 'The LOWEST card of the led colour wins the trick. Lanterns still beat colours (the highest Lantern wins as usual).', short: 'Lowest wins' },
  sleep: { name: 'Lantern Sleep', text: 'Lanterns sleep this trick: a Lantern played on a colour wins nothing.', short: 'Lanterns sleep' },
  any: { name: 'Riptide', text: 'Every colour counts: the highest number wins, whatever its colour. Lanterns still beat colours.', short: 'Any colour wins' }
};
// ---------- the Descent: 4 zones x (3 dives + a boss), 3 oxygen tanks per zone ----------
const DESC = [   // difficulty tuned with desc-gauntlet.js (all-computer crew, first-try wins: about 70% / 55% / 35% / 25% per zone)
  { id: 'reef', name: 'Sunlit Reef', depth: '10 m', dives: [{ d: 2 }, { d: 3 }, { d: 4 }], boss: { id: 'eel', d: 4, pool: ['low'], every: 2 } },
  { id: 'kelp', name: 'Kelp Forest', depth: '40 m', dives: [{ d: 4 }, { d: 5, cmt: 'murky' }, { d: 5 }], boss: { id: 'witch', d: 6, pool: ['sleep', 'low'], every: 2 } },
  { id: 'twi', name: 'Twilight Trench', depth: '200 m', dives: [{ d: 6 }, { d: 7 }, { d: 7, cmt: 'murky' }], boss: { id: 'angler', d: 7, pool: ['any', 'sleep', 'low'], every: 2 } },
  { id: 'abyss', name: 'The Abyss', depth: '4000 m', dives: [{ d: 8 }, { d: 8, cmt: 'murky' }, { d: 9 }], boss: { id: 'leviathan', d: 8, pool: ['low', 'sleep', 'any'], every: 1 } }
];
const O2MAX = 3;
const Desc = {
  load() { let o = null; try { o = JSON.parse(lsGet('ld_desc') || 'null'); } catch (e) { } if (!o || o.v !== 1) o = { v: 1, z: 0, s: 0, o2: O2MAX, stars: {}, best: 0, met: {} }; return o; },
  save(o) { try { lsSet('ld_desc', JSON.stringify(o)); } catch (e) { } }
};
function descStage(p) { p = p || Desc.load(); const Z = DESC[Math.min(p.z, DESC.length - 1)]; const boss = p.s >= Z.dives.length; const st = boss ? Z.boss : Z.dives[p.s]; return { Z, zi: Math.min(p.z, DESC.length - 1), si: p.s, boss, d: st.d, cmt: st.cmt || 'normal', bossDef: boss ? Z.boss : null, done: p.z >= DESC.length }; }
function descentEl() {
  const p = Desc.load(), cur = descStage(p);
  const box = h('div.setup.scard.desc', h('div.shead', h('button.px.sback', { 'data-a': 'title', type: 'button', 'aria-label': 'Back to the title' }, '‹'), h('h2', 'The Descent')));
  box.append(h('div.dmara', h('span.dpt', { html: portraitSVG('mara', 56) }), h('p', p.z >= DESC.length ? 'You reached the bottom of the sea. Legendary! Start again any time.' : cur.boss ? 'Boss ahead: ' + CHAR[cur.bossDef.id].name + '. Every finished job hits it. Watch its curses!' : 'Each zone: 3 dives, then a boss. A failed dive costs one oxygen tank. Out of air = back to the top of the zone.')));
  const o2 = h('div.o2', h('b', 'Oxygen'), ...Array.from({ length: O2MAX }, (_, i) => h('span.tank' + (i < p.o2 ? '.full' : ''), { 'aria-hidden': 'true' })), h('span.sr', p.o2 + ' of ' + O2MAX + ' tanks'));
  box.append(o2);
  const goSlot = h('div.dgo'); box.append(goSlot);
  const map = h('div.dmap');
  DESC.forEach((Z, zi) => {
    const locked = zi > p.z, zc = h('div.dzone' + (zi === p.z ? '.cur' : '') + (locked ? '.lock' : '') + (zi < p.z ? '.won' : ''));
    zc.append(h('div.dzh', h('b', (zi + 1) + '. ' + Z.name), h('span', Z.depth)));
    const row = h('div.dsteps');
    Z.dives.forEach((x, si) => { const done = zi < p.z || (zi === p.z && si < p.s), here = zi === p.z && si === p.s; row.append(h('span.dstep' + (done ? '.ok' : '') + (here ? '.here' : ''), { title: 'Difficulty ' + x.d }, done ? (p.stars[zi + ':' + si] ? '★' : '✓') : String(si + 1))); });
    const bdone = zi < p.z, bhere = zi === p.z && p.s >= Z.dives.length;
    row.append(h('span.dstep.boss' + (bdone ? '.ok' : '') + (bhere ? '.here' : ''), { html: portraitSVG(Z.boss.id, 34) + (bdone ? '<b class="bx">\u2714</b>' : ''), title: CHAR[Z.boss.id].name + (bdone ? ' (defeated)' : '') }));
    zc.append(row); map.append(zc);
  });
  box.append(map);
  const lab = p.z >= DESC.length ? 'Start a new descent' : cur.boss ? 'Fight ' + CHAR[cur.bossDef.id].name : 'Dive ' + (cur.si + 1) + ' of ' + cur.Z.name;
  goSlot.append(h('div.sgo', h('button.sbtn.big', { 'data-a': p.z >= DESC.length ? 'descreset' : 'descgo', type: 'button' }, h('b', lab), ' ', h('span', p.z >= DESC.length ? 'from the Sunlit Reef' : 'You + Nerea, Bram and Sumi · difficulty ' + cur.d + (cur.cmt === 'murky' ? ' · murky water' : ''))),
    h('button.tlink', { 'data-a': 'guided', type: 'button' }, 'Training dive with Mara')));
  return box;
}
function descGo() {
  const p = Desc.load(); if (p.z >= DESC.length) { descReset(); return; }
  const st = descStage(p);
  newGame('descent', { np: 4, kind: 'free', d: st.d, cmt: st.cmt, boss: st.bossDef ? { id: st.bossDef.id, pool: st.bossDef.pool, every: st.bossDef.every } : null });
  if (G) {
    p.tries = p.tries || {}; const key = st.zi + ':' + st.si; p.tries[key] = (p.tries[key] || 0) + 1; Desc.save(p);
    G.desc = { zi: st.zi, si: st.si, tryN: p.tries[key] }; G.share = 1; G.mission.name = st.Z.name + (st.bossDef ? ' boss' : ' dive ' + (st.si + 1));
    if (G.log && G.log.length) G.log.forEach(e => { if (e && typeof e.t === 'string') e.t = e.t.replace('Free dive', G.mission.name); });
    render(); autosave();
  }
}
function descReset() { Desc.save({ v: 1, z: 0, s: 0, o2: O2MAX, stars: {}, best: Desc.load().best || 0, met: Desc.load().met || {} }); UI.sv = 'descent'; renderStart(); }
function isBoss() { return !!(G && G.boss); }
function bossChar() { return G && G.boss ? CHAR[G.boss.id] : null; }
// called by showResult for Descent dives: updates oxygen / progress once and adds the story and the buttons
function descResult(box, ok) {
  const p = Desc.load(), B = bossChar(); let st = descStage(p);
  if (G.desc) { const Z = DESC[G.desc.zi]; st = { Z, zi: G.desc.zi, si: G.desc.si, boss: G.desc.si >= Z.dives.length }; }
  if (!G.descDone) {
    G.descDone = 1;
    p.fail = p.fail || {}; const key = st.zi + ':' + st.si;
    if (ok) { if (!p.fail[key]) p.stars[key] = 1; if (st.boss) { p.z++; p.s = 0; p.o2 = O2MAX; p.best = Math.max(p.best || 0, p.z); } else p.s++; }
    else { p.fail[key] = 1; p.o2--; if (p.o2 <= 0) { p.s = 0; p.o2 = O2MAX; G.descOut = 1; } }
    Desc.save(p);
  }
  if (B && ok) box.prepend(h('div.bdef', h('span.dpt', { html: portraitSVG(G.boss.id, 64) }), h('div', h('b', B.name + ' defeated!'), h('span', 'Every job hit home. ' + (DESC[p.z] ? DESC[p.z].name + ' is open, tanks refilled.' : 'The sea is yours.')))));
  const say = (who, txt) => box.append(h('div.say', h('span.dpt', { html: portraitSVG(who, 52) }), h('p', h('b', CHAR[who].name + ': '), txt)));
  if (B) say(G.boss.id, ok ? B.lose : B.win);
  if (ok) say('mara', st.boss ? 'You beat ' + B.name + '! Fresh tanks — on to ' + (DESC[p.z] ? DESC[p.z].name : 'the surface, legends') + '.' : 'Well dived! ' + (p.stars[st.zi + ':' + st.si] ? 'First try — that is a star. ' : '') + 'Next: ' + (descStage(p).boss ? 'the boss of this zone.' : 'dive ' + (descStage(p).si + 1) + '.'));
  else if (G.descOut) say('mara', 'Out of air! Back up to the start of ' + st.Z.name + ' with full tanks. You know the waters now.');
  else say('mara', 'That cost one oxygen tank (' + p.o2 + ' left). Read the red cross: that job broke. Try the dive again.');
  const bt = h('div.cbtns');
  bt.append(h('button.btn.go', { 'data-a': 'descgo', type: 'button' }, ok ? (p.z >= DESC.length ? 'See the map' : 'Next dive') : 'Dive again'));
  bt.append(h('button.btn.alt', { 'data-a': 'rsclose', type: 'button' }, 'Look at the table'));
  bt.append(h('button.btn.alt', { 'data-a': 'descmap', type: 'button' }, 'Map'));
  box.append(bt);
}
// ---------- dialogs: a character pops up, play waits until the player answers ----------
function showDlg(d) { UI.dlg = d; drawDlg(); }
function drawDlg() {
  const el = $('#dlg'); if (!el) return; const d = UI.dlg;
  if (!d) { el.hidden = true; el.innerHTML = ''; return; }
  el.hidden = false; el.innerHTML = '';
  const who = CHAR[d.who] || CHAR.mara;
  el.append(h('div.dbox' + (d.curse ? '.curse' : '') + (d.who !== 'mara' ? '.bossd' : ''), { role: 'dialog', 'aria-modal': 'true', 'aria-label': d.title || who.name },
    h('div.dtop2', h('span.dpt', { html: portraitSVG(d.who || 'mara', 76) }), h('div', h('b', who.name), h('small', who.role))),
    d.title ? h('h3', d.title) : null, h('p', d.body),
    h('div.cbtns', h('button.btn.go', { 'data-a': 'dlgok', type: 'button' }, d.btn || 'OK'))));
}
function dlgOk() { const d = UI.dlg; UI.dlg = null; drawDlg(); if (d && d.then) try { d.then(); } catch (e) { console.error(e); } render(); schedule(); }
// one check per schedule(): opens the next dialog that is due. Returns true while a dialog is open (play waits).
function storyCheck() {
  if (UI.dlg) return true;
  if (!G || !UI.started || UI.busy || UI.cards.length || G.phase === 'over' || isClient()) return false;
  UI.said = UI.said || {};
  const once = (k, d) => { if (UI.said[k]) return false; UI.said[k] = 1; showDlg(d); return true; };
  if (UI.mode === 'descent') {
    const st = descStage(), p = Desc.load(), B = bossChar();
    if (G.tricks.length === 0 && G.phase === 'assign') {
      if (!p.met.intro && once('intro', { who: 'mara', title: 'The Descent', body: 'Four zones, deeper and harder. Each zone: three dives, then a boss. A failed dive costs one oxygen tank (you have ' + O2MAX + '). Do every job to clear a dive. Ready?', btn: 'Let\'s dive', then: () => { const q = Desc.load(); q.met.intro = 1; Desc.save(q); } })) return true;
      if (B && once('boss' + G.att, { who: G.boss.id, title: G.att === 1 ? B.name + ' appears!' : B.name + ' is waiting', body: B.intro + ' Curses: ' + G.boss.pool.map(c => CURSE[c].name + ' (' + CURSE[c].short.toLowerCase() + ')').join(', ') + '. Each job you finish hits me.', btn: 'Bring it on' })) return true;
      if (!B && st.si === 0 && G.att === 1 && once('zone', { who: 'mara', title: st.Z.name + ' · ' + st.Z.depth, body: st.zi === 0 ? 'Shallow and bright. Pick jobs your cards can do, and help the others with theirs.' : st.zi === 1 ? 'Murky water ahead: in some dives a shown card does not tell if it is the highest or lowest.' : st.zi === 2 ? 'The trench is dark and the jobs are many. Use your signal early.' : 'The Abyss. The Leviathan curses EVERY trick. Good luck, diver.', btn: 'Dive' })) return true;
    }
    if (B && G.phase === 'play' && G.trick && G.trick.plays.length === 0 && G.trick.cu) {
      const C = CURSE[G.trick.cu], n = G.tricks.length, nx = G.boss.sched.findIndex((c, i) => i > n && c);
      const tail = ' This trick only' + (nx >= 0 ? '; the next curse comes on trick ' + (nx + 1) + '.' : '.');
      // the full pop-up only the first time a curse appears in a fight; later it is a line in the dock and the red tag on the boss bar
      if (!UI.said['cut' + G.att + G.trick.cu]) { UI.said['cut' + G.att + G.trick.cu] = 1; UI.said['cu' + G.att + ':' + n] = 1; showDlg({ who: G.boss.id, curse: 1, title: B.name + ' casts ' + C.name + '!', body: C.text + tail, btn: 'Brace!' }); return true; }
      if (!UI.said['cu' + G.att + ':' + n]) { UI.said['cu' + G.att + ':' + n] = 1; UI.hitAt = Date.now(); UI.news = (UI.news || []).concat(['\u2620 Trick ' + (n + 1) + ': ' + B.name + ' casts ' + C.name + ' \u2014 ' + C.short.toLowerCase() + '.']).slice(-3); render(); }
    }
  }
  if (UI.mode === 'guided') return tutCheck(once);
  return false;
}
// ---------- the boss bar on the table ----------
function bossBar() {
  const fe = $('#felt'); if (!fe) return; let bb = $('#bossbar');
  if (!isBoss() || G.phase === 'assign') { if (bb) bb.remove(); fe.classList.remove('bosson'); return; }
  if (!bb) { bb = h('div#bossbar'); fe.prepend(bb); }
  fe.classList.add('bosson');
  const B = bossChar(), n = G.tasks.length, done = G.tasks.filter((t, i) => jobSt(i) > 0).length, cu = G.phase === 'play' && G.trick ? G.trick.cu : '';
  bb.className = (UI.hitAt && Date.now() - UI.hitAt < 700 ? 'hit' : '');
  bb.innerHTML = '';
  const nx = G.boss.sched.findIndex((c, i) => i > G.tricks.length && c);
  bb.append(h('span.bpt', { html: portraitSVG(G.boss.id, 34) }), h('div.bmid', h('b', B.name), h('div.hp', { 'aria-label': 'Boss health ' + (n - done) + ' of ' + n }, ...Array.from({ length: n }, (_, i) => h('i' + (i < n - done ? '.on' : ''))))),
    cu ? h('span.bcu', { title: CURSE[cu].text }, '☠ ' + CURSE[cu].short) : h('span.bcu.calm', nx >= 0 ? 'Curse on trick ' + (nx + 1) : 'No curse'));
}
// ---------- Mara's training dive (replaces the old tip chain in guided mode) ----------
// The guided deal is stacked (see data.js guided): you hold L4 L3 C2 C6 C9 T3 T7 K1 K5 K8 S2 S6 S9; your job is to win the Lantern 3.
const TUT = { lead: [D.card(0, 9), D.card(1, 3), D.card(4, 3)] };
function tutOnly() {
  if (UI.mode !== 'guided' || !G || G.phase !== 'play' || G.trick.turn !== viewSeat()) return -1;
  const L3 = D.card(4, 3);
  if (G.trick.plays.length) return G.trick.ls === 4 && G.players[viewSeat()].hand.includes(L3) && !G.trick.plays.some(p => p.c > L3) ? L3 : -1;
  const k = Math.min(G.tricks.length, 2), want = TUT.lead[k];
  return G.players[viewSeat()].hand.includes(want) ? want : -1;
}
function tutCheck(once) {
  const v = viewSeat(), myTurn = G.phase === 'play' && G.trick.turn === v;
  if (G.phase === 'assign' && G.tricks.length === 0) {
    if (once('t0', { who: 'mara', title: 'Welcome, diver!', body: 'I\'m Mara. In Lantern Dive the whole crew wins or loses TOGETHER. Each dive has job cards; each job belongs to ONE diver. Do every job and the dive is won.', btn: 'Show me' })) return true;
    if (iMustAct() && once('t1', { who: 'mara', title: 'Take a job', body: 'This job says: win the Lantern 3. You will win it when the Lantern 3 is in a trick YOU win. Tap the job card on the table, then press "Take this job".', btn: 'Got it' })) return true;
  }
  if (G.phase === 'distress' && iMustAct() && once('tf', { who: 'mara', title: 'The distress flare', body: 'Optional help: everyone passes one card. We do not need it today — press "No flare".', btn: 'OK' })) return true;
  if ((G.phase === 'signal' || G.phase === 'play' && G.tricks.length === 0) && iMustAct() && LD.pingMoves(G, v).length && once('ts', { who: 'mara', title: 'Signals', body: 'Once per dive you may SHOW the crew one card: your highest, lowest or only card of a colour. Skip it for now — press "No signal".', btn: 'OK' })) return true;
  if (myTurn && G.trick.plays.length === 0) {
    if (G.tricks.length === 0 && once('t2', { who: 'mara', title: 'Your first trick', body: 'You lead: you play first and choose the colour. Everyone must follow that colour if they can, and the HIGHEST card of it wins. Lead your Coral 9 (it glows).', btn: 'Lead it' })) return true;
    if (G.tricks.length === 1 && once('t3', { who: 'mara', title: 'You won it!', body: 'The highest Coral took the trick, and the winner leads next. Now lead your Tide 3: a low card loses on purpose. Losing tricks is a tool too.', btn: 'Lead it' })) return true;
    if (G.tricks.length >= 2 && G.players[v].hand.includes(D.card(4, 3)) && once('t5', { who: 'mara', title: 'Lanterns are trumps', body: 'A Lantern beats every colour, and the highest Lantern wins. Nerea and Bram only hold lower Lanterns. Lead your Lantern 3 now to win it — that finishes your job!', btn: 'Lead it' })) return true;
  }
  if (myTurn && G.trick.plays.length > 0 && tutOnly() >= 0 && once('t6', { who: 'mara', title: pname(G.trick.lead) + ' led a Lantern for you!', body: 'Lanterns are trumps: they beat every colour, and the highest Lantern wins. A Lantern lead must be followed with a Lantern. Play your Lantern 3: it beats ' + G.trick.plays.map(p => cname(p.c)).join(' and ') + ', so you win it and finish your job!', btn: 'Play it' })) return true;
  if (myTurn && G.trick.plays.length > 0 && G.trick.ls < 4 && LD.playable(G, v).length < G.players[v].hand.length && once('t4', { who: 'mara', title: 'Follow the colour', body: pname(G.trick.lead) + ' led ' + D.suits[G.trick.ls].name + '. You MUST play ' + D.suits[G.trick.ls].name + ' if you have it — the dim cards are not allowed. You never have to win.', btn: 'OK' })) return true;
  if (G.tricks.length >= 1 && G.tricks.length < 3 && G.tricks[G.tricks.length - 1].w !== v && once('tl' + G.tricks.length, { who: 'mara', title: pname(G.tricks[G.tricks.length - 1].w) + ' won that trick', body: 'With ' + cname(G.tricks[G.tricks.length - 1].wc) + ', the highest card. That is fine: your job only cares about the Lantern 3. Teamwork tip: when a teammate is winning a trick, you can throw in a card THEY need for their job.', btn: 'OK' })) return true;
  return false;
}
// ===================== part 9: Story mode (campaign.json + the shared chapter kit gx-campaign.js) =====================
// A chapter is a real logbook dive with its own crew and (at most) one twist. The twists exist only here; the normal rules never change.
UI.camp = null;
function campTw(def) { return (def && def.twist && def.twist.id) || ''; }
function campOk(g) { return !!(g && g.phase === 'over' && g.result && g.result.ok); }
function campMetrics(g) {
  const mine = g.tasks.filter(t => t.owner === 0).length, pings = g.pings.filter(p => p.seat === 0).length;
  return { won: campOk(g), attempts: g.att, flare: g.distress ? 1 : 0, pings, myJobs: mine };
}
function campIsWon(g, def) {
  if (!campOk(g)) return false; const t = def.twist;
  if (t && t.id === 'no-flare' && g.distress) return false;
  if (t && t.id === 'air-limit' && g.att > (t.param || 4)) return false;
  return true;
}
// twist limit already broken: no point retrying this dive
function campDead(g, def) {
  const t = def && def.twist; if (!t) return false;
  if (t.id === 'no-flare') return !!g.distress; if (t.id === 'air-limit') return g.att >= (t.param || 4); return false;
}
function campStart(def) {
  const s = def.setup || {}, t = def.twist || null, mates = (t && t.id === 'rookie-mates' ? t.param : s.mates) || 'normal';
  let np = s.np || 4; if (t && t.id === 'big-team') np = t.param || 5;
  const o = { camp: def, np, kind: 'log', mission: s.mission || 1, seats: [0, 1, 2, 3], lv: [mates, mates, mates, mates], level: 'normal', timer: !!((t && t.id === 'clock-on') || s.timer) };
  UI.seed = s.seed != null ? s.seed : null;
  newGame(s.mode === 'guided' ? 'guided' : 'vs', o);
  UI.camp = def;
  if (s.mode !== 'guided') { UI.coach.level = def.hints ? 'full' : 'off'; render(); }
  try { toast('Goal: ' + def.goal.text); } catch (e) { }
}
function campFinish() { try { GXC.finish(G); } catch (e) { console.error(e); } }
function campOpen() { if (typeof GXC === 'undefined') return; closeRS(); GXC.open(); }
function campOn() { return !!(UI.camp && typeof GXC !== 'undefined' && GXC.active()); }
// result footer inside a story chapter (called from showResult)
function campResult(box, ok) {
  const def = UI.camp, won = campIsWon(G, def), dead = campDead(G, def), bt = h('div.cbtns');
  if (def.twist && def.twist.text) box.append(h('p.sm', def.twist.text));
  if (ok && !won) box.append(h('p', 'The boss rule was broken, so the chapter is not won.'));
  if (!won && !dead) bt.append(h('button.btn.go', { 'data-a': 'retrysame', type: 'button' }, 'Try again (same jobs)'));
  bt.append(h('button.btn' + (won || dead ? '.go' : '.alt'), { 'data-a': 'campfin', type: 'button' }, won ? 'Continue the story' : 'Leave the dive'));
  bt.append(h('button.btn.alt', { 'data-a': 'rsclose', type: 'button' }, 'Look at the table'));
  box.append(bt);
}
{ const _ng = newGame; newGame = function (mode, o) { if (!(o && o.camp)) UI.camp = null; return _ng.apply(this, arguments); }; }
function campLine() {
  try {
    if (typeof GXC === 'undefined' || !window.CAMPAIGN) return '';
    const p = GXC.progress(), ch = window.CAMPAIGN.chapters, n = ch.filter(c => p.ch[c.id] && p.ch[c.id].beaten).length;
    return n ? n + ' of ' + ch.length + ' chapters done' : 'Ten chapters, three bosses';
  } catch (e) { return ''; }
}
function campInit() {
  if (typeof GXC === 'undefined' || !window.CAMPAIGN) return;
  GXC.init({
    game: 'lantern-dive', data: window.CAMPAIGN, startChapter: campStart, isWon: campIsWon, metrics: campMetrics,
    onExit: () => { UI.camp = null; showStart(); },
    scores: g => g.players.map(() => 0), seats: g => g.players.map((p, i) => ({ name: i === 0 ? 'You' : p.name, me: i === 0, ai: p.ai || undefined }))
  });
}
campInit();
