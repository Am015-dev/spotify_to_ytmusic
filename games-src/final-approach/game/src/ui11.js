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
const CK_WORD = it => it.k === 'axis' ? 'Level' : it.k === 'gear' ? 'Gear ' + it.n + '/3' : it.k === 'flaps' ? 'Flaps ' + it.n + '/4' : it.k === 'planes' ? (it.n ? it.n + ' plane' + (it.n > 1 ? 's' : '') : 'No planes') : it.k === 'speed' ? 'Speed ≤' + it.n : it.k === 'air' ? (it.n ? it.n + ' to go' : 'At airport') : it.k === 'intern' ? 'Trainee' : it.k === 'ice' ? 'Ice ' + it.n + '/4' : '';
function ckChips() {
  // phones: the landing-speed chip waits for the landing round (it cannot be met before), so the words fit on one row
  return FA.checklist(G).filter(it => !(it.k === 'speed' && isPh() && !FA.isFinal(G))).map(it => h('span.ck.' + (it.ok ? 'ok' : 'no'), { 'data-k': it.k, 'aria-label': ckLabel(it), title: ckLabel(it) },
    h('b.cw', CK_WORD(it)), h('i.mk', { 'aria-hidden': 'true', html: it.ok ? CK_TICK : CK_CROSS })));
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
function showChip(k, text) { UI.chip = { k, text, until: Date.now() + 5000 }; clearTimeout(UI.chipT); UI.chipT = setTimeout(() => { UI.chip = null; $$('#pz .rchip').forEach(e => e.remove()); }, 5050); }
function chipEl(r) {
  const c = UI.chip; if (!c || c.until < Date.now() || !r[c.k]) return null; const q = r[c.k], txt = clamp8(c.text);
  const e = h('div.rchip', { 'aria-hidden': 'true', style: 'left:' + Math.round(q.x + q.w / 2) + 'px;top:' + Math.round(Math.max(2, q.y - 6)) + 'px' }, txt);
  return e;
}

// ---------- what to do now (turn tracker, preview before you place, round-over card with a rating, slot needs and reasons) 
// Owner, 8 Nov 2026: "not explaining well what the player has to do". Every screen of a flight answers: which round, how high, whose turn, how many dice are left,
// what a die would do before it is placed, why the round ended and how it went. Text is plain and short; numbers come from the engine (never guessed).
const FT = { snap: null, round: -1, sid: null, ro: null, hover: null };
// ---------- what each space needs (shown as the slot's tooltip / label, and as the reason when it cannot take the selected die) ----------
function slotNeedLong(k) {
  const S = FA.SLOT[k], own = S.s === 0 ? 'Pilot' : S.s === 1 ? 'Co-pilot' : 'Either', o = S.s === 0 ? name(1) : name(0);
  switch (S.grp) {
    case 'axis': return own + ': any die. Must match ' + o + "'s axis die within 1, or the plane tilts.";
    case 'engines': return own + ': any die. Both engine dice add up to the speed.';
    case 'radio': return own + ': any die. Clears a plane that many spaces ahead (' + (S.s === 0 ? 'counting this space as 1' : 'counting from the next space') + ').';
    case 'gear': return own + ': ' + S.vals.join(' or ') + '. Lowers this gear and lifts the blue marker by 1.';
    case 'flaps': return own + ': ' + S.vals.join(' or ') + (S.ix ? ', after flap ' + S.ix : '') + '. Lifts the orange marker by 1.';
    case 'brakes': return own + ': exactly ' + S.vals[0] + (S.ix ? ', after the ' + FA.SLOT['br' + (S.ix - 1)].vals[0] : '') + '. Sets the landing speed limit to ' + S.vals[0] + '.';
    case 'conc': return 'Either: any die. Earns a coffee token (nudge a later die by 1).';
    case 'kero': return 'Either: any die. Burns that much fuel (skipping it burns ' + D.keroSkip + ').';
    case 'intern': return own + ': any die but the next token value. Trains the trainee.';
    case 'ice': return (S.row ? 'Either' : 'Pilot') + ': exactly ' + S.vals[0] + '. Both spaces of a column in one round set the brakes.';
  }
  return own + ': ' + slotNeed(k) + '.';
}
// why the selected die cannot go on k (same words as the toast on a tap), or '' when it can
function whyNot(k, v) {
  if (G.slots[k]) return slotName(k) + ' is already used this round.';
  const S = FA.SLOT[k]; if (S.s !== null && S.s !== v) return 'Only the ' + (S.s === 0 ? 'pilot' : 'co-pilot') + ' can use ' + slotName(k) + '.';
  if (UI.sel === -1 || UI.sel == null) return '';
  if (FA.validMoves(G, v).some(x => x.t === 'place' && x.d === UI.sel && x.to === k && (x.c || 0) === (UI.cof || 0))) return '';
  const val = (UI.sel === 'p' ? G.pend.d.val : G.dice[v][UI.sel].v) + (UI.cof || 0);
  if (S.grp === 'flaps' && S.ix > 0 && !G.pl.sw.fl[S.ix - 1]) return 'Flaps go in order: flap ' + S.ix + ' first.';
  if (S.grp === 'brakes' && S.ix > 0 && !G.pl.sw.br[S.ix - 1]) return 'Brakes go in order: 2, then 4, then 6.';
  if (S.vals) return slotName(k) + ' ' + slotNeed(k) + '; your die shows ' + val + '.';
  return 'That die does not fit here.';
}
// ---------- the preview: what this die would do on space k, plus the landing conditions met so far ----------
function landMet() { const L = FA.checklist(G); return L.filter(x => x.ok).length + '/' + L.length; }
function previewText(k, v) {
  const val = (UI.sel === 'p' ? G.pend.d.val : G.dice[v][UI.sel].v) + (UI.cof || 0), S = FA.SLOT[k], o = 1 - v, last = FA.isFinal(G), wm = FA.windMod(G);
  let t = '';
  switch (S.grp) {
    case 'axis': { const x = G.slots['ax' + o]; if (!x) { t = 'Axis: your ' + val + ' goes first; ' + name(o) + "'s die sets the tilt"; break; }
      const nx = G.pl.axis + (v === 0 ? x.v - val : val - x.v); t = 'Axis after: ' + (Math.abs(nx) >= 3 ? 'tilt ' + Math.abs(nx) + ', a spin: the flight ends' : nx === 0 ? 'level' : 'tilt ' + Math.abs(nx) + (nx < 0 ? ' left' : ' right') + (Math.abs(nx) === 2 ? ' (one more is a spin)' : '')); break; }
    case 'engines': { const x = G.slots['en' + o]; if (!x) { t = 'Engines: ' + val + ' + ' + name(o) + "'s die = speed (stay up to " + G.pl.aeroB + ', 1 space up to ' + G.pl.aeroO + ', else 2)'; break; }
      const sm = val + x.v + wm; if (last) { const br = FA.brakeVal(G); t = 'Landing speed ' + sm + ' vs brakes ' + br + ': ' + (sm <= br && br >= 2 ? 'slow enough' : 'too fast, the flight ends'); break; }
      const adv = G.pl.pos >= trackOf().sp.length ? 0 : sm <= G.pl.aeroB ? 0 : sm <= G.pl.aeroO ? 1 : 2, to = G.pl.pos + adv, n = trackOf().sp.length;
      t = 'Speed ' + sm + ': ' + (adv ? 'advance ' + adv + ' (to ' + (to >= n ? 'the airport' : 'space ' + to) + ')' : 'stay on space ' + G.pl.pos) + (to > n ? ', past the airport: crash' : ''); break; }
    case 'radio': { const at = G.pl.pos + val - 1, n = at >= 1 && at <= G.planes.length ? G.planes[at - 1] : 0; t = n ? 'Radio: clears the plane on ' + (at === G.planes.length ? 'the airport' : 'space ' + at) : 'Radio: no plane on ' + (at > G.planes.length ? 'that space' : 'space ' + at) + ', nothing cleared'; break; }
    case 'gear': t = G.pl.sw.lg[S.ix] ? 'Gear ' + (S.ix + 1) + ' is down already: no effect' : 'Gear down: blue marker ' + G.pl.aeroB + ' → ' + Math.min(7, G.pl.aeroB + 1); break;
    case 'flaps': t = G.pl.sw.fl[S.ix] ? 'Flap already out: no effect' : 'Flap out: orange marker ' + G.pl.aeroO + ' → ' + Math.min(12, G.pl.aeroO + 1); break;
    case 'brakes': t = G.pl.sw.br[S.ix] ? 'Brake already set: no effect' : 'Brakes ' + FA.brakeVal(G) + ' → ' + S.vals[0] + ': landing speed may be up to ' + S.vals[0]; break;
    case 'conc': t = G.coffee >= D.coffeeMax ? 'Coffee: already ' + G.coffee + ' tokens, the die is just spent' : 'Coffee: tokens ' + G.coffee + ' → ' + (G.coffee + 1); break;
    default: t = slotName(k) + ': ' + slotNeedLong(k);
  }
  return t + ' · Landing ' + landMet() + ' met';
}
// which space to preview: the one under the pointer, else the coach's, else the best legal one
function previewKey(v) {
  const leg = selectedLegal(); if (!leg.length) return null;
  if (FT.hover && leg.includes(FT.hover)) return FT.hover;
  if (UI.cpt && leg.includes(UI.cpt.k)) return UI.cpt.k;
  try { const m = FA.AI.move(G, v, 'normal', { noMC: true }); if (m && m.t === 'place' && m.d === UI.sel && leg.includes(m.to)) return m.to; } catch (e) { }
  return leg[0];
}
// ---------- the tracker: round x of y, altitude, whose turn, dice left as tokens ----------
function trackerEl() {
  const rows = altRows(), n = rows.length - G.row0, R = rows[G.round + G.row0], v = actSeat(), me = typeof v === 'number' && v >= 0 ? v : 0;
  const turn = G.result ? (G.result.win ? 'Landed' : 'Flight over') : G.phase === 'brief' ? 'Briefing: ' + who(R[1]) + (who(R[1]) === 'You' ? ' go' : ' goes') + ' first' : G.pend && G.pend.h === 'rr' ? 'Reroll' : (who(G.turn) === 'You' ? 'Your turn' : name(G.turn) + "'s turn") + ' (' + pname(G.turn) + ')';
  const toks = s => { const tot = G.dice[s].length, left = G.phase === 'brief' && !G.result ? tot : FA.unusedDice(G, s).length; const w = h('span.ftd.' + (s ? 'c' : 'p'), { 'aria-label': (who(s) === 'You' ? 'You' : name(s)) + ': ' + left + ' of ' + tot + ' dice left' }, h('em', who(s) === 'You' ? 'You' : name(s)));
    for (let i = 0; i < tot; i++) w.appendChild(h('i' + (i < left ? '.on' : ''), '')); return w; };
  return h('div#ftrk', { 'aria-live': 'polite' }, h('b.ftr', 'Round ' + (G.round + 1) + ' of ' + n), h('span.fta', R[0] + ' ft'), h('span.ftt.' + (G.phase === 'place' && !G.result ? (G.turn ? 'c' : 'p') : 'n'), turn), toks(me), toks(1 - me));
}
// ---------- round-over card: why the round ended, what changed, one-line rating ----------
function roSnap() { return { r: G.round, pos: G.pl.pos, axis: G.pl.axis, planes: FA.planesOnTrack(G), lg: G.pl.sw.lg.reduce((a, b) => a + b, 0), fl: G.pl.sw.fl.reduce((a, b) => a + b, 0), br: FA.brakeVal(G), cof: G.coffee }; }
function roRating(a, b) {
  const n = trackOf().sp.length, rows = D.rounds - G.row0, left = rows - 1 - b.r, need = n - b.pos, tilt = Math.abs(b.axis);
  if (tilt >= 2) return ['poor', 'The plane is tilted ' + tilt + ': next round the axis dice must lean the other way.'];
  if (need > 2 * left) return ['poor', need + ' spaces to go with ' + left + ' round' + (left === 1 ? '' : 's') + ' left: more engine speed next round.'];
  if (b.planes > 0 && b.pos < n && G.planes.slice(b.pos - 1, b.pos + 1).some(x => x > 0)) return ['okay', 'A plane is right ahead: use the radio before you fly on.'];
  if (tilt === 1 || need > left) return ['okay', tilt ? 'A small tilt to fix: keep the axis dice close.' : need + ' spaces to go in ' + left + ' round' + (left === 1 ? '' : 's') + ': a little behind, aim for speed above the blue marker.'];
  return ['good', 'Level and on schedule' + (b.lg + b.fl > a.lg + a.fl ? ', and more switches green' : '') + '.'];
}
function roShow(a) {
  const b = roSnap(), n = trackOf().sp.length, mv = b.pos - a.pos, rt = roRating(a, b), sp = G.log.slice().reverse().find(l => /speed|Speed/.test(typeof l === 'string' ? l : (l.t || '')));
  const lines = [
    'Plane: ' + (mv ? 'moved ' + mv + ' space' + (mv > 1 ? 's' : '') : 'stayed put') + ' → ' + (b.pos >= n ? 'on the airport' : 'space ' + b.pos + ' of ' + n),
    'Axis: ' + (b.axis === 0 ? 'level' : 'tilted ' + Math.abs(b.axis) + (b.axis < 0 ? ' left' : ' right')),
    a.planes !== b.planes ? 'Planes cleared: ' + (a.planes - b.planes) + ' (' + b.planes + ' left)' : b.planes ? 'Planes on the track: ' + b.planes : 'No planes on the track',
    'Gear ' + b.lg + '/3 · Flaps ' + b.fl + '/4 · Brakes ' + b.br + ' · Coffee ' + b.cof];
  roHide();
  const el = h('div.fa-ro.' + (hintsMode() ? rt[0] : 'good'), { role: 'dialog', 'aria-label': 'Round ' + (a.r + 1) + ' over' },
    h('div.rh', h('b', 'Round ' + (a.r + 1) + ' over'), h('span', 'Why: all 8 dice are placed.')), h('ul', ...lines.map(t => h('li', t))),
    hintsMode() ? h('p.rr', h('b', rt[0] === 'good' ? 'Good' : rt[0] === 'okay' ? 'Okay' : 'Watch out'), ' ' + rt[1]) : null, h('button.rgo', { type: 'button', 'data-ro': 'go' }, 'Next round'));
  el.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-ro]')) roHide(); });
  document.body.appendChild(el); FT.ro = el; clearTimeout(FT.roT); FT.roT = setTimeout(roHide, UI.fc && !UI.fc.ended ? 14000 : 8000);
}
// ---------- the Goal, one card before turn 1 (Addendum 7): the win condition in one sentence and three bullets on how you get there ----------
function goalCard(inStory) {
  const n = D.rounds - G.row0, mods = scenOf().mods.map(m => D.mods[m] && D.mods[m].name).filter(Boolean);
  return h('div.fgoal', h(inStory ? 'h3' : 'b', 'Goal: land together in round ' + n + '.'),
    h('ul', h('li', 'Axis: both dice close, or the plane tilts. Tilt 3 crashes.'),
      h('li', 'Engines: your two dice add up. Fast enough moves you closer.'),
      h('li', 'Spare dice: clear planes, lower gear and flaps, set brakes. The checklist shows what is left.')),
    mods.length ? h('p', 'Today also: ' + mods.join(', ') + '.') : null);
}
function goalShow() {
  roHide(); const el = h('div.fa-ro.fa-goal', { role: 'dialog', 'aria-label': 'Goal' }, goalCard(false), h('button.rgo', { type: 'button', 'data-ro': 'go' }, 'Got it'));
  el.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-ro]')) roHide(); }); document.body.appendChild(el); FT.ro = el; clearTimeout(FT.roT);
}
function roHide() { clearTimeout(FT.roT); if (FT.ro) { const e = FT.ro; FT.ro = null; e.classList.add('out'); setTimeout(() => { try { e.remove(); } catch (er) { } }, 220); } }
function roPoll() {
  if (!G || !UI.started) { FT.round = -1; return; }
  if (FT.sid !== G.seed + ':' + G.sid) { FT.sid = G.seed + ':' + G.sid; FT.round = G.round; FT.snap = roSnap(); roHide(); if (isPh() && G.round === 0 && G.phase === 'brief' && !(UI.cfg && UI.cfg.tutorial) && !UI.camp && UI.mode === 'vs' && !G.lad && !/[?&]scn=/.test(location.search)) goalShow(); return; }   // ?scn= states skip menus and cards
  if (G.result) { roHide(); FT.round = G.round; return; }
  if (FT.ro && G.phase !== 'brief') roHide();   // the card lives in the briefing only: rolling the dice puts the board first again
  if (G.round !== FT.round) { const a = FT.snap; FT.round = G.round; if (a && G.round === a.r + 1 && UI.mode !== 'net') roShow(a); FT.snap = roSnap(); }
}
setInterval(() => { try { roPoll(); } catch (e) { } }, 300);
// ---------- after every render: tracker, preview, slot needs and reasons, the coach's pointer ----------
function ftAfter() {
  if (!G || !UI.started) return;
  if (typeof fcMute === 'function') fcMute();
  const db = $('#dockbody'); if (db) { const old = $('#ftrk'); const t = trackerEl(); if (old) old.replaceWith(t); else db.insertBefore(t, db.firstChild); }
  const v = actSeat(), sel = typeof v === 'number' && v >= 0 && mayAct(v) && G.phase === 'place' && !G.result && (UI.sel === 'p' || (typeof UI.sel === 'number' && UI.sel >= 0));
  let pv = $('#fprev'); if (!pv && db) { pv = h('div#fprev', { 'aria-live': 'polite' }); const pd = $('#promptDock'); if (pd && pd.nextSibling) db.insertBefore(pv, pd.nextSibling); else db.appendChild(pv); }
  if (pv) { const k = sel && hintsMode() ? previewKey(v) : null; pv.hidden = !k && !UI.askWhy; pv.textContent = k ? previewText(k, v) : UI.askWhy || ''; pv.classList.toggle('bad', !!k && /crash|ends|spin|too fast/i.test(pv.textContent)); }
  // Hints on: the "What should I do?" button joins the actions on your turn (Addendum 7)
  const ac = $('#acts'), mineNow = typeof v === 'number' && v >= 0 && mayAct(v) && G.phase === 'place' && !G.pend && G.turn === v && !G.result;
  if (ac && UI.prefs.hints && mineNow && !(UI.fc && !UI.fc.ended) && !ac.querySelector('[data-a=ask]')) ac.appendChild(h('button.btn.ask', { type: 'button', 'data-a': 'ask' }, 'What should I do?'));
  $$('#pz .slot[data-slot]').forEach(e => { const k = e.dataset.slot; if (!FA.SLOT[k]) return; const why = sel && !e.classList.contains('legal') ? whyNot(k, v) : '';
    e.title = why || slotNeedLong(k); e.classList.toggle('nofit', !!why); e.classList.toggle('cpt', !!(UI.cpt && UI.cpt.k === k)); });
  $$('#pz .die[data-s="0"]').forEach(e => e.classList.toggle('cpt', !!(UI.cpt && String(UI.cpt.d) === e.dataset.d && UI.sel !== UI.cpt.d)));
}
document.addEventListener('pointerover', e => { if (!hintsMode()) return; const s = e.target.closest && e.target.closest('#pz .slot[data-slot]'); const k = s ? s.dataset.slot : null; if (k !== FT.hover) { FT.hover = k; try { const v = actSeat(); const pv = $('#fprev'); if (pv && k && typeof v === 'number' && v >= 0 && (UI.sel === 'p' || UI.sel >= 0)) { const why = whyNot(k, v); if (why) { pv.hidden = false; pv.textContent = why; pv.classList.add('bad'); } else if (selectedLegal().includes(k)) { pv.hidden = false; pv.textContent = previewText(k, v); pv.classList.toggle('bad', /crash|ends|spin|too fast/i.test(pv.textContent)); } } } catch (er) { } } });
(function () {
  const st = document.createElement('style');
  st.textContent = '#ftrk{display:flex;flex-wrap:wrap;align-items:center;gap:4px 8px;padding:6px 8px;margin:0 0 6px;border-radius:10px;background:#0f1a26;color:#fff;font-size:15px;line-height:1.25;font-weight:700}' +
    '#ftrk .ftr{font-weight:900}#ftrk .fta{color:#ffe08a}#ftrk .ftt{padding:1px 8px;border-radius:8px;background:#334}#ftrk .ftt.p{background:#1d4f9a}#ftrk .ftt.c{background:#a24a0b}' +
    '#ftrk .ftd{display:inline-flex;align-items:center;gap:3px}#ftrk .ftd em{font-style:normal;font-size:14px;margin-right:2px}#ftrk .ftd i{width:11px;height:11px;border-radius:3px;border:1.5px solid rgba(255,255,255,.55);opacity:.45}' +
    '#ftrk .ftd.p i.on{background:#3d7fe0;border-color:#cfe0ff;opacity:1}#ftrk .ftd.c i.on{background:#f08a24;border-color:#ffe0c0;opacity:1}' +
    '#fprev{margin:4px 0;padding:6px 10px;border-radius:10px;background:#e9f6ea;color:#0d2a12;border:2px solid #2e8b45;font-size:15px;line-height:1.3;font-weight:700}#fprev.bad{background:#fde9e6;color:#5c0f08;border-color:#c0392b}' +
    'html.ph #ftrk{display:none!important}.altdots.ftk{gap:2px}.altdots .dk{width:10px;height:14px;border-radius:3px;border:1.5px solid rgba(255,255,255,.6);opacity:.4}.altdots .dk.p.on{background:#3d7fe0;opacity:1}.altdots .dk.c.on{background:#f08a24;opacity:1}.altdots .dsep{width:4px}html.ph #fprev{font-size:14px;padding:4px 8px;margin:2px 0}' +
    '.fa-goal{border-color:#1d4f9a}.fa-goal b,.fa-goal h3{display:block;font-size:17px;line-height:1.3;margin:0 0 6px}.fa-goal ul{margin:6px 0 10px}.fgoal ul{padding-left:18px}.fgoal li{margin:3px 0}.stbox .fgoal{background:#e8f0fb;color:#10223a;border-radius:12px;padding:10px 14px;margin:0 0 10px}' +
    '#acts .btn.ask{background:#fff4d6;color:#3a2a00;border:2px solid #c98a12}.gxh-bulb.hon{box-shadow:0 0 0 3px #ffd46b,0 0 14px #ffd46b}' +
    '#pz .slot .sword{display:block;font-size:14px;line-height:1.1;font-weight:800;letter-spacing:-.3px;color:#fff;background:rgba(10,18,30,.9);border-radius:5px;padding:0 3px;white-space:nowrap}html.ph #pz .slot.hasv .sl{background:rgba(10,18,30,.9);border-radius:5px;padding:0 3px;color:#fff}html.ph #pz .slot .r1{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;opacity:.4;pointer-events:none;z-index:0}html.ph #pz .slot .sword,html.ph #pz .slot .sl{position:relative;z-index:1}html.ph #pz .slot.hasv .sl{font-size:14px;line-height:1.05}' +
    '.ck .cw{font-size:14px;font-weight:800;white-space:nowrap;padding:0 3px}html.ph .gstrip.chk .ckrow{gap:5px;flex-wrap:nowrap;padding-right:0}html.ph .ck{padding:0 1px}html.ph .gstrip.chk .gi{display:none}html.ph .gstrip.chk{padding:2px 4px}'+
    '@media (min-width:1024px){#pz .slot .sword,.ck .cw{font-size:16px}}' +
    '#pz .slot.nofit{filter:grayscale(.85) brightness(.75)}#pz .slot.cpt{outline:4px solid #6dffb0;outline-offset:3px;box-shadow:0 0 0 7px rgba(109,255,176,.35);animation:fa-cpt 1.1s ease-in-out infinite}#pz .die.cpt{outline:4px dashed #6dffb0;outline-offset:3px}' +
    '@keyframes fa-cpt{50%{outline-color:rgba(109,255,176,.35)}}' +
    '.fa-ro{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:9970;width:min(380px,calc(100vw - 24px));padding:14px 16px;border-radius:16px;background:#f3ead4;color:#1f1a12;border:3px solid #2e8b45;box-shadow:0 12px 32px rgba(0,0,0,.55);font-size:15px;line-height:1.35;animation:fa-roin .25s ease-out both}' +
    '.fa-ro.okay{border-color:#c98a12}.fa-ro.poor{border-color:#b3261e}.fa-ro.out{opacity:0;transition:opacity .2s}.fa-ro .rh b{display:block;font-size:20px}.fa-ro .rh span{display:block;font-size:14px;color:#4a3d27}' +
    '.fa-ro ul{margin:8px 0;padding:0 0 0 18px}.fa-ro li{margin:2px 0}.fa-ro .rr{margin:6px 0 10px;font-weight:700}.fa-ro .rgo{width:100%;min-height:46px;border-radius:12px;border:0;background:#1d4f9a;color:#fff;font-size:16px;font-weight:800}' +
    '@keyframes fa-roin{from{opacity:0;transform:translate(-50%,-46%)}to{opacity:1;transform:translate(-50%,-50%)}}@media (min-width:1024px){#ftrk,#fprev,.fa-ro,.fa-ro .rh span,#ftrk .ftd em{font-size:16px}}' +
    '@media (prefers-reduced-motion:reduce){#pz .slot.cpt,.fa-ro{animation:none}}';
  document.head.appendChild(st);
})();
