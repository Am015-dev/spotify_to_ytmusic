// Advisor test: seat 0 follows (a) the new advisor, (b) the old advice (aiMove hard), vs easy computers (the guided game) or hard computers.
// node advtest.js [games] -> survival turns, win rate, deaths by edge/trap, and "forced loss while a better move existed" violations
const fs=require('fs');const {load}=require('./tools/load');
const ui=fs.readFileSync(__dirname+'/ui6.js','utf8');const a=ui.indexOf('function surv2('),b=ui.indexOf('function recMove(');
const X=load(['data.js','engine.js','ai.js'],'\n'+ui.slice(a,b)+';globalThis.__adv=advise;');const advise=X.ctx.__adv;
const N=+process.argv[2]||40;
function play(seed,np,lvOpp,mode){X.setSeed(seed);X.ai.setAiSeed(seed^77);X.newGame({players:np,exp:{},level:lvOpp,first:0,lv:Array(np).fill(lvOpp)});let k=0,viol=0,dec=0;
  while(X.G.phase!=='over'&&k++<3000){const s=X.sideToAct();if(s<0)break;let m;
    if(s===0&&mode!=='ai'&&!X.G.q&&X.G.phase==='play'){const K=X.knowledge(0);
      if(mode==='new'){const r=advise(K,0,JSON.parse(process.env.AO||'{}'));m=r[0].m;dec++;const best=r[0];if(best.info.tier<=1&&r.some(x=>x.info.tier>=2))viol++}
      else m=X.ai.aiMove(0,'hard')}
    else m=X.ai.aiMove(s);
    const r=X.performMove(m,s);if(!r.success){console.log('REJ',JSON.stringify(m),r.error);return null}}
  return {turns:X.G.turn,win:X.G.over&&X.G.over.win.includes(0),alive0:X.G.ships[0].alive,out:X.G.ships[0].out,viol,dec}}
for(const [lv,np] of [['easy',2],['normal',3],['hard',2],['hard',4]]){for(const mode of (process.env.MODES||'old,new').split(',')){let T=0,W=0,V=0,D=0,n=0,edge=0,mon=0;const t0=Date.now();
  for(let g=0;g<N;g++){const r=play(1000+g*13,np,lv,mode);if(!r)continue;n++;T+=r.turns;W+=r.win?1:0;V+=r.viol;D+=r.dec;if(/edge/.test(r.out))edge++;if(/ran into|blocked|crushed/.test(r.out))mon++}
  console.log(`${lv}x${np} advice=${mode}: games ${n} win ${(100*W/n).toFixed(0)}% avg turns ${(T/n).toFixed(1)} you sank on the edge ${edge} on a leviathan ${mon}  forced-loss-with-better-move violations ${V}/${D}  ${((Date.now()-t0)/1000).toFixed(0)}s`)}}
