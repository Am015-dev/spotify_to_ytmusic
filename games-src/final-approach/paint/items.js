// Final Approach painted items: dice, tokens, slot wells, dials. Every function returns the inner SVG of its own canvas.
'use strict';
const B = require('./brush.js');
const { f, rng, mix, lit, drk, blob, circ, ell, rrect, pillow, taper, part, shadow, inkLine, sparkle, face, INK } = B;

const BLUE = '#2f6fd0', ORANGE = '#e8821f', IVORY = '#f8f2e2', STEEL = '#aeb8c2', NAVY = '#1c2a3d', TEAL = '#2c5f6c';

// ---------------- dice: 128 x 128 cell ----------------
// pip layouts on a 3x3 grid
const PIPS = { 1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]], 5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]] };
function die(body, pipCol, v, seed, o) {
  o = o || {}; const x0 = 20, y0 = 16, w = 88, h = 88, rr = 22;
  let s = shadow(rrect(x0 + 4, y0 + 18, w, h, rr), .38, 'soft2', 4, 8);
  // lower side face (gives the cube some body)
  s += part(rrect(x0, y0 + 10, w, h, rr), drk(body, .32), { filter: 'paintS', box: [x0, y0, x0 + w, y0 + h + 10], st: { n: 5, w: 14, ang: 0, op: .2 }, seed: seed + 1 });
  s += part(rrect(x0, y0, w, h, rr), body, { filter: 'paintS', box: [x0, y0, x0 + w, y0 + h], st: { n: 9, w: 18, ang: -35, op: .3 }, seed });
  // top gloss
  s += `<path d="${rrect(x0 + 10, y0 + 8, w - 28, 18, 9)}" fill="#fff" opacity=".28" filter="url(#soft2)"/>`;
  const cell = w / 3.6, cx = x0 + w / 2, cy = y0 + h / 2;
  if (v) for (const [gx, gy] of PIPS[v]) { const px = cx + (gx - 1) * cell, py = cy + (gy - 1) * cell;
    s += `<ellipse cx="${f(px)}" cy="${f(py + 1.5)}" rx="${f(cell * .38)}" ry="${f(cell * .38)}" fill="${pipCol}" stroke="${INK}" stroke-width="2.2" filter="url(#wob)"/><circle cx="${f(px - cell * .12)}" cy="${f(py - cell * .12 + 1)}" r="${f(cell * .1)}" fill="#fff" opacity=".45"/>`; }
  if (o.back) { // covered die: question mark plate
    s += `<path d="M${cx - 8} ${cy - 14}Q${cx - 8} ${cy - 26} ${cx + 4} ${cy - 26}Q${cx + 16} ${cy - 26} ${cx + 16} ${cy - 15}Q${cx + 16} ${cy - 8} ${cx + 6} ${cy - 2}Q${cx} ${cy + 3} ${cx} ${cy + 8}" fill="none" stroke="${pipCol}" stroke-width="9" stroke-linecap="round"/><circle cx="${cx}" cy="${cy + 21}" r="5.5" fill="${pipCol}"/>`; }
  return s;
}
const dieBlue = (v, seed) => die(BLUE, '#fdf8e8', v, seed || 3);
const dieOrange = (v, seed) => die(ORANGE, '#fffaf0', v, seed || 5);
const dieBlack = (v, seed) => die('#33333f', '#f4e9c8', v, seed || 7);
const dieBack = (col, seed) => die(col, '#fffaf0', 0, seed || 9, { back: true });
// trainee token: white round chit with a big numeral drawn as pips (kept numeric by DOM text in the UI; the art has a plain face)
function chit(v, seed) {
  let s = shadow(circ(64, 66, 44), .36, 'soft2', 3, 7);
  s += part(circ(64, 62, 44), '#f4efe0', { filter: 'paintS', box: [18, 18, 110, 108], st: { n: 6, w: 16, ang: -30, op: .25 }, seed });
  s += `<circle cx="64" cy="62" r="33" fill="none" stroke="${mix(INK, '#ffffff', .4)}" stroke-width="3" stroke-dasharray="6 5" opacity=".8"/>`;
  const col = '#3b4a63'; const cell = 14;
  for (const [gx, gy] of PIPS[v]) s += `<circle cx="${64 + (gx - 1) * cell * .95}" cy="${62 + (gy - 1) * cell * .95}" r="5.6" fill="${col}"/>`;
  return s;
}

