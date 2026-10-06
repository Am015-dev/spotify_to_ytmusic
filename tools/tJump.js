// tJump.js — race jump clearance with real keyboard input. Rookie class, time-trial (no AI/traffic/items), no boost key.
// For each jump: car placed at rest RUN m before the gap in lane x=LANE (off the centre boost pad), then hold ArrowUp and steer with
// ArrowLeft/Right toward the lane. Logs launch speed vs Rookie top speed and landing distance vs the gap end (margin) or WIPEOUT.
// usage: node tools/tJump.js <url> [tracks comma] ; env RUN=900 LANE=7
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const URL=process.argv[2],TR=(process.argv[3]||'grand,fraport,sky,nord,akro,synt,kifi,pana').split(','),RUN=+(process.env.RUN||900),LANE=+(process.env.LANE||7);
const INIT=`(()=>{const q=[];let t=0;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){setTimeout(()=>{throw e})}}}return t};
 window.__iv=setInterval(()=>{if(window.__auto)window.__tick(1)},16);window.__auto=true})();`;
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:852,height:393}});const p=await ctx.newPage();p.setDefaultTimeout(600000);
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));
await p.addInitScript(INIT);await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{window.__auto=false;if(window.__dbg){__dbg.composer.render=()=>{}}});
const tick=n=>p.evaluate(n=>__tick(n),n);const rows=[];
for(const id of TR){
  const info=await p.evaluate(([id])=>{const M=__mho;M.setOpt('tab','tt');M.setOpt('cls','rookie');M.setOpt('track',id);M.setOpt('traffic',false);M.startRace();return{st:M.state,cls:M.cls().id,top:M.pl&&M.pl.stats.top,top0:M.pl&&M.pl.stats.top0,J:M.TD.jumps.map(j=>({id:j.id,kind:j.kind,s0:j.s0,s1:j.s1,g:j.g})),L:M.TD.L}},[id]);
  for(let i=0;i<400;i++){await tick(10);if(await p.evaluate(()=>__mho.state==='race'))break}
  for(const J of info.J){
    await p.evaluate(([s,x])=>{const P=__mho.pl;P.dist=s;P.v=0;P.x=x;P.air=null;P.lastJump='';P.bm=0;P.nitro=0;P.dead=0},[J.s0-RUN,LANE]);
    await p.keyboard.down('ArrowUp');let st=null,vL=null,vmax=0,res=null,side=0;
    for(let f=0;f<3600;f+=3){
      const o=await p.evaluate(()=>{const P=__mho.pl;return{d:P.dist,x:P.x,lv:P.latV||0,v:P.v,air:P.air?{y:+P.air.y.toFixed(1),fall:P.air.fall,cl:P.air.cleared}:null,dead:P.dead,nit:!!P.nitro,msg:(document.querySelector('#msg')||{}).textContent||''}});
      vmax=Math.max(vmax,o.v);const L=info.L,m=((o.d%L)+L)%L;
      if(o.air&&!st){st={d:o.d};vL=o.v}
      if(o.dead>0){res={wipe:true,d:m,msg:o.msg};break}
      if(st&&!o.air){res={land:m,margin:+(m-J.s1).toFixed(1)};break}
      const e=LANE-o.x,dl=Math.max(-3,Math.min(3,e*.5))-o.lv;const want=o.air||Math.abs(dl)<.6?0:Math.sign(dl);
      if(want!==side){if(side)await p.keyboard.up(side>0?'ArrowRight':'ArrowLeft');if(want)await p.keyboard.down(want>0?'ArrowRight':'ArrowLeft');side=want}
      await tick(3)}
    if(side)await p.keyboard.up(side>0?'ArrowRight':'ArrowLeft');await p.keyboard.up('ArrowUp');
    const xs=await p.evaluate(()=>__mho.pl.x);
    const r={track:id,jump:J.id,kind:J.kind,gap:+(J.s1-J.s0).toFixed(0),top:+(info.top*3.6).toFixed(0),vLaunch:vL&&+(vL*3.6).toFixed(0),vmax:+(vmax*3.6).toFixed(0),...res,xEnd:+xs.toFixed(1)};
    rows.push(r);console.log(JSON.stringify(r))}
  await p.evaluate(()=>{try{__mho.quit&&__mho.quit()}catch(e){}})}
console.log('ERRS',JSON.stringify(errs.slice(0,5)));await b.close()})();
