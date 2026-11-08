// UI-only play-through: a Quick game and Story chapter 1 played to the result at 390x763 by tapping only visible, uncovered UI (touch taps at element centres).
//   node ui-play-test.js [html]   Exit code 1 on failure. Reads state (G.over) but never calls engine functions to act.
const PW=(()=>{try{return require('playwright')}catch(e){return require('/opt/node-tools/node_modules/playwright')}})();
const gx=require('../../scripts/gx-serve.js');const path=require('path');
const FILE=process.argv[2]||path.join(__dirname,'tidewake.html');
let fail=0;const bad=m=>{fail++;console.log('FAIL',m)};
async function tapEl(p,loc){const b=await loc.boundingBox();if(!b)return false;const x=b.x+b.width/2,y=b.y+b.height/2;
  const top=await p.evaluate(([x,y,sel])=>{const e=document.elementFromPoint(x,y);return !!e},[x,y]);if(!top)return false;await p.touchscreen.tap(x,y);return true}
// one decision per call: returns what it tapped (or '')
async function step(p){
  const vis=async sel=>{const l=p.locator(sel+':visible');return (await l.count())?l.first():null};
  let e;
  for(const sel of ['[data-a=sunkok]','[data-ph=dismiss]','[data-a=q]','.gxh-btn:has-text("Got it")','button:has-text("Got it")','[data-ph=showover]']){if((e=await vis(sel))&&await tapEl(p,e))return sel}
  if(e=await vis('[data-a=startmark]')){if(await tapEl(p,e))return 'startmark'}
  const st=await p.evaluate(()=>({over:!!(G&&G.over),phase:G&&G.phase,busy:!!UI.busy,me:typeof sideToAct==='function'?sideToAct():-9,place:!!document.querySelector('[data-a=place]:not([disabled])')}));
  if(st.over)return 'OVER';
  if(st.phase==='setup'&&!st.busy&&st.me===0){
    const pt=await p.evaluate(()=>{const si=startInfo(0);const o=si[Math.floor(si.length/2)];const q=hproj(o.w[0],o.w[1]);return q?{x:q.x,y:q.y}:null});
    if(pt){const r=await p.evaluate(([x,y])=>{const e=document.elementFromPoint(x,y);return e?e.tagName:''},[pt.x,pt.y]);await p.touchscreen.tap(pt.x,pt.y);return 'mark@'+r}}
  if(e=await vis('[data-a=card]')){
    // try each tile and each turn until Place is enabled, then tap Place
    const n=await p.locator('[data-a=card]:visible').count();
    for(let t=0;t<n;t++){const c=p.locator('[data-a=card]:visible').nth(t);if(!await tapEl(p,c))continue;
      for(let r=0;r<4;r++){const pl=await vis('[data-a=place]:not([disabled])');if(pl){await tapEl(p,pl);return 'place'}
        const tr=await vis('[data-a=rot][data-d="1"]');if(!tr||!await tapEl(p,tr))break;await p.waitForTimeout(120)}}
    const sk=await vis('[data-a=pass]');if(sk&&await tapEl(p,sk))return 'pass';
  }
  if(e=await vis('[data-a=skip]')){return 'wait'}
  return ''}
async function drive(p,name,maxMs){const t0=Date.now();let idle=0,last='';const seen={};
  while(Date.now()-t0<maxMs){const a=await step(p);seen[a]=(seen[a]||0)+1;if(a==='OVER'){return {ok:true,seen}}
    if(a===''||a==='wait'){idle++;await p.waitForTimeout(500);if(idle>60){bad(name+': stuck '+JSON.stringify(seen));return {ok:false,seen}}}else idle=0;
    await p.waitForTimeout(250)}
  bad(name+': timeout '+JSON.stringify(seen));return {ok:false,seen}}
(async()=>{
  const url=await gx.url('tidewake',{file:FILE,query:'?2d'});
  const b=await PW.chromium.launch();
  for(const mode of ['quick','story']){
    const c=await b.newContext({viewport:(([w,h])=>({width:w,height:h}))((process.env.SIZE||"390x763").split("x").map(Number)),hasTouch:true,isMobile:true});const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&errs.push(m.text()));
    await p.goto(url);await p.waitForTimeout(1500);
    try{await p.evaluate(()=>{localStorage.setItem('tw_played','1');localStorage.setItem('tw_offered','1');localStorage.setItem('gxt-tidewake','{"done":1}')});await p.reload();await p.waitForTimeout(1500)}catch(e){}
    if(mode==='quick'){const pl=p.getByText('Quick game: you vs 2 computers');await pl.tap();await p.waitForTimeout(800)}
    else{await p.locator('button:has-text("Story")').first().tap();await p.waitForTimeout(1500);
      await p.locator('.gxc-node.next, .gxc-node.open').first().tap();await p.waitForTimeout(1200);
      // intro scenes (portrait + lines): tap the visible primary buttons until the board is up
      for(let i=0;i<16;i++){const up=await p.evaluate(()=>typeof G!=='undefined'&&!!G&&!!G.phase&&!!UI.started&&!document.querySelector('.gxc'));if(up)break;
        const bt=p.locator('.gxc button:visible').filter({hasNotText:/Back|Close|Skip|×|‹/});
        if(!await bt.count()){await p.waitForTimeout(500);continue}await bt.last().tap();await p.waitForTimeout(800)}}
    const r=await drive(p,mode,240000);
    console.log(mode,r.ok?'PASS':'FAIL',JSON.stringify(r.seen),errs.length?'ERR '+errs.slice(0,2):'0 console errors');if(errs.length)bad(mode+' console errors');
    await p.screenshot({path:path.join(__dirname,'out-'+mode+'.png')}).catch(()=>{});await c.close()}
  await b.close();process.exit(fail?1:0)})();
