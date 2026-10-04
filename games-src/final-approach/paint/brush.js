// Final Approach paint kit (shared helpers adapted from the Kaiten Kitchen kit): SVG helpers that imitate gouache on paper.
// Every "part" is a flat shape plus brush strokes inside it; the `paint` filter then adds mottled pigment, fine grain,
// a soft rim light (top-left), shade (bottom-right), pigment pooling at the edges, a warm-brown ink outline and a wobbly edge.
'use strict';
const INK = '#1f2b3a', INK2 = '#16202c';
const f = n => Math.round(n * 100) / 100;
function rng(seed) { let s = (seed >>> 0) || 1; return () => { s = (s + 0x6D2B79F5) >>> 0; let t = s; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function hex(c) { c = c.replace('#', ''); if (c.length === 3) c = c.split('').map(x => x + x).join(''); return [0, 2, 4].map(i => parseInt(c.slice(i, i + 2), 16)); }
function toHex(a) { return '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
function mix(a, b, t) { const A = hex(a), B = hex(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); }
const lit = (c, t) => mix(c, '#fff8e8', t), drk = (c, t) => mix(c, '#3a1608', t);
let UID = 0; const uid = p => (p || 'u') + (++UID);

// ---- filters (one set per image) ----
function filters(seed, o) {
  o = o || {}; const S = seed || 1, ink = o.ink || INK;
  const gray = 'values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1"';
  const paint = (id, ow, wob, rim, sh, mot) => `<filter id="${id}" x="-12%" y="-12%" width="124%" height="124%" color-interpolation-filters="sRGB">
<feTurbulence type="fractalNoise" baseFrequency="0.016" numOctaves="3" seed="${S}" result="n1"/><feColorMatrix in="n1" type="matrix" ${gray} result="n1g"/>
<feComposite in="SourceGraphic" in2="n1g" operator="arithmetic" k1="${mot}" k2="${f(1 - mot / 2)}" k3="0" k4="0" result="mot"/>
<feTurbulence type="fractalNoise" baseFrequency="0.09" numOctaves="2" seed="${S + 5}" result="n3"/><feColorMatrix in="n3" type="matrix" ${gray} result="n3g"/>
<feComposite in="mot" in2="n3g" operator="arithmetic" k1="${f(mot * .6)}" k2="${f(1 - mot * .3)}" k3="0" k4="0" result="mot2"/>
<feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="${S + 1}" result="n2"/><feColorMatrix in="n2" type="matrix" ${gray} result="n2g"/>
<feComposite in="mot2" in2="n2g" operator="arithmetic" k1="0.2" k2="0.9" k3="0" k4="0" result="gr"/>
<feOffset in="SourceAlpha" dx="${rim}" dy="${f(rim * 1.25)}" result="o1"/><feComposite in="SourceAlpha" in2="o1" operator="out" result="ra"/><feGaussianBlur in="ra" stdDeviation="${f(rim * .45)}" result="rb"/>
<feFlood flood-color="#fffbe9" flood-opacity="0.72"/><feComposite in2="rb" operator="in" result="rim"/>
<feOffset in="SourceAlpha" dx="${-sh}" dy="${f(-sh * 1.2)}" result="o2"/><feComposite in="SourceAlpha" in2="o2" operator="out" result="sa"/><feGaussianBlur in="sa" stdDeviation="${f(sh * .55)}" result="sb"/>
<feFlood flood-color="#4a1a08" flood-opacity="0.34"/><feComposite in2="sb" operator="in" result="sh"/>
<feGaussianBlur in="SourceAlpha" stdDeviation="2.2" result="eb"/><feComposite in="SourceAlpha" in2="eb" operator="arithmetic" k1="0" k2="1" k3="-1" k4="0" result="edge"/>
<feFlood flood-color="#3a1206" flood-opacity="0.55"/><feComposite in2="edge" operator="in" result="ed"/>
<feMerge result="body"><feMergeNode in="gr"/><feMergeNode in="sh"/><feMergeNode in="ed"/><feMergeNode in="rim"/></feMerge>
<feComposite in="body" in2="SourceAlpha" operator="in" result="bc"/>
${ow ? `<feMorphology in="SourceAlpha" operator="dilate" radius="${ow}" result="dil"/><feComposite in="dil" in2="SourceAlpha" operator="out" result="ring"/>
<feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="1" seed="${S + 9}" result="rn"/><feColorMatrix in="rn" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.6 0 0 0 0.1" result="rna"/>
<feComposite in="ring" in2="rna" operator="in" result="ring2"/><feFlood flood-color="${ink}"/><feComposite in2="ring2" operator="in" result="ink"/>
<feMerge result="all"><feMergeNode in="ink"/><feMergeNode in="bc"/></feMerge>` : '<feMerge result="all"><feMergeNode in="bc"/></feMerge>'}
<feTurbulence type="fractalNoise" baseFrequency="0.028" numOctaves="2" seed="${S + 3}" result="wn"/><feDisplacementMap in="all" in2="wn" scale="${wob}" xChannelSelector="R" yChannelSelector="G"/>
</filter>`;
  return `<defs>${paint('paint', 4, 7, 7, 10, .42)}${paint('paintS', 2.6, 4, 4, 5, .3)}${paint('paintW', 2.2, 5, 9, 12, .14)}${paint('paintN', 0, 5, 6, 9, .4)}${paint('paintF', 3.2, 5, 5, 7, .3)}
<filter id="wob" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="${S + 4}" result="t"/><feDisplacementMap in="SourceGraphic" in2="t" scale="4" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="dry" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.06 0.6" numOctaves="2" seed="${S + 6}" result="t"/><feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 3.2 0 -1.15" result="ta"/><feComposite in="SourceGraphic" in2="ta" operator="in" result="d"/><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="${S + 7}" result="w"/><feDisplacementMap in="d" in2="w" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="soft" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="9"/></filter>
<filter id="soft2" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="3.5"/></filter>
<filter id="soft3" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="22"/></filter>
<filter id="paper" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="3" seed="${S + 8}" result="n"/><feColorMatrix in="n" type="matrix" ${gray} result="ng"/>
<feTurbulence type="fractalNoise" baseFrequency="0.012 0.09" numOctaves="2" seed="${S + 2}" result="fib"/><feColorMatrix in="fib" type="matrix" ${gray} result="fg"/>
<feComposite in="SourceGraphic" in2="ng" operator="arithmetic" k1="0.16" k2="0.92" k3="0" k4="0" result="a"/><feComposite in="a" in2="fg" operator="arithmetic" k1="0.12" k2="0.94" k3="0" k4="0" result="b"/><feComposite in="b" in2="SourceAlpha" operator="in"/></filter>
</defs>`;
}

// ---- shape paths ----
// smooth closed path through points (Catmull-Rom -> cubic)
function closed(pts) {
  const n = pts.length; let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) { const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`; }
  return d + 'Z';
}
function open(pts) {
  const n = pts.length; let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(n - 1, i + 2)];
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`; }
  return d;
}
// organic blob around an ellipse; wob = radial jitter fraction, n = points, rot = degrees
function blob(cx, cy, rx, ry, wob, seed, n, rot) {
  const r = rng(seed || 7); n = n || 14; const a0 = (rot || 0) * Math.PI / 180, pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, k = 1 + (r() - .5) * 2 * (wob || 0); const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k; pts.push([cx + x * Math.cos(a0) - y * Math.sin(a0), cy + x * Math.sin(a0) + y * Math.cos(a0)]); }
  return closed(pts);
}
const circ = (cx, cy, r) => `M${f(cx - r)} ${f(cy)}a${f(r)} ${f(r)} 0 1 0 ${f(2 * r)} 0a${f(r)} ${f(r)} 0 1 0 ${f(-2 * r)} 0Z`;
const ell = (cx, cy, rx, ry) => `M${f(cx - rx)} ${f(cy)}a${f(rx)} ${f(ry)} 0 1 0 ${f(2 * rx)} 0a${f(rx)} ${f(ry)} 0 1 0 ${f(-2 * rx)} 0Z`;
function rrect(x, y, w, h, r) { r = Math.min(r, w / 2, h / 2); return `M${f(x + r)} ${f(y)}H${f(x + w - r)}Q${f(x + w)} ${f(y)} ${f(x + w)} ${f(y + r)}V${f(y + h - r)}Q${f(x + w)} ${f(y + h)} ${f(x + w - r)} ${f(y + h)}H${f(x + r)}Q${f(x)} ${f(y + h)} ${f(x)} ${f(y + h - r)}V${f(y + r)}Q${f(x)} ${f(y)} ${f(x + r)} ${f(y)}Z`; }
// soft rounded "pillow" rectangle through jittered points
function pillow(cx, cy, w, h, round, seed, rot) {
  const r = rng(seed || 3), pts = [], n = 20, a0 = (rot || 0) * Math.PI / 180;
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, c = Math.cos(a), s = Math.sin(a); const p = 2 / (round || .5); const x = Math.sign(c) * Math.pow(Math.abs(c), p * .5) * w / 2, y = Math.sign(s) * Math.pow(Math.abs(s), p * .5) * h / 2; const k = 1 + (r() - .5) * .04; pts.push([cx + (x * Math.cos(a0) - y * Math.sin(a0)) * k, cy + (x * Math.sin(a0) + y * Math.cos(a0)) * k]); }
  return closed(pts);
}
// tapered brush stroke along a polyline (points), width w0 -> wm -> w1
function taper(pts, w0, wm, w1) {
  const q = []; const n = 24; const P = []; // sample the smooth curve
  const seg = pts.length - 1;
  for (let i = 0; i <= n; i++) { const t = i / n * seg, k = Math.min(seg - 1, Math.floor(t)), u = t - k; const p0 = pts[Math.max(0, k - 1)], p1 = pts[k], p2 = pts[k + 1], p3 = pts[Math.min(pts.length - 1, k + 2)];
    const cr = (a, b, c, d) => .5 * ((2 * b) + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
    P.push([cr(p0[0], p1[0], p2[0], p3[0]), cr(p0[1], p1[1], p2[1], p3[1])]); }
  const L = [], Rr = [];
  for (let i = 0; i <= n; i++) { const a = P[Math.max(0, i - 1)], b = P[Math.min(n, i + 1)]; let dx = b[0] - a[0], dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l; const t = i / n; const w = (t < .5 ? w0 + (wm - w0) * (t * 2) : wm + (w1 - wm) * ((t - .5) * 2)) / 2; L.push([P[i][0] - dy * w, P[i][1] + dx * w]); Rr.push([P[i][0] + dy * w, P[i][1] - dx * w]); }
  return closed(L.concat(Rr.reverse()));
}

// ---- painting ----
// brush strokes inside a shape (clip): parallel-ish curved strokes in light / dark variations of the base colour
function strokes(seed, box, base, o) {
  o = o || {}; const r = rng(seed); const [x0, y0, x1, y1] = box; const n = o.n || 14, ang = (o.ang == null ? -25 : o.ang) * Math.PI / 180;
  const W = x1 - x0, H = y1 - y0, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, L = Math.hypot(W, H);
  let s = '';
  for (let i = 0; i < n; i++) {
    const t = (i + r() * .8) / n - .5, off = t * L * .95, len = L * (.35 + r() * .5), c = Math.cos(ang), sn = Math.sin(ang);
    const px = cx - sn * off + c * (r() - .5) * W * .5, py = cy + c * off + sn * (r() - .5) * H * .5, bend = (r() - .5) * len * (o.bend || .25);
    const a = [px - c * len / 2, py - sn * len / 2], b = [px + c * len / 2, py + sn * len / 2], m = [px - sn * bend, py + c * bend];
    const tone = r(); const col = tone < .5 ? lit(base, .12 + r() * .22) : drk(base, .06 + r() * .16);
    const w = (o.w || 14) * (.5 + r() * .9);
    s += `<path d="${taper([a, m, b], w * .3, w, w * .4)}" fill="${col}" opacity="${f((o.op || .38) * (.6 + r() * .6))}"/>`;
  }
  return s;
}
// a painted part: base fill + strokes, clipped, then the paint filter (outline, wobble, light)
function part(d, base, o) {
  o = o || {}; const id = uid('c');
  const box = o.box || [0, 0, 512, 512];
  const inner = (o.noStrokes ? '' : strokes(o.seed || (UID * 31), box, base, o.st || {})) + (o.inner || '');
  return `<g filter="url(#${o.filter || 'paint'})"${o.op != null ? ` opacity="${o.op}"` : ''}><clipPath id="${id}"><path d="${d}"/></clipPath><path d="${d}" fill="${base}"/><g clip-path="url(#${id})">${inner}</g></g>`;
}
// soft drop shadow (blurred)
const shadow = (d, op, blur, dx, dy) => `<path d="${d}" fill="#3a1606" opacity="${op || .35}" filter="url(#${blur || 'soft'})" transform="translate(${dx || 8} ${dy || 12})"/>`;
// plain ink line with brush taper
const inkLine = (pts, w, col, op) => `<path d="${taper(pts, w * .35, w, w * .35)}" fill="${col || INK}"${op != null ? ` opacity="${op}"` : ''}/>`;
// a little star sparkle (4 points)
function sparkle(x, y, r, col, rot) { const k = r * .28; return `<path transform="translate(${f(x)} ${f(y)}) rotate(${rot || 0})" d="M0 ${-r}Q${k} ${-k} ${r} 0Q${k} ${k} 0 ${r}Q${-k} ${k} ${-r} 0Q${-k} ${-k} 0 ${-r}Z" fill="${col || '#fff6c8'}" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`; }

// ---- faces ----
// mood: proud | sleepy | startled | smile | grin | cheeky | smug | dreamy | happy | determined | wink | bliss
// s = scale (1 = eyes 30 px apart), body = skin colour for lids
function face(cx, cy, s, mood, body, o) {
  o = o || {}; const E = 15 * s * (o.spread || 1), er = 9.5 * s, out = [];
  const pupil = (x, y, rr, look) => `<ellipse cx="${f(x + (look ? look[0] : 0) * rr * .25)}" cy="${f(y + (look ? look[1] : 0) * rr * .25)}" rx="${f(rr * .62)}" ry="${f(rr * .7)}" fill="#2e1a12"/><circle cx="${f(x - rr * .22 + (look ? look[0] : 0) * rr * .25)}" cy="${f(y - rr * .3 + (look ? look[1] : 0) * rr * .25)}" r="${f(rr * .24)}" fill="#fff"/><circle cx="${f(x + rr * .22)}" cy="${f(y + rr * .25)}" r="${f(rr * .1)}" fill="#fff" opacity=".8"/>`;
  const eyeW = (x, y, rx, ry) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="#fffdf6" stroke="${INK}" stroke-width="${f(2.6 * s)}"/>`;
  const openEye = (x, y, look, big) => eyeW(x, y, er * (big || 1) * .82, er * (big || 1)) + pupil(x, y, er * (big || 1) * .9, look);
  const lidEye = (x, y, amt, look) => { // half-closed: lid covers the top part
    const rx = er * .82, ry = er; const ly = y - ry + 2 * ry * amt;
    return eyeW(x, y, rx, ry) + pupil(x, y + ry * .25, er * .85, look) + `<path d="M${f(x - rx - 2 * s)} ${f(y - ry - 3 * s)}H${f(x + rx + 2 * s)}V${f(ly)}Q${f(x)} ${f(ly + 3 * s)} ${f(x - rx - 2 * s)} ${f(ly)}Z" fill="${body}"/>` + `<path d="M${f(x - rx - 1)} ${f(ly)}Q${f(x)} ${f(ly + 3.5 * s)} ${f(x + rx + 1)} ${f(ly)}" fill="none" stroke="${INK}" stroke-width="${f(3.2 * s)}" stroke-linecap="round"/>`; };
  const arcEye = (x, y, up) => inkLine(up ? [[x - er * .9, y + er * .2], [x, y - er * .7], [x + er * .9, y + er * .2]] : [[x - er * .9, y - er * .3], [x, y + er * .6], [x + er * .9, y - er * .3]], 4.2 * s);
  const brow = (x, y, tilt, lift) => inkLine([[x - er * .9, y - er * 1.5 - lift * s + tilt * s], [x, y - er * 1.85 - lift * s], [x + er * .9, y - er * 1.5 - lift * s - tilt * s]], 4.6 * s);
  const cheeks = (op) => `<ellipse cx="${f(cx - E * 1.55)}" cy="${f(cy + er * 1.25)}" rx="${f(7.5 * s)}" ry="${f(4.6 * s)}" fill="#f07a7a" opacity="${op || .5}" filter="url(#soft2)"/><ellipse cx="${f(cx + E * 1.55)}" cy="${f(cy + er * 1.25)}" rx="${f(7.5 * s)}" ry="${f(4.6 * s)}" fill="#f07a7a" opacity="${op || .5}" filter="url(#soft2)"/>`;
  const mouthSmile = (w, dy, open) => { const y = cy + er * 1.6 + (dy || 0) * s, x0 = cx - w * s, x1 = cx + w * s;
    if (!open) return inkLine([[x0, y], [cx, y + w * .55 * s], [x1, y]], 4 * s);
    return `<path d="M${f(x0)} ${f(y)}Q${f(cx)} ${f(y + w * 1.25 * s)} ${f(x1)} ${f(y)}Q${f(cx)} ${f(y + w * .3 * s)} ${f(x0)} ${f(y)}Z" fill="#8a2a22" stroke="${INK}" stroke-width="${f(3 * s)}" stroke-linejoin="round"/><path d="M${f(cx - w * .45 * s)} ${f(y + w * .62 * s)}Q${f(cx)} ${f(y + w * .35 * s)} ${f(cx + w * .45 * s)} ${f(y + w * .62 * s)}Q${f(cx)} ${f(y + w * .95 * s)} ${f(cx - w * .45 * s)} ${f(y + w * .62 * s)}Z" fill="#f07a7a"/>`; };
  const L = cx - E, Rx = cx + E, y = cy;
  switch (mood) {
    case 'proud': out.push(arcEye(L, y, true), arcEye(Rx, y, true), brow(L, y + 2 * s, -2, 3), brow(Rx, y + 2 * s, 2, 3), cheeks(.55), mouthSmile(10, 0, true)); break;
    case 'sleepy': out.push(arcEye(L, y + 2 * s, false), arcEye(Rx, y + 2 * s, false), inkLine([[L - er, y - er * 1.3], [L, y - er * 1.45], [L + er * .8, y - er * 1.2]], 3.6 * s), inkLine([[Rx - er * .8, y - er * 1.2], [Rx, y - er * 1.45], [Rx + er, y - er * 1.3]], 3.6 * s), cheeks(.45), `<ellipse cx="${f(cx + 2 * s)}" cy="${f(cy + er * 1.9)}" rx="${f(4.6 * s)}" ry="${f(5.6 * s)}" fill="#8a2a22" stroke="${INK}" stroke-width="${f(2.6 * s)}"/>`); break;
    case 'startled': out.push(openEye(L, y, [0, 0], 1.25), openEye(Rx, y, [0, 0], 1.25), brow(L, y - 5 * s, 0, 6), brow(Rx, y - 5 * s, 0, 6), `<ellipse cx="${f(cx)}" cy="${f(cy + er * 2.1)}" rx="${f(6 * s)}" ry="${f(7.5 * s)}" fill="#8a2a22" stroke="${INK}" stroke-width="${f(2.8 * s)}"/>`, cheeks(.35)); break;
    case 'smile': out.push(openEye(L, y, [.3, .3]), openEye(Rx, y, [.3, .3]), brow(L, y, -1, 0), brow(Rx, y, 1, 0), cheeks(.5), mouthSmile(9, 0, true)); break;
    case 'grin': out.push(openEye(L, y, [0, .4]), openEye(Rx, y, [0, .4]), brow(L, y, -2, 1), brow(Rx, y, 2, 1), cheeks(.5), mouthSmile(12, 0, true)); break;
    case 'cheeky': out.push(openEye(L, y, [.6, 0]), arcEye(Rx, y, true), brow(L, y, -3, 2), brow(Rx, y, 3, 0), cheeks(.55), mouthSmile(10, 0, true), `<path d="M${f(cx + 1 * s)} ${f(cy + er * 2.3)}q${f(5 * s)} ${f(9 * s)} ${f(10 * s)} 0z" fill="#f07a7a" stroke="${INK}" stroke-width="${f(2 * s)}"/>`); break;
    case 'smug': out.push(lidEye(L, y, .5, [.5, .2]), lidEye(Rx, y, .5, [.5, .2]), brow(L, y + 1 * s, -3, 1), brow(Rx, y + 1 * s, 4, 4), cheeks(.4), inkLine([[cx - 9 * s, cy + er * 1.75], [cx + 2 * s, cy + er * 2.05], [cx + 11 * s, cy + er * 1.35]], 4 * s)); break;
    case 'dreamy': out.push(openEye(L, y, [-.3, -.7], 1.1), openEye(Rx, y, [-.3, -.7], 1.1), sparkleEye(L, y, er), sparkleEye(Rx, y, er), brow(L, y, 2, 2), brow(Rx, y, -2, 2), cheeks(.55), mouthSmile(7, 0, false)); break;
    case 'happy': out.push(arcEye(L, y, true), arcEye(Rx, y, true), cheeks(.6), mouthSmile(12, -1, true)); break;
    case 'determined': out.push(openEye(L, y + 1 * s, [.2, .1]), openEye(Rx, y + 1 * s, [-.2, .1]), inkLine([[L - er, y - er * 1.9], [L, y - er * 1.5], [L + er * 1.1, y - er * 1.05]], 5.4 * s), inkLine([[Rx - er * 1.1, y - er * 1.05], [Rx, y - er * 1.5], [Rx + er, y - er * 1.9]], 5.4 * s), grinTeeth(cx, cy + er * 1.75, 12 * s, s)); break;
    case 'wink': out.push(openEye(L, y, [.2, .2]), arcEye(Rx, y, true), brow(L, y, -2, 2), brow(Rx, y, 2, 0), cheeks(.55), mouthSmile(10, 0, true)); break;
    case 'bliss': out.push(arcEye(L, y, false), arcEye(Rx, y, false), brow(L, y + 3 * s, 2, 1), brow(Rx, y + 3 * s, -2, 1), cheeks(.7), mouthSmile(9, 0, true)); break;
  }
  return `<g>${out.join('')}</g>`;
}
function sparkleEye(x, y, er) { return `<path transform="translate(${f(x + er * .25)} ${f(y - er * .1)})" d="M0 -5Q1.2 -1.2 5 0Q1.2 1.2 0 5Q-1.2 1.2 -5 0Q-1.2 -1.2 0 -5Z" fill="#fff"/>`; }
function grinTeeth(cx, y, w, s) { return `<path d="M${f(cx - w)} ${f(y)}Q${f(cx)} ${f(y + w * 1.2)} ${f(cx + w)} ${f(y)}Z" fill="#8a2a22" stroke="${INK}" stroke-width="${f(3 * s)}" stroke-linejoin="round"/><path d="M${f(cx - w * .82)} ${f(y + 1.5 * s)}H${f(cx + w * .82)}L${f(cx + w * .6)} ${f(y + w * .35)}H${f(cx - w * .6)}Z" fill="#fffdf6" stroke="${INK}" stroke-width="${f(1.8 * s)}" stroke-linejoin="round"/>`; }

module.exports = { INK, INK2, f, rng, mix, lit, drk, uid, filters, closed, open, blob, circ, ell, rrect, pillow, taper, strokes, part, shadow, inkLine, sparkle, face };
