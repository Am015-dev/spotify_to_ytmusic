// clarity checks for the older phone panel (?bf=0) (jsdom, ?phone=1): node clarity-test.js [games]
// Each check is one thing a blind playtester could not follow:
//  best   the "★ best" rack is never worse right now (fill points minus its own broken tiles) than another rack
//  sun    a rack's breakage number never hides the Sun token; the token's -1 is shown on its own
//  why    the take pop-up always says why the starred rack is best, in one non-empty line
//  adv    every suggestion has a reason
//  sum    the round card explains every point: one line per tile set, and the breakage, summing to the score change
//  goal   the strip always says how the game is won and when it ends
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(__dirname+'/sunglaze.html','utf8');
const N=+process.argv[2]||6;const fails={};const seen={};let bad=0;
const fail=(k,msg)=>{fails[k]=(fails[k]||0)+1;if(fails[k]<=3)console.log('FAIL',k,msg);bad++};const ok=k=>seen[k]=(seen[k]||0)+1;
function run(seed){return new Promise(res=>{const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/?phone=1&bf=0'});const w=dom.window,d=w.document;
  w.addEventListener('load',()=>{const E=s=>w.eval(s);E(`AIDELAY=0;ANIM=0;setSeed(${seed});try{localStorage.clear()}catch(e){}`);
    d.querySelector('[data-ui=start]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));const st=d.querySelector('[data-ui=story-ok]');if(st)st.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
    let guard=0;
    const step=()=>{try{if(guard++>4000){fail('stall','seed '+seed);w.close();return res()}
      const G=E('G');if(!G||G.over){w.close();return res()}
      if(E('PHN.sum')){const S=E('PHN.sum');E('phRender()');const card=d.querySelector('#ph-card');const f=E('focusSeat()');
        const lines=[...card.querySelectorAll('.ph-pts')];const mine=S.walls.filter(x=>x.p===f);const rs=S.rs[f];
        const sumPts=lines.reduce((a,e)=>a+(+e.dataset.pts||0),0);
        if(lines.length<mine.length+(rs.floor?1:0))fail('sum',`seed ${seed} round ${S.round}: ${lines.length} explained lines for ${mine.length} tiles${rs.floor?' + breakage':''}`);
        else if(lines.some(e=>{const t=e.textContent;if(!/^Row/.test(t))return false;const p=+e.dataset.pts;if(/alone/.test(t))return p!==1;const n=(t.match(/(\d+) (across|down)/g)||[]).map(x=>parseInt(x));return n.reduce((a,b)=>a+b,0)!==p}))fail('sum',`seed ${seed} round ${S.round}: a reason does not add up: `+lines.map(e=>e.textContent).join(' | '))
        else if(sumPts!==rs.place+rs.floor)fail('sum',`seed ${seed} round ${S.round}: lines add to ${sumPts}, change was ${rs.place+rs.floor}`);else ok('sum');
        E('PHN.sum=null;upd()');return setTimeout(step,0)}
      const s=E('sideToAct()');const hp=E('me()');
      if(!hp){if(s>=0){E(`go(aiMove(${s}))`)}return setTimeout(step,0)}
      E('PHN.seen.p1=1;phRender()');const goal=d.querySelector('#ph-st .ph-goal');if(!goal||!/row/i.test(goal.textContent)||!/win/i.test(goal.textContent))fail('goal','no goal line');else ok('goal');
      const a=E(`JSON.stringify(adviceFor(${hp.i}))`);const A=JSON.parse(a);if(!A||!A.why||!A.why.trim())fail('adv','empty advice '+a);else ok('adv');
      if(G.phase==='offer'){const ms=E(`JSON.stringify(validMoves(${hp.i}))`);const M=JSON.parse(ms);const m0=M[Math.floor(Math.random()*M.length)];
        E(`pickSel(${JSON.stringify({src:m0.src,c:m0.c,j:m0.j})})`);E('phRender()');const pop=d.querySelector('#ph-pop');
        const opts=JSON.parse(E(`JSON.stringify(movesFor(UI.sel).map(m=>{const pv=preview(m,${hp.i});const f0=P(${hp.i}).floor.length;const sp=pv.info.sun?floorPenalty(f0+1)-floorPenalty(f0):0;return {line:m.line,net:(pv.full&&pv.pts!=null?pv.pts:0)+(pv.pen-sp),sun:!!pv.info.sun,pen:pv.pen,sp}}))`));
        const rec=pop.querySelector('.ph-o.rec');
        if(opts.length>1){if(!rec)fail('best','no starred rack');else{const ln=JSON.parse(rec.dataset.mv).line;const me_=opts.find(o=>o.line===ln);const top=Math.max(...opts.map(o=>o.net));
            if(me_.net<top)fail('best',`seed ${seed} R${G.round}: starred line ${ln} nets ${me_.net}, another nets ${top}`);else ok('best')}
          const why=pop.querySelector('.ph-why');if(!why||!why.textContent.trim())fail('why','no reason line for the star');else ok('why')}
        for(const o of opts){if(!o.sun)continue;const b=[...pop.querySelectorAll('.ph-o[data-mv]')].find(e=>JSON.parse(e.dataset.mv).line===o.line);const shown=(b.querySelector('.ph-v').textContent.match(/[−-]\d+/g)||[]).map(x=>-Math.abs(+x.replace('−','-')));
          const tilePen=o.pen-o.sp;const sh=shown.reduce((x,y)=>x+y,0);
          if(sh!==tilePen)fail('sun',`seed ${seed}: rack ${o.line} shows ${sh}, its own tiles cost ${tilePen}`);else ok('sun')}
        if(opts.some(o=>o.sun)){const sun=pop.querySelector('.ph-sun');if(!sun||!/☀/.test(sun.textContent)||!/−\d/.test(sun.textContent))fail('sun','Sun token cost not shown on its own');else ok('sun')}
        E('UI.sel=null;UI.tgt=null;PHN.src=null')}
      const m=E(`JSON.stringify(aiMove(${hp.i}))`);E(`go(${m})`);setTimeout(step,0)}catch(e){fail('crash',String(e.stack||e).slice(0,300));w.close();res()}};
    setTimeout(step,0)})})}
(async()=>{for(let g=0;g<N;g++)await run(500+g);console.log('checked',JSON.stringify(seen));console.log('fails',JSON.stringify(fails));console.log(bad?'FAILED '+bad:'ALL PASS')})();
