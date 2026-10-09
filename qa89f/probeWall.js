// diagnosis at k7 (1049,-553): which athB instances make the blank walls; dump the facade textures
const fs=require('fs');const{chromium,boot}=require('../tools/d24lib');const URL=process.argv[2],OUT=process.argv[3]||'qa89f/wall';fs.mkdirSync(OUT,{recursive:true});
const X=+(process.env.X||1049),Z=+(process.env.Z||-553),A=+(process.env.A||(7/8*Math.PI*2));
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const{p,errs,shot}=await boot(b,{city:'ath',url:URL,phone:true});
 const ev=s=>p.evaluate(s=>__oc.ev(s),s);
 await p.evaluate(([x,z,h])=>{__mho.warp(x,z,h,true)},[X,Z,A]);for(let i=0;i<40;i++)await p.evaluate(()=>__tick(10));
 // textures
 const tx=JSON.parse(await ev(`(()=>{const o={};HUB.grp.traverse(m=>{const k=m.userData&&m.userData.athB;if(!m.isInstancedMesh||!k||o[k])return;const mp=m.material.map;if(mp&&mp.image&&mp.image.toDataURL)o[k]={u:mp.image.toDataURL(),w:mp.image.width,h:mp.image.height,wr:[mp.wrapS,mp.wrapT],rep:[mp.repeat.x,mp.repeat.y]};else o[k]={none:1,img:mp&&mp.image&&mp.image.constructor.name}});return JSON.stringify(o)})()`));
 for(const k in tx){if(tx[k].u){fs.writeFileSync(`${OUT}/tex_${k}.png`,Buffer.from(tx[k].u.split(',')[1],'base64'));delete tx[k].u}}console.log('tex',JSON.stringify(tx));
 for(const side of[-1,1]){const info=await ev(`(()=>{const h=RO.h+${side}*Math.PI/2;camera.position.set(RO.x-Math.sin(h)*2,RO.y+3,RO.z-Math.cos(h)*2);camera.lookAt(RO.x+Math.sin(h)*20,RO.y+4,RO.z+Math.cos(h)*20);camera.updateMatrixWorld(true);
    window.__camLock=[camera.position.clone(),new THREE.Vector3(RO.x+Math.sin(h)*20,RO.y+4,RO.z+Math.cos(h)*20)];
    const rc=new THREE.Raycaster(),m4=new THREE.Matrix4(),pp=new THREE.Vector3(),qq=new THREE.Quaternion(),ss=new THREE.Vector3(),col=new THREE.Color();const out=[];
    for(const sx of[-.8,-.5,-.2,.2,.5,.8])for(const sy of[-.15,.15]){rc.setFromCamera(new THREE.Vector2(sx,sy),camera);const I=[];scene.traverseVisible(o=>{if(!o.isMesh||o.isSprite)return;try{o.raycast(rc,I)}catch(e){}});I.sort((a,b)=>a.distance-b.distance);const i0=I[0];if(!i0){out.push({sx,sy,none:1});continue}
     const o=i0.object;const r={sx,sy,d:+i0.distance.toFixed(1),ud:Object.keys(o.userData).join(','),t:o.userData.athB,par:(o.parent&&(o.parent.name||o.parent.type))+'/'+Object.keys((o.parent&&o.parent.userData)||{}).join(','),n:i0.face&&[+i0.face.normal.x.toFixed(2),+i0.face.normal.y.toFixed(2),+i0.face.normal.z.toFixed(2)],uv:i0.uv&&[+i0.uv.x.toFixed(2),+i0.uv.y.toFixed(2)],map:!!(o.material&&o.material.map),vc:o.geometry.attributes.position.count,mat:o.material&&o.material.customProgramCacheKey&&o.material.customProgramCacheKey()};
     if(o.isInstancedMesh&&i0.instanceId!=null){o.getMatrixAt(i0.instanceId,m4);m4.decompose(pp,qq,ss);r.sc=[+ss.x.toFixed(1),+ss.y.toFixed(1),+ss.z.toFixed(1)];r.pos=[+pp.x.toFixed(0),+pp.y.toFixed(1),+pp.z.toFixed(0)];if(o.instanceColor){o.getColorAt(i0.instanceId,col);r.col=col.getHexString()}}out.push(r)}return JSON.stringify(out)})()`);
   console.log('side',side);for(const r of JSON.parse(info))console.log(' ',JSON.stringify(r));
   await ev(`(()=>{if(!window.__rcO){window.__rcO=roamCam;roamCam=function(){const r=window.__rcO.apply(this,arguments);if(window.__camLock){camera.position.copy(window.__camLock[0]);camera.lookAt(window.__camLock[1])}return r}}})()`);
   await shot(`${OUT}/side${side<0?'L':'R'}.jpg`)}
 console.log('errs',JSON.stringify(errs));await b.close()})();
