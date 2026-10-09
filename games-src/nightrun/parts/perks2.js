/* ---------- fifteen more garage perks: STARTING KITS. An equipped kit gives you that pit-stop upgrade at the start of every run (up to the level you own),
   so what you equip decides your build, and slots are limited (see LOADOUT in meta.js). ---------- */
{const KITS=[['sc','Wing Cannons',3,260,'Start with side cannons'],['rg','Rear Guard',3,240,'Start with a rear gun'],['pc','Piercer',4,300,'Start with piercing shots'],['cl','Arc Chain',3,320,'Start with chain lightning'],['bt','Chrono Dash',3,300,'Start with bullet time on beat dashes'],
  ['rc','Ricochet',3,280,'Start with bouncing shots'],['as','Aegis',3,320,'Start with auto-shields'],['bd','Orbit Guns',3,340,'Start with orbiting guns'],['hm','Seeker Shots',4,260,'Start with homing shots'],['sm','Score Magnet',3,200,'Start with a score magnet'],
  ['ni','Neon Interest',3,260,'Start with Neon interest'],['lk','Fortune',3,240,'Start with lucky drops'],['wn','Second Wind',1,500,'Start with Second Wind'],['og','Overdrive Core',1,520,'Start with Overdrive'],['ec','EMP Cell',1,300,'Start with an extra EMP']];
  const raw=load('mnr_tune',{}),eq=load('mnr_eq',null);
  for(const [id,n,max,p,t] of KITS){const u=UBY[id];if(!u)continue;const d={id:'kit_'+id,n:n+' kit',p,max:Math.min(max,u.max||max),c:u.c,pri:55,ic:u.ic,uid:id,t:l=>t+(l>1?' (level '+l+')':'')};
    TP_DEF.push(d);TP_BY[d.id]=d;if(raw&&isFinite(raw[d.id]))GA.tune[d.id]=Math.max(0,Math.min(d.max,Math.floor(raw[d.id])));GA.eq[d.id]=!!(eq&&eq[d.id]);}
  NR.on('runStart',()=>setTimeout(()=>{if(!G||!G.live)return;for(const d of TP_DEF){if(!d.uid||!TP.l(d.id))continue;const u=UBY[d.uid];for(let i=SH.n(d.uid);i<TP.l(d.id)&&i<u.max;i++)SH.add(d.uid);}},40));}
