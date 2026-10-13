// perf + tyre gap: real render on, hold GAS 6 s, then time 240 rendered frames (gas held, boost held for the 2nd half on the new build)
module.exports=({p,tick,down,up,center,res})=>{global.SCEN=async()=>{const g=await center('#tG');await down('gas',g);await tick(360);
 await p.evaluate(()=>{window.__shooting=1;if(window.__fastR){__dbg.composer.render=window.__fastR;window.__fastR=null}});
 const ms=[];for(let k=0;k<4;k++){if(k===2){const b=await center('#tN');await down('boost',b)}ms.push(await p.evaluate(()=>{const t=performance.now();__tick(60);return (performance.now()-t)/60}))}
 await up('boost');await up('gas');await tick(120);res.msPerFrame=ms.map(v=>+v.toFixed(1));res.gap=await p.evaluate(()=>{try{return __gnb.gap()}catch(e){return String(e)}});
 res.gapCar=await p.evaluate(()=>{const T=__dbg.THREE,m=__mho.pl.mesh,R=__mho.RO;m.updateMatrixWorld(true);const B=new T.Box3();m.traverseVisible(o=>{if(o.isMesh&&o.geometry&&!(o.material&&o.material.transparent)){if(!o.geometry.boundingBox)o.geometry.computeBoundingBox();B.union(o.geometry.boundingBox.clone().applyMatrix4(o.matrixWorld))}});return +(B.min.y-__mho.gnd(R.x,R.z,R.y+.3)).toFixed(3)})}};
