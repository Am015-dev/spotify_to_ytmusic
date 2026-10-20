// ===================== part 6: sound (shared gameaudio samples; silent without Web Audio) =====================
// SND_MAP: one line per event. s:null falls back to nothing (the sample may be re-tuned by ear later).
const SND_MAP = { click: { s: 'click', vol: .5 }, clink: { s: 'clink', vol: .7 }, slide: { s: 'slide', vol: .55 }, pass: { s: 'pass', vol: .6 }, pick: { s: 'pick', vol: .6 }, cloche: { s: 'cloche', vol: .65 }, coin: { s: 'coin', vol: .6 },
  tick: { s: 'tick', vol: .4 }, round: { s: 'round', vol: .7 }, win: { s: 'win', vol: .8 }, error: { s: 'error', vol: .5 } };
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
    if (UI.prefs.music === false) { MUS.want = null; GA.music(null); GA.stopLoop && GA.stopLoop('belt'); return; }
    musicSync();
    if (G && UI.started && G.phase !== 'over') { if (GA.loop) GA.loop('belt', { vol: .16, fade: 1.5 }); } else GA.stopLoop && GA.stopLoop('belt');
  } catch (e) { }
}
document.addEventListener('click', e => { const t = e.target.closest('button'); if (t && !t.disabled && !t.matches('.hc,[data-a=serve],[data-a=rsnext]')) snd('click'); }, true);
