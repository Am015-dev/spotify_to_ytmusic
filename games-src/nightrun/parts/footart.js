/* ---------- ON-FOOT ART: window.FA (the street stage's pictures). Inert until games-src/nightrun/parts/foot.js calls it.
   FA.POSES / FA.WHO       the 11 poses and the 11 characters (kai hero; enemies; warden boss also has 'attack2' and 'enrage': FA.POSES_BOSS)
   FA.has(who,pose)        true when the REAL picture media/foot/<who>-<pose>.webp is loaded (only files listed in media/ready.json are tried, so the hatched placeholder files are never shown)
   FA.draw(ctx,who,pose,x,y,h,flip,t)   x,y = feet position, h = height in px, flip = true faces left (art faces right), t = seconds (run cycle, breathing, flashes).
                           For 'die' pass the SECONDS SINCE DEATH (falls over in 0.6 s, fades to 15% by 1.2 s). 'run' alternates run-a/run-b by itself. Machines (drone, turret, mech) have idle/shoot/hit/die; other poses draw idle.
   FA.bg(ctx,layer,camX,w,h)  layers sky, far, mid, near, floor (parallax 0.02/0.12/0.35/0.7/1). The street line is FA.floorY(h) = 80% of h. Draw order: sky, far, mid, near, [actors], floor.
   FA.pickup(ctx,id,x,y,size,t) / FA.scenery(ctx,id,x,y,h)   centred / feet-anchored placeholders for media/foot/pk-<id>.webp and sc-<id>.webp (the picture when it is real).
   Everything is plain shapes until the painted file exists; no per-frame allocation except small arrays. ---------- */
