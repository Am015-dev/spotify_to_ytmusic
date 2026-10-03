// ---------- illustrated card art: every picture is painted as layered, shaded SVG from a seed (no image files) ----------
// Shared gradients and the icon set live in one hidden <svg> defs block; each card's art only references them.
(function(){
const INK='#22151a';
// painted palette (body colours); each gets a shaded radial gradient "mg<i>"
const PAL=['#d8493c','#e7883b','#e8bd45','#6aa84a','#3aa28c','#3c7cc0','#7a5ac2','#cf628d','#9cba3d','#4db0c6','#b3553e','#8b6c4e'];
function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function prng(seed){let t=seed>>>0;return()=>{t+=0x6D2B79F5;let r=Math.imul(t^t>>>15,t|1);r^=r+Math.imul(r^r>>>7,r|61);return((r^r>>>14)>>>0)/4294967296}}
const f=n=>Math.round(n*10)/10;
function rgb(h){h=h.replace('#','');return [0,2,4].map(i=>parseInt(h.substr(i,2),16))}
function mix(a,b,t){const A=rgb(a),B=rgb(b);return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('')}
const lt=(c,t)=>mix(c,'#fff4e0',t),dk=(c,t)=>mix(c,'#12060a',t);
// path helpers: outer contour is heavy, inner detail is light
const P=(d,fill,w,x)=>`<path d="${d}" fill="${fill||'none'}" stroke="${INK}" stroke-width="${w==null?2.6:w}" stroke-linejoin="round" stroke-linecap="round"${x?' '+x:''}/>`;
const L=(d,col,w,op)=>`<path d="${d}" fill="none" stroke="${col||INK}" stroke-width="${w||1.4}" stroke-linecap="round" stroke-linejoin="round"${op!=null?` opacity="${op}"`:''}/>`;
const C=(x,y,r,fill,w,x2)=>`<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}"${w?` stroke="${INK}" stroke-width="${w}"`:''}${x2?' '+x2:''}/>`;
const E=(x,y,rx,ry,fill,x2)=>`<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${fill}"${x2?' '+x2:''}/>`;
const shadow=(y,rx)=>E(0,y||47,rx||32,(rx||32)*.17,'url(#gShadow)');
const gloss=(x,y,rx,ry,rot)=>`<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="url(#gGloss)" transform="rotate(${rot||-25} ${f(x)} ${f(y)})"/>`;
const pi=(r)=>Math.floor(r()*PAL.length);
const G=i=>`url(#mg${i})`;
// ---- eyes, mouths ----
function eye(x,y,s,o){o=o||{};const iris=o.iris||'#f4d24a';let h=`<g>`+C(x,y,s,'url(#gEye)',Math.max(1.6,s*.26));
  if(o.slit)h+=E(x+s*.1,y+s*.05,s*.62,s*.8,iris)+E(x+s*.1,y+s*.05,s*.14,s*.66,INK);
  else h+=C(x+(o.look||0)*s*.35,y+s*.15,s*.56,iris)+C(x+(o.look||0)*s*.35,y+s*.15,s*.3,INK);
  h+=C(x-s*.28,y-s*.3,s*.2,'#fff');
  if(o.lid)h+=P(`M${f(x-s*1.05)},${f(y-s*.1)} Q${f(x)},${f(y-s*1.4)} ${f(x+s*1.05)},${f(y-s*.1)} Q${f(x)},${f(y-s*.35)} ${f(x-s*1.05)},${f(y-s*.1)}Z`,o.lid,Math.max(1.4,s*.22));
  if(o.brow)h+=L(`M${f(x-s*1.1)},${f(y-s*1.25+(o.brow>0?-s*.3:s*.2))} L${f(x+s*1.0)},${f(y-s*1.25+(o.brow>0?s*.35:-s*.3))}`,INK,Math.max(2,s*.4));
  return h+'</g>'}
function eyes(r,n,cx,cy,s,o){let h='';const gap=s*2.35;for(let i=0;i<n;i++){const x=cx+(i-(n-1)/2)*gap;h+=eye(x,cy+(n>2&&i%2?-s*.5:0),s,Object.assign({look:(r()-.5)*1.2,brow:o&&o.angry?(x<cx?1:-1)*(1):0},o||{}))}return h}
function mouth(cx,cy,w,h,teeth,o){o=o||{};const d=`M${f(cx-w)},${f(cy)} Q${f(cx)},${f(cy+h*2)} ${f(cx+w)},${f(cy)} Q${f(cx)},${f(cy+h*.5)} ${f(cx-w)},${f(cy)}Z`;
  let s=P(d,'url(#gMouth)',2.4);if(o.tongue)s+=E(cx+w*.2,cy+h*1.05,w*.38,h*.35,'#e0607a');
  for(let i=0;i<teeth;i++){const t=(i+.5)/teeth,tx=cx-w+2*w*t;const ty=cy+h*.5*(1-Math.pow(2*t-1,2))*0.5;const tw=Math.min(3.4,w/teeth*.85),th=o.fang&&(i===0||i===teeth-1)?h*.9:h*.55;
    s+=P(`M${f(tx-tw)},${f(ty-.5)} L${f(tx)},${f(ty+th)} L${f(tx+tw)},${f(ty-.5)}Z`,'#fffbe8',1.1)}
  return s}
function horns(r,cx,cy,sp,len,fill){const a=`M${f(cx-sp)},${f(cy)} Q${f(cx-sp-len*.7)},${f(cy-len*.5)} ${f(cx-sp-len*.35)},${f(cy-len*1.1)} Q${f(cx-sp+len*.05)},${f(cy-len*.5)} ${f(cx-sp+len*.35)},${f(cy+2)}Z`;
  const b=`M${f(cx+sp)},${f(cy)} Q${f(cx+sp+len*.7)},${f(cy-len*.5)} ${f(cx+sp+len*.35)},${f(cy-len*1.1)} Q${f(cx+sp-len*.05)},${f(cy-len*.5)} ${f(cx+sp-len*.35)},${f(cy+2)}Z`;
  return P(a,fill||'url(#gBone)',2.2)+P(b,fill||'url(#gBone)',2.2)+L(`M${f(cx-sp-len*.25)},${f(cy-len*.45)} l4,1.5 M${f(cx+sp+len*.25)},${f(cy-len*.45)} l-4,1.5`,dk('#e8dcc0',.4),1.2)}
function aura(lvl,col){if(lvl<12)return '';return `<circle cx="0" cy="-2" r="${lvl>=16?54:46}" fill="url(#gAura)" opacity="${lvl>=16?.9:.6}"/>`}
function backdropDungeon(r){// a stone arch behind the monster, very low contrast (vignetted by the card window)
  let h=`<path d="M-58,50 L-58,-6 Q-58,-58 0,-58 Q58,-58 58,-6 L58,50Z" fill="url(#gArch)"/>`;
  for(let i=0;i<7;i++){const a=Math.PI*(1-i/6);h+=L(`M${f(Math.cos(a)*44)},${f(-6-Math.sin(a)*44)} L${f(Math.cos(a)*58)},${f(-6-Math.sin(a)*58)}`,'#000',1.2,.25)}
  h+=L('M-44,-6 L-44,50 M44,-6 L44,50','#000',1.2,.22)+L('M-58,18 L-44,18 M44,30 L58,30 M-58,40 L-44,40 M44,6 L58,6','#000',1,.2);
  return h+`<rect x="-60" y="38" width="120" height="22" fill="url(#gFloor)"/>`}
// ---- monster archetypes ----
function mBlob(r,c,lvl,o){const s=1+Math.min(lvl,20)*.012;const w=34*s,top=-34*s;
  const d=`M${f(-w)},40 C${f(-w-6)},8 ${f(-w*.8)},${f(top)} 0,${f(top)} C${f(w*.8)},${f(top)} ${f(w+6)},8 ${f(w)},40 Q${f(w*.6)},46 ${f(w*.3)},40 Q${f(w*.1)},48 ${f(-w*.15)},41 Q${f(-w*.55)},47 ${f(-w)},40Z`;
  let h=shadow(47,w+4)+P(d,G(c),3.4);
  h+=E(0,22,w*.62,12,lt(PAL[c],.35),'opacity=".55"');
  for(let i=0;i<4;i++)h+=C((r()-.5)*w*1.3,4+r()*26,1.5+r()*2.4,lt(PAL[c],.6),0,'opacity=".7"');
  h+=L(`M${f(w*.55)},${f(30)} q3,6 0,11`,dk(PAL[c],.35),2);
  h+=gloss(-w*.45,top*.55,w*.24,w*.12,-40);
  const n=o.eyes||1+Math.floor(r()*3);h+=eyes(r,n,0,top*.35,n===1?10.5:6.8,{angry:lvl>=8,iris:o.iris});
  h+=mouth(0,top*.35+16,w*.55,8,Math.min(9,3+Math.floor(lvl/2.5)),{tongue:r()<.5,fang:lvl>=6});
  return h}
function mImp(r,c,lvl,o){let h=shadow(48,26);const skin=G(c),c2=pi(r);
  // body with tunic
  h+=P('M-18,46 L-20,20 Q-20,8 0,8 Q20,8 20,20 L18,46 Q0,50 -18,46Z',G(c2),2.8)+L('M-18,30 Q0,36 18,30',dk(PAL[c2],.4),1.6);
  h+=L('M-20,16 Q-34,24 -30,38',INK,6.5)+L('M-20,16 Q-34,24 -30,38',PAL[c],4);
  h+=L('M20,16 Q34,22 32,36',INK,6.5)+L('M20,16 Q34,22 32,36',PAL[c],4);
  // ears
  h+=P('M-22,-14 L-48,-30 L-28,-2Z',skin,2.6)+P('M22,-14 L48,-30 L28,-2Z',skin,2.6)+L('M-26,-12 L-40,-24 M26,-12 L40,-24',dk(PAL[c],.35),1.4);
  if(o.horns||lvl>=6)h+=horns(r,0,-30,12,16);
  h+=P('M-25,-8 C-27,-36 -14,-42 0,-42 C14,-42 27,-36 25,-8 C24,10 12,16 0,16 C-12,16 -24,10 -25,-8Z',skin,3);
  h+=gloss(-12,-30,8,4,-30);
  h+=eyes(r,2,0,-16,6.3,{angry:true,iris:o.iris||'#ffd23e'});
  h+=P('M-3,-8 Q0,-3 4,-7',dk(PAL[c],.2),1.8);
  h+=mouth(0,1,13,5,4,{fang:true,tongue:r()<.4});
  if(o.acc==='glasses')h+=`<g>${C(-8,-16,8.5,'rgba(200,230,255,.25)',2.4)+C(8,-16,8.5,'rgba(200,230,255,.25)',2.4)}${L('M-0.5,-16 L0.5,-16',INK,2.4)}</g>`;
  if(o.acc==='tie')h+=P('M-4,9 L4,9 L2,14 L6,34 L0,40 L-6,34 L-2,14Z','url(#mg0)',1.6);
  if(o.acc==='helmet')h+=P('M-27,-18 C-28,-44 28,-44 27,-18 Z','url(#gSteel)',2.6)+P('M-30,-20 L30,-20 L28,-14 L-28,-14Z','url(#gSteel)',2)+horns(r,0,-30,20,14);
  if(o.acc==='hat')h+=P('M-24,-34 L24,-34 L14,-40 L6,-62 Q0,-54 -12,-48Z',G(c2),2.4)+C(-12,-48,2.5,'url(#gGold)',1);
  if(o.acc==='crown')h+=P('M-18,-38 L-18,-50 L-9,-43 L0,-54 L9,-43 L18,-50 L18,-38Z','url(#gGold)',2);
  if(o.acc==='shell')h+=P('M-10,-12 q10,-8 20,0',INK,2);
  return h}
function mSkull(r,c,lvl,o){let h=shadow(48,30);const glow=o.glow||'#7cf0a0';
  if(o.mummy){h+=P('M-24,46 L-26,12 Q-26,4 0,4 Q26,4 26,12 L24,46Z','url(#gCloth)',2.8);for(let i=0;i<5;i++)h+=L(`M-25,${12+i*7} L25,${16+i*7}`,'#8a7a5c',1.6)}
  else{const bone=(d,w)=>L(d,INK,w+2.6)+L(d,'#eadfc6',w);
    h+=bone('M-8,20 Q-30,26 -34,40 M8,20 Q30,26 34,40',3.2)+C(-34,41,3.4,'url(#gBone)',1.6)+C(34,41,3.4,'url(#gBone)',1.6);
    h+=bone('M0,12 L0,44',3.4);for(let i=0;i<3;i++){const y=20+i*7,w=16-i*2.5;h+=bone(`M-2,${y} Q${-w},${y-1} ${-w+1},${y+6} M2,${y} Q${w},${y-1} ${w-1},${y+6}`,2.4)}
    h+=P('M-12,40 Q0,34 12,40 L10,47 Q0,44 -10,47Z','url(#gBone)',2)}
  const skull='M-26,-10 C-28,-40 -14,-48 0,-48 C14,-48 28,-40 26,-10 C25,0 18,2 16,8 L16,16 L-16,16 L-16,8 C-18,2 -25,0 -26,-10Z';
  h+=P(skull,o.mummy?'url(#gCloth)':'url(#gBone)',3.2);
  if(o.mummy){for(let i=0;i<6;i++)h+=L(`M-26,${-40+i*9} Q0,${-44+i*9+(i%2?4:-2)} 26,${-38+i*9}`,'#8a7a5c',1.7)}
  else h+=L('M8,-44 l-4,8 l4,5 l-3,6','#8d7f68',1.3)+gloss(-12,-34,8,4,-30);
  h+=E(-10,-18,7.5,8.5,'#140a0c')+E(10,-18,7.5,8.5,'#140a0c')+C(-10,-17,3.4,glow,0,`opacity=".95"`)+C(10,-17,3.4,glow,0,`opacity=".95"`)+C(-10,-17,7,glow,0,'opacity=".18"')+C(10,-17,7,glow,0,'opacity=".18"');
  if(!o.mummy){h+=P('M0,-8 L-3.5,-2 L3.5,-2Z','#140a0c',1.2);for(let i=0;i<6;i++){const x=-12.5+i*5;h+=P(`M${x},4 L${x+4.6},4 L${x+4.2},12 L${x+.4},12Z`,'#f7efd8',1)}}
  else h+=mouth(0,4,9,4,3,{});
  if(o.crown)h+=P('M-20,-42 L-20,-56 L-10,-48 L0,-62 L10,-48 L20,-56 L20,-42Z','url(#gGold)',2)+C(0,-50,2.6,'#3cc0e8',1);
  if(o.twin)h=`<g transform="translate(-16,4) scale(.8)">${h}</g><g transform="translate(18,6) scale(.8)">${h.replace(glow,'#ff7aa8')}</g>`;
  return h}
function mDragon(r,c,lvl,o){let h=shadow(48,34);const skin=G(c),belly=lt(PAL[c],.5);
  if(o.wings){h+=P('M-6,-4 Q-40,-50 -58,-30 Q-46,-26 -48,-14 Q-36,-18 -34,-4 Q-22,-12 -6,6Z',G(pi(r)),2.4)+L('M-8,0 L-54,-30 M-10,2 L-46,-16 M-12,4 L-34,-6',INK,1.2,.6)}
  // neck & body
  h+=P('M-34,46 C-40,24 -28,6 -8,2 C4,0 10,-8 12,-18 L28,-12 C26,6 16,20 4,28 C-6,36 -4,44 -2,46Z',skin,3);
  h+=L('M-26,44 C-30,28 -20,16 -6,12 C0,10 6,4 10,-4',belly,5)+L('M-26,40 l6,-2 M-24,30 l6,0 M-18,22 l5,2 M-10,15 l4,3',dk(PAL[c],.3),1.2);
  // spikes
  for(let i=0;i<5;i++){const x=-36+i*6,y=30-i*9;h+=P(`M${f(x)},${f(y)} l-7,-5 l6,-2Z`,'url(#gBone)',1.4)}
  // head (facing right)
  h+=P('M4,-26 C2,-44 22,-50 34,-44 L52,-36 C58,-33 58,-24 52,-22 L34,-18 C40,-14 44,-8 40,-4 L22,-6 C12,-6 6,-14 4,-26Z',skin,3);
  h+=P('M34,-19 L52,-22 C50,-16 44,-12 40,-4 L24,-6Z','url(#gMouth)',1.6);
  for(let i=0;i<4;i++)h+=P(`M${36+i*4},-20 l2,4 l2,-4Z`,'#fffbe8',.9);
  h+=horns(r,16,-40,-2,14)+C(50,-32,1.6,INK);
  h+=eye(22,-34,5.6,{slit:true,iris:o.iris||'#ffcf3a',brow:1});
  h+=gloss(14,-42,6,3,-20);
  if(o.smoke)h+=`<g opacity=".75">${C(58,-40,4,'#d8d0c8')+C(55,-47,3,'#e8e0d8')+C(59,-52,2,'#f0e8e0')}</g>`;
  if(o.fire)h+=P('M54,-22 Q66,-26 60,-14 Q68,-8 58,-6 Q60,-12 52,-14Z','url(#gFlame)',1.4);
  if(o.bill)h+=P('M40,-40 Q62,-40 60,-28 Q50,-24 38,-26Z','#e8a23a',2.2);
  return h}
function mBeast(r,c,lvl,o){let h=shadow(48,32);const fur=G(c);
  const ears=o.ears||'point';
  if(ears==='long')h+=P('M-16,-26 C-24,-66 -6,-66 -6,-28Z',fur,2.6)+P('M16,-26 C24,-66 6,-66 6,-28Z',fur,2.6)+E(-12,-44,3,11,'#f0a0b0')+E(12,-44,3,11,'#f0a0b0');
  else if(ears==='comb')h+=P('M-10,-32 Q-14,-50 -4,-44 Q0,-58 6,-44 Q16,-52 12,-32Z','url(#mg0)',2.4);
  else h+=P('M-28,-18 L-30,-46 L-10,-32Z',fur,2.6)+P('M28,-18 L30,-46 L10,-32Z',fur,2.6)+P('M-25,-24 L-26,-38 L-16,-30Z','#e59a9a',1);
  // shaggy body: zig-zag fur edge
  let d='';const n=22;for(let i=0;i<=n;i++){const a=Math.PI*2*i/n,rr=(i%2?32:37)+(r()-.5)*3;const x=Math.cos(a)*rr,y=6+Math.sin(a)*rr*.95;d+=(i?'L':'M')+f(x)+','+f(Math.min(y,44))}
  h+=P(d+'Z',fur,3);
  h+=E(0,18,20,16,lt(PAL[c],.4),'opacity=".6"');
  for(let i=0;i<7;i++){const x=(r()-.5)*44,y=(r()-.3)*40;h+=L(`M${f(x)},${f(y)} q2,4 0,7`,dk(PAL[c],.35),1.3)}
  h+=gloss(-16,-14,9,4,-30);
  h+=eyes(r,2,0,-8,6.2,{angry:!o.cute,look:0});
  if(o.beak)h+=P('M-8,2 L12,2 L2,16Z','url(#gGold)',2.2)+L('M-6,6 L10,6',INK,1.2);
  else{h+=E(0,8,12,8,lt(PAL[c],.55))+P('M-5,2 Q0,-1 5,2 Q0,7 -5,2Z',INK,1);h+=mouth(0,12,11,4.5,o.cute?2:5,{fang:true,tongue:o.tongue})}
  if(o.wings)h+=P('M-34,0 Q-58,-24 -52,10 Q-44,4 -34,12Z','url(#gFeather)',2.2)+P('M34,0 Q58,-24 52,10 Q44,4 34,12Z','url(#gFeather)',2.2);
  if(o.cape)h=P('M-30,-6 L-50,46 L50,46 L30,-6Z','url(#mg6)',2.6)+h;
  h+=P('M-18,40 l-4,6 M-12,42 l0,6 M12,42 l0,6 M18,40 l4,6',null,2.6);
  return h}
function mTentacle(r,c,lvl,o){let h=shadow(48,40);const sk=G(c);const n=o.slug?0:6;
  for(let i=0;i<n;i++){const x=-30+i*12,dir=i<n/2?-1:1;const d=`M${f(x*.6)},10 C${f(x)},30 ${f(x+dir*14)},34 ${f(x+dir*10)},46 C${f(x+dir*4)},52 ${f(x-dir*6)},44 ${f(x-dir*2)},40`;
    h+=L(d,INK,10.5)+L(d,PAL[c],7.5)+L(d,lt(PAL[c],.35),2.5,.8);for(let k=0;k<3;k++)h+=C(x+dir*(3+k*3),28+k*5,1.6,lt(PAL[c],.7),.8)}
  if(o.slug){h+=P('M-50,44 C-48,24 -20,20 0,4 C12,-12 34,-10 38,6 C42,22 30,40 10,44Z',sk,3)+L('M-44,40 C-30,34 -12,30 6,24',lt(PAL[c],.5),3,.6)+L('M18,-6 L14,-26 M28,-4 L30,-24',INK,2.4)+C(14,-27,3.6,'url(#gEye)',1.6)+C(30,-25,3.6,'url(#gEye)',1.6)+C(14.6,-26,1.6,INK)+C(30.6,-24,1.6,INK)+mouth(26,12,9,3,0,{})+L('M-54,30 l-8,0 M-56,38 l-10,0 M-52,22 l-6,-2',lt('#ffffff',0),2,.7);
    if(o.speed)h+=L('M-58,16 l-6,0 M-60,26 l-10,0','#fff',2,.6);return h}
  h+=P('M-34,16 C-38,-16 -22,-44 0,-44 C22,-44 38,-16 34,16 C24,24 -24,24 -34,16Z',sk,3.2);
  for(let i=0;i<5;i++)h+=C(-20+r()*40,-30+r()*36,2+r()*3,dk(PAL[c],.18),0,'opacity=".6"');
  h+=gloss(-16,-30,10,5,-30);
  h+=eyes(r,o.eyes||2,0,-12,7.5,{angry:true,slit:lvl>=14,iris:'#ffe066'});
  if(o.kiss)h+=P('M-8,6 Q-4,1 0,5 Q4,1 8,6 Q0,14 -8,6Z','#e0406a',2);else h+=mouth(0,4,10,4,4,{fang:true});
  return h}
function mPlant(r,c,lvl,o){let h=shadow(48,24);
  h+=P('M-20,30 L20,30 L16,48 L-16,48Z','url(#gClay)',2.6)+P('M-23,26 L23,26 L23,32 L-23,32Z','url(#gClay)',2.4);
  h+=L('M0,28 C-6,10 8,0 2,-14',INK,6.5)+L('M0,28 C-6,10 8,0 2,-14','#4f8f34',4);
  h+=P('M-2,14 C-20,4 -30,14 -34,4 C-24,-2 -12,0 -2,14Z','url(#gLeaf)',2)+P('M2,6 C18,-8 30,4 34,-4 C26,-12 12,-8 2,6Z','url(#gLeaf)',2);
  if(o.vine){for(let i=0;i<3;i++)h+=L(`M${-40+i*40},-50 C${-30+i*40},-30 ${-50+i*40},-10 ${-40+i*40},10`,'#3e7a2a',3,.8)}
  // snapping head
  h+=P('M2,-14 C-24,-12 -34,-34 -18,-46 C-6,-54 18,-50 26,-38 C30,-28 20,-16 2,-14Z',G(c),3);
  h+=P('M-16,-30 C-6,-24 10,-24 20,-32 C12,-18 -8,-18 -16,-30Z','url(#gMouth)',1.8);
  for(let i=0;i<5;i++)h+=P(`M${-12+i*7},-29 l3,5 l3,-5Z`,'#fffbe8',.9);
  h+=eye(-2,-40,5,{angry:true,brow:1})+eye(12,-40,4.4,{angry:true,brow:-1});
  h+=gloss(-10,-44,6,3,-20);
  return h}
function mGolem(r,c,lvl,o){let h=shadow(48,38);const st='url(#gStone)';
  h+=P('M-36,46 L-40,10 L-26,-4 L26,-4 L40,10 L36,46Z',st,3)+L('M-22,6 L-6,20 L-14,40 M12,4 L22,24 L10,44',dk('#8c8a84',.4),1.6);
  h+=P('M-44,8 L-56,34 L-44,42 L-34,20Z',st,2.6)+P('M44,8 L56,34 L44,42 L34,20Z',st,2.6);
  h+=P('M-24,-6 L-28,-34 L-10,-46 L14,-44 L28,-30 L24,-6Z',st,3)+L('M-10,-46 L-4,-34 L-16,-24',dk('#8c8a84',.35),1.3);
  h+=E(-6,-40,10,3,'#6fa34a','opacity=".85"')+E(18,6,8,2.5,'#6fa34a','opacity=".7"');
  h+=eye(-9,-24,5.4,{lid:'url(#gStone)',iris:'#ffb347'})+eye(9,-24,5.4,{lid:'url(#gStone)',iris:'#ffb347'})+L('M-6,-12 Q0,-9 6,-12',INK,2);
  if(o.zzz)h+=`<text x="30" y="-40" font-family="Georgia,serif" font-weight="700" font-size="12" fill="#f5ecd6" stroke="${INK}" stroke-width="1" paint-order="stroke">z</text><text x="38" y="-50" font-family="Georgia,serif" font-weight="700" font-size="9" fill="#f5ecd6" stroke="${INK}" stroke-width="1" paint-order="stroke">z</text>`;
  return h}
function mBat(r,c,lvl,o){let h=shadow(48,30);const w=G(o.wingc!=null?o.wingc:6);
  h+=P('M-8,-6 C-30,-36 -56,-30 -58,-10 C-50,-14 -46,-8 -46,0 C-38,-6 -32,0 -32,8 C-24,2 -16,6 -10,12Z',w,2.6)+P('M8,-6 C30,-36 56,-30 58,-10 C50,-14 46,-8 46,0 C38,-6 32,0 32,8 C24,2 16,6 10,12Z',w,2.6);
  h+=L('M-10,0 L-54,-16 M-12,4 L-42,-2 M-12,8 L-30,6 M10,0 L54,-16 M12,4 L42,-2 M12,8 L30,6',INK,1.1,.55);
  h+=P('M-14,-22 L-20,-44 L-6,-30Z',G(c),2.4)+P('M14,-22 L20,-44 L6,-30Z',G(c),2.4);
  h+=P('M-18,-6 C-20,-30 20,-30 18,-6 C18,20 10,34 0,36 C-10,34 -18,20 -18,-6Z',G(c),3);
  h+=gloss(-8,-20,5,3,-20)+eyes(r,2,0,-12,5,{angry:true,iris:'#ff5a4a'})+mouth(0,0,7,3,2,{fang:true});
  if(o.shades)h+=P('M-15,-16 L15,-16 L13,-9 L3,-9 L0,-13 L-3,-9 L-13,-9Z','#141018',1.6)+L('M-12,-15 l5,0',"#ffffff",1.2,.7);
  return h}
function mBugs(r,c,lvl,o){let h='';const one=(x,y,s,ci)=>{let b=`<g transform="translate(${x},${y}) scale(${s})">`+E(0,14,16,3,'url(#gShadow)');
    b+=L('M-10,0 L-18,-6 M-10,6 L-19,6 M-9,11 L-17,16 M10,0 L18,-6 M10,6 L19,6 M9,11 L17,16',INK,2);
    b+=P('M-12,4 C-12,-12 12,-12 12,4 C12,14 -12,14 -12,4Z',G(ci),2.4)+L('M0,-7 L0,13',INK,1.4)+gloss(-5,-3,4,2,-30);
    b+=P('M-7,-8 C-7,-16 7,-16 7,-8Z','#2a1c24',2)+C(-3,-11,1.8,'#fff')+C(3,-11,1.8,'#fff')+C(-3,-11,.9,INK)+C(3,-11,.9,INK)+L('M-4,-15 l-4,-6 M4,-15 l4,-6',INK,1.4);
    if(o.pinch)b+=P('M-8,-14 q-8,-4 -6,-10 q2,4 5,4 M8,-14 q8,-4 6,-10 q-2,4 -5,4',null,1.8);
    return b+'</g>'};
  h+=one(-26,22,1.05,c)+one(24,26,.95,(c+3)%PAL.length)+one(0,-12,1.25,(c+6)%PAL.length);return h}
function mToad(r,c,lvl,o){let h=shadow(48,34);const sk=G(c);
  h+=P('M-36,40 C-44,10 -24,-14 0,-14 C24,-14 44,10 36,40 Q0,50 -36,40Z',sk,3.2)+E(0,30,22,11,lt(PAL[c],.45),'opacity=".7"');
  for(let i=0;i<6;i++)h+=C((r()-.5)*56,(r()*30),1.5+r()*2.5,dk(PAL[c],.2),0,'opacity=".7"');
  h+=C(-16,-16,11,sk,3)+C(16,-16,11,sk,3)+eye(-16,-17,7,{angry:true})+eye(16,-17,7,{angry:true});
  h+=L('M-22,10 Q0,22 22,10',INK,2.6)+gloss(-20,2,8,4,-30);
  if(o.bomb)h+=C(30,-30,8,'#2a2630',2.2)+L('M34,-36 q4,-6 10,-4',INK,1.6)+P('M44,-42 l3,-3 l1,4 l4,1 l-4,2 l0,4 l-3,-3Z','url(#gFlame)',.8)+gloss(27,-33,3,1.5,-30);
  return h}
function mSiren(r,c,lvl,o){let h=shadow(48,30);
  h+=P('M-10,10 C-30,26 -30,44 -2,46 C20,46 34,40 44,24 C38,34 20,36 12,26 C8,20 10,12 -10,10Z',G(4),2.8)+L('M-18,30 q4,-4 8,0 q4,-4 8,0',lt(PAL[4],.5),1.4);
  h+=P('M-16,12 C-18,-4 -8,-8 0,-8 C8,-8 18,-4 16,12Z',G(c),2.6);
  h+=P('M-20,-18 C-30,-2 -26,20 -20,26 C-16,10 -16,-6 -12,-14Z M20,-18 C30,-2 26,20 20,26 C16,10 16,-6 12,-14Z',G(o.hair||2),2.2);
  h+=P('M-16,-20 C-16,-40 16,-40 16,-20 C16,-4 8,0 0,0 C-8,0 -16,-4 -16,-20Z','url(#gSkin0)',2.8);
  h+=P('M-18,-22 C-20,-44 20,-44 18,-22 C12,-34 -12,-34 -18,-22Z',G(o.hair||2),2.2);
  h+=eye(-6,-20,3.8,{iris:'#3cb0c8'})+eye(6,-20,3.8,{iris:'#3cb0c8'})+E(0,-9,4.5,3.5,'url(#gMouth)',`stroke="${INK}" stroke-width="1.6"`);
  h+=`<g fill="${INK}"><path d="M26,-30 l0,-12 l8,-2 l0,11" stroke="${INK}" stroke-width="1.6" fill="none"/>${C(24,-29,3,INK)+C(32,-31,3,INK)}</g>`+L('M-40,-30 q6,-4 4,-12 M-34,-18 q6,0 8,-6',INK,1.6,.6);
  return h}
const MONS=[['goblin horde',{a:mImp,acc:'helmet',many:1}],['shieldmaiden',{a:mImp,acc:'helmet',c:5}],['hat-muncher',{a:mBeast,acc:'hat',ears:'point',tongue:1}],['inferno',{a:mDragon,c:0,fire:1,wings:1}],['mites',{a:mBugs,pinch:1}],['sock slurper',{a:mBlob,c:7,eyes:1}],['leech',{a:mTentacle,c:7,kiss:1,eyes:1}],['sniffer',{a:mBat,c:8,wingc:8}],['toads',{a:mToad,c:3,bomb:1}],['pergola',{a:mPlant,c:3,vine:1}],['pyramid',{a:mBlob,c:2,eyes:3}],['gnawers',{a:mSkull,glow:'#ff6a5a'}],['sirens',{a:mSiren,c:4}],['skygrif',{a:mBeast,c:1,beak:1,wings:1,ears:'point'}],['pitchman',{a:mImp,acc:'tie',c:3}],['pharaoh',{a:mSkull,mummy:1,crown:1,glow:'#58d6ff'}],['imp',{a:mImp,c:0,horns:1}],['rooster',{a:mBeast,c:1,beak:1,ears:'comb'}],['lizards',{a:mDragon,c:3,acc:'tie'}],['pixie',{a:mImp,c:9,acc:'crown'}],['hellmouse',{a:mBeast,c:0,ears:'point',cute:1}],['rattlebones',{a:mSkull}],['troll',{a:mImp,c:8,acc:'glasses'}],['hound',{a:mBeast,c:11,tongue:1}],['duck-billed',{a:mDragon,c:4,bill:1}],['wyrm',{a:mDragon,c:8,smoke:1,wings:1,iris:'#b6ff3a'}],['ficus',{a:mPlant,c:3}],['barfabunny',{a:mBeast,c:7,ears:'long',tongue:1}],['nerd',{a:mImp,c:4,acc:'glasses'}],['slugs',{a:mTentacle,c:2,slug:1,speed:1}],['tentaclopolis',{a:mTentacle,c:6,eyes:3}],['boulderman',{a:mGolem,zzz:1}],['slobber',{a:mBlob,c:3,eyes:2}],['zombie pony',{a:mSkull,glow:'#b6ff3a'}],['nameless dread',{a:mBlob,c:6,eyes:1,iris:'#ff4a4a'}],['bat-cape',{a:mBat,c:11,shades:1}],['grave twins',{a:mSkull,twin:1}]];
function monsterArt(def,key){const r=prng(hash('m'+key));const lvl=def.lvl||1;const nm=(def.n||'').toLowerCase();
  let spec=null;for(const [k,o] of MONS)if(nm.includes(k)){spec=o;break}
  if(!spec)spec={a:[mBlob,mImp,mBeast,mTentacle,mToad][Math.floor(r()*5)]};
  const c=spec.c!=null?spec.c:pi(r);let body=spec.a(r,c,lvl,spec);
  if(spec.many)body=`<g transform="translate(-26,6) scale(.62)" opacity=".85">${mImp(r,(c+3)%12,lvl,{})}</g><g transform="translate(26,6) scale(.62)" opacity=".85">${mImp(r,(c+5)%12,lvl,{})}</g><g transform="translate(0,4) scale(.9)">${body}</g>`;
  return backdropDungeon(r)+aura(lvl)+`<g transform="translate(0,${lvl>=10?-2:2}) scale(${f(.9+Math.min(lvl,20)*.006)})">${body}</g>`}
// ---- items ----
function itemArt(def,key,slot){const r=prng(hash('i'+key));const c=pi(r);const nm=(def.n||'').toLowerCase();let h='';
  const has=w=>nm.includes(w);
  const sword=(len,x,rot,gem)=>`<g transform="rotate(${rot||0} ${x||0} 0) scale(1.18) translate(0,-4)">`+P(`M${-5.5+(x||0)},${-len} L${(x||0)},${-len-9} L${5.5+(x||0)},${-len} L${5.5+(x||0)},20 L${-5.5+(x||0)},20Z`,'url(#gSteel)',2.4)+L(`M${x||0},${-len-2} L${x||0},18`,'#8e9aa8',1.2)+P(`M${-17+(x||0)},18 L${17+(x||0)},18 Q${19+(x||0)},23 ${15+(x||0)},25 L${-15+(x||0)},25 Q${-19+(x||0)},23 ${-17+(x||0)},18Z`,'url(#gGold)',2.2)+P(`M${-3.5+(x||0)},25 L${3.5+(x||0)},25 L${3.5+(x||0)},42 L${-3.5+(x||0)},42Z`,'url(#gLeather)',2)+L(`M${-3.5+(x||0)},30 l7,2 M${-3.5+(x||0)},35 l7,2`,'#2a1a10',1)+C((x||0),46,4.6,gem||G(c),2)+`</g>`;
  switch(slot){
  case 'head':
    if(has('bucket')){h=P('M-26,-26 L26,-26 L20,24 L-20,24Z','url(#gSteel)',2.8)+E(0,-26,26,6,'#6c7682',`stroke="${INK}" stroke-width="2.4"`)+L('M-30,-24 Q-40,-4 -24,10 M30,-24 Q40,-4 24,10',INK,2.4)+L('M-22,-6 L22,-6 M-21,8 L21,8','#8e9aa8',1.6)+gloss(-12,-6,4,12,0);break}
    if(has('antler'))h+=P('M-18,-20 C-30,-40 -44,-40 -46,-54 M-32,-36 L-44,-34 M-38,-44 L-30,-54',null,6)+L('M-18,-20 C-30,-40 -44,-40 -46,-54 M-32,-36 L-44,-34 M-38,-44 L-30,-54','#eadfc6',3.4)+P('M18,-20 C30,-40 44,-40 46,-54 M32,-36 L44,-34 M38,-44 L30,-54',null,6)+L('M18,-20 C30,-40 44,-40 46,-54 M32,-36 L44,-34 M38,-44 L30,-54','#eadfc6',3.4);
    if(has('hat')){h=P('M-40,26 Q0,40 40,26 Q30,16 20,16 L4,-56 Q0,-60 -4,-52 L-20,16 Q-30,16 -40,26Z',G(6),2.8)+P('M-20,12 L20,12 L22,20 L-22,20Z','url(#gGold)',2)+`<path d="M-4,-20 l2,-6 l2,6 l6,0 l-5,4 l2,6 l-5,-4 l-5,4 l2,-6 l-5,-4Z" fill="#ffe27a" stroke="${INK}" stroke-width="1"/>`+C(8,-2,2,'#ffe27a')+C(-8,-36,1.6,'#ffe27a')+gloss(-8,-4,4,10,10);break}
    if(has('headband')){h=P('M-30,4 C-30,-30 30,-30 30,4 C30,30 -30,30 -30,4Z','url(#gSkin1)',2.8)+mouth(0,22,9,3,3,{})+P('M-32,-8 L32,-8 L32,4 L-32,4Z',G(0),2.4)+P('M30,-6 L48,-14 L44,-2 L50,8 L30,2Z',G(0),2.2)+eye(-11,12,4.5,{angry:true,brow:1})+eye(11,12,4.5,{angry:true,brow:-1});break}
    h+=P('M-30,14 C-32,-30 32,-30 30,14Z','url(#gSteel)',3)+P('M-36,10 L36,10 L32,22 L-32,22Z','url(#gSteel)',2.6)+L('M0,-28 L0,10',dk('#b8c4d0',.3),2)+C(-20,16,1.8,'#dfe6ee',1)+C(0,16,1.8,'#dfe6ee',1)+C(20,16,1.8,'#dfe6ee',1)+gloss(-14,-10,6,12,20);
    if(!has('antler'))h+=P('M-2,-28 C-6,-52 18,-58 26,-44 C14,-46 8,-40 6,-28Z',G(c),2.2);break;
  case 'armor':{const m=has('gooey')?G(3):has('jerkin')?'url(#gLeather)':has('moonsilver')?'url(#gSteel)':has('blazing')?'url(#gGold)':has('stubby')?'url(#gSteel)':G(c);
    h=P('M-30,-32 L-14,-40 Q0,-30 14,-40 L30,-32 L42,-10 L30,-4 L28,36 Q0,44 -28,36 L-30,-4 L-42,-10Z',m,3)+L('M0,-30 L0,38',INK,1.6,.6)+L('M-26,4 Q0,12 26,4 M-26,20 Q0,28 26,20',INK,1.4,.5)+C(-18,-18,2,'url(#gGold)',1)+C(18,-18,2,'url(#gGold)',1)+gloss(-14,-12,6,14,10);
    if(has('gooey'))h+=P('M-20,36 q2,10 5,0 M4,40 q3,12 6,0 M-10,-34 q2,8 4,0',null,2,'fill="#8ce07a"');
    if(has('blazing'))h+=P('M-24,-40 Q-30,-56 -18,-60 Q-18,-50 -10,-50 Q-8,-62 2,-64 Q0,-52 10,-50 Q14,-60 22,-56 Q26,-46 20,-40Z','url(#gFlame)',1.6);
    break}
  case 'foot':
    if(has('flip')){h=P('M-36,20 C-40,-10 -24,-30 -10,-30 C4,-30 6,-10 4,20 C2,34 -34,34 -36,20Z',G(c),2.6)+P('M4,24 C0,-6 16,-26 30,-26 C44,-26 46,-6 44,24 C42,38 6,38 4,24Z',G(c),2.6)+L('M-16,-24 L-26,4 M-16,-24 L-6,4 M24,-20 L14,8 M24,-20 L34,8',INK,2.4);break}
    h=P('M-24,-36 L0,-36 L2,8 L22,14 Q36,18 34,32 L-26,32Z',has('sneaker')?G(c):'url(#gLeather)',3)+P('M-28,28 L36,28 L36,38 L-28,38Z',has('sneaker')?'#f4f0ea':'#3a2418',2.4)+L('M-22,-24 L-2,-24 M-22,-12 L-2,-12',has('sneaker')?'#fff':'#e0b050',2)+gloss(-14,-16,4,10,0);
    if(has('sneaker'))h+=L('M-30,-6 l-14,-4 M-30,4 l-18,0 M-30,14 l-14,4','#fff',2,.8)+L('M6,12 L16,22',INK,1.4);
    if(has('stompy'))h+=P('M-26,-40 L2,-40 L2,-32 L-26,-32Z','url(#gSteel)',2)+C(-20,-36,1.4,'#fff');break;
  case '2h':
    if(has('bow')){h=P('M-10,-50 C30,-30 30,30 -10,50',null,7)+L('M-10,-50 C30,-30 30,30 -10,50','#9a6030',4.5)+L('M-10,-50 L-10,50','#f4ecd8',1.2)+P('M-36,0 L30,0',null,2)+P('M30,0 l-8,-4 l0,8Z','url(#gSteel)',1.2)+P('M-36,0 l-6,-5 M-36,0 l-6,5',null,1.6)+`<g fill="#f5a3c7" stroke="${INK}" stroke-width="1">${C(14,-30,4,'#f5a3c7',1)+C(14,30,4,'#f5a3c7',1)}</g>`;break}
    if(has('buzzsaw')){let t='';for(let i=0;i<16;i++){const a=i/16*Math.PI*2;t+=`${i?'L':'M'}${f(Math.cos(a)*30)},${f(-6+Math.sin(a)*30)} L${f(Math.cos(a+.2)*36)},${f(-6+Math.sin(a+.2)*36)} `}h=P(t+'Z','url(#gSteel)',2.4)+C(0,-6,20,'url(#gSteelD)',2)+C(0,-6,6,G(0),2)+L('M0,24 L0,52',INK,8)+L('M0,24 L0,52','#7a4422',5)+L('M-40,-40 l6,6 M40,-40 l-6,6 M44,-6 l-8,0',INK,2,.7);break}
    if(has('boulder')){h=shadow(46,34)+P('M-36,30 C-46,0 -30,-34 -4,-36 C24,-38 44,-14 40,14 C38,34 16,44 -8,42 C-24,42 -32,38 -36,30Z','url(#gStone)',3)+L('M-16,-18 L-6,-4 L-18,10 M10,-24 L18,-6',dk('#8c8a84',.4),1.6)+gloss(-18,-20,8,4,-30)+E(12,-28,10,3,'#6fa34a','opacity=".8"');break}
    if(has('pole')){h=L('M-44,50 L44,-50',INK,7)+L('M-44,50 L44,-50','#9a6030',4.4)+L('M-10,16 l6,6 M4,2 l6,6 M18,-12 l6,6',dk('#a0703a',.4),1.2)+`<text x="-20" y="46" font-family="Georgia,serif" font-size="11" font-style="italic" fill="#f5ecd6" stroke="${INK}" stroke-width=".8" paint-order="stroke">10 ft</text>`;break}
    if(has('halberd')){h=L('M0,-50 L0,54',INK,7)+L('M0,-50 L0,54','#9a6030',4.4)+P('M2,-40 C26,-44 34,-24 30,-6 C22,-16 10,-18 2,-16Z','url(#gSteel)',2.4)+P('M-2,-36 L-18,-30 L-2,-24Z','url(#gSteel)',2)+P('M-3,-50 L0,-62 L3,-50Z','url(#gSteel)',1.8)+C(-6,-4,3,'#e8583a',1.2)+C(-10,6,3,'#3c7cc0',1.2)+C(-6,16,3,'#6aa84a',1.2)+L('M-12,24 l-14,2 M-12,32 l-12,6',INK,1.4,.5);break}
    h=sword(46,0,-20);break;
  case '1h':
    if(has('shield')){const big=has('wall');h=P(big?'M-36,-44 L36,-44 L36,30 Q0,52 -36,30Z':'M-30,-36 Q0,-46 30,-36 Q32,16 0,42 Q-32,16 -30,-36Z',G(c),3)+P(big?'M-28,-36 L28,-36 L28,26 Q0,42 -28,26Z':'M-22,-28 Q0,-36 22,-28 Q24,10 0,32 Q-24,10 -22,-28Z',G((c+6)%12),1.6)+(has('swash')?`<text x="0" y="12" text-anchor="middle" font-family="Georgia,serif" font-size="30" font-weight="700" fill="url(#gGold)" stroke="${INK}" stroke-width="1.4">☠</text>`:C(0,-2,9,'url(#gGold)',2)+gloss(-3,-5,3,2,-30))+gloss(-14,-16,5,12,15);break}
    if(has('mace')||has('cudgel')||has('hammer')){const hm=has('hammer');h=L('M-24,44 L10,-10',INK,7.5)+L('M-24,44 L10,-10','#9a6030',4.8);
      h+=hm?P('M-4,-34 L30,-12 L20,4 L-14,-18Z','url(#gSteel)',2.6)+gloss(4,-20,6,3,30):has('mace')?C(14,-16,14,'url(#gSteel)',2.6)+P('M14,-36 l4,6 l-8,0Z M34,-16 l-6,4 l0,-8Z M14,4 l-4,-6 l8,0Z M-6,-16 l6,-4 l0,8Z M28,-30 l-2,7 l-5,-5Z M0,-2 l2,-7 l5,5Z','url(#gSteel)',1.4)+gloss(9,-21,4,2,-30):P('M4,-4 C0,-24 14,-40 24,-36 C34,-32 30,-14 16,2Z','url(#gWood)',2.6)+L('M12,-24 l4,4 M20,-30 l3,5',INK,1.4,.6);break}
    if(has('shiv')){h=`<g transform="rotate(35)">`+P('M-3,-30 L0,-38 L3,-30 L3,8 L-3,8Z','url(#gSteel)',2.2)+P('M-10,8 L10,8 L10,13 L-10,13Z','url(#gSteelD)',1.8)+P('M-3,13 L3,13 L3,30 L-3,30Z','url(#gLeather)',1.8)+`</g>`+L('M20,-40 l6,-6 M28,-30 l8,-2',INK,1.6,.6);break}
    if(has('grater')){h=P('M-18,-38 L18,-38 L26,36 L-26,36Z','url(#gSteel)',2.8)+P('M-8,-38 C-8,-54 8,-54 8,-38',null,3);for(let y=-28;y<30;y+=8)for(let x=-14;x<=14;x+=7)h+=E(x+(y%16?3:0),y,2,1.2,'#39414a');h+=gloss(-8,-10,3,16,6)+C(0,-50,5,'url(#gGold)',0,'opacity=".6"');break}
    if(has('staff')){h=L('M-20,50 L14,-30',INK,7)+L('M-20,50 L14,-30','#9a6030',4.4)+P('M14,-30 C0,-40 10,-60 22,-52 C34,-46 30,-28 14,-30Z','url(#gFlame)',2)+C(18,-40,5,'#fff6c8',0,'opacity=".8"');break}
    if(has('snack')){h=L('M-20,50 L10,-6',INK,6)+L('M-20,50 L10,-6','#9a6030',3.6)+E(14,-18,14,10,'#c86a3a',`stroke="${INK}" stroke-width="2.4"`)+E(20,-34,11,8,'#e8b04a',`stroke="${INK}" stroke-width="2.2"`)+E(8,-2,9,7,'#8a3a2a',`stroke="${INK}" stroke-width="2.2"`)+gloss(10,-22,4,2,-30);break}
    if(has('sousaphone')){h=P('M-24,40 C-50,10 -40,-30 -6,-36 C24,-40 40,-20 40,0 L30,4 C28,-16 14,-26 -4,-24 C-26,-20 -30,6 -14,32Z','url(#gGold)',2.8)+E(34,-6,14,20,'url(#gGold)',`stroke="${INK}" stroke-width="2.6"`)+E(36,-6,8,14,'#6a4a10')+C(-10,6,3,'#fff4c8',1.2)+C(-2,4,3,'#fff4c8',1.2)+C(6,4,3,'#fff4c8',1.2)+L('M48,-26 q6,-6 4,-12 M52,-12 q8,-2 10,-8',INK,1.6,.7);break}
    if(has('tap')){h=sword(40,0,12)+P('M-26,44 C-30,36 -18,34 -16,40Z M20,46 C18,38 30,36 32,42Z','#2a1c24',1.6)+L('M-34,20 q-6,-4 -4,-10 M34,14 q6,-4 4,-10',INK,1.6,.6);break}
    if(has('rapier')){h=`<g transform="rotate(-25)">`+L('M0,-58 L0,16','#c9d2dc',3)+L('M0,-58 L0,16',INK,.6)+P('M-12,16 C-14,30 14,30 12,16Z','url(#gGold)',2)+P('M-2.5,24 L2.5,24 L2.5,40 L-2.5,40Z','url(#gLeather)',1.6)+C(0,44,4,G(c),1.6)+`</g>`;break}
    h=sword(40,0,-12);break;
  case 'big':h=P('M-40,-10 L40,-10 L34,28 L-34,28Z',G(c),2.8)+C(-24,34,9,'url(#gWood)',2.6)+C(24,34,9,'url(#gWood)',2.6)+P('M-20,-10 C-22,-40 22,-40 20,-10Z','url(#gStone)',2.4);break;
  case 'potion':return potionArt(r,c,def);
  case 'scroll':h=P('M-30,-30 L30,-30 L30,34 L-30,34Z','url(#gParch)',2.6)+P('M-36,-40 C-40,-40 -40,-26 -36,-26 L36,-26 C40,-26 40,-40 36,-40Z','url(#gWood)',2.4)+P('M-36,30 C-40,30 -40,44 -36,44 L36,44 C40,44 40,30 36,30Z','url(#gWood)',2.4)+L('M-20,-14 L20,-14 M-20,-4 L14,-4 M-20,6 L20,6',dk('#c8b48a',.5),1.8)+C(10,20,8,'url(#mg0)',2)+`<path d="M6,26 l-4,14 l6,-4 l4,4 l0,-14" fill="url(#mg0)" stroke="${INK}" stroke-width="1.4"/>`;break;
  case 'level':return levelArt(r,def);
  case 'legs':h=P('M-26,-40 L-4,-40 L-6,40 L-24,40Z',G(c),2.8)+P('M4,-40 L26,-40 L24,40 L6,40Z',G(c),2.8)+(has('knee')?(has('pointy')?P('M-22,-2 L-15,-16 L-8,-2Z M8,-2 L15,-16 L22,-2Z','url(#gSteel)',2):E(-15,2,9,7,'#f5a3c7',`stroke="${INK}" stroke-width="2"`)+E(15,2,9,7,'#f5a3c7',`stroke="${INK}" stroke-width="2"`)):L('M-24,-10 L-6,-6 M6,-6 L24,-10 M-24,14 L-6,18 M6,18 L24,14',lt(PAL[c],.5),2))+gloss(-18,-20,3,10,0)+gloss(12,-20,3,10,0);break;
  case 'food':h=shadow(34,40)+P('M-40,-6 Q0,-32 40,-6 L40,4 L-40,4Z','url(#gBread)',2.6)+P('M-42,4 L42,4 L38,12 L-38,12Z','#7cc25a',2)+P('M-40,10 L40,10 L34,16 L-34,16Z','#e0b050',1.6)+P('M-40,14 Q0,30 40,14 L40,22 Q0,36 -40,22Z','url(#gBread)',2.6)+P('M40,4 L58,-4 L54,8 L60,16 L40,12Z','#9ab0c0',2)+C(52,4,1.4,INK)+L('M16,-34 q4,-8 0,-14 M26,-32 q4,-8 0,-14 M6,-34 q4,-8 0,-14','#8bbf4a',2,.8)+gloss(-14,-14,8,3,-10);break;
  case 'cloak':h=P('M-10,-44 L10,-44 L36,40 Q0,52 -36,40Z',G(6),3)+P('M-10,-44 L10,-44 L18,40 Q0,46 -18,40Z',dk(PAL[6],.35),0)+P('M-12,-44 Q0,-30 12,-44 Q16,-54 0,-56 Q-16,-54 -12,-44Z',dk(PAL[6],.25),2.4)+C(0,-36,4,'url(#gGold)',1.6)+L('M-20,0 Q-24,24 -28,38 M20,0 Q24,24 28,38',INK,1.2,.5)+eye(-4,-48,1.8,{})+eye(4,-48,1.8,{});break;
  case 'ladder':h=L('M-22,-44 L-30,44 M22,-44 L30,44',INK,7)+L('M-22,-44 L-30,44 M22,-44 L30,44','#9a6030',4.4)+[-28,-8,12,32].map(y=>L(`M${f(-22-(y+44)/11)},${y} L${f(22+(y+44)/11)},${y}`,INK,5.5)+L(`M${f(-22-(y+44)/11)},${y} L${f(22+(y+44)/11)},${y}`,'#9a6030',3)).join('');break;
  default:h=P('M-26,-10 L26,-10 L22,34 L-22,34Z','url(#gLeather)',2.8)+P('M-26,-10 C-26,-34 26,-34 26,-10Z','url(#gLeather)',2.6)+C(0,-8,5,'url(#gGold)',1.8)}
  return itemGlow()+shadow(46,30)+h}
function itemGlow(){return `<circle cx="0" cy="0" r="52" fill="url(#gHalo)"/>`}
function potionArt(r,c,def){const nm=(def.n||'').toLowerCase(),sp=def.sp||'';const has=w=>nm.includes(w);let h=itemGlow()+shadow(46,26);
  if(sp==='lamp'||has('lantern'))return h+P('M-6,-44 C-6,-52 6,-52 6,-44',null,2.4)+P('M-16,-40 L16,-40 L20,-32 L-20,-32Z','url(#gGold)',2.2)+P('M-16,-32 L16,-32 L18,30 L-18,30Z','rgba(255,220,140,.35)',2.6)+E(0,0,9,16,'url(#gFlameR)')+P('M-22,30 L22,30 L18,40 L-18,40Z','url(#gGold)',2.2)+L('M-16,-32 L-18,30 M16,-32 L18,30 M0,-32 L0,-20',INK,1.8)+gloss(-11,-6,2.4,12,0);
  if(sp==='die')return h+`<g transform="rotate(-12)">`+`<rect x="-24" y="-24" width="48" height="48" rx="9" fill="url(#gIvory)" stroke="${INK}" stroke-width="3"/>`+[[-12,-12],[12,12],[0,0],[12,-12],[-12,12]].map(([x,y])=>C(x,y,4.2,'#9b1c2a')).join('')+`</g>`+gloss(-14,-18,6,3,-30)+`<text x="30" y="-28" font-family="Georgia,serif" font-weight="700" font-size="14" fill="#ffe27a" stroke="${INK}" stroke-width="1" paint-order="stroke">+1</text>`;
  if(sp==='ward'||has('ring of'))return h+`<ellipse cx="0" cy="6" rx="26" ry="22" fill="none" stroke="${INK}" stroke-width="12"/><ellipse cx="0" cy="6" rx="26" ry="22" fill="none" stroke="url(#gGold)" stroke-width="8.5"/>`+P('M-10,-20 L10,-20 L14,-30 L0,-42 L-14,-30Z',G(9),2.2)+L('M-10,-30 L10,-30 M0,-42 L0,-20',lt(PAL[9],.5),1.2)+gloss(-4,-32,3,2,-30);
  if(sp==='dowse'||has('rod'))return h+L('M-30,46 L0,-6 L30,46',INK,7)+L('M-30,46 L0,-6 L30,46','#9a6030',4.4)+L('M0,-6 L0,-40',INK,6)+L('M0,-6 L0,-40','#9a6030',3.6)+C(0,-44,6,'#9cf0ff',2)+L('M-14,-50 l-6,-4 M14,-50 l6,-4 M0,-56 l0,-6','#9cf0ff',2);
  if(sp==='wall'||has('wall'))return h+[0,1,2,3].map(row=>[0,1,2].map(k=>{const x=-36+k*24+(row%2?12:0),y=18-row*14;return P(`M${x},${y} L${x+22},${y} L${x+22},${y+12} L${x},${y+12}Z`,'url(#gBrick)',2)}).join('')).join('')+L('M-40,34 l-8,6 M40,34 l8,6',INK,2,.6);
  if(sp==='glue'||has('jar'))return h+P('M-24,-24 L24,-24 L26,40 L-26,40Z','rgba(200,240,255,.35)',2.8)+P('M-24,0 Q0,-6 24,0 L26,40 L-26,40Z','#e8d06a',0)+P('M-24,0 Q0,-6 24,0',null,0)+P('M-28,-34 L28,-34 L28,-22 L-28,-22Z','url(#gWood)',2.4)+P('M-10,0 q2,10 5,4 M8,0 q3,14 6,3',null,2,'fill="#e8d06a"')+gloss(-15,10,3,14,0)+L('M-24,-24 L24,-24',INK,2.4);
  if(has('dart'))return h+`<g transform="rotate(-35)">`+L('M0,-40 L0,30',INK,4)+L('M0,-40 L0,30','#9a6030',2)+P('M-4,-40 L0,-54 L4,-40Z','url(#gSteel)',1.6)+P('M0,22 L-12,36 L0,30 L12,36Z',G(0),1.6)+`</g>`+P('M22,-40 L14,-24 L22,-24 L14,-6',null,2.6,'stroke="#ffd83a"');
  if(has('balloon'))return h+[[-16,-18,0],[14,-24,5],[0,-6,2]].map(([x,y,k])=>L(`M${x},${y+16} Q${x/2},${y+40} 0,46`,INK,1.2)+E(x,y,13,16,G(k),`stroke="${INK}" stroke-width="2.4"`)+gloss(x-5,y-7,3,5,-20)).join('');
  if(has('garlic'))h+=P('M-6,-50 L6,-50 L2,-40 L-2,-40Z','#b9c89a',1.4);
  // flask shapes (round, tall, bottle)
  const liq=G(has('hot')?0:has('frost')?9:has('doom')?6:has('sour')?8:has('snooze')?5:has('courage')?1:has('hug')?7:has('water')?9:has('parrot')?3:has('garlic')?2:c);
  const shape=Math.floor(r()*3);let glass,fill,cork;
  if(shape===0){glass='M-8,-40 L8,-40 L8,-20 C30,-10 32,30 0,40 C-32,30 -30,-10 -8,-20Z';fill='M-25,6 C-12,0 12,10 25,4 C26,26 14,38 0,38 C-14,38 -26,26 -25,6Z';cork=[-10,-50,20]}
  else if(shape===1){glass='M-7,-44 L7,-44 L7,-30 L14,-24 L14,34 Q0,42 -14,34 L-14,-24 L-7,-30Z';fill='M-14,-2 Q0,-6 14,-2 L14,34 Q0,42 -14,34Z';cork=[-9,-54,18]}
  else {glass='M-6,-44 L6,-44 L6,-26 C24,-24 26,-8 24,10 L24,36 Q0,42 -24,36 L-24,10 C-26,-8 -24,-24 -6,-26Z';fill='M-24,8 Q0,2 24,8 L24,36 Q0,42 -24,36Z';cork=[-8,-54,16]}
  h+=P(glass,'url(#gGlass)',0)+`<path d="${fill}" fill="${liq}"/>`+P(fill,'url(#gGlassShade)',0)+P(glass,'none',3);
  h+=C(-6,20,2.6,'rgba(255,255,255,.7)')+C(6,28,1.8,'rgba(255,255,255,.6)')+C(2,12,1.4,'rgba(255,255,255,.6)');
  h+=gloss(-12,-4,3,12,8)+P(`M${cork[0]},${cork[1]} L${cork[0]+cork[2]},${cork[1]} L${cork[0]+cork[2]-2},${cork[1]+10} L${cork[0]+2},${cork[1]+10}Z`,'url(#gCork)',2);
  if(has('fizz')||has('bang'))h+=L('M-26,-40 l-6,-6 M26,-40 l6,-6 M0,-62 l0,-6',INK,2);
  if(sp==='dbl'||has('mirror'))h+=`<g transform="translate(26,4) scale(.6)" opacity=".7">${P(glass,'rgba(220,240,255,.22)',3)}</g>`;
  return h}
function levelArt(r,def){const nm=(def.n||'').toLowerCase();let h=`<g opacity=".9">`;for(let i=0;i<12;i++){const a=i/12*Math.PI*2;h+=`<path d="M0,0 L${f(Math.cos(a-.12)*70)},${f(Math.sin(a-.12)*70)} L${f(Math.cos(a+.12)*70)},${f(Math.sin(a+.12)*70)}Z" fill="#ffe7a0" opacity=".22"/>`}h+='</g>';
  if(nm.includes('coin')||nm.includes('leftover')){h+=shadow(44,34);const coin=(x,y)=>E(x,y+3,15,6,'#8a5a14',`stroke="${INK}" stroke-width="2"`)+E(x,y,15,6,'url(#gGold)',`stroke="${INK}" stroke-width="2"`)+E(x,y,8,3,'none',`stroke="#b07a1a" stroke-width="1.2"`);
    for(const [x,y] of [[-20,38],[6,38],[28,38],[-8,30],[16,30],[-18,22],[4,22],[-6,14],[10,6]])h+=coin(x,y);return h+gloss(-10,10,4,2,-20)}
  if(nm.includes('beetle'))h+=`<g transform="translate(22,34) scale(.7)">${P('M-12,4 C-12,-12 12,-12 12,4 C12,14 -12,14 -12,4Z','url(#mg3)',2.4)}</g>`+P('M-44,40 L-4,40 L-8,30 L-40,30Z','url(#gLeather)',2)+E(-24,28,16,5,'#2a1c24',`stroke="${INK}" stroke-width="1.6"`);
  h+=P('M-13,40 L-13,2 L-30,2 L0,-40 L30,2 L13,2 L13,40Z','url(#gGold)',3)+L('M-6,34 L-6,0 L-16,0 L0,-28',lt('#ffe7a0',.3),2,.9)+gloss(-4,-14,3,10,0);
  h+=`<text x="0" y="30" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="16" fill="#6a3a08">+1</text>`;
  return h}
function curseArt(def,key){const r=prng(hash('c'+key));const nm=(def.n||'').toLowerCase();const c=[6,11,3,5][Math.floor(r()*4)];
  let h=`<circle cx="0" cy="-4" r="54" fill="url(#gHex)"/>`;
  // hex runes circle
  h+=`<circle cx="0" cy="8" r="40" fill="none" stroke="#c8a0ff" stroke-width="1.2" stroke-dasharray="4 5" opacity=".6"/>`;
  if(nm.includes('goose')){h+=shadow(46,26)+P('M-24,40 C-40,20 -20,0 0,6 C4,-12 -2,-26 8,-34 C18,-40 28,-32 24,-22 C20,-12 14,0 24,14 C34,30 10,44 -24,40Z','url(#gFeather)',3)+P('M22,-30 L40,-26 L24,-20Z','#e8a23a',2)+eye(12,-28,4,{angry:true,brow:1})+P('M-18,-40 C-26,-60 26,-60 18,-40Z','#3a3040',2)+L('M-12,-48 l-4,-8 M0,-50 l0,-8 M12,-48 l4,-8','#b0a8ff',2);return h}
  if(nm.includes('gremlin')||nm.includes('sock goblin')||nm.includes('neighbour')||nm.includes('tax')){h+=`<g transform="translate(0,4) scale(.92)">${mImp(r,nm.includes('tax')?11:3,6,{acc:nm.includes('tax')?'hat':nm.includes('sock')?'':'glasses'})}</g>`;if(nm.includes('tax'))h+=P('M22,24 L44,24 L44,44 L22,44Z','url(#gParch)',2)+L('M26,30 l14,0 M26,36 l10,0',INK,1.2);if(nm.includes('sock'))h+=P('M26,10 L36,10 L36,32 Q36,42 24,42 L22,34 L28,32Z',G(7),2);return h}
  if(nm.includes('mirror')){h+=P('M-22,-40 C-22,-56 22,-56 22,-40 L22,20 C22,36 -22,36 -22,20Z','url(#gGold)',3)+P('M-16,-38 C-16,-48 16,-48 16,-38 L16,18 C16,28 -16,28 -16,18Z','url(#gMirror)',1.8)+L('M-10,-30 L6,-12 L-4,4 L10,16',INK,1.4)+L('M0,30 L0,44 M-12,46 L12,46',INK,3.4)+eye(-5,-16,3.2,{angry:true,brow:1})+eye(6,-16,3.2,{angry:true,brow:-1});return h}
  if(nm.includes('rust')){for(let i=0;i<9;i++)h+=C(-40+r()*80,10+r()*40,1.5+r()*2.5,['#c0602c','#8a3a14','#e8883b'][i%3],0,'opacity=".8"')}
  // storm cloud with hex swirl and lightning
  h+=P('M-40,0 C-50,-10 -40,-30 -24,-26 C-22,-44 4,-50 12,-34 C22,-44 44,-36 38,-18 C52,-14 50,6 36,6 L-34,6 C-44,6 -46,2 -40,0Z','url(#gCloud)',3);
  h+=L('M-6,-18 C-2,-26 10,-22 8,-14 C6,-8 -4,-10 -2,-16',lt('#c8a0ff',.2),2.2);
  h+=eye(-14,-12,3.6,{angry:true,iris:'#d0a0ff',brow:1})+eye(18,-12,3.6,{angry:true,iris:'#d0a0ff',brow:-1});
  h+=P('M-12,8 L-20,28 L-10,26 L-16,46 L2,20 L-8,22 L-2,8Z','url(#gBolt)',1.8)+P('M16,8 L10,22 L18,21 L12,38 L26,18 L18,19 L22,8Z','url(#gBolt)',1.6);
  const mot=nm.includes('career')?P('M16,-52 L40,-46 L28,-38 L4,-44Z','#2a2230',1.8)+L('M36,-46 L38,-34',"#e8bd45",1.6)
    :nm.includes('family')?L('M40,-30 L40,-52',INK,3)+C(40,-56,9,'url(#gLeaf)',2)+C(33,-50,6,'url(#gLeaf)',1.6)
    :nm.includes('gender')?`<g transform="translate(38,-50) scale(.9)" fill="none" stroke="#f0d0ff" stroke-width="2.4" stroke-linecap="round">${'<circle cx="-4" cy="4" r="5"/><path d="M-1,1 L5,-5 M1,-5 L5,-5 L5,-1"/><circle cx="8" cy="10" r="4"/><path d="M8,14 L8,20 M5,17 L11,17"/>'}</g>`
    :nm.includes('butter')?`<g transform="translate(40,-40) rotate(150) scale(.5)">${P('M-5,-40 L0,-48 L5,-40 L5,16 L-5,16Z','url(#gSteel)',3)+P('M-16,16 L16,16 L16,22 L-16,22Z','url(#gGold)',2.4)}</g>`
    :nm.includes('rotten luck')?`<path d="M28,-58 C22,-44 28,-34 38,-34 C48,-34 54,-44 48,-58" fill="none" stroke="${INK}" stroke-width="7"/><path d="M28,-58 C22,-44 28,-34 38,-34 C48,-34 54,-44 48,-58" fill="none" stroke="#9aa4b0" stroke-width="4"/>`+L('M36,-38 l4,4',"#3a2a20",2)
    :nm.includes('identity')?P('M28,-58 Q40,-62 52,-58 Q52,-40 40,-38 Q28,-40 28,-58Z','#f4efe4',2)+E(35,-52,2.4,1.6,INK)+E(45,-52,2.4,1.6,INK)+L('M35,-45 Q40,-48 45,-45',INK,1.4)
    :nm.includes('utterly')?`<g transform="translate(40,-48) scale(.32)">${P('M-26,-10 C-28,-40 -14,-48 0,-48 C14,-48 28,-40 26,-10 C25,0 18,2 16,8 L16,16 L-16,16 L-16,8 C-18,2 -25,0 -26,-10Z','url(#gBone)',5)+E(-10,-18,7.5,8.5,'#140a0c')+E(10,-18,7.5,8.5,'#140a0c')}</g>`:'';
  h+=mot;
  if(nm.includes('hen'))h+=P('M-10,-44 Q-14,-60 -4,-54 Q0,-66 6,-54 Q16,-60 12,-44Z','url(#mg0)',2);
  if(nm.includes('gust'))h+=L('M-50,30 Q-30,24 -14,34 Q2,44 24,36 M-44,42 Q-20,38 0,46',lt('#ffffff',0),2.4,.7);
  return h}
function heroArt(def,key,kind){const r=prng(hash('h'+key));const skin=['url(#gSkin0)','url(#gSkin1)','url(#gSkin2)','url(#gSkin3)'][Math.floor(r()*4)];let h=`<circle cx="0" cy="-2" r="54" fill="url(#gHeroBg)"/>`;
  const cloth=G(kind==='wizard'?6:kind==='warrior'?0:kind==='thief'?11:kind==='cleric'?2:kind==='elf'?3:kind==='dwarf'?10:kind==='half'?4:5);
  h+=P('M-40,58 C-40,30 -26,20 0,20 C26,20 40,30 40,58Z',cloth,3)+L('M-14,22 L0,36 L14,22',dk('#000000',0),1.8,.5);
  if(kind==='warrior')h+=P('M-40,40 C-40,26 -30,22 -22,24 L-22,40Z M40,40 C40,26 30,22 22,24 L22,40Z','url(#gSteel)',2.4);
  if(kind==='cleric')h+=P('M-4,30 L4,30 L4,38 L12,38 L12,44 L4,44 L4,56 L-4,56 L-4,44 L-12,44 L-12,38 L-4,38Z','url(#gGold)',1.6);
  const ear=kind==='elf'?P('M-20,-10 L-44,-28 L-22,4Z',skin,2.6)+P('M20,-10 L44,-28 L22,4Z',skin,2.6):P('M-22,-6 C-30,-8 -30,6 -21,6Z',skin,2.4)+P('M22,-6 C30,-8 30,6 21,6Z',skin,2.4);
  h+=ear;
  if(kind==='half'||kind==='human'||!kind)h+=P('M-24,-10 C-30,-34 -10,-44 4,-40 C20,-44 30,-30 24,-8 C20,-24 8,-30 -4,-28 C-14,-28 -20,-22 -24,-10Z','url(#mg11)',2.4);
  h+=P('M-22,-6 C-22,-32 22,-32 22,-6 C22,14 12,22 0,22 C-12,22 -22,14 -22,-6Z',skin,3);
  h+=gloss(-10,-18,6,3,-20);
  h+=eye(-8,-4,3.8,{iris:kind==='elf'?'#4fd08a':'#5a8ad0'})+eye(8,-4,3.8,{iris:kind==='elf'?'#4fd08a':'#5a8ad0'});
  h+=L('M-13,-12 q5,-3 10,0 M3,-12 q5,-3 10,0',INK,1.8)+P('M-2,2 Q0,6 3,3',null,1.6);
  h+=kind==='thief'?'':L('M-7,11 Q0,16 7,11',INK,2);
  if(kind==='half')h+=`<g fill="url(#mg11)" stroke="${INK}" stroke-width="1.6">${[-18,-8,4,14].map(x=>`<circle cx="${x}" cy="-28" r="6"/>`).join('')}</g>`+E(-14,6,4,2.4,'#f0a0a0','opacity=".6"')+E(14,6,4,2.4,'#f0a0a0','opacity=".6"');
  if(kind==='dwarf')h+=P('M-22,2 C-26,44 -6,54 0,52 C6,54 26,44 22,2 C14,12 6,10 0,9 C-6,10 -14,12 -22,2Z','url(#mg1)',2.6)+L('M-8,20 q2,12 0,22 M8,20 q-2,12 0,22 M0,16 l0,30',dk(PAL[1],.4),1.2)+P('M-26,-14 C-28,-40 28,-40 26,-14 L28,-10 L-28,-10Z','url(#gSteel)',2.6)+horns(r,0,-26,24,12);
  if(kind==='wizard')h+=P('M-34,-12 Q0,-4 34,-12 Q26,-20 16,-18 L6,-62 Q0,-66 -4,-60 L-18,-18 Q-28,-20 -34,-12Z',G(6),2.8)+`<path d="M0,-40 l2,-5 l2,5 l5,0 l-4,3 l2,5 l-5,-3 l-5,3 l2,-5 l-4,-3Z" fill="#ffe27a" stroke="${INK}" stroke-width=".9"/>`+P('M-12,10 C-14,40 0,50 0,50 C0,50 14,40 12,10 C6,16 -6,16 -12,10Z','#eeeae4',2.2);
  if(kind==='warrior')h+=P('M-25,-8 C-27,-40 27,-40 25,-8 L20,-8 C20,-26 -20,-26 -20,-8Z','url(#gSteel)',2.6)+P('M-3,-34 L3,-34 L3,-4 L-3,-4Z','url(#gSteel)',1.6)+P('M-2,-34 C-4,-54 16,-58 22,-46 C12,-48 8,-44 4,-34Z','url(#mg0)',2);
  if(kind==='thief')h+=P('M-30,-2 C-34,-40 34,-40 30,-2 C24,-24 -24,-24 -30,-2Z',G(11),2.6)+P('M-22,-9 L22,-9 L20,0 L-20,0Z','#241820',1.8)+C(-8,-4,2.2,'#fff')+C(8,-4,2.2,'#fff')+L('M-6,12 Q0,9 6,13',INK,2);
  if(kind==='cleric')h+=`<ellipse cx="0" cy="-36" rx="18" ry="5" fill="none" stroke="url(#gGold)" stroke-width="3.2"/>`;
  if(kind==='elf')h+=P('M-22,-10 C-22,-36 22,-36 22,-10 C16,-22 -2,-26 -22,-10Z','url(#mg2)',2.2)+P('M22,-10 C26,4 24,20 18,28 C22,10 18,0 16,-10Z','url(#mg2)',1.8);
  return h}
function specialArt(def,key){const sp=def.sp||'';const r=prng(hash('s'+key));let h=`<circle cx="0" cy="0" r="54" fill="url(#gHalo)"/>`+shadow(46,30);
  if(sp==='hoard')return h+P('M-36,0 L36,0 L34,40 L-34,40Z','url(#gWood)',3)+P('M-36,0 C-36,-26 36,-26 36,0Z','url(#gWood)',3)+P('M-36,-2 L36,-2 L36,6 L-36,6Z','url(#gGold)',2)+P('M-6,4 L6,4 L6,16 L-6,16Z','url(#gGold)',2)+L('M-20,-18 L-20,40 M20,-18 L20,40','#e0b050',3)+E(0,-14,24,6,'url(#gGold)',`stroke="${INK}" stroke-width="1.6"`)+C(-10,-20,3,'#ff6a8a',1)+C(8,-22,3,'#6ad0ff',1)+L('M-30,-34 l-6,-6 M30,-34 l6,-6 M0,-40 l0,-8','#ffe27a',2.4);
  if(sp==='hire')return heroArt(def,key,'half')+P('M18,20 L44,14 L48,46 L22,52Z','url(#gLeather)',2.4)+L('M22,26 L46,20',INK,1.4);
  if(sp==='steal'||sp==='borrow')return h+P('M-40,20 C-34,0 -20,-8 -6,-6 L20,-14 C28,-16 30,-6 22,-4 L4,2 L30,-2 C38,-2 38,8 30,8 L6,12 L28,14 C36,14 36,24 28,24 L2,22 C-10,30 -30,34 -40,20Z','url(#gSkin1)',2.8)+(sp==='steal'?P('M18,-40 L28,-26 L10,-24Z','url(#gGold)',2)+`<text x="30" y="-36" font-family="Georgia,serif" font-weight="700" font-size="13" fill="#ffe27a" stroke="${INK}" stroke-width="1" paint-order="stroke">Lv</text>`:P('M16,-36 L42,-24 L38,-18 L12,-30Z','url(#gSteel)',2));
  if(sp==='divine')return `<circle cx="0" cy="0" r="54" fill="url(#gHalo)"/>`+levelArt(r,{n:''}).replace('+1','✦');
  if(sp==='illusion')return h+P('M-24,-40 C-24,-56 24,-56 24,-40 L24,30 C24,44 -24,44 -24,30Z','url(#gGold)',3)+P('M-18,-38 C-18,-48 18,-48 18,-38 L18,28 C18,38 -18,38 -18,28Z','url(#gMirror)',2)+`<g transform="scale(.5) translate(0,-10)" opacity=".8">${mBlob(r,6,4,{eyes:1})}</g>`+C(-30,-40,3,'#fff')+C(34,20,2,'#fff');
  if(sp==='lunch')return h+L('M-40,44 L20,-44',INK,5)+L('M-40,44 L20,-44','#9a6030',3)+L('M20,-44 Q40,-10 30,20',INK,1)+P('M22,20 Q36,14 40,24 Q32,32 22,26Z','#9ab0c0',1.8)+`<text x="-30" y="-20" font-family="Georgia,serif" font-weight="700" font-size="11" fill="#f5ecd6" stroke="${INK}" stroke-width="1" paint-order="stroke">BRB</text>`;
  if(sp==='wander')return h+P('M-26,44 L-26,-26 C-26,-50 26,-50 26,-26 L26,44Z','url(#gWood)',3)+P('M-18,44 L-18,-22 C-18,-38 18,-38 18,-22 L18,44Z','#140a0c',2)+C(-6,-10,3,'#ffd23e')+C(6,-10,3,'#ffd23e')+L('M-30,0 L-26,0 M26,0 L30,0',INK,3)+C(12,14,2.4,'url(#gGold)',1);
  if(sp==='cheat')return h+P('M-30,-30 L30,-30 L30,34 L-30,34Z','url(#gParch)',2.6)+L('M-20,-14 L20,-14 M-20,-4 L14,-4 M-20,6 L20,6',dk('#c8b48a',.5),1.8)+C(8,18,11,'none',3,'')+L('M-24,-18 L20,22',"#c0282a",3);
  if(sp==='half'||sp==='super')return h+`<g transform="translate(-14,6) scale(.62)">${heroArt(def,key+'a',sp==='half'?'elf':'wizard')}</g><g transform="translate(16,6) scale(.62)">${heroArt(def,key+'b',sp==='half'?'dwarf':'warrior')}</g>`+P('M-4,-50 L4,-50 L4,-44 L10,-44 L10,-36 L4,-36 L4,-30 L-4,-30 L-4,-36 L-10,-36 L-10,-44 L-4,-44Z','url(#gGold)',1.6);
  return h+P('M-30,-30 L30,-30 L30,34 L-30,34Z','url(#gParch)',2.6)+C(0,2,12,'url(#mg6)',2)}
function enhArt(def,key){const r=prng(hash('e'+key));const nm=(def.n||'').toLowerCase();const up=(def.b||0)>0;let h=`<circle cx="0" cy="0" r="54" fill="url(#${up?'gAura':'gHalo'})"/>`;
  if(def.sp==='mate')return h+`<g transform="translate(-16,6) scale(.6)">${mBlob(r,7,4,{eyes:1})}</g><g transform="translate(18,6) scale(.6)">${mBlob(r,5,4,{eyes:1})}</g>`+P('M0,-30 C-6,-40 -18,-34 -12,-24 L0,-12 L12,-24 C18,-34 6,-40 0,-30Z','url(#mg0)',2.2);
  if(nm.includes('genius'))return h+shadow(46,30)+P('M-30,10 C-40,-10 -30,-40 -6,-40 C0,-48 24,-44 30,-26 C44,-20 40,6 28,10 C24,24 -20,26 -30,10Z','#f0a0b8',3)+L('M-20,-20 q8,-8 16,0 q8,8 16,0 M-24,-2 q10,-6 20,0 q8,6 18,0',dk('#f0a0b8',.35),2)+`<g>${C(-10,26,8,'rgba(200,230,255,.3)',2.4)+C(10,26,8,'rgba(200,230,255,.3)',2.4)}</g>`;
  if(nm.includes('tiny'))return h+`<g transform="translate(0,20) scale(.45)">${mBlob(r,5,2,{eyes:1})}</g>`+L('M-40,-30 L-20,-10 M40,-30 L20,-10 M-40,30 L-20,14 M40,30 L20,14',INK,2.4)+P('M-20,-10 l-2,-8 l8,2Z M20,-10 l2,-8 l-8,2Z',INK,1.4);
  if(nm.includes('furious'))return h+`<g transform="translate(0,6) scale(.9)">${mBlob(r,0,12,{eyes:2})}</g>`+P('M-30,-44 Q-26,-56 -18,-48 Q-14,-60 -6,-50',null,2.4,'stroke="#ff5a3a"')+P('M24,-46 l6,-8 l2,10 l8,-4',null,2.4,'stroke="#ff5a3a"');
  if(nm.includes('primordial'))return h+`<g transform="translate(0,8) scale(.9)">${mTentacle(r,4,14,{eyes:1})}</g>`+E(0,-44,30,6,'none',`stroke="#9cf0ff" stroke-width="1.6" opacity=".6"`);
  if(nm.includes('gargantuan'))return h+`<g transform="translate(0,-4) scale(1.12)">${mBeast(r,10,12,{})}</g>`+L('M-50,50 L50,50',INK,2);
  return h+P('M0,-40 L12,-8 L44,-4 L18,16 L28,46 L0,28 L-28,46 L-18,16 L-44,-4 L-12,-8Z',up?'url(#gFlame)':'url(#mg9)',2.6)}
function cardArt(def,key){const t=def.t;
  if(t==='monster')return monsterArt(def,key);
  if(t==='curse')return curseArt(def,key);
  if(t==='race'||t==='class')return heroArt(def,key,def.art||def.race||def.cls);
  if(t==='item')return itemArt(def,key,def.art||def.slot||(def.hands===2?'2h':def.hands===1?'1h':'misc'));
  if(t==='oneshot')return potionArt(prng(hash('i'+key)),Math.floor(prng(hash('p'+key))()*PAL.length),def);
  if(t==='level')return levelArt(prng(hash('l'+key)),def);
  if(t==='enh')return enhArt(def,key);
  if(t==='special')return specialArt(def,key);
  return itemArt(def,key,'scroll')}
// the art sits in a 120x120 box; the card window is wider than tall, so the backdrop is drawn past the box edges
// In a browser each picture becomes a cached image (blob: URL): the browser rasterises it once per size instead of
// re-painting hundreds of live SVG nodes on every frame. Without blob URLs (jsdom) the SVG stays inline.
const ART_URL=new Map();let DEFS_ONLY='';
const IS_JSDOM=typeof navigator!=='undefined'&&/jsdom/i.test(navigator.userAgent||'');
const CAN_BLOB=typeof Blob!=='undefined'&&typeof URL!=='undefined'&&typeof URL.createObjectURL==='function'&&!(typeof navigator!=='undefined'&&/jsdom/i.test(navigator.userAgent||''));
function artURL(k,body,vb,par){let u=ART_URL.get(k);if(u)return u;if(!DEFS_ONLY)DEFS_ONLY=defsSVG(true);
  const doc=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}"${par?` preserveAspectRatio="${par}"`:''}>${DEFS_ONLY}${body}</svg>`;
  try{u=URL.createObjectURL(new Blob([doc],{type:'image/svg+xml'}))}catch(e){u='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(doc)}ART_URL.set(k,u);return u}
// ...and then each SVG image is flattened once into a bitmap, so painting a card is a plain image draw
const BMP=new Map(),PEND=new Set(),QUEUE=[];let pumping=false;
function want(k,u,w,h){if(BMP.has(k)||PEND.has(k))return;PEND.add(k);QUEUE.push([k,u,w,h]);pump()}
function pump(){if(pumping)return;const n=QUEUE.shift();if(!n)return;pumping=true;const [k,u,w,h]=n;const done=()=>{pumping=false;setTimeout(pump,0)};
  const im=new Image();im.onload=()=>{try{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');if(!x){done();return}x.drawImage(im,0,0,w,h);
    c.toBlob(b=>{if(b){const bu=URL.createObjectURL(b);BMP.set(k,bu);document.querySelectorAll('img[src="'+u+'"]').forEach(e=>{e.src=bu})}done()},'image/webp',.9)}catch(e){done()}};im.onerror=done;im.src=u}
function pic(k,u,w,h){const b=BMP.get(k);if(b)return b;want(k,u,w,h);return u}
function svgArt(def,key,cls){if(CAN_BLOB){const k='a:'+key+':'+def.t;const u=ART_URL.get(k)||artURL(k,cardArt(def,key),'-60 -60 120 120');return `<img class="${cls||'art'}" src="${pic(k,u,320,320)}" alt="" draggable="false">`}
  // headless DOM tests (jsdom) never paint: skip the picture, keep the element
  if(IS_JSDOM)return `<svg class="${cls||'art'}" viewBox="-60 -60 120 120" aria-hidden="true" focusable="false"></svg>`;
  // no blob URLs: a self-contained data: image (one attribute to parse instead of hundreds of SVG nodes)
  const k='a:'+key+':'+def.t;let u=ART_URL.get(k);if(!u){if(!DEFS_ONLY)DEFS_ONLY=defsSVG(true);u='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-60 -60 120 120">${DEFS_ONLY}${cardArt(def,key)}</svg>`);ART_URL.set(k,u)}
  return `<img class="${cls||'art'}" src="${u}" alt="" draggable="false">`}
// ---- card backs: the door deck is oxblood oak with an iron-banded door, the treasure deck is teal with a gilded chest ----
function cardBack(kind){const door=kind!=='tr';const k='back:'+(door?'d':'t');if(IS_JSDOM)return '';
  if(CAN_BLOB&&ART_URL.has(k))return `<img src="${pic(k,ART_URL.get(k),200,284)}" alt="" draggable="false">`;
  let h=`<svg viewBox="0 0 100 142" preserveAspectRatio="none" aria-hidden="true" focusable="false"><rect width="100" height="142" rx="8" fill="url(#${door?'gBackDoor':'gBackTr'})"/>`;
  // lattice pattern
  for(let i=-6;i<12;i++)h+=`<path d="M${i*12},0 L${i*12+71},142 M${i*12+71},0 L${i*12},142" stroke="#000" stroke-opacity=".12" stroke-width="1"/>`;
  h+=`<rect x="5" y="5" width="90" height="132" rx="6" fill="none" stroke="url(#gGold)" stroke-width="2.4"/><rect x="9" y="9" width="82" height="124" rx="4" fill="none" stroke="#f0c860" stroke-opacity=".45" stroke-width=".8"/>`;
  for(const [x,y,r] of [[9,9,0],[91,9,90],[91,133,180],[9,133,270]])h+=`<path transform="translate(${x},${y}) rotate(${r})" d="M0,0 Q10,2 12,12 Q2,10 0,0Z" fill="url(#gGold)" stroke="${INK}" stroke-width=".6"/>`;
  h+=`<ellipse cx="50" cy="64" rx="34" ry="38" fill="url(#gHalo)" opacity=".5"/>`;
  if(door){h+=`<g transform="translate(50,66)"><path d="M-22,34 L-22,-14 C-22,-40 22,-40 22,-14 L22,34Z" fill="url(#gWood)" stroke="${INK}" stroke-width="2.2"/>`+
    `<path d="M-7,34 L-7,-33 M7,34 L7,-33" stroke="#3a1c0c" stroke-width="1.2"/>`+
    `<path d="M-22,-8 L22,-8 M-22,20 L22,20" stroke="#2a2a30" stroke-width="4"/><path d="M-22,-8 L22,-8 M-22,20 L22,20" stroke="#8e9aa8" stroke-width="2"/>`+
    [-16,0,16].map(x=>`<circle cx="${x}" cy="-8" r="1.3" fill="#dfe6ee"/><circle cx="${x}" cy="20" r="1.3" fill="#dfe6ee"/>`).join('')+
    `<circle cx="13" cy="6" r="4.2" fill="none" stroke="url(#gGold)" stroke-width="2"/><circle cx="13" cy="2" r="1.6" fill="url(#gGold)"/>`+
    `<path d="M-28,34 L28,34" stroke="${INK}" stroke-width="3"/></g>`}
  else{h+=`<g transform="translate(50,68)">`+[...Array(10)].map((_,i)=>{const a=i/10*Math.PI*2;return `<path d="M0,-4 L${f(Math.cos(a-.14)*40)},${f(-4+Math.sin(a-.14)*40)} L${f(Math.cos(a+.14)*40)},${f(-4+Math.sin(a+.14)*40)}Z" fill="#ffe7a0" opacity=".18"/>`}).join('')+
    `<path d="M-24,0 L24,0 L22,26 L-22,26Z" fill="url(#gWood)" stroke="${INK}" stroke-width="2"/><path d="M-24,0 C-24,-18 24,-18 24,0Z" fill="url(#gWood)" stroke="${INK}" stroke-width="2"/>`+
    `<path d="M-24,-1 L24,-1 L24,4 L-24,4Z" fill="url(#gGold)" stroke="${INK}" stroke-width="1.2"/><path d="M-13,-12 L-13,26 M13,-12 L13,26" stroke="#e0b050" stroke-width="2.2"/>`+
    `<path d="M-4,2 L4,2 L4,11 L-4,11Z" fill="url(#gGold)" stroke="${INK}" stroke-width="1"/><ellipse cx="0" cy="-10" rx="16" ry="4" fill="url(#gGold)" stroke="${INK}" stroke-width="1"/>`+
    `<circle cx="-6" cy="-13" r="2" fill="#ff6a8a"/><circle cx="6" cy="-14" r="2" fill="#6ad0ff"/></g>`}
  h+=`<rect width="100" height="142" rx="8" fill="url(#gBackShine)"/></svg>`;
  if(CAN_BLOB){const body=h.replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');return `<img src="${pic(k,artURL(k,body,'0 0 100 142','none'),200,284)}" alt="" draggable="false">`}return h}
// ---- the icon set: one consistent line+fill style, 24x24, uses currentColor ----
const ICONS={
 scroll:'<path d="M6 4h11a3 3 0 0 1 3 3v1h-4v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-1h11V7a3 3 0 0 0-3-3" fill="currentColor" fill-opacity=".18"/><path d="M6 4h11a3 3 0 0 1 3 3v1h-4M6 4a3 3 0 0 0-3 3M16 8v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3v-1h10M8 9h5M8 12h5"/>',
 rivals:'<circle cx="8.5" cy="8" r="3.2" fill="currentColor" fill-opacity=".2"/><circle cx="16.5" cy="9" r="2.6"/><path d="M2.5 20c.6-3.6 3-5.5 6-5.5s5.4 1.9 6 5.5M14.5 14.8c3.2-.6 6.2 1.2 7 5.2"/><circle cx="8.5" cy="8" r="3.2"/>',
 book:'<path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5z" fill="currentColor" fill-opacity=".15"/><path d="M12 6.5C10 5 7 4.5 3.5 5v13c3.5-.5 6.5 0 8.5 1.5 2-1.5 5-2 8.5-1.5V5C17 4.5 14 5 12 6.5zM12 6.5v13"/>',
 sound:'<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" fill-opacity=".2"/><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/>',
 mute:'<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor" fill-opacity=".2"/><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4zM16 9.5l5 5M21 9.5l-5 5"/>',
 music:'<path d="M9 17.5V6l10-2v11.5"/><circle cx="6.5" cy="17.5" r="2.5" fill="currentColor"/><circle cx="16.5" cy="15.5" r="2.5" fill="currentColor"/>',
 slow:'<path d="M6 3h12M6 21h12M7 3c0 5 5 6 5 9s-5 4-5 9M17 3c0 5-5 6-5 9s5 4 5 9"/><path d="M9 19c0-2 3-3 3-5 0 2 3 3 3 5z" fill="currentColor"/>',
 normal:'<path d="M8 5.5v13l10-6.5z" fill="currentColor" fill-opacity=".25"/><path d="M8 5.5v13l10-6.5z"/>',
 fast:'<path d="M4 6v12l7.5-6zM12.5 6v12l7.5-6z" fill="currentColor" fill-opacity=".25"/><path d="M4 6v12l7.5-6zM12.5 6v12l7.5-6z"/>',
 pause:'<rect x="6.5" y="5" width="4" height="14" rx="1" fill="currentColor" fill-opacity=".25"/><rect x="13.5" y="5" width="4" height="14" rx="1" fill="currentColor" fill-opacity=".25"/><rect x="6.5" y="5" width="4" height="14" rx="1"/><rect x="13.5" y="5" width="4" height="14" rx="1"/>',
 play:'<path d="M8 5.5v13l10-6.5z" fill="currentColor" fill-opacity=".25"/><path d="M8 5.5v13l10-6.5z"/>',
 hint:'<path d="M9 17.5h6M10 20.5h4M12 3a6 6 0 0 0-3.8 10.6c.6.6 1 1.3 1 2.1v1.8h5.6v-1.8c0-.8.4-1.5 1-2.1A6 6 0 0 0 12 3z" /><path d="M12 3a6 6 0 0 0-3.8 10.6c.6.6 1 1.3 1 2.1v1.8h5.6v-1.8c0-.8.4-1.5 1-2.1A6 6 0 0 0 12 3z" fill="currentColor" fill-opacity=".2"/>',
 menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
 dock:'<path d="M4 5h16v14H4zM15 5v14" /><path d="M9 10l2.5 2L9 14"/>',
 sword:'<path d="M14.5 4H20v5.5L9 20.5l-5.5-5.5z" fill="currentColor" fill-opacity=".2"/><path d="M14.5 4H20v5.5L9 20.5M3.5 15l5.5 5.5M6.5 12.5l5 5M4 20l2.5-2.5"/>',
 hand:'<rect x="4" y="6" width="9" height="13" rx="1.6" transform="rotate(-12 8.5 12.5)" fill="currentColor" fill-opacity=".15"/><rect x="4" y="6" width="9" height="13" rx="1.6" transform="rotate(-12 8.5 12.5)"/><rect x="11" y="5" width="9" height="13" rx="1.6" transform="rotate(10 15.5 11.5)" fill="currentColor" fill-opacity=".3"/><rect x="11" y="5" width="9" height="13" rx="1.6" transform="rotate(10 15.5 11.5)"/>',
 bag:'<path d="M7 8h10l2 12H5z" fill="currentColor" fill-opacity=".2"/><path d="M7 8h10l2 12H5zM9 8V6.5a3 3 0 0 1 6 0V8M9 12h6"/>',
 cloud:'<path d="M7 17.5h10a4 4 0 0 0 .5-8 5.5 5.5 0 0 0-10.5 1.5A3.3 3.3 0 0 0 7 17.5z" fill="currentColor" fill-opacity=".25"/><path d="M7 17.5h10a4 4 0 0 0 .5-8 5.5 5.5 0 0 0-10.5 1.5A3.3 3.3 0 0 0 7 17.5zM11 17.5l-1.5 3.5M15 17.5l-1.5 3.5"/>',
 skull:'<path d="M12 3a7.5 7.5 0 0 0-5 13.1V19h10v-2.9A7.5 7.5 0 0 0 12 3z" fill="currentColor" fill-opacity=".2"/><path d="M12 3a7.5 7.5 0 0 0-5 13.1V19h10v-2.9A7.5 7.5 0 0 0 12 3zM10 19v2M14 19v2"/><circle cx="9" cy="11" r="1.7" fill="currentColor"/><circle cx="15" cy="11" r="1.7" fill="currentColor"/>',
 coin:'<ellipse cx="12" cy="12" rx="8" ry="8" fill="currentColor" fill-opacity=".25"/><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="5"/><path d="M12 9.5v5"/>',
 door:'<path d="M6 21V6a6 6 0 0 1 12 0v15z" fill="currentColor" fill-opacity=".2"/><path d="M4 21h16M6 21V6a6 6 0 0 1 12 0v15M12 3v18"/><circle cx="14.5" cy="13" r="1" fill="currentColor"/>',
 chest:'<path d="M3.5 10h17v9.5h-17z" fill="currentColor" fill-opacity=".25"/><path d="M3.5 10a5 5 0 0 1 5-5h7a5 5 0 0 1 5 5v9.5h-17zM3.5 10h17M10.5 10v3h3v-3"/>',
 die:'<rect x="4" y="4" width="16" height="16" rx="3.5" fill="currentColor" fill-opacity=".15"/><rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="8.5" cy="8.5" r="1.3" fill="currentColor"/><circle cx="15.5" cy="15.5" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/>',
 run:'<circle cx="14.5" cy="4.5" r="2" fill="currentColor"/><path d="M10 21l2.5-5.5L10 12l4-4 3 4h3M13 8l-4.5 1-2 3.5M12.5 15.5l3 1.5 1 4"/><path d="M2.5 9h3M1.5 13h3" opacity=".6"/>',
 help:'<path d="M8 21v-6.5L5.5 11a1.5 1.5 0 0 1 2.5-1.5l2 2.5V4.5a1.5 1.5 0 0 1 3 0V11V3.5a1.5 1.5 0 0 1 3 0V11V5a1.5 1.5 0 0 1 3 0v9.5c0 4-2.5 6.5-6 6.5z" fill="currentColor" fill-opacity=".2"/><path d="M8 21v-6.5L5.5 11a1.5 1.5 0 0 1 2.5-1.5l2 2.5V4.5a1.5 1.5 0 0 1 3 0V11M13 11V3.5a1.5 1.5 0 0 1 3 0V11M16 11V5a1.5 1.5 0 0 1 3 0v9.5c0 4-2.5 6.5-6 6.5H8"/>',
 trophy:'<path d="M7 4h10v5a5 5 0 0 1-10 0z" fill="currentColor" fill-opacity=".25"/><path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4.5M17 6h3a3 3 0 0 1-3 4.5M12 14v3.5M8 20.5h8M9.5 17.5h5v3h-5z"/>',
 warn:'<path d="M12 3.5l9.5 16.5h-19z" fill="currentColor" fill-opacity=".2"/><path d="M12 3.5l9.5 16.5h-19zM12 10v4.5"/><circle cx="12" cy="17.2" r="1.1" fill="currentColor"/>',
 check:'<path d="M4.5 12.5l5 5 10-11"/>',
 cross:'<path d="M6 6l12 12M18 6L6 18"/>',
 star:'<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z" fill="currentColor" fill-opacity=".3"/><path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7z"/>',
 race:'<path d="M12 3c4 0 7 3 7 7 0 5-4 8-7 11-3-3-7-6-7-11 0-4 3-7 7-7z" fill="currentColor" fill-opacity=".2"/><path d="M12 3c4 0 7 3 7 7 0 5-4 8-7 11-3-3-7-6-7-11 0-4 3-7 7-7zM9 9.5c1 1 5 1 6 0M9.5 14c1.5 1 3.5 1 5 0"/>',
 cls:'<path d="M3 9l9-5 9 5-9 5z" fill="currentColor" fill-opacity=".25"/><path d="M3 9l9-5 9 5-9 5zM7 11.5V16c3 2.5 7 2.5 10 0v-4.5M21 9v6"/>',
 helm:'<path d="M4 15a8 8 0 0 1 16 0v3H4z" fill="currentColor" fill-opacity=".2"/><path d="M4 15a8 8 0 0 1 16 0v3H4zM12 7v6M4 15h16"/>',
 boot:'<path d="M7 3h6v9l5 2a3 3 0 0 1 2 3v2H6z" fill="currentColor" fill-opacity=".2"/><path d="M7 3h6v9l5 2a3 3 0 0 1 2 3v2H6l1-16zM6 21h14"/>',
 shield:'<path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" fill="currentColor" fill-opacity=".2"/><path d="M12 3l8 3v5c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6zM12 3v18"/>',
 potion:'<path d="M9.5 3h5M10 3v5.5L5.5 16a3.5 3.5 0 0 0 3 5h7a3.5 3.5 0 0 0 3-5L14 8.5V3"/><path d="M7.5 14h9l1.5 2.5a2 2 0 0 1-1.8 3H7.8A2 2 0 0 1 6 16.5z" fill="currentColor" fill-opacity=".35"/>',
 spark:'<path d="M12 3l1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8z" fill="currentColor" fill-opacity=".3"/><path d="M12 3l1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8z"/>',
 chat:'<path d="M4 5h16v11H10l-5 4v-4H4z" fill="currentColor" fill-opacity=".2"/><path d="M4 5h16v11H10l-5 4v-4H4z"/>',
 bot:'<rect x="4.5" y="8" width="15" height="11" rx="3" fill="currentColor" fill-opacity=".2"/><rect x="4.5" y="8" width="15" height="11" rx="3"/><path d="M12 8V4.5M9.5 13h.01M14.5 13h.01M9.5 16h5"/><circle cx="12" cy="4" r="1.2" fill="currentColor"/>',
 swap:'<path d="M4 8h14l-3-3M20 16H6l3 3"/>',
 gem:'<path d="M6 4h12l3.5 5L12 21 2.5 9z" fill="currentColor" fill-opacity=".25"/><path d="M6 4h12l3.5 5L12 21 2.5 9zM2.5 9h19M9 4l-1 5 4 12 4-12-1-5"/>',
 down:'<path d="M4 7l6 6 3-3 7 7M20 12v5h-5"/>',
 male:'<circle cx="10" cy="14" r="5"/><path d="M13.5 10.5L20 4M15 4h5v5"/>',
 female:'<circle cx="12" cy="9" r="5"/><path d="M12 14v7M9 18h6"/>',
 party:'<path d="M4 20l4-12 8 8z" fill="currentColor" fill-opacity=".3"/><path d="M4 20l4-12 8 8zM14 4v2M18 6l-1.5 1.5M20 10h-2M11 7c1-2 3-2 3-2M16 12c2-1 3 0 3 0"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 swords:'<path d="M4 3h3.5L17 12.5 14.5 15 4 4.5z" fill="currentColor" fill-opacity=".3"/><path d="M20 3h-3.5L7 12.5 9.5 15 20 4.5z" fill="currentColor" fill-opacity=".3"/><path d="M4 3h3.5L17 12.5M4 3v1.5L14.5 15M20 3h-3.5L7 12.5M20 3v1.5L9.5 15M12.5 17l4 4M18.5 19l2-2M11.5 17l-4 4M5.5 19l-2-2M15 13.5l2.8 3.3M9 13.5l-2.8 3.3"/>',
 x:'<path d="M6 6l12 12M18 6L6 18"/>'};
function ic(n,cls){return `<svg class="ic${cls?' '+cls:''}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><use href="#i-${n}"/></svg>`}
// ---- the shared defs ----
function defsSVG(only){const g=(id,stops,x)=>`<radialGradient id="${id}" ${x||'cx=".36" cy=".3" r=".78"'}>${stops.map(([o,c,a])=>`<stop offset="${o}" stop-color="${c}"${a!=null?` stop-opacity="${a}"`:''}/>`).join('')}</radialGradient>`;
  const lg=(id,stops,x)=>`<linearGradient id="${id}" ${x||'x1="0" y1="0" x2="0" y2="1"'}>${stops.map(([o,c,a])=>`<stop offset="${o}" stop-color="${c}"${a!=null?` stop-opacity="${a}"`:''}/>`).join('')}</linearGradient>`;
  let d='';PAL.forEach((c,i)=>d+=g('mg'+i,[[0,lt(c,.55)],[.45,c],[1,dk(c,.5)]]));
  d+=g('gShadow',[[0,'#000',.55],[1,'#000',0]],'cx=".5" cy=".5" r=".5"');
  d+=g('gGloss',[[0,'#fff',.85],[1,'#fff',0]],'cx=".5" cy=".5" r=".5"');
  d+=g('gEye',[[0,'#ffffff'],[.7,'#f4efe4'],[1,'#c9bfae']]);
  d+=g('gMouth',[[0,'#7a2230'],[1,'#2a0a12']],'cx=".5" cy=".3" r=".8"');
  d+=g('gBone',[[0,'#fffaf0'],[.55,'#eadfc6'],[1,'#a8977a']]);
  d+=g('gCloth',[[0,'#f6ecd4'],[.6,'#dccca8'],[1,'#9c8a68']]);
  d+=lg('gSteel',[[0,'#f4f8fc'],[.35,'#b9c4d0'],[.55,'#7d8a98'],[.8,'#c9d2dc'],[1,'#5f6a78']],'x1="0" y1="0" x2="1" y2="1"');
  d+=g('gSteelD',[[0,'#aab4c0'],[1,'#3d4652']]);
  d+=lg('gGold',[[0,'#fff3b8'],[.3,'#f2c450'],[.6,'#b07a1a'],[.85,'#f0c860'],[1,'#7a4c0c']],'x1="0" y1="0" x2="1" y2="1"');
  d+=lg('gWood',[[0,'#c98a4a'],[.5,'#8f5626'],[1,'#5a3214']],'x1="0" y1="0" x2="1" y2="1"');
  d+=lg('gLeather',[[0,'#a8683a'],[.6,'#6e3e1e'],[1,'#44240f']],'x1="0" y1="0" x2="1" y2="1"');
  d+=g('gStone',[[0,'#d4d0c6'],[.6,'#8c8a84'],[1,'#4a4844']]);
  d+=g('gClay',[[0,'#f0a070'],[.6,'#c0602c'],[1,'#7a3414']]);
  d+=g('gLeaf',[[0,'#b8e07a'],[.6,'#5f9e3a'],[1,'#2f5e1c']]);
  d+=g('gBread',[[0,'#ffe0a0'],[.6,'#e0a050'],[1,'#9a5a20']]);
  d+=g('gFeather',[[0,'#ffffff'],[.6,'#e4ddd0'],[1,'#a49a8a']]);
  d+=g('gCork',[[0,'#e8c08a'],[1,'#8a5a2a']]);
  d+=g('gIvory',[[0,'#fffdf6'],[.7,'#efe6d0'],[1,'#b8aa88']]);
  d+=g('gParch',[[0,'#fff6dc'],[.7,'#ecdcb0'],[1,'#c4a870']]);
  d+=g('gMirror',[[0,'#e8f6ff'],[.6,'#8ab0c8'],[1,'#3a5468']]);
  d+=g('gCloud',[[0,'#8a8098'],[.6,'#4a4058'],[1,'#241c2e']]);
  d+=g('gHex',[[0,'#8a4ad0',.55],[.6,'#3a1a5a',.25],[1,'#000',0]],'cx=".5" cy=".5" r=".5"');
  d+=g('gHalo',[[0,'#fff2c0',.55],[.55,'#ffd070',.14],[1,'#000',0]],'cx=".5" cy=".5" r=".5"');
  d+=g('gHeroBg',[[0,'#bfe6ff',.45],[.6,'#4a90c0',.14],[1,'#000',0]],'cx=".5" cy=".5" r=".5"');
  d+=g('gAura',[[0,'#ff6a3a',.5],[.6,'#a01818',.18],[1,'#000',0]],'cx=".5" cy=".5" r=".5"');
  d+=lg('gArch',[[0,'#fff',.08],[1,'#fff',.02]]);
  d+=lg('gFloor',[[0,'#000',.0],[1,'#000',.35]]);
  d+=lg('gBolt',[[0,'#fff8c0'],[.5,'#ffd23e'],[1,'#e8820c']]);
  d+=lg('gFlame',[[0,'#fff6b0'],[.4,'#ffb02e'],[1,'#d8340c']],'x1="0" y1="0" x2="0" y2="1"');
  d+=g('gFlameR',[[0,'#fffbe0'],[.4,'#ffd060'],[1,'#ff7a1a',.2]],'cx=".5" cy=".6" r=".6"');
  d+=lg('gBrick',[[0,'#d87a5a'],[1,'#8a3a24']]);
  d+=g('gGlass',[[0,'#eaf6ff',.5],[.7,'#9cc4e0',.22],[1,'#e8f4ff',.55]],'cx=".4" cy=".4" r=".7"');
  d+=lg('gGlassShade',[[0,'#fff',.25],[.5,'#fff',0],[1,'#000',.3]],'x1="0" y1="0" x2="1" y2="0"');
  d+=lg('gBackDoor',[[0,'#7a2418'],[.5,'#4a120c'],[1,'#2a0806']],'x1="0" y1="0" x2="1" y2="1"');
  d+=lg('gBackTr',[[0,'#1f6a6a'],[.5,'#0f3e44'],[1,'#062226']],'x1="0" y1="0" x2="1" y2="1"');
  d+=lg('gBackShine',[[0,'#fff',.18],[.4,'#fff',0],[1,'#000',.25]],'x1="0" y1="0" x2="1" y2="1"');
  ['#ffe0c2','#f1c27d','#c68642','#8d5524'].forEach((c,i)=>d+=g('gSkin'+i,[[0,lt(c,.45)],[.55,c],[1,dk(c,.35)]]));
  if(only)return `<defs>${d}</defs>`;
  let s='';for(const k in ICONS)s+=`<symbol id="i-${k}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${ICONS[k]}</symbol>`;
  return `<svg id="artdefs" xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden" aria-hidden="true" focusable="false"><defs>${d}</defs>${s}</svg>`}
function mountDefs(){if(typeof document==='undefined'||document.getElementById('artdefs'))return;const w=document.createElement('div');w.innerHTML=defsSVG();(document.body||document.documentElement).insertBefore(w.firstChild,(document.body||document.documentElement).firstChild)}
mountDefs();
window.svgArt=svgArt;window.cardBack=cardBack;window.cardArt=cardArt;window.ic=ic;window.artHash=hash;
})();
