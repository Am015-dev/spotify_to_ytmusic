// autopilot: follow the node chain from the node nearest (X,Z) in direction H; __APstep() steers R.h toward 12 m ahead
window.__APinit=(X,Z,H,n)=>{const N=__mho.HUB.nodes;let bi=-1,bd=1e9;N.forEach((a,i)=>{if(!a||!a.nb)return;const d=Math.hypot(a.x-X,a.z-Z);if(d<bd){bd=d;bi=i}});
 let c=bi,p=-1;const pts=[[N[c].x,N[c].z]];let hx=Math.sin(H),hz=Math.cos(H);
 for(let k=0;k<n;k++){const a=N[c];let best=null,bs=-2;for(const j of a.nb){if(j===p||!N[j])continue;const b=N[j],L=Math.hypot(b.x-a.x,b.z-a.z)||1,s=((b.x-a.x)*hx+(b.z-a.z)*hz)/L;if(s>bs){bs=s;best=j}}if(best==null||bs<.5)break;const b=N[best];hx=(b.x-a.x)/Math.hypot(b.x-a.x,b.z-a.z);hz=(b.z-a.z)/Math.hypot(b.x-a.x,b.z-a.z);p=c;c=best;pts.push([b.x,b.z])}
 window.__AP=pts;const L=pts.reduce((s,q,i)=>i?s+Math.hypot(q[0]-pts[i-1][0],q[1]-pts[i-1][1]):0,0);return {n:pts.length,L:Math.round(L),p0:pts[0],h:Math.atan2(pts[1][0]-pts[0][0],pts[1][1]-pts[0][1])}};
window.__APstep=()=>{const R=__mho.RO,P=window.__AP;if(!P)return;let bi=0,bd=1e9;P.forEach((q,i)=>{const d=Math.hypot(q[0]-R.x,q[1]-R.z);if(d<bd){bd=d;bi=i}});
 // lookahead point 14 m along the polyline
 let rem=14,i=bi,x=P[i][0],z=P[i][1];while(i<P.length-1&&rem>0){const dx=P[i+1][0]-x,dz=P[i+1][1]-z,L=Math.hypot(dx,dz);if(L>=rem){x+=dx/L*rem;z+=dz/L*rem;rem=0}else{rem-=L;i++;x=P[i][0];z=P[i][1]}}
 R.h=Math.atan2(x-R.x,z-R.z);return bd};
1
