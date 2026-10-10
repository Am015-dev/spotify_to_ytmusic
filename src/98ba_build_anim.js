// ===== BA (garage-17 task B, Alex 2026-10-10: "when opening the vehicle in the garage, a x20 build, so it looks like it's being built").
// When a ride first shows in the garage (garage opened, or another ride / form picked in RIDES), its parts drop in in build order:
// the guide's step order (SB_steps: booklet steps where a template has them, else bottom layer first, then z, then x), in batches so the whole build
// takes 1.5–3 s whatever the part count. Each batch falls from ~3 studs up with a small overshoot snap; light brick ticks. Tap/drag the view to skip.
// Drawn only on top of the normal garage mesh (hidden meanwhile); nothing is edited or saved. Not in BUILD, the guide, or the showroom.
const BA={on:0,G:[],hid:[],t:0,T:2,t0:0,last:'',tick:0};
const BA_DROP=1.8,BA_FALL=.26;
function BA_stop(){if(!BA.on&&!BA.G.length)return;BA.on=0;for(const d of BA.G){d.g.parent&&d.g.parent.remove(d.g);d.g.traverse(o=>{if(o.isMesh&&!o.userData.gbc)o.geometry.dispose()})}BA.G=[];for(const o of BA.hid)o.visible=true;BA.hid=[]}
// what the garage shows right now: the street car's bricks, or the off-road / water form (its group in gbV is the visible one)
function BA_now(){const U=GB.mesh&&GB.mesh.userData;if(!U)return null;const S=GAR_set();let fm=null;for(const k in U.gbV||{})if(U.gbV[k].visible)fm=k;
 if(fm){const f=fm==='4x4'?'off':'boat',T=GAR_frm(f),B=GAR_apply(GAR_arr(T[f]()),GAR_ups(S.id),f);return{key:T.id+'|'+f+'|'+B.length,B,tpl:T[f](),fig:null,hide:[U.gbV[fm]]}}
 const t=gbTeam(TEAMS[teamIdx],GB.d),B=(t&&t.gbB)||[];return{key:S.id+'|car|'+B.length,B,tpl:S.car?S.car():null,fig:GB_figGet(),hide:(U.gbM||[]).slice()}}
function BA_start(){BA_stop();if(!GB.mesh||$('#gbx').hidden||GB_.bk||(typeof SB!=='undefined'&&SB.on))return 0;const N=BA_now();if(!N||N.B.length<2)return 0;BA.last=N.key;
 let order;try{order=SB_steps(N.B,N.tpl).flat()}catch(e){order=N.B.map((b,i)=>i).sort((i,j)=>N.B[i].y-N.B[j].y||N.B[i].z-N.B[j].z||N.B[i].x-N.B[j].x)}
 const n=order.length,nb=Math.min(n,32),T=clamp(n*.05,1.5,3),host=GB.mesh.userData.carG||GB.mesh.userData.m;
 for(let k=0;k<nb;k++){const ids=order.slice(Math.floor(k*n/nb),Math.floor((k+1)*n/nb)),g=new THREE.Group();g.userData.m=g;
  GB_attach(g,ids.map(i=>N.B[i]),k===nb-1?N.fig:null,false,false);g.visible=false;host.add(g);BA.G.push({g,s:k/(nb-1||1)*(T-BA_FALL),p:0})}
 for(const o of N.hide)if(o.visible){o.visible=false;BA.hid.push(o)}
 Object.assign(BA,{on:1,t:0,T,t0:performance.now(),tick:0});try{GB.r.shadowMap.needsUpdate=true}catch(e){}return 1}
function BA_step(){if(!BA.on)return;if($('#gbx').hidden||GB_.bk){BA_stop();return}const now=performance.now(),dt=Math.min(.1,(now-BA.t0)/1000);BA.t0=now;BA.t+=dt;
 let land=0;for(const d of BA.G){const u=(BA.t-d.s)/BA_FALL;if(u<0)continue;d.g.visible=true;const k=Math.min(1,u);
  // ease-out with a small overshoot below the rest height, then snap (the "click" of a brick)
  d.g.position.y=k<1?BA_DROP*Math.pow(1-k,3)-.05*Math.sin(Math.PI*k)*k:0;if(k>=1&&d.p<1)land++;d.p=k}
 if(land){try{GB.r.shadowMap.needsUpdate=true}catch(e){}if(++BA.tick%3===1)try{AU.sfx('brick')}catch(e){}}
 if(BA.t>=BA.T+.05)BA_stop()}
// a new ride shows → build it up; the same ride re-rendered (paint, leaving BUILD, upgrades) → no replay
// (a re-render in the middle of the build-up, e.g. the panel refreshing after a pick, carries on from where it was)
gbRender=(f=>function(){const was=BA.on?BA.t:-1,pk=BA.last;BA_stop();const r=f.apply(this,arguments);try{const N=!GB_.bk&&BA_now();if(N&&(N.key!==BA.last||was>=0)){if(BA_start()&&N.key===pk&&was>=0)BA.t=was}}catch(e){console.warn('BA',e)}return r})(gbRender);
gbOpen=(f=>function(){BA.last='';return f.apply(this,arguments)})(gbOpen);
gbLoop=(f=>function(){try{BA_step()}catch(e){BA_stop()}return f.apply(this,arguments)})(gbLoop);
GB_enter=(f=>function(){BA_stop();return f.apply(this,arguments)})(GB_enter);
SB_open=(f=>function(){BA_stop();return f.apply(this,arguments)})(SB_open);
// tap or drag the garage view to skip
{const c=$('#gbC');if(c)c.addEventListener('pointerdown',()=>{if(BA.on)BA_stop()},true)}
window.__ba={st:()=>({on:BA.on,t:+BA.t.toFixed(2),T:BA.T,n:BA.G.length,shown:BA.G.filter(d=>d.g.visible).length,last:BA.last}),start:BA_start,stop:BA_stop};
