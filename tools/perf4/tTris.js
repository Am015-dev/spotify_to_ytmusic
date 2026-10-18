// tTris.js: draw calls / triangles per scene group at 3 fixed views per city (spawn, headings 0/120/240), + rAF frame ms (median/p95/max).
//   node tools/perf4/tTris.js <url …/index.html> <out.json> [q=low|high] [cities fra,ath]
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');
(async()=>{const U=process.argv[2],O=process.argv[3]||'tris.json',Q=process.argv[4]||'low',C=(process.argv[5]||'fra,ath').split(','),R={};
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const c of C){const ctx=await b.newContext({viewport:{width:852,height:393}});await ctx.addInitScript(()=>{window.__dbg=1});
  const p=await ctx.newPage();p.setDefaultTimeout(240000);const errs=[];p.on('pageerror',e=>errs.push(e.message.slice(0,120)));
  await p.goto(U+(U.includes('?')?'&':'?')+'test='+c+'&q='+Q);const rdy=()=>p.waitForFunction(()=>window.__tq&&__tq.ready,null,{polling:250,timeout:240000});await rdy();await p.waitForTimeout(4000);await rdy();R[c+'_q']=await p.evaluate(()=>__oc.ev('SET.q'));
  await p.evaluate(()=>__oc.ev(`(()=>{const rd=renderer.renderBufferDirect.bind(renderer);window.__P4={on:0,m:new Map(),cam:camera};
   const lab=q=>q.isGroup&&!q.name&&q.children.length?'G('+(q.children[0].name||q.children[0].type)+','+q.children.length+')#'+q.parent.children.indexOf(q):q===HUB.grp?'HUB':(typeof RO!=='undefined'&&q===RO.grp)?'RO':(typeof WORLD!=='undefined'&&q===WORLD)?'WORLD':(q.name||q.type)+(q.parent?'#'+q.parent.children.indexOf(q):'');
   const vs=new THREE.Vector3(),sp=new THREE.Sphere();const key=o=>{const ch=[];for(let q=o;q&&q.parent;q=q.parent)ch.push(lab(q));const g=o.geometry;let d=-1,r=-1;
    if(o.isInstancedMesh){if(!o.boundingSphere)o.computeBoundingSphere();sp.copy(o.boundingSphere)}else{if(!g.boundingSphere)g.computeBoundingSphere();sp.copy(g.boundingSphere).applyMatrix4(o.matrixWorld)}
    d=Math.max(0,sp.center.distanceTo(camera.position)-sp.radius);r=sp.radius;const db=d<100?'a<100':d<300?'b<300':d<700?'c<700':'d>700';
    return ch.reverse().slice(0,2).join('/')+(o.isInstancedMesh?' [I]':'')+' '+db+(r>400?' R'+Math.round(r):'')};
   renderer.renderBufferDirect=function(cam,sc,g,m,o,gr){const P=window.__P4;if(P.on){const sh=cam!==camera&&!cam.isOrthographicCamera?0:(cam.isOrthographicCamera&&cam!==camera?1:0);
    let n=g.index?g.index.count:g.attributes.position?g.attributes.position.count:0;if(gr)n=gr.count;else if(g.drawRange&&g.drawRange.count!==Infinity)n=Math.min(n,g.drawRange.count);
    const t=(m.wireframe?0:n/3)*(o.isInstancedMesh?o.count:(g.isInstancedBufferGeometry?g.instanceCount:1));const k=(sh?'SHADOW ':'')+key(o);const e=P.m.get(k)||[0,0];e[0]++;e[1]+=t;P.m.set(k,e)}return rd(cam,sc,g,m,o,gr)}})()`));
  const pos=await p.evaluate(()=>__oc.ev('[RO.x,RO.z,RO.h]'));R[c]=[];
  for(const h of[0,2.094,4.189]){await p.evaluate(([x,z,h])=>__mho.warp(x,z,h,true),[pos[0],pos[1],pos[2]+h]);await p.waitForTimeout(2500);
   const r=await p.evaluate(()=>new Promise(res=>{const T=[];let l=performance.now();const f=t=>{T.push(t-l);l=t;if(T.length===40){__P4.m=new Map();__P4.on=1}
     if(T.length===41){__P4.on=0}
     if(T.length<61)requestAnimationFrame(f);else{const S=T.slice(2).sort((a,b)=>a-b);const pc=q=>+S[Math.min(S.length-1,Math.floor(q*S.length))].toFixed(1);
      const L=[...__P4.m].sort((a,b)=>b[1][1]-a[1][1]);let calls=0,tris=0;for(const[,e]of L){calls+=e[0];tris+=e[1]}
      res({calls,tris:Math.round(tris),ms:{med:pc(.5),p95:pc(.95),max:pc(1)},top:L.map(([k,e])=>k+' | '+e[0]+' | '+Math.round(e[1]))})}};requestAnimationFrame(f)}));
   R[c].push(r);console.log(c,'h',h.toFixed(1),'calls',r.calls,'tris',r.tris,'ms',JSON.stringify(r.ms))}
  if(c==='ath'){await p.evaluate(([x,z,h])=>__mho.warp(x,z,h,true),pos);await p.waitForTimeout(2500);await p.screenshot({path:O.replace(/\.json$/,'')+'_ath.jpg',type:'jpeg',quality:70})}
  R[c+'_err']=errs;await ctx.close()}
 fs.writeFileSync(O,JSON.stringify(R,null,1));await b.close()})();
