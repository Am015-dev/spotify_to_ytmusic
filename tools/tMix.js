// tMix.js (v88z): traffic mix seen on a 2-min drive (keys, follows GPS routes to random spots 400-800 m away). Counts every traffic
// vehicle that comes within 120 m (unique), by type, plus the whole-city mix. usage: node tools/tMix.js <url> <city> [minutes] [shot.jpg]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const {boot}=require('./d24lib.js');
const URL=process.argv[2],CITY=process.argv[3]||'fra',MIN=+(process.argv[4]||2),SHOT=process.argv[5];
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const {p,errs,shot}=await boot(b,{city:CITY,url:URL,phone:true});
 const seen=new Map();let kL=0,kR=0,P=null,pi=0,rs=7;const rng=()=>(rs=(rs*16807)%2147483647)/2147483647;let vs=0,n=0;await p.keyboard.down('ArrowUp');
 await p.evaluate(()=>{__mho.RO.ch=null});
 for(let f=0;f<MIN*3600;f+=6){
  if(!P||pi>=P.length-2){const s=await p.evaluate(([a,L])=>{const M=__mho,R=M.RO;const q=M.rsnap(R.x+Math.sin(a)*L,R.z+Math.cos(a)*L,400);if(!q)return null;try{return M.qv.path(R.x,R.z,q[0],q[1]).P}catch(e){return null}},[rng()*6.28,400+rng()*400]);P=s;pi=0;if(!P){await p.evaluate(()=>__tick(6));continue}}
  const o=await p.evaluate(([P,pi])=>{const R=__mho.RO;let bi=pi,bd=1e9;for(let k=pi;k<Math.min(P.length,pi+30);k++){const d=Math.hypot(P[k][0]-R.x,P[k][1]-R.z);if(d<bd){bd=d;bi=k}}
    let k=bi,acc=0;while(k<P.length-1&&acc<10+Math.abs(R.v)*.5){acc+=Math.hypot(P[k+1][0]-P[k][0],P[k+1][1]-P[k][1]);k++}let e=Math.atan2(P[k][0]-R.x,P[k][1]-R.z)-R.h;e=Math.atan2(Math.sin(e),Math.cos(e));
    const near=[];__mho.HUB.cars.forEach((c,i)=>{if(!(c.dead>0)&&Math.hypot(c.x-R.x,c.z-R.z)<120)near.push(i)});return{bi,e,v:R.v,near}},[P,pi]);
  pi=o.bi;vs+=Math.abs(o.v);n++;if(f%60===0){const ks=await p.evaluate(()=>__mho.cars().map(c=>c.k));for(const i of o.near)seen.set(i,ks[i])}
  if(Math.abs(o.v)<1&&f%180===0)P=null;
  const wl=o.e>.06,wr=o.e<-.06;if(wl!=kL){kL=wl;wl?await p.keyboard.down('ArrowLeft'):await p.keyboard.up('ArrowLeft')}if(wr!=kR){kR=wr;wr?await p.keyboard.down('ArrowRight'):await p.keyboard.up('ArrowRight')}
  if(Math.abs(o.e)>.7&&o.v>12)await p.keyboard.up('ArrowUp');else await p.keyboard.down('ArrowUp');
  await p.evaluate(()=>__tick(6))}
 const cnt={};for(const k of seen.values())cnt[k]=(cnt[k]||0)+1;const all={};for(const c of await p.evaluate(()=>__mho.cars()))all[c.k]=(all[c.k]||0)+1;
 const tv=await p.evaluate(()=>{const v=__mho.HUB.cars.filter(c=>!(c.dead>0)).map(c=>Math.abs(c.v)*3.6);return{avg:+(v.reduce((a,b)=>a+b,0)/v.length).toFixed(0),min:Math.round(Math.min(...v)),max:Math.round(Math.max(...v))}});
 if(SHOT){await p.keyboard.up('ArrowUp');await p.evaluate(()=>__tick(90));await shot(SHOT)}
 console.log(JSON.stringify({city:CITY,seen:seen.size,seenByType:cnt,cityMix:all,trafKmh:tv,avgKmh:+(vs/Math.max(1,n)*3.6).toFixed(0),errs:errs.slice(0,3)}));await b.close()})();
