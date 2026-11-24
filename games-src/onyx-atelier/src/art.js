// Onyx Atelier code art: faceted gems, pearl, gold, crowns, favour scroll, patron medallions, ability marks. One SVG sprite, all drawn in code. (FLAG: none)
var OART = (function () {
  var GEM = { w: ['#f4f8fc', '#c9d6e4', '#8ea4bd'], u: ['#6f9bff', '#2f63d6', '#163a8a'], g: ['#5fe0a4', '#17a468', '#0b5c3a'], r: ['#ff7088', '#d4243f', '#7c0f22'], k: ['#8a8a99', '#33333d', '#0f0f14'] };
  var RIM = { w: '#6d84a0', u: '#0c2462', g: '#06402a', r: '#560614', k: '#d4d4de' };
  function gem(id, c) {
    var o = '12,2 28,2 38,12 38,28 28,38 12,38 2,28 2,12', t = '15,11 25,11 29,15 29,25 25,29 15,29 11,25 11,15';
    var O = o.split(' '), T = t.split(' '), f = '';
    for (var i = 0; i < 8; i++) { var j = (i + 1) % 8; f += '<polygon points="' + O[i] + ' ' + O[j] + ' ' + T[j] + ' ' + T[i] + '" fill="' + (i % 2 ? '#000' : '#fff') + '" opacity="' + (i < 2 || i === 7 ? (i % 2 ? .12 : .38) : (i % 2 ? .32 : .1)) + '"/>'; }
    return '<symbol id="gm-' + id + '" viewBox="0 0 40 40"><defs><linearGradient id="gg-' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c[0] + '"/><stop offset=".55" stop-color="' + c[1] + '"/><stop offset="1" stop-color="' + c[2] + '"/></linearGradient></defs>' +
      '<polygon points="' + o + '" fill="url(#gg-' + id + ')" stroke="' + RIM[id] + '" stroke-width="1.6" stroke-linejoin="round"/>' + f +
      '<polygon points="' + t + '" fill="url(#gg-' + id + ')" stroke="#fff" stroke-opacity=".35" stroke-width=".8"/>' +
      '<polygon points="15,12 21,12 14,19 12,17" fill="#fff" opacity=".75"/><circle cx="31" cy="9" r="1.6" fill="#fff" opacity=".9"/></symbol>';
  }
  var S = '<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;width:0;height:0" aria-hidden="true"><defs>' +
    '<radialGradient id="pgr" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="#f1e4d8"/><stop offset=".85" stop-color="#c7a99a"/><stop offset="1" stop-color="#8f7466"/></radialGradient>' +
    '<radialGradient id="ogr" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="#fff3c4"/><stop offset=".4" stop-color="#e9bf4f"/><stop offset="1" stop-color="#8a6416"/></radialGradient>' +
    '<linearGradient id="gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6e2a0"/><stop offset=".5" stop-color="#d8b45a"/><stop offset="1" stop-color="#8f7231"/></linearGradient></defs>';
  Object.keys(GEM).forEach(function (k) { S += gem(k, GEM[k]); });
  S += '<symbol id="gm-p" viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="url(#pgr)" stroke="#7d6152" stroke-width="1.2"/><ellipse cx="14.5" cy="13" rx="4.5" ry="3" fill="#fff" opacity=".85"/><circle cx="26" cy="27" r="6" fill="#d9b8f0" opacity=".18"/></symbol>';
  var rays = ''; for (var i = 0; i < 12; i++) { var a = i * Math.PI / 6; rays += '<line x1="' + (20 + Math.cos(a) * 5).toFixed(1) + '" y1="' + (20 + Math.sin(a) * 5).toFixed(1) + '" x2="' + (20 + Math.cos(a) * 10).toFixed(1) + '" y2="' + (20 + Math.sin(a) * 10).toFixed(1) + '"/>'; }
  S += '<symbol id="gm-o" viewBox="0 0 40 40"><circle cx="20" cy="20" r="16" fill="url(#ogr)" stroke="#6b4c0c" stroke-width="1.4"/><circle cx="20" cy="20" r="12" fill="none" stroke="#7a5810" stroke-width="1"/><g stroke="#7a5810" stroke-width="1.3" stroke-linecap="round">' + rays + '</g><circle cx="20" cy="20" r="3" fill="#7a5810"/><path d="M9 14 A13 13 0 0 1 18 7" stroke="#fff" stroke-width="1.6" fill="none" opacity=".7"/></symbol>';
  // the matching (wild) gem: one cut, five colours
  S += '<symbol id="gm-x" viewBox="0 0 40 40"><defs><linearGradient id="gx" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f8fc"/><stop offset=".25" stop-color="#2f63d6"/><stop offset=".5" stop-color="#17a468"/><stop offset=".75" stop-color="#d4243f"/><stop offset="1" stop-color="#33333d"/></linearGradient></defs><polygon points="12,2 28,2 38,12 38,28 28,38 12,38 2,28 2,12" fill="url(#gx)" stroke="#f1d68c" stroke-width="1.6"/><polygon points="15,11 25,11 29,15 29,25 25,29 15,29 11,25 11,15" fill="none" stroke="#fff" stroke-opacity=".6"/><text x="20" y="25.5" text-anchor="middle" font-size="15" font-weight="700" fill="#fff" stroke="#000" stroke-width=".6" font-family="Georgia,serif">?</text></symbol>';
  S += '<symbol id="crown" viewBox="0 0 24 24"><path d="M3 18 L4.5 8 L9 12.5 L12 5 L15 12.5 L19.5 8 L21 18 Z" fill="url(#gold)" stroke="#5c4613" stroke-width="1.1" stroke-linejoin="round"/><rect x="3" y="18.5" width="18" height="2.6" fill="url(#gold)" stroke="#5c4613" stroke-width=".8"/><circle cx="12" cy="5" r="1.3" fill="#fff6d6"/></symbol>';
  S += '<symbol id="scroll" viewBox="0 0 24 24"><path d="M6 4 H17 A3 3 0 0 1 17 10 V18 A2.5 2.5 0 0 1 14.5 20.5 H5 A2.5 2.5 0 0 1 5 15.5 H7 V5" fill="#f1e3bf" stroke="#8f7231" stroke-width="1.3" stroke-linejoin="round"/><path d="M9 9 H15 M9 12 H15 M9 15 H13" stroke="#8f7231" stroke-width="1.1"/><circle cx="17" cy="18" r="2.4" fill="#b3263b"/></symbol>';
  S += '<symbol id="scroll0" viewBox="0 0 24 24"><path d="M6 4 H17 A3 3 0 0 1 17 10 V18 A2.5 2.5 0 0 1 14.5 20.5 H5 A2.5 2.5 0 0 1 5 15.5 H7 V5" fill="none" stroke="#5a4a2a" stroke-width="1.2" stroke-dasharray="2 2"/></symbol>';
  // ability marks (single gold stroke)
  var st = ' fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"';
  S += '<symbol id="ab-again" viewBox="0 0 24 24"><path d="M19 12 A7 7 0 1 1 16 6.3"' + st + '/><path d="M16.5 2.5 V7 H12"' + st + '/></symbol>';
  S += '<symbol id="ab-token" viewBox="0 0 24 24"><path d="M8 4 H16 L20 9 L12 20 L4 9 Z"' + st + '/><path d="M4 9 H20"' + st + '/></symbol>';
  S += '<symbol id="ab-priv" viewBox="0 0 24 24"><path d="M6 4 H17 A3 3 0 0 1 17 10 V18 A2.5 2.5 0 0 1 14.5 20.5 H5 A2.5 2.5 0 0 1 5 15.5 H7 V5"' + st + '/></symbol>';
  S += '<symbol id="ab-steal" viewBox="0 0 24 24"><path d="M4 12 H17"' + st + '/><path d="M13 7 L18 12 L13 17"' + st + '/><path d="M20 5 V19"' + st + '/></symbol>';
  // the sunburst fan, deco background for cards and title
  var fan = ''; for (i = 0; i < 19; i++) { var b = Math.PI + i * Math.PI / 18; fan += '<line x1="50" y1="100" x2="' + (50 + Math.cos(b) * 98).toFixed(1) + '" y2="' + (100 + Math.sin(b) * 98).toFixed(1) + '"/>'; }
  S += '<symbol id="fan" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice"><g stroke="#d8b45a" stroke-width=".8">' + fan + '</g><circle cx="50" cy="100" r="30" fill="none" stroke="#d8b45a"/><circle cx="50" cy="100" r="60" fill="none" stroke="#d8b45a" stroke-width=".6"/></symbol>';
  // patron medallions: a profile cameo inside a stepped gold frame
  S += '<symbol id="patron" viewBox="0 0 48 48"><circle cx="24" cy="24" r="22" fill="#14110c" stroke="url(#gold)" stroke-width="2.4"/><circle cx="24" cy="24" r="17.5" fill="#2a1d24" stroke="#8f7231" stroke-width="1"/><path d="M27 12 C21 12 18 16 18.5 20 L16 25 L18.6 25.6 L18 29 C18 31 20 31.6 22.4 31.2 L23 35 L30 35 C29 31 31 29 31.5 25 C32.5 18 31 12 27 12 Z" fill="#e9d3a6" opacity=".9"/><path d="M26 10 C33 9 36 16 33 22 C35 15 31 11 26 12 Z" fill="#d8b45a"/></symbol>';
  S += '</svg>';
  function use(id, cls) { return '<svg class="' + (cls || '') + '" viewBox="0 0 40 40" aria-hidden="true"><use href="#' + id + '"/></svg>'; }
  function gm(c, cls) { return use('gm-' + c, 'gm ' + (cls || '')); }
  function icon(id, cls) { return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" aria-hidden="true"><use href="#' + id + '"/></svg>'; }
  function mount() { if (document.getElementById('oa-sprite')) return; var d = document.createElement('div'); d.id = 'oa-sprite'; d.innerHTML = S; document.body.insertBefore(d, document.body.firstChild); }
  return { mount: mount, gm: gm, icon: icon, use: use };
})();
