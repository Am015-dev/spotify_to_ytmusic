// Newcomer balance sim (headless, jsdom): seat 0 plays like a new player who taps glowing cards and the glow:
// half the time the game's marked move (coach), otherwise a random glowing card move or a random button.
// Rivals are the default Quick-game computers. Prints win rate, final levels and decisions per game.
//   NODE_PATH=/opt/node-tools/node_modules node newbie-sim.js [games=40] [follow=0.5] [lvl=default]
const {JSDOM}=require('jsdom');const fs=require('fs');
const N=+process.argv[2]||40,FOLLOW=process.argv[3]!=null?+process.argv[3]:0.5,LVL=process.argv[4]||'';
const html=fs.readFileSync(__dirname+'/doorkick.html','utf8');
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/',beforeParse(w){w.matchMedia=w.matchMedia||(()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}))}});
const w=dom.window;
setTimeout(()=>{
const res=w.eval(`(function(N,FOLLOW,LVL){ANIM=0;AIDELAY=0;schedule=function(){};render=function(){};refresh=function(){};try{tutOn=()=>false}catch(e){}
 const out=[];let rr=1;const rand=n=>{rr=(rr*1103515245+12345)%2147483648;return rr%n};
 for(let g=0;g<N;g++){rr=g*7919+3;setSeed(500+g);if(LVL)UI.lvl=LVL;UI.fast=${process.env.NBFAST!=='0'};UI.hints=true;UI.mode='F';newGame('F',4);G.pl[0].human=true;for(let i=1;i<4;i++)G.pl[i].human=false;
  let steps=0,dec=0,fol=0,cursed=0;
  while(!G.winner&&steps<6000){steps++;const s=sideToAct();if(s<0)break;let m=null;
   if(s===0){dec++;const vm=validMoves(0);UI.coachKey=null;const co=coach(0);
    if(rand(1000)<FOLLOW*1000&&co.rec){m=co.rec;fol++}
    else{const cards=[...new Set(vm.filter(x=>x.card!=null&&x.act!=='sell').map(x=>x.card))];const glow=[];for(const id of cards){const ms=bfMoves(0,id);if(ms.length)glow.push(ms)}
     const btn=vm.filter(x=>x.card==null&&x.act!=='sell');
     const pool=glow.length+btn.length;const k=rand(Math.max(1,pool));
     if(k<glow.length){const ms=glow[k];m=ms[rand(ms.length)].m}else m=btn[k-glow.length]||vm[0]}}
   else m=aiMove(s);
   if(!m)break;const r=performMove(m,s);if(!r.success){const vm=validMoves(s);if(!vm.length)break;performMove(vm[vm.length-1],s)}}
  out.push({w:G.winner,co:G.cowin,turn:G.turn,lv:G.pl.map(p=>p.lvl),dec,fol,cur:G.pl[0].st.cursed,deaths:G.pl[0].st.deaths,kills:G.pl[0].st.kills,lvs:G.pl.map(p=>p.lv).join('')})}
 return JSON.stringify(out)})(${N},${FOLLOW},'${LVL}')`);
const o=JSON.parse(res);let win=0,lv=0,t=0,d=0;for(const g of o){if(g.w==='P1'||g.co===0)win++;lv+=g.lv[0];t+=g.turn;d+=g.dec}
console.log(o.slice(0,8).map(g=>`${g.w} t${g.turn} lv${g.lv.join(',')} dec${g.dec} cursed${g.cur} deaths${g.deaths} kills${g.kills} ${g.lvs}`).join('\n'));
console.log(`games ${o.length} newcomer wins ${win} (${Math.round(100*win/o.length)}%) avg lv ${(lv/o.length).toFixed(1)} avg turns ${(t/o.length).toFixed(0)} avg decisions ${(d/o.length).toFixed(0)}`);
process.exit(0)},1500);
