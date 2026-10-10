// tools/ld/ldDoor.js <url> <outdir> <id[+id2]:scale> ... : minifig-scale proof (Alex: "buildings where a lego human can fit"). Each building is drawn in metres
// as the world builds it (CR_LO 2, culled, garage units × LD_SW × scale), a game minifig scaled to the pedestrian height (1.9 m, SC_K.ped) stands in its
// lowest door, low 3/4 camera from outside at 852×393. Prints door opening height vs the figure.
const {chromium}=require('/opt/node22/lib/node_modules/playwright');const fs=require('fs');const O=process.argv[3];fs.mkdirSync(O,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const p=await (await b.newContext({viewport:{width:852,height:393}})).newPage();
 const errs=[];p.on('pageerror',e=>errs.push(String(e)));await p.goto(process.argv[2]);await p.waitForFunction(()=>window.__ld&&window.__mho,null,{timeout:240000});
 for(const a of process.argv.slice(4)){const[ids,sc]=a.split(':');
  const r=await p.evaluate(([ids,sc])=>{const T=__ld.THREE,B=[].concat(...ids.split('+').map(i=>__ld.br(i))),K=__ld.SW*(+sc||__ld.FIG),g=__ld.grpLo(B);g.scale.setScalar(K);g.updateMatrixWorld(true);
   const box=new T.Box3().setFromObject(g),c=box.getCenter(new T.Vector3());
   // lowest door: catalogue/LDraw part named door (not roller/garage), else the lowest roller door
   const P=__ld.PC,isD=b=>{const n=(P[b.t.split('@')[0]]||{}).n||'';return/^[=~]?(door|door frame)\b/i.test(n.replace(/^~/,''))&&!/container|roller/i.test(n)},isR=b=>/roller door/i.test((P[b.t.split('@')[0]]||{}).n||'');
   const isF=b=>{const n=((P[b.t.split('@')[0]]||{}).n||'').replace(/^~/,'');return/^(window|door)/i.test(n)&&/x 4 x [56]\b/.test(n)};let D=B.filter(isD);if(!D.length)D=B.filter(isR);if(!D.length){const y0=Math.min(...B.filter(isF).map(b=>b.y));D=B.filter(b=>isF(b)&&b.y<=y0+1)}D.sort((x,y)=>x.y-y.y);const d=D[0];let fx=c.x,fz=box.min.z-.4,fy=box.min.y,doorH=null,dir=[0,-1],nm='front (no door: stall/cart)';
   if(d){const di=B.indexOf(d),db=new T.Box3();g.traverse(o=>{if(!o.isMesh||!o.geometry.userData.bid)return;const id=o.geometry.userData.bid,ps=o.geometry.attributes.position,v=new T.Vector3();
     for(let t=0;t<id.length;t++)if(id[t]===di)for(let k=0;k<3;k++){v.fromBufferAttribute(ps,t*3+k).multiplyScalar(K);db.expandByPoint(v)}});
    const dc=db.getCenter(new T.Vector3()),ds=db.getSize(new T.Vector3());fx=dc.x;fz=dc.z;fy=db.min.y;doorH=+ds.y.toFixed(2);nm=(P[d.t.split('@')[0]]||{}).n;
    // outward: across the door's thin axis, away from the building centre
    dir=ds.x<ds.z?[Math.sign(dc.x-c.x)||1,0]:[0,Math.sign(dc.z-c.z)||1];fx+=dir[0]*.35;fz+=dir[1]*.35}
   const f=__ld.fig(),fb=new T.Box3().setFromObject(f),fs=1.9/(fb.max.y-fb.min.y);f.scale.setScalar(fs);f.position.set(fx,fy-fb.min.y*fs,fz);f.rotation.y=Math.atan2(dir[0],dir[1]);
   const sc2=new T.Scene();sc2.background=new T.Color(0x4a90d9);sc2.add(new T.HemisphereLight(0xffffff,0x667755,1.6));const L=new T.DirectionalLight(0xffffff,1.6);L.position.set(1,2,1.4);sc2.add(L);sc2.add(g);sc2.add(f);
   const s=box.getSize(new T.Vector3()),R=Math.max(s.x,s.z),gr=new T.Mesh(new T.PlaneGeometry(R*8,R*8),new T.MeshLambertMaterial({color:0x6c6c6c}));gr.rotation.x=-Math.PI/2;gr.position.y=box.min.y-.01;sc2.add(gr);
   const cam=new T.PerspectiveCamera(50,852/393,.05,500),dist=7;cam.position.set(fx+dir[0]*dist+dir[1]*dist*.5,fy+1.6,fz+dir[1]*dist-dir[0]*dist*.5);cam.lookAt(fx,fy+1.6,fz);
   const rd=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});rd.setSize(852,393);rd.render(sc2,cam);
   return{dn:[...new Set(B.map(b=>(P[b.t.split('@')[0]]||{}).n||'').filter(n=>/door|frame|window/i.test(n)))].slice(0,6).join(' | '),door:nm,doorH,fig:1.9,size:[s.x,s.y,s.z].map(v=>+v.toFixed(1)),png:rd.domElement.toDataURL('image/png')}},[ids,sc]);
  fs.writeFileSync(`${O}/door_${ids.replace(/\+/g,'_')}.png`,Buffer.from(r.png.split(',')[1],'base64'));console.log('DOOR',ids,'parts',r.dn,'scale',sc||'FIG','door',r.door,'h',r.doorH,'m fig 1.9 m size',r.size)}
 console.log('errs',errs.slice(0,3));await b.close()})();
