// ===== fair2 (lane H, 2026-10-17): fair race combat in the city duel (98tk_city_duel.js). Refs: docs/refs/fair_combat.md.
// Before: every frame of contact cut the rival's speed 8 % (frame-rate dependent), so a player parked or crawling in front held a rival
// to the blocker's pace, and a 2 s side hug took it from 76 to 46 km/h. There was no real takedown.
// Now (?fair2=0 = old contact; a mode opts out with C.fair2=false or sp.fair2=false):
//  - rivals are heavy: side or rear contact is a shove EVENT (cooldown FC2.cd s), at most FC2.shove of speed for either car, never per frame.
//  - blocking does not hold: a rival with you ahead on its line steers around (dodge offset), and after FC2.blk s it ghosts through.
//  - takedown = player ≥ 80 km/h AND (boost/turbo with closing speed ≥ 3 m/s, or closing speed ≥ FC2.hard): brick burst, +boost, KO feed.
//    The rival is out FC2.down s, then back on its racing line at 85 % of its old speed, ghosted FC2.ghost s and with a catch-up
//    boost (×FC2.cuK for FC2.cu s). The same rival can't be taken down again for FC2.fcCd s (hits become shoves).
//  - rivals hitting you follow the same rules: a shove event, capped, never a wreck.
const FC2={on:(()=>{try{return new URLSearchParams(location.search).get('fair2')!=='0'}catch(e){return true}})(),
 cd:.45,shove:.04,blk:1,down:1.2,ghost:1.5,cu:3,cuK:1.2,fcCd:8,hard:12,kmh:80,log:[]};
function FC2_live(sp){return FC2.on&&!!sp&&sp.fair2!==false&&!(sp.C&&sp.C.fair2===false)}
// timers + speed multiplier for this frame (0 while down)
function FC2_pre(a,dt){for(const k of['down','ghost','cu','fcCd','bumpCd'])if(a[k]>0)a[k]=Math.max(0,a[k]-dt);
 if(a.fc2Down&&!(a.down>0)){a.fc2Down=0;a.v=Math.max(a.v,(a.vDown||0)*.85);a.ghost=FC2.ghost;a.cu=FC2.cu;a.g.visible=true;FC2.log.push({e:'back',n:a.name,t:+(RO.sp?RO.sp.t:0).toFixed(2)})}
 if(!a.blocked)a.blkT=Math.max(0,(a.blkT||0)-dt*2);a.blocked=0;
 const tdl=a.dlT||0;a.dl=(a.dl||0)+clamp(tdl-(a.dl||0),-3*dt,3*dt);a.dlT=tdl*Math.max(0,1-dt*.8);
 if(a.ghost>0&&a.g)a.g.visible=Math.floor(a.ghost*10)%2===0;
 return a.down>0?0:a.cu>0?FC2.cuK:1}
function FC2_lane(a){return clamp(a.lane+(a.dl||0),-6.5,6.5)}
function FC2_takedown(sp,a,x,z){const v0=a.v;a.vDown=v0;a.v=0;a.down=FC2.down;a.fc2Down=1;a.fcCd=FC2.fcCd+FC2.down;a.dl=a.dlT=0;sp.fcTd=(sp.fcTd||0)+1;
 try{const at=V3(x,(a.y||0)+1.5,z),f=V3(Math.sin(RO.vh),0,Math.cos(RO.vh));debris(at,f.multiplyScalar(Math.abs(RO.v)*.45).add(V3(0,9,0)),26,[new THREE.Color('#ff2d95'),new THREE.Color('#ffd12c'),new THREE.Color('#2a2e40'),new THREE.Color('#ffffff')],1,(a.y||0)-.6)}catch(e){}
 if(a.g)a.g.visible=false;try{CR_smashHit()}catch(e){}try{AU.sfx('takedown')}catch(e){}shake=Math.max(shake,.6);
 let bst=0;try{if(window.B2K)bst=window.B2K.add(30,'TAKEDOWN')}catch(e){}try{comboAdd(3)}catch(e){}if(pl)pl.takedowns=(pl.takedowns||0)+1;
 feed('TAKEDOWN · '+a.name,400,'#ff2d95');RO.v*=.92;FC2.log.push({e:'td',n:a.name,t:+sp.t.toFixed(2),boost:Math.round(bst),kmh:Math.round(Math.abs(RO.v)/.92*3.6)})}
// contact + blocking, once per rival per frame (replaces the old per-frame 8 % cut)
function FC2_contact(sp,a,x,z,dt){if(a.down>0)return;const fx=Math.sin(a.h??0),fz=Math.cos(a.h??0),rx=RO.x-x,rz=RO.z-z,al=rx*fx+rz*fz,lt=rx*fz-rz*fx,d=Math.hypot(rx,rz);
 if(Math.abs((a.y||0)-RO.y)>=3)return;
 // blocking: you are on its line ahead and slower; the rival steers to the open side, then ghosts through
 if(al>0&&al<10&&Math.abs(lt)<3.6&&a.v>RO.v*Math.cos(angDiff(RO.vh,a.h??0))+1&&sp.cd<=0){a.blocked=1;a.blkT=(a.blkT||0)+dt*1.5;
  const side=Math.abs(lt)>.5?-Math.sign(lt):(a.lane>0?-1:1);a.dlT=clamp(side*4.8,-6.5-a.lane,6.5-a.lane);
  if(a.blkT>=FC2.blk&&!(a.ghost>0)){a.ghost=1;FC2.log.push({e:'ghost',n:a.name,t:+sp.t.toFixed(2)})}}
 if(a.ghost>0||d>=5.5||d<=.01)return;
 const k=(5.5-d)*.6;RO.x+=rx/d*k;RO.z+=rz/d*k;   // heavy rival: you are the one pushed out
 const pvx=Math.sin(RO.vh)*RO.v,pvz=Math.cos(RO.vh)*RO.v,cl=-((pvx-fx*a.v)*rx+(pvz-fz*a.v)*rz)/d;   // closing speed, m/s
 if(!(a.fcCd>0)&&al<2&&Math.abs(RO.v)*3.6>=FC2.kmh&&((SM2_boost()&&cl>=3)||cl>=FC2.hard))return FC2_takedown(sp,a,x,z);
 if(a.bumpCd>0)return;a.bumpCd=FC2.cd;try{AU.sfx('bump')}catch(e){}shake=Math.max(shake,.2);
 if(al>1.5&&a.v>RO.v){RO.v+=Math.min(3,(a.v-RO.v)*.3);a.v*=1-FC2.shove*.5}   // it hits you from behind: you get shoved forward
 else{a.v*=1-FC2.shove;RO.v*=1-FC2.shove;a.dlT=clamp(-Math.sign(lt||1)*2.5,-6.5-a.lane,6.5-a.lane)}   // side/rear shove: it slides aside a little
 FC2.log.push({e:'shove',n:a.name,t:+sp.t.toFixed(2),cl:+cl.toFixed(1)})}
