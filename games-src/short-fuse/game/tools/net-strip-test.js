// netStrip(G,seat): knowledge / validMoves / sideToAct / legal on the stripped copy must equal the real ones; nothing hidden may remain in the copy.
const {load}=require('./load');const X=load(['data.js','engine.js','ai.js','netstrip.js'],';globalThis.__NS=netStrip;globalThis.__RED=RED_IDS[0];');
const seeds=+process.argv[2]||1;let checks=0,bad=0,leak=0,games=0;const msgs=[];const byJob={};
function check(tag){const nb=bad;const real=X.G;const seats=real.seats.map(q=>q.i).concat([-1]);
  for(const s of seats){const P=X.ctx.__NS(real,s);const j=JSON.stringify(P);
    // nothing hidden: every hidden slot id is 0, pile/box/aside all 0
    let k1,k2,v1,v2,t1,t2,l1,l2,sd1,sd2;
    if(s>=0){k1=JSON.stringify(X.knowledge(s));v1=JSON.stringify(X.validMoves(s));t1=X.render_game_to_text(s);sd1=X.sideToAct();l1=X.validMoves(s).slice(0,8).map(m=>X.legal(m,s))}
    X.G=P;try{if(s>=0){k2=JSON.stringify(X.knowledge(s));v2=JSON.stringify(X.validMoves(s));t2=X.render_game_to_text(s);sd2=X.sideToAct();l2=X.validMoves(s).slice(0,8).map(m=>X.legal(m,s))}
      else{X.knowledge(0);X.sideToAct()}}catch(e){bad++;if(msgs.length<8)msgs.push(tag+' seat '+s+' threw '+e.message)}finally{X.G=real}
    checks++;
    if(s>=0){if(k1!==k2){bad++;if(msgs.length<8){let i=0;while(i<k1.length&&k1[i]===k2[i])i++;msgs.push(tag+' seat '+s+' knowledge differs near '+k1.slice(Math.max(0,i-60),i+50)+' | '+k2.slice(Math.max(0,i-60),i+50))}}
      if(v1!==v2||sd1!==sd2||JSON.stringify(l1)!==JSON.stringify(l2)){bad++;if(msgs.length<8)msgs.push(tag+' seat '+s+' moves/legal differ')}
      const nz=x=>x.replace(/"n":\d+/g,"").replace(/"[^"]*:down"/g,"");if(nz(t1)!==nz(t2)){bad++;if(msgs.length<8)msgs.push(tag+' seat '+s+' text differs')}}
    // leak scan against the real state
    for(const [si,st] of real.st.entries())for(const [k,sl] of st.w.entries()){const own=s>=0&&real.pos[s]===st.pos;const seen=sl.cut||(s>=0&&((own&&!sl.flip)||(!own&&sl.flip)));if(!seen&&P.st[si].w[k].id!==0&&P.st[si].w[k].id!==X.ctx.__RED){leak++}}
    if(/"rng"|"seed":[1-9]/.test(j))leak++;
    if(P.box.some(x=>x)||P.pile.some(x=>x)||P.aside.some(x=>x)||(P.robot&&P.robot.w.some(x=>x)))leak++}
  if(bad>nb){const jb=tag.split(' ')[1];byJob[jb]=(byJob[jb]||0)+bad-nb}}
const t0=Date.now();
for(let n=1;n<=66;n++)for(const np of [2,3,4,5]){if(!X.MISSIONS[n].pl.includes(np))continue;for(let g=0;g<seeds;g++){
  X.setSeed(777+n*31+np*7+g);X.ai.setAiSeed(5);X.newGame({np,mission:n,mode:'ai',lv:['normal','easy','hard','normal','easy']});games++;let k=0;
  while(!X.G.over&&k++<1500){if(k%4===1)check(`job ${n} ${np}p step ${k}`);const st=X.ai.aiStep();if(!st)break;const r=X.performMove(st.m,st.seat);if(!r.success)break}check(`job ${n} ${np}p end`)}}
console.log(`net-strip-test: ${games} games, ${checks} seat views; differences ${bad}; leaks ${leak}; ${((Date.now()-t0)/1000).toFixed(0)}s`);for(const m of msgs)console.log('  ',m);console.log('differences by job',JSON.stringify(byJob));console.log(bad+leak===0?'PASS':'FAIL')
