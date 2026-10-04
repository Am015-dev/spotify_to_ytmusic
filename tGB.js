// tGB: brick builder + driver minifig tests, through real mouse / touch input where it matters.
// usage: node tGB.js [A B C D E]   (default: all)  -> shots/gb_*.png|jpg
const {boot}=require('./common.js');const F=require('./fast.js');const fs=require('fs');
const SEL=process.argv.slice(2);const want=k=>!SEL.length||SEL.includes(k);fs.mkdirSync('shots',{recursive:true});
let pass=0,fail=0;const ok=(c,m,i)=>{c?pass++:fail++;console.log((c?'PASS ':'FAIL ')+m+(i!==undefined?' · '+JSON.stringify(i):''))};const errs=[];
async function B(o){const r=await boot(Object.assign({page:'local_dbg.html'},o));r.p.setDefaultTimeout(900000);r.cerr=[];r.p.on('console',m=>{if(m.type()==='error')r.cerr.push(m.text().slice(0,200))});await F.on(r.p);
 await r.p.evaluate(()=>{try{window.__m1&&__m1.skip&&__m1.skip()}catch(e){}__mho.roamSim(10)});return r}
const done=async(r,t)=>{errs.push(...r.errs.map(e=>t+': '+e),...r.cerr.map(e=>t+' console: '+e));await r.b.close()};
const center=(p,sel)=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;if(e.closest('#gbBody'))e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return r.width?{x:r.x+r.width/2,y:r.y+r.height/2}:null},sel);
const click=async(p,sel)=>{const c=await center(p,sel);if(!c)throw new Error('no '+sel);await p.mouse.click(c.x,c.y);await p.waitForTimeout(80)};
const tap=async(p,sel)=>{const c=await center(p,sel);if(!c)throw new Error('no '+sel);await p.touchscreen.tap(c.x,c.y);await p.waitForTimeout(80)};
const openGarage=async p=>{await p.evaluate(()=>document.querySelector('#roamPause [data-p="garage"]').click());await p.waitForFunction(()=>!document.querySelector('#gbx').hidden)};
const n=p=>p.evaluate(()=>__gb.list().length);
// cells ordered: inside the canvas area between the toolbars, front-to-back
const freeCells=p=>p.evaluate(()=>{const T=document.querySelector('#gbBkT').getBoundingClientRect(),P=document.querySelector('#gbBkP').getBoundingClientRect();return __gb.cells().map(([i,j])=>({i,j,s:__gb.scr(i,j)})).filter(c=>c.s&&c.s.y>T.bottom+12&&c.s.y<P.top-12&&c.s.x>10&&c.s.x<innerWidth-10).sort((a,b)=>Math.abs(a.i+.5)-Math.abs(b.i+.5)||a.j-b.j)});
const layout=p=>p.evaluate(()=>{const vw=innerWidth,vh=innerHeight,R=e=>e.getBoundingClientRect(),T=R(document.querySelector('#gbBkT')),P=R(document.querySelector('#gbBkP'));const els=[...document.querySelectorAll('#gbBkT>*')].map(e=>({id:e.dataset.a||e.id,r:R(e)}));
 const ov=[];for(let i=0;i<els.length;i++)for(let j=i+1;j<els.length;j++){const a=els[i].r,b=els[j].r,w=Math.min(a.right,b.right)-Math.max(a.left,b.left),h=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);if(w>1&&h>1)ov.push(els[i].id+'×'+els[j].id)}
 const off=els.filter(e=>e.r.left<0||e.r.top<0||e.r.right>vw+1||e.r.bottom>vh+1).map(e=>e.id),rows=[...document.querySelectorAll('.gbBkR')].map(R);const rowOff=rows.filter(r=>r.left<-1||r.right>vw+1||r.bottom>vh+1).length;
 const minBtn=Math.min(...[...document.querySelectorAll('#gbBkT button,.gbPc,.gbCl')].map(e=>Math.min(R(e).width,R(e).height)));return{vw,vh,tbBottom:Math.round(T.bottom),palTop:Math.round(P.top),free:+((P.top-T.bottom)/vh).toFixed(2),ov,off,rowOff,minBtn:Math.round(minBtn)}});
