// tZig24.js: plot every route zig-zag (two opposite turns < 80 m apart, d24lib turns()) from a tRoute24 output over the street graph,
// 16 crops (200 m) per sheet: grey = filler grid, blue = real street node class, orange = deck, red = route, dots = turn peaks.
// usage: node tools/tZig24.js <url-of-local_dbg.html> <route.json> <out-prefix> [city]
const fs=require('fs');const{chromium,boot,turns}=require('./d24lib');
const URL=process.argv[2],RJ=JSON.parse(fs.readFileSync(process.argv[3])),OUTP=process.argv[4],CITY=process.argv[5]||RJ.city||'fra';
(async()=>{const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});const{p}=await boot(b,{city:CITY,url:URL});
 const Z=[];for(const[k,L]of Object.entries(RJ.paths))L.forEach((P,ri)=>{if(!Array.isArray(P)||P.length<2)return;const T=turns(P).turns;for(let i=1;i<T.length;i++)if(T[i].s-T[i-1].s<80&&Math.sign(T[i].ang)!==Math.sign(T[i-1].ang))Z.push({k,ri,P,a:T[i-1],b:T[i]})});
 console.log('zigzags',Z.length);await p.setViewportSize({width:1000,height:1000});
 for(let sh=0;sh*16<Z.length;sh++){const part=Z.slice(sh*16,sh*16+16);
  await p.evaluate(part=>__g9ev(`(()=>{const part=${JSON.stringify(part)};const G=qvGraph();let c=document.getElementById('d24z');if(!c){c=document.createElement('canvas');c.id='d24z';c.style.cssText='position:fixed;left:0;top:0;z-index:99999;background:#fff;width:1000px;height:1000px';document.body.appendChild(c)}
   c.width=2000;c.height=2000;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,2000,2000);const S=500/200;
   const rs=(P,ds)=>{const o=[P[0]];let acc=0;for(let i=1;i<P.length;i++){let a=P[i-1],b=P[i],L=Math.hypot(b[0]-a[0],b[1]-a[1]);for(;acc+ds<=L;acc+=ds){const t=(acc+ds)/L;o.push([a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t])}acc-=L}return o};
   part.forEach((q,n)=>{const ox=(n%4)*500,oz=Math.floor(n/4)*500,R=rs(q.P,5),m=Math.round((q.a.s+q.b.s)/10),cx=R[Math.min(m,R.length-1)][0],cz=R[Math.min(m,R.length-1)][1];
    g.save();g.beginPath();g.rect(ox,oz,500,500);g.clip();const T=(x,z)=>[ox+250+(x-cx)*S,oz+250-(z-cz)*S];
    for(let i=0;i<G.n;i++){if(Math.abs(G.X[i]-cx)>120||Math.abs(G.Z[i]-cz)>120)continue;for(let e=G.off[i];e<G.off[i+1];e++){const j=G.nb[e];if(j<i)continue;const k=Math.max(G.K[i],G.K[j]);g.strokeStyle=['#bbb','#58f','#f90'][k];g.lineWidth=k?2:1;g.beginPath();g.moveTo(...T(G.X[i],G.Z[i]));g.lineTo(...T(G.X[j],G.Z[j]));g.stroke()}}
    g.strokeStyle='#e00';g.lineWidth=4;g.beginPath();g.moveTo(...T(...q.P[0]));for(const v of q.P)g.lineTo(...T(...v));g.stroke();
    for(const t of[q.a,q.b]){const v=R[Math.min(Math.round(t.s/5),R.length-1)];g.fillStyle='#090';g.beginPath();g.arc(...T(...v),7,0,7);g.fill()}
    g.fillStyle='#000';g.font='22px sans-serif';g.fillText(q.k+' '+q.ri+'  '+q.a.ang+'° / '+q.b.ang+'°  gap '+(q.b.s-q.a.s)+' m',ox+8,oz+24);g.strokeStyle='#000';g.lineWidth=2;g.strokeRect(ox,oz,500,500);g.restore()})})()`),part);
  await p.locator('#d24z').screenshot({path:`${OUTP}_${sh}.png`})}
 await b.close()})();
