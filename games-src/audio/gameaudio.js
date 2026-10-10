/* gameaudio.js - shared sample playback for the single-file board games.
 * Plain script (no modules). Defines window.GA. Every public call is wrapped so it never throws;
 * without Web Audio (jsdom, very old browsers) it stays silent and GA.has() returns false,
 * so games keep using their synthesized sounds:  GA.has(x) ? GA.play(x) : oldSynth(x)
 *
 *   GA.init({sfx:{name:b64mp3}, music:{name:b64mp3}, key:'prefix', duck:['boom',..], ctx:AudioContext|fn})
 *   GA.play(name, {vol, rate, pan, jitter, cooldown, duck, at})  -> true if it played
 *   GA.loop(name, {vol, fade}) / GA.stopLoop(name, {fade})         ambience beds
 *   GA.music(name|null, {vol, fade})                                 cross-fading background track
 *   GA.setSfx(on) GA.setMusic(on) GA.setVolume('sfx'|'music', 0..1)  persisted in localStorage
 *   GA.setVolume('master', 0..1)  one level over everything (the shared settings panel sets it; default 1)
 *   GA.has(name) GA.playing() GA.state() GA.unlock() GA.names() GA.duration(name)
 * Samples are decoded lazily on the first user gesture (atob -> ArrayBuffer -> decodeAudioData, no fetch).
 */
