// Hint-following newcomer: seat 0 is a human who follows the bulb hint (the hard advisor's pick) most of the time and
// otherwise plays like a beginner; the computer crew plays at the chosen level, knowing a human is at the table.
// node tools/newcomer-sim.js level from to seeds [follow=0.85] [players=3,4]
const {load}=require('./load');const X=load(['data.js','engine.js','ai.js']);
const A=process.argv.slice(2);const lv=A[0]||'normal',from=+A[1]||1,to=+A[2]||19,seeds=+A[3]||6,follow=A[4]!=null?+A[4]:.85;const NP=(A[5]||'3,4').split(',').map(Number);
let r=0x9e3779b9;const rnd=()=>{r^=r<<13;r^=r>>>17;r^=r<<5;return (r>>>0)/4294967296};
const simple=m=>m&&((m.a==='dual'&&m.ks&&m.ks.length===1&&!m.tool&&!m.two&&!m.own)||(m.a==='solo'&&!m.flip&&!m.ep)||m.a==='reveal'||m.a==='eq');
function pick(level){const q=X.G.seats[0];q.human=false;q.lv=level;let st=null;try{st=X.ai.aiStep()}finally{q.human=true}return st}
const out={};let W=0,N=0,byMe=0,byCrew=0,share=0,close=0,mine0=0,all0=0;
for(let n=from;n<=to;n++){const M=X.MISSIONS[n];let w=0,g=0;
  for(const np of NP){if(!M.pl.includes(np))continue;for(let s=0;s<seeds;s++){const seed=1000003*n+7919*np+s*104729;X.setSeed(seed);X.ai.setAiSeed(seed^0x51);r=(seed|1)>>>0;
    X.newGame({np,mission:n,mode:'ai',level:lv,captain:s%np});X.G.seats[0].human=true;let k=0;
    while(!X.G.over&&k++<3000){let st=X.ai.aiStep();
      if(!st){// seat 0 has to act (turn or question)
        const hard=pick('hard');let m=hard;
        if(hard&&hard.seat===0){const isQ=X.G.q&&X.G.q.who===0;if(!((isQ||simple(hard.m))&&rnd()<follow)){const e=pick('easy');if(e&&e.seat===0)m=e}}
        st=m}
      if(!st)break;const u0=X.E.standsOf(0).reduce((a,si)=>a+X.G.st[si].w.filter(x=>!x.cut).length,0);const act0=X.G.actor;const res=X.performMove(st.m,st.seat);
      {const u1=X.E.standsOf(0).reduce((a,si)=>a+X.G.st[si].w.filter(x=>!x.cut).length,0);if(u1<u0){if(act0===0)byMe+=u0-u1;else byCrew+=u0-u1}}if(!res.success)break;if(X.G.dial!=null)X.G.minDial=Math.min(X.G.minDial==null?99:X.G.minDial,X.G.dial)}
    const H=X.G.hist.filter(h=>h.ok&&(h.kind==='dual'||h.kind==='solo'));mine0+=H.filter(h=>h.seat===0).length;all0+=H.length;
    if(X.G.minDial!=null&&X.G.minDial<=1)close++;g++;if(X.G.over&&X.G.over.win)w++}}
  out[n]=g?w/g:null;W+=w;N+=g}
const bands=[[1,8],[9,19],[20,30],[31,42],[43,54],[55,66]];
for(const [a,b] of bands){let s=0,c=0;for(let n=a;n<=b;n++)if(out[n]!=null){s+=out[n];c++}if(c)console.log(`jobs ${a}-${b}: ${(100*s/c).toFixed(0)}%`)}
console.log(`newcomer (${lv} crew, follow ${follow}) jobs ${from}-${to}: ${(100*W/N).toFixed(0)}% of ${N}; newcomer made ${(100*mine0/all0).toFixed(0)}% of the good cuts; fuse got to its last step in ${(100*close/N).toFixed(0)}% of games; newcomer's own wires cut on their own turns ${(100*byMe/(byMe+byCrew)).toFixed(0)}%`);
console.log(Object.entries(out).map(([n,v])=>n+':'+Math.round(100*v)).join(' '));
