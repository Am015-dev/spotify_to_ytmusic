// __ZF(save,d16): road pixels covered by grass this frame. Pass A = roads only (unculled), pass B = roads+terrain with the real polygonOffsets
// (24-bit or 16-bit depth = phone-like); lost pixels where the terrain is >0.5 m in front of the road (hills) count as occlusion, not flicker.
(()=>{const M=__mho,D=__dbg,T=D.THREE,HM=M.HUB.M||{};
const RK=new Set(['road','street','dirt','cobble','resSt'].map(k=>HM[k]).filter(Boolean));
const mat=o=>Array.isArray(o.material)?o.material[0]:o.material;
const vis=o=>{for(let a=o;a;a=a.parent)if(!a.visible)return false;return true};
let RT=null,RT16=null;
window.__ZF=function(save,d16){const r=D.renderer,sc=D.scene,cam=D.camera;const sz=r.getDrawingBufferSize(new T.Vector2());const w=sz.x,h=sz.y;
 if(!RT||RT.width!==w||RT.height!==h){RT=new T.WebGLRenderTarget(w,h,{depthBuffer:true,stencilBuffer:false})}
 const roads=[],terr=[],others=[];sc.traverse(o=>{if(!o.isMesh&&!o.isPoints&&!o.isLine&&!o.isSprite)return;if(!o.visible)return;const m=mat(o);
  if(o.userData.trG||m===HM.grass)terr.push(o);else if(o.isMesh&&m&&(RK.has(m)||(m.polygonOffset&&m.polygonOffsetFactor<0&&!m.transparent&&m.depthWrite&&m.type!=='ShaderMaterial')))roads.push(o);else others.push(o)});
 const sv=[];const swap=(o,c)=>{const m=mat(o);sv.push([o,o.material,o.frustumCulled]);o.material=new T.MeshBasicMaterial({color:c,side:m.side,polygonOffset:m.polygonOffset,polygonOffsetFactor:m.polygonOffsetFactor,polygonOffsetUnits:m.polygonOffsetUnits,fog:false,toneMapped:false})};
 for(const o of roads)if(vis(o))swap(o,0xff00ff);for(const o of terr)if(vis(o))swap(o,0x00ff00);
 const hid=others.filter(o=>o.visible);for(const o of hid)o.visible=false;
 const bg=sc.background,fg=sc.fog,ov=sc.overrideMaterial;sc.background=null;sc.fog=null;
 if(!RT16||RT16.width!==w||RT16.height!==h){RT16=new T.WebGLRenderTarget(w,h,{depthBuffer:true,stencilBuffer:false});RT16.depthTexture=new T.DepthTexture(w,h,T.UnsignedShortType)}const CT=d16?RT16:RT;
 const prev=r.getRenderTarget(),ac=r.autoClear;r.autoClear=true;r.setRenderTarget(CT);r.setClearColor(0x000000,0);
 const A=new Uint8Array(w*h*4),B=new Uint8Array(w*h*4);
 // pass A: roads only, no frustum culling
 for(const o of terr)o.visible=false;for(const s of sv)s[0].frustumCulled=false;for(const o of terr)o.frustumCulled=terr.fc;
 r.clear();r.render(sc,cam);r.readRenderTargetPixels(CT,0,0,w,h,A);
 // pass B: roads + terrain, normal culling
 for(const s of sv)s[0].frustumCulled=s[2];for(const o of terr)o.visible=true;
 r.clear();r.render(sc,cam);r.readRenderTargetPixels(CT,0,0,w,h,B);r.setRenderTarget(RT);
 // depth passes (no polygon offset): roads only (unculled), terrain only
 const dm=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking}),dmD=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,side:T.DoubleSide});const keepM=new Map();for(const s of sv)keepM.set(s[0],s[0].material);
 for(const s of sv)s[0].material=(s[0].material.side===T.DoubleSide?dmD:dm);
 const DR=new Uint8Array(w*h*4),DT=new Uint8Array(w*h*4);r.setClearColor(0xffffff,1);
 for(const o of terr)o.visible=false;for(const s of sv)s[0].frustumCulled=false;r.clear();r.render(sc,cam);r.readRenderTargetPixels(RT,0,0,w,h,DR);
 for(const o of terr)o.visible=true;for(const s of sv)if(!terr.includes(s[0]))s[0].visible=false;r.clear();r.render(sc,cam);r.readRenderTargetPixels(RT,0,0,w,h,DT);
 for(const s of sv){s[0].visible=true;s[0].frustumCulled=s[2];s[0].material=keepM.get(s[0])}r.setClearColor(0x000000,0);
 r.setRenderTarget(prev);r.autoClear=ac;sc.background=bg;sc.fog=fg;
 const n=cam.near,f=cam.far,unp=(a,j)=>{const z=a[j]/4294967296+a[j+1]/16777216+a[j+2]/65536+a[j+3]/256;return (n*f)/((f-n)*z-f)*-1};
 for(const [o,m,fc] of sv){o.material.dispose();o.material=m;o.frustumCulled=fc}for(const o of hid)o.visible=true;
 let occ=0;const dzs=[];let mask=0,lost=0,green=0,cull=0;const L=[];for(let i=0;i<w*h;i++){const j=i*4;if(A[j]>200&&A[j+1]<50&&A[j+2]>200){mask++;const isR=B[j]>200&&B[j+1]<50&&B[j+2]>200;if(!isR){const dz=unp(DR,j)-unp(DT,j);if(dz>0.5){occ++;continue}lost++;if(dzs.length<4000)dzs.push([+dz.toFixed(3),+unp(DR,j).toFixed(1)]);if(B[j+1]>200&&B[j]<50)green++;else cull++;if(L.length<4000)L.push(i)}}}
 let out={w,h,roads:roads.length,terr:terr.length,mask,lost,green,cull,pct:+(100*lost/Math.max(1,mask)).toFixed(3),occ};
 if(save){// lost pixels with screen row (y from top) histogram
  const rows={};for(const i of L){const y=h-1-Math.floor(i/w);const b=Math.floor(y/40)*40;rows[b]=(rows[b]||0)+1}out.rows=rows;out.dz=dzs.slice(0,8);out.dmax=dzs.reduce((a,b)=>Math.max(a,b[1]),0);out.dmin=dzs.reduce((a,b)=>Math.min(a,b[1]),1e9)}
 return out};return 1})()
