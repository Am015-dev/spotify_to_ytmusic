// Component reference for Short Fuse in the shared GX.reference format, built from refEntries() (texts.js), the same
// list the old Cards drawer and dump_ref.js use. Every entry keeps its count; `pic` says which small drawing to show.
function sfSlug(s){return String(s).toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}
function sfRefSections(){
  const secs=[],by={},seen={};
  refEntries().forEach(e=>{
    let S=by[e.s];if(!S){S=by[e.s]={id:sfSlug(e.s),title:e.s,items:[]};secs.push(S)}
    let id=S.id+'-'+sfSlug(e.n);while(seen[id])id+='x';seen[id]=1;
    S.items.push({id,name:e.n,count:e.c,text:e.t,tags:e.tags.slice(),meta:e.tags.join(' · '),extra:(e.sub||[]).map(x=>Array.isArray(x)?x.join(': '):x).join(' '),pic:{s:e.s,n:e.n}});
  });
  return secs;
}
// small pictures: wire tiles in their colours, round tokens, card shapes with an icon, the job number on a badge
function sfRefPic(it,big){
  const p=it.pic||{},z=big?120:44,svg=(w,h,inner)=>`<svg viewBox="0 0 ${w} ${h}" width="${big?w*2.4:w}" height="${big?h*2.4:h}" aria-hidden="true">${inner}</svg>`;
  const icon=(n,x,y,s,c)=>`<g transform="translate(${x},${y}) scale(${s/24})" fill="none" stroke="${c||'#1c1838'}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICO[n]||''}</g>`;
  if(p.s==='Wires'){
    if(/Stand/.test(p.n))return svg(48,44,`<rect x="2" y="26" width="44" height="12" rx="3" fill="#6b4a2b" stroke="#1c1838" stroke-width="2"/>${[0,1,2,3].map(i=>`<rect x="${5+i*10}" y="8" width="8" height="20" rx="2" fill="#2f6fd6" stroke="#1c1838" stroke-width="1.5"/>`).join('')}`);
    const c=/Yellow/.test(p.n)?'#ffc928':/Red/.test(p.n)?'#e5483b':'#2f6fd6',t=/Yellow/.test(p.n)?'3.1':/Red/.test(p.n)?'6.5':'7';
    return svg(30,44,`<rect x="3" y="2" width="24" height="40" rx="4" fill="${c}" stroke="#1c1838" stroke-width="2"/><rect x="7" y="6" width="16" height="12" rx="3" fill="#fff8e6"/><text x="15" y="16" font-size="${t.length>1?8:10}" font-weight="900" text-anchor="middle" fill="#1c1838">${t}</text>`);
  }
  if(p.s==='Tokens'){
    const ic=/Validation/.test(p.n)?'check':/Fuse/.test(p.n)?'fuse':/Robot/.test(p.n)?'robot':/Oxygen/.test(p.n)?'drop':/Number card/.test(p.n)?'seven':/Equal/.test(p.n)?'swap':/X token/.test(p.n)?'x':/False/.test(p.n)?'ban':/Count/.test(p.n)?'calc':/Even/.test(p.n)?'flip':'info';
    return svg(44,44,`<circle cx="22" cy="22" r="19" fill="#fff8e6" stroke="#1c1838" stroke-width="2.5"/>${icon(ic,10,10,24)}`);
  }
  const card=(bg,ic)=>svg(34,46,`<rect x="2" y="2" width="30" height="42" rx="5" fill="${bg}" stroke="#1c1838" stroke-width="2"/>${icon(ic,7,13,20)}`);
  if(p.s==='Equipment cards')return card('#ffd98a','gear');
  if(p.s==='Crew cards')return card('#bfe6ff','user');
  if(p.s==='Personal tools')return card('#d9f2c4','probe');
  if(p.s==='Restriction cards')return card('#ffc4c4','ban');
  if(p.s==='Dare cards')return card('#e8d4ff','star');
  if(/Bunker/.test(p.s))return card('#e2e2e2','map');
  if(p.s==='Job rules')return card('#fff1c9','book');
  if(p.s==='Jobs'){const n=parseInt(p.n,10)||0;return svg(44,44,`<rect x="3" y="3" width="38" height="38" rx="9" fill="#1c1838"/><text x="22" y="29" font-size="${n>9?17:20}" font-weight="900" text-anchor="middle" fill="#ffc928">${n}</text>`)}
  return null;
}