// ---------------- tokens (128 x 128 cells) ----------------
function coffee(seed) {
  let s = shadow(circ(64, 70, 46), .32, 'soft2', 3, 8);
  s += part(circ(64, 66, 46), '#e8dcc4', { filter: 'paintS', box: [18, 18, 110, 114], st: { n: 5, w: 14, ang: 0, op: .25 }, seed });            // saucer
  s += part(circ(60, 62, 30), '#fbf7ee', { filter: 'paintS', box: [30, 32, 90, 92], noStrokes: true, seed: seed + 1 });                        // cup rim
  s += part(circ(60, 62, 23), '#5a3418', { filter: 'paintS', box: [37, 39, 83, 85], st: { n: 4, w: 10, ang: -20, op: .3 }, seed: seed + 2, inner: `<ellipse cx="52" cy="54" rx="9" ry="5" fill="#c9985a" opacity=".6"/>` });   // coffee
  s += part(B.closed([[88, 56], [106, 56], [108, 74], [92, 78], [90, 72], [100, 70], [100, 62], [88, 62]]), '#fbf7ee', { filter: 'paintS', box: [86, 52, 110, 82], noStrokes: true, seed: seed + 3 });  // handle
  s += `<g filter="url(#soft2)" opacity=".7"><path d="M52 34Q46 22 54 14M64 32Q60 20 68 10" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/></g>`;
  return s;
}
function reroll(seed) {
  let s = shadow(circ(64, 68, 46), .34, 'soft2', 3, 8);
  s += part(circ(64, 64, 46), '#7a4fc4', { filter: 'paintS', box: [18, 18, 110, 110], st: { n: 6, w: 16, ang: -30, op: .3 }, seed });
  s += part(circ(64, 64, 33), '#b08af0', { filter: 'paintS', box: [31, 31, 97, 97], noStrokes: true, seed: seed + 1 });
  // two curved arrows
  const arrow = (a0) => { const R = 22, pt = a => [64 + Math.cos(a) * R, 64 + Math.sin(a) * R]; const p0 = pt(a0), p1 = pt(a0 + 2.2), tip = pt(a0 + 2.65); return `<path d="M${f(p0[0])} ${f(p0[1])}A${R} ${R} 0 0 1 ${f(p1[0])} ${f(p1[1])}" stroke="#fff6df" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M${f(tip[0])} ${f(tip[1])}l${f(Math.cos(a0 + 2.2 + 1.9) * 12)} ${f(Math.sin(a0 + 2.2 + 1.9) * 12)}l${f(Math.cos(a0 + 2.2 - 0.9) * 12)} ${f(Math.sin(a0 + 2.2 - 0.9) * 12)}z" fill="#fff6df"/>`; };
  s += arrow(-0.2) + arrow(2.94);
  return s;
}
function planeToken(seed) {   // little white airliner from above on a pale disc (a plane that must be cleared)
  let s = shadow(circ(64, 68, 44), .34, 'soft2', 3, 8);
  s += part(circ(64, 64, 44), '#3a4d66', { filter: 'paintS', box: [20, 20, 108, 108], st: { n: 5, w: 14, ang: 0, op: .25 }, seed });
  s += airliner(64, 64, 1.0, '#f6f3ea', '#d8402c');
  return s;
}
// top-view airliner centred at (cx,cy), nose up. scale 1 -> about 60 tall
function airliner(cx, cy, k, body, accent) {
  const T = (x, y) => `${f(cx + x * k)} ${f(cy + y * k)}`;
  const fus = `M${T(0, -32)}C${T(6, -30)} ${T(7, -18)} ${T(7, -6)}L${T(7, 20)}C${T(7, 28)} ${T(3, 32)} ${T(0, 33)}C${T(-3, 32)} ${T(-7, 28)} ${T(-7, 20)}L${T(-7, -6)}C${T(-7, -18)} ${T(-6, -30)} ${T(0, -32)}Z`;
  const wing = `M${T(-6, -4)}L${T(-34, 12)}L${T(-34, 17)}L${T(-6, 10)}Z M${T(6, -4)}L${T(34, 12)}L${T(34, 17)}L${T(6, 10)}Z`;
  const tail = `M${T(-5, 24)}L${T(-17, 32)}L${T(-17, 35)}L${T(-4, 31)}Z M${T(5, 24)}L${T(17, 32)}L${T(17, 35)}L${T(4, 31)}Z`;
  return `<path d="${wing}" fill="${body}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/><path d="${tail}" fill="${body}" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="${fus}" fill="${body}" stroke="${INK}" stroke-width="2.6"/><path d="M${T(-2.5, -26)}L${T(2.5, -26)}L${T(3, -20)}L${T(-3, -20)}Z" fill="#3c5a7a"/><path d="M${T(-7, 14)}L${T(7, 14)}L${T(7, 17)}L${T(-7, 17)}Z" fill="${accent}"/>`;
}
function sw(on, seed) {   // rocker switch, shown from above: red lamp off / green lamp on
  const lamp = on ? '#43d65a' : '#d83b3b';
  let s = shadow(rrect(30, 28, 68, 76, 16), .34, 'soft2', 3, 7);
  s += part(rrect(28, 22, 72, 78, 16), '#46556a', { filter: 'paintS', box: [28, 22, 100, 100], st: { n: 5, w: 14, ang: 0, op: .25 }, seed });
  s += part(circ(64, 46, 17), on ? '#2d8a3c' : '#8e2323', { filter: 'paintS', box: [47, 29, 81, 63], noStrokes: true, seed: seed + 1 });
  s += `<circle cx="64" cy="46" r="13" fill="${lamp}" opacity="${on ? .95 : .85}"/><circle cx="59" cy="41" r="4.5" fill="#fff" opacity=".6"/>`;
  s += `<rect x="52" y="70" width="24" height="16" rx="7" fill="${on ? '#d9e3ee' : '#8a97a6'}" stroke="${INK}" stroke-width="2.4"/>`;
  return s;
}
function marker(col, seed, shape) {   // aerodynamics / brake marker: a chunky pointer
  let s = shadow(circ(64, 70, 34), .3, 'soft2', 3, 7);
  if (shape === 'drop') { s += part(B.closed([[64, 22], [88, 62], [80, 92], [64, 100], [48, 92], [40, 62]]), col, { filter: 'paintS', box: [38, 20, 90, 102], st: { n: 6, w: 14, ang: -30, op: .3 }, seed }); s += `<ellipse cx="56" cy="70" rx="7" ry="11" fill="#fff" opacity=".45" transform="rotate(14 56 70)"/>`; return s; }
  s += part(B.closed([[64, 20], [92, 54], [80, 54], [80, 100], [48, 100], [48, 54], [36, 54]]), col, { filter: 'paintS', box: [34, 18, 94, 102], st: { n: 6, w: 14, ang: -30, op: .3 }, seed });
  s += `<rect x="55" y="62" width="7" height="30" rx="3.5" fill="#fff" opacity=".4"/>`;
  return s;
}
function youMarker(seed) {   // our airliner marker (on the approach strip): white plane on a gold disc
  let s = shadow(circ(64, 68, 46), .38, 'soft2', 3, 8);
  s += part(circ(64, 64, 46), '#f2b92c', { filter: 'paintS', box: [18, 18, 110, 110], st: { n: 6, w: 16, ang: -30, op: .3 }, seed });
  s += airliner(64, 64, 1.05, '#fffdf4', '#2f6fd0');
  return s;
}
function windArrow(seed) {
  let s = shadow(circ(64, 68, 44), .34, 'soft2', 3, 8);
  s += part(circ(64, 64, 44), '#3e8fd8', { filter: 'paintS', box: [20, 20, 108, 108], st: { n: 5, w: 14, ang: 0, op: .25 }, seed });
  s += airliner(64, 64, .9, '#f6f3ea', '#2f6fd0');
  return s;
}
function brakeMarker(seed) { return marker('#d83b3b', seed); }

