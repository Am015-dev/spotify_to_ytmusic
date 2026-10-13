// t4/g13taxi.js <url> <out>: phone 852x393, real touch. RIDES → Orange Street GT → BUILD → PAINT BODY yellow → new parts on top:
// roof sign (headlight bricks + tile 1x4), grille front, then SAVE & DRIVE, drive ~25 s, shots taxi_garage / taxi_drive / taxi_side; checks the parts are on the saved car.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const OUT=process.argv[3];require('fs').mkdirSync(OUT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(String(e)));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});const ev=(f,a)=>p.evaluate(f,a),W=ms=>p.waitForTimeout(ms);
 await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});const cdp=await ctx.newCDPSession(p);
 const tapXY=async(x,y)=>{const tp=[{x,y,id:1,radiusX:4,radiusY:4,force:1}];await Promise.all([cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:tp}),cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})]);await W(700)};
 const tap=async s=>{const e=await p.$(s);if(!e)return console.log('NO',s);await e.scrollIntoViewIfNeeded().catch(()=>{});const bb=await e.boundingBox();if(!bb)return console.log('HID',s);await tapXY(bb.x+bb.width/2,bb.y+bb.height/2)};
 const shot=async n=>{await W(1200);await p.screenshot({path:`${OUT}/${n}.png`});console.log('shot',n)};
 await tap('#gbMenuBtn');await W(1500);await tap('#r2R [data-r2m="rides"]');await W(1200);await tap('[data-gc="t_su_gt"]');await W(1500);
 console.log('car',await ev(()=>__g9c.eq('car')));await tap('#r2R [data-r2m="build"]');await W(2500);console.log('bk',await ev(()=>!!__gb.GB_.bk),await ev(()=>__gb.list().length));
 // yellow: the colour chip nearest #f2cd37
 await tap('#gbBkP [data-r2b="col"]');const yc=await ev(()=>{let best=null,bd=1e9;for(const e of document.querySelectorAll('#gbBkCl .gbCl')){const m=getComputedStyle(e).backgroundColor.match(/\d+/g);if(!m)continue;const d=(m[0]-242)**2+(m[1]-205)**2+(m[2]-55)**2;if(d<bd){bd=d;best=e.dataset.c}}return best});
 console.log('yellow',yc);await tap(`#gbBkCl .gbCl[data-c="${yc}"]`);await W(300);await tap('#gbBkP [data-r2b="more"]');await tap('#r2More [data-r2a="pbody"]');await W(800);
 if(await ev(()=>__b25&&__b25.S&&__b25.S.on))0;
 const search=async(q,k)=>{await tap('#g13Qi');await ev(q=>{const I=document.querySelector('#g13Qi');I.value=q;I.dispatchEvent(new Event('input'));I.blur()},q);await W(500);await tap(`#gbBkPc .gbPc[data-p="${k}"]`);await W(300)};
 const col=async c=>{await tap('#gbBkP [data-r2b="col"]');await tap(`#gbBkCl .gbCl[data-c="${c}"]`);await W(200)};
 const held=()=>ev(()=>__gs.held());
 // place at grid cell (i,j) on the active layer L (b25); returns 1 if a part was added
 const place=async(i,j,L)=>{const n0=await ev(()=>__gb.list().length);for(const[a,c]of[[i,j],[i,j+1],[i-1,j],[i,j-1],[i+1,j]]){const s=await ev(([a,c,L])=>__b25.scr(a+.5,c+.5,L),[a,c,L]);if(!s||s.y<60||s.y>330||s.x<90||s.x>780)continue;
   await tapXY(s.x,s.y);const h=await held();if(h&&!h.bad){await tap('#gsBar .gsPl');if(await ev(()=>__gb.list().length)>n0)return 1}if(await held())await tap('#gsBar [data-g="cancel"]')}return 0};
 const setL=async L=>{for(let k=0;k<40;k++){const c=await ev(()=>__b25.S.L);if(c===L)return;await tap(`#b25 [data-b25="${c<L?'up':'dn'}"]`)}};
 // roof: the highest top over the car's centre cells
 const top=await ev(()=>{const L=__gb.list(),P=__gb.PC;let t=0;for(const b of L){const D=P[b.t];const w=b.r%2?D.d:D.w,d=b.r%2?D.w:D.d;if(b.x<=0&&0<b.x+w&&b.z<=0&&0<b.z+d)t=Math.max(t,b.y+D.h)}return t});
 const ext=await ev(()=>{const L=__gb.list();return{z0:Math.min(...L.map(b=>b.z)),z1:Math.max(...L.map(b=>b.z)),x0:Math.min(...L.map(b=>b.x)),x1:Math.max(...L.map(b=>b.x))}});console.log('roof',top,JSON.stringify(ext));
 await ev(()=>{__gb.GB_.pit=.75});await W(600);
 let ok=0;await setL(top);await search('headlight brick','hl');await col(yc);ok+=await place(-1,0,top);ok+=await place(0,0,top);
 await setL(top+3);await search('tile 1x4','t14');const bl=await ev(()=>{let best=null,bd=1e9;for(const e of document.querySelectorAll('#gbBkCl .gbCl')){const m=getComputedStyle(e).backgroundColor.match(/\d+/g);if(!m)continue;const d=(m[0]-20)**2+(m[1]-20)**2+(m[2]-20)**2;if(d<bd){bd=d;best=e.dataset.c}}return best});await col(bl);ok+=await place(-1,-1,top+3);
 console.log('roof sign placed',ok);await shot('taxi_garage_roof');
 // grille on the front
 const fr=await ev(()=>{const L=__gb.list();return Math.max(...L.filter(b=>b.y<=6).map(b=>b.z+(b.r%2?__gb.PC[b.t].w:__gb.PC[b.t].d)))});
 await ev(()=>{__gb.GB_.yaw=0;__gb.GB_.pit=.35});await W(600);
 let okf=0;for(const L of[3,0,6]){await setL(L);await search('grille','grl');await col(bl);okf+=await place(-1,fr,L);if(okf)break}console.log('front placed',okf,'front z',fr);await shot('taxi_garage_front');
 const types=()=>ev(()=>[...new Set(__g9c.bricks(__g9c.eq('car')).map(b=>b.t))].filter(t=>/^(hl|t14|grl)/.test(t)));
 await tap('#gbBkT [data-a="done"]');await W(1500);await tap('#gbSave');await W(3000);console.log('saved car types',JSON.stringify(await types()),'n',await ev(()=>__g9c.bricks(__g9c.eq('car')).length));
 await tap('#hcStory');for(let i=0;i<120;i++){await W(3000);const s=await ev(()=>__mho.state+'|'+!!(__mho.LD&&__mho.LD.on));if(s==='roam|false')break;for(const q of['#slotList .go','#m1Next']){const e=await p.$(q);if(e&&await e.isVisible()){const bb=await e.boundingBox();await tapXY(bb.x+bb.width/2,bb.y+bb.height/2)}}}
 for(let i=0;i<10;i++){let hit=0;for(const l of[p.getByText('SKIP',{exact:false}),p.getByText('TAP TO CONTINUE'),p.locator('#m1Next')]){const e=l.first();if(await e.count()&&await e.isVisible()){const bb=await e.boundingBox();await tapXY(bb.x+bb.width/2,bb.y+bb.height/2);hit=1;break}}if(!hit&&i>3)break;await W(1500)}
 const g=await (await p.$('#tG')).boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:g.x+g.width/2,y:g.y+g.height/2,id:2}]});await W(9000);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await shot('taxi_drive');const gap=await ev(()=>{try{return __gnb.gap()}catch(e){return String(e)}});console.log('gap',JSON.stringify(gap));
 await ev(()=>{const M=__mho,R=M.RO,gg=M.gnd(R.x,R.z,R.y+.3),sx=Math.cos(R.h),sz=-Math.sin(R.h);__gnb.cam([R.x+sx*5,gg+1.2,R.z+sz*5,R.x,gg+.6,R.z])});await W(2500);await p.screenshot({path:`${OUT}/taxi_side.png`});console.log('shot taxi_side');
 console.log('ERR',JSON.stringify(errs.filter(e=>!/GPU stall|GL Driver/.test(e)).slice(0,6)));await b.close()})();
