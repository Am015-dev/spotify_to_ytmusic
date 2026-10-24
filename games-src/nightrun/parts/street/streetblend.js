// PURPOSE: Street actors (Kai and the foes) stand IN the rainy neon street: scene grade toward the backdrop palette, neon rim light from the nearest lamp side, soft contact shadow, faint wet-road reflection, rain in front (W194)
// FLAG: blend (?blend=1, off by default)
// TEST: qa/streetblend-probe.js
/* ---------- STREETBLEND (W194, owner 24 Oct 2026: "the figures do not blend well inside"). Diagnosis (1440x860, Kai + 3 foes, beta.186): the sheets are lit neutral and warm
   (olive jackets, mean blue 80) on a violet street (mean blue 105), no reflection on the wet road, no light from the neon, and rain only behind them: mean colour distance to the
   floor/backdrop around them 19 RGB. Per actor and frame: the old drawing goes into one reused scratch canvas, two source-atop fills grade it (ambient tint toward the backdrop
   column behind it + the floor, then a side gradient in the colour of the nearest neon), and it is put back with a 3-band faded reflection and a soft shadow under the feet and a
   few rain streaks over it. The palette is read ONCE from the near backdrop picture (160 columns: mean colour and brightest neon); per frame there are only lookups and fills.
   Skipped: a foe's hit flash (stays white), the flamer's fire tongue (wider than the box), nested calls (a street foe drawing another sheet). ---------- */
