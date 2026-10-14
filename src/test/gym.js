// ===== GYM · test-only small world (hot-1, 2026-10-14), active only with ?test=fra&gym=drive|foot|cam|park[&draw=0]. Never in deploy builds (src/test/).
// The Frankfurt city build (buildHubG, ~8 s: streets, buildings, props, traffic) is replaced by a 600 m ground pad that follows the real ground
// height, so the page can drive ~5 s after load. Physics, camera, on-foot and parking code are the real ones; only the world is (almost) empty.
//   drive / cam / park: in the car at the boot spot · foot: out of the car. window.__gym = {k, pad, ok}.
const GYM=(()=>{try{const g=new URLSearchParams(location.search).get('gym');return TQ&&g?{k:g,pad:null,ok:false}:null}catch(e){return null}})();
if(GYM){
 window.__gym=GYM;
 // not needed in the gym: the menu (team cards build car previews, ~1 s) and its race track cards, the LEGO city brick mesh (~0.85 s), the filler street grid (~0.65 s)
 BX_raceMenu=function(){};buildMenu=function(){};CTB_mesh=function(){};rfGrid=function(){if(!FILL_R){FILL_R=[];FILL_G=new Map();BLOCK_C=[]}};
 buildHubG=function*(){if(HUB.built)return;HUB.built=true;const grp=new THREE.Group();scene.add(grp);HUB.grp=grp;
  Object.assign(HUB,{bld:[],props:[],ptypes:{},pgrid:new Map(),cars:[],peds:[],water:[],terr:[],trn:[],gates:[],blocks:[],nodes:[],smashed:0,cpos:null,nc:null,ngrid:null,cim:[],trB:{n:0}});
  HUB.flatMat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:0});try{hubGrid()}catch(e){console.warn('gym hubGrid',e)}
  yield[1,'Gym']};
 // the pad: 600 m square, 6 m grid, on groundY (built where the car is once roam starts)
 GYM.padAt=(cx,cz)=>{const N=100,S=6,P=[],C=[],I=[];for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){const x=cx+(i-N/2)*S,z=cz+(j-N/2)*S;P.push(x,groundY(x,z)-.02,z);const k=((i>>2)+(j>>2))&1;C.push(.36+k*.06,.62+k*.05,.3)}
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const a=j*(N+1)+i;I.push(a,a+N+1,a+1,a+1,a+N+1,a+N+2)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('color',new THREE.Float32BufferAttribute(C,3));g.setIndex(I);g.computeVertexNormals();
  const m=new THREE.Mesh(g,HUB.flatMat);m.receiveShadow=true;m.userData.gym=1;HUB.grp.add(m);GYM.pad=[cx,cz];return m};
 roamPost=(f=>function(){const r=f.apply(this,arguments);try{if(!GYM.pad)GYM.padAt(RO.x,RO.z)}catch(e){console.warn('gym pad',e)}return r})(roamPost);
 // foot: get out once the car has settled (OF_canExit is false while it drops onto the pad), retried for up to 5 s
 const iv=setInterval(()=>{if(!window.__tq||!__tq.ready)return;if(GYM.k!=='foot'){clearInterval(iv);GYM.ok=true;return}GYM.n=(GYM.n||0)+1;
  try{if(RO.foot==='car'){RO.v=0;if(OF_canExit())OF_exit()}else if(RO.foot==='walk'){clearInterval(iv);GYM.ok=true}}catch(e){console.warn('gym foot',e)}if(GYM.n>50){clearInterval(iv);console.warn('gym: could not get out')}},100);
}
