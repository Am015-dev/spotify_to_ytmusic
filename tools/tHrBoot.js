// GO hr/boot (hr-boot-mstart): the real first minute on the BUILT page, phone profile (iPhone UA, 852x393 touch, 6x CPU), real touch tap on PLAY.
// Pass line: after the PLAY tap 0 samples with #menu (the CHOOSE TRACK race menu) visible, and the first sample with car control (RO.on, not frozen) has the loader (#ld2) hidden.
// usage: node tools/tHrBoot.js out/<ver> [shotDir]   (THROTTLE=1 to run unthrottled)
const {chromium}=require('/opt/node22/lib/node_modules/playwright'),http=require('http'),fs=require('fs'),path=require('path');
const [DIR,OUT]=process.argv.slice(2);const UA='Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const MT={'.html':'text/html','.js':'text/javascript','.json':'application/json','.mp3':'audio/mpeg'};
const srv=http.createServer((q,r)=>{let f=path.join(DIR,decodeURIComponent(q.url.split('?')[0]));if(f.endsWith('/'))f+='index.html';fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'content-type':MT[path.extname(f)]||'application/octet-stream'});r.end(d)})});
// in-page sampler: every 40 ms (and every rAF) record #menu / #ld2 visibility and whether the car has control
const SAMPLER=`(()=>{const v=e=>{if(!e)return false;const r=e.getBoundingClientRect();if(r.width<4||r.height<4)return false;let n=e;while(n&&n!==document.body){const s=getComputedStyle(n);if(n.hidden||s.display==='none'||s.visibility==='hidden'||+s.opacity<.05)return false;n=n.parentElement}return true};
 const S=window.__hrS=[];const f=()=>{let R=null;try{R=window.__tk?__tk.q('typeof RO!=="undefined"?{on:RO.on,fz:RO.frozen}:null'):null}catch(e){}
  S.push({t:Math.round(performance.now()),menu:v(document.getElementById('menu')),ld:v(document.getElementById('ld2')),ctl:!!(R&&R.on&&!R.fz)})};
 setInterval(f,40);const g=()=>{f();requestAnimationFrame(g)};requestAnimationFrame(g)})()`;
srv.listen(0,async()=>{const BASE='http://localhost:'+srv.address().port+'/index.html';
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
 const c=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,isMobile:true,hasTouch:true,userAgent:UA});const p=await c.newPage();p.setDefaultTimeout(300000);
 const cdp=await c.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:+(process.env.THROTTLE||6)});
 const errs=[];p.on('pageerror',e=>errs.push(String(e).slice(0,160)));
 await p.goto(BASE);await p.addScriptTag({content:SAMPLER}).catch(()=>{});
 // wait for the welcome PLAY card, then tap it with a real touch
 await p.waitForSelector('#ob2Play',{state:'visible',timeout:240000});await p.waitForTimeout(800);
 await p.evaluate(()=>{window.__hrClick=0;document.getElementById('ob2Play').addEventListener('click',()=>{window.__hrClick=Math.round(performance.now())},true)});
 const bb=await p.locator('#ob2Play').boundingBox();const tTap0=await p.evaluate(()=>Math.round(performance.now()));
 await p.touchscreen.tap(bb.x+bb.width/2,bb.y+bb.height/2);
 await p.waitForFunction(()=>window.__hrClick>0,null,{polling:100,timeout:60000});const tTap=await p.evaluate(()=>window.__hrClick);   // the click the game handles (touch input latency under 6x CPU is not the game's)
 void tTap0;// wait until the car has control (sampler), then 2 more seconds
 await p.waitForFunction(t=>window.__hrS&&__hrS.some(s=>s.t>t&&s.ctl),tTap,{polling:250,timeout:600000});
 await p.waitForTimeout(1500);
 if(OUT)await p.screenshot({path:path.join(OUT,'hr_boot_first_drivable.jpg'),type:'jpeg',quality:80,timeout:150000}).catch(()=>{});
 const S=(await p.evaluate(()=>window.__hrS)).filter(s=>s.t>=tTap);
 const first=S.find(s=>s.ctl),menuN=S.filter(s=>s.menu).length,ldAtCtl=first?first.ld:true,ldCtlN=S.filter(s=>s.ctl&&s.ld).length;
 const ok=!!first&&menuN===0&&!ldAtCtl&&ldCtlN===0&&!errs.length;
 if(process.env.DBG)console.log(JSON.stringify(S.filter(s=>s.menu).map(s=>[s.t-tTap,s.ld,s.ctl])));console.log(`${ok?'PASS':'FAIL'} hr/boot · ${S.length} samples after the PLAY tap (6x CPU): menu visible ${menuN}, first control at +${first?first.t-tTap:'-'} ms with loader ${ldAtCtl?'VISIBLE':'hidden'}, control frames under the loader ${ldCtlN}, page errors ${errs.length}`);
 await b.close();srv.close();process.exit(ok?0:1)});
