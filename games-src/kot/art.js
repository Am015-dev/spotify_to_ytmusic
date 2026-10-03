// ---------- art ----------
const INK='#1a1320';
function faceSVG(f){const s=`stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"`;
  if(f==='C2')return `<svg viewBox="0 0 60 60"><g fill="none" ${s} stroke-width="6"><path d="M10 12 C16 22 16 36 8 48"/><path d="M22 8 C28 20 28 36 20 50"/></g><g fill="none" stroke="#e63946" stroke-width="2.5"><path d="M10 12 C16 22 16 36 8 48"/><path d="M22 8 C28 20 28 36 20 50"/></g><text x="44" y="42" text-anchor="middle" font-family="Bangers,Impact,sans-serif" font-size="26" fill="#e63946" stroke="${INK}" stroke-width="1.5">×2</text></svg>`;
  if(f==='E2')return `<svg viewBox="0 0 60 60"><path d="M26 4 L8 30 H20 L16 52 L38 22 H25 Z" fill="#2ec27e" ${s} stroke-width="4"/><text x="46" y="42" text-anchor="middle" font-family="Bangers,Impact,sans-serif" font-size="26" fill="#2ec27e" stroke="${INK}" stroke-width="1.5">×2</text></svg>`;
  if(f==='O')return `<svg viewBox="0 0 60 60"><path d="M30 6 L36 22 L54 20 L40 32 L50 50 L30 40 L10 50 L20 32 L6 20 L24 22 Z" fill="#ff8c42" ${s} stroke-width="3.5"/><text x="30" y="36" text-anchor="middle" font-family="Bangers,Impact,sans-serif" font-size="14" fill="${INK}">OUCH</text></svg>`;
  if(f==='FE')return `<svg viewBox="0 0 60 60"><path d="M6 30 C18 12 42 12 54 30 C42 48 18 48 6 30 Z" fill="#fff" ${s} stroke-width="4"/><circle cx="30" cy="30" r="9" fill="#3a86ff" ${s} stroke-width="3"/><path d="M22 44 L18 56 M30 46 L30 56" ${s} stroke-width="3"/></svg>`;
  if(f==='FW')return `<svg viewBox="0 0 60 60"><path d="M6 24 Q16 14 26 24 T46 24 T56 24 M6 38 Q16 28 26 38 T46 38 T56 38" fill="none" stroke="#3a86ff" stroke-width="6" stroke-linecap="round"/></svg>`;
  if(f==='FS')return `<svg viewBox="0 0 60 60"><path d="M12 48 C4 38 22 34 30 38 C40 42 54 36 46 26 C40 18 24 26 22 16 C20 8 34 6 40 10" fill="none" stroke="#1a1320" stroke-width="9" stroke-linecap="round"/><path d="M12 48 C4 38 22 34 30 38 C40 42 54 36 46 26 C40 18 24 26 22 16 C20 8 34 6 40 10" fill="none" stroke="#7ee04c" stroke-width="5" stroke-linecap="round"/><circle cx="40" cy="10" r="3" fill="#e63946"/></svg>`;
  if(f==='FA')return `<svg viewBox="0 0 60 60"><ellipse cx="30" cy="16" rx="9" ry="11" fill="none" stroke="#f4a300" stroke-width="7"/><path d="M30 26 V56 M14 30 H46" stroke="#f4a300" stroke-width="8" stroke-linecap="round"/><ellipse cx="30" cy="16" rx="9" ry="11" fill="none" stroke="${INK}" stroke-width="2"/></svg>`;
  if('123'.includes(f))return `<svg viewBox="0 0 60 60"><text x="30" y="47" text-anchor="middle" font-family="Bangers,Impact,sans-serif" font-size="46" fill="${INK}">${f}</text><text x="30" y="47" text-anchor="middle" font-family="Bangers,Impact,sans-serif" font-size="46" fill="#ffd23f" transform="translate(-2,-2)">${f}</text><text x="30" y="47" text-anchor="middle" font-family="Bangers,Impact,sans-serif" font-size="46" fill="none" stroke="${INK}" stroke-width="2" transform="translate(-2,-2)">${f}</text></svg>`;
  if(f==='E')return `<svg viewBox="0 0 60 60"><path d="M36 4 L14 34 H28 L22 56 L48 22 H33 Z" fill="${INK}" transform="translate(2,2)"/><path d="M34 4 L12 34 H27 L22 56 L48 22 H32 Z" fill="#2ec27e" ${s}/><path d="M30 10 L20 26" stroke="#b9ffd8" stroke-width="3" stroke-linecap="round"/></svg>`;
  if(f==='H')return `<svg viewBox="0 0 60 60"><path d="M30 52 C8 36 4 24 10 15 C16 6 27 8 30 17 C33 8 44 6 50 15 C56 24 52 36 30 52 Z" fill="#e63946" ${s}/><path d="M15 18 C17 13 22 12 25 15" fill="none" stroke="#ffc2c7" stroke-width="3.5" stroke-linecap="round"/></svg>`;
  return `<svg viewBox="0 0 60 60"><g fill="none" ${s} stroke-width="7"><path d="M14 10 C22 22 22 38 12 52"/><path d="M29 6 C37 20 37 38 28 54"/><path d="M44 10 C52 22 52 38 42 52"/></g><g fill="none" stroke="#e63946" stroke-width="2.5" stroke-linecap="round"><path d="M14 10 C22 22 22 38 12 52"/><path d="M29 6 C37 20 37 38 28 54"/><path d="M44 10 C52 22 52 38 42 52"/></g></svg>`}
