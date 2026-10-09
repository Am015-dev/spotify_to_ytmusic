// ath/v89b/popin.js <url> fra|ath <outdir> [kmh] : long views at speed. The car is carried along a long road route at a constant speed
// (one game frame per tick, so streaming gets exactly the per-frame budget it gets on a device), and every frame counts the HOLES:
// far super cells within draw range that have geometry but are not built yet, and LAZY regions within draw range that are not done.
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
     const cx=__g9ev('camera').position.x,cz=__g9ev('camera').position.z;
     if(W&&W.sup){let hN=0,h1=0;for(const S of W.sup){if(!S.nt||S.built)continue;const d=sd(S,cx,cz);if(d<DR)hN++;if(d<1000)h1++}if(hN)o.holeFrames++;if(hN>o.holeMax)o.holeMax=hN;if(h1)o.hole1k++}
     let lh=0;for(const L of LAZY)if(!L.done&&lzD(L,cx,cz)<DR*.8)lh++;if(lh)o.lzHoleFrames++;if(lh>o.lzHoleMax)o.lzHoleMax=lh;
     if(f%40===0)await new Promise(r=>setTimeout(r,0))}
   C.render=r0;o.str=window.__str?{fr:__str.st.fr,max:+__str.st.max.toFixed(1),b:__str.st.b,f:__str.st.f,sup:__str.sup()}:null;o.lz={max:+LZ.max.toFixed(1),over:LZ.over};return o},[route.P,route.L,KMH/3.6,CITY]);
 console.log(CITY,'POPIN',JSON.stringify(r));
 // long views: stop at two points along the route (1/3, 2/3), raised camera looking along the road
 for(const k of[1,2]){await p.evaluate(([P,k])=>{const M=__mho,R=M.RO;const i=Math.floor(P.length*k/3),a=P[i],b=P[Math.min(P.length-1,i+3)];const h=Math.atan2(b[0]-a[0],b[1]-a[1]);R.x=a[0];R.z=a[1];R.y=M.gnd(a[0],a[1],R.y+3);R.h=h;R.vh=h;R.v=0;for(let j=0;j<30;j++)__tick(1)},[route.P,k]);
   const n=await p.evaluate(()=>{const r=__g9ev('renderer');r.info.autoReset=false;r.info.reset();__tick(1);const o={calls:r.info.render.calls,tris:r.info.render.triangles};r.info.autoReset=true;return o});
   await p.evaluate(()=>{for(const id of['roamCard','odChk','odPin'])if(document.getElementById(id))document.getElementById(id).style.visibility='hidden'});
   const f=`${OUT}/${CITY}_long${k}.png`;await p.screenshot({path:f});console.log('shot',f,JSON.stringify(n))}
 console.log('errors',errs.length,errs.slice(0,3).join(' | '));await E.b.close()})();
