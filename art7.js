// ==== ART pART7 · hill grass on the physics ground (±0.05 m): ground cells that are not flat split as a quadtree until each leaf's two
// triangles (gndBuild's diagonal) are within 3 cm of tH at 25 sample points; leaves stop at ~3 m. River-bank cells keep their own step.
// (constants inline: the world is built before this module's top-level lines run; function declarations are hoisted)
function ART7_flat(x,z,w,h,tol,dn){tol=tol||.03;dn=dn||tol;const A=tH(x,z),Bv=tH(x,z+h),C=tH(x+w,z),D=tH(x+w,z+h);
  for(let i=1;i<6;i++)for(let j=1;j<6;j++){const u=i/6,v=j/6,l=u+v<=1?A+(C-A)*u+(Bv-A)*v:D+(Bv-D)*(1-u)+(C-D)*(1-v);const e=l-tH(x+w*u,z+h*v);if(e>tol||-e>dn)return false}return true}
// pART8: the 3 cm fit is only needed where cars drive and the camera is close: cells ≤ 64 m whose every point is more than 8 m from every road edge
// (city, filler, autobahn, trails, mountain and town roads) use a 6 cm fit with ≥ 8 m leaves (same look from the road, far fewer triangles)
function ART7_rd(x,z){try{let b=1e9;const q=cityAt(x,z);if(q)b=Math.min(b,q.d-q.road.w/2);const f=fillAt(x,z);if(f)b=Math.min(b,f.d-f.r.w/2);const a=abAt(x,z);if(a)b=Math.min(b,a.d-a.road.w/2);
  return Math.min(b,trailDist(x,z)-7,mtnDist(x,z)-12,lzRoadD(x,z))}catch(e){return 0}}
function ART7_far(x,z,w,h){if(w>64||ART7_rd(x+w/2,z+h/2)<=Math.hypot(w,h)/2+4)return false;for(let i=0;i<=4;i++)for(let j=0;j<=4;j++)if(ART7_rd(x+w*i/4,z+h*j/4)<10)return false;return true}
function ART7_quad(x,z,w,h,out){const far=ART7_far(x,z,w,h);if(w/2<(far?12:4)||(far?ART7_flat(x,z,w,h,.2):ART7_flat(x,z,w,h,.025,.08))){out.push([x,z,w,h]);return}const w2=w/2,h2=h/2;
  ART7_quad(x,z,w2,h2,out);ART7_quad(x+w2,z,w2,h2,out);ART7_quad(x,z+h2,w2,h2,out);ART7_quad(x+w2,z+h2,w2,h2,out)}
// river-bank cells keep one uniform n×n grid (gndVert snaps it to the banks): the step is verified on the cell's own land triangles (pART8: water and
// bank sub-cells skipped; they used to force the 3 m maximum over every 200 m river cell) and grown to the road/far fit (≥ 3 m)
function ART7_res(a,b,c,d){const L=b-a,W=d-c,nMax=Math.max(1,Math.ceil(L/3));let n=1;
  for(;;){const sx=L/n,sz=W/n;let ok=true;for(let i=0;i<n&&ok;i++)for(let j=0;j<n;j++){const x=a+i*sx,z=c+j*sz,r=Math.hypot(sx,sz)/2;if(rivClear(x+sx/2,z+sz/2)<r+2)continue;const far=ART7_far(x,z,sx,sz);if(!ART7_flat(x,z,sx,sz,far?.2:.025,far?.2:.05)){ok=false;break}}
    if(ok||n>=nMax)return n;n=Math.min(nMax,Math.ceil(n*1.5))}}