const shade=(d,o=.18)=>`<path d="${d}" fill="${INK}" opacity="${o}" stroke="none"/>`;
const shine=(x,y,rx,ry,r=-25)=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".45" transform="rotate(${r} ${x} ${y})" stroke="none"/>`;
function monArt(m,dead){const C=dead?'#b9b0bd':MONS[m].c;const S=`stroke="${INK}" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"`;
  const eye=(x,y,r=8,look=1.5)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" ${S}/><circle cx="${x+look}" cy="${y+1}" r="${r*.48}" fill="${INK}"/><circle cx="${x+look+1.5}" cy="${y-1.5}" r="${r*.17}" fill="#fff"/>`;
  const X=dead?`<g ${S} stroke-width="7"><path d="M-30 -30 L30 30 M30 -30 L-30 30" stroke="#e63946"/></g>`:'';
  const ground=`<ellipse cx="0" cy="60" rx="46" ry="7" fill="${INK}" opacity=".22"/>`;
  let a='';
  switch(m){
  case 0:a=`<g ${S}><path d="M-44 30 L-58 44 L-44 50 Z M44 30 L58 44 L44 50 Z" fill="${C}"/><path d="M-38 -26 L-52 -56 L-18 -40 Z M38 -26 L52 -56 L18 -40 Z" fill="${C}"/><path d="M-36 -32 L-44 -48 L-26 -38 Z M36 -32 L44 -48 L26 -38 Z" fill="#ffb3a7" stroke-width="2.5"/>
    <path d="M-48 8 C-50 -34 -26 -48 0 -48 C26 -48 50 -34 48 8 C46 40 26 56 0 56 C-26 56 -46 40 -48 8 Z" fill="${C}"/>${shade('M20 -44 C40 -34 50 -14 47 12 C44 38 26 54 4 55 C28 44 38 20 20 -44 Z')}${shine(-24,-26,12,7)}
    <path d="M-4 -52 L10 -52 L3 -38 L12 -38 L-6 -16 L-1 -32 L-10 -32 Z" fill="#4cc9f0"/>
    <path d="M-34 -16 L-12 -8 M34 -16 L12 -8" stroke-width="5"/>${eye(-20,-2)}${eye(20,-2)}
    <ellipse cx="0" cy="26" rx="23" ry="15" fill="#ffb3a7"/><ellipse cx="-8" cy="26" rx="3.5" ry="5" fill="${INK}" stroke="none"/><ellipse cx="8" cy="26" rx="3.5" ry="5" fill="${INK}" stroke="none"/>
    <path d="M-22 36 C-36 32 -42 16 -40 6 C-34 18 -26 24 -16 26 Z M22 36 C36 32 42 16 40 6 C34 18 26 24 16 26 Z" fill="#fff"/></g>`;break;
  case 1:a=`<g ${S}>${[-34,-17,0,17,34].map((x,k)=>`<path d="M${x*.7} 8 C${x} 30 ${x*1.3+(k%2?10:-10)} 38 ${x*1.1} 56" fill="none" stroke="${INK}" stroke-width="15"/><path d="M${x*.7} 8 C${x} 30 ${x*1.3+(k%2?10:-10)} 38 ${x*1.1} 56" fill="none" stroke="${C}" stroke-width="8"/>`).join('')}
    ${[-24,-8,8,24].map(x=>`<circle cx="${x*1.2}" cy="38" r="2.5" fill="#fff" stroke="none" opacity=".8"/>`).join('')}
    <path d="M0 -58 C30 -58 44 -22 40 14 L-40 14 C-44 -22 -30 -58 0 -58 Z" fill="${C}"/>${shade('M14 -54 C34 -44 42 -18 40 14 L22 14 C30 -10 28 -36 14 -54 Z')}${shine(-18,-38,10,6)}
    <circle cx="-26" cy="-2" r="4" fill="#e0c3ff" stroke-width="2"/><circle cx="26" cy="-4" r="3" fill="#e0c3ff" stroke-width="2"/>
    ${eye(0,-16,17)}<path d="M-20 -38 L-4 -32 M20 -38 L4 -32" stroke-width="5"/><path d="M-12 4 Q0 12 12 4" fill="none"/></g>`;break;
  case 2:a=`<g ${S}><path d="M-30 -4 C-44 -14 -52 -26 -48 -40 M30 -4 C44 -14 52 -26 48 -40" fill="none" stroke-width="8"/>
    <path d="M-48 -40 C-66 -44 -64 -64 -48 -62 L-44 -50 L-36 -60 C-26 -56 -30 -40 -48 -40 Z M48 -40 C66 -44 64 -64 48 -62 L44 -50 L36 -60 C26 -56 30 -40 48 -40 Z" fill="${C}"/>
    <path d="M-40 34 L-54 50 M-30 40 L-38 56 M40 34 L54 50 M30 40 L38 56" stroke-width="7"/>
    <ellipse cx="0" cy="18" rx="44" ry="28" fill="${C}"/>${shade('M10 -8 C36 -6 46 10 44 22 C40 40 20 46 0 46 C26 36 32 14 10 -8 Z')}${shine(-22,6,12,6)}
    <path d="M-26 12 L-16 20 L-20 30 M18 8 L26 18 L20 28 M-4 30 L4 36" fill="none" stroke="#ffd23f" stroke-width="3.5"/>
    <path d="M-12 -2 L-14 -22 M12 -2 L14 -22" stroke-width="5"/>${eye(-14,-26,8)}${eye(14,-26,8)}
    <path d="M-16 6 L-10 12 L-4 6 L2 12 L8 6 L14 12" fill="none" stroke-width="3.5"/></g>`;break;
  case 3:a=`<g ${S}><path d="M-32 30 L-44 40 M32 30 L44 40" stroke-width="8"/><rect x="-32" y="-8" width="64" height="62" rx="20" fill="${C}"/>${shade('M14 -6 C28 -4 32 8 32 20 L32 38 C32 48 26 54 14 54 C24 40 24 10 14 -6 Z')}
    <path d="M-58 2 C-58 -40 -28 -58 0 -58 C28 -58 58 -40 58 2 C40 8 -40 8 -58 2 Z" fill="#e63946"/>${shade('M24 -52 C46 -40 58 -20 58 2 C50 5 42 6 34 6 C40 -14 36 -36 24 -52 Z')}${shine(-26,-38,14,6)}
    <circle cx="-30" cy="-22" r="8" fill="#fff" stroke-width="3"/><circle cx="4" cy="-40" r="9" fill="#fff" stroke-width="3"/><circle cx="32" cy="-18" r="7" fill="#fff" stroke-width="3"/>
    <path d="M-24 14 L-8 20 M24 14 L8 20" stroke-width="5"/>${eye(-15,26,7)}${eye(15,26,7)}
    <path d="M-16 42 Q0 34 16 42 Z" fill="#fff" stroke-width="3.5"/></g>`;break;
  case 4:a=`<g ${S}><path d="M0 -40 L0 -54" /><circle cx="0" cy="-58" r="6" fill="#ffd23f"/>
    <path d="M-42 0 L-56 -10 L-60 6 M42 0 L56 -10 L60 6" fill="none" stroke-width="6"/>
    <rect x="-42" y="-40" width="84" height="76" rx="10" fill="${C}"/>${shade('M24 -40 H32 C38 -40 42 -36 42 -30 V26 C42 32 38 36 32 36 H24 Z')}${shine(-26,-30,10,4,0)}
    <rect x="-32" y="-26" width="64" height="22" rx="7" fill="${INK}"/>
    <rect x="-24" y="-20" width="16" height="10" rx="3" fill="#4cff9f" stroke="none"/><rect x="8" y="-20" width="16" height="10" rx="3" fill="#4cff9f" stroke="none"/>
    <rect x="-24" y="6" width="48" height="18" rx="4" fill="#dfe7f0"/><path d="M-12 6 V24 M0 6 V24 M12 6 V24" stroke-width="3"/>
    <circle cx="-34" cy="-32" r="3" fill="${INK}"/><circle cx="34" cy="-32" r="3" fill="${INK}"/><circle cx="-34" cy="28" r="3" fill="${INK}"/><circle cx="34" cy="28" r="3" fill="${INK}"/><rect x="-26" y="36" width="52" height="16" rx="4" fill="#ffd23f"/><path d="M-20 36 L-12 52 M-4 36 L4 52 M12 36 L20 52" stroke-width="4"/></g>`;break;
  case 5:a=`<g ${S}><path d="M-40 10 L-58 -2 L-52 22 Z M40 10 L58 -2 L52 22 Z" fill="${C}"/><path d="M0 -60 L34 -32 L44 18 L22 56 L-22 56 L-44 18 L-34 -32 Z" fill="${C}"/>${shade('M0 -60 L34 -32 L44 18 L22 56 L8 56 L20 14 Z',.15)}
    <path d="M0 -60 L-8 -18 L-34 -32 M-8 -18 L10 -4 L34 -32 M10 -4 L44 18 M-8 -18 L-44 18" fill="none" stroke="#fff" stroke-width="2.5" opacity=".8"/>${shine(-18,-30,8,5)}
    <path d="M-28 -6 L-6 0 L-8 -12 Z M28 -6 L6 0 L8 -12 Z" fill="#fff"/><circle cx="-12" cy="-5" r="3" fill="#4cc9f0" stroke="none"/><circle cx="12" cy="-5" r="3" fill="#4cc9f0" stroke="none"/>
    <path d="M-20 24 L20 24 L14 38 L8 26 L2 40 L-4 26 L-10 38 L-16 26 Z" fill="#fff" stroke-width="3"/></g>`;break;
  case 6:a=`<g ${S}>${[-30,-12,12,30].map((x,k)=>`<path d="M${x*.8} 16 C${x} 34 ${x*1.4} 40 ${x*1.2+(k<2?-6:6)} 54" fill="none" stroke="${INK}" stroke-width="13"/><path d="M${x*.8} 16 C${x} 34 ${x*1.4} 40 ${x*1.2+(k<2?-6:6)} 54" fill="none" stroke="#c45a9a" stroke-width="7"/>`).join('')}
    <path d="M-18 -44 C-26 -58 -34 -62 -40 -66 M18 -44 C26 -58 34 -62 40 -66" fill="none" stroke-width="4"/><circle cx="-40" cy="-66" r="6" fill="#ffd23f"/><circle cx="40" cy="-66" r="6" fill="#ffd23f"/>
    <path d="M-46 12 C-54 -28 -26 -54 0 -54 C26 -54 54 -28 46 12 C30 22 -30 22 -46 12 Z" fill="${C}"/>${shade('M16 -50 C40 -40 52 -18 46 12 C38 16 30 18 22 19 C34 -4 32 -30 16 -50 Z')}
    <path d="M-30 -30 C-22 -40 -12 -30 -4 -40 M6 -44 C14 -36 22 -46 30 -36 M-36 -8 C-28 -16 -20 -6 -12 -14 M14 -14 C22 -6 30 -16 38 -8" fill="none" stroke="#c45a9a" stroke-width="3.5"/>${shine(-20,-34,10,5)}
    <circle cx="-15" cy="2" r="10" fill="#fff"/><circle cx="15" cy="2" r="10" fill="#fff"/><path d="M-15 2 m-6 0 a6 6 0 1 1 6 6 a3 3 0 1 1 -3 -3 M15 2 m-6 0 a6 6 0 1 1 6 6 a3 3 0 1 1 -3 -3" fill="none" stroke="#9b5de5" stroke-width="2.5"/></g>`;break;
  case 7:a=`<g ${S}>${[[-38,38],[-18,46],[4,48],[26,44],[44,34]].map(([x,y])=>`<path d="M${x} ${y} L${x-6} ${y+14} M${x} ${y} L${x+6} ${y+14}" stroke-width="4"/><circle cx="${x}" cy="${y}" r="13" fill="${C}"/><path d="M${x-8} ${y-5} Q${x} ${y-12} ${x+8} ${y-5}" fill="none" stroke="#b6fff0" stroke-width="3"/>`).join('')}
    <path d="M-44 4 C-44 30 44 30 44 4 Z" fill="#f2e4c9"/>${shade('M18 6 H44 C44 18 36 26 24 28 C30 20 28 12 18 6 Z')}
    <rect x="-40" y="-6" width="80" height="14" rx="6" fill="${INK}"/>${eye(-16,-1,6)}${eye(16,-1,6)}<path d="M-6 6 L-2 12 L2 6 L6 12" fill="none" stroke="#fff" stroke-width="2.5"/>
    <path d="M-44 -6 C-44 -48 44 -48 44 -6 Z" fill="#f2e4c9"/><path d="M-30 -10 L-22 -38 M-12 -10 L-8 -42 M8 -10 L6 -42 M26 -10 L22 -38" fill="none" stroke-width="3" stroke="#b39b76"/>${shine(-24,-28,10,5)}
    <circle cx="36" cy="-24" r="5" fill="#fff" stroke-width="2.5"/></g>`;break;
  default:a=`<g ${S}><path d="M-22 -4 C-40 -30 -58 -26 -64 -10 L-56 -4 L-60 8 L-48 6 L-46 18 L-26 12 Z M22 -4 C40 -30 58 -26 64 -10 L56 -4 L60 8 L48 6 L46 18 L26 12 Z" fill="#3f7d3a"/>
    <path d="M-50 -12 L-30 4 M50 -12 L30 4" stroke="#9ad35a" stroke-width="2.5" fill="none"/>
    <path d="M-26 -30 L-34 -58 L-12 -40 Z M26 -30 L34 -58 L12 -40 Z" fill="${C}"/>
    <ellipse cx="0" cy="8" rx="32" ry="40" fill="${C}"/>${shade('M12 -30 C28 -20 32 0 32 12 C30 34 18 46 4 48 C22 32 24 -4 12 -30 Z')}${shine(-14,-18,9,5)}
    ${[[-30,26],[-20,42],[28,20],[18,40],[0,-32]].map(([x,y])=>`<path d="M${x} ${y} l-5 5 l10 0 Z" fill="#6b3f22" stroke-width="2"/>`).join('')}
    <circle cx="-12" cy="-6" r="8" fill="#ff5a5f"/><circle cx="12" cy="-6" r="8" fill="#ff5a5f"/><circle cx="-11" cy="-7" r="3" fill="${INK}" stroke="none"/><circle cx="13" cy="-7" r="3" fill="${INK}" stroke="none"/>
    <path d="M-14 12 Q0 22 14 12" fill="none"/><path d="M-8 14 L-5 24 L-2 15 M8 14 L5 24 L2 15" fill="#fff" stroke-width="2.5"/></g>`}
  return ground+a+X}

