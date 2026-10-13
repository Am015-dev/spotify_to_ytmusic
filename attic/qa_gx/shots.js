// qa_gx/shots.js <url> <outdir>: review shots at 852x393 (normal gfx). Real taps on the UI buttons; brick choice for the groups set up through the test hook.
const E=require('../bc/enter.js');const fs=require('fs');const OUT=process.argv[3]||'qa_gx/shots';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const T=await E(process.argv[2],{gfx:process.env.GFX||'normal',tick:0});const{p,tap,ev}=T;const t0=Date.now();const W=t=>p.waitForTimeout(t);const pe=(f,a)=>p.evaluate(f,a);
 const shot=async n=>{await W(+(process.env.WAIT||2500));await p.screenshot({path:`${OUT}/${n}.png`,timeout:600000});console.log('shot',n,((Date.now()-t0)/1000|0)+'s')};
 await shot('s0_start');
 await tap('#gbMenuBtn');await W(2500);await tap('#gbx .gbTabs [data-t="veh"]');await W(1500);await tap('#g9Col .g9Card[data-gc="t_bus"] img');await W(1500);await tap('#r2R [data-r2m="build"]');await W(3000);
 await shot('s1_palette');if(!process.env.MIR){
 await tap('#gxCh [data-gxc="Slopes"]');await W(800);await shot('s1b_palette_slopes');await tap('#gxCh [data-gxc="Bricks"]');
 // upper deck: everything above the middle of the bus height → SELECT → MAKE GROUP → rename "Upper deck"
 await tap('#gbBkP [data-r2b="sel"]');await W(600);
 console.log('sel',await ev("(()=>{const L=GB_list(),top=Math.max(...L.map(b=>b.y+GB_PC[b.t].h)),c=Math.round(top*.5);SL_set(L.filter(b=>b.y>=c&&!CR_WH[b.t]));return SL.sel.length+'/'+L.length+' y>='+c})()"));
 await tap('#slBar [data-s="grp"]');await W(1200);const g=await pe(()=>__gx.groups()[0].g);
 await tap(`#gxG .gxR[data-g="${g}"] [data-ga="ren"]`);await W(500);await p.keyboard.press('Control+A').catch(()=>0);await p.keyboard.type('Upper deck');await tap(`#gxG .gxR[data-g="${g}"] [data-ga="ok"]`);await W(600);
 await shot('s2_group_made');
 await tap(`#gxG .gxR[data-g="${g}"] [data-ga="eye"]`);await W(1500);await shot('s3_group_hidden');
 await tap(`#gxG .gxR[data-g="${g}"] [data-ga="eye"]`);await W(1000);await tap('#gxG [data-ga="close"]');await W(600);await tap('#gbBkP [data-r2b="sel"]');await W(400);
 // hide layers above: step the layer down to the lower deck, HIDE UP
 for(let i=0;i<3;i++){await tap('#b25 [data-b25="dn"]');await W(700)}await shot('s5a_layer_ghosts');await tap('#b25 .gxHa');await W(1500);await shot('s5_hide_above');await tap('#b25 .gxHa');await W(800);
 }
 // new build on a chassis: a side pod on the left, MAKE GROUP, MIRROR → copy on the right, COPY → placed on top
 await ev('GNB_pick()');await W(1500);await tap('#gnbP [data-ch="sc8"]');await W(3000);
 console.log('pod',await ev("(()=>{const L=GB_list(),Ly=B25.L;const P=[];for(const[t,dz] of[['b24',-2],['b22',2]]){for(let x=-6;x<=-3;x++){const b={t,x,z:dz,y:Ly,r:0,m:0,c:2};if(B25_why(b)==='ok'){L.push(b);P.push(b);break}}}GB_refresh();if(P.length){const b={t:'slope',x:P[0].x,z:P[0].z,y:Ly+3,r:0,m:0,c:0};if(B25_why(b)==='ok'){L.push(b);P.push(b)}}GB_refresh();GB_.tool='sel';SL_set(P);GB_ui();return P.length})()"));
 await tap('#slBar [data-s="grp"]');await W(1200);const g2=await pe(()=>__gx.groups().slice(-1)[0].g);await tap(`#gxG .gxR[data-g="${g2}"] [data-ga="ren"]`);await W(400);await p.keyboard.press('Control+A').catch(()=>0);await p.keyboard.type('Side pod');await tap(`#gxG .gxR[data-g="${g2}"] [data-ga="ok"]`);await W(500);
 await tap(`#gxG .gxR[data-g="${g2}"] [data-ga="pick"]`);await W(500);if(!await pe(g=>__gx.S.act===g,g2)){await tap(`#gxG .gxR[data-g="${g2}"] [data-ga="pick"]`);await W(500)}
 await tap('#gxG .gxA [data-ga="mir"]');await W(1500);console.log('groups',JSON.stringify(await pe(()=>__gx.groups())));await shot('s4_mirrored');
 await tap(`#gxG .gxR[data-g="${g2}"] [data-ga="pick"]`);await W(500);if(!await pe(g=>__gx.S.act===g,g2)){await tap(`#gxG .gxR[data-g="${g2}"] [data-ga="pick"]`);await W(500)}
 await tap('#gxG .gxA [data-ga="dup"]');await W(1000);console.log('carry',await ev("(()=>{const C=SL.carry;if(!C)return'none';const x0=C.x,z0=C.z;for(const[dx,dz] of[[0,4],[0,-4],[0,5],[0,-5],[2,4],[2,-4],[0,6],[0,-6],[0,0]]){SL_fitAt(x0+dx,z0+dz,null);if(!C.bad)break}return JSON.stringify({x:C.x,z:C.z,y:C.y,bad:C.bad})})()"));await shot('s4b_copy_held');
 await tap('#gsBar [data-g="place"]');await W(1500);console.log('groups',JSON.stringify(await pe(()=>__gx.groups())));await shot('s4c_copied');
 await tap('#gxG [data-ga="close"]').catch(()=>0);await W(500);await tap('#gbSave');await W(4000);
 await pe(()=>{const b=document.querySelector('.ckB');if(b)b.click()});await W(1000);await shot('s6_checklist');
 console.log('ERRS',T.errs.length,JSON.stringify(T.errs.slice(0,6)));await T.b.close()})().catch(e=>{console.log('CRASH',e);process.exit(1)});
