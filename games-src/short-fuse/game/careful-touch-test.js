// Careful-newcomer touch test: jobs 3 and 4 (3 crew, Normal, Hints on) by touch only, reading only the screen.
// Policy: tap a glowing solo cut if there is one; otherwise tap each of my numbers in turn and read the crew wires
// (dim = can't be it, green ring = must be it, "!" = might be red), then point at a sure wire, else at a fitting wire with
// no "!" among the fewest fitting wires (random tie), a "!" wire only if nothing else fits (a second tap passes the check).
// Prints win rate per job; target is about half.   N=4 node careful-touch-test.js   (N attempts per job per size)
const { chromium } = require('playwright');
const path = require('path');
const gx = require('../../scripts/gx-serve.js');
const FILE = path.resolve(__dirname, 'shortfuse.html');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const N = +(process.env.N || 2), JOBS = (process.env.JOBS || '3,4').split(',').map(Number);
const CENTER = `e=>{e.scrollIntoView({block:'nearest'});const r=e.getBoundingClientRect();if(r.width<3||r.bottom>innerHeight||r.top<0)return null;return {x:r.left+r.width/2,y:r.top+r.height/2}}`;
const PICK = `(() => {const C=${CENTER};
  for (const sel of ['#cover button.go', '#coach button', '#tb .chip.glow', '#tb .tile.glow.g-opt', '#tb .plate.glow', '#tb .tile.glow.g-tgt', '#tb .tile.glow', '#tb .eqk.glow']) {
    const els=[...document.querySelectorAll(sel)].sort(()=>Math.random()-.5);for(const e of els){const p=C(e);if(p)return p}}return null})()`;
(async () => {
  const URL = await gx.url('short-fuse', { file: FILE });
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const tally = {}; let errsAll = 0, waits = [];
  for (const [w, h] of [[390, 844], [375, 667]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
    await ctx.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
    const page = await ctx.newPage(); const errs = []; page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
    await page.goto(URL); await sleep(900);
    const tap = async p => { await page.touchscreen.tap(p.x, p.y); await sleep(160); };
    for (const job of JOBS) for (let a = 0; a < N; a++) {
      const seed = 9000 + job * 37 + a * 1013 + w + (+process.env.OFF || 0);
      await page.evaluate(`try{GXH.setEnabled(true)}catch(e){};UI.speed=6;startJob({job:${job},np:3,seats:['human','ai','ai'],lv:'normal',names:DEFNAMES.slice(),chars:[],captain:${a % 3},seed:${seed}});refresh()`);
      await sleep(500); const t0 = Date.now(); let lastMine = 0;
      while (!(await page.evaluate('!!G.over'))) {
        if (Date.now() - t0 > 240000) { console.log('STUCK job', job); break; }
        const st = await page.evaluate(`(()=>{const V=UI.V;const s=decider();return {mine:!!(V&&V.seat>=0&&V.legal&&s===V.seat&&!(V.q&&V.q.who===V.seat)&&!UI.brief),q:!!(V&&V.q&&V.q.who===V.seat)}})()`);
        if (st.mine && !lastMine) { lastMine = 1; }
        if (!st.mine) { if (lastMine) { lastMine = 0; waits.push(Date.now()); } const p = await page.evaluate(PICK); if (p && (st.q || await page.evaluate(`!!document.querySelector('#cover button.go,#coach button,#tb .glow')`))) await tap(p); else await sleep(250); continue; }
        const solo = await page.evaluate(`(()=>{const C=${CENTER};const e=document.querySelector('#mine .tile.glow.g-solo');return e?C(e):null})()`);
        if (solo) { await tap(solo); continue; }
        const nums = await page.evaluate(`[...new Set([...document.querySelectorAll('#mine .tile.glow.g-val')].map(e=>e.querySelector('.f').textContent))]`);
        let best = null;
        for (const n of nums) {
          const p = await page.evaluate(`(()=>{const C=${CENTER};const e=[...document.querySelectorAll('#mine .tile.glow.g-val')].find(e=>e.querySelector('.f').textContent===${JSON.stringify(n)});return e?C(e):null})()`);
          if (!p) continue; await tap(p);
          const r = await page.evaluate(`(()=>{const sz=e=>{const l=e.querySelector('.clv');if(!l)return 9;const t=l.textContent;if(t.includes('-')){const [a,b]=t.split('-').map(Number);return b-a+1}return t.split('\u00b7').length};
            const t=[...document.querySelectorAll('#crew .tile.glow.g-tgt')].filter(e=>!e.classList.contains('cl-no'));return t.map(e=>({u:e.dataset.u,sure:e.classList.contains('cl-sure'),red:!!e.querySelector('.clm'),n:sz(e)}))})()`);
          let opt = null; for (const c of r) { const sc = c.sure ? 0 : c.n + (c.red ? 50 : 0) + Math.random() * .5; if (!opt || sc < opt.s) opt = { n, u: c.u, s: sc }; }
          if (opt && (!best || opt.s < best.s || (opt.s === best.s && Math.random() < .5))) best = opt;
          if (best && best.s === 0) break;
        }
        if (!best) { const p = await page.evaluate(PICK); if (p) await tap(p); else await sleep(250); continue; }
        const cur = await page.evaluate(`UI.sel&&UI.sel.v!=null?String(UI.sel.v==='Y'?'Y':UI.sel.v):''`);
        if (cur !== best.n) { const p = await page.evaluate(`(()=>{const C=${CENTER};const e=[...document.querySelectorAll('#mine .tile.glow.g-val')].find(e=>e.querySelector('.f').textContent===${JSON.stringify(best.n)});return e?C(e):null})()`); if (p) await tap(p); }
        const q = await page.evaluate(`(()=>{const C=${CENTER};const e=document.querySelector('#crew .tile[data-u="${best.u}"]');return e?C(e):null})()`);
        if (process.env.LOG) console.log('  pick', best.n, 'score', best.s.toFixed(1), 'nums', nums.join(','));
        if (q) { await tap(q); if (await page.evaluate(`!!(UI.sel&&UI.sel.v!=null)`)) await tap(q); }
      }
      if (process.env.LOG) console.log(await page.evaluate(() => G.log.slice().reverse().map(e => e.t).join(String.fromCharCode(10))));
      const res = await page.evaluate('G.over?(G.over.win?"won":(G.over.why||G.over.reason||"lost")):"-"');
      const k = 'job ' + job; tally[k] = tally[k] || [0, 0]; tally[k][1]++; if (/won/.test(res)) tally[k][0]++;
      console.log(w + 'x' + h + ' job ' + job + ' #' + (a + 1) + ': ' + String(res).slice(0, 60) + ' (' + ((Date.now() - t0) / 1000).toFixed(0) + ' s)');
    }
    if (errs.length) { errsAll += errs.length; console.log('page errors: ' + [...new Set(errs)].slice(0, 3).join(' | ')); }
    await ctx.close();
  }
  await browser.close();
  let W = 0, T = 0; for (const k in tally) { W += tally[k][0]; T += tally[k][1]; console.log(k + ': won ' + tally[k][0] + ' of ' + tally[k][1]); }
  console.log('CAREFUL-TOUCH jobs ' + JOBS.join('+') + ': won ' + W + ' of ' + T + (errsAll ? ', ' + errsAll + ' page errors' : ', 0 errors'));
  process.exit(errsAll ? 1 : 0);
})();
