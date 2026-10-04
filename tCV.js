// tCV: traffic signals + rules and city variety. usage: node tCV.js [rules|perf|all]  (perf needs cvbase_dbg.html = base build, see REPORT.md)
// rules: signals > 0 in Frankfurt and every Athens district; an AI car stops on red within 3 m of the line, a queue forms, both go on green;
//        no AI collisions at signalled junctions over 3 sim-minutes; pedestrians enter a signalled junction only on walk; red-light run
//        through real keys gives the DAREDEVIL pop (+10 studs); neighbouring buildings differ >= 90 %.
// perf:  renderer.info draw calls at 6 spots per city, base vs patched (<= +10 %), before/after screenshots at 8 spots.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const F=require('./fast.js');const fs=require('fs');
const MODE=process.argv[2]||'all';let fails=0;const ok=(c,m,i)=>{console.log((c?'PASS ':'FAIL ')+m+(i!==undefined?' · '+JSON.stringify(i):''));if(!c)fails++};
async function load(b,c,d,page='local_dbg.html',vp={width:960,height:540}){const p=await (await b.newContext({viewport:vp})).newPage();p.setDefaultTimeout(900000);p.errs=[];p.on('pageerror',e=>p.errs.push(e.message.slice(0,200)));
 await p.goto('http://127.0.0.1:8766/'+page);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');
 await p.evaluate(([c,d])=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_city@1',c);if(d)localStorage.setItem('mho_athd@1',d);const k=c==='ath'?'.ath':'';localStorage.setItem('mho_roam'+k+'@1','{"tut":1,"otg":{}}');if(c==='ath')localStorage.setItem('mho_story.ath@1','{"seen":1}')},[c,d]);
 await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');await F.on(p);await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam');
 await p.evaluate(()=>{try{__mho.storyClose()}catch(e){}try{window.__m1&&__m1.skip&&__m1.skip()}catch(e){}__mho.roamSim(30)});return p}
