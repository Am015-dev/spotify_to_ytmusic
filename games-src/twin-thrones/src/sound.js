// Twin Thrones sound: short synthesized effects (Web Audio, no files) + music slots through the shared GA / GXMUS helpers. (FLAG: none)
// Music: games/twin-thrones/music/<slot>-<a|b>.mp3 for slots menu, age1, age2, age3, victory, defeat. build.py lists the files that exist
// (TT_MUSIC), so a missing file means silence, never a 404. Cue list: games-src/next-wave/music/twin-thrones/cues-wave1.json.
var SND = (function () {
  var ctx = null, master = null, on = true, last = {};
  try { on = localStorage.getItem('tt_snd') !== '0'; } catch (e) { }
  function init() {
    if (ctx) return true; var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
    try { ctx = new AC(); var comp = ctx.createDynamicsCompressor(); comp.connect(ctx.destination); master = ctx.createGain(); master.gain.value = 0.55; master.connect(comp); } catch (e) { ctx = null; return false; }
    return true;
  }
  function env(g, t, a, v, d) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(v, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + d); }
  function tone(f, d, o) {
    o = o || {}; var t = ctx.currentTime + (o.at || 0), osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t); if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + d);
    osc.connect(g); g.connect(master); env(g, t, o.a || 0.006, o.v || 0.3, d); osc.start(t); osc.stop(t + d + 0.05);
  }
  function noise(d, o) {
    o = o || {}; var t = ctx.currentTime + (o.at || 0), n = Math.max(1, Math.floor(ctx.sampleRate * d)), b = ctx.createBuffer(1, n, ctx.sampleRate), a = b.getChannelData(0);
    for (var i = 0; i < n; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = b; f.type = o.type || 'bandpass'; f.frequency.value = o.f || 1800;
    s.connect(f); f.connect(g); g.connect(master); env(g, t, 0.004, o.v || 0.25, d); s.start(t);
  }
  var FX = {
    tick: function () { tone(880, 0.05, { v: 0.12, type: 'triangle' }); },
    take: function () { noise(0.09, { f: 2400, v: 0.22 }); tone(520, 0.1, { to: 340, v: 0.16, type: 'triangle' }); },           // slide a card off the pyramid
    build: function () { tone(196, 0.16, { type: 'square', v: 0.12 }); tone(262, 0.12, { at: 0.05, type: 'square', v: 0.1 }); tone(392, 0.22, { at: 0.12, type: 'triangle', v: 0.2 }); },
    coin: function () { tone(1320, 0.1, { v: 0.2, type: 'square' }); tone(1760, 0.22, { at: 0.07, v: 0.18, type: 'square' }); },
    wonder: function () { [262, 330, 392, 523].forEach(function (f, i) { tone(f, 0.3, { at: i * 0.07, v: 0.18, type: 'triangle' }); }); },
    pawn: function () { tone(110, 0.28, { to: 70, v: 0.4, type: 'sawtooth' }); noise(0.25, { f: 300, v: 0.3, type: 'lowpass' }); },
    win: function () { [392, 494, 587, 784].forEach(function (f, i) { tone(f, 0.35, { at: i * 0.12, v: 0.22, type: 'triangle' }); }); tone(1568, 0.6, { at: 0.5, v: 0.12 }); },
    lose: function () { [330, 262, 208, 165].forEach(function (f, i) { tone(f, 0.4, { at: i * 0.16, v: 0.2, type: 'sawtooth' }); }); }
  };
  function play(n) {
    if (!on || !FX[n]) return; var now = Date.now(); if (last[n] && now - last[n] < 70) return; last[n] = now;
    try { if (!init()) return; if (ctx.state === 'suspended') ctx.resume(); FX[n](); } catch (e) { }
  }
  function setOn(v) { on = !!v; try { localStorage.setItem('tt_snd', on ? '1' : '0'); } catch (e) { } sync(); }
  // ---- music slots (all optional)
  var SLOTS = [['menu', 'Menu'], ['age1', 'Age I'], ['age2', 'Age II'], ['age3', 'Age III'], ['victory', 'Victory'], ['defeat', 'Defeat']];
  var wantSlot = function () { return ['menu', 0]; };
  function haveMusic() { return typeof TT_MUSIC !== 'undefined' && Object.keys(TT_MUSIC).length > 0; }
  function sync() { try { if (typeof GXMUS !== 'undefined' && haveMusic()) GXMUS.sync(); } catch (e) { } }
  function initMusic(slotFn) {
    wantSlot = slotFn; if (!haveMusic()) return;
    try { if (typeof GA !== 'undefined') GA.init({ sfx: {}, music: TT_MUSIC, key: 'tt', ctx: function () { return init() ? ctx : null; } }); } catch (e) { }
    try { if (typeof GXMUS !== 'undefined') GXMUS.init({ key: 'tt', slots: SLOTS, loops: ['menu', 'age1', 'age2', 'age3'], slot: function () { return wantSlot(); }, on: function () { return on; }, toggle: function () { setOn(!on); } }); } catch (e) { }
  }
  function openPicker() { try { GXMUS.open(); } catch (e) { } }
  return { play: play, isOn: function () { return on; }, setOn: setOn, initMusic: initMusic, sync: sync, hasMusic: haveMusic, openPicker: openPicker, slots: SLOTS };
})();
