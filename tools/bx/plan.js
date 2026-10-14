// offline track planner: chains pieces like bxCh (same BX_P, read from src), prints closure, length, max grade, near-overlaps.
// node tools/bx/plan.js <file exporting {name:[world,[i,j,l,r],[pieces...]]}>
const fs=require('fs'),src=fs.readFileSync(__dirname+'/../../src/98b2_builder2.js','utf8');
const bxSS=t=>t*t*(3-2*t);const body=src.slice(src.indexOf('const bxRamp'),src.indexOf('const BX_PAL'));const BX_P=eval(body+';BX_P');
const bxCl=(v,a,b)=>v<a?a:v>b?b:v,bxBowl=(x,z,cx,cz,r,deep)=>{const d=Math.hypot(x-cx,z-cz);return d<r?deep+(2-deep+1)*(d/r)**2:99};
const W=eval(src.slice(src.indexOf('const BX_WORLDS'),src.indexOf('const BX_CITY'))+';BX_WORLDS');
const BXN=+/BXN=(\d+)/.exec(src)[1],BX_OFF=+/BX_OFF=(\d+)/.exec(src)[1],BXC=8,BXH=2,BXO=-BXN*BXC/2,LIM=BXN*BXC/2-2,BXF=[[0,1],[-1,0],[0,-1],[1,0]];
const fr=c=>{const f=BXF[c.r&3],rv=BXF[(c.r+1)&3],cx=BXO+(c.i+.5)*BXC,cz=BXO+(c.j+.5)*BXC;return{o:[cx-f[0]*4,c.l*BXH,cz-f[1]*4],F:f,R:rv}};
const ex=(c,e)=>{const f=BXF[c.r&3],rv=BXF[(c.r+1)&3];return{i:c.i+e[0]*rv[0]+e[1]*f[0],j:c.j+e[0]*rv[1]+e[1]*f[1],l:c.l+e[2],r:(c.r+e[3]+4)&3}};
// layouts are on the 56-cell grid; OLD=1 in the env = 40-grid cells (+BX_OFF, like bxCh's default)
const OFF=process.env.OLD?BX_OFF:0;
function chain(c0,L){let cur={i:c0[0]+OFF,j:c0[1]+OFF,l:c0[2],r:c0[3]},sp=null,pcs=[];for(const t of L){if(Array.isArray(t)){cur={i:t[0]+OFF,j:t[1]+OFF,l:t[2],r:t[3]};continue}
 if(typeof t==='number'){cur={...sp[t]};continue}const d=BX_P[t];if(!d)throw new Error('no piece '+t);const F=fr(cur);const P=[];
 for(let b=0;b<d.p.length;b++){const A=[];for(let k=0;k<=d.k;k++){const l=d.p[b](k/d.k);A.push([F.o[0]+F.R[0]*l[0]+F.F[0]*l[2],F.o[1]+l[1],F.o[2]+F.R[1]*l[0]+F.F[1]*l[2]])}P.push(A)}
 const E=d.ex.map(e=>ex(cur,e)),N=[{...cur},...(d.in||[]).map(e=>ex(cur,[e[0],e[1],0,0]))];pcs.push({t,c:{...cur},P,jump:d.jump,E,N});if(E.length>1)sp=E;cur=E[0]}return{pcs,end:cur}}
const K=c=>c.i+','+c.j+','+c.l+','+c.r,adj=(a,b)=>a.E.some(e=>b.N.some(n=>K(n)===K(e)))||b.E.some(e=>a.N.some(n=>K(n)===K(e)));
const T=require(require('path').resolve(process.argv[2]));
for(const n in T){const[w,c0,L]=T[n];const{pcs,end}=chain(c0,L);const H=W[w||'valley'].f;let cut=0,cutL=0,fly=0;let len=0,g=0,ga='',lo=1e9,hi=-1e9,oob=0;const pts=[];
 pcs.forEach((p,pi)=>{for(const A of p.P){for(let k=0;k<A.length;k++){const a=A[k];lo=Math.min(lo,a[1]);hi=Math.max(hi,a[1]);if(Math.abs(a[0])>LIM||Math.abs(a[2])>LIM)oob++;pts.push([a,pi]);{const th=H(a[0],a[2]);if(th-a[1]>cut)cut=th-a[1];if(th-a[1]>3)cutL++;if(a[1]-th>fly)fly=a[1]-th}
  if(k){const b=A[k-1],h=Math.hypot(a[0]-b[0],a[2]-b[2]);if(p.P.length===1||A===p.P[0])len+=Math.hypot(h,a[1]-b[1]);if(!p.jump&&h>.05&&Math.abs(a[1]-b[1])/h>g){g=Math.abs(a[1]-b[1])/h;ga=p.t+'#'+pi}}}}});
 let bh=0;if(w==='city'){const B=eval(src.slice(src.indexOf('const BX_CITY'),src.indexOf('function BX_world'))+';BX_CITY');for(const[a]of pts)for(const[x,z,bw,bd,h]of B)if(Math.abs(a[0]-x)<bw/2+6&&Math.abs(a[2]-z)<bd/2+6&&a[1]<h+3){bh++;if(process.env.V)console.log('bldg',x,z,a.map(v=>v.toFixed(0)).join(','))}}
 let ov=[];for(let x=0;x<pts.length;x+=2)for(let y=x+2;y<pts.length;y+=2){const[a,i]=pts[x],[b,j]=pts[y];if(Math.abs(i-j)<=4||Math.abs(i-j)>=pcs.length-4||adj(pcs[i],pcs[j]))continue;const d=Math.hypot(a[0]-b[0],a[2]-b[2]),dy=Math.abs(a[1]-b[1]);if(d<16&&dy<6)ov.push(`${pcs[i].t}#${i}~${pcs[j].t}#${j} d${d.toFixed(0)} dy${dy.toFixed(0)}`)}
 ov=[...new Set(ov)];const NS=new Set(pcs.flatMap(p=>p.N.map(K)));const gaps=pcs.flatMap(p=>p.E.filter(e=>!NS.has(K(e))).map(e=>p.t+'->'+K(e)));const s=pcs[0].c,closed=end.i===s.i&&end.j===s.j&&end.l===s.l&&end.r===s.r;
 if(process.env.V)pcs.forEach((p,i)=>{const a=p.P[0][0];console.log(i,p.t,JSON.stringify(p.c),'y',a[1].toFixed(0),'ground',H(a[0],a[2]).toFixed(0))});
 console.log(`${n}: ${pcs.length} pcs, len ${len.toFixed(0)} m, closed ${closed?'YES':'NO end '+JSON.stringify(end)+' start '+JSON.stringify(s)}, grade ${(g*100).toFixed(0)}% ${ga}, y ${lo.toFixed(0)}..${hi.toFixed(0)}, oob ${oob}, cut max ${cut.toFixed(0)} m (${cutL} pts>3m), max height over ground ${fly.toFixed(0)} m, bldg hits ${bh}, open exits ${gaps.length} ${gaps.join(' ')}, overlaps ${ov.length} ${[...new Set(ov.map(o=>o.split(" ")[0]))].join(" ")}`)}
module.exports={chain};
