// Random clicker (jsdom): humans play ONLY through the page's buttons, tiles, cards and pop-ups.
// node click.js [from] [to] [seeds]  -> one line per game, then TOTAL errors / hidden-hand violations
const {JSDOM,VirtualConsole}=require('../../node_modules/jsdom');const fs=require('fs');
const html=fs.readFileSync(__dirname+'/hollowbough.html','utf8');
const CONF=[
 {name:'guided',start:'guided'},
 {name:'vs 2p normal',start:'vs',np:2},
 {name:'vs 3p easy',start:'vs',np:3,level:'easy'},
 {name:'vs 4p hard',start:'vs',np:4,level:'hard'},
 {name:'solo grumpy',start:'solo',solo:1},
 {name:'solo ghastly',start:'solo',solo:3},
 {name:'hot 2p',start:'hot',np:2},
 {name:'hot 4p',start:'hot',np:4},
 {name:'watch 3p',start:'ai',np:3},
 {name:'watch 4p hard',start:'ai',np:4,level:'hard'},
 {name:'PHONE guided',start:'guided',phone:1},
 {name:'PHONE vs 3p',start:'vs',np:3,phone:1},
 {name:'PHONE hot 3p',start:'hot',np:3,phone:1},
 {name:'PHONE solo gruff',start:'solo',solo:2,phone:1},
 {name:'PHONE vs 2p landscape',start:'vs',np:2,phone:1,land:1}];
