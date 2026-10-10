/* ---------- ship stats: a little cluster round the ship (hull, dash charges, shield count, power-up timers, revive, drones, bubble) and a compact strip
   in the HUD (hull, shield, dash, drones, revive + the garage perks you own). Labels are <= 8 words. Numbers are logged in HUDLOG.x for the tests. ---------- */
const HUDX={
  iHeart:path2('M12 21s-8-5.5-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 5.5-8 11-8 11z'),
  iShield:path2('M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5z'),
  iDash:path2('M2 10h11V5l9 7-9 7v-5H2z'),
  iDrone:path2('M12 3l7 9-7 9-7-9z'),
  iRev:path2('M12 2a10 10 0 100 20 10 10 0 000-20zm1 5v4h4v2h-4v4h-2v-4H7v-2h4V7z'),
  vals(){const dm=1+SH.dmax,rdy=(P.dashCd<=0?1:0)+SH.spare;
    return{hp:P.hp,max:P.max,sh:SH.sh,dash:Math.min(dm,rdy),dashMax:dm,drones:TP.drones?TP.drones.length:0,rev:TP.revLeft,pw:G.pw?G.pw.act.map(a=>a.k):[],perks:TP_DEF.filter(d=>TP.l(d.id)).length,upg:SH.order.length};},
  // a stat chip: icon + number; returns the width it used
  chip(c,x,y,k,p,col,txt,dim){c.save();c.globalAlpha=dim?.4:1;c.translate(x,y-8*k);c.scale(.72*k,.72*k);c.fillStyle=col;c.fill(p,'evenodd');c.restore();
    c.save();c.globalAlpha=dim?.55:1;c.font=`700 ${Math.round(14*k)}px "Share Tech Mono",monospace`;c.fillStyle=col;c.textAlign='left';c.fillText(txt,x+19*k,y+4*k);const w=19*k+c.measureText(txt).width+10*k;c.restore();return w;},
  // the strip under the Neon counter: x, y = left and baseline of the first row
  strip(c,x,y,k){const v=this.vals();Object.assign(HUDLOG,{x:v});
    let cx=x;cx+=this.chip(c,cx,y,k,this.iHeart,v.hp<=1?'#ff3040':'#3dffb0',v.hp+'/'+v.max);
    cx+=this.chip(c,cx,y,k,this.iShield,'#19e3ff','×'+v.sh,v.sh<1);
    cx+=this.chip(c,cx,y,k,this.iDash,'#19e3ff',v.dash+'/'+v.dashMax,v.dash<1);
    if(v.drones)cx+=this.chip(c,cx,y,k,this.iDrone,'#c08aff','×'+v.drones);
    if(v.rev)cx+=this.chip(c,cx,y,k,this.iRev,'#ff2d95','×'+v.rev);
    // second row: what you own (garage perks, then this run's upgrades), icons with levels
    let ix=x;const y2=y+23*k;c.save();
    const icon=(d,col,lv)=>{c.save();c.translate(ix,y2-10*k);c.scale(.72*k,.72*k);c.fillStyle=col;c.fill(path2(d),'evenodd');c.restore();
      if(lv>1){c.font=`${Math.round(11*k)}px "Share Tech Mono",monospace`;c.fillStyle='#fff';c.textAlign='left';c.fillText(lv,ix+18*k,y2+4*k);}ix+=(lv>1?30:22)*k;};
    for(const d of TP_DEF){const l=TP.l(d.id);if(l)icon(d.ic,d.c,l);}
    for(const id of SH.order){const u=UBY[id];icon(u.ic,u.c,SH.n(id));}
    c.restore();},
  // round the ship (centre sx, sy in upright screen units)
  ship(c,sx,sy,k,t){if(G.dead)return;const v=this.vals();c.save();c.lineCap='round';
    // hull pips above the ship
    const pw=7*k,gap=2.5*k,w=v.max*(pw+gap)-gap;for(let i=0;i<v.max;i++){c.fillStyle=i<v.hp?(v.hp<=1?'#ff3040':'#3dffb0'):'#ffffff22';c.fillRect(sx-w/2+i*(pw+gap),sy-37*k,pw,4*k);}
    if(v.rev){c.save();c.translate(sx+w/2+5*k,sy-42*k);c.scale(.5*k,.5*k);c.fillStyle='#ff2d95';c.fill(this.iRev,'evenodd');c.restore();}
    // dash charges below: filled = ready, ring = recharging
    const n=v.dashMax,dw=n*9*k;for(let i=0;i<n;i++){const x=sx-dw/2+4.5*k+i*9*k,y=sy+34*k;c.strokeStyle='#19e3ff';c.fillStyle='#19e3ff';c.lineWidth=1.4*k;
      if(i<v.dash){c.beginPath();c.arc(x,y,3*k,0,7);c.fill();}else{c.globalAlpha=.45;c.beginPath();c.arc(x,y,3*k,0,7);c.stroke();
        if(i===v.dash&&P.dashCd>0){c.globalAlpha=1;c.beginPath();c.arc(x,y,3*k,-Math.PI/2,-Math.PI/2+6.28*(1-clamp(P.dashCd,0,1)));c.stroke();}c.globalAlpha=1;}}
    // shield count next to the ring
    if(v.sh>1){c.font=`700 ${Math.round(11*k)}px "Share Tech Mono",monospace`;c.fillStyle='#19e3ff';c.textAlign='left';c.fillText('×'+v.sh,sx+27*k,sy-16*k);}
    // power-up timers: one arc per active power-up, shrinking as it runs out
    const s=G.pw;if(s){const cur=PW.cur();let i=0;for(const a of s.act){const K=PWK[a.k],f=clamp(1-(cur-a.s)/a.d,0,1);c.strokeStyle=K.c;c.lineWidth=2.6*k;c.globalAlpha=.9;c.beginPath();c.arc(sx,sy,(33+5*i)*k,-Math.PI/2,-Math.PI/2+6.2832*f);c.stroke();i++;}c.globalAlpha=1;}
    if(PW.on('bub')){c.strokeStyle='#7dffd8';c.globalAlpha=.55+.2*Math.sin(t*5);c.lineWidth=2*k;c.beginPath();c.arc(sx,sy,29*k,0,7);c.stroke();c.fillStyle='#7dffd818';c.fill();c.globalAlpha=1;}
    c.restore();},
  // drones: world coordinates (drawn with the ship)
  drones(t){const ds=TP.drones;if(!ds||!ds.length||G.dead)return;ctx.save();for(const d of ds){ctx.translate(d.x,d.y);ctx.fillStyle='#120a1f';ctx.strokeStyle='#c08aff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(0,7);ctx.lineTo(-8,0);ctx.lineTo(0,-7);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.globalCompositeOperation='lighter';G_(0,0,13,'#c08aff',.5);ctx.globalCompositeOperation='source-over';ctx.translate(-d.x,-d.y);}ctx.restore();}
};
// the Neon counter row (as before) plus the strip; replaces SH.hud
SH.hud=function(c,t,L){L=L||{nx:24,ny:57,dx:214,dy:H-30,sx:18,sy:H-34,ring:true};const f=this.flash>0?1+this.flash:1,k=L.k||1;
  c.save();c.translate(L.nx,L.ny);c.scale(.5*f*k,.5*f*k);c.translate(-12,-12);c.fillStyle='#19e3ff';c.fill(path2(NEON_D));c.restore();
  c.save();c.font=`700 ${Math.round(13*f*k)}px "Share Tech Mono",monospace`;c.fillStyle=this.flash>0?'#ffffff':'#19e3ff';c.textAlign='left';c.fillText(String(this.neon),L.nx+10*k,L.ny+5*k);c.restore();
  HUDX.strip(c,L.nx+(10+String(this.neon).length*8+14)*k,L.ny+5*k,k);
  if(L.ring)this.ring(c,t);
  HUDLOG.sh=this.sh;HUDLOG.spare=this.spare;};