// ---------------- slot wells: 128 x 128 ----------------
function well(col, seed) {
  const x0 = 12, w = 104;
  let s = part(rrect(x0, x0, w, w, 26), mix(col, '#10202c', .55), { filter: 'paintS', box: [x0, x0, x0 + w, x0 + w], st: { n: 5, w: 14, ang: 20, op: .22 }, seed });                                   // bezel
  s += part(rrect(x0 + 10, x0 + 10, w - 20, w - 20, 20), mix(col, '#0a141c', .78), { filter: 'paintN', box: [x0 + 10, x0 + 10, x0 + w - 10, x0 + w - 10], noStrokes: true, seed: seed + 1,
    inner: `<rect x="${x0 + 10}" y="${x0 + 10}" width="${w - 20}" height="22" fill="#000" opacity=".35" filter="url(#soft2)"/><rect x="${x0 + 14}" y="${x0 + w - 28}" width="${w - 28}" height="14" fill="${col}" opacity=".18" filter="url(#soft2)"/>` });         // recess
  s += `<path d="${rrect(x0 + 5, x0 + 5, w - 10, w - 10, 22)}" fill="none" stroke="${col}" stroke-width="5" opacity=".9" stroke-linecap="round" stroke-dasharray="${w * 1.6} 40"/>`;
  return s;
}

