// Suggestion-follower bench (12 Nov): side 0 flies EXACTLY what the game suggests to a new player (the ★ dial move from
// ui.js suggestDial, the recommended action from flow.js recAct); everything else (targets, dice mods) uses the normal computer.
// Side 1 is the default first-game rival (FIRST_GAME, the default level in ui.js). No round limit. Gate: about half wins.
// Run: node bench-sugg.js [N=200] [lvl]      env: LVX='{noise:4}' to try level tweaks
const fs=require('fs'),vm=require('vm'),path=require('path');
const C={console,Math,Date,JSON,setTimeout,clearTimeout,performance:{now:Date.now}};vm.createContext(C);
for(const f of ['geo','data','exp','engine','ai'])vm.runInContext(fs.readFileSync(path.join(__dirname,f+'.js'),'utf8'),C,{filename:f});
const run=s=>vm.runInContext(s,C);
const grab=(file,name)=>{const src=fs.readFileSync(path.join(__dirname,file),'utf8');const i=src.indexOf('function '+name+'(');if(i<0)throw new Error(name);const rest=src.slice(i);const m=/\n(function |\/\/ |PHN\.|document\.)/.exec(rest.slice(1));return rest.slice(0,m?m.index+1:rest.length)};
const uiSrc=fs.readFileSync(path.join(__dirname,'ui.js'),'utf8');const dm=/Object\.assign\(UI,\{mode:'solo',fac:\[0,1\],lvl:'(\w+)'/.exec(uiSrc);
const N=+process.argv[2]||200,LVL=process.argv[3]||(dm&&dm[1])||'easy';
run('refresh=function(){};ANIM=0;AIDELAY=0;Object.assign(UI,{draft:{},hints:true});');
for(const [f,n] of [['flow.js','rockHits'],['flow.js','rockHits0'],['flow.js','inArcOf'],['flow.js','arcsOnMe'],['flow.js','recAct'],['ui.js','suggestDial']])run(grab(f,n));run('var SUGFIGHT='+(process.env.SUGFIGHT||1)+',SUGSTR='+(process.env.SUGSTR||.2));
if(process.env.LVX)run('Object.assign(LV.'+LVL+','+process.env.LVX+')');
run(`(function(){const baseP=aiPlan,baseA=aiAction;
  aiPlan=function(k){if(k!==0||${!!process.env.AIPLAN0})return baseP(k);UI.draft={};UI.sugCache=null;for(const s of alive().filter(s=>s.side===0).sort((a,b)=>psOf(a)-psOf(b))){const i=suggestDial(s);s.dial=i;UI.draft[s.id]=i}};
  aiAction=function(s,acts){if(s.side!==0)return baseA(s,acts);acts=acts||actionsFor(s);const r=recAct(s);if(!r)return ['skip'];const a=acts.find(x=>x.a===r);if(!a)return ['skip'];return [r,a.targets?a.targets[0]:a.opts?0:undefined]}})()`);
let wins=0,draws=0,unf=0;const rounds=[],hpLeft=[];
for(let g=0;g<N;g++){run(`newGame({fac:[0,1],players:[{human:false,lvl:'${process.env.AIPLAN0||'normal'}'},{human:false,lvl:'${LVL}'}],sizeK:'core',close:true,squads:FIRST_GAME.sq,ex:FIRST_GAME.ex,seed:${1000+g}})`);
  let n=0;while(!run('G.winner')&&n++<40000){if(run("G.phase==='roundend'"))run('startRound()');run('aiStep()');if(run('G.round')>60)break}
  const w=run('G.winner');if(w==='P1')wins++;else if(w==='draw')draws++;else if(!w)unf++;rounds.push(run('G.round'))}
rounds.sort((a,b)=>a-b);
console.log(`suggestion-follower vs first-game rival (${LVL}): N=${N} win%=${(100*wins/N).toFixed(1)} draws=${draws} unfinished=${unf} median rounds=${rounds[N>>1]} max=${rounds[N-1]}`);
