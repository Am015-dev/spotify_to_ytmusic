// ---------- tile geometry: every tile is drawn from its feature data (no pictures). Units 0..100, north at y=0. ----------
// Local segment order (shared with the engine): towns, roads, fields, then the priory.
function tileSegs(t){const d=TT[t],o=[];
  for(const c of d.C)o.push({ty:'C',e:c.e,p:c.p||0,g:c.g||null,cat:c.cat||0});
  for(const r of d.R)o.push({ty:'R',e:r.e,inn:r.inn||0});
  for(const f of d.F)o.push({ty:'F',h:f.h,ac:f.ac.slice(),inner:f.in||0});
  if(d.mon)o.push({ty:'M'});return o}
const GEO={};
const GRID=50;// raster cells per side (2 units each)
function rotP(p,k){let x=p[0],y=p[1];for(let i=0;i<((k%4)+4)%4;i++){const nx=100-y,ny=x;x=nx;y=ny}return [x,y]}
function quad(a,c,b,n){const o=[];n=n||14;for(let i=0;i<=n;i++){const t=i/n,u=1-t;o.push([u*u*a[0]+2*u*t*c[0]+t*t*b[0],u*u*a[1]+2*u*t*c[1]+t*t*b[1]])}return o}
const MID=[[50,0],[100,50],[50,100],[0,50]];
// shapes for a town segment, by which sides it covers
function townShape(sides,ctx){const s=sides.slice().sort();const n=s.length;let poly,wall,k=0;
  if(n===4){poly=[[0,0],[100,0],[100,100],[0,100]];wall=[]}
  else if(n===1){k=s[0];const d=ctx.capD;wall=quad([100,0],[50,2*d],[0,0]);poly=[[0,0]].concat(wall)}
  else if(n===3){const m=[0,1,2,3].find(x=>!s.includes(x));k=(m+2)%4;const d=ctx.c3D;wall=quad([100,100],[50,100-2*d],[0,100]);poly=[[0,0],[100,0]].concat(wall)}
  else if((s[1]-s[0])===2){k=s[0]===1?0:1;// canonical W–E band
    const t=ctx.bandT,b=ctx.bandB;const top=quad([0,0],[50,2*t],[100,0]),bot=quad([100,100],[50,100-2*(100-b)],[0,100]);poly=top.concat(bot);wall=[top,bot]}
  else{// adjacent pair: canonical N+W (sides 0,3); rotate so that {k,k+3}
    k=[0,1,2,3].find(q=>s.includes(q)&&s.includes((q+3)%4));const c=ctx.cornerC;wall=quad([0,100],[c,c],[100,0]);poly=[[100,0],[0,0]].concat(wall)}
  const R=pts=>pts.map(p=>rotP(p,k));const walls=(Array.isArray(wall[0])&&Array.isArray(wall[0][0]))?wall.map(R):[R(wall)];return {poly:R(poly),walls:walls.filter(w=>w.length)}}
