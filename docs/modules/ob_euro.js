// OB: Euro-Skulptur (Willy-Brandt-Platz) rebuilt as a readable € sign: blue C arc (~300°, open to the right), two yellow bars
// reaching left past the arc, on a neck + plinth, ringed by 12 yellow five-pointed stars (EU flag), ~14 m tall.
// Everything is merged into ONE vertex-coloured geometry added to the landmark batch (BM.plain) -> no extra draw call.
let OB_EURO=null;
// Base height = what TR_bldFix computes for the collider footprint (max(min,max-.8) of 9 ground samples), so its terrain lift is 0:
// the base game lifted only the vertices near the 2x2 collider (the old arc/stars got sheared = the "weird shape").
const OB_EURO_HW=3.4,OB_EURO_HD=2.1;
function OB_euroBuild(bt,BM,x,z){const GY=(a,b)=>(typeof groundY==='function'?groundY(a,b):0)||0,P=[];for(const u of[-1,0,1])for(const v of[-1,0,1])P.push(GY(x+u*OB_EURO_HW,z+v*OB_EURO_HD));
 const gy=Math.max(Math.min(...P),Math.max(...P)-.8),C=c=>new THREE.Color(c),GS=[];
 const put=(g,col)=>{g=g.index?g.toNonIndexed():g;g.clearGroups();for(const k of Object.keys(g.attributes))if(!['position','normal','uv'].includes(k))g.deleteAttribute(k);if(!g.attributes.uv)g.setAttribute('uv',new THREE.BufferAttribute(new Float32Array(g.attributes.position.count*2),2));colorize(g,C(col));GS.push(g);return g};
 const BLUE='#1d3fb8',YEL='#ffc81e',STONE='#9a9ea6';
 const PH=1.0,CY=7.4,RO=4.2,RI=2.85,DEP=1.2,GAP=.62,RS=6.0,SR=.58;
 // plinth + step + neck
 {const g=new THREE.BoxGeometry(5.2,PH,3.2);g.translate(0,PH/2,0);put(g,STONE)}
 {const g=new THREE.BoxGeometry(6.4,.25,4.2);g.translate(0,.125,0);put(g,'#c8c4ba')}
 {const g=new THREE.BoxGeometry(1.3,CY-RO-PH+.4,1.0);g.translate(0,PH+(CY-RO-PH+.4)/2,0);put(g,'#2a3550')}
 // the C arc (flat-faced extrusion like the glyph), opening to +x
 {const s=new THREE.Shape(),a0=GAP,a1=Math.PI*2-GAP;s.absarc(0,0,RO,a0,a1,false);s.lineTo(Math.cos(a1)*RI,Math.sin(a1)*RI);s.absarc(0,0,RI,a1,a0,true);s.lineTo(Math.cos(a0)*RO,Math.sin(a0)*RO);
  const g=new THREE.ExtrudeGeometry(s,{depth:DEP,bevelEnabled:true,bevelThickness:.08,bevelSize:.08,bevelSegments:1,curveSegments:40});g.translate(0,CY,-DEP/2);put(g,BLUE)}
 // two horizontal bars, extending left past the arc
 for(const o of[-.95,.95]){const g=new THREE.BoxGeometry(7.0,.72,DEP+.36);g.translate(-1.75,CY+o,0);put(g,YEL)}
 // 12 five-pointed stars on a circle in the same vertical plane (slightly in front, readable from both sides)
 {const st=new THREE.Shape();for(let i=0;i<10;i++){const r=i%2?SR*.4:SR,a=Math.PI/2+i*Math.PI/5;i?st.lineTo(Math.cos(a)*r,Math.sin(a)*r):st.moveTo(Math.cos(a)*r,Math.sin(a)*r)}
  for(let k=0;k<12;k++){const a=Math.PI/2-k*Math.PI/6,g=new THREE.ExtrudeGeometry(st,{depth:.28,bevelEnabled:false});g.translate(Math.cos(a)*RS,CY+Math.sin(a)*RS,-.14);put(g,YEL)}}
 const m=mergeGeometries(GS,false);m.translate(x,gy,z);m.computeBoundingBox();
 OB_EURO={x,z,gy,hw:OB_EURO_HW,hd:OB_EURO_HD,mesh:new THREE.Mesh(m),parts:GS.length};bt.add(m,BM.plain);return OB_EURO}
window.__ob=Object.assign(window.__ob||{},{euro:()=>{if(!OB_EURO)return null;const b=new THREE.Box3().setFromObject(OB_EURO.mesh),s=b.getSize(new THREE.Vector3());
 return{x:OB_EURO.x,z:OB_EURO.z,gy:+OB_EURO.gy.toFixed(2),min:b.min.toArray().map(v=>+v.toFixed(2)),size:[+s.x.toFixed(2),+s.y.toFixed(2),+s.z.toFixed(2)],parts:OB_EURO.parts,drawCalls:1,extraDrawCalls:0,verts:OB_EURO.mesh.geometry.attributes.position.count}}});
