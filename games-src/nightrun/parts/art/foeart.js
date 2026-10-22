// PURPOSE: every fly-stage enemy draws from an approved ship sheet
// FLAG: foeart (?foeart=0)
// TEST: none
/* ---------- foeart.js: every fly-stage enemy draws from an approved ship sheet (owner, 21 Oct 2026: "the ships are not wired, I still see old shapes").
   Flag RET.foeart, default ON; ?foeart=0 = the drawing as it was. Needs RET.sprites (the sheets are anim/ship-e<kind>/flame|volley).
   ENEMY_ART maps EVERY enemy id the game can spawn to the nearest approved enemy-ship sheet, a tint (hue turn / saturation / brightness, built ONCE per sheet+tint into an
   offscreen strip that ART.drawAnim then draws like any other sheet), a width (k x the old radius, or w px), an optional heading and two small overlays (pre / ov, code shapes
   or existing fx art). Art only: radius, hull, hit boxes, spawn rules are not touched. Variants (VAR.in / out: size, mirror, rotation, hue pips, elite) wrap the body as before.
   native: the sheet is drawn by SPR.foe (gunship, kamikaze, the four fleet ships). NEEDS: ids that still draw their old picture (ASSETS-NEEDED-ENEMIES.md).
   Test: nightrun/foeart-test.js (every spawnable id must be mapped or listed in NEEDS). ---------- */
