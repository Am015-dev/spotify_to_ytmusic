// ===== LVM: LIVELINESS METER (art-1, 2026-10-13). Alex: "All the game looks extremely poor compared to lively 2K Drive ... way too many empty
// spaces, boring green flat spaces." 8 fixed camera spots per city; LVM_measure() scores what the player sees from the chase camera:
//  green = % of the frame that is flat uniform grass (green pixels in 4×4 blocks with no texture), props = street props within 50 m,
//  life = people within 50 m, hr = terrain height range (m) in a 30-200 m fan ahead, cols = distinct colours (3 bits/channel, ≥0.2 % each).
// Pass line per spot: green ≤ 25 %, props ≥ 40, cols ≥ 24 (+ hr ≥ 6 m on open/park spots). Checklist items "liveliness: <spot>" use LVM_go/LVM_check.
const LVM_SPOTS={
 fra:[['street','Hauptwache street',235,450,600,640],['park','Grüneburgpark',1475,1850,1475,2050],['river','Main riverside',0,-150,600,-150],
  ['motorway','A5 by Kennedyallee',2600,-1852,2400,-1500],['race','race start (season)',2450,-2692,2300,-2400],['field','Wetterau fields',-2000,4500,-1500,4700],
  ['ostpark','Ostpark',-2300,860,-2300,1000],['forest','Stadtwald',500,-2500,700,-2300]],
 ath:[['street','Plateia Omonias',1655,-875,1300,-1200],['park','Pedion tou Areos',1250,-75,1250,150],['garden','Ethnikos Kipos',725,-2090,900,-2300],
  ['agora','Archaia Agora',2055,-1845,2300,-1600],['villa','Psychiko',-2500,1500,-2200,1800],['quarry','Tourkovounia',-700,1500,-500,1800],
  ['olympieio','Olympieio',1175,-2465,1400,-2300],['town','Chalandri',-4700,3300,-4400,3600]]};
const LVM_T={green:25,props:40,cols:24,hr:6},LVM_HR=new Set(['park','field','ostpark','forest','garden','villa','quarry','town']);
function LVM_go(c,id){const S=(LVM_SPOTS[c]||[]).find(s=>s[0]===id);if(!S)return null;const[,,x,z,lx,lz]=S,N=HUB.nodes;let bi=-1,bd=1e18;
 for(let i=0;i<N.length;i++){const a=N[i];if(!a||!a.nb||!a.nb.length||(a.ab&&id!=='motorway'))continue;const d=(a.x-x)**2+(a.z-z)**2;if(d<bd){bd=d;bi=i}}
 if(bi<0)return null;const a=N[bi];let h=Math.atan2(lx-a.x,lz-a.z),bc=-2;const tx=lx-a.x,tz=lz-a.z,tl=Math.hypot(tx,tz)||1;
 for(const j of a.nb){const b=N[j];if(!b)continue;const dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1,cc=(dx*tx+dz*tz)/l/tl;if(cc>bc){bc=cc;h=Math.atan2(dx,dz)}}
 if(!roamWarp(a.x,a.z,h))return null;RO.v=0;return{x:Math.round(a.x),z:Math.round(a.z),h:+h.toFixed(2),off:Math.round(Math.sqrt(bd))}}
const LVM_cv=document.createElement('canvas');LVM_cv.width=160;LVM_cv.height=74;
function LVM_pix(){try{composer.render()}catch(e){try{renderer.render(scene,camera)}catch(e2){}}const W=160,H=74,g=LVM_cv.getContext('2d',{willReadFrequently:true});
 g.drawImage(renderer.domElement,0,0,W,H);const d=g.getImageData(0,0,W,H).data;let flat=0;const bins=new Map();
 for(let i=0;i<d.length;i+=4){const k=(d[i]>>5)<<6|(d[i+1]>>5)<<3|(d[i+2]>>5);bins.set(k,(bins.get(k)||0)+1)}
 for(let by=0;by<H-3;by+=4)for(let bx=0;bx<W-3;bx+=4){let ok=1,s=0,s2=0;for(let y=0;y<4&&ok;y++)for(let x=0;x<4;x++){const o=((by+y)*W+bx+x)*4,r=d[o],gg=d[o+1],b=d[o+2];
   if(!(gg>r*1.08&&gg>b*1.12&&gg-Math.min(r,b)>28)){ok=0;break}const L=.3*r+.59*gg+.11*b;s+=L;s2+=L*L}
  if(ok&&s2/16-(s/16)**2<30)flat+=16}
 const n=W*H;let cols=0;for(const v of bins.values())if(v>=n*.002)cols++;return{green:+(flat/n*100).toFixed(1),cols}}
function LVM_measure(){const x=RO.x,z=RO.z,R2=2500;let props=0,life=0;for(const q of HUB.props||[])if(q.alive!==false&&(q.x-x)**2+(q.z-z)**2<R2)props++;
 for(const p of HUB.peds||[])if(p&&p.on!==false&&p.x!=null&&(p.x-x)**2+(p.z-z)**2<R2)life++;
 const v=new THREE.Vector3();camera.getWorldDirection(v);const a0=Math.atan2(v.x,v.z);let lo=1e9,hi=-1e9;
 for(let r=30;r<=200;r+=17)for(let k=-4;k<=4;k++){const a=a0+k*.13,sx=camera.position.x+Math.sin(a)*r,sz=camera.position.z+Math.cos(a)*r;let y=0;try{y=groundAt(sx,sz,999)}catch(e){}if(!isFinite(y))continue;lo=Math.min(lo,y);hi=Math.max(hi,y)}
 return Object.assign(LVM_pix(),{props,life,hr:+(hi-lo).toFixed(1)})}
function LVM_pass(id,m){const f=[];if(m.green>LVM_T.green)f.push('green '+m.green+'%>'+LVM_T.green);if(m.props<LVM_T.props)f.push('props '+m.props+'<'+LVM_T.props);
 if(m.cols<LVM_T.cols)f.push('colours '+m.cols+'<'+LVM_T.cols);if(LVM_HR.has(id)&&m.hr<LVM_T.hr)f.push('height '+m.hr+'m<'+LVM_T.hr);return f}
// checklist GO: jump, wait for the chase camera to settle, measure, say the pass line
function LVM_check(c,id){const g=LVM_go(c,id);if(!g)return'📍 Can\'t jump right now';const S=LVM_SPOTS[c].find(s=>s[0]===id);
 setTimeout(()=>{let m;try{m=LVM_measure()}catch(e){return}const f=LVM_pass(id,m);(window.__chk||{})['lv_'+c+'_'+id]=Object.assign({ok:!f.length,fail:f},m);
  try{say('',`LIVELY ${S[1]}: green ${m.green}% · ${m.props} props · ${m.life} people · ${m.cols} colours · ${m.hr} m `+(f.length?'❌ '+f.join(', '):'✅'),5)}catch(e){}},2500);
 return'📍 '+S[1].toUpperCase()+' · measuring…'}
window.__lvm={SPOTS:LVM_SPOTS,T:LVM_T,go:LVM_go,measure:LVM_measure,pass:LVM_pass,check:LVM_check};
