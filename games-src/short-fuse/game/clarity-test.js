// Clarity checks from the blind playtests (jsdom, the real built page). Each was a real bug or a "what just happened?" moment.
// node clarity-test.js [games]
//  1. Job 1: the computers may use the Twin Probe (the rules give every crew card one), so the human must be offered it too.
//  2. The Suggested move never silently disappears on the human's turn when the helper has a suggestion.
//  3. Every crewmate turn since the human's last move is shown as one line in the recap ("while you waited").
//  4. The goal and the race (wires cut / total, fuse left) are on screen on every human turn.
const {JSDOM,VirtualConsole}=require('../../node_modules/jsdom');const fs=require('fs');
const html=fs.readFileSync(__dirname+'/shortfuse.html','utf8');
const games=+process.argv[2]||12;let fail=0,checks=0;const why=[];
function bad(t){fail++;if(why.length<12)why.push(t)}
function one(seed,phone){const errs=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errs.push(String(e.message).slice(0,200)));vc.on('error',(...a)=>errs.push(a.map(x=>x&&x.stack||x).join(' ').slice(0,300)));vc.on('warn',()=>{});
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://gns.test/'+(phone?'?phone=1':'?phone=0'),virtualConsole:vc});const w=dom.window;
  return new Promise(res=>{w.addEventListener('load',()=>{try{
    w.eval(`AIDELAY=0;ANIM=0;setSeed(${seed});setAiSeed(${seed});clearTimeout(UI.aiT);startJob(Object.assign(defaultSetup(),{job:1,np:3,seats:['human','ai','ai'],lv:'normal',help:true}));UI.brief=null;clearTimeout(UI.aiT);UI.aiT=null;refresh();clearTimeout(UI.aiT);UI.aiT=null`);
    let probeSeen=0,probeAI=0,guard=0;
    while(!w.eval('G.over')&&guard++<400){
      const me=w.eval('humans()[0]'),s=w.eval('sideToAct()');
      if(s===me){w.eval('UI.brief=null;refresh();clearTimeout(UI.aiT);UI.aiT=null');
        const r=JSON.parse(w.eval(`JSON.stringify((()=>{const V=UI.V;const L=V.legal;const W=L?wwk(V):null;
          const dock=document.getElementById('main').innerHTML+document.getElementById('tip').innerHTML+(document.getElementById('ps')?document.getElementById('ps').innerHTML:'');
          return {q:!!V.q,dd:!!(L&&L.tools&&L.tools.dd),probeBtn:/Twin Probe/.test(dock),sugg:!!(W&&W.suggestion),tip:${phone?"/data-a=\"sugg\"/.test(dock)":"document.getElementById('tip').innerHTML.length>0"},
            race:[...document.querySelectorAll('.goal')].some(e=>/cut/.test(e.textContent)&&/fuse|miss/i.test(e.textContent)),recap:UI.recapN||0,recapHTML:(document.querySelector('.recap')||{}).textContent||''}})())`));
        if(!r.q){checks++;if(r.dd&&!r.probeBtn)bad(`seed ${seed}${phone?' phone':''}: Twin Probe legal but not offered to the human`);if(r.dd&&r.probeBtn)probeSeen++;
          if(r.sugg&&!r.tip)bad(`seed ${seed}${phone?' phone':''}: suggestion exists but is not shown`);
          if(!r.race)bad(`seed ${seed}${phone?' phone':''}: no wires-cut race on screen`);
          const others=w.eval(`(()=>{const me=humans()[0];const last=UI.myLastTurn==null?-1:UI.myLastTurn;return [...new Set(G.log.filter(l=>l.turn>last&&l.turn<G.turn&&l.c!=='turn').map(l=>l.turn))].length})()`);
          if(others>0&&!r.recapHTML)bad(`seed ${seed}${phone?' phone':''}: ${others} crewmate turns since my last move, no recap shown`)}
        const st=w.eval('JSON.stringify(aiMove(humans()[0]))');const m=JSON.parse(st);w.eval(`act(${st},humans()[0]);clearTimeout(UI.aiT);UI.aiT=null`);continue}
      const st=w.eval('JSON.stringify(aiStep())');if(st==='null'){bad('seed '+seed+': stall');break}const o=JSON.parse(st);if(o.m.tool)probeAI++;w.eval(`applyMove(${JSON.stringify(o.m)},${o.seat});clearTimeout(UI.aiT);UI.aiT=null`)}
    errs.forEach(e=>bad('seed '+seed+' page error '+e));res({probeSeen,probeAI});w.close()}catch(e){bad('seed '+seed+' '+e.stack.slice(0,300));res({});w.close()}})})}
(async()=>{let ps=0,pa=0;for(let i=0;i<games;i++){const r=await one(500+i,i%2===1);ps+=r.probeSeen||0;pa+=r.probeAI||0}
  console.log(`clarity-test: ${games} games, ${checks} human turns checked, probe offered on ${ps} turns, AI used it ${pa}×`);why.forEach(x=>console.log('FAIL '+x));console.log(fail?`FAILED ${fail}`:'PASS');process.exit(fail?1:0)})();
