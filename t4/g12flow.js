// t4/g12flow.js (v88y garage parts): real touch, 852x393. Garage → BUILD → MY PARTS → CANVAS: place 6 parts (4 bricks 2×2 + 2 round tiles 2×2) with
// mirror off → ☝ SELECT them → ⛓ GROUPS → ＋ MAKE GROUP → 💾 SAVE PART → ← CAR → MY PARTS → tap the part (APPEND, mirror on) → tap a side spot on the
// car → ✔ PLACE → TILES tab shot → DONE → SAVE & DRIVE → reload → check the car and the part are kept. Shots into OUT. Returns a summary object.
// used by t4/g12drive.js (then drives) or alone: node t4/g12drive.js <url> <out> with NODRIVE=1
module.exports=async({p,pg,cdp,tap,tapXY,shot,boot,log})=>{const ev=(f,a)=>p.evaluate(f,a),R={};
 const vis=s=>ev(s=>{const e=document.querySelector(s);if(!e)return 0;const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).display!=='none'?1:0},s);
 const audit=()=>ev(()=>{const V=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth&&getComputedStyle(e).visibility!=='hidden'};let min=99,minE='';
  for(const e of document.querySelectorAll('#gbx *')){if(!V(e)||!e.offsetParent&&getComputedStyle(e).position!=='fixed')continue;if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;const f=parseFloat(getComputedStyle(e).fontSize);if(f<min){min=f;minE=(e.id||e.className||e.tagName)+':'+e.textContent.trim().slice(0,14)}}
  const bars={};for(const s of['#gsBar','#slBar','#paCvB','#gxG .gxA','#gxG .paRow','#gbBkP .r2BkT','#r2H']){const E=document.querySelector(s);if(E&&!E.hidden&&V(E))bars[s]=[...E.querySelectorAll('button')].filter(V).length}return{minFont:min,minE,bars}});
 const place=async(i,j)=>{for(const[a,b]of[[i,j],[i,j+1],[i+1,j]]){const s=await ev(([a,b])=>__gb.scr(a,b),[a,b]);if(!s||s.y<40||s.y>385)continue;const n0=await ev(()=>__gb.list().length);
   await tapXY(s.x,s.y);if(await ev(()=>!!__gs.held()))await tapXY(s.x,s.y);if(await ev(()=>!!__gs.held()))await tap('#gsBar .gsPl');if(await ev(()=>__gb.list().length)>n0)return 1}return 0};
 await tap('#gbMenuBtn');await pg.waitForTimeout(1500);await tap('#r2R [data-r2m="build"]');await pg.waitForTimeout(2500);R.builder=await ev(()=>!!__gb.GB_.bk);
 R.carParts0=await ev(()=>__gb.list().length);
 // MY PARTS chip → CANVAS card
 await tap('#gxCh [data-gxc="My parts"]');await shot('01_myparts_empty');await tap('#gbBkPc .paC[data-pa="cv"]');await pg.waitForTimeout(1500);
 R.canvas={on:await ev(()=>__pa.on()),bounds:await ev(()=>__pa.bounds()),n:await ev(()=>__gb.list().length)};log('canvas',JSON.stringify(R.canvas),JSON.stringify(await audit()));await shot('02_canvas_empty');
 // pan + pinch with two real fingers, then back
 const cv=await (await p.$('#gbC')).boundingBox(),cx=cv.x+cv.width/2,cy=cv.y+cv.height*.45,cam0=await ev(()=>__pa.cam());
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx-60,y:cy,id:5},{x:cx+60,y:cy,id:6}]});for(let k=1;k<=8;k++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx-60-k*6+k*8,y:cy+k*4,id:5},{x:cx+60+k*6+k*8,y:cy+k*4,id:6}]});await pg.waitForTimeout(40)}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});R.pan={pan:await ev(()=>__pa.pan()),cam0,cam1:await ev(()=>__pa.cam())};log('two-finger pan/zoom',JSON.stringify(R.pan));await shot('03_canvas_panned');
 await ev(()=>{__pa.S.px=0;__pa.S.pz=0});
 if(await ev(()=>__gb.GB_.mir))await tap('#gbBkT [data-a="mir"]');
 await tap('#gxCh [data-gxc="Bricks"]');await tap('#gbBkPc [data-p="b22"]');await tap('#gbBkCl .gbCl[data-c="0"]');
 let ok=0;for(const[i,j]of[[2,0],[2,2],[2,0],[2,2]])ok+=await place(i,j);await shot('04_part_in_progress');
 await tap('#gxCh [data-gxc="Tiles"]');await tap('#gbBkPc [data-p="rt22"]');await tap('#gbBkCl .gbCl[data-c="9"]');for(const[i,j]of[[2,0],[2,2]])ok+=await place(i,j);
 R.placed=ok;R.cvN=await ev(()=>__gb.list().length);log('canvas placed',ok,'parts',R.cvN,JSON.stringify(await ev(()=>__gb.list().map(b=>b.t+'@'+b.x+','+b.z+','+b.y))));await shot('05_tiles_catalogue');
 // SELECT the 6 parts by tapping them
 await tap('#gbBkT [data-a="sel"]');for(let k=0;k<4;k++){const C=await ev(()=>__gx.cand());const sel=await ev(()=>__sl?__sl.sel().length:0).catch(()=>0);let tapped=0;
  for(const c of C){const inSel=await ev(i=>{try{return __gx.S&&__sl.sel().includes(i)}catch(e){return false}},c.i).catch(()=>false);if(inSel)continue;await tapXY(c.x,c.y);tapped++}if(!tapped)break}
 R.sel=await ev(()=>{try{return __sl.sel().length}catch(e){return document.querySelector('#gbBkN').textContent}});log('selected',R.sel);
 await tap('#gbBkP [data-gx="grp"]');await tap('#gxG [data-ga="mk"]');R.groups=await ev(()=>__gx.groups());log('groups',JSON.stringify(R.groups),JSON.stringify(await audit()));await shot('06_group_panel');
 await tap('#gxG .paRow [data-pa="save"]');R.saved=await ev(()=>__pa.parts().map(o=>({n:o.n,k:o.b.length})));log('saved parts',JSON.stringify(R.saved));
 await tap('#paCvB [data-pa="back"]');await pg.waitForTimeout(1500);R.back={on:await ev(()=>__pa.on()),n:await ev(()=>__gb.list().length),bounds:await ev(()=>__pa.bounds())};log('back to car',JSON.stringify(R.back));
 // MY PARTS → tap the part (APPEND) with mirror on
 if(!await ev(()=>__gb.GB_.mir))await tap('#gbBkT [data-a="mir"]');await tap('#gxCh [data-gxc="My parts"]');await shot('07_myparts');log('my parts audit',JSON.stringify(await audit()));
 await tap('#gbBkPc .paC[data-pa^="p"]');R.carry0=await ev(()=>__pa.carry());log('carry',JSON.stringify(R.carry0));
 const n0=await ev(()=>__gb.list().length);let done=0;
 for(const[i,j]of[[2,-1],[2,1],[3,0],[2,3],[2,-3],[3,2],[1,0]]){const s=await ev(([a,b])=>__gb.scr(a,b),[i,j]);if(!s||s.y<40||s.y>385)continue;await tapXY(s.x,s.y);const c=await ev(()=>__pa.carry());if(!c)break;
  if(!c.bad&&c.tw){await shot('08_append_ghost');await tap('#gsBar .gsPl');done=1;break}}
 if(!done&&await ev(()=>__pa.carry()))log('no mirrored spot found',JSON.stringify(await ev(()=>__pa.carry())));
 R.appended=(await ev(()=>__gb.list().length))-n0;R.groupsCar=await ev(()=>__gx.groups());log('appended',R.appended,JSON.stringify(R.groupsCar),JSON.stringify(await audit()));
 await ev(()=>{__gb.GB_.yaw=Math.PI*.5;__gb.GB_.pit=.18});await shot('09_appended_side');await ev(()=>{__gb.GB_.yaw=Math.PI*.78;__gb.GB_.pit=.5});await shot('10_appended_34');
 await tap('#gbBkT [data-a="done"]');await pg.waitForTimeout(1500);await tap('#gbSave');await pg.waitForTimeout(3000);
 const st=()=>ev(()=>({build:(JSON.parse(localStorage.getItem('mho_build')||'{}').bricks||[]).length,parts:__pa.parts().length,cv:__pa.cv().length}));R.savedState=await st();log('after SAVE & DRIVE',JSON.stringify(R.savedState));
 if(boot){await pg.reload();await boot();R.reload=await st();log('after reload',JSON.stringify(R.reload))}
 return R};
