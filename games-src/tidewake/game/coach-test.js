// Coached first game test ("The Lantern Race", ui10.js): from fresh storage, open the tutorial from the title and play the whole real game
// through the UI with free legal moves (any tile / turn that Place accepts, chosen at random), to the result walk and its last card.
//   node coach-test.js [sizes=390x763,1440x860]    Exit code 1 on failure.
// Asserts: at most 2 forced taps (none: the game is free from turn 1), every rule id in OSK_RULES was explained (in game or on the
// "Things you'll meet later" card), Osk's bubble never overlaps the board and is never more than one, every tap lands on the element it aims at,
// the walk shows the real numbers, 0 console errors. Reads state (G, OSK) but never calls engine functions to act.
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const gx=require('../../scripts/gx-serve.js');const path=require('path');
const FILE=process.argv[3]||path.join(__dirname,'tidewake.html');
const SIZES=(process.argv[2]||'390x763,1440x860').split(',').map(s=>s.split('x').map(Number));
let fail=0;const forced={n:0};const bad=m=>{fail++;console.log('FAIL',m)};
async function tapEl(p,loc,touch){const b=await loc.boundingBox();if(!b)return false;const x=b.x+b.width/2,y=b.y+b.height/2;
  const ok=await loc.evaluate((el,[x,y])=>{const e=document.elementFromPoint(x,y);return !!e&&(e===el||el.contains(e))},[x,y]);if(!ok)return false;
  if(touch)await p.touchscreen.tap(x,y);else await p.mouse.click(x,y);return true}
const rnd=n=>Math.floor(Math.random()*n);
async function step(p,touch,st0){
  const vis=async sel=>{const l=p.locator(sel+':visible');return (await l.count())?l.first():null};let e;
  if(e=await vis('.gxt-next')){if(await tapEl(p,e,touch)){forced.n++;forced.goal=1;return 'intro-next'}}
  if(e=await vis('[data-gxt-end]')){if(await tapEl(p,e,touch)){forced.n++;return 'intro-card'}}
  if(e=await vis('#oskwalk [data-osk=next]')){if(await tapEl(p,e,touch))return 'walk-next'}
  if(e=await vis('#oskwalk [data-osk]')){return 'WALK-END'}
  for(const sel of ['[data-a=sunkok]','[data-ph=dismiss]','[data-a=q]','[data-ph=showover]']){if((e=await vis(sel))&&await tapEl(p,e,touch))return sel}
  if(e=await vis('[data-a=startmark]')){if(await tapEl(p,e,touch))return 'startmark'}
  const st=await p.evaluate(()=>({over:!!(G&&G.over),phase:G&&G.phase,busy:!!UI.busy,me:sideToAct()}));
  if(st.phase==='setup'&&!st.busy&&st.me===0){
    const pt=await p.evaluate(()=>{const si=startInfo(0);const o=si[Math.floor(Math.random()*si.length)];const q=hproj(o.w[0],o.w[1]);return q?{x:q.x,y:q.y}:null});
    if(pt){if(touch)await p.touchscreen.tap(pt.x,pt.y);else await p.mouse.click(pt.x,pt.y);return 'mark'}}
  if(!st.busy&&st.me===0&&(e=await vis('[data-a=card],[data-ph=pcard]'))){
    const cards=p.locator('[data-a=card]:visible,[data-ph=pcard]:visible');const n=await cards.count();const order=[...Array(n).keys()].sort(()=>Math.random()-.5);
    for(const t of order){const c=cards.nth(t);if(!await tapEl(p,c,touch))continue;await p.waitForTimeout(80);
      for(let r=0;r<4;r++){const pl=await vis('[data-a=place]:not([disabled])');if(pl&&r>=rnd(2)){if(await tapEl(p,pl,touch))return 'place'}
        const tr=await vis('[data-a=rot][data-d="1"]');if(!tr||!await tapEl(p,tr,touch))break;await p.waitForTimeout(80)}}
    const pl=await vis('[data-a=place]:not([disabled])');if(pl&&await tapEl(p,pl,touch))return 'place';
    const sk=await vis('[data-a=pass]');if(sk&&await tapEl(p,sk,touch))return 'pass'}
  return st.over?'over-wait':''}