(function (root) {
  'use strict';
  var NOOP = function () {};
  var S = {
    inited: false, key: 'ga', src: {}, kind: {}, buf: {}, failed: {}, pending: {},
    ctx: null, ctxOpt: null, out: null, sfxBus: null, musBus: null, duckBus: null,
    sfxOn: true, musOn: true, sfxVol: 0.8, musVol: 0.5, masterVol: 1, last: {}, loops: {},
    cur: null, curName: null, wantMusic: null, duckSet: {}, duckUntil: 0, unlocked: false, decoding: false
  };
  var DEFAULT_DUCK = ['win', 'lose', 'levelup', 'level', 'boom', 'ko', 'thunder', 'roar', 'smash', 'stomp', 'door', 'death', 'crit', 'crumble'];

  function safe(fn, dflt) {
    return function () { try { return fn.apply(null, arguments); } catch (e) { return dflt; } };
  }
  function lsGet(k, d) { try { var v = root.localStorage && root.localStorage.getItem(S.key + '_ga_' + k); return v == null ? d : v; } catch (e) { return d; } }
  function lsSet(k, v) { try { root.localStorage && root.localStorage.setItem(S.key + '_ga_' + k, String(v)); } catch (e) {} }
  function clamp(v, a, b) { v = +v; return isFinite(v) ? Math.max(a, Math.min(b, v)) : a; }

  function b64ToBuf(b64) {
    var s = String(b64 || '');
    var i = s.indexOf('base64,'); if (i >= 0) s = s.slice(i + 7);
    if (typeof root.atob !== 'function') return null;
    var bin = root.atob(s), n = bin.length, u = new Uint8Array(n);
    for (var j = 0; j < n; j++) u[j] = bin.charCodeAt(j);
    return u.buffer;
  }

  function getCtx() {
    if (S.ctx) return S.ctx;
    var c = null;
    if (S.ctxOpt) c = typeof S.ctxOpt === 'function' ? S.ctxOpt() : S.ctxOpt;
    if (!c) {
      var AC = root.AudioContext || root.webkitAudioContext;
      if (!AC) return null;
      c = new AC();
    }
    if (!c || typeof c.createGain !== 'function' || typeof c.decodeAudioData !== 'function') return null;
    S.ctx = c;
    S.out = c.createGain(); S.out.connect(c.destination);
    S.sfxBus = c.createGain(); S.sfxBus.connect(S.out);
    S.duckBus = c.createGain(); S.duckBus.connect(S.out);
    S.musBus = c.createGain(); S.musBus.connect(S.duckBus);
    applyVol();
    return c;
  }

  function applyVol() {
    if (!S.ctx) return;
    var t = S.ctx.currentTime;
    S.sfxBus.gain.setTargetAtTime(S.sfxOn ? S.sfxVol : 0, t, 0.02);
    S.musBus.gain.setTargetAtTime(S.musOn ? S.musVol : 0, t, 0.08);
    S.out.gain.setTargetAtTime(S.masterVol, t, 0.02);
  }

  // Loops: skip encoder padding / near-silence at the edges so MP3 loops don't gap.
  function loopPoints(b) {
    var d = b.getChannelData(0), n = d.length, lim = Math.min(n >> 2, Math.floor(b.sampleRate * 0.1)), s = 0, e = n - 1, th = 1e-4;
    while (s < lim && Math.abs(d[s]) < th) s++;
    while (e > n - lim && Math.abs(d[e]) < th) e--;
    return [s / b.sampleRate, (e + 1) / b.sampleRate];
  }

  function decodeOne(name, done) {
    var c = S.ctx; done = done || NOOP;
    if (!c || S.buf[name] || S.failed[name]) return done();
    if (S.pending[name]) { S.pending[name].push(done); return; }
    S.pending[name] = [done];
    var finish = function (b) {
      if (b && b.duration > 0) { S.buf[name] = b; b._lp = loopPoints(b); } else S.failed[name] = 1;
      var q = S.pending[name] || []; delete S.pending[name];
      for (var i = 0; i < q.length; i++) { try { q[i](); } catch (e) {} }
    };
    var dec = function (ab) {
      if (!ab) return finish(null);
      try {
        var p = c.decodeAudioData(ab, function (b) { finish(b); }, function () { finish(null); });
        if (p && typeof p.then === 'function') p.then(NOOP, function () { finish(null); });
      } catch (e) { finish(null); }
    };
    // 'url:music/x.mp3' = a separate file, fetched when first wanted (keeps big tracks out of the page)
    if (isUrl(name)) {
      try { root.fetch(S.src[name].slice(4)).then(function (r) { if (!r.ok) throw 0; return r.arrayBuffer(); }).then(dec, function () { finish(null); }); }
      catch (e) { finish(null); }
      return;
    }
    var ab;
    try { ab = b64ToBuf(S.src[name]); } catch (e) { ab = null; }
    dec(ab);
  }
  function isUrl(n) { return typeof S.src[n] === 'string' && S.src[n].slice(0, 4) === 'url:' && typeof root.fetch === 'function'; }

  function decodeAll() {
    if (S.decoding || !S.ctx) return;
    S.decoding = true;
    // music first (the wanted track), then effects in small serial steps to keep the main thread free
    var names = Object.keys(S.src).sort(function (a, b) {
      var pa = a === S.wantMusic ? 0 : S.kind[a] === 'sfx' ? 1 : 2, pb = b === S.wantMusic ? 0 : S.kind[b] === 'sfx' ? 1 : 2;
      return pa - pb;
    });
    var i = 0;
    (function next() {
      if (i >= names.length) { S.decoding = false; return; }
      var n = names[i++];
      if (isUrl(n) && n !== S.wantMusic) return next();
      decodeOne(n, function () {
        if (n === S.wantMusic && S.musOn && S.curName !== n) startMusic(n, S._musOpt || {});
        setTimeout(next, 0);
      });
    })();
  }

  function unlock() {
    if (!S.inited) return false;
    var c = getCtx(); if (!c) return false;
    if (c.state === 'suspended' && typeof c.resume === 'function') { try { var p = c.resume(); if (p && p.then) p.then(NOOP, NOOP); } catch (e) {} }
    if (!S.unlocked) { S.unlocked = true; decodeAll(); }
    return true;
  }

  function onGesture() { safe(unlock)(); }
  function onVis() {
    try {
      if (!S.ctx || !root.document) return;
      if (root.document.hidden) { if (S.ctx.state === 'running' && S.ctx.suspend) S.ctx.suspend().then(NOOP, NOOP); }
      else if (S.unlocked && S.ctx.state === 'suspended' && S.ctx.resume) S.ctx.resume().then(NOOP, NOOP);
    } catch (e) {}
  }

  function init(o) {
    o = o || {};
    if (o.key) S.key = String(o.key);
    if (o.ctx) S.ctxOpt = o.ctx;
    var add = function (m, k) { if (!m) return; for (var n in m) if (Object.prototype.hasOwnProperty.call(m, n) && m[n]) { S.src[n] = m[n]; S.kind[n] = k; } };
    add(o.sfx, 'sfx'); add(o.music, 'music');
    var d = o.duck || DEFAULT_DUCK; S.duckSet = {}; for (var i = 0; i < d.length; i++) S.duckSet[d[i]] = 1;
    S.sfxOn = lsGet('sfx', '1') !== '0'; S.musOn = lsGet('mus', '1') !== '0';
    S.sfxVol = clamp(lsGet('sfxvol', o.sfxVol != null ? o.sfxVol : 0.8), 0, 1);
    S.musVol = clamp(lsGet('musvol', o.musVol != null ? o.musVol : 0.5), 0, 1);
    S.masterVol = clamp(lsGet('mastervol', 1), 0, 1);
    if (!S.inited && root.document && root.document.addEventListener) {
      ['pointerdown', 'keydown', 'touchstart', 'mousedown'].forEach(function (ev) {
        root.document.addEventListener(ev, onGesture, { capture: true, passive: true });
      });
      root.document.addEventListener('visibilitychange', onVis);
    }
    S.inited = true;
    if (S.unlocked) { S.decoding = false; decodeAll(); }
    return true;
  }

  function has(name) { return !!(S.buf[name]); }

  function duck(sec) {
    if (!S.ctx || !S.duckBus) return;
    var c = S.ctx, t = c.currentTime, g = S.duckBus.gain, end = t + Math.max(0.2, sec);
    g.cancelScheduledValues(t); g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(0.35, t + 0.06);
    S.duckUntil = Math.max(S.duckUntil, end);
    g.setValueAtTime(0.35, S.duckUntil); g.linearRampToValueAtTime(1, S.duckUntil + 0.6);
  }

  function play(name, o) {
    o = o || {};
    var b = S.buf[name], c = S.ctx;
    if (!b || !c || !S.sfxOn || c.state === 'closed') return false;
    var now = Date.now(), cd = o.cooldown != null ? o.cooldown : 45;
    if (now - (S.last[name] || 0) < cd) return false;
    S.last[name] = now;
    var src = c.createBufferSource(); src.buffer = b;
    var j = o.jitter != null ? o.jitter : 0.04;
    var rate = clamp(o.rate != null ? o.rate : 1, 0.25, 4) * (1 + (Math.random() * 2 - 1) * j);
    src.playbackRate.value = rate;
    var g = c.createGain(); g.gain.value = clamp(o.vol != null ? o.vol : 1, 0, 2) * (1 - Math.random() * j * 1.5);
    src.connect(g);
    var last = g;
    if (o.pan && c.createStereoPanner) { var p = c.createStereoPanner(); p.pan.value = clamp(o.pan, -1, 1); g.connect(p); last = p; }
    last.connect(S.sfxBus);
    src.start(c.currentTime + Math.max(0, +o.at || 0));
    if (o.duck || (o.duck !== false && S.duckSet[name])) duck(b.duration / rate);
    return true;
  }

  function loop(name, o) {
    o = o || {};
    var b = S.buf[name], c = S.ctx;
    if (!b || !c) return false;
    if (S.loops[name]) { S.loops[name].g.gain.setTargetAtTime(clamp(o.vol != null ? o.vol : 1, 0, 2), c.currentTime, 0.1); return true; }
    var src = c.createBufferSource(); src.buffer = b; src.loop = !o.once;
    if (!o.once) { src.loopStart = b._lp[0]; src.loopEnd = b._lp[1]; }
    var g = c.createGain(), t = c.currentTime, f = o.fade != null ? o.fade : 0.8;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(clamp(o.vol != null ? o.vol : 1, 0, 2), t + Math.max(0.01, f));
    src.connect(g); g.connect(S.sfxBus); src.start(t, b._lp[0]);
    S.loops[name] = { src: src, g: g };
    return true;
  }

  function stopLoop(name, o) {
    o = o || {};
    var L = S.loops[name], c = S.ctx; if (!L || !c) return false;
    delete S.loops[name];
    var t = c.currentTime, f = o.fade != null ? o.fade : 0.8;
    L.g.gain.cancelScheduledValues(t); L.g.gain.setValueAtTime(L.g.gain.value, t); L.g.gain.linearRampToValueAtTime(0.0001, t + Math.max(0.01, f));
    try { L.src.stop(t + Math.max(0.01, f) + 0.05); } catch (e) {}
    return true;
  }

  function stopMusic(f) {
    var M = S.cur, c = S.ctx; S.cur = null; S.curName = null;
    if (!M || !c) return;
    var t = c.currentTime;
    M.g.gain.cancelScheduledValues(t); M.g.gain.setValueAtTime(M.g.gain.value, t); M.g.gain.linearRampToValueAtTime(0.0001, t + f);
    try { M.src.stop(t + f + 0.05); } catch (e) {}
  }

  function startMusic(name, o) {
    var b = S.buf[name], c = S.ctx; if (!b || !c) return false;
    var f = o.fade != null ? o.fade : 1.5;
    if (S.curName === name) return true;
    stopMusic(f);
    var src = c.createBufferSource(); src.buffer = b; src.loop = !o.once;
    if (!o.once) { src.loopStart = b._lp[0]; src.loopEnd = b._lp[1]; }
    var g = c.createGain(), t = c.currentTime;
    g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(clamp(o.vol != null ? o.vol : 1, 0, 2), t + Math.max(0.01, f));
    src.connect(g); g.connect(S.musBus); src.start(t, b._lp[0]);
    S.cur = { src: src, g: g }; S.curName = name;
    return true;
  }

  // GA.music(name) remembers the wish: it starts once decoded / unlocked and music is on.
  function music(name, o) {
    o = o || {}; S._musOpt = o;
    if (!name) { S.wantMusic = null; stopMusic(o.fade != null ? o.fade : 1.2); return true; }
    S.wantMusic = name;
    if (!S.musOn || !S.ctx) return false;
    if (!S.buf[name]) { decodeOne(name, function () { if (S.wantMusic === name && S.musOn) startMusic(name, o); }); return false; }
    return startMusic(name, o);
  }

  // hold the music bus at `level` (0..1) until duckTo(1) -- used while a video with its own sound plays
  function duckTo(level, f) {
    if (!S.ctx || !S.duckBus) return false;
    var g = S.duckBus.gain, t = S.ctx.currentTime;
    g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(clamp(level, 0, 1), t + Math.max(0.02, f != null ? f : 0.3));
    S.duckUntil = 0; return true;
  }
  function preload(name) { if (S.ctx && S.src[name] && !S.buf[name]) decodeOne(name); return true; }

  function setSfx(on) {
    S.sfxOn = !!on; lsSet('sfx', S.sfxOn ? 1 : 0); applyVol();
    if (!S.sfxOn) for (var n in S.loops) stopLoop(n, { fade: 0.2 });
    return S.sfxOn;
  }
  function setMusic(on) {
    S.musOn = !!on; lsSet('mus', S.musOn ? 1 : 0); applyVol();
    if (!S.musOn) stopMusic(0.6); else if (S.wantMusic) music(S.wantMusic, S._musOpt || {});
    return S.musOn;
  }
  function setVolume(kind, v) {
    v = clamp(v, 0, 1);
    if (kind === 'master') { S.masterVol = v; lsSet('mastervol', v); } else if (kind === 'music') { S.musVol = v; lsSet('musvol', v); } else { S.sfxVol = v; lsSet('sfxvol', v); }
    applyVol(); return v;
  }
  function state() {
    return { sfx: S.sfxOn, music: S.musOn, sfxVol: S.sfxVol, musVol: S.musVol, masterVol: S.masterVol, audio: !!S.ctx,
      ctxState: S.ctx ? S.ctx.state : 'none', decoded: Object.keys(S.buf).length, failed: Object.keys(S.failed),
      total: Object.keys(S.src).length, playing: S.curName, loops: Object.keys(S.loops) };
  }
  function names() { return Object.keys(S.src); }
  function duration(name) { return S.buf[name] ? S.buf[name].duration : 0; }

  root.GA = {
    init: safe(init, false), play: safe(play, false), has: safe(has, false),
    loop: safe(loop, false), stopLoop: safe(stopLoop, false), music: safe(music, false),
    setSfx: safe(setSfx, false), setMusic: safe(setMusic, false), setVolume: safe(setVolume, 0),
    playing: safe(function () { return S.curName; }, null),
    state: safe(state, {}), unlock: safe(unlock, false), names: safe(names, []), duration: safe(duration, 0),
    duckTo: safe(duckTo, false), preload: safe(preload, false),
    decode: safe(function (n, cb) { decodeOne(n, cb); return true; }, false)
  };
})(typeof window !== 'undefined' ? window : this);
