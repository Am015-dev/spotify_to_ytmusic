// K-turn ("turn around") test (W486). Logic: the ship flies forward, then ends facing the way it came.
// Dial: tapping a move on the dial grid picks it.
// Visual (needs GX_URL, e.g. GX_URL=http://127.0.0.1:8765): on a 390x844 touch phone, the dial icon's arrowhead, the ghost's nose
// and the 3D ghost ship all point BACK down the screen for a K-turn, and forward for a straight.  Run: node reverse-test.js
const fs=require('fs'),vm=require('vm'),path=require('path');let fails=0;const ok=(c,m)=>{if(!c){fails++;console.log('FAIL '+m)}else console.log('ok   '+m)};
const C={console,Math,Date,JSON};vm.createContext(C);for(const f of ['geo','data','exp'])vm.runInContext(fs.readFileSync(path.join(__dirname,f+'.js'),'utf8'),C,{filename:f});
const r=s=>vm.runInContext(s,C);
for(const sp of [3,4,5]){const p=r(`finalPose({x:400,y:100,h:Math.PI/2},40,{s:${sp},t:'K',d:0})`);
  ok(Math.abs(Math.abs(p.h)-Math.PI/2)<1e-6&&p.h<0,`K${sp}: ends facing back (h=${p.h.toFixed(3)})`);
  ok(Math.abs(p.y-(100+40+40*sp))<1e-6&&Math.abs(p.x-400)<1e-6,`K${sp}: moves forward ${40*sp} mm plus one base before turning`)}
const s3=r(`finalPose({x:400,y:100,h:Math.PI/2},40,{s:3,t:'S',d:0})`);ok(Math.abs(s3.h-Math.PI/2)<1e-6,'straight 3 keeps its facing');

// (12 Nov, owner bug) every move arrow is drawn relative to the ship's CURRENT facing: for every maneuver on every dial and 8 facings
// (incl. reversed after a K-turn), the drawn arrow (ship rotation + glyph direction) must point where the ship's nose ends up.
{const uiSrc=fs.readFileSync(path.join(__dirname,'ui.js'),'utf8');const grab=n=>{const i=uiSrc.indexOf('function '+n+'(');const r=uiSrc.slice(i);const m=/\n(function |const |\/\/ )/.exec(r.slice(1));return r.slice(0,m.index+1)};
  r('var V3={on:false};'+grab('shipDeg')+grab('rotIco'));
  const GLYPH={'↑':0,'↖':-45,'↗':45,'↰':-90,'↱':90};const ARROW={T:['↰','↱'],B:['↖','↗'],S:['↑','↑']};
  const scr=h=>Math.atan2(Math.cos(h),Math.sin(h))*180/Math.PI;const dn=a=>((a%360)+540)%360-180;
  let n=0,bad=[];const ships=r('Object.keys(SHIPS)');
  for(const t of ships)for(let k=0;k<8;k++){const h=-Math.PI+k*Math.PI/4;const s={x:450,y:450,h,base:'S'};const deg=r(`shipDeg(${JSON.stringify(s)})`);const dial=r(`SHIPS.${t}.dial`);
    for(const m of dial){if(!m.s)continue;const p=r(`finalPose(${JSON.stringify(s)},40,${JSON.stringify(m)})`);const g=m.t==='K'?180:GLYPH[(ARROW[m.t]||ARROW.S)[m.d>0?1:0]];
      const drawn=deg+g,actual=scr(p.h);n++;if(Math.abs(dn(drawn-actual))>1)bad.push(`${t} h=${(h*180/Math.PI).toFixed(0)} ${m.t}${m.s}${m.d||''}: arrow ${dn(drawn).toFixed(0)} vs nose ${actual.toFixed(0)}`);
      // and the ship really goes the way the arrow's shaft starts: its displacement is in front of the current nose
      const fx=Math.cos(h),fy=Math.sin(h);if((p.x-s.x)*fx+(p.y-s.y)*fy<=0)bad.push(`${t} ${m.t}${m.s}: moves backwards`)}}
  ok(!bad.length,`arrows follow the ship's facing: ${n} maneuver x facing checks${bad.length?' '+bad.slice(0,3).join('; '):''}`);
  const h0=r(`rotIco('↑',{x:0,y:0,h:-Math.PI/2})`);ok(/rotate\(180deg\)/.test(h0),'a reversed ship draws "straight" pointing down the screen')}
