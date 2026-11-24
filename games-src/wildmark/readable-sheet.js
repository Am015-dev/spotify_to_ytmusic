// Readability contact sheet (W732): title, board mid-game, market (hand), a card inspected, each window, 2 lessons, at one size.
//   node games-src/wildmark/readable-sheet.js <before|after> [402x874|1366x768]  -> games-src/wildmark/proof/readable/<tag>-<size>-sheet.jpg
// Also prints a machine check per cell: text < 14px (phone; 13px allowed only under pictures), icons/tokens < 28px, text contrast < 4.5:1.
const PW = (() => { try { return require('/opt/node-tools/node_modules/playwright'); } catch (e) { return require('playwright'); } })();
const fs = require('fs'), path = require('path'), cp = require('child_process');
const { turbo, tick } = require('../scripts/turbo.js');
const tag = process.argv[2] || 'after', size = (process.argv[3] || '402x874').split('x').map(Number), [W, H] = size, phone = W < 600;
const OUT = path.join(__dirname, 'proof', 'readable'), DIR = path.join(OUT, tag + '-' + W + 'x' + H); fs.mkdirSync(DIR, { recursive: true });
const html = fs.readFileSync(path.join(__dirname, 'wildmark.html'));
const media = path.join(__dirname, '..', '..', 'games', 'wildmark', 'media');
const CHECK = () => {   // readability probe: small text, small icons, low contrast (visible elements only)
  const lum = c => { const m = c.match(/[\d.]+/g); if (!m) return null; const [r, g, b] = m.slice(0, 3).map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }); return { L: 0.2126 * r + 0.7152 * g + 0.0722 * b, a: m[3] == null ? 1 : +m[3] }; };
  const bgOf = e => { for (let x = e; x; x = x.parentElement) { const s = getComputedStyle(x); if (s.backgroundImage !== 'none' && !/gradient/.test(s.backgroundImage)) return 'img'; const l = lum(s.backgroundColor); if (l && l.a > 0.85) return l.L; } return lum('rgb(20,24,20)').L; };
  const vis = e => { const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return null; for (let x = e; x; x = x.parentElement) { const s = getComputedStyle(x); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.3) return null; } return r; };
  const bad = [];
  document.querySelectorAll('body *').forEach(e => {
    if (!e.childNodes.length || e.closest('svg') && e.tagName !== 'text') return;
    const own = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()); if (!own) return;
    const r = vis(e); if (!r) return; const s = getComputedStyle(e); let f = parseFloat(s.fontSize);
    if (e.tagName === 'text') { const bb = e.getBoundingClientRect(); f = bb.height * 0.8; }
    const t = e.textContent.trim().slice(0, 22); if (/^Test: /.test(e.textContent.trim())) return;   // the ?scn= test label (test builds only)
    if (e.tagName !== 'text' && f < (phone() ? 14 : 13) - 0.01) bad.push('font ' + f.toFixed(1) + 'px "' + t + '"');
    if (e.tagName === 'text') return;
    const fg = lum(s.color), bg = bgOf(e); if (!fg) return;
    if (bg === 'img') { const sh = s.textShadow; if (!sh || sh === 'none') bad.push('text on art "' + t + '"'); return; }
    const hi = Math.max(fg.L, bg), lo = Math.min(fg.L, bg), cr = (hi + 0.05) / (lo + 0.05); if (cr < 4.5) bad.push('contrast ' + cr.toFixed(1) + ' "' + t + '"');
  });
  document.querySelectorAll('.tk, .cc svg, .mt, .mk, [data-art]').forEach(e => { const r = vis(e); if (!r) return; const m = Math.min(r.width, r.height); if (m < 27.5 && !e.closest('#map')) bad.push('icon ' + Math.round(m) + 'px ' + (e.id || e.className.baseVal || e.className || e.tagName)); });
  return [...new Set(bad)];
};
(async () => {
  const b = await PW.chromium.launch({ executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined });
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: phone });
  await turbo(ctx);
  await ctx.route('**/*', r => { const u = new URL(r.request().url()); if (u.host !== 'gns.test') return r.abort(); if (u.pathname === '/') return r.fulfill({ status: 200, contentType: 'text/html', body: html }); const f = path.join(media, path.basename(u.pathname)); if (u.pathname.startsWith('/media/') && fs.existsSync(f)) return r.fulfill({ status: 200, contentType: 'image/webp', body: fs.readFileSync(f) }); return r.fulfill({ status: 404, body: '' }); });
  const p = await ctx.newPage(); const report = [];
  p.on('pageerror', e => report.push('PAGE ERROR ' + e.message));
  const go = async q => { await p.goto('https://gns.test/' + q); await tick(p, 1600); };
  const shot = async (id) => { await tick(p, 700); const f = await p.evaluate('(' + CHECK.toString().replace('phone()', String(phone)) + ')()'); report.push(id + ': ' + (f.length ? f.length + ' -> ' + f.slice(0, 8).join(' | ') : 'ok')); await p.screenshot({ path: path.join(DIR, id + '.png') }); };
  const q = phone ? '?phone=1' : '';
  const sc = (id) => q ? q + '&scn=' + id : '?scn=' + id;
  await go(q); await shot('01-title');
  await go(sc('wm-board')); await shot('02-board-mid');
  await go(sc('wm-place')); await shot('03-hand-market');
  await go(sc('wm-board')); await p.evaluate(() => { const e = document.querySelector('#mk .mt'); if (e) { const r = e.getBoundingClientRect(); const o = { bubbles: true, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2, pointerId: 1, pointerType: 'touch' }; e.dispatchEvent(new PointerEvent('pointerdown', o)); setTimeout(() => e.dispatchEvent(new PointerEvent('pointerup', o)), 900); } }); await tick(p, 600); await shot('04-tile-held');
  await go(sc('wm-board')); await p.evaluate(() => { const c = document.querySelector('.cc[data-card="bear"]'); if (c) c.click(); }); await shot('05-card-inspect');
  await go(sc('wm-cards')); await shot('06-cards-window');
  await go(sc('wm-board')); await p.evaluate(() => { const c = document.querySelector('[data-gx="rulesd"]'); c && c.click(); }); await shot('07-rules-window');
  await p.evaluate(() => { const b = document.querySelector('#rulesd .gx-drawer-body'); if (b) b.scrollTop = b.scrollHeight * 0.55; }); await shot('08-rules-cards');
  await p.evaluate(() => { const c = document.querySelector('#rulesd .cart'); c && c.click(); }); await shot('08b-card-zoom');
  await go(sc('wm-board')); await p.evaluate(() => { const c = document.querySelector('[data-gx="scored"]'); c && c.click(); }); await shot('09-scores-window');
  await go(sc('wm-board')); await p.evaluate(() => { const c = document.querySelector('[data-gx="setd"]'); c && c.click(); }); await shot('10-menu-window');
  await go(sc('wm-result')); await shot('11-result');
  await go(q); await p.waitForFunction(() => window.GXST && GXST.state, null, { timeout: 15000 }).catch(() => {});
  for (const [k, id] of [['12-lesson-a', 0], ['13-lesson-b', 5]]) { await p.evaluate(i => GXST.start(i), id); await tick(p, 1800); await shot(k); }
  await b.close();
  fs.writeFileSync(path.join(OUT, tag + '-' + W + 'x' + H + '-check.txt'), report.join('\n') + '\n');
  console.log(report.join('\n'));
  const py = `from PIL import Image,ImageDraw\nimport glob,os\nd=${JSON.stringify(DIR)}\nfs=sorted(glob.glob(d+'/*.png'))\nW,H=${W},${H}\ncols=${phone ? 7 : 4};sc=${phone ? 0.5 : 0.36}\ntw,th=int(W*sc),int(H*sc);rows=(len(fs)+cols-1)//cols\nS=Image.new('RGB',(cols*(tw+6)+6,rows*(th+22)+6),(20,19,17));dr=ImageDraw.Draw(S)\nfor i,f in enumerate(fs):\n x=6+(i%cols)*(tw+6);y=6+(i//cols)*(th+22);S.paste(Image.open(f).convert('RGB').resize((tw,th)),(x,y+18));dr.text((x,y+3),os.path.basename(f)[:-4],fill=(236,231,223))\nS.save(${JSON.stringify(path.join(OUT, tag + '-' + W + 'x' + H + '-sheet.jpg'))},quality=82)`;
  cp.execFileSync('python3', ['-c', py]);
})();
