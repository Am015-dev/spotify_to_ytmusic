// glossy-cars-r22e5 (2026-10-22) · "glossy LEGO cars on the road" (Alex); docs/BENCH_2K.md: "car materials look matte".
// Why matte: car paint reflected the world's sky env (a big bright dome), which washed blue/white paint pale, so 97_art/90_fixes capped it at .6
// and the clearcoat had nothing crisp to catch. Now car paint gets its own small "product studio" env: a dim dome in the mood's sky colours,
// one hot sun disc on the key light, an overhead softbox strip (the long roof/bonnet streak) and a thin bright horizon (a rim on every flank).
// Mostly dark = no colour wash, so the clearcoat can run at full strength. Generated once per mood with the same PMREM size as buildEnv
// (256), so car programs keep their defines: no new shaders, no new materials, no extra pass. ?gloss=0 restores the old look.
const GL={P:{dim:.6,hb:.3,hk:1.3,sun:30,bw:90,bh:34,by:18,bk:4,rw:110,rh:12,rk:2.8,ei:1.4},on:!/[?&]gloss=0/.test(location.search),tex:null,id:'',n:0,ms:0,mats:new Set()};
function GL_env(){const id=MOOD.id;if(GL.tex&&GL.id===id)return GL.tex;const t0=performance.now(),M=MOOD,sc=new THREE.Scene(),Q=GL.P,dim=Q.dim;
  const g=new THREE.SphereGeometry(50,32,16),P=g.attributes.position,C=new Float32Array(P.count*3),top=M.top||[.05,.08,.2],hor=M.hor||[.6,.7,.8];
  for(let i=0;i<P.count;i++){const y=P.getY(i)/50;let c;if(y<-.02)c=[.035,.035,.04];else{const a=Math.pow(Math.max(0,y),.5);c=[0,1,2].map(j=>(hor[j]*(1-a)+top[j]*a)*dim);if(y<Q.hb)c=c.map((v,j)=>Math.max(v,hor[j]*Q.hk))}C[i*3]=c[0];C[i*3+1]=c[1];C[i*3+2]=c[2]}
  g.setAttribute('color',new THREE.BufferAttribute(C,3));const B=o=>Object.assign(new THREE.MeshBasicMaterial(o),{toneMapped:false,fog:false});
  sc.add(new THREE.Mesh(g,B({vertexColors:true,side:THREE.BackSide})));
  const k=moonL.intensity/4.2,sd=moonL.position.clone().normalize(),sun=new THREE.Mesh(new THREE.SphereGeometry(2.2,12,8),B({color:moonL.color.clone().multiplyScalar(Q.sun*Math.min(1.2,k))}));
  sun.position.copy(sd).multiplyScalar(40);sc.add(sun);
  const box=new THREE.Mesh(new THREE.PlaneGeometry(Q.bw,Q.bh),B({color:new THREE.Color(1,1,1.05).multiplyScalar(Q.bk*Math.max(.25,Math.min(1,k))),side:THREE.DoubleSide}));
  box.position.set(sd.x*8,Q.by,sd.z*8);box.rotation.x=Math.PI/2;box.rotation.z=Math.atan2(sd.x,sd.z)+Math.PI/2;sc.add(box);
  const rim=new THREE.Mesh(new THREE.PlaneGeometry(Q.rw,Q.rh),B({color:new THREE.Color(.9,.95,1.1).multiplyScalar(Q.rk),side:THREE.DoubleSide}));
  rim.position.set(-sd.x*40,Q.rh*.6,-sd.z*40);rim.lookAt(0,Q.rh*.6,0);sc.add(rim);
  const pm=new THREE.PMREMGenerator(renderer),t=pm.fromScene(sc,0).texture;pm.dispose();sc.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose()}});
  if(GL.tex)GL.tex.dispose();GL.tex=t;GL.id=id;GL.n++;GL.ms=performance.now()-t0;return t}
// a car paint material: vertex-coloured (or player livery) standard/physical, opaque; glass keeps its own (darker, sharper) look but takes the studio too
function GL_paint(m){return m&&m.isMeshStandardMaterial&&!m.transparent&&m.envMap&&(m.isMeshPhysicalMaterial||m.envMapIntensity>1||m.userData.a10e!==undefined)}
function GL_set(m,ei){if(!GL_paint(m))return;if(m.userData.gl0===undefined)m.userData.gl0=[m.envMapIntensity,m.clearcoatRoughness];
  if(m.envMap!==GL.tex)m.envMap=GL.tex;const gls=m.roughness<.1;m.envMapIntensity=gls?1.5:ei;if(m.isMeshPhysicalMaterial){if(m.clearcoat<.8)m.clearcoat=1;m.clearcoatRoughness=gls?.03:.05}GL.mats.add(m)}
function GL_apply(){if(!GL.on||!scene.environment)return;if(!GL.tex||GL.id!==MOOD.id)GL_env();const ei=GL.P.ei;
  if(HUB&&HUB.cim)for(const k in HUB.cim){const im=HUB.cim[k];if(im)for(const m of[].concat(im.material))GL_set(m,ei)}
  if(typeof pl!=='undefined'&&pl&&pl.mesh)pl.mesh.traverse(o=>{if(o.isMesh)for(const m of[].concat(o.material))GL_set(m,ei)})}
