// ===================== part 12: painted extras (bag skins, table cloths, end art, fortune paintings) and music (per screen + the Music picker) =====================
const MEDIA = 'media/';
const MODELS = 'models/';
const unl = t => { try { const u = GXC.unlocked().filter(x => x.type === t); return u.length ? u[u.length - 1].id : null; } catch (e) { return null; } };
const IMG_OK = {};
const preImg = f => { if (IMG_OK[f] !== undefined) return; IMG_OK[f] = 0; const i = new Image(); i.onload = () => { IMG_OK[f] = 1; }; i.src = MEDIA + f + '.webp'; };
// ---- fortune cards: the painting on every place a fortune card is shown (the picture hides itself if the file is missing)
function fortImg(c, cls) { const i = h('img.' + cls, { src: MEDIA + 'fortune-' + c.id + '.webp', alt: '', draggable: 'false' }); i.onerror = () => i.remove(); return i; }
// ---- bag skins: the campaign unlocks moss-bag and ember-bag replace the painted bag (files bag-moss / bag-ember)
const BAGFILE = { 'moss-bag': 'bag-moss', 'ember-bag': 'bag-ember' };
let bagCur = '';
function bagApply() {
  const id = unl('cardback'), f = BAGFILE[id]; if (!f || f === bagCur) return;
  preImg(f); if (!IMG_OK[f]) return;
  bagCur = f; const u = MEDIA + f + '.webp'; KIT.ART.bag = u;
  document.querySelectorAll('img.bagimg,img.sbimg').forEach(i => { i.src = u; });
}
// ---- table: the painted market table behind the cauldron; campaign unlocks (market-cloth, judges-tent) replace it. The brown CSS gradient stays underneath while it loads, in the simple view and if a file is missing
let tblCur = '';
function tableApply() {
  const R = document.documentElement, id = unl('table'), ph = matchMedia('(max-aspect-ratio:4/5)').matches, f = id && /^(market-cloth|judges-tent)$/.test(id) ? 'table-' + id : ph ? 'table-phone' : '';
  const key = f || 'default'; if (key === tblCur) return;
  if (!f) { const a = KIT.ART.table; if (a) { tblCur = key; R.style.setProperty('--tbl-img', 'url(' + a + ')'); } return; }
  const im = new Image(); im.onload = () => { tblCur = key; R.style.setProperty('--tbl-img', 'url(' + MEDIA + f + '.webp)'); }; im.onerror = () => { if (f === 'table-phone' && KIT.ART.table) { tblCur = key; R.style.setProperty('--tbl-img', 'url(' + KIT.ART.table + ')'); } }; im.src = MEDIA + f + '.webp';
}
// ---- end art: a painted banner on top of the final scores
function cfWon() {
  if (!G || G.phase !== 'over') return true; const w = G.winners || [];
  if (typeof NET !== 'undefined' && NET.on) return w.indexOf(NET.mySeat) >= 0;
  const hs = humans(); if (!hs.length || hs.length > 1) return true;
  return w.indexOf(hs[0]) >= 0;
}
function endBanner() {
  const b = document.querySelector('#rs .rsbody'); if (!b || b.querySelector('.endart')) return;
  const won = cfWon(); if (!IMG_OK[won ? 'end-win' : 'end-lose']) return;
  b.insertBefore(h('div.endart.' + (won ? 'win' : 'lose'), { 'aria-hidden': 'true' }), b.firstChild);
}
// ---- music: five slots (Menu, Game, Last day, Victory, Defeat), two tracks each, saved choice a / b / shuffle / off
const MSLOTS = [['tavern', 'Menu'], ['main', 'Game'], ['fight', 'Last day'], ['victory', 'Victory'], ['defeat', 'Defeat']];
const MTITLE = { 'tavern-a': 'Potion Steam Waltz', 'tavern-b': 'Six Bells Over Kettlemoor', 'main-a': 'Cauldron Clockwork', 'main-b': 'Tiny Risky Potions', 'fight-a': 'Push the Pot', 'fight-b': 'Tremolo Gambit', 'victory-a': 'Fireworks Over the Fairground', 'victory-b': 'Brass and Confetti', 'defeat-a': 'Pfft!', 'defeat-b': 'The Slow Leak Waltz' };
const MDEF = { tavern:'all',main:'all',fight:'all', victory: 'a', defeat: 'a' };
const MUS = { pick: Object.assign({}, MDEF), res: {}, sh: {}, want: null, wslot: null, prev: null, prevT: 0, last: null, since: 0 };
// 'all' = shuffle through every looping song (menu, game and last-day tracks), a new one every ~2.5 min
const MLOOPS = ['tavern', 'main', 'fight'], MALL = Object.keys(MTITLE).filter(k => MLOOPS.includes(k.split('-')[0])), MALL_MS = 150000;
try { Object.assign(MUS.pick, JSON.parse(localStorage.getItem('cf_mpick') || '{}')); } catch (e) { }
function musicSlot() {
  const st = $('#start');
  if (!G || !UI.started || (st && !st.hidden)) return ['tavern', 0];
  if (G.phase === 'over' && UI.overShown) return [cfWon() ? 'victory' : 'defeat', 1];
  if (UI.mode !== 'tutorial' && ((UI.camp && UI.camp.boss) || G.round >= LASTD())) return ['fight', 0];
  return ['main', 0];
}
function musicName(slot) {
  const c = MUS.pick[slot] || MDEF[slot]; if (c === 'off') return '-';
  if (c === 'all') { if (!MUS.res[slot]) { const pool = MALL.filter(k => k !== MUS.last); MUS.res[slot] = pool[Math.floor(Math.random() * pool.length)]; } return MUS.res[slot]; }
  if (c === 'shuffle') { if (!MUS.res[slot]) { MUS.sh[slot] = MUS.sh[slot] === undefined ? (Math.random() < .5 ? 0 : 1) : 1 - MUS.sh[slot]; MUS.res[slot] = slot + '-' + 'ab'[MUS.sh[slot]]; } return MUS.res[slot]; }
  return slot + '-' + (c === 'b' ? 'b' : 'a');
}
function musicPick(slot, c) {
  MUS.pick[slot] = c; MUS.res[slot] = null; try { localStorage.setItem('cf_mpick', JSON.stringify(MUS.pick)); } catch (e) { }
  if (window.GA && c !== 'off' && c !== 'shuffle' && c !== 'all') try { GA.preload(musicName(slot)); } catch (e) { }
  if (MUS.wslot === slot && !MUS.prev) { MUS.want = null; musicSync(); }
}
// one cross-faded track at a time; called from a slow tick, the first tap and after the music button or a pick
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
  ['bag-moss', 'bag-ember', 'end-win', 'end-lose'].forEach(preImg);
  ['bag', 'chip'].forEach(n => { const i = new Image(); i.src = MODELS + n + '.webp'; });   // 3D sprites, loaded once
  tableApply();
  setInterval(() => { try { sndMusic(); bagApply(); tableApply(); } catch (e) { } }, 800);
}
// the final scores pick up the end art after each draw
(function () {
  const sf = showFinal; showFinal = function () { const r = sf.apply(this, arguments); try { endBanner(); } catch (e) { } return r; };
})();
