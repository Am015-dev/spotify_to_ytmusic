// Guided first game proof (W501): fresh storage, real touch taps only (page.touchscreen.tap at the glowing spot), at 390x844 and 375x667.
// 1. Title -> Learn to play -> walks every step of the guided game by tapping the highlighted hole the kit reports.
//    Asserts: every rule step in TUT_RULES is shown, in order; each sentence has 12 words or fewer; each step shows exactly one hole;
//    the staged scoring comes out as planned (58 to Tamsin's total); the end card offers a real game.
// 2. Play a real game -> plays a FULL game by touch (tile, then rack) to the result. Asserts 0 page/console errors, invariants hold.
// node tutor-e2e.js [390x844,375x667]     SHOTS=1 also writes playable-shots/gameplay/ (tut-N, first-turn, mid-game, result) at 390x844
const PW=(()=>{try{return require('playwright')}catch(e){return require('../../node_modules/playwright')}})();
const fs=require('fs');const path=require('path');
const html=fs.readFileSync(__dirname+'/sunglaze.html');const LIVE=path.join(__dirname,'../../../games/sunglaze');
const SIZES=(process.argv[2]||'390x844,375x667').split(',').map(s=>s.split('x').map(Number));
const SHOT=path.join(__dirname,'../playable-shots/gameplay');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let fail=0;const P=(ok,m)=>{console.log((ok?'PASS ':'FAIL ')+m);if(!ok)fail++};
(async()=>{const browser=await PW.chromium.launch(Object.assign({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader']},fs.existsSync('/opt/pw-browsers/chromium')?{executablePath:'/opt/pw-browsers/chromium'}:{}));
for(const [W,H] of SIZES){const tag=W+'x'+H,shots=process.env.SHOTS&&W===390&&H===844;if(shots)fs.mkdirSync(SHOT,{recursive:true});
 const ctx=await browser.newContext({viewport:{width:W,height:H},isMobile:true,hasTouch:true,deviceScaleFactor:shots?2:1});
 await ctx.route('**/*',r=>{const u=new URL(r.request().url());if(u.host!=='gns.test')return r.abort();if(u.pathname==='/')return r.fulfill({status:200,contentType:'text/html',body:html});
  const f=path.join(LIVE,decodeURIComponent(u.pathname));return fs.existsSync(f)?r.fulfill({body:fs.readFileSync(f)}):r.fulfill({status:404,body:''})});
 const p=await ctx.newPage();p.setDefaultTimeout(15000);const errs=[];
 p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/net::|Failed to load|favicon|404/.test(m.text()))errs.push(m.text())});
 const tap=(x,y)=>p.touchscreen.tap(x,y);
 const tapEl=async sel=>{const r=await p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;const b=e.getBoundingClientRect();if(b.width<2)return null;const x=b.left+b.width/2,y=b.top+b.height/2;const h=document.elementFromPoint(x,y);return {x,y,ok:!!h&&(h===e||e.contains(h))}},sel);
  if(!r||!r.ok)return false;await tap(r.x,r.y);return true};
 await p.goto('https://gns.test/');await sleep(800);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});await p.reload();await sleep(2000);
 await p.evaluate(()=>{window.bfD=ms=>ms*.3});
 P(await tapEl('#modal [data-a=tutorial]'),tag+' title has a Learn to play button that takes a touch');
 // ---- 1. the guided game
 const seen=[],says={},holes={};let last='',stuck=Date.now(),ended=false,n=0;
 for(let it=0;it<2000;it++){
  const s=await p.evaluate(()=>{const st=GXT.state();const end=document.querySelector('.gxt-end [data-gxt-end]');const b=document.querySelector('.gxt-bub .gxh-tx');
   return {st:{active:st.active,phase:st.phase,id:st.id,shown:st.shown,i:st.i},end:!!end,say:b?b.textContent:'',holes:(st.holes||[]).length,hole:st.hole?{x:st.hole.cx,y:st.hole.cy}:(st.holes&&st.holes[0]?{x:st.holes[0].cx,y:st.holes[0].cy}:null)}});
  if(s.end){ended=true;break}
  if(s.st.id&&s.st.id!==last){last=s.st.id;stuck=Date.now()}
  if(Date.now()-stuck>30000){P(false,tag+' guided game stuck at step '+last+' phase '+s.st.phase);break}
  if(!(s.st.active&&s.st.phase==='show'&&s.st.shown&&s.hole)){await sleep(100);continue}
  if(!seen.includes(s.st.id)){seen.push(s.st.id);says[s.st.id]=s.say;holes[s.st.id]=s.holes;await sleep(650);   // a tap in the first 600 ms is ignored by the kit (gesture tail)
   if(shots){n++;await p.screenshot({path:path.join(SHOT,'tut-'+n+'.png')})}}
  const before=s.st.i;await tap(s.hole.x,s.hole.y);await sleep(250);
  const after=await p.evaluate(()=>GXT.state().i);if(after===before)await sleep(300)}
 P(ended,tag+' guided game reaches its end card by touch');
 const want=await p.evaluate(()=>TUT_RULES);
 P(JSON.stringify(seen)===JSON.stringify(want),tag+' every rule step shown in order ('+seen.length+'/'+want.length+')'+(JSON.stringify(seen)===JSON.stringify(want)?'':' got '+seen.join(',')));
 const long=Object.entries(says).filter(([k,t])=>t.trim().split(/\s+/).length>12);P(!long.length,tag+' every step is one sentence of 12 words or fewer'+(long.length?' '+JSON.stringify(long):''));
 const multi=Object.entries(holes).filter(([k,v])=>v!==1);P(!multi.length,tag+' every step highlights exactly one tap'+(multi.length?' '+JSON.stringify(multi):''));
 const sc=await p.evaluate(()=>G&&G.over?G.pl.map(x=>x.score):null);P(sc&&sc[0]===58,tag+' staged scoring ends as taught (you '+(sc&&sc[0])+', Tamsin '+(sc&&sc[1])+')');
 const later=await p.evaluate(()=>document.body.textContent.includes('meet later'));P(!later,tag+' no "learn later" list');
 // ---- 2. the real game that follows
 P(await tapEl('.gxt-end [data-gxt-end=play]'),tag+' end card: Play a real game takes a touch');await sleep(1500);
 const fresh=await p.evaluate(()=>!!G&&!UI.tut&&G.turn===0&&G.pl[0].wall.every(r=>r.every(v=>v<0)));P(fresh,tag+' a fresh real game starts');
 let moves=0,bad=0,inv=[],firstShot=false,midShot=false;stuck=Date.now();let sig='';
 for(let it=0;it<6000;it++){
  const s=await p.evaluate(()=>({over:!!(G&&G.over),me:!!G&&!G.over&&G.phase==='offer'&&sideToAct()===0&&!BF.busy&&!BF.q.length,sel:!!UI.sel,sig:G?G.turn+'/'+G.round:'',r:G?G.round:0,inv:checkInvariants()}));
  if(s.inv.length)inv=s.inv;if(s.over)break;
  if(s.sig!==sig){sig=s.sig;stuck=Date.now()}if(Date.now()-stuck>45000){P(false,tag+' real game stuck at '+s.sig);break}
  if(!s.me){await sleep(120);continue}
  if(shots&&!firstShot){firstShot=true;await sleep(500);await p.screenshot({path:path.join(SHOT,'first-turn.png')})}
  if(shots&&!midShot&&s.r>=3){midShot=true;await sleep(500);await p.screenshot({path:path.join(SHOT,'mid-game.png')})}
  const m=await p.evaluate(()=>{const m=aiMove(0);window.__mv=m;const a=m.src<0?G.ctr:G.fac[m.src];return {k:(m.src<0?'c':'f'+m.src)+'_'+a.indexOf(m.c),line:m.line}});
  if(!s.sel){if(!(await tapEl(`.bf-table [data-k="${m.k}"]`))){bad++;await sleep(200);continue}await sleep(200)}
  const ok=await p.evaluate(()=>!!UI.sel&&UI.sel.src===window.__mv.src&&UI.sel.c===window.__mv.c);if(!ok){bad++;await p.evaluate(()=>{UI.sel=null});await sleep(150);continue}
  const t0=await p.evaluate(()=>G.turn);
  if(!(await tapEl(m.line<5?`[data-bfrow="${m.line}"] .bf-rack`:'.bf-fl'))){bad++;await sleep(200);continue}
  await sleep(250);if(await p.evaluate(t=>G.turn>t||!!G.over,t0))moves++;else bad++}
 const over=await p.evaluate(()=>G&&G.over?G.winText:null);
 if(shots&&over){await p.waitForSelector('.bf-ov:not([hidden])',{timeout:40000}).catch(()=>{});await sleep(1500);await p.screenshot({path:path.join(SHOT,'result.png')})}
 P(!!over,tag+' a full real game played by touch to the end ('+moves+' of your moves): '+over);
 P(bad<=moves/4,tag+' taps that missed: '+bad);P(!inv.length,tag+' invariants hold'+(inv.length?' '+inv.join('; '):''));
 P(!errs.length,tag+' 0 page errors'+(errs.length?' '+errs.slice(0,3).join(' | '):''));
 await ctx.close()}
await browser.close();console.log(fail?fail+' FAILED':'ALL PASS');process.exit(fail?1:0)})();
