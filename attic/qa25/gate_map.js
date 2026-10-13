// qa25/gate_map.js: review shots for the map legend chips (real taps): start screen, big map all / races off / garages only, minimap filtered
// (after leaving the auto-started mission through the pause menu, so the minimap shows icons), plus a tap on a hidden icon.
const L=require('./lib.js'),R=require('./roam.js');(async()=>{const T=await L(process.argv[2],process.argv[3]);const{ev,tap,shot}=T;await shot('00_start');await R(T);
 const drawn=()=>ev(()=>__g9ev(`(()=>{MF.g=1;try{const C={};for(const m of RO.marks)if(markKnown(m)){const c=MF_cat(m)||'other';C[c]=(C[c]||0)+1}return JSON.stringify(C)}finally{MF.g=0}})()`));
 await tap('#roamExit',1200);const ab=await ev(()=>{const b=document.querySelector('#roamPause [data-p="eva"]');return !!b&&b.getBoundingClientRect().width>0});if(ab)await tap('#roamPause [data-p="eva"]',2500);else await tap('#roamPause [data-p="resume"]',1000);
 for(const s of['#m1Skip','#storyGo']){if(await ev(s=>{const e=document.querySelector(s);return !!e&&e.getBoundingClientRect().width>0},s))await tap(s,1200)}
 console.log('mission active after abandon',await ev(()=>__g9ev('!!RO.ch')));await shot('01_mini_all');
 await tap('#roamMini',1500);await shot('02_map_all');console.log('all',await drawn());
 await tap('#mfBar [data-mf="race"]');await shot('03_map_races_off');console.log('races off',await drawn());
 await tap('#mfBar [data-mf="all"]');await tap('#mfBar [data-mf="all"]');await tap('#mfBar [data-mf="garage"]');await shot('04_map_garages_only');console.log('garages only',await drawn());
 const pt=await ev(()=>__g9ev(`(()=>{const c=document.querySelector('#roamMapC').getBoundingClientRect(),d=DPR2();for(const m of RO.marks){if(!MF_hid(m))continue;const[x,y]=RO.mapP(m.x,m.z);if(y/d>140&&y/d<c.height-20&&x/d>30&&x/d<c.width-130)return JSON.stringify({x:c.left+x/d,y:c.top+y/d,k:m.kind})}return null})()`));
 if(pt){const p=JSON.parse(pt);const w0=await ev(()=>__g9ev("RO.wp?RO.wp.kind+':'+(RO.wp.name||''):'none'"));await T.tapXY(p.x,p.y,900);console.log('tap on hidden',p.k,'waypoint before',w0,'after',await ev(()=>__g9ev("RO.wp?RO.wp.kind+':'+(RO.wp.name||''):'none'")))}else console.log('no hidden icon in view');
 await tap('#roamMapX',1200);await T.pg.waitForTimeout(1500);await shot('05_mini_garages_only');
 await tap('#roamMini',1500);await tap('#mfBar [data-mf="all"]');await tap('#roamMapX',800);console.log('restored',JSON.stringify(await ev(()=>__mf.off())));await T.close()})();