(async()=>{if(!process.env.GX_URL){console.log('skip visual part (set GX_URL)');process.exit(fails?1:0)}
  const {chromium}=require('playwright');const xp=fs.existsSync('/opt/pw-browsers/chromium')?{executablePath:'/opt/pw-browsers/chromium'}:{};const b=await chromium.launch(xp);const c=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});const p=await c.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto(process.env.GX_URL+'/nebula-aces/');await p.waitForTimeout(3500);
  const tap=async sel=>{const l=p.locator(sel).filter({visible:true}).first();const bb=await l.boundingBox();await p.touchscreen.tap(bb.x+bb.width/2,bb.y+bb.height/2);await p.waitForTimeout(900)};
  await tap('[data-start]');await p.waitForTimeout(2000);if(await p.locator('[data-bf=brief]').filter({visible:true}).count())await tap('[data-bf=brief]');
  await p.waitForTimeout(1500);await tap('.bfring.need');
  const kI=await p.evaluate(()=>dialOf(ship(BF.sel)).findIndex(m=>m.t==='K'));ok(kI>=0,'player ship has a K-turn on its dial');
  // the icon: the arrowhead (filled path) sits low in the box, the shaft's arc top high: the head points down
  const head=await p.evaluate(i=>{const k=BF.dlist.findIndex(o=>o.i===i);const el=document.querySelector(`#bfdial .ditem[data-k="${k}"] svg.kico`);if(!el)return null;const ps=el.querySelectorAll('path');const a=ps[0].getBBox(),h=ps[1].getBBox();return {arcTop:a.y,headMid:h.y+h.height/2,headTipBelow:h.y+h.height>a.y+a.height-0.5}},kI);
  ok(head&&head.headMid>8&&head.headTipBelow,'dial icon for the K-turn: arrowhead points down (backwards) '+JSON.stringify(head));
  const noseDir=async()=>p.evaluate(()=>{const ns=[...document.querySelectorAll('#bf path.bfnose')].map(n=>n.getBBox());const gs=[...document.querySelectorAll('#bf path.bfp.ghost')].map(n=>n.getBBox());if(!ns.length||!gs.length)return null;
    const g=gs[0],gc=g.y+g.height/2;let best=ns[0],bd=1e9;for(const n of ns){const d=Math.hypot(n.x+n.width/2-(g.x+g.width/2),n.y+n.height/2-gc);if(d<bd){bd=d;best=n}}return (best.y+best.height/2)-gc});
  // the phone dial is a grid of moves: tap the move's cell, then lock it
  const pickK=async i=>{const xy=await p.evaluate(i=>{const k=BF.dlist.findIndex(o=>o.i===i);const e=document.querySelector(`#bfdial .ditem[data-k="${k}"]`);if(!e)return null;const r=e.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2]},i);
    if(xy)await p.touchscreen.tap(...xy);await p.waitForTimeout(300);
    ok(await p.evaluate(i=>UI.draft[BF.sel]===i,i),'tapping the move on the dial picks move '+i);await tap('[data-bf=dlock]')};
  await pickK(kI);const dk=await noseDir();ok(dk!=null&&dk>0,`K-turn ghost nose points back down the screen (dy=${dk&&dk.toFixed(1)})`);
  const g3=await p.evaluate(()=>{const g=(BF.g3||[])[0];return g?Math.cos(g.rotation.y-G.ships.find(s=>s.side===0).h):null});ok(g3!=null&&g3<-0.99,'3D ghost ship is turned around ('+g3+')');
  await tap('.bfring.done, .bfring.need');const sI=await p.evaluate(()=>dialOf(ship(BF.sel)).findIndex(m=>m.t==='S'&&m.s===2));await pickK(sI);
  const ds=await noseDir();ok(ds!=null&&ds<0,`straight-2 ghost nose points forward up the screen (dy=${ds&&ds.toFixed(1)})`);
  // (12 Nov) reverse the ship (as after a K-turn) and check EVERY dial arrow on screen against where its ghost's nose ends, projected
  await tap('[data-bf=dclose]').catch(()=>{});
  const rv=await p.evaluate(()=>{const s=G.ships.find(x=>x.side===0);s.h=normA(s.h+Math.PI);UI.sugCache=null;/* no cache reset: the dial must notice the new facing by itself */render();return s.id});await p.waitForTimeout(900);
  await tap('.bfring.need, .bfring.done, .bfring');await p.waitForTimeout(600);
  const chk=await p.evaluate(()=>{const s=ship(BF.sel);const GL={'↑':0,'↖':-45,'↗':45,'↰':-90,'↱':90};const P=(x,y)=>{const v=W(x,y,0).project(V3.camera);return [v.x,-v.y]};const out=[];
    BF.dlist.forEach((o,k)=>{const el=document.querySelector(`#bfdial .ditem[data-k="${k}"] .mva`);if(!el){out.push('no arrow '+k);return}const g=el.querySelector('svg.kico')?180:GL[el.textContent.trim()];const drawn=+el.dataset.deg+g;
      const q=finalPose(s,B(s),o.m),f={x:Math.cos(q.h),y:Math.sin(q.h)};const a=P(q.x,q.y),b=P(q.x+f.x*30,q.y+f.y*30);const want=Math.atan2(b[0]-a[0],-(b[1]-a[1]))*180/Math.PI;const d=((drawn-want)%360+540)%360-180;if(Math.abs(d)>20)out.push(mvWords(o.m)+': arrow '+drawn+' vs nose '+want.toFixed(0))});
    const sDeg=shipDeg(s);return {n:BF.dlist.length,bad:out,sDeg}});
  ok(chk.n>0&&!chk.bad.length,`reversed ship: all ${chk.n} dial arrows point where the ghost's nose ends (ship at ${chk.sDeg} deg) ${chk.bad.slice(0,3).join('; ')}`);
  const en=await p.evaluate(()=>G.ships.filter(x=>x.side===1&&x.alive).map(e=>{const P=(x,y)=>{const v=W(x,y,0).project(V3.camera);return [v.x,-v.y]};const a=P(e.x,e.y),b=P(e.x+Math.cos(e.h)*30,e.y+Math.sin(e.h)*30);const want=Math.atan2(b[0]-a[0],-(b[1]-a[1]))*180/Math.PI;const d=((shipDeg(e)-want)%360+540)%360-180;return Math.abs(d)}));
  ok(en.length&&en.every(d=>d<3),'enemy move chips rotate with each enemy ship ('+en.map(d=>d.toFixed(1)).join(',')+')');
  const chip=await p.evaluate(()=>{const e=G.ships.find(x=>x.side===1&&x.alive);const h=document.createElement('div');h.innerHTML=(function(){const m=dialOf(e).find(m=>m.t==='S');return rotIco('↑',e)})();return +h.querySelector('.mva').dataset.deg===shipDeg(e)});ok(chip,'enemy chip arrow uses the enemy ship facing');
  ok(!errs.length,'no page errors '+errs.slice(0,2));await b.close();process.exit(fails?1:0)})();