(async()=>{
  const url=await gx.url('tidewake',{file:FILE,query:'?2d'});const b=await PW.chromium.launch();
  for(const [W,H] of SIZES){const touch=W<800;const tag=W+'x'+H;
    const c=await b.newContext({viewport:{width:W,height:H},hasTouch:touch,isMobile:touch});const p=await c.newPage();const errs=[];
    p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/net::|Failed to load|favicon/.test(m.text())&&errs.push(m.text()));
    await p.goto(url);await p.waitForTimeout(1200);await p.evaluate(()=>localStorage.clear());await p.reload();await p.waitForTimeout(1500);
    const open=p.locator('#start [data-gxt-open]:visible').first();if(!await open.count()){bad(tag+' no tutorial button on the title');continue}
    await tapEl(p,open,touch);await p.waitForTimeout(1500);
    // the "Fast" speed a player can pick in Settings, so the run fits in a few minutes
    await p.evaluate(()=>{UI.speed=2;try{TWKit.setSpeed(2)}catch(e){}});
    forced.n=0;forced.goal=0;const t0=Date.now();let idle=0,last='',overlap=0,multi=0,tips=new Set(),first={};const seen={};
    while(Date.now()-t0<420000){const a=await step(p,touch);seen[a]=(seen[a]||0)+1;
      const o=await p.evaluate(()=>{const e=document.getElementById('osk'),bd=document.getElementById('board');const n=document.querySelectorAll('#osk').length;
        if(!e||!bd)return {n,id:OSK.cur&&OSK.cur.id};const a=e.getBoundingClientRect(),q=bd.getBoundingClientRect();
        const ov=Math.max(0,Math.min(a.right,q.right)-Math.max(a.left,q.left))*Math.max(0,Math.min(a.bottom,q.bottom)-Math.max(a.top,q.top));return {n,ov,id:OSK.cur&&OSK.cur.id,turn:G.turn}});
      if(o.ov>4)overlap++;if(o.id&&!tips.has(o.id)&&['lay','chain','gate','sail'].includes(o.id))await p.screenshot({path:path.join(__dirname,'..','playtest','coach-'+o.id+'-'+W+'.png')}).catch(()=>{});if(o.n>1)multi++;if(o.id&&!tips.has(o.id)){tips.add(o.id);first[o.id]=o.turn}
      if(a==='WALK-END')break;
      if(a===''||a==='over-wait'){idle++;await p.waitForTimeout(400);if(idle>120){bad(tag+' stuck '+JSON.stringify(seen));break}}else idle=0;
      await p.waitForTimeout(150)}
    const r=await p.evaluate(()=>({said:OSK.said,later:OSK.later,rules:OSK_RULES,walk:OSK.walk&&OSK.walk.steps.map(s=>s[0]+': '+s[1]),over:G&&G.over,turn:G&&G.turn}));
    await p.screenshot({path:path.join(__dirname,'..','playtest','coach-end-'+W+'.png')}).catch(()=>{});
    if(forced.goal){tips.add('goal');first.goal=0}if(r.walk){tips.add('end');first.end=r.turn}   // the intro step states the goal; the walk's 3rd card states the end rule with the real result
    const miss=r.rules.filter(id=>!r.said[id]||r.said[id]==='queued');const inGame=r.rules.filter(id=>tips.has(id));const lateOnly=r.rules.filter(id=>!tips.has(id)&&r.later.includes(id));const miss2=r.rules.filter(id=>!tips.has(id)&&!r.later.includes(id));if(miss2.length)bad(tag+' rules neither seen on screen nor on the later card: '+miss2.join(','));
    console.log(tag,miss.length?'FAIL':'PASS','rules explained',(r.rules.length-miss.length)+'/'+r.rules.length,'in game',inGame.length,'later card',r.later.length,'turns',r.turn,'tips',tips.size,'taps',JSON.stringify(seen));
    console.log('  seen on screen (rule: turn):',JSON.stringify(first),' later card:',r.later.join(','));if(r.walk)console.log('  walk:',r.walk.slice(0,3).join(' || '));
    if(forced.n>2)bad(tag+' more than 2 forced taps: '+forced.n);else console.log(tag,'PASS forced taps',forced.n);if(miss.length)bad(tag+' rules never explained: '+miss.join(','));if(!r.walk)bad(tag+' result walk not reached');
    if(overlap)bad(tag+' Osk bubble over the board '+overlap+'x');if(multi)bad(tag+' more than one bubble '+multi+'x');
    if(errs.length)bad(tag+' console errors: '+errs.slice(0,3).join(' | '));else console.log(tag,'PASS 0 console errors');
    // the last card's button leaves cleanly to the title
    const fin=p.locator('#oskwalk [data-osk=again],#oskwalk [data-osk=chapter]').first();if(await fin.count()){await tapEl(p,fin,touch);await p.waitForTimeout(800);
      const d=await p.evaluate(()=>({done:GXT.isDone('tidewake'),on:OSK.on}));if(!d.done||d.on)bad(tag+' finishing did not mark the tutorial done '+JSON.stringify(d))}
    await c.close()}
  await b.close();process.exit(fail?1:0)})();
