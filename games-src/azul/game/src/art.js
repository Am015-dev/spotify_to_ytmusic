// ---------- original glaze motifs, as SVG path data in a 100x100 box: drawn by both the SVG views and the 3D canvas textures ----------
const TBASE=['#1d4aa3','#eeb023','#b8322c','#222429','#cfe9e8','#f3eefc'];
const TRIM=['#12306e','#b87a10','#7d1d19','#0c0d10','#7fb7b8','#b9a8dc'];
function starPath(cx,cy,n,r1,r2,rot){let d='';for(let i=0;i<n*2;i++){const a=(rot||0)+i*Math.PI/n;const r=i%2?r2:r1;d+=(i?'L':'M')+(cx+Math.cos(a)*r).toFixed(1)+' '+(cy+Math.sin(a)*r).toFixed(1)}return d+'Z'}
function circ(cx,cy,r){return `M${cx-r} ${cy}a${r} ${r} 0 1 0 ${2*r} 0a${r} ${r} 0 1 0 ${-2*r} 0Z`}
function rays(cx,cy,n,r0,r1,w){let d='';for(let i=0;i<n;i++){const a=i*2*Math.PI/n;const ax=Math.cos(a),ay=Math.sin(a),px=-ay*w,py=ax*w;
  d+=`M${(cx+ax*r0+px).toFixed(1)} ${(cy+ay*r0+py).toFixed(1)}L${(cx+ax*r1).toFixed(1)} ${(cy+ay*r1).toFixed(1)}L${(cx+ax*r0-px).toFixed(1)} ${(cy+ay*r0-py).toFixed(1)}Z`}return d}
function petals(cx,cy,n,r,len,wid,rot){let d='';for(let i=0;i<n;i++){const a=(rot||0)+i*2*Math.PI/n;const tx=cx+Math.cos(a)*len,ty=cy+Math.sin(a)*len;const mx=cx+Math.cos(a)*len*.5,my=cy+Math.sin(a)*len*.5;const px=-Math.sin(a)*wid,py=Math.cos(a)*wid;
  d+=`M${(cx+Math.cos(a)*r).toFixed(1)} ${(cy+Math.sin(a)*r).toFixed(1)}Q${(mx+px).toFixed(1)} ${(my+py).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}Q${(mx-px).toFixed(1)} ${(my-py).toFixed(1)} ${(cx+Math.cos(a)*r).toFixed(1)} ${(cy+Math.sin(a)*r).toFixed(1)}Z`}return d}
function snow(cx,cy,r){let d='';for(let i=0;i<6;i++){const a=i*Math.PI/3;const c=Math.cos(a),s=Math.sin(a);const L=(t,o)=>`${(cx+c*t-s*o).toFixed(1)} ${(cy+s*t+c*o).toFixed(1)}`;
  d+=`M${L(4,-2.2)}L${L(r,-2.2)}L${L(r,2.2)}L${L(4,2.2)}Z`;d+=`M${L(r*.55,0)}L${L(r*.8,-9)}L${L(r*.84,-6.5)}L${L(r*.62,1.5)}Z`;d+=`M${L(r*.55,0)}L${L(r*.8,9)}L${L(r*.84,6.5)}L${L(r*.62,-1.5)}Z`}return d}
