// trap.js <seed> <min>: hunt route with a setter trap on RO.x/RO.z/RO.chapter writes; prints the stack of any write that jumps > 50 m
const L=require('/home/user/spotify_to_ytmusic/tools/qa/lib.js'),fs=require('fs');
const SEED=+(process.argv[2]||1),MIN=+(process.argv[3]||3);
const src=fs.readFileSync(__dirname+'/drv_page.js','utf8');
(async()=>{const S=await L.open({base:'/home/user/spotify_to_ytmusic/out/athbugs',city:'ath',extra:{lowmem:'auto'}});
 await S.p.evaluate(s=>window.__qa.ev('window.__drv='+s),src);
 await L.ev(S.p,`(()=>{window.__trap=[];for(const k of ['x','z']){let v=RO[k];Object.defineProperty(RO,k,{configurable:true,get(){return v},set(n){if(!(Math.abs(n-v)<50)&&window.__trap.length<12)window.__trap.push({k,from:+(+v).toFixed(1),to:+(+n).toFixed(1),dt:window.__ldt,v0:window.__lv,v:RO.v,trSl:RO.trSl,st:new Error().stack.split('\\n').slice(2,40).map(s=>s.trim().slice(0,90)).join(' | ')});v=n}})}const _r=roamStep;roamStep=function(dt){window.__ldt=dt;window.__lv=RO.v;return _r.apply(this,arguments)};return 1})()`);
 for(let k=0;k<MIN*2;k++){await S.p.evaluate(a=>window.__drv(a[0],a[1]),[SEED*100+k,30]);const t=await L.ev(S.p,'window.__trap.length');if(t>3)break}
 console.log(await L.ev(S.p,'JSON.stringify(window.__trap,null,1)'));await S.close();process.exit(0)})().catch(e=>{console.log('CRASH',String(e).slice(0,300));process.exit(1)});
