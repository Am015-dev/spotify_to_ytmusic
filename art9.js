// ==== ART pART9 · the van-chase "dropped crate" obstacle reads as a crate (was a bare 3.5×2.2×3.5 m flat brown box,
// BoxGeometry(1.6,1,1.6) scaled 2.2: from behind the player it looked like a brown wall on the road).
// Now: a 1.8×1.3×1.8 m LEGO crate, plank texture with a darker frame and cross brace, four studs on top; origin at its base.
const ART9={};
function ART9_tex(){if(ART9.tx)return ART9.tx;const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
 x.fillStyle='#c98b4b';x.fillRect(0,0,128,128);for(let i=0;i<5;i++){x.fillStyle=i%2?'#bf8043':'#d29657';x.fillRect(0,i*25.6,128,25.6);x.fillStyle='#8a5526';x.fillRect(0,i*25.6,128,2)}
 x.strokeStyle='#7a4a20';x.lineWidth=14;x.strokeRect(7,7,114,114);x.lineWidth=11;x.beginPath();x.moveTo(12,12);x.lineTo(116,116);x.stroke();
 x.strokeStyle='#e0a868';x.lineWidth=2;x.strokeRect(14,14,100,100);
 const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;return ART9.tx=t}
function ART9_crate(){if(!ART9.g){const w=1.8,h=1.3;ART9.m=new THREE.MeshStandardMaterial({map:ART9_tex(),roughness:.55});
  ART9.ms=new THREE.MeshStandardMaterial({color:0xc98b4b,roughness:.45});ART9.g=new THREE.BoxGeometry(w,h,w).translate(0,h/2,0);
  ART9.sg=new THREE.CylinderGeometry(.24,.24,.16,12).translate(0,h+.08,0)}
 const o=new THREE.Group(),b=new THREE.Mesh(ART9.g,ART9.m);o.add(b);
 for(const[a,c]of[[-.45,-.45],[.45,-.45],[-.45,.45],[.45,.45]]){const s=new THREE.Mesh(ART9.sg,ART9.ms);s.position.set(a,0,c);o.add(s)}return o}
// Race haze: the bloom pass (threshold 1.0, strength .95, radius .6) bloomed the large over-bright neon track surfaces
// (cyan wall chevrons, floor hexes, horizon glow) into a screen-wide cyan wash that sat over the player car (pink, see-through look);
// worst in the SMASH frame, when the lunge swings the view toward the bright wall. In races only real light sources bloom now
// (threshold 1.5: neon signs, lamps, pillars); the city keeps threshold 1.0.
composer.render=(f=>function(...a){try{bloom.threshold=RO.on?1:1.5}catch(e){}return f.apply(this,a)})(composer.render);
// Teal truck blob + boxy one-colour pickup: city traffic built by CR_cityGeo (HUB.cim) took the per-instance HCOL tint on EVERY
// vertex, so a truck's whole 21-stud cargo box (white walls + grey ribs) became one mint/teal striped block and the suv/pickup's
// black windows, roof rack and trim turned the body colour (one flat blue box). Now only the pure-white body bricks (vertex colour
// #ffffff) take the instance colour; cargo boxes (#f4f4f4), ribs (#c9ced6), black trim/windows and grey parts keep their own.
function ART9_cabMat(){if(ART9.cab)return ART9.cab;const m=CR_CM.clone();m.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('vColor.xyz *= instanceColor.xyz;',
 '#ifdef USE_COLOR\n vColor.xyz *= mix(vec3(1.),instanceColor.xyz,step(.99,min(color.r,min(color.g,color.b))));\n#else\n vColor.xyz *= instanceColor.xyz;\n#endif')};
 m.customProgramCacheKey=()=>'art9cab';return ART9.cab=m}
