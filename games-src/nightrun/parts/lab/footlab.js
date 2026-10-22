// PURPOSE: LAB > ON FOOT: the Zeil street stage in a sandbox (jump to a room, spawn foes and props, god mode, slow motion, hit boxes, frame viewer, layer switches)
// FLAG: footlab (?footlab=0 = no tab; ?footlab=1 opens the sandbox straight away)
// TEST: qa/footlab-test.js
/* ---------- FOOTLAB. Owner, 22 Oct 2026: "include a lab for on foot so I can test". The ON FOOT tab of the Lab starts the real street stage (FOOT.start) with F.lab on:
   no Neon, best score, clear count, hint flag or story card is written (foot.js finish/stop/start check F.lab), the stats and story listeners are muted (window.__schFoot),
   props added by the buttons are removed again on exit. The sandbox panel (#flP) sits over the street; ▾ folds it. Everything is a plain-word button.
   Hooks used: F.pre (once per frame, after the update), F.ts (slow motion factor read by the foot.js loop), ART.drawAnim (records which sheet frame each character shows),
   CanvasRenderingContext2D.drawImage/fill/stroke (layer and lighting switches, installed only while the sandbox runs). No gameplay or drawing code of the street is changed. ---------- */
if(RET.footlab===undefined)RET.footlab=!/[?&]footlab=0/.test(location.search);
(function(){
if(!RET.footlab||!RET.foot||!window.FOOT||!FOOT._in||!window.LABX)return;
const F=FOOT,IN=F._in,FL=470,clamp=(v,a,b)=>v<a?a:v>b?b:v;
const FLAB=window.FOOTLAB={on:false,god:true,ammo:true,hold:false,waves:true,ts:1,dist:300,lv:1,boxes:false,road:false,frames:false,light:true,
  layers:{sky:true,far:true,mid:true,near:true,floor:true,prop:true,actor:true},view:{who:'kai',act:'idle',play:true,frame:0,t0:0},rec:[],added:0,propsN:0,log:{spawn:0,jump:0}};
const LAYERS=[['sky','SKY'],['far','FAR BUILDINGS'],['mid','MID BUILDINGS'],['near','NEAR BUILDINGS'],['floor','STREET FLOOR'],['prop','BACKGROUND CARS AND PROPS'],['actor','FOES']];
const CHARS=[['kai','KAI','kai'],['rusher','RUSHER','knife'],['gunner','GUNNER','gunman'],['heavy','HEAVY','bruiser']];
const ACTS=[['idle','IDLE','idle'],['run','RUN','run-a'],['shoot','SHOOT','shoot'],['crouch','CROUCH','crouch'],['jump','JUMP','jump'],['hit','HIT','hit'],['die','DIE','die']];
const WNAME={pistol:'PISTOL',hmg:'HEAVY MG',shot:'SHOTGUN',flame:'FLAMER',rocket:'ROCKETS',arc:'ARC LASER'};
const S_=()=>F.S,P_=()=>F.S&&F.S.P,Lr=()=>IN.L();
let panel=null,ov=null,vc=null,chips=[],infoEl=null,st0=null,raf=0,fold=false,hooked=false,propsLen=0,tick=0,preOld=null,drawOld=null;

/* ---------- the sandbox actions ---------- */
function rebuildWaves(x,on){const S=S_();if(!S)return;const st=S.st,lx=id=>(st.locks.find(l=>l.id===id)||{x:0}).x;
  for(const w of S.waves){const past=w.lock?lx(w.lock)<x:w.x<x;if(!on||past){w.done=true;}else{w.done=false;w.left=w.count;w.next=0;w.started=false;}}
  for(const l of st.locks){if(l.x<x)S.lockDone[l.id]=1;else delete S.lockDone[l.id];}}
function clearField(S){S.E=[];S.eb=[];S.pb=[];S.q=[];S.lock=null;S.bossOn=false;S.boss=null;S.end=null;S.dead=0;S.win=0;}
FLAB.room=function(i){const S=S_(),L=Lr();if(!S||!L)return false;const P=S.P,st=S.st,vw=L.vw;let x,bc=0;
  if(i==='climax'){bc=Math.min(st.boss.x-vw/2,st.len-vw);S.camX=Math.max(0,bc);P.x=S.camX+vw*.25+30;x=bc;}
  else{const r=F.SEC&&F.SEC[i];if(!r)return false;x=r.x;P.x=i===0?120:r.x+120;S.camX=Math.max(0,P.x-vw*.25);}
  clearField(S);if(S.G){S.G.camX=S.camX;S.G.viewW=vw;}   // the foes' env.G is only refreshed inside the step: after a jump it still holds the old camera (a foe placed 'off screen' would land far away and be removed)
  P.maxX=P.x;P.y=FL;P.vx=0;P.vy=0;P.onGround=true;P.hp=Math.max(1,P.hp);rebuildWaves(x,FLAB.waves);FLAB.log.jump++;FLAB.at=i;return true;};
FLAB.spawn=function(kind){const S=S_();if(!S||S.end)return null;const P=S.P,x=Math.max(40,P.x+P.facing*FLAB.dist);FLAB.log.spawn++;
  if(kind==='barrel'||kind==='crate'||kind==='gold'){const k={barrel:'barrel',crate:'scrate',gold:'gold'}[kind],d=IN.PROPD[k];if(!d)return null;
    S.st.props.push([x,k,kind==='gold'?{dr:['w_hmg']}:kind==='crate'?{dr:['bomb']}:{}]);FLAB.propsN++;
    const p={x,y:FL,k,hp:d.hp,w:d.w,h:d.h,c:d.c,i:S.st.props.length-1,fl:0};S.pr.push(p);S.s2=null;return p;}   // street2's hook sets up every prop again on the next frame (picture, break effects)
  const e=F.env.spawn(kind,x,null);if(e){e.grace=0;if(kind==='bigheavy'){e.hp=e.max=e.mhp=e.maxHp=Math.round(e.max*.3);}}return e;};   // the real big heavy is a boss: 30% of its listed hp
FLAB.give=function(id){const S=S_();if(!S)return;const P=S.P,w=F.WEAPONS[id];P.w=id;P.lv=FLAB.lv;P.ammo=id==='pistol'||FLAB.ammo?Infinity:w.ammo;NR.emit('footLevel',{w:id,lv:P.lv,up:true});};
FLAB.revive=function(){const S=S_();if(!S)return;S.end=null;S.dead=0;S.win=0;S.P.hp=S.P.max;S.P.inv=2;S.P.hurtT=0;};
FLAB.pause=function(v){const S=S_();if(!S)return;S.paused=v==null?!S.paused:!!v;};
FLAB.stepFrame=function(){const S=S_();if(!S)return;S.paused=false;try{F.step(1/60);}finally{S.paused=true;}};
FLAB.slow=function(v){FLAB.ts=v;F.ts=v===1?0:v;};
FLAB.setWaves=function(v){FLAB.waves=!!v;const S=S_();if(S)rebuildWaves(S.P.maxX,FLAB.waves);};

/* ---------- once per frame, after the update (god mode, infinite ammo) ---------- */
function perFrame(c){FLAB.rec.length=0;const S=S_();if(S&&F.lab){const P=S.P;
    if(FLAB.god&&!S.end){if(P.hp<P.max||S.dead){P.hp=P.max;S.dead=0;if(S.note&&S.note.txt==='DOWN')S.note.t=0;}}
    if(FLAB.ammo&&P.w!=='pistol'&&P.ammo!==Infinity)P.ammo=Infinity;
    if(FLAB.hold)P.cd=Math.max(P.cd,.5);}   // HOLD FIRE: the gun never comes off cooldown
  if(preOld)return preOld.apply(this,arguments);}

/* ---------- layer and lighting switches: only while the sandbox runs ---------- */
function install(){if(hooked)return;hooked=true;const C=CanvasRenderingContext2D.prototype,tags={},look=()=>F.look;
  const skip=c=>{if(!F.lab)return false;const t=look()&&look().tag;if(t){const k=t==='prop'||t==='actor'?t:t.slice(0,2)==='L-'?t.slice(2):null;if(k&&FLAB.layers[k]===false)return true;}
    if(!FLAB.light){const g=c.globalCompositeOperation;if(g==='lighter'||g==='screen')return true;}return false;};
  for(const n of ['drawImage','fill','fillRect','stroke']){const o=C[n];tags[n]=o;C[n]=function(){if(skip(this))return;return o.apply(this,arguments);};}
  FLAB._C=tags;
  const da=ART.drawAnim;FLAB._da=da;ART.drawAnim=function(c,key,t,x,y,sc,flip,al,sy){const r=da.apply(this,arguments);
    if(F.lab&&FLAB.frames&&ART.fE&&r!==false&&FLAB.rec.length<40){try{const o=ART.aS(key),i=ART.aframe(key,t);FLAB.rec.push({e:ART.fE,key,i,n:o.m[0],fps:o.m[1],x,y,h:o.m[3]*sc,M:c.getTransform()});}catch(e){}}
    return r;};
  preOld=F.pre;F.pre=perFrame;}
function uninstall(){if(!hooked)return;hooked=false;const C=CanvasRenderingContext2D.prototype;for(const n in FLAB._C)C[n]=FLAB._C[n];if(FLAB._da)ART.drawAnim=FLAB._da;F.pre=preOld;preOld=null;}

/* ---------- overlay: hit boxes, road line, frame labels ---------- */
function mapper(L,S){const lk=RET.streetlook&&F.look&&F.look.draw&&F.look.k?F.look:null,K=lk?lk.k:1,my=lk&&lk.my?lk.my:(y=>y),dpr=L.dpr||1,sc=L.sc*dpr,tx=(L.box.x-L.ox)*dpr,ty=(L.box.y-L.oy)*dpr-(lk?lk.t0*sc:0);
  return{K,my,sc,tx,ty,pt:(px,py,ax,ay)=>[(ax+(px-ax)*K-S.camX)*sc+tx,(my(ay)+(py-ay)*K)*sc+ty]};}
function box(g,m,bx,by,bw,bh,ax,ay,col){const a=m.pt(bx,by,ax,ay),b=m.pt(bx+bw,by+bh,ax,ay);g.strokeStyle=col;g.strokeRect(a[0],a[1],b[0]-a[0],b[1]-a[1]);}
function paintOverlay(){const L=Lr(),S=S_();if(!ov||!L||!S||!F.on){return;}const cv=L.cv,fl=document.getElementById('footL');if(fl&&ov.parentElement!==fl)fl.append(ov);   // the street layer is built after the panel when the loading cover holds the start
  if(ov.width!==cv.width||ov.height!==cv.height){ov.width=cv.width;ov.height=cv.height;}
  ov.style.left=cv.style.left||'0px';ov.style.top=cv.style.top||'0px';ov.style.width=cv.style.width||'100%';ov.style.height=cv.style.height||'100%';
  const g=ov.getContext('2d');g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,ov.width,ov.height);
  if(!(FLAB.boxes||FLAB.road||FLAB.frames))return;const m=mapper(L,S),dpr=L.dpr||1,P=S.P;g.lineWidth=Math.max(1.5,1.5*dpr);g.font='bold '+Math.round(11*dpr)+'px monospace';g.textBaseline='bottom';
  if(FLAB.road){const y=m.pt(0,FL,0,FL)[1];g.strokeStyle='#ffe14d';g.setLineDash([10*dpr,6*dpr]);g.beginPath();g.moveTo(0,y);g.lineTo(ov.width,y);g.stroke();g.setLineDash([]);
    g.fillStyle='#ffe14d';g.textAlign='left';g.fillText('ROAD LINE (feet stand here)',6*dpr,y-3*dpr);}
  if(FLAB.boxes){const pb=P.crouch?40:P.h,bw=S.st.fs?28:P.w;box(g,m,P.x-bw/2,P.y-pb,bw,pb,P.x,P.y,'#19e3ff');
    for(const e of S.E){if(e.dead)continue;const f=e.ext&&e.fly;box(g,m,e.x-e.w/2,f?e.y-e.h/2:e.y-e.h,e.w,e.h,e.x,f?e.y+e.h/2:e.y,e.boss||e.heavy?'#ff9a3a':'#ff4060');}
    for(const p of S.pr){if(p.hp<=0)continue;box(g,m,p.x-p.w/2,p.y-p.h,p.w,p.h,p.x,p.y,'#ffd23a');}
    g.fillStyle='#ff4a9a';for(const b of S.eb){const a=m.pt(b.x,b.y,b.x,b.y);g.beginPath();g.arc(a[0],a[1],Math.max(3,b.r*m.K*m.sc),0,6.283);g.stroke();}
    g.strokeStyle='#fff';for(const b of S.pb){const a=m.pt(b.x,b.y,b.x,b.y);g.beginPath();g.arc(a[0],a[1],Math.max(3,(b.r||4)*m.K*m.sc),0,6.283);g.stroke();}}
  if(FLAB.frames){g.textAlign='center';let k=0;for(const r of FLAB.rec){const M=r.M,X=M.a*r.x+M.c*r.y+M.e,Y=M.b*r.x+M.d*r.y+M.f,hp=r.h*M.d,who=r.e===P?'KAI':String(r.e.id||'?').toUpperCase(),act=r.key.slice(r.key.indexOf('/')+1),
      l1=who+' · '+act,l2='frame '+(r.i+1)+' of '+r.n+' · '+r.fps+' per second',w=Math.max(g.measureText(l1).width,g.measureText(l2).width)+8*dpr,lh=14*dpr,
      cx=clamp(X,w/2+2,ov.width-w/2-2),ty=Math.max(2,Y-hp*1.05-2*lh-(k++%3)*2*lh-4*dpr);   // above the head, three rows so neighbours do not sit on each other
    g.fillStyle='rgba(5,3,12,.8)';g.fillRect(cx-w/2,ty,w,2*lh);g.fillStyle='#b6ff5a';g.fillText(l1,cx,ty+lh-1);g.fillText(l2,cx,ty+2*lh-1);}}}
/* the animation viewer: one character, one action, frame by frame at the art's own rate */
function paintViewer(){if(!vc||fold)return;const g=vc.getContext('2d'),V=FLAB.view,ch=CHARS.find(c=>c[0]===V.who),ac=ACTS.find(a=>a[0]===V.act);g.setTransform(1,0,0,1,0,0);g.fillStyle='#0a0612';g.fillRect(0,0,vc.width,vc.height);
  if(!ch||!ac||typeof ART==='undefined'||!ART.FM||!ART.FM[ch[2]]){return;}const sh=ch[2],mp=ART.FM[sh];let act=mp[ac[2]],key=act&&sh+'/'+act;
  if(!(key&&ART.ANIM.s[key])){for(const a of (ART.FB[ac[2]]||[])){if(ART.ANIM.s[sh+'/'+a]){act=a;key=sh+'/'+a;break;}}}
  const m=key&&ART.ANIM.s[key],o=m&&ART.aS(key);let txt='no sheet for this action: the game shows the shape instead',tt=0;
  if(o){const n=m[0];if(V.play){const tot=o.tot+(o.loop?0:.5);tt=((performance.now()-V.t0)/1000)%tot;V.frame=ART.aframe(key,tt);}else{V.frame=clamp(V.frame,0,n-1);tt=(V.frame?o.cum[V.frame-1]:0)+.0005;}
    txt=act+' · frame '+(V.frame+1)+' of '+n+' · '+m[1]+' per second'+(o.loop?' · loops':' · plays once');
    const ve={_xa:act,_fa:key,_f0:0},fe=ART.fE;ART.fE=ve;try{ART.footDraw(g,sh,ac[2],vc.width/2,vc.height-26,vc.height-50,false,tt);}finally{ART.fE=fe;}}
  g.fillStyle='#b6ff5a';g.font='bold 11px monospace';g.textAlign='center';g.textBaseline='bottom';g.fillText(txt,vc.width/2,vc.height-6,vc.width-8);}
function frameLoop(){raf=requestAnimationFrame(frameLoop);if(!F.lab)return;paintOverlay();paintViewer();if((tick++)%8===0)sync();}

/* ---------- the panel ---------- */
const css=`#flP{position:fixed;left:0;right:0;bottom:0;z-index:200;max-height:min(48%,330px);display:flex;flex-direction:column;background:#07040f;border-top:1px solid #3a2b5c;font-family:var(--mono,monospace);color:var(--ink,#e8e4ff);touch-action:pan-y}
#flP .fbar{display:flex;align-items:center;gap:6px;padding:4px 8px;flex:0 0 auto}#flP .fbar b{font-size:12px;letter-spacing:.1em;color:var(--cyan,#19e3ff);white-space:nowrap}
#flP .finfo{flex:1 1 0;min-width:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:12px;color:var(--amber,#ffb020);text-align:right}
#flP.fold .fbody{display:none}#flP .fbody{overflow-y:auto;overflow-x:hidden;padding:2px 8px 8px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,290px),1fr));gap:6px 16px;-webkit-overflow-scrolling:touch}
#flP .fs{min-width:0}#flP .ft{display:block;font-size:11px;letter-spacing:.12em;color:var(--dim,#8a82b0);margin:0 0 2px}#flP .fr{display:flex;flex-wrap:wrap;gap:4px}
#flP .fc{min-height:36px;min-width:36px;padding:0 10px;font:700 12px var(--mono,monospace);color:var(--ink,#e8e4ff);background:#140c26;border:1px solid #3a2b5c;border-radius:6px;cursor:pointer;white-space:nowrap}
#flP .fc.on{background:var(--cyan,#19e3ff);color:var(--void,#05030c);border-color:var(--cyan,#19e3ff)}#flP .fc.x{border-color:var(--pink,#ff2d95);color:var(--pink,#ff2d95)}#flP .fc.x.on{color:var(--void,#05030c)}
#flP canvas{background:#0a0612;border:1px solid #3a2b5c;border-radius:6px;max-width:100%}
@media (min-width:900px){#flP{left:auto;top:0;width:340px;max-height:none;border-top:0;border-left:1px solid #3a2b5c}#flP.fold{top:auto;width:340px}#flP .fbody{grid-template-columns:1fr}}   /* wide screens: a column on the right, so the road at the bottom stays in view */
#flOv{position:absolute;pointer-events:none;z-index:3}`;
function chip(host,label,fn,on,o){const b=document.createElement('button');b.type='button';b.className='fc'+(o&&o.x?' x':'');b.textContent=label;if(o&&o.aria)b.setAttribute('aria-label',o.aria);
  b.addEventListener('click',()=>{try{fn(b);}catch(e){console.error(e);throw e;}sync();});host.append(b);chips.push({b,on});return b;}
function sec(body,title){const s=document.createElement('div');s.className='fs';const t=document.createElement('span');t.className='ft';t.textContent=title;const r=document.createElement('div');r.className='fr';s.append(t,r);body.append(s);return r;}
function sync(){for(const {b,on} of chips){if(on)b.classList.toggle('on',!!on());}
  if(infoEl){const S=S_();let s='starting…';if(S){const P=S.P,room=F.SEC?F.SEC.reduce((r,q,i)=>P.maxX>=q.x-200?i:r,0)+1:0;s=(S.end?'STAGE ENDED · tap REVIVE · ':S.paused?'PAUSED · ':'')+'room '+room+' · '+S.E.filter(e=>!e.dead).length+' foes · '+WNAME[P.w]+' LV'+P.lv+' · speed '+(FLAB.ts===1?'normal':FLAB.ts+'x');}
    if(infoEl.textContent!==s)infoEl.textContent=s;}}
function buildPanel(){if(panel)return;const st=document.createElement('style');st.id='flCss';st.textContent=css;document.head.appendChild(st);st0=st;
  panel=document.createElement('div');panel.id='flP';chips=[];
  const bar=document.createElement('div');bar.className='fbar';const ti=document.createElement('b');ti.textContent='ON FOOT LAB';infoEl=document.createElement('div');infoEl.className='finfo';infoEl.id='flInfo';infoEl.setAttribute('role','status');
  const body=document.createElement('div');body.className='fbody';
  const fb=chip(bar,'▾',()=>{fold=!fold;panel.classList.toggle('fold',fold);fb.textContent=fold?'▴':'▾';},null,{aria:'Fold the panel'});fb.id='flFold';
  const ex=chip(bar,'EXIT',()=>FLAB.exit(),null,{x:1,aria:'Leave the on foot lab'});ex.id='flExit';
  bar.prepend(ti);bar.insertBefore(infoEl,fb);panel.append(bar,body);
  const R=['ROOM 1','ROOM 2','ROOM 3','ROOM 4','ROOM 5','ROOM 6'];
  const r1=sec(body,'JUMP TO (clears the field)');R.forEach((n,i)=>chip(r1,n,()=>FLAB.room(i),()=>FLAB.at===i));chip(r1,'CLIMAX (big heavy)',()=>FLAB.room('climax'),()=>FLAB.at==='climax');
  chip(r1,'STAGE WAVES',()=>FLAB.setWaves(!FLAB.waves),()=>FLAB.waves,{aria:'Switch the stage waves on or off'});
  const r2=sec(body,'SPAWN (in front of Kai)');for(const [k,n] of [['rusher','RUSHER'],['gunner','GUNNER'],['heavy','HEAVY'],['bigheavy','BIG HEAVY'],['barrel','RED BARREL'],['crate','CRATE'],['gold','GOLD CRATE']])chip(r2,n,()=>FLAB.spawn(k),null);
  chip(r2,'KILL ALL',()=>{const S=S_();if(S)for(const e of S.E)if(!e.dead)F._in.dmgE(e,1e6,{pierce:1});},null,{x:1});
  const r3=sec(body,'DISTANCE IN FRONT');[120,200,300,450].forEach(d=>chip(r3,d+' px',()=>{FLAB.dist=d;},()=>FLAB.dist===d));
  const r4=sec(body,'KAI');chip(r4,'GOD MODE (hearts stay full)',()=>{FLAB.god=!FLAB.god;},()=>FLAB.god);chip(r4,'INFINITE AMMO',()=>{FLAB.ammo=!FLAB.ammo;},()=>FLAB.ammo);chip(r4,'HOLD FIRE (foes live longer)',()=>{FLAB.hold=!FLAB.hold;},()=>FLAB.hold);chip(r4,'REVIVE',()=>FLAB.revive(),null);
  const r5=sec(body,'GIVE WEAPON (level below)');Object.keys(F.WEAPONS).forEach(id=>chip(r5,WNAME[id]||id.toUpperCase(),()=>FLAB.give(id),()=>{const P=P_();return !!P&&P.w===id;}));
  const r6=sec(body,'WEAPON LEVEL');[1,2,3,4,5].forEach(l=>chip(r6,'LV'+l,()=>{FLAB.lv=l;const P=P_();if(P&&P.w!=='pistol')FLAB.give(P.w);},()=>FLAB.lv===l));
  const r7=sec(body,'TIME');chip(r7,'PAUSE',()=>FLAB.pause(),()=>!!(S_()&&S_().paused));chip(r7,'STEP ONE FRAME',()=>FLAB.stepFrame(),null);
  [[.25,'SLOW 0.25x'],[.5,'SLOW 0.5x'],[1,'NORMAL 1x']].forEach(([v,n])=>chip(r7,n,()=>FLAB.slow(v),()=>FLAB.ts===v));
  const r8=sec(body,'SHOW');chip(r8,'HIT BOXES',()=>{FLAB.boxes=!FLAB.boxes;},()=>FLAB.boxes,{aria:'Show hit boxes: cyan Kai, red foes, orange big foes, yellow props, pink foe shots, white your shots'});
  chip(r8,'ROAD LINE',()=>{FLAB.road=!FLAB.road;},()=>FLAB.road);chip(r8,'FRAME NUMBER AND SPEED',()=>{FLAB.frames=!FLAB.frames;},()=>FLAB.frames);
  const r9=sec(body,'PAINTED LAYERS (tap to hide)');for(const [k,n] of LAYERS)chip(r9,n,()=>{FLAB.layers[k]=!FLAB.layers[k];},()=>FLAB.layers[k]);
  chip(r9,'LIGHTING AND GLOWS',()=>{FLAB.light=!FLAB.light;},()=>FLAB.light,{aria:'Light and glow effects on or off'});
  const rv=sec(body,'ANIMATION VIEWER');vc=document.createElement('canvas');vc.width=300;vc.height=150;vc.id='flView';rv.append(vc);
  const rw=sec(body,'CHARACTER');CHARS.forEach(([k,n])=>chip(rw,n,()=>{FLAB.view.who=k;FLAB.view.frame=0;FLAB.view.t0=performance.now();},()=>FLAB.view.who===k));
  const ra=sec(body,'ACTION');ACTS.forEach(([k,n])=>chip(ra,n,()=>{FLAB.view.act=k;FLAB.view.frame=0;FLAB.view.t0=performance.now();},()=>FLAB.view.act===k));
  const rp=sec(body,'PLAY');chip(rp,'PLAY / STOP',()=>{const V=FLAB.view;if(V.play){V.play=false;}else{V.play=true;V.t0=performance.now();}},()=>FLAB.view.play);
  chip(rp,'◀ FRAME',()=>{const V=FLAB.view;V.play=false;V.frame=Math.max(0,V.frame-1);},null);chip(rp,'FRAME ▶',()=>{const V=FLAB.view;V.play=false;V.frame=V.frame+1;},null);
  document.body.append(panel);
  const L=Lr();ov=document.createElement('canvas');ov.id='flOv';(document.getElementById('footL')||document.body).append(ov);
  sync();}
function dropPanel(){if(panel){panel.remove();panel=null;}if(st0){st0.remove();st0=null;}if(ov){ov.remove();ov=null;}vc=null;chips=[];infoEl=null;}

/* ---------- start and leave ---------- */
FLAB.start=function(){if(F.on&&F.lab)return true;
  const go=()=>{F.lab=true;window.__schFoot=true;FLAB.on=true;FLAB.slow(1);FLAB.at=0;propsLen=F.STAGES[F.main].props.length;FLAB.propsN=0;F.ui=1;
    const ok=F.start(F.main||'street1');if(!ok){FLAB.exit(true);return false;}install();buildPanel();if(!raf)raf=requestAnimationFrame(frameLoop);return true;};
  if(typeof running!=='undefined'&&running){try{quitToTitle();}catch(e){}setTimeout(go,60);return true;}
  return go();};
FLAB.exit=function(quiet){if(!FLAB.on)return;FLAB.on=false;const was=F.on;
  const st=F.STAGES[F.main];if(st&&st.props.length>propsLen)st.props.length=propsLen;   // the props the buttons added go away again
  F.ts=0;FLAB.ts=1;if(raf){cancelAnimationFrame(raf);raf=0;}uninstall();dropPanel();
  try{if(was)F.stop();}catch(e){}   // stop() finishes the run as quit: with F.lab still on it writes nothing
  F.lab=false;window.__schFoot=false;F.ui=0;FLAB.layers={sky:true,far:true,mid:true,near:true,floor:true,prop:true,actor:true};FLAB.light=true;FLAB.boxes=FLAB.road=FLAB.frames=false;};
NR.on('footEnd',d=>{if(F.lab&&FLAB.on&&d&&d.quit&&!FLAB.leaving){FLAB.leaving=true;try{FLAB.exit();}finally{FLAB.leaving=false;}}});   // the stage's own pause > quit button also leaves the lab

/* ---------- the tab in the main Lab ---------- */
{const t0=LABX.tabs;LABX.tabs=()=>(t0?t0():[]).concat([['foot','ON FOOT']]);
  LABX.build=Object.assign(LABX.build||{},{foot:body=>{const r=lsec(body,'ON FOOT: the Zeil street stage with test controls');
    lchip(r,'START ON FOOT LAB',()=>{FLAB.start();},{cls:'hot',aria:'Start the Zeil street stage in the sandbox'});
    lchip(r,'OPEN THE SOUND PAGE',()=>labShow('sound'),{aria:'Switch each on foot sound on or off'});
    const n=lsec(body,'WHAT IT DOES');const p=lel('div','',null);p.style.cssText='font-size:13px;line-height:1.4;color:var(--ink);max-width:560px';
    p.textContent='Starts the street run with a control panel: jump to any room or the climax, add foes, crates and barrels in front of Kai, god mode, infinite ammo, every weapon, pause and slow motion, hit boxes, the road line, the sprite frame of every character and an animation viewer. Nothing is saved: no Neon, no best score, no story card. The song and each on foot sound have their own switches on the SOUND page, group ON FOOT.';
    n.append(p);}});}
if(/[?&]footlab=1/.test(location.search))setTimeout(()=>window.FOOTVIEW&&FOOTVIEW.auto?FOOTVIEW.open():FLAB.start(),600);   // footview.js: the viewer unless &footplay=1
})();
