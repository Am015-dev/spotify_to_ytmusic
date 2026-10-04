// Desktop/tablet layout check. node lay.js [WxH,...]
const PW=require('playwright');
const fs=require('fs'),path=require('path');const OUT=path.join(__dirname,'shots');fs.mkdirSync(OUT,{recursive:true});
const html=fs.readFileSync(__dirname+'/thornbound.html');
const SIZES=(process.argv[2]||'1366x768,1920x1080,768x1024,1100x700').split(',').map(s=>s.split('x').map(Number));
(async()=>{const b=await PW.chromium.launch({executablePath:'/opt/pw-browsers/chromium'});let bad=0;
for(const [W,H] of SIZES){const t=W+'x'+H;const ctx=await b.newContext({viewport:{width:W,height:H}});
 await ctx.route('**/*',r=>new URL(r.request().url()).host==='gns.test'?r.fulfill({status:200,contentType:'text/html',body:html}):r.abort());
 const p=await ctx.newPage();p.setDefaultTimeout(30000);const errs=[];p.on('pageerror',e=>errs.push('PE '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load/.test(m.text()))errs.push(m.text())});
 const FAIL=(c,x)=>{bad++;console.log('FAIL',t,c,x||'')};const shot=n=>p.screenshot({path:path.join(OUT,`L_${t}_${n}.png`)});
 await p.goto('https://gns.test/');await p.waitForTimeout(1200);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});
 const scroll=async tag=>{const r=await p.evaluate(()=>({h:document.documentElement.scrollHeight,w:document.documentElement.scrollWidth,vh:innerHeight,vw:innerWidth}));if(r.h>r.vh+1||r.w>r.vw+1)FAIL('scroll '+tag,JSON.stringify(r))};
 const board=async tag=>{const r=await p.evaluate(()=>{const B=document.querySelector('.gx-board').getBoundingClientRect();const S=MAP.m.el.getBoundingClientRect();const o=[];const M=MAP.m.el.getScreenCTM();
   for(const id of ['castle','wilderness','harvest_field','battlefield','shrine','necropolis','throne']){const pp=id==='throne'?{x:500,y:500}:MAP.m.locPos(id);const x=M.a*pp.x+M.e,y=M.d*pp.y+M.f;const e=document.elementFromPoint(x,y);if(!(x>=B.left&&x<=B.right&&y>=B.top&&y<=B.bottom)||!e||!MAP.m.locEl(id).contains(e))o.push(id)}
   return {map:Math.round(S.width)+'x'+Math.round(S.height),share:+(S.width*S.height/(innerWidth*innerHeight)).toFixed(2),bad:o,inside:S.left>=B.left-1&&S.right<=B.right+1&&S.top>=B.top-1&&S.bottom<=B.bottom+1}});
   if(r.bad.length||!r.inside)FAIL('board '+tag,JSON.stringify(r));return r};
 await scroll('start');await shot('0start');
 await p.click('#start .tlink');await p.waitForTimeout(450);{const ok=await p.evaluate(()=>{const d=document.querySelector('.gx-drawer.on');if(!d)return false;const r=d.getBoundingClientRect();return d.contains(document.elementFromPoint(r.left+r.width/2,r.top+r.height/2))});if(!ok)FAIL('how to play hidden behind the title')}await p.keyboard.press('Escape');await p.waitForTimeout(300);
 await p.click('#start [data-a=play]');await p.waitForTimeout(300);await scroll('setup');await shot('0setup');
 await p.click('#start [data-a=guided]');await p.waitForTimeout(900);
 for(let i=0;i<20;i++){const st=await p.evaluate(()=>({c:UI.card&&UI.card.kind,co:!!UI.coachInfo,s:G.q&&viewSeatForQ()}));if(st.co){if(i===0)await shot('1coach');await p.click('#act [data-a=coachok]');await p.waitForTimeout(200)}else if(st.c){await p.click('#pc .btn.pri');await p.waitForTimeout(200)}else if(st.s!=null){break}else await p.waitForTimeout(200)}
 await scroll('game');const r=await board('bid');console.log(t,'map',r.map,'share',r.share);await shot('1bid');
 const dock=await p.evaluate(()=>{const d=document.querySelector('.gx-dock').getBoundingClientRect();return d.width>250&&d.right<=innerWidth+1&&d.bottom<=innerHeight+1&&d.top>=0});if(!dock)FAIL('dock not visible');
 // hand card -> pop-up, close
 await p.click('#handw .hc');await p.waitForTimeout(250);if(await p.evaluate(()=>UI.pop)!=='card')FAIL('card popup');await shot('2cardpop');await p.keyboard.press('Escape');
 // play several steps by real clicks
 const cv=async(...sels)=>{for(const q of sels){const l=p.locator(q+':visible').first();if(await l.count()){await l.click({timeout:4000}).catch(()=>{});return true}}return false};
 for(let i=0;i<60;i++){await p.waitForTimeout(120);const st=await p.evaluate(()=>({o:!!G.over,c:UI.card&&UI.card.kind,s:G.q&&viewSeatForQ(),k:G.q&&G.q.kind,r:G.round}));if(process.env.DBG)console.log('step',i,JSON.stringify(st));if(st.o||st.r>1)break;
  if(await p.evaluate(()=>!!UI.coachInfo)){await p.click('#act [data-a=coachok]').catch(()=>{});continue}
  if(st.c){await cv('#pc .btn.pri');continue}if(st.s==null)continue;
  if(['bid','place','tie'].includes(st.k)){await cv('#handw .hc');await p.waitForTimeout(150);const ok=await p.$('#ppop [data-a=mv]');if(ok)await cv('#ppop [data-a=mv]');else await cv('#act [data-a=mv].pri','#main [data-a=mv]')}
  else if(st.k==='herald'){await cv('#main [data-a=loc]');await p.waitForTimeout(150);await cv('#ppop [data-a=mv]')}
  else await cv('#act [data-a=mv].pri','#act [data-a=mv]','#main [data-a=mv]')}
 await scroll('later');await board('later');await shot('3later');
 for(const id of ['rulesd','logd','boardd','setd']){await p.click(`.gx-bar [data-gx=${id}]`);await p.waitForTimeout(450);await scroll('drawer '+id);if(!(await p.evaluate(i=>document.getElementById(i).classList.contains('on'),id)))FAIL('drawer not open',id);if(id==='rulesd')await shot('4rules');await p.keyboard.press('Escape');await p.waitForTimeout(350);if(await p.evaluate(i=>document.getElementById(i).classList.contains('on'),id))FAIL('drawer not closed',id)}
 await p.evaluate(()=>{showStart()});await p.waitForTimeout(300);await p.click('#start [data-a=play]');await p.waitForTimeout(200);await p.click('#start [data-a=mode][data-v=hot]');await p.waitForTimeout(900);await scroll('pass');await shot('5pass');
 const hid=await p.evaluate(()=>document.querySelectorAll('#handw [data-owner]').length);if(hid)FAIL('hand visible before pass screen taken');
 await p.click('#pc [data-a=take]');await p.waitForTimeout(400);await shot('6hot');
 await p.evaluate(()=>{AIDELAY=0;ANIM=0;newGame('ai',{np:4,seed:3})});await p.waitForTimeout(2500);await scroll('watch');await board('watch');await shot('7watch');
 console.log(t,'errors',JSON.stringify(errs.slice(0,3)));bad+=errs.length;await ctx.close()}
console.log('PROBLEMS',bad);await b.close()})().catch(e=>{console.error('FATAL',e);process.exit(1)});
