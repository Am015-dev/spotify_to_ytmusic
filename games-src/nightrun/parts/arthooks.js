// PURPOSE: literal id table for fx/fg/wpmount/wp/rule/rx/ui pictures plus the hooks that draw them when real art is listed in ready.json
// FLAG: none (a picture draws only when listed in media/ready.json)
// TEST: arthooks-test.js
/* ---------- arthooks.js: every picture id of the groups fx-* / fg-* / wpmount-* / wp-* / rule-*-icon / rx-* / ui-* / foot/bg-* as a LITERAL (owner, 21 Oct 2026).
   AH.IDS is the table the asset viewer's scan reads (the other draw sites build their names at run time: 'fg-'+id, 'wpmount-'+wid, 'rx-'+state ...).
   A picture is drawn only when it is REAL art listed in media/ready.json (ART.img): the hatched PLACEHOLDER files are never shown, the code shape stays. When real art is
   dropped in (ingest-assets.py adds it to ready.json) the hooks below draw it with no code change. AH.stat counts real draws (arthooks-test.js).
   Hooks added here (each is one call at the site that draws the code shape):
     on foot (foot.js): player bullets, muzzle, hit, arc bolt, grenade, rocket blast, kill blood spark, shield-cop block, landing/dash dust, boss ground dust
     space: enemy rocket trail + plasma shell (ai.js), boss laser (draw.js), pulse-ring burst (bossmoves.js), shield bubble + fever aura on the ship (draw.js),
            bomb pulse (c.js), pickup glow + weapon level-up flash (here), DASH ring while charging (c.js / abilities.js), kill debris (art.js) ---------- */
