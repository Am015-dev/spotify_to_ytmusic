/* ---------- fxwave.js: EFFECTS ASSET WAVE 8 (owner, 18 Oct 2026). Pictures for shots, muzzle flashes, impacts, explosions, enemy fire and power-ups.
   The list of files is assets-manifest.json group 'Effects (wave 8)' (made by make-fx-assets.py; prompts in FX-FLOW-PROMPTS.md).
   FXW.pic(key)   the loaded picture of media/fx-<key>.webp, but ONLY when that file is REAL art listed in media/ready.json (the hatched/glowing placeholders written by
                  make-placeholders.py are never shown: same rule as the weapon mounts and the on-foot art). null otherwise.
   Every hook below returns false (or the old key) when its picture is not real, so the game looks exactly as before until a real file is dropped. Hooks are one line in the
   code that used to draw the vector effect: bullet / muzzle / hit (c.js, art.js, b.js), explosions (art.js), zoo enemy fire (zoo.js), power-ups (powerups.js).
   Nothing is loaded here: shapes.js already loads every ready.json file once through ART.load (light-on-black pictures are keyed to transparency there, cached in ART.bm);
   scaled copies come from ART.sp (cached per size). No per-frame allocation. FXW.stat counts how often a real picture was used (tests). ---------- */
const FXW=window.FXW={stat:{bullet:0,muzzle:0,hit:0,boom:0,sniper:0,bomb:0,mine:0,bubble:0,heal:0,aim:0,nova:0,echo:0,magnet:0,wing:0,cresc:0},_n:{},bs:0,mv:0,
  SOLID:{disc:1,orbit:1,mine:1,shell:1},                                  // weapon shots painted on white (solid objects): drawn normally, not additively
  SPIN:{disc:1,orbit:1,mine:1,well:1,storm:1},
  LOOK:{arc:'electric',storm:'electric',laser:'plasma',rail:'plasma',frost:'plasma',wave:'plasma',well:'plasma'}};   // how a kill by this weapon explodes (default fire)
FXW.has=k=>{if(FXW.pic(k))return true;if(!RET.sprites)return false;const s=ART.fxSheet(k);return !!(s&&ART.anim(s));};   // a real still OR a decoded strip sheet (parts/art.js)
FXW.name=k=>FXW._n[k]||(FXW._n[k]='fx-'+k);
FXW.pic=k=>{try{const n=FXW.name(k);return ART.rd&&ART.rd.has(n+'.webp')&&ART.bm[n]?ART.bm[n]:null;}catch(e){return null;}};
/* additive picture of key k, centred, w world units wide (aspect kept), rotated; false when the picture is not real */
FXW.add=(k,x,y,w,rot,al,solid)=>{if(!FXW.pic(k))return false;const o=ART.sp(FXW.name(k),w);if(!o)return false;
  ctx.save();if(!solid)ctx.globalCompositeOperation='lighter';ART.put(o,x,y,rot,al);ctx.restore();return true;};
/* player shots: b.wid (set in g.js WP.mod) names the weapon. Called inside the additive bullet loop of render(). */
FXW.bullet=b=>{if(!b.wid)return false;const k='w-'+b.wid+'-bullet';if(!FXW.pic(k))return false;
  const L=b.len||(b.big?22:b.pn!=null?28:20),w=Math.max(22,Math.min(130,L*1.4+(b.th||3)*2)),ang=((b.vx||b.vy)?Math.atan2(b.vy,b.vx):0)+(FXW.SPIN[b.wid]?G.t*9:0);
  const o=ART.sp(FXW.name(k),w);if(!o)return false;const solid=FXW.SOLID[b.wid];
  if(solid)ctx.globalCompositeOperation='source-over';ART.put(o,b.x+(FXW.SPIN[b.wid]?0:Math.cos(ang)*w*.25),b.y+(FXW.SPIN[b.wid]?0:Math.sin(ang)*w*.25),ang,.85);if(solid)ctx.globalCompositeOperation='lighter';
  FXW.stat.bullet++;return true;};
/* muzzle flash key: the first equipped weapon (alternating) with a real muzzle picture, else the shared 'muzzle' */
FXW.mz=base=>{try{const eq=WP.eq;if(!eq)return base;let n=0,pick=null;for(const id of eq)if(id&&FXW.has('w-'+id+'-muzzle')){if(n++===FXW.mv%2||!pick)pick=id;}
    if(n>1)FXW.mv++;if(pick){FXW.stat.muzzle++;return'w-'+pick+'-muzzle';}}catch(e){}return base;};
