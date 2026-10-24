// PURPOSE: foes spawn spaced (no stacks) and mixed (>= 2 ship sheets in a wave); art and spawn position only
// FLAG: spread (?spread=0)
// TEST: qa/w231probe.js via qa/w233.sh (max foe-box overlap, sheets on screen); W236 adds SEP (every tick)
/* ---------- spread.js (W235, owner 24 Oct 2026: foes "overlap in near-identical pairs or stacks", "no wave of 4+ copies of one sheet"). Runs on NR 'spawn' (the end of en()).
   MIX: a drone that would be the third live foe on one sheet wears another approved light-ship sheet (e.skin = an ENEMY_ART id; FOEART.id reads it). Art only: radius, hull and AI stay a drone's.
   SPACE: a foe coming in from the right edge (or on a formation path) is pushed back along x until its drawn box overlaps no live foe by more than SPREAD.OV of the smaller box;
   that gap holds for foes at one speed whatever their y, so a line, V or sine wave keeps its shape but never stacks. ---------- */
if(RET.spread===undefined)RET.spread=!/[?&]spread=0/.test(location.search);
const SPREAD=window.SPREAD={ALT:['zdrn','flank'],OV:.1,n:{skin:0,moved:0},
  key(e){const M=ENEMY_ART[FOEART.id(e)];return M?(M.s||'e'+e.type):e.type;},
  box(e){const q=window.PURL&&PURL.sheet(e);if(q)return PURL.box(e,q);const w=Math.max(e.r*4,56);return{w,h:w*.6};},
  live(e){return G.en.filter(o=>o!==e&&!o.dead&&o.type!=='boss'&&o.type!=='gate');},
  skin(e){if(e.type!=='drone')return;const L=this.live(e),cnt=k=>L.filter(o=>this.key(o)===k).length;if(cnt(this.key(e))<2)return;
    let best=null,bc=1e9;for(const id of this.ALT){e.skin=id;const c=cnt(this.key(e));if(c<bc){bc=c;best=id;}}e.skin=best;this.n.skin++;},
  space(e){if(e.type==='boss'||e.type==='gate'||!(e.x>=W-20||e.fp||e.stop))return;const A=this.box(e),st=e.stop!=null;
    for(let i=0;i<10;i++){let hit=null,need=0;
      for(const o of this.live(e)){const B=this.box(o),ex=st?e.stop:e.x,ox=o.stop!=null?o.stop:o.x,dx=ex-ox,mx=(A.w+B.w)/2,dy=e.y-o.y,my=(A.h+B.h)/2+(e.amp||0)+(o.amp||0);
        if(Math.abs(dy)>=my*(1-this.OV*1.2)||Math.abs(dx)>=mx*(1-this.OV*1.2))continue;
        const n=st?my*(1-this.OV)*(dy>=0?1:-1)-dy:ox+mx*(1-this.OV)-e.x;if(Math.abs(n)>Math.abs(need)){need=n;hit=o;}}
      if(!hit)break;if(st){const y=e.y+need;e.y=y>H-70||y<70?e.y-need:y;e.by=e.y;}else e.x+=need;this.n.moved++;}}};   // a stopped foe (turret, carrier) holds its x, so it moves in y
NR.on('spawn',e=>{if(!RET.spread||!window.PURL||!window.ENEMY_ART)return;SPREAD.skin(e);SPREAD.space(e);});
/* W236: SEP, every tick after the foes move: two live foes whose drawn boxes overlap by more than OV are pushed apart along the shorter way out, half each
   (a carrier and its gun plates are pinned: the other foe takes the whole push). Spawn spacing alone missed foes that an AI brings together later (W235 seed 1: two drones at y 510). */
SPREAD.sep=function(){const L=G.en.filter(o=>!o.dead&&o.type!=='boss'&&o.type!=='gate'&&o.x>-60&&o.x<W+60),B=L.map(o=>this.box(o)),pin=o=>o.carP||o.carC;
  for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){const a=L[i],b=L[j];if(pin(a)&&pin(b))continue;const dx=b.x-a.x,dy=b.y-a.y,mx=(B[i].w+B[j].w)/2*(1-this.OV),my=(B[i].h+B[j].h)/2*(1-this.OV);
    if(Math.abs(dx)>=mx||Math.abs(dy)>=my)continue;const ka=pin(a)?0:pin(b)?1:.5,kb=1-ka;
    if(my-Math.abs(dy)<=mx-Math.abs(dx)){const n=(my-Math.abs(dy))*(dy>=0?1:-1),mv=(o,d)=>{const y=clamp(o.y+d,50,H-50);o.by=(o.by||o.y)+y-o.y;o.y=y;};mv(a,-n*ka);mv(b,n*kb);}
    else{const n=(mx-Math.abs(dx))*(dx>=0?1:-1);a.x-=n*ka;b.x+=n*kb;}this.n.sep=(this.n.sep||0)+1;}};
NR.on('tick',()=>{if(RET.spread&&window.PURL&&window.ENEMY_ART)SPREAD.sep();});
