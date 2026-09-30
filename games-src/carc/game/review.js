// confusion review: one full game as a first-time player (default setup, guide on), real taps on the 3D map, screenshots of each new situation
const {chromium}=require(process.env.PW);const W=+process.argv[2]||1366,H=+process.argv[3]||768;const TAG=process.argv[4]||'rv';
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const p=await b.newPage({viewport:{width:W,height:H}});p.setDefaultTimeout(150000);
  const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/CERT|fonts|ERR_/.test(m.text())&&errs.push(m.text()));
  await p.goto('file://'+__dirname+'/rampart.html');await p.waitForTimeout(900);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}setSeed(21);AIDELAY=30;UI.guide=true});
  let n=0;const shot=async name=>{n++;await p.screenshot({path:`shots/${TAG}_${String(n).padStart(2,'0')}_${name}.png`})};
  await shot('start');await p.click('[data-ui=start]');await p.waitForTimeout(1200);await shot('story');await p.click('[data-ui=storyok]');await p.waitForTimeout(800);
  const seen=new Set();let turns=0;const t0=Date.now();
  while(Date.now()-t0<270000){const s=await p.evaluate(()=>({over:!!G.over,hp:!!me(),step:G.step,turn:G.turn,cells:UI.cells.slice(),ghost:UI.ghost&&UI.ghost.k,k:G.cur&&G.cur.k,spots:UI.spotOpts.map(o=>o.l),story:G.story.length,left:tilesLeft(),scored:G.pl.map(p=>p.score).join('/'),river:!!G.rv,
      opts:[...document.querySelectorAll('#dockbody button.opt')].map(b=>b.textContent.slice(0,40))}));
    if(s.over)break;
    if(s.story&&!seen.has('story'+s.story)){seen.add('story'+s.story);await shot('storybeat')}
    if(!s.hp){await p.waitForTimeout(150);continue}
    if(s.step==='place'&&!s.ghost){turns++;const first=!seen.has('place');if(first||(!s.river&&!seen.has('place-land'))){seen.add('place');if(!s.river)seen.add('place-land');await p.waitForTimeout(900);await shot(s.river?'place-river':'place-land')}
      if(turns%4===2){await p.click('#dockbody [data-a=adv]');await p.waitForTimeout(900);if(!seen.has('advice')){seen.add('advice');await shot('advice')}await p.click('#dockbody [data-ui=apply]');await p.waitForTimeout(700);continue}
      const cell=s.cells[(turns*7)%s.cells.length];const pt=await p.evaluate(k=>{const [x,y]=unkey(k);const v=screenOf(cellWorld(x,y).setY(TH));const R=V3.r.domElement.getBoundingClientRect();return {x:R.left+v.x,y:R.top+v.y,in:v.in&&v.x>10&&v.y>10&&v.x<R.width-10&&v.y<R.height-10}},cell);
      if(!pt.in){seen.add('offscreen-cell');await p.evaluate(()=>fitAll(true));await p.waitForTimeout(600);continue}
      await p.mouse.click(pt.x,pt.y);await p.waitForTimeout(500);continue}
    if(s.step==='place'&&s.ghost){if(!seen.has('ghost')){seen.add('ghost');await shot('ghost')}await p.click('#dockbody [data-ui=confirm]');await p.waitForTimeout(600);continue}
    if(s.step==='fig'){const farm=s.opts.some(o=>/Farmer/.test(o));if(!seen.has('fig')){seen.add('fig');await p.waitForTimeout(500);await shot('fig')}else if(farm&&!seen.has('farm')){seen.add('farm');await shot('fig-farmer')}
      const bs=await p.$$('#dockbody button.opt');const pick=bs.length&&turns%3!==0?bs[0]:await p.$('#dockbody button.go[data-mv]');await pick.click();await p.waitForTimeout(700);
      const sc=await p.evaluate(()=>G.pl[0].sc.road+G.pl[0].sc.town+G.pl[0].sc.priory);if(sc>0&&!seen.has('scored')){seen.add('scored');await p.waitForTimeout(300);await shot('myscore')}
      if(!seen.has('recap')){await p.waitForTimeout(1500);if(await p.evaluate(()=>!!document.querySelector('#dockbody .recap'))){seen.add('recap');await shot('recap')}}continue}
    await p.waitForTimeout(150)}
  await p.waitForTimeout(1500);await shot('end');await p.evaluate(()=>fitAll(true));await p.waitForTimeout(1500);await shot('end-fit');
  await p.click('.gx-bar [data-gx="plrd"]');await p.waitForTimeout(900);await shot('players');
  console.log(TAG,'over',await p.evaluate(()=>!!G.over&&G.winText),'human turns',turns,'seen',[...seen].join(','),'errors',errs.slice(0,3));await b.close()})()