const AH=window.AH={stat:{},
  IDS:{
  fg:['fg-h-bassswell','fg-h-blackshell','fg-h-choirbomb','fg-h-clustershell','fg-h-edgearc','fg-h-firefield','fg-h-gravmines','fg-h-halocoil','fg-h-heatwave','fg-h-hivemind','fg-h-horizon','fg-h-huntermines','fg-h-iceneedle','fg-h-minelance','fg-h-prismdisc','fg-h-pulselance','fg-h-railric','fg-h-ringshell','fg-h-seedfan','fg-h-shardring','fg-h-snowburst','fg-h-squalldisc','fg-h-thunderhead','fg-h-voltrail','fg-k-burn','fg-k-decoy','fg-k-magnet','fg-k-phase','fg-k-ram','fg-m-beat','fg-m-bounce','fg-m-heavy','fg-m-homing','fg-m-nova','fg-m-pierce','fg-m-ring','fg-m-seed','fg-m-shield','fg-m-split','fg-m-wide','fg-m-zap','fg-p-salvage','fg-p-showman','fg-p-spare'],
  footbg:['foot/bg-far','foot/bg-floor','foot/bg-mid','foot/bg-near','foot/bg-sky'],
  fxboom:['fx-boom-boss-a','fx-boom-boss-b','fx-boom-debris','fx-boom-ground-dust','fx-boom-large-electric','fx-boom-large-fire','fx-boom-large-plasma','fx-boom-medium-electric','fx-boom-medium-fire','fx-boom-medium-plasma','fx-boom-small-electric','fx-boom-small-fire','fx-boom-small-plasma'],
  fxeb:['fx-eb-aim-line','fx-eb-bomb','fx-eb-heal-ring','fx-eb-laser-sweep','fx-eb-mine','fx-eb-plasma','fx-eb-rocket-trail','fx-eb-shield-bubble','fx-eb-shockwave-ring','fx-eb-sniper-beam'],
  fxft:['fx-ft-arc','fx-ft-arc-hit','fx-ft-arc-muzzle','fx-ft-blood-spark','fx-ft-dust','fx-ft-flame','fx-ft-flame-hit','fx-ft-flame-muzzle','fx-ft-grenade','fx-ft-mg-bullet','fx-ft-mg-hit','fx-ft-mg-muzzle','fx-ft-pistol-bullet','fx-ft-pistol-hit','fx-ft-pistol-muzzle','fx-ft-rocket','fx-ft-rocket-hit','fx-ft-rocket-muzzle','fx-ft-shield-hit','fx-ft-shotgun-hit','fx-ft-shotgun-muzzle','fx-ft-shotgun-pellet'],
  fxfuse:['fx-fuse-arc-beat','fx-fuse-arc-disc','fx-fuse-arc-laser','fx-fuse-arc-mine','fx-fuse-arc-orbit','fx-fuse-arc-pulse','fx-fuse-arc-swarm','fx-fuse-beat-disc','fx-fuse-beat-laser','fx-fuse-beat-mine','fx-fuse-beat-orbit','fx-fuse-beat-pulse','fx-fuse-beat-swarm','fx-fuse-disc-laser','fx-fuse-disc-mine','fx-fuse-disc-orbit','fx-fuse-disc-pulse','fx-fuse-disc-swarm','fx-fuse-laser-mine','fx-fuse-laser-orbit','fx-fuse-laser-pulse','fx-fuse-laser-swarm','fx-fuse-mine-orbit','fx-fuse-mine-pulse','fx-fuse-mine-swarm','fx-fuse-orbit-pulse','fx-fuse-orbit-swarm','fx-fuse-pulse-swarm'],
  fxpw:['fx-pw-bomb-pulse','fx-pw-crescendo-glow','fx-pw-echo-ghost','fx-pw-fever-aura','fx-pw-level-up','fx-pw-magnet-field','fx-pw-nova-ring','fx-pw-pickup-glow','fx-pw-shield-bubble','fx-pw-wingmate-trail'],
  fxw:['fx-w-arc-bullet','fx-w-arc-hit','fx-w-arc-muzzle','fx-w-beat-bullet','fx-w-beat-hit','fx-w-beat-muzzle','fx-w-disc-bullet','fx-w-disc-hit','fx-w-disc-muzzle','fx-w-drone-bullet','fx-w-drone-hit','fx-w-drone-muzzle','fx-w-flame-bullet','fx-w-flame-hit','fx-w-flame-muzzle','fx-w-frost-bullet','fx-w-frost-hit','fx-w-frost-muzzle','fx-w-laser-bullet','fx-w-laser-hit','fx-w-laser-muzzle','fx-w-mine-bullet','fx-w-mine-hit','fx-w-mine-muzzle','fx-w-orbit-bullet','fx-w-orbit-hit','fx-w-orbit-muzzle','fx-w-pulse-bullet','fx-w-pulse-hit','fx-w-pulse-muzzle','fx-w-rail-bullet','fx-w-rail-hit','fx-w-rail-muzzle','fx-w-shell-bullet','fx-w-shell-hit','fx-w-shell-muzzle','fx-w-storm-bullet','fx-w-storm-hit','fx-w-storm-muzzle','fx-w-swarm-bullet','fx-w-swarm-hit','fx-w-swarm-muzzle','fx-w-wave-bullet','fx-w-wave-hit','fx-w-wave-muzzle','fx-w-well-bullet','fx-w-well-hit','fx-w-well-muzzle'],
  fxw34:['fx-w34-ui-ring-charge','fx-w34-ui-ring-empty','fx-w34-ui-ring-ready'],
  rule:['rule-bounce-icon','rule-bumper-icon','rule-cash-icon','rule-cover-icon','rule-echo-icon','rule-gate-icon','rule-gold-icon','rule-hulls-icon','rule-hunter-icon','rule-lane-icon','rule-pads-icon','rule-pocket-icon','rule-portal-icon','rule-tide-icon','rule-well-icon'],
  rx:['rx-bait','rx-feint','rx-hunt','rx-press','rx-retreat','rx-window'],
  ui:['ui-dash-icon','ui-emp-icon'],
  wp:['wp-arc','wp-beat','wp-disc','wp-laser','wp-mine','wp-orbit','wp-pulse','wp-swarm'],
  wpmount:['wpmount-arc','wpmount-beat','wpmount-disc','wpmount-drone','wpmount-flame','wpmount-frost','wpmount-laser','wpmount-mine','wpmount-orbit','wpmount-pulse','wpmount-rail','wpmount-shell','wpmount-storm','wpmount-swarm','wpmount-wave','wpmount-well'],
  },
  WK:{pistol:'pistol',hmg:'mg',shot:'shotgun',flame:'flame',rocket:'rocket',arc:'arc'}};   // on-foot weapon id -> fx-ft-<name>-*
