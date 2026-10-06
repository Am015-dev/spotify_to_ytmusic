// ==== ART pART7 · hill grass on the physics ground (±0.05 m): ground cells that are not flat split as a quadtree until each leaf's two
// triangles (gndBuild's diagonal) are within 3 cm of tH at 25 sample points; leaves stop at ~3 m. River-bank cells keep their own step.
// (constants inline: the world is built before this module's top-level lines run; function declarations are hoisted)
function ART7_flat(x,z,w,h,tol){tol=tol||.03;const A=tH(x,z),Bv=tH(x,z+h),C=tH(x+w,z),D=tH(x+w,z+h);
  for(let i=1;i<6;i++)for(let j=1;j<6;j++){const u=i/6,v=j/6,l=u+v<=1?A+(C-A)*u+(Bv-A)*v:D+(Bv-D)*(1-u)+(C-D)*(1-v);if(Math.abs(tH(x+w*u,z+h*v)-l)>tol)return false}return true}
// pART8: the 3 cm fit is only needed where cars drive and the camera is close: cells ≤ 64 m that are more than 14 m from every road edge
// (city, filler, autobahn, trails, mountain and town roads) use an 8 cm fit with ≥ 16 m leaves (same look from the road, far fewer triangles)
function ART7_rd(x,z){try{let b=1e9;const q=cityAt(x,z);if(q)b=Math.min(b,q.d-q.road.w/2);const f=fillAt(x,z);if(f)b=Math.min(b,f.d-f.r.w/2);const a=abAt(x,z);if(a)b=Math.min(b,a.d-a.road.w/2);
  return Math.min(b,trailDist(x,z)-7,mtnDist(x,z)-12,lzRoadD(x,z))}catch(e){return 0}}
function ART7_far(x,z,w,h){if(w>64)return false;const r=Math.hypot(w,h)/2+14;for(const[u,v]of[[.5,.5],[0,0],[1,0],[0,1],[1,1]])if(ART7_rd(x+w*u,z+h*v)<r)return false;return true}
function ART7_quad(x,z,w,h,out){const far=ART7_far(x,z,w,h);if(w/2<(far?12:3)||ART7_flat(x,z,w,h,far?.08:.03)){out.push([x,z,w,h]);return}const w2=w/2,h2=h/2;
  ART7_quad(x,z,w2,h2,out);ART7_quad(x+w2,z,w2,h2,out);ART7_quad(x,z+h2,w2,h2,out);ART7_quad(x+w2,z+h2,w2,h2,out)}
// river-bank cells keep one uniform n×n grid (gndVert snaps it to the banks): the step is verified on the cell's own triangles and grown to ≤ 3 cm (≥ 3 m)
function ART7_res(a,b,c,d){const L=b-a,W=d-c,nMax=Math.max(1,Math.ceil(L/3));let n=1;
  for(;;){const sx=L/n,sz=W/n;let ok=true;for(let i=0;i<n&&ok;i++)for(let j=0;j<n;j++)if(!ART7_flat(a+i*sx,c+j*sz,sx,sz)){ok=false;break}
    if(ok||n>=nMax)return n;n=Math.min(nMax,Math.ceil(n*1.5))}}
