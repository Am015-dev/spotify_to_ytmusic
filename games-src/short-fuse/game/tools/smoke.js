const {load}=require('./load');const X=load();
let bad=0;const res={};
for(let n=1;n<=66;n++)for(const np of [2,3,4,5]){if(!X.MISSIONS[n].pl.includes(np))continue;for(let g=0;g<2;g++){
  try{X.setSeed(1000+n*10+np+g*7);X.newGame({np,mission:n,mode:'ai'});let k=0;
    while(!X.G.over&&k++<3000){const s=X.sideToAct();if(s<0){const r='nosidetoact step='+X.G.step;res[r]=(res[r]||0)+1;if(bad++<8)console.log(n,np,r);break}
      const vm=X.validMoves(s);if(!vm.length){if(bad++<8)console.log(n,np,'no moves',X.G.step,X.G.q&&X.G.q.kind);break}
      const m=vm[Math.floor(Math.random()*vm.length)];const r=X.performMove(m,s);if(!r.success){if(bad++<8)console.log(n,np,'REJ',r.error,JSON.stringify(m));break}
      const iv=X.checkInvariants();if(iv.length){if(bad++<8)console.log(n,np,'INV',iv.slice(0,3).join('; '),JSON.stringify(m));break}}
    const o=X.G.over?(X.G.over.win?'win':'loss'):'unfinished';res[o]=(res[o]||0)+1;if(o==='unfinished'&&bad++<8)console.log(n,np,'unfinished',X.G.step,X.G.turn)}
  catch(e){if(bad++<12)console.log(n,np,'EXC',e.stack.split('\n').slice(0,4).join(' | '))}}}
console.log(res,'bad',bad,'errs',X.errs.length);
