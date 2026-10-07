// ===== R15c (race worker 15): 2K-style power-ups. Item pickups are floating, spinning LEGO "?" bricks (one instanced mesh, one draw call)
// that burst when taken and pop back 2.5 s later; 4 across the wider road, a row every ~650 m. Races use a 2K-style set of six items:
// homing MISSILE, TURBO, SHIELD, WEB (blinds + slows the racer ahead), MINES, LIGHTNING (strikes everyone ahead). One slot, the ITEM button.
const R15I={im:null,n:0,list:[],t:0};
function R15_boxTex(){const[c,g]=cv(128,128);const gr=g.createLinearGradient(0,0,128,128);gr.addColorStop(0,'#ff4fd8');gr.addColorStop(.5,'#8c55ff');gr.addColorStop(1,'#29b6ff');g.fillStyle=gr;g.fillRect(0,0,128,128);
  g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=8;g.strokeRect(4,4,120,120);g.fillStyle='#fff';g.font='900 92px system-ui,sans-serif';g.textAlign='center';g.textBaseline='middle';g.shadowColor='rgba(0,0,0,.5)';g.shadowBlur=6;g.fillText('?',64,70);return tex(c,false)}
function R15_boxGeo(){const b=new THREE.BoxGeometry(2.6,2.1,2.6);const parts=[b];for(const x of[-.65,.65])for(const z of[-.65,.65]){const st=new THREE.CylinderGeometry(.42,.42,.36,14);st.translate(x,1.23,z);
   const uv=st.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,.04,.04);parts.push(st)}return mergeGeometries(parts.map(g=>g.index?g.toNonIndexed():g))}
function R15_boxes(){try{if(R15I.im){scene.remove(R15I.im);R15I.im.geometry.dispose();R15I.im.material.map&&R15I.im.material.map.dispose();R15I.im.material.dispose();R15I.im=null}
  R15I.list=pads.filter(p=>p.type==='item');if(!R15I.list.length)return;const t=R15_boxTex();
  const im=new THREE.InstancedMesh(R15_boxGeo(),new THREE.MeshStandardMaterial({map:t,emissiveMap:t,emissive:0xffffff,emissiveIntensity:1.1,roughness:.35,metalness:.05}),R15I.list.length);
  im.frustumCulled=false;im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(im);R15I.im=im;
  for(const p of R15I.list){p.cd=0;p.pop=1;if(p.mesh)p.mesh.visible=false}R15_boxTick(0)}catch(e){console.warn('R15 boxes',e)}}
const _r15M=new THREE.Matrix4(),_r15R=new THREE.Matrix4(),_r15S=new THREE.Matrix4(),_r15F=mkF();
function R15_boxTick(dt){const im=R15I.im;if(!im)return;R15I.t+=dt;const T=R15I.t;
  R15I.list.forEach((p,i)=>{if(p.cd>0){p.cd-=dt;if(p.cd<=0)p.pop=0}if(p.pop<1&&!(p.cd>0))p.pop=Math.min(1,p.pop+dt*4);
    const sc=p.cd>0?0:(p.pop<1?1.25-.25*p.pop:1)*(p.pop<1?p.pop:1);frameAt(TD,p.s,_r15F);
    _r15M.makeBasis(_r15F.r,_r15F.u,_r15F.t.clone().negate());_r15M.setPosition(_r15F.p.clone().addScaledVector(_r15F.r,p.x).addScaledVector(_r15F.u,3.2+Math.sin(T*3+i)*.4));
    _r15R.makeRotationY(T*2+i);_r15S.makeScale(sc*1.9,sc*1.9,sc*1.9);_r15M.multiply(_r15R).multiply(_r15S);im.setMatrixAt(i,_r15M)});im.instanceMatrix.needsUpdate=true}
