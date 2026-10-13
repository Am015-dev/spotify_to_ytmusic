// t4/g8sel.js: 852x393 real touch on an existing car. SELECT → tap a part → MOVE → tap a new spot → PLACE; SELECT UP cluster → MOVE → PLACE;
// GROUP; COPY; ROTATE; COLOUR; DELETE; then a real tap grid over the car in BUILD mode (dead = no held part after the tap). usage: node t4/g8sel.js <url> <outdir> [iframe]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const O=process.argv[3];fs.mkdirSync(O,{recursive:true});const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const ctx=await b.newContext({viewport:{width:852,height:393},isMobile:true,hasTouch:true});const pg=await ctx.newPage();const errs=[];pg.on('pageerror',e=>errs.push(String(e)));pg.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await pg.goto(process.argv[2]);const IF=process.argv[4]==='iframe';let p=pg;if(IF){await pg.waitForTimeout(3000);p=pg.frames().find(f=>f!==pg.mainFrame())}
 await p.waitForFunction(()=>window.__mho&&!document.querySelector('#topBtns').hidden,null,{timeout:240000});const cdp=await ctx.newCDPSession(pg);
 const tapXY=async(x,y)=>{const tp=[{x,y,id:1,radiusX:4,radiusY:4,force:1}];await Promise.all([cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:tp}),cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})]);await pg.waitForTimeout(700)};
 const tap=async s=>{const e=await p.$(s);const bb=e&&await e.boundingBox();if(!bb){console.log('NO',s);return 0}await tapXY(bb.x+bb.width/2,bb.y+bb.height/2);return 1};
 const shot=async n=>{await pg.waitForTimeout(900);await pg.screenshot({path:`${O}/${n}.png`});console.log('shot',n)};const ev=(f,a)=>p.evaluate(f,a);
 await ev(()=>document.querySelector('#gbMenuBtn').click());await pg.waitForTimeout(1500);await ev(()=>__gb.enter());await pg.waitForTimeout(3500);
 // map visible parts to screen points
 const map=await ev(()=>{const M={};for(let y=70;y<245;y+=14)for(let x=180;x<660;x+=14){const i=__sl.pick(x,y);if(i>=0){(M[i]=M[i]||[]).push([x,y])}}const L=__sl.bricks();const out=[];for(const k in M){const P=M[k];P.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const q=P[P.length>>1];
   const b=L[k];const above=L.filter(o=>o!==b&&o.y>b.y).length;out.push({i:+k,t:b.t,x:b.x,z:b.z,y:b.y,n:P.length,pt:q})}return out.sort((a,b)=>b.n-a.n)});
 console.log('visible parts',map.length,JSON.stringify(map.slice(0,6)));
 const L=()=>ev(()=>__sl.bricks());const n=async()=>(await L()).length;
 // 1) select + MOVE
 await tap('#gbBkT [data-a="sel"]');const A=map.find(m=>!/^(w|T|drv|stw)/.test(m.t))||map[0];await tapXY(A.pt[0],A.pt[1]);let s=await ev(()=>__sl.sel());console.log('select',A.t,'→',JSON.stringify(s));await shot('01_selected');
 const before=(await L())[s[0]];const n0=await n();await tap('#slBar [data-s="move"]');console.log('carry',JSON.stringify(await ev(()=>__sl.carry())));
 // a spot a few cells away: another visible part's point
 const B=map.find(m=>m.i!==A.i&&Math.hypot(m.pt[0]-A.pt[0],m.pt[1]-A.pt[1])>60)||map[1];await tapXY(B.pt[0],B.pt[1]);console.log('carry@',JSON.stringify(await ev(()=>__sl.carry())));await shot('02_move_ghost');
 await tap('#gsBar [data-g="place"]');const after=await L();const moved=after.find(o=>o.t===before.t&&(o.x!==before.x||o.z!==before.z||o.y!==before.y)&&!(await0=false));console.log('MOVE count',n0,'→',after.length,'moved',JSON.stringify(before),'→',JSON.stringify(after.slice(-1)[0]));await shot('03_moved');
 // 2) SELECT UP: tap the lowest visible part that has parts resting on it
 await tap('#slBar [data-s="none"]');const C=await ev(M=>{const L=__sl.bricks(),dims=b=>{const P=__gb.PC[b.t];return b.r%2?[P.d,P.w]:[P.w,P.d]},ov=(a,b)=>{const[aw,ad]=dims(a),[bw,bd]=dims(b);return a.x<b.x+bw&&a.x+aw>b.x&&a.z<b.z+bd&&a.z+ad>b.z};
   let best=null;for(const m of M){const b=L[m.i];if(!b)continue;const on=L.filter(o=>o.y===b.y+__gb.PC[b.t].h&&ov(o,b)).length;if(on&&(!best||on>best.on))best={...m,on}}return best},await ev(()=>{const M={};for(let y=70;y<245;y+=14)for(let x=180;x<660;x+=14){const i=__sl.pick(x,y);if(i>=0)(M[i]=M[i]||[]).push([x,y])}return Object.entries(M).map(([i,P])=>({i:+i,pt:P[P.length>>1]}))}));
 console.log('cluster base',JSON.stringify(C));if(C){await tapXY(C.pt[0],C.pt[1]);const s1=(await ev(()=>__sl.sel())).length;await tap('#slBar [data-s="up"]');const s2=(await ev(()=>__sl.sel())).length;console.log('SELECT UP',s1,'→',s2);await shot('04_select_up');
  const snapA=JSON.stringify(await L());const nA=await n();await tap('#slBar [data-s="move"]');const ca=await ev(()=>__sl.carry());
  // try spots until the cluster fits (green), like a player would
  const spots=await ev(()=>{const o=[];for(let y=80;y<240;y+=24)for(let x=220;x<640;x+=30)o.push([x,y]);return o});let ok=0;for(const[x,y]of spots){await tapXY(x,y);const c=await ev(()=>__sl.carry());if(c&&!c.bad&&(c.x!==ca.x||c.z!==ca.z)){ok=1;break}}
  console.log('cluster carry',JSON.stringify(await ev(()=>__sl.carry())));await shot('05_cluster_ghost');await tap('#gsBar [data-g="place"]');console.log('CLUSTER MOVE count',nA,'→',await n(),'changed',snapA!==JSON.stringify(await L()),'sel',(await ev(()=>__sl.sel())).length);await shot('06_cluster_moved')}
 // 3) GROUP: the moved cluster is selected; GROUP, deselect, tap one → all selected
 await tap('#slBar [data-s="grp"]');const g=(await ev(()=>__sl.sel())).length;await tap('#slBar [data-s="none"]');const sp=await ev(()=>{const S=__sl.bricks();for(let y=70;y<245;y+=14)for(let x=180;x<660;x+=14){const i=__sl.pick(x,y);if(i>=0&&S[i].g)return[x,y]}return null});
 if(sp){await tapXY(sp[0],sp[1]);console.log('GROUP',g,'tap one →',(await ev(()=>__sl.sel())).length)}else console.log('GROUP no visible member');
 // 4) COPY, ROTATE, COLOUR, DELETE on the selection
 let c0=await n();await tap('#slBar [data-s="dup"]');for(const[x,y]of await ev(()=>{const o=[];for(let y=90;y<240;y+=30)for(let x=240;x<640;x+=40)o.push([x,y]);return o})){await tapXY(x,y);const c=await ev(()=>__sl.carry());if(c&&!c.bad)break}
 await tap('#gsBar [data-g="place"]');console.log('COPY',c0,'→',await n());await shot('07_copy');
 c0=await n();await tap('#slBar [data-s="rot"]');const rc=await ev(()=>__sl.carry());if(rc&&rc.bad){for(const[x,y]of [[300,150],[420,120],[500,170],[360,200]]){await tapXY(x,y);const c=await ev(()=>__sl.carry());if(c&&!c.bad)break}}await tap('#gsBar [data-g="place"]');console.log('ROTATE',c0,'→',await n(),JSON.stringify(rc));
 await tap('#gbBkCl .gbCl[data-c="2"]');const cols=(await L()).filter((o,i)=>0);const sc=await ev(()=>{const L=__sl.bricks();return __sl.sel().map(i=>L[i].c)});console.log('COLOUR yellow',JSON.stringify(sc));await shot('08_colour');
 c0=await n();const k=(await ev(()=>__sl.sel())).length;await tap('#slBar [data-s="del"]');console.log('DELETE',c0,'-',k,'→',await n());
 // 5) undo/redo with the selection tools
 await tap('#gbBkT [data-a="undo"]');console.log('undo →',await n());
 // 6) real tap grid over the car in BUILD mode with a 1x1 brick: dead = no held part
 await tap('#gbBkT [data-a="add"]');await tap('#gbBkCt [data-ct="Bricks"]');await tap('#gbBkPc [data-p="b11"]');let dead=[],tot=0;
 const grid=await ev(()=>{const o=[];for(let y=80;y<245;y+=22)for(let x=200;x<660;x+=34){if(__sl.pick(x,y)>=0||JSON.parse(__gnb.dbg(x,y)).h)o.push([x,y])}return o});
 for(const[x,y]of grid){tot++;await tapXY(x,y);let h=await ev(()=>!!__gs.held());if(!h){await tapXY(x,y);h=await ev(()=>!!__gs.held());if(h)console.log('needed 2 taps',x,y)}if(!h)dead.push([x,y]);await tap('#gsBar [data-g="cancel"]')}
 console.log('TAP GRID',tot,'taps on the car, dead',dead.length,JSON.stringify(dead));await shot('09_end');
 console.log('ERR',errs.slice(0,8));await b.close()})();
