// Nebula Aces scenarios (see shell/gx-scenario.js): ?scn=<id> builds ONE state directly. Registered before the game scripts run; setup() runs after boot.
(function () {
  if (!window.GXS) return;
  var booted = function () { return typeof G !== 'undefined' && typeof newGame === 'function' && typeof render === 'function' && typeof UI !== 'undefined' && typeof BF !== 'undefined' && typeof tutStart === 'function' && typeof GXT !== 'undefined'; };
  var $ = function (s) { return document.querySelector(s); };
  var words = function (t) { return String(t).trim().split(/\s+/).filter(Boolean).length; };
  var skin = { kind: 'fn', name: 'painted skin moves no box', fn: function () { if (typeof GXSK === 'undefined') return true; var a = GXSK.audit(); return !a.moved.length || a.moved.slice(0, 2).join(' | '); } };
  var idle = function (ms) { return new Promise(function (r) { setTimeout(r, ms || 600); }); };
  // a plain solo battle (Kael vs Slate, no tutorial), planning round 1, briefing and tips off
  function table(seed) {
    try { GXH.setEnabled(false); } catch (e) { }
    try { GX.close(); } catch (e) { }
    GXS.seed(seed);
    Object.assign(UI, { mode: 'solo', camp: null, info: false, stats: false, rules: false, build: null, draft: {}, pass: null, sel: null, sugCache: null, autoSetup: false, advOpen: false, hints: false, hold: null, holdK: [], paused: false });
    newGame({ fac: [0, 1], players: [{ human: true }, { human: false, lvl: 'normal' }], squads: [[{ p: 'kael', u: ['u_plasma'] }], [{ p: 'slate', u: [] }]], ex: { noRocks: true }, seed: seed });
    while (G.phase === 'ask' && G.q && G.q.key === 'deploy' && G.round === 0) { var q = G.q; resolveAsk(q.opts[Math.floor(q.opts.length / 2)].k); if (G.q && G.q.kid === q.kid) break; }
    resetGuide(); flowReset(); try { BF.seenBrief = G.seed; PHN.briefSeen = G.seed; } catch (e) { } try { BF.hideBan(); } catch (e) { }
    camView('tilt'); render();
    return GXS.wait(function () { return G.phase === 'plan' && (BF.on || !PHN.on) && !UI.info; }, 15000).then(function () { return idle(900); });
  }
  var inView = function (e) { var r = e.getBoundingClientRect(); return r.left >= -2 && r.right <= innerWidth + 2 && r.top >= -2 && r.bottom <= innerHeight + 2; };
  var fonts = function (root, min) { var bad = []; [].forEach.call(document.querySelectorAll(root + ' *'), function (e) { if (e.children.length || !(e.textContent || '').trim() || !GXS.vis(e)) return; var px = parseFloat(getComputedStyle(e).fontSize); if (px < min) bad.push(e.textContent.trim().slice(0, 16) + ' ' + px + 'px'); }); return bad; };

  GXS.add({
    id: 'nb-tutorial-play', name: 'Tutorial: tap your ship', ask: 'Tap the glowing ship', seed: 6, when: booted,
    setup: function () {
      try { GX.close(); } catch (e) { }
      tutStart();   // the same lesson the menu opens, fixed squads and dice
      return GXS.wait(function () { return GXT.active() && G && G.tut && G.phase === 'plan' && BF.on; }, 20000).then(function () {
        GXT.goto('ship');   // the step that asks you to tap your ship
        return GXS.wait(function () { var s = GXT.state(); return s.id === 'ship' && s.shown && document.querySelector('.bfring.need'); }, 15000);
      }).then(function () { return idle(700); });
    },
    checks: [
      { kind: 'fn', name: 'tutorial is on the "tap your ship" step', fn: function () { return GXT.state().id === 'ship' || 'step is ' + GXT.state().id; } },
      { kind: 'visible', sel: '.bfring.need', name: 'glowing ship ring' },
      { kind: 'fn', name: 'nothing but the ring is asked for (no Skip over it)', fn: function () { var r = document.querySelector('.bfring.need').getBoundingClientRect(), s = document.querySelector('[data-gxt-skip]'); if (!s) return true; var k = s.getBoundingClientRect(); return !(k.left < r.right && k.right > r.left && k.top < r.bottom && k.bottom > r.top) || 'Skip button over the ring'; } },
      { kind: 'tap', sel: '.bfring.need', name: 'tap the glowing ship', state: function () { return { sel: BF.sel, step: GXT.state().id }; },
        expect: function (a, b) { return (b.sel === 's1' && b.step !== 'ship') || (b.sel !== 's1' ? 'the ship was not picked (sel ' + b.sel + ')' : 'tutorial stayed on the step'); } },
      { kind: 'fn', name: 'its moves are on screen and the tutorial moved on', fn: function () { return (!!document.querySelector('.bfm') || GXT.state().id !== 'ship') || 'no maneuver cards after the tap'; } }
    ]
  });

  // phone layer: board-first buttons; desktop: the dock's own buttons (the board itself is the same 3D mat)
  var seeAny = function (name, sels) { return { kind: 'fn', name: name, fn: function () { for (var i = 0; i < sels.length; i++) { var e = document.querySelector(sels[i]); if (e && GXS.vis(e)) { var r = e.getBoundingClientRect(), t = document.elementFromPoint(Math.min(innerWidth - 1, Math.max(1, r.left + r.width / 2)), Math.min(innerHeight - 1, Math.max(1, r.top + r.height / 2))); if (r.left < -2 || r.right > innerWidth + 2 || r.bottom > innerHeight + 2) return sels[i] + ' partly off screen'; if (t && t !== e && !e.contains(t) && !t.contains(e) && t.id !== 'gxscn-tag') return sels[i] + ' covered by ' + (t.id || t.className); return true; } } return 'none visible: ' + sels.join(' / '); } }; };

  GXS.add({
    id: 'nb-board', name: 'Start of game board', ask: 'Is the board clear and filled?', seed: 7, when: booted,
    setup: function () { return table(7); },
    checks: [
      { kind: 'fn', name: 'the 3D board fills its area', fn: function () { var c = V3.r.domElement.getBoundingClientRect(), f = c.width * c.height / (innerWidth * innerHeight); return f > .5 || 'board only ' + Math.round(f * 100) + '% of the screen'; } },
      seeAny('your ship is on the board', ['.bfring.need', '.qc.me']),
      seeAny('plan buttons (Auto / Recommended) visible', ['[data-bf=auto]', '[data-a=autodial]', '.gx-dock .btn:not(.primary)']),
      seeAny('Fly / Lock in visible', ['[data-bf=fly]', '[data-a=lock]', '.gx-dock .btn.primary']),
      { kind: 'fn', name: 'no line of text over 8 words on the board (phone layer)', fn: function () { if (!PHN.on) return true; var bad = ''; [].forEach.call(document.querySelectorAll('#bftop *, #bfbtns *, #bfsay, .bfhint'), function (e) { if (e.children.length || !GXS.vis(e)) return; var t = (e.textContent || '').trim(); if (words(t) > 8) bad = bad || '"' + t.slice(0, 40) + '" (' + words(t) + ' words)'; }); var h = document.querySelector('.bf-say, #bfhint, .bfhint, [class*=bfsay]'); return !bad || bad; } },
      skin
    ]
  });

  GXS.add({
    id: 'nb-zoom', name: 'Ship card zoom', ask: 'Is the ship card readable?', seed: 8, when: booted,
    setup: function () { return table(8).then(function () { if (PHN.on) { UI.sel = 's1'; PHN.openPop('info', 's1'); } else GX.show('d-squads'); return idle(800); }); },
    checks: [
      { kind: 'fn', name: 'the ship card is open', fn: function () { var e = document.querySelector(PHN.on ? '#ppop .pp-b' : '#roster .pcard'); return (e && GXS.vis(e)) || 'no ship card on screen'; } },
      { kind: 'fn', name: 'card text >= 12 px', fn: function () { var b = fonts(PHN.on ? '#ppop .pp-b' : '#roster .pcard', 12); return !b.length || b.length + ' texts under 12px, e.g. ' + b[0]; } },
      { kind: 'fn', name: 'card is on screen', fn: function () { var e = document.querySelector(PHN.on ? '#ppop .pp-b' : '#roster .pcard'); return inView(e) || 'card off screen'; } },
      { kind: 'fn', name: 'it can be closed', fn: function () { if (PHN.on) { var x = document.querySelector('#ppop [data-ph=x]'); if (!x || !GXS.vis(x)) return 'no close button'; x.click(); return !PHN.pop || 'popup did not close'; } GX.close(); var e = document.querySelector('#roster .pcard'); return !(e && GXS.vis(e)) || 'drawer did not close'; } }
    ]
  });

  // painted hull side views: every hull in the game shows its own painting on its squad card
  var ART_SQ = [[{ p: 'ironsq', u: [] }, { p: 'tamsin', u: [] }, { p: 'fringe', u: [] }, { p: 'oren', u: [] }, { p: 'operative', u: [] }], [{ p: 'kira', u: [] }, { p: 'primew', u: [] }, { p: 'cleaver', u: [] }, { p: 'kade', u: [] }]];
  var ART_TYPES = ['anvil', 'needle', 'hauler', 'keel', 'kestrel', 'warden', 'razor', 'maul', 'herald'];
  GXS.add({
    id: 'nb-art', name: 'Painted ship art on every hull', ask: 'Does each ship have its picture?', seed: 9, when: booted,
    setup: function () {
      try { GXH.setEnabled(false); } catch (e) { } try { GX.close(); } catch (e) { }
      GXS.seed(9);
      Object.assign(UI, { mode: 'solo', camp: null, info: false, stats: false, rules: false, build: null, draft: {}, pass: null, sel: null, sugCache: null, autoSetup: false, advOpen: false, hints: false, hold: null, holdK: [], paused: false });
      newGame({ fac: [0, 1], players: [{ human: true }, { human: false, lvl: 'normal' }], squads: ART_SQ.map(function (a) { return a.map(function (x) { return { p: x.p, u: [] }; }); }), ex: { noRocks: true }, seed: 9 });
      UI.radio = { r: G.round, side: 0, who: 'Kael', t: 'Form up on me.' };
      render(); GX.show('d-squads');
      return GXS.wait(function () { return document.querySelectorAll('#roster .pcard').length >= 9; }, 15000).then(function () {
        [].forEach.call(document.querySelectorAll('#roster .pc-art img'), function (i) { i.loading = 'eager'; });
        return idle(1500);
      });
    },
    checks: [
      { kind: 'fn', name: 'all 9 hulls have a card', fn: function () { var n = G.ships.map(function (s) { return s.type; }); return ART_TYPES.every(function (t) { return n.indexOf(t) >= 0; }) || 'hulls on table: ' + n.join(','); } },
      { kind: 'fn', name: 'each hull card shows its own painting, loaded', fn: function () {
        var bad = []; G.ships.forEach(function (s, i) {
          var im = document.querySelectorAll('#roster .pcard')[i].querySelector('.pc-art img');
          if (!im) { bad.push(s.type + ': no image'); return; }
          if (im.src.indexOf('media/ship-' + s.type + '.webp') < 0) bad.push(s.type + ': shows ' + im.src.split('/').pop());
          else if (!(im.naturalWidth > 0)) bad.push(s.type + ': not loaded');
        }); return !bad.length || bad.join('; ');
      } },
      { kind: 'fn', name: 'paintings are not stretched', fn: function () { var bad = []; [].forEach.call(document.querySelectorAll('#roster .pc-art img'), function (im) { var r = im.getBoundingClientRect(); if (!r.width || !im.naturalWidth) return; var a = (r.width / r.height) / (im.naturalWidth / im.naturalHeight); var fit = getComputedStyle(im).objectFit; if (fit === 'fill' && Math.abs(a - 1) > .05) bad.push(im.src.split('/').pop() + ' x' + a.toFixed(2)); }); return !bad.length || bad.join(', '); } },
      { kind: 'fn', name: 'cards are visible and text readable (>= 12 px)', fn: function () { var b = fonts('#roster .pcard', 12); return (GXS.vis(document.querySelector('#roster .pcard')) && !b.length) || 'card hidden or ' + b.length + ' texts under 12px'; } },
      { kind: 'fn', name: 'radio strip wears the painted row plate and its text stays readable', fn: function () { var r = document.getElementById('radio'); if (!r || !r.textContent.trim()) return 'no radio text'; if (!GXS.vis(r)) return true; var cs = getComputedStyle(r); return (/ui-row\.webp/.test(cs.backgroundImage) && parseFloat(cs.fontSize) >= 12) || 'radio bg ' + cs.backgroundImage.slice(0, 40) + ' font ' + cs.fontSize; } },
      skin
    ]
  });

  /* Help: the board scenario's table, then the rules cards (GXH.rules) */
  GXS.add({
    id: 'nb-help', name: 'Help: rules cards', ask: 'Can you read the help cards?', seed: 41, group: 'UI',
    when: function () { return typeof GXH !== 'undefined' && GXS.defs.some(function (x) { return x.id === 'nb-board' && (!x.when || x.when()); }); },
    setup: function () { var b = GXS.defs.filter(function (x) { return x.id === 'nb-board'; })[0]; return Promise.resolve(b.setup()).then(function () { GXH.rules(null); return GXS.wait(function () { return document.querySelector('.gxh-rules .gxh-card'); }, 5000); }).then(function () { return new Promise(function (r) { setTimeout(r, 400); }); }); },
    checks: [
      { kind: 'visible', sel: '.gxh-rules .gxh-card', name: 'help card' },
      { kind: 'text', sel: '.gxh-rules .gxh-rt', re: /\S/, name: 'card title' },
      { kind: 'text', sel: '.gxh-rules .gxh-rx', re: /\S/, name: 'card text' },
      { kind: 'visible', sel: '.gxh-rules .gxh-x', name: 'Close button' },
      { kind: 'tap', sel: '.gxh-rules .gxh-x', name: 'tap Close', state: function () { return !!document.querySelector('.gxh-rules'); }, expect: function (a, b) { return (a && !b) || 'help did not close'; } }
    ]
  });

  /* Coach bubble: its pointer is the painted speech-bubble tail (ui-bubble-tail), same 12 px size as before */
  GXS.add({
    id: 'nb-tail', name: 'Coach bubble has the painted tail', ask: 'Does the speech bubble have its painted tail?', seed: 9, group: 'UI',
    when: function () { return typeof GXH !== 'undefined' && GXS.defs.some(function (x) { return x.id === 'nb-board' && (!x.when || x.when()); }); },
    setup: function () { var b = GXS.defs.filter(function (x) { return x.id === 'nb-board'; })[0]; return Promise.resolve(b.setup()).then(function () { return GXS.wait(function () { return document.querySelector('.gxh-bub.on .gxh-arr'); }, 8000); }); },
    checks: [
      { kind: 'fn', name: 'bubble pointer wears the painted tail', fn: function () { var a = document.querySelector('.gxh-bub.on .gxh-arr'); if (!a) return 'no coach bubble'; var cs = getComputedStyle(a); return (/ui-bubble-tail/.test(cs.backgroundImage) && a.offsetWidth === 12 && a.offsetHeight === 12) || 'tail missing or not 12 px: ' + cs.backgroundImage + ' ' + a.offsetWidth + 'x' + a.offsetHeight; } },
      { kind: 'fn', name: 'tail file loaded', fn: function () { var a = document.querySelector('.gxh-bub.on .gxh-arr'); return (!!a && getComputedStyle(a).backgroundImage !== 'none') || 'no painted background'; } }
    ]
  });
})();
