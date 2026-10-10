// ===================== part 6: sound (shared gameaudio samples; silent without Web Audio) =====================
// SND_MAP: one line per event. s:null means silent (a sample may be re-tuned by ear later: change s / vol here).
const SND_MAP = { click: { s: 'click', vol: .5 }, play: { s: 'play', vol: .7 }, slide: { s: 'slide', vol: .55 }, pass: { s: 'pass', vol: .6 }, take: { s: 'take', vol: .65 }, ping: { s: 'ping', vol: .7 }, trick: { s: 'trick', vol: .65 },
  done: { s: 'done', vol: .7 }, fail: { s: 'fail', vol: .7 }, deal: { s: 'deal', vol: .6 }, tick: { s: 'tick', vol: .4 }, win: { s: 'win', vol: .8 }, lose: { s: 'lose', vol: .75 }, error: { s: 'error', vol: .5 } };
// fallback when the sample bundle is missing (or Web Audio samples did not load): a few quiet oscillator notes
let SYN = null;
const SYN_N = { click: [[660, .04, 'square', .03]], play: [[220, .07, 'triangle', .08]], slide: [[300, .1, 'sine', .04]], pass: [[260, .12, 'sine', .04]], take: [[520, .08, 'triangle', .06]], ping: [[880, .3, 'sine', .1], [1320, .25, 'sine', .04]],
  trick: [[330, .08, 'triangle', .07], [440, .1, 'triangle', .07]], done: [[523, .1, 'sine', .08], [784, .18, 'sine', .08]], fail: [[300, .15, 'sawtooth', .05], [200, .3, 'sawtooth', .05]], deal: [[400, .05, 'square', .02]], tick: [[1200, .02, 'square', .02]],
  win: [[523, .14, 'triangle', .1], [659, .14, 'triangle', .1], [784, .3, 'triangle', .1]], lose: [[392, .2, 'sine', .09], [294, .4, 'sine', .09]], error: [[140, .12, 'square', .05]] };
function synth(name, vol) {
  try {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC || /jsdom/i.test(navigator.userAgent || '')) return; const seq = SYN_N[name]; if (!seq) return;
    if (!SYN) SYN = new AC(); if (SYN.state === 'suspended') SYN.resume(); let t = SYN.currentTime;
    seq.forEach(([f, d, w, g]) => { const o = SYN.createOscillator(), a = SYN.createGain(); o.type = w; o.frequency.value = f; a.gain.setValueAtTime(0, t); a.gain.linearRampToValueAtTime(g * vol, t + .01); a.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(a); a.connect(SYN.destination); o.start(t); o.stop(t + d + .02); t += Math.min(d, .12); });
  } catch (e) { }
}
function snd(name, o) {
  try {
    if (UI.prefs && UI.prefs.sound === false) return;
    const m = SND_MAP[name] || { s: name, vol: 1 }; if (!m.s) return; if (!window.GA || !GA.has(m.s)) { synth(name, (o && o.vol != null ? o.vol : 1) * (m.vol != null ? m.vol : 1)); return; }
    const oo = Object.assign({}, o || {}); oo.vol = (oo.vol != null ? oo.vol : 1) * (m.vol != null ? m.vol : 1); GA.play(m.s, oo);
  } catch (e) { }
}
function sndMusic() {
  try {
    if (!window.GA) return;
    if (typeof musicSync === 'function') musicSync(); else if (UI.prefs.music === false || !G || !UI.started) GA.music(null); else GA.music('main-a');
    if (UI.prefs.music === false || !G || !UI.started) { GA.stopLoop && GA.stopLoop('sea'); return; }
    if (GA.loop && GA.has && GA.has('sea')) GA.loop('sea', { vol: .14, fade: 1.5 });
  } catch (e) { }
}
document.addEventListener('click', e => { const t = e.target.closest('button'); if (t && !t.disabled && !t.matches('.hc,.dc,[data-a=play],[data-a=hcard],[data-a=dcard]')) snd('click'); }, true);