function run(cf,seed){return new Promise(res=>{const errs=[];const vc=new VirtualConsole();vc.on('jsdomError',e=>errs.push('JSDOM '+String(e.message).slice(0,200)+(e.detail?String(e.detail.stack||e.detail).slice(0,300):'')));vc.on('error',e=>errs.push('console.error '+String(e).slice(0,200)));
  const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'https://gns.test/'+(cf.phone?'?phone=1':''),virtualConsole:vc,beforeParse(win){if(cf.phone){Object.defineProperty(win,'innerWidth',{value:cf.land?844:390,configurable:true});Object.defineProperty(win,'innerHeight',{value:cf.land?390:844,configurable:true})}}});
  const w=dom.window,d=w.document;
  const click=el=>el.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));let s0=seed*7919+13;const R=()=>{s0=(s0*16807)%2147483647;return (s0-1)/2147483646};const rnd=a=>a[Math.floor(R()*a.length)];
  const seen=new Set();let hidden=0,clicks=0,steps=0,stall=0,last='',replayed=0;const t0=Date.now();let iv;
  const fin=r=>{clearInterval(iv);res(Object.assign({cf,errs,seen,clicks,hidden,secs:Math.round((Date.now()-t0)/1000)},r||{}));try{w.close()}catch(e){}};
  w.addEventListener('load',()=>{try{w.eval(`AIDELAY=0;ANIM=0;UI.seed=${seed};UI.noRec=${R()<.7?'true':'false'}`);
    const o=(k,v)=>{const b=d.querySelector(`[data-a=opt][data-k=${k}][data-v="${v}"]`);if(b)click(b)};
    if(cf.np)o('np',cf.np);if(cf.level)o('level',cf.level);if(cf.solo)o('solo',cf.solo);
    click(d.querySelector(`[data-start=${cf.start}]`));if(!w.eval('UI.started'))errs.push('start click failed');
    if(cf.phone&&!d.documentElement.classList.contains('ph'))errs.push('phone class missing');
    iv=setInterval(()=>{try{const G=w.eval('G');if(!G)return;steps++;
      const v=w.eval('viewSeat()'),hot=w.eval('hotSeat()'),holder=w.eval('UI.holder');
      for(const el of d.querySelectorAll('[data-owner][data-up="1"]')){const own=+el.getAttribute('data-owner');if(own!==v||(hot&&own!==holder)){hidden++;if(errs.length<6)errs.push('HIDDEN hand '+own+' face up for viewer '+v)}}
      if(hot&&holder<0&&d.querySelector('#handRow [data-up="1"]')){hidden++;errs.push('hand shown with no holder')}
      const act=G.phase==='over'?-1:w.eval('HB.actor(G)');
      if(G.phase==='over'){const c=d.querySelector('#pc:not([hidden]) [data-a]');if(c&&/cont/.test(c.dataset.a)&&R()<.9){click(d.querySelector('#pc [data-a=cont]'));seen.add('over-cont');return}
        const ag=d.querySelector('#pc [data-a=again]');if(ag){seen.add('over-card');if(!replayed&&R()<.25){replayed=1;click(ag);seen.add('again');if(w.eval('G.phase')==='over')errs.push('again did not start');return}}
        if(d.querySelector('#pc:not([hidden]) [data-card^=over]')||ag||steps>5){const ov=w.eval('G.over');if(!ov)errs.push('over without result');return fin({over:w.eval('({w:G.over.winner,s:G.over.scores.map(x=>x.total),grim:G.over.grim&&G.over.grim.total})'),turns:G.turn})}return}
      const inv=w.eval('HB.checkInvariants(G)');if(inv.length&&errs.length<5)errs.push('INV '+inv[0]);
      const q=s=>[...d.querySelectorAll(s)].filter(b=>!b.disabled&&!b.closest('[hidden]'));
      const pcb=q('#pc [data-a=take],#pc [data-a=cont]');if(pcb.length){click(pcb[0]);seen.add('card:'+(d.querySelector('#pc').dataset.card));clicks++;return}
      if(act>=0&&G.players[act].ai){stall+=0;}
      else if(act>=0){
        const qs=q('#pc [data-a=q]');if(qs.length){seen.add('q:'+G.q.kind);click(rnd(qs));clicks++;return}
        const pop=!d.querySelector('#ppop').hidden;const r=R();
        if(pop){const dd=q('#ppop [data-a=do]');if(dd.length&&r<.7){click(rnd(dd));clicks++;seen.add('do:'+d.querySelector('#ppop').dataset.pop);return}if(r<.85){click(d.querySelector('#ppop [data-a=popx]'));seen.add('popx');return}if(r<.9){d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));seen.add('esc');return}}
        if(r<.01){const t=rnd(q('.gx-bar [data-gx]'));if(t){click(t);seen.add('drawer:'+t.dataset.gx);const x=d.querySelector('.gx-drawer.on .gx-x');if(x)click(x)}return}
        if(r<.03){const c=q('#chips .chip');click(rnd(c));seen.add('chip');const x=d.querySelector('.gx-drawer.on .gx-x');if(x)click(x);return}
        const ok=q('.tile.ok,.mc.ok,#handRow .sc.ok,#cityRow .sc.ok');
        const pick=R();
        if(pick<.55&&ok.length){click(rnd(ok));clicks++;seen.add('tap-ok');return}
        if(pick<.62){const all=q('.tile,.mc:not(.empty),#handRow .sc,#cityRow .sc');if(all.length){click(rnd(all));seen.add('tap-any');return}}
        if(pick<.68){const h=q('#acts [data-a=hint]');if(h.length){click(h[0]);seen.add('hint');return}}
        const pr=q('#acts [data-a=prep]');if(pr.length&&(R()<.7)){click(pr[0]);seen.add('prep');clicks++;return}
        const ps=q('#acts [data-a=pass]');if(ps.length&&R()<.1){click(ps[0]);seen.add('pass');clicks++;return}
        if(ok.length){click(rnd(ok));clicks++;return}
      }
      const sig=JSON.stringify([G.logN,G.turn,!!G.q,w.eval('UI.cards.length'),w.eval('UI.holder'),!d.querySelector('#ppop').hidden]);if(sig===last)stall++;else{stall=0;last=sig}
      if(stall>4000||Date.now()-t0>240000){errs.push('STALL turn '+G.turn+' actor '+act+' q='+(G.q&&G.q.kind)+' cards='+w.eval('UI.cards.length')+' pop='+w.eval('JSON.stringify(UI.pop)'));fin({over:false})}
    }catch(e){errs.push('LOOP '+String(e.stack||e).slice(0,500));fin({})}},1)}catch(e){errs.push('BOOT '+e.stack);fin({})}});})}
(async()=>{const a=+(process.argv[2]||0),b=+(process.argv[3]||CONF.length-1),NS=+(process.argv[4]||1);const all=new Set();let bad=0,n=0,hid=0;const T=Date.now();
  for(let i=a;i<=b&&i<CONF.length;i++)for(let sd=0;sd<NS;sd++){const cf=CONF[i];const r=await run(cf,100+i+sd*1000);n++;r.seen.forEach(x=>all.add(x));bad+=r.errs.length;hid+=r.hidden||0;
    console.log(`[${i}.${sd}] ${cf.name}: ${r.over?JSON.stringify(r.over):'not over'} turns ${r.turns} clicks ${r.clicks} ${r.secs}s hidden ${r.hidden} errors ${r.errs.length} ${JSON.stringify(r.errs.slice(0,3))}`)}
  console.log('TOTAL games',n,'errors',bad,'hidden-hand violations',hid,'time',Math.round((Date.now()-T)/1000)+'s');console.log('seen:',[...all].sort().join(' | '))})();
