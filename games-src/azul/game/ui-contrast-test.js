// Contrast over background images (axe reports those as "incomplete"): for every visible text element in the top bar, the open panels and the start card,
// hide its text, sample the pixels behind its box in memory (never saved) and fail below 4.5:1 (3:1 from 24 px).   node ui-contrast-test.js <base-url> [sizes]
const { chromium } = (() => { try { return require('playwright'); } catch (e) { return require('/home/user/spotify_to_ytmusic/games-src/node_modules/@playwright/test'); } })();
const BASE = process.argv[2], SIZES = (process.argv[3] || '1366x768,390x763').split(',').map(s => s.split('x').map(Number));
const lum = (r, g, b) => { const f = v => (v /= 255) <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
const ratio = (a, b) => (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
(async () => {
  const br = await chromium.launch({ args: ['--no-sandbox'] }); const bad = [];
  for (const [w, h] of SIZES) {
    const ctx = await br.newContext({ viewport: { width: w, height: h }, serviceWorkers: 'block' }), pg = await ctx.newPage();
    await pg.goto(BASE + '/sunglaze/?scn=menu'); await pg.waitForTimeout(3000);
    for (const open of ['title', 'menud', 'logd', 'rulesd']) {
      await pg.evaluate(o => { try { GX.close(); } catch (e) { } if (o !== 'title') GX.show(o); }, open); await pg.waitForTimeout(500);
      const els = await pg.evaluate(() => { const out = []; document.querySelectorAll('.gx-bar *, .gx-drawer.on *, #modal .mbox *').forEach((e, i) => { if (e.children.length || !/\S/.test(e.textContent)) return; const r = e.getBoundingClientRect(), cs = getComputedStyle(e); if (r.width < 4 || r.height < 4 || cs.visibility === 'hidden' || cs.display === 'none' || r.bottom < 0 || r.top > innerHeight) return; e.setAttribute('data-uc', i); out.push({ i, t: e.textContent.trim().slice(0, 24), c: cs.color, fs: parseFloat(cs.fontSize), fw: +cs.fontWeight, box: [r.left, r.top, r.width, r.height] }); }); return out; });
      for (const el of els) {
        const clip = { x: Math.max(0, el.box[0]), y: Math.max(0, el.box[1]), width: Math.min(w - el.box[0], el.box[2]), height: Math.min(h - el.box[1], el.box[3]) }; if (clip.width < 2 || clip.height < 2) continue;
        await pg.evaluate(i => { const e = document.querySelector('[data-uc="' + i + '"]'); if (!e) return; e.dataset.oc = e.style.cssText; e.style.setProperty('color', 'transparent', 'important'); e.style.setProperty('-webkit-text-fill-color', 'transparent', 'important'); e.style.setProperty('text-shadow', 'none', 'important'); e.style.setProperty('background-clip', 'border-box', 'important'); }, el.i);
        const b64 = (await pg.screenshot({ clip })).toString('base64'); await pg.evaluate(i => { const e = document.querySelector('[data-uc="' + i + '"]'); if (e && e.dataset.oc != null) e.style.cssText = e.dataset.oc; }, el.i);
        const px = await pg.evaluate(async b => { const im = await createImageBitmap(await (await fetch('data:image/png;base64,' + b)).blob()); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); return Array.from(x.getImageData(0, 0, c.width, c.height).data); }, b64);
        const png = { data: px };
        const m = el.c.match(/[\d.]+/g).map(Number); if (m.length > 3 && m[3] === 0) continue;   // transparent text colour (gradient text): judged by the next rule
        const tl = lum(m[0], m[1], m[2]); let worst = 99;
        for (let k = 0; k < png.data.length; k += 4 * 3) worst = Math.min(worst, ratio(tl, lum(png.data[k], png.data[k + 1], png.data[k + 2])));
        const big = el.fs >= 24 || (el.fs >= 18.66 && el.fw >= 700), need = big ? 3 : 4.5;
        if (worst < need) bad.push(`${w}x${h} [${open}] "${el.t}" ${worst.toFixed(2)}:1 < ${need}`);
      }
    }
    await ctx.close();
  }
  await br.close(); console.log(bad.length ? 'CONTRAST FAIL\n' + bad.slice(0, 40).join('\n') : 'contrast ok'); process.exit(bad.length ? 1 : 0);
})();
