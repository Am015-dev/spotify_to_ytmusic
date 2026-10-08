// tR1.js: R1 probe (852x393). Fresh story save in a city → roam; measures HUD boxes (tutorial card, Hilde radio card #npcSay, boost bar, touch
// controls, car on screen), lamp heights, and the auto vehicle on grass at ~100 km/h. Keyboard driving, frame-stepped rAF.
// usage: node tools/tR1.js <url> <outdir> <fra|ath> [touch]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const path=require('path');
const URL=process.argv[2],OUT=process.argv[3]||'qa_r1',CITY=process.argv[4]||'fra',TOUCH=process.argv[5]==='touch';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const ctx=await b.newContext({viewport:{width:852,height:393},deviceScaleFactor:1,hasTouch:TOUCH,isMobile:TOUCH});const p=await ctx.newPage();p.setDefaultTimeout(900000);
 const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text().slice(0,200))});
 await ctx.addInitScript(`(()=>{const q=[];let t=0;window.requestAnimationFrame=cb=>{q.push(cb);return q.length};window.__auto=true;window.__tick=n=>{for(let i=0;i<n;i++){t+=1000/60;const c=q.splice(0);for(const f of c)try{f(t)}catch(e){setTimeout(()=>{throw e})}}};setInterval(()=>{if(window.__dbg&&!window.__fr&&!window.__sh){window.__fr=__dbg.composer.render;__dbg.composer.render=()=>{}}if(window.__auto)__tick(1)},16)})()`);
 await p.goto(URL);await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000,polling:500});
 await p.evaluate(c=>{localStorage.clear();localStorage.setItem('mho_slot','1');if(c==='ath'){localStorage.setItem('mho_city@1','ath');localStorage.setItem('mho_athpre','1')}},CITY);await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:300000,polling:500});
 const shot=async n=>{await p.evaluate(()=>{window.__sh=1;if(window.__fr){__dbg.composer.render=window.__fr;window.__fr=null}__tick(1)});await p.screenshot({path:path.join(OUT,n+'.png')});await p.evaluate(()=>{window.__sh=0})};
 if(process.env.RACE){await p.evaluate(()=>{window.__auto=false;__tick(5)});await shot('menu');const m=await p.evaluate(()=>({menuMood:__oc.ev('menuMood'),store:localStorage.getItem('mho_mood')}));console.log('MENU',JSON.stringify(m));
   await p.evaluate(()=>{window.__auto=true});const go=await p.$('#hcQuick, #qGo, #goBtn');console.log('go?',!!go);
 }
 await p.click('#hcStory');await p.waitForTimeout(300);await p.click('#slotList .go');await p.waitForFunction(()=>__mho.state==='roam',null,{timeout:300000,polling:1000});await p.evaluate(()=>{window.__auto=false});
 for(let i=0;i<40;i++){await p.evaluate(()=>{__tick(10);if(__m1.cs())__m1.skip();for(const s of['#storyGo','#rcGo','.m1go']){const e=document.querySelector(s);if(e&&!e.hidden&&e.offsetWidth)e.click()}})}
 const boxes=()=>p.evaluate(()=>{const r=s=>{const e=document.querySelector(s);if(!e||e.hidden)return null;const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity===0)return null;const b=e.getBoundingClientRect();return b.width?{x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)}:null};
   const ctl=[...document.querySelectorAll('#touch button, #touch .tb, #touch [id]')].map(e=>{const b=e.getBoundingClientRect();return b.width&&getComputedStyle(e).visibility!=='hidden'?{id:e.id||e.className,x:Math.round(b.x),y:Math.round(b.y),w:Math.round(b.width),h:Math.round(b.height)}:null}).filter(Boolean);
   let car=null;try{const P=__oc.ev('pl');const v=P.mesh.position.clone();v.project(__dbg.camera);car={x:Math.round((v.x+1)/2*innerWidth),y:Math.round((1-v.y)/2*innerHeight)}}catch(e){car=String(e).slice(0,60)}
   return{tut:r('#roamTut'),npc:r('#npcSay'),gauge:r('#roamGauge'),rgBar:r('#rgBar'),car,ctl,veh:__mho.RO.veh,vsel:__mho.RO.vsel,terr:__mho.RO.terr,kmh:Math.round(__mho.RO.v*3.6),touch:document.body.classList.contains('touch')}});
 await shot(CITY+'_start');console.log('START',JSON.stringify(await boxes()));
 // lamps: world height of lamp props
 console.log('LAMP',JSON.stringify(await p.evaluate(()=>__oc.ev(`(()=>{const D=HUB.ptypes;if(!D||!D.lamp)return null;D.lamp.g.computeBoundingBox();const bb=D.lamp.g.boundingBox;const L=HUB.props.filter(q=>q.t==='lamp');let sc=null;if(L[0]&&L[0].im){const m=new THREE.Matrix4();L[0].im.getMatrixAt(L[0].i,m);const s=new THREE.Vector3();m.decompose(new THREE.Vector3(),new THREE.Quaternion(),s);sc=s.y}return{h:+(bb.max.y-bb.min.y).toFixed(2),n:L.length,instScaleY:sc,col:D.lamp.cols}})()`))));
 // Hilde radio card mid-turn
 await p.keyboard.down('ArrowUp');for(let i=0;i<8;i++)await p.evaluate(()=>__tick(15));await p.keyboard.down('ArrowLeft');await p.evaluate(()=>{__tick(10);__oc.ev(`M1_radio('HILDE','Keep your speed up through the bends, dear. Lift a little, then GAS out of the turn.')`)});await p.evaluate(()=>__tick(10));
 await shot(CITY+'_hilde_turn');console.log('HILDE',JSON.stringify(await boxes()));await p.keyboard.up('ArrowLeft');
 if(process.env.GRASS){ // drive onto grass at speed: warp beside the road onto open ground, push to ~100 km/h, log veh each 10 frames
   const g=await p.evaluate(()=>__oc.ev(`(()=>{for(let k=0;k<4000;k++){const x=RO.x+(Math.random()-.5)*1200,z=RO.z+(Math.random()-.5)*1200;const T=roamTerr(x,z,999);if(FL_raw(T,T.g)==='dirt'){let ok=true;for(let d=10;d<=160;d+=10){const xx=x+Math.sin(0)*d,zz=z+d,TT=roamTerr(xx,zz,999);if(FL_raw(TT,TT.g)!=='dirt'||Math.abs(TT.g-T.g)>3){ok=false;break}}if(ok){__m1.warp(x,z,0);return{x,z}}}}return null})()`));
   console.log('GRASSAT',JSON.stringify(g));await p.evaluate(()=>{__mho.RO.v=28});const log=[];for(let i=0;i<24;i++){await p.evaluate(()=>__tick(10));log.push(await p.evaluate(()=>[__mho.RO.veh,__mho.RO.terr,Math.round(__mho.RO.v*3.6)]));if(i===12)await shot(CITY+'_grass_speed')}
   console.log('GRASS',JSON.stringify(log),'swaps',JSON.stringify(await p.evaluate(()=>__oc.ev('FL.log.slice(-6)'))));}
 await p.keyboard.up('ArrowUp');console.log('ERRS',JSON.stringify(errs));await b.close()})().catch(e=>{console.error('ERR',e);process.exit(1)});
