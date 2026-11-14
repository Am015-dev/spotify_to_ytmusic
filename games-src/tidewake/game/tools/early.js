// early knock-out + star honesty check: seat 0 follows the advice (start button, then the ★) vs N-1 computers, rulebook start (6 leviathans).
// node tools/early.js <old|new> [games=20] [rivals=normal] [players=3]
//   old = the previous advice (hard computer's start, ★ sorted by its score); new = safeStart + ★ by counted risk
// prints: early knock-out rate (out after <=2 placements), win %, and for "new" the predicted risk of each ★ vs how often a leviathan really got me
const fs=require('fs');const {load}=require('./load');const U6=fs.readFileSync(__dirname+'/../ui6.js','utf8');
let ADV=U6.slice(U6.indexOf('function surv2'),U6.indexOf('function recMove'));const SS=U6.slice(U6.indexOf('function safeStart'),U6.indexOf('function startAdvice'));
const mode=process.argv[2]||'new',n=+process.argv[3]||20,lv=process.argv[4]||'normal',np=+process.argv[5]||3;
if(mode==='old')ADV=ADV.replace(/out\.sort\(\(a,b\)=>\(b\.info\.tier===0[^;]*;return out\}/,'out.sort((a,b)=>b.info.tier-a.info.tier||b.sc-a.sc);return out}');
const X=load(['data.js','engine.js','ai.js'],ADV+SS+';globalThis.__ADV=(K,s)=>advise(K,s);globalThis.__SS=(K,s)=>safeStart(K,s);');
let early=0,wins=0,pls=0,pred=0,hit=0,samples=0,bins={};
for(let g=0;g<n;g++){X.setSeed(g*7919+101);X.ai.setAiSeed(g+77);X.newGame({players:np,seats:['human'].concat(Array(np-1).fill('ai')),lv:['hard'].concat(Array(np-1).fill(lv)),first:g%np});
  let k=0,pl=0,open=null;
  while(X.G.phase!=='over'&&k++<5000){const s=X.sideToAct();if(s<0)break;let m=null;
    if(s===0&&!X.G.q&&X.G.phase==='setup'){if(mode==='new'){X.UI.ssKey=null;const b=X.ctx.__SS(X.knowledge(0),0);m=b&&b.m}if(!m)m=X.ai.aiMove(0,'hard')}
    else if(s===0&&!X.G.q&&X.G.phase==='play'&&X.G.step==='act'){
      if(open){samples++;pred+=open.rk;(bins[open.b]=bins[open.b]||[0,0])[0]++;open=null}  // reached my next turn afloat
      const a=X.ctx.__ADV(X.knowledge(0),0);const e=a&&a[0];m=e?e.m:X.ai.aiMove(0,'hard');pl++;
      if(e&&e.info.rk!=null){const b=e.info.rk<.05?'0-4%':e.info.rk<.15?'5-14%':e.info.rk<.3?'15-29%':'30%+';open={rk:e.info.rk,b}}}
    else m=X.ai.aiMove(s,s===0?'hard':lv);
    if(!m)break;X.performMove(m,s);
    const me=X.G.ships[0];if(!me.alive&&open){samples++;pred+=open.rk;const lev=/crushed|blocked/.test(me.out);if(lev){hit++;bins[open.b]=bins[open.b]||[0,0];bins[open.b][0]++;bins[open.b][1]++}else{bins[open.b]=bins[open.b]||[0,0];bins[open.b][0]++}open=null}}
  pls+=pl;if(!X.G.ships[0].alive&&pl<=2)early++;if(X.G.over&&X.G.over.win.includes(0))wins++}
console.log(`${mode} vs ${np-1}x${lv}, ${n} games: out after <=2 placements ${early}/${n} (${(100*early/n).toFixed(0)}%), win ${(100*wins/n).toFixed(0)}%, my placements ${(pls/n).toFixed(1)}`);
if(samples)console.log(`★ risk said ${(100*pred/samples).toFixed(1)}% on average over ${samples} ★ moves; a leviathan really got me ${hit} times (${(100*hit/samples).toFixed(1)}%). By band: `+Object.entries(bins).map(([b,v])=>`${b}: ${v[1]}/${v[0]}`).join(', '));
