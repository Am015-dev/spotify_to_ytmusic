// ---------- geometry: all distances in millimetres, top-down; x right, y up; heading h in radians, forward = (cos h, sin h) ----------
const MAT=914, RANGE=100, TPL_W=20;
// template centreline geometry (see rules-notes [G1]-[G4]); the research sheet may refine these
var GEO={straight:40, bankR:[0,80,130,180], turnR:[0,35,62.5,90], bankA:Math.PI/4, turnA:Math.PI/2, small:40, large:80};
const V=(x,y)=>({x,y}),add=(a,b)=>V(a.x+b.x,a.y+b.y),sub=(a,b)=>V(a.x-b.x,a.y-b.y),mul=(a,k)=>V(a.x*k,a.y*k),dot=(a,b)=>a.x*b.x+a.y*b.y,len=a=>Math.hypot(a.x,a.y);
const fwd=h=>V(Math.cos(h),Math.sin(h)),leftOf=h=>V(-Math.sin(h),Math.cos(h));
const normA=a=>{while(a>Math.PI)a-=2*Math.PI;while(a<-Math.PI)a+=2*Math.PI;return a};
function baseSize(s){return s.base==='L'?GEO.large:GEO.small}
// the four corners of a base, counter-clockwise, starting front-left
function corners(p,B){const f=mul(fwd(p.h),B/2),l=mul(leftOf(p.h),B/2);return [add(add(p,f),l),sub(add(p,l),f),sub(sub(p,f),l),add(sub(p,l),f)]}
// ---- templates: a maneuver is {s:speed, t:'S'|'B'|'T'|'K'|'R'(barrel roll), d:-1 left, 1 right, 0 straight}
function tplLen(m){if(m.t==='S'||m.t==='K')return GEO.straight*m.s;const r=m.t==='B'?GEO.bankR[m.s]:GEO.turnR[m.s];return r*(m.t==='B'?GEO.bankA:GEO.turnA)}
// point and heading along the template centreline at distance u from its start (the ship's front edge)
function tplAt(p0,B,m,u){const F=add(p0,mul(fwd(p0.h),B/2));
  if(m.t==='S'||m.t==='K'){return {x:F.x+Math.cos(p0.h)*u,y:F.y+Math.sin(p0.h)*u,h:p0.h}}
  const r=m.t==='B'?GEO.bankR[m.s]:GEO.turnR[m.s],side=m.d<0?1:-1;// left turns rotate counter-clockwise
  const O=add(F,mul(leftOf(p0.h),r*side)),a=u/r*side,dx=F.x-O.x,dy=F.y-O.y,c=Math.cos(a),s=Math.sin(a);
  return {x:O.x+dx*c-dy*s,y:O.y+dx*s+dy*c,h:p0.h+a}}
// pose of the ship when its REAR edge centre is at path distance q (q=0: start pose, q=B+L: final pose)
function poseAt(p0,B,m,q){const L=tplLen(m);
  if(q<=B){const r=add(p0,mul(fwd(p0.h),q-B/2));return {x:r.x+Math.cos(p0.h)*B/2,y:r.y+Math.sin(p0.h)*B/2,h:p0.h}}
  const t=tplAt(p0,B,m,Math.min(L,q-B));return {x:t.x+Math.cos(t.h)*B/2,y:t.y+Math.sin(t.h)*B/2,h:t.h}}
function finalPose(p0,B,m){const e=poseAt(p0,B,m,B+tplLen(m));if(m.t==='K')e.h+=Math.PI;e.h=normA(e.h);return e}
// sampled template centreline (for obstacle checks and drawing)
function tplPoints(p0,B,m,step){step=step||4;const L=tplLen(m),out=[];for(let u=0;u<=L+1e-6;u+=step)out.push(tplAt(p0,B,m,Math.min(u,L)));return out}
// barrel roll: the speed-1 straight template against the side [G5][4.5]. Small base: the template's short end touches the side (centre moves 40+40 mm)
// and the ship may slide up to +-10 mm fore/aft; large base: the template's long edge touches the side (centre moves 80+20 mm), slide up to +-20 mm.
// off = fore/aft offset of the ship in mm (positive = forward)
function rollPose(p0,B,dir,off){const big=B>60,side=dir<0?1:-1,d=big?B+TPL_W:B+GEO.straight;const c=add(p0,mul(leftOf(p0.h),d*side));return {x:c.x+Math.cos(p0.h)*off,y:c.y+Math.sin(p0.h)*off,h:p0.h}}
function rollOffsets(B){const w=B>60?(B/2-GEO.straight/2):(B/2-TPL_W/2);return [w,w/2,0,-w/2,-w]}
// ---- polygons ----
function polyOverlap(A,Bp){for(const P of [A,Bp]){for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],n=V(a.y-b.y,b.x-a.x);let mnA=1e9,mxA=-1e9,mnB=1e9,mxB=-1e9;
  for(const q of A){const v=dot(q,n);mnA=Math.min(mnA,v);mxA=Math.max(mxA,v)}for(const q of Bp){const v=dot(q,n);mnB=Math.min(mnB,v);mxB=Math.max(mxB,v)}if(mxA<mnB-1e-6||mxB<mnA-1e-6)return false}}return true}
