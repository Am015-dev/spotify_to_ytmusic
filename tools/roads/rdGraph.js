// in-page (module scope via __g9ev): road graph report + map geometry. Returns a JSON string.
(()=>{const out={city:CID==='fra'?'fra':'ath'};const A=window.__ob.roadAudit();out.audit=A;
 const FR=hubRoads(),nB=BRIDGES.length,ext=OB_ext(FR,nB),N=OB_net(null,ext),segs=N.segs;
 const croot=new Map();let ci=0;const cid=r=>{if(!croot.has(r))croot.set(r,ci++);return croot.get(r)};
 // main component = longest total length
 const L=new Map();segs.forEach((S,a)=>{const r=N.find(a);L.set(r,(L.get(r)||0)+S.L)});FR.forEach((r,k)=>{const R=N.find(segs.length+nB+k);L.set(R,(L.get(R)||0)+r.L)});
 const main=[...L.entries()].sort((a,b)=>b[1]-a[1])[0][0];cid(main);
 out.segs=segs.map((S,a)=>{const P=S.pts,pp=[];for(let i=0;i<P.length;i+=3)pp.push([Math.round(P[i].x),Math.round(P[i].z)]);const e=P[P.length-1];pp.push([Math.round(e.x),Math.round(e.z)]);return{c:cid(N.find(a)),w:S.r.w,cls:S.r.cls,one:S.r.one?1:0,p:pp}});
 out.fill=FR.map((r,k)=>({c:cid(N.find(segs.length+nB+k)),w:r.w,p:[[Math.round(r.x0),Math.round(r.z0)],[Math.round(r.x1),Math.round(r.z1)]]}));
 const dead=N.dead.map(d=>[Math.round(d.x),Math.round(d.z),Math.round(d.st)]);FR.forEach((r,k)=>{const I=ext.info[k];for(const e of[0,1])if(!I.endJ[e]){const[x,z]=OB_fpt(r,e?r.L:0);dead.push([Math.round(x),Math.round(z),-1])}});out.dead=dead;
 out.compKm=[...L.entries()].map(([r,l])=>[cid(r),+(l/1000).toFixed(2)]).sort((a,b)=>b[1]-a[1]);
 // width distribution (km by width bin), drivable streets + fill roads
 const bins=[6,8,10,12,16,99],wd={};const add=(w,l,t)=>{const b=bins.find(v=>w<v);const k=t+'<'+b;wd[k]=+(((wd[k]||0)+l/1000)).toFixed(2)};segs.forEach(S=>add(S.r.w,S.L,'st'));FR.forEach(r=>add(r.w,r.L,'fill'));out.widthKm=wd;
 const cls={};segs.forEach(S=>{const k=S.r.cls+(S.r.one?'(1way)':'');cls[k]=+(((cls[k]||0)+S.L/1000)).toFixed(2)});out.clsKm=cls;
 // junctions (CV grouping): arms, signalled
 const J=[...CV.sig.map(j=>({j,s:1})),...CV.yl.map(j=>({j,s:0}))];const jt={};for(const{j,s}of J){const k=(j.ap.length>=5?'5+':j.ap.length)+'arm'+(s?'_sig':'');jt[k]=(jt[k]||0)+1}out.junc={n:J.length,types:jt,sig:CV.sig.length};
 // awkward junctions: arms with angle gaps < 50 deg between approaches
 let awk=0;for(const{j}of J){const an=j.ap.map(a=>Math.atan2(a.dx,a.dz)).sort((a,b)=>a-b);for(let i=0;i<an.length;i++){let d=(an[(i+1)%an.length]-an[i]+Math.PI*2)%(Math.PI*2);if(an.length>1&&d<50*Math.PI/180){awk++;break}}}out.junc.awkward=awk;
 out.jpts=J.map(({j,s})=>[Math.round(j.x),Math.round(j.z),j.ap.length,s]);
 // traffic graph: SCCs (Tarjan, iterative) over street nodes
 const H=HUB.nodes,n=H.ng;const idx=new Int32Array(n).fill(-1),low=new Int32Array(n),on=new Uint8Array(n),comp=new Int32Array(n).fill(-1);let I=0,C=0;const st=[];
 for(let s=0;s<n;s++){if(idx[s]>=0)continue;const cs=[[s,0]];idx[s]=low[s]=I++;st.push(s);on[s]=1;
  while(cs.length){const fr=cs[cs.length-1],v=fr[0],nb=H[v].nb;if(fr[1]<nb.length){const w=nb[fr[1]++];if(w>=n)continue;if(idx[w]<0){idx[w]=low[w]=I++;st.push(w);on[w]=1;cs.push([w,0])}else if(on[w])low[v]=Math.min(low[v],idx[w])}
   else{cs.pop();if(cs.length){const u=cs[cs.length-1][0];low[u]=Math.min(low[u],low[v])}if(low[v]===idx[v]){let w;do{w=st.pop();on[w]=0;comp[w]=C}while(w!==v);C++}}}}
 const cz=new Map();for(let i=0;i<n;i++)cz.set(comp[i],(cz.get(comp[i])||0)+1);const big=[...cz.entries()].sort((a,b)=>b[1]-a[1]);
 let sink=0,uturn=0;for(let i=0;i<n;i++){const nb=H[i].nb.filter(j=>j<n);if(!nb.length)sink++;else if(nb.length===1){const B=H[nb[0]];if(B.g&&H[i].g&&Math.hypot(B.x-H[i].x,B.z-H[i].z)<(H[i].w||10)+1&&!B.nb.some(k=>k!==i&&k<n&&Math.hypot(H[k].x-H[i].x,H[k].z-H[i].z)>Math.hypot(B.x-H[i].x,B.z-H[i].z)))uturn++}}
 const bidir=(()=>{let b=0,t=0;for(let i=0;i<n;i++)for(const j of H[i].nb){if(j>=n)continue;t++;if(H[j].nb.includes(i))b++}return +(b/Math.max(1,t)).toFixed(3)})();
 out.tgraph={nodes:n,scc:C,mainSccFrac:+(big[0][1]/n).toFixed(4),nodesOutsideMain:n-big[0][1],sccOver10:big.filter(e=>e[1]>=10).length,sink,uturnEnds:uturn,bidirEdgeFrac:bidir};
 out.player={x:Math.round(RO.x),z:Math.round(RO.z)};out.box=[WX0,WX1,WZS,WZN];out.draws=renderer.info.render.calls;
 return JSON.stringify(out)})()
