// ---------- the owner 3D followers (games/rampart-and-vine/models/piece-*.glb) ----------
// Each follower model is rendered once per player colour (the plain wooden follower is painted in that colour) into a small sprite, so the board shows real 3D pieces standing on a
// coloured base without a live WebGL scene. The *-lite.glb files load first (fast sprites), then the full models replace them.
// No WebGL, no THREE or a missing file: the painted pictures (paint.js) stay. Needs three.min.js + gx-glb.js (build.py).
const M3={ok:false,r:null,scene:null,cam:null,src:{},spr:{},q:0};
const M3K=['meeple','champ','mason','hog'];
function m3Init(){if(M3.r)return M3.ok;try{if(typeof THREE==='undefined'||typeof GXGLB==='undefined')return false;const T=THREE;
  M3.r=new T.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true});M3.r.setClearColor(0,0);M3.scene=new T.Scene();
  M3.scene.add(new T.HemisphereLight(0xfff2d8,0x5a4028,1.2));const d=new T.DirectionalLight(0xffffff,1.8);d.position.set(2.5,5,4);M3.scene.add(d);
  M3.cam=new T.PerspectiveCamera(28,1,.1,50);M3.cam.position.set(0,2.05,4.7);M3.cam.lookAt(0,.8,0);M3.ok=true}catch(e){M3.ok=false}return M3.ok}
// one sprite: the model (meeples are dyed in the player colour, the others keep their paint) on a player-coloured round base
function m3Sprite(n,col,px){const T=THREE,src=M3.src[n];if(!src)return null;
  const g=GXGLB.prep(src,{h:n==='hog'?1.35:2.15,yaw:n==='hog'?Math.PI*.5+.6:Math.PI+.3,ground:true}),c=new T.Color(col);
  g.traverse(o=>{if(o.isMesh&&o.material){o.material=o.material.clone();if(n==='meeple'){o.material.map=null;o.material.color.copy(c).multiplyScalar(1.15);o.material.roughness=.62;o.material.needsUpdate=true}}});
  const base=new T.Mesh(new T.CylinderGeometry(1.02,1.08,.2,40),new T.MeshStandardMaterial({color:c,roughness:.5}));base.position.y=-.1;
  M3.scene.add(base);M3.scene.add(g);M3.r.setSize(px,px,false);M3.r.render(M3.scene,M3.cam);M3.scene.remove(g);M3.scene.remove(base);
  base.geometry.dispose();base.material.dispose();g.traverse(o=>{if(o.isMesh&&o.material)o.material.dispose()});
  return M3.r.domElement.toDataURL('image/png')}
function m3Bake(px){if(!M3.ok)return;for(const n of M3K)if(M3.src[n])PCOL.forEach((col,i)=>{try{const u=m3Sprite(n,col,px);if(u)M3.spr[n+i]=u}catch(e){}});
  if(Object.keys(M3.spr).length){HR.classList.add('g3d');m3Refresh()}}
// swap the pictures already on the board for the new sprites
function m3Refresh(){try{if(typeof G==='undefined'||!G||typeof UI==='undefined')return;for(const id in UI.mp){const e=UI.mp[id],f=G.figs.find(q=>q.s+q.k+q.p===id);if(f)e.innerHTML=pcHtml(FIGICON[f.k],f.p)}for(const b of document.querySelectorAll('#ov .fglow')){const m=b._m,f=b.firstElementChild;if(m&&f&&!f.classList.contains('flab')){const t=document.createElement('span');t.innerHTML=pcHtml(FIGICON[m.k],sideToAct());if(t.firstElementChild)b.replaceChild(t.firstElementChild,f)}}}catch(e){}}
async function m3Load(){if(typeof THREE==='undefined'||typeof GXGLB==='undefined')return;m3Init();   // the files load even without WebGL (the pictures then stay)
  await Promise.all(M3K.map(n=>GXGLB.load('models/piece-'+n+'-lite.glb').then(s=>{M3.src[n]=s}).catch(()=>{})));m3Bake(160);
  const full={};await Promise.all(M3K.map(n=>GXGLB.load('models/piece-'+n+'.glb').then(s=>{full[n]=s}).catch(()=>{})));
  for(const n in full)M3.src[n]=full[n];if(Object.keys(full).length)m3Bake(224)}
// board followers and follower-spot buttons use the 3D sprite; seat chips keep the painted pictures
(function(){const o=pcHtml;pcHtml=function(n,seat){const u=PAINT_ON&&seat!==undefined&&M3.spr[n+seat];return u?`<span class="pc g3"><img src="${u}" alt="" draggable="false"></span>`:o(n,seat)}})();
if(document.readyState==='complete')setTimeout(m3Load,300);else addEventListener('load',()=>setTimeout(m3Load,300));
