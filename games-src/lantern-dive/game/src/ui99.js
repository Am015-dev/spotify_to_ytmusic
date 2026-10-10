// ===================== part 99: painted extras (portrait title, unlocked table and card backs, end art) and music (per screen + the Music picker) =====================
const MEDIA = 'media/';
const unl = t => { try { const u = GXC.unlocked().filter(x => x.type === t); return u.length ? u[u.length - 1].id : null; } catch (e) { return null; } };
const IMG_OK = {};
const preImg = (f, cb) => { if (IMG_OK[f] !== undefined) { if (cb && IMG_OK[f] === 1) cb(); return; } IMG_OK[f] = 0; const i = new Image(); i.onload = () => { IMG_OK[f] = 1; if (cb) cb(); }; i.src = MEDIA + f + '.webp'; };
const lowGfx = () => { try { return gfxPref() === 'low'; } catch (e) { return false; } };
// Low graphics keeps the flat dark-blue table (the painting is switched off); every other setting shows it under the Pixi table
function lowTblApply() { document.documentElement.classList.toggle('lowtbl', lowGfx()); }
// ---- title: the portrait painting on phones held upright (the embedded landscape one stays underneath until it has loaded)
function titleApply() {
  const bg = document.querySelector('.ttl .ttl-bg'); if (!bg || bg.tagName !== 'IMG') return;
  const port = window.matchMedia && matchMedia('(max-aspect-ratio: 1/1)').matches; if (!port) return;
  preImg('title-phone', () => { if (bg.isConnected) bg.src = MEDIA + 'title-phone.webp'; });
}
// ---- table: the campaign unlock (tunnel-glow) replaces the default painting; the embedded default and the dark blue stay underneath
let tblCur = '';
function tableApply() {
  const R = document.documentElement, id = unl('table'), f = id === 'tunnel-glow' && !lowGfx() ? 'table-' + id : '', key = f || 'default'; if (key === tblCur) return;
  if (!f) { if (tblCur) R.style.removeProperty('--tableimg'); tblCur = key; return; }
  preImg(f, () => { tblCur = key; R.style.setProperty('--tableimg', 'url("' + MEDIA + f + '.webp")'); });
}
// ---- card back: the campaign unlocks (wreck-brass, last-light) replace the painted back (loaded as a blob so the Pixi table can use it too)
let backCur = '', back0 = null, backBusy = '';
function backApply() {
  const id = unl('cardback'), f = /^(wreck-brass|last-light)$/.test(id || '') && !lowGfx() ? 'back-' + id : '', key = f || 'default'; if (key === backCur || backBusy === key) return;
  if (back0 === null) back0 = KIT.ART.back || '';
  const set = u => { backCur = key; backBusy = ''; const m = Object.assign({}, KIT.ART); if (u) m.back = u; else if (back0) m.back = back0; else delete m.back; KIT.setArt(m);
    try { if (PX && PX.on && typeof PIXI !== 'undefined' && u) { const i = new Image(); i.onload = () => { PX.img.back = i; PX.tex.back = PIXI.Texture.from(i); PX.dirty = true; }; i.src = u; } } catch (e) { }
    try { if (G && UI.started) render(); } catch (e) { } };
  if (!f) { set(null); return; }
  backBusy = key; if (!window.fetch) { backBusy = ''; return; }
  fetch(MEDIA + f + '.webp').then(r => r.ok ? r.blob() : Promise.reject()).then(b => set(URL.createObjectURL(b))).catch(() => { backBusy = ''; });
}
// ---- end art: a painted banner on top of the result card (dive result and story result)
function endBanner(box, won) {
  if (!box || box.querySelector('.endart')) return; const f = won ? 'end-win' : 'end-lose'; if (!IMG_OK[f]) return;
  const d = h('div.endart.' + (won ? 'win' : 'lose'), { 'aria-hidden': 'true' }); d.style.backgroundImage = 'url(' + MEDIA + f + '.webp)'; box.insertBefore(d, box.firstChild);
}
(function () { const sr = showResult; showResult = function () { const r = sr.apply(this, arguments); try { if (G && G.result) endBanner(document.querySelector('#rs .rsbox'), !!G.result.ok); } catch (e) { } return r; }; })();
new MutationObserver(() => { const r = document.querySelector('.gxc-res-on .gxc-res'); if (r && !r.querySelector('.endart')) endBanner(r, /\bwon\b/.test(r.closest('.gxc-res-on').className)); }).observe(document.body, { childList: true, subtree: true });
// ---- music: five slots (Menu, Dive, Boss, Victory, Defeat), two Treblo tracks each, saved choice a / b / shuffle / all / off
const MSLOTS = [['tavern', 'Menu'], ['main', 'Dive'], ['fight', 'Boss'], ['victory', 'Victory'], ['defeat', 'Defeat']];
const MTITLE = { 'tavern-a': 'Menu tune A', 'tavern-b': 'Menu tune B', 'main-a': 'Dive tune A', 'main-b': 'Dive tune B', 'fight-a': 'Boss tune A', 'fight-b': 'Boss tune B', 'victory-a': 'Victory A', 'victory-b': 'Victory B', 'defeat-a': 'Defeat A', 'defeat-b': 'Defeat B' };
const MDEF = { tavern: 'a', main: 'a', fight: 'a', victory: 'a', defeat: 'a' };
const MUS = { pick: Object.assign({}, MDEF), res: {}, sh: {}, want: null, wslot: null, prev: null, prevT: 0, last: null, since: 0 };
const MLOOPS = ['tavern', 'main', 'fight'], MALL = Object.keys(MTITLE).filter(k => MLOOPS.includes(k.split('-')[0])), MALL_MS = 150000;
try { Object.assign(MUS.pick, JSON.parse(localStorage.getItem('ld_mpick') || '{}')); } catch (e) { }
function musicSlot() {
  const st = $('#start');
  if (!G || !UI.started || (st && !st.hidden)) return ['tavern', 0];
  if (G.phase === 'over' && UI.overShown && UI.mode !== 'tutorial' && G.result) return [G.result.ok ? 'victory' : 'defeat', 1];
  if (UI.mode !== 'tutorial' && ((UI.camp && UI.camp.boss) || G.boss)) return ['fight', 0];
  return ['main', 0];
}
function musicName(slot) {
  const c = MUS.pick[slot] || MDEF[slot]; if (c === 'off') return '-';
  if (c === 'all') { if (!MUS.res[slot]) { const pool = MALL.filter(k => k !== MUS.last); MUS.res[slot] = pool[Math.floor(Math.random() * pool.length)]; } return MUS.res[slot]; }
  if (c === 'shuffle') { if (!MUS.res[slot]) { MUS.sh[slot] = MUS.sh[slot] === undefined ? (Math.random() < .5 ? 0 : 1) : 1 - MUS.sh[slot]; MUS.res[slot] = slot + '-' + 'ab'[MUS.sh[slot]]; } return MUS.res[slot]; }
  return slot + '-' + (c === 'b' ? 'b' : 'a');
}
function musicPick(slot, c) {
  MUS.pick[slot] = c; MUS.res[slot] = null; try { localStorage.setItem('ld_mpick', JSON.stringify(MUS.pick)); } catch (e) { }
  if (window.GA && c !== 'off' && c !== 'shuffle' && c !== 'all') try { GA.preload(musicName(slot)); } catch (e) { }
  if (MUS.wslot === slot && !MUS.prev) { MUS.want = null; musicSync(); }
}
function musicSync() {
  if (!window.GA || MUS.prev) return;
  if (UI.prefs.music === false) { MUS.want = null; GA.music(null, { fade: .6 }); return; }
  const w = musicSlot(); if (MUS.wslot !== w[0]) { MUS.wslot = w[0]; MUS.res[w[0]] = null; }
  else if (MUS.pick[w[0]] === 'all' && !w[1] && MUS.since && Date.now() - MUS.since > MALL_MS) MUS.res[w[0]] = null;
  const n = musicName(w[0]); if (MUS.want === n) return; MUS.want = n; MUS.since = Date.now(); if (n !== '-') MUS.last = n;
  if (n === '-') { GA.music(null, { fade: 1 }); return; }
  GA.music(n, { fade: w[1] ? .6 : 1, once: !!w[1] });
  if (w[0] === 'tavern' || w[0] === 'main') setTimeout(() => { try { const nx = w[0] === 'tavern' ? 'main' : 'fight', c = MUS.pick[nx]; if (c !== 'off' && c !== 'shuffle' && c !== 'all') GA.preload(musicName(nx)); } catch (e) { } }, 4000);
}
function musicPreview(slot) {
  if (!window.GA || UI.prefs.music === false || MUS.wslot === slot) return; try { GA.unlock(); } catch (e) { }
  const n = musicName(slot); if (n === '-') return;
  clearTimeout(MUS.prevT); MUS.prev = slot; MUS.want = null; GA.music(n, { fade: .5, once: true });
  MUS.prevT = setTimeout(() => { MUS.prev = null; MUS.want = null; musicSync(); renderMusic(); }, 8000);
}
function musicPreviewStop() { if (!MUS.prev) return; clearTimeout(MUS.prevT); MUS.prev = null; MUS.want = null; musicSync(); }
function renderMusic() {
  const b = $('#musicbody'); if (!b) return; const on = UI.prefs.music !== false; let vol = .5; try { vol = GA.state().musVol; } catch (e) { }
  const chip = (cls, at, t) => h('button.mchip' + cls, Object.assign({ type: 'button' }, at), t);
  const top = h('div.mtop', chip(on ? '.on' : '', { 'data-a': 'mmus' }, 'Music: ' + (on ? 'on' : 'off')), h('label.mvol', 'Volume ', h('input#mvol', { type: 'range', min: '0', max: '1', step: '0.05', value: String(vol), 'aria-label': 'Music volume' })));
  const sig = JSON.stringify([on, MUS.pick, MUS.prev, MUS.wslot]); if (b._sig === sig) return; b._sig = sig;
  b.innerHTML = ''; b.appendChild(top);
  const allOn = MLOOPS.every(k => MUS.pick[k] === 'all');
  b.appendChild(h('div.mtop', chip(allOn ? '.on' : '', { 'data-a': 'mall' }, '⇄ Shuffle all songs')));
  MSLOTS.forEach(([k, nm]) => {
    const cur = MUS.pick[k], act = MUS.wslot === k && on && cur !== 'off', row = h('div.mchips');
    ['a', 'b'].forEach(v => row.appendChild(chip(cur === v ? '.on' : '', { 'data-a': 'mpick', 'data-s': k, 'data-c': v }, MTITLE[k + '-' + v])));
    row.appendChild(chip(cur === 'shuffle' ? '.on' : '', { 'data-a': 'mpick', 'data-s': k, 'data-c': 'shuffle' }, '⇄ Shuffle'));
    if (MLOOPS.includes(k)) row.appendChild(chip(cur === 'all' ? '.on' : '', { 'data-a': 'mpick', 'data-s': k, 'data-c': 'all' }, '⇄ All songs'));
    row.appendChild(chip(cur === 'off' ? '.on' : '', { 'data-a': 'mpick', 'data-s': k, 'data-c': 'off' }, 'Off'));
    if (MUS.prev === k) row.appendChild(chip('.prev', { 'data-a': 'mprevx', 'data-s': k }, '■ Stop preview'));
    else if (!act && cur !== 'off' && on) row.appendChild(chip('.prev', { 'data-a': 'mprev', 'data-s': k }, '▶ Preview'));
    b.appendChild(h('div.mrow2', h('h5', nm, act ? h('small', ' playing now') : null), row));
  });
}
document.addEventListener('input', e => { if (e.target && e.target.id === 'mvol' && window.GA) GA.setVolume('music', +e.target.value); });
function extrasBoot() {
  GX.drawer('musicd', 'Music', h('div#musicbody'));
  const os = GX.onShow; GX.onShow = id => { os(id); if (id === 'musicd') { const mb = $('#musicbody'); if (mb) mb._sig = null; renderMusic(); } };
  ['end-win', 'end-lose', 'back-wreck-brass', 'back-last-light', 'table-tunnel-glow'].forEach(f => preImg(f));
  titleApply(); tableApply(); backApply();
  lowTblApply();
  setInterval(() => { try { lowTblApply(); musicSync(); tableApply(); backApply(); if (!document.querySelector('.ttl .ttl-bg[data-p]')) titleApply(); } catch (e) { } }, 800);
  document.addEventListener('pointerdown', () => setTimeout(() => { try { musicSync(); } catch (e) { } }, 60), { capture: true });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', extrasBoot); else setTimeout(extrasBoot, 0);
