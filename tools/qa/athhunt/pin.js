const L=require('/home/user/spotify_to_ytmusic/tools/qa/lib.js');
(async()=>{const S=await L.open({base:'/home/user/spotify_to_ytmusic/out/athbugs',city:'ath',extra:{lowmem:'auto'}});
for(const [x,z] of [[-80,-3092],[1879,-1615],[1921,-1646],[-80,-3092],[1879,-1615]]){const r=await L.ev(S.p,`(()=>{const q=cityAt(${x},${z},-1,true);for(const f of [1,-1]){const p=q.p;const h=Math.atan2(p.tx*f,p.tz*f);roamWarp(p.x-p.tx*f*25,p.z-p.tz*f*25,h);__qa.step(10,.05);const k=(c,on)=>window.dispatchEvent(new KeyboardEvent(on?'keydown':'keyup',{code:c}));k('KeyW',1);
 for(let i=0;i<100;i++){const ax=RO.x,az=RO.z;const qq=cityAt(RO.x,RO.z,-1,true);if(qq){const hd=Math.atan2(qq.p.tx*f,qq.p.tz*f);let e=hd-RO.h;while(e>Math.PI)e-=2*Math.PI;while(e<-Math.PI)e+=2*Math.PI;k('KeyA',e>.05);k('KeyD',e<-.05)}
 __qa.step(1,.05);const mv=Math.hypot(RO.x-ax,RO.z-az);if(i>30&&mv<.05&&Math.abs(RO.v)>3){
  let c=null,bd=9;for(const cc of HUB.cars){if(cc.x==null)continue;const d=Math.hypot(cc.x-RO.x,cc.z-RO.z);if(d<bd){bd=d;c=cc}}
  if(!c)return 'pin no car';
  const st=new Set();let X=c.x;Object.defineProperty(c,'x',{configurable:true,get(){const s=new Error().stack.split('\\n').slice(2,5).map(l=>l.trim().replace(/\\(.*\\)/,'').replace(/https?:[^ ]*/,'')).join(' < ');st.add(s);return X},set(v){X=v}});
  const bx=RO.x,bz=RO.z;__qa.step(1,.05);const mvA=Math.hypot(RO.x-bx,RO.z-bz);delete c.x;c.x=X;
  const cx=c.x;c.x+=1000;const b2x=RO.x,b2z=RO.z;__qa.step(1,.05);const mvB=Math.hypot(RO.x-b2x,RO.z-b2z);c.x=cx;
  k('KeyW',0);k('KeyA',0);k('KeyD',0);
  return JSON.stringify({d:+bd.toFixed(1),cv:c.v,cdead:c.dead,pk:!!c.pk,tr:!!c.tr,ckeys:Object.keys(c).join(','),mvWithCar:+mvA.toFixed(2),mvCarAway:+mvB.toFixed(2),v:RO.v.toFixed(1),readers:[...st].slice(0,14)})}}
 k('KeyW',0);k('KeyA',0);k('KeyD',0)}return 'no pin'})()`);console.log(x,z,r.slice(0,2500));if(r.startsWith('{'))break}
await S.close();process.exit(0)})();
