// node proof/rules-tutorial.js : 402x874 touch, records video. Shows Quick rules, then plays the guided tutorial to its end
// by tapping ONLY the spotlit target the game reports (no hard-coded coordinates), and checks every bubble sits next to its target.
const path=require('path'),fs=require('fs'),os=require('os');const {chromium}=require('playwright');
const SD=process.env.TT_SCRATCH||os.tmpdir()+'/tt-proof';fs.mkdirSync(SD,{recursive:true});
try{fs.symlinkSync(path.resolve(__dirname,'../../../games/twin-thrones/media'),SD+'/media')}catch(e){}
fs.copyFileSync(path.resolve(__dirname,'..','twin-thrones.html'),SD+'/index.html');
const W=402,H=874,VID=path.join(SD,'vid');fs.mkdirSync(VID,{recursive:true});
(async()=>{const b=await chromium.launch();
const ctx=await b.newContext({viewport:{width:W,height:H},hasTouch:true,isMobile:true,deviceScaleFactor:1,recordVideo:{dir:VID,size:{width:W,height:H}}});
await ctx.addInitScript(()=>{try{localStorage.clear()}catch(e){}});
const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await pg.goto('file://'+SD+'/index.html');await pg.waitForTimeout(900);
const box=async s=>{const l=pg.locator(s);if(!(await l.count()))return null;return l.first().boundingBox({timeout:500}).catch(()=>null)};
const tapSel=async s=>{const r=await box(s);if(!r||r.width<2)return false;await pg.touchscreen.tap(r.x+r.width/2,r.y+r.height/2);return true};
// 1. rules: Quick rules first screen
await tapSel('[data-gx="rulesd"]');await pg.waitForTimeout(900);
await pg.screenshot({path:path.join(__dirname,'quick-rules-402.png')});
const ql=await pg.evaluate(()=>document.querySelectorAll('#rulesbox .qr li').length);
await pg.waitForTimeout(1200);
await tapSel('#rulesbox [data-gxt-open], #rulesbox .mrow button');await pg.waitForTimeout(900);
// (tutorial may start from the Rules drawer button or from the title)
if(!(await pg.evaluate(()=>window.GXT&&GXT.state&&GXT.state().active))){await pg.evaluate(()=>{if(window.GX&&GX.close)GX.close()});await tapSel('#start [data-gxt-open]');}
const seen=[],bad=[];let last='',shot=0,t0=Date.now();
while(Date.now()-t0<280000){
 await pg.waitForTimeout(150);
 const st=await pg.evaluate(()=>window.GXT&&GXT.state?GXT.state():null);
 if(!st||!st.active){if(await box('.gxt-end [data-gxt-end]'))break;continue}
 if(st.phase==='end')break;if(!st.shown||!st.hole)continue;
 const key=st.id+':'+st.count;if(key===last)continue;
 await pg.waitForTimeout(800);
 const words=st.say.trim().split(/\s+/).length;if(words>12)bad.push(st.id+': '+words+' words');
 // bubble next to its target: gap <= 48px, and it never covers the target
 const g=await pg.evaluate(()=>{const b=document.querySelector('.gxh-bub.on');const h=document.querySelector('.gxt-ring:not(.soft)');if(!b||!h)return null;const a=b.getBoundingClientRect(),t=h.getBoundingClientRect();
  const dx=Math.max(t.left-a.right,a.left-t.right,0),dy=Math.max(t.top-a.bottom,a.top-t.bottom,0);const ov=Math.max(0,Math.min(a.right,t.right)-Math.max(a.left,t.left))*Math.max(0,Math.min(a.bottom,t.bottom)-Math.max(a.top,t.top));
  return{gap:Math.round(Math.hypot(dx,dy)),overlap:Math.round(ov),arrow:!!b.querySelector('.gxh-arr'),tw:Math.round(t.width),th:Math.round(t.height)}});
 if(!g)bad.push(st.id+': no bubble/target');else{if(g.gap>48)bad.push(st.id+': bubble '+g.gap+'px from target');if(g.overlap>0)bad.push(st.id+': bubble covers target');if(!g.arrow)bad.push(st.id+': no arrow')}
 const gs=await pg.evaluate(()=>{const g=TT_TEST.U.G;return 'age'+g.age+' mil'+g.mil+' coins'+g.players.map(p=>p.coins)+(g.pend[0]?' pend:'+g.pend[0].type+(g.pend[0].pl!=null?'/'+g.pend[0].pl:''):'')});
 console.log(String(seen.length+1).padStart(2),st.id.padEnd(14),JSON.stringify(g),'|',gs,'|',st.say);
 seen.push(st.id);last=key;
 await pg.screenshot({path:path.join(VID,'s'+String(++shot).padStart(2,'0')+'.png')});
 if(st.wait)await pg.touchscreen.tap(st.hole.cx,st.hole.cy);else if(!(await tapSel('.gxt-next')))bad.push(st.id+': no Next');
}
await pg.waitForTimeout(800);const endOk=await tapSel('.gxt-end [data-gxt-end="go"]');await pg.waitForTimeout(1200);
const miss=await pg.evaluate(s=>TT_TUTOR.rules.filter(r=>s.indexOf(r)<0),seen);
const ok=ql===6&&!miss.length&&!bad.length&&endOk&&!errs.length;
console.log((ok?'PASS':'FAIL'),'tutorial 402x874 by target only:',seen.length,'steps, quick lines',ql,miss.length?'missing '+miss:'',bad.length?'\nBAD: '+bad.join('\n     '):'','errors',errs.length,errs.slice(0,3).join('|'));
const v=pg.video();await ctx.close();await v.saveAs(path.join(__dirname,'rules-402x874.webm'));await b.close();process.exit(ok?0:1)})();