if(RET.blend===undefined)RET.blend=/[?&]blend=1/.test(location.search);   // off by default: the probe's halve gate is not met yet (HANDOFF-W194.md)
(function(){
if(!window.FOOT||!FOOT._in||!FOOT.look)return;
const F=FOOT,IN=F._in,SL=F.look,FL=470,NC=160,od=IN.drawWho;
const B=F.blend={amb:.75,kai:.55,lift:90,gmin:.7,gmax:1.15,rim:.18,refl:[.2,.11,.04],pal:null,n:0};
let cv=null,cx=null,cv2=null,cx2=null,deep=0;
function palette(){if(B.pal)return B.pal;const fa=window.FA,q=fa&&fa._pic&&fa._pic('foot/bg-near.webp'),fl=fa&&fa._pic&&fa._pic('foot/bg-floor.webp');if(!q||!q.width||!fl||!fl.width)return null;
  try{const H=40,t=document.createElement('canvas');t.width=NC;t.height=H+8;const x=t.getContext('2d');x.drawImage(q,0,0,NC,H);x.drawImage(fl,0,Math.round(fl.height*.7),fl.width,fl.height-Math.round(fl.height*.7),0,H,NC,8);
    const d=x.getImageData(0,0,NC,H+8).data,amb=[],neo=[],fm=[0,0,0];let fn=0;
    for(let c=0;c<NC;c++){const m=[0,0,0];let n=0,bs=0,bc=[255,60,200];for(let r=0;r<H;r++){const k=(r*NC+c)*4,a=d[k+3];if(a<128)continue;const R=d[k],G=d[k+1],Bl=d[k+2],mx=Math.max(R,G,Bl),mn=Math.min(R,G,Bl);
        if(r>=H*.45){m[0]+=R;m[1]+=G;m[2]+=Bl;n++;}const s=mx>0?(mx-mn)/mx*mx:0;if(s>bs){bs=s;bc=[R,G,Bl];}}
      amb.push(n?m.map(v=>v/n):null);neo.push([bc,bs]);}
    for(let r=H;r<H+8;r++)for(let c=0;c<NC;c++){const k=(r*NC+c)*4;if(d[k+3]<128)continue;fm[0]+=d[k];fm[1]+=d[k+1];fm[2]+=d[k+2];fn++;}
    const g=amb.filter(Boolean),gm=[0,1,2].map(j=>g.reduce((a,v)=>a+v[j],0)/(g.length||1));
    B.pal={amb:amb.map(v=>v||gm),neo,floor:fn?fm.map(v=>v/fn):gm};}catch(e){B.pal={amb:null};}
  return B.pal;}
let tc=null,tx=null;
const AL=[];   // bodies drawn this frame
function look(c){const S=F.S;if(!AL.length||!S)return;const o=AL[(B.rr=(B.rr||0)+1)%AL.length],q=o._bb;if(!q)return;   // after the frame: one body per frame, the street left and right of it and the body itself as the player sees them (8x8 each, one read back)
  try{if(!tc){tc=document.createElement('canvas');tc.width=16;tc.height=8;tx=tc.getContext('2d',{willReadFrequently:true});}const cv0=c.canvas,y0=q.fy-q.ah*.85,hh=q.ah*.75,w=q.hw;
    const lx=q.cx-w*2.6,rx=q.cx+w*1.4,lo=lx>=0,ro=rx+w*1.2<=cv0.width;if((!lo&&!ro)||y0<0||y0+hh>cv0.height)return;   // a side off the canvas reads black: use the other side only
    tx.clearRect(0,0,16,8);if(lo)tx.drawImage(cv0,lx,y0,w*1.2,hh,0,0,ro?4:8,8);if(ro)tx.drawImage(cv0,rx,y0,w*1.2,hh,lo?4:0,0,lo?4:8,8);tx.drawImage(cv0,q.cx-w*.45,y0,w*.9,hh,8,0,8,8);
    const d=tx.getImageData(0,0,16,8).data,bg=[0,0,0],bo=[0,0,0];for(let r=0;r<8;r++)for(let k=0;k<8;k++){const i=(r*16+k)*4;for(let j=0;j<3;j++){bg[j]+=d[i+j]/64;bo[j]+=d[i+32+j]/64;}}
    const g=o._g||(o._g=[1,1,1]);for(let j=0;j<3;j++){const tg=bo[j]+(bg[j]-bo[j])*(o===S.P?B.kai:B.amb);g[j]=Math.max(B.gmin,Math.min(B.gmax,g[j]*Math.max(.92,Math.min(1.08,(tg+4)/(bo[j]+4)))));}B.reads=(B.reads||0)+1;}catch(e){}}
const rgb=(v,a)=>'rgba('+(v[0]|0)+','+(v[1]|0)+','+(v[2]|0)+','+a+')';
const sat=(v,k)=>{const m=(v[0]+v[1]+v[2])/3;return v.map(x=>Math.max(0,Math.min(255,m+(x-m)*k)));};
/* the light at world x: ambient = the backdrop column behind it and the floor, rim = the brightest neon within reach (side -1 left, 1 right) */
function light(o){const p=palette();if(!p||!p.amb)return null;const S=F.S,t0=SL.t0,FR=FL-(SL.band||0),DH=(FR-t0)/.8,TW=2*DH,off=(S.camX||0)*.7,x0=SL.x0||0;
  const pos=((o.x-S.camX-x0+((off%TW)+TW)%TW)%TW+TW)%TW,ci=Math.floor(pos/TW*NC)%NC;
  let best=0,bc=null,side=1;const R=Math.round(NC*.22);for(let d=-R;d<=R;d++){const [c,s]=p.neo[(ci+d+NC)%NC],w=s/(1+Math.abs(d)/8);if(w>best){best=w;bc=c;side=d<0?-1:1;}}
  const rim=sat(bc||[255,60,200],1.3).map(v=>Math.min(255,v*1.25));
  const L=o._bl||(o._bl={rim,side,s:side});for(let j=0;j<3;j++)L.rim[j]+=(rim[j]-L.rim[j])*.15;L.side=side;L.s+=(side-L.s)*.12;   // eased: no flicker when the nearest lamp changes
  return L;}
const d0=SL.draw;SL.draw=function(c){AL.length=0;const r=d0.apply(this,arguments);if(r&&RET.blend)look(c);return r;};
IN.drawWho=function(c,who,pose,x,y,h,flip,t,col){const e=typeof ART!=='undefined'&&ART.fE;
  if(!RET.blend||deep||!e||!F.S||c!==(IN.L()&&IN.L().ctx)||e.flash>0||e.state==='spray')return od.apply(this,arguments);
  const m=c.getTransform(),W=c.canvas.width,H=c.canvas.height,X=(u,v)=>m.a*u+m.c*v+m.e,Y=(u,v)=>m.b*u+m.d*v+m.f;
  if(!palette())return od.apply(this,arguments);
  const bx=Math.max(0,Math.floor(Math.min(X(x-h,y-1.3*h),X(x+h,y)))),by=Math.max(0,Math.floor(Y(x,y-1.3*h))),bx1=Math.min(W,Math.ceil(Math.max(X(x-h,y),X(x+h,y)))),fy=Y(x,y),by1=Math.min(H,Math.ceil(fy+4));
  const bw=bx1-bx,bh=by1-by;if(bw<4||bh<4)return od.apply(this,arguments);
  if(!cv){cv=document.createElement('canvas');cv.id='footC';cx=cv.getContext('2d');}   // art.js picks the on-foot sprite copy by this id (not in the page)
  if(cv.width<bw||cv.height<bh){cv.width=Math.max(cv.width,bw);cv.height=Math.max(cv.height,bh);}
  cx.imageSmoothingEnabled=c.imageSmoothingEnabled;cx.imageSmoothingQuality=c.imageSmoothingQuality;cx.setTransform(1,0,0,1,0,0);cx.globalCompositeOperation='source-over';cx.globalAlpha=1;cx.clearRect(0,0,bw,bh);
  cx.setTransform(m.a,m.b,m.c,m.d,m.e-bx,m.f-by);deep++;try{od.call(this,cx,who,pose,x,y,h,flip,t,col);}finally{deep--;}
  cx.setTransform(1,0,0,1,0,0);const Lt=light(e),g_=e._g;AL.push(e);e._bb={cx:X(x,y),fy,ah:fy-by,hw:Math.abs(m.a)*h*.3};
  if(g_){const gm=g_.map(v=>Math.min(1,v)*255),lf=g_.map(v=>Math.max(0,v-1)*B.lift);   // grade: gain below 1 multiplies the channel down, above 1 lifts it
    if(!cv2){cv2=document.createElement('canvas');cx2=cv2.getContext('2d');}if(cv2.width<cv.width||cv2.height<cv.height){cv2.width=cv.width;cv2.height=cv.height;}
    cx2.globalCompositeOperation='copy';cx2.drawImage(cv,0,0,bw,bh,0,0,bw,bh);   // the body's alpha
    cx.globalCompositeOperation='multiply';cx.fillStyle=rgb(gm,1);cx.fillRect(0,0,bw,bh);cx.globalCompositeOperation='lighter';cx.fillStyle=rgb(lf,1);cx.fillRect(0,0,bw,bh);
    cx.globalCompositeOperation='destination-in';cx.drawImage(cv2,0,0,bw,bh,0,0,bw,bh);cx.globalCompositeOperation='source-atop';}
  const sd=Lt.s,cxx=X(x,y)-bx,hw=Math.abs(m.a)*h*.34,g=cx.createLinearGradient(cxx+sd*hw,0,cxx+sd*hw*.15,0);g.addColorStop(0,rgb(Lt.rim,B.rim*Math.min(1,Math.abs(sd)+.3)));g.addColorStop(1,rgb(Lt.rim,0));cx.fillStyle=g;cx.fillRect(0,0,bw,bh);   // rim light from the lamp side
  cx.globalCompositeOperation='source-over';B.n++;
  c.save();c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;
  const ground=!e.fly&&e.y>=FL-3,ah=fy-by;
  if(ground&&ah>8){const rh=ah*.5,sy=fy-by;c.setTransform(1,0,0,-.55,0,1.55*fy);   // wet road: the legs mirrored under the feet, squashed, fading in 3 bands
    for(let i=0;i<3;i++){const s0=sy-(i+1)*rh/3,hh=rh/3;if(s0<0)break;c.globalAlpha=B.refl[i];c.drawImage(cv,0,s0,bw,hh,bx,by+s0,bw,hh);}
    c.setTransform(1,0,0,1,0,0);c.globalAlpha=1;
    const sw=Math.min(bw*.36,ah*.3),gr=c.createRadialGradient(X(x,y),fy,0,X(x,y),fy,sw);gr.addColorStop(0,'rgba(8,2,18,.5)');gr.addColorStop(1,'rgba(8,2,18,0)');   // soft contact shadow
    c.fillStyle=gr;c.save();c.translate(X(x,y),fy);c.scale(1,.28);c.translate(-X(x,y),-fy);c.fillRect(X(x,y)-sw,fy-sw,2*sw,2*sw);c.restore();}
  c.drawImage(cv,0,0,bw,bh,bx,by,bw,bh);
  const st=F.S.time,n=5,Lr=bh*.16;c.strokeStyle='rgba(205,195,255,.3)';c.lineWidth=Math.max(1,W/1400);c.beginPath();   // rain falling in front of the body
  for(let i=0;i<n;i++){const fx=((i*.618+Math.floor(e.x/37)*.13)%1),fyy=((st*1.7+i*.37)%1);const sx=bx+fx*bw,sy=by+fyy*(bh-Lr);c.moveTo(sx,sy);c.lineTo(sx-Lr*.3,sy+Lr);}
  c.stroke();c.restore();};
})();
