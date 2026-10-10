// Mid-game screenshot (portrait phone): plays a job with the engine's own best moves for the human seat, stops when about 40 % of the wires are cut on my turn.
//   NODE_PATH=/opt/node-tools/node_modules node shoot.js [out.png] [W] [H] [job] [np] [seed]
const { chromium } = require('playwright'); const path = require('path');
const out = process.argv[2] || path.join(__dirname, '..', 'playtest', 'board-first-midgame-390x763.png'), W = +process.argv[3] || 390, H = +process.argv[4] || 763, job = +process.argv[5] || 9, np = +process.argv[6] || 3, seed = +process.argv[7] || 21;
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await ctx.route(/fonts\.(googleapis|gstatic)/, r => r.abort());
  const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
  await p.goto('file://' + path.join(__dirname, 'shortfuse.html')); await p.waitForTimeout(600);
  await p.evaluate(`AIDELAY=60;UI.speed=8;startJob({job:${job},np:${np},seats:['human','ai','ai','ai','ai'],lv:'normal',names:DEFNAMES.slice(),chars:[],captain:0,seed:${seed}});UI.brief=null;UI.ghost={info:1,turn:1};refresh()`);
  for (let i = 0; i < 400; i++) {
    await p.waitForTimeout(250);
    const r = await p.evaluate(`(()=>{const V=UI.V;if(!V||G.over)return 'over';const tot=G.st.reduce((a,s)=>a+s.w.length,0),cut=G.st.reduce((a,s)=>a+s.w.filter(x=>x.cut).length,0);
      if(decider()!==V.seat)return 'wait';if(cut/tot>.4&&!G.q&&!UI.sel)return 'shoot';const m=aiMove(V.seat);if(m&&!legal(m,V.seat))act(m,V.seat);return 'act'})()`);
    if (r === 'shoot' || r === 'over') break;
  }
  await p.waitForTimeout(1600); await p.screenshot({ path: out }); await b.close(); console.log('saved', out);
})();
