// ===================== part 6: sound (shared gameaudio samples; silent without Web Audio) =====================
// SND_MAP: one line per event. s:null = silent. The user has not auditioned these by ear: re-tune vol here.
const SND_MAP = { click: { s: 'click', vol: .5 }, dieland: { s: 'dieland', vol: .8 }, axis: { s: 'whoosh', vol: .5 }, engine: { s: 'engine', vol: .55 }, radio: { s: 'beep', vol: .6 }, switch: { s: 'switch', vol: .7 },
  coffee: { s: 'coffee', vol: .6 }, roll: { s: 'roll', vol: .75 }, round: { s: 'round', vol: .6 }, win: { s: 'win', vol: .8 }, lose: { s: 'lose', vol: .8 }, error: { s: 'error', vol: .5 }, alarm: { s: 'alarm', vol: .6 }, crash: { s: 'boom', vol: .8 } };
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
    if (UI.prefs.music === false || !G || !UI.started) { GA.music(null); GA.stopLoop && GA.stopLoop('hum'); return; }
    if (typeof musicSync === 'function') musicSync(); else GA.music(null);
    if (GA.has && GA.has('hum') && GA.loop) GA.loop('hum', { vol: .12, fade: 1.5 });
  } catch (e) { }
}
document.addEventListener('click', e => { const t = e.target.closest('button'); if (t && !t.disabled && !t.matches('.die,.slot')) snd('click'); }, true);
