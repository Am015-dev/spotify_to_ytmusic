# pQA1 · collision hulls match the visuals: a box grown by the car's radius has ROUND corners (true box+circle distance).
# Before: the box was grown into a bigger square, so a building corner reached up to 0.41×radius further out diagonally
# (≈0.5 m with the 1.15 m car circles) — an invisible corner that ate slight turns at intersections.
exec(open('P.py').read())
R("function bHit(b,x,z,rad){const dx=x-b.x,dz=z-b.z;if(b.c==null)return Math.abs(dx)<b.hw+rad&&Math.abs(dz)<b.hd+rad;const lx=dx*b.c-dz*b.s,lz=dx*b.s+dz*b.c;return Math.abs(lx)<b.hw+rad&&Math.abs(lz)<b.hd+rad}",
  "function bHit(b,x,z,rad){const dx=x-b.x,dz=z-b.z;let lx=dx,lz=dz;if(b.c!=null){lx=dx*b.c-dz*b.s;lz=dx*b.s+dz*b.c}const ex=Math.abs(lx)-b.hw,ez=Math.abs(lz)-b.hd;if(ex>=rad||ez>=rad)return false;if(ex<=0||ez<=0)return true;return ex*ex+ez*ez<rad*rad}")
save()