function skyline(){let s='';const b=[[0,210,70],[64,170,56],[114,240,62],[170,190,48],[212,150,70],[276,205,40],[312,120,58],[640,160,60],[694,215,48],[736,130,70],[800,185,54],[848,145,66],[908,200,50],[952,165,48]];
  for(const [x,y,w] of b){s+=`<rect x="${x}" y="${y}" width="${w}" height="${400-y}" fill="#5b2a6e" stroke="${INK}" stroke-width="3"/><rect x="${x+w-10}" y="${y}" width="10" height="${400-y}" fill="${INK}" opacity=".25"/><rect x="${x-3}" y="${y-6}" width="${w+6}" height="8" fill="#4a1f5a" stroke="${INK}" stroke-width="3"/>`;
    for(let yy=y+14;yy<380;yy+=22)for(let xx=x+8;xx<x+w-12;xx+=16)if((xx*7+yy*3)%5)s+=`<rect x="${xx}" y="${yy}" width="7" height="10" fill="${(xx+yy)%3?'#ffd23f':'#3b1a4a'}"/>`}
  s+=`<g stroke="${INK}" stroke-width="3"><path d="M341 120 V70 M341 70 L336 84 H346 Z" fill="#e63946"/><circle cx="765" cy="118" r="5" fill="#e63946"/></g>`;
  return s}
