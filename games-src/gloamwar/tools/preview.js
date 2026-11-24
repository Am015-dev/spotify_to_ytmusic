// Renders a quick map preview PNG (labels, adjacency) to check the generator. node tools/preview.js out.png
const fs=require('fs'),path=require('path');const {chromium}=require(path.join(__dirname,'..','..','node_modules','playwright'));
eval(fs.readFileSync(path.join(__dirname,'..','src','map.js'),'utf8').replace(/var /g,'global.'));
const col={gr:'#9c9',df:'#c96',au:'#ddd',va:'#dc8',hl:'#bd9',pt:'#a66',cv:'#999',sh:'#d97',null:'#efe3c4'};
let s=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MAPW} ${MAPH}" width="${MAPW}" height="${MAPH}"><rect width="100%" height="100%" fill="#9bb"/><clipPath id="l"><path d="M${COAST.join('L')}Z"/></clipPath><g clip-path="url(#l)">`;
REGIONS.forEach(r=>{s+=`<path d="M${r.poly.join('L')}Z" fill="${col[r.nat]}" stroke="#555" stroke-width="1"/>`});
s+='</g>';LAKES.forEach(l=>s+=`<path d="M${l.join('L')}Z" fill="#9bb"/>`);
REGIONS.forEach(r=>r.adj.forEach(a=>{const o=REGIONS.find(x=>x.id===a);if(r.id<a)s+=`<line x1="${r.x}" y1="${r.y}" x2="${o.x}" y2="${o.y}" stroke="#36c" stroke-width="1" opacity=".5"/>`}));
MOUNTAINS.forEach(m=>s+=`<polyline points="${m.pts.join(' ')}" fill="none" stroke="#000" stroke-width="6"/>`);
RIVERS.forEach(m=>s+=`<polyline points="${m.pts.join(' ')}" fill="none" stroke="#36c" stroke-width="3"/>`);
REGIONS.forEach(r=>s+=`<text x="${r.x}" y="${r.y}" font-size="${r.set?14:10}" text-anchor="middle" font-weight="${r.set?700:400}">${r.n}${r.set?' ['+r.set[0]+']':''}</text>`);
s+='</svg>';
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:MAPW,height:MAPH}});await p.setContent(s);await p.screenshot({path:process.argv[2]||'/tmp/map.png'});await b.close();})();
