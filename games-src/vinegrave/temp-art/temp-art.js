// Renders the CC BY 3.0 game-icons.net glyphs in temp-art/svg/ into temporary slot pictures (<stem>.webp) so the game looks finished
// until the owner's Flow art arrives (same names: the Flow files simply replace these). Credits: temp-art/CREDITS.md.
//   node temp-art/temp-art.js [outDir]   default outDir = ../../assets-inbox/vinegrave  (then: python3 games-src/scripts/ingest-assets.py)
const fs = require('fs'), path = require('path'), { chromium } = require('playwright');
const D = __dirname, OUT = path.resolve(process.argv[2] || path.join(D, '../../../assets-inbox/vinegrave'));
const man = JSON.parse(fs.readFileSync(path.join(D, '../assets.json'), 'utf8')); const SZ = {}; man.items.forEach(i => SZ[i.stem] = [i.w, i.h]);
const COL = { 'res-coin': '#e8b93a', 'res-compass': '#5a86b0', 'res-tablet': '#b9b09a', 'res-arrow': '#9aa7b5', 'res-jewel': '#2fc0a8', 'tr-boot': '#b07a46', 'tr-car': '#7a9a4a', 'tr-ship': '#4a8ac0', 'tr-plane': '#d9d2bf', 'token-glass': '#cfe6f2', 'token-notebook': '#e9d9a8' };
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined }), p = await b.newPage();
  const files = fs.readdirSync(path.join(D, 'svg')).filter(f => f.endsWith('.svg')); let n = 0;
  for (const f of files) {
    const stem = f.slice(0, -4), [w, h] = SZ[stem] || [256, 256], guard = stem.startsWith('guard-'), idol = stem.startsWith('idol-');
    let svg = fs.readFileSync(path.join(D, 'svg', f), 'utf8').replace('<path d="M0 0h512v512H0z"/>', '');
    const fill = guard ? '#ffcf9a' : idol ? '#3a2a0c' : (COL[stem] || '#f3ead2');
    svg = svg.replace(/fill="#fff"/g, `fill="${fill}" stroke="#1a1208" stroke-width="10" paint-order="stroke"`);
    const plate = guard ? 'background:radial-gradient(circle,#7a2a1a 0,#2a0d08 68%,transparent 70%);' : idol ? 'background:radial-gradient(circle,#e0b85a 0,#9a7420 62%,transparent 64%);' : '';
    await p.setViewportSize({ width: w, height: h });
    await p.setContent(`<html><body style="margin:0;background:transparent"><div style="width:${w}px;height:${h}px;display:flex;align-items:center;justify-content:center;${plate}"><div style="width:${guard || idol ? 62 : 90}%;height:${guard || idol ? 62 : 90}%">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div></div></body></html>`);
    const png = path.join(OUT, stem + '.png'); await p.screenshot({ path: png, omitBackground: true }); n++;
  }
  await b.close(); console.log('temp-art: wrote', n, 'pictures (png) to', OUT);
})();
