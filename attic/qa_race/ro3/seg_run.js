(()=>{const RR=__dbg.composer.render;__dbg.composer.render=()=>{};try{if(!window.__ctlW){window.__ctlW=1;const f=ctlPlayer;ctlPlayer=function(){const c=f.apply(this,arguments);if(window.__ctlO)Object.assign(c,window.__ctlO(c));return c}}
 const res=[];for(const r of OPN.routes)for(const alt of[false,true]){for(const s of ships)if(s!==pl){s.dist=pl.dist-2500;s.v=0}
  pl.dist=r.s0-120;pl.x=0;pl.yaw=pl.beta=pl.yawRate=0;pl.v=pl.stats.top0*.9;pl.air=null;pl.dead=0;pl.bm=0;
  window.__ctlO=c=>{const tx=alt&&pl.dist>r.s0-90?OPN_lane(r):0;return{thr:1,brk:0,boost:0,steer:clamp((tx-pl.x)*.06-(pl.yaw-pl.beta*0)*1.2,-1,1)}};
  const t0=raceT;let n=0,vs=0;while(pl.dist<r.s1+80&&n<4000){__tick(1);n++;vs+=pl.v}
  res.push({r:r.kind+r.id,alt,sec:+(raceT-t0).toFixed(2),avgKmh:Math.round(vs/n*3.6),ter:pl.terrain})}
 window.__ctlO=null;return res}finally{__dbg.composer.render=RR}})()
