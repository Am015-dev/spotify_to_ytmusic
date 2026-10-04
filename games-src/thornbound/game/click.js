// Random clicker (jsdom): humans play ONLY through the page's buttons, hand cards, board taps and pop-ups. node click.js [from] [to] [seeds]
const {JSDOM,VirtualConsole}=(()=>{try{return require('../../node_modules/jsdom')}catch(e){return require('jsdom')}})();const fs=require('fs');
const html=fs.readFileSync(__dirname+'/thornbound.html','utf8');
const CONF=[
 {name:'guided 2p',guided:1},
 {name:'me 3p',mode:'me',np:3},
 {name:'me 4p anim',mode:'me',np:4,anim:1,length:'short'},
 {name:'hot 2p',mode:'hot',np:2},
 {name:'hot 3p',mode:'hot',np:3,length:'short'},
 {name:'watch 4p',mode:'ai',np:4},
 {name:'PHONE me 3p',mode:'me',np:3,phone:1},
 {name:'PHONE hot 3p',mode:'hot',np:3,phone:1,length:'short'},
 {name:'PHONE guided',guided:1,phone:1},
 {name:'me 2p extended hard',mode:'me',np:2,length:'extended',levels:['hard','hard']}];
function run(cf,seed){return new Promise(res=>{const errs=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>!/getContext/.test(e.message)&&errs.push('JSDOM '+String(e.message).slice(0,200)+(e.detail?String(e.detail.stack||e.detail).slice(0,300):'')));vc.on('error',(...a)=>errs.push('ERR '+a.map(x=>x&&x.stack||x).join(' ').slice(0,400)));vc.on('warn',()=>{});
 const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://gns.test/'+(cf.phone?'?phone=1':''),virtualConsole:vc,beforeParse(win){if(cf.phone){Object.defineProperty(win,'innerWidth',{value:390,configurable:true});Object.defineProperty(win,'innerHeight',{value:844,configurable:true})}}});const w=dom.window,d=w.document;
 const click=el=>el&&el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));let s=seed*7919+13;const R=()=>{s=(s*16807)%2147483647;return (s-1)/2147483646};const rnd=a=>a[Math.floor(R()*a.length)];
 const seen=new Set();let hidden=0,clicks=0,steps=0,stall=0,last='';const t0=Date.now();
 w.addEventListener('load',()=>{setTimeout(()=>{try{
  w.eval(`AIDELAY=0;ANIM=${cf.anim?1:0};UI.speed=40;setSeed(${seed})`);
  if(cf.guided){click(d.querySelector('#start [data-a=play]'));click(d.querySelector('#start [data-a=guided]'))}else w.eval(`newGame(${JSON.stringify(cf.mode)},${JSON.stringify({np:cf.np,seed,length:cf.length,levels:cf.levels})})`);
  if(!w.eval('UI.started'))errs.push('not started');
  if(cf.phone&&!d.documentElement.classList.contains('ph'))errs.push('phone mode not on');
  const iv=setInterval(()=>{try{steps++;const G=w.eval('G');
   const vsn=w.eval('vs()'),pass=w.eval('!!(UI.card&&UI.card.kind==="pass")');
   for(const el of d.querySelectorAll('[data-owner][data-up="1"]')){const o=+el.getAttribute('data-owner');if(pass||o!==vsn){hidden++;if(errs.length<6)errs.push('HIDDEN owner '+o+' viewer '+vsn+' pass '+pass+' '+(el.className||el.tagName))}}
   if(G.over&&!w.eval('!!(UI.card&&UI.card.kind==="over")')&&!w.eval('UI.card')){w.eval('pump()')}
   if(G.over&&w.eval('!!(UI.card&&UI.card.kind==="over")')){clearInterval(iv);if(!d.querySelector('#pc [data-a=again]'))errs.push('no end card');res({cf,over:G.over,errs,hidden,clicks,round:G.round,secs:Math.round((Date.now()-t0)/1000),seen});w.close();return}
   const card=d.querySelector('#pc:not([hidden]) .btn');
   if(w.eval('UI.card')){const b=d.querySelector('#pc [data-a=take],#pc [data-a=evok],#pc [data-a=tipok],#news [data-a=newsok]');if(b){click(b);seen.add('card:'+b.dataset.a);clicks++;return}}
   if(R()<.02){const t=rnd([...d.querySelectorAll('.gx-bar [data-gx]')]);click(t);seen.add('drawer:'+t.dataset.gx);const x=d.querySelector('.gx-drawer.on .gx-x');if(x)click(x);return}
   if(R()<.03){const rv=rnd([...d.querySelectorAll('#rivals [data-a=rival]')]);if(rv){click(rv);seen.add('rival');click(d.querySelector('#ppop [data-a=pclose]'));return}}
   if(R()<.03){const loc=d.querySelector('.tb-loc[data-id="'+rnd(['castle','wilderness','harvest_field','battlefield','shrine','necropolis','throne'])+'"]');if(loc){click(loc);seen.add('loctap');if(!w.eval('UI.pop'))errs.push('loc tap no popup');else if(R()<.5)click(d.querySelector('#ppop [data-a=pclose]'));return}}
   const co=d.querySelector('#act [data-a=coachok]');if(co){click(co);seen.add('coach');clicks++;return}
   if(R()<.03){const gl=d.querySelector('#main [data-a=gloss]');if(gl){click(gl);seen.add('gloss');if(d.querySelector('#gdef').hidden)errs.push('gloss chip opened nothing');click(d.querySelector('#gdef [data-a=gclose]'));return}}
   if(w.eval('G.q')&&w.eval('viewSeatForQ()')!=null){const k=G.q.kind;
    if(['bid','place','tie'].includes(k)&&R()<.7){const hc=[...d.querySelectorAll('#handw .hc')];if(hc.length){click(rnd(hc));seen.add('hand');const mv=[...d.querySelectorAll('#ppop [data-a=mv]')];if(mv.length){click(rnd(mv));clicks++;seen.add('hand-act:'+k)}return}}
    if(k==='herald'){const lb=rnd([...d.querySelectorAll('#main [data-a=loc]')]);if(lb){click(lb);const pm=d.querySelector('#ppop [data-a=mv]');if(!pm)errs.push('herald popup has no Place button');else{click(pm);clicks++;seen.add('herald-popup')}return}}
    const b=[...d.querySelectorAll('#main [data-a=mv],#act [data-a=mv]')].filter(x=>!x.disabled);
    if(b.length){const pri=b.filter(x=>x.classList.contains('pri'));click(R()<.5&&pri.length?pri[0]:rnd(b));clicks++;seen.add('mv:'+k);return}}
   const sig=JSON.stringify([G.logN,G.q&&G.q.kind,w.eval('!!UI.card')]);if(sig===last)stall++;else{stall=0;last=sig}
   const inv=w.eval('TB.invariants(G)');if(inv.length&&errs.length<5)errs.push('INV '+inv[0]);
   if(stall>400||Date.now()-t0>240000){errs.push('STALL q='+(G.q&&G.q.kind)+' pass='+pass+' main='+d.querySelector('#main').textContent.slice(0,120));clearInterval(iv);res({cf,errs,hidden,clicks,seen,round:G.round});w.close()}
  }catch(e){errs.push('LOOP '+String(e.stack||e).slice(0,400));clearInterval(iv);res({cf,errs,hidden,clicks,seen});w.close()}},2);
 }catch(e){errs.push('BOOT '+e.stack);res({cf,errs,hidden:0,clicks:0,seen})}},300)})})}
(async()=>{const a=+(process.argv[2]||0),b=+(process.argv[3]||CONF.length-1),NS=+(process.argv[4]||1);const all=new Set();let bad=0,hid=0,n=0;const T=Date.now();
 for(let i=a;i<=b&&i<CONF.length;i++)for(let sd=0;sd<NS;sd++){const cf=CONF[i];const r=await run(cf,100+i+sd*1000);n++;r.seen.forEach(x=>all.add(x));bad+=r.errs.length;hid+=r.hidden||0;
  console.log(`[${i}.${sd}] ${cf.name}: ${r.over?'winner '+r.over.winner:'not over'} round ${r.round} clicks ${r.clicks} ${r.secs}s hidden ${r.hidden} errors ${r.errs.length} ${JSON.stringify(r.errs.slice(0,2))}`)}
 console.log('TOTAL games',n,'errors',bad,'hidden-info violations',hid,'time',Math.round((Date.now()-T)/1000)+'s');console.log('seen:',[...all].sort().join(' | '));process.exit(0)})();