// ---------------- pictograms (96 x 96): drawn in cream on a dark badge ----------------
const ICON = {
  axis: c => `<path d="M48 22V74M24 74H72" stroke="${c}" stroke-width="7" stroke-linecap="round"/><path d="M20 38L48 28L76 38" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="20" cy="46" r="8" fill="${c}"/><circle cx="76" cy="46" r="8" fill="${c}"/>`,
  engines: c => `<circle cx="48" cy="48" r="26" fill="none" stroke="${c}" stroke-width="7"/><path d="M48 48L48 26M48 48L68 58M48 48L28 58" stroke="${c}" stroke-width="7" stroke-linecap="round"/><circle cx="48" cy="48" r="5" fill="${c}"/>`,
  radio: c => `<path d="M24 56V44C24 30 34 22 48 22C62 22 72 30 72 44V56" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/><rect x="18" y="46" width="14" height="24" rx="6" fill="${c}"/><rect x="64" y="46" width="14" height="24" rx="6" fill="${c}"/><path d="M64 72Q56 78 46 76" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  gear: c => `<path d="M48 18V56" stroke="${c}" stroke-width="8" stroke-linecap="round"/><circle cx="34" cy="68" r="11" fill="none" stroke="${c}" stroke-width="7"/><circle cx="62" cy="68" r="11" fill="none" stroke="${c}" stroke-width="7"/><path d="M34 56H62" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`,
  flaps: c => `<path d="M16 34H80L72 44H24Z" fill="${c}"/><path d="M24 50H66L58 60H32Z" fill="${c}" opacity=".85"/><path d="M34 66H54L48 74H38Z" fill="${c}" opacity=".7"/>`,
  brakes: c => `<circle cx="48" cy="48" r="26" fill="none" stroke="${c}" stroke-width="8"/><rect x="40" y="26" width="16" height="44" rx="4" fill="${c}"/><rect x="26" y="40" width="44" height="16" rx="4" fill="${c}" opacity="0"/>`,
  conc: c => `<path d="M24 38H66V58C66 70 58 76 46 76C34 76 24 70 24 58Z" fill="${c}"/><path d="M66 44H74C80 44 80 60 72 60H66" stroke="${c}" stroke-width="6" fill="none"/><path d="M36 28Q32 20 38 14M50 28Q46 20 52 12" stroke="${c}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
  fuel: c => `<path d="M48 14C62 34 72 46 72 58C72 72 62 82 48 82C34 82 24 72 24 58C24 46 34 34 48 14Z" fill="${c}"/>`,
  intern: c => `<circle cx="48" cy="38" r="14" fill="${c}"/><path d="M22 76C22 58 34 52 48 52C62 52 74 58 74 76Z" fill="${c}"/><path d="M28 26H68L58 14H38Z" fill="${c}"/>`,
  ice: c => `<path d="M48 14V82M17 31L79 65M17 65L79 31" stroke="${c}" stroke-width="7" stroke-linecap="round"/><circle cx="48" cy="48" r="7" fill="${c}"/>`,
  wind: c => `<path d="M14 36H58C70 36 72 24 62 24M14 52H72C84 52 84 66 72 66M14 68H48C58 68 58 78 50 78" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round"/>`,
  clock: c => `<circle cx="48" cy="50" r="28" fill="none" stroke="${c}" stroke-width="7"/><path d="M48 50V32M48 50L62 58" stroke="${c}" stroke-width="7" stroke-linecap="round"/><rect x="40" y="12" width="16" height="8" rx="3" fill="${c}"/>`,
  alt: c => `<path d="M16 76L44 30L58 52L68 38L84 76Z" fill="${c}"/><circle cx="66" cy="24" r="8" fill="${c}"/>`,
  approach: c => `<path d="M14 70L48 20L82 70" stroke="${c}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M30 78H66" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`
};
function icon(name, bg, c) {
  let s = shadow(circ(48, 52, 40), .3, 'soft2', 2, 5);
  s += part(circ(48, 48, 40), bg, { filter: 'paintS', box: [8, 8, 88, 88], st: { n: 5, w: 14, ang: -30, op: .28 }, seed: name.length * 13 });
  s += `<g transform="translate(48 48) scale(.62) translate(-48 -48)">${ICON[name](c || '#fff6df')}</g>`;
  return s;
}

