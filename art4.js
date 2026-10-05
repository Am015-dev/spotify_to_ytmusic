// ==== ART step 5 · boats: bow rise + white foam wake (module art4.js; patch pART4.py). Everything on/under/behind the player car belongs to the cars session.
// tyre bottoms measured from the visible model (cached per model), no hover bob; nose up on throttle, down on braking; front wheels steer;
// a dark blob under each tyre; boats: hull sunk to a waterline, bow rises with speed, white foam trail
const ART4={off:new Map(),b3:new THREE.Box3(),v:new THREE.Vector3(),q:new THREE.Quaternion()};
function ART4_foam(){if(ART4.fm)return ART4.fm;const im=new THREE.InstancedMesh(new THREE.CircleGeometry(1,12).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.75,depthWrite:false,fog:false}),90);im.count=90;im.frustumCulled=false;im.userData.keep=1;ART4.fp=[];for(let i=0;i<90;i++){ART4.fp.push({x:0,y:-999,z:0,a:0,s:0});im.setMatrixAt(i,new THREE.Matrix4().makeScale(0,0,0))}ART4.fi=0;ART4.ft=0;scene.add(im);return ART4.fm=im}
roamPose=(f=>function(s,dt){f(s,dt);try{const ud=s.mesh&&s.mesh.userData;if(!ud||!ud.m||s!==pl||s.air)return;const boat=(s.boatK||0)>.5;
  // boats only: bow up a little with speed, white foam trail from the stern (player-car FX belong to the cars session)
  if(boat){const F=ART4_foam(),fw=s._fw||V3(Math.sin(RO.h),0,Math.cos(RO.h));ART4.ft+=dt;if(Math.abs(RO.v)>3&&ART4.ft>.06){ART4.ft=0;const p=ART4.fp[ART4.fi++%90];p.x=RO.x-fw.x*3.6+(Math.random()-.5)*1.2;p.z=RO.z-fw.z*3.6+(Math.random()-.5)*1.2;p.y=RO.y+.05;p.a=0;p.s=.9+Math.min(1.6,Math.abs(RO.v)/30)}
   for(let i=0;i<90;i++){const p=ART4.fp[i];if(p.y<-900)continue;p.a+=dt;const k=Math.max(0,1-p.a/2.4);_m.makeScale(p.s*(1+p.a*1.4)*k+.001,1,p.s*(1+p.a*1.4)*k+.001);_m.setPosition(p.x,p.y,p.z);F.setMatrixAt(i,_m)}F.instanceMatrix.needsUpdate=true;F.visible=true;
   const bow=Math.min(.06,Math.abs(RO.v)*.001);ud.m.rotateX(bow)}else if(ART4.fm)ART4.fm.visible=false}catch(e){}})(roamPose);
