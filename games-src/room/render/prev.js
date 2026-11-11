const {chromium}=require('/tmp/claude-0/-home-user-spotify-to-ytmusic/5a36d2af-8697-5203-aeea-a0f2a3329615/scratchpad/node_modules/playwright');
const serve=require('./server.js');
(async()=>{const s=await serve(8123);const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
const p=await b.newPage({viewport:{width:1700,height:430}});p.on('console',m=>console.log('C',m.text()));p.on('pageerror',e=>console.log('E',e.message));
await p.goto('http://localhost:8123/preview.html?m='+process.argv[2]);await p.waitForFunction('window.__done',null,{timeout:120000});
console.log(JSON.stringify(await p.evaluate('window.__info')));await p.screenshot({path:process.argv[3]});await b.close();s.close()})();
