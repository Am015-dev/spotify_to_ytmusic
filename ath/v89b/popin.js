// ath/v89b/popin.js <url> fra|ath <outdir> [kmh] : long views at speed. The car is carried along a long road route at a constant speed
// (one game frame per tick, so streaming gets exactly the per-frame budget it gets on a device), and every frame counts the HOLES:
// far super cells within draw range that have geometry but are not built yet, once the far LOD is on (before that the originals draw), and LAZY regions within draw range that are not done.
// Shots (852x393): 2 long views per city from a raised chase camera looking down the road, plus frame cost of the stream work.
const enter=require('../../bc/enter.js');const fs=require('fs');const URL=process.argv[2],CITY=process.argv[3]||'fra',OUT=process.argv[4]||'ath/v89b/pop',KMH=+(process.argv[5]||(CITY==='fra'?200:110));fs.mkdirSync(OUT,{recursive:true});
(async()=>{const seed=CITY==='ath'?`localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{},"tut":1}');localStorage.setItem('mho_story.ath@1','{"seen":1}')`:`localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))`;
 const E=await enter(URL,{gfx:'normal',seed});const {p,errs}=E;p.setDefaultTimeout(900000);await E.roamApi();
 // route: a greedy walk along the road graph (keep going as straight as possible, never revisit), longest of 30 starts; Autobahn nodes first in Frankfurt
 const route=await p.evaluate(CITY=>{const N=__mho.HUB.nodes;const ok=[];for(let i=0;i<N.length;i++){const a=N[i];if(a&&a.nb&&a.nb.length&&(CITY!=='fra'||a.ab))ok.push(i)}
   let best=null,bl=0;for(let t=0;t<30;t++){let i=ok[(t*7919)%ok.length],prev=-1;const seen=new Set([i]),P=[[N[i].x,N[i].z]];let L=0;
     for(let s=0;s<3000&&L<9000;s++){const a=N[i];let bj=-1,bs=-9;for(const j of a.nb){if(seen.has(j)||!N[j])continue;let sc=0;if(prev>=0){const h0=Math.atan2(a.x-N[prev].x,a.z-N[prev].z),h1=Math.atan2(N[j].x-a.x,N[j].z-a.z);sc=Math.cos(h1-h0)}if(CITY==='fra'&&N[j].ab)sc+=.5;if(sc>bs){bs=sc;bj=j}}
       if(bj<0)break;L+=Math.hypot(N[bj].x-a.x,N[bj].z-a.z);prev=i;i=bj;seen.add(i);P.push([N[i].x,N[i].z])}if(L>bl){bl=L;best=P}}return {P:best,L:bl}},CITY);
 console.log(CITY,'route m',Math.round(route.L),'pts',route.P.length,'kmh',KMH);
 const r=await p.evaluate(async([P,L,v,CITY])=>{const M=__mho,R=M.RO,W=window.__str?__g9ev('WBC'):null,LZ=__g9ev('LZ'),LAZY=__g9ev('LAZY'),lzD=__g9ev('lzD'),SET=__g9ev('SET');const DR=SET.q==='high'?2100:1600;
   const cum=[0];for(let i=1;i<P.length;i++)cum.push(cum[i-1]+Math.hypot(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1]));
   const at=s=>{let i=1;while(i<P.length-1&&cum[i]<s)i++;const f=(s-cum[i-1])/Math.max(1e-6,cum[i]-cum[i-1]);return[P[i-1][0]+(P[i][0]-P[i-1][0])*f,P[i-1][1]+(P[i][1]-P[i-1][1])*f,Math.atan2(P[i][0]-P[i-1][0],P[i][1]-P[i-1][1])]};
   const sd=(S,x,z)=>Math.hypot(Math.max(S.x0-x,0,x-S.x1),Math.max(S.z0-z,0,z-S.z1));
   const o={frames:0,holeFrames:0,holeMax:0,hole1k:0,lzHoleFrames:0,lzHoleMax:0,frMax:0,fr16:0,fr50:0,shotsAt:[]};const n=Math.floor(Math.min(L,9000)/(v/60));
   const C=__g9ev('composer'),r0=C.render;C.render=()=>{};let [x0,z0,h0]=at(0);M.warp(x0,z0,h0,performance.now());for(let i=0;i<120;i++)__tick(1);await new Promise(r=>setTimeout(r,50));
   for(let f=0;f<n;f++){const s=f*v/60,[x,z,h]=at(s);R.x=x;R.z=z;R.y=M.gnd(x,z,R.y+3);R.h=h;R.vh=h;R.v=v;const t0=performance.now();__tick(1);const dt=performance.now()-t0;o.frames++;
     const cx=__g9ev('camera').position.x,cz=__g9ev('camera').position.z;const jmp=o.pc?Math.hypot(cx-o.pc[0],cz-o.pc[1]):0;o.pc=[cx,cz];if(jmp>20)(o.jumps=o.jumps||[]).length<10&&o.jumps.push(f+':'+Math.round(jmp)+'m car'+Math.round(Math.hypot(R.x-x,R.z-z)));
     if(W&&W.on&&o.onAt==null)o.onAt=f;if(W&&W.on&&W.sup){let hN=0,h1=0;for(const S of W.sup){if(!S.nt||S.built)continue;const d=sd(S,cx,cz);if(d<DR)hN++;if(d<1000)h1++}if(hN){o.holeFrames++;(o.holeAt=o.holeAt||[]).length<12&&o.holeAt.push(f+':'+hN+' st='+M.state+(R.frozen?' FROZEN':'')+(R.card?' CARD':'')+(R.story?' STORY':'')+' lz'+LZ.steps+' sb'+__str.st.b+'@'+Math.round(cx)+','+Math.round(cz)+' car '+Math.round(x)+','+Math.round(z))}if(hN>o.holeMax)o.holeMax=hN;if(h1)o.hole1k++}
     let lh=0;for(const L of LAZY)if(!L.done&&lzD(L,cx,cz)<DR*.8)lh++;if(lh)o.lzHoleFrames++;if(lh>o.lzHoleMax)o.lzHoleMax=lh;
     if(f%40===0)await new Promise(r=>setTimeout(r,0))}
   C.render=r0;o.str=window.__str?{fr:__str.st.fr,max:+__str.st.max.toFixed(1),b:__str.st.b,f:__str.st.f,sup:__str.sup()}:null;o.lz={max:+LZ.max.toFixed(1),over:LZ.over,big:window.__str?__str.st.lzBig:null};return o},[route.P,route.L,KMH/3.6,CITY]);
 console.log(CITY,'POPIN',JSON.stringify(r));
 // long views: road nodes ~900 m and ~1500 m from the city centre (node centroid), car facing the centre; story cards dismissed
 for(const D of[900,1500]){await p.evaluate(D=>{const M=__mho,R=M.RO,N=M.HUB.nodes.filter(a=>a&&a.nb&&a.nb.length&&!a.ab);let cx=0,cz=0;for(const a of N){cx+=a.x;cz+=a.z}cx/=N.length;cz/=N.length;
     let b=N[0],bd=1e9;for(const a of N){const d=Math.abs(Math.hypot(a.x-cx,a.z-cz)-D);if(d<bd){bd=d;b=a}}const h=Math.atan2(cx-b.x,cz-b.z);M.warp(b.x,b.z,h,performance.now());R.x=b.x;R.z=b.z;R.y=M.gnd(b.x,b.z,R.y+60);R.h=h;R.vh=h;R.v=0},D);
   await p.waitForTimeout(6000);
   await p.evaluate(()=>{for(const b of document.querySelectorAll('button'))if(/^CONTINUE|^TAP TO CONTINUE|^SKIP/.test((b.textContent||'').trim())&&b.offsetWidth)b.click()});await p.waitForTimeout(1500);
   const n=await p.evaluate(()=>{const r=__g9ev('renderer');r.info.autoReset=false;r.info.reset();__tick(1);const o={calls:r.info.render.calls,tris:r.info.render.triangles,holes:0};r.info.autoReset=true;const W=window.__str?__g9ev('WBC'):null,c=__g9ev('camera').position;if(W)for(const S of W.sup)if(S.nt&&!S.built&&Math.hypot(Math.max(S.x0-c.x,0,c.x-S.x1),Math.max(S.z0-c.z,0,c.z-S.z1))<1600)o.holes++;return o});
   await p.evaluate(()=>{for(const id of['roamCard','odChk','odPin'])if(document.getElementById(id))document.getElementById(id).style.visibility='hidden';for(const b of document.querySelectorAll('button,div,a'))if(/^CONTINUE/.test((b.textContent||'').trim())&&b.children.length<3){let q=b;for(let k=0;k<6&&q.parentElement&&q.parentElement!==document.body;k++)q=q.parentElement;q.style.visibility='hidden'}});
   const f=`${OUT}/${CITY}_long${D}.png`;await p.screenshot({path:f});console.log('shot',f,JSON.stringify(n))}
 console.log('errors',errs.length,errs.slice(0,3).join(' | '));await E.b.close()})();
