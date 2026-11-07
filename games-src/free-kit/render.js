const {chromium}=require('playwright');const fs=require('fs');
(async()=>{
const data=JSON.parse(fs.readFileSync('raw/animals.json'));
const b=await chromium.launch();const p=await b.newPage({viewport:{width:512,height:512}});
await p.setContent('<body style="margin:0;background:transparent"><canvas id=c width=512 height=512></canvas></body>');
await p.addScriptTag({content:fs.readFileSync('tools/three.min.js','utf8')});
for(const [name,d] of Object.entries(data)){
 const T={bird:[.35,.55,.85],cat:[.85,.6,.35],chick:[1,.85,.3],dog:[.7,.5,.3],eagle:[.45,.3,.18],fish:[.95,.55,.5],red_fox:[.95,.45,.12],whale:[.4,.55,.7],wolf:[.55,.57,.62],piranha:[.75,.3,.25]}[name];
 const r=await p.evaluate(({d,T})=>{
  const c=document.getElementById('c');
  const R=new THREE.WebGLRenderer({canvas:c,alpha:true,antialias:true,preserveDrawingBuffer:true});R.setSize(512,512,false);R.setClearColor(0,0);
  const S=new THREE.Scene();
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(d.pos,3));g.setAttribute('color',new THREE.Float32BufferAttribute(d.col,3));g.computeVertexNormals();
  g.computeBoundingBox();const bb=g.boundingBox.clone();const ctr=new THREE.Vector3();bb.getCenter(ctr);const sz=new THREE.Vector3();bb.getSize(sz);g.translate(-ctr.x,-ctr.y,-ctr.z);bb.translate(ctr.clone().negate());const m0=0;
  const m=Math.max(sz.x,sz.y,sz.z);
  if(T){const a=g.attributes.color,P=g.attributes.position;for(let i=0;i<a.count;i++){const y=(P.getY(i)-bb.min.y)/(sz.y||1);const w=a.getX(i)>0.6&&a.getY(i)>0.6;const k=Math.max(0,Math.min(1,(0.5-y)*1.6));const lo=[1,1,0.95];for(let j=0;j<3;j++){const t=T[j]*(1-k)+lo[j]*k*(name=='x'?0:0.9);a.setXYZ(i,a.getX(i)*0+T[0]*(1-k*0.6)+0.9*k*0.6*1,T[1]*(1-k*0.6)+0.9*k*0.6,T[2]*(1-k*0.6)+0.9*k*0.6);}}}
  const mesh=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));S.add(mesh);
  S.add(new THREE.AmbientLight(0xffffff,0.75));const dl=new THREE.DirectionalLight(0xfff2dd,0.9);dl.position.set(2,3,4);S.add(dl);
  const cam=new THREE.OrthographicCamera(-m*0.62,m*0.62,m*0.62,-m*0.62,0.1,100);
  mesh.rotation.y=-0.65;cam.position.set(0,m*0.35,m*3);cam.lookAt(0,0,0);
  R.render(S,cam);return c.toDataURL('image/png');
 },{d,T});
 fs.writeFileSync('raw/spr/'+name+'.png',Buffer.from(r.split(',')[1],'base64'));
}
await b.close();})();
