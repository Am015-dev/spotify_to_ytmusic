// Real WebRTC test for Shipwreck Isle: host + N clients in separate Chromium contexts, local Nostr relay on port 17703.
// PW=$(npm root -g)/playwright node net/p2p-rc.js rc/shipwreck.html [clients] [seconds]
// env: CHARS=carpenter,cook,...  SCEN=marooned  LEAVE=s (client 1 closes its tab)  REJOIN=s (it comes back with the same uid)
//      BAD=1 (a client sends illegal/malformed actions)  W=1366 H=768 SHOTS=dir (lobby + client screenshots)  SEED
const {chromium}=require(process.env.PW);const fs=require('fs');const {spawn}=require('child_process');
const file=process.argv[2],NCL=+(process.argv[3]||1),SECS=+(process.argv[4]||900);const html=fs.readFileSync(file);
const W=+(process.env.W||1100),H=+(process.env.H||760),SHOTS=process.env.SHOTS||'';const PORT=17703;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const relay=spawn('node',[__dirname+'/relay.js',String(PORT)]);await sleep(500);
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const P=[];
async function page(i){const c=await b.newContext({viewport:{width:W,height:H}});
  await c.addInitScript(([port,i])=>{window.NETROOM_RELAYS=['ws://127.0.0.1:'+port];window.NETROOM_ICE=[];try{localStorage.setItem('swi_gfx','low');localStorage.setItem('swi_tut','done');localStorage.setItem('gns-uid','ptest'+i);localStorage.setItem('gns-name',i?'Friend'+i:'Hosty')}catch(e){}},[PORT,i]);
  await c.route('**/*',r=>{const u=r.request().url();if(u.startsWith('https://gns.test/'))return r.fulfill({body:html,contentType:'text/html; charset=utf-8'});return r.abort()});
  const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push(m.text())});
  await p.goto('https://gns.test/shipwreck/',{waitUntil:'domcontentloaded',timeout:120000});await sleep(1200);await p.evaluate(()=>{ANIM=0;AIDELAY=60});return {p,c,errs,i}}
for(let i=0;i<=NCL;i++)P.push(await page(i));
const [Hh,...C]=P;const shot=async(x,n)=>{if(SHOTS){fs.mkdirSync(SHOTS,{recursive:true});await x.p.screenshot({path:`${SHOTS}/${n}_${W}x${H}.png`,timeout:120000}).catch(e=>console.log("shot failed",n))}};
console.log('host',await Hh.p.evaluate(()=>({p2p:!!NET.p2p})));
// host: options, then Host through the start screen
await Hh.p.evaluate(([chars,scen])=>{UI.setup.chars=chars;UI.setup.scen=scen;UI.setup.friday=chars.length<=2;setQuick(true)},[(process.env.CHARS||(NCL>=2?'carpenter,cook,explorer,soldier':'carpenter,cook')).split(','),process.env.SCEN||'marooned']);
if(process.env.SEED)await Hh.p.evaluate(s=>setSeed(s),+process.env.SEED);
await Hh.p.evaluate(()=>{render();const d=document.getElementById('netdet');if(d)d.open=true;document.querySelector('[data-a=nethost]').click()});await sleep(400);
const code=await Hh.p.evaluate(()=>NET.code);console.log('code',code);
async function joinUI(x){await x.p.evaluate(code=>{const d=document.getElementById('netdet');if(d)d.open=true;const i=document.getElementById('joincode');i.value=code;i.dispatchEvent(new Event('input',{bubbles:true}));document.querySelector('[data-a=netjoin]').click()},code)}
for(const c of C)await joinUI(c);
let t0=Date.now();while(Date.now()-t0<40000){const n=await Hh.p.evaluate(()=>NET.peers.length);const ok=await Promise.all(C.map(c=>c.p.evaluate(()=>!!(NET.opts&&NET.peers.length>1))));if(n>=NCL+1&&ok.every(Boolean))break;await sleep(250)}
console.log('lobby after',Date.now()-t0,'ms',await Hh.p.evaluate(()=>NET.peers.map(p=>peerName(p))));
await shot(Hh,'lobby_host');if(C[0])await shot(C[0],'lobby_client');
await Hh.p.evaluate(()=>document.querySelector('[data-a=netstart]').click());
// the random clicker: only this page's own buttons
const tick=()=>{const rnd=a=>a[Math.floor(Math.random()*a.length)];const q=s=>[...document.querySelectorAll(s)].filter(b=>!b.disabled);
  if(!G||!G.net||G.over||NET.gone)return '';
  const sv=!document.getElementById('story').hidden&&storyActive();const ans=sv?q('#story [data-ans]'):[];if(ans.length){rnd(ans).click();return 'ans'}
  const nx=sv?q('#story [data-a=next]'):[];if(nx.length){const sk=q('#story [data-a=skip]');(sk.length&&Math.random()<.08?sk[0]:nx[0]).click();return 'next'}
  if(!planOpen())return '';const st=pstep();const left=netLeft(NET.lens);
  if(st<2){q('#step [data-a=pnext]')[0]&&q('#step [data-a=pnext]')[0].click();return 'wiz'}
  if(left>0){if(st!==2){const g=q('[data-pgo="2"]')[0];if(g){g.click();return 'wiz'}}
    const r=Math.random();if(r<.12){const s=q('#step [data-a=suggest]')[0];if(s){s.click();return 'suggest'}}
    if(r<.3){const d=q('#panel [data-do]');if(d.length){rnd(d).click();return 'do'}}
    if(r<.5){const pk=q('#panel [data-a=pick]')[0];if(pk&&!UI.ps.pick){pk.click();return 'wiz'}const c=q('#panel [data-cat]');if(c.length&&!UI.cat){rnd(c).click();return 'wiz'}const pl=q('#panel [data-place]');if(pl.length){rnd(pl).click();return 'place'}}
    const rec=q('#panel [data-a=rec]')[0];if(rec){rec.click();return 'rec'}const pl=q('#panel [data-place]');if(pl.length){rnd(pl).click();return 'place'}const s=q('#step [data-a=suggest]')[0];if(s){s.click();return 'suggest'}return ''}
  if(st<4){const n=q('#step [data-a=pnext]')[0];if(n){n.click();return 'wiz'}}
  const fin=q('#step [data-a=netready],#step [data-a=go]')[0];if(fin&&!fin.classList.contains('dim')){fin.click();return fin.dataset.a}
  // the lead waiting for others, or a job not placeable: sometimes ask for a full plan
  if(G.net.ready[NET.lens]!==G.round&&Math.random()<(fin?.25:.05)){const s=q('#step [data-a=suggest]')[0];if(s){s.click();return 'suggest'}}return ''};
