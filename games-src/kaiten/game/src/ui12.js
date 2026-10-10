// ===================== part 12: painted extras (unlocked card backs and table, end art) and music (per screen + the Music picker) =====================
const MEDIA = 'media/';
const unlAll = t => { try { return GXC.unlocked().filter(x => x.type === t).map(x => x.id).reverse(); } catch (e) { return []; } };
const IMG_OK = {};
const preImg = f => { const i = new Image(); i.onload = () => { IMG_OK[f] = 1; }; i.src = MEDIA + f + '.webp'; };
preImg('stage');   // the painted reveal-stage backdrop, decoded before the first reveal
// ---- card backs: the campaign unlocks (lunch-belt, custard, golden) replace the default back; the file is fetched once and
// handed to the kit as a data URL (the kit also draws backs into canvases); a missing file keeps the default back
let backCur = '';
function backApply() {
  if (!window.fetch || !window.FileReader || /jsdom/i.test(navigator.userAgent || '')) return;
  const id = unlAll('cardback')[0] || ''; if (id === backCur) return; backCur = id;
  if (!id) return;
  fetch(MEDIA + 'back-' + id + '.webp').then(r => r.ok ? r.blob() : Promise.reject()).then(b => new Promise(ok => { const fr = new FileReader(); fr.onload = () => ok(fr.result); fr.readAsDataURL(b); }))
    .then(u => { if (backCur !== id) return; KIT.setArt({ back: u }); if (G && UI.started) render(); }).catch(() => { });
}
// ---- tables: the unlocked painted counter behind the board; the plain wood stays while it loads, if the file is missing and in Low graphics
let tblCur = '';
function tableApply() {
  const R = document.documentElement, ids = unlAll('table'), key = ids.join(','); if (key === tblCur) return; tblCur = key;
  delete R.dataset.timg; R.style.removeProperty('--tbl-img');
  const tryNext = i => { if (i >= ids.length) return; const f = 'table-' + ids[i] + '.webp', im = new Image(); im.onload = () => { if (tblCur !== key) return; R.style.setProperty('--tbl-img', 'url(' + MEDIA + f + ')'); R.dataset.timg = '1'; }; im.onerror = () => tryNext(i + 1); im.src = MEDIA + f; };
  tryNext(0);
}
// ---- end art: a painted banner above the Play again / Menu buttons
function kkWon() {
  if (!G || G.phase !== 'over') return true; const ws = G.winners || [];
  if (NET.on) { const me = viewSeat(); return me >= 0 && ws.includes(me); }
  if (!humans().length) return true;
  return ws.some(s => G.players[s] && !G.players[s].ai);
}
function endBanner() {
  const rs = $('#rs'); if (!rs || rs.hidden || rs.querySelector('.endart')) return;
  const w = kkWon(); if (!IMG_OK[w ? 'end-win' : 'end-lose']) return;
  rs.classList.add('has-art'); rs.insertBefore(h('div.endart.' + (w ? 'win' : 'lose'), { 'aria-hidden': 'true' }), rs.firstChild);
}
// ---- music: five slots (Menu, Game, Last round, Victory, Defeat), two Treblo tracks each, saved choice a / b / shuffle / off
const MSLOTS = [['tavern', 'Menu'], ['main', 'Game'], ['fight', 'Last round'], ['victory', 'Victory'], ['defeat', 'Defeat']];
const MTITLE = { 'tavern-a': 'Menu loop A', 'tavern-b': 'Menu loop B', 'main-a': 'Nine Cards, One Cup of Tea', 'main-b': 'Quiet Table, Warm Light', 'fight-a': 'Shamisen Sprint', 'fight-b': 'Last Bell, Light Heart', 'victory-a': 'Golden Koto Rise', 'victory-b': 'Bright Final Chord', 'defeat-a': 'A Gentle Plonk of Defeat', 'defeat-b': 'Trombone Bows Out' };
const MDEF = { tavern: 'a', main: 'a', fight: 'a', victory: 'a', defeat: 'a' };
const MUS = { pick: Object.assign({}, MDEF), res: {}, sh: {}, want: null, wslot: null, prev: null, prevT: 0, last: null, since: 0 };
// 'all' = shuffle through every looping song (menu, game and last-round tracks), a new one every ~2.5 min
const MLOOPS = ['tavern', 'main', 'fight'], MALL = Object.keys(MTITLE).filter(k => MLOOPS.includes(k.split('-')[0])), MALL_MS = 150000;
try { Object.assign(MUS.pick, JSON.parse(localStorage.getItem('kk_mpick') || '{}')); } catch (e) { }
function musicSlot() {
  const st = $('#start');
  if (!G || !UI.started || (st && !st.hidden)) return ['tavern', 0];
  if (G.phase === 'over') return [kkWon() ? 'victory' : 'defeat', 1];
  if (UI.camp && UI.camp.boss) return ['fight', 0];
  if (!(UI.cfg && UI.cfg.tutorial) && G.round >= (G.len || D.rounds)) return ['fight', 0];
  return ['main', 0];
}
function musicName(slot) {
  const c = MUS.pick[slot] || MDEF[slot]; if (c === 'off') return '-';
  if (c === 'all') { if (!MUS.res[slot]) { const pool = MALL.filter(k => k !== MUS.last); MUS.res[slot] = pool[Math.floor(Math.random() * pool.length)]; } return MUS.res[slot]; }
  if (c === 'shuffle') { if (!MUS.res[slot]) { MUS.sh[slot] = MUS.sh[slot] === undefined ? (Math.random() < .5 ? 0 : 1) : 1 - MUS.sh[slot]; MUS.res[slot] = slot + '-' + 'ab'[MUS.sh[slot]]; } return MUS.res[slot]; }
  return slot + '-' + (c === 'b' ? 'b' : 'a');
}
function musicSync() {
  if (UI.prefs.music === false || !window.GA || MUS.prev) return;
  const w = musicSlot(); if (MUS.wslot !== w[0]) { MUS.wslot = w[0]; MUS.res[w[0]] = null; }
  else if (MUS.pick[w[0]] === 'all' && !w[1] && MUS.since && Date.now() - MUS.since > MALL_MS) MUS.res[w[0]] = null;
  const n = musicName(w[0]); if (MUS.want === n) return; MUS.want = n; MUS.since = Date.now(); if (n !== '-') MUS.last = n;
  if (n === '-') { GA.music(null, { fade: 1 }); return; }
  GA.music(n, { fade: w[1] ? .6 : 1, once: !!w[1] });
  if (w[0] === 'tavern' || w[0] === 'main') setTimeout(() => { try { const nx = w[0] === 'tavern' ? 'main' : 'fight', c = MUS.pick[nx]; if (c !== 'off' && c !== 'shuffle' && c !== 'all') GA.preload(musicName(nx)); } catch (e) { } }, 4000);
}
function musicPick(slot, c) {
  MUS.pick[slot] = c; MUS.res[slot] = null; try { localStorage.setItem('kk_mpick', JSON.stringify(MUS.pick)); } catch (e) { }
  if (window.GA && c !== 'off' && c !== 'shuffle' && c !== 'all') try { GA.preload(musicName(slot)); } catch (e) { }
  if (MUS.wslot === slot && !MUS.prev) { MUS.want = null; musicSync(); }
}
function musicPreview(slot) {
  if (!window.GA || UI.prefs.music === false || MUS.wslot === slot) return; const n = musicName(slot); if (n === '-') return;
  clearTimeout(MUS.prevT); MUS.prev = slot; MUS.want = null; GA.music(n, { fade: .5, once: true });
  MUS.prevT = setTimeout(() => { MUS.prev = null; MUS.want = null; musicSync(); renderMusic(); }, 8000);
}
function musicPreviewStop() { if (!MUS.prev) return; clearTimeout(MUS.prevT); MUS.prev = null; MUS.want = null; musicSync(); }
function renderMusic() {
  const b = $('#musicbody'); if (!b) return; b.innerHTML = '';
  const on = UI.prefs.music !== false; let vol = .5; try { vol = GA.state().musVol; } catch (e) { }
  const chip = (cls, at, label) => h('button.mchip' + cls, Object.assign({ type: 'button' }, at), label);
  const slider = h('input#mvol', { type: 'range', min: 0, max: 1, step: .05, value: vol, 'aria-label': 'Music volume' });
  slider.addEventListener('input', () => { try { GA.setVolume('music', +slider.value); } catch (e) { } });
  b.appendChild(h('div.mtop', chip(on ? '.on' : '', { 'data-a': 'mmus' }, 'Music: ' + (on ? 'on' : 'off')), h('label.mvol', 'Volume ', slider)));
  const allOn = MLOOPS.every(k => MUS.pick[k] === 'all');
  b.appendChild(h('div.mtop', chip(allOn ? '.on' : '', { 'data-a': 'mall' }, '⇄ Shuffle all songs')));
  MSLOTS.forEach(([k, nm]) => {
    const cur = MUS.pick[k], act = MUS.wslot === k && on && cur !== 'off';
    const row = h('div.mchips');
    ['a', 'b'].forEach(v => row.appendChild(chip(cur === v ? '.on' : '', { 'data-a': 'mpick', 'data-s': k, 'data-c': v }, MTITLE[k + '-' + v])));
    row.appendChild(chip(cur === 'shuffle' ? '.on' : '', { 'data-a': 'mpick', 'data-s': k, 'data-c': 'shuffle' }, '⇄ Shuffle'));
    if (MLOOPS.includes(k)) row.appendChild(chip(cur === 'all' ? '.on' : '', { 'data-a': 'mpick', 'data-s': k, 'data-c': 'all' }, '⇄ All songs'));
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
  else if (a === 'mall') { const on = MLOOPS.every(k => MUS.pick[k] === 'all'); MLOOPS.forEach(k => musicPick(k, on ? MDEF[k] : 'all')); renderMusic(); }
  else if (a === 'mprev') { musicPreview(t.dataset.s); renderMusic(); }
  else if (a === 'mprevx') { musicPreviewStop(); renderMusic(); }
  else if (a === 'mmus') { UI.prefs.music = !UI.prefs.music; savePrefs(); try { if (window.GA) GA.setMusic(UI.prefs.music); } catch (x) { } MUS.want = null; sndMusic(); renderMusic(); }
});
function extrasBoot() {
  GX.drawer('musicd', 'Music', h('div#musicbody'));
  backApply(); tableApply();
  ['end-win', 'end-lose'].forEach(preImg);
  setInterval(() => { try { sndMusic(); backApply(); tableApply(); } catch (e) { } }, 800);
}
(function () {
  const sf = showFinal; showFinal = function () { const r = sf.apply(this, arguments); try { endBanner(); } catch (e) { } return r; };
  const rs = renderStart; renderStart = function () { const r = rs.apply(this, arguments); try { sndMusic(); } catch (e) { } return r; };
})();