function clouds(){return [[140,60,1],[560,44,.8],[880,70,1.1]].map(([x,y,s])=>`<g transform="translate(${x},${y}) scale(${s})" opacity=".9"><path d="M-40 10 C-50 -6 -30 -18 -18 -10 C-12 -26 14 -26 18 -10 C32 -18 50 -6 40 10 Z" fill="#fff" stroke="${INK}" stroke-width="3"/></g>`).join('')}
function statBadge(x,y,kind,val){const col={hp:'#e63946',vp:'#f4a300',en:'#2ec27e',mb:'#ff8fc7'}[kind];
  const icon=kind==='hp'?`<path d="M0 8 C-9 1 -10 -4 -7 -7 C-4 -10 -1 -8 0 -5 C1 -8 4 -10 7 -7 C10 -4 9 1 0 8 Z" fill="#fff"/>`:kind==='vp'?`<path d="M0 -9 L2.6 -3 L9 -2.6 L4 1.6 L5.6 8 L0 4.6 L-5.6 8 L-4 1.6 L-9 -2.6 L-2.6 -3 Z" fill="#fff"/>`:kind==='mb'?brainIcon(0,0,.5,'#fff'):`<path d="M2 -9 L-6 1 H0 L-2 9 L6 -1 H0 Z" fill="#fff"/>`;
  return `<g transform="translate(${x},${y})"><rect x="-22" y="-13" width="44" height="26" rx="13" fill="${col}" stroke="${INK}" stroke-width="3"/><g transform="translate(-10,0)">${icon}</g><text x="9" y="7" text-anchor="middle" font-family="Bangers,Impact,sans-serif" font-size="19" fill="#fff" stroke="${INK}" stroke-width="3" paint-order="stroke">${val}</text></g>`}
