// AI trace: node tools/aitrace.js job np seed [level]  -> public log with each AI turn decision (p, why) and the fuse
const {load}=require('./load');const X=load(['data.js','engine.js','ai.js']);const [n,np,seed]=process.argv.slice(2,5).map(Number);const lv=process.argv[5]||'normal';
const s0=7919*n+104729*np+seed*31337;X.setSeed(s0);X.ai.setAiSeed(s0^0x5bd1);X.newGame({np,mission:n,mode:'ai',level:lv});
let k=0,lastLog=X.G.logN;const out=[];const ctx=X.ctx;
const flush=()=>{const L=X.G.log.filter(l=>l.i>lastLog).reverse();for(const l of L)out.push('   '+l.t);lastLog=X.G.logN};
while(!X.G.over&&k++<4000){const st=X.ai.aiStep();if(!st)break;const main=X.G.step==='act'&&st.seat===X.G.actor&&!X.G.q;
  if(main){const K=X.knowledge(st.seat);const held=[];for(const s of K.stands)if(s.mine)held.push(s.slots.map(x=>x.cut?'_':x.v==null?'?':x.v).join(','));
    const A=ctx.AILAST;out.push(`T${X.G.turn} ${X.G.seats[st.seat].nm} dial=${X.G.dial} hand=[${held.join(' | ')}] -> ${X.describeMove(st.m)} ${A?`p=${A.p!=null?A.p.toFixed(2):'-'} ev=${A.ev!=null?A.ev.toFixed(2):''}`:''} ${JSON.stringify(X.G.ms).slice(0,160)}`);ctx.AILAST=null}
  X.performMove(st.m,st.seat);flush()}
console.log(out.join('\n'));console.log('RESULT',JSON.stringify(X.G.over));