async function rules(b){
 for(const [c,d] of [['fra',null],['ath','A'],['ath','B'],['ath','C'],['ath','D']].filter(([c,d])=>!process.env.CV_D||process.env.CV_D.split(',').includes(c+(d||'')))){const p=await load(b,c,d);const nm=c+(d||'');
  const I=await p.evaluate(()=>({...__cv.info(),nbr:__cv.nbr()}));ok(I.sig>0&&I.heads>=I.sig*2,`${nm}: signalled junctions with heads`,{sig:I.sig,heads:I.heads,yield:I.yl,edges:I.seg});
  ok(I.nbr.n>200&&I.nbr.frac>=.9,`${nm}: neighbouring buildings differ`,I.nbr);ok(!!I.st&&(I.st.median>0||I.st.fountains>0)&&I.st.parks>0,`${nm}: street types (medians, tiled ped streets, fountains, parks)`,I.st);
  if(c==='fra'||d==='A'){
   // 1 · stop on red within 3 m of the line, a queue forms, both go on green
   const r=await p.evaluate(()=>{const GT=(__mho.athGates&&__mho.athGates())||[],far=J=>!GT.some(g=>Math.hypot(g.x-J.x,g.z-J.z)<350);const M=__mho,C=__cv.CV,K=C.K,cars=window.__dbg&&null;const HC=M.cars?null:null;const S=C.sig,res=[];
    const hub=()=>window.__cvHub;for(let si=0;si<S.length&&res.length<6&&res.filter(x=>x.go!=null).length<3;si++){const J=S[si];if(!far(J)||S.some(o=>o!==J&&Math.hypot(o.x-J.x,o.z-J.z)<J.R0+o.R0+50))continue;let k=-1,pre=null;
     for(let kk=0;kk<J.ap.length&&!pre;kk++)for(const[key,v]of C.seg){if(v.J!==J||v.k!==kk||!v.pre)continue;const pn=Math.floor(key/K),i=key%K,e=J.ap[kk].e.find(e=>e[0]===i);if(e){k=kk;pre=[pn,i,e[1]];break}}
     if(!pre)continue;const ap=J.ap[k];let side=M.rsnap(J.x+ap.dz*120,J.z-ap.dx*120,300);if(!side||Math.hypot(side[0]-J.x,side[1]-J.z)>220)side=[J.x+ap.dz*45,J.z-ap.dx*45];M.warp(side[0],side[1],0);M.roamSim(3);
     let g=0;while(__cv.st(J,k)==='r'&&g++<9000)M.roamSim(1);g=0;while(__cv.st(J,k)!=='r'&&g++<9000)M.roamSim(1);
     const HUBC=window.__cvCars();const N=window.__cvNodes(),A=N[pre[0]],B=N[pre[1]],L=Math.hypot(B.x-A.x,B.z-A.z);if(L<16)continue;
     const pick=HUBC.filter(c=>!c.tr&&!c.route&&!(c.dead>0)).sort((a,b)=>Math.hypot(a.x-J.x,a.z-J.z)-Math.hypot(b.x-J.x,b.z-J.z)).slice(-2);if(pick.length<2)break;const[c1,c2]=pick;for(const o of HUBC)if(o!==c1&&o!==c2&&!(o.dead>0)&&Math.hypot(o.x-J.x,o.z-J.z)<J.R0+70)o.dead=.5;
     const put=(c,t)=>{c._thru=0;c.a=pre[0];c.b=pre[1];c.t=t;c.v=14;c.cv=12;c.route=[pre[2]];c.CVr=1;c.CVp=1;c.CVgo=null;c.x=A.x+(B.x-A.x)*t;c.z=A.z+(B.z-A.z)*t};put(c1,Math.min(.85,.5+6/L));put(c2,Math.max(0,.5+6/L-11/L));
     const dl=c=>(J.x-c.x)*ap.dx+(J.z-c.z)*ap.dz-J.R0;let stop=null,q=null,t=0,go=null,hold=0;
     for(t=0;t<9000;t++){M.roamSim(1);const s=__cv.st(J,k);if(s==='r'){if(!stop&&c1.cv<.15&&c1.b!==pre[1]||!stop&&c1.cv<.15&&dl(c1)<20)stop={front:+(dl(c1)-2.9).toFixed(2),t:+(t/60).toFixed(1)};if(stop&&c1.cv<.15)hold++;if(stop&&!q&&c2.cv<.15&&Math.hypot(c2.x-c1.x,c2.z-c1.z)<14)q={gap:+Math.hypot(c2.x-c1.x,c2.z-c1.z).toFixed(1)}}
      if(stop&&s==='g'&&!go)go={t};if(go){for(const c of[c1,c2])if(Math.hypot(c.x-J.x,c.z-J.z)<J.R0)c._thru=1;if(c1._thru&&c2._thru){go.both=+((t-go.t)/60).toFixed(1);break}}if(go&&t-go.t>J.C*60)break}
     res.push({si,k,stop,q,go:go&&go.both,hold:+(hold/60).toFixed(1),ranRed:stop?0:1})}return res});
   const good=r.filter(x=>x.stop&&x.stop.front>=-.5&&x.stop.front<=3&&x.q&&x.go!=null);ok(good.length>=2,`${nm}: AI car stops on red within 3 m of the line, queue forms, both go on green`,r);
   // 2 · 3 sim-minutes near signalled junctions: no crossing collisions inside the junction, pedestrians enter only on walk
   const z=await p.evaluate(()=>{const M=__mho,C=__cv.CV,S=C.sig;const GT=(M.athGates&&M.athGates())||[];const sp=S.filter(J=>!GT.some(g=>Math.hypot(g.x-J.x,g.z-J.z)<350)).sort((a,b)=>b.ap.length-a.ap.length).slice(0,3);let col=0,pass=0,stops=0,frames=0;const log=[];const p0=[C.pedOK,C.pedBad],seen=new Set(),inside=new Map();
    for(const J of sp){const n=M.rsnap(J.x+60,J.z+60,200);M.warp(n[0],n[1],0);M.roamSim(3);
     for(let f=0;f<60*60;f++){M.RO.v=0;M.roamSim(1);if(f%1200===600){const P=window.__cvPeds(),N=window.__cvNodes();let q=0;for(const ap of J.ap)for(const e of ap.e){const p=P[(f/7+q++*13)%P.length|0];if(!p)continue;p.a=e[0];p.b=e[1];p.t=.5;p.jy=0;p.jx=p.jz=0}}if(f%3||f<180)continue;frames++;for(const c of window.__cvCars()){if(c._px!=null&&Math.hypot(c._px-c.x,c._pz-c.z)>8)c._jf=frames;c._px=c.x;c._pz=c.z}const cars=window.__cvCars().filter(c=>c.CVn&&!(c.dead>0)&&!(frames-(c._jf??-99)<60));
      for(const T of S){if(Math.abs(T.x-M.RO.x)>320||Math.abs(T.z-M.RO.z)>320)continue;const In=cars.filter(c=>Math.hypot(c.x-T.x,c.z-T.z)<T.R0);for(const c of In){if(inside.get(c)!==T){inside.set(c,T);pass++}}
       for(let i=0;i<In.length;i++)for(let j=i+1;j<In.length;j++){const a=In[i],b=In[j];if(Math.hypot(a.x-b.x,a.z-b.z)<2.6&&Math.abs(a.CVhx*b.CVhx+a.CVhz*b.CVhz)<.7&&Math.max(a.cv||0,b.cv||0)>.5){const key=[a.j,a.k,b.j,b.k].join();if(!seen.has(key)){seen.add(key);col++;if(log.length<4){const C2=__cv.CV,inf=c=>({cv:+(c.cv||0).toFixed(1),ab:[c.a,c.b],f:c.CVf,x:c.CVx,res:T.res?T.res.has(c):null,gh:c.CVgh===T,jf:frames-(c._jf??-999),rt:c.route?c.route.length:null});log.push({f,T:[Math.round(T.x),Math.round(T.z)],a:inf(a),b:inf(b)})}}}}}
      for(const c of cars){const g=C.seg.get(c.a*C.K+c.b);if(g&&g.J.sig&&c.cv<.2&&__cv.st(g.J,g.k)!=='g')stops++}}}
    return{col,pass,recycled:C.rc||0,stopFrames:stops,frames,pedOK:C.pedOK-p0[0],pedBad:C.pedBad-p0[1],log}});
   ok(z.col===0&&z.pass>20,`${nm}: 3 sim-min at busy signals, no AI collisions inside junctions`,z);ok(z.pedBad===0&&z.pedOK>0,`${nm}: pedestrians cross only on walk`,{ok:z.pedOK,bad:z.pedBad});
   // 3 · real keys: run a red light → DAREDEVIL pop, +10 studs, no damage
   const dv=await p.evaluate(()=>{const M=__mho,C=__cv.CV,R=M.RO,K=M.K,S=C.sig;const GT=(M.athGates&&M.athGates())||[];for(const J of S){if(GT.some(g=>Math.hypot(g.x-J.x,g.z-J.z)<350))continue;for(let k=0;k<J.ap.length;k++){const ap=J.ap[k];const e=ap.e[0];const N=window.__cvNodes(),A=N[e[0]];
     let g=0;while(__cv.st(J,k)!=='r'&&g++<9000)M.roamSim(1);g=0;while(__cv.st(J,k)==='r'&&g++<9000)M.roamSim(1);g=0;while(__cv.st(J,k)!=='r'&&g++<9000)M.roamSim(1);
     const sx=J.x-ap.dx*(J.R0+45),sz=J.z-ap.dz*(J.R0+45);M.warp(sx,sz,Math.atan2(ap.dx,ap.dz));M.roamSim(2);const d0=C.dd,cr0=JSON.parse(localStorage.getItem('mho_season@1')||localStorage.getItem('mho_season')||'{}').cr||0,hp0=R.hp;let t=0;
     for(t=0;t<60*6;t++){let a=Math.atan2(J.x-R.x,J.z-R.z)-R.h;a=Math.atan2(Math.sin(a),Math.cos(a));K.ArrowLeft=a>.04;K.ArrowRight=a<-.04;K.ArrowUp=true;M.roamSim(1);if(C.dd>d0)break}K.ArrowUp=K.ArrowLeft=K.ArrowRight=false;
     const feed=[...document.querySelectorAll('#feed div')].map(d=>d.textContent).join('|');if(C.dd>d0)return{dd:C.dd-d0,feed:feed.slice(0,120),t:+(t/60).toFixed(1),st:__cv.st(J,k)};}}return{dd:0}});
   ok(dv.dd===1&&/DAREDEVIL/.test(dv.feed),`${nm}: running a red with the keys pops "+10 studs DAREDEVIL"`,dv)}
  ok(!p.errs.length,`${nm}: no page errors`,p.errs.slice(0,3));await p.context().close()}}
