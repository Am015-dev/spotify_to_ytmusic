// dev1: short real-input drive (keyboard GAS + ◀ ▶ following the street under the car), counts hard wall hits (RO.hitCd re-armed) per minute.
// node qa_dev1/tDrive.js <url> <outdir> <city> <gameSec>
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const {boot}=require('../tools/d24lib.js');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const [,,url,o,c,sec]=process.argv;const {p,errs,shot}=await boot(b,{city:c,url});
 await p.evaluate(()=>{window.__D={hits:0,cd:0,pos:[],stuck:0,f:0,hitAt:[]};});
 // which key turns RO.h which way
 const h0=await p.evaluate(()=>__mho.RO.h);await p.keyboard.down('ArrowUp');await p.keyboard.down('ArrowLeft');await p.evaluate(()=>__tick(30));await p.keyboard.up('ArrowLeft');
 const sL=Math.sign(await p.evaluate(h=>{const d=__mho.RO.h-h;return Math.atan2(Math.sin(d),Math.cos(d))},h0))||1;
 const keys={L:false,R:false,B:false};const set=async(k,on,name)=>{if(keys[k]===on)return;keys[k]=on;on?await p.keyboard.down(name):await p.keyboard.up(name)};
 const N=Math.round(+sec*10);let back=0;
 for(let i=0;i<N;i++){const s=await p.evaluate(sL=>{const R=__mho.RO,D=__D;for(let k=0;k<6;k++){__tick(1);D.f++;if(R.hitCd>D.cd+.1){D.hits++;D.hitAt.push([Math.round(R.x),Math.round(R.z)])}D.cd=R.hitCd||0}
   if(Math.abs(R.v)<2)D.stuck++;const q=__oc.ev(`rfSnap(${R.x},${R.z},60)`);let want=R.h;
   if(q){let h=q[2]??R.h;const a=d=>Math.atan2(Math.sin(d),Math.cos(d));if(Math.abs(a(h-R.h))>Math.PI/2)h+=Math.PI;const ex=q[0]-R.x,ez=q[1]-R.z,off=Math.hypot(ex,ez);
    const ah=Math.sin(h)*30+ex,az=Math.cos(h)*30+ez;want=Math.atan2(ah,az);if(off<1)want=h}
   const d=Math.atan2(Math.sin(want-R.h),Math.cos(want-R.h));return{d:d*sL,v:R.v}},sL);
  if(back>0){back--;await set('B',true,'ArrowDown');await p.keyboard.up('ArrowUp');if(!back){await set('B',false,'ArrowDown');await p.keyboard.down('ArrowUp')}continue}
  if(Math.abs(s.v)<1.5&&i>30&&i%40===0){back=12;continue}
  await set('L',s.d>.06,'ArrowLeft');await set('R',s.d<-.06,'ArrowRight')}
 const D=await p.evaluate(()=>__D);await shot(`${o}/drive_${c}.jpg`);const min=D.f/3600;
 console.log(JSON.stringify({city:c,min:+min.toFixed(2),hits:D.hits,perMin:+(D.hits/min).toFixed(2),stuckPct:+(100*D.stuck/(D.f/6)).toFixed(1),hitAt:D.hitAt.slice(0,12),errs:errs.slice(0,3)}));await b.close()})();
