// Painted dusk scene for the title and result screens (own SVG art). GWART.paint(el) puts it behind the screen's content.
var GWART = (function () {
  var W = 1600, H = 900;
  function pines(x0, x1, y, n, col, h) { var s = ''; for (var i = 0; i < n; i++) { var x = x0 + (x1 - x0) * (i + .5 * ((i * 7) % 3)) / n, k = h * (.7 + ((i * 37) % 10) / 20); s += '<path d="M' + x + ',' + y + ' l' + (-k * .22) + ',0 l' + (k * .22) + ',' + (-k) + ' l' + (k * .22) + ',' + k + ' z" fill="' + col + '"/>'; } return s; }
  function flag(x, y, col, dark) { return '<rect x="' + (x - 3) + '" y="' + y + '" width="6" height="190" fill="#120d18"/><path d="M' + (x + 3) + ',' + (y + 6) + ' q40,-14 78,0 l-16,32 l16,32 q-38,-12 -78,0 z" fill="' + col + '" stroke="' + dark + '" stroke-width="3"/><circle cx="' + x + '" cy="' + y + '" r="7" fill="#e8c36a"/>'; }
  function svg() {
    var s = '<defs><linearGradient id="gwSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#17132f"/><stop offset=".45" stop-color="#4b2750"/><stop offset=".72" stop-color="#b9573a"/><stop offset="1" stop-color="#f1a652"/></linearGradient>'
      + '<radialGradient id="gwKiln" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffb347" stop-opacity=".95"/><stop offset="1" stop-color="#ff5a1f" stop-opacity="0"/></radialGradient>'
      + '<radialGradient id="gwLamp" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".95"/><stop offset="1" stop-color="#ffd25a" stop-opacity="0"/></radialGradient></defs>';
    s += '<rect width="' + W + '" height="' + H + '" fill="url(#gwSky)"/>';
    for (var i = 0; i < 46; i++) s += '<circle cx="' + ((i * 349) % W) + '" cy="' + (20 + (i * 131) % 330) + '" r="' + (1 + (i % 3) * .6) + '" fill="#f6e9c8" opacity="' + (.35 + (i % 4) * .15) + '"/>';
    s += '<circle cx="1180" cy="200" r="46" fill="#f4e6c0" opacity=".9"/><circle cx="1196" cy="190" r="46" fill="#4b2750"/>';
    s += '<path d="M0,640 L170,540 L300,610 L470,500 L640,620 L800,560 L960,640 L1180,520 L1380,610 L1600,540 L1600,900 L0,900Z" fill="#3b2a5a"/>';
    s += '<ellipse cx="1000" cy="440" rx="190" ry="95" fill="url(#gwKiln)"/>';
    s += '<path d="M770,700 L930,440 Q1000,418 1070,440 L1230,700Z" fill="#241a38"/><path d="M930,440 Q1000,462 1070,440 Q1000,424 930,440Z" fill="#ff8a2e"/>';
    s += '<path d="M985,452 q-14,70 -34,130 M1008,454 q10,60 26,150" stroke="#ff9a3c" stroke-width="5" fill="none" stroke-linecap="round" opacity=".85"/>';
    s += '<g fill="#cdbfd6" opacity=".22"><circle cx="1012" cy="392" r="32"/><circle cx="1040" cy="346" r="42"/><circle cx="1086" cy="300" r="52"/></g>';
    s += '<path d="M0,730 L220,660 L420,720 L640,650 L880,730 L1120,670 L1340,730 L1600,660 L1600,900 L0,900Z" fill="#241a3a"/>' + pines(0, 1600, 735, 60, '#171126', 70);
    s += '<path d="M0,800 Q300,740 560,790 T1100,780 T1600,770 L1600,900 L0,900Z" fill="#120d1c"/>' + pines(0, 1600, 805, 44, '#0c0814', 96);
    s += '<path d="M560,900 Q640,830 800,800 Q930,780 1010,790" stroke="#3a2c52" stroke-width="18" fill="none" opacity=".7"/>';
    s += '<ellipse cx="760" cy="796" rx="95" ry="62" fill="url(#gwLamp)"/>';
    [[720, 0], [752, 4], [784, -2]].forEach(function (p) { s += '<g transform="translate(' + p[0] + ',' + (806 + p[1]) + ')"><path d="M0,-30 q-12,10 -14,34 h28 q-2,-24 -14,-34z" fill="#07050c"/><circle cx="0" cy="-36" r="8" fill="#07050c"/></g>'; });
    s += '<rect x="805" y="778" width="4" height="30" fill="#07050c"/><rect x="800" y="768" width="14" height="16" rx="3" fill="#ffd25a"/>';
    s += flag(560, 600, '#1d4fae', '#0e2b6b') + flag(1040, 600, '#b3161c', '#5a0a0e');
    return s;
  }
  return { paint: function (el) {
    if (!el || el.querySelector('.gwart')) return; var d = document.createElement('div'); d.className = 'gwart'; d.setAttribute('aria-hidden', 'true');
    d.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg">' + svg() + '</svg>'; el.insertBefore(d, el.firstChild); } };
})();
