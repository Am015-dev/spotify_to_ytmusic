// qa_gx/func.js <url> <outdir>: GX garage UX by real taps at 852x393 (?fast=1): palette (2 rows, chips, ★ long-press, RECENT), groups (make, hide, show,
// rename, mirror, copy, delete + undo), HIDE UP, save keeps hidden parts. Prints PASS/FAIL per check + console errors.
const E=require('../bc/enter.js');const fs=require('fs');const OUT=process.argv[3]||'qa_gx/func';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const T=await E(process.argv[2],{gfx:process.env.GFX||'min',w:+(process.env.VW||852),h:+(process.env.VH||393),desk:!!process.env.DESK});const{p,tap,ev,tapXY,cdp}=T;const t0=Date.now();const R=[];
 const ck=(n,ok,x='')=>{R.push([n,!!ok]);console.log(ok?'PASS':'FAIL',n,x)};
 const shot=async n=>{await p.waitForTimeout(1500);await p.screenshot({path:`${OUT}/${n}.png`,timeout:600000});console.log('shot',n,((Date.now()-t0)/1000|0)+'s')};
 const pe=(f,a)=>p.evaluate(f,a);const n=()=>ev('GB_list().length');const W=t=>p.waitForTimeout(t);
 const press=async(s,ms)=>{const e=await p.$(s);const bb=await e.boundingBox();const x=bb.x+bb.width/2,y=bb.y+bb.height/2;
  if(process.env.DESK){await p.mouse.move(x,y);await p.mouse.down();await W(ms);await p.mouse.up();return}
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});await W(ms);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await W(800)};
 await tap('#gbMenuBtn');await W(2500);await tap('#gbx .gbTabs [data-t="veh"]');await W(1500);await tap('#g9Col .g9Card[data-gc="t_bus"] img');await W(1500);
 await tap('#r2R [data-r2m="build"]');await W(3000);const N0=await n();console.log('bricks',N0);
 // ---- palette
 const pal=await pe(()=>{const t=[...document.querySelectorAll('#gbBkPc .gbPc')].find(b=>b.style.display!=='none').getBoundingClientRect(),rows=new Set(__gx.vis().map(k=>Math.round(document.querySelector(`#gbBkPc [data-p="${k}"]`).getBoundingClientRect().top)));
  return{vis:__gx.vis().length,tile:[t.width|0,t.height|0],rows:rows.size,chips:[...document.querySelectorAll('#gxCh .gxC')].map(b=>b.textContent),minFont:Math.min(...[...document.querySelectorAll('#gxCh .gxC,#gbBkP .r2T')].map(e=>parseFloat(getComputedStyle(e).fontSize)))}});
 console.log('PAL',JSON.stringify(pal));ck('palette: 2 rows of bigger tiles',pal.rows>=2&&pal.tile[0]>=64&&pal.tile[1]>=56,JSON.stringify(pal.tile)+' rows '+pal.rows);
 ck('palette shows ≥ 10 parts at once (was 5)',pal.vis>=10,'visible '+pal.vis);ck('chips: ★ FAVS + RECENT + categories',pal.chips.some(c=>/FAVS/.test(c))&&pal.chips.some(c=>/RECENT/.test(c))&&pal.chips.length>=10);
 await shot('p1_palette');
 await tap('#gxCh [data-gxc="Plates"]');await W(800);const pl=await pe(()=>__gx.vis());ck('PLATES chip filters the tiles',pl.length>0&&pl.every(k=>GB_PC[k].cat==='Plates'),pl.slice(0,6).join(','));
 const fk=pl[1]||pl[0];await press(`#gbBkPc [data-p="${fk}"]`,900);ck('long-press stars a part',await pe(k=>__gx.S.fav.includes(k),fk),fk);
 const pc0=await ev('GB_.pc');ck('long-press does not pick the part',pc0!==fk||pl.length===1,pc0);
 await tap(`#gbBkPc [data-p="${pl[0]}"]`);await W(600);await tap('#gxCh [data-gxc="fav"]');await W(800);const fv=await pe(()=>__gx.vis());ck('★ FAVS shows the starred part',fv.includes(fk),fv.join(','));await shot('p2_favs');
 await tap('#gxCh [data-gxc="rec"]');await W(800);const rc=await pe(()=>__gx.vis());ck('RECENT shows the part just picked first',rc[0]===pl[0],rc.join(','));
 await tap('#gxCh [data-gxc="fold"]');await W(800);ck('▾ folds the palette to one row',await pe(()=>!document.querySelector('#gbx').classList.contains('gxBig')));await tap('#gxCh [data-gxc="fold"]');await W(800);
 await tap('#gxCh [data-gxc="Bricks"]');
 // ---- groups: SELECT, tap 3 parts of the roof, MAKE GROUP
 const cand=await pe(()=>{const L=GB_list(),top=Math.max(...L.map(b=>b.y+GB_PC[b.t].h)),out=[];const C=document.querySelector('#gbC').getBoundingClientRect();
  for(const b of L.slice().sort((a,c)=>(c.y+GB_PC[c.t].h)-(a.y+GB_PC[a.t].h))){const[w,d]=GB_dims(b);const q=__b25.scr(b.x+w/2,b.z+d/2,b.y+GB_PC[b.t].h);if(q.x<C.left+200||q.x>C.right-180||q.y<C.top+70||q.y>C.bottom-180)continue;const i=__sl.pick(q.x,q.y);if(i>=0&&!out.some(o=>o.i===i))out.push({i,x:q.x,y:q.y,t:b.t});if(out.length>=6)break}return out});
 console.log('cand',JSON.stringify(cand));
 await tap('#gbBkP [data-r2b="sel"]');await W(600);for(const c of cand.slice(0,3)){await tapXY(c.x,c.y);await W(900)}const ns=await ev('SL.sel.length');ck('SELECT: tap parts adds them',ns>=2,'sel '+ns);await shot('g0_selected');
 await tap('#slBar [data-s="grp"]');await W(1000);let G=await pe(()=>__gx.groups());ck('MAKE GROUP → named group in the list',G.length===1&&/Group 1/.test(G[0].name)&&await pe(()=>!document.querySelector('#gxG').hidden),JSON.stringify(G));await shot('g1_group_made');
 const g=G[0].g,gn=G[0].n;
 // rename
 await tap(`#gxG .gxR[data-g="${g}"] [data-ga="ren"]`);await W(500);await p.keyboard.press('Control+A').catch(()=>0);await p.keyboard.type('Roof');await tap(`#gxG .gxR[data-g="${g}"] [data-ga="ok"]`);await W(600);
 ck('✎ rename',await pe(()=>__gx.groups()[0].name)==='Roof',await pe(()=>__gx.groups()[0].name));
 // hide
 const tr0=await pe(()=>__gx.tris());await tap(`#gxG .gxR[data-g="${g}"] [data-ga="eye"]`);await W(1500);const tr1=await pe(()=>__gx.tris());
 ck('👁 hides the group (fewer triangles drawn)',await pe(g=>__gx.hid().includes(g),g)&&tr1<tr0,`${tr0}→${tr1}`);
 const pk=await pe(c=>__sl.pick(c.x,c.y),cand[0]);ck('hidden part cannot be picked',!cand.slice(0,3).some(c=>c.i===pk),'pick '+pk);
 await tap(`#gxG .gxR[data-g="${g}"] [data-ga="pick"]`);await W(600);ck('hidden group is not editable (no select)',await ev('SL.sel.length')===0);await shot('g2_group_hidden');
 // save keeps the hidden parts
 await tap(`#gxG .gxR[data-g="${g}"] [data-ga="eye"]`);await W(1200);ck('👁 shows it again',await pe(()=>__gx.hid().length===0&&__gx.tris())===tr0);
 // mirror (copy on the other side or flip)
 await tap(`#gxG .gxR[data-g="${g}"] [data-ga="pick"]`);await W(600);ck('row tap selects the whole group',await ev('SL.sel.length')===gn,'sel '+await ev('SL.sel.length'));
 const nb=await n();await tap(`#gxG .gxA [data-ga="mir"]`);await W(1200);G=await pe(()=>__gx.groups());const na=await n();
 ck('MIRROR (copy on the other side, or flip if it is in the middle)',(na===nb+gn&&G.length===2)||(na===nb&&/flipped/.test(await pe(()=>document.querySelector('#gsTip').textContent))),`${nb}→${na} groups ${G.map(o=>o.name).join('|')}`);
 await shot('g3_mirrored');
 // copy: lift a copy, tap the roof at another part, PLACE
 const g1=G[0].g;await tap(`#gxG .gxR[data-g="${g1}"] [data-ga="pick"]`);await W(400);if(!await pe(g=>__gx.S.act===g,g1)){await tap(`#gxG .gxR[data-g="${g1}"] [data-ga="pick"]`);await W(400)}
 const nc=await n();await tap(`#gxG .gxA [data-ga="dup"]`);await W(1000);ck('COPY lifts a copy (PLACE bar)',await ev('!!SL.carry')&&await pe(()=>!document.querySelector('#gsBar').hidden));
 for(const c of cand.slice(3).concat(cand)){await tapXY(c.x,c.y);await W(1200);if(await ev('SL.carry&&!SL.carry.bad'))break}
 await tap('#gsBar [data-g="place"]');await W(1200);const nd=await n();G=await pe(()=>__gx.groups());ck('COPY placed as its own named group',nd===nc+gn&&G.some(o=>/copy/.test(o.name)),`${nc}→${nd} ${G.map(o=>o.name).join('|')}`);await shot('g4_copied');
 // delete + undo
 const gc=G.find(o=>/copy/.test(o.name));if(gc){await tap(`#gxG .gxR[data-g="${gc.g}"] [data-ga="pick"]`);await W(400);if(!await pe(g=>__gx.S.act===g,gc.g)){await tap(`#gxG .gxR[data-g="${gc.g}"] [data-ga="pick"]`);await W(400)}
  await tap('#gxG .gxA [data-ga="del"]');await W(1000);ck('DELETE removes the whole group',await n()===nd-gc.n);await tap('#r2H [data-r2h="undo"]');await W(1000);ck('UNDO brings it back',await n()===nd)}
 // hide above
 await tap('#gxG [data-ga="close"]');await W(600);await tap('#gbBkP [data-r2b="sel"]').catch(()=>0);
 const ghost0=await ev('!!B25.gh');await tap('#b25 .gxHa');await W(1200);ck('HIDE UP removes the parts above the layer',ghost0&&await ev('!B25.gh'),'ghost before '+ghost0);await shot('h1_hide_above');
 await tap('#b25 [data-b25="dn"]');await W(800);await tap('#b25 [data-b25="dn"]');await W(1000);ck('…and stays hidden on another layer',await ev('!B25.gh&&GX.ha===1'));await shot('h2_hide_above_lower');
 await tap('#b25 .gxHa');await W(800);ck('SHOW UP brings the ghosts back',await ev('!!B25.gh'));
 // hidden group still saves
 await tap('#gbBkP [data-gx="grp"]');await W(600);G=await pe(()=>__gx.groups());await tap(`#gxG .gxR[data-g="${G[0].g}"] [data-ga="eye"]`);await W(1000);const nf=await n();
 await tap('#gbSave');await W(3000);const saved=await ev("(GAR_get().br[GAR_get().sel]||store.get('mho_build',{}).bricks||[]).length");ck('hidden group still saves (all parts)',saved===nf,`${saved}/${nf}`);
 ck('builder closed: car whole again',await ev('!GB_.bk')&&await pe(()=>{const U=GB.mesh.userData;return(U.gbM||[]).length>0}));
 console.log('ERRS',T.errs.length,JSON.stringify(T.errs.slice(0,6)));ck('0 console errors',T.errs.length===0);
 console.log('RESULT',R.filter(r=>!r[1]).length?'FAIL':'PASS',R.filter(r=>r[1]).length+'/'+R.length);await T.b.close()})().catch(e=>{console.log('CRASH',e);process.exit(1)});
