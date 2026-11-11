// Copy of games-src/scripts/drive-serve.js with a /drag command, for the board-first playtests of this game.
// Drive one phone-sized browser page by hand, step by step, for newcomer playtests.
// Start:  NODE_PATH=<node_modules> node games-src/scripts/drive-serve.js <port> <outdir> [WxH]
// Then:   curl 'localhost:<port>/open?url=http://127.0.0.1:<static>/thornbound-new/'
//         curl 'localhost:<port>/shot'            -> saves a PNG, prints its path and the tappable things on screen
//         curl 'localhost:<port>/tap?text=Play'   -> taps the first visible button/link whose text contains "Play"
//         curl 'localhost:<port>/tap?x=120&y=400' -> taps a point
//         curl 'localhost:<port>/drag?x1=100&y1=600&x2=200&y2=300' -> press, slide and release (drag a card)
//         curl 'localhost:<port>/wait?ms=1500'
//         curl 'localhost:<port>/quit'
// Every action waits a moment and then takes a screenshot, so the tester always sees the result.
const http = require('http'), path = require('path'), fs = require('fs');
const { chromium } = require('playwright');
const port = +process.argv[2] || 9330, out = process.argv[3] || 'drive-shots';
const [W, H] = (process.argv[4] || '390x763').split('x').map(Number);
fs.mkdirSync(out, { recursive: true });
let n = 0, page, browser;

async function visible() {
  return page.evaluate(() => {
    const els = [...document.querySelectorAll('button,a,[role=button],input,select,[onclick],.card,[data-act]')];
    const seen = new Set(), res = [];
    for (const e of els) {
      const r = e.getBoundingClientRect(), s = getComputedStyle(e);
      if (r.width < 4 || r.height < 4 || s.visibility === 'hidden' || s.display === 'none' || +s.opacity === 0) continue;
      if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) continue;
      const cx = Math.round(r.left + r.width / 2), cy = Math.round(r.top + r.height / 2);
      const top = document.elementFromPoint(cx, cy);
      if (top && top !== e && !e.contains(top) && !top.contains(e)) continue; // covered by something else
      const t = (e.innerText || e.value || e.getAttribute('aria-label') || e.title || '').replace(/\s+/g, ' ').trim().slice(0, 60);
      const key = t + cx + ',' + cy; if (seen.has(key)) continue; seen.add(key);
      res.push(`${t || '(no text)'} @ ${cx},${cy}${e.disabled ? ' [disabled]' : ''}`);
    }
    return res;
  });
}
async function shot(label) {
  await page.waitForTimeout(350);
  const f = path.join(out, String(++n).padStart(3, '0') + (label ? '-' + label.replace(/[^a-z0-9]+/gi, '_').slice(0, 30) : '') + '.png');
  await page.screenshot({ path: f });
  return f + '\nTappable:\n  ' + (await visible()).join('\n  ');
}
(async () => {
  browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
  page = await ctx.newPage();
  page.on('pageerror', e => console.log('PAGE ERROR', e.message));
  http.createServer(async (req, res) => {
    const u = new URL(req.url, 'http://x'), q = Object.fromEntries(u.searchParams);
    try {
      let msg = '';
      if (u.pathname === '/open') { await page.goto(q.url, { waitUntil: 'load' }); await page.waitForTimeout(+q.ms || 1500); msg = await shot('open'); }
      else if (u.pathname === '/shot') msg = await shot(q.label);
      else if (u.pathname === '/tap') {
        if (q.text) {
          const loc = page.locator('button,a,[role=button],[onclick],[data-act]', { hasText: q.text }).filter({ visible: true }).first();
          await loc.tap({ timeout: 4000 });
        } else await page.touchscreen.tap(+q.x, +q.y);
        await page.waitForTimeout(+q.ms || 900); msg = await shot(q.text || `${q.x}_${q.y}`);
      }
      else if (u.pathname === '/drag') {
        const [x1, y1, x2, y2] = [q.x1, q.y1, q.x2, q.y2].map(Number);
        await page.mouse.move(x1, y1); await page.mouse.down(); await page.mouse.move(x1, y1 - 20, { steps: 3 });
        await page.mouse.move(x2, y2, { steps: 12 }); await page.waitForTimeout(150); await page.mouse.up();
        await page.waitForTimeout(+q.ms || 900); msg = await shot('drag');
      }
      else if (u.pathname === '/wait') { await page.waitForTimeout(+q.ms || 1000); msg = await shot('wait'); }
      else if (u.pathname === '/quit') { res.end('bye\n'); await browser.close(); process.exit(0); }
      else msg = 'unknown command';
      res.end(msg + '\n');
    } catch (e) { res.end('ERROR ' + e.message.split('\n')[0] + '\n' + (await shot('error').catch(() => ''))); }
  }).listen(port, () => console.log('drive server on', port, W + 'x' + H, '->', out));
})();
