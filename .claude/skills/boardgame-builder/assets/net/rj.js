const {chromium}=require(process.env.PW);const fs=require('fs');const {spawn}=require('child_process');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const relay=spawn('node',[__dirname+'/relay.js','17720']);await sleep(400);const b=await chromium.launch();
async function ctx(){const c=await b.newContext();await c.addInitScript(()=>{window.NETROOM_RELAYS=['ws://127.0.0.1:17720'];window.NETROOM_ICE=[]});
 await c.route('**/*',r=>{const u=new URL(r.request().url());if(u.host!=='gns.test')return r.abort();const f=u.pathname==='/'?'rj.html':u.pathname.slice(1);r.fulfill({body:fs.readFileSync(__dirname+'/'+f),contentType:f.endsWith('.js')?'text/javascript':'text/html'})});return c}
async function pg(c,n){const p=await c.newPage();await p.goto('https://gns.test/');await p.evaluate(n=>go(n),n);return p}
const H=await pg(await ctx(),'H');if(process.env.TRAFFIC)await H.evaluate(e=>{window.TO_EACH=e;R.onPeers(ch=>{window.__peers=ch.peers.filter(p=>!p.isMe).map(p=>p.peer)});const big='x'.repeat(3200);setInterval(()=>{for(let i=0;i<3;i++){if(window.TO_EACH){(window.__peers||[]).forEach(p=>R.sendTo(p,'st',{d:big,i}))}else R.emit('st',{d:big,i})}},300)},!!process.env.EACH);const A=await pg(await ctx(),'A');const cb=await ctx();let B=await pg(cb,'B');await sleep(3000);
console.log('start H sees',await H.evaluate(()=>PEERS));
for(let i=0;i<6;i++){await B.close();let t=Date.now();if(!process.env.FAST)while((await H.evaluate(()=>PEERS)).includes('B'))await sleep(200);const gone=Date.now()-t;
 await sleep(+(process.env.GAP||3000));B=await pg(cb,'B');if(process.env.DOUBLE)await B.evaluate(async()=>{await new Promise(r=>setTimeout(r,+(window.DD||300)));await R.leave();await go('B')});t=Date.now();let ok=false;while(Date.now()-t<30000){if((await H.evaluate(()=>window.R.peerCount()))>=2&&(await B.evaluate(()=>(PEERS||[]).includes('H')))){ok=true;break}await sleep(250)}
 console.log(i,'leave seen after',gone,'ms; rejoin',ok,Date.now()-t,'ms; B sees',await B.evaluate(()=>PEERS))}
await b.close();relay.kill();process.exit(0)})();
