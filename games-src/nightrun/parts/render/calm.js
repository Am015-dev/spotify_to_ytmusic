// PURPOSE: a calm playfield: rule banners small in the top band, thin soft player/enemy beams, at most 2 rings per enemy
// FLAG: none (always on)
// TEST: calm-test.js, review9-test.js
/* ---------- CALM (flag RET.calm, default ON; ?calm=0 = as before). Owner look, Legend stage 10 on a phone (22 Oct 2026):
   - a rule announcement ("RULE · CURVED SHOTS") covered the middle of the field while enemies attacked: now a small strip in the top band (under the score bar), at most 2.5 s;
   - bright beams ~25 css px wide: pictured player shots are at most 6 css px thick (alpha <= .5), enemy aim / sniper beams <= 6 css px (alpha <= .5); lane edges dashed and dim;
   - enemies wore 3-4 rings at once: at most 2 per enemy, priority attack tell (pink / red) > elite (gold) > the rest (1 frame of memory decides).
   Nothing here changes damage or timing. ---------- */
const CALM=window.CALM={get on(){return running&&!!G;},BEAM:6,TMAX:2.5,TTITLE:2,RMAX:2,fr:0,cur:null,pk:new Map(),pp:new Map(),a:null,stat:{rings:0,cut:0,beams:0},
  /* css px per world unit under the current transform */
  css(){const t=ctx.getTransform(),c=ctx.canvas;return Math.hypot(t.a,t.b)*(c.clientWidth/c.width||1)||1;},
  isRule(a){return/^(RULE|NEW$|REMIX|TWIST)/.test(a||'');},
  small(bn){return!!bn&&this.on&&(!!bn.sm||(!bn.warn&&!!bn.ev));},
  /* top-band strip: one line, under the score bar, off the middle of the field */
  draw(bn,w,h,k){const kk=bn.t,a=Math.max(0,Math.min(1,kk*3,(bn.m-kk)*6)),D=DISTRICTS[G.di],y=(G.boss&&G.boss.x<W?52:38)*k,hh=24*k;
    ctx.save();ctx.globalAlpha=a*.9;ctx.fillStyle='#05030cd0';ctx.fillRect(0,y,w,hh);ctx.fillStyle=D.a;ctx.fillRect(0,y,3*k,hh);ctx.globalAlpha=a;ctx.textAlign='center';ctx.textBaseline='alphabetic';
    let txt=bn.a+(bn.b?' · '+bn.b:'');ctx.font=`700 ${12*k}px "Chakra Petch",sans-serif`;ctx.fillStyle='#e9e6ff';
    let f=12*k;while(f>8*k&&ctx.measureText(txt).width>w-16*k){f-=.5*k;ctx.font=`700 ${f}px "Chakra Petch",sans-serif`;}
    if(ctx.measureText(txt).width>w-16*k)txt=bn.a;   // the sub line does not fit one chip: the title alone
    ctx.fillText(txt,w/2,y+hh*.68);ctx.restore();},
  cls(s){let r=0,g=0,b=0;if(typeof s!=='string')return 2;let m=s.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i);
    if(m){r=parseInt(m[1],16);g=parseInt(m[2],16);b=parseInt(m[3],16);}else if((m=s.match(/rgba?\(\s*(\d+)[ ,]+(\d+)[ ,]+(\d+)/))){r=+m[1];g=+m[2];b=+m[3];}else return 2;
    if(r>=220&&g<130)return 0;if(r>=220&&g>=180&&b<130)return 1;return 2;},
  /* where an enemy ring is centred (world coords) or null: the enemy being drawn (arc at its local origin or its position), any enemy the arc is centred on, or an attack tell whose enemy is gone */
  spot(x,y,c){const q=this.cur;if(q)return(Math.abs(x)<2&&Math.abs(y)<2)?[q.x,q.y]:(Math.abs(x-q.x)<2&&Math.abs(y-q.y)<2)?[x,y]:null;
    for(const e of G.en)if(Math.abs(e.x-x)<2&&Math.abs(e.y-y)<2)return[x,y];return c===0?[x,y]:null;},
  allow(xy,c){const k=Math.round(xy[0]/6)+','+Math.round(xy[1]/6);let m=this.pk.get(k);if(!m)this.pk.set(k,m={cm:0,n:0});
    let lo=(((this.pp.get(k)||{}).cm||0)|(1<<c))&((1<<c)-1),n=0;while(lo){n+=lo&1;lo>>=1;}   // rings of higher priority seen last frame (or now)
    m.cm|=1<<c;if(n>=this.RMAX||m.n>=this.RMAX){this.stat.cut++;return false;}m.n++;this.stat.rings++;return true;}};
