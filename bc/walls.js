// bc/walls.js <url> [tpl] [sec]: real touch GAS held + human-like keyboard steering taps toward the street ahead (no warps).
// Metrics: wall hits/min (__sc.nb bounces), stuck s (<3 km/h while gas held), top/avg km/h, time 0→60 km/h, hull/size numbers, sim + draw cost.
const E=require('./enter.js');const TPL=process.argv[3]||'';const SEC=+(process.argv[4]||90);
(async()=>{const T=await E(process.argv[2],{seed:TPL?`localStorage.setItem('mho_gar',JSON.stringify({sel:'${TPL}',own:['rod','${TPL}']}))`:''});const{p,cdp,ev}=T;
 await T.roam();console.log('roam',TPL||'rod',await ev('GAR_get().sel'));
 const kmh=()=>p.evaluate(()=>Math.round(Math.abs(__mho.RO.v||0)*3.6));
 // end any running mission card so it doesn't hold the car (real tap on its button if shown)
 const g=await (await p.$('#tG')).boundingBox();const gp={x:g.x+g.width/2,y:g.y+g.height/2,id:2};
 const nb0=await ev('SC_S.nb');await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[gp]});
 const t0=await ev('performance.now()');let t60=null,stuck=0,last=t0,top=0,sum=0,n=0;
 while(true){await p.waitForTimeout(400);const now=await ev('performance.now()');const v=await kmh();const dt=(now-last)/1000;last=now;if((now-t0)/1000>SEC)break;
  top=Math.max(top,v);sum+=v;n++;if(t60==null&&v>=60)t60=+((now-t0)/1000).toFixed(1);if(v<3&&(now-t0)>3000)stuck+=dt;
  const st=await p.evaluate(()=>{const M=__mho,R=M.RO,N=M.HUB.nodes;let bi=-1,bd=1e9;for(let i=0;i<N.length;i++){const q=N[i];if(!q.nb||!q.nb.length)continue;const d=(q.x-R.x)**2+(q.z-R.z)**2;if(d<bd){bd=d;bi=i}}if(bi<0)return 0;
   const a=N[bi],fx=Math.sin(R.h),fz=Math.cos(R.h);let best=null,bs=-2;for(const j of a.nb){const m=N[j],L=Math.hypot(m.x-a.x,m.z-a.z)||1,s=((m.x-a.x)*fx+(m.z-a.z)*fz)/L;if(s>bs){bs=s;best=m}}
   const L=Math.hypot(best.x-a.x,best.z-a.z)||1,tx=(best.x-a.x)/L,tz=(best.z-a.z)/L,ax=a.x+tx*16-R.x,az=a.z+tz*16-R.z,cr=fx*az-fz*ax;return Math.abs(cr)<1.5?0:(cr>0?1:-1)});
  if(st){const key=st>0?'ArrowLeft':'ArrowRight';await p.keyboard.down(key);await p.waitForTimeout(200);await p.keyboard.up(key)}}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});const el=(last-t0)/60000;const nb=(await ev('SC_S.nb'))-nb0;
 const cost=JSON.parse(await ev(`(()=>{const t=performance.now();for(let i=0;i<120;i++)roamStep(1/60);const sim=(performance.now()-t)/120;renderer.info.autoReset=false;renderer.info.reset();const t2=performance.now();composer.render();const dr=performance.now()-t2;const r=renderer.info.render;renderer.info.autoReset=true;
  let tri=0,parts=(pl.mesh.userData.gbM||[]).length;pl.mesh.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.index)tri+=o.geometry.index.count/3;else if(o.isMesh&&o.geometry)tri+=o.geometry.attributes.position.count/3});
  return JSON.stringify({simMs:+sim.toFixed(2),drawMs:+dr.toFixed(1),calls:r.calls,sceneTri:r.triangles,carTri:Math.round(tri),bricks:(()=>{try{return GAR_set().car().length}catch(e){return null}})()})})()`));
 console.log(JSON.stringify({tpl:TPL||'rod',min:+el.toFixed(2),wallHits:nb,hitsPerMin:+(nb/el).toFixed(1),stuckS:+stuck.toFixed(1),top,avg:Math.round(sum/n),t60,hull:await ev('JSON.stringify(__bc.hull())'),dims:await ev('JSON.stringify(__bc.dims())'),cost}));
 await p.screenshot({path:`bc/walls_${TPL||'rod'}.png`});console.log('errs',T.errs.length,JSON.stringify(T.errs.slice(0,4)));await T.b.close()})().catch(e=>{console.log('FAIL',e);process.exit(1)});