// perf + before/after screenshots: same spots on the base page and the patched page
const SPOTS={fra:[['Bankenviertel',1],['Altstadt',1],['Westend',1],['Ostend',1],['Osthafen',0],['Sachsenhausen',0]],ath:[['Plaka',1],['Kolonaki',1],['Ambelokipi',1],['Palaio Psychiko',1],['Anafiotika',0],['Chalandri',0]]};
async function perf(b){fs.mkdirSync('cvshots',{recursive:true});const out={},XY={};
 for(const [pg,tag] of [['local_dbg.html','after'],['cvbase_dbg.html','before']]){for(const c of ['fra','ath']){const ds=c==='fra'?[null]:['A','B','C','D'];const done=new Set();
  for(const d of ds){if(done.size>=6)break;if(tag==='before'&&!SPOTS[c].some(([n])=>XY[c+n]&&XY[c+n].d===d))continue;const p=await load(b,c,d,pg);
   for(const [name,shot] of SPOTS[c]){if(done.has(name))continue;const pre=XY[c+name];if(tag==='before'&&(!pre||pre.d!==d))continue;
    const s=await p.evaluate(([nm,pre])=>{const M=__mho;try{M.storyClose()}catch(e){}let q=pre;if(!q){const D=window.__cvDist(nm);if(!D)return null;if(M.athd&&M.athd()){const nd=M.pinNode(M.athd(),{x:D[0],z:D[1]});if(!nd||Math.hypot(nd[0]-D[0],nd[1]-D[1])>250)return null;D[0]=nd[0];D[1]=nd[1]}q=M.rsnap(D[0],D[1],250);if(!q||Math.hypot(q[0]-D[0],q[1]-D[1])>250)return null;const a=M.rsnap(q[0]+8,q[1]+8,60);q=[q[0],q[1],Math.atan2(a[0]-q[0],a[1]-q[1])||0]}
     M.warp(q[0],q[1],q[2]);M.roamSim(120);return q},[name,pre&&pre.q]);if(!s)continue;done.add(name);if(tag==='after')XY[c+name]={q:s,d};
    await F.off(p);const calls=await p.evaluate(()=>new Promise(r=>{const I=__dbg.renderer.info;I.autoReset=false;requestAnimationFrame(()=>{I.reset();requestAnimationFrame(()=>{const n=I.render.calls,t=I.render.triangles;I.autoReset=true;r([n,t])})})}));
    if(shot)await p.screenshot({path:`cvshots/${tag}_${c}_${name.replace(/\W+/g,'')}.jpg`,type:'jpeg',quality:72,timeout:600000});await F.on(p);(out[c+'|'+name]=out[c+'|'+name]||{})[tag]=calls}
   await p.context().close()}}}
 let ok1=true;for(const c of['fra','ath']){let B=0,A=0;for(const k in out)if(k.startsWith(c)&&out[k].before&&out[k].after){B+=out[k].before[0];A+=out[k].after[0];const r=out[k].after[0]/out[k].before[0];console.log('INFO',k,'calls',out[k].before[0],'->',out[k].after[0],'tris',out[k].before[1],'->',out[k].after[1],(r*100-100).toFixed(1)+'%');if(r>1.1)ok1=false}
  ok(B>0&&A<=B*1.1,`${c}: draw calls at ${Object.keys(out).filter(k=>k.startsWith(c)).length} spots within +10 %`,{before:B,after:A,pct:+((A/B-1)*100).toFixed(1)})}
 ok(ok1,'every spot within +10 % draw calls')}
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 if(MODE!=='perf')await rules(b);if(MODE!=='rules')await perf(b);
 console.log(fails?`tCV FAILED ${fails}`:'tCV ALL PASS');await b.close();process.exit(fails?1:0)})();
