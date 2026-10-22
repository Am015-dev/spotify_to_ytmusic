// PURPOSE: one lit scene: the district's colour grade over field and sprites, rim light, contact shadows, depth haze, light from blasts and shots, streaks
// FLAG: lit (?lit=0 = the old flat look)
// TEST: qa/alive-test.js (no page errors); look checked on 390x763 and 1440x860 frames
/* ---------- lit.js (E1, owner 22 Oct 2026: "all assets are like separate layers in Photoshop, looks like a primitive game from the 70s").
   Every ship now sits IN the city's light instead of on top of it:
   - grade: one soft-light pass in the district's neon colour over the backdrop AND the sprites (drawn just before the scanlines, both orientations);
   - key light: a thin rim on the upper edge of each ship in the district's neon colour (the light comes from the signs above);
   - a soft dark contact shadow below each ship on the haze, and a faint pool of the key colour;
   - depth haze: foes at the far right sit behind a little of the sky's colour;
   - light: explosions and muzzle flashes throw coloured light on what is near them (additive, fades in 0.15-0.4 s);
   - streaks: anything moving faster than 300 px/s leaves a short light streak (not with reduced motion);
   - a small camera kick on big kills (turret, gunship, leader; the shake setting and reduced motion apply). ---------- */
if(RET.lit===undefined)RET.lit=!/[?&]lit=0/.test(location.search);
const LIT=window.LIT={
  L:[],SPR:{},
  spr(c){let s=this.SPR[c];if(s)return s;s=document.createElement('canvas');s.width=s.height=64;const g=s.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);
    r.addColorStop(0,c);r.addColorStop(.45,c+'66');r.addColorStop(1,c+'00');g.fillStyle=r;g.fillRect(0,0,64,64);return this.SPR[c]=s;},
  D(){return DISTRICTS[G.di]||DISTRICTS[0];},
  on(){return!!RET.lit&&running&&!G.lab;},
  light(x,y,r,c,l){if(this.L.length<24)this.L.push({x,y,r,c,l,m:l});},
  /* under a ship: contact shadow and a pool of the key light */
  under(x,y,r){const D=this.D();ctx.save();ctx.globalAlpha=.3;ctx.drawImage(this.spr('#000000'),x-r*1.3+5,y+r*.55,r*2.6,r*.9);
    ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.1;ctx.drawImage(this.spr(D.a),x-r*1.6,y-r*.4,r*3.2,r*1.8);ctx.restore();},
  /* over a ship: rim from the key light (upper edge), haze when far, streak when fast */
  over(e,x,y,r,far){const D=this.D();ctx.save();ctx.globalCompositeOperation='lighter';ctx.strokeStyle=D.a;ctx.globalAlpha=.42;ctx.lineWidth=1.6;
    ctx.beginPath();ctx.arc(x,y,r*.92,Math.PI*1.12,Math.PI*1.72);ctx.stroke();
    if(!SET.rm&&e){const lp=e._lp,v=lp?Math.hypot(x-lp.x,y-lp.y)/Math.max(1/120,FD||1/60):0;
      if(v>300&&lp){const dx=x-lp.x,dy=y-lp.y,l=Math.hypot(dx,dy)||1,len=Math.min(90,v*.09),g=ctx.createLinearGradient(x,y,x-dx/l*len,y-dy/l*len);
        g.addColorStop(0,D.a+'aa');g.addColorStop(1,D.a+'00');ctx.strokeStyle=g;ctx.globalAlpha=.55;ctx.lineWidth=r*.8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(x-dx/l*r*.5,y-dy/l*r*.5);ctx.lineTo(x-dx/l*len,y-dy/l*len);ctx.stroke();}}
    if(far>0){ctx.globalCompositeOperation='source-over';ctx.globalAlpha=.3*far;ctx.drawImage(this.spr(D.sky[2]),x-r*1.6,y-r*1.6,r*3.2,r*3.2);}
    ctx.restore();if(e)e._lp={x,y};},
  /* after the ship: the lights of blasts and shots on everything near them */
  lights(dt){if(!this.L.length)return;ctx.save();ctx.globalCompositeOperation='lighter';
    for(const o of this.L){const k=o.l/o.m;ctx.globalAlpha=.4*k*k;const r=o.r*(1.2-.2*k);ctx.drawImage(this.spr(o.c),o.x-r,o.y-r,r*2,r*2);o.l-=dt;}
    ctx.restore();this.L=this.L.filter(o=>o.l>0);},
  /* the grade over the whole picture (backdrop + sprites), before the scanlines */
  grade(w,h){const D=this.D();ctx.save();ctx.globalCompositeOperation='soft-light';ctx.globalAlpha=.32;ctx.fillStyle=D.a;ctx.fillRect(0,0,w,h);ctx.restore();}};
{
  { const d0=drawEnemy;drawEnemy=function(e,t){if(!LIT.on()||e.dead||e.hp<=0)return d0.apply(this,arguments);const r=Math.max(10,Math.min(e.type==='boss'?60:34,e.r||14));
      LIT.under(e.x,e.y,r);const o=d0.apply(this,arguments);LIT.over(e,e.x,e.y,r,e.type==='boss'?0:clamp((e.x-W*.72)/(W*.28),0,1));return o;}; }
  { const p0=drawPlayer;drawPlayer=function(t){if(!LIT.on()||G.dead)return p0.apply(this,arguments);LIT.under(P.x,P.y,16);const o=p0.apply(this,arguments);LIT.over(null,P.x,P.y,16,0);LIT.lights(FD||1/60);return o;}; }
  { const s0=scanFor;scanFor=function(port){if(LIT.on())LIT.grade(port?PW_:W,port?PH_:H);return s0.apply(this,arguments);}; }
  { const e0=eb;eb=function(x,y){const s=eb.src;if(LIT.on()&&s&&s.type!=='boss'&&LIT.L.length<20)LIT.light(x,y,46,'#ffb070',.14);e0.src=s;try{return e0.apply(this,arguments);}finally{e0.src=null;}}; }
  NR.on('kill',o=>{const e=o&&o.e;if(!e||!LIT.on())return;const big=e.type==='turret'||e.type==='gunship'||e.ldr;LIT.light(e.x,e.y,big?130:80,big?'#ffc060':'#ff9a50',big?.3:.18);
    if(big)shake(5);});
  NR.on('runStart',()=>{LIT.L=[];});
}
