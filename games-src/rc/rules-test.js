const fs=require('fs'),vm=require('vm');
const files=['data-gen.js','data.js','cards-ev.js','cards-adv.js','text.js','engine.js','phases.js','scen.js','moves.js','ai.js'];
const src=files.map(f=>fs.readFileSync(__dirname+'/'+f,'utf8')).join('\n')+';UI.pause=true;';
let pass=0,fail=0;
function T(name,code){const ctx={console,Math,JSON,Date,setTimeout:()=>0,clearTimeout(){},localStorage:{getItem(){return null},setItem(){},removeItem(){}},refresh(){},performance:{now:()=>Date.now()}};vm.createContext(ctx);vm.runInContext(src,ctx);
  try{const r=vm.runInContext(`(()=>{setSeed(7);newGame({scen:'marooned',chars:['carpenter','cook'],mode:'ai'});${code}})()`,ctx);if(r===true){pass++}else{fail++;console.log('FAIL',name,r)}}catch(e){fail++;console.log('ERR',name,e.message)}}
const W=`function wx(o){G.stk=[];G.wxEarly=o.roll||{};G.round=o.round||1;Object.assign(G.wx,o.tok||{});push({f:'fn',k:'weather'});run()}`;
T('rulebook weather example',W+`;G.camp.shelter=true;G.camp.roof=1;G.res={food:1,pfood:0,wood:3,fur:0};G.round=4;G.wxEarly={rain:'2 rain'};G.wx.snow=1;const w0=G.chars.map(c=>c.w);G.stk=[];push({f:'fn',k:'weather'});run();
  return G.res.wood===0&&G.res.food===0&&G.chars.every((c,i)=>c.w===w0[i]+1)||JSON.stringify([G.res,G.chars.map(c=>c.w)])`);
