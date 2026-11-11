// board-first checks at 4 sizes with real WebGL: no page scroll, board uncovered, popups open/close, dock shows decisions; screenshots
// node lay.js '{"np":3,"ex":{"prism":true}}' TAG [sizes]
const {chromium}=require(process.env.PW);const CFG=JSON.parse(process.argv[2]||'{}');const TAG=process.argv[3]||'b';
const SIZES=(process.argv[4]||'1366x768,1920x1080,768x1024,390x844').split(',').map(s=>s.split('x').map(Number));
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});let bad=0;
for(const [w,h] of SIZES){const t=TAG+'_'+w+'x'+h;const p=await b.newPage({viewport:{width:w,height:h}});p.setDefaultTimeout(150000);const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/CERT|fonts|ERR_/.test(m.text())&&errs.push(m.text()));
  await p.goto('file://'+__dirname+'/sunglaze.html');await p.waitForTimeout(900);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}setSeed(11);AIDELAY=80});
  const scroll=async tag=>{const r=await p.evaluate(()=>({h:document.documentElement.scrollHeight,w:document.documentElement.scrollWidth,vh:innerHeight,vw:innerWidth}));if(!(r.h<=r.vh+1&&r.w<=r.vw+1)){bad++;console.log(t,tag,'SCROLL',JSON.stringify(r))}};
  const cover=async tag=>{const r=await p.evaluate(()=>{const cv=document.querySelector('#c3');const R=cv.getBoundingClientRect();let hit=0,tot=0,what={};for(let i=1;i<=5;i++)for(let j=1;j<=5;j++){const e=document.elementFromPoint(R.left+R.width*i/6,R.top+R.height*j/6);tot++;if(e===cv||e&&e.closest('#chip'))hit++;else{const k=e?(e.id||e.className||e.tagName):'none';what[k]=(what[k]||0)+1}}
      return {hit,tot,what,three:document.body.classList.contains('three'),inside:R.top>=0&&R.left>=0&&R.bottom<=innerHeight+1&&R.right<=innerWidth+1,area:Math.round(R.width*R.height/(innerWidth*innerHeight)*100),layout:V3.L&&V3.L.name}});
    if(r.hit<r.tot||!r.inside||!r.three){bad++;console.log(t,tag,'COVERED',JSON.stringify(r))}return r};
  await scroll('start');await p.screenshot({path:`shots/${t}_0start.png`});
  await p.evaluate(c=>{UI.setup.np=c.np||3;Object.assign(UI.setup.ex,c.ex||{});for(let i=1;i<4;i++)UI.setup.seats[i]='ai';if(c.hot)for(let i=0;i<UI.setup.np;i++)UI.setup.seats[i]='human'},CFG);await p.click('[data-ui=start]');await p.waitForTimeout(700);
  await scroll('story');await p.screenshot({path:`shots/${t}_1story.png`});await p.click('[data-ui=story-ok]');await p.waitForTimeout(2500);
  await scroll('play');const c=await cover('play');await p.screenshot({path:`shots/${t}_2table.png`});
  for(const id of ['plrd','logd','refd','rulesd']){await p.click(`.gx-bar [data-gx="${id}"]`);await p.waitForTimeout(700);const on=await p.evaluate(i=>document.getElementById(i).classList.contains('on'),id);if(id==='refd'||id==='plrd')await p.screenshot({path:`shots/${t}_3${id}.png`});await scroll('popup '+id);
    if(id==='logd')await p.keyboard.press('Escape');else if(id==='rulesd')await p.mouse.click(w-5,w<1000?30:h-5);else await p.click(`#${id} .gx-x`);await p.waitForTimeout(500);const off=await p.evaluate(i=>!document.getElementById(i).classList.contains('on'),id);if(!on||!off){bad++;console.log(t,'popup',id,on,off)}}
  // play as the human through the real page: tap a tile in 3D, then a rack (3D or dock), then Place; try the advisor once
  let turns=0,shotPrev=false,shotAdv=false,shotWall=false,miss3d=0;for(let k=0;k<400&&turns<(CFG.turns||6);k++){const s=await p.evaluate(()=>({hp:!!me(),phase:G.phase,over:!!G.over,sel:!!UI.sel,tgt:UI.tgt,dock:getComputedStyle(document.querySelector('.gx-dock')).visibility,body:getComputedStyle(document.querySelector('.gx-dock-body')).display}));
    if(s.over)break;if(!s.hp){await p.waitForTimeout(300);continue}if(s.dock!=='visible'||s.body==='none'){bad++;console.log(t,'dock hidden on decision');break}
    if(s.phase==='wall'){if(!shotWall){await p.waitForTimeout(900);await p.screenshot({path:`shots/${t}_6wall.png`});shotWall=true}const bs=await p.$$('#dockbody button[data-mv]');await bs[0].click();await p.waitForTimeout(300);continue}
    if(!s.sel){if(!shotAdv&&turns===1){await p.click('#dockbody [data-ui=advise]');await p.waitForTimeout(1500);await scroll('advice');await p.screenshot({path:`shots/${t}_5advice.png`});shotAdv=true;await p.click('#dockbody .adv [data-mv]');turns++;await p.waitForTimeout(400);continue}
      const sl=await p.evaluate(()=>{const H=UI.hl.src||[];const s0=H[0];if(!s0)return null;const a=s0.src<0?G.ctr:G.fac[s0.src];const k=a.findIndex(t=>t!==PRISM);return s0.src<0?'c_'+Math.max(0,k):'f'+s0.src+'_'+Math.max(0,k)});
      await p.waitForFunction(()=>V3idle(),null,{timeout:20000}).catch(()=>{});
      const pt=await p.evaluate(sl=>{const v=slotScreen(sl);const R=V3.r.domElement.getBoundingClientRect();return {x:R.left+v.x,y:R.top+v.y}},sl);await p.mouse.click(pt.x,pt.y);await p.waitForTimeout(500);
      if(!(await p.evaluate(()=>!!UI.sel))){miss3d++;await p.click('#dockbody [data-pick]')}await p.waitForTimeout(300);continue}
    if(s.tgt==null){const ln=await p.$$('#dockbody [data-line]');await ln[0].click();await p.waitForTimeout(900);continue}
    if(!shotPrev){await p.waitForTimeout(1200);await scroll('preview');await cover('preview');await p.screenshot({path:`shots/${t}_4preview.png`});shotPrev=true}
    await p.click('#dockbody .btn.go[data-mv]');turns++;await p.waitForTimeout(400)}
  await p.waitForTimeout(1500);await p.screenshot({path:`shots/${t}_7later.png`});
  await p.evaluate(()=>GX.toggleDock(false));await p.waitForTimeout(4000);await cover('dockmin');await scroll('dockmin');await p.screenshot({path:`shots/${t}_8min.png`});await p.evaluate(()=>GX.toggleDock(true));
  console.log(t,'layout',c.layout,'board',c.area+'% of screen','turns',turns,'3D taps missed',miss3d,'errors',JSON.stringify(errs.slice(0,3)));if(errs.length)bad++;await p.close()}
console.log('PROBLEMS',bad);await b.close()})()