function inPoly(p,P){let c=false;for(let i=0,j=P.length-1;i<P.length;j=i++){const a=P[i],b=P[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)c=!c}return c}
function segDist(p,a,b){const ab=sub(b,a),t=Math.max(0,Math.min(1,dot(sub(p,a),ab)/(dot(ab,ab)||1)));return len(sub(p,add(a,mul(ab,t))))}
function polyPointDist(p,P){if(inPoly(p,P))return 0;let d=1e9;for(let i=0;i<P.length;i++)d=Math.min(d,segDist(p,P[i],P[(i+1)%P.length]));return d}
function segSeg(a,b,c,d){const o=(p,q,r)=>(q.x-p.x)*(r.y-p.y)-(q.y-p.y)*(r.x-p.x);const d1=o(c,d,a),d2=o(c,d,b),d3=o(a,b,c),d4=o(a,b,d);return (d1>0)!==(d2>0)&&(d3>0)!==(d4>0)}
function segHitsPoly(a,b,P){if(inPoly(a,P)||inPoly(b,P))return true;for(let i=0;i<P.length;i++)if(segSeg(a,b,P[i],P[(i+1)%P.length]))return true;return false}
function perimeter(P,step){const out=[];for(let i=0;i<P.length;i++){const a=P[i],b=P[(i+1)%P.length],n=Math.max(1,Math.ceil(len(sub(b,a))/step));for(let k=0;k<n;k++)out.push(add(a,mul(sub(b,a),k/n)))}return out}
// ---- arcs and range ----
// arc: 'F' front 90° (lines through the base centre and front corners), 'T' turret 360°, 'A' front + rear auxiliary
// 1st-edition arcs: the lines start just inside the front corners (2.95 mm small, 3.95 mm large) and open to 80.9° / 84.05° [R14]
function inArc(att,pt,arc,Ba){if(arc==='T')return true;Ba=Ba||40;const big=Ba>60,ins=big?3.95:2.95,half=(big?84.05:80.9)/2*Math.PI/180,t=Math.tan(half);
  const f=fwd(att.h),l=leftOf(att.h),d=sub(pt,att),x=dot(d,f),y=dot(d,l),h=Ba/2;
  const inF=x>=h-1e-6&&Math.abs(y)<=h-ins+(x-h)*t+1e-6;if(inF)return true;
  return arc==='A'&&(-x)>=h-1e-6&&Math.abs(y)<=h-ins+(-x-h)*t+1e-6}
// closest distance from attacker base to the part of the defender base inside the arc; returns {d, p (on defender), q (on attacker)} or null
function arcReach(att,Ba,def,Bd,arc){const PA=corners(att,Ba),pts=perimeter(corners(def,Bd),3).concat([V(def.x,def.y)]);let best=null;
  for(const p of pts){if(!inArc(att,p,arc,Ba))continue;let d=1e9,q=null;for(let i=0;i<4;i++){const a=PA[i],b=PA[(i+1)%4],ab=sub(b,a),t=Math.max(0,Math.min(1,dot(sub(p,a),ab)/dot(ab,ab))),c=add(a,mul(ab,t)),dd=len(sub(p,c));if(dd<d){d=dd;q=c}}
    if(!best||d<best.d)best={d,p,q}}
  // an arc that only catches the defender between two sample points: also test the arc edge rays
  return best}
function baseDist(a,Ba,b,Bb){const A=corners(a,Ba),Bq=corners(b,Bb);if(polyOverlap(A,Bq))return 0;let d=1e9;for(const p of A)d=Math.min(d,polyPointDist(p,Bq));for(const p of Bq)d=Math.min(d,polyPointDist(p,A));return d}
const rangeOf=d=>d<=RANGE?1:d<=2*RANGE?2:d<=3*RANGE?3:4;
function offBoard(p,B){return corners(p,B).some(c=>c.x<0||c.y<0||c.x>MAT||c.y>MAT)}
// ---- obstacles: convex-ish rock polygons ----
function rockPoly(o){const out=[];for(let i=0;i<o.n;i++){const a=o.rot+i/o.n*2*Math.PI;out.push(V(o.x+Math.cos(a)*o.r*o.k[i],o.y+Math.sin(a)*o.r*o.k[i]))}return out}