const shot=(p,f)=>F.shot(p,f,f.endsWith('.jpg')?{type:'jpeg',quality:72}:{});
let SAVED=null;
(async()=>{
// ---------------- A: desktop mouse building, undo, mirror, rotate, paint, delete, save, world draw calls, reload persistence
if(want('A')){const r=await B({view:'desk'}),p=r.p;await openGarage(p);
 // existing garage features still work: paint swatch + a part, by real clicks
 await click(p,'#gbx .gbTabs [data-t="paint"]');const a0=await p.evaluate(()=>__gb.d().a);await click(p,'#gbBody .gbSw button[data-k="a"][data-v="#36d17a"]');
 await click(p,'#gbx .gbTabs [data-t="parts"]');await click(p,'#gbBody .gbP[data-cat="rear"][data-id="twin"]');
 const g0=await p.evaluate(()=>({a:__gb.d().a,rear:__gb.d().parts.rear}));ok(g0.a==='#36d17a'&&g0.rear==='twin','A1 existing PAINT and PARTS tabs still work by click',{a0,...g0});
 await click(p,'#gbx .gbTabs [data-t="bricks"]');await p.waitForTimeout(300);
 const st=await p.evaluate(()=>({bk:__gb.GB_.bk,cells:__gb.cells().length}));ok(st.bk&&st.cells>100,'A2 BRICKS tab opens the builder on a stud grid snapped to the current chassis',st);
 await click(p,'#gbBkT [data-a="mir"]');ok(!(await p.evaluate(()=>__gb.GB_.mir)),'A3 mirror toggles off by click');
 const pcs=['b22','b12','b11','round','tile','b24','slope','wedge','light','exhaust','flag','spoiler'];let placed=0,tries=0;
 for(let k=0;placed<30&&k<3;k++){const C=await freeCells(p);for(const c of C){if(placed>=30||tries>120)break;const pc=pcs[placed%pcs.length];await click(p,`#gbBkPc [data-p="${pc}"]`);if(placed%5===4)await click(p,`#gbBkCl [data-c="${placed%12}"]`);
  const s=await p.evaluate(([i,j])=>__gb.scr(i,j),[c.i,c.j]);if(!s)continue;const b0=await n(p);await p.mouse.move(s.x,s.y);await p.mouse.click(s.x,s.y);tries++;if(await n(p)===b0+1)placed++}}
 const types=await p.evaluate(()=>[...new Set(__gb.list().map(b=>b.t))]);ok(placed===30,'A4 30 bricks placed by real mouse clicks',{placed,tries,types:types.length});
 await shot(p,'shots/gb_builder_desk.png');
 const c0=await n(p);await click(p,'#gbBkT [data-a="undo"]');const c1=await n(p);await p.keyboard.down('Control');await p.keyboard.press('KeyZ');await p.keyboard.up('Control');const c2=await n(p);
 ok(c1===c0-1&&c2===c0-2,'A5 undo by button and by Ctrl+Z',{c0,c1,c2});
 await click(p,'#gbBkT [data-a="mir"]');await click(p,'#gbBkPc [data-p="b12"]');let mr=null;
 for(const c of (await freeCells(p)).filter(c=>c.i<=-3)){const b0=await n(p);const s=await p.evaluate(([i,j])=>__gb.scr(i,j),[c.i,c.j]);await p.mouse.click(s.x,s.y);const b1=await n(p);if(b1>b0){mr=await p.evaluate(k=>{const L=__gb.list(),x=L[L.length-2],y=L[L.length-1];return{d:L.length-k,a:[x.x,x.z,x.y],b:[y.x,y.z,y.y],tw:y.x===-x.x-1&&y.z===x.z}},b0);break}}
 ok(mr&&mr.d===2&&mr.tw,'A6 symmetric mode: one click places the brick and its mirror twin',mr);
 const u2=await n(p);await click(p,'#gbBkT [data-a="undo"]');ok(await n(p)===u2-2,'A7 one undo removes the mirrored pair');
 await click(p,'#gbBkT [data-a="mir"]');await click(p,'#gbBkPc [data-p="b24"]');await p.keyboard.press('KeyR');let rot=null;
 for(const c of await freeCells(p)){const b0=await n(p);const s=await p.evaluate(([i,j])=>__gb.scr(i,j),[c.i,c.j]);await p.mouse.click(s.x,s.y);if(await n(p)>b0){rot=await p.evaluate(()=>{const b=__gb.list().slice(-1)[0];return{t:b.t,r:b.r}});break}}
 ok(rot&&rot.r===1,'A8 R key rotates the next brick 90°',rot);
 // paint + delete on the last brick, by clicking where it sits
 const lb=await p.evaluate(()=>{const b=__gb.list().slice(-1)[0];return{i:b.x,j:b.z,c:b.c}});await click(p,'#gbBkCl [data-c="7"]');await click(p,'#gbBkT [data-a="paint"]');
 const sp=await p.evaluate(([i,j])=>__gb.scr(i,j),[lb.i,lb.j]);await p.mouse.click(sp.x,sp.y+3);const pc2=await p.evaluate(()=>__gb.list().slice(-1)[0].c);ok(pc2===7&&lb.c!==7,'A9 paint tool recolours a brick by click',{was:lb.c,now:pc2});
 await click(p,'#gbBkT [data-a="add"]');const d0=await n(p);await p.mouse.click(sp.x,sp.y+3,{button:'right'});ok(await n(p)===d0-1,'A10 right-click deletes a brick',{d0,d1:await n(p)});
 // budget
 const bud=await p.evaluate(()=>{const s=JSON.stringify(__gb.list());let k=0;for(let t=0;t<4000&&__gb.list().length<130;t++){const C=__gb.cells(),c=C[t%C.length];__gb.add('b11',c[0],c[1],0,t%12,true)}const m=__gb.list().length;__gb.d().bricks=JSON.parse(s);return m});ok(bud===120,'A11 brick budget caps the build at 120',bud);
 // presets
 const pre=[];for(let k=0;k<3;k++){await click(p,`#gbBkT [data-a="pre${k}"]`);pre.push(await n(p))}ok(pre.every(x=>x>=10),'A12 three preset builds load (brick counts)',pre);
 await click(p,'#gbBkT [data-a="pre0"]');const nb=await n(p),md=await p.evaluate(()=>__gb.mods(__gb.list()));ok(Object.values(md).every(v=>v>=.95&&v<=1.06),'A13 handling modifiers stay within −5 %…+6 %',md);
 await click(p,'#gbBkT [data-a="done"]');await click(p,'#gbSave');await p.waitForFunction(()=>__mho.state==='roam'&&document.querySelector('#gbx').hidden);await p.evaluate(()=>__mho.roamSim(30));
 SAVED=await p.evaluate(()=>localStorage.getItem('mho_build@1'));
 const dc=await p.evaluate(()=>{const R=__dbg.renderer,S=__dbg.scene,C=__dbg.camera,o=__mho.pl.mesh,gb=[];o.traverse(x=>{if(x.userData.gb)gb.push(x)});R.info.autoReset=false;R.info.reset();R.render(S,C);const a=R.info.render.calls;gb.forEach(x=>x.visible=false);R.info.reset();R.render(S,C);const b=R.info.render.calls;gb.forEach(x=>x.visible=true);R.info.autoReset=true;return{meshes:gb.length,delta:a-b,tris:gb.reduce((s,x)=>s+x.geometry.attributes.position.count/3,0)}});
 ok(dc.meshes<=2&&dc.delta<=2&&dc.meshes>0,'A14 in the world the built car + driver is one merged geometry (≤ 2 draw calls)',dc);
 await p.evaluate(()=>{const M=__mho,K=M.K;K.ArrowUp=true;M.roamSim(90);K.ArrowUp=false;M.roamSim(60)});await shot(p,'shots/gb_city.jpg');
 await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:600000});await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam');await F.on(p);
 const per=await p.evaluate(()=>{const b=JSON.parse(localStorage.getItem('mho_build@1')||'null'),o=__mho.pl.mesh;let t=0;o.traverse(x=>{if(x.userData.gb)t+=x.geometry.attributes.position.count/3});return{n:b&&b.bricks&&b.bricks.length,tris:t}});
 ok(per.n===nb&&per.tris===dc.tris,'A15 after a page reload the build persists (save slot) and is rebuilt identically',{saved:nb,...per});
 const sl=await p.evaluate(()=>{localStorage.setItem('mho_slot','2');return 1});await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu');const s2=await p.evaluate(()=>{const b=JSON.parse(localStorage.getItem('mho_build@2')||'null');return b&&b.bricks?b.bricks.length:0});
 ok(s2===0,'A16 bricks are per save slot (slot 2 is empty)',s2);await p.evaluate(()=>localStorage.setItem('mho_slot','1'));
 await done(r,'A')}
