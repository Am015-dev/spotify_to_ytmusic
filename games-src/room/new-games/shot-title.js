// Renders each new game's built file at 1600x900 and saves the painted title screen (name + tagline over the painting, buttons hidden)
// as a PNG. Used by make-covers.py; run that instead of this directly.
//   NODE_PATH=<dir containing playwright> node shot-title.js <outdir> [id ...]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const SRC = path.resolve(__dirname, '..', '..');            // games-src
const GAMES = {
  lantern: 'lantern-dive/game/lantern-dive.html',
  cauldron: 'cauldron-fair/cauldron-fair.html',
  approach: 'final-approach/game/final-approach.html',
};
const EXEC = process.env.CHROMIUM || '/opt/pw-browsers/chromium';
(async () => {
  const out = path.resolve(process.argv[2] || '.'); fs.mkdirSync(out, { recursive: true });
  const ids = process.argv.slice(3).length ? process.argv.slice(3) : Object.keys(GAMES);
  const b = await chromium.launch({ executablePath: EXEC, args: ['--no-sandbox'] });
  let bad = 0;
  for (const id of ids) {
    const f = path.join(SRC, GAMES[id]);
    if (!fs.existsSync(f)) { console.log('MISSING built file for', id, f); bad++; continue; }
    const p = await b.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('file://' + f);
    await p.waitForSelector('.logo', { timeout: 20000 });
    await p.waitForFunction(() => { const i = document.querySelector('.ttl-bg'); return !i || i.tagName !== 'IMG' || (i.complete && i.naturalWidth > 0); }, null, { timeout: 20000 }).catch(() => { });
    await p.addStyleTag({ content: '.tbtns,.tlink,.gx-drawer,[class*="toast"]{visibility:hidden!important}' });
    await p.waitForTimeout(2500);
    await p.screenshot({ path: path.join(out, id + '.png') });
    console.log(id, 'ok', errs.length ? 'page errors: ' + errs.join('; ') : '');
    await p.close();
  }
  await b.close(); process.exit(bad ? 1 : 0);
})();