const LEAVE=+(process.env.LEAVE||0),REJOIN=+(process.env.REJOIN||0),BAD=!!process.env.BAD;let left=null,rejoined=null,bad=null,midShot=false;
const counts={};let clicks=0,remote=0;t0=Date.now();let live=P.slice();let lastProg='',stallT=Date.now();
while(Date.now()-t0<SECS*1000){const el=(Date.now()-t0)/1000;
  if(LEAVE&&!left&&el>LEAVE&&C[0]){const seat=await C[0].p.evaluate(()=>NET.mySeat);await C[0].c.close();live=live.filter(x=>x!==C[0]);left={seat,at:Math.round(el)};console.log('client 1 closed its tab, seat',seat)}
  if(REJOIN&&left&&!rejoined&&el>REJOIN){const x=await page(1);P.push(x);await joinUI(x);live.push(x);rejoined={x,at:Math.round(el)};console.log('client 1 rejoins')}
  const g=await Hh.p.evaluate(()=>G&&{over:!!G.over,r:G.round,plan:planOpen(),ph:G.phase,q:G.q?G.q.who:null,sh:UI.shown,nb:UI.beats.length});if(!g)break;if(g.over)break;
  if(BAD&&!bad&&g.plan&&g.r>=2&&C[0]&&live.includes(C[0])){
    const logN0=await Hh.p.evaluate(()=>G.log.length);
    await Hh.p.evaluate(()=>{const o=window.netAct;window.__ACTLOG=[];window.netAct=function(m,seat){const b=JSON.stringify(G.res)+JSON.stringify(G.sc&&G.sc.pile);const r=o.apply(this,arguments);const a=JSON.stringify(G.res)+JSON.stringify(G.sc&&G.sc.pile);if(a!==b)__ACTLOG.push(JSON.stringify(m)+' seat '+seat+' : '+b+' -> '+a+' ret '+r);return r}});const before=await Hh.p.evaluate(()=>JSON.stringify([G.plan,G.res,G.chars.map(c=>[c.w,c.det,c.used]),G.items,G.own,G.round,G.phase,G.q]));
    const seat=await C[0].p.evaluate(()=>NET.mySeat);
    if(process.env.ONE)await C[0].p.evaluate(()=>window.__ONEFLAG=1);
    await C[0].p.evaluate(seat=>{window.__ONE=!!window.__ONEFLAG;const o=(seat+1)%G.chars.length;const e=m=>NET.room.emit('act',m);
      const L=[{t:'place',pid:'c'+o+'_0',type:'rest',tgt:null},{t:'rm',pid:'c'+o+'_0'},{t:'place',pid:'c'+seat+'_0',type:'build',tgt:{k:'__proto__'}},{t:'place',pid:'c'+seat+'_0',type:'gather',tgt:{pos:999,i:0}},
       {t:'place',pid:'c'+seat+'_0',type:'nope',tgt:1},{t:'place',pid:{x:1},type:'rest'},{t:'ans',i:99,q:G.logN},{t:'skill',ci:o,k:'thrifty'},{t:'pile',n:1e9},{t:'pile',n:-3},{t:'disc',i:'x'},
       {t:'start'},{t:'next',id:-1},{t:5},{x:1},'junk',null,{t:'place'.repeat(9)},{t:'job',type:'build',tgt:{k:'constructor'},lead:o},{t:'ready',v:1}].concat(netLead()===seat?[]:[{t:'item',k:'pipe'},{t:'moveask',v:1},{t:'pile',n:1}]);window.__BAD=L;if(!window.__ONE)L.forEach(e)},seat);
    if(process.env.ONE){const n=await C[0].p.evaluate(()=>__BAD.length);for(let k=0;k<n;k++){const b0=await Hh.p.evaluate(()=>JSON.stringify([G.plan,G.res,G.round,G.phase]));await C[0].p.evaluate(k=>NET.room.emit('act',__BAD[k]),k);await sleep(700);const b1=await Hh.p.evaluate(()=>JSON.stringify([G.plan,G.res,G.round,G.phase]));if(b0!==b1)console.log('CHANGED by',k,JSON.stringify(await C[0].p.evaluate(k=>__BAD[k],k)),b0.slice(0,300),'=>',b1.slice(0,300))}}
    await sleep(1500);const after=await Hh.p.evaluate(()=>JSON.stringify([G.plan,G.res,G.chars.map(c=>[c.w,c.det,c.used]),G.items,G.own,G.round,G.phase,G.q]));
    const lead=await Hh.p.evaluate(()=>netLead());
    bad={seat,lead,unchanged:before===after};console.log('bad actions sent: state unchanged',bad.unchanged,'(client seat',seat,'lead',lead+')');if(!bad.unchanged){console.log(before.slice(0,400),'\n',after.slice(0,400));console.log('res changers:',JSON.stringify(await Hh.p.evaluate(()=>window.__ACTLOG)));console.log('host errors:',JSON.stringify(await Hh.p.evaluate(()=>window.__NETERR||[])));console.log('log lines added meanwhile:',JSON.stringify(await Hh.p.evaluate(n=>G.log.slice(n).map(l=>l.t||l),logN0)).slice(0,1500))}}
  if(SHOTS&&!midShot&&g.plan&&g.r>=2&&C[0]&&live.includes(C[0])){const st=await C[0].p.evaluate(()=>pstep());if(st>=2){midShot=true;await shot(C[0],'client_plan');await shot(Hh,'host_plan')}}
  for(const x of live){const k=await x.p.evaluate(tick).catch(e=>{x.errs.push('tick '+e.message);return ''});if(k){clicks++;counts[k]=(counts[k]||0)+1;if(x!==Hh)remote++}}
  const prog=JSON.stringify(g);if(prog!==lastProg){lastProg=prog;stallT=Date.now()}else if(Date.now()-stallT>45000){console.log('STALL',prog,await Promise.all(live.map(x=>x.p.evaluate(()=>({seat:NET.mySeat,st:G&&planOpen()?pstep():-1,left:G&&netLeft(NET.lens),story:storyActive(),q:G&&G.q&&G.q.who,foot:(document.getElementById('steptext')||{}).textContent,ready:G&&G.net.ready,sctl:(document.querySelector('#story .sctl')||{}).textContent})))));stallT=Date.now()}
  await sleep(40)}
