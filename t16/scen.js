// Boost-2K scenario: real touch only (GAS/BRAKE/◀▶/BOOST + seam thumb + GAS swipe-up). No warps, no API writes.
module.exports=({p,tick,down,up,move,tap,center,shot,st,res,F})=>{global.SCEN=async()=>{
 const log=[];const L=async(tag)=>{const s=await st();s.tag=tag;log.push(s);return s};
 const steerTo=async(dir)=>{const want=dir<0?'#tL':dir>0?'#tR':null;if(!want){await up('st');return}const xy=await center(want);if(F.st&&F.st.x===xy[0])return;if(F.st)await move('st',xy);else await down('st',xy)};
 // drive N frames following the road ahead (keep heading toward a point 40 m along the start heading) or a target
 const drive=async(n,tgt)=>{for(let i=0;i<n;i+=6){const e=await p.evaluate(t=>{const R=__mho.RO;if(!t)return 0;const a=Math.atan2(t[0]-R.x,t[1]-R.z);let e=a-R.h;while(e>Math.PI)e-=2*Math.PI;while(e<-Math.PI)e+=2*Math.PI;return e},tgt||null);
   await steerTo(e>.07?-1:e<-.07?1:0);await tick(6);if(!global.OVS){const o=await p.evaluate(()=>{const m=document.querySelector('#b2kM');if(!m||!m.classList.contains('on'))return null;const a=m.getBoundingClientRect();for(const id of['roamPrompt','flPop','npcSay','roamCombo','msg']){const e=document.getElementById(id);if(!e||e.hidden||getComputedStyle(e).display==='none'||+getComputedStyle(e).opacity<.05)continue;const b=e.getBoundingClientRect();if(b.width<4)continue;if(Math.min(a.right,b.right)-Math.max(a.left,b.left)>6&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>6)return{id,a:[a.left,a.top,a.right,a.bottom].map(Math.round),b:[b.left,b.top,b.right,b.bottom].map(Math.round),t:e.textContent.slice(0,40)}}return null});if(o){global.OVS=o;res.overlap=o;await shot('overlap')}}if(global.SMW){const n=(await st()).sm;if(n>global.SMW.n){global.SMW.n=n;if(!global.SMW.shot){global.SMW.shot=1;await tick(8);await shot('smash')}}}}};
 const g=await center('#tG'),b=await center('#tB');res.btn={gas:g,brake:b};
 // 1. accelerate
 await down('gas',g);const h0=await p.evaluate(()=>{const R=__mho.RO;return[R.x+Math.sin(R.h)*400,R.z+Math.cos(R.h)*400]});for(let i=0;i<20;i++){await drive(60,h0);if((await st()).v>=55)break}await L('accel');
 // 5. boost: wait (driving) until the meter is full, then hold BOOST 4 s (full burst -> Brickbash)
 const h1=await p.evaluate(()=>{const R=__mho.RO;return[R.x+Math.sin(R.h)*400,R.z+Math.cos(R.h)*400]});
 for(let i=0;i<40;i++){const s=await st();if(s.bm>=99)break;await drive(60,h1)}const pre=await L('pre-boost');
 const bn=await center('#tN');await down('boost',bn);let bashF=null;for(let i=0;i<24;i++){await tick(10);const s=await st();if(i===4)await shot('boost');if(s.b.bash&&!bashF){bashF=i*10;await shot('brickbash')}}const sb=await L('boost-end');await up('boost');await tick(30);
 res.boost={bmStart:pre.bm,burst:await p.evaluate(()=>__b2k.log.burst),bashAfterS:bashF==null?null:+(bashF/60).toFixed(2),bash:await p.evaluate(()=>__b2k.log.bash),kmhPre:pre.v,kmhEnd:sb.v};
 // 4. smash: steer at the nearest breakable ahead
 await down('gas',g);let sm=null;for(let k=0;k<3&&!sm;k++){const t=await p.evaluate(()=>{const R=__mho.RO,H=__mho.HUB;let best=null,bd=1e9;for(const L of H.pgrid.values())for(const q of L){if(!q.alive)continue;const dx=q.x-R.x,dz=q.z-R.z,d=Math.hypot(dx,dz);const a=Math.atan2(dx,dz);let e=a-R.h;while(e>Math.PI)e-=2*Math.PI;while(e<-Math.PI)e+=2*Math.PI;if(d>8&&d<120&&Math.abs(e)<1.2&&d<bd){bd=d;best=[q.x,q.z,Math.round(d)]}}return best});
   if(!t)break;const s0=(await st()).sm,bm0=(await st()).bm;global.SMW={n:s0,shot:0};await drive(Math.min(900,t[2]*9),t.slice(0,2));const s1=await st();if(s1.sm>s0){sm={dist:t[2],smashed:s1.sm-s0,bmBefore:bm0,bmAfter:s1.bm}}}global.SMW=null;
 res.smash=sm;res.smashLog=await p.evaluate(()=>__b2k.log.smash.slice());
 // 2. two-finger drift: hold GAS, steer ▶, press BRAKE for 2 s
 await steerTo(1);await tick(6);await down('brk',b);for(let i=0;i<6;i++){await tick(10);if(i===3){await L('drift-mid');await shot('drift')}}await up('brk');await tick(2);await steerTo(0);await tick(20);await L('drift1-end');
 res.drift1=await p.evaluate(()=>__b2k.log.drift.slice(-1)[0]||null);
 await drive(240,null);
 // 3. one thumb on the seam between BRAKE and GAS (+ steer ◀): both count
 await up('gas');const seam=await p.evaluate(()=>{const G=document.querySelector('#tG').getBoundingClientRect(),B=document.querySelector('#tB').getBoundingClientRect();const gc=[G.left+G.width/2,G.top+G.height/2,G.width/2],bc=[B.left+B.width/2,B.top+B.height/2,B.width/2];const d=Math.hypot(gc[0]-bc[0],gc[1]-bc[1]);const t=(bc[2]+(d-gc[2]-bc[2])/2)/d;return[bc[0]+(gc[0]-bc[0])*t,bc[1]+(gc[1]-bc[1])*t]});
 res.seamXY=seam;await down('gas',g);await drive(150,null);await up('gas');await down('seam',seam);await steerTo(-1);await tick(4);const s3=await L('seam');res.seamBoth=!!(s3.b&&s3.b.tG&&s3.b.tB);for(let i=0;i<10;i++)await tick(10);await steerTo(0);await up('seam');await tick(20);await L('seam-end');
 res.drift2=await p.evaluate(()=>__b2k.log.drift.slice(-1)[0]||null);await shot('meter');
 // 6. hop: swipe up on GAS (finger stays on the screen)
 await up('gas');await tick(30);await down('gas',g);await tick(20);let maxAir=0;await move('gas',[g[0],g[1]-14]);await tick(1);await move('gas',[g[0],g[1]-40]);for(let i=0;i<40;i++){await tick(1);const s=await st();maxAir=Math.max(maxAir,s.air);if(i===22)await shot('hop')}
 res.hop={maxAir,count:await p.evaluate(()=>__b2k.log.hop)};await move('gas',g);await drive(60,null);
 res.log=log;res.driftAll=await p.evaluate(()=>__b2k.log.drift.slice());res.err=(await st()).b.err;
 await up('gas');await up('st')}};
