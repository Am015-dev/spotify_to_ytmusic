(()=>{const edge=(x,z)=>{let e=1e9;const q=cityAt(x,z);if(q)e=q.d-q.S.r.w/2;try{const f=fillAt(x,z);if(f)e=Math.min(e,f.d-f.r.w/2)}catch(_){}return e};
 const T=['bush','tree','tree2','tree3','rock','bench','bin','planter','dumpster','crate','stall','table','parasol','fence','container','hydrant','post','sign','lamp','stop'];const on={},ex={};
 for(const p of HUB.props||[]){if(p.alive===false||!T.includes(p.t))continue;const e=edge(p.x,p.z);if(e<-1.2){on[p.t]=(on[p.t]||0)+1;(ex[p.t]=ex[p.t]||[]).length<5&&ex[p.t].push([Math.round(p.x),Math.round(p.z),+e.toFixed(1)])}}
 return{on,ex}})()
