// PURPOSE: SHEET TESTER in the Lab (both viewers): try your own sprite sheet at game scale, every state of a character side by side, a size/feet consistency report, view aids
// FLAG: lab3 (?lab3=0 = the viewers exactly as before)
// TEST: qa/lab3-test.js
/* ---------- lab3.js. Owner, 22 Oct 2026: "improve the Lab for more testing" (many new sprite sheets are being made right now).
   How the game sizes a frame (the rule this page shows, never a new one): ON FOOT, the whole CELL is scaled so its height = the character's street height
   (Kai 64 game px = .225 of the view, heavy 80, big heavy 90; streetfeel FEEL.H) and the cell bottom sits on the road (anchor m[4],m[5] of ART.ANIM.s).
   Only kai / knife / gunman / bruiser get a body-box correction (FEEL.BODY); every other sheet with more headroom in one state shrinks in that state.
   FLIGHT sheets are drawn at their cell size times one factor per character, so a taller cell = a bigger sprite.
   A dropped sheet is never saved or uploaded: it lives in this tab only (ART.VB / ART.ANIM.s for this session, UNDO puts the old art back).
   Performance (owner 22 Oct, a fast PC froze): canvases <= ~2.2 MP, <= 30 draws a second, nothing while hidden or closed, no dashed strokes,
   pixels read once per sheet (cached), never per frame. ---------- */
