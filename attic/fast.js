// Fast test mode for local_dbg.html pages: skip WebGL drawing except when a screenshot is taken.
// Measured: free roam 0.08 fps -> 1.08 fps under load (13x); ~55 fps on an idle machine with drawing skipped.
// usage: const F=require('../fast.js'); await F.on(p); ... await F.shot(p,'shots/x.png'); ... await F.off(p)
module.exports={
 on:p=>p.evaluate(()=>{if(!window.__dbg||window.__fastR)return;window.__fastR=__dbg.composer.render;__dbg.composer.render=()=>{}}),
 off:p=>p.evaluate(()=>{if(window.__fastR){__dbg.composer.render=window.__fastR;window.__fastR=null}}),
 shot:async(p,path,o={})=>{const was=await p.evaluate(()=>!!window.__fastR);if(was)await module.exports.off(p);
  await p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));await p.screenshot({path,timeout:600000,...o});if(was)await module.exports.on(p)}
};
