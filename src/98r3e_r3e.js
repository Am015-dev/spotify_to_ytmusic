// r3E (docs/REVIEW_2K_3.md #9 and other bugs): GO rv2k3/builder. BUILD opens a baseplate grid + START piece; centre 50 % of the canvas < 20 % pure black.
// The test page runs with draw=0 (renderer.render is a stub), so the GO switches drawing on for ONE synchronous render and reads the canvas in the same task.
function R3E_builderGo(){if(typeof BX==='undefined')return'📍 builder missing ❌';const T=window.__tq&&__tq.o,was=BX.on;try{if(!BX.on)BX_open();const ok=b=>b?' ✅':' ❌',cam=BX.cam,d0=T&&T.draw;if(T)T.draw=1;
  cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix();BX_camBuild();renderer.setRenderTarget(null);renderer.render(BX.sc,cam);
  const cv=renderer.domElement,w=cv.width,h=cv.height,o=document.createElement('canvas');o.width=w;o.height=h;const x=o.getContext('2d',{willReadFrequently:true});x.drawImage(cv,0,0);if(T)T.draw=d0;
  const x0=Math.floor(w*.25),y0=Math.floor(h*.25),W=Math.floor(w*.5),H=Math.floor(h*.5),D=x.getImageData(x0,y0,W,H).data;let blk=0;for(let i=0;i<D.length;i+=4)if(D[i]<10&&D[i+1]<10&&D[i+2]<10)blk++;
  const pct=100*blk/(D.length/4),np=BX.pcs.filter(p=>!p.dead).length,gr=!!BX.gridG;
  return'📍 BUILDER VIEW · '+np+' piece(s) (START ≥ 1)'+ok(np>=1)+' · grid '+(gr?'on':'off')+ok(gr)+' · pure-black pixels in the centre 50 %: '+pct.toFixed(1)+' % (< 20)'+ok(pct<20)}
 finally{if(!was)try{BX_close()}catch(e){}}}
(function R3E_reg(i){const C=window.__chk;if(C&&C.GO){C.GO['rv2k3/builder']=[{c:'fra',n:'builder view',fn:R3E_builderGo}];return}if(i<600)setTimeout(()=>R3E_reg(i+1),100)})(0);
