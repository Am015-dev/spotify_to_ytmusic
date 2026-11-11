// board-first checks at 4 sizes with real WebGL: no page scroll, board uncovered, popups open/close, dock shows decisions; screenshots
const {chromium}=require(process.env.PW);const EX=JSON.parse(process.argv[2]||'{}');const TAG=process.argv[3]||'b';
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});let bad=0;
for(const [w,h] of [[1366,768],[1920,1080],[768,1024],[390,844]]){const t=TAG+'_'+w+'x'+h;const p=await b.newPage({viewport:{width:w,height:h}});p.setDefaultTimeout(150000);const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/CERT|fonts/.test(m.text())&&errs.push(m.text()));
  await p.goto('file://'+__dirname+'/sands.html');await p.waitForTimeout(900);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}setSeed(7);AIDELAY=60});
  const scroll=async tag=>{const r=await p.evaluate(()=>({h:document.documentElement.scrollHeight,w:document.documentElement.scrollWidth,vh:innerHeight,vw:innerWidth}));if(!(r.h<=r.vh+1&&r.w<=r.vw+1)){bad++;console.log(t,tag,'SCROLL',JSON.stringify(r))}};
  const cover=async tag=>{const r=await p.evaluate(()=>{const cv=document.querySelector('#c3');const R=cv.getBoundingClientRect();let hit=0,tot=0,what={};for(let i=1;i<=5;i++)for(let j=1;j<=5;j++){const e=document.elementFromPoint(R.left+R.width*i/6,R.top+R.height*j/6);tot++;if(e===cv||e&&e.closest('#chip'))hit++;else{const k=e?(e.id||e.className||e.tagName):'none';what[k]=(what[k]||0)+1}}
      return {hit,tot,what,three:document.body.classList.contains('three'),inside:R.top>=0&&R.left>=0&&R.bottom<=innerHeight+1&&R.right<=innerWidth+1,area:Math.round(R.width*R.height/(innerWidth*innerHeight)*100)}});
    if(r.hit<r.tot||!r.inside||!r.three){bad++;console.log(t,tag,'COVERED',JSON.stringify(r))}return r};
  await scroll('start');await p.screenshot({path:`shots/${t}_0start.png`});
  await p.evaluate(ex=>{Object.assign(UI.setup.ex,ex);UI.setup.np=ex.np||3},EX);await p.click('[data-ui=play]');await p.waitForTimeout(300);await p.click('[data-ui=start]');await p.waitForTimeout(1500);
  await scroll('bid');const c=await cover('bid');await p.screenshot({path:`shots/${t}_1bid.png`});
  for(const id of ['plrd','djd','logd','refd','rulesd']){if(await p.isVisible(`.gx-bar [data-gx="${id}"]`))await p.click(`.gx-bar [data-gx="${id}"]`);else{await p.click('.gx-bar [data-gx="menud"]');await p.waitForTimeout(600);await p.click(`#menud [data-gx="${id}"]`)}await p.waitForTimeout(700);const on=await p.evaluate(i=>document.getElementById(i).classList.contains('on'),id);if(id==='refd'||id==='plrd')await p.screenshot({path:`shots/${t}_2${id}.png`});await scroll('popup '+id);
    if(id==='logd')await p.keyboard.press('Escape');else await p.click(`#${id} .gx-x`);await p.waitForTimeout(500);const off=await p.evaluate(i=>!document.getElementById(i).classList.contains('on'),id);if(!on||!off){bad++;console.log(t,'popup',id,on,off)}}
  // play as the human via real clicks until a movement is in hand, then a few turns
  let shotMove=false,shotAct=false;for(let k=0;k<200;k++){const s=await p.evaluate(()=>{const hp=me();return {hp:!!hp,step:G.step,phase:G.phase,hand:G.move&&G.move.hand.length,pick:UI.pick.slice(),over:!!G.over,dock:getComputedStyle(document.querySelector('.gx-dock')).visibility}});
    if(s.over)break;if(!s.hp){await p.waitForTimeout(250);continue}if(s.dock!=='visible'){bad++;console.log(t,'dock hidden on decision');break}
    if(s.phase==='turn'&&s.hand&&!shotMove){await scroll('move');await cover('move');await p.screenshot({path:`shots/${t}_3move.png`});shotMove=true}
    if(s.phase==='turn'&&(s.step==='tribe'||s.step==='tile')&&!shotAct){await p.screenshot({path:`shots/${t}_4act.png`});shotAct=true}
    if(s.pick.length&&!(await p.evaluate(()=>!!G.q))){const i=s.pick[0];const pt=await p.evaluate(i=>{const v=tileScreen(i);const R=V3.r.domElement.getBoundingClientRect();return {x:R.left+v.x,y:R.top+v.y-12}},i);
      // click the tile centre in 3D; fall back to the move button if the pick missed
      const before=await p.evaluate(()=>G.logN+'|'+(G.move&&G.move.hand.length)+'|'+G.step);await p.mouse.click(pt.x,pt.y);await p.waitForTimeout(200);const after=await p.evaluate(()=>G.logN+'|'+(G.move&&G.move.hand.length)+'|'+G.step);
      if(before===after){await p.evaluate(i=>on3DTile(i),i)}continue}
    const bs=await p.$$('#dockbody button[data-mv]:not([disabled])');if(bs.length){await bs[bs.length>1&&Math.random()<.5?1:0].click({timeout:3000}).catch(()=>{});await p.waitForTimeout(150);continue}
    await p.waitForTimeout(200);if(shotMove&&shotAct&&k>60)break}
  await p.evaluate(()=>GX.toggleDock(false));await p.waitForTimeout(600);await cover('dockmin');await p.screenshot({path:`shots/${t}_5min.png`});await p.evaluate(()=>GX.toggleDock(true));
  console.log(t,'board',c.area+'% of screen','errors',errs.slice(0,3));if(errs.length)bad++;await p.close()}
console.log('PROBLEMS',bad);await b.close()})()
