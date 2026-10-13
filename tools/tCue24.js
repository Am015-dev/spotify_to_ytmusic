// tCue24.js: turn warning time (drive24). A human-like bot (real keys, 0.15 s lag) drives the GPS route the game shows (QV.nav, the
// minimap line) to 10 far targets (env N), and logs the turn-by-turn cue (D24_cue: arrow + distance) every frame. For every turn it drives
// through: warning time = when the cue for that turn first appeared → when the car reached the turn. Also the cue text samples.
// usage: node tools/tCue24.js <url> <out.json>   env CITY=fra|ath N=10 V=80 (cruise km/h)
const fs=require('fs');const path=require('path');const{chromium,boot}=require('./d24lib');
const URL=process.argv[2],OUT=process.argv[3]||'qa24/cue.json',CITY=process.env.CITY||'fra',NR=+(process.env.N||10),VK=+(process.env.V||80);
const ad=a=>Math.atan2(Math.sin(a),Math.cos(a));
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const B0=b.newContext.bind(b);
 b.newContext=async o=>{const c=await B0(o);await c.route('**/tune.json',r=>r.fulfill({contentType:'application/json',body:'{"v":99,"values":{"TUNE.traf":0.1}}'}));return c};
 const{p,errs,shot}=await boot(b,{city:CITY,url:URL,phone:false});await p.evaluate(()=>__g9ev(`try{if(RO.ch)chAbort()}catch(e){}try{M1.auto=0}catch(e){}`));
 const KD={};const key=async(k,on)=>{if(!!KD[k]===on)return;KD[k]=on;on?await p.keyboard.down(k):await p.keyboard.up(k)};
 const res={city:CITY,routes:[],warn:[],samples:[]};const rng=(s=>()=>(s=(s*16807)%2147483647)/2147483647)(99);
 for(let r=0;r<NR;r++){
  // a far target on the main road graph, 700-1100 m away from where the car is
  const tgt=await p.evaluate(sd=>__g9ev(`(()=>{const G=qvGraph(),rng=mul(${sd});for(let t=0;t<300;t++){const i=G.list[Math.floor(rng()*G.list.length)],x=G.X[i],z=G.Z[i],d=Math.hypot(x-RO.x,z-RO.z);if(d>700&&d<1100&&!roamHit(x,z,3))return{x,z}}return null})()`),Math.floor(rng()*1e6));
  if(!tgt)continue;await p.evaluate(t=>__g9ev(`RO.wp={x:${t.x},z:${t.z},name:'T'};QV.nav=null`),tgt);
  const T={};let f=0,st=0,bi=0;const hist=[];const maxF=60*150;
  while(f<maxF){const s=await p.evaluate(()=>__g9ev(`(()=>{const N=QV.nav;let c=null;try{c=D24_cue()}catch(e){}let tp=null;if(c&&c.t){const a=qvAt(N.P,N.C,c.t.s);tp=[a.x,a.z]}
    return{x:RO.x,z:RO.z,h:RO.h,v:RO.v,P:N&&N.P.length>1?N.P:null,at:N&&N.at,cue:c&&{txt:c.txt,ang:+c.ang.toFixed(2),soon:c.soon,tp},rem:N&&N.rem}})()`));
   hist.push(s);if(!s.P){await p.evaluate(()=>__tick(6));f+=6;continue}if(s.rem!=null&&s.rem<25)break;
   if(s.cue&&s.cue.tp){const k=Object.keys(T).find(q=>Math.hypot(T[q].x-s.cue.tp[0],T[q].z-s.cue.tp[1])<20);if(!k)T[f]={x:s.cue.tp[0],z:s.cue.tp[1],f0:f,txt:s.cue.txt,v0:s.v};}
   for(const k in T){const q=T[k];if(q.f1==null&&Math.hypot(q.x-s.x,q.z-s.z)<12)q.f1=f}
   if(f%120===0&&res.samples.length<40&&s.cue)res.samples.push(s.cue.txt);
   const o=hist[Math.max(0,hist.length-4)],P=s.P;let bd=1e9;bi=0;for(let k=0;k<P.length-1;k++){const a=P[k],c=P[k+1],dx=c[0]-a[0],dz=c[1]-a[1],L2=dx*dx+dz*dz||1,u=Math.max(0,Math.min(1,((o.x-a[0])*dx+(o.z-a[1])*dz)/L2)),d=Math.hypot(a[0]+dx*u-o.x,a[1]+dz*u-o.z);if(d<bd){bd=d;bi=k}}
   // look-ahead point on the route
   const v=Math.max(0,o.v),Ld=10+.7*v;let k=bi,acc=0,tx=P[bi+1][0],tz=P[bi+1][1];while(k<P.length-1&&acc<Ld){acc+=Math.hypot(P[k+1][0]-P[k][0],P[k+1][1]-P[k][1]);k++;tx=P[k][0];tz=P[k][1]}
   const e=ad(Math.atan2(tx-o.x,tz-o.z)-o.h);if(st===0&&Math.abs(e)>.07)st=e>0?-1:1;else if(st!==0&&(Math.abs(e)<.026||Math.sign(e)===st))st=0;
   let vd=VK/3.6;if(s.cue&&s.cue.tp&&Math.abs(s.cue.ang)>.5){const d=Math.hypot(s.cue.tp[0]-o.x,s.cue.tp[1]-o.z);if(d<25+1.2*v)vd=Math.min(vd,Math.abs(s.cue.ang)>1.3?50/3.6:65/3.6)}
   await key('ArrowUp',v<vd-.5);await key('ArrowDown',v>vd+2.5);await key('ArrowLeft',st<0);await key('ArrowRight',st>0);await p.evaluate(()=>__tick(3));f+=3}
  for(const k of['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'])await key(k,false);
  const W=Object.values(T).filter(q=>q.f1!=null).map(q=>({warn:+((q.f1-q.f0)/60).toFixed(2),txt:q.txt,kmh:Math.round(q.v0*3.6)}));res.warn.push(...W);res.routes.push({r,sec:+(f/60).toFixed(1),turns:W.length,reached:hist.length&&hist[hist.length-1].rem<25});
  if(r===0)await shot(OUT.replace('.json','_cue.jpg'));console.log('route',r,JSON.stringify(res.routes[res.routes.length-1]),JSON.stringify(W))}
 const w=res.warn.map(q=>q.warn).sort((a,b)=>a-b);res.sum={turns:w.length,minWarn:w[0],p10:w[Math.floor(w.length*.1)],median:w[w.length>>1],under3s:w.filter(x=>x<3).length,errors:errs.length};
 fs.mkdirSync(path.dirname(OUT),{recursive:true});fs.writeFileSync(OUT,JSON.stringify(res,null,1));console.log('SUM',JSON.stringify(res.sum),'samples',JSON.stringify(res.samples.slice(0,12)));if(errs.length)console.log(errs.slice(0,5));await b.close()})();
