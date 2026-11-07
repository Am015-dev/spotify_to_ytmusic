// Renders temporary CC BY 3.0 icons from game-icons.net (via its GitHub repo) into named slots. node temp-art/make.js  (needs network to raw.githubusercontent.com)
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path'), https = require('https');
const MAP = [ // stem, icon, kind ('icon' = transparent glyph, 'portrait' = glyph on a round dark scene), colour
  ['icon-signal', 'delapouite/radio-tower', 'icon', '#3fd0c9'], ['token-signal', 'delapouite/radio-tower', 'icon', '#3fd0c9'], ['icon-flare', 'delapouite/torch', 'icon', '#ff7a45'],
  ['token-captain', 'delapouite/ship-wheel', 'icon', '#f0b429'], ['icon-trick', 'delapouite/stack', 'icon', '#f0b429'], ['icon-silence', 'delapouite/silenced', 'icon', '#9fb8c6'],
  ['icon-deadzone', 'delapouite/fog', 'icon', '#9fb8c6'], ['icon-jammed', 'lorc/static', 'icon', '#9fb8c6'], ['icon-decide', 'lorc/pointing', 'icon', '#f0b429'],
  ['icon-share', 'delapouite/card-exchange', 'icon', '#f0b429'], ['icon-notrick', 'lorc/gas-mask', 'icon', '#e8577a'], ['icon-onetrick', 'lorc/fishing-hook', 'icon', '#3fd0c9'],
  ['icon-sonar-goal', 'lorc/radar-sweep', 'icon', '#a98bf5'], ['fx-ping', 'lorc/sonic-shout', 'icon', '#3fd0c9'], ['logo-emblem', 'delapouite/diving-helmet', 'icon', '#e9c46a'],
  ['boss-warden', 'delapouite/lighthouse', 'portrait', '#cfd8dc'], ['boss-swarm', 'lorc/tornado', 'portrait', '#2bb5b0'], ['boss-source', 'lorc/spiral-shell', 'portrait', '#a98bf5']];
const get = u => new Promise((ok, no) => https.get(u, r => { let d = ''; r.on('data', c => d += c); r.on('end', () => r.statusCode === 200 ? ok(d) : no(new Error(u + ' ' + r.statusCode))); }).on('error', no));
(async () => {
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 512, height: 512 } });
  for (const [stem, ic, kind, col] of MAP) {
    const svg = await get('https://raw.githubusercontent.com/game-icons/icons/master/' + ic + '.svg');
    const paths = (svg.match(/<path[^>]*d="([^"]+)"/g) || []).map(x => x.match(/d="([^"]+)"/)[1]).filter(d => !/^M0 0h512v512H0z$/.test(d));
    const glyph = paths.map(d => `<path d="${d}" fill="${col}"/>`).join('');
    const bg = kind === 'portrait' ? '<defs><radialGradient id="g" cx="50%" cy="40%" r="70%"><stop offset="0" stop-color="#1b4a6b"/><stop offset="1" stop-color="#04121f"/></radialGradient></defs><rect width="512" height="512" fill="url(#g)"/>' : '';
    const inner = kind === 'portrait' ? `<g transform="translate(96 96) scale(.625)">${glyph}</g>` : `<g transform="translate(24 24) scale(.906)" style="filter:drop-shadow(0 6px 10px rgba(0,0,0,.45))">${glyph}</g>`;
    await p.setContent(`<html><body style="margin:0;background:transparent"><svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">${bg}${inner}</svg></body></html>`);
    const png = path.join(__dirname, stem + '.png'); await p.screenshot({ path: png, omitBackground: kind !== 'portrait' });
    console.log('made', stem, 'from', ic);
  }
  await b.close();
})();
