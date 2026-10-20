(()=>{const out=[],SP=[],KB=[];let tot={km:0,steps:0,blk:0,kerb:0,narrow:0,n:0};
for(const S of CITY_S){const r=S.r,w=r.w,P=S.pts;let prev=null,pp=null,st=0,mx=0,blk=0,kb=0,kmax=0,n=0,worst=null,blkAt=null;
 for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],dx=b.x-a.x,dz=b.z-a.z,L=Math.hypot(dx,dz);if(L<.1)continue;const ux=dx/L,uz=dz/L;
  for(let s=0;s<L;s+=2){const x=a.x+ux*s,z=a.z+uz*s,g=groundAt(x,z,prev!=null?prev+1.5:99);n++;
   if(prev!=null&&pp!=null){const d=Math.abs(prev-(pp+g)/2);if(d>.08){st++;SP.push([+d.toFixed(2),Math.round(x-ux*2),Math.round(z-uz*2),r.name,r.cls,w]);if(d>mx){mx=d;worst=[Math.round(x-ux*2),Math.round(z-uz*2)]}}}pp=prev;prev=g;
   const o=Math.max(1,w/2-1),gl=groundAt(x-uz*o,z+ux*o,g+1.5),gr=groundAt(x+uz*o,z-ux*o,g+1.5),k=Math.max(Math.abs(gl-g),Math.abs(gr-g));if(k>.25){kb++;KB.push([+k.toFixed(2),Math.round(x),Math.round(z),r.name,w]);kmax=Math.max(kmax,k)}
   for(const c of[0,-w/4,w/4]){if(roamHit(x-uz*c,z+ux*c,1.0,g+.5)){blk++;if(!blkAt)blkAt=[Math.round(x-uz*c),Math.round(z+ux*c)];break}}}}
 const km=S.L/1000;tot.km+=km;tot.steps+=st;tot.blk+=blk;tot.kerb+=kb;tot.n+=n;if(w<7)tot.narrow+=km;
 out.push({id:r.id,name:r.name,cls:r.cls,w,one:r.one?1:0,L:Math.round(S.L),st,mx:+mx.toFixed(2),worst,blk,blkAt,kb,kmax:+kmax.toFixed(2),x:Math.round(P[0].x),z:Math.round(P[0].z),n,inb:(P[0].x>WX0&&P[0].x<WX1&&P[0].z>WZS&&P[0].z<WZN)?1:0})}
tot.bounds=[WX0,WX1,WZS,WZN];tot.grid=HUB.grid?HUB.grid.size:-1;tot.km=+tot.km.toFixed(1);SP.sort((a,b)=>b[0]-a[0]);KB.sort((a,b)=>b[0]-a[0]);return JSON.stringify({tot,segs:out,SP:SP.slice(0,60),KB:KB.slice(0,60),spH:[.08,.2,.5,1,2].map(t=>SP.filter(v=>v[0]>t).length)})})()
