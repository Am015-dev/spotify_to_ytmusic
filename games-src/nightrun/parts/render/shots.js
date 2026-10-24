// PURPOSE: bullets you can read: bright weapon shots with a dark underlay, then one distinct look per enemy kind over everything (W208)
// FLAG: shots (?shots=0 = the look as it was)
// TEST: qa/shots-probe.js
/* ---------- shots.js (owner, 24 Oct 2026: "bullets of ships are identical, player bullets are not visible at all"). RET.shots.
   Player shots (FXW.bullet hook, drawn in the player-shot loop of render(), BEFORE any enemy shot): a dark underlay, the weapon's own picture (media/fx-w-<weapon>-bullet) 30 % larger and
   full strength, and a cyan glow line with a white core that is at least 6 screen px wide. Muzzle flashes and hit sparks (ART.boom keys *-muzzle / *-hit / hit-spark) are drawn 50 % larger.
   Enemy shots (FXV.bullets hook + ART.fxDraw hook): the owner's pictures (fx-bullet-enemy / needle / shell / rocket, fx-eb-plasma, fx-eb-rocket-trail) on a dark outline, drawn AFTER the explosions, so nothing covers them. One look per kind, each a shape AND a colour of its own, all with a dark outline and a white core:
   turret = pink ball, timing-wall bullets = lime square, gunship = orange diamond, charger = red hollow ring, drone / flanker = yellow needle, shell = big orange ball with a white ring, rocket = red rocket, homing = magenta ball in a ring.
   Hit sizes, counts and damage are untouched (b.r stays); only drawing changes. ---------- */
