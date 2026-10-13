// qa25/b25func.js: build25 layer builder by REAL taps at 852x393: place on a layer (+ mirror twin), ▲ next surface, red when unsupported,
// UNDO/REDO, SELECT + DELETE, AUTO mode stacks on top, SAVE & DRIVE + reload keeps the build. Prints PASS/FAIL per check.
const L=require('./lib.js');(async()=>{const T=await L(process.argv[2],process.argv[3]);const{ev,tap,tapXY,shot}=T;const R=[];const ck=(n,ok,x='')=>{R.push([n,ok]);console.log(ok?'PASS':'FAIL',n,x)};
 const n=()=>ev(()=>__gb.list().length),last=()=>ev(()=>{const L=__gb.list();return L.slice(-2)});
 await tap('#gbMenuBtn',2500);await tap('#r2R [data-r2m="build"]',3000);await tap('#gbBkP [data-r2b="more"]');await tap('#r2More [data-r2a="gnb"]',1200);await tap('#gnbP [data-ch="sc8"]',2500);
 if(!await ev(()=>__gb.GB_.mir))await tap('#gbBkP [data-r2b="mir"]');ck('layer mode on by default',await ev(()=>__b25.S.on===1&&__b25.S.L!=null));
 await tap('#b25 [data-b25="top"]',1200);await shot('f1_top');const L0=await ev(()=>__b25.S.L);
 await tap('#gbBkP [data-r2b="cat"]');await tap('#gbBkCt [data-ct="Plates"]');await T.swipeTo('#gbBkPc','#gbBkPc [data-p="p24"]');await tap('#gbBkPc [data-p="p24"]');
 const sp=await ev(()=>{for(let d=0;d<6;d++)for(const[x,z]of[[-4-d,-2],[-4,-2-d],[-4,-2+d],[-4+d,-2]]){const b={t:'p24',x,z,y:__b25.S.L,r:0,m:0,c:0};if(__b25.why(b)==='ok')return[x,z]}return[-4,-2]});console.log('free spot',sp);
 const n0=await n();let q=await ev(s=>__b25.scr(s[0]+1,s[1]+2),sp);await tapXY(q.x,q.y);ck('tap holds a part on the layer',await ev(L=>{const h=__g8.held();return !!h&&h.y===L&&!h.bad},L0),JSON.stringify(await ev(()=>__g8.held())));
 await tap('#gsBar [data-g="place"]');const a=await last();ck('placed + mirror twin, both on the layer',await n()===n0+2&&a.every(b=>b.y===L0),JSON.stringify(a));await shot('f2_placed');
 await tap('#b25 [data-b25="up"]');const L1=await ev(()=>__b25.S.L);ck('▲ goes to the next surface',L1>L0,`${L0}→${L1}`);
 q=await ev(s=>__b25.scr(s[0]+1,s[1]+2),sp);await tapXY(q.x,q.y);await tap('#gsBar [data-g="place"]');const b=await last();ck('stacked on the plate at the new layer',b.every(x=>x.y===L1),JSON.stringify(b));
 // a spot with nothing under it on a higher layer → red, PLACE does nothing
 for(let k=0;k<4;k++)await tap('#b25 [data-b25="up"]');const L2=await ev(()=>__b25.S.L);q=await ev(s=>__b25.scr(s[0]+1,s[1]+2),sp);const n2=await n();await tapXY(q.x,q.y);
 ck('floating spot shows red + reason',await ev(()=>{const h=__g8.held();return !!h&&h.bad&&!!document.querySelector('#b25 em')}),await ev(()=>{const e=document.querySelector('#b25 em');return e&&e.textContent}));await shot('f3_red');
 await tap('#gsBar [data-g="place"]');ck('red part is not placed',await n()===n2);await tap('#gsBar [data-g="cancel"]').catch(()=>0);
 const n3=await n();await tap('#r2H [data-r2h="undo"]');ck('UNDO',await n()===n3-2);await tap('#r2H [data-r2h="redo"]');ck('REDO',await n()===n3);
 await tap('#b25 [data-b25="3d"]',1200);await shot('f4_3d');
 // SELECT + DELETE (select on the 3D view, tap the plate we stacked)
 await tap('#gbBkP [data-r2b="sel"]');q=await ev(s=>__gb.scr(s[0],s[1]),sp);await tapXY(q.x,q.y);const sel=await ev(()=>__g9ev('SL.sel.length'));ck('SELECT picks a part (+ twin)',sel>=1,'sel '+sel);
 const n4=await n();await tap('#slBar [data-s="del"]');ck('DELETE removes the selection',await n()===n4-sel);await tap('#gbBkP [data-r2b="sel"]');
 // AUTO: tap the layer number, then a tap drops on top of the stack
 await tap('#b25 [data-b25="lay"]');ck('AUTO mode',await ev(()=>__b25.S.on===0));q=await ev(s=>__gb.scr(s[0],s[1]),sp);const top=await ev(s=>__g9ev(`GB_top(${s[0]},${s[1]},GB_list())`),sp);await tapXY(q.x,q.y);await tap('#gsBar [data-g="place"]');
 const c=await last();ck('AUTO drops on top',c[c.length-1].y===top,JSON.stringify(c)+' top '+top);await tap('#b25 [data-b25="lay"]');
 const nf=await n();await tap('#gbSave',3000);const saved=await ev(()=>__g9ev("(store.get('mho_build',{}).bricks||[]).length"));ck('SAVE & DRIVE saved the build',saved===nf,`${saved}/${nf}`);
 if(!process.env.IFRAME){await T.pg.reload();await T.p.waitForFunction(()=>window.__mho&&window.__b25,null,{timeout:200000});ck('build kept after reload',await ev(()=>__g9ev("(store.get('mho_build',{}).bricks||[]).length"))===nf);ck('layer setting remembered',await ev(()=>__b25.S.on===1))}
 console.log('RESULT',R.filter(r=>!r[1]).length?'FAIL':'PASS',R.filter(r=>r[1]).length+'/'+R.length);await T.close()})();
