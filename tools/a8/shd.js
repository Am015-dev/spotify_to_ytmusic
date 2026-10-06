(()=>{const M=__mho,D=__dbg;const out={};for(const [name,x,z,h] of [['park',2280,600,0],['hill',1957,-1012,0.6],['city',2400,576,1.57]]){M.warp(x,z,h,true);const R=M.RO;R.x=x;R.z=z;R.h=h;R.v=0;__tick(20);
const tri=()=>{D.renderer.info.reset();D.renderer.info.autoReset=false;__tick(1);const t=D.renderer.info.render.triangles;D.renderer.info.autoReset=true;return t};
const a=tri();const hid=[];D.scene.traverse(o=>{if(o.userData.a8s&&o.visible){hid.push(o);o.visible=false}});const b=tri();for(const o of hid)o.visible=true;out[name]={all:a,noShadow:b,shadow:a-b}}return out})()
