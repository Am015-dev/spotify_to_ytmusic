// Real WebRTC test for Crown City Smash: host + N clients in separate Chromium contexts, local Nostr relay.
// PW=$(npm root -g)/playwright node net/p2p-kot.js kot/kot2.html [clients] [seconds]
const {chromium}=require(process.env.PW||require('child_process').execSync('npm root -g').toString().trim()+'/playwright');const fs=require('fs');const {spawn}=require('child_process');
const file=process.argv[2],NCL=+(process.argv[3]||2),SECS=+(process.argv[4]||150);const html=fs.readFileSync(file);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const relay=spawn('node',['/home/user/spotify_to_ytmusic/games-src/net/relay.js','17707']);await sleep(500);
const b=await chromium.launch({args:process.env.GL?['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']:['--disable-3d-apis']});const P=[];
for(let i=0;i<=NCL;i++){const c=await b.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  await c.addInitScript(()=>{window.NETROOM_RELAYS=['ws://127.0.0.1:17707'];window.NETROOM_ICE=[];try{localStorage.setItem('ccs_tour2','1');localStorage.setItem('ccs_gfx','low')}catch(e){}});
  await c.route('**/*',r=>{const u=r.request().url();if(u.startsWith('https://gns.test/'))return r.fulfill({body:html,contentType:'text/html; charset=utf-8'});return r.abort()});
  const p=await c.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto('https://gns.test/crown/?gfx=low',{waitUntil:'domcontentloaded',timeout:120000});await sleep(1500);await p.evaluate(()=>{ANIM=0;AIDELAY=60});P.push({p,errs})}
const [H,...C]=P;await sleep(800);
const st=await H.p.evaluate(()=>({p2p:!!NET.p2p,avail:netAvail()}));console.log('host',st);
await H.p.evaluate(()=>{NET.myName='Hosty';netJoin('host',newCode())});await sleep(300);const code=await H.p.evaluate(()=>NET.code);
for(const [i,c] of C.entries())await c.p.evaluate(([code,i])=>{NET.myName='Friend'+i;netJoin('client',code)},[code,i]);
let t0=Date.now();while(Date.now()-t0<30000){const n=await H.p.evaluate(()=>NET.peers.length);if(n>=NCL+1)break;await sleep(250)}
const lobby=await H.p.evaluate(()=>NET.peers.map(p=>(p.presence&&p.presence.name)||'?'));console.log('lobby after',Date.now()-t0,'ms',lobby);
await H.p.evaluate(()=>netStart());let clicks=0,remote=0;t0=Date.now();
const tick=()=>{const rnd=a=>a[Math.floor(Math.random()*a.length)];const ch=document.getElementById('choice');const m=ch&&!ch.classList.contains('hidden')?ch:document.getElementById('modal');
  if(m&&!m.classList.contains('hidden')){const bs=[...m.querySelectorAll('button[data-opt]:not([disabled])')].filter(b=>b.dataset.opt!=='x');if(bs.length){rnd(bs).click();return 1}}
  if(!G||!humanTurn())return 0;const cards=[...document.querySelectorAll('[data-card]:not([disabled])')];if(cards.length&&Math.random()<.4){rnd(cards).click();return 1}
  const dice=[...document.querySelectorAll('.die[data-die]:not([disabled])')];if(dice.length&&Math.random()<.3){rnd(dice).click();return 1}
  const acts=[...document.querySelectorAll('#prompt [data-act]:not([disabled])')].filter(b=>b.dataset.act!=='hint');if(acts.length){rnd(acts).click();return 1}return 0};
const KILL=+(process.env.KILL||0);let killed=false,live=P;
while(Date.now()-t0<SECS*1000){if(KILL&&!killed&&Date.now()-t0>KILL*1000){killed=true;await H.p.context().close();live=C;console.log('host tab closed at turn',await C[0].p.evaluate(()=>G.turn))}
  let HH=live[0];for(const x of live){if(await x.p.evaluate(()=>isHost()))HH=x}
  const g=await HH.p.evaluate(()=>G&&{w:G.winner,t:G.turn});if(!g||g.w)break;
  for(const [i,x] of live.entries()){const k=await x.p.evaluate(tick).catch(e=>{x.errs.push('tick '+e.message);return 0});clicks+=k;if(i)remote+=k}await sleep(40)}
await sleep(2500);
let HX=H;if(killed){HX=C[0];for(const x of C){if(await x.p.evaluate(()=>isHost()))HX=x}}
const hs=await HX.p.evaluate(()=>({w:G.winner,t:G.turn,humans:G.pl.filter(p=>p.human).length,names:G.pl.map(p=>pname(p)||'-')}));
const cs=await Promise.all(C.filter(c=>c!==HX).map(c=>c.p.evaluate(()=>({w:G&&G.winner,t:G&&G.turn,seat:NET.mySeat,role:NET.role}))));
console.log(JSON.stringify({host:hs,clients:cs,clicks,remote,newHost:killed?C.indexOf(HX):null,agree:cs.every(c=>c.w===hs.w&&c.t===hs.t),secs:Math.round((Date.now()-t0)/1000),errors:P.flatMap((x,i)=>x.errs.map(e=>i+': '+e.slice(0,200)))},null,1));
await b.close();relay.kill();process.exit(0)})();
