// jit.js <url> <out> [tab]: race with real keys (gas, nitro after 6 s), 60 fps test-driven frames; per frame: player root/body/screen pos, body pitch/roll,
// camera pos/quat, nearest AI body; jitter = |x[t+1]-2x[t]+x[t-1]|. Also HUD km/h vs v*3.6 and car length. Frame strip at 150+.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
const INIT=`(()=>{const q=[];let t=0;window.__auto=true;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.cancelAnimationFrame=()=>{};
 window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c){try{f(t)}catch(e){window.__err=String(e)}}if(window.__mon)window.__mon()}return t};
 setInterval(()=>{if(window.__dbg&&!window.__fastR){window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}if(window.__auto)window.__tick(1)},16)})();`;
(async()=>{const [URL,OUT,TAB='quick']=process.argv.slice(2);const br=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await br.newContext({viewport:{width:852,height:393},deviceScaleFactor:2,isMobile:true,hasTouch:true});await ctx.addInitScript(INIT);const p=await ctx.newPage();p.setDefaultTimeout(600000);
const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,150)));
await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}))});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{window.__auto=false});await p.evaluate(t=>__dbg.RS(t),TAB);
await p.evaluate(()=>{const {THREE}=__dbg;const L=window.__J=[];const v=new THREE.Vector3(),q=new THREE.Quaternion(),e=new THREE.Euler();window.__mon=()=>{if(__dbg.ST!=='race')return;const P=__dbg.PL,c=__dbg.camera;if(!P||!P.mesh)return;P.mesh.updateMatrixWorld(true);const ud=P.mesh.userData;const root=P.mesh.position.clone();const body=new THREE.Vector3();(ud.m||P.mesh).getWorldPosition(body);
  (ud.m||P.mesh).getWorldQuaternion(q);const qr=P.mesh.quaternion.clone().invert().multiply(q);e.setFromQuaternion(qr,'YXZ');const sc=body.clone().project(c);
  let ai=null,ad=1e9;for(const s of __dbg.SH){if(s.isPlayer||!s.mesh)continue;const d=s.mesh.position.distanceTo(root);if(d<ad){ad=d;ai=s}}let aiB=null,aiS=null;if(ai&&ad<40){const b=new THREE.Vector3();(ai.mesh.userData.m||ai.mesh).getWorldPosition(b);aiB=[b.x,b.y,b.z];const s2=b.clone().project(c);aiS=[s2.x*426,s2.y*196.5]}
  const hud=(document.getElementById('spd')||{}).textContent;L.push({v:P.v,root:[root.x,root.y,root.z],body:[body.x,body.y,body.z],pitch:e.x,roll:e.z,scr:[sc.x*426,sc.y*196.5],cam:[c.position.x,c.position.y,c.position.z],cq:[c.quaternion.x,c.quaternion.y,c.quaternion.z,c.quaternion.w],fov:c.fov,ai:aiB,aiS,ad,hud,air:!!P.air})}});
const tick=n=>p.evaluate(n=>__tick(n),n);const K=p.keyboard;await K.down('ArrowUp');await tick(240);
let shots=0;for(let i=0;i<40;i++){if(i===6)await K.down('ShiftLeft');if(i===14)await K.up('ShiftLeft');const st=await p.evaluate(()=>{const P=__dbg.PL;return{x:P.x,yaw:P.yaw,kmh:P.v*3.6}});const e=st.x*.05+st.yaw*1.5;await K.up('ArrowLeft');await K.up('ArrowRight');if(e>.08)await K.down('ArrowLeft');else if(e<-.08)await K.down('ArrowRight');await tick(30);
 if(st.kmh>150&&shots<6){for(let f=0;f<6;f++){await tick(1);await p.evaluate(()=>{__dbg.SS();__fastR.call(__dbg.composer)});await p.screenshot({path:`${OUT}_${shots}_${f}.png`,clip:{x:226,y:120,width:400,height:200}})}shots++}}
const L=await p.evaluate(()=>window.__J);
const j2=(arr)=>{const o=[];for(let i=1;i<arr.length-1;i++){if(!arr[i-1]||!arr[i]||!arr[i+1])continue;let s=0;for(let k=0;k<arr[i].length;k++){const d=arr[i+1][k]-2*arr[i][k]+arr[i-1][k];s+=d*d}o.push(Math.sqrt(s))}o.sort((a,b)=>a-b);return{p50:+(o[o.length>>1]||0).toFixed(4),p95:+(o[Math.floor(o.length*.95)]||0).toFixed(4),max:+(o[o.length-1]||0).toFixed(4)}};
const fast=L.filter(f=>f.v*3.6>120&&!f.air);const seg=fast;
const rel=(a,b)=>a.map((f,i)=>f[b]?f[b].map((x,k)=>x-f.cam[k]):null);
const res={frames:L.length,fast:fast.length,kmhMax:+Math.max(...L.map(f=>f.v*3.6)).toFixed(0),
 root:j2(seg.map(f=>f.root)),body:j2(seg.map(f=>f.body)),bodyMinusRoot:j2(seg.map(f=>f.body.map((x,k)=>x-f.root[k]))),pitch:j2(seg.map(f=>[f.pitch])),roll:j2(seg.map(f=>[f.roll])),
 screenPx:j2(seg.map(f=>f.scr)),cam:j2(seg.map(f=>f.cam)),camQ:j2(seg.map(f=>f.cq)),bodyRelCam:j2(seg.map(f=>f.body.map((x,k)=>x-f.cam[k]))),
 aiScreenPx:j2(seg.filter(f=>f.aiS).map(f=>f.aiS)),aiRelCam:j2(seg.filter(f=>f.ai).map(f=>f.ai.map((x,k)=>x-f.cam[k]))),
 hudSample:seg.slice(0,5).map(f=>[f.hud,+(f.v*3.6).toFixed(0)]),errs};
console.log(JSON.stringify(res));require('fs').writeFileSync(OUT+'_frames.json',JSON.stringify(L.slice(-400)));await br.close()})();