// pickup: the brick bursts into coloured studs and is gone for 2.5 s
function R15_pop(p,s){p.cd=2.5;p.pop=0;try{frameAt(TD,p.s,_r15F);const at=_r15F.p.clone().addScaledVector(_r15F.r,p.x).addScaledVector(_r15F.u,2);if(s.isPlayer||near(s)){burst(SPARK,at,26,16,.45,new THREE.Color(2.2,1,2.6));debris(at,_r15F.t.clone().multiplyScalar(s.v*.5),5,[new THREE.Color('#ff4fd8'),new THREE.Color('#8c55ff'),new THREE.Color('#29b6ff')],.55,_r15F.p.y+.2)}}catch(e){}}
setupRace=(f=>function(){const r=f.apply(this,arguments);R15_boxes();return r})(setupRace);
updWorld=(f=>function(dt){const r=f.apply(this,arguments);if(R15I.im){if(state==='race'||state==='countdown'||state==='finished'||state==='menu')R15_boxTick(dt||0);R15I.im.visible=state!=='roam'}return r})(updWorld);
// the 2K-style item set in races (arena / derby / roam keep the full list)
ITEMS.storm.name='LIGHTNING';ITEMS.web.name='WEB';
pickItem=(f=>function(s){if(!R15_on()||RC.type==='arena')return f.apply(this,arguments);const act=ships.filter(o=>!o.eliminated),n=act.length||1;let p=n>1?clamp(((s.place||Math.ceil(n/2))-1)/(n-1),0,1):.5;if(s.isPlayer&&PK.has('luck'))p=Math.min(1,p+2/Math.max(1,n-1));
  const W={turbo:.9+p*.4,shield:1.1-p*.6,mines:1-p*.6,web:p>0?.5+p*.5:0,missile:.4+p*.9,storm:p>.5?(p-.35)*1.4:0};let tot=0;for(const k in W)tot+=Math.max(0,W[k]);let r=R()*tot;for(const k in W){r-=Math.max(0,W[k]);if(r<=0)return k}return'turbo'})(pickItem);
// test hook (read-only): item bricks state
window.__r15box=()=>{try{const im=R15I.im;if(!im)return null;const m=new THREE.Matrix4(),o=[];for(let i=0;i<Math.min(3,im.count);i++){im.getMatrixAt(i,m);o.push([m.elements[12],m.elements[13],m.elements[14],Math.hypot(m.elements[0],m.elements[1],m.elements[2])].map(v=>+v.toFixed(1)))}
 return{n:im.count,vis:im.visible,inScene:im.parent===scene,first:o,p0:R15I.list.slice(0,3).map(p=>[Math.round(p.s),+p.x.toFixed(1),p.cd,p.pop]),pl:pl&&pl.mesh.position.toArray().map(v=>+v.toFixed(1)),plS:pl&&Math.round(pl.dist),t:+R15I.t.toFixed(2)}}catch(e){return String(e)}};
// R17: WEB hit on the player — the 96 overlay (#v85web) blinded the whole screen for 4.5 s and sat over the controls.
// Now: behind the HUD and touch controls (z-index 2), only the middle of the screen (never the corners where the controls are),
// a lighter web, and the blind part lasts the first 2 s of the 4.5 s slow-down (fades out by 2.6 s).
try{V85W.style.cssText='position:fixed;left:18%;right:18%;top:8%;bottom:22%;pointer-events:none;z-index:2;opacity:0;transition:opacity .2s;border-radius:50%;background:radial-gradient(ellipse at 50% 50%,transparent 30%,rgba(240,246,255,.42) 62%,transparent 71%),repeating-conic-gradient(from 0deg at 50% 50%,rgba(255,255,255,.55) 0 .6deg,transparent .6deg 15deg),repeating-radial-gradient(ellipse at 50% 50%,transparent 0 40px,rgba(255,255,255,.45) 40px 42px);-webkit-mask:radial-gradient(ellipse at 50% 50%,#000 55%,transparent 71%);mask:radial-gradient(ellipse at 50% 50%,#000 55%,transparent 71%)'}catch(e){}
stepTraffic=(f=>function(){f.apply(this,arguments);if(state!=='race')return;try{const w=pl&&pl.webT>0;V85W.style.opacity=w?clamp((pl.webT-1.9)/.6,0,.85):0}catch(e){}})(stepTraffic);