// ---------------- axis dial (320 x 320) and gauge (480 x 260) ----------------
function dial(seed) {
  const cx = 160, cy = 160;
  let s = shadow(circ(cx, cy, 148), .4, 'soft', 6, 12);
  s += part(circ(cx, cy, 148), '#9ba7b4', { filter: 'paint', box: [10, 10, 310, 310], st: { n: 16, w: 22, ang: -35, op: .35 }, seed });                         // steel bezel
  s += part(circ(cx, cy, 122), '#1a2b3b', { filter: 'paintS', box: [38, 38, 282, 282], noStrokes: true, seed: seed + 1,
    inner: `<defs><linearGradient id="dsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5aa5e0"/><stop offset=".5" stop-color="#bfe0f5"/><stop offset=".5" stop-color="#8b6a46"/><stop offset="1" stop-color="#4c3623"/></linearGradient><clipPath id="dcl"><circle cx="${cx}" cy="${cy}" r="122"/></clipPath></defs><g clip-path="url(#dcl)"><rect x="30" y="30" width="260" height="260" fill="url(#dsky)"/><rect x="30" y="${cy - 2}" width="260" height="4" fill="#fff" opacity=".8"/></g>` });
  // tick marks: -2..+2 every 15 deg, X at +-3 (red)
  for (let i = -3; i <= 3; i++) {
    const a = (-90 + i * 24) * Math.PI / 180, r0 = 100, r1 = i === 0 ? 124 : (Math.abs(i) === 3 ? 126 : 116);
    const col = Math.abs(i) === 3 ? '#e03a2e' : '#fff6df';
    s += `<path d="M${f(cx + Math.cos(a) * r0)} ${f(cy + Math.sin(a) * r0)}L${f(cx + Math.cos(a) * r1)} ${f(cy + Math.sin(a) * r1)}" stroke="${col}" stroke-width="${Math.abs(i) === 3 ? 9 : 6}" stroke-linecap="round" filter="url(#wob)"/>`;
  }
  s += `<path d="M${cx} 34L${cx - 11} 14H${cx + 11}Z" fill="#fff6df" stroke="${INK}" stroke-width="3"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="124" fill="none" stroke="#fff" stroke-opacity=".25" stroke-width="3"/>`;
  // glass glint
  s += `<path d="M70 80Q110 40 180 46" stroke="#fff" stroke-width="10" opacity=".28" fill="none" stroke-linecap="round" filter="url(#soft2)"/>`;
  return s;
}
function planeFront(seed) {   // airliner seen head-on (wings level), 320 x 140: this part rotates on the dial
  const cx = 160, cy = 70; let s = '';
  s += part(B.closed([[26, 74], [160, 60], [294, 74], [294, 86], [160, 82], [26, 86]]), '#f6f3ea', { filter: 'paintS', box: [20, 56, 300, 92], st: { n: 4, w: 10, ang: 0, op: .25 }, seed });
  s += part(ell(cx, cy + 6, 26, 40), '#fbf8ef', { filter: 'paintS', box: [130, 28, 190, 112], st: { n: 5, w: 12, ang: 80, op: .25 }, seed: seed + 1 });
  s += part(ell(cx, cy - 4, 14, 10), '#3c5a7a', { filter: 'paintS', box: [146, 60, 174, 76], noStrokes: true, seed: seed + 2 });
  for (const sx of [-1, 1]) s += part(circ(cx + sx * 70, cy + 18, 15), '#c9d2dc', { filter: 'paintS', box: [cx + sx * 70 - 16, cy + 2, cx + sx * 70 + 16, cy + 34], noStrokes: true, seed: seed + 3 + sx });
  s += part(B.closed([[150, 100], [160, 116], [170, 100]]), '#d8402c', { filter: 'paintS', box: [146, 98, 174, 118], noStrokes: true, seed: seed + 6 });
  return s;
}
function gauge(seed) {   // speed gauge bezel and dark face (the coloured bands, ticks and numerals are drawn live)
  const cx = 240, cy = 240;
  let s = shadow(B.closed([[18, 244], [60, 100], [240, 30], [420, 100], [462, 244], [240, 262]]), .36, 'soft', 6, 12);
  s += part(`M20 246A220 220 0 0 1 460 246L440 246A200 200 0 0 0 40 246Z`, '#9ba7b4', { filter: 'paint', box: [10, 20, 470, 250], st: { n: 12, w: 18, ang: -20, op: .32 }, seed });
  s += part(`M44 246A196 196 0 0 1 436 246L428 256L52 256Z`, '#17252f', { filter: 'paintS', box: [40, 40, 440, 258], noStrokes: true, seed: seed + 1, inner: `<path d="M60 246A180 180 0 0 1 420 246" fill="none" stroke="#000" stroke-opacity=".3" stroke-width="30" filter="url(#soft)"/>` });
  s += `<path d="M80 70Q150 36 260 40" stroke="#fff" stroke-width="9" opacity=".22" fill="none" stroke-linecap="round" filter="url(#soft2)"/>`;
  return s;
}
function bezelRound(seed) {   // small round bezel (wind dial, fuel gauge end caps)
  let s = shadow(circ(64, 68, 54), .36, 'soft2', 3, 8);
  s += part(circ(64, 64, 54), '#9ba7b4', { filter: 'paintS', box: [10, 10, 118, 118], st: { n: 10, w: 18, ang: -35, op: .3 }, seed });
  s += part(circ(64, 64, 42), '#1a2b3b', { filter: 'paintS', box: [22, 22, 106, 106], noStrokes: true, seed: seed + 1 });
  return s;
}
function pillBar(seed) {   // gauge bar for fuel (256 x 48)
  let s = part(rrect(6, 6, 244, 36, 18), '#9ba7b4', { filter: 'paintS', box: [6, 6, 250, 42], st: { n: 6, w: 10, ang: 0, op: .3 }, seed });
  s += part(rrect(14, 12, 228, 24, 12), '#15222c', { filter: 'paintN', box: [14, 12, 242, 36], noStrokes: true, seed: seed + 1 });
  return s;
}

module.exports = { BLUE, ORANGE, dieBlue, dieOrange, dieBlack, dieBack, chit, coffee, reroll, planeToken, sw, marker, youMarker, windArrow, brakeMarker, well, icon, ICON, dial, planeFront, gauge, bezelRound, pillBar, airliner, PIPS, IVORY, STEEL, NAVY, TEAL };
