// ===== GX campaign: story chapters, bosses and gradual difficulty (opt-in; see CAMPAIGN.md) =====
// A new, self-contained module: it does not change shell.js or gx-kit.js, and works with or without them.
//   GXC.init(opts)        wire a game: {game, data, startChapter, isWon, metrics, starsEarned, portrait, artBase, onExit, scores, seats}
//   opts.headButtons()    optional: extra header buttons (elements) for the chapter map, e.g. "Replay tutorial"
//   GXC.open()            the chapter map (the title's "Story" button)
//   GXC.play(id)          intro scene -> boss card -> opts.startChapter(effective chapter)
//   GXC.finish(G, over)   on game over: store stars, GNS.result({mode:'campaign'}), result screen, outro, back to the map
//   GXC.scene / bossCard / result      the single screens (Promises), used by the flow and by the demo
//   GXC.active() · progress() · unlocked() · reset() · close() · validate(data)
// Progress lives in localStorage['gns-campaign-<game>'] and every access is wrapped in try/catch.
(function (root) {
  'use strict';
  var GXC = {};
  var doc = root && root.document;
  var LS = {
    json: function (k, d) { try { var v = JSON.parse(root.localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } },
    put: function (k, v) { try { root.localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del: function (k) { try { root.localStorage.removeItem(k); } catch (e) { } }
  };
  var LEVELS = ['easy', 'normal', 'hard'];
  var O = null, D = null, P = null, CUR = null, OV = null, BUSY = false;

  // ------------------------------------------------------------------ validation (node-safe)
  var GOALS = ['win', 'score', 'margin', 'before-round', 'survive', 'mission', 'custom'];
  var UNLOCKS = ['portrait', 'cardback', 'title', 'act', 'table', 'chapter'];
  function lineText(l) { return typeof l === 'string' ? l : l && l.text; }
  GXC.validate = function (data) {
    var bad = [], add = function (m) { bad.push(m); };
    if (!data || typeof data !== 'object') return ['no data'];
    ['game', 'title'].forEach(function (k) { if (!data[k]) add('missing ' + k); });
    var cast = data.cast || {}, twists = {}, ids = {};
    (data.twists || []).forEach(function (t) { if (!t.id || !t.how) add('twist without id/how'); twists[t.id] = t; });
    if (!data.acts || data.acts.length !== 3) add('needs 3 acts');
    var ch = data.chapters || [];
    if (ch.length < 9 || ch.length > 10) add('needs 9 or 10 chapters (has ' + ch.length + ')');
    ch.forEach(function (c, i) {
      var at = 'chapter ' + (c.id || i) + ': ';
      if (!c.id) add(at + 'no id'); else if (ids[c.id]) add(at + 'duplicate id'); ids[c.id] = 1;
      if ([1, 2, 3].indexOf(c.act) < 0) add(at + 'act must be 1-3');
      if (i && c.act < ch[i - 1].act) add(at + 'acts out of order');
      if (!c.title) add(at + 'no title');
      var intro = c.intro || [], outro = c.outro || [];
      if (intro.length < 2 || intro.length > 4) add(at + 'intro needs 2-4 lines');
      if (outro.length < 1 || outro.length > 3) add(at + 'outro needs 1-3 lines');
      intro.concat(outro).forEach(function (l) {
        var t = lineText(l); if (!t) add(at + 'empty line'); else if (t.length > 110) add(at + 'line over 110 chars: ' + t.slice(0, 30) + '…');
        if (l && l.who && l.who !== 'opponent' && l.who !== 'narrator' && !cast[l.who]) add(at + 'unknown speaker ' + l.who);
      });
      var op = c.opponent || {};
      ['name', 'personality', 'aiLevel'].forEach(function (k) { if (op[k] == null || op[k] === '') add(at + 'opponent.' + k + ' missing'); });
      if (c.boss && (!op.taunt || !op.praise)) add(at + 'boss needs taunt and praise');
      if (!c.goal || GOALS.indexOf(c.goal.type) < 0 || !c.goal.text) add(at + 'goal needs a known type and text');
      if (!c.stars || c.stars.length !== 3) add(at + 'needs exactly 3 stars');
      else c.stars.forEach(function (s) { if (!s.text || !s.test) add(at + 'star needs text and test'); });
      if (c.twist) { if (!twists[c.twist.id]) add(at + 'twist ' + c.twist.id + ' not in the twists menu'); if (!c.twist.text) add(at + 'twist needs text'); }
      if (c.act === 3 && c.boss && !c.twist) add(at + 'act 3 boss needs a twist');
      if (c.act === 1 && c.hints !== true) add(at + 'act 1 needs hints:true');
      if (!c.easier) add(at + 'no easier block');
      (c.unlock || []).forEach(function (u) { if (UNLOCKS.indexOf(u.type) < 0) add(at + 'unknown unlock type ' + u.type); if (!u.text) add(at + 'unlock needs text'); });
      if (!c.setup || typeof c.setup !== 'object') add(at + 'setup must be an object');
    });
    [1, 2, 3].forEach(function (a) {
      var inAct = ch.filter(function (c) { return c.act === a; });
      if (!inAct.length) return add('act ' + a + ' has no chapters');
      if (!inAct[inAct.length - 1].boss) add('act ' + a + ' must end with a boss');
      if (inAct[0].boss) add('act ' + a + ' starts with a boss');
    });
    try { JSON.parse(JSON.stringify(data)); } catch (e) { add('not JSON-safe'); }
    return bad;
  };

  // ------------------------------------------------------------------ progress
  function key() { return 'gns-campaign-' + (O && O.game || 'game'); }
  function load() { var p = LS.json(key(), null); if (!p || p.v !== 1) p = { v: 1, ch: {}, unlocked: [], last: null }; p.ch = p.ch || {}; p.unlocked = p.unlocked || []; return p; }
  function save() { LS.put(key(), P); }
  function rec(id) { return P.ch[id] || (P.ch[id] = { beaten: false, stars: 0, best: null, tries: 0, losses: 0, easy: false }); }
  function chapters() { return (D && D.chapters) || []; }
  function byId(id) { var c = chapters(); for (var i = 0; i < c.length; i++) if (c[i].id === id) return c[i]; return null; }
  function isOpen(c) {
    var list = chapters(), i = list.indexOf(c);
    if (c.requires && c.requires.length) return c.requires.every(function (r) { return P.ch[r] && P.ch[r].beaten; });
    return i <= 0 || !!(P.ch[list[i - 1].id] && P.ch[list[i - 1].id].beaten);
  }
  GXC.progress = function () { return JSON.parse(JSON.stringify(P || load())); };
  GXC.unlocked = function () {
    var out = [];
    chapters().forEach(function (c) { if (P.ch[c.id] && P.ch[c.id].beaten) (c.unlock || []).forEach(function (u) { out.push({ type: u.type, id: u.id, text: u.text, from: c.id }); }); });
    return out;
  };
  GXC.reset = function () { LS.del(key()); P = load(); if (OV) GXC.open(); };
  GXC.active = function () { return CUR; };

  // effective chapter: the "make it a bit easier" offer drops one AI level and the twist, at most 2 stars
  function resolve(c, easy) {
    var d = JSON.parse(JSON.stringify(c));
    d.easy = !!easy; d.maxStars = 3;
    if (easy) {
      var e = c.easier || {}, lv = LEVELS.indexOf(c.opponent.aiLevel);
      d.opponent.aiLevel = e.aiLevel || (lv > 0 ? LEVELS[lv - 1] : c.opponent.aiLevel);
      d.twist = 'twist' in e ? e.twist : null;
      if (e.setup) for (var k in e.setup) d.setup[k] = e.setup[k];
      if (e.hints != null) d.hints = e.hints; else d.hints = true;
      d.maxStars = e.maxStars || 2;
    }
    return d;
  }
  GXC.resolve = resolve;

  // ------------------------------------------------------------------ small DOM helpers
  function el(tag, cls, txt) { var e = doc.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function btn(cls, txt, on) { var b = el('button', cls, txt); b.type = 'button'; if (on) b.addEventListener('click', on); return b; }
  function overlay() {
    if (!OV) {
      OV = el('div', 'gxc'); OV.setAttribute('role', 'dialog'); OV.setAttribute('aria-modal', 'true');
      doc.body.appendChild(OV);
      doc.addEventListener('keydown', function (e) { if (OV && OV.parentNode && e.key === 'Escape') { var x = OV.querySelector('[data-gxc-esc]'); if (x) x.click(); } });
    }
    OV.hidden = false;
    return OV;
  }
  function screen(cls) { var o = overlay(); o.innerHTML = ''; o.className = 'gxc ' + (cls || ''); var s = el('div', 'gxc-screen'); o.appendChild(s); return s; }
  GXC.close = function () { if (OV) { OV.hidden = true; OV.innerHTML = ''; } };
  function castOf(who, def) {
    if (who === 'opponent' && def) return { name: def.opponent.name, portrait: def.opponent.portrait, emoji: def.opponent.emoji, color: def.opponent.color };
    if (who && D && D.cast && D.cast[who]) return D.cast[who];
    if (def && def.opponent && def.opponent.cast === who) return { name: def.opponent.name, portrait: def.opponent.portrait, emoji: def.opponent.emoji };
    return { name: who === 'narrator' || !who ? '' : who, emoji: '📜' };
  }
  // portrait: the game's own hook first, then <img> from artBase (falls back to the emoji), then the emoji badge
  function portrait(who, size, def) {
    var c = castOf(who, def), box = el('div', 'gxc-pt');
    box.style.setProperty('--gxc-pt', size + 'px');
    if (c.color) box.style.setProperty('--gxc-ptc', c.color);
    var emo = function () { box.innerHTML = ''; box.appendChild(el('span', 'gxc-pt-e', c.emoji || (c.name ? c.name.charAt(0) : '?'))); };
    var got = null;
    try { if (O && O.portrait) got = O.portrait(who, size, c); } catch (e) { got = null; }
    if (got && got.nodeType) { box.appendChild(got); return box; }
    var src = typeof got === 'string' ? got : (O && O.artBase && c.portrait ? O.artBase + c.portrait : null);
    if (src) { var im = el('img'); im.alt = ''; im.src = src; im.onerror = emo; box.appendChild(im); } else emo();
    return box;
  }
  function starRow(n, max, total) {
    var r = el('div', 'gxc-stars'); r.setAttribute('aria-label', n + ' of ' + (total || 3) + ' stars');
    for (var i = 0; i < (total || 3); i++) r.appendChild(el('i', 'gxc-st' + (i < n ? ' on' : '') + (max != null && i >= max ? ' cap' : ''), '★'));
    return r;
  }
  // twist text without its 'Boss rule:' prefix (the label shows it), first letter upper-case
  function ruleText(t) { t = String(t || '').replace(/^(Boss|Special) rule:\s*/i, ''); return t.charAt(0).toUpperCase() + t.slice(1); }
  function easierText(def) { return ((def.easier && def.easier.text) || 'the computer plays one level gentler and any special rule is off').replace(/[.\s]+$/, ''); }
  function toast(t) {
    var o = overlay(), x = el('div', 'gxc-toast', t); o.appendChild(x);
    setTimeout(function () { if (x.parentNode) x.parentNode.removeChild(x); }, 2200);
  }

  // ------------------------------------------------------------------ the chapter map
  GXC.open = function () {
    if (!D) return;
    P = load(); CUR = null;
    var s = screen('gxc-map-on'), list = chapters();
    var head = el('div', 'gxc-head');
    var back = btn('gxc-ib', '‹ Back', function () { GXC.close(); if (O.onExit) O.onExit(); }); back.setAttribute('data-gxc-esc', '');
    head.appendChild(back);
    var tt = el('div', 'gxc-htitle'); tt.appendChild(el('b', null, D.title || 'Story')); head.appendChild(tt);
    var got = 0; list.forEach(function (c) { got += (P.ch[c.id] && P.ch[c.id].stars) || 0; });
    var sc = btn('gxc-ib gxc-score', '★ ' + got + '/' + list.length * 3, function () { rewards(); });
    sc.setAttribute('aria-label', got + ' stars of ' + list.length * 3 + '. Show rewards'); head.appendChild(sc);
    if (O.headButtons) { try { O.headButtons().forEach(function (b) { head.insertBefore(b, sc); }); } catch (e) {} }
    s.appendChild(head);
    var map = el('div', 'gxc-map'), path = el('div', 'gxc-path');
    map.appendChild(path); s.appendChild(map);
    // nodes zigzag down a winding road; each act gets a banner and its own tint
    var X = [50, 78, 50, 22], rows = [], y = 0, ROW = 74, BAN = 46, nextOpen = null;
    list.forEach(function (c, i) {
      if (!i || c.act !== list[i - 1].act) {
        var a = (D.acts || []).filter(function (x) { return x.act === c.act; })[0] || { title: 'Act ' + c.act };
        rows.push({ banner: a, y: y }); y += BAN;
      }
      rows.push({ c: c, y: y, x: X[i % 4] }); y += ROW;
      if (!nextOpen && isOpen(c) && !(P.ch[c.id] && P.ch[c.id].beaten)) nextOpen = c;
    });
    var H = y + 20; path.style.height = H + 'px';
    var pts = rows.filter(function (r) { return r.c; });
    // the painted road: an SVG in percent units for x, px for y (viewBox stretched horizontally only)
    var svgNS = 'http://www.w3.org/2000/svg', svg = doc.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'gxc-road'); svg.setAttribute('viewBox', '0 0 100 ' + H); svg.setAttribute('preserveAspectRatio', 'none');
    svg.style.height = H + 'px';
    var d = '';
    pts.forEach(function (p, i) {
      var cy = p.y + 30;
      if (!i) d = 'M' + p.x + ' ' + cy; else { var q = pts[i - 1], qy = q.y + 30, my = (qy + cy) / 2; d += ' C' + q.x + ' ' + my + ' ' + p.x + ' ' + my + ' ' + p.x + ' ' + cy; }
    });
    ['gxc-road-edge', 'gxc-road-fill', 'gxc-road-dash'].forEach(function (k) { var pa = doc.createElementNS(svgNS, 'path'); pa.setAttribute('d', d); pa.setAttribute('class', k); pa.setAttribute('vector-effect', 'non-scaling-stroke'); svg.appendChild(pa); });
    path.appendChild(svg);
    rows.forEach(function (r) {
      if (r.banner) {
        var b = el('div', 'gxc-act'); b.style.top = r.y + 'px';
        b.appendChild(el('b', null, 'Act ' + (r.banner.act || '') + ' · ' + (r.banner.title || '')));
        if (r.banner.blurb) b.appendChild(el('small', null, r.banner.blurb));
        path.appendChild(b); return;
      }
      var c = r.c, st = P.ch[c.id] || {}, open = isOpen(c), beaten = !!st.beaten;
      var n = btn('gxc-node a' + c.act + (c.boss ? ' boss' : '') + (beaten ? ' won' : open ? ' open' : ' locked') + (c === nextOpen ? ' next' : ''), null, function () { sheet(c); });
      n.style.top = r.y + 'px'; n.style.left = r.x + '%';
      n.setAttribute('aria-label', 'Chapter ' + (list.indexOf(c) + 1) + ': ' + c.title + (c.boss ? ' (boss)' : '') + (beaten ? ', beaten, ' + (st.stars || 0) + ' stars' : open ? ', open' : ', locked'));
      var disc = el('span', 'gxc-disc', c.boss ? '' : String(list.indexOf(c) + 1));
      if (c.boss) disc.appendChild(portrait(c.opponent.cast || 'opponent', 40, c));
      if (!open) disc.appendChild(el('i', 'gxc-lock', '🔒'));
      n.appendChild(disc);
      if (beaten) n.appendChild(starRow(st.stars || 0, null, 3));
      var lab = el('span', 'gxc-lab', c.title); n.appendChild(lab);
      if (r.x > 60) n.classList.add('lab-l');
      path.appendChild(n);
    });
    // bring the next open chapter into view
    if (nextOpen) setTimeout(function () { var t = rows.filter(function (r) { return r.c === nextOpen; })[0]; if (t) map.scrollTop = Math.max(0, t.y - map.clientHeight / 2 + 40); }, 0);
  };

  function rewards() {
    var o = overlay(), sh = el('div', 'gxc-sheet'), u = GXC.unlocked();
    var close = function () { if (sh.parentNode) sh.parentNode.removeChild(sh); };
    sh.appendChild(el('h3', null, 'Rewards'));
    if (!u.length) sh.appendChild(el('p', 'gxc-dim', 'Beat chapters to unlock portraits, card backs, titles and new acts.'));
    var ul = el('ul', 'gxc-rw');
    u.forEach(function (x) { var li = el('li'); li.appendChild(el('span', 'gxc-tag', x.type)); li.appendChild(el('span', null, x.text)); ul.appendChild(li); });
    sh.appendChild(ul);
    var b = btn('gxc-btn', 'Close', close); b.setAttribute('data-gxc-esc', ''); sh.appendChild(b);
    o.appendChild(sh); b.focus();
  }

  // the chapter's detail sheet: goal, opponent, stars, Play (and the easier offer after 2 losses)
  function sheet(c) {
    var o = overlay(), old = o.querySelector('.gxc-sheet'); if (old) old.parentNode.removeChild(old);
    if (!isOpen(c)) { var i = chapters().indexOf(c); toast('Beat chapter ' + i + ' first.'); return; }
    var st = rec(c.id), sh = el('div', 'gxc-sheet a' + c.act);
    var close = function () { if (sh.parentNode) sh.parentNode.removeChild(sh); };
    var top = el('div', 'gxc-sh-top');
    top.appendChild(portrait(c.opponent.cast || 'opponent', 64, c));
    var t = el('div', 'gxc-sh-t');
    t.appendChild(el('small', null, 'Act ' + c.act + ' · Chapter ' + (chapters().indexOf(c) + 1) + (c.boss ? ' · Boss' : '')));
    t.appendChild(el('h3', null, c.title));
    t.appendChild(el('div', 'gxc-dim', (c.boss ? 'Boss: ' : 'Opponent: ') + c.opponent.name));
    top.appendChild(t); sh.appendChild(top);
    var g = el('div', 'gxc-goal'); g.appendChild(el('b', null, 'Goal')); g.appendChild(el('span', null, c.goal.text)); sh.appendChild(g);
    if (c.twist) { var tw = el('div', 'gxc-twist'); tw.appendChild(el('b', null, c.boss ? 'Boss rule' : 'Special rule')); tw.appendChild(el('span', null, ruleText(c.twist.text))); sh.appendChild(tw); }
    var sl = el('ul', 'gxc-slist');
    c.stars.forEach(function (s, i) { var li = el('li', i < (st.stars || 0) ? 'on' : ''); li.appendChild(el('i', null, '★')); li.appendChild(el('span', null, s.text)); sl.appendChild(li); });
    sh.appendChild(sl);
    var row = el('div', 'gxc-row');
    var x = btn('gxc-btn ghost', 'Close', close); x.setAttribute('data-gxc-esc', ''); row.appendChild(x);
    if (st.losses >= 2 && !st.beaten) row.appendChild(btn('gxc-btn ghost', 'Make it a bit easier', function () { GXC.play(c.id, { easy: true }); }));
    var go = btn('gxc-btn go', st.beaten ? 'Play again' : 'Play', function () { GXC.play(c.id); }); row.appendChild(go);
    sh.appendChild(row);
    if (st.losses >= 2 && !st.beaten) sh.appendChild(el('p', 'gxc-dim gxc-small', 'Easier: ' + easierText(c) + ' (up to 2 stars).'));
    o.appendChild(sh); go.focus();
  }

  // ------------------------------------------------------------------ story scene (2-4 lines, always skippable)
  GXC.scene = function (lines, opts) {
    opts = opts || {};
    return new Promise(function (done) {
      lines = (lines || []).filter(function (l) { return lineText(l); });
      if (!lines.length || !doc) return done();
      var s = screen('gxc-scene-on'), i = 0, def = opts.def;
      var box = el('div', 'gxc-scene');
      if (opts.title) box.appendChild(el('div', 'gxc-sc-title', opts.title));
      var who = el('div', 'gxc-sc-who'), name = el('div', 'gxc-sc-name'), txt = el('p', 'gxc-sc-text');
      txt.setAttribute('aria-live', 'polite');
      var dots = el('div', 'gxc-dots');
      lines.forEach(function () { dots.appendChild(el('i')); });
      var row = el('div', 'gxc-row');
      var finish = function () { done(); };
      var skip = btn('gxc-btn ghost', 'Skip', finish); skip.setAttribute('data-gxc-esc', '');
      var next = btn('gxc-btn go', 'Next', function () { i++; if (i >= lines.length) finish(); else show(); });
      row.appendChild(skip); row.appendChild(next);
      box.appendChild(who); box.appendChild(name); box.appendChild(txt); box.appendChild(dots); box.appendChild(row);
      s.appendChild(box);
      txt.addEventListener('click', function () { next.click(); });
      function show() {
        var l = lines[i], w = typeof l === 'string' ? (opts.who || 'narrator') : (l.who || 'narrator'), c = castOf(w, def);
        who.innerHTML = ''; who.appendChild(portrait(w, 112, def));
        name.textContent = c.name || '';
        txt.textContent = lineText(l);
        for (var k = 0; k < dots.children.length; k++) dots.children[k].className = k === i ? 'on' : k < i ? 'was' : '';
        next.textContent = i === lines.length - 1 ? (opts.last || 'Continue') : 'Next';
        txt.classList.remove('in'); void txt.offsetWidth; txt.classList.add('in');
        next.focus();
      }
      show();
    });
  };

  // ------------------------------------------------------------------ boss intro card
  GXC.bossCard = function (def) {
    return new Promise(function (done) {
      if (!doc) return done(true);
      var s = screen('gxc-boss-on a' + def.act), op = def.opponent, card = el('div', 'gxc-boss');
      card.appendChild(el('div', 'gxc-boss-tag', def.boss ? 'Boss' : 'Rival'));
      card.appendChild(portrait(op.cast || 'opponent', 148, def));
      card.appendChild(el('h2', null, op.name));
      card.appendChild(el('p', 'gxc-boss-pers', op.personality));
      if (def.twist && def.twist.text) {
        var tw = el('div', 'gxc-twist big');
        tw.appendChild(el('b', null, def.boss ? 'Boss rule' : 'Special rule'));
        tw.appendChild(el('span', null, ruleText(def.twist.text)));
        card.appendChild(tw);
      }
      var g = el('div', 'gxc-goal'); g.appendChild(el('b', null, 'Your goal')); g.appendChild(el('span', null, def.goal.text)); card.appendChild(g);
      var lv = el('div', 'gxc-dim gxc-small', 'Computer: ' + op.aiLevel + (op.aiStyle ? ' · ' + op.aiStyle : '') + (def.easy ? ' · made easier' : ''));
      card.appendChild(lv);
      var row = el('div', 'gxc-row');
      var back = btn('gxc-btn ghost', 'Back', function () { done(false); }); back.setAttribute('data-gxc-esc', '');
      var go = btn('gxc-btn go', 'Fight', function () { done(true); });
      row.appendChild(back); row.appendChild(go); card.appendChild(row);
      s.appendChild(card); go.focus();
    });
  };

  // ------------------------------------------------------------------ play a chapter
  GXC.play = function (id, opt) {
    if (BUSY) return;
    var c = byId(id); if (!c || !isOpen(c)) return;
    BUSY = true;
    var def = resolve(c, opt && opt.easy);
    var st = rec(c.id); st.tries++; P.last = c.id; save();
    GXC.scene(c.intro, { def: def, title: c.title, last: c.boss || def.twist ? 'Meet ' + (c.boss ? 'the boss' : 'your rival') : 'Start' }).then(function () {
      return c.boss || def.twist ? GXC.bossCard(def) : true;
    }).then(function (go) {
      BUSY = false;
      if (!go) { GXC.open(); return; }
      CUR = def; GXC.close();
      try { O.startChapter(def); } catch (e) { CUR = null; GXC.open(); throw e; }
    }, function () { BUSY = false; });
  };

  // ------------------------------------------------------------------ stars and game over
  function testOne(t, m) {
    if (!t || !m) return false;
    var v = m[t.k], op = t.op || (t.v == null ? 'truthy' : '>=');
    switch (op) {
      case '>=': return v >= t.v; case '>': return v > t.v; case '<=': return v <= t.v; case '<': return v < t.v;
      case '==': case '=': return v === t.v; case '!=': return v !== t.v; default: return !!v;
    }
  }
  GXC.testStar = testOne;
  function countStars(G, def, won) {
    if (!won) return 0;
    var n = 0;
    if (O.starsEarned) { try { n = O.starsEarned(G, def) | 0; } catch (e) { n = 1; } }
    else {
      var m = {}; try { m = O.metrics ? O.metrics(G) || {} : {}; } catch (e) { }
      if (m.won == null) m.won = won;
      n = 1; // the first star is the chapter's goal, already met by winning
      for (var i = 1; i < def.stars.length; i++) if (testOne(def.stars[i].test, m)) n++;
    }
    return Math.max(1, Math.min(n, def.maxStars || 3, 3));
  }

  // over: optional {won, stars} to override the game's callbacks (e.g. a resign counts as a loss)
  GXC.finish = function (G, over) {
    var def = CUR; if (!def) return Promise.resolve(null);
    over = over || {};
    var won = over.won != null ? !!over.won : (function () { try { return !!O.isWon(G, def); } catch (e) { return false; } })();
    var stars = over.stars != null ? Math.min(over.stars, def.maxStars || 3) : countStars(G, def, won);
    var st = rec(def.id), first = won && !st.beaten;
    if (won) { st.beaten = true; st.stars = Math.max(st.stars || 0, stars); if (def.easy) st.easy = true; st.losses = 0; }
    else st.losses = (st.losses || 0) + 1;
    var unl = first ? (byId(def.id).unlock || []) : [];
    unl.forEach(function (u) { var k = u.type + ':' + (u.id || u.text); if (P.unlocked.indexOf(k) < 0) P.unlocked.push(k); });
    var list = chapters(), i = list.indexOf(byId(def.id)), nxt = list[i + 1];
    if (first && nxt && nxt.act !== def.act) unl = unl.concat([{ type: 'act', text: 'Act ' + nxt.act + ' opens' }]);
    save();
    if (root.GNS && root.GNS.result) {
      try {
        root.GNS.result({ game: O.game, mode: 'campaign', level: def.opponent.aiLevel, won: won, winner: won ? 0 : 1,
          seats: O.seats ? O.seats(G) : [{ name: 'You', me: true }, { name: def.opponent.name, ai: def.opponent.aiLevel }],
          scores: O.scores ? O.scores(G) : null, turns: over.turns || 0, ms: over.ms || 0,
          extra: { chapter: def.id, stars: won ? stars : 0, easy: !!def.easy, boss: !!def.boss } });
      } catch (e) { }
    }
    CUR = null;
    var res = { won: won, stars: won ? stars : 0, def: def, unlocks: unl, losses: st.losses, best: st.stars, first: first };
    return GXC.result(res).then(function (pick) {
      if (pick === 'retry') { GXC.play(def.id); return res; }
      if (pick === 'easier') { GXC.play(def.id, { easy: true }); return res; }
      if (pick === 'next' && nxt) { GXC.play(nxt.id); return res; }
      return (won ? GXC.scene(def.outro, { def: def, title: def.title, last: 'Back to the map' }) : Promise.resolve()).then(function () { GXC.open(); return res; });
    });
  };

  // result screen: stars, the boss's taunt or praise, unlocks, and the easier offer after 2 losses
  GXC.result = function (r) {
    return new Promise(function (done) {
      if (!doc) return done('map');
      var def = r.def, s = screen('gxc-res-on ' + (r.won ? 'won' : 'lost')), box = el('div', 'gxc-res');
      box.appendChild(el('div', 'gxc-res-k', def.title));
      box.appendChild(el('h2', null, r.won ? (def.boss ? 'Boss defeated!' : 'Chapter won!') : (def.goal.type === 'mission' || def.goal.type === 'survive' ? 'Mission failed' : 'Not this time')));
      var sr = starRow(r.stars, def.maxStars, 3); sr.classList.add('big'); box.appendChild(sr);
      if (r.won && def.easy) box.appendChild(el('div', 'gxc-dim gxc-small', 'Easier mode: up to ' + def.maxStars + ' stars. Play it normally for 3.'));
      var sl = el('ul', 'gxc-slist');
      def.stars.forEach(function (st, i) { var li = el('li', i < r.stars ? 'on' : ''); li.appendChild(el('i', null, '★')); li.appendChild(el('span', null, st.text)); sl.appendChild(li); });
      box.appendChild(sl);
      var op = def.opponent, line = r.won ? op.praise : op.taunt;
      if (line) {
        var q = el('div', 'gxc-quote');
        q.appendChild(portrait(op.cast || 'opponent', 52, def));
        var qt = el('div'); qt.appendChild(el('b', null, op.name)); qt.appendChild(el('p', null, '“' + line + '”')); q.appendChild(qt);
        box.appendChild(q);
      }
      if (r.unlocks && r.unlocks.length) {
        var ul = el('div', 'gxc-unl'); ul.appendChild(el('b', null, 'Unlocked'));
        r.unlocks.forEach(function (u) { var x = el('div', 'gxc-unl-i'); x.appendChild(el('span', 'gxc-tag', u.type)); x.appendChild(el('span', null, u.text)); ul.appendChild(x); });
        box.appendChild(ul);
      }
      var row = el('div', 'gxc-row wrap');
      var m = btn('gxc-btn ghost', 'Map', function () { done('map'); }); m.setAttribute('data-gxc-esc', ''); row.appendChild(m);
      row.appendChild(btn('gxc-btn ' + (r.won ? 'ghost' : 'go'), r.won ? 'Replay' : 'Try again', function () { done('retry'); }));
      if (!r.won && r.losses >= 2) row.appendChild(btn('gxc-btn soft', 'Make it a bit easier', function () { done('easier'); }));
      if (r.won) row.appendChild(btn('gxc-btn go', 'Continue', function () { done('continue'); }));
      box.appendChild(row);
      if (!r.won && r.losses >= 2) box.appendChild(el('p', 'gxc-dim gxc-small', 'Easier: ' + easierText(def) + ' (up to 2 stars).'));
      s.appendChild(box);
      var f = row.querySelector('.go') || m; f.focus();
    });
  };

  // ------------------------------------------------------------------ init
  GXC.init = function (opts) {
    O = opts || {}; D = O.data || null; P = load();
    if (!O.startChapter) O.startChapter = function () { };
    if (!O.isWon) O.isWon = function () { return false; };
    return GXC;
  };
  GXC.data = function () { return D; };

  if (root && root.document) root.GXC = GXC;
  if (typeof module !== 'undefined' && module.exports) module.exports = GXC;
})(typeof window !== 'undefined' ? window : this);