if(RET.foeart===undefined)RET.foeart=!/[?&]foeart=0/.test(location.search);
/* hue turn is relative to the sheets' own colour (measured: interceptor / bomber / gunship / carrier / cruiser sit at hue 228, kamikaze at 351) */
const ENEMY_ART=window.ENEMY_ART={
  /* core director kinds (dir.js, draw.js) */
  drone:{s:'edrone',k:5.1,ol:1,L:{k:6.3,t:[180,1.15,1.1]}},                       // L: the leader (e.ldr) is gold and a quarter larger
  charger:{s:'echarger',k:3.6},
  turret:{s:'eturret',k:3.1,rot:e=>aim(e)+Math.PI},
  gate:{s:'egate',w:46,h:150},                                                // two pylons (FOEART.post), nose turned to the gap
  flank:{s:'eflank',k:3.2,rot:e=>((e.side&&!e.settled)?Math.atan2(-e.side*190,-80):Math.PI)-Math.PI},
  swarm:{s:'eswarm',k:3.0},
  mine:{s:'emine',k:2.3,hp:1},
  gunship:{native:1},
  /* zoo.js kinds */
  shielder:{s:'eshielder',k:3.4,hp:1,ov:(e,t,r)=>{if(e.shN>0)FXW.bubble(e,r,e.fa==null?Math.PI:e.fa,(.35+.5*(e.shN/e.shMax))*(e.shF>0?1:.8));}},   // the existing shield picture (gameplay tell)
  splitter:{s:'esplitter',k:3.2,hp:1},
  bomber:{s:'ezbomber',k:3.4,hp:1},
  sniper:{s:'esniper',k:3.7,hp:1},
  healer:{s:'ehealer',k:3.2,hp:1},
  carrier:{s:'ecarrier',k:2.7,t:[37,1.1,1],hp:1},
  minelayer:{s:'eminelayer',k:3.2,hp:1},
  kamikaze:{native:1},
  zdrn:{s:'ezdrone',k:3.2},
  /* fleet.js (the four ships draw through FLEET.spr / SPR.foe; the drone that orbits the carrier is the interceptor in lilac) */
  einterceptor:{native:1},ebomber:{native:1},ecarrier:{native:1},ecruiser:{native:1},
  efdrone:{s:'ecdrone',k:3.2},
  /* flankers.js (ids fk-<kind>) */
  'fk-diver':{s:'ediver',k:3.2,rot:()=>-Math.PI/2,ov:(e,t,r)=>{if(e.hp>e.hull){ctx.globalAlpha=.55+.3*Math.sin(t*10);ctx.strokeStyle='#4ad1ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r+7,0,7);ctx.stroke();ctx.globalAlpha=1;}}},   // the old shield-up ring stays (gameplay tell)
  'fk-crawler':{s:'ecrawler',k:3.3},
  'fk-bait':{s:'ebait',k:3.1},
  /* leak.js road units (LEAK.art): they stand on the road line; the walker has no sheet yet */
  gtank:{s:'egtank',k:3.3,hp:1,gnd:1},gturret:{s:'egturret',k:3.3,hp:1,gnd:1}};
/* ASSET-POLICY.md: no new art in code. A stand-in is a recoloured / scaled / flipped approved sheet plus, where the type needs its own look, a plain flat marker (mk = the asset id it waits for,
   see ASSETS-NEEDED-ENEMIES.md). The marker is a small triangle / circle / box at the stern with the id in 6 px text; it goes away when a real sheet replaces the entry. */
const MKSHAPE=['tri','circ','box'];
/* ids that still draw their old picture: the sheet to ask for is in ASSETS-NEEDED-ENEMIES.md. The ground units walk, a ship cannot stand in for them. */
const NEEDS=window.FOEART_NEEDS=['gwalker'];
const FOEART=window.FOEART={fr:0,built:0,cnt:0,n:{all:0,sheet:0,stand:0,by:{}},flt:(()=>{try{return 'filter' in CanvasRenderingContext2D.prototype;}catch(_){return false;}})(),
  id:e=>e.fk&&window.FLK&&FLK.K[e.fk]?'fk-'+e.fk:e.type,
  map:e=>{const m=ENEMY_ART[FOEART.id(e)];if(!m||m.native)return null;if(e.ldr&&m.L){if(!m._L)m._L=Object.assign({},m,m.L);return m._L;}return m;},
  /* the (tinted) strip key for an act; the tinted copy is built once, at most one per frame */
  sheet(m,act){const src='ship-'+m.s+'/'+act;if(!ART.ANIM.s[src])return null;const sb=ART.anim(src);if(!sb)return null;const t0=m.t,lb=RET.legible&&window.LGB?LGB.BR:1,tn=t0&&lb!==1?[t0[0],t0[1],t0[2]*lb]:t0;if(!tn||(!tn[0]&&tn[1]===1&&tn[2]===1))return src;   // lb: legible.js lifts dark hulls (LGB.BR)
    const tg=m._tg||(m._tg=Math.round(tn[0])+'_'+Math.round(tn[1]*100)+'_'+Math.round(tn[2]*100)),vk='ship-'+m.s+'~'+tg+'/'+act;
    if(ART.VB[vk])return vk;if(FOEART.built>=1)return src;FOEART.built++;
    const cv=document.createElement('canvas');cv.width=sb.width;cv.height=sb.height;const g=cv.getContext('2d');
    if(FOEART.flt){g.filter='hue-rotate('+tn[0]+'deg) saturate('+tn[1]+') brightness('+tn[2]+')';g.drawImage(sb,0,0);}
    else{g.drawImage(sb,0,0);g.globalCompositeOperation='source-atop';g.fillStyle='hsla('+(((228+tn[0])%360+360)%360)+',80%,55%,.45)';g.fillRect(0,0,cv.width,cv.height);}   // no canvas filter (old Safari): a colour wash instead
    ART.VS[vk]=ART.ANIM.s[src];ART.VB[vk]=cv;return vk;},
  /* draw the sheet body of e at the origin of the current transform (every call site has translated to the enemy). own: this site did not run VAR.in (dir.js, zoo.js, flankers.js do not go through draw.js) */
  body(e,t,fl,own){if(!RET.foeart||!RET.sprites)return false;const m=FOEART.map(e);if(!m)return false;
    const act=e.arm&&ART.ANIM.s['ship-'+m.s+'/volley']?'volley':'flame',key=FOEART.sheet(m,act)||(act==='volley'?FOEART.sheet(m,'flame'):null);if(!key)return false;
    if(own&&e.vz)VAR.in(e,t);
    const r=e.r,w=m.w||r*m.k,sc=w/(ART.VS[key]||ART.ANIM.s[key])[2],tt=(e.t||0)+eb_(e),rot=m.rot?m.rot(e,t):0;
    ctx.save();if(rot)ctx.rotate(rot);if(m.gnd)ctx.translate(0,r-sc*(ART.VS[key]||ART.ANIM.s[key])[3]/2);if(m.ol){ctx.shadowColor='rgba(4,1,10,1)';ctx.shadowBlur=5;}ART.drawAnim(ctx,key,tt,0,0,sc,false);
    if(fl){ctx.globalCompositeOperation='lighter';ART.drawAnim(ctx,key,tt,0,0,sc,false,ART.ANIM.sm.hitstop.flash_white*.5);ctx.globalCompositeOperation='source-over';}ctx.restore();
    if(m.ov)m.ov(e,t,r,fl);
    if(m.hp&&e.max>1&&e.hp>0)hpBar(-14,-r-(e.type==='shielder'?22:9),28,e.hp/e.max);
    if(own&&e.vz)VAR.out(e,t);
    e._fs=sc;ART.anim('ship-'+m.s+'/death');e._fa=FOEART.fr;e._fk=FOEART.fr;return true;},
  marker(m,r,fl){let q=m._mc;if(!q){q=m._mc=document.createElement('canvas');q.width=40;q.height=22;const g=q.getContext('2d'),sh=MKSHAPE[(m.mk.length+m.mk.charCodeAt(0))%3];g.fillStyle='#e8ecff';g.beginPath();
      if(sh==='tri'){g.moveTo(20,1);g.lineTo(24,8);g.lineTo(16,8);g.closePath();}else if(sh==='circ')g.arc(20,5,3.5,0,7);else g.rect(16.5,1.5,7,7);g.fill();g.font='700 7px sans-serif';g.textAlign='center';g.fillText(m.mk,20,19);}
    ctx.globalAlpha=fl?1:.9;ctx.drawImage(q,r*.9-20,r*.7-5);ctx.globalAlpha=1;},
  /* gate pylon at (0,y) of the gate's frame: the nose points into the gap */
  post(e,y,up,fl){if(!RET.foeart||!RET.sprites)return false;const m=ENEMY_ART.gate,key=FOEART.sheet(m,'flame');if(!key)return false;const sm=ART.VS[key]||ART.ANIM.s[key],tall=sm[3]>sm[2],sc=tall?m.h/sm[3]:m.w/sm[2];
    ctx.save();ctx.translate(0,y);if(tall){ctx.translate(0,(up?-1:1)*m.h/2);if(up)ctx.scale(1,-1);}else ctx.rotate(up?-Math.PI/2:Math.PI/2);   // a portrait pylon (egate) stands on its end, the lamp turned to the gap; a landscape stand-in turns its nose
    ART.drawAnim(ctx,key,e.t||0,0,0,sc,false);
    if(fl){ctx.globalCompositeOperation='lighter';ART.drawAnim(ctx,key,e.t||0,0,0,sc,false,ART.ANIM.sm.hitstop.flash_white*.5);}
    ctx.restore();e._fa=FOEART.fr;e._fk=FOEART.fr;return true;},
  /* the sheets every stage can need are fetched shortly after the page loads (the rest come with their first sighting); one missing tint (only the leader / swarm tints are left) is built per idle frame, so a unit never shows the plain colour */
  warm(n){if(!RET.sprites||!RET.foeart)return;let ok=1;for(const s of['edrone','echarger','eturret','egunship'])if(!ART.anim('ship-'+s+'/flame'))ok=0;if(!ok&&(n|0)<40)setTimeout(()=>FOEART.warm((n|0)+1),250);},   // the sheets of the director's own kinds (drone, charger, turret, gunship); asked again until decoded
  idle(){if(!RET.foeart||!RET.sprites||FOEART.built)return;const L=FOEART._l||(FOEART._l=Object.values(ENEMY_ART).filter(m=>!m.native).flatMap(m=>m.L?[m,Object.assign({},m,m.L)]:[m]));
    for(const m of L){if(m.t&&!ART.VB['ship-'+m.s+'~'+(m._tg||'')+'/flame']&&ART.ANIM.s['ship-'+m.s+'/flame']&&ART.anim('ship-'+m.s+'/flame')){FOEART.sheet(m,'flame');return;}}},
  /* ids the game can spawn, from the tables it spawns from (ZOO.T, FLEET.K, FLK.K, DMG.ml and LEAK.GT; the director's own kinds) */
  ids(){const s=new Set(['drone','charger','gunship','gate','flank','swarm','mine','turret']);
    for(const T of[window.ZOO&&ZOO.T,window.FLEET&&FLEET.K,window.DMG&&DMG.ml,window.LEAK&&LEAK.GT])if(T)for(const k in T)s.add(k);
    if(window.FLK)for(const k in FLK.K)s.add('fk-'+k);s.delete('boss');return[...s];},
  /* share of on-screen enemy draws that came from a sheet (the test turns FOEART.cnt on) */
  tally(){const n=FOEART.n;for(const e of G.en){if(e.type==='boss'||e.dead||e.hp<=0||e.x<0||e.x>W||e.y<-10||e.y>H+10)continue;const id=FOEART.id(e),b=n.by[id]||(n.by[id]=[0,0,0]);n.all++;b[1]++;if(e._fa===FOEART.fr){n.sheet++;b[0]++;if(e._fk===FOEART.fr){n.stand++;b[2]++;}}}}};
setTimeout(()=>FOEART.warm(),2600);
