// Story campaign test (jsdom, the built page): every chapter starts from the map with its own setup, twist and goal;
// the computer plays chapter 1 to a win, which the campaign records as beaten; a missed checkpoint loses.
// node campaign-test.js
const {JSDOM}=require('jsdom');const fs=require('fs');const html=fs.readFileSync(__dirname+'/shipwreck.html','utf8');
const CAMP=JSON.parse(fs.readFileSync(__dirname+'/campaign.json','utf8'));
let pass=0,fail=0;const ok=(name,c,info)=>{if(c)pass++;else{fail++;console.log('FAIL',name,info===undefined?'':JSON.stringify(info))}};
function page(){return new Promise(res=>{const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/'});const w=dom.window;
  const errs=[];w.addEventListener('error',e=>errs.push(e.message));w.console.error=(...a)=>errs.push(a.join(' '));
  w.addEventListener('load',()=>{w.eval('AIDELAY=0;setSeed(11);try{localStorage.clear()}catch(e){}');res({w,errs})})})}
const click=(w,el)=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
// press the last button of the campaign overlay until the chapter's game has started
const tick=()=>new Promise(z=>setTimeout(z,30));
async function enter(w,id){w.eval(`GXC.play(${JSON.stringify(id)})`);for(let k=0;k<40&&!w.eval(`!!(G&&G.cmp&&G.cmp.id===${JSON.stringify(id)})`);k++){await tick();const b=[...w.document.querySelectorAll('.gxc:not([hidden]) button')].pop();if(b)click(w,b)}}
(async()=>{
  const {w,errs}=await page();
  ok('validate campaign.json',w.eval('GXC.validate(window.CAMPAIGN).length')===0,w.eval('GXC.validate(window.CAMPAIGN)'));
  ok('Story button on the title',!!w.document.querySelector('[data-a=story]'));
  // every chapter starts with its setup, twist and goal (open them all first)
  w.eval(`(()=>{const p={v:1,ch:{},unlocked:[],last:null};for(const c of window.CAMPAIGN.chapters)p.ch[c.id]={beaten:true,stars:1,best:null,tries:1,losses:0,easy:false};localStorage.setItem('gns-campaign-shipwreck',JSON.stringify(p))})()`);
  w.eval('campInit()');
  for(const c of CAMP.chapters){await enter(w,c.id);const g=JSON.parse(w.eval('JSON.stringify({id:G.cmp&&G.cmp.id,scen:G.scen,n:G.chars.filter(c=>!c.npc).length,diff:G.diff,items:G.items.length,dog:!!G.dog,fri:!!G.fri,morale:G.morale,ada:G.sc.ada,thr:G.ev.threat[0],act:GXC.active()&&GXC.active().id})'));
    const s=c.setup;ok(c.id+' starts',g.id===c.id&&g.act===c.id,g);ok(c.id+' setup',g.scen===s.scen&&g.n===s.chars.length&&g.diff===s.diff&&g.items===s.items&&g.dog===!!s.dog&&g.fri===!!s.friday,{g,s});
    if(c.twist&&c.twist.id==='low-morale')ok(c.id+' twist low-morale',g.morale===-c.twist.param,g);
    if(c.twist&&c.twist.id==='ada-adrift')ok(c.id+' twist ada-adrift',g.ada===c.twist.param,g);
    if(c.twist&&c.twist.id==='early-threat')ok(c.id+' twist early-threat',!!g.thr,g);
    w.eval('GXC.close()')}
  ok('no page errors (start all)',errs.length===0,errs.slice(0,3));
  // the computer plays chapter 1 to the end; a win must mark it beaten
  const r=await page();const W=r.w;W.eval('campInit()');await enter(W,'c1');
  W.eval(`(()=>{for(let n=0;n<600&&!G.over;n++){if(G.q){answer(0);continue}if(planOpen()){aiPlan();if(startActions())break;continue}run()}})()`);
  const over=JSON.parse(W.eval('JSON.stringify(G.over)'));
  W.eval('UI.shown=UI.beats.length;render()');await new Promise(z=>setTimeout(z,700));
  const st=JSON.parse(W.eval('JSON.stringify(GXC.progress().ch.c1||{})'));
  ok('c1 AI game ends',!!over,over);ok('c1 win marks the chapter beaten',!!(over&&over.win)===!!st.beaten&&(!over||!over.win||st.stars>=1),{over,st});
  ok('c1 result screen shows',!!W.document.querySelector('.gxc:not([hidden])'));
  // a missed checkpoint deadline loses: chapter 2 needs the Shelter by day 5
  const r2=await page();const V=r2.w;V.eval('campInit()');V.eval(`(()=>{const p={v:1,ch:{c1:{beaten:true,stars:1,best:null,tries:1,losses:0,easy:false}},unlocked:[],last:null};localStorage.setItem('gns-campaign-shipwreck',JSON.stringify(p));campInit()})()`);await enter(V,'c2');
  const lost=JSON.parse(V.eval(`(()=>{G.round=5;G.camp.shelter=false;G.stk=[];push({f:'fn',k:'endRound'});run();return JSON.stringify(G.over)})()`));
  ok('c2 missed deadline loses',!!lost&&lost.win===false,lost);
  const won=JSON.parse(V.eval(`(()=>{G.over=null;G.round=3;G.camp.shelter=true;G.stk=[];push({f:'fn',k:'endRound'});run();return JSON.stringify(G.over)})()`));
  ok('c2 shelter built wins',!!won&&won.win===true,won);
  ok('no page errors',r.errs.length===0&&r2.errs.length===0,r.errs.concat(r2.errs).slice(0,3));
  console.log(`campaign tests: ${pass} pass, ${fail} fail`);process.exit(fail?1:0)})();
