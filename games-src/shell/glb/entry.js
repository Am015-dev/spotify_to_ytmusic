import {GLTFLoader} from '../../node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import {MeshoptDecoder} from '../../node_modules/three/examples/jsm/libs/meshopt_decoder.module.js';
// GXGLB.load(url) -> Promise<THREE.Group> (cached; clone with GXGLB.clone). dispose() frees everything.
const loader=new GLTFLoader();loader.setMeshoptDecoder(MeshoptDecoder);
const cache=new Map();
function load(url){if(!cache.has(url))cache.set(url,new Promise((ok,no)=>loader.load(url,g=>ok(g.scene),undefined,no)));return cache.get(url)}
function clone(src){return src.clone(true)}   // geometry + materials are shared; only the nodes are new
function dispose(){for(const p of cache.values())p.then(s=>s.traverse(o=>{if(o.geometry)o.geometry.dispose();const m=o.material;if(m){for(const k in m){const v=m[k];if(v&&v.isTexture)v.dispose()}m.dispose()}})).catch(()=>{});cache.clear()}
// prep(scene,{h|len,yaw,ground,env}) -> Group holding a centred, scaled, yawed clone. h = target height, len = target longest horizontal side.
// ground:true puts the lowest point on y=0 (centred on x/z); otherwise it is centred on all three axes. Shadows on; env = envMapIntensity.
function prep(src,o){o=o||{};const T=window.THREE,inst=src.clone(true),w=new T.Group();w.add(inst);inst.rotation.y=o.yaw||0;inst.updateMatrixWorld(true);
  const b=new T.Box3().setFromObject(inst),sz=b.getSize(new T.Vector3());const k=o.h?o.h/Math.max(1e-4,sz.y):o.len?o.len/Math.max(sz.x,sz.z,1e-4):1;inst.scale.setScalar(k);inst.updateMatrixWorld(true);b.setFromObject(inst);const c=b.getCenter(new T.Vector3());
  inst.position.set(-c.x,o.ground?-b.min.y:-c.y,-c.z);inst.traverse(m=>{if(m.isMesh){m.castShadow=m.receiveShadow=true;if(m.material&&o.env!=null)m.material.envMapIntensity=o.env}});w.userData.size=b.getSize(new T.Vector3());return w}
window.GXGLB={load,clone,prep,dispose};