function brainIcon(x,y,s,fill){return `<g transform="translate(${x},${y}) scale(${s})"><path d="M-14 6 C-20 0 -16 -12 -8 -12 C-6 -18 6 -18 8 -12 C16 -12 20 0 14 6 C12 14 -12 14 -14 6 Z" fill="${fill||'#ff8fc7'}" stroke="${INK}" stroke-width="3"/><path d="M0 -12 V10 M-8 -4 C-4 -2 -4 4 -8 6 M8 -4 C4 -2 4 4 8 6" fill="none" stroke="${INK}" stroke-width="2"/></g>`}
function burst(x,y,r,fill){let d='';for(let k=0;k<24;k++){const a=k*Math.PI/12,rr=k%2?r*.72:r;d+=(k?'L':'M')+(x+Math.cos(a)*rr).toFixed(1)+' '+(y+Math.sin(a)*rr).toFixed(1)}return `<path d="${d}Z" fill="${fill}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>`}
// small icon for a power card
function cardIcon(id){const b=base(id),C=CARDS[b];const x=C.x;let k='dice';
  if(/Mindbug/.test(x))k='brain';else if(C.kws)k=C.kws[0];else if(/loses? \d+ hearts?|smash|damage/.test(x))k='claw';else if(/[Hh]eal/.test(x))k='heart';else if(/energy/.test(x)&&!/star/.test(x))k='bolt';else if(/star/.test(x))k='star';
  const S=`stroke="${INK}" stroke-width="3" stroke-linejoin="round"`;
  const g={brain:brainIcon(0,0,1),star:`<path d="M0 -16 L4.6 -5.4 L16 -4.6 L7 3 L10 14 L0 8 L-10 14 L-7 3 L-16 -4.6 L-4.6 -5.4 Z" fill="#f4a300" ${S}/>`,
   heart:`<path d="M0 14 C-16 2 -18 -6 -12 -11 C-6 -16 -1 -12 0 -7 C1 -12 6 -16 12 -11 C18 -6 16 2 0 14 Z" fill="#e63946" ${S}/>`,
   bolt:`<path d="M4 -16 L-10 2 H0 L-4 16 L10 -2 H0 Z" fill="#2ec27e" ${S}/>`,
   claw:`<g fill="none" ${S} stroke-width="4"><path d="M-9 -12 C-4 -4 -4 6 -10 14"/><path d="M0 -14 C5 -4 5 6 0 16"/><path d="M9 -12 C14 -4 14 6 8 14"/></g>`,
   dice:`<rect x="-13" y="-13" width="26" height="26" rx="5" fill="#fff" ${S}/><circle cx="-5" cy="-5" r="2.5" fill="${INK}"/><circle cx="5" cy="5" r="2.5" fill="${INK}"/><circle cx="0" cy="0" r="2.5" fill="${INK}"/>`,
   Hunter:`<circle r="13" fill="#fff" ${S}/><circle r="6" fill="none" ${S}/><path d="M0 -18 V-8 M0 8 V18 M-18 0 H-8 M8 0 H18" ${S}/>`,
   Sneaky:`<path d="M-15 0 C-8 -10 8 -10 15 0 C8 10 -8 10 -15 0 Z" fill="#fff" ${S}/><circle r="4.5" fill="${INK}"/><path d="M-14 12 L14 -12" ${S}/>`,
   Poison:`<path d="M0 -15 C8 -4 12 2 12 7 C12 14 6 17 0 17 C-6 17 -12 14 -12 7 C-12 2 -8 -4 0 -15 Z" fill="#7ee04c" ${S}/>`,
   Frenzy:`<path d="M-14 8 L-6 -14 L0 2 L6 -14 L14 8" fill="none" ${S} stroke-width="4"/><path d="M-10 14 H10" ${S}/>`,
   Tough:`<path d="M0 -16 L14 -10 V2 C14 10 6 15 0 17 C-6 15 -14 10 -14 2 V-10 Z" fill="#8ecae6" ${S}/>`}[k]||'';
  return `<svg viewBox="-20 -20 40 40" class="cicon" aria-hidden="true">${g}</svg>`}