const MOTIF=[
  // Cobalt: an eight-point star over pale corner fans
  [{d:circ(0,0,24)+circ(100,0,24)+circ(0,100,24)+circ(100,100,24),f:'#6fa3e6'},{d:circ(0,0,14)+circ(100,0,14)+circ(0,100,14)+circ(100,100,14),f:'#1d4aa3'},
   {d:starPath(50,50,8,34,19,Math.PI/8),f:'#f5ecd6'},{d:starPath(50,50,8,20,11,0),f:'#2c5fbf'},{d:circ(50,50,5),f:'#f5ecd6'}],
  // Saffron: a sunburst with a cream heart
  [{d:rays(50,50,16,14,44,6),f:'#c2471b'},{d:circ(50,50,17),f:'#fff1c2'},{d:circ(50,50,10),f:'#c2471b'},{d:circ(50,50,5),f:'#ffd66b'}],
  // Garnet: a cream quatrefoil with small corner diamonds
  [{d:circ(34,50,15)+circ(66,50,15)+circ(50,34,15)+circ(50,66,15),f:'#f6dcb3'},{d:circ(50,50,11),f:'#8f2420'},{d:starPath(50,50,4,7,3,0),f:'#f6dcb3'},
   {d:'M0 10L10 0L20 10L10 20ZM80 10L90 0L100 10L90 20ZM0 90L10 80L20 90L10 100ZM80 90L90 80L100 90L90 100Z',f:'#f0b27a'}],
  // Obsidian: gold petals in a ring, with corner brackets
  [{d:petals(50,50,8,6,36,9,Math.PI/8),f:'#d9a441'},{d:circ(50,50,9),f:'#222429'},{d:circ(50,50,4),f:'#f3d27c'},
   {d:'M8 8h22v5H13v17H8ZM92 8H70v5h17v17h5ZM8 92h22v-5H13V70H8ZM92 92H70v-5h17V70h5Z',f:'#b98a33'}],
  // Frost: a six-armed crystal inside a thin hexagon
  [{d:starPath(50,50,6,44,38,0).replace(/L/g,'L'),f:'#e9f7f6'},{d:snow(50,50,38),f:'#1f7482'},{d:circ(50,50,6),f:'#1f7482'},{d:circ(50,50,3),f:'#e9f7f6'}],
  // Prism: soft rainbow bands and a four-point sparkle
  [{d:'M0 0H22L0 22ZM0 34L34 0H48L0 48ZM0 60L60 0H74L0 74Z',f:'#9ad1f0',a:.55},{d:'M100 100H78L100 78ZM100 66L66 100H52L100 52ZM100 40L40 100H26L100 26Z',f:'#f5b3d4',a:.55},
   {d:starPath(50,50,4,40,9,-Math.PI/2),f:'#8a63d2'},{d:starPath(50,50,4,20,5,-Math.PI/4),f:'#ffd66b'}]];
// SVG <symbol>s for every glaze, and a tile at (x,y) of size s
function glazeDefs(){return `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>${MOTIF.map((m,k)=>`<symbol id="gz${k}" viewBox="0 0 100 100"><rect width="100" height="100" rx="12" fill="${TBASE[k]}"/>${m.map(p=>`<path d="${p.d}" fill="${p.f}"${p.a?` opacity="${p.a}"`:''}/>`).join('')}<rect x="3" y="3" width="94" height="94" rx="10" fill="none" stroke="${TRIM[k]}" stroke-width="5"/><path d="M8 14Q12 8 22 8H60" stroke="#fff" stroke-opacity=".45" stroke-width="4" fill="none" stroke-linecap="round"/></symbol>`).join('')}
  <symbol id="gzsun" viewBox="0 0 100 100"><circle cx="50" cy="50" r="47" fill="#f6c84c" stroke="#a8661a" stroke-width="5"/><path d="${rays(50,50,12,22,42,5)}" fill="#e07a1f"/><circle cx="50" cy="50" r="20" fill="#ffe7a0" stroke="#a8661a" stroke-width="3"/><text x="50" y="58" text-anchor="middle" font-size="24" font-weight="700" fill="#8a4a10">1</text></symbol></defs></svg>`}
function tileSVG(k,x,y,s,extra){return `<use href="#${k===SUN?'gzsun':'gz'+k}" x="${x}" y="${y}" width="${s}" height="${s}"${extra||''}/>`}
function tileChip(k,n){return `<span class="tchip"><svg viewBox="0 0 100 100" width="22" height="22" aria-hidden="true"><use href="#${k===SUN?'gzsun':'gz'+k}"/></svg>${n!=null?`<b>×${n}</b>`:''}</span>`}
// paint a glaze onto a 2D canvas (3D textures); alpha for ghost prints on the mosaic
function paintGlaze(x,k,px,py,s,alpha){x.save();x.translate(px,py);x.scale(s/100,s/100);x.globalAlpha=alpha==null?1:alpha;
  const rr=(a,b,w,h,r)=>{x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()};
  rr(0,0,100,100,12);x.fillStyle=TBASE[k];x.fill();x.save();rr(0,0,100,100,12);x.clip();
  for(const p of MOTIF[k]){x.globalAlpha=(alpha==null?1:alpha)*(p.a||1);x.fillStyle=p.f;x.fill(new Path2D(p.d))}x.restore();x.globalAlpha=alpha==null?1:alpha;
  rr(3,3,94,94,10);x.lineWidth=5;x.strokeStyle=TRIM[k];x.stroke();x.restore()}

// inline SVG icon from the sprite in body.html
const IC=n=>`<svg class="ic" aria-hidden="true"><use href="#i-${n}"/></svg>`;
