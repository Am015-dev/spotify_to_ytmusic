
// ===== part 8: game screen layout (board fills the screen; top tabs; right gauge column; left player strips; bottom bar) =====
// Panels (the old drawer) open centred, stay open while you play on the board, and close only with their square X or Esc.
(function () {
  var STD_TIP = {
    power: 'Pay 11 credits. Energy production +1. Each round your energy fills up again, and leftover energy turns into heat.',
    asteroid: 'Pay 14 credits. Temperature goes up one step and you gain 1 rating: 1 point now, 1 more credit every round.',
    aquifer: 'Pay 18 credits. Place an ocean on a blue space. +1 rating. Tiles next to an ocean get 2 credits.',
    greenery: 'Pay 23 credits. Place a greenery next to your own tiles. Oxygen +1 step, +1 rating, and 1 point at the end.',
    city: 'Pay 25 credits. Place a city, never next to another city. Credit production +1. Each greenery touching it is 1 point.',
    sell: 'Throw away cards you will not use. You get 1 credit for each.',
    green: 'Turn plants into a greenery tile for free. Oxygen +1 step and +1 rating.',
    heat: 'Spend 8 heat to raise the temperature one step. +1 rating.'
  };
  var TAG_WORD = { building: 'Building', space: 'Space', science: 'Science', power: 'Power', earth: 'Earth', jovian: 'Gas giant', plant: 'Plant', microbe: 'Microbe', animal: 'Animal', city: 'City' };

  // ---------- layout mode: one layout for every size; "wide" only changes sizes ----------
  window.removeEventListener('resize', setPC);
  setPC = function () {
    var w = window.innerWidth >= 900 && window.innerHeight >= 600;
    UI.pc = false; document.body.classList.add('gl'); document.body.classList.toggle('wide', w); document.body.classList.remove('pc');
    setTimeout(applyView, 30);
  };
  openSheet = function (kind, tab) {
    UI.sheet = kind; UI.tab = tab || UI.tab;
    $('sheet').classList.add('on'); $('scrim').classList.remove('on'); $('app').inert = false;
    UI.sheetSig = ''; UI.refreshSheet(); $('shB').scrollTop = 0; markTabs();
  };
  closeSheet = function () {
    UI.sheet = null; UI.stdSel = null; $('sheet').classList.remove('on');
    if (!$('modal').classList.contains('on')) $('scrim').classList.remove('on'); $('app').inert = false; markTabs();
  };
  function markTabs() {
    var k = UI.sheet, tb = UI.tab;
    ['tMile', 'bProj', 'tAward'].forEach(function (id) {
      var want = $(id).getAttribute('data-pn'), on = k === 'proj' && ((tb === want) || (want === 'std' && tb !== 'mile' && tb !== 'award'));
      $(id).classList.toggle('on', !!on); $(id).setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  // ---------- extra panels: tags, points, effects ----------
  var baseRefresh = UI.refreshSheet;
  UI.refreshSheet = function (auto) {
    var k = UI.sheet; if (!k || !G) return;
    if (k === 'tags' || k === 'vp' || k === 'effects') {
      var P = G.pl[0], R = G.pl[1], B = '', title = '';
      if (k === 'tags') {
        title = 'Tags';
        B = '<p class="pnote">Tags on cards you have played. Many cards and awards count them.</p><div class="tagt"><div class="tr0"><span></span><b>You</b><b>Rival</b></div>' +
          OH.TAGS.map(function (t) { var a = OH.tagCount(0, t), b = OH.tagCount(1, t); return '<div class="tr1' + (a > b ? ' lead' : '') + '"><span>' + TAG_WORD[t] + '</span><b>' + a + '</b><b>' + b + '</b></div>'; }).join('') + '</div>';
      } else if (k === 'vp') {
        title = 'Points';
        B = '<div class="vp2"><div><h4>You</h4>' + scoreTable(0) + '</div><div><h4>Rival</h4>' + scoreTable(1) + '</div></div>';
      } else {
        title = 'Lasting effects';
        var ids = effIds(0);
        B = ids.length ? '<p class="pnote">These work for you all game.</p><div class="grid">' + ids.map(function (id) { return '<button class="cw" data-card="' + id + '" data-owner="0">' + cardHTML(id, { owner: 0 }) + '</button>'; }).join('') + '</div>'
          : '<div class="empty">No lasting effects yet. Teal cards with "Effect:" go here.</div>';
      }
      $('shT').textContent = title; $('shTabs').innerHTML = ''; $('shTabs').style.display = 'none'; $('shB').innerHTML = B; $('sheet').classList.remove('docked');
      return;
    }
    baseRefresh(auto);
    if (k === 'proj') dressProj();
  };
  function effIds(p) { var P = G.pl[p], ids = (P.corp ? [P.corp] : []).concat(P.played); return ids.filter(function (id) { var c = OH.card(id); return c && c.effect && c.effect.length; }); }

  // project / milestone / award rows: icon, name, USE + gold cost badge; tapping the row shows a plain-words tooltip
  function dressProj() {
    $('shB').querySelectorAll('.row').forEach(function (row) {
      var btn = row.querySelector('button'); if (!btn) return;
      var key = btn.getAttribute('data-std') || (btn.hasAttribute('data-sell') ? 'sell' : btn.getAttribute('data-conv')) || btn.getAttribute('data-mile') || btn.getAttribute('data-award');
      row.setAttribute('data-k', key || '');
      var ico = { power: 'energy', asteroid: 'temp', aquifer: 'ocean', greenery: 'plant', city: 'city', sell: 'card', green: 'plant', heat: 'heat' }[key] || (btn.hasAttribute('data-mile') ? 'mc' : 'mc');
      if (!row.querySelector('.ric')) row.insertAdjacentHTML('afterbegin', '<span class="ric">' + A.icon(ico, 26) + '</span>');
      var m = btn.textContent.match(/^(\d+) credits$/);
      if (m) btn.innerHTML = '<span class="use">Use</span><span class="cost">' + m[1] + '</span>';
      btn.setAttribute('aria-label', (row.querySelector('b') || {}).textContent + (m ? ': use for ' + m[1] + ' credits' : ''));
      if (STD_TIP[key]) {
        row.classList.add('tipr'); row.setAttribute('tabindex', '0');
        if (UI.stdSel === key) { row.classList.add('sel'); row.insertAdjacentHTML('beforeend', '<div class="rtip" role="note">' + esc(STD_TIP[key]) + '</div>'); }
      }
    });
  }
  $('shB').addEventListener('click', function (e) {
    var row = e.target.closest('.row.tipr'); if (!row || e.target.closest('button')) return;
    var k = row.getAttribute('data-k'); UI.stdSel = UI.stdSel === k ? null : k; UI.refreshSheet();
  });

  // ---------- top: generation, scores, whose turn ----------
  function scaleHTML(kind) {
    var cur, min, max, step, marks, label, unit, bon;
    if (kind === 'temp') { cur = G.temp; min = OH.TEMP_MIN; max = OH.TEMP_MAX; step = 2; unit = '°'; label = 'Temp'; bon = { '-24': 'heat prod', '-20': 'heat prod', '0': 'ocean' }; }
    else { cur = G.oxy; min = 0; max = OH.OXY_MAX; step = 1; unit = '%'; label = 'Oxygen'; bon = { '8': '+temp' }; }
    var h = '';
    for (var v = max; v >= min; v -= step) {
      var c = v === cur ? ' cur' : v < cur ? ' past' : '';
      var lb = ((max - v) / step) % 2 === 0 || bon[v] !== undefined;
      h += '<i class="st' + c + (bon[v] ? ' bon' : '') + (lb ? ' lb' : '') + '" title="' + v + unit + (bon[v] ? ': bonus ' + bon[v] : '') + '"><em>' + v + '</em></i>';
    }
    return '<div class="gh"><span class="gi">' + A.icon(kind, 18, kind === 'temp' ? '#ff9a5a' : '#9fe6ef') + '</span><b class="gv">' + cur + unit + '</b><small>' + label + '</small></div><div class="scale ' + kind + '">' + h + '</div>';
  }
  renderTop = function () {
    if (!G) return;
    $('gen').innerHTML = '<small>Gen<span class="lgw">eration</span></small><b>' + G.gen + '</b>';
    var s0 = OH.score(0), s1 = OH.score(1), t = OH.sideToAct(), P = G.pl[0], R = G.pl[1];
    $('trYou').textContent = s0.total; $('trRiv').textContent = s1.total;
    $('trYou').setAttribute('data-engine', 'score0'); $('trRiv').setAttribute('data-engine', 'score1');
    $('nmYou').textContent = 'You'; $('nmRiv').textContent = 'Rival' + (R.passed ? ' · passed' : '');
    $('vpYou').textContent = 'Rating ' + P.tr + (P.corp ? ' · ' + OH.card(P.corp).name : '');
    $('vpRiv').textContent = 'Rating ' + R.tr + (R.corp ? ' · ' + OH.card(R.corp).name : '');
    $('syou').classList.toggle('turn', t === 0 && G.phase === 'action'); $('sriv').classList.toggle('turn', t === 1 && G.phase === 'action');
    var my = t === 0 && G.phase === 'action';
    $('actL').textContent = G.over ? 'Game over' : my ? 'Action ' + (G.acts + 1) + ' of 2' : G.phase === 'action' ? (P.passed ? 'You passed' : 'Rival’s turn') : G.phase === 'setup' ? 'Setting up' : 'New round';
    $('actL').classList.toggle('me', my);
    $('gTemp').className = 'gauge' + (G.temp >= OH.TEMP_MAX ? ' done' : ''); $('gTemp').innerHTML = scaleHTML('temp');
    $('gOxy').className = 'gauge' + (G.oxy >= OH.OXY_MAX ? ' done' : ''); $('gOxy').innerHTML = scaleHTML('oxy');
    $('gOcean').className = 'gauge' + (G.oceans >= OH.OCEAN_MAX ? ' done' : '');
    var d = ''; for (var i = 0; i < 9; i++) d += '<i class="' + (i < G.oceans ? 'f' : '') + '"></i>';
    $('gOcean').innerHTML = '<div class="gh"><span class="gi">' + A.icon('ocean', 18, '#4aa7d8') + '</span><b class="gv">' + G.oceans + '/9</b><small>Oceans</small></div><div class="drops">' + d + '</div>';
  };

  // ---------- resources: stock big, production small above ----------
  renderRes = function () {
    if (!G) return;
    var P = G.pl[0], h = '', act = G.phase === 'action' && OH.sideToAct() === 0 && !G.pending,
      canG = act && P.plant >= OH.greenCost(0) && OH.legalSpaces(0, 'greenery').length, canH = act && P.heat >= 8 && G.temp < OH.TEMP_MAX;
    OH.RES.forEach(function (r) {
      var R = A.RES[r], go = (r === 'plant' && canG) || (r === 'heat' && canH), pr = P.prod[r];
      h += '<button class="rc' + (go ? ' go glow' : '') + '" data-r="' + r + '" style="--rc:' + R.col + ';--rf:' + R.fg + '" aria-label="' + R.name + ': ' + P[r] + ', production ' + pr +
        (go ? (r === 'plant' ? '. Tap to turn ' + OH.greenCost(0) + ' plants into a greenery' : '. Tap to turn 8 heat into +1 temperature') : '') + '">' +
        '<span class="p">' + (pr >= 0 ? '+' : '') + pr + '</span><span class="n">' + A.icon(r, 16) + '<span data-engine="' + r + '">' + P[r] + '</span></span>' +
        (go ? '<span class="w cv">' + (r === 'plant' ? 'Plant!' : 'Warm!') + '</span>' : '<span class="w">' + R.name + '</span>') + '</button>';
    });
    $('res').innerHTML = h;
  };

  // ---------- bottom bar: company, hand fan, counters ----------
  var baseBar = renderBar;
  renderBar = function () {
    if (!G) return;
    baseBar();
    var P = G.pl[0], n = P.hand.length, f = '', k = Math.min(n, 7);
    for (var i = 0; i < k; i++) { var a = (i - (k - 1) / 2) * 7; f += '<i style="transform:translateX(' + ((i - (k - 1) / 2) * 6) + 'px) rotate(' + a + 'deg)"></i>'; }
    $('fan').innerHTML = f; $('handN').textContent = n;
    var pl = P.hand.filter(function (id) { return OH.playable(0, id); }).length;
    $('bCardsS').textContent = n ? (pl ? pl + ' playable' : 'cards in hand') : 'hand empty';
    $('bCards').setAttribute('aria-label', 'Your hand: ' + n + ' cards, ' + pl + ' playable');
    $('corpN').textContent = P.corp ? OH.card(P.corp).name : 'No company';
    $('corpB').querySelector('.ci').innerHTML = A.icon('mc', 22);
    $('nPlayed').textContent = P.played.length;
    var tags = 0; OH.TAGS.forEach(function (t) { tags += OH.tagCount(0, t); }); $('nTags').textContent = tags;
    $('nVP').textContent = OH.score(0).total;
    var ready = 0; OH.actionSources(0).forEach(function (id) { OH.card(id).action.forEach(function (a, i) { if (OH.actOk(0, id, i)) ready++; }); });
    $('nAct').textContent = ready; $('bActS').textContent = 'Actions';
    $('nEff').textContent = effIds(0).length;
    $('bProj').disabled = false; $('bAct').disabled = false;
    var my = OH.sideToAct() === 0 && G.phase === 'action' && !G.pending;
    $('bPass').disabled = !my;
  };

  // ---------- wiring ----------
  $('tMile').addEventListener('click', function () { toggleProj('mile'); });
  $('tAward').addEventListener('click', function () { toggleProj('award'); });
  // the Projects tab already opens 'proj'/'std' (part 4); make a second tap close it
  $('bProj').addEventListener('click', function (e) { if (UI.projOpenBefore === 'std') { closeSheet(); } markTabs(); }, true);
  ['tMile', 'bProj', 'tAward'].forEach(function (id) { $(id).addEventListener('pointerdown', function () { UI.projOpenBefore = UI.sheet === 'proj' ? (UI.tab === 'mile' || UI.tab === 'award' ? UI.tab : 'std') : null; }); });
  function toggleProj(t) { if (UI.sheet === 'proj' && UI.projOpenBefore === t) closeSheet(); else openSheet('proj', t); }
  $('blog').addEventListener('click', function () { if (UI.sheet === 'log') closeSheet(); else openSheet('log'); });
  $('corpB').addEventListener('click', function () { if (G && G.pl[0].corp) showCard(G.pl[0].corp, 0); });
  $('cPlayed').addEventListener('click', function () { openSheet('cards', 'played'); });
  $('cTags').addEventListener('click', function () { openSheet('tags'); });
  $('cVP').addEventListener('click', function () { openSheet('vp'); });
  $('cEff').addEventListener('click', function () { openSheet('effects'); });
  $('glob').addEventListener('click', function () { if (!document.body.classList.contains('wide')) $('glob').classList.toggle('open'); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && UI.sheet && !$('modal').classList.contains('on')) closeSheet(); });
  $('shX').setAttribute('aria-label', 'Close panel');

  // ---------- start: choose your corporation (select, then confirm) ----------
  var baseSetup = showSetup;
  showSetup = function () {
    var P = G.pl[0], st = UI.setup || (UI.setup = { step: 0, corp: null, keep: {} });
    if (st.step !== 0) return baseSetup();
    var cs = P.offer.corps.slice(); if (cs.indexOf('c00') < 0 && UI.tut) cs.push('c00');
    var first = UI.tut || !LS.get('oh_done'); if (cs.indexOf('c00') >= 0) { cs.splice(cs.indexOf('c00'), 1); if (first) cs.unshift('c00'); else cs.push('c00'); }
    var sel = st.sel || (first ? 'c00' : null);
    function startLine(C) {
      var bits = ['<span class="sr">' + A.icon('mc', 18) + '<b>' + C.mc + '</b> credits</span>'];
      (C.start || []).forEach(function (o) { bits.push('<span class="sr">' + (A.RES[o.r] ? A.icon(o.r, 18) : '') + esc(opWords(o)) + '</span>'); });
      return bits.join('');
    }
    var h = '<div class="corpPick"><h3>Choose your corporation</h3><div class="cps">' + cs.map(function (id) {
      var C = OH.CORPS[id];
      return '<button class="cpc pickable' + (sel === id ? ' on' : '') + '" data-corp="' + id + '" aria-pressed="' + (sel === id) + '">' + (first && id === 'c00' ? '<span class="recb">Best for a first game</span>' : '') +
        '<b class="cpn">' + esc(C.name) + '</b><span class="cpd">' + esc(CORP_GOOD[id] || C.flavor || '') + '</span><span class="cpst">' + startLine(C) + '</span>' +
        '<span class="cpe"><b>Effect</b> ' + esc(C.text) + '</span><span class="cpsel">' + (sel === id ? 'Selected' : 'Select') + '</span></button>';
    }).join('') + '</div><div class="stick"><button class="btn pickable" id="mCorpGo"' + (sel ? '' : ' disabled') + '>Confirm<small>' + (sel ? esc(OH.CORPS[sel].name) + ', then pick starting cards' : 'Select a corporation first') + '</small></button></div></div>';
    modal(h, false);
    $('mb').querySelectorAll('[data-corp]').forEach(function (b) { b.addEventListener('click', function () { st.sel = b.getAttribute('data-corp'); showSetup(); }); });
    $('mCorpGo').addEventListener('click', function () {
      if (!sel) return;
      st.corp = sel; st.step = 1; if (P.offer.corps.indexOf(st.corp) < 0) P.offer.corps.push(st.corp);
      var C = OH.CORPS[st.corp]; st.keep = {}; if (!C.beginner) { suggestBuys(P.offer.cards, C.mc - 14).forEach(function (id) { st.keep[id] = 1; }); coachShow('keep'); }
      showSetup();
    });
    coachShow('corp');
  };
  setPC(); window.addEventListener('resize', setPC);
  if (G && G.pl) { if (UI.sheet === 'cards') closeSheet(); render(); }
})();
