// qa25/pdfbuild.js: follow the LEGO PDF racer steps (docs/research/BUILDER_2K.md) in the garage builder with REAL taps at 852x393.
// Each step: pick the category + part from the bottom bar, turn it if needed, tap the visual centre of where the part should go, PLACE.
// Logs per step: intended footprint/layer vs where it really landed, taps used, and every failure. LAYERS=1 uses the build25 layer selector.
const L=require('./lib.js');(async()=>{const T=await L(process.argv[2],process.argv[3]);const{ev,tap,tapXY,shot}=T;const LAY=!!process.env.LAYERS;let taps=0;const fails=[];
 const t=async(s,ms)=>{taps++;return tap(s,ms)},txy=async(x,y,ms)=>{taps++;return tapXY(x,y,ms)};
 await t('#gbMenuBtn',2500);await t('#r2R [data-r2m="build"]',3000);
 // NEW BUILD → Speed Champion chassis
 await t('#gbBkP [data-r2b="more"]');await t('#r2More [data-r2a="gnb"]',1200);await t('#gnbP [data-ch="sc8"]',2500);
 if(!await ev(()=>__gb.d().bp)){}
 await t('#gbBkP [data-r2b="more"]');await t('#r2More [data-r2a="clr"]',1200);
 if(await ev(()=>__gb.GB_.mir))await t('#gbBkP [data-r2b="mir"]');if(LAY)await t('#b25 [data-b25="top"]',1200);await shot('00_chassis');
 const top0=+await ev(()=>__g9ev(`(()=>{const C={};for(const k in GB_.base){const[i,j]=k.split(',').map(Number),t=GB_top(i,j,GB_list());C[t]=(C[t]||0)+1}return Object.entries(C).sort((a,b)=>b[1]-a[1])[0][0]})()`));console.log('chassis parts',await ev(()=>__gb.list().length),'top plate',top0,'base cells',await ev(()=>__gb.cells().length));
 // PDF steps mapped to our grid: x 0-3 → i -2..1, z 0-9 → j -5..4; y = plates above the chassis top (dy)
 const S=[['p28','Plates',0,-1,-3,0,'1 red 2x8 plate'],['p28','Plates',0,-1,-5,1,'2 black 2x8 plate, 2 studs out front'],['p28','Plates',0,-1,-5,2,'3 tan 2x8 plate'],
  ['p24','Plates',1,-2,-5,3,'4 black 2x4 crosswise (front axle holder)'],['p46','Plates',0,-2,-3,3,'5 red 4x6 plate'],['p24','Plates',1,-2,3,3,'5b grey 2x4 crosswise rear'],
  ['p26','Plates',0,-1,-1,4,'6 white 2x6 plate'],['b14','Bricks',0,-2,-2,4,'8 red 1x4 brick left'],['b14','Bricks',0,1,-2,4,'8 red 1x4 brick right'],
  ['b24','Bricks',1,-2,-4,4,'10 white 2x4 brick crosswise'],['p14','Plates',0,-2,-2,7,'top plate 1x4 left on the brick'],['p22','Plates',0,-1,-5,5,'2x2 plate UNDER the white brick overhang? (nose)']];
 let i=0;for(const[pc,cat,rot,i0,j0,dy,nm]of S){i++;const n0=await ev(()=>__gb.list().length),tp0=taps;
  const cur=await ev(()=>__gb.GB_.ct||'Bricks');if(cur!==cat){await t('#gbBkP [data-r2b="cat"]');await t(`#gbBkCt [data-ct="${cat}"]`)}
  const vis=await ev(p=>{const e=document.querySelector(`#gbBkPc [data-p="${p}"]`);if(!e)return'missing';const r=e.getBoundingClientRect(),s=document.querySelector('#gbBkPc').getBoundingClientRect();return r.left>=s.left-1&&r.right<=s.right+1?'ok':'scroll'},pc);
  if(vis==='scroll'){fails.push(`S${i} ${pc}: part tile is off-screen in the strip, had to scroll`);taps++;await T.swipeTo('#gbBkPc',`#gbBkPc [data-p="${pc}"]`)}
  await t(`#gbBkPc [data-p="${pc}"]`);
  const P=await ev(p=>{const q=__gb.PC[p];return[q.w,q.d]},pc),[fw,fd]=rot%2?[P[1],P[0]]:P;
  // aim: visual centre of the target footprint, on top of whatever is there now
  let x,y;if(!LAY){const a=await ev(([i,j])=>__gb.scr(i,j),[i0,j0]),b=await ev(([i,j])=>__gb.scr(i,j),[i0+fw-1,j0+fd-1]);
  if(!a||!b){fails.push(`S${i} ${nm}: target cell not on the grid`);continue}x=(a.x+b.x)/2;y=(a.y+b.y)/2}
  if(LAY){const want=dy+top0;for(let k=0;k<12;k++){const Lc=await ev(()=>__b25.S.L);if(Lc===want)break;await t(`#b25 [data-b25="${Lc<want?'up':'dn'}"]`,400)}if(await ev(()=>__b25.S.L)!==want)fails.push(`S${i} ${nm}: could not reach layer ${dy} with ▲▼ (at ${await ev(()=>__b25.S.L)-top0})`);const q=await ev(([a,b])=>__b25.scr(a,b),[i0+fw/2,j0+fd/2]);x=q.x;y=q.y}
  const cov=await ev(([x,y])=>{const e=document.elementFromPoint(x,y);return e&&e.id==='gbC'?'':(e?(e.id||e.className):'off')},[x,y]);if(cov){fails.push(`S${i} ${nm}: target point (${x|0},${y|0}) covered by ${cov}`);}
    await txy(x,y,700);let held=await ev(()=>__g8.held());
  for(let r=0;held&&r<4&&held.r!==rot;r++){await t('#gsBar [data-g="rot"]');held=await ev(()=>__g8.held())}
  if(held&&!LAY){const want=top0+dy;let k=0;while(held&&held.y!==want&&k<6){const d=held.y<want?1:-1;await t(`#gsBar [data-g8="${d}"]`);const h2=await ev(()=>__g8.held());if(!h2||h2.y===held.y){break}held=h2;k++}}
  if(!held){fails.push(`S${i} ${nm}: tap held nothing (tip: ${await ev(()=>{const e=document.querySelector('#gsTip');return e&&e.textContent})})`);continue}
  await t('#gsBar [data-g="place"]',700);const n1=await ev(()=>__gb.list().length);const last=await ev(()=>{const L=__gb.list();return L[L.length-1]});
  const got=n1>n0?`${last.t} x${last.x} z${last.z} y${last.y-top0} r${last.r}`:'NOT PLACED';const ok=n1>n0&&last.x===i0&&last.z===j0&&last.y-top0===dy&&last.r%2===rot%2;
  if(!ok)fails.push(`S${i} ${nm}: wanted x${i0} z${j0} y${dy} r${rot} → got ${got}`);console.log(`S${i} ${ok?'OK  ':'FAIL'} ${nm} | wanted x${i0} z${j0} y${dy} r${rot} | got ${got} | taps ${taps-tp0}`);
  if(i===4||i===8||i===S.length)await shot(`s${String(i).padStart(2,'0')}`)}
 console.log('TOTAL taps',taps,'fails',fails.length);for(const f of fails)console.log(' -',f);await T.close()})();
