// ===================== part 13: painted extras (campaign table skins, crew-card back, end art) and music (per screen + the Music picker) =====================
const MEDIA = 'media/';
const unl = t => { try { const u = GXC.unlocked().filter(x => x.type === t); return u.length ? u[u.length - 1].id : null; } catch (e) { return null; } };
const IMG_OK = {};
const preImg = f => { if (IMG_OK[f] !== undefined) return; IMG_OK[f] = 0; const i = new Image(); i.onload = () => { IMG_OK[f] = 1; }; i.src = MEDIA + f + '.webp'; };
// ---- table skins: the campaign unlocks night-lake, storm and valley replace the painted panel (Pixi plate) and the CSS table behind it
let tblCur = '', tblTex = null;
function pxFitBg() {
  const s = PX.bgS; if (!s) return;
  if (!tblTex) { s.width = PX.w; s.height = PX.h; s.x = 0; s.y = 0; return; }
  const tw = tblTex.width, th = tblTex.height, k = Math.max(PX.w / tw, PX.h / th);   // cover: the desk keeps its shape
  s.width = tw * k; s.height = th * k; s.x = (PX.w - s.width) / 2; s.y = (PX.h - s.height) / 2;
}
function tableApply() {
  const R = document.documentElement, id = unl('table'), skin = id && /^(night-lake|storm|valley)$/.test(id);
  const f = skin ? 'table-' + id : 'table-default' + (innerHeight > innerWidth ? '-phone' : '');   // no unlock yet: the painted default desk (a portrait file on a phone held upright)
  const key = f; if (key === tblCur) return;
  const im = new Image();
  im.onload = () => {
    tblCur = key; R.style.setProperty('--tbl-img', 'url(' + MEDIA + f + '.webp)'); R.classList.add('tbl');
    try { if (typeof PX !== 'undefined' && PX.on && PX.bgS && window.PIXI) { tblTex = PIXI.Texture.from(im); PX.bgS.texture = tblTex; pxFitBg(); PX.dirty = true; } } catch (e) { }
  };
  im.src = MEDIA + f + '.webp';
}
// the Pixi plate may start after the skin loaded: re-apply once it exists
function tableRetry() { try { if (tblCur && !tblTex && PX.on && PX.bgS) { const k = tblCur; tblCur = ''; tableApply(); if (tblCur !== k) tblCur = k; } } catch (e) { } }
// ---- crew-card back: the default back, or the Spires back once unlocked (shown on the pass-the-device screen)
const cardBackFile = () => unl('cardback') === 'spires' ? 'back-spires' : 'back-default';
function cardBackImg() { const i = h('img.cback', { src: MEDIA + cardBackFile() + '.webp', alt: '', draggable: 'false' }); i.onerror = () => i.remove(); return i; }
// ---- end art: a painted banner on top of the debrief
function endBanner() {
  const b = $('#rs .rsbox'); if (!b || b.querySelector('.endart') || !G || !G.result) return;
  const u = ART[G.result.win ? 'end-land' : 'end-crash']; if (!u) return;
  b.insertBefore(h('img.endart', { src: u, alt: '' }), b.firstChild);
}
// ---- music: five slots (Menu, Flight, Last round, Victory, Defeat), two tracks each, saved choice a / b / shuffle / all / off
const MSLOTS = [['tavern', 'Menu'], ['main', 'Flight'], ['fight', 'Last round'], ['victory', 'Landed'], ['defeat', 'Crashed']];
const MTITLE = { 'tavern-a': 'Menu loop A', 'tavern-b': 'Menu loop B', 'main-a': 'Holding Pattern', 'main-b': 'Felt Keys and Flight Paths', 'fight-a': 'Runway Lights', 'fight-b': 'Ninety Seconds Out', 'victory-a': 'Applause at Altitude', 'victory-b': 'Homecoming Fanfare', 'defeat-a': 'Deflating Plink', 'defeat-b': 'Oops, Trombone' };
const MDEF = { tavern:'all',main:'all',fight:'all', victory: 'a', defeat: 'a' };
const MUS = { pick: Object.assign({}, MDEF), res: {}, sh: {}, want: null, wslot: null, prev: null, prevT: 0, last: null, since: 0 };
// 'all' = shuffle through every looping song (menu, flight and last-round tracks), a new one every ~2.5 min
const MLOOPS = ['tavern', 'main', 'fight'], MALL = Object.keys(MTITLE).filter(k => MLOOPS.includes(k.split('-')[0])), MALL_MS = 150000;
try { Object.assign(MUS.pick, JSON.parse(localStorage.getItem('fa_mpick') || '{}')); } catch (e) { }
const lastRound = () => !!G && !G.result && G.round + 1 >= D.rounds - G.row0;
function musicSlot() {
  const st = $('#start');
  if (!G || !UI.started || (st && !st.hidden)) return ['tavern', 0];
  if (G.result && UI.rsOpen) return [G.result.win ? 'victory' : 'defeat', 1];
  if (UI.mode !== 'guided' && !(UI.cfg && UI.cfg.tutorial) && ((UI.camp && UI.camp.boss) || lastRound())) return ['fight', 0];
  return ['main', 0];
}
function musicName(slot) {
  const c = MUS.pick[slot] || MDEF[slot]; if (c === 'off') return '-';
  if (c === 'all') { if (!MUS.res[slot]) { const pool = MALL.filter(k => k !== MUS.last); MUS.res[slot] = pool[Math.floor(Math.random() * pool.length)]; } return MUS.res[slot]; }
  if (c === 'shuffle') { if (!MUS.res[slot]) { MUS.sh[slot] = MUS.sh[slot] === undefined ? (Math.random() < .5 ? 0 : 1) : 1 - MUS.sh[slot]; MUS.res[slot] = slot + '-' + 'ab'[MUS.sh[slot]]; } return MUS.res[slot]; }
  return slot + '-' + (c === 'b' ? 'b' : 'a');
}
function musicPick(slot, c) {
  MUS.pick[slot] = c; MUS.res[slot] = null; try { localStorage.setItem('fa_mpick', JSON.stringify(MUS.pick)); } catch (e) { }
  if (window.GA && c !== 'off' && c !== 'shuffle' && c !== 'all') try { GA.preload(musicName(slot)); } catch (e) { }
  if (MUS.wslot === slot && !MUS.prev) { MUS.want = null; musicSync(); }
}
// one cross-faded track at a time; called from a slow tick, the first tap and after the music button or a pick (mute is honoured: music off = no track)
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
// iPhone: gameaudio.js unlocks audio on the first touch; the slow tick below then starts the right track
function extrasBoot() {
  GX.drawer('musicd', 'Music', h('div#musicbody'));
  ['back-default', 'back-spires'].forEach(preImg);
  tableApply();
  setInterval(() => { try { musicSync(); tableApply(); tableRetry(); } catch (e) { } }, 800);
}
// the debrief picks up the end art after each draw
(function () {
  const sf = showFinal; showFinal = function () { const r = sf.apply(this, arguments); try { endBanner(); } catch (e) { } return r; };
})();