AH.set=new Set(Object.values(AH.IDS).flat());
AH.ok=id=>!!(AH.set.has(id)&&typeof ART==='object'&&ART.img(id));            // the id is in the table AND real art
AH.n=k=>{AH.stat[k]=(AH.stat[k]|0)+1;};
/* additive picture, centred, w wide, on world context ctx (false when not real = the caller draws its code shape) */
AH.pic=(id,w,x,y,rot,al)=>{if(!AH.ok(id))return false;const r=ART.pic(id,w,x,y,rot,al);if(r)AH.n(id);return r;};
AH.sp=(id,w)=>{if(!AH.ok(id))return null;const o=ART.sp(id,w);if(o)AH.n(id);return o;};
AH.span=(id,x,y,w,h,rot,al)=>{if(!AH.ok(id))return false;const r=ART.span(id,x,y,w,h,rot,al);if(r)AH.n(id);return r;};
/* on-foot canvas c (a different context from the space one) */
AH.ftDraw=(c,id,x,y,w,rot,al)=>{if(!AH.ok(id))return false;const o=ART.sp(id,w);if(!o)return false;c.save();c.globalCompositeOperation='lighter';c.globalAlpha=al==null?1:Math.max(0,Math.min(1,al));c.translate(x,y);if(rot)c.rotate(rot);c.drawImage(o.c,-o.w/2,-o.h/2,o.w,o.h);c.restore();AH.n(id);return true;};
AH.ftBul=(c,b)=>{const k=AH.WK[b.wid];if(!k)return false;const a=Math.atan2(b.vy,b.vx);
  if(b.kind==='bul')return AH.ftDraw(c,'fx-ft-'+(k==='pistol'?'pistol':'mg')+'-bullet',b.x,b.y,22,a);
  if(b.kind==='pel')return AH.ftDraw(c,'fx-ft-shotgun-pellet',b.x,b.y,14,a);
  if(b.kind==='fire')return AH.ftDraw(c,'fx-ft-flame',b.x,b.y,b.r*3.2,a,Math.max(0,b.life*2.5));
  if(b.kind==='rkt')return AH.ftDraw(c,'fx-ft-rocket',b.x,b.y,34,a);
  return false;};
AH.ftMuz=(c,wid,x,y,a)=>{const k=AH.WK[wid];return !!k&&AH.ftDraw(c,'fx-ft-'+k+'-muzzle',x,y,34,a);};
/* a timed still in the on-foot fx list (S.fx): drawn by AH.ftFx in the fx loop; list = foot.js S.fx */
AH.ftPush=(list,id,x,y,sz,l)=>{if(!AH.ok(id)||list.length>260)return false;list.push({pic:id,x,y,sz,l:l||.22,m:l||.22});return true;};
AH.ftHit=(list,wid,x,y,sz)=>{const k=AH.WK[wid];return !!k&&AH.ftPush(list,'fx-ft-'+k+'-hit',x,y,sz||44);};
AH.ftFx=(c,f)=>{const k=1-f.l/f.m;AH.ftDraw(c,f.pic,f.x,f.y,f.sz*(.7+.5*k),0,1-k);};
/* the arc laser bolt: the picture along each segment of the zig-zag; ends get the hit picture */
AH.ftArc=(c,f)=>{if(!AH.ok('fx-ft-arc'))return false;const p=f.arc;for(let i=1;i<p.length;i++){const x0=p[i-1][0],y0=p[i-1][1],x1=p[i][0],y1=p[i][1],d=Math.hypot(x1-x0,y1-y0);if(d<2)continue;
    const o=ART.sp('fx-ft-arc',Math.max(24,d));if(!o)return false;c.save();c.globalCompositeOperation='lighter';c.translate((x0+x1)/2,(y0+y1)/2);c.rotate(Math.atan2(y1-y0,x1-x0));c.drawImage(o.c,-d/2,-14,d,28);c.restore();}
  const e=p[p.length-1];AH.ftDraw(c,'fx-ft-arc-hit',e[0],e[1],40);AH.n('fx-ft-arc');return true;};
/* space: pickup glow and the weapon level-up flash, as timed ART.boom stills (only when real: ART.fxDraw would draw a placeholder otherwise) */
AH.boom=(k,x,y,sz,life)=>{if(!AH.ok('fx-'+k))return false;ART.boom(k,x,y,sz,life);AH.n('fx-'+k);return true;};
AH.ring=(x,y)=>AH.boom('eb-shockwave-ring',x,y,300,.45);
AH.debris=(x,y,sz)=>AH.boom('boom-debris',x,y,sz*1.1,.55);
AH.player=()=>{if(typeof SH!=='undefined'&&SH.sh>0)AH.pic('fx-pw-shield-bubble',92,P.x,P.y,0,.7);
  if(window.RET&&RET.fv&&RET.fv.on)AH.pic('fx-pw-fever-aura',110+8*Math.sin(G.t*6),P.x,P.y,G.t*.8,.55);};
NR.on('pickup',p=>{if(p)AH.boom('pw-pickup-glow',p.x,p.y,90,.35);});
AH.lvChk=lv=>{if(AH.lv!=null&&lv>AH.lv&&P)AH.boom('pw-level-up',P.x,P.y,120,.5);AH.lv=lv;};
NR.on('tick',()=>{try{if(running&&P&&!G.dead&&typeof WP!=='undefined')AH.lvChk(WP.lv|0);}catch(e){}});
