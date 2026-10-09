// ===================== part 13: painted extras (card backs, tables, title and end art, portraits) and music (per screen + picker) =====================
const MEDIA = 'media/';
const unl = t => { try { const u = GXC.unlocked().filter(x => x.type === t); return u.length ? u[u.length - 1].id : null; } catch (e) { return null; } };
const IMG_OK = {};
const preImg = f => { const i = new Image(); i.onload = () => { IMG_OK[f] = 1; }; i.src = MEDIA + f + '.webp'; };
// ---- card backs: the deck tile and the help pictures wear the painted back; campaign unlocks (sprout, frost) replace the default
function backApply() {
  const R = document.documentElement, id = unl('cardback') || 'default';
  R.style.setProperty('--back-img', 'url(' + MEDIA + 'back-' + id + '.webp)');
  R.style.setProperty('--back-meadow', 'url(' + MEDIA + 'back-meadow.webp)');
}
// ---- tables: painted tree stump behind the board; the CSS green stays while it loads and if the file is missing
const tblSeen = {}; let tblCur = '';
function tableApply() {
  const R = document.documentElement, id = unl('table') || 'woodland';
  const f = id === 'woodland' && matchMedia('(max-aspect-ratio:4/5)').matches ? 'table-woodland-phone' : 'table-' + id;
  if (f === tblCur) return;
  const go = () => { tblCur = f; R.style.setProperty('--tbl-img', 'url(' + MEDIA + f + '.webp)'); R.dataset.timg = '1'; };
  if (tblSeen[f]) return go();
  const im = new Image(); im.onload = () => { tblSeen[f] = 1; go(); }; im.src = MEDIA + f + '.webp';
}
// ---- title key art behind the start card (only once the picture has loaded)
function titleArt() {
  const R = document.documentElement; if (R.dataset.tart) return;
  const im = new Image(); im.onload = () => { R.dataset.tart = '1'; const s = $('#start'); if (s) s.classList.add('art'); }; im.src = MEDIA + (matchMedia('(max-aspect-ratio:4/5)').matches ? 'title-phone' : 'title') + '.webp';
}
// ---- end art: a painted banner on top of the result card
function hbWon() {
  if (!G || !G.over) return true; const ov = G.over;
  if (G.grim) return !!ov.win; if (watching()) return true;
  return ov.tie || humans().includes(ov.winner);
}
function endBanner() {
  const pc = $('#pc'); if (!pc || pc.getAttribute('data-card') !== 'over' || pc.querySelector('.endart')) return;
  const w = hbWon(); if (!IMG_OK[w ? 'end-win' : 'end-lose']) return;
  pc.insertBefore(h('div.endart.' + (w ? 'win' : 'lose'), { 'aria-hidden': 'true' }), pc.firstChild);
}
// ---- campaign portraits on the rival drawer
function portraitFor(name) {
  try { const c = window.CAMPAIGN && window.CAMPAIGN.cast; if (!c || !name) return null; for (const k in c) { const last = c[k].name.split(' ').pop(); if (name === c[k].name || name === last) return c[k]; } } catch (e) { }
  return null;
}
function rivalPortrait() {
  const b = $('#rivalbody'); if (!b || !G || UI.rseat == null || UI.rseat === 'G') return;
  const p = portraitFor(G.players[UI.rseat] && G.players[UI.rseat].name); if (!p || !UI.camp) return;
  const im = h('img.rport', { src: MEDIA + p.portrait, alt: '', draggable: 'false' }); im.style.borderColor = p.color; im.onerror = () => im.remove();
  b.insertBefore(h('div.rhead', im, h('b', p.name)), b.firstChild.nextSibling);
}
// ---- music: five slots (Menu, Game, Fight, Victory, Defeat), two Treblo tracks each, saved choice a / b / shuffle / off
const MSLOTS = [['tavern', 'Menu'], ['main', 'Game'], ['fight', 'Fight'], ['victory', 'Victory'], ['defeat', 'Defeat']];
const MTITLE = { 'tavern-a': 'The Village Wakes', 'tavern-b': 'Sunlight Through the Canopy', 'main-a': 'Quiet Cartographer', 'main-b': 'Meadowlight Turn', 'fight-a': 'Last Harvest Before Winter', 'fight-b': "Fiddle at the Wood's Edge", 'victory-a': 'Grove of Golden Light', 'victory-b': 'Tambourine at the Woodland Gate', 'defeat-a': 'Late October', 'defeat-b': 'Last Chord, Golden Light' };
const MDEF = { tavern: 'a', main: 'a', fight: 'a', victory: 'a', defeat: 'a' };
const MUS = { pick: Object.assign({}, MDEF), res: {}, sh: {}, want: null, wslot: null, prev: null, prevT: 0 };
try { Object.assign(MUS.pick, JSON.parse(localStorage.getItem('hb_mpick') || '{}')); } catch (e) { }
function musicSlot() {
  const st = $('#start');
  if (!G || !UI.started || (st && !st.hidden)) return ['tavern', 0];
  if (G.phase === 'over') return [hbWon() ? 'victory' : 'defeat', 1];
  if (UI.camp && UI.camp.boss) return ['fight', 0];
  try { const p = G.players[Math.max(0, focusSeat())]; if (p && p.season === 3 && !(UI.cfg && UI.cfg.tutorial)) return ['fight', 0]; } catch (e) { }
  return ['main', 0];
}
function musicName(slot) {
  const c = MUS.pick[slot] || MDEF[slot]; if (c === 'off') return '-';
  if (c === 'shuffle') { if (!MUS.res[slot]) { MUS.sh[slot] = MUS.sh[slot] === undefined ? (Math.random() < .5 ? 0 : 1) : 1 - MUS.sh[slot]; MUS.res[slot] = slot + '-' + 'ab'[MUS.sh[slot]]; } return MUS.res[slot]; }
  return slot + '-' + (c === 'b' ? 'b' : 'a');
}
function musicSync() {
  if (UI.sound === false || !window.GA || MUS.prev) return;
  const w = musicSlot(); if (MUS.wslot !== w[0]) { MUS.wslot = w[0]; MUS.res[w[0]] = null; }
  const n = musicName(w[0]); if (MUS.want === n) return; MUS.want = n;
  if (n === '-') { GA.music(null, { fade: 1 }); return; }
  GA.music(n, { fade: w[1] ? .6 : 1, once: !!w[1] });
  if (w[0] === 'tavern' || w[0] === 'main') setTimeout(() => { try { const nx = w[0] === 'tavern' ? 'main' : 'fight', c = MUS.pick[nx]; if (c !== 'off' && c !== 'shuffle') GA.preload(musicName(nx)); } catch (e) { } }, 4000);
}
function musicPick(slot, c) {
  MUS.pick[slot] = c; MUS.res[slot] = null; try { localStorage.setItem('hb_mpick', JSON.stringify(MUS.pick)); } catch (e) { }
  if (window.GA && c !== 'off' && c !== 'shuffle') try { GA.preload(musicName(slot)); } catch (e) { }
  if (MUS.wslot === slot && !MUS.prev) { MUS.want = null; musicSync(); }
}
function musicPreview(slot) {
  if (!window.GA || UI.sound === false || MUS.wslot === slot) return; const n = musicName(slot); if (n === '-') return;
  clearTimeout(MUS.prevT); MUS.prev = slot; MUS.want = null; GA.music(n, { fade: .5, once: true });
  MUS.prevT = setTimeout(() => { MUS.prev = null; MUS.want = null; musicSync(); renderMusic(); }, 8000);
}
function musicPreviewStop() { if (!MUS.prev) return; clearTimeout(MUS.prevT); MUS.prev = null; MUS.want = null; musicSync(); }
function renderMusic() {
  const b = $('#musicbody'); if (!b) return; b.innerHTML = '';
  const on = UI.sound !== false; let vol = .5; try { vol = GA.state().musVol; } catch (e) { }
  const chip = (cls, at, label) => h('button.mchip' + cls, Object.assign({ type: 'button' }, at), label);
  const slider = h('input#mvol', { type: 'range', min: 0, max: 1, step: .05, value: vol, 'aria-label': 'Music volume' });
  slider.addEventListener('input', () => { try { GA.setVolume('music', +slider.value); } catch (e) { } });
  b.appendChild(h('div.mtop', chip(on ? '.on' : '', { 'data-a': 'mmus' }, 'Music: ' + (on ? 'on' : 'off')), h('label.mvol', 'Volume ', slider)));
  MSLOTS.forEach(([k, nm]) => {
    const cur = MUS.pick[k], act = MUS.wslot === k && on && cur !== 'off';
    const row = h('div.mchips');
    ['a', 'b'].forEach(v => row.appendChild(chip(cur === v ? '.on' : '', { 'data-a': 'mpick', 'data-s': k, 'data-c': v }, MTITLE[k + '-' + v])));
    row.appendChild(chip(cur === 'shuffle' ? '.on' : '', { 'data-a': 'mpick', 'data-s': k, 'data-c': 'shuffle' }, '⇄ Shuffle'));
    row.appendChild(chip(cur === 'off' ? '.on' : '', { 'data-a': 'mpick', 'data-s': k, 'data-c': 'off' }, 'Off'));
    if (MUS.prev === k) row.appendChild(chip('.prev', { 'data-a': 'mprevx', 'data-s': k }, '■ Stop preview'));
    else if (!act && cur !== 'off' && on) row.appendChild(chip('.prev', { 'data-a': 'mprev', 'data-s': k }, '▶ Preview'));
    b.appendChild(h('div.mrow2', h('h3', nm, act ? h('small', ' playing now') : null), row));
  });
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-a]'); if (!t) return; const a = t.dataset.a;
  if (a === 'musicopen') { try { GX.close(); } catch (x) { } renderMusic(); GX.show('musicd'); }
  else if (a === 'mpick') { musicPick(t.dataset.s, t.dataset.c); renderMusic(); }
  else if (a === 'mprev') { musicPreview(t.dataset.s); renderMusic(); }
  else if (a === 'mprevx') { musicPreviewStop(); renderMusic(); }
  else if (a === 'mmus') { UI.sound = UI.sound === false; try { if (window.GA) { GA.setSfx(UI.sound); GA.setMusic(UI.sound); } } catch (x) { } MUS.want = null; sndMusic(); renderMusic(); try { GX.renderSettings(); } catch (x) { } }
});
function extrasBoot() {
  GX.drawer('musicd', 'Music', h('div#musicbody'));
  backApply(); tableApply(); titleArt();
  ['back-default', 'back-meadow', 'camp-hazel', 'camp-bramble', 'end-win', 'end-lose'].forEach(preImg);
  addEventListener('resize', () => { tableApply(); });
  setInterval(() => { try { sndMusic(); backApply(); tableApply(); } catch (e) { } }, 800);
}
// the start card, the result card and the rival drawer pick up the new pieces after each render
(function () {
  const rs = renderStart; renderStart = function () { const r = rs.apply(this, arguments); try { titleArt(); sndMusic(); } catch (e) { } return r; };
  const rc = renderCard; renderCard = function () { const r = rc.apply(this, arguments); try { endBanner(); } catch (e) { } return r; };
  const rr = renderRival; renderRival = function () { const r = rr.apply(this, arguments); try { rivalPortrait(); } catch (e) { } return r; };
})();
