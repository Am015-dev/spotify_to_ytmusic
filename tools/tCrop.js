// tCrop.js <url> <outprefix> [city] : the player's view on phone (852x393, DPR 3) in the normal chase camera at 30–80 km/h on a road,
// full frame + 3x crop of the area under the car. Deterministic 1/60 s steps (game test hook), real keyboard input.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');
(async()=>{const [URL,OUT,CITY='fra']=process.argv.slice(2);const br=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const p=await (await br.newContext({viewport:{width:852,height:393},deviceScaleFactor:3,isMobile:true,hasTouch:true})).newPage();p.setDefaultTimeout(600000);
await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(c=>{localStorage.clear();localStorage.setItem('mho_slot','1');localStorage.setItem('mho_athpre','1');localStorage.setItem('mho_roam@1',JSON.stringify({tut:1,otg:{}}));if(c==='ath')localStorage.setItem('mho_city@1','ath')},CITY);
await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{polling:500});
await p.evaluate(()=>{try{__m1&&__m1.skip&&__m1.skip()}catch(e){}__mho.enterRoam()});await p.waitForFunction(()=>__mho.state==='roam');await p.evaluate(()=>__mho.storyClose&&__mho.storyClose());
await p.waitForTimeout(2500);await p.evaluate(()=>{window.requestAnimationFrame=()=>0;__ju.autoClose(true)});
const step=n=>p.evaluate(n=>{__ju.step(n);return __dbg.RO.v*3.6},n);
const shot=async(tag)=>{const r=await p.evaluate(()=>{__dbg.SS&&__dbg.SS();try{__dbg.composer.render()}catch(e){__dbg.renderer.render(__dbg.scene,__dbg.camera)}const {camera,THREE}=__dbg,RO=__dbg.RO,v=new THREE.Vector3(RO.x,RO.y,RO.z).project(camera);return{x:(v.x+1)/2*852,y:(1-v.y)/2*393,kmh:RO.v*3.6}});
 await p.screenshot({path:`${OUT}_${tag}.png`});const cx=Math.max(0,Math.min(852-240,r.x-120)),cy=Math.max(0,Math.min(393-120,r.y-80));
 await p.screenshot({path:`${OUT}_${tag}_crop.png`,clip:{x:cx,y:cy,width:240,height:120}});return r};
await p.keyboard.down('ArrowUp');let k=0;for(let i=0;i<40;i++){k=await step(6);if(k>45)break}await p.keyboard.up('ArrowUp');
const out=[];out.push(await shot('a'));await step(4);out.push(await shot('b'));await p.keyboard.down('ArrowUp');await step(20);await p.keyboard.down('ArrowLeft');await step(14);out.push(await shot('c'));await p.keyboard.up('ArrowLeft');await p.keyboard.up('ArrowUp');
console.log(JSON.stringify(out.map(o=>({kmh:+o.kmh.toFixed(0),x:+o.x.toFixed(0),y:+o.y.toFixed(0)}))));await br.close()})().catch(e=>{console.log('ERR',e.message);process.exit(1)});
