// HUD proof: main screen, each pop-up window, and a full computer-vs-computer game to the end screen, at 402x874 and 1366x768. Turbo speed.
//   TAG=before|after node tests/hud-shots.js  -> proof/hud-<tag>-<size>-<name>.jpg + counts of always-visible HUD items
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const gx = require('../../scripts/gx-serve.js'); const { turbo, budget } = require('../../scripts/turbo.js');
const D = path.resolve(__dirname, '..'), PROOF = path.join(D, 'proof'); fs.mkdirSync(PROOF, { recursive: true });
const TAG = process.env.TAG || 'after'; const stop = budget(150000, 'perch hud shots'); const T0 = Date.now(); const probs = []; const out = {};
async function run(b, W, H, URL) {
  const tag = W + 'x' + H, phone = W < 600, note = m => { console.log('  !', tag, m); probs.push(tag + ': ' + m); };
  const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: phone, hasTouch: true }); await turbo(ctx);
  const p = await ctx.newPage(); p.setDefaultTimeout(15000);
  p.on('pageerror', e => note('PAGE ERROR ' + e.message));
  const adv = ms => p.evaluate(m => window.__turboAdvance(m), ms);
  const shot = async n => fs.writeFileSync(path.join(PROOF, 'hud-' + TAG + '-' + tag + '-' + n + '.jpg'), await p.screenshot({ type: 'jpeg', quality: 60 }));
  await p.goto(URL); await p.waitForFunction(() => typeof startGame === 'function' && typeof PPAI !== 'undefined', null, { timeout: 15000 });
  await p.evaluate(() => { try { localStorage.setItem('pp-played', '1'); } catch (e) { } UI.fast = true; ['title','setup','result','pass'].forEach(id => { const e = document.getElementById(id); if (e) e.hidden = true; });
    startGame({ seats: [{ name: 'You', kind: 'human', face: 'you' }, { name: 'Fern', kind: 'ai', lvl: 'easy', face: 'pip' }], mode: 'vs', seed: 11, first: 0 }); });
  await p.waitForFunction(() => G && G.phase !== 'setup' || document.querySelector('#acts .a4') || !document.getElementById('pass').hidden || document.querySelector('.keep,[data-a="keepgo"]'), null, { timeout: 15000 }).catch(() => {});
  await adv(1500);
  // the starting hand screen, if shown: keep the AI's choice
  for (let i = 0; i < 3; i++) { await p.evaluate(() => { const k = document.querySelector('#keepgo'); if (k && !k.disabled) k.click(); }); await adv(600); }
  await p.waitForFunction(() => PP.sideToAct(G) === 0 && document.querySelector('#acts .a4'), null, { timeout: 15000 }).catch(() => note('no turn start'));
  await adv(800); await shot('1-main');
  // always-visible HUD items: visible buttons/text chips outside the board pieces (bar buttons, dock blocks, score chips)
  out[tag] = await p.evaluate(() => { const vis = e => { const r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4 || r.bottom < 0 || r.top > innerHeight) return false; const s = getComputedStyle(e); return s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05; };
    const sel = '.gx-bar button, .gx-bar #barstat:not(:empty), #goalbar, #opps > *, #side > * > *, #trk > *, #foodrow > *, #rate, #whatbtn, #prompt:not(:empty), #acts > *, #hpg > *, .gx-dock-head > *, #deckb, .pp-hud > *, .hudbtn';
    const els = [...new Set([...document.querySelectorAll(sel)])].filter(vis); return { n: els.length, items: els.map(e => (e.id || e.className || e.tagName).toString().slice(0, 24) + ':' + (e.textContent || '').trim().slice(0, 18)) }; });
  // each window
  const wins = await p.evaluate(() => [...document.querySelectorAll('.gx-bar button[data-gx], .gx-bar button[id], .hudbtn')].filter(e => e.getBoundingClientRect().width > 4).map(e => '#' + (e.id || '') + '|' + (e.dataset.gx || '') + '|' + (e.getAttribute('aria-label') || '')));
  for (const w of wins) { const [id, gxk, lab] = w.split('|'); if (/menu|hint/i.test(lab) && !/score/i.test(lab)) continue;
    await p.evaluate(([id, gxk]) => { const e = id.length > 1 ? document.querySelector(id) : document.querySelector('.gx-bar button[data-gx="' + gxk + '"]'); e && e.click(); }, [id, gxk]); await adv(600);
    await shot('2-win-' + (lab || id).replace(/\W+/g, '').slice(0, 14));
    await p.keyboard.press('Escape'); await adv(300); await p.evaluate(() => { try { GX.close(); } catch (e) { } try { lessonClose(); } catch (e) { } document.querySelectorAll('.ppwin:not([hidden]) .ppx').forEach(x => x.click()); }); await adv(300); }
  // the computer plays your seat too: a full game to the end screen
  await p.evaluate(() => { G.pl[0].kind = 'ai'; G.pl[0].lvl = 'normal'; UI.fast = true; try { pump(); } catch (e) { } });
  const done = await p.waitForFunction(() => G.phase === 'over', null, { timeout: 60000 }).then(() => true, () => false);
  if (!done) note('AI game did not finish (round ' + (await p.evaluate(() => G.round)) + ')');
  await p.evaluate(() => { G.pl[0].kind = 'human'; try { UI.overShown = null; gameOver(); } catch (e) { } }); await adv(1500); await shot('3-end');
  await ctx.close();
}
(async () => {
  const URL = await gx.url('perch-and-plume', { file: path.join(D, 'perch-and-plume.html') });
  const b = await chromium.launch({executablePath:'/opt/pw-browsers/chromium'}); for (const [W, H] of [[402, 874], [1366, 768]]) await run(b, W, H, URL);
  await b.close(); stop(); fs.writeFileSync(path.join(PROOF, 'hud-' + TAG + '-count.json'), JSON.stringify(out, null, 1));
  for (const k in out) console.log(k, 'always-visible HUD items:', out[k].n);
  console.log((probs.length ? 'FAIL ' : 'PASS ') + ((Date.now() - T0) / 1000).toFixed(1) + ' s' + (probs.length ? '\n' + probs.join('\n') : '')); process.exit(probs.length ? 1 : 0);
})();
