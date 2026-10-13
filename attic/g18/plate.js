// g18/plate.js <url> <id>: open a ride, list the garage mesh's gb meshes (local bbox, visible, material)
const E=require('../bc/enter.js');
(async()=>{const T=await E(process.argv[2],{gfx:'normal',tick:0});const{p,tap,tapXY}=T;const ev=c=>p.evaluate(c=>__g9ev(c),c);
 const tapSel=async s=>{const r=await p.evaluate(s=>{const e=document.querySelector(s);if(!e)return null;e.scrollIntoView({block:'center'});const b=e.getBoundingClientRect();return[b.x+b.width/2,b.y+b.height/2]},s);if(r)await tapXY(r[0],r[1])};
 await tap('#gbMenuBtn');await p.waitForTimeout(3500);await tap('#r2R [data-r2m="rides"]');await p.waitForTimeout(3000);
 for(const id of process.argv[3].split(',')){await tapSel(`#g9Col .g9Card[data-gc="${id}"] img`);for(let i=0;i<40;i++){await p.waitForTimeout(500);if(await ev('!LDL.wait.size&&!BA.on'))break}
 console.log(id,await ev(`(()=>{const U=GB.mesh.userData;const o=(U.gbM||[]).map(m=>{const g=m.geometry;g.computeBoundingBox();const b=g.boundingBox;return[m.visible?'V':'h',m.material===GB_MAT?'M':m.material===GB_LMAT?'L':'G',m.userData.r?'w':'',b.min.y.toFixed(2),b.max.y.toFixed(2),(b.max.x-b.min.x).toFixed(2),(b.max.z-b.min.z).toFixed(2)].join(' ')});
  return JSON.stringify({bp:GB.d.bp,gbP:gbTeam(TEAMS[teamIdx],GB.d).gbP,isW:(GB.d.bricks||[]).some(CR_isW),n:GB.d.bricks.length,o,hid:(U.gbHid||[]).length})})()`))}
 await T.b.close()})();
