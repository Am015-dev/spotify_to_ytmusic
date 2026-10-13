// start of each built-in track via its 📍 GO, real keyboard gas (ArrowUp) for 3 s: heading vs velocity + one shot each
const L=require('./lib.js');(async()=>{const {b,p,E}=await L.launch();
 for(const id of ['bx-t-cliff','bx-t-city','bx-t-canyon']){await p.evaluate(i=>__chk.go('bxT/'+i),id);await L.sleep(1200);
  const s0=await p.evaluate(()=>__bx.st());await p.keyboard.down('ArrowUp');await L.sleep(3000);
  const s=await p.evaluate(()=>{const V=__bx.BX.v,c=__bx.BX.cam,car=__bx.BX.car;const e=car.matrixWorld.elements,fw={dot:F=>e[8]*F.x+e[9]*F.y+e[10]*F.z};return{F:V.F.toArray().map(x=>+x.toFixed(2)),vF:+V.v.dot(V.F).toFixed(1),camBehind:+(c.position.clone().sub(V.p).dot(V.F)).toFixed(1),carFwdDotF:+fw.dot(V.F).toFixed(2)}});
  await L.shot(p,`qa_bx/start_${id}.png`);await p.keyboard.up('ArrowUp');console.log(id,'p0',JSON.stringify(s0.v.p),JSON.stringify(s))}
 console.log('errors',E.length);await b.close()})();
