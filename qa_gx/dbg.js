const E=require('../bc/enter.js');
(async()=>{const T=await E(process.argv[2],{gfx:'min'});const{p,tap,ev}=T;const W=t=>p.waitForTimeout(t);const pe=(f,a)=>p.evaluate(f,a);
 await tap('#gbMenuBtn');await W(2500);await tap('#gbx .gbTabs [data-t="veh"]');await W(1500);await tap('#g9Col .g9Card[data-gc="t_bus"] img');await W(1500);await tap('#r2R [data-r2m="build"]');await W(3000);
 console.log(await pe(()=>{const out=[];const L=JSON.parse(__gx.ev('JSON.stringify(GB_list().slice(0,4))'));for(const b of L){const q=__b25.scr(b.x+.5,b.z+.5,b.y+1);const el=document.elementFromPoint(q.x,q.y);out.push([b.t,b.y,q.x|0,q.y|0,el&&(el.id||el.className),__sl.pick(q.x,q.y)])}return JSON.stringify(out)}));
 console.log('st',await pe(()=>{let t0=performance.now(),d0=Date.now();return new Promise(r=>setTimeout(()=>r([performance.now()-t0,Date.now()-d0]),550))}));
 const r=await pe(()=>new Promise(res=>{const b=document.querySelector('#gbBkPc .gbPc'),q=b.getBoundingClientRect(),o={bubbles:true,cancelable:true,clientX:q.left+5,clientY:q.top+5,pointerId:77,pointerType:'touch',isPrimary:true};
  b.dispatchEvent(new PointerEvent('pointerdown',{...o,buttons:1}));setTimeout(()=>res([b.dataset.p,__gx.S.fav.join(','),__gx.S.lp]),1500)}));console.log('lp',JSON.stringify(r));
 console.log('cand',JSON.stringify(await pe(()=>__gx.cand())));console.log('ERRS',JSON.stringify(T.errs.slice(0,5)));await T.b.close()})();
