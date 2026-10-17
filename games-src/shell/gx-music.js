/* gx-music.js: per-screen music with cross-fades and the Music picker (shared; same behaviour as Cauldron Fair's picker).
 * Needs gameaudio.js (GA) with the tracks registered as 'url:music/<slot>-<a|b>.mp3' and shell.js (GX.drawer).
 *   GXMUS.init({
 *     key:'na',                                   localStorage prefix (saves '<key>_mpick')
 *     slots:[['tavern','Menu'],['main','Game'],['fight','Last round'],['victory','Victory'],['defeat','Defeat']],
 *     loops:['tavern','main','fight'],            slots that loop (the others play once); 'All songs' shuffles these
 *     titles:{'tavern-a':'...'},                  optional chip names (default 'Song A' / 'Song B')
 *     slot:()=>['tavern',0],                      which slot plays now; second item 1 = play once (stinger)
 *     on:()=>true })                              is music switched on? (the game's own mute toggle)
 *   GXMUS.sync() after anything that may change the slot or the mute; GXMUS.open() shows the picker drawer.
 * Everything is wrapped so a missing GA or a missing file never throws. */
(function (root) {
  'use strict';
  var C = null, P = {}, MUS = { res: {}, sh: {}, want: null, wslot: null, prev: null, prevT: 0, last: null, since: 0 }, ALL_MS = 150000;
  var DEF = { tavern: 'a', main: 'a', fight: 'a', victory: 'a', defeat: 'a' };
  function ga() { return root.GA || null; }
  function names() { var o = []; C.slots.forEach(function (s) { o.push(s[0] + '-a', s[0] + '-b'); }); return o; }
  function title(n) { return (C.titles && C.titles[n]) || ('Song ' + n.slice(-1).toUpperCase()); }
  function isLoop(k) { return C.loops.indexOf(k) >= 0; }
  function allPool() { return names().filter(function (n) { return isLoop(n.replace(/-[ab]$/, '')); }); }
  function pickOf(slot) { return P[slot] || (isLoop(slot) ? 'all' : DEF[slot]) || 'a'; }
  function nameOf(slot) {
    var c = pickOf(slot); if (c === 'off') return '-';
    if (c === 'all') { if (!MUS.res[slot]) { var pool = allPool().filter(function (k) { return k !== MUS.last; }); MUS.res[slot] = pool[Math.floor(Math.random() * pool.length)]; } return MUS.res[slot]; }
    if (c === 'shuffle') { if (!MUS.res[slot]) { MUS.sh[slot] = MUS.sh[slot] === undefined ? (Math.random() < .5 ? 0 : 1) : 1 - MUS.sh[slot]; MUS.res[slot] = slot + '-' + 'ab'[MUS.sh[slot]]; } return MUS.res[slot]; }
    return slot + '-' + (c === 'b' ? 'b' : 'a');
  }
  function plain(c) { return c !== 'off' && c !== 'shuffle' && c !== 'all'; }
  function save() { try { localStorage.setItem(C.key + '_mpick', JSON.stringify(P)); } catch (e) { } }
  function pick(slot, c) {
    P[slot] = c; MUS.res[slot] = null; save();
    if (ga() && plain(c)) try { ga().preload(nameOf(slot)); } catch (e) { }
    if (MUS.wslot === slot && !MUS.prev) { MUS.want = null; sync(); }
  }
  function sync() {
    var A = ga(); if (!C || !A || MUS.prev) return;
    try {
      if (!C.on()) { MUS.want = null; A.music(null, { fade: .6 }); return; }
      var w = C.slot() || ['tavern', 0]; if (MUS.wslot !== w[0]) { MUS.wslot = w[0]; MUS.res[w[0]] = null; }
      else if (pickOf(w[0]) === 'all' && !w[1] && MUS.since && Date.now() - MUS.since > ALL_MS) MUS.res[w[0]] = null;
      var n = nameOf(w[0]); if (MUS.want === n) return; MUS.want = n; MUS.since = Date.now(); if (n !== '-') MUS.last = n;
      if (n === '-') { A.music(null, { fade: 1 }); return; }
      A.music(n, { fade: w[1] ? .6 : 1, once: !!w[1] });
      if (w[0] === 'tavern' || w[0] === 'main') setTimeout(function () { try { var nx = w[0] === 'tavern' ? 'main' : 'fight'; if (plain(pickOf(nx))) A.preload(nameOf(nx)); } catch (e) { } }, 4000);
    } catch (e) { }
  }
  function preview(slot) {
    var A = ga(); if (!A || !C.on() || MUS.wslot === slot) return; try { A.unlock(); } catch (e) { }
    var n = nameOf(slot); if (n === '-') return;
    clearTimeout(MUS.prevT); MUS.prev = slot; MUS.want = null; A.music(n, { fade: .5, once: true });
    MUS.prevT = setTimeout(function () { MUS.prev = null; MUS.want = null; sync(); render(); }, 8000);
  }
  function previewStop() { if (!MUS.prev) return; clearTimeout(MUS.prevT); MUS.prev = null; MUS.want = null; sync(); }
  function el(tag, cls, text, at) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; if (at) for (var k in at) e.setAttribute(k, at[k]); return e; }
  function chip(on, at, t) { var b = el('button', 'gxm-chip' + (on ? ' on' : ''), t, at); b.type = 'button'; return b; }
  function render() {
    var b = document.getElementById('gxm-body'); if (!b || !C) return; var on = C.on(), vol = .5; try { vol = ga().state().musVol; } catch (e) { }
    var sig = JSON.stringify([on, P, MUS.prev, MUS.wslot]); if (b._sig === sig) return; b._sig = sig;
    b.innerHTML = '';
    var top = el('div', 'gxm-top'); top.appendChild(chip(on, { 'data-m': 'on' }, 'Music: ' + (on ? 'on' : 'off')));
    var lab = el('label', 'gxm-vol', 'Volume '); var rg = el('input', null, null, { type: 'range', min: '0', max: '1', step: '0.05', value: String(vol), 'aria-label': 'Music volume' }); rg.id = 'gxm-vol'; lab.appendChild(rg); top.appendChild(lab); b.appendChild(top);
    var allOn = C.loops.every(function (k) { return pickOf(k) === 'all'; });
    var t2 = el('div', 'gxm-top'); t2.appendChild(chip(allOn, { 'data-m': 'allsongs' }, '⇄ Shuffle all songs')); b.appendChild(t2);
    C.slots.forEach(function (s) {
      var k = s[0], cur = pickOf(k), act = MUS.wslot === k && on && cur !== 'off', row = el('div', 'gxm-chips');
      ['a', 'b'].forEach(function (v) { row.appendChild(chip(cur === v, { 'data-m': 'pick', 'data-s': k, 'data-c': v }, title(k + '-' + v))); });
      row.appendChild(chip(cur === 'shuffle', { 'data-m': 'pick', 'data-s': k, 'data-c': 'shuffle' }, '⇄ Shuffle'));
      if (isLoop(k)) row.appendChild(chip(cur === 'all', { 'data-m': 'pick', 'data-s': k, 'data-c': 'all' }, '⇄ All songs'));
      row.appendChild(chip(cur === 'off', { 'data-m': 'pick', 'data-s': k, 'data-c': 'off' }, 'Off'));
      if (MUS.prev === k) { var x = chip(false, { 'data-m': 'prevx', 'data-s': k }, '■ Stop preview'); x.classList.add('prev'); row.appendChild(x); }
      else if (!act && cur !== 'off' && on) { var p = chip(false, { 'data-m': 'prev', 'data-s': k }, '▶ Preview'); p.classList.add('prev'); row.appendChild(p); }
      var h = el('h5', null, s[1]); if (act) h.appendChild(el('small', null, ' playing now'));
      var wrap = el('div', 'gxm-row'); wrap.appendChild(h); wrap.appendChild(row); b.appendChild(wrap);
    });
  }
  function onClick(e) {
    var t = e.target && e.target.closest && e.target.closest('[data-m]'); if (!t || !t.closest('#gxm-body')) return; var m = t.dataset.m;
    if (m === 'on') { if (C.toggle) C.toggle(); sync(); }
    else if (m === 'allsongs') { var all = C.loops.every(function (k) { return pickOf(k) === 'all'; }); C.loops.forEach(function (k) { P[k] = all ? 'a' : 'all'; MUS.res[k] = null; }); save(); MUS.want = null; sync(); }
    else if (m === 'pick') pick(t.dataset.s, t.dataset.c);
    else if (m === 'prev') preview(t.dataset.s);
    else if (m === 'prevx') previewStop();
    var b = document.getElementById('gxm-body'); if (b) b._sig = ''; render();
  }
  function css() {
    if (document.getElementById('gxm-css')) return; var s = document.createElement('style'); s.id = 'gxm-css';
    s.textContent = '#gxm-body{font-size:15px}.gxm-top{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 12px}.gxm-vol{display:flex;align-items:center;gap:6px;font-weight:700}.gxm-vol input{width:120px}' +
      '.gxm-row{margin:0 0 12px}.gxm-row h5{margin:0 0 6px;font-size:15px}.gxm-row small{font-weight:600;color:#3fae5a}.gxm-chips{display:flex;flex-wrap:wrap;gap:8px}' +
      '.gxm-chip{min-height:44px;padding:8px 14px;border-radius:22px;border:2px solid currentColor;background:transparent;color:inherit;font:inherit;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px;text-align:left}' +
      '.gxm-chip.on{background:var(--gx-accent,#e0a948);color:#1a1208;border-color:var(--gx-accent,#e0a948)}.gxm-chip.prev{border-style:dashed}';
    document.head.appendChild(s);
  }
  function init(o) {
    C = o; C.loops = C.loops || ['tavern', 'main', 'fight']; P = {};
    try { P = JSON.parse(localStorage.getItem(C.key + '_mpick') || '{}') || {}; } catch (e) { P = {}; }
    css();
    try { if (typeof GX !== 'undefined' && GX.drawer) { var body = el('div'); body.id = 'gxm-body'; GX.drawer('gxm-d', 'Music', body); } } catch (e) { }
    document.addEventListener('click', onClick);
    document.addEventListener('input', function (e) { if (e.target && e.target.id === 'gxm-vol' && ga()) try { ga().setVolume('music', +e.target.value); } catch (x) { } });
    ['pointerdown', 'keydown', 'touchend'].forEach(function (ev) { document.addEventListener(ev, function () { setTimeout(sync, 60); }, { capture: true, passive: true }); });
    setInterval(sync, 800);
    sync();
  }
  function open() { try { if (typeof GX !== 'undefined') { GX.close && GX.close(); var b = document.getElementById('gxm-body'); if (b) b._sig = ''; render(); GX.show('gxm-d'); } } catch (e) { } }
  root.GXMUS = { init: init, sync: sync, open: open, render: render, state: function () { var e = {}; if (C) C.slots.forEach(function (x) { e[x[0]] = pickOf(x[0]); }); return { pick: P, eff: e, want: MUS.want, slot: MUS.wslot }; } };
})(typeof window !== 'undefined' ? window : this);