T('hunger: 2 wounds for the one who does not eat',`G.stk=[];G.res.food=1;G.res.pfood=0;G.camp.shelter=true;const w0=G.chars.map(c=>c.w);push({f:'fn',k:'night'});run();const d=G.chars.map((c,i)=>c.w-w0[i]).sort();return JSON.stringify(d)==='[0,2]'||JSON.stringify(d)`);
T('no shelter: 1 wound each at night',`G.stk=[];G.res.food=5;const w0=G.chars.map(c=>c.w);push({f:'fn',k:'night4'});run();return G.chars.every((c,i)=>c.w===w0[i]+1)`);
T('food spoils, dry food keeps',`G.stk=[];G.res.food=3;G.res.pfood=2;G.camp.shelter=true;push({f:'fn',k:'night4'});run();return G.res.food===0&&G.res.pfood===2`);
T('2 pawns on a build: no dice, sure',`G.stk=[];G.phase='plan';G.res.wood=5;place('c0_0','build',{k:'shelter'});place('c0_1','build',{k:'shelter'});const a=G.plan.acts[0];return actNeed(a).need===1&&a.pw.length===2&&a.pw.length>actNeed(a).need`);
T('shelter costs 2 wood with 2 castaways, 3 with 3',`const a={id:1,type:'build',tgt:{k:'shelter'},pw:[],pay:'wood'};G.plan.acts=[a];const c2=actCost(a).wood;G.np=3;const c3=actCost(a).wood;return c2===2&&c3===3`);
T('gather two tiles away needs one more pawn',`G.map[6].tile=1;const far=MAP.find(m=>dist(G.camp.pos,m.id)===2&&m.id!==6);G.map[far.id].tile=4;return actNeed({type:'gather',tgt:{pos:far.id,i:0}}).need===2`);
T('threat pushed off fires its effect',`G.stk=[];G.ev.threat=['tempers','bicker'];const d0=G.chars.map(c=>c.det=3);push({f:'fn',k:'placeThreat',card:'weary'});run();return G.ev.threat[0]==='bicker'&&G.ev.threat[1]==='weary'&&G.chars.every(c=>c.det===1)`);
T('morale -2: first player loses 2 determination, wound when short',`G.stk=[];G.morale=-2;const c=firstC();c.det=1;const w=c.w;push({f:'fn',k:'morale'});run();return c.det===0&&c.w===w+1`);
T('morale-down arrow fires on the 3rd wound of the Cook',`const c=G.chars[1];G.morale=0;wound(c,3);return G.morale===-1`);
T('moving a built shelter halves roof and palisade (down)',`G.camp.shelter=true;G.camp.roof=3;G.camp.pal=2;G.map[6].tile=1;G.stk=[];push({f:'fn',k:'doMove',p:6});run();return G.camp.roof===1&&G.camp.pal===1&&G.camp.pos===6`);
T('personal invention: only its owner leads, +2 determination',`G.inv.built.rope=1;G.phase='plan';G.stk=[];const w=placeWhy('c1_0','build',{k:'snare'});const ok=!place('c0_0','build',{k:'snare'});place('c0_1','build',{k:'snare'});const d=P(0).det;push({f:'fn',k:'go'});run();return !!w&&ok&&(has('snare'))&&P(0).det>=d+2`);
T('Friday alone: a "?" is a wound, not an adventure',`G.stk=[];G.map[6].tile=1;G.phase='plan';place('fri','gather',{pos:6,i:0});const a=G.plan.acts[0];const f0=G.fri.w;const n0=G.adv.gather.length;push({f:'fn',k:'outcome',id:a.id,d:{w:false,s:true,q:true},forceAdv:false,actor:-1,fri:true});run();return G.fri.w===f0+1&&G.adv.gather.length===n0`);
T('pile: one stage per round',`G.phase='plan';G.res.wood=10;const a=pileAdd(1);const b=pileWhy(1);G.round=2;G.sc.stageRound=1;const c=pileAdd(2);return !a&&!!b&&!c&&G.sc.pile===3`);
T('Marooned: win with fire and a full pile in round 10',`G.round=10;G.inv.built.fire=1;G.sc.pile=15;SCEN.marooned.check();return !!(G.over&&G.over.win)`);
T('Marooned: no win in round 9',`G.round=9;G.inv.built.fire=1;G.sc.pile=15;SCEN.marooned.check();return !G.over`);
T('Hexed: 5 crosses win',`newGame({scen:'hexed',chars:['cook']});for(const p of [7,6,2,11])G.map[p].tile=G.map[p].tile||[1,3,4,5][[7,6,2,11].indexOf(p)];G.map[1].tile=6;for(const p of [7,6,2,11,1])SCEN.hexed.built('cross',0,p);return !!(G.over&&G.over.win)`);
T('Hexed: fog adds a pawn and hides the terrain',`newGame({scen:'hexed',chars:['cook']});G.map[6].tile=4;const n0=actNeed({type:'gather',tgt:{pos:6,i:0}}).need;G.map[6].fog=1;return actNeed({type:'gather',tgt:{pos:6,i:0}}).need===n0+1&&!explored().has('hills')`);
T('Stranded: Ada loses 2 life a night on the rock',`newGame({scen:'stranded',chars:['cook','carpenter']});G.stk=[];G.camp.shelter=true;G.res.food=9;push({f:'fn',k:'night4'});run();return G.sc.ada===2`);
T('Stranded: rescue adds Ada, who can only rest',`newGame({scen:'stranded',chars:['cook','carpenter']});SCEN.stranded.specials.ada.win({});G.phase='plan';return G.chars.length===3&&!!placeWhy('c2_0','gather',{pos:6,i:0})&&!placeWhy('c2_0','rest',null)`);
T('Settlers: a hungry child loses the game',`newGame({scen:'settlers',chars:['cook']});G.sc.kids=1;G.res.food=1;G.res.pfood=0;G.stk=[];push({f:'fn',k:'night'});run();return !!(G.over&&!G.over.win)`);
T('Solo: morale +1 before the morale phase',`newGame({scen:'marooned',chars:['cook']});G.morale=0;G.stk=[];push({f:'fn',k:'morale'});run();return G.morale===1&&!!G.fri&&G.dog`);
T('hunting: weapon short = wounds, food and fur arrive later',`G.stk=[];G.weapon=2;const c=P(0);const w=c.w;push({f:'fn',k:'fight',beast:Object.assign({},BEAST.bear),who:0,ctx:{fut:true},hunted:true});run();return c.w===w+4&&G.fut.food===5&&G.fut.fur===2&&G.weapon===1`);
T('save/load round trip keeps a playable state',`G.stk=[];let s=0;while(!planOpen()&&s++<99){if(G.q)answer(0);else run()}const j=JSON.stringify(G);G=JSON.parse(j);aiPlan();return !startActions()`);
// clarity: every wound from a card names its cause (the event, or the ignored threat)
T('event wound names its card',`G.stk=[];push({f:'ops',ops:[['wound','all',1]],ctx:{actor:G.first,card:'tempers',half:'ev'}});run();return G.log.slice(0,3).some(l=>/takes 1 wound \\(“Tempers Flare”\\)/.test(l.t))||JSON.stringify(G.log.slice(0,3).map(l=>l.t))`);
T('ignored threat wound names the threat',`G.stk=[];G.ev.threat=['weary','bicker'];push({f:'fn',k:'placeThreat',card:'tempers'});run();return G.log.slice(0,6).some(l=>/wound \\(ignored threat “Take It Slow”\\)/.test(l.t))||JSON.stringify(G.log.slice(0,6).map(l=>l.t))`);
console.log(`rules tests: ${pass} pass, ${fail} fail`)
