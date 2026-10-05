# CAR2: LEGO street props (trees, bushes, cones, barriers, planters; Athens orange/olive/cypress trees). Needs pCAR1. Instanced as before.
exec(open('P.py').read())
if 'CR_PROPS' in s:
    print('OK');raise SystemExit
assert 'CR_SPEED' in s, 'apply pCAR1 first'
PROPS=r'''
// ---------- LEGO street props (instanced like the old ones; white parts take the per-instance tint)
const CR_PM=new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:.32,metalness:0,clearcoat:.7,clearcoatRoughness:.12,envMapIntensity:1.1});
const LG={stud:(A,x,y,z,col,r=.13)=>{A.push(GB_col(new THREE.CylinderGeometry(r,r,.09,6).translate(x,y+.045,z),col))},
 disc:(A,r,y,h,col,seg=12)=>A.push(GB_col(new THREE.CylinderGeometry(r,r,h,seg).translate(0,y+h/2,0),col)),
 ring:(A,r,y,n,col,a0=0)=>{for(let i=0;i<n;i++){const a=a0+i/n*Math.PI*2;LG.stud(A,Math.cos(a)*r,y,Math.sin(a)*r,col)}},
 box:(A,w,h,d,x,y,z,col)=>A.push(GB_box(x-w/2,x+w/2,y,y+h,z-d/2,z+d/2,col))};
function LG_stack(A,R,y0,h,col,studs=1){let y=y0;R.forEach((r,i)=>{LG.disc(A,r,y,h,col);y+=h;const nx=R[i+1];if(studs&&(nx==null||nx<r-.25)){const rr=nx==null?r*.45:(r+nx)/2;LG.ring(A,rr,y,nx==null?4:Math.max(5,Math.round(rr*4)),col,i*.4)}});return y}
function LG_trunk(A,h,r=.3,col='#6b4a2a'){const n=Math.max(1,Math.round(h/.5));for(let i=0;i<n;i++){LG.disc(A,r,i*h/n,h/n-.02,col,10);LG.disc(A,r*.82,i*h/n+h/n-.03,.03,col,10)}}
const CR_PROPS={
 tree:()=>{const A=[];LG_trunk(A,2.4,.34);LG_stack(A,[1.3,1.9,2.3,2.5,2.5,2.3,1.9,1.3],2.4,.6,'#ffffff');return A},
 tree2:()=>{const A=[];LG_trunk(A,2.6,.4);LG_stack(A,[2.0,2.7,3.1,3.2,3.0,2.5,1.7],2.6,.62,'#ffffff');return A},
 tree3:()=>{const A=[];LG_trunk(A,1.4);LG_stack(A,[2.2,1.95,1.7,1.45,1.2,.95,.7,.45],1.4,.5,'#ffffff');LG.disc(A,.13,1.4+8*.5,.4,'#ffffff',6);return A},
 bush:()=>{const A=[];LG_stack(A,[1.1,1.35,1.2,.8],0,.42,'#ffffff');return A},
 cone:()=>{const A=[];LG.box(A,.8,.12,.8,0,0,0,'#1b2a34');A.push(GB_col(new THREE.CylinderGeometry(.08,.34,.9,10).translate(0,.57,0),'#fe8a18'));A.push(GB_col(new THREE.CylinderGeometry(.21,.26,.16,10).translate(0,.5,0),'#f4f4f4'));LG.stud(A,0,1.02,0,'#fe8a18',.07);return A},
 barrier:()=>{const A=[];for(const sx of[-1,1])LG.box(A,.3,.9,.7,sx*.9,0,0,'#1b2a34');for(let i=0;i<4;i++)LG.box(A,.5,.4,.22,-.75+i*.5,.55,0,i%2?'#f4f4f4':'#d01712');for(let i=0;i<4;i++)LG.stud(A,-.75+i*.5,.95,0,i%2?'#f4f4f4':'#d01712');return A},
 planter:()=>{const A=[];LG.box(A,1.6,.6,1.6,0,0,0,'#7a5a3a');for(const[x,z]of[[-.4,-.4],[.4,-.4],[-.4,.4],[.4,.4]])LG.stud(A,x,.6,z,'#7a5a3a');LG_stack(A,[.75,.6,.35],.6,.32,'#3f8a2e');return A},
 orange:()=>{const A=[];LG_trunk(A,1.8,.26);const top=LG_stack(A,[1.3,1.75,1.85,1.5,.9],1.8,.45,'#3f7a34');for(let i=0;i<9;i++){const a=i*2.4,y=2.2+(i%4)*.45,r=1.85-(i%4==3?.4:0);A.push(GB_col(new THREE.CylinderGeometry(.2,.2,.16,8).rotateZ(Math.PI/2).rotateY(-a).translate(Math.cos(a)*r,y,Math.sin(a)*r),'#ff9a1a'))}return A},
 olive:()=>{const A=[];LG_trunk(A,2.4,.34,'#6f6250');LG_stack(A,[2.0,2.7,2.6,1.7],2.4,.45,'#7d8a5a');return A},
 cypress:()=>{const A=[];LG_trunk(A,.8,.3,'#5a4636');LG_stack(A,[1.0,1.2,1.25,1.25,1.2,1.15,1.05,.95,.85,.7,.55,.4],.8,.75,'#2f5a32',1);return A}};
function CR_props(D){const set=(k,b,extra)=>{if(!D[k])return;try{D[k].g=mergeGeometries(CR_PROPS[b]());D[k].mat=CR_PM;Object.assign(D[k],extra||{})}catch(e){console.warn('CR prop',k,e)}};
 const G=['#4f9a36','#3f8a2e','#6fb83f','#8cc04a','#3a7a3a'];
 if(CID==='fra'){set('tree','tree',{tint:G});set('tree2','tree2',{tint:G});set('tree3','tree3',{tint:['#2f6a3a','#3a7a3a','#2a5a32']})}else{set('tree','orange',{tint:null})}
 set('bush','bush',{tint:['#4f9a36','#3f8a2e','#6fb83f']});set('cone','cone',{tint:null});set('barrier','barrier',{tint:null});set('planter','planter',{tint:null});
 set('CE_olive','olive',{tint:null});set('CE_cypress','cypress',{tint:null});set('CE_pine','tree3',{tint:['#3a6a34','#4a7a3a']})}
'''
i=s.index('const GB_PRE=[')
s=s[:i]+PROPS+'\n'+s[i:]
R("CE_defs(D);HUB.ptypes=D;","CE_defs(D);CR_props(D);HUB.ptypes=D;")
save()
print('OK')