if(RET.shots===undefined)RET.shots=!/[?&]shots=0/.test(location.search);
{const k=AI.kind;AI.kind=function(o,src){const q=k.call(this,o,src);if(q&&src&&src.type)q.et=src.type;return q;};}   // remember who fired it: the look follows the enemy
const SHOTS=window.SHOTS={seq:0,pLast:0,eFirst:1e9,eUnder:0,seen:{},pp:[],
  COL:{orb:'#ff2d78',diamond:'#ff9a1f',ring:'#ff3b2f',needle:'#ffe84a',shell:'#ff8a2d',rocket:'#ff2a2a',homer:'#ff4fd8',square:'#b6ff3a'},
  RING:'#07030f',CORE:'#ffffff',
  look(b){if(b.k==='n')return'needle';if(b.k==='s')return'shell';if(b.k==='r')return'rocket';if(b.hm>0)return'homer';const t=b.et;
    return t==='gunship'?'diamond':t==='charger'?'ring':t==='drone'||t==='flank'?'needle':b.ew?'square':'orb';},
  cvs:null,   // qa: the canvas the last player shot was drawn on (the world canvas when the screen is turned)
  reset(){this.seq=0;this.pLast=0;this.eFirst=1e9;this.eUnder=0;this.pp.length=0;},
  log(){return{looks:Object.keys(this.seen),eUnderP:this.eUnder,pp:this.pp.slice()};},
  /* enemy shots: the owner's pictures (PIC: id, hue shift or 0, width in radii, extra), each on a dark outline disc with a white core so they read on any backdrop; the old drawn shapes only when the picture is missing */
  PIC:{orb:['fx-bullet-enemy',-92,3.6],square:['fx-bullet-enemy',0,3.6],homer:['fx-bullet-enemy',-140,3.6],ring:['fx-bullet-shell',0,3.4],shell:['fx-bullet-shell',0,4.6],diamond:['fx-eb-plasma',0,4.4],needle:['fx-bullet-needle',0,9],rocket:['fx-bullet-rocket',0,5.4]},
  spr(l,w){const q=this.PIC[l],id=q[0];if(!ART.have(id))return null;return q[1]?ART.hue(id,w,q[1]):ART.sp(id,w);},
  enemy(){if(!RET.shots||!running)return;const L=G.eb;if(!L.length)return;const hc=SET.hc||RET.asBigOn(),bg=(RET.asBigOn()?1.35:1)*1.12,C=this.COL,R=this.RING;
    ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=1;for(const b of L){const l=this.look(b);this.seen[l]=1;G_(b.x,b.y,b.r*bg*3.4,C[l],.4);}
    ctx.globalCompositeOperation='source-over';ctx.lineCap='round';
    for(const b of L){const l=this.look(b),c=C[l],r=b.r*bg,x=b.x,y=b.y;if(this.eFirst>this.seq)this.eFirst=this.seq;if(this.seq<this.pLast)this.eUnder++;this.seq++;
      const a=Math.atan2(b.vy,b.vx),ca=Math.cos(a),sa=Math.sin(a),lin=l==='needle'||l==='rocket',rr=r*(l==='shell'?1.5:1),o=this.spr(l,r*this.PIC[l][2]*(l==='shell'?1.3:1));
      if(l==='rocket'){const t=ART.sp('fx-eb-rocket-trail',r*11);if(t){ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(x-ca*r*6,y-sa*r*6);ctx.rotate(a);ctx.drawImage(t.c,-t.w/2,-t.h/2,t.w,t.h);ctx.restore();}}
      if(lin){const l0=l==='needle'?r*3.4:r*3.2,l1=l==='needle'?r*1.8:r*2.2,w=l==='needle'?r:r*1.5,seg=(wd,col,e0,e1)=>{ctx.strokeStyle=col;ctx.lineWidth=wd;ctx.beginPath();ctx.moveTo(x-ca*e0,y-sa*e0);ctx.lineTo(x+ca*e1,y+sa*e1);ctx.stroke();};
        if(hc)seg(w*3.4,'#fff',l0+2,l1+2);seg(w*2.7,R,l0+1.2,l1+1.2);
        if(!o)seg(w*1.7,c,l0,l1);else{ctx.save();ctx.globalCompositeOperation='lighter';ctx.translate(x,y);ctx.rotate(a);ctx.drawImage(o.c,-o.w*.55,-o.h*(l==='needle'?1.6:.5),o.w,o.h*(l==='needle'?3.2:1));ctx.restore();}
        seg(w*.8,this.CORE,l0*.8,l1*.7);continue;}
      if(hc){ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(x,y,rr*2.1,0,7);ctx.fill();}
      ctx.fillStyle=R;ctx.beginPath();ctx.arc(x,y,rr*(l==='ring'?2:1.75),0,7);ctx.fill();
      if(o){ctx.globalCompositeOperation='lighter';ctx.drawImage(o.c,x-o.w/2,y-o.h/2,o.w,o.h);ctx.globalCompositeOperation='source-over';}
      else{ctx.fillStyle=c;ctx.beginPath();ctx.arc(x,y,rr*1.3,0,7);ctx.fill();}
      ctx.fillStyle=this.CORE;ctx.beginPath();ctx.arc(x,y,rr*.5,0,7);ctx.fill();
      if(l==='shell'||l==='homer'){ctx.strokeStyle=l==='shell'?'#fff':R;ctx.lineWidth=l==='shell'?1.8:2.4;ctx.globalAlpha=.9;ctx.beginPath();ctx.arc(x,y,rr*(l==='shell'?2.1:2.3),0,7);ctx.stroke();ctx.globalAlpha=1;}}
    ctx.restore();},
  lens(x0,x1,h){ctx.beginPath();ctx.moveTo(x0,0);ctx.quadraticCurveTo((x0+x1)/2,-h*1.6,x1,0);ctx.quadraticCurveTo((x0+x1)/2,h*1.6,x0,0);},   // a pointed bolt, h = half thickness (the curves reach 0.8 h)
  /* player shots (one call per shot, inside the 'lighter' loop of render()): underlay, the weapon's picture, glow line, white core */
  player(b){if(this.ft!==G.t){this.ft=G.t;this.pp.length=0;}const u=window.READ?READ.ppu():1,ang=(b.vx||b.vy)?Math.atan2(b.vy,b.vx):0,L=(b.len||(b.big?22:b.pn!=null?28:20))*1.9,tw=Math.max((b.th||3)*2,11/u),tf=ctx.getTransform(),
      k=b.wid&&FXW.pic('w-'+b.wid+'-bullet')?'fx-w-'+b.wid+'-bullet':null,o=k&&ART.sp(k,Math.max(24,Math.min(140,L*1.4+tw*2))*1.3),sp=b.wid&&FXW.SPIN[b.wid];
    ctx.save();ctx.translate(b.x,b.y);ctx.rotate(ang);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.5;ctx.fillStyle=this.RING;this.lens(-L*.3,L*.95,tw*1.5);ctx.fill();ctx.restore();
    if(o){ctx.save();if(!FXW.SOLID[b.wid])ctx.globalCompositeOperation='lighter';ART.put(o,b.x+(sp?0:Math.cos(ang)*L*.3),b.y+(sp?0:Math.sin(ang)*L*.3),ang+(sp?G.t*9:0),1);ctx.restore();}
    ctx.save();ctx.translate(b.x,b.y);ctx.rotate(ang);ctx.lineCap='round';ctx.globalCompositeOperation='lighter';ctx.globalAlpha=1;ctx.fillStyle='#4fe8ff';this.lens(-L*.15,L*.8,tw*.62);ctx.fill();
    ctx.globalCompositeOperation='source-over';ctx.fillStyle='#f4fdff';this.lens(-L*.05,L*.68,tw*.32);ctx.fill();ctx.restore();
    this.cvs=ctx.canvas;this.pLast=++this.seq;this.pp.push([tf.a*b.x+tf.c*b.y+tf.e,tf.b*b.x+tf.d*b.y+tf.f,tw*u,b.x,b.y]);return true;}};
/* the hooks: player shots through FXW.bullet (weapon pictures) and shotDraw (the rest); enemy shots drawn after the explosions; bigger muzzle flashes and hit sparks */
{const fb=FXW.bullet;FXW.bullet=function(b){return RET.shots&&running?SHOTS.player(b):fb.apply(this,arguments);};}
{const sd=shotDraw;shotDraw=function(b){return RET.shots&&running?void SHOTS.player(b):sd.apply(this,arguments);};}
{const fv=FXV.bullets;FXV.bullets=function(){if(!RET.shots||!running)return fv.apply(this,arguments);};}
{const fd=ART.fxDraw;ART.fxDraw=function(){fd.apply(this,arguments);if(RET.shots&&running){SHOTS.enemy();SHOTS.eFirst=1e9;SHOTS.seq=0;SHOTS.pLast=0;}};}
{const bm=ART.boom;ART.boom=function(k,x,y,sz){if(RET.shots&&/(^|-)(muzzle|hit|hit-spark)$/.test(k))arguments[3]=sz*1.5;return bm.apply(this,arguments);};}
