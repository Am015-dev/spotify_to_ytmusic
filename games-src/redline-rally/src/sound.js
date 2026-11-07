/* Redline Rally sound: short synthesized effects (own Web Audio context, shared with GA) + music through gameaudio.js (GA) and gx-music.js (GXMUS).
   Music slots menu / game / tense / victory / defeat read 'music/<slot>-<a|b>.mp3' and stay silent until those files exist (cues: next-wave/music/redline-rally/cues-wave1.json).
   One mute toggle (#sndB, #sndT) switches effects and music together; remembered in localStorage 'rr_snd'. */
var SND = { ctx: null, on: true, nb: null, vol: 0.6, last: {} };
try { SND.on = localStorage.getItem('rr_snd') !== '0'; } catch (e) { }
var MUS_SLOTS = [['menu', 'Menu'], ['game', 'Race'], ['tense', 'Last lap'], ['victory', 'Victory'], ['defeat', 'Defeat']];
function audioCtx() {
  if (SND.ctx) return SND.ctx; var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
  try {
    var c = SND.ctx = new AC(), comp = c.createDynamicsCompressor(); comp.connect(c.destination);
    SND.master = c.createGain(); SND.master.gain.value = SND.on ? SND.vol : 0; SND.master.connect(comp);
    var len = c.sampleRate, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0); for (var i = 0; i < len; i++) d[i] = Math.random() * 2 - 1; SND.nb = b;
  } catch (e) { SND.ctx = null; }
  return SND.ctx;
}
function wake() { var c = audioCtx(); if (c && c.state === 'suspended') try { c.resume(); } catch (e) { } }
['pointerdown', 'keydown', 'touchend'].forEach(function (ev) { document.addEventListener(ev, wake, { capture: true, passive: true }); });
function tone(f, dur, o) {
  var c = SND.ctx; if (!c) return; o = o || {}; var t = c.currentTime + (o.at || 0), osc = c.createOscillator(), g = c.createGain();
  osc.type = o.type || 'sine'; osc.frequency.setValueAtTime(f, t); if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t + dur);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.v || 0.25, t + (o.a || 0.006)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g); g.connect(SND.master); osc.start(t); osc.stop(t + dur + 0.05);
}
function noise(dur, o) {
  var c = SND.ctx; if (!c) return; o = o || {}; var t = c.currentTime + (o.at || 0), s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
  s.buffer = SND.nb; fl.type = o.ft || 'bandpass'; fl.frequency.setValueAtTime(o.f || 2000, t); if (o.fto) fl.frequency.exponentialRampToValueAtTime(o.fto, t + dur); fl.Q.value = o.q || 1;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(o.v || 0.2, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(fl); fl.connect(g); g.connect(SND.master); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
}
var SFX = {
  tap: function () { tone(660, 0.05, { type: 'square', v: 0.08 }); },
  gear: function () { tone(180, 0.09, { type: 'square', v: 0.1, to: 260 }); noise(0.05, { f: 1500, v: 0.08 }); },
  card: function () { noise(0.06, { f: 3000, q: 2, v: 0.2 }); tone(880, 0.05, { type: 'triangle', v: 0.1 }); },
  go: function () { tone(70, 0.55, { type: 'sawtooth', v: 0.18, to: 210 }); noise(0.5, { ft: 'lowpass', f: 300, fto: 1800, v: 0.1 }); },
  burn: function () { noise(0.35, { f: 2500, fto: 500, q: 0.8, v: 0.25 }); tone(110, 0.3, { type: 'sawtooth', v: 0.15, to: 60 }); },
  clean: function () { tone(740, 0.08, { type: 'triangle', v: 0.1 }); tone(990, 0.1, { type: 'triangle', v: 0.1, at: 0.07 }); },
  spin: function () { tone(1100, 0.7, { type: 'sawtooth', v: 0.14, to: 160 }); noise(0.7, { f: 3500, fto: 600, q: 3, v: 0.18 }); },
  boost: function () { tone(300, 0.35, { type: 'sawtooth', v: 0.16, to: 1100 }); noise(0.3, { f: 800, fto: 4000, v: 0.14 }); },
  slip: function () { noise(0.4, { f: 600, fto: 3500, q: 1.5, v: 0.2 }); },
  win: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, 0.28, { type: 'triangle', v: 0.2, at: i * 0.11 }); }); tone(1047, 0.7, { type: 'sine', v: 0.15, at: 0.5 }); },
  lose: function () { [392, 330, 262, 196].forEach(function (f, i) { tone(f, 0.3, { type: 'triangle', v: 0.18, at: i * 0.16 }); }); }
};
function sfx(name) {
  if (!SND.on || !SFX[name]) return; var now = Date.now(); if (SND.last[name] && now - SND.last[name] < 40) return; SND.last[name] = now;
  try { if (audioCtx()) { wake(); SFX[name](); } } catch (e) { }
}
function sndLabel() { return SND.on ? '♪ On' : '♪ Off'; }
function setSound(on, quiet) {
  SND.on = !!on; try { localStorage.setItem('rr_snd', on ? '1' : '0'); } catch (e) { }
  if (SND.master) SND.master.gain.value = SND.on ? SND.vol : 0;
  try { if (window.GA) { GA.setSfx(SND.on); GA.setMusic(SND.on); } } catch (e) { }
  try { if (window.GXMUS) GXMUS.sync(); } catch (e) { }
  document.querySelectorAll('[data-snd]').forEach(function (b) { b.textContent = sndLabel(); b.setAttribute('aria-pressed', SND.on ? 'true' : 'false'); });
  if (SND.on && !quiet) sfx('tap');
}
/* which music slot plays now: title -> menu, race -> game, last lap of the race -> tense, result -> victory or defeat (second item 1 = play once) */
function musicSlot() {
  if (typeof G === 'undefined' || !G || !$('#title').hidden) return ['menu', 0];
  if (G.over) { var w = G.cars[G.rank[0]]; return [w && w.human ? 'victory' : 'defeat', 1]; }
  var lead = G.cars.reduce(function (m, c) { return Math.max(m, c.pos); }, 0);
  return [lead >= total(G) - 12 ? 'tense' : 'game', 0];   /* tense = the leader is within 12 spaces of the finish */
}
function soundBoot() {
  var mus = {}; MUS_SLOTS.forEach(function (s) { ['a', 'b'].forEach(function (v) { var n = s[0] + '-' + v; if ((window.RR_MUSIC || []).indexOf(n) >= 0) mus[n] = 'url:music/' + n + '.mp3'; }); });   /* listed at build time from games/redline-rally/music/ */
  try { if (window.GA) { GA.init({ sfx: {}, music: mus, key: 'rr', ctx: function () { return audioCtx(); } }); GA.setSfx(SND.on); GA.setMusic(SND.on); } } catch (e) { }
  try { if (window.GXMUS) GXMUS.init({ key: 'rr', slots: MUS_SLOTS, loops: ['menu', 'game', 'tense'], slot: musicSlot, on: function () { return SND.on; }, toggle: function () { setSound(!SND.on); } }); } catch (e) { }
  document.querySelectorAll('[data-snd]').forEach(function (b) { b.onclick = function () { setSound(!SND.on); }; });
  setSound(SND.on, true);
}
