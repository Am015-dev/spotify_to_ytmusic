// Screenshots of the painted extras: title, mid-game, story map, end screens, music panel.
//   (serve a folder with index.html + media/ + music/ on :8765)  NODE_PATH=/opt/node-tools/node_modules node shots-extras.js [outdir] [url]
const { chromium } = require('playwright'); const path = require('path');
const OUT = process.argv[2] || path.join(__dirname, '..', 'playtest'), URL = process.argv[3] || 'http://localhost:8765/index.html';
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
  for (const [W, H, tag, mob] of [[390, 763, '390x763', true], [1280, 800, '1280x800', false]]) {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1, isMobile: mob, hasTouch: mob });
    await ctx.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
    const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('requestfailed', r => errs.push('REQFAIL ' + r.url().slice(-40)));
    await p.addInitScript(() => { try { localStorage.setItem('sf_played', '1'); localStorage.setItem('gxt-short-fuse', JSON.stringify({ done: 1, open: 0, step: 0 })) } catch (e) { } });
    await p.goto(URL); await p.waitForTimeout(1200);
    const shot = async n => { await p.waitForTimeout(500); await p.screenshot({ path: path.join(OUT, n + '-' + tag + '.png') }) };
    await shot('title');
    await p.evaluate(`storyOpen()`); await shot('story');
    await p.evaluate(`try{GXC.close()}catch(e){}`);
    await p.evaluate(`AIDELAY=60;UI.speed=8;startJob({job:12,np:4,seats:['human','ai','ai','ai'],lv:'normal',names:DEFNAMES.slice(),chars:[],captain:0,seed:5});UI.brief=null;`);
    for (let i = 0; i < 300; i++) { await p.waitForTimeout(200); const r = await p.evaluate(`(()=>{const V=UI.V;if(!V||G.over)return 'over';const tot=G.st.reduce((a,s)=>a+s.w.length,0),cut=G.st.reduce((a,s)=>a+s.w.filter(x=>x.cut).length,0);if(decider()!==V.seat)return 'wait';if(cut/tot>.35&&!G.q&&!UI.sel)return 'shoot';const m=aiMove(V.seat);if(m&&!legal(m,V.seat))act(m,V.seat);return 'act'})()`); if (r === 'shoot' || r === 'over') break; }
    await p.evaluate(`document.querySelectorAll('.gxh-ok,.gxh-skip').forEach(b=>b.click())`).catch(() => { }); await shot('game');
    await p.evaluate(`GX.show('geard')`); await shot('gear'); await p.evaluate(`GX.close()`);
    await p.evaluate(`renderMusic();GX.show('musicd')`); await shot('music'); await p.evaluate(`GX.close()`);
    for (const w of [true, false]) {
      await p.evaluate(`G.over=${w ? '{win:true}' : "{win:false,why:'The fuse ran out'}"};UI.overShown=0;refresh();`);
      await p.waitForTimeout(2600); await shot('end-' + (w ? 'win' : 'lose'));
    }
    console.log(tag, 'errors:', errs.length ? errs.join(' | ') : 'none'); await ctx.close();
  }
  await b.close();
})();
