// board-first checks at 4 sizes with real WebGL: no page scroll, board uncovered, popups open/close, dock shows decisions, real taps on the 3D map; screenshots
const {chromium}=require(process.env.PW);const EX=JSON.parse(process.argv[2]||'{"river":true,"ic":true,"tb":true}');const TAG=process.argv[3]||'all';const SIZES=(process.argv[4]||'1366x768,1920x1080,768x1024,390x844').split(',').map(s=>s.split('x').map(Number));
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});let bad=0;
for(const [w,h] of SIZES){const t=TAG+'_'+w+'x'+h;const p=await b.newPage({viewport:{width:w,height:h}});p.setDefaultTimeout(150000);const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>m.type()==='error'&&!/CERT|fonts|ERR_/.test(m.text())&&errs.push(m.text()));
  await p.goto('file://'+__dirname+'/rampart.html');await p.waitForTimeout(900);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}setSeed(7);AIDELAY=40});
  const scroll=async tag=>{const r=await p.evaluate(()=>({h:document.documentElement.scrollHeight,w:document.documentElement.scrollWidth,vh:innerHeight,vw:innerWidth}));if(!(r.h<=r.vh+1&&r.w<=r.vw+1)){bad++;console.log(t,tag,'SCROLL',JSON.stringify(r))}};
  const cover=async tag=>{const r=await p.evaluate(()=>{const cv=document.querySelector('#c3');const R=cv.getBoundingClientRect();let hit=0,tot=0,what={};for(let i=1;i<=5;i++)for(let j=1;j<=5;j++){const e=document.elementFromPoint(R.left+R.width*i/6,R.top+R.height*j/6);tot++;if(e===cv||e&&e.closest('#chip'))hit++;else{const k=e?(e.id||e.className||e.tagName):'none';what[k]=(what[k]||0)+1}}
      return {hit,tot,what,three:document.body.classList.contains('three'),inside:R.top>=0&&R.left>=0&&R.bottom<=innerHeight+1&&R.right<=innerWidth+1,area:Math.round(R.width*R.height/(innerWidth*innerHeight)*100)}});
    if(r.hit<r.tot||!r.inside||!r.three){bad++;console.log(t,tag,'COVERED',JSON.stringify(r))}return r};
  const dockOK=async tag=>{const v=await p.evaluate(()=>{const d=document.querySelector('.gx-dock');const R=d.getBoundingClientRect();return getComputedStyle(d).visibility==='visible'&&R.height>60&&R.bottom<=innerHeight+1});if(!v){bad++;console.log(t,tag,'dock not visible on a decision')}};
  await scroll('start');await p.screenshot({path:`shots/${t}_0start.png`});
  await p.evaluate(ex=>{Object.assign(UI.setup.ex,ex);UI.setup.np=3},EX);await p.click('[data-ui=start]');await p.waitForTimeout(1500);
  await scroll('story');await p.screenshot({path:`shots/${t}_1story.png`});const so=await p.$('[data-ui=storyok]');if(!so){bad++;console.log(t,'no story scene')}else await p.click('[data-ui=storyok]');await p.waitForTimeout(900);
  await scroll('play');const c=await cover('play');await dockOK('place');await p.screenshot({path:`shots/${t}_2place.png`});
  for(const id of ['plrd','logd','refd','rulesd']){const btn=await p.$(`.gx-bar [data-gx="${id}"]`);await btn.scrollIntoViewIfNeeded();await btn.click();await p.waitForTimeout(700);const on=await p.evaluate(i=>document.getElementById(i).classList.contains('on'),id);if(id==='refd'||id==='plrd')await p.screenshot({path:`shots/${t}_3${id}.png`});await scroll('popup '+id);
    if(id==='logd')await p.keyboard.press('Escape');else await p.click(`#${id} .gx-x`);await p.waitForTimeout(500);const off=await p.evaluate(i=>!document.getElementById(i).classList.contains('on'),id);if(!on||!off){bad++;console.log(t,'popup',id,on,off)}}
  // play a few human turns with real taps on the 3D canvas
  let turns=0,shotGhost=false,shotFig=false,shotAdv=false,taps=0,tapMiss=0;
  for(let k=0;k<160&&turns<4;k++){const s=await p.evaluate(()=>({hp:!!me(),step:G.step,over:!!G.over,cells:UI.cells.slice(),ghost:UI.ghost&&UI.ghost.k,spots:UI.spotOpts.map(o=>o.l),k:G.cur&&G.cur.k}));
    if(s.over)break;if(!s.hp){await p.waitForTimeout(200);continue}await dockOK(s.step);
    if(s.step==='place'&&!s.ghost){if(turns===1&&!shotAdv){await p.click('#dockbody [data-a=adv]');await p.waitForTimeout(1500);await p.screenshot({path:`shots/${t}_6advice.png`});shotAdv=true;const ap=await p.$('#dockbody [data-ui=apply]');if(ap){await ap.click();await p.waitForTimeout(600);turns++;continue}}
      const cell=s.cells[Math.floor(s.cells.length/2)];const pt=await p.evaluate(k=>{const [x,y]=unkey(k);const v=screenOf(cellWorld(x,y).setY(TH));const R=V3.r.domElement.getBoundingClientRect();return {x:R.left+v.x,y:R.top+v.y,in:v.in}},cell);
      if(!pt.in){await p.evaluate(k=>{focusCell(k)},cell);await p.waitForTimeout(900);continue}
      await p.mouse.click(pt.x,pt.y);taps++;await p.waitForTimeout(500);const g=await p.evaluate(()=>UI.ghost&&UI.ghost.k);if(!g){tapMiss++;await p.evaluate(k=>on3DTap(k,null),cell)}continue}
    if(s.step==='place'&&s.ghost){const rb=await p.$('#dockbody [data-ui=rotr]');if(rb)await rb.click();await p.waitForTimeout(400);if(!shotGhost){await cover('ghost');await p.screenshot({path:`shots/${t}_4ghost.png`});shotGhost=true}await p.click('#dockbody [data-ui=confirm]');await p.waitForTimeout(700);continue}
    if(s.step==='fig'){if(!shotFig&&s.spots.length){await p.waitForTimeout(400);await cover('fig');await p.screenshot({path:`shots/${t}_5fig.png`});shotFig=true}
      if(s.spots.length&&Math.random()<.7){const l=s.spots[0];const pt=await p.evaluate(({k,l})=>{const v=screenOf(spotWorld(k,l));const R=V3.r.domElement.getBoundingClientRect();return {x:R.left+v.x,y:R.top+v.y}},{k:s.k,l});await p.mouse.click(pt.x,pt.y);taps++;await p.waitForTimeout(500);
        const st=await p.evaluate(()=>G.step==='fig'&&!!me());if(st){tapMiss++;await p.click('#dockbody button[data-mv]')}}
      else await p.click('#dockbody button.go[data-mv]');await p.waitForTimeout(500);turns++;continue}
    await p.waitForTimeout(200)}
  // a computer turn recap is on the dock after the computers play
  await p.waitForTimeout(1200);const recap=await p.evaluate(()=>!!document.querySelector('#dockbody .recap'));if(!recap){bad++;console.log(t,'no recap line for computer turns')}await p.screenshot({path:`shots/${t}_7recap.png`});
  await p.evaluate(()=>GX.toggleDock(false));await p.waitForTimeout(600);await cover('dockmin');await p.screenshot({path:`shots/${t}_8min.png`});await p.evaluate(()=>GX.toggleDock(true));
  console.log(t,'board',c.area+'% of screen','human turns',turns,'3D taps',taps,'missed',tapMiss,'errors',errs.slice(0,3));if(errs.length)bad++;await p.close()}
console.log('PROBLEMS',bad);await b.close()})()
