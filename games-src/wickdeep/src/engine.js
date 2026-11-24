// Wickdeep engine: the rules, no DOM. One JSON-safe state G; validMoves(G) lists what the player may do now, apply(G, move) does it.
// Round: every hero picks 2 ability cards (or a long rest) -> monsters reveal one ability card per type -> everyone acts by initiative
// -> end of round (elements wane, short rests, decks reshuffle). A hero plays the top half of one card and the bottom half of the other.
(function (g) {
  'use strict';
  var D = g.WDD;   // data.js
  var DIRS = [[1, 0], [1, -1], [0, -1], [-1, 0], [-1, 1], [0, 1]];
  var EL = ['fire', 'ice', 'air', 'earth', 'light', 'dark'];
  var CONDS = ['poi', 'wnd', 'imm', 'dis', 'stn', 'mud', 'inv', 'str'];
  var TIMED = { imm: 1, dis: 1, stn: 1, mud: 1, inv: 1, str: 1 };
  function K(q, r) { return q + ',' + r; }
  function P(k) { var i = k.indexOf(','); return [+k.slice(0, i), +k.slice(i + 1)]; }
  function nb(k) { var p = P(k); return DIRS.map(function (d) { return K(p[0] + d[0], p[1] + d[1]); }); }
  function dist(a, b) { var A = P(a), B = P(b), dq = A[0] - B[0], dr = A[1] - B[1]; return (Math.abs(dq) + Math.abs(dr) + Math.abs(dq + dr)) / 2; }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  // ---------- seeded random (state lives in G.rs) ----------
  function rnd(G) { var t = (G.rs = (G.rs + 0x6D2B79F5) | 0); t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }
  function shuffle(G, a) { for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd(G) * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }

  // ---------- card text (DSL) -> actions ----------
  // Actions are separated by ','; tokens by spaces. m3 move, j3 jump, a3 attack, h2 heal, s1 shield, R1 retaliate, L1 loot,
  // I:fire infuse, xp2, lost, sum:<id>, self:str, p:atk:1:3 persistent bonus (kind:value:charges), rec:1 recover a discarded card.
  // Attack/heal modifiers: r3 range, t2 targets, P2 pierce, push2, pull2, poi wnd imm dis stn mud crs, all, splash, adv, bless.
  // C:fire:+2 / C:fire:+1r / C:fire:stn / C:fire:xp1 / C:any:... = consume that element for a bonus on this action.
  var CACHE = {};
  function parse(s) {
    if (CACHE[s]) return CACHE[s];
    var out = [];
    String(s || '').split(',').forEach(function (part) {
      var tk = part.trim().split(/\s+/).filter(Boolean); if (!tk.length) return;
      var h = tk[0], a = { t: '?' }, m;
      if ((m = /^([mjahsRL])([+-]?\d+)$/.exec(h))) { a.t = { m: 'move', j: 'move', a: 'atk', h: 'heal', s: 'shield', R: 'retal', L: 'loot' }[m[1]]; a.v = +m[2]; if (m[1] === 'j') a.jump = 1; if (/^[+-]/.test(m[2])) a.rel = 1; }
      else if ((m = /^I:(\w+)$/.exec(h))) { a.t = 'infuse'; a.e = m[1]; }
      else if ((m = /^xp(\d+)$/.exec(h))) { a.t = 'xp'; a.v = +m[1]; }
      else if (h === 'lost') a.t = 'lost';
      else if ((m = /^sum:(\w+)$/.exec(h))) { a.t = 'summon'; a.id = m[1]; }
      else if ((m = /^self:(\w+)$/.exec(h))) { a.t = 'selfc'; a.c = m[1]; }
      else if ((m = /^p:(\w+):(\d+):(\d+)$/.exec(h))) { a.t = 'pers'; a.k = m[1]; a.v = +m[2]; a.n = +m[3]; }
      else if ((m = /^rec:(\d+)$/.exec(h))) { a.t = 'recover'; a.v = +m[1]; }
      else if ((m = /^sp(\d)$/.exec(h))) { a.t = 'special'; a.v = +m[1]; }
      else if (h === 'bless') { a.t = 'blessall'; }
      for (var i = 1; i < tk.length; i++) {
        var x = tk[i];
        if ((m = /^r([+-]?\d+)$/.exec(x))) { a.r = +m[1]; if (/^[+-]/.test(m[1])) a.rrel = 1; }
        else if ((m = /^t(\d+)$/.exec(x))) a.tg = +m[1];
        else if ((m = /^P(\d+)$/.exec(x))) a.pierce = +m[1];
        else if ((m = /^push(\d+)$/.exec(x))) a.push = +m[1];
        else if ((m = /^pull(\d+)$/.exec(x))) a.pull = +m[1];
        else if (CONDS.indexOf(x) >= 0 || x === 'crs') (a.cond = a.cond || []).push(x);
        else if (x === 'all') a.all = 1;
        else if (x === 'splash') a.splash = 1;
        else if (x === 'adv') a.adv = 1;
        else if (x === 'self') a.self = 1;
        else if (x === 'bless') a.bless = 1;
        else if (x === 'fly') a.fly = 1;
        else if ((m = /^C:(\w+):(.+)$/.exec(x))) a.use = { e: m[1], b: m[2] };
      }
      out.push(a);
    });
    return (CACHE[s] = out);
  }

  // ---------- modifier decks ----------
  function baseAmd() { var d = []; var add = function (v, n) { for (var i = 0; i < n; i++) d.push({ v: v }); }; add(0, 6); add(1, 5); add(-1, 5); add(2, 1); add(-2, 1); d.push({ v: 'x2', sh: 1 }); d.push({ v: 'null', sh: 1 }); return d; }
  function applyPerk(deck, pk) {
    // pk: {rm:[{v,n}], add:[{v, n, roll, e, c}]}
    (pk.rm || []).forEach(function (r) { for (var i = 0; i < r.n; i++) { var j = deck.findIndex(function (c) { return String(c.v) === String(r.v) && !c.roll && !c.e && !c.c && !c.tmp; }); if (j >= 0) deck.splice(j, 1); } });
    (pk.add || []).forEach(function (a) { for (var i = 0; i < (a.n || 1); i++) { var c = { v: a.v }; if (a.roll) c.roll = 1; if (a.e) c.e = a.e; if (a.c) c.c = a.c; if (a.heal) c.heal = a.heal; deck.push(c); } });
  }
  function mkAmd(G, perks) { var d = baseAmd(); (perks || []).forEach(function (p) { applyPerk(d, p); }); return { draw: shuffle(G, d), disc: [], resh: false }; }
  function drawOne(G, deck) {
    if (!deck.draw.length) { deck.draw = shuffle(G, deck.disc); deck.disc = []; }
    var c = deck.draw.pop();
    if (c.tmp) { /* bless / curse leave the deck */ } else deck.disc.push(c);
    if (c.sh) deck.resh = true;
    return c;
  }
  function drawResult(G, deck) {   // rolling cards add up until a non-rolling card
    var cards = [], c;
    do { c = drawOne(G, deck); cards.push(c); } while (c.roll && cards.length < 12);
    return cards;
  }
  function modValue(cards, base) {
    var v = base, nul = false, x2 = false, conds = [], elems = [], heal = 0;
    cards.forEach(function (c) { if (c.v === 'null') nul = true; else if (c.v === 'x2') x2 = true; else v += c.v; if (c.c) conds.push(c.c); if (c.e) elems.push(c.e); if (c.heal) heal += c.heal; });
    if (x2) v = v * 2;
    if (nul) v = 0;
    return { v: Math.max(0, v), nul: nul, x2: x2, conds: conds, elems: elems, heal: heal };
  }

  // ---------- map ----------
  function parseMap(sc, np) {
    var hex = {}, starts = [], place = [], legend = sc.legend || {}, colKey = np <= 2 ? 0 : np - 2;
    sc.map.forEach(function (row, r) {
      for (var c = 0; c < row.length; c++) {
        var ch = row[c]; if (ch === ' ' || ch === '#') continue;
        var q = c - (r - (r & 1)) / 2, k = K(q, r), h = { t: 'f' };
        if (ch === 'o') h.t = 'o'; else if (ch === '^') h.t = 'trap'; else if (ch === '~') h.t = 'haz'; else if (ch === ':') h.t = 'diff';
        else if (ch === 'D') { h.t = 'door'; h.open = false; }
        else if (ch === 'S') starts.push(k);
        else if (ch === '$') h.coin = 1;
        else if (ch === 'T') h.tr = 1;
        else if (ch === 'X') h.ex = 1;
        else if (legend[ch]) {
          var L = legend[ch];
          if (L.boss || L.obj) place.push({ k: k, L: L, kind: L.boss ? 'boss' : 'obj' });
          else { var w = L.n[colKey] || L.n[0]; if (w && w !== '-') place.push({ k: k, L: L, elite: w === 'e' }); }
          if (L.t) h.t = L.t;
        }
        hex[k] = h;
      }
    });
    // rooms: flood fill over non-door hexes
    var room = 0;
    Object.keys(hex).forEach(function (k) {
      if (hex[k].room != null || hex[k].t === 'door') return;
      var st = [k]; hex[k].room = room;
      while (st.length) { var x = st.pop(); nb(x).forEach(function (y) { if (hex[y] && hex[y].room == null && hex[y].t !== 'door') { hex[y].room = room; st.push(y); } }); }
      room++;
    });
    Object.keys(hex).forEach(function (k) { if (hex[k].t === 'door') { var rs = []; nb(k).forEach(function (y) { if (hex[y] && hex[y].room != null && rs.indexOf(hex[y].room) < 0) rs.push(hex[y].room); }); hex[k].rooms = rs; } });
    return { hex: hex, starts: starts, place: place, rooms: room };
  }
  function seen(G, k) { var h = G.hex[k]; if (!h) return false; if (h.t === 'door') return h.rooms.some(function (r) { return G.rev[r]; }); return !!G.rev[h.room]; }

  // ---------- figures ----------
  function fig(G, id) { for (var i = 0; i < G.figs.length; i++) if (G.figs[i].id === id) return G.figs[i]; return null; }
  function figAt(G, k) { for (var i = 0; i < G.figs.length; i++) if (G.figs[i].pos === k) return G.figs[i]; return null; }
  function heroes(G) { return G.figs.filter(function (f) { return f.kind === 'hero'; }); }
  function liveHeroes(G) { return heroes(G).filter(function (f) { return !f.exh; }); }
  function enemiesOf(G, f) { return G.figs.filter(function (o) { return o.team !== f.team && o.pos && !o.exh && o.kind !== 'obj' || (o.kind === 'obj' && f.team === 'h'); }); }
  function monStats(type, L, elite) { return D.monStats(type, L, elite); }
  function ev(G, e) { G.ev.push(e); G.log.push(e); if (G.log.length > 400) G.log.splice(0, G.log.length - 400); }

  function spawn(G, p) {
    var L = p.L;
    if (p.kind === 'boss') {
      var bs = D.BOSS[L.boss], C = G.np;
      var hp = D.bossHp(L.boss, G.L, C);
      G.figs.push({ id: 'b' + (G.uid++), kind: 'boss', team: 'm', type: L.boss, pos: p.k, hp: hp, max: hp, cond: {}, rnd: {}, num: 1 });
      ensureDeck(G, L.boss, bs.deck);
      return;
    }
    if (p.kind === 'obj') {
      var ohp = (L.obj.hp || 4) + (L.obj.per || 2) * G.np + G.L;
      G.figs.push({ id: 'o' + (G.uid++), kind: 'obj', team: 'm', type: 'obj', name: L.obj.n || 'Seal', pos: p.k, hp: ohp, max: ohp, cond: {}, rnd: {} });
      return;
    }
    var st = monStats(L.m, G.L, p.elite);
    var used = G.figs.filter(function (f) { return f.type === L.m; }).map(function (f) { return f.num; });
    var n = 1; while (used.indexOf(n) >= 0) n++;
    G.figs.push({ id: 'm' + (G.uid++), kind: 'mon', team: 'm', type: L.m, elite: !!p.elite, pos: p.k, hp: st.hp, max: st.hp, cond: {}, rnd: {}, num: n });
    ensureDeck(G, L.m, D.MON[L.m].deck);
  }
  function ensureDeck(G, type, fam) {
    if (G.md[type]) return;
    var ids = D.MDECK[fam].map(function (c, i) { return i; });
    G.md[type] = { fam: fam, draw: shuffle(G, ids.slice()), disc: [], cur: null, resh: false, acted: false };
  }
  function reveal(G, room) {
    if (G.rev[room]) return;
    G.rev[room] = true;
    ev(G, { e: 'reveal', room: room });
    G.place.filter(function (p) { return G.hex[p.k].room === room; }).forEach(function (p) {
      if (figAt(G, p.k)) return; spawn(G, p);
      var f = G.figs[G.figs.length - 1]; ev(G, { e: 'spawn', id: f.id, f: clone(f) });
      if (G.phase === 'turns' && (f.kind === 'mon' || f.kind === 'boss')) lateJoin(G, f.type);
    });
  }
  // monsters revealed mid-round: draw a card if their type has none; they act in initiative order (right after the current figure if already passed)
  function lateJoin(G, type) {
    var d = G.md[type]; if (!d || d.acted) return;
    if (d.cur == null) { drawMon(G, type); }
    if (G.order.some(function (o) { return o.mt === type; })) return;
    var init = D.MDECK[d.fam][d.cur].i, cur = G.order[G.ti], pos = G.ti + 1;
    if (!cur || init >= cur.init) { pos = G.ti + 1; while (pos < G.order.length && G.order[pos].init <= init) pos++; }
    G.order.splice(pos, 0, { mt: type, init: init });
  }
  function drawMon(G, type) {
    var d = G.md[type]; if (!d.draw.length) { d.draw = shuffle(G, d.disc); d.disc = []; }
    d.cur = d.draw.pop(); var c = D.MDECK[d.fam][d.cur]; if (c.sh) d.resh = true;
    ev(G, { e: 'mcard', type: type, card: d.cur });
  }

  // ---------- new scenario ----------
  // party: [{cls, lvl, xp, gold, cards:[ids in hand], perks:[perk index], items:[item ids]}]
  function newScenario(scId, party, o) {
    o = o || {};
    var sc = D.SCEN[scId], np = Math.max(2, party.length);
    if (o.tut && sc.map) { sc = Object.assign({}, sc, { map: sc.map.map(function (r, i) { return i === 3 ? '...o.a.' : r; }) }); }  // tutorial: a rat in the first room, two steps away
    var avg = party.reduce(function (s, p) { return s + (p.lvl || 1); }, 0) / party.length;
    var L = Math.max(0, Math.min(7, Math.ceil(avg / 2) + (o.diff || 0) + (party.length === 1 ? 1 : 0)));
    var G = { v: 1, sc: scId, np: np, nh: party.length, L: L, rs: (o.seed || 1) | 0, round: 0, phase: 'select', figs: [], md: {}, el: {}, ev: [], log: [], uid: 1, order: [], ti: 0, ask: null, act: null, done: null, sel: {}, mamd: null, hexes: 0, tut: !!o.tut };
    EL.forEach(function (e) { G.el[e] = 0; });
    var m = parseMap(sc, np); G.hex = m.hex; G.place = m.place; G.starts = m.starts; G.rooms = m.rooms; G.rev = {};
    G.mamd = mkAmd(G, []);
    party.forEach(function (p, i) {
      var C = D.HERO[p.cls], lvl = p.lvl || 1, hp = C.hp[lvl - 1];
      var perks = (p.perks || []).map(function (pi) { return C.perks[pi].fx; });
      var f = { id: 'h' + i, kind: 'hero', team: 'h', cls: p.cls, lvl: lvl, pos: null, hp: hp, max: hp, cond: {}, rnd: {}, pers: [],
        hand: (p.cards && p.cards.length ? p.cards : D.defaultHand(p.cls)).slice(0, C.hand), disc: [], lost: [], active: [], sel: null, lrest: false, exh: false,
        sxp: 0, coins: 0, amd: mkAmd(G, perks), items: (p.items || []).map(function (id) { return { id: id, st: 'ok' }; }), sums: [], kills: 0, dealt: 0, goal: p.goal || null };
      G.figs.push(f);
    });
    // place heroes on the first start hexes
    heroes(G).forEach(function (f, i) { f.pos = G.starts[i] || G.starts[0]; });
    var r0 = G.hex[G.starts[0]].room; reveal(G, r0);
    G.ev = [];
    beginSelect(G);
    return G;
  }

  // ---------- round flow ----------
  function canPlay(f) { return f.hand.length >= 2; }
  function canRest(f) { return f.disc.length >= 2; }
  function beginSelect(G) {
    G.round++; G.phase = 'select'; G.sel = {}; G.order = []; G.ti = 0; G.act = null;
    liveHeroes(G).forEach(function (f) {
      f.sel = null; f.lrest = false; f.acted = false;
      if (!canPlay(f) && !canRest(f)) exhaust(G, f, 'cards');
    });
    ev(G, { e: 'round', n: G.round });
    if (checkEnd(G)) return;
    G.ask = { h: 'sel' };
  }
  function exhaust(G, f, why) {
    if (f.exh) return;
    f.exh = true; f.lost = f.lost.concat(f.hand, f.disc, f.active.map(function (a) { return a.c; })); f.hand = []; f.disc = []; f.active = []; f.pers = [];
    ev(G, { e: 'exh', id: f.id, why: why, pos: f.pos }); f.pos = null;
    G.figs.filter(function (s) { return s.kind === 'sum' && s.owner === f.id; }).forEach(function (s) { removeFig(G, s); });
  }
  function removeFig(G, f) { var i = G.figs.indexOf(f); if (i >= 0) G.figs.splice(i, 1); }
  function cardInit(c) { return D.CARD[c].i; }
  function startRound(G) {
    // monster ability cards for every type on the board
    Object.keys(G.md).forEach(function (t) { G.md[t].cur = null; G.md[t].acted = false; });
    var types = {};
    G.figs.forEach(function (f) { if ((f.kind === 'mon' || f.kind === 'boss') && f.pos) types[f.type] = 1; });
    Object.keys(types).forEach(function (t) { drawMon(G, t); });
    var order = [];
    liveHeroes(G).forEach(function (f) {
      var i1, i2;
      if (f.lrest) { i1 = 99; i2 = 99; } else { var a = cardInit(f.sel[0]), b = cardInit(f.sel[1]); i1 = a; i2 = b; }
      order.push({ id: f.id, init: i1, tie: i2, hero: 1 });
    });
    Object.keys(types).forEach(function (t) { var d = G.md[t]; order.push({ mt: t, init: D.MDECK[d.fam][d.cur].i, tie: 100 }); });
    order.sort(function (x, y) { return x.init - y.init || (y.hero || 0) - (x.hero || 0) || x.tie - y.tie; });
    G.order = order; G.ti = -1; G.phase = 'turns';
    nextTurn(G);
  }
  function nextTurn(G) {
    G.ask = null; G.act = null;
    while (true) {
      if (checkEnd(G)) return;
      G.ti++;
      if (G.ti >= G.order.length) { endRound(G); return; }
      var o = G.order[G.ti];
      if (o.id) {
        var f = fig(G, o.id); if (!f || f.exh) continue;
        if (startHeroTurn(G, f)) return;   // waits for input
      } else {
        G.md[o.mt].acted = true;
        if (startMonTurn(G, o.mt)) return;
      }
    }
  }
  function startTurnFx(G, f) {
    // wound: 1 damage at the start of the turn
    if (f.cond.wnd) { ev(G, { e: 'wound', id: f.id }); damage(G, f, 1, null, true); }
  }
  // ---------- hero turn ----------
  function startHeroTurn(G, f) {
    G.cur = f.id; f.acted = true; ev(G, { e: 'turn', id: f.id });
    // summons act first (owner's initiative, just before them)
    var sums = G.figs.filter(function (s) { return s.kind === 'sum' && s.owner === f.id; });
    sums.forEach(function (s) { if (G.done) return; startTurnFx(G, s); if (fig(G, s.id) && !s.cond.stn) summonTurn(G, s); endFigTurn(G, s); });
    if (G.done || checkEnd(G)) return true;
    startTurnFx(G, f);
    if (f.exh) return false;
    if (f.lrest) {
      if (f.disc.length) { G.ask = { h: 'lrest', id: f.id }; return true; }
      finishLongRest(G, f, null); endHeroTurn(G, f); return false;
    }
    G.act = { id: f.id, step: 'first', used: [], q: [], i: 0 };
    G.ask = { h: 'first', id: f.id };
    if (f.cond.stn) { ev(G, { e: 'stunned', id: f.id }); G.ask = { h: 'stunned', id: f.id }; }
    return true;
  }
  function finishLongRest(G, f, lose) {
    if (lose != null) { var i = f.disc.indexOf(lose); if (i >= 0) f.disc.splice(i, 1); f.lost.push(lose); }
    f.hand = f.hand.concat(f.disc); f.disc = [];
    f.lrests = (f.lrests || 0) + 1; healFig(G, f, 2, f); f.items.forEach(function (it) { if (it.st === 'spent') it.st = 'ok'; });
    ev(G, { e: 'lrest', id: f.id, lost: lose });
  }
  function endHeroTurn(G, f) {
    if (f.pos && G.hex[f.pos]) {
      var h = G.hex[f.pos];
      if (h.coin) { f.coins += h.coin; ev(G, { e: 'coin', id: f.id, n: h.coin, k: f.pos }); h.coin = 0; }
      if (h.tr) lootTreasure(G, f, f.pos);
    }
    endFigTurn(G, f);
    // infusions become strong at the end of the turn
    (G.infq || []).forEach(function (e) { G.el[e] = 2; ev(G, { e: 'infuse', el: e }); }); G.infq = [];
    G.act = null; G.ask = null;
    if (checkEnd(G)) return;
    nextTurn(G);
  }
  function endFigTurn(G, f) {
    Object.keys(f.cond).forEach(function (c) { if (!TIMED[c]) return; if (f.cond[c] === 'keep') f.cond[c] = 'go'; else delete f.cond[c]; });
  }
  function addCond(G, f, c) {
    if (c === 'crs') { G.mamd && f.team === 'h' ? null : null; var deck = f.team === 'h' ? (f.amd || (f.owner && fig(G, f.owner) && fig(G, f.owner).amd)) : G.mamd; if (deck) { deck.draw.splice(Math.floor(rnd(G) * (deck.draw.length + 1)), 0, { v: 'null', tmp: 1, curse: 1 }); } ev(G, { e: 'cond', id: f.id, c: c }); return; }
    if (f.kind === 'obj') return;
    if (f.kind === 'boss' && (D.BOSS[f.type].imm || []).indexOf(c) >= 0) { ev(G, { e: 'immune', id: f.id, c: c }); return; }
    f.cond[c] = (G.cur === f.id || (G.curMon && G.curMon === f.id)) ? 'keep' : (TIMED[c] ? 'go' : 1);
    ev(G, { e: 'cond', id: f.id, c: c });
  }

  // which halves may be played first/second
  function halfOptions(G, f) {
    var opts = [], sel = f.sel, used = G.act.used;
    var left = sel.filter(function (c) { return used.indexOf(c) < 0; });
    var halves = G.act.step === 'first' ? ['top', 'bot'] : [G.act.firstHalf === 'top' ? 'bot' : 'top'];
    left.forEach(function (c) { halves.forEach(function (h) { opts.push({ t: 'half', c: c, h: h }); opts.push({ t: 'half', c: c, h: h, basic: 1 }); }); });
    return opts;
  }
  function playHalf(G, f, mv) {
    var A = G.act;
    A.used.push(mv.c);
    if (A.step === 'first') A.firstHalf = mv.h;
    var card = D.CARD[mv.c];
    var text = mv.basic ? (mv.h === 'top' ? 'a2' : 'm2') : (mv.h === 'top' ? card.top : card.bot);
    A.cur = { c: mv.c, h: mv.h, basic: !!mv.basic, did: false, lost: false, persist: false };
    A.q = clone(parse(text)); A.i = 0;
    ev(G, { e: 'half', id: f.id, c: mv.c, h: mv.h, basic: !!mv.basic });
    runActions(G, f);
  }
  function cardDone(G, f) {
    var A = G.act, cur = A.cur, c = cur.c;
    if (f.exh) { A.cur = null; G.act = null; G.ask = null; return nextTurn(G); }
    var hi = f.hand.indexOf(c); if (hi >= 0) f.hand.splice(hi, 1);
    if (cur.persist) { f.active.push({ c: c, pid: cur.pid }); }
    else if (cur.lost && !cur.basic) f.lost.push(c); else f.disc.push(c);
    if (cur.xp && cur.did && !cur.basic) { f.sxp += cur.xp; ev(G, { e: 'xp', id: f.id, n: cur.xp }); }
    A.cur = null;
    if (A.step === 'first') { A.step = 'second'; G.ask = { h: 'second', id: f.id }; if (f.exh) return endHeroTurn(G, f); }
    else endHeroTurn(G, f);
  }
  function useConsume(G, a) {
    if (!a.use) return;
    var e = a.use.e, have = e === 'any' ? EL.filter(function (x) { return G.el[x] > 0; })[0] : (G.el[e] > 0 ? e : null);
    if (!have) return;
    G.el[have] = 0; ev(G, { e: 'consume', el: have });
    var b = a.use.b, m;
    if ((m = /^\+(\d+)$/.exec(b))) a.v = (a.v || 0) + +m[1];
    else if ((m = /^\+(\d+)r$/.exec(b))) a.r = (a.r || 0) + +m[1];
    else if ((m = /^\+(\d+)t$/.exec(b))) a.tg = (a.tg || 1) + +m[1];
    else if ((m = /^xp(\d+)$/.exec(b))) a.xpb = +m[1];
    else if ((m = /^h(\d+)$/.exec(b))) a.healSelf = +m[1];
    else if (CONDS.indexOf(b) >= 0 || b === 'crs') (a.cond = a.cond || []).push(b);
    else if ((m = /^push(\d+)$/.exec(b))) a.push = +m[1];
    a.used = 1;
  }
  // run actions of the current half until one needs a choice
  function runActions(G, f) {
    var A = G.act;
    while (A.i < A.q.length) {
      var a = A.q[A.i];
      if (f.exh) return cardDone(G, f);
      if (!a.done0) { a.done0 = 1; useConsume(G, a); if (a.xpb) A.cur.xp = (A.cur.xp || 0) + a.xpb; }
      var need = heroAction(G, f, a);
      if (need) { G.ask = need; return; }
      A.i++;
    }
    cardDone(G, f);
  }
  function itemBonus(f, kind) { var v = 0; (f.armed || []).forEach(function (x) { if (x.k === kind) v += x.v; }); return v; }
  function persBonus(G, f, kind, spend) {
    var v = 0;
    f.pers.forEach(function (p) { if (p.k === kind && p.n > 0) { v += p.v; if (spend) p.n--; } });
    if (spend) cleanPers(G, f);
    return v;
  }
  function cleanPers(G, f) {
    f.pers.filter(function (p) { return p.n <= 0; }).forEach(function (p) {
      var j = f.active.findIndex(function (x) { return x.pid === p.pid; });
      if (j >= 0) { f.lost.push(f.active[j].c); f.active.splice(j, 1); ev(G, { e: 'persgone', id: f.id, c: p.c }); }
    });
    f.pers = f.pers.filter(function (p) { return p.n > 0; });
  }
  // returns an ask when the player must choose, else performs the action and returns null
  function heroAction(G, f, a) {
    var A = G.act;
    switch (a.t) {
      case 'move': {
        if (f.cond.imm) return null;
        var mv = a.v + itemBonus(f, 'mov') + persBonus(G, f, 'mov', false);
        if (mv <= 0) return null;
        var R = reach(G, f, mv, { jump: a.jump, hero: 1 });
        var ks = Object.keys(R).filter(function (k) { return k !== f.pos && !figAt(G, k) && R[k].c <= mv && G.hex[k].t !== 'o'; });
        if (!ks.length) { ev(G, { e: 'noop', id: f.id, why: 'No room to move' }); return null; }
        return { h: 'move', id: f.id, v: mv, hexes: ks, jump: !!a.jump };
      }
      case 'atk': {
        if (f.cond.dis) return null;
        if (a.all) { var adj = enemiesOf(G, f).filter(function (o) { return o.pos && dist(o.pos, f.pos) === 1; }); if (!adj.length) return null; adj.forEach(function (o) { if (!f.exh && f.pos) doAttack(G, f, o, a); }); A.cur.did = true; spendArmed(f, 'atk'); persBonus(G, f, 'atk', true); return null; }
        a.hits = a.hits || [];
        if (a.hits.length >= (a.tg || 1)) return null;
        var tg = attackTargets(G, f, a).filter(function (o) { return a.hits.indexOf(o.id) < 0; });
        if (!tg.length) { if (!a.hits.length) ev(G, { e: 'noop', id: f.id, why: 'No foe in reach' }); return null; }
        return { h: 'target', id: f.id, ids: tg.map(function (o) { return o.id; }), a: a, left: (a.tg || 1) - a.hits.length };
      }
      case 'heal': {
        var amt = a.v;
        if (a.self || !a.r) { healFig(G, f, amt, f); A.cur.did = true; return null; }
        var al = G.figs.filter(function (o) { return o.team === 'h' && o.pos && !o.exh && o.kind !== 'obj' && dist(o.pos, f.pos) <= a.r && los(G, f.pos, o.pos); });
        if (a.all) { al.forEach(function (o) { healFig(G, o, amt, f); }); A.cur.did = true; return null; }
        if (a.healed) return null;
        if (al.length === 1) { healFig(G, al[0], amt, f); A.cur.did = true; return null; }
        return { h: 'heal', id: f.id, ids: al.map(function (o) { return o.id; }), a: a };
      }
      case 'shield': if (a.r) { G.figs.filter(function (o) { return o.team === 'h' && o.pos && dist(o.pos, f.pos) <= a.r; }).forEach(function (o) { o.rnd.shd = (o.rnd.shd || 0) + a.v; }); } else f.rnd.shd = (f.rnd.shd || 0) + a.v; A.cur.did = true; ev(G, { e: 'shield', id: f.id, v: a.v }); return null;
      case 'retal': f.rnd.ret = (f.rnd.ret || 0) + a.v; f.rnd.retr = Math.max(f.rnd.retr || 1, a.r || 1); A.cur.did = true; ev(G, { e: 'retal', id: f.id, v: a.v }); return null;
      case 'loot': lootAround(G, f, a.v); A.cur.did = true; return null;
      case 'infuse': (G.infq = G.infq || []).push(a.e === 'any' ? 'fire' : a.e); A.cur.did = true; return null;
      case 'xp': A.cur.xp = (A.cur.xp || 0) + a.v; return null;
      case 'lost': A.cur.lost = true; return null;
      case 'selfc': addCond(G, f, a.c); A.cur.did = true; return null;
      case 'blessall': G.figs.filter(function (o) { return o.kind === 'hero' && !o.exh; }).forEach(function (o) { o.amd.draw.splice(Math.floor(rnd(G) * (o.amd.draw.length + 1)), 0, { v: 'x2', tmp: 1, bless: 1 }); }); ev(G, { e: 'bless' }); A.cur.did = true; return null;
      case 'pers': {
        var pid = 'p' + (G.uid++);
        f.pers.push({ pid: pid, k: a.k, v: a.v, n: a.n, c: A.cur.c }); A.cur.persist = !A.cur.basic; A.cur.pid = pid; A.cur.did = true;
        ev(G, { e: 'pers', id: f.id, k: a.k, v: a.v, n: a.n }); return null;
      }
      case 'recover': {
        if (a.got == null) a.got = 0;
        if (a.got >= a.v || !f.disc.length) return null;
        return { h: 'recover', id: f.id, cs: f.disc.slice() };
      }
      case 'summon': {
        var spots = nb(f.pos).filter(function (k) { return passable(G, k, f) && !figAt(G, k) && seen(G, k) && G.hex[k].t !== 'door'; });
        if (!spots.length) return null;
        return { h: 'summon', id: f.id, hexes: spots, sid: a.id };
      }
    }
    return null;
  }
  function spendArmed(f, kind) { f.armed = (f.armed || []).filter(function (x) { return x.k !== kind; }); }

  // ---------- movement ----------
  function passable(G, k, f, o) {
    var h = G.hex[k]; if (!h) return false;
    if (!seen(G, k)) return false;
    if (h.t === 'o' && !(o && (o.jump || o.fly))) return false;
    if (h.t === 'door' && !h.open && f.team !== 'h') return false;
    return true;
  }
  // Dijkstra: cost to reach each hex. Enemies block (unless jump/fly), allies can be passed. Traps cost a lot for monsters (they avoid them).
  function reach(G, f, maxc, o) {
    o = o || {};
    var fly = o.fly || o.jump, R = {}, q = [{ k: f.pos, c: 0, p: 0 }]; R[f.pos] = { c: 0, from: null, pen: 0 };
    while (q.length) {
      q.sort(function (x, y) { return (x.c + x.p * 0.001) - (y.c + y.p * 0.001); });
      var cur = q.shift(); if (cur.c > R[cur.k].c || (cur.c === R[cur.k].c && cur.p > R[cur.k].pen)) continue;
      nb(cur.k).forEach(function (k) {
        if (!passable(G, k, f, { fly: fly })) return;
        var occ = figAt(G, k);
        if (occ && occ.team !== f.team && !fly) return;
        if (occ && occ.kind === 'obj' && !fly) return;
        var h = G.hex[k], step = (h.t === 'diff' && !fly) ? 2 : 1, pen = cur.p;
        if (!fly && (h.t === 'trap' || h.t === 'haz')) pen += o.hero ? 0 : 1;
        if (h.t === 'door' && !h.open && f.team === 'h') { /* a hero may step into a closed door: it opens */ }
        var c = cur.c + step;
        if (maxc != null && c > maxc) return;
        if (!R[k] || c < R[k].c || (c === R[k].c && pen < R[k].pen)) { R[k] = { c: c, from: cur.k, pen: pen }; q.push({ k: k, c: c, p: pen }); }
      });
    }
    return R;
  }
  function pathTo(R, k) { var p = []; while (k && R[k] && R[k].from != null) { p.unshift(k); k = R[k].from; } return p; }
  function walk(G, f, path, o) {
    o = o || {};
    var from = f.pos;
    for (var i = 0; i < path.length; i++) {
      var k = path[i], last = i === path.length - 1;
      f.pos = k;
      var h = G.hex[k];
      if (o.jump && !last) continue;
      if (h.t === 'door' && !h.open) { h.open = true; ev(G, { e: 'door', k: k }); h.rooms.forEach(function (r) { reveal(G, r); }); }
      if (!o.fly) {
        if (h.t === 'trap') { var td = D.trapDmg(G.L); ev(G, { e: 'trap', id: f.id, k: k, v: td }); h.t = 'f'; damage(G, f, td, null, true); if (!fig(G, f.id) || f.exh) { ev(G, { e: 'move', id: f.id, path: [from].concat(path.slice(0, i + 1)) }); return; } }
        else if (h.t === 'haz') { var hd = Math.floor(D.trapDmg(G.L) / 2); ev(G, { e: 'haz', id: f.id, k: k, v: hd }); damage(G, f, hd, null, true); if (!fig(G, f.id) || f.exh) { ev(G, { e: 'move', id: f.id, path: [from].concat(path.slice(0, i + 1)) }); return; } }
      }
    }
    ev(G, { e: 'move', id: f.id, path: [from].concat(path), jump: !!o.jump });
  }

  // ---------- line of sight ----------
  function cubeRound(x, z) { var y = -x - z, rx = Math.round(x), ry = Math.round(y), rz = Math.round(z); var dx = Math.abs(rx - x), dy = Math.abs(ry - y), dz = Math.abs(rz - z); if (dx > dy && dx > dz) rx = -ry - rz; else if (dy <= dz) rz = -rx - ry; return K(rx, rz); }
  function blocksLos(G, k) { var h = G.hex[k]; if (!h) return true; if (!seen(G, k)) return true; if (h.t === 'door' && !h.open) return true; return false; }
  function los(G, a, b) {
    if (a === b) return true;
    var A = P(a), B = P(b), n = dist(a, b);
    var tryEps = function (e) { for (var i = 1; i < n; i++) { var t = i / n; var k = cubeRound(A[0] + (B[0] - A[0]) * t + e, A[1] + (B[1] - A[1]) * t + e); if (blocksLos(G, k)) return false; } return true; };
    return tryEps(1e-6) || tryEps(-1e-6);
  }
  function attackTargets(G, f, a) {
    var range = a.r ? a.r + (f.kind === 'hero' ? itemBonus(f, 'rng') : 0) : 1;
    return enemiesOf(G, f).filter(function (o) { return o.pos && !o.cond.inv && dist(o.pos, f.pos) <= range && los(G, f.pos, o.pos); });
  }

  // ---------- attacks and damage ----------
  function shieldOf(G, t) {
    var s = (t.rnd.shd || 0);
    if (t.kind === 'mon' || t.kind === 'boss') s += (t.kind === 'boss' ? (D.BOSS[t.type].shd || 0) : monStats(t.type, G.L, t.elite).shd || 0);
    if (t.kind === 'hero') { s += persBonus(G, t, 'shd', false); }
    if (t.kind === 'sum') s += D.SUMMON[t.type].shd || 0;
    return s;
  }
  function retalOf(G, t) {
    var r = (t.rnd.ret || 0), rr = t.rnd.retr || 1;
    if (t.kind === 'mon') { var st = monStats(t.type, G.L, t.elite); if (st.ret) { r += st.ret; rr = Math.max(rr, 1); } }
    if (t.kind === 'boss' && D.BOSS[t.type].ret) r += D.BOSS[t.type].ret;
    if (t.kind === 'hero') r += persBonus(G, t, 'ret', false);
    return { v: r, r: rr };
  }
  function deckOf(G, f) { if (f.kind === 'hero') return f.amd; if (f.kind === 'sum') { var o = fig(G, f.owner); return o ? o.amd : G.mamd; } return G.mamd; }
  function doAttack(G, att, tgt, a) {
    var base = a.v + (att.kind === 'hero' ? itemBonus(att, 'atk') + persBonus(G, att, 'atk', false) : 0);
    if (tgt.cond.poi) base += 1;
    var adv = !!att.cond.str || !!a.adv || (att.kind === 'hero' && itemBonus(att, 'adv') > 0);
    var dis = !!att.cond.mud || (a.r && dist(att.pos, tgt.pos) === 1);
    if (adv && dis) adv = dis = false;
    var deck = deckOf(G, att), r1 = drawResult(G, deck), m1 = modValue(r1, base), pick = r1, m = m1, other = null;
    if (adv || dis) { var r2 = drawResult(G, deck), m2 = modValue(r2, base); other = r2; if ((adv && m2.v > m1.v) || (dis && m2.v < m1.v)) { pick = r2; m = m2; other = r1; } }
    var sh = Math.max(0, shieldOf(G, tgt) - (a.pierce || 0));
    var dmg = m.nul ? 0 : Math.max(0, m.v - sh);
    var e = { e: 'atk', a: att.id, t: tgt.id, base: base, mod: pick.map(function (c) { return c.v; }), other: other ? other.map(function (c) { return c.v; }) : null, adv: adv, dis: dis, sh: sh, dmg: dmg, nul: m.nul, x2: m.x2 };
    ev(G, e);
    if (att.kind === 'hero') att.dealt += dmg;
    m.elems.forEach(function (x) { G.el[x] = 2; });
    var alive = damage(G, tgt, dmg, att);
    if (!m.nul && alive && fig(G, tgt.id)) {
      (a.cond || []).concat(m.conds).forEach(function (c) { addCond(G, tgt, c); });
      if (a.push) pushPull(G, att, tgt, a.push, 1);
      if (a.pull) pushPull(G, att, tgt, a.pull, -1);
    }
    if (m.heal && att.pos) healFig(G, att, m.heal, att);
    if (a.healSelf) healFig(G, att, a.healSelf, att);
    // retaliate (only when the attacker is within the retaliate range)
    if (fig(G, tgt.id) && !tgt.exh && fig(G, att.id) && !att.exh) {
      var rt = retalOf(G, tgt);
      if (rt.v > 0 && dist(att.pos, tgt.pos) <= rt.r) { ev(G, { e: 'retal-hit', a: tgt.id, t: att.id, v: rt.v }); damage(G, att, rt.v, tgt, true); }
    }
    if (a.splash && fig(G, tgt.id) === null && false) return;
  }
  // returns true if the figure is still on the board afterwards
  function damage(G, t, n, src, noBlock) {
    if (n <= 0) return true;
    if (t.kind === 'hero') {
      // persistent "shield N vs next hits" charges are spent by hits that would deal damage
      persBonus(G, t, 'shd', true);
      // a lethal hit: the player may lose cards to ignore it (asked through G.pend when allowed)
      if (n >= t.hp && !noBlock && (t.hand.length >= 1 || t.disc.length >= 2) && G.blockAsk !== false) {
        G.pend = { h: 'block', id: t.id, n: n, src: src ? src.id : null };
        return true;
      }
    }
    t.hp -= n; if (t.kind === 'hero') { t.taken = (t.taken || 0) + n; t.minhp = Math.min(t.minhp == null ? t.max : t.minhp, Math.max(0, t.hp)); } ev(G, { e: 'dmg', id: t.id, n: n, hp: t.hp });
    if (t.hp <= 0) { kill(G, t, src); return false; }
    return true;
  }
  function kill(G, t, src) {
    if (t.kind === 'hero') { t.hp = 0; exhaust(G, t, 'hp'); return; }
    ev(G, { e: 'die', id: t.id, type: t.type, pos: t.pos, kind: t.kind });
    if (src && src.kind === 'hero') src.kills++;
    if (src && src.kind === 'sum') { var ow = fig(G, src.owner); if (ow) ow.kills++; }
    if (t.kind === 'mon' && G.hex[t.pos] && !G.nocoin) { G.hex[t.pos].coin = (G.hex[t.pos].coin || 0) + 1; }
    if (t.kind === 'sum') { var o = fig(G, t.owner); if (o) { var j = o.active.findIndex(function (x) { return x.sum === t.id; }); if (j >= 0) { o.lost.push(o.active[j].c); o.active.splice(j, 1); } } }
    if (t.kind === 'obj') G.objKilled = (G.objKilled || 0) + 1;
    if (t.kind === 'boss') G.bossKilled = (G.bossKilled || 0) + 1;
    removeFig(G, t);
  }
  function healFig(G, t, n, src) {
    if (t.cond.wnd || t.cond.poi) { var had = !!t.cond.poi; delete t.cond.wnd; delete t.cond.poi; ev(G, { e: 'cure', id: t.id }); if (had) { ev(G, { e: 'heal', id: t.id, n: 0 }); return; } }
    var h = Math.min(n, t.max - t.hp); t.hp += h; ev(G, { e: 'heal', id: t.id, n: h });
  }
  function pushPull(G, att, tgt, n, dir) {
    for (var i = 0; i < n; i++) {
      var d0 = dist(att.pos, tgt.pos), best = null;
      nb(tgt.pos).forEach(function (k) {
        if (!passable(G, k, tgt) || figAt(G, k) || G.hex[k].t === 'door') return;
        var d1 = dist(att.pos, k);
        if (dir > 0 ? d1 > d0 : (d1 < d0 && k !== att.pos)) { if (!best || (dir > 0 ? d1 > best.d : d1 < best.d)) best = { k: k, d: d1 }; }
      });
      if (!best) break;
      walk(G, tgt, [best.k], {});
      if (!fig(G, tgt.id)) break;
    }
  }
  function lootAround(G, f, r) {
    Object.keys(G.hex).forEach(function (k) {
      var h = G.hex[k]; if (!seen(G, k) || dist(k, f.pos) > r) return;
      if (h.coin) { f.coins += h.coin; ev(G, { e: 'coin', id: f.id, n: h.coin, k: k }); h.coin = 0; }
      if (h.tr) lootTreasure(G, f, k);
    });
  }
  function lootTreasure(G, f, k) {
    var h = G.hex[k]; h.tr = 0; G.treasure = (G.treasure || 0) + 1;
    var sc = D.SCEN[G.sc], t = (sc.treasure || [])[G.treasure - 1] || { gold: 10 };
    if (t.gold) f.coins += 0, (G.trGold = G.trGold || {}), G.trGold[f.id] = (G.trGold[f.id] || 0) + t.gold;
    if (t.item) (G.trItems = G.trItems || []).push({ id: f.id, item: t.item });
    if (t.xp) f.sxp += t.xp;
    if (t.heal) healFig(G, f, t.heal, f);
    ev(G, { e: 'treasure', id: f.id, k: k, t: t });
  }

  // ---------- monster turn ----------
  function startMonTurn(G, type) {
    var d = G.md[type]; var card = D.MDECK[d.fam][d.cur];
    var mons = G.figs.filter(function (f) { return f.type === type && f.pos && (f.kind === 'mon' || f.kind === 'boss'); });
    mons.sort(function (a, b) { return (b.elite ? 1 : 0) - (a.elite ? 1 : 0) || a.num - b.num; });
    if (!mons.length) return false;
    ev(G, { e: 'mturn', type: type, card: d.cur });
    G.mq = { type: type, ids: mons.map(function (m) { return m.id; }), i: 0, card: d.cur };
    return runMonQueue(G);
  }
  // returns true if we stopped for input (a block choice)
  function runMonQueue(G) {
    var Q = G.mq;
    while (Q && Q.i < Q.ids.length) {
      var m = fig(G, Q.ids[Q.i]);
      if (!m) { Q.i++; continue; }
      if (!Q.started) { Q.started = 1; G.curMon = m.id; startTurnFx(G, m); if (!fig(G, m.id)) { Q.i++; Q.started = 0; continue; } Q.ai = 0; }
      var card = D.MDECK[G.md[Q.type].fam][Q.card];
      if (!m.cond.stn) {
        var acts = parse(card.a);
        while (Q.ai < acts.length) {
          var a = clone(acts[Q.ai]);
          Q.ai++;
          monsterStep(G, m, a, acts, Q);
          if (G.pend) { G.ask = G.pend; G.pend = null; G.resume = 'mon'; return true; }
          if (G.done || checkEnd(G)) return true;
          if (!fig(G, m.id)) break;
        }
      } else ev(G, { e: 'stunned', id: m.id });
      if (fig(G, m.id)) endFigTurn(G, m);
      G.curMon = null; Q.i++; Q.started = 0;
    }
    G.mq = null; G.curMon = null;
    return false;
  }
  function monInfo(G, m) {
    if (m.kind === 'boss') { var b = D.BOSS[m.type]; return { mv: b.mv, atk: D.bossAtk(m.type, G.L), rng: b.rng || 0, fly: !!b.fly, poi: false, pierce: 0, tg: 1 }; }
    if (m.kind === 'sum') { var s = D.SUMMON[m.type]; return { mv: s.mv, atk: s.atk, rng: s.rng || 0, fly: !!s.fly, tg: 1 }; }
    var st = monStats(m.type, G.L, m.elite); return { mv: st.mv, atk: st.atk, rng: st.rng || 0, fly: !!st.fly, poi: !!st.poi, wnd: !!st.wnd, pierce: st.pierce || 0, tg: st.tg || 1, mud: !!st.mud };
  }
  function monsterAttackSpec(G, m, a, info) {
    var x = { v: (a.rel ? info.atk + a.v : a.v), r: (a.r != null && !a.rrel) ? a.r : (info.rng ? info.rng + (a.r || 0) : 0), tg: a.tg || info.tg, pierce: (a.pierce || 0) + (info.pierce || 0), cond: (a.cond || []).slice(), push: a.push, pull: a.pull, all: a.all, adv: a.adv };
    if (info.poi) x.cond.push('poi'); if (info.wnd) x.cond.push('wnd'); if (info.mud) x.cond.push('mud');
    if (a.use) { x.use = a.use; useConsume(G, x); }
    return x;
  }
  // one action of a monster ability card. Move uses the NEXT attack on the card to pick where to go.
  function monsterStep(G, m, a, acts, Q) {
    var info = monInfo(G, m);
    if (a.t === 'move') {
      if (m.cond.imm) return;
      var nextAtk = null; for (var j = Q.ai; j < acts.length; j++) if (acts[j].t === 'atk') { nextAtk = monsterAttackSpec(G, m, clone(acts[j]), info); break; }
      var mv = a.rel ? info.mv + a.v : a.v; if (mv <= 0) return;
      monMove(G, m, mv, nextAtk || { r: 0, tg: 1 }, info);
    } else if (a.t === 'atk') {
      if (m.cond.dis) return;
      var spec = monsterAttackSpec(G, m, a, info);
      monAttack(G, m, spec, Q);
    } else if (a.t === 'heal') { healFig(G, m, a.v, m); }
    else if (a.t === 'shield') { m.rnd.shd = (m.rnd.shd || 0) + a.v; ev(G, { e: 'shield', id: m.id, v: a.v }); }
    else if (a.t === 'retal') { m.rnd.ret = (m.rnd.ret || 0) + a.v; m.rnd.retr = a.r || 1; ev(G, { e: 'retal', id: m.id, v: a.v }); }
    else if (a.t === 'infuse') { G.el[a.e] = 2; ev(G, { e: 'infuse', el: a.e }); }
    else if (a.t === 'selfc') addCond(G, m, a.c);
    else if (a.t === 'summon') monSummon(G, m, a.id);
    else if (a.t === 'special') bossSpecial(G, m, a.v, Q);
  }
  function summonTurn(G, s) {
    var acts = parse(D.SUMMON[s.type].act), Q = { i: 0, ai: 0 };
    G.curMon = s.id;
    for (var i = 0; i < acts.length; i++) { Q.ai = i + 1; monsterStep(G, s, clone(acts[i]), acts, Q); if (!fig(G, s.id) || G.done) break; }
    G.curMon = null;
  }
  function monSummon(G, m, type) {
    var spot = nb(m.pos).filter(function (k) { return passable(G, k, m) && !figAt(G, k) && G.hex[k].t !== 'door'; })[0];
    if (!spot) return;
    var st = monStats(type, G.L, false), used = G.figs.filter(function (f) { return f.type === type; }).map(function (f) { return f.num; }), n = 1; while (used.indexOf(n) >= 0) n++;
    var f = { id: 'm' + (G.uid++), kind: 'mon', team: 'm', type: type, elite: false, pos: spot, hp: st.hp, max: st.hp, cond: {}, rnd: {}, num: n, summoned: 1 };
    G.figs.push(f); ensureDeck(G, type, D.MON[type].deck); ev(G, { e: 'spawn', id: f.id, summoned: 1, f: clone(f) });
    // summoned this round: it does not act this round (it was not on the board when cards were drawn)
  }
  function bossSpecial(G, m, n, Q) {
    var sp = D.BOSS[m.type].sp[n - 1]; ev(G, { e: 'special', id: m.id, n: n, text: sp.text });
    parse(sp.a).forEach(function (a) { if (G.pend) return; if (!fig(G, m.id)) return; monsterStep(G, m, clone(a), parse(sp.a), { ai: 99 }); });
  }
  // focus: the enemy the monster can attack with the least movement; ties -> closest -> lowest initiative
  function initOf(G, f) {
    if (f.kind === 'hero') { var o = G.order.filter(function (x) { return x.id === f.id; })[0]; return o ? o.init : 99; }
    if (f.kind === 'sum') { var ow = fig(G, f.owner); return ow ? initOf(G, ow) - 0.5 : 99; }
    var d = G.md[f.type]; return d && d.cur != null ? D.MDECK[d.fam][d.cur].i : 99;
  }
  function attackHexes(G, m, tgt, r) {
    var range = r || 1;
    return Object.keys(G.hex).filter(function (k) { return G.hex[k].t !== 'o' && dist(k, tgt.pos) <= range && los(G, k, tgt.pos); });
  }
  function findFocus(G, m, spec, info) {
    var R = reach(G, m, null, { fly: info.fly }), best = null;
    var foes = G.figs.filter(function (o) { return o.team !== m.team && o.pos && !o.exh && !o.cond.inv && o.kind !== 'obj'; });
    foes.forEach(function (o) {
      var range = spec.r || 1, bc = null;
      attackHexes(G, m, o, range).forEach(function (k) { var x = R[k]; if (!x) return; var oc = figAt(G, k); if (oc && oc !== m) return; var c = x.c + x.pen * 50; if (bc === null || c < bc) bc = c; });
      if (bc === null) return;
      var key = [bc, dist(m.pos, o.pos), initOf(G, o)];
      if (!best || key[0] < best.key[0] || (key[0] === best.key[0] && (key[1] < best.key[1] || (key[1] === best.key[1] && key[2] < best.key[2])))) best = { f: o, key: key };
    });
    return best ? best.f : null;
  }
  function monMove(G, m, mv, spec, info) {
    var focus = findFocus(G, m, spec, info); if (!focus) return;
    var R = reach(G, m, null, { fly: info.fly }), range = spec.r || 1;
    var good = function (k) { return dist(k, focus.pos) <= range && los(G, k, focus.pos) && (!figAt(G, k) || figAt(G, k) === m); };
    // hexes it can stop on this turn
    var stops = Object.keys(R).filter(function (k) { return R[k].c <= mv && G.hex[k].t !== 'o' && (!figAt(G, k) || figAt(G, k) === m); });
    var ranged = range > 1;
    var score = function (k) {
      var x = R[k], s = 0;
      if (good(k)) {
        s += 10000;
        if (ranged && dist(k, focus.pos) === 1) s -= 3000;   // ranged monsters avoid being adjacent (disadvantage)
        var extra = G.figs.filter(function (o) { return o.team !== m.team && o.pos && o !== focus && !o.cond.inv && dist(k, o.pos) <= range && los(G, k, o.pos); }).length;
        s += Math.min(extra, (spec.tg || 1) - 1) * 500;
      } else {
        // get as close as possible to a hex it could attack from
        var bestRem = 999;
        attackHexes(G, m, focus, range).forEach(function (h) { if (!R[h]) return; if (figAt(G, h) && figAt(G, h) !== m) return; var d = R[h].c - R[k].c; var dd = dist(k, h); if (dd < bestRem) bestRem = dd; });
        s -= bestRem * 10;
      }
      s -= x.pen * 400; s -= x.c;
      return s;
    };
    var bestK = m.pos, bestS = score(m.pos);
    stops.forEach(function (k) { var s = score(k); if (s > bestS) { bestS = s; bestK = k; } });
    if (bestK === m.pos) return;
    walk(G, m, pathTo(R, bestK), { fly: info.fly });
  }
  function monAttack(G, m, spec, Q) {
    Q.hits = Q.hits || {};
    var key = Q.i + ':' + Q.ai;
    if (spec.all) { G.figs.filter(function (o) { return o.team !== m.team && o.pos && dist(o.pos, m.pos) === 1 && !o.cond.inv; }).forEach(function (o) { if (!G.pend) doAttack(G, m, o, spec); }); return; }
    var info = monInfo(G, m);
    var focus = findFocus(G, m, spec, info);
    var range = spec.r || 1;
    var cands = G.figs.filter(function (o) { return o.team !== m.team && o.pos && !o.exh && !o.cond.inv && o.kind !== 'obj' && dist(o.pos, m.pos) <= range && los(G, m.pos, o.pos); });
    if (!cands.length) return;
    cands.sort(function (a, b) { return (a === focus ? -1 : 0) - (b === focus ? -1 : 0) || dist(a.pos, m.pos) - dist(b.pos, m.pos) || initOf(G, a) - initOf(G, b); });
    cands.slice(0, spec.tg || 1).forEach(function (o) { if (G.pend || !fig(G, m.id)) return; doAttack(G, m, o, spec); });
  }

  // ---------- end of round / end of scenario ----------
  function endRound(G) {
    G.phase = 'endround';
    EL.forEach(function (e) { if (G.el[e] > 0) G.el[e]--; });
    G.figs.forEach(function (f) { f.rnd = {}; f.armed = []; });
    Object.keys(G.md).forEach(function (t) { var d = G.md[t]; if (d.cur != null) { d.disc.push(d.cur); d.cur = null; } if (d.resh) { d.draw = shuffle(G, d.draw.concat(d.disc)); d.disc = []; d.resh = false; } });
    var decks = [G.mamd].concat(heroes(G).map(function (f) { return f.amd; }));
    decks.forEach(function (dk) { if (dk.resh) { dk.draw = shuffle(G, dk.draw.concat(dk.disc)); dk.disc = []; dk.resh = false; } });
    ev(G, { e: 'endround', n: G.round });
    if (checkEnd(G, true)) return;
    G.srq = liveHeroes(G).filter(function (f) { return f.disc.length >= 2 && !f.lrest; }).map(function (f) { return f.id; });
    nextShortRest(G);
  }
  function nextShortRest(G) {
    while (G.srq && G.srq.length) {
      var f = fig(G, G.srq[0]);
      if (f && !f.exh && f.disc.length >= 2) { G.ask = { h: 'srest', id: f.id, must: f.hand.length < 2 }; return; }
      G.srq.shift();
    }
    G.srq = null; beginSelect(G);
  }
  function shortRest(G, f, mv) {
    if (!f.sr) { f.sr = { pick: f.disc[Math.floor(rnd(G) * f.disc.length)], re: false }; G.ask = { h: 'srest2', id: f.id, pick: f.sr.pick }; return; }
    if (mv.t === 'srest-redo' && !f.sr.re) {
      f.sr.re = true; damage(G, f, 1, null, true);
      var others = f.disc.filter(function (c) { return c !== f.sr.pick; }); if (others.length) f.sr.pick = others[Math.floor(rnd(G) * others.length)];
      if (f.exh) { f.sr = null; G.srq.shift(); return nextShortRest(G); }
      G.ask = { h: 'srest2', id: f.id, pick: f.sr.pick }; return;
    }
    var c = f.sr.pick; f.disc.splice(f.disc.indexOf(c), 1); f.lost.push(c); f.hand = f.hand.concat(f.disc); f.disc = [];
    ev(G, { e: 'srest', id: f.id, lost: c }); f.sr = null; G.srq.shift(); nextShortRest(G);
  }
  function goalState(G) {
    var sc = D.SCEN[G.sc], gl = sc.goal, foes = G.figs.filter(function (f) { return f.team === 'm' && f.kind !== 'obj'; });
    var allRev = Object.keys(G.hex).every(function (k) { var h = G.hex[k]; return h.t !== 'door' || h.open; });
    switch (gl.t) {
      case 'kill': return allRev && !foes.length && G.place.every(function (p) { return G.rev[G.hex[p.k].room]; });
      case 'boss': return (G.bossKilled || 0) >= (gl.n || 1);
      case 'loot': return (G.treasure || 0) >= gl.n;
      case 'escape': { var lh = liveHeroes(G); return lh.length > 0 && lh.every(function (f) { return f.pos && G.hex[f.pos].ex; }); }
      case 'survive': return G.phase === 'endround' && G.round >= gl.n;
      case 'objs': return (G.objKilled || 0) >= gl.n;
      case 'reach': return liveHeroes(G).some(function (f) { return f.pos && G.hex[f.pos].ex; }) && (!gl.kill || !foes.length);
    }
    return false;
  }
  function checkEnd(G, roundEnd) {
    if (G.done) return true;
    if (!liveHeroes(G).length) { finish(G, false); return true; }
    var sc = D.SCEN[G.sc];
    if (goalState(G)) { finish(G, true); return true; }
    if (roundEnd && sc.goal.limit && G.round >= sc.goal.limit) { finish(G, false); return true; }
    return false;
  }
  function finish(G, won) {
    G.done = { won: won, round: G.round }; G.phase = 'over'; G.ask = null;
    var gold = D.goldPerCoin(G.L), bonus = won ? D.bonusXp(G.L) : 0;
    G.done.res = heroes(G).map(function (f) { return { id: f.id, cls: f.cls, xp: f.sxp + bonus, sxp: f.sxp, gold: f.coins * gold + ((G.trGold || {})[f.id] || 0), coins: f.coins, kills: f.kills, exh: f.exh, goal: f.goal, minhp: f.minhp == null ? f.max : f.minhp, max: f.max, taken: f.taken || 0, dealt: f.dealt, lostCount: f.lost.length, lrests: f.lrests || 0, items: f.items.map(function (i) { return i.id; }) }; });
    G.done.items = (G.trItems || []).slice();
    ev(G, { e: 'over', won: won });
  }

  // ---------- the move interface ----------
  function validMoves(G) {
    if (G.done) return [];
    var A = G.ask; if (!A) return [];
    var f = A.id ? fig(G, A.id) : null, out = [];
    switch (A.h) {
      case 'sel':
        liveHeroes(G).forEach(function (h) {
          if (G.sel[h.id]) return;
          if (h.hand.length >= 2) for (var i = 0; i < h.hand.length; i++) for (var j = i + 1; j < h.hand.length; j++) out.push({ t: 'sel', id: h.id, cards: [h.hand[i], h.hand[j]] });
          if (h.disc.length >= 2) out.push({ t: 'lrest', id: h.id });
        });
        return out;
      case 'first': case 'second': return halfOptions(G, f).concat(itemMoves(G));
      case 'stunned': return [{ t: 'ok' }];
      case 'move': return A.hexes.map(function (k) { return { t: 'hex', k: k }; }).concat([{ t: 'skip' }], itemMoves(G));
      case 'target': return A.ids.map(function (id) { return { t: 'tgt', id: id }; }).concat([{ t: 'skip' }], itemMoves(G));
      case 'heal': return A.ids.map(function (id) { return { t: 'tgt', id: id }; }).concat([{ t: 'skip' }]);
      case 'summon': return A.hexes.map(function (k) { return { t: 'hex', k: k }; }).concat([{ t: 'skip' }]);
      case 'recover': return A.cs.map(function (c) { return { t: 'card', c: c }; }).concat([{ t: 'skip' }]);
      case 'lrest': return f.disc.map(function (c) { return { t: 'lose', c: c }; });
      case 'srest': return (A.must ? [] : [{ t: 'nosrest' }]).concat([{ t: 'srest' }]);
      case 'srest2': return f.sr && !f.sr.re && f.hp > 1 ? [{ t: 'srest' }, { t: 'srest-redo' }] : [{ t: 'srest' }];
      case 'block':
        out.push({ t: 'take' });
        f.hand.forEach(function (c) { if (!f.sel || f.sel.indexOf(c) < 0 || G.phase !== 'turns') out.push({ t: 'block', c: c }); });
        if (f.disc.length >= 2) out.push({ t: 'block2' });
        return out;
    }
    return out;
  }
  var TURN_ASKS = { first: 1, second: 1, move: 1, target: 1, heal: 1 };
  function itemMoves(G) {
    var A = G.ask; if (!A || !TURN_ASKS[A.h]) return [];
    var f = fig(G, A.id); if (!f || f.kind !== 'hero') return [];
    var out = []; f.items.forEach(function (it, i) { if (it.st === 'ok') out.push({ t: 'item', i: i }); });
    return out;
  }
  function useItem(G, f, i) {
    var it = f.items[i], d = D.ITEM_BY[it.id];
    it.st = d.use === 'lost' ? 'lost' : 'spent';
    ev(G, { e: 'item', id: f.id, item: it.id });
    switch (d.k) {
      case 'atk': case 'adv': case 'mov': case 'rng': (f.armed = f.armed || []).push({ k: d.k, v: d.v }); break;
      case 'shd': f.rnd.shd = (f.rnd.shd || 0) + d.v; break;
      case 'ret': f.rnd.ret = (f.rnd.ret || 0) + d.v; f.rnd.retr = 1; break;
      case 'heal': healFig(G, f, d.v, f); break;
      case 'cure': healFig(G, f, 1, f); break;
      case 'stamina': for (var n = 0; n < d.v && f.disc.length; n++) f.hand.push(f.disc.pop()); break;
      case 'str': addCond(G, f, 'str'); break;
      case 'inv': addCond(G, f, 'inv'); break;
      case 'inf': G.el[d.v] = 2; ev(G, { e: 'infuse', el: d.v }); break;
    }
    // refresh the current question (a boot may reach further, a hood may reach further foes)
    if (G.act && G.act.cur && (G.ask.h === 'move' || G.ask.h === 'target')) { var a = G.act.q[G.act.i]; var nx = heroAction(G, f, a); if (nx) G.ask = nx; }
  }
  function sideToAct(G) { return G.ask ? (G.ask.id || 'party') : null; }
  function apply(G, mv) {
    var A = G.ask, f = A && A.id ? fig(G, A.id) : null;
    if (!A) throw new Error('no question pending');
    switch (mv.t) {
      case 'sel': { var h = fig(G, mv.id); h.sel = mv.cards.slice(); h.lrest = false; G.sel[h.id] = 1; ev(G, { e: 'sel', id: h.id }); break; }
      case 'lrest': { var h2 = fig(G, mv.id); h2.sel = null; h2.lrest = true; G.sel[h2.id] = 1; ev(G, { e: 'sel', id: h2.id, lrest: 1 }); break; }
      case 'half': if (!f || !f.sel || f.sel.indexOf(mv.c) < 0 || G.act.used.indexOf(mv.c) >= 0) throw new Error('card not in play'); playHalf(G, f, mv); return G;
      case 'ok': G.act.used = f.sel.slice(); f.hand = f.hand.filter(function (c) { return f.sel.indexOf(c) < 0; }); f.disc = f.disc.concat(f.sel); endHeroTurn(G, f); return G;
      case 'hex':
        if (A.h === 'move') { var a = G.act.q[G.act.i], R = reach(G, f, A.v, { jump: A.jump, hero: 1 }); walk(G, f, pathTo(R, mv.k), { jump: A.jump }); G.act.cur.did = true; spendArmed(f, 'mov'); persBonus(G, f, 'mov', true); a.done = 1; G.act.i++; afterHeroStep(G, f); return G; }
        if (A.h === 'summon') { summonAt(G, f, A.sid, mv.k); G.act.i++; afterHeroStep(G, f); return G; }
        break;
      case 'tgt':
        if (A.h === 'target') {
          var a2 = G.act.q[G.act.i], t = fig(G, mv.id);
          a2.hits.push(mv.id); doAttack(G, f, t, a2); G.act.cur.did = true;
          if (a2.splash && t && t.pos && fig(G, t.id) && !f.exh) G.figs.filter(function (o) { return o.team !== f.team && o.pos && o !== t && dist(o.pos, t.pos) === 1 && a2.hits.indexOf(o.id) < 0; }).forEach(function (o) { a2.hits.push(o.id); doAttack(G, f, o, a2); });
          if (f.exh || !f.pos || a2.hits.length >= (a2.tg || 1) || !attackTargets(G, f, a2).some(function (o) { return a2.hits.indexOf(o.id) < 0; })) { spendArmed(f, 'atk'); spendArmed(f, 'adv'); spendArmed(f, 'rng'); persBonus(G, f, 'atk', true); G.act.i++; }
          afterHeroStep(G, f); return G;
        }
        if (A.h === 'heal') { var a3 = G.act.q[G.act.i]; healFig(G, fig(G, mv.id), a3.v, f); a3.healed = 1; G.act.cur.did = true; G.act.i++; afterHeroStep(G, f); return G; }
        break;
      case 'card': { var a4 = G.act.q[G.act.i]; f.disc.splice(f.disc.indexOf(mv.c), 1); f.hand.push(mv.c); a4.got++; ev(G, { e: 'recover', id: f.id, c: mv.c }); G.act.cur.did = true; afterHeroStep(G, f); return G; }
      case 'skip':
        if (A.h === 'target') { var a5 = G.act.q[G.act.i]; if (a5.hits.length) { spendArmed(f, 'atk'); persBonus(G, f, 'atk', true); } }
        G.act.i++; afterHeroStep(G, f); return G;
      case 'lose': finishLongRest(G, f, mv.c); endHeroTurn(G, f); return G;
      case 'srest': case 'srest-redo': shortRest(G, f, mv); return G;
      case 'nosrest': G.srq.shift(); nextShortRest(G); return G;
      case 'take': case 'block': case 'block2': resolveBlock(G, f, mv); return G;
      case 'item': useItem(G, f, mv.i); return G;
      default: throw new Error('bad move ' + mv.t);
    }
    if (A.h === 'sel' && liveHeroes(G).every(function (h) { return G.sel[h.id]; })) { G.ask = null; startRound(G); }
    return G;
  }
  function afterHeroStep(G, f) {
    G.ask = null;
    if (G.pend) { G.ask = G.pend; G.pend = null; G.resume = 'hero'; return; }
    if (checkEnd(G)) return;
    if (f.exh) { G.act = null; return nextTurn(G); }
    runActions(G, f);
  }
  function summonAt(G, f, sid, k) {
    var s = D.SUMMON[sid], id = 's' + (G.uid++);
    G.figs.push({ id: id, kind: 'sum', team: 'h', type: sid, owner: f.id, pos: k, hp: s.hp + (s.hpL || 0) * (f.lvl - 1), max: s.hp + (s.hpL || 0) * (f.lvl - 1), cond: {}, rnd: {} });
    G.act.cur.persist = true; G.act.cur.did = true; G.act.cur.pid = null;
    G.act.cur.sumId = id;
    ev(G, { e: 'summon', id: id, owner: f.id, k: k, f: clone(fig(G, id)) });
    // the card stays active until the summon dies
    var cur = G.act.cur, oldDone = cur; cur.sum = id;
  }
  // patch cardDone to remember summons on active cards
  var _cardDone = cardDone;
  cardDone = function (G, f) { var cur = G.act.cur; if (cur && cur.sum && !f.exh) { var hi = f.hand.indexOf(cur.c); if (hi >= 0) f.hand.splice(hi, 1); f.active.push({ c: cur.c, sum: cur.sum }); if (cur.xp && cur.did) { f.sxp += cur.xp; ev(G, { e: 'xp', id: f.id, n: cur.xp }); } G.act.cur = null; if (G.act.step === 'first') { G.act.step = 'second'; G.ask = { h: 'second', id: f.id }; } else endHeroTurn(G, f); return; } return _cardDone(G, f); };
  function resolveBlock(G, f, mv) {
    var A = G.ask; G.ask = null;
    if (mv.t === 'take') { f.hp -= A.n; f.taken = (f.taken || 0) + A.n; f.minhp = Math.min(f.minhp == null ? f.max : f.minhp, Math.max(0, f.hp)); ev(G, { e: 'dmg', id: f.id, n: A.n, hp: f.hp }); if (f.hp <= 0) kill(G, f, A.src ? fig(G, A.src) : null); }
    else if (mv.t === 'block') { f.hand.splice(f.hand.indexOf(mv.c), 1); f.lost.push(mv.c); ev(G, { e: 'block', id: f.id, n: A.n, cards: [mv.c] }); }
    else { var two = f.disc.splice(0, 2); f.lost = f.lost.concat(two); ev(G, { e: 'block', id: f.id, n: A.n, cards: two }); }
    resume(G);
  }
  function resume(G) {
    var r = G.resume; G.resume = null;
    if (checkEnd(G)) return;
    if (r === 'mon') { if (!runMonQueue(G)) nextTurn(G); return; }
    if (r === 'hero') { var f = fig(G, G.act && G.act.id); if (!f || f.exh) { G.act = null; return nextTurn(G); } return runActions(G, f); }
  }

  // ---------- invariants (tests) ----------
  function checkInvariants(G) {
    var errs = [], pos = {};
    G.figs.forEach(function (f) {
      if (!f.pos) { if (f.kind !== 'hero' || !f.exh) errs.push('no pos ' + f.id); return; }
      if (pos[f.pos]) errs.push('two figures on ' + f.pos); pos[f.pos] = 1;
      if (!G.hex[f.pos]) errs.push('off map ' + f.id);
      if (G.hex[f.pos] && G.hex[f.pos].t === 'o') errs.push('on obstacle ' + f.id);
      if (f.hp > f.max) errs.push('hp>max ' + f.id);
      if (f.kind !== 'hero' && f.hp <= 0) errs.push('dead on board ' + f.id);
    });
    heroes(G).forEach(function (f) {
      var C = D.HERO[f.cls], all = f.hand.concat(f.disc, f.lost, f.active.map(function (a) { return a.c; }));
      if (G.act && G.act.id === f.id && G.act.cur && all.indexOf(G.act.cur.c) < 0) all.push(G.act.cur.c);
      var uniq = {}; all.forEach(function (c) { if (uniq[c]) errs.push('card twice ' + c); uniq[c] = 1; });
      if (all.length !== C.hand) errs.push(f.id + ' has ' + all.length + ' cards, hand size ' + C.hand);
    });
    EL.forEach(function (e) { if (!(G.el[e] >= 0 && G.el[e] <= 2)) errs.push('element ' + e); });
    return errs;
  }

  g.WD = { K: K, P: P, nb: nb, dist: dist, parse: parse, parseMap: parseMap, newScenario: newScenario, validMoves: validMoves, apply: apply, sideToAct: sideToAct,
    checkInvariants: checkInvariants, itemMoves: itemMoves, fig: fig, figAt: figAt, heroes: heroes, liveHeroes: liveHeroes, reach: reach, pathTo: pathTo, los: los, attackTargets: attackTargets,
    seen: seen, shieldOf: shieldOf, monInfo: monInfo, findFocus: findFocus, baseAmd: baseAmd, applyPerk: applyPerk, rnd: rnd, shuffle: shuffle, clone: clone, EL: EL, DIRS: DIRS, goalState: goalState, initOf: initOf,
    modValue: modValue };
})(typeof window !== 'undefined' ? window : globalThis);
