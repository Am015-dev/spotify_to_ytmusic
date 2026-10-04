// in-page key bot for tOG.js: drives a polyline with the real key state (__mho.K arrows / KeyX drift / Shift boost) + roamSim
module.exports=`window.__ogDrive=(P,vt,o={})=>{const M=__mho,R=M.RO,K=M.K;const cum=[0];for(let k=1;k<P.length;k++)cum.push(cum[k-1]+Math.hypot(P[k][0]-P[k-1][0],P[k][1]-P[k-1][1]));
 let i=0,t=0;const maxT=(o.maxT||40)*60;for(t=0;t<maxT;t++){let bj=i,bd=1e9;for(let k=i;k<Math.min(P.length,i+40);k++){const d=Math.hypot(P[k][0]-R.x,P[k][1]-R.z);if(d<bd){bd=d;bj=k}}i=bj;
  let k=i;while(k<P.length-1&&cum[k]-cum[i]<9+Math.abs(R.v)*.35)k++;let tx=P[k][0],tz=P[k][1];if(k===P.length-1&&i>=P.length-2){const a=P[P.length-2],b=P[P.length-1];tx=b[0]+(b[0]-a[0])*3;tz=b[1]+(b[1]-a[1])*3}
  let a=Math.atan2(tx-R.x,tz-R.z)-R.h;a=Math.atan2(Math.sin(a),Math.cos(a));let v=o.drift&&t>=(o.dlim||99)*60?8:vt;if(o.slowTurn)v=vt*Math.max(.45,1-Math.abs(a)*.9);
  if(o.drift&&t<(o.dlim||99)*60){const ph=Math.floor(t/(o.dp||70))%2;K.KeyX=(t%(o.dc||1))===0||o.dc==null;K.ArrowLeft=ph===0;K.ArrowRight=ph===1}else{K.ArrowLeft=a>.035;K.ArrowRight=a<-.035}
  K.ArrowUp=R.v<v;K.ArrowDown=R.v>v+5;K.ShiftLeft=!!o.boost&&R.y>M.gnd(R.x,R.z,R.y+.3)+.5;M.roamSim(1);if(o.until&&o.until())break;if(!o.until&&i>=P.length-2)break}
 K.ArrowLeft=K.ArrowRight=K.ArrowUp=K.ArrowDown=K.KeyX=K.ShiftLeft=false;return{t:+(t/60).toFixed(1),i,n:P.length}};
window.__ogRun=(id,vt,o={})=>{const A=__og.appr(id,o.back||45);if(!A)return{err:'appr'};const M=__mho,R=M.RO,P=A.P;M.warp(P[0][0],P[0][1],Math.atan2(P[1][0]-P[0][0],P[1][1]-P[0][1]));M.roamSim(2);__og.tick();
 __ogDrive(P,o.v0||Math.min(vt,22),{maxT:12,until:()=>!!__og.OG.ev});const ev=__og.OG.ev;if(!ev)return{err:'nostart',at:[R.x,R.z]};if(ev.sp.id!==id){__og.end();return{err:'other',got:ev.sp.id}}
 const E=__og.ev(),P2=E.P,started=E.t;let r;if(E.t==='drift'){r=__ogDrive(P2.concat(P2.slice().reverse()),vt,{maxT:30,drift:1,dp:o.dp||70,dc:o.dc,dlim:o.dlim,until:()=>!__og.OG.ev})}
 else r=__ogDrive(P2,vt,{maxT:70,until:()=>!__og.OG.ev,boost:o.boost,slowTurn:o.slowTurn});if(__og.OG.ev){const t0=__og.OG.ev.tm;M.K.ArrowUp=false;for(let q=0;q<60*40&&__og.OG.ev;q++)M.roamSim(1)}
 const L=__og.OG.lastRes;return{type:started,len:Math.round(E.len),goal:E.goal,md:L&&L.md,v:L&&L.v!=null?+L.v.toFixed(1):null,pay:L&&L.pay,drive:r}};`;