await sleep(4000);
if(SHOTS&&C[0]&&live.includes(C[0]))await shot(C[0],'client_end');
const hs=await Hh.p.evaluate(()=>({over:G.over,r:G.round,res:G.res,life:G.chars.map(c=>c.w),hh:G.chars.map(c=>!!c.hh),away:G.chars.map(c=>!!c.away),names:G.chars.map(c=>c.pn||'-'),remoteActs:NET.stats}));
const cs=await Promise.all(live.filter(x=>x!==Hh).map(x=>x.p.evaluate(()=>({over:G&&G.over,r:G&&G.round,res:G&&G.res,life:G&&G.chars.map(c=>c.w),seat:NET.mySeat,role:NET.role}))));
const same=c=>JSON.stringify([c.over,c.r,c.res,c.life])===JSON.stringify([hs.over,hs.r,hs.res,hs.life]);
const out={host:hs,clients:cs,clicks,remote,counts,agree:cs.every(same),secs:Math.round((Date.now()-t0)/1000),left,rejoined:rejoined?{at:rejoined.at,seat:cs.length?cs[cs.length-1].seat:null,backAsHuman:left?hs.hh[left.seat]&&!hs.away[left.seat]:null}:null,bad,errors:P.flatMap(x=>x.errs.map(e=>x.i+': '+e.slice(0,200)))};
console.log(JSON.stringify(out,null,1));
await b.close();relay.kill();process.exit(0)})();
