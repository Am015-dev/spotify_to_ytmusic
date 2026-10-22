// PURPOSE: enemies, enemy bullets and pickups readable on every stage backdrop; one colour per role
// FLAG: legible (?legible=0)
// TEST: legible-test.js
/* ---------- legible.js (INDUSTRY-PLAYBOOK.md fixes 1-3, PB02 / PB01 / PB06 / PB04). Flag RET.legible, default ON; ?legible=0 = the look as it was (readable.js alone).
   1. Enemies: a soft pale under-glow behind every fly-stage enemy (a soft light disc the ship's dark hull reads against), so a dark ship never sits on a dark city.
      No canvas shadow / blur: on slow phones a blurred rim per ship cost frames.
      Glow strength per district (LGB.st, all .8 today, the lowest that passed every scene in legible-test.js; lower one for a brighter city). No new art; bosses untouched.
   2. Enemy bullets: a dark halo under every enemy bullet (bigger than the painted orb), so a bullet over a lit tower or an explosion still has a dark edge,
      so the painted orb glows on dark instead of being added to a lit backdrop. Hit sizes untouched.
   3. Backdrop: the play band (middle of the short side) is darkened a little more than readable.js does (one cached gradient fill, no extra composite pass); the outer 12% on each side keeps
      the city as it was, so the district stays recognisable.
   4. Colour grammar (INDUSTRY-PLAYBOOK.md 'Colour grammar'): enemy fire warm (pink / red / orange), player shots cool (readable.js), pickups green, music coins leaf green (gold is the elite ring and sits next to orange shells). ---------- */
if(RET.legible===undefined)RET.legible=!/[?&]legible=0/.test(location.search);
const LGB=window.LGB={GLOW:'#e9e2ff',GR:2.4,GC:1.9,HALO:'rgba(4,1,10,1)',BAND:.3,DIM:.35,DIMHC:.45,EDGE:.12,PX:{base:.35,roof:1.1},   // PX: phone backdrop scroll factors (base picture, rooftops; were .1 / .5: the city crawled ~8 px/s and sat under a .55 + .45 black veil, 22 Oct owner on a real phone)
  
  PK:{shard:'#5dff8a',hp:'#5dff8a',up:'#5dff8a',emp:'#5dff8a'},COIN:'#7dff5d',
  /* under-glow alpha per district (G.di); tuned with legible-test.js */
  st:[1,1,1,1,1,1,1,1,1,1,1,1],ga(){const a=this.st[G.di];return a==null?1:a;},
  stat:{en:0,halo:0,band:0},
  /* 1. one enemy */
  enemy(de,e,t){if(e.type==='boss'||!running)return de(e,t);const r=e.r||12;ctx.save();ctx.globalCompositeOperation='source-over';G_(e.x,e.y,r*this.GR,this.GLOW,this.ga());G_(e.x,e.y,r*this.GC,this.GLOW,this.ga());this.rim(e.x,e.y,r);ctx.restore();
    de(e,t);this.stat.en++;e._lg=(e._lg|0)+1;},
  /* 1b. a flat pale disc + thin pale edge right behind the hull (review 9 E21): the soft glow fades to nothing at the hull's own edge, so a dark ship entering at the black top of the
     field read ~2.5:1; the disc gives every hull a light plate (alpha RA, radius RR x r). Enemy bullets keep their contrast: their dark halo is drawn later, over the disc. */
  RA:.3,RR:1.15,RL:.6,
  /* hull brightness factor for the recoloured sheets (foeart.js FOEART.sheet; built once per tint, no per-frame cost): the dark red / navy hulls read ~2.5:1 on the black top of the field */
  BR:1.4,
  rim(x,y,r){const R=r*this.RR;ctx.globalAlpha=this.RA*(window.COM?COM.g():1);ctx.fillStyle=this.GLOW;ctx.beginPath();ctx.arc(x,y,R,0,7);ctx.fill();
    ctx.globalAlpha=this.RL*(window.COM?COM.g():1);ctx.strokeStyle=this.GLOW;ctx.lineWidth=1.6;ctx.stroke();ctx.globalAlpha=1;},
  /* 2. the dark halo under the enemy bullets */
  halo(){const L=G.eb;if(!L.length)return;const bg=(RET.asBigOn()?1.35:1)*1.2;ctx.save();ctx.globalCompositeOperation='source-over';ctx.fillStyle=this.HALO;ctx.beginPath();
    for(const b of L){const r=b.r*(this.HK[b.k||'']||2.1)*bg+1.5;ctx.moveTo(b.x+r,b.y);ctx.arc(b.x,b.y,r,0,7);}ctx.fill();ctx.restore();this.stat.halo++;},
  /* 3. the play band: w,h = the backdrop's own units (landscape W,H; portrait PW_,PH_); the band runs across the short side */
  band(w,h){const P=w<h,E=this.EDGE,key=w+'x'+h+'@'+this.BAND;let g=this._g;
    if(!g||this._gk!==key){g=this._g=P?ctx.createLinearGradient(0,0,w,0):ctx.createLinearGradient(0,0,0,h);this._gk=key;const k='rgba(0,0,0,'+this.BAND+')',z='rgba(0,0,0,0)';
      g.addColorStop(0,z);g.addColorStop(E*.5,z);g.addColorStop(E*1.6,k);g.addColorStop(1-E*1.6,k);g.addColorStop(1-E*.5,z);g.addColorStop(1,z);}
    ctx.save();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;ctx.fillStyle=g;ctx.fillRect(-40,-40,w+80,h+80);ctx.restore();this.stat.band++;}};
