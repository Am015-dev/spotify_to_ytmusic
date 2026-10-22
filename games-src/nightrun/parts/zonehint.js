// PURPOSE: one-line caption on the first purple ring (gravity well) of each stage: what the ring is
// FLAG: none (always on)
// TEST: pwrstar-test.js
/* ---------- ZH: zone legend (flag RET.zonehint, default ON; ?zonehint=0 = no caption). Owner, 21 Oct 2026: "what are the large purple dashed circles?"
   They are the GRAVITY WELL: rules.js (stage mechanic, #b06bff, dashed while it telegraphs; it bends shots, never takes hull) and the boss verbs
   gravity_well / vacuum in bossmoves.js (#c08aff, pulls the SHIP). The first time either shows in a stage a short caption is drawn on the ring for ZT s
   (own canvas text, so the hint diet of two shows per profile does not hide it). Nothing here changes play. ---------- */
const ZH=window.ZH={get on(){return true;},ZT:4.5,done:{rule:0,boss:0},cap:null,
  TXT:{rule:'PURPLE RING = gravity well: bends shots, no damage',boss:'PURPLE RING = gravity well: it pulls your ship, thrust away'},
  reset(){this.done={rule:0,boss:0};this.cap=null;},
  start(k,x,y,r,col){if(this.done[k])return;this.done[k]=1;this.cap={k,x,y,r,col,t:this.ZT};},
  tick(dt){if(!this.on||!G||G.dead||G.tut||G.lab)return;
    if(this.cap){this.cap.t-=dt;if(this.cap.t<=0)this.cap=null;}
    if(!this.done.rule&&window.RU&&RU.st&&RU.on&&RU.on()){for(const m of RU.st.list)if(m.id==='well'&&m.on&&m.o&&m.o.w&&m.o.w.length){const w=RU.T.well.pos(m,m.o.w[0],0);this.start('rule',w.x,w.y,150,'#b06bff');break;}}
    if(!this.done.boss&&window.BMV&&BMV.hz&&G.boss){for(const z of BMV.hz)if(z.s==='well'){this.start('boss',z.x,z.y,Math.min(z.R||300,300),'#c08aff');break;}}},
  draw(){const c=this.cap;if(!this.on||!c)return;const txt=this.TXT[c.k],a=Math.min(1,c.t/.5,(this.ZT-c.t)/.3+.01);
    ctx.save();ctx.globalAlpha=Math.max(0,a);ctx.font='700 13px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';
    const up=typeof wcv!=='undefined'&&wcv!==cv,off=Math.min(c.r,150)+18;   // portrait: the world is turned, so the box is turned back upright like wtxt()
    const w=Math.min((up?H:W)-16,ctx.measureText(txt).width+22),x=up?clamp(c.x-off,60,W-60):clamp(c.x,w/2+8,W-w/2-8),y=up?clamp(c.y,w/2+8,H-w/2-8):clamp(c.y-off,60,H-60);
    ctx.translate(x,y);if(up)ctx.rotate(Math.PI/2);
    ctx.fillStyle='#05030ccc';ctx.strokeStyle=c.col;ctx.lineWidth=1.5;ctx.beginPath();if(ctx.roundRect)ctx.roundRect(-w/2,-13,w,26,13);else ctx.rect(-w/2,-13,w,26);ctx.fill();ctx.stroke();
    ctx.fillStyle='#fff';ctx.fillText(txt,0,1,w-12);ctx.restore();}};
NR.on('runStart',()=>ZH.reset());
NR.on('tick',dt=>ZH.tick(dt));
{const dp=drawPlayer;drawPlayer=function(t){dp(t);try{ZH.draw();}catch(e){}};}
