// su/guide.js <url> [outdir]: v88l BUILD GUIDE by real taps: RIDES → ▶ GUIDE → steps/play/×2/slider → done → BUILD IT (tap the ghost, PLACE IT) → BUILD ⋯ MORE → guide on a bus
const E=require('../bc/enter.js');const fs=require('fs');const OUT=process.argv[3]||'su/guide';fs.mkdirSync(OUT,{recursive:true});
(async()=>{const T=await E(process.argv[2],{gfx:process.env.GFX||'normal',tick:0});const{p,tap,ev,tapXY}=T;const shot=async(n,w=1500)=>{await p.waitForTimeout(w);await p.screenshot({path:`${OUT}/${n}.png`});console.log('shot',n)};
 const fit=async n=>console.log(n,await ev(`(()=>{const c=$('#gbC').getBoundingClientRect(),A=SB_area(c.width,c.height),b=new THREE.Box3();for(const o of GB.mesh.userData.gbM||[])b.union(new THREE.Box3().setFromObject(o));for(const d of SB.drop)b.union(new THREE.Box3().setFromObject(d.g));let l=1e9,r=-1e9,t=1e9,B=-1e9;for(let i=0;i<8;i++){const v=new THREE.Vector3(i&1?b.max.x:b.min.x,i&2?b.max.y:b.min.y,i&4?b.max.z:b.min.z).project(GB.cam);const x=(v.x+1)/2*c.width,y=(1-v.y)/2*c.height;l=Math.min(l,x);r=Math.max(r,x);t=Math.min(t,y);B=Math.max(B,y)}return JSON.stringify({car:[l,t,r,B].map(Math.round),area:[A.l,A.t,A.r,A.b].map(Math.round),k:SB.k,n:SB.S.length,play:SB.play})})()`));
 console.log('steps',await ev(`JSON.stringify(GAR_SETS.filter(S=>S.car).map(S=>{const A=S.car(),B=GAR_arr(A),St=SB_steps(B,A);return S.id+':'+B.length+'/'+St.length+(A.steps?'*':'')+(St.some(s=>s.length>4||!s.length)?'!BAD':'')+(St.flat().length!==B.length?'!MISS':'')}).join(' '))`));
 await tap('#gbMenuBtn');await p.waitForTimeout(2000);await tap('#r2R [data-r2m="rides"]');await p.waitForTimeout(1500);
 await shot('01_rides');
 if(!await tap('#g9Col [data-sbg="t_su"]'))return console.log('FAIL no guide button');
 await shot('02_step1',900);await fit('step1');
 await tap('#sbG [data-sb="play"]');for(let i=0;i<9;i++){await tap('#sbG [data-sb="next"]');await p.waitForTimeout(150)}await shot('03_step10',1200);await fit('step10');
 await tap('#sbG [data-sb="prev"]');await shot('04_prev',900);await fit('prev');
 await tap('#sbG [data-sb="sp"]');await tap('#sbG [data-sb="play"]');await shot('05_play_x2',4000);await fit('play');
 await p.evaluate(()=>{const s=document.querySelector('#sbG .sbSl');s.value=s.max;s.dispatchEvent(new Event('input'))});await shot('06_done',1500);await fit('done');
 await p.evaluate(()=>{const s=document.querySelector('#sbG .sbSl');s.value=5;s.dispatchEvent(new Event('input'))});await p.waitForTimeout(800);
 await tap('#sbG [data-sb="diy"]');await shot('07_diy',2000);console.log('diy',await ev('JSON.stringify(__sb.miss())'),'bricks',await ev('GB_list().length'));
 for(let i=0;i<3;i++){const xy=await ev(`(()=>{const c=SB_miss();if(!c)return null;const M=[],L=[];GB_brickGeo(c.m[0],M,L);const g=mergeGeometries(M);g.computeBoundingBox();const v=g.boundingBox.getCenter(new THREE.Vector3());SB_host().localToWorld(v);GB_cam();v.project(GB.cam);const c=$('#gbC').getBoundingClientRect();return[c.left+(v.x+1)/2*c.width,c.top+(1-v.y)/2*c.height]})()`);
  console.log('ghost at',xy);if(!xy)break;await tapXY(xy[0],xy[1]);await p.waitForTimeout(700);const pl=await p.$('#gsBar [data-a="place"],#gsBar button');const s=await ev('JSON.stringify(__sb.miss())+" bricks "+GB_list().length+" held "+!!(typeof GS!=="undefined"&&GS.held)');console.log('after tap',s);
  if(await ev('typeof GS!=="undefined"&&!!GS.held')){await ev('GS_place()');console.log('placed via PLACE',await ev('JSON.stringify(__sb.miss())+" "+GB_list().length'))}}
 await shot('08_diy_tapped',800);
 await tap('#sbD [data-sbd="hint"]');await shot('09_hint',800);console.log('hint',await ev('JSON.stringify(__sb.miss())+" "+GB_list().length'));
 await tap('#sbD [data-sbd="x"]');await p.waitForTimeout(1500);console.log('after exit bricks',await ev('GB_list().length'),'bk',await ev('GB_.bk'),'tpl n',await ev(`__su.n('t_su')`));
 // BUILD ⋯ MORE → BUILD GUIDE on the bus (auto steps)
 await tap('#r2R [data-r2m="rides"]');await p.waitForTimeout(1000);
 const bus=await tap('#g9Col .g9Card[data-gc="t_bus"] .g9Ed');await p.waitForTimeout(2500);console.log('bus build',bus,await ev('GB_.bk'));
 await tap('#gbBkP [data-r2b="more"]');await shot('10_more',800);await tap('#r2More [data-r2a="sbg"]');await shot('11_bus_guide',1500);await fit('bus');
 await tap('#sbG [data-sb="x"]');await p.waitForTimeout(1500);console.log('back in build',await ev('GB_.bk'),await ev('$("#gbx").className'));await shot('12_back_build',500);
 console.log('errs',T.errs.length,JSON.stringify(T.errs.slice(0,5)));await T.b.close()})().catch(e=>{console.log('FAIL',e);process.exit(1)});
