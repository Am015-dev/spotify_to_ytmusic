// quests-optin-r22q (Alex, beta.142: "a lot of annoying pop ups from side quests I never asked to do"): in free roam nothing may start by itself.
//   QV_AUTO (41_career_quests.js, ?quests=auto) restores the ambient "?" side-quest spawner for testing. Default OFF.
//   GO 📍 quests/optin: ~120 s of simulated free roam while driving shows 0 auto-started quests/popups; a quest the player starts still runs its step 1.
function QVO_go(){
  const sv={ch:RO.ch,card:RO.card,v:RO.v},R=[];
  try{
    R.push(['QV_AUTO '+QV_AUTO,QV_AUTO===false||/quests=auto/.test(location.search)]);
    const dyn0=RO.marks.filter(m=>m.dyn).length,npc=$('#npcSay'),npcOpen=()=>!!npc&&!npc.hidden;
    let popups=0,ch=0,card=0;
    for(let k=0;k<3600;k++){RO.v=20;const dt=1/30;qvTick(dt);if(typeof M1_tick==='function')M1_tick(dt);if(RO.ch)ch++;if(RO.card&&!sv.card)card++;if(npcOpen())popups++}
    const dyn1=RO.marks.filter(m=>m.dyn).length;
    R.push(['120 s drive: dyn side quests '+dyn0+'→'+dyn1,QV_AUTO||dyn1===0]);
    R.push(['no auto-started quest ('+ch+' frames) / offer card ('+card+') / NPC popup ('+popups+')',QV_AUTO||(!ch&&!card&&!popups)]);
    const m=RO.marks.find(q=>!q.dyn&&(q.kind==='otg'||q.kind==='quest')&&q.ev&&qvUse(q));
    if(!m)R.push(['no quest mark in '+CID+' to start',false]);
    else{RO.v=0;chStart(m);const ok=!!RO.ch&&RO.ch.m===m,s0=ok&&RO.ch.v2?RO.ch.v2.si:null;R.push(['player-started "'+(m.ev.name||m.ev.id)+'" runs step '+s0,ok&&s0===0]);if(RO.ch)chAbort()}
  }catch(e){R.push(['threw '+e,false])}
  finally{RO.v=sv.v;if(RO.ch&&RO.ch!==sv.ch)try{chAbort()}catch(e){}}
  const ok=R.every(r=>r[1]);return'📍 QUESTS OPT-IN · '+R.map(r=>(r[1]?'✓ ':'✗ ')+r[0]).join(' · ')+' → '+(ok?'✅ PASS':'❌ FAIL')}
function QVO_rows(GO,goSay,CK){CK.push({ver:'quests',id:'optin',area:'drive',text:'quests-optin-r22q:2026-10-21 · in free roam no side quest, ambush, delivery, NPC request or story card starts or pops up by itself (the ambient "?" spawner is behind QV_AUTO, ?quests=auto); quests start only when you stop on a marker or pick them in the map. 📍 GO drives 120 s in Frankfurt and Athens and counts 0 auto-started quests/popups, then starts one quest by hand and checks step 1.'});
 for(const c of['fra','ath'])(GO['quests/optin']=GO['quests/optin']||[]).push({c,n:'quests opt-in '+(c==='fra'?'Frankfurt':'Athens'),secs:30,fn:()=>QVO_go()})}
