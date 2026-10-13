import * as THREE from '../../node_modules/three/build/three.module.js';
import fs from 'fs';
const src=fs.readFileSync('src/98wb_world_batch.js','utf8');
const f=src.slice(src.indexOf('function WB_srgb'),src.indexOf('const WB_skipUD'));
const WBC={tpl:new Map(),px:new Map()};
const WB_tpl=new Function('THREE','WBC',f+';return WB_tpl')(THREE,WBC);
const g=new THREE.TorusKnotGeometry(1,.3,200,32);const m=new THREE.MeshStandardMaterial();
console.log('indexed tris',g.index.count/3, WB_tpl(g,m,.1,true).n);
const gn=g.toNonIndexed();console.log('nonidx', WB_tpl(gn,m,.1,true).n);
// timing: big indexed plane, 50 sub-index views
const P=new THREE.PlaneGeometry(1000,1000,400,400);P.rotateX(-Math.PI/2);let t=Date.now();const I=P.index.array;for(let k=0;k<50;k++){const tg=new THREE.BufferGeometry();tg.setAttribute('position',P.attributes.position);tg.setIndex(new THREE.BufferAttribute(I.subarray(k*6000,k*6000+6000),1));WB_tpl(tg,m,3,true)}console.log('50 pieces ms',Date.now()-t);
t=Date.now();const pn=P.toNonIndexed();WB_tpl(pn,m,3,true);console.log('nonidx whole 320k tris ms',Date.now()-t);
