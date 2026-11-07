// Renders temporary CC BY 3.0 icons from game-icons.net (via its GitHub repo) into named slots. node temp-art/make.js  (needs network to raw.githubusercontent.com)
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path'), https = require('https');
const MAP = [ // stem, icon, kind ('icon' = transparent glyph, 'portrait' = glyph on a round dark scene), colour
  ['icon-signal', 'delapouite/radio-tower', 'icon', '#3fd0c9'], ['token-signal', 'delapouite/radio-tower', 'icon', '#3fd0c9'], ['icon-flare', 'delapouite/torch', 'icon', '#ff7a45'],
  ['token-captain', 'delapouite/ship-wheel', 'icon', '#f0b429'], ['icon-trick', 'delapouite/stack', 'icon', '#f0b429'], ['icon-silence', 'delapouite/silenced', 'icon', '#9fb8c6'],
  ['icon-deadzone', 'delapouite/fog', 'icon', '#9fb8c6'], ['icon-jammed', 'lorc/static', 'icon', '#9fb8c6'], ['icon-decide', 'lorc/pointing', 'icon', '#f0b429'],
  ['icon-share', 'delapouite/card-exchange', 'icon', '#f0b429'], ['icon-notrick', 'lorc/gas-mask', 'icon', '#e8577a'], ['icon-onetrick', 'lorc/fishing-hook', 'icon', '#3fd0c9'],
  ['icon-sonar-goal', 'lorc/radar-sweep', 'icon', '#a98bf5'], ['fx-ping', 'lorc/sonic-shout', 'icon', '#3fd0c9'], ['logo-emblem', 'delapouite/diving-helmet', 'icon', '#e9c46a'],
  // card faces / task cards / portraits / tokens: game-icons glyphs on code-drawn shapes
  ['card-coral', 'delapouite/coral', 'card', '#ffd1dc', '#7e1838', '#b8325a'], ['card-kelp', 'lorc/curled-leaf', 'card', '#c9f5d8', '#134d2d', '#25774a'],
  ['card-tide', 'lorc/wave-crest', 'card', '#cfe4ff', '#123d75', '#225fa8'], ['card-amber', 'lorc/sun', 'card', '#fff1c2', '#8a5a00', '#c98a12'],
  ['card-sonar', 'lorc/radar-sweep', 'card', '#e3d8ff', '#3a2386', '#6141c2'], ['card-back', 'delapouite/periscope', 'card', '#7fd8d3', '#06182a', '#0f3d5c'],
  ['task-coral', 'delapouite/coral', 'task', '#e8577a'], ['task-kelp', 'lorc/curled-leaf', 'task', '#3fb36b'], ['task-tide', 'lorc/wave-crest', 'task', '#3a8ee0'], ['task-amber', 'lorc/sun', 'task', '#f0b429'],
  ['portrait-you', 'delapouite/diving-helmet', 'face', '#3fd0c9'], ['portrait-ines', 'delapouite/captain-hat-profile', 'face', '#3a8ee0'], ['portrait-bram', 'lorc/spanner', 'face', '#3fb36b'],
  ['portrait-kito', 'delapouite/headphones', 'face', '#f0b429'], ['portrait-odile', 'delapouite/stethoscope', 'face', '#e8577a'], ['portrait-drone', 'delapouite/periscope', 'face', '#f0d04a'],
  ['token-order', null, 'disc', '#ffffff', '#f0b429'], ['token-relative', null, 'disc', '#dcecff', '#b8c4cc'], ['token-final', 'lorc/anchor', 'disc', '#ffd6d6', '#f0b429'],
  ['boss-warden', 'delapouite/lighthouse', 'portrait', '#cfd8dc'], ['boss-swarm', 'lorc/tornado', 'portrait', '#2bb5b0'], ['boss-source', 'lorc/spiral-shell', 'portrait', '#a98bf5']];
const get = u => new Promise((ok, no) => https.get(u, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => r.statusCode === 200 ? ok(d) : no(new Error(u + ' ' + r.statusCode))); }).on('error', no));
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 512, height: 512 } });
  for (const [stem, ic, kind, col, c2, c3] of MAP) {
    const svg = ic ? await get('https://raw.githubusercontent.com/game-icons/icons/master/' + ic + '.svg') : '';
    const paths = (svg.match(/<path[^>]*d="([^"]+)"/g) || []).map(x => x.match(/d="([^"]+)"/)[1]).filter(d => !/^M0 0h512v512H0z$/.test(d));
    const glyph = paths.map(d => `<path d="${d}" fill="${col}"/>`).join('');
    const bg = kind === 'portrait' ? '<defs><radialGradient id="g" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#1b4a6b"/><stop offset="1" stop-color="#04121f"/></radialGradient></defs><rect width="512" height="512" fill="url(#g)"/>' : '';
    const inner = kind === 'portrait' ? `<g transform="translate(96 96) scale(.625)">${glyph}</g>` : `<g transform="translate(24 24) scale(.906)" style="filter:drop-shadow(0 6px 10px rgba(0,0,0,.45))">${glyph}</g>`;
    let W = 512, H = 512, body = bg + inner, alpha = kind !== 'portrait';
    if (kind === 'card') { W = 400; H = 600; alpha = false; const gl = paths.map(d => `<path d="${d}" fill="${col}" opacity=".85"/>`).join('');
      body = `<defs><linearGradient id="c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c2}"/><stop offset=".45" stop-color="${c2}"/><stop offset="1" stop-color="${c3}"/></linearGradient></defs><rect width="400" height="600" fill="url(#c)"/><rect x="10" y="10" width="380" height="580" rx="22" fill="none" stroke="${col}" stroke-opacity=".55" stroke-width="5"/>` + (stem === 'card-back' ? `<circle cx="200" cy="300" r="130" fill="none" stroke="${col}" stroke-width="6" opacity=".7"/><g transform="translate(110 210) scale(.35)">${gl}</g>` : `<g transform="translate(150 290) scale(.45)">${gl}</g>`); }
    if (kind === 'task') { W = 400; H = 600; alpha = false; const gl = paths.map(d => `<path d="${d}" fill="#fff"/>`).join('');
      body = `<rect width="400" height="600" fill="#0b2a42"/><rect x="12" y="12" width="376" height="576" rx="22" fill="none" stroke="#f0b429" stroke-width="12"/><circle cx="200" cy="330" r="120" fill="${col}" stroke="#c98a12" stroke-width="12"/><g transform="translate(120 250) scale(.3125)">${gl}</g>`; }
    if (kind === 'face') { alpha = false; const gl = paths.map(d => `<path d="${d}" fill="#06182a"/>`).join('');
      body = `<defs><radialGradient id="f" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="#ffffff" stop-opacity=".5"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient></defs><rect width="512" height="512" fill="${col}"/><rect width="512" height="512" fill="url(#f)"/><g transform="translate(106 106) scale(.586)">${gl}</g>`; }
    if (kind === 'disc') { W = H = 256; const gl = paths.map(d => `<path d="${d}" fill="#7e1838" opacity=".35"/>`).join('');
      body = `<circle cx="128" cy="128" r="116" fill="${col}" stroke="${c2}" stroke-width="18"/>` + (gl ? `<g transform="translate(48 48) scale(.3125)">${gl}</g>` : ''); }
    await p.setViewportSize({ width: W, height: H });
    await p.setContent(`<html><body style="margin:0;background:transparent"><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg></body></html>`);
    const png = path.join(__dirname, stem + '.png'); await p.screenshot({ path: png, omitBackground: alpha });
    console.log('made', stem, 'from', ic);
  }
  await b.close();
})();
