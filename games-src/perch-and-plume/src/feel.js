// part 6: feel (shell/gx-feel.js, FEEL.md). Drag a bird from your hand onto a habitat row, a feeder die into your food,
// a tray card or the deck into your hand, an egg onto a bird. Cards and dice fly, eggs hop, points fly into the score and
// it rolls up, the camera leans in on your new bird and on the rival's pick, round ends get a beat, and the keyboard plays.
// Tap play is unchanged. Rules engine untouched.
var PPF = (function () {
  if (!window.GXF) return null;
  var F = window.GXF;
  if (new URLSearchParams(location.search).get('fast')) F.off = true;
  F.mute = function () { try { return !!(SND && SND.off); } catch (e) { return false; } };
  var cam = F.camera($('#board'), $('#bd'), { max: 2.4, ignore: '[data-gxf-drag], .bc, .die, button, [data-a]' });
  function canDrag() { return myTurn() && !UI.busy && UI.mode !== 'tutorial' && !(window.GXT && GXT.running && GXT.running()); }
  function legal() { return PP.validMoves(G, UI.view); }
  function myScore() { return $('.sr[data-s="' + UI.view + '"] .st b'); }
  function scoreOf(s) { return $('.sr[data-s="' + s + '"] .st b') || $('.sr[data-s="' + s + '"]'); }
  function node(html, cls) { var d = document.createElement('div'); d.className = 'ppf-n ' + (cls || ''); d.innerHTML = html; return d; }
  function cardBack() { return node('<span>&#10022;</span>', 'ppf-back'); }

  // ---------------------------------------------------------------- drag 1: a bird from your hand onto a habitat row
  F.drag({
    items: '#hand .bc[data-a="hand"]', axis: 'up',
    data: function (el) {
      if (!canDrag() || UI.pend) return null; var Q = G.q, i = +el.dataset.i;
      if (Q && Q.h !== 'play2') return null;
      return PP.playable(G, UI.view, Q && Q.h === 'play2' ? Q.d.hab : null).some(function (x) { return x.i === i; }) ? { i: i, id: G.pl[UI.view].hand[i] } : null;
    },
    ghost: function (el) { var c = el.cloneNode(true); c.style.width = '100%'; return c; },
    targets: function (d) {
      var Q = G.q, hab = Q && Q.h === 'play2' ? Q.d.hab : null;
      return [0, 1, 2].filter(function (h) { return PP.playInfo(G, UI.view, d.id, h, hab); }).map(function (h) {
        var row = $('.row[data-h="' + h + '"]'), slot = row && row.querySelector('.slot.next');
        return { el: slot || row, h: h, rect: function () { return row.getBoundingClientRect(); } };
      });
    },
    drop: function (d, t) {
      if (!tutGate({ type: 'tap', what: 'hand', i: d.i, id: d.id }) || !tutGate({ type: 'tap', what: 'slot', h: t.h })) return false;
      var Q = G.q, inf = PP.playInfo(G, UI.view, d.id, t.h, Q && Q.h === 'play2' ? Q.d.hab : null); if (!inf) return false;
      UI.sel = null; UI.pickBird = false;
      if (inf.pays.length === 1) { UI.dragged = d.i; requestAnimationFrame(function () { human({ t: 'play', i: d.i, id: d.id, h: t.h, pay: inf.pays[0] }); UI.dragged = null; }); }   // next frame: the drop and the move are two short tasks
      else { UI.sel = d.i; UI.pend = { i: d.i, h: t.h, k: 0 }; render(); F.pulse($('#acts [data-a="playgo"]')); }   // more than one way to pay: you choose
      return true;
    }
  });
  // ---------------------------------------------------------------- drag 2: a feeder die into your food
  F.drag({
    items: '.die[data-a="die"]',
    data: function (el) { if (!canDrag() || !G.q || G.q.h !== 'die') return null; var i = +el.dataset.i; return legal().some(function (m) { return m.t === 'die' && m.i === i; }) ? { i: i } : null; },
    targets: function () { return [{ el: $('#foodrow') }, { el: $('.row[data-h="0"]') }].filter(function (t) { return t.el; }); },
    drop: function (d) {
      if (G.feeder[d.i] === 'gs') { if (!tutGate({ type: 'tap', what: 'die', i: d.i, f: 'gs' })) return false; UI.gsDie = d.i; render(); return true; }
      var m = legal().find(function (x) { return x.t === 'die' && x.i === d.i; }); if (!m || !tutGate(Object.assign({ type: 'tap', what: 'die' }, m))) return false;
      requestAnimationFrame(function () { human(m); }); return true;
    }
  });
  // ---------------------------------------------------------------- drag 3: a tray card or the deck into your hand
  F.drag({
    items: '.bc[data-a="tray"], #deckb',
    data: function (el) {
      if (!canDrag() || !G.q || G.q.h !== 'draw') return null;
      var deck = el.id === 'deckb', i = +el.dataset.i, m = legal().find(function (x) { return deck ? x.t === 'deck' : x.t === 'tray' && x.i === i; });
      return m ? { m: m } : null;
    },
    targets: function () { return [{ el: $('#hand') }, { el: $('#dockbody') }].filter(function (t) { return t.el; }); },
    drop: function (d) { if (!tutGate(Object.assign({ type: 'tap', what: d.m.t === 'deck' ? 'deck' : 'tray' }, d.m))) return false; requestAnimationFrame(function () { human(d.m); }); return true; }
  });
  // ---------------------------------------------------------------- drag 4: an egg from the grassland onto a bird
  F.drag({
    items: '.ract[data-h="1"]',
    data: function () { return canDrag() && G.q && G.q.h === 'egg' ? {} : null; },
    ghost: function () { return node(typeof eggIcon === 'function' ? eggIcon() : '&#9711;', 'ppf-egg'); },
    targets: function () { return legal().filter(function (m) { return m.t === 'egg'; }).map(function (m) { return { el: $('.bc[data-a="bird"][data-h="' + m.h + '"][data-c="' + m.c + '"]'), m: m }; }).filter(function (t) { return t.el; }); },
    drop: function (d, t) { if (!tutGate(Object.assign({ type: 'tap', what: 'bird' }, t.m))) return false; requestAnimationFrame(function () { human(t.m); }); return true; }
  });
  // drag affordance + cursor on whatever can be dragged right now
  function mark() {
    $$('[data-gxf-drag]').forEach(function (e) { e.removeAttribute('data-gxf-drag'); });
    if (!G || !myTurn() || UI.busy) return;
    var Q = G.q;
    if (!Q || Q.h === 'play2') PP.playable(G, UI.view, Q && Q.h === 'play2' ? Q.d.hab : null).forEach(function (x) { var e = $('#hand .bc[data-i="' + x.i + '"]'); if (e) e.setAttribute('data-gxf-drag', 'up'); });
    if (Q && Q.h === 'die') $$('.die[data-a="die"]').forEach(function (e) { e.setAttribute('data-gxf-drag', ''); });
    if (Q && Q.h === 'draw') $$('.bc[data-a="tray"], #deckb').forEach(function (e) { e.setAttribute('data-gxf-drag', ''); });
    if (Q && Q.h === 'egg') { var r = $('.ract[data-h="1"]'); if (r) r.setAttribute('data-gxf-drag', ''); }
  }

  // ---------------------------------------------------------------- flights: every move, yours and the rival's
  var snap = null;
  function rects() {
    var o = { die: {}, tray: {}, hand: {}, deck: null, ract: {} };
    $$('.die[data-a="die"]').forEach(function (e) { o.die[e.dataset.i] = { r: e.getBoundingClientRect(), html: e.innerHTML }; });
    $$('.bc[data-a="tray"]').forEach(function (e) { o.tray[e.dataset.i] = { r: e.getBoundingClientRect(), el: e }; });
    $$('#hand .bc[data-a="hand"]').forEach(function (e) { o.hand[e.dataset.i] = { r: e.getBoundingClientRect(), el: e }; });
    var d = $('#deckb'); if (d) o.deck = d.getBoundingClientRect();
    $$('.ract').forEach(function (e) { o.ract[e.dataset.h] = e.getBoundingClientRect(); });
    return o;
  }
  var apply0 = window.apply;
  window.apply = function (m, s) {
    var pre = UI.fast || F.off ? null : rects(), me = isHuman(s) && s === UI.view;
    var r = apply0.apply(this, arguments);
    if (!r || !pre) return r;
    try { after(m, s, me, pre); } catch (e) { console.error(e); }
    return r;
  };
  apply = window.apply;
  function after(m, s, me, pre) {
    var dest = me ? null : scoreOf(s);
    if (m.t === 'die' && pre.die[m.i]) {
      var to = me ? $('#foodrow') : dest, n = node(pre.die[m.i].html, 'ppf-die');
      if (!me) cam.focus($('#feeder'), 350, 1.35);
      setTimeout(function () { F.fly(pre.die[m.i].r, to, { node: n, ms: 520, scale: 0.8, spin: 200 }).then(function () { F.pulse(to); F.sfx('hop'); }); }, me ? 0 : F.ms(300));
    }
    if ((m.t === 'tray' && pre.tray[m.i]) || m.t === 'deck') {
      var src = m.t === 'deck' ? pre.deck : pre.tray[m.i].r, el = m.t === 'deck' || !me ? cardBack() : pre.tray[m.i].el.cloneNode(true), tgt = me ? ($('#hand .bc:last-child') || $('#hand')) : dest;
      if (!me && m.t === 'tray') cam.focus($('#tray'), 350, 1.3);
      F.sfx('flip'); setTimeout(function () { F.fly(src, tgt, { node: el, ms: 560, w: src.width, h: src.height, scale: me ? 1 : 0.4 }).then(function () { F.pulse(tgt); }); }, me ? 0 : F.ms(300));
    }
    if (m.t === 'play' && me && UI.dragged !== m.i && pre.hand[m.i]) {   // tap path: the card flies from your hand to its slot
      var slot = $('.bc[data-a="bird"][data-h="' + m.h + '"]:last-of-type') || $('.row[data-h="' + m.h + '"]');
      var all = $$('.row[data-h="' + m.h + '"] .bc[data-a="bird"]'); slot = all[all.length - 1] || slot;
      F.fly(pre.hand[m.i].r, slot, { node: pre.hand[m.i].el.cloneNode(true), ms: 480, w: pre.hand[m.i].r.width, h: pre.hand[m.i].r.height });
    }
    if (m.t === 'egg' && me && pre.ract[1]) {
      var b = $('.bc[data-a="bird"][data-h="' + m.h + '"][data-c="' + m.c + '"]');
      F.fly(pre.ract[1], b, { node: node(typeof eggIcon === 'function' ? eggIcon() : '&#9711;', 'ppf-egg'), ms: 420, w: 30, h: 30, scale: 1 }).then(function () { F.hop($('.bc[data-a="bird"][data-h="' + m.h + '"][data-c="' + m.c + '"]')); F.sfx('hop'); });
    }
  }
  // fx hook (flow.js playFx calls PPF.fx(e, mine) before each step): camera, points, beats
  function fx(e, mine) {
    switch (e.k) {
      case 'play': {
        if (!mine) return;
        var el = $('.bc[data-a="bird"][data-h="' + e.h + '"][data-c="' + e.c + '"]'); if (!el) return;
        F.settle(el);
        setTimeout(function () { F.points(el, myScore(), '+' + B[e.id].p); F.buzz('score'); }, F.ms(250));
        return cam.focus(el, 300, 1.3);
      }
      case 'chainStart': if (mine && e.n >= 2) return cam.focus($('.row[data-h="' + e.h + '"]'), 200, 1.15); return;
      case 'egg': if (mine) { var b = $('.bc[data-a="bird"][data-h="' + e.h + '"][data-c="' + e.c + '"]'); if (b) setTimeout(function () { F.points(b, myScore(), '+1'); }, F.ms(150)); } return;
      case 'round': return F.beat('Round ' + (e.r + 1), G.cubes[e.r] + ' actions each');
      case 'goal': return F.beat('Round goal', G.pl.map(function (p, i) { return (isHuman(i) && humans().length === 1 ? 'You' : p.name) + ' ' + e.res.pts[i]; }).join(' · '), 1500);
      case 'over': return F.beat('The year is over', 'Counting the points', 1300);
    }
  }
  // after every render: drag marks, counters roll, held hand card pulses
  var render0 = window.render;
  window.render = function () {
    var r = render0.apply(this, arguments);
    try { mark(); $$('.sr[data-s]').forEach(function (e) { var b = e.querySelector('.st b'); if (b) b.setAttribute('data-gxf-roll', 'pp' + e.dataset.s); }); F.rollAll($('#opps')); } catch (e) { }
    return r;
  };
  render = window.render;
  var start0 = window.startGame;
  window.startGame = function () { F.rollReset(); try { cam.reset(0); } catch (e) { } return start0.apply(this, arguments); };
  startGame = window.startGame;

  // ---------------------------------------------------------------- keyboard (PC)
  // 1-9: the nth glowing choice (dice, tray, rows, birds) or the nth button of the panel; arrows: browse your birds;
  // Enter: confirm (Play) or pick the bird you look at; Esc / Z: back out of a choice you have not confirmed; +/-/0 zoom
  F.keys({
    digit: function (n) {
      if (!myTurn() || UI.busy) return false;
      var g = $$('.glow').filter(function (e) { return e.offsetParent; }), b = $$('#acts button:not([disabled])');
      var el = g.length && !$('#act4') ? g[n - 1] : b[n - 1]; if (!el) return false; el.click();
    },
    ArrowRight: function () { if (!G || !G.pl[UI.view].hand.length) return false; handGo((UI.hix || 0) + 1); },
    ArrowLeft: function () { if (!G || !G.pl[UI.view].hand.length) return false; handGo((UI.hix || 0) - 1); },
    Enter: function () {
      if (!myTurn() || UI.busy) return false;
      var go = $('#acts [data-a="playgo"]'); if (go) { go.click(); return; }
      var c = $$('#hand .bc')[UI.hix || 0]; if (c) { c.click(); return; } return false;
    },
    Escape: function () { var c = $('#acts [data-a="cancel"]'); if (!c) return false; c.click(); },
    z: function () { var c = $('#acts [data-a="cancel"]'); if (!c) return false; c.click(); },
    '+': function () { cam.zoomBy(1.2); }, '=': function () { cam.zoomBy(1.2); }, '-': function () { cam.zoomBy(1 / 1.2); }, '0': function () { cam.reset(); }
  }, { when: function () { return !!G && $('#title').hidden && $('#result').hidden && $('#pass').hidden && $('#pop').hidden; } });
  return { fx: fx, cam: cam };
})();