/* hit spark key: the picture of the weapon that fired the bullet, else the shared 'hit-spark' */
FXW.hk=(b,base)=>{if(b&&b.wid&&FXW.has('w-'+b.wid+'-hit')){FXW.stat.hit++;return'w-'+b.wid+'-hit';}return base;};
/* explosion key by size and look; base = the shared explosion the game asked for, sz = its size in world units, e = the enemy (e._wk = the weapon that last hurt it) */
FXW.bk=(base,e,sz)=>{try{let sk;if(base==='explosion-boss'){const k=FXW.bs%2?'boom-boss-b':'boom-boss-a';if(FXW.has(k)){FXW.bs++;FXW.stat.boom++;return k;}return base;}
    sk=base==='explosion-small'?'small':(sz>=140?'large':'medium');const lk=(e&&e._wk&&FXW.LOOK[e._wk])||'fire';
    for(const l of lk==='fire'?['fire']:[lk,'fire']){const k='boom-'+sk+'-'+l;if(FXW.has(k)){FXW.stat.boom++;return k;}}}catch(err){}return base;};
/* --- enemy fire (zoo.js) --- */
const fxBeam=(k,x,y,ang,len,th,al)=>{const b=FXW.pic(k);if(!b)return false;ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=al;ctx.translate(x,y);ctx.rotate(ang);ctx.drawImage(b,0,-th/2,len,th);ctx.restore();return true;};
FXW.sniper=(e,k,lk)=>{if(!fxBeam('eb-sniper-beam',e.x,e.y,e.ang,1500,lk?16:9,lk?.95:.3+.5*k))return false;FXW.stat.sniper++;return true;};
FXW.aim=(e,left)=>{if(!fxBeam('eb-aim-line',e.x,e.y,e.ang,1500,left<=.3?12:7,left<=.3?.95:.45))return false;FXW.stat.aim++;return true;};
FXW.bomb=b=>{if(!FXW.add('eb-bomb',b.x,b.y,24,G.t*2,1,true))return false;FXW.stat.bomb++;return true;};
FXW.mine=(m,t,left)=>{const al=m.armed?(left<=2&&BK(t,8)?.4:1):.45;if(!FXW.add('eb-mine',m.x,m.y,m.r*2.8,t*.5,al,true))return false;ctx.globalAlpha=al;FXW.stat.mine++;return true;};
/* the shielder's bubble: the picture clipped to the front arc the vector shield covered; ctx is at the enemy's centre */
FXW.bubble=(e,r,f,al)=>{const b=FXW.pic('eb-shield-bubble');if(!b)return false;const rs=r+12;ctx.save();ctx.beginPath();ctx.moveTo(0,0);ctx.arc(0,0,rs*1.3,f-1.15,f+1.15);ctx.closePath();ctx.clip();
  ctx.globalCompositeOperation='lighter';ctx.globalAlpha=al;ctx.drawImage(b,-rs*1.15,-rs*1.15,rs*2.3,rs*2.3);ctx.restore();FXW.stat.bubble++;return true;};
FXW.healRing=(e,t)=>{if(!FXW.add('eb-heal-ring',e.x,e.y,310,t*.25,.5+.2*Math.sin(t*3)))return false;FXW.stat.heal++;return true;};
/* --- power-ups (powerups.js) --- */
FXW.nova=n=>{if(n.r<6||!FXW.add('pw-nova-ring',n.x,n.y,n.r*2.3,0,Math.max(0,Math.min(1,1-n.r/n.R))*.95))return false;FXW.stat.nova++;return true;};
FXW.echo=(g,f)=>{if(!FXW.add('pw-echo-ghost',g.x+14,g.y,56,0,.3+.4*f))return false;FXW.stat.echo++;return true;};
FXW.magnet=(f,k)=>{if(typeof PWK==='undefined'||!PWK.magb||f.c!==PWK.magb.c||!FXW.add('pw-magnet-field',f.x,f.y,2*(f.r+(f.grow||200)*k)*1.1,0,(1-k)*.85))return false;FXW.stat.magnet++;return true;};
FXW.wing=w=>{if(FXW.add('pw-wingmate-trail',w.x-24,w.y,52,0,.8))FXW.stat.wing++;};     // an addition behind the drone (the vector drone stays)
FXW.cresc=cr=>{if(!FXW.add('pw-crescendo-glow',P.x,P.y,88+8*Math.min(5,cr.bars|0),0,.3+.1*Math.min(5,cr.bars|0)))return false;FXW.stat.cresc++;return true;};
