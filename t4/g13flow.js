// t4/g13flow.js (v89d garage): real touch, 852x393, plus a few PC keys. Garage → BUILD (audit the simplified bar) → ▾ MY PARTS → CANVAS →
// 🔍 search + 🧺 tray (headlight brick, grille tile, tile 1×4, bracket, curved slope) → build a 10-part taxi-like front from the TRAY →
// rotate a tile on X / Z / 45° / Y with the ⟲ pad, a tap on the held part, a two-finger twist and the keys R T F Shift+R →
// SELECT 2 parts → GROUP → MOVE → PLACE → UNGROUP; select 2 loose parts → JOIN (snap) → SELECT all → GROUP → SAVE PART → ← CAR →
// MY PARTS → append on the car → DONE → SAVE & DRIVE → reload → the car keeps the new parts. Shots into OUT.
module.exports=async({p,pg,cdp,tap,tapXY,shot,boot,log})=>{const ev=(f,a)=>p.evaluate(f,a),R={},W=ms=>pg.waitForTimeout(ms);
 const V=s=>ev(s=>{const e=document.querySelector(s);if(!e)return 0;const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).display!=='none'?1:0},s);
 const audit=()=>ev(()=>{const vis=e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight&&r.right>0&&r.left<innerWidth&&getComputedStyle(e).visibility!=='hidden'&&getComputedStyle(e).display!=='none'};let min=99,minE='';
  for(const e of document.querySelectorAll('#gbx *')){if(!vis(e)||!e.offsetParent&&getComputedStyle(e).position!=='fixed')continue;if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim()))continue;const f=parseFloat(getComputedStyle(e).fontSize);if(f<min){min=f;minE=(e.id||e.className||e.tagName)+':'+e.textContent.trim().slice(0,14)}}
  const bars={};for(const s of['#gsBar','#slBar','#g13Pad','#gbBkP .r2BkT','#g13Ch','#b25','#r2H','#r2R']){const E=document.querySelector(s);if(E&&!E.hidden&&vis(E))bars[s]=[...E.querySelectorAll('button,input')].filter(vis).length}
  const all=[...document.querySelectorAll('#gbx button,#gbx input')].filter(b=>vis(b)&&!b.closest('#gbBkPc'));let ov=0;for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){const a=all[i].getBoundingClientRect(),b=all[j].getBoundingClientRect();if(all[i].contains(all[j])||all[j].contains(all[i]))continue;if(a.left<b.right-1&&b.left<a.right-1&&a.top<b.bottom-1&&b.top<a.bottom-1)ov++}
  return{minFont:min,minE,bars,controls:all.length,overlaps:ov}});
 const search=async q=>{await tap('#g13Qi');await ev(q=>{const I=document.querySelector('#g13Qi');I.value=q;I.dispatchEvent(new Event('input'))},q);await W(500);return ev(()=>[...document.querySelectorAll('#gbBkPc .gbPc')].filter(b=>b.style.display!=='none').map(b=>b.dataset.p))};
 const cat=async k=>{await tap('#g13Ch .g13Ca');await tap(`#g13Pop [data-g13c="${k}"]`);await W(400)};
 const held=()=>ev(()=>__gs.held()),st=()=>ev(()=>__g13.st());
 const place=async(i,j)=>{for(const[a,b]of[[i,j],[i,j+1],[i+1,j],[i,j-1]]){const s=await ev(([a,b])=>__gb.scr(a,b),[a,b]);if(!s||s.y<60||s.y>200)continue;const n0=await ev(()=>__gb.list().length);
   await tapXY(s.x,s.y);const h=await held();if(h&&!h.bad)await tap('#gsBar .gsPl');if(await held())await tap('#gsBar [data-g="cancel"]');if(await ev(()=>__gb.list().length)>n0)return 1}return 0};
 await tap('#gbMenuBtn');await W(1500);await tap('#r2R [data-r2m="build"]');await W(2500);R.builder=await ev(()=>!!__gb.GB_.bk);
 R.carParts0=await ev(()=>__gb.list().length);R.audit0=await audit();log('build audit',JSON.stringify(R.audit0));await shot('01_build_bar_after');
 // MY PARTS (▾ list) → CANVAS
 await cat('My parts');await shot('02_category_list_closed');await tap('#gbBkPc .paC[data-pa="cv"]');await W(1500);R.canvas=await ev(()=>__pa.on());
 if(await ev(()=>__gb.GB_.mir)){await tap('#gbBkP [data-r2b="more"]');await tap('#r2More [data-g13m="mir"]')}R.mir=await ev(()=>__gb.GB_.mir);
 if(await ev(()=>__b25&&__b25.on&&__b25.on()))await tap('#b25 [data-b25="lay"]');
 // SEARCH + TRAY
 R.search={};for(const[q,k,n]of[['headlight brick','hl',2],['grille','grl',2],['tile 1x4','t14',1],['grille brick','gb12',2],['curved slope 3','cs31',2],['4070','hl',0]]){const res=await search(q);R.search[q]=res.slice(0,6);
  if(q==='headlight brick')await shot('03_search_results');for(let i=0;i<n;i++)await tap(`#gbBkPc .gbPc[data-p="${k}"] .g13Add`)}
 R.tray=await ev(()=>__g13.tray());log('search',JSON.stringify(R.search),'tray',JSON.stringify(R.tray));
 await tap('#gbBkP [data-g13="tray"]');await W(600);await shot('04_tray');
 // build the front from the tray: 2 grille bricks + 2 headlight bricks in a row, 2 curved slopes behind, tile 1×4 + 2 grille tiles on top, + 1 more grille brick
 let ok=0;const pick=async(k,c)=>{await tap(`#gbBkPc .gbPc[data-p="${k}"]`);await W(200);if(c!=null){await tap('#gbBkP [data-r2b="col"]');await tap(`#gbBkCl .gbCl[data-c="${c}"]`);await W(200)}};
 await pick('gb12',11);ok+=await place(0,-2);ok+=await place(0,0);await pick('hl',9);ok+=await place(0,-3);ok+=await place(0,2);
 await pick('cs31',2);ok+=await place(1,-2);ok+=await place(1,1);await pick('t14',2);ok+=await place(0,-2);await pick('grl',11);ok+=await place(0,-3);ok+=await place(0,2);
 await pick('gb12');ok+=await place(3,-1);R.placed=ok;R.cv=await ev(()=>__gb.list().map(b=>b.t+'@'+b.x+','+b.z+','+b.y));log('placed',ok,JSON.stringify(R.cv));await shot('05_front_built');
 // ROTATION: hold a tile 1×2, then the ⟲ pad X, Z, 45°, Y; a tap on the held part; a two-finger twist; keys
 await search('tile 1x2');await pick('tile',2);const s0=await ev(()=>__gb.scr(-4,-4));await tapXY(s0.x,s0.y);R.rot={held:await held()};
 await tap('#gsBar [data-g13p]');R.rot.pad=(await st()).pad;await tap('#g13Pad [data-g13a="x"]');R.rot.x=(await st()).pc;await shot('06_rotation_gizmo');
 await tap('#g13Pad [data-g13a="z"]');R.rot.z=(await st()).pc;await tap('#g13Pad [data-g13a="q"]');R.rot.q=(await st()).pc;await tap('#g13Pad [data-g13a="q"]');
 const r0=(await st()).rot;await tap('#g13Pad [data-g13a="y"]');R.rot.y=[r0,(await st()).rot];
 const h=await held();if(h){const s=await ev(([a,b])=>__gb.scr(a,b),[h.x,h.z]);const r1=(await st()).rot;await tapXY(s.x,s.y);R.rot.tapY=[r1,(await st()).rot,!!(await held())]}
 {const cv=await (await p.$('#gbC')).boundingBox(),cx=cv.x+cv.width*.55,cy=cv.y+cv.height*.35,r1=(await st()).rot;await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:cx-50,y:cy,id:7},{x:cx+50,y:cy,id:8}]});
  for(let k=1;k<=10;k++){const a=k*.09;await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:cx-50*Math.cos(a),y:cy-50*Math.sin(a),id:7},{x:cx+50*Math.cos(a),y:cy+50*Math.sin(a),id:8}]});await W(30)}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});R.rot.twist=[r1,(await st()).rot]}
 const k0=await st();await pg.keyboard.press('t');const k1=await st();await pg.keyboard.press('f');const k2=await st();await pg.keyboard.press('Shift+F');const k3=await st();await pg.keyboard.press('r');const k4=await st();
 R.rot.keys=[k0.pc+'/'+k0.rot,k1.pc+'/'+k1.rot,k2.pc+'/'+k2.rot,k3.pc+'/'+k3.rot,k4.pc+'/'+k4.rot];await pg.keyboard.press('t');R.rot.keyT=(await st()).pc;
 R.rot.padAudit=await audit();await shot('07_rotation_pad');const hh=await held();if(hh&&!hh.bad)await tap('#gsBar .gsPl');else if(hh)await tap('#gsBar [data-g="cancel"]');
 R.rot.placed=await ev(()=>__gb.list().filter(b=>/@/.test(b.t)).map(b=>b.t+'/'+b.r));log('rotation',JSON.stringify(R.rot));
 // GROUP → MOVE → PLACE → UNGROUP (2 grille bricks), then JOIN two loose parts
 const selTap=async(i)=>{const c=await ev(i=>{const b=__gb.list()[i];if(!b)return null;const D=__gb.PC[b.t];const w=b.r%2?D.d:D.w,d=b.r%2?D.w:D.d;return __b25.scr(b.x+w/2,b.z+d/2,b.y+D.h)},i);if(c)await tapXY(c.x,c.y)};
 await tap('#gbBkP [data-r2b="sel"]');const L=await ev(()=>__gb.list().map(b=>b.t));const gi=L.map((t,i)=>t==='gb12'?i:-1).filter(i=>i>=0).slice(0,2);for(const i of gi)await selTap(i);
 R.grp={sel:await ev(()=>__sl.sel())};await tap('#slBar [data-s="grp"]');R.grp.groups=await ev(()=>__gx.groups());if(await V('#gxG [data-ga="close"]'))await tap('#gxG [data-ga="close"]');
 await shot('08_group_actions');R.grp.audit=await audit();await tap('#slBar [data-s="move"]');const sm=await ev(()=>__gb.scr(-6,4));if(sm)await tapXY(sm.x,sm.y);R.grp.carry=await ev(()=>__sl.carry());
 await tap('#gsBar .gsPl');R.grp.moved=await ev(()=>__gb.list().filter(b=>b.t==='gb12').map(b=>b.x+','+b.z+','+b.y+',g'+(b.g||0)));
 for(const i of await ev(()=>__gb.list().map((b,i)=>b.t==='gb12'&&b.g?i:-1).filter(i=>i>=0).slice(0,1)))await selTap(i);
 if((await ev(()=>__sl.sel())).length){await tap('#slBar [data-s="grp"]');R.grp.ungrouped=await ev(()=>__gb.list().filter(b=>b.t==='gb12').every(b=>!b.g))}
 await tap('#gbBkP [data-r2b="sel"]');await tap('#gbBkP [data-r2b="sel"]');
 const J=await ev(()=>__gb.list().map((b,i)=>/^(tile|cs31|hl|grl|t14)/.test(b.t)&&!b.g?i:-1).filter(i=>i>=0).slice(0,10));for(const i of J)if(i>=0)await selTap(i);
 R.join={sel:await ev(()=>__sl.sel()),comps:await ev(()=>__g13.comps(__sl.S.sel))};await tap('#slBar [data-g13s="join"]');await W(400);
 R.join.after=await ev(()=>({comps:__g13.comps(__sl.S.sel),g:__sl.S.sel.map(b=>(b.g||0)+(b.j?'j':'')),groups:__gx.groups()}));await shot('09_join');log('group/join',JSON.stringify(R.grp),JSON.stringify(R.join));
 // the joined piece → SAVE PART (⋯ MORE → GROUPS → the piece → 💾 SAVE PART) → back to the car → MY PARTS → append on the car
 await tap('#gbBkP [data-r2b="sel"]');if(await ev(()=>__gb.GB_.tool==='sel'))await tap('#gbBkP [data-r2b="sel"]');
 await tap('#gbBkP [data-r2b="more"]');await tap('#r2More [data-g13m="grp"]');await W(300);const pg_=await ev(()=>{const g=__gx.groups().find(o=>/Piece/.test(o.name));return g&&g.g});
 if(pg_)await tap(`#gxG .gxR[data-g="${pg_}"] [data-ga="pick"]`);await W(300);
 await tap('#gxG .paRow [data-pa="save"]');R.saved=await ev(()=>__pa.parts().map(o=>({n:o.n,k:o.b.length})));if(await V('#gxG [data-ga="close"]'))await tap('#gxG [data-ga="close"]');
 await tap('#paCvB [data-pa="back"]');await W(1500);R.back=await ev(()=>({on:__pa.on(),n:__gb.list().length}));
 await cat('My parts');await tap('#gbBkPc .paC[data-pa^="p"]');const n0=await ev(()=>__gb.list().length);
 for(const[i,j]of[[0,-12],[0,-13],[0,-11],[1,-12],[0,-14],[-1,-12],[0,-10],[0,-15]]){const s=await ev(([a,b])=>__gb.scr(a,b),[i,j]);if(!s||s.y<40||s.y>385)continue;await tapXY(s.x,s.y);const c=await ev(()=>__pa.carry());if(!c)break;if(!c.bad){await tap('#gsBar .gsPl');break}}
 R.appended=(await ev(()=>__gb.list().length))-n0;log('saved',JSON.stringify(R.saved),'appended',R.appended);
 await ev(()=>{__gb.GB_.yaw=Math.PI*.12;__gb.GB_.pit=.35});await shot('10_car_front_tiles');
 await cat('Tiles');await shot('11_new_parts_catalogue');await cat('SNOT');await shot('12_snot_catalogue');
 await tap('#gbBkT [data-a="done"]');await W(1500);await tap('#gbSave');await W(3000);
 const S=()=>ev(()=>({sel:__g9c.eq('car'),build:__g9c.bricks(__g9c.eq('car')).length,types:[...new Set(__g9c.bricks(__g9c.eq('car')).map(b=>b.t))].filter(t=>/hl|gb12|cs31|t14|grl|@/.test(t)),tray:__g13.tray()}));
 R.savedState=await S();log('after SAVE & DRIVE',JSON.stringify(R.savedState));if(boot){await pg.reload();await boot();R.reload=await S();log('after reload',JSON.stringify(R.reload))}
 return R};
