// node bench-ai.js [games=100] [easy|normal|hard] [newbie]: the AI against a take-first-affordable bot (wonder every 4th turn, else sell), seats alternate.
// 'newbie' (W492) = a sensible new player: builds the affordable card worth the most at a glance (points, shields, science, coins, resources), raises a wonder half the time it can, else sells. Target: Normal wins ~2 of 3.
var E=require('./src/engine.js'),AI=require('./src/ai.js');
function bot(G,st){var M=E.validMoves(G);if(!M.length)return null;
 if(G.phase==='draft'||G.pend.length)return M[0];
 st.t++;var w=M.filter(m=>m.t==='wonder');if(st.t%4===0&&w.length)return w[0];
 var b=M.filter(m=>m.t==='build');if(b.length)return b[0];var d=M.filter(m=>m.t==='discard');return d[0]||M[0]}
var D=require('./src/data.js');
function newbie(G,st,rng){var M=E.validMoves(G);if(!M.length)return null;
 if(G.phase==='draft'||G.pend.length){if(G.pend.length&&G.pend[0].type==='first')return M.filter(m=>m.who===E.sideToAct(G))[0];return M[Math.floor(rng()*M.length)]}
 var w=M.filter(m=>m.t==='wonder');if(w.length&&rng()<0.5)return w[0];
 var b=M.filter(m=>m.t==='build');if(b.length){var bv=-1,bm=b[0];b.forEach(function(m){var c=D.BYID[G.pyr[m.i].id],v=(c.vp||0)+2*(c.shields||0)+(c.sci?2:0)+(c.coin||0)/2+(c.prod?Object.keys(c.prod).reduce((a,k)=>a+c.prod[k],0)*1.5:0)+(c.choice?1.5:0)+rng();if(v>bv){bv=v;bm=m}});return bm}
 var d=M.filter(m=>m.t==='discard');return d[0]||M[0]}
var NB=process.argv[4]==='newbie';
var N=+process.argv[2]||100,L=process.argv[3]||'hard',w=0,l=0,d=0,coins=0,n=0;
for(var s=1;s<=N;s++){var G=E.newGame({seed:s*17+3}),k=0,rng=function(){return E.rnd(G)},ai=s%2,st={t:0};
 while(!G.over&&k<600){var p=E.sideToAct(G),m=p===ai?AI.pick(G,L,rng):NB?newbie(G,st,rng):bot(G,st);if(!m)break;E.apply(G,m);k++}
 if(G.winner<0)d++;else if(G.winner===ai)w++;else l++;coins+=G.players[ai].coins;n++}
console.log(L+' vs '+(NB?'newbie':'take-first-affordable')+' bot: win',w,'loss',l,'draw',d,'of',N,(100*w/N).toFixed(0)+'%','avg end coins',(coins/n).toFixed(0));
