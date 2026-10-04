// ===================== part 6: sound (shared gameaudio samples; silent without Web Audio) =====================
// SND_MAP: one line per event. s:null means silent (a sample may be re-tuned by ear later: change s / vol here).
const SND_MAP = { click: { s: 'click', vol: .5 }, play: { s: 'play', vol: .7 }, slide: { s: 'slide', vol: .55 }, pass: { s: 'pass', vol: .6 }, take: { s: 'take', vol: .65 }, ping: { s: 'ping', vol: .7 }, trick: { s: 'trick', vol: .65 },
  done: { s: 'done', vol: .7 }, fail: { s: 'fail', vol: .7 }, deal: { s: 'deal', vol: .6 }, tick: { s: 'tick', vol: .4 }, win: { s: 'win', vol: .8 }, lose: { s: 'lose', vol: .75 }, error: { s: 'error', vol: .5 } };
function snd(name, o) {
  try {
    if (UI.prefs && UI.prefs.sound === false) return;
    const m = SND_MAP[name] || { s: name, vol: 1 }; if (!m.s || !window.GA || !GA.has(m.s)) return;
    const oo = Object.assign({}, o || {}); oo.vol = (oo.vol != null ? oo.vol : 1) * (m.vol != null ? m.vol : 1); GA.play(m.s, oo);
  } catch (e) { }
}
function sndMusic() {
  try {
    if (!window.GA) return;
    if (UI.prefs.music === false || !G || !UI.started) { GA.music(null); GA.stopLoop && GA.stopLoop('sea'); return; }
    GA.music('main', { vol: .3 }); if (GA.loop && GA.has && GA.has('sea')) GA.loop('sea', { vol: .14, fade: 1.5 });
  } catch (e) { }
}
document.addEventListener('click', e => { const t = e.target.closest('button'); if (t && !t.disabled && !t.matches('.hc,.dc,[data-a=play],[data-a=hcard],[data-a=dcard]')) snd('click'); }, true);