// ---------------- B: lap time stock vs built (quick race, auto-steer, held throttle)
if(want('B')){const lap=async(ls)=>{const r=await B({view:'desk',ls}),p=r.p;const t=await p.evaluate(()=>{const M=__mho;M.homeHide&&M.homeHide();M.setOpt('tab','quick');M.setOpt('traffic',false);M.startRace();M.sim(1);const K=M.K;let i=0;for(;i<60*900&&!(M.pl.laps&&M.pl.laps.length);i++){K.ArrowUp=true;M.sim(1)}K.ArrowUp=false;return{lap:M.pl.laps&&M.pl.laps[0],sim:i/60,top:M.pl.stats.top,acc:M.pl.stats.acc,han:M.pl.stats.han}});await done(r,'B');return t};
 const s=await lap({}),b=await lap(SAVED?{'mho_build@1':SAVED}:{});const d=s.lap&&b.lap?(b.lap-s.lap)/s.lap:null;
 ok(d!=null&&Math.abs(d)<=.10,'B1 lap time with the built car within ±10 % of stock',{stock:s,built:b,diff:d&&+(d*100).toFixed(1)+'%',saved:!!SAVED})}
// ---------------- C: phone portrait touch building + two-finger orbit + layout; landscape layout
if(want('C')){const r=await B({view:'port'}),p=r.p;await openGarage(p);await tap(p,'#gbx .gbTabs [data-t="bricks"]');await p.waitForTimeout(300);
 await tap(p,'#gbBkT [data-a="mir"]');let placed=0,tries=0;const pcs=['b22','b12','b11','round','light'];
 for(const c of await freeCells(p)){if(placed>=10||tries>40)break;await tap(p,`#gbBkPc [data-p="${pcs[placed%5]}"]`);const s=await p.evaluate(([i,j])=>__gb.scr(i,j),[c.i,c.j]);if(!s)continue;const b0=await n(p);await p.touchscreen.tap(s.x,s.y);await p.waitForTimeout(60);tries++;if(await n(p)===b0+1)placed++}
 ok(placed===10,'C1 10 bricks placed by touch taps (phone portrait)',{placed,tries});
 const u=await n(p);await tap(p,'#gbBkT [data-a="undo"]');ok(await n(p)===u-1,'C2 undo by tap');
 const cdp=await p.context().newCDPSession(p),y0=await p.evaluate(()=>[__gb.GB_.yaw,__gb.GB_.dist]);const T=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts.map(([x,y],id)=>({x,y,id}))});
 await T('touchStart',[[150,400],[240,400]]);for(let k=1;k<=8;k++){await T('touchMove',[[150+k*12,400-k*4],[240+k*12+k*6,400-k*4]]);await p.waitForTimeout(30)}await T('touchEnd',[]);await p.waitForTimeout(200);
 const y1=await p.evaluate(()=>[__gb.GB_.yaw,__gb.GB_.dist,__gb.list().length]);ok(Math.abs(y1[0]-y0[0])>.2&&y1[2]===u-1,'C3 two-finger drag orbits (and pinches) the camera without placing bricks',{before:y0,after:y1});
 const L=await layout(p);ok(!L.ov.length&&!L.off.length&&!L.rowOff&&L.palTop>L.tbBottom&&L.free>=.35&&L.minBtn>=28,'C4 phone portrait: toolbar/palette inside the screen, no overlaps, ≥35 % canvas free, buttons ≥28 px',L);
 await shot(p,'shots/gb_builder_phone.png');await done(r,'C');
 const r2=await B({view:'land'}),p2=r2.p;await openGarage(p2);await tap(p2,'#gbx .gbTabs [data-t="bricks"]');await p2.waitForTimeout(300);await tap(p2,'#gbBkT [data-a="pre1"]');
 const L2=await layout(p2);ok(!L2.ov.length&&!L2.off.length&&!L2.rowOff&&L2.palTop>L2.tbBottom&&L2.free>=.3&&L2.minBtn>=28,'C5 phone landscape: no overlaps, ≥30 % canvas free',L2);
 const b0=await n(p2);let lt=0;for(const c of (await freeCells(p2)).slice(0,8)){lt++;const s=await p2.evaluate(([i,j])=>__gb.scr(i,j),[c.i,c.j]);await p2.touchscreen.tap(s.x,s.y);await p2.waitForTimeout(80);if(await n(p2)>b0)break}ok(await n(p2)>b0,'C6 landscape tap places a brick',{taps:lt,b0,b1:await n(p2)});
 await shot(p2,'shots/gb_builder_land.jpg');await done(r2,'C2')}