function renderMap(){const svg=document.getElementById('map');if(!G){svg.innerHTML='';return}
  let s=`<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff6f61"/><stop offset=".6" stop-color="#ffb347"/><stop offset="1" stop-color="#ffd98a"/></linearGradient>
  <radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff7c2"/><stop offset="1" stop-color="#ffd23f"/></radialGradient>
  <pattern id="ht" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="5" cy="5" r="1.8" fill="#1a1320" opacity=".12"/></pattern>
  <pattern id="waves" width="40" height="16" patternUnits="userSpaceOnUse"><path d="M0 8 Q10 0 20 8 T40 8" fill="none" stroke="#fff" stroke-width="2.5" opacity=".55"/></pattern></defs>
  <rect width="1000" height="640" fill="url(#sky)"/>`;
  for(let k=0;k<16;k++){const a=k*Math.PI/8;s+=`<path d="M465 230 L${465+Math.cos(a)*900} ${230+Math.sin(a)*900} L${465+Math.cos(a+.12)*900} ${230+Math.sin(a+.12)*900} Z" fill="#fff" opacity=".13"/>`}
  s+=`<rect width="1000" height="640" fill="url(#ht)"/>${clouds()}${skyline()}<rect x="0" y="380" width="1000" height="260" fill="#3b2447"/><rect x="0" y="380" width="1000" height="260" fill="url(#ht)"/><path d="M0 384 H1000" stroke="#ffd23f" stroke-width="3" stroke-dasharray="18 14" opacity=".6"/>`;
  const act=cur();
  s+=`<g><rect x="306" y="102" width="330" height="270" rx="16" fill="${INK}"/><rect x="300" y="96" width="330" height="270" rx="16" fill="#fff3cf" stroke="${INK}" stroke-width="5"/><rect x="300" y="96" width="330" height="270" rx="16" fill="url(#ht)"/>
   <path d="M318 350 L318 318 L612 318 L612 350" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="8 6"/>
   <g transform="translate(465,96) rotate(-2)"><rect x="-96" y="-22" width="192" height="40" rx="8" fill="#e63946" stroke="${INK}" stroke-width="4"/><text x="0" y="10" text-anchor="middle" font-family="Bangers,Impact,sans-serif" font-size="30" fill="#ffd23f" stroke="${INK}" stroke-width="3" paint-order="stroke" letter-spacing="2">DOWNTOWN</text></g>`;
  if(G.city>=0){const o=P(G.city);s+=`${burst(465,240,96,'url(#glow)')}<g transform="translate(465,240) scale(1.25)">${monArt(o.m)}</g>
     <path d="M438 170 L446 150 L456 162 L465 144 L474 162 L484 150 L492 170 Z" fill="#f4a300" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/><circle cx="465" cy="160" r="3.5" fill="#e63946" stroke="${INK}" stroke-width="2"/>
     <text x="465" y="352" text-anchor="middle" font-family="Bangers,Impact,sans-serif" font-size="26" fill="${INK}">${esc(mname(o))} rules the city</text>`}
  else s+=`<text x="465" y="225" text-anchor="middle" font-family="Bangers,Impact,sans-serif" font-size="34" fill="${INK}" opacity=".55">EMPTY!</text><text x="465" y="258" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="16" fill="${INK}" opacity=".6">The next monster to finish rolling must move in</text>`;
  s+=`<text x="465" y="134" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="12.5" fill="${INK}" opacity=".7">+1★ on entering · +2★ each turn start · no healing</text></g>`;
  s+=`<g><rect x="666" y="156" width="310" height="216" rx="16" fill="${INK}"/><rect x="660" y="150" width="310" height="216" rx="16" fill="${G.bayOn?'#3aa6d9':'#8aa6b5'}" stroke="${INK}" stroke-width="5"/><rect x="660" y="150" width="310" height="216" rx="16" fill="url(#waves)"/>
   <g transform="translate(815,150) rotate(2)"><rect x="-70" y="-20" width="140" height="36" rx="8" fill="#3a86ff" stroke="${INK}" stroke-width="4"/><text x="0" y="9" text-anchor="middle" font-family="Bangers,Impact,sans-serif" font-size="26" fill="#fff" stroke="${INK}" stroke-width="3" paint-order="stroke" letter-spacing="2">HARBOR</text></g>`;
  if(G.bayOn&&G.bay>=0){const o=P(G.bay);s+=`<g transform="translate(815,258)">${monArt(o.m)}</g><text x="815" y="354" text-anchor="middle" font-family="Bangers,Impact,sans-serif" font-size="22" fill="#fff" stroke="${INK}" stroke-width="3" paint-order="stroke">${esc(mname(o))} holds the harbor</text>`}
  else s+=`<text x="815" y="258" text-anchor="middle" font-family="Bangers,Impact,sans-serif" font-size="24" fill="#fff" stroke="${INK}" stroke-width="3" paint-order="stroke">${G.bayOn?'EMPTY':'CLOSED'}</text><text x="815" y="284" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="14" fill="#fff">${G.bayOn?'Counts as the city too':'Opens with 5–6 monsters'}</text>`;
  s+=`</g>`;
  // round + dice panel
  s+=`<g><rect x="36" y="102" width="245" height="270" rx="16" fill="${INK}"/><rect x="30" y="96" width="245" height="270" rx="16" fill="#fff3cf" stroke="${INK}" stroke-width="5"/>
   <text x="152" y="132" text-anchor="middle" font-family="Bangers,Impact,sans-serif" font-size="28" fill="#e63946" stroke="${INK}" stroke-width="1.2" letter-spacing="1">ROUND ${G.turn}</text>
   <g transform="translate(78,190) scale(.62)">${monArt(act.m)}</g>
   <text x="118" y="176" font-family="Bangers,Impact,sans-serif" font-size="22" fill="${INK}">${esc(mname(act))}</text>
   <text x="118" y="198" font-family="Nunito,sans-serif" font-weight="800" font-size="14" fill="${INK}">${G.winner?'Game over':['','is rolling…','is resolving…','is resolving…','is shopping…','ends its turn'][G.step]||'…'}</text>
   <text x="118" y="218" font-family="Nunito,sans-serif" font-weight="800" font-size="13" fill="${INK}" opacity=".7">${G.phase==='roll'?G.rolls+' reroll'+(G.rolls===1?'':'s')+' left':''}</text>`;
  const nd=G.dice.length,cols=nd>6?4:3,sz=nd>6?46:54;
  G.dice.forEach((d,k)=>{const x=48+(k%cols)*(sz+(nd>6?8:18)),y=236+Math.floor(k/cols)*(sz+6);s+=`<g transform="translate(${x},${y})"><rect x="3" y="3" width="${sz}" height="${sz}" rx="9" fill="${INK}"/><rect width="${sz}" height="${sz}" rx="9" fill="${d.k?'#ffd23f':'#fff'}" stroke="${d.x?'#2ec27e':INK}" stroke-width="3.5"/><g transform="translate(4,4) scale(${(sz-8)/60})">${faceSVG(d.f).replace('<svg viewBox="0 0 60 60">','').replace('</svg>','')}</g></g>`});
  s+=`</g>`;
  // seats
  const n=G.pl.length,gap=12,w=Math.min(150,(940-(n-1)*gap)/n),x0=500-(n*w+(n-1)*gap)/2;
  G.pl.forEach((p,k)=>{const x=x0+k*(w+gap),y=400,h=226,cx=x+w/2,A=k===G.active&&!G.winner,T=inTokyo(p.i);
    s+=`<g class="seat" data-seat="${k}">`;
    if(A)s+=`<rect x="${x-6}" y="${y-6}" width="${w+12}" height="${h+12}" rx="18" fill="#ffd23f" stroke="${INK}" stroke-width="3"/>`;
    s+=`<rect x="${x+4}" y="${y+4}" width="${w}" height="${h}" rx="14" fill="${INK}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${p.alive?'#fffaf0':'#9c93a3'}" stroke="${INK}" stroke-width="4"/>
      <rect x="${x}" y="${y}" width="${w}" height="96" rx="14" fill="${p.alive?MONS[p.m].c:'#b9b0bd'}" stroke="${INK}" stroke-width="4"/><rect x="${x}" y="${y}" width="${w}" height="96" rx="14" fill="url(#ht)"/>
      <g transform="translate(${cx},${y+48}) scale(.64)" opacity="${T?.35:1}">${monArt(p.m,!p.alive)}</g>`;
    if(T)s+=`<g transform="translate(${cx},${y+50}) rotate(-8)"><rect x="-58" y="-13" width="116" height="26" rx="6" fill="#e63946" stroke="${INK}" stroke-width="3"/><text x="0" y="6" text-anchor="middle" font-family="Bangers,Impact,sans-serif" font-size="15" fill="#fff" letter-spacing="1" textLength="100" lengthAdjust="spacingAndGlyphs">${G.city===p.i?'IN DOWNTOWN':'IN HARBOR'}</text></g>`;
    if(p.human&&G.mode==='solo')s+=`<g transform="translate(${x+8},${y+8}) rotate(-8)"><rect width="44" height="22" rx="6" fill="#1a1320"/><text x="22" y="16" text-anchor="middle" font-family="Bangers,Impact,sans-serif" font-size="15" fill="#ffd23f" letter-spacing="1">YOU</text></g>`;
    if(p.alive&&mbOn()&&p.mb>0)s+=`<g transform="translate(${x+w-20},${y+18})">${brainIcon(0,0,.9)}<text x="0" y="5" text-anchor="middle" font-family="Bangers,Impact,sans-serif" font-size="13" fill="${INK}">${p.mb}</text></g>`;
    s+=`<text x="${cx}" y="${y+120}" text-anchor="middle" font-family="Bangers,Impact,sans-serif" font-size="${w<120?18:22}" fill="${INK}" letter-spacing="1">${esc(mname(p))}</text>`;
    if(p.alive){const bw=w/3.1;s+=statBadge(cx-bw,y+146,'hp',p.hp)+statBadge(cx,y+146,'vp',p.vp)+statBadge(cx+bw,y+146,'en',p.en);
      const pw=w-20;s+=`<rect x="${x+10}" y="${y+168}" width="${pw}" height="10" rx="5" fill="#fff" stroke="${INK}" stroke-width="2.5"/><rect x="${x+10}" y="${y+168}" width="${pw*Math.min(1,p.vp/20)}" height="10" rx="5" fill="#f4a300" stroke="${INK}" stroke-width="2.5"/>`;
      const extra=[p.cards.length+' card'+(p.cards.length===1?'':'s')];if(G.evoOn)extra.push(p.hand.length+p.evo.length+' evo');if(p.tok.shield)extra.push('wings');if(p.tok.tough)extra.push('tough');
      s+=`<text x="${cx}" y="${y+198}" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="800" font-size="13" fill="${INK}">${extra.join(' · ')}</text>`;
      s+=`<text x="${cx}" y="${y+216}" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="700" font-size="11.5" fill="${INK}" opacity=".7">${[...p.cards.map(c=>CARDS[base(c)].n),...p.evo.map(evoName)].slice(0,2).map(esc).join(', ')}${p.cards.length+p.evo.length>2?'…':''}</text>`}
    else s+=`<text x="${cx}" y="${y+170}" text-anchor="middle" font-family="Bangers,Impact,sans-serif" font-size="34" fill="#e63946" stroke="${INK}" stroke-width="2" letter-spacing="2">K.O.</text>`;
    const f=UI.fx[k]||[];f.slice(-3).forEach((e,j)=>{const col={hurt:'#e63946',heal:'#2ec27e',star:'#f4a300',energy:'#2ec27e'}[e.c]||'#fff';
      s+=`<g transform="translate(${x+w-8},${y+40+j*26}) rotate(${j%2?6:-6})"><text text-anchor="end" font-family="Bangers,Impact,sans-serif" font-size="22" fill="${col}" stroke="${INK}" stroke-width="4" paint-order="stroke">${esc(e.t)}</text></g>`});
    s+=`</g>`});
  if(G.winner){const w=G.winner==='draw'?null:P(+G.winner.slice(1)-1);s+=`<g>${burst(500,230,190,'url(#glow)')}${w?`<g transform="translate(500,215) scale(1.5)">${monArt(w.m)}</g>`:''}<text x="500" y="345" text-anchor="middle" font-family="Bangers,Impact,sans-serif" font-size="46" fill="#e63946" stroke="${INK}" stroke-width="3" paint-order="stroke" letter-spacing="2">${w?esc(mname(w).toUpperCase())+' WINS!':'NOBODY WINS'}</text></g>`}
  svg.innerHTML=s}
