// ===================== part 10: the picture board (a woodland clearing drawn as SVG) =====================
// Every worker place is a little drawing (stump, bush, pond, canopy, burrow, road); a dirt path winds through them,
// a stream runs along the meadow bench, and the events hang as pennants from a rope. All of it is decoration:
// the places themselves are the buttons drawn in renderBoard.
const SVGH = (vb, body) => '<svg class="art" viewBox="' + vb + '" preserveAspectRatio="none" aria-hidden="true" focusable="false">' + body + '</svg>';
const K_INK = '#3b2a1a';
const STUMP = (ex) => '<ellipse cx="50" cy="37" rx="46" ry="25" fill="#6a4727" stroke="' + K_INK + '" stroke-width="2.5"/><ellipse cx="50" cy="30" rx="46" ry="25" fill="#dcab6c" stroke="' + K_INK + '" stroke-width="2.5"/><ellipse cx="50" cy="30" rx="37" ry="19.500" fill="none" stroke="#c0904f" stroke-width="1.600"/><ellipse cx="50" cy="30" rx="27" ry="14" fill="none" stroke="#c9985a" stroke-width="1.400"/><ellipse cx="50" cy="30" rx="16" ry="8" fill="none" stroke="#c0904f" stroke-width="1.300"/>' + (ex || '');
const BUSH = (c1, c2, bc, bs) => '<ellipse cx="50" cy="56" rx="42" ry="6" fill="rgba(0,0,0,.2)"/><g fill="' + c1 + '" stroke="' + c2 + '" stroke-width="2.500"><circle cx="18" cy="34" r="16"/><circle cx="82" cy="34" r="16"/><circle cx="36" cy="24" r="19"/><circle cx="64" cy="24" r="19"/><circle cx="50" cy="38" r="21"/></g><g fill="#fff" opacity=".18"><circle cx="34" cy="16" r="8"/><circle cx="62" cy="15" r="7"/></g><g fill="' + bc + '" stroke="' + bs + '" stroke-width="1.200"><circle cx="12" cy="28" r="3.600"/><circle cx="24" cy="48" r="3.600"/><circle cx="76" cy="49" r="3.600"/><circle cx="90" cy="30" r="3.600"/><circle cx="48" cy="9" r="3.600"/><circle cx="73" cy="12" r="3.600"/><circle cx="27" cy="12" r="3.600"/><circle cx="50" cy="55" r="3.600"/></g>';
const MUSH = (x, y, s) => '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><rect x="-3" y="0" width="6" height="9" rx="2" fill="#f3e6c8" stroke="' + K_INK + '" stroke-width="1.400"/><path d="M-10 1Q-10-10 0-10Q10-10 10 1Z" fill="#d23a4a" stroke="' + K_INK + '" stroke-width="1.600"/><circle cx="-4" cy="-4" r="1.800" fill="#fff"/><circle cx="3" cy="-6" r="1.600" fill="#fff"/><circle cx="5" cy="-1" r="1.300" fill="#fff"/></g>';
const ART_BASIC = {
  basic_berry_patch: () => BUSH('#5aa043', '#2b5a25', '#d23a4a', '#7a1a26'),
  basic_dewberry_nook: () => BUSH('#3f8a62', '#1f4f3a', '#7a6be0', '#2f2a80'),
  basic_amber_weep: () => STUMP('<path d="M14 42q-3 9 2 12q5-3 2-12Z" fill="#e8a523" stroke="#7a4a0a" stroke-width="1.600"/><path d="M80 44q-3 9 2 11q5-3 2-11Z" fill="#e8a523" stroke="#7a4a0a" stroke-width="1.600"/><ellipse cx="26" cy="22" rx="10" ry="5" fill="#e8a523" stroke="#7a4a0a" stroke-width="1.400"/><ellipse cx="76" cy="36" rx="8" ry="4" fill="#e8a523" stroke="#7a4a0a" stroke-width="1.400"/>'),
  basic_pebble_bank: () => '<ellipse cx="50" cy="34" rx="46" ry="26" fill="#9db9bf" stroke="#4d6a72" stroke-width="2.500"/><g fill="#c8cdd0" stroke="#5d6a70" stroke-width="2"><ellipse cx="20" cy="36" rx="13" ry="9"/><ellipse cx="80" cy="38" rx="14" ry="10"/><ellipse cx="50" cy="54" rx="17" ry="7"/><ellipse cx="62" cy="12" rx="13" ry="7"/><ellipse cx="28" cy="14" rx="11" ry="6"/></g><g fill="#fff" opacity=".4"><ellipse cx="17" cy="33" rx="5" ry="2.500"/><ellipse cx="77" cy="35" rx="5" ry="2.500"/></g>',
  basic_twig_heap: () => '<ellipse cx="50" cy="36" rx="46" ry="25" fill="#7a5632" stroke="' + K_INK + '" stroke-width="2.500"/><ellipse cx="50" cy="30" rx="46" ry="25" fill="#a98355" stroke="' + K_INK + '" stroke-width="2.500"/><g stroke="#4a2f14" stroke-width="5.500" stroke-linecap="round"><path d="M8 40L34 14"/><path d="M92 38L66 10"/><path d="M14 22L42 52"/><path d="M88 24L58 54"/><path d="M30 8L74 52"/></g><g stroke="#c28d4e" stroke-width="2" stroke-linecap="round"><path d="M10 38L33 16"/><path d="M90 36L67 12"/><path d="M16 24L41 50"/><path d="M86 26L59 52"/></g>',
  basic_gossip_glade: () => '<ellipse cx="50" cy="34" rx="46" ry="26" fill="#a4d476" stroke="#3f7d2c" stroke-width="2.500"/><ellipse cx="50" cy="30" rx="36" ry="19" fill="#b9e08c"/>' + MUSH(14, 36, .85) + MUSH(86, 34, .8) + MUSH(52, 49, .75) + '<g fill="#fff" stroke="#c08a2a"><circle cx="26" cy="14" r="2.600"/><circle cx="74" cy="12" r="2.600"/></g>',
  basic_resin_pool: () => '<ellipse cx="50" cy="37" rx="46" ry="25" fill="#5a3d20" stroke="' + K_INK + '" stroke-width="2.500"/><ellipse cx="50" cy="30" rx="46" ry="25" fill="#9a7140" stroke="' + K_INK + '" stroke-width="2.500"/><ellipse cx="50" cy="31" rx="36" ry="18" fill="#6bb4cc" stroke="#2f6f86" stroke-width="2"/><path d="M24 26Q34 21 44 26" fill="none" stroke="#e8f8ff" stroke-width="2" stroke-linecap="round"/><path d="M60 38Q70 33 78 38" fill="none" stroke="#e8f8ff" stroke-width="2" stroke-linecap="round"/><g fill="#5a9a3a" stroke="#2c5a1a" stroke-width="1.200"><path d="M10 40q-2-14 3-18q2 8 0 18Z"/><path d="M92 38q2-14-3-18q-2 8 0 18Z"/></g>',
  basic_kindling_glen: () => '<ellipse cx="50" cy="54" rx="40" ry="6" fill="rgba(0,0,0,.22)"/><g stroke="' + K_INK + '" stroke-width="2.500"><circle cx="27" cy="38" r="19" fill="#dcab6c"/><circle cx="73" cy="38" r="19" fill="#d4a062"/><circle cx="50" cy="22" r="19" fill="#e2b374"/></g><g fill="none" stroke="#b9854a" stroke-width="1.500"><circle cx="27" cy="38" r="12"/><circle cx="27" cy="38" r="5"/><circle cx="73" cy="38" r="12"/><circle cx="73" cy="38" r="5"/><circle cx="50" cy="22" r="12"/><circle cx="50" cy="22" r="5"/></g>'
};
const CANOPY = [['#72b653', '#376f2f'], ['#5faa72', '#2c6e47'], ['#8cc058', '#4a7a2c'], ['#5aa593', '#2a6a60']];
function canopyArt(i) {
  const c = CANOPY[i % CANOPY.length];
  return '<ellipse cx="32" cy="57" rx="22" ry="5" fill="rgba(0,0,0,.22)"/><rect x="27" y="46" width="10" height="12" rx="2" fill="#7a5632" stroke="' + K_INK + '" stroke-width="2"/><g fill="' + c[0] + '" stroke="' + c[1] + '" stroke-width="2.500"><circle cx="17" cy="38" r="14"/><circle cx="47" cy="38" r="14"/><circle cx="32" cy="22" r="18"/><circle cx="32" cy="38" r="17"/></g><g fill="#fff" opacity=".2"><circle cx="24" cy="18" r="7"/><circle cx="40" cy="26" r="4"/></g>';
}
const ART_HAVEN = '<ellipse cx="32" cy="57" rx="27" ry="5" fill="rgba(0,0,0,.22)"/><path d="M4 56Q4 14 32 12Q60 14 60 56Z" fill="#cda26c" stroke="' + K_INK + '" stroke-width="2.500"/><path d="M7 36Q10 14 32 12Q54 14 57 36Q44 26 32 28Q20 26 7 36Z" fill="#7fb862" stroke="#2f5a25" stroke-width="2"/><path d="M23 56V45Q23 36 32 36Q41 36 41 45V56Z" fill="#5b3b20" stroke="' + K_INK + '" stroke-width="2"/><circle cx="14" cy="46" r="2.500" fill="#f6e1a8"/><circle cx="50" cy="46" r="2.500" fill="#f6e1a8"/>';
const ART_JOURNEY = '<ellipse cx="32" cy="57" rx="27" ry="5" fill="rgba(0,0,0,.22)"/><ellipse cx="32" cy="32" rx="29" ry="27" fill="#e6a85a" stroke="#7a4a1c" stroke-width="2.500"/><path d="M24 58L29 8H35L40 58Z" fill="#f3d9a0" stroke="#8a6a3a" stroke-width="1.600"/><g stroke="#fff" stroke-width="2.500" stroke-linecap="round" opacity=".85"><path d="M32 14V20"/><path d="M32 28V34"/><path d="M32 42V48"/></g>';
function pennantArt(special) {
  const f = special ? '#ecdff3' : '#f8efd8';
  return SVGH('0 0 48 48', '<path d="M3 3H45V33Q45 37 41 39L24 46L7 39Q3 37 3 33Z" fill="' + f + '" stroke="var(--ec,#888)" stroke-width="3" stroke-linejoin="round"/><rect x="3" y="3" width="42" height="7" fill="var(--ec,#888)"/><circle cx="12" cy="3" r="2" fill="' + K_INK + '"/><circle cx="36" cy="3" r="2" fill="' + K_INK + '"/>');
}
// the drawing under a place's icons
function spotArt(kind, key, i) {
  switch (kind) {
    case 'basic': return SVGH('0 0 100 64', (ART_BASIC[key] || ART_BASIC.basic_twig_heap)());
    case 'forest': return SVGH('0 0 64 64', canopyArt(i));
    case 'haven': return SVGH('0 0 64 64', ART_HAVEN);
    case 'journey': return SVGH('0 0 64 64', ART_JOURNEY);
    case 'bev': return pennantArt(false);
    case 'sev': return pennantArt(true);
  }
  return '';
}
// ---- the scene: grass, a stream, a dirt path through the places, the meadow bench, the rope for the pennants
function hrng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function sceneSVG(R) {
  const S = R.scene, w = Math.round(S.w), hh = Math.round(S.h), rnd = hrng(w * 31 + hh), o = [];
  o.push('<defs><linearGradient id="gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9d07f"/><stop offset=".55" stop-color="#88b866"/><stop offset="1" stop-color="#6d9e54"/></linearGradient><radialGradient id="vg" cx=".5" cy=".5" r=".75"><stop offset=".6" stop-color="#1c3a14" stop-opacity="0"/><stop offset="1" stop-color="#1c3a14" stop-opacity=".38"/></radialGradient></defs>');
  o.push('<rect width="' + w + '" height="' + hh + '" fill="url(#gr)"/>');
  // grass tufts and flowers
  for (let k = 0; k < 46; k++) { const x = rnd() * w, y = rnd() * hh; o.push('<path d="M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'l-2.500-6M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'l0-7M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'l2.500-6" stroke="#4f8a3a" stroke-width="1.600" stroke-linecap="round" fill="none" opacity=".55"/>'); }
  const FL = ['#fff6d6', '#ffd75a', '#f9a6c0', '#ffffff'];
  for (let k = 0; k < 26; k++) { const x = rnd() * w, y = rnd() * hh, c = FL[k % 4]; o.push('<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="3" fill="' + c + '" stroke="#5b7a3a" stroke-width=".8"/><circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="1" fill="#e9a31c"/>'); }
  // the forest edge behind the score chips
  if (R.tall) {
    const eh = R.chips.y + R.chips.h + 3; o.push('<rect x="0" y="0" width="' + w + '" height="' + eh + '" fill="#3f7236"/>');
    for (let x = -6; x < w + 20; x += 22) o.push('<circle cx="' + x + '" cy="' + (eh - 2) + '" r="13" fill="#4d8740" stroke="#2c5a28" stroke-width="2"/>');
    for (let x = 6; x < w + 20; x += 22) o.push('<circle cx="' + x + '" cy="' + (eh - 8) + '" r="10" fill="#5a9a4a" opacity=".55"/>');
  }
  // the stream along the meadow bench
  const sp = R.stream;
  if (sp) {
    let d = '', n = 0;
    if (sp.h) { for (let x = 0; x <= w + 18; x += 18, n++) d += (n ? 'T' : 'M') + x + ' ' + (sp.y + (n % 2 ? 5 : -5)); }
    else { for (let y = 0; y <= hh + 18; y += 18, n++) d += (n ? 'T' : 'M') + (sp.x + (n % 2 ? 5 : -5)) + ' ' + y; }
    o.push('<path d="' + d + '" fill="none" stroke="#2f6f86" stroke-width="13" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="#5fb0d2" stroke-width="9" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="#bfe8f6" stroke-width="2.500" stroke-linecap="round" stroke-dasharray="7 11"/>');
  }
  // the dirt path winding through the places
  if (R.path && R.path.length > 1) {
    const P = R.path; let d = 'M' + P[0].x.toFixed(1) + ' ' + P[0].y.toFixed(1);
    for (let k = 1; k < P.length; k++) { const a = P[k - 1], b = P[k], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2; d += 'Q' + (a.x + (b.x - a.x) * .15).toFixed(1) + ' ' + (b.y).toFixed(1) + ' ' + mx.toFixed(1) + ' ' + my.toFixed(1); }
    const l = P[P.length - 1]; d += 'T' + l.x.toFixed(1) + ' ' + l.y.toFixed(1);
    o.push('<path d="' + d + '" fill="none" stroke="#8a6a3a" stroke-width="19" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" fill="none" stroke="#d9b87a" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/><path d="' + d + '" fill="none" stroke="#f0d9a2" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 9" opacity=".8"/>');
  }
  // the meadow bench
  if (R.bench) { const b = R.bench; o.push('<rect x="' + (b.x + 2) + '" y="' + (b.y + 4) + '" width="' + b.w + '" height="' + b.h + '" rx="12" fill="rgba(0,0,0,.28)"/><rect x="' + b.x + '" y="' + b.y + '" width="' + b.w + '" height="' + b.h + '" rx="12" fill="#b98650" stroke="#5a3b1d" stroke-width="3"/>'); for (let y = b.y + 14; y < b.y + b.h - 4; y += 15) o.push('<path d="M' + (b.x + 6) + ' ' + y + 'H' + (b.x + b.w - 6) + '" stroke="#8a5f30" stroke-width="1.500" opacity=".55"/>'); }
  // the rope the event pennants hang from, between two posts
  if (R.rope) {
    const rp = R.rope, y = rp.y; let d = 'M6 ' + y;
    rp.xs.forEach((x, k) => { const px = k ? rp.xs[k - 1] : 6; d += 'Q' + ((px + x) / 2).toFixed(1) + ' ' + (y + 4) + ' ' + x.toFixed(1) + ' ' + y; });
    d += 'Q' + ((rp.xs[rp.xs.length - 1] + w - 6) / 2).toFixed(1) + ' ' + (y + 4) + ' ' + (w - 6) + ' ' + y;
    o.push('<rect x="1" y="' + (y - 6) + '" width="7" height="' + (rp.h + 10) + '" rx="3" fill="#7a5632" stroke="' + K_INK + '" stroke-width="2"/><rect x="' + (w - 8) + '" y="' + (y - 6) + '" width="7" height="' + (rp.h + 10) + '" rx="3" fill="#7a5632" stroke="' + K_INK + '" stroke-width="2"/><path d="' + d + '" fill="none" stroke="#5a3b1d" stroke-width="3" stroke-linecap="round"/>');
  }
  o.push('<rect width="' + w + '" height="' + hh + '" fill="url(#vg)"/>');
  return '<svg class="scsvg" viewBox="0 0 ' + w + ' ' + hh + '" width="' + w + '" height="' + hh + '" aria-hidden="true" focusable="false">' + o.join('') + '</svg>';
}
// the scene (data-board) and the wooden table under it
function sceneEls(R) {
  const f = document.createDocumentFragment();
  if (R.tbl) f.appendChild(placeBox(h('div.tbl'), R.tbl));
  const s = placeBox(h('div#scene.scn', { 'data-board': '', 'aria-hidden': 'true' }), R.scene); s.innerHTML = sceneSVG(R); f.appendChild(s);
  return f;
}
