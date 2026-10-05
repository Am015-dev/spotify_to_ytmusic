// ===== V84: HUD diet, 2K-Drive controls, rolling start, closer camera (visual / feel). Inserted before window.__mho={ =====
SC_K.cam=.6;try{SC_rcam()}catch(e){}
// start already rolling, facing the objective when it is in front of a road
roamStep=(f=>function(dt){const now=performance.now();if(!RO._v84t||now-RO._v84t>3000){try{if(!RO.card&&!RO.frozen&&Math.abs(RO.v)<1.5&&state==='roam'){
    if(RO.wp&&Number.isFinite(RO.wp.x)){const h=Math.atan2(RO.wp.x-RO.x,RO.wp.z-RO.z);let ok=true;for(let d=6;d<=30;d+=6)if(roamHit(RO.x+Math.sin(h)*d,RO.z+Math.cos(h)*d,1.6,RO.y+.5)){ok=false;break}if(ok){RO.h=h;RO.vh=h}}
    RO.v=14}}catch(e){}}RO._v84t=now;return f(dt)})(roamStep);
