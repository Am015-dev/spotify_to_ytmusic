// qa_gx/base.js <url> <outdir>: BEFORE (baseline) garage pain by real taps at 852x393: open builder on the bus template, palette shots, select inner part.
const E=require('../bc/enter.js');const fs=require('fs');const OUT=process.argv[3]||'qa_gx/base';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const T=await E(process.argv[2],{gfx:process.env.GFX||'min'});const{p,tap,ev,tapXY}=T;const t0=Date.now();
 const shot=async n=>{await p.waitForTimeout(1500);await p.screenshot({path:`${OUT}/${n}.png`,timeout:600000});console.log('shot',n,((Date.now()-t0)/1000|0)+'s')};
 const log=(...a)=>console.log(...a);
 await tap('#gbMenuBtn');await p.waitForTimeout(2500);await tap('#gbx .gbTabs [data-t="veh"]');await p.waitForTimeout(1500);
 log('bus card',await tap('#g9Col .g9Card[data-gc="t_bus|car"] img')||await tap('#g9Col .g9Card[data-gc="t_bus"] img'));await p.waitForTimeout(1500);
 await tap('#r2R [data-r2m="build"]');await p.waitForTimeout(3000);log('bricks',await ev('GB_list().length'));await shot('b1_build');
 const pal=await p.evaluate(()=>{const s=document.querySelector('#gbBkPc');const r=s.getBoundingClientRect();const all=[...s.querySelectorAll('.gbPc')].filter(b=>b.style.display!=='none');const vis=all.filter(b=>{const q=b.getBoundingClientRect();return q.left>=r.left-1&&q.right<=r.right+1&&q.width>0});
  const t=all[0]&&all[0].getBoundingClientRect();return{cat:document.querySelector('#gbBkP .r2Cat')?.textContent,inCat:all.length,visible:vis.length,tile:t&&[t.width|0,t.height|0],strip:[r.width|0,r.height|0],cats:[...document.querySelectorAll('#gbBkCt .gbCt')].map(b=>b.textContent)}});
 log('PALETTE',JSON.stringify(pal));
 await tap('#gbBkP [data-r2b="cat"]');await shot('b2_cat');await tap('#gbBkP [data-r2b="cat"]');
 // select an inner part of the bus (lower deck seat area): pick from the centre of the canvas
 await tap('#gbBkP [data-r2b="sel"]');const c=await p.evaluate(()=>{const r=document.querySelector('#gbC').getBoundingClientRect();return[r.left+r.width*.45,r.top+r.height*.5]});await tapXY(c[0],c[1]);await p.waitForTimeout(1500);
 log('sel after tap',await ev('SL.sel.map(b=>b.t+"@"+b.y).join(",")'));await shot('b3_sel');
 log('groups in template',await ev('[...new Set(GB_list().map(b=>b.g||0))].length'));
 log('ERRS',T.errs.length,JSON.stringify(T.errs.slice(0,5)));await T.b.close()})().catch(e=>{console.log('FAIL',e);process.exit(1)});
