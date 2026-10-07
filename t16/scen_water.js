// hop on water: drive (real touch) to the nearest river point, then swipe up on GAS while on the water
module.exports=({p,tick,down,up,move,center,shot,st,res,F})=>{global.SCEN=async()=>{
 const steerTo=async(dir)=>{const want=dir<0?'#tL':dir>0?'#tR':null;if(!want){await up('st');return}const xy=await center(want);if(F.st&&F.st.x===xy[0])return;if(F.st)await move('st',xy);else await down('st',xy)};
 const tgt=await p.evaluate(()=>{const R=__mho.RO;let best=null,bd=1e9;for(let r=20;r<4000;r+=25)for(let a=0;a<64;a++){const x=R.x+Math.sin(a/64*6.283)*r,z=R.z+Math.cos(a/64*6.283)*r;if(__mho.inRiver(x,z,0)){const d=r;if(d<bd){bd=d;best=[x,z,r]}}if(best)break}return best});
 res.water=tgt;if(!tgt)return;const g=await center('#tG');await down('gas',g);let on=null;
 for(let i=0;i<24000&&!on;i+=6){const e=await p.evaluate(t=>{const R=__mho.RO;const a=Math.atan2(t[0]-R.x,t[1]-R.z);let e=a-R.h;while(e>Math.PI)e-=2*Math.PI;while(e<-Math.PI)e+=2*Math.PI;return e},tgt);
  if((await st()).v<5){global.STK=(global.STK||0)+6}else global.STK=0;if(global.STK>90){global.STK=0;const bk=await center('#tB');await up('gas');await steerTo(e>0?1:-1);await down('brk',bk);await tick(80);await up('brk');await steerTo(e>0?-1:1);await down('gas',g);await tick(60)}
  await steerTo(e>.07?-1:e<-.07?1:0);await tick(6);const w=await p.evaluate(()=>{const R=__mho.RO;return __mho.inRiver(R.x,R.z,2)?{x:Math.round(R.x),z:Math.round(R.z),y:+R.y.toFixed(2),f:true}:null});if(w)on=w}
 res.reached=on;if(!on){res.end=await st();return}await steerTo(0);await tick(60);res.onWater=await st();
 let maxAir=0;await move('gas',[g[0],g[1]-14]);await tick(1);await move('gas',[g[0],g[1]-40]);for(let i=0;i<50;i++){await tick(1);const s=await st();maxAir=Math.max(maxAir,s.air);if(i===20)await shot('hop_water')}
 res.hopWater={maxAir,hops:await p.evaluate(()=>__b2k.log.hop),veh:await p.evaluate(()=>{try{return __mho.RO.veh||document.body.dataset.veh||null}catch(e){return null}})};await up('gas');await up('st')}};