/* ---- 1. banners: the rule card is small and short ---- */
{const bn0=banner;banner=function(a,b,warn,t){const r=bn0.apply(this,arguments);
  if(running&&G&&G.banner&&!warn&&CALM.isRule(a)){G.banner.sm=1;const m=Math.min(t||3.2,CALM.TMAX);G.banner.t=G.banner.m=m;}
  else if(G&&G.banner&&(!warn||a==='WARNUNG')&&!G.banner.ev){   // review 10 #4: the boss intro is the same chip (name + sub on one line)
    G.banner.sm=1;const m=Math.min(t||3.2,CALM.TTITLE);G.banner.t=G.banner.m=m;}   // review 9 #1: the stage title is a one-line chip for 2 s, not a 96 px band over live fire
  return r;};}
/* ---- 2. beams: thin and soft ---- */
{const bb=FXW.bullet;FXW.bullet=function(b){if(!CALM.on||!b.wid)return bb.apply(this,arguments);const k='w-'+b.wid+'-bullet';if(!FXW.pic(k))return false;
  const L=b.len||(b.big?22:b.pn!=null?28:20);let w=Math.max(22,Math.min(130,L*1.4+(b.th||3)*2));const ang=((b.vx||b.vy)?Math.atan2(b.vy,b.vx):0)+(FXW.SPIN[b.wid]?G.t*9:0);
  let o=ART.sp(FXW.name(k),w);if(!o)return false;const cap=CALM.BEAM/CALM.css();if(o.h>cap&&!FXW.SPIN[b.wid]){w=w*cap/o.h;o=ART.sp(FXW.name(k),w);if(!o)return false;CALM.stat.beams++;}
  const solid=FXW.SOLID[b.wid];if(solid)ctx.globalCompositeOperation='source-over';
  ART.put(o,b.x+(FXW.SPIN[b.wid]?0:Math.cos(ang)*w*.25),b.y+(FXW.SPIN[b.wid]?0:Math.sin(ang)*w*.25),ang,.5);if(solid)ctx.globalCompositeOperation='lighter';FXW.stat.bullet++;return true;};}
{const sn=FXW.sniper,ai=FXW.aim;
  FXW.sniper=function(e,k,lk){if(!CALM.on)return sn.apply(this,arguments);if(!fxBeam('eb-sniper-beam',e.x,e.y,e.ang,1500,lk?CALM.BEAM/CALM.css():6,lk?.5:.3+.2*k))return false;FXW.stat.sniper++;return true;};
  FXW.aim=function(e,left){if(!CALM.on)return ai.apply(this,arguments);if(!fxBeam('eb-aim-line',e.x,e.y,e.ang,1500,left<=.3?Math.min(6,CALM.BEAM/CALM.css()):5,left<=.3?.5:.4))return false;FXW.stat.aim++;return true;};}
/* ---- 3. rings: at most 2 per enemy ---- */
{const bump=f=>function(){CALM.fr++;CALM.pp=CALM.pk;CALM.pk=new Map();return f.apply(this,arguments);};drawBGP=bump(drawBGP);drawBG=bump(drawBG);
  HOOK.drawEnemy(de=>function(e){if(!CALM.on||e===G.boss||e.type==='boss')return de.apply(this,arguments);const p=CALM.cur;CALM.cur=e;try{return de.apply(this,arguments);}finally{CALM.cur=p;}});
  const P=CanvasRenderingContext2D.prototype,ar=P.arc,bp=P.beginPath,st=P.stroke;
  P.beginPath=function(){CALM.a=null;return bp.apply(this,arguments);};
  P.arc=function(x,y,r,s,e2){CALM.a=(CALM.on&&r>=8&&r<=90&&Math.abs((e2||0)-(s||0))>=6)?[x,y,r]:null;return ar.apply(this,arguments);};
  P.stroke=function(){const a=CALM.a;if(a&&arguments.length===0&&CALM.on){CALM.a=null;const c=this.setLineDash&&this.getLineDash().length?2:CALM.cls(this.strokeStyle),xy=CALM.spot(a[0],a[1],c);
    if(xy&&!CALM.allow(xy,c))return;}
    return st.apply(this,arguments);};}