(()=>{
const POSES=['idle','run-a','run-b','jump','fall','shoot','melee','hit','die','crouch','crouch-shoot'];
const WHO=['kai','grunt','gunman','shield','bruiser','knife','sniper','drone','turret','mech','warden'];
const HUM={kai:{c:'#19e3ff',d:'#0b3b52',g:'pistol',hood:1,sat:1,k:'KA'},grunt:{c:'#ff8a3d',d:'#6b3412',g:'pipe',k:'GR'},gunman:{c:'#ff4060',d:'#6b1428',g:'pistol',k:'GU'},
  shield:{c:'#4a7bff',d:'#162a6b',g:'baton',shield:1,w:1.1,k:'SH'},bruiser:{c:'#a24bff',d:'#3a1670',g:'fist',w:1.45,big:1,k:'BR'},knife:{c:'#3dff8a',d:'#10602f',g:'knife',w:.9,k:'KN'},
  sniper:{c:'#ffd23d',d:'#665010',g:'rifle',w:.95,k:'SN'},warden:{c:'#ff3030',d:'#5a1010',g:'blade',w:1.5,boss:1,k:'WA'}};
const MAC={drone:{c:'#19e3b0',d:'#0b5a48',k:'DR',nat:.75},turret:{c:'#ff7ad0',d:'#6b2858',k:'TU',nat:.42},mech:{c:'#9fb3c8',d:'#3b4a5a',k:'ME',nat:.95}};
const FA={POSES,WHO,POSES_BOSS:POSES.concat(['attack2','enrage']),MACHINES:['drone','turret','mech'],base:null,_rd:new Set(),_im:{},_init:false};
window.FA=FA;
/* ---- real pictures: ready.json lists the painted files; each is loaded once (a failed load is remembered and silently ignored) ---- */
FA._base=()=>FA.base||(typeof ART!=='undefined'&&ART.base)||'media/';
FA._load=f=>{if(FA._im[f]||typeof Image==='undefined')return;const r={ok:false,bad:false,im:new Image()};r.im.onload=()=>{r.ok=true;};r.im.onerror=()=>{r.bad=true;};r.im.src=FA._base()+f;FA._im[f]=r;};
FA.ready=a=>{if(!Array.isArray(a))return;for(const f of a)if(typeof f==='string'&&f.indexOf('foot/')===0){FA._rd.add(f);FA._load(f);}};
FA.init=()=>{if(FA._init)return;FA._init=true;if(typeof fetch==='function')fetch(FA._base()+'ready.json').then(r=>r.json()).then(FA.ready).catch(()=>{});};
FA._pic=f=>{FA.init();const r=FA._im[f];return r&&r.ok?r.im:null;};
FA.has=(who,pose)=>!!FA._pic('foot/'+who+'-'+pose+'.webp');
/* ---- helpers ---- */
const shade=(hex,f)=>{const n=parseInt(hex.slice(1),16);return 'rgb('+Math.min(255,Math.round((n>>16)*f))+','+Math.min(255,Math.round(((n>>8)&255)*f))+','+Math.min(255,Math.round((n&255)*f))+')';};
const lp=(x,y,th,l)=>[x+l*Math.sin(th),y+l*Math.cos(th)];   // angles are measured from straight down, positive = forward (+x)
const limb=(ctx,pts,w,col)=>{ctx.strokeStyle=col;ctx.lineWidth=w;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)ctx.lineTo(pts[i][0],pts[i][1]);ctx.stroke();};
const dot=(ctx,x,y,r,col)=>{ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,r,0,6.2832);ctx.fill();};
const flash=(ctx,x,y,t,r)=>{const big=Math.floor(t*18)%2===0,R=r*(big?1:.6);ctx.fillStyle='#ff9a2d';ctx.beginPath();for(let i=0;i<16;i++){const a=i*.3927,q=i%2?R*.4:R;ctx.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}ctx.closePath();ctx.fill();dot(ctx,x,y,R*.4,'#fff6a0');};
let SHD=null;
const shadow=(ctx,wd,a)=>{if(a<=.02)return;if(!SHD){const c=document.createElement('canvas');c.width=64;c.height=16;const g=c.getContext('2d'),r=g.createRadialGradient(32,8,0,32,8,32);r.addColorStop(0,'rgba(0,0,0,.85)');r.addColorStop(.6,'rgba(0,0,0,.4)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.translate(0,8);g.scale(1,.25);g.translate(0,-32);g.fillRect(0,0,64,64);SHD=c;}
  const o=ctx.globalAlpha;ctx.globalAlpha=o*.55*a;ctx.drawImage(SHD,-wd*.6,-wd*.09,wd*1.2,wd*.18);ctx.globalAlpha=o;};   // same soft ellipse as the ground bosses' road shadow (UIK.bossShadow), flat on the street line
const label=(ctx,txt,x,y,S,col)=>{ctx.save();ctx.scale(1/S,1/S);ctx.fillStyle=col;ctx.font='700 '+Math.max(8,Math.round(.1*S))+'px "Share Tech Mono",monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(txt,x*S,y*S);ctx.restore();};
/* ---- humanoid pose table: lf/lb = [thigh angle, knee bend] of front/back leg, af/ab = [upper arm, forearm] (af holds the weapon), lean, lift (feet off the ground) ---- */
function pp(pose,t,d){
  const s=Math.sin,rg=d.g==='pistol'||d.g==='rifle',aim=rg?[1.5,1.57]:[1.35,1.45];
  switch(pose){
    case'run-a':return{lf:[.85,1.0],lb:[-.55,.35],af:[.8,1.3],ab:[-.7,.5],lean:.14,lift:.0};
    case'run-b':return{lf:[-.55,.35],lb:[.85,1.0],af:[.9,1.4],ab:[.8,1.0],lean:.14,lift:.0};
    case'jump':return{lf:[.9,1.5],lb:[.3,1.6],af:[1.3,1.5],ab:[2.4,1.9],lean:.05,lift:.12};
    case'fall':return{lf:[.25,.2],lb:[-.25,.4],af:[1.4,1.5],ab:[2.6,2.4],lean:-.05,lift:.1};
    case'shoot':return{lf:[.4,.2],lb:[-.35,.25],af:[aim[0]+s(t*40)*.03,aim[1]],ab:rg?[1.35,1.5]:[.5,.9],lean:.06,lift:0,fl:rg};
    case'melee':{const p=(t*4)%1,a=-1.3+p*3.5;return{lf:[.55,.3],lb:[-.6,.35],af:[a,a+.3],ab:[-.4,.6],lean:.14+.1*s(p*3.14),lift:0,swing:a};}
    case'hit':return{lf:[.3,.2],lb:[-.3,.4],af:[-.6,.4],ab:[.4,.2],lean:-.3,lift:0,fl:0,white:1};
    case'die':return{lf:[.6,.8],lb:[-.4,.6],af:[1.8,1.2],ab:[-1,.5],lean:-.15,lift:0};
    case'crouch':return{lf:[1.2,2.3],lb:[-.3,2.3],af:[.9,1.4],ab:[.3,.8],lean:.25,lift:0};
    case'crouch-shoot':return{lf:[1.2,2.3],lb:[-.3,2.3],af:[aim[0]+.1,aim[1]],ab:[1.4,1.5],lean:.2,lift:0,fl:rg};
    case'attack2':{const p=(t*1.4)%1,a=p<.55?3.0-2.6*(p/.55):.4;return{lf:[.5,.3],lb:[-.5,.3],af:[a,a],ab:[a,a],lean:p<.55?-.1:.3,lift:0};}
    case'enrage':return{lf:[.25,.2],lb:[-.25,.2],af:[2.0+s(t*30)*.05,2.3],ab:[-2.0-s(t*30)*.05,-2.3],lean:-.05,lift:0,rage:1};
    default:return{lf:[.1,.1],lb:[-.1,.1],af:[.55,1.2],ab:[.15,.3],lean:.02,lift:0,bob:s(t*3)*.006};
  }}
function hum(ctx,id,pose,t,S){
  const d=HUM[id]||HUM.grunt,P=pp(pose,t,d),W=d.w||1,fl=pose==='hit',K=c=>fl?'#fff':c,L1=.22,L2=.22,TL=.27,U1=.17,U2=.16;
  if(P.rage){ctx.fillStyle='rgba(255,40,40,'+(.18+.1*Math.sin(t*14))+')';ctx.beginPath();ctx.ellipse(0,-.45,.5,.55,0,0,6.3);ctx.fill();}
  const drop=Math.max(L1*Math.cos(P.lf[0])+L2*Math.cos(P.lf[0]-P.lf[1]),L1*Math.cos(P.lb[0])+L2*Math.cos(P.lb[0]-P.lb[1])),run=pose==='run-a'||pose==='run-b';
  const hx=0,hy=-drop-P.lift+(P.bob||0)-(run?.012:0);
  const leg=(a,col)=>{const k=lp(hx,hy,a[0],L1),n=lp(k[0],k[1],a[0]-a[1],L2);limb(ctx,[[hx,hy],k,n,[n[0]+.08,n[1]]],.075*W,K(col));};
  const sh=[hx+TL*Math.sin(P.lean),hy-TL*Math.cos(P.lean)],sp=[hx+TL*.88*Math.sin(P.lean),hy-TL*.88*Math.cos(P.lean)];
  const arm=(a,col,aw)=>{const e=lp(sp[0],sp[1],a[0],U1),h=lp(e[0],e[1],a[1],U2);limb(ctx,[sp,e,h],aw||.06*W,K(col));return h;};
  if(d.boss){ctx.fillStyle=K('#3a0a0a');ctx.beginPath();ctx.moveTo(sp[0],sp[1]);ctx.lineTo(sp[0]-.3,hy+.2);ctx.lineTo(sp[0]-.05,hy+.28);ctx.lineTo(hx+.04,hy);ctx.fill();}   // cape
  leg(P.lb,shade(d.d,.7));arm(P.ab,shade(d.d,.9));
  limb(ctx,[[hx,hy],sh],.19*W,K(d.c));                                                  // torso
  limb(ctx,[[hx,hy+.01],[hx,hy-.01]],.2*W,K(d.d));                                      // belt
  if(d.sat){limb(ctx,[[hx-.1,hy-.2],[hx-.12,hy-.05]],.09,K('#7a5a30'));}                // courier satchel on the back
  const hdx=Math.sin(P.lean)*.1,hc=[sh[0]+hdx,sh[1]-.09*Math.cos(P.lean)],hr=.075*(d.big?1.15:d.boss?1.1:1);
  dot(ctx,hc[0],hc[1],hr,K('#e8b894'));
  ctx.fillStyle=K(d.hood?d.d:shade(d.d,.8));ctx.beginPath();ctx.arc(hc[0]-.006,hc[1]-.004,hr*(d.hood?1.12:1.02),3.14,6.28);ctx.lineTo(hc[0]+hr,hc[1]+(d.hood?.04:-.01));ctx.lineTo(hc[0]-hr,hc[1]+.02);ctx.fill();   // hood / cap
  if(!fl){dot(ctx,hc[0]+hr*.45,hc[1]+.005,hr*.2,d.boss?'#ffd23d':'#fff');if(d.boss){ctx.fillStyle='#ffd23d';ctx.beginPath();ctx.moveTo(hc[0]-.02,hc[1]-hr);ctx.lineTo(hc[0]-.05,hc[1]-hr-.09);ctx.lineTo(hc[0]+.03,hc[1]-hr);ctx.fill();}}
  if(d.boss){dot(ctx,sp[0],sp[1],.07,K('#ffd23d'));}                                    // gold shoulder pad
  leg(P.lf,d.d);
  const front=d.big&&P.swing==null?arm(P.af,d.c,.13):arm(P.af,d.c);                      // bruiser: the big cyber arm
  if(d.big&&!fl){dot(ctx,front[0],front[1],.07,K('#19e3ff'));}
  const dx=Math.sin(P.af[1]),dy=Math.cos(P.af[1]);let tip=[front[0],front[1]];
  const bar=(len,w,col)=>{limb(ctx,[[front[0]-dx*.03,front[1]-dy*.03],[front[0]+dx*len,front[1]+dy*len]],w,K(col));tip=[front[0]+dx*len,front[1]+dy*len];};
  if(d.g==='pistol')bar(.13,.035,'#222');else if(d.g==='rifle')bar(.38,.03,'#222');else if(d.g==='pipe')bar(.28,.04,'#aab');else if(d.g==='baton')bar(.22,.04,'#ddd');
  else if(d.g==='knife')bar(.13,.03,'#e8f4ff');else if(d.g==='blade')bar(.42,.05,'#ffe6a0');else if(d.g==='fist')bar(.02,.1,d.d);
  if(d.shield){ctx.fillStyle=K('rgba(120,170,255,.75)');ctx.strokeStyle=K('#dfe8ff');ctx.lineWidth=.02;ctx.beginPath();ctx.rect(sh[0]+.1,sh[1]-.02,.07,.5);ctx.fill();ctx.stroke();}   // riot shield in front of the body
  if(P.fl&&!fl)flash(ctx,tip[0]+.05,tip[1],t,.09);
  if(P.swing!=null&&!fl){ctx.strokeStyle='rgba(255,255,255,.55)';ctx.lineWidth=.025;ctx.beginPath();ctx.arc(sp[0],sp[1],.42,P.swing-.2,P.swing+.9);ctx.stroke();}   // swing arc hint
  if(S*.9>40)label(ctx,d.k,hx+.02,(hy+sh[1])/2,S,fl?'#999':'#06060e');
}
/* ---- machines ---- */
function mac(ctx,id,pose,t,S,u){
  const m=MAC[id],fl=pose==='hit',K=c=>fl?'#fff':c,sho=pose==='shoot',die=pose==='die',sk=die?Math.sin(t*50)*.01:0;
  if(die){const e=Math.min(1,u/.9);ctx.fillStyle='rgba(255,'+Math.round(160-100*e)+',40,'+(.9*(1-e))+')';ctx.beginPath();ctx.arc(0,-.3,.12+.5*e,0,6.3);ctx.fill();ctx.strokeStyle='rgba(255,230,160,'+(1-e)+')';ctx.lineWidth=.03;ctx.beginPath();ctx.arc(0,-.3,.2+.7*e,0,6.3);ctx.stroke();}
  ctx.translate(sk,0);
  if(id==='drone'){const cy=-.5+Math.sin(t*3)*.03+(die?.4*Math.min(1,u*u*2):0);
    ctx.fillStyle=K(m.c);ctx.beginPath();ctx.ellipse(0,cy,.3,.12,0,0,6.3);ctx.fill();ctx.fillStyle=K(shade(m.c,1.25));ctx.beginPath();ctx.ellipse(0,cy-.07,.17,.1,0,3.14,6.3);ctx.fill();
    dot(ctx,.1,cy,.045,K(sho?'#fff':'#ff2040'));for(const x of[-.18,.18]){ctx.fillStyle='rgba(220,255,255,'+(.4+.3*Math.sin(t*60+x*9))+')';ctx.beginPath();ctx.ellipse(x,cy-.17,.17,.02,0,0,6.3);ctx.fill();limb(ctx,[[x,cy-.1],[x,cy-.17]],.02,K(m.d));}
    limb(ctx,[[.1,cy+.1],[.28,cy+.1]],.04,K('#222'));if(sho)flash(ctx,.32,cy+.1,t,.09);if(S>40)label(ctx,m.k,-.03,cy,S,'#06060e');}
  else if(id==='turret'){const rec=sho?-.03*(Math.floor(t*18)%2):0;
    ctx.fillStyle=K(m.d);ctx.beginPath();ctx.moveTo(-.28,0);ctx.lineTo(.28,0);ctx.lineTo(.2,-.17);ctx.lineTo(-.2,-.17);ctx.fill();dot(ctx,0,-.2,.17,K(m.c));ctx.fillStyle=K(m.c);ctx.fillRect(-.17,-.2,.34,.03);
    const bx=Math.cos(-.2),by=Math.sin(-.2);limb(ctx,[[.05,-.23],[.05+(.42+rec)*bx,-.23+(.42+rec)*by]],.07,K('#222'));if(sho)flash(ctx,.05+.47*bx,-.23+.47*by,t,.1);if(S>40)label(ctx,m.k,-.05,-.08,S,fl?'#999':'#f2e6ff');}
  else{const sw=Math.sin(t*3)*.01;
    ctx.fillStyle=K(m.d);for(const q of[-1,1]){limb(ctx,[[q*.1,-.48],[q*.14+.03,-.25],[q*.12,-.03]],.13,K(m.d));ctx.fillRect(q*.12-.1,-.05,.24,.05);}
    ctx.fillStyle=K(m.c);ctx.fillRect(-.24,-.86+sw,.48,.4);ctx.fillStyle=K(m.d);ctx.fillRect(-.24,-.5+sw,.48,.05);
    ctx.fillStyle=K(fl?'#fff':'#9be8ff');ctx.fillRect(.02,-.8+sw,.17,.12);
    limb(ctx,[[.2,-.66+sw],[.62,-.66+sw-(sho?.02:0)]],.1,K('#222'));dot(ctx,-.2,-.86+sw,.07,K(m.d));if(sho)flash(ctx,.68,-.66+sw,t,.12);if(S*.95>40)label(ctx,m.k,-.1,-.62+sw,S,fl?'#999':'#06060e');}
}
/* ---- public draw ---- */
FA.draw=(ctx,who,pose,x,y,h,flip,t)=>{
  if(WHO.indexOf(who)<0)who='grunt';t=t||0;
  const mach=!!MAC[who];if(pose==='run')pose=Math.floor(t*8)%2?'run-b':'run-a';
  if(mach&&pose!=='shoot'&&pose!=='hit'&&pose!=='die')pose='idle';
  if(!mach&&POSES.indexOf(pose)<0&&!(who==='warden'&&(pose==='attack2'||pose==='enrage')))pose='idle';
  const u=pose==='die'?Math.max(0,t):0,fade=pose==='die'?1-.85*Math.min(1,u/1.2):1,pic=FA._pic('foot/'+who+'-'+pose+'.webp');
  ctx.save();ctx.translate(x,y);ctx.globalAlpha*=fade;
  if(pic){shadow(ctx,h*.5,fade);if(flip)ctx.scale(-1,1);ctx.drawImage(pic,-h/2,-h,h,h);ctx.restore();return;}
  const nat=mach?MAC[who].nat:.95,S=h/nat,hov=who==='drone'?Math.min(1,.5+.5*Math.sin(t*3)):1;
  shadow(ctx,h*(mach?.7:.5)*(HUM[who]&&HUM[who].w>1.2?1.3:1),who==='drone'?.6:fade);
  if(flip)ctx.scale(-1,1);ctx.scale(S,S);
  if(mach)mac(ctx,who,pose,t,S,u);
  else if(pose==='die'){const e=Math.min(1,u/.6),e2=e*e*(3-2*e);ctx.rotate(-e2*1.45);ctx.translate(-e2*.05,e*(1-e)*-.1);hum(ctx,who,pose,t,S);}
  else hum(ctx,who,pose,t,S);
  ctx.restore();
};
/* ---- pickups and scenery (placeholders for pk-<id>.webp / sc-<id>.webp) ---- */
const PK={'weapon-hmg':['#ffd23d','M'],'weapon-shotgun':['#ff8a3d','S'],'weapon-flame':['#ff4a2d','F'],'weapon-rocket':['#ff5a9a','R'],'weapon-arc':['#19e3ff','A'],shield:['#4a7bff','O'],speed:['#3dff8a','>'],damage:['#ff4060','!'],magnet:['#c08aff','U'],heal:['#3dff8a','+'],bomb:['#ffb020','B'],slow:['#8c86b8','~']};
FA.PICKUPS=Object.keys(PK);
FA.pickup=(ctx,id,x,y,size,t)=>{const pic=FA._pic('foot/pk-'+id+'.webp'),bob=Math.sin((t||0)*4)*size*.06;ctx.save();ctx.translate(x,y+bob);
  if(pic)ctx.drawImage(pic,-size/2,-size/2,size,size);else{const p=PK[id]||['#fff','?'];ctx.fillStyle='rgba(0,0,0,.55)';ctx.beginPath();ctx.arc(0,0,size*.5,0,6.3);ctx.fill();ctx.strokeStyle=p[0];ctx.lineWidth=Math.max(2,size*.08);ctx.stroke();
    ctx.fillStyle=p[0];ctx.font='700 '+Math.round(size*.55)+'px "Share Tech Mono",monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(p[1],0,size*.03);}
  ctx.restore();};
const SC={crate:['#7a5a30','#c89a58'],'neon-sign':['#2a1a4a','#ff2d95'],vending:['#2a3a6a','#19e3ff'],door:['#3a3448','#ffb020'],barrel:['#4a6a3a','#9be86a']};
FA.SCENERY=Object.keys(SC);
FA.scenery=(ctx,id,x,y,h)=>{const pic=FA._pic('foot/sc-'+id+'.webp');ctx.save();ctx.translate(x,y);
  if(pic)ctx.drawImage(pic,-h/2,-h,h,h);else{const c=SC[id]||['#555','#fff'],w=h*(id==='barrel'?.55:id==='door'?.5:id==='neon-sign'?.9:.8),hh=id==='neon-sign'?h*.35:h;
    ctx.fillStyle=c[0];ctx.fillRect(-w/2,-hh-(id==='neon-sign'?h*.4:0),w,hh);ctx.strokeStyle=c[1];ctx.lineWidth=Math.max(2,h*.04);ctx.strokeRect(-w/2+2,-hh-(id==='neon-sign'?h*.4:0)+2,w-4,hh-4);
    if(id==='crate'){ctx.beginPath();ctx.moveTo(-w/2,-hh);ctx.lineTo(w/2,0);ctx.moveTo(w/2,-hh);ctx.lineTo(-w/2,0);ctx.stroke();}}
  ctx.restore();};
/* ---- backgrounds ---- */
const hh=n=>{n=Math.imul((n|0)^61,0x45d9f3b);n^=n>>>16;n=Math.imul(n,0x45d9f3b);return((n^(n>>>16))>>>0)/4294967296;};   // stable pseudo-random per cell so the street never changes as it scrolls
const PAR={sky:.02,far:.12,mid:.35,near:.7,floor:1},NEON=['#ff2d95','#19e3ff','#ffb020','#3dff8a'];
FA.floorY=h=>Math.round(h*.8);
FA.bg=(ctx,layer,camX,w,h)=>{
  const fy=FA.floorY(h),k=h/720,off=(camX||0)*(PAR[layer]||0),pic=FA._pic('foot/bg-'+layer+'.webp');
  ctx.save();
  if(pic){const tw=h*2;let x0=-(((off%tw)+tw)%tw);for(let x=x0;x<w;x+=tw)ctx.drawImage(pic,x,0,tw,h);ctx.restore();return;}
  if(layer==='sky'){const g=ctx.createLinearGradient(0,0,0,fy);g.addColorStop(0,'#07051a');g.addColorStop(.6,'#2a0f4a');g.addColorStop(1,'#6a1f6a');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    ctx.fillStyle='rgba(255,255,255,.7)';for(let i=0;i<40;i++){const sx=((hh(i*3)*900*k-off)%(w+40)+w+40)%(w+40)-20;ctx.fillRect(sx,hh(i*7+1)*fy*.55,k*1.6,k*1.6);}
    ctx.fillStyle='rgba(255,210,235,.85)';ctx.beginPath();ctx.arc(((w*.78-off)%(w+200)+w+200)%(w+200)-100,fy*.22,26*k,0,6.3);ctx.fill();}
  else if(layer==='far'||layer==='mid'){const mid=layer==='mid',cell=(mid?190:110)*k,i0=Math.floor(off/cell)-1,n=Math.ceil(w/cell)+3;
    for(let i=i0;i<i0+n;i++){const x=i*cell-off,bw=cell*(mid?.92:.55+.4*hh(i*3)),bh=h*(mid?.3+.34*hh(i*5+1):.18+.34*hh(i*5+1)),top=fy-bh;
      ctx.fillStyle=mid?'#241446':'#150f2c';ctx.fillRect(x,top,bw,bh+2);if(mid){ctx.fillStyle='#33205f';ctx.fillRect(x,top,bw,3*k);ctx.fillRect(x,top,3*k,bh);}
      const ws=(mid?20:13)*k,cols=Math.floor((bw-6*k)/ws),rows=Math.floor((bh-14*k)/ws);
      for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)if(hh(i*131+r*17+c*5)>(mid?.62:.72)){ctx.fillStyle=hh(i*7+r)>.5?'rgba(255,210,120,.8)':'rgba(120,230,255,.75)';ctx.fillRect(x+4*k+c*ws,top+8*k+r*ws,ws*.55,ws*.55);}
      if(!mid&&hh(i*11)>.7){ctx.fillStyle='#150f2c';ctx.fillRect(x+bw*.5,top-30*k,2*k,30*k);dot(ctx,x+bw*.5+k,top-30*k,2.5*k,'#ff2040');}
      if(mid&&hh(i*7)>.4){const c=NEON[Math.floor(hh(i*9)*4)],sw=bw*.36,sh=bh*.1+14*k,sx=x+bw*(.1+.4*hh(i*13)),sy=top+bh*(.15+.4*hh(i*17));
        ctx.globalAlpha=.28;ctx.fillStyle=c;ctx.fillRect(sx-5*k,sy-5*k,sw+10*k,sh+10*k);ctx.globalAlpha=1;ctx.fillStyle=c;ctx.fillRect(sx,sy,sw,sh);ctx.fillStyle='rgba(10,5,25,.75)';ctx.fillRect(sx+4*k,sy+4*k,sw-8*k,sh-8*k);}}}
  else if(layer==='near'){const cell=260*k,i0=Math.floor(off/cell)-1,n=Math.ceil(w/cell)+3;
    for(let i=i0;i<i0+n;i++){const x=i*cell-off+cell*.5,r=hh(i*19);
      if(r<.34){limb(ctx,[[x,fy+4*k],[x,fy-.36*h]],5*k,'#14102a');limb(ctx,[[x,fy-.36*h],[x+22*k,fy-.36*h]],4*k,'#14102a');ctx.fillStyle='rgba(255,230,150,.22)';ctx.beginPath();ctx.ellipse(x+22*k,fy-.36*h+10*k,26*k,34*k,0,0,6.3);ctx.fill();dot(ctx,x+22*k,fy-.36*h+3*k,5*k,'#fff2b0');}
      else if(r<.62){ctx.fillStyle='#1c1836';ctx.fillRect(x-20*k,fy-46*k,40*k,48*k);ctx.fillStyle='#2c2650';ctx.fillRect(x-23*k,fy-52*k,46*k,8*k);}
      else if(r<.82){const sw=130*k,sh=110*k;ctx.fillStyle='#1a152e';ctx.fillRect(x-sw/2,fy-sh,sw,sh+3);ctx.fillStyle='#2a2448';for(let j=0;j<8;j++)ctx.fillRect(x-sw/2+4*k,fy-sh+8*k+j*12*k,sw-8*k,5*k);ctx.fillStyle=NEON[Math.floor(hh(i*23)*4)];ctx.fillRect(x-sw/2,fy-sh-4*k,sw,3*k);}}}
  else{const g=ctx.createLinearGradient(0,fy,0,h);g.addColorStop(0,'#1b1530');g.addColorStop(1,'#08060f');ctx.fillStyle=g;ctx.fillRect(0,fy,w,h-fy);ctx.fillStyle='#3a2a60';ctx.fillRect(0,fy,w,4*k);
    const per=140*k,ly=fy+(h-fy)*.55;ctx.fillStyle='rgba(255,210,120,.35)';for(let x=-(((off%per)+per)%per);x<w;x+=per)ctx.fillRect(x,ly,60*k,4*k);
    const pc=300*k,i0=Math.floor(off/pc)-1;for(let i=i0;i<i0+Math.ceil(w/pc)+3;i++)if(hh(i*29)>.35){ctx.fillStyle=hh(i*31)>.5?'rgba(255,45,149,.18)':'rgba(25,227,255,.18)';ctx.beginPath();ctx.ellipse(i*pc-off+pc*.5,fy+(h-fy)*(.3+.5*hh(i*37)),50*k,7*k,0,0,6.3);ctx.fill();}}
  ctx.restore();
};
})();