function GL_off(){for(const m of GL.mats){const o=m.userData.gl0;m.envMap=scene.environment;if(o){m.envMapIntensity=o[0];if(o[1]!=null)m.clearcoatRoughness=o[1]}}GL.mats.clear()}
// ART10_cars (every 500 ms in roam) re-points car paint at scene.environment and caps it: run after it, same cadence
ART10_cars=(f=>function(){const r=f.apply(this,arguments);try{GL_apply()}catch(e){}return r})(ART10_cars);
// GO why/glossy: paint on player + traffic carries the studio env with clearcoat; material + program counts unchanged (±2) after switching it on;
// render cost at 6x CPU (tChkGo CDP bridge) within +5% (8 interleaved off/on rounds, each the mean of 8 renderer.render + 1-px readback after 1 warm frame; median of the round means).
function GL_go(say){if(state!=='roam'||!RO.on)return'📍 Start free roam to run this';
  const cnt=()=>{const S=new Set();if(pl&&pl.mesh)pl.mesh.traverse(o=>{if(o.isMesh)[].concat(o.material).forEach(m=>S.add(m))});for(const k in HUB.cim){const im=HUB.cim[k];if(im)for(const x of[im,im.userData.w,im.userData.g])if(x)[].concat(x.material).forEach(m=>S.add(m))}return S.size};
  const chk=()=>{let p=0,pg=0,t=0,tg=0;pl.mesh.traverse(o=>{if(o.isMesh)for(const m of[].concat(o.material))if(GL_paint(m)&&m.roughness>=.1){p++;if(m.envMap===GL.tex&&m.envMapIntensity>=1&&(!m.isMeshPhysicalMaterial||m.clearcoat>=.8))pg++}});
   for(const k in HUB.cim){const im=HUB.cim[k];if(im)for(const m of[].concat(im.material))if(m.isMeshStandardMaterial){t++;if(m.envMap===GL.tex&&m.envMapIntensity>=1)tg++}}return{p,pg,t,tg}};
  const gl=renderer.getContext(),px=new Uint8Array(4),blk=n=>{const t0=performance.now();for(let i=0;i<n;i++){renderer.render(scene,camera);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px)}return(performance.now()-t0)/n};
  const med=a=>{a=a.slice().sort((x,y)=>x-y);return a[a.length>>1]};
  (async()=>{const wasOn=GL.on;GL.on=false;GL_off();renderer.render(scene,camera);const m0=cnt(),p0=renderer.info.programs.length;
   GL.on=true;GL_apply();renderer.render(scene,camera);const m1=cnt(),p1=renderer.info.programs.length,c=chk();
   const thr=typeof window.__cdp==='function';if(thr)await window.__cdp('Emulation.setCPUThrottlingRate',{rate:6});
   const A=[],B=[];try{for(let r=0;r<8;r++){GL.on=false;GL_off();blk(1);A.push(blk(8));GL.on=true;GL_apply();blk(1);B.push(blk(8))}}finally{if(thr)await window.__cdp('Emulation.setCPUThrottlingRate',{rate:1})}
   GL.on=wasOn;if(!wasOn)GL_off();const a=med(A),b=med(B),d=(b/a-1)*100;
   const ok=c.p>0&&c.pg===c.p&&c.t>0&&c.tg===c.t&&Math.abs(m1-m0)<=2&&p1-p0<=2&&d<=5;
   say(`📍 why/glossy · player paint with studio env + clearcoat ${c.pg}/${c.p} · traffic paint ${c.tg}/${c.t} · materials ${m0}→${m1} (±2) · programs ${p0}→${p1} (+≤2) · render ${thr?'6x CPU':'1x (no CDP)'} median off ${a.toFixed(2)} ms → on ${b.toFixed(2)} ms (${d>=0?'+':''}${d.toFixed(1)}%, ≤ +5%) · env build ${GL.ms.toFixed(1)} ms, ${GL.n} built → ${ok?'✅ PASS':'❌ FAIL'}`)})();
  return'📍 why/glossy · measuring…'}
{const reg=setInterval(()=>{if(!window.__chk||!__chk.GO)return;clearInterval(reg);
 __chk.items.unshift({ver:'why',id:'glossy',area:'world',text:'glossy-cars-r22e5: player and traffic cars read as shiny ABS plastic: a crisp sun highlight and softbox streak on the clearcoat, a thin horizon rim on the flanks, colours stay saturated (car-only studio env, no extra pass). 📍 GO checks paint materials on the player and every traffic model carry it, material/program counts unchanged (±2) and render cost at 6x CPU within +5%.'});
 __chk.GO['why/glossy']=['fra','ath'].map(c=>({c,n:'glossy cars '+(c==='fra'?'Frankfurt':'Athens'),secs:60,fn:()=>GL_go(__chk.goSay)}))},500)}
window.__gl={GL,apply:GL_apply,off:GL_off,env:GL_env};
