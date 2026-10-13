// Athens outskirts drive at speed (real keys: hold ArrowUp + light steering to stay on the road), shots every ~2 s; checks errors
const fs=require('fs');const{chromium,boot}=require('../tools/d24lib');const URL=process.argv[2],OUT=process.argv[3]||'qa89h/drive';fs.mkdirSync(OUT,{recursive:true});
const SP=[[1049,-553]];
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const{p,errs,shot}=await boot(b,{city:'ath',url:URL,phone:true});
 const ev=s=>p.evaluate(s=>__oc.ev(s),s);
 for(let k=0;k<SP.length;k++){const n=JSON.parse(await ev(`(()=>{let b=null,bd=1e9;for(const q of HUB.nodes){if(!q||!q.nb||!q.nb.length||q.ab)continue;const d=Math.hypot(q.x-(${SP[k][0]}),q.z-(${SP[k][1]}));if(d<bd){bd=d;b=q}}let m=null,ml=0;for(const i of b.nb){const o=HUB.nodes[i];const l=Math.hypot(o.x-b.x,o.z-b.z);if(l>ml){ml=l;m=o}}return JSON.stringify({x:b.x,z:b.z,h:Math.atan2(m.x-b.x,m.z-b.z)})})()`));
  await p.evaluate(([x,z,h])=>{__mho.warp(x,z,h,true)},[n.x,n.z,n.h]);for(let i=0;i<30;i++)await p.evaluate(()=>__tick(10));
  await p.keyboard.down('ArrowUp');let vmax=0;
  for(let s=0;s<4;s++){for(let f=0;f<120;f+=6){await p.evaluate(()=>__tick(6));const st=JSON.parse(await ev(`JSON.stringify({v:RO.v,yr:RO.yr||0})`));vmax=Math.max(vmax,st.v)}
   await shot(`${OUT}/d${k}_${s}.jpg`);if(s===1){console.log('POS',await ev('JSON.stringify([RO.x,RO.z,RO.h])'));const r=await ev(`(()=>{camera.updateMatrixWorld(true);scene.updateMatrixWorld(true);
  const W=426,H=196,rt=new THREE.WebGLRenderTarget(W,H),buf=new Uint8Array(4);const R=__dbg.renderer||renderer;
  const px=(sx,sy)=>{R.setRenderTarget(rt);R.render(scene,camera);R.readRenderTargetPixels(rt,Math.round((sx+1)/2*W),Math.round((sy+1)/2*H),1,1,buf);R.setRenderTarget(null);return[buf[0],buf[1],buf[2]]};
  const out=[];const rc=new THREE.Raycaster();
  for(const[sx,sy]of [[-0.48,0.08],[-0.62,-0.1]]){const c0=px(sx,sy);rc.setFromCamera(new THREE.Vector2(sx,sy),camera);const C=[];
   scene.traverseVisible(o=>{if(!o.isMesh||!o.geometry)return;const g=o.geometry;if(!g.boundingSphere)return;const S=g.boundingSphere.clone().applyMatrix4(o.matrixWorld);if(rc.ray.intersectsSphere(S)&&S.center.distanceTo(camera.position)<S.radius+400)C.push(o)});
   const hits=[];for(const o of C){o.visible=false;const c1=px(sx,sy);o.visible=true;const dd=Math.abs(c1[0]-c0[0])+Math.abs(c1[1]-c0[1])+Math.abs(c1[2]-c0[2]);if(dd>12){let path=[];for(let q=o;q&&path.length<4;q=q.parent)path.push((q.name||q.type)+'{'+Object.keys(q.userData||{}).slice(0,5).join(',')+'}');
     const m=o.material;hits.push({dd,path:path.join('<'),vc:o.geometry.attributes.position?o.geometry.attributes.position.count:-1,arr:!!(o.geometry.attributes.position&&o.geometry.attributes.position.array),inst:o.isInstancedMesh?o.count:0,mat:m&&(m.type+':'+(m.map?'map':'nomap')+':'+(m.color?m.color.getHexString():'')+':'+(m.vertexColors?'vc':'')+':'+(m.name||'')),attrs:Object.keys(o.geometry.attributes).join(','),bs:+o.geometry.boundingSphere.radius.toFixed(0),ud:JSON.stringify(o.userData).slice(0,120)})}}
   out.push({sx,sy,c0,nC:C.length,hits})}rt.dispose();return JSON.stringify(out)})()`);console.log(r)}}
  await p.keyboard.up('ArrowUp');console.log('drive',k,JSON.stringify(n),'vmax km/h',(vmax*3.6).toFixed(0))}
 console.log('errs',JSON.stringify(errs));await b.close()})();
