// ---------- story campaign: the shared chapter map (gx-campaign.js) wired to this game. Data: campaign.json ----------
// A chapter is a normal game with the chapter's setup, plus its twist and checkpoint goal (scen.js: campSetup / campCheck).
UI.cmpDef=null;UI.cmpDone=false;
function campMetrics(g){return {won:!!(g.over&&g.over.win),rounds:g.round,wounds:g.stats.wounds,morale:g.morale,food:g.res.food+g.res.pfood,
  explored:g.stats.explored,crosses:(g.sc.crosses||[]).length,adaWounds:g.sc.ada||0}}
function campInit(){if(typeof GXC==='undefined'||!window.CAMPAIGN)return;
  GXC.init({game:'shipwreck',data:window.CAMPAIGN,
    startChapter(def){const s=def.setup||{};const chars=(s.chars||['carpenter','cook']).slice();
      UI.setup=Object.assign({},UI.setup,{scen:s.scen||'marooned',chars,ai:{},friday:s.friday!=null?s.friday:chars.length<=2,dog:!!s.dog,items:s.items!=null?s.items:2,diff:s.diff||'standard'});
      UI.cmpDef=def;UI.guide={on:!!def.hints,seen:{}};beginGame()},
    isWon:g=>!!(g.over&&g.over.win),
    metrics:campMetrics,
    onExit(){openStart()},
    seats:g=>g.chars.map((c,i)=>({name:c.nm,me:i===0}))})}
function campOpen(){if(typeof GXC==='undefined')return;UI.modal=null;const m=$('#modal');if(m){m.hidden=true;m.innerHTML='';m.dataset.h=''}GXC.open()}
// the game is over in a chapter: hand it to the campaign's result screen once
function campOver(){if(typeof GXC==='undefined'||!GXC.active()||!G||!G.over)return false;if(!UI.cmpDone){UI.cmpDone=true;UI.overSeen=true;const g=G;setTimeout(()=>{try{localStorage.removeItem(SAVE)}catch(e){}GXC.finish(g)},400)}return true}
// one line for the title: where the story stands
function campLine(){try{if(typeof GXC==='undefined'||!window.CAMPAIGN)return '';const p=GXC.progress();const ch=window.CAMPAIGN.chapters;const n=ch.filter(c=>p.ch[c.id]&&p.ch[c.id].beaten).length;
  if(!n)return '';const nx=ch.find(c=>!(p.ch[c.id]&&p.ch[c.id].beaten));return `<b>${n} of ${ch.length} chapters done${nx?`, next: “${esc(nx.title)}”`:''}.</b>`}catch(e){return ''}}
// the chapter being played, for the goal bar and goal card
function campDef(){return typeof GXC!=='undefined'&&GXC.active&&GXC.active()||null}
campInit();
