// ===================== part 11: the goal always in view (plane picture + landing checklist), what a die would do, the co-pilot's reason chips =====================
// The learning ladder (story chapters 1-6, G.lad) brings ONE system in at a time; these pieces show where the flight stands in every chapter.
const LADN = [0, 'Keep it level', 'Speed and the runway', 'Clear the way', 'Wheels and flaps', 'Brakes', 'Coffee and rerolls'];
// ---------- the landing checklist: one icon per condition that applies now (green tick = met right now, red cross = not yet) ----------
const CK_ICO = {
  axis: ICO.axis, gear: ICO.gear, flaps: ICO.flaps, intern: ICO.intern, ice: ICO.ice,
  air: '<path d="M3 20h18M7 20l2.5-13h5L17 20M12 8.500v2.500M12 13v2"/>',
  speed: '<path d="M4 17a8 8 0 1 1 16 0M12 17l4-6"/><circle cx="12" cy="17" r="1.300"/>',
  planes: '<path d="M12 3l1.800 6 6.200 3v2l-6.200-1.500L13 18l2 1.500V21l-3-.800-3 .800v-1.500l2-1.500-.800-4.500L4 14v-2l6.200-3z"/>'
};
const CK_NAME = { axis: 'Plane level', air: 'On the airport', speed: 'Speed within the brakes', planes: 'No planes on the track', gear: 'Landing gear down', flaps: 'Flaps out', intern: 'Trainee trained', ice: 'Icy brakes done' };
const CK_TICK = '<svg viewBox="0 0 16 16"><path d="M3 8.500l3.200 3.200L13 4.500" fill="none" stroke="#fff" stroke-width="2.800" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CK_CROSS = '<svg viewBox="0 0 16 16"><path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="#fff" stroke-width="2.800" stroke-linecap="round"/></svg>';
function ckNum(it) { return it.k === 'gear' ? String(it.n) : it.k === 'flaps' ? String(it.n) : it.k === 'planes' ? (it.n ? String(it.n) : '') : it.k === 'speed' ? '≤' + it.n : it.k === 'air' ? (it.n ? String(it.n) : '') : ''; }
function ckLabel(it) { return CK_NAME[it.k] + ': ' + (it.ok ? 'yes' : 'not yet') + (it.k === 'speed' ? ' (brakes ' + it.n + ')' : it.k === 'planes' && it.n ? ' (' + it.n + ' left)' : it.k === 'air' && it.n ? ' (' + it.n + ' spaces to go)' : it.k === 'gear' || it.k === 'flaps' ? ' (' + it.n + ')' : ''); }
function ckChips() {
  return FA.checklist(G).map(it => h('span.ck.' + (it.ok ? 'ok' : 'no'), { 'data-k': it.k, 'aria-label': ckLabel(it), title: ckLabel(it) },
    h('i.ic', { 'aria-hidden': 'true', html: '<svg viewBox="0 0 24 24">' + (CK_ICO[it.k] || '') + '</svg>' }), ckNum(it) ? h('b.nn', ckNum(it)) : null, h('i.mk', { 'aria-hidden': 'true', html: it.ok ? CK_TICK : CK_CROSS })));
}
// the dock strip: the checklist and one info button (the board is the screen; this is the one place to look to know if you are winning)
function goalStrip() {
  const fin = FA.isFinal(G), t = G.lad && G.lad < 6 ? LADN[G.lad] : fin ? 'Landing round' : 'Land by round ' + (D.rounds - G.row0);
  return h('button.goalb.gstrip.chk', { type: 'button', 'data-a': 'goalopen', 'aria-label': t + '. Landing checklist: ' + FA.checklist(G).map(ckLabel).join(', ') + '. Tap for details.' }, h('span.ckrow', ckChips()), h('i.gi', { 'aria-hidden': 'true' }, 'i'));
}
function landList() {
  const T = { axis: it => 'Plane level (now ' + (G.pl.axis === 0 ? 'level' : Math.abs(G.pl.axis) + (G.pl.axis < 0 ? ' left' : ' right') + ')'), air: it => 'On the airport when the last round starts' + (it.n ? ' (' + it.n + ' to go)' : ''), speed: it => 'Landing speed no more than the brakes (' + it.n + ')', planes: it => 'No planes left on the track (' + it.n + ' to go)', gear: it => 'All landing gear down (' + it.n + '/3)', flaps: it => 'All flaps out (' + it.n + '/4)', intern: it => 'Trainee finished (' + (6 - it.n) + ' tokens left)', ice: it => 'Icy-runway track finished (' + it.n + '/4)' };
  return FA.checklist(G).map(it => [it.ok ? true : (it.k === 'speed' && FA.brakeVal(G) < 2 && G.lad !== 5 && !G.autoBrake ? null : false), T[it.k](it)]);
}
function goalFull() {
  const size = trackOf().sp.length, pos = G.pl.pos, last = D.rounds - G.row0, fin = FA.isFinal(G), eng = G.keys.includes('en0');
  const need = size - pos, moves = last - 1 - G.round - (G.slots.en0 && G.slots.en1 ? 1 : 0);
  const route = !eng ? 'Seven rounds. End the last one with the plane level.' : fin ? 'Landing now: the plane stays put, speed must be within the brakes' : pos >= size ? 'On the airport: hold here until round ' + last : need + ' space' + (need > 1 ? 's' : '') + ' to the airport, ' + Math.max(0, moves) + ' round' + (moves === 1 ? '' : 's') + ' left to fly there';
  return h('div.goalb', h('span.gr', h('b', fin ? 'Round ' + last + ' · ' : ''), route), h('span.gc', ckChips()), G.keys.includes('lg0') && !fin ? (late => late ? h('span.dg', '⚠ ' + late) : null)(behind()) : null);
}
// ---------- the picture: the plane seen from behind, coming in toward the runway ----------
// tilt = the axis, gear and flaps drawn when set, the runway grows as the airport gets near, planes ahead on the approach, speed against the brakes.
function planeSVG(tilt, gear, flaps, id) {
  const wing = (s) => '<path d="M' + s * 7 + ' 3L' + s * 58 + ' -3L' + s * 58 + ' 3L' + s * 9 + ' 9Z" fill="#dfe8ef" stroke="#14202c" stroke-width="2.200" stroke-linejoin="round"/>';
  const fl = [[-34, -12], [12, 34], [-56, -36], [36, 56]];
  let g = '';
  for (let i = 0; i < 4; i++) if (flaps > i) g += '<rect x="' + fl[i][0] + '" y="8" width="' + (fl[i][1] - fl[i][0]) + '" height="7" rx="1.500" fill="#f29a3e" stroke="#14202c" stroke-width="1.500"/>';
  const leg = (x) => '<path d="M' + x + ' 11v20" stroke="#14202c" stroke-width="3.500"/><path d="M' + x + ' 11v20" stroke="#aeb9c4" stroke-width="1.800"/><circle cx="' + x + '" cy="33" r="5.500" fill="#2c3e4c" stroke="#e8f0f6" stroke-width="2"/>';
  const gr = (gear > 0 ? leg(-17) : '') + (gear > 1 ? leg(17) : '') + (gear > 2 ? leg(0) : '');
  return '<g class="pvr" id="' + id + '">' + gr + wing(-1) + wing(1) + g +
    '<circle cx="-30" cy="13" r="6" fill="#8f9daa" stroke="#14202c" stroke-width="2"/><circle cx="30" cy="13" r="6" fill="#8f9daa" stroke="#14202c" stroke-width="2"/>' +
    '<rect x="-17" y="-14" width="34" height="5" rx="2" fill="#dfe8ef" stroke="#14202c" stroke-width="2"/><path d="M-3 -12L0 -36L3 -12Z" fill="#e8f0f6" stroke="#14202c" stroke-width="2" stroke-linejoin="round"/>' +
    '<ellipse cx="0" cy="1" rx="10" ry="12" fill="#f3f7fa" stroke="#14202c" stroke-width="2.200"/><path d="M-4 -4h8" stroke="#2f6fd0" stroke-width="3" stroke-linecap="round"/>' +
    '<circle cx="-58" cy="0" r="7" fill="#2f6fd0" stroke="#fff" stroke-width="2"/>' +
    '<circle cx="58" cy="0" r="7" fill="#e8821f" stroke="#fff" stroke-width="2"/></g>';
}
function miniPlane(n) { return '<g><path d="M-9 1L-1 -1L1 -1L9 1L9 3L1 2L-1 2L-9 3Z" fill="#e8f0f6" stroke="#14202c" stroke-width="1.200" stroke-linejoin="round"/><path d="M0 -8L1.500 0L-1.500 0Z" fill="#e8f0f6" stroke="#14202c" stroke-width="1"/></g>'; }
function sceneHTML(wpx, hpx, stripH, hz) {
  const comp = hpx < 92, a = G.pl.axis, eng = G.keys.includes('en0'), size = trackOf().sp.length, pos = G.pl.pos, round = Math.min(G.round, 6);
  const gear = G.pl.sw.lg.reduce((x, y) => x + y, 0), flaps = G.pl.sw.fl.reduce((x, y) => x + y, 0), fin = FA.isFinal(G);
  const sh = comp ? hpx : hpx - stripH, cx = wpx / 2;
  const old = UI.pvA && Date.now() - UI.pvA.t0 < 950 ? UI.pvA : null;
  const ang = x => Math.max(-3, Math.min(3, x)) * 10;
  const anim = old ? ' style="animation:pvtilt .9s cubic-bezier(.3,1.5,.5,1) both;animation-delay:-' + (Date.now() - old.t0) + 'ms;--af:' + ang(old.from) + 'deg;--at:' + ang(old.to) + 'deg"' : ' style="transform:rotate(' + ang(a) + 'deg)"';
  let svg;
  if (comp) {
    // a small phone in the full cockpit: just the plane at the left of the approach window, tilted and with its gear and flaps
    const sc = Math.max(.22, Math.min(.5, sh / 118));
    svg = '<svg viewBox="0 0 ' + wpx + ' ' + hpx + '" width="' + wpx + '" height="' + hpx + '"><g transform="translate(' + Math.round(sc * 62 + 4) + ' ' + Math.round(hpx * .55) + ') scale(' + sc + ')"><g class="pvt"' + anim + '>' + planeSVG(a, gear, flaps, 'pvp') + '</g></g></svg>';
    return '<div class="pv comp" aria-hidden="true">' + svg + '</div>';
  }
  // progress toward the runway: the airport along the approach, or the rounds in chapter 1 (no track yet)
  const p = eng ? (size > 1 ? (pos - 1) / (size - 1) : 1) : round / 6, hy = sh * hz;
  const yr = hy + (sh - hy) * (.4 + .5 * Math.pow(p, 1.1)), wr = wpx * (.34 + .42 * p), yf = hy + (yr - hy) * .12, wf = wr * .2;
  const py = sh * (.6 + .2 * round / 6), sc = Math.max(.32, Math.min(wpx * .21, sh * .3 * 1.6) / 62);
  let s = '<defs><linearGradient id="pvg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16303a" stop-opacity=".25"/><stop offset="1" stop-color="#0c1a22" stop-opacity=".78"/></linearGradient></defs>';
  s += '<rect x="0" y="' + hy + '" width="' + wpx + '" height="' + (sh - hy) + '" fill="url(#pvg)"/>';
  s += '<polygon points="' + (cx - wf / 2) + ',' + yf + ' ' + (cx + wf / 2) + ',' + yf + ' ' + (cx + wr / 2) + ',' + yr + ' ' + (cx - wr / 2) + ',' + yr + '" fill="#566272" stroke="#e6edf2" stroke-width="2.5"/>';
  for (let i = 0; i < 3; i++) { const t0 = .12 + i * .3, t1 = t0 + .16, ya = yf + (yr - yf) * t0, yb = yf + (yr - yf) * t1, wa = wf + (wr - wf) * t0 * .12, wb = wf + (wr - wf) * t1 * .12; s += '<polygon points="' + (cx - wa * .04 - 1) + ',' + ya + ' ' + (cx + wa * .04 + 1) + ',' + ya + ' ' + (cx + wb * .07 + 2) + ',' + yb + ' ' + (cx - wb * .07 - 2) + ',' + yb + '" fill="#f4e9c8"/>'; }
  for (let i = 1; i <= 5; i++) { const y = yr + (py - sh * .2 - yr) * (i / 6) * 1; if (y > yr && y < sh) s += '<circle cx="' + (cx - wr * (.5 + i * .02)) + '" cy="' + y + '" r="' + (1.5 + i * .5) + '" fill="#ffd27a" opacity=".8"/><circle cx="' + (cx + wr * (.5 + i * .02)) + '" cy="' + y + '" r="' + (1.5 + i * .5) + '" fill="#ffd27a" opacity=".8"/>'; }
  // planes ahead, on the road between you and the runway (their space, nearer ones lower and bigger)
  if (eng) for (let j = pos; j <= size; j++) { const n = G.planes[j - 1]; if (!n) continue; const f = size > pos ? (j - pos) / (size - pos) : 0, y = (py - sh * .22) + (Math.min(yr, py - sh * .3) - (py - sh * .22)) * f, scl = (1.7 - f * 0.9) * Math.max(.7, sh / 150);
    for (let q = 0; q < n; q++) s += '<g transform="translate(' + (cx + (q - (n - 1) / 2) * 22 * scl) + ' ' + Math.max(hy + 4, y) + ') scale(' + scl + ')">' + miniPlane() + (j === pos ? '<circle r="12" fill="none" stroke="#ff6b55" stroke-width="2.500"/>' : '') + '</g>'; }
  s += '<g transform="translate(' + cx + ' ' + py + ') scale(' + sc + ')"><g class="pvt"' + anim + '>' + planeSVG(a, gear, flaps, 'pvp') + '</g></g>';
  svg = '<svg viewBox="0 0 ' + wpx + ' ' + sh + '" width="' + wpx + '" height="' + sh + '" preserveAspectRatio="none">' + s + '</svg>';
  // the numbers beside the picture: speed against the brakes
  let chips = '';
  if (eng) { const br = FA.brakeVal(G), sp = G.speed, bad = fin && G.landSpeed >= 0 && G.landSpeed > br; chips = '<div class="pvs" aria-hidden="true">' + (sp >= 0 ? '<span class="sp1' + (bad ? ' bad' : '') + '"><i class="ic"><svg viewBox="0 0 24 24">' + CK_ICO.speed + '</svg></i><b>' + sp + '</b></span>' : '') + (fin || G.lad >= 5 || !G.lad ? '<span class="br1"><i class="ic"><svg viewBox="0 0 24 24">' + ICO.brakes + '</svg></i><b>' + br + '</b></span>' : '') + '</div>'; }
  return '<div class="pv" aria-hidden="true">' + svg + chips + '</div>';
}
// ---------- what a die would do: shown on each glowing slot (a short number and word, no sentence) ----------
function slotPreview(k, v, val) {
  const S = FA.SLOT[k], o = 1 - v, last = FA.isFinal(G), wm = FA.windMod(G);
  switch (S.grp) {
    case 'axis': { const x = G.slots['ax' + o]; if (!x) return { big: String(val), cap: 'first' }; const nx = G.pl.axis + (v === 0 ? x.v - val : val - x.v); return { big: String(Math.abs(nx)), cap: Math.abs(nx) >= 3 ? 'SPIN' : nx === 0 ? 'level' : nx < 0 ? 'left' : 'right', bad: Math.abs(nx) >= 3 || (last && nx !== 0), good: nx === 0 }; }
    case 'engines': { const x = G.slots['en' + o]; if (!x) return { big: String(val), cap: 'first' }; const sm = val + x.v + wm; if (last) { const br = FA.brakeVal(G); return { big: String(sm), cap: sm <= br && br >= 2 ? 'ok' : 'fast', bad: !(sm <= br && br >= 2), good: sm <= br && br >= 2 }; } const adv = sm <= G.pl.aeroB ? 0 : sm <= G.pl.aeroO ? 1 : 2; return { big: String(sm), cap: adv ? '+' + adv : 'stay' }; }
    case 'radio': { const at = G.pl.pos + val - 1, n = at >= 1 && at <= G.planes.length ? G.planes[at - 1] : 0; return { big: at === G.planes.length ? 'A' : String(Math.max(1, at)), cap: n ? 'clear' : 'empty', good: !!n }; }
    case 'gear': return G.pl.sw.lg[S.ix] ? { big: '=', cap: 'same' } : { big: '↓', cap: 'down', good: true };
    case 'flaps': return G.pl.sw.fl[S.ix] ? { big: '=', cap: 'same' } : { big: '↓', cap: 'out', good: true };
    case 'brakes': return G.pl.sw.br[S.ix] ? { big: '=', cap: 'same' } : { big: String(S.vals[0]), cap: 'brake', good: true };
    case 'conc': return { big: '+1', cap: 'coffee', good: true };
  }
  return null;
}
// ---------- the co-pilot's placement: a short reason (8 words or fewer) on the slot it used, worked out from the state before the move ----------
function aiChip(m, seat) {
  if (!m || m.t !== 'place' || m.d === 'p') return null;
  const S = FA.SLOT[m.to], val = G.dice[seat][m.d].v + (m.c || 0), o = 1 - seat, last = FA.isFinal(G), wm = FA.windMod(G);
  switch (S.grp) {
    case 'axis': { const x = G.slots['ax' + o]; if (!x) return 'Axis die down. Yours decides the tilt.'; const nx = G.pl.axis + (seat === 0 ? x.v - val : val - x.v); return nx === 0 ? 'Keeps the plane level.' : 'Tilt ' + Math.abs(nx) + (nx < 0 ? ' left.' : ' right.') + (Math.abs(nx) >= 2 ? ' Watch it!' : ''); }
    case 'engines': { const x = G.slots['en' + o]; if (!x) return 'Engine die down. Yours adds to it.'; const sm = val + x.v + wm; if (last) return sm <= FA.brakeVal(G) ? 'Speed ' + sm + '. Slow enough.' : 'Speed ' + sm + '. Too fast!'; const adv = sm <= G.pl.aeroB ? 0 : sm <= G.pl.aeroO ? 1 : 2; return 'Speed ' + sm + (adv ? ': moves ' + adv + (adv > 1 ? ' spaces.' : ' space.') : ': holds position.'); }
    case 'radio': { const at = G.pl.pos + val - 1, n = at >= 1 && at <= G.planes.length ? G.planes[at - 1] : 0; return n ? 'Radio clears the plane ahead.' : 'Radio: nothing to clear.'; }
    case 'gear': return G.pl.sw.lg[S.ix] ? 'Gear already down.' : 'Lowers a landing gear.';
    case 'flaps': return G.pl.sw.fl[S.ix] ? 'Flap already out.' : 'Extends a flap.';
    case 'brakes': return G.pl.sw.br[S.ix] ? 'Brake already set.' : 'Sets the brakes to ' + S.vals[0] + '.';
    case 'conc': return 'Earns a coffee token.';
    case 'kero': return 'Burns ' + val + ' fuel.';
    case 'intern': return 'Trains the trainee.';
  }
  return null;
}
function showChip(k, text) { UI.chip = { k, text, until: Date.now() + 2600 }; clearTimeout(UI.chipT); UI.chipT = setTimeout(() => { UI.chip = null; $$('#pz .rchip').forEach(e => e.remove()); }, 2650); }
function chipEl(r) {
  const c = UI.chip; if (!c || c.until < Date.now() || !r[c.k]) return null; const q = r[c.k], txt = clamp8(c.text);
  const e = h('div.rchip', { 'aria-hidden': 'true', style: 'left:' + Math.round(q.x + q.w / 2) + 'px;top:' + Math.round(Math.max(2, q.y - 6)) + 'px' }, txt);
  return e;
}