HOOK.drawEnemy(de=>function(e,t){if(!RET.legible)return de(e,t);LGB.enemy(de,e,t);});
{const d0=READ.dim;READ.dim=function(w,h){d0.call(this,w,h);if(RET.legible&&RET.read&&running)LGB.band(w,h);if(LGB.grab)LGB.grab(ctx);};}   // grab: legible-test.js reads the backdrop alone here
/* 1c. ships drawn from their own sheet (gunship, kamikaze, the four fleet ships: SPR.foe, no recoloured strip to brighten) get the same lift as one added copy at alpha BR-1 (one drawImage per ship, no filter) */
{const f0=SPR.foe;SPR.foe=function(e,id,t,x,y,w,rot,fl){const ok=f0.call(this,e,id,t,x,y,w,rot,fl);if(!ok||fl||!RET.legible||!running||LGB.BR<=1||!e||e.type==='boss')return ok;
  ctx.save();if(rot){ctx.translate(x,y);ctx.rotate(rot);x=0;y=0;}ctx.globalCompositeOperation='lighter';ART.drawAnim(ctx,'ship-'+id+'/'+e._ea,t-e._es,x,y,e._fs,false,LGB.BR-1);ctx.restore();return ok;};}
/* 2b. size floor (22 Oct owner: "I can not see the bullets"): an enemy bullet is DRAWN at least MINR css px in radius (about 10 css px across with its dark halo); the hit circle (b.r in update) is never touched:
   the radius is swapped for the draw call and put back at once */
LGB.MINR=4.3;LGB.HK={n:2.6,r:2.4,'':2.1,s:2.1};LGB.vis=function(on){const L=G.eb;if(!L.length)return;const m=this.MINR/READ.ppu();for(const b of L){if(on){if(b.r<m){b._r0=b.r;b.r=m;}}else if(b._r0!==undefined){b.r=b._r0;delete b._r0;}}};
{const b0=READ.bullets;READ.bullets=function(){if(!RET.legible)return b0.call(this);LGB.vis(true);try{LGB.halo();return b0.call(this);}finally{LGB.vis(false);}};}
/* 3b. a lighter veil: readable.js darkens the whole backdrop by DIM, the band adds BAND on top (DIM .35 + BAND .3; was .45 + .55: a 75 % black veil, the scrolling city was invisible; only with legible on, ?legible=0 keeps the old numbers) */
{const d1=READ.dim;READ.dim=function(w,h){if(!RET.legible)return d1.call(this,w,h);const a=this.DIM,b=this.DIMHC;this.DIM=LGB.DIM;this.DIMHC=LGB.DIMHC;try{d1.call(this,w,h);}finally{this.DIM=a;this.DIMHC=b;}};}
/* 4. pickups: shards / hull / upgrade / EMP glow green, music coins leaf green (gold is the elite ring and sits next to orange shells) (power.js PW.pickup) */
if(RET.legible&&RET.read)READ.UP=LGB.PK.up;
{const pk=PW.pickup;PW.pickup=function(p,y,t){const K=PWK[p.k];if(!RET.legible||!K)return pk.call(this,p,y,t);const c=K.c;K.c=LGB.COIN;try{return pk.call(this,p,y,t);}finally{K.c=c;}};}
