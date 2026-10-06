// ==== ART pART7 · hill grass on the physics ground (±0.05 m): ground cells that are not flat split as a quadtree until each leaf's two
// triangles (gndBuild's diagonal) are within 3 cm of tH at 25 sample points; leaves stop at ~3 m. River-bank cells keep their own step.
// (constants inline: the world is built before this module's top-level lines run; function declarations are hoisted)
function ART7_flat(x,z,w,h){const A=tH(x,z),Bv=tH(x,z+h),C=tH(x+w,z),D=tH(x+w,z+h);
  for(let i=1;i<6;i++)for(let j=1;j<6;j++){const u=i/6,v=j/6,l=u+v<=1?A+(C-A)*u+(Bv-A)*v:D+(Bv-D)*(1-u)+(C-D)*(1-v);if(Math.abs(tH(x+w*u,z+h*v)-l)>.03)return false}return true}
function ART7_quad(x,z,w,h,out){if(w/2<3||ART7_flat(x,z,w,h)){out.push([x,z,w,h]);return}const w2=w/2,h2=h/2;
  ART7_quad(x,z,w2,h2,out);ART7_quad(x+w2,z,w2,h2,out);ART7_quad(x,z+h2,w2,h2,out);ART7_quad(x+w2,z+h2,w2,h2,out)}
// river-bank cells keep one uniform n×n grid (gndVert snaps it to the banks): the step is verified on the cell's own triangles and grown to ≤ 3 cm (≥ 3 m)
function ART7_res(a,b,c,d){const L=b-a,W=d-c,nMax=Math.max(1,Math.ceil(L/3));let n=1;
  for(;;){const sx=L/n,sz=W/n;let ok=true;for(let i=0;i<n&&ok;i++)for(let j=0;j<n;j++)if(!ART7_flat(a+i*sx,c+j*sz,sx,sz)){ok=false;break}
    if(ok||n>=nMax)return n;n=Math.min(nMax,Math.ceil(n*1.5))}}
