// glossy-cars-r22e5 (2026-10-22) · "glossy LEGO cars on the road" (Alex); docs/BENCH_2K.md: "car materials look matte".
// r22e10 (review #38: on the phone path the red car washed out to salmon): the r22e5 dark "studio" dome dropped the world sky's blue fill (hue swung
// +20 deg to orange) and its bright horizon/softbox lifted the body (+11 %). Now car paint reflects the WORLD env scene (ENVSC, same sky) plus two extras:
// a hot sun disc and one thin bright band all round the sky at 28 deg (mirrored as a crisp line on spoiler/roof/bonnet edges from the chase or orbit
// camera, whatever the heading). Paint keeps its own env intensity x .5 (ek), which cancels the clearcoat's extra sky sheen: measured on the body
// (tools/tGloss2.js + glossStats.py, 852x393, fra day/dusk, phone and desktop) hue +-2 deg, saturation -2..-4 %, value +2 %.
// Same PMREM size as buildEnv, no new shaders, materials or passes. Default OFF (?gloss=1 on): the gain is a thin line, not a clear win yet.
const GL={P:{sun:24,sr:1.6,re:28,rw:2.5,rk:16,ek:.5},on:/[?&]gloss=1/.test(location.search),tex:null,id:'',C:new Map(),n:0,ms:0,mats:new Set()};
// r22e10: keyed on the mood id AND the key light (colour, intensity, direction, quantised), so a Frankfurt mood/time switch that keeps the id still rebuilds;
// the last 4 envs stay cached (cycling day/dusk/night re-uses them, no PMREM churn)
function GL_key(){const d=moonL.position.clone().normalize();return MOOD.id+'|'+moonL.color.getHexString()+'|'+Math.round(moonL.intensity)+'|'+[d.x,d.y,d.z].map(v=>Math.round(v*3)).join(',')+'|'+(lowGfx?1:0)}
function GL_env(){const id=GL_key();if(GL.tex&&GL.id===id)return GL.tex;const hit=GL.C.get(id);if(hit){GL.tex=hit;GL.id=id;return hit}const t0=performance.now(),Q=GL.P,add=[];
  const B=o=>Object.assign(new THREE.MeshBasicMaterial(o),{toneMapped:false,fog:false}),k=moonL.intensity/4.2,kk=Math.max(.15,Math.min(1,k)),sd=moonL.position.clone().normalize();
  const sun=new THREE.Mesh(new THREE.SphereGeometry(Q.sr,12,8),B({color:moonL.color.clone().multiplyScalar(Q.sun*Math.min(1.2,k))}));sun.position.copy(sd).multiplyScalar(40);add.push(sun);
  // the streak: a thin bright band all round the sky at ~re deg (what a chase/orbit camera sees mirrored in a roof or bonnet, whatever the heading)
  const R=60,e=Q.re*Math.PI/180,w=Q.rw*Math.PI/180,y0=R*Math.tan(e-w/2),y1=R*Math.tan(e+w/2);
  const ring=new THREE.Mesh(new THREE.CylinderGeometry(R,R,y1-y0,48,1,true),B({color:new THREE.Color(1,1,1.04).multiplyScalar(Q.rk*kk),side:THREE.DoubleSide}));ring.position.y=(y0+y1)/2;add.push(ring);
  for(const o of add)ENVSC.add(o);let t;try{const pm=new THREE.PMREMGenerator(renderer);t=pm.fromScene(ENVSC,0).texture;pm.dispose()}finally{for(const o of add){ENVSC.remove(o);o.geometry.dispose();o.material.dispose()}}
  GL.C.set(id,t);if(GL.C.size>4){const[k0,t0]=GL.C.entries().next().value;GL.C.delete(k0);if(t0!==GL.tex)t0.dispose()}GL.tex=t;GL.id=id;GL.n++;GL.ms=performance.now()-t0;return t}
// a car paint material: vertex-coloured (or player livery) standard/physical, opaque; glass keeps its own (darker, sharper) look but takes the studio too
function GL_paint(m){return m&&m.isMeshStandardMaterial&&!m.transparent&&m.envMap&&(m.isMeshPhysicalMaterial||m.envMapIntensity>1||m.userData.a10e!==undefined)}
function GL_set(m,ei){if(!GL_paint(m))return;if(m.userData.gl0===undefined)m.userData.gl0=[m.envMapIntensity,m.clearcoatRoughness];
  if(m.envMap!==GL.tex)m.envMap=GL.tex;const gls=m.roughness<.1;m.envMapIntensity=gls?1.5:m.userData.gl0[0]*ei;if(m.isMeshPhysicalMaterial){if(m.clearcoat<.8)m.clearcoat=1;m.clearcoatRoughness=gls?.03:.05}GL.mats.add(m)}
function GL_apply(){if(!GL.on||!scene.environment)return;if(!GL.tex||GL.id!==GL_key())GL_env();const ei=GL.P.ek;
  if(HUB&&HUB.cim)for(const k in HUB.cim){const im=HUB.cim[k];if(im)for(const m of[].concat(im.material))GL_set(m,ei)}
  if(typeof pl!=='undefined'&&pl&&pl.mesh)pl.mesh.traverse(o=>{if(o.isMesh)for(const m of[].concat(o.material))GL_set(m,ei)})}
