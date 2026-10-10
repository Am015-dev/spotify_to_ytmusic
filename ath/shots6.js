// ath/shots6.js <url> <outdir> : 6 named Athens spots (852x393 chase view, normal gfx), counts in view, frame time (MS=1)
// spot = nearest HUB street node to the real place (metres e/n of Monastiraki), heading = the edge that points most toward the look target
const enter=require('../bc/enter.js');const fs=require('fs');const URL=process.argv[2],OUT=process.argv[3];fs.mkdirSync(OUT,{recursive:true});
const S=[['plaka',380,-260,600,-560],['syntagma',760,-40,1007,-91],['monastiraki',40,40,46,-15],['acropolis',260,-650,40,-480],['syngrou',380,-1500,572,-656],['pangrati',1750,-950,1369,-865]];
(async()=>{const seed=`localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athd@1','A');localStorage.setItem('mho_roam.ath@1','{"otg":{},"tut":1}');localStorage.setItem('mho_story.ath@1','{"seen":1}')`;
 const E=await enter(URL,{gfx:process.env.GFX||'normal',seed});const {p,errs}=E;p.setDefaultTimeout(900000);
 if(process.env.LIFE)await p.evaluate(v=>__g9ev('TUNE.life='+v),process.env.LIFE);if(process.env.SET)await p.evaluate(v=>__g9ev(v),process.env.SET);await E.roamApi();
 const dis=async()=>{for(let i=0;i<4;i++){const l=p.getByText('CONTINUE',{exact:false}).first();if(await l.count()&&await l.isVisible()){await E.tapEl(await l.elementHandle());await p.waitForTimeout(800)}else break}};await dis();
 const only=process.env.ONLY?process.env.ONLY.split(','):null;
 for(const [nm,e,n,le,ln] of S){if(only&&!only.includes(nm))continue;
  const sp=await p.evaluate(([e,n,le,ln])=>__g9ev(`(()=>{const [x,z]=WP(${e},${n}),[lx,lz]=WP(${le},${ln});const N=HUB.nodes;let bi=-1,bd=1e18;for(let i=0;i<N.length;i++){const a=N[i];if(!a||!a.nb||!a.nb.length||a.ab)continue;const d=(a.x-x)**2+(a.z-z)**2;if(d<bd){bd=d;bi=i}}const a=N[bi];let bh=0,bc=-2;const tx=lx-a.x,tz=lz-a.z,tl=Math.hypot(tx,tz)||1;for(const j of a.nb){const b=N[j];if(!b)continue;const dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1,c=(dx*tx+dz*tz)/l/tl;if(c>bc){bc=c;bh=Math.atan2(dx,dz)}}return JSON.stringify([a.x,a.z,bh,Math.round(Math.sqrt(bd)),a.w||0,a.g||0])})()`),[e,n,le,ln]);
  const [x,z,h,off,w,g]=JSON.parse(sp);
  await p.evaluate(([x,z,h])=>{const M=__mho,R=M.RO;M.warp(x,z,h,performance.now());R.x=x;R.z=z;R.y=M.gnd(x,z,R.y+60);R.v=0;R.yr=0;R.vh=h;R.h=h;R.stkT=0},[x,z,h]);
  await p.waitForTimeout(+(process.env.WAIT||9000));await dis();await p.screenshot({path:`${OUT}/ath_${nm}.png`});
  const vc=await p.evaluate(()=>window.__ath&&__ath.view?JSON.stringify(__ath.view()):window.__lv?JSON.stringify(__lv.view()):'');
  console.log('shot',nm,Math.round(x),Math.round(z),'node_off',off,'w',w,'g',g,vc)}
 if(process.env.MS){const t=await p.evaluate(()=>{const C=__g9ev('composer');const f=n=>{const t0=performance.now();__tick(n);return (performance.now()-t0)/n};const a=f(60);const r=C.render;C.render=()=>{};const b=f(240);C.render=r;return{withRender:+a.toFixed(2),cpuOnly:+b.toFixed(2)}});
  const dc=await p.evaluate(()=>__g9ev('renderer.info.render.calls'));console.log('frame_ms',JSON.stringify(t),'calls',dc,'lvms',await p.evaluate(()=>__g9ev('(LV.ms||0).toFixed(3)')),'athms',await p.evaluate(()=>__g9ev("typeof AL!=='undefined'?(AL.ms||0).toFixed(3):'-'")))}
 console.log('errors',errs.length,errs.slice(0,5).join(' | '));await E.b.close()})();
