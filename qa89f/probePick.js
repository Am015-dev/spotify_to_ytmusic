// render-pick: which mesh draws the pixel at NDC (sx,sy) — hide candidates one by one and compare the pixel (works with freed CPU arrays)
const fs=require('fs');const{chromium,boot}=require('../tools/d24lib');const URL=process.argv[2],OUT=process.argv[3]||'qa89f/pick';fs.mkdirSync(OUT,{recursive:true});
const X=+(process.env.X||1049),Z=+(process.env.Z||-553),A=+(process.env.A||(7/8*Math.PI*2)),SIDE=+(process.env.SIDE||-1);
const PTS=JSON.parse(process.env.PTS||'[[0.41,0.24],[-0.81,0.03],[0.3,0.0]]');
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const{p,errs,shot}=await boot(b,{city:'ath',url:URL,phone:true});
 const ev=s=>p.evaluate(s=>__oc.ev(s),s);
 await p.evaluate(([x,z,h])=>{__mho.warp(x,z,h,true)},[X,Z,A]);for(let i=0;i<40;i++)await p.evaluate(()=>__tick(10));
 await ev(`(()=>{const h=RO.h+(${SIDE})*Math.PI/2;window.__camLock=[new THREE.Vector3(RO.x-Math.sin(h)*2,RO.y+3,RO.z-Math.cos(h)*2),new THREE.Vector3(RO.x+Math.sin(h)*20,RO.y+4,RO.z+Math.cos(h)*20)];
   if(!window.__rcO){window.__rcO=roamCam;roamCam=function(){const r=window.__rcO.apply(this,arguments);if(window.__camLock){camera.position.copy(window.__camLock[0]);camera.lookAt(window.__camLock[1])}return r}}})()`);
 for(let i=0;i<3;i++)await p.evaluate(()=>__tick(1));await shot(`${OUT}/view.jpg`);
 const r=await ev(`(()=>{camera.position.copy(__camLock[0]);camera.lookAt(__camLock[1]);camera.updateMatrixWorld(true);scene.updateMatrixWorld(true);
  const W=426,H=196,rt=new THREE.WebGLRenderTarget(W,H),buf=new Uint8Array(4);const R=__dbg.renderer||renderer;
  const px=(sx,sy)=>{R.setRenderTarget(rt);R.render(scene,camera);R.readRenderTargetPixels(rt,Math.round((sx+1)/2*W),Math.round((sy+1)/2*H),1,1,buf);R.setRenderTarget(null);return[buf[0],buf[1],buf[2]]};
  const out=[];const rc=new THREE.Raycaster();
  for(const[sx,sy]of ${JSON.stringify(PTS)}){const c0=px(sx,sy);rc.setFromCamera(new THREE.Vector2(sx,sy),camera);const C=[];
   scene.traverseVisible(o=>{if(!o.isMesh||!o.geometry)return;const g=o.geometry;if(!g.boundingSphere)return;const S=g.boundingSphere.clone().applyMatrix4(o.matrixWorld);if(rc.ray.intersectsSphere(S)&&S.center.distanceTo(camera.position)<S.radius+400)C.push(o)});
   const hits=[];for(const o of C){o.visible=false;const c1=px(sx,sy);o.visible=true;const dd=Math.abs(c1[0]-c0[0])+Math.abs(c1[1]-c0[1])+Math.abs(c1[2]-c0[2]);if(dd>12){let path=[];for(let q=o;q&&path.length<4;q=q.parent)path.push((q.name||q.type)+'{'+Object.keys(q.userData||{}).slice(0,5).join(',')+'}');
     const m=o.material;hits.push({dd,path:path.join('<'),vc:o.geometry.attributes.position?o.geometry.attributes.position.count:-1,arr:!!(o.geometry.attributes.position&&o.geometry.attributes.position.array),inst:o.isInstancedMesh?o.count:0,mat:m&&(m.type+':'+(m.map?'map':'nomap')+':'+(m.color?m.color.getHexString():'')+':'+(m.vertexColors?'vc':'')+':'+(m.name||'')),attrs:Object.keys(o.geometry.attributes).join(','),bs:+o.geometry.boundingSphere.radius.toFixed(0),ud:JSON.stringify(o.userData).slice(0,120)})}}
   out.push({sx,sy,c0,nC:C.length,hits})}rt.dispose();return JSON.stringify(out)})()`);
 for(const q of JSON.parse(r)){console.log('pt',q.sx,q.sy,'rgb',q.c0,'cands',q.nC);for(const h of q.hits)console.log('   ',JSON.stringify(h))}
 console.log('errs',JSON.stringify(errs));await b.close()})();