// ---------------- D: minifig parts by click, unlocks, persistence, seat + cutscene portrait
if(want('D')){const r=await B({view:'desk'}),p=r.p;await openGarage(p);await click(p,'#gbx .gbTabs [data-t="driver"]');
 const cnt=await p.evaluate(()=>Object.fromEntries(Object.entries(__gb.FIG).map(([k,v])=>[k,v.length])));ok(Object.values(cnt).every(v=>v===8),'D1 8 options each for face, hair/hat, torso, legs, colour',cnt);
 const lk=await p.evaluate(()=>!!document.querySelector('#gbBody [data-fc="t"][data-fv="flames"]').disabled);ok(lk,'D2 story-locked torso (Flames) is locked on a fresh save');
 await p.evaluate(()=>{__mho.flagSet('FERREIRA',1);__gb.render()});ok(!(await p.evaluate(()=>document.querySelector('#gbBody [data-fc="t"][data-fv="flames"]').disabled)),'D3 beating the rival unlocks it');
 for(const[c,v]of[['h','grin'],['x','cap'],['t','flames'],['l','#c4281c'],['c','#36d17a']])await click(p,`#gbBody [data-fc="${c}"][data-fv="${v}"]`);
 const f=await p.evaluate(()=>__gb.fig());console.log('garage open',await p.evaluate(()=>!document.querySelector('#gbx').hidden));ok(f.h==='grin'&&f.x==='cap'&&f.t==='flames'&&f.l==='#c4281c'&&f.c==='#36d17a','D4 picking parts by click updates the driver',f);
 await shot(p,'shots/gb_driver_desk.jpg');await click(p,'#gbBack');
 await p.reload();await p.waitForFunction(()=>window.__mho&&__mho.state==='menu',null,{timeout:600000});await p.evaluate(()=>__mho.enterRoam());await p.waitForFunction(()=>__mho.state==='roam');await F.on(p);
 const f2=await p.evaluate(()=>({f:__gb.fig(),seat:(()=>{let k=0;__mho.pl.mesh.traverse(x=>{if(x.userData.gb)k++});return k})()}));ok(JSON.stringify(f2.f)===JSON.stringify(f),'D5 minifig persists across reload',f2.f);ok(f2.seat>=1&&f2.seat<=2,'D6 driver sits in the car in the world (merged, ≤ 2 meshes, no bricks)',f2.seat);
 await p.evaluate(()=>__gb.scene());await p.waitForTimeout(400);const cs=await p.evaluate(()=>{const i=document.querySelector('#m1Cs .gbMe img'),r=i&&i.getBoundingClientRect();return{vis:!!i&&!document.querySelector('#m1Cs').hidden&&r.width>20,same:!!i&&i.src===__gb.portrait()}});
 ok(cs.vis&&cs.same,'D7 cutscene shows the player minifig portrait with the chosen parts',cs);await shot(p,'shots/gb_cutscene.jpg');
 await p.evaluate(()=>{try{__m1.skip()}catch(e){}});await done(r,'D')}
// ---------------- E: garage stays blocked during an event
if(want('E')){const r=await B({view:'desk'}),p=r.p;const st=await p.evaluate(()=>{__m1.start('heist');__mho.roamSim(5);return !!__mho.RO.ch});
 const e=await p.evaluate(()=>{const b=document.querySelector('#roamPause [data-p="garage"]');document.querySelector('#roamExit').click();const hid=b.hidden;document.querySelector('#gbMenuBtn').click();return{hid,open:!document.querySelector('#gbx').hidden,ch:!!__mho.RO.ch}});
 ok(st&&e.hid&&!e.open&&e.ch,'E1 during an event the garage button is hidden and the garage cannot be opened',{st,...e});await done(r,'E')}
ok(!errs.length,'no page/console errors',errs.slice(0,6));console.log(`tGB: ${pass} pass, ${fail} fail`);process.exit(fail?1:0)})();
