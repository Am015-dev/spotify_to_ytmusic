// ===================== part 7: sound (shared gameaudio samples; silent without Web Audio) =====================
function snd(name, o) { try { if (UI.sound === false) return; if (window.GA && GA.has(name)) GA.play(name, o || {}); } catch (e) { } }
function sndPre() { if (!G) return null; return G.players.map(p => ({ res: Object.assign({}, p.res), season: p.season, city: p.city.length, ev: 0 })).concat([{ ev: G.bev.filter(e => e.o !== -1).length + G.sev.filter(e => e.o !== -1).length }]); }
function sndPost(pre, m, seat) {
  if (!pre || !G || !m) return;
  try {
    if (m.type === 'worker') snd(m.k === 'event' ? 'event' : 'worker');
    else if (m.type === 'play') snd('place');
    else if (m.type === 'prepare') snd('season', { duck: true });
    else if (m.type === 'choose') snd('click');
    const p = G.players[seat], b = pre[seat]; if (!p || !b) return;
    let d = 0; for (const k of RESK) { if (p.res[k] > b.res[k]) { setTimeout(() => snd(k), 120 + 90 * d++); } }
    const ev = G.bev.filter(e => e.o !== -1).length + G.sev.filter(e => e.o !== -1).length;
    if (ev > pre[pre.length - 1].ev && m.k !== 'event') snd('event');
  } catch (e) { }
}
function sndMusic() { try { if (UI.sound === false || !window.GA || !G) return; const s = G.players[Math.max(0, focusSeat())].season; GA.music(G.phase === 'over' ? null : SEAS[s], { vol: .35 }); } catch (e) { } }
document.addEventListener('click', e => { const t = e.target.closest('button'); if (t && !t.disabled && !/data-a="(do|q)"/.test(t.outerHTML.slice(0, 80))) snd('click', { vol: .5 }); }, true);
