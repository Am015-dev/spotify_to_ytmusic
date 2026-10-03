const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const [w,h,scheme,out,seed,tod]=[+process.argv[2],+process.argv[3],process.argv[4]||'dark',process.argv[5]||'shots/x.png',process.argv[6],process.argv[7]];
const c=await b.newContext({viewport:{width:w,height:h},colorScheme:scheme});const p=await c.newPage();
p.on('pageerror',e=>console.log('ERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('CON',m.text())});
if(seed)await p.addInitScript(s=>{const o=JSON.parse(s);for(const k in o)localStorage.setItem(k,o[k])},seed);
await p.goto('file:///home/user/spotify_to_ytmusic/games/room.html'+(tod?'?tod='+tod:''));await p.waitForTimeout(800);
await p.screenshot({path:out});await b.close()})();