if(RET.lab3===undefined)RET.lab3=!/[?&]lab3=0/.test(location.search);
(()=>{if(!RET.lab3||typeof ART==='undefined'||!ART.ANIM)return;
const S=ART.ANIM.s,FV=()=>window.FOOTVIEW,FEEL=()=>window.FOOT&&FOOT.FEEL,clamp=(v,a,b)=>v<a?a:v>b?b:v;
const FOOTWHO='kai grunt gunman shield bruiser knife sniper drone turret mech warden jetpack hound flamer ninja medic'.split(' ');
const HT={kai:64,knife:64,gunman:64,bruiser:80,bigheavy:90};
const FREE=/crouch|die|jump|land|dash|cover|death|defeat|fall/;   // states that are meant to be shorter or off the road
const base=sh=>sh.indexOf('kai')===0?'kai':sh;
const isFoot=sh=>FOOTWHO.indexOf(base(sh))>=0;
const L3=window.LAB3={on:false,sheet:'kai',act:'idle',mode:'grid',bg:'street',onion:false,zoom:true,cell:true,body:true,feet:true,mz:true,play:true,t:0,frame:0,
  drop:null,ovr:{},rep:{},log:{opens:0,drops:0,uses:0}};
const sheets=()=>{const s=[...new Set(Object.keys(S).map(k=>k.slice(0,k.indexOf('/'))))].filter(x=>!/^(prop|pk)-/.test(x));
  return s.filter(isFoot).sort((a,b)=>FOOTWHO.indexOf(base(a))-FOOTWHO.indexOf(base(b))||(a<b?-1:1)).concat(s.filter(x=>!isFoot(x)).sort());};
const states=sh=>{const o=Object.keys(S).filter(k=>k.slice(0,k.indexOf('/'))===sh).map(k=>k.slice(k.indexOf('/')+1));
  o.sort((a,b)=>(a==='idle'?-1:b==='idle'?1:0));return o;};
L3.sheets=sheets;L3.states=states;L3._S=k=>S[k];L3._VB=k=>ART.VB[k];   // for the tests (ART is not on window)
/* ----- one sheet as the game sees it: meta + picture (the session replacement first) ----- */
const pics={};
function pic(k){if(L3.ovr[k])return L3.ovr[k].img;const b=ART.anim(k);if(b)return b;let i=pics[k];if(!i){i=pics[k]=new Image();i.src='media/anim/'+k+'-strip.webp';}return i.complete&&i.naturalWidth?i:null;}
L3.img=k=>pic(k);
/* game scale: game px per cell px. foot: cell height = street height (with the 4-character body correction); flight: one factor per character */
function gscale(sh,act,m){if(!isFoot(sh)){const id=S[sh+'/idle']||m;return 64/Math.max(1,id[3]);}
  let h=HT[sh]||64;const FE=FEEL();if(FE&&FE.BODY){const bk=FE.BODY[base(sh)+'/'+act],rf=FE.BODY[base(sh)+'/idle'];if(bk&&rf&&!/crouch|die|jump|land|dash/.test(act))h*=rf/bk;}
  return h/m[3];}
L3.gscale=gscale;
/* ----- consistency facts per frame, from alpha, once per picture (cached) ----- */
function measure(id,img,m){if(L3.rep[id])return L3.rep[id];const W=img.naturalWidth||img.width,H=img.naturalHeight||img.height,c=document.createElement('canvas');c.width=W;c.height=H;
  const g=c.getContext('2d',{willReadFrequently:true});g.drawImage(img,0,0);let d;try{d=g.getImageData(0,0,W,H).data;}catch(e){return L3.rep[id]={fr:[],W,H,err:1};}
  const cw=m[2],ch=m[3],fr=[];
  for(let i=0;i<m[0];i++){const x0=i*cw;let l=1e9,r=-1,t=1e9,b=-1;for(let y=0;y<Math.min(ch,H);y++){const row=y*W;for(let x=0;x<cw&&x0+x<W;x++)if(d[(row+x0+x)*4+3]>32){if(x<l)l=x;if(x>r)r=x;if(y<t)t=y;b=y;}}
    const e=[];if(r>=0){if(t===0)e.push('top');if(l===0)e.push('left');if(r===cw-1)e.push('right');}
    fr.push({l,r,t,b,cut:e,empty:r<0});}
  return L3.rep[id]={fr,W,H};}
/* summary of one state in game px: body height, feet gap, centre drift, edge frames, cell mismatch */
function sumUp(sh,act,m,img,id){const f=measure(id,img,m),s=gscale(sh,act,m),ok=f.fr.filter(q=>!q.empty);
  const bh=ok.length?Math.max(...ok.map(q=>q.b-q.t+1)):0,feet=ok.length?Math.min(...ok.map(q=>m[3]-1-q.b)):0,head=ok.length?Math.min(...ok.map(q=>q.t)):0;
  const cx=ok.map(q=>(q.l+q.r)/2),drift=cx.length?Math.max(...cx)-Math.min(...cx):0;
  const mis=[];if(f.W&&f.W!==m[0]*m[2])mis.push('sheet is '+f.W+' px wide but '+m[0]+' frames x '+m[2]+' px = '+m[0]*m[2]);if(f.H&&f.H!==m[3])mis.push('sheet is '+f.H+' px tall, cell says '+m[3]);
  if(ok.length<f.fr.length)mis.push((f.fr.length-ok.length)+' empty frame(s)');
  return {act,n:m[0],cw:m[2],ch:m[3],s,body:bh*s,feet:feet*s,head,headG:head*s,drift:drift*s,edge:f.fr.map((q,i)=>q.cut.length?i+1:0).filter(Boolean),mis,cellBody:bh};}
function report(sh,extra){const o=[];for(const a of states(sh)){const k=sh+'/'+a,m=S[k],im=pic(k);if(!m||!im){o.push({act:a,wait:1});continue;}o.push(sumUp(sh,a,m,im,(L3.ovr[k]?'ovr:'+L3.ovr[k].n+':':'')+k));}
  if(extra)o.unshift(extra);const id=o.find(q=>q.act==='idle'&&!q.wait&&!q.drop)||o.find(q=>!q.wait&&!q.drop&&!FREE.test(q.act)),RF=id?id.act:'idle',NM=sh.toUpperCase(),foot=isFoot(sh);
  for(const q of o){if(q.wait)continue;q.flags=[];q.notes=[];
    if(id&&q!==id&&id.body>0){const dv=q.body/id.body-1;if(Math.abs(dv)>.08){const hd=q.head-id.head;const txt=(q.drop?'your '+q.act+' sheet':q.act)+(hd>0?' cells have '+hd+' px more headroom than '+RF:hd<0?' cells have '+(-hd)+' px less headroom than '+RF:' is drawn at another size than '+RF)+': the '+NM.toLowerCase()+(dv<0?' shrinks ':' grows ')+Math.round(Math.abs(dv)*100)+'% when it '+q.act.replace(/-.*/,'')+'s';
      (FREE.test(q.act)?q.notes:q.flags).push(FREE.test(q.act)?txt+' (fine for this state if meant)':txt);}}
    if(foot&&q.feet>3&&!FREE.test(q.act))q.flags.push('feet float '+q.feet.toFixed(1)+' game px above the road (empty rows under the feet: crop the cell bottom to the feet)');
    if(q.edge.length)q.flags.push('frame '+q.edge.slice(0,6).join(', ')+(q.edge.length>6?' ...':'')+' touch the cell edge (art cut off)');
    for(const x of q.mis)q.flags.push('frame count / cell mismatch: '+x);
    if(q.drift>(foot?6:10))q.notes.push('body centre wanders '+q.drift.toFixed(1)+' game px between frames (it slides on the spot)');}
  return o;}
L3.report=report;
/* ----- the drop: a PNG/WebP strip (+ optional .json), guessed frames ----- */
function guess(w,h,old){if(old){if(w%old[0]===0&&Math.abs(w/old[0]/h-old[2]/old[3])<.35)return old[0];const n=Math.max(1,Math.round(w/(h*old[2]/old[3])));if(w%n===0)return n;}let n=Math.max(1,Math.round(w/h));for(let d=0;d<=n;d++){for(const c of [n-d,n+d])if(c>0&&w%c===0)return c;}return n;}
L3.guess=guess;
function readJson(t){try{const j=JSON.parse(t);const f=j.frames!=null?(Array.isArray(j.frames)?j.frames.length:+j.frames):j.n!=null?+j.n:Array.isArray(j)?+j[0]:null;
  return {frames:f||null,fps:+(j.fps||(Array.isArray(j)?j[1]:0))||null};}catch(e){return {};}}
L3.load=function(files){const fs=[...files],im=fs.find(f=>/image\/(png|webp)|\.(png|webp)$/i.test(f.type+' '+f.name)),js=fs.find(f=>/json/i.test(f.type+' '+f.name));
  if(!im){note('Pick a PNG or WebP strip (one row of frames).');return Promise.resolve(false);}
  const jp=js?js.text().then(readJson):Promise.resolve({});
  return Promise.all([jp,createImageBitmap(im).catch(()=>null)]).then(([j,bm])=>{if(!bm){note('That picture could not be read.');return false;}
    const c=document.createElement('canvas');c.width=bm.width;c.height=bm.height;c.getContext('2d').drawImage(bm,0,0);if(bm.close)bm.close();
    const old=S[L3.sheet+'/'+L3.act];L3.drop={img:c,name:im.name,w:c.width,h:c.height,frames:j.frames||guess(c.width,c.height,old),fps:j.fps||(old?old[1]:10),sheet:L3.sheet,act:L3.act,n:++L3.log.drops};
    L3.mode='one';ui();return true;});};
function dmeta(){const D=L3.drop;if(!D)return null;const n=clamp(Math.round(D.frames)||1,1,256),cw=Math.floor(D.w/n),old=S[D.sheet+'/'+D.act];
  const m=[n,D.fps||10,cw,D.h,Math.round(cw/2),D.h];if(old&&old.length>6)for(let i=6;i<old.length;i++)m[i]=old[i];return m;}
L3.dmeta=dmeta;
function dropSum(){const D=L3.drop,m=dmeta();if(!D||D.sheet!==L3.sheet)return null;const q=sumUp(D.sheet,D.act,m,D.img,'drop:'+D.n+':'+m[0]);q.drop=1;q.act=D.act;
  if(D.w%m[0])q.mis.push('width '+D.w+' px does not split into '+m[0]+' equal frames ('+(D.w%m[0])+' px left over)');return q;}
/* replace the state for this session only: the viewers and PLAY TEST draw through ART.anim / ART.ANIM.s */
L3.use=function(){const D=L3.drop;if(!D)return false;const k=D.sheet+'/'+D.act,m=dmeta();if(!L3.ovr[k])L3.ovr[k]={old:S[k],n:0};L3.ovr[k].n=D.n;L3.ovr[k].img=D.img;
  S[k]=m;ART.VB[k]=D.img;delete ART.as[k];forget(k);L3.log.uses++;ui();return true;};
L3.undo=function(k){k=k||(L3.sheet+'/'+L3.act);const o=L3.ovr[k];if(!o)return false;if(o.old)S[k]=o.old;else delete S[k];delete ART.VB[k];delete ART.as[k];delete L3.ovr[k];forget(k);ui();return true;};
function forget(k){const v=FV();if(v&&v.info)delete v.info[k];for(const id in L3.rep)if(id.endsWith(k)||id.indexOf(':'+k)>0)delete L3.rep[id];}
/* ----- drawing ----- */
let el=null,cv=null,zc=null,sc=null,rp=null,inf=null,raf=0,last=0,checker=null,stripKey='',bgKey='';const bgC=document.createElement('canvas');   // the backdrop is painted once per size/background, then copied (one drawImage a frame)
function size(c){const r=c.getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1,Math.sqrt(2.2e6/Math.max(1,r.width*r.height))),
  w=Math.max(1,Math.round(r.width*d)),h=Math.max(1,Math.round(r.height*d));if(c.width!==w||c.height!==h){c.width=w;c.height=h;}return d;}
const BGI={};const bgN=()=>['sky','far','mid','near','floor'].filter(n=>BGI[n]&&BGI[n].complete&&BGI[n].naturalWidth).length;
function bgImg(n){let i=BGI[n];if(!i){i=BGI[n]=new Image();i.src='media/foot/bg-'+n+'.webp';}return i.complete&&i.naturalWidth?i:null;}
function backdrop(g,W,H,road,d){const b=L3.bg;
  if(b==='checker'){if(!checker){const t=document.createElement('canvas');t.width=t.height=16;const q=t.getContext('2d');q.fillStyle='#9a9aa6';q.fillRect(0,0,16,16);q.fillStyle='#d8d8e0';q.fillRect(0,0,8,8);q.fillRect(8,8,8,8);checker=t;}
    g.fillStyle=g.createPattern(checker,'repeat');g.fillRect(0,0,W,H);return;}
  if(b!=='street'){g.fillStyle={black:'#000',white:'#fff',magenta:'#ff00ff'}[b];g.fillRect(0,0,W,H);return;}
  g.fillStyle='#0a0612';g.fillRect(0,0,W,H);const sk=bgImg('sky');if(sk){const s=Math.max(W/sk.naturalWidth,road/sk.naturalHeight);g.drawImage(sk,(W-sk.naturalWidth*s)/2,road-sk.naturalHeight*s,sk.naturalWidth*s,sk.naturalHeight*s);}
  for(const n of ['far','mid','near']){const im=bgImg(n);if(!im)continue;const s=Math.max(W/im.naturalWidth,road*.9/im.naturalHeight);g.drawImage(im,(W-im.naturalWidth*s)/2,road-im.naturalHeight*s,im.naturalWidth*s,im.naturalHeight*s);}
  const fl=bgImg('floor');if(fl)g.drawImage(fl,0,road-8,W,Math.max(H-road+8,fl.naturalHeight*W/fl.naturalWidth*.3));else{g.fillStyle='#1a1426';g.fillRect(0,road,W,H-road);}}
function fi(k,m){if(!L3.play)return clamp(L3.frame,0,m[0]-1);const o=ART.aS(k);if(o&&!L3.ovr[k])return ART.aframe(k,L3.t%(o.tot+(o.loop?0:.4)));return Math.floor(L3.t*m[1])%m[0];}
/* one frame: feet (cell bottom) on (x,y) for foot sheets, centred for flight; px = view px per game px */
function draw(g,img,m,sh,act,i,x,y,px,o){const s=gscale(sh,act,m)*px,fe=isFoot(sh),ax=fe?m[4]:m[2]/2,ay=fe?m[5]:m[3]/2,yy=fe?y:y-m[3]*s/2;i=clamp(i,0,m[0]-1);
  g.save();g.translate(x,yy);
  if(o&&o.onion&&m[0]>2){g.globalAlpha=.22;for(const j of [(i+m[0]-1)%m[0],(i+1)%m[0]])g.drawImage(img,j*m[2],0,m[2],m[3],-ax*s,-ay*s,m[2]*s,m[3]*s);g.globalAlpha=1;}
  g.drawImage(img,i*m[2],0,m[2],m[3],-ax*s,-ay*s,m[2]*s,m[3]*s);
  const f=o&&o.id&&L3.rep[o.id],q=f&&f.fr[i],lw=Math.max(1,o&&o.d||1);
  if(L3.cell){g.strokeStyle='rgba(255,255,255,.45)';g.lineWidth=lw;g.strokeRect(-ax*s,-ay*s,m[2]*s,m[3]*s);}
  if(q&&!q.empty){if(L3.body){g.strokeStyle='#19e3ff';g.lineWidth=lw*1.5;g.strokeRect((q.l-ax)*s,(q.t-ay)*s,(q.r-q.l+1)*s,(q.b-q.t+1)*s);}
    if(L3.feet){g.fillStyle='#ff4fd8';g.fillRect((q.l-ax)*s-6*lw,(q.b+1-ay)*s-lw,(q.r-q.l+1)*s+12*lw,2*lw);}
    if(q.cut.length){g.fillStyle='#ff3040';const L=-ax*s,T=-ay*s,R=L+m[2]*s,B=T+m[3]*s,w=3*lw;for(const e of q.cut){if(e==='top')g.fillRect(L,T,R-L,w);if(e==='left')g.fillRect(L,T,w,B-T);if(e==='right')g.fillRect(R-w,T,w,B-T);}}}
  const FE=FEEL(),mz=L3.mz&&fe&&FE&&FE.MZ&&FE.MZ[base(sh)+'/'+act];if(mz){const p=mz[Math.min(mz.length-1,i)];g.fillStyle='#ffe14d';g.beginPath();g.arc(p[0]*s,p[1]*s,4*lw,0,6.283);g.fill();}
  g.restore();return s;}
function label(g,t,x,y,d,c){g.font='bold '+Math.round(12*d)+'px monospace';g.textAlign='center';g.textBaseline='top';const w=g.measureText(t).width+8*d;g.fillStyle='rgba(5,3,12,.75)';g.fillRect(x-w/2,y,w,16*d);g.fillStyle=c||'#e8e4ff';g.fillText(t,x,y+2*d);}
function paint(){if(!cv)return;const d=size(cv),g=cv.getContext('2d'),W=cv.width,H=cv.height,road=Math.round(H*.8);g.setTransform(1,0,0,1,0,0);g.imageSmoothingEnabled=true;
  const sh=L3.sheet,foot=isFoot(sh);let px=foot?.225*H/64:H*.42/64,y=foot?road:road*.55,bk=W+'x'+H+L3.bg+bgN()+foot;
  if(bk!==bgKey){bgKey=bk;bgC.width=W;bgC.height=H;const b=bgC.getContext('2d');backdrop(b,W,H,road,d);if(foot){b.fillStyle='#ffe14d';b.fillRect(0,road-Math.max(1,d),W,Math.max(1,Math.round(1.5*d)));}}
  g.drawImage(bgC,0,0);
  const list=[];if(L3.mode==='grid'){for(const a of states(sh))list.push({k:sh+'/'+a,act:a});}
  else{const k=sh+'/'+L3.act;if(S[k]&&!(L3.drop&&L3.drop.sheet===sh&&L3.drop.act===L3.act&&L3.ovr[k]&&L3.ovr[k].n===L3.drop.n))list.push({k,act:L3.act,tag:L3.ovr[k]?'IN USE: YOUR SHEET':'CURRENT ART'});
    const D=L3.drop;if(D&&D.sheet===sh&&D.act===L3.act)list.push({drop:1,act:D.act,tag:'YOUR SHEET'});}
  const n=Math.max(1,list.length);L3.drawn=[];
  if(!foot){let mw=1,mh=1;for(const q of list){const m=q.drop?dmeta():S[q.k];if(!m)continue;const k=gscale(sh,q.act,m);mw=Math.max(mw,m[2]*k);mh=Math.max(mh,m[3]*k);}px=Math.min(px,W/n*.92/mw,H*.7/mh);}
  list.forEach((q,j)=>{const x=W*(j+.5)/n;let m,img,id;if(q.drop){m=dmeta();img=L3.drop.img;id='drop:'+L3.drop.n+':'+m[0];}else{m=S[q.k];img=pic(q.k);id=(L3.ovr[q.k]?'ovr:'+L3.ovr[q.k].n+':':'')+q.k;}
    if(!m||!img){label(g,q.act+' · loading',x,road+6*d,d,'#8a82b0');return;}
    measure(id,img,m);const i=q.drop?Math.floor(L3.t*m[1])%m[0]:fi(q.k,m);if(!L3.play&&L3.mode==='one')L3.frame=clamp(L3.frame,0,m[0]-1);
    const s=draw(g,img,m,sh,q.act,L3.mode==='one'&&!L3.play?L3.frame:i,x,y,px,{onion:L3.onion&&L3.mode==='one',id,d});L3.drawn.push({act:q.act,drop:!!q.drop,x:x/d,y:y/d,h:m[3]*s/d,w:m[2]*s/d});
    label(g,(q.tag?q.tag+' · ':'')+q.act.toUpperCase(),x,(foot?road:Math.min(H-38*d,y+m[3]*s/2))+6*d+(L3.mode==='grid'&&n>6?(j%2)*18*d:0),d,q.drop?'#ff9be8':'#e8e4ff');});
  if(!list.length)label(g,'no art for '+sh+'/'+L3.act,W/2,H/2,d,'#ff8a5a');
  // zoom: the selected frame at 4x its own pixels, nearest neighbour
  const tgt=L3.mode==='one'&&list.length?list[list.length-1]:null;
  if(zc){const dz=size(zc),z=zc.getContext('2d'),ZW=zc.width,ZH=zc.height;z.setTransform(1,0,0,1,0,0);if(L3.bg==='street'){z.fillStyle='#0a0612';z.fillRect(0,0,ZW,ZH);}else backdrop(z,ZW,ZH,ZH,dz);
    if(tgt&&L3.zoom){const m=tgt.drop?dmeta():S[tgt.k],img=tgt.drop?L3.drop.img:pic(tgt.k);if(m&&img){const i=clamp(L3.play?(tgt.drop?Math.floor(L3.t*m[1])%m[0]:fi(tgt.k,m)):L3.frame,0,m[0]-1),rf=L3.rep[tgt.drop?'drop:'+L3.drop.n+':'+m[0]:(L3.ovr[tgt.k]?'ovr:'+L3.ovr[tgt.k].n+':':'')+tgt.k],q=rf&&rf.fr[i];
      let bx=0,by=0,bw=m[2],bh=m[3];if(q&&!q.empty){bx=Math.max(0,q.l-4);by=Math.max(0,q.t-4);bw=Math.min(m[2],q.r+5)-bx;bh=Math.min(m[3],q.b+5)-by;}   // the visible body, 4 px around it
      const k=Math.min(4*dz,ZW*.95/bw,(ZH-24*dz)/bh);z.imageSmoothingEnabled=false;z.drawImage(img,i*m[2]+bx,by,bw,bh,(ZW-bw*k)/2,ZH-bh*k-4*dz,bw*k,bh*k);
      z.fillStyle='#e8e4ff';z.font='bold '+Math.round(12*dz)+'px monospace';z.textAlign='left';z.textBaseline='top';z.fillText('BODY PIXELS x'+(k/dz).toFixed(k/dz<2?1:0),4*dz,4*dz);z.fillText('frame '+(i+1)+' of '+m[0],4*dz,20*dz);}}
    else{z.fillStyle='#e8e4ff';z.font=Math.round(12*dz)+'px monospace';z.textAlign='center';z.textBaseline='middle';for(const [j,tx] of (L3.mode==='grid'?['PIXEL ZOOM:','pick','ONE STATE']:['ZOOM OFF']).entries())z.fillText(tx,ZW/2,ZH/2+(j-1)*16*dz);}}
  strip(tgt);}
/* the frame strip under the stage: redrawn only when the sheet or the frame changes */
function strip(tgt){if(!sc)return;const m=tgt?(tgt.drop?dmeta():S[tgt.k]):null,img=tgt?(tgt.drop?L3.drop.img:pic(tgt.k)):null;
  const i=m?(L3.play?(tgt.drop?Math.floor(L3.t*m[1])%m[0]:fi(tgt.k,m)):L3.frame):-1,key=(tgt?(tgt.drop?'d'+L3.drop.n+':'+m[0]:tgt.k):'')+'|'+i+'|'+L3.bg+'|'+sc.clientWidth;
  if(key===stripKey)return;stripKey=key;const d=size(sc),g=sc.getContext('2d'),W=sc.width,H=sc.height;g.setTransform(1,0,0,1,0,0);backdrop(g,W,H,H,d);
  if(!m||!img){g.fillStyle='#e8e4ff';g.font=Math.round(12*d)+'px monospace';g.textAlign='center';g.textBaseline='middle';g.fillText('frame strip: pick ONE STATE',W/2,H/2);return;}
  const cw=Math.min(W/m[0],(H-6*d)*m[2]/m[3]),ch=cw*m[3]/m[2];g.imageSmoothingEnabled=true;
  for(let j=0;j<m[0];j++){g.drawImage(img,j*m[2],0,m[2],m[3],j*cw,(H-ch)/2,cw,ch);if(j===i){g.strokeStyle='#ffe14d';g.lineWidth=2*d;g.strokeRect(j*cw+d,(H-ch)/2+d,cw-2*d,ch-2*d);}}}
function loop(now){raf=requestAnimationFrame(loop);if(document.hidden||(last&&now-last<32))return;const dt=last?Math.min(.1,(now-last)/1000):0;last=now;if(L3.play)L3.t+=dt;L3.n=(L3.n||0)+1;try{paint();}catch(e){console.error(e);}}
/* ----- the report box ----- */
function renderReport(){if(!rp)return;const o=report(L3.sheet,dropSum()),foot=isFoot(L3.sheet);rp.textContent='';
  const h=document.createElement('div');h.className='l3rh';h.textContent='CONSISTENCY REPORT · '+L3.sheet.toUpperCase()+' · measured from the pixels, in game px ('+(foot?'Kai = 64 tall; the whole cell is scaled to the street height':'64 = idle cell height; flight sheets are drawn at cell size times one factor per character')+')';rp.append(h);
  const lim=document.createElement('div');lim.className='l3n';lim.textContent='Warns when a state\'s body is more than 8% taller or shorter than idle (or the first state if there is no idle), when the feet float more than 3 px above the road, when art touches the cell edge, or when the sheet does not split into equal frames.';rp.append(lim);
  let bad=0;for(const q of o){const r=document.createElement('div');r.className='l3r'+(q.flags&&q.flags.length?' bad':'')+(q.drop?' drop':'');r.dataset.act=q.act;if(q.drop)r.dataset.drop='1';
    if(q.wait){r.textContent=q.act.toUpperCase()+': loading the sheet...';rp.append(r);continue;}
    bad+=q.flags.length;r.textContent=(q.drop?'YOUR SHEET → ':'')+q.act.toUpperCase()+': body '+q.body.toFixed(0)+' px tall · feet '+q.feet.toFixed(1)+' px above the cell bottom · drift '+q.drift.toFixed(1)+' px · '+q.n+' frames of '+q.cw+'x'+q.ch;
    for(const t of q.flags){const x=document.createElement('div');x.className='l3f';x.textContent='⚠ '+t;r.append(x);}for(const t of q.notes){const x=document.createElement('div');x.className='l3o';x.textContent='· '+t;r.append(x);}rp.append(r);}
  const s=document.createElement('div');s.className='l3n';s.id='l3sum';s.textContent=bad?bad+' warning(s). The game scales the whole cell, so pad every state of one character the same way (same cell height, feet on the cell bottom).':'No warnings: every state keeps the idle size and stands on the road.';rp.append(s);
  L3.last=o;if(o.some(q=>q.wait))setTimeout(()=>{if(L3.on)renderReport();},500);}
/* ----- the panel ----- */
const css=`html.l3on #fvP,html.l3on #l2v{display:none!important}
#l3P{position:fixed;inset:0;z-index:9600;display:flex;flex-direction:column;background:#05030c;color:#e8e4ff;font:14px/1.35 var(--mono,monospace)}
#l3P .l3bar{display:flex;align-items:center;gap:8px;padding:6px 10px;border-bottom:1px solid #3a2b5c;flex:0 0 auto}#l3P .l3bar b{flex:1;font-size:14px;letter-spacing:.08em;color:#19e3ff;min-width:0}
#l3P .l3main{flex:1;display:flex;min-height:0}#l3P .l3left{flex:1;display:flex;flex-direction:column;min-width:0;padding:8px;gap:6px}
#l3P .l3stage{flex:1;display:flex;gap:6px;min-height:200px}#l3C{flex:1;min-width:0;width:100%;height:100%;border:1px solid #3a2b5c;border-radius:6px}
#l3Z{width:220px;flex:0 0 220px;height:100%;border:1px solid #3a2b5c;border-radius:6px}#l3S{width:100%;height:70px;flex:0 0 70px;border:1px solid #3a2b5c;border-radius:6px}
#l3P .l3side{width:380px;flex:0 0 380px;overflow-y:auto;overflow-x:hidden;padding:8px 10px;border-left:1px solid #3a2b5c}
#l3P .l3sec{margin:0 0 10px}#l3P .l3t{display:block;font-size:14px;color:#8a82b0;margin:0 0 4px}#l3P .l3row{display:flex;flex-wrap:wrap;gap:6px}
#l3P button,#l3P select,#l3P input{font:inherit;font-size:14px;min-height:44px;min-width:44px;border-radius:8px;border:1px solid #3a2b5c;background:#140c24;color:#e8e4ff;padding:4px 10px}
#l3P input[type=number]{width:90px}#l3P select{max-width:100%}#l3P button.on{background:#19e3ff;color:#05030c;border-color:#19e3ff}#l3P button.hot{border-color:#ff4fd8;color:#ff9be8}
#l3P .l3drop{border:2px solid #3a2b5c;border-radius:8px;padding:10px;text-align:center;color:#8a82b0}#l3P .l3drop.over{border-color:#ff4fd8;color:#ff9be8}
#l3P .l3rep{max-height:30vh;overflow-y:auto;border:1px solid #3a2b5c;border-radius:6px;padding:6px 8px}#l3P .l3rh{color:#19e3ff;margin-bottom:4px}
#l3P .l3r{padding:3px 0;border-top:1px solid #1e1533}#l3P .l3r.drop{color:#ff9be8}#l3P .l3f{color:#ff8a5a;padding-left:10px}#l3P .l3o{color:#8a82b0;padding-left:10px}#l3P .l3n{color:#8a82b0}
#l3P .l3info{min-height:20px;color:#ffe14d}
@media (max-width:899px){#l3P .l3main{flex-direction:column;overflow-y:auto;overflow-x:hidden}#l3P .l3left{flex:0 0 auto}#l3P .l3stage{flex:0 0 auto;height:46vh;flex-direction:column}
 #l3C{height:auto;flex:1}#l3Z{width:100%;flex:0 0 120px;height:120px}#l3P .l3side{width:auto;flex:0 0 auto;border-left:0;overflow:visible}#l3P .l3rep{max-height:none}}`;
let chips=[],selS=null,selA=null,fIn=null,fFr=null,fFps=null,msg=null;
function btn(host,label,fn,on,cls,id){const b=document.createElement('button');b.type='button';b.textContent=label;if(cls)b.className=cls;if(id)b.id=id;b.addEventListener('click',()=>{fn();sync();});host.append(b);if(on)chips.push({b,on});return b;}
function sec(host,t){const s=document.createElement('div');s.className='l3sec';const h=document.createElement('span');h.className='l3t';h.textContent=t;const r=document.createElement('div');r.className='l3row';s.append(h,r);host.append(s);return r;}
function sync(){for(const {b,on} of chips)b.classList.toggle('on',!!on());}
function note(t){if(msg)msg.textContent=t;}
function fillStates(){if(!selA)return;selA.textContent='';for(const a of states(L3.sheet)){const o=document.createElement('option');o.value=a;o.textContent=a+(L3.ovr[L3.sheet+'/'+a]?' (your sheet in use)':'');selA.append(o);}
  if(states(L3.sheet).indexOf(L3.act)<0)L3.act=states(L3.sheet)[0]||'idle';selA.value=L3.act;}
function ui(){if(!el)return;if(selS)selS.value=L3.sheet;fillStates();const D=L3.drop;
  if(fFr){fFr.value=D?D.frames:'';fFps.value=D?D.fps:'';}
  note(D?'Your sheet '+D.name+': '+D.w+'x'+D.h+' px, '+(dmeta()[0])+' frames of '+dmeta()[2]+'x'+D.h+' (guessed from the width; change it if wrong), meant for '+D.sheet+' / '+D.act+(L3.ovr[D.sheet+'/'+D.act]&&L3.ovr[D.sheet+'/'+D.act].n===D.n?' · IN USE in the viewer and PLAY TEST (this tab only)':' · not in use yet'):'No sheet picked yet. Nothing you pick is saved or uploaded.');
  renderReport();sync();}
L3.pick=function(sh,act){if(!S[sh+'/'+(act||'idle')]&&!states(sh).length)return false;L3.sheet=sh;L3.act=act&&states(sh).indexOf(act)>=0?act:(states(sh)[0]||'idle');L3.t=0;L3.frame=0;stripKey='';ui();return true;};
L3.link=function(){const u=new URL(location.href),q=u.searchParams;q.delete('lab');q.delete('l2');q.set('footlab','1');q.set('who',L3.sheet);q.set('act',L3.act);q.set('l3',L3.mode);if(!isFoot(L3.sheet))q.delete('footlab'),q.set('lab','1'),q.set('l2','viewer');return u.toString();};
function build(){const st=document.createElement('style');st.id='l3Css';st.textContent=css;document.head.append(st);chips=[];
  el=document.createElement('div');el.id='l3P';el.setAttribute('role','dialog');el.setAttribute('aria-label','Sheet tester');
  const bar=document.createElement('div');bar.className='l3bar';const t=document.createElement('b');t.textContent='SHEET TESTER · game scale, nothing saved';bar.append(t);btn(bar,'‹ BACK',()=>L3.close(),null,'','l3Back');
  const main=document.createElement('div');main.className='l3main';const left=document.createElement('div');left.className='l3left';const stg=document.createElement('div');stg.className='l3stage';
  cv=document.createElement('canvas');cv.id='l3C';zc=document.createElement('canvas');zc.id='l3Z';stg.append(cv,zc);sc=document.createElement('canvas');sc.id='l3S';
  inf=document.createElement('div');inf.className='l3info';inf.id='l3Info';inf.textContent='Yellow line = road (feet stand here). White box = the frame cell the game scales. Cyan = visible body. Pink bar = lowest body pixel (feet). Red edge = art touches the cell edge. Yellow dot = gun muzzle.';
  rp=document.createElement('div');rp.className='l3rep';rp.id='l3Rep';left.append(stg,sc,inf,rp);
  const side=document.createElement('div');side.className='l3side';
  const ch=sec(side,'CHARACTER AND STATE');selS=document.createElement('select');selS.id='l3Who';selS.setAttribute('aria-label','Character');for(const s of sheets()){const o=document.createElement('option');o.value=s;o.textContent=(isFoot(s)?'on foot · ':'flight · ')+s;selS.append(o);}
  selS.addEventListener('change',()=>L3.pick(selS.value));selA=document.createElement('select');selA.id='l3Act';selA.setAttribute('aria-label','State');selA.addEventListener('change',()=>{L3.act=selA.value;L3.t=0;L3.frame=0;stripKey='';ui();});ch.append(selS,selA);
  const md=sec(side,'SHOW');btn(md,'ALL STATES',()=>{L3.mode='grid';},()=>L3.mode==='grid','','l3Grid');btn(md,'ONE STATE',()=>{L3.mode='one';},()=>L3.mode==='one','','l3One');
  btn(md,'PLAY / PAUSE',()=>{L3.play=!L3.play;},()=>L3.play,'','l3PP');btn(md,'◀ FRAME',()=>{L3.mode='one';L3.play=false;L3.frame--;wrapF();},null,'','l3Prev');btn(md,'FRAME ▶',()=>{L3.mode='one';L3.play=false;L3.frame++;wrapF();},null,'','l3Next');
  const nw=sec(side,'TEST A NEW SHEET (PNG or WebP strip, optional .json)');const dz=document.createElement('label');dz.className='l3drop';dz.textContent='Drop a sheet here or tap to pick one';
  fIn=document.createElement('input');fIn.type='file';fIn.id='l3File';fIn.multiple=true;fIn.accept='image/png,image/webp,.png,.webp,.json,application/json';fIn.style.cssText='display:block;width:100%;margin-top:6px';fIn.addEventListener('change',()=>{L3.load(fIn.files);});dz.append(fIn);
  dz.addEventListener('dragover',e=>{e.preventDefault();dz.classList.add('over');});dz.addEventListener('dragleave',()=>dz.classList.remove('over'));dz.addEventListener('drop',e=>{e.preventDefault();dz.classList.remove('over');L3.load(e.dataTransfer.files);});nw.append(dz);
  const fl=document.createElement('div');fl.className='l3row';const lab=(tx,inp)=>{const l=document.createElement('label');l.style.cssText='display:flex;align-items:center;gap:6px';l.append(document.createTextNode(tx),inp);fl.append(l);};
  fFr=document.createElement('input');fFr.type='number';fFr.min='1';fFr.max='256';fFr.id='l3Frames';fFr.addEventListener('change',()=>{if(L3.drop){L3.drop.frames=+fFr.value||1;stripKey='';ui();}});lab('frames',fFr);
  fFps=document.createElement('input');fFps.type='number';fFps.min='1';fFps.max='60';fFps.id='l3Fps';fFps.addEventListener('change',()=>{if(L3.drop){L3.drop.fps=+fFps.value||10;ui();}});lab('fps',fFps);nw.append(fl);
  msg=document.createElement('div');msg.className='l3n';msg.id='l3Msg';nw.append(msg);
  btn(nw,'MEANT FOR THE PICKED STATE',()=>{if(L3.drop){L3.drop.sheet=L3.sheet;L3.drop.act=L3.act;L3.mode='one';ui();}},null,'','l3For');
  btn(nw,'USE IT IN VIEWER + PLAY TEST',()=>{L3.use();},null,'hot','l3Use');btn(nw,'UNDO (old art back)',()=>{L3.undo();},null,'','l3Undo');
  const bg=sec(side,'BACKGROUND (check the cut-out edges)');for(const [k,n] of [['street','STREET'],['checker','CHECKER'],['black','BLACK'],['white','WHITE'],['magenta','MAGENTA']])btn(bg,n,()=>{L3.bg=k;stripKey='';},()=>L3.bg===k,'','l3Bg_'+k);
  const va=sec(side,'VIEW AIDS');btn(va,'ONION SKIN (frame before and after, faint)',()=>{L3.onion=!L3.onion;L3.mode='one';},()=>L3.onion,'','l3Onion');btn(va,'PIXEL ZOOM 4x',()=>{L3.zoom=!L3.zoom;},()=>L3.zoom,'','l3Zoom');
  btn(va,'CELL BOX (white)',()=>{L3.cell=!L3.cell;},()=>L3.cell);btn(va,'BODY BOX (cyan)',()=>{L3.body=!L3.body;},()=>L3.body);btn(va,'FEET LINE (pink)',()=>{L3.feet=!L3.feet;},()=>L3.feet);btn(va,'MUZZLE (yellow dot)',()=>{L3.mz=!L3.mz;},()=>L3.mz);
  const sh=sec(side,'SHARE');btn(sh,'COPY A LINK TO THIS VIEW',()=>{const u=L3.link();const done=()=>note('Link copied: '+u);try{navigator.clipboard.writeText(u).then(done,()=>note('Copy this link: '+u));}catch(e){note('Copy this link: '+u);}},null,'','l3Link');
  main.append(left,side);el.append(bar,main);document.body.append(el);}
function wrapF(){const D=L3.drop,k=L3.sheet+'/'+L3.act,m=D&&D.sheet===L3.sheet&&D.act===L3.act?dmeta():S[k];if(m)L3.frame=(L3.frame%m[0]+m[0])%m[0];stripKey='';}
L3.open=function(sh,act,mode){if(!el)build();L3.on=true;document.documentElement.classList.add('l3on');L3.log.opens++;if(mode)L3.mode=mode;L3.pick(sh&&states(sh).length?sh:L3.sheet,act||L3.act);last=0;if(!raf)raf=requestAnimationFrame(loop);sync();return true;};
L3.close=function(){L3.on=false;document.documentElement.classList.remove('l3on');bgKey='';bgC.width=bgC.height=1;if(raf){cancelAnimationFrame(raf);raf=0;}if(el){el.remove();el=null;}const s=document.getElementById('l3Css');if(s)s.remove();cv=zc=sc=rp=inf=selS=selA=fIn=fFr=fFps=msg=null;chips=[];stripKey='';};
/* ----- entry buttons in both viewers ----- */
const ENTRY='SHEET TESTER (your sheet, all states, report)';
function addFoot(){const v=FV(),bar=document.querySelector('#fvP .vbar');if(!v||!bar||document.getElementById('fvL3'))return;const b=document.createElement('button');b.type='button';b.className='fc';b.style.cssText='border-color:#ff4fd8;color:#ff9be8';b.id='fvL3';b.textContent=ENTRY;
  b.addEventListener('click',()=>L3.open(v.sheet,v.act));bar.insertBefore(b,document.getElementById('fvPlay'));}
function addFlight(){const h=document.getElementById('l2h');if(!h||document.getElementById('l2L3'))return;const b=document.createElement('button');b.type='button';b.className='l2b hot';b.id='l2L3';b.textContent='SHEET TESTER';b.setAttribute('aria-label',ENTRY);
  b.addEventListener('click',()=>{const L=window.L2,s=L&&L.cur&&L.cur(),k=s&&s.key;if(k&&S[k])L3.open(k.slice(0,k.indexOf('/')),k.slice(k.indexOf('/')+1));else L3.open();});h.insertBefore(b,document.getElementById('l2exit'));}
L3.addFlight=addFlight;
{const v=FV();if(v){const o0=v.open;v.open=function(){const r=o0.apply(this,arguments);addFoot();return r;};
  const q=location.search,w=(q.match(/[?&]who=([\w-]+)/)||[])[1],a=(q.match(/[?&]act=([\w-]+)/)||[])[1],m=(q.match(/[?&]l3=(grid|one)/)||[])[1];
  if(w||m){let used=0;const o1=v.open;v.open=function(){const r=o1.apply(this,arguments);if(!used){used=1;if(w&&v.pick(w)&&a)v.state(a);if(m)L3.open(v.sheet||w,a,m);}return r;};}}}
setTimeout(addFlight,0);if(window.NR&&NR.on)NR.on('tick',()=>{if(!document.getElementById('l2L3')&&document.getElementById('l2h'))addFlight();});
{const q=location.search,m=(q.match(/[?&]l3=(grid|one)/)||[])[1],w=(q.match(/[?&]who=([\w-]+)/)||[])[1];if(m&&w&&!isFoot(w)&&/[?&]lab=1/.test(q))setTimeout(()=>L3.open(w,(q.match(/[?&]act=([\w-]+)/)||[])[1],m),1500);}
})();