function GL_off(){for(const m of GL.mats){const o=m.userData.gl0;m.envMap=scene.environment;if(o){m.envMapIntensity=o[0];if(o[1]!=null)m.clearcoatRoughness=o[1]}}GL.mats.clear()}
// ART10_cars (every 500 ms in roam) re-points car paint at scene.environment and caps it: run after it, same cadence
ART10_cars=(f=>function(){const r=f.apply(this,arguments);try{GL_apply()}catch(e){}return r})(ART10_cars);
// GO why/glossy: paint on player + traffic carries the studio env with clearcoat; material + program counts unchanged (±2) after switching it on;
// frame cost unchanged by construction: every car paint material draws with the SAME compiled program off and on and draw calls are equal
// (only the env texture's contents differ); render time at 6x CPU (tChkGo CDP bridge) is printed for info, with an off-vs-off control, because
// swiftshader's noise floor (control -10..+100%) cannot resolve 5% (10 rounds in ABBA order so neither arm always runs first, each the mean of 8 renderer.render + 1-px readback after 1 warm frame; median of the round means; an off-vs-off control shows the noise floor).
function GL_go(say){if(state!=='roam'||!RO.on)return'📍 Start free roam to run this';
  const cnt=()=>{const S=new Set();if(pl&&pl.mesh)pl.mesh.traverse(o=>{if(o.isMesh)[].concat(o.material).forEach(m=>S.add(m))});for(const k in HUB.cim){const im=HUB.cim[k];if(im)for(const x of[im,im.userData.w,im.userData.g])if(x)[].concat(x.material).forEach(m=>S.add(m))}return S.size};
  const chk=()=>{let p=0,pg=0,t=0,tg=0;pl.mesh.traverse(o=>{if(o.isMesh)for(const m of[].concat(o.material))if(GL_paint(m)&&m.roughness>=.1){p++;if(m.envMap===GL.tex&&m.envMapIntensity>0&&(!m.isMeshPhysicalMaterial||m.clearcoat>=.8))pg++}});
   for(const k in HUB.cim){const im=HUB.cim[k];if(im)for(const m of[].concat(im.material))if(m.isMeshStandardMaterial){t++;if(m.envMap===GL.tex)tg++}}return{p,pg,t,tg}};
  const gl=renderer.getContext(),px=new Uint8Array(4),blk=n=>{const t0=performance.now();for(let i=0;i<n;i++){renderer.render(scene,camera);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px)}return(performance.now()-t0)/n};
  const med=a=>{a=a.slice().sort((x,y)=>x-y);return a[a.length>>1]};
  (async()=>{const wasOn=GL.on;GL.on=true;GL_apply();const ML=[...GL.mats],pg=()=>{const M=new Map();for(const m of ML){const q=renderer.properties.get(m);M.set(m,q&&q.currentProgram)}return M},dc=()=>{const ar=renderer.info.autoReset;renderer.info.autoReset=true;renderer.render(scene,camera);renderer.info.autoReset=ar;return renderer.info.render.calls};
   GL.on=false;GL_off();renderer.render(scene,camera);const m0=cnt(),p0=renderer.info.programs.length,d0=dc(),g0=pg();
   GL.on=true;GL_apply();renderer.render(scene,camera);const m1=cnt(),p1=renderer.info.programs.length,c=chk(),d1=dc(),g1=pg();let same=0,nm=0;for(const[m,q]of g1){nm++;if(q&&g0.get(m)===q)same++}
   const thr=typeof window.__cdp==='function';if(thr)await window.__cdp('Emulation.setCPUThrottlingRate',{rate:6});
   const A=[],B=[],Z=[],off=()=>{GL.on=false;GL_off();blk(1);return blk(8)},on=()=>{GL.on=true;GL_apply();blk(1);return blk(8)};try{for(let r=0;r<10;r++){if(r&1){B.push(on());A.push(off());Z.push(off())}else{A.push(off());B.push(on());Z.push(off())}}}finally{if(thr)await window.__cdp('Emulation.setCPUThrottlingRate',{rate:1})}
   GL.on=wasOn;if(!wasOn)GL_off();const a=med(A),b=med(B),d=(b/a-1)*100,z=(med(Z)/a-1)*100;
   const ok=c.p>0&&c.pg===c.p&&c.t>0&&c.tg===c.t&&Math.abs(m1-m0)<=2&&p1-p0<=2&&same===nm&&nm>0&&d1===d0;
   say(`📍 why/glossy · player paint with studio env + clearcoat ${c.pg}/${c.p} · traffic paint ${c.tg}/${c.t} · materials ${m0}→${m1} (±2) · programs ${p0}→${p1} (+≤2) · same compiled program off/on ${same}/${nm} · draw calls ${d0}→${d1} (=) · render ${thr?'6x CPU':'1x (no CDP)'} median off ${a.toFixed(2)} ms → on ${b.toFixed(2)} ms (${d>=0?'+':''}${d.toFixed(1)}%, info only: off-vs-off control ${z>=0?'+':''}${z.toFixed(1)}%) · env build ${GL.ms.toFixed(1)} ms, ${GL.n} built → ${ok?'✅ PASS':'❌ FAIL'}`)})();
  return'📍 why/glossy · measuring…'}
{const reg=setInterval(()=>{if(!window.__chk||!__chk.GO)return;clearInterval(reg);
 __chk.items.unshift({ver:'why',id:'glossy',area:'world',text:'glossy-cars-r22e10 (?gloss=1): player and traffic paint reflect the world sky plus a hot sun disc and one thin bright band, so the clearcoat shows a crisp line on spoiler/roof edges while body hue, saturation and brightness stay within 5 % of gloss off. 📍 GO checks paint materials on the player and every traffic model carry it, material/program counts unchanged (±2) and same compiled programs and draw calls off/on (so no frame-time cost); 6x CPU render time printed for info.'});
 __chk.GO['why/glossy']=['fra','ath'].map(c=>({c,n:'glossy cars '+(c==='fra'?'Frankfurt':'Athens'),secs:60,fn:()=>GL_go(__chk.goSay)}))},500)}
window.__gl={GL,apply:GL_apply,off:GL_off,env:GL_env};
