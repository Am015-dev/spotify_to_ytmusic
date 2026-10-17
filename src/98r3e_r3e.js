// r3E (docs/REVIEW_2K_3.md #9 and other bugs): GO rv2k3/builder. BUILD opens a baseplate grid + START piece; centre 50 % of the canvas < 20 % pure black.
// The test page runs with draw=0 (renderer.render is a stub), so the GO switches drawing on for ONE synchronous render and reads the canvas in the same task.
function R3E_builderGo(){if(typeof BX==='undefined')return'📍 builder missing ❌';const T=window.__tq&&__tq.o,was=BX.on,IDS=['#menu','#topBtns','#hud','#touch'],hid=IDS.map(i=>{const e=$(i);return e?e.hidden:null});try{if(!BX.on)BX_open();const ok=b=>b?' ✅':' ❌',cam=BX.cam,d0=T&&T.draw;if(T)T.draw=1;
  cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();BX_camBuild();renderer.setRenderTarget(null);renderer.render(BX.sc,cam);
  const cv=renderer.domElement,w=cv.width,h=cv.height,o=document.createElement('canvas');o.width=w;o.height=h;const x=o.getContext('2d',{willReadFrequently:true});x.drawImage(cv,0,0);if(T)T.draw=d0;
  const x0=Math.floor(w*.25),y0=Math.floor(h*.25),W=Math.floor(w*.5),H=Math.floor(h*.5),D=x.getImageData(x0,y0,W,H).data;let blk=0;for(let i=0;i<D.length;i+=4)if(D[i]<10&&D[i+1]<10&&D[i+2]<10)blk++;
  const pct=100*blk/(D.length/4),np=BX.pcs.filter(p=>!p.dead).length,gr=!!BX.gridG;
  return'📍 BUILDER VIEW · '+np+' piece(s) (START ≥ 1)'+ok(np>=1)+' · grid '+(gr?'on':'off')+ok(gr)+' · pure-black pixels in the centre 50 %: '+pct.toFixed(1)+' % (< 20)'+ok(pct<20)}
 finally{if(!was)try{BX_close()}catch(e){}IDS.forEach((i,j)=>{const e=$(i);if(e&&hid[j]!==null)e.hidden=hid[j]});/* BX_open hides the HUD and touch pad; hand them back as they were */}}
function R3E_visibleGo(){if(typeof BX==='undefined')return'📍 builder missing ❌';const was=BX.on,IDS=['#menu','#topBtns','#hud','#touch'],hid=IDS.map(i=>{const e=$(i);return e?e.hidden:null}),ok=b=>b?' ✅':' ❌';
 try{try{if(typeof gbOpen==='function'&&($('#gbx')||{hidden:1}).hidden)gbOpen()}catch(e){}
  if(!BX.on)BX_open();
  const gb=$('#gbx'),cx=Math.floor(innerWidth/2),cy=Math.floor(innerHeight/2),top=document.elementFromPoint(cx,cy),cover=!!(gb&&!gb.hidden)||!!(top&&top.closest&&top.closest('#gbx')),T=window.__tq&&__tq.o,d0=T&&T.draw;if(T)T.draw=1;
  BX.cam.aspect=innerWidth/innerHeight;BX.cam.updateProjectionMatrix();BX_camBuild();renderer.setRenderTarget(null);renderer.render(BX.sc,BX.cam);
  const cv=renderer.domElement,w=cv.width,h=cv.height,o=document.createElement('canvas');o.width=w;o.height=h;const x=o.getContext('2d',{willReadFrequently:true});x.drawImage(cv,0,0);if(T)T.draw=d0;
  const D=x.getImageData(Math.floor(w*.25),Math.floor(h*.25),Math.floor(w*.5),Math.floor(h*.5)).data;let blk=0;for(let i=0;i<D.length;i+=4)if(D[i]<10&&D[i+1]<10&&D[i+2]<10)blk++;
  const pct=100*blk/(D.length/4);let meshes=0;BX.sc.traverse(m=>{if(m.isMesh&&m.visible)meshes++});
  return'📍 BUILDER VISIBLE (after garage) · garage overlay over the canvas: '+(cover?'yes':'no')+ok(!cover)+' · track meshes '+meshes+' (> 0)'+ok(meshes>0)+' · pure-black pixels in the centre 50 %: '+pct.toFixed(1)+' % (< 20)'+ok(pct<20)}
 finally{if(!was)try{BX_close()}catch(e){}IDS.forEach((i,j)=>{const e=$(i);if(e&&hid[j]!==null)e.hidden=hid[j]})}}
function R3E_popGo(){if(typeof R3U==='undefined')return'📍 level card missing ❌';const ok=b=>b?' ✅':' ❌',q0=R3U.q.slice();
 try{const U=$('#r3Up');R3U.q=[];if(typeof gbOpen==='function'&&($('#gbx')||{hidden:1}).hidden)gbOpen();R3U.q.push([2,3]);R3_upPump();const hidden=U.hidden,kept=R3U.q.length===1;
  try{gbClose(false)}catch(e){}R3_upPump();const shown=!U.hidden;U.hidden=true;R3U.q=q0;
  return'📍 LEVEL UP vs GARAGE · hidden while the garage is open'+ok(hidden)+' · kept queued'+ok(kept)+' · shows after the garage closes'+ok(shown)}
 finally{R3U.q=q0}}
(function R3E_reg(i){const C=window.__chk;if(C&&C.GO){C.GO['rv2k3/builder']=[{c:'fra',n:'builder view',fn:R3E_builderGo}];try{for(const[id,t]of[['levelpop','garage open: LEVEL UP card stays hidden (queued), shows after the garage closes'],['visible','builder opened from the garage: no garage overlay on the canvas, track meshes > 0, centre not black']])if(!OD_CHECKLIST.some(q=>q.ver==='bld1'&&q.id===id))OD_CHECKLIST.push({ver:'bld1',id,area:id==='visible'?'build':'ui',text:t})}catch(e){}C.GO['garage/levelpop']=[{c:'fra',n:'level up queued',fn:R3E_popGo}];C.GO['builder/visible']=[{c:'fra',n:'builder after garage',fn:R3E_visibleGo}];return}if(i<600)setTimeout(()=>R3E_reg(i+1),100)})(0);
