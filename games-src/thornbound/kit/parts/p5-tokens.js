/* ===== Tokens & herald meeples ===== */
function heraldInner(f) {
  var P = fac(f), h = '';
  h += '<ellipse cx="0" cy="9" rx="15" ry="5" fill="#000" opacity=".4" filter="url(#tb-soft)"/><ellipse cx="0" cy="7" rx="13" ry="4.4" fill="url(#tb-goldv)" stroke="#3d2a08" stroke-width="1"/>';
  h += '<path d="M-11 6 Q-14 -8 -6 -15 H6 Q14 -8 11 6Z" fill="url(#tb-c-' + f + ')" stroke="rgba(0,0,0,.65)" stroke-width="1.4" stroke-linejoin="round"/>';
  h += '<path d="M-7 -14 Q-10 -6 -9 4 L-6 4 Q-7 -5 -4 -14Z" fill="#fff" opacity=".22"/><path d="M-11.5 2 H11.5 L11 6 H-11Z" fill="url(#tb-gold)"/>';
  h += '<path d="M-2 -15 L0 4 L2 -15Z" fill="url(#tb-gold)" opacity=".9"/><g transform="translate(0 -5) scale(.34)">' + emblem(f, P.glyph) + '</g>';
  h += '<circle cy="-22" r="7.2" fill="#ecd9b8" stroke="rgba(0,0,0,.65)" stroke-width="1.3"/>';
  if (f === 'gilded') h += '<path d="M-7 -27 L-8 -35 L-3.5 -30.5 L0 -37 L3.5 -30.5 L8 -35 L7 -27Z" fill="url(#tb-gold)" stroke="#4a3208" stroke-width=".8" stroke-linejoin="round"/>';
  else if (f === 'heath') h += '<path d="M-4 -28 Q-7 -36 -12 -38 M-6 -33 Q-6 -38 -9 -41 M4 -28 Q7 -36 12 -38 M6 -33 Q6 -38 9 -41" stroke="url(#tb-bone)" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M-7 -24 Q0 -33 7 -24Z" fill="#3b4f27" stroke="rgba(0,0,0,.5)" stroke-width=".8"/>';
  else if (f === 'lantern') h += '<path d="M-8 -26 Q0 -34 8 -26Z" fill="url(#tb-c-lantern)" stroke="rgba(0,0,0,.6)" stroke-width="1"/><path d="M0 -33 C-3 -37 -2 -41 0 -45 C2 -41 3 -37 0 -33Z" fill="#ffc45a" stroke="#c4561f" stroke-width=".7"/>';
  else if (f === 'choir') h += '<path d="M-7 -26 L0 -43 L7 -26Z" fill="url(#tb-silver)" stroke="#4a4a6a" stroke-width=".9" stroke-linejoin="round"/><path d="M3 -33 A4 4 0 1 0 3 -26 A3 3 0 1 1 3 -33Z" fill="#2a2458"/>';
  else h += '<path d="M-8 -26 Q0 -34 8 -26Z" fill="#7b5b37"/>';
  h += '<circle cx="-2.4" cy="-22.5" r=".9" fill="#2a1a10"/><circle cx="2.4" cy="-22.5" r=".9" fill="#2a1a10"/>';
  return h;
}
TB.heraldInner = heraldInner;
var RES = {
  coin: ['url(#tb-gold)', '#4a3208'], grain: ['#d9a93a', '#5a3d0c'], iron: ['#7d868c', '#262b2f']
};
function tokenInner(kind, o) {
  o = o || {}; var f = o.faction || 'neutral', P = fac(f), s = '';
  switch (kind) {
    case 'influence':
      s = '<ellipse cy="3" rx="19" ry="19" fill="#000" opacity=".4" filter="url(#tb-soft)"/><circle r="19" fill="url(#tb-gold)" stroke="#3d2a08" stroke-width="1.4"/><circle r="15" fill="url(#tb-f-' + f + ')" stroke="#2b1808" stroke-width="1"/><circle r="15" fill="url(#tb-seal)"/><g transform="scale(.62)">' + emblem(f, P.glyph) + '</g>' + (o.n != null ? '<text y="5.6" x="0" text-anchor="middle" font-family="' + DISPLAY + '" font-weight="700" font-size="16" fill="#fff" stroke="#000" stroke-width="2.4" paint-order="stroke">' + esc(o.n) + '</text>' : '');
      break;
    case 'coin': case 'grain': case 'iron': {
      var r = RES[kind];
      s = '<ellipse cy="3" rx="17" ry="17" fill="#000" opacity=".4" filter="url(#tb-soft)"/><circle r="17" fill="' + r[0] + '" stroke="' + r[1] + '" stroke-width="1.6"/>';
      if (kind === 'coin') s += '<circle r="12.5" fill="none" stroke="#5c3d0c" stroke-width="1.1" stroke-dasharray="1.8 2.2"/><path d="M-3 -8 Q-8 0 -3 8 M3 -8 Q8 0 3 8" stroke="#5c3d0c" stroke-width="1.5" fill="none"/><path d="M-10 -9 Q-5 -14 2 -14" stroke="#fff" stroke-opacity=".7" stroke-width="2" fill="none"/>';
      if (kind === 'grain') s += '<g stroke="#4a2f08" stroke-width="1.6" fill="none" stroke-linecap="round"><path d="M0 11 V-10"/><path d="M0 4 L-5 -1 M0 -1 L-5 -6 M0 -6 L-4 -10 M0 4 L5 -1 M0 -1 L5 -6 M0 -6 L4 -10"/></g><circle r="14" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.2"/>';
      if (kind === 'iron') s += '<path d="M-9 -3 L-4 -10 H5 L10 -3 L7 8 H-7Z" fill="#aab3b8" stroke="#1d2125" stroke-width="1.3" stroke-linejoin="round"/><path d="M-4 -10 L-1 -2 L-7 8 M5 -10 L2 -2 L7 8" stroke="#1d2125" stroke-width=".9" fill="none"/>';
      break; }
    case 'clash':
      s = '<circle r="22" fill="#000" opacity=".4" filter="url(#tb-soft)" cy="3"/><path d="M0 -22 Q16 -22 21 -8 Q24 4 15 15 Q6 24 -8 20 Q-22 14 -21 0 Q-20 -16 0 -22Z" fill="#8a1a24" stroke="#4a0a12" stroke-width="1.6"/><path d="M0 -22 Q16 -22 21 -8 Q24 4 15 15 Q6 24 -8 20 Q-22 14 -21 0 Q-20 -16 0 -22Z" fill="url(#tb-seal)"/><g stroke="#f4e3b0" stroke-width="2.6" stroke-linecap="round"><path d="M-11 -11 L11 11 M11 -11 L-11 11"/></g><g stroke="#f4e3b0" stroke-width="3.2" stroke-linecap="round"><path d="M-12 7 L-8 11 M12 7 L8 11"/></g><circle r="2.4" fill="#f4e3b0"/>';
      break;
    case 'reveal':
      s = '<circle r="22" fill="#000" opacity=".4" filter="url(#tb-soft)" cy="3"/><circle r="20" fill="url(#tb-gold)" stroke="#4a3208" stroke-width="1.6"/><circle r="16" fill="#1b130d"/><path d="M-12 0 Q0 -11 12 0 Q0 11 -12 0Z" fill="#f4e3b0"/><circle r="5.2" fill="#7c1b2c"/><circle r="2.2" fill="#000"/><circle cx="-1.6" cy="-1.8" r="1.1" fill="#fff"/>';
      break;
    case 'tie':
      s = '<circle r="22" fill="#000" opacity=".4" filter="url(#tb-soft)" cy="3"/><circle r="20" fill="url(#tb-silver)" stroke="#3a3f55" stroke-width="1.6"/><circle r="16" fill="#2a2d44"/><path d="M-10 -3 H10 M-10 4 H10" stroke="#e9ebf6" stroke-width="3.2" stroke-linecap="round"/>';
      break;
    case 'winner':
      s = '<circle r="22" fill="#000" opacity=".4" filter="url(#tb-soft)" cy="3"/><g fill="#6a9a40" stroke="#2f4f25" stroke-width=".8">' + [0, 1, 2, 3, 4, 5].map(function (i) { return '<ellipse cx="' + (-16 + i * 2.2) + '" cy="' + (10 - i * 4.6) + '" rx="5.4" ry="2.6" transform="rotate(' + (-60 + i * 9) + ' ' + (-16 + i * 2.2) + ' ' + (10 - i * 4.6) + ')"/><ellipse cx="' + (16 - i * 2.2) + '" cy="' + (10 - i * 4.6) + '" rx="5.4" ry="2.6" transform="rotate(' + (60 - i * 9) + ' ' + (16 - i * 2.2) + ' ' + (10 - i * 4.6) + ')"/>'; }).join('') + '</g>' + crownShape(0, 7, .62);
      break;
    case 'first':
      s = '<circle r="22" fill="#000" opacity=".4" filter="url(#tb-soft)" cy="3"/><circle r="19" fill="#241820" stroke="url(#tb-gold)" stroke-width="2"/>' + (function () { var r = rngf(3), t = ''; for (var i = 0; i < 8; i++) { var a = i * 45 * Math.PI / 180; t += '<path d="M' + n2(Math.cos(a) * 14) + ' ' + n2(Math.sin(a) * 14) + ' L' + n2(Math.cos(a + .2) * 20) + ' ' + n2(Math.sin(a + .2) * 20) + ' L' + n2(Math.cos(a + .4) * 14) + ' ' + n2(Math.sin(a + .4) * 14) + 'Z" fill="#0e0810"/>'; } return t; })() + '<g transform="scale(.6)">' + emblem('gilded') + '</g>';
      break;
    case 'round':
      s = '<ellipse cy="3" rx="20" ry="20" fill="#000" opacity=".4" filter="url(#tb-soft)"/><path d="M0 -21 Q15 -22 20 -9 Q24 3 14 14 Q5 23 -9 19 Q-22 13 -20 -1 Q-19 -17 0 -21Z" fill="#7c1b2c" stroke="#3a0912" stroke-width="1.6"/><path d="M0 -21 Q15 -22 20 -9 Q24 3 14 14 Q5 23 -9 19 Q-22 13 -20 -1 Q-19 -17 0 -21Z" fill="url(#tb-seal)"/><circle r="12.5" fill="none" stroke="#e8c070" stroke-width="1.2"/><text y="6.4" text-anchor="middle" font-family="' + DISPLAY + '" font-weight="700" font-size="19" fill="#f4dc9a" stroke="rgba(0,0,0,.5)" stroke-width="1" paint-order="stroke">' + esc(o.n != null ? o.n : '') + '</text>';
      break;
    default: s = '<circle r="16" fill="#888"/>';
  }
  return s;
}
TB.tokenKinds = ['influence', 'coin', 'grain', 'iron', 'herald', 'clash', 'reveal', 'tie', 'winner', 'first', 'round'];
/* token(kind, {faction, n}, sizePx) -> <svg> element */
TB.tokenSVG = function (kind, o, size) {
  TB.mount(); size = size || 40; var vb = kind === 'herald' ? '-22 -48 44 62' : '-24 -24 48 48', w = kind === 'herald' ? Math.round(size * 44 / 62) : size;
  return '<svg xmlns="' + NS + '" class="tb-token tb-token-' + kind + '" viewBox="' + vb + '" width="' + w + '" height="' + size + '" role="img" aria-label="' + esc(kind + ((o && o.faction) ? ' ' + fac(o.faction).short : '')) + '">' + (kind === 'herald' ? heraldInner((o && o.faction) || 'neutral') : tokenInner(kind, o)) + '</svg>';
};
TB.token = function (kind, o, size) { var d = document.createElement('div'); d.innerHTML = TB.tokenSVG(kind, o, size); return d.firstChild; };
