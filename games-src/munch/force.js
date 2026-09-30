// force each card into play: give every copy of card K to a player's hand at the start, play 40 turns, report errors and whether its name hit the log
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync('doorkick.html','utf8');
const dom0=new JSDOM(html,{runScripts:'dangerously',url:'http://localhost/'});const keys=dom0.window.eval('CARDS.map(c=>c.k)');const names=dom0.window.eval('CARDS.map(c=>c.n)');dom0.window.close();
const from=+process.argv[2]||0,to=Math.min(keys.length,+process.argv[3]||keys.length);const out=[];
for(let ki=from;ki<to;ki++){const k=keys[ki];let seen=0,err=[],inv=[];for(const seat of [0,1,2]){
  const dom=new JSDOM(html,{runScripts:'dangerously',url:'http://localhost/'});const w=dom.window;w.console.error=(...a)=>err.push(a.join(' '));
  w.eval('ANIM=0;AIDELAY=0;render=function(){};schedule=function(){};refresh=function(){}');w.eval('setSeed('+(ki*31+seat)+')');w.eval("newGame('ai',4)");
  w.eval(`(function(){const ids=Object.keys(G.C).map(Number).filter(i=>G.C[i]==='${k}');for(const id of ids){for(const z of ['door','tr']){const j=G[z].indexOf(id);if(j>=0){G[z].splice(j,1);P(${seat}).hand.push(id)}}for(const p of G.pl){const j=p.hand.indexOf(id);if(j>=0&&p.i!==${seat}){p.hand.splice(j,1);P(${seat}).hand.push(id)}}}})()`);
  for(let i=0;i<6000;i++){const G=w.eval('G');if(G.winner||G.turn>40)break;try{w.eval('aiStep()')}catch(e){err.push(String(e.stack).slice(0,300));break}const v=w.eval('checkInvariants()');if(v.length){inv.push(v[0]);break}}
  const L=w.eval('G.log.map(l=>l.t)');seen+=L.filter(t=>t.includes(names[ki])).length;w.close()}
  out.push([k,names[ki],seen,err.length,inv.length]);if(err.length||inv.length)console.log('PROBLEM',k,err.slice(0,2),inv.slice(0,2))}
console.log('checked',out.length,'cards; problems',out.filter(o=>o[3]||o[4]).length);console.log('names never in log:',out.filter(o=>!o[2]).map(o=>o[1]).join(' | '))