// ---------- raster helpers (pure JS so the node tests use the same shapes as the page) ----------
function inPoly(x,y,poly){let c=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if(((a[1]>y)!==(b[1]>y))&&(x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]))c=!c}return c}
function dSeg(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1];const L=dx*dx+dy*dy;let t=L?((x-a[0])*dx+(y-a[1])*dy)/L:0;t=Math.max(0,Math.min(1,t));const px=a[0]+t*dx-x,py=a[1]+t*dy-y;return Math.sqrt(px*px+py*py)}
function dLine(x,y,pts){let m=1e9;for(let i=1;i<pts.length;i++)m=Math.min(m,dSeg(x,y,pts[i-1],pts[i]));return m}
function lineLen(pts){let L=0;for(let i=1;i<pts.length;i++)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);return L}
function along(pts,f){const L=lineLen(pts)*f;let acc=0;for(let i=1;i<pts.length;i++){const l=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);if(acc+l>=L){const t=l?(L-acc)/l:0;return [pts[i-1][0]+(pts[i][0]-pts[i-1][0])*t,pts[i-1][1]+(pts[i][1]-pts[i-1][1])*t]}acc+=l}return pts[pts.length-1].slice()}
// per-tile tweaks where the drawing needs an extra hedge or wall to split fields the way the tile does
const GEO_FIX={
  IC_CRCR:{hub:true,hedges:[[[50,22],[50,78]]]},
  IC_Cx:{hedges:[[[64,18],[100,100]]]},
  TB_CcRRx_c:{hedges:[[[47,47],[100,100]]]},
  TB_CcRx_w:{hedges:[[[36,59],[100,100]]]},
  TB_RCcx_g:{hedges:[[[59,36],[100,100]]]},
  TB_CcCc_w:{cornerC:[38,38]},
  TB_CCc_c:{bandB:64},TB_CCc_w:{bandB:64},
};
const EDGE_HALF=[[25,1],[75,1],[99,25],[99,75],[75,99],[25,99],[1,75],[1,25]];
function buildGeo(t){if(GEO[t])return GEO[t];const d=TT[t],segs=tileSegs(t),fix=GEO_FIX[d.id]||{};
  const nC=d.C.length,nR=d.R.length,nF=d.F.length;const ctx={capD:nC>1?24:26,c3D:30,bandT:32,bandB:68,cornerC:45};if(fix.bandB)ctx.bandB=fix.bandB;
  const g={towns:[],roads:[],rivers:[],ponds:[],hubs:[],hedges:(fix.hedges||[]).map(h=>h.map(p=>p.slice())),mon:null,inns:[],spots:[],deco:{}};
  d.C.forEach((c,i)=>{const cc=Object.assign({},ctx);if(fix.cornerC)cc.cornerC=fix.cornerC[i]!=null?fix.cornerC[i]:ctx.cornerC;const sh=townShape(c.e,cc);g.towns.push({seg:i,poly:sh.poly,walls:sh.walls})});
  // rivers
  for(const v of d.V){if(v.length===2){const [a,b]=v;const A=MID[a],B=MID[b];g.rivers.push((a+2)%4===b?[A,B]:quad(A,[50+(A[0]+B[0]-100)*.1,50+(A[1]+B[1]-100)*.1],B,16))}
    else{const A=MID[v[0]];g.rivers.push([A,[50,50]]);g.ponds.push({x:50,y:50,r:d.spring?12:17,kind:d.spring?'spring':'lake'})}}
  const riverThroughCentre=d.V.some(v=>v.length===2);
  if(d.mon){let m=[50,50];if(riverThroughCentre){const v=d.V[0];const free=[0,1,2,3].filter(s=>!v.includes(s)&&d.e[s]==='F');const s=free.length?free[0]:0;m=[50+(MID[s][0]-50)*.5,50+(MID[s][1]-50)*.5]}g.mon={x:m[0],y:m[1],r:13}}
  const ends=d.R.filter(r=>r.e.length===1).length;const hasTown=nC>0;
  const hubNeeded=fix.hub||(!d.mon&&(ends>=3||(ends>=1&&!hasTown)));if(hubNeeded)g.hubs.push({x:50,y:50,r:ends>=3?9:8});
  const inTown=(x,y)=>g.towns.some(T=>inPoly(x,y,T.poly));
  d.R.forEach((r,j)=>{const seg=nC+j;let pts;
    if(r.e.length===2){const [a,b]=r.e;const A=MID[a],B=MID[b];pts=(a+2)%4===b?[A,B]:quad(A,[50+(A[0]+B[0]-100)*.1,50+(A[1]+B[1]-100)*.1],B,16)}
    else{const A=MID[r.e[0]];
      if(g.mon)pts=[A,[g.mon.x+(A[0]-g.mon.x)*.25,g.mon.y+(A[1]-g.mon.y)*.25]];
      else if(hubNeeded)pts=[A,[50,50]];
      else{// walk toward the centre until a town wall is met; else bend to the nearest wall
        let aim=[50,50];if(ends>=2&&g.towns.length){const T=g.towns[0].poly;let cx=0,cy=0;for(const p of T){cx+=p[0];cy+=p[1]}cx=cx/T.length-50;cy=cy/T.length-50;const dx=50-A[0],dy=50-A[1],L=Math.hypot(dx,dy);const ux=dx/L,uy=dy/L;const dot=cx*ux+cy*uy;let px=cx-dot*ux,py=cy-dot*uy;const pl=Math.hypot(px,py)||1;aim=[50+px/pl*12,50+py/pl*12]}
        let hit=null;for(let f=0;f<=1.001;f+=.02){const x=A[0]+(aim[0]-A[0])*f,y=A[1]+(aim[1]-A[1])*f;if(inTown(x,y)){hit=[x,y];break}}
        if(hit){const f2=[A[0]+(hit[0]-A[0])*1.04,A[1]+(hit[1]-A[1])*1.04];pts=[A,f2]}
        else{let best=null,bd=1e9;for(const T of g.towns)for(const w of T.walls)for(const p of w){const dd=Math.hypot(p[0]-50,p[1]-50);if(dd<bd){bd=dd;best=p}}
          const tgt=[best[0]+(50-best[0])*-.06,best[1]+(50-best[1])*-.06];pts=quad(A,[A[0]+(50-A[0])*.6,A[1]+(50-A[1])*.6],tgt,16)}}}
    g.roads.push({seg,pts,inn:r.inn||0})});
  // ---- raster: label every cell, flood the fields, map them to the tile's field segments ----
  const N=GRID,lab=new Int16Array(N*N).fill(-1);// -1 field-able; >=0 town seg; -2 road; -3 river; -4 hub/priory/hedge
  for(let j=0;j<N;j++)for(let i=0;i<N;i++){const x=(i+.5)*100/N,y=(j+.5)*100/N;let L=-1;
    for(const T of g.towns)if(inPoly(x,y,T.poly))L=T.seg;
    if(L<0){for(const R of g.roads)if(dLine(x,y,R.pts)<=5.2)L=-2;for(const V of g.rivers)if(dLine(x,y,V)<=8)L=-3;for(const p of g.ponds)if(Math.hypot(x-p.x,y-p.y)<=p.r)L=-3;
      for(const h of g.hubs)if(Math.hypot(x-h.x,y-h.y)<=h.r)L=-4;if(g.mon&&Math.hypot(x-g.mon.x,y-g.mon.y)<=g.mon.r)L=-4;for(const h of g.hedges)if(dLine(x,y,h)<=2.6)L=-4}
    lab[j*N+i]=L}
  const comp=new Int16Array(N*N).fill(-1);let nc=0;const csize=[];
  for(let s=0;s<N*N;s++){if(lab[s]!==-1||comp[s]>=0)continue;const st=[s];comp[s]=nc;let sz=0;while(st.length){const q=st.pop();sz++;const i=q%N,j=(q/N)|0;for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){const a=i+di,b=j+dj;if(a<0||b<0||a>=N||b>=N)continue;const r=b*N+a;if(lab[r]===-1&&comp[r]<0){comp[r]=nc;st.push(r)}}}csize.push(sz);nc++}
  const cell=(x,y)=>Math.min(N-1,Math.max(0,Math.floor(y*N/100)))*N+Math.min(N-1,Math.max(0,Math.floor(x*N/100)));
  const halfComp=EDGE_HALF.map(p=>comp[cell(p[0],p[1])]);const edgeComps=new Set(halfComp.filter(c=>c>=0));
  g.fieldComp=[];g.err=[];const used=new Set();
  d.F.forEach((f,k)=>{let cs=[...new Set(f.h.map(h=>halfComp[h]))];
    if(!f.h.length){const inner=[];for(let c=0;c<nc;c++)if(!edgeComps.has(c)&&!used.has(c))inner.push(c);inner.sort((a,b)=>csize[b]-csize[a]);cs=inner.slice(0,1)}
    if(cs.length!==1||cs[0]<0)g.err.push(`field ${k} halves ${f.h} -> comps ${cs}`);for(const c of cs){if(used.has(c))g.err.push(`comp ${c} shared`);used.add(c)}g.fieldComp.push(cs[0])});
  for(const c of edgeComps)if(!used.has(c))g.err.push(`edge comp ${c} unclaimed`);
  // town adjacency check (field comp touches the town) — only a warning list
  g.adjWarn=[];d.F.forEach((f,k)=>{const c=g.fieldComp[k];if(c==null||c<0)return;const touch=new Set();for(let s=0;s<N*N;s++){if(comp[s]!==c)continue;const i=s%N,j=(s/N)|0;for(let dj=-2;dj<=2;dj++)for(let di=-2;di<=2;di++){const a=i+di,b=j+dj;if(a<0||b<0||a>=N||b>=N)continue;const L=lab[b*N+a];if(L>=0)touch.add(L)}}
    const want=f.ac.slice().sort().join(','),got=[...touch].sort().join(',');if(want!==got)g.adjWarn.push(`field ${k}: data ${want} drawn ${got}`)});
  g.lab=lab;g.comp=comp;
  // ---- follower spots: deepest cell of each area; roads at their middle; priory at its door ----
  const dist=(own)=>{const D=new Float32Array(N*N);for(let q=0;q<N*N;q++){const i=q%N,j=(q/N)|0;D[q]=own(q)?Math.min(i+1,j+1,N-i,N-j)*3:0}
    for(let j=0;j<N;j++)for(let i=0;i<N;i++){const q=j*N+i;if(!D[q])continue;if(i>0)D[q]=Math.min(D[q],D[q-1]+3);if(j>0){D[q]=Math.min(D[q],D[q-N]+3);if(i>0)D[q]=Math.min(D[q],D[q-N-1]+4);if(i<N-1)D[q]=Math.min(D[q],D[q-N+1]+4)}}
    for(let j=N-1;j>=0;j--)for(let i=N-1;i>=0;i--){const q=j*N+i;if(!D[q])continue;if(i<N-1)D[q]=Math.min(D[q],D[q+1]+3);if(j<N-1){D[q]=Math.min(D[q],D[q+N]+3);if(i<N-1)D[q]=Math.min(D[q],D[q+N+1]+4);if(i>0)D[q]=Math.min(D[q],D[q+N-1]+4)}}
    let best=null,bd=-1;for(let q=0;q<N*N;q++){if(!own(q))continue;const i=q%N,j=(q/N)|0;const v=D[q]-Math.hypot(i-N/2+.5,j-N/2+.5)*.05;if(v>bd){bd=v;best=[(i+.5)*100/N,(j+.5)*100/N]}}return best||[50,50]};
  segs.forEach((s,li)=>{let p;
    if(s.ty==='C')p=dist(q=>lab[q]===li);
    else if(s.ty==='R'){const R=g.roads.find(r=>r.seg===li);p=along(R.pts,R.pts.length>2||r2len(R)>90?.5:.42)}
    else if(s.ty==='F'){const c=g.fieldComp[li-nC-nR];p=c>=0?dist(q=>comp[q]===c):[50,50]}
    else p=[g.mon.x,g.mon.y+g.mon.r*.9];
    g.spots[li]=[Math.round(p[0]*10)/10,Math.round(p[1]*10)/10]});
  // decorations: taverns beside their road, basilica/goods/banner inside the town, herb garden in a field
  g.roads.forEach(R=>{if(!R.inn)return;const m=along(R.pts,.62),a=along(R.pts,.55),b=along(R.pts,.7);let nx=-(b[1]-a[1]),ny=b[0]-a[0];const L=Math.hypot(nx,ny)||1;nx/=L;ny/=L;
    let best=null,bs=-1;for(const sg of [1,-1]){const x=m[0]+nx*sg*17,y=m[1]+ny*sg*17;if(x<8||y<8||x>92||y>92)continue;const q=lab[cell(x,y)];const sc=q===-1?10-Math.hypot(x-50,y-50)/10:0;if(sc>bs){bs=sc;best=[x,y]}}
    g.inns.push({x:(best||[m[0]+nx*14,m[1]+ny*14])[0],y:(best||[m[0]+nx*14,m[1]+ny*14])[1],road:R.seg})});
  return GEO[t]=g}
