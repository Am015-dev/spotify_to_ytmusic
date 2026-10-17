// Screenshots of the help kit at 390x763: a coach bubble (herald), the bulb suggestion (place) and a rules card -> ../playtest/help-*.png
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const fs=require('fs');const html=fs.readFileSync(__dirname+'/thornbound.html');const OUT=__dirname+'/../playtest/';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await PW.chromium.launch({args:['--no-sandbox']});
const ctx=await b.newContext({viewport:{width:390,height:763},deviceScaleFactor:2,isMobile:true,hasTouch:true});
await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
const p=await ctx.newPage();p.on('pageerror',e=>console.log('ERR',e.message));
await p.goto('https://gns.test/?phone=1');await sleep(900);
await p.evaluate(()=>{try{localStorage.clear()}catch(e){}newGame('me',{np:3,seed:907,length:'short',levels:['normal','normal','easy']});UI.speed=8;UI.guide='off'});
const done={};
for(let i=0;i<500&&Object.keys(done).length<3;i++){await sleep(150);
 const st=await p.evaluate(()=>({ph:hlpPhase(),cur:GXH.state().cur,over:!!G.over,sug:!!(UI.bf&&UI.bf.sug)}));if(st.over)break;
 if(st.ph==='herald'&&!done.coach&&st.cur&&st.cur.kind==='coach'){done.coach=1;await sleep(250);await p.screenshot({path:OUT+'help-coach-bubble-390x763.png'});console.log('coach')}
 if(st.ph==='place'&&!done.bulb&&st.sug){await p.evaluate(()=>GXH.hide());const bb=await p.evaluate(()=>{const r=document.querySelector('#bulbbtn').getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]});
   await p.touchscreen.tap(...bb);await sleep(500);done.bulb=1;await p.screenshot({path:OUT+'help-bulb-suggestion-390x763.png'});console.log('bulb');
   await p.evaluate(()=>document.querySelector('.gxh-link').click());await sleep(300);
   await p.evaluate(()=>document.querySelector('.gxh-next').click());await sleep(200);
   done.rules=1;await p.screenshot({path:OUT+'help-rules-card-390x763.png'});console.log('rules');await p.evaluate(()=>GXH.hide());await p.evaluate(()=>document.querySelector('.gxh-rules .gxh-x').click())}
 if(st.ph==='herald'&&!done.coach)continue;
 await p.evaluate(()=>{GXH.hide();const M=UI.bf;if(M&&M.sug&&!UI.card)humanMove(M.sug.k);else if(M&&M.mv&&M.mv.length&&!UI.card){const d=M.mv.find(m=>m.t==='done'||m.pass||m.skip||m.t==='return')||M.mv[0];humanMove(d.k)}});
}
await b.close()})();
