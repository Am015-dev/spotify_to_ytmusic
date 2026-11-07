// Emberclimb UI: DOM, board-first. Every picture is a NAMED SLOT (A(stem)) filled by media/<stem>.webp when present, else a placeholder.
(function () {
  var D = EC.D, E = EC.E, app = document.getElementById('app');
  var Q = location.search;
  window.ANIM = !/anim=0/.test(Q); window.AIDELAY = 650;
  var UI = { sel: -1, pile: null, ov: null, busy: false, mode: 'title', pick: ['w'], moveLog: 0 };
  window.UI = UI;
  function h(tag, cls, txt, kids) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; (kids || []).forEach(function (k) { if (k) e.appendChild(k); }); return e; }
  function on(e, fn) { e.addEventListener('click', function (ev) { ev.stopPropagation(); fn(ev); }); return e; }
  // ---------- art slots: media/<stem>.webp (or .png) fills the slot when present; the placeholder shows otherwise
  var AS = window.ASSETS || { items: [] }, KIND = {}, PROBE = {};
  AS.items.forEach(function (it) { KIND[it.stem] = it; });
  function A(stem, label, o) {
    o = o || {}; var it = KIND[stem], kind = (it && it.kind) || o.kind || 'icon';
    var e = h('div', 'art k-' + kind + (o.cls ? ' ' + o.cls : '') + (o.noph ? ' noph' : '')); e.setAttribute('data-stem', stem);
    if (o.ph) e.style.setProperty('--ph', o.ph);
    e.appendChild(h('div', 'ph', label == null ? '' : label));
    if (PROBE[stem] === 1) { e.style.backgroundImage = 'url(media/' + stem + '.webp)'; e.classList.add('has'); }
    else if (PROBE[stem] === undefined) {
      PROBE[stem] = 0; var im = new Image();
      im.onload = function () { PROBE[stem] = 1; document.querySelectorAll('[data-stem="' + stem + '"]').forEach(function (n) { n.style.backgroundImage = 'url(media/' + stem + '.webp)'; n.classList.add('has'); }); };
      im.onerror = function () { PROBE[stem] = -1; };
      im.src = 'media/' + stem + '.webp';
    }
    return e;
  }
  window.EC_A = A;
  var GLY = { atk: '⚔', def: '🛡', buf: '✦', deb: '☠', sleep: '💤', big: '⚔' };
  var TONE = { w: '#a8431f', s: '#2f7a46', a: '#2f6fa8', m: '#a8861c', n: '#777', z: '#555' };
  // ---------- helpers
  function G() { return E.G(); }
  function toast(t) { var d = h('div', 'toast', t); document.body.appendChild(d); setTimeout(function () { d.remove(); }, 1400); }
  function rectOf(w) { var e = document.querySelector('[data-w="' + w + '"]'); return e ? e.getBoundingClientRect() : null; }
  function popAt(w, txt, cls) {
    if (!window.ANIM) return; var r = rectOf(w); if (!r) return;
    var d = h('div', 'pop ' + cls, txt); d.style.left = (r.left + r.width / 2 - 14 + (Math.random() * 24 - 12)) + 'px'; d.style.top = (r.top + r.height * 0.35) + 'px';
    document.body.appendChild(d); setTimeout(function () { d.remove(); }, 950);
  }
  function fxAt(w, stem) { if (!window.ANIM) return; var r = rectOf(w); if (!r) return; var d = A(stem, '', { noph: 1, cls: 'fxs' }); d.style.cssText = 'position:fixed;z-index:68;pointer-events:none;width:' + Math.min(110, r.width) + 'px;height:' + Math.min(110, r.width) + 'px;left:' + (r.left + r.width / 2 - Math.min(110, r.width) / 2) + 'px;top:' + (r.top + r.height * .25) + 'px;animation:fxfade .6s forwards'; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 650); }
  function drain() {
    var g = G(); if (!g) return; var q = g.q; g.q = [];
    q.forEach(function (f) {
      var el = document.querySelector('[data-w="' + f.w + '"]');
      switch (f.k) {
        case 'dmg': fxAt(f.w, f.x === 'poison' ? 'fx-poison-cloud' : 'fx-slash'); popAt(f.w, f.x === 'blocked' ? 'Blocked' : String(f.n), 'dmg'); if (el && window.ANIM) { el.classList.add('shake'); setTimeout(function () { el.classList.remove('shake'); }, 360); } break;
        case 'hitme': popAt(f.w, f.x === 'blocked' ? 'Blocked' : '-' + f.n, 'dmg'); if (el && window.ANIM) { el.classList.add('shake'); setTimeout(function () { el.classList.remove('shake'); }, 360); } break;
        case 'hp': break;
        case 'blk': fxAt(f.w, 'fx-block-burst'); popAt(f.w, '+' + f.n + ' Blk', 'blk'); break;
        case 'heal': fxAt(f.w, 'fx-heal-sparkle'); popAt(f.w, '+' + f.n, 'heal'); break;
        case 'buff': popAt(f.w, f.x === 'str' ? '+' + f.n + ' Str' : f.x === 'nrg' ? '+' + f.n + ' Energy' : 'Power!', 'buf'); break;
        case 'debuff': popAt(f.w, (f.x === 'poison' ? 'Poison' : f.x === 'vuln' ? 'Vulnerable' : 'Weak') + (f.n ? ' ' + f.n : ''), 'deb'); break;
        case 'die': if (window.ANIM) { var d = h('div', 'pop die', '🎲 ' + f.n); d.appendChild(A('die-' + f.n, '', { noph: 1, cls: 'dieart' })); d.style.left = '40%'; d.style.top = '36%'; document.body.appendChild(d); setTimeout(function () { d.remove(); }, 1000); } break;
        case 'act': if (f.x === 'atk' && el && window.ANIM) { el.classList.add('lunge'); setTimeout(function () { el.classList.remove('lunge'); }, 480); } break;
        case 'kill': popAt(f.w, 'Down!', 'dmg'); break;
        case 'relic': toast('Relic: ' + D.RELICS[f.x].name); break;
        case 'turn': if (+f.n > 0 && g.hs.length > 1) toast(D.H[g.hs[+f.w.slice(1)].k].name + ' acts'); break;
      }
    });
  }
  // ---------- card element
  function cardEl(c, o) {
    o = o || {}; var e = E.eff(c), d = D.CARDS[c.id];
    var el = h('div', 'card t-' + e.type + (d.rar === 'r' ? ' rare' : d.rar === 'u' ? ' unc' : ''));
    var art = h('div', 'cart'); art.appendChild(A(c.id, d.name, { ph: TONE[d.hero] })); art.appendChild(A('frame-' + ({ A: 'attack', S: 'skill', P: 'power', X: 'status' })[e.type], '', { cls: 'cfr', noph: 1 }));
    var ct = h('div', 'ct', e.name);
    el.appendChild(ct); el.appendChild(art);
    if (e.cost !== -1 && e.fl.indexOf('u') < 0) el.appendChild(h('div', 'cx', e.cost === 'X' ? 'X' : String(e.cost)));
    var cb = h('div', 'cb'); E.lines(e).forEach(function (l) { cb.appendChild(h('span', 'cl', l)); }); el.appendChild(cb);
    el.appendChild(A('gem-' + ({ s: 'common', c: 'common', u: 'uncommon', r: 'rare', z: 'common', k: 'common' })[d.rar], '', { cls: 'cfr', noph: 1 }));
    return el;
  }
  // ---------- screens
  function render() {
    var g = G(); app.innerHTML = '';
    if (UI.mode === 'title' || !g) return title();
    if (g.scr === 'map') mapScr(); else if (g.scr === 'battle') battle(); else if (g.scr === 'reward') reward();
    else if (g.scr === 'rest') rest(); else if (g.scr === 'shop') shop(); else if (g.scr === 'event') event(); else if (g.scr === 'over') over();
    if (UI.ov) overlay();
    E.save(); drain();
  }
  UI.render = render;
  function title() {
    var s = h('div'); s.id = 'title';
    s.appendChild(A('bg-title', '', { cls: 'bg', kind: 'bg' }));
    var t = h('div', '', null, [h('h1', '', 'EMBERCLIMB'), h('p', 'sub', 'Climb the tower. Build your deck.')]); s.appendChild(t);
    var hs = h('div', 'heroes');
    ['w', 's', 'a', 'm'].forEach(function (k) {
      var H = D.H[k], b = h('button', 'hero' + (UI.pick.indexOf(k) >= 0 ? ' sel' : ''), null, [A('hero-' + k, H.name, { ph: TONE[k] }), h('b', '', H.name.split(' ')[0]), h('i', '', H.role)]);
      b.setAttribute('data-hero', k);
      on(b, function () { var i = UI.pick.indexOf(k); if (i >= 0) { if (UI.pick.length > 1) UI.pick.splice(i, 1); } else { UI.pick.push(k); if (UI.pick.length > 2) UI.pick.shift(); } render(); });
      hs.appendChild(b);
    });
    var mid = h('div', '', null, [hs, h('div', 'refline', D.H[UI.pick[UI.pick.length - 1]].mech)]); mid.style.cssText = 'display:flex;flex-direction:column;gap:8px;align-items:center;width:100%';
    s.appendChild(mid);
    var row = h('div', 'row'); var go = on(h('button', 'btn', UI.pick.length > 1 ? 'Climb together' : 'Climb'), function () { start(); }); go.id = 'play'; row.appendChild(go);
    var sv = null; try { sv = localStorage.getItem('emberclimb.save'); } catch (e) { }
    if (sv) { var ct = on(h('button', 'btn alt', 'Continue'), function () { if (E.load()) { UI.mode = 'game'; render(); resume(); } }); row.appendChild(ct); }
    row.appendChild(on(h('button', 'btn alt', 'Rules'), function () { UI.ov = 'rules'; render(); }));
    var wrap = h('div', '', null, [h('div', 'refline', UI.pick.length > 1 ? 'Two heroes, shared map. Pass the screen.' : 'Pick 1 hero, or 2 to play together.'), row]); wrap.style.cssText = 'display:flex;flex-direction:column;gap:10px;align-items:center';
    s.appendChild(wrap); app.appendChild(s);
    if (UI.ov) overlay();
  }
  function start() { E.newGame({ heroes: UI.pick.slice() }); UI.mode = 'game'; UI.sel = -1; render(); }
  function resume() { var g = G(); if (g && g.scr === 'battle' && g.b.ph === 'e') enemyPhase(); }
  function topbar(extra) {
    var g = G(), t = h('div', 'top');
    g.hs.forEach(function (x) { t.appendChild(h('span', 'chip', '♥ ' + x.hp + '/' + x.mhp)); });
    t.appendChild(h('span', 'chip', '● ' + g.gold)); t.appendChild(h('span', 'sp'));
    var p = h('div', 'pots'); for (var i = 0; i < g.pslots; i++) (function (i) {
      var id = g.pots[i], b = h('button', 'pot' + (id ? ' full' : ''), null, id ? [A('pot-' + id, D.POTIONS[id].name, { ph: '#5a8a5a' })] : []);
      b.setAttribute('aria-label', id ? D.POTIONS[id].name : 'Empty potion slot'); if (id) on(b, function () { usePot(i); }); else b.disabled = true; p.appendChild(b);
    })(i);
    t.appendChild(p);
    t.appendChild(on(h('button', 'chip tap', '🎒 ' + g.relics.length), function () { UI.ov = 'relics'; render(); }));
    t.appendChild(on(h('button', 'chip tap', '🂠 ' + g.hs.reduce(function (a, x) { return a + x.deck.length; }, 0)), function () { UI.ov = 'deck'; render(); }));
    if (extra) t.appendChild(extra);
    return t;
  }
  var NODEG = { m: '⚔', e: '💀', r: '🔥', s: '🛒', v: '?', t: '🎁', b: '👑' }, NODEN = { m: 'node-monster', e: 'node-elite', r: 'node-rest', s: 'node-shop', v: 'node-event', t: 'node-treasure', b: 'node-boss' };
  function mapScr() {
    var g = G(); app.appendChild(topbar());
    var m = h('div'); m.id = 'map'; m.setAttribute('data-board', '1'); m.appendChild(A('bg-map', '', { cls: 'bg', kind: 'bg' }));
    function pos(n) { return { x: (n.c + 0.5) / 4 * 100, y: 100 - (n.f - 0.5) / 10.5 * 100 }; }
    var NS = 'http://www.w3.org/2000/svg', svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', '0 0 100 100'); svg.setAttribute('preserveAspectRatio', 'none');
    g.map.forEach(function (n) { n.nx.forEach(function (k) { var a = pos(n), b = pos(g.map[k]), l = document.createElementNS(NS, 'line'); l.setAttribute('x1', a.x); l.setAttribute('y1', a.y); l.setAttribute('x2', b.x); l.setAttribute('y2', b.y); l.setAttribute('stroke', n.vis ? '#f2872b' : '#6b5040'); l.setAttribute('stroke-width', '2'); l.setAttribute('vector-effect', 'non-scaling-stroke'); l.setAttribute('stroke-dasharray', n.vis ? '' : '4 4'); svg.appendChild(l); }); });
    m.appendChild(svg);
    var rc = E.reachable();
    g.map.forEach(function (n) {
      var p = pos(n), ok = rc.indexOf(n.id) >= 0;
      var b = h('button', 'node t-' + n.t + (ok ? ' glow' : '') + (n.vis ? ' vis' : '') + (g.at === n.id ? ' here' : ''), null, [A(NODEN[n.t], NODEG[n.t], { ph: '#3a2a20' })]);
      b.style.left = p.x + '%'; b.style.top = p.y + '%'; b.setAttribute('aria-label', D.NODES[n.t]);
      if (ok) on(b, function () { E.performMove({ t: 'go', n: n.id }); UI.sel = -1; render(); if (G().scr === 'battle') beginBattleUI(); });
      else b.disabled = true;
      m.appendChild(b);
    });
    m.appendChild(h('div', 'hint', null, [h('span', '', 'Pick a glowing room.')]));
    app.appendChild(m);
  }
  // ---------- battle
  function intentOf(e) {
    var it = e.intent, g = G(); if (!it) return { c: 'buf', t: '', g: '?' };
    if (it.sleep) return { c: 'buf', t: 'zzz', g: GLY.sleep, s: 'intent-sleep' };
    if (it.atk) {
      var h0 = g.hs[it.tg] || g.hs[0], d = it.atk + (e.st.str || 0); if (e.st.weak > 0) d = Math.floor(d * 0.75); if (h0.st.vuln > 0) d = Math.floor(d * 1.5); if (h0.stance === 'w') d *= 2; d = Math.max(0, d);
      var t = (it.hits > 1 ? d + 'x' + it.hits : String(d)); if (g.hs.length > 1) t += ' → ' + D.H[h0.k].name.split(' ')[0];
      return { c: 'atk', t: t, g: GLY.atk, s: d * (it.hits || 1) >= 20 ? 'intent-attack-big' : 'intent-attack' };
    }
    if (it.weak || it.vuln || it.frail || it.add) return { c: 'deb', t: '', g: GLY.deb, s: 'intent-debuff' };
    if (it.blk && !it.str) return { c: 'def', t: String(it.blk), g: GLY.def, s: 'intent-defend' };
    return { c: 'buf', t: '', g: GLY.buf, s: 'intent-buff' };
  }
  function stChips(o) {
    var w = h('div', 'stc'); [['str', 'Str'], ['vuln', 'Vuln'], ['weak', 'Weak'], ['poison', 'Poison'], ['frail', 'Frail']].forEach(function (p) { if (o.st[p[0]]) w.appendChild(h('span', '', null, [A('st-' + p[0], '', { noph: 1 }), document.createTextNode(p[1] + ' ' + o.st[p[0]])])); });
    return w;
  }
  function needTarget() { var g = G(), h0 = g.hs[g.b.cur], c = h0.hand[UI.sel]; return c && E.eff(c).tgt; }
  function battle() {
    var g = G(), b = g.b, cur = g.hs[b.cur >= 0 ? b.cur : 0];
    app.appendChild(topbar(h('span', 'chip', 'Turn ' + b.turn)));
    var st = h('div'); st.id = 'stage'; st.setAttribute('data-board', '1'); st.appendChild(A(b.kind === 'b' ? 'bg-boss-' + g.boss : b.kind === 'e' ? 'bg-elite' : 'bg-battle-' + (1 + ((g.floor - 1) % 3)), '', { cls: 'bg', kind: 'bg' }));
    var en = h('div', 'enemies'), tgtMode = b.ph === 'p' && UI.sel >= 0 && needTarget();
    b.en.forEach(function (e, i) {
      var d = D.ENEMIES[e.id], it = e.dead ? null : intentOf(e);
      var x = h('div', 'en' + (e.dead ? ' dead' : '') + (tgtMode && !e.dead ? ' glow' : ''));
      x.setAttribute('data-w', 'e' + i);
      if (it) x.appendChild(h('div', 'intent ' + it.c, null, [A(it.s || 'intent-buff', it.g, { ph: 'transparent' }), h('span', '', it.t)]));
      x.appendChild(A('enemy-' + e.id, d.name, { ph: '#6a3a2a' }));
      if (e.blk) x.appendChild(h('div', 'blkchip', '🛡' + e.blk));
      x.appendChild(h('div', 'nm', d.name));
      x.appendChild(h('div', 'bar', null, [h('i'), h('b', '', e.hp + '/' + e.mhp)])); x.querySelector('.bar i').style.width = (100 * e.hp / e.mhp) + '%';
      x.appendChild(stChips(e));
      if (!e.dead) on(x, function () { onEnemy(i); });
      en.appendChild(x);
    });
    st.appendChild(en);
    var mid = h('div', 'mid');
    g.hs.forEach(function (hh, i) {
      var H = D.H[hh.k], p = h('div', 'heropan' + (b.cur === i && b.ph === 'p' ? ' act' : '') + (hh.dead ? ' dead' : ''));
      p.setAttribute('data-w', 'h' + i);
      p.appendChild(A('hero-' + hh.k, H.name, { ph: TONE[hh.k] }));
      var inf = h('div', 'inf'); var nmr = h('div', 'nm', H.name.split(' ')[0] + (hh.blk ? '  🛡 ' + hh.blk : '') + (hh.stance !== 'n' ? '  ' + (hh.stance === 'w' ? 'Wrath' : 'Calm') : '')); if (hh.stance !== 'n') nmr.appendChild(A('stance-' + hh.stance, '', { noph: 1, cls: 'stanceart' })); inf.appendChild(nmr);
      inf.appendChild(h('div', 'bar', null, [h('i'), h('b', '', hh.hp + '/' + hh.mhp)])); inf.querySelector('.bar i').style.width = (100 * hh.hp / hh.mhp) + '%';
      inf.appendChild(stChips(hh));
      if (hh.k === 'a') { var ob = h('div', 'orbs'); hh.orbs.forEach(function (o) { var ox = h('div', 'orb ' + o.k, o.k === 'D' ? String(o.v) : ''); ox.appendChild(A('orb-' + o.k, '', { noph: 1, cls: 'orbart' })); ob.appendChild(ox); }); inf.appendChild(ob); }
      var pw = Object.keys(hh.pw); if (pw.length) inf.appendChild(h('div', 'stc', null, pw.map(function (k) { return h('span', '', k + ' ' + hh.pw[k]); })));
      p.appendChild(inf); mid.appendChild(p);
    });
    var en0 = h('div', 'energy', null, [A('icon-energy', '', { noph: 1 }), h('span', '', String(b.ph === 'p' ? cur.en : 0))]); en0.setAttribute('aria-label', 'Energy'); mid.appendChild(en0);
    st.appendChild(mid);
    // controls row (piles left, end turn right), then the hand
    var anyOk0 = (b.ph === 'p' ? cur.hand : []).some(function (c) { return E.canPlay(cur, c) && (E.cost(cur, c) <= cur.en || E.eff(c).cost === 'X'); });
    var ctl = h('div', 'ctl');
    if (b.ph === 'p') {
      ctl.appendChild(h('div', 'piles', null, [on(h('button', 'chip', '↓ ' + cur.draw.length, [A('card-back', '', { noph: 1, cls: 'cbk' })]), function () { UI.ov = 'draw'; render(); }), on(h('button', 'chip', '↺ ' + cur.disc.length), function () { UI.ov = 'disc'; render(); })]));
      var eb = on(h('button', 'btn' + (anyOk0 ? '' : ' pulse'), 'End turn'), endTurn); eb.id = 'end'; ctl.appendChild(eb);
    } else ctl.appendChild(h('span', 'chip', 'Enemies act...'));
    st.appendChild(ctl);
    var hand = h('div', 'hand'), hc = b.ph === 'p' ? cur.hand : []; var nn = hc.length;
    if (nn > 6) hand.style.setProperty('--cw', 'min(clamp(58px,min(17vw,15.5vh),124px),' + Math.floor(92 / nn * 1.15 * 3.6) / 3.6 + 'vw)');
    hc.forEach(function (c, i) {
      var ok = E.canPlay(cur, c) && (E.cost(cur, c) <= cur.en || E.eff(c).cost === 'X'), el = cardEl(c); el.classList.add(ok ? 'ok' : 'no'); if (UI.sel === i) el.classList.add('sel');
      el.setAttribute('data-c', i); on(el, function () { onCard(i); }); hand.appendChild(el);
    });
    st.appendChild(hand);
    app.appendChild(st);
  }
  function beginBattleUI() { UI.sel = -1; render(); }
  function flyCard(ci, ti, done) {
    var cel = document.querySelector('.hand [data-c="' + ci + '"]'), tel = ti != null ? document.querySelector('[data-w="e' + ti + '"]') : document.querySelector('.mid');
    if (!window.ANIM || !cel || !tel || !cel.animate) return done();
    var a = cel.getBoundingClientRect(), b = tel.getBoundingClientRect(), f = cel.cloneNode(true); f.classList.remove('sel'); f.classList.add('fly');
    f.style.left = a.left + 'px'; f.style.top = a.top + 'px'; f.style.margin = '0'; document.body.appendChild(f);
    var an = f.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: 'translate(' + (b.left + b.width / 2 - a.left - a.width / 2) + 'px,' + (b.top + b.height / 2 - a.top - a.height / 2) + 'px) scale(.5) rotate(18deg)', opacity: .15 }], { duration: 260, easing: 'ease-in' });
    an.onfinish = function () { f.remove(); done(); }; setTimeout(function () { if (f.parentNode) { f.remove(); } }, 600);
  }
  function onCard(i) {
    var g = G(); if (g.b.ph !== 'p' || UI.busy) return; var cur = g.hs[g.b.cur], c = cur.hand[i];
    if (!(E.canPlay(cur, c) && (E.eff(c).cost === 'X' || E.cost(cur, c) <= cur.en))) { UI.sel = i; render(); toast(E.eff(c).fl.indexOf('u') >= 0 ? 'Cannot play' : 'Not enough energy'); UI.sel = -1; return; }
    if (UI.sel !== i) { UI.sel = i; render(); return; }
    var al = g.b.en.map(function (e, k) { return e.dead ? -1 : k; }).filter(function (k) { return k >= 0; });
    if (E.eff(c).tgt && al.length > 1) { toast('Tap an enemy'); return; }
    playIt(i, E.eff(c).tgt ? al[0] : undefined);
  }
  function onEnemy(i) { var g = G(); if (g.b.ph === 'p' && UI.sel >= 0 && needTarget()) playIt(UI.sel, i); }
  function playIt(ci, ti) {
    var g = G(), mv = { t: 'play', h: g.b.cur, c: ci }; if (ti != null) mv.e = ti;
    UI.busy = true; flyCard(ci, ti, function () {
      UI.busy = false; UI.sel = -1; E.performMove(mv); render(); afterMove();
    });
  }
  function afterMove() { var g = G(); if (g.scr !== 'battle') { render(); } }
  function usePot(i) {
    var g = G(); if (g.scr !== 'battle' || g.b.ph !== 'p') { toast('Use in a fight'); return; }
    var id = g.pots[i];
    if (D.POTIONS[id].tgt) { var al = g.b.en.map(function (e, k) { return e.dead ? -1 : k; }).filter(function (k) { return k >= 0; }); E.performMove({ t: 'pot', p: i, e: al[0] }); }
    else E.performMove({ t: 'pot', p: i });
    render();
  }
  function endTurn() {
    var g = G(); if (g.scr !== 'battle' || g.b.ph !== 'p' || UI.busy) return; UI.sel = -1;
    E.performMove({ t: 'end' }); render();
    if (G().scr === 'battle' && G().b.ph === 'e') enemyPhase(); else render();
  }
  function enemyPhase() {
    if (!window.ANIM) { E.settle(); render(); return; }
    UI.busy = true;
    (function loop() {
      var g = G(); if (!g || g.scr !== 'battle' || !g.b || g.b.ph !== 'e') { UI.busy = false; render(); return; }
      var more = E.step(); render();
      if (!more && G().scr === 'battle' && G().b.ph === 'e') { }
      setTimeout(loop, window.AIDELAY);
    })();
  }
  // ---------- other screens
  function reward() {
    var g = G(), r = g.rw, s = h('div', 'reward');
    s.appendChild(A('bg-reward', '', { cls: 'bg', kind: 'bg' }));
    s.appendChild(h('h2', '', r.treasure ? 'Treasure!' : 'Victory!'));
    s.appendChild(h('div', 'chip', '● +' + r.gold + ' gold'));
    if (r.pot && !r.took.pot) { var pb = on(h('button', 'item', null, [A('pot-' + r.pot, D.POTIONS[r.pot].name, { ph: '#5a8a5a' }), h('span', '', D.POTIONS[r.pot].name)]), function () { E.performMove({ t: 'takepot' }); render(); }); pb.style.width = '140px'; s.appendChild(pb); }
    if (r.relics && !r.took.relic) { var rl = h('div', 'picks'); r.relics.forEach(function (id, i) { if (!id) return; var b = on(h('button', 'item', null, [A('relic-' + id, D.RELICS[id].name, { ph: '#8a6a2a' }), h('b', '', D.RELICS[id].name), h('span', '', D.RELICS[id].t)]), function () { E.performMove({ t: 'relic', i: i }); render(); }); b.style.width = '130px'; rl.appendChild(b); }); s.appendChild(rl); }
    Object.keys(r.cards).forEach(function (hi) {
      if (r.took['c' + hi]) return; if (g.hs.length > 1) s.appendChild(h('div', 'chip', D.H[g.hs[hi].k].name + ': pick a card'));
      else s.appendChild(h('div', 'sub', 'Add one card to your deck'));
      var pk = h('div', 'picks'); r.cards[hi].forEach(function (id, i) { var c = cardEl({ id: id, u: 0 }); c.setAttribute('data-pick', i); on(c, function () { E.performMove({ t: 'pick', h: +hi, i: i }); render(); }); pk.appendChild(c); }); s.appendChild(pk);
      s.appendChild(on(h('button', 'btn alt', 'Skip'), function () { E.performMove({ t: 'skip', h: +hi }); render(); }));
    });
    var lv = on(h('button', 'btn', 'Continue'), function () { E.performMove({ t: 'leave' }); render(); }); lv.id = 'leave'; s.appendChild(lv);
    app.appendChild(topbar()); app.appendChild(s);
  }
  function deckPicker(title, hi, filter, cb) {
    var g = G(), ov = h('div', 'ov'); ov.appendChild(h('h2', '', title, [on(h('button', 'x', '✕'), function () { UI.ov = null; render(); })]));
    var gr = h('div', 'grid'); g.hs[hi].deck.forEach(function (c, i) { if (!filter(c)) return; var el = cardEl(c); on(el, function () { cb(i); }); gr.appendChild(el); });
    ov.appendChild(gr); return ov;
  }
  function rest() {
    var g = G(), s = h('div', 'reward'); s.appendChild(A('bg-rest', '', { cls: 'bg', kind: 'bg' }));
    var hi = g.rest.todo[0], hh = g.hs[hi], H = D.H[hh.k];
    s.appendChild(h('h2', '', 'Campfire'));
    if (g.hs.length > 1) s.appendChild(h('div', 'chip', H.name));
    var amt = Math.floor(hh.mhp * 0.3) + (E.has('healing-moss') ? 10 : 0);
    var b1 = on(h('button', 'btn', 'Rest: heal ' + amt), function () { E.performMove({ t: 'heal', h: hi }); UI.ov = null; render(); }); b1.id = 'rest-heal';
    var b2 = on(h('button', 'btn alt', 'Smith: upgrade a card'), function () { UI.ov = 'smith'; render(); }); b2.id = 'rest-smith';
    s.appendChild(b1); s.appendChild(b2); app.appendChild(topbar()); app.appendChild(s);
  }
  function shop() {
    var g = G(), s = h('div', 'reward'); s.appendChild(A('bg-shop', '', { cls: 'bg', kind: 'bg' }));
    s.appendChild(h('h2', '', 'Wayside Market'));
    var it = h('div', 'items');
    g.shop.items.forEach(function (x, i) {
      var nm = x.t === 'card' ? D.CARDS[x.id].name : x.t === 'relic' ? D.RELICS[x.id].name : D.POTIONS[x.id].name;
      var art = x.t === 'card' ? A(x.id, nm, { ph: TONE[D.CARDS[x.id].hero] }) : x.t === 'relic' ? A('relic-' + x.id, nm, { ph: '#8a6a2a' }) : A('pot-' + x.id, nm, { ph: '#5a8a5a' });
      var b = h('button', 'item' + (x.sold ? ' sold' : '') + (g.gold < x.p ? ' poor' : ''), null, [art, h('span', '', nm), h('span', 'price', '● ' + x.p)]);
      on(b, function () { if (!E.performMove({ t: 'buy', i: i })) toast(g.gold < x.p ? 'Not enough gold' : 'No room'); render(); }); it.appendChild(b);
    });
    var rm = on(h('button', 'item' + (g.shop.removed ? ' sold' : ''), null, [A('icon-remove', '✂', { ph: '#7a3a3a' }), h('span', '', 'Remove a card'), h('span', 'price', '● ' + g.shop.rm)]), function () { if (g.gold < g.shop.rm) { toast('Not enough gold'); return; } UI.ov = 'remove'; render(); });
    it.appendChild(rm); s.appendChild(it); s.appendChild(on(h('button', 'btn', 'Leave'), function () { E.performMove({ t: 'leave' }); render(); }));
    app.appendChild(topbar()); app.appendChild(s);
  }
  function event() {
    var g = G(), ev = D.EVENTS[g.evn.id], s = h('div', 'reward'); s.appendChild(A('bg-event', '', { cls: 'bg', kind: 'bg' }));
    s.appendChild(h('h2', '', ev.name)); s.appendChild(A('event-' + g.evn.id, ev.name, { cls: 'evart', ph: '#4a3a5a', kind: 'card' }));
    if (g.evn.res) { s.appendChild(h('div', 'sub', g.evn.res)); s.appendChild(on(h('button', 'btn', 'Continue'), function () { E.performMove({ t: 'leave' }); render(); })); }
    else {
      s.appendChild(h('div', 'sub', ev.q)); var o = h('div', 'opts');
      ev.o.forEach(function (x, i) { var b = on(h('button', 'btn alt', x.t), function () { E.performMove({ t: 'opt', i: i }); if (G().evn.pend) UI.ov = 'evpick'; render(); }); if (x.cost && g.gold < x.cost) b.disabled = true; o.appendChild(b); }); s.appendChild(o);
    }
    app.appendChild(topbar()); app.appendChild(s);
  }
  function over() {
    var g = G(), s = h('div', 'over'); s.appendChild(A(g.won ? 'bg-victory' : 'bg-defeat', '', { cls: 'bg panelbg', kind: 'bg' }));
    s.appendChild(h('h1', '', g.won ? 'SUMMIT!' : 'FALLEN'));
    s.appendChild(h('div', 'sub', g.won ? 'The tower boss is down.' : 'You reached floor ' + g.floor + '.'));
    s.appendChild(h('div', 'chip', 'Deck ' + g.hs.reduce(function (a, x) { return a + x.deck.length; }, 0) + '  Relics ' + g.relics.length + '  Gold ' + g.gold));
    var b = on(h('button', 'btn', 'New climb'), function () { E.clear(); UI.mode = 'title'; render(); }); b.id = 'again'; s.appendChild(b); app.appendChild(s);
  }
  function overlay() {
    var g = G(), ov = null;
    function close() { UI.ov = null; render(); }
    if (UI.ov === 'rules') {
      ov = h('div', 'ov'); ov.appendChild(h('h2', '', 'How to climb', [on(h('button', 'x', '✕'), close)]));
      var r = h('div', 'rules');
      ['Walk up the map. Glowing rooms are your next step.', 'Fights: you draw 5 cards and have 3 energy each turn.', 'Tap a card once to lift it, again to play it. Pick a target if asked.', 'Enemies show what they will do next. Block cancels attacks.', 'Vulnerable: takes 50% more. Weak: deals 25% less. Poison: lose HP each turn.', 'Dice cards roll a d6: 1-2 low, 3-4 middle, 5-6 high result.', 'After a fight pick 1 of 3 new cards, or skip to keep your deck lean.', 'Campfires heal or upgrade a card. Shops sell cards, relics and potions.', 'Beat the boss at the top to win. Two heroes share the map and take turns.'].forEach(function (t) { r.appendChild(h('p', '', t)); });
      ov.appendChild(r);
    } else if (UI.ov === 'relics') {
      ov = h('div', 'ov'); ov.appendChild(h('h2', '', 'Relics', [on(h('button', 'x', '✕'), close)]));
      var gr = h('div', 'items'); g.relics.forEach(function (id) { gr.appendChild(h('div', 'item', null, [A('relic-' + id, D.RELICS[id].name, { ph: '#8a6a2a' }), h('b', '', D.RELICS[id].name), h('span', '', D.RELICS[id].t)])); }); ov.appendChild(gr);
    } else if (UI.ov === 'deck' || UI.ov === 'draw' || UI.ov === 'disc') {
      ov = h('div', 'ov'); ov.appendChild(h('h2', '', UI.ov === 'deck' ? 'Your deck' : UI.ov === 'draw' ? 'Draw pile' : 'Discard pile', [on(h('button', 'x', '✕'), close)]));
      var gg = h('div', 'grid'), cards = []; if (UI.ov === 'deck') g.hs.forEach(function (x) { cards = cards.concat(x.deck); }); else { var cu = g.hs[g.b.cur]; cards = UI.ov === 'draw' ? cu.draw.slice().sort(function (a, b) { return a.id < b.id ? -1 : 1; }) : cu.disc; }
      cards.forEach(function (c) { gg.appendChild(cardEl(c)); }); ov.appendChild(gg);
    } else if (UI.ov === 'smith') { var hi = g.rest.todo[0]; ov = deckPicker('Upgrade which card?', hi, function (c) { return !c.u && D.CARDS[c.id].ops.length && D.CARDS[c.id].hero !== 'z'; }, function (i) { E.performMove({ t: 'upg', h: hi, c: i }); UI.ov = null; render(); }); }
    else if (UI.ov === 'remove') { ov = h('div', 'ov'); ov.appendChild(h('h2', '', 'Remove which card?', [on(h('button', 'x', '✕'), close)])); var gr2 = h('div', 'grid'); g.hs.forEach(function (x, hi) { x.deck.forEach(function (c, i) { var el = cardEl(c); on(el, function () { E.performMove({ t: 'remove', h: hi, c: i }); UI.ov = null; render(); }); gr2.appendChild(el); }); }); ov.appendChild(gr2); }
    else if (UI.ov === 'evpick') { ov = deckPicker(g.evn.pend === 'rem' ? 'Remove which card?' : 'Upgrade which card?', 0, function (c) { return g.evn.pend === 'rem' || (!c.u && D.CARDS[c.id].ops.length); }, function (i) { E.performMove({ t: 'evpick', c: i }); UI.ov = null; render(); }); }
    if (ov) { ov.addEventListener('click', function (e) { if (e.target === ov) close(); }); app.appendChild(ov); }
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && UI.ov) { UI.ov = null; render(); } });
  // test + automation hooks
  window.render_game_to_text = function () { var g = G(); if (!g) return JSON.stringify({ mode: UI.mode }); return JSON.stringify({ scr: g.scr, floor: g.floor, gold: g.gold, hs: g.hs.map(function (x) { return { k: x.k, hp: x.hp, en: x.en, hand: x.hand ? x.hand.map(function (c) { return c.id; }) : [] }; }), enemies: g.b ? g.b.en.map(function (e) { return { id: e.id, hp: e.hp, intent: e.intent }; }) : null }); };
  window.EC_FORCE_END = function () { var g = G(); if (!g) return; if (g.b) { g.b.en.forEach(function (e) { e.hp = 0; e.dead = 1; }); } };
  window.EC_WIN_FIGHT = function () { var g = G(); g.b.en.forEach(function (e) { e.hp = 1; }); };
  window.EC_FORCE_RESULT = function (won) { var g = G(); g.scr = 'over'; g.won = won ? 1 : 0; g.b = null; render(); };
  UI.mode = 'title'; render();
})();