function r2len(R){return lineLen(R.pts)}
// ---------- SVG painter (catalogue, 2D board, dock preview) ----------
const PAL={field:'#a9b86a',field2:'#c2c077',town:'#e3c89a',townEdge:'#8a5a33',roof:'#c0613a',road:'#efe2bf',roadEdge:'#9c8458',river:'#4d93c2',riverEdge:'#2f6f99',mon:'#f1e6cf',hedge:'#5d7a35'};
function polyD(p){return 'M'+p.map(q=>q[0].toFixed(1)+' '+q[1].toFixed(1)).join('L')+'Z'}
function lineD(p){return 'M'+p.map(q=>q[0].toFixed(1)+' '+q[1].toFixed(1)).join('L')}
function tileSVG(t,opt){opt=opt||{};const g=buildGeo(t),d=TT[t];let s='';
  s+=`<rect width="100" height="100" fill="${PAL.field}"/>`;
  s+=`<path d="M0 22H100M0 46H100M0 70H100M0 94H100" stroke="${PAL.field2}" stroke-width="6" opacity=".45"/>`;
  for(const V of g.rivers)s+=`<path d="${lineD(V)}" stroke="${PAL.riverEdge}" stroke-width="19" fill="none" stroke-linecap="butt"/><path d="${lineD(V)}" stroke="${PAL.river}" stroke-width="14" fill="none"/>`;
  for(const p of g.ponds)s+=`<circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="${PAL.river}" stroke="${PAL.riverEdge}" stroke-width="2.5"/>`;
  for(const T of g.towns){s+=`<path d="${polyD(T.poly)}" fill="${d.C[T.seg].cat?'#ead7b5':PAL.town}"/>`;for(const w of T.walls)s+=`<path d="${lineD(w)}" stroke="${PAL.townEdge}" stroke-width="3.2" fill="none"/>`}
  for(const h of g.hedges)s+=`<path d="${lineD(h)}" stroke="${PAL.hedge}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  for(const R of g.roads)s+=`<path d="${lineD(R.pts)}" stroke="${PAL.roadEdge}" stroke-width="10" fill="none"/><path d="${lineD(R.pts)}" stroke="${PAL.road}" stroke-width="7" fill="none"/>`;
  for(const h of g.hubs)s+=`<circle cx="${h.x}" cy="${h.y}" r="${h.r}" fill="#e8d5ad" stroke="${PAL.roadEdge}" stroke-width="1.5"/><rect x="${h.x-4}" y="${h.y-4}" width="8" height="8" fill="${PAL.roof}"/>`;
  if(g.mon)s+=`<circle cx="${g.mon.x}" cy="${g.mon.y}" r="${g.mon.r}" fill="#d8e3a8" stroke="#7a8f3f" stroke-width="1.2"/><rect x="${g.mon.x-7}" y="${g.mon.y-8}" width="14" height="13" fill="${PAL.mon}" stroke="#7d6a4c" stroke-width="1"/><path d="M${g.mon.x-9} ${g.mon.y-7}L${g.mon.x} ${g.mon.y-15}L${g.mon.x+9} ${g.mon.y-7}Z" fill="${PAL.roof}"/>`;
  for(const I of g.inns)s+=`<ellipse cx="${I.x}" cy="${I.y}" rx="7" ry="5" fill="${PAL.river}"/><rect x="${I.x+3}" y="${I.y-9}" width="8" height="7" fill="#f3e2c2" stroke="#6b4b2a" stroke-width=".8"/>`;
  d.C.forEach((c,i)=>{const sp=g.spots[i];if(c.cat)s+=`<path d="M${sp[0]-6} ${sp[1]+6}V${sp[1]-3}L${sp[0]} ${sp[1]-11}L${sp[0]+6} ${sp[1]-3}V${sp[1]+6}Z" fill="#f4ecdc" stroke="#6b4b2a"/>`;
    if(c.p)s+=`<path d="M${sp[0]+7} ${sp[1]-12}h9v7l-4.5 3l-4.5-3z" fill="#2c5fb8" stroke="#f0c44c" stroke-width="1.2"/>`;
    if(c.g)s+=`<circle cx="${sp[0]-9}" cy="${sp[1]+6}" r="5" fill="${GOODS_COL[c.g]}" stroke="#3a2a18" stroke-width=".8"/>`});
  if(d.gar){const fs=g.spots[d.C.length+d.R.length];if(fs)s+=`<rect x="${fs[0]-5}" y="${fs[1]+5}" width="10" height="7" rx="2" fill="#6e9a3c" stroke="#3f5f22" stroke-width="1"/>`}
  if(opt.spots)g.spots.forEach((p,i)=>{s+=`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="#fff" stroke="#000" stroke-width="1"/><text x="${p[0]}" y="${p[1]+2}" font-size="5" text-anchor="middle">${i}</text>`});
  return s}
const GOODS_COL={wine:'#7a1f3d',grain:'#e3b23c',cloth:'#3f6fb5'};
if(typeof module!=='undefined')module.exports={};
