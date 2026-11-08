// advisor quality: seeded games where the human follows 💡 Suggest every day. Counts
//  - near-death castaways left without rest, illegal plans after Suggest,
//  - "Do it" / "Move here" that leave an illegal plan or change the plan while reporting failure,
//  - red priorities still open (and fixable) after Suggest.
// node adv-test.js [N=20] [scen=marooned]
const fs=require('fs'),vm=require('vm');
const files=['data-gen.js','data.js','cards-ev.js','cards-adv.js','text.js','engine.js','phases.js','scen.js','moves.js','ai.js'];
// node adv-test.js 30 learn: the Learn to play setup (tutorial deal, easy), seed varied per game
const ui=fs.readFileSync(__dirname+'/ui.js','utf8');const grab=n=>{const i=ui.indexOf('function '+n+'(');let d=0,j=ui.indexOf('{',i);for(let k=j;k<ui.length;k++){if(ui[k]==='{')d++;if(ui[k]==='}'){d--;if(!d)return ui.slice(i,k+1)}}};
const src=files.map(f=>fs.readFileSync(__dirname+'/'+f,'utf8')).join('\n')+'\n'+(()=>{const t=fs.readFileSync(__dirname+'/tutor.js','utf8');const i=t.indexOf('function tutDeal(');let d=0;for(let k=t.indexOf('{',i);k<t.length;k++){if(t[k]==='{')d++;if(t[k]==='}'){d--;if(!d)return t.slice(i,k+1)}}})()+'\n'+grab('pawnLabel')+'\n'+grab('invNeedPlain')+'\n'+fs.readFileSync(__dirname+'/advisor.js','utf8')+'\n;function __prio(){clearPlan(G.chars.filter(c=>c.human).map(c=>c.i));return priorities().map(p=>(p.done?"[x]":"[ ]")+p.w+" "+p.title+(p.can?" CAN":"")+(p.move?" MOVE":"")+(p.cant?" cant:"+p.cant:"")).join("\\n   ")}\n;globalThis.__={get G(){return G},set G(v){G=v}};';
const N=+process.argv[2]||20,LEARN=process.argv[3]==='learn',scen=LEARN?'marooned':process.argv[3]||'marooned';
const tot={plans:0,nearNoRest:0,illegal:0,doitBad:0,doitDirty:0,moveBad:0,redOpen:0,doits:0,wins:0,rounds:0,errs:0};const why={},WC={};const ex=[];
for(let g=0;g<N;g++){const ctx={console,Math,JSON,Date,setTimeout:()=>0,clearTimeout(){},localStorage:{getItem(){return null},setItem(){},removeItem(){}},refresh(){},performance:{now:()=>Date.now()}};vm.createContext(ctx);
  if(process.env.TRACE)vm.runInContext('var ADVDBG=1',ctx);if(process.env.ADVK)vm.runInContext('var ADVKX='+process.env.ADVK,ctx);if(process.env.MINW)vm.runInContext('var ADVMINW='+process.env.MINW,ctx);vm.runInContext(src,ctx);if(process.env.POSTSRC)vm.runInContext(process.env.POSTSRC,ctx);const R=c=>vm.runInContext(c,ctx);
  try{if(LEARN)R(`UI.pause=true;setSeed(${7+g*13+(+process.env.SEEDOFF||0)});newGame({scen:'marooned',chars:['carpenter','cook'],humans:[true,true],mode:'solo',friday:true,dog:false,items:0,diff:'easy',noIntro:true,tutorial:true,...${process.env.LOPT||'{}'}});${process.env.LPOST||''}`);else R(`UI.pause=true;setSeed(${7+g*13+(+process.env.SEEDOFF||0)});newGame({scen:'${scen}',chars:${g%4===3?"['carpenter','cook','explorer']":"['carpenter','cook']"},humans:${g%2?"[true,true]":"[true,false]"},mode:'solo',friday:${g%4!==3}});`);
    let steps=0;while(!R('G.over')&&steps++<500){
      if(R('!!G.q')){R('answer(aiChoose(G.q.title,G.q.opts,G.chars[G.q.who],G.q)||0)');continue}
      if(R('planOpen()')){tot.plans++;
        // the computer teammates plan first (as in the page)
        R(`for(let t=0;t<6;t++){if(G.q){answer(aiChoose(G.q.title,G.q.opts,G.chars[G.q.who],G.q)||0);continue}if(!planOpen())break;const ai=G.chars.filter(c=>!c.human&&!c.dead&&!c.npc).map(c=>c.i).filter(i=>allPawns().some(p=>p.c===i&&!placedIds().has(p.id)));if(!ai.length)break;aiPlanBest(ai.concat(G.chars.filter(c=>c.npc).map(c=>c.i)))}`);if(!R('planOpen()'))continue;
        // every Do it / Move on an empty human plan must give a legal plan or leave the plan untouched
        const r=JSON.parse(R(`(()=>{const out={bad:0,dirty:0,mv:0,n:0,ex:[]};const hs=G.chars.filter(c=>c.human).map(c=>c.i);clearPlan(hs);const base=JSON.stringify(G.plan);const pr=priorities();
          for(let i=0;i<pr.length;i++){const p=pr[i];if(!p.act||p.done)continue;G.plan=JSON.parse(base);const pp=priorities()[i];if(!pp||!pp.act)continue;
            if(pp.can){out.n++;const e=doJob(pp.act.type,pp.act.tgt,pp.act.alt,pp.lead);if(e){out.bad++;out.ex.push('can but failed: '+pp.title+' / '+e)}else if(!planLegal()){out.bad++;out.ex.push('illegal after Do it: '+pp.title+' / '+planProblems()[0])}}
            else if(pp.move){const e=applyMove(pp);if(e||!planLegal()){out.mv++;out.ex.push('move: '+pp.title+' / '+(e||planProblems()[0]))}}
            else{const e=pp.act?doJob(pp.act.type,pp.act.tgt,pp.act.alt,pp.lead):null;if(e&&JSON.stringify(G.plan)!==base){out.dirty++;out.ex.push('failed Do it changed the plan: '+pp.title)}}}
          G.plan=JSON.parse(base);return JSON.stringify(out)})()`));
        tot.doitBad+=r.bad;tot.doitDirty+=r.dirty;tot.moveBad+=r.mv;tot.doits+=r.n;if(r.ex.length&&ex.length<12)ex.push(...r.ex.map(x=>'g'+g+' r'+R('G.round')+' '+x));
        R('suggestPlan()');if(process.env.TRACE==String(g)&&process.env.PRIO)console.log(R('__prio()')),R('suggestPlan()');if(process.env.TRACE==String(g)){console.log(R('UI.lookDbg||""'));console.log(R(`'R'+G.round+' w='+G.chars.map(c=>c.k[0]+c.w+'/'+CHARS[c.k].die+(c.det!=null?'d'+c.det:'')).join(',')+' food='+G.res.food+'/'+(G.res.pfood||0)+' wood='+G.res.wood+' fur='+G.res.fur+' roof='+G.camp.roof+' pal='+G.camp.pal+' wpn='+G.weapon+' shelter='+hasShelter()+' mor='+G.morale+' pile='+G.sc.pile+' fire='+has('fire')+' wx='+JSON.stringify(SCENARIOS[G.scen].wx[G.round])+'\\n  plan: '+G.plan.acts.map(a=>a.type+JSON.stringify(a.tgt)+'x'+a.pw.length).join(' | ')+'\\n  log: '+G.log.slice(0,25).reverse().map(l=>l.t).join(' / ')`))};
        const v=JSON.parse(R(`JSON.stringify({near:living().filter(c=>nearDeath(c)&&!restPlanned(c.i)&&!(c.only&&!c.only.includes('rest'))).map(c=>c.nm+' '+lifeLeft(c)),bad:planProblems().map(x=>x+' | only='+JSON.stringify(G.chars.map(c=>c.only))+' acts='+JSON.stringify(G.plan.acts.map(a=>[a.type,a.pw]))+' log='+G.log.slice(0,4).map(l=>l.t).join('/')),red:uncoveredRed().map(p=>p.title)})`));
        if(v.near.length){tot.nearNoRest++;if(ex.length<12)ex.push('g'+g+' r'+R('G.round')+' near death, no rest: '+v.near)}
        if(v.bad.length){tot.illegal++;if(ex.length<12)ex.push('g'+g+' r'+R('G.round')+' illegal: '+v.bad[0])}
        if(v.red.length){tot.redOpen++;if(ex.length<16)ex.push('g'+g+' r'+R('G.round')+' red open after Suggest: '+v.red)}
        const e=R('startActions()');if(e){tot.errs++;break}continue}
      if(!R('G.stk.length'))break;R('run()')}
    for(const l of JSON.parse(R('JSON.stringify(G.log)'))){const m=/takes (\d+) wounds? \(([^)]*)\)/.exec(l.t);if(m)WC[m[2]]=(WC[m[2]]||0)+(+m[1])}if(process.env.END)console.log('end g'+g+' '+R(`'r'+G.round+' pile='+G.sc.pile+' fire='+has('fire')+' fireTerrain='+!missingTerrain('fire')+' why='+(G.over&&G.over.why)`));const o=R('JSON.stringify(G.over)');const ov=o&&JSON.parse(o);if(ov&&ov.win)tot.wins++;tot.rounds+=R('G.round');why[ov?ov.why:'no end']=(why[ov?ov.why:'no end']||0)+1}
  catch(e){tot.errs++;console.log('ERR',g,e.stack.split('\n').slice(0,3).join(' | '))}}
console.log(`advisor test ${LEARN?'learn':scen} N=${N}: plans ${tot.plans} · near-death without rest ${tot.nearNoRest} · illegal after Suggest ${tot.illegal} · Do it tried ${tot.doits}, illegal ${tot.doitBad}, failed-but-changed ${tot.doitDirty}, bad moves ${tot.moveBad} · red open after Suggest ${tot.redOpen} · wins ${tot.wins} · avg round ${(tot.rounds/N).toFixed(1)} · errors ${tot.errs}`);
console.log(why);console.log(Object.entries(WC).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([k,v])=>k+':'+(v/N).toFixed(2)).join('  '));for(const x of ex)console.log(' ',x);
