// ==== ART step 2 · scenery: brick-built trees (autumn red/orange/yellow + green), studs on up-facing plastic, plastic rim sheen (module art2.js; patch pART2.py)
function ART_brickGeo(layers,trunk,stud){const P=[],u=.8;const add=(g,c)=>{const q=g.index?g.toNonIndexed():g;q.deleteAttribute('uv');P.push(colorize(q,new THREE.Color(c)))};
  if(trunk)add(new THREE.BoxGeometry(trunk[0],trunk[1],trunk[0]).translate(0,trunk[1]/2,0),trunk[2]);
  const sg=new THREE.CylinderGeometry(.24,.24,.2,6,1,false);sg.deleteAttribute('uv');
  layers.forEach((L,i)=>{const[w,h,y,ox=0,oz=0,col='#ffffff']=L;add(new THREE.BoxGeometry(w-.04,h,w-.04).translate(ox,y+h/2,oz),col);
    const nx=Math.round(w/u),nu=layers[i+1];for(let a=0;a<nx;a++)for(let b=0;b<nx;b++){const x=ox+(a-(nx-1)/2)*u,z=oz+(b-(nx-1)/2)*u;
      if(nu&&Math.abs(x-(nu[3]||0))<nu[0]/2&&Math.abs(z-(nu[4]||0))<nu[0]/2)continue;if(!stud||(a+b)%stud)continue;add(sg.clone().translate(x,y+h+.1,z),col)}});
  const g=mergeGeometries(P);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();return g}
const ART_TREES={
 tree:()=>ART_brickGeo([[4.8,1.2,3.2],[6.4,1.6,4.4],[4.8,1.2,6.0],[3.2,1.0,7.2]],[1.6,3.4,'#8a5a32'],0),
 tree2:()=>ART_brickGeo([[5.6,1.2,3.6],[7.2,1.6,4.8],[5.6,1.4,6.4,.4,.4],[2.4,1.0,7.8,.4,.4]],[1.6,3.8,'#7a4a28'],0),
 tree3:()=>ART_brickGeo([[5.6,1.2,2.0],[4.8,1.2,3.2],[4.0,1.2,4.4],[3.2,1.2,5.6],[2.4,1.2,6.8],[1.6,1.2,8.0]],[1.2,2.2,'#6a4426'],0),
 bush:()=>ART_brickGeo([[3.2,1.0,0],[2.4,.8,1.0]],null,0)};
const ART_TINT={tree:['#e8402a','#f07a1a','#f6c21c','#5cbc3a','#f07a1a'],tree2:['#f39a1a','#ffd23a','#d83a2a','#7cc84a'],tree3:['#3f9a3a','#56b048','#2f8a3a'],bush:['#5cbc3a','#7cc84a','#e8402a']};
function ART_trees(D){try{const mat=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.42,metalness:0});
  for(const k in ART_TREES)if(D[k]){D[k].g=ART_TREES[k]();D[k].mat=mat;D[k].tint=ART_TINT[k];D[k].cols=[ART_TINT[k][0],'#8a5a32']}}catch(e){console.warn('ART_trees',e)}}
function ART_athTreeBy(k){if(k==='cypress')return ART_brickGeo([[2.4,1.2,1.2,0,0,'#3f8a3a'],[2.4,1.2,2.4,0,0,'#3a8236'],[2.4,1.2,3.6,0,0,'#3f8a3a'],[2.4,1.2,4.8,0,0,'#46923e'],[1.6,1.2,6.0,0,0,'#4f9a42'],[1.6,1.2,7.2,0,0,'#56a046'],[.8,1.0,8.4,0,0,'#5ea84a']],[.8,1.2,'#6a4426'],0);
  if(k==='olive')return ART_brickGeo([[4.8,1.0,2.6,.4,0,'#8fae5a'],[5.6,1.0,3.6,.4,0,'#9cbc64'],[3.2,.8,4.6,.8,0,'#a8c46e']],[1.2,2.6,'#7a6448'],0);
  if(k==='pine')return ART_brickGeo([[2.4,1.0,5.2,0,0,'#4f7a3a'],[7.2,1.0,6.2,0,0,'#5a8a3e'],[5.6,1.0,7.2,0,0,'#66984a']],[1.2,5.2,'#6a5040'],0);
  if(k==='plane')return ART_brickGeo([[5.6,1.4,4.2,0,0,'#f07a1a'],[7.2,1.6,5.6,0,0,'#f39a1a'],[5.6,1.4,7.2,.4,.4,'#ffc21c'],[3.2,1.0,8.6,.4,.4,'#e8402a']],[1.6,4.2,'#7a6a58'],0);
  return null}
function ART_athTree(){return ART_brickGeo([[4.0,1.0,2.8,0,0,'#5a9a3a'],[5.6,1.4,3.8,0,0,'#4f8f34'],[4.0,1.0,5.2,.4,0,'#6aaa42'],[2.4,.8,6.2,.4,0,'#7cbc4a']],[1.2,2.8,'#7a5236'],0)}
// global plastic look: studs on up-facing untextured surfaces above the ground, soft warm rim, slightly higher gloss
{const _ob=THREE.MeshStandardMaterial.prototype.onBeforeCompile;THREE.MeshStandardMaterial.prototype.onBeforeCompile=function(sh,r){_ob.call(this,sh,r);if(sh.fragmentShader.includes('artStud'))return;
  let f=sh.fragmentShader;
  f=f.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\n#ifndef USE_MAP\nroughnessFactor=min(roughnessFactor,.5);\n#endif');
  if(f.includes('vLkW'))f=f.replace('#include <color_fragment>','#include <color_fragment>\n#ifndef USE_MAP\n{/*artStud*/vec3 an=normalize(cross(dFdx(vLkW),dFdy(vLkW)));float fw=length(fwidth(vLkW.xz));if(an.y>.96&&vLkW.y>.6&&fw<.45){vec2 g=fract(vLkW.xz/.8)-.5;float rr=length(g);float k=1.-smoothstep(.15,.45,fw);float disc=1.-smoothstep(.24,.27,rr);float ring=smoothstep(.26,.3,rr)*(1.-smoothstep(.3,.38,rr));float lit=dot(normalize(g+1e-4),vec2(-.7,-.7));diffuseColor.rgb*=1.+k*(disc*(.08+.1*lit)-ring*.22);}}\n#endif');
  f=f.replace('#include <opaque_fragment>','{float fr=1.-max(dot(normalize(normal),normalize(vViewPosition)),0.);outgoingLight+=vec3(1.,.86,.66)*pow(fr,4.)*.16*(1.-roughnessFactor*.5);}\n#include <opaque_fragment>');
  sh.fragmentShader=f}}
