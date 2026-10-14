// qa-1 HEATMAP: renders the monkey bot's invariant hits and stuck events on the 2D street map per city → docs/shots/qa/heat_<city>.png,
// and prints the fix list (densest 50 m cells with their invariants + a repro link).
// node tools/qa/heat.js <monkey.json> [more.json…] [--base out/<ver>|url] [--out docs/shots/qa] [--cell 50]
const fs=require('fs'),path=require('path');const L=require('./lib');
const A=process.argv.slice(2),flag=(f,d)=>{const i=A.indexOf(f);return i<0?d:A[i+1]};
const files=A.filter((a,i)=>!a.startsWith('--')&&!(i>0&&A[i-1].startsWith('--'))),OUT=flag('--out','docs/shots/qa'),CELL=+flag('--cell',50),base=flag('--base',undefined);
const COL={stuck:'#ffd400',ride_below_ground:'#ff3b30',wheel_gap:'#ff9500',wheel_sunk:'#ff6b00',ride_in_building:'#ff2d95',foot_in_building:'#d63384',foot_float:'#34c759',foot_sunk:'#2fa84f',npc_in_building:'#af52de',ride_in_car:'#5ac8fa',foot_in_car:'#32ade6',prop_on_road:'#00e0c6',camera_blocked:'#0a84ff',camera_underground:'#5e5ce6',nan_position:'#ffffff',heading_reversed:'#ff7ab8'};
const col=n=>COL[n]||(n.startsWith('hud')?'#c7c7cc':n.startsWith('js_')||n.includes('error')||n.includes('rejection')?'#ffffff':'#9a9a9a');
(async()=>{fs.mkdirSync(OUT,{recursive:true});const hits={};let ver='?';
 for(const f of files){const J=JSON.parse(fs.readFileSync(f,'utf8'));ver=J.ver||ver;for(const r of J.runs)for(const b of r.bugs)(hits[b.city]=hits[b.city]||[]).push(b)}
 const br=await L.launch();
 for(const city of Object.keys(hits)){const H=hits[city],S=await L.open({base,city,browser:br});
  const M=JSON.parse(await L.ev(S.p,'JSON.stringify({b:[WX0,WX1,WZS,WZN],e:(()=>{const o=[];const N=HUB.nodes;for(let i=0;i<N.length;i++){const a=N[i];if(!a||!a.nb)continue;for(const j of a.nb)if(j>i&&N[j])o.push(Math.round(a.x),Math.round(a.z),Math.round(N[j].x),Math.round(N[j].z))}return o})()})'));
  await S.ctx.close();
  // cells
  const C={};for(const b of H){const k=Math.floor(b.x/CELL)+','+Math.floor(b.z/CELL),c=C[k]=C[k]||{x:(Math.floor(b.x/CELL)+.5)*CELL,z:(Math.floor(b.z/CELL)+.5)*CELL,n:0,by:{},ex:b};c.n++;c.by[b.name]=(c.by[b.name]||0)+1}
  const top=Object.values(C).sort((a,b)=>b.n-a.n).slice(0,10);
  // bounds: the area the hits and streets share, so a hit cluster is readable (whole map if the hits are spread out)
  const W=1400,Hh=1000;let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let i=0;i<M.e.length;i+=2){x0=Math.min(x0,M.e[i]);x1=Math.max(x1,M.e[i]);z0=Math.min(z0,M.e[i+1]);z1=Math.max(z1,M.e[i+1])}for(const b of H){x0=Math.min(x0,b.x);x1=Math.max(x1,b.x);z0=Math.min(z0,b.z);z1=Math.max(z1,b.z)}x0-=60;x1+=60;z0-=60;z1+=60;const sx=W/(x1-x0),sz=Hh/(z1-z0),s=Math.min(sx,sz);
  const px=x=>(x-x0)*s+10,py=z=>Hh-(z-z0)*s+10;
  const edges=M.e;let svg=`<rect width="${W+20}" height="${Hh+40}" fill="#101418"/>`;
  let d='';for(let i=0;i<edges.length;i+=4)d+=`M${px(edges[i]).toFixed(1)} ${py(edges[i+1]).toFixed(1)}L${px(edges[i+2]).toFixed(1)} ${py(edges[i+3]).toFixed(1)}`;
  svg+=`<path d="${d}" stroke="#4a5560" stroke-width="1" fill="none"/>`;
  svg+=`<defs><radialGradient id="g"><stop offset="0" stop-color="#ff3b30" stop-opacity=".55"/><stop offset="1" stop-color="#ff3b30" stop-opacity="0"/></radialGradient></defs>`;
  for(const c of Object.values(C))svg+=`<circle cx="${px(c.x).toFixed(1)}" cy="${py(c.z).toFixed(1)}" r="${(14+Math.min(60,c.n*8)).toFixed(0)}" fill="url(#g)"/>`;
  for(const b of H)svg+=`<circle cx="${px(b.x).toFixed(1)}" cy="${py(b.z).toFixed(1)}" r="3.2" fill="${col(b.name)}" stroke="#000" stroke-width=".6"/>`;
  top.forEach((c,i)=>{svg+=`<text x="${(px(c.x)+8).toFixed(0)}" y="${(py(c.z)-8).toFixed(0)}" font-family="sans-serif" font-size="16" font-weight="700" fill="#fff" stroke="#000" stroke-width="3" paint-order="stroke">${i+1}</text>`});
  const names=[...new Set(H.map(b=>b.name))].sort();let ly=Hh+10;names.forEach((n,i)=>{svg+=`<circle cx="${20+i*0}" cy="0" r="0"/>`});
  let lx=14;svg+=`<g font-family="sans-serif" font-size="14" fill="#ddd">`;names.forEach(n=>{svg+=`<circle cx="${lx}" cy="${Hh+26}" r="5" fill="${col(n)}"/><text x="${lx+9}" y="${Hh+31}">${n} ${H.filter(b=>b.name===n).length}</text>`;lx+=24+n.length*7.4+20});svg+=`</g>`;
  svg+=`<text x="14" y="26" font-family="sans-serif" font-size="20" font-weight="700" fill="#fff">${city.toUpperCase()} · ${ver} · ${H.length} hit cells · numbers = ${CELL} m cells, densest first</text>`;
  const html=`<html><body style="margin:0"><svg xmlns="http://www.w3.org/2000/svg" width="${W+20}" height="${Hh+40}">${svg}</svg></body></html>`;
  const pg=await br.newPage({viewport:{width:W+20,height:Hh+40}});await pg.setContent(html);const out=path.join(OUT,`heat_${city}.png`);await pg.screenshot({path:out});await pg.close();
  console.log(`HEAT ${city}: ${H.length} hits → ${out}`);
  console.log(`FIX LIST ${city} (densest ${CELL} m cells):`);top.forEach((c,i)=>console.log(`  ${i+1}. ${c.n} hits @${Math.round(c.x)},${Math.round(c.z)}  ${Object.entries(c.by).sort((a,b)=>b[1]-a[1]).map(e=>e[0]+'×'+e[1]).join(' ')}  ${c.ex.repro||''}`));
 }
 await br.close();process.exit(0)})().catch(e=>{console.log('FAIL heat crashed: '+e);process.exit(2)});
