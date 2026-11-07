// Emberclimb UI: DOM, board-first. Every picture is a NAMED SLOT (A(stem)) filled by media/<stem>.webp when present, else a placeholder.
(function () {
  var D = EC.D, E = EC.E, app = document.getElementById('app'), tscr = document.getElementById('tscr'), gameEl = document.getElementById('game');
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
    else if (PROBE[stem] === undefined && (window.MEDIA_PRESENT || []).indexOf(stem) >= 0) {
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
  function toast(t, ms) { var d = h('div', 'toast', t); if (ms) d.style.animationDuration = ms + 'ms'; document.body.appendChild(d); setTimeout(function () { d.remove(); }, ms || 1400); }
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
        case 'dmg': fxAt(f.w, f.x === 'poison' ? 'fx-poison-cloud' : 'fx-slash'); if (f.x === 'str') fxAt(f.w, 'fx-fire-burst'); SFX(f.x === 'blocked' ? 'block' : 'hit'); popAt(f.w, f.x === 'blocked' ? 'Blocked' : String(f.n), 'dmg'); if (el && window.ANIM) { el.classList.add('shake'); setTimeout(function () { el.classList.remove('shake'); }, 360); } break;
        case 'hitme': if (f.x === 'burn' || f.x === 'str') fxAt(f.w, 'fx-fire-burst'); SFX(f.x === 'blocked' ? 'block' : 'hurt'); popAt(f.w, f.x === 'blocked' ? 'Blocked' : '-' + f.n, 'dmg'); if (el && window.ANIM) { el.classList.add('shake'); setTimeout(function () { el.classList.remove('shake'); }, 360); } break;
        case 'hp': break;
        case 'blk': SFX('block'); fxAt(f.w, 'fx-block-burst'); popAt(f.w, '+' + f.n + ' Blk', 'blk'); break;
        case 'heal': SFX('heal'); fxAt(f.w, 'fx-heal-sparkle'); popAt(f.w, '+' + f.n, 'heal'); break;
        case 'buff': if (f.x === 'str') fxAt(f.w, 'fx-fire-burst'); SFX('buff'); popAt(f.w, f.x === 'str' ? '+' + f.n + ' Str' : f.x === 'nrg' ? '+' + f.n + ' Energy' : 'Power!', 'buf'); break;
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
  // the one number that matters on a card (shown big on the picture): damage, block or poison
  function keyNum(e) {
    var o = e.ops || [], i, k;
    for (i = 0; i < o.length; i++) { k = o[i][0];
      if (k === 'dmg' || k === 'all' || k === 'dmgx') return ['a', '⚔' + o[i][1]];
      if (k === 'hit') return ['a', '⚔' + o[i][1] + '×' + o[i][2]];
      if (k === 'blk') return ['b', '🛡' + o[i][1]];
      if (k === 'poison' || k === 'poisonAll') return ['p', '☠' + o[i][1]];
      if (k === 'shiv') return ['a', '🗡×' + o[i][1]]; }
    return null;
  }
  // tap-hold on a hand card (about 0.45 s) shows the whole card big; the click that follows is swallowed
  function holdPeek(el, c) {
    var t = 0, x0 = 0, y0 = 0;
    function stop() { if (t) { clearTimeout(t); t = 0; } }
    el.addEventListener('pointerdown', function (ev) { x0 = ev.clientX; y0 = ev.clientY; stop(); t = setTimeout(function () { t = 0; UI.peeked = Date.now(); var pk = h('div', 'peek'); pk.appendChild(cardEl(c)); var close = function (e2) { if (e2) { e2.stopPropagation(); } pk.remove(); }; pk.addEventListener('pointerdown', close); document.body.appendChild(pk); }, 450); });
    el.addEventListener('pointermove', function (ev) { if (Math.abs(ev.clientX - x0) + Math.abs(ev.clientY - y0) > 12) stop(); });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) { el.addEventListener(n, stop); });
    el.addEventListener('contextmenu', function (ev) { ev.preventDefault(); });
  }
  function cardEl(c, o) {
    o = o || {}; var e = E.eff(c), d = D.CARDS[c.id];
    var el = h('div', 'card t-' + e.type + (d.rar === 'r' ? ' rare' : d.rar === 'u' ? ' unc' : ''));
    var art = h('div', 'cart'); art.appendChild(A(c.id, '', { ph: TONE[d.hero] })); art.appendChild(A('frame-' + ({ A: 'attack', S: 'skill', P: 'power', X: 'status' })[e.type], '', { cls: 'cfr', noph: 1 }));
    var ct = h('div', 'ct', e.name);
    el.appendChild(ct); el.appendChild(art);
    if (e.cost !== -1 && e.fl.indexOf('u') < 0) el.appendChild(h('div', 'cx', e.cost === 'X' ? 'X' : String(e.cost)));
    var kk = keyNum(e); if (kk) el.appendChild(h('div', 'ck k-' + kk[0], kk[1]));
    var cb = h('div', 'cb'); E.lines(e).forEach(function (l) { cb.appendChild(h('span', 'cl', l)); }); el.appendChild(cb);
    el.appendChild(A('gem-' + ({ s: 'common', c: 'common', u: 'uncommon', r: 'rare', z: 'common', k: 'common' })[d.rar], '', { cls: 'cfr', noph: 1 }));
    return el;
  }
  // ---------- screens
  function render() {
    var g = G(); app.innerHTML = ''; tscr.innerHTML = '';
    if (UI.mode === 'title' || !g) { gameEl.hidden = true; tscr.hidden = false; try { GX.close(); } catch (e) { } try { GXH.hide(); } catch (e) { } return title(); }
    tscr.hidden = true; gameEl.hidden = false;
    if (g.scr === 'map') mapScr(); else if (g.scr === 'battle') battle(); else if (g.scr === 'reward') reward();
    else if (g.scr === 'rest') rest(); else if (g.scr === 'shop') shop(); else if (g.scr === 'event') event(); else if (g.scr === 'over') over();
    if (UI.ov) overlay();
    dock(g);
    if (UI.lastScr !== g.scr) { if (g.scr === 'reward' || (g.scr === 'over' && g.won)) SFX('win'); else if (g.scr === 'over') SFX('lose'); UI.lastScr = g.scr; }
    if (!window.EC_NOSAVE) E.save(); drain(); try { if (window.GXMUS) GXMUS.sync(); } catch (e) { }
  }
  UI.render = render;
  function tutOk(a) { try { var ok = !(window.GXT && GXT.active()) || GXT.act(a); if (!ok) { toast('Do the glowing step first'); var dm = document.getElementById('dockmsg'); if (dm) dm.textContent = 'Do the glowing step first.'; } return ok; } catch (e) { return true; } }
  function muteBtn() { var b = on(h('button', 'chip tap', SND.on ? '🔊' : '🔇'), function () { SND.toggle(); toast(SND.on ? 'Sound on' : 'Sound off'); render(); }); b.setAttribute('aria-label', SND.on ? 'Sound on: tap to mute' : 'Sound off: tap to unmute'); b.id = 'mute'; return b; }
  function tutBtn(cls) { try { var first = !GXT.status('emberclimb').seen && !localStorage.getItem('emberclimb.save'); var w = h('div'); w.innerHTML = GXT.menuHTML({ game: 'emberclimb', first: first, cls: cls || 'btn alt', launch: function () { UI.ov = null; UI.tutStart(); } }); return w.firstChild; } catch (e) { return null; } }
  function title() {
    if (UI.sub === 'quick') return quick();
    var s = h('div'); s.id = 'title';
    s.appendChild(A('bg-title', '', { cls: 'bg', kind: 'bg' }));
    s.appendChild(h('div', '', null, [h('h1', '', 'EMBERCLIMB'), h('p', 'sub', 'Climb the tower. Build your deck.')]));
    var first = false; try { first = !GXT.status('emberclimb').seen && !localStorage.getItem('emberclimb.save'); } catch (e) { }
    var main = h('div', 'tmain'), row = h('div', 'trow');
    var story = on(h('button', first ? 'btn alt' : 'btn primary', 'Story'), function () { try { GXC.open(); } catch (e) { UI.sub = 'quick'; render(); } }); story.id = 'story';
    if (first) { var tb = tutBtn('btn primary'); if (tb) main.appendChild(tb); row.appendChild(story); } else main.appendChild(story);
    row.appendChild(on(h('button', 'btn alt', 'Quick game'), function () { UI.sub = 'quick'; render(); }));
    row.appendChild(on(h('button', 'btn alt', 'How to play'), function () { GXH.rules(null); }));
    var sv = null; try { sv = localStorage.getItem('emberclimb.save'); } catch (e) { }
    if (sv) row.appendChild(on(h('button', 'btn alt', 'Continue'), function () { if (E.load()) { UI.mode = 'game'; render(); resume(); } }));
    row.appendChild(on(h('button', 'btn alt', 'Settings'), function () { GX.show('setd'); })); row.lastChild.id = 'settingsT';
    row.appendChild(muteBtn());
    main.appendChild(row); s.appendChild(main); tscr.appendChild(s);
  }
  // Story unlocks: Rogue, Automaton and Monk join the Quick game after Story chapters 2, 3 and 4 (campaign.json unlock ids hero-s / hero-a / hero-m); ?unlock=all opens everything
  var HNEED = { s: ['hero-s', 'Beat Story chapter 2 to unlock'], a: ['hero-a', 'Beat Story chapter 3 to unlock'], m: ['hero-m', 'Beat Story chapter 4 to unlock'] };
  function heroOpen(k) {
    if (!HNEED[k] || /unlock=all/.test(Q)) return true;
    try { if (!window.GXC || !GXC.data || !GXC.data()) return true; return GXC.unlocked().some(function (u) { return u.id === HNEED[k][0]; }); } catch (e) { return true; }
  }
  UI.heroOpen = heroOpen;
  // Story relic unlocks: these relics stay out of the random pool (rewards, shop, events) until their chapter is beaten (campaign.json unlock type 'relic'); ?unlock=all opens all
  var RLOCK = ['clover-dice', 'gold-tooth', 'smoking-censer', 'tin-flute', 'healing-moss', 'gale-cloak', 'whetstone-ring', 'phoenix-ash'];
  function lockedRelics() {
    if (/unlock=all/.test(Q)) return [];
    try { if (!window.GXC || !GXC.data || !GXC.data()) return []; var u = GXC.unlocked(); return RLOCK.filter(function (id) { return !u.some(function (x) { return x.type === 'relic' && x.id === id; }); }); } catch (e) { return []; }
  }
  UI.lockedRelics = lockedRelics;
  var ng0 = E.newGame; E.newGame = function (o) { E.lock(lockedRelics()); return ng0.call(E, o); };
  function quick() {
    var s = h('div'); s.id = 'title';
    s.appendChild(A('bg-title', '', { cls: 'bg', kind: 'bg' }));
    var t = h('div', '', null, [h('h1', '', 'EMBERCLIMB'), h('p', 'sub', 'Climb the tower. Build your deck.')]); s.appendChild(t);
    var hs = h('div', 'heroes');
    ['w', 's', 'a', 'm'].forEach(function (k) {
      var H = D.H[k], lk = !heroOpen(k), b = h('button', 'hero' + (UI.pick.indexOf(k) >= 0 ? ' sel' : '') + (lk ? ' locked' : ''), null, [A('hero-' + k, H.name.split(' ')[0], { ph: TONE[k] }), h('b', '', H.name.split(' ')[0]), h('i', '', lk ? '\uD83D\uDD12 Story' : H.role)]);
      b.setAttribute('data-hero', k);
      on(b, function () { if (lk) { toast(HNEED[k][1]); return; } if (!UI.duo) { UI.pick = [k]; } else { var i = UI.pick.indexOf(k); if (i >= 0) { if (UI.pick.length > 1) UI.pick.splice(i, 1); } else { UI.pick.push(k); if (UI.pick.length > 2) UI.pick.shift(); } } render(); });
      hs.appendChild(b);
    });
    var mid = h('div', '', null, [hs, h('div', 'refline', D.H[UI.pick[UI.pick.length - 1]].mech)]); mid.style.cssText = 'display:flex;flex-direction:column;gap:8px;align-items:center;width:100%';
    s.appendChild(mid);
    var row = h('div', 'row'); row.appendChild(on(h('button', 'btn alt', UI.duo ? '− Second hero' : '+ Second hero'), function () { UI.duo = !UI.duo; if (!UI.duo) UI.pick = [UI.pick[UI.pick.length - 1]]; render(); })); row.appendChild(on(h('button', 'btn alt', 'Back'), function () { UI.sub = ''; render(); })); var go = on(h('button', 'btn', UI.pick.length > 1 ? 'Climb together' : 'Climb'), function () { start(); }); go.id = 'play'; row.appendChild(go);
    var wrap = h('div', '', null, [h('div', 'refline', UI.duo ? 'Two heroes, shared map. Pass the screen. Tap to pick both.' : 'Tap a hero to pick them. Use + Second hero to play together.'), row]); wrap.style.cssText = 'display:flex;flex-direction:column;gap:10px;align-items:center';
    s.appendChild(wrap); tscr.appendChild(s);
  }
  UI.restart = function () { var g = G(); if (!g) return; var hs = g.hs.map(function (x) { return x.k; }); E.clear(); E.newGame({ heroes: hs }); UI.ov = null; UI.sel = -1; UI.mode = 'game'; render(); };
  UI.leave = function () { if (UI.camp) { UI.camp = null; window.EC_NOSAVE = 0; UI.mode = 'title'; UI.sub = ''; render(); try { GXC.open(); } catch (e) { } } else { UI.mode = 'title'; UI.sub = ''; render(); } };
  function start() { E.newGame({ heroes: UI.pick.slice() }); UI.sub = ''; UI.mode = 'game'; UI.sel = -1; render(); }
  function resume() { var g = G(); if (g && g.scr === 'battle' && g.b.ph === 'e') enemyPhase(); }
  // hero HP + gold go in the shell bar (chips, not buttons); potions and the End turn button live in the dock
  function hud() {
    var g = G(), t = document.getElementById('hud'); t.innerHTML = '';
    g.hs.forEach(function (x) { t.appendChild(h('span', 'chip', '♥ ' + x.hp + '/' + x.mhp)); });
    t.appendChild(h('span', 'chip', '● ' + g.gold));
  }
  function potRow() {
    var g = G(), p = h('div', 'pots');
    for (var i = 0; i < g.pslots; i++) (function (i) {
      var id = g.pots[i];
      if (!id) { p.appendChild(h('span', 'pot', '')); return; }
      var b = h('button', 'pot full', null, [A('pot-' + id, D.POTIONS[id].name, { ph: '#5a8a5a' })]); b.setAttribute('aria-label', D.POTIONS[id].name); on(b, function () { usePot(i); }); p.appendChild(b);
    })(i);
    return p;
  }
  // dock: what to do now (one line) + End turn + potions
  function dock(g) {
    var m = document.getElementById('dockmsg'), a = document.getElementById('dockact'), t = document.getElementById('dockt'); m.textContent = ''; a.innerHTML = '';
    var txt = '', ttl = 'Your move';
    if (g.scr === 'map') { txt = 'Pick a glowing room.'; ttl = 'Climb'; }
    else if (g.scr === 'battle') {
      var b = g.b; ttl = 'Fight'; if (b.ph !== 'p') txt = 'Enemies act...';
      else if (UI.sel >= 0 && needTarget()) txt = 'Tap an enemy to hit it.'; else if (UI.sel >= 0) txt = 'Tap the lifted card again to play it.'; else txt = 'Tap a card to lift it. Out of energy? End turn.';
      if (b.ph === 'p' && UI.endBtn) a.appendChild(UI.endBtn);
    }
    else if (g.scr === 'reward') { txt = 'Pick a card to add, or skip.'; ttl = 'Reward'; }
    else if (g.scr === 'rest') { txt = 'Rest, or smith a card.'; ttl = 'Campfire'; }
    else if (g.scr === 'shop') { txt = 'Tap an item, then Buy.'; ttl = 'Shop'; }
    else if (g.scr === 'event') { txt = 'Choose one.'; ttl = 'Event'; }
    else if (g.scr === 'over') { txt = g.won ? 'You reached the summit.' : 'This climb is over.'; ttl = 'Result'; }
    m.textContent = txt; t.textContent = ttl;
    if (g.scr !== 'over') a.appendChild(potRow());
    UI.endBtn = null;
  }
  var NODEG = { m: '⚔', e: '💀', r: '🔥', s: '🛒', v: '?', t: '🎁', b: '👑' }, NODEN = { m: 'node-monster', e: 'node-elite', r: 'node-rest', s: 'node-shop', v: 'node-event', t: 'node-treasure', b: 'node-boss' };
  function mapScr() {
    var g = G(); hud();
    var m = h('div'); m.id = 'map'; m.setAttribute('data-board', '1'); m.appendChild(A('bg-map', '', { cls: 'bg', kind: 'bg' }));
    function pos(n) { return { x: (n.c + 0.5) / 4 * 100, y: 100 - (n.f - 0.5) / ((G().F || 9) + 1.5) * 100 }; }
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
    app.appendChild(m);
  }
  // ---------- battle
  // intent icons: one code-drawn picture per intent / debuff kind (named stems in assets.json so art can replace them); tap an intent to read it
  var ICO = {
    atk: '<path d="M4 20 16 8l1.5 1.5L5.5 21.5zM15 5l5-1-1 5-2-1z"/>', blk: '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z"/>',
    str: '<path d="M12 3l7 8h-4.5v10h-5V11H5z"/>', weak: '<path d="M12 21l-7-8h4.5V3h5v10H19z"/>',
    vuln: '<circle cx="12" cy="12" r="7" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M11 2h2v6h-2zM11 16h2v6h-2zM2 11h6v2H2zM16 11h6v2h-6z"/>',
    frail: '<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6z" fill="none" stroke="currentColor" stroke-width="2.2" stroke-dasharray="3 2"/><path d="M12 5l-2 5 3 2-2 6" fill="none" stroke="currentColor" stroke-width="2"/>',
    poison: '<path d="M12 2c4 5 7 8 7 12a7 7 0 0 1-14 0c0-4 3-7 7-12z"/>', burn: '<path d="M12 2c1 4 7 6 7 13a7 7 0 0 1-14 0c0-3 1-5 3-7 0 2 1 3 2 3 0-3 1-6 2-9z"/>',
    slime: '<path d="M4 17c0-6 3-10 8-10s8 4 8 10c0 3-2 4-3 2-1 3-3 3-4 0-1 3-3 3-4 0-1 2-5 2-5-2z"/>',
    daze: '<path d="M12 12c0-2 3-2 3 0s-5 3-5-1c0-5 8-5 8 1 0 7-11 6-11-2" fill="none" stroke="currentColor" stroke-width="2.2"/>',
    sleep: '<path d="M4 6h8L4 14h8v2H3v-2l7-8H4zM14 13h6l-6 6h6v2h-8v-2l5-5h-3z"/>', unk: '<path d="M9 8c0-4 7-4 7 0 0 3-4 3-4 6h-2c0-4 4-4 4-6s-3-2-3 0zM10 17h3v3h-3z"/>'
  };
  function svgIc(k) { var d = document.createElement('span'); d.className = 'ico'; d.innerHTML = '<svg viewBox="0 0 24 24" width="100%" height="100%" fill="currentColor" aria-hidden="true">' + (ICO[k] || ICO.unk) + '</svg>'; return d; }
  UI.svgIc = svgIc;
  // art slot with a code-drawn picture as its placeholder
  function IA(stem, k) { var e = A(stem, '', { ph: 'transparent' }); var ph = e.querySelector('.ph'); if (ph) { ph.textContent = ''; ph.appendChild(svgIc(k)); } return e; }
  var CARDK = { burn: 'burn', slimed: 'slime', dazed: 'daze' };
  function intentParts(e) {
    var it = e.intent, g = G(), P = []; if (!it) return [{ k: 'unk', s: 'intent-unknown', t: '?', say: 'Unknown: this enemy has not shown its next move.' }];
    if (it.sleep) return [{ k: 'sleep', s: 'intent-sleep', t: 'zzz', say: 'Asleep: it does nothing for ' + e.asleep + ' more turn' + (e.asleep === 1 ? '' : 's') + ' unless you hurt it.' }];
    if (it.atk) {
      var h0 = g.hs[it.tg] || g.hs[0], d = it.atk + (e.st.str || 0); if (e.st.weak > 0) d = Math.floor(d * 0.75); if (h0.st.vuln > 0) d = Math.floor(d * 1.5); if (h0.stance === 'w') d *= 2; d = Math.max(0, d);
      var n = it.hits || 1, t = n > 1 ? d + 'x' + n : String(d); if (g.hs.length > 1) t += ' → ' + D.H[h0.k].name.split(' ')[0];
      P.push({ k: 'atk', s: d * n >= 20 ? 'intent-attack-big' : 'intent-attack', t: t, say: 'Attack: hits ' + (n > 1 ? n + ' times for ' + d + ' each' : 'for ' + d) + ' damage (Block soaks it first).' });
    }
    if (it.blk) P.push({ k: 'blk', s: 'intent-defend', t: String(it.blk), say: 'Block: it gains ' + it.blk + ' Block, so your attacks do less.' });
    if (it.str) P.push({ k: 'str', s: 'intent-buff', t: '+' + it.str, say: 'Buff: it gains ' + it.str + ' Strength, so every later attack hits harder.' });
    if (it.weak) P.push({ k: 'weak', s: 'intent-weak', t: String(it.weak), say: 'Weak: your attacks deal 25% less for ' + it.weak + ' turns.' });
    if (it.vuln) P.push({ k: 'vuln', s: 'intent-vuln', t: String(it.vuln), say: 'Vulnerable: you take 50% more attack damage for ' + it.vuln + ' turns.' });
    if (it.frail) P.push({ k: 'frail', s: 'intent-frail', t: String(it.frail), say: 'Frail: your Block is 25% weaker for ' + it.frail + ' turns.' });
    if (it.poison) P.push({ k: 'poison', s: 'intent-poison', t: String(it.poison), say: 'Poison: you lose ' + it.poison + ' HP at the start of each turn, falling by 1 each time.' });
    if (it.add) { var ck = CARDK[it.add[0]] || 'unk', cn = D.CARDS[it.add[0]] ? D.CARDS[it.add[0]].name : 'junk'; P.push({ k: ck, s: ck === 'unk' ? 'intent-debuff' : 'intent-' + ck, t: '+' + it.add[1], say: 'Junk: adds ' + it.add[1] + ' ' + cn + ' to your discard pile. It clogs your deck.' }); }
    if (!P.length) P.push({ k: 'unk', s: 'intent-unknown', t: '?', say: 'Unknown: it is up to something. Watch out.' });
    return P;
  }
  function intentBox(e) {
    var P = intentParts(e), main = P[0].k, cls = main === 'atk' ? 'atk' : main === 'blk' ? 'def' : (main === 'str' || main === 'sleep' || main === 'unk') ? 'buf' : 'deb';
    var b = h('button', 'intent ' + cls); b.type = 'button'; b.setAttribute('aria-label', 'Enemy intent: ' + P.map(function (p) { return p.say; }).join(' '));
    P.forEach(function (p) { b.appendChild(IA(p.s, p.k)); if (p.t) b.appendChild(h('span', '', p.t)); });
    on(b, function () { UI.explain(P); });
    return b;
  }
  UI.explain = function (P) {
    var old = document.querySelector('.itip'); if (old) old.remove();
    var t = h('div', 'itip'); t.setAttribute('role', 'dialog'); t.appendChild(h('b', '', 'Enemy intent'));
    P.forEach(function (p) { var r = h('div', 'irow', null, [IA(p.s, p.k), h('span', '', p.say)]); t.appendChild(r); });
    t.appendChild(h('i', '', 'Tap to close'));
    t.addEventListener('click', function () { t.remove(); }); document.body.appendChild(t); setTimeout(function () { if (t.parentNode) t.remove(); }, 9000);
  };
  function stChips(o) {
    var w = h('div', 'stc'); [['str', 'Str'], ['vuln', 'Vuln'], ['weak', 'Weak'], ['poison', 'Poison'], ['frail', 'Frail']].forEach(function (p) { if (o.st[p[0]]) w.appendChild(h('span', '', null, [A('st-' + p[0], '', { noph: 1 }), document.createTextNode(p[1] + ' ' + o.st[p[0]])])); });
    return w;
  }
  function needTarget() { var g = G(), h0 = g.hs[g.b.cur], c = h0.hand[UI.sel]; return c && E.eff(c).tgt; }
  function battle() {
    var g = G(), b = g.b, cur = g.hs[b.cur >= 0 ? b.cur : 0];
    hud();
    var st = h('div'); st.id = 'stage'; st.setAttribute('data-board', '1'); st.appendChild(A(b.kind === 'b' ? 'bg-boss-' + g.boss : b.kind === 'e' ? 'bg-elite' : 'bg-battle-' + (1 + ((g.floor - 1) % 3)), '', { cls: 'bg', kind: 'bg' }));
    var en = h('div', 'enemies'), tgtMode = b.ph === 'p' && UI.sel >= 0 && needTarget();
    b.en.forEach(function (e, i) {
      var d = D.ENEMIES[e.id];
      var x = h('div', 'en' + (e.dead ? ' dead' : '') + (tgtMode && !e.dead ? ' glow' : ''));
      x.setAttribute('data-w', 'e' + i);
      if (!e.dead) x.appendChild(intentBox(e));
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
      p.appendChild(A('hero-' + hh.k, H.name.split(' ')[0], { ph: TONE[hh.k] }));
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
      ctl.appendChild(h('div', 'piles', null, [on(h('button', 'chip', '↓ ' + cur.draw.length, [A('card-back', '', { noph: 1, cls: 'cbk' })]), function () { UI.ov = 'draw'; render(); }), on(h('button', 'chip', '↺ ' + cur.disc.length), function () { UI.ov = 'disc'; render(); }), h('span', 'chip', 'Turn ' + b.turn)]));
      var eb = on(h('button', 'btn' + (anyOk0 ? '' : ' pulse'), 'End turn'), endTurn); eb.id = 'end'; UI.endBtn = eb; try { if (window.GXT && GXT.active()) eb.disabled = true; } catch (e) { }
    }
    st.appendChild(ctl);
    var hand = h('div', 'hand'), hc = b.ph === 'p' ? cur.hand : []; var nn = hc.length;
    if (nn > 5) { hand.classList.add('dense'); hand.style.setProperty('--cw', 'min(var(--hw),' + Math.floor((document.documentElement.clientWidth - 12) / (1 + .82 * (nn - 1))) + 'px)'); }
    hc.forEach(function (c, i) {
      var ok = E.canPlay(cur, c) && (E.cost(cur, c) <= cur.en || E.eff(c).cost === 'X'), el = cardEl(c); el.classList.add(ok ? 'ok' : 'no'); if (UI.sel === i) el.classList.add('sel');
      el.setAttribute('data-c', i); holdPeek(el, c); on(el, function () { if (UI.peeked && Date.now() - UI.peeked < 700) return; onCard(i); }); hand.appendChild(el);
    });
    st.appendChild(hand);
    app.appendChild(st);
    var sl = hand.querySelector('.card.sel'); if (sl) { var rr = sl.getBoundingClientRect(), vw = document.documentElement.clientWidth; if (rr.left < 4) sl.style.setProperty('--sx', (4 - rr.left) + 'px'); else if (rr.right > vw - 4) sl.style.setProperty('--sx', (vw - 4 - rr.right) + 'px'); }
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
    if (!tutOk({ type: 'tap', w: 'card', id: c.id })) return;
    if (!(E.canPlay(cur, c) && (E.eff(c).cost === 'X' || E.cost(cur, c) <= cur.en))) { UI.sel = i; render(); toast(E.eff(c).fl.indexOf('u') >= 0 ? 'Cannot play' : 'Not enough energy'); UI.sel = -1; return; }
    if (UI.sel !== i) { UI.sel = i; render(); return; }
    var al = g.b.en.map(function (e, k) { return e.dead ? -1 : k; }).filter(function (k) { return k >= 0; });
    if (E.eff(c).tgt && al.length > 1) { toast('Tap an enemy'); return; }
    playIt(i, E.eff(c).tgt ? al[0] : undefined);
  }
  function onEnemy(i) { var g = G(); if (g.b.ph === 'p' && UI.sel >= 0 && needTarget()) playIt(UI.sel, i); }
  function playIt(ci, ti) {
    var g = G(), mv = { t: 'play', h: g.b.cur, c: ci }; if (ti != null) mv.e = ti;
    SFX('play'); UI.busy = true; flyCard(ci, ti, function () {
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
    var g = G(); if (g.scr !== 'battle' || g.b.ph !== 'p' || UI.busy) return; if (!tutOk({ type: 'tap', w: 'end' })) return; UI.sel = -1;
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
      var pk = h('div', 'picks'); r.cards[hi].forEach(function (id, i) { var c = cardEl({ id: id, u: 0 }); c.setAttribute('data-pick', i); on(c, function () { if (!tutOk({ type: 'tap', w: 'pick', i: i })) return; E.performMove({ t: 'pick', h: +hi, i: i }); render(); }); pk.appendChild(c); }); s.appendChild(pk);
      s.appendChild(on(h('button', 'btn alt', 'Skip'), function () { E.performMove({ t: 'skip', h: +hi }); render(); }));
    });
    var lv = on(h('button', 'btn', 'Continue'), function () { E.performMove({ t: 'leave' }); render(); }); lv.id = 'leave'; s.appendChild(lv);
    hud(); app.appendChild(s);
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
    s.appendChild(b1); s.appendChild(b2); hud(); app.appendChild(s);
  }
  function shop() {
    var g = G(), s = h('div', 'reward'); s.appendChild(A('bg-shop', '', { cls: 'bg', kind: 'bg' }));
    s.appendChild(h('h2', '', 'Wayside Market'));
    var it = h('div', 'items');
    g.shop.items.forEach(function (x, i) {
      var nm = x.t === 'card' ? D.CARDS[x.id].name : x.t === 'relic' ? D.RELICS[x.id].name : D.POTIONS[x.id].name;
      var art = x.t === 'card' ? A(x.id, nm, { ph: TONE[D.CARDS[x.id].hero] }) : x.t === 'relic' ? A('relic-' + x.id, nm, { ph: '#8a6a2a' }) : A('pot-' + x.id, nm, { ph: '#5a8a5a' });
      var b = h('button', 'item' + (x.sold ? ' sold' : '') + (g.gold < x.p ? ' poor' : ''), null, [art, h('span', '', nm), h('span', 'price', '● ' + x.p)]);
      if (UI.shopSel === i) b.classList.add('picked');
      on(b, function () { UI.shopSel = i; render(); }); it.appendChild(b);
    });
    var rm = on(h('button', 'item' + (g.shop.removed ? ' sold' : ''), null, [A('icon-remove', '✂', { ph: '#7a3a3a' }), h('span', '', 'Remove a card'), h('span', 'price', '● ' + g.shop.rm)]), function () { if (g.gold < g.shop.rm) { toast('Not enough gold'); return; } UI.ov = 'remove'; render(); });
    it.appendChild(rm); s.appendChild(it);
    var sx = g.shop.items[UI.shopSel];
    if (sx && !sx.sold) {
      var nm2 = sx.t === 'card' ? D.CARDS[sx.id].name : sx.t === 'relic' ? D.RELICS[sx.id].name : D.POTIONS[sx.id].name, dt = h('div', 'shopdet');
      if (sx.t === 'card') { var ce = cardEl({ id: sx.id, u: 0 }); ce.classList.add('big'); dt.appendChild(ce); }
      else dt.appendChild(h('div', 'refline', nm2 + ': ' + (sx.t === 'relic' ? D.RELICS[sx.id].t : D.POTIONS[sx.id].t)));
      var bb = on(h('button', 'btn' + (g.gold < sx.p ? ' alt' : ''), 'Buy ' + nm2 + ' (● ' + sx.p + ')'), function () { if (!E.performMove({ t: 'buy', i: UI.shopSel })) toast(g.gold < sx.p ? 'Not enough gold' : 'No room'); else UI.shopSel = -1; render(); }); bb.id = 'buy';
      dt.appendChild(bb); s.insertBefore(dt, it);
    } else s.insertBefore(h('div', 'sub', 'Tap an item to see what it does.'), it); s.appendChild(on(h('button', 'btn', 'Leave'), function () { UI.shopSel = -1; E.performMove({ t: 'leave' }); render(); }));
    hud(); app.appendChild(s);
  }
  function event() {
    var g = G(), ev = D.EVENTS[g.evn.id], s = h('div', 'reward'); s.appendChild(A('bg-event', '', { cls: 'bg', kind: 'bg' }));
    s.appendChild(h('h2', '', ev.name)); s.appendChild(A('event-' + g.evn.id, ev.name, { cls: 'evart', ph: '#4a3a5a', kind: 'card' }));
    if (g.evn.res) { s.appendChild(h('div', 'sub', g.evn.res)); s.appendChild(on(h('button', 'btn', 'Continue'), function () { E.performMove({ t: 'leave' }); render(); })); }
    else {
      s.appendChild(h('div', 'sub', ev.q)); var o = h('div', 'opts');
      ev.o.forEach(function (x, i) { var b = on(h('button', 'btn alt', x.t), function () { E.performMove({ t: 'opt', i: i }); if (G().evn.pend) UI.ov = 'evpick'; render(); }); if (x.cost && g.gold < x.cost) b.disabled = true; o.appendChild(b); }); s.appendChild(o);
    }
    hud(); app.appendChild(s);
  }
  // ---------- result screens (defeat + victory): cause, floors, deck (tap = large card), relics, Story stars; used for Quick and Story
  function bigCard(c) { var pk = h('div', 'peek'); pk.appendChild(cardEl(c)); pk.addEventListener('pointerdown', function (e) { e.stopPropagation(); pk.remove(); }); pk.addEventListener('click', function () { pk.remove(); }); document.body.appendChild(pk); }
  function resultScr(r, done) {
    var g = G(), s = h('div', 'over res'); s.appendChild(A(g.won ? 'bg-victory' : 'bg-defeat', '', { cls: 'bg panelbg', kind: 'bg' }));
    s.appendChild(h('h1', '', g.won ? 'SUMMIT!' : 'FALLEN'));
    var bossId = g.boss, kid = g.won ? bossId : g.killer, kd = kid && D.ENEMIES[kid];
    var cause = h('div', 'cause');
    if (kd && (!g.won || g.floor >= g.F)) cause.appendChild(A('enemy-' + kid, '', { ph: '#6a3a2a', cls: 'cause-art' }));
    var full = g.floor >= g.F; if (g.won && !full) { kd = null; }
    cause.appendChild(h('div', 'sub', g.won ? (full ? 'Final boss down: ' + (D.ENEMIES[bossId] ? D.ENEMIES[bossId].name : 'the tower boss') + '.' : 'The guided fight is won.') : (kd ? 'Felled by ' + kd.name + (g.killIn === 'b' ? ' (boss)' : g.killIn === 'e' ? ' (elite)' : '') + '.' : 'Your own cards finished you.')));
    s.appendChild(cause);
    var tot = g.hs.reduce(function (a, x) { return a + x.deck.length; }, 0);
    s.appendChild(h('div', 'chip rstat', 'Floors ' + Math.min(g.floor, g.F) + ' / ' + g.F + '   Deck ' + tot + '   Relics ' + g.relics.length + '   Gold ' + g.gold));
    if (r) {
      var sr = h('div', 'rstars'); for (var i = 0; i < 3; i++) sr.appendChild(h('span', i < r.stars ? 'on' : '', '★'));
      s.appendChild(h('div', 'storyline', null, [sr, h('span', '', (r.def.title || 'Story') + (r.won ? ' · best ' + (r.best || r.stars) + ' of ' + (r.def.maxStars || 3) + ' stars' : ' · not cleared yet'))]));
      (r.def.stars || []).forEach(function (st, i) { s.appendChild(h('div', 'rstar' + (i < r.stars ? ' on' : ''), (i < r.stars ? '★ ' : '☆ ') + st.text)); });
      (r.unlocks || []).forEach(function (u) { s.appendChild(h('div', 'runl', 'Unlocked: ' + u.text)); });
    }
    var dk = h('div', 'rsec'); dk.appendChild(h('b', '', 'Final deck (tap a card)'));
    var gr = h('div', 'rgrid'); g.hs.forEach(function (x) { var seen = {}, order = []; x.deck.forEach(function (c) { var k = c.id + (c.u ? '+' : ''); if (!seen[k]) { seen[k] = { c: c, n: 0 }; order.push(k); } seen[k].n++; }); order.forEach(function (k) { var o = seen[k], t = on(h('button', 'rcard t-' + E.eff(o.c).type, null, [h('span', '', E.eff(o.c).name), h('i', '', o.n > 1 ? '×' + o.n : '')]), function () { bigCard(o.c); }); t.setAttribute('aria-label', 'View ' + E.eff(o.c).name); gr.appendChild(t); }); });
    dk.appendChild(gr); s.appendChild(dk);
    var rl = h('div', 'rsec'); rl.appendChild(h('b', '', 'Relics (tap for text)'));
    var rr = h('div', 'rrow'); g.relics.forEach(function (id) { var t = on(h('button', 'rrel', null, [A('relic-' + id, '✦', { ph: '#8a6a2a' })]), function () { toast(D.RELICS[id].name + ': ' + D.RELICS[id].t, 3200); }); t.setAttribute('aria-label', D.RELICS[id].name); rr.appendChild(t); });
    rl.appendChild(rr); s.appendChild(rl);
    var bt = h('div', 'rbtns');
    var again = on(h('button', 'btn', 'Play again'), function () { done('again'); }); again.id = 'again'; bt.appendChild(again);
    if (r) { var mp = on(h('button', 'btn alt', 'Story map'), function () { done('map'); }); mp.id = 'rmap'; bt.appendChild(mp); }
    if (r && r.won) { var nx = on(h('button', 'btn', 'Next chapter'), function () { done('next'); }); nx.id = 'rnext'; bt.insertBefore(nx, bt.firstChild); }
    var tt = on(h('button', 'btn alt', 'Title'), function () { done('title'); }); tt.id = 'rtitle'; bt.appendChild(tt);
    s.appendChild(bt); app.appendChild(s);
  }
  UI.showResult = function (r) {
    return new Promise(function (resolve) {
      var g = G(); if (!g) return resolve('map');
      app.innerHTML = ''; resultScr(r, function (pick) {
        if (pick === 'title') { try { UI.campExit(); } catch (e) { } return; }
        resolve(pick);
      });
    });
  };
  function over() {
    var g = G();
    if (UI.camp) { var s0 = h('div', 'over'); if (!UI.fin) { UI.fin = 1; setTimeout(function () { window.EC_NOSAVE = 0; try { GXC.finish(G()); } catch (e) { } }, 500); } app.appendChild(s0); return; }
    resultScr(null, function (pick) { if (pick === 'again') UI.restart(); else { E.clear(); UI.mode = 'title'; render(); } });
  }
  function overlay() {
    var g = G(), ov = null;
    function close() { UI.ov = null; render(); }
    if (UI.ov === 'relics') {
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
  UI.start = start; UI.fit = function () { };
  UI.mode = 'title'; render();
})();
