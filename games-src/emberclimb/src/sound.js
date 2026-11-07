// Emberclimb sound: short synthesized effects (WebAudio, like the live-synth fallback of the other shelf games) + music slots through GXMUS/GA.
// Music files are optional: slots menu / map / fight / boss / victory / defeat stay silent until games/emberclimb/music/<slot>-<a|b>.mp3 exist.
(function () {
  var SND = window.SND = { on: true, music: true, ctx: null, bus: null };
  try { SND.on = localStorage.getItem('ec_snd') !== '0'; SND.music = localStorage.getItem('ec_mus') !== '0'; } catch (e) { }
  function ctx() {
    if (SND.ctx) { if (SND.ctx.state === 'suspended') try { SND.ctx.resume(); } catch (e) { } return SND.ctx; }
    var C = window.AudioContext || window.webkitAudioContext; if (!C) return null;
    try { SND.ctx = new C(); SND.bus = SND.ctx.createGain(); SND.bus.gain.value = .5; SND.bus.connect(SND.ctx.destination); } catch (e) { SND.ctx = null; }
    return SND.ctx;
  }
  function tone(f, dur, o) {
    o = o || {}; var c = ctx(); if (!c) return; var t = c.currentTime + (o.at || 0), osc = c.createOscillator(), g = c.createGain();
    osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t); if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.v || .25, t + (o.a || .01)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g); g.connect(SND.bus); osc.start(t); osc.stop(t + dur + .05);
  }
  function noise(dur, o) {
    o = o || {}; var c = ctx(); if (!c) return; var t = c.currentTime + (o.at || 0), n = Math.max(1, Math.floor(c.sampleRate * dur)), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    var s = c.createBufferSource(), g = c.createGain(), fl = c.createBiquadFilter(); s.buffer = b; fl.type = o.f || 'lowpass'; fl.frequency.value = o.hz || 1800;
    g.gain.value = o.v || .3; s.connect(fl); fl.connect(g); g.connect(SND.bus); s.start(t);
  }
  var SY = {
    play: function () { tone(520, .09, { type: 'triangle', to: 780, v: .18 }); },
    hit: function () { noise(.14, { hz: 2400, v: .35 }); tone(180, .12, { type: 'square', to: 70, v: .2 }); },
    hurt: function () { tone(140, .22, { type: 'sawtooth', to: 55, v: .26 }); noise(.12, { hz: 900, v: .3 }); },
    block: function () { tone(880, .07, { type: 'square', v: .14 }); tone(1320, .1, { type: 'triangle', v: .12, at: .04 }); },
    buff: function () { tone(440, .12, { type: 'sine', to: 660, v: .18 }); tone(660, .14, { type: 'sine', to: 990, v: .14, at: .08 }); },
    heal: function () { tone(600, .14, { v: .15 }); tone(800, .16, { v: .15, at: .1 }); },
    win: function () { [523, 659, 784, 1046].forEach(function (f, i) { tone(f, .22, { type: 'triangle', v: .2, at: i * .12 }); }); },
    lose: function () { [392, 330, 262, 196].forEach(function (f, i) { tone(f, .3, { type: 'sawtooth', v: .16, at: i * .18 }); }); },
    click: function () { tone(700, .04, { type: 'square', v: .08 }); }
  };
  var last = {};
  window.SFX = function (name) {
    if (!SND.on || !SY[name]) return; var now = Date.now(); if (last[name] && now - last[name] < 70) return; last[name] = now;
    try { SY[name](); } catch (e) { }
  };
  SND.toggle = function () { SND.on = !SND.on; SND.music = SND.on; try { localStorage.setItem('ec_snd', SND.on ? '1' : '0'); localStorage.setItem('ec_mus', SND.music ? '1' : '0'); } catch (e) { } if (SND.on) { ctx(); SFX('click'); } try { if (window.GA) { GA.setSfx(SND.on); GA.setMusic(SND.music); } if (window.GXMUS) GXMUS.sync(); } catch (e) { } };
  // ---- music slots (silent until the files exist; the build lists the files that are present)
  var SLOTS = [['menu', 'Menu'], ['map', 'Map'], ['fight', 'Fight'], ['boss', 'Boss'], ['victory', 'Victory'], ['defeat', 'Defeat']];
  window.EC_SLOTS = SLOTS;
  function slot() {
    var g = window.EC && EC.E && EC.E.G(); if (!g || (window.UI && UI.mode === 'title')) return ['menu', 0];
    if (g.scr === 'over') return [g.won ? 'victory' : 'defeat', 1];
    if (g.scr === 'battle' && g.b) return [g.b.kind === 'b' ? 'boss' : 'fight', 0];
    return ['map', 0];
  }
  try {
    var src = {}, have = window.MUSIC_PRESENT || []; have.forEach(function (n) { src[n] = 'url:music/' + n + '.mp3'; });
    if (window.GA) GA.init({ music: src, key: 'ec', musVol: .45 });
    if (window.GA) { GA.setSfx(SND.on); GA.setMusic(SND.music); }
    if (window.GXMUS) GXMUS.init({ key: 'ec', slots: SLOTS, loops: ['menu', 'map', 'fight', 'boss'], slot: slot, on: function () { return SND.music; } });
  } catch (e) { }
})();
